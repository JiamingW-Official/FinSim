"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  BarChart3,
  Target,
  Users,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  BookOpen,
  Briefcase,
  DollarSign,
  Scale,
  Layers,
  Activity,
  Shield,
  Eye,
  Building2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ─────────────────────────────────────────────────────────────
let s = 881;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate all random values we need at module init
const _r: number[] = [];
for (let i = 0; i < 200; i++) _r.push(rand());
let _ri = 0;
const r = () => _r[_ri++ % _r.length];

// ── Types ────────────────────────────────────────────────────────────────────
interface ResearchStep {
  id: string;
  title: string;
  duration: string;
  icon: React.ReactNode;
  description: string;
  outputs: string[];
  color: string;
}

interface ReportType {
  name: string;
  pages: string;
  trigger: string;
  sections: string[];
  color: string;
}

interface ScenarioAssumption {
  label: string;
  bear: string;
  base: string;
  bull: string;
}

interface ValuationMethod {
  name: string;
  shortName: string;
  weight: number;
  impliedPrice: number;
  description: string;
  color: string;
}

interface PeerCompany {
  ticker: string;
  price: number;
  mktCap: number;
  pe: number;
  evEbitda: number;
  evRev: number;
  growth: number;
  margin: number;
  isTarget?: boolean;
}

interface CareerStage {
  title: string;
  years: string;
  side: "buy" | "sell";
  skills: string[];
}

// ── Research Process Data ────────────────────────────────────────────────────
const RESEARCH_STEPS: ResearchStep[] = [
  {
    id: "scuttlebutt",
    title: "Scuttlebutt & Industry Checks",
    duration: "1–2 weeks",
    icon: <Search className="w-4 h-4" />,
    description:
      "Bottom-up qualitative research: talk to customers, suppliers, competitors, ex-employees. Understand competitive dynamics before touching a spreadsheet.",
    outputs: [
      "Customer win/loss rates",
      "Pricing power signals",
      "Competitor positioning",
      "Channel inventory levels",
    ],
    color: "blue",
  },
  {
    id: "management",
    title: "Management & IR Meetings",
    duration: "3–5 days",
    icon: <Briefcase className="w-4 h-4" />,
    description:
      "Non-deal roadshow sessions, earnings calls, and one-on-one meetings with CFO/CEO. Assess execution track record, capital allocation discipline, and guidance credibility.",
    outputs: [
      "Capital allocation priorities",
      "Guidance framework",
      "KPI targets",
      "Strategic roadmap",
    ],
    color: "purple",
  },
  {
    id: "expert",
    title: "Expert Network Calls",
    duration: "Ongoing",
    icon: <Users className="w-4 h-4" />,
    description:
      "Gerson Lehrman, AlphaSights, Tegus transcripts. Industry veterans, former executives, regulators. Validate theses and stress-test assumptions.",
    outputs: [
      "Technical due diligence",
      "Regulatory outlook",
      "Industry cost curve",
      "M&A intelligence",
    ],
    color: "emerald",
  },
  {
    id: "secondary",
    title: "Secondary Research",
    duration: "3–5 days",
    icon: <BookOpen className="w-4 h-4" />,
    description:
      "SEC filings (10-K/10-Q/8-K/DEF14A), industry trade publications, conference presentations, earnings transcripts, patent filings, and sell-side initiation reports.",
    outputs: [
      "Historical financials",
      "Risk factor evolution",
      "Compensation structure",
      "Segment reporting",
    ],
    color: "orange",
  },
  {
    id: "model",
    title: "Financial Model Build",
    duration: "1 week",
    icon: <BarChart3 className="w-4 h-4" />,
    description:
      "3-statement integrated model: income statement drives balance sheet which drives cash flow. Revenue built bottom-up by segment/product/geography with volume × price × mix drivers.",
    outputs: [
      "5-year P&L forecast",
      "FCF bridge",
      "Scenario analysis",
      "Sensitivity tables",
    ],
    color: "cyan",
  },
  {
    id: "valuation",
    title: "Valuation & Price Target",
    duration: "2–3 days",
    icon: <Target className="w-4 h-4" />,
    description:
      "Multi-method valuation: DCF anchors intrinsic value, EV/EBITDA and P/E multiples anchor relative value. Sum-of-parts for conglomerates. 12-month price target blends methods by conviction weight.",
    outputs: [
      "DCF intrinsic value",
      "Peer group multiples",
      "PT derivation",
      "Rating rationale",
    ],
    color: "rose",
  },
];

const REPORT_TYPES: ReportType[] = [
  {
    name: "Initiation of Coverage",
    pages: "40–80 pages",
    trigger: "New company added to coverage universe",
    sections: [
      "Thesis summary",
      "Industry primer",
      "Competitive analysis",
      "Full financial model",
      "Valuation",
      "Risks",
      "Appendix",
    ],
    color: "blue",
  },
  {
    name: "Earnings Update",
    pages: "8–15 pages",
    trigger: "Quarterly results vs. estimates",
    sections: [
      "Beat/miss summary",
      "Key metrics vs. consensus",
      "Management commentary",
      "Estimate revisions",
      "PT change if any",
    ],
    color: "emerald",
  },
  {
    name: "Sector Preview",
    pages: "10–20 pages",
    trigger: "Before key sector events or earnings season",
    sections: [
      "Macro setup",
      "Consensus expectations",
      "Bull/bear setups per name",
      "Trade ideas",
      "Catalyst calendar",
    ],
    color: "purple",
  },
  {
    name: "Quick Take / Flash Note",
    pages: "1–3 pages",
    trigger: "Breaking news, data point, or data release",
    sections: [
      "Headline reaction",
      "Impact assessment",
      "Estimate impact",
      "Recommendation unchanged/revised",
    ],
    color: "orange",
  },
];

