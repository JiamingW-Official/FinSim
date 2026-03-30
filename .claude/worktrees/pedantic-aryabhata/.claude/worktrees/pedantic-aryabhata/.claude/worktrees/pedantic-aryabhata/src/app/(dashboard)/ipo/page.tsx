"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Building2,
  Calendar,
  DollarSign,
  BarChart3,
  BookOpen,
  Users,
  Lock,
  ChevronRight,
  X,
  Info,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Award,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) & 0xffffffff;
  }
  return h >>> 0;
}

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Sentiment = "hot" | "warm" | "cold";
type RecentFilter = "all" | "profitable" | "unprofitable" | "lockup-expired";

interface UpcomingIPO {
  id: string;
  company: string;
  ticker: string;
  sector: string;
  expectedDate: string;
  priceRangeLow: number;
  priceRangeHigh: number;
  sharesOffered: number; // millions
  impliedValuation: number; // billions
  underwriters: string[];
  bookrunner: string;
  s1FiledDate: string;
  lockupDays: number;
  sentiment: Sentiment;
  description: string;
}

interface RecentIPO {
  id: string;
  company: string;
  ticker: string;
  sector: string;
  ipoDate: string;
  offerPrice: number;
  firstDayClose: number;
  currentPrice: number;
  firstDayReturn: number; // %
  oneMonthReturn: number; // %
  threeMonthReturn: number; // %
  marketCap: number; // billions
  lockupExpiry: string;
  sparkPoints: number[];
}

// ── Static IPO data ───────────────────────────────────────────────────────────

const BASE_DATE = new Date("2026-03-27");

