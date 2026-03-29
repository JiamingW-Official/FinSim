"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Heart,
  Shield,
  Calendar,
  BarChart3,
  PieChart,
  Layers,
  Activity,
  Clock,
  ChevronRight,
  Landmark,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── PRNG ──────────────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

// ── IRS Uniform Lifetime Table (simplified) ───────────────────────────────────

const UNIFORM_LIFETIME: Record<number, number> = {
  73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
  80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2,
  87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2,
};

// ── Tab 1: Retirement Readiness Dashboard ────────────────────────────────────

interface ReadinessState {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  incomeNeeded: number;
  hasEmergencyFund: boolean;
  maxing401k: boolean;
  hasRothIRA: boolean;
  isDebtFree: boolean;
}

const DEFAULT_READINESS: ReadinessState = {
  currentAge: 35,
  retirementAge: 65,
  currentSavings: 85000,
  monthlyContribution: 1200,
  expectedReturn: 7,
  incomeNeeded: 60000,
  hasEmergencyFund: true,
  maxing401k: false,
  hasRothIRA: true,
  isDebtFree: false,
};

function calcFutureValue(pv: number, pmt: number, r: number, n: number): number {
  const monthlyRate = r / 100 / 12;
  const months = n * 12;
  if (monthlyRate === 0) return pv + pmt * months;
  return pv * Math.pow(1 + monthlyRate, months) + pmt * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

function RetirementScore({ score }: { score: number }) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const angle = (clampedScore / 100) * 180 - 90; // -90 to +90 degrees
  const needleRad = (angle * Math.PI) / 180;
  const cx = 100, cy = 90, r = 70;
  const nx = cx + r * 0.75 * Math.cos(needleRad);
  const ny = cy + r * 0.75 * Math.sin(needleRad);

  const scoreColor =
    score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  // Arc from 180 to 0 (left to right)
  function arcPath(startDeg: number, endDeg: number): string {
    const s = ((startDeg - 90) * Math.PI) / 180;
    const e = ((endDeg - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-48 h-28">
        {/* Background arc */}
        <path d={arcPath(180, 360)} stroke="#27272a" strokeWidth={12} fill="none" strokeLinecap="round" />
        {/* Red zone 0-33 */}
        <path d={arcPath(180, 240)} stroke="#ef4444" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.5} />
        {/* Amber zone 33-66 */}
        <path d={arcPath(240, 300)} stroke="#f59e0b" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.5} />
        {/* Green zone 66-100 */}
        <path d={arcPath(300, 360)} stroke="#10b981" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.5} />
        {/* Score fill */}
        <path
          d={arcPath(180, 180 + clampedScore * 1.8)}
          stroke={scoreColor}
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
        />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={4} fill="hsl(var(--foreground))" />
        {/* Score text */}
        <text x={cx} y={cy + 20} textAnchor="middle" fill={scoreColor} fontSize={22} fontWeight="bold">
          {Math.round(clampedScore)}
        </text>
        <text x={cx} y={cy + 32} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={8}>
          RETIREMENT SCORE
        </text>
        {/* Labels */}
        <text x={28} y={cy + 4} fill="hsl(var(--muted-foreground))" fontSize={7}>0</text>
        <text x={168} y={cy + 4} fill="hsl(var(--muted-foreground))" fontSize={7}>100</text>
      </svg>
      <p className="text-sm text-muted-foreground mt-1">
        {score >= 75 ? "On Track" : score >= 50 ? "Needs Attention" : "At Risk"}
      </p>
    </div>
  );
}

