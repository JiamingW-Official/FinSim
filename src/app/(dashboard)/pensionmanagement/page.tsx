"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  TrendingUp,
  BarChart3,
  Shield,
  Leaf,
  Scale,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  DollarSign,
  Users,
  Clock,
  Activity,
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
let s = 692001;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface PensionFundEntry {
  rank: number;
  name: string;
  state: string;
  type: "DB" | "DC" | "Hybrid";
  aum: number; // USD billions
  members: number; // thousands
  fundedRatio: number; // percent
  returnPct: number; // 10-yr annualized
  contribution: number; // employer rate %
  liabilityDiscount: number; // discount rate %
}

interface KeyRateDuration {
  maturity: string;
  assetDur: number;
  liabilityDur: number;
  mismatch: number;
}

interface AllocationScenario {
  name: string;
  equities: number;
  fixedIncome: number;
  alternatives: number;
  realAssets: number;
  cash: number;
  expectedReturn: number;
  volatility: number;
  color: string;
}

interface RiskFactor {
  name: string;
  category: "Interest Rate" | "Longevity" | "Inflation" | "Credit" | "Liquidity";
  severity: "High" | "Medium" | "Low";
  impactBps: number;
  mitigant: string;
  hedgeRatio: number;
}

interface StressScenario {
  name: string;
  rateShift: number; // bps
  equityMove: number; // %
  liabilityChange: number; // %
  assetChange: number; // %
  fundedImpact: number; // pp change to funded ratio
}