function futureDate(daysAhead: number): string {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

function pastDate(daysBack: number): string {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().split("T")[0];
}

const UPCOMING_IPOS_BASE: Omit<UpcomingIPO, "sentiment">[] = [
  {
    id: "nvwave",
    company: "NeuralWave AI",
    ticker: "NWAI",
    sector: "Technology",
    expectedDate: futureDate(8),
    priceRangeLow: 18,
    priceRangeHigh: 21,
    sharesOffered: 22,
    impliedValuation: 4.2,
    underwriters: ["Goldman Sachs", "Morgan Stanley", "JPMorgan"],
    bookrunner: "Goldman Sachs",
    s1FiledDate: pastDate(45),
    lockupDays: 180,
    description: "Enterprise AI infrastructure platform for real-time inference at scale. 180% YoY revenue growth.",
  },
  {
    id: "greenvolt",
    company: "GreenVolt Energy",
    ticker: "GVLT",
    sector: "Clean Energy",
    expectedDate: futureDate(14),
    priceRangeLow: 12,
    priceRangeHigh: 15,
    sharesOffered: 35,
    impliedValuation: 2.8,
    underwriters: ["Citigroup", "BofA Securities", "Barclays"],
    bookrunner: "Citigroup",
    s1FiledDate: pastDate(52),
    lockupDays: 180,
    description: "Distributed battery storage and grid optimization software. Operating in 28 US states.",
  },
  {
    id: "pharmanova",
    company: "PharmaNova Therapeutics",
    ticker: "PNVT",
    sector: "Healthcare",
    expectedDate: futureDate(21),
    priceRangeLow: 14,
    priceRangeHigh: 17,
    sharesOffered: 18,
    impliedValuation: 1.6,
    underwriters: ["Morgan Stanley", "Cowen", "SVB Securities"],
    bookrunner: "Morgan Stanley",
    s1FiledDate: pastDate(60),
    lockupDays: 180,
    description: "Phase 3 oncology biotech with 4 clinical-stage assets targeting rare blood cancers.",
  },
  {
    id: "finledger",
    company: "FinLedger Corp",
    ticker: "FLDG",
    sector: "Fintech",
    expectedDate: futureDate(28),
    priceRangeLow: 22,
    priceRangeHigh: 26,
    sharesOffered: 28,
    impliedValuation: 5.1,
    underwriters: ["JPMorgan", "Goldman Sachs", "Deutsche Bank"],
    bookrunner: "JPMorgan",
    s1FiledDate: pastDate(40),
    lockupDays: 180,
    description: "Cross-border B2B payments platform processing $40B annually across 60 currencies.",
  },
  {
    id: "spacehive",
    company: "SpaceHive Logistics",
    ticker: "SPHL",
    sector: "Aerospace",
    expectedDate: futureDate(35),
    priceRangeLow: 9,
    priceRangeHigh: 12,
    sharesOffered: 42,
    impliedValuation: 1.9,
    underwriters: ["BofA Securities", "Piper Sandler", "Raymond James"],
    bookrunner: "BofA Securities",
    s1FiledDate: pastDate(55),
    lockupDays: 180,
    description: "Low-earth orbit satellite logistics network for remote industrial monitoring.",
  },
  {
    id: "cloudepic",
    company: "CloudEpic Systems",
    ticker: "CEPC",
    sector: "Technology",
    expectedDate: futureDate(42),
    priceRangeLow: 28,
    priceRangeHigh: 33,
    sharesOffered: 16,
    impliedValuation: 7.8,
    underwriters: ["Goldman Sachs", "Morgan Stanley", "UBS"],
    bookrunner: "Goldman Sachs",
    s1FiledDate: pastDate(38),
    lockupDays: 180,
    description: "Multi-cloud orchestration platform with $320M ARR. Largest enterprise cloud IPO of the year.",
  },
  {
    id: "biorhythm",
    company: "BioRhythm Diagnostics",
    ticker: "BRXD",
    sector: "Healthcare",
    expectedDate: futureDate(50),
    priceRangeLow: 10,
    priceRangeHigh: 13,
    sharesOffered: 30,
    impliedValuation: 1.2,
    underwriters: ["Jefferies", "Canaccord", "BTIG"],
    bookrunner: "Jefferies",
    s1FiledDate: pastDate(70),
    lockupDays: 180,
    description: "At-home continuous glucose monitoring wearable cleared by FDA, entering consumer market.",
  },
  {
    id: "edgeharbor",
    company: "EdgeHarbor Networks",
    ticker: "EDGH",
    sector: "Cybersecurity",
    expectedDate: futureDate(60),
    priceRangeLow: 16,
    priceRangeHigh: 20,
    sharesOffered: 24,
    impliedValuation: 3.5,
    underwriters: ["Morgan Stanley", "Barclays", "Needham"],
    bookrunner: "Morgan Stanley",
    s1FiledDate: pastDate(30),
    lockupDays: 180,
    description: "Zero-trust network access platform securing 4,200 enterprise customers across 90 countries.",
  },
];

// Assign sentiment seeded by company name
function getSentiment(name: string): Sentiment {
  const rng = mulberry32(hashStr(name));
  const v = rng();
  if (v > 0.62) return "hot";
  if (v > 0.3) return "warm";
  return "cold";
}

const UPCOMING_IPOS: UpcomingIPO[] = UPCOMING_IPOS_BASE.map((ipo) => ({
  ...ipo,
  sentiment: getSentiment(ipo.company),
}));

// Generate sparkline data deterministically per company
function generateSparkline(seed: number, basePrice: number, days: number): number[] {
  const rng = mulberry32(seed);
  const pts: number[] = [basePrice];
  for (let i = 1; i < days; i++) {
    const drift = (rng() - 0.48) * 0.04;
    pts.push(Math.max(pts[i - 1] * (1 + drift), 0.1));
  }
  return pts;
}

const RECENT_IPOS_BASE: Omit<RecentIPO, "sparkPoints">[] = [
  {
    id: "quanta",
    company: "Quanta Intelligence",
    ticker: "QTAI",
    sector: "Technology",
    ipoDate: pastDate(142),
    offerPrice: 24,
    firstDayClose: 31.2,
    currentPrice: 38.4,
    firstDayReturn: 30.0,
    oneMonthReturn: 18.2,
    threeMonthReturn: 60.0,
    marketCap: 8.2,
    lockupExpiry: pastDate(142 - 180),
  },
  {
    id: "solarcrown",
    company: "SolarCrown Power",
    ticker: "SLCR",
    sector: "Clean Energy",
    ipoDate: pastDate(128),
    offerPrice: 13,
    firstDayClose: 11.7,
    currentPrice: 9.8,
    firstDayReturn: -10.0,
    oneMonthReturn: -18.5,
    threeMonthReturn: -24.6,
    marketCap: 1.4,
    lockupExpiry: pastDate(128 - 180),
  },
  {
    id: "medhorizon",
    company: "MedHorizon Biotech",
    ticker: "MDHZ",
    sector: "Healthcare",
    ipoDate: pastDate(110),
    offerPrice: 16,
    firstDayClose: 19.8,
    currentPrice: 22.1,
    firstDayReturn: 23.75,
    oneMonthReturn: 12.0,
    threeMonthReturn: 38.1,
    marketCap: 3.1,
    lockupExpiry: pastDate(110 - 180),
  },
  {
    id: "logisflow",
    company: "LogisFlow Tech",
    ticker: "LGSF",
    sector: "Logistics",
    ipoDate: pastDate(98),
    offerPrice: 20,
    firstDayClose: 18.4,
    currentPrice: 15.6,
    firstDayReturn: -8.0,
    oneMonthReturn: -15.2,
    threeMonthReturn: -22.0,
    marketCap: 2.0,
    lockupExpiry: pastDate(98 - 180),
  },
  {
    id: "cybernex",
    company: "CyberNex Security",
    ticker: "CYNX",
    sector: "Cybersecurity",
    ipoDate: pastDate(82),
    offerPrice: 19,
    firstDayClose: 26.6,
    currentPrice: 31.2,
    firstDayReturn: 40.0,
    oneMonthReturn: 22.8,
    threeMonthReturn: 64.2,
    marketCap: 5.9,
    lockupExpiry: futureDate(180 - 82),
  },
  {
    id: "nanobase",
    company: "NanoBase Materials",
    ticker: "NBMT",
    sector: "Manufacturing",
    ipoDate: pastDate(65),
    offerPrice: 11,
    firstDayClose: 9.9,
    currentPrice: 8.4,
    firstDayReturn: -10.0,
    oneMonthReturn: -12.7,
    threeMonthReturn: -23.6,
    marketCap: 0.9,
    lockupExpiry: futureDate(180 - 65),
  },
  {
    id: "propchain",
    company: "PropChain Real Estate",
    ticker: "PPCR",
    sector: "Real Estate",
    ipoDate: pastDate(50),
    offerPrice: 17,
    firstDayClose: 18.7,
    currentPrice: 19.4,
    firstDayReturn: 10.0,
    oneMonthReturn: 8.2,
    threeMonthReturn: 14.1,
    marketCap: 2.8,
    lockupExpiry: futureDate(180 - 50),
  },
  {
    id: "deeproute",
    company: "DeepRoute Autonomous",
    ticker: "DRAU",
    sector: "Technology",
    ipoDate: pastDate(38),
    offerPrice: 30,
    firstDayClose: 42.0,
    currentPrice: 47.1,
    firstDayReturn: 40.0,
    oneMonthReturn: 28.4,
    threeMonthReturn: 57.0,
    marketCap: 12.4,
    lockupExpiry: futureDate(180 - 38),
  },
  {
    id: "farmblox",
    company: "FarmBlox Ag Tech",
    ticker: "FMBX",
    sector: "Agriculture",
    ipoDate: pastDate(22),
    offerPrice: 14,
    firstDayClose: 13.3,
    currentPrice: 12.8,
    firstDayReturn: -5.0,
    oneMonthReturn: -8.6,
    threeMonthReturn: -8.6,
    marketCap: 1.1,
    lockupExpiry: futureDate(180 - 22),
  },
  {
    id: "quantifi",
    company: "Quantifi Finance",
    ticker: "QNFI",
    sector: "Fintech",
    ipoDate: pastDate(10),
    offerPrice: 22,
    firstDayClose: 28.6,
    currentPrice: 27.9,
    firstDayReturn: 30.0,
    oneMonthReturn: 26.8,
    threeMonthReturn: 26.8,
    marketCap: 4.4,
    lockupExpiry: futureDate(180 - 10),
  },
];

const RECENT_IPOS: RecentIPO[] = RECENT_IPOS_BASE.map((ipo) => ({
  ...ipo,
  sparkPoints: generateSparkline(hashStr(ipo.id), ipo.firstDayClose, 60),
}));

// ── Sector first-day returns data ────────────────────────────────────────────

const SECTOR_FIRSTDAY: { sector: string; avgReturn: number; sampleSize: number; popPct: number }[] = [
  { sector: "Technology",   avgReturn: 22.4, sampleSize: 48, popPct: 68 },
  { sector: "Healthcare",   avgReturn: 14.8, sampleSize: 36, popPct: 58 },
  { sector: "Fintech",      avgReturn: 18.2, sampleSize: 22, popPct: 64 },
  { sector: "Cybersecurity",avgReturn: 25.1, sampleSize: 14, popPct: 72 },
  { sector: "Clean Energy", avgReturn: 6.4,  sampleSize: 18, popPct: 50 },
  { sector: "Aerospace",    avgReturn: 9.8,  sampleSize: 10, popPct: 55 },
  { sector: "Manufacturing",avgReturn: 3.2,  sampleSize: 20, popPct: 44 },
  { sector: "Real Estate",  avgReturn: 5.6,  sampleSize: 16, popPct: 48 },
  { sector: "Logistics",    avgReturn: 4.1,  sampleSize: 12, popPct: 46 },
  { sector: "Agriculture",  avgReturn: -1.8, sampleSize: 8,  popPct: 38 },
];

// ── Allocation data (seeded, user-specific) ───────────────────────────────────

interface Allocation {
  ticker: string;
  company: string;
  sharesAllocated: number;
  offerPrice: number;
  currentPrice: number;
  lockupExpiry: string;
  ipoDate: string;
}

function generateAllocations(): Allocation[] {
  const rng = mulberry32(dateSeed());
  return [
    {
      ticker: "QTAI",
      company: "Quanta Intelligence",
      sharesAllocated: Math.floor(rng() * 30 + 10),
      offerPrice: 24,
      currentPrice: 38.4,
      lockupExpiry: pastDate(142 - 180),
      ipoDate: pastDate(142),
    },
    {
      ticker: "CYNX",
      company: "CyberNex Security",
      sharesAllocated: Math.floor(rng() * 20 + 5),
      offerPrice: 19,
      currentPrice: 31.2,
      lockupExpiry: futureDate(180 - 82),
      ipoDate: pastDate(82),
    },
    {
      ticker: "DRAU",
      company: "DeepRoute Autonomous",
      sharesAllocated: Math.floor(rng() * 15 + 5),
      offerPrice: 30,
      currentPrice: 47.1,
      lockupExpiry: futureDate(180 - 38),
      ipoDate: pastDate(38),
    },
  ];
}

const ALLOCATIONS = generateAllocations();

// ── Helper: count days until date ─────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date(BASE_DATE);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Sentiment badge ───────────────────────────────────────────────────────────

function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  if (sentiment === "hot") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">
        <Flame className="h-3 w-3" /> HOT
      </span>
    );
  }
  if (sentiment === "warm") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
        <TrendingUp className="h-3 w-3" /> WARM
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
      <TrendingDown className="h-3 w-3" /> COLD
    </span>
  );
}

