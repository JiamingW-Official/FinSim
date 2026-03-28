"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Home,
  Building2,
  BarChart3,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Info,
  CheckCircle,
  XCircle,
  DollarSign,
  Percent,
  Calendar,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PropertyInputs {
  price: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  monthlyRent: number;
  vacancyRate: number;
  propertyTaxRate: number;
  insurance: number;
  maintenance: number;
  hoa: number;
  appreciationRate: number;
}

interface PropertyMetrics {
  monthlyMortgage: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  monthlyHOA: number;
  totalMonthlyExpenses: number;
  effectiveMonthlyRent: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  noi: number;
  capRate: number;
  cashOnCashReturn: number;
  grm: number;
  dscr: number;
  breakEvenOccupancy: number;
  loanAmount: number;
  annualDebtService: number;
  ruleOf1Pct: boolean;
}

interface SavedProperty {
  id: string;
  name: string;
  inputs: PropertyInputs;
  metrics: PropertyMetrics;
}

interface Market {
  city: string;
  state: string;
  medianPrice: number;
  priceRentRatio: number;
  yoyAppreciation: number;
  jobGrowth: number;
  populationGrowth: number;
  capRate: number;
  inventory: number;
  investorScore: number;
  cashFlowScore: number;
  appreciationScore: number;
}

// ── Seeded PRNG (mulberry32) ───────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = s + 0x6d2b79f5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── Formatting ─────────────────────────────────────────────────────────────────

