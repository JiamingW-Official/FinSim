"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  BarChart3,
  BookOpen,
  Users,
  Lock,
  ChevronRight,
  ChevronDown,
  Info,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Layers,
  Shield,
  Zap,
  ArrowRight,
  CircleDot,
  Percent,
  Globe,
  Award,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 891;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed = 891) {
  s = seed;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface TimelineStep {
  id: number;
  name: string;
  shortName: string;
  duration: string;
  weekStart: number;
  weekEnd: number;
  color: string;
  description: string;
  keyActivities: string[];
  keyPlayers: string[];
  secRequirements: string;
  riskNote: string;
}

interface NotableIPO {
  company: string;
  ticker: string;
  year: number;
  sector: string;
  offerPrice: number;
  firstDayClose: number;
  oneYearReturn: number | null;
  status: "success" | "mixed" | "withdrawn" | "decline";
  notes: string;
}

interface VintageYear {
  year: number;
  avgReturn: number;
  dealCount: number;
  totalRaise: number; // $B
}

interface ComparisonDimension {
  dimension: string;
  traditional: string;
  directListing: string;
  spac: string;
  advantage: "traditional" | "direct" | "spac" | "neutral";
}

// ── Static Data ───────────────────────────────────────────────────────────────

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 1,
    name: "Pre-IPO Audit & Preparation",
    shortName: "Pre-IPO Prep",
    duration: "6–18 months",
    weekStart: 0,
    weekEnd: 8,
    color: "#6366f1",
    description:
      "The company prepares for public scrutiny by establishing GAAP-compliant financials, upgrading governance structures, and hiring key advisors. Typically requires 2–3 years of audited financials.",
    keyActivities: [
      "Engage Big 4 auditors for 2–3 years restated financials",
      "Establish independent board with audit/compensation committees",
      "Implement SOX-compliant internal controls",
      "Select investment bank underwriters (book-running managers)",
      "Engage legal counsel (company & underwriter counsel)",
      "Draft preliminary S-1 registration statement",
      "Conduct organizational 'org meetings' with all advisors",
    ],
    keyPlayers: ["CFO", "Audit Committee", "Big 4 Auditor", "Securities Counsel", "Investment Bankers"],
    secRequirements: "No SEC filing yet; preparatory phase. JOBS Act allows confidential S-1 submission for EGCs.",
    riskNote: "Material weaknesses in internal controls discovered here can delay or derail the IPO.",
  },
  {
    id: 2,
    name: "Confidential S-1 Submission (EGC)",
    shortName: "Confidential Filing",
    duration: "2–4 weeks",
    weekStart: 8,
    weekEnd: 12,
    color: "#8b5cf6",
    description:
      "Emerging Growth Companies (EGCs with <$1.235B revenue) can file a draft S-1 confidentially with the SEC, allowing private review before public exposure. Must go public at least 15 days before roadshow.",
    keyActivities: [
      "Submit Draft Registration Statement (DRS) to SEC EDGAR confidentially",
      "Respond to SEC comment letters (typically 2–3 rounds)",
      "Refine financial statements, risk factors, and MD&A",
      "Begin selecting underwriting syndicate members",
    ],
    keyPlayers: ["SEC Division of Corporation Finance", "Company Counsel", "Underwriter Counsel", "CFO/CEO"],
    secRequirements: "JOBS Act Section 106: EGCs may submit DRS confidentially. Non-EGCs must file publicly immediately.",
    riskNote: "SEC comment letters average 30–45 days response time per round, creating schedule uncertainty.",
  },
  {
    id: 3,
    name: "Public S-1 Filing",
    shortName: "S-1 Filed",
    duration: "1–2 weeks",
    weekStart: 12,
    weekEnd: 14,
    color: "#a855f7",
    description:
      "The S-1 registration statement becomes public on SEC EDGAR. Includes prospectus with business description, financials, risk factors, use of proceeds, and management discussion. Price range not yet set.",
    keyActivities: [
      "File S-1 publicly on SEC EDGAR",
      "Begin 15-day quiet period before roadshow",
      "Respond to final SEC comments; file S-1/A amendments",
      "Distribute preliminary prospectus ('red herring') to analysts",
      "Prepare investor presentation and roadshow materials",
      "Analysts write initiation reports (not published until quiet period ends)",
    ],
    keyPlayers: ["SEC", "EDGAR System", "Underwriter Syndicate", "PR/IR Advisors"],
    secRequirements: "Section 5 of Securities Act: must file S-1 and wait for effectiveness. Form S-1 includes Items 1–16.",
    riskNote: "The 'quiet period' restricts company communications. Violations can trigger SEC investigation.",
  },
  {
    id: 4,
    name: "Roadshow & Book Building",
    shortName: "Roadshow",
    duration: "1–2 weeks",
    weekStart: 14,
    weekEnd: 16,
    color: "#d946ef",
    description:
      "Management presents to institutional investors globally. The underwriter collects 'indications of interest' (IOIs) to build the order book, gauge demand, and refine the price range. No binding commitments yet.",
    keyActivities: [
      "One-on-one meetings with top 50–100 institutional investors",
      "Group presentations in major financial centers (NYC, SF, London, HK)",
      "Virtual roadshow presentations via investor platforms",
      "Underwriter book-runners collect IOIs with price/size",
      "Update S-1/A with preliminary price range ($X–$Y per share)",
      "Monitor order book coverage (typically aim for 10–20x oversubscribed)",
    ],
    keyPlayers: ["CEO/CFO", "Book-Running Managers", "Institutional Investors (asset managers, hedge funds)", "Sales Teams"],
    secRequirements: "Rule 134: only factual information permitted. No 'free writing prospectus' without SEC filing.",
    riskNote: "Market conditions during roadshow heavily influence final pricing. Volatile markets can force postponement.",
  },
  {
    id: 5,
    name: "Pricing Night",
    shortName: "Pricing",
    duration: "1 evening",
    weekStart: 16,
    weekEnd: 16.1,
    color: "#f97316",
    description:
      "After market close, the underwriter and company negotiate final IPO price based on order book quality. Price set below intrinsic value ('underpricing') to ensure first-day trading success and institutional goodwill.",
    keyActivities: [
      "Review final order book: size, price distribution, investor quality",
      "Negotiate final price between company and underwriter",
      "Allocate shares to institutional investors (discretionary, relationship-based)",
      "Finalize underwriting agreement and lock up agreements",
      "File final prospectus (Rule 424(b)) after market close",
      "Announce IPO price via press release",
    ],
    keyPlayers: ["CEO/CFO/Board", "Book-Running Lead Manager", "Co-managers", "Stabilization Agent"],
    secRequirements: "Rule 424(b): final prospectus must be filed within 2 business days of pricing.",
    riskNote: "Average IPO underpricing leaves ~20% 'money on the table'. Companies sacrifice proceeds for aftermarket stability.",
  },
  {
    id: 6,
    name: "First-Day Trading",
    shortName: "IPO Day",
    duration: "1 day",
    weekStart: 16.1,
    weekEnd: 16.2,
    color: "#eab308",
    description:
      "Shares trade publicly for the first time. The designated market maker (NYSE) or Nasdaq Market Center facilitates price discovery. Underwriters may support price via stabilizing bids. Retail investors can now buy.",
    keyActivities: [
      "Listing ceremony on NYSE or Nasdaq",
      "Designated Market Maker (DMM) sets opening price via auction",
      "Underwriter stabilization: may buy shares if price drops below offer",
      "Greenshoe option: underwriter can oversell 15% of shares",
      "Media appearances by CEO; investor relations activities",
      "First-day trading volume typically 3–10x normal for comparable stocks",
    ],
    keyPlayers: ["NYSE/Nasdaq Market Maker", "Stabilization Agent", "Retail & Institutional Traders", "Media"],
    secRequirements: "Regulation M: anti-manipulation rules apply. Stabilization activities must be disclosed.",
    riskNote: "First-day 'pop' is often misattributed to company success; it reflects deliberate underpricing by underwriters.",
  },
  {
    id: 7,
    name: "Quiet Period (25 Days)",
    shortName: "Quiet Period",
    duration: "25 days",
    weekStart: 16.2,
    weekEnd: 19.8,
    color: "#22c55e",
    description:
      "Underwriting analysts may not publish research for 25 days post-IPO (NASD Rule 2711). This prevents the appearance of biased promotional research. JOBS Act reduced this from 40 days for some issuers.",
    keyActivities: [
      "Company focuses on investor relations and operational execution",
      "Underwriter analysts prepare initiating coverage reports",
      "Secondary market trading stabilizes (or doesn't)",
      "Greenshoe option exercised if stock trades above offer price",
      "Company reports earnings if quarter ends during this period",
    ],
    keyPlayers: ["Sell-Side Analysts", "IR Team", "Compliance Officers"],
    secRequirements: "FINRA Rule 2241: 25-day quiet period for underwriter research analysts.",
    riskNote: "End of quiet period often triggers analyst initiating coverage with Buy ratings, creating a temporary pop.",
  },
  {
    id: 8,
    name: "Analyst Coverage Initiation",
    shortName: "Coverage Initiated",
    duration: "1–2 weeks",
    weekStart: 19.8,
    weekEnd: 21,
    color: "#06b6d4",
    description:
      "Underwriter analysts publish initiating coverage reports, typically with positive ratings. Independent analysts also initiate. This creates renewed institutional interest and often a secondary price catalyst.",
    keyActivities: [
      "Book-runner analysts publish Buy/Outperform initiation reports",
      "Co-manager analysts follow with coverage",
      "Independent research firms publish unbiased analysis",
      "Institutional investor post-IPO assessment meetings",
      "Stock often experiences volume surge on initiation day",
    ],
    keyPlayers: ["Buy-Side Analysts", "Sell-Side Research", "Portfolio Managers", "Index Reconstitution Committees"],
    secRequirements: "Regulation AC: analysts must certify independence of views in research reports.",
    riskNote: "Conflict of interest: underwriter analysts have incentive to publish positive coverage to support banking relationships.",
  },
  {
    id: 9,
    name: "Lock-Up Expiry",
    shortName: "Lock-Up Expires",
    duration: "1 day (180 days post-IPO)",
    weekStart: 37,
    weekEnd: 37.2,
    color: "#ef4444",
    description:
      "Lock-up agreements (typically 180 days) restricting insider share sales expire. Pre-IPO investors (VC, PE, founders, employees) can now sell. This creates significant selling pressure and often stock price decline.",
    keyActivities: [
      "Lock-up expiry triggers insider selling window",
      "Company may negotiate 'staggered' lock-up releases for key insiders",
      "10b5-1 trading plans often pre-established for systematic insider selling",
      "Underwriter may negotiate extended lock-up with key investors",
      "Post-lock-up trading volume spikes 2–5x average",
      "Index inclusion / exclusion often coincides with float increase",
    ],
    keyPlayers: ["Founders/Insiders", "VC/PE Investors", "Stock Plan Administrator", "Transfer Agent"],
    secRequirements: "Form 4 filings required within 2 business days of any insider transaction (Section 16).",
    riskNote: "Studies show average -3% to -5% abnormal return around lock-up expiry due to anticipated selling pressure.",
  },
];

