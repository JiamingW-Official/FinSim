"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Percent,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Building2,
  Activity,
  Shield,
  Layers,
  RefreshCw,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 795;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const RAND_POOL: number[] = [];
for (let i = 0; i < 400; i++) RAND_POOL.push(rand());
let ri = 0;
const r = () => RAND_POOL[ri++ % RAND_POOL.length];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lender {
  name: string;
  type: string;
  rate: string;
  warrantCoverage: string;
  loanSize: string;
  stage: string;
  status: string;
  statusColor: string;
  lossRate: string;
  irr: string;
}

interface RBFScenario {
  name: string;
  monthlyRevenue: number;
  growthRate: number;
  revenueShare: number;
  fundingAmount: number;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const KEY_METRICS = [
  {
    label: "Global Market Size",
    value: "$32B",
    sub: "Venture debt outstanding",
    highlight: "pos" as const,
    icon: DollarSign,
  },
  {
    label: "Avg Interest Rate",
    value: "11.5%",
    sub: "Prime + 5–8% spread",
    highlight: "neutral" as const,
    icon: Percent,
  },
  {
    label: "Warrant Coverage",
    value: "15–25%",
    sub: "% of loan as warrants",
    highlight: "neutral" as const,
    icon: BarChart3,
  },
  {
    label: "Loan-to-Last-Round",
    value: "25–35%",
    sub: "Typical sizing ratio",
    highlight: "neutral" as const,
    icon: TrendingUp,
  },
];

const LENDERS: Lender[] = [
  {
    name: "Silicon Valley Bank",
    type: "Bank",
    rate: "P + 3–5%",
    warrantCoverage: "10–15%",
    loanSize: "$2M–$50M",
    stage: "Series A–C",
    status: "Acquired by FDIC (2023)",
    statusColor: "text-rose-400",
    lossRate: "0.8%",
    irr: "12–14%",
  },
  {
    name: "Hercules Capital",
    type: "BDC",
    rate: "P + 6–8%",
    warrantCoverage: "15–20%",
    loanSize: "$5M–$100M",
    stage: "Series B–Growth",
    status: "Active (NYSE: HTGC)",
    statusColor: "text-emerald-400",
    lossRate: "1.2%",
    irr: "14–18%",
  },
  {
    name: "Western Technology Inv.",
    type: "VC Lender",
    rate: "P + 5–7%",
    warrantCoverage: "10–20%",
    loanSize: "$2M–$40M",
    stage: "Series A–C",
    status: "Active (Trinity Capital)",
    statusColor: "text-emerald-400",
    lossRate: "1.0%",
    irr: "13–16%",
  },
  {
    name: "Lighter Capital",
    type: "RBF Provider",
    rate: "N/A (RBF model)",
    warrantCoverage: "0%",
    loanSize: "$50K–$4M",
    stage: "Seed–Series A",
    status: "Active",
    statusColor: "text-emerald-400",
    lossRate: "2.5%",
    irr: "15–25%",
  },
];

const GROWTH_SCENARIOS: RBFScenario[] = [
  {
    name: "Low Growth",
    monthlyRevenue: 100000,
    growthRate: 0.03,
    revenueShare: 0.08,
    fundingAmount: 500000,
  },
  {
    name: "Moderate Growth",
    monthlyRevenue: 100000,
    growthRate: 0.07,
    revenueShare: 0.08,
    fundingAmount: 500000,
  },
  {
    name: "High Growth",
    monthlyRevenue: 100000,
    growthRate: 0.12,
    revenueShare: 0.08,
    fundingAmount: 500000,
  },
];

// Pre-compute RBF payback months & effective rate
function computeRBF(scenario: RBFScenario): {
  months: number;
  totalPaid: number;
  effectiveRate: number;
} {
  const cap = scenario.fundingAmount * 1.35; // 1.35x cap
  let totalPaid = 0;
  let rev = scenario.monthlyRevenue;
  let months = 0;
  while (totalPaid < cap && months < 120) {
    totalPaid += rev * scenario.revenueShare;
    if (totalPaid > cap) totalPaid = cap;
    rev *= 1 + scenario.growthRate;
    months++;
  }
  // Approximate annualized IRR using simple interest
  const effectiveRate = ((cap / scenario.fundingAmount - 1) / (months / 12)) * 100;
  return { months, totalPaid: cap, effectiveRate };
}

// ── Shared components ─────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral";
  icon?: React.ElementType;
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-card p-4">
      {Icon && (
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold tabular-nums", valClass)}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground/70">{sub}</p>}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {subtitle && (
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

function InfoBox({
  text,
  variant = "info",
}: {
  text: string;
  variant?: "info" | "warn" | "success";
}) {
  const styles = {
    info: "border-border bg-muted/10 text-primary",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    success: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
  };
  const IconComp =
    variant === "warn"
      ? AlertTriangle
      : variant === "success"
      ? CheckCircle
      : Info;
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border p-3 text-xs text-muted-foreground",
        styles[variant]
      )}
    >
      <IconComp className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

// ── SVG: Financing Waterfall ──────────────────────────────────────────────────

const WATERFALL_STAGES = [
  { label: "Seed", amount: 2, color: "#818cf8", y: 0 },
  { label: "Series A", amount: 12, color: "#60a5fa", y: 0 },
  { label: "Venture Debt A", amount: 4, color: "#34d399", y: 0 },
  { label: "Series B", amount: 30, color: "#60a5fa", y: 0 },
  { label: "Venture Debt B", amount: 10, color: "#34d399", y: 0 },
  { label: "Growth Equity", amount: 80, color: "#fb923c", y: 0 },
  { label: "IPO / Exit", amount: 250, color: "#fbbf24", y: 0 },
];

function FinancingWaterfallChart() {
  const W = 600;
  const H = 220;
  const PAD = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...WATERFALL_STAGES.map((d) => d.amount));
  const barW = innerW / WATERFALL_STAGES.length - 8;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full overflow-visible"
      aria-label="Financing waterfall"
    >
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Y gridlines */}
        {[0, 50, 100, 150, 200, 250].map((val) => {
          const y = innerH - (val / maxVal) * innerH;
          return (
            <g key={`grid-${val}`}>
              <line
                x1={0}
                x2={innerW}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
              <text
                x={-6}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill="rgba(255,255,255,0.35)"
              >
                ${val}M
              </text>
            </g>
          );
        })}
        {/* Bars */}
        {WATERFALL_STAGES.map((stage, i) => {
          const x = i * (barW + 8);
          const barH = (stage.amount / maxVal) * innerH;
          const y = innerH - barH;
          return (
            <g key={stage.label}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={3}
                fill={stage.color}
                fillOpacity={0.8}
              />
              <text
                x={x + barW / 2}
                y={innerH + 14}
                textAnchor="middle"
                fontSize={8}
                fill="rgba(255,255,255,0.6)"
              >
                {stage.label}
              </text>
              <text
                x={x + barW / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize={8}
                fill={stage.color}
                fontWeight={600}
              >
                ${stage.amount}M
              </text>
              {/* Connect arrows */}
              {i < WATERFALL_STAGES.length - 1 && (
                <line
                  x1={x + barW}
                  x2={x + barW + 8}
                  y1={innerH - (stage.amount / maxVal) * innerH / 2}
                  y2={
                    innerH -
                    (WATERFALL_STAGES[i + 1].amount / maxVal) * innerH / 2
                  }
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
              )}
            </g>
          );
        })}
        {/* X axis */}
        <line
          x1={0}
          x2={innerW}
          y1={innerH}
          y2={innerH}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />
      </g>
    </svg>
  );
}

// ── SVG: Dilution Comparison ──────────────────────────────────────────────────

const DILUTION_SCENARIOS = [
  {
    label: "Equity Round",
    color: "#f87171",
    dilution: 22,
    cost: "20–25% dilution",
  },
  {
    label: "Venture Debt",
    color: "#34d399",
    dilution: 3,
    cost: "~3% dilution (warrants)",
  },
  {
    label: "Revenue-Based Finance",
    color: "#60a5fa",
    dilution: 0,
    cost: "0% dilution, 35% cap",
  },
];

function DilutionComparisonChart() {
  const W = 500;
  const H = 180;
  const PAD = { top: 20, right: 140, bottom: 40, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxDil = 30;
  const barH = innerH / DILUTION_SCENARIOS.length - 10;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full overflow-visible"
      aria-label="Dilution comparison"
    >
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {[0, 5, 10, 15, 20, 25].map((val) => {
          const x = (val / maxDil) * innerW;
          return (
            <g key={`xg-${val}`}>
              <line
                x1={x}
                x2={x}
                y1={0}
                y2={innerH}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
              <text
                x={x}
                y={innerH + 14}
                textAnchor="middle"
                fontSize={9}
                fill="rgba(255,255,255,0.35)"
              >
                {val}%
              </text>
            </g>
          );
        })}
        {DILUTION_SCENARIOS.map((sc, i) => {
          const y = i * (barH + 10);
          const w = (sc.dilution / maxDil) * innerW;
          return (
            <g key={sc.label}>
              <rect
                x={0}
                y={y}
                width={w === 0 ? 4 : w}
                height={barH}
                rx={3}
                fill={sc.color}
                fillOpacity={0.75}
              />
              <text
                x={w + 8}
                y={y + barH / 2 + 4}
                fontSize={9}
                fill="rgba(255,255,255,0.5)"
              >
                {sc.cost}
              </text>
              <text
                x={-6}
                y={y + barH / 2 + 4}
                textAnchor="end"
                fontSize={9}
                fill={sc.color}
              >
                {sc.label}
              </text>
            </g>
          );
        })}
        <line
          x1={0}
          x2={innerW}
          y1={innerH}
          y2={innerH}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />
      </g>
    </svg>
  );
}

// ── SVG: Risk/Return Scatter ──────────────────────────────────────────────────

// Generate synthetic data points for lender risk/return
const SCATTER_POINTS = LENDERS.map((l, i) => {
  const lossRate = parseFloat(l.lossRate);
  const irrMid =
    (parseFloat(l.irr.split("–")[0]) + parseFloat(l.irr.split("–")[1])) / 2;
  return {
    name: l.name,
    x: lossRate + r() * 0.3,
    y: irrMid + r() * 2 - 1,
    color: ["#818cf8", "#34d399", "#60a5fa", "#fb923c"][i % 4],
  };
});

// Add warrant upside points
const WARRANT_POINTS = LENDERS.filter((l) => l.warrantCoverage !== "0%").map(
  (l, i) => ({
    name: `${l.name} (w/ warrants)`,
    x: parseFloat(l.lossRate) + r() * 0.2,
    y:
      (parseFloat(l.irr.split("–")[0]) +
        parseFloat(l.irr.split("–")[1])) /
        2 +
      5 +
      r() * 3,
    color: ["#fbbf24", "#a78bfa", "#34d399"][i % 3],
  })
);

function RiskReturnScatter() {
  const allPoints = [...SCATTER_POINTS, ...WARRANT_POINTS];
  const W = 500;
  const H = 240;
  const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xMax = 4;
  const yMax = 30;
  const xScale = (v: number) => (v / xMax) * innerW;
  const yScale = (v: number) => innerH - (v / yMax) * innerH;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full overflow-visible"
      aria-label="Risk return scatter"
    >
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Grid */}
        {[0, 1, 2, 3].map((v) => (
          <g key={`xgg-${v}`}>
            <line
              x1={xScale(v)}
              x2={xScale(v)}
              y1={0}
              y2={innerH}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={xScale(v)}
              y={innerH + 14}
              textAnchor="middle"
              fontSize={9}
              fill="rgba(255,255,255,0.35)"
            >
              {v}%
            </text>
          </g>
        ))}
        {[0, 10, 20, 30].map((v) => (
          <g key={`ygg-${v}`}>
            <line
              x1={0}
              x2={innerW}
              y1={yScale(v)}
              y2={yScale(v)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={-6}
              y={yScale(v) + 4}
              textAnchor="end"
              fontSize={9}
              fill="rgba(255,255,255,0.35)"
            >
              {v}%
            </text>
          </g>
        ))}
        {/* Axis labels */}
        <text
          x={innerW / 2}
          y={innerH + 28}
          textAnchor="middle"
          fontSize={10}
          fill="rgba(255,255,255,0.5)"
        >
          Loss Rate (%)
        </text>
        <text
          x={-innerH / 2}
          y={-36}
          textAnchor="middle"
          fontSize={10}
          fill="rgba(255,255,255,0.5)"
          transform="rotate(-90)"
        >
          IRR (%)
        </text>
        {/* Points */}
        {allPoints.map((pt, i) => (
          <g key={`pt-${i}`}>
            <circle
              cx={xScale(pt.x)}
              cy={yScale(pt.y)}
              r={7}
              fill={pt.color}
              fillOpacity={0.75}
            />
            <text
              x={xScale(pt.x) + 9}
              y={yScale(pt.y) + 4}
              fontSize={8}
              fill="rgba(255,255,255,0.55)"
            >
              {pt.name.split(" ")[0]}
              {pt.name.includes("warrants") ? " ★" : ""}
            </text>
          </g>
        ))}
        {/* Axes */}
        <line
          x1={0}
          x2={innerW}
          y1={innerH}
          y2={innerH}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />
        <line
          x1={0}
          x2={0}
          y1={0}
          y2={innerH}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />
      </g>
    </svg>
  );
}

