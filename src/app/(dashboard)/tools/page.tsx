"use client";

import { useState, useMemo, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ─── Formatting helpers ────────────────────────────────────────────────────

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${fmt(n, 0)}`;
}

// ─── SEEDED PRNG ──────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── TAB 1: DIGITAL TWIN ─────────────────────────────────────────────────

interface DigitalTwinInputs {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  monthlySavings: number;
  returnRate: number; // % annually
  timeHorizon: number; // years
  goalAmount: number;
  goalYears: number;
}

function computeWealthPath(inputs: DigitalTwinInputs): number[] {
  const { currentSavings, monthlySavings, returnRate, timeHorizon } = inputs;
  const monthlyRate = returnRate / 100 / 12;
  const path: number[] = [currentSavings];
  let balance = currentSavings;
  for (let y = 1; y <= timeHorizon; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + monthlySavings;
    }
    path.push(balance);
  }
  return path;
}

function computeMonteCarloP10P50P90(
  inputs: DigitalTwinInputs,
  paths = 100,
): { p10: number[]; p50: number[]; p90: number[] } {
  const { currentSavings, monthlySavings, returnRate, timeHorizon } = inputs;
  const baseMonthly = returnRate / 100 / 12;
  const variance = 0.03 / 12; // ±3% annual = ±0.25% monthly std

  const allPaths: number[][] = [];
  for (let p = 0; p < paths; p++) {
    const rng = seededRandom(p * 1337 + 42);
    const yearlyVals: number[] = [currentSavings];
    let balance = currentSavings;
    for (let y = 0; y < timeHorizon; y++) {
      for (let m = 0; m < 12; m++) {
        // Box-Muller for Gaussian noise
        const u1 = Math.max(rng(), 1e-10);
        const u2 = rng();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const r = baseMonthly + z * variance;
        balance = balance * (1 + r) + monthlySavings;
      }
      yearlyVals.push(balance);
    }
    allPaths.push(yearlyVals);
  }

  const years = timeHorizon + 1;
  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];

  for (let y = 0; y < years; y++) {
    const vals = allPaths.map((path) => path[y]).sort((a, b) => a - b);
    p10.push(vals[Math.floor(vals.length * 0.1)]);
    p50.push(vals[Math.floor(vals.length * 0.5)]);
    p90.push(vals[Math.floor(vals.length * 0.9)]);
  }
  return { p10, p50, p90 };
}

interface WealthChartProps {
  base: number[];
  p10: number[];
  p50: number[];
  p90: number[];
  timeHorizon: number;
}

function WealthChart({ base, p10, p50, p90, timeHorizon }: WealthChartProps) {
  const W = 600;
  const H = 220;
  const pad = { l: 60, r: 20, t: 16, b: 36 };
  const gW = W - pad.l - pad.r;
  const gH = H - pad.t - pad.b;

  const allVals = [...base, ...p10, ...p90].filter(isFinite);
  const minV = Math.min(0, ...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;

  const toX = (i: number) => pad.l + (i / timeHorizon) * gW;
  const toY = (v: number) => pad.t + gH - ((v - minV) / range) * gH;

  const linePath = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");

  const bandPath =
    p10.length && p90.length
      ? [
          ...p90.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`),
          ...[...p10].reverse().map((v, i) => {
            const idx = p10.length - 1 - i;
            return `L${toX(idx).toFixed(1)},${toY(v).toFixed(1)}`;
          }),
          "Z",
        ].join(" ")
      : "";

  // Y-axis ticks
  const yTicks = 5;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => minV + (range / yTicks) * i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {yTickVals.map((v, i) => (
        <line
          key={`yg-${i}`}
          x1={pad.l}
          x2={W - pad.r}
          y1={toY(v)}
          y2={toY(v)}
          stroke="currentColor"
          className="text-border"
          strokeWidth={0.5}
          strokeDasharray="3,3"
        />
      ))}
      {Array.from({ length: timeHorizon + 1 }, (_, i) => (
        <line
          key={`xg-${i}`}
          x1={toX(i)}
          x2={toX(i)}
          y1={pad.t}
          y2={pad.t + gH}
          stroke="currentColor"
          className="text-border"
          strokeWidth={0.5}
          strokeDasharray="3,3"
        />
      ))}

      {/* Monte Carlo band */}
      {bandPath && (
        <path d={bandPath} fill="rgba(20,184,166,0.08)" />
      )}

      {/* P10 */}
      {p10.length > 0 && (
        <path
          d={linePath(p10)}
          fill="none"
          stroke="rgb(20,184,166)"
          strokeWidth={1}
          strokeDasharray="4,3"
          opacity={0.5}
        />
      )}
      {/* P90 */}
      {p90.length > 0 && (
        <path
          d={linePath(p90)}
          fill="none"
          stroke="rgb(20,184,166)"
          strokeWidth={1}
          strokeDasharray="4,3"
          opacity={0.5}
        />
      )}
      {/* P50 */}
      {p50.length > 0 && (
        <path
          d={linePath(p50)}
          fill="none"
          stroke="rgb(20,184,166)"
          strokeWidth={1.5}
          opacity={0.7}
        />
      )}
      {/* Base */}
      <path
        d={linePath(base)}
        fill="none"
        stroke="rgb(14,165,233)"
        strokeWidth={2.5}
      />

      {/* Y-axis labels */}
      {yTickVals.map((v, i) => (
        <text
          key={`yl-${i}`}
          x={pad.l - 6}
          y={toY(v) + 4}
          textAnchor="end"
          fontSize={9}
          fill="currentColor"
          className="text-muted-foreground"
        >
          {fmtK(v)}
        </text>
      ))}

      {/* X-axis labels */}
      {Array.from({ length: Math.min(timeHorizon, 8) + 1 }, (_, i) => {
        const idx = Math.round((i / Math.min(timeHorizon, 8)) * timeHorizon);
        return (
          <text
            key={`xl-${idx}`}
            x={toX(idx)}
            y={H - pad.b + 14}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            className="text-muted-foreground"
          >
            Yr {idx}
          </text>
        );
      })}

      {/* Legend */}
      <line x1={pad.l} y1={H - 6} x2={pad.l + 20} y2={H - 6} stroke="rgb(14,165,233)" strokeWidth={2.5} />
      <text x={pad.l + 24} y={H - 3} fontSize={8} fill="currentColor" className="text-muted-foreground">Base</text>
      <line x1={pad.l + 60} y1={H - 6} x2={pad.l + 80} y2={H - 6} stroke="rgb(20,184,166)" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.7} />
      <text x={pad.l + 84} y={H - 3} fontSize={8} fill="currentColor" className="text-muted-foreground">P10/50/90</text>
    </svg>
  );
}