const S1_SECTIONS = [
  {
    item: "Item 1",
    title: "Business",
    description: "Company overview, products/services, competitive landscape, growth strategy, regulatory environment.",
  },
  {
    item: "Item 1A",
    title: "Risk Factors",
    description: "Exhaustive list of material risks. Longest section; typically 30–60 pages. Legally protective boilerplate mixed with genuine risks.",
  },
  {
    item: "Item 2",
    title: "Properties",
    description: "Physical locations, lease terms, owned vs. leased facilities.",
  },
  {
    item: "Item 3",
    title: "Legal Proceedings",
    description: "Material litigation, regulatory investigations, government proceedings.",
  },
  {
    item: "Item 5",
    title: "Market for Registrant's Common Equity",
    description: "Dividend policy, stockholder count, stock repurchase programs.",
  },
  {
    item: "Item 6",
    title: "Selected Financial Data",
    description: "5-year summary financial data (required for large accelerated filers).",
  },
  {
    item: "Item 7",
    title: "MD&A",
    description: "Management's Discussion & Analysis — most read section. Explains financial results, trends, liquidity, capital resources.",
  },
  {
    item: "Item 8",
    title: "Financial Statements",
    description: "GAAP-audited income statement, balance sheet, cash flows, notes. 2–3 years required.",
  },
  {
    item: "Item 11",
    title: "Executive Compensation",
    description: "CEO/CFO/named executive pay, equity grants, employment agreements, severance terms.",
  },
  {
    item: "Item 13",
    title: "Related Party Transactions",
    description: "Any transactions between company and insiders, affiliates, or related parties above materiality threshold.",
  },
];

const NOTABLE_IPOS: NotableIPO[] = [
  { company: "Airbnb", ticker: "ABNB", year: 2020, sector: "Travel Tech", offerPrice: 68, firstDayClose: 144.7, oneYearReturn: 12, status: "success", notes: "Priced at $68, opened at $146 — left $2.4B on the table. Post-pandemic recovery drove 1-year gains." },
  { company: "DoorDash", ticker: "DASH", year: 2020, sector: "Delivery", offerPrice: 102, firstDayClose: 189.5, oneYearReturn: -22, status: "mixed", notes: "85% first-day pop; concerns about unit economics and competition drove 1-year underperformance vs S&P." },
  { company: "Rivian", ticker: "RIVN", year: 2021, sector: "EV", offerPrice: 78, firstDayClose: 100.7, oneYearReturn: -75, status: "decline", notes: "Largest IPO since FB at $66.5B valuation. Production ramp challenges and rising rates crushed post-IPO performance." },
  { company: "WeWork (withdrawn)", ticker: "WE", year: 2019, sector: "Real Estate", offerPrice: 0, firstDayClose: 0, oneYearReturn: null, status: "withdrawn", notes: "Filed at $47B valuation; SEC concerns about governance, related-party transactions, and losses forced withdrawal. Later SPAC'd at $9B." },
  { company: "Arm Holdings", ticker: "ARM", year: 2023, sector: "Semiconductors", offerPrice: 51, firstDayClose: 63.6, oneYearReturn: 86, status: "success", notes: "SoftBank retained 90% of shares; limited float drove volatility. AI chip demand narrative boosted 1-year returns significantly." },
  { company: "Reddit", ticker: "RDDT", year: 2024, sector: "Social Media", offerPrice: 34, firstDayClose: 50.4, oneYearReturn: 182, status: "success", notes: "Allocated shares to power users ('redditors') — unusual retail-first allocation. AI data licensing deals drove strong post-IPO run." },
  { company: "Instacart (Maplebear)", ticker: "CART", year: 2023, sector: "Grocery Delivery", offerPrice: 30, firstDayClose: 33.7, oneYearReturn: -8, status: "mixed", notes: "Cut valuation from $39B to $10B pre-IPO. Grocery delivery margin concerns weighed on post-IPO performance." },
  { company: "Cava Group", ticker: "CAVA", year: 2023, sector: "Restaurants", offerPrice: 22, firstDayClose: 42.5, oneYearReturn: 180, status: "success", notes: "99% first-day pop; strong unit economics and 'next Chipotle' narrative drove exceptional 1-year performance." },
  { company: "Klaviyo", ticker: "KVYO", year: 2023, sector: "SaaS", offerPrice: 30, firstDayClose: 36.8, oneYearReturn: 22, status: "mixed", notes: "Shopify as anchor investor (took 9% stake). SaaS valuation compression limited upside vs peak private valuations." },
  { company: "BioAtla", ticker: "BCAB", year: 2020, sector: "Biotech", offerPrice: 14, firstDayClose: 39.2, oneYearReturn: -68, status: "decline", notes: "180% first-day pop; clinical trial failures drove dramatic 1-year decline — typical high-risk biotech IPO pattern." },
];

const VINTAGE_YEARS: VintageYear[] = [
  { year: 2019, avgReturn: 23, dealCount: 164, totalRaise: 46 },
  { year: 2020, avgReturn: 75, dealCount: 165, totalRaise: 67 },
  { year: 2021, avgReturn: -15, dealCount: 397, totalRaise: 142 },
  { year: 2022, avgReturn: -35, dealCount: 71, totalRaise: 7 },
  { year: 2023, avgReturn: 28, dealCount: 108, totalRaise: 19 },
  { year: 2024, avgReturn: 18, dealCount: 183, totalRaise: 31 },
];

const COMPARISON_DIMENSIONS: ComparisonDimension[] = [
  { dimension: "New Capital Raised", traditional: "Yes — primary offering", directListing: "No (initially) / Yes with direct floor offering", spac: "Yes — via SPAC trust", advantage: "traditional" },
  { dimension: "Underwriter Required", traditional: "Yes — mandatory, 7% fee", directListing: "No (financial advisors only)", spac: "Yes — at SPAC IPO stage", advantage: "direct" },
  { dimension: "Price Discovery", traditional: "Book building (pre-set range)", directListing: "Market-driven opening auction", spac: "Negotiated in merger agreement", advantage: "direct" },
  { dimension: "Lock-Up Restrictions", traditional: "180-day lockup for insiders", directListing: "No mandatory lockup", spac: "Varies; founders locked up", advantage: "direct" },
  { dimension: "Retail Access", traditional: "Very limited (institutional priority)", directListing: "Full public market access", spac: "SPAC units tradable from IPO", advantage: "direct" },
  { dimension: "Typical Underwriting Cost", traditional: "5–7% gross spread", directListing: "~1–2% advisory fee", spac: "5.5% deferred + 2% upfront", advantage: "direct" },
  { dimension: "Timeline to Listing", traditional: "12–24 months", directListing: "6–12 months", spac: "De-SPAC: 3–6 months post-merger", advantage: "spac" },
  { dimension: "Regulatory Scrutiny", traditional: "Full SEC S-1 review", directListing: "Full SEC S-1 review", spac: "Initial S-1 + proxy/S-4 later", advantage: "spac" },
  { dimension: "Earnings Projections", traditional: "Historical only (safe harbor limited)", directListing: "Historical only", spac: "Forward projections allowed", advantage: "spac" },
  { dimension: "Share Dilution", traditional: "New shares issued to raise capital", directListing: "Existing shares only (no dilution)", spac: "SPAC warrants dilute shareholders", advantage: "direct" },
  { dimension: "Valuation Certainty", traditional: "Set night before; market-driven after", directListing: "Full market uncertainty", spac: "Fixed negotiated value", advantage: "spac" },
  { dimension: "Employee Liquidity", traditional: "Post-lockup only", directListing: "Immediate at listing", spac: "Depends on earnout/lockup terms", advantage: "direct" },
  { dimension: "Sponsor Economics", traditional: "N/A", directListing: "N/A", spac: "20% promote (free shares for sponsor)", advantage: "neutral" },
  { dimension: "Redemption Rights", traditional: "None", directListing: "None", spac: "Shareholders can redeem at ~$10/share", advantage: "spac" },
  { dimension: "Historical Avg 2-Yr Return", traditional: "+18% vs market", directListing: "+31% (Spotify/Slack/Palantir)", spac: "-49% vs market (2020–2022 cohort)", advantage: "direct" },
];

