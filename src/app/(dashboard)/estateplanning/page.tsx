"use client";

import { useState, useMemo } from "react";
import {
  Scale,
  Shield,
  Heart,
  Building2,
  DollarSign,
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Gift,
  Landmark,
  BookOpen,
  BarChart3,
  Briefcase,
  Lock,
  Unlock,
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 712006;
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
      <div className="text-sm text-muted-foreground">{children}</div>
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

// ── Tab 1: Estate Planning Basics ──────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  { category: "Core Documents", items: [
    "Draft a Last Will and Testament",
    "Establish a Revocable Living Trust",
    "Assign Durable Power of Attorney (financial)",
    "Assign Healthcare Power of Attorney",
    "Complete Advance Healthcare Directive (Living Will)",
    "Sign HIPAA Authorization for healthcare providers",
  ]},
  { category: "Beneficiary Designations", items: [
    "Review life insurance beneficiaries",
    "Update IRA & 401(k) beneficiaries",
    "Update pension & annuity beneficiaries",
    "Review TOD (Transfer on Death) accounts",
    "Review POD (Payable on Death) bank accounts",
  ]},
  { category: "Asset Titling", items: [
    "Re-title property into trust",
    "Review joint tenancy vs. tenancy in common",
    "Ensure out-of-state real estate has ancillary plan",
    "List all digital assets and access credentials",
  ]},
  { category: "Review & Maintenance", items: [
    "Review plan every 3–5 years or after life event",
    "Update after marriage, divorce, or death",
    "Verify trustee & executor nominations",
    "Store documents in secure accessible location",
  ]},
];

const DOCUMENT_COMPARISON = [
  {
    doc: "Last Will & Testament",
    purpose: "Distributes assets, names guardian for minors",
    probate: "Yes — public record",
    cost: "$200–$1,500",
    control: "Until death",
    icon: FileText,
  },
  {
    doc: "Revocable Living Trust",
    purpose: "Avoids probate, manages assets during incapacity",
    probate: "No — private",
    cost: "$1,500–$5,000",
    control: "Full lifetime control",
    icon: Shield,
  },
  {
    doc: "Power of Attorney",
    purpose: "Authorizes agent to manage finances if incapacitated",
    probate: "N/A",
    cost: "$200–$500",
    control: "Specified scope",
    icon: Scale,
  },
  {
    doc: "Healthcare Directive",
    purpose: "Specifies end-of-life care wishes",
    probate: "N/A",
    cost: "$0–$300",
    control: "Medical decisions",
    icon: Heart,
  },
  {
    doc: "Beneficiary Designation",
    purpose: "Supersedes will for retirement & insurance assets",
    probate: "No — direct transfer",
    cost: "Free (form update)",
    control: "At account level",
    icon: Users,
  },
];

