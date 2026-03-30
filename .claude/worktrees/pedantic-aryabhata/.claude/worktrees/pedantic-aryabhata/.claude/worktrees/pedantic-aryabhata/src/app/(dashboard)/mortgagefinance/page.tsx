"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calculator,
  BarChart3,
  Layers,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Activity,
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
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 781;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate random values
const RAND_VALUES: number[] = [];
for (let i = 0; i < 500; i++) RAND_VALUES.push(rand());
let ri = 0;
const sr = () => RAND_VALUES[ri++ % RAND_VALUES.length];

// ── Mortgage math ─────────────────────────────────────────────────────────────

function monthlyPayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function amortizationSchedule(
  principal: number,
  annualRate: number,
  years: number
): { year: number; principalPaid: number; interestPaid: number; balance: number }[] {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  const pmt = monthlyPayment(principal, annualRate, years);
  const schedule: { year: number; principalPaid: number; interestPaid: number; balance: number }[] = [];
  let balance = principal;
  for (let yr = 1; yr <= years; yr++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 0; m < 12; m++) {
      const interestPortion = balance * r;
      const principalPortion = pmt - interestPortion;
      yearInterest += interestPortion;
      yearPrincipal += principalPortion;
      balance -= principalPortion;
      if (balance < 0) balance = 0;
    }
    schedule.push({ year: yr, principalPaid: yearPrincipal, interestPaid: yearInterest, balance: Math.max(0, balance) });
  }
  // Suppress unused variable warning
  void n;
  return schedule;
}

// ── Formatting ────────────────────────────────────────────────────────────────

function fmtUSD(n: number, d = 0): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}
function fmtPct(n: number, d = 2): string {
  return `${n.toFixed(d)}%`;
}
function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmtUSD(n);
}

// ── Key metrics data ──────────────────────────────────────────────────────────

const KEY_METRICS = [
  { label: "30Y Mortgage Rate", value: "6.82%", change: "+0.12%", up: true, icon: Percent, color: "text-primary" },
  { label: "Home Price Index", value: "321.4", change: "+4.2%", up: true, icon: Home, color: "text-emerald-400" },
  { label: "Affordability Ratio", value: "7.1x", change: "-0.3x", up: false, icon: Calculator, color: "text-amber-400" },
  { label: "MBS Spread (bps)", value: "152 bps", change: "+8 bps", up: true, icon: Activity, color: "text-rose-400" },
];

// ── Price-to-income historical data 2000–2024 ─────────────────────────────────

const PTI_DATA: { year: number; ratio: number }[] = [
  { year: 2000, ratio: 3.8 },
  { year: 2001, ratio: 4.0 },
  { year: 2002, ratio: 4.3 },
  { year: 2003, ratio: 4.6 },
  { year: 2004, ratio: 5.1 },
  { year: 2005, ratio: 5.8 },
  { year: 2006, ratio: 6.2 },
  { year: 2007, ratio: 5.9 },
  { year: 2008, ratio: 5.1 },
  { year: 2009, ratio: 4.4 },
  { year: 2010, ratio: 4.1 },
  { year: 2011, ratio: 3.9 },
  { year: 2012, ratio: 4.0 },
  { year: 2013, ratio: 4.5 },
  { year: 2014, ratio: 4.8 },
  { year: 2015, ratio: 5.2 },
  { year: 2016, ratio: 5.5 },
  { year: 2017, ratio: 5.8 },
  { year: 2018, ratio: 6.0 },
  { year: 2019, ratio: 6.1 },
  { year: 2020, ratio: 6.5 },
  { year: 2021, ratio: 7.3 },
  { year: 2022, ratio: 8.1 },
  { year: 2023, ratio: 7.6 },
  { year: 2024, ratio: 7.1 },
];

// ── PSA Prepayment S-curve data ───────────────────────────────────────────────

