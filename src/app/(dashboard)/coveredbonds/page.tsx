"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Building2,
  Globe,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Layers,
  Lock,
  Landmark,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 853;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate all random values at module level so they are stable
const RAND_VALS = Array.from({ length: 200 }, () => rand());
let ri = 0;
const r = () => RAND_VALS[ri++ % RAND_VALS.length];

// ── Static data ────────────────────────────────────────────────────────────────

interface CountryData {
  country: string;
  outstanding: number; // EUR bn
  color: string;
}

const COUNTRY_DATA: CountryData[] = [
  { country: "Germany", outstanding: 385, color: "#3b82f6" },
  { country: "Denmark", outstanding: 310, color: "#8b5cf6" },
  { country: "France", outstanding: 248, color: "#06b6d4" },
  { country: "Spain", outstanding: 196, color: "#f59e0b" },
  { country: "Sweden", outstanding: 162, color: "#10b981" },
  { country: "Norway", outstanding: 118, color: "#f97316" },
  { country: "UK", outstanding: 87, color: "#ec4899" },
  { country: "Other", outstanding: 224, color: "#6b7280" },
];

interface IssuerRow {
  issuer: string;
  country: string;
  program: string;
  outstanding: string;
  rating: string;
  spread: string;
}

const TOP_ISSUERS: IssuerRow[] = [
  { issuer: "Deutsche Pfandbriefbank", country: "DE", program: "Pfandbrief", outstanding: "€42bn", rating: "AAA", spread: "+12bp" },
  { issuer: "Crédit Agricole Home", country: "FR", program: "Obligations Foncières", outstanding: "€38bn", rating: "AAA", spread: "+14bp" },
  { issuer: "Nykredit", country: "DK", program: "Realkreditobligationer", outstanding: "€35bn", rating: "AAA", spread: "+10bp" },
  { issuer: "CaixaBank", country: "ES", program: "Cédulas Hipotecarias", outstanding: "€28bn", rating: "AA+", spread: "+22bp" },
  { issuer: "Lloyds Banking Group", country: "UK", program: "Covered Bond Programme", outstanding: "€21bn", rating: "AAA", spread: "+18bp" },
  { issuer: "Swedbank", country: "SE", program: "Säkerställda Obligationer", outstanding: "€19bn", rating: "AAA", spread: "+11bp" },
];

interface SpreadPoint {
  month: string;
  coveredBond: number;
  senior: number;
}

// Generate 12-month spread data (covered bonds tighter than senior)
const SPREAD_DATA: SpreadPoint[] = Array.from({ length: 12 }, (_, i) => {
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const baseCB = 18 + Math.sin(i * 0.5) * 4 + (r() - 0.5) * 3;
  const baseSenior = 45 + Math.sin(i * 0.4) * 6 + (r() - 0.5) * 4;
  return {
    month: months[i],
    coveredBond: Math.round(baseCB * 10) / 10,
    senior: Math.round(baseSenior * 10) / 10,
  };
});

interface ComparisonFactor {
  factor: string;
  coveredBond: string;
  abs: string;
  coveredBondPositive: boolean | null;
}

const COMPARISON_FACTORS: ComparisonFactor[] = [
  { factor: "Recourse", coveredBond: "Dual (issuer + cover pool)", abs: "Single (SPV only)", coveredBondPositive: true },
  { factor: "Balance sheet treatment", coveredBond: "On-balance-sheet", abs: "Off-balance-sheet (true sale)", coveredBondPositive: null },
  { factor: "Credit rating", coveredBond: "Typically AAA", abs: "AAA–B (tranche dependent)", coveredBondPositive: true },
  { factor: "Overcollateralization", coveredBond: "Statutory minimum (e.g. 2%+)", abs: "Credit-enhancement driven", coveredBondPositive: null },
  { factor: "Regulatory capital (Basel)", coveredBond: "10–20% RW (LCR Level 1B)", abs: "20–100% RW (tranche dependent)", coveredBondPositive: true },
  { factor: "LCR eligibility", coveredBond: "Level 1B / 2A HQLA", abs: "Generally not HQLA eligible", coveredBondPositive: true },
  { factor: "Bail-in risk", coveredBond: "Exempt from bail-in", abs: "SPV insulated; no bail-in", coveredBondPositive: null },
  { factor: "Prepayment exposure", coveredBond: "Managed via substitution", abs: "Passed through to investors", coveredBondPositive: true },
  { factor: "Refinancing risk", coveredBond: "Issuer refinances cover pool", abs: "Pass-through / sequential", coveredBondPositive: true },
  { factor: "Transparency", coveredBond: "Cover pool reports (quarterly)", abs: "Investor reports (monthly)", coveredBondPositive: null },
  { factor: "Investor base", coveredBond: "Central banks, insurers, banks", abs: "Hedge funds, insurers, asset mgrs", coveredBondPositive: null },
  { factor: "Typical spread (AAA)", coveredBond: "+10–25bp over swaps", abs: "+20–50bp over swaps (senior)", coveredBondPositive: true },
];

