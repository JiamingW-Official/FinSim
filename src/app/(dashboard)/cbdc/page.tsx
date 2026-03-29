"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Shield,
  Zap,
  ArrowRight,
  ArrowLeftRight,
  BarChart3,
  Activity,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Building2,
  Banknote,
  Network,
  Layers,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 862;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ──────────────────────────────────────────────────────────────────────

type CBDCStage = "launched" | "pilot" | "research" | "cancelled";

interface CountryCard {
  country: string;
  flag: string;
  name: string;
  stage: CBDCStage;
  tech: string;
  useCase: string;
  timeline: string;
  adoption?: string;
  detail: string;
}

interface DesignChoice {
  dimension: string;
  optionA: string;
  optionB: string;
  tradeoff: string;
}

// ── Shared UI ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral" | "warn";
  icon?: React.ReactNode;
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : highlight === "warn"
      ? "text-amber-400"
      : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-zinc-400">{icon}</span>}
        <span className="text-xs text-zinc-400">{label}</span>
      </div>
      <span className={cn("text-xl font-bold", valClass)}>{value}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
      {children}
    </h3>
  );
}

function InfoBox({
  children,
  variant = "blue",
}: {
  children: React.ReactNode;
  variant?: "blue" | "amber" | "emerald" | "rose";
}) {
  const colors = {
    blue: "bg-primary/10 border-border text-primary",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
    rose: "bg-rose-500/10 border-rose-500/30 text-rose-200",
  };
  return (
    <div className={cn("rounded-lg border p-3 text-xs leading-relaxed", colors[variant])}>
      {children}
    </div>
  );
}

