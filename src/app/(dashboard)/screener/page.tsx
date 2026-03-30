"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
 Play,
 Plus,
 X,
 ChevronUp,
 ChevronDown,
 Star,
 TrendingUp,
 TrendingDown,
 RefreshCw,
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
 VERX: "Vertex Analytics", PLNK: "Planck Systems", QVNT: "Quantive Corp",
 NXGN: "NextGen Health", MRVL: "Marvell Semi", DXCM: "Dexcom Plus",
 ARLO: "Arlo Technologies", CRNX: "Carnyx Biotech", FLUX: "Flux Energy",
 HLTH: "Helios Health", BDRY: "Boundary AI", SMPL: "Simplex Retail",
 GLXY: "Galaxy Materials", PRTO: "Proto Industrials", OZRK: "Ozark Financial",
 WVLY: "Waverly Comms", MDPX: "MedPoint Pharma", STKR: "Stoker Energy",
 CRWD2: "Crowd Digital", FNTX: "Fintech X", BRNT: "Brentwood Retail",
 CLRX: "Clearex Utilities", VRTH: "Virtue REIT", PXLD: "Pixelated Media",
 KLVR: "Kelver Tech", NGST: "Nightstar Bio", ATLC: "Atlantic Capital",
 SNPX: "Synapse AI", BNKR: "Banker Group", HMBL: "Humble Brands",
 TMPR: "Templar Energy", MRVN: "Marvin Materials", INDX: "Index Industrials",
 SPHX: "Sphinx Comms", WLLS: "Wells Property", CPTA: "Capita Health",
 TRUX: "Trux Logistics", ARCO: "Arco Consumer", DMND: "Diamond Fin",
 PRXM: "Proxima Tech", LUXE: "Luxe Retail", BIOS: "Bios Therapeutics",
 ENRJ: "Energy Junction", MTLK: "MetalLink Corp", HRZN: "Horizon Media",
 PCFL: "Pacific Financial", CRVX: "Curvex Analytics", SVLT: "Sovolt Energy",
 RLTX: "Relatex Logistics", GRDN: "Garden Brands",
};

const TICKERS = Object.keys(COMPANY_NAMES);