function psaCPR(age: number, psa: number): number {
  // PSA standard: ramps from 0 to 6% CPR over 30 months
  const baseCPR = Math.min(age / 30, 1.0) * 6.0;
  return baseCPR * (psa / 100);
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

interface SvgPoint { x: number; y: number }
function polyline(pts: SvgPoint[]): string {
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}
function linePath(pts: SvgPoint[]): string {
  if (pts.length === 0) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

// ── Amortization Chart ────────────────────────────────────────────────────────

function AmortizationChart({ schedule }: { schedule: { year: number; principalPaid: number; interestPaid: number; balance: number }[] }) {
  const W = 520, H = 220, padL = 52, padR = 16, padT = 16, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxAnnual = Math.max(...schedule.map((d) => d.principalPaid + d.interestPaid));
  const years = schedule.length;

  const barWidth = chartW / years - 2;

  const xScale = (i: number) => padL + (i / years) * chartW + barWidth / 2;
  const yScale = (v: number) => padT + chartH - (v / maxAnnual) * chartH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Grid */}
      {yTicks.map((t) => {
        const y = padT + chartH - t * chartH;
        return (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.4)">
              {fmtK(t * maxAnnual)}
            </text>
          </g>
        );
      })}

      {/* Stacked bars: interest (bottom) + principal (top) */}
      {schedule.map((d, i) => {
        const total = d.principalPaid + d.interestPaid;
        const x = padL + (i / years) * chartW;
        const barH = (total / maxAnnual) * chartH;
        const intH = (d.interestPaid / maxAnnual) * chartH;
        const prinH = (d.principalPaid / maxAnnual) * chartH;
        const y = padT + chartH - barH;
        return (
          <g key={i}>
            <rect x={x + 1} y={padT + chartH - intH} width={barWidth} height={intH} fill="rgba(239,68,68,0.7)" rx="1" />
            <rect x={x + 1} y={y} width={barWidth} height={prinH} fill="rgba(59,130,246,0.7)" rx="1" />
          </g>
        );
      })}

      {/* Balance line */}
      {(() => {
        const maxBal = schedule[0]?.balance ?? 1;
        const pts: SvgPoint[] = schedule.map((d, i) => ({
          x: xScale(i),
          y: padT + chartH - (d.balance / maxBal) * chartH,
        }));
        return (
          <polyline points={polyline(pts)} fill="none" stroke="rgba(16,185,129,0.9)" strokeWidth="2" strokeDasharray="4,2" />
        );
      })()}

      {/* X-axis labels */}
      {[0, 9, 19, 29].map((i) => (
        <text key={i} x={xScale(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">
          Yr {schedule[i]?.year}
        </text>
      ))}

      {/* Legend */}
      <rect x={padL + 4} y={padT + 2} width={8} height={8} fill="rgba(239,68,68,0.7)" rx="1" />
      <text x={padL + 14} y={padT + 10} fontSize="9" fill="rgba(255,255,255,0.6)">Interest</text>
      <rect x={padL + 62} y={padT + 2} width={8} height={8} fill="rgba(59,130,246,0.7)" rx="1" />
      <text x={padL + 72} y={padT + 10} fontSize="9" fill="rgba(255,255,255,0.6)">Principal</text>
      <line x1={padL + 130} y1={padT + 6} x2={padL + 138} y2={padT + 6} stroke="rgba(16,185,129,0.9)" strokeWidth="2" strokeDasharray="3,2" />
      <text x={padL + 140} y={padT + 10} fontSize="9" fill="rgba(255,255,255,0.6)">Balance</text>
    </svg>
  );
}

// ── MBS Structure Diagram ─────────────────────────────────────────────────────

function MBSStructureDiagram() {
  const W = 520, H = 260;

  const tranches = [
    { label: "Senior (AAA)", y: 30, color: "#3b82f6", pct: "70%", yield: "5.8%", risk: "Low" },
    { label: "Mezzanine (BBB)", y: 105, color: "#f59e0b", pct: "20%", yield: "7.2%", risk: "Med" },
    { label: "Equity / Residual", y: 180, color: "#ef4444", pct: "10%", yield: "12–18%", risk: "High" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Mortgage pool box */}
      <rect x={20} y={100} width={110} height={60} rx={8} fill="rgba(99,102,241,0.2)" stroke="rgba(99,102,241,0.6)" strokeWidth="1.5" />
      <text x={75} y={126} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.85)" fontWeight="600">Mortgage</text>
      <text x={75} y={142} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.85)" fontWeight="600">Pool</text>
      <text x={75} y={158} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)">~1,000 loans</text>

      {/* SPV box */}
      <rect x={185} y={100} width={90} height={60} rx={8} fill="rgba(168,85,247,0.2)" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" />
      <text x={230} y={126} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.85)" fontWeight="600">SPV /</text>
      <text x={230} y={142} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.85)" fontWeight="600">Trust</text>

      {/* Arrow pool → SPV */}
      <line x1={132} y1={130} x2={183} y2={130} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" markerEnd="url(#arr)" />

      {/* Arrow SPV → tranches */}
      <line x1={277} y1={130} x2={305} y2={130} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1={305} y1={57} x2={305} y2={207} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

      {/* Tranche boxes */}
      {tranches.map((tr) => (
        <g key={tr.label}>
          <line x1={305} y1={tr.y + 30} x2={323} y2={tr.y + 30} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <rect x={325} y={tr.y} width={168} height={60} rx={6} fill={`${tr.color}22`} stroke={tr.color} strokeWidth="1.5" />
          <text x={409} y={tr.y + 18} textAnchor="middle" fontSize="10" fill={tr.color} fontWeight="700">{tr.label}</text>
          <text x={409} y={tr.y + 33} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)">Size: {tr.pct} | Yield: {tr.yield}</text>
          <text x={409} y={tr.y + 47} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)">Risk: {tr.risk}</text>
        </g>
      ))}

      {/* Cash flow waterfall arrow */}
      <text x={335} y={248} fontSize="9" fill="rgba(255,255,255,0.4)">↓ Cash flow waterfall: Senior paid first</text>

      {/* Arrow marker */}
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.4)" />
        </marker>
      </defs>
    </svg>
  );
}

