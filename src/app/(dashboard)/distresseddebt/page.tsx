"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Shield,
  Layers,
  FileText,
  BarChart2,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  Target,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 712005;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

type CreditRating = "CCC" | "CC" | "C" | "D" | "SD";
type SeniorityLevel = "Senior Secured" | "Senior Unsecured" | "Subordinated" | "Mezzanine" | "Equity";

interface DistressedCredit {
  id: string;
  issuer: string;
  sector: string;
  rating: CreditRating;
  coupon: number;
  maturity: string;
  parValue: number;
  marketPrice: number; // cents on dollar
  yieldToMaturity: number;
  spreadBps: number;
  debtToEbitda: number;
  interestCoverage: number;
  marketCap: number; // $B
  status: "Pre-Distress" | "Distressed" | "Restructuring" | "Default";
}

interface CapitalLayer {
  seniority: SeniorityLevel;
  amount: number; // $M
  rate: string;
  recoveryLow: number;
  recoveryHigh: number;
  recoveryBase: number;
  isFulcrum: boolean;
  description: string;
}

interface Chapter11Step {
  phase: string;
  duration: string;
  description: string;
  keyEvents: string[];
  stakeholders: string[];
}

interface ValuationScenario {
  label: "Bear" | "Base" | "Bull";
  evMultiple: number;
  enterpriseValue: number;
  recoverySecured: number;
  recoveryUnsecured: number;
  recoveryEquity: number;
  impliedIRR: number;
  color: string;
}

interface FamousCase {
  company: string;
  sector: string;
  filingYear: number;
  debtAtFiling: number; // $B
  entryThesis: string;
  outcome: string;
  irr: number | null;
  recoveryRate: number; // cents on dollar
  duration: string; // months in bankruptcy
  keyLesson: string;
  color: string;
}

// ── Data Generation ───────────────────────────────────────────────────────────

const SECTORS = ["Retail", "Energy", "Healthcare", "TMT", "Industrials", "Real Estate", "Gaming", "Airlines"];
const RATINGS: CreditRating[] = ["CCC", "CC", "C", "D", "SD"];
const STATUSES: DistressedCredit["status"][] = ["Pre-Distress", "Distressed", "Restructuring", "Default"];

const ISSUERS = [
  { name: "Revco Holdings", sector: "Retail" },
  { name: "SunRidge Energy", sector: "Energy" },
  { name: "MedCare Systems", sector: "Healthcare" },
  { name: "TowerLink Comms", sector: "TMT" },
  { name: "Apex Industrials", sector: "Industrials" },
  { name: "Coastal Properties", sector: "Real Estate" },
  { name: "Galaxy Gaming Corp", sector: "Gaming" },
  { name: "SkyWing Airlines", sector: "Airlines" },
  { name: "Prism Retail Group", sector: "Retail" },
  { name: "Basin Oil & Gas", sector: "Energy" },
];

const distressedCredits: DistressedCredit[] = ISSUERS.map((issuer, i) => {
  const price = 20 + rand() * 55; // 20–75 cents
  const ytm = 15 + rand() * 45; // 15–60%
  const spread = Math.round(1050 + rand() * 3500); // >1000bps
  return {
    id: `DC-${i + 1}`,
    issuer: issuer.name,
    sector: issuer.sector,
    rating: RATINGS[Math.floor(rand() * RATINGS.length)],
    coupon: +(5 + rand() * 6).toFixed(2),
    maturity: `202${5 + Math.floor(rand() * 5)}`,
    parValue: 1000,
    marketPrice: +price.toFixed(1),
    yieldToMaturity: +ytm.toFixed(1),
    spreadBps: spread,
    debtToEbitda: +(8 + rand() * 18).toFixed(1),
    interestCoverage: +(0.2 + rand() * 1.2).toFixed(2),
    marketCap: +(0.1 + rand() * 3).toFixed(2),
    status: STATUSES[Math.floor(rand() * STATUSES.length)],
  };
});

const creditQualityData = [
  { label: "CCC", count: 38, pct: 38, color: "#f59e0b" },
  { label: "CC", count: 28, pct: 28, color: "#f97316" },
  { label: "C", count: 18, pct: 18, color: "#ef4444" },
  { label: "D", count: 11, pct: 11, color: "#dc2626" },
  { label: "SD", count: 5, pct: 5, color: "#991b1b" },
];

const capitalLayers: CapitalLayer[] = [
  {
    seniority: "Senior Secured",
    amount: 400,
    rate: "L+400",
    recoveryLow: 75,
    recoveryHigh: 100,
    recoveryBase: 90,
    isFulcrum: false,
    description: "First lien bank debt, collateralized by all assets. Highest priority in waterfall.",
  },
  {
    seniority: "Senior Unsecured",
    amount: 300,
    rate: "8.5% fixed",
    recoveryLow: 30,
    recoveryHigh: 65,
    recoveryBase: 48,
    isFulcrum: true,
    description: "High-yield bonds. Often the fulcrum security where equity value is created/destroyed.",
  },
  {
    seniority: "Subordinated",
    amount: 200,
    rate: "11% fixed",
    recoveryLow: 0,
    recoveryHigh: 25,
    recoveryBase: 8,
    isFulcrum: false,
    description: "Junior notes. Typically wiped out or receive minimal recovery in distressed scenarios.",
  },
  {
    seniority: "Mezzanine",
    amount: 100,
    rate: "14% PIK",
    recoveryLow: 0,
    recoveryHigh: 10,
    recoveryBase: 2,
    isFulcrum: false,
    description: "PIK/OID instruments subordinate to bonds. Near-zero recovery in most restructurings.",
  },
  {
    seniority: "Equity",
    amount: 150,
    rate: "N/A",
    recoveryLow: 0,
    recoveryHigh: 5,
    recoveryBase: 0,
    isFulcrum: false,
    description: "Common equity. Last in line. Usually cancelled and reissued to creditors post-reorg.",
  },
];