interface ESGInitiative {
  category: string;
  fund: string;
  action: string;
  aum: number; // billions committed
  year: number;
  outcome: string;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const TOP_PENSION_FUNDS: PensionFundEntry[] = [
  {
    rank: 1,
    name: "California Public Employees' Retirement System",
    state: "CA",
    type: "DB",
    aum: 487,
    members: 2100,
    fundedRatio: 71,
    returnPct: 7.2,
    contribution: 22.4,
    liabilityDiscount: 6.8,
  },
  {
    rank: 2,
    name: "California State Teachers' Retirement System",
    state: "CA",
    type: "DB",
    aum: 334,
    members: 978,
    fundedRatio: 74,
    returnPct: 7.5,
    contribution: 19.1,
    liabilityDiscount: 7.0,
  },
  {
    rank: 3,
    name: "New York State Common Retirement Fund",
    state: "NY",
    type: "DB",
    aum: 267,
    members: 1200,
    fundedRatio: 97,
    returnPct: 8.1,
    contribution: 14.2,
    liabilityDiscount: 5.9,
  },
  {
    rank: 4,
    name: "New York City Retirement Systems",
    state: "NY",
    type: "DB",
    aum: 253,
    members: 765,
    fundedRatio: 68,
    returnPct: 6.8,
    contribution: 25.7,
    liabilityDiscount: 7.0,
  },
  {
    rank: 5,
    name: "Florida State Board of Administration",
    state: "FL",
    type: "DB",
    aum: 217,
    members: 993,
    fundedRatio: 84,
    returnPct: 7.9,
    contribution: 15.9,
    liabilityDiscount: 6.5,
  },
  {
    rank: 6,
    name: "Texas Teacher Retirement System",
    state: "TX",
    type: "DB",
    aum: 208,
    members: 1600,
    fundedRatio: 77,
    returnPct: 7.4,
    contribution: 18.2,
    liabilityDiscount: 7.0,
  },
  {
    rank: 7,
    name: "Washington State Investment Board",
    state: "WA",
    type: "DB",
    aum: 188,
    members: 360,
    fundedRatio: 91,
    returnPct: 8.5,
    contribution: 12.7,
    liabilityDiscount: 7.0,
  },
  {
    rank: 8,
    name: "New Jersey Division of Investment",
    state: "NJ",
    type: "DB",
    aum: 98,
    members: 810,
    fundedRatio: 39,
    returnPct: 6.2,
    contribution: 31.5,
    liabilityDiscount: 7.0,
  },
  {
    rank: 9,
    name: "Wisconsin Investment Board",
    state: "WI",
    type: "DB",
    aum: 158,
    members: 690,
    fundedRatio: 103,
    returnPct: 9.1,
    contribution: 8.3,
    liabilityDiscount: 7.0,
  },
  {
    rank: 10,
    name: "Ohio Public Employees Retirement System",
    state: "OH",
    type: "DB",
    aum: 102,
    members: 1050,
    fundedRatio: 81,
    returnPct: 7.1,
    contribution: 17.4,
    liabilityDiscount: 7.2,
  },
];

const KEY_RATE_DURATIONS: KeyRateDuration[] = [
  { maturity: "2Y", assetDur: 1.8, liabilityDur: 2.1, mismatch: -0.3 },
  { maturity: "5Y", assetDur: 3.2, liabilityDur: 3.8, mismatch: -0.6 },
  { maturity: "10Y", assetDur: 4.1, liabilityDur: 5.9, mismatch: -1.8 },
  { maturity: "20Y", assetDur: 2.8, liabilityDur: 7.2, mismatch: -4.4 },
  { maturity: "30Y", assetDur: 1.9, liabilityDur: 8.1, mismatch: -6.2 },
];

const ALLOCATION_SCENARIOS: AllocationScenario[] = [
  {
    name: "Traditional 60/40",
    equities: 60,
    fixedIncome: 40,
    alternatives: 0,
    realAssets: 0,
    cash: 0,
    expectedReturn: 7.1,
    volatility: 11.2,
    color: "#3b82f6",
  },
  {
    name: "LDI 30/60",
    equities: 30,
    fixedIncome: 60,
    alternatives: 5,
    realAssets: 4,
    cash: 1,
    expectedReturn: 5.8,
    volatility: 7.4,
    color: "#8b5cf6",
  },
  {
    name: "Alternatives-Heavy",
    equities: 35,
    fixedIncome: 25,
    alternatives: 30,
    realAssets: 8,
    cash: 2,
    expectedReturn: 8.3,
    volatility: 13.1,
    color: "#10b981",
  },
  {
    name: "Full Funding Glide",
    equities: 20,
    fixedIncome: 75,
    alternatives: 3,
    realAssets: 2,
    cash: 0,
    expectedReturn: 5.1,
    volatility: 5.8,
    color: "#f59e0b",
  },
];

const RISK_FACTORS: RiskFactor[] = [
  {
    name: "Parallel Rate Shift +100bps",
    category: "Interest Rate",
    severity: "High",
    impactBps: 850,
    mitigant: "Long-duration bond overlay / interest rate swaps",
    hedgeRatio: 65,
  },
  {
    name: "Longevity Extension +2 years",
    category: "Longevity",
    severity: "High",
    impactBps: 600,
    mitigant: "Longevity swaps, buy-in / buy-out insurance",
    hedgeRatio: 20,
  },
  {
    name: "CPI +1% persistent overshoot",
    category: "Inflation",
    severity: "Medium",
    impactBps: 420,
    mitigant: "TIPS allocation, inflation swaps, real assets",
    hedgeRatio: 45,
  },
  {
    name: "IG Credit spread +150bps",
    category: "Credit",
    severity: "Medium",
    impactBps: 290,
    mitigant: "Diversification, quality tilt, CDS hedges",
    hedgeRatio: 30,
  },
  {
    name: "Equity market -30%",
    category: "Interest Rate",
    severity: "High",
    impactBps: 710,
    mitigant: "Diversification, put options, risk budgeting",
    hedgeRatio: 25,
  },
  {
    name: "Illiquidity premium compression",
    category: "Liquidity",
    severity: "Low",
    impactBps: 150,
    mitigant: "Staged PE/infrastructure deployment, vintage diversification",
    hedgeRatio: 10,
  },
];

const STRESS_SCENARIOS: StressScenario[] = [
  {
    name: "2022 Rate Shock",
    rateShift: 450,
    equityMove: -19,
    liabilityChange: -22,
    assetChange: -14,
    fundedImpact: +8,
  },
  {
    name: "2008 Financial Crisis",
    rateShift: -150,
    equityMove: -38,
    liabilityChange: +12,
    assetChange: -28,
    fundedImpact: -18,
  },
  {
    name: "2020 COVID Shock",
    rateShift: -120,
    equityMove: -34,
    liabilityChange: +10,
    assetChange: -22,
    fundedImpact: -14,
  },
  {
    name: "Stagflation Scenario",
    rateShift: 300,
    equityMove: -25,
    liabilityChange: -18,
    assetChange: -20,
    fundedImpact: -3,
  },
  {
    name: "Rates -200bps (Deflation)",
    rateShift: -200,
    equityMove: -10,
    liabilityChange: +19,
    assetChange: +3,
    fundedImpact: -12,
  },
];

const ESG_INITIATIVES: ESGInitiative[] = [
  {
    category: "Climate",
    fund: "CalPERS",
    action: "Net Zero 2050 commitment; divested from thermal coal",
    aum: 65,
    year: 2021,
    outcome: "Reduced portfolio carbon intensity by 38% since 2015",
  },
  {
    category: "Shareholder Engagement",
    fund: "CalSTRS",
    action: "Filed 47 shareholder resolutions on climate risk disclosure",
    aum: 42,
    year: 2023,
    outcome: "72% of targeted companies adopted climate reporting frameworks",
  },
  {
    category: "Proxy Voting",
    fund: "NY State Common",
    action: "Voted against 210 board directors lacking climate oversight",
    aum: 28,
    year: 2022,
    outcome: "Average 12pp increase in climate governance scores at targets",
  },
  {
    category: "Universal Owner",
    fund: "GPIF (Japan)",
    action: "Allocated $10B to ESG index funds, engaged with 450 companies",
    aum: 80,
    year: 2020,
    outcome: "Positive externality framing integrated into 3-year plan",
  },
  {
    category: "DEI & Labor",
    fund: "Washington SIB",
    action: "Diversity rider requirements in all new PE/VC fund commitments",
    aum: 12,
    year: 2022,
    outcome: "40% of new managers are diverse-owned firms",
  },
  {
    category: "Long-Horizon",
    fund: "CDPQ (Québec)",
    action: "Infrastructure + renewable energy 30-year direct investments",
    aum: 55,
    year: 2019,
    outcome: "8.9% annualized return on infrastructure book over 10 years",
  },
];

// ── Helper for seeded random numbers initialization ──────────────────────────
const _initRand = () => {
  // Consume a few values to mix the seed
  for (let i = 0; i < 5; i++) rand();
};
_initRand();

// ── SVG: Funded Status Gauge ──────────────────────────────────────────────────
function FundedStatusGauge({ fundedRatio }: { fundedRatio: number }) {
  const cx = 120;
  const cy = 120;
  const r = 85;
  const startAngle = 180;
  const endAngle = 0;
  const totalDegrees = 180;
  const clampedRatio = Math.min(Math.max(fundedRatio, 0), 130);
  const normalizedRatio = clampedRatio / 130;
  const needleAngle = startAngle - normalizedRatio * totalDegrees;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleX = cx + (r - 15) * Math.cos(needleRad);
  const needleY = cy + (r - 15) * Math.sin(needleRad);

  const zones = [
    { start: 180, end: 144, color: "#ef4444", label: "<40%" },
    { start: 144, end: 108, color: "#f97316", label: "40-60%" },
    { start: 108, end: 72, color: "#eab308", label: "60-80%" },
    { start: 72, end: 36, color: "#84cc16", label: "80-100%" },
    { start: 36, end: 0, color: "#10b981", label: ">100%" },
  ];

  const arcPath = (startDeg: number, endDeg: number, innerR: number, outerR: number) => {
    const s = (startDeg * Math.PI) / 180;
    const e = (endDeg * Math.PI) / 180;
    const x1 = cx + outerR * Math.cos(s);
    const y1 = cy + outerR * Math.sin(s);
    const x2 = cx + outerR * Math.cos(e);
    const y2 = cy + outerR * Math.sin(e);
    const x3 = cx + innerR * Math.cos(e);
    const y3 = cy + innerR * Math.sin(e);
    const x4 = cx + innerR * Math.cos(s);
    const y4 = cy + innerR * Math.sin(s);
    const large = Math.abs(startDeg - endDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 0 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 1 ${x4} ${y4} Z`;
  };

  const statusColor =
    fundedRatio >= 100
      ? "#10b981"
      : fundedRatio >= 80
      ? "#84cc16"
      : fundedRatio >= 60
      ? "#eab308"
      : "#ef4444";
  const statusLabel =
    fundedRatio >= 100
      ? "Fully Funded"
      : fundedRatio >= 80
      ? "Near Funded"
      : fundedRatio >= 60
      ? "Underfunded"
      : "Critically Underfunded";

  return (
    <div className="flex flex-col items-center">
      <svg width={240} height={140} viewBox="0 0 240 140">
        {zones.map((z, i) => (
          <path
            key={i}
            d={arcPath(z.start, z.end, 65, 95)}
            fill={z.color}
            opacity={0.85}
          />
        ))}
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={6} fill="white" />
        {/* Center text */}
        <text x={cx} y={cy + 20} textAnchor="middle" fill={statusColor} fontSize={22} fontWeight="bold">
          {fundedRatio}%
        </text>
        <text x={cx} y={cy + 36} textAnchor="middle" fill="#94a3b8" fontSize={9}>
          {statusLabel}
        </text>
      </svg>
    </div>
  );
}

// ── SVG: Asset/Liability Duration Chart ───────────────────────────────────────
function DurationChart({ data }: { data: KeyRateDuration[] }) {
  const maxDur = 10;
  const chartW = 420;
  const chartH = 180;
  const padL = 40;
  const padB = 28;
  const padT = 14;
  const innerW = chartW - padL - 16;
  const innerH = chartH - padB - padT;
  const barGroupW = innerW / data.length;
  const barW = barGroupW * 0.28;

  return (
    <svg width={chartW} height={chartH} className="w-full">
      {/* Grid lines */}
      {[0, 2, 4, 6, 8, 10].map((v) => {
        const y = padT + innerH - (v / maxDur) * innerH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={padL + innerW} y2={y} stroke="#334155" strokeWidth={1} strokeDasharray="3 3" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={9}>
              {v}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const xCenter = padL + i * barGroupW + barGroupW / 2;
        const assetH = (d.assetDur / maxDur) * innerH;
        const liabH = (d.liabilityDur / maxDur) * innerH;
        const assetY = padT + innerH - assetH;
        const liabY = padT + innerH - liabH;
        return (
          <g key={d.maturity}>
            {/* Asset bar */}
            <rect x={xCenter - barW - 2} y={assetY} width={barW} height={assetH} fill="#3b82f6" rx={2} opacity={0.85} />
            {/* Liability bar */}
            <rect x={xCenter + 2} y={liabY} width={barW} height={liabH} fill="#f43f5e" rx={2} opacity={0.85} />
            {/* Mismatch indicator */}
            {d.mismatch !== 0 && (
              <line
                x1={xCenter - barW - 2}
                y1={assetY}
                x2={xCenter + barW + 2}
                y2={liabY}
                stroke="#fbbf24"
                strokeWidth={1.5}
                strokeDasharray="3 2"
                opacity={0.7}
              />
            )}
            <text x={xCenter} y={padT + innerH + 14} textAnchor="middle" fill="#94a3b8" fontSize={9}>
              {d.maturity}
            </text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x={padL} y={padT - 8} width={10} height={7} fill="#3b82f6" rx={1} />
      <text x={padL + 13} y={padT - 1} fill="#94a3b8" fontSize={9}>Assets</text>
      <rect x={padL + 60} y={padT - 8} width={10} height={7} fill="#f43f5e" rx={1} />
      <text x={padL + 73} y={padT - 1} fill="#94a3b8" fontSize={9}>Liabilities</text>
      <line x1={padL + 130} y1={padT - 4} x2={padL + 140} y2={padT - 4} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3 2" />
      <text x={padL + 143} y={padT - 1} fill="#94a3b8" fontSize={9}>Mismatch</text>
    </svg>
  );
}

// ── SVG: Allocation Waterfall ──────────────────────────────────────────────────
function AllocationWaterfall({ scenario }: { scenario: AllocationScenario }) {
  const segments = [
    { label: "Equities", value: scenario.equities, color: "#3b82f6" },
    { label: "Fixed Income", value: scenario.fixedIncome, color: "#8b5cf6" },
    { label: "Alternatives", value: scenario.alternatives, color: "#10b981" },
    { label: "Real Assets", value: scenario.realAssets, color: "#f59e0b" },
    { label: "Cash", value: scenario.cash, color: "#64748b" },
  ].filter((s) => s.value > 0);

  const totalW = 340;
  const barH = 28;
  let accumulated = 0;

  return (
    <svg width={totalW} height={barH + 40} className="w-full">
      {segments.map((seg, i) => {
        const x = (accumulated / 100) * totalW;
        const w = (seg.value / 100) * totalW;
        accumulated += seg.value;
        return (
          <g key={i}>
            <rect x={x} y={0} width={w} height={barH} fill={seg.color} opacity={0.85} />
            {w > 30 && (
              <text x={x + w / 2} y={barH / 2 + 5} textAnchor="middle" fill="white" fontSize={10} fontWeight="bold">
                {seg.value}%
              </text>
            )}
          </g>
        );
      })}
      {/* Labels below */}
      {segments.map((seg, i) => {
        const approxX = segments.slice(0, i).reduce((a, b) => a + b.value, 0);
        const cx = ((approxX + seg.value / 2) / 100) * totalW;
        return (
          <text key={i} x={cx} y={barH + 22} textAnchor="middle" fill={seg.color} fontSize={8} fontWeight="600">
            {seg.label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Funded Ratio Calculator ────────────────────────────────────────────────────
function FundedRatioCalculator() {
  const [assets, setAssets] = useState(850);
  const [pbo, setPbo] = useState(1000);
  const [discountRate, setDiscountRate] = useState(7.0);
  const [payrollGrowth, setPayrollGrowth] = useState(3.0);

  const fundedRatio = useMemo(() => Math.round((assets / pbo) * 100), [assets, pbo]);
  const unfundedLiability = useMemo(() => Math.max(pbo - assets, 0), [assets, pbo]);
  const requiredContrib = useMemo(() => {
    // Simplified normal cost + amortization of unfunded over 30 years
    const amortFactor = (discountRate / 100) / (1 - Math.pow(1 + discountRate / 100, -30));
    return Math.round(unfundedLiability * amortFactor);
  }, [unfundedLiability, discountRate]);

  const rateImpact = useMemo(() => {
    // A 1% rate decrease roughly increases liabilities by duration × 1%
    const dur = 14; // typical pension duration
    const newPbo = pbo * (1 + dur * 0.01);
    const newRatio = Math.round((assets / newPbo) * 100);
    return fundedRatio - newRatio;
  }, [assets, pbo, fundedRatio]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Plan Assets ($M)</label>
          <input
            type="number"
            value={assets}
            onChange={(e) => setAssets(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">PBO / Liability ($M)</label>
          <input
            type="number"
            value={pbo}
            onChange={(e) => setPbo(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Discount Rate (%)</label>
          <input
            type="number"
            step={0.1}
            value={discountRate}
            onChange={(e) => setDiscountRate(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Payroll Growth (%)</label>
          <input
            type="number"
            step={0.1}
            value={payrollGrowth}
            onChange={(e) => setPayrollGrowth(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <div
            className={`text-xl font-bold ${
              fundedRatio >= 100 ? "text-emerald-400" : fundedRatio >= 80 ? "text-yellow-400" : "text-red-400"
            }`}
          >
            {fundedRatio}%
          </div>
          <div className="text-xs text-slate-400 mt-1">Funded Ratio</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-red-400">${unfundedLiability.toLocaleString()}M</div>
          <div className="text-xs text-slate-400 mt-1">Unfunded Liability</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-400">${requiredContrib.toLocaleString()}M</div>
          <div className="text-xs text-slate-400 mt-1">Annual Contribution</div>
        </div>
      </div>
      <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3 text-xs text-amber-300">
        <AlertTriangle className="inline w-3 h-3 mr-1" />
        Rate sensitivity: A 100bps rate decrease would reduce funded ratio by ~{rateImpact}pp, increasing unfunded liability
        by ${Math.round(pbo * 0.14 * 0.01 * 100 * 14).toLocaleString()}M.
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PensionManagementPage() {
  const [selectedScenario, setSelectedScenario] = useState<AllocationScenario>(ALLOCATION_SCENARIOS[0]);
  const [selectedFundedRatio, setSelectedFundedRatio] = useState(78);

  const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.35 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Pension Fund Management</h1>
            <p className="text-sm text-slate-400">Institutional LDI · Asset-Liability Matching · Long-Horizon Investing</p>
          </div>
        </div>
        {/* Summary chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "Avg US Funded Ratio", value: "79%", color: "text-yellow-400" },
            { label: "Total US DB Assets", value: "$4.2T", color: "text-blue-400" },
            { label: "Liability Duration", value: "~15yr", color: "text-purple-400" },
            { label: "Avg Employer Contrib", value: "18.4%", color: "text-emerald-400" },
          ].map((chip) => (
            <div key={chip.label} className="bg-slate-800/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs text-slate-400">{chip.label}</span>
              <span className={`text-sm font-bold ${chip.color}`}>{chip.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-slate-900 border border-slate-800 mb-4 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Building2 className="w-3 h-3 mr-1" />Fund Overview
          </TabsTrigger>
          <TabsTrigger value="ldi" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Scale className="w-3 h-3 mr-1" />LDI
          </TabsTrigger>
          <TabsTrigger value="allocation" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="w-3 h-3 mr-1" />Asset Allocation
          </TabsTrigger>
          <TabsTrigger value="risk" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="w-3 h-3 mr-1" />Risk Factors
          </TabsTrigger>
          <TabsTrigger value="esg" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Leaf className="w-3 h-3 mr-1" />ESG & Stewardship
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Fund Overview ── */}
        <TabsContent value="overview" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.3 }}>
            {/* DB vs DC Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />Defined Benefit (DB)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {[
                    ["Benefit Formula", "Salary × Years × Multiplier"],
                    ["Investment Risk", "Borne by employer / plan sponsor"],
                    ["Longevity Risk", "Sponsor guarantees lifetime income"],
                    ["Funding", "Actuarial valuation every 1–3 years"],
                    ["Portability", "Limited — vesting schedules apply"],
                    ["PBGC Insured", "Yes (private sector, max $87K/yr)"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-slate-400">{k}</span>
                      <span className="text-slate-200 text-right max-w-[55%]">{v}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-800 text-slate-500 italic">
                    Declining in private sector; prevalent in public sector (85% of state/local workers)
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
                    <Users className="w-4 h-4" />Defined Contribution (DC)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {[
                    ["Benefit Formula", "Contributions + investment returns"],
                    ["Investment Risk", "Borne by participant / employee"],
                    ["Longevity Risk", "Participant manages drawdown"],
                    ["Funding", "Annual contribution limits (IRS §415)"],
                    ["Portability", "High — rollover to IRA or new plan"],
                    ["PBGC Insured", "No — no defined benefit to insure"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-slate-400">{k}</span>
                      <span className="text-slate-200 text-right max-w-[55%]">{v}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-800 text-slate-500 italic">
                    401(k)/403(b) dominant in private sector; 2024 limit: $23,000 + $7,500 catch-up
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Funded Ratio Calculator + Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />Funded Ratio Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FundedRatioCalculator />
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />Funded Status Gauge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-3">
                    <FundedStatusGauge fundedRatio={selectedFundedRatio} />
                    <div className="w-full">
                      <label className="text-xs text-slate-400 mb-1 block">
                        Adjust Funded Ratio: {selectedFundedRatio}%
                      </label>
                      <input
                        type="range"
                        min={20}
                        max={130}
                        value={selectedFundedRatio}
                        onChange={(e) => setSelectedFundedRatio(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full text-center text-xs">
                      {[
                        { label: "Critical", range: "< 60%", color: "text-red-400" },
                        { label: "Underfunded", range: "60–80%", color: "text-yellow-400" },
                        { label: "Healthy", range: "> 80%", color: "text-emerald-400" },
                      ].map((s) => (
                        <div key={s.label} className="bg-slate-800 rounded p-2">
                          <div className={`font-bold ${s.color}`}>{s.label}</div>
                          <div className="text-slate-500">{s.range}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top 10 US Pension Funds Table */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />Top 10 US Public Pension Funds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="text-left pb-2 pr-2">#</th>
                        <th className="text-left pb-2 pr-2">Fund</th>
                        <th className="text-right pb-2 pr-2">AUM ($B)</th>
                        <th className="text-right pb-2 pr-2">Members (K)</th>
                        <th className="text-right pb-2 pr-2">Funded %</th>
                        <th className="text-right pb-2 pr-2">10Y Return</th>
                        <th className="text-right pb-2 pr-2">Contrib Rate</th>
                        <th className="text-right pb-2">Discount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TOP_PENSION_FUNDS.map((f) => (
                        <tr key={f.rank} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="py-2 pr-2 text-slate-500">{f.rank}</td>
                          <td className="py-2 pr-2">
                            <div className="text-slate-200 font-medium leading-tight max-w-[200px]">{f.name}</div>
                            <div className="text-slate-500">{f.state}</div>
                          </td>
                          <td className="py-2 pr-2 text-right text-blue-300 font-medium">${f.aum}</td>
                          <td className="py-2 pr-2 text-right text-slate-300">{f.members.toLocaleString()}</td>
                          <td className="py-2 pr-2 text-right">
                            <span
                              className={`font-bold ${
                                f.fundedRatio >= 100
                                  ? "text-emerald-400"
                                  : f.fundedRatio >= 80
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {f.fundedRatio}%
                            </span>
                          </td>
                          <td className="py-2 pr-2 text-right text-emerald-400">{f.returnPct}%</td>
                          <td className="py-2 pr-2 text-right text-orange-400">{f.contribution}%</td>
                          <td className="py-2 text-right text-purple-400">{f.liabilityDiscount}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  Funded ratios use actuarial (smoothed) values at plan-assumed discount rates. Market-value ratios
                  using risk-free rates would be substantially lower for most plans.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Tab 2: LDI ── */}
        <TabsContent value="ldi" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Duration matching explanation */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
                    <Scale className="w-4 h-4" />Duration Matching Principles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {[
                    {
                      title: "Immunization Goal",
                      desc: "Match asset duration to liability duration so that a parallel shift in rates leaves the funded ratio unchanged.",
                      badge: "Core LDI",
                      badgeColor: "bg-blue-600/20 text-blue-400",
                    },
                    {
                      title: "Key Rate Duration (KRD)",
                      desc: "Decompose interest rate sensitivity across the yield curve (2Y, 5Y, 10Y, 20Y, 30Y) to hedge non-parallel shifts.",
                      badge: "Advanced",
                      badgeColor: "bg-purple-600/20 text-purple-400",
                    },
                    {
                      title: "Liability Benchmark",
                      desc: "Construct a custom liability-matching bond benchmark tracking the PBO cash flows — typically long corporate IG bonds.",
                      badge: "Implementation",
                      badgeColor: "bg-emerald-600/20 text-emerald-400",
                    },
                    {
                      title: "Physical vs Synthetic",
                      desc: "Physical: buy long bonds. Synthetic: overlay interest rate swaps or Treasury bond futures while retaining growth assets for return generation.",
                      badge: "Structure",
                      badgeColor: "bg-amber-600/20 text-amber-400",
                    },
                    {
                      title: "Liability Glide Path",
                      desc: "As funded ratio improves, dynamically shift from return-seeking (equities) to liability-hedging (bonds). Reduces lock-in risk.",
                      badge: "Dynamic LDI",
                      badgeColor: "bg-pink-600/20 text-pink-400",
                    },
                  ].map((item) => (
                    <div key={item.title} className="p-2 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-200">{item.title}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* KRD bucketing table */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />Key Rate Duration Bucketing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DurationChart data={KEY_RATE_DURATIONS} />
                  <div className="overflow-x-auto mt-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="text-left pb-2">Maturity</th>
                          <th className="text-right pb-2">Asset KRD</th>
                          <th className="text-right pb-2">Liability KRD</th>
                          <th className="text-right pb-2">Mismatch</th>
                          <th className="text-right pb-2">Hedging Need</th>
                        </tr>
                      </thead>
                      <tbody>
                        {KEY_RATE_DURATIONS.map((d) => (
                          <tr key={d.maturity} className="border-b border-slate-800/50">
                            <td className="py-1.5 text-slate-200 font-medium">{d.maturity}</td>
                            <td className="py-1.5 text-right text-blue-300">{d.assetDur.toFixed(1)}</td>
                            <td className="py-1.5 text-right text-red-300">{d.liabilityDur.toFixed(1)}</td>
                            <td className="py-1.5 text-right">
                              <span className={d.mismatch < 0 ? "text-red-400" : "text-emerald-400"}>
                                {d.mismatch > 0 ? "+" : ""}
                                {d.mismatch.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-1.5 text-right text-amber-400">
                              {d.mismatch < -4
                                ? "High"
                                : d.mismatch < -1
                                ? "Medium"
                                : "Low"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 flex items-start gap-1">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    Long-end mismatch at 20Y–30Y reflects typical pension liability concentration and under-hedged
                    long-duration exposure. Overlay swaps or long-strip Treasuries are common solutions.
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Physical vs Synthetic comparison */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white">Physical vs Synthetic LDI Implementation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {[
                    {
                      title: "Physical LDI",
                      color: "border-blue-600",
                      titleColor: "text-blue-400",
                      pros: [
                        "No counterparty risk",
                        "No margin / collateral management",
                        "Simple accounting treatment",
                        "Regulatory preference in some jurisdictions",
                      ],
                      cons: [
                        "Crowds out return-seeking assets",
                        "Higher transaction costs for large trades",
                        "Limited to tradeable bond universe",
                        "Reinvestment risk on coupon cash flows",
                      ],
                    },
                    {
                      title: "Synthetic LDI (Overlay)",
                      color: "border-purple-600",
                      titleColor: "text-purple-400",
                      pros: [
                        "Capital efficient — retain equity/alternatives",
                        "Flexible adjustment to hedge ratio",
                        "Can precisely target specific KRD buckets",
                        "Lower transaction costs for rebalancing",
                      ],
                      cons: [
                        "Counterparty credit risk (ISDA required)",
                        "Requires collateral/variation margin",
                        "Complexity — internal ops infrastructure",
                        "Negative carry in normal yield curve environments",
                      ],
                    },
                  ].map((item) => (
                    <div key={item.title} className={`p-3 bg-slate-800/50 rounded-lg border-l-2 ${item.color}`}>
                      <div className={`font-semibold mb-2 ${item.titleColor}`}>{item.title}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-emerald-400 font-medium mb-1">Pros</div>
                          <ul className="space-y-1">
                            {item.pros.map((p) => (
                              <li key={p} className="flex items-start gap-1 text-slate-300">
                                <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-red-400 font-medium mb-1">Cons</div>
                          <ul className="space-y-1">
                            {item.cons.map((c) => (
                              <li key={c} className="flex items-start gap-1 text-slate-300">
                                <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Tab 3: Asset Allocation ── */}
        <TabsContent value="allocation" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.3 }}>
            {/* Scenario Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {ALLOCATION_SCENARIOS.map((sc) => (
                <button
                  key={sc.name}
                  onClick={() => setSelectedScenario(sc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    selectedScenario.name === sc.name
                      ? "border-blue-500 bg-blue-600/20 text-blue-300"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  {sc.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Selected scenario detail */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    {selectedScenario.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AllocationWaterfall scenario={selectedScenario} />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-emerald-400">{selectedScenario.expectedReturn}%</div>
                      <div className="text-xs text-slate-400">Expected Return</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-orange-400">{selectedScenario.volatility}%</div>
                      <div className="text-xs text-slate-400">Expected Volatility</div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    {[
                      { label: "Equities", value: selectedScenario.equities, color: "#3b82f6" },
                      { label: "Fixed Income", value: selectedScenario.fixedIncome, color: "#8b5cf6" },
                      { label: "Alternatives", value: selectedScenario.alternatives, color: "#10b981" },
                      { label: "Real Assets", value: selectedScenario.realAssets, color: "#f59e0b" },
                      { label: "Cash", value: selectedScenario.cash, color: "#64748b" },
                    ]
                      .filter((s) => s.value > 0)
                      .map((seg) => (
                        <div key={seg.label} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                          <span className="text-slate-300 w-24">{seg.label}</span>
                          <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${seg.value}%`, backgroundColor: seg.color }}
                            />
                          </div>
                          <span className="text-slate-200 font-medium w-8 text-right">{seg.value}%</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* All scenarios comparison */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Scenario Comparison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ALLOCATION_SCENARIOS.map((sc) => (
                    <div
                      key={sc.name}
                      onClick={() => setSelectedScenario(sc)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedScenario.name === sc.name
                          ? "border-blue-600/50 bg-blue-950/30"
                          : "border-slate-800 bg-slate-800/30 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-200">{sc.name}</span>
                        <div className="flex gap-2 text-xs">
                          <span className="text-emerald-400">{sc.expectedReturn}% ret</span>
                          <span className="text-orange-400">{sc.volatility}% vol</span>
                        </div>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden">
                        {[
                          { v: sc.equities, c: "#3b82f6" },
                          { v: sc.fixedIncome, c: "#8b5cf6" },
                          { v: sc.alternatives, c: "#10b981" },
                          { v: sc.realAssets, c: "#f59e0b" },
                          { v: sc.cash, c: "#64748b" },
                        ]
                          .filter((x) => x.v > 0)
                          .map((x, i) => (
                            <div
                              key={i}
                              style={{ width: `${x.v}%`, backgroundColor: x.c }}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Glide Path and Dynamic Triggers */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />Dynamic Allocation Glide Path & Triggers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="text-left pb-2 pr-3">Funded Ratio</th>
                        <th className="text-right pb-2 pr-3">Equities</th>
                        <th className="text-right pb-2 pr-3">LDI / Bonds</th>
                        <th className="text-right pb-2 pr-3">Alternatives</th>
                        <th className="text-right pb-2 pr-3">Hedge Ratio</th>
                        <th className="text-left pb-2">Trigger Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { fr: "< 60%", eq: 65, bond: 20, alt: 15, hedge: 20, action: "Max return seeking; minimize contribution drag" },
                        { fr: "60–70%", eq: 55, bond: 30, alt: 15, hedge: 35, action: "Begin LDI overlay; reduce equity beta" },
                        { fr: "70–80%", eq: 45, bond: 40, alt: 15, hedge: 50, action: "Extend duration; add long corporate bonds" },
                        { fr: "80–90%", eq: 35, bond: 50, alt: 15, hedge: 65, action: "Reduce equity risk; hedge 65% of liability" },
                        { fr: "90–100%", eq: 20, bond: 65, alt: 15, hedge: 80, action: "Liability-matching dominant; protect gains" },
                        { fr: "> 100%", eq: 10, bond: 80, alt: 10, hedge: 95, action: "Near full immunization; evaluate annuitization" },
                      ].map((row) => (
                        <tr key={row.fr} className="border-b border-slate-800/50">
                          <td className="py-2 pr-3 font-medium text-slate-200">{row.fr}</td>
                          <td className="py-2 pr-3 text-right text-blue-400">{row.eq}%</td>
                          <td className="py-2 pr-3 text-right text-purple-400">{row.bond}%</td>
                          <td className="py-2 pr-3 text-right text-emerald-400">{row.alt}%</td>
                          <td className="py-2 pr-3 text-right text-amber-400">{row.hedge}%</td>
                          <td className="py-2 text-slate-400">{row.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Tab 4: Risk Factors ── */}
        <TabsContent value="risk" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.3 }}>
            {/* Risk Factor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {RISK_FACTORS.map((rf) => {
                const severityColor =
                  rf.severity === "High"
                    ? "text-red-400 bg-red-950/30 border-red-800/40"
                    : rf.severity === "Medium"
                    ? "text-yellow-400 bg-yellow-950/30 border-yellow-800/40"
                    : "text-emerald-400 bg-emerald-950/30 border-emerald-800/40";
                const catColor: Record<string, string> = {
                  "Interest Rate": "text-blue-400",
                  Longevity: "text-purple-400",
                  Inflation: "text-orange-400",
                  Credit: "text-amber-400",
                  Liquidity: "text-slate-400",
                };
                return (
                  <div key={rf.name} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="text-sm font-medium text-slate-200">{rf.name}</div>
                        <div className={`text-xs font-medium ${catColor[rf.category] ?? "text-slate-400"}`}>
                          {rf.category}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${severityColor}`}>
                        {rf.severity}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                      <div className="bg-slate-800 rounded p-2 text-center">
                        <div className="text-red-400 font-bold">{rf.impactBps}bps</div>
                        <div className="text-slate-500">Liability Impact</div>
                      </div>
                      <div className="bg-slate-800 rounded p-2 text-center">
                        <div className="text-emerald-400 font-bold">{rf.hedgeRatio}%</div>
                        <div className="text-slate-500">Hedged</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 flex items-start gap-1">
                      <Shield className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                      {rf.mitigant}
                    </div>
                    {/* Hedge progress bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Hedge coverage</span>
                        <span>{rf.hedgeRatio}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${rf.hedgeRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stress Test Scenarios */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />Stress Test Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="text-left pb-2 pr-3">Scenario</th>
                        <th className="text-right pb-2 pr-3">Rate Shift</th>
                        <th className="text-right pb-2 pr-3">Equity Move</th>
                        <th className="text-right pb-2 pr-3">Liability Δ</th>
                        <th className="text-right pb-2 pr-3">Asset Δ</th>
                        <th className="text-right pb-2">Funded Ratio Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STRESS_SCENARIOS.map((sc) => (
                        <tr key={sc.name} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="py-2 pr-3 font-medium text-slate-200">{sc.name}</td>
                          <td className="py-2 pr-3 text-right">
                            <span className={sc.rateShift > 0 ? "text-red-400" : "text-emerald-400"}>
                              {sc.rateShift > 0 ? "+" : ""}
                              {sc.rateShift}bps
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-right">
                            <span className={sc.equityMove < 0 ? "text-red-400" : "text-emerald-400"}>
                              {sc.equityMove > 0 ? "+" : ""}
                              {sc.equityMove}%
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-right">
                            <span className={sc.liabilityChange > 0 ? "text-red-400" : "text-emerald-400"}>
                              {sc.liabilityChange > 0 ? "+" : ""}
                              {sc.liabilityChange}%
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-right">
                            <span className={sc.assetChange < 0 ? "text-red-400" : "text-emerald-400"}>
                              {sc.assetChange > 0 ? "+" : ""}
                              {sc.assetChange}%
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            <span
                              className={`font-bold ${sc.fundedImpact > 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {sc.fundedImpact > 0 ? "+" : ""}
                              {sc.fundedImpact}pp
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  2022 shows that rising rates can improve funded ratios when liability sensitivity exceeds asset
                  sensitivity (partially LDI-hedged plans). 2008 illustrates the opposite for equity-heavy plans.
                </div>
              </CardContent>
            </Card>

            {/* Risk attribution summary */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white">Risk Attribution Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {[
                    {
                      title: "Liability Risk",
                      items: [
                        "Discount rate sensitivity (duration × ΔRate × PBO)",
                        "Longevity improvements exceed actuarial tables",
                        "Salary growth exceeding assumed rate",
                        "Retirement age / mortality improvement",
                      ],
                      color: "border-red-700",
                      icon: <Clock className="w-3.5 h-3.5 text-red-400" />,
                    },
                    {
                      title: "Asset Risk",
                      items: [
                        "Equity beta — market risk premium compression",
                        "Credit spreads widening on corporate bonds",
                        "Liquidity risk in alternatives (PE/RE/Infra)",
                        "Currency risk in international allocations",
                      ],
                      color: "border-blue-700",
                      icon: <TrendingUp className="w-3.5 h-3.5 text-blue-400" />,
                    },
                    {
                      title: "Governance Risk",
                      items: [
                        "Contribution holidays during market booms",
                        "Benefit enhancements without actuarial review",
                        "Political pressure on investment mandates",
                        "Inadequate risk monitoring infrastructure",
                      ],
                      color: "border-amber-700",
                      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
                    },
                  ].map((section) => (
                    <div key={section.title} className={`p-3 bg-slate-800/50 rounded-lg border-l-2 ${section.color}`}>
                      <div className="flex items-center gap-1.5 mb-2 font-medium text-slate-200">
                        {section.icon}
                        {section.title}
                      </div>
                      <ul className="space-y-1 text-slate-400">
                        {section.items.map((item) => (
                          <li key={item} className="flex items-start gap-1">
                            <span className="text-slate-600 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Tab 5: ESG & Stewardship ── */}
        <TabsContent value="esg" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.3 }}>
            {/* Universal Owner concept */}
            <Card className="bg-slate-900 border-slate-800 mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-emerald-400 flex items-center gap-2">
                  <Leaf className="w-4 h-4" />Universal Owner Framework
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3">
                <p className="text-slate-300 leading-relaxed">
                  Large pension funds owning diversified slices of the entire economy — the{" "}
                  <span className="text-emerald-400 font-medium">Universal Owner</span> concept (Hawley & Williams, 2000)
                  — face negative externalities from individual corporate behavior that harm the broader market. A company
                  externalizing pollution costs may boost its own returns while degrading the economy-wide returns the
                  pension fund depends on.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      title: "Long-Horizon Alignment",
                      desc: "30–40 year liability horizon means long-term systemic risks (climate, inequality) matter more than quarterly earnings.",
                      color: "text-emerald-400",
                    },
                    {
                      title: "Market Returns Dependence",
                      desc: "Pension benefits depend on broad market growth. Systemic risk reduction through engagement benefits the entire portfolio.",
                      color: "text-blue-400",
                    },
                    {
                      title: "Fiduciary Duty",
                      desc: "Integrating material ESG risks is consistent with — and arguably required by — fiduciary duty to beneficiaries.",
                      color: "text-purple-400",
                    },
                  ].map((item) => (
                    <div key={item.title} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className={`font-semibold mb-1 ${item.color}`}>{item.title}</div>
                      <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ESG Initiatives Table */}
            <Card className="bg-slate-900 border-slate-800 mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />Notable ESG & Stewardship Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ESG_INITIATIVES.map((init) => {
                    const catColors: Record<string, string> = {
                      Climate: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
                      "Shareholder Engagement": "bg-blue-600/20 text-blue-400 border-blue-600/30",
                      "Proxy Voting": "bg-purple-600/20 text-purple-400 border-purple-600/30",
                      "Universal Owner": "bg-amber-600/20 text-amber-400 border-amber-600/30",
                      "DEI & Labor": "bg-pink-600/20 text-pink-400 border-pink-600/30",
                      "Long-Horizon": "bg-cyan-600/20 text-cyan-400 border-cyan-600/30",
                    };
                    return (
                      <div key={init.fund + init.category} className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 text-xs">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-slate-200">{init.fund}</span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded border font-medium ${catColors[init.category] ?? ""}`}
                            >
                              {init.category}
                            </span>
                            <span className="text-slate-500">{init.year}</span>
                          </div>
                          <span className="text-blue-400 font-medium shrink-0">${init.aum}B</span>
                        </div>
                        <div className="text-slate-300 mb-1">{init.action}</div>
                        <div className="flex items-start gap-1 text-slate-500">
                          <ArrowUpRight className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{init.outcome}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Proxy Voting & Engagement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />Proxy Voting Principles
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  {[
                    {
                      title: "Board Composition & Independence",
                      desc: "Vote against non-independent directors; require separation of chair/CEO roles; advocate for skills-based diverse boards.",
                    },
                    {
                      title: "Executive Compensation",
                      desc: "Oppose excessive pay disconnected from long-term performance; support Say-on-Pay resolutions with binding effect.",
                    },
                    {
                      title: "Climate Risk Disclosure",
                      desc: "Support TCFD-aligned reporting; vote for independent climate audits; oppose anti-climate board nominees.",
                    },
                    {
                      title: "Shareholder Rights",
                      desc: "Defend proxy access, majority voting standards, right to call special meetings; oppose dual-class share entrenchment.",
                    },
                    {
                      title: "Audit Quality",
                      desc: "Rotate auditors every 10 years; vote against audit committee members when non-audit fees exceed audit fees.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="p-2 bg-slate-800/40 rounded">
                      <div className="font-medium text-slate-200 mb-0.5">{item.title}</div>
                      <div className="text-slate-400">{item.desc}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />CalPERS / CalSTRS Approach
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-3">
                  <div className="p-3 bg-blue-950/20 border border-blue-800/30 rounded-lg">
                    <div className="font-semibold text-blue-400 mb-2">CalPERS ($487B)</div>
                    <ul className="space-y-1.5 text-slate-300">
                      {[
                        "Climate Action 100+ signatory — engages 170 high-emitting companies",
                        "2019: Divested from prison companies; 2020: gun manufacturers",
                        "Sustainable Investments Research Initiative with UC Berkeley",
                        "Manager diversity: 31% AUM with diverse-owned managers",
                        "Rejected S&P 500 passive-only approach — active engagement mandate",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-1">
                          <ArrowUpRight className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-lg">
                    <div className="font-semibold text-purple-400 mb-2">CalSTRS ($334B)</div>
                    <ul className="space-y-1.5 text-slate-300">
                      {[
                        "Sustainable Investment & Stewardship Strategies (SISS) framework",
                        "Filed climate-disclosure resolutions for 20+ years pre-SEC mandate",
                        "Green Initiative Task Force: $35B in climate solutions investments",
                        "21-year engagement with major emitters produced measurable results",
                        "Annual Global Governance Principles updated for systemic risk",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-1">
                          <ArrowUpRight className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-xs text-slate-500 flex items-start gap-1 mt-2">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    Both funds demonstrate that long-horizon investors can improve risk-adjusted returns by engaging
                    on systemic ESG issues rather than purely divesting.
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Long-horizon investing metrics */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />Long-Horizon Investing Advantages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    {
                      metric: "Illiquidity Premium",
                      value: "150–300bps",
                      desc: "Over public markets for PE/infra/RE",
                      color: "text-blue-400",
                    },
                    {
                      metric: "Complexity Premium",
                      value: "50–150bps",
                      desc: "For structurally complex instruments",
                      color: "text-purple-400",
                    },
                    {
                      metric: "ESG Engagement Alpha",
                      value: "20–80bps",
                      desc: "From governance-driven performance",
                      color: "text-emerald-400",
                    },
                    {
                      metric: "Rebalancing Benefit",
                      value: "30–60bps",
                      desc: "Systematic buy-low/sell-high discipline",
                      color: "text-amber-400",
                    },
                  ].map((item) => (
                    <div key={item.metric} className="bg-slate-800 rounded-lg p-3 text-center">
                      <div className={`text-base font-bold ${item.color}`}>{item.value}</div>
                      <div className="font-medium text-slate-200 mt-1">{item.metric}</div>
                      <div className="text-slate-500 mt-0.5 text-xs">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Footer note */}
      <div className="mt-6 text-xs text-slate-600 flex items-center gap-1">
        <Info className="w-3 h-3" />
        Data is illustrative and educational. Funded ratios, AUM, and return figures are approximate as of 2024 annual reports.
        Contribution rates reflect actuarially determined employer contributions.
      </div>
    </div>
  );
}
