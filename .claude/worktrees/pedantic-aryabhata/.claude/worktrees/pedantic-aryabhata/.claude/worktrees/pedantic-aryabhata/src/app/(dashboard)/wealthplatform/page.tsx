"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Shield,
  PieChart,
  BarChart3,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Landmark,
  Home,
  GraduationCap,
  Heart,
  Calendar,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  Activity,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── PRNG (seed 835) ────────────────────────────────────────────────────────────

let s = 835;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate all random values upfront so they remain stable
const RAND_VALUES = Array.from({ length: 500 }, () => rand());
let randIdx = 0;
const r = () => RAND_VALUES[randIdx++ % RAND_VALUES.length];

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

function fmtPct(n: number, digits = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

function pnlColor(n: number): string {
  return n >= 0 ? "text-emerald-400" : "text-red-400";
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClientPersona {
  id: string;
  name: string;
  age: number;
  label: string;
  totalAssets: number;
  description: string;
  riskProfile: string;
  goals: Goal[];
  netWorthBreakdown: { label: string; value: number; color: string }[];
}

interface Goal {
  name: string;
  icon: React.ReactNode;
  target: number;
  current: number;
  targetYear: number;
  priority: "high" | "medium" | "low";
}

interface AllocationData {
  equity: number;
  bonds: number;
  alternatives: number;
  cash: number;
}

interface HarvestPosition {
  ticker: string;
  costBasis: number;
  currentValue: number;
  unrealizedLoss: number;
  taxSaving: number;
  sector: string;
}

interface HoldingRow {
  ticker: string;
  name: string;
  value: number;
  weight: number;
  return1m: number;
  return1y: number;
  contribution: number;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const CLIENTS: ClientPersona[] = [
  {
    id: "young",
    name: "Alex Chen",
    age: 29,
    label: "Young Professional",
    totalAssets: 250_000,
    description: "Tech engineer, 5 yrs savings, high growth focus",
    riskProfile: "Aggressive Growth",
    goals: [
      {
        name: "Retirement",
        icon: <Landmark className="w-4 h-4" />,
        target: 2_500_000,
        current: 85_000,
        targetYear: 2059,
        priority: "high",
      },
      {
        name: "Home Purchase",
        icon: <Home className="w-4 h-4" />,
        target: 120_000,
        current: 62_000,
        targetYear: 2027,
        priority: "high",
      },
      {
        name: "Education Fund",
        icon: <GraduationCap className="w-4 h-4" />,
        target: 50_000,
        current: 8_000,
        targetYear: 2035,
        priority: "medium",
      },
      {
        name: "Legacy / Estate",
        icon: <Heart className="w-4 h-4" />,
        target: 500_000,
        current: 0,
        targetYear: 2060,
        priority: "low",
      },
    ],
    netWorthBreakdown: [
      { label: "Brokerage", value: 95_000, color: "#6366f1" },
      { label: "401(k)", value: 72_000, color: "#8b5cf6" },
      { label: "Roth IRA", value: 38_000, color: "#a78bfa" },
      { label: "Cash", value: 28_000, color: "#c4b5fd" },
      { label: "Other", value: 17_000, color: "#ddd6fe" },
    ],
  },
  {
    id: "mid",
    name: "Sarah & Mark Patel",
    age: 44,
    label: "Mid-Career Family",
    totalAssets: 1_200_000,
    description: "Dual-income household, 2 kids, balanced approach",
    riskProfile: "Moderate Growth",
    goals: [
      {
        name: "Retirement",
        icon: <Landmark className="w-4 h-4" />,
        target: 4_000_000,
        current: 680_000,
        targetYear: 2046,
        priority: "high",
      },
      {
        name: "College (2 kids)",
        icon: <GraduationCap className="w-4 h-4" />,
        target: 300_000,
        current: 145_000,
        targetYear: 2032,
        priority: "high",
      },
      {
        name: "Vacation Home",
        icon: <Home className="w-4 h-4" />,
        target: 400_000,
        current: 180_000,
        targetYear: 2030,
        priority: "medium",
      },
      {
        name: "Legacy / Estate",
        icon: <Heart className="w-4 h-4" />,
        target: 1_500_000,
        current: 85_000,
        targetYear: 2065,
        priority: "low",
      },
    ],
    netWorthBreakdown: [
      { label: "401(k) / 403(b)", value: 490_000, color: "#0ea5e9" },
      { label: "Brokerage", value: 320_000, color: "#38bdf8" },
      { label: "529 Plans", value: 145_000, color: "#7dd3fc" },
      { label: "Real Estate", value: 180_000, color: "#bae6fd" },
      { label: "Cash / Other", value: 65_000, color: "#e0f2fe" },
    ],
  },
  {
    id: "pre",
    name: "Robert Williams",
    age: 58,
    label: "Pre-Retiree",
    totalAssets: 3_500_000,
    description: "10 yrs from retirement, capital preservation focus",
    riskProfile: "Conservative Growth",
    goals: [
      {
        name: "Retirement Income",
        icon: <Landmark className="w-4 h-4" />,
        target: 5_000_000,
        current: 3_200_000,
        targetYear: 2036,
        priority: "high",
      },
      {
        name: "Healthcare Reserve",
        icon: <Heart className="w-4 h-4" />,
        target: 500_000,
        current: 185_000,
        targetYear: 2033,
        priority: "high",
      },
      {
        name: "Legacy / Trust",
        icon: <Shield className="w-4 h-4" />,
        target: 2_000_000,
        current: 620_000,
        targetYear: 2040,
        priority: "medium",
      },
      {
        name: "Charitable Giving",
        icon: <Star className="w-4 h-4" />,
        target: 250_000,
        current: 42_000,
        targetYear: 2036,
        priority: "low",
      },
    ],
    netWorthBreakdown: [
      { label: "IRA / Rollover", value: 1_450_000, color: "#10b981" },
      { label: "Brokerage", value: 980_000, color: "#34d399" },
      { label: "401(k)", value: 620_000, color: "#6ee7b7" },
      { label: "Real Estate", value: 310_000, color: "#a7f3d0" },
      { label: "Cash / Bonds", value: 140_000, color: "#d1fae5" },
    ],
  },
];

// Glide path data (age 25–85, step 5)
const GLIDE_PATH_AGES = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
const GLIDE_PATH: AllocationData[] = [
  { equity: 90, bonds: 5, alternatives: 3, cash: 2 },
  { equity: 85, bonds: 8, alternatives: 5, cash: 2 },
  { equity: 80, bonds: 12, alternatives: 6, cash: 2 },
  { equity: 72, bonds: 18, alternatives: 7, cash: 3 },
  { equity: 65, bonds: 24, alternatives: 8, cash: 3 },
  { equity: 57, bonds: 30, alternatives: 9, cash: 4 },
  { equity: 50, bonds: 35, alternatives: 10, cash: 5 },
  { equity: 42, bonds: 40, alternatives: 10, cash: 8 },
  { equity: 35, bonds: 45, alternatives: 10, cash: 10 },
  { equity: 28, bonds: 50, alternatives: 8, cash: 14 },
  { equity: 22, bonds: 54, alternatives: 6, cash: 18 },
  { equity: 18, bonds: 56, alternatives: 4, cash: 22 },
  { equity: 15, bonds: 57, alternatives: 3, cash: 25 },
];

// Current portfolio vs model by client
const PORTFOLIO_DATA: Record<
  string,
  { label: string; current: number; model: number; color: string }[]
> = {
  young: [
    { label: "US Equity", current: 52, model: 55, color: "#6366f1" },
    { label: "Intl Equity", current: 18, model: 25, color: "#8b5cf6" },
    { label: "Bonds", current: 12, model: 8, color: "#a78bfa" },
    { label: "Alternatives", current: 8, model: 7, color: "#c4b5fd" },
    { label: "Cash", current: 10, model: 5, color: "#ddd6fe" },
  ],
  mid: [
    { label: "US Equity", current: 44, model: 42, color: "#0ea5e9" },
    { label: "Intl Equity", current: 16, model: 20, color: "#38bdf8" },
    { label: "Bonds", current: 25, model: 28, color: "#7dd3fc" },
    { label: "Alternatives", current: 8, model: 7, color: "#bae6fd" },
    { label: "Cash", current: 7, model: 3, color: "#e0f2fe" },
  ],
  pre: [
    { label: "US Equity", current: 30, model: 28, color: "#10b981" },
    { label: "Intl Equity", current: 8, model: 10, color: "#34d399" },
    { label: "Bonds", current: 42, model: 45, color: "#6ee7b7" },
    { label: "Alternatives", current: 10, model: 10, color: "#a7f3d0" },
    { label: "Cash", current: 10, model: 7, color: "#d1fae5" },
  ],
};

const REBALANCE_TRADES: Record<
  string,
  { ticker: string; action: "Buy" | "Sell"; amount: number; reason: string }[]
> = {
  young: [
    {
      ticker: "VXUS",
      action: "Buy",
      amount: 18_500,
      reason: "Increase Intl Equity to model",
    },
    {
      ticker: "BND",
      action: "Sell",
      amount: 9_800,
      reason: "Reduce Bonds overweight",
    },
    {
      ticker: "VMFXX",
      action: "Sell",
      amount: 12_300,
      reason: "Reduce Cash to target",
    },
  ],
  mid: [
    {
      ticker: "VEA",
      action: "Buy",
      amount: 48_000,
      reason: "Increase Intl Equity",
    },
    {
      ticker: "BND",
      action: "Buy",
      amount: 36_000,
      reason: "Add to Bonds allocation",
    },
    {
      ticker: "VMFXX",
      action: "Sell",
      amount: 48_000,
      reason: "Reduce excess Cash",
    },
  ],
  pre: [
    {
      ticker: "BNDX",
      action: "Buy",
      amount: 105_000,
      reason: "Add to Bonds per model",
    },
    {
      ticker: "VEA",
      action: "Buy",
      amount: 70_000,
      reason: "Slight Intl Equity increase",
    },
    {
      ticker: "VMFXX",
      action: "Sell",
      amount: 105_000,
      reason: "Deploy excess Cash",
    },
  ],
};

const HARVEST_POSITIONS: HarvestPosition[] = [
  {
    ticker: "ARKK",
    costBasis: 58_400,
    currentValue: 41_200,
    unrealizedLoss: -17_200,
    taxSaving: 4_128,
    sector: "Tech ETF",
  },
  {
    ticker: "INTC",
    costBasis: 28_900,
    currentValue: 21_600,
    unrealizedLoss: -7_300,
    taxSaving: 1_752,
    sector: "Semiconductors",
  },
  {
    ticker: "ZM",
    costBasis: 19_500,
    currentValue: 14_200,
    unrealizedLoss: -5_300,
    taxSaving: 1_272,
    sector: "Software",
  },
  {
    ticker: "RIVN",
    costBasis: 15_800,
    currentValue: 11_900,
    unrealizedLoss: -3_900,
    taxSaving: 936,
    sector: "EV / Auto",
  },
  {
    ticker: "PYPL",
    costBasis: 12_400,
    currentValue: 9_800,
    unrealizedLoss: -2_600,
    taxSaving: 624,
    sector: "Fintech",
  },
];

const ASSET_LOCATION: {
  asset: string;
  taxable: boolean;
  traditional: boolean;
  roth: boolean;
  reason: string;
}[] = [
  {
    asset: "Municipal Bonds",
    taxable: true,
    traditional: false,
    roth: false,
    reason: "Tax-exempt income shines in taxable",
  },
  {
    asset: "REITs",
    taxable: false,
    traditional: true,
    roth: false,
    reason: "Ordinary income — shelter in pre-tax",
  },
  {
    asset: "High-Growth Stocks",
    taxable: false,
    traditional: false,
    roth: true,
    reason: "Long runway — maximize tax-free growth",
  },
  {
    asset: "Index Funds",
    taxable: true,
    traditional: true,
    roth: true,
    reason: "Tax-efficient; fits any account",
  },
  {
    asset: "Corporate Bonds",
    taxable: false,
    traditional: true,
    roth: false,
    reason: "Interest taxed as ordinary income",
  },
  {
    asset: "International Funds",
    taxable: true,
    traditional: false,
    roth: false,
    reason: "Foreign tax credit only in taxable",
  },
];

// 12-month portfolio performance
const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const PERF_PORTFOLIO = [0, 2.1, 1.4, 3.8, 2.2, -0.8, 1.9, 3.1, 2.6, 4.2, 1.8, 3.4];
const PERF_BENCHMARK = [0, 1.8, 1.1, 3.2, 1.9, -1.2, 1.5, 2.7, 2.1, 3.8, 1.4, 3.0];

const HOLDINGS: HoldingRow[] = [
  {
    ticker: "VTI",
    name: "Vanguard Total Mkt",
    value: 285_400,
    weight: 24.2,
    return1m: 2.1,
    return1y: 18.4,
    contribution: 4.45,
  },
  {
    ticker: "VXUS",
    name: "Vanguard Intl",
    value: 198_600,
    weight: 16.9,
    return1m: 1.4,
    return1y: 12.8,
    contribution: 2.16,
  },
  {
    ticker: "BND",
    name: "Vanguard Bond",
    value: 176_300,
    weight: 15.0,
    return1m: 0.4,
    return1y: 4.2,
    contribution: 0.63,
  },
  {
    ticker: "VNQ",
    name: "Vanguard REIT",
    value: 142_800,
    weight: 12.1,
    return1m: 1.9,
    return1y: 9.6,
    contribution: 1.16,
  },
  {
    ticker: "GLD",
    name: "SPDR Gold ETF",
    value: 118_500,
    weight: 10.1,
    return1m: 3.2,
    return1y: 14.8,
    contribution: 1.49,
  },
  {
    ticker: "QQQ",
    name: "Nasdaq-100 ETF",
    value: 98_200,
    weight: 8.3,
    return1m: 2.8,
    return1y: 22.1,
    contribution: 1.83,
  },
  {
    ticker: "BNDX",
    name: "Intl Bond ETF",
    value: 82_400,
    weight: 7.0,
    return1m: 0.2,
    return1y: 3.1,
    contribution: 0.22,
  },
  {
    ticker: "VMFXX",
    name: "Money Market",
    value: 74_900,
    weight: 6.4,
    return1m: 0.4,
    return1y: 5.2,
    contribution: 0.33,
  },
];

// ── SVG Donut Chart ────────────────────────────────────────────────────────────

function DonutChart({
  data,
  size = 160,
  totalLabel,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  totalLabel: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;
  const innerR = size * 0.22;
  const strokeW = r - innerR;

  let cumAngle = -Math.PI / 2;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const midAngle = (startAngle + endAngle) / 2;
    const midR = (r + innerR) / 2;
    const x1 = cx + Math.cos(startAngle) * r;
    const y1 = cy + Math.sin(startAngle) * r;
    const x2 = cx + Math.cos(endAngle) * r;
    const y2 = cy + Math.sin(endAngle) * r;
    const x3 = cx + Math.cos(endAngle) * innerR;
    const y3 = cy + Math.sin(endAngle) * innerR;
    const x4 = cx + Math.cos(startAngle) * innerR;
    const y4 = cy + Math.sin(startAngle) * innerR;
    const largeArc = angle > Math.PI ? 1 : 0;
    const pathD = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ");
    return {
      ...d,
      pathD,
      midX: cx + Math.cos(midAngle) * midR,
      midY: cy + Math.sin(midAngle) * midR,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={s.pathD} fill={s.color} opacity={0.9} />
      ))}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize={size * 0.07}
        fill="#e2e8f0"
        fontWeight="600"
      >
        {totalLabel}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize={size * 0.055}
        fill="#94a3b8"
      >
        Net Worth
      </text>
    </svg>
  );
}

// ── SVG Glide Path Chart ───────────────────────────────────────────────────────

function GlidePathChart({
  currentAge,
}: {
  currentAge: number;
}) {
  const W = 520;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 32, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = GLIDE_PATH_AGES.length;

  const xScale = (i: number) => PAD.left + (i / (n - 1)) * chartW;
  const yScale = (v: number) => PAD.top + chartH - (v / 100) * chartH;

  const buildArea = (
    getTop: (d: AllocationData) => number,
    getBot: (d: AllocationData) => number
  ) => {
    const topPts = GLIDE_PATH.map((d, i) => `${xScale(i)},${yScale(getTop(d))}`);
    const botPts = [...GLIDE_PATH]
      .reverse()
      .map((d, i) => `${xScale(n - 1 - i)},${yScale(getBot(d))}`);
    return `M ${topPts.join(" L ")} L ${botPts.join(" L ")} Z`;
  };

  // Stacked bands
  const equityTop = (d: AllocationData) => 100;
  const equityBot = (d: AllocationData) => d.bonds + d.alternatives + d.cash;
  const bondsTop = (d: AllocationData) => d.bonds + d.alternatives + d.cash;
  const bondsBot = (d: AllocationData) => d.alternatives + d.cash;
  const altTop = (d: AllocationData) => d.alternatives + d.cash;
  const altBot = (d: AllocationData) => d.cash;
  const cashTop = (d: AllocationData) => d.cash;
  const cashBot = (_d: AllocationData) => 0;

  const currentAgeIdx = GLIDE_PATH_AGES.findIndex((a) => a >= currentAge);
  const markerX = xScale(Math.max(0, currentAgeIdx));

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible"
    >
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((v) => (
        <line
          key={v}
          x1={PAD.left}
          y1={yScale(v)}
          x2={W - PAD.right}
          y2={yScale(v)}
          stroke="#1e293b"
          strokeWidth={1}
        />
      ))}

      {/* Bands */}
      <path
        d={buildArea(equityTop, equityBot)}
        fill="#6366f1"
        opacity={0.7}
      />
      <path
        d={buildArea(bondsTop, bondsBot)}
        fill="#0ea5e9"
        opacity={0.75}
      />
      <path
        d={buildArea(altTop, altBot)}
        fill="#f59e0b"
        opacity={0.75}
      />
      <path
        d={buildArea(cashTop, cashBot)}
        fill="#10b981"
        opacity={0.75}
      />

      {/* Current age marker */}
      <line
        x1={markerX}
        y1={PAD.top}
        x2={markerX}
        y2={H - PAD.bottom}
        stroke="#f8fafc"
        strokeWidth={2}
        strokeDasharray="4 2"
      />
      <text
        x={markerX + 4}
        y={PAD.top + 10}
        fontSize={10}
        fill="#f8fafc"
      >
        Age {currentAge}
      </text>

      {/* X axis labels */}
      {GLIDE_PATH_AGES.filter((_, i) => i % 2 === 0).map((age, idx) => {
        const i = GLIDE_PATH_AGES.indexOf(age);
        return (
          <text
            key={age}
            x={xScale(i)}
            y={H - PAD.bottom + 14}
            fontSize={9}
            fill="#64748b"
            textAnchor="middle"
          >
            {age}
          </text>
        );
      })}

      {/* Y axis labels */}
      {[0, 25, 50, 75, 100].map((v) => (
        <text
          key={v}
          x={PAD.left - 4}
          y={yScale(v) + 3}
          fontSize={9}
          fill="#64748b"
          textAnchor="end"
        >
          {v}%
        </text>
      ))}
    </svg>
  );
}

