"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Layers,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Calculator,
  FileText,
  PieChart,
  Award,
  Lock,
  Unlock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 702006;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const RAND_POOL: number[] = [];
for (let i = 0; i < 300; i++) RAND_POOL.push(rand());
let randIdx = 0;
const r = () => RAND_POOL[randIdx++ % RAND_POOL.length];

// ── Formatting helpers ─────────────────────────────────────────────────────────
function fmtM(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`;
  return `$${n.toFixed(0)}M`;
}
function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}
function fmtK(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

// ── Funding Stage data ─────────────────────────────────────────────────────────
interface FundingStage {
  name: string;
  shortName: string;
  valMin: number; // $M
  valMax: number;
  checkMin: number;
  checkMax: number;
  dilution: number; // typical %
  investors: string[];
  description: string;
  color: string;
  milestones: string[];
}

const FUNDING_STAGES: FundingStage[] = [
  {
    name: "Pre-Seed",
    shortName: "Pre-S",
    valMin: 0.5,
    valMax: 3,
    checkMin: 0.05,
    checkMax: 0.5,
    dilution: 10,
    investors: ["Friends & Family", "Angel Investors", "Pre-seed funds"],
    description:
      "Earliest stage funding to validate the idea and build an MVP. Founders typically give up 5–15% equity.",
    color: "#6366f1",
    milestones: ["Idea validation", "Early prototype", "Co-founder hire"],
  },
  {
    name: "Seed",
    shortName: "Seed",
    valMin: 3,
    valMax: 15,
    checkMin: 0.5,
    checkMax: 3,
    dilution: 15,
    investors: ["Angel investors", "Micro-VCs", "Accelerators (YC, Techstars)"],
    description:
      "First institutional round. Product-market fit exploration, initial revenue, small team of 3–10.",
    color: "#8b5cf6",
    milestones: ["MVP launch", "First 100 customers", "~$500K ARR"],
  },
  {
    name: "Series A",
    shortName: "A",
    valMin: 15,
    valMax: 60,
    checkMin: 3,
    checkMax: 15,
    dilution: 20,
    investors: ["Tier 1 VCs", "Growth funds", "Corporate VCs"],
    description:
      "Scale proven product. Strong unit economics, 10–50 employees, clear path to profitability.",
    color: "#a855f7",
    milestones: ["Product-market fit", "$1M–$5M ARR", "Repeatable sales"],
  },
  {
    name: "Series B",
    shortName: "B",
    valMin: 60,
    valMax: 200,
    checkMin: 15,
    checkMax: 50,
    dilution: 15,
    investors: ["Growth VCs", "PE crossover funds", "Hedge funds"],
    description:
      "Scale operations, expand into new markets, build out the management team.",
    color: "#d946ef",
    milestones: ["$5M–$30M ARR", "Market leadership", "International expansion"],
  },
  {
    name: "Series C",
    shortName: "C",
    valMin: 200,
    valMax: 800,
    checkMin: 50,
    checkMax: 150,
    dilution: 10,
    investors: ["Late-stage VCs", "Private equity", "Sovereign wealth funds"],
    description:
      "Dominate the market, M&A activity, prep for IPO or secondary liquidity.",
    color: "#ec4899",
    milestones: ["$30M–$100M ARR", "Profitable or near-profitable", "Clear IPO path"],
  },
  {
    name: "Series D+",
    shortName: "D+",
    valMin: 800,
    valMax: 5000,
    checkMin: 100,
    checkMax: 500,
    dilution: 5,
    investors: ["PE firms", "Mutual funds", "Sovereign wealth", "Family offices"],
    description:
      "Bridge to IPO, large strategic acquisitions, or helping late-stage companies extend runway.",
    color: "#f43f5e",
    milestones: ["$100M+ ARR", "Path to $1B+ valuation", "IPO readiness"],
  },
  {
    name: "IPO",
    shortName: "IPO",
    valMin: 1000,
    valMax: 100000,
    checkMin: 200,
    checkMax: 5000,
    dilution: 15,
    investors: ["Public markets", "Institutional investors", "Retail investors"],
    description:
      "Company lists on stock exchange. Early shareholders get liquidity; new capital raised via public offering.",
    color: "#f97316",
    milestones: [
      "SEC registration (S-1)",
      "Roadshow",
      "Exchange listing",
      "Lock-up period (180d)",
    ],
  },
];

// ── Cap Table types ─────────────────────────────────────────────────────────────
interface ShareholderRow {
  id: string;
  name: string;
  type: "founder" | "employee" | "investor" | "optionPool";
  shares: number;
  color: string;
}

interface Round {
  name: string;
  preMoneyVal: number; // $M
  investment: number; // $M
  newShares: number;
  pricePerShare: number;
}

const INITIAL_SHAREHOLDERS: ShareholderRow[] = [
  { id: "f1", name: "Founder A", type: "founder", shares: 4_000_000, color: "#6366f1" },
  { id: "f2", name: "Founder B", type: "founder", shares: 3_000_000, color: "#8b5cf6" },
  { id: "pool0", name: "Option Pool (pre)", type: "optionPool", shares: 1_000_000, color: "#64748b" },
];

const ROUNDS_PRESET: Round[] = [
  { name: "Seed", preMoneyVal: 8, investment: 2, newShares: 2_000_000, pricePerShare: 1.0 },
  { name: "Series A", preMoneyVal: 30, investment: 8, newShares: 3_200_000, pricePerShare: 2.5 },
  { name: "Series B", preMoneyVal: 90, investment: 20, newShares: 2_800_000, pricePerShare: 7.14 },
];

// ── Term Sheet data ─────────────────────────────────────────────────────────────
interface TermItem {
  term: string;
  icon: React.ReactNode;
  definition: string;
  founderImpact: string;
  example: string;
  risk: "low" | "medium" | "high";
}

const TERM_ITEMS: TermItem[] = [
  {
    term: "Pre-Money Valuation",
    icon: <DollarSign className="w-4 h-4" />,
    definition:
      "The company's agreed value BEFORE the new investment is added. Determines how much equity investors receive.",
    founderImpact:
      "Higher pre-money = less dilution for founders. Always negotiate this first.",
    example:
      "VC invests $5M at $20M pre-money → post-money = $25M → VC owns 20% ($5M / $25M).",
    risk: "medium",
  },
  {
    term: "Post-Money Valuation",
    icon: <DollarSign className="w-4 h-4" />,
    definition: "Pre-money valuation + new investment = post-money. Investor ownership = investment / post-money.",
    founderImpact:
      "Investors sometimes quote post-money — be careful not to confuse the two.",
    example:
      "$20M pre + $5M investment = $25M post-money. VC gets 20%, founders retain 80% (before option pool).",
    risk: "low",
  },
  {
    term: "Option Pool Shuffle",
    icon: <Users className="w-4 h-4" />,
    definition:
      "Investors require an option pool (10–20%) to be created BEFORE their investment, diluting only founders.",
    founderImpact:
      "If pre-money is quoted post-shuffle, founders lose extra equity. Negotiate post-money option pool expansion.",
    example:
      "VCs offer $10M pre-money but require 15% option pool. Effective pre-money for founders: $10M × 85% = $8.5M.",
    risk: "high",
  },
  {
    term: "Liquidation Preference",
    icon: <Award className="w-4 h-4" />,
    definition:
      "Investors get their money back first (1x, 2x, or participating) before common stockholders in any exit.",
    founderImpact:
      "1x non-participating is founder-friendly. 2x or participating preferences can wipe out founder returns in small exits.",
    example:
      "2x participating pref: $5M invested → first $10M goes to VC, then VC participates in remainder. Common shareholders receive almost nothing in a $15M exit.",
    risk: "high",
  },
  {
    term: "Anti-Dilution",
    icon: <Lock className="w-4 h-4" />,
    definition:
      "Protects investors if future rounds happen at a lower valuation (down round). Full ratchet is most aggressive, broad-based weighted average is standard.",
    founderImpact:
      "Broad-based weighted average is acceptable. Full ratchet severely dilutes founders in down rounds.",
    example:
      "Series A at $10/share. If Series B is $5/share (down round), broad-based WA adjusts Series A to ~$7.50, while full ratchet resets to $5 — doubling VC share count.",
    risk: "high",
  },
  {
    term: "Pro-Rata Rights",
    icon: <Unlock className="w-4 h-4" />,
    definition:
      "Right (not obligation) to maintain ownership percentage by investing in future rounds.",
    founderImpact:
      "Standard and founder-friendly. Signals investor commitment. Super pro-rata (>ownership%) can crowd out new investors.",
    example:
      "VC owns 15%. Series B raises $20M. Pro-rata allows VC to invest $3M (15% of $20M) to maintain 15%.",
    risk: "low",
  },
  {
    term: "Protective Provisions",
    icon: <AlertTriangle className="w-4 h-4" />,
    definition:
      "Investor veto rights over major decisions: future equity issuance, acquisitions, asset sales, debt above a threshold.",
    founderImpact:
      "Standard in VC deals. Problems arise when multiple investor classes have conflicting vetoes.",
    example:
      "Board approval required for any acquisition offer. VC can block a $50M acqui-hire if they want a bigger outcome.",
    risk: "medium",
  },
  {
    term: "Drag-Along Rights",
    icon: <ArrowRight className="w-4 h-4" />,
    definition:
      "Majority shareholders can force minority shareholders to approve a sale of the company.",
    founderImpact:
      "Protects majority from minority holdouts. Can be used against founders if VCs hold majority.",
    example:
      "Board + 60% of preferred votes to sell company — even if founders object, they must sell their shares.",
    risk: "medium",
  },
];

// ── Valuation method data ──────────────────────────────────────────────────────
interface ValMethod {
  name: string;
  stage: string;
  description: string;
  steps: string[];
  pros: string[];
  cons: string[];
  color: string;
}

const VAL_METHODS: ValMethod[] = [
  {
    name: "VC Method",
    stage: "Early stage",
    description:
      "Back-calculate from expected exit value. VC targets 10–30x return over 5–7 years.",
    steps: [
      "Estimate exit value (comparable IPOs / M&A at year 5–7)",
      "Apply expected return multiple (10–30x for seed, 5–10x for Series A)",
      "Post-money = Exit Value / Target Multiple",
      "Pre-money = Post-money − Investment",
    ],
    pros: ["Simple", "Market-calibrated", "Used by most VCs"],
    cons: ["Highly sensitive to exit assumptions", "Ignores operational fundamentals"],
    color: "#6366f1",
  },
  {
    name: "Comparable Rounds",
    stage: "All stages",
    description:
      "Benchmark against recent funding rounds of similar companies (sector, ARR, growth rate).",
    steps: [
      "Identify 5–10 comparable companies at same stage",
      "Compute median EV/ARR or EV/Revenue multiples",
      "Apply to target company revenue or ARR",
      "Adjust ±20% for growth premium/discount",
    ],
    pros: ["Market-based", "Transparent", "Easy to explain"],
    cons: ["Data is often private/lagged", "Comparables may not be truly comparable"],
    color: "#8b5cf6",
  },
  {
    name: "Revenue Multiple",
    stage: "Series A–C",
    description:
      "Enterprise value as a multiple of current or forward ARR. SaaS companies typically 5–20x ARR.",
    steps: [
      "Determine current ARR or forward ARR",
      "Benchmark sector multiple (SaaS: 8–15x, Fintech: 5–10x, Consumer: 3–6x)",
      "Adjust for growth rate, NRR, margin",
      "EV = ARR × Multiple",
    ],
    pros: ["Intuitive", "Linked to business metrics", "Easy to negotiate"],
    cons: ["Multiple can compress rapidly in market downturns", "Ignores profitability"],
    color: "#d946ef",
  },
  {
    name: "DCF (Late Stage)",
    stage: "Series C+",
    description:
      "Discount projected free cash flows to present value. Used when company approaches profitability.",
    steps: [
      "Project 5–10 year free cash flow",
      "Determine terminal value (exit multiple or Gordon Growth)",
      "Select WACC (15–30% for growth companies)",
      "PV = Σ FCF/(1+r)^t + TV/(1+r)^n",
    ],
    pros: ["Intrinsic value based", "Used by crossover investors", "Most rigorous"],
    cons: ["Highly sensitive to terminal value / discount rate", "Hard to project accurately"],
    color: "#f43f5e",
  },
];

// ── Employee Options data ──────────────────────────────────────────────────────
interface OptionType {
  name: string;
  fullName: string;
  taxTreatment: string;
  who: string;
  amtLimit: string;
  holdingPeriod: string;
  onExercise: string;
  onSale: string;
  bestFor: string;
  color: string;
}

const OPTION_TYPES: OptionType[] = [
  {
    name: "ISO",
    fullName: "Incentive Stock Option",
    taxTreatment: "Favorable (capital gains if held)",
    who: "Employees only (US)",
    amtLimit: "$100K exercisable per year at FMV",
    holdingPeriod: "2y from grant, 1y from exercise for LTCG",
    onExercise: "No regular income tax (AMT may apply)",
    onSale: "Long-term capital gains if holding periods met",
    bestFor: "Early employees expecting big upside",
    color: "#6366f1",
  },
  {
    name: "NSO",
    fullName: "Non-Qualified Stock Option",
    taxTreatment: "Ordinary income on spread at exercise",
    who: "Employees, consultants, board members, anyone",
    amtLimit: "No limit",
    holdingPeriod: "No special requirement",
    onExercise: "Spread (FMV − Strike) taxed as ordinary income",
    onSale: "Capital gains on post-exercise appreciation",
    bestFor: "Advisors, consultants, non-US employees",
    color: "#a855f7",
  },
];

const VESTING_SCHEDULES = [
  { label: "4-year / 1-year cliff", cliff: 12, total: 48, monthly: true },
  { label: "3-year / 6-month cliff", cliff: 6, total: 36, monthly: true },
  { label: "2-year / no cliff", cliff: 0, total: 24, monthly: true },
];

// ── Shared UI helpers ──────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      {children}
    </h2>
  );
}

function InfoBox({
  title,
  children,
  variant = "info",
}: {
  title?: string;
  children: React.ReactNode;
  variant?: "info" | "warn" | "success";
}) {
  const cls =
    variant === "warn"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
      : variant === "success"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : "border-blue-500/40 bg-blue-500/10 text-blue-200";
  return (
    <div className={cn("rounded-lg border p-3 text-sm", cls)}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Funding Stages
// ══════════════════════════════════════════════════════════════════════════════
function FundingStagesTab() {
  const [selected, setSelected] = useState<FundingStage>(FUNDING_STAGES[1]);

  // Funnel chart — each stage is narrower from left to right (horizontal funnel)
  const funnelW = 700;
  const funnelH = 260;
  const barH = 26;
  const gap = 4;
  const maxBarW = funnelW - 60;
  const totalStages = FUNDING_STAGES.length;

  return (
    <div className="space-y-6">
      {/* Funnel SVG */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wide font-medium">
          Startup Funding Funnel — % Companies Reaching Each Stage
        </p>
        <svg
          viewBox={`0 0 ${funnelW} ${funnelH}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {FUNDING_STAGES.map((stage, i) => {
            const survival = [100, 42, 18, 7, 3, 1.2, 0.4];
            const pct = survival[i] ?? 0.4;
            const barW = (pct / 100) * maxBarW;
            const x = (maxBarW - barW) / 2 + 30;
            const y = i * (barH + gap) + 10;
            const isSelected = selected.name === stage.name;
            return (
              <g
                key={stage.name}
                className="cursor-pointer"
                onClick={() => setSelected(stage)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={4}
                  fill={stage.color}
                  opacity={isSelected ? 1 : 0.55}
                  className="transition-all duration-200"
                />
                <text
                  x={x + 8}
                  y={y + barH / 2 + 4.5}
                  fill="white"
                  fontSize={11}
                  fontWeight="600"
                >
                  {stage.name}
                </text>
                <text
                  x={x + barW - 6}
                  y={y + barH / 2 + 4.5}
                  fill="white"
                  fontSize={10}
                  textAnchor="end"
                  opacity={0.85}
                >
                  {pct >= 1 ? `${pct}%` : `${pct}%`} of startups
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stage detail cards row */}
      <div className="grid grid-cols-7 gap-2">
        {FUNDING_STAGES.map((stage) => (
          <button
            key={stage.name}
            onClick={() => setSelected(stage)}
            className={cn(
              "rounded-lg border p-2 text-center transition-all text-xs font-medium",
              selected.name === stage.name
                ? "border-transparent text-white"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
            )}
            style={
              selected.name === stage.name
                ? { backgroundColor: stage.color + "30", borderColor: stage.color }
                : {}
            }
          >
            <div
              className="w-3 h-3 rounded-full mx-auto mb-1"
              style={{ backgroundColor: stage.color }}
            />
            {stage.shortName}
          </button>
        ))}
      </div>

      {/* Selected stage detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border bg-zinc-900 p-5"
          style={{ borderColor: selected.color + "55" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{selected.name}</h3>
              <p className="text-sm text-zinc-400 mt-1 max-w-xl">{selected.description}</p>
            </div>
            <Badge
              className="text-white text-xs px-3 py-1 mt-1"
              style={{ backgroundColor: selected.color + "99" }}
            >
              {fmtPct(selected.dilution)} typical dilution
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Valuation Range", value: `${fmtM(selected.valMin)} – ${fmtM(selected.valMax)}` },
              { label: "Check Size", value: `${fmtM(selected.checkMin)} – ${fmtM(selected.checkMax)}` },
              { label: "Typical Dilution", value: fmtPct(selected.dilution) },
              { label: "Investor Types", value: selected.investors.length.toString() },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg bg-zinc-800 border border-zinc-700 p-3"
              >
                <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2 font-medium">
                Investor Types
              </p>
              <div className="space-y-1">
                {selected.investors.map((inv) => (
                  <div key={inv} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    {inv}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2 font-medium">
                Key Milestones
              </p>
              <div className="space-y-1">
                {selected.milestones.map((m) => (
                  <div key={m} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Target className="w-3.5 h-3.5 flex-shrink-0" style={{ color: selected.color }} />
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Summary stats row */}
      <div className="grid grid-cols-3 gap-3">
        <InfoBox title="Survival Rate" variant="info">
          Only ~0.4% of seed-funded companies ever reach IPO. Most fail or get acquired.
        </InfoBox>
        <InfoBox title="Time Between Rounds" variant="info">
          Typical gap: 12–18 months. Raising too quickly signals desperation; too slowly loses momentum.
        </InfoBox>
        <InfoBox title="Dilution Math" variant="warn">
          After Pre-Seed → Seed → A → B → IPO, founders often retain 15–25% of the company.
        </InfoBox>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Cap Table Simulator
// ══════════════════════════════════════════════════════════════════════════════

interface CapTableState {
  shareholders: ShareholderRow[];
  completedRounds: (Round & { investorId: string; investorName: string; color: string })[];
}

function CapTableTab() {
  const [state, setState] = useState<CapTableState>({
    shareholders: INITIAL_SHAREHOLDERS.map((s) => ({ ...s })),
    completedRounds: [],
  });
  const [roundIdx, setRoundIdx] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const totalShares = useMemo(
    () => state.shareholders.reduce((acc, s) => acc + s.shares, 0),
    [state.shareholders]
  );

  const ROUND_COLORS = ["#6366f1", "#a855f7", "#ec4899", "#f97316"];

  function applyRound() {
    if (roundIdx >= ROUNDS_PRESET.length) return;
    const round = ROUNDS_PRESET[roundIdx];
    const investorId = `inv-${roundIdx}`;
    const investorName = `${round.name} Investor`;
    const color = ROUND_COLORS[roundIdx % ROUND_COLORS.length];

    setState((prev) => ({
      shareholders: [
        ...prev.shareholders,
        {
          id: investorId,
          name: investorName,
          type: "investor",
          shares: round.newShares,
          color,
        },
      ],
      completedRounds: [
        ...prev.completedRounds,
        { ...round, investorId, investorName, color },
      ],
    }));
    setRoundIdx((i) => i + 1);
  }

  function resetCap() {
    setState({
      shareholders: INITIAL_SHAREHOLDERS.map((s) => ({ ...s })),
      completedRounds: [],
    });
    setRoundIdx(0);
  }

  const nextRound = roundIdx < ROUNDS_PRESET.length ? ROUNDS_PRESET[roundIdx] : null;

  // Waterfall SVG — show ownership % evolution across rounds
  const waterW = 660;
  const waterH = 180;
  const stages = useMemo(() => {
    const result: { name: string; slices: { name: string; pct: number; color: string }[] }[] = [];

    // Founding
    const founding = INITIAL_SHAREHOLDERS;
    const totalFounding = founding.reduce((a, s) => a + s.shares, 0);
    result.push({
      name: "Founding",
      slices: founding.map((s) => ({
        name: s.name,
        pct: (s.shares / totalFounding) * 100,
        color: s.color,
      })),
    });

    // After each completed round
    let cumShareholders = [...INITIAL_SHAREHOLDERS];
    for (const round of state.completedRounds) {
      cumShareholders = [
        ...cumShareholders,
        { id: round.investorId, name: round.investorName, type: "investor" as const, shares: round.newShares, color: round.color },
      ];
      const total = cumShareholders.reduce((a, s) => a + s.shares, 0);
      result.push({
        name: `After ${round.name}`,
        slices: cumShareholders.map((s) => ({
          name: s.name,
          pct: (s.shares / total) * 100,
          color: s.color,
        })),
      });
    }
    return result;
  }, [state.completedRounds]);

  const barW = Math.floor((waterW - 20) / Math.max(stages.length, 1));

  return (
    <div className="space-y-6">
      {/* Dilution waterfall */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wide font-medium">
          Ownership Dilution Waterfall
        </p>
        <svg viewBox={`0 0 ${waterW} ${waterH}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {stages.map((stage, si) => {
            const x = si * barW + 10;
            let yOffset = 0;
            return (
              <g key={stage.name}>
                {stage.slices.map((slice, idx) => {
                  const h = (slice.pct / 100) * (waterH - 30);
                  const y = waterH - 30 - yOffset - h;
                  yOffset += h;
                  return (
                    <rect
                      key={`${stage.name}-${idx}`}
                      x={x}
                      y={y}
                      width={barW - 6}
                      height={h}
                      fill={slice.color}
                      opacity={0.85}
                      rx={2}
                    />
                  );
                })}
                <text
                  x={x + (barW - 6) / 2}
                  y={waterH - 6}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize={9}
                >
                  {stage.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Cap table */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <p className="text-sm font-semibold text-white">Cap Table</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              {totalShares.toLocaleString()} total shares
            </span>
            <button
              onClick={resetCap}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {["Shareholder", "Type", "Shares", "Ownership %", "Post-round Value"].map((h) => (
                <th key={h} className="text-left text-xs text-zinc-500 font-medium px-4 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.shareholders.map((sh) => {
              const pct = (sh.shares / totalShares) * 100;
              const lastRound = state.completedRounds[state.completedRounds.length - 1];
              const pps = lastRound ? lastRound.pricePerShare : 1.0;
              const value = sh.shares * pps;
              const isExpanded = expandedRow === sh.id;
              return (
                <>
                  <tr
                    key={sh.id}
                    className="border-b border-zinc-800/60 hover:bg-zinc-800/40 cursor-pointer transition-colors"
                    onClick={() => setExpandedRow(isExpanded ? null : sh.id)}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: sh.color }}
                        />
                        <span className="text-white font-medium">{sh.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                        style={{ borderColor: sh.color + "66", color: sh.color }}
                      >
                        {sh.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300 font-mono text-xs">
                      {sh.shares.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden max-w-[80px]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: sh.color }}
                          />
                        </div>
                        <span className="text-zinc-300 text-xs font-mono">
                          {fmtPct(pct, 2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300 text-xs font-mono">
                      {fmtK(value)}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${sh.id}-detail`} className="bg-zinc-800/30">
                      <td colSpan={5} className="px-6 py-3 text-xs text-zinc-400">
                        <strong className="text-zinc-300">Dilution history:</strong> Started with {sh.type === "investor" ? "0" : sh.shares.toLocaleString()} shares.
                        {sh.type === "investor" && ` Received ${sh.shares.toLocaleString()} shares as part of funding round.`}
                        {sh.type === "founder" && ` Current dilution from ${state.completedRounds.length} round(s) completed so far.`}
                        {sh.type === "optionPool" && " Reserved for future employee grants."}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Apply next round */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
        {nextRound ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white mb-1">
                Next: {nextRound.name} Round
              </p>
              <p className="text-xs text-zinc-400">
                Pre-money: {fmtM(nextRound.preMoneyVal)} · Investment: {fmtM(nextRound.investment)} ·{" "}
                {nextRound.newShares.toLocaleString()} new shares @ ${nextRound.pricePerShare.toFixed(2)}
              </p>
            </div>
            <button
              onClick={applyRound}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              Apply Round <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-zinc-300 font-medium">All preset rounds completed!</p>
            <p className="text-xs text-zinc-500 mt-1">
              Founders now own ~{fmtPct(
                (state.shareholders
                  .filter((s) => s.type === "founder")
                  .reduce((a, s) => a + s.shares, 0) /
                  totalShares) *
                  100,
                1
              )} combined
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {state.shareholders.map((sh) => (
          <div key={sh.id} className="flex items-center gap-1.5 text-xs text-zinc-400">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sh.color }} />
            {sh.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Term Sheet Key Terms
// ══════════════════════════════════════════════════════════════════════════════
function TermSheetTab() {
  const [openTerm, setOpenTerm] = useState<string | null>(TERM_ITEMS[0].term);

  const riskColor = (risk: TermItem["risk"]) =>
    risk === "high" ? "text-rose-400" : risk === "medium" ? "text-amber-400" : "text-emerald-400";
  const riskBg = (risk: TermItem["risk"]) =>
    risk === "high"
      ? "border-rose-500/40 bg-rose-500/10"
      : risk === "medium"
      ? "border-amber-500/40 bg-amber-500/10"
      : "border-emerald-500/40 bg-emerald-500/10";

  return (
    <div className="space-y-5">
      <InfoBox title="How to use this section" variant="info">
        Term sheets are legal documents that outline the key terms of a funding round. Understanding
        each clause before signing can save founders millions. Click any term to expand.
      </InfoBox>

      {/* Worked example box */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-400" />
          Worked Example: Series A Term Sheet
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { label: "Pre-money valuation", value: "$18M" },
            { label: "Investment", value: "$4.5M" },
            { label: "Post-money valuation", value: "$22.5M" },
            { label: "Investor ownership", value: "20%" },
            { label: "Option pool (pre-money)", value: "15% (shuffle)" },
            { label: "Effective pre-money", value: "$15.3M" },
            { label: "Liquidation pref", value: "1x non-participating" },
            { label: "Anti-dilution", value: "Broad-based WA" },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-800 rounded-lg p-2.5 border border-zinc-700">
              <p className="text-zinc-500 mb-1">{item.label}</p>
              <p className="font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-zinc-400 space-y-1">
          <p>
            <span className="text-amber-400 font-medium">Option pool shuffle impact:</span> The 15%
            pool is carved out of the pre-money, reducing effective pre-money from $18M to ~$15.3M.
            Founders lose an additional 2.7% beyond the stated 20% dilution.
          </p>
          <p>
            <span className="text-emerald-400 font-medium">1x non-participating pref:</span> If
            company sells for $30M, VCs choose: take $4.5M back, OR convert to common and take 20% ×
            $30M = $6M. They convert. Founders get 80% = $24M.
          </p>
        </div>
      </div>

      {/* Term accordion */}
      <div className="space-y-2">
        {TERM_ITEMS.map((item) => {
          const isOpen = openTerm === item.term;
          return (
            <div
              key={item.term}
              className={cn(
                "rounded-xl border transition-all overflow-hidden",
                isOpen ? "border-indigo-500/50 bg-zinc-900" : "border-zinc-800 bg-zinc-900"
              )}
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/40 transition-colors"
                onClick={() => setOpenTerm(isOpen ? null : item.term)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-indigo-400">{item.icon}</div>
                  <span className="text-sm font-semibold text-white">{item.term}</span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full border font-medium",
                      riskBg(item.risk),
                      riskColor(item.risk)
                    )}
                  >
                    {item.risk} risk
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 text-sm">
                      <p className="text-zinc-300">{item.definition}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-lg bg-zinc-800 border border-zinc-700 p-3">
                          <p className="text-xs text-zinc-500 mb-1 font-medium">Founder Impact</p>
                          <p className="text-zinc-300 text-xs">{item.founderImpact}</p>
                        </div>
                        <div className="rounded-lg bg-zinc-800 border border-zinc-700 p-3">
                          <p className="text-xs text-zinc-500 mb-1 font-medium">Example</p>
                          <p className="text-zinc-300 text-xs">{item.example}</p>
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
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Valuation Methods
// ══════════════════════════════════════════════════════════════════════════════
function ValuationTab() {
  const [selected, setSelected] = useState<ValMethod>(VAL_METHODS[0]);
  const [exitVal, setExitVal] = useState(200); // $M
  const [targetMult, setTargetMult] = useState(15);
  const [revArr, setRevArr] = useState(8); // $M ARR
  const [revMult, setRevMult] = useState(10);

  // VC Method calc
  const vcPostMoney = Math.round((exitVal / targetMult) * 10) / 10;
  const investAmt = 5; // fixed $5M for example
  const vcPreMoney = Math.round((vcPostMoney - investAmt) * 10) / 10;
  const vcOwnership = Math.round((investAmt / vcPostMoney) * 1000) / 10;

  // Revenue multiple calc
  const rmEV = Math.round(revArr * revMult * 10) / 10;

  // Sensitivity table for VC method
  const multiples = [8, 10, 15, 20, 30];
  const exits = [100, 200, 500, 1000, 2000];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {VAL_METHODS.map((m) => (
          <button
            key={m.name}
            onClick={() => setSelected(m)}
            className={cn(
              "rounded-xl border p-3 text-left transition-all",
              selected.name === m.name
                ? "text-white"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
            )}
            style={
              selected.name === m.name
                ? { backgroundColor: m.color + "20", borderColor: m.color + "80" }
                : {}
            }
          >
            <p className="text-sm font-semibold mb-1" style={selected.name === m.name ? { color: m.color } : {}}>
              {m.name}
            </p>
            <p className="text-xs text-zinc-500">{m.stage}</p>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="rounded-xl border bg-zinc-900 p-5"
          style={{ borderColor: selected.color + "55" }}
        >
          <h3 className="text-base font-bold text-white mb-1">{selected.name}</h3>
          <p className="text-sm text-zinc-400 mb-4">{selected.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-2">Steps</p>
              <ol className="space-y-1.5">
                {selected.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-zinc-300">
                    <span
                      className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: selected.color }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-1.5">Pros</p>
                {selected.pros.map((p) => (
                  <div key={p} className="flex items-start gap-1.5 text-xs text-zinc-300 mb-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" /> {p}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-1.5">Cons</p>
                {selected.cons.map((c) => (
                  <div key={c} className="flex items-start gap-1.5 text-xs text-zinc-300 mb-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" /> {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive calculator for VC method */}
          {selected.name === "VC Method" && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 space-y-4">
              <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                VC Method Calculator
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    Expected Exit Value: {fmtM(exitVal)}
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={5000}
                    step={50}
                    value={exitVal}
                    onChange={(e) => setExitVal(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    Target Return Multiple: {targetMult}x
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={1}
                    value={targetMult}
                    onChange={(e) => setTargetMult(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Max Post-Money", value: fmtM(vcPostMoney) },
                  { label: "Max Pre-Money", value: fmtM(Math.max(0, vcPreMoney)) },
                  { label: "Investor Ownership", value: fmtPct(vcOwnership) },
                ].map((item) => (
                  <div key={item.label} className="bg-zinc-900 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive calculator for Revenue Multiple */}
          {selected.name === "Revenue Multiple" && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 space-y-4">
              <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                Revenue Multiple Calculator
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    ARR: {fmtM(revArr)}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={revArr}
                    onChange={(e) => setRevArr(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    EV/ARR Multiple: {revMult}x
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={revMult}
                    onChange={(e) => setRevMult(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>
              <div className="bg-zinc-900 rounded-lg p-3 text-center">
                <p className="text-xs text-zinc-500 mb-1">Implied Enterprise Value</p>
                <p className="text-2xl font-bold text-purple-400">{fmtM(rmEV)}</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sensitivity table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-sm font-semibold text-white mb-3">
          VC Method Sensitivity Table — Pre-Money ($M)
        </p>
        <p className="text-xs text-zinc-500 mb-3">
          Assumes $5M investment. Each cell: (Exit Value / Multiple) − $5M
        </p>
        <div className="overflow-x-auto">
          <table className="text-xs min-w-full">
            <thead>
              <tr>
                <th className="text-left text-zinc-500 font-medium px-2 py-1.5 border-b border-zinc-800">
                  Exit → / Mult ↓
                </th>
                {exits.map((e) => (
                  <th key={e} className="text-center text-zinc-400 font-medium px-3 py-1.5 border-b border-zinc-800">
                    {fmtM(e)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {multiples.map((mult) => (
                <tr key={mult} className="border-b border-zinc-800/50">
                  <td className="text-zinc-400 font-medium px-2 py-1.5">{mult}x</td>
                  {exits.map((exit) => {
                    const preMoney = exit / mult - investAmt;
                    const isPos = preMoney > 0;
                    return (
                      <td
                        key={exit}
                        className={cn(
                          "text-center px-3 py-1.5 font-mono",
                          isPos ? "text-emerald-400" : "text-rose-400"
                        )}
                      >
                        {isPos ? fmtM(preMoney) : "—"}
                      </td>
                    );
                  })}
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
// TAB 5 — Employee Options
// ══════════════════════════════════════════════════════════════════════════════
function EmployeeOptionsTab() {
  const [strikePrice, setStrikePrice] = useState(2.5);
  const [currentFMV, setCurrentFMV] = useState(8.0);
  const [numOptions, setNumOptions] = useState(50000);
  const [vestingIdx, setVestingIdx] = useState(0);
  const [monthsWorked, setMonthsWorked] = useState(24);
  const [isoMode, setIsoMode] = useState(true);

  const schedule = VESTING_SCHEDULES[vestingIdx];
  const vested = useMemo(() => {
    if (monthsWorked < schedule.cliff) return 0;
    const vestedMonths = Math.min(monthsWorked, schedule.total);
    return Math.floor((vestedMonths / schedule.total) * numOptions);
  }, [monthsWorked, schedule, numOptions]);

  const spread = Math.max(0, currentFMV - strikePrice);
  const intrinsicValue = vested * spread;
  const taxRate = isoMode ? 0.2 : 0.37; // simplified
  const taxOnExercise = isoMode ? 0 : vested * spread * taxRate;
  const afterTaxValue = intrinsicValue - taxOnExercise;

  // Vesting timeline SVG
  const svgW = 500;
  const svgH = 80;

  const vestingBars = useMemo(() => {
    const bars: { month: number; cumPct: number; isVested: boolean }[] = [];
    for (let m = 0; m <= schedule.total; m += 3) {
      let cumPct = 0;
      if (m >= schedule.cliff) {
        cumPct = Math.min(m / schedule.total, 1) * 100;
      }
      bars.push({ month: m, cumPct, isVested: m <= monthsWorked });
    }
    return bars;
  }, [schedule, monthsWorked]);

  const barCount = vestingBars.length;
  const barItemW = Math.floor(svgW / Math.max(barCount, 1));

  return (
    <div className="space-y-6">
      {/* ISO vs NSO comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OPTION_TYPES.map((opt) => (
          <div
            key={opt.name}
            className={cn(
              "rounded-xl border p-4 transition-all cursor-pointer",
              (opt.name === "ISO") === isoMode
                ? "border-indigo-500/60 bg-indigo-500/10"
                : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
            )}
            onClick={() => setIsoMode(opt.name === "ISO")}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-white">{opt.name}</p>
                <p className="text-xs text-zinc-400">{opt.fullName}</p>
              </div>
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: opt.color + "88",
                  color: opt.color,
                  backgroundColor: opt.color + "15",
                }}
              >
                {opt.taxTreatment}
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              {[
                { label: "Who can receive", value: opt.who },
                { label: "Annual limit", value: opt.amtLimit },
                { label: "Tax on exercise", value: opt.onExercise },
                { label: "Tax on sale", value: opt.onSale },
                { label: "Best for", value: opt.bestFor },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-2">
                  <span className="text-zinc-500 flex-shrink-0">{row.label}:</span>
                  <span className="text-zinc-300 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Options calculator */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-400" />
          Option Value Calculator
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">
              Strike Price (409A): ${strikePrice.toFixed(2)}
            </label>
            <input
              type="range"
              min={0.1}
              max={20}
              step={0.1}
              value={strikePrice}
              onChange={(e) => setStrikePrice(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">
              Current FMV: ${currentFMV.toFixed(2)}
            </label>
            <input
              type="range"
              min={0.5}
              max={100}
              step={0.5}
              value={currentFMV}
              onChange={(e) => setCurrentFMV(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">
              Options Granted: {numOptions.toLocaleString()}
            </label>
            <input
              type="range"
              min={1000}
              max={500000}
              step={1000}
              value={numOptions}
              onChange={(e) => setNumOptions(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Vested Options", value: vested.toLocaleString(), sub: `of ${numOptions.toLocaleString()} total` },
            { label: "Spread (FMV−Strike)", value: `$${spread.toFixed(2)}`, sub: "per share", highlight: spread > 0 },
            { label: "Gross Intrinsic Value", value: fmtK(intrinsicValue), sub: "before tax", highlight: intrinsicValue > 0 },
            {
              label: isoMode ? "After-Tax Value (LTCG)" : "After Ordinary Income Tax",
              value: fmtK(afterTaxValue),
              sub: isoMode ? "if held 1yr post-exercise" : "federal ~37%",
              highlight: afterTaxValue > 0,
            },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
              <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
              <p
                className={cn(
                  "text-sm font-bold",
                  item.highlight ? "text-emerald-400" : "text-white"
                )}
              >
                {item.value}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vesting schedule visualizer */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Vesting Schedule Visualizer</p>
          <div className="flex gap-2">
            {VESTING_SCHEDULES.map((sch, i) => (
              <button
                key={sch.label}
                onClick={() => setVestingIdx(i)}
                className={cn(
                  "text-xs px-2 py-1 rounded border transition-colors",
                  vestingIdx === i
                    ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                    : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                )}
              >
                {sch.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-400 mb-1 block">
            Months Worked: {monthsWorked} months ({(monthsWorked / 12).toFixed(1)} years)
          </label>
          <input
            type="range"
            min={0}
            max={schedule.total}
            step={1}
            value={monthsWorked}
            onChange={(e) => setMonthsWorked(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {vestingBars.map((bar, i) => {
            const x = i * barItemW + 2;
            const maxH = svgH - 24;
            const h = (bar.cumPct / 100) * maxH;
            const y = svgH - 20 - h;
            return (
              <g key={bar.month}>
                <rect
                  x={x}
                  y={y}
                  width={barItemW - 4}
                  height={h}
                  rx={2}
                  fill={bar.isVested ? "#6366f1" : "#334155"}
                  opacity={bar.isVested ? 0.9 : 0.5}
                />
                {i % 4 === 0 && (
                  <text x={x + (barItemW - 4) / 2} y={svgH - 4} textAnchor="middle" fill="#6b7280" fontSize={8}>
                    {bar.month}m
                  </text>
                )}
              </g>
            );
          })}
          {/* Cliff marker */}
          {schedule.cliff > 0 && (
            <>
              <line
                x1={(schedule.cliff / 3) * barItemW}
                y1={0}
                x2={(schedule.cliff / 3) * barItemW}
                y2={svgH - 20}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="3,3"
              />
              <text
                x={(schedule.cliff / 3) * barItemW + 3}
                y={12}
                fill="#f59e0b"
                fontSize={8}
              >
                Cliff
              </text>
            </>
          )}
        </svg>

        <div className="flex gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-indigo-500" /> Vested
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-700" /> Unvested
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border border-dashed border-amber-400" /> Cliff date
          </div>
        </div>
      </div>

      {/* 409A and secondary market notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InfoBox title="409A Valuation" variant="info">
          Independent appraisal required to set strike price for options. Must be updated every 12
          months or after material events (new funding round, acquisition letter).
        </InfoBox>
        <InfoBox title="Exercise Window" variant="warn">
          Most companies give 90 days post-termination to exercise. Some offer 5–10 year windows.
          Early exercise (83(b) election) can reset capital gains clock before vesting.
        </InfoBox>
        <InfoBox title="Secondary Markets" variant="success">
          Employees at unicorns can sell vested shares via Nasdaq Private Market, Forge Global, or
          CartaX. Typically requires company approval and 60–90 day transfer process.
        </InfoBox>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function StartupFundingPage() {
  // Consume some random values for visual variety (not used in render but ensures seed advances)
  const _noise = useMemo(() => Array.from({ length: 10 }, () => r()), []);
  void _noise;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Startup Funding</h1>
              <p className="text-sm text-zinc-400">
                Funding rounds, cap tables, term sheets, valuation methods, employee equity
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-3">
            {[
              { label: "Funding stages", icon: <TrendingUp className="w-3.5 h-3.5" />, color: "text-indigo-400" },
              { label: "Cap table sim", icon: <PieChart className="w-3.5 h-3.5" />, color: "text-purple-400" },
              { label: "Term sheet guide", icon: <FileText className="w-3.5 h-3.5" />, color: "text-pink-400" },
              { label: "Valuation methods", icon: <Calculator className="w-3.5 h-3.5" />, color: "text-rose-400" },
              { label: "Employee equity", icon: <Users className="w-3.5 h-3.5" />, color: "text-orange-400" },
            ].map((chip) => (
              <div
                key={chip.label}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-zinc-700 bg-zinc-900",
                  chip.color
                )}
              >
                {chip.icon}
                {chip.label}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stages">
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 flex-wrap h-auto gap-1 p-1">
            {[
              { value: "stages", label: "Funding Stages", icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { value: "captable", label: "Cap Table", icon: <PieChart className="w-3.5 h-3.5" /> },
              { value: "termsheet", label: "Term Sheet", icon: <FileText className="w-3.5 h-3.5" /> },
              { value: "valuation", label: "Valuation", icon: <Calculator className="w-3.5 h-3.5" /> },
              { value: "options", label: "Employee Options", icon: <Award className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="stages" className="data-[state=inactive]:hidden">
            <SectionTitle>
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Funding Stages & Funnel
            </SectionTitle>
            <FundingStagesTab />
          </TabsContent>

          <TabsContent value="captable" className="data-[state=inactive]:hidden">
            <SectionTitle>
              <PieChart className="w-5 h-5 text-purple-400" />
              Cap Table Simulator
            </SectionTitle>
            <CapTableTab />
          </TabsContent>

          <TabsContent value="termsheet" className="data-[state=inactive]:hidden">
            <SectionTitle>
              <FileText className="w-5 h-5 text-pink-400" />
              Term Sheet Key Terms
            </SectionTitle>
            <TermSheetTab />
          </TabsContent>

          <TabsContent value="valuation" className="data-[state=inactive]:hidden">
            <SectionTitle>
              <Calculator className="w-5 h-5 text-rose-400" />
              Valuation Methods
            </SectionTitle>
            <ValuationTab />
          </TabsContent>

          <TabsContent value="options" className="data-[state=inactive]:hidden">
            <SectionTitle>
              <Award className="w-5 h-5 text-orange-400" />
              Employee Stock Options
            </SectionTitle>
            <EmployeeOptionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
