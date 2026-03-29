"use client";

import { useState } from "react";
import {
  Shield,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Building2,
  Landmark,
  Scale,
  Globe,
  FileText,
  ChevronDown,
  ChevronUp,
  Target,
  Layers,
  Lock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 763;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface AllocationSlice {
  label: string;
  pct: number;
  color: string;
  description: string;
}

interface Strategy {
  name: string;
  category: string;
  pros: string[];
  cons: string[];
  taxTreatment: string;
  riskLevel: "Low" | "Medium" | "High";
  timeHorizon: string;
}

interface SuccessionStep {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "complete" | "active" | "pending";
}

// ── Data ───────────────────────────────────────────────────────────────────────

const ALLOCATIONS: AllocationSlice[] = [
  { label: "Real Estate", pct: 28, color: "#6366f1", description: "Direct property + REITs for inflation protection and income" },
  { label: "Equities", pct: 25, color: "#10b981", description: "Global diversified equity portfolio with dividend focus" },
  { label: "Gold & Commodities", pct: 15, color: "#f59e0b", description: "Physical gold, commodity ETFs as inflation hedge" },
  { label: "TIPS & Bonds", pct: 18, color: "#3b82f6", description: "Treasury Inflation-Protected Securities, investment-grade bonds" },
  { label: "Alternatives", pct: 14, color: "#8b5cf6", description: "Private equity, hedge funds, infrastructure" },
];

const STRATEGIES: Strategy[] = [
  {
    name: "Dynasty Trust",
    category: "Estate Planning",
    pros: ["Multi-generational wealth transfer", "Asset protection from creditors", "Estate tax avoidance"],
    cons: ["Complex setup costs", "Irrevocable structure", "Requires trustee oversight"],
    taxTreatment: "Assets removed from taxable estate; trust pays income tax",
    riskLevel: "Low",
    timeHorizon: "50+ years",
  },
  {
    name: "Charitable Remainder Trust",
    category: "Tax Strategy",
    pros: ["Immediate charitable deduction", "Income stream for life", "Capital gains deferral"],
    cons: ["Irrevocable after funding", "Remainder goes to charity", "Actuarial limits apply"],
    taxTreatment: "Partial charitable deduction; income taxed as received",
    riskLevel: "Low",
    timeHorizon: "10–30 years",
  },
  {
    name: "Grantor Retained Annuity Trust",
    category: "Estate Planning",
    pros: ["Transfer appreciation out of estate", "Low IRS hurdle rate", "Retain annuity payments"],
    cons: ["Mortality risk (\"zeroed out\" GRATs)", "Interest rate sensitivity", "No dynasty protection"],
    taxTreatment: "Gift tax only on remainder; annuity taxed as ordinary income",
    riskLevel: "Medium",
    timeHorizon: "2–10 years",
  },
  {
    name: "Qualified Opportunity Zone",
    category: "Tax Strategy",
    pros: ["Capital gains deferral to 2026", "10-yr hold eliminates new gains", "Step-up in basis"],
    cons: ["Illiquid 10-year commitment", "Project execution risk", "Limited qualifying investments"],
    taxTreatment: "Deferred capital gains; 10-yr appreciation tax-free",
    riskLevel: "High",
    timeHorizon: "10 years",
  },
  {
    name: "529 Superfunding",
    category: "Education",
    pros: ["5-year gift tax averaging", "$90K per beneficiary", "Tax-free growth"],
    cons: ["Education use restriction", "Limited investment options", "Penalty on non-qualified withdrawals"],
    taxTreatment: "No income deduction federally; state deductions vary",
    riskLevel: "Low",
    timeHorizon: "5–20 years",
  },
  {
    name: "Offshore Private Placement",
    category: "Insurance",
    pros: ["Tax-deferred growth", "Asset protection", "Investment flexibility"],
    cons: ["High minimum ($1M+)", "PFIC/FBAR reporting", "Complex compliance"],
    taxTreatment: "Tax-deferred; withdrawals taxed as ordinary income",
    riskLevel: "Medium",
    timeHorizon: "10+ years",
  },
  {
    name: "Donor-Advised Fund",
    category: "Philanthropy",
    pros: ["Immediate tax deduction", "Invest & grow tax-free", "Flexibility in grant timing"],
    cons: ["Irrevocable contribution", "No income back to donor", "Minimum distribution expectations"],
    taxTreatment: "Full fair-market-value deduction up to 60% AGI",
    riskLevel: "Low",
    timeHorizon: "1–30 years",
  },
  {
    name: "Private Placement Life Insurance",
    category: "Insurance",
    pros: ["Tax-free death benefit", "Tax-deferred accumulation", "Creditor protection"],
    cons: ["MEC rules restrict access", "Insurance costs drag returns", "Regulatory complexity"],
    taxTreatment: "Death benefit income-tax-free; loans/withdrawals can be tax-free",
    riskLevel: "Medium",
    timeHorizon: "20+ years",
  },
];

// ── Helper Components ──────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex items-start gap-3">
          <div className={cn("rounded-lg p-2 mt-0.5", color)}>{icon}</div>
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-bold text-foreground">{value}</div>
            {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── SVG Pie Chart ──────────────────────────────────────────────────────────────

function PieChartSVG({ slices }: { slices: AllocationSlice[] }) {
  const cx = 120;
  const cy = 120;
  const r = 90;

  let cumAngle = -Math.PI / 2;
  const paths = slices.map((slice) => {
    const startAngle = cumAngle;
    const sweep = (slice.pct / 100) * 2 * Math.PI;
    cumAngle += sweep;
    const endAngle = cumAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;

    return {
      d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`,
      color: slice.color,
      label: slice.label,
      pct: slice.pct,
    };
  });

  return (
    <svg width="240" height="240" viewBox="0 0 240 240">
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.color} stroke="#1a1a2e" strokeWidth="2" opacity="0.9" />
      ))}
      <circle cx={cx} cy={cy} r={40} fill="#0f0f1a" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">
        HNW
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="9">
        Portfolio
      </text>
    </svg>
  );
}

// ── Inflation Erosion Chart ────────────────────────────────────────────────────

function InflationErosionChart() {
  const W = 520;
  const H = 220;
  const pad = { top: 20, right: 20, bottom: 40, left: 60 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const years = Array.from({ length: 31 }, (_, i) => i);
  const rates = [
    { rate: 2, color: "#10b981", label: "2% (Fed Target)" },
    { rate: 4, color: "#f59e0b", label: "4% (Elevated)" },
    { rate: 6, color: "#ef4444", label: "6% (High)" },
  ];

  const purchasing = (year: number, rate: number) =>
    1_000_000 * Math.pow(1 - rate / 100, year);

  const maxVal = 1_000_000;
  const minVal = 0;

  const toX = (yr: number) => pad.left + (yr / 30) * iW;
  const toY = (val: number) => pad.top + (1 - (val - minVal) / (maxVal - minVal)) * iH;

  const formatM = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v / 1000)}K`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {/* Grid lines */}
      {[0, 250000, 500000, 750000, 1000000].map((v, i) => (
        <g key={i}>
          <line
            x1={pad.left}
            y1={toY(v)}
            x2={pad.left + iW}
            y2={toY(v)}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text x={pad.left - 8} y={toY(v) + 4} textAnchor="end" fill="#64748b" fontSize="10">
            {formatM(v)}
          </text>
        </g>
      ))}
      {/* X axis labels */}
      {[0, 5, 10, 15, 20, 25, 30].map((yr) => (
        <text key={yr} x={toX(yr)} y={H - 8} textAnchor="middle" fill="#64748b" fontSize="10">
          {yr === 0 ? "Now" : `Yr ${yr}`}
        </text>
      ))}
      {/* Lines */}
      {rates.map(({ rate, color, label }) => {
        const points = years
          .map((yr) => `${toX(yr)},${toY(purchasing(yr, rate))}`)
          .join(" ");
        return (
          <g key={rate}>
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <text
              x={toX(30) + 4}
              y={toY(purchasing(30, rate)) + 4}
              fill={color}
              fontSize="9"
              fontWeight="600"
            >
              {label}
            </text>
          </g>
        );
      })}
      {/* X axis */}
      <line x1={pad.left} y1={pad.top + iH} x2={pad.left + iW} y2={pad.top + iH} stroke="#475569" strokeWidth="1" />
      {/* Y axis */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + iH} stroke="#475569" strokeWidth="1" />
    </svg>
  );
}

// ── Tax Drag Bar Chart ─────────────────────────────────────────────────────────

function TaxDragChart() {
  const W = 520;
  const H = 220;
  const pad = { top: 20, right: 20, bottom: 50, left: 60 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const data = [
    { label: "Taxable Acct", withoutOpt: 4.8, withOpt: 6.1 },
    { label: "Tax-Deferred", withoutOpt: 6.2, withOpt: 7.0 },
    { label: "Tax-Free (Roth)", withoutOpt: 7.0, withOpt: 7.0 },
    { label: "Life Insurance", withoutOpt: 5.5, withOpt: 6.8 },
    { label: "Opportunity Zone", withoutOpt: 5.0, withOpt: 7.5 },
  ];

  const maxVal = 8;
  const barGroupW = iW / data.length;
  const barW = barGroupW * 0.3;
  const gap = barGroupW * 0.08;

  const toY = (v: number) => pad.top + (1 - v / maxVal) * iH;
  const barH = (v: number) => (v / maxVal) * iH;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {/* Grid */}
      {[0, 2, 4, 6, 8].map((v) => (
        <g key={v}>
          <line
            x1={pad.left}
            y1={toY(v)}
            x2={pad.left + iW}
            y2={toY(v)}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text x={pad.left - 8} y={toY(v) + 4} textAnchor="end" fill="#64748b" fontSize="10">
            {v}%
          </text>
        </g>
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const groupX = pad.left + i * barGroupW + barGroupW * 0.1;
        return (
          <g key={i}>
            {/* Without optimization */}
            <rect
              x={groupX}
              y={toY(d.withoutOpt)}
              width={barW}
              height={barH(d.withoutOpt)}
              fill="#ef4444"
              opacity="0.75"
              rx="2"
            />
            {/* With optimization */}
            <rect
              x={groupX + barW + gap}
              y={toY(d.withOpt)}
              width={barW}
              height={barH(d.withOpt)}
              fill="#10b981"
              opacity="0.85"
              rx="2"
            />
            {/* Label */}
            <text
              x={groupX + barW + gap / 2}
              y={H - 10}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
            >
              {d.label}
            </text>
            {/* Value labels */}
            <text
              x={groupX + barW / 2}
              y={toY(d.withoutOpt) - 3}
              textAnchor="middle"
              fill="#ef4444"
              fontSize="8"
              fontWeight="600"
            >
              {d.withoutOpt}%
            </text>
            <text
              x={groupX + barW + gap + barW / 2}
              y={toY(d.withOpt) - 3}
              textAnchor="middle"
              fill="#10b981"
              fontSize="8"
              fontWeight="600"
            >
              {d.withOpt}%
            </text>
          </g>
        );
      })}

      {/* Axes */}
      <line x1={pad.left} y1={pad.top + iH} x2={pad.left + iW} y2={pad.top + iH} stroke="#475569" strokeWidth="1" />
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + iH} stroke="#475569" strokeWidth="1" />

      {/* Legend */}
      <rect x={pad.left} y={pad.top - 16} width={10} height={10} fill="#ef4444" opacity="0.75" rx="1" />
      <text x={pad.left + 14} y={pad.top - 7} fill="#94a3b8" fontSize="9">Without Optimization</text>
      <rect x={pad.left + 140} y={pad.top - 16} width={10} height={10} fill="#10b981" opacity="0.85" rx="1" />
      <text x={pad.left + 154} y={pad.top - 7} fill="#94a3b8" fontSize="9">With Optimization</text>
    </svg>
  );
}

// ── Strategy Card ──────────────────────────────────────────────────────────────

function StrategyCard({ strategy }: { strategy: Strategy }) {
  const [expanded, setExpanded] = useState(false);

  const riskColor = {
    Low: "bg-green-500/10 text-green-400 border-green-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    High: "bg-red-500/10 text-red-400 border-red-500/20",
  }[strategy.riskLevel];

  const catColor: Record<string, string> = {
    "Estate Planning": "bg-primary/10 text-primary border-border",
    "Tax Strategy": "bg-primary/10 text-primary border-border",
    "Education": "bg-teal-500/10 text-emerald-400 border-teal-500/20",
    "Insurance": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    "Philanthropy": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  };

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">{strategy.name}</div>
            <div className="text-xs text-muted-foreground">{strategy.timeHorizon}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", catColor[strategy.category] || "")}>
            {strategy.category}
          </Badge>
          <Badge variant="outline" className={cn("text-xs", riskColor)}>
            {strategy.riskLevel} Risk
          </Badge>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border">
              <div>
                <div className="text-xs font-semibold text-green-400 mb-1.5 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Pros
                </div>
                <ul className="space-y-1">
                  {strategy.pros.map((p, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                      <span className="text-green-500 mt-0.5">+</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-red-400 mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Cons
                </div>
                <ul className="space-y-1">
                  {strategy.cons.map((c, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                      <span className="text-red-500 mt-0.5">−</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-medium text-primary mb-1.5 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Tax Treatment
                </div>
                <p className="text-xs text-muted-foreground">{strategy.taxTreatment}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Succession Timeline ────────────────────────────────────────────────────────

function SuccessionTimeline() {
  const steps: SuccessionStep[] = [
    {
      year: "Year 1–2",
      title: "Foundation: Wills & Powers of Attorney",
      description: "Establish revocable living trust, durable power of attorney, healthcare proxy, and beneficiary designations across all accounts.",
      icon: <FileText className="w-4 h-4" />,
      status: "complete",
    },
    {
      year: "Year 2–5",
      title: "Annual Gifting Program",
      description: "Systematic annual exclusion gifts ($18,000/recipient in 2024), 529 superfunding for grandchildren, and Crummey notices for irrevocable trusts.",
      icon: <DollarSign className="w-4 h-4" />,
      status: "complete",
    },
    {
      year: "Year 3–7",
      title: "Irrevocable Trust Structures",
      description: "Establish ILIT (Irrevocable Life Insurance Trust), SLAT (Spousal Lifetime Access Trust), or dynasty trust to remove assets from taxable estate.",
      icon: <Lock className="w-4 h-4" />,
      status: "active",
    },
    {
      year: "Year 5–10",
      title: "Business Succession Planning",
      description: "GRAT or installment sale to intentionally defective grantor trust (IDGT) to transfer business interests; buy-sell agreement among heirs.",
      icon: <Building2 className="w-4 h-4" />,
      status: "pending",
    },
    {
      year: "Year 10–20",
      title: "Philanthropic Structures",
      description: "Establish private foundation or donor-advised fund; consider charitable remainder trusts or charitable lead trusts for income + estate reduction.",
      icon: <Star className="w-4 h-4" />,
      status: "pending",
    },
    {
      year: "Ongoing",
      title: "Review & Adapt",
      description: "Annual review with estate attorney; update for tax law changes, family circumstances, and asset changes. Coordinate with CPA and financial advisor.",
      icon: <Clock className="w-4 h-4" />,
      status: "pending",
    },
  ];

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const statusColor = {
          complete: "bg-green-500",
          active: "bg-primary",
          pending: "bg-muted-foreground/30",
        }[step.status];

        const borderColor = {
          complete: "border-green-500/30",
          active: "border-primary/40",
          pending: "border-border",
        }[step.status];

        return (
          <div key={i} className="flex gap-4">
            {/* Timeline column */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 z-10",
                  step.status === "complete"
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : step.status === "active"
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                {step.status === "complete" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.icon
                )}
              </div>
              {!isLast && (
                <div className={cn("w-0.5 flex-1 mt-0.5 mb-0.5", statusColor)} />
              )}
            </div>

            {/* Content */}
            <div className={cn("flex-1 pb-6 border rounded-lg p-3 mb-3 ml-0", borderColor, "bg-card/50")}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{step.title}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    step.status === "complete"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : step.status === "active"
                      ? "bg-primary/10 text-primary border-border"
                      : "text-muted-foreground border-border"
                  )}
                >
                  {step.year}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tax Strategy Panel ─────────────────────────────────────────────────────────

function TaxStrategyPanel() {
  const strategies = [
    {
      title: "Tax-Loss Harvesting",
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      saving: "0.5–1.5% annual drag",
      description: "Systematically realize losses to offset gains. Use direct indexing for $1M+ taxable accounts to harvest individual stock losses.",
      complexity: "Medium",
    },
    {
      title: "Asset Location Optimization",
      icon: <Layers className="w-4 h-4 text-primary" />,
      saving: "0.4–0.7% after-tax return",
      description: "Place tax-inefficient assets (bonds, REITs) in tax-deferred accounts; equities in taxable. Coordinate across all account types.",
      complexity: "Low",
    },
    {
      title: "Roth Conversion Ladder",
      icon: <BarChart3 className="w-4 h-4 text-primary" />,
      saving: "Significant in low-tax years",
      description: "Convert traditional IRA to Roth during low-income years (gap years, early retirement) to reduce future RMDs.",
      complexity: "Medium",
    },
    {
      title: "Qualified Business Income Deduction",
      icon: <Building2 className="w-4 h-4 text-amber-400" />,
      saving: "Up to 20% of QBI",
      description: "Structure business income through pass-through entities to maximize the 199A deduction for eligible trades or businesses.",
      complexity: "High",
    },
    {
      title: "Municipal Bond Ladder",
      icon: <Landmark className="w-4 h-4 text-muted-foreground" />,
      saving: "Tax-exempt income",
      description: "Build a laddered portfolio of investment-grade munis. At 37% marginal rate, 4% muni yield ≈ 6.35% taxable equivalent.",
      complexity: "Low",
    },
    {
      title: "Qualified Opportunity Zones",
      icon: <Globe className="w-4 h-4 text-pink-400" />,
      saving: "Capital gains elimination",
      description: "Invest capital gains in QOZ funds. 10-year hold eliminates all appreciation from federal tax. Requires illiquidity tolerance.",
      complexity: "High",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {strategies.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <Card className="bg-card border-border h-full">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-2 bg-muted shrink-0">{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{s.title}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs shrink-0",
                        s.complexity === "Low"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : s.complexity === "Medium"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      )}
                    >
                      {s.complexity}
                    </Badge>
                  </div>
                  <div className="text-xs text-primary font-medium mb-1.5">{s.saving}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ── Inflation Hedges Panel ─────────────────────────────────────────────────────

function InflationHedgesPanel() {
  const hedges = [
    {
      asset: "TIPS (Treasury Inflation-Protected Securities)",
      correlation: 0.85,
      expectedReturn: "Real 0.5–1.5%",
      liquidity: "High",
      notes: "Principal adjusts with CPI. Ideal for 5–20yr horizons. Avoid in rising real-rate environments.",
    },
    {
      asset: "Real Estate (Direct + REITs)",
      correlation: 0.72,
      expectedReturn: "Real 3–5%",
      liquidity: "Low–Medium",
      notes: "Rents tend to rise with inflation. Net lease REITs pass inflation to tenants contractually.",
    },
    {
      asset: "Gold & Precious Metals",
      correlation: 0.61,
      expectedReturn: "Real 0–2%",
      liquidity: "High",
      notes: "Store of value; outperforms during stagflation. Volatile; best as 5–15% portfolio allocation.",
    },
    {
      asset: "Commodities Basket",
      correlation: 0.78,
      expectedReturn: "Real 1–3%",
      liquidity: "High",
      notes: "Broad exposure via ETFs. Energy and agriculture most inflation-sensitive. High volatility.",
    },
    {
      asset: "Infrastructure",
      correlation: 0.68,
      expectedReturn: "Real 4–6%",
      liquidity: "Low",
      notes: "Regulated utilities and toll roads have CPI-linked revenue. Excellent for long-term HNW allocation.",
    },
    {
      asset: "I-Series Savings Bonds",
      correlation: 1.0,
      expectedReturn: "Real 0% + CPI",
      liquidity: "Low (1yr lock)",
      notes: "$10K/year federal limit. Perfect inflation protection, but capacity-constrained for HNW.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Asset</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Inflation Hedge Score</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Expected Real Return</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Liquidity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {hedges.map((h, i) => (
              <tr key={i} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-xs font-medium text-foreground">{h.asset}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 hidden md:block">{h.notes}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden hidden sm:block">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${h.correlation * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-emerald-400">{(h.correlation * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <span className="text-xs text-primary font-medium">{h.expectedReturn}</span>
                </td>
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      h.liquidity === "High"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : h.liquidity.startsWith("Low–")
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}
                  >
                    {h.liquidity}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Purchasing Power Erosion: $1M over 30 Years
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <InflationErosionChart />
          <div className="mt-2 grid grid-cols-3 gap-3">
            {[
              { rate: "2%", final: "$550K", color: "text-emerald-400" },
              { rate: "4%", final: "$308K", color: "text-amber-400" },
              { rate: "6%", final: "$174K", color: "text-red-400" },
            ].map((item) => (
              <div key={item.rate} className="text-center bg-muted/30 rounded-lg p-2">
                <div className="text-xs text-muted-foreground">At {item.rate} inflation</div>
                <div className={cn("text-sm font-bold", item.color)}>{item.final}</div>
                <div className="text-xs text-muted-foreground">real value</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function WealthPreservationPage() {
  // Consume PRNG to generate some page-level data deterministically
  const hedgePct = Math.round(rand() * 5 + 38); // 38–43
  const taxScore = Math.round(rand() * 10 + 78); // 78–88
  const divScore = Math.round(rand() * 8 + 82);  // 82–90

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-l-4 border-l-primary p-6 rounded-lg bg-card/40"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="rounded-md p-2.5 bg-indigo-500/10">
                <Shield className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Wealth Preservation Strategies</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-14">
              Advanced frameworks for protecting, growing, and transferring high-net-worth portfolios
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              HNW Focus
            </Badge>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              $5M+ AUM
            </Badge>
          </div>
        </motion.div>

        {/* ── Key Metrics ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-l-4 border-l-primary p-6 rounded-lg bg-card/40">
          <MetricCard
            icon={<Target className="w-4 h-4 text-emerald-400" />}
            label="Real Return Target"
            value="4.5%"
            sub="After inflation & taxes"
            color="bg-emerald-500/10"
          />
          <MetricCard
            icon={<Shield className="w-4 h-4 text-amber-400" />}
            label="Inflation Hedge %"
            value={`${hedgePct}%`}
            sub="Of total portfolio"
            color="bg-amber-500/10"
          />
          <MetricCard
            icon={<Scale className="w-4 h-4 text-primary" />}
            label="Tax Efficiency Score"
            value={`${taxScore}/100`}
            sub="vs. 58 avg unoptimized"
            color="bg-primary/10"
          />
          <MetricCard
            icon={<PieChart className="w-4 h-4 text-primary" />}
            label="Diversification Score"
            value={`${divScore}/100`}
            sub="Across 5 asset classes"
            color="bg-primary/10"
          />
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="allocation">
          <TabsList className="w-full md:w-auto grid grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
            <TabsTrigger value="tax">Tax Strategy</TabsTrigger>
            <TabsTrigger value="inflation">Inflation Hedges</TabsTrigger>
            <TabsTrigger value="succession">Succession Planning</TabsTrigger>
          </TabsList>

          {/* ── Asset Allocation Tab ── */}
          <TabsContent value="allocation" className="mt-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie chart */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-indigo-400" />
                      Preservation Allocation Model
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <PieChartSVG slices={ALLOCATIONS} />
                    <div className="w-full grid grid-cols-1 gap-1.5">
                      {ALLOCATIONS.map((slice) => (
                        <div key={slice.label} className="flex items-start gap-2">
                          <div
                            className="w-3 h-3 rounded-sm shrink-0 mt-0.5"
                            style={{ background: slice.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <span className="text-xs font-medium text-foreground">{slice.label}</span>
                              <span className="text-xs font-medium text-foreground">{slice.pct}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{slice.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tax drag chart */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      After-Tax Returns: Optimized vs. Unoptimized
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TaxDragChart />
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                      Proper asset location, tax-loss harvesting, and vehicle selection can add 1–2% of net annual return for high-income taxpayers. The difference compounds dramatically over decades.
                    </p>
                    <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-border">
                      <div className="text-xs font-medium text-primary mb-1">Key Insight</div>
                      <p className="text-xs text-muted-foreground">
                        At a 37% marginal rate + 3.8% NIIT, unoptimized equity returns of 8% yield only 4.3% after-tax. Tax optimization can recover 1.5–2% annually.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Strategy table */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-primary" />
                    Preservation Strategy Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {STRATEGIES.map((s, i) => (
                    <StrategyCard key={i} strategy={s} />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Tax Strategy Tab ── */}
          <TabsContent value="tax" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-amber-400">High-Net-Worth Tax Drag: </span>
                    Investors in the top tax bracket (37% ordinary, 23.8% long-term capital gains including NIIT) pay 40–50% more in taxes than those using comprehensive optimization strategies. Tax alpha is often the largest single driver of after-tax wealth accumulation.
                  </p>
                </div>
              </div>
              <TaxStrategyPanel />
            </motion.div>
          </TabsContent>

          {/* ── Inflation Hedges Tab ── */}
          <TabsContent value="inflation" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-red-400">Silent Wealth Destroyer: </span>
                    At 4% inflation, a $10M portfolio loses $400K in real purchasing power annually without hedging. Over 30 years at 4% inflation, $10M shrinks to equivalent of $3.08M today. Inflation protection is not optional for generational wealth preservation.
                  </p>
                </div>
              </div>
              <InflationHedgesPanel />
            </motion.div>
          </TabsContent>

          {/* ── Succession Planning Tab ── */}
          <TabsContent value="succession" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground mb-1">$13.61M</div>
                    <div className="text-xs text-muted-foreground">2024 Federal Estate Tax Exemption</div>
                    <div className="text-xs text-amber-400 mt-1">Sunsets Dec 31, 2025 → ~$7M</div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground mb-1">40%</div>
                    <div className="text-xs text-muted-foreground">Federal Estate Tax Rate</div>
                    <div className="text-xs text-muted-foreground mt-1">Above exemption amount</div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground mb-1">$18,000</div>
                    <div className="text-xs text-muted-foreground">2024 Annual Gift Exclusion</div>
                    <div className="text-xs text-muted-foreground mt-1">Per recipient, indexed to inflation</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Succession Planning Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SuccessionTimeline />
                </CardContent>
              </Card>

              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-indigo-400 mb-1">Critical 2025 Planning Window</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The 2017 Tax Cuts and Jobs Act doubled estate tax exemptions expire December 31, 2025. Families with estates above $7M should act now to lock in the higher $13.61M exemption through irrevocable trusts, GRATs, or direct gifts before the sunset. Failure to act may cost $2.7M+ in additional estate taxes per couple.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