// ── SVG Portfolio vs Model Bar Chart ──────────────────────────────────────────

function PortfolioBarChart({
  data,
}: {
  data: { label: string; current: number; model: number; color: string }[];
}) {
  const W = 480;
  const H = 200;
  const barGroupW = 60;
  const barW = 20;
  const gap = 8;
  const PAD = { top: 16, right: 16, bottom: 40, left: 36 };
  const chartH = H - PAD.top - PAD.bottom;
  const maxVal = 60;

  const yScale = (v: number) => PAD.top + chartH - (v / maxVal) * chartH;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {/* Grid */}
      {[0, 15, 30, 45, 60].map((v) => (
        <line
          key={v}
          x1={PAD.left}
          y1={yScale(v)}
          x2={W - PAD.right}
          y2={yScale(v)}
          stroke="#1e293b"
          strokeWidth={1}
        />
      ))}

      {data.map((d, i) => {
        const groupX = PAD.left + i * barGroupW + 12;
        const curH = (d.current / maxVal) * chartH;
        const modH = (d.model / maxVal) * chartH;
        return (
          <g key={d.label}>
            {/* Current */}
            <rect
              x={groupX}
              y={yScale(d.current)}
              width={barW}
              height={curH}
              fill={d.color}
              opacity={0.85}
              rx={2}
            />
            {/* Model */}
            <rect
              x={groupX + barW + gap}
              y={yScale(d.model)}
              width={barW}
              height={modH}
              fill={d.color}
              opacity={0.4}
              rx={2}
              strokeDasharray="3 2"
            />
            {/* Label */}
            <text
              x={groupX + barW}
              y={H - PAD.bottom + 14}
              fontSize={9}
              fill="#94a3b8"
              textAnchor="middle"
            >
              {d.label}
            </text>
          </g>
        );
      })}

      {/* Y axis */}
      {[0, 15, 30, 45, 60].map((v) => (
        <text
          key={v}
          x={PAD.left - 4}
          y={yScale(v) + 3}
          fontSize={9}
          fill="#64748b"
          textAnchor="end"
        >
          {v}%
        </text>
      ))}

      {/* Legend */}
      <rect x={PAD.left} y={H - 8} width={10} height={8} fill="#6366f1" opacity={0.85} rx={1} />
      <text x={PAD.left + 13} y={H - 1} fontSize={9} fill="#94a3b8">Current</text>
      <rect x={PAD.left + 62} y={H - 8} width={10} height={8} fill="#6366f1" opacity={0.4} rx={1} />
      <text x={PAD.left + 75} y={H - 1} fontSize={9} fill="#94a3b8">Model</text>
    </svg>
  );
}