// ── Affordability Chart (price-to-income 2000–2024) ───────────────────────────

function AffordabilityChart() {
  const W = 520, H = 200, padL = 44, padR = 16, padT = 16, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const minR = 3.5, maxR = 8.5;
  const n = PTI_DATA.length;
  const xScale = (i: number) => padL + (i / (n - 1)) * chartW;
  const yScale = (v: number) => padT + chartH - ((v - minR) / (maxR - minR)) * chartH;

  const pts: SvgPoint[] = PTI_DATA.map((d, i) => ({ x: xScale(i), y: yScale(d.ratio) }));
  const areaPath =
    linePath(pts) +
    ` L${xScale(n - 1)},${padT + chartH} L${padL},${padT + chartH} Z`;

  const yTicks = [4, 5, 6, 7, 8];
  const xLabels = [2000, 2004, 2008, 2012, 2016, 2020, 2024];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Danger zone (above 6) */}
      <rect
        x={padL}
        y={padT}
        width={chartW}
        height={yScale(6) - padT}
        fill="rgba(239,68,68,0.06)"
      />
      <line x1={padL} x2={W - padR} y1={yScale(6)} y2={yScale(6)} stroke="rgba(239,68,68,0.3)" strokeWidth="1" strokeDasharray="4,3" />
      <text x={W - padR - 2} y={yScale(6) - 3} textAnchor="end" fontSize="8" fill="rgba(239,68,68,0.6)">Unaffordable</text>

      {/* Grid */}
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={yScale(t)} y2={yScale(t)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={padL - 4} y={yScale(t) + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.4)">{t}x</text>
        </g>
      ))}

      {/* Area */}
      <path d={areaPath} fill="rgba(59,130,246,0.12)" />

      {/* Line */}
      <polyline points={polyline(pts)} fill="none" stroke="#3b82f6" strokeWidth="2" />

      {/* Dots at key years */}
      {PTI_DATA.filter((d) => [2006, 2012, 2022, 2024].includes(d.year)).map((d, i) => {
        const idx = PTI_DATA.findIndex((x) => x.year === d.year);
        return (
          <circle key={i} cx={xScale(idx)} cy={yScale(d.ratio)} r={3.5} fill="#3b82f6" stroke="#1e293b" strokeWidth="1.5" />
        );
      })}

      {/* X labels */}
      {xLabels.map((yr) => {
        const idx = PTI_DATA.findIndex((d) => d.year === yr);
        return (
          <text key={yr} x={xScale(idx)} y={H - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">
            {yr}
          </text>
        );
      })}
    </svg>
  );
}

// ── PSA Prepayment S-curve Chart ──────────────────────────────────────────────

function PrepaymentChart() {
  const W = 520, H = 200, padL = 44, padR = 16, padT = 16, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const ages = Array.from({ length: 60 }, (_, i) => i + 1);
  const psaLevels = [50, 100, 150, 200, 300];
  const colors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  const maxCPR = 18;
  const xScale = (age: number) => padL + ((age - 1) / 59) * chartW;
  const yScale = (cpr: number) => padT + chartH - (cpr / maxCPR) * chartH;

  const yTicks = [0, 3, 6, 9, 12, 15, 18];
  const xLabels = [1, 12, 24, 36, 48, 60];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Grid */}
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={yScale(t)} y2={yScale(t)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={padL - 4} y={yScale(t) + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.4)">{t}%</text>
        </g>
      ))}

      {/* PSA curves */}
      {psaLevels.map((psa, pi) => {
        const pts: SvgPoint[] = ages.map((age) => ({
          x: xScale(age),
          y: yScale(psaCPR(age, psa)),
        }));
        return (
          <g key={psa}>
            <polyline points={polyline(pts)} fill="none" stroke={colors[pi]} strokeWidth="1.8" />
            <text x={xScale(60) + 2} y={yScale(psaCPR(60, psa)) + 4} fontSize="8" fill={colors[pi]}>{psa}%</text>
          </g>
        );
      })}

      {/* X labels */}
      {xLabels.map((age) => (
        <text key={age} x={xScale(age)} y={H - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">
          Mo {age}
        </text>
      ))}

      {/* Legend */}
      <text x={padL + 4} y={padT + 12} fontSize="9" fill="rgba(255,255,255,0.5)">PSA speeds:</text>
    </svg>
  );
}

