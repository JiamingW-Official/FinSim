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

// ─── TAB 6: MACRO SIMULATOR ───────────────────────────────────────────────

interface MacroVars {
  gdpGrowth: number;       // -5 to +8
  inflation: number;       // 0 to 15
  fedFundsRate: number;    // 0 to 10
  unemployment: number;    // 2 to 15
  treasury10y: number;     // 0 to 10
  dxy: number;             // 80 to 120
  vix: number;             // 10 to 80
}

const MACRO_DEFAULTS: MacroVars = {
  gdpGrowth: 2.5,
  inflation: 3.0,
  fedFundsRate: 4.5,
  unemployment: 4.0,
  treasury10y: 4.3,
  dxy: 103,
  vix: 18,
};

// Historical averages (for radar comparison)
const MACRO_AVG: MacroVars = {
  gdpGrowth: 2.5,
  inflation: 3.0,
  fedFundsRate: 3.0,
  unemployment: 5.5,
  treasury10y: 4.0,
  dxy: 100,
  vix: 20,
};

const MACRO_SCENARIOS: { id: string; label: string; desc: string; vars: MacroVars }[] = [
  {
    id: "stagflation",
    label: "Stagflation 1970s",
    desc: "High inflation, low growth, high rates",
    vars: { gdpGrowth: -0.5, inflation: 10.5, fedFundsRate: 8.5, unemployment: 8.0, treasury10y: 9.0, dxy: 88, vix: 38 },
  },
  {
    id: "crisis2008",
    label: "2008 Crisis",
    desc: "High unemployment, near-zero rates, recession",
    vars: { gdpGrowth: -3.5, inflation: 1.5, fedFundsRate: 0.25, unemployment: 10.0, treasury10y: 2.2, dxy: 85, vix: 60 },
  },
  {
    id: "recovery2020",
    label: "2020 Recovery",
    desc: "Post-COVID stimulus, low rates, high growth",
    vars: { gdpGrowth: 5.7, inflation: 4.0, fedFundsRate: 0.1, unemployment: 5.4, treasury10y: 1.5, dxy: 90, vix: 25 },
  },
  {
    id: "hikecycle2022",
    label: "2022 Rate Hike",
    desc: "High inflation, rapid rate increases",
    vars: { gdpGrowth: 2.1, inflation: 8.5, fedFundsRate: 4.25, unemployment: 3.6, treasury10y: 4.2, dxy: 112, vix: 30 },
  },
  {
    id: "softlanding",
    label: "Soft Landing",
    desc: "Inflation cooling, moderate growth, rate cuts",
    vars: { gdpGrowth: 2.3, inflation: 2.5, fedFundsRate: 3.0, unemployment: 4.2, treasury10y: 3.5, dxy: 98, vix: 15 },
  },
];

// Asset impact model — simplified linear relationships
// Returns expected % return for each asset class
function computeAssetImpacts(v: MacroVars): {
  sp500: number;
  qqq: number;
  iwm: number;
  tlt: number;
  gold: number;
  intl: number;
} {
  // S&P 500: loves GDP growth, hates high rates + VIX spikes
  const sp500 =
    v.gdpGrowth * 3.5 -
    Math.max(0, v.inflation - 3) * 1.8 -
    Math.max(0, v.fedFundsRate - 3) * 1.5 -
    Math.max(0, v.vix - 20) * 0.3;

  // QQQ (growth stocks): extra sensitive to rates (duration risk)
  const qqq =
    sp500 +
    v.gdpGrowth * 1.2 -
    Math.max(0, v.fedFundsRate - 2) * 2.5 -
    Math.max(0, v.treasury10y - 3) * 2.0;

  // IWM (small caps/value): benefits from domestic growth, less rate-sensitive
  const iwm =
    sp500 +
    v.gdpGrowth * 0.8 +
    Math.max(0, v.inflation - 2) * 0.5 -
    Math.max(0, v.unemployment - 5) * 1.2;

  // TLT (long bonds): inverse of rates
  const tlt =
    (MACRO_AVG.treasury10y - v.treasury10y) * 18 -
    Math.max(0, v.inflation - 3) * 1.5;

  // Gold: inflation hedge, fear asset
  const gold =
    Math.max(0, v.inflation - 3) * 2.5 +
    Math.max(0, v.vix - 20) * 0.4 -
    Math.max(0, v.fedFundsRate - 2) * 0.8 +
    (100 - v.dxy) * 0.3;

  // International stocks: hurt by strong USD, benefit from weak USD
  const intl =
    sp500 * 0.7 +
    (100 - v.dxy) * 0.35 +
    v.gdpGrowth * 0.9;

  return {
    sp500: Math.round(sp500 * 10) / 10,
    qqq: Math.round(qqq * 10) / 10,
    iwm: Math.round(iwm * 10) / 10,
    tlt: Math.round(tlt * 10) / 10,
    gold: Math.round(gold * 10) / 10,
    intl: Math.round(intl * 10) / 10,
  };
}