// ── Pure SVG Sparkline ────────────────────────────────────────────────────────

function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  const w = 80;
  const h = 28;
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map((p) => h - ((p - min) / range) * h);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const color = positive ? "#22c55e" : "#ef4444";
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={xs.map((x, i) => `${x},${ys[i]}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={2.5} fill={color} />
      <path
        d={`${d} L${w},${h} L0,${h} Z`}
        fill={color}
        fillOpacity={0.08}
      />
    </svg>
  );
}

// ── IPO Detail Modal ──────────────────────────────────────────────────────────

function IPODetailModal({
  ipo,
  onClose,
}: {
  ipo: UpcomingIPO;
  onClose: () => void;
}) {
  const midPrice = ((ipo.priceRangeLow + ipo.priceRangeHigh) / 2).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-md border border-border bg-card p-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{ipo.company}</h2>
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-medium text-muted-foreground">
                {ipo.ticker}
              </span>
              <SentimentBadge sentiment={ipo.sentiment} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{ipo.sector}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">{ipo.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">Price Range</p>
            <p className="font-medium text-foreground">
              ${ipo.priceRangeLow} – ${ipo.priceRangeHigh}
            </p>
            <p className="text-xs text-muted-foreground">Mid: ${midPrice}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">Expected Date</p>
            <p className="font-medium text-foreground">{formatDate(ipo.expectedDate)}</p>
            <p className="text-xs text-muted-foreground">in {daysUntil(ipo.expectedDate)} days</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">Implied Valuation</p>
            <p className="font-medium text-foreground">${ipo.impliedValuation}B</p>
            <p className="text-xs text-muted-foreground">{(ipo.sharesOffered).toFixed(0)}M shares offered</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">Lock-up Period</p>
            <p className="font-medium text-foreground">{ipo.lockupDays} days</p>
            <p className="text-xs text-muted-foreground">S-1 filed {formatDate(ipo.s1FiledDate)}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Underwriters</p>
          <div className="flex flex-wrap gap-2">
            {ipo.underwriters.map((uw) => (
              <span
                key={uw}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs text-muted-foreground font-medium border",
                  uw === ipo.bookrunner
                    ? "border-primary/40 bg-muted/10 text-primary"
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                {uw === ipo.bookrunner ? "Lead: " : ""}{uw}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300 leading-relaxed">
            IPO investing carries significant risk. First-day pops are not guaranteed, and many IPOs
            underperform the market in the 6–12 months post-listing. Always review the S-1 prospectus.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── IPO Grader ────────────────────────────────────────────────────────────────

interface GradeInput {
  revenueGrowth: number; // %
  grossMargin: number; // %
  marketSizeBn: number; // $B
  competition: "low" | "medium" | "high";
  profitability: "profitable" | "breakeven" | "burning";
  managementExp: "experienced" | "mixed" | "unproven";
}

function gradeIPO(input: GradeInput): { grade: string; score: number; rationale: string[] } {
  let score = 0;
  const rationale: string[] = [];

  // Revenue growth (max 30)
  if (input.revenueGrowth >= 100) { score += 30; rationale.push("Hypergrowth revenue (100%+ YoY) is exceptional."); }
  else if (input.revenueGrowth >= 50) { score += 22; rationale.push("Strong revenue growth (50–100% YoY)."); }
  else if (input.revenueGrowth >= 20) { score += 14; rationale.push("Moderate revenue growth (20–50% YoY)."); }
  else { score += 5; rationale.push("Revenue growth below 20% may disappoint growth investors."); }

  // Gross margin (max 25)
  if (input.grossMargin >= 70) { score += 25; rationale.push("Software-like gross margins (70%+) imply strong unit economics."); }
  else if (input.grossMargin >= 50) { score += 18; rationale.push("Healthy gross margins (50–70%)."); }
  else if (input.grossMargin >= 30) { score += 10; rationale.push("Gross margins in 30–50% range are acceptable for hardware/services."); }
  else { score += 3; rationale.push("Sub-30% gross margins suggest commoditized or capital-intensive model."); }

  // Market size (max 20)
  if (input.marketSizeBn >= 100) { score += 20; rationale.push("TAM of $100B+ provides long runway for growth."); }
  else if (input.marketSizeBn >= 30) { score += 14; rationale.push("TAM of $30–100B is sizeable."); }
  else if (input.marketSizeBn >= 10) { score += 8; rationale.push("TAM of $10–30B may limit long-term scale."); }
  else { score += 2; rationale.push("Small TAM under $10B caps upside potential significantly."); }

  // Competition (max 15)
  if (input.competition === "low") { score += 15; rationale.push("Low competition suggests potential for durable market share."); }
  else if (input.competition === "medium") { score += 9; rationale.push("Moderate competition requires differentiation to sustain growth."); }
  else { score += 3; rationale.push("Highly competitive market increases risk of pricing pressure."); }

  // Profitability (max 5)
  if (input.profitability === "profitable") { score += 5; rationale.push("Profitable company reduces dilution risk."); }
  else if (input.profitability === "breakeven") { score += 3; rationale.push("Near breakeven limits near-term burn concerns."); }
  else { score += 0; rationale.push("Cash burn requires scrutiny of runway and burn rate."); }

  // Management (max 5)
  if (input.managementExp === "experienced") { score += 5; rationale.push("Experienced management team with prior IPO/exit track record."); }
  else if (input.managementExp === "mixed") { score += 3; rationale.push("Mixed management experience — monitor execution."); }
  else { score += 1; rationale.push("Unproven management is a key risk factor."); }

  let grade: string;
  if (score >= 85) grade = "A+";
  else if (score >= 78) grade = "A";
  else if (score >= 70) grade = "A-";
  else if (score >= 62) grade = "B+";
  else if (score >= 55) grade = "B";
  else if (score >= 47) grade = "B-";
  else if (score >= 38) grade = "C+";
  else if (score >= 30) grade = "C";
  else if (score >= 20) grade = "D";
  else grade = "F";

  return { grade, score, rationale };
}

// ── Sector Bar Chart (pure SVG) ───────────────────────────────────────────────

function SectorBarChart() {
  const maxVal = Math.max(...SECTOR_FIRSTDAY.map((s) => Math.abs(s.avgReturn)));
  const barH = 22;
  const gap = 8;
  const chartH = SECTOR_FIRSTDAY.length * (barH + gap);
  const labelW = 120;
  const chartW = 220;
  const zeroX = labelW + (chartW / 2);

  return (
    <svg
      width={labelW + chartW + 60}
      height={chartH + 10}
      className="overflow-visible"
    >
      {/* zero line */}
      <line
        x1={zeroX}
        y1={0}
        x2={zeroX}
        y2={chartH}
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={1}
        strokeDasharray="4,4"
      />
      {SECTOR_FIRSTDAY.map((s, i) => {
        const y = i * (barH + gap);
        const barLen = (Math.abs(s.avgReturn) / maxVal) * (chartW / 2 - 4);
        const positive = s.avgReturn >= 0;
        const barX = positive ? zeroX : zeroX - barLen;
        const color = positive ? "#22c55e" : "#ef4444";
        return (
          <g key={s.sector}>
            <text
              x={labelW - 6}
              y={y + barH / 2 + 4}
              textAnchor="end"
              fontSize={11}
              fill="currentColor"
              fillOpacity={0.7}
            >
              {s.sector}
            </text>
            <rect
              x={barX}
              y={y + 2}
              width={barLen}
              height={barH - 4}
              fill={color}
              fillOpacity={0.75}
              rx={2}
            />
            <text
              x={positive ? zeroX + barLen + 4 : zeroX - barLen - 4}
              y={y + barH / 2 + 4}
              textAnchor={positive ? "start" : "end"}
              fontSize={10}
              fill={color}
              fontWeight="600"
            >
              {s.avgReturn >= 0 ? "+" : ""}{s.avgReturn.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Flipping Simulator ────────────────────────────────────────────────────────

function FlipSimulator({ ipo }: { ipo: RecentIPO }) {
  const sharesCount = 50;
  const day1Value = sharesCount * ipo.firstDayClose;
  const holdValue = sharesCount * ipo.currentPrice;
  const day1Pnl = day1Value - sharesCount * ipo.offerPrice;
  const holdPnl = holdValue - sharesCount * ipo.offerPrice;

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <p className="text-sm font-medium text-foreground">{ipo.company} ({ipo.ticker})</p>
      <p className="text-xs text-muted-foreground">Assume {sharesCount} shares at offer price ${ipo.offerPrice}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className={cn("rounded-lg p-3 border", day1Pnl >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/5 border-red-500/20")}>
          <p className="text-xs text-muted-foreground mb-1">Sold on Day 1</p>
          <p className="font-semibold text-foreground">${day1Value.toFixed(0)}</p>
          <p className={cn("text-sm font-medium", day1Pnl >= 0 ? "text-green-400" : "text-red-400")}>
            {day1Pnl >= 0 ? "+" : ""}${day1Pnl.toFixed(0)} ({ipo.firstDayReturn >= 0 ? "+" : ""}{ipo.firstDayReturn.toFixed(1)}%)
          </p>
        </div>
        <div className={cn("rounded-lg p-3 border", holdPnl >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/5 border-red-500/20")}>
          <p className="text-xs text-muted-foreground mb-1">Held to Today</p>
          <p className="font-medium text-foreground">${holdValue.toFixed(0)}</p>
          <p className={cn("text-sm font-medium", holdPnl >= 0 ? "text-green-400" : "text-red-400")}>
            {holdPnl >= 0 ? "+" : ""}${holdPnl.toFixed(0)} ({((holdPnl / (sharesCount * ipo.offerPrice)) * 100).toFixed(1)}%)
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function IPOPage() {
  const [selectedIPO, setSelectedIPO] = useState<UpcomingIPO | null>(null);
  const [recentFilter, setRecentFilter] = useState<RecentFilter>("all");
  const [gradeInput, setGradeInput] = useState<GradeInput>({
    revenueGrowth: 80,
    grossMargin: 65,
    marketSizeBn: 50,
    competition: "medium",
    profitability: "burning",
    managementExp: "experienced",
  });
  const [gradeResult, setGradeResult] = useState<ReturnType<typeof gradeIPO> | null>(null);
  const [flipTicker, setFlipTicker] = useState<string>(RECENT_IPOS[0].ticker);

  const filteredRecent = useMemo(() => {
    const now = new Date(BASE_DATE);
    return RECENT_IPOS.filter((ipo) => {
      if (recentFilter === "profitable") return ipo.firstDayReturn > 0;
      if (recentFilter === "unprofitable") return ipo.firstDayReturn <= 0;
      if (recentFilter === "lockup-expired") return new Date(ipo.lockupExpiry) < now;
      return true;
    });
  }, [recentFilter]);

  const flipIpo = useMemo(
    () => RECENT_IPOS.find((r) => r.ticker === flipTicker) ?? RECENT_IPOS[0],
    [flipTicker]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {selectedIPO && (
        <IPODetailModal ipo={selectedIPO} onClose={() => setSelectedIPO(null)} />
      )}

      {/* Header — Hero */}
      <div className="shrink-0 border-b border-border border-l-4 border-l-primary px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/10">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground/50" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-foreground">IPO Center</h1>
            <p className="text-xs text-muted-foreground">Track, analyze, and simulate IPO investing</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Tabs defaultValue="upcoming" className="h-full flex flex-col">
          <div className="shrink-0 border-b border-border px-6">
            <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
              {[
                { value: "upcoming", label: "Upcoming IPOs" },
                { value: "recent", label: "Recent IPOs" },
                { value: "analysis", label: "IPO Analysis" },
                { value: "participate", label: "Participate" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-10 rounded-none border-b-2 border-transparent px-4 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Tab 1: Upcoming IPOs ── */}
          <TabsContent value="upcoming" className="flex-1 min-h-0 overflow-y-auto data-[state=inactive]:hidden m-0">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {UPCOMING_IPOS.length} upcoming IPOs · Click a row for details
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <SentimentBadge sentiment="hot" />
                  <SentimentBadge sentiment="warm" />
                  <SentimentBadge sentiment="cold" />
                </div>
              </div>

              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Sector</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Exp. Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Price Range</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Shares (M)</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Valuation</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Bookrunner</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Sentiment</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {UPCOMING_IPOS.map((ipo) => (
                      <tr
                        key={ipo.id}
                        className="border-b border-border transition-colors hover:bg-muted/30 cursor-pointer"
                        onClick={() => setSelectedIPO(ipo)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground">{ipo.company}</p>
                            <p className="text-xs font-mono text-muted-foreground">{ipo.ticker}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{ipo.sector}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-foreground text-xs">{formatDate(ipo.expectedDate)}</p>
                            <p className="text-xs text-muted-foreground">in {daysUntil(ipo.expectedDate)}d</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-foreground font-mono text-xs">
                          ${ipo.priceRangeLow}–${ipo.priceRangeHigh}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground text-xs">{ipo.sharesOffered}M</td>
                        <td className="px-4 py-3 text-right text-foreground font-medium text-xs">${ipo.impliedValuation}B</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted/10 px-2 py-0.5 text-xs text-primary border border-primary/20">
                            <Award className="h-3 w-3" /> {ipo.bookrunner.split(" ")[0]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <SentimentBadge sentiment={ipo.sentiment} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ChevronRight className="h-4 w-4 text-muted-foreground inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lock-up info panel */}
              <div className="mt-4 rounded-md border border-border bg-muted/20 p-4">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Lock-up Period</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All listed IPOs have a standard <strong className="text-foreground">180-day lock-up</strong> period during which
                      insiders and pre-IPO investors cannot sell shares. Lock-up expiry often triggers increased
                      volatility as early investors take profits. Watch the expiry date as a potential supply event.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab 2: Recent IPOs ── */}
          <TabsContent value="recent" className="flex-1 min-h-0 overflow-y-auto data-[state=inactive]:hidden m-0">
            <div className="p-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-5">
                {(["all", "profitable", "unprofitable", "lockup-expired"] as RecentFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setRecentFilter(f)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs text-muted-foreground font-medium transition-colors",
                      recentFilter === f
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    {f === "all" ? "All" : f === "profitable" ? "Profitable" : f === "unprofitable" ? "Unprofitable" : "Lock-up Expired"}
                  </button>
                ))}
                <span className="ml-auto text-xs text-muted-foreground self-center">{filteredRecent.length} results</span>
              </div>

              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Company</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Offer $</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Current $</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Day 1</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">1M</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">3M</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">vs Offer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Lock-up</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecent.map((ipo) => {
                      const vsOffer = ((ipo.currentPrice - ipo.offerPrice) / ipo.offerPrice) * 100;
                      const lockupExpired = new Date(ipo.lockupExpiry) < new Date(BASE_DATE);
                      const daysToLockup = daysUntil(ipo.lockupExpiry);
                      return (
                        <tr key={ipo.id} className="border-b border-border hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-foreground">{ipo.company}</p>
                              <p className="text-xs font-mono text-muted-foreground">{ipo.ticker} · {formatDate(ipo.ipoDate)}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">${ipo.offerPrice}</td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-foreground font-medium">${ipo.currentPrice}</td>
                          <td className={cn("px-4 py-3 text-right font-mono text-xs font-medium", ipo.firstDayReturn >= 0 ? "text-green-400" : "text-red-400")}>
                            {ipo.firstDayReturn >= 0 ? "+" : ""}{ipo.firstDayReturn.toFixed(1)}%
                          </td>
                          <td className={cn("px-4 py-3 text-right font-mono text-xs", ipo.oneMonthReturn >= 0 ? "text-green-400" : "text-red-400")}>
                            {ipo.oneMonthReturn >= 0 ? "+" : ""}{ipo.oneMonthReturn.toFixed(1)}%
                          </td>
                          <td className={cn("px-4 py-3 text-right font-mono text-xs", ipo.threeMonthReturn >= 0 ? "text-green-400" : "text-red-400")}>
                            {ipo.threeMonthReturn >= 0 ? "+" : ""}{ipo.threeMonthReturn.toFixed(1)}%
                          </td>
                          <td className={cn("px-4 py-3 text-right font-mono text-xs font-medium", vsOffer >= 0 ? "text-green-400" : "text-red-400")}>
                            {vsOffer >= 0 ? "+" : ""}{vsOffer.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3">
                            {lockupExpired ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-400">
                                <CheckCircle2 className="h-3 w-3" /> Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                                <Clock className="h-3 w-3" /> {daysToLockup}d left
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 flex justify-center pt-4">
                            <Sparkline points={ipo.sparkPoints} positive={ipo.currentPrice >= ipo.offerPrice} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab 3: IPO Analysis ── */}
          <TabsContent value="analysis" className="flex-1 min-h-0 overflow-y-auto data-[state=inactive]:hidden m-0">
            <div className="p-4 space-y-4">

              {/* IPO Grader */}
              <div className="rounded-md border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <h2 className="font-medium text-foreground">IPO Grading Tool</h2>
                  <span className="ml-auto text-xs text-muted-foreground">Rate a company's IPO quality</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Revenue Growth YoY (%)</label>
                    <input
                      type="number"
                      value={gradeInput.revenueGrowth}
                      onChange={(e) => setGradeInput((prev) => ({ ...prev, revenueGrowth: +e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Gross Margin (%)</label>
                    <input
                      type="number"
                      value={gradeInput.grossMargin}
                      onChange={(e) => setGradeInput((prev) => ({ ...prev, grossMargin: +e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Market Size (TAM $B)</label>
                    <input
                      type="number"
                      value={gradeInput.marketSizeBn}
                      onChange={(e) => setGradeInput((prev) => ({ ...prev, marketSizeBn: +e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Competition Level</label>
                    <select
                      value={gradeInput.competition}
                      onChange={(e) => setGradeInput((prev) => ({ ...prev, competition: e.target.value as GradeInput["competition"] }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Profitability</label>
                    <select
                      value={gradeInput.profitability}
                      onChange={(e) => setGradeInput((prev) => ({ ...prev, profitability: e.target.value as GradeInput["profitability"] }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="profitable">Profitable</option>
                      <option value="breakeven">Near Breakeven</option>
                      <option value="burning">Cash Burning</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Management Experience</label>
                    <select
                      value={gradeInput.managementExp}
                      onChange={(e) => setGradeInput((prev) => ({ ...prev, managementExp: e.target.value as GradeInput["managementExp"] }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="experienced">Experienced (serial founders)</option>
                      <option value="mixed">Mixed</option>
                      <option value="unproven">Unproven</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setGradeResult(gradeIPO(gradeInput))}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Grade this IPO
                </button>

                {gradeResult && (
                  <div className="mt-4 rounded-md border border-border bg-muted/20 p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-md text-2xl font-semibold border-2",
                        gradeResult.score >= 78 ? "border-green-500 bg-green-500/10 text-green-400" :
                        gradeResult.score >= 55 ? "border-primary bg-muted/10 text-primary" :
                        gradeResult.score >= 38 ? "border-amber-500 bg-amber-500/10 text-amber-400" :
                        "border-red-500 bg-red-500/5 text-red-400"
                      )}>
                        {gradeResult.grade}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">IPO Quality Score: {gradeResult.score}/100</p>
                        <div className="mt-1 h-2 w-48 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-colors",
                              gradeResult.score >= 78 ? "bg-green-500" :
                              gradeResult.score >= 55 ? "bg-primary" :
                              gradeResult.score >= 38 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${gradeResult.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {gradeResult.rationale.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Info className="h-3 w-3 shrink-0 mt-0.5 text-primary" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sector first-day returns */}
              <div className="rounded-md border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <h2 className="font-medium text-foreground">Average First-Day Return by Sector</h2>
                  <span className="ml-auto text-xs text-muted-foreground">Based on 204 IPOs (2019–2025)</span>
                </div>
                <div className="overflow-x-auto">
                  <SectorBarChart />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {SECTOR_FIRSTDAY.map((s) => (
                    <div key={s.sector} className="rounded-lg bg-muted/30 p-2 text-center">
                      <p className="text-xs text-muted-foreground truncate">{s.sector}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.popPct}% pop</p>
                      <p className="text-xs text-muted-foreground">{s.sampleSize} IPOs</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Post-IPO drift */}
              <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-amber-400" />
                  <h2 className="font-medium text-foreground">Post-IPO Drift: The 6–12 Month Effect</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Academic research consistently shows that IPOs tend to <strong className="text-foreground">underperform</strong> relative
                  to the broader market in the 6 to 12 months following listing. This is known as the long-run
                  underperformance anomaly.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { period: "Day 1", stat: "+16%", note: "Avg. first-day pop (hot deals)" },
                    { period: "6 Months", stat: "-8%", note: "Avg. vs. IPO price after lock-up" },
                    { period: "12 Months", stat: "-18%", note: "Avg. underperformance vs SPY" },
                  ].map((item) => (
                    <div key={item.period} className="rounded-lg bg-card border border-border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{item.period}</p>
                      <p className={cn("text-xl font-medium", item.stat.startsWith("+") ? "text-green-400" : "text-red-400")}>
                        {item.stat}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{item.note}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Source: Ritter (2023), "Initial Public Offerings: Underpricing". Figures are historical averages and not predictive of future performance.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab 4: Participate ── */}
          <TabsContent value="participate" className="flex-1 min-h-0 overflow-y-auto data-[state=inactive]:hidden m-0">
            <div className="p-4 space-y-4">

              {/* Allocations */}
              <div className="rounded-md border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <h2 className="font-medium text-foreground">Your IPO Allocations</h2>
                  <span className="ml-auto text-xs text-muted-foreground">Simulated retail allocation</span>
                </div>
                <div className="space-y-3">
                  {ALLOCATIONS.map((alloc) => {
                    const totalCost = alloc.sharesAllocated * alloc.offerPrice;
                    const currentVal = alloc.sharesAllocated * alloc.currentPrice;
                    const pnl = currentVal - totalCost;
                    const pnlPct = (pnl / totalCost) * 100;
                    const lockupExpired = new Date(alloc.lockupExpiry) < new Date(BASE_DATE);
                    const daysToLockup = daysUntil(alloc.lockupExpiry);
                    return (
                      <div key={alloc.ticker} className="rounded-lg border border-border p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">{alloc.company}</p>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-mono">{alloc.ticker}</span> · Allocated {alloc.sharesAllocated} shares @ ${alloc.offerPrice}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={cn("text-lg font-medium", pnl >= 0 ? "text-green-400" : "text-red-400")}>
                              {pnl >= 0 ? "+" : ""}${pnl.toFixed(0)}
                            </p>
                            <p className={cn("text-xs font-medium", pnl >= 0 ? "text-green-400" : "text-red-400")}>
                              {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="rounded bg-muted/40 p-2">
                            <p className="text-xs text-muted-foreground">Cost Basis</p>
                            <p className="text-sm font-medium text-foreground">${totalCost.toFixed(0)}</p>
                          </div>
                          <div className="rounded bg-muted/40 p-2">
                            <p className="text-xs text-muted-foreground">Market Value</p>
                            <p className="text-sm font-medium text-foreground">${currentVal.toFixed(0)}</p>
                          </div>
                          <div className="rounded bg-muted/40 p-2">
                            <p className="text-xs text-muted-foreground">Lock-up</p>
                            <p className={cn("text-sm font-medium", lockupExpired ? "text-green-400" : "text-amber-400")}>
                              {lockupExpired ? "Expired" : `${daysToLockup}d left`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Flip Simulator */}
              <div className="rounded-md border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <h2 className="font-medium text-foreground">IPO Flip Simulator</h2>
                  <span className="ml-auto text-xs text-muted-foreground">Day 1 sell vs hold</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {RECENT_IPOS.map((ipo) => (
                    <button
                      key={ipo.ticker}
                      onClick={() => setFlipTicker(ipo.ticker)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs text-muted-foreground font-medium transition-colors",
                        flipTicker === ipo.ticker
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {ipo.ticker}
                    </button>
                  ))}
                </div>
                <FlipSimulator ipo={flipIpo} />
                <p className="mt-3 text-xs text-muted-foreground">
                  Results assume 50 shares and do not account for brokerage fees, PFOF, or IPO allocation constraints.
                </p>
              </div>

              {/* Lock-up Countdown */}
              <div className="rounded-md border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <h2 className="font-medium text-foreground">Lock-up Expiry Countdown</h2>
                </div>
                <div className="space-y-2">
                  {RECENT_IPOS.filter((r) => new Date(r.lockupExpiry) >= new Date(BASE_DATE))
                    .sort((a, b) => new Date(a.lockupExpiry).getTime() - new Date(b.lockupExpiry).getTime())
                    .map((ipo) => {
                      const days = daysUntil(ipo.lockupExpiry);
                      const urgency = days <= 14 ? "text-red-400" : days <= 30 ? "text-amber-400" : "text-muted-foreground";
                      const progress = Math.max(0, Math.min(100, ((180 - days) / 180) * 100));
                      return (
                        <div key={ipo.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-medium text-foreground">{ipo.ticker}</span>
                              <span className="text-xs text-muted-foreground">{ipo.company}</span>
                            </div>
                            <span className={cn("text-xs text-muted-foreground font-medium", urgency)}>
                              {days}d until unlock
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", days <= 14 ? "bg-red-500" : days <= 30 ? "bg-amber-500" : "bg-primary")}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">Expires {formatDate(ipo.lockupExpiry)}</p>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Education: How retail accesses IPOs */}
              <div className="rounded-md border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <h2 className="font-medium text-foreground">How Retail Investors Access IPOs</h2>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Broker IPO Programs",
                      icon: <Users className="h-3.5 w-3.5 text-muted-foreground/50" />,
                      desc: "Brokers like Fidelity, TD Ameritrade, and Schwab offer IPO access to eligible customers. Typically requires minimum account balance and active trading history.",
                    },
                    {
                      title: "Payment for Order Flow (PFOF)",
                      icon: <DollarSign className="h-4 w-4 text-green-400" />,
                      desc: "Robinhood and similar apps use PFOF to route orders. They offer IPO access but allocations are often smaller and at market open price rather than offer price.",
                    },
                    {
                      title: "Direct Listings",
                      icon: <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50" />,
                      desc: "Companies like Spotify and Coinbase bypassed traditional IPO underwriting via direct listings. No lockup, no underwriter discount — shares trade immediately at market price.",
                    },
                    {
                      title: "SPACs (Special Purpose Acquisition Companies)",
                      icon: <Building2 className="h-4 w-4 text-amber-400" />,
                      desc: "A SPAC raises capital through IPO as a blank-check company, then merges with a private company. Retail can buy SPAC shares pre-merger at $10. High risk, often dilutive.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-lg bg-muted/30 border border-border p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {item.icon}
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg bg-muted/10 border border-border p-3 flex gap-2">
                  <Info className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                  <p className="text-xs text-primary leading-relaxed">
                    Retail investors rarely receive offer-price allocations for hot IPOs. Most retail participation
                    happens in the after-market at a premium to the offer price, which significantly reduces
                    expected returns compared to institutional investors.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