// Risk-return scatter points
interface ScatterPoint {
  label: string;
  spread: number; // bp
  risk: number; // relative risk score 1-10
  color: string;
  type: "cb" | "senior_abs" | "mezz_abs";
}

const SCATTER_POINTS: ScatterPoint[] = [
  { label: "Pfandbrief AAA", spread: 12, risk: 1.2, color: "#3b82f6", type: "cb" },
  { label: "OF (France) AAA", spread: 14, risk: 1.3, color: "#3b82f6", type: "cb" },
  { label: "Cédulas AA+", spread: 22, risk: 1.8, color: "#3b82f6", type: "cb" },
  { label: "UK CB AAA", spread: 18, risk: 1.5, color: "#3b82f6", type: "cb" },
  { label: "RMBS AAA (EU)", spread: 45, risk: 2.8, color: "#8b5cf6", type: "senior_abs" },
  { label: "CMBS AAA", spread: 55, risk: 3.5, color: "#8b5cf6", type: "senior_abs" },
  { label: "CLO AAA", spread: 70, risk: 3.2, color: "#8b5cf6", type: "senior_abs" },
  { label: "RMBS AA", spread: 90, risk: 4.5, color: "#f59e0b", type: "mezz_abs" },
  { label: "CMBS A", spread: 130, risk: 5.8, color: "#f59e0b", type: "mezz_abs" },
  { label: "CLO BB", spread: 350, risk: 8.2, color: "#ef4444", type: "mezz_abs" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children, className }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary">{icon}</span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoChip({ label, value, color = "blue" }: { label: string; value: string; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-primary/10 border-border text-primary",
    green: "bg-green-500/10 border-green-500/30 text-green-300",
    purple: "bg-primary/10 border-border text-primary",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    cyan: "bg-cyan-500/10 border-cyan-500/30 text-muted-foreground",
  };
  return (
    <div className={cn("border rounded-lg px-3 py-2 text-center", colorMap[color] ?? colorMap.blue)}>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}

// ── Tab 1: Structure ───────────────────────────────────────────────────────────

