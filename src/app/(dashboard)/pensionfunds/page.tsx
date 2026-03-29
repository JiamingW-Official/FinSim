"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  TrendingUp,
  BarChart3,
  Layers,
  BookOpen,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Info,
  Users,
  Calendar,
  Target,
  Activity,
  PieChart,
  ArrowRight,
  Lock,
  Globe,
  Percent,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 935;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface PlanComparison {
  dimension: string;
  db: string;
  dc: string;
  dbColor: string;
  dcColor: string;
}

interface GlobalPensionSystem {
  country: string;
  flag: string;
  assets: number; // USD trillions
  type: string;
  gdpPct: number;
}

interface DBDeclinePoint {
  year: number;
  dbPct: number;
  dcPct: number;
}

interface VestingSchedule {
  type: "cliff" | "graded";
  years: number[];
  vestedPct: number[];
}

interface FundedStatusScenario {
  label: string;
  discountRate: number;
  pbo: number; // billions
  assets: number; // billions
  fundedStatus: number; // pct
  color: string;
}

interface ActuarialAssumption {
  name: string;
  currentValue: string;
  range: string;
  impact: string;
  sensitivity: string;
}

interface MortalityTableEntry {
  table: string;
  year: number;
  lifeExpectancy65M: number;
  lifeExpectancy65F: number;
  description: string;
}

interface AssetAllocation {
  label: string;
  pct: number;
  color: string;
  description: string;
}

interface AlternativesGrowth {
  year: number;
  pct: number;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const PLAN_COMPARISONS: PlanComparison[] = [
  {
    dimension: "Benefit",
    db: "Defined monthly income based on salary & years of service",
    dc: "Depends on contributions + investment performance",
    dbColor: "text-emerald-400",
    dcColor: "text-primary",
  },
  {
    dimension: "Investment Risk",
    db: "Borne by employer (plan sponsor)",
    dc: "Borne entirely by employee",
    dbColor: "text-emerald-400",
    dcColor: "text-amber-400",
  },
  {
    dimension: "Longevity Risk",
    db: "Borne by employer — pays until death",
    dc: "Employee may outlive savings",
    dbColor: "text-emerald-400",
    dcColor: "text-red-400",
  },
  {
    dimension: "Portability",
    db: "Low — often lost when changing jobs",
    dc: "High — rolls over to new employer or IRA",
    dbColor: "text-amber-400",
    dcColor: "text-emerald-400",
  },
  {
    dimension: "Vesting",
    db: "5–7 years cliff or graded vesting",
    dc: "Typically 3–6 years for employer match",
    dbColor: "text-amber-400",
    dcColor: "text-emerald-400",
  },
  {
    dimension: "PBGC Coverage",
    db: "Yes — up to $7,131/month (2025 limit)",
    dc: "No PBGC coverage; SIPC for broker assets",
    dbColor: "text-emerald-400",
    dcColor: "text-muted-foreground",
  },
  {
    dimension: "Predictability",
    db: "High — formula-based benefit known in advance",
    dc: "Low — market-dependent outcome",
    dbColor: "text-emerald-400",
    dcColor: "text-amber-400",
  },
  {
    dimension: "Employer Cost",
    db: "Variable — actuarially determined contributions",
    dc: "Fixed — typically 3–6% of salary match",
    dbColor: "text-amber-400",
    dcColor: "text-emerald-400",
  },
  {
    dimension: "Transparency",
    db: "Low — complex actuarial calculations",
    dc: "High — account balance always visible",
    dbColor: "text-amber-400",
    dcColor: "text-emerald-400",
  },
  {
    dimension: "Prevalence",
    db: "Declining — 15% of US private workers (2023)",
    dc: "Dominant — 65% of US private workers (2023)",
    dbColor: "text-red-400",
    dcColor: "text-emerald-400",
  },
];

const GLOBAL_PENSION_SYSTEMS: GlobalPensionSystem[] = [
  { country: "USA", flag: "🇺🇸", assets: 22.1, type: "Mixed DB/DC", gdpPct: 84 },
  { country: "UK", flag: "🇬🇧", assets: 3.6, type: "Mixed DB/DC", gdpPct: 115 },
  { country: "Japan", flag: "🇯🇵", assets: 3.4, type: "Public DB", gdpPct: 72 },
  { country: "Australia", flag: "🇦🇺", assets: 3.5, type: "DC (Super)", gdpPct: 180 },
  { country: "Canada", flag: "🇨🇦", assets: 2.8, type: "Mixed DB/DC", gdpPct: 136 },
  { country: "Netherlands", flag: "🇳🇱", assets: 2.2, type: "Collective DC", gdpPct: 220 },
  { country: "Denmark", flag: "🇩🇰", assets: 0.9, type: "ATP + DC", gdpPct: 226 },
  { country: "Norway", flag: "🇳🇴", assets: 1.8, type: "GPFG sovereign", gdpPct: 276 },
];

const DB_DECLINE_DATA: DBDeclinePoint[] = [
  { year: 1983, dbPct: 62, dcPct: 12 },
  { year: 1988, dbPct: 56, dcPct: 22 },
  { year: 1993, dbPct: 48, dcPct: 35 },
  { year: 1998, dbPct: 40, dcPct: 45 },
  { year: 2003, dbPct: 33, dcPct: 52 },
  { year: 2008, dbPct: 25, dcPct: 58 },
  { year: 2013, dbPct: 20, dcPct: 62 },
  { year: 2018, dbPct: 17, dcPct: 64 },
  { year: 2023, dbPct: 15, dcPct: 65 },
];

const CLIFF_VESTING: VestingSchedule = {
  type: "cliff",
  years: [1, 2, 3, 4, 5],
  vestedPct: [0, 0, 0, 0, 100],
};

const GRADED_VESTING: VestingSchedule = {
  type: "graded",
  years: [1, 2, 3, 4, 5, 6],
  vestedPct: [0, 20, 40, 60, 80, 100],
};

const FUNDED_STATUS_SCENARIOS: FundedStatusScenario[] = [
  {
    label: "Optimistic",
    discountRate: 7.0,
    pbo: 4200,
    assets: 4620,
    fundedStatus: 110,
    color: "#34d399",
  },
  {
    label: "Base Case",
    discountRate: 5.5,
    pbo: 5000,
    assets: 4620,
    fundedStatus: 92.4,
    color: "#60a5fa",
  },
  {
    label: "Stress",
    discountRate: 3.5,
    pbo: 6200,
    assets: 3900,
    fundedStatus: 62.9,
    color: "#f87171",
  },
];

const ACTUARIAL_ASSUMPTIONS: ActuarialAssumption[] = [
  {
    name: "Discount Rate",
    currentValue: "5.25%",
    range: "3.0% – 7.5%",
    impact: "1% decrease → ~15% liability increase",
    sensitivity: "High",
  },
  {
    name: "Expected Return on Assets",
    currentValue: "7.0%",
    range: "6.0% – 8.5%",
    impact: "Affects required contribution level",
    sensitivity: "Medium",
  },
  {
    name: "Salary Growth Rate",
    currentValue: "3.5%",
    range: "2.0% – 5.0%",
    impact: "1% increase → ~8% liability increase (final-pay plans)",
    sensitivity: "Medium",
  },
  {
    name: "Inflation",
    currentValue: "2.5%",
    range: "1.5% – 4.0%",
    impact: "Affects COLAs and real benefit values",
    sensitivity: "Medium",
  },
  {
    name: "Mortality Improvement",
    currentValue: "MP-2021 Scale",
    range: "Static to MP-2021",
    impact: "10yr underestimation → ~20% liability increase",
    sensitivity: "Very High",
  },
  {
    name: "Turnover Rate",
    currentValue: "8.0%",
    range: "5% – 15%",
    impact: "Higher turnover reduces projected benefit payments",
    sensitivity: "Low",
  },
];

const MORTALITY_TABLES: MortalityTableEntry[] = [
  {
    table: "RP-2000",
    year: 2000,
    lifeExpectancy65M: 18.5,
    lifeExpectancy65F: 21.2,
    description: "Standard table for private pensions through 2010s",
  },
  {
    table: "RP-2014",
    year: 2014,
    lifeExpectancy65M: 20.1,
    lifeExpectancy65F: 22.4,
    description: "Updated with improved longevity data",
  },
  {
    table: "MP-2021",
    year: 2021,
    lifeExpectancy65M: 21.5,
    lifeExpectancy65F: 23.8,
    description: "Current SOA standard with improvement scales",
  },
  {
    table: "MP-2021 + Projection",
    year: 2031,
    lifeExpectancy65M: 23.0,
    lifeExpectancy65F: 25.5,
    description: "Projected 10yr forward — significant longevity risk",
  },
];

const PENSION_ASSET_ALLOCATION: AssetAllocation[] = [
  { label: "Public Equities", pct: 45, color: "#60a5fa", description: "Global stocks; growth engine" },
  { label: "Fixed Income", pct: 30, color: "#34d399", description: "Bonds; liability matching core" },
  { label: "Alternatives", pct: 15, color: "#a78bfa", description: "PE, infra, hedge funds, real assets" },
  { label: "Cash & Other", pct: 10, color: "#94a3b8", description: "Liquidity buffer and overlays" },
];

const ALTERNATIVES_GROWTH: AlternativesGrowth[] = [
  { year: 1990, pct: 5 },
  { year: 1995, pct: 7 },
  { year: 2000, pct: 10 },
  { year: 2005, pct: 14 },
  { year: 2010, pct: 20 },
  { year: 2015, pct: 24 },
  { year: 2020, pct: 27 },
  { year: 2024, pct: 30 },
];

// ── Helper ─────────────────────────────────────────────────────────────────────

function shimBars(count: number): number[] {
  return Array.from({ length: count }, () => rand());
}
void shimBars; // suppress unused warning

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 rounded-lg bg-muted text-primary">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function InfoBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border`}>
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className={`text-xs font-semibold ${color}`}>{value}</span>
    </div>
  );
}