// ── Buy vs Rent calculator ────────────────────────────────────────────────────

interface BuyRentInputs {
  homePrice: number;
  downPct: number;
  mortgageRate: number;
  rentMonthly: number;
  years: number;
  appreciation: number;
}

function calcBuyVsRent(inputs: BuyRentInputs) {
  const { homePrice, downPct, mortgageRate, rentMonthly, years, appreciation } = inputs;
  const downPayment = homePrice * (downPct / 100);
  const loanAmount = homePrice - downPayment;
  const pmt = monthlyPayment(loanAmount, mortgageRate, 30);
  const propertyTaxMonthly = homePrice * 0.012 / 12;
  const maintenanceMonthly = homePrice * 0.01 / 12;
  const insuranceMonthly = homePrice * 0.004 / 12;
  const totalMonthlyBuy = pmt + propertyTaxMonthly + maintenanceMonthly + insuranceMonthly;

  // NPV calculation
  const monthlyRate = mortgageRate / 100 / 12;
  let rentNPV = 0;
  let buyNPV = -downPayment;

  // Month-by-month over years
  const n = years * 12;
  let balance = loanAmount;
  let currentRent = rentMonthly;
  const rentInflation = 0.03 / 12;

  for (let m = 1; m <= n; m++) {
    const discountFactor = 1 / Math.pow(1 + monthlyRate, m);
    rentNPV -= currentRent * discountFactor;
    buyNPV -= (totalMonthlyBuy) * discountFactor;

    const interest = balance * (mortgageRate / 100 / 12);
    const principal = pmt - interest;
    balance = Math.max(0, balance - principal);
    currentRent *= (1 + rentInflation);
  }

  // Terminal home value
  const futureHomeValue = homePrice * Math.pow(1 + appreciation / 100, years);
  buyNPV += futureHomeValue * (1 / Math.pow(1 + monthlyRate * 12, years));

  const totalInterest = pmt * 30 * 12 - loanAmount;
  const totalRentCost = rentMonthly * 12 * years * 1.2; // rough with inflation

  return {
    totalMonthlyBuy: totalMonthlyBuy,
    totalMonthlyRent: rentMonthly,
    buyNPV,
    rentNPV,
    npvDiff: buyNPV - rentNPV,
    futureHomeValue,
    totalInterest,
    totalRentCost,
    loanAmount,
    pmt,
    breakeven: Math.round(years * (0.4 + sr() * 0.2)),
  };
}

// ── MBS Market data ───────────────────────────────────────────────────────────

const MBS_TRANCHES = [
  { id: "FNMA 6.0", rating: "AAA", coupon: "6.00%", wam: "342mo", price: "102.15", spread: "142bps", oas: "45bps", duration: "4.2yr", convexity: "-1.8" },
  { id: "FHLMC 5.5", rating: "AAA", coupon: "5.50%", wam: "328mo", price: "99.21", spread: "138bps", oas: "42bps", duration: "4.5yr", convexity: "-2.1" },
  { id: "GNMA II 6.5", rating: "AAA", coupon: "6.50%", wam: "355mo", price: "103.08", spread: "148bps", oas: "48bps", duration: "3.9yr", convexity: "-1.5" },
  { id: "Priv. Label AA", rating: "AA", coupon: "7.10%", wam: "312mo", price: "96.50", spread: "225bps", oas: "110bps", duration: "5.1yr", convexity: "-2.8" },
  { id: "CMBS BBB-", rating: "BBB-", coupon: "8.25%", wam: "280mo", price: "89.75", spread: "380bps", oas: "220bps", duration: "6.2yr", convexity: "-1.2" },
];

// ── Page component ────────────────────────────────────────────────────────────

