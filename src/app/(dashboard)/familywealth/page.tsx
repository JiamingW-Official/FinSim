"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Gift,
  Shield,
  BookOpen,
  Heart,
  Building2,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  Info,
  BarChart3,
  Landmark,
  FileText,
  Star,
  Clock,
  Target,
  Briefcase,
  Home,
  Scale,
  Globe,
  GraduationCap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 752005;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Shared UI helpers ──────────────────────────────────────────────────────────

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
    blue: "bg-primary/10 text-primary border-border",
    purple: "bg-primary/10 text-primary border-border",
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
    default: "border-border bg-card",
    green: "border-green-500/30 bg-green-500/5",
    amber: "border-amber-500/30 bg-amber-500/5",
    blue: "border-border bg-primary/5",
    purple: "border-border bg-primary/5",
  }[variant];
  return (
    <div className={cn("rounded-lg border p-4", cls)}>
      <div className="text-sm font-medium text-foreground mb-2">{title}</div>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function CardRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium text-foreground">{value}</span>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

// ── Tab 1: Wealth Transfer ─────────────────────────────────────────────────────

const TRANSFER_STRATEGIES = [
  {
    name: "GRAT",
    full: "Grantor Retained Annuity Trust",
    icon: TrendingUp,
    color: "blue" as const,
    summary: "Freeze asset value; growth passes estate-tax free",
    mechanics:
      "Grantor transfers assets into trust and receives fixed annuity for a term (2–10 yrs). At term end, remaining assets pass to beneficiaries with no gift tax if the trust 'zeroes out.'",
    bestFor: "Appreciating assets — public stock, private equity, real estate",
    risk: "Grantor must survive the trust term; interest rate environment matters (§7520 rate)",
    taxBenefit: "Estate/gift tax savings on all appreciation above §7520 rate",
  },
  {
    name: "SLAT",
    full: "Spousal Lifetime Access Trust",
    icon: Heart,
    color: "purple" as const,
    summary: "Lock in lifetime exemption today while preserving indirect access",
    mechanics:
      "One spouse gifts assets (up to lifetime exemption) into an irrevocable trust for the other spouse's benefit. The beneficiary spouse retains access; assets removed from both estates upon death.",
    bestFor: "Married couples seeking to leverage current high exemption ($13.6M) before 2026 sunset",
    risk: "Divorce risk; reciprocal trust doctrine (both spouses shouldn't mirror-SLAT each other)",
    taxBenefit: "Up to $13.6M per spouse removed from taxable estate; income tax neutral (grantor trust)",
  },
  {
    name: "IDGT",
    full: "Intentionally Defective Grantor Trust",
    icon: Shield,
    color: "green" as const,
    summary: "Sell assets to trust; grantor pays income tax as additional gift",
    mechanics:
      "Grantor sells appreciating assets to trust in exchange for a promissory note at AFR. Trust is 'defective' for income tax (grantor pays tax), but outside the estate. No capital gains on the sale.",
    bestFor: "Business interests, investment real estate, pre-IPO stock",
    risk: "IRS scrutiny on installment sale structure; must have adequate seed capital (typically 10%)",
    taxBenefit: "Freeze value at sale; all future growth in trust; income tax payments = additional tax-free gifts",
  },
  {
    name: "FLP",
    full: "Family Limited Partnership",
    icon: Users,
    color: "amber" as const,
    summary: "Consolidate family assets; apply valuation discounts of 25–40%",
    mechanics:
      "Parents form LP/LLC, contribute assets, retain GP interest. LP interests gifted to children at discounted value (lack of control + lack of marketability). Centralizes management.",
    bestFor: "Large investment portfolios, operating businesses, real estate portfolios",
    risk: "IRS attacks on lack of business purpose; must respect formalities; valuation discounts litigated",
    taxBenefit: "Gift/estate tax savings via discounts; income shifting to lower-bracket family members",
  },
];

interface EstateTaxPoint {
  year: number;
  exemption: number;
  estateValue: number;
  tax: number;
}

function EstateTaxChart() {
  const BASE_ESTATE = 15_000_000;
  const GROWTH = 0.05;
  const TOP_RATE = 0.40;

  // Generate timeline: 2024–2040
  const points: EstateTaxPoint[] = useMemo(() => {
    return Array.from({ length: 17 }, (_, i) => {
      const year = 2024 + i;
      // Exemption: current $13.61M; sunsets to ~$7M in 2026 if not extended
      const exemption =
        year <= 2025
          ? 13_610_000
          : year <= 2026
          ? 7_000_000
          : 7_000_000 * Math.pow(1.03, year - 2026); // inflation-adjusted post-sunset
      const estateValue = BASE_ESTATE * Math.pow(1 + GROWTH, i);
      const taxableEstate = Math.max(0, estateValue - exemption);
      const tax = taxableEstate * TOP_RATE;
      return { year, exemption, estateValue, tax };
    });
  }, []);

  const W = 540;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 28, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxEstate = Math.max(...points.map((p) => p.estateValue));
  const scaleY = (v: number) => PAD.top + innerH - (v / maxEstate) * innerH;
  const scaleX = (i: number) => PAD.left + (i / (points.length - 1)) * innerW;

  const estatePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(p.estateValue).toFixed(1)}`)
    .join(" ");

  const taxPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(p.tax).toFixed(1)}`)
    .join(" ");

  const exemptionPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(p.exemption).toFixed(1)}`)
    .join(" ");

  const yTicks = [0, 5_000_000, 10_000_000, 15_000_000, 20_000_000, 25_000_000];
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(0)}M` : `$${(n / 1_000).toFixed(0)}K`;

  // Find sunset point (year 2026 = index 2)
  const sunsetX = scaleX(2);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">Estate Tax Projection (2024–2040)</span>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-primary" />
            Estate Value
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-red-400" />
            Est. Tax
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-amber-400" />
            Exemption
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Grid lines */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              y1={scaleY(v)}
              x2={W - PAD.right}
              y2={scaleY(v)}
              stroke="currentColor"
              strokeOpacity={0.08}
            />
            <text
              x={PAD.left - 6}
              y={scaleY(v) + 4}
              textAnchor="end"
              fontSize={9}
              fill="currentColor"
              fillOpacity={0.45}
            >
              {fmt(v)}
            </text>
          </g>
        ))}

        {/* Sunset shading */}
        <rect
          x={sunsetX - 1}
          y={PAD.top}
          width={3}
          height={innerH}
          fill="#f59e0b"
          fillOpacity={0.2}
        />
        <text
          x={sunsetX + 5}
          y={PAD.top + 12}
          fontSize={8}
          fill="#f59e0b"
          fillOpacity={0.8}
        >
          Exemption Sunset
        </text>

        {/* Paths */}
        <path d={estatePath} fill="none" stroke="#60a5fa" strokeWidth={2} />
        <path d={taxPath} fill="none" stroke="#f87171" strokeWidth={2} />
        <path d={exemptionPath} fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* X-axis labels */}
        {points.filter((_, i) => i % 4 === 0).map((p, idx) => (
          <text
            key={p.year}
            x={scaleX(idx * 4)}
            y={H - 6}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            fillOpacity={0.45}
          >
            {p.year}
          </text>
        ))}
      </svg>
      <p className="text-xs text-muted-foreground mt-2">
        Assumes $15M estate growing at 5%/yr. Exemption sunsets to ~$7M in 2026 (indexed for inflation thereafter). Estate tax rate 40%.
      </p>
    </div>
  );
}

