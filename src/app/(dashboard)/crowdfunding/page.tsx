"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  DollarSign,
  Shield,
  TrendingUp,
  TrendingDown,
  Info,
  AlertTriangle,
  CheckCircle2,
  BarChart2,
  Globe,
  Layers,
  PieChart,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  BookOpen,
  Calculator,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 875;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Advance PRNG to generate deterministic data
const r = () => rand();

// ── Types ─────────────────────────────────────────────────────────────────────

interface RegFramework {
  name: string;
  maxRaise: string;
  investorLimit: string;
  accreditedOnly: boolean;
  disclosure: string;
  reporting: string;
  testTheWaters: boolean;
  generalSolicitation: boolean;
  color: string;
}

interface Platform {
  name: string;
  region: string;
  focus: string;
  minInvestment: number;
  platformFee: number; // % of raise
  dealsClosed: number;
  totalRaised: number; // $M
  avgDealSize: number; // $K
  dueDiligenceScore: number; // 1-10
  successRate: number; // %
  description: string;
  badge: string;
}

interface SAFEScenario {
  label: string;
  valCap: number;
  discount: number;
  nextRoundVal: number;
  investmentAmount: number;
}

interface PortfolioEntry {
  company: string;
  sector: string;
  stage: string;
  invested: number;
  currentVal: number;
  status: "Active" | "Exited" | "Written Off";
  multiple: number;
  yearInvested: number;
}

// ── Reg Framework Data ────────────────────────────────────────────────────────

const REG_FRAMEWORKS: RegFramework[] = [
  {
    name: "Reg CF",
    maxRaise: "$5M / 12 months",
    investorLimit: "Non-accredited: lesser of $2,500 or 5% income/NW (if income < $124K); 10% if higher",
    accreditedOnly: false,
    disclosure: "Form C — financial statements (reviewed if >$124K, audited if >$1.235M)",
    reporting: "Annual report (Form C-AR) required; 120-day deadline",
    testTheWaters: true,
    generalSolicitation: true,
    color: "blue",
  },
  {
    name: "Reg A+ Tier 1",
    maxRaise: "$20M / 12 months",
    investorLimit: "Non-accredited: 10% of greater of annual income or net worth",
    accreditedOnly: false,
    disclosure: "Offering circular (Form 1-A); state qualification required",
    reporting: "No ongoing SEC reports after offering",
    testTheWaters: true,
    generalSolicitation: true,
    color: "purple",
  },
  {
    name: "Reg A+ Tier 2",
    maxRaise: "$75M / 12 months",
    investorLimit: "Non-accredited: 10% of greater of annual income or net worth",
    accreditedOnly: false,
    disclosure: "Full offering circular; audited financials; SEC-qualified",
    reporting: "Annual (1-K), semi-annual (1-SA), current (1-U) reports",
    testTheWaters: true,
    generalSolicitation: true,
    color: "indigo",
  },
  {
    name: "Reg D 506(b)",
    maxRaise: "Unlimited",
    investorLimit: "Up to 35 non-accredited sophisticated investors; unlimited accredited",
    accreditedOnly: false,
    disclosure: "No required disclosure docs; must provide same info as Reg A to non-accredited",
    reporting: "No ongoing reports; Form D filing within 15 days",
    testTheWaters: false,
    generalSolicitation: false,
    color: "amber",
  },
  {
    name: "Reg D 506(c)",
    maxRaise: "Unlimited",
    investorLimit: "Accredited investors only; issuer must verify status",
    accreditedOnly: true,
    disclosure: "No required disclosure docs; investor verification required",
    reporting: "No ongoing reports; Form D filing within 15 days",
    testTheWaters: false,
    generalSolicitation: true,
    color: "orange",
  },
];

// ── Platform Data ─────────────────────────────────────────────────────────────

const PLATFORMS: Platform[] = [
  {
    name: "Republic",
    region: "US",
    focus: "Tech / Consumer / Crypto",
    minInvestment: 50,
    platformFee: 6,
    dealsClosed: 700,
    totalRaised: 2100,
    avgDealSize: 420,
    dueDiligenceScore: 8.5,
    successRate: 72,
    description: "Community-driven platform known for high deal selectivity and crypto/Web3 exposure.",
    badge: "Top Tier",
  },
  {
    name: "Wefunder",
    region: "US",
    focus: "Generalist / Early-Stage",
    minInvestment: 100,
    platformFee: 7.5,
    dealsClosed: 1500,
    totalRaised: 800,
    avgDealSize: 310,
    dueDiligenceScore: 7.2,
    successRate: 61,
    description: "Highest volume US platform; broad sector coverage; lower barrier to listing.",
    badge: "High Volume",
  },
  {
    name: "StartEngine",
    region: "US",
    focus: "Consumer / Hardware / SaaS",
    minInvestment: 249,
    platformFee: 8,
    dealsClosed: 900,
    totalRaised: 950,
    avgDealSize: 380,
    dueDiligenceScore: 7.0,
    successRate: 58,
    description: "Kevin O'Leary-backed; hosts StartEngine Secondary for post-offering liquidity.",
    badge: "Secondary Market",
  },
  {
    name: "Mainvest",
    region: "US",
    focus: "Local Business / Food & Bev",
    minInvestment: 100,
    platformFee: 6,
    dealsClosed: 220,
    totalRaised: 55,
    avgDealSize: 120,
    dueDiligenceScore: 6.5,
    successRate: 54,
    description: "Revenue-sharing notes for brick-and-mortar businesses; hyper-local focus.",
    badge: "Local Focus",
  },
  {
    name: "Fundrise",
    region: "US",
    focus: "Real Estate / Private Credit",
    minInvestment: 10,
    platformFee: 1,
    dealsClosed: 40,
    totalRaised: 3800,
    avgDealSize: 85000,
    dueDiligenceScore: 9.0,
    successRate: 83,
    description: "Real-estate focused eREITs; lowest minimum; institutional-grade deal sourcing.",
    badge: "Real Estate",
  },
  {
    name: "AngelList",
    region: "US",
    focus: "Venture / Rolling Funds",
    minInvestment: 1000,
    platformFee: 5,
    dealsClosed: 3500,
    totalRaised: 12000,
    avgDealSize: 1800,
    dueDiligenceScore: 8.8,
    successRate: 69,
    description: "Accredited-only SPVs and rolling funds; deepest VC deal flow.",
    badge: "VC Grade",
  },
  {
    name: "SeedInvest",
    region: "US",
    focus: "Vetted Startups",
    minInvestment: 500,
    platformFee: 7,
    dealsClosed: 280,
    totalRaised: 430,
    avgDealSize: 790,
    dueDiligenceScore: 9.2,
    successRate: 78,
    description: "Rigorous acceptance rate (<1% of applicants); strong investor protections built in.",
    badge: "Selective",
  },
  {
    name: "Crowdcube",
    region: "UK / EU",
    focus: "European Startups",
    minInvestment: 10,
    platformFee: 7,
    dealsClosed: 1200,
    totalRaised: 1600,
    avgDealSize: 620,
    dueDiligenceScore: 7.8,
    successRate: 66,
    description: "UK's leading platform under FCA regulation; notable exits include Monzo, Revolut.",
    badge: "UK Leader",
  },
];