// ── Financial Model Data ─────────────────────────────────────────────────────
const SCENARIO_ASSUMPTIONS: ScenarioAssumption[] = [
  {
    label: "Revenue Growth (Y1)",
    bear: "4.0%",
    base: "9.5%",
    bull: "15.2%",
  },
  {
    label: "EBITDA Margin",
    bear: "18.5%",
    base: "23.8%",
    bull: "28.1%",
  },
  {
    label: "Terminal Growth Rate",
    bear: "1.5%",
    base: "2.5%",
    bull: "3.5%",
  },
  {
    label: "WACC",
    bear: "11.0%",
    base: "9.5%",
    bull: "8.0%",
  },
  {
    label: "Exit EV/EBITDA",
    bear: "10.0x",
    base: "13.5x",
    bull: "17.0x",
  },
  {
    label: "Capex (% Revenue)",
    bear: "8.0%",
    base: "5.5%",
    bull: "3.5%",
  },
];

interface SensCell {
  wacc: number;
  tgr: number;
  value: number;
}

// ── Valuation Data ───────────────────────────────────────────────────────────
const VALUATION_METHODS: ValuationMethod[] = [
  {
    name: "Discounted Cash Flow",
    shortName: "DCF",
    weight: 35,
    impliedPrice: 142,
    description: "10-year FCF + terminal value discounted at WACC 9.5%",
    color: "#3b82f6",
  },
  {
    name: "EV/EBITDA Peer Comps",
    shortName: "EV/EBITDA",
    weight: 25,
    impliedPrice: 128,
    description: "13.5x forward EBITDA, 15% discount to peer median of 15.9x",
    color: "#8b5cf6",
  },
  {
    name: "P/E Peer Comps",
    shortName: "P/E",
    weight: 20,
    impliedPrice: 135,
    description: "19.2x forward EPS, in-line with 5-year historical average",
    color: "#06b6d4",
  },
  {
    name: "EV/Revenue",
    shortName: "EV/Rev",
    weight: 10,
    impliedPrice: 118,
    description: "2.8x NTM revenue, 10% discount for lower margin profile",
    color: "#10b981",
  },
  {
    name: "Sum-of-Parts",
    shortName: "SOP",
    weight: 10,
    impliedPrice: 155,
    description: "Core biz + new segment each valued independently",
    color: "#f59e0b",
  },
];

const PEER_COMPANIES: PeerCompany[] = [
  {
    ticker: "TGT",
    price: 122,
    mktCap: 28.4,
    pe: 18.1,
    evEbitda: 12.3,
    evRev: 2.4,
    growth: 7.2,
    margin: 22.1,
    isTarget: true,
  },
  {
    ticker: "PEER1",
    price: 89,
    mktCap: 45.2,
    pe: 22.4,
    evEbitda: 15.8,
    evRev: 3.1,
    growth: 11.3,
    margin: 26.4,
  },
  {
    ticker: "PEER2",
    price: 215,
    mktCap: 67.8,
    pe: 26.3,
    evEbitda: 17.2,
    evRev: 3.8,
    growth: 14.1,
    margin: 28.7,
  },
  {
    ticker: "PEER3",
    price: 54,
    mktCap: 19.1,
    pe: 14.7,
    evEbitda: 9.8,
    evRev: 1.9,
    growth: 4.8,
    margin: 18.3,
  },
  {
    ticker: "PEER4",
    price: 178,
    mktCap: 52.3,
    pe: 24.1,
    evEbitda: 16.1,
    evRev: 3.3,
    growth: 12.6,
    margin: 24.9,
  },
  {
    ticker: "PEER5",
    price: 63,
    mktCap: 22.7,
    pe: 16.8,
    evEbitda: 11.4,
    evRev: 2.2,
    growth: 6.1,
    margin: 20.5,
  },
];

// ── Buy vs Sell Side Data ────────────────────────────────────────────────────
interface ComparisonDimension {
  dimension: string;
  buySide: string;
  sellSide: string;
  icon: React.ReactNode;
}