const chapter11Steps: Chapter11Step[] = [
  {
    phase: "Petition Filing",
    duration: "Day 1",
    description: "Debtor files voluntary Chapter 11 petition. Automatic stay immediately halts all creditor actions, lawsuits, and collection efforts.",
    keyEvents: ["Automatic stay triggers", "DIP financing arranged", "First-day motions filed", "Critical vendor payments"],
    stakeholders: ["Debtor", "DIP Lenders", "US Trustee"],
  },
  {
    phase: "DIP Financing",
    duration: "Week 1–2",
    description: "Debtor-in-Possession financing provides liquidity to continue operations. DIP lenders receive super-priority status above all pre-petition debt.",
    keyEvents: ["DIP credit agreement", "Cash collateral use order", "Budget approval", "Roll-up provisions negotiated"],
    stakeholders: ["DIP Lenders", "Pre-petition Lenders", "Bankruptcy Court"],
  },
  {
    phase: "Creditor Committee",
    duration: "Month 1",
    description: "Unsecured creditors committee appointed by US Trustee. Conducts due diligence, hires advisors, begins negotiations with debtor.",
    keyEvents: ["Committee formation", "Retention of professionals", "Document requests", "Management presentations"],
    stakeholders: ["UCC", "Debtor", "Equity Committee (if any)"],
  },
  {
    phase: "Plan of Reorganization",
    duration: "Month 3–12",
    description: "Debtor files plan of reorganization and disclosure statement. Creditors vote by class. Impaired classes must accept or be crammed down.",
    keyEvents: ["Disclosure statement approval", "Solicitation period", "Vote by class", "Confirmation hearing"],
    stakeholders: ["All Creditor Classes", "Equity Holders", "Court"],
  },
  {
    phase: "Confirmation & Emergence",
    duration: "Month 12–18",
    description: "Court confirms plan if feasibility and best-interests tests are met. New equity distributed to creditors. Company emerges with clean balance sheet.",
    keyEvents: ["Confirmation order", "Effective date", "New equity issuance", "Claims reconciliation"],
    stakeholders: ["Reorganized Debtor", "New Equity Holders", "Claims Agent"],
  },
];

const valuationScenarios: ValuationScenario[] = [
  {
    label: "Bear",
    evMultiple: 4.5,
    enterpriseValue: 450,
    recoverySecured: 100,
    recoveryUnsecured: 12,
    recoveryEquity: 0,
    impliedIRR: -18,
    color: "#ef4444",
  },
  {
    label: "Base",
    evMultiple: 6.0,
    enterpriseValue: 600,
    recoverySecured: 100,
    recoveryUnsecured: 48,
    recoveryEquity: 0,
    impliedIRR: 22,
    color: "#3b82f6",
  },
  {
    label: "Bull",
    evMultiple: 8.0,
    enterpriseValue: 800,
    recoverySecured: 100,
    recoveryUnsecured: 100,
    recoveryEquity: 43,
    impliedIRR: 58,
    color: "#22c55e",
  },
];