function fmtCurrency(n: number, compact = false): string {
  if (compact) {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  }
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtPct(n: number, d = 2): string {
  return `${n.toFixed(d)}%`;
}

function fmtNum(n: number, d = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

// ── Mortgage calculator ────────────────────────────────────────────────────────

function monthlyMortgagePayment(principal: number, annualRate: number, termYears: number): number {
  if (annualRate === 0) return principal / (termYears * 12);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ── Compute metrics ────────────────────────────────────────────────────────────

function computeMetrics(inp: PropertyInputs): PropertyMetrics {
  const loanAmount = inp.price - inp.downPayment;
  const monthlyMortgage = monthlyMortgagePayment(loanAmount, inp.interestRate, inp.loanTerm);
  const monthlyPropertyTax = (inp.price * inp.propertyTaxRate / 100) / 12;
  const monthlyInsurance = inp.insurance / 12;
  const monthlyMaintenance = (inp.price * inp.maintenance / 100) / 12;
  const monthlyHOA = inp.hoa;

  const effectiveMonthlyRent = inp.monthlyRent * (1 - inp.vacancyRate / 100);

  const annualNOI = (effectiveMonthlyRent * 12)
    - (monthlyPropertyTax * 12)
    - inp.insurance
    - (inp.price * inp.maintenance / 100)
    - (inp.hoa * 12);
  const noi = annualNOI;

  const totalMonthlyExpenses = monthlyMortgage + monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + monthlyHOA;
  const monthlyCashFlow = effectiveMonthlyRent - totalMonthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;

  const capRate = inp.price > 0 ? (noi / inp.price) * 100 : 0;
  const cashOnCashReturn = inp.downPayment > 0 ? (annualCashFlow / inp.downPayment) * 100 : 0;
  const grm = effectiveMonthlyRent > 0 ? inp.price / (effectiveMonthlyRent * 12) : 0;

  const annualDebtService = monthlyMortgage * 12;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;

  // Break-even: what occupancy rate makes cash flow = 0
  // effectiveRent * occ - expenses = 0 => occ = expenses / grossRent
  const grossMonthlyExpenses = totalMonthlyExpenses;
  const breakEvenOccupancy = inp.monthlyRent > 0 ? (grossMonthlyExpenses / inp.monthlyRent) * 100 : 0;

  const ruleOf1Pct = inp.monthlyRent >= inp.price * 0.01;

  return {
    monthlyMortgage,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyMaintenance,
    monthlyHOA,
    totalMonthlyExpenses,
    effectiveMonthlyRent,
    monthlyCashFlow,
    annualCashFlow,
    noi,
    capRate,
    cashOnCashReturn,
    grm,
    dscr,
    breakEvenOccupancy,
    loanAmount,
    annualDebtService,
    ruleOf1Pct,
  };
}

// ── 10-year projection ────────────────────────────────────────────────────────

function compute10YearProjection(inp: PropertyInputs, metrics: PropertyMetrics) {
  const rows = [];
  let propertyValue = inp.price;
  let loanBalance = metrics.loanAmount;
  const r = inp.interestRate / 100 / 12;
  const n = inp.loanTerm * 12;

  for (let yr = 1; yr <= 10; yr++) {
    propertyValue = inp.price * Math.pow(1 + inp.appreciationRate / 100, yr);
    // Loan balance after yr*12 payments
    const paid = yr * 12;
    if (r > 0) {
      loanBalance = metrics.loanAmount * (Math.pow(1 + r, n) - Math.pow(1 + r, paid))
        / (Math.pow(1 + r, n) - 1);
    } else {
      loanBalance = metrics.loanAmount - (metrics.loanAmount / (inp.loanTerm * 12)) * paid;
    }
    const equity = propertyValue - loanBalance;
    const annualRent = metrics.effectiveMonthlyRent * 12 * Math.pow(1 + 0.03, yr - 1);
    const annualCF = (annualRent - metrics.totalMonthlyExpenses * 12);
    rows.push({ yr, propertyValue, equity, annualCashFlow: annualCF, totalReturn: equity - inp.downPayment + (annualCF * yr) });
  }
  return rows;
}

// ── Generate synthetic markets ────────────────────────────────────────────────

function generateMarkets(): Market[] {
  const rng = mulberry32(4444);
  const cities = [
    { city: "Austin",    state: "TX" },
    { city: "Miami",     state: "FL" },
    { city: "Phoenix",   state: "AZ" },
    { city: "Dallas",    state: "TX" },
    { city: "Nashville", state: "TN" },
    { city: "Charlotte", state: "NC" },
    { city: "Denver",    state: "CO" },
    { city: "Tampa",     state: "FL" },
    { city: "Raleigh",   state: "NC" },
    { city: "Atlanta",   state: "GA" },
  ];

  return cities.map(({ city, state }) => {
    const medianPrice = 280000 + rng() * 520000;
    const capRate = 4 + rng() * 4;
    // Inverse relationship: high price/rent = low cap rate
    const priceRentRatio = 15 + (10 - capRate) * 4 + rng() * 5;
    const yoyAppreciation = 2 + rng() * 8;
    const jobGrowth = 1 + rng() * 4;
    const populationGrowth = 0.5 + rng() * 3;
    const inventory = 1 + rng() * 5;

    // Investor friendly: low price/rent + high job growth + high population growth + low inventory
    const investorScore = Math.round(
      ((20 - Math.min(priceRentRatio, 20)) / 20) * 30
      + (jobGrowth / 5) * 25
      + (populationGrowth / 3.5) * 25
      + ((6 - Math.min(inventory, 6)) / 6) * 20
    );

    const cashFlowScore = Math.round(
      ((20 - Math.min(priceRentRatio, 20)) / 20) * 50
      + (capRate / 8) * 50
    );

    const appreciationScore = Math.round(
      (yoyAppreciation / 10) * 60
      + (populationGrowth / 3.5) * 40
    );

    return {
      city, state,
      medianPrice, priceRentRatio, yoyAppreciation, jobGrowth,
      populationGrowth, capRate, inventory, investorScore, cashFlowScore, appreciationScore,
    };
  });
}

// ── Number Input ───────────────────────────────────────────────────────────────

function NumInput({
  label, value, onChange, prefix = "", suffix = "", min = 0, max, step = 1, hint,
}: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; suffix?: string; min?: number; max?: number; step?: number; hint?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {hint && <span className="text-xs text-muted-foreground/60">{hint}</span>}
      </div>
      <div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1.5 focus-within:border-primary/50">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent text-sm text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none min-w-0"
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

// ── Metric Card ────────────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, color, icon: Icon, size = "default",
}: {
  label: string; value: string; sub?: string; color?: string; icon?: React.ElementType; size?: "sm" | "default" | "lg";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className={cn(
        "font-bold tabular-nums",
        size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-xl",
        color,
      )}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ── DEFAULT INPUTS ────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: PropertyInputs = {
  price: 500000,
  downPayment: 100000,
  interestRate: 7,
  loanTerm: 30,
  monthlyRent: 3000,
  vacancyRate: 5,
  propertyTaxRate: 1.2,
  insurance: 2400,
  maintenance: 1,
  hoa: 0,
  appreciationRate: 3,
};

// ── Tab 1: Property Analyzer ──────────────────────────────────────────────────

function PropertyAnalyzer({
  inputs,
  setInputs,
  onSave,
}: {
  inputs: PropertyInputs;
  setInputs: (i: PropertyInputs) => void;
  onSave: () => void;
}) {
  const metrics = useMemo(() => computeMetrics(inputs), [inputs]);

  const set = useCallback(
    (key: keyof PropertyInputs) => (v: number) => setInputs({ ...inputs, [key]: v }),
    [inputs, setInputs],
  );

  const cashFlowColor = metrics.monthlyCashFlow >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className="flex gap-4 h-full">
      {/* Left: Inputs */}
      <div className="w-[300px] shrink-0 overflow-y-auto space-y-3 pr-1">
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Home className="size-4 text-primary" />
            Property Details
          </h3>
          <NumInput label="Property Price" value={inputs.price} onChange={set("price")} prefix="$" step={5000} />
          <NumInput label="Down Payment" value={inputs.downPayment} onChange={set("downPayment")} prefix="$" step={5000} />
          <NumInput label="Interest Rate" value={inputs.interestRate} onChange={set("interestRate")} suffix="%" step={0.125} min={0} max={20} />
          <NumInput label="Loan Term" value={inputs.loanTerm} onChange={set("loanTerm")} suffix="yr" step={5} min={5} max={30} />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="size-4 text-primary" />
            Income
          </h3>
          <NumInput label="Monthly Rent" value={inputs.monthlyRent} onChange={set("monthlyRent")} prefix="$" step={50} />
          <NumInput label="Vacancy Rate" value={inputs.vacancyRate} onChange={set("vacancyRate")} suffix="%" step={0.5} min={0} max={30} />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            Expenses
          </h3>
          <NumInput label="Property Tax Rate" value={inputs.propertyTaxRate} onChange={set("propertyTaxRate")} suffix="%" step={0.1} min={0} max={5} />
          <NumInput label="Insurance" value={inputs.insurance} onChange={set("insurance")} prefix="$" suffix="/yr" step={100} />
          <NumInput label="Maintenance" value={inputs.maintenance} onChange={set("maintenance")} suffix="% of value/yr" step={0.1} min={0} max={5} />
          <NumInput label="HOA" value={inputs.hoa} onChange={set("hoa")} prefix="$" suffix="/mo" step={50} />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Growth
          </h3>
          <NumInput label="Appreciation Rate" value={inputs.appreciationRate} onChange={set("appreciationRate")} suffix="% /yr" step={0.5} min={0} max={15} />
        </div>

        <button
          onClick={onSave}
          className="w-full rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium py-2 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="size-4" />
          Save to Comparison
        </button>
      </div>

      {/* Right: Metrics */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Rule of 1% badge */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium",
            metrics.ruleOf1Pct
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/40 bg-red-500/10 text-red-400",
          )}>
            {metrics.ruleOf1Pct
              ? <CheckCircle className="size-4" />
              : <XCircle className="size-4" />}
            Rule of 1%: {fmtPct((inputs.monthlyRent / inputs.price) * 100, 2)} of purchase price
          </div>
          <span className="text-xs text-muted-foreground">
            (Need {fmtCurrency(inputs.price * 0.01)}/mo for 1%)
          </span>
        </div>

        {/* Main cash flow */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4 col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium mb-1">Monthly Cash Flow</div>
                <div className={cn("text-4xl font-bold tabular-nums", cashFlowColor)}>
                  {metrics.monthlyCashFlow >= 0 ? "+" : ""}{fmtCurrency(metrics.monthlyCashFlow)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-medium mb-1">Annual Cash Flow</div>
                <div className={cn("text-2xl font-bold tabular-nums", cashFlowColor)}>
                  {metrics.annualCashFlow >= 0 ? "+" : ""}{fmtCurrency(metrics.annualCashFlow)}
                </div>
              </div>
            </div>
          </div>

          <MetricCard
            label="Cash-on-Cash Return"
            value={fmtPct(metrics.cashOnCashReturn)}
            sub="Annual cash flow / total cash invested"
            color={metrics.cashOnCashReturn >= 8 ? "text-emerald-400" : metrics.cashOnCashReturn >= 4 ? "text-amber-400" : "text-red-400"}
            icon={Percent}
          />
          <MetricCard
            label="Cap Rate"
            value={fmtPct(metrics.capRate)}
            sub="NOI / property value"
            color={metrics.capRate >= 6 ? "text-emerald-400" : metrics.capRate >= 4 ? "text-amber-400" : "text-red-400"}
            icon={BarChart3}
          />
          <MetricCard
            label="GRM"
            value={fmtNum(metrics.grm, 1) + "x"}
            sub="Price / annual gross rent"
            icon={Calendar}
          />
          <MetricCard
            label="NOI"
            value={fmtCurrency(metrics.noi)}
            sub="Net Operating Income / year"
            icon={DollarSign}
          />
          <MetricCard
            label="DSCR"
            value={fmtNum(metrics.dscr, 2) + "x"}
            sub="NOI / annual debt service"
            color={metrics.dscr >= 1.25 ? "text-emerald-400" : metrics.dscr >= 1 ? "text-amber-400" : "text-red-400"}
            icon={Shield}
          />
          <MetricCard
            label="Break-Even Occupancy"
            value={fmtPct(Math.min(metrics.breakEvenOccupancy, 100))}
            sub="Occupancy needed to cover all costs"
            color={metrics.breakEvenOccupancy <= 80 ? "text-emerald-400" : metrics.breakEvenOccupancy <= 95 ? "text-amber-400" : "text-red-400"}
            icon={Percent}
          />
        </div>

        {/* Monthly expense breakdown */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Monthly Breakdown</h3>
          {[
            { label: "Effective Rent (after vacancy)", value: metrics.effectiveMonthlyRent, positive: true },
            { label: "Mortgage (P&I)", value: -metrics.monthlyMortgage },
            { label: "Property Tax", value: -metrics.monthlyPropertyTax },
            { label: "Insurance", value: -metrics.monthlyInsurance },
            { label: "Maintenance", value: -metrics.monthlyMaintenance },
            { label: "HOA", value: -metrics.monthlyHOA },
          ].map(({ label, value, positive }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className={cn(
                "font-medium tabular-nums",
                positive ? "text-emerald-400" : "text-foreground",
              )}>
                {positive ? "+" : ""}{fmtCurrency(value)}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex items-center justify-between font-semibold">
            <span>Net Cash Flow</span>
            <span className={cashFlowColor}>{metrics.monthlyCashFlow >= 0 ? "+" : ""}{fmtCurrency(metrics.monthlyCashFlow)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Radar Chart (SVG Hexagon) ──────────────────────────────────────────────────

const RADAR_AXES = ["Cash Flow", "Cap Rate", "CoC Return", "Appreciation", "DSCR", "Equity Build"];
const RADAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

function computeRadarValues(prop: SavedProperty): number[] {
  const m = prop.metrics;
  const inp = prop.inputs;
  // Each axis normalized 0–1
  return [
    Math.max(0, Math.min(1, (m.monthlyCashFlow + 500) / 1500)),          // Cash Flow (-500 to +1000 mapped 0–1)
    Math.max(0, Math.min(1, m.capRate / 10)),                             // Cap Rate (0–10%)
    Math.max(0, Math.min(1, (m.cashOnCashReturn + 5) / 20)),              // CoC Return (-5 to +15)
    Math.max(0, Math.min(1, inp.appreciationRate / 8)),                   // Appreciation (0–8%)
    Math.max(0, Math.min(1, (m.dscr - 0.5) / 2)),                        // DSCR (0.5–2.5)
    Math.max(0, Math.min(1, (inp.price - inp.downPayment) / inp.price)),  // Equity Build (LTV)
  ];
}

function RadarChart({ properties }: { properties: SavedProperty[] }) {
  const cx = 160, cy = 150, r = 110;
  const n = RADAR_AXES.length;
  const angles = RADAR_AXES.map((_, i) => (i * 2 * Math.PI) / n - Math.PI / 2);

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  function polarToXY(angle: number, radius: number): [number, number] {
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  }

  function polygonPoints(values: number[]): string {
    return values.map((v, i) => {
      const [x, y] = polarToXY(angles[i], v * r);
      return `${x},${y}`;
    }).join(" ");
  }

  return (
    <svg width="320" height="300" className="overflow-visible">
      {/* Grid */}
      {gridLevels.map((lvl) => (
        <polygon
          key={lvl}
          points={angles.map((a) => polarToXY(a, lvl * r).join(",")).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}
      {/* Axis lines */}
      {angles.map((a, i) => {
        const [x, y] = polarToXY(a, r);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
      })}
      {/* Axis labels */}
      {angles.map((a, i) => {
        const [x, y] = polarToXY(a, r + 20);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-[9px]"
            fontSize="9"
            fill="rgb(148,163,184)"
          >
            {RADAR_AXES[i]}
          </text>
        );
      })}
      {/* Data polygons */}
      {properties.map((prop, pi) => {
        const values = computeRadarValues(prop);
        const color = RADAR_COLORS[pi % RADAR_COLORS.length];
        return (
          <polygon
            key={prop.id}
            points={polygonPoints(values)}
            fill={color}
            fillOpacity={0.15}
            stroke={color}
            strokeWidth={1.5}
          />
        );
      })}
      {/* Legend */}
      {properties.map((prop, pi) => {
        const color = RADAR_COLORS[pi % RADAR_COLORS.length];
        return (
          <g key={prop.id}>
            <rect x={10} y={270 + pi * 14 - properties.length * 7} width={10} height={10} fill={color} fillOpacity={0.6} rx={2} />
            <text x={24} y={279 + pi * 14 - properties.length * 7} fontSize="9" fill="rgb(148,163,184)">{prop.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Tab 2: Deal Comparison ────────────────────────────────────────────────────

function DealComparison({
  properties,
  onRemove,
}: {
  properties: SavedProperty[];
  onRemove: (id: string) => void;
}) {
  const [strategy, setStrategy] = useState<"cashflow" | "appreciation" | "balanced">("balanced");

  const bestDeal = useMemo(() => {
    if (properties.length === 0) return null;
    const scored = properties.map((p) => {
      let score = 0;
      if (strategy === "cashflow") {
        score = p.metrics.cashOnCashReturn * 0.5 + p.metrics.capRate * 0.3 + p.metrics.dscr * 0.2;
      } else if (strategy === "appreciation") {
        score = p.inputs.appreciationRate * 0.6 + p.metrics.capRate * 0.2 + p.inputs.downPayment / p.inputs.price * 0.2;
      } else {
        score = p.metrics.cashOnCashReturn * 0.3 + p.metrics.capRate * 0.25 + p.inputs.appreciationRate * 0.25 + p.metrics.dscr * 0.2;
      }
      return { ...p, score };
    });
    return scored.reduce((a, b) => a.score > b.score ? a : b).id;
  }, [properties, strategy]);

  const projections = useMemo(() =>
    properties.map((p) => compute10YearProjection(p.inputs, p.metrics)),
    [properties],
  );

  const COMPARE_ROWS: { label: string; fmt: (p: SavedProperty) => string; color?: (p: SavedProperty) => string }[] = [
    { label: "Property Price", fmt: (p) => fmtCurrency(p.inputs.price) },
    { label: "Down Payment", fmt: (p) => fmtCurrency(p.inputs.downPayment) },
    { label: "Loan Amount", fmt: (p) => fmtCurrency(p.metrics.loanAmount) },
    { label: "Monthly Mortgage", fmt: (p) => fmtCurrency(p.metrics.monthlyMortgage) },
    { label: "Monthly Rent", fmt: (p) => fmtCurrency(p.inputs.monthlyRent) },
    { label: "Vacancy Rate", fmt: (p) => fmtPct(p.inputs.vacancyRate) },
    {
      label: "Monthly Cash Flow",
      fmt: (p) => (p.metrics.monthlyCashFlow >= 0 ? "+" : "") + fmtCurrency(p.metrics.monthlyCashFlow),
      color: (p) => p.metrics.monthlyCashFlow >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Annual Cash Flow",
      fmt: (p) => (p.metrics.annualCashFlow >= 0 ? "+" : "") + fmtCurrency(p.metrics.annualCashFlow),
      color: (p) => p.metrics.annualCashFlow >= 0 ? "text-emerald-400" : "text-red-400",
    },
    { label: "NOI", fmt: (p) => fmtCurrency(p.metrics.noi) },
    {
      label: "Cap Rate",
      fmt: (p) => fmtPct(p.metrics.capRate),
      color: (p) => p.metrics.capRate >= 6 ? "text-emerald-400" : p.metrics.capRate >= 4 ? "text-amber-400" : "text-red-400",
    },
    {
      label: "Cash-on-Cash Return",
      fmt: (p) => fmtPct(p.metrics.cashOnCashReturn),
      color: (p) => p.metrics.cashOnCashReturn >= 8 ? "text-emerald-400" : p.metrics.cashOnCashReturn >= 4 ? "text-amber-400" : "text-red-400",
    },
    { label: "GRM", fmt: (p) => fmtNum(p.metrics.grm, 1) + "x" },
    {
      label: "DSCR",
      fmt: (p) => fmtNum(p.metrics.dscr, 2) + "x",
      color: (p) => p.metrics.dscr >= 1.25 ? "text-emerald-400" : p.metrics.dscr >= 1 ? "text-amber-400" : "text-red-400",
    },
    { label: "Break-Even Occupancy", fmt: (p) => fmtPct(Math.min(p.metrics.breakEvenOccupancy, 100)) },
    { label: "Appreciation Rate", fmt: (p) => fmtPct(p.inputs.appreciationRate) },
    { label: "Interest Rate", fmt: (p) => fmtPct(p.inputs.interestRate) },
    { label: "Rule of 1%", fmt: (p) => p.metrics.ruleOf1Pct ? "Yes" : "No", color: (p) => p.metrics.ruleOf1Pct ? "text-emerald-400" : "text-red-400" },
  ];

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Building2 className="size-12 opacity-20" />
        <p className="text-sm">No properties saved yet. Go to Property Analyzer and click "Save to Comparison".</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strategy selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">Investment Strategy:</span>
        {(["cashflow", "appreciation", "balanced"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStrategy(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
              strategy === s
                ? "border-primary bg-primary/20 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {s === "cashflow" ? "Cash Flow" : s === "appreciation" ? "Appreciation" : "Balanced"}
          </button>
        ))}
      </div>

      {/* Best deal highlight */}
      {bestDeal && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center gap-2">
          <CheckCircle className="size-4 text-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-400 font-medium">
            Best deal for {strategy === "cashflow" ? "Cash Flow" : strategy === "appreciation" ? "Appreciation" : "Balanced"} strategy:{" "}
            {properties.find((p) => p.id === bestDeal)?.name}
          </span>
        </div>
      )}

      <div className="flex gap-6">
        {/* Comparison table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs">Metric</th>
                {properties.map((p, pi) => (
                  <th key={p.id} className="text-right py-2 px-3 min-w-[120px]">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className="text-xs font-semibold truncate max-w-[80px]"
                        style={{ color: RADAR_COLORS[pi % RADAR_COLORS.length] }}
                      >
                        {p.name}
                      </span>
                      {p.id === bestDeal && (
                        <Badge className="text-[9px] py-0 px-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          Best
                        </Badge>
                      )}
                      <button onClick={() => onRemove(p.id)} className="text-muted-foreground hover:text-red-400">
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="py-1.5 pr-4 text-xs text-muted-foreground">{row.label}</td>
                  {properties.map((p) => (
                    <td key={p.id} className={cn("text-right py-1.5 px-3 text-xs font-medium tabular-nums", row.color?.(p))}>
                      {row.fmt(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Radar chart */}
        <div className="shrink-0">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 text-center">Radar Comparison</h4>
          <RadarChart properties={properties} />
        </div>
      </div>

      {/* 10-year projection table */}
      <div>
        <h3 className="text-sm font-semibold mb-3">10-Year Projected Returns</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 text-muted-foreground">Year</th>
                {properties.flatMap((p, pi) => [
                  <th key={`${p.id}-v`} className="text-right py-2 px-2 text-muted-foreground">
                    <span style={{ color: RADAR_COLORS[pi] }}>{p.name}</span> Value
                  </th>,
                  <th key={`${p.id}-e`} className="text-right py-2 px-2 text-muted-foreground">
                    <span style={{ color: RADAR_COLORS[pi] }}>{p.name}</span> Equity
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 5, 7, 10].map((yr) => (
                <tr key={yr} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-1.5 pr-3 font-medium">Year {yr}</td>
                  {projections.flatMap((proj, pi) => {
                    const row = proj.find((r) => r.yr === yr);
                    return [
                      <td key={`${pi}-v`} className="text-right py-1.5 px-2 tabular-nums">
                        {row ? fmtCurrency(row.propertyValue, true) : "—"}
                      </td>,
                      <td key={`${pi}-e`} className="text-right py-1.5 px-2 tabular-nums text-emerald-400">
                        {row ? fmtCurrency(row.equity, true) : "—"}
                      </td>,
                    ];
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Scatter Plot ───────────────────────────────────────────────────────────────

function ScatterPlot({ markets }: { markets: Market[] }) {
  const W = 420, H = 280;
  const PAD = { l: 50, r: 20, t: 20, b: 40 };

  const prList = markets.map((m) => m.priceRentRatio);
  const crList = markets.map((m) => m.capRate);
  const prMin = Math.min(...prList) - 1, prMax = Math.max(...prList) + 1;
  const crMin = Math.min(...crList) - 0.5, crMax = Math.max(...crList) + 0.5;

  function toX(pr: number) { return PAD.l + ((pr - prMin) / (prMax - prMin)) * (W - PAD.l - PAD.r); }
  function toY(cr: number) { return H - PAD.b - ((cr - crMin) / (crMax - crMin)) * (H - PAD.t - PAD.b); }

  const xTicks = [15, 18, 21, 24, 27, 30];
  const yTicks = [4, 5, 6, 7, 8];

  return (
    <svg width={W} height={H}>
      {/* Grid */}
      {yTicks.map((v) => (
        <line key={v} x1={PAD.l} y1={toY(v)} x2={W - PAD.r} y2={toY(v)}
          stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
      ))}
      {/* Y axis */}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      {/* X axis */}
      <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      {/* Y ticks */}
      {yTicks.map((v) => (
        <text key={v} x={PAD.l - 6} y={toY(v)} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="rgb(148,163,184)">
          {v}%
        </text>
      ))}
      {/* X ticks */}
      {xTicks.map((v) => (
        <text key={v} x={toX(v)} y={H - PAD.b + 14} textAnchor="middle" fontSize={9} fill="rgb(148,163,184)">
          {v}x
        </text>
      ))}
      {/* Axis labels */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="rgb(148,163,184)">Price/Rent Ratio</text>
      <text transform={`translate(12,${H / 2}) rotate(-90)`} textAnchor="middle" fontSize={10} fill="rgb(148,163,184)">Cap Rate</text>
      {/* Points */}
      {markets.map((m, i) => (
        <g key={m.city}>
          <circle cx={toX(m.priceRentRatio)} cy={toY(m.capRate)} r={6}
            fill="#3b82f6" fillOpacity={0.7} stroke="#60a5fa" strokeWidth={1} />
          <text x={toX(m.priceRentRatio)} y={toY(m.capRate) - 9}
            textAnchor="middle" fontSize={8} fill="rgb(148,163,184)">
            {m.city}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Tab 3: Market Analysis ────────────────────────────────────────────────────

function MarketAnalysis({ markets }: { markets: Market[] }) {
  const cashFlowTop = [...markets].sort((a, b) => b.cashFlowScore - a.cashFlowScore).slice(0, 5);
  const appreciationTop = [...markets].sort((a, b) => b.appreciationScore - a.appreciationScore).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Market cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {markets.map((m) => (
          <div key={m.city} className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{m.city}</div>
                <div className="text-xs text-muted-foreground">{m.state}</div>
              </div>
              <div className={cn(
                "text-xs font-bold rounded-full px-2 py-0.5",
                m.investorScore >= 65 ? "bg-emerald-500/20 text-emerald-400"
                  : m.investorScore >= 45 ? "bg-amber-500/20 text-amber-400"
                  : "bg-red-500/20 text-red-400",
              )}>
                {m.investorScore}
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Median Price</span>
                <span className="font-medium tabular-nums">{fmtCurrency(m.medianPrice, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">P/R Ratio</span>
                <span className="font-medium tabular-nums">{fmtNum(m.priceRentRatio, 1)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">YoY Apprec.</span>
                <span className="font-medium tabular-nums text-emerald-400">{fmtPct(m.yoyAppreciation)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cap Rate</span>
                <span className={cn("font-medium tabular-nums", m.capRate >= 6 ? "text-emerald-400" : "text-amber-400")}>
                  {fmtPct(m.capRate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Job Growth</span>
                <span className="font-medium tabular-nums">{fmtPct(m.jobGrowth)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inventory</span>
                <span className="font-medium tabular-nums">{fmtNum(m.inventory, 1)} mo</span>
              </div>
            </div>
            {/* Score bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>Investor Score</span>
                <span>{m.investorScore}/100</span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full", m.investorScore >= 65 ? "bg-emerald-500" : m.investorScore >= 45 ? "bg-amber-500" : "bg-red-500")}
                  style={{ width: `${m.investorScore}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scatter plot + Rankings */}
      <div className="flex gap-6 flex-wrap">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Price/Rent Ratio vs Cap Rate</h3>
          <p className="text-xs text-muted-foreground mb-3">Higher P/R ratio generally means lower cap rate — inverse relationship</p>
          <ScatterPlot markets={markets} />
        </div>

        <div className="flex-1 min-w-[200px] space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3">Best for Cash Flow</h3>
            {cashFlowTop.map((m, i) => (
              <div key={m.city} className="flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="text-xs font-medium">{m.city}, {m.state}</div>
                  <div className="text-[10px] text-muted-foreground">Cap Rate {fmtPct(m.capRate)} · P/R {fmtNum(m.priceRentRatio, 1)}x</div>
                </div>
                <div className="text-xs font-bold text-emerald-400">{m.cashFlowScore}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-blue-400 mb-3">Best for Appreciation</h3>
            {appreciationTop.map((m, i) => (
              <div key={m.city} className="flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="text-xs font-medium">{m.city}, {m.state}</div>
                  <div className="text-[10px] text-muted-foreground">YoY {fmtPct(m.yoyAppreciation)} · Pop {fmtPct(m.populationGrowth)}</div>
                </div>
                <div className="text-xs font-bold text-blue-400">{m.appreciationScore}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── BRRRR Flowchart ────────────────────────────────────────────────────────────

function BRRRRChart() {
  const steps = [
    { label: "Buy", desc: "Below market value", color: "#3b82f6", x: 30 },
    { label: "Rehab", desc: "Force appreciation", color: "#f59e0b", x: 160 },
    { label: "Rent", desc: "Generate cash flow", color: "#10b981", x: 290 },
    { label: "Refinance", desc: "Pull equity out", color: "#8b5cf6", x: 420 },
    { label: "Repeat", desc: "Do it again", color: "#ec4899", x: 550 },
  ];

  return (
    <svg width="640" height="100" className="overflow-visible">
      {steps.map((step, i) => (
        <g key={step.label}>
          {/* Arrow */}
          {i < steps.length - 1 && (
            <g>
              <line
                x1={step.x + 60} y1={40}
                x2={steps[i + 1].x + 10} y2={40}
                stroke="rgba(255,255,255,0.2)" strokeWidth={1.5}
                strokeDasharray="4,3"
              />
              <polygon
                points={`${steps[i + 1].x + 10},36 ${steps[i + 1].x + 10},44 ${steps[i + 1].x + 16},40`}
                fill="rgba(255,255,255,0.3)"
              />
            </g>
          )}
          {/* Box */}
          <rect x={step.x} y={18} width={68} height={44} rx={8}
            fill={step.color} fillOpacity={0.15} stroke={step.color} strokeWidth={1.5} />
          <text x={step.x + 34} y={37} textAnchor="middle" fontSize={12} fontWeight="bold" fill={step.color}>
            {step.label}
          </text>
          <text x={step.x + 34} y={52} textAnchor="middle" fontSize={8} fill="rgb(148,163,184)">
            {step.desc}
          </text>
        </g>
      ))}
      {/* Repeat arrow back */}
      <path
        d={`M ${steps[4].x + 34} 62 Q ${steps[2].x + 34} 100 ${steps[0].x + 34} 62`}
        fill="none" stroke="rgba(236,72,153,0.4)" strokeWidth={1.5} strokeDasharray="6,4"
      />
      <polygon
        points={`${steps[0].x + 28},62 ${steps[0].x + 34},54 ${steps[0].x + 40},62`}
        fill="rgba(236,72,153,0.4)"
      />
    </svg>
  );
}

// ── Tab 4: Education ──────────────────────────────────────────────────────────

function Education() {
  const [expanded, setExpanded] = useState<string | null>("brrrr");

  const sections = [
    {
      id: "brrrr",
      title: "BRRRR Strategy",
      icon: TrendingUp,
      color: "text-blue-400",
    },
    {
      id: "caprate",
      title: "Cap Rate Formula",
      icon: Percent,
      color: "text-emerald-400",
    },
    {
      id: "1031",
      title: "1031 Exchange",
      icon: Calendar,
      color: "text-amber-400",
    },
    {
      id: "reits",
      title: "REITs vs Direct Ownership",
      icon: Building2,
      color: "text-purple-400",
    },
    {
      id: "tax",
      title: "Tax Benefits",
      icon: Shield,
      color: "text-pink-400",
    },
  ];

  return (
    <div className="space-y-3 max-w-3xl">
      {sections.map((sec) => (
        <div key={sec.id} className="rounded-lg border border-border bg-card overflow-hidden">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
            onClick={() => setExpanded(expanded === sec.id ? null : sec.id)}
          >
            <sec.icon className={cn("size-4 shrink-0", sec.color)} />
            <span className="font-semibold text-sm">{sec.title}</span>
            <span className="ml-auto text-muted-foreground text-xs">{expanded === sec.id ? "▲" : "▼"}</span>
          </button>

          {expanded === sec.id && (
            <div className="px-4 pb-4 border-t border-border/40 pt-4 space-y-4">
              {sec.id === "brrrr" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    BRRRR is a real estate investment strategy that allows investors to recycle capital by pulling equity out of renovated properties.
                  </p>
                  <div className="overflow-x-auto">
                    <BRRRRChart />
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {[
                      { step: "Buy", detail: "Purchase a distressed property below market value — typically 60–80% of ARV (After Repair Value). Look for motivated sellers, foreclosures, or off-market deals." },
                      { step: "Rehab", detail: "Force appreciation through strategic renovations. Focus on kitchen, bathrooms, and curb appeal. Track costs carefully — your profit is made at the buy." },
                      { step: "Rent", detail: "Place qualified tenants to generate steady cash flow. Aim for DSCR > 1.2 and cash-on-cash return > 8% after stabilization." },
                      { step: "Refinance", detail: "Pull out equity via a cash-out refinance at the new appraised value. This recycles your initial capital to deploy in the next deal." },
                      { step: "Repeat", detail: "Use the extracted equity as a down payment on the next property. Done correctly, you can scale a portfolio with minimal additional capital." },
                    ].map(({ step, detail }) => (
                      <div key={step} className="flex gap-3">
                        <span className="text-xs font-bold text-primary w-16 shrink-0">{step}</span>
                        <span className="text-xs text-muted-foreground">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sec.id === "caprate" && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-foreground">Cap Rate = NOI / Property Value</div>
                      <div className="text-muted-foreground text-sm">Net Operating Income ÷ Current Market Value × 100</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <h4 className="text-sm font-semibold text-emerald-400 mb-2">Worked Example</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Annual Gross Rent</span><span className="font-medium">$36,000</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Vacancy (5%)</span><span className="font-medium text-red-400">-$1,800</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Property Tax</span><span className="font-medium text-red-400">-$2,400</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><span className="font-medium text-red-400">-$1,200</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Maintenance</span><span className="font-medium text-red-400">-$600</span></div>
                      <div className="border-t border-border pt-2 flex justify-between font-bold">
                        <span>NOI</span><span className="text-emerald-400">$30,000</span>
                      </div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Property Value</span><span className="font-medium">$500,000</span></div>
                      <div className="border-t border-border pt-2 flex justify-between font-bold text-primary">
                        <span>Cap Rate</span><span>$30,000 / $500,000 = 6.0%</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {[
                      { range: "< 4%", label: "Premium Markets", desc: "NYC, SF, LA — appreciation play, negative cash flow likely", color: "text-red-400" },
                      { range: "4–6%", label: "Balanced Markets", desc: "Major metros — moderate cash flow + appreciation", color: "text-amber-400" },
                      { range: "> 6%", label: "Cash Flow Markets", desc: "Midwest, Southeast — strong cash flow, slower appreciation", color: "text-emerald-400" },
                    ].map(({ range, label, desc, color }) => (
                      <div key={range} className="rounded-lg border border-border p-3 space-y-1">
                        <div className={cn("font-bold text-sm", color)}>{range}</div>
                        <div className="font-medium">{label}</div>
                        <div className="text-muted-foreground">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sec.id === "1031" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    A 1031 Exchange (named after IRC Section 1031) allows real estate investors to defer capital gains taxes by rolling proceeds from a sold property into a like-kind replacement property.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "45-Day Rule", detail: "You must identify potential replacement properties within 45 days of closing the relinquished property sale." },
                      { label: "180-Day Rule", detail: "You must close on the replacement property within 180 days of the sale of the relinquished property." },
                      { label: "Like-Kind Requirement", detail: "Properties must be of 'like-kind' — any real property held for investment qualifies. Does not have to be same type." },
                      { label: "Qualified Intermediary", detail: "A QI must hold the sale proceeds during the exchange. You cannot take constructive receipt of the funds." },
                      { label: "Equal or Greater Value", detail: "To defer all capital gains, the replacement property must be equal to or greater in value than what was sold." },
                      { label: "Boot Avoidance", detail: "'Boot' is cash or non-like-kind property received in an exchange — it is taxable. Must reinvest all equity to fully defer." },
                    ].map(({ label, detail }) => (
                      <div key={label} className="rounded-lg border border-border p-3 space-y-1">
                        <div className="text-xs font-semibold text-amber-400">{label}</div>
                        <div className="text-xs text-muted-foreground">{detail}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex gap-2">
                    <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300">Primary residences do not qualify. Dealer property (inventory) does not qualify. Always consult a qualified tax professional before executing a 1031 exchange.</p>
                  </div>
                </div>
              )}

              {sec.id === "reits" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    REITs (Real Estate Investment Trusts) offer exposure to real estate without direct property ownership. Here is how they compare:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 pr-4 text-muted-foreground">Dimension</th>
                          <th className="text-center py-2 px-3 text-purple-400">REITs</th>
                          <th className="text-center py-2 px-3 text-blue-400">Direct Ownership</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { dim: "Liquidity", reit: "High — trade on exchanges daily", direct: "Low — takes months to sell" },
                          { dim: "Diversification", reit: "Instant — across hundreds of properties", direct: "Concentrated — few properties" },
                          { dim: "Management", reit: "None — passive income", direct: "Active — tenants, repairs, vacancies" },
                          { dim: "Leverage", reit: "Built-in but not controlled", direct: "Full control — choose LTV" },
                          { dim: "Tax Benefits", reit: "QBI deduction (20%), 1099-DIV", direct: "Depreciation, mortgage interest, 1031" },
                          { dim: "Minimum Investment", reit: "$1 — single share", direct: "$10K–$100K+ down payment" },
                          { dim: "Return Profile", reit: "Dividend yield + price appreciation", direct: "Cash flow + appreciation + equity build" },
                          { dim: "Inflation Hedge", reit: "Moderate (lease escalations)", direct: "Strong (rent increases + asset appreciation)" },
                        ].map(({ dim, reit, direct }) => (
                          <tr key={dim} className="border-b border-border/40 hover:bg-muted/20">
                            <td className="py-2 pr-4 font-medium text-muted-foreground">{dim}</td>
                            <td className="text-center py-2 px-3 text-purple-300">{reit}</td>
                            <td className="text-center py-2 px-3 text-blue-300">{direct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {sec.id === "tax" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Real estate offers some of the most powerful tax benefits available to individual investors. These can dramatically improve after-tax returns.
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Depreciation (Cost Recovery)",
                        badge: "27.5 years",
                        detail: "Residential rental property can be depreciated over 27.5 years (commercial: 39 years). This creates a paper loss that offsets rental income — even if the property is appreciating in value. A $500K property yields ~$18,182/year in depreciation deductions.",
                        color: "border-blue-500/30 bg-blue-500/5",
                        badgeColor: "bg-blue-500/20 text-blue-400",
                      },
                      {
                        title: "Mortgage Interest Deduction",
                        badge: "Schedule E",
                        detail: "All mortgage interest paid on rental properties is fully deductible as a business expense on Schedule E. Unlike primary residences (capped at $750K), rental properties have no cap on deductible interest.",
                        color: "border-emerald-500/30 bg-emerald-500/5",
                        badgeColor: "bg-emerald-500/20 text-emerald-400",
                      },
                      {
                        title: "Property Tax Deduction",
                        badge: "Unlimited",
                        detail: "Property taxes on rental properties are fully deductible as business expenses. The $10,000 SALT cap does NOT apply to rental properties — only to personal property taxes.",
                        color: "border-amber-500/30 bg-amber-500/5",
                        badgeColor: "bg-amber-500/20 text-amber-400",
                      },
                      {
                        title: "1031 Exchange",
                        badge: "Tax Deferral",
                        detail: "Defer capital gains taxes indefinitely by rolling proceeds into a like-kind property. Used strategically over a lifetime, you can build a portfolio and pass it to heirs with a stepped-up basis — potentially eliminating the deferred tax entirely.",
                        color: "border-purple-500/30 bg-purple-500/5",
                        badgeColor: "bg-purple-500/20 text-purple-400",
                      },
                      {
                        title: "Opportunity Zones",
                        badge: "IRC §1400Z",
                        detail: "Invest capital gains in Qualified Opportunity Zones. Hold for 10+ years and gains on the QOZ investment become completely tax-free. Defers the original gain until 2026 (or when sold). Available in 8,700+ census tracts nationwide.",
                        color: "border-pink-500/30 bg-pink-500/5",
                        badgeColor: "bg-pink-500/20 text-pink-400",
                      },
                    ].map(({ title, badge, detail, color, badgeColor }) => (
                      <div key={title} className={cn("rounded-lg border p-4 space-y-2", color)}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{title}</span>
                          <span className={cn("text-[10px] font-bold rounded-full px-2 py-0.5", badgeColor)}>{badge}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-muted bg-muted/20 p-3 flex gap-2">
                    <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Tax laws change frequently. The information above is for educational purposes only. Consult a CPA or tax attorney for advice specific to your situation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RealEstatePage() {
  const [inputs, setInputs] = useState<PropertyInputs>(DEFAULT_INPUTS);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [saveCount, setSaveCount] = useState(0);

  const markets = useMemo(() => generateMarkets(), []);

  const handleSave = useCallback(() => {
    if (savedProperties.length >= 3) {
      alert("Maximum 3 properties for comparison. Remove one first.");
      return;
    }
    const metrics = computeMetrics(inputs);
    const id = `prop-${Date.now()}`;
    setSaveCount((c) => c + 1);
    setSavedProperties((prev) => [
      ...prev,
      { id, name: `Property ${saveCount + 1}`, inputs: { ...inputs }, metrics },
    ]);
  }, [inputs, savedProperties.length, saveCount]);

  const handleRemove = useCallback((id: string) => {
    setSavedProperties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <div className="flex flex-col h-full bg-background p-4 gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-2">
          <Home className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Real Estate Investment Analyzer</h1>
          <p className="text-xs text-muted-foreground">Analyze properties, compare deals, explore markets, and learn strategies</p>
        </div>
        {savedProperties.length > 0 && (
          <Badge variant="outline" className="ml-auto text-xs">
            {savedProperties.length} / 3 properties saved
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analyzer" className="flex-1 flex flex-col min-h-0">
        <TabsList className="shrink-0 w-fit">
          <TabsTrigger value="analyzer" className="gap-2">
            <Home className="size-3.5" />
            Property Analyzer
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <Building2 className="size-3.5" />
            Deal Comparison
            {savedProperties.length > 0 && (
              <span className="rounded-full bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5">
                {savedProperties.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="markets" className="gap-2">
            <BarChart3 className="size-3.5" />
            Market Analysis
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-2">
            <BookOpen className="size-3.5" />
            Education
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer" className="flex-1 min-h-0 mt-4 data-[state=inactive]:hidden">
          <div className="h-full overflow-y-auto">
            <PropertyAnalyzer inputs={inputs} setInputs={setInputs} onSave={handleSave} />
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="flex-1 min-h-0 mt-4 data-[state=inactive]:hidden overflow-y-auto">
          <DealComparison properties={savedProperties} onRemove={handleRemove} />
        </TabsContent>

        <TabsContent value="markets" className="flex-1 min-h-0 mt-4 data-[state=inactive]:hidden overflow-y-auto">
          <MarketAnalysis markets={markets} />
        </TabsContent>

        <TabsContent value="education" className="flex-1 min-h-0 mt-4 data-[state=inactive]:hidden overflow-y-auto">
          <Education />
        </TabsContent>
      </Tabs>
    </div>
  );
}
