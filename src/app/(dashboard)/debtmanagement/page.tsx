"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  CreditCard,
  TrendingDown,
  Home,
  GraduationCap,
  Car,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  PieChart,
  ArrowRight,
  Zap,
  Shield,
  Info,
  ChevronRight,
  Clock,
  Repeat,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── PRNG ──────────────────────────────────────────────────────────────────────

let s = 883;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate stable noise values
const NOISE = Array.from({ length: 200 }, () => rand());

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

// ── Debt types ────────────────────────────────────────────────────────────────

type DebtType = "credit_card" | "student_loan" | "auto" | "mortgage" | "heloc";

interface Debt {
  id: DebtType;
  label: string;
  icon: React.ReactNode;
  color: string;
  balance: number;
  rate: number;
  minPayment: number;
  defaultBalance: number;
  defaultRate: number;
  defaultMin: number;
  maxBalance: number;
  maxRate: number;
}

const DEBT_DEFAULTS: Debt[] = [
  {
    id: "credit_card",
    label: "Credit Card",
    icon: <CreditCard className="w-4 h-4" />,
    color: "#ef4444",
    balance: 8500,
    rate: 22.9,
    minPayment: 255,
    defaultBalance: 8500,
    defaultRate: 22.9,
    defaultMin: 255,
    maxBalance: 30000,
    maxRate: 29.99,
  },
  {
    id: "student_loan",
    label: "Student Loan",
    icon: <GraduationCap className="w-4 h-4" />,
    color: "#8b5cf6",
    balance: 42000,
    rate: 5.5,
    minPayment: 440,
    defaultBalance: 42000,
    defaultRate: 5.5,
    defaultMin: 440,
    maxBalance: 150000,
    maxRate: 12.0,
  },
  {
    id: "auto",
    label: "Auto Loan",
    icon: <Car className="w-4 h-4" />,
    color: "#f59e0b",
    balance: 18000,
    rate: 7.2,
    minPayment: 356,
    defaultBalance: 18000,
    defaultRate: 7.2,
    defaultMin: 356,
    maxBalance: 80000,
    maxRate: 15.0,
  },
  {
    id: "mortgage",
    label: "Mortgage",
    icon: <Home className="w-4 h-4" />,
    color: "#3b82f6",
    balance: 285000,
    rate: 6.75,
    minPayment: 1848,
    defaultBalance: 285000,
    defaultRate: 6.75,
    defaultMin: 1848,
    maxBalance: 1000000,
    maxRate: 9.0,
  },
  {
    id: "heloc",
    label: "HELOC",
    icon: <Home className="w-4 h-4" />,
    color: "#06b6d4",
    balance: 25000,
    rate: 9.25,
    minPayment: 193,
    defaultBalance: 25000,
    defaultRate: 9.25,
    defaultMin: 193,
    maxBalance: 250000,
    maxRate: 14.0,
  },
];

// ── Monthly payment for amortizing loan ────────────────────────────────────────

function monthlyPayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

// ── Total interest paid on fixed loan ────────────────────────────────────────

function totalInterest(principal: number, annualRate: number, months: number): number {
  const mp = monthlyPayment(principal, annualRate, months);
  return mp * months - principal;
}

// ── Payoff schedule (returns months and total interest) ─────────────────────

interface PayoffResult {
  months: number;
  totalInterest: number;
  schedule: Array<{ month: number; balance: number; interestPaid: number }>;
}

function computePayoff(balance: number, annualRate: number, payment: number): PayoffResult {
  const r = annualRate / 100 / 12;
  let b = balance;
  let totalInt = 0;
  const schedule: PayoffResult["schedule"] = [];
  let month = 0;
  while (b > 0.01 && month < 600) {
    const interest = b * r;
    const principal = Math.min(payment - interest, b);
    if (principal <= 0) break; // payment too low
    b -= principal;
    totalInt += interest;
    month++;
    if (month <= 60 || month % 12 === 0) {
      schedule.push({ month, balance: Math.max(0, b), interestPaid: totalInt });
    }
  }
  return { months: month, totalInterest: totalInt, schedule };
}

// ── Avalanche / Snowball simulation ──────────────────────────────────────────

interface DebtSimEntry {
  id: DebtType;
  label: string;
  color: string;
  balance: number;
  rate: number;
  minPayment: number;
}

interface StrategyResult {
  months: number;
  totalInterest: number;
  timeline: Array<{ month: number; remaining: number }>;
}

function simulateStrategy(
  debts: DebtSimEntry[],
  extraPayment: number,
  method: "avalanche" | "snowball"
): StrategyResult {
  const state = debts.map((d) => ({ ...d, balance: d.balance }));
  let month = 0;
  let totalInterest = 0;
  const timeline: StrategyResult["timeline"] = [];

  while (state.some((d) => d.balance > 0.01) && month < 600) {
    // Calculate interest
    state.forEach((d) => {
      if (d.balance > 0.01) {
        totalInterest += d.balance * (d.rate / 100 / 12);
        d.balance += d.balance * (d.rate / 100 / 12);
      }
    });

    // Apply min payments
    let availableExtra = extraPayment;
    state.forEach((d) => {
      if (d.balance > 0.01) {
        const pay = Math.min(d.minPayment, d.balance);
        d.balance -= pay;
        if (d.balance < 0) d.balance = 0;
      } else {
        availableExtra += d.minPayment; // freed up min payment
      }
    });

    // Apply extra to priority debt
    const active = state.filter((d) => d.balance > 0.01);
    if (active.length > 0) {
      const sorted =
        method === "avalanche"
          ? [...active].sort((a, b) => b.rate - a.rate)
          : [...active].sort((a, b) => a.balance - b.balance);
      const target = sorted[0];
      const idx = state.findIndex((d) => d.id === target.id);
      const pay = Math.min(availableExtra, state[idx].balance);
      state[idx].balance -= pay;
      if (state[idx].balance < 0) state[idx].balance = 0;
    }

    month++;
    const remaining = state.reduce((s, d) => s + Math.max(0, d.balance), 0);
    if (month % 6 === 0 || remaining < 1000) {
      timeline.push({ month, remaining });
    }
  }

  return { months: month, totalInterest, timeline };
}

// ── Tab 1: Debt Overview ───────────────────────────────────────────────────────

