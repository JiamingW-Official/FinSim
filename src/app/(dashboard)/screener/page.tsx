"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Search,
  Play,
  Plus,
  X,
  Download,
  ChevronUp,
  ChevronDown,
  Star,
  TrendingUp,
  TrendingDown,
  Bookmark,
  BarChart2,
  RefreshCw,
  Users,
  Eye,
  Layers,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Stock data types ──────────────────────────────────────────────────────────

interface ScreenerStock {
  rank: number;
  ticker: string;
  company: string;
  sector: string;
  score: number;
  peRatio: number;
  forwardPE: number;
  revenueGrowth: number;
  netMargin: number;
  rsi: number;
  price: number;
  return1M: number;
  marketCapB: number;
  dividendYield: number;
  roe: number;
  debtEquity: number;
  grossMargin: number;
  epsGrowth: number;
  volume: number;
  avgVolume: number;
  week52High: number;
  week52Low: number;
  pbRatio: number;
  evEbitda: number;
  analystRating: string;
  consecutiveDivYears: number;
  dividendPayoutRatio: number;
  insiderTrend: "buying" | "selling" | "neutral";
  atr: number;
  maSignal: "above50" | "below50" | "above200" | "below200" | "above_both" | "below_both";
  macd: "bullish" | "bearish" | "neutral";
  beta: number;
}

// ── Synthetic stock universe (seed=6060) ──────────────────────────────────────

const SECTORS = [
  "Technology",
  "Healthcare",
  "Financials",
  "Consumer Discretionary",
  "Consumer Staples",
  "Industrials",
  "Energy",
  "Materials",
  "Real Estate",
  "Communication Services",
] as const;

type SectorName = (typeof SECTORS)[number];

const COMPANY_NAMES: Record<string, string> = {
  VERX: "Vertex Analytics",
  PLNK: "Planck Systems",
  QVNT: "Quantive Corp",
  NXGN: "NextGen Health",
  MRVL: "Marvell Semi",
  DXCM: "Dexcom Plus",
  ARLO: "Arlo Technologies",
  CRNX: "Carnyx Biotech",
  FLUX: "Flux Energy",
  HLTH: "Helios Health",
  BDRY: "Boundary AI",
  SMPL: "Simplex Retail",
  GLXY: "Galaxy Materials",
  PRTO: "Proto Industrials",
  OZRK: "Ozark Financial",
  WVLY: "Waverly Comms",
  MDPX: "MedPoint Pharma",
  STKR: "Stoker Energy",
  CRWD2: "Crowd Digital",
  FNTX: "Fintech X",
  BRNT: "Brentwood Retail",
  CLRX: "Clearex Utilities",
  VRTH: "Virtue REIT",
  PXLD: "Pixelated Media",
  KLVR: "Kelver Tech",
  NGST: "Nightstar Bio",
  ATLC: "Atlantic Capital",
  SNPX: "Synapse AI",
  BNKR: "Banker Group",
  HMBL: "Humble Brands",
  TMPR: "Templar Energy",
  MRVN: "Marvin Materials",
  INDX: "Index Industrials",
  SPHX: "Sphinx Comms",
  WLLS: "Wells Property",
  CPTA: "Capita Health",
  TRUX: "Trux Logistics",
  ARCO: "Arco Consumer",
  DMND: "Diamond Fin",
  PRXM: "Proxima Tech",
  LUXE: "Luxe Retail",
  BIOS: "Bios Therapeutics",
  ENRJ: "Energy Junction",
  MTLK: "MetalLink Corp",
  HRZN: "Horizon Media",
  PCFL: "Pacific Financial",
  CRVX: "Curvex Analytics",
  SVLT: "Sovolt Energy",
  RLTX: "Relatex Logistics",
  GRDN: "Garden Brands",
};

const TICKERS = Object.keys(COMPANY_NAMES);

const SECTOR_MAP: Record<number, SectorName> = {
  0: "Technology",
  1: "Healthcare",
  2: "Financials",
  3: "Consumer Discretionary",
  4: "Consumer Staples",
  5: "Industrials",
  6: "Energy",
  7: "Materials",
  8: "Real Estate",
  9: "Communication Services",
};

const ANALYST_RATINGS = ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"];