function StageBadge({ stage }: { stage: CBDCStage }) {
  const map: Record<CBDCStage, string> = {
    launched: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    pilot: "bg-primary/20 text-primary border-border",
    research: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    cancelled: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  };
  return (
    <Badge className={cn("text-xs capitalize", map[stage])}>
      {stage}
    </Badge>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — CBDC Fundamentals
// ══════════════════════════════════════════════════════════════════════════════

const DESIGN_CHOICES: DesignChoice[] = [
  {
    dimension: "Access Model",
    optionA: "Account-Based",
    optionB: "Token-Based",
    tradeoff: "Account-based ties identity to balance; token-based resembles cash bearer instrument with pseudonymity.",
  },
  {
    dimension: "Architecture",
    optionA: "Direct (Central Bank holds all accounts)",
    optionB: "Intermediated (Banks distribute CBDC)",
    tradeoff: "Direct gives central bank full control; intermediated preserves commercial bank role & reduces CB operational burden.",
  },
  {
    dimension: "Availability",
    optionA: "24/7 Always-On",
    optionB: "Business Hours Only",
    tradeoff: "Always-on supports global payments but requires resilient infrastructure and continuous supervision.",
  },
  {
    dimension: "Interest Rate",
    optionA: "Interest-Bearing CBDC",
    optionB: "Non-Remunerated CBDC",
    tradeoff: "Interest-bearing is a powerful monetary tool but accelerates bank disintermediation risk.",
  },
  {
    dimension: "Privacy",
    optionA: "Full Anonymity (Cash-Like)",
    optionB: "Traceable (Bank-Deposit-Like)",
    tradeoff: "Anonymity supports civil liberties; traceability aids AML/CFT compliance. Most designs adopt a tiered approach.",
  },
  {
    dimension: "Programmability",
    optionA: "Programmable Money (Smart Conditions)",
    optionB: "Plain Currency (No Restrictions)",
    tradeoff: "Programmable money enables targeted stimulus and expiry dates but raises concerns about government overreach.",
  },
  {
    dimension: "Interoperability",
    optionA: "Domestic-Only",
    optionB: "Cross-Border Ready",
    tradeoff: "Cross-border requires multilateral governance, FX protocols and data sharing agreements between jurisdictions.",
  },
  {
    dimension: "Technology",
    optionA: "Distributed Ledger (DLT)",
    optionB: "Centralized Database",
    tradeoff: "DLT offers resilience and interoperability; centralized DB offers speed, simplicity and easier oversight.",
  },
];

function PrivacySpectrumSVG() {
  const points = [
    { x: 60, label: "Physical Cash", privacy: 100, color: "#10b981" },
    { x: 200, label: "CBDC (Tiered)", privacy: 60, color: "#3b82f6" },
    { x: 340, label: "Commercial Bank", privacy: 25, color: "#f59e0b" },
    { x: 480, label: "Credit Card", privacy: 10, color: "#ef4444" },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <SectionTitle>
        <Eye className="w-3.5 h-3.5" />
        Privacy Spectrum — Payment Methods
      </SectionTitle>
      <svg viewBox="0 0 540 160" className="w-full" style={{ height: 160 }}>
        {/* axis */}
        <line x1={20} y1={120} x2={520} y2={120} stroke="#3f3f46" strokeWidth={1} />
        <text x={20} y={140} fill="#71717a" fontSize={9}>Low Privacy</text>
        <text x={430} y={140} fill="#71717a" fontSize={9}>High Privacy</text>

        {/* gradient bar */}
        <defs>
          <linearGradient id="privacyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <rect x={20} y={112} width={500} height={8} rx={4} fill="url(#privacyGrad)" />

        {points.map((pt) => {
          const barH = (pt.privacy / 100) * 90;
          return (
            <g key={pt.label}>
              <rect
                x={pt.x - 28}
                y={120 - barH}
                width={56}
                height={barH}
                rx={4}
                fill={pt.color}
                fillOpacity={0.25}
                stroke={pt.color}
                strokeOpacity={0.6}
                strokeWidth={1}
              />
              <text x={pt.x} y={120 - barH - 6} fill={pt.color} fontSize={9} textAnchor="middle" fontWeight="bold">
                {pt.privacy}%
              </text>
              <text x={pt.x} y={155} fill="#a1a1aa" fontSize={8} textAnchor="middle">
                {pt.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-zinc-500 mt-1">
        Most CBDC designs adopt tiered privacy: small transactions anonymous, large transactions traceable for AML compliance.
      </p>
    </div>
  );
}

function DisintermediationRiskSVG() {
  const scenarios = [
    { label: "No CBDC", bankDeposits: 100, cbdc: 0 },
    { label: "5% Adoption", bankDeposits: 85, cbdc: 15 },
    { label: "20% Adoption", bankDeposits: 68, cbdc: 32 },
    { label: "40% Adoption", bankDeposits: 52, cbdc: 48 },
    { label: "60% Adoption", bankDeposits: 38, cbdc: 62 },
  ];
  const W = 540;
  const H = 160;
  const barW = 54;
  const gap = 30;
  const startX = 40;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <SectionTitle>
        <Building2 className="w-3.5 h-3.5" />
        Disintermediation Risk — Bank Deposits vs CBDC Holdings
      </SectionTitle>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {scenarios.map((sc, i) => {
          const x = startX + i * (barW + gap);
          const bankH = (sc.bankDeposits / 100) * 120;
          const cbdcH = (sc.cbdc / 100) * 120;
          return (
            <g key={sc.label}>
              {/* bank deposits bar */}
              <rect
                x={x}
                y={130 - bankH}
                width={barW * 0.46}
                height={bankH}
                rx={2}
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              {/* cbdc bar */}
              <rect
                x={x + barW * 0.54}
                y={130 - cbdcH}
                width={barW * 0.46}
                height={cbdcH}
                rx={2}
                fill="#8b5cf6"
                fillOpacity={0.7}
              />
              <text x={x + barW / 2} y={148} fill="#a1a1aa" fontSize={7.5} textAnchor="middle">
                {sc.label}
              </text>
            </g>
          );
        })}
        {/* legend */}
        <rect x={340} y={10} width={10} height={10} fill="#3b82f6" fillOpacity={0.6} rx={2} />
        <text x={354} y={19} fill="#a1a1aa" fontSize={9}>Bank Deposits</text>
        <rect x={430} y={10} width={10} height={10} fill="#8b5cf6" fillOpacity={0.7} rx={2} />
        <text x={444} y={19} fill="#a1a1aa" fontSize={9}>CBDC</text>
        {/* axis */}
        <line x1={30} y1={130} x2={530} y2={130} stroke="#3f3f46" strokeWidth={1} />
        <text x={5} y={134} fill="#52525b" fontSize={8}>0</text>
        <text x={5} y={14} fill="#52525b" fontSize={8}>100%</text>
      </svg>
      <p className="text-xs text-zinc-500 mt-1">
        High CBDC adoption shifts funding away from commercial banks, reducing their capacity to lend. Most central banks target holding limits of €3,000–€5,000 per wallet.
      </p>
    </div>
  );
}

function FundamentalsTab() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="CBDCs in Research/Pilot" value="134" sub="as of 2026" icon={<Globe className="w-3.5 h-3.5" />} />
        <StatCard label="Countries Launched" value="11" sub="full retail launch" highlight="pos" icon={<CheckCircle className="w-3.5 h-3.5" />} />
        <StatCard label="Population Covered" value="4.2B" sub="pilot participants" icon={<Users className="w-3.5 h-3.5" />} />
        <StatCard label="BIS Members Exploring" value="93%" sub="of central banks" highlight="warn" icon={<Activity className="w-3.5 h-3.5" />} />
      </div>

      {/* CBDC Type Comparison */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle>
          <Layers className="w-3.5 h-3.5" />
          CBDC Types — Retail vs Wholesale vs Synthetic
        </SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4 text-left text-zinc-400 font-medium">Attribute</th>
                <th className="py-2 pr-4 text-left text-primary font-medium">Retail CBDC</th>
                <th className="py-2 pr-4 text-left text-primary font-medium">Wholesale CBDC</th>
                <th className="py-2 text-left text-amber-400 font-medium">Synthetic CBDC</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Target Users", "General public / households", "Financial institutions", "Private stablecoins (CB-backed)"],
                ["Liability", "Direct central bank liability", "Direct central bank liability", "Private issuer liability"],
                ["Access", "Via wallet app / merchant", "Interbank settlement", "Public via private wallets"],
                ["Privacy", "Tiered (cash-like small txn)", "Low (institutional KYC)", "Variable (issuer policy)"],
                ["Monetary Policy", "Can bear interest, expiry", "Reduces settlement risk", "Indirect (reserve-backed)"],
                ["Disintermediation Risk", "High — replaces deposits", "Low — wholesale only", "Low — private issuer buffer"],
                ["Examples", "e-CNY, digital euro, e-Rupee", "Project mBridge, Jura", "Narrow bank stablecoins"],
              ].map(([attr, retail, wholesale, synthetic], i) => (
                <tr key={attr} className={cn("border-b border-white/5", i % 2 === 0 ? "bg-white/2" : "")}>
                  <td className="py-2 pr-4 text-zinc-400 font-medium">{attr}</td>
                  <td className="py-2 pr-4 text-zinc-200">{retail}</td>
                  <td className="py-2 pr-4 text-zinc-200">{wholesale}</td>
                  <td className="py-2 text-zinc-200">{synthetic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account-Based vs Token-Based */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Account-Based CBDC</span>
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-300">
            <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />Identity verification required at account opening</li>
            <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />Full transaction audit trail — AML/CFT compliant</li>
            <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />Easier to implement interest rates and holding limits</li>
            <li className="flex items-start gap-1.5"><XCircle className="w-3 h-3 text-rose-400 mt-0.5 shrink-0" />Requires persistent internet connectivity</li>
            <li className="flex items-start gap-1.5"><XCircle className="w-3 h-3 text-rose-400 mt-0.5 shrink-0" />Excludes unbanked without digital ID infrastructure</li>
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Token-Based CBDC</span>
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-300">
            <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />Bearer instrument — no account needed</li>
            <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />Offline capable — works without connectivity</li>
            <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />Privacy-preserving — cash-like pseudonymity</li>
            <li className="flex items-start gap-1.5"><XCircle className="w-3 h-3 text-rose-400 mt-0.5 shrink-0" />Complex cryptographic key management</li>
            <li className="flex items-start gap-1.5"><XCircle className="w-3 h-3 text-rose-400 mt-0.5 shrink-0" />Double-spend prevention requires secure hardware</li>
          </ul>
        </div>
      </div>

      {/* Privacy Spectrum SVG */}
      <PrivacySpectrumSVG />

      {/* Disintermediation SVG */}
      <DisintermediationRiskSVG />

      {/* Design Decisions Matrix */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle>
          <BarChart3 className="w-3.5 h-3.5" />
          Design Decisions Matrix
        </SectionTitle>
        <div className="space-y-2">
          {DESIGN_CHOICES.map((choice, i) => (
            <div key={choice.dimension} className="border border-white/8 rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
                onClick={() => setExpandedRow(expandedRow === i ? null : i)}
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="text-xs font-medium text-zinc-300 w-36 shrink-0">{choice.dimension}</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary border-border text-xs">{choice.optionA}</Badge>
                    <span className="text-zinc-600 text-xs">vs</span>
                    <Badge className="bg-primary/20 text-primary border-border text-xs">{choice.optionB}</Badge>
                  </div>
                </div>
                {expandedRow === i
                  ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  : <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
              </button>
              <AnimatePresence>
                {expandedRow === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3">
                      <InfoBox variant="blue">
                        <span className="font-semibold">Trade-off: </span>{choice.tradeoff}
                      </InfoBox>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Tiered Remuneration */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <SectionTitle>
          <Banknote className="w-3.5 h-3.5 text-amber-400" />
          Tiered Remuneration Structure
        </SectionTitle>
        <p className="text-xs text-zinc-300 mb-3">
          Tiered remuneration prevents CBDC from becoming a dominant savings vehicle while still rewarding everyday use. Different rates apply to different holding tiers.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-1.5 pr-4 text-left text-zinc-400">Tier</th>
                <th className="py-1.5 pr-4 text-left text-zinc-400">Holding Limit</th>
                <th className="py-1.5 pr-4 text-left text-zinc-400">Interest Rate</th>
                <th className="py-1.5 text-left text-zinc-400">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Tier 1", "0 – €2,000", "Policy rate – 0.5%", "Everyday payments, cash substitute"],
                ["Tier 2", "€2,001 – €5,000", "Policy rate – 1.5%", "Moderate savings discouraged"],
                ["Tier 3", "> €5,000", "0% or penalty rate", "Large holdings penalised to prevent bank run"],
              ].map(([tier, limit, rate, purpose]) => (
                <tr key={tier} className="border-b border-white/5">
                  <td className="py-1.5 pr-4 text-amber-300 font-medium">{tier}</td>
                  <td className="py-1.5 pr-4 text-zinc-200">{limit}</td>
                  <td className="py-1.5 pr-4 text-zinc-200">{rate}</td>
                  <td className="py-1.5 text-zinc-400">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Global Tracker
// ══════════════════════════════════════════════════════════════════════════════

const COUNTRIES: CountryCard[] = [
  {
    country: "China",
    flag: "🇨🇳",
    name: "Digital Yuan (e-CNY)",
    stage: "launched",
    tech: "Centralized DB, two-tier",
    useCase: "Retail payments, subsidies distribution",
    timeline: "Pilot 2020, full rollout 2022",
    adoption: "260M wallets, ¥1.8T transactions",
    detail: "World's most advanced major CBDC. Operates via a two-tier model through commercial banks. Features offline payments via NFC-enabled hardware wallets. Integrated with WeChat Pay and Alipay infrastructure. Programmable with expiry dates for targeted government stimulus.",
  },
  {
    country: "European Union",
    flag: "🇪🇺",
    name: "Digital Euro",
    stage: "pilot",
    tech: "DLT hybrid, ECB-intermediated",
    useCase: "Eurozone retail payments, offline cash substitute",
    timeline: "Investigation phase 2021, pilot 2023, decision 2026",
    adoption: "Pilot with 5 PSPs across eurozone",
    detail: "ECB targeting €3,000 holding limit per citizen. Strong emphasis on privacy-by-design. Legal framework requires EU Parliament approval. Designed to complement, not replace, private payment solutions. Waterfall feature auto-converts digital euro to bank deposit above threshold.",
  },
  {
    country: "United States",
    flag: "🇺🇸",
    name: "Digital Dollar / FedNow",
    stage: "research",
    tech: "FedNow (fast payments) — CBDC still TBD",
    useCase: "FedNow: instant settlement; CBDC: undecided",
    timeline: "FedNow live 2023; retail CBDC politically uncertain",
    adoption: "FedNow: 500+ banks",
    detail: "US approach bifurcated: FedNow instant payment system launched 2023, but retail CBDC faces political opposition. Congressional debate active around privacy and Fed authority. Project Hamilton (MIT collaboration) explored technical architecture. No formal retail CBDC decision as of 2026.",
  },
  {
    country: "India",
    flag: "🇮🇳",
    name: "Digital Rupee (e₹)",
    stage: "pilot",
    tech: "Centralized, UPI-integrated",
    useCase: "Retail + wholesale, financial inclusion",
    timeline: "Wholesale pilot Nov 2022, retail Dec 2022",
    adoption: "1M users in retail pilot",
    detail: "RBI launched dual pilots: wholesale e₹-W for government securities and retail e₹-R. Leverages existing UPI rails for distribution. Focuses on financial inclusion for India's 190M unbanked. QR code payments, feature phone compatibility emphasized.",
  },
  {
    country: "Nigeria",
    flag: "🇳🇬",
    name: "eNaira",
    stage: "launched",
    tech: "Hyperledger Fabric, account-based",
    useCase: "Financial inclusion, remittances",
    timeline: "Launched October 2021",
    adoption: "~860K wallets (lower than expected)",
    detail: "Africa's first CBDC. Adoption has been sluggish due to trust deficit and smartphone penetration barriers. Government incentivised use via discounts for CBDC payments of public services. Redesigned app in 2023. Provides corridor for African diaspora remittances.",
  },
  {
    country: "Bahamas",
    flag: "🇧🇸",
    name: "Sand Dollar",
    stage: "launched",
    tech: "NZIA platform, account-based",
    useCase: "Island financial inclusion, hurricane resilience",
    timeline: "Launched October 2020 — world's first",
    adoption: "~3% of currency in circulation",
    detail: "World's first fully operational retail CBDC. Designed for resilience across 700 islands where banking access is uneven. Licensed payment service providers act as intermediaries. Offline capability crucial for post-hurricane financial continuity.",
  },
  {
    country: "Sweden",
    flag: "🇸🇪",
    name: "e-Krona",
    stage: "research",
    tech: "R3 Corda DLT (pilot), final design TBD",
    useCase: "Backup payment system as cash usage declines",
    timeline: "Pilot Phase 3 completed 2023, policy decision pending",
    adoption: "Technical proof-of-concept only",
    detail: "Riksbank motivated by Sweden's rapid cash decline (only 8% of payments use cash). e-Krona would serve as public money backstop. Extensive cross-border testing with Norges Bank and DNB under Project Icebreaker. Exploring programmable features for targeted payments.",
  },
  {
    country: "Japan",
    flag: "🇯🇵",
    name: "Digital Yen",
    stage: "pilot",
    tech: "PoC platform, intermediated",
    useCase: "Payment modernisation, cross-border settlement",
    timeline: "Phase 1 PoC 2021, Phase 3 pilot 2023",
    adoption: "Pilot with 3 major banks",
    detail: "Bank of Japan emphasizes \"no decision to issue\" but extensive technical preparation. Key concerns: negative interest rate implications and bank deposit migration. Cross-border use case explored via mBridge and Project Stella with ECB.",
  },
  {
    country: "Brazil",
    flag: "🇧🇷",
    name: "DREX (Digital Real)",
    stage: "pilot",
    tech: "Ethereum-based permissioned DLT",
    useCase: "Wholesale tokenized finance, programmable payments",
    timeline: "Pilot 2023, launch targeted 2025",
    adoption: "16 institutions in pilot consortium",
    detail: "Banco do Brasil's DREX focuses on tokenized financial assets and DeFi-compatible infrastructure. Uses Hyperledger Besu (Ethereum-compatible). Emphasizes privacy via zero-knowledge proofs. First major CBDC explicitly designed for tokenized economy compatibility.",
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    name: "Digital Canadian Dollar",
    stage: "research",
    tech: "Under investigation",
    useCase: "Contingency planning, financial inclusion",
    timeline: "Research ongoing, no pilot announced",
    adoption: "Public consultation completed 2023",
    detail: "Bank of Canada exploring CBDC as contingency if cash becomes unusable or dominant private platforms emerge. Published detailed research on design options. Consultation showed public preference for privacy protections exceeding current banking standards.",
  },
  {
    country: "Eastern Caribbean",
    flag: "🇱🇨",
    name: "DCash",
    stage: "launched",
    tech: "Bitt platform, blockchain-based",
    useCase: "Regional payments across 8 island states",
    timeline: "Launched March 2021, outage 2022",
    adoption: "Operational but low uptake post-outage",
    detail: "First multi-country CBDC across Eastern Caribbean Currency Union (8 countries). Suffered 2-month outage in Jan 2022 due to certificate expiry — highlighting operational resilience concerns. Significant rebuild and recommissioning in late 2022.",
  },
  {
    country: "Russia",
    flag: "🇷🇺",
    name: "Digital Ruble",
    stage: "pilot",
    tech: "Centralized platform, Bank of Russia",
    useCase: "Sanctions evasion, cross-border trade",
    timeline: "Pilot 2023, rollout accelerated post-sanctions",
    adoption: "12 banks in pilot",
    detail: "Russia has accelerated digital ruble development following 2022 SWIFT exclusion. Primary motivation: creating sanction-resistant payment corridor with China, India, Iran. Architecture purely centralized. Concerns raised about government surveillance capabilities.",
  },
];

// Simplified World Map SVG with colored dots for each country
function WorldMapSVG({ selected, onSelect }: { selected: string | null; onSelect: (c: string) => void }) {
  const stageColor: Record<CBDCStage, string> = {
    launched: "#10b981",
    pilot: "#3b82f6",
    research: "#f59e0b",
    cancelled: "#ef4444",
  };

  // approximate mercator-like pixel positions for each country
  const positions: Record<string, [number, number]> = {
    China: [670, 145],
    "European Union": [455, 105],
    "United States": [190, 130],
    India: [630, 175],
    Nigeria: [450, 215],
    Bahamas: [245, 168],
    Sweden: [470, 78],
    Japan: [730, 135],
    Brazil: [290, 270],
    Canada: [185, 95],
    "Eastern Caribbean": [265, 195],
    Russia: [570, 90],
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <SectionTitle>
          <Globe className="w-3.5 h-3.5" />
          Global CBDC Status Map
        </SectionTitle>
        <div className="flex items-center gap-3 text-xs">
          {(["launched", "pilot", "research", "cancelled"] as CBDCStage[]).map((st) => (
            <div key={st} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: stageColor[st] }} />
              <span className="text-zinc-400 capitalize">{st}</span>
            </div>
          ))}
        </div>
      </div>
      <svg viewBox="0 0 820 360" className="w-full" style={{ height: 220 }}>
        {/* Simplified world landmass outline */}
        <rect x={0} y={0} width={820} height={360} fill="#0f0f14" rx={8} />
        {/* North America */}
        <ellipse cx={195} cy={130} rx={90} ry={65} fill="#1c1c2e" stroke="#2d2d3d" strokeWidth={0.8} />
        {/* South America */}
        <ellipse cx={275} cy={270} rx={50} ry={70} fill="#1c1c2e" stroke="#2d2d3d" strokeWidth={0.8} />
        {/* Europe */}
        <ellipse cx={460} cy={105} rx={55} ry={45} fill="#1c1c2e" stroke="#2d2d3d" strokeWidth={0.8} />
        {/* Africa */}
        <ellipse cx={470} cy={230} rx={60} ry={80} fill="#1c1c2e" stroke="#2d2d3d" strokeWidth={0.8} />
        {/* Asia */}
        <ellipse cx={640} cy={130} rx={130} ry={70} fill="#1c1c2e" stroke="#2d2d3d" strokeWidth={0.8} />
        {/* Australia */}
        <ellipse cx={720} cy={270} rx={45} ry={30} fill="#1c1c2e" stroke="#2d2d3d" strokeWidth={0.8} />

        {/* Country dots */}
        {COUNTRIES.map((c) => {
          const pos = positions[c.country];
          if (!pos) return null;
          const color = stageColor[c.stage];
          const isSelected = selected === c.country;
          return (
            <g
              key={c.country}
              onClick={() => onSelect(c.country)}
              style={{ cursor: "pointer" }}
            >
              {isSelected && (
                <circle cx={pos[0]} cy={pos[1]} r={12} fill={color} fillOpacity={0.2} />
              )}
              <circle
                cx={pos[0]}
                cy={pos[1]}
                r={isSelected ? 7 : 5}
                fill={color}
                stroke={isSelected ? "#fff" : color}
                strokeWidth={isSelected ? 1.5 : 0.5}
                fillOpacity={0.85}
              />
              <text
                x={pos[0]}
                y={pos[1] - 10}
                fill="#d4d4d8"
                fontSize={7}
                textAnchor="middle"
                fontWeight={isSelected ? "bold" : "normal"}
              >
                {c.flag}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-zinc-500 mt-1">Click a dot to see country details below.</p>
    </div>
  );
}

function GlobalTrackerTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<CBDCStage | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? COUNTRIES : COUNTRIES.filter((c) => c.stage === filter)),
    [filter]
  );

  const selectedCard = useMemo(
    () => COUNTRIES.find((c) => c.country === selected) ?? null,
    [selected]
  );

  const stageCounts = useMemo(() => {
    const counts: Record<CBDCStage, number> = { launched: 0, pilot: 0, research: 0, cancelled: 0 };
    COUNTRIES.forEach((c) => counts[c.stage]++);
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Launched" value={String(stageCounts.launched)} highlight="pos" icon={<CheckCircle className="w-3.5 h-3.5" />} />
        <StatCard label="In Pilot" value={String(stageCounts.pilot)} highlight="neutral" icon={<Activity className="w-3.5 h-3.5" />} />
        <StatCard label="Research" value={String(stageCounts.research)} highlight="warn" icon={<BarChart3 className="w-3.5 h-3.5" />} />
        <StatCard label="Cancelled" value={String(stageCounts.cancelled)} highlight="neg" icon={<XCircle className="w-3.5 h-3.5" />} />
      </div>

      {/* World Map */}
      <WorldMapSVG selected={selected} onSelect={(c) => setSelected((prev) => (prev === c ? null : c))} />

      {/* Selected country detail */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            key={selectedCard.country}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-border bg-primary/5 p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{selectedCard.flag}</span>
                  <span className="text-base font-bold text-white">{selectedCard.name}</span>
                  <StageBadge stage={selectedCard.stage} />
                </div>
                <div className="text-xs text-zinc-400">{selectedCard.country}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3 text-xs">
              <div>
                <span className="text-zinc-500 block">Technology</span>
                <span className="text-zinc-200">{selectedCard.tech}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Use Case</span>
                <span className="text-zinc-200">{selectedCard.useCase}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Timeline</span>
                <span className="text-zinc-200">{selectedCard.timeline}</span>
              </div>
              {selectedCard.adoption && (
                <div>
                  <span className="text-zinc-500 block">Adoption</span>
                  <span className="text-zinc-200">{selectedCard.adoption}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{selectedCard.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-zinc-400">Filter:</span>
        {(["all", "launched", "pilot", "research", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 rounded-full text-xs capitalize border transition-colors",
              filter === f
                ? "bg-primary/30 border-primary/50 text-primary"
                : "border-white/10 text-zinc-400 hover:border-white/20"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Country cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((c) => (
          <motion.div
            key={c.country}
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className={cn(
              "rounded-xl border p-3 cursor-pointer transition-colors",
              selected === c.country
                ? "border-primary/50 bg-primary/10"
                : "border-white/10 bg-white/5 hover:bg-white/8"
            )}
            onClick={() => setSelected((prev) => (prev === c.country ? null : c.country))}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{c.flag}</span>
                <span className="text-sm font-semibold text-zinc-100">{c.country}</span>
              </div>
              <StageBadge stage={c.stage} />
            </div>
            <div className="text-xs font-medium text-primary mb-1">{c.name}</div>
            <div className="text-xs text-zinc-400">{c.useCase}</div>
            <div className="text-xs text-zinc-500 mt-1">{c.timeline}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Monetary Policy
// ══════════════════════════════════════════════════════════════════════════════

// Bank Run Risk Simulation SVG
function BankRunRiskSVG() {
  const scenarios = [
    { label: "Normal", bankDeposits: 95, cbdc: 5, color: "#10b981" },
    { label: "Mild Stress", bankDeposits: 78, cbdc: 22, color: "#f59e0b" },
    { label: "Crisis (no limit)", bankDeposits: 52, cbdc: 48, color: "#ef4444" },
    { label: "Crisis (€3K limit)", bankDeposits: 82, cbdc: 18, color: "#3b82f6" },
  ];
  const W = 540;
  const H = 180;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <SectionTitle>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        Bank Run Risk Simulation — Deposit Flight to CBDC
      </SectionTitle>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {scenarios.map((sc, i) => {
          const x = 20 + i * 130;
          const totalH = 130;
          const bankH = (sc.bankDeposits / 100) * totalH;
          const cbdcH = (sc.cbdc / 100) * totalH;
          return (
            <g key={sc.label}>
              {/* stacked bar: bank deposits (bottom) + cbdc (top) */}
              <rect x={x} y={10 + totalH - bankH - cbdcH} width={80} height={cbdcH} fill="#8b5cf6" fillOpacity={0.7} rx={2} />
              <rect x={x} y={10 + totalH - bankH} width={80} height={bankH} fill="#3b82f6" fillOpacity={0.5} rx={2} />
              {/* labels inside bars */}
              {cbdcH > 18 && (
                <text x={x + 40} y={10 + totalH - bankH - cbdcH / 2 + 4} fill="#e9d5ff" fontSize={9} textAnchor="middle">
                  {sc.cbdc}%
                </text>
              )}
              {bankH > 18 && (
                <text x={x + 40} y={10 + totalH - bankH / 2 + 4} fill="#bfdbfe" fontSize={9} textAnchor="middle">
                  {sc.bankDeposits}%
                </text>
              )}
              <text x={x + 40} y={H - 18} fill={sc.color} fontSize={8.5} textAnchor="middle" fontWeight="600">
                {sc.label}
              </text>
            </g>
          );
        })}
        {/* legend */}
        <rect x={340} y={8} width={10} height={10} fill="#8b5cf6" fillOpacity={0.7} rx={2} />
        <text x={354} y={17} fill="#a1a1aa" fontSize={9}>CBDC</text>
        <rect x={340} y={24} width={10} height={10} fill="#3b82f6" fillOpacity={0.5} rx={2} />
        <text x={354} y={33} fill="#a1a1aa" fontSize={9}>Bank Deposits</text>
        {/* axis */}
        <line x1={10} y1={140} x2={530} y2={140} stroke="#3f3f46" strokeWidth={1} />
      </svg>
      <p className="text-xs text-zinc-500 mt-1">
        Holding limits (e.g. €3,000) dramatically reduce run risk by capping CBDC as a safe-haven during financial stress — shown in the "Crisis (€3K limit)" scenario.
      </p>
    </div>
  );
}

// Financial Inclusion SVG
function FinancialInclusionSVG() {
  const regions = [
    { region: "Sub-Saharan Africa", unbanked: 57, cbdcImpact: 28, color: "#10b981" },
    { region: "South Asia", unbanked: 33, cbdcImpact: 18, color: "#3b82f6" },
    { region: "East Asia", unbanked: 27, cbdcImpact: 14, color: "#8b5cf6" },
    { region: "Latin America", unbanked: 23, cbdcImpact: 10, color: "#f59e0b" },
    { region: "Middle East", unbanked: 47, cbdcImpact: 22, color: "#ef4444" },
    { region: "Europe", unbanked: 6, cbdcImpact: 3, color: "#06b6d4" },
  ];
  const maxVal = 65;
  const W = 540;
  const rowH = 26;
  const labelW = 130;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <SectionTitle>
        <Users className="w-3.5 h-3.5" />
        Financial Inclusion — Unbanked Population &amp; CBDC Potential Impact (%)
      </SectionTitle>
      <svg viewBox={`0 0 ${W} ${regions.length * rowH + 20}`} className="w-full" style={{ height: regions.length * rowH + 20 }}>
        {regions.map((r, i) => {
          const y = 10 + i * rowH;
          const barW = ((W - labelW - 20) / maxVal) * r.unbanked;
          const impactW = ((W - labelW - 20) / maxVal) * r.cbdcImpact;
          return (
            <g key={r.region}>
              <text x={0} y={y + 14} fill="#a1a1aa" fontSize={8.5}>{r.region}</text>
              <rect x={labelW} y={y + 2} width={barW} height={16} rx={3} fill={r.color} fillOpacity={0.25} />
              <rect x={labelW} y={y + 2} width={impactW} height={16} rx={3} fill={r.color} fillOpacity={0.65} />
              <text x={labelW + barW + 4} y={y + 14} fill={r.color} fontSize={8.5}>{r.unbanked}% unbanked</text>
            </g>
          );
        })}
        {/* legend */}
      </svg>
      <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-2.5 rounded-sm bg-emerald-500/25" />
          <span>Current unbanked rate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-2.5 rounded-sm bg-emerald-500/65" />
          <span>Potential CBDC inclusion gain</span>
        </div>
      </div>
    </div>
  );
}

function MonetaryPolicyTab() {
  return (
    <div className="space-y-6">
      {/* Key concepts stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Rate Transmission Speed" value="Instant" sub="vs 6–18mo for traditional tools" highlight="pos" icon={<Zap className="w-3.5 h-3.5" />} />
        <StatCard label="Helicopter Money Target" value="100%" sub="addressable via CBDC wallets" highlight="pos" icon={<Banknote className="w-3.5 h-3.5" />} />
        <StatCard label="Negative Rate Barrier" value="Removed" sub="CBDC eliminates cash hoarding" highlight="warn" icon={<TrendingDown className="w-3.5 h-3.5" />} />
        <StatCard label="Bank Run Amplification" value="2–5×" sub="faster than traditional runs" highlight="neg" icon={<AlertTriangle className="w-3.5 h-3.5" />} />
      </div>

      {/* Programmable Money */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle>
          <Zap className="w-3.5 h-3.5" />
          Programmable Money — CBDC Features
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              title: "Expiry Dates",
              icon: <Clock className="w-4 h-4 text-primary" />,
              color: "blue",
              desc: "Government can issue CBDC that expires after 90 days, forcing spending and preventing hoarding. Useful for targeted stimulus but raises concerns about government control over savings.",
              example: "China used expiring e-CNY vouchers during COVID stimulus to ensure money was spent locally.",
            },
            {
              title: "Conditional Payments",
              icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
              color: "emerald",
              desc: "Smart contracts enable CBDC to be spent only on eligible goods: food, medicine, rent. Welfare payments automatically restricted to prevent misuse.",
              example: "Singapore MAS explored conditional CBDC for food vouchers restricted to licensed merchants.",
            },
            {
              title: "Negative Interest Rates",
              icon: <TrendingDown className="w-4 h-4 text-amber-400" />,
              color: "amber",
              desc: "Unlike physical cash, CBDC can bear negative rates — penalising holders for hoarding. Central banks could push below zero without risk of cash substitution.",
              example: "ECB theorised CBDC could enable –2% rates in deflationary scenarios, impossible with cash.",
            },
            {
              title: "Helicopter Money Distribution",
              icon: <Banknote className="w-4 h-4 text-primary" />,
              color: "purple" as const,
              desc: "Direct universal transfers to every citizen wallet. No intermediary banks required. Bypasses credit channel entirely for immediate stimulus effect.",
              example: "BIS research shows CBDC helicopter money reaches 100% of population in hours vs weeks via bank transfers.",
            },
          ].map((item) => (
            <div key={item.title} className={cn(
              "rounded-lg border p-3",
              item.color === "blue" ? "border-border bg-primary/5" :
              item.color === "emerald" ? "border-emerald-500/30 bg-emerald-500/5" :
              item.color === "amber" ? "border-amber-500/30 bg-amber-500/5" :
              "border-border bg-primary/5"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {item.icon}
                <span className="text-sm font-semibold text-zinc-100">{item.title}</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-2">{item.desc}</p>
              <div className="text-xs text-zinc-500 italic border-l-2 border-white/10 pl-2">{item.example}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Run Risk SVG */}
      <BankRunRiskSVG />

      {/* Financial Inclusion SVG */}
      <FinancialInclusionSVG />

      {/* Interest Rate Transmission */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle>
          <Activity className="w-3.5 h-3.5" />
          Interest Rate Transmission — Traditional vs CBDC
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">Traditional Transmission</h4>
            <div className="space-y-1.5">
              {[
                ["Central Bank Rate Decision", "Day 0", "zinc"],
                ["Interbank Rate Adjusts", "Days 1–3", "zinc"],
                ["Mortgage/Loan Rates Change", "Weeks 2–8", "amber"],
                ["Consumer Spending Changes", "Months 3–6", "amber"],
                ["Inflation Impact", "Months 6–18", "rose"],
              ].map(([step, time, color]) => (
                <div key={step as string} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-white/5">
                  <span className="text-zinc-300">{step as string}</span>
                  <span className={cn("font-medium", color === "rose" ? "text-rose-400" : color === "amber" ? "text-amber-400" : "text-zinc-400")}>{time as string}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">CBDC Transmission</h4>
            <div className="space-y-1.5">
              {[
                ["Central Bank Rate Decision", "Day 0", "zinc"],
                ["CBDC Rate Updates Instantly", "Hours 0–2", "emerald"],
                ["Wallet Balance Rates Change", "Same Day", "emerald"],
                ["Consumer Spending Shifts", "Days 1–7", "emerald"],
                ["Inflation Impact", "Weeks 4–12", "blue"],
              ].map(([step, time, color]) => (
                <div key={step as string} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-white/5">
                  <span className="text-zinc-300">{step as string}</span>
                  <span className={cn("font-medium", color === "emerald" ? "text-emerald-400" : color === "blue" ? "text-primary" : "text-zinc-400")}>{time as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <InfoBox variant="blue" >
          <span className="font-semibold">Key insight: </span>CBDC compresses monetary policy transmission from 6–18 months to potentially 4–12 weeks, giving central banks unprecedented speed and precision — but also amplifying the risk of policy errors.
        </InfoBox>
      </div>

      {/* Risks summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            title: "Disintermediation",
            risk: "High",
            desc: "Households park savings in CBDC rather than bank deposits, reducing bank lending capacity.",
            color: "rose",
          },
          {
            title: "Surveillance State",
            risk: "Medium",
            desc: "Programmable money gives governments power to restrict purchases — civil liberties concern.",
            color: "amber",
          },
          {
            title: "Cyber Risk",
            risk: "High",
            desc: "Single-point-of-failure in centralized CBDC: successful attack affects entire money supply.",
            color: "rose",
          },
        ].map((item) => (
          <div key={item.title} className={cn(
            "rounded-xl border p-3",
            item.color === "rose" ? "border-rose-500/30 bg-rose-500/5" : "border-amber-500/30 bg-amber-500/5"
          )}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-zinc-100">{item.title}</span>
              <Badge className={cn("text-xs", item.color === "rose" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30")}>
                {item.risk} Risk
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Cross-Border Payments
// ══════════════════════════════════════════════════════════════════════════════

// mBridge SVG Flow Diagram
function MBridgeFlowSVG() {
  const participants = [
    { x: 70, y: 80, label: "China", flag: "🇨🇳", color: "#ef4444" },
    { x: 200, y: 40, label: "UAE", flag: "🇦🇪", color: "#10b981" },
    { x: 330, y: 40, label: "Thailand", flag: "🇹🇭", color: "#3b82f6" },
    { x: 460, y: 80, label: "Hong Kong", flag: "🇭🇰", color: "#f59e0b" },
  ];

  const centerX = 265;
  const centerY = 145;

  const flows = [
    { from: 0, to: 1, label: "e-CNY → AED" },
    { from: 1, to: 2, label: "AED → THB" },
    { from: 2, to: 3, label: "THB → HKD" },
    { from: 3, to: 0, label: "HKD → e-CNY" },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <SectionTitle>
        <Network className="w-3.5 h-3.5" />
        Project mBridge — Multi-CBDC Cross-Border Payment Platform
      </SectionTitle>
      <svg viewBox="0 0 540 220" className="w-full" style={{ height: 220 }}>
        {/* Central hub */}
        <circle cx={centerX} cy={centerY} r={40} fill="#1e1b4b" stroke="#4338ca" strokeWidth={1.5} />
        <text x={centerX} y={centerY - 6} fill="#818cf8" fontSize={9} textAnchor="middle" fontWeight="bold">mBridge</text>
        <text x={centerX} y={centerY + 7} fill="#818cf8" fontSize={7.5} textAnchor="middle">Shared Platform</text>
        <text x={centerX} y={centerY + 18} fill="#6366f1" fontSize={7} textAnchor="middle">BIS + 4 CBs</text>

        {/* Spokes to participants */}
        {participants.map((p) => (
          <line
            key={p.label}
            x1={p.x + 25}
            y1={p.y + 18}
            x2={centerX}
            y2={centerY}
            stroke="#4338ca"
            strokeWidth={1}
            strokeDasharray="4,3"
            strokeOpacity={0.6}
          />
        ))}

        {/* Participant nodes */}
        {participants.map((p) => (
          <g key={p.label}>
            <rect x={p.x} y={p.y} width={50} height={36} rx={6} fill="#18181b" stroke={p.color} strokeWidth={1.2} />
            <text x={p.x + 25} y={p.y + 14} fontSize={12} textAnchor="middle">{p.flag}</text>
            <text x={p.x + 25} y={p.y + 28} fontSize={8} textAnchor="middle" fill="#d4d4d8">{p.label}</text>
          </g>
        ))}

        {/* Flow arrows around the outside */}
        {flows.map((f, i) => {
          const from = participants[f.from];
          const to = participants[f.to];
          const midX = (from.x + to.x) / 2 + 25;
          const midY = Math.min(from.y, to.y) - 12;
          return (
            <g key={i}>
              <line
                x1={from.x + 50}
                y1={from.y + 18}
                x2={to.x}
                y2={to.y + 18}
                stroke="#6366f1"
                strokeWidth={1}
                strokeOpacity={0.4}
                markerEnd="url(#arrowM)"
              />
              <text x={midX} y={midY} fill="#818cf8" fontSize={7} textAnchor="middle">{f.label}</text>
            </g>
          );
        })}

        {/* Arrow marker */}
        <defs>
          <marker id="arrowM" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 Z" fill="#6366f1" opacity={0.7} />
          </marker>
        </defs>

        {/* Bottom info */}
        <text x={centerX} y={210} fill="#71717a" fontSize={8} textAnchor="middle">Settlement: T+0 atomic swap via mBridge shared ledger</text>
      </svg>
      <p className="text-xs text-zinc-500 mt-1">
        mBridge (BIS Innovation Hub + HKMA + PBoC + BOT + CBUAE) completed MVP in 2024. $22M in real transactions. First multi-CBDC platform to achieve live cross-border settlement.
      </p>
    </div>
  );
}

function CrossBorderTab() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Correspondent Banking Cost" value="6.35%" sub="avg cross-border fee" highlight="neg" icon={<TrendingDown className="w-3.5 h-3.5" />} />
        <StatCard label="CBDC Settlement Cost" value="~0.1%" sub="projected with mBridge" highlight="pos" icon={<TrendingUp className="w-3.5 h-3.5" />} />
        <StatCard label="SWIFT Settlement" value="T+1–3" sub="business days" highlight="warn" icon={<Clock className="w-3.5 h-3.5" />} />
        <StatCard label="CBDC Settlement" value="T+0" sub="atomic real-time" highlight="pos" icon={<Zap className="w-3.5 h-3.5" />} />
      </div>

      {/* mBridge SVG */}
      <MBridgeFlowSVG />

      {/* Swift vs CBDC comparison */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle>
          <ArrowLeftRight className="w-3.5 h-3.5" />
          SWIFT vs CBDC Cross-Border Comparison
        </SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4 text-left text-zinc-400 font-medium">Dimension</th>
                <th className="py-2 pr-4 text-left text-primary font-medium">SWIFT Network</th>
                <th className="py-2 text-left text-emerald-400 font-medium">Multi-CBDC Platform</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Settlement Speed", "T+1 to T+3 (business days)", "T+0 atomic settlement"],
                ["Cost per Transaction", "USD 25–35 + correspondent fees (avg 6.35%)", "~0.01–0.10% projected"],
                ["Availability", "Business hours, cut-off times", "24/7/365"],
                ["Transparency", "Low — opaque intermediary chain", "High — shared ledger visibility"],
                ["Failure Points", "Multiple correspondent banks", "Single platform (higher concentration risk)"],
                ["FX Conversion", "Multiple manual FX conversions", "Atomic FX swap on settlement"],
                ["Sanctions Compliance", "Established OFAC/EU screening", "Requires new multilateral governance"],
                ["Liquidity", "USD dominant, pre-funded nostro", "Tokenized reserves on platform"],
                ["Adoption", "11,000+ financial institutions", "Pilot stage — 4 central banks"],
                ["Governance", "Cooperative (Belgian HQ)", "BIS + member central banks"],
              ].map(([dim, swift, cbdc]) => (
                <tr key={dim as string} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="py-2 pr-4 text-zinc-400 font-medium">{dim as string}</td>
                  <td className="py-2 pr-4 text-zinc-300">{swift as string}</td>
                  <td className="py-2 text-zinc-300">{cbdc as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BIS Projects */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle>
          <Globe className="w-3.5 h-3.5" />
          BIS Innovation Hub — Key Cross-Border Projects
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              name: "Project mBridge",
              status: "MVP Complete",
              statusColor: "emerald",
              participants: "HKMA, PBoC, BOT, CBUAE, BIS",
              tech: "mBridge custom DLT",
              desc: "Multi-CBDC platform for real-value cross-border payments. Completed MVP 2024 with $22M in live transactions. China, UAE, Thailand, HK participants. First platform to achieve live multi-CBDC settlement.",
            },
            {
              name: "Project Dunbar",
              status: "Prototype",
              statusColor: "blue",
              participants: "MAS, RBA, BNM, SARB, BIS",
              tech: "Corda & Quorum DLT",
              desc: "Cross-border settlement using multiple CBDCs. Singapore, Australia, Malaysia, South Africa explored a shared platform where commercial banks transact directly using CBDC without correspondent banks.",
            },
            {
              name: "Project Jura",
              status: "Prototype",
              statusColor: "blue",
              participants: "SNB, BdF, BIS",
              tech: "DLT — permissioned Ethereum",
              desc: "Wholesale cross-border settlement using Swiss and French CBDCs on a third-party platform. Tested tokenized euro commercial paper, FX payment-vs-payment with atomic settlement.",
            },
            {
              name: "Project Icebreaker",
              status: "Research",
              statusColor: "amber",
              participants: "Sveriges Riksbank, Norges Bank, Bank of Israel",
              tech: "Hub-and-spoke FX routing",
              desc: "Retail cross-border CBDC payments using a hub model to route FX conversions. Explored how domestic CBDCs from three countries could interoperate without a shared platform.",
            },
            {
              name: "Project Agorá",
              status: "Active 2024",
              statusColor: "emerald",
              participants: "BIS + 7 major central banks",
              tech: "Tokenized commercial bank deposits",
              desc: "Explores combining tokenized central bank reserves with tokenized commercial bank deposits on programmable platform. Largest cross-border tokenization experiment to date.",
            },
            {
              name: "Project Nexus",
              status: "Active",
              statusColor: "blue",
              participants: "BIS, India (UPI), Malaysia, Singapore, Thailand",
              tech: "API gateway interconnection",
              desc: "Connects domestic instant payment systems (TIPS, PayNow, PromptPay, UPI) rather than building new CBDC rails. Lower implementation barrier via standardized API scheme.",
            },
          ].map((proj) => (
            <div key={proj.name} className="rounded-lg border border-white/10 bg-white/3 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-zinc-100">{proj.name}</span>
                <Badge className={cn("text-xs", proj.statusColor === "emerald" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : proj.statusColor === "blue" ? "bg-primary/20 text-primary border-border" : "bg-amber-500/20 text-amber-300 border-amber-500/30")}>
                  {proj.status}
                </Badge>
              </div>
              <div className="text-xs text-zinc-500 mb-1">
                <span className="text-zinc-400">Participants: </span>{proj.participants}
              </div>
              <div className="text-xs text-zinc-500 mb-2">
                <span className="text-zinc-400">Tech: </span>{proj.tech}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{proj.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Correspondent banking replacement */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle>
          <RefreshCw className="w-3.5 h-3.5" />
          Correspondent Banking Replacement — Payment Journey
        </SectionTitle>
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" /> Traditional Path (USD cross-border)
            </h4>
            <div className="flex items-center gap-1 flex-wrap">
              {[
                "Sender Bank",
                "→",
                "Domestic Correspondent",
                "→",
                "US Correspondent",
                "→",
                "Foreign Correspondent",
                "→",
                "Recipient Bank",
              ].map((node, i) => (
                <span
                  key={i}
                  className={cn(
                    "text-xs px-2 py-1 rounded",
                    node === "→"
                      ? "text-zinc-500"
                      : "border border-white/10 bg-white/5 text-zinc-300"
                  )}
                >
                  {node}
                </span>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-1.5">4 banks, 3 FX conversions, T+2 days, 1–6% fees</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3" /> CBDC Path (mBridge model)
            </h4>
            <div className="flex items-center gap-1 flex-wrap">
              {[
                "Sender Wallet",
                "→",
                "mBridge Platform",
                "→",
                "Atomic FX Swap",
                "→",
                "Recipient Wallet",
              ].map((node, i) => (
                <span
                  key={i}
                  className={cn(
                    "text-xs px-2 py-1 rounded",
                    node === "→"
                      ? "text-zinc-500"
                      : "border border-emerald-500/30 bg-emerald-500/5 text-emerald-200"
                  )}
                >
                  {node}
                </span>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-1.5">1 platform, 1 atomic FX swap, T+0 seconds, ~0.1% fee</p>
          </div>
        </div>
      </div>

      {/* FX Settlement explainer */}
      <InfoBox variant="blue">
        <span className="font-semibold">T+0 FX Settlement: </span>
        Current FX settlement occurs at T+2 via CLS (Continuous Linked Settlement), creating a 2-day FX principal risk of $6.6 trillion daily. CBDC-based atomic PvP (Payment-vs-Payment) eliminates FX settlement risk entirely — each leg of the trade executes simultaneously or not at all. For emerging market currencies outside CLS, this is transformative.
      </InfoBox>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Page Shell
// ══════════════════════════════════════════════════════════════════════════════

export default function CBDCPage() {
  // consume the PRNG to generate some deterministic noise (used for subtle visual variety)
  const _noise = useMemo(() => Array.from({ length: 20 }, () => rand()), []);
  void _noise;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Central Bank Digital Currencies</h1>
              <p className="text-sm text-zinc-400">CBDC design, global adoption, monetary policy &amp; cross-border payments</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {["134 Countries Active", "11 Live CBDCs", "mBridge MVP 2024", "T+0 Settlement"].map((tag) => (
              <Badge key={tag} className="bg-white/5 text-zinc-300 border-white/10 text-xs">{tag}</Badge>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="fundamentals">
          <TabsList className="bg-white/5 border border-white/10 mb-6 h-auto flex-wrap gap-1 p-1">
            <TabsTrigger value="fundamentals" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 text-zinc-400 text-xs sm:text-sm">
              CBDC Fundamentals
            </TabsTrigger>
            <TabsTrigger value="global" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 text-zinc-400 text-xs sm:text-sm">
              Global Tracker
            </TabsTrigger>
            <TabsTrigger value="monetary" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 text-zinc-400 text-xs sm:text-sm">
              Monetary Policy
            </TabsTrigger>
            <TabsTrigger value="crossborder" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 text-zinc-400 text-xs sm:text-sm">
              Cross-Border Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fundamentals" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <FundamentalsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="global" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <GlobalTrackerTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="monetary" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <MonetaryPolicyTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="crossborder" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <CrossBorderTab />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