// ── Tab 1: DB vs DC Plans ──────────────────────────────────────────────────────

function DBvsDCTab() {
  const [showPublic, setShowPublic] = useState(false);

  // DB decline SVG chart
  const chartW = 520;
  const chartH = 200;
  const padL = 48;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const years = DB_DECLINE_DATA.map((d) => d.year);
  const minYear = years[0];
  const maxYear = years[years.length - 1];

  const xScale = (year: number) => padL + ((year - minYear) / (maxYear - minYear)) * innerW;
  const yScale = (pct: number) => padT + innerH - (pct / 100) * innerH;

  const dbPath = DB_DECLINE_DATA.map((d, i) =>
    `${i === 0 ? "M" : "L"}${xScale(d.year)},${yScale(d.dbPct)}`
  ).join(" ");

  const dcPath = DB_DECLINE_DATA.map((d, i) =>
    `${i === 0 ? "M" : "L"}${xScale(d.year)},${yScale(d.dcPct)}`
  ).join(" ");

  // Global pension bar chart
  const maxAssets = Math.max(...GLOBAL_PENSION_SYSTEMS.map((s) => s.assets));

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-muted/60 border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Global Pension Assets</p>
            <p className="text-2xl font-bold text-primary">$56T</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total AUM worldwide</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/60 border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">US DB Coverage</p>
            <p className="text-2xl font-bold text-amber-400">15%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Private workers (2023)</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/60 border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">US DC Coverage</p>
            <p className="text-2xl font-bold text-emerald-400">65%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Private workers (2023)</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/60 border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">PBGC Max Benefit</p>
            <p className="text-2xl font-bold text-primary">$7,131</p>
            <p className="text-xs text-muted-foreground mt-0.5">Per month (2025)</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Matrix */}
      <Card className="bg-muted/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            DB vs DC Plan Comparison (10 Dimensions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium w-32">Dimension</th>
                  <th className="text-left py-2 pr-4 text-emerald-400 font-medium">Defined Benefit (DB)</th>
                  <th className="text-left py-2 text-primary font-medium">Defined Contribution (DC)</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_COMPARISONS.map((row, i) => (
                  <tr key={row.dimension} className={i % 2 === 0 ? "bg-card/30" : ""}>
                    <td className="py-2.5 pr-4 font-medium text-muted-foreground">{row.dimension}</td>
                    <td className={`py-2.5 pr-4 ${row.dbColor}`}>{row.db}</td>
                    <td className={`py-2.5 ${row.dcColor}`}>{row.dc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DB Decline Chart */}
      <Card className="bg-muted/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            The Great DB Decline: 1983 → 2023
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-0.5 bg-amber-400"></div>
              <span className="text-muted-foreground">DB Plans</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-0.5 bg-primary"></div>
              <span className="text-muted-foreground">DC Plans</span>
            </div>
          </div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((pct) => (
              <g key={pct}>
                <line
                  x1={padL} y1={yScale(pct)}
                  x2={padL + innerW} y2={yScale(pct)}
                  stroke="#334155" strokeWidth="1" strokeDasharray="4,4"
                />
                <text x={padL - 6} y={yScale(pct) + 4} textAnchor="end" fill="#94a3b8" fontSize="10">
                  {pct}%
                </text>
              </g>
            ))}
            {/* X-axis labels */}
            {DB_DECLINE_DATA.map((d) => (
              <text key={d.year} x={xScale(d.year)} y={chartH - 8} textAnchor="middle" fill="#94a3b8" fontSize="10">
                {d.year}
              </text>
            ))}
            {/* Area fills */}
            <path
              d={`${dbPath} L${xScale(maxYear)},${padT + innerH} L${xScale(minYear)},${padT + innerH} Z`}
              fill="#f59e0b" fillOpacity="0.12"
            />
            <path
              d={`${dcPath} L${xScale(maxYear)},${padT + innerH} L${xScale(minYear)},${padT + innerH} Z`}
              fill="#3b82f6" fillOpacity="0.12"
            />
            {/* Lines */}
            <path d={dbPath} stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={dcPath} stroke="#60a5fa" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Data points */}
            {DB_DECLINE_DATA.map((d) => (
              <g key={d.year}>
                <circle cx={xScale(d.year)} cy={yScale(d.dbPct)} r="3" fill="#f59e0b" />
                <circle cx={xScale(d.year)} cy={yScale(d.dcPct)} r="3" fill="#60a5fa" />
              </g>
            ))}
          </svg>
          <p className="text-xs text-muted-foreground mt-2">
            % of US private sector workers with each plan type. Source: BLS / DOL Form 5500 data.
          </p>
        </CardContent>
      </Card>

      {/* Global Pension Assets */}
      <Card className="bg-muted/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Global Pension System Assets ($56T Total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {GLOBAL_PENSION_SYSTEMS.map((sys) => (
              <div key={sys.country} className="flex items-center gap-3">
                <span className="text-lg w-8">{sys.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">{sys.country}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{sys.type}</span>
                      <span className="text-xs text-muted-foreground">{sys.gdpPct}% GDP</span>
                      <span className="text-sm font-semibold text-primary">${sys.assets}T</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(sys.assets / maxAssets) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hybrid Plans + Vesting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-muted/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Hybrid Plan Designs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-card/60 border border-border">
              <p className="text-sm font-semibold text-primary mb-1">Cash Balance Plan</p>
              <p className="text-xs text-muted-foreground">
                Hybrid DB: employer credits hypothetical account with pay credits (5–8% salary) + interest credits (tied to Treasury rates).
                Employee bears no investment risk; benefit is portable as a lump sum.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-card/60 border border-border">
              <p className="text-sm font-semibold text-primary mb-1">Career Average Plan</p>
              <p className="text-xs text-muted-foreground">
                DB variant: benefit = X% × each year&apos;s actual salary × years of service.
                Lower liability risk for sponsor vs final-pay plans. Common in public sector.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-card/60 border border-border">
              <p className="text-sm font-semibold text-emerald-400 mb-1">Pension Equity Plan</p>
              <p className="text-xs text-muted-foreground">
                Credits % of final salary for each year worked, expressed as a lump sum.
                Bridges DB security with DC portability — growing in preference among mid-career workers.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Vesting Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Cliff vesting */}
              <div>
                <p className="text-xs font-semibold text-amber-400 mb-2">Cliff Vesting (5-Year)</p>
                <div className="flex gap-1.5">
                  {CLIFF_VESTING.years.map((yr, i) => (
                    <div key={yr} className="flex-1 text-center">
                      <div
                        className={`h-10 rounded flex items-center justify-center text-xs font-bold ${
                          CLIFF_VESTING.vestedPct[i] === 100
                            ? "bg-emerald-500/80 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {CLIFF_VESTING.vestedPct[i]}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Yr {yr}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Graded vesting */}
              <div>
                <p className="text-xs font-semibold text-primary mb-2">Graded Vesting (6-Year)</p>
                <div className="flex gap-1">
                  {GRADED_VESTING.years.map((yr, i) => (
                    <div key={yr} className="flex-1 text-center">
                      <div className="h-10 flex flex-col justify-end">
                        <div
                          className="rounded-t bg-primary/70 flex items-end justify-center"
                          style={{ height: `${Math.max(GRADED_VESTING.vestedPct[i], 8)}%` }}
                        >
                          <span className="text-xs font-bold text-white pb-1">
                            {GRADED_VESTING.vestedPct[i]}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Yr {yr}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                ERISA requires full vesting by year 3 (cliff) or 20%–100% over years 2–6 (graded).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Public vs Private + Frozen Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-muted/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Public vs Private Pension
            </CardTitle>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => setShowPublic(!showPublic)}
              className="text-xs text-primary underline mb-3 block"
            >
              {showPublic ? "Showing: Public Sector" : "Showing: Private Sector"} (click to toggle)
            </button>
            {showPublic ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-card/50">
                  <span className="text-muted-foreground">CalPERS (CA)</span>
                  <span className="text-primary font-semibold">$500B AUM</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-card/50">
                  <span className="text-muted-foreground">NY State Teachers</span>
                  <span className="text-primary font-semibold">$135B AUM</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-card/50">
                  <span className="text-muted-foreground">Typical benefit formula</span>
                  <span className="text-emerald-400">2% × salary × years</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-card/50">
                  <span className="text-muted-foreground">PBGC coverage</span>
                  <span className="text-red-400">None — state guaranteed</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-card/50">
                  <span className="text-muted-foreground">Funding ratio avg (US)</span>
                  <span className="text-amber-400">~72% (2023)</span>
                </div>
                <div className="p-2 rounded bg-amber-900/20 border border-amber-800/40 mt-2">
                  <p className="text-amber-400">
                    Public pensions face $1.4T aggregate unfunded liability in the US, with Illinois and New Jersey the most underfunded.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-card/50">
                  <span className="text-muted-foreground">Boeing Pension</span>
                  <span className="text-primary font-semibold">~$68B AUM</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-card/50">
                  <span className="text-muted-foreground">AT&T Pension</span>
                  <span className="text-primary font-semibold">~$55B AUM</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-card/50">
                  <span className="text-muted-foreground">PBGC coverage</span>
                  <span className="text-emerald-400">Yes — up to $7,131/mo</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-card/50">
                  <span className="text-muted-foreground">ERISA minimum funding</span>
                  <span className="text-amber-400">PPA 2006 rules</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-card/50">
                  <span className="text-muted-foreground">Trend</span>
                  <span className="text-red-400">Most frozen or closed</span>
                </div>
                <div className="p-2 rounded bg-card/60 border border-border mt-2">
                  <p className="text-muted-foreground">
                    <span className="text-amber-400 font-semibold">Frozen plan</span>: new benefit accruals cease; existing benefits preserved.
                    <span className="text-red-400 font-semibold ml-2">Terminated plan</span>: plan wound up; assets distributed or PBGC takes over.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              ERISA Protections & DC Growth Drivers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-primary mb-2">ERISA Key Protections</p>
              <div className="space-y-1.5">
                {[
                  "Fiduciary duty — plan managers must act in participants' best interest",
                  "Minimum vesting standards (cliff / graded schedules)",
                  "Funding requirements for DB plans (PPA 2006 minimum)",
                  "PBGC insurance for single/multi-employer DB plans",
                  "Plan document and SPD disclosure requirements",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-400 mb-2">DC Growth Drivers</p>
              <div className="space-y-1.5">
                {[
                  "Revenue Act 1978 — created 401(k) provisions",
                  "Shift of investment risk away from employers",
                  "Auto-enrollment & auto-escalation (PPA 2006)",
                  "Greater workforce mobility — DC follows the employee",
                  "Employer cost predictability vs volatile DB contributions",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 2: Liability-Driven Investing ──────────────────────────────────────────

function LDITab() {
  // Funded status SVG
  const gaugeW = 320;
  const gaugeH = 160;

  // Duration gap visualization
  const ldiSpectrum = [
    { label: "Return-Seeking", pct: 70, color: "#3b82f6", desc: "Equities, HY, PE" },
    { label: "Hedging Portfolio", pct: 30, color: "#34d399", desc: "Long-duration bonds, swaps" },
  ];

  const ldiStages = [
    { label: "Traditional", rs: 70, hedge: 30, funded: 75 },
    { label: "Partial LDI", rs: 50, hedge: 50, funded: 85 },
    { label: "Advanced LDI", rs: 30, hedge: 70, funded: 95 },
    { label: "Full LDI", rs: 5, hedge: 95, funded: 105 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Liability Duration", value: "15 yrs", sub: "Typical DB", color: "text-red-400" },
          { label: "Asset Duration", value: "5 yrs", sub: "Traditional mix", color: "text-amber-400" },
          { label: "Duration Gap", value: "10 yrs", sub: "Interest rate risk", color: "text-orange-400" },
          { label: "PBGC Variable Rate", value: "$52/$1K", sub: "Per $1K underfunded", color: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="bg-muted/60 border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pension Liability Valuation */}
      <Card className="bg-muted/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Pension Liability Valuation — Funded Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                <span className="text-foreground font-semibold">PBO (Projected Benefit Obligation)</span> = Present value of all future pension benefits earned to date,
                discounting by the yield on high-quality corporate bonds (AA-rated, per ASC 715 / IAS 19).
              </p>
              <div className="p-3 rounded-lg bg-card/60 border border-border mb-3">
                <p className="text-xs text-center font-mono text-primary">
                  Funded Status = Plan Assets ÷ PBO × 100%
                </p>
              </div>
              <div className="space-y-2">
                {FUNDED_STATUS_SCENARIOS.map((sc) => (
                  <div key={sc.label} className="flex items-center gap-3 p-2 rounded bg-card/50">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: sc.color }}></div>
                    <span className="text-xs text-muted-foreground w-20">{sc.label}</span>
                    <span className="text-xs text-muted-foreground">DR: {sc.discountRate}%</span>
                    <span className="text-xs text-muted-foreground">PBO: ${sc.pbo}B</span>
                    <span className="text-xs font-semibold ml-auto" style={{ color: sc.color }}>
                      {sc.fundedStatus.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Actuarial sensitivity: a 1% decrease in the discount rate increases PBO by approximately 15%.
              </p>
            </div>
            {/* Funded Status Gauge SVG */}
            <div className="flex flex-col items-center">
              <svg viewBox={`0 0 ${gaugeW} ${gaugeH}`} className="w-full max-w-xs">
                {/* Background arc */}
                <path
                  d="M 30 130 A 130 130 0 0 1 290 130"
                  stroke="#334155" strokeWidth="18" fill="none" strokeLinecap="round"
                />
                {/* Red zone 0-80 */}
                <path
                  d="M 30 130 A 130 130 0 0 1 108 40"
                  stroke="#ef4444" strokeWidth="18" fill="none" strokeLinecap="round"
                />
                {/* Amber zone 80-100 */}
                <path
                  d="M 108 40 A 130 130 0 0 1 213 40"
                  stroke="#f59e0b" strokeWidth="18" fill="none" strokeLinecap="round"
                />
                {/* Green zone 100+ */}
                <path
                  d="M 213 40 A 130 130 0 0 1 290 130"
                  stroke="#34d399" strokeWidth="18" fill="none" strokeLinecap="round"
                />
                {/* Needle for base case 92.4% */}
                <line
                  x1="160" y1="130"
                  x2={160 + 100 * Math.cos(Math.PI - (92.4 / 120) * Math.PI)}
                  y2={130 - 100 * Math.sin((92.4 / 120) * Math.PI)}
                  stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"
                />
                <circle cx="160" cy="130" r="8" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
                {/* Labels */}
                <text x="25" y="148" fill="#ef4444" fontSize="11" fontWeight="600">0%</text>
                <text x="100" y="25" fill="#f59e0b" fontSize="11" fontWeight="600">80%</text>
                <text x="200" y="25" fill="#34d399" fontSize="11" fontWeight="600">100%</text>
                <text x="275" y="148" fill="#34d399" fontSize="11" fontWeight="600">120%</text>
                <text x="160" y="108" textAnchor="middle" fill="#60a5fa" fontSize="15" fontWeight="700">92.4%</text>
                <text x="160" y="122" textAnchor="middle" fill="#94a3b8" fontSize="10">Base Case</text>
              </svg>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Funded status gauge — below 80% triggers PBGC variable premium
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LDI Spectrum */}
      <Card className="bg-muted/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            LDI Implementation Spectrum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-4">
                LDI shifts assets from return-seeking (equities, growth) toward liability-hedging (long-duration bonds, interest rate swaps)
                as funded status improves.
              </p>
              <div className="space-y-3">
                {ldiStages.map((stage) => (
                  <div key={stage.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">{stage.label}</span>
                      <span className="text-muted-foreground">Funded: {stage.funded}%</span>
                    </div>
                    <div className="flex rounded overflow-hidden h-5">
                      <div
                        className="bg-primary flex items-center justify-center text-xs text-white font-bold"
                        style={{ width: `${stage.rs}%` }}
                      >
                        {stage.rs > 15 ? `${stage.rs}%` : ""}
                      </div>
                      <div
                        className="bg-emerald-500 flex items-center justify-center text-xs text-white font-bold"
                        style={{ width: `${stage.hedge}%` }}
                      >
                        {stage.hedge > 15 ? `${stage.hedge}%` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary"></div><span className="text-muted-foreground">Return-Seeking</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500"></div><span className="text-muted-foreground">Liability Hedge</span></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-card/60 border border-border">
                <p className="text-xs font-semibold text-primary mb-1">Interest Rate Swap Overlay</p>
                <p className="text-xs text-muted-foreground">
                  Plan sells floating, receives fixed on a notional equal to liability duration. A $1B pension with 15yr liability duration
                  may overlay $500M notional swaps, extending effective duration to 10yr without selling equities.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-card/60 border border-amber-800/40">
                <p className="text-xs font-semibold text-amber-400 mb-1">UK LDI Crisis — Sept 2022</p>
                <p className="text-xs text-muted-foreground">
                  UK gilt yields spiked 150bps in days after the mini-budget. Leveraged LDI funds (common in UK) faced massive margin calls
                  on gilt repos. Bank of England intervened with £65B emergency gilt purchase. Lesson: LDI leverage amplifies tail risk.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-card/60 border border-border">
                <p className="text-xs font-semibold text-emerald-400 mb-1">Contributions vs Returns</p>
                <p className="text-xs text-muted-foreground">
                  Mature funded plans: 60–70% of total fund value comes from investment returns over time.
                  Contributions matter most in early accumulation; market returns dominate long-run outcomes.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-card/60 border border-border">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-primary">PBGC Variable Premium</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  $52 per $1,000 of unfunded vested benefits. A plan with $500M unfunded VB pays $26M/year in variable premium
                  on top of the flat $92/participant rate — a powerful incentive to improve funded status.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duration Gap visual */}
      <Card className="bg-muted/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" />
            Duration Gap: The Core LDI Problem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1">
              <svg viewBox="0 0 400 100" className="w-full h-auto">
                {/* Liabilities bar */}
                <rect x="10" y="10" width="375" height="32" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                <rect x="10" y="10" width={375 * (15 / 20)} height="32" rx="4" fill="#ef4444" fillOpacity="0.7" />
                <text x="20" y="30" fill="#fca5a5" fontSize="11" fontWeight="600">Liabilities — Duration: 15 yrs</text>
                <text x="295" y="30" fill="#94a3b8" fontSize="10">PBO $5.0B</text>
                {/* Assets bar */}
                <rect x="10" y="56" width="375" height="32" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                <rect x="10" y="56" width={375 * (5 / 20)} height="32" rx="4" fill="#3b82f6" fillOpacity="0.7" />
                <text x="20" y="76" fill="#93c5fd" fontSize="11" fontWeight="600">Assets — Duration: 5 yrs</text>
                <text x="295" y="76" fill="#94a3b8" fontSize="10">AUM $4.6B</text>
                {/* Gap brace */}
                <line x1={10 + 375 * (5 / 20)} y1="44" x2={10 + 375 * (15 / 20)} y2="44" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
                <text x={(10 + 375 * (5 / 20) + 10 + 375 * (15 / 20)) / 2} y="52" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="600">10yr GAP</text>
              </svg>
            </div>
            <div className="flex-1 space-y-2 text-xs">
              <p className="text-muted-foreground">
                When interest rates <span className="text-red-400 font-semibold">fall by 1%</span>, liabilities increase ~15% ($750M on $5B PBO)
                while a 5yr-duration asset portfolio increases only ~5% ($230M on $4.6B). Net funded status deteriorates by ~$520M.
              </p>
              <p className="text-muted-foreground">
                LDI goal: <span className="text-emerald-400 font-semibold">match asset duration to liability duration</span> so that interest rate movements affect both sides equally — eliminating surplus volatility.
              </p>
              <div className="flex gap-2 flex-wrap mt-2">
                {ldiSpectrum.map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 px-2 py-1 rounded bg-card/60 border border-border">
                    <div className="w-2 h-2 rounded-full" style={{ background: l.color }}></div>
                    <span style={{ color: l.color }} className="font-semibold">{l.pct}%</span>
                    <span className="text-muted-foreground">{l.label}</span>
                    <span className="text-muted-foreground">({l.desc})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: Actuarial Assumptions ───────────────────────────────────────────────

function ActuarialTab() {
  const [selectedAssumption, setSelectedAssumption] = useState<string | null>(null);

  // Scenario analysis SVG
  const scenW = 480;
  const scenH = 180;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const innerW2 = scenW - padL - padR;
  const innerH2 = scenH - padT - padB;

  // Funded status over 10 years for 3 scenarios
  interface ScenarioLine {
    label: string;
    color: string;
    values: number[];
  }

  const scenarios: ScenarioLine[] = [
    {
      label: "Optimistic",
      color: "#34d399",
      values: [92, 95, 99, 103, 107, 112, 116, 120, 124, 128],
    },
    {
      label: "Base Case",
      color: "#60a5fa",
      values: [92, 93, 94, 95, 96, 97, 97, 98, 99, 100],
    },
    {
      label: "Stress",
      color: "#f87171",
      values: [92, 88, 82, 75, 70, 66, 63, 60, 58, 55],
    },
  ];

  const minVal = 40;
  const maxVal = 140;
  const xScen = (i: number) => padL + (i / 9) * innerW2;
  const yScen = (v: number) => padT + innerH2 - ((v - minVal) / (maxVal - minVal)) * innerH2;

  return (
    <div className="space-y-6">
      {/* Mortality Tables */}
      <Card className="bg-muted/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Mortality Table Evolution — Longevity Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Table</th>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Year</th>
                  <th className="text-left py-2 pr-4 text-primary font-medium">Life Exp. Male (65)</th>
                  <th className="text-left py-2 pr-4 text-pink-400 font-medium">Life Exp. Female (65)</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {MORTALITY_TABLES.map((row, i) => (
                  <tr key={row.table} className={i % 2 === 0 ? "bg-card/30" : ""}>
                    <td className="py-2 pr-4 font-semibold text-foreground">{row.table}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{row.year}</td>
                    <td className="py-2 pr-4 text-primary font-semibold">{row.lifeExpectancy65M} yrs</td>
                    <td className="py-2 pr-4 text-pink-400 font-semibold">{row.lifeExpectancy65F} yrs</td>
                    <td className="py-2 text-xs text-muted-foreground">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800/40">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                <span className="font-semibold">Longevity Risk:</span> Every 10-year underestimation of life expectancy increases pension liability by approximately 20%.
                The Society of Actuaries (SOA) updates improvement scales annually; UK plans use CMI projections.
                Longevity swaps and buy-ins are growing tools for hedging this risk.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assumptions Sensitivity Table */}
      <Card className="bg-muted/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" />
            Actuarial Assumptions Sensitivity (click to expand)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ACTUARIAL_ASSUMPTIONS.map((assumption) => (
              <div key={assumption.name}>
                <button
                  onClick={() => setSelectedAssumption(selectedAssumption === assumption.name ? null : assumption.name)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-card/60 border border-border hover:border-primary/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      assumption.sensitivity === "Very High" ? "bg-red-900/60 text-red-400" :
                      assumption.sensitivity === "High" ? "bg-amber-900/60 text-amber-400" :
                      assumption.sensitivity === "Medium" ? "bg-muted text-primary" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {assumption.sensitivity}
                    </div>
                    <span className="text-sm text-foreground font-medium">{assumption.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary">{assumption.currentValue}</span>
                    <span className="text-xs text-muted-foreground">{assumption.range}</span>
                  </div>
                </button>
                {selectedAssumption === assumption.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-3 p-3 rounded-b-lg bg-card/80 border-x border-b border-border"
                  >
                    <p className="text-xs text-muted-foreground">{assumption.impact}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset Smoothing + Actuarial Gains/Losses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-muted/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Asset Smoothing Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded bg-card/60 border border-border">
              <p className="font-semibold text-primary mb-1">5-Year Average Value</p>
              <p className="text-muted-foreground">
                Actuarial asset value = average of market values over last 5 years.
                Dampens volatility in contribution requirements — market crashes spread over 5yr. Risk: slow to reflect recovery.
              </p>
            </div>
            <div className="p-3 rounded bg-card/60 border border-border">
              <p className="font-semibold text-primary mb-1">Market Value of Assets (MVA)</p>
              <p className="text-muted-foreground">
                IRS requires MVA for at-risk plans under PPA 2006. Creates volatile contribution requirements
                but most transparent. GAAP accounting (ASC 715) requires MVA for balance sheet funded status.
              </p>
            </div>
            <div className="p-3 rounded bg-card/60 border border-border">
              <p className="font-semibold text-emerald-400 mb-1">Actuarial Gains/Losses</p>
              <p className="text-muted-foreground">
                Differences between actual vs assumed experience (returns, mortality, salaries) become actuarial
                gains/losses. Under ASC 715: recognized in OCI immediately, then amortized via corridor method
                (10% of greater of PBO or plan assets) over avg remaining service period.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Funding Strategy: Min vs Target
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="space-y-2">
              {[
                {
                  label: "Minimum Required Contribution",
                  desc: "ERISA/PPA floor. Below 80% funded → benefit restrictions. Below 60% → benefit freeze.",
                  color: "text-red-400",
                  bgColor: "bg-red-900/20 border-red-800/40",
                },
                {
                  label: "Target 100% Funded",
                  desc: "Typical sponsor target. Eliminates PBGC variable premium. Provides benefit security.",
                  color: "text-primary",
                  bgColor: "bg-muted/40 border-border",
                },
                {
                  label: "Funded 110%+ (Overfunded)",
                  desc: "ERISA prohibits contributions that push plans above 150%. Overfunding trapped; can only be used for benefits. Excise tax on reversions.",
                  color: "text-emerald-400",
                  bgColor: "bg-emerald-900/20 border-emerald-800/40",
                },
              ].map((item) => (
                <div key={item.label} className={`p-3 rounded border ${item.bgColor}`}>
                  <p className={`font-semibold ${item.color} mb-1`}>{item.label}</p>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Analysis SVG */}
      <Card className="bg-muted/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            10-Year Funded Status Scenario Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4 text-xs">
            {scenarios.map((sc) => (
              <div key={sc.label} className="flex items-center gap-1.5">
                <div className="w-8 h-0.5" style={{ background: sc.color }}></div>
                <span className="text-muted-foreground">{sc.label}</span>
              </div>
            ))}
          </div>
          <svg viewBox={`0 0 ${scenW} ${scenH}`} className="w-full h-auto">
            {/* Grid */}
            {[60, 80, 100, 120].map((v) => (
              <g key={v}>
                <line x1={padL} y1={yScen(v)} x2={padL + innerW2} y2={yScen(v)} stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                <text x={padL - 6} y={yScen(v) + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{v}%</text>
              </g>
            ))}
            {/* 100% threshold line */}
            <line x1={padL} y1={yScen(100)} x2={padL + innerW2} y2={yScen(100)} stroke="#34d399" strokeWidth="1.5" opacity="0.5" />
            <text x={padL + innerW2 + 4} y={yScen(100) + 4} fill="#34d399" fontSize="9">100%</text>
            {/* Year labels */}
            {[0, 2, 4, 6, 8, 9].map((i) => (
              <text key={i} x={xScen(i)} y={scenH - 8} textAnchor="middle" fill="#94a3b8" fontSize="10">
                Y{i + 1}
              </text>
            ))}
            {/* Lines */}
            {scenarios.map((sc) => (
              <path
                key={sc.label}
                d={sc.values.map((v, i) => `${i === 0 ? "M" : "L"}${xScen(i)},${yScen(v)}`).join(" ")}
                stroke={sc.color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
              />
            ))}
            {/* End labels */}
            {scenarios.map((sc) => (
              <text key={sc.label} x={xScen(9) + 6} y={yScen(sc.values[9]) + 4} fill={sc.color} fontSize="10" fontWeight="600">
                {sc.values[9]}%
              </text>
            ))}
          </svg>
          <p className="text-xs text-muted-foreground mt-2">
            Stress scenario assumes 200bps rate decline (↑ PBO) + 25% equity drawdown over 3 years.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 4: Investment Strategy ─────────────────────────────────────────────────

function InvestmentStrategyTab() {
  // Pie chart for asset allocation
  const pieR = 75;
  const pieCX = 100;
  const pieCY = 100;

  function pieSlices(data: AssetAllocation[]) {
    let angle = -Math.PI / 2;
    return data.map((d) => {
      const startAngle = angle;
      const sweep = (d.pct / 100) * 2 * Math.PI;
      angle += sweep;
      const endAngle = angle;
      const x1 = pieCX + pieR * Math.cos(startAngle);
      const y1 = pieCY + pieR * Math.sin(startAngle);
      const x2 = pieCX + pieR * Math.cos(endAngle);
      const y2 = pieCY + pieR * Math.sin(endAngle);
      const largeArc = sweep > Math.PI ? 1 : 0;
      const midAngle = startAngle + sweep / 2;
      const lx = pieCX + (pieR + 18) * Math.cos(midAngle);
      const ly = pieCY + (pieR + 18) * Math.sin(midAngle);
      return { ...d, path: `M${pieCX},${pieCY} L${x1},${y1} A${pieR},${pieR} 0 ${largeArc} 1 ${x2},${y2} Z`, lx, ly, midAngle };
    });
  }

  const slices = useMemo(() => pieSlices(PENSION_ASSET_ALLOCATION), []);

  // Alternatives growth line
  const altW = 400;
  const altH = 140;
  const altPadL = 40;
  const altPadR = 20;
  const altPadT = 15;
  const altPadB = 35;
  const altIW = altW - altPadL - altPadR;
  const altIH = altH - altPadT - altPadB;

  const minAltYear = ALTERNATIVES_GROWTH[0].year;
  const maxAltYear = ALTERNATIVES_GROWTH[ALTERNATIVES_GROWTH.length - 1].year;
  const xAlt = (yr: number) => altPadL + ((yr - minAltYear) / (maxAltYear - minAltYear)) * altIW;
  const yAlt = (pct: number) => altPadT + altIH - (pct / 35) * altIH;
  const altPath = ALTERNATIVES_GROWTH.map((d, i) => `${i === 0 ? "M" : "L"}${xAlt(d.year)},${yAlt(d.pct)}`).join(" ");

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Typical Target Return", value: "7–8%", sub: "Historical (6–7% forward)", color: "text-emerald-400" },
          { label: "Alternatives Allocation", value: "30%", sub: "US pensions avg (2024)", color: "text-primary" },
          { label: "Norway GPFG AUM", value: "$1.8T", sub: "Largest pension fund", color: "text-primary" },
          { label: "Canadian Model Return", value: "+2%", sub: "Above benchmark (avg)", color: "text-amber-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-muted/60 border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Asset Allocation Pie + Alternatives Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-muted/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              Typical US Pension Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 200 200" className="w-40 h-40 flex-shrink-0">
                {slices.map((sl, i) => (
                  <path key={i} d={sl.path} fill={sl.color} stroke="#1e293b" strokeWidth="2" />
                ))}
                <circle cx={pieCX} cy={pieCY} r="35" fill="#1e293b" />
                <text x={pieCX} y={pieCY - 5} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Pension</text>
                <text x={pieCX} y={pieCY + 8} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Portfolio</text>
              </svg>
              <div className="flex-1 space-y-2">
                {PENSION_ASSET_ALLOCATION.map((seg) => (
                  <div key={seg.label} className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded-sm mt-0.5 flex-shrink-0" style={{ background: seg.color }}></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{seg.label}</span>
                        <span className="text-xs font-bold" style={{ color: seg.color }}>{seg.pct}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{seg.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Alternatives Growth in Pensions 1990–2024
            </CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox={`0 0 ${altW} ${altH}`} className="w-full h-auto">
              {[5, 10, 20, 30].map((v) => (
                <g key={v}>
                  <line x1={altPadL} y1={yAlt(v)} x2={altPadL + altIW} y2={yAlt(v)} stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                  <text x={altPadL - 4} y={yAlt(v) + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{v}%</text>
                </g>
              ))}
              {ALTERNATIVES_GROWTH.filter((_, i) => i % 2 === 0).map((d) => (
                <text key={d.year} x={xAlt(d.year)} y={altH - 6} textAnchor="middle" fill="#94a3b8" fontSize="10">{d.year}</text>
              ))}
              <path
                d={`${altPath} L${xAlt(maxAltYear)},${altPadT + altIH} L${xAlt(minAltYear)},${altPadT + altIH} Z`}
                fill="#a78bfa" fillOpacity="0.2"
              />
              <path d={altPath} stroke="#a78bfa" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {ALTERNATIVES_GROWTH.map((d) => (
                <circle key={d.year} cx={xAlt(d.year)} cy={yAlt(d.pct)} r="3" fill="#a78bfa" />
              ))}
            </svg>
            <p className="text-xs text-muted-foreground mt-2">
              Alternatives grew from ~5% (1990) to ~30% (2024) driven by PE, infra, real assets, and hedge funds.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Canadian Model + Norwegian GPFG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-muted/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              The Canadian Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="text-muted-foreground">
              Led by CPPIB, OTPP, and OMERS, the Canadian model is characterized by:
            </p>
            <div className="space-y-2">
              {[
                { label: "Direct Infrastructure", desc: "Airports, toll roads, ports — held without fund manager fees. CPPIB owns London Heathrow stake." },
                { label: "Direct Private Equity", desc: "In-house deal teams execute buyouts. Eliminates 2/20 fee drag; builds specialized expertise." },
                { label: "Internal Management", desc: "60–80% managed internally vs 10–20% for average US pension. Saves 50–100bps/year in fees." },
                { label: "Global Diversification", desc: "50–60% invested internationally vs US peers at 20–30%. Captures emerging market growth premium." },
                { label: "Long-Horizon Edge", desc: "Permanent capital allows illiquidity premium capture. No redemption pressure unlike PE funds." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded bg-card/50">
                  <CheckCircle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-amber-300 font-semibold">{item.label}: </span>
                    <span className="text-muted-foreground">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Norway GPFG: The Benchmark
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🇳🇴</span>
              <div>
                <p className="font-semibold text-foreground">Government Pension Fund Global</p>
                <p className="text-muted-foreground">$1.8T AUM — largest in the world</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { key: "Structure", val: "Oil fund, not a pension — no dedicated liabilities" },
                { key: "Allocation", val: "70% equities / 25% bonds / 5% real estate" },
                { key: "Governance", val: "Norges Bank Investment Management; high transparency" },
                { key: "Spending Rule", val: "Max 3% of fund per year into Norwegian budget" },
                { key: "Active Strategy", val: "~0.3% alpha target; 70% factor-based" },
                { key: "ESG Pioneer", val: "Exclusion list, engagement, sustainability reporting" },
                { key: "Benchmark", val: "70% FTSE All World + 30% Bloomberg AGG" },
              ].map((item) => (
                <div key={item.key} className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="text-muted-foreground font-semibold">{item.key}: </span>
                    <span className="text-muted-foreground">{item.val}</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Glide Path + ESG + Governance */}
      <Card className="bg-muted/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Glide Path De-Risking & Investment Governance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-primary mb-3">Liability-Matching Glide Path</p>
              <div className="space-y-2">
                {[
                  { funded: "< 80%", strategy: "Growth-oriented; 70% RS / 30% hedge", color: "text-red-400" },
                  { funded: "80–90%", strategy: "Balanced transition; 55% RS / 45% hedge", color: "text-amber-400" },
                  { funded: "90–100%", strategy: "De-risk; 35% RS / 65% hedge", color: "text-primary" },
                  { funded: "> 100%", strategy: "Full LDI; terminate or purchase annuity", color: "text-emerald-400" },
                ].map((row) => (
                  <div key={row.funded} className="p-2 rounded bg-card/60 border border-border">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-bold ${row.color}`}>{row.funded}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{row.strategy}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary mb-3">Risk Factor Approach</p>
              <div className="space-y-2 text-xs">
                {[
                  { factor: "Growth", exposures: "Equities, PE, HY credit, EM debt", alloc: "45%" },
                  { factor: "Defensive", exposures: "IG bonds, liability hedge, quality equities", alloc: "35%" },
                  { factor: "Real", exposures: "Infrastructure, real estate, TIPS, commodities", alloc: "15%" },
                  { factor: "Diversifying", exposures: "Hedge funds, risk parity, macro strategies", alloc: "5%" },
                ].map((row) => (
                  <div key={row.factor} className="flex items-start gap-2 p-2 rounded bg-card/60">
                    <Percent className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-primary font-semibold">{row.factor} ({row.alloc}): </span>
                      <span className="text-muted-foreground">{row.exposures}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-400 mb-3">ESG & Investment Committee</p>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-card/60 border border-border">
                  <p className="text-amber-300 font-semibold mb-1">ESG Evolution</p>
                  <p className="text-muted-foreground">
                    Pre-2020: ESG seen as constraint on returns (breach of fiduciary duty).
                    Post-2020: DOL clarified ESG factors can be considered if material to risk/return.
                    2023: DOL rule allows ESG integration.
                  </p>
                </div>
                <div className="p-2 rounded bg-card/60 border border-border">
                  <p className="text-primary font-semibold mb-1">Investment Committee</p>
                  <div className="space-y-1">
                    {[
                      "Sets IPS (Investment Policy Statement) and SAA",
                      "Reviews performance vs. benchmarks quarterly",
                      "Approves manager changes and new strategies",
                      "Fiduciary responsibility — ERISA prudent expert standard",
                      "Typically 5–9 members including independent trustees",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PensionFundsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-muted border border-border">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pension Fund Management</h1>
            <p className="text-muted-foreground text-sm mt-1">
              DB vs DC plans, liability-driven investing, actuarial assumptions, and institutional investment strategies
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <InfoBadge label="Global AUM" value="$56 Trillion" color="text-primary" />
              <InfoBadge label="US DB Coverage" value="15% workers" color="text-amber-400" />
              <InfoBadge label="Largest Fund" value="Norway GPFG $1.8T" color="text-emerald-400" />
              <InfoBadge label="Pension Crisis" value="$1.4T unfunded (US public)" color="text-red-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="dbvsdc">
        <TabsList className="grid grid-cols-4 w-full mb-6 bg-muted border border-border">
          <TabsTrigger value="dbvsdc" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary">
            <Users className="w-3.5 h-3.5" />
            DB vs DC Plans
          </TabsTrigger>
          <TabsTrigger value="ldi" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary">
            <Target className="w-3.5 h-3.5" />
            Liability-Driven
          </TabsTrigger>
          <TabsTrigger value="actuarial" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary">
            <Activity className="w-3.5 h-3.5" />
            Actuarial
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary">
            <BarChart3 className="w-3.5 h-3.5" />
            Investment Strategy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dbvsdc" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <DBvsDCTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="ldi" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <LDITab />
          </motion.div>
        </TabsContent>

        <TabsContent value="actuarial" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <ActuarialTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="strategy" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <InvestmentStrategyTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