function generateStockUniverse(): ScreenerStock[] {
  const rng = mulberry32(6060);
  return TICKERS.map((ticker, idx) => {
    const sectorIdx = Math.floor(rng() * 10);
    const sector = SECTOR_MAP[sectorIdx]!;
    const price = 10 + rng() * 490;
    const return1M = (rng() - 0.45) * 30;
    const week52Low = price * (0.6 + rng() * 0.2);
    const week52High = price * (1.1 + rng() * 0.5);
    const avgVol = 500_000 + rng() * 20_000_000;
    const volMultiplier = 0.4 + rng() * 2;
    const peRatio = 8 + rng() * 60;
    const forwardPE = peRatio * (0.7 + rng() * 0.5);
    const roe = -5 + rng() * 50;
    const grossMargin = 15 + rng() * 70;
    const netMargin = -5 + rng() * 35;
    const epsGrowth = -20 + rng() * 60;
    const revenueGrowth = -5 + rng() * 40;
    const dividendYield = rng() > 0.4 ? rng() * 5 : 0;
    const dividendPayoutRatio = dividendYield > 0 ? 20 + rng() * 60 : 0;
    const consecutiveDivYears = dividendYield > 0 ? Math.floor(rng() * 30) : 0;
    const rsi = 20 + rng() * 60;
    const marketCapB = 0.1 + rng() * 2000;
    const debtEquity = rng() * 3;
    const pbRatio = 0.5 + rng() * 15;
    const evEbitda = 5 + rng() * 40;
    const atr = price * (0.01 + rng() * 0.04);
    const maSignals: ScreenerStock["maSignal"][] = [
      "above50", "below50", "above200", "below200", "above_both", "below_both",
    ];
    const maSignal = maSignals[Math.floor(rng() * maSignals.length)]!;
    const macdSignals: ScreenerStock["macd"][] = ["bullish", "bearish", "neutral"];
    const macd = macdSignals[Math.floor(rng() * macdSignals.length)]!;
    const insiderTrends: ScreenerStock["insiderTrend"][] = ["buying", "selling", "neutral"];
    const insiderTrend = insiderTrends[Math.floor(rng() * insiderTrends.length)]!;
    const beta = 0.3 + rng() * 2;

    // AI composite score
    let scoreRaw = 0;
    if (peRatio < 20) scoreRaw += 10;
    if (forwardPE < 18) scoreRaw += 8;
    if (revenueGrowth > 15) scoreRaw += 12;
    if (epsGrowth > 10) scoreRaw += 10;
    if (grossMargin > 40) scoreRaw += 8;
    if (netMargin > 10) scoreRaw += 10;
    if (roe > 15) scoreRaw += 10;
    if (debtEquity < 1) scoreRaw += 8;
    if (rsi > 40 && rsi < 65) scoreRaw += 6;
    if (maSignal === "above_both") scoreRaw += 8;
    if (macd === "bullish") scoreRaw += 5;
    if (insiderTrend === "buying") scoreRaw += 5;
    scoreRaw = Math.min(100, Math.max(0, scoreRaw + rng() * 10));

    return {
      rank: idx + 1,
      ticker,
      company: COMPANY_NAMES[ticker] ?? ticker,
      sector,
      score: Math.round(scoreRaw),
      peRatio: Math.round(peRatio * 10) / 10,
      forwardPE: Math.round(forwardPE * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      netMargin: Math.round(netMargin * 10) / 10,
      rsi: Math.round(rsi * 10) / 10,
      price: Math.round(price * 100) / 100,
      return1M: Math.round(return1M * 10) / 10,
      marketCapB: Math.round(marketCapB * 10) / 10,
      dividendYield: Math.round(dividendYield * 100) / 100,
      roe: Math.round(roe * 10) / 10,
      debtEquity: Math.round(debtEquity * 100) / 100,
      grossMargin: Math.round(grossMargin * 10) / 10,
      epsGrowth: Math.round(epsGrowth * 10) / 10,
      volume: Math.round(avgVol * volMultiplier),
      avgVolume: Math.round(avgVol),
      week52High: Math.round(week52High * 100) / 100,
      week52Low: Math.round(week52Low * 100) / 100,
      pbRatio: Math.round(pbRatio * 100) / 100,
      evEbitda: Math.round(evEbitda * 10) / 10,
      analystRating: ANALYST_RATINGS[Math.floor(rng() * ANALYST_RATINGS.length)] ?? "Hold",
      consecutiveDivYears,
      dividendPayoutRatio: Math.round(dividendPayoutRatio * 10) / 10,
      insiderTrend,
      atr: Math.round(atr * 100) / 100,
      maSignal,
      macd,
      beta: Math.round(beta * 100) / 100,
    };
  });
}

const STOCK_UNIVERSE = generateStockUniverse();

// ── Filter types ──────────────────────────────────────────────────────────────

type FilterOperator = "<" | ">" | "<=" | ">=" | "=" | "between";
type MarketCapCategory = "micro" | "small" | "mid" | "large" | "mega" | "all";

interface FilterCriterion {
  id: string;
  category: string;
  label: string;
  field: keyof ScreenerStock;
  operator: FilterOperator;
  value: number;
  value2?: number;
  enabled: boolean;
}

interface SavedScreen {
  id: string;
  name: string;
  criteria: FilterCriterion[];
  createdAt: string;
  lastRun: string;
  resultCount: number;
}

// ── Preset screens ────────────────────────────────────────────────────────────

const PRESET_CRITERIA: Record<string, FilterCriterion[]> = {
  Value: [
    { id: "v1", category: "Fundamentals", label: "P/E < 15", field: "peRatio", operator: "<", value: 15, enabled: true },
    { id: "v2", category: "Fundamentals", label: "P/B < 2", field: "pbRatio", operator: "<", value: 2, enabled: true },
    { id: "v3", category: "Fundamentals", label: "EV/EBITDA < 12", field: "evEbitda", operator: "<", value: 12, enabled: true },
  ],
  Growth: [
    { id: "g1", category: "Momentum", label: "Revenue Growth > 20%", field: "revenueGrowth", operator: ">", value: 20, enabled: true },
    { id: "g2", category: "Momentum", label: "EPS Growth > 15%", field: "epsGrowth", operator: ">", value: 15, enabled: true },
    { id: "g3", category: "Fundamentals", label: "Gross Margin > 40%", field: "grossMargin", operator: ">", value: 40, enabled: true },
  ],
  Dividend: [
    { id: "d1", category: "Dividend", label: "Yield > 2%", field: "dividendYield", operator: ">", value: 2, enabled: true },
    { id: "d2", category: "Dividend", label: "Payout Ratio < 70%", field: "dividendPayoutRatio", operator: "<", value: 70, enabled: true },
  ],
  Momentum: [
    { id: "m1", category: "Technical", label: "RSI 40–65", field: "rsi", operator: "between", value: 40, value2: 65, enabled: true },
    { id: "m2", category: "Momentum", label: "1M Return > 5%", field: "return1M", operator: ">", value: 5, enabled: true },
  ],
  Quality: [
    { id: "q1", category: "Fundamentals", label: "ROE > 15%", field: "roe", operator: ">", value: 15, enabled: true },
    { id: "q2", category: "Fundamentals", label: "Net Margin > 10%", field: "netMargin", operator: ">", value: 10, enabled: true },
    { id: "q3", category: "Fundamentals", label: "D/E < 1", field: "debtEquity", operator: "<", value: 1, enabled: true },
  ],
  "Deep Value": [
    { id: "dv1", category: "Fundamentals", label: "P/E < 10", field: "peRatio", operator: "<", value: 10, enabled: true },
    { id: "dv2", category: "Fundamentals", label: "P/B < 1.5", field: "pbRatio", operator: "<", value: 1.5, enabled: true },
    { id: "dv3", category: "Fundamentals", label: "Div Yield > 3%", field: "dividendYield", operator: ">", value: 3, enabled: true },
  ],
  GARP: [
    { id: "gp1", category: "Fundamentals", label: "Fwd P/E < 25", field: "forwardPE", operator: "<", value: 25, enabled: true },
    { id: "gp2", category: "Momentum", label: "Revenue Growth > 10%", field: "revenueGrowth", operator: ">", value: 10, enabled: true },
    { id: "gp3", category: "Fundamentals", label: "ROE > 12%", field: "roe", operator: ">", value: 12, enabled: true },
  ],
};

// ── Available filter definitions ──────────────────────────────────────────────

const AVAILABLE_FILTERS: Omit<FilterCriterion, "id" | "enabled">[] = [
  // Fundamentals
  { category: "Fundamentals", label: "P/E Ratio", field: "peRatio", operator: "<", value: 20 },
  { category: "Fundamentals", label: "Forward P/E", field: "forwardPE", operator: "<", value: 18 },
  { category: "Fundamentals", label: "P/B Ratio", field: "pbRatio", operator: "<", value: 3 },
  { category: "Fundamentals", label: "EV/EBITDA", field: "evEbitda", operator: "<", value: 15 },
  { category: "Fundamentals", label: "Revenue Growth %", field: "revenueGrowth", operator: ">", value: 10 },
  { category: "Fundamentals", label: "EPS Growth %", field: "epsGrowth", operator: ">", value: 10 },
  { category: "Fundamentals", label: "Gross Margin %", field: "grossMargin", operator: ">", value: 30 },
  { category: "Fundamentals", label: "Net Margin %", field: "netMargin", operator: ">", value: 10 },
  { category: "Fundamentals", label: "ROE %", field: "roe", operator: ">", value: 15 },
  { category: "Fundamentals", label: "Debt/Equity", field: "debtEquity", operator: "<", value: 1 },
  // Technical
  { category: "Technical", label: "RSI Oversold (<30)", field: "rsi", operator: "<", value: 30 },
  { category: "Technical", label: "RSI Overbought (>70)", field: "rsi", operator: ">", value: 70 },
  { category: "Technical", label: "RSI in range", field: "rsi", operator: "between", value: 40, value2: 65 },
  { category: "Technical", label: "Volume vs Avg (x)", field: "volume", operator: ">", value: 1 },
  { category: "Technical", label: "52W High proximity (%)", field: "week52High", operator: ">", value: 0 },
  { category: "Technical", label: "ATR (volatility)", field: "atr", operator: "<", value: 10 },
  // Momentum
  { category: "Momentum", label: "1M Return % >", field: "return1M", operator: ">", value: 5 },
  { category: "Momentum", label: "Beta <", field: "beta", operator: "<", value: 1.5 },
  // Dividend
  { category: "Dividend", label: "Dividend Yield % >", field: "dividendYield", operator: ">", value: 2 },
  { category: "Dividend", label: "Payout Ratio % <", field: "dividendPayoutRatio", operator: "<", value: 70 },
  { category: "Dividend", label: "Consecutive Div Years >", field: "consecutiveDivYears", operator: ">", value: 5 },
  // Size
  { category: "Size", label: "Market Cap (B) >", field: "marketCapB", operator: ">", value: 1 },
  { category: "Size", label: "Market Cap (B) <", field: "marketCapB", operator: "<", value: 300 },
];

function applyFilter(stock: ScreenerStock, f: FilterCriterion): boolean {
  const val = stock[f.field] as number;
  if (f.operator === "<") return val < f.value;
  if (f.operator === ">") return val > f.value;
  if (f.operator === "<=") return val <= f.value;
  if (f.operator === ">=") return val >= f.value;
  if (f.operator === "=") return val === f.value;
  if (f.operator === "between") return val >= f.value && val <= (f.value2 ?? f.value);
  return true;
}

// ── Market cap label ──────────────────────────────────────────────────────────

function marketCapLabel(capB: number): string {
  if (capB < 0.3) return "Micro";
  if (capB < 2) return "Small";
  if (capB < 10) return "Mid";
  if (capB < 200) return "Large";
  return "Mega";
}

function formatMarketCap(capB: number): string {
  if (capB >= 1000) return `$${(capB / 1000).toFixed(1)}T`;
  return `$${capB.toFixed(1)}B`;
}

// ── Color helpers ─────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 45) return "text-amber-400";
  return "text-red-400";
}

