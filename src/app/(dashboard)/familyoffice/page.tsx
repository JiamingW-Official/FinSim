"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  DollarSign,
  TrendingUp,
  Shield,
  Heart,
  Users,
  BarChart3,
  Scale,
  BookOpen,
  Award,
  Target,
  CheckCircle,
  Info,
  Landmark,
  PieChart,
  Layers,
  ArrowUpRight,
  Star,
  Gift,
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

// ── Seeded PRNG ─────────────────────────────────────────────────────────────
let s = 652008;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ────────────────────────────────────────────────────────────────────

interface WealthTier {
  label: string;
  aumMin: string;
  aumMax: string;
  color: string;
  bgColor: string;
  serviceModel: string;
  feeStructure: string;
  keyServices: string[];
  pyramidHeight: number;
  width: number;
}

interface AllocationSlice {
  label: string;
  uhnwPct: number;
  retailPct: number;
  color: string;
}

interface TaxStrategy {
  name: string;
  category: string;
  description: string;
  savingsPotential: string;
  complexity: "Low" | "Medium" | "High";
  icon: string;
}

interface GivingVehicle {
  name: string;
  abbrev: string;
  minAsset: string;
  taxDeduction: string;
  control: number;
  flexibility: number;
  adminBurden: number;
  color: string;
  description: string;
}