function EstatePlanningBasicsTab() {
  const [openSection, setOpenSection] = useState<string | null>("Core Documents");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="Avg Estate Plan Cost" value="$2,000–$5,000" color="blue" />
        <StatChip label="Estates Going Through Probate" value="~55%" color="amber" />
        <StatChip label="Avg Probate Duration" value="9–24 months" color="red" />
        <StatChip label="Adults Without a Will" value="67%" color="default" />
      </div>

      <SectionHeader
        title="Core Documents"
        subtitle="Five foundational documents every estate plan should include"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Document</th>
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Purpose</th>
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Probate?</th>
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Typical Cost</th>
            </tr>
          </thead>
          <tbody>
            {DOCUMENT_COMPARISON.map((d) => (
              <tr key={d.doc} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <d.icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{d.doc}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{d.purpose}</td>
                <td className="py-3 pr-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      d.probate === "No — private" || d.probate === "No — direct transfer"
                        ? "border-green-500/30 text-green-400"
                        : d.probate === "Yes — public record"
                        ? "border-red-500/30 text-red-400"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {d.probate}
                  </Badge>
                </td>
                <td className="py-3 text-muted-foreground">{d.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeader
        title="Planning Checklist"
        subtitle="Comprehensive estate planning checklist organized by category"
      />

      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((section) => (
          <div key={section.category} className="rounded-lg border border-border overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors text-left"
              onClick={() =>
                setOpenSection(openSection === section.category ? null : section.category)
              }
            >
              <span className="font-medium text-sm text-foreground">{section.category}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {section.items.length} items
                </Badge>
                {openSection === section.category ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>
            <AnimatePresence initial={false}>
              {openSection === section.category && (
                <motion.div
                  key="content"
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 pt-1 space-y-2">
                    {section.items.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Probate Avoidance Strategies" variant="blue">
          <ul className="space-y-1">
            <li className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" /><span>Revocable living trust (most comprehensive)</span></li>
            <li className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" /><span>Joint tenancy with right of survivorship</span></li>
            <li className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" /><span>Beneficiary designations on accounts</span></li>
            <li className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" /><span>TOD/POD account titling</span></li>
            <li className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" /><span>Lifetime gifting strategies</span></li>
          </ul>
        </InfoBox>
        <InfoBox title="When to Update Your Plan" variant="amber">
          <ul className="space-y-1">
            <li className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" /><span>Marriage, divorce, or domestic partnership</span></li>
            <li className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" /><span>Birth or adoption of child or grandchild</span></li>
            <li className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" /><span>Death of beneficiary, trustee, or executor</span></li>
            <li className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" /><span>Major changes in asset value or composition</span></li>
            <li className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" /><span>Move to a different state</span></li>
            <li className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" /><span>Changes in tax law</span></li>
          </ul>
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 2: Trusts ──────────────────────────────────────────────────────────────

interface TrustType {
  name: string;
  abbrev: string;
  taxTreatment: string;
  control: string;
  assetProtection: string;
  bestFor: string;
  color: string;
  description: string;
}

const TRUST_TYPES: TrustType[] = [
  {
    name: "Revocable Living Trust",
    abbrev: "RLT",
    taxTreatment: "Grantor trust — no separate tax",
    control: "Full — can amend/revoke",
    assetProtection: "None during life",
    bestFor: "Probate avoidance, incapacity planning",
    color: "blue",
    description:
      "Most common estate planning tool. Assets remain in your taxable estate and you retain full control. Becomes irrevocable at death.",
  },
  {
    name: "Irrevocable Trust",
    abbrev: "IT",
    taxTreatment: "Separate trust entity (may be grantor trust)",
    control: "Limited — generally cannot modify",
    assetProtection: "Strong after look-back period",
    bestFor: "Estate tax reduction, asset protection",
    color: "purple",
    description:
      "Once established, terms cannot be easily changed. Assets removed from taxable estate. Useful for Medicaid planning and creditor protection.",
  },
  {
    name: "Grantor Retained Annuity Trust",
    abbrev: "GRAT",
    taxTreatment: "Grantor trust; future appreciation passes tax-free",
    control: "Fixed annuity return retained",
    assetProtection: "Moderate",
    bestFor: "Transferring appreciating assets to heirs",
    color: "green",
    description:
      "Grantor transfers assets, retains annuity for fixed term. If assets outperform the IRS hurdle rate (7520 rate), excess passes to beneficiaries tax-free.",
  },
  {
    name: "Intentionally Defective Grantor Trust",
    abbrev: "IDGT",
    taxTreatment: "Grantor pays income tax; estate tax excluded",
    control: "None after transfer",
    assetProtection: "Strong",
    bestFor: "Installment sales, wealth transfer",
    color: "amber",
    description:
      "\"Defective\" for income tax (grantor pays) but effective for estate tax (assets excluded). Grantor can sell assets to trust without capital gains recognition.",
  },
  {
    name: "Irrevocable Life Insurance Trust",
    abbrev: "ILIT",
    taxTreatment: "Death benefit excluded from estate",
    control: "None — independent trustee",
    assetProtection: "Strong",
    bestFor: "Estate tax liquidity with life insurance",
    color: "red",
    description:
      "Holds life insurance outside your estate. Crummey notices allow annual gift exclusion contributions to pay premiums. Provides liquidity to pay estate taxes.",
  },
  {
    name: "Special Needs Trust",
    abbrev: "SNT",
    taxTreatment: "Separate trust entity",
    control: "Trustee discretion",
    assetProtection: "Protects government benefit eligibility",
    bestFor: "Disabled beneficiaries, Medicaid preservation",
    color: "default",
    description:
      "Supplements (does not replace) government benefits. Allows disabled beneficiary to receive inheritance without losing SSI or Medicaid eligibility.",
  },
];

// SVG bar for comparison value
function ControlBar({ level }: { level: number }) {
  return (
    <svg width="80" height="8" className="inline-block">
      <rect x={0} y={0} width={80} height={8} rx={4} fill="hsl(var(--muted))" />
      <rect x={0} y={0} width={level * 80} height={8} rx={4} fill="hsl(var(--primary))" />
    </svg>
  );
}

function TrustsTab() {
  const [selected, setSelected] = useState<string | null>("RLT");
  const trust = TRUST_TYPES.find((t) => t.abbrev === selected) ?? TRUST_TYPES[0];

  // Generate random hypothetical wealth transfer bars using seeded rand
  const transferData = useMemo(() => {
    s = 712006;
    return TRUST_TYPES.map((t) => ({
      abbrev: t.abbrev,
      transferEfficiency: 0.5 + rand() * 0.45,
      taxSavings: rand() * 0.6,
    }));
  }, []);

  const colorMap: Record<string, string> = {
    blue: "border-border bg-primary/5",
    purple: "border-border bg-primary/5",
    green: "border-green-500/30 bg-green-500/5",
    amber: "border-amber-500/30 bg-amber-500/5",
    red: "border-red-500/30 bg-red-500/5",
    default: "border-border bg-card",
  };

  const badgeColorMap: Record<string, string> = {
    blue: "border-border text-primary",
    purple: "border-border text-primary",
    green: "border-green-500/30 text-green-400",
    amber: "border-amber-500/30 text-amber-400",
    red: "border-red-500/30 text-red-400",
    default: "border-border text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="US Trust Assets (est.)" value="$5.8 Trillion" color="blue" />
        <StatChip label="Avg GRAT Hurdle Rate" value="5.0% (2024)" color="amber" />
        <StatChip label="ILIT Premium Exclusion" value="$18k/yr (2024)" color="green" />
        <StatChip label="SNT Beneficiaries" value="~61M disabled" color="default" />
      </div>

      <SectionHeader title="Trust Types" subtitle="Select a trust to see detailed information" />

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {TRUST_TYPES.map((t) => (
          <button
            key={t.abbrev}
            onClick={() => setSelected(t.abbrev)}
            className={cn(
              "rounded-lg border p-3 text-center transition-all",
              selected === t.abbrev
                ? colorMap[t.color] + " ring-1 ring-primary/50"
                : "border-border bg-card hover:bg-muted/30"
            )}
          >
            <div className={cn("text-xs font-bold mb-1", selected === t.abbrev ? "" : "text-muted-foreground")}>
              {t.abbrev}
            </div>
            <div className="text-xs text-muted-foreground leading-tight hidden md:block">
              {t.name.split(" ").slice(0, 2).join(" ")}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={trust.abbrev}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className={cn("rounded-lg border p-5", colorMap[trust.color])}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-foreground">{trust.name}</h3>
              <Badge
                variant="outline"
                className={cn("text-xs mt-1", badgeColorMap[trust.color])}
              >
                {trust.abbrev}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{trust.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CardRow label="Tax Treatment" value={trust.taxTreatment} />
            <CardRow label="Control" value={trust.control} />
            <CardRow label="Asset Protection" value={trust.assetProtection} />
            <CardRow label="Best For" value={trust.bestFor} />
          </div>
        </motion.div>
      </AnimatePresence>

      <SectionHeader
        title="Comparison: Wealth Transfer Efficiency"
        subtitle="Illustrative relative efficiency and tax savings potential by trust type"
      />

      <div className="space-y-3">
        {transferData.map((d) => {
          const t = TRUST_TYPES.find((x) => x.abbrev === d.abbrev)!;
          return (
            <div key={d.abbrev} className="flex items-center gap-4 rounded-lg border border-border/50 px-4 py-3">
              <div className="w-12 text-xs font-bold text-foreground shrink-0">{d.abbrev}</div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-32 shrink-0">Transfer Efficiency</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.transferEfficiency * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.05 }}
                      className="bg-primary h-1.5 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {Math.round(d.transferEfficiency * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-32 shrink-0">Tax Savings Potential</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.taxSavings * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="bg-green-500 h-1.5 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {Math.round(d.taxSavings * 100)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Tax Strategies ──────────────────────────────────────────────────────

function TaxStrategiesTab() {
  // SVG: Estate tax exemption usage visualization
  const exemptionAmount = 13_610_000;
  const exampleEstate = 8_500_000;
  const pctUsed = exampleEstate / exemptionAmount;

  // Gift tax timeline using seeded PRNG
  const giftData = useMemo(() => {
    s = 712006;
    return Array.from({ length: 8 }, (_, i) => ({
      year: 2017 + i,
      exclusion: i < 3 ? 14000 : i < 5 ? 15000 : i < 6 ? 16000 : i < 7 ? 17000 : 18000,
      lifetime: i < 3 ? 5490000 : i < 5 ? 11180000 : i < 6 ? 12060000 : i < 7 ? 12920000 : 13610000,
    }));
  }, []);

  const maxLifetime = Math.max(...giftData.map((d) => d.lifetime));
  const svgW = 340;
  const svgH = 120;
  const barW = svgW / giftData.length - 8;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="2024 Estate Tax Exemption" value="$13.61M" color="green" />
        <StatChip label="Annual Gift Exclusion" value="$18,000" color="blue" />
        <StatChip label="Top Estate Tax Rate" value="40%" color="red" />
        <StatChip label="Portability Election" value="Available" color="purple" />
      </div>

      <SectionHeader
        title="Federal Estate Tax Exemption"
        subtitle="Current exemption is scheduled to sunset to ~$7M in 2026 without Congressional action"
      />

      <div className="rounded-lg border border-border p-5 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Example Estate: $8.5M</span>
          <span className="text-muted-foreground">Exemption: $13.61M</span>
        </div>
        <div className="relative">
          <div className="h-5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctUsed * 100}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-green-500/80 rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>$0</span>
            <span className="text-green-400 font-medium">{Math.round(pctUsed * 100)}% of exemption used — no estate tax</span>
            <span>$13.61M</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
            <div className="text-xs text-muted-foreground mb-1">Below Exemption</div>
            <div className="font-medium text-green-400">0% tax rate</div>
            <div className="text-xs text-muted-foreground mt-1">Estate passes free of federal estate tax</div>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="text-xs text-muted-foreground mb-1">$1M over exemption</div>
            <div className="font-medium text-amber-400">$400,000 tax</div>
            <div className="text-xs text-muted-foreground mt-1">40% marginal rate on excess</div>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div className="text-xs text-muted-foreground mb-1">2026 Sunset (est.)</div>
            <div className="font-medium text-red-400">~$7M exemption</div>
            <div className="text-xs text-muted-foreground mt-1">Act now to utilize higher exemption</div>
          </div>
        </div>
      </div>

      <SectionHeader
        title="Annual Gift Tax Exclusion History"
        subtitle="Per-recipient annual exclusion and cumulative lifetime exemption over time"
      />

      <div className="rounded-lg border border-border p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-lg h-32">
          {giftData.map((d, i) => {
            const barH = (d.lifetime / maxLifetime) * (svgH - 20);
            const x = i * (svgW / giftData.length) + 4;
            const y = svgH - barH - 10;
            return (
              <g key={d.year}>
                <rect x={x} y={y} width={barW} height={barH} rx={2} fill="hsl(var(--primary) / 0.5)" />
                <text x={x + barW / 2} y={svgH - 1} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={7}>
                  {d.year}
                </text>
                <text x={x + barW / 2} y={y - 2} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={7}>
                  ${(d.lifetime / 1e6).toFixed(1)}M
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <SectionHeader title="Key Tax Strategies" subtitle="Techniques to minimize estate and gift taxes" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Annual Gift Exclusion ($18k/person)" variant="blue">
          <p className="mb-2">Each person can gift up to $18,000 per recipient per year (2024) without using lifetime exemption or filing a gift tax return. Married couples can split gifts: $36,000/recipient.</p>
          <p className="text-xs font-medium text-primary">Example: 2 parents × 3 children = $108,000 tax-free per year</p>
        </InfoBox>
        <InfoBox title="Lifetime Gifting Strategy" variant="green">
          <p className="mb-2">Use the $13.61M lifetime exemption to make large gifts now, before the 2026 sunset. Gifts remove assets — and all future appreciation — from your taxable estate.</p>
          <p className="text-xs font-medium text-primary">Lock in today&apos;s higher exemption; IRS confirmed no clawback risk</p>
        </InfoBox>
        <InfoBox title="Step-Up in Basis" variant="purple">
          <p className="mb-2">Assets inherited at death receive a step-up in cost basis to fair market value. Heirs can immediately sell without capital gains tax on embedded appreciation.</p>
          <p className="text-xs font-medium text-primary">Gifted assets during life carry original basis — plan accordingly</p>
        </InfoBox>
        <InfoBox title="Portability Election" variant="amber">
          <p className="mb-2">Surviving spouse can use deceased spouse&apos;s unused estate tax exemption (DSUE). Must elect on timely filed estate tax return (Form 706) even if no tax is owed.</p>
          <p className="text-xs font-medium text-primary">Can effectively double exemption for married couples</p>
        </InfoBox>
      </div>

      <div className="rounded-lg border border-border p-4">
        <div className="text-sm font-medium text-foreground mb-3">State Estate Tax Summary</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            { state: "Massachusetts", exemption: "$2.0M", rate: "0.8–16%" },
            { state: "Oregon", exemption: "$1.0M", rate: "10–16%" },
            { state: "Washington", exemption: "$2.193M", rate: "10–20%" },
            { state: "Connecticut", exemption: "$13.61M", rate: "12%" },
            { state: "Minnesota", exemption: "$3.0M", rate: "13–16%" },
            { state: "Florida", exemption: "No state tax", rate: "0%" },
          ].map((s) => (
            <div key={s.state} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-1.5">
              <span className="text-muted-foreground">{s.state}</span>
              <div className="text-right">
                <div className="font-medium text-foreground">{s.exemption}</div>
                <div className="text-muted-foreground">{s.rate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Charitable Giving ───────────────────────────────────────────────────

const CHARITABLE_VEHICLES = [
  {
    name: "Donor-Advised Fund",
    abbrev: "DAF",
    upfrontDeduction: "Full FMV",
    incomeToCharity: "100% eventually",
    taxOnGrowth: "Tax-free",
    estateRemoval: "Yes",
    minInvestment: "$5,000",
    bestFor: "Bunching deductions, flexible giving",
    color: "blue",
  },
  {
    name: "Charitable Remainder Trust",
    abbrev: "CRT",
    upfrontDeduction: "Partial (actuarial value)",
    incomeToCharity: "Remainder (~10%+ min)",
    taxOnGrowth: "Tax-deferred inside",
    estateRemoval: "Yes",
    minInvestment: "$250,000+",
    bestFor: "Income stream + charitable legacy",
    color: "green",
  },
  {
    name: "Charitable Lead Trust",
    abbrev: "CLT",
    upfrontDeduction: "Gift/estate deduction",
    incomeToCharity: "Income stream first",
    taxOnGrowth: "Taxable (grantor CLT)",
    estateRemoval: "Partial/Full",
    minInvestment: "$500,000+",
    bestFor: "Pass residual to heirs with low gift tax",
    color: "purple",
  },
  {
    name: "Private Foundation",
    abbrev: "PF",
    upfrontDeduction: "Up to 30% AGI (cash 60%)",
    incomeToCharity: "5% annual payout required",
    taxOnGrowth: "1.39% excise on investment income",
    estateRemoval: "Yes",
    minInvestment: "$1M+ practical",
    bestFor: "Family legacy, grantmaking control",
    color: "amber",
  },
  {
    name: "Qualified Charitable Distribution",
    abbrev: "QCD",
    upfrontDeduction: "None (excluded from income)",
    incomeToCharity: "100% to charity",
    taxOnGrowth: "N/A — IRA distribution",
    estateRemoval: "Reduces IRA balance",
    minInvestment: "Up to $105,000/yr (2024)",
    bestFor: "RMD reduction, 70.5+ IRA owners",
    color: "red",
  },
];

function CharitableGivingTab() {
  const [selected, setSelected] = useState<string>("DAF");
  const vehicle = CHARITABLE_VEHICLES.find((v) => v.abbrev === selected) ?? CHARITABLE_VEHICLES[0];

  const colorBorder: Record<string, string> = {
    blue: "border-border bg-primary/5",
    green: "border-green-500/30 bg-green-500/5",
    purple: "border-border bg-primary/5",
    amber: "border-amber-500/30 bg-amber-500/5",
    red: "border-red-500/30 bg-red-500/5",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="Total US Charitable Giving" value="$557B (2023)" color="green" />
        <StatChip label="DAF Assets" value="$229B" color="blue" />
        <StatChip label="QCD Limit (2024)" value="$105,000" color="amber" />
        <StatChip label="Private Foundations" value="~133,000" color="default" />
      </div>

      <SectionHeader title="Charitable Giving Vehicles" subtitle="Select a vehicle to view details" />

      <div className="flex flex-wrap gap-2">
        {CHARITABLE_VEHICLES.map((v) => (
          <button
            key={v.abbrev}
            onClick={() => setSelected(v.abbrev)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
              selected === v.abbrev
                ? colorBorder[v.color] + " ring-1 ring-primary/40"
                : "border-border bg-card hover:bg-muted/30 text-muted-foreground"
            )}
          >
            {v.abbrev}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={vehicle.abbrev}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className={cn("rounded-lg border p-5", colorBorder[vehicle.color])}
        >
          <h3 className="font-semibold text-foreground mb-1">{vehicle.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{vehicle.bestFor}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <CardRow label="Upfront Tax Deduction" value={vehicle.upfrontDeduction} />
            <CardRow label="Income to Charity" value={vehicle.incomeToCharity} />
            <CardRow label="Tax on Growth" value={vehicle.taxOnGrowth} />
            <CardRow label="Estate Removal" value={vehicle.estateRemoval} />
            <CardRow label="Minimum Investment" value={vehicle.minInvestment} />
          </div>
        </motion.div>
      </AnimatePresence>

      <SectionHeader title="Tax Benefit Comparison" subtitle="Deduction limits as a percentage of Adjusted Gross Income (AGI)" />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Vehicle</th>
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Cash Deduction Limit</th>
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Appreciated Stock Limit</th>
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Carryforward</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Capital Gains Avoided</th>
            </tr>
          </thead>
          <tbody>
            {[
              { v: "DAF", cash: "60% AGI", stock: "30% AGI", cf: "5 years", cg: "Yes — full FMV deduction" },
              { v: "CRT", cash: "60% AGI", stock: "30% AGI", cf: "5 years", cg: "Tax-deferred (not eliminated)" },
              { v: "CLT", cash: "Varies", stock: "Varies", cf: "N/A", cg: "Yes on transferred appreciation" },
              { v: "PF", cash: "30% AGI", stock: "20% AGI", cf: "5 years", cg: "Yes on contributed assets" },
              { v: "QCD", cash: "N/A — exclusion", stock: "N/A", cf: "None", cg: "N/A" },
            ].map((row) => (
              <tr key={row.v} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                <td className="py-2.5 pr-4 font-medium text-foreground">{row.v}</td>
                <td className="py-2.5 pr-4 text-muted-foreground">{row.cash}</td>
                <td className="py-2.5 pr-4 text-muted-foreground">{row.stock}</td>
                <td className="py-2.5 pr-4 text-muted-foreground">{row.cf}</td>
                <td className="py-2.5 text-muted-foreground">{row.cg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Bunching Strategy with DAFs" variant="blue">
          <p>Instead of giving $15,000/year and not exceeding the standard deduction ($29,200 MFJ), contribute $75,000 to a DAF every 5 years. Itemize in the contribution year, take standard deduction in other years. Grant to charities over time.</p>
        </InfoBox>
        <InfoBox title="QCD: The Ideal IRA Strategy" variant="amber">
          <p>For IRA owners aged 70.5+, QCDs satisfy RMDs, reduce taxable income (unlike cash gifts which require itemizing), and avoid Medicare premium surcharges. Maximum $105,000/year per person in 2024.</p>
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 5: Business Succession ─────────────────────────────────────────────────

// SVG: Cross-purchase vs Entity purchase diagram
function BuySellDiagram({ type }: { type: "cross" | "entity" }) {
  const owners = ["Owner A", "Owner B", "Owner C"];

  if (type === "cross") {
    return (
      <svg viewBox="0 0 280 130" className="w-full max-w-xs h-32">
        {/* Owners */}
        {owners.map((o, i) => {
          const x = 20 + i * 110;
          const y = 10;
          return (
            <g key={o}>
              <rect x={x} y={y} width={80} height={28} rx={4} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary) / 0.5)" strokeWidth={1} />
              <text x={x + 40} y={y + 18} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={9}>{o}</text>
            </g>
          );
        })}
        {/* Cross arrows */}
        <line x1={100} y1={38} x2={130} y2={55} stroke="hsl(var(--primary))" strokeWidth={1.5} markerEnd="url(#arrowhead)" />
        <line x1={150} y1={38} x2={100} y2={55} stroke="hsl(var(--primary))" strokeWidth={1.5} />
        <line x1={210} y1={38} x2={130} y2={55} stroke="hsl(var(--primary))" strokeWidth={1.5} />
        <line x1={150} y1={38} x2={210} y2={55} stroke="hsl(var(--primary))" strokeWidth={1.5} />
        <text x={140} y={80} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={8}>Each owner insures</text>
        <text x={140} y={90} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={8}>others&apos; lives</text>
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="hsl(var(--primary))" />
          </marker>
        </defs>
        <text x={140} y={120} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={8} fontWeight="bold">Cross-Purchase Agreement</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 280 140" className="w-full max-w-xs h-36">
      {owners.map((o, i) => {
        const x = 20 + i * 90;
        return (
          <g key={o}>
            <rect x={x} y={10} width={70} height={26} rx={4} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary) / 0.5)" strokeWidth={1} />
            <text x={x + 35} y={27} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={9}>{o}</text>
            <line x1={x + 35} y1={36} x2={140} y2={72} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="3 2" />
          </g>
        );
      })}
      {/* Entity box */}
      <rect x={90} y={72} width={100} height={30} rx={4} fill="hsl(var(--blue-500) / 0.1)" stroke="hsl(var(--primary))" strokeWidth={1.5} />
      <text x={140} y={92} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={9} fontWeight="bold">Entity / Company</text>
      <text x={140} y={128} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={8}>Entity owns policies on all owners</text>
      <text x={140} y={138} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={8} fontWeight="bold">Entity Purchase Agreement</text>
    </svg>
  );
}

const SUCCESSION_VEHICLES = [
  {
    name: "Cross-Purchase Buy-Sell",
    description:
      "Each owner purchases life insurance on the other owners. Upon a triggering event (death, disability, retirement), surviving owners buy the departing owner's interest directly.",
    pros: ["Stepped-up basis for surviving owners", "Cleaner for 2-owner setups", "Avoids corporate AMT on proceeds"],
    cons: ["Complex with 3+ owners (many policies needed)", "Owners need personal capital or financing", "Impractical if large valuation disparities"],
    taxTreatment: "Buy proceeds generally not taxable to seller (capital gain on gain over basis)",
    color: "blue",
  },
  {
    name: "Entity Purchase Buy-Sell",
    description:
      "The business entity owns life insurance on each owner. Upon a triggering event, the company buys back the departing owner's interest.",
    pros: ["Simpler with multiple owners", "Entity pays premiums from business earnings", "Uniform ownership across owners"],
    cons: ["No basis step-up for surviving owners", "COLI tax rules apply (C-corps)", "Reduces entity value by insurance cost"],
    taxTreatment: "Buy proceeds taxable to C-corps under COLI rules; pass-through entities generally exempt",
    color: "purple",
  },
  {
    name: "ESOP (Employee Stock Ownership Plan)",
    description:
      "A qualified retirement plan that holds company stock. Owner sells shares to the ESOP — often with significant tax benefits under IRC 1042.",
    pros: ["IRC 1042: defer capital gains on $1M+ sales to C-corp ESOP", "Employees gain ownership stake", "Deductions for principal and interest"],
    cons: ["Complex and expensive to establish ($50k–$200k)", "Requires third-party trustee and annual valuation", "Repurchase obligation can strain cash flow"],
    taxTreatment: "Seller can defer (or eliminate via QRP) capital gains. ESOP contributions are deductible.",
    color: "green",
  },
  {
    name: "Family Limited Partnership",
    description:
      "Senior family members contribute assets to an FLP, retaining general partnership interests while transferring limited interests to heirs at discounts.",
    pros: ["Valuation discounts (lack of control + marketability): 20–40%", "Centralizes management with senior generation", "Asset protection from creditors"],
    cons: ["IRS scrutiny — must have legitimate business purpose", "Formal operational requirements", "Discounts may be challenged"],
    taxTreatment: "LP interests gifted at discounted value. Future appreciation in LP passes to heirs outside estate.",
    color: "amber",
  },
  {
    name: "Installment Sale to Grantor Trust",
    description:
      "Owner sells business interest to an Intentionally Defective Grantor Trust (IDGT) in exchange for a promissory note at the AFR. No capital gains recognition on the sale.",
    pros: ["No capital gains on the sale (grantor trust rules)", "Removes all future appreciation from estate", "AFR typically well below market return on business"],
    cons: ["Note remains in estate until paid off", "If business underperforms AFR, wealth erosion", "Requires adequate seed money in trust (10% rule)"],
    taxTreatment: "Grantor pays all income tax on trust earnings (additional tax-free transfer). Note interest non-taxable between grantor and grantor trust.",
    color: "red",
  },
];

function BusinessSuccessionTab() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [buySellView, setBuySellView] = useState<"cross" | "entity">("cross");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="Family Business Transfers Failing" value="~70%" color="red" />
        <StatChip label="Owners Without Succession Plan" value="58%" color="amber" />
        <StatChip label="ESOP Companies in US" value="~6,500" color="blue" />
        <StatChip label="FLP Avg Discount" value="25–40%" color="green" />
      </div>

      <SectionHeader title="Buy-Sell Agreement Structures" subtitle="The two primary structures for owner buyouts upon death, disability, or retirement" />

      <div className="rounded-lg border border-border p-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setBuySellView("cross")}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium border transition-colors",
              buySellView === "cross"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted/30"
            )}
          >
            Cross-Purchase
          </button>
          <button
            onClick={() => setBuySellView("entity")}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium border transition-colors",
              buySellView === "entity"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted/30"
            )}
          >
            Entity Purchase
          </button>
        </div>
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={buySellView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <BuySellDiagram type={buySellView} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <SectionHeader title="Succession Vehicles" subtitle="Click a vehicle to expand details" />

      <div className="space-y-3">
        {SUCCESSION_VEHICLES.map((v, i) => {
          const colorBorder: Record<string, string> = {
            blue: "border-border",
            purple: "border-border",
            green: "border-green-500/30",
            amber: "border-amber-500/30",
            red: "border-red-500/30",
          };
          const isOpen = openIdx === i;
          return (
            <div
              key={v.name}
              className={cn("rounded-lg border overflow-hidden", isOpen ? colorBorder[v.color] : "border-border")}
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/20 transition-colors text-left"
                onClick={() => setOpenIdx(isOpen ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-sm text-foreground">{v.name}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 space-y-4">
                      <p className="text-sm text-muted-foreground">{v.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-medium text-green-400 mb-1.5">Advantages</div>
                          <ul className="space-y-1">
                            {v.pros.map((p) => (
                              <li key={p} className="flex items-start gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                                <span className="text-xs text-muted-foreground">{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-red-400 mb-1.5">Disadvantages</div>
                          <ul className="space-y-1">
                            {v.cons.map((c) => (
                              <li key={c} className="flex items-start gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                                <span className="text-xs text-muted-foreground">{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="rounded-md border border-border/50 bg-muted/20 px-3 py-2">
                        <span className="text-xs font-medium text-foreground">Tax Treatment: </span>
                        <span className="text-xs text-muted-foreground">{v.taxTreatment}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <InfoBox title="Succession Planning Timeline" variant="blue">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          {[
            { phase: "5–10 Years Out", items: ["Identify successors", "Build management depth", "Begin gifting program", "Establish FLP/trust"] },
            { phase: "2–5 Years Out", items: ["Execute buy-sell agreements", "Implement ESOP if applicable", "Minimize estate for transition", "Tax attribute preservation planning"] },
            { phase: "Final Year", items: ["Complete ownership transfer", "Update shareholder agreements", "Finalize estate documents", "Coordinate with advisors"] },
          ].map((p) => (
            <div key={p.phase}>
              <div className="text-xs font-medium text-primary mb-1">{p.phase}</div>
              <ul className="space-y-0.5">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                    <span className="text-xs">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </InfoBox>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "basics", label: "Estate Basics", icon: FileText },
  { id: "trusts", label: "Trusts", icon: Shield },
  { id: "tax", label: "Tax Strategies", icon: TrendingDown },
  { id: "charitable", label: "Charitable Giving", icon: Heart },
  { id: "succession", label: "Business Succession", icon: Briefcase },
];

export default function EstatePlanningPage() {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Estate Planning</h1>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            Wealth Preservation
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Wealth preservation, estate planning, and intergenerational wealth transfer strategies
        </p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatChip label="2024 Estate Tax Exemption" value="$13.61M" color="green" />
        <StatChip label="Annual Gift Exclusion" value="$18,000" color="blue" />
        <StatChip label="Top Estate Tax Rate" value="40%" color="red" />
        <StatChip label="Avg Probate Cost" value="3–7% of estate" color="amber" />
        <StatChip label="DAF Growth (5yr)" value="+42% AUM" color="purple" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basics" className="flex-1">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-1.5 text-xs">
              <t.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basics" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <EstatePlanningBasicsTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="trusts" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <TrustsTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="tax" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <TaxStrategiesTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="charitable" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <CharitableGivingTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="succession" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <BusinessSuccessionTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