function returnColor(r: number): string {
  if (r > 2) return "text-emerald-400";
  if (r < -2) return "text-red-400";
  return "text-muted-foreground";
}

function rsiColor(rsi: number): string {
  if (rsi < 30) return "text-emerald-400";
  if (rsi > 70) return "text-red-400";
  return "text-muted-foreground";
}

// ── Saved screens seed data ───────────────────────────────────────────────────

const INITIAL_SAVED: SavedScreen[] = [
  {
    id: "s1",
    name: "Quality Compounders",
    criteria: PRESET_CRITERIA["Quality"]!,
    createdAt: "2026-02-10",
    lastRun: "2026-03-25",
    resultCount: 11,
  },
  {
    id: "s2",
    name: "High Yield Dividend",
    criteria: PRESET_CRITERIA["Dividend"]!,
    createdAt: "2026-01-18",
    lastRun: "2026-03-20",
    resultCount: 14,
  },
  {
    id: "s3",
    name: "Deep Value Picks",
    criteria: PRESET_CRITERIA["Deep Value"]!,
    createdAt: "2026-03-01",
    lastRun: "2026-03-27",
    resultCount: 8,
  },
];

const COMMUNITY_SCREENS: { name: string; author: string; runs: number; resultCount: number; description: string }[] = [
  { name: "Insider Accumulation", author: "QuintMorgan", runs: 3412, resultCount: 7, description: "Stocks with net insider buying + strong fundamentals" },
  { name: "Small Cap Momentum", author: "AlphaRider", runs: 2187, resultCount: 15, description: "Micro/small caps with 1M return >10%, RSI 45-65" },
  { name: "Dividend Aristocrats", author: "IncomeFirst", runs: 1893, resultCount: 12, description: "25+ years consecutive dividends, D/E < 1.5" },
  { name: "GARP Growth Kings", author: "PixelTrader", runs: 1540, resultCount: 9, description: "Growth at reasonable price: Fwd P/E < 22, Rev Growth > 15%" },
  { name: "Turnaround Candidates", author: "CtrarianK", runs: 987, resultCount: 6, description: "Beaten-down stocks with improving margins + insider buying" },
];