const SPAC_PERFORMANCE = [
  { cohort: "2017–2018", spacReturn: 18, ipoReturn: 22, spReturn: 35 },
  { cohort: "2019", spacReturn: 12, ipoReturn: 32, spReturn: 28 },
  { cohort: "2020", spacReturn: -28, ipoReturn: 68, spReturn: 18 },
  { cohort: "2021", spacReturn: -54, ipoReturn: -18, spReturn: 28 },
  { cohort: "2022", spacReturn: -31, ipoReturn: -42, spReturn: -18 },
  { cohort: "2023", spacReturn: -15, ipoReturn: 24, spReturn: 26 },
];

// ── Utility ───────────────────────────────────────────────────────────────────

function fmtPct(v: number, decimals = 1) {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(decimals)}%`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  color = "blue",
}: {
  label: string;
  value: string;
  color?: "blue" | "green" | "purple" | "amber" | "red" | "cyan";
}) {
  const colors = {
    blue: "bg-primary/10 border-border text-primary",
    green: "bg-green-500/10 border-green-500/30 text-green-400",
    purple: "bg-primary/10 border-border text-primary",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    red: "bg-red-500/10 border-red-500/30 text-red-400",
    cyan: "bg-cyan-500/10 border-cyan-500/30 text-muted-foreground",
  };
  return (
    <div className={cn("border rounded-lg px-3 py-2 text-center", colors[color])}>
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}

// ── Tab 1: IPO Timeline ───────────────────────────────────────────────────────

function IPOTimelineTab() {
  const [selectedStep, setSelectedStep] = useState<TimelineStep | null>(TIMELINE_STEPS[0]);
  const [showS1, setShowS1] = useState(false);

  const totalWeeks = 38;
  const ganttWidth = 560;
  const rowHeight = 28;
  const labelWidth = 100;
  const chartWidth = ganttWidth - labelWidth;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatChip label="Avg IPO Timeline" value="12–18 months" color="blue" />
        <StatChip label="S-1 Review Rounds" value="2–4 rounds" color="purple" />
        <StatChip label="Lock-Up Period" value="180 days" color="amber" />
        <StatChip label="Quiet Period" value="25 days" color="cyan" />
      </div>

      {/* Interactive Timeline Steps */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-4">IPO Process — Click Each Step for Detail</h3>
        <div className="flex flex-wrap gap-2 mb-5">
          {TIMELINE_STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setSelectedStep(step === selectedStep ? null : step)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                selectedStep?.id === step.id
                  ? "border-foreground/30 text-white"
                  : "border-border text-white/50 hover:text-white/80 hover:border-border"
              )}
              style={
                selectedStep?.id === step.id
                  ? { backgroundColor: step.color + "30", borderColor: step.color + "80", color: step.color }
                  : {}
              }
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: step.color + "40", color: step.color }}>
                {step.id}
              </span>
              {step.shortName}
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          {selectedStep && (
            <motion.div
              key={selectedStep.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="border rounded-xl p-5 space-y-4"
              style={{ borderColor: selectedStep.color + "40", backgroundColor: selectedStep.color + "08" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: selectedStep.color + "30", color: selectedStep.color }}>
                      {selectedStep.id}
                    </span>
                    <h4 className="text-base font-semibold text-white">{selectedStep.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-xs text-white/50">{selectedStep.duration}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedStep(null)} className="text-white/30 hover:text-white/70">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-white/70 leading-relaxed">{selectedStep.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-white/50 mb-2">Key Activities</div>
                  <ul className="space-y-1">
                    {selectedStep.keyActivities.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: selectedStep.color }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-white/50 mb-2">Key Players</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedStep.keyPlayers.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs border border-border text-white/60">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white/50 mb-2">SEC Requirements</div>
                    <p className="text-xs text-white/60 leading-relaxed">{selectedStep.secRequirements}</p>
                  </div>
                  <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300/80 leading-relaxed">{selectedStep.riskNote}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SVG Gantt Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-4">Typical IPO Timeline — Gantt Chart (weeks)</h3>
        <div className="overflow-x-auto">
          <svg width={ganttWidth} height={TIMELINE_STEPS.length * rowHeight + 40} className="min-w-0">
            {/* Week labels */}
            {[0, 4, 8, 12, 16, 20, 24, 30, 37].map((w) => {
              const x = labelWidth + (w / totalWeeks) * chartWidth;
              return (
                <g key={w}>
                  <line x1={x} y1={0} x2={x} y2={TIMELINE_STEPS.length * rowHeight + 10} stroke="#ffffff15" strokeWidth={1} />
                  <text x={x} y={TIMELINE_STEPS.length * rowHeight + 24} textAnchor="middle" fill="#ffffff50" fontSize={9}>
                    W{w}
                  </text>
                </g>
              );
            })}
            {/* Rows */}
            {TIMELINE_STEPS.map((step, i) => {
              const barX = labelWidth + (step.weekStart / totalWeeks) * chartWidth;
              const barW = Math.max(4, ((step.weekEnd - step.weekStart) / totalWeeks) * chartWidth);
              const y = i * rowHeight + 4;
              return (
                <g key={step.id} onClick={() => setSelectedStep(step)} className="cursor-pointer">
                  <text x={labelWidth - 4} y={y + 12} textAnchor="end" fill="#ffffff60" fontSize={9}>
                    {step.id}. {step.shortName.slice(0, 14)}
                  </text>
                  <rect
                    x={barX}
                    y={y}
                    width={barW}
                    height={rowHeight - 6}
                    rx={3}
                    fill={step.color}
                    fillOpacity={selectedStep?.id === step.id ? 0.8 : 0.4}
                    stroke={step.color}
                    strokeOpacity={0.6}
                    strokeWidth={1}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* S-1 Key Sections */}
      <div className="bg-card border border-border rounded-xl p-5">
        <button
          onClick={() => setShowS1(!showS1)}
          className="flex items-center justify-between w-full text-sm font-semibold text-white/80"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            S-1 Registration Statement — Key Sections Explainer
          </span>
          <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", showS1 && "rotate-180")} />
        </button>
        <AnimatePresence>
          {showS1 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {S1_SECTIONS.map((sec) => (
                  <div key={sec.item} className="bg-foreground/[0.03] border border-border/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-primary">{sec.item}</span>
                      <span className="text-xs font-semibold text-white/90">{sec.title}</span>
                    </div>
                    <p className="text-xs text-white/55 leading-relaxed">{sec.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SEC Review Process */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          SEC Review Process
        </h3>
        <div className="flex flex-col md:flex-row gap-3">
          {[
            { step: "Initial Review", days: "30 days", desc: "SEC staff conducts full review, issues comment letter with questions on financial statements, risk factors, disclosure adequacy." },
            { step: "Company Response", days: "30–60 days", desc: "Company and counsel respond to each SEC comment in writing. May file S-1/A amendment. Round 2 comments typical." },
            { step: "Resolution", days: "15–30 days", desc: "SEC issues no-further-comments letter or declares registration effective. Company can then proceed to roadshow." },
          ].map((item, i) => (
            <div key={i} className="flex-1 bg-green-500/5 border border-green-500/15 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                <span className="text-xs font-semibold text-green-400">{item.step}</span>
                <span className="text-xs text-white/40 ml-auto">{item.days}</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Book Building & Pricing ────────────────────────────────────────────

function BookBuildingTab() {
  const [activeSection, setActiveSection] = useState<"bookbuild" | "greenshoe" | "pricing" | "underwriter">("bookbuild");

  resetSeed(891 + 100);

  // Demand curve data
  const demandCurve = useMemo(() => {
    resetSeed(891 + 200);
    return Array.from({ length: 12 }, (_, i) => {
      const price = 20 + i * 2;
      const demand = Math.max(0.5, 18 - i * 1.2 + rand() * 0.5);
      return { price, demand };
    });
  }, []);

  const svgW = 480;
  const svgH = 220;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const maxDemand = Math.max(...demandCurve.map((d) => d.demand));
  const minPrice = demandCurve[0].price;
  const maxPrice = demandCurve[demandCurve.length - 1].price;

  const px = (price: number) => padL + ((price - minPrice) / (maxPrice - minPrice)) * plotW;
  const py = (demand: number) => padT + plotH - (demand / maxDemand) * plotH;

  const demandPath = demandCurve
    .map((d, i) => `${i === 0 ? "M" : "L"} ${px(d.price)} ${py(d.demand)}`)
    .join(" ");

  // Final price intersection
  const ipoPrice = 34;
  const ixPx = px(ipoPrice);

  return (
    <div className="space-y-6">
      {/* Section Nav */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "bookbuild" as const, label: "Book Building", icon: BookOpen },
          { id: "greenshoe" as const, label: "Greenshoe Option", icon: Shield },
          { id: "pricing" as const, label: "IPO Pricing", icon: DollarSign },
          { id: "underwriter" as const, label: "Underwriter Economics", icon: Percent },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              activeSection === id
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-foreground/[0.03] border-border text-white/50 hover:text-white/80"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeSection === "bookbuild" && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-4">Book Building — Demand Curve Construction</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SVG demand curve */}
                  <div>
                    <svg width={svgW} height={svgH} className="max-w-full">
                      {/* Grid */}
                      {[0.25, 0.5, 0.75, 1].map((frac) => {
                        const yy = padT + plotH * (1 - frac);
                        return (
                          <g key={frac}>
                            <line x1={padL} y1={yy} x2={padL + plotW} y2={yy} stroke="#ffffff10" strokeWidth={1} />
                            <text x={padL - 6} y={yy + 4} textAnchor="end" fill="#ffffff40" fontSize={9}>
                              {(frac * maxDemand).toFixed(0)}x
                            </text>
                          </g>
                        );
                      })}
                      {/* X axis labels */}
                      {demandCurve.filter((_, i) => i % 3 === 0).map((d) => (
                        <text key={d.price} x={px(d.price)} y={padT + plotH + 16} textAnchor="middle" fill="#ffffff40" fontSize={9}>
                          ${d.price}
                        </text>
                      ))}
                      {/* Axes */}
                      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#ffffff20" strokeWidth={1} />
                      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#ffffff20" strokeWidth={1} />
                      {/* Area fill */}
                      <path
                        d={`${demandPath} L ${px(maxPrice)} ${padT + plotH} L ${px(minPrice)} ${padT + plotH} Z`}
                        fill="url(#demandGrad)"
                      />
                      <defs>
                        <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      {/* Demand curve */}
                      <path d={demandPath} fill="none" stroke="#3b82f6" strokeWidth={2} />
                      {/* IPO price line */}
                      <line x1={ixPx} y1={padT} x2={ixPx} y2={padT + plotH} stroke="#f97316" strokeWidth={1.5} strokeDasharray="4 3" />
                      <text x={ixPx + 4} y={padT + 14} fill="#f97316" fontSize={9}>
                        IPO Price $34
                      </text>
                      {/* Axis labels */}
                      <text x={padL + plotW / 2} y={svgH - 4} textAnchor="middle" fill="#ffffff40" fontSize={9}>
                        Offer Price ($)
                      </text>
                      <text x={10} y={padT + plotH / 2} textAnchor="middle" fill="#ffffff40" fontSize={9}
                        transform={`rotate(-90, 10, ${padT + plotH / 2})`}>
                        Oversubscription
                      </text>
                    </svg>
                    <p className="text-xs text-white/40 text-center mt-1">
                      Demand falls as price rises. At $34, book is ~10x oversubscribed.
                    </p>
                  </div>

                  {/* Process steps */}
                  <div className="space-y-3">
                    {[
                      { phase: "Pre-Marketing", desc: "Underwriters gauge investor appetite informally. Identify anchor investors (sovereign wealth, large asset managers) who signal at wide price range." },
                      { phase: "Book Open", desc: "Official order book opens. IOIs collected: price, size, and condition (e.g., 'will buy up to 500k shares at market price'). No binding commitment yet." },
                      { phase: "Price Revision", desc: "Based on IOI quality, bookrunner revises range. Upward revision = strong demand signal. Oversubscription target: 10–20x for healthy deal." },
                      { phase: "Allocation", desc: "Bookrunner allocates shares discretionarily: reward long-term holders, penalize flippers. Institutional investors get 80–95%; retail gets 5–20%." },
                    ].map((p, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white/80">{p.phase}</div>
                          <p className="text-xs text-white/55 leading-relaxed">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Retail vs Institutional */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-4">Retail vs Institutional Allocation</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <StatChip label="Institutional" value="80–95%" color="blue" />
                  <StatChip label="Retail (typical)" value="5–15%" color="purple" />
                  <StatChip label="Directed Shares" value="Up to 5%" color="green" />
                  <StatChip label="Anchor Investors" value="20–30%" color="amber" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary/5 border border-border rounded-lg p-4">
                    <div className="text-xs font-semibold text-primary mb-2">Institutional Advantages</div>
                    <ul className="space-y-1 text-xs text-white/60">
                      <li className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-primary mt-0.5" />Priority allocation in hot deals</li>
                      <li className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-primary mt-0.5" />Can indicate at IPO price (firm commitment)</li>
                      <li className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-primary mt-0.5" />Access to management roadshow 1-on-1s</li>
                      <li className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-primary mt-0.5" />Receive analyst research before quiet period ends</li>
                    </ul>
                  </div>
                  <div className="bg-primary/5 border border-border rounded-lg p-4">
                    <div className="text-xs font-semibold text-primary mb-2">Retail Options</div>
                    <ul className="space-y-1 text-xs text-white/60">
                      <li className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 text-primary mt-0.5" />Directed Share Programs (employees, customers)</li>
                      <li className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 text-primary mt-0.5" />Broker IPO allocations (Schwab, Fidelity, TD)</li>
                      <li className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 text-primary mt-0.5" />Retail platforms: IBKR, Robinhood (select deals)</li>
                      <li className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 text-primary mt-0.5" />Reddit-style allocation (RDDT precedent)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Underpricing phenomenon */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-2">The Underpricing Phenomenon</h3>
                <p className="text-xs text-white/60 mb-4 leading-relaxed">
                  Academic research documents persistent IPO underpricing globally — average first-day returns of ~15–20% in the US. This represents money
                  "left on the table" by issuers but benefits underwriters (investor relationships) and early institutional buyers.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <StatChip label="US Avg First-Day Pop" value="+20%" color="green" />
                  <StatChip label="Avg 3-Year Return vs Market" value="-18%" color="red" />
                  <StatChip label="Money Left on Table (avg)" value="$50–200M" color="amber" />
                </div>
                <div className="mt-3 text-xs text-white/50 leading-relaxed">
                  <strong className="text-white/70">Why underpricing persists:</strong> Underwriters maintain investor relationships, ensure aftermarket stability, reduce lawsuit risk from price drops, and signal deal quality. The 7% gross spread is direct compensation; underpricing is indirect.
                </div>
              </div>
            </div>
          )}

          {activeSection === "greenshoe" && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-4">Greenshoe / Over-Allotment Option Mechanics</h3>
                <p className="text-xs text-white/60 mb-5 leading-relaxed">
                  Named after Green Shoe Manufacturing (first issuer in 1963), the greenshoe allows underwriters to sell up to 15% more shares than planned
                  and use the proceeds to stabilize the stock price post-IPO. It's the primary price stabilization tool.
                </p>

                {/* SVG Greenshoe Flow */}
                <div className="overflow-x-auto">
                  <svg width={580} height={280} className="min-w-0">
                    {/* Box: Issuer */}
                    <rect x={20} y={100} width={110} height={50} rx={6} fill="#3b82f620" stroke="#3b82f640" strokeWidth={1} />
                    <text x={75} y={122} textAnchor="middle" fill="#93c5fd" fontSize={10} fontWeight="bold">Issuer</text>
                    <text x={75} y={137} textAnchor="middle" fill="#93c5fd80" fontSize={9}>100% of shares</text>
                    {/* Arrow to Underwriter */}
                    <line x1={130} y1={125} x2={175} y2={125} stroke="#ffffff30" strokeWidth={1.5} markerEnd="url(#arr)" />
                    {/* Box: Underwriter */}
                    <rect x={175} y={100} width={120} height={50} rx={6} fill="#a855f720" stroke="#a855f740" strokeWidth={1} />
                    <text x={235} y={122} textAnchor="middle" fill="#c4b5fd" fontSize={10} fontWeight="bold">Underwriter</text>
                    <text x={235} y={137} textAnchor="middle" fill="#c4b5fd80" fontSize={9}>sells 115% of deal</text>
                    {/* Arrow down to short position */}
                    <line x1={235} y1={150} x2={235} y2={190} stroke="#ffffff30" strokeWidth={1.5} markerEnd="url(#arr)" />
                    {/* Box: Short Position */}
                    <rect x={175} y={190} width={120} height={50} rx={6} fill="#ef444420" stroke="#ef444440" strokeWidth={1} />
                    <text x={235} y={212} textAnchor="middle" fill="#fca5a5" fontSize={10} fontWeight="bold">Short Position</text>
                    <text x={235} y={227} textAnchor="middle" fill="#fca5a580" fontSize={9}>15% oversold</text>
                    {/* Two arrows from short — stabilize or exercise */}
                    {/* If price drops */}
                    <line x1={175} y1={215} x2={120} y2={215} stroke="#22c55e50" strokeWidth={1.5} markerEnd="url(#arrGreen)" />
                    <rect x={10} y={200} width={110} height={50} rx={6} fill="#22c55e20" stroke="#22c55e40" strokeWidth={1} />
                    <text x={65} y={218} textAnchor="middle" fill="#86efac" fontSize={9} fontWeight="bold">Buy in Market</text>
                    <text x={65} y={231} textAnchor="middle" fill="#86efac80" fontSize={8}>Price drops — buy</text>
                    <text x={65} y={243} textAnchor="middle" fill="#86efac80" fontSize={8}>to cover short</text>
                    <text x={65} y={258} textAnchor="middle" fill="#22c55e" fontSize={8}>(Price Support)</text>
                    {/* If price rises */}
                    <line x1={295} y1={215} x2={350} y2={215} stroke="#f9731650" strokeWidth={1.5} markerEnd="url(#arrOrange)" />
                    <rect x={350} y={200} width={120} height={50} rx={6} fill="#f9731620" stroke="#f9731640" strokeWidth={1} />
                    <text x={410} y={218} textAnchor="middle" fill="#fdba74" fontSize={9} fontWeight="bold">Exercise Option</text>
                    <text x={410} y={231} textAnchor="middle" fill="#fdba7480" fontSize={8}>Buy 15% from issuer</text>
                    <text x={410} y={243} textAnchor="middle" fill="#fdba7480" fontSize={8}>at IPO price</text>
                    <text x={410} y={258} textAnchor="middle" fill="#f97316" fontSize={8}>(Cover Short Position)</text>
                    {/* Labels */}
                    <text x={148} y={195} fill="#22c55e70" fontSize={8} textAnchor="middle">if price falls</text>
                    <text x={320} y={195} fill="#f9731670" fontSize={8} textAnchor="middle">if price rises</text>
                    <defs>
                      <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#ffffff30" />
                      </marker>
                      <marker id="arrGreen" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e50" />
                      </marker>
                      <marker id="arrOrange" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#f9731650" />
                      </marker>
                    </defs>
                  </svg>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <StatChip label="Max Over-Allotment" value="15%" color="amber" />
                  <StatChip label="Exercise Period" value="30 days" color="blue" />
                  <StatChip label="Result (price up)" value="Issuer gets extra 15%" color="green" />
                  <StatChip label="Result (price down)" value="Market support bid" color="red" />
                </div>
              </div>
            </div>
          )}

          {activeSection === "pricing" && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-4">IPO Pricing Determinants</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      method: "Comparable Company Analysis",
                      color: "#3b82f6",
                      steps: [
                        "Select public comps in same sector",
                        "Calculate EV/Revenue, EV/EBITDA, P/E multiples",
                        "Apply discount for illiquidity premium (10–20%)",
                        "Derive implied equity value and price per share",
                      ],
                      note: "Most common primary method. Sensitive to comp selection.",
                    },
                    {
                      method: "DCF Valuation",
                      color: "#8b5cf6",
                      steps: [
                        "Project 5–10 year free cash flows",
                        "Select terminal growth rate (2–4%)",
                        "Apply WACC discount (8–15%)",
                        "Sum PV of cash flows + terminal value",
                      ],
                      note: "Used as cross-check. Highly sensitive to growth assumptions.",
                    },
                    {
                      method: "Market Conditions",
                      color: "#f97316",
                      steps: [
                        "VIX level and broad market sentiment",
                        "Recent IPO aftermarket performance",
                        "Sector-specific investor demand",
                        "Roadshow IOI quality (coverage ratio)",
                      ],
                      note: "Overrides fundamentals in extreme environments.",
                    },
                  ].map((m) => (
                    <div key={m.method} className="border rounded-xl p-4" style={{ borderColor: m.color + "30", backgroundColor: m.color + "08" }}>
                      <div className="text-sm font-semibold mb-3" style={{ color: m.color }}>{m.method}</div>
                      <ol className="space-y-1.5 mb-3">
                        {m.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-white/65">
                            <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: m.color + "bb" }}>{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                      <div className="text-xs text-white/45 italic">{m.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "underwriter" && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-4">Underwriter Economics — The 7% Gross Spread</h3>
                <p className="text-xs text-white/60 mb-4 leading-relaxed">
                  For mid-size IPOs ($50M–$500M), the standard gross spread is 7% of total proceeds, split among the underwriting syndicate.
                  For large mega-IPOs, spreads compress to 3–5%.
                </p>

                {/* SVG spread breakdown */}
                <div className="mb-5">
                  <svg width={480} height={100} className="max-w-full">
                    {/* 7% bar split into 3 parts */}
                    {[
                      { label: "Management Fee", pct: 20, color: "#3b82f6", desc: "20% of spread" },
                      { label: "Underwriting Fee", pct: 20, color: "#8b5cf6", desc: "20% of spread" },
                      { label: "Selling Concession", pct: 60, color: "#f97316", desc: "60% of spread" },
                    ].reduce<{ items: Array<{ label: string; pct: number; color: string; desc: string; startX: number }>; cx: number }>(
                      (acc, item) => {
                        const startX = acc.cx;
                        acc.items.push({ ...item, startX });
                        acc.cx += (item.pct / 100) * 440;
                        return acc;
                      },
                      { items: [], cx: 20 }
                    ).items.map((item) => (
                      <g key={item.label}>
                        <rect x={item.startX} y={20} width={(item.pct / 100) * 440} height={32} rx={4}
                          fill={item.color} fillOpacity={0.3} stroke={item.color} strokeOpacity={0.5} strokeWidth={1} />
                        <text x={item.startX + (item.pct / 100) * 440 / 2} y={40} textAnchor="middle" fill={item.color} fontSize={10} fontWeight="bold">
                          {item.label}
                        </text>
                        <text x={item.startX + (item.pct / 100) * 440 / 2} y={66} textAnchor="middle" fill="#ffffff50" fontSize={9}>
                          {item.desc}
                        </text>
                      </g>
                    ))}
                    <text x={240} y={95} textAnchor="middle" fill="#ffffff40" fontSize={9}>
                      Total Gross Spread: 7% of IPO proceeds
                    </text>
                  </svg>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-white/60 mb-2">Spread Economics Example ($500M IPO)</div>
                    <div className="space-y-2">
                      {[
                        { item: "Total Proceeds", value: "$500M", highlight: false },
                        { item: "Gross Spread (7%)", value: "$35M", highlight: false },
                        { item: "Management Fee (20%)", value: "$7M → Lead bank", highlight: true },
                        { item: "Underwriting Fee (20%)", value: "$7M → Syndicate pro-rata", highlight: true },
                        { item: "Selling Concession (60%)", value: "$21M → Selling brokers", highlight: true },
                        { item: "Net Proceeds to Issuer", value: "$465M", highlight: false },
                      ].map((row) => (
                        <div key={row.item} className={cn("flex justify-between text-xs py-1 border-b border-border/50", row.highlight && "bg-foreground/[0.03] px-2 rounded")}>
                          <span className="text-white/60">{row.item}</span>
                          <span className="text-white/85 font-medium">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white/60 mb-2">Syndicate Structure</div>
                    <div className="space-y-2">
                      {[
                        { role: "Book-Running Lead Manager", share: "40–60%", desc: "Builds the book, sets price, manages allocation" },
                        { role: "Co-Lead Managers", share: "20–30%", desc: "Bring institutional investors, share in economics" },
                        { role: "Co-Managers", share: "10–20%", desc: "Regional or specialist banks; smaller economics" },
                        { role: "Selling Group Members", share: "Selling concession only", desc: "Retail brokers, no underwriting risk" },
                      ].map((r) => (
                        <div key={r.role} className="bg-foreground/[0.03] border border-border/50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-white/80">{r.role}</span>
                            <span className="text-xs text-primary">{r.share}</span>
                          </div>
                          <p className="text-xs text-white/50">{r.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Tab 3: Market Analysis ────────────────────────────────────────────────────

function MarketAnalysisTab() {
  const [sortCol, setSortCol] = useState<"firstDay" | "oneYear" | "offerPrice">("firstDay");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const sorted = useMemo(() => {
    return [...NOTABLE_IPOS].sort((a, b) => {
      if (sortCol === "firstDay") return sortDir * ((a.firstDayClose - a.offerPrice) / Math.max(a.offerPrice, 1) - (b.firstDayClose - b.offerPrice) / Math.max(b.offerPrice, 1));
      if (sortCol === "oneYear") return sortDir * ((a.oneYearReturn ?? -999) - (b.oneYearReturn ?? -999));
      return sortDir * (a.offerPrice - b.offerPrice);
    });
  }, [sortCol, sortDir]);

  function toggleSort(col: typeof sortCol) {
    if (sortCol === col) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortCol(col); setSortDir(-1); }
  }

  // Vintage year bar chart
  const vintageMax = Math.max(...VINTAGE_YEARS.map((v) => Math.abs(v.avgReturn)));
  const barW = 60;
  const barGap = 8;
  const chartH = 180;
  const zeroY = 100;

  // Lock-up pressure SVG
  resetSeed(891 + 300);
  const lockupDays = Array.from({ length: 30 }, (_, i) => {
    const day = i - 5;
    const pressure = day < 0 ? 0 : Math.max(0, 8 - day * 0.4 + rand() * 2 - 1);
    return { day, pressure };
  });

  return (
    <div className="space-y-6">
      {/* Notable IPOs Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-white/80">10 Notable IPOs — Performance Data</h3>
          <p className="text-xs text-white/45 mt-0.5">Click column headers to sort. 1-year returns are vs offer price.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-foreground/[0.03]">
                <th className="px-4 py-2.5 text-left text-white/50">Company</th>
                <th className="px-3 py-2.5 text-left text-white/50">Sector</th>
                <th className="px-3 py-2.5 text-right text-white/50">Year</th>
                <th className="px-3 py-2.5 text-right cursor-pointer text-white/50 hover:text-white/80 select-none"
                  onClick={() => toggleSort("offerPrice")}>
                  Offer {sortCol === "offerPrice" && (sortDir === -1 ? "↓" : "↑")}
                </th>
                <th className="px-3 py-2.5 text-right text-white/50">1st Day</th>
                <th className="px-3 py-2.5 text-right cursor-pointer text-white/50 hover:text-white/80 select-none"
                  onClick={() => toggleSort("firstDay")}>
                  1D Chg {sortCol === "firstDay" && (sortDir === -1 ? "↓" : "↑")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer text-white/50 hover:text-white/80 select-none"
                  onClick={() => toggleSort("oneYear")}>
                  1Yr {sortCol === "oneYear" && (sortDir === -1 ? "↓" : "↑")}
                </th>
                <th className="px-4 py-2.5 text-left text-white/50">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((ipo) => {
                const firstDayChg = ipo.offerPrice > 0 ? ((ipo.firstDayClose - ipo.offerPrice) / ipo.offerPrice) * 100 : null;
                const statusColors: Record<NotableIPO["status"], string> = {
                  success: "text-green-400",
                  mixed: "text-amber-400",
                  withdrawn: "text-muted-foreground",
                  decline: "text-red-400",
                };
                return (
                  <tr key={ipo.ticker} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-white/90">{ipo.company}</div>
                      <div className="text-white/40">{ipo.ticker}</div>
                    </td>
                    <td className="px-3 py-2.5 text-white/60">{ipo.sector}</td>
                    <td className="px-3 py-2.5 text-right text-white/60">{ipo.year}</td>
                    <td className="px-3 py-2.5 text-right text-white/85">
                      {ipo.offerPrice > 0 ? `$${ipo.offerPrice}` : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-white/85">
                      {ipo.firstDayClose > 0 ? `$${ipo.firstDayClose}` : "—"}
                    </td>
                    <td className={cn("px-3 py-2.5 text-right font-medium", firstDayChg === null ? "text-muted-foreground" : firstDayChg >= 0 ? "text-green-400" : "text-red-400")}>
                      {firstDayChg === null ? "—" : fmtPct(firstDayChg)}
                    </td>
                    <td className={cn("px-3 py-2.5 text-right font-medium", ipo.oneYearReturn === null ? "text-muted-foreground" : ipo.oneYearReturn >= 0 ? "text-green-400" : "text-red-400")}>
                      {ipo.oneYearReturn === null ? "—" : fmtPct(ipo.oneYearReturn)}
                    </td>
                    <td className="px-4 py-2.5 text-white/45 max-w-[220px]">
                      <span className={cn("font-medium mr-1", statusColors[ipo.status])}>
                        [{ipo.status}]
                      </span>
                      {ipo.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vintage Year Returns + Lock-up Expiry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Vintage Year Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-1">IPO Vintage Year Avg Returns</h3>
          <p className="text-xs text-white/40 mb-4">Average first-year return by cohort year</p>
          <svg width={VINTAGE_YEARS.length * (barW + barGap) + 20} height={chartH + 50} className="max-w-full">
            {/* Zero line */}
            <line x1={10} y1={zeroY} x2={VINTAGE_YEARS.length * (barW + barGap) + 10} y2={zeroY}
              stroke="#ffffff30" strokeWidth={1} />
            {VINTAGE_YEARS.map((v, i) => {
              const x = 10 + i * (barW + barGap);
              const isPos = v.avgReturn >= 0;
              const barH = Math.abs(v.avgReturn / vintageMax) * 80;
              const barY = isPos ? zeroY - barH : zeroY;
              return (
                <g key={v.year}>
                  <rect x={x} y={barY} width={barW} height={barH}
                    rx={3} fill={isPos ? "#22c55e50" : "#ef444450"}
                    stroke={isPos ? "#22c55e80" : "#ef444480"} strokeWidth={1} />
                  <text x={x + barW / 2} y={isPos ? barY - 4 : barY + barH + 12}
                    textAnchor="middle" fill={isPos ? "#86efac" : "#fca5a5"} fontSize={10} fontWeight="bold">
                    {fmtPct(v.avgReturn, 0)}
                  </text>
                  <text x={x + barW / 2} y={chartH + 15} textAnchor="middle" fill="#ffffff50" fontSize={10}>
                    {v.year}
                  </text>
                  <text x={x + barW / 2} y={chartH + 28} textAnchor="middle" fill="#ffffff30" fontSize={8}>
                    {v.dealCount} deals
                  </text>
                  <text x={x + barW / 2} y={chartH + 40} textAnchor="middle" fill="#ffffff30" fontSize={8}>
                    ${v.totalRaise}B
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Lock-up Expiry SVG */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-1">Lock-Up Expiry Selling Pressure</h3>
          <p className="text-xs text-white/40 mb-4">Relative sell volume around 180-day lock-up expiry (day 0)</p>
          <svg width={280} height={160} className="max-w-full">
            {/* Grid */}
            {[0, 0.5, 1].map((f) => (
              <line key={f} x1={30} y1={20 + (1 - f) * 110} x2={270} y2={20 + (1 - f) * 110}
                stroke="#ffffff10" strokeWidth={1} />
            ))}
            {/* Expiry line */}
            <line x1={150} y1={20} x2={150} y2={130} stroke="#ef444460" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={152} y={28} fill="#ef4444" fontSize={8}>Day 0</text>
            {/* Volume bars */}
            {lockupDays.map((d, i) => {
              const x = 30 + (i / (lockupDays.length - 1)) * 240;
              const h = (d.pressure / 10) * 100;
              const isPost = d.day >= 0;
              return (
                <rect key={i} x={x - 3} y={130 - h} width={6} height={h}
                  rx={1}
                  fill={isPost ? "#ef444440" : "#3b82f620"}
                  stroke={isPost ? "#ef444460" : "#3b82f630"}
                  strokeWidth={0.5} />
              );
            })}
            {/* X labels */}
            <text x={30} y={148} textAnchor="middle" fill="#ffffff30" fontSize={8}>-30d</text>
            <text x={150} y={148} textAnchor="middle" fill="#ffffff50" fontSize={8}>Lock-up expires</text>
            <text x={270} y={148} textAnchor="middle" fill="#ffffff30" fontSize={8}>+25d</text>
            {/* Y labels */}
            <text x={24} y={24} textAnchor="end" fill="#ffffff30" fontSize={8}>10x</text>
            <text x={24} y={130} textAnchor="end" fill="#ffffff30" fontSize={8}>0</text>
          </svg>
          <div className="mt-2 text-xs text-white/45 leading-relaxed">
            Studies show -3 to -5% abnormal returns in the week around lock-up expiry. Investors often pre-sell (or buy puts) before Day 0 in anticipation of insider supply.
          </div>
        </div>
      </div>

      {/* Sector Concentration + Quiet Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-3">Sector Concentration Trends</h3>
          <div className="space-y-2">
            {[
              { sector: "Technology", pct2021: 38, pct2023: 28, trend: "down" },
              { sector: "Healthcare/Biotech", pct2021: 22, pct2023: 31, trend: "up" },
              { sector: "Financial Services", pct2021: 12, pct2023: 18, trend: "up" },
              { sector: "Consumer/Retail", pct2021: 15, pct2023: 10, trend: "down" },
              { sector: "Energy/Industrials", pct2021: 8, pct2023: 9, trend: "flat" },
              { sector: "Other", pct2021: 5, pct2023: 4, trend: "down" },
            ].map((row) => (
              <div key={row.sector} className="flex items-center gap-3">
                <div className="w-28 text-xs text-white/60 flex-shrink-0">{row.sector}</div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-12 text-xs text-white/40 text-right">2021:</div>
                  <div className="flex-1 bg-foreground/5 rounded-full h-2">
                    <div className="h-2 rounded-full bg-primary/50" style={{ width: `${row.pct2021}%` }} />
                  </div>
                  <div className="w-8 text-xs text-white/60">{row.pct2021}%</div>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-12 text-xs text-white/40 text-right">2023:</div>
                  <div className="flex-1 bg-foreground/5 rounded-full h-2">
                    <div className={cn("h-2 rounded-full", row.trend === "up" ? "bg-green-500/50" : row.trend === "down" ? "bg-amber-500/40" : "bg-foreground/20")}
                      style={{ width: `${row.pct2023}%` }} />
                  </div>
                  <div className="w-8 text-xs text-white/60">{row.pct2023}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Quiet Period Rules
          </h3>
          <div className="space-y-3">
            {[
              { rule: "25-Day Quiet Period", desc: "FINRA Rule 2241: Underwriter analysts cannot publish research for 25 days after IPO. Prevents biased promotional coverage immediately post-listing.", type: "post" },
              { rule: "10-Day Independent Analyst", desc: "Non-underwriting analysts at participating brokers have a 10-day quiet period before publishing research.", type: "post" },
              { rule: "Pre-Filing Quiet Period", desc: "Once the S-1 is filed, company executives cannot make public statements beyond the prospectus that might condition the market (gun-jumping rules).", type: "pre" },
              { rule: "Gun-Jumping Risk", desc: "Pre-S-1 press releases, CEO speeches, or interviews can constitute 'conditioning the market' — SEC can delay registration as a penalty.", type: "pre" },
            ].map((r) => (
              <div key={r.rule} className={cn("rounded-lg p-3 border text-xs", r.type === "post" ? "bg-primary/5 border-border" : "bg-amber-500/5 border-amber-500/15")}>
                <div className={cn("font-semibold mb-1", r.type === "post" ? "text-primary" : "text-amber-400")}>{r.rule}</div>
                <p className="text-white/60 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Alternatives ───────────────────────────────────────────────────────

function AlternativesTab() {
  const [selectedDim, setSelectedDim] = useState<number | null>(null);

  // SPAC performance bar chart
  const perfMax = 60;
  const perfBarH = 130;
  const perfBarW = 58;
  const perfGap = 6;
  const zY = 80;

  return (
    <div className="space-y-6">
      {/* 3-Way Comparison Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-white/80">Traditional IPO vs Direct Listing vs SPAC — 15 Dimensions</h3>
          <p className="text-xs text-white/45 mt-0.5">Click a row to highlight the best option</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-foreground/[0.03]">
                <th className="px-4 py-2.5 text-left text-white/50 w-36">Dimension</th>
                <th className="px-3 py-2.5 text-left text-primary">Traditional IPO</th>
                <th className="px-3 py-2.5 text-left text-green-400/80">Direct Listing</th>
                <th className="px-3 py-2.5 text-left text-primary">SPAC</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DIMENSIONS.map((dim, i) => {
                const isSelected = selectedDim === i;
                const advColors: Record<ComparisonDimension["advantage"], string> = {
                  traditional: "bg-primary/15",
                  direct: "bg-green-500/15",
                  spac: "bg-primary/15",
                  neutral: "",
                };
                return (
                  <tr
                    key={dim.dimension}
                    onClick={() => setSelectedDim(isSelected ? null : i)}
                    className={cn("border-b border-border/50 cursor-pointer transition-colors", isSelected ? "bg-foreground/5" : "hover:bg-muted/30")}
                  >
                    <td className="px-4 py-2.5 font-medium text-white/80">{dim.dimension}</td>
                    <td className={cn("px-3 py-2.5 text-white/65", dim.advantage === "traditional" && advColors.traditional)}>
                      {dim.advantage === "traditional" && <CheckCircle2 className="w-3 h-3 text-primary inline mr-1" />}
                      {dim.traditional}
                    </td>
                    <td className={cn("px-3 py-2.5 text-white/65", dim.advantage === "direct" && advColors.direct)}>
                      {dim.advantage === "direct" && <CheckCircle2 className="w-3 h-3 text-green-400 inline mr-1" />}
                      {dim.directListing}
                    </td>
                    <td className={cn("px-3 py-2.5 text-white/65", dim.advantage === "spac" && advColors.spac)}>
                      {dim.advantage === "spac" && <CheckCircle2 className="w-3 h-3 text-primary inline mr-1" />}
                      {dim.spac}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Listing Mechanics */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-400" />
          Direct Listing — How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <StatChip label="New Shares Issued" value="No (existing only)" color="green" />
          <StatChip label="Underwriter Required" value="Financial advisors only" color="cyan" />
          <StatChip label="Reference Price" value="Set by exchange, not bankers" color="blue" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-semibold text-white/50 mb-3">Direct Listing Steps</div>
            <div className="space-y-3">
              {[
                { step: "File S-1 Registration", desc: "Standard SEC registration. Existing shareholders register shares for resale. No new share issuance — no dilution." },
                { step: "Engage Financial Advisors", desc: "Not underwriters. Advisors assist with investor education, roadshow prep, and regulatory compliance for ~1-2% fee." },
                { step: "Investor Day / Education", desc: "Company presents directly to institutional investors. More open format than traditional roadshow — no allocation pressure." },
                { step: "Reference Price Set", desc: "NYSE/Nasdaq sets a non-binding reference price based on private market valuations, secondary trading prices, and investor feedback." },
                { step: "Opening Auction", desc: "Market determines the opening price via Nasdaq's opening cross or NYSE's designated market maker. Pure price discovery." },
              ].map((s, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                  <div>
                    <div className="text-xs font-semibold text-white/80">{s.step}</div>
                    <p className="text-xs text-white/55 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-white/50 mb-3">Notable Direct Listings</div>
            <div className="space-y-2">
              {[
                { company: "Spotify", ticker: "SPOT", year: 2018, ref: 132, open: 165.9, note: "First major direct listing. Reference $132, opened $165.90 — fully market-driven." },
                { company: "Slack", ticker: "WORK", year: 2019, ref: 26, open: 38.5, note: "48% above reference. Later acquired by Salesforce for $27.7B." },
                { company: "Palantir", ticker: "PLTR", year: 2020, ref: 7.25, open: 10.0, note: "War-room secrecy approach. Three classes of stock. No lock-up constraints." },
                { company: "Coinbase", ticker: "COIN", year: 2021, ref: 250, open: 381, note: "52% above reference. Crypto market bull cycle amplified opening pop." },
              ].map((dl) => (
                <div key={dl.ticker} className="bg-green-500/5 border border-green-500/15 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-white/85">{dl.company} ({dl.ticker})</span>
                    <span className="text-xs text-white/40">{dl.year}</span>
                  </div>
                  <div className="flex gap-3 text-xs mb-1">
                    <span className="text-white/50">Ref: <span className="text-white/80">${dl.ref}</span></span>
                    <span className="text-white/50">Open: <span className="text-green-400">${dl.open}</span></span>
                  </div>
                  <p className="text-xs text-white/50">{dl.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SPAC Structure SVG */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          SPAC Structure & De-SPAC Transaction
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SPAC SVG */}
          <div>
            <div className="text-xs font-semibold text-white/50 mb-3">SPAC Lifecycle</div>
            <svg width={340} height={320} className="max-w-full">
              {/* Stage 1: SPAC IPO */}
              <text x={170} y={18} textAnchor="middle" fill="#a855f7" fontSize={10} fontWeight="bold">Stage 1: SPAC IPO</text>
              <rect x={20} y={25} width={140} height={45} rx={6} fill="#a855f720" stroke="#a855f740" strokeWidth={1} />
              <text x={90} y={44} textAnchor="middle" fill="#d8b4fe" fontSize={10} fontWeight="bold">Sponsor</text>
              <text x={90} y={58} textAnchor="middle" fill="#d8b4fe70" fontSize={8}>"Promote" = 20% of shares</text>
              <rect x={180} y={25} width={140} height={45} rx={6} fill="#3b82f620" stroke="#3b82f640" strokeWidth={1} />
              <text x={250} y={44} textAnchor="middle" fill="#93c5fd" fontSize={10} fontWeight="bold">SPAC Raises $X</text>
              <text x={250} y={58} textAnchor="middle" fill="#93c5fd70" fontSize={8}>$10/unit; warrants attached</text>
              <line x1={160} y1={47} x2={180} y2={47} stroke="#ffffff30" strokeWidth={1} markerEnd="url(#arr2)" />
              <defs>
                <marker id="arr2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#ffffff30" />
                </marker>
                <marker id="arr3" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e50" />
                </marker>
                <marker id="arr4" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#f9731650" />
                </marker>
              </defs>

              {/* Arrow down to Trust */}
              <line x1={250} y1={70} x2={250} y2={100} stroke="#ffffff20" strokeWidth={1} markerEnd="url(#arr2)" />

              {/* Trust box */}
              <text x={170} y={116} textAnchor="middle" fill="#22c55e" fontSize={10} fontWeight="bold">Stage 2: Trust Period (18–24 months)</text>
              <rect x={60} y={122} width={220} height={40} rx={6} fill="#22c55e20" stroke="#22c55e40" strokeWidth={1} />
              <text x={170} y={138} textAnchor="middle" fill="#86efac" fontSize={10} fontWeight="bold">Trust Account</text>
              <text x={170} y={152} textAnchor="middle" fill="#86efac70" fontSize={8}>Funds in T-bills; earns interest</text>

              {/* Search arrow */}
              <line x1={170} y1={162} x2={170} y2={185} stroke="#ffffff20" strokeWidth={1} markerEnd="url(#arr2)" />

              {/* Target Found */}
              <text x={170} y={200} textAnchor="middle" fill="#f97316" fontSize={10} fontWeight="bold">Stage 3: Target Identified → De-SPAC Vote</text>
              <rect x={60} y={207} width={220} height={40} rx={6} fill="#f9731620" stroke="#f9731640" strokeWidth={1} />
              <text x={170} y={223} textAnchor="middle" fill="#fdba74" fontSize={10} fontWeight="bold">Merger Vote</text>
              <text x={170} y={237} textAnchor="middle" fill="#fdba7470" fontSize={8}>Shareholders vote to approve deal</text>

              {/* Two outcomes */}
              <line x1={100} y1={247} x2={60} y2={272} stroke="#22c55e50" strokeWidth={1} markerEnd="url(#arr3)" />
              <rect x={10} y={272} width={100} height={38} rx={5} fill="#22c55e15" stroke="#22c55e30" strokeWidth={1} />
              <text x={60} y={287} textAnchor="middle" fill="#86efac" fontSize={9} fontWeight="bold">Merger Completed</text>
              <text x={60} y={300} textAnchor="middle" fill="#86efac70" fontSize={8}>SPAC → Operating Co.</text>

              <line x1={240} y1={247} x2={280} y2={272} stroke="#ef444450" strokeWidth={1} markerEnd="url(#arr4)" />
              <rect x={230} y={272} width={100} height={38} rx={5} fill="#ef444415" stroke="#ef444430" strokeWidth={1} />
              <text x={280} y={287} textAnchor="middle" fill="#fca5a5" fontSize={9} fontWeight="bold">Redemption</text>
              <text x={280} y={300} textAnchor="middle" fill="#fca5a570" fontSize={8}>~$10 returned to holders</text>
            </svg>
          </div>

          {/* De-SPAC steps + warrant mechanics */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-white/50 mb-3">De-SPAC Transaction Steps</div>
              <div className="space-y-2">
                {[
                  { step: "Target LOI", desc: "SPAC signs non-binding Letter of Intent with target company. Exclusive negotiation period begins." },
                  { step: "S-4/Proxy Filing", desc: "File definitive proxy or S-4 with SEC. Includes fairness opinion, target financials, forward projections." },
                  { step: "PIPE Raise", desc: "Private Investment in Public Equity — institutional investors fund $X alongside deal. Replaces traditional roadshow capital." },
                  { step: "Shareholder Vote", desc: "SPAC shareholders vote to approve merger. Can redeem shares at ~$10 regardless of vote direction." },
                  { step: "Merger Close + Listing", desc: "SPAC ticker changes to target ticker. Founder shares become registered. Warrants become exercisable." },
                ].map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    <div>
                      <div className="text-xs font-semibold text-white/80">{s.step}</div>
                      <p className="text-xs text-white/55 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
              <div className="text-xs font-semibold text-amber-400 mb-2">Warrant Mechanics</div>
              <div className="space-y-1.5 text-xs text-white/60">
                <div className="flex gap-2"><span className="text-white/40">Strike:</span>$11.50 per share (vs $10 IPO unit price)</div>
                <div className="flex gap-2"><span className="text-white/40">Exercisable:</span>30 days after de-SPAC closes</div>
                <div className="flex gap-2"><span className="text-white/40">Expiry:</span>5 years from SPAC IPO date</div>
                <div className="flex gap-2"><span className="text-white/40">Callable:</span>If stock trades above $18 for 20 of 30 days</div>
                <div className="flex gap-2"><span className="text-white/40">Dilution:</span>Warrants can add 15–20% dilution to existing shareholders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SPAC Performance vs IPO SVG */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-1">SPAC vs Traditional IPO — 2-Year Average Returns by Cohort</h3>
        <p className="text-xs text-white/40 mb-4">Returns measured from listing date; vs S&P 500 baseline</p>
        <div className="overflow-x-auto">
          <svg width={SPAC_PERFORMANCE.length * (perfBarW * 3 + perfGap * 2 + 14) + 50} height={perfBarH + 80} className="min-w-0">
            {/* Zero line */}
            <line x1={40} y1={zY + 20} x2={SPAC_PERFORMANCE.length * (perfBarW * 3 + perfGap * 2 + 14) + 40} y2={zY + 20}
              stroke="#ffffff30" strokeWidth={1} />
            <text x={34} y={zY + 24} textAnchor="end" fill="#ffffff40" fontSize={8}>0%</text>
            {SPAC_PERFORMANCE.map((cohort, i) => {
              const groupW = perfBarW * 3 + perfGap * 2;
              const gx = 40 + i * (groupW + 14);

              const bars = [
                { val: cohort.spacReturn, color: "#a855f7", label: "SPAC" },
                { val: cohort.ipoReturn, color: "#3b82f6", label: "IPO" },
                { val: cohort.spReturn, color: "#22c55e", label: "S&P" },
              ];

              return (
                <g key={cohort.cohort}>
                  {bars.map((bar, j) => {
                    const bx = gx + j * (perfBarW + perfGap);
                    const isPos = bar.val >= 0;
                    const bh = Math.abs(bar.val / perfMax) * 90;
                    const by = isPos ? zY + 20 - bh : zY + 20;
                    return (
                      <g key={j}>
                        <rect x={bx} y={by} width={perfBarW} height={bh} rx={2}
                          fill={bar.color} fillOpacity={0.35}
                          stroke={bar.color} strokeOpacity={0.7} strokeWidth={1} />
                        <text x={bx + perfBarW / 2} y={isPos ? by - 3 : by + bh + 10}
                          textAnchor="middle" fill={bar.color} fontSize={8} fontWeight="bold">
                          {fmtPct(bar.val, 0)}
                        </text>
                      </g>
                    );
                  })}
                  <text x={gx + groupW / 2} y={zY + 38} textAnchor="middle" fill="#ffffff50" fontSize={9}>
                    {cohort.cohort}
                  </text>
                </g>
              );
            })}
            {/* Legend */}
            {[
              { color: "#a855f7", label: "SPAC" },
              { color: "#3b82f6", label: "Trad. IPO" },
              { color: "#22c55e", label: "S&P 500" },
            ].map((l, i) => (
              <g key={l.label}>
                <rect x={40 + i * 80} y={perfBarH + 52} width={12} height={8} rx={2} fill={l.color} fillOpacity={0.5} />
                <text x={56 + i * 80} y={perfBarH + 60} fill="#ffffff60" fontSize={9}>{l.label}</text>
              </g>
            ))}
          </svg>
        </div>
        <div className="mt-3 bg-red-500/5 border border-red-500/15 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/60 leading-relaxed">
              <strong className="text-white/80">SPAC Performance Warning:</strong> The 2020–2022 SPAC boom cohort produced deeply negative returns for common shareholders (-50% to -70% vs S&P). The sponsor "promote" (20% free shares) creates structural misalignment — sponsors profit even from mediocre deals. Retail investors bore the losses while sponsors extracted fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function IPOMechanicsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-border flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">IPO Mechanics Deep Dive</h1>
            <p className="text-xs text-white/45">Full process from filing to aftermarket · Book building · Alternatives</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatChip label="Avg Underwriter Spread" value="7% gross" color="blue" />
          <StatChip label="Avg First-Day Pop" value="+20%" color="green" />
          <StatChip label="Lock-Up Standard" value="180 days" color="amber" />
          <StatChip label="SPAC Promote" value="20% free shares" color="purple" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList className="bg-foreground/5 border border-border mb-5 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="timeline" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-white/50 text-xs px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            IPO Timeline
          </TabsTrigger>
          <TabsTrigger value="bookbuilding" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-white/50 text-xs px-3 py-1.5">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Book Building & Pricing
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-white/50 text-xs px-3 py-1.5">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            Market Analysis
          </TabsTrigger>
          <TabsTrigger value="alternatives" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-white/50 text-xs px-3 py-1.5">
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Alternatives
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="data-[state=inactive]:hidden">
          <IPOTimelineTab />
        </TabsContent>
        <TabsContent value="bookbuilding" className="data-[state=inactive]:hidden">
          <BookBuildingTab />
        </TabsContent>
        <TabsContent value="analysis" className="data-[state=inactive]:hidden">
          <MarketAnalysisTab />
        </TabsContent>
        <TabsContent value="alternatives" className="data-[state=inactive]:hidden">
          <AlternativesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
