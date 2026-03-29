"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  Heart,
  Home,
  Car,
  Activity,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Calculator,
  Umbrella,
  Stethoscope,
  FileText,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 732002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
void rand; // available for future use

// ── Shared UI Helpers ──────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

function StatChip({
  label,
  value,
  color = "default",
}: {
  label: string;
  value: string;
  color?: "green" | "red" | "amber" | "blue" | "purple" | "default";
}) {
  const cls = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    default: "bg-muted text-muted-foreground border-border",
  }[color];
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-center", cls)}>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function InfoBox({
  title,
  children,
  variant = "default",
}: {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "green" | "amber" | "blue" | "purple";
}) {
  const cls = {
    default: "border-border bg-muted/30",
    green: "border-green-500/30 bg-green-500/5",
    amber: "border-amber-500/30 bg-amber-500/5",
    blue: "border-blue-500/30 bg-blue-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
  }[variant];
  return (
    <div className={cn("rounded-lg border p-4", cls)}>
      <div className="text-xs font-semibold text-muted-foreground mb-2">{title}</div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground">{format(value)}</span>
      </div>
      <div className="relative h-2 bg-muted rounded-full">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function fmt$(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

// ── Tab 1: Insurance Needs Calculator ─────────────────────────────────────────

function CoverageGapChart({
  lifeCoverage,
  lifeNeed,
  disabilityCoverage,
  disabilityNeed,
  liabilityCoverage,
  liabilityNeed,
}: {
  lifeCoverage: number;
  lifeNeed: number;
  disabilityCoverage: number;
  disabilityNeed: number;
  liabilityCoverage: number;
  liabilityNeed: number;
}) {
  const W = 480;
  const H = 200;
  const pad = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const categories = [
    { label: "Life", have: lifeCoverage, need: lifeNeed },
    { label: "Disability", have: disabilityCoverage, need: disabilityNeed },
    { label: "Liability", have: liabilityCoverage, need: liabilityNeed },
  ];

  const maxVal = Math.max(...categories.map((c) => Math.max(c.have, c.need)));
  const groupW = chartW / categories.length;
  const barW = (groupW * 0.35);
  const yScale = (v: number) => chartH - (v / maxVal) * chartH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      {/* Y-axis ticks */}
      {yTicks.map((tick, i) => {
        const y = pad.top + yScale(tick);
        return (
          <g key={`ytick-${i}`}>
            <line x1={pad.left} x2={pad.left + chartW} y1={y} y2={y} stroke="#334155" strokeWidth={0.5} strokeDasharray="3,3" />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#64748b">
              {fmt$(tick)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {categories.map((cat, i) => {
        const cx = pad.left + i * groupW + groupW / 2;
        const haveH = (cat.have / maxVal) * chartH;
        const needH = (cat.need / maxVal) * chartH;
        const gap = cat.need - cat.have;
        const hasGap = gap > 0;

        return (
          <g key={`bar-group-${i}`}>
            {/* Need bar (background) */}
            <rect
              x={cx - barW - 2}
              y={pad.top + chartH - needH}
              width={barW}
              height={needH}
              fill={hasGap ? "#ef444430" : "#22c55e30"}
              stroke={hasGap ? "#ef4444" : "#22c55e"}
              strokeWidth={1}
              rx={2}
            />
            <text x={cx - barW / 2 - 2} y={pad.top + chartH - needH - 3} textAnchor="middle" fontSize={8} fill="#94a3b8">
              Need
            </text>

            {/* Have bar */}
            <rect
              x={cx + 2}
              y={pad.top + chartH - haveH}
              width={barW}
              height={haveH}
              fill={hasGap ? "#3b82f680" : "#22c55e80"}
              rx={2}
            />
            <text x={cx + barW / 2 + 2} y={pad.top + chartH - haveH - 3} textAnchor="middle" fontSize={8} fill="#94a3b8">
              Have
            </text>

            {/* Gap indicator */}
            {hasGap && (
              <text x={cx} y={pad.top + chartH - needH - 14} textAnchor="middle" fontSize={8} fill="#ef4444">
                -{fmt$(gap)} gap
              </text>
            )}

            {/* Category label */}
            <text x={cx} y={pad.top + chartH + 14} textAnchor="middle" fontSize={10} fill="#94a3b8">
              {cat.label}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${pad.left}, ${H - 8})`}>
        <rect x={0} y={-6} width={10} height={8} fill="#3b82f680" rx={1} />
        <text x={14} y={1} fontSize={9} fill="#94a3b8">Current Coverage</text>
        <rect x={100} y={-6} width={10} height={8} fill="#ef444430" stroke="#ef4444" strokeWidth={1} rx={1} />
        <text x={114} y={1} fontSize={9} fill="#94a3b8">Recommended</text>
      </g>
    </svg>
  );
}

function InsuranceNeedsTab() {
  const [annualIncome, setAnnualIncome] = useState(85000);
  const [totalDebts, setTotalDebts] = useState(250000);
  const [dependents, setDependents] = useState(2);
  const [liquidAssets, setLiquidAssets] = useState(50000);
  const [existingLife, setExistingLife] = useState(200000);
  const [existingDisability, setExistingDisability] = useState(2000);

  const recommendations = useMemo(() => {
    // Life insurance: DIME method (Debts + Income×years + Mortgage + Education)
    const incomeYears = dependents > 0 ? 10 + dependents * 2 : 5;
    const educationCost = dependents * 60000;
    const lifeNeed = Math.max(0, totalDebts + annualIncome * incomeYears + educationCost - liquidAssets);

    // Disability: 60–70% of gross monthly income
    const monthlyIncome = annualIncome / 12;
    const disabilityNeed = Math.round(monthlyIncome * 0.65);

    // Liability: at least 3× net worth proxy
    const netWorthProxy = liquidAssets + 100000; // simplified
    const liabilityNeed = Math.max(300000, netWorthProxy * 3);

    const lifeCoverage = existingLife;
    const disabilityCoverage = existingDisability;
    const liabilityCoverage = 100000; // assumed baseline

    const lifeGap = Math.max(0, lifeNeed - lifeCoverage);
    const disabilityGap = Math.max(0, disabilityNeed - disabilityCoverage);
    const liabilityGap = Math.max(0, liabilityNeed - liabilityCoverage);

    return {
      lifeNeed, disabilityNeed, liabilityNeed,
      lifeCoverage, disabilityCoverage, liabilityCoverage,
      lifeGap, disabilityGap, liabilityGap,
    };
  }, [annualIncome, totalDebts, dependents, liquidAssets, existingLife, existingDisability]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Insurance Needs Calculator"
        subtitle="Interactive DIME-method calculator — Debts + Income replacement + Mortgage/expenses + Education"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          <div className="text-sm font-semibold text-foreground mb-1">Your Financial Profile</div>
          <SliderInput
            label="Annual Income"
            value={annualIncome}
            min={30000} max={300000} step={5000}
            format={fmt$}
            onChange={setAnnualIncome}
          />
          <SliderInput
            label="Total Debts (mortgage + loans)"
            value={totalDebts}
            min={0} max={1000000} step={10000}
            format={fmt$}
            onChange={setTotalDebts}
          />
          <SliderInput
            label="Dependents"
            value={dependents}
            min={0} max={6} step={1}
            format={(v) => `${v} person${v !== 1 ? "s" : ""}`}
            onChange={setDependents}
          />
          <SliderInput
            label="Liquid Assets (savings, investments)"
            value={liquidAssets}
            min={0} max={500000} step={5000}
            format={fmt$}
            onChange={setLiquidAssets}
          />
          <SliderInput
            label="Existing Life Insurance"
            value={existingLife}
            min={0} max={2000000} step={50000}
            format={fmt$}
            onChange={setExistingLife}
          />
          <SliderInput
            label="Existing Disability Benefit ($/mo)"
            value={existingDisability}
            min={0} max={10000} step={100}
            format={(v) => `${fmt$(v)}/mo`}
            onChange={setExistingDisability}
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="text-sm font-semibold text-foreground">Coverage Recommendations</div>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  label: "Life Insurance",
                  need: recommendations.lifeNeed,
                  have: recommendations.lifeCoverage,
                  gap: recommendations.lifeGap,
                  icon: <Heart className="h-4 w-4" />,
                },
                {
                  label: "Disability (monthly)",
                  need: recommendations.disabilityNeed,
                  have: recommendations.disabilityCoverage,
                  gap: recommendations.disabilityGap,
                  icon: <Activity className="h-4 w-4" />,
                  monthly: true,
                },
                {
                  label: "Liability Coverage",
                  need: recommendations.liabilityNeed,
                  have: recommendations.liabilityCoverage,
                  gap: recommendations.liabilityGap,
                  icon: <Shield className="h-4 w-4" />,
                },
              ].map((item) => {
                const covered = item.gap === 0;
                return (
                  <div key={item.label} className={cn("rounded-lg border p-3", covered ? "border-green-500/20 bg-green-500/5" : "border-amber-500/20 bg-amber-500/5")}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className={covered ? "text-green-400" : "text-amber-400"}>{item.icon}</span>
                        {item.label}
                      </div>
                      {covered ? (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Covered</Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">Gap Found</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Recommended</div>
                        <div className="font-semibold text-foreground">{fmt$(item.need)}{item.monthly ? "/mo" : ""}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">You Have</div>
                        <div className="font-semibold text-foreground">{fmt$(item.have)}{item.monthly ? "/mo" : ""}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Gap</div>
                        <div className={cn("font-semibold", item.gap > 0 ? "text-red-400" : "text-green-400")}>
                          {item.gap > 0 ? `-${fmt$(item.gap)}` : "None"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-semibold text-muted-foreground mb-3">Coverage Gap Chart</div>
            <CoverageGapChart
              lifeCoverage={recommendations.lifeCoverage}
              lifeNeed={recommendations.lifeNeed}
              disabilityCoverage={recommendations.disabilityCoverage * 12}
              disabilityNeed={recommendations.disabilityNeed * 12}
              liabilityCoverage={recommendations.liabilityCoverage}
              liabilityNeed={recommendations.liabilityNeed}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoBox title="DIME Method" variant="blue">
          <strong>D</strong>ebts + <strong>I</strong>ncome × years + <strong>M</strong>ortgage payoff + <strong>E</strong>ducation costs. Subtract liquid assets already available to heirs.
        </InfoBox>
        <InfoBox title="Disability Rule of Thumb" variant="amber">
          Most financial planners recommend replacing 60–70% of gross income. Employer group coverage often stops at 60% and may be taxable if employer-paid.
        </InfoBox>
        <InfoBox title="Liability Umbrella" variant="purple">
          Personal liability should be at least equal to your net worth. An umbrella policy extends coverage above auto/home limits for $150–$300/year.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 2: Life Insurance Comparison ──────────────────────────────────────────

function LifeCostChart({
  coverageAmount,
  age,
}: {
  coverageAmount: number;
  age: number;
}) {
  const W = 500;
  const H = 220;
  const pad = { top: 20, right: 20, bottom: 40, left: 70 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const years = 30;

  // Premium estimates (simplified actuarial approximation)
  const healthFactor = 1.0; // standard
  const ageFactor = Math.pow(1.04, Math.max(0, age - 30));
  const baseRate = (coverageAmount / 1_000_000) * ageFactor * healthFactor;

  const termPremium = baseRate * 400; // ~$400/yr per $1M at 30
  const wholePremium = baseRate * 4500;
  const universalPremium = baseRate * 3200;

  const data: { year: number; term: number; whole: number; universal: number }[] = [];
  for (let y = 1; y <= years; y++) {
    data.push({
      year: y,
      term: termPremium * y,
      whole: wholePremium * y,
      universal: universalPremium * y,
    });
  }

  const maxVal = Math.max(...data.map((d) => d.whole));
  const xScale = (y: number) => ((y - 1) / (years - 1)) * chartW;
  const yScale = (v: number) => chartH - (v / maxVal) * chartH;

  const toPath = (key: "term" | "whole" | "universal") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${pad.left + xScale(d.year)},${pad.top + yScale(d[key])}`).join(" ");

  const xTicks = [1, 5, 10, 15, 20, 25, 30];
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => maxVal * f);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }}>
      {/* Grid */}
      {yTicks.map((tick, i) => {
        const y = pad.top + yScale(tick);
        return (
          <g key={`ytick-${i}`}>
            <line x1={pad.left} x2={pad.left + chartW} y1={y} y2={y} stroke="#1e293b" strokeWidth={0.5} />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#64748b">
              {fmt$(tick)}
            </text>
          </g>
        );
      })}
      {xTicks.map((yr, i) => {
        const x = pad.left + xScale(yr);
        return (
          <g key={`xtick-${i}`}>
            <text x={x} y={pad.top + chartH + 14} textAnchor="middle" fontSize={9} fill="#64748b">Yr {yr}</text>
          </g>
        );
      })}

      {/* Lines */}
      <path d={toPath("whole")} fill="none" stroke="#a855f7" strokeWidth={2} />
      <path d={toPath("universal")} fill="none" stroke="#3b82f6" strokeWidth={2} />
      <path d={toPath("term")} fill="none" stroke="#22c55e" strokeWidth={2} />

      {/* Legend */}
      <g transform={`translate(${pad.left + 10}, ${pad.top + 10})`}>
        <rect x={0} y={0} width={10} height={3} fill="#22c55e" rx={1} />
        <text x={14} y={5} fontSize={9} fill="#94a3b8">Term Life (lowest cost)</text>
        <rect x={0} y={12} width={10} height={3} fill="#3b82f6" rx={1} />
        <text x={14} y={17} fontSize={9} fill="#94a3b8">Universal Life</text>
        <rect x={0} y={24} width={10} height={3} fill="#a855f7" rx={1} />
        <text x={14} y={29} fontSize={9} fill="#94a3b8">Whole Life (highest cost)</text>
      </g>
    </svg>
  );
}

function LifeInsuranceTab() {
  const [coverageAmount, setCoverageAmount] = useState(500000);
  const [age, setAge] = useState(35);
  const [healthClass, setHealthClass] = useState<"preferred_plus" | "preferred" | "standard">("preferred");

  const healthMultipliers = {
    preferred_plus: 0.85,
    preferred: 1.0,
    standard: 1.35,
  };

  const hm = healthMultipliers[healthClass];
  const ageFactor = Math.pow(1.04, Math.max(0, age - 30));
  const baseRate = (coverageAmount / 500000) * ageFactor * hm;

  const premiums = {
    term20: Math.round(baseRate * 280),
    term30: Math.round(baseRate * 400),
    whole: Math.round(baseRate * 3800),
    universal: Math.round(baseRate * 2800),
  };

  const policies = [
    {
      name: "20-Year Term",
      annual: premiums.term20,
      cashValue: false,
      permanentCoverage: false,
      pros: ["Lowest cost", "Simple to understand", "Pure protection"],
      cons: ["Coverage expires", "No cash value", "Renewal is expensive"],
      bestFor: "Young families, mortgage protection",
      color: "green" as const,
    },
    {
      name: "30-Year Term",
      annual: premiums.term30,
      cashValue: false,
      permanentCoverage: false,
      pros: ["Locked rate 30 years", "Covers children through college", "Affordable"],
      cons: ["Coverage expires", "No cash value build-up"],
      bestFor: "Long-term income replacement",
      color: "blue" as const,
    },
    {
      name: "Whole Life",
      annual: premiums.whole,
      cashValue: true,
      permanentCoverage: true,
      pros: ["Permanent coverage", "Guaranteed cash value", "Dividend potential"],
      cons: ["5–10× term cost", "Low investment returns (~2–3%)", "Complex"],
      bestFor: "Estate planning, high-net-worth",
      color: "purple" as const,
    },
    {
      name: "Universal Life",
      annual: premiums.universal,
      cashValue: true,
      permanentCoverage: true,
      pros: ["Flexible premiums", "Adjustable death benefit", "Cash value growth"],
      cons: ["Complex fees", "Rate risk (IUL/VUL)", "Can lapse if underfunded"],
      bestFor: "Business owners, flexible needs",
      color: "amber" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Life Insurance Comparison"
        subtitle="Compare term vs whole vs universal life — 30-year cumulative cost analysis"
      />

      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        <SliderInput
          label="Coverage Amount"
          value={coverageAmount}
          min={100000} max={5000000} step={50000}
          format={fmt$}
          onChange={setCoverageAmount}
        />
        <SliderInput
          label="Your Age"
          value={age}
          min={20} max={60} step={1}
          format={(v) => `${v} years old`}
          onChange={setAge}
        />
        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Health Class</div>
          <div className="flex gap-2">
            {(["preferred_plus", "preferred", "standard"] as const).map((hc) => (
              <button
                key={hc}
                onClick={() => setHealthClass(hc)}
                className={cn(
                  "flex-1 text-xs py-1.5 px-2 rounded-md border transition-colors",
                  healthClass === hc
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {hc === "preferred_plus" ? "Pref+" : hc === "preferred" ? "Preferred" : "Standard"}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {healthClass === "preferred_plus" ? "Excellent health, no conditions — lowest premiums" :
             healthClass === "preferred" ? "Good health, minor issues — standard pricing" :
             "Average health, some conditions — higher premiums"}
          </div>
        </div>
      </div>

      {/* 30-year cost chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm font-semibold text-foreground mb-1">Cumulative 30-Year Premium Cost</div>
        <p className="text-xs text-muted-foreground mb-4">Total out-of-pocket premiums paid over 30 years (excludes any cash value return)</p>
        <LifeCostChart coverageAmount={coverageAmount} age={age} />
      </div>

      {/* Policy comparison grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((p) => {
          const colorCls = {
            green: "border-green-500/20 bg-green-500/5",
            blue: "border-blue-500/20 bg-blue-500/5",
            purple: "border-purple-500/20 bg-purple-500/5",
            amber: "border-amber-500/20 bg-amber-500/5",
          }[p.color];
          const badgeCls = {
            green: "bg-green-500/10 text-green-400 border-green-500/20",
            blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
            amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          }[p.color];
          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("rounded-xl border p-4 space-y-3", colorCls)}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">{p.name}</div>
                <div className="text-base font-bold text-foreground">{fmt$(p.annual)}<span className="text-xs font-normal text-muted-foreground">/yr</span></div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge className={cn("text-xs", badgeCls)}>{fmt$(p.annual / 12)}/mo</Badge>
                <Badge className={cn("text-xs", p.cashValue ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-muted text-muted-foreground border-border")}>
                  {p.cashValue ? "Cash Value" : "No Cash Value"}
                </Badge>
                <Badge className={cn("text-xs", p.permanentCoverage ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-muted text-muted-foreground border-border")}>
                  {p.permanentCoverage ? "Permanent" : "Term Only"}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">Best for: {p.bestFor}</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-green-400 font-semibold mb-1">Pros</div>
                  {p.pros.map((pro, i) => (
                    <div key={i} className="flex items-start gap-1 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />
                      {pro}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs text-red-400 font-semibold mb-1">Cons</div>
                  {p.cons.map((con, i) => (
                    <div key={i} className="flex items-start gap-1 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                      {con}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Term vs Permanent — The Classic Debate" variant="blue">
          A 35-year-old can buy {fmt$(coverageAmount)} term for ~{fmt$(premiums.term30)}/yr vs {fmt$(premiums.whole)}/yr for whole life — a {fmt$(premiums.whole - premiums.term30)}/yr difference invested in index funds often outperforms the cash value growth.
        </InfoBox>
        <InfoBox title="Health Class Impact" variant="amber">
          Preferred Plus vs Standard can differ by 30–50% in premiums. Non-smoker status alone saves 30–40%. Improve health metrics before applying — even 6 months makes a difference in underwriting.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 3: Disability Insurance ───────────────────────────────────────────────

function DisabilityTab() {
  const [monthlyIncome, setMonthlyIncome] = useState(7000);
  const [eliminationPeriod, setEliminationPeriod] = useState<30 | 60 | 90 | 180>(90);
  const [benefitPeriod, setBenefitPeriod] = useState<"2yr" | "5yr" | "toAge65" | "toAge67">("toAge65");
  const [ownOccupation, setOwnOccupation] = useState(true);
  const [age, setAge] = useState(38);

  const replacementRate = 0.65;
  const monthlyBenefit = Math.round(monthlyIncome * replacementRate);

  const benefitPeriodLabels = {
    "2yr": "2 Years",
    "5yr": "5 Years",
    "toAge65": "To Age 65",
    "toAge67": "To Age 67",
  };

  const benefitPeriodMultipliers = {
    "2yr": 0.55,
    "5yr": 0.70,
    "toAge65": 1.0,
    "toAge67": 1.08,
  };

  const eliminationMultipliers: Record<number, number> = {
    30: 1.30,
    60: 1.15,
    90: 1.0,
    180: 0.82,
  };

  const baseAnnualPremium = monthlyBenefit * 0.022 * Math.pow(1.03, Math.max(0, age - 30));
  const adjustedPremium = Math.round(
    baseAnnualPremium *
    benefitPeriodMultipliers[benefitPeriod] *
    eliminationMultipliers[eliminationPeriod] *
    (ownOccupation ? 1.20 : 1.0)
  );

  const maxBenefit = (() => {
    const yearsLeft = 65 - age;
    const months = benefitPeriod === "2yr" ? 24 : benefitPeriod === "5yr" ? 60 : yearsLeft * 12;
    return monthlyBenefit * Math.min(months, yearsLeft * 12);
  })();

  const elimDays: Record<string, number> = { "30": 30, "60": 60, "90": 90, "180": 180 };

  // Savings needed to cover elimination period
  const elimSavingsNeeded = monthlyIncome * (elimDays[String(eliminationPeriod)] / 30);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Disability Insurance Planner"
        subtitle="Own-occupation definition, benefit/elimination periods, and income replacement math"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <div className="text-sm font-semibold text-foreground">Your Parameters</div>
            <SliderInput
              label="Monthly Gross Income"
              value={monthlyIncome}
              min={2000} max={30000} step={500}
              format={(v) => `${fmt$(v)}/mo`}
              onChange={setMonthlyIncome}
            />
            <SliderInput
              label="Your Age"
              value={age}
              min={22} max={60} step={1}
              format={(v) => `${v} years old`}
              onChange={setAge}
            />

            {/* Elimination Period */}
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground">Elimination Period (waiting period before benefits begin)</div>
              <div className="grid grid-cols-4 gap-1.5">
                {([30, 60, 90, 180] as const).map((ep) => (
                  <button
                    key={ep}
                    onClick={() => setEliminationPeriod(ep)}
                    className={cn(
                      "text-xs py-1.5 rounded-md border transition-colors",
                      eliminationPeriod === ep
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {ep} days
                  </button>
                ))}
              </div>
            </div>

            {/* Benefit Period */}
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground">Benefit Period (how long benefits last)</div>
              <div className="grid grid-cols-2 gap-1.5">
                {(["2yr", "5yr", "toAge65", "toAge67"] as const).map((bp) => (
                  <button
                    key={bp}
                    onClick={() => setBenefitPeriod(bp)}
                    className={cn(
                      "text-xs py-1.5 rounded-md border transition-colors",
                      benefitPeriod === bp
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {benefitPeriodLabels[bp]}
                  </button>
                ))}
              </div>
            </div>

            {/* Own Occupation toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="text-sm font-medium text-foreground">Own-Occupation Definition</div>
                <div className="text-xs text-muted-foreground">Pays if you can't do your specific occupation</div>
              </div>
              <button
                onClick={() => setOwnOccupation(!ownOccupation)}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  ownOccupation ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                  ownOccupation ? "translate-x-5" : "translate-x-0.5"
                )} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBox title="Short-Term Disability" variant="blue">
              Covers 60–90% of income for 3–6 months. Usually employer-provided. Bridges gap before LTD kicks in.
            </InfoBox>
            <InfoBox title="Long-Term Disability" variant="purple">
              Kicks in after elimination period. Most valuable protection for professionals — 1 in 4 workers will face disability before retirement.
            </InfoBox>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="text-sm font-semibold text-foreground">Coverage Summary</div>
            <div className="grid grid-cols-2 gap-3">
              <StatChip label="Monthly Benefit" value={`${fmt$(monthlyBenefit)}/mo`} color="green" />
              <StatChip label="Replacement Rate" value="65% of gross" color="blue" />
              <StatChip label="Estimated Annual Premium" value={`${fmt$(adjustedPremium)}/yr`} color="amber" />
              <StatChip label="Premium % of Income" value={`${((adjustedPremium / (monthlyIncome * 12)) * 100).toFixed(1)}%`} color="default" />
              <StatChip label="Max Lifetime Benefit" value={fmt$(maxBenefit)} color="purple" />
              <StatChip label="Elim. Savings Needed" value={fmt$(elimSavingsNeeded)} color="red" />
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
              <div className="text-xs font-semibold text-foreground">Policy Type Comparison</div>
              <div className="space-y-2">
                {[
                  { label: "Any-Occupation (cheapest)", multiplier: 1.0, desc: "Pays only if you can't do any job" },
                  { label: "Own-Occupation (recommended)", multiplier: 1.20, desc: "Pays if you can't do your specific job" },
                  { label: "Modified Own-Occ (hybrid)", multiplier: 1.10, desc: "Own-occ for 2 yrs, then any-occ" },
                ].map((policy) => (
                  <div key={policy.label} className="flex items-center justify-between text-xs">
                    <div>
                      <div className="text-foreground">{policy.label}</div>
                      <div className="text-muted-foreground">{policy.desc}</div>
                    </div>
                    <div className="font-semibold text-foreground shrink-0 ml-3">
                      {fmt$(Math.round(adjustedPremium * policy.multiplier / (ownOccupation ? 1.2 : 1.0) * policy.multiplier))}/yr
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <InfoBox title="Key Insight: Elimination Period Trade-off" variant="amber">
            Going from 30-day to 90-day elimination saves ~18% on premiums. Use your emergency fund to cover the waiting period. A 6-month fund + 90-day elimination is the optimal balance for most people.
          </InfoBox>

          <InfoBox title="Social Security Disability (SSDI)" variant="default">
            Average SSDI benefit is ~{fmt$(1400)}/month — far below most income needs. The application process takes 2+ years for approval. Private LTD is essential for income protection.
          </InfoBox>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Property & Auto ─────────────────────────────────────────────────────

function CoverageLadderChart({
  autoLiability,
  homeCoverage,
  umbrellaLimit,
}: {
  autoLiability: number;
  homeCoverage: number;
  umbrellaLimit: number;
}) {
  const W = 400;
  const H = 220;

  const layers = [
    { label: "Auto Liability", amount: autoLiability, color: "#3b82f6", y: 160 },
    { label: "Homeowners Liability", amount: homeCoverage, color: "#a855f7", y: 110 },
    { label: "Umbrella Policy", amount: umbrellaLimit, color: "#22c55e", y: 50 },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }}>
      <text x={W / 2} y={20} textAnchor="middle" fontSize={11} fill="#94a3b8" fontWeight="600">
        Liability Coverage Ladder
      </text>
      {layers.map((layer, i) => {
        const barW = 200 + (2 - i) * 40;
        const x = (W - barW) / 2;
        return (
          <g key={`layer-${i}`}>
            <rect x={x} y={layer.y} width={barW} height={34} rx={4} fill={layer.color} fillOpacity={0.2} stroke={layer.color} strokeWidth={1} />
            <text x={W / 2} y={layer.y + 14} textAnchor="middle" fontSize={10} fill={layer.color} fontWeight="600">
              {layer.label}
            </text>
            <text x={W / 2} y={layer.y + 26} textAnchor="middle" fontSize={9} fill="#94a3b8">
              {fmt$(layer.amount)} coverage
            </text>
            {i < layers.length - 1 && (
              <line x1={W / 2} y1={layer.y} x2={W / 2} y2={layer.y - 8} stroke="#475569" strokeWidth={1} strokeDasharray="3,2" />
            )}
          </g>
        );
      })}
      <text x={W / 2} y={H - 5} textAnchor="middle" fontSize={9} fill="#64748b">
        Total protection: {fmt$(autoLiability + homeCoverage + umbrellaLimit)}
      </text>
    </svg>
  );
}

function PropertyAutoTab() {
  const [homeValue, setHomeValue] = useState(400000);
  const [autoLiabilityLimit, setAutoLiabilityLimit] = useState(100000);
  const [umbrellaLimit, setUmbrellaLimit] = useState(1000000);
  const [replacementCost, setReplacementCost] = useState(true);

  const homeRebuildCost = Math.round(homeValue * 0.75); // ~75% of market value for rebuild
  const acvCoverage = Math.round(homeRebuildCost * 0.7); // ACV depreciates
  const replacementCoverage = homeRebuildCost;

  const homePremium = Math.round(homeValue * 0.0055);
  const replacementUpcharge = Math.round(homePremium * 0.15);
  const autoPremium = Math.round(600 + autoLiabilityLimit * 0.002);
  const umbrellaPremium = Math.round(150 + umbrellaLimit * 0.00015);

  const totalAnnualPremium = homePremium + (replacementCost ? replacementUpcharge : 0) + autoPremium + umbrellaPremium;

  const autoLimits = [
    { label: "25/50/25", bodily1: 25000, bodily2: 50000, property: 25000, desc: "State minimum — dangerously low" },
    { label: "50/100/50", bodily1: 50000, bodily2: 100000, property: 50000, desc: "Moderate — insufficient for assets" },
    { label: "100/300/100", bodily1: 100000, bodily2: 300000, property: 100000, desc: "Recommended standard" },
    { label: "250/500/100", bodily1: 250000, bodily2: 500000, property: 100000, desc: "High limit — best protection" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Property & Auto Insurance"
        subtitle="Homeowners coverage (ACV vs replacement cost), auto liability limits, umbrella value"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <div className="text-sm font-semibold text-foreground">Your Coverage Parameters</div>
            <SliderInput
              label="Home Market Value"
              value={homeValue}
              min={100000} max={2000000} step={25000}
              format={fmt$}
              onChange={setHomeValue}
            />
            <SliderInput
              label="Auto Liability Limit (per person)"
              value={autoLiabilityLimit}
              min={25000} max={500000} step={25000}
              format={fmt$}
              onChange={setAutoLiabilityLimit}
            />
            <SliderInput
              label="Umbrella Policy Limit"
              value={umbrellaLimit}
              min={1000000} max={5000000} step={500000}
              format={fmt$}
              onChange={setUmbrellaLimit}
            />
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="text-sm font-medium text-foreground">Replacement Cost Coverage</div>
                <div className="text-xs text-muted-foreground">vs. Actual Cash Value (ACV)</div>
              </div>
              <button
                onClick={() => setReplacementCost(!replacementCost)}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  replacementCost ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                  replacementCost ? "translate-x-5" : "translate-x-0.5"
                )} />
              </button>
            </div>
          </div>

          {/* ACV vs Replacement Cost */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="text-sm font-semibold text-foreground">ACV vs Replacement Cost</div>
            <div className="grid grid-cols-2 gap-3">
              <div className={cn("rounded-lg border p-3", !replacementCost ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-muted/20")}>
                <div className="text-xs font-semibold text-amber-400 mb-2">Actual Cash Value</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Rebuild cost: {fmt$(homeRebuildCost)}</div>
                  <div>After depreciation: {fmt$(acvCoverage)}</div>
                  <div className="text-red-400">Out-of-pocket gap: {fmt$(homeRebuildCost - acvCoverage)}</div>
                </div>
              </div>
              <div className={cn("rounded-lg border p-3", replacementCost ? "border-green-500/30 bg-green-500/5" : "border-border bg-muted/20")}>
                <div className="text-xs font-semibold text-green-400 mb-2">Replacement Cost</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Rebuild cost: {fmt$(homeRebuildCost)}</div>
                  <div>Coverage: {fmt$(replacementCoverage)}</div>
                  <div className="text-green-400">Extra premium: {fmt$(replacementUpcharge)}/yr</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <CoverageLadderChart
              autoLiability={autoLiabilityLimit * 3}
              homeCoverage={300000}
              umbrellaLimit={umbrellaLimit}
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="text-sm font-semibold text-foreground">Annual Premium Summary</div>
            <div className="space-y-2">
              {[
                { label: "Homeowners (base)", amount: homePremium },
                { label: `Replacement Cost ${replacementCost ? "add-on" : "(not selected)"}`, amount: replacementCost ? replacementUpcharge : 0 },
                { label: "Auto Insurance", amount: autoPremium },
                { label: `Umbrella (${fmt$(umbrellaLimit)})`, amount: umbrellaPremium },
              ].map((line) => (
                <div key={line.label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{line.label}</span>
                  <span className="font-medium text-foreground">{fmt$(line.amount)}/yr</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                <span className="text-foreground">Total Annual Premium</span>
                <span className="text-primary">{fmt$(totalAnnualPremium)}/yr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Liability Limits Table */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm font-semibold text-foreground mb-3">Auto Liability Limit Comparison (Bodily Injury / Aggregate / Property)</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {autoLimits.map((limit) => {
            const recommended = limit.label === "100/300/100";
            return (
              <div key={limit.label} className={cn("rounded-lg border p-3", recommended ? "border-primary/30 bg-primary/5" : "border-border")}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-semibold text-foreground">{limit.label}</div>
                  {recommended && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Recommended</Badge>}
                </div>
                <div className="text-xs text-muted-foreground mb-2">{limit.desc}</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><div className="text-muted-foreground">Per Person</div><div className="font-medium text-foreground">{fmt$(limit.bodily1)}</div></div>
                  <div><div className="text-muted-foreground">Per Accident</div><div className="font-medium text-foreground">{fmt$(limit.bodily2)}</div></div>
                  <div><div className="text-muted-foreground">Property</div><div className="font-medium text-foreground">{fmt$(limit.property)}</div></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Umbrella Policy Value" variant="green">
          An umbrella policy costs {fmt$(umbrellaPremium)}/yr for {fmt$(umbrellaLimit)} in extra protection above your auto and home limits. It's one of the best values in personal insurance — catastrophic lawsuits can exceed home/auto policy limits.
        </InfoBox>
        <InfoBox title="Flood & Earthquake" variant="amber">
          Standard homeowners policies exclude flood and earthquake damage. NFIP flood insurance averages ~$700/yr. Earthquake coverage is essential in high-risk zones. Neither is optional if you're in a risk zone.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 5: Health & Medicare ──────────────────────────────────────────────────

function HealthCostChart({
  years,
  hsaContrib,
  hdhpPremium,
  ppoPremium,
  annualClaims,
}: {
  years: number;
  hsaContrib: number;
  hdhpPremium: number;
  ppoPremium: number;
  annualClaims: number;
}) {
  const W = 500;
  const H = 220;
  const pad = { top: 20, right: 20, bottom: 40, left: 70 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const hdhpDeductible = 1500;
  const ppoDeductible = 500;
  const hdhpOOPMax = 4000;
  const ppoOOPMax = 3000;

  const data: { year: number; hdhpTotal: number; ppoTotal: number }[] = [];
  let hsaBalance = 0;
  let hdhpCumulative = 0;
  let ppoCumulative = 0;

  for (let y = 1; y <= years; y++) {
    hsaBalance += hsaContrib;
    const hdhpOOP = Math.min(annualClaims, hdhpOOPMax);
    const ppoOOP = Math.min(Math.max(0, annualClaims - ppoDeductible) * 0.2 + ppoDeductible, ppoOOPMax);
    hdhpCumulative += hdhpPremium * 12 + hdhpOOP - hsaContrib * 0.28; // tax savings
    ppoCumulative += ppoPremium * 12 + ppoOOP;
    data.push({ year: y, hdhpTotal: hdhpCumulative, ppoTotal: ppoCumulative });
    void hdhpDeductible;
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.hdhpTotal, d.ppoTotal)));
  const xScale = (y: number) => ((y - 1) / (years - 1)) * chartW;
  const yScale = (v: number) => chartH - (Math.max(0, v) / maxVal) * chartH;

  const hdhpPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${pad.left + xScale(d.year)},${pad.top + yScale(d.hdhpTotal)}`).join(" ");
  const ppoPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${pad.left + xScale(d.year)},${pad.top + yScale(d.ppoTotal)}`).join(" ");

  const xTicks = Array.from({ length: Math.min(years, 6) }, (_, i) => Math.round((i / 5) * (years - 1)) + 1);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => maxVal * f);

  // Find crossover year
  const crossover = data.find((d) => d.hdhpTotal < d.ppoTotal);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }}>
      {yTicks.map((tick, i) => {
        const y = pad.top + yScale(tick);
        return (
          <g key={`ytick-${i}`}>
            <line x1={pad.left} x2={pad.left + chartW} y1={y} y2={y} stroke="#1e293b" strokeWidth={0.5} />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#64748b">{fmt$(tick)}</text>
          </g>
        );
      })}
      {xTicks.map((yr, i) => (
        <text key={`xtick-${i}`} x={pad.left + xScale(yr)} y={pad.top + chartH + 14} textAnchor="middle" fontSize={9} fill="#64748b">
          Yr {yr}
        </text>
      ))}

      <path d={ppoPath} fill="none" stroke="#ef4444" strokeWidth={2} />
      <path d={hdhpPath} fill="none" stroke="#22c55e" strokeWidth={2} />

      {crossover && (
        <line
          x1={pad.left + xScale(crossover.year)}
          x2={pad.left + xScale(crossover.year)}
          y1={pad.top}
          y2={pad.top + chartH}
          stroke="#f59e0b"
          strokeWidth={1}
          strokeDasharray="4,2"
        />
      )}

      <g transform={`translate(${pad.left + 10}, ${pad.top + 8})`}>
        <rect x={0} y={0} width={10} height={3} fill="#22c55e" rx={1} />
        <text x={14} y={5} fontSize={9} fill="#94a3b8">HDHP + HSA (after tax savings)</text>
        <rect x={0} y={12} width={10} height={3} fill="#ef4444" rx={1} />
        <text x={14} y={17} fontSize={9} fill="#94a3b8">PPO Cumulative Cost</text>
      </g>
    </svg>
  );
}

function HealthMedicareTab() {
  const [monthlyHdhpPremium, setMonthlyHdhpPremium] = useState(280);
  const [monthlyPpoPremium, setMonthlyPpoPremium] = useState(520);
  const [hsaContrib, setHsaContrib] = useState(3850);
  const [annualClaims, setAnnualClaims] = useState(2000);
  const [analysisYears, setAnalysisYears] = useState(10);
  const [marginalRate, setMarginalRate] = useState(22);

  // HSA triple tax advantage
  const hsaTaxSavings = Math.round(hsaContrib * (marginalRate / 100));
  const hsaStateIncomeTax = Math.round(hsaContrib * 0.055); // assume ~5.5% state
  const hsaFicaSavings = Math.round(Math.min(hsaContrib, 160200) * 0.0765); // FICA if employer
  const totalHsaSavings = hsaTaxSavings + hsaStateIncomeTax; // conservative (no FICA on individual)

  const hsaLimits2024 = { individual: 4150, family: 8300 };
  const hsaBalance10yr = Math.round(hsaContrib * 10 * Math.pow(1.07, 5)); // rough 7% growth

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Health Insurance & Medicare Planning"
        subtitle="HSA triple tax advantage, HDHP vs PPO analysis, Medicare parts explained"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <div className="text-sm font-semibold text-foreground">Plan Comparison Parameters</div>
            <SliderInput
              label="HDHP Monthly Premium"
              value={monthlyHdhpPremium}
              min={100} max={800} step={10}
              format={(v) => `${fmt$(v)}/mo`}
              onChange={setMonthlyHdhpPremium}
            />
            <SliderInput
              label="PPO Monthly Premium"
              value={monthlyPpoPremium}
              min={200} max={1500} step={20}
              format={(v) => `${fmt$(v)}/mo`}
              onChange={setMonthlyPpoPremium}
            />
            <SliderInput
              label="Annual HSA Contribution"
              value={hsaContrib}
              min={0} max={hsaLimits2024.family} step={100}
              format={fmt$}
              onChange={setHsaContrib}
            />
            <SliderInput
              label="Estimated Annual Healthcare Claims"
              value={annualClaims}
              min={0} max={15000} step={500}
              format={fmt$}
              onChange={setAnnualClaims}
            />
            <SliderInput
              label="Federal Marginal Tax Rate"
              value={marginalRate}
              min={10} max={37} step={1}
              format={(v) => `${v}%`}
              onChange={setMarginalRate}
            />
            <SliderInput
              label="Analysis Period"
              value={analysisYears}
              min={3} max={30} step={1}
              format={(v) => `${v} years`}
              onChange={setAnalysisYears}
            />
          </div>

          {/* HSA Triple Tax Advantage */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <DollarSign className="h-4 w-4 text-primary" />
              HSA Triple Tax Advantage ({fmt$(hsaContrib)}/yr contribution)
            </div>
            <div className="space-y-2">
              {[
                { label: "1. Federal income tax deduction", saving: hsaTaxSavings, color: "green" as const },
                { label: "2. State income tax deduction (~5.5%)", saving: hsaStateIncomeTax, color: "blue" as const },
                { label: "3. Tax-free withdrawals for medical", saving: Math.round(annualClaims * (marginalRate / 100)), color: "purple" as const },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={cn("font-semibold", {
                    green: "text-green-400",
                    blue: "text-blue-400",
                    purple: "text-purple-400",
                  }[item.color])}>
                    +{fmt$(item.saving)} saved
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs border-t border-primary/20 pt-2">
                <span className="font-semibold text-foreground">Total Annual Tax Savings</span>
                <span className="font-bold text-primary">{fmt$(totalHsaSavings + Math.round(annualClaims * (marginalRate / 100)))}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              10-year HSA balance (at 7% growth, {fmt$(hsaContrib)}/yr): <span className="text-green-400 font-semibold">{fmt$(hsaBalance10yr)}</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-sm font-semibold text-foreground mb-1">Cumulative Cost Comparison ({analysisYears} Years)</div>
            <p className="text-xs text-muted-foreground mb-3">HDHP includes HSA contribution tax savings (~{marginalRate}% federal)</p>
            <HealthCostChart
              years={analysisYears}
              hsaContrib={hsaContrib}
              hdhpPremium={monthlyHdhpPremium}
              ppoPremium={monthlyPpoPremium}
              annualClaims={annualClaims}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatChip label="HDHP Annual Premium" value={`${fmt$(monthlyHdhpPremium * 12)}/yr`} color="green" />
            <StatChip label="PPO Annual Premium" value={`${fmt$(monthlyPpoPremium * 12)}/yr`} color="red" />
            <StatChip label="Annual Premium Savings" value={`${fmt$((monthlyPpoPremium - monthlyHdhpPremium) * 12)}/yr`} color="blue" />
            <StatChip label="HSA 2024 Limit (Ind)" value={fmt$(hsaLimits2024.individual)} color="purple" />
          </div>
        </div>
      </div>

      {/* Medicare Parts */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm font-semibold text-foreground mb-4">Medicare Parts Explained</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              part: "Part A",
              name: "Hospital Insurance",
              cost: "$0 premium (if 40+ work quarters)",
              covers: "Inpatient hospital, skilled nursing, hospice",
              color: "blue" as const,
            },
            {
              part: "Part B",
              name: "Medical Insurance",
              cost: "$174.70/mo (2024 standard)",
              covers: "Doctor visits, outpatient, preventive care",
              color: "green" as const,
            },
            {
              part: "Part C",
              name: "Medicare Advantage",
              cost: "Varies by plan (bundled A+B+D)",
              covers: "Private plan covering all Medicare + extras",
              color: "purple" as const,
            },
            {
              part: "Part D",
              name: "Prescription Drugs",
              cost: "~$35/mo avg premium",
              covers: "Formulary-based prescription drug coverage",
              color: "amber" as const,
            },
          ].map((part) => {
            const colorCls = {
              blue: "border-blue-500/20 bg-blue-500/5",
              green: "border-green-500/20 bg-green-500/5",
              purple: "border-purple-500/20 bg-purple-500/5",
              amber: "border-amber-500/20 bg-amber-500/5",
            }[part.color];
            const partCls = {
              blue: "text-blue-400",
              green: "text-green-400",
              purple: "text-purple-400",
              amber: "text-amber-400",
            }[part.color];
            return (
              <div key={part.part} className={cn("rounded-lg border p-3 space-y-2", colorCls)}>
                <div className="flex items-center gap-2">
                  <span className={cn("text-lg font-bold", partCls)}>{part.part}</span>
                  <span className="text-xs font-semibold text-foreground">{part.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">{part.covers}</div>
                <div className={cn("text-xs font-medium", partCls)}>{part.cost}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoBox title="HDHP Qualification for HSA" variant="blue">
          2024: Deductible ≥ $1,600 (individual) or $3,200 (family). Out-of-pocket max ≤ $8,050 individual / $16,100 family. Employer plans often contribute $500–$1,500/yr to your HSA.
        </InfoBox>
        <InfoBox title="Medigap / Supplement Plans" variant="purple">
          Covers Medicare A & B gaps (copays, deductibles). Plans F & G most comprehensive. Best enrolled during Open Enrollment at 65 — no medical underwriting required. Premiums range $100–$300/mo.
        </InfoBox>
        <InfoBox title="IRMAA Surcharges" variant="amber">
          High earners pay Medicare surcharges (IRMAA). Incomes above $103,000 (individual) trigger higher Part B & D premiums — up to $594/mo for top earners. Plan Roth conversions carefully.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PersonalInsurancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Personal Insurance Planning</h1>
            <p className="text-sm text-muted-foreground">Risk protection analysis — life, disability, property, health</p>
          </div>
          <div className="ml-auto flex gap-2 flex-wrap">
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
              <Heart className="h-3 w-3 mr-1" />Life
            </Badge>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
              <Activity className="h-3 w-3 mr-1" />Disability
            </Badge>
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
              <Home className="h-3 w-3 mr-1" />Property
            </Badge>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
              <Stethoscope className="h-3 w-3 mr-1" />Health
            </Badge>
          </div>
        </div>

        {/* Summary chips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Avg American Insured", value: "~62%", sub: "adequate life coverage", color: "amber" as const, icon: <Users className="h-3.5 w-3.5" /> },
            { label: "Disability Probability", value: "1 in 4", sub: "before retirement", color: "red" as const, icon: <AlertTriangle className="h-3.5 w-3.5" /> },
            { label: "HSA Tax Advantage", value: "3× taxes", sub: "contribute/grow/withdraw", color: "green" as const, icon: <DollarSign className="h-3.5 w-3.5" /> },
            { label: "Umbrella Policy ROI", value: "100–200×", sub: "coverage per dollar", color: "blue" as const, icon: <Umbrella className="h-3.5 w-3.5" /> },
          ].map((chip) => {
            const cls = {
              amber: "border-amber-500/20 bg-amber-500/5 text-amber-400",
              red: "border-red-500/20 bg-red-500/5 text-red-400",
              green: "border-green-500/20 bg-green-500/5 text-green-400",
              blue: "border-blue-500/20 bg-blue-500/5 text-blue-400",
            }[chip.color];
            return (
              <div key={chip.label} className={cn("rounded-xl border p-3", cls)}>
                <div className="flex items-center gap-1.5 mb-1">{chip.icon}<div className="text-xs text-muted-foreground">{chip.label}</div></div>
                <div className="text-lg font-bold text-foreground">{chip.value}</div>
                <div className="text-xs text-muted-foreground">{chip.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="needs">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/40 p-1 rounded-xl">
            <TabsTrigger value="needs" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background">
              <Calculator className="h-3.5 w-3.5" />Needs Calculator
            </TabsTrigger>
            <TabsTrigger value="life" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background">
              <Heart className="h-3.5 w-3.5" />Life Insurance
            </TabsTrigger>
            <TabsTrigger value="disability" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background">
              <Activity className="h-3.5 w-3.5" />Disability
            </TabsTrigger>
            <TabsTrigger value="property" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background">
              <Home className="h-3.5 w-3.5" />Property &amp; Auto
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background">
              <Stethoscope className="h-3.5 w-3.5" />Health &amp; Medicare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="needs" className="mt-6 data-[state=inactive]:hidden">
            <InsuranceNeedsTab />
          </TabsContent>
          <TabsContent value="life" className="mt-6 data-[state=inactive]:hidden">
            <LifeInsuranceTab />
          </TabsContent>
          <TabsContent value="disability" className="mt-6 data-[state=inactive]:hidden">
            <DisabilityTab />
          </TabsContent>
          <TabsContent value="property" className="mt-6 data-[state=inactive]:hidden">
            <PropertyAutoTab />
          </TabsContent>
          <TabsContent value="health" className="mt-6 data-[state=inactive]:hidden">
            <HealthMedicareTab />
          </TabsContent>
        </Tabs>

        {/* Footer disclaimer */}
        <div className="rounded-lg border border-border bg-muted/20 p-3 flex items-start gap-2">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong>Educational Purposes Only.</strong> Premium estimates use actuarial approximations and real-world figures vary by state, insurer, health history, and underwriting. Consult a licensed insurance professional before making coverage decisions. All 2024 limits and figures are illustrative.
          </p>
        </div>
      </div>
    </div>
  );
}