// ── Top picks with AI rationale ───────────────────────────────────────────────

interface TopPick {
  ticker: string;
  company: string;
  sector: string;
  category: string;
  confidence: number;
  rationale: string;
  riskFactors: string;
  score: number;
  price: number;
  return1M: number;
}

const rngPicks = mulberry32(6061);

function buildTopPicks(): TopPick[] {
  const categories = ["Value", "Growth", "Income", "Momentum", "Quality"];
  const rationales = [
    "Trading at 35% discount to sector peers with accelerating revenue growth. Insider buying at 6-month highs signals management confidence. Technical breakout above 200-day MA confirms trend.",
    "Exceptional margin expansion story — gross margins expanding 400bps YoY while maintaining 25% revenue growth. Free cash flow turning positive next quarter.",
    "Dividend aristocrat with 22 consecutive years of payout growth. Low debt/equity of 0.4 and strong current ratio provides downside protection in volatile markets.",
    "Price momentum strong across all timeframes. RSI at 58 (not overbought). Sector rotation into industrials favors this name as earnings estimates revised upward.",
    "Best-in-class fundamentals: ROE of 34%, net margin of 18%, and minimal debt. Management guiding for 12-15% EPS growth next 3 years with buyback program.",
  ];
  const risks = [
    "Rate sensitivity could compress multiples; key customer concentration in top 3 accounts.",
    "Valuation premium requires execution consistency; any guidance miss would be punished severely.",
    "Payout ratio at 65% leaves limited room to grow dividend if earnings disappoint.",
    "Momentum strategies can reverse quickly — stop loss discipline essential for this position.",
    "Premium valuation (32x fwd P/E) already prices in optimistic scenario; limited margin of safety.",
  ];
  const sorted = [...STOCK_UNIVERSE].sort((a, b) => b.score - a.score);
  return sorted.slice(0, 5).map((s, i) => ({
    ticker: s.ticker,
    company: s.company,
    sector: s.sector,
    category: categories[i % categories.length]!,
    confidence: 72 + Math.floor(rngPicks() * 20),
    rationale: rationales[i]!,
    riskFactors: risks[i]!,
    score: s.score,
    price: s.price,
    return1M: s.return1M,
  }));
}

const TOP_PICKS = buildTopPicks();

// ── Sparkline SVG ─────────────────────────────────────────────────────────────

function Sparkline({ ticker, positive }: { ticker: string; positive: boolean }) {
  const rng = mulberry32(ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0) ^ 0xdeadbeef);
  const pts: number[] = [50];
  for (let i = 1; i < 20; i++) {
    pts.push(Math.max(5, Math.min(95, pts[i - 1]! + (rng() - 0.5) * 20)));
  }
  const w = 80;
  const h = 28;
  const dx = w / (pts.length - 1);
  const pathD = pts.map((y, i) => `${i === 0 ? "M" : "L"}${i * dx},${h - (y / 100) * h}`).join(" ");
  const color = positive ? "#34d399" : "#f87171";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Venn Diagram SVG ──────────────────────────────────────────────────────────

function VennDiagram({ overlapCount, aOnly, bOnly }: { overlapCount: number; aOnly: number; bOnly: number }) {
  return (
    <svg width="200" height="120" viewBox="0 0 200 120">
      <circle cx="75" cy="60" r="50" fill="hsl(var(--primary))" fillOpacity="0.15" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      <circle cx="125" cy="60" r="50" fill="hsl(var(--chart-2, 220 70% 55%))" fillOpacity="0.15" stroke="hsl(var(--chart-2, 220 70% 55%))" strokeWidth="1.5" />
      <text x="50" y="58" textAnchor="middle" fontSize="11" fill="hsl(var(--foreground))" fontWeight="600">{aOnly}</text>
      <text x="50" y="72" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">only</text>
      <text x="100" y="58" textAnchor="middle" fontSize="11" fill="hsl(var(--foreground))" fontWeight="600">{overlapCount}</text>
      <text x="100" y="72" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">both</text>
      <text x="150" y="58" textAnchor="middle" fontSize="11" fill="hsl(var(--foreground))" fontWeight="600">{bOnly}</text>
      <text x="150" y="72" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">only</text>
    </svg>
  );
}

// ── Sort types ────────────────────────────────────────────────────────────────

type SortField = keyof ScreenerStock;
type SortDir = "asc" | "desc";

// ── Filter chip ───────────────────────────────────────────────────────────────