const SECTOR_MAP: Record<number, SectorName> = {
 0: "Technology", 1: "Healthcare", 2: "Financials", 3: "Consumer Discretionary",
 4: "Consumer Staples", 5: "Industrials", 6: "Energy", 7: "Materials",
 8: "Real Estate", 9: "Communication Services",
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
 const maSignals: ScreenerStock["maSignal"][] = ["above50", "below50", "above200", "below200", "above_both", "below_both"];
 const maSignal = maSignals[Math.floor(rng() * maSignals.length)]!;
 const macdSignals: ScreenerStock["macd"][] = ["bullish", "bearish", "neutral"];
 const macd = macdSignals[Math.floor(rng() * macdSignals.length)]!;
 const insiderTrends: ScreenerStock["insiderTrend"][] = ["buying", "selling", "neutral"];
 const insiderTrend = insiderTrends[Math.floor(rng() * insiderTrends.length)]!;
 const beta = 0.3 + rng() * 2;

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
  rank: idx + 1, ticker, company: COMPANY_NAMES[ticker] ?? ticker, sector,
  score: Math.round(scoreRaw), peRatio: Math.round(peRatio * 10) / 10,
  forwardPE: Math.round(forwardPE * 10) / 10, revenueGrowth: Math.round(revenueGrowth * 10) / 10,
  netMargin: Math.round(netMargin * 10) / 10, rsi: Math.round(rsi * 10) / 10,
  price: Math.round(price * 100) / 100, return1M: Math.round(return1M * 10) / 10,
  marketCapB: Math.round(marketCapB * 10) / 10, dividendYield: Math.round(dividendYield * 100) / 100,
  roe: Math.round(roe * 10) / 10, debtEquity: Math.round(debtEquity * 100) / 100,
  grossMargin: Math.round(grossMargin * 10) / 10, epsGrowth: Math.round(epsGrowth * 10) / 10,
  volume: Math.round(avgVol * volMultiplier), avgVolume: Math.round(avgVol),
  week52High: Math.round(week52High * 100) / 100, week52Low: Math.round(week52Low * 100) / 100,
  pbRatio: Math.round(pbRatio * 100) / 100, evEbitda: Math.round(evEbitda * 10) / 10,
  analystRating: ANALYST_RATINGS[Math.floor(rng() * ANALYST_RATINGS.length)] ?? "Hold",
  consecutiveDivYears, dividendPayoutRatio: Math.round(dividendPayoutRatio * 10) / 10,
  insiderTrend, atr: Math.round(atr * 100) / 100, maSignal, macd,
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
 { category: "Technical", label: "RSI Oversold (<30)", field: "rsi", operator: "<", value: 30 },
 { category: "Technical", label: "RSI Overbought (>70)", field: "rsi", operator: ">", value: 70 },
 { category: "Technical", label: "RSI in range", field: "rsi", operator: "between", value: 40, value2: 65 },
 { category: "Technical", label: "Volume vs Avg (x)", field: "volume", operator: ">", value: 1 },
 { category: "Technical", label: "52W High proximity (%)", field: "week52High", operator: ">", value: 0 },
 { category: "Technical", label: "ATR (volatility)", field: "atr", operator: "<", value: 10 },
 { category: "Momentum", label: "1M Return % >", field: "return1M", operator: ">", value: 5 },
 { category: "Momentum", label: "Beta <", field: "beta", operator: "<", value: 1.5 },
 { category: "Dividend", label: "Dividend Yield % >", field: "dividendYield", operator: ">", value: 2 },
 { category: "Dividend", label: "Payout Ratio % <", field: "dividendPayoutRatio", operator: "<", value: 70 },
 { category: "Dividend", label: "Consecutive Div Years >", field: "consecutiveDivYears", operator: ">", value: 5 },
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

function scoreColor(score: number): string {
 if (score >= 70) return "text-emerald-400";
 if (score >= 45) return "text-amber-400";
 return "text-red-400";
}

function returnColor(r: number): string {
 if (r > 2) return "text-emerald-400/80";
 if (r < -2) return "text-rose-400/70";
 return "text-muted-foreground";
}

function rsiColor(rsi: number): string {
 if (rsi < 30) return "text-emerald-400";
 if (rsi > 70) return "text-red-400";
 return "text-muted-foreground";
}

// ── Saved screens seed data ───────────────────────────────────────────────────

const INITIAL_SAVED: SavedScreen[] = [
 { id: "s1", name: "Quality Compounders", criteria: PRESET_CRITERIA["Quality"]!, createdAt: "2026-02-10", lastRun: "2026-03-25", resultCount: 11 },
 { id: "s2", name: "High Yield Dividend", criteria: PRESET_CRITERIA["Dividend"]!, createdAt: "2026-01-18", lastRun: "2026-03-20", resultCount: 14 },
 { id: "s3", name: "Deep Value Picks", criteria: PRESET_CRITERIA["Deep Value"]!, createdAt: "2026-03-01", lastRun: "2026-03-27", resultCount: 8 },
];

const COMMUNITY_SCREENS: { name: string; author: string; runs: number; resultCount: number; description: string }[] = [
 { name: "Insider Accumulation", author: "QuintMorgan", runs: 3412, resultCount: 7, description: "Net insider buying + strong fundamentals" },
 { name: "Small Cap Momentum", author: "AlphaRider", runs: 2187, resultCount: 15, description: "Micro/small caps, 1M return >10%, RSI 45-65" },
 { name: "Dividend Aristocrats", author: "IncomeFirst", runs: 1893, resultCount: 12, description: "25+ years consecutive dividends, D/E < 1.5" },
 { name: "GARP Growth Kings", author: "PixelTrader", runs: 1540, resultCount: 9, description: "Fwd P/E < 22, Rev Growth > 15%" },
 { name: "Turnaround Candidates", author: "CtrarianK", runs: 987, resultCount: 6, description: "Beaten-down stocks, improving margins + insider buying" },
];

// ── Top picks with rationale ─────────────────────────────────────────────────

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
  "Trading at 35% discount to sector peers with accelerating revenue growth. Insider buying at 6-month highs signals management confidence.",
  "Exceptional margin expansion — gross margins expanding 400bps YoY while maintaining 25% revenue growth. Free cash flow turning positive next quarter.",
  "Dividend aristocrat with 22 consecutive years of payout growth. Low D/E of 0.4 provides downside protection in volatile markets.",
  "Price momentum strong across all timeframes. RSI at 58 (not overbought). Sector rotation into industrials favors this name.",
  "Best-in-class ROE of 34%, net margin of 18%, minimal debt. Management guiding 12-15% EPS growth next 3 years with active buyback.",
 ];
 const risks = [
  "Rate sensitivity could compress multiples; key customer concentration in top 3 accounts.",
  "Valuation premium requires execution consistency; any guidance miss would be punished severely.",
  "Payout ratio at 65% leaves limited room for dividend growth if earnings disappoint.",
  "Momentum strategies can reverse quickly — stop loss discipline essential for this position.",
  "Premium valuation (32x fwd P/E) already prices in optimistic scenario; limited margin of safety.",
 ];
 const sorted = [...STOCK_UNIVERSE].sort((a, b) => b.score - a.score);
 return sorted.slice(0, 5).map((s, i) => ({
  ticker: s.ticker, company: s.company, sector: s.sector,
  category: categories[i % categories.length]!,
  confidence: 72 + Math.floor(rngPicks() * 20),
  rationale: rationales[i]!, riskFactors: risks[i]!,
  score: s.score, price: s.price, return1M: s.return1M,
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
 const w = 72, h = 24;
 const dx = w / (pts.length - 1);
 const pathD = pts.map((y, i) => `${i === 0 ? "M" : "L"}${i * dx},${h - (y / 100) * h}`).join(" ");
 return (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
   <path d={pathD} fill="none" stroke={positive ? "#34d399" : "#f87171"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
  </svg>
 );
}

// ── Venn Diagram SVG ──────────────────────────────────────────────────────────

function VennDiagram({ overlapCount, aOnly, bOnly }: { overlapCount: number; aOnly: number; bOnly: number }) {
 return (
  <svg width="180" height="100" viewBox="0 0 180 100">
   <circle cx="65" cy="50" r="42" fill="hsl(var(--foreground))" fillOpacity="0.04" stroke="hsl(var(--foreground))" strokeWidth="1" strokeOpacity="0.15" />
   <circle cx="115" cy="50" r="42" fill="hsl(var(--foreground))" fillOpacity="0.04" stroke="hsl(var(--foreground))" strokeWidth="1" strokeOpacity="0.15" />
   <text x="42" y="48" textAnchor="middle" fontSize="13" fill="hsl(var(--foreground))" fontWeight="600">{aOnly}</text>
   <text x="42" y="62" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.5">only</text>
   <text x="90" y="48" textAnchor="middle" fontSize="13" fill="hsl(var(--foreground))" fontWeight="600">{overlapCount}</text>
   <text x="90" y="62" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.5">both</text>
   <text x="138" y="48" textAnchor="middle" fontSize="13" fill="hsl(var(--foreground))" fontWeight="600">{bOnly}</text>
   <text x="138" y="62" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.5">only</text>
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
  <button
   type="button"
   onClick={onToggle}
   className={cn(
    "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-mono transition-colors select-none",
    f.enabled
     ? "border-foreground/30 bg-foreground/[0.06] text-foreground"
     : "border-border/40 text-muted-foreground/40 line-through",
   )}
  >
   <span>{label}</span>
   <span
    role="button"
    tabIndex={0}
    onClick={(e) => { e.stopPropagation(); onRemove(); }}
    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onRemove(); } }}
    className="ml-0.5 rounded p-0.5 hover:bg-foreground/10"
   >
    <X className="h-2.5 w-2.5" />
   </span>
  </button>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Main Page ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

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

 const filteredStocks = useMemo(() => {
  let stocks = STOCK_UNIVERSE;
  if (marketCapFilter !== "all") {
   stocks = stocks.filter((s) => marketCapLabel(s.marketCapB).toLowerCase() as MarketCapCategory === marketCapFilter);
  }
  if (sectorFilter !== "all") {
   stocks = stocks.filter((s) => s.sector === sectorFilter);
  }
  const enabledCriteria = criteria.filter((c) => c.enabled);
  stocks = stocks.filter((s) => enabledCriteria.every((f) => applyFilter(s, f)));
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
   if (prev === field) { setSortDir((d) => (d === "asc" ? "desc" : "asc")); return field; }
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
  setCriteria((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
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
   id: `s${Date.now()}`, name: saveName.trim(), criteria: [...criteria],
   createdAt: "2026-03-27", lastRun: "2026-03-27", resultCount: filteredStocks.length,
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
   .map((s) => `${s.rank},${s.ticker},"${s.company}",${s.sector},${s.score},${s.peRatio},${s.forwardPE},${s.revenueGrowth},${s.netMargin},${s.rsi},${s.price},${s.return1M},${s.marketCapB},${s.dividendYield}`)
   .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "screener_results.csv";
  a.click();
  URL.revokeObjectURL(url);
 }, [filteredStocks]);

 const compareResults = useMemo(() => {
  if (!compareA || !compareB) return null;
  const sA = savedScreens.find((s) => s.id === compareA);
  const sB = savedScreens.find((s) => s.id === compareB);
  if (!sA || !sB) return null;
  const runScreen = (screen: SavedScreen) => {
   const enabled = screen.criteria.filter((c) => c.enabled);
   return STOCK_UNIVERSE.filter((s) => enabled.every((f) => applyFilter(s, f))).map((s) => s.ticker);
  };
  const tickersA = new Set(runScreen(sA));
  const tickersB = new Set(runScreen(sB));
  const overlap = [...tickersA].filter((t) => tickersB.has(t));
  const onlyA = [...tickersA].filter((t) => !tickersB.has(t));
  const onlyB = [...tickersB].filter((t) => !tickersA.has(t));
  return { sA, sB, overlap, onlyA, onlyB };
 }, [compareA, compareB, savedScreens]);

 const sectorLeaders = useMemo(() => {
  const byScore = [...STOCK_UNIVERSE].sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  return byScore.filter((s) => { if (seen.has(s.sector)) return false; seen.add(s.sector); return true; });
 }, []);

 const hiddenGems = useMemo(() =>
  STOCK_UNIVERSE.filter((s) => s.marketCapB < 10 && s.score >= 55).sort((a, b) => b.score - a.score).slice(0, 5), []);

 const contrarian = useMemo(() =>
  STOCK_UNIVERSE.filter((s) => s.insiderTrend === "buying" && (s.rsi < 45 || s.return1M < -3)).sort((a, b) => b.score - a.score).slice(0, 5), []);

 const SortIcon = ({ field }: { field: SortField }) => {
  if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-15" />;
  return sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-foreground" /> : <ChevronDown className="h-3 w-3 text-foreground" />;
 };

 const filterCategories = [...new Set(AVAILABLE_FILTERS.map((f) => f.category))];
 const filteredAvailable = AVAILABLE_FILTERS.filter((f) => f.category === addFilterCategory);
 const enabledCount = criteria.filter((c) => c.enabled).length;

 return (
  <div className="flex h-full flex-col overflow-hidden bg-background">
   {/* ── Header ──────────────────────────────────────────────────────────── */}
   <div className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
    <div className="flex items-end justify-between">
     <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/25 mb-1.5">Tools</p>
      <h1 className="font-serif text-3xl font-bold tracking-tight leading-none">Screener</h1>
      <p className="text-[11px] font-mono text-muted-foreground/25 mt-1">50 stocks · Composite scored · Seeded universe</p>
     </div>
     <div className="flex items-center gap-2">
      {activeTab === "builder" && (
       <>
        <button
         type="button"
         onClick={() => setSaveDialogOpen(true)}
         className="rounded-md border border-border/60 text-xs px-3 py-1.5 text-muted-foreground/50 hover:text-foreground hover:border-foreground/20 transition-colors"
        >
         Save
        </button>
        <button
         type="button"
         onClick={handleRunScreen}
         className="rounded-md bg-foreground text-background text-xs font-medium px-4 py-1.5 hover:bg-foreground/90 transition-colors flex items-center gap-1.5"
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
        className="rounded-md border border-border/60 text-xs px-3 py-1.5 text-muted-foreground/50 hover:text-foreground hover:border-foreground/20 transition-colors"
       >
        Export CSV
       </button>
      )}
     </div>
    </div>
   </div>

   {/* ── Tabs ────────────────────────────────────────────────────────────── */}
   <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col overflow-hidden">
    <TabsList className="mx-6 mt-3 shrink-0 w-fit h-8 bg-transparent gap-0 p-0 rounded-none border-b border-transparent">
     {[
      { value: "builder", label: "Screen Builder" },
      { value: "results", label: `Results${hasRun ? ` (${filteredStocks.length})` : ""}` },
      { value: "picks", label: "Picks" },
      { value: "saved", label: "Saved" },
     ].map((tab) => (
      <TabsTrigger
       key={tab.value}
       value={tab.value}
       className={cn(
        "rounded-none border-b-2 px-3 pb-2 pt-1 text-xs transition-colors bg-transparent shadow-none",
        activeTab === tab.value
         ? "border-foreground text-foreground font-medium"
         : "border-transparent text-muted-foreground/40 hover:text-muted-foreground/60",
       )}
      >
       {tab.label}
      </TabsTrigger>
     ))}
    </TabsList>

    {/* ═══ Tab 1: Screen Builder ═════════════════════════════════════════ */}
    <TabsContent value="builder" className="flex-1 overflow-y-auto px-6 py-5 data-[state=inactive]:hidden">
     <div className="max-w-3xl space-y-6">

      {/* Presets */}
      <div>
       <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25 mb-3">Presets</p>
       <div className="flex flex-wrap gap-1.5">
        {Object.keys(PRESET_CRITERIA).map((name) => (
         <button
          key={name}
          type="button"
          onClick={() => handleLoadPreset(name)}
          className="rounded-md border border-border/40 px-3 py-1.5 text-[11px] text-muted-foreground/50 transition-colors hover:border-foreground/20 hover:text-foreground hover:bg-foreground/[0.02]"
         >
          {name}
         </button>
        ))}
       </div>
      </div>

      {/* Active filters */}
      <div>
       <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25">
         Active Filters
         {enabledCount > 0 && <span className="ml-2 text-foreground/40">{enabledCount}</span>}
        </p>
        <span className="text-[10px] font-mono text-muted-foreground/20 tabular-nums">
         {filteredStocks.length} match{filteredStocks.length !== 1 ? "es" : ""}
        </span>
       </div>
       {criteria.length === 0 ? (
        <p className="text-xs text-muted-foreground/30 italic py-4">No filters added. Choose a preset or add criteria below.</p>
       ) : (
        <div className="flex flex-wrap gap-1.5">
         {criteria.map((f) => (
          <FilterChip key={f.id} f={f} onRemove={() => handleRemoveFilter(f.id)} onToggle={() => handleToggleFilter(f.id)} />
         ))}
        </div>
       )}
      </div>

      {/* Scope filters: Market Cap + Sector in a single row */}
      <div className="space-y-4">
       <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25 mb-2.5">Market Cap</p>
        <div className="flex flex-wrap gap-1">
         {(["all", "micro", "small", "mid", "large", "mega"] as MarketCapCategory[]).map((cat) => (
          <button
           key={cat}
           type="button"
           onClick={() => setMarketCapFilter(cat)}
           className={cn(
            "rounded-md text-[10px] font-mono uppercase tracking-wide px-2.5 py-1 transition-colors",
            marketCapFilter === cat
             ? "bg-foreground text-background font-medium"
             : "text-muted-foreground/35 hover:text-foreground/60",
           )}
          >
           {cat === "all" ? "All" : cat}
          </button>
         ))}
        </div>
       </div>
       <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25 mb-2.5">Sector</p>
        <div className="flex flex-wrap gap-1">
         <button
          type="button"
          onClick={() => setSectorFilter("all")}
          className={cn(
           "rounded-md text-[10px] font-mono uppercase tracking-wide px-2.5 py-1 transition-colors",
           sectorFilter === "all" ? "bg-foreground text-background font-medium" : "text-muted-foreground/35 hover:text-foreground/60",
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
            "rounded-md text-[10px] font-mono uppercase tracking-wide px-2.5 py-1 transition-colors",
            sectorFilter === s ? "bg-foreground text-background font-medium" : "text-muted-foreground/35 hover:text-foreground/60",
           )}
          >
           {s.split(" ")[0]}
          </button>
         ))}
        </div>
       </div>
      </div>

      {/* Add criterion */}
      <div>
       <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25">Add Criterion</p>
        <button
         type="button"
         onClick={() => setAddFilterOpen((v) => !v)}
         className={cn(
          "flex items-center gap-1 rounded-md text-[11px] px-2.5 py-1 transition-colors",
          addFilterOpen
           ? "bg-foreground/[0.06] text-foreground"
           : "text-muted-foreground/40 hover:text-foreground",
         )}
        >
         <Plus className="h-3 w-3" />
         Add
        </button>
       </div>

       {addFilterOpen && (
        <div className="space-y-3 border-l-2 border-foreground/10 pl-4">
         <div className="flex gap-1.5">
          {filterCategories.map((cat) => (
           <button
            key={cat}
            type="button"
            onClick={() => setAddFilterCategory(cat)}
            className={cn(
             "rounded-md px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide transition-colors",
             addFilterCategory === cat
              ? "bg-foreground/[0.08] text-foreground font-medium"
              : "text-muted-foreground/35 hover:text-foreground/60",
            )}
           >
            {cat}
           </button>
          ))}
         </div>
         <div className="grid grid-cols-2 gap-1.5">
          {filteredAvailable.map((f, i) => (
           <button
            key={i}
            type="button"
            onClick={() => handleAddFilter(f)}
            className="flex items-center justify-between rounded-md px-3 py-2 text-xs text-muted-foreground/50 transition-colors hover:bg-foreground/[0.03] hover:text-foreground"
           >
            <span>{f.label}</span>
            <span className="font-mono text-[10px] text-muted-foreground/25">
             {f.operator === "between" ? `${f.value}–${f.value2}` : `${f.operator}${f.value}`}
            </span>
           </button>
          ))}
         </div>
        </div>
       )}
      </div>
     </div>
    </TabsContent>

    {/* ═══ Tab 2: Results ════════════════════════════════════════════════ */}
    <TabsContent value="results" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
     <div className="flex h-full">
      {/* Table */}
      <div className="flex-1 overflow-auto">
       <table className="w-full min-w-[1000px]">
        <thead className="border-b border-border/40 sticky top-0 bg-background z-10">
         <tr>
          {([
           { label: "#", field: "rank" },
           { label: "Ticker", field: "ticker" },
           { label: "Company", field: "company" },
           { label: "Sector", field: "sector" },
           { label: "Score", field: "score" },
           { label: "P/E", field: "peRatio" },
           { label: "Fwd P/E", field: "forwardPE" },
           { label: "Rev Grw", field: "revenueGrowth" },
           { label: "Margin", field: "netMargin" },
           { label: "RSI", field: "rsi" },
           { label: "Price", field: "price" },
           { label: "1M Ret", field: "return1M" },
           { label: "Mkt Cap", field: "marketCapB" },
           { label: "Yield", field: "dividendYield" },
          ] as { label: string; field: SortField }[]).map(({ label, field }) => (
           <th
            key={field}
            onClick={() => handleSort(field)}
            className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground/30 hover:text-muted-foreground/60 select-none first:pl-6"
           >
            <span className="flex items-center gap-1">
             {label}
             <SortIcon field={field} />
            </span>
           </th>
          ))}
         </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
         {filteredStocks.map((s) => (
          <tr
           key={s.ticker}
           onClick={() => setSelectedStock(selectedStock?.ticker === s.ticker ? null : s)}
           className={cn(
            "cursor-pointer transition-colors hover:bg-foreground/[0.02]",
            selectedStock?.ticker === s.ticker && "bg-foreground/[0.04]",
           )}
          >
           <td className="px-3 py-2.5 pl-6 font-mono tabular-nums text-xs text-muted-foreground/25">{s.rank}</td>
           <td className="px-3 py-2.5 font-mono font-semibold text-xs">{s.ticker}</td>
           <td className="px-3 py-2.5 max-w-[110px] truncate text-xs text-muted-foreground/50">{s.company}</td>
           <td className="px-3 py-2.5 text-xs text-muted-foreground/30">{s.sector.split(" ")[0]}</td>
           <td className="px-3 py-2.5">
            <span className={cn("font-mono text-xs font-semibold tabular-nums", scoreColor(s.score))}>{s.score}</span>
           </td>
           <td className="px-3 py-2.5">
            <span className={cn("font-mono tabular-nums text-xs", s.peRatio < 15 ? "text-emerald-400/70" : s.peRatio > 35 ? "text-rose-400/60" : "text-muted-foreground/40")}>
             {s.peRatio}x
            </span>
           </td>
           <td className="px-3 py-2.5">
            <span className={cn("font-mono tabular-nums text-xs", s.forwardPE < 18 ? "text-emerald-400/70" : s.forwardPE > 30 ? "text-rose-400/60" : "text-muted-foreground/40")}>
             {s.forwardPE}x
            </span>
           </td>
           <td className="px-3 py-2.5">
            <span className={cn("font-mono tabular-nums text-xs", s.revenueGrowth > 15 ? "text-emerald-400/70" : s.revenueGrowth < 0 ? "text-rose-400/60" : "text-muted-foreground/40")}>
             {s.revenueGrowth > 0 ? "+" : ""}{s.revenueGrowth}%
            </span>
           </td>
           <td className="px-3 py-2.5">
            <span className={cn("font-mono tabular-nums text-xs", s.netMargin > 10 ? "text-emerald-400/70" : s.netMargin < 0 ? "text-rose-400/60" : "text-muted-foreground/40")}>
             {s.netMargin}%
            </span>
           </td>
           <td className="px-3 py-2.5">
            <span className={cn("font-mono tabular-nums text-xs", rsiColor(s.rsi))}>{s.rsi}</span>
           </td>
           <td className="px-3 py-2.5 font-mono tabular-nums text-xs">${s.price.toFixed(2)}</td>
           <td className="px-3 py-2.5">
            <span className={cn("font-mono tabular-nums text-xs", returnColor(s.return1M))}>
             {s.return1M > 0 ? "+" : ""}{s.return1M}%
            </span>
           </td>
           <td className="px-3 py-2.5 font-mono tabular-nums text-xs text-muted-foreground/40">{formatMarketCap(s.marketCapB)}</td>
           <td className="px-3 py-2.5">
            <span className={cn("font-mono tabular-nums text-xs", s.dividendYield > 0 ? "text-emerald-400/60" : "text-muted-foreground/20")}>
             {s.dividendYield > 0 ? `${s.dividendYield}%` : "—"}
            </span>
           </td>
          </tr>
         ))}
         {filteredStocks.length === 0 && (
          <tr>
           <td colSpan={14} className="px-6 py-16 text-center text-sm text-muted-foreground/30">
            No stocks match your filters.
           </td>
          </tr>
         )}
        </tbody>
       </table>
      </div>

      {/* Detail panel */}
      {selectedStock && (
       <div className="w-64 shrink-0 border-l border-border/30 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex items-start justify-between">
         <div>
          <p className="font-mono font-bold text-base">{selectedStock.ticker}</p>
          <p className="text-[11px] text-muted-foreground/40">{selectedStock.company}</p>
         </div>
         <button type="button" onClick={() => setSelectedStock(null)} className="rounded p-1 hover:bg-foreground/[0.05]">
          <X className="h-3.5 w-3.5 text-muted-foreground/30" />
         </button>
        </div>

        {/* Price + sparkline */}
        <div className="flex items-center justify-between">
         <div>
          <p className="text-lg font-medium tabular-nums">${selectedStock.price.toFixed(2)}</p>
          <p className={cn("text-[11px] font-mono tabular-nums", returnColor(selectedStock.return1M))}>
           {selectedStock.return1M > 0 ? "+" : ""}{selectedStock.return1M}% 1M
          </p>
         </div>
         <Sparkline ticker={selectedStock.ticker} positive={selectedStock.return1M >= 0} />
        </div>

        {/* Score bar */}
        <div className="border-t border-border/20 pt-3">
         <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/25">Score</span>
          <span className={cn("text-sm font-bold tabular-nums", scoreColor(selectedStock.score))}>{selectedStock.score}</span>
         </div>
         <div className="h-1 rounded-full bg-foreground/[0.04] overflow-hidden">
          <div
           className={cn("h-full rounded-full transition-all", selectedStock.score >= 70 ? "bg-emerald-400/60" : selectedStock.score >= 45 ? "bg-amber-400/60" : "bg-red-400/60")}
           style={{ width: `${selectedStock.score}%` }}
          />
         </div>
        </div>

        {/* Key metrics — clean divide-y list */}
        <div className="divide-y divide-border/15">
         {[
          { label: "Sector", value: selectedStock.sector.split(" ")[0] },
          { label: "Mkt Cap", value: `${formatMarketCap(selectedStock.marketCapB)} ${marketCapLabel(selectedStock.marketCapB)}` },
          { label: "P/E", value: `${selectedStock.peRatio}x` },
          { label: "Fwd P/E", value: `${selectedStock.forwardPE}x` },
          { label: "P/B", value: `${selectedStock.pbRatio}x` },
          { label: "EV/EBITDA", value: `${selectedStock.evEbitda}x` },
          { label: "Rev Growth", value: `${selectedStock.revenueGrowth > 0 ? "+" : ""}${selectedStock.revenueGrowth}%` },
          { label: "Net Margin", value: `${selectedStock.netMargin}%` },
          { label: "ROE", value: `${selectedStock.roe}%` },
          { label: "D/E", value: selectedStock.debtEquity.toFixed(2) },
          { label: "RSI", value: `${selectedStock.rsi}` },
          { label: "Analyst", value: selectedStock.analystRating },
          { label: "Insider", value: selectedStock.insiderTrend },
          { label: "Dividend", value: selectedStock.dividendYield > 0 ? `${selectedStock.dividendYield}%` : "None" },
         ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-1.5">
           <span className="text-[11px] text-muted-foreground/30">{label}</span>
           <span className="text-[11px] font-mono tabular-nums text-muted-foreground/60">{value}</span>
          </div>
         ))}
        </div>

        <button
         type="button"
         className="w-full flex items-center justify-center gap-1.5 rounded-md border border-border/40 py-2 text-[11px] text-muted-foreground/40 hover:text-foreground hover:border-foreground/20 transition-colors"
        >
         <Star className="h-3 w-3" />
         Add to Watchlist
        </button>
       </div>
      )}
     </div>
    </TabsContent>

    {/* ═══ Tab 3: Picks ═════════════════════════════════════════════════ */}
    <TabsContent value="picks" className="flex-1 overflow-y-auto px-6 py-5 data-[state=inactive]:hidden">
     <div className="max-w-4xl space-y-10">

      {/* Top Picks */}
      <section>
       <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25 mb-4">Today&apos;s Top Picks</p>
       <div className="divide-y divide-border/20">
        {TOP_PICKS.map((pick) => (
         <div key={pick.ticker} className="py-5 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between mb-3">
           <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-base">{pick.ticker}</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/25">{pick.category}</span>
           </div>
           <div className="text-right">
            <p className="font-mono text-sm tabular-nums">${pick.price.toFixed(2)}</p>
            <p className={cn("text-[11px] font-mono tabular-nums", returnColor(pick.return1M))}>
             {pick.return1M > 0 ? "+" : ""}{pick.return1M}%
            </p>
           </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
           <span className="text-[11px] text-muted-foreground/40">{pick.company}</span>
           <span className="text-[11px] text-muted-foreground/20">{pick.sector}</span>
           <span className="ml-auto flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground/25">CONFIDENCE</span>
            <span className="text-xs font-mono font-medium text-emerald-400/70">{pick.confidence}%</span>
           </span>
           <span className={cn("text-xs font-mono font-semibold tabular-nums", scoreColor(pick.score))}>{pick.score}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
           <div className="border-l-2 border-foreground/8 pl-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/20 mb-1">Thesis</p>
            <p className="text-xs text-muted-foreground/50 leading-relaxed">{pick.rationale}</p>
           </div>
           <div className="border-l-2 border-rose-500/15 pl-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-rose-400/30 mb-1">Risks</p>
            <p className="text-xs text-muted-foreground/40 leading-relaxed">{pick.riskFactors}</p>
           </div>
          </div>
         </div>
        ))}
       </div>
      </section>

      {/* Sector Leaders */}
      <section>
       <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25 mb-4">Sector Leaders</p>
       <div className="divide-y divide-border/15">
        {sectorLeaders.map((s) => (
         <div key={s.ticker} className="flex items-center py-2.5 gap-4">
          <span className="text-xs text-muted-foreground/25 w-28 shrink-0 truncate">{s.sector}</span>
          <span className="font-mono font-medium text-xs w-14">{s.ticker}</span>
          <span className="text-xs text-muted-foreground/30 flex-1 truncate">{s.company}</span>
          <span className={cn("font-mono text-xs font-semibold tabular-nums w-8 text-right", scoreColor(s.score))}>{s.score}</span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground/40 w-16 text-right">${s.price.toFixed(0)}</span>
          <span className={cn("font-mono text-xs tabular-nums w-14 text-right", returnColor(s.return1M))}>
           {s.return1M > 0 ? "+" : ""}{s.return1M}%
          </span>
         </div>
        ))}
       </div>
      </section>

      {/* Hidden Gems + Contrarian in two columns */}
      <div className="grid grid-cols-2 gap-8">
       <section>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25 mb-4">Hidden Gems</p>
        <p className="text-[11px] text-muted-foreground/20 -mt-3 mb-4">Small/Mid-cap, strong fundamentals</p>
        <div className="divide-y divide-border/15">
         {hiddenGems.map((s) => (
          <div key={s.ticker} className="flex items-center justify-between py-2">
           <div>
            <span className="font-mono font-medium text-xs">{s.ticker}</span>
            <span className="text-[11px] text-muted-foreground/25 ml-2">{marketCapLabel(s.marketCapB)}</span>
           </div>
           <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground/30 tabular-nums">{formatMarketCap(s.marketCapB)}</span>
            <span className={cn("font-mono text-xs font-semibold tabular-nums", scoreColor(s.score))}>{s.score}</span>
           </div>
          </div>
         ))}
        </div>
       </section>

       <section>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25 mb-4">Contrarian</p>
        <p className="text-[11px] text-muted-foreground/20 -mt-3 mb-4">Insider accumulation, bearish sentiment</p>
        <div className="divide-y divide-border/15">
         {contrarian.map((s) => (
          <div key={s.ticker} className="flex items-center justify-between py-2">
           <div>
            <span className="font-mono font-medium text-xs">{s.ticker}</span>
            <span className="text-[11px] text-amber-400/30 ml-2">insider +</span>
           </div>
           <div className="flex items-center gap-3">
            <span className={cn("font-mono text-xs tabular-nums", returnColor(s.return1M))}>{s.return1M}%</span>
            <span className={cn("font-mono text-xs font-semibold tabular-nums", scoreColor(s.score))}>{s.score}</span>
           </div>
          </div>
         ))}
        </div>
       </section>
      </div>
     </div>
    </TabsContent>

    {/* ═══ Tab 4: Saved Screens ══════════════════════════════════════════ */}
    <TabsContent value="saved" className="flex-1 overflow-y-auto px-6 py-5 data-[state=inactive]:hidden">
     <div className="max-w-4xl space-y-10">

      {/* Your saved screens */}
      <section>
       <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25 mb-4">Your Screens</p>
       {savedScreens.length === 0 ? (
        <p className="text-xs text-muted-foreground/30 italic py-6">No saved screens yet.</p>
       ) : (
        <div className="divide-y divide-border/20">
         {savedScreens.map((screen) => (
          <div key={screen.id} className="flex items-center py-3.5 gap-4">
           <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{screen.name}</p>
            <div className="flex items-center gap-2 mt-1">
             {screen.criteria.slice(0, 3).map((c) => (
              <span key={c.id} className="text-[10px] font-mono text-muted-foreground/25">{c.label}</span>
             ))}
             {screen.criteria.length > 3 && (
              <span className="text-[10px] font-mono text-muted-foreground/15">+{screen.criteria.length - 3}</span>
             )}
            </div>
           </div>
           <span className="text-xs font-mono tabular-nums text-muted-foreground/30">{screen.resultCount} results</span>
           <span className="text-[11px] text-muted-foreground/20">{screen.lastRun}</span>
           <button
            type="button"
            onClick={() => handleLoadSaved(screen)}
            className="flex items-center gap-1 rounded-md text-xs text-muted-foreground/40 hover:text-foreground px-2 py-1 transition-colors"
           >
            <RefreshCw className="h-3 w-3" />
            Run
           </button>
           <button
            type="button"
            onClick={() => setSavedScreens((prev) => prev.filter((s) => s.id !== screen.id))}
            className="rounded p-1 text-muted-foreground/20 hover:text-rose-400 transition-colors"
           >
            <X className="h-3 w-3" />
           </button>
          </div>
         ))}
        </div>
       )}
      </section>

      {/* Compare */}
      <section>
       <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25 mb-4">Compare Screens</p>
       <div className="space-y-4">
        <div className="flex items-center gap-3">
         <select
          value={compareA}
          onChange={(e) => setCompareA(e.target.value)}
          className="flex-1 rounded-md border border-border/30 bg-transparent px-3 py-1.5 text-xs text-foreground/60 focus:outline-none focus:border-foreground/20"
         >
          <option value="">Screen A</option>
          {savedScreens.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
         </select>
         <span className="text-[10px] font-mono text-muted-foreground/20">vs</span>
         <select
          value={compareB}
          onChange={(e) => setCompareB(e.target.value)}
          className="flex-1 rounded-md border border-border/30 bg-transparent px-3 py-1.5 text-xs text-foreground/60 focus:outline-none focus:border-foreground/20"
         >
          <option value="">Screen B</option>
          {savedScreens.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
         </select>
         <button
          type="button"
          onClick={() => setShowCompare(true)}
          disabled={!compareA || !compareB || compareA === compareB}
          className="rounded-md bg-foreground text-background text-xs font-medium px-3 py-1.5 disabled:opacity-20 hover:bg-foreground/90 transition-colors"
         >
          Compare
         </button>
        </div>

        {showCompare && compareResults && (
         <div className="flex items-start gap-6 pt-2">
          <VennDiagram overlapCount={compareResults.overlap.length} aOnly={compareResults.onlyA.length} bOnly={compareResults.onlyB.length} />
          <div className="space-y-3 text-xs">
           <div>
            <p className="text-muted-foreground/50 font-medium">{compareResults.sA.name}</p>
            <p className="text-muted-foreground/25">{compareResults.onlyA.length} unique</p>
           </div>
           <div>
            <p className="font-medium">{compareResults.overlap.length} overlap</p>
           </div>
           <div>
            <p className="text-muted-foreground/50 font-medium">{compareResults.sB.name}</p>
            <p className="text-muted-foreground/25">{compareResults.onlyB.length} unique</p>
           </div>
           {compareResults.overlap.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
             {compareResults.overlap.map((t) => (
              <span key={t} className="font-mono text-[11px] text-muted-foreground/40">{t}</span>
             ))}
            </div>
           )}
          </div>
         </div>
        )}
       </div>
      </section>

      {/* Historical backtest */}
      <section>
       <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25 mb-4">Hypothetical Backtest</p>
       <div className="divide-y divide-border/15">
        {savedScreens.map((screen) => {
         const rng2 = mulberry32(screen.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
         const ret = ((rng2() - 0.35) * 30).toFixed(1);
         const isPos = parseFloat(ret) >= 0;
         return (
          <div key={screen.id} className="flex items-center justify-between py-3">
           <div>
            <p className="text-sm font-medium">{screen.name}</p>
            <p className="text-[11px] text-muted-foreground/20">Top 5 from last run</p>
           </div>
           <div className="flex items-center gap-2">
            <span className={cn("text-xl font-bold tabular-nums font-mono", isPos ? "text-emerald-400" : "text-rose-400")}>
             {isPos ? "+" : ""}{ret}%
            </span>
            {isPos ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400/50" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-400/50" />}
           </div>
          </div>
         );
        })}
       </div>
      </section>

      {/* Community */}
      <section>
       <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25 mb-4">Community Screens</p>
       <div className="divide-y divide-border/15">
        {COMMUNITY_SCREENS.map((cs) => (
         <div key={cs.name} className="flex items-center py-3 gap-4">
          <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2">
            <p className="text-xs font-medium">{cs.name}</p>
            <span className="text-[10px] text-muted-foreground/20">by {cs.author}</span>
           </div>
           <p className="text-[11px] text-muted-foreground/25 truncate mt-0.5">{cs.description}</p>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-muted-foreground/20 shrink-0">{cs.runs.toLocaleString()} runs</span>
          <button
           type="button"
           className="shrink-0 rounded-md text-xs text-muted-foreground/30 hover:text-foreground px-2 py-1 transition-colors"
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

   {/* ── Save dialog ───────────────────────────────────────────────────── */}
   {saveDialogOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
     <div className="rounded-xl border border-border/40 bg-card p-5 w-80 space-y-4">
      <div className="flex items-center justify-between">
       <h3 className="text-sm font-medium">Save Screen</h3>
       <button type="button" onClick={() => setSaveDialogOpen(false)} className="rounded p-1 hover:bg-foreground/[0.05]">
        <X className="h-3.5 w-3.5 text-muted-foreground/30" />
       </button>
      </div>
      <div>
       <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/25 mb-1.5 block">Name</label>
       <input
        type="text"
        value={saveName}
        onChange={(e) => setSaveName(e.target.value)}
        placeholder="e.g. Quality Compounders"
        className="w-full rounded-md border border-border/30 bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-foreground/20"
        onKeyDown={(e) => e.key === "Enter" && handleSaveScreen()}
        autoFocus
       />
      </div>
      <p className="text-[11px] text-muted-foreground/25 font-mono">
       {criteria.length} filter{criteria.length !== 1 ? "s" : ""} · {filteredStocks.length} results
      </p>
      <div className="flex gap-2">
       <button
        type="button"
        onClick={() => setSaveDialogOpen(false)}
        className="flex-1 rounded-md border border-border/30 py-2 text-xs text-muted-foreground/40 hover:text-foreground transition-colors"
       >
        Cancel
       </button>
       <button
        type="button"
        onClick={handleSaveScreen}
        disabled={!saveName.trim()}
        className="flex-1 rounded-md bg-foreground text-background py-2 text-xs font-medium disabled:opacity-20 hover:bg-foreground/90 transition-colors"
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