function WealthTransferTab() {
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="Annual Gift Exclusion" value="$18,000" color="green" />
        <StatChip label="Lifetime Exemption" value="$13.61M" color="blue" />
        <StatChip label="Top Estate Tax Rate" value="40%" color="red" />
        <StatChip label="Exemption Sunset" value="2025 YE" color="amber" />
      </div>

      <EstateTaxChart />

      <SectionHeader
        title="Advanced Transfer Strategies"
        subtitle="Four institutional-grade structures used by ultra-high-net-worth families"
      />

      <div className="space-y-3">
        {TRANSFER_STRATEGIES.map((strat) => {
          const isOpen = expandedStrategy === strat.name;
          const Icon = strat.icon;
          return (
            <div key={strat.name} className="rounded-lg border border-border overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors text-left"
                onClick={() => setExpandedStrategy(isOpen ? null : strat.name)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                      strat.color === "blue" && "bg-primary/10 text-primary",
                      strat.color === "purple" && "bg-primary/10 text-primary",
                      strat.color === "green" && "bg-green-500/10 text-green-400",
                      strat.color === "amber" && "bg-amber-500/10 text-amber-400"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{strat.name}</span>
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        {strat.full}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{strat.summary}</p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 bg-muted/10 border-t border-border/60 space-y-3">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          How It Works
                        </span>
                        <p className="text-sm text-foreground mt-1 leading-relaxed">{strat.mechanics}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <InfoBox title="Best For" variant="blue">
                          {strat.bestFor}
                        </InfoBox>
                        <InfoBox title="Key Risk" variant="amber">
                          {strat.risk}
                        </InfoBox>
                        <InfoBox title="Tax Benefit" variant="green">
                          {strat.taxBenefit}
                        </InfoBox>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Gift Exclusion Planning" variant="green">
          Each individual can give $18,000 per recipient per year (2024) without gift tax or using lifetime exemption.
          A married couple can give $36,000 per recipient via gift-splitting. Over 20 years, a couple with 3 children
          and 6 grandchildren can transfer $3.24M gift-tax free.
        </InfoBox>
        <InfoBox title="2026 Exemption Sunset Alert" variant="amber">
          The Tax Cuts and Jobs Act doubled the estate/gift tax exemption through 2025. Unless extended by Congress,
          the exemption reverts to approximately $7M (inflation-adjusted) on January 1, 2026. Use-it-or-lose-it:
          gifts made now do not claw back even if exemption shrinks.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 2: Family Governance ───────────────────────────────────────────────────

const GOVERNANCE_COMPONENTS = [
  {
    icon: FileText,
    title: "Investment Policy Statement",
    color: "blue" as const,
    items: [
      "Define family investment objectives and time horizon",
      "Set risk tolerance and return expectations by generation",
      "Specify asset allocation ranges and rebalancing triggers",
      "Outline permitted and excluded investment categories",
      "Define benchmark selection and performance evaluation criteria",
      "Document liquidity needs and distribution policy",
    ],
  },
  {
    icon: Scale,
    title: "Family Charter",
    color: "purple" as const,
    items: [
      "State the family mission, vision, and shared purpose",
      "Define rights and responsibilities of family members",
      "Outline decision-making authority and voting rights",
      "Establish conflict resolution procedures",
      "Document entry/exit rules for family partnerships",
      "Set communication norms and transparency expectations",
    ],
  },
  {
    icon: Heart,
    title: "Shared Values Statement",
    color: "green" as const,
    items: [
      "Identify core values that guide wealth stewardship",
      "Document family history and the source of wealth",
      "Articulate philanthropic priorities and giving philosophy",
      "Define expectations around work ethic and contribution",
      "Address wealth disclosure and education by age tier",
      "Establish legacy narrative for future generations",
    ],
  },
  {
    icon: GraduationCap,
    title: "Next-Gen Financial Education",
    color: "amber" as const,
    items: [
      "Ages 6–12: Basic saving, earning, and giving concepts",
      "Ages 13–17: Budgeting, compound interest, credit fundamentals",
      "Ages 18–22: Investment accounts, tax basics, career planning",
      "Ages 23–30: Portfolio construction, real estate, entrepreneurship",
      "Ages 30+: Governance responsibilities, philanthropy, succession",
      "Mentorship pairings with family advisors or external mentors",
    ],
  },
];

const COUNCIL_ROLES = [
  { role: "Family Council Chair", responsibility: "Facilitates meetings, sets agenda, coordinates advisors", term: "2-year rotating" },
  { role: "Family Treasurer", responsibility: "Reports on investment performance, cash distributions", term: "2-year rotating" },
  { role: "Education Committee", responsibility: "Oversees next-gen financial literacy program", term: "Standing" },
  { role: "Philanthropy Committee", responsibility: "Evaluates giving priorities, manages DAF distributions", term: "Standing" },
  { role: "Governance Committee", responsibility: "Maintains charter, IPS, and succession planning", term: "Standing" },
  { role: "Independent Advisor", responsibility: "External voice on investments, tax, estate", term: "Retainer" },
];

function FamilyGovernanceTab() {
  const [openComponent, setOpenComponent] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="Wealth Retention (Gen 3)" value="~10%" color="red" />
        <StatChip label="Families with Written IPS" value="28%" color="amber" />
        <StatChip label="Avg Family Meeting Freq." value="Annual" color="default" />
        <StatChip label="Next-Gen Engagement Gap" value="65% unprepared" color="red" />
      </div>

      <SectionHeader
        title="Governance Framework Components"
        subtitle="The four pillars of institutionalized family wealth governance"
      />

      <div className="space-y-3">
        {GOVERNANCE_COMPONENTS.map((comp) => {
          const isOpen = openComponent === comp.title;
          const Icon = comp.icon;
          return (
            <div key={comp.title} className="rounded-lg border border-border overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors text-left"
                onClick={() => setOpenComponent(isOpen ? null : comp.title)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                      comp.color === "blue" && "bg-primary/10 text-primary",
                      comp.color === "purple" && "bg-primary/10 text-primary",
                      comp.color === "green" && "bg-green-500/10 text-green-400",
                      comp.color === "amber" && "bg-amber-500/10 text-amber-400"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm text-foreground">{comp.title}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-3 bg-muted/10 border-t border-border/60">
                      <ul className="space-y-1.5">
                        {comp.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <SectionHeader
        title="Family Council Structure"
        subtitle="Recommended governance roles and responsibilities"
      />

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left py-2 px-4 text-muted-foreground font-medium">Role</th>
              <th className="text-left py-2 px-4 text-muted-foreground font-medium">Responsibility</th>
              <th className="text-left py-2 px-4 text-muted-foreground font-medium">Term</th>
            </tr>
          </thead>
          <tbody>
            {COUNCIL_ROLES.map((r) => (
              <tr key={r.role} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                <td className="py-3 px-4 font-medium text-foreground">{r.role}</td>
                <td className="py-3 px-4 text-muted-foreground">{r.responsibility}</td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className="text-xs">{r.term}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Education Funding ───────────────────────────────────────────────────

function EducationCostChart() {
  const startYear = 2024;
  const points = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const year = startYear + i;
      // Public 4yr cost ~$27k/yr inflating 3%/yr
      const publicAnnual = 27_000 * Math.pow(1.03, i);
      // Private 4yr ~$60k/yr inflating 4%/yr
      const privateAnnual = 60_000 * Math.pow(1.04, i);
      // 529 with $500/mo saving invested at 7%
      const months = i * 12;
      const monthlyRate = 0.07 / 12;
      const plan529 = months === 0 ? 0 : (500 * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
      return { year, publicTotal: publicAnnual * 4, privateTotal: privateAnnual * 4, plan529 };
    });
  }, []);

  const W = 540;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 28, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...points.map((p) => p.privateTotal));
  const scaleY = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;
  const scaleX = (i: number) => PAD.left + (i / (points.length - 1)) * innerW;

  const publicPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(p.publicTotal).toFixed(1)}`)
    .join(" ");
  const privatePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(p.privateTotal).toFixed(1)}`)
    .join(" ");
  const savingsPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(p.plan529).toFixed(1)}`)
    .join(" ");

  const yTicks = [0, 100_000, 200_000, 300_000, 400_000, 500_000];
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}K`;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">4-Year College Cost vs. 529 Savings (2024–2041)</span>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-primary" />Public</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-primary" />Private</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-green-400" />529 ($500/mo)</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} y1={scaleY(v)} x2={W - PAD.right} y2={scaleY(v)} stroke="currentColor" strokeOpacity={0.08} />
            <text x={PAD.left - 6} y={scaleY(v) + 4} textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.45}>{fmt(v)}</text>
          </g>
        ))}
        <path d={publicPath} fill="none" stroke="#60a5fa" strokeWidth={2} />
        <path d={privatePath} fill="none" stroke="#a78bfa" strokeWidth={2} />
        <path d={savingsPath} fill="none" stroke="#34d399" strokeWidth={2} strokeDasharray="4 3" />
        {points.filter((_, i) => i % 4 === 0).map((p, idx) => (
          <text key={p.year} x={scaleX(idx * 4)} y={H - 6} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.45}>{p.year}</text>
        ))}
      </svg>
      <p className="text-xs text-muted-foreground mt-2">
        Public tuition inflates 3%/yr; private 4%/yr. 529 assumes $500/mo contribution earning 7%/yr.
      </p>
    </div>
  );
}

const EDUCATION_VEHICLES = [
  {
    name: "529 Plan",
    contribution: "No limit (gift tax rules apply)",
    taxBenefit: "Tax-free growth & withdrawals for qualified education",
    financialAid: "5.64% of parental asset",
    flexibility: "Can change beneficiary; rollover to Roth IRA ($35k lifetime cap from 2024)",
    bestFor: "Primary vehicle for most families",
    color: "green" as const,
  },
  {
    name: "529 Superfunding",
    contribution: "Up to $90,000 ($180k/couple) front-loaded",
    taxBenefit: "5-year gift tax election removes lump sum from estate immediately",
    financialAid: "Same as 529 — parental asset treatment",
    flexibility: "Cannot make additional gifts to same child during 5-year window",
    bestFor: "Grandparents or large lump-sum gifting situations",
    color: "blue" as const,
  },
  {
    name: "Coverdell ESA",
    contribution: "$2,000/yr per child (income limits apply)",
    taxBenefit: "Tax-free growth; can use for K–12 expenses",
    financialAid: "Parental asset if owned by parent",
    flexibility: "Must use by age 30; broader investment options than 529",
    bestFor: "K–12 private school planning supplement",
    color: "purple" as const,
  },
  {
    name: "UTMA/UGMA",
    contribution: "No limit (annual gift exclusion rules)",
    taxBenefit: "None — taxable account; 'Kiddie Tax' applies under 19",
    financialAid: "20% of student asset — highest FAFSA impact",
    flexibility: "Irrevocable gift; child controls at majority (18–21)",
    bestFor: "General gifting when education isn't guaranteed goal",
    color: "amber" as const,
  },
  {
    name: "Education Trust",
    contribution: "Unlimited (uses lifetime exemption)",
    taxBenefit: "Removes assets from estate; can span multiple generations",
    financialAid: "Favorable if structured properly — trust asset treatment",
    flexibility: "Trustee controls distribution timing and conditions",
    bestFor: "Ultra-HNW families; generational education endowment",
    color: "default" as const,
  },
];

function EducationFundingTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="4-Yr Public Cost (2024)" value="$108K" color="blue" />
        <StatChip label="4-Yr Private Cost (2024)" value="$240K" color="purple" />
        <StatChip label="Tuition Inflation Rate" value="3–4%/yr" color="amber" />
        <StatChip label="529 Superfund (couple)" value="$180K" color="green" />
      </div>

      <EducationCostChart />

      <SectionHeader
        title="Education Funding Vehicles"
        subtitle="Comprehensive comparison of accounts for college and private K–12 funding"
      />

      <div className="space-y-3">
        {EDUCATION_VEHICLES.map((v) => (
          <div key={v.name} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="font-medium text-sm text-foreground">{v.name}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{v.bestFor}</p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs shrink-0",
                  v.color === "green" && "border-green-500/30 text-green-400",
                  v.color === "blue" && "border-border text-primary",
                  v.color === "purple" && "border-border text-primary",
                  v.color === "amber" && "border-amber-500/30 text-amber-400"
                )}
              >
                {v.color === "green" ? "Recommended" : v.color === "blue" ? "Tax-Efficient" : v.color === "amber" ? "Caution" : "Specialized"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Max Contribution</span>
                <span className="text-foreground font-medium">{v.contribution}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Tax Benefit</span>
                <span className="text-foreground font-medium">{v.taxBenefit}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Financial Aid Impact</span>
                <span className="text-foreground font-medium">{v.financialAid}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Flexibility</span>
                <span className="text-foreground font-medium">{v.flexibility}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <InfoBox title="Financial Aid Strategy" variant="blue">
        FAFSA counts parental assets at 5.64% and student assets at 20%. Funds in 529 plans (parent-owned) are treated as
        parental assets. Starting 2024, grandparent-owned 529 distributions no longer count as student income on FAFSA — a
        major shift that makes grandparent 529s much more aid-friendly.
      </InfoBox>
    </div>
  );
}

// ── Tab 4: Philanthropy ────────────────────────────────────────────────────────

const PHILANTHROPY_VEHICLES = [
  {
    name: "Donor-Advised Fund (DAF)",
    icon: Heart,
    color: "green" as const,
    minSetup: "$5,000",
    adminCost: "0.6–1.0% of assets/yr",
    taxDeduction: "Immediate: up to 60% AGI (cash) / 30% AGI (appreciated assets)",
    incomeBenefit: "None — all assets leave estate",
    control: "Donor recommends grants; sponsor approves",
    highlight: true,
    pros: [
      "Simplest and lowest cost charitable vehicle",
      "Immediate tax deduction even if grants made later",
      "Donate appreciated stock to avoid capital gains",
      "Can invest assets in growth fund while deciding on charities",
      "Multi-generational succession naming available",
    ],
  },
  {
    name: "Charitable Remainder Trust (CRT)",
    icon: DollarSign,
    color: "blue" as const,
    minSetup: "$250,000+",
    adminCost: "1–2% of assets/yr",
    taxDeduction: "Partial: charitable deduction equal to present value of remainder",
    incomeBenefit: "Fixed annuity (CRAT) or % of assets (CRUT) for 10–20 yrs or life",
    control: "Trustee manages investments per trust document",
    highlight: false,
    pros: [
      "Provides income stream for donor or heirs during trust term",
      "Avoids capital gains on appreciated property contributed",
      "Reduces estate with partial deduction",
      "Assets pass to charity at end of term (no estate tax)",
      "Useful for illiquid appreciated assets",
    ],
  },
  {
    name: "Private Foundation",
    icon: Landmark,
    color: "purple" as const,
    minSetup: "$1,000,000+",
    adminCost: "1–3% + 1.39% excise tax on net investment income",
    taxDeduction: "30% AGI (cash) / 20% AGI (appreciated assets)",
    incomeBenefit: "Must distribute 5%/yr; family can receive reasonable compensation",
    control: "Full donor control over investment and grant-making",
    highlight: false,
    pros: [
      "Maximum control over grant-making decisions",
      "Can employ family members in governance roles",
      "Perpetual entity for multi-generational philanthropy",
      "Establishes family legacy and brand in philanthropy",
      "Can make program-related investments (PRIs)",
    ],
  },
  {
    name: "Qualified Charitable Distribution (QCD)",
    icon: Gift,
    color: "amber" as const,
    minSetup: "None",
    adminCost: "None",
    taxDeduction: "Excludes up to $105,000/yr from IRA RMD income",
    incomeBenefit: "Satisfies RMD without recognizing income",
    control: "Direct transfer from IRA to qualified charity",
    highlight: false,
    pros: [
      "Best strategy for retirees over 70½ with IRA",
      "Reduces MAGI, potentially lowering Medicare premiums",
      "Satisfies RMD without recognizing taxable income",
      "Simple — no trust required",
      "Can donate up to $105K (indexed) per year",
    ],
  },
];

function PhilanthropyTab() {
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>("Donor-Advised Fund (DAF)");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="US Charitable Giving (2023)" value="$557B" color="green" />
        <StatChip label="Avg DAF Payout Rate" value="~22%/yr" color="blue" />
        <StatChip label="Private Foundation Min Dist." value="5%/yr" color="amber" />
        <StatChip label="QCD Annual Limit" value="$105K" color="purple" />
      </div>

      <SectionHeader
        title="Philanthropic Vehicles"
        subtitle="Structured giving strategies from simplest to most complex"
      />

      <div className="space-y-3">
        {PHILANTHROPY_VEHICLES.map((v) => {
          const isOpen = expandedVehicle === v.name;
          const Icon = v.icon;
          return (
            <div
              key={v.name}
              className={cn(
                "rounded-lg border overflow-hidden",
                v.highlight ? "border-green-500/30" : "border-border"
              )}
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors text-left"
                onClick={() => setExpandedVehicle(isOpen ? null : v.name)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                      v.color === "green" && "bg-green-500/10 text-green-400",
                      v.color === "blue" && "bg-primary/10 text-primary",
                      v.color === "purple" && "bg-primary/10 text-primary",
                      v.color === "amber" && "bg-amber-500/10 text-amber-400"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{v.name}</span>
                      {v.highlight && (
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 px-1.5 py-0">
                          Most Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Min setup: {v.minSetup} · Admin: {v.adminCost}
                    </p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-3 bg-muted/10 border-t border-border/60 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <CardRow label="Tax Deduction" value={v.taxDeduction} />
                          <CardRow label="Income Benefit" value={v.incomeBenefit} />
                          <CardRow label="Control" value={v.control} />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Benefits</span>
                          <ul className="mt-2 space-y-1.5">
                            {v.pros.map((p) => (
                              <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="DAF vs. Private Foundation Decision" variant="blue">
          Use a DAF when simplicity and cost matter most. Use a private foundation when family control, brand, or
          the ability to hire family members in governance is important. Most advisors recommend DAFs for estates
          under $10M in charitable intent and foundations for $5M+ dedicated philanthropic endowments.
        </InfoBox>
        <InfoBox title="Appreciated Stock Strategy" variant="green">
          Donating long-term appreciated securities directly to a DAF is the most tax-efficient charitable move.
          You receive a fair-market-value deduction AND avoid capital gains tax on the appreciation. A $100K stock
          position with $80K gain saves ~$15K in taxes vs. selling and donating cash.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 5: Business & Real Estate ──────────────────────────────────────────────

const ENTITY_STRUCTURES = [
  {
    name: "Operating Company (OpCo)",
    type: "LLC or C-Corp",
    purpose: "Actively runs the business; employs staff, holds IP, generates revenue",
    liability: "Limited to entity assets",
    taxTreatment: "Pass-through (LLC) or double taxation (C-Corp with QSBS benefits)",
    succession: "Interests transferred via gift or sale to family trust or next-gen",
    icon: Briefcase,
    color: "blue" as const,
  },
  {
    name: "Holding Company (HoldCo)",
    type: "LLC or LP",
    purpose: "Owns interests in OpCo; holds investments, real estate, cash",
    liability: "Insulates HoldCo assets from OpCo liabilities",
    taxTreatment: "Consolidated pass-through; management fee from OpCo",
    succession: "Primary vehicle for estate planning transfers and FLP discounts",
    icon: Building2,
    color: "purple" as const,
  },
  {
    name: "Family LLC / FLP",
    type: "LP or LLC",
    purpose: "Consolidates family investment assets; applies valuation discounts",
    liability: "General partner controls distributions; limited partners passive",
    taxTreatment: "Pass-through; income allocated to lower-bracket family members",
    succession: "LP interests gifted over time at discounted values (25–40% discount)",
    icon: Users,
    color: "green" as const,
  },
  {
    name: "Real Estate Entity",
    type: "LLC per property",
    purpose: "Isolates each property's liability; separates from personal assets",
    liability: "Cross-liability between properties prevented",
    taxTreatment: "Pass-through; depreciation, 1031 exchanges, cost segregation",
    succession: "Membership interests transferred; avoids re-titling property directly",
    icon: Home,
    color: "amber" as const,
  },
];

const SUCCESSION_TIMELINE = [
  { phase: "Pre-Planning (5–10 yrs out)", icon: Target, color: "blue" as const, steps: [
    "Business valuation and enterprise assessment",
    "Identify and develop next-gen leadership candidates",
    "Begin gifting minority interests to reduce taxable estate",
    "Establish family governance structure and IPS",
    "Review buy-sell agreements and insurance funding",
  ]},
  { phase: "Active Transition (2–5 yrs out)", icon: TrendingUp, color: "green" as const, steps: [
    "Install successor in formal leadership role with mentorship",
    "Transfer operational control in staged milestones",
    "Complete IDGT or FLP transfers while exemption is high",
    "Renegotiate key customer, supplier, and employment contracts",
    "Engage investment banker for external sale alternative valuation",
  ]},
  { phase: "Execution (0–2 yrs)", icon: CheckCircle, color: "amber" as const, steps: [
    "Execute ownership transfer via gift, sale, or recapitalization",
    "File 709 gift tax returns for all transfers",
    "Update operating agreements, board composition",
    "Notify lenders, insurers, and key counterparties",
    "Establish earnout or consulting transition if selling",
  ]},
];

function BusinessRealEstateTab() {
  const [openPhase, setOpenPhase] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="Family Businesses (US)" value="19M+" color="blue" />
        <StatChip label="Survive to Gen 3" value="12%" color="red" />
        <StatChip label="Avg FLP Discount" value="25–40%" color="green" />
        <StatChip label="Business Transfer Window" value="5–10 yrs" color="amber" />
      </div>

      <SectionHeader
        title="Entity Structure Overview"
        subtitle="OpCo / HoldCo / FLP architecture used by family enterprises"
      />

      {/* Entity diagram */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-medium text-foreground mb-4">Recommended Family Enterprise Structure</div>
        <div className="flex flex-col items-center gap-2 text-xs">
          <div className="flex gap-3">
            <div className="rounded-md border border-border bg-primary/10 text-primary px-4 py-2 text-center font-medium">
              Family Trust / Estate Plan
            </div>
          </div>
          <div className="text-muted-foreground">|</div>
          <div className="flex gap-3">
            <div className="rounded-md border border-border bg-primary/10 text-primary px-4 py-2 text-center font-medium">
              HoldCo LLC / LP
            </div>
          </div>
          <div className="flex gap-8 text-muted-foreground">
            <span>|</span>
            <span>|</span>
            <span>|</span>
          </div>
          <div className="flex gap-3">
            <div className="rounded-md border border-border bg-primary/5 text-primary px-3 py-2 text-center">
              OpCo LLC
            </div>
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 text-amber-300 px-3 py-2 text-center">
              RE Entity LLC
            </div>
            <div className="rounded-md border border-green-500/30 bg-green-500/5 text-green-300 px-3 py-2 text-center">
              Investment FLP
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          The Trust owns the HoldCo; the HoldCo holds interests in operating entities. This structure insulates liability,
          centralizes governance, and creates transferable units for gift/estate planning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ENTITY_STRUCTURES.map((e) => {
          const Icon = e.icon;
          return (
            <div key={e.name} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                    e.color === "blue" && "bg-primary/10 text-primary",
                    e.color === "purple" && "bg-primary/10 text-primary",
                    e.color === "green" && "bg-green-500/10 text-green-400",
                    e.color === "amber" && "bg-amber-500/10 text-amber-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.type}</div>
                </div>
              </div>
              <div className="space-y-0">
                <CardRow label="Purpose" value={e.purpose} />
                <CardRow label="Liability" value={e.liability} />
                <CardRow label="Tax Treatment" value={e.taxTreatment} />
                <CardRow label="Succession" value={e.succession} />
              </div>
            </div>
          );
        })}
      </div>

      <SectionHeader
        title="Business Succession Timeline"
        subtitle="Phased approach to transitioning a family business to the next generation"
      />

      <div className="space-y-3">
        {SUCCESSION_TIMELINE.map((phase) => {
          const isOpen = openPhase === phase.phase;
          const Icon = phase.icon;
          return (
            <div key={phase.phase} className="rounded-lg border border-border overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors text-left"
                onClick={() => setOpenPhase(isOpen ? null : phase.phase)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                      phase.color === "blue" && "bg-primary/10 text-primary",
                      phase.color === "green" && "bg-green-500/10 text-green-400",
                      phase.color === "amber" && "bg-amber-500/10 text-amber-400"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm text-foreground">{phase.phase}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-3 bg-muted/10 border-t border-border/60">
                      <ul className="space-y-1.5">
                        {phase.steps.map((step) => (
                          <li key={step} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Cost Segregation & Depreciation" variant="blue">
          Real estate held in entity structures benefits from cost segregation studies (5, 7, 15-yr asset
          reclassification) that accelerate depreciation deductions. Combined with bonus depreciation rules,
          large real estate acquisitions can generate substantial paper losses to offset active income.
        </InfoBox>
        <InfoBox title="1031 Exchange Planning" variant="green">
          Appreciated real estate inside an LLC can defer capital gains indefinitely via 1031 exchanges.
          Combined with step-up in basis at death, this creates a powerful wealth-compounding strategy.
          Delaware Statutory Trusts (DSTs) allow fractional 1031 exchange replacement properties — useful
          for elderly owners seeking passive management.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function FamilyWealthPage() {
  // consume rand to initialize the seeded PRNG state (used for future synthetic data)
  void rand;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Family Wealth Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Multi-generational wealth transfer, governance, education funding, philanthropy, and business succession
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs border-border text-primary">
              Estate Planning
            </Badge>
            <Badge variant="outline" className="text-xs border-border text-primary">
              Family Office
            </Badge>
          </div>
        </div>

        {/* Summary Stats — Hero */}
        <div className="border-l-4 border-l-primary rounded-lg bg-card p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatChip label="UHNW Families (US)" value="~180,000" color="blue" />
          <StatChip label="Avg Gen-3 Wealth Retained" value="~10%" color="red" />
          <StatChip label="Families with Wealth Plan" value="33%" color="amber" />
          <StatChip label="Annual Gift Exclusion 2024" value="$18,000" color="green" />
        </div>

        {/* Alert */}
        <div className="mt-8 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">2026 Exemption Sunset:</span> The federal estate and gift tax
            exemption is scheduled to revert from $13.61M to approximately $7M per person on January 1, 2026 (inflation-adjusted).
            Families with estates over $7M should act before year-end 2025 to lock in the higher exemption.
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transfer" className="space-y-6">
          <TabsList className="grid grid-cols-5 h-auto gap-1 bg-muted/40 p-1">
            <TabsTrigger value="transfer" className="text-xs py-2 flex flex-col items-center gap-1 data-[state=active]:bg-background">
              <Gift className="w-3.5 h-3.5" />
              <span>Wealth Transfer</span>
            </TabsTrigger>
            <TabsTrigger value="governance" className="text-xs py-2 flex flex-col items-center gap-1 data-[state=active]:bg-background">
              <Users className="w-3.5 h-3.5" />
              <span>Governance</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="text-xs py-2 flex flex-col items-center gap-1 data-[state=active]:bg-background">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Education</span>
            </TabsTrigger>
            <TabsTrigger value="philanthropy" className="text-xs py-2 flex flex-col items-center gap-1 data-[state=active]:bg-background">
              <Heart className="w-3.5 h-3.5" />
              <span>Philanthropy</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="text-xs py-2 flex flex-col items-center gap-1 data-[state=active]:bg-background">
              <Building2 className="w-3.5 h-3.5" />
              <span>Business & RE</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transfer" className="data-[state=inactive]:hidden">
            <WealthTransferTab />
          </TabsContent>

          <TabsContent value="governance" className="data-[state=inactive]:hidden">
            <FamilyGovernanceTab />
          </TabsContent>

          <TabsContent value="education" className="data-[state=inactive]:hidden">
            <EducationFundingTab />
          </TabsContent>

          <TabsContent value="philanthropy" className="data-[state=inactive]:hidden">
            <PhilanthropyTab />
          </TabsContent>

          <TabsContent value="business" className="data-[state=inactive]:hidden">
            <BusinessRealEstateTab />
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="rounded-lg border border-border bg-muted/20 p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            This page is for educational and simulation purposes only. Estate planning, tax, and legal strategies should
            be implemented in consultation with qualified attorneys, CPAs, and financial advisors. Tax laws change frequently;
            verify current limits (e.g., gift exclusion, exemption amounts) before acting.
          </p>
        </div>
      </div>
    </div>
  );
}