function FilterChip({ f, onRemove, onToggle }: { f: FilterCriterion; onRemove: () => void; onToggle: () => void }) {
  const label = f.operator === "between"
    ? `${f.label}: ${f.value}–${f.value2}`
    : `${f.label} ${f.operator} ${f.value}`;
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs cursor-pointer select-none transition-colors",
        f.enabled
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-muted/30 text-muted-foreground",
      )}
      onClick={onToggle}
    >
      <span>{label}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ScreenerPage() {
  const [activeTab, setActiveTab] = useState("builder");
  const [criteria, setCriteria] = useState<FilterCriterion[]>([]);
  const [marketCapFilter, setMarketCapFilter] = useState<MarketCapCategory>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [hasRun, setHasRun] = useState(false);
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedStock, setSelectedStock] = useState<ScreenerStock | null>(null);
  const [savedScreens, setSavedScreens] = useState<SavedScreen[]>(INITIAL_SAVED);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [compareA, setCompareA] = useState<string>("");
  const [compareB, setCompareB] = useState<string>("");
  const [showCompare, setShowCompare] = useState(false);
  const [addFilterOpen, setAddFilterOpen] = useState(false);
  const [addFilterCategory, setAddFilterCategory] = useState<string>("Fundamentals");
  const nextId = useRef(100);

  // Filter results
  const filteredStocks = useMemo(() => {
    let stocks = STOCK_UNIVERSE;

    // Apply market cap filter
    if (marketCapFilter !== "all") {
      stocks = stocks.filter((s) => {
        const cat = marketCapLabel(s.marketCapB).toLowerCase() as MarketCapCategory;
        return cat === marketCapFilter;
      });
    }

    // Apply sector filter
    if (sectorFilter !== "all") {
      stocks = stocks.filter((s) => s.sector === sectorFilter);
    }

    // Apply criteria
    const enabledCriteria = criteria.filter((c) => c.enabled);
    stocks = stocks.filter((s) => enabledCriteria.every((f) => applyFilter(s, f)));

    // Sort
    stocks = [...stocks].sort((a, b) => {
      const av = a[sortField] as number | string;
      const bv = b[sortField] as number | string;
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return stocks.map((s, i) => ({ ...s, rank: i + 1 }));
  }, [criteria, marketCapFilter, sectorFilter, sortField, sortDir]);

  const handleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortDir("desc");
      return field;
    });
  }, []);

  const handleAddFilter = useCallback((f: Omit<FilterCriterion, "id" | "enabled">) => {
    const id = `f${nextId.current++}`;
    setCriteria((prev) => [...prev, { ...f, id, enabled: true }]);
    setAddFilterOpen(false);
  }, []);

  const handleRemoveFilter = useCallback((id: string) => {
    setCriteria((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleToggleFilter = useCallback((id: string) => {
    setCriteria((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
    );
  }, []);

  const handleLoadPreset = useCallback((name: string) => {
    const preset = PRESET_CRITERIA[name];
    if (!preset) return;
    setCriteria(preset.map((p, i) => ({ ...p, id: `pre${Date.now()}${i}` })));
  }, []);

  const handleRunScreen = useCallback(() => {
    setHasRun(true);
    setActiveTab("results");
  }, []);

  const handleSaveScreen = useCallback(() => {
    if (!saveName.trim()) return;
    const newScreen: SavedScreen = {
      id: `s${Date.now()}`,
      name: saveName.trim(),
      criteria: [...criteria],
      createdAt: "2026-03-27",
      lastRun: "2026-03-27",
      resultCount: filteredStocks.length,
    };
    setSavedScreens((prev) => [newScreen, ...prev]);
    setSaveDialogOpen(false);
    setSaveName("");
  }, [saveName, criteria, filteredStocks.length]);

  const handleLoadSaved = useCallback((screen: SavedScreen) => {
    setCriteria(screen.criteria.map((c, i) => ({ ...c, id: `loaded${Date.now()}${i}` })));
    setHasRun(true);
    setActiveTab("results");
  }, []);

  const handleExportCSV = useCallback(() => {
    const header = "Rank,Ticker,Company,Sector,Score,P/E,Fwd P/E,Rev Growth %,Net Margin %,RSI,Price,1M Return %,Market Cap B,Div Yield %\n";
    const rows = filteredStocks
      .map((s) =>
        `${s.rank},${s.ticker},"${s.company}",${s.sector},${s.score},${s.peRatio},${s.forwardPE},${s.revenueGrowth},${s.netMargin},${s.rsi},${s.price},${s.return1M},${s.marketCapB},${s.dividendYield}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "screener_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredStocks]);

  // Compare logic
  const compareResults = useMemo(() => {
    if (!compareA || !compareB) return null;
    const sA = savedScreens.find((s) => s.id === compareA);
    const sB = savedScreens.find((s) => s.id === compareB);
    if (!sA || !sB) return null;
    const runScreen = (screen: SavedScreen) => {
      const enabledCriteria = screen.criteria.filter((c) => c.enabled);
      return STOCK_UNIVERSE.filter((s) => enabledCriteria.every((f) => applyFilter(s, f))).map((s) => s.ticker);
    };
    const tickersA = new Set(runScreen(sA));
    const tickersB = new Set(runScreen(sB));
    const overlap = [...tickersA].filter((t) => tickersB.has(t));
    const onlyA = [...tickersA].filter((t) => !tickersB.has(t));
    const onlyB = [...tickersB].filter((t) => !tickersA.has(t));
    return { sA, sB, overlap, onlyA, onlyB };
  }, [compareA, compareB, savedScreens]);

  // Sector leaders
  const sectorLeaders = useMemo(() => {
    const byScore = [...STOCK_UNIVERSE].sort((a, b) => b.score - a.score);
    const seen = new Set<string>();
    return byScore.filter((s) => {
      if (seen.has(s.sector)) return false;
      seen.add(s.sector);
      return true;
    });
  }, []);

  // Hidden gems: small/mid cap, score >= 60
  const hiddenGems = useMemo(() =>
    STOCK_UNIVERSE.filter((s) => s.marketCapB < 10 && s.score >= 55)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5),
    [],
  );

  // Contrarian: insider buying + RSI < 40 or return1M < -5
  const contrarian = useMemo(() =>
    STOCK_UNIVERSE.filter((s) => s.insiderTrend === "buying" && (s.rsi < 45 || s.return1M < -3))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5),
    [],
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-20" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />;
  };

  const filterCategories = [...new Set(AVAILABLE_FILTERS.map((f) => f.category))];
  const filteredAvailable = AVAILABLE_FILTERS.filter((f) => f.category === addFilterCategory);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-border/50 px-6 py-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">AI Screener</h1>
              <p className="text-xs text-muted-foreground">50 synthetic stocks · AI-scored · Seeded universe</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "builder" && (
              <>
                <button
                  type="button"
                  onClick={() => setSaveDialogOpen(true)}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Bookmark className="h-3 w-3" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleRunScreen}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Play className="h-3 w-3 fill-current" />
                  Run Screen
                </button>
              </>
            )}
            {activeTab === "results" && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Download className="h-3 w-3" />
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-6 mt-3 mb-0 shrink-0 w-fit h-8">
          <TabsTrigger value="builder" className="text-xs px-3">Screen Builder</TabsTrigger>
          <TabsTrigger value="results" className="text-xs px-3">
            Results {hasRun && <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[11px] font-semibold text-primary">{filteredStocks.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs px-3">AI Recommendations</TabsTrigger>
          <TabsTrigger value="saved" className="text-xs px-3">Saved Screens</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Screen Builder ──────────────────────────────────────────── */}
        <TabsContent value="builder" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
          <div className="max-w-4xl space-y-6">
            {/* Preset loader */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Load preset:</span>
              {Object.keys(PRESET_CRITERIA).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleLoadPreset(name)}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Active criteria */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Active Filters</span>
                <span className="text-xs text-muted-foreground">{criteria.filter((c) => c.enabled).length} enabled · {criteria.length} total</span>
              </div>
              {criteria.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No filters added. Use presets or add criteria below.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {criteria.map((f) => (
                    <FilterChip
                      key={f.id}
                      f={f}
                      onRemove={() => handleRemoveFilter(f.id)}
                      onToggle={() => handleToggleFilter(f.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Global filters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <span className="mb-3 block text-sm font-medium">Market Cap</span>
                <div className="flex flex-wrap gap-2">
                  {(["all", "micro", "small", "mid", "large", "mega"] as MarketCapCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMarketCapFilter(cat)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                        marketCapFilter === cat
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                      )}
                    >
                      {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <span className="mb-3 block text-sm font-medium">Sector</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSectorFilter("all")}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      sectorFilter === "all"
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30",
                    )}
                  >
                    All
                  </button>
                  {SECTORS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSectorFilter(s)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        sectorFilter === s
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Add criterion */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Add Criterion</span>
                <button
                  type="button"
                  onClick={() => setAddFilterOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>

              {addFilterOpen && (
                <div className="space-y-3">
                  {/* Category tabs */}
                  <div className="flex gap-2">
                    {filterCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setAddFilterCategory(cat)}
                        className={cn(
                          "rounded-md border px-3 py-1 text-xs font-medium transition-colors",
                          addFilterCategory === cat
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30",
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {/* Available filters */}
                  <div className="grid grid-cols-2 gap-2">
                    {filteredAvailable.map((f, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddFilter(f)}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                      >
                        <Plus className="h-3 w-3 shrink-0 text-primary/60" />
                        {f.label}
                        <span className="ml-auto text-xs text-muted-foreground/50">
                          {f.operator === "between" ? `${f.value}–${f.value2}` : `${f.operator}${f.value}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <BarChart2 className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {criteria.filter((c) => c.enabled).length === 0
                  ? "No filters active — all 50 stocks will appear in results."
                  : `${criteria.filter((c) => c.enabled).length} filter${criteria.filter((c) => c.enabled).length !== 1 ? "s" : ""} active · estimated ${filteredStocks.length} results`}
              </span>
              <button
                type="button"
                onClick={handleRunScreen}
                className="ml-auto flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                <Play className="h-3 w-3 fill-current" />
                Run Screen
              </button>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Results ─────────────────────────────────────────────────── */}
        <TabsContent value="results" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
          <div className="flex h-full">
            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full min-w-[1100px] text-xs">
                <thead className="sticky top-0 z-10 bg-card border-b border-border">
                  <tr>
                    {(
                      [
                        { label: "#", field: "rank" },
                        { label: "Ticker", field: "ticker" },
                        { label: "Company", field: "company" },
                        { label: "Sector", field: "sector" },
                        { label: "AI Score", field: "score" },
                        { label: "P/E", field: "peRatio" },
                        { label: "Fwd P/E", field: "forwardPE" },
                        { label: "Rev Grw%", field: "revenueGrowth" },
                        { label: "Margin%", field: "netMargin" },
                        { label: "RSI", field: "rsi" },
                        { label: "Price", field: "price" },
                        { label: "1M Ret%", field: "return1M" },
                        { label: "Mkt Cap", field: "marketCapB" },
                        { label: "Div Yld%", field: "dividendYield" },
                      ] as { label: string; field: SortField }[]
                    ).map(({ label, field }) => (
                      <th
                        key={field}
                        onClick={() => handleSort(field)}
                        className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-left font-medium text-muted-foreground hover:text-foreground select-none"
                      >
                        <span className="flex items-center gap-1">
                          {label}
                          <SortIcon field={field} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((s) => (
                    <tr
                      key={s.ticker}
                      onClick={() => setSelectedStock(selectedStock?.ticker === s.ticker ? null : s)}
                      className={cn(
                        "cursor-pointer border-b border-border/30 transition-colors hover:bg-accent/40",
                        selectedStock?.ticker === s.ticker && "bg-primary/5",
                      )}
                    >
                      <td className="px-3 py-2 text-muted-foreground">{s.rank}</td>
                      <td className="px-3 py-2 font-mono font-medium text-primary">{s.ticker}</td>
                      <td className="px-3 py-2 max-w-[120px] truncate text-foreground/80">{s.company}</td>
                      <td className="px-3 py-2 text-muted-foreground">{s.sector.split(" ")[0]}</td>
                      <td className="px-3 py-2">
                        <span className={cn("font-medium", scoreColor(s.score))}>{s.score}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={cn(s.peRatio < 15 ? "text-emerald-400" : s.peRatio > 35 ? "text-red-400" : "text-muted-foreground")}>
                          {s.peRatio}x
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={cn(s.forwardPE < 18 ? "text-emerald-400" : s.forwardPE > 30 ? "text-red-400" : "text-muted-foreground")}>
                          {s.forwardPE}x
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={cn(s.revenueGrowth > 15 ? "text-emerald-400" : s.revenueGrowth < 0 ? "text-red-400" : "text-amber-400")}>
                          {s.revenueGrowth > 0 ? "+" : ""}{s.revenueGrowth}%
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={cn(s.netMargin > 10 ? "text-emerald-400" : s.netMargin < 0 ? "text-red-400" : "text-amber-400")}>
                          {s.netMargin}%
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={rsiColor(s.rsi)}>{s.rsi}</span>
                      </td>
                      <td className="px-3 py-2 font-medium">${s.price.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <span className={returnColor(s.return1M)}>
                          {s.return1M > 0 ? "+" : ""}{s.return1M}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{formatMarketCap(s.marketCapB)}</td>
                      <td className="px-3 py-2">
                        <span className={s.dividendYield > 0 ? "text-emerald-400" : "text-muted-foreground/40"}>
                          {s.dividendYield > 0 ? `${s.dividendYield}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredStocks.length === 0 && (
                    <tr>
                      <td colSpan={14} className="px-6 py-12 text-center text-muted-foreground">
                        No stocks match your current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Right detail panel */}
            {selectedStock && (
              <div className="w-72 shrink-0 border-l border-border overflow-y-auto bg-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold text-primary text-lg">{selectedStock.ticker}</p>
                    <p className="text-xs text-muted-foreground">{selectedStock.company}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedStock(null)} className="rounded-md p-1 hover:bg-accent">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Sparkline */}
                <div className="flex items-center justify-between rounded-lg bg-muted/20 p-3">
                  <div>
                    <p className="text-xl font-medium">${selectedStock.price.toFixed(2)}</p>
                    <p className={cn("text-xs", returnColor(selectedStock.return1M))}>
                      {selectedStock.return1M > 0 ? "+" : ""}{selectedStock.return1M}% (1M)
                    </p>
                  </div>
                  <Sparkline ticker={selectedStock.ticker} positive={selectedStock.return1M >= 0} />
                </div>

                {/* AI Score */}
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">AI Score</span>
                    <span className={cn("text-lg font-bold", scoreColor(selectedStock.score))}>{selectedStock.score}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", selectedStock.score >= 70 ? "bg-emerald-400" : selectedStock.score >= 45 ? "bg-amber-400" : "bg-red-400")}
                      style={{ width: `${selectedStock.score}%` }}
                    />
                  </div>
                </div>

                {/* Key metrics */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Key Metrics</p>
                  {[
                    { label: "Sector", value: selectedStock.sector },
                    { label: "Market Cap", value: `${formatMarketCap(selectedStock.marketCapB)} (${marketCapLabel(selectedStock.marketCapB)})` },
                    { label: "P/E", value: `${selectedStock.peRatio}x` },
                    { label: "Fwd P/E", value: `${selectedStock.forwardPE}x` },
                    { label: "P/B", value: `${selectedStock.pbRatio}x` },
                    { label: "EV/EBITDA", value: `${selectedStock.evEbitda}x` },
                    { label: "Rev Growth", value: `${selectedStock.revenueGrowth > 0 ? "+" : ""}${selectedStock.revenueGrowth}%` },
                    { label: "Net Margin", value: `${selectedStock.netMargin}%` },
                    { label: "ROE", value: `${selectedStock.roe}%` },
                    { label: "D/E", value: selectedStock.debtEquity.toFixed(2) },
                    { label: "RSI", value: selectedStock.rsi },
                    { label: "Analyst", value: selectedStock.analystRating },
                    { label: "Insider", value: selectedStock.insiderTrend },
                    { label: "Dividend", value: selectedStock.dividendYield > 0 ? `${selectedStock.dividendYield}%` : "None" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-md border border-primary/40 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <Star className="h-3 w-3" />
                  Add to Watchlist
                </button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab 3: AI Recommendations ──────────────────────────────────────── */}
        <TabsContent value="ai" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
          <div className="max-w-5xl space-y-8">
            {/* Today's Top Picks */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium">Today's Top Picks</h2>
                <span className="text-xs text-muted-foreground">· AI-curated · 2026-03-27</span>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {TOP_PICKS.map((pick) => (
                  <div key={pick.ticker} className="rounded-md border border-border bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-primary text-base">{pick.ticker}</span>
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            pick.category === "Value" ? "bg-primary/10 text-primary" :
                            pick.category === "Growth" ? "bg-emerald-500/10 text-emerald-400" :
                            pick.category === "Income" ? "bg-amber-500/10 text-amber-400" :
                            pick.category === "Momentum" ? "bg-primary/10 text-primary" :
                            "bg-cyan-500/10 text-muted-foreground",
                          )}>
                            {pick.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{pick.company}</p>
                        <p className="text-xs text-muted-foreground/60">{pick.sector}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-medium">${pick.price.toFixed(2)}</p>
                        <p className={cn("text-xs", returnColor(pick.return1M))}>
                          {pick.return1M > 0 ? "+" : ""}{pick.return1M}% 1M
                        </p>
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">AI Confidence</span>
                        <span className="text-xs font-medium text-emerald-400">{pick.confidence}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pick.confidence}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="rounded-md bg-muted/30 p-2.5">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Why this stock</p>
                        <p className="text-xs leading-relaxed">{pick.rationale}</p>
                      </div>
                      <div className="rounded-md bg-red-500/5 border border-red-500/10 p-2.5">
                        <p className="text-xs font-medium text-red-400 mb-1">Risk factors</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{pick.riskFactors}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className={cn("text-xs font-medium", scoreColor(pick.score))}>Score {pick.score}/100</span>
                      <button type="button" className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <Star className="h-3 w-3" />
                        Watchlist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Sector Leaders */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium">Sector Leaders</h2>
                <span className="text-xs text-muted-foreground">· Best AI score per sector</span>
              </div>
              <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Sector</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Leader</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Score</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Price</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">1M Ret</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">P/E</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Rev Grw</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectorLeaders.map((s) => (
                      <tr key={s.ticker} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-2.5 text-muted-foreground">{s.sector}</td>
                        <td className="px-4 py-2.5">
                          <div>
                            <span className="font-mono font-medium text-primary">{s.ticker}</span>
                            <span className="text-muted-foreground/60 ml-1.5">{s.company}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={cn("font-medium", scoreColor(s.score))}>{s.score}</span>
                        </td>
                        <td className="px-4 py-2.5 font-medium">${s.price.toFixed(2)}</td>
                        <td className="px-4 py-2.5">
                          <span className={returnColor(s.return1M)}>{s.return1M > 0 ? "+" : ""}{s.return1M}%</span>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{s.peRatio}x</td>
                        <td className="px-4 py-2.5">
                          <span className={s.revenueGrowth > 0 ? "text-emerald-400" : "text-red-400"}>{s.revenueGrowth > 0 ? "+" : ""}{s.revenueGrowth}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Hidden Gems */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium">Hidden Gems</h2>
                <span className="text-xs text-muted-foreground">· Small/Mid-cap with strong fundamentals</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {hiddenGems.map((s) => (
                  <div key={s.ticker} className="rounded-md border border-border bg-card p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium text-primary">{s.ticker}</span>
                      <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">{marketCapLabel(s.marketCapB)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{s.company}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Score</span>
                        <span className={cn("font-medium", scoreColor(s.score))}>{s.score}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Rev Grw</span>
                        <span className="text-emerald-400">+{s.revenueGrowth}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Mkt Cap</span>
                        <span>{formatMarketCap(s.marketCapB)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contrarian Picks */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-medium">Contrarian Picks</h2>
                <span className="text-xs text-muted-foreground">· Insider accumulation despite bearish sentiment</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {contrarian.map((s) => (
                  <div key={s.ticker} className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium text-amber-400">{s.ticker}</span>
                      <span className="text-xs text-amber-400/70">Insider +</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{s.company}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">RSI</span>
                        <span className="text-emerald-400">{s.rsi}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">1M Ret</span>
                        <span className="text-red-400">{s.return1M}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Score</span>
                        <span className={cn("font-medium", scoreColor(s.score))}>{s.score}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </TabsContent>

        {/* ── Tab 4: Saved Screens ───────────────────────────────────────────── */}
        <TabsContent value="saved" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
          <div className="max-w-5xl space-y-8">
            {/* Your saved screens */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium">Your Saved Screens</h2>
              </div>
              {savedScreens.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No saved screens yet. Run a screen and save it from the Screen Builder tab.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {savedScreens.map((screen) => (
                    <div key={screen.id} className="rounded-md border border-border bg-card p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{screen.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {screen.criteria.length} criteri{screen.criteria.length !== 1 ? "a" : "on"} · Last run {screen.lastRun}
                          </p>
                        </div>
                        <span className={cn("text-xs font-medium", scoreColor(screen.resultCount * 5))}>
                          {screen.resultCount} results
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {screen.criteria.slice(0, 3).map((c) => (
                          <span key={c.id} className="rounded-full bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                            {c.label}
                          </span>
                        ))}
                        {screen.criteria.length > 3 && (
                          <span className="rounded-full bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                            +{screen.criteria.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleLoadSaved(screen)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Run Again
                        </button>
                        <button
                          type="button"
                          onClick={() => setSavedScreens((prev) => prev.filter((s) => s.id !== screen.id))}
                          className="rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-red-500/40 hover:text-red-400 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Compare screens */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium">Compare Screens</h2>
              </div>
              <div className="rounded-md border border-border bg-card p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <select
                    value={compareA}
                    onChange={(e) => setCompareA(e.target.value)}
                    className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select screen A</option>
                    {savedScreens.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <span className="text-xs text-muted-foreground font-medium">vs</span>
                  <select
                    value={compareB}
                    onChange={(e) => setCompareB(e.target.value)}
                    className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select screen B</option>
                    {savedScreens.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCompare(true)}
                    disabled={!compareA || !compareB || compareA === compareB}
                    className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40 hover:opacity-90"
                  >
                    Compare
                  </button>
                </div>

                {showCompare && compareResults && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-6">
                      <VennDiagram
                        overlapCount={compareResults.overlap.length}
                        aOnly={compareResults.onlyA.length}
                        bOnly={compareResults.onlyB.length}
                      />
                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="font-medium">{compareResults.sA.name}</p>
                          <p className="text-muted-foreground">{compareResults.onlyA.length} unique stocks</p>
                        </div>
                        <div>
                          <p className="font-medium text-primary">{compareResults.overlap.length} overlap</p>
                          <p className="text-muted-foreground">in both screens</p>
                        </div>
                        <div>
                          <p className="font-medium">{compareResults.sB.name}</p>
                          <p className="text-muted-foreground">{compareResults.onlyB.length} unique stocks</p>
                        </div>
                      </div>
                    </div>
                    {compareResults.overlap.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Overlapping stocks</p>
                        <div className="flex flex-wrap gap-2">
                          {compareResults.overlap.map((t) => (
                            <span key={t} className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-mono font-medium text-primary">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Historical performance */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-medium">Historical Performance</h2>
                <span className="text-xs text-muted-foreground">· Hypothetical top-5 backtest</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {savedScreens.map((screen) => {
                  const rng2 = mulberry32(screen.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
                  const ret = ((rng2() - 0.35) * 30).toFixed(1);
                  const isPos = parseFloat(ret) >= 0;
                  return (
                    <div key={screen.id} className="rounded-md border border-border bg-card p-4">
                      <p className="text-xs font-medium mb-1">{screen.name}</p>
                      <p className="text-xs text-muted-foreground mb-3">Top 5 from last month's run</p>
                      <div className="flex items-end gap-2">
                        <span className={cn("text-2xl font-bold", isPos ? "text-emerald-400" : "text-red-400")}>
                          {isPos ? "+" : ""}{ret}%
                        </span>
                        {isPos ? (
                          <TrendingUp className="h-4 w-4 text-emerald-400 mb-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-400 mb-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">vs S&P 500 +3.2% same period</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Community screens */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium">Community Screens</h2>
                <span className="text-xs text-muted-foreground">· Popular shared filters from top traders</span>
              </div>
              <div className="space-y-2">
                {COMMUNITY_SCREENS.map((cs) => (
                  <div
                    key={cs.name}
                    className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-medium">{cs.name}</p>
                        <span className="text-xs text-muted-foreground/60">by {cs.author}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{cs.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium">{cs.resultCount} stocks</p>
                      <p className="text-xs text-muted-foreground">{cs.runs.toLocaleString()} runs</p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded-md border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save dialog */}
      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-md border border-border bg-card p-6 shadow-sm w-80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Save Screen</h3>
              <button type="button" onClick={() => setSaveDialogOpen(false)} className="rounded-md p-1 hover:bg-accent">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Screen Name</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g. Quality Compounders"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => e.key === "Enter" && handleSaveScreen()}
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {criteria.length} filter{criteria.length !== 1 ? "s" : ""} · {filteredStocks.length} results
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSaveDialogOpen(false)}
                className="flex-1 rounded-md border border-border py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveScreen}
                disabled={!saveName.trim()}
                className="flex-1 rounded-md bg-primary py-2 text-xs font-medium text-primary-foreground disabled:opacity-40 hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