// ── Deal flow bar chart data ──────────────────────────────────────────────────

const DEAL_FLOW_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const DEAL_FLOW_VOLUME = [
  280, 410, 690, 1240, 980, 1100, 1450, 1820,
]; // $M total Reg CF raised
const DEAL_FLOW_DEALS = [510, 820, 1300, 2200, 1800, 1950, 2300, 2750]; // # campaigns

// ── Portfolio Data ────────────────────────────────────────────────────────────

const SECTORS = ["SaaS", "Consumer", "Fintech", "Health", "CleanTech", "Hardware", "Marketplace", "Web3"];
const STAGES = ["Pre-Seed", "Seed", "Series A"];
const STATUSES: Array<PortfolioEntry["status"]> = ["Active", "Active", "Active", "Active", "Active", "Exited", "Written Off"];

function generatePortfolio(): PortfolioEntry[] {
  // Reset seed offset for portfolio (use separate counter)
  const entries: PortfolioEntry[] = [];
  const companies = [
    "NovaSpark AI", "GreenLoop", "CivicPay", "Helio Health", "BuildStack",
    "Orbit Commerce", "TerraFlow", "Lumen Bio", "ChainVault", "PocketDoc",
    "FluxEnergy", "NestNow", "TalentArc", "SafeChain", "WaveAudio",
    "DataLeaf", "SkyRoute", "MedNova", "OpenMarket", "EduPath",
    "CloudHarness", "RegenFarms", "UrbanEats", "CrowdLend", "SparkHire",
    "ZeroCarbon", "NexPay", "LeanOps", "PureWater", "HiveAI",
    "DeepMine", "VitalCheck", "CodePilot", "EcoWrap", "LogiCore",
  ];

  for (let i = 0; i < 35; i++) {
    const invested = Math.round((r() * 4.8 + 0.2) * 100) / 100; // $0.2K–$5K
    const statusIdx = Math.floor(r() * STATUSES.length);
    const status = STATUSES[statusIdx];
    let multiple = 1;
    if (status === "Written Off") {
      multiple = 0;
    } else if (status === "Exited") {
      multiple = Math.round((r() * 14 + 1) * 10) / 10;
    } else {
      multiple = Math.round((r() * 3.5 + 0.4) * 10) / 10;
    }
    entries.push({
      company: companies[i] ?? `Startup ${i + 1}`,
      sector: SECTORS[Math.floor(r() * SECTORS.length)],
      stage: STAGES[Math.floor(r() * STAGES.length)],
      invested,
      currentVal: Math.round(invested * multiple * 100) / 100,
      status,
      multiple,
      yearInvested: 2019 + Math.floor(r() * 6),
    });
  }
  return entries;
}

const PORTFOLIO = generatePortfolio();

// ── SAFE Mechanics constants ──────────────────────────────────────────────────

const SUCCESS_BY_STAGE: Record<string, number> = {
  "Pre-Seed": 8,
  Seed: 22,
  "Series A": 45,
};

const SUCCESS_BY_SECTOR: Record<string, number> = {
  SaaS: 28,
  Consumer: 14,
  Fintech: 31,
  Health: 19,
  CleanTech: 16,
  Hardware: 11,
  Marketplace: 21,
  Web3: 18,
};

// ── Helper components ─────────────────────────────────────────────────────────