const famousCases: FamousCase[] = [
  {
    company: "Hertz",
    sector: "Automotive Rental",
    filingYear: 2020,
    debtAtFiling: 19.0,
    entryThesis: "Pandemic caused near-zero revenue but massive fleet asset base provided tangible collateral. Distressed buyers bet on travel recovery and EV fleet transition optionality.",
    outcome: "Emerged from bankruptcy in 2021. Creditors received full recovery plus new equity. Retail trading frenzy briefly made equity worthless shares trade above par.",
    irr: 47,
    recoveryRate: 100,
    duration: "13",
    keyLesson: "Asset-heavy businesses can recover quickly when operating issues are temporary. Fleet value provided floor that limited downside.",
    color: "#f59e0b",
  },
  {
    company: "Sears Holdings",
    sector: "Retail",
    filingYear: 2018,
    debtAtFiling: 5.6,
    entryThesis: "Real estate portfolio valued at $3–5B, iconic brand, credit card portfolio. Many investors bet on liquidation value exceeding liabilities.",
    outcome: "Transform Holdco (renamed) emerged from prolonged process. Most real estate sold below expectations. Unsecured creditors received ~15 cents. Prolonged litigation with ESL/Lampert.",
    irr: -42,
    recoveryRate: 15,
    duration: "14",
    keyLesson: "Secular retail decline destroys optionality value. Operating losses burned through asset value faster than restructuring could execute.",
    color: "#ef4444",
  },
  {
    company: "Toys R Us",
    sector: "Retail",
    filingYear: 2017,
    debtAtFiling: 5.0,
    entryThesis: "LBO left $5B+ debt on balance sheet. Investors believed holiday season cash flows and brand loyalty could support restructuring and emergence.",
    outcome: "Liquidated in 2018 after holiday season missed forecasts. All ~33,000 employees lost jobs. Senior secured lenders recovered ~80 cents. Brand later relaunched by new investors.",
    irr: null,
    recoveryRate: 80,
    duration: "9",
    keyLesson: "Amazon disruption + excessive LBO leverage = no path to viability. Sometimes liquidation is the right outcome even for iconic brands.",
    color: "#ef4444",
  },
  {
    company: "Caesars Entertainment",
    sector: "Gaming",
    filingYear: 2015,
    debtAtFiling: 18.4,
    entryThesis: "Apollo and TPG LBO created opportunity. Real estate assets separable via REIT structure. Gaming licenses provided ongoing cash flows despite heavy debt load.",
    outcome: "Emerged 2017 after contentious creditor dispute over asset transfers pre-filing. REIT/OpCo structure unlocked value. Senior lenders recovered 100 cents plus new equity.",
    irr: 31,
    recoveryRate: 100,
    duration: "27",
    keyLesson: "Structural complexity and pre-filing transactions create litigation risk. REIT separation of gaming real estate unlocked significant value for senior creditors.",
    color: "#22c55e",
  },
  {
    company: "Lehman Brothers",
    sector: "Investment Banking",
    filingYear: 2008,
    debtAtFiling: 613.0,
    entryThesis: "Largest bankruptcy in history. Distressed buyers acquired bonds at 8–20 cents in weeks after filing, betting on derivative portfolio and real estate asset recoveries.",
    outcome: "Final distribution plan completed 2022 — 14 years later. Unsecured creditors ultimately recovered ~18 cents on dollar. Some distressed funds that bought at 8 cents made 2x+.",
    irr: 28,
    recoveryRate: 18,
    duration: "168",
    keyLesson: "Complexity creates opportunity. Derivatives netting and cross-border claims took 14 years to resolve but early buyers at deep discounts earned strong returns.",
    color: "#3b82f6",
  },
];

// ── Helper Functions ──────────────────────────────────────────────────────────