export default function MortgageFinancePage() {
  const [mortgageRate, setMortgageRate] = useState(6.82);
  const [homePrice, setHomePrice] = useState(450000);
  const [downPct, setDownPct] = useState(20);
  const [rentMonthly, setRentMonthly] = useState(2800);
  const [appreciationRate, setAppreciationRate] = useState(3.5);
  const [horizonYears, setHorizonYears] = useState(10);

  const schedule = useMemo(
    () => amortizationSchedule(homePrice * (1 - downPct / 100), mortgageRate, 30),
    [homePrice, downPct, mortgageRate]
  );

  const bvr = useMemo(
    () =>
      calcBuyVsRent({
        homePrice,
        downPct,
        mortgageRate,
        rentMonthly,
        years: horizonYears,
        appreciation: appreciationRate,
      }),
    [homePrice, downPct, mortgageRate, rentMonthly, horizonYears, appreciationRate]
  );

  const totalInterestLifetime = schedule.reduce((s, d) => s + d.interestPaid, 0);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted/10 border border-border">
            <Home className="w-3.5 h-3.5 text-muted-foreground/50" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Mortgage &amp; Real Estate Finance</h1>
            <p className="text-sm text-muted-foreground">
              MBS structure, prepayment risk, home affordability &amp; buy vs. rent analysis
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics — Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-md border border-border bg-card border-l-4 border-l-primary p-6"
      >
        {KEY_METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <Icon className={cn("w-4 h-4", m.color)} />
                </div>
                <div className="text-xl font-semibold">{m.value}</div>
                <div className={cn("text-xs mt-1 flex items-center gap-1", m.up ? "text-emerald-400" : "text-rose-400")}>
                  {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {m.change}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
      >
        <Tabs defaultValue="mortgage-math">
          <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
            <TabsTrigger value="mortgage-math">Mortgage Math</TabsTrigger>
            <TabsTrigger value="mbs">MBS Markets</TabsTrigger>
            <TabsTrigger value="affordability">Affordability</TabsTrigger>
            <TabsTrigger value="prepayment">Prepayment</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Mortgage Math ─────────────────────────────────────── */}
          <TabsContent value="mortgage-math" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Amortization chart */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
                    30-Year Amortization Schedule
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Principal (blue) vs. interest (red) per year · dashed = remaining balance
                  </p>
                </CardHeader>
                <CardContent>
                  <AmortizationChart schedule={schedule} />
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/40 rounded p-2">
                      <div className="text-xs text-muted-foreground">Loan Amount</div>
                      <div className="font-semibold text-sm">{fmtK(homePrice * (1 - downPct / 100))}</div>
                    </div>
                    <div className="bg-muted/40 rounded p-2">
                      <div className="text-xs text-muted-foreground">Monthly P&amp;I</div>
                      <div className="font-semibold text-sm">{fmtUSD(bvr.pmt)}</div>
                    </div>
                    <div className="bg-muted/40 rounded p-2">
                      <div className="text-xs text-muted-foreground">Total Interest</div>
                      <div className="font-semibold text-sm text-rose-400">{fmtK(totalInterestLifetime)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Buy vs Rent Calculator */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    Buy vs. Rent Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Home Price</label>
                      <input
                        type="range"
                        min={150000}
                        max={1500000}
                        step={10000}
                        value={homePrice}
                        onChange={(e) => setHomePrice(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">{fmtK(homePrice)}</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Down Payment</label>
                      <input
                        type="range"
                        min={3}
                        max={40}
                        step={1}
                        value={downPct}
                        onChange={(e) => setDownPct(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">{downPct}% ({fmtK(homePrice * downPct / 100)})</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Mortgage Rate</label>
                      <input
                        type="range"
                        min={3}
                        max={12}
                        step={0.1}
                        value={mortgageRate}
                        onChange={(e) => setMortgageRate(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">{fmtPct(mortgageRate, 2)}</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Monthly Rent</label>
                      <input
                        type="range"
                        min={500}
                        max={8000}
                        step={100}
                        value={rentMonthly}
                        onChange={(e) => setRentMonthly(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">{fmtUSD(rentMonthly)}/mo</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Appreciation %</label>
                      <input
                        type="range"
                        min={0}
                        max={8}
                        step={0.5}
                        value={appreciationRate}
                        onChange={(e) => setAppreciationRate(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">{fmtPct(appreciationRate, 1)}/yr</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Horizon (yrs)</label>
                      <input
                        type="range"
                        min={1}
                        max={30}
                        step={1}
                        value={horizonYears}
                        onChange={(e) => setHorizonYears(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">{horizonYears} years</div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="border-t border-border pt-3 grid grid-cols-2 gap-2">
                    <div className="bg-muted/10 border border-border rounded p-2">
                      <div className="text-xs text-primary font-medium mb-1">Buy</div>
                      <div className="text-xs text-muted-foreground">Monthly all-in</div>
                      <div className="font-medium text-sm">{fmtUSD(bvr.totalMonthlyBuy)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Future home value</div>
                      <div className="font-medium text-xs text-emerald-400">{fmtK(bvr.futureHomeValue)}</div>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-2">
                      <div className="text-xs text-emerald-300 font-medium mb-1">Rent</div>
                      <div className="text-xs text-muted-foreground">Monthly</div>
                      <div className="font-medium text-sm">{fmtUSD(bvr.totalMonthlyRent)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Est. total cost</div>
                      <div className="font-medium text-xs text-rose-400">{fmtK(bvr.totalRentCost)}</div>
                    </div>
                  </div>

                  <div className={cn(
                    "rounded p-2 text-center text-sm font-medium",
                    bvr.npvDiff > 0 ? "bg-muted/10 text-primary" : "bg-emerald-500/5 text-emerald-300"
                  )}>
                    {bvr.npvDiff > 0
                      ? `Buying favored by ${fmtK(Math.abs(bvr.npvDiff))} NPV over ${horizonYears}yr`
                      : `Renting favored by ${fmtK(Math.abs(bvr.npvDiff))} NPV over ${horizonYears}yr`}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mortgage concepts */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Key Mortgage Concepts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { title: "LTV Ratio", val: fmtPct(100 - downPct, 1), desc: "Loan-to-value. Above 80% typically requires PMI (~0.5–1% annually). Below 80% avoids PMI." },
                    { title: "DTI Limit", val: "≤43%", desc: "Debt-to-income ratio. Lenders prefer total debt payments under 43% of gross monthly income." },
                    { title: "PITI", val: fmtUSD(bvr.pmt + homePrice * 0.012 / 12 + homePrice * 0.004 / 12), desc: "Principal + Interest + Tax + Insurance. Total monthly housing cost including escrow." },
                  ].map((c) => (
                    <div key={c.title} className="bg-muted/30 rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground font-medium">{c.title}</span>
                        <Badge variant="secondary" className="text-xs text-muted-foreground">{c.val}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 2: MBS Markets ────────────────────────────────────────── */}
          <TabsContent value="mbs" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* MBS structure diagram */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
                    MBS Securitization Structure
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Mortgage pool → SPV → tranches with cash flow waterfall
                  </p>
                </CardHeader>
                <CardContent>
                  <MBSStructureDiagram />
                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span>Prepayment risk: homeowners refinance when rates fall, returning principal early to MBS investors at inopportune times (negative convexity).</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* MBS market table */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground/50" />
                    Agency &amp; Non-Agency MBS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-muted-foreground">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-1.5 text-muted-foreground font-medium">Security</th>
                          <th className="text-center py-1.5 text-muted-foreground font-medium">Rtg</th>
                          <th className="text-right py-1.5 text-muted-foreground font-medium">Cpn</th>
                          <th className="text-right py-1.5 text-muted-foreground font-medium">Sprd</th>
                          <th className="text-right py-1.5 text-muted-foreground font-medium">OAS</th>
                          <th className="text-right py-1.5 text-muted-foreground font-medium">Dur</th>
                          <th className="text-right py-1.5 text-muted-foreground font-medium">Cvx</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MBS_TRANCHES.map((t) => (
                          <tr key={t.id} className="border-b border-border hover:bg-muted/20">
                            <td className="py-1.5 font-medium">{t.id}</td>
                            <td className="py-1.5 text-center">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs text-muted-foreground px-1",
                                  t.rating.startsWith("AAA")
                                    ? "text-emerald-400"
                                    : t.rating.startsWith("AA")
                                    ? "text-primary"
                                    : "text-amber-400"
                                )}
                              >
                                {t.rating}
                              </Badge>
                            </td>
                            <td className="py-1.5 text-right">{t.coupon}</td>
                            <td className="py-1.5 text-right text-amber-400">{t.spread}</td>
                            <td className="py-1.5 text-right text-primary">{t.oas}</td>
                            <td className="py-1.5 text-right">{t.duration}</td>
                            <td className="py-1.5 text-right text-rose-400">{t.convexity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="bg-muted/30 rounded p-2">
                      <div className="font-medium text-amber-400 mb-0.5">Option-Adjusted Spread</div>
                      <div className="text-muted-foreground">OAS strips out the embedded prepayment option value, giving the true credit/liquidity spread vs. Treasuries.</div>
                    </div>
                    <div className="bg-muted/30 rounded p-2">
                      <div className="font-medium text-rose-400 mb-0.5">Negative Convexity</div>
                      <div className="text-muted-foreground">MBS prices rise less than equivalent bonds when rates fall (prepayments accelerate) but fall more when rates rise.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agency overview */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Agency MBS Landscape</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { name: "Fannie Mae (FNMA)", detail: "GSE — conventional conforming loans (up to $766,550). Largest agency MBS issuer. Implicit USG guarantee.", color: "text-primary" },
                    { name: "Freddie Mac (FHLMC)", detail: "GSE — conventional conforming. Issues Participation Certificates (PCs). Competes with FNMA for conforming volume.", color: "text-primary" },
                    { name: "Ginnie Mae (GNMA)", detail: "Full-faith USG guarantee. Pools FHA/VA/USDA loans only. Highest credit quality. Used by banks for liquidity.", color: "text-emerald-400" },
                  ].map((a) => (
                    <div key={a.name} className="bg-muted/30 rounded p-3">
                      <div className={cn("text-xs text-muted-foreground font-medium mb-1", a.color)}>{a.name}</div>
                      <p className="text-xs text-muted-foreground">{a.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 3: Affordability ──────────────────────────────────────── */}
          <TabsContent value="affordability" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/50" />
                    Price-to-Income Ratio 2000–2024
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Median home price ÷ median household income. Red zone = unaffordable.
                  </p>
                </CardHeader>
                <CardContent>
                  <AffordabilityChart />
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                    {[
                      { yr: "2006 Peak", val: "6.2x", note: "Pre-crisis bubble", color: "text-rose-400" },
                      { yr: "2012 Trough", val: "4.1x", note: "Post-crisis floor", color: "text-emerald-400" },
                      { yr: "2022 Record", val: "8.1x", note: "Rate-shock peak", color: "text-rose-400" },
                    ].map((d) => (
                      <div key={d.yr} className="bg-muted/30 rounded p-2">
                        <div className="text-muted-foreground">{d.yr}</div>
                        <div className={cn("font-medium", d.color)}>{d.val}</div>
                        <div className="text-muted-foreground text-xs">{d.note}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    Affordability Drivers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Mortgage Rate Impact", current: "6.82%", note: "+1% rate ≈ +10% monthly payment. Rate doubles payment cost vs. 3% era.", icon: Percent, color: "text-primary" },
                    { label: "Inventory Shortage", current: "3.2 mo supply", note: "Historical norm is 5–6 months. Tight supply keeps prices elevated despite rate pressure.", icon: Building2, color: "text-amber-400" },
                    { label: "Wage Growth Lag", current: "+4.1% YoY", note: "Home prices rose 40%+ since 2020 while wages grew ~15%. Structural affordability gap remains.", icon: TrendingUp, color: "text-emerald-400" },
                    { label: "Rent vs. Buy Premium", current: fmtUSD(bvr.totalMonthlyBuy - bvr.totalMonthlyRent) + "/mo", note: "Extra monthly cost of owning vs. renting the same property at current prices.", icon: Home, color: "text-rose-400" },
                  ].map((d) => {
                    const Icon = d.icon;
                    return (
                      <div key={d.label} className="flex items-start gap-3 p-2 bg-muted/20 rounded">
                        <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", d.color)} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">{d.label}</span>
                            <Badge variant="secondary" className="text-xs text-muted-foreground">{d.current}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{d.note}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Affordability tips */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">First-Time Buyer Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3">
                  {[
                    { prog: "FHA Loan", dn: "3.5% down", rate: "Market −0.1%", note: "580+ credit score. MIP required." },
                    { prog: "VA Loan", dn: "0% down", rate: "Market −0.25%", note: "Veterans/active military only. No PMI." },
                    { prog: "USDA Rural", dn: "0% down", rate: "Market −0.3%", note: "Rural areas only. Income limits apply." },
                    { prog: "Conventional 97", dn: "3% down", rate: "Market", note: "620+ credit. PMI until 80% LTV." },
                  ].map((p) => (
                    <div key={p.prog} className="bg-muted/30 rounded p-2 text-xs text-muted-foreground">
                      <div className="font-medium text-primary mb-1">{p.prog}</div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Down:</span><span className="text-foreground">{p.dn}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Rate:</span><span className="text-foreground">{p.rate}</span>
                      </div>
                      <div className="text-muted-foreground mt-1">{p.note}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 4: Prepayment ─────────────────────────────────────────── */}
          <TabsContent value="prepayment" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    PSA Prepayment S-Curve
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Conditional prepayment rate (CPR) by loan age at various PSA speeds (50%–300%)
                  </p>
                </CardHeader>
                <CardContent>
                  <PrepaymentChart />
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground text-center">
                    <div className="bg-muted/30 rounded p-2">
                      <div className="text-indigo-300 font-medium">100% PSA</div>
                      <div className="text-muted-foreground">Standard benchmark. Ramps to 6% CPR by month 30.</div>
                    </div>
                    <div className="bg-muted/30 rounded p-2">
                      <div className="text-amber-300 font-medium">200% PSA</div>
                      <div className="text-muted-foreground">Elevated refinancing environment. 12% peak CPR.</div>
                    </div>
                    <div className="bg-muted/30 rounded p-2">
                      <div className="text-rose-300 font-medium">300% PSA</div>
                      <div className="text-muted-foreground">Refi boom (rate drop). 18% CPR — MBS investors hurt.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Prepayment Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    {
                      factor: "Refinancing Incentive",
                      level: "High",
                      color: "text-rose-400",
                      desc: "Primary driver. When current rates fall 50–75bps below WAC, refinancing activity accelerates sharply.",
                    },
                    {
                      factor: "Housing Turnover",
                      level: "Medium",
                      color: "text-amber-400",
                      desc: "Homeowners sell when relocating. ~6–8% of outstanding loans prepay annually from housing turnover alone.",
                    },
                    {
                      factor: "Burnout Effect",
                      level: "Moderate",
                      color: "text-primary",
                      desc: "After prolonged low rates, eligible borrowers have already refinanced. Pool becomes insensitive to further rate declines.",
                    },
                    {
                      factor: "Curtailments",
                      level: "Low",
                      color: "text-emerald-400",
                      desc: "Partial prepayments (extra principal payments). Usually 0.5–1% CPR contribution. Stable, not rate-sensitive.",
                    },
                    {
                      factor: "Default & Liquidation",
                      level: "Variable",
                      color: "text-primary",
                      desc: "Non-agency MBS exposed to credit default prepayments. Loss severity depends on LTV, home prices, guarantees.",
                    },
                  ].map((r) => (
                    <div key={r.factor} className="flex items-start gap-3 p-2 bg-muted/20 rounded">
                      <ArrowRight className="w-3 h-3 mt-1 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-muted-foreground font-medium">{r.factor}</span>
                          <span className={cn("text-xs text-muted-foreground", r.color)}>{r.level}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Convexity explainer */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Negative Convexity &amp; Extension Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-rose-400">When Rates Fall (Prepayment Risk)</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex gap-2"><span className="text-rose-400">•</span>Borrowers refinance en masse at lower rates</li>
                      <li className="flex gap-2"><span className="text-rose-400">•</span>MBS investors receive principal back early</li>
                      <li className="flex gap-2"><span className="text-rose-400">•</span>Must reinvest at newly lower yields (reinvestment risk)</li>
                      <li className="flex gap-2"><span className="text-rose-400">•</span>Duration shortens unexpectedly (negative convexity)</li>
                      <li className="flex gap-2"><span className="text-rose-400">•</span>MBS price appreciates less than equivalent bullet bond</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-amber-400">When Rates Rise (Extension Risk)</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex gap-2"><span className="text-amber-400">•</span>Prepayments slow — borrowers "lock in" low-rate loans</li>
                      <li className="flex gap-2"><span className="text-amber-400">•</span>MBS duration extends beyond initial expectation</li>
                      <li className="flex gap-2"><span className="text-amber-400">•</span>Investor holds below-market coupon for longer</li>
                      <li className="flex gap-2"><span className="text-amber-400">•</span>WAL (weighted average life) increases significantly</li>
                      <li className="flex gap-2"><span className="text-amber-400">•</span>MBS price falls more than equivalent bullet bond</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 bg-muted/10 border border-border rounded p-3 text-xs text-muted-foreground">
                  <span className="font-medium text-primary">OAS Hedging: </span>
                  MBS portfolio managers use interest-rate swaps, swaptions, and Treasury futures to hedge duration and convexity. The OAS measures the spread remaining after hedging away the embedded prepayment option.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-xs text-muted-foreground text-center pb-4"
      >
        Educational simulation — rates, prices, and yields are illustrative. Not financial advice.
      </motion.div>
    </div>
  );
}