// ── SVG Performance Line Chart ─────────────────────────────────────────────────

function PerfLineChart() {
  const W = 520;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 32, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Cumulative returns
  const portCum = PERF_PORTFOLIO.reduce<number[]>((acc, v, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + v);
    return acc;
  }, []);
  const benchCum = PERF_BENCHMARK.reduce<number[]>((acc, v, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + v);
    return acc;
  }, []);

  const allVals = [...portCum, ...benchCum];
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const range = maxVal - minVal || 1;

  const xScale = (i: number) => PAD.left + (i / (MONTHS.length - 1)) * chartW;
  const yScale = (v: number) =>
    PAD.top + chartH - ((v - minVal) / range) * chartH;

  const portPath = portCum
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`)
    .join(" ");
  const benchPath = benchCum
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`)
    .join(" ");

  // Area under portfolio
  const areaPath =
    portPath +
    ` L ${xScale(MONTHS.length - 1)} ${yScale(minVal)} L ${xScale(0)} ${yScale(minVal)} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
        </linearGradient>
      </defs>

      {/* Grid */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const v = minVal + (pct / 100) * range;
        return (
          <line
            key={pct}
            x1={PAD.left}
            y1={yScale(v)}
            x2={W - PAD.right}
            y2={yScale(v)}
            stroke="#1e293b"
            strokeWidth={1}
          />
        );
      })}

      {/* Area */}
      <path d={areaPath} fill="url(#portGrad)" />

      {/* Benchmark line */}
      <path
        d={benchPath}
        stroke="#64748b"
        strokeWidth={1.5}
        strokeDasharray="4 2"
        fill="none"
      />

      {/* Portfolio line */}
      <path d={portPath} stroke="#6366f1" strokeWidth={2} fill="none" />

      {/* Dots */}
      {portCum.map((v, i) => (
        <circle key={i} cx={xScale(i)} cy={yScale(v)} r={3} fill="#6366f1" />
      ))}

      {/* X labels */}
      {MONTHS.map((m, i) => (
        <text
          key={m}
          x={xScale(i)}
          y={H - PAD.bottom + 14}
          fontSize={9}
          fill="#64748b"
          textAnchor="middle"
        >
          {m}
        </text>
      ))}

      {/* Y labels */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const v = minVal + (pct / 100) * range;
        return (
          <text
            key={pct}
            x={PAD.left - 4}
            y={yScale(v) + 3}
            fontSize={9}
            fill="#64748b"
            textAnchor="end"
          >
            {v.toFixed(0)}%
          </text>
        );
      })}

      {/* Legend */}
      <line x1={PAD.left} y1={H - 6} x2={PAD.left + 18} y2={H - 6} stroke="#6366f1" strokeWidth={2} />
      <text x={PAD.left + 22} y={H - 2} fontSize={9} fill="#94a3b8">Portfolio</text>
      <line x1={PAD.left + 75} y1={H - 6} x2={PAD.left + 93} y2={H - 6} stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 2" />
      <text x={PAD.left + 97} y={H - 2} fontSize={9} fill="#94a3b8">Benchmark</text>
    </svg>
  );
}

// ── Risk Slider ────────────────────────────────────────────────────────────────

interface RiskDimension {
  label: string;
  key: string;
  value: number;
  desc: string;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function WealthPlatformPage() {
  const [selectedClient, setSelectedClient] = useState<string>("mid");
  const [riskAnswers, setRiskAnswers] = useState<Record<string, number>>({
    horizon: 3,
    capacity: 3,
    tolerance: 3,
    liquidity: 3,
    knowledge: 3,
  });
  const [harvestSelected, setHarvestSelected] = useState<Set<string>>(
    new Set(["ARKK", "INTC"])
  );
  const [rothAmount, setRothAmount] = useState<number[]>([50]);

  const client = useMemo(
    () => CLIENTS.find((c) => c.id === selectedClient) ?? CLIENTS[1],
    [selectedClient]
  );

  const portfolioData = useMemo(
    () => PORTFOLIO_DATA[selectedClient] ?? PORTFOLIO_DATA.mid,
    [selectedClient]
  );

  const rebalanceTrades = useMemo(
    () => REBALANCE_TRADES[selectedClient] ?? REBALANCE_TRADES.mid,
    [selectedClient]
  );

  const riskScore = useMemo(() => {
    const vals = Object.values(riskAnswers);
    return Math.round((vals.reduce((a, v) => a + v, 0) / vals.length) * 20);
  }, [riskAnswers]);

  const riskLabel = useMemo(() => {
    if (riskScore < 30) return { label: "Conservative", color: "text-primary" };
    if (riskScore < 50) return { label: "Moderate", color: "text-sky-400" };
    if (riskScore < 70) return { label: "Balanced", color: "text-emerald-400" };
    if (riskScore < 85) return { label: "Growth", color: "text-amber-400" };
    return { label: "Aggressive", color: "text-red-400" };
  }, [riskScore]);

  const totalHarvestSaving = useMemo(() => {
    return HARVEST_POSITIONS.filter((p) => harvestSelected.has(p.ticker)).reduce(
      (a, p) => a + p.taxSaving,
      0
    );
  }, [harvestSelected]);

  const rothConversionTax = useMemo(() => {
    const convAmt = rothAmount[0] * 1000;
    const marginalRate = 0.24;
    const effectiveRate = 0.22;
    const currentTax = convAmt * marginalRate;
    const projectedSaving = convAmt * (0.35 - effectiveRate);
    return { convAmt, currentTax, projectedSaving };
  }, [rothAmount]);

  const totalPortValue = HOLDINGS.reduce((a, h) => a + h.value, 0);
  const portReturn1Y = 14.8;
  const benchReturn1Y = 12.6;
  const sharpe = 1.34;
  const sortino = 1.87;
  const maxDrawdown = -8.4;
  const infoRatio = 0.62;

  const riskDimensions: RiskDimension[] = [
    {
      label: "Time Horizon",
      key: "horizon",
      value: riskAnswers.horizon,
      desc: "Years until you need funds",
    },
    {
      label: "Risk Capacity",
      key: "capacity",
      value: riskAnswers.capacity,
      desc: "Financial ability to absorb losses",
    },
    {
      label: "Risk Tolerance",
      key: "tolerance",
      value: riskAnswers.tolerance,
      desc: "Emotional comfort with volatility",
    },
    {
      label: "Liquidity Needs",
      key: "liquidity",
      value: riskAnswers.liquidity,
      desc: "How much cash buffer you need",
    },
    {
      label: "Investment Knowledge",
      key: "knowledge",
      value: riskAnswers.knowledge,
      desc: "Familiarity with markets",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-l-4 border-l-primary p-6 rounded-lg bg-card/40">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Wealth Management Platform
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Comprehensive financial planning · Asset allocation · Tax optimization · Estate planning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 text-xs">
            Fiduciary Mode
          </Badge>
          <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:bg-muted gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-card border border-border p-1 rounded-lg gap-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground text-sm gap-1.5 px-3">
            <User className="w-3.5 h-3.5" />
            Client Profile
          </TabsTrigger>
          <TabsTrigger value="allocation" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground text-sm gap-1.5 px-3">
            <PieChart className="w-3.5 h-3.5" />
            Asset Allocation
          </TabsTrigger>
          <TabsTrigger value="tax" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground text-sm gap-1.5 px-3">
            <Shield className="w-3.5 h-3.5" />
            Tax Planning
          </TabsTrigger>
          <TabsTrigger value="reporting" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground text-sm gap-1.5 px-3">
            <FileText className="w-3.5 h-3.5" />
            Reporting
          </TabsTrigger>
        </TabsList>

        {/* ── CLIENT PROFILE TAB ── */}
        <TabsContent value="profile" className="space-y-4 data-[state=inactive]:hidden">
          {/* Client selector */}
          <div className="grid grid-cols-3 gap-3">
            {CLIENTS.map((c) => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedClient(c.id)}
                className={cn(
                  "text-left p-4 rounded-md border transition-all",
                  selectedClient === c.id
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-border bg-card hover:border-border"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs text-muted-foreground font-bold",
                    selectedClient === c.id ? "bg-indigo-600 text-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground leading-tight">{c.name}</div>
                    <div className="text-xs text-muted-foreground">Age {c.age}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs border-border text-muted-foreground mb-1">
                  {c.label}
                </Badge>
                <div className="text-lg font-semibold text-foreground mt-1">
                  {fmtK(c.totalAssets)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.description}</div>
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Net Worth Donut + Breakdown */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-400" />
                  Net Worth Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <DonutChart
                    data={client.netWorthBreakdown}
                    size={160}
                    totalLabel={fmtK(client.totalAssets)}
                  />
                  <div className="space-y-2 flex-1">
                    {client.netWorthBreakdown.map((d) => (
                      <div key={d.label} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="text-xs text-muted-foreground flex-1">{d.label}</span>
                        <span className="text-xs font-medium text-foreground">{fmtK(d.value)}</span>
                        <span className="text-xs text-muted-foreground">
                          {((d.value / client.totalAssets) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Questionnaire */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Risk Tolerance Questionnaire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {riskDimensions.map((dim) => (
                  <div key={dim.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{dim.label}</span>
                      <span className="text-xs text-muted-foreground">{dim.desc}</span>
                    </div>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[riskAnswers[dim.key]]}
                      onValueChange={([v]) =>
                        setRiskAnswers((prev) => ({ ...prev, [dim.key]: v }))
                      }
                      className="h-1.5"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                ))}
                <div className="mt-3 p-3 rounded-lg bg-muted/60 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Risk Score</span>
                  <div className="flex items-center gap-2">
                    <Progress value={riskScore} className="w-24 h-2" />
                    <span className={cn("text-sm font-semibold", riskLabel.color)}>
                      {riskLabel.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goals Tracker */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Financial Goals Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {client.goals.map((goal) => {
                  const pct = Math.min(100, (goal.current / goal.target) * 100);
                  const priorityColor =
                    goal.priority === "high"
                      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                      : goal.priority === "medium"
                      ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                      : "text-muted-foreground border-border bg-muted/10";
                  return (
                    <div
                      key={goal.name}
                      className="p-3 rounded-lg bg-muted/60 border border-border"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-indigo-400">{goal.icon}</span>
                        <span className="text-sm font-medium text-foreground">{goal.name}</span>
                        <Badge
                          variant="outline"
                          className={cn("text-xs text-muted-foreground ml-auto px-1.5 py-0", priorityColor)}
                        >
                          {goal.priority}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{fmtK(goal.current)}</span>
                        <span>{fmtK(goal.target)} by {goal.targetYear}</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{pct.toFixed(0)}% funded</span>
                        <span>{fmtK(goal.target - goal.current)} remaining</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ASSET ALLOCATION TAB ── */}
        <TabsContent value="allocation" className="space-y-4 data-[state=inactive]:hidden">
          {/* Glide path */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Life-Stage Glide Path (Age 25–85)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-3">
                {[
                  { label: "Equity", color: "#6366f1" },
                  { label: "Bonds", color: "#0ea5e9" },
                  { label: "Alternatives", color: "#f59e0b" },
                  { label: "Cash", color: "#10b981" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
              <GlidePathChart currentAge={client.age} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {/* Current vs Model */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Current vs Model Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioBarChart data={portfolioData} />
                <div className="mt-2 space-y-1">
                  {portfolioData.map((d) => {
                    const diff = d.current - d.model;
                    return (
                      <div key={d.label} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="text-muted-foreground w-24">{d.label}</span>
                        <span className="text-muted-foreground w-12">{d.current}%</span>
                        <span className="text-muted-foreground w-12">{d.model}%</span>
                        <span className={cn("w-14 text-right", diff > 0 ? "text-amber-400" : diff < 0 ? "text-sky-400" : "text-muted-foreground")}>
                          {diff > 0 ? "+" : ""}{diff}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Rebalancing Trades */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  Rebalancing Trade List
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rebalanceTrades.map((trade) => (
                  <div
                    key={trade.ticker}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/60 border border-border"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs text-muted-foreground w-12 justify-center",
                        trade.action === "Buy"
                          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5"
                          : "border-red-500/40 text-red-400 bg-red-500/5"
                      )}
                    >
                      {trade.action}
                    </Badge>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{trade.ticker}</div>
                      <div className="text-xs text-muted-foreground">{trade.reason}</div>
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {fmtK(trade.amount)}
                    </div>
                  </div>
                ))}

                {/* Factor Tilts */}
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Factor Tilts</div>
                  <div className="flex flex-wrap gap-2">
                    {["Value +2%", "Momentum +1.5%", "Quality +1%", "Low Vol -0.5%", "Size +0.5%"].map((tilt) => (
                      <Badge key={tilt} variant="outline" className="text-xs border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                        {tilt}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAX PLANNING TAB ── */}
        <TabsContent value="tax" className="space-y-4 data-[state=inactive]:hidden">
          {/* Summary Banner */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Estimated Annual Tax Savings", value: `$${(totalHarvestSaving + 3_200).toLocaleString()}`, color: "text-emerald-400" },
              { label: "Harvest Opportunities", value: `${harvestSelected.size} selected`, color: "text-indigo-400" },
              { label: "Roth Conversion Benefit", value: fmtK(rothConversionTax.projectedSaving), color: "text-amber-400" },
            ].map((stat) => (
              <Card key={stat.label} className="bg-card border-border">
                <CardContent className="pt-4 pb-4">
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className={cn("text-xl font-bold mt-1", stat.color)}>{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tax-Loss Harvesting */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Tax-Loss Harvesting Scanner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {HARVEST_POSITIONS.map((pos) => {
                  const selected = harvestSelected.has(pos.ticker);
                  return (
                    <motion.button
                      key={pos.ticker}
                      whileHover={{ scale: 1.005 }}
                      onClick={() => {
                        setHarvestSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(pos.ticker)) next.delete(pos.ticker);
                          else next.add(pos.ticker);
                          return next;
                        });
                      }}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        selected
                          ? "border-indigo-500/50 bg-indigo-500/10"
                          : "border-border bg-muted/40 hover:border-border"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                          selected ? "bg-indigo-600 border-indigo-500" : "border-border"
                        )}>
                          {selected && <CheckCircle className="w-3 h-3 text-foreground" />}
                        </div>
                        <span className="text-sm font-medium text-foreground w-12">{pos.ticker}</span>
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground px-1.5">
                          {pos.sector}
                        </Badge>
                        <div className="ml-auto text-right">
                          <div className="text-xs text-red-400">
                            {fmtK(pos.unrealizedLoss)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            saves {fmtK(pos.taxSaving)}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total tax savings selected</span>
                  <span className="text-sm font-medium text-emerald-400">{fmtK(totalHarvestSaving)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Roth Conversion + Asset Location */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    Roth Conversion Analyzer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Conversion Amount</span>
                      <span className="text-foreground font-medium">
                        {fmtK(rothAmount[0] * 1000)}
                      </span>
                    </div>
                    <Slider
                      min={10}
                      max={200}
                      step={5}
                      value={rothAmount}
                      onValueChange={setRothAmount}
                      className="h-1.5"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$10K</span>
                      <span>$200K</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-muted/60 text-center">
                      <div className="text-xs text-muted-foreground">Tax Due Now</div>
                      <div className="text-sm font-medium text-red-400">
                        {fmtK(rothConversionTax.currentTax)}
                      </div>
                      <div className="text-xs text-muted-foreground">24% marginal</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/60 text-center">
                      <div className="text-xs text-muted-foreground">Est. Lifetime Saving</div>
                      <div className="text-sm font-medium text-emerald-400">
                        {fmtK(rothConversionTax.projectedSaving)}
                      </div>
                      <div className="text-xs text-muted-foreground">vs 35% future rate</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                    <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <p className="text-xs text-amber-300">
                      Consider converting up to top of 24% bracket to avoid future RMDs and higher taxation.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-sky-400" />
                    Asset Location Optimizer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-4 gap-1 text-xs text-muted-foreground pb-1 border-b border-border">
                      <span>Asset</span>
                      <span className="text-center">Taxable</span>
                      <span className="text-center">Traditional</span>
                      <span className="text-center">Roth</span>
                    </div>
                    {ASSET_LOCATION.map((row) => (
                      <div key={row.asset} className="group">
                        <div className="grid grid-cols-4 gap-1 items-center py-1">
                          <span className="text-xs text-muted-foreground">{row.asset}</span>
                          <div className="flex justify-center">
                            {row.taxable ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-border" />
                            )}
                          </div>
                          <div className="flex justify-center">
                            {row.traditional ? (
                              <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-border" />
                            )}
                          </div>
                          <div className="flex justify-center">
                            {row.roth ? (
                              <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-border" />
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground px-0 pb-1 col-span-4 hidden group-hover:block">
                          {row.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── REPORTING TAB ── */}
        <TabsContent value="reporting" className="space-y-4 data-[state=inactive]:hidden">
          {/* Performance Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Portfolio Performance — Last 12 Months
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PerfLineChart />
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { label: "Portfolio YTD", value: fmtPct(portReturn1Y), color: "text-indigo-400" },
                  { label: "Benchmark YTD", value: fmtPct(benchReturn1Y), color: "text-muted-foreground" },
                  { label: "Alpha", value: fmtPct(portReturn1Y - benchReturn1Y), color: "text-emerald-400" },
                  { label: "Info Ratio", value: infoRatio.toFixed(2), color: "text-amber-400" },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-lg bg-muted/60 text-center">
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                    <div className={cn("text-lg font-medium mt-0.5", stat.color)}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {/* Holdings Table */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Holdings &amp; Contribution Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left pb-2 font-medium">Ticker</th>
                        <th className="text-right pb-2 font-medium">Value</th>
                        <th className="text-right pb-2 font-medium">Wt%</th>
                        <th className="text-right pb-2 font-medium">1M</th>
                        <th className="text-right pb-2 font-medium">1Y</th>
                        <th className="text-right pb-2 font-medium">Contrib</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {HOLDINGS.map((h) => (
                        <tr key={h.ticker} className="hover:bg-muted/30 transition-colors">
                          <td className="py-1.5">
                            <div className="font-medium text-foreground">{h.ticker}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[100px]">{h.name}</div>
                          </td>
                          <td className="text-right text-muted-foreground py-1.5">{fmtK(h.value)}</td>
                          <td className="text-right text-muted-foreground py-1.5">{h.weight.toFixed(1)}%</td>
                          <td className={cn("text-right py-1.5", pnlColor(h.return1m))}>
                            {fmtPct(h.return1m)}
                          </td>
                          <td className={cn("text-right py-1.5", pnlColor(h.return1y))}>
                            {fmtPct(h.return1y)}
                          </td>
                          <td className={cn("text-right py-1.5 font-medium", pnlColor(h.contribution))}>
                            {fmtPct(h.contribution)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border text-muted-foreground font-medium">
                        <td className="pt-2">Total</td>
                        <td className="text-right pt-2">{fmtK(totalPortValue)}</td>
                        <td className="text-right pt-2">100%</td>
                        <td className="text-right pt-2 text-emerald-400">+1.8%</td>
                        <td className="text-right pt-2 text-emerald-400">+14.8%</td>
                        <td className="text-right pt-2 text-emerald-400">+12.3%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Risk Metrics + PDF Summary */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    Risk Metrics Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "Sharpe Ratio",
                        value: sharpe.toFixed(2),
                        desc: "Risk-adj return vs risk-free",
                        color: sharpe > 1 ? "text-emerald-400" : "text-amber-400",
                        bar: (sharpe / 2) * 100,
                      },
                      {
                        label: "Sortino Ratio",
                        value: sortino.toFixed(2),
                        desc: "Downside-adj return",
                        color: sortino > 1.5 ? "text-emerald-400" : "text-amber-400",
                        bar: (sortino / 3) * 100,
                      },
                      {
                        label: "Max Drawdown",
                        value: `${maxDrawdown}%`,
                        desc: "Worst peak-to-trough decline",
                        color: "text-red-400",
                        bar: Math.abs(maxDrawdown) * 3,
                      },
                      {
                        label: "Info Ratio",
                        value: infoRatio.toFixed(2),
                        desc: "Alpha per unit of tracking error",
                        color: infoRatio > 0.5 ? "text-indigo-400" : "text-muted-foreground",
                        bar: infoRatio * 100,
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="p-3 rounded-lg bg-muted/60 border border-border"
                      >
                        <div className="text-xs text-muted-foreground mb-0.5">{m.label}</div>
                        <div className={cn("text-xl font-medium", m.color)}>{m.value}</div>
                        <div className="text-xs text-muted-foreground mb-1.5">{m.desc}</div>
                        <Progress value={m.bar} className="h-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* PDF-style Summary Card */}
              <Card className="bg-card border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Quarterly Summary Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
                    <span>Client</span>
                    <span className="text-foreground font-medium">{client.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
                    <span>Portfolio Value</span>
                    <span className="text-foreground font-medium">{fmtK(totalPortValue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
                    <span>YTD Return</span>
                    <span className="text-emerald-400 font-medium">{fmtPct(portReturn1Y)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
                    <span>vs Benchmark</span>
                    <span className="text-emerald-400 font-medium">
                      +{(portReturn1Y - benchReturn1Y).toFixed(1)}% alpha
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
                    <span>Risk Profile</span>
                    <span className="text-foreground font-medium">{client.riskProfile}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                    <span>Est. Tax Savings YTD</span>
                    <span className="text-emerald-400 font-medium">{fmtK(totalHarvestSaving + 3_200)}</span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-foreground gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
