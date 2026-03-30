"use client";

import { useState, useMemo } from "react";
import {
  Globe,
  TrendingUp,
  BarChart3,
  Layers,
  Shield,
  BookOpen,
  Target,
  DollarSign,
  Award,
  Scale,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, type Variants } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 632006;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface SWFEntry {
  rank: number;
  name: string;
  country: string;
  flag: string;
  aum: number; // USD billions
  founded: number;
  mandate: "Savings" | "Stabilization" | "Development" | "Pension Reserve";
  allocation: {
    equities: number;
    fixedIncome: number;
    realAssets: number;
    alternatives: number;
    cash: number;
  };
  returnPct: number;
  transparency: "High" | "Medium" | "Low";
}

interface AssetClassData {
  label: string;
  pct: number;
  color: string;
  description: string;
}

interface NorwayYearlyReturn {
  year: number;
  return: number;
  benchmark: number;
  cumulativeValue: number; // index, 1993=100
}

interface EndowmentProfile {
  institution: string;
  aum: number; // USD billions
  targetReturn: number;
  spendingRate: number;
  equities: number;
  fixedIncome: number;
  alternatives: number;
  realAssets: number;
  cash: number;
  illiquidPct: number;
  tenYearReturn: number;
}

interface FactorData {
  factor: string;
  expectedPremium: number; // annualized %
  sharpe: number;
  capacity: "High" | "Medium" | "Low";
  implementationCost: number; // bps
  institutionAdoption: number; // % of large institutions
  description: string;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const SWF_DATA: SWFEntry[] = [
  {
    rank: 1,
    name: "Government Pension Fund Global (GPFG)",
    country: "Norway",
    flag: "🇳🇴",
    aum: 1720,
    founded: 1990,
    mandate: "Savings",
    allocation: { equities: 72, fixedIncome: 25, realAssets: 3, alternatives: 0, cash: 0 },
    returnPct: 6.1,
    transparency: "High",
  },
  {
    rank: 2,
    name: "Abu Dhabi Investment Authority (ADIA)",
    country: "UAE",
    flag: "🇦🇪",
    aum: 993,
    founded: 1976,
    mandate: "Savings",
    allocation: { equities: 50, fixedIncome: 20, realAssets: 12, alternatives: 15, cash: 3 },
    returnPct: 7.3,
    transparency: "Low",
  },
  {
    rank: 3,
    name: "China Investment Corporation (CIC)",
    country: "China",
    flag: "🇨🇳",
    aum: 1350,
    founded: 2007,
    mandate: "Savings",
    allocation: { equities: 45, fixedIncome: 18, realAssets: 15, alternatives: 20, cash: 2 },
    returnPct: 5.8,
    transparency: "Low",
  },
  {
    rank: 4,
    name: "Kuwait Investment Authority (KIA)",
    country: "Kuwait",
    flag: "🇰🇼",
    aum: 803,
    founded: 1953,
    mandate: "Savings",
    allocation: { equities: 55, fixedIncome: 25, realAssets: 10, alternatives: 8, cash: 2 },
    returnPct: 6.4,
    transparency: "Medium",
  },
  {
    rank: 5,
    name: "GIC Private Limited",
    country: "Singapore",
    flag: "🇸🇬",
    aum: 770,
    founded: 1981,
    mandate: "Savings",
    allocation: { equities: 47, fixedIncome: 22, realAssets: 13, alternatives: 16, cash: 2 },
    returnPct: 6.8,
    transparency: "Medium",
  },
  {
    rank: 6,
    name: "Temasek Holdings",
    country: "Singapore",
    flag: "🇸🇬",
    aum: 382,
    founded: 1974,
    mandate: "Development",
    allocation: { equities: 65, fixedIncome: 5, realAssets: 12, alternatives: 16, cash: 2 },
    returnPct: 9.0,
    transparency: "High",
  },
  {
    rank: 7,
    name: "Public Investment Fund (PIF)",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    aum: 925,
    founded: 1971,
    mandate: "Development",
    allocation: { equities: 40, fixedIncome: 10, realAssets: 25, alternatives: 20, cash: 5 },
    returnPct: 4.5,
    transparency: "Low",
  },
  {
    rank: 8,
    name: "Qatar Investment Authority (QIA)",
    country: "Qatar",
    flag: "🇶🇦",
    aum: 526,
    founded: 2005,
    mandate: "Savings",
    allocation: { equities: 42, fixedIncome: 15, realAssets: 20, alternatives: 18, cash: 5 },
    returnPct: 5.5,
    transparency: "Low",
  },
  {
    rank: 9,
    name: "National Council for Social Security Fund",
    country: "China",
    flag: "🇨🇳",
    aum: 448,
    founded: 2000,
    mandate: "Pension Reserve",
    allocation: { equities: 35, fixedIncome: 40, realAssets: 10, alternatives: 13, cash: 2 },
    returnPct: 7.9,
    transparency: "Medium",
  },
  {
    rank: 10,
    name: "Alaska Permanent Fund",
    country: "United States",
    flag: "🇺🇸",
    aum: 78,
    founded: 1976,
    mandate: "Savings",
    allocation: { equities: 48, fixedIncome: 22, realAssets: 12, alternatives: 16, cash: 2 },
    returnPct: 8.2,
    transparency: "High",
  },
];

const ASSET_CLASS_DATA: AssetClassData[] = [
  { label: "Global Equities", pct: 48, color: "#6366f1", description: "Public stocks across developed and emerging markets" },
  { label: "Fixed Income", pct: 22, color: "#22d3ee", description: "Government bonds, investment grade credit, TIPS" },
  { label: "Alternatives", pct: 15, color: "#a78bfa", description: "Hedge funds, private equity, private credit" },
  { label: "Real Assets", pct: 12, color: "#34d399", description: "Infrastructure, real estate, commodities, timberland" },
  { label: "Cash & Other", pct: 3, color: "#94a3b8", description: "Short-term instruments, FX reserves, overlay" },
];

const NORWAY_RETURNS: NorwayYearlyReturn[] = (() => {
  // Reset seed for deterministic generation
  s = 632006;
  const returns: number[] = [
    6.8, 4.2, 11.1, -4.9, 12.4, 15.9, -1.5, 13.0, 9.6, -23.3,
    25.6, 9.6, -2.5, 13.4, 5.1, 8.7, -6.3, 19.9, 14.5, 2.1,
    -14.1, 16.0, 10.2, 8.4,
  ];
  let cum = 100;
  return returns.map((r, i) => {
    const year = 2000 + i;
    cum = cum * (1 + r / 100);
    return {
      year,
      return: r,
      benchmark: r - 0.1 + (rand() - 0.5) * 0.4,
      cumulativeValue: cum,
    };
  });
})();

const ENDOWMENT_PROFILES: EndowmentProfile[] = [
  {
    institution: "Yale Endowment",
    aum: 41.4,
    targetReturn: 8.25,
    spendingRate: 5.25,
    equities: 14,
    fixedIncome: 4,
    alternatives: 60,
    realAssets: 12,
    cash: 2,
    illiquidPct: 72,
    tenYearReturn: 11.3,
  },
  {
    institution: "Harvard Management",
    aum: 50.7,
    targetReturn: 8.0,
    spendingRate: 5.0,
    equities: 26,
    fixedIncome: 7,
    alternatives: 44,
    realAssets: 17,
    cash: 2,
    illiquidPct: 61,
    tenYearReturn: 9.8,
  },
  {
    institution: "MIT Investment Mgmt",
    aum: 24.6,
    targetReturn: 7.75,
    spendingRate: 5.0,
    equities: 22,
    fixedIncome: 8,
    alternatives: 50,
    realAssets: 14,
    cash: 4,
    illiquidPct: 64,
    tenYearReturn: 10.5,
  },
  {
    institution: "Stanford Management",
    aum: 36.3,
    targetReturn: 8.0,
    spendingRate: 5.5,
    equities: 25,
    fixedIncome: 5,
    alternatives: 49,
    realAssets: 16,
    cash: 3,
    illiquidPct: 65,
    tenYearReturn: 10.8,
  },
  {
    institution: "Princeton Investment",
    aum: 34.1,
    targetReturn: 7.5,
    spendingRate: 4.75,
    equities: 20,
    fixedIncome: 6,
    alternatives: 55,
    realAssets: 15,
    cash: 2,
    illiquidPct: 70,
    tenYearReturn: 10.1,
  },
  {
    institution: "Avg. Public Pension",
    aum: 12.0,
    targetReturn: 7.0,
    spendingRate: 4.5,
    equities: 50,
    fixedIncome: 25,
    alternatives: 15,
    realAssets: 8,
    cash: 2,
    illiquidPct: 23,
    tenYearReturn: 8.1,
  },
];

const FACTOR_DATA: FactorData[] = [
  {
    factor: "Value",
    expectedPremium: 3.5,
    sharpe: 0.38,
    capacity: "High",
    implementationCost: 12,
    institutionAdoption: 78,
    description: "Buy cheap stocks relative to fundamentals (P/B, P/E, EV/EBITDA)",
  },
  {
    factor: "Momentum",
    expectedPremium: 4.2,
    sharpe: 0.55,
    capacity: "Medium",
    implementationCost: 28,
    institutionAdoption: 65,
    description: "Buy past 12-month winners, sell losers; decays at larger scale",
  },
  {
    factor: "Quality",
    expectedPremium: 2.8,
    sharpe: 0.42,
    capacity: "High",
    implementationCost: 8,
    institutionAdoption: 82,
    description: "High ROE, low leverage, stable earnings growth companies",
  },
  {
    factor: "Low Volatility",
    expectedPremium: 2.2,
    sharpe: 0.48,
    capacity: "High",
    implementationCost: 6,
    institutionAdoption: 71,
    description: "Minimum-variance and low-beta portfolio construction",
  },
  {
    factor: "Size",
    expectedPremium: 1.8,
    sharpe: 0.28,
    capacity: "Low",
    implementationCost: 35,
    institutionAdoption: 44,
    description: "Small-cap premium erodes quickly with AUM above $5B",
  },
  {
    factor: "Carry",
    expectedPremium: 3.1,
    sharpe: 0.41,
    capacity: "High",
    implementationCost: 15,
    institutionAdoption: 58,
    description: "FX and fixed income carry; earns rolldown and yield differentials",
  },
  {
    factor: "Trend / CTA",
    expectedPremium: 2.6,
    sharpe: 0.35,
    capacity: "Medium",
    implementationCost: 22,
    institutionAdoption: 52,
    description: "Cross-asset time-series momentum; valuable as crisis alpha hedge",
  },
];

// ── Animation Variants ─────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  }),
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  idx,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: string;
  idx: number;
}) {
  return (
    <motion.div custom={idx} variants={fadeUp} initial="hidden" animate="visible">
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex items-start gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="text-lg font-semibold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── SWF Overview Tab ───────────────────────────────────────────────────────────

function SWFOverviewTab() {
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);

  const maxAUM = Math.max(...SWF_DATA.map((d) => d.aum));

  const mandateColor: Record<SWFEntry["mandate"], string> = {
    Savings: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    Stabilization: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Development: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    "Pension Reserve": "bg-cyan-500/20 text-muted-foreground border-cyan-500/30",
  };

  const transparencyColor: Record<SWFEntry["transparency"], string> = {
    High: "text-emerald-400",
    Medium: "text-amber-400",
    Low: "text-red-400",
  };

  const totalAUM = SWF_DATA.reduce((acc, d) => acc + d.aum, 0);

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Top-10 AUM" value="$8.0T" sub="USD trillions combined" color="bg-indigo-600" idx={0} />
        <StatCard icon={Globe} label="Countries" value="12" sub="Nations represented" color="bg-cyan-600" idx={1} />
        <StatCard icon={TrendingUp} label="Avg. 10Y Return" value="6.8%" sub="Annualized net of fees" color="bg-emerald-600" idx={2} />
        <StatCard icon={Award} label="Oldest Fund" value="1953" sub="Kuwait Investment Authority" color="bg-primary" idx={3} />
      </div>

      {/* AUM Bar Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            AUM Ranking — Top 10 Sovereign Wealth Funds (USD Billions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg width="100%" viewBox="0 0 800 360" className="overflow-visible">
            {SWF_DATA.map((fund, i) => {
              const barW = (fund.aum / maxAUM) * 560;
              const y = i * 34 + 8;
              const isHovered = hoveredRank === fund.rank;
              return (
                <g
                  key={fund.rank}
                  onMouseEnter={() => setHoveredRank(fund.rank)}
                  onMouseLeave={() => setHoveredRank(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Country + rank label */}
                  <text x={0} y={y + 14} fontSize={10} fill="#94a3b8" textAnchor="start">
                    {fund.rank}. {fund.flag} {fund.country}
                  </text>
                  {/* Bar */}
                  <rect
                    x={130}
                    y={y + 2}
                    width={barW}
                    height={20}
                    rx={3}
                    fill={isHovered ? "#818cf8" : "#6366f1"}
                    opacity={isHovered ? 1 : 0.8}
                    style={{ transition: "all 0.15s" }}
                  />
                  {/* AUM label */}
                  <text x={130 + barW + 6} y={y + 15} fontSize={10} fill="#cbd5e1" fontWeight="600">
                    ${fund.aum.toLocaleString()}B
                  </text>
                  {/* Hover: return */}
                  {isHovered && (
                    <text x={130 + barW + 80} y={y + 15} fontSize={9} fill="#34d399">
                      {fund.returnPct}% ret.
                    </text>
                  )}
                </g>
              );
            })}
            {/* X axis */}
            <line x1={130} y1={350} x2={700} y2={350} stroke="#27272a" strokeWidth={1} />
            {[0, 500, 1000, 1500].map((v) => (
              <g key={v}>
                <line x1={130 + (v / maxAUM) * 560} y1={8} x2={130 + (v / maxAUM) * 560} y2={350} stroke="#27272a" strokeWidth={1} strokeDasharray="3,3" />
                <text x={130 + (v / maxAUM) * 560} y={358} fontSize={9} fill="#71717a" textAnchor="middle">${v}B</text>
              </g>
            ))}
          </svg>

          {/* Note */}
          <p className="text-xs text-muted-foreground mt-2">
            Total AUM: ${(totalAUM / 1000).toFixed(1)}T — Hover bars to see annualized returns. Data as of 2024.
          </p>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Fund Details & Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                {["#", "Fund", "AUM", "Founded", "Mandate", "Equities", "FI", "Real", "Alt", "Transparency"].map((h) => (
                  <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SWF_DATA.map((fund) => (
                <tr key={fund.rank} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-2 px-2 text-muted-foreground">{fund.rank}</td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-1.5">
                      <span>{fund.flag}</span>
                      <span className="text-foreground font-medium truncate max-w-[180px]">{fund.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-foreground font-semibold">${fund.aum.toLocaleString()}B</td>
                  <td className="py-2 px-2 text-muted-foreground">{fund.founded}</td>
                  <td className="py-2 px-2">
                    <span className={`px-1.5 py-0.5 rounded border text-xs text-muted-foreground ${mandateColor[fund.mandate]}`}>{fund.mandate}</span>
                  </td>
                  <td className="py-2 px-2 text-indigo-300">{fund.allocation.equities}%</td>
                  <td className="py-2 px-2 text-muted-foreground">{fund.allocation.fixedIncome}%</td>
                  <td className="py-2 px-2 text-emerald-300">{fund.allocation.realAssets}%</td>
                  <td className="py-2 px-2 text-primary">{fund.allocation.alternatives}%</td>
                  <td className="py-2 px-2">
                    <span className={`font-medium ${transparencyColor[fund.transparency]}`}>{fund.transparency}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Asset Allocation Tab ───────────────────────────────────────────────────────

function AssetAllocationTab() {
  const [activeSlice, setActiveSlice] = useState<number | null>(null);

  // Build donut chart paths
  const cx = 160;
  const cy = 160;
  const outerR = 130;
  const innerR = 75;

  const slices = useMemo(() => {
    let cumAngle = -Math.PI / 2;
    return ASSET_CLASS_DATA.map((d, i) => {
      const angle = (d.pct / 100) * 2 * Math.PI;
      const startA = cumAngle;
      const endA = cumAngle + angle;
      cumAngle = endA;

      const midA = startA + angle / 2;
      const r = activeSlice === i ? outerR + 8 : outerR;

      const x1 = cx + innerR * Math.cos(startA);
      const y1 = cy + innerR * Math.sin(startA);
      const x2 = cx + r * Math.cos(startA);
      const y2 = cy + r * Math.sin(startA);
      const x3 = cx + r * Math.cos(endA);
      const y3 = cy + r * Math.sin(endA);
      const x4 = cx + innerR * Math.cos(endA);
      const y4 = cy + innerR * Math.sin(endA);
      const large = angle > Math.PI ? 1 : 0;

      const path = `M ${x1} ${y1} L ${x2} ${y2} A ${r} ${r} 0 ${large} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${large} 0 ${x1} ${y1} Z`;

      const labelR = r + 18;
      const lx = cx + labelR * Math.cos(midA);
      const ly = cy + labelR * Math.sin(midA);

      return { ...d, path, lx, ly, midA, i };
    });
  }, [activeSlice]);

  const mandateComparison = [
    {
      type: "Liability-Driven (LDI)",
      equities: 25,
      bonds: 55,
      alts: 10,
      realAssets: 8,
      cash: 2,
      examples: "DB Pensions, Insurance",
      focus: "Match liabilities, minimize surplus volatility",
    },
    {
      type: "Return-Driven",
      equities: 55,
      bonds: 15,
      alts: 20,
      realAssets: 8,
      cash: 2,
      examples: "Endowments, SWFs (Savings)",
      focus: "Maximize risk-adjusted returns, long horizon",
    },
    {
      type: "Hybrid (Balanced)",
      equities: 40,
      bonds: 35,
      alts: 15,
      realAssets: 8,
      cash: 2,
      examples: "Pension Reserve Funds",
      focus: "Balance growth and liability hedging",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Layers} label="Avg. Equity Weight" value="48%" sub="Public + private" color="bg-indigo-600" idx={0} />
        <StatCard icon={Shield} label="Avg. Fixed Income" value="22%" sub="Gov't + credit" color="bg-cyan-600" idx={1} />
        <StatCard icon={Globe} label="Avg. Alternatives" value="15%" sub="PE, HF, private credit" color="bg-primary" idx={2} />
        <StatCard icon={Target} label="Avg. Real Assets" value="12%" sub="Infra, RE, commodities" color="bg-emerald-600" idx={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Donut Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Typical Large SWF Allocation (AUM-Weighted)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <svg width={320} height={320} viewBox="0 0 320 320">
                {slices.map((sl) => (
                  <path
                    key={sl.label}
                    d={sl.path}
                    fill={sl.color}
                    opacity={activeSlice === null || activeSlice === sl.i ? 1 : 0.45}
                    onMouseEnter={() => setActiveSlice(sl.i)}
                    onMouseLeave={() => setActiveSlice(null)}
                    style={{ cursor: "pointer", transition: "all 0.15s" }}
                  />
                ))}
                {/* Center text */}
                <text x={cx} y={cy - 8} textAnchor="middle" fontSize={13} fill="#94a3b8">AUM-weighted</text>
                <text x={cx} y={cy + 10} textAnchor="middle" fontSize={13} fill="#94a3b8">avg. allocation</text>
                {activeSlice !== null && (
                  <>
                    <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight="700" fill="white">
                      {ASSET_CLASS_DATA[activeSlice].pct}%
                    </text>
                    <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="#94a3b8">
                      {ASSET_CLASS_DATA[activeSlice].label}
                    </text>
                  </>
                )}
              </svg>
              {/* Legend */}
              <div className="space-y-3 flex-1">
                {ASSET_CLASS_DATA.map((d, i) => (
                  <div
                    key={d.label}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveSlice(i)}
                    onMouseLeave={() => setActiveSlice(null)}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                        <span className="text-xs text-muted-foreground">{d.label}</span>
                      </div>
                      <span className="text-xs font-medium text-foreground">{d.pct}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-4">{d.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LDI vs Return-Driven */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mandate Types: LDI vs Return-Driven</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mandateComparison.map((m) => (
              <div key={m.type} className="p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{m.type}</p>
                  <Badge variant="outline" className="text-xs border-border text-muted-foreground">{m.examples}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{m.focus}</p>
                {/* Mini stacked bar */}
                <div className="flex h-4 rounded overflow-hidden gap-px">
                  <div style={{ width: `${m.equities}%`, backgroundColor: "#6366f1" }} title={`Equities ${m.equities}%`} />
                  <div style={{ width: `${m.bonds}%`, backgroundColor: "#22d3ee" }} title={`Bonds ${m.bonds}%`} />
                  <div style={{ width: `${m.alts}%`, backgroundColor: "#a78bfa" }} title={`Alts ${m.alts}%`} />
                  <div style={{ width: `${m.realAssets}%`, backgroundColor: "#34d399" }} title={`Real ${m.realAssets}%`} />
                  <div style={{ width: `${m.cash}%`, backgroundColor: "#94a3b8" }} title={`Cash ${m.cash}%`} />
                </div>
                <div className="flex gap-3 mt-1.5 flex-wrap">
                  {[
                    { label: "EQ", val: m.equities, color: "#6366f1" },
                    { label: "FI", val: m.bonds, color: "#22d3ee" },
                    { label: "Alt", val: m.alts, color: "#a78bfa" },
                    { label: "Real", val: m.realAssets, color: "#34d399" },
                  ].map((a) => (
                    <span key={a.label} className="text-xs text-muted-foreground">
                      <span style={{ color: a.color }}>{a.label}</span> {a.val}%
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-700/30">
              <p className="text-xs text-indigo-300 font-medium mb-1">Key Insight: The Liability Spectrum</p>
              <p className="text-xs text-muted-foreground">
                Institutions with explicit liabilities (DB pensions, insurers) must match duration and currency.
                Those without (endowments, stabilization funds) can harvest illiquidity and complexity premia freely.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Norway Model Tab ───────────────────────────────────────────────────────────

function NorwayModelTab() {
  const CHART_W = 800;
  const CHART_H = 220;
  const PAD_L = 40;
  const PAD_R = 20;
  const PAD_T = 20;
  const PAD_B = 30;

  const years = NORWAY_RETURNS.map((d) => d.year);
  const cumVals = NORWAY_RETURNS.map((d) => d.cumulativeValue);
  const minVal = Math.min(...cumVals) - 10;
  const maxVal = Math.max(...cumVals) + 20;
  const nYears = years.length;

  const toX = (i: number) => PAD_L + (i / (nYears - 1)) * (CHART_W - PAD_L - PAD_R);
  const toY = (v: number) => PAD_T + ((maxVal - v) / (maxVal - minVal)) * (CHART_H - PAD_T - PAD_B);

  const linePath = NORWAY_RETURNS.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.cumulativeValue)}`).join(" ");
  const areaPath = `${linePath} L ${toX(nYears - 1)} ${CHART_H - PAD_B} L ${toX(0)} ${CHART_H - PAD_B} Z`;

  // Bar chart for annual returns
  const BAR_H = 140;
  const BAR_PAD_T = 20;
  const BAR_PAD_B = 25;
  const zero_y = BAR_PAD_T + (4.5 / (4.5 + 26)) * (BAR_H - BAR_PAD_T - BAR_PAD_B);
  const toBarY = (v: number) => {
    const range = 30;
    return BAR_PAD_T + ((15 - v) / range) * (BAR_H - BAR_PAD_T - BAR_PAD_B);
  };
  const barW = (CHART_W - PAD_L - PAD_R) / nYears - 2;

  const exclusions = [
    { sector: "Tobacco", count: 14, reason: "Harmful health products" },
    { sector: "Coal Mining", count: 28, reason: ">30% revenue from coal" },
    { sector: "Nuclear Weapons", count: 5, reason: "Unconventional weapons" },
    { sector: "Environmental Violations", count: 12, reason: "Severe ecological damage" },
    { sector: "Human Rights", count: 8, reason: "Systematic violations" },
    { sector: "Corruption", count: 5, reason: "Unacceptable corruption risk" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="GPFG AUM" value="$1.72T" sub="Largest single SWF" color="bg-indigo-600" idx={0} />
        <StatCard icon={TrendingUp} label="Since Inception" value="6.1% ann." sub="Net of mgmt. costs" color="bg-emerald-600" idx={1} />
        <StatCard icon={Globe} label="Holdings" value="8,800+" sub="Companies in 70+ countries" color="bg-cyan-600" idx={2} />
        <StatCard icon={Shield} label="Equity Share" value="72%" sub="Mandated by Storting" color="bg-primary" idx={3} />
      </div>

      {/* Cumulative Performance Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            GPFG Cumulative Value (Index: 2000=100)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg width="100%" viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="overflow-visible">
            {/* Grid lines */}
            {[100, 200, 300, 400, 500].map((v) => (
              <g key={v}>
                <line x1={PAD_L} y1={toY(v)} x2={CHART_W - PAD_R} y2={toY(v)} stroke="#27272a" strokeWidth={1} />
                <text x={PAD_L - 4} y={toY(v) + 4} fontSize={9} fill="#71717a" textAnchor="end">{v}</text>
              </g>
            ))}
            {/* Area fill */}
            <path d={areaPath} fill="#6366f1" opacity={0.12} />
            {/* Line */}
            <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2.5} />
            {/* Year labels */}
            {NORWAY_RETURNS.filter((_, i) => i % 4 === 0).map((d, i) => {
              const idx = NORWAY_RETURNS.indexOf(d);
              return (
                <text key={d.year} x={toX(idx)} y={CHART_H - 4} fontSize={9} fill="#71717a" textAnchor="middle">{d.year}</text>
              );
            })}
            {/* 2008 annotation */}
            <line x1={toX(8)} y1={PAD_T} x2={toX(8)} y2={CHART_H - PAD_B} stroke="#ef4444" strokeWidth={1} strokeDasharray="3,3" />
            <text x={toX(8) + 4} y={PAD_T + 14} fontSize={9} fill="#ef4444">-23.3%</text>
            <text x={toX(8) + 4} y={PAD_T + 24} fontSize={9} fill="#71717a">2008 GFC</text>
          </svg>
        </CardContent>
      </Card>

      {/* Annual Returns Bar Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Annual Returns 2000–2023</CardTitle>
        </CardHeader>
        <CardContent>
          <svg width="100%" viewBox={`0 0 ${CHART_W} ${BAR_H}`} className="overflow-visible">
            {/* Zero line */}
            <line x1={PAD_L} y1={toBarY(0)} x2={CHART_W - PAD_R} y2={toBarY(0)} stroke="#52525b" strokeWidth={1} />
            <text x={PAD_L - 4} y={toBarY(0) + 4} fontSize={8} fill="#71717a" textAnchor="end">0%</text>
            {NORWAY_RETURNS.map((d, i) => {
              const x = toX(i) - barW / 2;
              const positive = d.return >= 0;
              const y0 = toBarY(0);
              const yv = toBarY(d.return);
              return (
                <g key={d.year}>
                  <rect
                    x={x}
                    y={positive ? yv : y0}
                    width={barW}
                    height={Math.abs(yv - y0)}
                    fill={positive ? "#34d399" : "#f87171"}
                    opacity={0.85}
                  />
                  {i % 4 === 0 && (
                    <text x={x + barW / 2} y={BAR_H - 4} fontSize={8} fill="#71717a" textAnchor="middle">{d.year}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Ethical Exclusions + Active Ownership */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              Ethical Exclusions (Norges Bank Council)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {exclusions.map((ex) => (
              <div key={ex.sector} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-foreground">{ex.sector}</p>
                  <p className="text-xs text-muted-foreground">{ex.reason}</p>
                </div>
                <Badge variant="outline" className="text-red-400 border-red-500/30 text-xs">
                  {ex.count} cos.
                </Badge>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-1">72+ companies excluded, 300+ under observation (2024)</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Active Ownership Principles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Voting Rights", desc: "NBIM votes at ~12,000 AGMs per year. Priority: climate, board quality, executive pay." },
              { title: "Engagement", desc: "Ongoing dialogue with 3,600+ companies on material ESG risks. Can escalate to divestment." },
              { title: "Market Standards", desc: "Publishes expectations documents on tax transparency, water, ocean sustainability." },
              { title: "Long-Term Shareholder", desc: "Never hostile takeovers. Supports management when aligned with long-run value creation." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
            <div className="mt-3 p-3 bg-emerald-900/20 rounded-lg border border-emerald-700/30">
              <p className="text-xs text-emerald-300 font-medium">The Rule of 70</p>
              <p className="text-xs text-muted-foreground mt-1">
                GPFG holds on average 1.5% of all listed companies globally — owning roughly 1 in every 70 shares on earth.
                This scale makes active ownership the only viable alpha source.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Endowment Model Tab ────────────────────────────────────────────────────────

function EndowmentModelTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} label="Yale AUM" value="$41.4B" sub="FY2024" color="bg-indigo-600" idx={0} />
        <StatCard icon={TrendingUp} label="Yale 10Y Return" value="11.3%" sub="Annualized net" color="bg-emerald-600" idx={1} />
        <StatCard icon={Layers} label="Yale Illiquid %" value="72%" sub="PE + VC + RE + Infra" color="bg-primary" idx={2} />
        <StatCard icon={Target} label="Yale Spending" value="5.25%" sub="Of 3Y rolling avg AUM" color="bg-amber-600" idx={3} />
      </div>

      {/* Endowment Comparison Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            Ivy Endowment vs. Typical Pension — Allocation & Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                {["Institution", "AUM ($B)", "Equities", "Bonds", "Alts", "Real", "Illiquid", "Spending", "10Y Return"].map((h) => (
                  <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ENDOWMENT_PROFILES.map((ep, i) => (
                <tr key={ep.institution} className={`border-b border-border hover:bg-muted/30 transition-colors ${i === ENDOWMENT_PROFILES.length - 1 ? "text-muted-foreground" : ""}`}>
                  <td className="py-2 px-2 font-medium text-foreground">{ep.institution}</td>
                  <td className="py-2 px-2 text-foreground">${ep.aum.toFixed(1)}B</td>
                  <td className="py-2 px-2 text-indigo-300">{ep.equities}%</td>
                  <td className="py-2 px-2 text-muted-foreground">{ep.fixedIncome}%</td>
                  <td className="py-2 px-2 text-primary">{ep.alternatives}%</td>
                  <td className="py-2 px-2 text-emerald-300">{ep.realAssets}%</td>
                  <td className="py-2 px-2">
                    <span className={`font-medium ${ep.illiquidPct >= 60 ? "text-amber-300" : "text-muted-foreground"}`}>{ep.illiquidPct}%</span>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">{ep.spendingRate}%</td>
                  <td className="py-2 px-2">
                    <span className={`font-semibold ${ep.tenYearReturn >= 10 ? "text-emerald-400" : ep.tenYearReturn >= 9 ? "text-emerald-300" : "text-muted-foreground"}`}>
                      {ep.tenYearReturn}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Allocation Comparison Visual */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Stacked Allocation Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <svg width="100%" viewBox="0 0 700 220" className="overflow-visible">
            {ENDOWMENT_PROFILES.map((ep, i) => {
              const barW = 80;
              const gap = 15;
              const x = i * (barW + gap) + 60;
              const totalH = 160;
              let yOff = 20;

              const segments = [
                { val: ep.equities, color: "#6366f1", label: "EQ" },
                { val: ep.fixedIncome, color: "#22d3ee", label: "FI" },
                { val: ep.alternatives, color: "#a78bfa", label: "Alt" },
                { val: ep.realAssets, color: "#34d399", label: "Real" },
                { val: ep.cash, color: "#94a3b8", label: "Cash" },
              ];

              return (
                <g key={ep.institution}>
                  {segments.map((seg) => {
                    const segH = (seg.val / 100) * totalH;
                    const rect = (
                      <rect key={seg.label} x={x} y={yOff} width={barW} height={segH} fill={seg.color} opacity={0.85} rx={i === 0 && seg === segments[0] ? 2 : 0} />
                    );
                    yOff += segH;
                    return rect;
                  })}
                  <text x={x + barW / 2} y={195} fontSize={8.5} fill="#71717a" textAnchor="middle">
                    {ep.institution.replace(" Management", "").replace(" Investment", "").replace(" Mgmt", "")}
                  </text>
                  <text x={x + barW / 2} y={205} fontSize={8} fill="#52525b" textAnchor="middle">
                    {ep.tenYearReturn}% 10Y
                  </text>
                </g>
              );
            })}
            {/* Legend */}
            {[
              { label: "Equities", color: "#6366f1" },
              { label: "Fixed Income", color: "#22d3ee" },
              { label: "Alternatives", color: "#a78bfa" },
              { label: "Real Assets", color: "#34d399" },
            ].map((l, i) => (
              <g key={l.label}>
                <rect x={5} y={20 + i * 18} width={10} height={10} fill={l.color} rx={2} />
                <text x={18} y={29 + i * 18} fontSize={9} fill="#94a3b8">{l.label}</text>
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>

      {/* Illiquidity Premium + Spending Rule explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Illiquidity Premium — Why It Works for Endowments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                title: "Perpetual Horizon",
                desc: "Endowments have no terminal date. They can hold decade-long lockups in PE/VC/timber without distress.",
                icon: TrendingUp,
                color: "text-indigo-400",
              },
              {
                title: "Predictable Outflows",
                desc: "Annual spending rate of 4–5.5% is stable and predictable. No sudden redemption risk like retail funds.",
                icon: Target,
                color: "text-emerald-400",
              },
              {
                title: "J-Curve Management",
                desc: "Vintage diversification smooths J-curves. A portfolio of vintages 2010–2024 ensures consistent capital calls and distributions.",
                icon: BarChart3,
                color: "text-muted-foreground",
              },
              {
                title: "Manager Access",
                desc: "Top-quartile PE/VC funds are capacity-constrained. Brand-name LPs get access that smaller investors cannot.",
                icon: Award,
                color: "text-primary",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 p-2.5 bg-muted/50 rounded-lg">
                <item.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${item.color}`} />
                <div>
                  <p className="text-xs font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              Spending Rules — Balancing Growth &amp; Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-muted/60 rounded-lg space-y-2">
              <p className="text-xs font-medium text-foreground">Yale Spending Formula</p>
              <p className="text-xs text-muted-foreground font-mono bg-card p-2 rounded">
                Spend = 0.8 × Prior_Spend × (1 + CPI) + 0.2 × 5.25% × AUM
              </p>
              <p className="text-xs text-muted-foreground">Smooths out market volatility — prevents boom/bust in university budgets</p>
            </div>
            {[
              { rule: "Simple Percentage", desc: "Spend fixed % of year-end AUM. Simple but volatile for beneficiaries.", risk: "High" },
              { rule: "3-Year Moving Avg", desc: "Spend % of 3-year avg AUM. Most common in North America.", risk: "Medium" },
              { rule: "Hybrid (Yale)", desc: "Blend prior year spend (inflation-adjusted) with target % of current AUM.", risk: "Low" },
              { rule: "Inflation + X%", desc: "Grow payout by CPI+1.5% regardless of AUM. Used by smaller institutions.", risk: "Medium" },
            ].map((r) => (
              <div key={r.rule} className="flex items-start justify-between p-2 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-foreground">{r.rule}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ml-2 flex-shrink-0 ${r.risk === "Low" ? "text-emerald-400 border-emerald-500/30" : r.risk === "Medium" ? "text-amber-400 border-amber-500/30" : "text-red-400 border-red-500/30"}`}
                >
                  {r.risk} vol.
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Factor Investing Tab ───────────────────────────────────────────────────────

function FactorInvestingTab() {
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  const selected = FACTOR_DATA.find((f) => f.factor === selectedFactor);

  const capacityColor: Record<FactorData["capacity"], string> = {
    High: "text-emerald-400 border-emerald-500/30",
    Medium: "text-amber-400 border-amber-500/30",
    Low: "text-red-400 border-red-500/30",
  };

  const maxPremium = Math.max(...FACTOR_DATA.map((f) => f.expectedPremium));
  const maxAdoption = Math.max(...FACTOR_DATA.map((f) => f.institutionAdoption));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BarChart3} label="Active Factors" value="7" sub="Academically validated" color="bg-indigo-600" idx={0} />
        <StatCard icon={DollarSign} label="Factor AUM" value="~$3.5T" sub="Smart beta + factor tilts" color="bg-emerald-600" idx={1} />
        <StatCard icon={TrendingUp} label="Avg. Premium" value="2.9%" sub="Expected above market" color="bg-cyan-600" idx={2} />
        <StatCard icon={AlertCircle} label="Crowding Risk" value="Rising" sub="Momentum & Value most crowded" color="bg-amber-600" idx={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Factor Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Expected Premium vs. Institutional Adoption — click a bar to explore
              </CardTitle>
            </CardHeader>
            <CardContent>
              <svg width="100%" viewBox="0 0 600 280" className="overflow-visible">
                {/* Y-axis grid */}
                {[1, 2, 3, 4].map((v) => (
                  <g key={v}>
                    <line x1={50} y1={240 - (v / 4.5) * 200} x2={590} y2={240 - (v / 4.5) * 200} stroke="#27272a" strokeWidth={1} />
                    <text x={46} y={244 - (v / 4.5) * 200} fontSize={9} fill="#71717a" textAnchor="end">{v}%</text>
                  </g>
                ))}
                {/* Zero line */}
                <line x1={50} y1={240} x2={590} y2={240} stroke="#52525b" strokeWidth={1} />
                <text x={46} y={244} fontSize={9} fill="#71717a" textAnchor="end">0%</text>
                {/* Y-axis label */}
                <text x={12} y={140} fontSize={9} fill="#71717a" transform="rotate(-90 12 140)" textAnchor="middle">Expected Premium</text>

                {FACTOR_DATA.map((f, i) => {
                  const barW = 52;
                  const x = 60 + i * 77;
                  const premH = (f.expectedPremium / 4.5) * 200;
                  const isSelected = selectedFactor === f.factor;
                  const adoptionH = (f.institutionAdoption / 100) * 200;

                  return (
                    <g key={f.factor} onClick={() => setSelectedFactor(isSelected ? null : f.factor)} style={{ cursor: "pointer" }}>
                      {/* Adoption bar (lighter, behind) */}
                      <rect x={x + barW * 0.6} y={240 - adoptionH} width={barW * 0.35} height={adoptionH} fill="#334155" rx={2} />
                      {/* Premium bar */}
                      <rect
                        x={x}
                        y={240 - premH}
                        width={barW * 0.55}
                        height={premH}
                        fill={isSelected ? "#818cf8" : "#6366f1"}
                        opacity={isSelected ? 1 : 0.8}
                        rx={2}
                        style={{ transition: "all 0.15s" }}
                      />
                      {/* Labels */}
                      <text x={x + barW / 2} y={255} fontSize={9} fill="#94a3b8" textAnchor="middle">{f.factor}</text>
                      <text x={x + barW * 0.275} y={240 - premH - 4} fontSize={9} fill="#a5b4fc" textAnchor="middle">{f.expectedPremium}%</text>
                    </g>
                  );
                })}

                {/* Legend */}
                <rect x={50} y={265} width={10} height={8} fill="#6366f1" rx={1} />
                <text x={63} y={273} fontSize={9} fill="#94a3b8">Expected Premium</text>
                <rect x={155} y={265} width={10} height={8} fill="#334155" rx={1} />
                <text x={168} y={273} fontSize={9} fill="#94a3b8">Institutional Adoption (scale)</text>
              </svg>
            </CardContent>
          </Card>
        </div>

        {/* Detail panel */}
        <div>
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {selected ? selected.factor + " Factor" : "Select a Factor"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selected ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">{selected.description}</p>
                  {[
                    { label: "Expected Premium", value: `${selected.expectedPremium}% p.a.`, positive: true },
                    { label: "Sharpe Ratio", value: selected.sharpe.toFixed(2), positive: selected.sharpe > 0.4 },
                    { label: "Impl. Cost", value: `${selected.implementationCost} bps`, positive: false },
                    { label: "Net Premium", value: `${(selected.expectedPremium - selected.implementationCost / 100).toFixed(2)}% p.a.`, positive: true },
                    { label: "Inst. Adoption", value: `${selected.institutionAdoption}%`, positive: true },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-border">
                      <span className="text-xs text-muted-foreground">{row.label}</span>
                      <span className={`text-xs font-medium ${row.positive ? "text-emerald-300" : "text-red-300"}`}>{row.value}</span>
                    </div>
                  ))}
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground mb-1">Capacity</p>
                    <Badge variant="outline" className={`text-xs text-muted-foreground ${capacityColor[selected.capacity]}`}>
                      {selected.capacity} Capacity
                    </Badge>
                  </div>
                  <div className="p-2.5 bg-indigo-900/20 rounded-lg border border-indigo-700/30 mt-2">
                    <p className="text-xs text-indigo-300 font-medium mb-1">At-Scale Consideration</p>
                    <p className="text-xs text-muted-foreground">
                      {selected.capacity === "Low"
                        ? `${selected.factor} has severe capacity constraints. A $10B fund trading this factor can move prices enough to erode 40–60% of the theoretical premium.`
                        : selected.capacity === "Medium"
                        ? `${selected.factor} is viable up to $50–100B AUM. Beyond that, execution shortfall and market impact materially reduce net alpha.`
                        : `${selected.factor} scales well. Even a $500B institution can implement without significantly impacting quoted markets.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground space-y-2">
                  <BarChart3 className="w-8 h-8" />
                  <p className="text-xs text-muted-foreground text-center">Click a bar in the chart to explore factor details, capacity constraints, and implementation costs.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Factor Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Factor Summary — Institutional Implementation</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                {["Factor", "Exp. Premium", "Sharpe", "Capacity", "Impl. Cost (bps)", "Net Premium", "Inst. Adoption", "Description"].map((h) => (
                  <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FACTOR_DATA.map((f) => (
                <tr
                  key={f.factor}
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedFactor(f.factor === selectedFactor ? null : f.factor)}
                >
                  <td className="py-2 px-2 font-medium text-foreground">{f.factor}</td>
                  <td className="py-2 px-2 text-emerald-300">{f.expectedPremium}%</td>
                  <td className="py-2 px-2 text-indigo-300">{f.sharpe.toFixed(2)}</td>
                  <td className="py-2 px-2">
                    <Badge variant="outline" className={`text-xs text-muted-foreground ${capacityColor[f.capacity]}`}>{f.capacity}</Badge>
                  </td>
                  <td className="py-2 px-2 text-red-300">{f.implementationCost}</td>
                  <td className="py-2 px-2 font-medium text-foreground">{(f.expectedPremium - f.implementationCost / 100).toFixed(2)}%</td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${f.institutionAdoption}%` }} />
                      </div>
                      <span className="text-muted-foreground w-7 text-right">{f.institutionAdoption}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground max-w-[200px] truncate">{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Implementation costs explainer */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Why Most Institutions Underperform Factor Indices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                title: "Market Impact",
                desc: "Large trades move prices. A $5B momentum rebalance can cost 15–30bps vs. paper portfolio.",
                color: "bg-amber-500/10 border-amber-500/30",
                icon: ArrowUpRight,
                iconColor: "text-amber-400",
              },
              {
                title: "Turnover Costs",
                desc: "Momentum requires ~100% annual turnover. At 5bps/trade × 2 sides, that's 10bps drag per year.",
                color: "bg-red-500/5 border-red-500/30",
                icon: ArrowDownRight,
                iconColor: "text-red-400",
              },
              {
                title: "Factor Timing",
                desc: "Institutions often reduce factor exposure after drawdowns, buying high and selling low within factors.",
                color: "bg-orange-500/10 border-orange-500/30",
                icon: AlertCircle,
                iconColor: "text-orange-400",
              },
              {
                title: "Crowding",
                desc: "When a factor is widely known, competition arbitrages away 20–40% of the premium over a decade.",
                color: "bg-muted/10 border-border",
                icon: Globe,
                iconColor: "text-primary",
              },
            ].map((item) => (
              <div key={item.title} className={`p-3 rounded-lg border ${item.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                  <p className="text-xs font-medium text-foreground">{item.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function SovereignPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="border-l-4 border-l-primary p-6 rounded-lg bg-card/40">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-indigo-600 rounded-md">
              <Globe className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Sovereign Wealth &amp; Institutional Investing</h1>
              <p className="text-sm text-muted-foreground">How the world's largest pools of capital allocate, govern, and grow</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 text-xs">$10T+ AUM covered</Badge>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 text-xs">Norway GPFG deep dive</Badge>
            <Badge variant="outline" className="border-primary/40 text-primary text-xs">Yale &amp; Harvard models</Badge>
            <Badge variant="outline" className="border-cyan-500/40 text-muted-foreground text-xs">Factor investing at scale</Badge>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">SWF Overview</TabsTrigger>
            <TabsTrigger value="allocation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Asset Allocation</TabsTrigger>
            <TabsTrigger value="norway" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Norway Model</TabsTrigger>
            <TabsTrigger value="endowment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Endowment Model</TabsTrigger>
            <TabsTrigger value="factors" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Factor Investing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 data-[state=inactive]:hidden">
            <SWFOverviewTab />
          </TabsContent>
          <TabsContent value="allocation" className="mt-4 data-[state=inactive]:hidden">
            <AssetAllocationTab />
          </TabsContent>
          <TabsContent value="norway" className="mt-4 data-[state=inactive]:hidden">
            <NorwayModelTab />
          </TabsContent>
          <TabsContent value="endowment" className="mt-4 data-[state=inactive]:hidden">
            <EndowmentModelTab />
          </TabsContent>
          <TabsContent value="factors" className="mt-4 data-[state=inactive]:hidden">
            <FactorInvestingTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