function StructureTab() {
  const poolData = [
    { type: "Residential Mortgages", pct: 58, color: "#3b82f6", ltv: "≤80%", risk: "Low" },
    { type: "Commercial Mortgages", pct: 18, color: "#8b5cf6", ltv: "≤60%", risk: "Low–Medium" },
    { type: "Public Sector Loans", pct: 19, color: "#10b981", ltv: "N/A", risk: "Low" },
    { type: "Ships / Aircraft", pct: 5, color: "#f59e0b", ltv: "≤60%", risk: "Medium" },
  ];

  return (
    <div className="space-y-6">
      {/* Dual Recourse Diagram */}
      <SectionCard title="Dual Recourse Structure" icon={<Shield size={16} />}>
        <div className="relative w-full overflow-x-auto">
          <svg viewBox="0 0 720 280" className="w-full" style={{ minWidth: 480 }}>
            {/* Issuer box */}
            <rect x="20" y="100" width="140" height="80" rx="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="90" y="132" textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="600">Issuing Bank</text>
            <text x="90" y="152" textAnchor="middle" fill="#60a5fa" fontSize="10">(On-Balance-Sheet)</text>
            <text x="90" y="170" textAnchor="middle" fill="#60a5fa" fontSize="10">General Assets</text>

            {/* Cover Pool box */}
            <rect x="20" y="210" width="140" height="60" rx="8" fill="#1a3a2f" stroke="#10b981" strokeWidth="1.5" />
            <text x="90" y="237" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="600">Cover Pool</text>
            <text x="90" y="256" textAnchor="middle" fill="#34d399" fontSize="10">Ring-fenced Assets</text>

            {/* Investor box */}
            <rect x="560" y="120" width="140" height="60" rx="8" fill="#2d1f5e" stroke="#8b5cf6" strokeWidth="1.5" />
            <text x="630" y="147" textAnchor="middle" fill="#c4b5fd" fontSize="12" fontWeight="600">Covered Bond</text>
            <text x="630" y="165" textAnchor="middle" fill="#a78bfa" fontSize="10">Investor</text>

            {/* Arrow: Investor pays bond */}
            <line x1="560" y1="150" x2="200" y2="150" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="5,3" />
            <polygon points="200,145 190,150 200,155" fill="#8b5cf6" />
            <text x="380" y="143" textAnchor="middle" fill="#a78bfa" fontSize="10">Bond proceeds / coupon+principal</text>

            {/* First recourse: Issuer → Investor (claim on issuer) */}
            <path d="M 160 130 Q 360 60 560 130" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <polygon points="558,125 570,130 558,135" fill="#3b82f6" />
            <text x="360" y="52" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="600">1st Recourse: Claim on Issuer</text>

            {/* Second recourse: Cover Pool → Investor */}
            <path d="M 160 240 Q 360 300 560 170" fill="none" stroke="#10b981" strokeWidth="2" />
            <polygon points="558,165 570,170 558,175" fill="#10b981" />
            <text x="360" y="316" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="600">2nd Recourse: Claim on Cover Pool (if issuer defaults)</text>

            {/* OC label */}
            <rect x="270" y="195" width="180" height="44" rx="6" fill="#1c1c1e" stroke="#f59e0b" strokeWidth="1" />
            <text x="360" y="214" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600">Overcollateralization</text>
            <text x="360" y="230" textAnchor="middle" fill="#fde68a" fontSize="9">Cover Pool &gt; Bond Obligations</text>

            {/* Cover pool → OC */}
            <line x1="160" y1="240" x2="270" y2="217" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3" />
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-2">
          <InfoChip label="Recourse Type" value="Dual" color="blue" />
          <InfoChip label="Cover Pool" value="Ring-fenced" color="green" />
          <InfoChip label="Balance Sheet" value="On-BS (IFRS)" color="purple" />
        </div>
      </SectionCard>

      {/* Cover Pool Composition */}
      <SectionCard title="Cover Pool Composition" icon={<Layers size={16} />}>
        <div className="space-y-3">
          {poolData.map((d) => (
            <div key={d.type} className="flex items-center gap-3">
              <div className="w-28 text-xs text-muted-foreground shrink-0">{d.type}</div>
              <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${d.pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded flex items-center pl-2"
                  style={{ backgroundColor: d.color }}
                >
                  <span className="text-white text-xs font-semibold">{d.pct}%</span>
                </motion.div>
              </div>
              <div className="w-16 text-xs text-muted-foreground shrink-0">LTV {d.ltv}</div>
              <div className="w-20 text-right">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded",
                  d.risk === "Low" ? "bg-green-500/10 text-green-400" :
                    d.risk === "Low–Medium" ? "bg-amber-500/10 text-amber-400" :
                      "bg-orange-500/10 text-orange-400"
                )}>{d.risk}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Key structural features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Overcollateralization (OC)" icon={<Lock size={16} />}>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Statutory minimum OC</span>
              <span className="text-white font-medium">2% (nominal)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Typical voluntary OC</span>
              <span className="text-white font-medium">15–30%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">ECBD commitment level</span>
              <span className="text-white font-medium">5% (soft OC)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Ratings agency requirement</span>
              <span className="text-white font-medium">Model-driven (10–40%)</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Cover Pool Monitor" icon={<CheckCircle size={16} />}>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground leading-relaxed">An independent <span className="text-white">Cover Pool Monitor</span> (or Cover Pool Administrator) verifies that cover pool assets meet all eligibility criteria and that statutory OC levels are maintained at all times.</p>
            <div className="mt-3 space-y-1">
              {[
                "Appointed by regulatory authority",
                "Full access to cover register",
                "Reports quarterly to regulator",
                "Can block asset substitution",
                "Triggers insolvency proceedings if breached",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle size={12} className="text-green-400 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground text-xs">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ── Tab 2: Frameworks ──────────────────────────────────────────────────────────

function FrameworksTab() {
  const [selected, setSelected] = useState<string | null>(null);

  const frameworks = [
    {
      id: "pfandbrief",
      name: "Pfandbrief",
      country: "Germany",
      flag: "🇩🇪",
      type: "Legislative",
      law: "Pfandbriefgesetz (PfandBG) 2005",
      regulator: "BaFin",
      eligible: "Mortgages, public sector, ships, aircraft",
      oc: "2% statutory",
      monitor: "Independent monitor required",
      outstanding: "€385bn",
      rating: "AAA",
      color: "#3b82f6",
      notes: "The gold standard of covered bonds. Over 250-year history. Strict eligibility, continuous cover, dedicated insolvency estate.",
    },
    {
      id: "of",
      name: "Obligations Foncières",
      country: "France",
      flag: "🇫🇷",
      type: "Legislative",
      law: "Loi 99-532 (Société de Crédit Foncier)",
      regulator: "ACPR",
      eligible: "Real estate loans, public sector",
      oc: "2% statutory",
      monitor: "Contrôleur Spécifique",
      outstanding: "€248bn",
      rating: "AAA",
      color: "#8b5cf6",
      notes: "Issued by a dedicated Société de Crédit Foncier (SCF). SCF is a licensed credit institution; insolvency-remote but still regulated entity.",
    },
    {
      id: "cedulas",
      name: "Cédulas Hipotecarias",
      country: "Spain",
      flag: "🇪🇸",
      type: "Legislative",
      law: "Mortgage Market Law (Ley 2/1981)",
      regulator: "Banco de España",
      eligible: "Residential & commercial mortgages",
      oc: "25% statutory (cover pool / bonds)",
      monitor: "Internal + BdE supervision",
      outstanding: "€196bn",
      rating: "AA+–AAA",
      color: "#f59e0b",
      notes: "Unique feature: all eligible mortgages on the balance sheet automatically form the cover pool. Very broad pool; lower granularity controls vs Pfandbrief.",
    },
    {
      id: "uk",
      name: "UK Covered Bond",
      country: "United Kingdom",
      flag: "🇬🇧",
      type: "Legislative",
      law: "FSMA 2000 + FCA CB Rules 2023",
      regulator: "FCA / PRA",
      eligible: "Residential mortgages (prime)",
      oc: "8% regulatory minimum",
      monitor: "Asset pool monitor (FCA rule)",
      outstanding: "€87bn",
      rating: "AAA",
      color: "#ec4899",
      notes: "Post-Brexit aligned with ECBD. UK CB differs from UK RMBS: on-balance-sheet, no servicer fees from SPV, bail-in exempt, LCR Level 1B eligible.",
    },
  ];

  const selectedFw = frameworks.find((f) => f.id === selected);

  return (
    <div className="space-y-6">
      {/* ECBD Overview */}
      <SectionCard title="European Covered Bond Directive (ECBD) 2019/2162" icon={<Globe size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <InfoChip label="Effective" value="July 2022" color="blue" />
          <InfoChip label="Min. OC" value="5% soft" color="green" />
          <InfoChip label="Cover Monitor" value="Mandatory" color="purple" />
          <InfoChip label="Liquidity Buffer" value="180 days" color="cyan" />
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="leading-relaxed">The ECBD harmonised covered bond standards across EU member states, establishing minimum requirements for asset eligibility, OC levels, cover pool monitoring, liquidity buffers, and investor disclosure. Member states may apply stricter national rules — creating a two-tier structure of ECBD-compliant bonds and <span className="text-primary">European Covered Bonds (Premium)</span> meeting enhanced criteria.</p>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "Dual recourse principle", required: true },
            { label: "Segregated cover pool (register)", required: true },
            { label: "Cover pool monitor appointment", required: true },
            { label: "180-day liquidity buffer", required: true },
            { label: "Asset eligibility restrictions (Art 6–13)", required: true },
            { label: "Soft 5% OC commitment", required: true },
            { label: "Derivative use restrictions", required: true },
            { label: "Investor disclosure (quarterly)", required: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-400 shrink-0" />
              <span className="text-muted-foreground text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Framework Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {frameworks.map((fw) => (
          <button
            key={fw.id}
            onClick={() => setSelected(selected === fw.id ? null : fw.id)}
            className={cn(
              "text-left p-4 rounded-xl border transition-all",
              selected === fw.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-muted-foreground"
            )}
          >
            <div className="text-2xl mb-2">{fw.flag}</div>
            <div className="font-semibold text-white text-sm">{fw.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{fw.country}</div>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">{fw.type}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{fw.outstanding} outstanding</div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedFw && (
          <motion.div
            key={selectedFw.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-card border rounded-xl p-5 overflow-hidden" style={{ borderColor: selectedFw.color + "60" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{selectedFw.flag}</span>
                <div>
                  <h3 className="text-white font-semibold">{selectedFw.name}</h3>
                  <p className="text-muted-foreground text-xs">{selectedFw.law}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {[
                  { k: "Regulator", v: selectedFw.regulator },
                  { k: "Eligible Assets", v: selectedFw.eligible },
                  { k: "Min. OC", v: selectedFw.oc },
                  { k: "Cover Monitor", v: selectedFw.monitor },
                  { k: "Rating", v: selectedFw.rating },
                  { k: "Outstanding", v: selectedFw.outstanding },
                ].map(({ k, v }) => (
                  <div key={k} className="bg-muted rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-0.5">{k}</div>
                    <div className="text-sm text-white font-medium">{v}</div>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{selectedFw.notes}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bail-in exemption */}
      <SectionCard title="Bail-in Exemption Mechanics" icon={<Shield size={16} />}>
        <div className="flex gap-4 items-start">
          <div className="flex-1 space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>Under the <span className="text-white">Bank Recovery and Resolution Directive (BRRD)</span>, covered bonds are explicitly <span className="text-green-400 font-medium">exempt from bail-in</span> (Art. 44(2)(b)). This means covered bond holders cannot have their claims written down or converted to equity in a bank resolution.</p>
            <p>The exemption applies because covered bonds are <span className="text-primary">secured liabilities backed by specific ring-fenced assets</span>. In resolution, the cover pool continues to service covered bonds under a special administrator, even if the issuing bank is placed in resolution.</p>
          </div>
          <div className="shrink-0 w-36 space-y-2">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="text-green-400 font-semibold text-sm mt-1">Bail-in Exempt</div>
            </div>
            <div className="p-3 bg-muted border border-border rounded-lg text-center">
              <div className="text-xs text-muted-foreground">Authority</div>
              <div className="text-white font-medium text-xs mt-1">BRRD Art. 44(2)(b)</div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 3: Market Data ─────────────────────────────────────────────────────────

function MarketDataTab() {
  const maxOutstanding = Math.max(...COUNTRY_DATA.map((d) => d.outstanding));
  const maxSpread = Math.max(...SPREAD_DATA.flatMap((d) => [d.coveredBond, d.senior]));

  // SVG line path helper
  const toPath = (points: { x: number; y: number }[]): string => {
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  };

  const W = 560;
  const H = 180;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const spreadPoints = SPREAD_DATA.map((d, i) => ({
    cbX: padL + (i / (SPREAD_DATA.length - 1)) * innerW,
    cbY: padT + innerH - (d.coveredBond / (maxSpread + 10)) * innerH,
    sX: padL + (i / (SPREAD_DATA.length - 1)) * innerW,
    sY: padT + innerH - (d.senior / (maxSpread + 10)) * innerH,
  }));

  const cbPath = toPath(spreadPoints.map((p) => ({ x: p.cbX, y: p.cbY })));
  const sPath = toPath(spreadPoints.map((p) => ({ x: p.sX, y: p.sY })));

  return (
    <div className="space-y-6">
      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InfoChip label="Global Outstanding" value="~€3.2tn" color="blue" />
        <InfoChip label="EU Market Share" value="~82%" color="purple" />
        <InfoChip label="CBPP3 Holdings" value="€280bn" color="green" />
        <InfoChip label="LCR Treatment" value="Level 1B HQLA" color="cyan" />
      </div>

      {/* Outstanding by country bar chart */}
      <SectionCard title="Covered Bond Market — Outstanding by Country (EUR bn)" icon={<BarChart3 size={16} />}>
        <svg viewBox="0 0 640 220" className="w-full">
          {COUNTRY_DATA.map((d, i) => {
            const barH = (d.outstanding / maxOutstanding) * 160;
            const x = 40 + i * 72;
            const y = 185 - barH;
            return (
              <g key={d.country}>
                <rect x={x} y={y} width={48} height={barH} rx="3" fill={d.color} opacity={0.85} />
                <text x={x + 24} y={y - 5} textAnchor="middle" fill="#e5e7eb" fontSize="10" fontWeight="600">
                  {d.outstanding}
                </text>
                <text x={x + 24} y={200} textAnchor="middle" fill="#9ca3af" fontSize="10">
                  {d.country}
                </text>
              </g>
            );
          })}
          <line x1="30" y1="25" x2="30" y2="185" stroke="#374151" strokeWidth="1" />
          <line x1="30" y1="185" x2="620" y2="185" stroke="#374151" strokeWidth="1" />
        </svg>
      </SectionCard>

      {/* Spread over swaps */}
      <SectionCard title="Spread over Swaps — 12 Months (bp)" icon={<TrendingDown size={16} />}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* Grid lines */}
          {[0, 20, 40, 60, 80].map((v) => {
            const y = padT + innerH - (v / (maxSpread + 10)) * innerH;
            return (
              <g key={v}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#374151" strokeWidth="0.5" />
                <text x={padL - 4} y={y + 4} textAnchor="end" fill="#6b7280" fontSize="9">{v}</text>
              </g>
            );
          })}
          {/* X labels */}
          {SPREAD_DATA.map((d, i) => {
            const x = padL + (i / (SPREAD_DATA.length - 1)) * innerW;
            return (
              <text key={d.month} x={x} y={H - 4} textAnchor="middle" fill="#6b7280" fontSize="9">{d.month}</text>
            );
          })}
          {/* Senior line */}
          <path d={sPath} fill="none" stroke="#8b5cf6" strokeWidth="2" />
          {/* CB line */}
          <path d={cbPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
          {/* CBPP3 band annotation */}
          <rect x={padL + innerW * 0.6} y={padT + innerH * 0.05} width={innerW * 0.38} height={22} rx="4" fill="#166534" opacity={0.5} />
          <text x={padL + innerW * 0.79} y={padT + innerH * 0.05 + 14} textAnchor="middle" fill="#6ee7b7" fontSize="9">CBPP3 support</text>
          {/* Legend */}
          <circle cx={padL + 8} cy={padT + 8} r="4" fill="#3b82f6" />
          <text x={padL + 16} y={padT + 12} fill="#93c5fd" fontSize="9">Covered Bond</text>
          <circle cx={padL + 90} cy={padT + 8} r="4" fill="#8b5cf6" />
          <text x={padL + 98} y={padT + 12} fill="#c4b5fd" fontSize="9">Senior Unsecured</text>
        </svg>
      </SectionCard>

      {/* Top issuers */}
      <SectionCard title="Top Issuers" icon={<Landmark size={16} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground text-xs font-medium pb-2">Issuer</th>
                <th className="text-center text-muted-foreground text-xs font-medium pb-2">Country</th>
                <th className="text-left text-muted-foreground text-xs font-medium pb-2">Programme</th>
                <th className="text-right text-muted-foreground text-xs font-medium pb-2">Outstanding</th>
                <th className="text-center text-muted-foreground text-xs font-medium pb-2">Rating</th>
                <th className="text-right text-muted-foreground text-xs font-medium pb-2">Spread</th>
              </tr>
            </thead>
            <tbody>
              {TOP_ISSUERS.map((row) => (
                <tr key={row.issuer} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2 text-white text-xs font-medium">{row.issuer}</td>
                  <td className="py-2 text-center">
                    <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{row.country}</span>
                  </td>
                  <td className="py-2 text-muted-foreground text-xs">{row.program}</td>
                  <td className="py-2 text-right text-white text-xs font-medium">{row.outstanding}</td>
                  <td className="py-2 text-center">
                    <span className="text-xs px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-green-400">{row.rating}</span>
                  </td>
                  <td className="py-2 text-right text-muted-foreground text-xs font-mono">{row.spread}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ECB / LCR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="ECB Eligibility & CBPP3" icon={<Building2 size={16} />}>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>Covered bonds are <span className="text-white">ECB repo-eligible</span> as Category I collateral (haircut ~1–7%). The ECB's <span className="text-primary">Covered Bond Purchase Programmes (CBPP1, CBPP2, CBPP3)</span> bought covered bonds outright to support euro area credit.</p>
            <p>CBPP3, launched Oct 2014, accumulated <span className="text-green-400">€280bn+</span> in holdings, compressing spreads by ~15–20bp and becoming a dominant investor in the market.</p>
          </div>
        </SectionCard>
        <SectionCard title="LCR Level 1B Treatment" icon={<Shield size={16} />}>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>Covered bonds rated <span className="text-white">AA– or above</span> qualify as <span className="text-primary">Level 1B HQLA</span> under Basel III LCR (subject to 7% haircut and 70% cap within total HQLA).</p>
            <p>This makes covered bonds a preferred instrument for bank liquidity portfolios alongside government bonds, driving structural demand and tighter spreads vs. unsecured bank debt.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ── Tab 4: vs ABS Comparison ───────────────────────────────────────────────────

function ABSComparisonTab() {
  const W = 500;
  const H = 280;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxSpreadS = Math.max(...SCATTER_POINTS.map((p) => p.spread));
  const maxRisk = Math.max(...SCATTER_POINTS.map((p) => p.risk));

  const toSvgX = (spread: number) => padL + (spread / (maxSpreadS + 20)) * innerW;
  const toSvgY = (risk: number) => padT + innerH - (risk / (maxRisk + 1)) * innerH;

  const typeLabels = [
    { type: "cb", label: "Covered Bond", color: "#3b82f6" },
    { type: "senior_abs", label: "Senior ABS", color: "#8b5cf6" },
    { type: "mezz_abs", label: "Mezz / Sub ABS", color: "#f59e0b" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* 12-factor comparison table */}
      <SectionCard title="12-Factor Comparison: Covered Bonds vs ABS" icon={<BarChart3 size={16} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground font-medium pb-2 pr-4">Factor</th>
                <th className="text-left text-primary font-medium pb-2 pr-4">Covered Bond</th>
                <th className="text-left text-primary font-medium pb-2">ABS / RMBS</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FACTORS.map((row, i) => (
                <tr key={row.factor} className={cn(
                  "border-b border-border/50",
                  i % 2 === 0 ? "bg-card" : "bg-card/50"
                )}>
                  <td className="py-2 pr-4 text-muted-foreground font-medium">{row.factor}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-start gap-1">
                      {row.coveredBondPositive === true && <CheckCircle size={10} className="text-green-400 mt-0.5 shrink-0" />}
                      {row.coveredBondPositive === false && <XCircle size={10} className="text-red-400 mt-0.5 shrink-0" />}
                      {row.coveredBondPositive === null && <Info size={10} className="text-muted-foreground mt-0.5 shrink-0" />}
                      <span className="text-primary">{row.coveredBond}</span>
                    </div>
                  </td>
                  <td className="py-2">
                    <span className="text-primary">{row.abs}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Risk-return scatter */}
      <SectionCard title="Risk–Return Scatter: Covered Bonds vs ABS" icon={<TrendingUp size={16} />}>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 360 }} className="w-full">
            {/* Grid */}
            {[0, 100, 200, 300].map((v) => {
              const x = toSvgX(v);
              return (
                <g key={v}>
                  <line x1={x} y1={padT} x2={x} y2={padT + innerH} stroke="#1f2937" strokeWidth="1" />
                  <text x={x} y={padT + innerH + 14} textAnchor="middle" fill="#6b7280" fontSize="9">{v}bp</text>
                </g>
              );
            })}
            {[2, 4, 6, 8].map((v) => {
              const y = toSvgY(v);
              return (
                <g key={v}>
                  <line x1={padL} y1={y} x2={padL + innerW} y2={y} stroke="#1f2937" strokeWidth="1" />
                  <text x={padL - 6} y={y + 4} textAnchor="end" fill="#6b7280" fontSize="9">{v}</text>
                </g>
              );
            })}
            {/* Axes */}
            <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="#374151" strokeWidth="1" />
            <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} stroke="#374151" strokeWidth="1" />
            <text x={padL + innerW / 2} y={H - 4} textAnchor="middle" fill="#9ca3af" fontSize="10">Spread (bp)</text>
            <text x={12} y={padT + innerH / 2} textAnchor="middle" fill="#9ca3af" fontSize="10" transform={`rotate(-90, 12, ${padT + innerH / 2})`}>Relative Risk</text>
            {/* Points */}
            {SCATTER_POINTS.map((pt) => {
              const cx = toSvgX(pt.spread);
              const cy = toSvgY(pt.risk);
              return (
                <g key={pt.label}>
                  <circle cx={cx} cy={cy} r="6" fill={pt.color} opacity={0.85} />
                  <text x={cx + 8} y={cy + 4} fill={pt.color} fontSize="8.5">{pt.label}</text>
                </g>
              );
            })}
            {/* Legend */}
            {typeLabels.map(({ label, color }, i) => (
              <g key={label}>
                <circle cx={padL + 8} cy={padT + 8 + i * 16} r="5" fill={color} />
                <text x={padL + 16} y={padT + 12 + i * 16} fill={color} fontSize="9">{label}</text>
              </g>
            ))}
          </svg>
        </div>
      </SectionCard>

      {/* Regulatory capital + investor base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Regulatory Capital Treatment" icon={<Lock size={16} />}>
          <div className="space-y-2">
            {[
              { instrument: "Covered Bond (AAA)", rw: "10%", lcr: "Level 1B", capital: "Low" },
              { instrument: "Senior ABS (AAA)", rw: "20%", lcr: "Not eligible", capital: "Medium" },
              { instrument: "Mezz ABS (AA)", rw: "50%", lcr: "Not eligible", capital: "High" },
              { instrument: "Sub ABS (BB)", rw: "100%+", lcr: "Not eligible", capital: "Very High" },
            ].map((row) => (
              <div key={row.instrument} className="flex items-center justify-between p-2 bg-muted rounded-lg text-xs">
                <span className="text-muted-foreground">{row.instrument}</span>
                <div className="flex gap-2">
                  <span className="text-amber-400 font-mono">RW {row.rw}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded",
                    row.lcr === "Level 1B" ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"
                  )}>{row.lcr}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Investor Base & Structural Differences" icon={<Info size={16} />}>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div>
              <div className="text-primary font-semibold mb-1">Covered Bond Investors</div>
              <div className="space-y-0.5">
                {["Central banks & official sector", "Commercial banks (LCR)", "Insurance companies (Solvency II)", "Asset managers (core fixed income)"].map((i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-primary shrink-0" />
                    <span>{i}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-primary font-semibold mb-1">ABS / RMBS Investors</div>
              <div className="space-y-0.5">
                {["Hedge funds (mezzanine / equity)", "Insurance (senior tranches)", "Conduit / SIV vehicles", "Specialist ABS asset managers"].map((i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <ArrowRight size={10} className="text-primary shrink-0" />
                    <span>{i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CoveredBondsPage() {
  const tabs = [
    { id: "structure", label: "Structure", icon: <Shield size={14} /> },
    { id: "frameworks", label: "Frameworks", icon: <Globe size={14} /> },
    { id: "market", label: "Market Data", icon: <BarChart3 size={14} /> },
    { id: "comparison", label: "vs ABS", icon: <Layers size={14} /> },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 border border-border rounded-lg">
            <Shield size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Covered Bonds</h1>
            <p className="text-muted-foreground text-sm">Dual recourse, cover pool mechanics, and European frameworks</p>
          </div>
        </div>

        {/* Quick facts strip */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "Market Size", value: "~€3.2tn", color: "text-primary" },
            { label: "Primary Markets", value: "EU (82%)", color: "text-primary" },
            { label: "Typical Rating", value: "AAA", color: "text-green-400" },
            { label: "Bail-in", value: "Exempt (BRRD)", color: "text-amber-400" },
            { label: "LCR", value: "Level 1B HQLA", color: "text-muted-foreground" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">{label}:</span>
              <span className={cn("font-semibold", color)}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="structure" className="space-y-4">
        <TabsList className="bg-card border border-border p-1 h-auto flex gap-1 flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground rounded-md transition-all"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="structure" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <StructureTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="frameworks" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FrameworksTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="market" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MarketDataTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="comparison" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ABSComparisonTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