// Radar chart: normalize each var to 0..1 (0 = best, 1 = worst/most extreme)
function normalizeForRadar(v: MacroVars): number[] {
  return [
    // GDP growth: low (negative) = risky = 1, high = safe = 0
    1 - (v.gdpGrowth + 5) / 13,
    // Inflation: high = risky
    v.inflation / 15,
    // Fed funds: high = risky
    v.fedFundsRate / 10,
    // Unemployment: high = risky
    (v.unemployment - 2) / 13,
    // 10Y: high = risky for stocks
    v.treasury10y / 10,
    // DXY: very high or very low both bad; peak risk at extremes
    Math.abs(v.dxy - 100) / 20,
    // VIX: high = risky
    (v.vix - 10) / 70,
  ];
}

// Simulated portfolio positions for stress test
const STRESS_SECTORS = [
  { label: "Tech (QQQ)", weight: 0.30, assetKey: "qqq" as const },
  { label: "S&P 500 (SPY)", weight: 0.25, assetKey: "sp500" as const },
  { label: "Small Cap (IWM)", weight: 0.15, assetKey: "iwm" as const },
  { label: "Long Bonds (TLT)", weight: 0.15, assetKey: "tlt" as const },
  { label: "Gold (GLD)", weight: 0.10, assetKey: "gold" as const },
  { label: "Intl Stocks (EFA)", weight: 0.05, assetKey: "intl" as const },
];

