"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Users,
  TrendingUp,
  Shield,
  Building2,
  BarChart3,
  PieChart,
  Target,
  CheckCircle,
  AlertTriangle,
  Info,
  Briefcase,
  Globe,
  Layers,
  Star,
  ArrowRight,
  Calculator,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 932;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const RAND_POOL: number[] = [];
for (let i = 0; i < 300; i++) RAND_POOL.push(rand());
let randIdx = 0;
const r = () => RAND_POOL[randIdx++ % RAND_POOL.length];

// ── Shared components ─────────────────────────────────────────────────────────

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
      : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-xl font-bold", valClass)}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
      {children}
    </h3>
  );
}

function InfoBox({
  children,
  variant = "blue",
}: {
  children: React.ReactNode;
  variant?: "blue" | "amber" | "emerald" | "violet";
}) {
  const colors = {
    blue: "bg-primary/10 border-border text-primary",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
    violet: "bg-primary/10 border-border text-primary",
  };
  return (
    <div className={cn("rounded-lg border p-3 text-xs leading-relaxed", colors[variant])}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Client Segmentation
// ══════════════════════════════════════════════════════════════════════════════

const WEALTH_SEGMENTS = [
  {
    label: "Mass Affluent",
    range: "$100K – $1M",
    population: 362,
    totalWealth: 18.4,
    color: "#60a5fa",
    height: 40,
    width: 180,
    y: 200,
    description: "Primary savings, retirement focus, digital-first services",
  },
  {
    label: "HNW",
    range: "$1M – $10M",
    population: 22.8,
    totalWealth: 86,
    color: "#a78bfa",
    height: 60,
    width: 140,
    y: 140,
    description: "Diversified portfolios, tax planning, wealth transfer",
  },
  {
    label: "VHNW",
    range: "$10M – $100M",
    population: 2.7,
    totalWealth: 64,
    color: "#f59e0b",
    height: 60,
    width: 100,
    y: 80,
    description: "Alternatives, direct deals, family governance",
  },
  {
    label: "UHNW",
    range: "$100M+",
    population: 0.22,
    totalWealth: 61,
    color: "#34d399",
    height: 60,
    width: 60,
    y: 20,
    description: "Family offices, philanthropy, bespoke structures",
  },
];

const REGIONAL_HNWI = [
  { region: "North America", wealth: 22.6, count: 7.9, color: "#60a5fa" },
  { region: "Europe", wealth: 16.8, count: 5.7, color: "#a78bfa" },
  { region: "Asia-Pacific", wealth: 21.7, count: 7.3, color: "#34d399" },
  { region: "Latin America", wealth: 8.2, count: 0.6, color: "#f59e0b" },
  { region: "Middle East", wealth: 3.9, count: 0.7, color: "#fb923c" },
  { region: "Africa", wealth: 1.7, count: 0.2, color: "#f472b6" },
];

const CLIENT_GOALS = [
  { goal: "Wealth Preservation", pct: 68, icon: Shield, color: "text-primary" },
  { goal: "Capital Growth", pct: 54, icon: TrendingUp, color: "text-emerald-400" },
  { goal: "Income Generation", pct: 47, icon: DollarSign, color: "text-amber-400" },
  { goal: "Legacy / Estate", pct: 41, icon: Building2, color: "text-primary" },
  { goal: "Impact / ESG", pct: 29, icon: Globe, color: "text-green-400" },
];

const BEHAVIORAL_BIASES = [
  {
    bias: "Loss Aversion",
    description: "Losses feel 2.25× more painful than equivalent gains. Leads to holding losers too long and selling winners too early.",
    severity: "High",
    color: "rose",
  },
  {
    bias: "Status Quo Bias",
    description: "Preference for existing portfolio allocations. Clients resist rebalancing even when asset allocation drifts materially.",
    severity: "Medium",
    color: "amber",
  },
  {
    bias: "Home Bias",
    description: "Overweighting domestic equities (U.S. investors hold 65%+ domestic vs 40% global market cap). Reduces diversification.",
    severity: "Medium",
    color: "amber",
  },
  {
    bias: "Recency Bias",
    description: "Extrapolating recent returns into the future. Chasing top-performing asset classes after the run has peaked.",
    severity: "High",
    color: "rose",
  },
  {
    bias: "Mental Accounting",
    description: "Treating accounts as separate buckets rather than holistically. Leads to suboptimal portfolio-wide decisions.",
    severity: "Low",
    color: "blue",
  },
];

function WealthPyramid() {
  const cx = 160;
  const baseY = 270;
  const totalH = 250;

  return (
    <svg viewBox="0 0 320 300" className="w-full max-w-sm mx-auto">
      {WEALTH_SEGMENTS.map((seg, i) => {
        const frac = (i + 1) / WEALTH_SEGMENTS.length;
        const halfW = seg.width / 2;
        const yTop = baseY - totalH * frac;
        const yBot = i === 0 ? baseY : baseY - totalH * (i / WEALTH_SEGMENTS.length);
        const topHalfW = i === WEALTH_SEGMENTS.length - 1 ? 0 : (WEALTH_SEGMENTS[i + 1]?.width ?? 0) / 2;
        const points = `${cx - halfW},${yBot} ${cx + halfW},${yBot} ${cx + topHalfW},${yTop} ${cx - topHalfW},${yTop}`;
        return (
          <g key={seg.label}>
            <polygon points={points} fill={seg.color} opacity={0.8} />
            <text
              x={cx}
              y={(yTop + yBot) / 2 + 4}
              textAnchor="middle"
              fill="white"
              fontSize={10}
              fontWeight="bold"
            >
              {seg.label}
            </text>
          </g>
        );
      })}
      {WEALTH_SEGMENTS.map((seg, i) => {
        const frac = (i + 1) / WEALTH_SEGMENTS.length;
        const yBot = i === 0 ? baseY : baseY - totalH * (i / WEALTH_SEGMENTS.length);
        const yTop = baseY - totalH * frac;
        const midY = (yTop + yBot) / 2 + 4;
        return (
          <text
            key={`range-${i}`}
            x={cx + seg.width / 2 + 8}
            y={midY}
            fill={seg.color}
            fontSize={8}
          >
            {seg.range}
          </text>
        );
      })}
    </svg>
  );
}

function RegionalHNWIChart() {
  const maxW = Math.max(...REGIONAL_HNWI.map((d) => d.wealth));
  return (
    <svg viewBox="0 0 340 160" className="w-full">
      {REGIONAL_HNWI.map((d, i) => {
        const y = 10 + i * 24;
        const barW = (d.wealth / maxW) * 200;
        return (
          <g key={d.region}>
            <text x={0} y={y + 10} fill="#a1a1aa" fontSize={9}>
              {d.region}
            </text>
            <rect x={120} y={y} width={barW} height={14} rx={3} fill={d.color} opacity={0.8} />
            <text x={120 + barW + 4} y={y + 10} fill={d.color} fontSize={9}>
              ${d.wealth}T
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ClientSegmentationTab() {
  const [selectedSeg, setSelectedSeg] = useState<number | null>(null);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Global HNWI Count" value="22.8M" sub="$1M+ investable assets" />
        <StatCard label="Total HNWI Wealth" value="$86T" sub="2024 estimate" highlight="pos" />
        <StatCard label="Wealth Transfer" value="$84T" sub="Next 25 years (est.)" highlight="pos" />
        <StatCard label="UHNW Individuals" value="220K" sub="$100M+ globally" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <SectionTitle>
            <Layers size={14} /> Wealth Pyramid
          </SectionTitle>
          <WealthPyramid />
          <div className="space-y-2 mt-2">
            {WEALTH_SEGMENTS.map((seg, i) => (
              <button
                key={seg.label}
                onClick={() => setSelectedSeg(selectedSeg === i ? null : i)}
                className={cn(
                  "w-full text-left rounded-lg border p-2 text-xs transition-colors",
                  selectedSeg === i
                    ? "border-white/30 bg-white/10"
                    : "border-white/5 bg-white/3 hover:bg-muted/30"
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold" style={{ color: seg.color }}>
                    {seg.label}
                  </span>
                  <span className="text-muted-foreground">{seg.range}</span>
                </div>
                <AnimatePresence>
                  {selectedSeg === i && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-muted-foreground overflow-hidden mt-1"
                    >
                      {seg.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <SectionTitle>
              <Globe size={14} /> Global HNWI Wealth by Region
            </SectionTitle>
            <RegionalHNWIChart />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <SectionTitle>
              <Target size={14} /> Client Goals Taxonomy
            </SectionTitle>
            <div className="space-y-2">
              {CLIENT_GOALS.map((g) => (
                <div key={g.goal} className="flex items-center gap-3">
                  <g.icon size={14} className={g.color} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-muted-foreground">{g.goal}</span>
                      <span className="text-muted-foreground">{g.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${g.pct}%`,
                          background: g.color.replace("text-", "").replace("-400", ""),
                          backgroundColor:
                            g.color === "text-primary"
                              ? "#60a5fa"
                              : g.color === "text-emerald-400"
                              ? "#34d399"
                              : g.color === "text-amber-400"
                              ? "#fbbf24"
                              : g.color === "text-primary"
                              ? "#a78bfa"
                              : "#4ade80",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle>
          <AlertTriangle size={14} /> Behavioral Finance in Wealth Management
        </SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BEHAVIORAL_BIASES.map((b) => (
            <div
              key={b.bias}
              className={cn(
                "rounded-lg border p-3 text-xs",
                b.color === "rose"
                  ? "border-rose-500/30 bg-rose-500/10"
                  : b.color === "amber"
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-border bg-primary/10"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white">{b.bias}</span>
                <Badge
                  className={cn(
                    "text-xs px-1.5 py-0",
                    b.color === "rose"
                      ? "bg-rose-500/20 text-rose-300"
                      : b.color === "amber"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-primary/20 text-primary"
                  )}
                >
                  {b.severity}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InfoBox variant="blue">
          <strong className="block mb-1">Risk Tolerance Framework: Capacity vs Willingness</strong>
          Capacity = objective ability to absorb losses (income stability, time horizon, liabilities).
          Willingness = subjective emotional comfort with volatility. Advisors must address both — a
          client with high capacity but low willingness may still sell at the bottom, negating the
          benefit of a risk-appropriate portfolio.
        </InfoBox>
        <InfoBox variant="amber">
          <strong className="block mb-1">KYC / AML Requirements</strong>
          Know Your Customer (KYC) mandates identity verification, source-of-funds documentation, and
          beneficial ownership disclosure. Anti-Money Laundering (AML) requires ongoing transaction
          monitoring, suspicious activity reporting (SAR), and enhanced due diligence (EDD) for
          Politically Exposed Persons (PEPs). FinCEN beneficial ownership rules tightened in 2024.
        </InfoBox>
        <InfoBox variant="violet">
          <strong className="block mb-1">Intergenerational Wealth Dynamics</strong>
          The Great Wealth Transfer: ~$84T moves from Baby Boomers to Gen X / Millennials over 2024–2048.
          Heirs prioritize ESG, digital assets, and impact investing. Advisors who retain next-gen
          clients capture compounding relationship value vs the typical 2-generation advisor relationship.
        </InfoBox>
        <InfoBox variant="emerald">
          <strong className="block mb-1">Intergenerational Wealth Dynamics</strong>
          Studies show 70% of inherited wealth is dissipated by the second generation, 90% by the third.
          Root causes: lack of financial education, family governance failures, estate disputes.
          Family meetings, investment policy statements (IPS), and formal governance structures
          (family council, charter) significantly improve wealth retention rates.
        </InfoBox>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Financial Planning
// ══════════════════════════════════════════════════════════════════════════════

const CFP_STEPS = [
  {
    step: 1,
    title: "Establish Relationship",
    desc: "Define scope, fees, responsibilities, and engagement terms.",
    color: "#60a5fa",
  },
  {
    step: 2,
    title: "Gather Client Data",
    desc: "Collect financial statements, tax returns, risk profile, and goals.",
    color: "#a78bfa",
  },
  {
    step: 3,
    title: "Analyze & Evaluate",
    desc: "Identify gaps between current state and goals. Model scenarios.",
    color: "#f59e0b",
  },
  {
    step: 4,
    title: "Develop Plan",
    desc: "Create actionable, prioritized recommendations aligned to goals.",
    color: "#34d399",
  },
  {
    step: 5,
    title: "Present & Implement",
    desc: "Present plan, gain buy-in, execute recommendations with clients.",
    color: "#fb923c",
  },
  {
    step: 6,
    title: "Monitor & Review",
    desc: "Annual or event-triggered reviews. Adjust for life changes and markets.",
    color: "#f472b6",
  },
];

const MONTE_CARLO_DATA: { year: number; p10: number; p50: number; p90: number }[] = [];
(function buildMC() {
  let p10 = 1_000_000;
  let p50 = 1_000_000;
  let p90 = 1_000_000;
  const withdrawal = 40_000;
  for (let yr = 0; yr <= 30; yr++) {
    MONTE_CARLO_DATA.push({ year: yr, p10, p50, p90 });
    p10 = Math.max(0, p10 * (1 + 0.03) - withdrawal);
    p50 = Math.max(0, p50 * (1 + 0.065) - withdrawal);
    p90 = Math.max(0, p90 * (1 + 0.10) - withdrawal);
  }
})();

const TAX_ALPHA_SOURCES = [
  { source: "Tax-Loss Harvesting", bps: 80, desc: "Offsetting gains with losses, carry-forward" },
  { source: "Asset Location", bps: 65, desc: "Tax-inefficient assets in tax-deferred accounts" },
  { source: "Roth Conversion", bps: 50, desc: "Converting at low-income years, avoiding RMDs" },
  { source: "Charitable Giving", bps: 45, desc: "DAFs, QCDs, appreciated securities donations" },
  { source: "Estate Planning", bps: 40, desc: "Step-up basis, annual gifting, irrevocable trusts" },
  { source: "Direct Indexing", bps: 35, desc: "Per-lot tax-loss harvesting in custom SMAs" },
];

function CFPProcessSVG() {
  const cx = 160;
  const cy = 130;
  const radius = 105;
  return (
    <svg viewBox="0 0 320 270" className="w-full max-w-sm mx-auto">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
      {CFP_STEPS.map((step, i) => {
        const angle = (i / CFP_STEPS.length) * 2 * Math.PI - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        const nextAngle = ((i + 1) / CFP_STEPS.length) * 2 * Math.PI - Math.PI / 2;
        const nx = cx + radius * Math.cos(nextAngle);
        const ny = cy + radius * Math.sin(nextAngle);
        return (
          <g key={step.step}>
            <line
              x1={x}
              y1={y}
              x2={nx}
              y2={ny}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <circle cx={x} cy={y} r={18} fill={step.color} opacity={0.85} />
            <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">
              {step.step}
            </text>
          </g>
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#a1a1aa" fontSize={9}>
        CFP® 6-Step
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="#a1a1aa" fontSize={9}>
        Process
      </text>
    </svg>
  );
}

function MonteCarloSVG() {
  const maxW = 340;
  const maxH = 160;
  const padL = 45;
  const padB = 25;
  const plotW = maxW - padL - 10;
  const plotH = maxH - padB - 10;
  const maxVal = 2_500_000;

  const toX = (yr: number) => padL + (yr / 30) * plotW;
  const toY = (v: number) => 10 + plotH * (1 - v / maxVal);

  const p10Path = MONTE_CARLO_DATA.map((d, i) =>
    `${i === 0 ? "M" : "L"}${toX(d.year)},${toY(d.p10)}`
  ).join(" ");
  const p50Path = MONTE_CARLO_DATA.map((d, i) =>
    `${i === 0 ? "M" : "L"}${toX(d.year)},${toY(d.p50)}`
  ).join(" ");
  const p90Path = MONTE_CARLO_DATA.map((d, i) =>
    `${i === 0 ? "M" : "L"}${toX(d.year)},${toY(d.p90)}`
  ).join(" ");

  const areaPath =
    MONTE_CARLO_DATA.map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.year)},${toY(d.p90)}`).join(" ") +
    " " +
    [...MONTE_CARLO_DATA]
      .reverse()
      .map((d) => `L${toX(d.year)},${toY(d.p10)}`)
      .join(" ") +
    " Z";

  return (
    <svg viewBox={`0 0 ${maxW} ${maxH}`} className="w-full">
      {[0, 500000, 1000000, 1500000, 2000000, 2500000].map((v) => (
        <g key={v}>
          <line
            x1={padL}
            y1={toY(v)}
            x2={maxW - 10}
            y2={toY(v)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
          <text x={padL - 3} y={toY(v) + 3} textAnchor="end" fill="#71717a" fontSize={7}>
            {v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v === 0 ? "$0" : `$${v / 1000}K`}
          </text>
        </g>
      ))}
      {[0, 5, 10, 15, 20, 25, 30].map((yr) => (
        <text key={yr} x={toX(yr)} y={maxH - 5} textAnchor="middle" fill="#71717a" fontSize={7}>
          Yr{yr}
        </text>
      ))}
      <path d={areaPath} fill="rgba(96,165,250,0.12)" />
      <path d={p10Path} fill="none" stroke="#f87171" strokeWidth={1.5} />
      <path d={p50Path} fill="none" stroke="#60a5fa" strokeWidth={2} />
      <path d={p90Path} fill="none" stroke="#34d399" strokeWidth={1.5} />
      <g>
        <circle cx={padL + 8} cy={12} r={3} fill="#f87171" />
        <text x={padL + 14} y={15} fill="#f87171" fontSize={7}>
          10th pct
        </text>
        <circle cx={padL + 58} cy={12} r={3} fill="#60a5fa" />
        <text x={padL + 64} y={15} fill="#60a5fa" fontSize={7}>
          Median
        </text>
        <circle cx={padL + 106} cy={12} r={3} fill="#34d399" />
        <text x={padL + 112} y={15} fill="#34d399" fontSize={7}>
          90th pct
        </text>
      </g>
    </svg>
  );
}

function FinancialPlanningTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="4% Rule Success Rate" value="95%" sub="30-yr horizon, balanced" highlight="pos" />
        <StatCard label="Human Capital (Age 30)" value="~$2.4M" sub="PV of future earnings" />
        <StatCard label="Avg. Retirement Gap" value="$1.1M" sub="Median needed vs saved" highlight="neg" />
        <StatCard label="Life Insurance Need" value="10–12×" sub="Annual income multiplier" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <SectionTitle>
            <CheckCircle size={14} /> CFP® 6-Step Financial Planning Process
          </SectionTitle>
          <CFPProcessSVG />
          <div className="space-y-2 mt-2">
            {CFP_STEPS.map((step) => (
              <div key={step.step} className="flex gap-2 text-xs">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  style={{ backgroundColor: step.color }}
                >
                  {step.step}
                </span>
                <div>
                  <span className="font-semibold text-white">{step.title}: </span>
                  <span className="text-muted-foreground">{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <SectionTitle>
              <BarChart3 size={14} /> Monte Carlo Retirement Simulation
            </SectionTitle>
            <p className="text-xs text-muted-foreground mb-2">$1M portfolio, $40K/yr withdrawal, 30-year horizon</p>
            <MonteCarloSVG />
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-center">
              <div className="rounded bg-rose-500/10 border border-rose-500/20 p-1.5">
                <div className="text-rose-400 font-bold">10th Pct</div>
                <div className="text-muted-foreground">Bear scenario</div>
              </div>
              <div className="rounded bg-primary/10 border border-border p-1.5">
                <div className="text-primary font-bold">Median</div>
                <div className="text-muted-foreground">Base case</div>
              </div>
              <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-1.5">
                <div className="text-emerald-400 font-bold">90th Pct</div>
                <div className="text-muted-foreground">Bull scenario</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <SectionTitle>
              <DollarSign size={14} /> Tax Alpha Sources (annual bps)
            </SectionTitle>
            <div className="space-y-2">
              {TAX_ALPHA_SOURCES.map((t) => (
                <div key={t.source} className="flex items-center gap-2 text-xs">
                  <div className="w-24 text-muted-foreground flex-shrink-0">{t.source}</div>
                  <div className="flex-1">
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500"
                        style={{ width: `${(t.bps / 80) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-emerald-400 w-10 text-right font-medium">+{t.bps}bps</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InfoBox variant="amber">
          <strong className="block mb-1">Sequence of Returns Risk</strong>
          Identical average returns produce radically different outcomes depending on ordering. Negative
          returns early in retirement (while withdrawals are high) can permanently impair a portfolio.
          Mitigation: cash buffer (1–2 years), dynamic withdrawal rules (Guyton-Klinger), bond tent strategy.
        </InfoBox>
        <InfoBox variant="blue">
          <strong className="block mb-1">4% Rule and Its Limitations</strong>
          The Bengen (1994) rule targets 95% success rate over 30 years assuming 50/50 stocks/bonds.
          Critics note: lower forward bond yields reduce success probability to ~75% in current environment.
          Flexible withdrawal strategies (spending floors + ceilings) offer superior outcomes.
        </InfoBox>
        <InfoBox variant="violet">
          <strong className="block mb-1">Human Capital: Your Largest Asset</strong>
          For a 30-year-old earning $80K/yr with 3% real growth and 35 working years, PV at 5% discount
          rate ≈ $2.4M. This asset is bond-like for stable professionals (over-weight equities to
          diversify) and equity-like for entrepreneurs (over-weight bonds). Life/disability insurance
          protects human capital during working years.
        </InfoBox>
        <InfoBox variant="emerald">
          <strong className="block mb-1">Liability-Driven Investing for Individuals</strong>
          Match asset duration to liability duration. Future college funding, retirement income, and
          mortgage payoff are liabilities. Goal-based segmentation: separate "safety" (bonds/annuities
          matching floor income) from "upside" (equities targeting aspirational goals). Avoids behavioral
          selling during downturns in the growth portfolio.
        </InfoBox>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Asset Allocation Models
// ══════════════════════════════════════════════════════════════════════════════

const PROFILES = [
  {
    name: "Conservative",
    color: "#60a5fa",
    allocations: { Equity: 25, Bonds: 50, Cash: 10, Alternatives: 10, Real_Assets: 5 },
  },
  {
    name: "Moderate",
    color: "#a78bfa",
    allocations: { Equity: 50, Bonds: 30, Cash: 5, Alternatives: 10, Real_Assets: 5 },
  },
  {
    name: "Aggressive",
    color: "#34d399",
    allocations: { Equity: 70, Bonds: 10, Cash: 2, Alternatives: 13, Real_Assets: 5 },
  },
];

const ASSET_CLASSES = ["Equity", "Bonds", "Cash", "Alternatives", "Real_Assets"];

const GLIDE_PATH: { age: number; equity: number; bonds: number; alts: number }[] = [];
for (let age = 25; age <= 80; age += 5) {
  const equity = Math.max(20, 110 - age);
  const alts = age < 65 ? Math.min(20, (age - 25) / 2) : 10;
  GLIDE_PATH.push({ age, equity, bonds: 100 - equity - alts, alts });
}

const FACTOR_TILTS = [
  { factor: "Value", premium: 3.1, risk: "Prolonged growth outperformance cycles", color: "#f59e0b" },
  { factor: "Quality", premium: 2.8, risk: "Expensive in risk-off rallies", color: "#60a5fa" },
  { factor: "Low Volatility", premium: 2.3, risk: "Underperforms in strong bull markets", color: "#34d399" },
  { factor: "Size (Small Cap)", premium: 3.6, risk: "Liquidity constraints, higher drawdowns", color: "#a78bfa" },
  { factor: "Momentum", premium: 4.2, risk: "Crash risk during factor reversals", color: "#fb923c" },
];

const REBALANCING_METHODS = [
  {
    method: "Calendar",
    frequency: "Quarterly / Annual",
    pros: "Simple, predictable",
    cons: "May miss major drift events",
    color: "blue",
  },
  {
    method: "Threshold (Band)",
    frequency: "When drift > ±5%",
    pros: "Responds to market moves",
    cons: "Unpredictable timing, tx costs",
    color: "amber",
  },
  {
    method: "Hybrid",
    frequency: "Quarterly + ±5% band",
    pros: "Best of both approaches",
    cons: "Slightly more complex to manage",
    color: "emerald",
  },
];

function RadarChart({ profile }: { profile: (typeof PROFILES)[0] }) {
  const keys = ASSET_CLASSES;
  const n = keys.length;
  const cx = 90;
  const cy = 90;
  const maxR = 70;

  const angleForI = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const valForKey = (k: string) => (profile.allocations as Record<string, number>)[k] ?? 0;
  const maxVal = 70;

  const points = keys.map((k, i) => {
    const angle = angleForI(i);
    const r = (valForKey(k) / maxVal) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 180 180" className="w-full max-w-[160px]">
      {[25, 50, 75, 100].map((pct) => {
        const rr = (pct / 100) * maxR;
        const ps = keys.map((_, i) => {
          const angle = angleForI(i);
          return `${cx + rr * Math.cos(angle)},${cy + rr * Math.sin(angle)}`;
        });
        return (
          <polygon
            key={pct}
            points={ps.join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        );
      })}
      {keys.map((_, i) => {
        const angle = angleForI(i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + maxR * Math.cos(angle)}
            y2={cy + maxR * Math.sin(angle)}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        );
      })}
      <polygon points={polyPoints} fill={profile.color} opacity={0.35} />
      <polygon points={polyPoints} fill="none" stroke={profile.color} strokeWidth={1.5} />
      {keys.map((k, i) => {
        const angle = angleForI(i);
        const lx = cx + (maxR + 14) * Math.cos(angle);
        const ly = cy + (maxR + 14) * Math.sin(angle);
        return (
          <text
            key={k}
            x={lx}
            y={ly + 3}
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize={6.5}
          >
            {k.replace("_", " ")}
          </text>
        );
      })}
    </svg>
  );
}

function GlidePath() {
  const maxW = 340;
  const maxH = 140;
  const padL = 30;
  const padB = 20;
  const plotW = maxW - padL - 10;
  const plotH = maxH - padB - 10;

  const minAge = 25;
  const maxAge = 80;
  const toX = (age: number) => padL + ((age - minAge) / (maxAge - minAge)) * plotW;
  const toY = (pct: number) => 10 + plotH * (1 - pct / 100);

  const eqPath = GLIDE_PATH.map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.age)},${toY(d.equity)}`).join(" ");
  const bondPath = GLIDE_PATH.map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.age)},${toY(d.bonds)}`).join(" ");
  const altPath = GLIDE_PATH.map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.age)},${toY(d.alts)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${maxW} ${maxH}`} className="w-full">
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line
            x1={padL}
            y1={toY(v)}
            x2={maxW - 10}
            y2={toY(v)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
          <text x={padL - 3} y={toY(v) + 3} textAnchor="end" fill="#71717a" fontSize={7}>
            {v}%
          </text>
        </g>
      ))}
      {[25, 35, 45, 55, 65, 75].map((age) => (
        <text key={age} x={toX(age)} y={maxH - 4} textAnchor="middle" fill="#71717a" fontSize={7}>
          {age}
        </text>
      ))}
      <path d={eqPath} fill="none" stroke="#60a5fa" strokeWidth={2} />
      <path d={bondPath} fill="none" stroke="#34d399" strokeWidth={2} />
      <path d={altPath} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,2" />
      <g>
        <circle cx={padL + 8} cy={10} r={3} fill="#60a5fa" />
        <text x={padL + 14} y={13} fill="#60a5fa" fontSize={7}>Equity</text>
        <circle cx={padL + 50} cy={10} r={3} fill="#34d399" />
        <text x={padL + 56} y={13} fill="#34d399" fontSize={7}>Bonds</text>
        <circle cx={padL + 92} cy={10} r={3} fill="#f59e0b" />
        <text x={padL + 98} y={13} fill="#f59e0b" fontSize={7}>Alts</text>
      </g>
    </svg>
  );
}

function AssetAllocationTab() {
  const [selectedProfile, setSelectedProfile] = useState(0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Alts Allocation (UHNW)" value="30–40%" sub="PE, hedge, real assets" />
        <StatCard label="Direct Indexing Min" value="$250K" sub="Tax-loss harvesting SMA" />
        <StatCard label="Rebalancing Alpha" value="+35bps" sub="Annual from disciplined rebal." highlight="pos" />
        <StatCard label="ESG AUM Global" value="$41T" sub="30% of professionally managed" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <SectionTitle>
            <PieChart size={14} /> Model Portfolio by Risk Profile
          </SectionTitle>
          <div className="flex gap-2 mb-4">
            {PROFILES.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setSelectedProfile(i)}
                className={cn(
                  "flex-1 text-xs rounded-lg border py-1.5 font-medium transition-colors",
                  selectedProfile === i
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/10 bg-transparent text-muted-foreground hover:text-white"
                )}
                style={selectedProfile === i ? { borderColor: p.color + "80", color: p.color } : {}}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <RadarChart profile={PROFILES[selectedProfile]} />
            <div className="flex-1 space-y-1.5">
              {ASSET_CLASSES.map((k) => {
                const val = (PROFILES[selectedProfile].allocations as Record<string, number>)[k] ?? 0;
                return (
                  <div key={k} className="text-xs">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-muted-foreground">{k.replace("_", " ")}</span>
                      <span className="text-white font-medium">{val}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10">
                      <div
                        className="h-1 rounded-full"
                        style={{
                          width: `${val}%`,
                          backgroundColor: PROFILES[selectedProfile].color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <InfoBox variant="blue">
              <strong className="block">Strategic AA</strong>
              Long-term target weights derived from capital market assumptions (CMAs). Rebalanced
              periodically. Driven by risk tolerance and return objectives.
            </InfoBox>
            <InfoBox variant="violet">
              <strong className="block">Tactical AA</strong>
              Short-term deviations (±5–15%) based on market conditions. Requires active views.
              Evidence of tactical alpha is mixed — implementation costs often erode benefits.
            </InfoBox>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <SectionTitle>
              <TrendingUp size={14} /> Lifecycle Glide Path (Age vs Allocation)
            </SectionTitle>
            <GlidePath />
            <p className="text-xs text-muted-foreground mt-1">
              Modern approach: "110 − age" equity rule. Adds alternatives sleeve (PE/real assets) for HNW clients.
              Target-date funds use automated glide paths.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <SectionTitle>
              <BarChart3 size={14} /> Factor Tilts
            </SectionTitle>
            <div className="space-y-2">
              {FACTOR_TILTS.map((f) => (
                <div key={f.factor} className="text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-white">{f.factor}</span>
                    <span className="text-emerald-400">+{f.premium}% avg annual premium</span>
                  </div>
                  <p className="text-muted-foreground">{f.risk}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle>
          <Calculator size={14} /> Rebalancing Strategies
        </SectionTitle>
        <div className="grid sm:grid-cols-3 gap-3">
          {REBALANCING_METHODS.map((m) => (
            <div
              key={m.method}
              className={cn(
                "rounded-lg border p-3 text-xs",
                m.color === "blue"
                  ? "border-border bg-primary/10"
                  : m.color === "amber"
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-emerald-500/30 bg-emerald-500/10"
              )}
            >
              <div className="font-semibold text-white mb-1">{m.method} Rebalancing</div>
              <div className="text-muted-foreground mb-1">Trigger: {m.frequency}</div>
              <div className="text-emerald-300 mb-0.5">Pros: {m.pros}</div>
              <div className="text-rose-300">Cons: {m.cons}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InfoBox variant="emerald">
          <strong className="block mb-1">Alternatives for HNW Portfolios (20–40%)</strong>
          PE: 3–5 year lockup, illiquidity premium +300–500bps over public equity. Hedge funds:
          absolute return, low correlation. Real assets: inflation hedge, income. Combined allocation
          to alternatives meaningfully improves Sharpe ratio for portfolios above $2M+ where
          minimum investments are accessible.
        </InfoBox>
        <InfoBox variant="violet">
          <strong className="block mb-1">Direct Indexing and Tax-Loss Harvesting</strong>
          Instead of buying an ETF, client owns individual stocks in SMA. Tax-loss harvesting at
          individual lot level generates 50–150bps annual tax alpha. Minimum $250K–$500K.
          Replaces index fund with virtually identical exposure while generating losses to
          offset capital gains elsewhere in the portfolio.
        </InfoBox>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Fee Models & Technology
// ══════════════════════════════════════════════════════════════════════════════

const AUM_FEE_TIERS = [
  { label: "< $500K", fee: 1.5, color: "#f87171" },
  { label: "$500K–$1M", fee: 1.2, color: "#fb923c" },
  { label: "$1M–$2M", fee: 1.0, color: "#fbbf24" },
  { label: "$2M–$5M", fee: 0.85, color: "#a3e635" },
  { label: "$5M–$10M", fee: 0.65, color: "#34d399" },
  { label: "$10M–$25M", fee: 0.5, color: "#22d3ee" },
  { label: "> $25M", fee: 0.35, color: "#60a5fa" },
];

const ROBO_ADVISORS = [
  {
    name: "Betterment",
    fee: "0.25%",
    min: "$0",
    features: ["Tax-loss harvesting", "Auto-rebalancing", "Goal buckets", "Crypto"],
    color: "#22c55e",
  },
  {
    name: "Wealthfront",
    fee: "0.25%",
    min: "$500",
    features: ["Direct indexing $100K+", "529 plans", "Risk parity", "AI assistant"],
    color: "#3b82f6",
  },
  {
    name: "Vanguard Digital",
    fee: "0.20%",
    min: "$3K",
    features: ["Low-cost Vanguard funds", "Human advisor access", "Retirement focus", "CFP access"],
    color: "#8b5cf6",
  },
  {
    name: "Schwab Intelligent",
    fee: "0%",
    min: "$5K",
    features: ["No mgmt fee", "Cash drag (~2%)", "Auto-rebalancing", "ETF portfolio"],
    color: "#f59e0b",
  },
];

const FEE_MODELS = [
  {
    model: "AUM-Based",
    typical: "0.5%–1.5%",
    fiduciary: true,
    pros: "Aligns incentives, predictable revenue",
    cons: "Disincentivizes large withdrawals, penalizes large clients",
    color: "blue",
  },
  {
    model: "Flat Fee",
    typical: "$5K–$25K/yr",
    fiduciary: true,
    pros: "Transparent, no conflict for deposits/withdrawals",
    cons: "High for smaller accounts, less accessible",
    color: "violet",
  },
  {
    model: "Hourly",
    typical: "$150–$400/hr",
    fiduciary: true,
    pros: "Pay only for what you need, no ongoing commitment",
    cons: "Discourages advice-seeking, unpredictable cost",
    color: "amber",
  },
  {
    model: "Commission",
    typical: "Varies by product",
    fiduciary: false,
    pros: "No out-of-pocket cost to client initially",
    cons: "Conflicts of interest, suitability (not fiduciary) standard",
    color: "rose",
  },
];

const FAMILY_OFFICE_TYPES = [
  {
    type: "Single Family Office (SFO)",
    threshold: "$100M+",
    cost: "$1–5M/yr operating",
    desc: "Dedicated staff, complete control, full service. Staff of 5–20. Customizable investment mandate.",
    color: "#fbbf24",
  },
  {
    type: "Multi-Family Office (MFO)",
    threshold: "$20M+",
    cost: "0.5–1.0% AUM",
    desc: "Shared infrastructure across multiple families. Institutional investment access at lower cost.",
    color: "#a78bfa",
  },
  {
    type: "Virtual Family Office",
    threshold: "$5M+",
    cost: "Varies by services",
    desc: "Network of specialists coordinated by lead advisor. Flexible, scalable, no fixed overhead.",
    color: "#34d399",
  },
];

function AUMFeeChart() {
  const maxW = 340;
  const maxH = 140;
  const padL = 40;
  const padB = 30;
  const plotW = maxW - padL - 10;
  const plotH = maxH - padB - 10;
  const maxFee = 2.0;
  const barW = plotW / AUM_FEE_TIERS.length - 4;

  return (
    <svg viewBox={`0 0 ${maxW} ${maxH}`} className="w-full">
      {[0, 0.5, 1.0, 1.5, 2.0].map((v) => {
        const y = 10 + plotH * (1 - v / maxFee);
        return (
          <g key={v}>
            <line
              x1={padL}
              y1={y}
              x2={maxW - 10}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text x={padL - 3} y={y + 3} textAnchor="end" fill="#71717a" fontSize={7}>
              {v}%
            </text>
          </g>
        );
      })}
      {AUM_FEE_TIERS.map((t, i) => {
        const x = padL + i * (plotW / AUM_FEE_TIERS.length) + 2;
        const h = (t.fee / maxFee) * plotH;
        const y = 10 + plotH - h;
        return (
          <g key={t.label}>
            <rect x={x} y={y} width={barW} height={h} rx={2} fill={t.color} opacity={0.85} />
            <text
              x={x + barW / 2}
              y={maxH - 5}
              textAnchor="middle"
              fill="#71717a"
              fontSize={5.5}
            >
              {t.label.replace("–", "–")}
            </text>
            <text
              x={x + barW / 2}
              y={y - 2}
              textAnchor="middle"
              fill={t.color}
              fontSize={6.5}
            >
              {t.fee}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function FeeModelsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Robo-Advisor Fee" value="0.20–0.25%" sub="vs 1%+ full-service" highlight="pos" />
        <StatCard label="SFO Cost Threshold" value="$100M+" sub="For dedicated family office" />
        <StatCard label="Fee Compression" value="-40%" sub="AUM fees over 10 years" highlight="neg" />
        <StatCard label="AI Personalization" value="2024+" sub="Next-gen wealth platforms" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <SectionTitle>
            <BarChart3 size={14} /> AUM Fee Schedule by Wealth Tier
          </SectionTitle>
          <AUMFeeChart />
          <InfoBox variant="blue">
            <strong>Fee compression trend:</strong> Robo-advisors (0.20–0.25%) and index funds have
            pressured full-service advisors. Average AUM fee fell from 1.15% (2015) to ~0.90% (2024).
            Advisors now differentiate on planning depth, access, and behavioral coaching.
          </InfoBox>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <SectionTitle>
              <Shield size={14} /> Fee Model Comparison
            </SectionTitle>
            <div className="space-y-2">
              {FEE_MODELS.map((m) => (
                <div
                  key={m.model}
                  className={cn(
                    "rounded-lg border p-2.5 text-xs",
                    m.color === "blue"
                      ? "border-border bg-primary/10"
                      : m.color === "violet"
                      ? "border-border bg-primary/10"
                      : m.color === "amber"
                      ? "border-amber-500/30 bg-amber-500/10"
                      : "border-rose-500/30 bg-rose-500/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{m.model}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">{m.typical}</span>
                      <Badge
                        className={cn(
                          "text-xs px-1 py-0",
                          m.fiduciary
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/20 text-rose-300"
                        )}
                      >
                        {m.fiduciary ? "Fiduciary" : "Suitability"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-emerald-300 mb-0.5">Pros: {m.pros}</div>
                  <div className="text-rose-300">Cons: {m.cons}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle>
          <Star size={14} /> Robo-Advisor Platform Comparison
        </SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ROBO_ADVISORS.map((ra) => (
            <div
              key={ra.name}
              className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs"
            >
              <div className="font-bold text-sm mb-1" style={{ color: ra.color }}>
                {ra.name}
              </div>
              <div className="grid grid-cols-2 gap-x-2 mb-2 text-muted-foreground">
                <div>
                  <span className="text-muted-foreground">Fee: </span>
                  <span className="text-white font-medium">{ra.fee}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Min: </span>
                  <span className="text-white font-medium">{ra.min}</span>
                </div>
              </div>
              <ul className="space-y-0.5">
                {ra.features.map((f) => (
                  <li key={f} className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle size={9} className="text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle>
          <Building2 size={14} /> Family Office Structures
        </SectionTitle>
        <div className="grid sm:grid-cols-3 gap-3">
          {FAMILY_OFFICE_TYPES.map((fo) => (
            <div
              key={fo.type}
              className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs"
            >
              <div className="font-semibold text-sm mb-1" style={{ color: fo.color }}>
                {fo.type}
              </div>
              <div className="flex gap-4 mb-2">
                <div>
                  <span className="text-muted-foreground">Min: </span>
                  <span className="text-white">{fo.threshold}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cost: </span>
                  <span className="text-white">{fo.cost}</span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">{fo.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InfoBox variant="blue">
          <strong className="block mb-1">Fiduciary vs. Suitability Standard</strong>
          Fiduciary standard (RIAs under Investment Advisers Act) requires acting in the client's best
          interest at all times. Suitability standard (broker-dealers under FINRA) only requires
          recommendations be "suitable" — not necessarily best. SEC's Regulation Best Interest (Reg BI,
          2020) raised the standard for BDs but stops short of full fiduciary duty. Always ask: "Are you
          a fiduciary 100% of the time?"
        </InfoBox>
        <InfoBox variant="violet">
          <strong className="block mb-1">AI in Wealth Management</strong>
          Key applications: (1) Personalization — AI models tailor portfolio recommendations to
          behavioral patterns and life events. (2) Tax optimization — real-time tax-loss harvesting,
          RMD scheduling, Roth conversion modeling. (3) Advisor augmentation — AI generates client
          meeting prep, detects churn risk, monitors portfolio drift. Platforms like Morgan Stanley's
          AI @ Morgan Stanley and Goldman's Marcus Insights are live in production.
        </InfoBox>
        <InfoBox variant="amber">
          <strong className="block mb-1">Digital Advice Platform Trends</strong>
          "Hybrid" model (digital + human) captures 58% of new AUM flows. Pure robo platforms
          struggle with retention during market stress — clients want a human voice. Leading
          firms are building AI-powered advisor tools to serve mass affluent ($100K–$1M) profitably
          with lower headcount. AI cost-to-serve down ~60% vs traditional model.
        </InfoBox>
        <InfoBox variant="emerald">
          <strong className="block mb-1">Family Office Key Services</strong>
          Investment management, consolidated reporting (multi-custodian), bill pay and cash management,
          tax preparation and planning, estate administration, family governance (charter, council,
          education), philanthropy (DAF/private foundation), lifestyle management (art, real estate,
          aircraft management), concierge services, and next-generation financial education programs.
        </InfoBox>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function WealthMgmtPage() {
  // consume PRNG pool for determinism
  void r();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="rounded-xl bg-amber-500/15 p-2.5">
              <Briefcase size={22} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Wealth Management</h1>
              <p className="text-sm text-muted-foreground">
                HNW client segmentation, financial planning, asset allocation, fee models, and family offices
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="segmentation">
          <TabsList className="mb-6 bg-white/5 border border-white/10 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="segmentation" className="data-[state=active]:bg-white/15 text-xs">
              <Users size={13} className="mr-1.5" />
              Client Segmentation
            </TabsTrigger>
            <TabsTrigger value="planning" className="data-[state=active]:bg-white/15 text-xs">
              <Target size={13} className="mr-1.5" />
              Financial Planning
            </TabsTrigger>
            <TabsTrigger value="allocation" className="data-[state=active]:bg-white/15 text-xs">
              <PieChart size={13} className="mr-1.5" />
              Asset Allocation
            </TabsTrigger>
            <TabsTrigger value="fees" className="data-[state=active]:bg-white/15 text-xs">
              <DollarSign size={13} className="mr-1.5" />
              Fee Models & Tech
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segmentation" className="data-[state=inactive]:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key="segmentation"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <ClientSegmentationTab />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="planning" className="data-[state=inactive]:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key="planning"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <FinancialPlanningTab />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="allocation" className="data-[state=inactive]:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key="allocation"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <AssetAllocationTab />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="fees" className="data-[state=inactive]:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key="fees"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <FeeModelsTab />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
