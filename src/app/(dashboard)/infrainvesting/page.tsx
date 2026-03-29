"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Zap,
  Globe,
  Shield,
  DollarSign,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Layers,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  Wifi,
  Droplets,
  Wind,
  Sun,
  Activity,
  Lock,
  Users,
  PiggyBank,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 922;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate random pool
const RAND_POOL: number[] = [];
for (let i = 0; i < 300; i++) RAND_POOL.push(rand());
let rIdx = 0;
const r = () => RAND_POOL[rIdx++ % RAND_POOL.length];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtB(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}T`;
  return `$${n.toFixed(0)}B`;
}

function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

// ── Shared UI Components ──────────────────────────────────────────────────────

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
  variant?: "blue" | "amber" | "emerald" | "purple";
}) {
  const cls =
    variant === "amber"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : variant === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : variant === "purple"
      ? "border-border bg-primary/10 text-primary"
      : "border-border bg-primary/10 text-primary";
  return (
    <div className={cn("rounded-lg border p-3 text-xs leading-relaxed", cls)}>
      {children}
    </div>
  );
}

// ── Tab 1: Asset Classes ──────────────────────────────────────────────────────

const SUB_SECTORS = [
  {
    name: "Toll Roads",
    segment: "Economic",
    color: "#3b82f6",
    yieldTarget: "7-9%",
    risk: "Core",
    inflationLink: "CPI-indexed tariffs",
    desc: "Long-term concession agreements with regulated toll escalation. Monopolistic catchment areas and high barriers to entry.",
    icon: "🛣️",
  },
  {
    name: "Airports",
    segment: "Economic",
    color: "#6366f1",
    yieldTarget: "8-11%",
    risk: "Core+",
    inflationLink: "Regulatory price controls",
    desc: "Aeronautical revenues regulated; commercial revenues (retail, parking) provide inflation upside. Traffic risk key variable.",
    icon: "✈️",
  },
  {
    name: "Utilities",
    segment: "Economic",
    color: "#0ea5e9",
    yieldTarget: "6-8%",
    risk: "Core",
    inflationLink: "RAB-based regulation",
    desc: "Regulated asset base (RAB) methodology sets allowed returns. Electricity/gas distribution with captive customer base.",
    icon: "⚡",
  },
  {
    name: "Renewables",
    segment: "Energy",
    color: "#22c55e",
    yieldTarget: "9-13%",
    risk: "Core+",
    inflationLink: "CfD/PPA contracts",
    desc: "Solar and wind projects with long-dated power purchase agreements. Policy support via IRA, CfDs, and capacity markets.",
    icon: "🌿",
  },
  {
    name: "Cell Towers",
    segment: "Digital",
    color: "#f59e0b",
    yieldTarget: "8-12%",
    risk: "Core+",
    inflationLink: "Escalator clauses",
    desc: "Long-term master lease agreements with mobile network operators. Tenant escalators typically 2-3% annually.",
    icon: "📡",
  },
  {
    name: "Data Centers",
    segment: "Digital",
    color: "#a78bfa",
    yieldTarget: "10-15%",
    risk: "Value-Add",
    inflationLink: "Market leases",
    desc: "Hyperscaler demand driving explosive growth. Power availability and connectivity critical. AI workloads key demand driver.",
    icon: "🖥️",
  },
  {
    name: "Water",
    segment: "Social",
    color: "#06b6d4",
    yieldTarget: "6-8%",
    risk: "Core",
    inflationLink: "CPI-linked tariffs",
    desc: "Highly regulated water/wastewater utilities. Essential service with near-zero demand elasticity. Low risk, stable cashflows.",
    icon: "💧",
  },
  {
    name: "Hospitals",
    segment: "Social",
    color: "#f43f5e",
    yieldTarget: "7-10%",
    risk: "Core+",
    inflationLink: "Availability payments",
    desc: "Government availability payment structures in PPP/PFI frameworks. Healthcare demand driven by demographics.",
    icon: "🏥",
  },
];

const RISK_TIERS = [
  {
    tier: "Core",
    returnTarget: "8–10%",
    leverage: "50-65% LTV",
    examples: "Regulated utilities, water, toll roads",
    color: "#22c55e",
    desc: "Regulated monopolies with predictable cashflows, inflation linkage, low volumetric risk.",
  },
  {
    tier: "Core+",
    returnTarget: "10–13%",
    leverage: "45-60% LTV",
    examples: "Airports, renewables, cell towers",
    color: "#f59e0b",
    desc: "Primarily contracted cashflows with some market exposure. Moderate construction or volume risk.",
  },
  {
    tier: "Value-Add",
    returnTarget: "13–17%",
    leverage: "40-55% LTV",
    examples: "Data centers, greenfield projects",
    color: "#f43f5e",
    desc: "Development, merchant exposure, or restructuring required. Higher return potential, elevated risk.",
  },
];

// AUM growth data $B, 2015-2024
const AUM_DATA = [500, 560, 630, 720, 810, 870, 920, 980, 1050, 1100];
const AUM_YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

// Return/volatility scatter data (approximate annualized)
const SCATTER_DATA = [
  { name: "Core Infra", ret: 9.2, vol: 7.8, color: "#22c55e" },
  { name: "Core+ Infra", ret: 11.5, vol: 10.5, color: "#f59e0b" },
  { name: "Value-Add", ret: 14.8, vol: 15.2, color: "#f43f5e" },
  { name: "Private Equity", ret: 15.3, vol: 20.1, color: "#6366f1" },
  { name: "Core RE", ret: 8.4, vol: 9.2, color: "#0ea5e9" },
  { name: "Value-Add RE", ret: 12.6, vol: 14.7, color: "#a78bfa" },
  { name: "Public Equity", ret: 10.1, vol: 18.4, color: "#64748b" },
  { name: "Bonds", ret: 3.8, vol: 5.6, color: "#94a3b8" },
] as const;

function AssetClassesTab() {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const selected = SUB_SECTORS.find((s) => s.name === selectedSector);

  // SVG taxonomy chart dimensions
  const svgW = 700;
  const svgH = 240;

  // Scatter chart
  const scW = 480;
  const scH = 280;
  const scPad = { l: 50, r: 20, t: 20, b: 40 };
  const scInnerW = scW - scPad.l - scPad.r;
  const scInnerH = scH - scPad.t - scPad.b;
  const retRange = [3, 17];
  const volRange = [4, 22];
  const toSX = (vol: number) =>
    scPad.l + ((vol - volRange[0]) / (volRange[1] - volRange[0])) * scInnerW;
  const toSY = (ret: number) =>
    scPad.t + (1 - (ret - retRange[0]) / (retRange[1] - retRange[0])) * scInnerH;

  // AUM chart
  const aumW = 480;
  const aumH = 220;
  const aumPad = { l: 60, r: 20, t: 20, b: 40 };
  const aumInnerW = aumW - aumPad.l - aumPad.r;
  const aumInnerH = aumH - aumPad.t - aumPad.b;
  const aumMin = 400;
  const aumMax = 1200;
  const toAX = (i: number) => aumPad.l + (i / (AUM_DATA.length - 1)) * aumInnerW;
  const toAY = (v: number) =>
    aumPad.t + (1 - (v - aumMin) / (aumMax - aumMin)) * aumInnerH;
  const aumPath = AUM_DATA.map((v, i) => `${i === 0 ? "M" : "L"}${toAX(i)},${toAY(v)}`).join(" ");
  const aumFill = `${aumPath} L${toAX(AUM_DATA.length - 1)},${aumPad.t + aumInnerH} L${toAX(0)},${aumPad.t + aumInnerH} Z`;

  const segmentColors: Record<string, string> = {
    Economic: "#3b82f6",
    Energy: "#22c55e",
    Digital: "#a78bfa",
    Social: "#f43f5e",
  };
  const segments = [
    { name: "Economic", x: 20, w: 160, icons: "🛣️ ✈️ ⚡" },
    { name: "Energy", x: 195, w: 160, icons: "🌿 ☀️ 🔋" },
    { name: "Digital", x: 370, w: 150, icons: "📡 🖥️ 🌐" },
    { name: "Social", x: 535, w: 145, icons: "💧 🏥 🏫" },
  ];

  return (
    <div className="space-y-8">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Global Infra AUM" value="$1.1T" sub="2024 estimate" highlight="pos" />
        <StatCard label="Annual Gap" value="$2.3T" sub="vs. investment needed" highlight="neg" />
        <StatCard label="Core Target Return" value="8–10%" sub="Net IRR" highlight="neutral" />
        <StatCard label="Avg Inflation Link" value="85%" sub="of revenues CPI-linked" highlight="pos" />
      </div>

      {/* Taxonomy SVG */}
      <div>
        <SectionTitle>
          <Layers size={14} /> Infrastructure Taxonomy
        </SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 overflow-x-auto">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-2xl mx-auto" style={{ minWidth: 500 }}>
            {/* Title */}
            <text x={svgW / 2} y={22} textAnchor="middle" fill="#e2e8f0" fontSize={13} fontWeight={600}>
              Infrastructure Asset Universe
            </text>
            {/* Segments */}
            {segments.map((seg) => (
              <g key={seg.name}>
                <rect
                  x={seg.x} y={38} width={seg.w} height={160}
                  rx={8}
                  fill={segmentColors[seg.name] + "22"}
                  stroke={segmentColors[seg.name]}
                  strokeWidth={1.5}
                />
                <rect
                  x={seg.x} y={38} width={seg.w} height={28}
                  rx={8}
                  fill={segmentColors[seg.name] + "55"}
                />
                <text
                  x={seg.x + seg.w / 2} y={57}
                  textAnchor="middle" fill={segmentColors[seg.name]}
                  fontSize={11} fontWeight={700}
                >
                  {seg.name}
                </text>
                <text
                  x={seg.x + seg.w / 2} y={90}
                  textAnchor="middle" fill="#94a3b8"
                  fontSize={18}
                >
                  {seg.icons.split(" ")[0]}
                </text>
                <text
                  x={seg.x + seg.w / 2} y={120}
                  textAnchor="middle" fill="#94a3b8"
                  fontSize={18}
                >
                  {seg.icons.split(" ")[1]}
                </text>
                <text
                  x={seg.x + seg.w / 2} y={150}
                  textAnchor="middle" fill="#94a3b8"
                  fontSize={18}
                >
                  {seg.icons.split(" ")[2]}
                </text>
                <text
                  x={seg.x + seg.w / 2} y={178}
                  textAnchor="middle" fill="#64748b"
                  fontSize={8.5}
                >
                  {seg.name === "Economic"
                    ? "Roads · Airports · Utilities"
                    : seg.name === "Energy"
                    ? "Solar · Wind · Storage"
                    : seg.name === "Digital"
                    ? "Towers · Data Ctrs · Fiber"
                    : "Water · Hospitals · Schools"}
                </text>
              </g>
            ))}
            {/* Core label */}
            <text x={svgW / 2} y={220} textAnchor="middle" fill="#64748b" fontSize={9}>
              Infrastructure = long-lived, essential, monopolistic assets with contracted or regulated cashflows
            </text>
          </svg>
        </div>
      </div>

      {/* Sub-sector cards */}
      <div>
        <SectionTitle>
          <Building2 size={14} /> Sub-Sector Deep Dive
        </SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SUB_SECTORS.map((sec) => (
            <motion.button
              key={sec.name}
              onClick={() => setSelectedSector(selectedSector === sec.name ? null : sec.name)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                selectedSector === sec.name
                  ? "border-primary/60 bg-primary/15"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              )}
            >
              <div className="text-2xl mb-1">{sec.icon}</div>
              <div className="text-sm font-semibold text-white">{sec.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{sec.segment}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-emerald-400 font-medium">{sec.yieldTarget}</span>
                <Badge
                  variant="outline"
                  className="text-xs py-0 px-1.5"
                  style={{ borderColor: sec.color + "80", color: sec.color }}
                >
                  {sec.risk}
                </Badge>
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected.name}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-3 rounded-xl border border-white/15 bg-white/5 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{selected.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{selected.name}</span>
                    <Badge variant="outline" className="text-xs">{selected.segment}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selected.desc}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    <span className="text-muted-foreground">Return target: <span className="text-emerald-400 font-medium">{selected.yieldTarget}</span></span>
                    <span className="text-muted-foreground">Inflation link: <span className="text-primary">{selected.inflationLink}</span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Two charts side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AUM Growth */}
        <div>
          <SectionTitle>
            <TrendingUp size={14} /> Global Infrastructure AUM 2015–2024
          </SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <svg viewBox={`0 0 ${aumW} ${aumH}`} className="w-full">
              {/* Grid */}
              {[400, 600, 800, 1000, 1200].map((v) => (
                <g key={v}>
                  <line
                    x1={aumPad.l} x2={aumW - aumPad.r}
                    y1={toAY(v)} y2={toAY(v)}
                    stroke="#ffffff18" strokeWidth={1}
                  />
                  <text x={aumPad.l - 6} y={toAY(v) + 4} textAnchor="end" fill="#64748b" fontSize={9}>
                    {fmtB(v)}
                  </text>
                </g>
              ))}
              {/* Fill */}
              <path d={aumFill} fill="#3b82f620" />
              {/* Line */}
              <path d={aumPath} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {/* Points */}
              {AUM_DATA.map((v, i) => (
                <circle key={i} cx={toAX(i)} cy={toAY(v)} r={3} fill="#3b82f6" />
              ))}
              {/* X axis labels */}
              {AUM_YEARS.filter((_, i) => i % 2 === 0).map((yr, idx) => {
                const i = idx * 2;
                return (
                  <text key={yr} x={toAX(i)} y={aumPad.t + aumInnerH + 16} textAnchor="middle" fill="#64748b" fontSize={9}>
                    {yr}
                  </text>
                );
              })}
              {/* Labels */}
              <text x={toAX(0)} y={toAY(500) - 8} fill="#3b82f6" fontSize={9} fontWeight={600}>$500B</text>
              <text x={toAX(9)} y={toAY(1100) - 8} fill="#22c55e" fontSize={9} fontWeight={600}>$1.1T</text>
              <text
                x={aumW / 2} y={aumH - 4}
                textAnchor="middle" fill="#64748b" fontSize={8}
              >
                Source: Preqin / McKinsey Global Infrastructure Report
              </text>
            </svg>
          </div>
        </div>

        {/* Return/Volatility Scatter */}
        <div>
          <SectionTitle>
            <Activity size={14} /> Return vs Volatility Scatter
          </SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <svg viewBox={`0 0 ${scW} ${scH}`} className="w-full">
              {/* Grid */}
              {[5, 8, 11, 14, 17].map((v) => (
                <g key={v}>
                  <line
                    x1={scPad.l} x2={scW - scPad.r}
                    y1={toSY(v)} y2={toSY(v)}
                    stroke="#ffffff15" strokeWidth={1}
                  />
                  <text x={scPad.l - 6} y={toSY(v) + 4} textAnchor="end" fill="#64748b" fontSize={9}>
                    {v}%
                  </text>
                </g>
              ))}
              {[5, 10, 15, 20].map((v) => (
                <g key={v}>
                  <line
                    x1={toSX(v)} x2={toSX(v)}
                    y1={scPad.t} y2={scPad.t + scInnerH}
                    stroke="#ffffff15" strokeWidth={1}
                  />
                  <text x={toSX(v)} y={scPad.t + scInnerH + 14} textAnchor="middle" fill="#64748b" fontSize={9}>
                    {v}%
                  </text>
                </g>
              ))}
              {/* Axis labels */}
              <text x={scW / 2} y={scH - 2} textAnchor="middle" fill="#94a3b8" fontSize={9}>Volatility (Annualized)</text>
              <text
                x={12} y={scH / 2}
                textAnchor="middle" fill="#94a3b8" fontSize={9}
                transform={`rotate(-90, 12, ${scH / 2})`}
              >
                Return
              </text>
              {/* Points */}
              {SCATTER_DATA.map((pt) => (
                <g key={pt.name}>
                  <circle
                    cx={toSX(pt.vol)} cy={toSY(pt.ret)} r={6}
                    fill={pt.color + "90"} stroke={pt.color} strokeWidth={1.5}
                  />
                  <text
                    x={toSX(pt.vol) + 8} y={toSY(pt.ret) + 4}
                    fill={pt.color} fontSize={8} fontWeight={600}
                  >
                    {pt.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Risk tier table */}
      <div>
        <SectionTitle>
          <Shield size={14} /> Return Targets by Risk Tier
        </SectionTitle>
        <div className="space-y-3">
          {RISK_TIERS.map((tier) => (
            <div
              key={tier.tier}
              className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center gap-3"
            >
              <div className="flex items-center gap-3 min-w-[160px]">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tier.color }}
                />
                <span className="font-semibold text-white">{tier.tier}</span>
                <span className="text-xs font-bold" style={{ color: tier.color }}>
                  {tier.returnTarget}
                </span>
              </div>
              <div className="flex-1 text-sm text-muted-foreground">{tier.desc}</div>
              <div className="flex flex-col gap-1 text-xs text-right">
                <span className="text-muted-foreground">Leverage: <span className="text-muted-foreground">{tier.leverage}</span></span>
                <span className="text-muted-foreground text-xs">{tier.examples}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inflation linkage */}
      <div>
        <SectionTitle>
          <TrendingUp size={14} /> Inflation-Linkage Mechanisms
        </SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <InfoBox variant="blue">
            <div className="font-semibold mb-1">CPI-Indexed Tariffs</div>
            Revenue automatically adjusted to CPI or CPI+X. Common in toll roads, water utilities, and airports. Provides direct inflation pass-through to investors.
          </InfoBox>
          <InfoBox variant="emerald">
            <div className="font-semibold mb-1">Concession Agreements</div>
            Long-term government-granted rights (20–99 years) with embedded escalation clauses. Contractual certainty insulates against short-term macro volatility.
          </InfoBox>
          <InfoBox variant="purple">
            <div className="font-semibold mb-1">Regulated Asset Base (RAB)</div>
            Regulator sets allowed return on invested capital (WACC). Asset base revalued with inflation, preserving real value. Used in UK water, energy networks.
          </InfoBox>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Project Finance ────────────────────────────────────────────────────

const PPP_MODELS = [
  {
    name: "BOT",
    full: "Build-Operate-Transfer",
    desc: "Private sector builds and operates for concession period, then transfers to government. Revenue via user fees.",
    riskBearing: "Private",
    color: "#3b82f6",
  },
  {
    name: "DBFOM",
    full: "Design-Build-Finance-Operate-Maintain",
    desc: "Fully integrated delivery where private party handles lifecycle. Most comprehensive risk transfer model.",
    riskBearing: "Private",
    color: "#6366f1",
  },
  {
    name: "Availability",
    full: "Availability Payment",
    desc: "Government pays periodic fee when asset meets availability standards. No demand/volume risk for private party.",
    riskBearing: "Shared",
    color: "#22c55e",
  },
];

const DUE_DILIGENCE = [
  { item: "Technical due diligence", icon: "🔧", detail: "EPC contractor capability, design review, construction schedule" },
  { item: "Financial model audit", icon: "📊", detail: "DSCR sensitivity, downside scenarios, base/bear/stress cases" },
  { item: "Market study", icon: "📈", detail: "Traffic/demand forecasts, competitive analysis, tariff benchmarking" },
  { item: "Legal review", icon: "⚖️", detail: "Concession agreement, permits, environmental approvals, title" },
  { item: "Insurance review", icon: "🛡️", detail: "Construction all-risk, operating, liability, business interruption" },
  { item: "Environmental & social", icon: "🌱", detail: "ESHS framework, IFC Performance Standards compliance" },
  { item: "Sponsor assessment", icon: "👥", detail: "Track record, financial capacity, equity commitment" },
  { item: "Offtake analysis", icon: "📋", detail: "Counterparty credit quality, contract tenor, termination provisions" },
];

const RESERVE_ACCOUNTS = [
  { name: "DSRA", full: "Debt Service Reserve Account", months: "6 months", purpose: "Covers senior debt service shortfalls during cashflow stress" },
  { name: "MRA", full: "Major Maintenance Reserve Account", months: "12-24 months", purpose: "Funds capital expenditure for asset lifecycle maintenance" },
  { name: "LLCRA", full: "Loss of Revenue / Liquidated Damages Reserve", months: "3-6 months", purpose: "Funded from EPC contractor LDs for construction delay compensation" },
];

function ProjectFinanceTab() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  // SPV structure SVG
  const spvW = 620;
  const spvH = 320;

  // Construction vs Operations risk SVG
  const phW = 560;
  const phH = 200;

  return (
    <div className="space-y-8">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Min DSCR Covenant" value="1.25x" sub="Typical senior lender requirement" highlight="neutral" />
        <StatCard label="Typical Leverage" value="65–75%" sub="Senior debt / total capital" highlight="neutral" />
        <StatCard label="Non-Recourse Debt" value="100%" sub="Lenders limited to project cashflows" highlight="pos" />
        <StatCard label="Avg Concession Tenor" value="25–35 yrs" sub="BOT / DBFOM structures" highlight="neutral" />
      </div>

      {/* SPV Structure SVG */}
      <div>
        <SectionTitle>
          <Layers size={14} /> SPV / Project Finance Structure
        </SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 overflow-x-auto">
          <svg viewBox={`0 0 ${spvW} ${spvH}`} className="w-full" style={{ minWidth: 480 }}>
            {/* Equity Sponsors */}
            <rect x={10} y={10} width={110} height={50} rx={8} fill="#6366f120" stroke="#6366f1" strokeWidth={1.5} />
            <text x={65} y={32} textAnchor="middle" fill="#a78bfa" fontSize={10} fontWeight={700}>Equity Sponsors</text>
            <text x={65} y={48} textAnchor="middle" fill="#6366f1" fontSize={8}>25–35% of capital</text>

            <rect x={130} y={10} width={110} height={50} rx={8} fill="#6366f120" stroke="#6366f1" strokeWidth={1.5} />
            <text x={185} y={32} textAnchor="middle" fill="#a78bfa" fontSize={10} fontWeight={700}>Mezzanine</text>
            <text x={185} y={48} textAnchor="middle" fill="#6366f1" fontSize={8}>0–15% of capital</text>

            {/* Senior Lenders */}
            <rect x={250} y={10} width={130} height={50} rx={8} fill="#3b82f620" stroke="#3b82f6" strokeWidth={1.5} />
            <text x={315} y={32} textAnchor="middle" fill="#93c5fd" fontSize={10} fontWeight={700}>Senior Lenders</text>
            <text x={315} y={48} textAnchor="middle" fill="#3b82f6" fontSize={8}>60–75% of capital</text>

            {/* Government */}
            <rect x={400} y={10} width={110} height={50} rx={8} fill="#22c55e20" stroke="#22c55e" strokeWidth={1.5} />
            <text x={455} y={32} textAnchor="middle" fill="#86efac" fontSize={10} fontWeight={700}>Government</text>
            <text x={455} y={48} textAnchor="middle" fill="#22c55e" fontSize={8}>Concession grantor</text>

            {/* Arrows to SPV */}
            <line x1={65} y1={60} x2={240} y2={130} stroke="#6366f160" strokeWidth={1.5} strokeDasharray="4,3" />
            <line x1={185} y1={60} x2={245} y2={130} stroke="#6366f160" strokeWidth={1.5} strokeDasharray="4,3" />
            <line x1={315} y1={60} x2={285} y2={130} stroke="#3b82f660" strokeWidth={1.5} strokeDasharray="4,3" />
            <line x1={455} y1={60} x2={310} y2={130} stroke="#22c55e60" strokeWidth={1.5} strokeDasharray="4,3" />

            {/* SPV Box */}
            <rect x={200} y={120} width={160} height={60} rx={10} fill="#f59e0b25" stroke="#f59e0b" strokeWidth={2} />
            <text x={280} y={147} textAnchor="middle" fill="#fbbf24" fontSize={12} fontWeight={700}>Project Co (SPV)</text>
            <text x={280} y={162} textAnchor="middle" fill="#f59e0b" fontSize={8}>Non-recourse ring-fence</text>
            <text x={280} y={174} textAnchor="middle" fill="#94a3b8" fontSize={7.5}>Borrower · Employer · Asset Owner</text>

            {/* Contracts below */}
            <line x1={245} y1={180} x2={80} y2={235} stroke="#94a3b840" strokeWidth={1.5} />
            <line x1={260} y1={180} x2={180} y2={235} stroke="#94a3b840" strokeWidth={1.5} />
            <line x1={295} y1={180} x2={310} y2={235} stroke="#94a3b840" strokeWidth={1.5} />
            <line x1={315} y1={180} x2={460} y2={235} stroke="#94a3b840" strokeWidth={1.5} />

            {[
              { x: 20, label: "EPC Contract", sub: "Fixed-price, turnkey" },
              { x: 130, label: "O&M Contract", sub: "Operations & maintenance" },
              { x: 265, label: "Offtake / PPA", sub: "Revenue certainty" },
              { x: 400, label: "Fuel Supply", sub: "Input cost stability" },
            ].map(({ x, label, sub }) => (
              <g key={label}>
                <rect x={x} y={235} width={110} height={48} rx={6} fill="#ffffff08" stroke="#ffffff20" strokeWidth={1} />
                <text x={x + 55} y={254} textAnchor="middle" fill="#cbd5e1" fontSize={9} fontWeight={600}>{label}</text>
                <text x={x + 55} y={269} textAnchor="middle" fill="#64748b" fontSize={7.5}>{sub}</text>
                <text x={x + 55} y={278} textAnchor="middle" fill="#475569" fontSize={7}>↓ risk mitigation</text>
              </g>
            ))}

            {/* DSCR label */}
            <text x={spvW - 10} y={spvH - 8} textAnchor="end" fill="#64748b" fontSize={8}>
              All debt service flows only from project cashflows — no recourse to sponsors
            </text>
          </svg>
        </div>
      </div>

      {/* Construction vs Operations phase */}
      <div>
        <SectionTitle>
          <Activity size={14} /> Construction vs Operations Phase Risk
        </SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 overflow-x-auto">
          <svg viewBox={`0 0 ${phW} ${phH}`} className="w-full" style={{ minWidth: 400 }}>
            {/* Phase blocks */}
            <rect x={10} y={20} width={220} height={100} rx={8} fill="#f43f5e18" stroke="#f43f5e" strokeWidth={1.5} />
            <text x={120} y={42} textAnchor="middle" fill="#f43f5e" fontSize={11} fontWeight={700}>Construction Phase</text>
            <text x={120} y={58} textAnchor="middle" fill="#fca5a5" fontSize={8.5}>Typical: 2–5 years</text>
            {["Cost overrun risk", "Delay / liquidated damages", "Technology / design risk", "Permitting & regulatory"].map((t, i) => (
              <text key={t} x={30} y={75 + i * 13} fill="#94a3b8" fontSize={8}>• {t}</text>
            ))}

            <rect x={250} y={20} width={290} height={100} rx={8} fill="#22c55e18" stroke="#22c55e" strokeWidth={1.5} />
            <text x={395} y={42} textAnchor="middle" fill="#22c55e" fontSize={11} fontWeight={700}>Operations Phase</text>
            <text x={395} y={58} textAnchor="middle" fill="#86efac" fontSize={8.5}>Typical: 20–35 years</text>
            {["Contracted/regulated revenue", "O&M cost management", "Major maintenance capex", "Counterparty credit"].map((t, i) => (
              <text key={t} x={265} y={75 + i * 13} fill="#94a3b8" fontSize={8}>• {t}</text>
            ))}

            {/* Transition arrow */}
            <text x={230} y={72} textAnchor="middle" fill="#f59e0b" fontSize={18}>→</text>
            <text x={230} y={86} textAnchor="middle" fill="#f59e0b" fontSize={7.5}>COD</text>

            {/* Risk bar */}
            <text x={10} y={148} fill="#64748b" fontSize={8.5} fontWeight={600}>RISK LEVEL:</text>
            <rect x={80} y={138} width={140} height={14} rx={3} fill="#f43f5e90" />
            <text x={150} y={149} textAnchor="middle" fill="#fff" fontSize={7.5} fontWeight={700}>HIGH</text>
            <rect x={250} y={138} width={290} height={14} rx={3} fill="#22c55e90" />
            <text x={395} y={149} textAnchor="middle" fill="#fff" fontSize={7.5} fontWeight={700}>MODERATE → LOW</text>

            <text x={phW / 2} y={180} textAnchor="middle" fill="#64748b" fontSize={7.5}>
              EPC contractor absorbs construction risk via fixed-price contract and performance guarantees
            </text>
          </svg>
        </div>
      </div>

      {/* DSCR mechanics */}
      <div>
        <SectionTitle>
          <BarChart3 size={14} /> DSCR Covenant Mechanics
        </SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InfoBox variant="blue">
            <div className="font-semibold mb-1">Debt Service Coverage Ratio (DSCR)</div>
            <div className="font-mono bg-black/20 rounded p-2 my-2 text-center text-base">
              DSCR = CFADS / Debt Service
            </div>
            CFADS = Cash Flow Available for Debt Service (EBITDA minus taxes, capex, working capital). Lenders typically require minimum 1.20–1.30x. Lock-up typically triggers at 1.10x — distributions blocked until ratio recovers.
          </InfoBox>
          <InfoBox variant="amber">
            <div className="font-semibold mb-1">Covenant Cascade</div>
            <div className="space-y-1 mt-1">
              {[
                { level: "≥ 1.30x", status: "Cash sweep / equity distribution permitted", color: "#22c55e" },
                { level: "1.20–1.30x", status: "Distributions restricted; DSRA top-up required", color: "#f59e0b" },
                { level: "1.10–1.20x", status: "Lock-up; no distributions; cure plan required", color: "#f97316" },
                { level: "< 1.10x", status: "Potential event of default; lender step-in rights", color: "#f43f5e" },
              ].map((row) => (
                <div key={row.level} className="flex gap-2 items-start">
                  <span className="font-mono text-xs min-w-[70px]" style={{ color: row.color }}>{row.level}</span>
                  <span className="text-xs text-muted-foreground">{row.status}</span>
                </div>
              ))}
            </div>
          </InfoBox>
        </div>
      </div>

      {/* Reserve Accounts */}
      <div>
        <SectionTitle>
          <Lock size={14} /> Reserve Accounts
        </SectionTitle>
        <div className="grid md:grid-cols-3 gap-3">
          {RESERVE_ACCOUNTS.map((ra) => (
            <div key={ra.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono text-xs">{ra.name}</Badge>
                <span className="text-xs text-muted-foreground">{ra.months}</span>
              </div>
              <div className="text-xs font-semibold text-foreground mb-1">{ra.full}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{ra.purpose}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PPP Models */}
      <div>
        <SectionTitle>
          <FileText size={14} /> PPP Concession Models
        </SectionTitle>
        <div className="grid md:grid-cols-3 gap-3">
          {PPP_MODELS.map((m) => (
            <div key={m.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge style={{ backgroundColor: m.color + "33", borderColor: m.color + "66", color: m.color }}>
                  {m.name}
                </Badge>
                <span className={cn("text-xs", m.riskBearing === "Private" ? "text-rose-400" : "text-amber-400")}>
                  {m.riskBearing} risk
                </span>
              </div>
              <div className="text-xs font-semibold text-foreground mb-1">{m.full}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Due Diligence Checklist */}
      <div>
        <SectionTitle>
          <CheckCircle size={14} /> Lender Due Diligence Checklist
        </SectionTitle>
        <div className="grid md:grid-cols-2 gap-2">
          {DUE_DILIGENCE.map((item) => (
            <button
              key={item.item}
              onClick={() => setExpandedPhase(expandedPhase === item.item ? null : item.item)}
              className="rounded-lg border border-white/10 bg-white/5 p-3 text-left hover:border-white/20 transition-colors flex items-start gap-2"
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <div className="flex-1">
                <div className="text-sm text-foreground">{item.item}</div>
                <AnimatePresence>
                  {expandedPhase === item.item && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-muted-foreground mt-1 overflow-hidden"
                    >
                      {item.detail}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {expandedPhase === item.item ? (
                <ChevronUp size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              ) : (
                <ChevronDown size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Energy Transition ──────────────────────────────────────────────────

// LCOE data ($/MWh) by year index 0=2010 to 14=2024
const LCOE_DATA: Record<string, number[]> = {
  "Offshore Wind": [180, 165, 155, 148, 140, 130, 120, 108, 98, 90, 82, 75, 68, 62, 57],
  "Onshore Wind": [90, 85, 80, 75, 68, 62, 58, 53, 48, 45, 41, 38, 35, 33, 31],
  "Utility Solar": [280, 230, 180, 140, 100, 78, 65, 52, 44, 36, 30, 25, 22, 20, 18],
};

// Battery storage cost curve $/kWh
const BATTERY_DATA = [1000, 920, 800, 650, 500, 380, 280, 210, 165, 130, 110, 98, 90, 85, 80]; // 2010-2024; target ~$60-100 by 2030

// Opportunity sizing $B
const OPPORTUNITY_SIZING = [
  { name: "Solar PV", value: 620, color: "#f59e0b" },
  { name: "Wind (on+off)", value: 840, color: "#22c55e" },
  { name: "Battery Storage", value: 310, color: "#6366f1" },
  { name: "Transmission", value: 480, color: "#0ea5e9" },
  { name: "Green Hydrogen", value: 180, color: "#a78bfa" },
  { name: "Other Cleantech", value: 120, color: "#94a3b8" },
];

const POLICY_SUPPORT = [
  {
    name: "IRA Tax Credits (US)",
    type: "Tax Incentive",
    detail: "$369B in clean energy incentives. Production Tax Credit (PTC) $27.5/MWh and Investment Tax Credit (ITC) 30%+. Transferable and direct-pay provisions.",
    color: "#3b82f6",
  },
  {
    name: "Contracts for Difference (UK/EU)",
    type: "Revenue Support",
    detail: "Government guarantees a 'strike price' for electricity. Generator receives top-up when market price < strike, repays when above. Eliminates merchant price risk.",
    color: "#22c55e",
  },
  {
    name: "Capacity Markets",
    type: "Reliability Payment",
    detail: "Grid operators pay generators for available capacity regardless of dispatch. Critical for storage, backup, and peaking plants. Provides base revenue floor.",
    color: "#f59e0b",
  },
  {
    name: "Renewable Portfolio Standards",
    type: "Mandate",
    detail: "State/federal mandates requiring utilities to source fixed % of electricity from renewables. Creates guaranteed demand for clean energy, supports PPA pricing.",
    color: "#a78bfa",
  },
];

function EnergyTransitionTab() {
  // LCOE chart
  const lcoeW = 560;
  const lcoeH = 260;
  const lcoePad = { l: 55, r: 20, t: 20, b: 40 };
  const lcoeInnerW = lcoeW - lcoePad.l - lcoePad.r;
  const lcoeInnerH = lcoeH - lcoePad.t - lcoePad.b;
  const lcoeYears = Array.from({ length: 15 }, (_, i) => 2010 + i);
  const lcoeMin = 0;
  const lcoeMax = 320;
  const toLX = (i: number) => lcoePad.l + (i / 14) * lcoeInnerW;
  const toLY = (v: number) =>
    lcoePad.t + (1 - (v - lcoeMin) / (lcoeMax - lcoeMin)) * lcoeInnerH;
  const lcoeColors: Record<string, string> = {
    "Offshore Wind": "#0ea5e9",
    "Onshore Wind": "#22c55e",
    "Utility Solar": "#f59e0b",
  };

  // Battery chart
  const batW = 420;
  const batH = 220;
  const batPad = { l: 60, r: 20, t: 20, b: 40 };
  const batInnerW = batW - batPad.l - batPad.r;
  const batInnerH = batH - batPad.t - batPad.b;
  const batMin = 0;
  const batMax = 1100;
  const toBX = (i: number) => batPad.l + (i / (BATTERY_DATA.length - 1)) * batInnerW;
  const toBY = (v: number) =>
    batPad.t + (1 - (v - batMin) / (batMax - batMin)) * batInnerH;
  const batPath = BATTERY_DATA.map((v, i) => `${i === 0 ? "M" : "L"}${toBX(i)},${toBY(v)}`).join(" ");
  const batFill = `${batPath} L${toBX(BATTERY_DATA.length - 1)},${batPad.t + batInnerH} L${toBX(0)},${batPad.t + batInnerH} Z`;

  // Opportunity bar chart
  const oppTotal = OPPORTUNITY_SIZING.reduce((a, b) => a + b.value, 0);
  const oppW = 400;
  const oppH = 220;
  const oppPad = { l: 110, r: 60, t: 20, b: 20 };
  const oppInnerW = oppW - oppPad.l - oppPad.r;
  const barH = 24;
  const barGap = 8;

  return (
    <div className="space-y-8">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Annual Investment Needed" value="$4.0T" sub="To meet net-zero by 2050" highlight="neg" />
        <StatCard label="Current Annual Investment" value="$1.7T" sub="2024 clean energy spend" highlight="neutral" />
        <StatCard label="Funding Gap" value="$2.3T" sub="Per year through 2030" highlight="neg" />
        <StatCard label="Solar LCOE Decline" value="-94%" sub="2010 → 2024 ($/MWh)" highlight="pos" />
      </div>

      <InfoBox variant="amber">
        <div className="font-semibold mb-1">The Energy Transition Investment Imperative</div>
        The IEA estimates $4T/year in clean energy investment is required by 2030 to keep global warming below 1.5°C. Current annual spend of ~$1.7T leaves a $2.3T gap — representing the single largest infrastructure opportunity in history. Private capital must fill what public budgets cannot.
      </InfoBox>

      {/* LCOE Convergence chart */}
      <div>
        <SectionTitle>
          <Sun size={14} /> LCOE Convergence: Renewables vs. Conventional ($/MWh)
        </SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 overflow-x-auto">
          <svg viewBox={`0 0 ${lcoeW} ${lcoeH}`} className="w-full" style={{ minWidth: 420 }}>
            {/* Grid */}
            {[0, 50, 100, 150, 200, 250, 300].map((v) => (
              <g key={v}>
                <line
                  x1={lcoePad.l} x2={lcoeW - lcoePad.r}
                  y1={toLY(v)} y2={toLY(v)}
                  stroke="#ffffff15" strokeWidth={1}
                />
                <text x={lcoePad.l - 6} y={toLY(v) + 4} textAnchor="end" fill="#64748b" fontSize={9}>
                  ${v}
                </text>
              </g>
            ))}
            {/* Natural gas reference line */}
            <line
              x1={lcoePad.l} x2={lcoeW - lcoePad.r}
              y1={toLY(60)} y2={toLY(60)}
              stroke="#f43f5e50" strokeWidth={1.5} strokeDasharray="6,4"
            />
            <text x={lcoeW - lcoePad.r + 2} y={toLY(60) + 4} fill="#f43f5e" fontSize={8}>CCGT~$60</text>

            {/* Lines */}
            {Object.entries(LCOE_DATA).map(([name, vals]) => {
              const path = vals.map((v, i) => `${i === 0 ? "M" : "L"}${toLX(i)},${toLY(v)}`).join(" ");
              return (
                <path
                  key={name}
                  d={path}
                  fill="none"
                  stroke={lcoeColors[name]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* X axis */}
            {lcoeYears.filter((_, i) => i % 2 === 0).map((yr, idx) => {
              const i = idx * 2;
              return (
                <text key={yr} x={toLX(i)} y={lcoePad.t + lcoeInnerH + 16} textAnchor="middle" fill="#64748b" fontSize={9}>
                  {yr}
                </text>
              );
            })}

            {/* Legend */}
            {Object.entries(lcoeColors).map(([name, color], idx) => (
              <g key={name}>
                <line
                  x1={lcoePad.l + idx * 140} x2={lcoePad.l + idx * 140 + 20}
                  y1={lcoeH - 6} y2={lcoeH - 6}
                  stroke={color} strokeWidth={2.5}
                />
                <text x={lcoePad.l + idx * 140 + 24} y={lcoeH - 2} fill={color} fontSize={8.5} fontWeight={600}>
                  {name}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Two charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Battery cost curve */}
        <div>
          <SectionTitle>
            <Zap size={14} /> Battery Storage Cost Curve ($/kWh)
          </SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <svg viewBox={`0 0 ${batW} ${batH}`} className="w-full">
              {[0, 200, 400, 600, 800, 1000].map((v) => (
                <g key={v}>
                  <line
                    x1={batPad.l} x2={batW - batPad.r}
                    y1={toBY(v)} y2={toBY(v)}
                    stroke="#ffffff15" strokeWidth={1}
                  />
                  <text x={batPad.l - 6} y={toBY(v) + 4} textAnchor="end" fill="#64748b" fontSize={9}>
                    ${v}
                  </text>
                </g>
              ))}
              <path d={batFill} fill="#6366f115" />
              <path d={batPath} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {BATTERY_DATA.filter((_, i) => i % 3 === 0).map((v, idx) => (
                <circle key={idx} cx={toBX(idx * 3)} cy={toBY(v)} r={3} fill="#6366f1" />
              ))}
              {/* Target 2030 */}
              <line
                x1={batW - batPad.r} x2={batW - batPad.r + 5}
                y1={toBY(80)} y2={toBY(80)}
                stroke="#22c55e" strokeWidth={1.5} strokeDasharray="3,2"
              />
              {[2010, 2015, 2020, 2024].map((yr) => {
                const i = yr - 2010;
                return (
                  <text key={yr} x={toBX(i)} y={batPad.t + batInnerH + 16} textAnchor="middle" fill="#64748b" fontSize={8.5}>
                    {yr}
                  </text>
                );
              })}
              <text x={batPad.l + 10} y={toBY(1000) - 5} fill="#6366f1" fontSize={8} fontWeight={700}>$1,000/kWh (2010)</text>
              <text x={toBX(14) - 5} y={toBY(80) - 6} fill="#22c55e" fontSize={8} fontWeight={700} textAnchor="end">~$80/kWh (2024)</text>
              <text x={batW / 2} y={batH - 4} textAnchor="middle" fill="#64748b" fontSize={7.5}>
                92% cost reduction in 14 years — grid parity achieved in most markets
              </text>
            </svg>
          </div>
        </div>

        {/* Opportunity sizing */}
        <div>
          <SectionTitle>
            <Globe size={14} /> Annual Investment Opportunity Sizing ($B)
          </SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <svg viewBox={`0 0 ${oppW} ${oppH}`} className="w-full">
              {OPPORTUNITY_SIZING.map((item, i) => {
                const barWidth = (item.value / 1000) * oppInnerW;
                const y = oppPad.t + i * (barH + barGap);
                return (
                  <g key={item.name}>
                    <text x={oppPad.l - 6} y={y + barH / 2 + 4} textAnchor="end" fill="#94a3b8" fontSize={9.5}>
                      {item.name}
                    </text>
                    <rect x={oppPad.l} y={y} width={barWidth} height={barH} rx={4} fill={item.color + "90"} />
                    <rect x={oppPad.l} y={y} width={barWidth} height={barH} rx={4} fill="none" stroke={item.color} strokeWidth={1} />
                    <text x={oppPad.l + barWidth + 6} y={y + barH / 2 + 4} fill={item.color} fontSize={9} fontWeight={700}>
                      ${item.value}B
                    </text>
                  </g>
                );
              })}
              <text x={oppPad.l} y={oppH - 5} fill="#64748b" fontSize={7.5}>
                Total addressable: ${oppTotal}B/yr — IEA Net Zero Scenario
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Policy support */}
      <div>
        <SectionTitle>
          <Shield size={14} /> Policy Support Mechanisms
        </SectionTitle>
        <div className="grid md:grid-cols-2 gap-3">
          {POLICY_SUPPORT.map((policy) => (
            <div key={policy.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-white">{policy.name}</span>
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: policy.color + "80", color: policy.color }}
                >
                  {policy.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{policy.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demand growth + stranded asset risk */}
      <div className="grid md:grid-cols-2 gap-4">
        <InfoBox variant="emerald">
          <div className="font-semibold mb-2">New Demand Centers</div>
          <div className="space-y-1">
            {[
              { label: "Data Centers", detail: "AI buildout driving 30% annual power demand growth" },
              { label: "EV Charging", detail: "250M EVs by 2030 need ~$100B in charging infrastructure" },
              { label: "Green Hydrogen", detail: "Electrolyzers require co-located renewable generation" },
              { label: "Industrial Heat", detail: "Electrification of industrial processes (steel, cement)" },
            ].map((item) => (
              <div key={item.label} className="flex gap-2 text-xs">
                <span className="font-medium text-emerald-300 min-w-[110px]">{item.label}</span>
                <span className="text-muted-foreground">{item.detail}</span>
              </div>
            ))}
          </div>
        </InfoBox>
        <InfoBox variant="amber">
          <div className="font-semibold mb-2">Stranded Asset Risk (Fossil Fuel)</div>
          <p className="text-xs leading-relaxed mb-2">
            Coal-fired power plants face 15–30 year asset life curtailments. Pipelines dependent on fossil fuel volumes face declining utilization. Gas distribution networks may face regulated writedowns as building electrification accelerates.
          </p>
          <div className="text-xs font-medium text-amber-200">
            Estimated stranded asset exposure: $1.4T globally by 2030 (IRENA)
          </div>
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 4: Institutional Allocation ──────────────────────────────────────────

const FUND_MANAGERS = [
  { name: "Macquarie Asset Mgmt", aum: 210, focus: "Diversified; utilities, transport, energy", hq: "Sydney", color: "#f59e0b" },
  { name: "Brookfield Infra", aum: 185, focus: "Renewables, utilities, transport, data", hq: "Toronto", color: "#3b82f6" },
  { name: "GIP (BlackRock)", aum: 150, focus: "Energy, transport, digital", hq: "New York", color: "#22c55e" },
  { name: "KKR Infrastructure", aum: 78, focus: "Core+/value-add, energy transition", hq: "New York", color: "#6366f1" },
  { name: "Global Infra Partners", aum: 96, focus: "Airports, utilities, ports", hq: "New York", color: "#0ea5e9" },
];

const PENSION_ALLOC = [
  { fund: "CalPERS", country: "US", allocation: 3.2, target: 5.0, aum: 502 },
  { fund: "APG", country: "Netherlands", allocation: 8.5, target: 10.0, aum: 620 },
  { fund: "CPPIB", country: "Canada", allocation: 9.1, target: 10.0, aum: 575 },
  { fund: "OMERS", country: "Canada", allocation: 19.2, target: 20.0, aum: 124 },
  { fund: "Aware Super", country: "Australia", allocation: 12.4, target: 13.0, aum: 155 },
];

const LISTED_VS_UNLISTED = [
  { attribute: "Liquidity", listed: "High (daily)", unlisted: "Low (quarterly/annual)", winner: "listed" },
  { attribute: "Volatility", listed: "Higher (equity-correlated)", unlisted: "Lower (smoothed NAV)", winner: "unlisted" },
  { attribute: "Transparency", listed: "High (public reporting)", unlisted: "Limited (quarterly reports)", winner: "listed" },
  { attribute: "Fees", listed: "Low (0.1–0.5%)", unlisted: "High (1.5%+10%)", winner: "listed" },
  { attribute: "Access", listed: "Retail-accessible", unlisted: "Institutional only", winner: "listed" },
  { attribute: "Diversification", listed: "Lower (top 20 firms)", unlisted: "Broader (direct assets)", winner: "unlisted" },
  { attribute: "Inflation hedge", listed: "Diluted by equity risk", unlisted: "Stronger (direct linkage)", winner: "unlisted" },
  { attribute: "Value-add control", listed: "None", unlisted: "High (board seats, strategy)", winner: "unlisted" },
];

const BENCHMARK_INDICES = [
  { name: "EDHEC Infra 300", provider: "EDHEC", coverage: "300 unlisted infra companies", type: "Unlisted" },
  { name: "MSCI World Infra", provider: "MSCI", coverage: "Listed infra equities globally", type: "Listed" },
  { name: "FTSE Global Core Infra", provider: "FTSE Russell", coverage: "Listed, 50% infra revenue min", type: "Listed" },
  { name: "S&P Global Infra", provider: "S&P", coverage: "75 global listed infra companies", type: "Listed" },
];

function InstitutionalTab() {
  // J-curve SVG
  const jcW = 480;
  const jcH = 220;
  const jcPad = { l: 50, r: 30, t: 20, b: 40 };
  const jcInnerW = jcW - jcPad.l - jcPad.r;
  const jcInnerH = jcH - jcPad.t - jcPad.b;

  // Simulate J-curve cash flow profile: years 0-12
  const jcYears = 13;
  const jcData = [-100, -120, -90, -40, 20, 80, 150, 210, 270, 320, 360, 390, 410];
  const jcMin = -150;
  const jcMax = 450;
  const toJX = (i: number) => jcPad.l + (i / (jcYears - 1)) * jcInnerW;
  const toJY = (v: number) =>
    jcPad.t + (1 - (v - jcMin) / (jcMax - jcMin)) * jcInnerH;
  const jcPath = jcData.map((v, i) => `${i === 0 ? "M" : "L"}${toJX(i)},${toJY(v)}`).join(" ");
  const jcZeroY = toJY(0);

  // 60/40 correlation chart: approximate diversification
  const portScatter = [
    { name: "60/40 Portfolio", vol: 11.2, ret: 7.8, color: "#64748b" },
    { name: "+5% Listed Infra", vol: 10.6, ret: 8.1, color: "#0ea5e9" },
    { name: "+10% Unlisted Infra", vol: 9.8, ret: 8.6, color: "#22c55e" },
    { name: "+15% Unlisted Infra", vol: 9.2, ret: 9.0, color: "#f59e0b" },
  ] as const;
  const psW = 400;
  const psH = 240;
  const psPad = { l: 50, r: 20, t: 20, b: 40 };
  const psInnerW = psW - psPad.l - psPad.r;
  const psInnerH = psH - psPad.t - psPad.b;
  const psVolR = [8, 13];
  const psRetR = [7, 10];
  const toPSX = (v: number) => psPad.l + ((v - psVolR[0]) / (psVolR[1] - psVolR[0])) * psInnerW;
  const toPSY = (v: number) => psPad.t + (1 - (v - psRetR[0]) / (psRetR[1] - psRetR[0])) * psInnerH;

  return (
    <div className="space-y-8">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pension Fund Avg Allocation" value="6–12%" sub="of total AUM" highlight="neutral" />
        <StatCard label="Typical Fund Fee" value="1.5%+10%" sub="Management + carried interest" highlight="neutral" />
        <StatCard label="Infra/Equity Correlation" value="0.42" sub="Unlisted vs. public equities" highlight="pos" />
        <StatCard label="Investment Period" value="3–5 yrs" sub="Deployment phase" highlight="neutral" />
      </div>

      {/* Fund Managers */}
      <div>
        <SectionTitle>
          <Users size={14} /> Major Infrastructure Fund Managers
        </SectionTitle>
        <div className="space-y-2">
          {FUND_MANAGERS.map((fm) => (
            <div
              key={fm.name}
              className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center gap-3"
            >
              <div
                className="w-2 h-10 rounded flex-shrink-0 hidden md:block"
                style={{ backgroundColor: fm.color }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{fm.name}</span>
                  <span className="text-xs text-muted-foreground">{fm.hq}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{fm.focus}</div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-lg font-bold" style={{ color: fm.color }}>${fm.aum}B</div>
                <div className="text-xs text-muted-foreground">AUM</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pension allocation */}
        <div>
          <SectionTitle>
            <PiggyBank size={14} /> Pension Fund Infrastructure Allocations
          </SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            {PENSION_ALLOC.map((pf) => {
              const currentW = (pf.allocation / 25) * 100;
              const targetW = (pf.target / 25) * 100;
              return (
                <div key={pf.fund}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{pf.fund}</span>
                    <span className="text-muted-foreground">{pf.country} · ${pf.aum}B AUM</span>
                  </div>
                  <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/70 rounded-full"
                      style={{ width: `${currentW}%` }}
                    />
                    <div
                      className="absolute inset-y-0 border-r-2 border-dashed border-emerald-400"
                      style={{ left: `${targetW}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-0.5">
                    <span className="text-primary">Current: {fmtPct(pf.allocation)}</span>
                    <span className="text-emerald-400">Target: {fmtPct(pf.target)}</span>
                  </div>
                </div>
              );
            })}
            <div className="text-xs text-muted-foreground text-right pt-1">
              Dashed line = target allocation. Most funds under-allocated vs. target.
            </div>
          </div>
        </div>

        {/* J-curve */}
        <div>
          <SectionTitle>
            <TrendingDown size={14} /> J-Curve: Cumulative Capital Position
          </SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <svg viewBox={`0 0 ${jcW} ${jcH}`} className="w-full">
              {/* Grid */}
              {[-100, 0, 100, 200, 300, 400].map((v) => (
                <g key={v}>
                  <line
                    x1={jcPad.l} x2={jcW - jcPad.r}
                    y1={toJY(v)} y2={toJY(v)}
                    stroke={v === 0 ? "#ffffff40" : "#ffffff12"}
                    strokeWidth={v === 0 ? 1.5 : 1}
                  />
                  <text x={jcPad.l - 6} y={toJY(v) + 4} textAnchor="end" fill="#64748b" fontSize={9}>
                    {v > 0 ? `+${v}` : v}
                  </text>
                </g>
              ))}
              {/* Fill below zero (negative) */}
              {(() => {
                const negPoints = jcData
                  .map((v, i) => ({ v, i }))
                  .filter(({ v }) => v <= 0);
                if (negPoints.length === 0) return null;
                const lastNeg = negPoints[negPoints.length - 1];
                const firstPos = jcData.findIndex((v) => v > 0);
                // interpolate crossover
                const crossX =
                  firstPos > 0
                    ? toJX(lastNeg.i) +
                      ((0 - lastNeg.v) / (jcData[firstPos] - lastNeg.v)) *
                        (toJX(firstPos) - toJX(lastNeg.i))
                    : toJX(lastNeg.i);
                const negPath = negPoints.map(({ v, i }) => `L${toJX(i)},${toJY(v)}`).join(" ");
                return (
                  <path
                    d={`M${toJX(0)},${jcZeroY} ${negPath} L${crossX},${jcZeroY} Z`}
                    fill="#f43f5e20"
                  />
                );
              })()}
              {/* Fill above zero (positive) */}
              {(() => {
                const posStart = jcData.findIndex((v) => v > 0);
                if (posStart < 0) return null;
                const posPoints = jcData
                  .map((v, i) => ({ v, i }))
                  .filter(({ i }) => i >= posStart);
                const firstPos = posStart;
                const prevV = jcData[firstPos - 1];
                const crossX =
                  firstPos > 0
                    ? toJX(firstPos - 1) +
                      ((0 - prevV) / (jcData[firstPos] - prevV)) *
                        (toJX(firstPos) - toJX(firstPos - 1))
                    : toJX(0);
                const posPath = posPoints.map(({ v, i }) => `L${toJX(i)},${toJY(v)}`).join(" ");
                return (
                  <path
                    d={`M${crossX},${jcZeroY} ${posPath} L${toJX(jcYears - 1)},${jcZeroY} Z`}
                    fill="#22c55e15"
                  />
                );
              })()}
              {/* J curve line */}
              <path d={jcPath} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {/* X axis */}
              {[0, 3, 6, 9, 12].map((y) => (
                <text key={y} x={toJX(y)} y={jcPad.t + jcInnerH + 16} textAnchor="middle" fill="#64748b" fontSize={9}>
                  Yr {y}
                </text>
              ))}
              {/* Labels */}
              <text x={toJX(2)} y={toJY(-120) - 6} textAnchor="middle" fill="#f43f5e" fontSize={8} fontWeight={700}>Investment/</text>
              <text x={toJX(2)} y={toJY(-120) + 4} textAnchor="middle" fill="#f43f5e" fontSize={8} fontWeight={700}>Construction</text>
              <text x={toJX(9)} y={toJY(280) - 6} textAnchor="middle" fill="#22c55e" fontSize={8} fontWeight={700}>Harvest Phase</text>
              <text x={jcW / 2} y={jcH - 4} textAnchor="middle" fill="#64748b" fontSize={7.5}>
                Typical infra J-curve: capital calls Yr 0–4, distributions Yr 5–12+
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* 60/40 diversification scatter */}
      <div>
        <SectionTitle>
          <BarChart3 size={14} /> Infrastructure in 60/40 Portfolio Context
        </SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <svg viewBox={`0 0 ${psW} ${psH}`} className="w-full" style={{ maxWidth: 400 }}>
                {[8, 9, 10, 11, 12].map((v) => (
                  <g key={v}>
                    <line
                      x1={psPad.l} x2={psW - psPad.r}
                      y1={toPSY(v)} y2={toPSY(v)}
                      stroke="#ffffff15" strokeWidth={1}
                    />
                    <text x={psPad.l - 6} y={toPSY(v) + 4} textAnchor="end" fill="#64748b" fontSize={9}>
                      {v}%
                    </text>
                  </g>
                ))}
                {[8, 10, 12].map((v) => (
                  <g key={v}>
                    <line
                      x1={toPSX(v)} x2={toPSX(v)}
                      y1={psPad.t} y2={psPad.t + psInnerH}
                      stroke="#ffffff15" strokeWidth={1}
                    />
                    <text x={toPSX(v)} y={psPad.t + psInnerH + 14} textAnchor="middle" fill="#64748b" fontSize={9}>
                      {v}%
                    </text>
                  </g>
                ))}
                {/* Arrow showing efficient frontier improvement */}
                <path
                  d={portScatter.map((pt, i) => `${i === 0 ? "M" : "L"}${toPSX(pt.vol)},${toPSY(pt.ret)}`).join(" ")}
                  fill="none" stroke="#ffffff30" strokeWidth={1} strokeDasharray="4,3"
                />
                {portScatter.map((pt, i) => (
                  <g key={pt.name}>
                    <circle cx={toPSX(pt.vol)} cy={toPSY(pt.ret)} r={7} fill={pt.color + "90"} stroke={pt.color} strokeWidth={1.5} />
                    <text x={toPSX(pt.vol)} y={toPSY(pt.ret) - 11} textAnchor="middle" fill={pt.color} fontSize={8} fontWeight={600}>
                      {i === 0 ? "60/40" : `+${[5, 10, 15][i - 1]}% Infra`}
                    </text>
                  </g>
                ))}
                <text x={psW / 2} y={psH - 4} textAnchor="middle" fill="#64748b" fontSize={8}>Volatility →</text>
                <text x={12} y={psH / 2} fill="#64748b" fontSize={8} transform={`rotate(-90, 12, ${psH / 2})`} textAnchor="middle">Return</text>
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <InfoBox variant="blue">
                <div className="font-semibold mb-1">Diversification Benefit</div>
                Adding 10–15% unlisted infrastructure to a 60/40 portfolio reduces volatility by ~1.5–2pp while improving returns by ~0.8pp. The benefit comes from low correlation to public equities (0.42) and the inflation-hedging properties of contracted cashflows.
              </InfoBox>
              <InfoBox variant="emerald">
                <div className="font-semibold mb-1">Co-Investment Opportunities</div>
                Large LPs can negotiate co-investment rights alongside fund GP — participating directly in deals at zero or reduced carry. Reduces blended fee from 1.5%+10% toward 0.8%+5%. Requires in-house deal capability and fast decision-making.
              </InfoBox>
            </div>
          </div>
        </div>
      </div>

      {/* Listed vs Unlisted */}
      <div>
        <SectionTitle>
          <Globe size={14} /> Listed vs Unlisted Infrastructure Comparison
        </SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="grid grid-cols-4 bg-white/10 text-xs font-semibold text-muted-foreground px-4 py-2">
            <span>Attribute</span>
            <span className="text-center text-primary">Listed</span>
            <span className="text-center text-emerald-400">Unlisted</span>
            <span className="text-center text-muted-foreground">Winner</span>
          </div>
          {LISTED_VS_UNLISTED.map((row, i) => (
            <div
              key={row.attribute}
              className={cn(
                "grid grid-cols-4 px-4 py-2.5 text-xs items-center",
                i % 2 === 0 ? "bg-white/5" : "bg-transparent"
              )}
            >
              <span className="text-muted-foreground font-medium">{row.attribute}</span>
              <span className="text-center text-muted-foreground">{row.listed}</span>
              <span className="text-center text-muted-foreground">{row.unlisted}</span>
              <span className={cn("text-center font-medium", row.winner === "listed" ? "text-primary" : "text-emerald-400")}>
                {row.winner === "listed" ? "Listed" : "Unlisted"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark Indices + Fee structures */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <SectionTitle>
            <BarChart3 size={14} /> Benchmark Indices
          </SectionTitle>
          <div className="space-y-2">
            {BENCHMARK_INDICES.map((idx) => (
              <div
                key={idx.name}
                className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-start gap-3"
              >
                <Badge
                  variant="outline"
                  className={cn("text-xs flex-shrink-0 mt-0.5", idx.type === "Listed" ? "text-primary border-primary/50" : "text-emerald-400 border-emerald-400/50")}
                >
                  {idx.type}
                </Badge>
                <div>
                  <div className="text-sm text-foreground font-medium">{idx.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{idx.provider} — {idx.coverage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>
            <DollarSign size={14} /> Fee Structures
          </SectionTitle>
          <div className="space-y-3">
            {[
              {
                type: "Core Unlisted Fund",
                mgmt: "1.0–1.5%",
                carry: "8–10% (15–20% rate)",
                hurdle: "6–8% preferred return",
                catchup: "100% GP catch-up",
                color: "#22c55e",
              },
              {
                type: "Core+ / Value-Add Fund",
                mgmt: "1.5–2.0%",
                carry: "10–15% (above hurdle)",
                hurdle: "8% preferred return",
                catchup: "100% GP catch-up",
                color: "#f59e0b",
              },
              {
                type: "Listed Infra ETF",
                mgmt: "0.1–0.5%",
                carry: "None",
                hurdle: "N/A",
                catchup: "N/A",
                color: "#3b82f6",
              },
            ].map((fee) => (
              <div key={fee.type} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: fee.color }} />
                  <span className="text-sm font-semibold text-white">{fee.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-muted-foreground">Mgmt fee:</span>
                  <span className="text-foreground">{fee.mgmt}</span>
                  <span className="text-muted-foreground">Carried interest:</span>
                  <span className="text-foreground">{fee.carry}</span>
                  <span className="text-muted-foreground">Hurdle rate:</span>
                  <span className="text-foreground">{fee.hurdle}</span>
                  <span className="text-muted-foreground">Catch-up:</span>
                  <span className="text-foreground">{fee.catchup}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InfraInvestingPage() {
  const [activeTab, setActiveTab] = useState("asset-classes");

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 border border-border">
            <Building2 size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Infrastructure Investing</h1>
            <p className="text-sm text-muted-foreground">
              Asset classes · Project finance · Energy transition · Institutional allocation
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { icon: <Shield size={12} />, label: "Low Volatility" },
            { icon: <TrendingUp size={12} />, label: "Inflation-Linked" },
            { icon: <Globe size={12} />, label: "$1.1T AUM" },
            { icon: <Zap size={12} />, label: "Energy Transition" },
          ].map(({ icon, label }) => (
            <Badge key={label} variant="outline" className="text-xs flex items-center gap-1 text-muted-foreground border-white/15">
              {icon} {label}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full bg-white/5 border border-white/10 h-10 mb-6">
          <TabsTrigger value="asset-classes" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
            Asset Classes
          </TabsTrigger>
          <TabsTrigger value="project-finance" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
            Project Finance
          </TabsTrigger>
          <TabsTrigger value="energy-transition" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
            Energy Transition
          </TabsTrigger>
          <TabsTrigger value="institutional" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
            Institutional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="asset-classes" className="data-[state=inactive]:hidden">
          <motion.div
            key="asset-classes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AssetClassesTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="project-finance" className="data-[state=inactive]:hidden">
          <motion.div
            key="project-finance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectFinanceTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="energy-transition" className="data-[state=inactive]:hidden">
          <motion.div
            key="energy-transition"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EnergyTransitionTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="institutional" className="data-[state=inactive]:hidden">
          <motion.div
            key="institutional"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <InstitutionalTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