function DebtOverviewTab() {
  const [debts, setDebts] = useState<Debt[]>(DEBT_DEFAULTS.map((d) => ({ ...d })));
  const [monthlyIncome, setMonthlyIncome] = useState(7500);
  const [method, setMethod] = useState<"avalanche" | "snowball">("avalanche");

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMinPayment = debts.reduce((s, d) => s + d.minPayment, 0);
  const dtiRatio = (totalMinPayment / monthlyIncome) * 100;

  // Weighted average interest rate
  const weightedRate =
    totalDebt > 0
      ? debts.reduce((s, d) => s + (d.balance / totalDebt) * d.rate, 0)
      : 0;

  // Annual interest cost per debt type
  const annualInterest = debts.map((d) => ({
    ...d,
    annual: d.balance * (d.rate / 100),
  }));
  const maxAnnual = Math.max(...annualInterest.map((d) => d.annual));

  // Min vs accelerated (extra $500/mo)
  const extraPayment = 500;
  const minSim = simulateStrategy(
    debts.map((d) => ({ id: d.id, label: d.label, color: d.color, balance: d.balance, rate: d.rate, minPayment: d.minPayment })),
    0,
    method
  );
  const accelSim = simulateStrategy(
    debts.map((d) => ({ id: d.id, label: d.label, color: d.color, balance: d.balance, rate: d.rate, minPayment: d.minPayment })),
    extraPayment,
    method
  );

  const dtiColor = dtiRatio < 28 ? "#22c55e" : dtiRatio < 43 ? "#f59e0b" : "#ef4444";
  const dtiLabel = dtiRatio < 28 ? "Healthy" : dtiRatio < 43 ? "Caution" : "High Risk";

  function updateDebt(id: DebtType, field: keyof Debt, value: number) {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  }

  // SVG dimensions
  const svgW = 520;
  const svgH = 160;
  const barH = 22;
  const barGap = 8;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Debt", value: fmtK(totalDebt), icon: <DollarSign className="w-4 h-4" />, color: "text-red-400" },
          { label: "Min Payments", value: fmt(totalMinPayment), icon: <Clock className="w-4 h-4" />, color: "text-amber-400" },
          { label: "Avg Rate", value: fmtPct(weightedRate), icon: <TrendingDown className="w-4 h-4" />, color: "text-purple-400" },
          { label: "DTI Ratio", value: fmtPct(dtiRatio), icon: <BarChart3 className="w-4 h-4" />, color: dtiRatio < 28 ? "text-green-400" : dtiRatio < 43 ? "text-amber-400" : "text-red-400" },
        ].map((item) => (
          <Card key={item.label} className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                {item.icon}
                {item.label}
              </div>
              <div className={cn("text-xl font-bold", item.color)}>{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Debt Portfolio Builder */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-200 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                Debt Portfolio Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {debts.map((debt) => (
                <div key={debt.id} className="space-y-2 pb-4 border-b border-neutral-800 last:border-0">
                  <div className="flex items-center gap-2">
                    <span style={{ color: debt.color }}>{debt.icon}</span>
                    <span className="text-sm font-medium text-neutral-200">{debt.label}</span>
                    <Badge className="ml-auto text-xs" style={{ backgroundColor: `${debt.color}20`, color: debt.color, border: `1px solid ${debt.color}40` }}>
                      {fmtPct(debt.rate)} APR
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-neutral-500 mb-1">Balance: {fmtK(debt.balance)}</div>
                      <Slider
                        min={0}
                        max={debt.maxBalance}
                        step={500}
                        value={[debt.balance]}
                        onValueChange={([v]) => updateDebt(debt.id, "balance", v)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="text-neutral-500 mb-1">Rate: {fmtPct(debt.rate)}</div>
                      <Slider
                        min={0}
                        max={debt.maxRate}
                        step={0.1}
                        value={[debt.rate]}
                        onValueChange={([v]) => updateDebt(debt.id, "rate", v)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="text-neutral-500 mb-1">Min Pay: {fmt(debt.minPayment)}</div>
                      <Slider
                        min={25}
                        max={Math.max(debt.balance * 0.05, 100)}
                        step={10}
                        value={[debt.minPayment]}
                        onValueChange={([v]) => updateDebt(debt.id, "minPayment", v)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column: DTI Gauge + Method selector */}
        <div className="space-y-4">
          {/* DTI Gauge */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-200">Debt-to-Income Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 text-xs text-neutral-500">
                Monthly income:&nbsp;{fmt(monthlyIncome)}
              </div>
              <Slider
                min={1000}
                max={25000}
                step={500}
                value={[monthlyIncome]}
                onValueChange={([v]) => setMonthlyIncome(v)}
                className="mb-4"
              />
              {/* Gauge SVG */}
              <svg viewBox="0 0 200 110" className="w-full">
                {/* Background arc */}
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#27272a" strokeWidth="16" strokeLinecap="round" />
                {/* Color zones */}
                <path d="M 20 100 A 80 80 0 0 1 93 27" fill="none" stroke="#22c55e" strokeWidth="16" strokeLinecap="round" opacity="0.4" />
                <path d="M 93 27 A 80 80 0 0 1 150 36" fill="none" stroke="#f59e0b" strokeWidth="16" strokeLinecap="round" opacity="0.4" />
                <path d="M 150 36 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" opacity="0.4" />
                {/* Needle */}
                {(() => {
                  const pct = Math.min(dtiRatio / 60, 1);
                  const angle = -180 + pct * 180;
                  const rad = (angle * Math.PI) / 180;
                  const nx = 100 + 65 * Math.cos(rad);
                  const ny = 100 + 65 * Math.sin(rad);
                  return (
                    <>
                      <line x1="100" y1="100" x2={nx} y2={ny} stroke={dtiColor} strokeWidth="3" strokeLinecap="round" />
                      <circle cx="100" cy="100" r="5" fill={dtiColor} />
                    </>
                  );
                })()}
                {/* Labels */}
                <text x="100" y="88" textAnchor="middle" fill={dtiColor} fontSize="20" fontWeight="bold">
                  {fmtPct(dtiRatio)}
                </text>
                <text x="100" y="102" textAnchor="middle" fill={dtiColor} fontSize="9">
                  {dtiLabel}
                </text>
                <text x="24" y="112" fill="#6b7280" fontSize="8">0%</text>
                <text x="86" y="18" fill="#6b7280" fontSize="8">28%</text>
                <text x="148" y="30" fill="#6b7280" fontSize="8">43%</text>
                <text x="172" y="112" fill="#6b7280" fontSize="8">60%</text>
              </svg>
              <div className="grid grid-cols-3 gap-1 text-center text-xs mt-1">
                {[
                  { label: "Healthy", color: "text-green-400", range: "<28%" },
                  { label: "Caution", color: "text-amber-400", range: "28-43%" },
                  { label: "Risk", color: "text-red-400", range: ">43%" },
                ].map((z) => (
                  <div key={z.label}>
                    <div className={cn("font-medium", z.color)}>{z.label}</div>
                    <div className="text-neutral-500">{z.range}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Method selector */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-200">Payoff Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(["avalanche", "snowball"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-all",
                    method === m
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-neutral-700 bg-neutral-800/50 hover:border-neutral-600"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {m === "avalanche" ? (
                      <Zap className="w-3 h-3 text-blue-400" />
                    ) : (
                      <Target className="w-3 h-3 text-purple-400" />
                    )}
                    <span className="text-xs font-semibold text-neutral-200 capitalize">{m}</span>
                    {m === "avalanche" && (
                      <Badge className="ml-auto text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Saves more $
                      </Badge>
                    )}
                    {m === "snowball" && (
                      <Badge className="ml-auto text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                        More wins
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    {m === "avalanche"
                      ? "Highest interest rate first — mathematically optimal"
                      : "Lowest balance first — psychological momentum"}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interest Cost SVG bar chart */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-neutral-200">Annual Interest Cost by Debt Type</CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
            {annualInterest.map((d, i) => {
              const barW = maxAnnual > 0 ? (d.annual / maxAnnual) * (svgW - 140) : 0;
              const y = i * (barH + barGap) + 10;
              return (
                <g key={d.id}>
                  <text x="0" y={y + barH / 2 + 4} fill="#a3a3a3" fontSize="11">
                    {d.label}
                  </text>
                  <rect x="120" y={y} width={barW} height={barH} rx="4" fill={d.color} opacity="0.8" />
                  <text x={120 + barW + 6} y={y + barH / 2 + 4} fill="#e5e5e5" fontSize="11" fontWeight="600">
                    {fmtK(d.annual)}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Min vs Accelerated comparison */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-neutral-200">
            Minimum vs Accelerated Payoff (+{fmt(extraPayment)}/mo extra · {method === "avalanche" ? "Avalanche" : "Snowball"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 mb-4">
            {[
              { label: "Minimum Payments", sim: minSim, color: "#ef4444" },
              { label: `Accelerated (+${fmt(extraPayment)}/mo)`, sim: accelSim, color: "#22c55e" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="text-sm font-medium" style={{ color: item.color }}>{item.label}</div>
                <div className="text-2xl font-bold text-neutral-100">
                  {item.sim.months >= 600 ? "Never" : `${item.sim.months} mo`}
                </div>
                <div className="text-xs text-neutral-400">
                  Total interest: <span className="text-neutral-200">{fmtK(item.sim.totalInterest)}</span>
                </div>
              </div>
            ))}
          </div>
          {accelSim.months < minSim.months && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-xs text-green-300">
                Save {minSim.months - accelSim.months} months and{" "}
                {fmtK(minSim.totalInterest - accelSim.totalInterest)} in interest
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 2: Payoff Strategies ────────────────────────────────────────────────────

function PayoffStrategiesTab() {
  const [balance, setBalance] = useState(25000);
  const [rate, setRate] = useState(18.9);
  const [extraPayment, setExtraPayment] = useState(300);
  const [transferRate, setTransferRate] = useState(0);
  const [transferFee, setTransferFee] = useState(3);
  const [transferMonths, setTransferMonths] = useState(18);
  const [consolidationRate, setConsolidationRate] = useState(11.0);

  const minPay = Math.max(balance * 0.02, 25);
  const accelPay = minPay + extraPayment;

  const minResult = computePayoff(balance, rate, minPay);
  const accelResult = computePayoff(balance, rate, accelPay);
  const avalancheResult = computePayoff(balance, rate, accelPay); // same single debt
  const snowballResult = computePayoff(balance, rate, minPay + extraPayment * 0.9); // slightly less (psychology)

  // Balance transfer analysis
  const feeAmount = balance * (transferFee / 100);
  const btResult = computePayoff(balance + feeAmount, transferRate, accelPay);
  const btSavings = accelResult.totalInterest - btResult.totalInterest - feeAmount;

  // Debt consolidation
  const consResult = computePayoff(balance, consolidationRate, accelPay);
  const consSavings = accelResult.totalInterest - consResult.totalInterest;

  // Timeline SVG
  const svgW = 560;
  const svgH = 200;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const allSchedules = [
    { result: minResult, color: "#ef4444", label: "Min Only" },
    { result: accelResult, color: "#f59e0b", label: "Accelerated" },
    { result: btResult, color: "#22c55e", label: "Bal Transfer" },
  ];

  const maxMonths = Math.max(...allSchedules.map((s) => s.result.months));

  function pathFromSchedule(schedule: PayoffResult["schedule"]): string {
    if (schedule.length === 0) return "";
    const pts = [{ month: 0, balance }];
    schedule.forEach((p) => pts.push({ month: p.month, balance: p.balance }));
    if (pts[pts.length - 1].balance > 1) pts.push({ month: maxMonths, balance: 0 });

    return pts
      .map((p, i) => {
        const x = padL + (p.month / maxMonths) * chartW;
        const y = padT + chartH - (p.balance / balance) * chartH;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }

  return (
    <div className="space-y-6">
      {/* Single debt calculator */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-neutral-200 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            Debt Payoff Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Balance: {fmtK(balance)}</div>
              <Slider min={1000} max={100000} step={500} value={[balance]} onValueChange={([v]) => setBalance(v)} />
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Interest Rate: {fmtPct(rate)}</div>
              <Slider min={1} max={30} step={0.1} value={[rate]} onValueChange={([v]) => setRate(v)} />
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Extra Payment: {fmt(extraPayment)}/mo</div>
              <Slider min={0} max={2000} step={25} value={[extraPayment]} onValueChange={([v]) => setExtraPayment(v)} />
            </div>
          </div>

          {/* Comparison cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Min Only", months: minResult.months, interest: minResult.totalInterest, color: "#ef4444" },
              { label: "Accelerated", months: accelResult.months, interest: accelResult.totalInterest, color: "#f59e0b" },
              { label: "Avalanche", months: avalancheResult.months, interest: avalancheResult.totalInterest, color: "#8b5cf6" },
              { label: "Snowball", months: snowballResult.months, interest: snowballResult.totalInterest, color: "#06b6d4" },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
                <div className="text-xs font-medium mb-1" style={{ color: item.color }}>{item.label}</div>
                <div className="text-lg font-bold text-neutral-100">{item.months >= 600 ? "Never" : `${item.months}m`}</div>
                <div className="text-xs text-neutral-400">{fmtK(item.interest)} interest</div>
              </div>
            ))}
          </div>

          {/* Payoff timeline SVG */}
          <div className="text-xs text-neutral-500 mb-2 font-medium">Payoff Timeline — Balance Remaining</div>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const y = padT + chartH - pct * chartH;
              return (
                <g key={pct}>
                  <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#27272a" strokeWidth="1" />
                  <text x={padL - 4} y={y + 4} fill="#6b7280" fontSize="9" textAnchor="end">
                    {fmtK(balance * pct)}
                  </text>
                </g>
              );
            })}
            {/* Month axis */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const x = padL + pct * chartW;
              const m = Math.round(pct * maxMonths);
              return (
                <text key={pct} x={x} y={svgH - 8} fill="#6b7280" fontSize="9" textAnchor="middle">
                  {m}m
                </text>
              );
            })}
            {/* Lines */}
            {allSchedules.map(({ result, color, label }) => (
              <g key={label}>
                <path d={pathFromSchedule(result.schedule)} fill="none" stroke={color} strokeWidth="2" />
              </g>
            ))}
            {/* Legend */}
            {allSchedules.map(({ color, label }, i) => (
              <g key={label}>
                <rect x={padL + i * 120} y={padT} width="12" height="3" rx="1" fill={color} />
                <text x={padL + i * 120 + 16} y={padT + 7} fill="#a3a3a3" fontSize="9">{label}</text>
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>

      {/* Balance Transfer + Consolidation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Transfer */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-200 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-cyan-400" />
              Balance Transfer Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-neutral-500 mb-1">Intro Rate: {fmtPct(transferRate)}</div>
                <Slider min={0} max={5} step={0.25} value={[transferRate]} onValueChange={([v]) => setTransferRate(v)} />
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Transfer Fee: {fmtPct(transferFee)}</div>
                <Slider min={0} max={5} step={0.5} value={[transferFee]} onValueChange={([v]) => setTransferFee(v)} />
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Intro Period: {transferMonths}mo</div>
                <Slider min={6} max={24} step={3} value={[transferMonths]} onValueChange={([v]) => setTransferMonths(v)} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Transfer fee:</span>
                <span className="text-red-400">{fmt(feeAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Interest saved:</span>
                <span className="text-green-400">{fmtK(Math.max(0, accelResult.totalInterest - btResult.totalInterest))}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-neutral-700 pt-2">
                <span className="text-neutral-400 font-medium">Net benefit:</span>
                <span className={cn("font-bold", btSavings > 0 ? "text-green-400" : "text-red-400")}>
                  {btSavings > 0 ? "+" : ""}{fmtK(btSavings)}
                </span>
              </div>
            </div>
            <div className={cn("flex items-center gap-2 p-2 rounded-lg text-xs", btSavings > 0 ? "bg-green-500/10 border border-green-500/20 text-green-300" : "bg-red-500/10 border border-red-500/20 text-red-300")}>
              {btSavings > 0 ? <CheckCircle className="w-3 h-3 shrink-0" /> : <AlertTriangle className="w-3 h-3 shrink-0" />}
              {btSavings > 0
                ? `Worth it — pay off ${fmtK(balance + feeAmount)} within ${transferMonths} months to avoid revert rate.`
                : "Not beneficial — fee exceeds interest savings at current payoff pace."}
            </div>
          </CardContent>
        </Card>

        {/* Debt Consolidation */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Debt Consolidation Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Consolidation Rate: {fmtPct(consolidationRate)}</div>
              <Slider min={5} max={25} step={0.25} value={[consolidationRate]} onValueChange={([v]) => setConsolidationRate(v)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Current total interest:</span>
                <span className="text-red-400">{fmtK(accelResult.totalInterest)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Consolidated interest:</span>
                <span className={consolidationRate < rate ? "text-green-400" : "text-red-400"}>
                  {fmtK(consResult.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between text-xs border-t border-neutral-700 pt-2">
                <span className="text-neutral-400 font-medium">Total savings:</span>
                <span className={cn("font-bold", consSavings > 0 ? "text-green-400" : "text-red-400")}>
                  {consSavings > 0 ? "+" : ""}{fmtK(consSavings)}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-xs text-neutral-500">
              <div className="font-medium text-neutral-300">Consolidation checklist:</div>
              {[
                { ok: consolidationRate < rate, text: `Lower rate than current ${fmtPct(rate)}` },
                { ok: consolidationRate < 15, text: "Rate below 15% threshold" },
                { ok: consSavings > 500, text: "Net savings > $500" },
              ].map((c) => (
                <div key={c.text} className="flex items-center gap-2">
                  {c.ok ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                  <span className={c.ok ? "text-green-300" : "text-amber-300"}>{c.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 3: Mortgage Optimization ─────────────────────────────────────────────

function MortgageOptimizationTab() {
  const [homePrice, setHomePrice] = useState(400000);
  const [downPaymentPct, setDownPaymentPct] = useState(10);
  const [rate30, setRate30] = useState(6.75);
  const [rate15, setRate15] = useState(6.1);
  const [currentBalance, setCurrentBalance] = useState(285000);
  const [currentRate, setCurrentRate] = useState(7.2);
  const [newRate, setNewRate] = useState(6.25);
  const [closingCosts, setClosingCosts] = useState(6000);
  const [extraMonthly, setExtraMonthly] = useState(200);

  const downPayment = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPayment;
  const ltv = (loanAmount / homePrice) * 100;
  const hasPMI = ltv > 80;
  const pmiMonthly = hasPMI ? (loanAmount * 0.0065) / 12 : 0;

  const mp30 = monthlyPayment(loanAmount, rate30, 360);
  const mp15 = monthlyPayment(loanAmount, rate15, 180);
  const totalInt30 = mp30 * 360 - loanAmount;
  const totalInt15 = mp15 * 180 - loanAmount;

  // Refinance break-even
  const currentMP = monthlyPayment(currentBalance, currentRate, 360);
  const newMP = monthlyPayment(currentBalance, newRate, 360);
  const monthlySavings = currentMP - newMP;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : Infinity;

  // Extra payment impact on 30-year
  const baseResult = computePayoff(loanAmount, rate30, mp30);
  const extraResult = computePayoff(loanAmount, rate30, mp30 + extraMonthly);
  const yearsSaved = (baseResult.months - extraResult.months) / 12;
  const interestSaved = baseResult.totalInterest - extraResult.totalInterest;

  // PMI elimination
  const targetEquity = homePrice * 0.2;
  const equityNeeded = Math.max(0, targetEquity - downPayment);
  const monthsToElimPMI =
    hasPMI
      ? computePayoff(loanAmount, rate30, mp30).schedule.findIndex((p) => p.balance <= loanAmount - equityNeeded) * (hasPMI ? 6 : 1)
      : 0;

  // Amortization SVG
  const svgW = 560;
  const svgH = 220;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const cW = svgW - padL - padR;
  const cH = svgH - padT - padB;

  function buildAmoPath(principal: number, rate: number, termMonths: number): string {
    const mp = monthlyPayment(principal, rate, termMonths);
    const r = rate / 100 / 12;
    const pts: { x: number; y: number }[] = [];
    let bal = principal;
    for (let m = 0; m <= termMonths; m += 12) {
      const x = padL + (m / 360) * cW;
      const y = padT + cH - (bal / principal) * cH;
      pts.push({ x, y });
      // advance 12 months
      for (let i = 0; i < 12 && bal > 0; i++) {
        const interest = bal * r;
        const prin = mp - interest;
        bal -= prin;
        bal = Math.max(0, bal);
      }
    }
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }

  return (
    <div className="space-y-6">
      {/* 15 vs 30 Year Comparison */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-neutral-200 flex items-center gap-2">
            <Home className="w-4 h-4 text-blue-400" />
            15 vs 30-Year Mortgage Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Home Price: {fmtK(homePrice)}</div>
              <Slider min={100000} max={1500000} step={5000} value={[homePrice]} onValueChange={([v]) => setHomePrice(v)} />
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Down Payment: {fmtPct(downPaymentPct)}</div>
              <Slider min={3} max={50} step={1} value={[downPaymentPct]} onValueChange={([v]) => setDownPaymentPct(v)} />
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">30yr Rate: {fmtPct(rate30)}</div>
              <Slider min={3} max={10} step={0.05} value={[rate30]} onValueChange={([v]) => setRate30(v)} />
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">15yr Rate: {fmtPct(rate15)}</div>
              <Slider min={2.5} max={9} step={0.05} value={[rate15]} onValueChange={([v]) => setRate15(v)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              {
                term: "30-Year",
                mp: mp30,
                total: mp30 * 360,
                interest: totalInt30,
                color: "#f59e0b",
                rate: rate30,
              },
              {
                term: "15-Year",
                mp: mp15,
                total: mp15 * 180,
                interest: totalInt15,
                color: "#22c55e",
                rate: rate15,
              },
            ].map((item) => (
              <div key={item.term} className="p-4 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
                <div className="text-sm font-semibold mb-3" style={{ color: item.color }}>{item.term}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Monthly Payment</span>
                    <span className="text-neutral-100 font-medium">{fmt(item.mp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Total Paid</span>
                    <span className="text-neutral-100">{fmtK(item.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Total Interest</span>
                    <span style={{ color: item.color }}>{fmtK(item.interest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Interest / Principal</span>
                    <span className="text-neutral-300">{fmtPct((item.interest / loanAmount) * 100)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasPMI && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-300">
                PMI required at {fmtPct(ltv)} LTV — adds {fmt(pmiMonthly)}/mo until you reach 80% LTV.
                Put down at least {fmt(homePrice * 0.2)} to avoid PMI.
              </span>
            </div>
          )}

          {/* Amortization Curves SVG */}
          <div className="text-xs text-neutral-500 mb-2 font-medium">Amortization Curves — Balance Remaining</div>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const y = padT + cH - pct * cH;
              return (
                <g key={pct}>
                  <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#27272a" strokeWidth="1" />
                  <text x={padL - 4} y={y + 4} fill="#6b7280" fontSize="9" textAnchor="end">
                    {fmtK(loanAmount * pct)}
                  </text>
                </g>
              );
            })}
            {[0, 5, 10, 15, 20, 25, 30].map((yr) => {
              const x = padL + (yr / 30) * cW;
              return (
                <text key={yr} x={x} y={svgH - 8} fill="#6b7280" fontSize="9" textAnchor="middle">
                  Yr{yr}
                </text>
              );
            })}
            <path d={buildAmoPath(loanAmount, rate30, 360)} fill="none" stroke="#f59e0b" strokeWidth="2" />
            <path d={buildAmoPath(loanAmount, rate15, 180)} fill="none" stroke="#22c55e" strokeWidth="2" />
            {/* Legend */}
            <rect x={padL} y={padT} width="12" height="3" rx="1" fill="#f59e0b" />
            <text x={padL + 16} y={padT + 7} fill="#a3a3a3" fontSize="9">30yr</text>
            <rect x={padL + 60} y={padT} width="12" height="3" rx="1" fill="#22c55e" />
            <text x={padL + 76} y={padT + 7} fill="#a3a3a3" fontSize="9">15yr</text>
          </svg>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Refinance Break-Even */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-200 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-cyan-400" />
              Refinance Break-Even Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-neutral-500 mb-1">Current Balance: {fmtK(currentBalance)}</div>
                <Slider min={50000} max={800000} step={5000} value={[currentBalance]} onValueChange={([v]) => setCurrentBalance(v)} />
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Current Rate: {fmtPct(currentRate)}</div>
                <Slider min={3} max={10} step={0.05} value={[currentRate]} onValueChange={([v]) => setCurrentRate(v)} />
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">New Rate: {fmtPct(newRate)}</div>
                <Slider min={3} max={10} step={0.05} value={[newRate]} onValueChange={([v]) => setNewRate(v)} />
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Closing Costs: {fmtK(closingCosts)}</div>
                <Slider min={1000} max={20000} step={500} value={[closingCosts]} onValueChange={([v]) => setClosingCosts(v)} />
              </div>
            </div>
            <div className="space-y-2 border-t border-neutral-700 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Monthly savings:</span>
                <span className={monthlySavings > 0 ? "text-green-400" : "text-red-400"}>{fmt(monthlySavings)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Break-even:</span>
                <span className="text-neutral-100 font-bold">
                  {breakEvenMonths === Infinity ? "Never" : `${breakEvenMonths} months (${(breakEvenMonths / 12).toFixed(1)} yrs)`}
                </span>
              </div>
              <div className={cn("flex items-center gap-2 p-2 rounded-lg text-xs", breakEvenMonths < 36 ? "bg-green-500/10 border border-green-500/20 text-green-300" : breakEvenMonths < 60 ? "bg-amber-500/10 border border-amber-500/20 text-amber-300" : "bg-red-500/10 border border-red-500/20 text-red-300")}>
                {breakEvenMonths < 36
                  ? <CheckCircle className="w-3 h-3 shrink-0" />
                  : <AlertTriangle className="w-3 h-3 shrink-0" />}
                {breakEvenMonths < 36
                  ? "Excellent — break even in under 3 years"
                  : breakEvenMonths < 60
                  ? "Acceptable if you plan to stay 5+ years"
                  : "Not recommended unless staying long-term"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extra Payment Impact */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Extra Payment Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Extra Monthly Payment: {fmt(extraMonthly)}</div>
              <Slider min={0} max={2000} step={50} value={[extraMonthly]} onValueChange={([v]) => setExtraMonthly(v)} />
            </div>

            {/* Visual impact SVG */}
            <svg viewBox="0 0 300 100" className="w-full">
              {/* Base bar */}
              <rect x="0" y="20" width="280" height="28" rx="4" fill="#27272a" />
              {/* Payoff bar */}
              <rect x="0" y="20" width="280" height="28" rx="4" fill="#ef4444" opacity="0.5" />
              {/* Accelerated bar (shorter) */}
              {extraResult.months > 0 && (
                <rect
                  x="0"
                  y="20"
                  width={(extraResult.months / baseResult.months) * 280}
                  height="28"
                  rx="4"
                  fill="#22c55e"
                  opacity="0.7"
                />
              )}
              <text x="4" y="39" fill="#fff" fontSize="10" fontWeight="600">
                {extraResult.months} mo (was {baseResult.months} mo)
              </text>
              <text x="0" y="68" fill="#a3a3a3" fontSize="10">
                Years saved:
              </text>
              <text x="80" y="68" fill="#22c55e" fontSize="14" fontWeight="bold">
                {yearsSaved.toFixed(1)} years
              </text>
              <text x="0" y="85" fill="#a3a3a3" fontSize="10">
                Interest saved:
              </text>
              <text x="80" y="85" fill="#22c55e" fontSize="14" fontWeight="bold">
                {fmtK(interestSaved)}
              </text>
            </svg>

            {/* Points analysis */}
            <div className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700/50 text-xs space-y-1">
              <div className="font-medium text-neutral-200 mb-2">Mortgage Points Strategy</div>
              <div className="text-neutral-400">1 point = 1% of loan amount ({fmtK(loanAmount * 0.01)})</div>
              <div className="text-neutral-400">Typically reduces rate by 0.25% per point</div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Breakeven for 1 pt:</span>
                <span className="text-neutral-200">
                  {fmt(monthlyPayment(loanAmount, rate30 - 0.25, 360)) > 0
                    ? `${Math.ceil((loanAmount * 0.01) / (mp30 - monthlyPayment(loanAmount, rate30 - 0.25, 360)))} months`
                    : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 4: Credit & Behavioral ────────────────────────────────────────────────

function CreditBehavioralTab() {
  const [utilization, setUtilization] = useState(35);
  const [totalCreditLimit, setTotalCreditLimit] = useState(25000);
  const [currentBalance2, setCurrentBalance2] = useState(8750);

  const currentUtil = (currentBalance2 / totalCreditLimit) * 100;
  const targetBalance = totalCreditLimit * 0.1; // 10% optimal
  const paydownNeeded = Math.max(0, currentBalance2 - targetBalance);

  // Credit score components
  const creditComponents = [
    { label: "Payment History", pct: 35, color: "#22c55e", score: 98 },
    { label: "Utilization", pct: 30, color: "#3b82f6", score: currentUtil < 10 ? 95 : currentUtil < 30 ? 80 : currentUtil < 50 ? 55 : 25 },
    { label: "Credit Length", pct: 15, color: "#8b5cf6", score: 72 },
    { label: "Credit Mix", pct: 10, color: "#f59e0b", score: 85 },
    { label: "New Credit", pct: 10, color: "#ef4444", score: 90 },
  ];

  // Estimated credit score
  const estimatedScore = Math.round(
    creditComponents.reduce((s, c) => s + (c.score * c.pct) / 100, 0) * 8.5 + 300
  );

  // Credit score donut
  const donutR = 80;
  const donutCx = 110;
  const donutCy = 110;
  const strokeW = 22;
  let cumulativePct = 0;

  function sectorPath(startPct: number, endPct: number, r: number, cx: number, cy: number, sw: number): string {
    const start = (startPct / 100) * 2 * Math.PI - Math.PI / 2;
    const end = (endPct / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = endPct - startPct > 50 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  // Rewards arbitrage data
  const spendCategories = [
    { name: "Dining", monthly: 600, bestCard: "Chase Sapphire", cashback: 0.03, icon: "🍽️" },
    { name: "Groceries", monthly: 500, bestCard: "Amex Gold", cashback: 0.04, icon: "🛒" },
    { name: "Gas", monthly: 200, bestCard: "Costco Visa", cashback: 0.04, icon: "⛽" },
    { name: "Travel", monthly: 300, bestCard: "Capital One Venture", cashback: 0.02, icon: "✈️" },
    { name: "Other", monthly: 800, bestCard: "Citi Double Cash", cashback: 0.02, icon: "💳" },
  ];
  const totalRewards = spendCategories.reduce((s, c) => s + c.monthly * c.cashback * 12, 0);

  // Net worth impact SVG
  const netWorthYears = 10;
  const debtFreeYear = 4;
  const svgW = 500;
  const svgH = 160;
  const padL = 50;
  const padT = 15;
  const padB = 25;
  const padR = 20;
  const cW = svgW - padL - padR;
  const cH = svgH - padT - padB;

  const maxNW = 250000;
  function nwWithDebt(yr: number): number {
    return Math.max(0, yr * 18000 - Math.max(0, 50000 - yr * 8000) * 0.3);
  }
  function nwDebtFree(yr: number): number {
    const savingsBonus = yr > debtFreeYear ? (yr - debtFreeYear) * 12000 : 0;
    return yr * 18000 + savingsBonus;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Score Donut */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-200 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              Credit Score Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <svg viewBox="0 0 220 220" className="w-40 shrink-0">
                {/* Background ring */}
                <circle cx={donutCx} cy={donutCy} r={donutR} fill="none" stroke="#27272a" strokeWidth={strokeW} />
                {/* Sectors */}
                {creditComponents.map((c) => {
                  const startPct = cumulativePct;
                  cumulativePct += c.pct;
                  const path = sectorPath(startPct, cumulativePct - 0.5, donutR, donutCx, donutCy, strokeW);
                  return (
                    <path
                      key={c.label}
                      d={path}
                      fill="none"
                      stroke={c.color}
                      strokeWidth={strokeW}
                      opacity="0.85"
                    />
                  );
                })}
                {/* Center score */}
                <text x={donutCx} y={donutCy - 8} textAnchor="middle" fill="#f5f5f5" fontSize="26" fontWeight="bold">
                  {estimatedScore}
                </text>
                <text x={donutCx} y={donutCy + 10} textAnchor="middle" fill="#a3a3a3" fontSize="10">
                  Est. Score
                </text>
                <text x={donutCx} y={donutCy + 24} textAnchor="middle" fill={estimatedScore >= 740 ? "#22c55e" : estimatedScore >= 670 ? "#f59e0b" : "#ef4444"} fontSize="10" fontWeight="600">
                  {estimatedScore >= 740 ? "Excellent" : estimatedScore >= 670 ? "Good" : "Fair"}
                </text>
              </svg>
              <div className="space-y-2 flex-1">
                {creditComponents.map((c) => (
                  <div key={c.label}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-neutral-400">{c.label}</span>
                      <span style={{ color: c.color }}>{c.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.score}%`, backgroundColor: c.color, opacity: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Utilization Optimizer */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              Credit Utilization Optimizer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-neutral-500 mb-1">Total Credit Limit: {fmtK(totalCreditLimit)}</div>
                <Slider min={5000} max={100000} step={1000} value={[totalCreditLimit]} onValueChange={([v]) => setTotalCreditLimit(v)} />
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Current Balance: {fmtK(currentBalance2)}</div>
                <Slider min={0} max={totalCreditLimit} step={100} value={[currentBalance2]} onValueChange={([v]) => setCurrentBalance2(v)} />
              </div>
            </div>

            {/* Utilization gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Utilization</span>
                <span className={cn("font-bold", currentUtil < 10 ? "text-green-400" : currentUtil < 30 ? "text-blue-400" : currentUtil < 50 ? "text-amber-400" : "text-red-400")}>
                  {fmtPct(currentUtil)}
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(currentUtil, 100)}%`,
                    backgroundColor: currentUtil < 10 ? "#22c55e" : currentUtil < 30 ? "#3b82f6" : currentUtil < 50 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>0% — Excellent</span>
                <span>10% — Ideal</span>
                <span>30% — Good</span>
                <span>50%+ — Hurts</span>
              </div>
            </div>

            {paydownNeeded > 0 && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Info className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="text-xs text-blue-300">
                  Pay down {fmtK(paydownNeeded)} to reach optimal 10% utilization. Estimated score boost: +
                  {Math.round((currentUtil - 10) * 1.5)} points.
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { range: "<10%", label: "Excellent", color: "text-green-400", score: "+50 pts" },
                { range: "10–30%", label: "Good", color: "text-blue-400", score: "+20 pts" },
                { range: ">50%", label: "Harmful", color: "text-red-400", score: "−50 pts" },
              ].map((z) => (
                <div key={z.range} className="p-2 rounded-lg bg-neutral-800/60 border border-neutral-700/40">
                  <div className={cn("font-medium", z.color)}>{z.range}</div>
                  <div className="text-neutral-400">{z.label}</div>
                  <div className={z.color}>{z.score}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Arbitrage */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-neutral-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            Credit Card Rewards Arbitrage — Annual Value: {fmt(totalRewards)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <svg viewBox="0 0 560 100" className="w-full">
              {spendCategories.map((cat, i) => {
                const barW = (cat.monthly / 800) * 160;
                const rewardBarW = cat.monthly * cat.cashback * 12;
                const x = i * 112;
                return (
                  <g key={cat.name}>
                    <text x={x + 56} y="12" textAnchor="middle" fill="#a3a3a3" fontSize="9">
                      {cat.name}
                    </text>
                    {/* Spend bar */}
                    <rect x={x + 4} y="18" width={Math.min(barW, 104)} height="16" rx="3" fill="#3b82f6" opacity="0.5" />
                    <text x={x + 56} y="30" textAnchor="middle" fill="#e5e5e5" fontSize="9">
                      {fmt(cat.monthly)}/mo
                    </text>
                    {/* Rewards bar */}
                    <rect x={x + 4} y="40" width={Math.min(rewardBarW * 0.6, 104)} height="12" rx="3" fill="#22c55e" opacity="0.7" />
                    <text x={x + 56} y="51" textAnchor="middle" fill="#e5e5e5" fontSize="8">
                      {fmt(cat.monthly * cat.cashback * 12)}/yr
                    </text>
                    <text x={x + 56} y="68" textAnchor="middle" fill="#6b7280" fontSize="8">
                      {cat.bestCard}
                    </text>
                    <text x={x + 56} y="82" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600">
                      {fmtPct(cat.cashback * 100)} back
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {spendCategories.map((cat) => (
              <div key={cat.name} className="p-2 rounded-lg bg-neutral-800/60 border border-neutral-700/40 text-center">
                <div className="text-base mb-1">{cat.icon}</div>
                <div className="text-xs font-medium text-neutral-200">{cat.name}</div>
                <div className="text-xs text-neutral-400">{cat.bestCard}</div>
                <div className="text-xs text-green-400 font-medium">{fmtPct(cat.cashback * 100)}</div>
                <div className="text-xs text-neutral-300">{fmt(cat.monthly * cat.cashback * 12)}/yr</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debt Psychology + Net Worth Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Debt Psychology — Snowball Science
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="text-neutral-400 leading-relaxed">
              Research by Harvard Business Review (2016) found that focusing on small debts first — the snowball method — increases the likelihood of complete debt payoff by <span className="text-purple-400 font-medium">14%</span> compared to purely mathematical approaches.
            </p>
            <div className="space-y-2">
              {[
                {
                  title: "Quick wins trigger dopamine",
                  desc: "Paying off a small balance releases dopamine, reinforcing the debt-free behavior loop.",
                  color: "#8b5cf6",
                },
                {
                  title: "Reduced cognitive load",
                  desc: "Fewer accounts to track reduces decision fatigue, keeping you consistent.",
                  color: "#06b6d4",
                },
                {
                  title: "Progress visibility",
                  desc: "Watching account balances reach zero is more motivating than watching large balances shrink slowly.",
                  color: "#22c55e",
                },
                {
                  title: "Hybrid approach works best",
                  desc: "Start with 1-2 small snowball wins, then switch to avalanche for maximum mathematical savings.",
                  color: "#f59e0b",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 p-2 rounded-lg bg-neutral-800/60">
                  <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="font-medium text-neutral-200 mb-0.5" style={{ color: item.color }}>{item.title}</div>
                    <div className="text-neutral-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Net Worth Impact SVG */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-200 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-400" />
              Net Worth Impact — With vs Without Debt Freedom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full mb-3">
              {/* Grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = padT + cH - pct * cH;
                return (
                  <g key={pct}>
                    <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#27272a" strokeWidth="1" />
                    <text x={padL - 4} y={y + 4} fill="#6b7280" fontSize="9" textAnchor="end">
                      {fmtK(maxNW * pct)}
                    </text>
                  </g>
                );
              })}
              {[0, 2, 4, 6, 8, 10].map((yr) => {
                const x = padL + (yr / netWorthYears) * cW;
                return (
                  <text key={yr} x={x} y={svgH - 8} fill="#6b7280" fontSize="9" textAnchor="middle">
                    Yr{yr}
                  </text>
                );
              })}
              {/* Debt burden path */}
              <path
                d={Array.from({ length: netWorthYears + 1 }, (_, yr) => {
                  const x = padL + (yr / netWorthYears) * cW;
                  const y = padT + cH - (nwWithDebt(yr) / maxNW) * cH;
                  return `${yr === 0 ? "M" : "L"} ${x} ${y}`;
                }).join(" ")}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              {/* Debt free path */}
              <path
                d={Array.from({ length: netWorthYears + 1 }, (_, yr) => {
                  const x = padL + (yr / netWorthYears) * cW;
                  const y = padT + cH - (nwDebtFree(yr) / maxNW) * cH;
                  return `${yr === 0 ? "M" : "L"} ${x} ${y}`;
                }).join(" ")}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
              />
              {/* Debt-free marker */}
              <line
                x1={padL + (debtFreeYear / netWorthYears) * cW}
                y1={padT}
                x2={padL + (debtFreeYear / netWorthYears) * cW}
                y2={padT + cH}
                stroke="#22c55e"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.5"
              />
              <text
                x={padL + (debtFreeYear / netWorthYears) * cW + 4}
                y={padT + 14}
                fill="#22c55e"
                fontSize="8"
              >
                Debt free
              </text>
              {/* Legend */}
              <line x1={padL} y1={padT} x2={padL + 16} y2={padT} stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
              <text x={padL + 20} y={padT + 4} fill="#a3a3a3" fontSize="9">With debt</text>
              <line x1={padL + 70} y1={padT} x2={padL + 86} y2={padT} stroke="#22c55e" strokeWidth="2" />
              <text x={padL + 90} y={padT + 4} fill="#a3a3a3" fontSize="9">Debt free path</text>
            </svg>
            <div className="flex items-start gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
              <span className="text-xs text-green-300">
                Becoming debt-free by year {debtFreeYear} redirects{" "}
                {fmt(totalMinPayment + 500)}/mo to investments — worth{" "}
                {fmtK((totalMinPayment + 500) * 12 * (netWorthYears - debtFreeYear))} in contributions over the remaining period.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DebtManagementPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Suppress unused NOISE warning — values were consumed at module init
  void NOISE;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-100">Personal Debt Management</h1>
            <p className="text-xs text-neutral-500">
              Avalanche vs snowball · Mortgage optimization · Credit mastery · Debt freedom
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              <DollarSign className="w-3 h-3 mr-1" />
              Debt-Free Journey
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Financial Freedom
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6 bg-neutral-900 border border-neutral-800">
          {[
            { id: "overview", label: "Debt Overview", icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { id: "strategies", label: "Payoff Strategies", icon: <Target className="w-3.5 h-3.5" /> },
            { id: "mortgage", label: "Mortgage", icon: <Home className="w-3.5 h-3.5" /> },
            { id: "credit", label: "Credit & Behavioral", icon: <CreditCard className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5 text-xs data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100"
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="overview" data-[state=inactive]:hidden>
              <DebtOverviewTab />
            </TabsContent>
            <TabsContent value="strategies" data-[state=inactive]:hidden>
              <PayoffStrategiesTab />
            </TabsContent>
            <TabsContent value="mortgage" data-[state=inactive]:hidden>
              <MortgageOptimizationTab />
            </TabsContent>
            <TabsContent value="credit" data-[state=inactive]:hidden>
              <CreditBehavioralTab />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