function MacroRadarChart({ current, avg }: { current: number[]; avg: number[] }) {
  const W = 280;
  const H = 280;
  const cx = W / 2;
  const cy = H / 2;
  const R = 100;
  const N = 7;
  const labels = ["GDP Growth", "Inflation", "Fed Rate", "Unemployment", "10Y Yield", "DXY", "VIX"];

  const angle = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const point = (r: number, i: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  // Danger zones: > 0.7 normalized = red, 0.4-0.7 = amber
  const spokeColor = (val: number) =>
    val > 0.7 ? "rgb(239,68,68)" : val > 0.4 ? "rgb(234,179,8)" : "rgb(34,197,94)";

  const buildPath = (vals: number[]) =>
    vals
      .map((v, i) => {
        const p = point(R * v, i);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ") + "Z";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-[280px]">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1.0].map((r, ri) => (
        <polygon
          key={`ring-${ri}`}
          points={Array.from({ length: N }, (_, i) => {
            const p = point(R * r, i);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          }).join(" ")}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth={0.5}
        />
      ))}

      {/* Spokes */}
      {Array.from({ length: N }, (_, i) => {
        const p = point(R, i);
        return (
          <line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="currentColor"
            className="text-border"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Historical average outline */}
      <path
        d={buildPath(avg)}
        fill="rgba(148,163,184,0.08)"
        stroke="rgb(148,163,184)"
        strokeWidth={1}
        strokeDasharray="4,3"
      />

      {/* Current scenario fill */}
      <path
        d={buildPath(current)}
        fill="rgba(14,165,233,0.12)"
        stroke="rgb(14,165,233)"
        strokeWidth={1.5}
      />

      {/* Danger-colored dots on current */}
      {current.map((v, i) => {
        const p = point(R * v, i);
        return (
          <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={3.5} fill={spokeColor(v)} />
        );
      })}

      {/* Labels */}
      {labels.map((lbl, i) => {
        const p = point(R * 1.22, i);
        return (
          <text
            key={`lbl-${i}`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8.5}
            fill="currentColor"
            className="text-muted-foreground"
          >
            {lbl}
          </text>
        );
      })}
    </svg>
  );
}

function MacroSimulatorTab() {
  const [vars, setVars] = useState<MacroVars>(MACRO_DEFAULTS);
  const setVar = useCallback(<K extends keyof MacroVars>(key: K, val: number) => {
    setVars((prev) => ({ ...prev, [key]: val }));
  }, []);

  const impacts = useMemo(() => computeAssetImpacts(vars), [vars]);
  const radarCurrent = useMemo(() => normalizeForRadar(vars), [vars]);
  const radarAvg = useMemo(() => normalizeForRadar(MACRO_AVG), []);

  // Portfolio stress test
  const PORTFOLIO_VALUE = 100000;
  const stressResults = useMemo(() =>
    STRESS_SECTORS.map((s) => ({
      ...s,
      impact: impacts[s.assetKey],
      dollarImpact: PORTFOLIO_VALUE * s.weight * (impacts[s.assetKey] / 100),
    })),
  [impacts]);

  const totalImpact = stressResults.reduce((sum, s) => sum + s.dollarImpact, 0);
  const totalImpactPct = (totalImpact / PORTFOLIO_VALUE) * 100;

  // Best/worst case: ±1 std using VIX-based vol estimate
  const vixFactor = vars.vix / 20; // 1.0 at VIX=20
  const bestCase = totalImpactPct + 8 * vixFactor;
  const worstCase = totalImpactPct - 10 * vixFactor;

  const varRows: {
    key: keyof MacroVars;
    label: string;
    min: number;
    max: number;
    step: number;
    suffix: string;
    fmt: (n: number) => string;
  }[] = [
    { key: "gdpGrowth", label: "GDP Growth Rate", min: -5, max: 8, step: 0.1, suffix: "%", fmt: (n) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%` },
    { key: "inflation", label: "Inflation (CPI)", min: 0, max: 15, step: 0.1, suffix: "%", fmt: (n) => `${n.toFixed(1)}%` },
    { key: "fedFundsRate", label: "Fed Funds Rate", min: 0, max: 10, step: 0.25, suffix: "%", fmt: (n) => `${n.toFixed(2)}%` },
    { key: "unemployment", label: "Unemployment Rate", min: 2, max: 15, step: 0.1, suffix: "%", fmt: (n) => `${n.toFixed(1)}%` },
    { key: "treasury10y", label: "10Y Treasury Yield", min: 0, max: 10, step: 0.1, suffix: "%", fmt: (n) => `${n.toFixed(2)}%` },
    { key: "dxy", label: "Dollar Index (DXY)", min: 80, max: 120, step: 0.5, suffix: "", fmt: (n) => n.toFixed(1) },
    { key: "vix", label: "VIX (Fear Index)", min: 10, max: 80, step: 1, suffix: "", fmt: (n) => n.toFixed(0) },
  ];

  const assetRows: { label: string; key: keyof typeof impacts }[] = [
    { label: "S&P 500 (SPY)", key: "sp500" },
    { label: "Growth Tech (QQQ)", key: "qqq" },
    { label: "Small Cap (IWM)", key: "iwm" },
    { label: "Long Bonds (TLT)", key: "tlt" },
    { label: "Gold (GLD)", key: "gold" },
    { label: "Intl Stocks (EFA)", key: "intl" },
  ];

  return (
    <div className="space-y-6">
      {/* Scenario presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Scenario Templates</CardTitle>
          <p className="text-xs text-muted-foreground">Quick-load historical macro regimes</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {MACRO_SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setVars(s.vars)}
                className="rounded-lg border border-border/60 bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <p className="text-xs font-medium leading-tight">{s.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{s.desc}</p>
              </button>
            ))}
            <button
              onClick={() => setVars(MACRO_DEFAULTS)}
              className="rounded-lg border border-border/60 bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <p className="text-xs font-medium leading-tight">Reset to Default</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-tight">Current macro baseline</p>
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Economic Variables sliders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Economic Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {varRows.map(({ key, label, min, max, step, fmt: fmtFn }) => {
              const val = vars[key];
              const isDanger = key === "vix" ? val > 35 : key === "inflation" ? val > 7 : false;
              const isWarn = key === "vix" ? val > 22 : key === "inflation" ? val > 4 : false;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span
                      className={`font-mono font-medium ${
                        isDanger ? "text-red-400" : isWarn ? "text-yellow-500" : "text-foreground"
                      }`}
                    >
                      {fmtFn(val)}
                    </span>
                  </div>
                  <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={[val]}
                    onValueChange={([v]) => setVar(key, v)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Asset Impact Model */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Asset Impact Model</CardTitle>
              <p className="text-xs text-muted-foreground">Expected annual return given current macro inputs</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {assetRows.map(({ label, key }) => {
                const val = impacts[key];
                const isPos = val >= 0;
                const barPct = Math.min(100, Math.abs(val) * 4);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={`font-mono font-medium ${isPos ? "text-green-500" : "text-red-400"}`}>
                        {isPos ? "+" : ""}{val.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`absolute inset-y-0 rounded-full transition-all duration-300 ${
                          isPos ? "left-1/2 bg-green-500" : "right-1/2 bg-red-400"
                        }`}
                        style={{ width: `${barPct / 2}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Radar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Macro Environment Radar</CardTitle>
              <p className="text-xs text-muted-foreground">Blue = current. Gray dashed = historical avg. Outer = extreme risk.</p>
            </CardHeader>
            <CardContent className="flex justify-center">
              <MacroRadarChart current={radarCurrent} avg={radarAvg} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Portfolio Stress Test */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Portfolio Stress Test</CardTitle>
          <p className="text-xs text-muted-foreground">
            Simulated $100K balanced portfolio — sector-by-sector estimated P&L under current macro scenario
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Sector rows */}
            {stressResults.map((s) => {
              const pos = s.dollarImpact >= 0;
              return (
                <div key={s.label} className="flex items-center gap-3 text-xs">
                  <span className="w-36 shrink-0 text-muted-foreground">{s.label}</span>
                  <span className="w-14 shrink-0 text-muted-foreground text-right font-mono">
                    {(s.weight * 100).toFixed(0)}%
                  </span>
                  {/* bar */}
                  <div className="flex-1 relative h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`absolute inset-y-0 rounded-full transition-all duration-300 ${pos ? "left-1/2 bg-green-500" : "right-1/2 bg-red-400"}`}
                      style={{ width: `${Math.min(50, Math.abs(s.impact) * 2)}%` }}
                    />
                  </div>
                  <span className={`w-20 shrink-0 text-right font-mono font-medium ${pos ? "text-green-500" : "text-red-400"}`}>
                    {pos ? "+" : ""}{fmtK(s.dollarImpact)}
                  </span>
                </div>
              );
            })}

            <div className="border-t border-border/60 pt-3 mt-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border/60 p-3 space-y-0.5">
                  <p className="text-xs text-muted-foreground">Portfolio P&L</p>
                  <p className={`text-base font-semibold font-mono ${totalImpact >= 0 ? "text-green-500" : "text-red-400"}`}>
                    {totalImpact >= 0 ? "+" : ""}{fmtK(totalImpact)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{totalImpactPct >= 0 ? "+" : ""}{totalImpactPct.toFixed(1)}%</p>
                </div>
                <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 space-y-0.5">
                  <p className="text-xs text-muted-foreground">Best Case</p>
                  <p className="text-base font-semibold font-mono text-green-500">
                    +{fmtK(PORTFOLIO_VALUE * (bestCase / 100))}
                  </p>
                  <p className="text-[10px] text-muted-foreground">+{bestCase.toFixed(1)}%</p>
                </div>
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 space-y-0.5">
                  <p className="text-xs text-muted-foreground">Worst Case</p>
                  <p className="text-base font-semibold font-mono text-red-400">
                    {fmtK(PORTFOLIO_VALUE * (worstCase / 100))}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{worstCase.toFixed(1)}%</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Best/worst case adds VIX-scaled volatility band ({(vars.vix / 20).toFixed(1)}x) to base estimate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────

type Tab = "twin" | "compound" | "scenario" | "tax" | "loan" | "macro";

const TABS: { id: Tab; label: string }[] = [
  { id: "twin", label: "Digital Twin" },
  { id: "compound", label: "Compound Calculator" },
  { id: "scenario", label: "Scenario Simulator" },
  { id: "tax", label: "Tax Calculator" },
  { id: "loan", label: "Loan Calculator" },
  { id: "macro", label: "Macro Simulator" },
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
          6 Tools
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
          <TabsContent value="macro" className="mt-0 data-[state=inactive]:hidden">
            <MacroSimulatorTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