function ReadinessTab() {
  const [state, setState] = useState<ReadinessState>(DEFAULT_READINESS);

  const calc = useMemo(() => {
    const years = state.retirementAge - state.currentAge;
    const nestEgg = calcFutureValue(state.currentSavings, state.monthlyContribution, state.expectedReturn, years);
    const annualFromSavings = nestEgg * 0.04; // 4% rule
    const gap = state.incomeNeeded - annualFromSavings;
    const monthlyGap = gap > 0 ? gap / 12 : 0;

    // Score: multiple factors weighted
    const coverageRatio = annualFromSavings / state.incomeNeeded;
    const twentyFiveX = state.currentSavings >= state.incomeNeeded * 25;

    let score = 0;
    score += Math.min(40, coverageRatio * 40); // 40 pts for coverage
    score += state.hasEmergencyFund ? 15 : 0;
    score += state.maxing401k ? 15 : 0;
    score += state.hasRothIRA ? 10 : 0;
    score += state.isDebtFree ? 10 : 0;
    score += twentyFiveX ? 10 : 0;

    return { nestEgg, annualFromSavings, gap, monthlyGap, score, twentyFiveX, coverageRatio };
  }, [state]);

  function numInput(key: keyof ReadinessState, label: string, min: number, max: number, step: number) {
    const val = state[key] as number;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-muted-foreground">{label}</label>
          <span className="text-xs font-mono font-semibold text-foreground">
            {key === "expectedReturn" ? fmtPct(val) : fmtK(val)}
          </span>
        </div>
        <Slider
          min={min} max={max} step={step}
          value={[val]}
          onValueChange={([v]) => setState((s) => ({ ...s, [key]: v }))}
          className="w-full"
        />
      </div>
    );
  }

  function ageInput(key: keyof ReadinessState, label: string, min: number, max: number) {
    const val = state[key] as number;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-muted-foreground">{label}</label>
          <span className="text-xs font-mono font-semibold text-foreground">{val} yrs</span>
        </div>
        <Slider
          min={min} max={max} step={1}
          value={[val]}
          onValueChange={([v]) => setState((s) => ({ ...s, [key]: v }))}
          className="w-full"
        />
      </div>
    );
  }

  const milestones = [
    { label: "Emergency Fund (3-6 months)", done: state.hasEmergencyFund, key: "hasEmergencyFund" as const },
    { label: "Max 401k Contribution", done: state.maxing401k, key: "maxing401k" as const },
    { label: "Roth IRA Funded", done: state.hasRothIRA, key: "hasRothIRA" as const },
    { label: "Debt-Free (excl. mortgage)", done: state.isDebtFree, key: "isDebtFree" as const },
    { label: "25x Income Rule", done: calc.twentyFiveX, key: null },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Score + summary */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="p-6 flex flex-col items-center gap-2 border-l-4 border-l-primary">
          <RetirementScore score={calc.score} />
          <div className="w-full space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Projected Nest Egg</span>
              <span className="font-semibold text-emerald-500">{fmtK(calc.nestEgg)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Annual Income (4%)</span>
              <span className="font-medium">{fmtK(calc.annualFromSavings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Income Needed</span>
              <span className="font-medium">{fmtK(state.incomeNeeded)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-muted-foreground">Monthly Gap</span>
              <span className={cn("font-semibold", calc.gap > 0 ? "text-red-500" : "text-emerald-500")}>
                {calc.gap > 0 ? `+${fmtK(calc.monthlyGap)}/mo needed` : "Fully Covered!"}
              </span>
            </div>
          </div>
        </Card>

        {/* Milestones */}
        <Card className="p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-3">Milestones</p>
          {milestones.map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              {m.key ? (
                <button
                  onClick={() => setState((s) => ({ ...s, [m.key!]: !s[m.key!] }))}
                  className="shrink-0"
                >
                  {m.done
                    ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                    : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
                </button>
              ) : (
                <span className="shrink-0">
                  {m.done
                    ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                    : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
                </span>
              )}
              <span className={cn("text-xs", m.done ? "text-foreground" : "text-muted-foreground")}>{m.label}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Inputs */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-4 space-y-4">
          <p className="text-xs font-medium text-muted-foreground">Your Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ageInput("currentAge", "Current Age", 20, 70)}
            {ageInput("retirementAge", "Target Retirement Age", 50, 80)}
            {numInput("currentSavings", "Current Retirement Savings", 0, 2_000_000, 5000)}
            {numInput("monthlyContribution", "Monthly Contribution", 0, 10_000, 100)}
            {numInput("expectedReturn", "Expected Annual Return", 1, 15, 0.5)}
            {numInput("incomeNeeded", "Annual Income Needed in Retirement", 20_000, 300_000, 5000)}
          </div>
        </Card>

        {/* Coverage bar */}
        <Card className="p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Coverage Analysis</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Savings Coverage</span>
              <span>{fmtPct(calc.coverageRatio * 100)} of goal</span>
            </div>
            <Progress value={Math.min(100, calc.coverageRatio * 100)} className="h-3" />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-muted-foreground">Years to Retire</p>
              <p className="font-semibold text-lg">{state.retirementAge - state.currentAge}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-muted-foreground">Total Contributions</p>
              <p className="font-medium text-lg">{fmtK(state.monthlyContribution * 12 * (state.retirementAge - state.currentAge))}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-muted-foreground">Investment Growth</p>
              <p className="font-medium text-lg text-emerald-500">{fmtK(calc.nestEgg - state.currentSavings - state.monthlyContribution * 12 * (state.retirementAge - state.currentAge))}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 2: Account Comparison ─────────────────────────────────────────────────

const ACCOUNTS = [
  {
    name: "401(k)",
    limit2024: "$23,000",
    catchUp: "$30,500 (50+)",
    match: "Up to employer",
    taxTreatment: "Pre-tax",
    rmd: "Age 73",
    investments: "Limited (plan menu)",
    keyBenefit: "Employer match, high limits",
    color: "text-primary",
  },
  {
    name: "403(b)",
    limit2024: "$23,000",
    catchUp: "$30,500 (50+)",
    match: "Up to employer",
    taxTreatment: "Pre-tax",
    rmd: "Age 73",
    investments: "Limited (plan menu)",
    keyBenefit: "Nonprofits & educators",
    color: "text-indigo-400",
  },
  {
    name: "Traditional IRA",
    limit2024: "$7,000",
    catchUp: "$8,000 (50+)",
    match: "None",
    taxTreatment: "Pre-tax*",
    rmd: "Age 73",
    investments: "Broad (any broker)",
    keyBenefit: "Deductible if income eligible",
    color: "text-primary",
  },
  {
    name: "Roth IRA",
    limit2024: "$7,000",
    catchUp: "$8,000 (50+)",
    match: "None",
    taxTreatment: "Post-tax",
    rmd: "None",
    investments: "Broad (any broker)",
    keyBenefit: "Tax-free growth & withdrawals",
    color: "text-emerald-400",
  },
  {
    name: "SEP IRA",
    limit2024: "25% comp / $69K",
    catchUp: "Same limit",
    match: "Self-funded",
    taxTreatment: "Pre-tax",
    rmd: "Age 73",
    investments: "Broad (any broker)",
    keyBenefit: "Self-employed, high limits",
    color: "text-amber-400",
  },
  {
    name: "Solo 401(k)",
    limit2024: "$69,000",
    catchUp: "$76,500 (50+)",
    match: "Self-funded",
    taxTreatment: "Pre or Post-tax",
    rmd: "Age 73",
    investments: "Broad (any broker)",
    keyBenefit: "Highest limits, self-employed",
    color: "text-orange-400",
  },
  {
    name: "HSA",
    limit2024: "$4,150 / $8,300 fam",
    catchUp: "+$1,000 (55+)",
    match: "Possible",
    taxTreatment: "Triple tax advantage",
    rmd: "None (healthcare)",
    investments: "Broker-dependent",
    keyBenefit: "Medical + retirement combo",
    color: "text-rose-400",
  },
];

function AccountsTab() {
  const [nowRate, setNowRate] = useState(22);
  const [retireRate, setRetireRate] = useState(15);
  const [matchPct, setMatchPct] = useState(50);
  const [salaryK, setSalaryK] = useState(80);

  const rothBetter = retireRate > nowRate;
  const breakEvenYears = useMemo(() => {
    // Simple break-even: Roth pays post-tax now, Traditional saves tax now but pays later
    // Break-even when tax savings compound to match = (1 - nowRate/100)/(1 - retireRate/100)
    const ratio = (1 - nowRate / 100) / (1 - retireRate / 100);
    return ratio;
  }, [nowRate, retireRate]);

  const matchLeaving = salaryK * 1000 * (matchPct / 100) * 0.03; // leaving 3% uncaptured if no match

  return (
    <div className="space-y-4">
      {/* Account table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Account</th>
                <th className="text-left p-3 font-medium text-muted-foreground">2024 Limit</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Catch-Up (50+)</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Employer Match</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Tax Treatment</th>
                <th className="text-left p-3 font-medium text-muted-foreground">RMDs</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Key Benefit</th>
              </tr>
            </thead>
            <tbody>
              {ACCOUNTS.map((a, i) => (
                <tr key={a.name} className={cn("border-b border-border/20 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "" : "bg-muted/10")}>
                  <td className="p-3">
                    <span className={cn("font-medium", a.color)}>{a.name}</span>
                  </td>
                  <td className="p-3 font-mono">{a.limit2024}</td>
                  <td className="p-3 font-mono">{a.catchUp}</td>
                  <td className="p-3">{a.match}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-xs text-muted-foreground py-0">
                      {a.taxTreatment}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{a.rmd}</td>
                  <td className="p-3 text-muted-foreground">{a.keyBenefit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground/60 px-3 pb-2">* Traditional IRA deductibility phases out at higher incomes if covered by workplace plan.</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Roth vs Traditional */}
        <Card className="p-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/50" />
            Roth vs. Traditional Break-Even
          </p>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Current Marginal Tax Rate</span>
                <span className="font-mono font-medium text-foreground">{nowRate}%</span>
              </div>
              <Slider min={10} max={37} step={1} value={[nowRate]} onValueChange={([v]) => setNowRate(v)} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Expected Retirement Tax Rate</span>
                <span className="font-mono font-medium text-foreground">{retireRate}%</span>
              </div>
              <Slider min={0} max={37} step={1} value={[retireRate]} onValueChange={([v]) => setRetireRate(v)} />
            </div>
            <div className={cn("rounded-lg p-3 text-sm", rothBetter ? "bg-emerald-500/5 border border-emerald-500/30" : "bg-muted/10 border border-border")}>
              {rothBetter ? (
                <p><span className="font-medium text-emerald-400">Roth IRA is better</span> — you expect a higher tax rate in retirement. Pay taxes now at {nowRate}%, withdraw tax-free later.</p>
              ) : nowRate === retireRate ? (
                <p className="text-muted-foreground">Tax rates are equal — either account type works. Roth has the edge (no RMDs, tax-free heirs).</p>
              ) : (
                <p><span className="font-medium text-primary">Traditional is better</span> — you expect a lower tax rate in retirement. Defer taxes now at {nowRate}%, pay {retireRate}% later.</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Roth after-tax value multiplier: {breakEvenYears.toFixed(3)}x per dollar contributed
              </p>
            </div>
          </div>
        </Card>

        {/* Employer Match Optimizer */}
        <Card className="p-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-400" />
            Employer Match Optimizer
          </p>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Annual Salary</span>
                <span className="font-mono font-medium text-foreground">{fmtK(salaryK * 1000)}</span>
              </div>
              <Slider min={30} max={300} step={5} value={[salaryK]} onValueChange={([v]) => setSalaryK(v)} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Employer Match (% of your contribution)</span>
                <span className="font-mono font-medium text-foreground">{matchPct}%</span>
              </div>
              <Slider min={0} max={100} step={5} value={[matchPct]} onValueChange={([v]) => setMatchPct(v)} />
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm">
              <p className="text-amber-400 font-medium">Free Money Alert!</p>
              <p className="text-xs text-muted-foreground mt-1">
                If you contribute at least 3% of salary, your employer adds{" "}
                <span className="font-medium text-foreground">{fmtK(matchPct / 100 * salaryK * 1000 * 0.03)}/yr</span>.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Not contributing enough to get the full match costs you{" "}
                <span className="font-medium text-red-400">{fmtK(matchLeaving)}/yr</span> in free compensation.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 3: Social Security Optimizer ─────────────────────────────────────────

function SocialSecurityTab() {
  const [lifeExpectancy, setLifeExpectancy] = useState(85);

  const CLAIMING = [
    { age: 62, label: "Early (62)", monthly: 1800, color: "#ef4444" },
    { age: 67, label: "Full (67)", monthly: 2400, color: "#f59e0b" },
    { age: 70, label: "Delayed (70)", monthly: 2976, color: "#10b981" },
  ];

  // Cumulative benefit from age 62 to lifeExpectancy
  const breakEvenData = useMemo(() => {
    const ages = Array.from({ length: lifeExpectancy - 62 + 1 }, (_, i) => 62 + i);
    return ages.map((age) => {
      const vals: Record<string, number> = {};
      CLAIMING.forEach((c) => {
        const months = age < c.age ? 0 : (age - c.age + 1) * 12;
        vals[c.label] = c.monthly * months;
      });
      return { age, ...vals };
    });
  }, [lifeExpectancy]);

  // Break-even ages
  const be62_67 = useMemo(() => {
    // Total from 62 at $1800 vs total from 67 at $2400
    // 1800*m = 2400*(m - 60) => 1800m = 2400m - 144000 => 600m = 144000 => m = 240 months => age 62+20 = 82
    return 62 + Math.round((2400 * 60) / (2400 - 1800) / 12);
  }, []);
  const be67_70 = useMemo(() => {
    // total from 67 at $2400 vs total from 70 at $2976
    // 2400*(m) = 2976*(m-36) => 2400m = 2976m - 107136 => 576m = 107136 => m = 186 => age 67+186/12 ~ 82.5
    return 67 + Math.round((2976 * 36) / (2976 - 2400) / 12);
  }, []);

  // SVG chart
  const svgW = 500, svgH = 200;
  const maxAge = 90;
  const minAge = 62;
  const maxVal = CLAIMING[2].monthly * (maxAge - 62 + 1) * 12;

  function xPos(age: number) {
    return ((age - minAge) / (maxAge - minAge)) * (svgW - 60) + 30;
  }
  function yPos(val: number) {
    return svgH - 20 - (val / maxVal) * (svgH - 30);
  }

  const lineData = useMemo(() => {
    const ages = Array.from({ length: maxAge - minAge + 1 }, (_, i) => minAge + i);
    return CLAIMING.map((c) => {
      const pts = ages.map((age) => {
        const months = age < c.age ? 0 : (age - c.age + 1) * 12;
        return { age, val: c.monthly * months };
      });
      return { ...c, pts };
    });
  }, []);

  function pathStr(pts: { age: number; val: number }[]) {
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xPos(p.age)} ${yPos(p.val)}`).join(" ");
  }

  const lifeX = xPos(lifeExpectancy);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {CLAIMING.map((c) => {
          const yearsCollecting = Math.max(0, lifeExpectancy - c.age);
          const total = c.monthly * 12 * yearsCollecting;
          return (
            <Card key={c.age} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{c.label}</p>
                <Badge variant="outline" style={{ borderColor: c.color, color: c.color }} className="text-xs">
                  Claim at {c.age}
                </Badge>
              </div>
              <p className="text-2xl font-semibold" style={{ color: c.color }}>${c.monthly.toLocaleString()}/mo</p>
              <p className="text-xs text-muted-foreground">
                ${(c.monthly * 12).toLocaleString()}/year
              </p>
              <div className="border-t border-border pt-2">
                <p className="text-xs text-muted-foreground">Total by age {lifeExpectancy}</p>
                <p className="text-sm font-medium">{fmtK(total)}</p>
              </div>
              {c.age === 62 && (
                <p className="text-xs text-muted-foreground">25% reduction vs FRA</p>
              )}
              {c.age === 70 && (
                <p className="text-xs text-emerald-400">24% bonus vs FRA</p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Life expectancy slider */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-400" />
          <p className="text-sm font-medium">Break-Even Calculator</p>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Life Expectancy / Health Horizon</span>
            <span className="font-mono font-medium text-foreground">Age {lifeExpectancy}</span>
          </div>
          <Slider min={65} max={95} step={1} value={[lifeExpectancy]} onValueChange={([v]) => setLifeExpectancy(v)} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-muted-foreground">62 vs 67 Break-Even</p>
            <p className="font-medium text-base">Age {be62_67}</p>
            <p className="text-muted-foreground">{lifeExpectancy < be62_67 ? "Take at 62 (live shorter)" : "Take at 67 (live longer)"}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-muted-foreground">67 vs 70 Break-Even</p>
            <p className="font-medium text-base">Age {be67_70}</p>
            <p className="text-muted-foreground">{lifeExpectancy < be67_70 ? "Take at 67 (live shorter)" : "Take at 70 (live longer)"}</p>
          </div>
        </div>
      </Card>

      {/* Cumulative benefits chart */}
      <Card className="p-4 space-y-2">
        <p className="text-sm font-medium">Cumulative Lifetime Benefits (Age 62–90)</p>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ minWidth: 320 }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <line key={pct} x1={30} y1={yPos(maxVal * pct)} x2={svgW - 30} y2={yPos(maxVal * pct)}
                stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3,3" />
            ))}
            {/* Lines */}
            {lineData.map((c) => (
              <path key={c.age} d={pathStr(c.pts)} stroke={c.color} strokeWidth={1.5} fill="none" />
            ))}
            {/* Life expectancy line */}
            <line x1={lifeX} y1={10} x2={lifeX} y2={svgH - 20} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4,2" />
            <text x={lifeX + 3} y={18} fill="hsl(var(--muted-foreground))" fontSize={7}>Exp {lifeExpectancy}</text>
            {/* Labels */}
            {lineData.map((c) => {
              const lastPt = c.pts[c.pts.length - 1];
              return (
                <text key={c.age} x={xPos(lastPt.age) - 2} y={yPos(lastPt.val) - 4} fill={c.color} fontSize={7} textAnchor="end">
                  {c.label}
                </text>
              );
            })}
            {/* X-axis labels */}
            {[62, 67, 70, 75, 80, 85, 90].map((age) => (
              <text key={age} x={xPos(age)} y={svgH - 5} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={7}>
                {age}
              </text>
            ))}
            {/* Y-axis label */}
            <text x={8} y={svgH / 2} transform={`rotate(-90, 8, ${svgH / 2})`} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={7}>
              Total Received
            </text>
          </svg>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
          {lineData.map((c) => (
            <span key={c.age} className="flex items-center gap-1">
              <span className="inline-block w-3 h-0.5" style={{ backgroundColor: c.color }} />
              {c.label}
            </span>
          ))}
        </div>
      </Card>

      {/* Spousal + WEP info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-muted-foreground/50" />
            Spousal Benefits
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex gap-2"><ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-primary" />You receive the <strong className="text-foreground">higher of</strong> your own benefit or 50% of your spouse's FRA benefit.</li>
            <li className="flex gap-2"><ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-primary" />Spousal benefit does not increase beyond FRA — no advantage to delaying past 67 for spousal only.</li>
            <li className="flex gap-2"><ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-primary" />Divorced spouses (10+ yr marriage) may also claim spousal benefit.</li>
            <li className="flex gap-2"><ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-primary" />Survivor benefit: up to 100% of deceased spouse's benefit.</li>
          </ul>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Windfall Elimination Provision (WEP)
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex gap-2"><ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-primary" />Applies if you receive a pension from non-SS-covered employment (e.g., some government jobs).</li>
            <li className="flex gap-2"><ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-primary" />Reduces — but does not eliminate — your Social Security benefit.</li>
            <li className="flex gap-2"><ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-primary" />Maximum reduction is the lesser of half the pension amount or a formula-based cap.</li>
            <li className="flex gap-2"><ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-primary" />30+ years of SS-covered "substantial earnings" exempts you from WEP.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 4: Investment Strategy by Age ─────────────────────────────────────────

const TARGET_DATE_FUNDS = [
  {
    name: "2030",
    stocks: 45,
    bonds: 45,
    cash: 10,
    color: "#ef4444",
    desc: "Conservative, near retirement",
  },
  {
    name: "2040",
    stocks: 65,
    bonds: 30,
    cash: 5,
    color: "#f59e0b",
    desc: "Moderate, 15+ years",
  },
  {
    name: "2050",
    stocks: 80,
    bonds: 18,
    cash: 2,
    color: "#3b82f6",
    desc: "Growth-oriented, 25+ years",
  },
  {
    name: "2060",
    stocks: 90,
    bonds: 9,
    cash: 1,
    color: "#10b981",
    desc: "Aggressive growth, 35+ years",
  },
];

const GLIDE_PATH = [
  { age: 25, stocks: 90 },
  { age: 30, stocks: 85 },
  { age: 35, stocks: 80 },
  { age: 40, stocks: 75 },
  { age: 45, stocks: 70 },
  { age: 50, stocks: 65 },
  { age: 55, stocks: 60 },
  { age: 60, stocks: 50 },
  { age: 65, stocks: 40 },
  { age: 70, stocks: 35 },
  { age: 75, stocks: 30 },
  { age: 80, stocks: 30 },
];

// Sequence of returns: two retirees, $1M, avg 6%, one gets good returns early, one bad
function generateSeqReturns() {
  const prng = mulberry32(42);
  const goodReturns = [0.18, 0.15, 0.12, 0.08, 0.06, 0.05, 0.04, -0.02, -0.05, -0.08, -0.10, -0.12, 0.06, 0.07, 0.08, 0.06, 0.05, 0.06, 0.07, 0.05];
  const badReturns = [...goodReturns].reverse();
  const withdrawal = 50000;
  let goodBal = 1_000_000;
  let badBal = 1_000_000;
  const data: { year: number; good: number; bad: number }[] = [];
  for (let i = 0; i < 20; i++) {
    goodBal = Math.max(0, goodBal * (1 + goodReturns[i]) - withdrawal);
    badBal = Math.max(0, badBal * (1 + badReturns[i]) - withdrawal);
    data.push({ year: i + 1, good: goodBal, bad: badBal });
  }
  return data;
}

const SEQ_DATA = generateSeqReturns();

function InvestmentStrategyTab() {
  const svgW = 480, svgH = 160;
  const minAge = 25, maxAge = 80;

  function gpX(age: number) {
    return ((age - minAge) / (maxAge - minAge)) * (svgW - 60) + 30;
  }
  function gpY(pct: number) {
    return svgH - 20 - (pct / 100) * (svgH - 30);
  }

  const gpPath = GLIDE_PATH.map((p, i) =>
    `${i === 0 ? "M" : "L"} ${gpX(p.age)} ${gpY(p.stocks)}`
  ).join(" ");
  const gpFill = GLIDE_PATH.map((p, i) =>
    `${i === 0 ? "M" : "L"} ${gpX(p.age)} ${gpY(p.stocks)}`
  ).join(" ") + ` L ${gpX(80)} ${svgH - 20} L ${gpX(25)} ${svgH - 20} Z`;

  // Seq of returns chart
  const seqW = 480, seqH = 160;
  const maxSeqVal = 1_200_000;
  function seqX(yr: number) {
    return ((yr - 1) / 19) * (seqW - 60) + 30;
  }
  function seqY(val: number) {
    return seqH - 20 - (Math.max(0, val) / maxSeqVal) * (seqH - 30);
  }
  const seqPathGood = SEQ_DATA.map((d, i) => `${i === 0 ? "M" : "L"} ${seqX(d.year)} ${seqY(d.good)}`).join(" ");
  const seqPathBad = SEQ_DATA.map((d, i) => `${i === 0 ? "M" : "L"} ${seqX(d.year)} ${seqY(d.bad)}`).join(" ");

  return (
    <div className="space-y-4">
      {/* Glide path */}
      <Card className="p-4 space-y-2">
        <p className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50" />
          Glide Path: Stock Allocation by Age
        </p>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ minWidth: 300 }}>
            {/* Grid */}
            {[0, 25, 50, 75, 100].map((pct) => (
              <line key={pct} x1={30} y1={gpY(pct)} x2={svgW - 30} y2={gpY(pct)}
                stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3,3" />
            ))}
            {/* Fill area */}
            <path d={gpFill} fill="#3b82f6" opacity={0.12} />
            {/* Line */}
            <path d={gpPath} stroke="#3b82f6" strokeWidth={2} fill="none" />
            {/* Points */}
            {GLIDE_PATH.map((p) => (
              <circle key={p.age} cx={gpX(p.age)} cy={gpY(p.stocks)} r={3} fill="#3b82f6" />
            ))}
            {/* X labels */}
            {[25, 35, 45, 55, 65, 75].map((age) => (
              <text key={age} x={gpX(age)} y={svgH - 6} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={7}>
                {age}
              </text>
            ))}
            {/* Y labels */}
            {[0, 25, 50, 75, 100].map((pct) => (
              <text key={pct} x={24} y={gpY(pct) + 3} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={7}>
                {pct}%
              </text>
            ))}
            {/* Bond tent annotation */}
            <text x={gpX(65)} y={gpY(40) - 8} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={6.5}>
              Bond tent
            </text>
            <text x={gpX(65)} y={gpY(40) - 0} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={6.5}>
              at retirement
            </text>
          </svg>
        </div>
        <p className="text-xs text-muted-foreground">
          Stocks decline from ~90% at age 25 to ~40% at age 65. Bond tent strategy temporarily raises bonds at retirement to reduce sequence-of-returns risk, then gradually returns to stocks.
        </p>
      </Card>

      {/* Target date funds */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium flex items-center gap-2">
          <PieChart className="h-3.5 w-3.5 text-muted-foreground/50" />
          Target Date Fund Comparison
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TARGET_DATE_FUNDS.map((f) => {
            const stockBar = f.stocks;
            const bondBar = f.bonds;
            const cashBar = f.cash;
            return (
              <div key={f.name} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm" style={{ color: f.color }}>Fund {f.name}</p>
                  <Badge variant="outline" className="text-xs py-0" style={{ borderColor: f.color }}>TDF</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
                {/* Stacked bar */}
                <div className="h-4 rounded-full overflow-hidden flex">
                  <div style={{ width: `${stockBar}%`, backgroundColor: "#3b82f6" }} title={`Stocks ${stockBar}%`} />
                  <div style={{ width: `${bondBar}%`, backgroundColor: "#f59e0b" }} title={`Bonds ${bondBar}%`} />
                  <div style={{ width: `${cashBar}%`, backgroundColor: "#6b7280" }} title={`Cash ${cashBar}%`} />
                </div>
                <div className="space-y-0.5 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span className="text-primary">Stocks</span><span>{stockBar}%</span></div>
                  <div className="flex justify-between"><span className="text-amber-400">Bonds</span><span>{bondBar}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cash</span><span>{cashBar}%</span></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary" />Stocks</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500" />Bonds</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-muted-foreground" />Cash</span>
        </div>
      </Card>

      {/* Sequence of returns */}
      <Card className="p-4 space-y-2">
        <p className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Sequence of Returns Risk
        </p>
        <p className="text-xs text-muted-foreground">
          Two retirees, both start with $1M and withdraw $50K/year. Same average return (~6%) but different order. Early bad returns devastate the portfolio.
        </p>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${seqW} ${seqH}`} className="w-full" style={{ minWidth: 300 }}>
            {[0, 400000, 800000, 1200000].map((v) => (
              <line key={v} x1={30} y1={seqY(v)} x2={seqW - 30} y2={seqY(v)}
                stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3,3" />
            ))}
            <path d={seqPathGood} stroke="#10b981" strokeWidth={1.5} fill="none" />
            <path d={seqPathBad} stroke="#ef4444" strokeWidth={1.5} fill="none" />
            {[1, 5, 10, 15, 20].map((yr) => (
              <text key={yr} x={seqX(yr)} y={seqH - 5} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={7}>
                Yr {yr}
              </text>
            ))}
            {[0, 400, 800, 1200].map((v) => (
              <text key={v} x={24} y={seqY(v * 1000) + 3} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={7}>
                ${v}K
              </text>
            ))}
            {/* Labels */}
            <text x={seqX(SEQ_DATA.length) - 5} y={seqY(SEQ_DATA[SEQ_DATA.length - 1].good) - 5}
              fill="#10b981" fontSize={7} textAnchor="end">Good early</text>
            <text x={seqX(SEQ_DATA.length) - 5} y={seqY(SEQ_DATA[SEQ_DATA.length - 1].bad) + 10}
              fill="#ef4444" fontSize={7} textAnchor="end">Bad early</text>
          </svg>
        </div>
      </Card>

      {/* Bucket strategy */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-muted-foreground/50" />
          Bucket Strategy
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Bucket 1",
              horizon: "0–2 Years",
              assets: "Cash, Money Market, CDs",
              purpose: "Immediate living expenses. Never disrupted by market volatility.",
              pct: "5–10%",
              color: "text-primary",
              border: "border-border",
              bg: "bg-muted/5",
            },
            {
              label: "Bucket 2",
              horizon: "3–10 Years",
              assets: "Short/Intermediate Bonds, Dividend Stocks",
              purpose: "Replenish Bucket 1 during market downturns. Moderate growth.",
              pct: "20–30%",
              color: "text-amber-400",
              border: "border-amber-500/30",
              bg: "bg-amber-500/5",
            },
            {
              label: "Bucket 3",
              horizon: "10+ Years",
              assets: "Stocks, REITs, Growth Assets",
              purpose: "Long-term growth. Can withstand volatility; won't be touched for a decade.",
              pct: "60–75%",
              color: "text-emerald-400",
              border: "border-emerald-500/30",
              bg: "bg-emerald-500/5",
            },
          ].map((b) => (
            <div key={b.label} className={cn("rounded-lg border p-3 space-y-1.5", b.border, b.bg)}>
              <div className="flex items-center justify-between">
                <p className={cn("font-medium text-sm", b.color)}>{b.label}</p>
                <Badge variant="outline" className="text-xs text-muted-foreground">{b.pct}</Badge>
              </div>
              <p className="text-xs font-medium text-foreground">{b.horizon}</p>
              <p className="text-xs text-muted-foreground font-medium">{b.assets}</p>
              <p className="text-xs text-muted-foreground">{b.purpose}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 5: Healthcare & RMDs ─────────────────────────────────────────────────

function HealthcareRMDsTab() {
  const [iraBalance, setIraBalance] = useState(500000);

  const rmdData = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const age = 73 + i;
      const divisor = UNIFORM_LIFETIME[age] ?? 12.2;
      const rmd = iraBalance / divisor;
      return { age, rmd, divisor };
    });
  }, [iraBalance]);

  const maxRmd = Math.max(...rmdData.map((d) => d.rmd));
  const barW = 460, barH = 160;
  const numBars = rmdData.length;
  const barWidth = (barW - 50) / numBars - 2;

  function barX(i: number) {
    return 30 + i * ((barW - 50) / numBars);
  }
  function barY(rmd: number) {
    return barH - 20 - (rmd / maxRmd) * (barH - 30);
  }
  function barHeight(rmd: number) {
    return (rmd / maxRmd) * (barH - 30);
  }

  return (
    <div className="space-y-4">
      {/* Medicare timeline */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-400" />
          Medicare Enrollment Timeline
        </p>
        <div className="flex items-start gap-3 flex-wrap">
          {[
            { age: "Age 65", event: "Medicare Eligibility Begins", detail: "Initial enrollment window: 3 months before, month of, 3 months after your 65th birthday (7-month window).", color: "bg-muted/10 border-primary/40" },
            { age: "Late Penalty", event: "Part B Penalty", detail: "10% premium increase for each 12-month period you could have enrolled but didn't (unless you have qualifying employer coverage).", color: "bg-red-500/20 border-red-500/40" },
            { age: "Age 65+", event: "Special Enrollment", detail: "If covered by employer plan at 65, you have 8 months to enroll in Part B after losing employer coverage.", color: "bg-emerald-500/20 border-emerald-500/40" },
          ].map((e) => (
            <div key={e.age} className={cn("flex-1 min-w-[200px] rounded-lg border p-3 space-y-1", e.color)}>
              <p className="font-medium text-xs text-muted-foreground">{e.age}</p>
              <p className="text-xs text-muted-foreground font-medium">{e.event}</p>
              <p className="text-xs text-muted-foreground">{e.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Medicare parts */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-muted-foreground/50" />
          Medicare Parts Overview
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { part: "Part A", name: "Hospital", premium: "$0 (most)", covers: "Inpatient hospital, skilled nursing, hospice", deductible: "$1,632/benefit period", color: "text-primary", border: "border-border" },
            { part: "Part B", name: "Medical", premium: "~$174.70/mo", covers: "Doctor visits, outpatient care, preventive services", deductible: "$240/year", color: "text-indigo-400", border: "border-indigo-500/30" },
            { part: "Part C", name: "Advantage", premium: "Varies ($0+)", covers: "Combines A+B (often with D), offered by private insurers", deductible: "Plan varies", color: "text-primary", border: "border-border" },
            { part: "Part D", name: "Prescription Drugs", premium: "Varies (~$55/mo avg)", covers: "Prescription drug coverage through private plans", deductible: "Up to $545/year", color: "text-emerald-400", border: "border-emerald-500/30" },
          ].map((p) => (
            <div key={p.part} className={cn("rounded-lg border p-3 space-y-1", p.border)}>
              <div className="flex items-center gap-1">
                <span className={cn("font-medium text-sm", p.color)}>{p.part}</span>
                <span className="text-xs text-muted-foreground">— {p.name}</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{p.premium}</p>
              <p className="text-xs text-muted-foreground">{p.covers}</p>
              <p className="text-xs text-muted-foreground">{p.deductible}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Fidelity estimates</span> a 65-year-old couple will need approximately{" "}
            <span className="font-medium text-amber-400">$315,000</span> to cover healthcare costs in retirement (2023 estimate, not including long-term care).
          </p>
        </div>
      </Card>

      {/* RMD Calculator */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium flex items-center gap-2">
          <Calculator className="h-3.5 w-3.5 text-muted-foreground/50" />
          RMD Calculator (IRS Uniform Lifetime Table)
        </p>
        <p className="text-xs text-muted-foreground">
          Required Minimum Distributions begin at age 73 (SECURE Act 2.0). RMD = Account Balance / Distribution Period.
        </p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>IRA / 401(k) Balance</span>
            <span className="font-mono font-medium text-foreground">{fmtK(iraBalance)}</span>
          </div>
          <Slider min={50000} max={5_000_000} step={50000} value={[iraBalance]} onValueChange={([v]) => setIraBalance(v)} />
        </div>

        {/* Bar chart */}
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${barW} ${barH}`} className="w-full" style={{ minWidth: 360 }}>
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <line key={pct} x1={30} y1={barY(maxRmd * pct)} x2={barW - 20} y2={barY(maxRmd * pct)}
                stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3,3" />
            ))}
            {rmdData.map((d, i) => {
              const x = barX(i);
              const bh = barHeight(d.rmd);
              const by = barY(d.rmd);
              const colorPct = i / (rmdData.length - 1);
              const r = Math.round(59 + colorPct * (239 - 59));
              const g = Math.round(130 + colorPct * (68 - 130));
              const b = Math.round(246 + colorPct * (68 - 246));
              return (
                <g key={d.age}>
                  <rect x={x} y={by} width={barWidth} height={bh}
                    fill={`rgb(${r},${g},${b})`} rx={1} opacity={0.8} />
                  {i % 3 === 0 && (
                    <text x={x + barWidth / 2} y={barH - 6} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={6.5}>
                      {d.age}
                    </text>
                  )}
                </g>
              );
            })}
            {/* Y labels */}
            {[0, 0.5, 1].map((pct) => (
              <text key={pct} x={26} y={barY(maxRmd * pct) + 3} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={7}>
                {fmtK(maxRmd * pct)}
              </text>
            ))}
          </svg>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-1.5 text-muted-foreground font-medium">Age</th>
                <th className="text-left p-1.5 text-muted-foreground font-medium">IRS Divisor</th>
                <th className="text-right p-1.5 text-muted-foreground font-medium">Annual RMD</th>
                <th className="text-right p-1.5 text-muted-foreground font-medium">Monthly RMD</th>
              </tr>
            </thead>
            <tbody>
              {rmdData.map((d, i) => (
                <tr key={d.age} className={cn("border-b border-border/20 hover:bg-muted/20", i % 2 === 0 ? "" : "bg-muted/10")}>
                  <td className="p-1.5 font-medium">{d.age}</td>
                  <td className="p-1.5 text-muted-foreground">{d.divisor}</td>
                  <td className="p-1.5 text-right font-mono">{fmtK(d.rmd)}</td>
                  <td className="p-1.5 text-right font-mono text-muted-foreground">{fmtK(d.rmd / 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* QCD */}
      <Card className="p-4 space-y-2">
        <p className="text-sm font-medium flex items-center gap-2">
          <Landmark className="h-4 w-4 text-emerald-400" />
          Qualified Charitable Distribution (QCD)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex gap-2"><CheckCircle className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />Transfer up to <strong className="text-foreground">$105,000/year</strong> (2024) directly from IRA to charity.</li>
            <li className="flex gap-2"><CheckCircle className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />Counts toward your RMD — satisfies the requirement without income inclusion.</li>
            <li className="flex gap-2"><CheckCircle className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />Available at age 70½ and older (even before RMDs start at 73).</li>
          </ul>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex gap-2"><Info className="h-3 w-3 text-primary shrink-0 mt-0.5" />Must go directly from IRA custodian to charity — no "withdrawal then donate."</li>
            <li className="flex gap-2"><Info className="h-3 w-3 text-primary shrink-0 mt-0.5" />Reduces adjusted gross income — can lower Medicare premiums (IRMAA) and SS taxation.</li>
            <li className="flex gap-2"><Info className="h-3 w-3 text-primary shrink-0 mt-0.5" />Only traditional IRAs qualify (not 401k, SEP IRA directly — must rollover first).</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = [
  { value: "readiness", label: "Readiness", icon: Target },
  { value: "accounts", label: "Accounts", icon: Landmark },
  { value: "social-security", label: "Social Security", icon: DollarSign },
  { value: "strategy", label: "Strategy", icon: TrendingUp },
  { value: "healthcare", label: "Healthcare & RMDs", icon: Heart },
];

export default function RetirementPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col flex-1 p-4 gap-4 max-w-7xl w-full mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-medium tracking-tight flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-muted-foreground/50" />
              Retirement Planning
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Comprehensive tools for a secure retirement — readiness scoring, account optimization, Social Security strategy, and healthcare planning.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
              <Activity className="h-3 w-3" />
              4% Rule
            </Badge>
            <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Educational</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="readiness" className="flex flex-col flex-1">
          <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:"
                >{t.label}</TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="readiness" className="mt-4 data-[state=inactive]:hidden">
            <ReadinessTab />
          </TabsContent>
          <TabsContent value="accounts" className="mt-4 data-[state=inactive]:hidden">
            <AccountsTab />
          </TabsContent>
          <TabsContent value="social-security" className="mt-4 data-[state=inactive]:hidden">
            <SocialSecurityTab />
          </TabsContent>
          <TabsContent value="strategy" className="mt-4 data-[state=inactive]:hidden">
            <InvestmentStrategyTab />
          </TabsContent>
          <TabsContent value="healthcare" className="mt-4 data-[state=inactive]:hidden">
            <HealthcareRMDsTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