interface GovernanceElement {
  title: string;
  description: string;
  components: string[];
  importance: "Critical" | "High" | "Medium";
  icon: React.ReactNode;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const WEALTH_TIERS: WealthTier[] = [
  {
    label: "Mass Affluent",
    aumMin: "$100K",
    aumMax: "$1M",
    color: "text-slate-300",
    bgColor: "bg-slate-700",
    serviceModel: "Digital/Robo + Self-directed",
    feeStructure: "0.25–0.50% AUM or flat fee",
    keyServices: ["Retirement planning", "Basic portfolio mgmt", "Tax prep assistance", "Life insurance"],
    pyramidHeight: 40,
    width: 320,
  },
  {
    label: "High Net Worth",
    aumMin: "$1M",
    aumMax: "$10M",
    color: "text-blue-300",
    bgColor: "bg-blue-900/50",
    serviceModel: "Private Banking / Wealth Advisory",
    feeStructure: "0.75–1.25% AUM",
    keyServices: ["Comprehensive financial plan", "Estate planning basics", "Tax optimization", "Alternative access"],
    pyramidHeight: 55,
    width: 240,
  },
  {
    label: "Very High Net Worth",
    aumMin: "$10M",
    aumMax: "$100M",
    color: "text-violet-300",
    bgColor: "bg-violet-900/50",
    serviceModel: "Private Wealth Management",
    feeStructure: "0.50–0.90% AUM",
    keyServices: ["Multi-generational planning", "Direct PE/VC access", "Philanthropic advisory", "Family governance"],
    pyramidHeight: 65,
    width: 160,
  },
  {
    label: "Ultra High Net Worth",
    aumMin: "$100M",
    aumMax: "$1B",
    color: "text-amber-300",
    bgColor: "bg-amber-900/50",
    serviceModel: "Single/Multi-Family Office",
    feeStructure: "0.25–0.50% AUM or fixed retainer",
    keyServices: ["Co-investment deals", "Bespoke structuring", "Dynasty trust planning", "Impact investing"],
    pyramidHeight: 75,
    width: 100,
  },
  {
    label: "Family Office Tier",
    aumMin: "$1B+",
    aumMax: "∞",
    color: "text-yellow-300",
    bgColor: "bg-yellow-900/50",
    serviceModel: "Dedicated Single Family Office",
    feeStructure: "Fixed $2–10M+ annual budget",
    keyServices: ["Full staff (CIO, CFO, legal)", "Proprietary deal flow", "Foundation management", "Family concierge"],
    pyramidHeight: 80,
    width: 56,
  },
];

const ALLOCATION_DATA: AllocationSlice[] = [
  { label: "Public Equities", uhnwPct: 28, retailPct: 55, color: "#3b82f6" },
  { label: "Private Equity / VC", uhnwPct: 22, retailPct: 2, color: "#8b5cf6" },
  { label: "Real Assets", uhnwPct: 15, retailPct: 5, color: "#f59e0b" },
  { label: "Hedge Funds", uhnwPct: 12, retailPct: 1, color: "#10b981" },
  { label: "Fixed Income", uhnwPct: 14, retailPct: 30, color: "#06b6d4" },
  { label: "Cash & Equivalents", uhnwPct: 9, retailPct: 7, color: "#6b7280" },
];

const TAX_STRATEGIES: TaxStrategy[] = [
  {
    name: "Grantor Retained Annuity Trust (GRAT)",
    category: "Estate Planning",
    description: "Transfer appreciation above IRS hurdle rate (7520 rate) to heirs gift-tax free. Zeroed-out GRATs are common for high-growth assets.",
    savingsPotential: "$1M–$50M+ estate tax savings",
    complexity: "High",
    icon: "🏛️",
  },
  {
    name: "Irrevocable Life Insurance Trust (ILIT)",
    category: "Estate Planning",
    description: "Removes life insurance proceeds from taxable estate. Policy owned by trust; death benefit passes outside estate, funding liquidity for heirs.",
    savingsPotential: "40% estate tax on policy proceeds avoided",
    complexity: "Medium",
    icon: "🛡️",
  },
  {
    name: "Qualified Personal Residence Trust (QPRT)",
    category: "Estate Planning",
    description: "Transfer home to heirs at a discounted gift-tax value by retaining use for a term. Works best in low-interest-rate environments.",
    savingsPotential: "30–50% discount on residence value",
    complexity: "Medium",
    icon: "🏡",
  },
  {
    name: "Tax-Loss Harvesting at Scale",
    category: "Portfolio Tax",
    description: "Systematic harvesting of unrealized losses to offset capital gains across a multi-account portfolio, maintaining market exposure via swaps.",
    savingsPotential: "0.5–1.5% annualized after-tax alpha",
    complexity: "Medium",
    icon: "📉",
  },
  {
    name: "Charitable Remainder Trust (CRT)",
    category: "Charitable Giving",
    description: "Donor transfers appreciated assets; trust sells tax-free, pays annuity to donor for life or term, remainder to charity. Immediate partial deduction.",
    savingsPotential: "30–50% of contribution as income deduction",
    complexity: "High",
    icon: "💝",
  },
  {
    name: "Opportunity Zone Investment",
    category: "Capital Gains Deferral",
    description: "Invest capital gains in a Qualified Opportunity Fund within 180 days. Defer gains to 2026, exclude future appreciation after 10-year hold.",
    savingsPotential: "Tax-free appreciation on 10+ year gains",
    complexity: "High",
    icon: "🏗️",
  },
  {
    name: "Donor-Advised Fund (DAF)",
    category: "Charitable Giving",
    description: "Contribute appreciated assets, take immediate deduction, invest grant funds for growth, distribute to charities over time at donor's discretion.",
    savingsPotential: "Avoid capital gains + income deduction up to 60% AGI",
    complexity: "Low",
    icon: "🎁",
  },
  {
    name: "Qualified Small Business Stock (QSBS)",
    category: "Capital Gains Exclusion",
    description: "Section 1202 exclusion: up to $10M or 10× basis in gains excluded from federal tax on original-issue C-corp stock held 5+ years.",
    savingsPotential: "Up to $10M federal gain excluded per issuer",
    complexity: "Medium",
    icon: "🚀",
  },
];

const GIVING_VEHICLES: GivingVehicle[] = [
  {
    name: "Donor-Advised Fund",
    abbrev: "DAF",
    minAsset: "$5,000",
    taxDeduction: "Immediate (up to 60% AGI cash / 30% appreciated)",
    control: 75,
    flexibility: 90,
    adminBurden: 10,
    color: "#3b82f6",
    description: "Simplest charitable giving vehicle. Sponsor manages administration. Donor retains advisory role on grants.",
  },
  {
    name: "Private Foundation",
    abbrev: "PF",
    minAsset: "$1M+",
    taxDeduction: "Up to 30% AGI (cash); 20% (appreciated assets)",
    control: 100,
    flexibility: 60,
    adminBurden: 90,
    color: "#8b5cf6",
    description: "Maximum control and legacy branding. Requires annual 5% payout, 990-PF filing, excise taxes on investment income.",
  },
  {
    name: "Charitable Remainder Trust",
    abbrev: "CRT",
    minAsset: "$100K",
    taxDeduction: "Partial (present value of remainder interest)",
    control: 50,
    flexibility: 30,
    adminBurden: 60,
    color: "#f59e0b",
    description: "Income stream for donor, remainder to charity. Ideal for appreciated low-basis assets held by older donors.",
  },
  {
    name: "Charitable Lead Trust",
    abbrev: "CLT",
    minAsset: "$500K",
    taxDeduction: "Gift/estate tax deduction for charity's lead interest",
    control: 40,
    flexibility: 25,
    adminBurden: 65,
    color: "#10b981",
    description: "Reverses CRT: charity receives annuity first, heirs receive remainder. Excellent in low-rate environments.",
  },
  {
    name: "Supporting Organization",
    abbrev: "SO",
    minAsset: "$500K",
    taxDeduction: "Up to 50% AGI (like public charities)",
    control: 60,
    flexibility: 50,
    adminBurden: 70,
    color: "#06b6d4",
    description: "Hybrid between DAF and private foundation. Higher deduction limits, but must support specific public charities.",
  },
];

const GOVERNANCE_ELEMENTS: GovernanceElement[] = [
  {
    title: "Family Constitution",
    description: "A foundational governing document codifying the family's mission, values, decision-making framework, and rules for wealth transition across generations.",
    components: [
      "Mission & values statement",
      "Wealth philosophy principles",
      "Decision-making protocols",
      "Conflict resolution mechanism",
      "Amendment procedures",
      "Succession planning rules",
    ],
    importance: "Critical",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Investment Committee",
    description: "Formal committee governing investment strategy, manager selection, risk parameters, and performance review. Includes family members and independent advisors.",
    components: [
      "Independent directors (≥2 non-family)",
      "Quarterly meeting cadence",
      "Formal IPS (Investment Policy Statement)",
      "Manager due diligence framework",
      "Risk budget oversight",
      "Compensation benchmarking",
    ],
    importance: "Critical",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Next-Gen Education Program",
    description: "Structured curriculum preparing rising generation for responsible stewardship, entrepreneurship, and civic engagement — not just inheritance.",
    components: [
      "Financial literacy curriculum",
      "Internship / career mentorship",
      "Philanthropic project management",
      "Board observer roles (age 18+)",
      "Full board membership (age 25+)",
      "Annual family retreat & workshops",
    ],
    importance: "High",
    icon: <Award className="h-5 w-5" />,
  },
  {
    title: "Trustee Selection & Oversight",
    description: "Rigorous selection of corporate and individual trustees, with clear succession plans and performance evaluation to prevent conflicts of interest.",
    components: [
      "Corporate trustee due diligence",
      "Trust protector appointment",
      "Decanting powers reserved",
      "Annual trustee performance review",
      "Removal & replacement protocol",
      "Dynasty trust jurisdiction selection",
    ],
    importance: "Critical",
    icon: <Scale className="h-5 w-5" />,
  },
  {
    title: "Family Meeting Framework",
    description: "Regular cadence of structured meetings at multiple levels — from branch family gatherings to full-family assemblies — ensuring engagement and transparency.",
    components: [
      "Annual family assembly (2–3 days)",
      "Semi-annual council meetings",
      "Quarterly branch family calls",
      "Formal agenda & minutes",
      "Guest speaker series",
      "Retreat & team-building components",
    ],
    importance: "High",
    icon: <Users className="h-5 w-5" />,
  },
];

// ── Helper: Donut chart path ──────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

// ── SVG Donut Chart ───────────────────────────────────────────────────────────

function DonutChart({ data, activeUHNW }: { data: AllocationSlice[]; activeUHNW: boolean }) {
  const cx = 130;
  const cy = 130;
  const outerR = 110;
  const innerR = 62;
  const values = activeUHNW ? data.map(d => d.uhnwPct) : data.map(d => d.retailPct);
  const total = values.reduce((a, b) => a + b, 0);

  let cumAngle = 0;
  const slices = data.map((d, i) => {
    const pct = values[i] / total;
    const startAngle = cumAngle;
    const sweep = pct * 360;
    cumAngle += sweep;
    return { ...d, startAngle, endAngle: cumAngle, pct };
  });

  return (
    <svg viewBox="0 0 260 260" className="w-full max-w-xs mx-auto">
      {slices.map((sl, i) => {
        const midAngle = (sl.startAngle + sl.endAngle) / 2;
        const labelR = outerR + 18;
        const lp = polarToCartesian(cx, cy, labelR, midAngle);
        const showLabel = sl.pct > 0.06;
        return (
          <g key={i}>
            <path
              d={`${arcPath(cx, cy, outerR, sl.startAngle, sl.endAngle)} L ${polarToCartesian(cx, cy, innerR, sl.endAngle).x} ${polarToCartesian(cx, cy, innerR, sl.endAngle).y} A ${innerR} ${innerR} 0 ${sl.endAngle - sl.startAngle > 180 ? 1 : 0} 0 ${polarToCartesian(cx, cy, innerR, sl.startAngle).x} ${polarToCartesian(cx, cy, innerR, sl.startAngle).y} Z`}
              fill={sl.color}
              opacity={0.9}
            />
            {showLabel && (
              <text
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fill="white"
                fontWeight="600"
              >
                {Math.round(sl.pct * 100)}%
              </text>
            )}
          </g>
        );
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500">
        {activeUHNW ? "UHNW" : "Retail"}
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fill="#64748b">
        Allocation
      </text>
    </svg>
  );
}

// ── SVG Pyramid ────────────────────────────────────────────────────────────────

function WealthPyramid({ tiers, selected, onSelect }: {
  tiers: WealthTier[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  const totalHeight = 300;
  const baseWidth = 340;
  const cx = 170;
  let yOffset = 20;

  return (
    <svg viewBox="0 0 340 340" className="w-full max-w-sm mx-auto cursor-pointer">
      {[...tiers].reverse().map((tier, ri) => {
        const i = tiers.length - 1 - ri;
        const sliceH = tier.pyramidHeight * 0.7;
        const halfW = tier.width / 2;
        const prevTier = ri > 0 ? [...tiers].reverse()[ri - 1] : null;
        const prevHalfW = prevTier ? prevTier.width / 2 : baseWidth / 2;

        const x1 = cx - prevHalfW;
        const x2 = cx + prevHalfW;
        const x3 = cx + halfW;
        const x4 = cx - halfW;
        const y1 = yOffset + sliceH;
        const y2 = yOffset;

        const isSel = selected === i;
        const fillColor = isSel
          ? tier.label.includes("Family")
            ? "#854d0e"
            : tier.label.includes("Ultra")
            ? "#78350f"
            : tier.label.includes("Very")
            ? "#4c1d95"
            : tier.label.includes("High Net")
            ? "#1e3a5f"
            : "#374151"
          : tier.label.includes("Family")
          ? "#713f12"
          : tier.label.includes("Ultra")
          ? "#92400e"
          : tier.label.includes("Very")
          ? "#5b21b6"
          : tier.label.includes("High Net")
          ? "#1e40af"
          : "#374151";

        const points = `${x1},${y1} ${x2},${y1} ${x3},${y2} ${x4},${y2}`;
        yOffset += sliceH + 2;

        return (
          <g key={i} onClick={() => onSelect(i)} style={{ cursor: "pointer" }}>
            <polygon points={points} fill={fillColor} stroke={isSel ? "white" : "#1e293b"} strokeWidth={isSel ? 2 : 1} opacity={0.92} />
            <text
              x={cx}
              y={(y1 + y2) / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={sliceH > 40 ? "9" : "7.5"}
              fill="white"
              fontWeight="600"
            >
              {tier.label}
            </text>
          </g>
        );
      })}
      {/* base label */}
      <text x={cx} y={totalHeight + 15} textAnchor="middle" fontSize="8" fill="#64748b">
        ▲ Click a tier to explore
      </text>
    </svg>
  );
}

// ── Bar comparison chart ──────────────────────────────────────────────────────

function ComparisonBars({ data }: { data: AllocationSlice[] }) {
  const maxVal = 60;
  return (
    <div className="space-y-3">
      {data.map((sl, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: sl.color }} />
              {sl.label}
            </span>
            <span className="text-slate-300 font-mono">
              UHNW {sl.uhnwPct}% | Retail {sl.retailPct}%
            </span>
          </div>
          <div className="relative h-4 bg-slate-800 rounded overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full rounded opacity-40"
              style={{ background: sl.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(sl.retailPct / maxVal) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
            />
            <motion.div
              className="absolute left-0 top-1 h-2 rounded"
              style={{ background: sl.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(sl.uhnwPct / maxVal) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.07 + 0.1 }}
            />
          </div>
        </div>
      ))}
      <div className="flex gap-4 text-xs text-slate-500 mt-2">
        <span className="flex items-center gap-1"><span className="inline-block w-8 h-2 bg-blue-400 opacity-40 rounded" /> Retail</span>
        <span className="flex items-center gap-1"><span className="inline-block w-8 h-2 bg-blue-400 rounded" /> UHNW</span>
      </div>
    </div>
  );
}

// ── Radar-style bar for giving vehicles ─────────────────────────────────────

function VehicleBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-800 h-2.5 rounded overflow-hidden">
        <motion.div
          className="h-full rounded"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span className="text-xs font-mono text-slate-300 w-8 text-right">{value}</span>
    </div>
  );
}

// ── SVG Giving Comparison ─────────────────────────────────────────────────────

function GivingComparisonChart({ vehicles }: { vehicles: GivingVehicle[] }) {
  // Simple grouped bar SVG
  const w = 300;
  const h = 160;
  const padding = { left: 40, right: 10, top: 10, bottom: 30 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const groups = vehicles.length;
  const groupW = chartW / groups;
  const barW = groupW * 0.22;
  const metrics: Array<{ key: keyof GivingVehicle; color: string; label: string }> = [
    { key: "control", color: "#8b5cf6", label: "Control" },
    { key: "flexibility", color: "#3b82f6", label: "Flexibility" },
    { key: "adminBurden", color: "#ef4444", label: "Admin" },
  ];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {/* Y axis */}
      {[0, 25, 50, 75, 100].map(v => {
        const y = padding.top + chartH - (v / 100) * chartH;
        return (
          <g key={v}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#1e293b" strokeWidth={1} />
            <text x={padding.left - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="7" fill="#64748b">{v}</text>
          </g>
        );
      })}
      {/* Bars */}
      {vehicles.map((veh, gi) => {
        const gx = padding.left + gi * groupW;
        return (
          <g key={gi}>
            {metrics.map((m, mi) => {
              const val = veh[m.key] as number;
              const barH = (val / 100) * chartH;
              const x = gx + mi * (barW + 2) + 4;
              const y = padding.top + chartH - barH;
              return (
                <rect key={mi} x={x} y={y} width={barW} height={barH} fill={m.color} opacity={0.85} rx={2} />
              );
            })}
            <text x={gx + groupW / 2} y={h - padding.bottom + 10} textAnchor="middle" fontSize="7.5" fill="#94a3b8" fontWeight="600">
              {veh.abbrev}
            </text>
          </g>
        );
      })}
      {/* Legend */}
      {metrics.map((m, i) => (
        <g key={i}>
          <rect x={padding.left + i * 62} y={h - 8} width={8} height={8} fill={m.color} rx={1} />
          <text x={padding.left + i * 62 + 10} y={h - 2} fontSize="7" fill="#94a3b8">{m.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Page Component ────────────────────────────────────────────────────────────

export default function FamilyOfficePage() {
  const [selectedTier, setSelectedTier] = useState(2);
  const [activeUHNW, setActiveUHNW] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(0);
  const [expandedTax, setExpandedTax] = useState<number | null>(null);
  const [selectedGov, setSelectedGov] = useState(0);

  // Memoize random stats for tier cards to avoid re-render flicker
  const tierStats = useMemo(
    () =>
      WEALTH_TIERS.map(() => ({
        clientCount: Math.floor(rand() * 9000 + 1000),
        avgAUM: Math.round(rand() * 8 * 10) / 10,
      })),
    []
  );

  const tier = WEALTH_TIERS[selectedTier];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start gap-4"
      >
        <div className="p-3 rounded-xl bg-amber-900/30 border border-amber-700/40">
          <Building2 className="h-7 w-7 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Family Office &amp; Wealth Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Ultra-high-net-worth investment strategies, tax optimization, philanthropy, and multi-generational governance
          </p>
        </div>
      </motion.div>

      {/* KPI chips */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {[
          { label: "Global Family Offices", value: "~10,000", icon: <Building2 className="h-4 w-4 text-amber-400" /> },
          { label: "UHNW Individuals (global)", value: "≈ 218K", icon: <Star className="h-4 w-4 text-yellow-400" /> },
          { label: "Family Office AUM", value: "$5.9T+", icon: <DollarSign className="h-4 w-4 text-green-400" /> },
          { label: "Avg Annual Return (SFO)", value: "15.5%", icon: <TrendingUp className="h-4 w-4 text-blue-400" /> },
        ].map((k, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800">{k.icon}</div>
              <div>
                <div className="text-lg font-bold text-white">{k.value}</div>
                <div className="text-xs text-slate-400">{k.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="tiers">
        <TabsList className="bg-slate-900 border border-slate-800 flex-wrap h-auto gap-1 p-1">
          {[
            { value: "tiers", label: "Wealth Tiers", icon: <Layers className="h-3.5 w-3.5" /> },
            { value: "allocation", label: "Asset Allocation", icon: <PieChart className="h-3.5 w-3.5" /> },
            { value: "tax", label: "Tax Optimization", icon: <Shield className="h-3.5 w-3.5" /> },
            { value: "philanthropy", label: "Philanthropy", icon: <Heart className="h-3.5 w-3.5" /> },
            { value: "governance", label: "Family Governance", icon: <Users className="h-3.5 w-3.5" /> },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-slate-700">
              {t.icon}{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── TAB 1: Wealth Tiers ─────────────────────────────────────────────── */}
        <TabsContent value="tiers" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pyramid */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-amber-400" /> Wealth Tier Pyramid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WealthPyramid tiers={WEALTH_TIERS} selected={selectedTier} onSelect={setSelectedTier} />
                <p className="text-center text-xs text-slate-500 mt-2">Click a tier to see detail →</p>
              </CardContent>
            </Card>

            {/* Selected tier detail */}
            <motion.div
              key={selectedTier}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="bg-slate-900 border-slate-800 h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-white">{tier.label}</CardTitle>
                    <Badge className="bg-amber-900/50 text-amber-300 border-amber-700/50 text-xs">
                      {tier.aumMin} – {tier.aumMax}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-800 p-3">
                      <div className="text-xs text-slate-400 mb-1">Service Model</div>
                      <div className="text-sm text-slate-200 font-medium">{tier.serviceModel}</div>
                    </div>
                    <div className="rounded-lg bg-slate-800 p-3">
                      <div className="text-xs text-slate-400 mb-1">Fee Structure</div>
                      <div className="text-sm text-slate-200 font-medium">{tier.feeStructure}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Key Services</div>
                    <div className="space-y-1.5">
                      {tier.keyServices.map((svc, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
                          {svc}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 border-t border-slate-800 pt-3">
                    Illustrative client count at this tier: ~{tierStats[selectedTier].clientCount.toLocaleString()} | Avg AUM: ${tierStats[selectedTier].avgAUM}M
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tier comparison table */}
          <Card className="mt-4 bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-300">Tier Comparison Overview</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-slate-400 py-2 pr-4">Tier</th>
                    <th className="text-left text-slate-400 py-2 pr-4">AUM Range</th>
                    <th className="text-left text-slate-400 py-2 pr-4">Service Model</th>
                    <th className="text-left text-slate-400 py-2">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {WEALTH_TIERS.map((t, i) => (
                    <tr
                      key={i}
                      className={`border-b border-slate-800/50 cursor-pointer hover:bg-slate-800/40 transition-colors ${selectedTier === i ? "bg-slate-800/60" : ""}`}
                      onClick={() => setSelectedTier(i)}
                    >
                      <td className={`py-2 pr-4 font-semibold ${t.color}`}>{t.label}</td>
                      <td className="py-2 pr-4 text-slate-300">{t.aumMin} – {t.aumMax}</td>
                      <td className="py-2 pr-4 text-slate-400">{t.serviceModel}</td>
                      <td className="py-2 text-slate-400">{t.feeStructure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: Asset Allocation ──────────────────────────────────────────── */}
        <TabsContent value="allocation" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-blue-400" /> Portfolio Allocation
                  </CardTitle>
                  <div className="flex gap-1">
                    {(["UHNW", "Retail"] as const).map((label) => (
                      <button
                        key={label}
                        onClick={() => setActiveUHNW(label === "UHNW")}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          (label === "UHNW") === activeUHNW
                            ? "bg-blue-700 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DonutChart data={ALLOCATION_DATA} activeUHNW={activeUHNW} />
                {/* Legend */}
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {ALLOCATION_DATA.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="truncate">{d.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comparison bars */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-violet-400" /> UHNW vs Retail — Side by Side
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonBars data={ALLOCATION_DATA} />
              </CardContent>
            </Card>
          </div>

          {/* Allocation insights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              {
                title: "Illiquidity Premium",
                value: "+3–5%",
                desc: "UHNW investors can tolerate 7–10 year lock-ups in PE/VC and capture an illiquidity premium unavailable to retail investors.",
                color: "text-violet-300",
                icon: <Layers className="h-4 w-4 text-violet-400" />,
              },
              {
                title: "Inflation Hedge",
                value: "15% Real Assets",
                desc: "Infrastructure, farmland, timber, and direct real estate provide inflation-linked cash flows and low correlation to public markets.",
                color: "text-amber-300",
                icon: <Shield className="h-4 w-4 text-amber-400" />,
              },
              {
                title: "Alpha Generation",
                value: "Hedge Funds 12%",
                desc: "Access to top-quartile hedge funds (minimum $5–25M) captures market-neutral, merger-arb, and global macro alpha streams.",
                color: "text-green-300",
                icon: <TrendingUp className="h-4 w-4 text-green-400" />,
              },
            ].map((card, i) => (
              <Card key={i} className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {card.icon}
                    <span className={`font-bold text-lg ${card.color}`}>{card.value}</span>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">{card.title}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── TAB 3: Tax Optimization ─────────────────────────────────────────── */}
        <TabsContent value="tax" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {[
              { label: "Top Federal Estate Tax", value: "40%", sub: "on estates > $13.6M (2024)", color: "text-red-400" },
              { label: "Top Capital Gains Rate", value: "23.8%", sub: "incl. NIIT for UHNW", color: "text-orange-400" },
              { label: "Annual Gift Tax Exclusion", value: "$18K", sub: "per recipient (2024)", color: "text-blue-400" },
            ].map((stat, i) => (
              <Card key={i} className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-white font-medium">{stat.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{stat.sub}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            {TAX_STRATEGIES.map((strat, i) => {
              const isExpanded = expandedTax === i;
              const complexityColor =
                strat.complexity === "High"
                  ? "text-red-400 bg-red-900/30 border-red-800"
                  : strat.complexity === "Medium"
                  ? "text-amber-400 bg-amber-900/30 border-amber-800"
                  : "text-green-400 bg-green-900/30 border-green-800";

              return (
                <Card
                  key={i}
                  className="bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
                  onClick={() => setExpandedTax(isExpanded ? null : i)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{strat.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-white">{strat.name}</div>
                          <div className="text-xs text-slate-400">{strat.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-xs border ${complexityColor}`}>{strat.complexity}</Badge>
                        <ArrowUpRight className={`h-4 w-4 text-slate-500 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2 border-t border-slate-800 pt-3"
                      >
                        <p className="text-sm text-slate-300 leading-relaxed">{strat.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Target className="h-3.5 w-3.5 text-green-400" />
                          <span className="text-green-300 font-medium">{strat.savingsPotential}</span>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── TAB 4: Philanthropy ─────────────────────────────────────────────── */}
        <TabsContent value="philanthropy" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle selector */}
            <div className="space-y-3">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Gift className="h-4 w-4 text-pink-400" /> Giving Vehicle Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GivingComparisonChart vehicles={GIVING_VEHICLES} />
                </CardContent>
              </Card>

              <div className="space-y-2">
                {GIVING_VEHICLES.map((veh, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVehicle(i)}
                    className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                      selectedVehicle === i
                        ? "bg-slate-800 border-slate-600"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: veh.color }} />
                        <span className="text-sm font-medium text-white">{veh.name}</span>
                        <Badge className="text-xs bg-slate-700 text-slate-300">{veh.abbrev}</Badge>
                      </div>
                      <span className="text-xs text-slate-400">Min {veh.minAsset}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected vehicle detail */}
            <motion.div
              key={selectedVehicle}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-900 border-slate-800 h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: GIVING_VEHICLES[selectedVehicle].color }} />
                    <CardTitle className="text-base font-bold text-white">
                      {GIVING_VEHICLES[selectedVehicle].name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {GIVING_VEHICLES[selectedVehicle].description}
                  </p>

                  <div className="rounded-lg bg-slate-800 p-3 space-y-2">
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Tax Deduction</div>
                    <div className="text-sm text-green-300">{GIVING_VEHICLES[selectedVehicle].taxDeduction}</div>
                  </div>

                  <div className="space-y-2.5">
                    <VehicleBar label="Control" value={GIVING_VEHICLES[selectedVehicle].control} color={GIVING_VEHICLES[selectedVehicle].color} />
                    <VehicleBar label="Flexibility" value={GIVING_VEHICLES[selectedVehicle].flexibility} color={GIVING_VEHICLES[selectedVehicle].color} />
                    <VehicleBar label="Admin Burden" value={GIVING_VEHICLES[selectedVehicle].adminBurden} color="#ef4444" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Minimum Asset", value: GIVING_VEHICLES[selectedVehicle].minAsset },
                      { label: "Control Score", value: `${GIVING_VEHICLES[selectedVehicle].control}/100` },
                      { label: "Flexibility", value: `${GIVING_VEHICLES[selectedVehicle].flexibility}/100` },
                      { label: "Admin Burden", value: `${GIVING_VEHICLES[selectedVehicle].adminBurden}/100` },
                    ].map((kv, i) => (
                      <div key={i} className="rounded bg-slate-800 px-2.5 py-2">
                        <div className="text-xs text-slate-400">{kv.label}</div>
                        <div className="text-sm font-semibold text-slate-200">{kv.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Impact investing section */}
          <Card className="mt-4 bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-400" /> Impact Investing &amp; Blended Finance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    title: "Mission-Related Investment (MRI)",
                    desc: "Foundations invest endowment assets aligned with mission (e.g., ESG funds, green bonds). Returns market-rate; counts toward 5% payout only if classified as program-related.",
                    stat: "$1.5T+ in sustainable AUM globally",
                  },
                  {
                    title: "Program-Related Investment (PRI)",
                    desc: "Concessionary investments (loans, guarantees) made from foundation assets to further charitable purpose. Counts toward 5% distribution requirement.",
                    stat: "~$3.9B in PRIs made (2023)",
                  },
                  {
                    title: "Blended Finance Structures",
                    desc: "Catalytic public/philanthropic capital de-risks commercial investment in emerging markets infrastructure, climate tech, and healthcare through first-loss tranches.",
                    stat: "$200B+ mobilized to date",
                  },
                ].map((item, i) => (
                  <div key={i} className="rounded-lg bg-slate-800 p-4 space-y-2">
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    <div className="text-xs font-medium text-pink-300 flex items-center gap-1">
                      <Info className="h-3 w-3" />{item.stat}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 5: Family Governance ─────────────────────────────────────────── */}
        <TabsContent value="governance" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Navigation list */}
            <div className="space-y-2">
              {GOVERNANCE_ELEMENTS.map((el, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedGov(i)}
                  className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
                    selectedGov === i
                      ? "bg-slate-800 border-slate-600"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-slate-400 ${selectedGov === i ? "text-amber-400" : ""}`}>
                        {el.icon}
                      </span>
                      <span className="text-sm font-medium text-white">{el.title}</span>
                    </div>
                    <Badge
                      className={`text-xs border ${
                        el.importance === "Critical"
                          ? "text-red-400 bg-red-900/30 border-red-800"
                          : "text-amber-400 bg-amber-900/30 border-amber-800"
                      }`}
                    >
                      {el.importance}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <motion.div
              key={selectedGov}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800 text-amber-400">
                        {GOVERNANCE_ELEMENTS[selectedGov].icon}
                      </div>
                      <CardTitle className="text-base font-bold text-white">
                        {GOVERNANCE_ELEMENTS[selectedGov].title}
                      </CardTitle>
                    </div>
                    <Badge
                      className={`border ${
                        GOVERNANCE_ELEMENTS[selectedGov].importance === "Critical"
                          ? "text-red-400 bg-red-900/30 border-red-800"
                          : "text-amber-400 bg-amber-900/30 border-amber-800"
                      }`}
                    >
                      {GOVERNANCE_ELEMENTS[selectedGov].importance}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {GOVERNANCE_ELEMENTS[selectedGov].description}
                  </p>

                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                      Key Components
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {GOVERNANCE_ELEMENTS[selectedGov].components.map((comp, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-2 rounded-lg bg-slate-800 px-3 py-2.5"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-300">{comp}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Illustrative governance SVG timeline */}
                  {selectedGov === 0 && (
                    <div className="rounded-lg bg-slate-800 p-4">
                      <div className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">
                        Family Constitution Development Timeline
                      </div>
                      <svg viewBox="0 0 400 60" className="w-full">
                        {["Kickoff Retreat", "Values Workshop", "Draft Review", "Legal Review", "Ratification", "Annual Update"].map((phase, i) => {
                          const x = 30 + i * 68;
                          const isLast = i === 5;
                          return (
                            <g key={i}>
                              {!isLast && (
                                <line x1={x + 12} y1={20} x2={x + 68} y2={20} stroke="#334155" strokeWidth={2} />
                              )}
                              <circle cx={x} cy={20} r={8} fill={i < 3 ? "#f59e0b" : "#334155"} />
                              <text x={x} y={20} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="white" fontWeight="700">{i + 1}</text>
                              <text x={x} y={40} textAnchor="middle" fontSize="6.5" fill="#94a3b8">{phase.split(" ")[0]}</text>
                              <text x={x} y={52} textAnchor="middle" fontSize="6.5" fill="#64748b">{phase.split(" ")[1] ?? ""}</text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )}

                  {selectedGov === 1 && (
                    <div className="rounded-lg bg-slate-800 p-4">
                      <div className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">
                        Investment Committee Meeting Cadence
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs text-center">
                        {[
                          { freq: "Quarterly", label: "Full IC Review", color: "bg-amber-900/50 text-amber-300" },
                          { freq: "Monthly", label: "Portfolio Monitor", color: "bg-blue-900/50 text-blue-300" },
                          { freq: "Weekly", label: "Risk Report", color: "bg-slate-700 text-slate-300" },
                          { freq: "Annual", label: "IPS Review", color: "bg-violet-900/50 text-violet-300" },
                        ].map((row, i) => (
                          <div key={i} className={`rounded-lg px-2 py-2.5 ${row.color}`}>
                            <div className="font-bold">{row.freq}</div>
                            <div className="text-xs opacity-80 mt-0.5">{row.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Governance best practices */}
          <Card className="mt-4 bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" /> Best Practice Principles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    principle: "Separate Ownership from Management",
                    detail: "Family members may own the wealth, but professional managers (CIO, advisors) govern day-to-day operations without interference.",
                    icon: <Scale className="h-4 w-4 text-blue-400" />,
                  },
                  {
                    principle: "Meritocratic Engagement",
                    detail: "Next-gen family members earn governance roles through demonstrated competency and service, not solely by birthright.",
                    icon: <Award className="h-4 w-4 text-yellow-400" />,
                  },
                  {
                    principle: "Transparency &amp; Communication",
                    detail: "Regular reporting to all stakeholders, clear financial statements, and open family meetings prevent rumors and resentment.",
                    icon: <Info className="h-4 w-4 text-teal-400" />,
                  },
                  {
                    principle: "Independent Oversight",
                    detail: "External board members and independent trustees provide accountability, fresh perspective, and protection against self-dealing.",
                    icon: <Shield className="h-4 w-4 text-red-400" />,
                  },
                ].map((bp, i) => (
                  <div key={i} className="rounded-lg bg-slate-800 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      {bp.icon}
                      <span className="text-xs font-semibold text-white">{bp.principle}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: bp.detail }} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer disclaimer */}
      <p className="text-xs text-slate-600 text-center pb-4">
        For educational purposes only. Family office structures and tax strategies involve complex legal and regulatory considerations — consult qualified advisors.
      </p>
    </div>
  );
}