function BadgeChip({
  label,
  color,
}: {
  label: string;
  color: "blue" | "purple" | "indigo" | "amber" | "orange" | "green" | "red" | "zinc";
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    indigo: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    orange: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    green: "bg-green-500/20 text-green-300 border-green-500/30",
    red: "bg-red-500/20 text-red-300 border-red-500/30",
    zinc: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", colorMap[color])}>
      {label}
    </span>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
      <Info className="w-4 h-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function WarnBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

// ── Tab 1: Regulatory Framework ───────────────────────────────────────────────

function RegulatoryTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const colorBorder: Record<string, string> = {
    blue: "border-blue-500/40",
    purple: "border-purple-500/40",
    indigo: "border-indigo-500/40",
    amber: "border-amber-500/40",
    orange: "border-orange-500/40",
  };

  const colorBg: Record<string, string> = {
    blue: "bg-blue-500/10",
    purple: "bg-purple-500/10",
    indigo: "bg-indigo-500/10",
    amber: "bg-amber-500/10",
    orange: "bg-orange-500/10",
  };

  const colorText: Record<string, string> = {
    blue: "text-blue-300",
    purple: "text-purple-300",
    indigo: "text-indigo-300",
    amber: "text-amber-300",
    orange: "text-orange-300",
  };

  return (
    <div className="space-y-6">
      {/* JOBS Act History */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-zinc-100">JOBS Act 2012 — Legislative History</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-400">
          {[
            {
              year: "April 2012",
              title: "JOBS Act Signed",
              desc: "Jumpstart Our Business Startups Act opens crowdfunding to non-accredited investors for first time; creates Title III (Reg CF) and Title IV (Reg A+).",
            },
            {
              year: "May 2016",
              title: "Reg CF Effective",
              desc: "SEC finalizes Regulation Crowdfunding rules; initial $1M cap; portals register as funding intermediaries; non-accredited investors can participate.",
            },
            {
              year: "March 2021",
              title: "Expanded Limits",
              desc: "SEC raises Reg CF cap from $1.07M to $5M; Reg A+ Tier 2 raised to $75M; temporary COVID rules made permanent.",
            },
          ].map((item) => (
            <div key={item.year} className="rounded-lg bg-zinc-800/60 p-3">
              <div className="text-blue-400 font-medium mb-1">{item.year}</div>
              <div className="text-zinc-200 font-medium mb-1">{item.title}</div>
              <div className="leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-300 px-1">Regulatory Framework Comparison</h3>
        {REG_FRAMEWORKS.map((fw) => {
          const isOpen = expanded === fw.name;
          return (
            <div
              key={fw.name}
              className={cn(
                "rounded-xl border transition-colors",
                colorBorder[fw.color],
                colorBg[fw.color]
              )}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : fw.name)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={cn("text-base font-bold", colorText[fw.color])}>{fw.name}</span>
                  <BadgeChip
                    label={fw.accreditedOnly ? "Accredited Only" : "Non-Accredited OK"}
                    color={fw.accreditedOnly ? "amber" : "green"}
                  />
                  <BadgeChip
                    label={fw.generalSolicitation ? "Gen. Solicitation" : "No Gen. Solicitation"}
                    color={fw.generalSolicitation ? "blue" : "zinc"}
                  />
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {[
                        { label: "Max Raise", value: fw.maxRaise },
                        { label: "Investor Limits", value: fw.investorLimit },
                        { label: "Disclosure Required", value: fw.disclosure },
                        { label: "Ongoing Reporting", value: fw.reporting },
                        { label: "Test the Waters", value: fw.testTheWaters ? "Allowed" : "Not allowed" },
                        { label: "General Solicitation", value: fw.generalSolicitation ? "Allowed" : "Prohibited" },
                      ].map((row) => (
                        <div key={row.label} className="rounded-lg bg-zinc-900/60 p-3">
                          <div className="text-zinc-500 mb-1">{row.label}</div>
                          <div className="text-zinc-200 leading-relaxed">{row.value}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Accredited vs Non-Accredited */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Accredited vs Non-Accredited Investor Rules</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4 space-y-2">
            <div className="text-green-400 font-semibold mb-2">Accredited Investor (SEC Rule 501)</div>
            <div className="flex items-start gap-2 text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
              <span>Income &gt; $200K individually or $300K jointly for 2 consecutive years</span>
            </div>
            <div className="flex items-start gap-2 text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
              <span>Net worth &gt; $1M excluding primary residence</span>
            </div>
            <div className="flex items-start gap-2 text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
              <span>Licensed securities professional (Series 7, 65, 82)</span>
            </div>
            <div className="flex items-start gap-2 text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
              <span>Knowledgeable employee of a private fund</span>
            </div>
            <div className="mt-2 text-zinc-500">Access: Reg D 506(b)/(c), all Reg CF/A+</div>
          </div>
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4 space-y-2">
            <div className="text-blue-400 font-semibold mb-2">Non-Accredited Investor</div>
            <div className="flex items-start gap-2 text-zinc-400">
              <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
              <span>Reg CF: Lesser of $2,500 or 5% of income/NW if both under $124K; 10% if higher; max $124K total/year</span>
            </div>
            <div className="flex items-start gap-2 text-zinc-400">
              <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
              <span>Reg A+ Tier 1/2: 10% of greater of annual income or net worth per offering</span>
            </div>
            <div className="flex items-start gap-2 text-zinc-400">
              <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
              <span>Reg D 506(b): Up to 35 sophisticated non-accredited investors</span>
            </div>
            <div className="flex items-start gap-2 text-zinc-400">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span>12-month holding period before resale for Reg CF securities</span>
            </div>
            <div className="mt-2 text-zinc-500">Platforms must verify investor attestation</div>
          </div>
        </div>
      </div>

      {/* Blue Sky Laws */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-zinc-100">State Blue Sky Laws</h3>
        </div>
        <div className="space-y-2 text-xs text-zinc-400">
          <p>
            Blue sky laws are state-level securities regulations enacted before federal law; name derives from early-1900s concern about speculative schemes having as much value as &quot;a patch of blue sky.&quot;
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {[
              {
                title: "Reg CF Preemption",
                content: "Federal law preempts state registration for Reg CF offerings. States retain anti-fraud authority but cannot require registration or qualification.",
                color: "blue",
              },
              {
                title: "Reg A+ Tier 1",
                content: "NOT preempted from state review; issuers must qualify offering in each state where they offer/sell. Significantly increases cost and complexity vs Tier 2.",
                color: "amber",
              },
              {
                title: "Reg A+ Tier 2",
                content: "Preempted from state registration for sales to qualified purchasers. States retain notice filing requirements but cannot substantively review the offering.",
                color: "green",
              },
            ].map((item) => (
              <div key={item.title} className={cn(
                "rounded-lg p-3 border",
                item.color === "blue" ? "bg-blue-500/5 border-blue-500/20" :
                item.color === "amber" ? "bg-amber-500/5 border-amber-500/20" :
                "bg-green-500/5 border-green-500/20"
              )}>
                <div className={cn(
                  "font-medium mb-1",
                  item.color === "blue" ? "text-blue-300" :
                  item.color === "amber" ? "text-amber-300" : "text-green-300"
                )}>{item.title}</div>
                <div className="leading-relaxed">{item.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <InfoBox>
        <strong>Title III vs Title IV:</strong> Title III of the JOBS Act created Reg CF (retail crowdfunding up to $5M); Title IV created Reg A+ (mini-IPO up to $75M). Both allow general solicitation and non-accredited investors, but Title IV offers far greater capital access with proportionally higher compliance burden.
      </InfoBox>
    </div>
  );
}

// ── Tab 2: Platform Ecosystem ─────────────────────────────────────────────────

function PlatformTab() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  const maxRaised = Math.max(...PLATFORMS.map((p) => p.totalRaised));
  const maxDeals = Math.max(...PLATFORMS.map((p) => p.dealsClosed));

  return (
    <div className="space-y-6">
      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PLATFORMS.map((platform) => (
          <motion.div
            key={platform.name}
            whileHover={{ scale: 1.01 }}
            onClick={() => setSelectedPlatform(selectedPlatform?.name === platform.name ? null : platform)}
            className={cn(
              "rounded-xl border p-4 cursor-pointer transition-colors",
              selectedPlatform?.name === platform.name
                ? "border-blue-500/60 bg-blue-500/10"
                : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-bold text-zinc-100">{platform.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{platform.focus}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <BadgeChip
                  label={platform.badge}
                  color={
                    platform.badge === "Top Tier" ? "blue" :
                    platform.badge === "VC Grade" ? "purple" :
                    platform.badge === "Selective" ? "green" :
                    platform.badge === "Real Estate" ? "indigo" :
                    "zinc"
                  }
                />
                <span className="text-xs text-zinc-500">{platform.region}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mt-3">
              <div className="text-center">
                <div className="text-zinc-400">Min. Invest</div>
                <div className="text-zinc-200 font-medium">${platform.minInvestment}</div>
              </div>
              <div className="text-center">
                <div className="text-zinc-400">Platform Fee</div>
                <div className="text-zinc-200 font-medium">{platform.platformFee}%</div>
              </div>
              <div className="text-center">
                <div className="text-zinc-400">DD Score</div>
                <div className={cn(
                  "font-medium",
                  platform.dueDiligenceScore >= 9 ? "text-green-400" :
                  platform.dueDiligenceScore >= 8 ? "text-blue-400" :
                  platform.dueDiligenceScore >= 7 ? "text-amber-400" : "text-red-400"
                )}>
                  {platform.dueDiligenceScore}/10
                </div>
              </div>
            </div>
            {/* Success rate bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Campaign Success Rate</span>
                <span className="text-zinc-300">{platform.successRate}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                  style={{ width: `${platform.successRate}%` }}
                />
              </div>
            </div>
            {/* Expanded description */}
            <AnimatePresence initial={false}>
              {selectedPlatform?.name === platform.name && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-700 leading-relaxed">
                    {platform.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="bg-zinc-800/60 rounded p-2">
                      <div className="text-zinc-500">Total Raised</div>
                      <div className="text-zinc-200 font-medium">
                        ${platform.totalRaised >= 1000 ? `${(platform.totalRaised / 1000).toFixed(1)}B` : `${platform.totalRaised}M`}
                      </div>
                    </div>
                    <div className="bg-zinc-800/60 rounded p-2">
                      <div className="text-zinc-500">Deals Closed</div>
                      <div className="text-zinc-200 font-medium">{platform.dealsClosed.toLocaleString()}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Deal Flow SVG Bar Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-zinc-100">US Reg CF Market Growth</h3>
        </div>
        <div className="overflow-x-auto">
          <svg width="640" height="200" viewBox="0 0 640 200" className="text-zinc-400 w-full max-w-2xl">
            {/* Y-axis gridlines and labels */}
            {[0, 500, 1000, 1500, 2000].map((v) => {
              const y = 160 - (v / 2000) * 140;
              return (
                <g key={v}>
                  <line x1={50} y1={y} x2={630} y2={y} stroke="#3f3f46" strokeWidth={1} strokeDasharray="3,3" />
                  <text x={44} y={y + 4} textAnchor="end" fontSize={9} fill="#71717a">
                    ${v}M
                  </text>
                </g>
              );
            })}
            {/* Bars */}
            {DEAL_FLOW_YEARS.map((year, i) => {
              const barW = 48;
              const gap = 30;
              const x = 58 + i * (barW + gap);
              const volH = (DEAL_FLOW_VOLUME[i] / 2000) * 140;
              const y = 160 - volH;
              return (
                <g key={year}>
                  <rect x={x} y={y} width={barW} height={volH} rx={3} fill="#3b82f6" opacity={0.7} />
                  <text x={x + barW / 2} y={175} textAnchor="middle" fontSize={9} fill="#71717a">
                    {year}
                  </text>
                  <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={8} fill="#93c5fd">
                    ${DEAL_FLOW_VOLUME[i]}M
                  </text>
                </g>
              );
            })}
            {/* Deals line */}
            {DEAL_FLOW_YEARS.map((_, i) => {
              if (i === 0) return null;
              const barW = 48;
              const gap = 30;
              const x1 = 58 + (i - 1) * (barW + gap) + barW / 2;
              const x2 = 58 + i * (barW + gap) + barW / 2;
              const y1 = 160 - (DEAL_FLOW_DEALS[i - 1] / 2750) * 130;
              const y2 = 160 - (DEAL_FLOW_DEALS[i] / 2750) * 130;
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a78bfa" strokeWidth={1.5} />
              );
            })}
            {DEAL_FLOW_YEARS.map((_, i) => {
              const barW = 48;
              const gap = 30;
              const cx = 58 + i * (barW + gap) + barW / 2;
              const cy = 160 - (DEAL_FLOW_DEALS[i] / 2750) * 130;
              return <circle key={i} cx={cx} cy={cy} r={3} fill="#a78bfa" />;
            })}
            {/* Legend */}
            <rect x={460} y={10} width={10} height={10} rx={2} fill="#3b82f6" opacity={0.7} />
            <text x={474} y={19} fontSize={9} fill="#93c5fd">Volume ($M)</text>
            <line x1={460} y1={30} x2={470} y2={30} stroke="#a78bfa" strokeWidth={1.5} />
            <circle cx={465} cy={30} r={2.5} fill="#a78bfa" />
            <text x={474} y={34} fontSize={9} fill="#c4b5fd"># Campaigns</text>
          </svg>
        </div>
      </div>

      {/* Platform Fees Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Platform Economics — Fee Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                {["Platform", "Platform Fee", "Payment Processing", "Carry / Success Fee", "Min Investment", "Due Diligence"].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {[
                ["Republic", "6%", "2–3%", "2% carry on exits", "$50", "High"],
                ["Wefunder", "7.5%", "2%", "None", "$100", "Medium"],
                ["StartEngine", "8%", "2%", "None", "$249", "Medium"],
                ["AngelList", "5% mgmt + 15% carry", "0%", "15% carry", "$1,000", "High"],
                ["SeedInvest", "7%", "2%", "5% warrant coverage", "$500", "Very High"],
                ["Fundrise", "1% AUM", "0%", "None", "$10", "Institutional"],
                ["Mainvest", "6%", "2%", "None", "$100", "Medium"],
                ["Crowdcube", "7%", "2%", "None", "£10", "Medium-High"],
              ].map(([name, fee, processing, carry, min, dd]) => (
                <tr key={name} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                  <td className="py-2 pr-4 font-medium text-zinc-100">{name}</td>
                  <td className="py-2 pr-4 text-amber-400">{fee}</td>
                  <td className="py-2 pr-4">{processing}</td>
                  <td className="py-2 pr-4 text-zinc-400">{carry}</td>
                  <td className="py-2 pr-4">{min}</td>
                  <td className="py-2 pr-4">
                    <BadgeChip
                      label={dd}
                      color={
                        dd === "Very High" || dd === "Institutional" ? "green" :
                        dd === "High" ? "blue" : "zinc"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Due Diligence Comparison */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Platform Due Diligence Quality</h3>
        </div>
        <div className="space-y-2">
          {[...PLATFORMS].sort((a, b) => b.dueDiligenceScore - a.dueDiligenceScore).map((p) => (
            <div key={p.name} className="flex items-center gap-3 text-xs">
              <div className="w-24 text-zinc-300 shrink-0">{p.name}</div>
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    p.dueDiligenceScore >= 9 ? "bg-green-500" :
                    p.dueDiligenceScore >= 8 ? "bg-blue-500" :
                    p.dueDiligenceScore >= 7 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${(p.dueDiligenceScore / 10) * 100}%` }}
                />
              </div>
              <div className="w-8 text-right text-zinc-400">{p.dueDiligenceScore}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Deal Analysis ──────────────────────────────────────────────────────

function DealAnalysisTab() {
  const [valCap, setValCap] = useState(8000000);
  const [discount, setDiscount] = useState(20);
  const [nextRoundVal, setNextRoundVal] = useState(20000000);
  const [investmentAmount, setInvestmentAmount] = useState(10000);

  const safeResults = useMemo(() => {
    // Post-money SAFE mechanics
    const capConversionPrice = valCap / 10000000; // per share assumption: 10M fully diluted
    const discountConversionPrice = (nextRoundVal / 10000000) * (1 - discount / 100);
    const effectiveConversionPrice = Math.min(capConversionPrice, discountConversionPrice);
    const sharesPurchased = investmentAmount / effectiveConversionPrice;
    const ownershipPct = (sharesPurchased / (10000000 + sharesPurchased)) * 100;

    // Without SAFE (direct equity at next round price)
    const nextRoundPrice = nextRoundVal / 10000000;
    const sharesWithoutSafe = investmentAmount / nextRoundPrice;
    const ownershipWithout = (sharesWithoutSafe / (10000000 + sharesWithoutSafe)) * 100;

    const dilutionSaved = ownershipPct - ownershipWithout;

    return {
      capConversionPrice: capConversionPrice.toFixed(4),
      discountConversionPrice: discountConversionPrice.toFixed(4),
      effectiveConversionPrice: effectiveConversionPrice.toFixed(4),
      sharesPurchased: Math.round(sharesPurchased).toLocaleString(),
      ownershipPct: ownershipPct.toFixed(3),
      ownershipWithout: ownershipWithout.toFixed(3),
      dilutionSaved: dilutionSaved.toFixed(3),
      usingCap: capConversionPrice <= discountConversionPrice,
    };
  }, [valCap, discount, nextRoundVal, investmentAmount]);

  return (
    <div className="space-y-6">
      {/* Valuation Challenges */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Startup Valuation Challenges</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            {
              challenge: "No Revenue History",
              impact: "Cannot use DCF or comparable transaction multiples; rely on team quality, TAM, and traction proxies",
              severity: "high",
            },
            {
              challenge: "No Product Yet",
              impact: "Pre-product valuations purely speculative; pivot risk unquantified; IP/patent filing status critical",
              severity: "high",
            },
            {
              challenge: "Illiquidity Discount",
              impact: "Private co shares carry 20–40% discount vs equivalent public peers (DLOM — Discount for Lack of Marketability)",
              severity: "medium",
            },
            {
              challenge: "Option Pool Shuffle",
              impact: "Founders often expand option pool pre-round; effectively dilutes existing investors before new investment calculation",
              severity: "medium",
            },
            {
              challenge: "Information Asymmetry",
              impact: "Founders know more than investors; crowdfunding reduces VC quality filter; adverse selection risk",
              severity: "high",
            },
            {
              challenge: "CAP Table Complexity",
              impact: "SAFEs + convertibles + warrants + options create complex waterfall; true dilution visible only at liquidation",
              severity: "medium",
            },
          ].map((item) => (
            <div
              key={item.challenge}
              className={cn(
                "rounded-lg border p-3",
                item.severity === "high"
                  ? "bg-red-500/5 border-red-500/20"
                  : "bg-amber-500/5 border-amber-500/20"
              )}
            >
              <div className={cn(
                "font-medium mb-1",
                item.severity === "high" ? "text-red-400" : "text-amber-400"
              )}>
                {item.challenge}
              </div>
              <div className="text-zinc-400 leading-relaxed">{item.impact}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SAFE vs Convertible Note vs Equity */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-zinc-100">SAFE vs Convertible Note vs Equity Round</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                {["Feature", "SAFE", "Convertible Note", "Equity Round"].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-zinc-300 space-y-1">
              {[
                ["Instrument type", "Equity agreement", "Debt instrument", "Preferred equity"],
                ["Interest accrual", "None", "5–8% typical", "N/A"],
                ["Maturity date", "None", "12–24 months", "N/A"],
                ["Conversion trigger", "Next equity round", "Next round or maturity", "Immediate"],
                ["Valuation cap", "Post-money (YC standard)", "Pre-money typical", "Fixed pre/post"],
                ["Discount rate", "10–30% common", "10–30% common", "N/A"],
                ["Pro-rata rights", "Often included", "Often included", "Negotiated"],
                ["MFN clause", "Common (YC SAFE)", "Less common", "N/A"],
                ["Legal complexity", "Low", "Medium", "High"],
                ["Investor protection", "Weak", "Moderate (debt priority)", "Strong (preference stack)"],
              ].map(([feat, safe, conv, equity]) => (
                <tr key={feat} className="border-b border-zinc-800/60">
                  <td className="py-1.5 pr-4 text-zinc-400 font-medium">{feat}</td>
                  <td className="py-1.5 pr-4 text-blue-300">{safe}</td>
                  <td className="py-1.5 pr-4 text-purple-300">{conv}</td>
                  <td className="py-1.5 pr-4 text-green-300">{equity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SAFE Dilution Calculator */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-zinc-100">SAFE Dilution Calculator</h3>
          <span className="text-xs text-zinc-500 ml-auto">Post-Money YC SAFE</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-zinc-400">
                <span>Valuation Cap</span>
                <span className="text-zinc-200">${(valCap / 1000000).toFixed(1)}M</span>
              </div>
              <input
                type="range"
                min={1000000}
                max={50000000}
                step={500000}
                value={valCap}
                onChange={(e) => setValCap(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-zinc-600 mt-0.5">
                <span>$1M</span><span>$50M</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-zinc-400">
                <span>Discount Rate</span>
                <span className="text-zinc-200">{discount}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-zinc-600 mt-0.5">
                <span>0%</span><span>40%</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-zinc-400">
                <span>Next Round Valuation</span>
                <span className="text-zinc-200">${(nextRoundVal / 1000000).toFixed(0)}M</span>
              </div>
              <input
                type="range"
                min={2000000}
                max={100000000}
                step={1000000}
                value={nextRoundVal}
                onChange={(e) => setNextRoundVal(Number(e.target.value))}
                className="w-full accent-green-500"
              />
              <div className="flex justify-between text-zinc-600 mt-0.5">
                <span>$2M</span><span>$100M</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-zinc-400">
                <span>Your Investment</span>
                <span className="text-zinc-200">${investmentAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={100}
                max={50000}
                step={100}
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-zinc-600 mt-0.5">
                <span>$100</span><span>$50K</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3 text-xs">
            <div className="rounded-lg bg-zinc-800/60 p-3 space-y-2">
              <div className="text-zinc-400 font-medium mb-2">Conversion Price</div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Cap conversion price</span>
                <span className="text-blue-300">${safeResults.capConversionPrice}/share</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Discount conversion price</span>
                <span className="text-purple-300">${safeResults.discountConversionPrice}/share</span>
              </div>
              <div className="flex justify-between border-t border-zinc-700 pt-2">
                <span className="text-zinc-400 font-medium">Effective price (lower of)</span>
                <span className={cn(
                  "font-bold",
                  safeResults.usingCap ? "text-blue-400" : "text-purple-400"
                )}>
                  ${safeResults.effectiveConversionPrice}/share
                  <span className="text-zinc-500 font-normal ml-1">
                    ({safeResults.usingCap ? "cap" : "discount"})
                  </span>
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-zinc-800/60 p-3 space-y-2">
              <div className="text-zinc-400 font-medium mb-2">Ownership Analysis</div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Shares received</span>
                <span className="text-zinc-200">{safeResults.sharesPurchased}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Ownership (with SAFE)</span>
                <span className="text-green-400 font-bold">{safeResults.ownershipPct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Ownership (no SAFE, next round price)</span>
                <span className="text-zinc-400">{safeResults.ownershipWithout}%</span>
              </div>
              <div className="flex justify-between border-t border-zinc-700 pt-2">
                <span className="text-zinc-400 font-medium">SAFE advantage</span>
                <span className="text-green-400 font-bold">+{safeResults.dilutionSaved}% ownership</span>
              </div>
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-zinc-400">
              <span className="text-amber-300 font-medium">Anti-dilution:</span> Broad-based weighted average (BBWA) is standard in institutional rounds; prevents existing SAFE holders from being wiped out in down-round scenarios. Full-ratchet anti-dilution is rare and extremely investor-favorable.
            </div>
          </div>
        </div>
      </div>

      <WarnBox>
        <strong>SAFE ≠ equity today.</strong> SAFEs are not shares — they convert into equity at a future triggering event. If the company never raises a priced round (and raises only bridge notes), SAFEs may sit unconverted indefinitely. Always check conversion triggers and dissolution provisions.
      </WarnBox>
    </div>
  );
}

// ── Tab 4: Portfolio Strategy ─────────────────────────────────────────────────

function PortfolioTab() {
  const totalInvested = PORTFOLIO.reduce((s, p) => s + p.invested, 0);
  const totalValue = PORTFOLIO.reduce((s, p) => s + p.currentVal, 0);
  const active = PORTFOLIO.filter((p) => p.status === "Active");
  const exited = PORTFOLIO.filter((p) => p.status === "Exited");
  const writtenOff = PORTFOLIO.filter((p) => p.status === "Written Off");
  const tvpi = totalValue / totalInvested;
  const moic = totalValue / totalInvested;

  // Sector breakdown for SVG
  const sectorMap: Record<string, number> = {};
  PORTFOLIO.forEach((p) => {
    sectorMap[p.sector] = (sectorMap[p.sector] ?? 0) + p.invested;
  });
  const sectorEntries = Object.entries(sectorMap).sort((a, b) => b[1] - a[1]);
  const sectorColors = [
    "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
    "#06b6d4", "#ec4899", "#84cc16",
  ];

  // Cumulative SVG (pie approximation using stacked bar)
  let cumPct = 0;
  const totalSector = sectorEntries.reduce((s, [, v]) => s + v, 0);

  // Power law illustration data
  const dealReturns = useMemo(() => {
    const out: number[] = [];
    // 30 deals: few big winners, many losers/flats
    for (let i = 0; i < 30; i++) {
      const v = rand();
      if (v > 0.93) out.push(15 + rand() * 25); // ~2 home runs
      else if (v > 0.8) out.push(3 + rand() * 5); // ~4 doubles
      else if (v > 0.5) out.push(0.8 + rand() * 1.2); // ~9 singles
      else out.push(rand() * 0.5); // ~15 losses/flats
    }
    return out.sort((a, b) => b - a);
  }, []);

  const maxReturn = Math.max(...dealReturns);

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Invested", value: `$${totalInvested.toFixed(1)}K`, color: "text-zinc-200" },
          { label: "Portfolio Value", value: `$${totalValue.toFixed(1)}K`, color: totalValue >= totalInvested ? "text-green-400" : "text-red-400" },
          { label: "TVPI / MOIC", value: `${moic.toFixed(2)}x`, color: moic >= 1 ? "text-green-400" : "text-red-400" },
          { label: "Active / Exited / WO", value: `${active.length} / ${exited.length} / ${writtenOff.length}`, color: "text-zinc-300" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center">
            <div className="text-xs text-zinc-500 mb-1">{stat.label}</div>
            <div className={cn("text-lg font-bold", stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Power Law Illustration */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Power Law Returns — Why 30+ Deals Matter</h3>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          In venture, ~67% of deals return less than 1x. The top 5–10% of deals drive 80–90% of total returns. With fewer than 30 deals, your portfolio likely misses all home runs.
        </p>
        <svg width="600" height="140" viewBox="0 0 600 140" className="w-full max-w-2xl">
          {/* Y gridlines */}
          {[0, 5, 10, 15, 20, 30].map((v) => {
            const y = 120 - (v / maxReturn) * 100;
            return (
              <g key={v}>
                <line x1={36} y1={y} x2={596} y2={y} stroke="#27272a" strokeWidth={1} />
                <text x={30} y={y + 3} textAnchor="end" fontSize={8} fill="#52525b">{v}x</text>
              </g>
            );
          })}
          {dealReturns.map((ret, i) => {
            const barW = 14;
            const x = 38 + i * (barW + 5);
            const h = (ret / maxReturn) * 100;
            const y = 120 - h;
            const color = ret >= 10 ? "#22c55e" : ret >= 3 ? "#3b82f6" : ret >= 1 ? "#78716c" : "#ef4444";
            return (
              <rect key={i} x={x} y={y} width={barW} height={h} rx={2} fill={color} opacity={0.8} />
            );
          })}
          {/* Legend */}
          {[
            { color: "#22c55e", label: "Home run (>10x)" },
            { color: "#3b82f6", label: "Strong (3–10x)" },
            { color: "#78716c", label: "Modest (<3x)" },
            { color: "#ef4444", label: "Loss (<1x)" },
          ].map((item, i) => (
            <g key={item.label}>
              <rect x={38 + i * 130} y={128} width={8} height={8} rx={1} fill={item.color} />
              <text x={50 + i * 130} y={135} fontSize={7.5} fill="#71717a">{item.label}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Sector Breakdown + Portfolio Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sector bar */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Portfolio by Sector</h3>
          </div>
          <div className="space-y-2">
            {sectorEntries.map(([sector, val], i) => (
              <div key={sector} className="text-xs">
                <div className="flex justify-between mb-0.5">
                  <span className="text-zinc-400">{sector}</span>
                  <span className="text-zinc-300">{((val / totalSector) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(val / totalSector) * 100}%`,
                      backgroundColor: sectorColors[i % sectorColors.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Rate */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Success Rate by Stage / Sector</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <div className="text-zinc-500 mb-2 font-medium">By Stage (reach Series B+)</div>
              {Object.entries(SUCCESS_BY_STAGE).map(([stage, pct]) => (
                <div key={stage} className="flex items-center gap-2 mb-1.5">
                  <div className="w-20 text-zinc-400 shrink-0">{stage}</div>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-8 text-right text-zinc-400">{pct}%</div>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <div className="text-zinc-500 mb-2 font-medium">By Sector (5-yr success)</div>
              {Object.entries(SUCCESS_BY_SECTOR).slice(0, 4).map(([sector, pct]) => (
                <div key={sector} className="flex items-center gap-2 mb-1.5">
                  <div className="w-20 text-zinc-400 shrink-0">{sector}</div>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-8 text-right text-zinc-400">{pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Market */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Secondary Liquidity Options</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            {
              name: "Forge Global",
              type: "Marketplace",
              minTrade: "$250K",
              focus: "Late-stage private companies",
              discount: "10–35% vs primary",
              notes: "Institutional-grade; buyer/seller matching; requires accredited status",
              color: "blue",
            },
            {
              name: "Nasdaq Private Market",
              type: "Structured Tender",
              minTrade: "$50K",
              focus: "Employee & early investor liquidity",
              discount: "5–20% vs 409A",
              notes: "Company-sponsored tender offers; structured windows; ROFR applies",
              color: "purple",
            },
            {
              name: "StartEngine Secondary",
              type: "Reg CF Secondary",
              minTrade: "$500",
              focus: "Reg CF crowdfunded shares",
              discount: "20–50% vs original price",
              notes: "Retail-accessible; lower liquidity; 12-month holding period required first",
              color: "green",
            },
            {
              name: "EquityZen",
              type: "SPV Marketplace",
              minTrade: "$10K",
              focus: "Pre-IPO tech companies",
              discount: "15–30% vs last round",
              notes: "Structured as SPVs; most deals are accredited only; 3–5% platform fee",
              color: "indigo",
            },
            {
              name: "Carta Liquidity",
              type: "Cap Table Integrated",
              minTrade: "$25K",
              focus: "Carta-managed companies",
              discount: "Variable",
              notes: "Embedded in Carta; company controls liquidity window; ROFR waiver needed",
              color: "amber",
            },
            {
              name: "Equity Auction",
              type: "Bilateral OTC",
              minTrade: "$1K+",
              focus: "Any private shares",
              discount: "0–60% (highly variable)",
              notes: "Direct buyer-seller; no guarantee of matching; legal complexity; ROFR risk",
              color: "orange",
            },
          ].map((market) => (
            <div
              key={market.name}
              className={cn(
                "rounded-lg border p-3",
                market.color === "blue" ? "bg-blue-500/5 border-blue-500/20" :
                market.color === "purple" ? "bg-purple-500/5 border-purple-500/20" :
                market.color === "green" ? "bg-green-500/5 border-green-500/20" :
                market.color === "indigo" ? "bg-indigo-500/5 border-indigo-500/20" :
                market.color === "amber" ? "bg-amber-500/5 border-amber-500/20" :
                "bg-orange-500/5 border-orange-500/20"
              )}
            >
              <div className={cn(
                "font-semibold mb-1",
                market.color === "blue" ? "text-blue-300" :
                market.color === "purple" ? "text-purple-300" :
                market.color === "green" ? "text-green-300" :
                market.color === "indigo" ? "text-indigo-300" :
                market.color === "amber" ? "text-amber-300" : "text-orange-300"
              )}>{market.name}</div>
              <div className="text-zinc-500 mb-2">{market.type}</div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-500">Min Trade</span>
                <span className="text-zinc-300">{market.minTrade}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-zinc-500">Typical Discount</span>
                <span className="text-amber-400">{market.discount}</span>
              </div>
              <div className="text-zinc-500 leading-relaxed">{market.notes}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Simulated Portfolio (35 Deals)</h3>
          <span className="text-xs text-zinc-500 ml-auto">Seed: 875</span>
        </div>
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-zinc-900">
              <tr className="border-b border-zinc-800 text-zinc-500">
                {["Company", "Sector", "Stage", "Invested ($K)", "Current ($K)", "Multiple", "Status", "Year"].map((h) => (
                  <th key={h} className="text-left pb-2 pr-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {PORTFOLIO.map((p) => (
                <tr key={p.company} className="border-b border-zinc-800/40 hover:bg-zinc-800/30">
                  <td className="py-1.5 pr-3 font-medium text-zinc-100">{p.company}</td>
                  <td className="py-1.5 pr-3 text-zinc-400">{p.sector}</td>
                  <td className="py-1.5 pr-3">
                    <BadgeChip
                      label={p.stage}
                      color={p.stage === "Pre-Seed" ? "zinc" : p.stage === "Seed" ? "blue" : "green"}
                    />
                  </td>
                  <td className="py-1.5 pr-3">${p.invested.toFixed(1)}</td>
                  <td className={cn(
                    "py-1.5 pr-3",
                    p.status === "Written Off" ? "text-red-400" :
                    p.currentVal > p.invested ? "text-green-400" : "text-zinc-400"
                  )}>
                    ${p.currentVal.toFixed(1)}
                  </td>
                  <td className={cn(
                    "py-1.5 pr-3 font-bold",
                    p.multiple >= 5 ? "text-green-400" :
                    p.multiple >= 2 ? "text-blue-400" :
                    p.multiple >= 1 ? "text-zinc-300" : "text-red-400"
                  )}>
                    {p.multiple.toFixed(1)}x
                  </td>
                  <td className="py-1.5 pr-3">
                    <BadgeChip
                      label={p.status}
                      color={p.status === "Active" ? "zinc" : p.status === "Exited" ? "green" : "red"}
                    />
                  </td>
                  <td className="py-1.5 pr-3 text-zinc-500">{p.yearInvested}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failure management */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Write-Off Management & Tax Strategy</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-400">
          {[
            {
              title: "Section 1244 Stock",
              content: "Losses on qualifying small business stock (up to $50K/$100K MFJ) deducted as ordinary losses, not capital losses — can offset W-2 income directly.",
            },
            {
              title: "QSBS Exclusion (Section 1202)",
              content: "Gains from qualified small business stock held 5+ years may be 100% excluded from federal capital gains tax (up to $10M per company).",
            },
            {
              title: "Loss Harvesting",
              content: "Write off portfolio losers in high-income years to offset gains; worthlessness deduction requires company dissolution or documented abandonment.",
            },
            {
              title: "Diversification Math",
              content: "With 30 deals at $500 each ($15K total), the top 2-3 winners typically return 5–10x+ on the whole portfolio. Concentration kills equity crowdfunding returns.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg bg-zinc-800/60 p-3">
              <div className="text-zinc-200 font-medium mb-1">{item.title}</div>
              <div className="leading-relaxed">{item.content}</div>
            </div>
          ))}
        </div>
      </div>

      <InfoBox>
        <strong>Historical context:</strong> Republic reported ~$2B raised across 700+ campaigns as of 2024; Wefunder topped $800M across 1,500+ campaigns. Early cohort data (2016–2020) shows median returns near 0x for non-accredited crowdfunding investors — reinforcing the need for broad diversification and long holding horizons.
      </InfoBox>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CrowdfundingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100">Equity Crowdfunding & Alternative Financing</h1>
        </div>
        <p className="text-sm text-zinc-500 ml-11">
          Reg CF / Reg A+ / Reg D mechanics, platform economics, SAFE deal analysis, and portfolio construction for private company investing.
        </p>
      </div>

      <Tabs defaultValue="regulatory" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800 h-auto flex-wrap gap-1 p-1">
          {[
            { value: "regulatory", label: "Regulatory Framework", icon: Shield },
            { value: "platforms", label: "Platform Ecosystem", icon: Globe },
            { value: "deals", label: "Deal Analysis", icon: Layers },
            { value: "portfolio", label: "Portfolio Strategy", icon: PieChart },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-1.5 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="regulatory" className="data-[state=inactive]:hidden mt-0">
          <RegulatoryTab />
        </TabsContent>
        <TabsContent value="platforms" className="data-[state=inactive]:hidden mt-0">
          <PlatformTab />
        </TabsContent>
        <TabsContent value="deals" className="data-[state=inactive]:hidden mt-0">
          <DealAnalysisTab />
        </TabsContent>
        <TabsContent value="portfolio" className="data-[state=inactive]:hidden mt-0">
          <PortfolioTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