function fmtPct(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function fmtBps(v: number) {
  return `${v.toLocaleString()}bps`;
}

function statusColor(status: DistressedCredit["status"]) {
  switch (status) {
    case "Pre-Distress": return "text-amber-400 bg-amber-400/10";
    case "Distressed": return "text-orange-400 bg-orange-400/10";
    case "Restructuring": return "text-red-400 bg-red-400/10";
    case "Default": return "text-red-600 bg-red-600/10";
  }
}

function ratingColor(r: CreditRating) {
  switch (r) {
    case "CCC": return "text-amber-400";
    case "CC": return "text-orange-400";
    case "C": return "text-red-400";
    case "D": return "text-red-600";
    case "SD": return "text-red-700";
  }
}

// ── Credit Quality SVG Chart ──────────────────────────────────────────────────

function CreditQualityChart() {
  const W = 440;
  const H = 200;
  const cx = 110;
  const cy = 105;
  const R = 80;
  const r = 44;

  // Compute arcs
  let cumAngle = -Math.PI / 2;
  const slices = creditQualityData.map((d) => {
    const angle = (d.pct / 100) * 2 * Math.PI;
    const start = cumAngle;
    cumAngle += angle;
    return { ...d, startAngle: start, endAngle: cumAngle };
  });

  function arc(sa: number, ea: number, outerR: number, innerR: number) {
    const x1 = cx + outerR * Math.cos(sa);
    const y1 = cy + outerR * Math.sin(sa);
    const x2 = cx + outerR * Math.cos(ea);
    const y2 = cy + outerR * Math.sin(ea);
    const x3 = cx + innerR * Math.cos(ea);
    const y3 = cy + innerR * Math.sin(ea);
    const x4 = cx + innerR * Math.cos(sa);
    const y4 = cy + innerR * Math.sin(sa);
    const large = ea - sa > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${outerR},${outerR},0,${large},1,${x2},${y2} L${x3},${y3} A${innerR},${innerR},0,${large},0,${x4},${y4} Z`;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-lg">
      {slices.map((sl) => (
        <path
          key={sl.label}
          d={arc(sl.startAngle, sl.endAngle, R, r)}
          fill={sl.color}
          opacity={0.9}
          stroke="#111827"
          strokeWidth={1.5}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={11} fill="#9ca3af">Distressed</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize={11} fill="#9ca3af">Universe</text>
      {/* Legend */}
      {creditQualityData.map((d, i) => {
        const lx = 220;
        const ly = 30 + i * 34;
        const barW = (d.pct / 100) * 180;
        return (
          <g key={d.label}>
            <rect x={lx} y={ly} width={barW} height={16} rx={3} fill={d.color} opacity={0.85} />
            <text x={lx - 8} y={ly + 12} textAnchor="end" fontSize={12} fontWeight="600" fill={d.color}>{d.label}</text>
            <text x={lx + barW + 6} y={ly + 12} fontSize={11} fill="#9ca3af">{d.pct}%</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Waterfall SVG ─────────────────────────────────────────────────────────────

function WaterfallDiagram() {
  const W = 480;
  const H = 290;
  const layerH = 44;
  const totalDebt = capitalLayers.reduce((a, b) => a + b.amount, 0);
  const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#f97316", "#6b7280"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl">
      <text x={12} y={18} fontSize={11} fill="#6b7280">Capital Structure Waterfall — $1,150M Total</text>
      {capitalLayers.map((layer, i) => {
        const barW = (layer.amount / totalDebt) * 340;
        const y = 28 + i * (layerH + 6);
        const color = colors[i];
        return (
          <g key={layer.seniority}>
            <rect x={12} y={y} width={barW} height={layerH - 4} rx={4} fill={color} opacity={0.2} />
            <rect x={12} y={y} width={barW} height={layerH - 4} rx={4} fill="none" stroke={color} strokeWidth={1.5} />
            <text x={22} y={y + 14} fontSize={11} fontWeight="700" fill={color}>{layer.seniority}</text>
            <text x={22} y={y + 28} fontSize={10} fill="#9ca3af">${layer.amount}M · {layer.rate}</text>
            {layer.isFulcrum && (
              <g>
                <rect x={barW + 16} y={y + 6} width={70} height={16} rx={8} fill="#f59e0b" opacity={0.2} />
                <text x={barW + 51} y={y + 18} textAnchor="middle" fontSize={9} fontWeight="700" fill="#f59e0b">FULCRUM</text>
              </g>
            )}
            {/* Recovery bar */}
            <rect x={370} y={y + 4} width={90} height={10} rx={2} fill="#1f2937" />
            <rect
              x={370}
              y={y + 4}
              width={Math.round((layer.recoveryBase / 100) * 90)}
              height={10}
              rx={2}
              fill={color}
              opacity={0.7}
            />
            <text x={466} y={y + 13} fontSize={9} fill="#9ca3af">{layer.recoveryBase}¢</text>
          </g>
        );
      })}
      <text x={370} y={H - 4} fontSize={9} fill="#6b7280">Recovery (¢/$)</text>
    </svg>
  );
}

// ── Chapter 11 Flowchart SVG ──────────────────────────────────────────────────

function Chapter11Flowchart() {
  const W = 520;
  const H = 80;
  const phases = chapter11Steps.map((s) => s.phase);
  const colors = ["#6366f1", "#3b82f6", "#8b5cf6", "#f59e0b", "#22c55e"];
  const boxW = 86;
  const boxH = 50;
  const gap = 14;
  const totalW = phases.length * boxW + (phases.length - 1) * gap;
  const startX = (W - totalW) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl">
      {phases.map((phase, i) => {
        const x = startX + i * (boxW + gap);
        const color = colors[i];
        return (
          <g key={phase}>
            <rect x={x} y={10} width={boxW} height={boxH} rx={6} fill={color} opacity={0.15} stroke={color} strokeWidth={1.5} />
            <text x={x + boxW / 2} y={32} textAnchor="middle" fontSize={9} fontWeight="700" fill={color}>
              {phase.split(" ").map((word, wi) => (
                <tspan key={wi} x={x + boxW / 2} dy={wi === 0 ? 0 : 11}>{word}</tspan>
              ))}
            </text>
            <text x={x + boxW / 2} y={56} textAnchor="middle" fontSize={8} fill="#6b7280">
              {chapter11Steps[i].duration}
            </text>
            {i < phases.length - 1 && (
              <g>
                <line
                  x1={x + boxW + 2}
                  y1={35}
                  x2={x + boxW + gap - 2}
                  y2={35}
                  stroke={colors[i + 1]}
                  strokeWidth={1.5}
                  strokeDasharray="3,2"
                />
                <polygon
                  points={`${x + boxW + gap - 2},31 ${x + boxW + gap - 2},39 ${x + boxW + gap + 5},35`}
                  fill={colors[i + 1]}
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DistressedDebtPage() {
  const [activeTab, setActiveTab] = useState("universe");
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof DistressedCredit>("spreadBps");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedCredits = useMemo(() => {
    return [...distressedCredits].sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "desc" ? vb - va : va - vb;
      }
      return sortDir === "desc"
        ? String(vb).localeCompare(String(va))
        : String(va).localeCompare(String(vb));
    });
  }, [sortField, sortDir]);

  function handleSort(field: keyof DistressedCredit) {
    if (field === sortField) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const totalMarketSize = 385; // $B
  const avgSpread = Math.round(
    distressedCredits.reduce((a, b) => a + b.spreadBps, 0) / distressedCredits.length
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Distressed Debt & Special Situations</h1>
            <p className="text-sm text-gray-400">
              High-yield bonds trading 1000+ bps over Treasury — bankruptcy, restructuring, and event-driven investing
            </p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Market Size", value: `$${totalMarketSize}B`, sub: "Distressed Universe", icon: DollarSign, color: "text-red-400" },
            { label: "Avg Spread", value: fmtBps(avgSpread), sub: "Over Treasury", icon: TrendingDown, color: "text-orange-400" },
            { label: "Default Rate", value: "6.8%", sub: "HY TTM Default", icon: AlertTriangle, color: "text-amber-400" },
            { label: "Avg Recovery", value: "42¢", sub: "Cents on Dollar", icon: Target, color: "text-blue-400" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                <span className="text-xs text-gray-500">{kpi.label}</span>
              </div>
              <p className={cn("text-xl font-bold", kpi.color)}>{kpi.value}</p>
              <p className="text-xs text-gray-600">{kpi.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border border-gray-800 mb-4 flex flex-wrap h-auto gap-1 p-1">
          {[
            { id: "universe", label: "Distressed Universe", icon: BarChart2 },
            { id: "capital", label: "Capital Structure", icon: Layers },
            { id: "chapter11", label: "Chapter 11", icon: FileText },
            { id: "valuation", label: "Valuation", icon: Shield },
            { id: "cases", label: "Famous Cases", icon: Zap },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5 text-xs data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300"
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab 1: Distressed Universe */}
        <TabsContent value="universe" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Chart */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Credit Quality Distribution</h3>
              <p className="text-xs text-gray-500 mb-3">
                Breakdown of distressed universe by S&P/Moody&apos;s equivalent rating
              </p>
              <CreditQualityChart />
              <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-300 font-medium">Definition: Distressed Debt</p>
                <p className="text-xs text-gray-400 mt-1">
                  Bonds trading at yields &gt;1,000 bps (10%) over equivalent Treasury. Signals elevated
                  default probability and potential for restructuring.
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-white">Distressed Credit Screener</h3>
                <p className="text-xs text-gray-500">Click column headers to sort</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {(
                        [
                          ["issuer", "Issuer"],
                          ["rating", "Rtg"],
                          ["marketPrice", "Price"],
                          ["yieldToMaturity", "YTM"],
                          ["spreadBps", "Spread"],
                          ["status", "Status"],
                        ] as [keyof DistressedCredit, string][]
                      ).map(([field, label]) => (
                        <th
                          key={field}
                          className="px-3 py-2 text-left text-gray-500 font-medium cursor-pointer hover:text-gray-300 select-none"
                          onClick={() => handleSort(field)}
                        >
                          <div className="flex items-center gap-1">
                            {label}
                            {sortField === field && (
                              <span className="text-red-400">{sortDir === "desc" ? "▼" : "▲"}</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCredits.map((c, i) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30"
                      >
                        <td className="px-3 py-2">
                          <div className="font-medium text-gray-200">{c.issuer}</div>
                          <div className="text-gray-600">{c.sector}</div>
                        </td>
                        <td className={cn("px-3 py-2 font-bold", ratingColor(c.rating))}>{c.rating}</td>
                        <td className="px-3 py-2 font-mono text-gray-300">{c.marketPrice}¢</td>
                        <td className="px-3 py-2 font-mono text-orange-400">{c.yieldToMaturity}%</td>
                        <td className="px-3 py-2 font-mono text-red-400">{fmtBps(c.spreadBps)}</td>
                        <td className="px-3 py-2">
                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColor(c.status))}>
                            {c.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Market context */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: "Why Distressed Debt Exists",
                body: "Companies face financial distress when operating cash flows cannot service debt obligations. Causes include: excessive leverage (LBOs), secular disruption, commodity price collapses, fraud, or macroeconomic shocks. Prices fall as institutional holders are forced to sell (investment grade mandates cannot hold sub-CCC debt).",
                color: "border-red-500/20",
              },
              {
                title: "The Information Edge",
                body: "Distressed investors earn outsized returns by developing deep operational expertise that bond analysts lack. Understanding enterprise value, recovery waterfall mechanics, and legal process creates information asymmetry. Creditor committees provide private access to management and financials unavailable to public investors.",
                color: "border-amber-500/20",
              },
              {
                title: "Distressed vs. Defaulted",
                body: "Distressed = high spread but still current on payments. Defaulted = missed payment or covenant violation. The highest returns often come from buying distressed bonds (before default) when uncertainty is greatest. Post-default prices stabilize as restructuring thesis becomes clearer and liquidation floor provides support.",
                color: "border-blue-500/20",
              },
            ].map((card) => (
              <div key={card.title} className={cn("bg-gray-900 border rounded-xl p-4", card.color)}>
                <h4 className="text-sm font-semibold text-white mb-2">{card.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Capital Structure Analysis */}
        <TabsContent value="capital" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Waterfall diagram */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Seniority Waterfall</h3>
              <p className="text-xs text-gray-500 mb-3">
                Priority of payment in liquidation or reorganization
              </p>
              <WaterfallDiagram />
              <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-300 font-medium">Fulcrum Security</p>
                <p className="text-xs text-gray-400 mt-1">
                  The debt tranche that is partially impaired — receives a blend of cash and new equity.
                  This is where the enterprise value &quot;meets&quot; the capital structure, making it the
                  pivotal class in negotiations.
                </p>
              </div>
            </div>

            {/* Recovery table + detail */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-sm font-semibold text-white">Recovery Rate by Seniority</h3>
                  <p className="text-xs text-gray-500">Historical averages (LGD studies, Moody&apos;s)</p>
                </div>
                <div className="divide-y divide-gray-800/50">
                  {capitalLayers.map((layer, i) => {
                    const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#f97316", "#6b7280"];
                    const c = colors[i];
                    return (
                      <div key={layer.seniority} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">{layer.seniority}</span>
                              {layer.isFulcrum && (
                                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                                  Fulcrum
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">${layer.amount}M · {layer.rate}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold" style={{ color: c }}>
                              {layer.recoveryBase}¢
                            </span>
                            <div className="text-xs text-gray-600">
                              [{layer.recoveryLow}–{layer.recoveryHigh}¢]
                            </div>
                          </div>
                        </div>
                        {/* Recovery range bar */}
                        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
                          <div
                            className="absolute h-full rounded-full opacity-30"
                            style={{ left: `${layer.recoveryLow}%`, width: `${layer.recoveryHigh - layer.recoveryLow}%`, backgroundColor: c }}
                          />
                          <div
                            className="absolute w-2 h-full rounded-full"
                            style={{ left: `${layer.recoveryBase}%`, backgroundColor: c }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{layer.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Key concepts */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                title: "Absolute Priority Rule (APR)",
                body: "In Chapter 11, each class must be paid in full before junior classes receive anything. Senior secured → senior unsecured → subordinated → equity. APR can be violated by agreement ('gift' from senior to junior to secure votes) but courts increasingly scrutinize this.",
                icon: Shield,
                color: "text-blue-400",
              },
              {
                title: "Identifying the Fulcrum Security",
                body: "Enterprise Value ÷ by capital layers until you run out of EV. Where EV intersects the capital structure is the fulcrum. If EV = $550M on our example ($400M secured + $300M unsecured), the fulcrum is senior unsecured notes receiving $150M of $300M face (50 cents). Buying at 30 cents = 67% upside.",
                icon: Target,
                color: "text-amber-400",
              },
              {
                title: "DIP Financing Priority",
                body: "Debtor-in-Possession lenders receive super-priority status — they are paid ahead of ALL pre-petition debt including senior secured. Roll-up provisions allow DIP lenders to convert pre-petition exposure to super-priority status. DIP spreads typically 300–600bps with significant fees.",
                icon: Zap,
                color: "text-purple-400",
              },
              {
                title: "Equitable Subordination",
                body: "Courts can subordinate claims of creditors who acted inequitably (e.g., insider lenders who extracted value pre-bankruptcy). Also: fraudulent conveyance (transfers at less than fair value) can be unwound up to 2 years pre-filing. Key risk in LBO distressed situations.",
                icon: AlertTriangle,
                color: "text-red-400",
              },
            ].map((card) => (
              <div key={card.title} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className={cn("w-4 h-4", card.color)} />
                  <h4 className="text-sm font-semibold text-white">{card.title}</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Chapter 11 Process */}
        <TabsContent value="chapter11" className="data-[state=inactive]:hidden">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-white mb-1">Chapter 11 Reorganization Process</h3>
            <p className="text-xs text-gray-500 mb-4">Average duration: 12–24 months for large public companies</p>
            <Chapter11Flowchart />
          </div>

          <div className="space-y-3">
            {chapter11Steps.map((step, i) => {
              const isOpen = expandedStep === i;
              const colors = ["#6366f1", "#3b82f6", "#8b5cf6", "#f59e0b", "#22c55e"];
              const c = colors[i];
              return (
                <div
                  key={step.phase}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
                >
                  <button
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-800/40 transition-colors"
                    onClick={() => setExpandedStep(isOpen ? null : i)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: c, opacity: 0.85 }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white">{step.phase}</span>
                        <span className="ml-3 text-xs text-gray-500">{step.duration}</span>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
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
                        <div className="px-4 pb-4 border-t border-gray-800">
                          <p className="text-xs text-gray-400 mt-3 mb-4 leading-relaxed">{step.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-300 mb-2">Key Events</p>
                              <ul className="space-y-1">
                                {step.keyEvents.map((ev) => (
                                  <li key={ev} className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c }} />
                                    {ev}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-300 mb-2">Key Stakeholders</p>
                              <div className="flex flex-wrap gap-1.5">
                                {step.stakeholders.map((sh) => (
                                  <span
                                    key={sh}
                                    className="text-xs px-2 py-0.5 rounded-full border"
                                    style={{ borderColor: `${c}40`, color: c, backgroundColor: `${c}10` }}
                                  >
                                    {sh}
                                  </span>
                                ))}
                              </div>
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

          {/* Additional context */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: "Pre-Packaged Bankruptcy",
                body: "Debtor negotiates restructuring plan with majority of creditors BEFORE filing. Dramatically shortens process to 30–90 days. Requires consent from 2/3 in amount and 1/2 in number per impaired class. Common in telecom and energy sectors.",
                color: "border-purple-500/20",
              },
              {
                title: "Cramdown Power",
                body: "Court can confirm plan over objection of dissenting class if: plan doesn't discriminate unfairly AND is 'fair and equitable.' For secured: creditors receive collateral value. For unsecured: no junior class receives anything. Powerful tool to force holdouts.",
                color: "border-blue-500/20",
              },
              {
                title: "363 Sales",
                body: "Assets sold under Section 363 free and clear of liens and claims. Allows quick liquidation of individual assets or entire business (credit bid by secured lender). Common when going-concern value erodes rapidly. Buyer gets clean title, reducing acquisition risk.",
                color: "border-green-500/20",
              },
            ].map((card) => (
              <div key={card.title} className={cn("bg-gray-900 border rounded-xl p-4", card.color)}>
                <h4 className="text-sm font-semibold text-white mb-2">{card.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 4: Valuation */}
        <TabsContent value="valuation" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {valuationScenarios.map((sc) => (
              <motion.div
                key={sc.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
              >
                <div
                  className="p-3 flex items-center justify-between"
                  style={{ backgroundColor: `${sc.color}15`, borderBottom: `1px solid ${sc.color}30` }}
                >
                  <span className="text-sm font-bold" style={{ color: sc.color }}>
                    {sc.label} Case
                  </span>
                  <span className="text-xs font-medium text-gray-400">{sc.evMultiple}x EV/EBITDA</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Enterprise Value</span>
                    <span className="text-xs font-bold text-white">${sc.enterpriseValue}M</span>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Senior Secured Recovery</span>
                      <span className="text-xs font-semibold text-green-400">{sc.recoverySecured}¢</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${sc.recoverySecured}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Unsecured Recovery</span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: sc.recoveryUnsecured > 50 ? "#22c55e" : sc.recoveryUnsecured > 20 ? "#f59e0b" : "#ef4444" }}
                      >
                        {sc.recoveryUnsecured}¢
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${sc.recoveryUnsecured}%`,
                          backgroundColor: sc.recoveryUnsecured > 50 ? "#22c55e" : sc.recoveryUnsecured > 20 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Equity Recovery</span>
                      <span className="text-xs font-semibold text-gray-400">{sc.recoveryEquity}¢</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full">
                      <div className="h-full bg-gray-500 rounded-full" style={{ width: `${sc.recoveryEquity}%` }} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Implied IRR (unsecured)</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: sc.impliedIRR >= 0 ? sc.color : "#ef4444" }}
                    >
                      {fmtPct(sc.impliedIRR)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Valuation methodology */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                Liquidation Analysis
              </h3>
              <div className="space-y-2">
                {[
                  { asset: "Cash & Equivalents", orderly: 100, distressed: 100 },
                  { asset: "Accounts Receivable", orderly: 80, distressed: 60 },
                  { asset: "Inventory", orderly: 65, distressed: 40 },
                  { asset: "PP&E / Real Estate", orderly: 75, distressed: 50 },
                  { asset: "Intellectual Property", orderly: 60, distressed: 20 },
                  { asset: "Goodwill / Intangibles", orderly: 30, distressed: 5 },
                ].map((row) => (
                  <div key={row.asset} className="flex items-center gap-2 text-xs">
                    <span className="w-40 text-gray-400 flex-shrink-0">{row.asset}</span>
                    <div className="flex-1 grid grid-cols-2 gap-1">
                      <div className="text-center">
                        <div className="h-1.5 bg-gray-800 rounded-full mb-0.5">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${row.orderly}%` }} />
                        </div>
                        <span className="text-blue-400">{row.orderly}%</span>
                      </div>
                      <div className="text-center">
                        <div className="h-1.5 bg-gray-800 rounded-full mb-0.5">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${row.distressed}%` }} />
                        </div>
                        <span className="text-red-400">{row.distressed}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex text-xs text-gray-600 mt-1">
                  <span className="w-40" />
                  <div className="flex-1 grid grid-cols-2 gap-1 text-center">
                    <span className="text-blue-500">Orderly</span>
                    <span className="text-red-500">Fire Sale</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Going Concern Valuation
              </h3>
              <div className="space-y-3">
                {[
                  {
                    method: "EV / EBITDA",
                    range: "4–8x",
                    note: "Comp set from emerged companies + industry peers. Apply discount for operational risk.",
                    color: "#3b82f6",
                  },
                  {
                    method: "Discounted Cash Flow",
                    range: "15–25% WACC",
                    note: "High discount rate reflects distress premium. Use management plan with haircuts (50–70% of projections).",
                    color: "#8b5cf6",
                  },
                  {
                    method: "Precedent Transactions",
                    range: "M&A comps",
                    note: "363 asset sales provide direct comparisons. Distressed transactions trade at 20–40% discount to normal M&A.",
                    color: "#f59e0b",
                  },
                  {
                    method: "Sum of the Parts",
                    range: "Asset-by-asset",
                    note: "Value each business segment or asset separately. Conglomerate discount may disappear post-restructuring.",
                    color: "#22c55e",
                  },
                ].map((m) => (
                  <div key={m.method} className="p-2 rounded-lg border" style={{ borderColor: `${m.color}25`, backgroundColor: `${m.color}08` }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: m.color }}>{m.method}</span>
                      <span className="text-xs text-gray-500 font-mono">{m.range}</span>
                    </div>
                    <p className="text-xs text-gray-500">{m.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">Par vs. Market Value Recovery</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Recovery rates are expressed in cents on the dollar of <em className="text-gray-300">face/par value</em>.
              If you buy bonds at 30 cents and recover 50 cents, your gain is 67% on invested capital — not 50%.
              The key metric for distressed investors is <em className="text-gray-300">recovery relative to purchase price</em>,
              not absolute recovery rate. Buying at the right price transforms a seemingly low recovery into an
              exceptional IRR. A 40 cent recovery on bonds purchased at 20 cents = 2x return regardless of time value.
            </p>
          </div>
        </TabsContent>

        {/* Tab 5: Famous Cases */}
        <TabsContent value="cases" className="data-[state=inactive]:hidden">
          <div className="mb-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <h3 className="text-sm font-semibold text-white mb-1">Hall of Fame — Distressed Debt Case Studies</h3>
            <p className="text-xs text-gray-500">
              Five landmark restructurings that defined modern distressed investing. Each illustrates different investment theses, legal dynamics, and outcomes.
            </p>
          </div>

          <div className="space-y-3">
            {famousCases.map((c, i) => {
              const isOpen = expandedCase === c.company;
              return (
                <motion.div
                  key={c.company}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
                >
                  <button
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-800/40 transition-colors"
                    onClick={() => setExpandedCase(isOpen ? null : c.company)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: `${c.color}25`, border: `1px solid ${c.color}40` }}
                      >
                        <span style={{ color: c.color }}>{c.company.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{c.company}</span>
                          <span className="text-xs text-gray-500">{c.sector}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                            Filed {c.filingYear}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-gray-500">Debt: ${c.debtAtFiling}B</span>
                          <span className="text-xs text-gray-500">Duration: {c.duration}mo</span>
                          <span className="text-xs font-medium" style={{ color: c.color }}>
                            Recovery: {c.recoveryRate}¢
                          </span>
                          {c.irr !== null && (
                            <span
                              className="text-xs font-bold"
                              style={{ color: c.irr >= 0 ? "#22c55e" : "#ef4444" }}
                            >
                              IRR: {fmtPct(c.irr)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-gray-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div
                              className="p-3 rounded-lg border"
                              style={{ borderColor: `${c.color}25`, backgroundColor: `${c.color}08` }}
                            >
                              <p className="text-xs font-semibold mb-1.5" style={{ color: c.color }}>
                                Entry Thesis
                              </p>
                              <p className="text-xs text-gray-400 leading-relaxed">{c.entryThesis}</p>
                            </div>
                            <div className="p-3 rounded-lg border border-gray-700/50 bg-gray-800/30">
                              <p className="text-xs font-semibold text-gray-300 mb-1.5">Outcome</p>
                              <p className="text-xs text-gray-400 leading-relaxed">{c.outcome}</p>
                            </div>
                          </div>
                          <div className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <p className="text-xs font-semibold text-blue-300 mb-1">Key Lesson</p>
                            <p className="text-xs text-gray-400 leading-relaxed">{c.keyLesson}</p>
                          </div>
                          {/* Stats row */}
                          <div className="grid grid-cols-4 gap-2 mt-3">
                            {[
                              { label: "Debt at Filing", value: `$${c.debtAtFiling}B` },
                              { label: "Filing Year", value: String(c.filingYear) },
                              { label: "Duration", value: `${c.duration} months` },
                              { label: "Sr. Recovery", value: `${c.recoveryRate}¢` },
                            ].map((stat) => (
                              <div key={stat.label} className="bg-gray-800/50 rounded-lg p-2 text-center">
                                <div className="text-xs font-bold text-white">{stat.value}</div>
                                <div className="text-xs text-gray-600 mt-0.5">{stat.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Return profile */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-400" />
                Distressed Debt Return Profile
              </h4>
              <div className="space-y-2">
                {[
                  { category: "Credit Bid / Post-Reorg Equity", return: "30–60%", freq: "Rare", color: "#22c55e" },
                  { category: "Buy Fulcrum, Emerge with Equity", return: "15–40%", freq: "Common", color: "#3b82f6" },
                  { category: "Senior Secured Discount Acq.", return: "10–20%", freq: "Common", color: "#8b5cf6" },
                  { category: "Post-Reorg Equity (stub trade)", return: "-50%–200%", freq: "Speculative", color: "#f59e0b" },
                  { category: "Unsecured in Liquidation", return: "-80%–-30%", freq: "Loss", color: "#ef4444" },
                ].map((row) => (
                  <div key={row.category} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 flex-1">{row.category}</span>
                    <span className="font-mono font-bold mx-3" style={{ color: row.color }}>{row.return}</span>
                    <span className="text-gray-600 w-20 text-right">{row.freq}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Distressed Cycle Timing
              </h4>
              <div className="space-y-3">
                {[
                  { phase: "Pre-Distress", desc: "Yields 800–1200bps, covenant stress, liquidity concerns. Best entry for patient capital.", color: "#f59e0b" },
                  { phase: "Filing Month", desc: "Extreme panic selling. Forced liquidations by investment-grade mandates. Best prices but highest uncertainty.", color: "#ef4444" },
                  { phase: "Plan Negotiation", desc: "Recovery range narrows, thesis validated. Mid-process entry offers risk-adjusted returns.", color: "#3b82f6" },
                  { phase: "Emergence", desc: "New equity distributed. Forced selling by distressed funds not equipped to hold equity. Flip opportunity.", color: "#22c55e" },
                ].map((phase) => (
                  <div key={phase.phase} className="flex gap-3">
                    <div className="w-2 flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: phase.color }} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold" style={{ color: phase.color }}>{phase.phase}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
