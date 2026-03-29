"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Server,
  Cpu,
  Key,
  GitBranch,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Globe,
  FileText,
  Building2,
  Activity,
  TrendingDown,
  Clock,
  Database,
  Layers,
  RefreshCw,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 910;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate random values for determinism
const _r = Array.from({ length: 60 }, () => rand());

// ── Shared UI Components ───────────────────────────────────────────────────────

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
      : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-foreground/5 p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
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
  variant?: "blue" | "amber" | "emerald" | "rose";
}) {
  const colors = {
    blue: "bg-primary/10 border-border text-primary",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
    rose: "bg-rose-500/10 border-rose-500/30 text-rose-200",
  };
  return (
    <div className={cn("rounded-lg border p-3 text-xs text-muted-foreground leading-relaxed", colors[variant])}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Custody Architecture
// ══════════════════════════════════════════════════════════════════════════════

function WalletHierarchySVG() {
  const tiers = [
    {
      label: "Hot Wallet",
      pct: 5,
      color: "#f87171",
      borderColor: "#ef4444",
      icon: "H",
      desc: "Online, instant access",
      sub: "API-connected, exchange operational",
    },
    {
      label: "Warm Wallet",
      pct: 15,
      color: "#fb923c",
      borderColor: "#f97316",
      icon: "W",
      desc: "Semi-offline, HSM protected",
      sub: "Settlement, periodic transfers",
    },
    {
      label: "Cold Storage",
      pct: 80,
      color: "#34d399",
      borderColor: "#10b981",
      icon: "C",
      desc: "Air-gapped, offline",
      sub: "Long-term institutional reserve",
    },
  ];

  const svgW = 520;
  const svgH = 240;
  const barW = 160;
  const barX = 30;
  const maxH = 180;
  const barSpacing = 40;

  return (
    <div className="rounded-md border border-border bg-foreground/5 p-4">
      <SectionTitle>
        <Layers size={14} /> Hot / Warm / Cold Wallet Hierarchy
      </SectionTitle>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 220 }}>
        {tiers.map((tier, i) => {
          const barH = (tier.pct / 100) * maxH;
          const x = barX + i * (barW + barSpacing);
          const y = svgH - barH - 30;
          return (
            <g key={tier.label}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={6}
                fill={tier.color}
                fillOpacity={0.2}
                stroke={tier.borderColor}
                strokeWidth={1.5}
              />
              {/* Percentage label */}
              <text
                x={x + barW / 2}
                y={y - 8}
                textAnchor="middle"
                fill={tier.color}
                fontSize={14}
                fontWeight="bold"
              >
                {tier.pct}%
              </text>
              {/* Icon */}
              <circle cx={x + barW / 2} cy={y + 24} r={16} fill={tier.color} fillOpacity={0.3} stroke={tier.borderColor} strokeWidth={1} />
              <text x={x + barW / 2} y={y + 29} textAnchor="middle" fill={tier.color} fontSize={13} fontWeight="bold">
                {tier.icon}
              </text>
              {/* Label */}
              <text x={x + barW / 2} y={svgH - 14} textAnchor="middle" fill="#e4e4e7" fontSize={11} fontWeight="600">
                {tier.label}
              </text>
              {/* Desc */}
              <text x={x + barW / 2} y={svgH - 2} textAnchor="middle" fill="#71717a" fontSize={9}>
                {tier.desc}
              </text>
            </g>
          );
        })}
        {/* Arrow annotations */}
        <defs>
          <marker id="arrowR" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#6366f1" />
          </marker>
        </defs>
        <line x1="412" y1="110" x2="430" y2="110" stroke="#6366f1" strokeWidth={1.5} markerEnd="url(#arrowR)" />
        <text x="433" y="107" fill="#818cf8" fontSize={9}>Risk ↑</text>
        <text x="433" y="117" fill="#6ee7b7" fontSize={9}>Yield ↓</text>
        <line x1="412" y1="140" x2="430" y2="140" stroke="#34d399" strokeWidth={1.5} markerEnd="url(#arrowR)" />
        <text x="433" y="137" fill="#34d399" fontSize={9}>Security ↑</text>
        <text x="433" y="147" fill="#71717a" fontSize={9}>Liquidity ↓</text>
      </svg>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {tiers.map((t) => (
          <div key={t.label} className="rounded-lg border border-border bg-foreground/5 p-2 text-center">
            <p className="text-xs text-muted-foreground font-semibold">{t.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionApprovalSVG() {
  const steps = [
    { label: "Request", color: "#60a5fa", icon: "R" },
    { label: "Multi-sig Approval", color: "#a78bfa", icon: "A" },
    { label: "HSM Signing", color: "#fb923c", icon: "S" },
    { label: "Broadcast", color: "#34d399", icon: "B" },
  ];

  const svgW = 500;
  const svgH = 100;
  const stepW = 100;
  const gap = 30;
  const startX = 20;

  return (
    <div className="rounded-md border border-border bg-foreground/5 p-4">
      <SectionTitle>
        <Activity size={14} /> Transaction Approval Workflow
      </SectionTitle>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 100 }}>
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#52525b" />
          </marker>
        </defs>
        {steps.map((step, i) => {
          const x = startX + i * (stepW + gap);
          const cx = x + stepW / 2;
          return (
            <g key={step.label}>
              <rect x={x} y={20} width={stepW} height={44} rx={8} fill={step.color} fillOpacity={0.15} stroke={step.color} strokeWidth={1.2} />
              <circle cx={cx} cy={35} r={10} fill={step.color} fillOpacity={0.3} stroke={step.color} strokeWidth={1} />
              <text x={cx} y={39} textAnchor="middle" fill={step.color} fontSize={10} fontWeight="bold">{step.icon}</text>
              <text x={cx} y={56} textAnchor="middle" fill="#d4d4d8" fontSize={9} fontWeight="500">{step.label}</text>
              {i < steps.length - 1 && (
                <line
                  x1={x + stepW + 2}
                  y1={42}
                  x2={x + stepW + gap - 2}
                  y2={42}
                  stroke="#52525b"
                  strokeWidth={1.5}
                  markerEnd="url(#arrow)"
                />
              )}
            </g>
          );
        })}
        <text x="250" y="92" textAnchor="middle" fill="#71717a" fontSize={9}>
          Minimum 2-of-3 approvers required • HSM never exposes private keys • Immutable audit log
        </text>
      </svg>
    </div>
  );
}

interface ComparisonRow {
  feature: string;
  mpc: string;
  multisig: string;
  mpcGood: boolean;
  multisigGood: boolean;
}

const MPC_MULTISIG_ROWS: ComparisonRow[] = [
  { feature: "Key Fragmentation", mpc: "Secret shares, no full key", multisig: "Multiple full keys", mpcGood: true, multisigGood: false },
  { feature: "On-chain Footprint", mpc: "Single signature", multisig: "Multiple signers visible", mpcGood: true, multisigGood: false },
  { feature: "Protocol Support", mpc: "Any chain", multisig: "Chain-dependent", mpcGood: true, multisigGood: false },
  { feature: "Smart Contract Risk", mpc: "None", multisig: "Contract bugs possible", mpcGood: true, multisigGood: false },
  { feature: "Setup Complexity", mpc: "Higher (MPC ceremony)", multisig: "Lower", mpcGood: false, multisigGood: true },
  { feature: "Auditability", mpc: "Complex to audit", multisig: "Transparent on-chain", mpcGood: false, multisigGood: true },
  { feature: "Recovery", mpc: "Threshold share reconstruction", multisig: "Any m-of-n keys", mpcGood: false, multisigGood: true },
  { feature: "Gas Cost", mpc: "Standard (single sig)", multisig: "Higher (multi-sig tx)", mpcGood: true, multisigGood: false },
];

function Tab1CustodyArchitecture() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const keyMethods = [
    {
      id: "hsm",
      label: "Hardware Security Module (HSM)",
      icon: <Server size={14} />,
      color: "text-primary",
      desc: "FIPS 140-2 Level 3+ certified tamper-resistant hardware that generates, stores, and uses cryptographic keys. Keys never leave the HSM in plaintext.",
      details: [
        "FIPS 140-2 Level 3 or Level 4 certification",
        "Tamper-evident and tamper-resistant enclosure",
        "Secure key wrapping for export/backup",
        "Remote attestation for cloud HSMs (AWS CloudHSM, Azure Dedicated HSM)",
        "Common vendors: Thales Luna, Utimaco, Entrust",
      ],
    },
    {
      id: "hw",
      label: "Hardware Wallets",
      icon: <Cpu size={14} />,
      color: "text-primary",
      desc: "Dedicated signing devices (Ledger, Trezor, Coldcard) that isolate private keys from internet-connected systems. Used for warm/cold storage at smaller scale.",
      details: [
        "PIN/passphrase protection",
        "BIP39 mnemonic seed phrases (12/24 words)",
        "Secure element chips prevent key extraction",
        "Air-gap models (Coldcard MK4) sign via PSBT files/QR codes",
        "Institutional: Ledger Enterprise, Trezor for Business",
      ],
    },
    {
      id: "mpc",
      label: "Multi-Party Computation (MPC)",
      icon: <GitBranch size={14} />,
      color: "text-muted-foreground",
      desc: "Cryptographic protocol where a private key is split into shares held by separate parties. Signatures are computed collaboratively without any party ever reconstructing the full key.",
      details: [
        "Threshold Signature Scheme (TSS): t-of-n participants",
        "No single point of compromise or failure",
        "Supports all key types (ECDSA, EdDSA, Schnorr)",
        "Used by Fireblocks, Curv (acquired by PayPal), ZenGo",
        "Key rotation without blockchain transaction",
      ],
    },
  ];

  const airGapMeasures = [
    "Physical separation from internet-connected networks",
    "Faraday cage rooms block electromagnetic signals",
    "Data transfer via one-way optical diodes or QR codes",
    "Transaction signing via PSBT (Partially Signed Bitcoin Transactions)",
    "Dedicated air-gapped signing workstations",
    "Two-person integrity (TPI) rule for all operations",
  ];

  const keyDerivationSteps = [
    { step: "1", label: "Entropy Generation", desc: "256-bit random seed from TRNG/HRNG" },
    { step: "2", label: "Master Key (BIP32)", desc: "HMAC-SHA512 derives master private key + chain code" },
    { step: "3", label: "Account Derivation", desc: "BIP44 path: m/purpose'/coin'/account'/change/index" },
    { step: "4", label: "Address Generation", desc: "Public key → hash → network-prefixed address" },
    { step: "5", label: "Key Backup", desc: "Shamir Secret Sharing or hardware backup devices" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Industry Cold Storage %" value="80–95%" sub="Typical institutional target" highlight="pos" icon={<Lock size={13} />} />
        <StatCard label="Multi-sig Threshold" value="2-of-3" sub="Minimum best practice" highlight="neutral" icon={<Key size={13} />} />
        <StatCard label="HSM Certification" value="FIPS 140-2" sub="Level 3+ required" highlight="neutral" icon={<ShieldCheck size={13} />} />
        <StatCard label="Key Ceremony" value="≥5 Witnesses" sub="For genesis key creation" highlight="warn" icon={<Eye size={13} />} />
      </div>

      {/* Wallet Hierarchy SVG */}
      <WalletHierarchySVG />

      {/* Key Management Methods */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Key size={14} /> Key Management Methods
        </SectionTitle>
        <div className="space-y-2">
          {keyMethods.map((m) => (
            <div key={m.id} className="rounded-lg border border-border bg-foreground/5 overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-3 text-left"
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              >
                <span className={m.color}>{m.icon}</span>
                <span className="text-sm font-medium text-foreground flex-1">{m.label}</span>
                <span className="text-muted-foreground text-xs mr-2">{m.desc.slice(0, 60)}…</span>
                {expanded === m.id ? (
                  <ArrowRight size={13} className="text-muted-foreground rotate-90" />
                ) : (
                  <ArrowRight size={13} className="text-muted-foreground" />
                )}
              </button>
              <AnimatePresence>
                {expanded === m.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground mb-2">{m.desc}</p>
                      <ul className="space-y-1">
                        {m.details.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle size={11} className="text-emerald-400 mt-0.5 shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* MPC vs Multi-sig comparison */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <GitBranch size={14} /> MPC vs Multi-Sig Comparison
        </SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground font-medium py-2 pr-4 w-40">Feature</th>
                <th className="text-center text-muted-foreground font-medium py-2 px-3">MPC / TSS</th>
                <th className="text-center text-primary font-medium py-2 px-3">Multi-Sig</th>
              </tr>
            </thead>
            <tbody>
              {MPC_MULTISIG_ROWS.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="text-muted-foreground py-2 pr-4 font-medium">{row.feature}</td>
                  <td className="text-center py-2 px-3">
                    <div className="flex items-center justify-center gap-1">
                      {row.mpcGood ? (
                        <CheckCircle size={11} className="text-emerald-400" />
                      ) : (
                        <XCircle size={11} className="text-rose-400" />
                      )}
                      <span className={row.mpcGood ? "text-emerald-300" : "text-rose-300"}>{row.mpc}</span>
                    </div>
                  </td>
                  <td className="text-center py-2 px-3">
                    <div className="flex items-center justify-center gap-1">
                      {row.multisigGood ? (
                        <CheckCircle size={11} className="text-emerald-400" />
                      ) : (
                        <XCircle size={11} className="text-rose-400" />
                      )}
                      <span className={row.multisigGood ? "text-emerald-300" : "text-rose-300"}>{row.multisig}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <InfoBox variant="blue" >
          <strong>Industry trend:</strong> MPC/TSS is increasingly preferred by institutional custodians (Fireblocks, Anchorage) for its blockchain-agnostic design and single on-chain footprint, reducing both operational complexity and privacy exposure.
        </InfoBox>
      </div>

      {/* Transaction Approval Workflow */}
      <TransactionApprovalSVG />

      {/* Air-Gap Security */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <EyeOff size={14} /> Air-Gap Security Measures
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {airGapMeasures.map((m, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-foreground/5 border border-border p-2.5">
              <ShieldCheck size={13} className="text-emerald-400 mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground">{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Derivation */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Key size={14} /> Address Generation & Key Derivation (BIP32/44/39)
        </SectionTitle>
        <div className="flex flex-wrap gap-2 items-center">
          {keyDerivationSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-center min-w-[100px]">
                <div className="text-indigo-400 font-bold text-xs mb-0.5">Step {step.step}</div>
                <div className="text-foreground text-xs font-medium">{step.label}</div>
                <div className="text-muted-foreground text-xs mt-0.5 leading-tight">{step.desc}</div>
              </div>
              {i < keyDerivationSteps.length - 1 && (
                <ArrowRight size={14} className="text-muted-foreground shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Institutional Solutions
// ══════════════════════════════════════════════════════════════════════════════

interface Custodian {
  name: string;
  founded: number;
  aum: string;
  technology: string;
  regulatory: string;
  staking: boolean;
  defi: boolean;
  primeBrokerage: boolean;
  insurance: string;
  notable: string;
}

const CUSTODIANS: Custodian[] = [
  {
    name: "Coinbase Prime",
    founded: 2012,
    aum: "$200B+",
    technology: "MPC + Cold Storage",
    regulatory: "NYDFS, SEC-registered",
    staking: true,
    defi: false,
    primeBrokerage: true,
    insurance: "$320M crime policy",
    notable: "Custodian for 8 spot Bitcoin ETFs",
  },
  {
    name: "BitGo",
    founded: 2013,
    aum: "$60B+",
    technology: "Multi-sig (2-of-3)",
    regulatory: "SD Trust Co., NYDFS",
    staking: true,
    defi: true,
    primeBrokerage: true,
    insurance: "$250M cold storage",
    notable: "First qualified custodian for digital assets",
  },
  {
    name: "Anchorage Digital",
    founded: 2017,
    aum: "$50B+",
    technology: "Biometric MPC",
    regulatory: "OCC Federal Bank Charter",
    staking: true,
    defi: true,
    primeBrokerage: false,
    insurance: "$100M+ crime/specie",
    notable: "Only federally chartered crypto bank in US",
  },
  {
    name: "Fireblocks",
    founded: 2018,
    aum: "$4T+ transferred",
    technology: "MPC-CMP (Threshold sig)",
    regulatory: "SOC 2 Type II, ISO 27001",
    staking: true,
    defi: true,
    primeBrokerage: false,
    insurance: "Per-client coverage",
    notable: "Network of 1,800+ institutions",
  },
  {
    name: "Copper",
    founded: 2018,
    aum: "$30B+",
    technology: "MPC + ClearLoop",
    regulatory: "FCA registered (UK)",
    staking: true,
    defi: false,
    primeBrokerage: true,
    insurance: "$500M+ specie policy",
    notable: "Off-exchange settlement via ClearLoop",
  },
];

interface PrimeBrokerService {
  service: string;
  desc: string;
  icon: React.ReactNode;
}

const PRIME_SERVICES: PrimeBrokerService[] = [
  { service: "Margin Lending", desc: "Crypto-collateralized loans at 50–70% LTV. BTC/ETH accepted as collateral for fiat borrowing.", icon: <Database size={13} /> },
  { service: "Securities Lending", desc: "Lend digital assets to earn yield. Borrowers pay 0.5–5% annualized depending on demand.", icon: <RefreshCw size={13} /> },
  { service: "Settlement Netting", desc: "Multilateral netting reduces settlement flows by 80–90%. Tri-party via custodian.", icon: <Layers size={13} /> },
  { service: "Cross-Margining", desc: "Unified margin across spot, futures, and options positions reduces capital requirements.", icon: <Zap size={13} /> },
  { service: "OTC Execution", desc: "Block trading with price improvement vs. exchange. RFQ models with market makers.", icon: <Activity size={13} /> },
  { service: "Portfolio Financing", desc: "NAV financing for crypto funds. Credit facilities against diversified portfolio value.", icon: <Building2 size={13} /> },
];

function Tab2InstitutionalSolutions() {
  const [selectedCustodian, setSelectedCustodian] = useState<Custodian | null>(null);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Custodians Globally" value="50+" sub="Licensed institutional custodians" highlight="neutral" icon={<Building2 size={13} />} />
        <StatCard label="Coinbase Prime AUM" value="$200B+" sub="Largest crypto custodian" highlight="pos" icon={<ShieldCheck size={13} />} />
        <StatCard label="Fireblocks Network" value="1,800+" sub="Institutional clients" highlight="pos" icon={<Globe size={13} />} />
        <StatCard label="Insurance Coverage" value="$500M+" sub="Copper specie policy (max)" highlight="neutral" icon={<Shield size={13} />} />
      </div>

      {/* Custodians table */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Building2 size={14} /> Major Institutional Custodians
        </SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground font-medium py-2 pr-3">Custodian</th>
                <th className="text-left text-muted-foreground font-medium py-2 px-3">AUM</th>
                <th className="text-left text-muted-foreground font-medium py-2 px-3">Technology</th>
                <th className="text-left text-muted-foreground font-medium py-2 px-3">Regulatory</th>
                <th className="text-center text-muted-foreground font-medium py-2 px-2">Staking</th>
                <th className="text-center text-muted-foreground font-medium py-2 px-2">DeFi</th>
                <th className="text-center text-muted-foreground font-medium py-2 px-2">PB</th>
              </tr>
            </thead>
            <tbody>
              {CUSTODIANS.map((c, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedCustodian(selectedCustodian?.name === c.name ? null : c)}
                >
                  <td className="py-2 pr-3 font-semibold text-foreground">{c.name}</td>
                  <td className="py-2 px-3 text-emerald-400 font-medium">{c.aum}</td>
                  <td className="py-2 px-3 text-muted-foreground">{c.technology}</td>
                  <td className="py-2 px-3 text-muted-foreground">{c.regulatory}</td>
                  <td className="py-2 px-2 text-center">
                    {c.staking ? <CheckCircle size={12} className="text-emerald-400 mx-auto" /> : <XCircle size={12} className="text-rose-400 mx-auto" />}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {c.defi ? <CheckCircle size={12} className="text-emerald-400 mx-auto" /> : <XCircle size={12} className="text-rose-400 mx-auto" />}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {c.primeBrokerage ? <CheckCircle size={12} className="text-emerald-400 mx-auto" /> : <XCircle size={12} className="text-rose-400 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AnimatePresence>
          {selectedCustodian && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 overflow-hidden"
            >
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3">
                <p className="text-indigo-300 font-medium text-xs mb-1">{selectedCustodian.name} — Notable Detail</p>
                <p className="text-indigo-200 text-xs">{selectedCustodian.notable}</p>
                <p className="text-muted-foreground text-xs mt-1">Insurance: {selectedCustodian.insurance} | Founded: {selectedCustodian.founded}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Segregated vs Omnibus */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Layers size={14} /> Segregated vs Omnibus Account Structures
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="text-emerald-400 font-medium text-xs mb-2 flex items-center gap-1.5">
              <ShieldCheck size={12} /> Segregated Accounts
            </p>
            <ul className="space-y-1.5">
              {[
                "Dedicated blockchain addresses per client",
                "Assets clearly identifiable in bankruptcy",
                "Full proof-of-reserves per client possible",
                "Higher operational cost (separate key management)",
                "Preferred by regulated funds and RIAs",
                "Coinbase Prime default for institutional clients",
              ].map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <CheckCircle size={10} className="text-emerald-400 mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-amber-400 font-medium text-xs mb-2 flex items-center gap-1.5">
              <Database size={12} /> Omnibus Accounts
            </p>
            <ul className="space-y-1.5">
              {[
                "Pooled assets in shared wallets",
                "Lower operational cost and gas fees",
                "Custody tracked via internal ledger only",
                "Higher counterparty/commingling risk",
                "Bankruptcy exposure (FTX precedent)",
                "Some exchanges use for operational wallets",
              ].map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <AlertTriangle size={10} className="text-amber-400 mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Staking from Custody + DeFi Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border border-border bg-foreground/5 p-4">
          <SectionTitle>
            <Zap size={14} /> Staking from Custody
          </SectionTitle>
          <p className="text-xs text-muted-foreground mb-3">Custodians allow institutional staking without losing custody control. Staked assets remain in segregated custody with slashing protection.</p>
          <div className="space-y-2">
            {[
              { label: "ETH Staking Yield", value: "3.5–4.2%", note: "Via Liquid Staking Tokens (LSTs)" },
              { label: "SOL Staking Yield", value: "6–8%", note: "Delegated to validator network" },
              { label: "Cosmos (ATOM)", value: "14–19%", note: "High inflation offset" },
              { label: "Slashing Insurance", value: "Available", note: "Unslashed, Nexus Mutual" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-1.5">
                <span className="text-muted-foreground">{row.label}</span>
                <div className="text-right">
                  <span className="text-emerald-400 font-medium">{row.value}</span>
                  <span className="text-muted-foreground ml-2">{row.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-foreground/5 p-4">
          <SectionTitle>
            <Globe size={14} /> DeFi Integration via Custody
          </SectionTitle>
          <p className="text-xs text-muted-foreground mb-3">Select custodians provide policy-controlled DeFi access, maintaining compliance while allowing protocol interaction.</p>
          <div className="space-y-2">
            {[
              { label: "Fireblocks DeFi", desc: "Smart contract risk scoring, transaction simulation before execution" },
              { label: "Anchorage DeFi", desc: "On-chain governance voting, protocol whitelisting" },
              { label: "BitGo DeFi", desc: "Aave/Compound/Uniswap via custodied EOA wallets" },
              { label: "Compliance Layer", desc: "Chainalysis/Elliptic checks on all DeFi interactions" },
            ].map((row, i) => (
              <div key={i} className="rounded-md bg-foreground/5 border border-border p-2">
                <p className="text-xs text-muted-foreground font-medium">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prime Brokerage */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Activity size={14} /> Prime Brokerage Services for Crypto
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRIME_SERVICES.map((svc, i) => (
            <div key={i} className="rounded-lg border border-border bg-foreground/5 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-indigo-400">{svc.icon}</span>
                <p className="text-xs font-medium text-foreground">{svc.service}</p>
              </div>
              <p className="text-xs text-muted-foreground">{svc.desc}</p>
            </div>
          ))}
        </div>
        <InfoBox variant="amber">
          <strong>Tri-party settlement:</strong> Emerging model where custodian acts as neutral third party between two counterparties. Assets are held in custody until both sides confirm, eliminating settlement risk. Copper ClearLoop pioneered this model allowing off-exchange trading with exchange-level liquidity.
        </InfoBox>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Regulatory Framework
// ══════════════════════════════════════════════════════════════════════════════

interface RegEvent {
  year: number;
  event: string;
  body: string;
  impact: "positive" | "negative" | "neutral";
  detail: string;
}

const REG_TIMELINE: RegEvent[] = [
  {
    year: 2020,
    event: "OCC Interpretive Letter #1170",
    body: "OCC",
    impact: "positive",
    detail: "National banks explicitly authorized to hold crypto assets as custodians on behalf of customers. Landmark opening for bank custody of digital assets.",
  },
  {
    year: 2021,
    event: "OCC Letter #1179 (SPDIs)",
    body: "OCC",
    impact: "positive",
    detail: "Wyoming Special Purpose Depository Institutions (SPDIs) such as Kraken Bank could receive OCC charters, creating federal pathway for crypto-native banks.",
  },
  {
    year: 2021,
    event: "Anchorage OCC Federal Charter",
    body: "OCC",
    impact: "positive",
    detail: "First federally chartered crypto bank. Sets precedent for crypto custodians operating under full banking regulation rather than state money transmitter licenses.",
  },
  {
    year: 2022,
    event: "SAB 121 — SEC Staff Bulletin",
    body: "SEC",
    impact: "negative",
    detail: "Required banks to record crypto assets held in custody as liabilities on their own balance sheet, effectively making bank custody economically unviable. Controversial; banks lobbied heavily.",
  },
  {
    year: 2022,
    event: "FTX Collapse & Contagion",
    body: "Market Event",
    impact: "negative",
    detail: "Exposed commingling of customer and exchange funds. Accelerated regulatory focus on segregation requirements and qualified custodian rules.",
  },
  {
    year: 2023,
    event: "SEC Proposed Custody Rule (RIA)",
    body: "SEC",
    impact: "negative",
    detail: "Proposed expanding qualified custodian requirement for investment advisers to cover crypto. Only state-chartered trust companies and federally chartered banks would qualify—excluding most crypto-native custodians.",
  },
  {
    year: 2024,
    event: "Spot Bitcoin ETF Approval",
    body: "SEC",
    impact: "positive",
    detail: "11 spot Bitcoin ETFs approved (January 2024). Coinbase Custody named as custodian for 8 of 11 ETFs. Established ETF custody as a regulated service category.",
  },
  {
    year: 2024,
    event: "SAB 121 Rescinded",
    body: "SEC",
    impact: "positive",
    detail: "SEC under new administration rescinded SAB 121, removing balance sheet treatment barrier. Major banks resumed custody expansion plans.",
  },
];

interface StateRegulation {
  state: string;
  regime: string;
  requirement: string;
  status: "active" | "pending" | "restrictive";
}

const STATE_REGULATIONS: StateRegulation[] = [
  { state: "New York", regime: "BitLicense (NYDFS)", requirement: "$5M surety bond, AML/BSA, quarterly NYDFS exams, cybersecurity rule 23 NYCRR 500", status: "active" },
  { state: "Wyoming", regime: "SPDI Charter", requirement: "100% reserves, no lending of customer assets, custody-only model", status: "active" },
  { state: "South Dakota", regime: "Digital Asset Custodian", requirement: "State trust company charter, $1M minimum capital, annual audits", status: "active" },
  { state: "California", regime: "DFPI License", requirement: "Money Transmission Act, $500K bond, pending digital asset-specific rules", status: "pending" },
  { state: "Texas", regime: "TDOB License", requirement: "Money services business license, virtual currency custody guidelines", status: "active" },
  { state: "Massachusetts", regime: "DMLB Pending", requirement: "Moratorium on certain crypto services; hostile regulatory environment historically", status: "restrictive" },
];

function Tab3RegulatoryFramework() {
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="OCC Charter (First)" value="2021" sub="Anchorage Digital federal bank" highlight="pos" icon={<Building2 size={13} />} />
        <StatCard label="SAB 121 Rescinded" value="2024" sub="Major regulatory relief" highlight="pos" icon={<CheckCircle size={13} />} />
        <StatCard label="Spot BTC ETF Custodians" value="11 ETFs" sub="Coinbase holds 8 of 11" highlight="neutral" icon={<Shield size={13} />} />
        <StatCard label="NYDFS BitLicense" value="Since 2015" sub="Strictest US state regime" highlight="warn" icon={<AlertTriangle size={13} />} />
      </div>

      {/* Regulatory Timeline */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Clock size={14} /> US Regulatory Evolution Timeline
        </SectionTitle>
        <div className="space-y-2">
          {REG_TIMELINE.map((evt, i) => (
            <div
              key={i}
              className={cn(
                "rounded-lg border p-3 cursor-pointer transition-colors",
                evt.impact === "positive"
                  ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
                  : evt.impact === "negative"
                  ? "border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10"
                  : "border-border bg-foreground/5 hover:bg-muted/40"
              )}
              onClick={() => setExpandedEvent(expandedEvent === i ? null : i)}
            >
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    "text-xs text-muted-foreground shrink-0",
                    evt.impact === "positive"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : evt.impact === "negative"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {evt.year}
                </Badge>
                <div className="flex-1">
                  <span className="text-xs font-medium text-foreground">{evt.event}</span>
                  <span className="text-xs text-muted-foreground ml-2">— {evt.body}</span>
                </div>
                {evt.impact === "positive" ? (
                  <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                ) : evt.impact === "negative" ? (
                  <XCircle size={13} className="text-rose-400 shrink-0" />
                ) : null}
              </div>
              <AnimatePresence>
                {expandedEvent === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-muted-foreground mt-2 overflow-hidden"
                  >
                    {evt.detail}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* State-by-State */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Globe size={14} /> State-by-State Regulatory Landscape
        </SectionTitle>
        <div className="space-y-2">
          {STATE_REGULATIONS.map((reg, i) => (
            <div key={i} className="rounded-lg border border-border bg-foreground/5 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">{reg.state}</span>
                    <Badge className={cn(
                      "text-xs text-muted-foreground",
                      reg.status === "active" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : reg.status === "pending" ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    )}>
                      {reg.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{reg.regime}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{reg.requirement}</p>
            </div>
          ))}
        </div>
      </div>

      {/* EU MiCA */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Globe size={14} /> EU MiCA — Crypto Asset Service Provider (CASP) Authorization
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-3">Markets in Crypto-Assets (MiCA) regulation fully effective December 2024. Custody providers must obtain CASP authorization from national competent authority.</p>
            <div className="space-y-2">
              {[
                { label: "Minimum Capital", value: "€125,000 (custody-only CASP)" },
                { label: "Segregation", value: "Mandatory client asset segregation" },
                { label: "Passporting", value: "EU-wide access with single CASP license" },
                { label: "Liability", value: "Presumed liable for loss of client assets" },
                { label: "Insurance Required", value: "Professional indemnity insurance" },
                { label: "Annual Report", value: "Audited financial statements required" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between text-xs text-muted-foreground border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-foreground font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <InfoBox variant="blue">
              <strong>CASP authorization process:</strong> Application to national authority (BaFin in Germany, AMF in France). 3–6 month review. Passporting notification to other EU member states within 10 business days.
            </InfoBox>
            <InfoBox variant="emerald">
              <strong>MiCA vs US approach:</strong> MiCA provides a harmonized EU-wide framework with clear rules. US remains fragmented across SEC/OCC/CFTC/FinCEN/state regulators, creating compliance complexity for global custodians.
            </InfoBox>
            <InfoBox variant="amber">
              <strong>SEC spot ETF custody:</strong> 8 of 11 spot Bitcoin ETFs use Coinbase Custody Trust Company as custodian. ETF custodians must be qualified custodians under Investment Advisers Act. Self-custody by ETF issuer not currently permitted.
            </InfoBox>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Security & Insurance
// ══════════════════════════════════════════════════════════════════════════════

interface HackEvent {
  year: number;
  exchange: string;
  loss: number; // in millions USD
  method: string;
  type: "exchange" | "protocol" | "bridge";
}

const HACK_EVENTS: HackEvent[] = [
  { year: 2014, exchange: "Mt. Gox", loss: 480, method: "Hot wallet key compromise", type: "exchange" },
  { year: 2016, exchange: "Bitfinex", loss: 72, method: "Multi-sig exploit", type: "exchange" },
  { year: 2018, exchange: "Coincheck", loss: 534, method: "Hot wallet theft (NEM)", type: "exchange" },
  { year: 2019, exchange: "Binance", loss: 40, method: "API key + 2FA exploit", type: "exchange" },
  { year: 2021, exchange: "Poly Network", loss: 611, method: "Smart contract vulnerability", type: "bridge" },
  { year: 2022, exchange: "Ronin (Axie)", loss: 625, method: "Validator key compromise (5-of-9)", type: "bridge" },
  { year: 2022, exchange: "FTX", loss: 600, method: "Insider theft / commingling", type: "exchange" },
  { year: 2022, exchange: "Wormhole", loss: 320, method: "Bridge smart contract bug", type: "bridge" },
  { year: 2023, exchange: "Euler Finance", loss: 197, method: "Flash loan + protocol logic", type: "protocol" },
  { year: 2024, exchange: "DMM Bitcoin", loss: 305, method: "Private key compromise", type: "exchange" },
];

function HacksTimelineSVG() {
  const svgW = 560;
  const svgH = 200;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 50;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const years = HACK_EVENTS.map((e) => e.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const maxLoss = Math.max(...HACK_EVENTS.map((e) => e.loss));

  const xScale = (year: number) => padL + ((year - minYear) / (maxYear - minYear)) * plotW;
  const yScale = (loss: number) => padT + plotH - (loss / maxLoss) * plotH;

  const typeColor = (t: HackEvent["type"]) =>
    t === "exchange" ? "#f87171" : t === "bridge" ? "#fb923c" : "#a78bfa";

  const totalLoss = HACK_EVENTS.reduce((acc, e) => acc + e.loss, 0);

  return (
    <div className="rounded-md border border-border bg-foreground/5 p-4">
      <SectionTitle>
        <TrendingDown size={14} /> Historical Exchange & Protocol Hacks (2014–2024)
      </SectionTitle>
      <div className="flex gap-4 mb-3">
        {(["exchange", "bridge", "protocol"] as HackEvent["type"][]).map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: typeColor(t) }} />
            <span className="text-xs text-muted-foreground capitalize">{t}</span>
          </div>
        ))}
        <div className="ml-auto text-xs text-rose-400 font-medium">${totalLoss.toLocaleString()}M+ total losses</div>
      </div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 200 }}>
        {/* Y-axis gridlines */}
        {[0, 200, 400, 600].map((v) => (
          <g key={v}>
            <line x1={padL} y1={yScale(v)} x2={svgW - padR} y2={yScale(v)} stroke="#27272a" strokeWidth={1} />
            <text x={padL - 6} y={yScale(v) + 4} textAnchor="end" fill="#71717a" fontSize={9}>${v}M</text>
          </g>
        ))}
        {/* X-axis year labels */}
        {[2014, 2016, 2018, 2020, 2022, 2024].map((yr) => (
          <text key={yr} x={xScale(yr)} y={svgH - padB + 14} textAnchor="middle" fill="#71717a" fontSize={9}>{yr}</text>
        ))}
        {/* X-axis line */}
        <line x1={padL} y1={svgH - padB} x2={svgW - padR} y2={svgH - padB} stroke="#3f3f46" strokeWidth={1} />
        {/* Hack circles */}
        {HACK_EVENTS.map((evt, i) => {
          const cx = xScale(evt.year);
          const cy = yScale(evt.loss);
          const r = Math.max(5, Math.sqrt(evt.loss) * 0.8);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill={typeColor(evt.type)} fillOpacity={0.3} stroke={typeColor(evt.type)} strokeWidth={1.5} />
              <text x={cx} y={cy - r - 3} textAnchor="middle" fill={typeColor(evt.type)} fontSize={8} fontWeight="500">
                {evt.exchange.split(" ")[0]}
              </text>
              <text x={cx} y={cy + r + 9} textAnchor="middle" fill="#71717a" fontSize={7}>
                ${evt.loss}M
              </text>
            </g>
          );
        })}
        <text x={svgW / 2} y={svgH - 3} textAnchor="middle" fill="#52525b" fontSize={8}>
          Bubble size proportional to USD loss
        </text>
      </svg>
    </div>
  );
}

interface InsuranceCoverage {
  type: string;
  desc: string;
  example: string;
  maxCoverage: string;
  providers: string;
}

const INSURANCE_TYPES: InsuranceCoverage[] = [
  {
    type: "Crime / Specie",
    desc: "Physical theft, employee dishonesty, mysterious disappearance of crypto held offline.",
    example: "Coinbase: $320M crime policy; Copper: $500M specie",
    maxCoverage: "$500M+",
    providers: "Lloyd's of London, Munich Re, Aon",
  },
  {
    type: "Cyber Liability",
    desc: "Hacking of hot wallets, key compromise via cyber attack, ransomware-driven theft.",
    example: "Fireblocks: Per-client cyber policies",
    maxCoverage: "$100M typical",
    providers: "Coalition, Chubb, AIG, Beazley",
  },
  {
    type: "Professional Indemnity",
    desc: "Errors and omissions in custody operations. Required under EU MiCA for CASPs.",
    example: "Custodian misroutes transaction to wrong address",
    maxCoverage: "$50M typical",
    providers: "Hiscox, Markel, CNA Financial",
  },
  {
    type: "Directors & Officers",
    desc: "Leadership liability for regulatory breaches, mismanagement of custody operations.",
    example: "SEC enforcement action against custody executives",
    maxCoverage: "$25M typical",
    providers: "AIG, Chubb, XL Catlin",
  },
];

const SOC2_CONTROLS = [
  { category: "Security", controls: ["Access controls", "Encryption at rest/transit", "Network monitoring", "Vulnerability management"] },
  { category: "Availability", controls: ["Uptime SLAs (99.9%+)", "Redundant infrastructure", "DDoS protection", "Capacity planning"] },
  { category: "Confidentiality", controls: ["Data classification", "Key management procedures", "Clean desk policy", "NDA enforcement"] },
  { category: "Processing Integrity", controls: ["Transaction reconciliation", "Error detection", "Authorization workflows", "Audit logging"] },
];

function Tab4SecurityInsurance() {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Hack Losses" value="$3.8B+" sub="Tracked incidents 2014–2024" highlight="neg" icon={<ShieldAlert size={13} />} />
        <StatCard label="Largest Single Hack" value="$625M" sub="Ronin/Axie Infinity (2022)" highlight="neg" icon={<TrendingDown size={13} />} />
        <StatCard label="Max Insurance Coverage" value="$500M" sub="Copper specie policy" highlight="neutral" icon={<Shield size={13} />} />
        <StatCard label="SOC 2 Type II" value="Annual" sub="Required for institutional custody" highlight="pos" icon={<FileText size={13} />} />
      </div>

      {/* Hacks Timeline SVG */}
      <HacksTimelineSVG />

      {/* Insurance Coverage Types */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Shield size={14} /> Insurance Market for Crypto Custody
        </SectionTitle>
        <p className="text-xs text-muted-foreground mb-3">The crypto insurance market has grown from ~$1B capacity in 2020 to $6B+ in 2024, though still far below the ~$100B+ of institutional AUM in custody. Coverage gaps remain significant.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INSURANCE_TYPES.map((ins, i) => (
            <div key={i} className="rounded-lg border border-border bg-foreground/5 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">{ins.type}</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">{ins.maxCoverage}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1.5">{ins.desc}</p>
              <p className="text-xs text-muted-foreground italic mb-1">Example: {ins.example}</p>
              <p className="text-xs text-primary">Providers: {ins.providers}</p>
            </div>
          ))}
        </div>
        <InfoBox variant="amber">
          <strong>Coverage gap:</strong> Most custodians insure only 1–5% of total AUM. Coinbase Prime insures ~$320M of $200B+ AUM (0.16%). The disconnect reflects limited insurer capacity and high premium costs. Institutional clients must understand this limitation in custody arrangements.
        </InfoBox>
      </div>

      {/* SOC 2 Type II */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <FileText size={14} /> SOC 2 Type II Audits — Trust Service Criteria
        </SectionTitle>
        <p className="text-xs text-muted-foreground mb-3">SOC 2 Type II (AICPA) tests effectiveness of controls over a minimum 6-month period. Required by most institutional clients before engaging a custodian. Big 4 firms conduct audits.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SOC2_CONTROLS.map((cat, i) => (
            <div key={i} className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
              <p className="text-xs font-medium text-indigo-400 mb-2">{cat.category}</p>
              <ul className="space-y-1">
                {cat.controls.map((ctrl, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle size={10} className="text-indigo-400 mt-0.5 shrink-0" /> {ctrl}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Penetration Testing + BCP/DR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border border-border bg-foreground/5 p-4">
          <SectionTitle>
            <Cpu size={14} /> Penetration Testing Requirements
          </SectionTitle>
          <div className="space-y-2">
            {[
              { label: "Frequency", value: "Annual (minimum)", note: "Quarterly for critical systems" },
              { label: "Scope", value: "Full stack", note: "HSM, API, web, mobile, employee" },
              { label: "Red Team", value: "Adversarial simulation", note: "Social engineering included" },
              { label: "Bug Bounty", value: "Year-round program", note: "HackerOne, Immunefi platforms" },
              { label: "Remediation SLA", value: "Critical: 24–72h", note: "High: 7 days; Medium: 30 days" },
              { label: "Reports", value: "Provided to auditors", note: "Required for SOC 2 + insurance" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-1.5">
                <span className="text-muted-foreground">{row.label}</span>
                <div className="text-right">
                  <span className="text-foreground font-medium">{row.value}</span>
                  <span className="text-muted-foreground ml-1.5">{row.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-foreground/5 p-4">
          <SectionTitle>
            <RefreshCw size={14} /> Business Continuity & Disaster Recovery
          </SectionTitle>
          <div className="space-y-2">
            {[
              { label: "RTO (Recovery Time Objective)", value: "4 hours", note: "Hot wallet ops restore target" },
              { label: "RPO (Recovery Point Objective)", value: "0 data loss", note: "Blockchain immutability" },
              { label: "Geographic Redundancy", value: "3+ regions", note: "US, EU, Asia-Pacific" },
              { label: "HSM Backup", value: "N+2 redundancy", note: "Key shares distributed" },
              { label: "Failover Testing", value: "Semi-annual", note: "Full DR drill required" },
              { label: "Runbook Documentation", value: "Required", note: "All recovery procedures documented" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-1.5">
                <span className="text-muted-foreground">{row.label}</span>
                <div className="text-right">
                  <span className="text-foreground font-medium">{row.value}</span>
                  <span className="text-muted-foreground ml-1.5">{row.note}</span>
                </div>
              </div>
            ))}
          </div>
          <InfoBox variant="emerald">
            <strong>Key insight:</strong> Unlike traditional finance, blockchain transactions are irreversible. DR planning focuses on operational continuity (signing capability) rather than data recovery. The RPO is effectively zero because on-chain state cannot be lost.
          </InfoBox>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE ROOT
// ══════════════════════════════════════════════════════════════════════════════

export default function DigitalCustodyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 border-l-4 border-l-primary rounded-lg bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-md bg-indigo-500/20 border border-indigo-500/30">
            <Lock size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Digital Asset Custody</h1>
            <p className="text-sm text-muted-foreground">Institutional crypto custody solutions, MPC technology, regulatory requirements, and insurance</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "Hot/Cold Wallets", color: "bg-primary/20 text-primary border-border" },
            { label: "MPC Technology", color: "bg-cyan-500/20 text-muted-foreground border-cyan-500/30" },
            { label: "SEC / OCC", color: "bg-primary/20 text-primary border-border" },
            { label: "Lloyd's Insurance", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
            { label: "SOC 2 Type II", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
          ].map((tag) => (
            <Badge key={tag.label} className={cn("text-xs text-muted-foreground", tag.color)}>
              {tag.label}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="architecture" className="mt-8">
        <TabsList className="bg-foreground/5 border border-border mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="architecture" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-xs">
            <Lock size={12} className="mr-1.5" /> Custody Architecture
          </TabsTrigger>
          <TabsTrigger value="institutional" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-xs">
            <Building2 size={12} className="mr-1.5" /> Institutional Solutions
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-xs">
            <FileText size={12} className="mr-1.5" /> Regulatory Framework
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-xs">
            <ShieldAlert size={12} className="mr-1.5" /> Security & Insurance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Tab1CustodyArchitecture />
          </motion.div>
        </TabsContent>

        <TabsContent value="institutional" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Tab2InstitutionalSolutions />
          </motion.div>
        </TabsContent>

        <TabsContent value="regulatory" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Tab3RegulatoryFramework />
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Tab4SecurityInsurance />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