function DigitalTwinTab() {
  const [inputs, setInputs] = useState<DigitalTwinInputs>({
    monthlyIncome: 8000,
    monthlyExpenses: 5000,
    currentSavings: 25000,
    monthlySavings: 1500,
    returnRate: 7,
    timeHorizon: 30,
    goalAmount: 1000000,
    goalYears: 30,
  });

  const set = useCallback(<K extends keyof DigitalTwinInputs>(key: K, val: number) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  }, []);

  const base = useMemo(() => computeWealthPath(inputs), [inputs]);
  const mc = useMemo(() => computeMonteCarloP10P50P90(inputs), [inputs]);

  // Retirement projections
  const nestEgg = base[inputs.timeHorizon];
  const monthlyWithdrawal = (nestEgg * 0.04) / 12;

  // FI number (annual expenses covered)
  const annualExpenses = inputs.monthlyExpenses * 12;
  const fiNumber = annualExpenses * 25; // 4% rule inverse
  const fiYear = base.findIndex((v) => v >= fiNumber);
  const fiYears = fiYear === -1 ? ">" + inputs.timeHorizon : fiYear;

  // Goal tracker
  const goalIdx = Math.min(inputs.goalYears, inputs.timeHorizon);
  const projectedAtGoalYear = base[goalIdx] ?? base[base.length - 1];
  const goalAchievable = projectedAtGoalYear >= inputs.goalAmount;
  const goalPct = Math.min(100, (projectedAtGoalYear / inputs.goalAmount) * 100);

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Financial Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {([
              { key: "monthlyIncome", label: "Monthly Income", min: 1000, max: 50000, step: 500, prefix: "$" },
              { key: "monthlyExpenses", label: "Monthly Expenses", min: 500, max: 40000, step: 250, prefix: "$" },
              { key: "currentSavings", label: "Current Savings", min: 0, max: 500000, step: 1000, prefix: "$" },
              { key: "monthlySavings", label: "Monthly Savings", min: 0, max: 20000, step: 100, prefix: "$" },
              { key: "returnRate", label: "Annual Return", min: 4, max: 15, step: 0.5, suffix: "%" },
              { key: "timeHorizon", label: "Time Horizon", min: 1, max: 40, step: 1, suffix: " yrs" },
            ] as Array<{
              key: keyof DigitalTwinInputs;
              label: string;
              min: number;
              max: number;
              step: number;
              prefix?: string;
              suffix?: string;
            }>).map(({ key, label, min, max, step, prefix, suffix }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono font-medium text-foreground">
                    {prefix}
                    {fmt(inputs[key], key === "returnRate" ? 1 : 0)}
                    {suffix}
                  </span>
                </div>
                <Slider
                  min={min}
                  max={max}
                  step={step}
                  value={[inputs[key]]}
                  onValueChange={([v]) => set(key, v)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Retirement Projections</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: "Projected Nest Egg", value: fmtK(nestEgg) },
                { label: "Monthly Withdrawal (4%)", value: fmtK(monthlyWithdrawal) },
                { label: "FI Number", value: fmtK(fiNumber) },
                { label: "Years to FI", value: String(fiYears) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-border/60 p-3 space-y-0.5">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-base font-semibold font-mono">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Goal Tracker */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Goal Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Target Amount ($)</label>
                  <Input
                    type="number"
                    value={inputs.goalAmount}
                    onChange={(e) => set("goalAmount", Number(e.target.value))}
                    className="h-8 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">In (years)</label>
                  <Input
                    type="number"
                    value={inputs.goalYears}
                    min={1}
                    max={40}
                    onChange={(e) => set("goalYears", Math.min(40, Math.max(1, Number(e.target.value))))}
                    className="h-8 text-sm font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Projected in {goalIdx} yrs: {fmtK(projectedAtGoalYear)}
                  </span>
                  <Badge
                    variant={goalAchievable ? "default" : "secondary"}
                    className="text-[10px] h-4"
                  >
                    {goalAchievable ? "Achievable" : "Needs Adjustment"}
                  </Badge>
                </div>
                {/* Progress bar */}
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${goalPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{goalPct.toFixed(1)}% of goal</p>
              </div>
            </CardContent>
          </Card>

          {/* Break-even */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Financial Independence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                FI number (25x annual expenses): <span className="font-mono font-medium text-foreground">{fmtK(fiNumber)}</span>.
                {" "}At your current savings rate, you reach FI in{" "}
                <span className="font-mono font-medium text-foreground">{fiYears} years</span>.
                Monthly surplus: <span className="font-mono font-medium text-foreground">{fmtK(inputs.monthlyIncome - inputs.monthlyExpenses - inputs.monthlySavings)}</span>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wealth Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Projected Wealth Curve</CardTitle>
          <p className="text-xs text-muted-foreground">Blue = base case. Teal dashed = Monte Carlo P10/P50/P90 (100 simulations, ±3% return variance)</p>
        </CardHeader>
        <CardContent>
          <WealthChart
            base={base}
            p10={mc.p10}
            p50={mc.p50}
            p90={mc.p90}
            timeHorizon={inputs.timeHorizon}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TAB 2: COMPOUND CALCULATOR ───────────────────────────────────────────

interface CompoundInputs {
  principal: number;
  monthlyContribution: number;
  annualRate: number;
  years: number;
}

function computeCompound(inp: CompoundInputs) {
  const { principal, monthlyContribution, annualRate, years } = inp;
  const r = annualRate / 100 / 12;
  const yearlyData: { year: number; principal: number; contributions: number; interest: number }[] = [];

  let balance = principal;
  let totalContributions = 0;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + r) + monthlyContribution;
      totalContributions += monthlyContribution;
    }
    const totalContrib = principal + totalContributions;
    const interest = balance - totalContrib;
    yearlyData.push({ year: y, principal, contributions: totalContributions, interest: Math.max(0, interest) });
  }

  const finalBalance = balance;
  const totalContrib = principal + totalContributions;
  const totalInterest = finalBalance - totalContrib;

  return { finalBalance, totalContrib, totalInterest, yearlyData };
}

interface CompoundBarChartProps {
  yearlyData: { year: number; principal: number; contributions: number; interest: number }[];
}

function CompoundBarChart({ yearlyData }: CompoundBarChartProps) {
  const W = 600;
  const H = 200;
  const pad = { l: 60, r: 16, t: 16, b: 36 };
  const gW = W - pad.l - pad.r;
  const gH = H - pad.t - pad.b;

  const maxVal = Math.max(...yearlyData.map((d) => d.principal + d.contributions + d.interest));
  const barW = gW / yearlyData.length;

  // Show max 20 bars
  const step = Math.max(1, Math.floor(yearlyData.length / 20));
  const visible = yearlyData.filter((_, i) => i % step === step - 1 || i === yearlyData.length - 1);
  const bW = gW / visible.length;

  const toY = (v: number) => pad.t + gH - (v / maxVal) * gH;
  const toH = (v: number) => (v / maxVal) * gH;

  const yTicks = 4;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal / yTicks) * i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {yTickVals.map((v, i) => (
        <line
          key={`yg-${i}`}
          x1={pad.l}
          x2={W - pad.r}
          y1={toY(v)}
          y2={toY(v)}
          stroke="currentColor"
          className="text-border"
          strokeWidth={0.5}
          strokeDasharray="3,3"
        />
      ))}

      {/* Bars */}
      {visible.map((d, i) => {
        const x = pad.l + i * bW + bW * 0.1;
        const w = bW * 0.8;
        const ph = toH(d.principal);
        const ch = toH(d.contributions);
        const ih = toH(d.interest);
        const totalH = ph + ch + ih;
        const yBase = pad.t + gH;

        return (
          <g key={d.year}>
            {/* Principal */}
            <rect x={x} y={yBase - totalH} width={w} height={ph} fill="rgb(14,165,233)" opacity={0.85} />
            {/* Contributions */}
            <rect x={x} y={yBase - totalH + ph} width={w} height={ch} fill="rgb(99,102,241)" opacity={0.85} />
            {/* Interest */}
            <rect x={x} y={yBase - ih} width={w} height={ih} fill="rgb(20,184,166)" opacity={0.85} />
            {/* X label */}
            <text
              x={x + w / 2}
              y={H - pad.b + 14}
              textAnchor="middle"
              fontSize={8}
              fill="currentColor"
              className="text-muted-foreground"
            >
              Yr {d.year}
            </text>
          </g>
        );
      })}

      {/* Y labels */}
      {yTickVals.map((v, i) => (
        <text
          key={`yl-${i}`}
          x={pad.l - 6}
          y={toY(v) + 4}
          textAnchor="end"
          fontSize={9}
          fill="currentColor"
          className="text-muted-foreground"
        >
          {fmtK(v)}
        </text>
      ))}

      {/* Legend */}
      <rect x={pad.l} y={H - 6} width={10} height={6} fill="rgb(14,165,233)" opacity={0.85} />
      <text x={pad.l + 13} y={H - 1} fontSize={8} fill="currentColor" className="text-muted-foreground">Principal</text>
      <rect x={pad.l + 65} y={H - 6} width={10} height={6} fill="rgb(99,102,241)" opacity={0.85} />
      <text x={pad.l + 78} y={H - 1} fontSize={8} fill="currentColor" className="text-muted-foreground">Contributions</text>
      <rect x={pad.l + 150} y={H - 6} width={10} height={6} fill="rgb(20,184,166)" opacity={0.85} />
      <text x={pad.l + 163} y={H - 1} fontSize={8} fill="currentColor" className="text-muted-foreground">Interest</text>
    </svg>
  );
}

function CompoundCalculatorTab() {
  const [inp, setInp] = useState<CompoundInputs>({
    principal: 10000,
    monthlyContribution: 500,
    annualRate: 8,
    years: 20,
  });

  const set = useCallback(<K extends keyof CompoundInputs>(key: K, val: number) => {
    setInp((prev) => ({ ...prev, [key]: val }));
  }, []);

  const result = useMemo(() => computeCompound(inp), [inp]);
  const rule72 = inp.annualRate > 0 ? (72 / inp.annualRate).toFixed(1) : "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {([
              { key: "principal", label: "Principal", min: 0, max: 500000, step: 1000, prefix: "$" },
              { key: "monthlyContribution", label: "Monthly Contribution", min: 0, max: 10000, step: 50, prefix: "$" },
              { key: "annualRate", label: "Annual Rate", min: 1, max: 20, step: 0.5, suffix: "%" },
              { key: "years", label: "Years", min: 1, max: 50, step: 1, suffix: " yrs" },
            ] as Array<{
              key: keyof CompoundInputs;
              label: string;
              min: number;
              max: number;
              step: number;
              prefix?: string;
              suffix?: string;
            }>).map(({ key, label, min, max, step, prefix, suffix }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono font-medium text-foreground">
                    {prefix}
                    {fmt(inp[key], key === "annualRate" ? 1 : 0)}
                    {suffix}
                  </span>
                </div>
                <Slider
                  min={min}
                  max={max}
                  step={step}
                  value={[inp[key]]}
                  onValueChange={([v]) => set(key, v)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Results</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              {[
                { label: "Future Value", value: fmtK(result.finalBalance), highlight: true },
                { label: "Total Contributed", value: fmtK(result.totalContrib), highlight: false },
                { label: "Total Interest Earned", value: fmtK(result.totalInterest), highlight: false },
                {
                  label: "Return on Contributions",
                  value: result.totalContrib > 0
                    ? `${((result.totalInterest / result.totalContrib) * 100).toFixed(1)}%`
                    : "—",
                  highlight: false,
                },
              ].map(({ label, value, highlight }) => (
                <div
                  key={label}
                  className={`rounded-lg border p-3 space-y-0.5 ${highlight ? "border-primary/40 bg-primary/5" : "border-border/60"}`}
                >
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-base font-semibold font-mono ${highlight ? "text-primary" : ""}`}>{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rule of 72 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rule of 72</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                At <span className="font-mono font-medium">{inp.annualRate}%</span> return, your money doubles in{" "}
                <span className="font-mono font-medium text-primary">{rule72} years</span>.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formula: 72 / rate = doubling time
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Growth Breakdown by Year</CardTitle>
          <p className="text-xs text-muted-foreground">Stacked: principal, contributions, interest earned</p>
        </CardHeader>
        <CardContent>
          <CompoundBarChart yearlyData={result.yearlyData} />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TAB 3: SCENARIO SIMULATOR ────────────────────────────────────────────

interface ScenarioState {
  active: string | null;
  layoffMonths: number;
  promotionPct: number;
  houseMortgage: number;
  houseOther: number;
}

const SCENARIOS = [
  {
    id: "house",
    label: "Buy a House",
    description: "Add mortgage, property tax, and maintenance costs",
  },
  {
    id: "child",
    label: "Have a Child",
    description: "Add $15K/year in expenses for 18 years",
  },
  {
    id: "layoff",
    label: "Get Laid Off",
    description: "Income drops to $0 for N months",
  },
  {
    id: "crash",
    label: "Market Crashes 40%",
    description: "One-time 40% portfolio shock at year 1",
  },
  {
    id: "promotion",
    label: "Get a Promotion",
    description: "Income increases by X%",
  },
];

function computeScenarioPath(
  base: DigitalTwinInputs,
  scenario: ScenarioState,
): number[] {
  const { currentSavings, returnRate, timeHorizon } = base;
  const monthlyRate = returnRate / 100 / 12;
  let balance = currentSavings;
  const path: number[] = [balance];

  for (let y = 0; y < timeHorizon; y++) {
    for (let m = 0; m < 12; m++) {
      const month = y * 12 + m;
      let income = base.monthlyIncome;
      let expenses = base.monthlyExpenses;
      let extraSavings = base.monthlySavings;

      if (scenario.active === "house") {
        expenses += scenario.houseMortgage + scenario.houseOther;
      }
      if (scenario.active === "child" && y < 18) {
        expenses += 15000 / 12;
      }
      if (scenario.active === "layoff" && month < scenario.layoffMonths) {
        income = 0;
      }
      if (scenario.active === "promotion") {
        income = income * (1 + scenario.promotionPct / 100);
      }

      const netSavings = Math.max(0, income - expenses) + extraSavings;
      balance = balance * (1 + monthlyRate) + netSavings;

      // Crash shock applied at end of year 1 (after 12 months)
      if (scenario.active === "crash" && month === 11) {
        balance *= 0.6;
      }
    }
    path.push(balance);
  }
  return path;
}

interface CompareChartProps {
  base: number[];
  scenario: number[];
  timeHorizon: number;
  scenarioLabel: string;
}

function CompareChart({ base, scenario, timeHorizon, scenarioLabel }: CompareChartProps) {
  const W = 600;
  const H = 200;
  const pad = { l: 60, r: 16, t: 16, b: 36 };
  const gW = W - pad.l - pad.r;
  const gH = H - pad.t - pad.b;

  const allVals = [...base, ...scenario].filter(isFinite);
  const minV = Math.min(0, ...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;

  const toX = (i: number) => pad.l + (i / timeHorizon) * gW;
  const toY = (v: number) => pad.t + gH - ((v - minV) / range) * gH;

  const linePath = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");

  const yTicks = 4;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => minV + (range / yTicks) * i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {yTickVals.map((v, i) => (
        <line
          key={`yg-${i}`}
          x1={pad.l}
          x2={W - pad.r}
          y1={toY(v)}
          y2={toY(v)}
          stroke="currentColor"
          className="text-border"
          strokeWidth={0.5}
          strokeDasharray="3,3"
        />
      ))}

      <path d={linePath(base)} fill="none" stroke="rgb(14,165,233)" strokeWidth={2} />
      <path d={linePath(scenario)} fill="none" stroke="rgb(249,115,22)" strokeWidth={2} strokeDasharray="5,3" />

      {yTickVals.map((v, i) => (
        <text
          key={`yl-${i}`}
          x={pad.l - 6}
          y={toY(v) + 4}
          textAnchor="end"
          fontSize={9}
          fill="currentColor"
          className="text-muted-foreground"
        >
          {fmtK(v)}
        </text>
      ))}

      {Array.from({ length: Math.min(timeHorizon, 8) + 1 }, (_, i) => {
        const idx = Math.round((i / Math.min(timeHorizon, 8)) * timeHorizon);
        return (
          <text
            key={`xl-${idx}`}
            x={toX(idx)}
            y={H - pad.b + 14}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            className="text-muted-foreground"
          >
            Yr {idx}
          </text>
        );
      })}

      {/* Legend */}
      <line x1={pad.l} y1={H - 6} x2={pad.l + 20} y2={H - 6} stroke="rgb(14,165,233)" strokeWidth={2} />
      <text x={pad.l + 24} y={H - 3} fontSize={8} fill="currentColor" className="text-muted-foreground">Base Case</text>
      <line x1={pad.l + 80} y1={H - 6} x2={pad.l + 100} y2={H - 6} stroke="rgb(249,115,22)" strokeWidth={2} strokeDasharray="5,3" />
      <text x={pad.l + 104} y={H - 3} fontSize={8} fill="currentColor" className="text-muted-foreground">{scenarioLabel}</text>
    </svg>
  );
}

function ScenarioSimulatorTab() {
  const [baseInputs] = useState<DigitalTwinInputs>({
    monthlyIncome: 8000,
    monthlyExpenses: 5000,
    currentSavings: 25000,
    monthlySavings: 1500,
    returnRate: 7,
    timeHorizon: 30,
    goalAmount: 1000000,
    goalYears: 30,
  });

  const [scenario, setScenario] = useState<ScenarioState>({
    active: null,
    layoffMonths: 6,
    promotionPct: 20,
    houseMortgage: 1800,
    houseOther: 500,
  });

  const base = useMemo(() => computeWealthPath(baseInputs), [baseInputs]);
  const scenarioPath = useMemo(
    () => computeScenarioPath(baseInputs, scenario),
    [baseInputs, scenario],
  );

  const baseEnd = base[base.length - 1];
  const scenEnd = scenarioPath[scenarioPath.length - 1];
  const diff = scenEnd - baseEnd;
  const diffPct = baseEnd !== 0 ? (diff / baseEnd) * 100 : 0;

  const activeScenario = SCENARIOS.find((s) => s.id === scenario.active);

  return (
    <div className="space-y-6">
      {/* Scenario cards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Select a Scenario</CardTitle>
          <p className="text-xs text-muted-foreground">Applied against a base profile: $8K income, $5K expenses, $25K savings, 7% return, 30 years</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() =>
                  setScenario((prev) => ({ ...prev, active: prev.active === s.id ? null : s.id }))
                }
                className={`rounded-lg border p-3 text-left transition-colors hover:border-primary/50 ${
                  scenario.active === s.id
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-card"
                }`}
              >
                <p className="text-xs font-medium leading-tight">{s.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{s.description}</p>
              </button>
            ))}
          </div>

          {/* Scenario params */}
          {scenario.active === "layoff" && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Months without income</span>
                <span className="font-mono font-medium">{scenario.layoffMonths} months</span>
              </div>
              <Slider
                min={1}
                max={24}
                step={1}
                value={[scenario.layoffMonths]}
                onValueChange={([v]) => setScenario((p) => ({ ...p, layoffMonths: v }))}
              />
            </div>
          )}
          {scenario.active === "promotion" && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Income increase</span>
                <span className="font-mono font-medium">+{scenario.promotionPct}%</span>
              </div>
              <Slider
                min={5}
                max={100}
                step={5}
                value={[scenario.promotionPct]}
                onValueChange={([v]) => setScenario((p) => ({ ...p, promotionPct: v }))}
              />
            </div>
          )}
          {scenario.active === "house" && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Monthly mortgage</span>
                  <span className="font-mono font-medium">${fmt(scenario.houseMortgage)}</span>
                </div>
                <Slider
                  min={500}
                  max={5000}
                  step={100}
                  value={[scenario.houseMortgage]}
                  onValueChange={([v]) => setScenario((p) => ({ ...p, houseMortgage: v }))}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tax + maintenance/mo</span>
                  <span className="font-mono font-medium">${fmt(scenario.houseOther)}</span>
                </div>
                <Slider
                  min={100}
                  max={2000}
                  step={50}
                  value={[scenario.houseOther]}
                  onValueChange={([v]) => setScenario((p) => ({ ...p, houseOther: v }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact summary */}
      {scenario.active && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Base Case (30yr)", value: fmtK(baseEnd) },
            { label: `Scenario (30yr)`, value: fmtK(scenEnd) },
            {
              label: "Impact",
              value: `${diff >= 0 ? "+" : ""}${fmtK(diff)} (${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(1)}%)`,
              positive: diff >= 0,
            },
          ].map(({ label, value, positive }) => (
            <Card key={label}>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p
                  className={`text-base font-semibold font-mono mt-0.5 ${
                    positive === undefined ? "" : positive ? "text-green-500" : "text-red-400"
                  }`}
                >
                  {value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Comparison chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Wealth Comparison</CardTitle>
          <p className="text-xs text-muted-foreground">
            {activeScenario ? `Blue = base case, Orange = ${activeScenario.label}` : "Select a scenario to compare"}
          </p>
        </CardHeader>
        <CardContent>
          <CompareChart
            base={base}
            scenario={scenarioPath}
            timeHorizon={baseInputs.timeHorizon}
            scenarioLabel={activeScenario?.label ?? "Scenario"}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TAB 4: TAX CALCULATOR ────────────────────────────────────────────────

type FilingStatus = "single" | "mfj" | "hoh";

interface TaxInputs {
  grossIncome: number;
  filingStatus: FilingStatus;
  k401: number;
  hsa: number;
  selfEmployed: boolean;
}

// 2024 brackets
const BRACKETS: Record<FilingStatus, { rate: number; min: number; max: number }[]> = {
  single: [
    { rate: 0.10, min: 0, max: 11600 },
    { rate: 0.12, min: 11600, max: 47150 },
    { rate: 0.22, min: 47150, max: 100525 },
    { rate: 0.24, min: 100525, max: 191950 },
    { rate: 0.32, min: 191950, max: 243725 },
    { rate: 0.35, min: 243725, max: 609350 },
    { rate: 0.37, min: 609350, max: Infinity },
  ],
  mfj: [
    { rate: 0.10, min: 0, max: 23200 },
    { rate: 0.12, min: 23200, max: 94300 },
    { rate: 0.22, min: 94300, max: 201050 },
    { rate: 0.24, min: 201050, max: 383900 },
    { rate: 0.32, min: 383900, max: 487450 },
    { rate: 0.35, min: 487450, max: 731200 },
    { rate: 0.37, min: 731200, max: Infinity },
  ],
  hoh: [
    { rate: 0.10, min: 0, max: 16550 },
    { rate: 0.12, min: 16550, max: 63100 },
    { rate: 0.22, min: 63100, max: 100500 },
    { rate: 0.24, min: 100500, max: 191950 },
    { rate: 0.32, min: 191950, max: 243700 },
    { rate: 0.35, min: 243700, max: 609350 },
    { rate: 0.37, min: 609350, max: Infinity },
  ],
};

const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 14600,
  mfj: 29200,
  hoh: 21900,
};

function computeTax(inp: TaxInputs) {
  const { grossIncome, filingStatus, k401, hsa, selfEmployed } = inp;

  // SE tax adjustment
  const seTax = selfEmployed ? grossIncome * 0.9235 * 0.153 : 0;
  const seDeduction = selfEmployed ? seTax / 2 : 0;

  // AGI
  const agi = Math.max(0, grossIncome - k401 - hsa - seDeduction);

  // Standard deduction
  const taxableIncome = Math.max(0, agi - STANDARD_DEDUCTION[filingStatus]);

  // Federal tax
  const brackets = BRACKETS[filingStatus];
  let federalTax = 0;
  const breakdown: { rate: number; min: number; max: number; taxable: number; tax: number }[] = [];
  for (const b of brackets) {
    if (taxableIncome <= b.min) break;
    const taxable = Math.min(taxableIncome, b.max) - b.min;
    const tax = taxable * b.rate;
    federalTax += tax;
    breakdown.push({ ...b, taxable, tax });
  }

  // FICA (on W2 gross, capped)
  const ficaSS = selfEmployed ? 0 : Math.min(grossIncome, 168600) * 0.062;
  const ficaMed = selfEmployed ? 0 : grossIncome * 0.0145;
  const fica = ficaSS + ficaMed;

  const totalTax = federalTax + fica + seTax;
  const effectiveRate = grossIncome > 0 ? (federalTax / grossIncome) * 100 : 0;
  const marginalRate = brackets.find((b) => taxableIncome <= b.max)?.rate ?? 0.37;
  const takeHome = grossIncome - totalTax - k401 - hsa;

  return { federalTax, fica, seTax, totalTax, effectiveRate, marginalRate, takeHome, breakdown, agi, taxableIncome };
}

function TaxCalculatorTab() {
  const [inp, setInp] = useState<TaxInputs>({
    grossIncome: 100000,
    filingStatus: "single",
    k401: 23000,
    hsa: 4150,
    selfEmployed: false,
  });

  const set = <K extends keyof TaxInputs>(key: K, val: TaxInputs[K]) => {
    setInp((prev) => ({ ...prev, [key]: val }));
  };

  const result = useMemo(() => computeTax(inp), [inp]);
  const seTaxResult = useMemo(() => computeTax({ ...inp, selfEmployed: true }), [inp]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tax Inputs (2024 US)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Gross Income</span>
                <span className="font-mono font-medium">${fmt(inp.grossIncome)}</span>
              </div>
              <Slider
                min={10000}
                max={1000000}
                step={5000}
                value={[inp.grossIncome]}
                onValueChange={([v]) => set("grossIncome", v)}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Filing Status</p>
              <div className="flex gap-2">
                {(["single", "mfj", "hoh"] as FilingStatus[]).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={inp.filingStatus === s ? "default" : "outline"}
                    className="text-xs h-7"
                    onClick={() => set("filingStatus", s)}
                  >
                    {s === "single" ? "Single" : s === "mfj" ? "Married Filing Jointly" : "Head of Household"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">401(k) Contribution</span>
                <span className="font-mono font-medium">${fmt(inp.k401)}</span>
              </div>
              <Slider
                min={0}
                max={23000}
                step={500}
                value={[inp.k401]}
                onValueChange={([v]) => set("k401", v)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">HSA Contribution</span>
                <span className="font-mono font-medium">${fmt(inp.hsa)}</span>
              </div>
              <Slider
                min={0}
                max={8300}
                step={100}
                value={[inp.hsa]}
                onValueChange={([v]) => set("hsa", v)}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                role="switch"
                aria-checked={inp.selfEmployed}
                onClick={() => set("selfEmployed", !inp.selfEmployed)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  inp.selfEmployed ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                    inp.selfEmployed ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs">Self-employed (adds SE tax, removes FICA)</span>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tax Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: "Federal Tax", value: fmtK(result.federalTax) },
                { label: "Effective Rate", value: `${result.effectiveRate.toFixed(1)}%` },
                { label: "Marginal Rate", value: `${(result.marginalRate * 100).toFixed(0)}%` },
                { label: "FICA / SE Tax", value: fmtK(inp.selfEmployed ? result.seTax : result.fica) },
                { label: "Total Tax Burden", value: fmtK(result.totalTax) },
                { label: "Take-Home Pay", value: fmtK(result.takeHome) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-border/60 p-3 space-y-0.5">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold font-mono">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* W2 vs SE comparison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">W2 vs Self-Employed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-muted-foreground" />
                <div className="text-center font-medium text-muted-foreground">W2</div>
                <div className="text-center font-medium text-muted-foreground">Self-Employed</div>

                {[
                  { label: "Federal Tax", w2: result.federalTax, se: seTaxResult.federalTax },
                  { label: "FICA / SE Tax", w2: result.fica, se: seTaxResult.seTax },
                  { label: "Total Tax", w2: result.totalTax, se: seTaxResult.totalTax },
                  { label: "Take-Home", w2: result.takeHome, se: seTaxResult.takeHome },
                ].map(({ label, w2, se }) => (
                  <>
                    <div key={`l-${label}`} className="text-muted-foreground py-1">{label}</div>
                    <div key={`w-${label}`} className="text-center font-mono py-1">{fmtK(w2)}</div>
                    <div key={`s-${label}`} className={`text-center font-mono py-1 ${se > w2 ? "text-red-400" : "text-green-500"}`}>{fmtK(se)}</div>
                  </>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bracket breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Federal Tax Bracket Breakdown</CardTitle>
          <p className="text-xs text-muted-foreground">
            AGI: {fmtK(result.agi)} — Taxable Income (after std deduction): {fmtK(result.taxableIncome)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left text-muted-foreground font-medium pb-2">Bracket</th>
                  <th className="text-right text-muted-foreground font-medium pb-2">Rate</th>
                  <th className="text-right text-muted-foreground font-medium pb-2">Income in Bracket</th>
                  <th className="text-right text-muted-foreground font-medium pb-2">Tax Owed</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((b, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-1.5 font-mono">
                      ${fmt(b.min)} – {b.max === Infinity ? "+" : `$${fmt(b.max)}`}
                    </td>
                    <td className="py-1.5 text-right font-mono">{(b.rate * 100).toFixed(0)}%</td>
                    <td className="py-1.5 text-right font-mono">{fmtK(b.taxable)}</td>
                    <td className="py-1.5 text-right font-mono text-foreground">{fmtK(b.tax)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="pt-2" colSpan={3}>Total Federal Tax</td>
                  <td className="pt-2 text-right font-mono">{fmtK(result.federalTax)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TAB 5: LOAN CALCULATOR ───────────────────────────────────────────────

interface LoanInputs {
  loanAmount: number;
  annualRate: number;
  termYears: number;
  extraMonthly: number;
}

function computeLoan(inp: LoanInputs) {
  const { loanAmount, annualRate, termYears, extraMonthly } = inp;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;

  const monthlyPayment =
    r === 0
      ? loanAmount / n
      : (loanAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

  // Base schedule
  const baseSchedule: { month: number; balance: number; interest: number; principal: number }[] = [];
  let bal = loanAmount;
  let totalInterestBase = 0;
  let baseMonths = 0;
  for (let m = 1; m <= n && bal > 0; m++) {
    const interestPayment = bal * r;
    const principalPayment = Math.min(monthlyPayment - interestPayment, bal);
    bal = Math.max(0, bal - principalPayment);
    totalInterestBase += interestPayment;
    baseMonths = m;
    if (m <= 12) {
      baseSchedule.push({ month: m, balance: bal, interest: interestPayment, principal: principalPayment });
    }
  }

  // Extra payment schedule
  let balExtra = loanAmount;
  let totalInterestExtra = 0;
  let extraMonths = 0;
  const extraBalancePath: number[] = [loanAmount];
  const baseBalancePath: number[] = [loanAmount];

  // Rebuild base balance path for chart
  let balBase2 = loanAmount;
  for (let m = 1; m <= n && balBase2 > 0; m++) {
    const ip = balBase2 * r;
    const pp = Math.min(monthlyPayment - ip, balBase2);
    balBase2 = Math.max(0, balBase2 - pp);
    baseBalancePath.push(balBase2);
  }

  for (let m = 1; m <= n && balExtra > 0; m++) {
    const ip = balExtra * r;
    const pp = Math.min(monthlyPayment + extraMonthly - ip, balExtra);
    balExtra = Math.max(0, balExtra - pp);
    totalInterestExtra += ip;
    extraMonths = m;
    extraBalancePath.push(balExtra);
  }

  const totalCostBase = monthlyPayment * baseMonths;
  const totalCostExtra = (monthlyPayment + extraMonthly) * extraMonths;
  const interestSaved = totalInterestBase - totalInterestExtra;
  const monthsSaved = baseMonths - extraMonths;

  return {
    monthlyPayment,
    totalInterestBase,
    totalInterestExtra,
    totalCostBase,
    totalCostExtra,
    interestSaved,
    monthsSaved,
    baseMonths,
    extraMonths,
    baseSchedule,
    baseBalancePath,
    extraBalancePath,
  };
}

interface LoanChartProps {
  base: number[];
  extra: number[];
  loanAmount: number;
}

function LoanChart({ base, extra, loanAmount }: LoanChartProps) {
  const W = 600;
  const H = 200;
  const pad = { l: 60, r: 16, t: 16, b: 36 };
  const gW = W - pad.l - pad.r;
  const gH = H - pad.t - pad.b;

  const maxMonths = base.length - 1;
  const toX = (i: number) => pad.l + (i / maxMonths) * gW;
  const toY = (v: number) => pad.t + gH - (v / loanAmount) * gH;

  const linePath = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = pad.l + (i / maxMonths) * gW;
        const y = pad.t + gH - (v / loanAmount) * gH;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  const yTicks = 4;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => (loanAmount / yTicks) * i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {yTickVals.map((v, i) => (
        <line
          key={`yg-${i}`}
          x1={pad.l}
          x2={W - pad.r}
          y1={toY(v)}
          y2={toY(v)}
          stroke="currentColor"
          className="text-border"
          strokeWidth={0.5}
          strokeDasharray="3,3"
        />
      ))}

      <path d={linePath(base)} fill="none" stroke="rgb(14,165,233)" strokeWidth={2} />
      {extra.length > 0 && (
        <path d={linePath(extra)} fill="none" stroke="rgb(20,184,166)" strokeWidth={2} strokeDasharray="5,3" />
      )}

      {yTickVals.map((v, i) => (
        <text
          key={`yl-${i}`}
          x={pad.l - 6}
          y={toY(v) + 4}
          textAnchor="end"
          fontSize={9}
          fill="currentColor"
          className="text-muted-foreground"
        >
          {fmtK(v)}
        </text>
      ))}

      {/* X axis: year labels */}
      {Array.from({ length: Math.min(Math.ceil(maxMonths / 12), 8) + 1 }, (_, i) => {
        const monthIdx = Math.round((i / Math.min(Math.ceil(maxMonths / 12), 8)) * maxMonths);
        return (
          <text
            key={`xl-${monthIdx}`}
            x={toX(monthIdx)}
            y={H - pad.b + 14}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            className="text-muted-foreground"
          >
            Mo {monthIdx}
          </text>
        );
      })}

      <line x1={pad.l} y1={H - 6} x2={pad.l + 20} y2={H - 6} stroke="rgb(14,165,233)" strokeWidth={2} />
      <text x={pad.l + 24} y={H - 3} fontSize={8} fill="currentColor" className="text-muted-foreground">Base</text>
      <line x1={pad.l + 60} y1={H - 6} x2={pad.l + 80} y2={H - 6} stroke="rgb(20,184,166)" strokeWidth={2} strokeDasharray="5,3" />
      <text x={pad.l + 84} y={H - 3} fontSize={8} fill="currentColor" className="text-muted-foreground">With Extra Payment</text>
    </svg>
  );
}

function LoanCalculatorTab() {
  const [inp, setInp] = useState<LoanInputs>({
    loanAmount: 300000,
    annualRate: 6.5,
    termYears: 30,
    extraMonthly: 200,
  });

  const set = useCallback(<K extends keyof LoanInputs>(key: K, val: number) => {
    setInp((prev) => ({ ...prev, [key]: val }));
  }, []);

  const result = useMemo(() => computeLoan(inp), [inp]);

  const payoffDateBase = new Date();
  payoffDateBase.setMonth(payoffDateBase.getMonth() + result.baseMonths);
  const payoffDateExtra = new Date();
  payoffDateExtra.setMonth(payoffDateExtra.getMonth() + result.extraMonths);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {([
              { key: "loanAmount", label: "Loan Amount", min: 5000, max: 2000000, step: 5000, prefix: "$" },
              { key: "annualRate", label: "Annual Rate", min: 0.5, max: 25, step: 0.1, suffix: "%" },
              { key: "termYears", label: "Loan Term", min: 1, max: 30, step: 1, suffix: " yrs" },
              { key: "extraMonthly", label: "Extra Monthly Payment", min: 0, max: 5000, step: 50, prefix: "$" },
            ] as Array<{
              key: keyof LoanInputs;
              label: string;
              min: number;
              max: number;
              step: number;
              prefix?: string;
              suffix?: string;
            }>).map(({ key, label, min, max, step, prefix, suffix }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono font-medium text-foreground">
                    {prefix}
                    {fmt(inp[key], key === "annualRate" ? 1 : 0)}
                    {suffix}
                  </span>
                </div>
                <Slider
                  min={min}
                  max={max}
                  step={step}
                  value={[inp[key]]}
                  onValueChange={([v]) => set(key, v)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loan Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: "Monthly Payment", value: fmtK(result.monthlyPayment) },
                { label: "Total Interest (base)", value: fmtK(result.totalInterestBase) },
                { label: "Total Cost (base)", value: fmtK(result.totalCostBase) },
                { label: "Payoff Date (base)", value: fmtDate(payoffDateBase) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-border/60 p-3 space-y-0.5">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold font-mono">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {inp.extraMonthly > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  With ${fmt(inp.extraMonthly)}/mo Extra
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[
                  { label: "Interest Saved", value: fmtK(result.interestSaved), positive: true },
                  { label: "Months Saved", value: `${result.monthsSaved} mo`, positive: true },
                  { label: "Total Interest", value: fmtK(result.totalInterestExtra) },
                  { label: "New Payoff Date", value: fmtDate(payoffDateExtra) },
                ].map(({ label, value, positive }) => (
                  <div
                    key={label}
                    className={`rounded-lg border p-3 space-y-0.5 ${positive ? "border-green-500/30 bg-green-500/5" : "border-border/60"}`}
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`text-sm font-semibold font-mono ${positive ? "text-green-500" : ""}`}>{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Balance chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Remaining Balance Over Time</CardTitle>
          <p className="text-xs text-muted-foreground">Blue = standard payments, Teal dashed = with extra payment</p>
        </CardHeader>
        <CardContent>
          <LoanChart
            base={result.baseBalancePath}
            extra={result.extraBalancePath}
            loanAmount={inp.loanAmount}
          />
        </CardContent>
      </Card>

      {/* Amortization table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Amortization Schedule (First 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left text-muted-foreground font-medium pb-2">Month</th>
                  <th className="text-right text-muted-foreground font-medium pb-2">Payment</th>
                  <th className="text-right text-muted-foreground font-medium pb-2">Principal</th>
                  <th className="text-right text-muted-foreground font-medium pb-2">Interest</th>
                  <th className="text-right text-muted-foreground font-medium pb-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.baseSchedule.map((row) => (
                  <tr key={row.month} className="border-b border-border/30">
                    <td className="py-1.5">{row.month}</td>
                    <td className="py-1.5 text-right font-mono">{fmtK(result.monthlyPayment)}</td>
                    <td className="py-1.5 text-right font-mono text-primary">{fmtK(row.principal)}</td>
                    <td className="py-1.5 text-right font-mono text-muted-foreground">{fmtK(row.interest)}</td>
                    <td className="py-1.5 text-right font-mono">{fmtK(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────

type Tab = "twin" | "compound" | "scenario" | "tax" | "loan";

const TABS: { id: Tab; label: string }[] = [
  { id: "twin", label: "Digital Twin" },
  { id: "compound", label: "Compound Calculator" },
  { id: "scenario", label: "Scenario Simulator" },
  { id: "tax", label: "Tax Calculator" },
  { id: "loan", label: "Loan Calculator" },
];

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("twin");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border/50 shrink-0">
        <div>
          <h1 className="text-base font-semibold leading-tight">Financial Tools</h1>
          <p className="text-xs text-muted-foreground">Personal finance simulators and calculators</p>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs">
          5 Tools
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as Tab)}
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="px-6 pt-3 shrink-0">
          <TabsList className="h-8">
            {TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="text-xs h-7 px-3">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 pt-4">
          <TabsContent value="twin" className="mt-0 data-[state=inactive]:hidden">
            <DigitalTwinTab />
          </TabsContent>
          <TabsContent value="compound" className="mt-0 data-[state=inactive]:hidden">
            <CompoundCalculatorTab />
          </TabsContent>
          <TabsContent value="scenario" className="mt-0 data-[state=inactive]:hidden">
            <ScenarioSimulatorTab />
          </TabsContent>
          <TabsContent value="tax" className="mt-0 data-[state=inactive]:hidden">
            <TaxCalculatorTab />
          </TabsContent>
          <TabsContent value="loan" className="mt-0 data-[state=inactive]:hidden">
            <LoanCalculatorTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