const COMPARISON_DIMS: ComparisonDimension[] = [
  {
    dimension: "Primary Goal",
    buySide: "Generate alpha / beat benchmark",
    sellSide: "Inform clients, generate commission flow",
    icon: <Target className="w-4 h-4" />,
  },
  {
    dimension: "Compensation",
    buySide: "% of fund P&L (carried interest, performance fee)",
    sellSide: "Salary + bonus tied to client votes & IB revenue",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    dimension: "Time Horizon",
    buySide: "Multi-year (fundamental) to milliseconds (HFT)",
    sellSide: "12-month price target, quarterly earnings focus",
    icon: <Activity className="w-4 h-4" />,
  },
  {
    dimension: "Idea Actionability",
    buySide: "Must act — P&L impact is immediate and real",
    sellSide: "Recommendations are advisory; clients decide",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    dimension: "Information Asymmetry",
    buySide: "Seeks undiscovered/misunderstood thesis",
    sellSide: "Distributes consensus; shapes Street expectations",
    icon: <Eye className="w-4 h-4" />,
  },
  {
    dimension: "Conflict of Interest",
    buySide: "Benchmark hugging, fee pressure",
    sellSide: "IB relationships, Reg FD, rating inflation",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  {
    dimension: "Coverage Breadth",
    buySide: "Deep dive on 20–40 names in portfolio",
    sellSide: "Wide coverage 15–30 names per analyst",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    dimension: "Research Output",
    buySide: "Investment memos, position sizing models",
    sellSide: "Published reports, earnings notes, price targets",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    dimension: "Variant Perception",
    buySide: "Essential — must differ from consensus to generate alpha",
    sellSide: "Risky — deviating from consensus creates career risk",
    icon: <Scale className="w-4 h-4" />,
  },
];

const CAREER_STAGES: CareerStage[] = [
  {
    title: "Research Associate",
    years: "0–3",
    side: "sell",
    skills: ["Model maintenance", "Data gathering", "Report drafting"],
  },
  {
    title: "Equity Research Analyst",
    years: "3–7",
    side: "sell",
    skills: ["Coverage ownership", "Client calls", "PT setting"],
  },
  {
    title: "Senior Analyst / VP",
    years: "5–10",
    side: "sell",
    skills: ["Team leadership", "Sector expertise", "IB collaboration"],
  },
  {
    title: "Junior Portfolio Analyst",
    years: "0–3",
    side: "buy",
    skills: ["Idea generation", "Deep dive research", "Pitch books"],
  },
  {
    title: "Portfolio Manager",
    years: "5–12",
    side: "buy",
    skills: ["Capital allocation", "Risk management", "Investor relations"],
  },
  {
    title: "Partner / CIO",
    years: "10+",
    side: "buy",
    skills: ["Fund strategy", "LP relationships", "Macro overlay"],
  },
];

// ── Helper: Sensitivity Table ────────────────────────────────────────────────
function buildSensitivityTable(): SensCell[] {
  const waccs = [7.5, 8.5, 9.5, 10.5, 11.5];
  const tgrs = [1.5, 2.0, 2.5, 3.0, 3.5];
  const cells: SensCell[] = [];
  const baseFCF = 8.4; // $B
  for (const wacc of waccs) {
    for (const tgr of tgrs) {
      const tv = (baseFCF * (1 + tgr / 100)) / ((wacc - tgr) / 100);
      const pv = tv / Math.pow(1 + wacc / 100, 10) + baseFCF * 5.2;
      cells.push({ wacc, tgr, value: Math.round(pv * 2.1) / 10 });
    }
  }
  return cells;
}

// ── Color helpers ────────────────────────────────────────────────────────────
const colorMap: Record<string, string> = {
  blue: "bg-primary/10 border-border text-primary",
  purple: "bg-primary/10 border-border text-primary",
  emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  orange: "bg-orange-500/10 border-orange-500/30 text-orange-400",
  cyan: "bg-cyan-500/10 border-cyan-500/30 text-muted-foreground",
  rose: "bg-rose-500/10 border-rose-500/30 text-rose-400",
};

const dotColorMap: Record<string, string> = {
  blue: "bg-primary",
  purple: "bg-primary",
  emerald: "bg-emerald-500",
  orange: "bg-orange-500",
  cyan: "bg-cyan-500",
  rose: "bg-rose-500",
};

// ── Sub-components ───────────────────────────────────────────────────────────

function ResearchProcessTab() {
  const [activeStep, setActiveStep] = useState<string>("scuttlebutt");

  const active = RESEARCH_STEPS.find((s) => s.id === activeStep)!;

  return (
    <div className="space-y-6">
      {/* Step selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {RESEARCH_STEPS.map((step, i) => (
          <motion.button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "p-3 rounded-lg border text-left transition-all",
              activeStep === step.id
                ? colorMap[step.color]
                : "bg-white/5 border-white/10 hover:border-white/20"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center",
                  activeStep === step.id
                    ? dotColorMap[step.color] + " text-white"
                    : "bg-white/10 text-white/50"
                )}
              >
                {i + 1}
              </span>
              <span className="text-xs text-white/50">{step.duration}</span>
            </div>
            <div className="text-sm font-medium text-white/90 leading-tight">
              {step.title}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Detail card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "rounded-xl border p-5 space-y-4",
            colorMap[active.color]
          )}
        >
          <div className="flex items-center gap-3">
            {active.icon}
            <div>
              <div className="text-base font-semibold text-white">
                {active.title}
              </div>
              <div className="text-xs text-white/50">
                Typical duration: {active.duration}
              </div>
            </div>
          </div>
          <p className="text-sm text-white/75 leading-relaxed">
            {active.description}
          </p>
          <div>
            <div className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
              Key Outputs
            </div>
            <div className="grid grid-cols-2 gap-2">
              {active.outputs.map((o) => (
                <div
                  key={o}
                  className="flex items-center gap-2 text-sm text-white/80"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  {o}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Report Types */}
      <div>
        <div className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Report Types
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REPORT_TYPES.map((rt) => (
            <div
              key={rt.name}
              className={cn(
                "rounded-lg border p-4 space-y-2",
                colorMap[rt.color]
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/90">
                  {rt.name}
                </span>
                <span className="text-xs text-white/40 font-mono">
                  {rt.pages}
                </span>
              </div>
              <div className="text-xs text-white/50 italic">{rt.trigger}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {rt.sections.map((sec) => (
                  <span
                    key={sec}
                    className="text-xs bg-white/5 rounded px-2 py-0.5 text-white/60"
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reg FD Compliance box */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-amber-400">
            Regulation FD — Fair Disclosure
          </span>
        </div>
        <p className="text-sm text-white/65 leading-relaxed">
          Reg FD (2000) prohibits companies from selectively disclosing material
          non-public information to select analysts or investors. All material
          disclosures must be made simultaneously to the public. Analysts may
          not trade on or distribute MNPI received privately. Expert network
          calls with current employees on material info are prohibited.
          Violations can result in SEC enforcement, trading suspensions, and
          criminal liability.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Permitted", items: ["Industry analysis", "Public filings", "Mosaic theory"] },
            { label: "Gray Area", items: ["Channel checks", "Expert networks", "Mgmt color"] },
            { label: "Prohibited", items: ["MNPI trading", "Selective tips", "Tipping chain"] },
          ].map((col) => (
            <div key={col.label}>
              <div
                className={cn(
                  "text-xs font-semibold mb-1",
                  col.label === "Permitted"
                    ? "text-emerald-400"
                    : col.label === "Gray Area"
                    ? "text-amber-400"
                    : "text-rose-400"
                )}
              >
                {col.label}
              </div>
              {col.items.map((item) => (
                <div key={item} className="text-xs text-white/50 leading-5">
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinancialModelTab() {
  const sensitivityCells = useMemo(() => buildSensitivityTable(), []);
  const waccs = [7.5, 8.5, 9.5, 10.5, 11.5];
  const tgrs = [1.5, 2.0, 2.5, 3.0, 3.5];

  const baseValue = sensitivityCells.find(
    (c) => c.wacc === 9.5 && c.tgr === 2.5
  )?.value ?? 0;

  return (
    <div className="space-y-6">
      {/* 3-Statement Model Flow SVG */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5">
        <div className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
          3-Statement Model — Integration Flow
        </div>
        <svg viewBox="0 0 640 220" className="w-full" style={{ height: 220 }}>
          {/* IS box */}
          <rect
            x="10"
            y="20"
            width="180"
            height="160"
            rx="8"
            fill="#1e293b"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />
          <text x="100" y="44" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="bold">
            Income Statement
          </text>
          {[
            ["Revenue", 66],
            ["− COGS", 84],
            ["= Gross Profit", 102],
            ["− OpEx / D&A", 120],
            ["= EBIT", 138],
            ["− Interest / Tax", 156],
            ["= Net Income", 174],
          ].map(([label, y]) => (
            <text key={String(y)} x="18" y={Number(y)} fill="#94a3b8" fontSize="10">
              {label}
            </text>
          ))}

          {/* BS box */}
          <rect
            x="230"
            y="20"
            width="180"
            height="160"
            rx="8"
            fill="#1e293b"
            stroke="#8b5cf6"
            strokeWidth="1.5"
          />
          <text x="320" y="44" textAnchor="middle" fill="#a78bfa" fontSize="12" fontWeight="bold">
            Balance Sheet
          </text>
          {[
            ["Cash & Equivalents", 66],
            ["Accounts Receivable", 84],
            ["Inventory", 102],
            ["PP&E (net)", 120],
            ["Total Assets", 138],
            ["Accounts Payable", 156],
            ["Retained Earnings", 174],
          ].map(([label, y]) => (
            <text key={String(y)} x="238" y={Number(y)} fill="#94a3b8" fontSize="10">
              {label}
            </text>
          ))}

          {/* CF box */}
          <rect
            x="450"
            y="20"
            width="180"
            height="160"
            rx="8"
            fill="#1e293b"
            stroke="#06b6d4"
            strokeWidth="1.5"
          />
          <text x="540" y="44" textAnchor="middle" fill="#22d3ee" fontSize="12" fontWeight="bold">
            Cash Flow Statement
          </text>
          {[
            ["Net Income (from IS)", 66],
            ["+ D&A add-back", 84],
            ["± Working Capital Δ", 102],
            ["= Operating CF", 120],
            ["− Capex", 138],
            ["= Free Cash Flow", 156],
            ["± Financing CFs", 174],
          ].map(([label, y]) => (
            <text key={String(y)} x="458" y={Number(y)} fill="#94a3b8" fontSize="10">
              {label}
            </text>
          ))}

          {/* Arrow IS → BS: Net Income → Retained Earnings */}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
            </marker>
          </defs>
          <path
            d="M190 174 Q210 174 230 174"
            stroke="#3b82f6"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#arrow)"
          />
          <text x="210" y="170" fill="#3b82f6" fontSize="8" textAnchor="middle">
            NI
          </text>

          {/* Arrow IS → CF: Net Income → CF Net Income */}
          <path
            d="M190 80 Q210 58 230 58"
            stroke="#3b82f6"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#arrow)"
          />
          <text x="208" y="64" fill="#3b82f6" fontSize="8">
            NI
          </text>

          {/* Arrow CF → BS: Ending cash → Cash line */}
          <path
            d="M450 66 Q430 66 410 66"
            stroke="#06b6d4"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#arrow)"
          />
          <text x="432" y="62" fill="#06b6d4" fontSize="8">
            Cash
          </text>

          {/* Arrow BS → CF: WC changes */}
          <path
            d="M410 102 Q430 102 450 102"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#arrow)"
          />
          <text x="427" y="98" fill="#8b5cf6" fontSize="8">
            WC Δ
          </text>
        </svg>
        <p className="text-xs text-white/40 text-center mt-2">
          Net Income flows from IS to both BS (retained earnings) and CF (operating section). Cash from CF reconciles to BS cash balance.
        </p>
      </div>

      {/* Revenue Build */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5">
        <div className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
          Revenue Build — Volume × Price × Mix
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Volume",
              color: "blue",
              description: "Units sold, contracts, subscribers, MAUs",
              drivers: ["Market share gains", "New market entry", "Product launches", "Pricing units sold"],
            },
            {
              label: "Price",
              color: "purple",
              description: "Average selling price, ASP, ARPU, rate per unit",
              drivers: ["Pricing power", "Competitive intensity", "Inflation pass-through", "Contract renewals"],
            },
            {
              label: "Mix",
              color: "emerald",
              description: "Product/geo/channel blend shifting revenue quality",
              drivers: ["Premiumization", "Geographic expansion", "Channel shift DTC", "Higher-margin products"],
            },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-lg border p-3 space-y-2",
                colorMap[item.color]
              )}
            >
              <div className="text-sm font-bold text-white/90">{item.label}</div>
              <div className="text-xs text-white/55 leading-relaxed">
                {item.description}
              </div>
              <div className="space-y-1">
                {item.drivers.map((d) => (
                  <div key={d} className="flex items-center gap-1.5 text-xs text-white/60">
                    <ChevronRight className="w-3 h-3 shrink-0" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FCF Bridge Waterfall SVG */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5">
        <div className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
          FCF Bridge — EBITDA to Free Cash Flow ($M)
        </div>
        <svg viewBox="0 0 640 200" className="w-full" style={{ height: 200 }}>
          {/* Waterfall bars */}
          {[
            { label: "EBITDA", value: 320, cumFrom: 0, color: "#22c55e", positive: true },
            { label: "− D&A", value: -45, cumFrom: 320, color: "#f87171", positive: false },
            { label: "EBIT", value: 275, cumFrom: 0, color: "#60a5fa", positive: true, subtotal: true },
            { label: "− Taxes", value: -68, cumFrom: 275, color: "#f87171", positive: false },
            { label: "+ D&A", value: 45, cumFrom: 207, color: "#22c55e", positive: true },
            { label: "± WC", value: -18, cumFrom: 252, color: "#f87171", positive: false },
            { label: "Op CF", value: 234, cumFrom: 0, color: "#a78bfa", positive: true, subtotal: true },
            { label: "− Capex", value: -52, cumFrom: 234, color: "#f87171", positive: false },
            { label: "FCF", value: 182, cumFrom: 0, color: "#f59e0b", positive: true, subtotal: true },
          ].map((bar, i) => {
            const scale = 0.48;
            const maxVal = 380;
            const x = 10 + i * 68;
            const barH = Math.abs(bar.value) * scale;
            const baseY = 170 - (bar.subtotal ? 0 : bar.cumFrom * scale);
            const barY = bar.positive ? baseY - barH : baseY;
            return (
              <g key={bar.label}>
                <rect
                  x={x}
                  y={bar.subtotal ? 170 - bar.value * scale : barY}
                  width={58}
                  height={barH}
                  rx="3"
                  fill={bar.color}
                  opacity={bar.subtotal ? 1 : 0.75}
                />
                <text
                  x={x + 29}
                  y={bar.subtotal ? 170 - bar.value * scale - 6 : (bar.positive ? barY - 4 : barY + barH + 12)}
                  textAnchor="middle"
                  fill={bar.color}
                  fontSize="9"
                  fontWeight="bold"
                >
                  {bar.value > 0 ? "+" : ""}{bar.value}
                </text>
                <text
                  x={x + 29}
                  y={188}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                >
                  {bar.label}
                </text>
              </g>
            );
          })}
          {/* Zero line */}
          <line x1="8" y1="170" x2="632" y2="170" stroke="#334155" strokeWidth="1" />
        </svg>
      </div>

      {/* Scenario Analysis */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5">
        <div className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
          Scenario Analysis — Bear / Base / Bull
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-4 text-white/40 font-normal text-xs">
                  Assumption
                </th>
                <th className="text-center py-2 px-3 text-rose-400 font-semibold text-xs">
                  Bear
                </th>
                <th className="text-center py-2 px-3 text-primary font-semibold text-xs">
                  Base
                </th>
                <th className="text-center py-2 px-3 text-emerald-400 font-semibold text-xs">
                  Bull
                </th>
              </tr>
            </thead>
            <tbody>
              {SCENARIO_ASSUMPTIONS.map((row, i) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-white/5",
                    i % 2 === 0 ? "bg-white/1" : ""
                  )}
                >
                  <td className="py-2 pr-4 text-white/70 text-xs">{row.label}</td>
                  <td className="text-center py-2 px-3 text-rose-300 font-mono text-xs">
                    {row.bear}
                  </td>
                  <td className="text-center py-2 px-3 text-primary font-mono text-xs font-semibold">
                    {row.base}
                  </td>
                  <td className="text-center py-2 px-3 text-emerald-300 font-mono text-xs">
                    {row.bull}
                  </td>
                </tr>
              ))}
              <tr className="bg-white/5">
                <td className="py-2 pr-4 text-white/90 text-xs font-semibold">
                  Implied Price Target
                </td>
                <td className="text-center py-2 px-3 text-rose-300 font-mono text-xs font-bold">
                  $88
                </td>
                <td className="text-center py-2 px-3 text-primary font-mono text-xs font-bold">
                  $136
                </td>
                <td className="text-center py-2 px-3 text-emerald-300 font-mono text-xs font-bold">
                  $191
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensitivity Table */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5">
        <div className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
          DCF Sensitivity — WACC vs. Terminal Growth Rate (Price, $)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-1.5 pr-3 text-white/30 font-normal">
                  WACC ↓ / TGR →
                </th>
                {tgrs.map((tgr) => (
                  <th key={tgr} className="text-center py-1.5 px-2 text-white/50 font-semibold">
                    {tgr}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {waccs.map((wacc) => (
                <tr key={wacc} className="border-b border-white/5">
                  <td className="py-1.5 pr-3 text-white/60 font-semibold">{wacc}%</td>
                  {tgrs.map((tgr) => {
                    const cell = sensitivityCells.find(
                      (c) => c.wacc === wacc && c.tgr === tgr
                    );
                    const val = cell?.value ?? 0;
                    const diff = val - baseValue;
                    const isBase = wacc === 9.5 && tgr === 2.5;
                    return (
                      <td
                        key={tgr}
                        className={cn(
                          "text-center py-1.5 px-2 font-mono rounded",
                          isBase
                            ? "bg-primary/20 text-primary font-bold"
                            : diff > 20
                            ? "text-emerald-300"
                            : diff < -20
                            ? "text-rose-300"
                            : "text-white/70"
                        )}
                      >
                        ${val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-white/30 mt-2">
          Highlighted cell = base case assumption (WACC 9.5%, TGR 2.5%). Green = &gt;$20 above base; Red = &gt;$20 below base.
        </div>
      </div>
    </div>
  );
}

function ValuationFrameworkTab() {
  const currentPrice = 122;
  const weightedPT = useMemo(() => {
    const total = VALUATION_METHODS.reduce((sum, m) => sum + m.weight, 0);
    return Math.round(
      VALUATION_METHODS.reduce(
        (sum, m) => sum + m.impliedPrice * (m.weight / total),
        0
      )
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Method weight visualization */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5">
        <div className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
          Multi-Method Valuation — Weights & Implied Prices
        </div>
        <div className="space-y-3">
          {VALUATION_METHODS.map((method) => (
            <div key={method.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: method.color }}
                  />
                  <span className="text-white/80 font-medium">{method.name}</span>
                  <span className="text-white/35">{method.weight}% weight</span>
                </div>
                <span
                  className="font-mono font-semibold"
                  style={{ color: method.color }}
                >
                  ${method.impliedPrice}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(method.impliedPrice / 200) * 100}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: method.color }}
                  />
                </div>
              </div>
              <div className="text-xs text-white/35 pl-4">{method.description}</div>
            </div>
          ))}
        </div>

        {/* Weight donut-style bar */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-white/40 mb-2">Weight distribution</div>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {VALUATION_METHODS.map((m) => (
              <div
                key={m.name}
                style={{
                  width: `${m.weight}%`,
                  background: m.color,
                }}
                title={`${m.shortName}: ${m.weight}%`}
              />
            ))}
          </div>
          <div className="flex gap-3 mt-2 flex-wrap">
            {VALUATION_METHODS.map((m) => (
              <div key={m.name} className="flex items-center gap-1 text-xs text-white/50">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ background: m.color }}
                />
                {m.shortName} {m.weight}%
              </div>
            ))}
          </div>
        </div>

        {/* Price target derivation */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-white/40 mb-1">Current Price</div>
            <div className="text-xl font-bold text-white">${currentPrice}</div>
          </div>
          <div>
            <div className="text-xs text-white/40 mb-1">12-Mo Price Target</div>
            <div className="text-xl font-bold text-primary">${weightedPT}</div>
          </div>
          <div>
            <div className="text-xs text-white/40 mb-1">Upside / Downside</div>
            <div
              className={cn(
                "text-xl font-bold",
                weightedPT > currentPrice ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {weightedPT > currentPrice ? "+" : ""}
              {(((weightedPT - currentPrice) / currentPrice) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Peer Group Table */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5">
        <div className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
          Peer Group Comparison
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                {[
                  "Ticker",
                  "Price",
                  "Mkt Cap ($B)",
                  "P/E",
                  "EV/EBITDA",
                  "EV/Rev",
                  "Rev Growth",
                  "EBITDA Margin",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-right first:text-left py-2 px-2 text-white/40 font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PEER_COMPANIES.map((c) => (
                <tr
                  key={c.ticker}
                  className={cn(
                    "border-b border-white/5",
                    c.isTarget
                      ? "bg-primary/10 font-semibold"
                      : "hover:bg-muted/30"
                  )}
                >
                  <td className="py-2 px-2 text-left">
                    <span
                      className={cn(
                        "font-mono",
                        c.isTarget ? "text-primary" : "text-white/80"
                      )}
                    >
                      {c.ticker}
                    </span>
                    {c.isTarget && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ★
                      </span>
                    )}
                  </td>
                  <td className="text-right py-2 px-2 font-mono text-white/70">
                    ${c.price}
                  </td>
                  <td className="text-right py-2 px-2 font-mono text-white/70">
                    {c.mktCap}
                  </td>
                  <td className="text-right py-2 px-2 font-mono text-white/70">
                    {c.pe}x
                  </td>
                  <td className="text-right py-2 px-2 font-mono text-white/70">
                    {c.evEbitda}x
                  </td>
                  <td className="text-right py-2 px-2 font-mono text-white/70">
                    {c.evRev}x
                  </td>
                  <td className="text-right py-2 px-2 font-mono text-emerald-300">
                    {c.growth}%
                  </td>
                  <td className="text-right py-2 px-2 font-mono text-muted-foreground">
                    {c.margin}%
                  </td>
                </tr>
              ))}
              {/* Median row */}
              <tr className="bg-white/5 border-t border-white/15">
                <td className="py-2 px-2 text-left text-white/50 font-semibold">
                  Median (ex-TGT)
                </td>
                <td className="text-right py-2 px-2 text-white/50">—</td>
                <td className="text-right py-2 px-2 font-mono text-white/60">
                  {(
                    [45.2, 67.8, 19.1, 52.3, 22.7].sort((a, b) => a - b)[2]
                  ).toFixed(1)}
                </td>
                <td className="text-right py-2 px-2 font-mono text-white/60">
                  {[22.4, 26.3, 14.7, 24.1, 16.8].sort((a, b) => a - b)[2]}x
                </td>
                <td className="text-right py-2 px-2 font-mono text-white/60">
                  {[15.8, 17.2, 9.8, 16.1, 11.4].sort((a, b) => a - b)[2]}x
                </td>
                <td className="text-right py-2 px-2 font-mono text-white/60">
                  {[3.1, 3.8, 1.9, 3.3, 2.2].sort((a, b) => a - b)[2]}x
                </td>
                <td className="text-right py-2 px-2 font-mono text-white/60">
                  {[11.3, 14.1, 4.8, 12.6, 6.1].sort((a, b) => a - b)[2]}%
                </td>
                <td className="text-right py-2 px-2 font-mono text-white/60">
                  {[26.4, 28.7, 18.3, 24.9, 20.5].sort((a, b) => a - b)[2]}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-xs text-white/30 mt-2">
          ★ = Target company. Median excludes target. Discount/premium vs. peers drives multiple selection.
        </div>
      </div>

      {/* Premium/Discount Justification */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5">
        <div className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
          Premium / Discount Justification Matrix
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              factor: "Revenue Growth",
              assessment: "Discount",
              rationale: "TGT 7.2% vs. peer median 12.6% — slower grower",
              dir: "down",
            },
            {
              factor: "EBITDA Margin",
              assessment: "Discount",
              rationale: "22.1% vs. median 24.9% — below-average profitability",
              dir: "down",
            },
            {
              factor: "Balance Sheet Quality",
              assessment: "Neutral",
              rationale: "Net leverage 1.2x — in-line with peer average of 1.1x",
              dir: "neutral",
            },
            {
              factor: "Market Position",
              assessment: "Premium",
              rationale: "#2 market share, sticky enterprise contracts, high NRR",
              dir: "up",
            },
            {
              factor: "Management Track Record",
              assessment: "Premium",
              rationale: "CEO 3x serial founder, consistently beat guidance 8 quarters",
              dir: "up",
            },
            {
              factor: "ESG / Governance",
              assessment: "Neutral",
              rationale: "Strong board independence, average ESG score for sector",
              dir: "neutral",
            },
          ].map((row) => (
            <div
              key={row.factor}
              className="flex items-start gap-3 rounded-lg border border-white/8 bg-white/3 p-3"
            >
              {row.dir === "up" ? (
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : row.dir === "down" ? (
                <TrendingDown className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Activity className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white/80">
                    {row.factor}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded font-medium",
                      row.dir === "up"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : row.dir === "down"
                        ? "bg-rose-500/15 text-rose-400"
                        : "bg-white/10 text-white/50"
                    )}
                  >
                    {row.assessment}
                  </span>
                </div>
                <div className="text-xs text-white/45 mt-0.5 leading-relaxed">
                  {row.rationale}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-border bg-primary/5 p-3 text-xs text-white/60 leading-relaxed">
          <Info className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
          <strong className="text-primary">Net conclusion:</strong> Mixed premium/discount factors suggest applying a modest 10–15% discount to peer median multiples. EV/EBITDA target: 11.5x–12.5x (peer median 15.8x). Justifies Price Target of ~$136 (base case).
        </div>
      </div>
    </div>
  );
}

function BuyVsSellSideTab() {
  // MiFID II research budget trend SVG data
  const years = [2014, 2016, 2018, 2020, 2022, 2024];
  const sellBudgets = [14.2, 13.8, 10.1, 8.4, 7.9, 7.2]; // $B global
  const buyBudgets = [4.1, 4.8, 6.2, 7.1, 8.3, 9.4]; // $B internal

  const maxB = 16;
  const svgW = 560;
  const svgH = 160;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const xScale = (i: number) => padL + (i / (years.length - 1)) * plotW;
  const yScale = (v: number) => padT + plotH - (v / maxB) * plotH;

  const pathSell = years
    .map((_, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(sellBudgets[i])}`)
    .join(" ");
  const pathBuy = years
    .map((_, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(buyBudgets[i])}`)
    .join(" ");

  return (
    <div className="space-y-6">
      {/* Comparison table */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5">
        <div className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
          Buy-Side vs. Sell-Side — 9 Dimensions
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-4 text-white/30 font-normal w-1/4">
                  Dimension
                </th>
                <th className="text-left py-2 px-3 text-emerald-400 font-semibold w-3/8">
                  Buy-Side (Asset Manager / HF / PE)
                </th>
                <th className="text-left py-2 px-3 text-primary font-semibold w-3/8">
                  Sell-Side (Broker-Dealer / IBD)
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DIMS.map((dim, i) => (
                <tr
                  key={dim.dimension}
                  className={cn(
                    "border-b border-white/5",
                    i % 2 === 0 ? "bg-white/1" : ""
                  )}
                >
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-1.5 text-white/50 font-medium">
                      {dim.icon}
                      {dim.dimension}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-white/70 leading-relaxed">
                    {dim.buySide}
                  </td>
                  <td className="py-2.5 px-3 text-white/70 leading-relaxed">
                    {dim.sellSide}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Research Budget Trend SVG */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5">
        <div className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-1">
          Global Research Budget Trends ($B) — MiFID II Impact
        </div>
        <div className="text-xs text-white/35 mb-4">
          MiFID II (Jan 2018) required unbundling of research from trading commissions, accelerating sell-side budget cuts while buy-side built internal teams.
        </div>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: svgH }}>
          {/* Grid lines */}
          {[0, 4, 8, 12, 16].map((v) => (
            <g key={v}>
              <line
                x1={padL}
                y1={yScale(v)}
                x2={svgW - padR}
                y2={yScale(v)}
                stroke="#1e293b"
                strokeWidth="1"
              />
              <text
                x={padL - 5}
                y={yScale(v) + 4}
                textAnchor="end"
                fill="#475569"
                fontSize="9"
              >
                {v}
              </text>
            </g>
          ))}

          {/* MiFID II annotation */}
          <line
            x1={xScale(2)}
            y1={padT}
            x2={xScale(2)}
            y2={padT + plotH}
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text x={xScale(2) + 4} y={padT + 12} fill="#f59e0b" fontSize="8">
            MiFID II
          </text>

          {/* Sell-side line */}
          <path
            d={pathSell}
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {sellBudgets.map((v, i) => (
            <circle
              key={i}
              cx={xScale(i)}
              cy={yScale(v)}
              r="3"
              fill="#3b82f6"
            />
          ))}

          {/* Buy-side line */}
          <path
            d={pathBuy}
            stroke="#22c55e"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {buyBudgets.map((v, i) => (
            <circle
              key={i}
              cx={xScale(i)}
              cy={yScale(v)}
              r="3"
              fill="#22c55e"
            />
          ))}

          {/* X-axis labels */}
          {years.map((yr, i) => (
            <text
              key={yr}
              x={xScale(i)}
              y={svgH - 4}
              textAnchor="middle"
              fill="#475569"
              fontSize="9"
            >
              {yr}
            </text>
          ))}

          {/* Legend */}
          <circle cx={padL + 10} cy={padT + 4} r="3" fill="#3b82f6" />
          <text x={padL + 17} y={padT + 8} fill="#3b82f6" fontSize="9">
            Sell-Side External Research Budget
          </text>
          <circle cx={padL + 10} cy={padT + 18} r="3" fill="#22c55e" />
          <text x={padL + 17} y={padT + 22} fill="#22c55e" fontSize="9">
            Buy-Side Internal Research Spend
          </text>
        </svg>
      </div>

      {/* Analyst Career Paths */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5">
        <div className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
          Analyst Career Paths
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Sell-Side Track
            </div>
            <div className="space-y-2">
              {CAREER_STAGES.filter((c) => c.side === "sell").map(
                (stage, i) => (
                  <div key={stage.title} className="flex items-start gap-2">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold shrink-0">
                        {i + 1}
                      </div>
                      {i < 2 && (
                        <div className="w-0.5 h-4 bg-primary/20 mt-1" />
                      )}
                    </div>
                    <div className="pb-2">
                      <div className="text-xs font-semibold text-white/80">
                        {stage.title}
                      </div>
                      <div className="text-xs text-white/35">
                        Yr {stage.years}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {stage.skills.map((sk) => (
                          <span
                            key={sk}
                            className="text-xs bg-primary/10 text-muted-foreground rounded px-1.5 py-0.5"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Buy-Side Track
            </div>
            <div className="space-y-2">
              {CAREER_STAGES.filter((c) => c.side === "buy").map(
                (stage, i) => (
                  <div key={stage.title} className="flex items-start gap-2">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs text-emerald-400 font-bold shrink-0">
                        {i + 1}
                      </div>
                      {i < 2 && (
                        <div className="w-0.5 h-4 bg-emerald-500/20 mt-1" />
                      )}
                    </div>
                    <div className="pb-2">
                      <div className="text-xs font-semibold text-white/80">
                        {stage.title}
                      </div>
                      <div className="text-xs text-white/35">
                        Yr {stage.years}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {stage.skills.map((sk) => (
                          <span
                            key={sk}
                            className="text-xs bg-emerald-500/10 text-emerald-300/70 rounded px-1.5 py-0.5"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conflicts of Interest & Consensus vs Variant */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">
              Conflicts of Interest
            </span>
          </div>
          <div className="space-y-3 text-xs text-white/65 leading-relaxed">
            {[
              {
                title: "IB Revenue Pressure",
                body: "Sell-side analysts covering IB clients face implicit pressure to avoid negative ratings that could jeopardize deal flow.",
              },
              {
                title: "Relationship Maintenance",
                body: "Access to management and IR can be revoked for critical analysts. Fear of losing access creates self-censorship.",
              },
              {
                title: "Analyst Rating Inflation",
                body: "Historical data: ~50% Buy, ~40% Hold, <10% Sell ratings. True sell opinions are systematically underrepresented.",
              },
              {
                title: "Buy-Side Benchmark Hugging",
                body: "Career risk pushes PMs toward consensus positions. Being wrong in a crowd is safer than being right alone and looking foolish briefly.",
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="font-semibold text-amber-300/80 mb-0.5">
                  {item.title}
                </div>
                <div>{item.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-primary/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Consensus vs. Variant Perception
            </span>
          </div>
          <div className="space-y-3 text-xs text-white/65 leading-relaxed">
            {[
              {
                title: "The Variant Perception Edge",
                body: "Alpha requires a view materially different from consensus AND being correct. Being different-but-wrong destroys capital; consensus-and-right generates index returns.",
              },
              {
                title: "Where Variants Emerge",
                body: "Model differing unit economics, non-consensus channel checks, misread regulatory impact, or underappreciated optionality in new business lines.",
              },
              {
                title: "Consensus Flaw Identification",
                body: "Read sell-side models critically: which assumptions are lazily copied? Earnings beats often come from companies guiding conservatively, not from analyst insight.",
              },
              {
                title: "Evidence on Alpha Generation",
                body: "Studies show ~85% of active funds underperform index after fees over 15 years (SPIVA). Genuine alpha generators are rare and often use information unavailable to others.",
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="font-semibold text-muted-foreground mb-0.5">
                  {item.title}
                </div>
                <div>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function EquityResearch2Page() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/15 border border-border flex items-center justify-center">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Equity Research Deep Dive
              </h1>
              <p className="text-sm text-white/45">
                Sell-side process · Financial modeling · Valuation · Buy vs. Sell-Side
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {[
              { label: "Research Process", icon: <Search className="w-3 h-3" />, color: "blue" },
              { label: "Financial Model", icon: <BarChart3 className="w-3 h-3" />, color: "cyan" },
              { label: "Valuation", icon: <Target className="w-3 h-3" />, color: "purple" },
              { label: "Buy vs. Sell", icon: <Scale className="w-3 h-3" />, color: "emerald" },
            ].map((chip) => (
              <div
                key={chip.label}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border",
                  colorMap[chip.color]
                )}
              >
                {chip.icon}
                {chip.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="process" className="w-full">
          <TabsList className="grid grid-cols-4 w-full bg-white/5 border border-white/10 rounded-lg h-10">
            <TabsTrigger
              value="process"
              className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Research Process
            </TabsTrigger>
            <TabsTrigger
              value="model"
              className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-muted-foreground rounded-md"
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              Financial Model
            </TabsTrigger>
            <TabsTrigger
              value="valuation"
              className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md"
            >
              <Target className="w-3.5 h-3.5 mr-1.5" />
              Valuation
            </TabsTrigger>
            <TabsTrigger
              value="buysell"
              className="text-xs data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 rounded-md"
            >
              <Scale className="w-3.5 h-3.5 mr-1.5" />
              Buy vs. Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="process" className="mt-6 data-[state=inactive]:hidden">
            <ResearchProcessTab />
          </TabsContent>
          <TabsContent value="model" className="mt-6 data-[state=inactive]:hidden">
            <FinancialModelTab />
          </TabsContent>
          <TabsContent value="valuation" className="mt-6 data-[state=inactive]:hidden">
            <ValuationFrameworkTab />
          </TabsContent>
          <TabsContent value="buysell" className="mt-6 data-[state=inactive]:hidden">
            <BuyVsSellSideTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
