"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Building2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Info,
  DollarSign,
  Percent,
  Calculator,
  MapPin,
  Layers,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 7;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtUSD(n: number, decimals = 0): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

function fmtM(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return fmtUSD(n);
}

// ── Color helpers ─────────────────────────────────────────────────────────────

function posNegClass(v: number): string {
  return v >= 0 ? "text-emerald-400" : "text-rose-400";
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

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

// ── Section Title ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
      {children}
    </h3>
  );
}

// ── Info Box ──────────────────────────────────────────────────────────────────

function InfoBox({
  children,
  variant = "blue",
}: {
  children: React.ReactNode;
  variant?: "blue" | "amber" | "emerald";
}) {
  const colors = {
    blue: "bg-primary/10 border-primary/30 text-primary",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
  };
  return (
    <div className={cn("rounded-lg border p-3 text-xs text-muted-foreground leading-relaxed", colors[variant])}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Property Analyzer
// ══════════════════════════════════════════════════════════════════════════════

interface PropInputs {
  price: number;
  grossRent: number;
  propertyTax: number;
  insurance: number;
  maintenance: number;
  management: number;
  vacancy: number;
  downPct: number;
}

function calcMortgage(principal: number, annualRate: number, years: number) {
  const r = annualRate / 12;
  const n = years * 12;
  const payment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return payment;
}

function buildAmortization(principal: number, annualRate: number, years: number) {
  const r = annualRate / 12;
  const n = years * 12;
  const pmt = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  let balance = principal;
  const rows: { yr: number; interest: number; principal: number; balance: number }[] = [];
  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    const princ = pmt - interest;
    balance -= princ;
    if (m % 12 === 0) {
      const yr = m / 12;
      rows.push({ yr, interest, principal: princ, balance: Math.max(0, balance) });
    }
  }
  return { pmt, rows };
}

function PropertyAnalyzer() {
  const [inputs, setInputs] = useState<PropInputs>({
    price: 450000,
    grossRent: 2800,
    propertyTax: 5400,
    insurance: 1200,
    maintenance: 2700,
    management: 2016,
    vacancy: 5,
    downPct: 20,
  });

  const set = (key: keyof PropInputs, val: number) =>
    setInputs((p) => ({ ...p, [key]: val }));

  const calc = useMemo(() => {
    const {
      price,
      grossRent,
      propertyTax,
      insurance,
      maintenance,
      management,
      vacancy,
      downPct,
    } = inputs;
    const annualGross = grossRent * 12;
    const vacancyLoss = annualGross * (vacancy / 100);
    const effectiveGross = annualGross - vacancyLoss;
    const opEx = propertyTax + insurance + maintenance + management;
    const noi = effectiveGross - opEx;
    const capRate = (noi / price) * 100;

    const downPayment = price * (downPct / 100);
    const loanAmount = price - downPayment;
    const { pmt, rows } = buildAmortization(loanAmount, 0.07, 30);
    const annualDebtService = pmt * 12;
    const cashFlow = noi - annualDebtService;
    const cashOnCash = (cashFlow / downPayment) * 100;

    const breakEvenRent = (opEx + annualDebtService) / 12 / (1 - vacancy / 100);
    const dscr = noi / annualDebtService;

    // 10-year appreciation
    const appreciation = 0.04; // 4% annually
    const years = Array.from({ length: 11 }, (_, i) => i);
    const appreciation10 = years.map((yr) => ({
      yr,
      propValue: price * Math.pow(1 + appreciation, yr),
      equity: downPayment + (rows[yr - 1]?.balance !== undefined ? loanAmount - rows[yr - 1].balance : 0),
      loanBalance: yr === 0 ? loanAmount : rows[yr - 1]?.balance ?? 0,
    }));

    return {
      annualGross,
      vacancyLoss,
      effectiveGross,
      opEx,
      noi,
      capRate,
      downPayment,
      loanAmount,
      pmt,
      annualDebtService,
      cashFlow,
      cashOnCash,
      breakEvenRent,
      dscr,
      appreciation10,
      rows,
    };
  }, [inputs]);

  // SVG appreciation chart
  const chartData = calc.appreciation10;
  const maxVal = chartData[chartData.length - 1].propValue;
  const W = 480;
  const H = 180;
  const PAD = { t: 10, r: 20, b: 30, l: 60 };
  const cw = W - PAD.l - PAD.r;
  const ch = H - PAD.t - PAD.b;

  const xScale = (i: number) => PAD.l + (i / 10) * cw;
  const yScale = (v: number) => PAD.t + ch - (v / maxVal) * ch;

  const propPath = chartData.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.propValue)}`).join(" ");
  const equityPath = chartData.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.equity)}`).join(" ");

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-md border border-border bg-foreground/5 p-6 space-y-4 border-l-4 border-l-primary">
          <SectionTitle><Calculator className="w-4 h-4" />Property Inputs</SectionTitle>
          {(
            [
              { key: "price" as const, label: "Purchase Price ($)", step: 10000, min: 50000 },
              { key: "grossRent" as const, label: "Monthly Gross Rent ($)", step: 50, min: 500 },
              { key: "propertyTax" as const, label: "Annual Property Tax ($)", step: 100, min: 0 },
              { key: "insurance" as const, label: "Annual Insurance ($)", step: 100, min: 0 },
              { key: "maintenance" as const, label: "Annual Maintenance ($)", step: 100, min: 0 },
              { key: "management" as const, label: "Annual Mgmt Fees ($)", step: 100, min: 0 },
            ] as { key: keyof PropInputs; label: string; step: number; min: number }[]
          ).map(({ key, label, step, min }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-xs text-muted-foreground w-40 shrink-0">{label}</label>
              <input
                type="number"
                value={inputs[key]}
                step={step}
                min={min}
                onChange={(e) => set(key, parseFloat(e.target.value) || 0)}
                className="w-32 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}
          <div className="flex items-center justify-between gap-4">
            <label className="text-xs text-muted-foreground w-40 shrink-0">Vacancy Rate (%)</label>
            <input
              type="number"
              value={inputs.vacancy}
              step={0.5}
              min={0}
              max={30}
              onChange={(e) => set("vacancy", parseFloat(e.target.value) || 0)}
              className="w-32 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-xs text-muted-foreground w-40 shrink-0">Down Payment (%)</label>
            <input
              type="number"
              value={inputs.downPct}
              step={5}
              min={5}
              max={100}
              onChange={(e) => set("downPct", parseFloat(e.target.value) || 20)}
              className="w-32 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Cap Rate" value={fmtPct(calc.capRate)} highlight={calc.capRate >= 5 ? "pos" : calc.capRate >= 3 ? "neutral" : "neg"} sub="NOI / Property Value" />
            <StatCard label="Cash-on-Cash" value={fmtPct(calc.cashOnCash)} highlight={calc.cashOnCash >= 6 ? "pos" : calc.cashOnCash >= 0 ? "neutral" : "neg"} sub="Annual Cash Flow / Cash Invested" />
            <StatCard label="Monthly Cash Flow" value={fmtUSD(calc.cashFlow / 12)} highlight={calc.cashFlow >= 0 ? "pos" : "neg"} sub="After debt service" />
            <StatCard label="DSCR" value={calc.dscr.toFixed(2) + "x"} highlight={calc.dscr >= 1.25 ? "pos" : calc.dscr >= 1.0 ? "neutral" : "neg"} sub="NOI / Debt Service" />
          </div>

          <div className="rounded-md border border-border bg-foreground/5 p-4 space-y-2">
            <SectionTitle><DollarSign className="w-4 h-4" />Income Statement</SectionTitle>
            {[
              { label: "Gross Rent (annual)", val: calc.annualGross, sign: 1 },
              { label: `Vacancy (${fmtPct(inputs.vacancy)})`, val: -calc.vacancyLoss, sign: -1 },
              { label: "Effective Gross Income", val: calc.effectiveGross, sign: 1, bold: true },
              { label: "Operating Expenses", val: -calc.opEx, sign: -1 },
              { label: "Net Operating Income", val: calc.noi, sign: 1, bold: true },
              { label: "Debt Service (annual)", val: -calc.annualDebtService, sign: -1 },
              { label: "Cash Flow After Debt", val: calc.cashFlow, sign: 1, bold: true },
            ].map(({ label, val, bold }) => (
              <div key={label} className={cn("flex justify-between text-sm", bold ? "font-semibold border-t border-border pt-1 mt-1" : "")}>
                <span className="text-muted-foreground">{label}</span>
                <span className={posNegClass(val)}>{fmtM(val)}</span>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-border bg-foreground/5 p-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Loan Amount (80% LTV)</span>
              <span className="text-foreground">{fmtM(calc.loanAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Mortgage (7%, 30yr)</span>
              <span className="text-foreground">{fmtUSD(calc.pmt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Break-Even Rent</span>
              <span className="text-amber-400">{fmtUSD(calc.breakEvenRent)}/mo</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Down Payment</span>
              <span className="text-foreground">{fmtM(calc.downPayment)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appreciation SVG */}
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <SectionTitle><TrendingUp className="w-4 h-4" />10-Year Appreciation & Equity Build-Up (4% annual growth)</SectionTitle>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={PAD.l}
              y1={PAD.t + ch * (1 - t)}
              x2={W - PAD.r}
              y2={PAD.t + ch * (1 - t)}
              stroke="#ffffff15"
              strokeDasharray="4,4"
            />
          ))}
          {/* Y labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <text
              key={t}
              x={PAD.l - 4}
              y={PAD.t + ch * (1 - t) + 4}
              fontSize={9}
              fill="#6b7280"
              textAnchor="end"
            >
              {fmtM(maxVal * t)}
            </text>
          ))}
          {/* X labels */}
          {[0, 2, 4, 6, 8, 10].map((yr) => (
            <text key={yr} x={xScale(yr)} y={H - 6} fontSize={9} fill="#6b7280" textAnchor="middle">
              Yr {yr}
            </text>
          ))}
          {/* Property value area */}
          <path
            d={propPath + ` L${xScale(10)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`}
            fill="#3b82f620"
          />
          <path d={propPath} fill="none" stroke="#3b82f6" strokeWidth={2} />
          {/* Equity area */}
          <path
            d={equityPath + ` L${xScale(10)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`}
            fill="#10b98130"
          />
          <path d={equityPath} fill="none" stroke="#10b981" strokeWidth={2} strokeDasharray="6,3" />
          {/* Legend */}
          <rect x={PAD.l + 10} y={PAD.t + 6} width={10} height={3} fill="#3b82f6" rx={1} />
          <text x={PAD.l + 24} y={PAD.t + 10} fontSize={9} fill="#93c5fd">Property Value</text>
          <rect x={PAD.l + 105} y={PAD.t + 6} width={10} height={3} fill="#10b981" rx={1} />
          <text x={PAD.l + 119} y={PAD.t + 10} fontSize={9} fill="#6ee7b7">Equity</text>
        </svg>
        <div className="grid grid-cols-4 gap-3 mt-3">
          {[0, 3, 7, 10].map((yr) => {
            const d = chartData[yr];
            return (
              <div key={yr} className="text-center">
                <div className="text-xs text-muted-foreground">Year {yr}</div>
                <div className="text-sm font-semibold text-primary">{fmtM(d.propValue)}</div>
                <div className="text-xs text-emerald-400">{fmtM(d.equity)} equity</div>
              </div>
            );
          })}
        </div>
      </div>

      <InfoBox variant="blue">
        <strong>Cap Rate</strong> = NOI / Property Value. A higher cap rate means more income relative to price — but also higher risk. {" "}
        <strong>Cash-on-Cash</strong> measures your annual cash return on the actual cash you invested (down payment + closing costs). {" "}
        <strong>DSCR &gt; 1.25x</strong> is typically required for commercial lending.
      </InfoBox>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Market Comparisons
// ══════════════════════════════════════════════════════════════════════════════

interface Metro {
  city: string;
  state: string;
  medianPrice: number;
  medianIncome: number;
  priceToRent: number;
  capRate: number;
  rentGrowth: number;
  priceGrowth: number;
}

const METROS: Metro[] = [
  { city: "San Francisco", state: "CA", medianPrice: 1_380_000, medianIncome: 128_000, priceToRent: 38, capRate: 3.1, rentGrowth: 2.1, priceGrowth: 3.2 },
  { city: "New York", state: "NY", medianPrice: 980_000, medianIncome: 98_000, priceToRent: 32, capRate: 3.6, rentGrowth: 4.2, priceGrowth: 2.8 },
  { city: "Los Angeles", state: "CA", medianPrice: 850_000, medianIncome: 82_000, priceToRent: 36, capRate: 3.3, rentGrowth: 3.1, priceGrowth: 3.5 },
  { city: "Seattle", state: "WA", medianPrice: 720_000, medianIncome: 105_000, priceToRent: 28, capRate: 4.0, rentGrowth: 3.8, priceGrowth: 4.1 },
  { city: "Boston", state: "MA", medianPrice: 680_000, medianIncome: 89_000, priceToRent: 29, capRate: 3.9, rentGrowth: 3.3, priceGrowth: 3.8 },
  { city: "Denver", state: "CO", medianPrice: 560_000, medianIncome: 78_000, priceToRent: 24, capRate: 4.8, rentGrowth: 4.5, priceGrowth: 5.2 },
  { city: "Austin", state: "TX", medianPrice: 540_000, medianIncome: 82_000, priceToRent: 22, capRate: 5.1, rentGrowth: 5.2, priceGrowth: 6.8 },
  { city: "Nashville", state: "TN", medianPrice: 490_000, medianIncome: 72_000, priceToRent: 21, capRate: 5.3, rentGrowth: 5.8, priceGrowth: 7.1 },
  { city: "Charlotte", state: "NC", medianPrice: 420_000, medianIncome: 68_000, priceToRent: 19, capRate: 5.7, rentGrowth: 6.1, priceGrowth: 7.4 },
  { city: "Phoenix", state: "AZ", medianPrice: 410_000, medianIncome: 65_000, priceToRent: 18, capRate: 5.9, rentGrowth: 5.9, priceGrowth: 6.2 },
  { city: "Dallas", state: "TX", medianPrice: 395_000, medianIncome: 71_000, priceToRent: 17, capRate: 6.1, rentGrowth: 5.5, priceGrowth: 5.8 },
  { city: "Atlanta", state: "GA", medianPrice: 380_000, medianIncome: 70_000, priceToRent: 17, capRate: 6.2, rentGrowth: 6.3, priceGrowth: 6.5 },
  { city: "Tampa", state: "FL", medianPrice: 370_000, medianIncome: 64_000, priceToRent: 16, capRate: 6.4, rentGrowth: 6.8, priceGrowth: 7.8 },
  { city: "Jacksonville", state: "FL", medianPrice: 330_000, medianIncome: 60_000, priceToRent: 15, capRate: 6.8, rentGrowth: 6.9, priceGrowth: 7.2 },
  { city: "Columbus", state: "OH", medianPrice: 290_000, medianIncome: 62_000, priceToRent: 14, capRate: 7.1, rentGrowth: 5.5, priceGrowth: 5.1 },
  { city: "Indianapolis", state: "IN", medianPrice: 265_000, medianIncome: 58_000, priceToRent: 13, capRate: 7.4, rentGrowth: 5.3, priceGrowth: 5.0 },
  { city: "Memphis", state: "TN", medianPrice: 210_000, medianIncome: 50_000, priceToRent: 11, capRate: 8.2, rentGrowth: 5.1, priceGrowth: 4.2 },
  { city: "Detroit", state: "MI", medianPrice: 185_000, medianIncome: 48_000, priceToRent: 10, capRate: 8.8, rentGrowth: 4.8, priceGrowth: 3.6 },
  { city: "Kansas City", state: "MO", medianPrice: 240_000, medianIncome: 60_000, priceToRent: 13, capRate: 7.2, rentGrowth: 5.0, priceGrowth: 4.8 },
  { city: "St. Louis", state: "MO", medianPrice: 220_000, medianIncome: 57_000, priceToRent: 12, capRate: 7.6, rentGrowth: 4.6, priceGrowth: 4.0 },
];

type MarketSort = "price" | "capRate" | "priceToRent" | "affordability" | "score";

function MarketComparisons() {
  const [sort, setSort] = useState<MarketSort>("capRate");
  const [rentVsBuy, setRentVsBuy] = useState({ price: 450000, rent: 2800, appreciation: 4, investReturn: 7 });

  const metros = useMemo(() => {
    return [...METROS]
      .map((m) => ({
        ...m,
        affordability: m.medianPrice / m.medianIncome,
        score: m.capRate * 0.5 + m.priceGrowth * 0.3 + m.rentGrowth * 0.2,
      }))
      .sort((a, b) => {
        if (sort === "price") return a.medianPrice - b.medianPrice;
        if (sort === "capRate") return b.capRate - a.capRate;
        if (sort === "priceToRent") return a.priceToRent - b.priceToRent;
        if (sort === "affordability") return a.affordability - b.affordability;
        return b.score - a.score;
      });
  }, [sort]);

  // Rent vs Buy 10yr NPV
  const rvb = useMemo(() => {
    const { price, rent, appreciation, investReturn } = rentVsBuy;
    const down = price * 0.2;
    const loan = price * 0.8;
    const r = 0.07 / 12;
    const n = 360;
    const pmt = (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    let buyCost = down; // opportunity cost of down
    let rentCost = 0;
    let buyEquity = 0;
    let balance = loan;

    const yvBuy: number[] = [];
    const yvRent: number[] = [];

    for (let yr = 1; yr <= 10; yr++) {
      // Buy costs: 12*pmt per year + taxes/ins ~1.5%
      buyCost += pmt * 12 + price * 0.015;
      // Rent cost: monthly rent * 12 (3% rent growth)
      rentCost += rent * 12 * Math.pow(1.03, yr - 1);
      // Down payment opportunity cost at investReturn%
      const oppCost = down * (Math.pow(1 + investReturn / 100, yr) - 1);
      // Home value
      const homeVal = price * Math.pow(1 + appreciation / 100, yr);
      // Equity
      for (let m = 0; m < 12; m++) {
        const interest = balance * r;
        const princ = pmt - interest;
        balance = Math.max(0, balance - princ);
      }
      buyEquity = homeVal - balance;
      yvBuy.push(buyCost - buyEquity + oppCost);
      yvRent.push(rentCost);
    }

    return { yvBuy, yvRent };
  }, [rentVsBuy]);

  const rvbMax = Math.max(...rvb.yvBuy, ...rvb.yvRent);
  const W2 = 460;
  const H2 = 160;
  const P2 = { t: 10, r: 20, b: 30, l: 60 };
  const cw2 = W2 - P2.l - P2.r;
  const ch2 = H2 - P2.t - P2.b;

  const buyPath = rvb.yvBuy
    .map((v, i) => `${i === 0 ? "M" : "L"}${P2.l + ((i + 1) / 10) * cw2},${P2.t + ch2 - (v / rvbMax) * ch2}`)
    .join(" ");
  const rentPath = rvb.yvRent
    .map((v, i) => `${i === 0 ? "M" : "L"}${P2.l + ((i + 1) / 10) * cw2},${P2.t + ch2 - (v / rvbMax) * ch2}`)
    .join(" ");

  const winner10 = rvb.yvBuy[9] < rvb.yvRent[9] ? "buying" : "renting";

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Sort by:</span>
        {(
          [
            { key: "score" as const, label: "Investor Score" },
            { key: "capRate" as const, label: "Cap Rate" },
            { key: "price" as const, label: "Price (Low)" },
            { key: "priceToRent" as const, label: "Price/Rent" },
            { key: "affordability" as const, label: "Affordability" },
          ] as { key: MarketSort; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs text-muted-foreground font-medium transition-colors",
              sort === key ? "bg-primary text-foreground" : "bg-foreground/5 text-muted-foreground hover:bg-muted/50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-foreground/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-foreground/5 text-xs text-muted-foreground uppercase">
                <th className="px-3 py-2 text-left">Metro</th>
                <th className="px-3 py-2 text-right">Median Price</th>
                <th className="px-3 py-2 text-right">P/Rent</th>
                <th className="px-3 py-2 text-right">Cap Rate</th>
                <th className="px-3 py-2 text-right">Rent Grwth</th>
                <th className="px-3 py-2 text-right">Price Grwth</th>
                <th className="px-3 py-2 text-right">Price/Income</th>
                <th className="px-3 py-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {metros.map((m, i) => {
                const afford = m.medianPrice / m.medianIncome;
                const score = m.capRate * 0.5 + m.priceGrowth * 0.3 + m.rentGrowth * 0.2;
                return (
                  <motion.tr
                    key={m.city}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-t border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2 font-medium text-foreground">
                      {m.city}, {m.state}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{fmtM(m.medianPrice)}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={m.priceToRent < 15 ? "text-emerald-400" : m.priceToRent < 25 ? "text-amber-400" : "text-rose-400"}>
                        {m.priceToRent}x
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={m.capRate >= 6 ? "text-emerald-400" : m.capRate >= 4.5 ? "text-amber-400" : "text-rose-400"}>
                        {fmtPct(m.capRate)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-primary">{fmtPct(m.rentGrowth)}</td>
                    <td className="px-3 py-2 text-right text-orange-300">{fmtPct(m.priceGrowth)}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={afford < 5 ? "text-emerald-400" : afford < 8 ? "text-amber-400" : "text-rose-400"}>
                        {afford.toFixed(1)}x
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="h-1.5 rounded-full bg-primary/30 w-16 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(score / 10) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{score.toFixed(1)}</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rent vs Buy */}
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <SectionTitle><Calculator className="w-4 h-4" />Rent vs. Buy Calculator (10-Year Net Cost)</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { key: "price" as const, label: "Purchase Price ($)", step: 10000 },
            { key: "rent" as const, label: "Monthly Rent ($)", step: 100 },
            { key: "appreciation" as const, label: "Home Appreciation (%)", step: 0.5 },
            { key: "investReturn" as const, label: "Investment Return (%)", step: 0.5 },
          ].map(({ key, label, step }) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground block mb-1">{label}</label>
              <input
                type="number"
                value={rentVsBuy[key]}
                step={step}
                onChange={(e) =>
                  setRentVsBuy((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}
        </div>

        <svg viewBox={`0 0 ${W2} ${H2}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line key={t} x1={P2.l} y1={P2.t + ch2 * (1 - t)} x2={W2 - P2.r} y2={P2.t + ch2 * (1 - t)} stroke="#ffffff10" strokeDasharray="4,4" />
          ))}
          {[0, 0.5, 1].map((t) => (
            <text key={t} x={P2.l - 4} y={P2.t + ch2 * (1 - t) + 4} fontSize={9} fill="#6b7280" textAnchor="end">
              {fmtM(rvbMax * t)}
            </text>
          ))}
          {[2, 4, 6, 8, 10].map((yr) => (
            <text key={yr} x={P2.l + (yr / 10) * cw2} y={H2 - 6} fontSize={9} fill="#6b7280" textAnchor="middle">
              Yr {yr}
            </text>
          ))}
          <path d={buyPath} fill="none" stroke="#3b82f6" strokeWidth={2} />
          <path d={rentPath} fill="none" stroke="#f59e0b" strokeWidth={2} />
          <rect x={P2.l + 10} y={P2.t + 6} width={10} height={2} fill="#3b82f6" />
          <text x={P2.l + 24} y={P2.t + 10} fontSize={9} fill="#93c5fd">Buy (net cost)</text>
          <rect x={P2.l + 110} y={P2.t + 6} width={10} height={2} fill="#f59e0b" />
          <text x={P2.l + 124} y={P2.t + 10} fontSize={9} fill="#fcd34d">Rent</text>
        </svg>

        <div className={cn("mt-3 rounded-lg p-3 text-sm font-medium text-center", winner10 === "buying" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300")}>
          Over 10 years, <strong>{winner10}</strong> is cheaper given these assumptions.
          Net cost difference: {fmtM(Math.abs(rvb.yvBuy[9] - rvb.yvRent[9]))}
        </div>
      </div>

      <InfoBox variant="amber">
        <strong>Price-to-Rent Ratio</strong>: Below 15 = strongly favors buying. 15–20 = neutral. Above 25 = renting likely cheaper. {" "}
        <strong>Investor Score</strong> weights cap rate (50%), price growth (30%), rent growth (20%).
      </InfoBox>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — REIT Analysis
// ══════════════════════════════════════════════════════════════════════════════

interface REITDef {
  ticker: string;
  name: string;
  sector: string;
  divYield: number;
  ffoPerShare: number;
  pFfo: number;
  debtEbitda: number;
  occupancy: number;
  leaseType: string;
}

const REITS: REITDef[] = [
  { ticker: "AVB", name: "AvalonBay Communities", sector: "Residential", divYield: 3.4, ffoPerShare: 10.8, pFfo: 18.2, debtEbitda: 5.2, occupancy: 96.1, leaseType: "Gross" },
  { ticker: "EQR", name: "Equity Residential", sector: "Residential", divYield: 3.8, ffoPerShare: 3.9, pFfo: 17.5, debtEbitda: 5.8, occupancy: 95.8, leaseType: "Gross" },
  { ticker: "SPG", name: "Simon Property Group", sector: "Retail (Mall)", divYield: 5.1, ffoPerShare: 12.4, pFfo: 12.2, debtEbitda: 7.1, occupancy: 94.7, leaseType: "Triple Net" },
  { ticker: "O", name: "Realty Income", sector: "Retail (NNN)", divYield: 5.8, ffoPerShare: 4.2, pFfo: 13.1, debtEbitda: 5.9, occupancy: 98.8, leaseType: "Triple Net" },
  { ticker: "VNO", name: "Vornado Realty", sector: "Office", divYield: 4.2, ffoPerShare: 2.8, pFfo: 11.8, debtEbitda: 9.2, occupancy: 89.2, leaseType: "Gross" },
  { ticker: "PLD", name: "Prologis", sector: "Industrial", divYield: 2.8, ffoPerShare: 5.6, pFfo: 24.1, debtEbitda: 4.1, occupancy: 97.6, leaseType: "Triple Net" },
  { ticker: "WELL", name: "Welltower", sector: "Healthcare", divYield: 2.1, ffoPerShare: 4.1, pFfo: 28.6, debtEbitda: 6.2, occupancy: 84.3, leaseType: "Triple Net" },
  { ticker: "DLR", name: "Digital Realty", sector: "Data Center", divYield: 3.1, ffoPerShare: 6.8, pFfo: 22.4, debtEbitda: 6.8, occupancy: 98.2, leaseType: "Gross" },
  { ticker: "MAR", name: "Marriott REIT", sector: "Hospitality", divYield: 4.6, ffoPerShare: 3.2, pFfo: 15.8, debtEbitda: 8.4, occupancy: 72.8, leaseType: "Gross" },
  { ticker: "WPC", name: "W. P. Carey", sector: "Diversified", divYield: 6.2, ffoPerShare: 4.8, pFfo: 11.9, debtEbitda: 6.1, occupancy: 98.4, leaseType: "Triple Net" },
  { ticker: "PSA", name: "Public Storage", sector: "Self-Storage", divYield: 3.2, ffoPerShare: 16.8, pFfo: 19.4, debtEbitda: 3.8, occupancy: 93.5, leaseType: "Month-to-Month" },
  { ticker: "EXR", name: "Extra Space Storage", sector: "Self-Storage", divYield: 4.1, ffoPerShare: 8.4, pFfo: 17.2, debtEbitda: 4.2, occupancy: 92.8, leaseType: "Month-to-Month" },
];

const SECTOR_COLORS: Record<string, string> = {
  Residential: "#3b82f6",
  "Retail (Mall)": "#f59e0b",
  "Retail (NNN)": "#f97316",
  Office: "#ef4444",
  Industrial: "#10b981",
  Healthcare: "#a78bfa",
  "Data Center": "#06b6d4",
  Hospitality: "#ec4899",
  Diversified: "#8b5cf6",
  "Self-Storage": "#84cc16",
};

function REITAnalysis() {
  const [selected, setSelected] = useState<string | null>(null);
  const sel = REITS.find((r) => r.ticker === selected);

  const avgDivYield = REITS.reduce((a, b) => a + b.divYield, 0) / REITS.length;
  const avgPFfo = REITS.reduce((a, b) => a + b.pFfo, 0) / REITS.length;

  // Bar chart: FFO by ticker
  const maxFfo = Math.max(...REITS.map((r) => r.ffoPerShare));
  const W3 = 480;
  const H3 = 140;
  const P3 = { t: 10, r: 10, b: 30, l: 40 };
  const barW = (W3 - P3.l - P3.r) / REITS.length - 2;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="REITs Covered" value="12" sub="Across 8 sectors" />
        <StatCard label="Avg Div Yield" value={fmtPct(avgDivYield)} highlight="pos" sub="vs S&P ~1.5%" />
        <StatCard label="Avg P/FFO" value={avgPFfo.toFixed(1) + "x"} sub="Industry median" />
        <StatCard label="Highest Yield" value={fmtPct(Math.max(...REITS.map((r) => r.divYield)))} highlight="pos" sub="WPC — Diversified" />
      </div>

      {/* REIT table */}
      <div className="rounded-md border border-border bg-foreground/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-foreground/5 text-xs text-muted-foreground uppercase">
                <th className="px-3 py-2 text-left">Ticker</th>
                <th className="px-3 py-2 text-left">Sector</th>
                <th className="px-3 py-2 text-right">Div Yield</th>
                <th className="px-3 py-2 text-right">FFO/Share</th>
                <th className="px-3 py-2 text-right">P/FFO</th>
                <th className="px-3 py-2 text-right">Debt/EBITDA</th>
                <th className="px-3 py-2 text-right">Occupancy</th>
                <th className="px-3 py-2 text-left">Lease</th>
              </tr>
            </thead>
            <tbody>
              {REITS.map((r) => (
                <tr
                  key={r.ticker}
                  onClick={() => setSelected(r.ticker === selected ? null : r.ticker)}
                  className={cn("border-t border-border/50 cursor-pointer transition-colors", selected === r.ticker ? "bg-primary/20" : "hover:bg-muted/30")}
                >
                  <td className="px-3 py-2 font-mono font-bold text-foreground">{r.ticker}</td>
                  <td className="px-3 py-2">
                    <span className="rounded px-1.5 py-0.5 text-xs" style={{ backgroundColor: (SECTOR_COLORS[r.sector] ?? "#6b7280") + "30", color: SECTOR_COLORS[r.sector] ?? "#9ca3af" }}>
                      {r.sector}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-emerald-400">{fmtPct(r.divYield)}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">${r.ffoPerShare.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={r.pFfo < 15 ? "text-emerald-400" : r.pFfo < 22 ? "text-amber-400" : "text-rose-400"}>{r.pFfo.toFixed(1)}x</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={r.debtEbitda < 5 ? "text-emerald-400" : r.debtEbitda < 7 ? "text-amber-400" : "text-rose-400"}>{r.debtEbitda.toFixed(1)}x</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={r.occupancy >= 95 ? "text-emerald-400" : r.occupancy >= 88 ? "text-amber-400" : "text-rose-400"}>{r.occupancy.toFixed(1)}%</span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{r.leaseType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected detail */}
      <AnimatePresence>
        {sel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-md border border-primary/30 bg-primary/10 p-5"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-mono font-medium text-xl text-foreground">{sel.ticker}</span>
                <span className="ml-2 text-muted-foreground">{sel.name}</span>
              </div>
              <span className="rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: (SECTOR_COLORS[sel.sector] ?? "#6b7280") + "30", color: SECTOR_COLORS[sel.sector] ?? "#9ca3af" }}>
                {sel.sector}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <StatCard label="Dividend Yield" value={fmtPct(sel.divYield)} highlight="pos" />
              <StatCard label="FFO/Share" value={`$${sel.ffoPerShare.toFixed(2)}`} />
              <StatCard label="P/FFO Multiple" value={`${sel.pFfo.toFixed(1)}x`} highlight={sel.pFfo < avgPFfo ? "pos" : "neutral"} sub={sel.pFfo < avgPFfo ? "Below avg (cheap)" : "Above avg"} />
              <StatCard label="Occupancy" value={fmtPct(sel.occupancy)} highlight={sel.occupancy >= 95 ? "pos" : sel.occupancy >= 88 ? "neutral" : "neg"} />
            </div>
            <InfoBox variant="blue">
              <strong>Lease type: {sel.leaseType}</strong>
              {sel.leaseType === "Triple Net" && " — Tenant pays property taxes, insurance, and maintenance. Very predictable income for the REIT."}
              {sel.leaseType === "Gross" && " — Landlord pays operating expenses. Requires active management but gives full control over cost structure."}
              {sel.leaseType === "Month-to-Month" && " — Short-term leases with frequent rent resets. Allows quick adjustments to market rates but less income predictability."}
            </InfoBox>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FFO bar chart */}
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <SectionTitle><BarChart3 className="w-4 h-4" />FFO per Share by REIT</SectionTitle>
        <svg viewBox={`0 0 ${W3} ${H3}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {[0, 0.5, 1].map((t) => (
            <line key={t} x1={P3.l} y1={P3.t + (H3 - P3.t - P3.b) * (1 - t)} x2={W3 - P3.r} y2={P3.t + (H3 - P3.t - P3.b) * (1 - t)} stroke="#ffffff10" strokeDasharray="3,3" />
          ))}
          {REITS.map((r, i) => {
            const barH = (r.ffoPerShare / maxFfo) * (H3 - P3.t - P3.b);
            const x = P3.l + i * ((W3 - P3.l - P3.r) / REITS.length) + 1;
            const color = SECTOR_COLORS[r.sector] ?? "#6b7280";
            return (
              <g key={r.ticker}>
                <rect x={x} y={P3.t + (H3 - P3.t - P3.b) - barH} width={barW} height={barH} fill={color + "80"} rx={2} />
                <text x={x + barW / 2} y={H3 - P3.b + 10} fontSize={7} fill="#6b7280" textAnchor="middle">{r.ticker}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Education: FFO vs Earnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border border-border bg-foreground/5 p-4 space-y-2">
          <SectionTitle><Info className="w-4 h-4" />Why FFO Instead of EPS?</SectionTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            REITs own depreciating assets on paper — GAAP requires large depreciation charges that reduce net income, but real estate often <em>appreciates</em> in value.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">FFO = Net Income + Depreciation − Gains on Property Sales</strong>. This gives a more accurate picture of cash generated from operations.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">AFFO</strong> (Adjusted FFO) further subtracts recurring capex — the gold standard for dividend sustainability analysis.
          </p>
        </div>
        <div className="rounded-md border border-border bg-foreground/5 p-4 space-y-2">
          <SectionTitle><Building2 className="w-4 h-4" />REIT vs Direct Real Estate</SectionTitle>
          {[
            { factor: "Liquidity", reit: "High — stock exchange", direct: "Low — months to sell" },
            { factor: "Diversification", reit: "100s of properties", direct: "Concentrated" },
            { factor: "Leverage", reit: "Moderate, institutional", direct: "High, personal loan" },
            { factor: "Tax (US)", reit: "Ordinary income", direct: "Cap gains + depreciation" },
            { factor: "Control", reit: "None", direct: "Full" },
            { factor: "Min. Investment", reit: "~$50 per share", direct: "$50K+ down payment" },
          ].map(({ factor, reit, direct }) => (
            <div key={factor} className="grid grid-cols-3 text-xs text-muted-foreground gap-1">
              <span className="text-muted-foreground font-medium">{factor}</span>
              <span className="text-primary">{reit}</span>
              <span className="text-amber-300">{direct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Commercial Real Estate
// ══════════════════════════════════════════════════════════════════════════════

interface CREProperty {
  type: string;
  icon: string;
  nyCapRate: number;
  sunBeltCapRate: number;
  vacancyRate: number;
  avgLeaseTerm: string;
  trend: "up" | "down" | "flat";
  note: string;
}

const CRE_SECTORS: CREProperty[] = [
  { type: "Industrial", icon: "🏭", nyCapRate: 4.2, sunBeltCapRate: 4.8, vacancyRate: 4.2, avgLeaseTerm: "5-10 yr", trend: "up", note: "E-commerce tailwind; last-mile demand surging" },
  { type: "Multifamily", icon: "🏢", nyCapRate: 3.8, sunBeltCapRate: 5.2, vacancyRate: 6.8, avgLeaseTerm: "1 yr", trend: "up", note: "Strong Sun Belt demand; rent growth moderating" },
  { type: "Data Center", icon: "🖥️", nyCapRate: 4.5, sunBeltCapRate: 5.5, vacancyRate: 2.8, avgLeaseTerm: "10-15 yr", trend: "up", note: "AI demand driving explosive leasing activity" },
  { type: "Retail (Strip)", icon: "🏪", nyCapRate: 5.5, sunBeltCapRate: 6.2, vacancyRate: 5.8, avgLeaseTerm: "5-10 yr", trend: "flat", note: "Grocery-anchored centers most resilient" },
  { type: "Office (CBD)", icon: "🏙️", nyCapRate: 3.5, sunBeltCapRate: 6.5, vacancyRate: 19.2, avgLeaseTerm: "7-10 yr", trend: "down", note: "Remote work structural headwind; record vacancy" },
  { type: "Hospitality", icon: "🏨", nyCapRate: 6.2, sunBeltCapRate: 8.1, vacancyRate: 28.4, avgLeaseTerm: "N/A", trend: "flat", note: "Leisure recovery strong; business travel lagging" },
  { type: "Healthcare (MOB)", icon: "🏥", nyCapRate: 5.2, sunBeltCapRate: 6.1, vacancyRate: 8.1, avgLeaseTerm: "10-20 yr", trend: "up", note: "Aging population; sticky tenants" },
];

function CommercialRE() {
  const [dscrInputs, setDscrInputs] = useState({ noi: 480000, debtService: 360000 });
  const [mortInputs, setMortInputs] = useState({ loanAmount: 5000000, rate: 6.5, amort: 25 });

  const dscr = dscrInputs.noi / dscrInputs.debtService;

  const { pmt: commercialPmt } = useMemo(() => {
    const { loanAmount, rate, amort } = mortInputs;
    const r = rate / 100 / 12;
    const n = amort * 12;
    const pmt = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    // 5yr balloon: remaining balance after 5 years
    let balance = loanAmount;
    for (let m = 0; m < 60; m++) {
      const interest = balance * r;
      const princ = pmt - interest;
      balance -= princ;
    }
    return { pmt, balloon: balance };
  }, [mortInputs]);

  return (
    <div className="space-y-4">
      {/* Sector grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {CRE_SECTORS.map((s) => (
          <motion.div
            key={s.type}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md border border-border bg-foreground/5 p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.icon}</span>
                <span className="font-medium text-foreground text-sm">{s.type}</span>
              </div>
              {s.trend === "up" ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : s.trend === "down" ? <TrendingDown className="w-4 h-4 text-rose-400" /> : <ArrowRight className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span className="text-muted-foreground">NYC Cap Rate</span>
                <span className="text-muted-foreground">{fmtPct(s.nyCapRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sun Belt</span>
                <span className="text-muted-foreground">{fmtPct(s.sunBeltCapRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vacancy</span>
                <span className={s.vacancyRate > 15 ? "text-rose-400" : s.vacancyRate > 8 ? "text-amber-400" : "text-emerald-400"}>{fmtPct(s.vacancyRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lease Term</span>
                <span className="text-muted-foreground">{s.avgLeaseTerm}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.note}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* DSCR Calculator */}
        <div className="rounded-md border border-border bg-foreground/5 p-5 space-y-4">
          <SectionTitle><Calculator className="w-4 h-4" />DSCR Calculator</SectionTitle>
          {[
            { key: "noi" as const, label: "Annual NOI ($)" },
            { key: "debtService" as const, label: "Annual Debt Service ($)" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-xs text-muted-foreground w-40">{label}</label>
              <input
                type="number"
                value={dscrInputs[key]}
                step={10000}
                onChange={(e) => setDscrInputs((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                className="w-32 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}
          <div className={cn("rounded-lg p-4 text-center", dscr >= 1.25 ? "bg-emerald-500/15 border border-emerald-500/30" : dscr >= 1.0 ? "bg-amber-500/15 border border-amber-500/30" : "bg-rose-500/15 border border-rose-500/30")}>
            <div className={cn("text-2xl font-bold", dscr >= 1.25 ? "text-emerald-400" : dscr >= 1.0 ? "text-amber-400" : "text-rose-400")}>
              {dscr.toFixed(2)}x
            </div>
            <div className="text-xs text-muted-foreground mt-1">DSCR — {dscr >= 1.25 ? "Lender approved (>1.25x)" : dscr >= 1.0 ? "Borderline — may require more equity" : "Below 1.0x — property cash flow negative"}</div>
          </div>
          <InfoBox variant="blue">
            Most commercial lenders require <strong>DSCR ≥ 1.25x</strong>. Bridge lenders may go to 1.10x with higher rates. SBA loans often require 1.15x.
          </InfoBox>
        </div>

        {/* 5/25 Commercial Mortgage */}
        <div className="rounded-md border border-border bg-foreground/5 p-5 space-y-4">
          <SectionTitle><Building2 className="w-4 h-4" />Commercial Mortgage (5/25 Structure)</SectionTitle>
          {[
            { key: "loanAmount" as const, label: "Loan Amount ($)", step: 100000 },
            { key: "rate" as const, label: "Interest Rate (%)", step: 0.25 },
            { key: "amort" as const, label: "Amortization (years)", step: 5 },
          ].map(({ key, label, step }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-xs text-muted-foreground w-40">{label}</label>
              <input
                type="number"
                value={mortInputs[key]}
                step={step}
                onChange={(e) => setMortInputs((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                className="w-32 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Monthly Payment" value={fmtUSD(commercialPmt)} sub={`${mortInputs.amort}-yr amortization`} />
            <StatCard label="Annual Debt Service" value={fmtM(commercialPmt * 12)} sub="Used for DSCR calc" />
          </div>
          <InfoBox variant="amber">
            Commercial mortgages are typically <strong>5-year fixed</strong> with 25-year amortization. At year 5, a <strong>balloon payment</strong> is due — borrowers must refinance at prevailing rates, creating significant refinancing risk.
          </InfoBox>
        </div>
      </div>

      {/* CRE Distress Panel */}
      <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-5">
        <SectionTitle><AlertTriangle className="w-4 h-4 text-rose-400" /><span className="text-rose-400">Office Sector Distress — Post-COVID</span></SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { metric: "Avg Office Vacancy (US)", val: "19.2%", note: "vs 8.5% pre-COVID" },
            { metric: "Value Decline (Class B)", val: "35-50%", note: "From 2022 peaks in major CBDs" },
            { metric: "Loans Due 2024-2026", val: "$450B+", note: "Commercial RE loan maturity wall" },
          ].map(({ metric, val, note }) => (
            <div key={metric} className="text-center">
              <div className="text-lg font-medium text-rose-400">{val}</div>
              <div className="text-xs font-medium text-rose-300 mt-1">{metric}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{note}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          Remote/hybrid work structurally reduced office demand. Many owners cannot refinance maturing loans at current values, creating distressed sale opportunities — but also significant credit risk for banks with concentrated office exposure.
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — Development & Value-Add
// ══════════════════════════════════════════════════════════════════════════════

function DevelopmentTab() {
  const [devInputs, setDevInputs] = useState({
    landCost: 500000,
    hardCosts: 1800000,
    softCosts: 360000,
    financingCosts: 180000,
  });

  const [brrrrInputs, setBrrrrInputs] = useState({
    purchasePrice: 220000,
    rehabCost: 45000,
    arv: 320000,
    newLoanLtv: 75,
    newLoanRate: 7.0,
  });

  const totalDevCost = Object.values(devInputs).reduce((a, b) => a + b, 0);
  const devProfit10 = totalDevCost * 0.15;
  const devProfit20 = totalDevCost * 0.2;

  const brrrrCalc = useMemo(() => {
    const { purchasePrice, rehabCost, arv, newLoanLtv, newLoanRate } = brrrrInputs;
    const totalInvested = purchasePrice + rehabCost;
    const newLoanAmount = arv * (newLoanLtv / 100);
    const cashOut = newLoanAmount - totalInvested;
    const equity = arv - newLoanAmount;
    const monthlyPmt = calcMortgage(newLoanAmount, newLoanRate / 100, 30);
    return { totalInvested, newLoanAmount, cashOut, equity, monthlyPmt };
  }, [brrrrInputs]);

  // IRR model for a value-add deal
  const irrFlows = useMemo(() => {
    const equity = 200000;
    const cashFlows = [-equity, 15000, 18000, 22000, 25000, 320000]; // Yr 0–5 (exit yr 5)
    // Simple IRR approximation via Newton-Raphson
    let rate = 0.15;
    for (let iter = 0; iter < 50; iter++) {
      let npv = 0;
      let dnpv = 0;
      for (let i = 0; i < cashFlows.length; i++) {
        npv += cashFlows[i] / Math.pow(1 + rate, i);
        dnpv += (-i * cashFlows[i]) / Math.pow(1 + rate, i + 1);
      }
      rate -= npv / dnpv;
    }
    return { cashFlows, irr: rate * 100 };
  }, []);

  // SVG for dev cost breakdown
  const costBreakdown = [
    { label: "Land", val: devInputs.landCost, color: "#3b82f6" },
    { label: "Hard Costs", val: devInputs.hardCosts, color: "#10b981" },
    { label: "Soft Costs", val: devInputs.softCosts, color: "#f59e0b" },
    { label: "Financing", val: devInputs.financingCosts, color: "#a78bfa" },
  ];
  const totalCost = costBreakdown.reduce((a, b) => a + b.val, 0);
  let cumPct = 0;
  const BAR_W = 400;
  const BAR_H = 28;

  const renos = [
    { item: "Kitchen Remodel", cost: 35000, roi: 80, addedVal: 28000 },
    { item: "Bathroom Remodel", cost: 18000, roi: 75, addedVal: 13500 },
    { item: "New Roof", cost: 12000, roi: 60, addedVal: 7200 },
    { item: "Hardwood Floors", cost: 8000, roi: 85, addedVal: 6800 },
    { item: "Paint (Exterior)", cost: 4500, roi: 110, addedVal: 4950 },
    { item: "Landscaping", cost: 5000, roi: 100, addedVal: 5000 },
    { item: "Garage Door", cost: 2000, roi: 95, addedVal: 1900 },
    { item: "New Windows", cost: 15000, roi: 68, addedVal: 10200 },
    { item: "HVAC Update", cost: 10000, roi: 55, addedVal: 5500 },
    { item: "Cosmetic (Paint/Fixtures)", cost: 6000, roi: 150, addedVal: 9000 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Ground-up Development */}
        <div className="rounded-md border border-border bg-foreground/5 p-5 space-y-4">
          <SectionTitle><Building2 className="w-4 h-4" />Ground-Up Development Costs</SectionTitle>
          {[
            { key: "landCost" as const, label: "Land Cost ($)" },
            { key: "hardCosts" as const, label: "Hard Costs (Construction) ($)" },
            { key: "softCosts" as const, label: "Soft Costs (Arch/Permits) ($)" },
            { key: "financingCosts" as const, label: "Financing Costs ($)" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-xs text-muted-foreground flex-1">{label}</label>
              <input
                type="number"
                value={devInputs[key]}
                step={10000}
                onChange={(e) => setDevInputs((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                className="w-32 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}

          {/* Cost bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Total Development Cost</span>
              <span className="text-foreground font-medium">{fmtM(totalCost)}</span>
            </div>
            <svg viewBox={`0 0 ${BAR_W} ${BAR_H + 20}`} className="w-full">
              {costBreakdown.map((c) => {
                const pct = c.val / totalCost;
                const x = cumPct * BAR_W;
                const w = pct * BAR_W;
                const midX = x + w / 2;
                cumPct += pct;
                return (
                  <g key={c.label}>
                    <rect x={x} y={0} width={w} height={BAR_H} fill={c.color + "cc"} />
                    {w > 40 && <text x={midX} y={BAR_H / 2 + 4} fontSize={8} fill="white" textAnchor="middle">{c.label}</text>}
                    <text x={midX} y={BAR_H + 12} fontSize={7} fill="#9ca3af" textAnchor="middle">{(pct * 100).toFixed(0)}%</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="10% Developer Profit" value={fmtM(devProfit10)} highlight="pos" />
            <StatCard label="20% Developer Profit" value={fmtM(devProfit20)} highlight="pos" />
          </div>
          <InfoBox variant="blue">
            <strong>Timeline</strong>: Permitting (6-18 months) → Construction (12-24 months) → Lease-Up (6-12 months). Total 3-5 year cycle. Soft costs typically 15-20% of hard costs.
          </InfoBox>
        </div>

        {/* BRRRR */}
        <div className="rounded-md border border-border bg-foreground/5 p-5 space-y-4">
          <SectionTitle><RefreshCw className="w-4 h-4" />BRRRR Strategy</SectionTitle>
          <p className="text-xs text-muted-foreground">Buy → Rehab → Rent → Refinance → Repeat</p>
          {[
            { key: "purchasePrice" as const, label: "Purchase Price ($)", step: 5000 },
            { key: "rehabCost" as const, label: "Rehab Cost ($)", step: 5000 },
            { key: "arv" as const, label: "After-Repair Value ($)", step: 5000 },
            { key: "newLoanLtv" as const, label: "Refi LTV (%)", step: 5 },
            { key: "newLoanRate" as const, label: "Refi Rate (%)", step: 0.25 },
          ].map(({ key, label, step }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-xs text-muted-foreground flex-1">{label}</label>
              <input
                type="number"
                value={brrrrInputs[key]}
                step={step}
                onChange={(e) => setBrrrrInputs((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                className="w-32 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Cash Invested" value={fmtM(brrrrCalc.totalInvested)} />
            <StatCard label="New Loan Amount" value={fmtM(brrrrCalc.newLoanAmount)} sub={`${brrrrInputs.newLoanLtv}% of ARV`} />
            <StatCard
              label="Cash Out on Refi"
              value={fmtM(brrrrCalc.cashOut)}
              highlight={brrrrCalc.cashOut > 0 ? "pos" : "neg"}
              sub={brrrrCalc.cashOut > 0 ? "Capital recycled!" : "Short — add equity"}
            />
            <StatCard label="Remaining Equity" value={fmtM(brrrrCalc.equity)} highlight="pos" />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Mortgage Payment</span>
            <span className="text-foreground">{fmtUSD(brrrrCalc.monthlyPmt)}</span>
          </div>
        </div>
      </div>

      {/* Renovation ROI */}
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <SectionTitle><TrendingUp className="w-4 h-4" />Renovation ROI — Which Improvements Add the Most Value</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                <th className="px-3 py-2 text-left">Improvement</th>
                <th className="px-3 py-2 text-right">Cost</th>
                <th className="px-3 py-2 text-right">Value Added</th>
                <th className="px-3 py-2 text-right">ROI</th>
                <th className="px-3 py-2 text-left w-40">Return Bar</th>
              </tr>
            </thead>
            <tbody>
              {renos
                .sort((a, b) => b.roi - a.roi)
                .map((r) => (
                  <tr key={r.item} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 text-muted-foreground">{r.item}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{fmtUSD(r.cost)}</td>
                    <td className="px-3 py-2 text-right text-emerald-400">{fmtUSD(r.addedVal)}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={r.roi >= 100 ? "text-emerald-400 font-medium" : r.roi >= 75 ? "text-amber-400" : "text-rose-400"}>
                        {r.roi}%
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="h-2 rounded-full bg-foreground/10 w-32 overflow-hidden">
                        <div className={cn("h-full rounded-full", r.roi >= 100 ? "bg-emerald-500" : r.roi >= 75 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${Math.min(100, r.roi)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IRR Model */}
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <SectionTitle><BarChart3 className="w-4 h-4" />Value-Add IRR Model</SectionTitle>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {irrFlows.cashFlows.map((cf, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Yr {i}</div>
              <div className={cn("text-sm font-medium", cf < 0 ? "text-rose-400" : "text-emerald-400")}>{fmtM(cf)}</div>
              <div className="text-xs text-muted-foreground">{i === 0 ? "Equity In" : i === 5 ? "Exit + CF" : "Cash Flow"}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-3 text-center">
          <span className="text-emerald-400 text-lg font-medium">{irrFlows.irr.toFixed(1)}% IRR</span>
          <span className="text-muted-foreground text-sm ml-2">on $200K equity with 5-year hold</span>
        </div>
        <InfoBox variant="blue">
          <strong>IRR</strong> (Internal Rate of Return) is the annualized return that makes NPV = 0. Value-add targets: 12-18% IRR. Opportunistic: 18%+ IRR. Core: 7-10% IRR.
        </InfoBox>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 6 — Portfolio Strategy
// ══════════════════════════════════════════════════════════════════════════════

interface RiskReturnPoint {
  strategy: string;
  expectedReturn: number;
  risk: number;
  color: string;
  description: string;
}

const STRATEGIES: RiskReturnPoint[] = [
  { strategy: "Core", expectedReturn: 7, risk: 10, color: "#3b82f6", description: "Trophy assets, low vacancy, stable income. Pension fund grade." },
  { strategy: "Core-Plus", expectedReturn: 10, risk: 14, color: "#10b981", description: "Quality assets with minor lease-up or renovation upside." },
  { strategy: "Value-Add", expectedReturn: 14, risk: 20, color: "#f59e0b", description: "Below-market rents, deferred maintenance. 12-18% IRR target." },
  { strategy: "Opportunistic", expectedReturn: 20, risk: 28, color: "#ef4444", description: "Development, distressed, complex. 18%+ IRR. High leverage." },
  { strategy: "Debt/Mezz", expectedReturn: 9, risk: 8, color: "#a78bfa", description: "Real estate lending. Senior debt 6-8%, mezz 10-14%." },
];

const SECTORS_ALLOC = [
  { name: "Residential", pct: 35, color: "#3b82f6" },
  { name: "Industrial", pct: 25, color: "#10b981" },
  { name: "Commercial", pct: 15, color: "#f59e0b" },
  { name: "Retail", pct: 10, color: "#f97316" },
  { name: "Healthcare", pct: 8, color: "#a78bfa" },
  { name: "Specialty", pct: 7, color: "#06b6d4" },
];

function PortfolioStrategy() {
  const [ltv, setLtv] = useState(60);

  const leverageCalc = useMemo(() => {
    const propertyVal = 1_000_000;
    const equity = propertyVal * (1 - ltv / 100);
    const loan = propertyVal * (ltv / 100);
    const noi = 55_000;
    const mortgageRate = 0.07;
    const interestCost = loan * mortgageRate;
    const cashFlow = noi - interestCost;
    const coc = (cashFlow / equity) * 100;
    const capRate = (noi / propertyVal) * 100;
    return { equity, loan, noi, interestCost, cashFlow, coc, capRate };
  }, [ltv]);

  // Risk-return scatter
  const W4 = 380;
  const H4 = 200;
  const P4 = { t: 20, r: 20, b: 30, l: 50 };
  const cw4 = W4 - P4.l - P4.r;
  const ch4 = H4 - P4.t - P4.b;
  const maxRisk = 32;
  const maxRet = 24;

  const xS = (risk: number) => P4.l + (risk / maxRisk) * cw4;
  const yS = (ret: number) => P4.t + ch4 - (ret / maxRet) * ch4;

  // Donut chart for sector alloc
  const DONUT_R = 55;
  const DONUT_IR = 35;
  const DONUT_CX = 80;
  const DONUT_CY = 80;
  let angle = -Math.PI / 2;
  const slices = SECTORS_ALLOC.map((s) => {
    const startA = angle;
    const sweep = (s.pct / 100) * 2 * Math.PI;
    angle += sweep;
    const endA = angle;
    const x1 = DONUT_CX + DONUT_R * Math.cos(startA);
    const y1 = DONUT_CY + DONUT_R * Math.sin(startA);
    const x2 = DONUT_CX + DONUT_R * Math.cos(endA);
    const y2 = DONUT_CY + DONUT_R * Math.sin(endA);
    const xi1 = DONUT_CX + DONUT_IR * Math.cos(startA);
    const yi1 = DONUT_CY + DONUT_IR * Math.sin(startA);
    const xi2 = DONUT_CX + DONUT_IR * Math.cos(endA);
    const yi2 = DONUT_CY + DONUT_IR * Math.sin(endA);
    const largeArc = sweep > Math.PI ? 1 : 0;
    return { ...s, path: `M${xi1},${yi1} L${x1},${y1} A${DONUT_R},${DONUT_R} 0 ${largeArc},1 ${x2},${y2} L${xi2},${yi2} A${DONUT_IR},${DONUT_IR} 0 ${largeArc},0 ${xi1},${yi1} Z` };
  });

  return (
    <div className="space-y-4">
      {/* Risk-return + allocation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Risk-return scatter */}
        <div className="rounded-md border border-border bg-foreground/5 p-5">
          <SectionTitle><BarChart3 className="w-4 h-4" />Core → Opportunistic Risk/Return</SectionTitle>
          <svg viewBox={`0 0 ${W4} ${H4}`} className="w-full">
            {[0, 5, 10, 15, 20].map((r) => (
              <line key={r} x1={P4.l} y1={yS(r)} x2={W4 - P4.r} y2={yS(r)} stroke="#ffffff10" strokeDasharray="3,3" />
            ))}
            {[0, 8, 16, 24, 32].map((r) => (
              <line key={r} x1={xS(r)} y1={P4.t} x2={xS(r)} y2={H4 - P4.b} stroke="#ffffff10" strokeDasharray="3,3" />
            ))}
            {[0, 10, 20].map((r) => (
              <text key={r} x={P4.l - 4} y={yS(r) + 4} fontSize={8} fill="#6b7280" textAnchor="end">{r}%</text>
            ))}
            {[0, 16, 32].map((r) => (
              <text key={r} x={xS(r)} y={H4 - 4} fontSize={8} fill="#6b7280" textAnchor="middle">{r}%</text>
            ))}
            <text x={P4.l - 28} y={P4.t + ch4 / 2} fontSize={8} fill="#6b7280" textAnchor="middle" transform={`rotate(-90, ${P4.l - 28}, ${P4.t + ch4 / 2})`}>Return</text>
            <text x={P4.l + cw4 / 2} y={H4 + 2} fontSize={8} fill="#6b7280" textAnchor="middle">Risk (Std Dev)</text>
            {/* Efficient frontier hint */}
            <path d={`M${xS(8)},${yS(9)} Q${xS(18)},${yS(13)} ${xS(28)},${yS(20)}`} fill="none" stroke="#ffffff15" strokeWidth={1.5} strokeDasharray="4,4" />
            {STRATEGIES.map((pt) => (
              <g key={pt.strategy}>
                <circle cx={xS(pt.risk)} cy={yS(pt.expectedReturn)} r={7} fill={pt.color + "90"} stroke={pt.color} strokeWidth={1.5} />
                <text x={xS(pt.risk)} y={yS(pt.expectedReturn) - 10} fontSize={8} fill={pt.color} textAnchor="middle">{pt.strategy}</text>
              </g>
            ))}
          </svg>
          <div className="mt-2 space-y-1">
            {STRATEGIES.map((s) => (
              <div key={s.strategy} className="text-xs text-muted-foreground flex gap-2">
                <span className="font-medium w-24 shrink-0" style={{ color: s.color }}>{s.strategy}</span>
                <span className="text-muted-foreground">{s.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector allocation donut */}
        <div className="rounded-md border border-border bg-foreground/5 p-5">
          <SectionTitle><Layers className="w-4 h-4" />Recommended Sector Allocation</SectionTitle>
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 160 160" className="w-36 h-36 shrink-0">
              {slices.map((s) => (
                <path key={s.name} d={s.path} fill={s.color} opacity={0.85} />
              ))}
              <text x={DONUT_CX} y={DONUT_CY - 4} fontSize={9} fill="#9ca3af" textAnchor="middle">Allocation</text>
              <text x={DONUT_CX} y={DONUT_CY + 8} fontSize={8} fill="#6b7280" textAnchor="middle">by Sector</text>
            </svg>
            <div className="space-y-1.5 flex-1">
              {SECTORS_ALLOC.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-muted-foreground flex-1">{s.name}</span>
                  <div className="h-1.5 rounded-full bg-foreground/10 w-20 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leverage effects */}
      <div className="rounded-md border border-border bg-foreground/5 p-5 space-y-4">
        <SectionTitle><Percent className="w-4 h-4" />Leverage Effects on Returns</SectionTitle>
        <div className="flex items-center gap-4 mb-2">
          <label className="text-xs text-muted-foreground w-24">LTV: {ltv}%</label>
          <input type="range" min={0} max={90} step={5} value={ltv} onChange={(e) => setLtv(parseInt(e.target.value))} className="flex-1 accent-blue-500" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Equity Required" value={fmtM(leverageCalc.equity)} sub={`${100 - ltv}% of $1M property`} />
          <StatCard label="Cap Rate" value={fmtPct(leverageCalc.capRate)} sub="Unlevered" />
          <StatCard label="Cash-on-Cash" value={fmtPct(leverageCalc.coc)} highlight={leverageCalc.coc > leverageCalc.capRate ? "pos" : "neg"} sub="Levered return" />
          <StatCard label="Annual Cash Flow" value={fmtM(leverageCalc.cashFlow)} highlight={leverageCalc.cashFlow >= 0 ? "pos" : "neg"} />
        </div>
        <InfoBox variant={ltv > 75 ? "amber" : "blue"}>
          {ltv === 0
            ? "No leverage — pure equity play. Cash-on-cash equals cap rate. Lowest risk, lowest return amplification."
            : ltv <= 60
            ? `At ${ltv}% LTV, leverage is working positively — cash-on-cash (${fmtPct(leverageCalc.coc)}) exceeds cap rate (${fmtPct(leverageCalc.capRate)}). Conservative and lender-friendly.`
            : ltv <= 75
            ? `At ${ltv}% LTV, leverage is significant. Cash-on-cash amplified but DSCR may be thin at current cap rates. Monitor interest coverage.`
            : `WARNING: At ${ltv}% LTV, you are highly leveraged. A small NOI decline or rate increase can turn cash flow negative. Refinancing risk is elevated.`}
        </InfoBox>

        {/* LTV comparison bars */}
        <div className="space-y-2">
          {[0, 30, 50, 70, 80].map((ltvTest) => {
            const eq = 1_000_000 * (1 - ltvTest / 100);
            const int = 1_000_000 * (ltvTest / 100) * 0.07;
            const cf = 55_000 - int;
            const coc = eq > 0 ? (cf / eq) * 100 : 0;
            return (
              <div key={ltvTest} className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="text-muted-foreground w-14">{ltvTest}% LTV</span>
                <div className="flex-1 h-4 rounded-full bg-foreground/10 overflow-hidden relative">
                  <div className={cn("absolute inset-y-0 left-0 rounded-full transition-all", coc > 5.5 ? "bg-emerald-500/60" : coc >= 0 ? "bg-amber-500/60" : "bg-rose-500/60")} style={{ width: `${Math.max(0, Math.min(100, coc * 5))}%` }} />
                </div>
                <span className={cn("w-16 text-right font-medium", coc > 5.5 ? "text-emerald-400" : coc >= 0 ? "text-amber-400" : "text-rose-400")}>{fmtPct(coc)} CoC</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1031 + Portfolio diversification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border border-border bg-foreground/5 p-4 space-y-2">
          <SectionTitle><RefreshCw className="w-4 h-4" />1031 Exchange</SectionTitle>
          {[
            { rule: "45 Days", desc: "To identify replacement properties after closing" },
            { rule: "180 Days", desc: "To close on replacement property" },
            { rule: "Like-Kind", desc: "Any US real property for any US real property" },
            { rule: "Boot", desc: "Cash received in exchange is taxable" },
            { rule: "Qualified Intermediary", desc: "Must hold funds; seller cannot touch proceeds" },
            { rule: "Tax Deferred", desc: "Not tax-free — basis carries over to new property" },
          ].map(({ rule, desc }) => (
            <div key={rule} className="flex gap-3 text-xs text-muted-foreground">
              <span className="font-medium text-primary w-28 shrink-0">{rule}</span>
              <span className="text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-border bg-foreground/5 p-4 space-y-2">
          <SectionTitle><MapPin className="w-4 h-4" />Geographic Diversification</SectionTitle>
          {[
            { pct: "1 Market", risk: "Extreme concentration risk — local recession wipes portfolio" },
            { pct: "3-5 Markets", risk: "Moderate concentration — some protection from local shocks" },
            { pct: "10+ Markets", risk: "Well diversified — national economic sensitivity dominates" },
          ].map(({ pct, risk }) => (
            <div key={pct} className="flex gap-3 text-xs text-muted-foreground">
              <span className="font-medium text-amber-400 w-24 shrink-0">{pct}</span>
              <span className="text-muted-foreground">{risk}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-border space-y-1 text-xs text-muted-foreground">
            <p><strong className="text-foreground">Portfolio allocation target:</strong> Real estate 10-20% of total portfolio for most investors.</p>
            <p>Real estate correlation with equities is low (~0.15) over long periods, providing genuine diversification benefit.</p>
            <p><strong className="text-foreground">Concentration risk:</strong> Single-family investors often have 80%+ of net worth in one property — opposite of diversification.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: "analyzer", label: "Property Analyzer", icon: <Calculator className="w-4 h-4" /> },
  { id: "markets", label: "Market Comparisons", icon: <MapPin className="w-4 h-4" /> },
  { id: "reits", label: "REIT Analysis", icon: <Building2 className="w-4 h-4" /> },
  { id: "commercial", label: "Commercial RE", icon: <Layers className="w-4 h-4" /> },
  { id: "development", label: "Development", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "portfolio", label: "Portfolio Strategy", icon: <BarChart3 className="w-4 h-4" /> },
];

export default function RealEstatePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="rounded-md bg-primary/20 p-2.5">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-lg font-medium text-foreground">Real Estate Investment Analysis</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-14">
              Property analyzer, market comparisons, REITs, commercial RE, development, and portfolio strategy.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Residential", color: "bg-primary/20 text-primary" },
              { label: "Commercial", color: "bg-emerald-600/20 text-emerald-400" },
              { label: "REITs", color: "bg-orange-600/20 text-orange-400" },
            ].map(({ label, color }) => (
              <Badge key={label} className={cn("text-xs text-muted-foreground font-medium border-0", color)}>
                {label}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="analyzer" className="space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-foreground/5 p-1 rounded-md border border-border">
            {TABS.map(({ id, label, icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors"
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="analyzer" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <PropertyAnalyzer />
            </motion.div>
          </TabsContent>

          <TabsContent value="markets" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <MarketComparisons />
            </motion.div>
          </TabsContent>

          <TabsContent value="reits" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <REITAnalysis />
            </motion.div>
          </TabsContent>

          <TabsContent value="commercial" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <CommercialRE />
            </motion.div>
          </TabsContent>

          <TabsContent value="development" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <DevelopmentTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <PortfolioStrategy />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