// ── RBF Calculator ────────────────────────────────────────────────────────────

function RBFCalculator() {
  const [funding, setFunding] = useState(500000);
  const [monthlyRev, setMonthlyRev] = useState(100000);
  const [shareRate, setShareRate] = useState(8);

  const scenarios = useMemo(() => {
    return [3, 7, 12].map((growthPct) => {
      const cap = funding * 1.35;
      let totalPaid = 0;
      let rev = monthlyRev;
      let months = 0;
      while (totalPaid < cap && months < 120) {
        const payment = rev * (shareRate / 100);
        totalPaid += payment;
        if (totalPaid > cap) totalPaid = cap;
        rev *= 1 + growthPct / 100;
        months++;
      }
      const effectiveRate = ((cap / funding - 1) / (months / 12)) * 100;
      return {
        growthLabel: `${growthPct}% MoM Growth`,
        months,
        totalCost: cap,
        effectiveRate,
        color: growthPct === 3 ? "#f87171" : growthPct === 7 ? "#fbbf24" : "#34d399",
      };
    });
  }, [funding, monthlyRev, shareRate]);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="RBF Cost of Capital Calculator"
        subtitle="Revenue-Based Financing payback under different growth scenarios"
      />
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="mb-2 text-xs text-muted-foreground">Funding Amount</p>
          <input
            type="range"
            min={100000}
            max={2000000}
            step={50000}
            value={funding}
            onChange={(e) => setFunding(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <p className="mt-1 text-sm font-semibold text-foreground">
            ${(funding / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="mb-2 text-xs text-muted-foreground">
            Monthly Revenue (starting)
          </p>
          <input
            type="range"
            min={20000}
            max={500000}
            step={10000}
            value={monthlyRev}
            onChange={(e) => setMonthlyRev(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <p className="mt-1 text-sm font-medium text-foreground">
            ${(monthlyRev / 1000).toFixed(0)}K/mo
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="mb-2 text-xs text-muted-foreground">Revenue Share %</p>
          <input
            type="range"
            min={5}
            max={20}
            step={1}
            value={shareRate}
            onChange={(e) => setShareRate(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <p className="mt-1 text-sm font-medium text-foreground">
            {shareRate}% of monthly revenue
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {scenarios.map((sc) => (
          <div
            key={sc.growthLabel}
            className="rounded-md border border-border bg-card p-4"
          >
            <div
              className="mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-muted-foreground font-medium"
              style={{ background: sc.color + "22", color: sc.color }}
            >
              <Activity className="h-3 w-3" />
              {sc.growthLabel}
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-muted-foreground">Payback Period</span>
                <span className="font-medium text-foreground">
                  {sc.months} months
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-muted-foreground">Total Cost (1.35x)</span>
                <span className="font-medium text-foreground">
                  ${(sc.totalCost / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-muted-foreground">Effective IRR</span>
                <span className="font-medium" style={{ color: sc.color }}>
                  {sc.effectiveRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <InfoBox
        text="Revenue-Based Financing charges a fixed multiple (typically 1.2–1.5×) of the funded amount. Faster growth = faster payback = lower effective rate. Slower growth means you pay the same total but over more months, increasing the effective IRR."
        variant="info"
      />
    </div>
  );
}

// ── Tab: Venture Debt ─────────────────────────────────────────────────────────

const VD_TERMS = [
  {
    term: "Interest Rate",
    typical: "Prime + 5–8%",
    note: "Floating; higher than bank loans due to startup risk",
  },
  {
    term: "Term",
    typical: "24–48 months",
    note: "Interest-only period 6–12 months common",
  },
  {
    term: "Warrant Coverage",
    typical: "10–25% of loan",
    note: "Warrants at last-round valuation; main upside driver",
  },
  {
    term: "Loan-to-Last-Round",
    typical: "25–35%",
    note: "Typically sized off most recent equity raise",
  },
  {
    term: "Covenants",
    typical: "Minimum cash / burn",
    note: "Lighter than bank covenants; often no revenue test",
  },
  {
    term: "Collateral",
    typical: "IP + general assets",
    note: "Senior secured; IP lien standard in tech ventures",
  },
];

function VentureDebtTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-4">
          <SectionHeader
            title="How Venture Debt Works"
            subtitle="Non-dilutive capital structured alongside equity rounds"
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Venture debt is a loan provided to VC-backed startups, typically
            alongside or after an equity round. Unlike traditional bank loans,
            venture lenders accept higher risk in exchange for warrants —
            options to buy equity at the last round price. This creates an
            equity-like upside that compensates for the elevated default risk of
            early-stage borrowers.
          </p>
          <div className="space-y-2">
            {[
              "Extends runway without additional dilution",
              "Bridges to next equity milestone",
              "Often 25–35% of last equity round size",
              "Senior secured — first lien on assets & IP",
              "Requires existing VC backing as prerequisite",
            ].map((pt) => (
              <div key={pt} className="flex items-start gap-2 text-sm">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-muted-foreground">{pt}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader
            title="Startup Financing Waterfall"
            subtitle="Capital stack from seed to exit"
          />
          <FinancingWaterfallChart />
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-chart-3" />
              <span className="text-muted-foreground">Equity rounds</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-profit-light" />
              <span className="text-muted-foreground">Venture debt</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-warning-strong" />
              <span className="text-muted-foreground">Growth equity</span>
            </span>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader
          title="Standard Term Sheet Terms"
          subtitle="Typical venture debt structures"
        />
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Term
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Typical Range
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {VD_TERMS.map((row, i) => (
                <tr
                  key={row.term}
                  className={cn(
                    "border-b border-border last:border-0",
                    i % 2 === 0 ? "bg-card" : "bg-muted/20"
                  )}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.term}
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-400">
                    {row.typical}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InfoBox
        text="SVB's collapse in March 2023 removed the dominant venture debt provider ($40B+ in startup loans). Hercules Capital, Trinity Capital, and Western Technology Investment stepped in to fill the gap, often at higher rates."
        variant="warn"
      />
    </div>
  );
}

// ── Tab: Revenue-Based Finance ────────────────────────────────────────────────

function RBFTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-4">
          <SectionHeader
            title="Revenue-Based Financing"
            subtitle="Repay from a share of monthly revenue, no equity given"
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            RBF providers advance capital in exchange for a fixed percentage of
            monthly revenues until a predetermined repayment cap (typically
            1.2–1.5× of principal) is reached. There are no fixed monthly
            payments — repayments flex with revenue, reducing cash pressure
            during slow months.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Funding Range",
                value: "$50K–$5M",
                col: "text-indigo-400",
              },
              {
                label: "Repayment Cap",
                value: "1.2–1.5×",
                col: "text-emerald-400",
              },
              {
                label: "Revenue Share",
                value: "5–20%/mo",
                col: "text-amber-400",
              },
              {
                label: "Equity Dilution",
                value: "0%",
                col: "text-emerald-400",
              },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-lg border border-border bg-card p-3"
              >
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className={cn("mt-1 text-lg font-medium", m.col)}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader
            title="Dilution Comparison"
            subtitle="Equity dilution by financing type"
          />
          <DilutionComparisonChart />
          <InfoBox
            text="RBF has zero equity dilution but a higher effective cost of capital than venture debt due to the 1.2–1.5× cap structure. Best for revenue-generating SaaS with predictable MRR."
            variant="info"
          />
        </div>
      </div>

      <RBFCalculator />

      <div>
        <SectionHeader
          title="RBF vs Venture Debt vs Equity"
          subtitle="When to use each instrument"
        />
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              name: "Revenue-Based Finance",
              icon: RefreshCw,
              color: "text-primary",
              border: "border-border",
              bg: "bg-muted/5",
              pros: [
                "No equity dilution",
                "Payments flex with revenue",
                "No personal guarantee",
                "Fast approval (2–4 weeks)",
              ],
              cons: [
                "Requires $10K+ MRR",
                "Higher effective rate",
                "Limited to ~3× ARR",
                "Not for pre-revenue",
              ],
            },
            {
              name: "Venture Debt",
              icon: Shield,
              color: "text-emerald-400",
              border: "border-emerald-500/30",
              bg: "bg-emerald-500/5",
              pros: [
                "~3% dilution (warrants)",
                "Large tranches $2–100M",
                "Extends runway 6–12mo",
                "Faster than equity",
              ],
              cons: [
                "Requires VC backing",
                "Senior secured lien",
                "Default risk is real",
                "Covenants restrict ops",
              ],
            },
            {
              name: "Growth Equity",
              icon: TrendingUp,
              color: "text-orange-400",
              border: "border-orange-500/30",
              bg: "bg-orange-500/5",
              pros: [
                "No repayment obligation",
                "Strategic partners",
                "Large $20M–$200M rounds",
                "Governance support",
              ],
              cons: [
                "20–30% dilution",
                "Board seat / control",
                "Long diligence (3–6mo)",
                "Liquidation prefs",
              ],
            },
          ].map((item) => (
            <div
              key={item.name}
              className={cn(
                "rounded-md border p-4 space-y-3",
                item.border,
                item.bg
              )}
            >
              <div className="flex items-center gap-2">
                <item.icon className={cn("h-4 w-4", item.color)} />
                <span className={cn("text-sm font-medium", item.color)}>
                  {item.name}
                </span>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-emerald-400">
                  Pros
                </p>
                {item.pros.map((p) => (
                  <div key={p} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="mt-0.5 text-emerald-400">+</span>
                    <span className="text-muted-foreground">{p}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-rose-400">Cons</p>
                {item.cons.map((c) => (
                  <div key={c} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="mt-0.5 text-rose-400">–</span>
                    <span className="text-muted-foreground">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Growth Equity ────────────────────────────────────────────────────────

const GE_FIRMS = [
  {
    name: "General Atlantic",
    aum: "$73B",
    focus: "Technology, Healthcare, Consumer",
    checkSize: "$50M–$500M",
    stage: "Series C – Pre-IPO",
  },
  {
    name: "Vista Equity Partners",
    aum: "$96B",
    focus: "Enterprise Software",
    checkSize: "$50M–$1B+",
    stage: "Growth + Buyout",
  },
  {
    name: "Insight Partners",
    aum: "$90B",
    focus: "SaaS, Cloud, Internet",
    checkSize: "$10M–$500M",
    stage: "Series B – Pre-IPO",
  },
  {
    name: "Tiger Global",
    aum: "$50B",
    focus: "Internet, Software",
    checkSize: "$25M–$300M",
    stage: "Series B–D",
  },
  {
    name: "Francisco Partners",
    aum: "$45B",
    focus: "Technology",
    checkSize: "$50M–$500M",
    stage: "Growth + Buyout",
  },
];

const STAGE_DATA = [
  { stage: "Series B", equity: 20, debt: 5, rbf: 2, total: 27 },
  { stage: "Series C", equity: 40, debt: 14, rbf: 4, total: 58 },
  { stage: "Series D", equity: 80, debt: 28, rbf: 6, total: 114 },
  { stage: "Pre-IPO", equity: 150, debt: 50, rbf: 8, total: 208 },
];

function StageStackChart() {
  const W = 500;
  const H = 200;
  const PAD = { top: 20, right: 120, bottom: 40, left: 50 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...STAGE_DATA.map((d) => d.total));
  const barW = (innerW / STAGE_DATA.length) * 0.7;
  const gap = innerW / STAGE_DATA.length;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full overflow-visible"
      aria-label="Stage funding stack"
    >
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {[0, 50, 100, 150, 200].map((v) => {
          const y = innerH - (v / maxVal) * innerH;
          return (
            <g key={`yg-${v}`}>
              <line
                x1={0}
                x2={innerW}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
              <text
                x={-6}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill="rgba(255,255,255,0.35)"
              >
                ${v}M
              </text>
            </g>
          );
        })}
        {STAGE_DATA.map((d, i) => {
          const x = i * gap + (gap - barW) / 2;
          const equityH = (d.equity / maxVal) * innerH;
          const debtH = (d.debt / maxVal) * innerH;
          const rbfH = (d.rbf / maxVal) * innerH;
          const equityY = innerH - equityH - debtH - rbfH;
          const debtY = innerH - debtH - rbfH;
          const rbfY = innerH - rbfH;
          return (
            <g key={d.stage}>
              <rect x={x} y={equityY} width={barW} height={equityH} rx={2} fill="#60a5fa" fillOpacity={0.8} />
              <rect x={x} y={debtY} width={barW} height={debtH} rx={2} fill="#34d399" fillOpacity={0.8} />
              <rect x={x} y={rbfY} width={barW} height={rbfH} rx={2} fill="#818cf8" fillOpacity={0.8} />
              <text x={x + barW / 2} y={innerH + 14} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.5)">{d.stage}</text>
            </g>
          );
        })}
        <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        {/* Legend */}
        {[["#60a5fa", "Equity"], ["#34d399", "Venture Debt"], ["#818cf8", "RBF"]].map(([color, label], i) => (
          <g key={label} transform={`translate(${innerW + 10}, ${i * 20 + 20})`}>
            <rect width={10} height={10} rx={2} fill={color} fillOpacity={0.8} />
            <text x={14} y={9} fontSize={9} fill="rgba(255,255,255,0.5)">{label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function GrowthEquityTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-4">
          <SectionHeader
            title="Growth Equity Overview"
            subtitle="Minority equity investments in scaled, cash-flowing businesses"
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Growth equity sits between venture capital and private equity. Firms
            invest $50M–$500M+ for minority stakes (typically 20–40%) in
            companies with proven revenue ($10M–$200M+ ARR) and a path to
            profitability. Unlike buyouts, management retains control. Unlike
            early-stage VC, there is minimal technology risk — focus is on
            distribution and market capture.
          </p>
          <div className="space-y-2">
            {[
              "Minority stake — founder retains control",
              "Revenue threshold: typically $10M–$100M ARR",
              "EBITDA positive or near-positive required",
              "3–7 year investment horizon",
              "Value-add: distribution, M&A, global expansion",
            ].map((pt) => (
              <div key={pt} className="flex items-start gap-2 text-sm">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <span className="text-muted-foreground">{pt}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader
            title="Capital by Stage"
            subtitle="Average equity, debt, and RBF by funding round"
          />
          <StageStackChart />
        </div>
      </div>

      <div>
        <SectionHeader
          title="Top Growth Equity Firms"
          subtitle="Firms focused on late-stage minority growth investments"
        />
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Firm", "AUM", "Focus Sector", "Check Size", "Stage"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {GE_FIRMS.map((f, i) => (
                <tr
                  key={f.name}
                  className={cn(
                    "border-b border-border last:border-0",
                    i % 2 === 0 ? "bg-card" : "bg-muted/20"
                  )}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {f.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400">
                    {f.aum}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {f.focus}
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-400">
                    {f.checkSize}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{f.stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Comparison ───────────────────────────────────────────────────────────

function ComparisonTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <SectionHeader
            title="Lender Comparison Table"
            subtitle="Key venture debt providers and their terms"
          />
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {[
                    "Lender",
                    "Type",
                    "Rate",
                    "Warrants",
                    "Loan Size",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LENDERS.map((l, i) => (
                  <tr
                    key={l.name}
                    className={cn(
                      "border-b border-border last:border-0",
                      i % 2 === 0 ? "bg-card" : "bg-muted/20"
                    )}
                  >
                    <td className="px-3 py-2 font-medium text-foreground">
                      {l.name}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{l.type}</td>
                    <td className="px-3 py-2 font-mono text-amber-400">
                      {l.rate}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {l.warrantCoverage}
                    </td>
                    <td className="px-3 py-2 font-mono text-indigo-400">
                      {l.loanSize}
                    </td>
                    <td className={cn("px-3 py-2 font-medium", l.statusColor)}>
                      {l.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <SectionHeader
            title="Risk / Return Analysis"
            subtitle="Lender IRR vs default loss rate (★ = with warrant upside)"
          />
          <RiskReturnScatter />
          <p className="mt-2 text-xs text-muted-foreground">
            Warrant upside (★) can add 3–8% to base IRR when portfolio companies
            IPO or are acquired at step-up valuations.
          </p>
        </div>
      </div>

      <div>
        <SectionHeader
          title="Lender Economics Deep Dive"
          subtitle="Interest income, loss provisions, and warrant upside"
        />
        <div className="grid grid-cols-4 gap-4">
          {LENDERS.map((l) => {
            const irrLow = parseFloat(l.irr.split("–")[0]);
            const irrHigh = parseFloat(l.irr.split("–")[1]);
            const lossRate = parseFloat(l.lossRate);
            const netYield = ((irrLow + irrHigh) / 2 - lossRate).toFixed(1);
            return (
              <div
                key={l.name}
                className="rounded-md border border-border bg-card p-4 space-y-3"
              >
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {l.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{l.type}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">Gross IRR</span>
                    <span className="text-emerald-400 font-mono">{l.irr}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">Loss Rate</span>
                    <span className="text-rose-400 font-mono">{l.lossRate}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-1.5">
                    <span className="text-muted-foreground">Net Yield</span>
                    <span className="text-foreground font-medium font-mono">
                      ~{netYield}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">Warrants</span>
                    <span className="text-amber-400 font-mono">
                      {l.warrantCoverage}
                    </span>
                  </div>
                </div>
                {/* Yield bar */}
                <div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (parseFloat(netYield) / 20) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground"
                  style={{ borderColor: l.statusColor.replace("text-", "") }}
                >
                  <span className={l.statusColor}>{l.stage}</span>
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoBox
          text="Venture lenders typically target 3–5% portfolio loss rates; well-managed funds see 1–2%. The warrant portfolio is key — a single IPO can recoup losses from 10+ defaults."
          variant="info"
        />
        <InfoBox
          text="Post-SVB, the venture debt market tightened significantly. Deal flow shifted to BDCs like Hercules which are publicly traded, regulated, and thus more transparent about portfolio risk."
          variant="warn"
        />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function VentureDebtPage() {
  const [activeTab, setActiveTab] = useState("venture-debt");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                <Badge variant="outline" className="text-xs text-indigo-400 border-indigo-500/40">
                  Alternative Finance
                </Badge>
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                Venture Debt &amp; Growth Financing
              </h1>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Non-dilutive capital solutions for high-growth startups — from
                venture lending and revenue-based financing to late-stage growth
                equity. Understand the cost, structure, and risk of each
                instrument.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                $32B market (2024)
              </span>
            </div>
          </div>
        </motion.div>

        {/* Key metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-4 gap-4 border-l-4 border-l-primary p-6 rounded-lg bg-card/40"
        >
          {KEY_METRICS.map((m) => (
            <StatCard key={m.label} {...m} />
          ))}
        </motion.div>

        {/* Main tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto">
              <TabsTrigger value="venture-debt">Venture Debt</TabsTrigger>
              <TabsTrigger value="rbf">Revenue-Based Finance</TabsTrigger>
              <TabsTrigger value="growth-equity">Growth Equity</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="venture-debt" className="data-[state=inactive]:hidden">
              <VentureDebtTab />
            </TabsContent>

            <TabsContent value="rbf" className="data-[state=inactive]:hidden">
              <RBFTab />
            </TabsContent>

            <TabsContent value="growth-equity" className="data-[state=inactive]:hidden">
              <GrowthEquityTab />
            </TabsContent>

            <TabsContent value="comparison" className="data-[state=inactive]:hidden">
              <ComparisonTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
