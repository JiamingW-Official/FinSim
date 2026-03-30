"use client";

import { useState, useMemo, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Percent,
  Info,
  Calendar,
  RefreshCw,
  Layers,
  Building2,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 47;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed: number = 47) {
  s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface DividendStock {
  ticker: string;
  name: string;
  sector: string;
  yield: number;
  growthRate5yr: number;
  payoutRatio: number;
  consecutiveYears: number;
  safetyScore: number;
  price: number;
  annualDiv: number;
  isAristocrat: boolean;
  yieldType: "high-yield" | "dividend-growth" | "aristocrat";
  fcfCoverage: number;
  debtEbitda: number;
}

interface BondLeg {
  maturity: number;
  rate: number;
  allocation: number;
  value: number;
}

interface IncomeSource {
  label: string;
  yield: number;
  rateRisk: "low" | "medium" | "high";
  taxEfficiency: "high" | "medium" | "low";
  allocation: number;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const DIVIDEND_STOCKS: DividendStock[] = [
  {
    ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare",
    yield: 3.1, growthRate5yr: 5.8, payoutRatio: 44, consecutiveYears: 61,
    safetyScore: 94, price: 162.4, annualDiv: 5.04, isAristocrat: true,
    yieldType: "aristocrat", fcfCoverage: 2.8, debtEbitda: 1.2,
  },
  {
    ticker: "PG", name: "Procter & Gamble", sector: "Consumer Staples",
    yield: 2.5, growthRate5yr: 5.2, payoutRatio: 59, consecutiveYears: 67,
    safetyScore: 91, price: 156.8, annualDiv: 3.92, isAristocrat: true,
    yieldType: "aristocrat", fcfCoverage: 2.1, debtEbitda: 1.8,
  },
  {
    ticker: "KO", name: "Coca-Cola", sector: "Consumer Staples",
    yield: 3.2, growthRate5yr: 4.1, payoutRatio: 73, consecutiveYears: 62,
    safetyScore: 88, price: 62.5, annualDiv: 1.94, isAristocrat: true,
    yieldType: "aristocrat", fcfCoverage: 1.6, debtEbitda: 2.4,
  },
  {
    ticker: "MCD", name: "McDonald's Corp", sector: "Consumer Disc.",
    yield: 2.4, growthRate5yr: 8.6, payoutRatio: 52, consecutiveYears: 48,
    safetyScore: 85, price: 298.3, annualDiv: 7.08, isAristocrat: true,
    yieldType: "aristocrat", fcfCoverage: 2.3, debtEbitda: 3.1,
  },
  {
    ticker: "T", name: "AT&T Inc.", sector: "Telecom",
    yield: 6.8, growthRate5yr: 1.2, payoutRatio: 68, consecutiveYears: 4,
    safetyScore: 52, price: 18.4, annualDiv: 1.11, isAristocrat: false,
    yieldType: "high-yield", fcfCoverage: 1.4, debtEbitda: 3.8,
  },
  {
    ticker: "VZ", name: "Verizon Comm.", sector: "Telecom",
    yield: 7.1, growthRate5yr: 1.8, payoutRatio: 72, consecutiveYears: 17,
    safetyScore: 55, price: 40.2, annualDiv: 2.66, isAristocrat: false,
    yieldType: "high-yield", fcfCoverage: 1.3, debtEbitda: 3.5,
  },
  {
    ticker: "O", name: "Realty Income", sector: "REIT",
    yield: 5.8, growthRate5yr: 4.4, payoutRatio: 78, consecutiveYears: 29,
    safetyScore: 78, price: 54.1, annualDiv: 3.09, isAristocrat: false,
    yieldType: "high-yield", fcfCoverage: 1.7, debtEbitda: 5.2,
  },
  {
    ticker: "WPC", name: "W. P. Carey Inc.", sector: "REIT",
    yield: 6.1, growthRate5yr: 3.2, payoutRatio: 82, consecutiveYears: 25,
    safetyScore: 72, price: 62.8, annualDiv: 3.42, isAristocrat: false,
    yieldType: "high-yield", fcfCoverage: 1.5, debtEbitda: 5.8,
  },
  {
    ticker: "D", name: "Dominion Energy", sector: "Utilities",
    yield: 5.2, growthRate5yr: 2.1, payoutRatio: 90, consecutiveYears: 19,
    safetyScore: 60, price: 46.3, annualDiv: 2.67, isAristocrat: false,
    yieldType: "high-yield", fcfCoverage: 1.1, debtEbitda: 4.9,
  },
  {
    ticker: "NEE", name: "NextEra Energy", sector: "Utilities",
    yield: 3.1, growthRate5yr: 12.4, payoutRatio: 58, consecutiveYears: 29,
    safetyScore: 82, price: 74.6, annualDiv: 2.06, isAristocrat: false,
    yieldType: "dividend-growth", fcfCoverage: 1.8, debtEbitda: 3.2,
  },
  {
    ticker: "JPM", name: "JPMorgan Chase", sector: "Financials",
    yield: 2.3, growthRate5yr: 10.2, payoutRatio: 28, consecutiveYears: 13,
    safetyScore: 88, price: 198.4, annualDiv: 4.60, isAristocrat: false,
    yieldType: "dividend-growth", fcfCoverage: 4.1, debtEbitda: 1.4,
  },
  {
    ticker: "BAC", name: "Bank of America", sector: "Financials",
    yield: 2.7, growthRate5yr: 9.4, payoutRatio: 30, consecutiveYears: 11,
    safetyScore: 82, price: 38.1, annualDiv: 0.96, isAristocrat: false,
    yieldType: "dividend-growth", fcfCoverage: 3.6, debtEbitda: 1.6,
  },
  {
    ticker: "XOM", name: "ExxonMobil", sector: "Energy",
    yield: 3.6, growthRate5yr: 3.8, payoutRatio: 48, consecutiveYears: 41,
    safetyScore: 80, price: 110.2, annualDiv: 3.80, isAristocrat: true,
    yieldType: "aristocrat", fcfCoverage: 2.4, debtEbitda: 0.9,
  },
  {
    ticker: "CVX", name: "Chevron Corp", sector: "Energy",
    yield: 4.0, growthRate5yr: 7.2, payoutRatio: 52, consecutiveYears: 36,
    safetyScore: 83, price: 155.4, annualDiv: 6.04, isAristocrat: true,
    yieldType: "aristocrat", fcfCoverage: 2.6, debtEbitda: 0.8,
  },
  {
    ticker: "PFE", name: "Pfizer Inc.", sector: "Healthcare",
    yield: 6.4, growthRate5yr: 1.9, payoutRatio: 68, consecutiveYears: 14,
    safetyScore: 58, price: 27.8, annualDiv: 1.68, isAristocrat: false,
    yieldType: "high-yield", fcfCoverage: 1.3, debtEbitda: 3.4,
  },
  {
    ticker: "ABBV", name: "AbbVie Inc.", sector: "Healthcare",
    yield: 4.1, growthRate5yr: 8.9, payoutRatio: 55, consecutiveYears: 12,
    safetyScore: 81, price: 168.2, annualDiv: 6.20, isAristocrat: false,
    yieldType: "dividend-growth", fcfCoverage: 2.2, debtEbitda: 2.8,
  },
  {
    ticker: "MSFT", name: "Microsoft Corp", sector: "Technology",
    yield: 0.8, growthRate5yr: 10.8, payoutRatio: 25, consecutiveYears: 21,
    safetyScore: 96, price: 419.3, annualDiv: 3.00, isAristocrat: false,
    yieldType: "dividend-growth", fcfCoverage: 6.8, debtEbitda: 0.6,
  },
  {
    ticker: "AAPL", name: "Apple Inc.", sector: "Technology",
    yield: 0.5, growthRate5yr: 6.2, payoutRatio: 15, consecutiveYears: 12,
    safetyScore: 95, price: 213.8, annualDiv: 1.00, isAristocrat: false,
    yieldType: "dividend-growth", fcfCoverage: 8.2, debtEbitda: 0.4,
  },
  {
    ticker: "V", name: "Visa Inc.", sector: "Financials",
    yield: 0.7, growthRate5yr: 14.2, payoutRatio: 21, consecutiveYears: 15,
    safetyScore: 93, price: 296.4, annualDiv: 2.08, isAristocrat: false,
    yieldType: "dividend-growth", fcfCoverage: 5.9, debtEbitda: 0.5,
  },
  {
    ticker: "HD", name: "Home Depot", sector: "Consumer Disc.",
    yield: 2.7, growthRate5yr: 10.4, payoutRatio: 54, consecutiveYears: 14,
    safetyScore: 87, price: 348.9, annualDiv: 9.00, isAristocrat: false,
    yieldType: "dividend-growth", fcfCoverage: 2.8, debtEbitda: 2.1,
  },
];

const SECTOR_COLORS: Record<string, string> = {
  "Healthcare": "#22c55e",
  "Consumer Staples": "#3b82f6",
  "Consumer Disc.": "#f59e0b",
  "Telecom": "#ef4444",
  "REIT": "#8b5cf6",
  "Utilities": "#06b6d4",
  "Financials": "#f97316",
  "Energy": "#eab308",
  "Technology": "#a855f7",
};

const CD_RATES = [
  { term: "3-Month", rate: 5.20, apy: 5.27 },
  { term: "6-Month", rate: 5.25, apy: 5.39 },
  { term: "1-Year", rate: 5.15, apy: 5.28 },
  { term: "2-Year", rate: 4.80, apy: 4.92 },
  { term: "5-Year", rate: 4.40, apy: 4.50 },
];

const TREASURY_RATES = [
  { name: "4-Week T-Bill", yield: 5.28, type: "bill" },
  { name: "3-Month T-Bill", yield: 5.25, type: "bill" },
  { name: "6-Month T-Bill", yield: 5.18, type: "bill" },
  { name: "1-Year T-Note", yield: 5.02, type: "note" },
  { name: "2-Year T-Note", yield: 4.72, type: "note" },
  { name: "5-Year T-Note", yield: 4.48, type: "note" },
  { name: "10-Year T-Bond", yield: 4.35, type: "bond" },
  { name: "20-Year T-Bond", yield: 4.58, type: "bond" },
  { name: "30-Year T-Bond", yield: 4.51, type: "bond" },
];

const ALT_INCOME = [
  { name: "mREIT (AGNC)", type: "mREIT", yield: 14.2, risk: "Very High", rateRisk: "Very High", desc: "Mortgage-backed securities, leveraged" },
  { name: "eREIT (VNQ)", type: "eREIT", yield: 5.1, risk: "Medium", rateRisk: "Medium", desc: "Equity real estate, inflation hedge" },
  { name: "BDC (ARCC)", type: "BDC", yield: 9.8, risk: "High", rateRisk: "Low", desc: "Floating rate loans, small/mid businesses" },
  { name: "BDC (FS KKR)", type: "BDC", yield: 12.4, risk: "Very High", rateRisk: "Low", desc: "Private credit, higher yield/risk" },
  { name: "Preferred Stock", type: "Preferred", yield: 6.8, risk: "Medium", rateRisk: "High", desc: "Fixed dividend, priority over common" },
  { name: "Covered Calls (1%/mo)", type: "Options", yield: 12.0, risk: "Low", rateRisk: "None", desc: "1-3% monthly premium on held stock" },
  { name: "Cash-Secured Puts", type: "Options", yield: 8.4, risk: "Low", rateRisk: "None", desc: "Earn premium waiting to buy cheaper" },
  { name: "CEF (PDI)", type: "CEF", yield: 13.8, risk: "High", rateRisk: "Medium", desc: "Trades at discount to NAV, levered" },
];

const INCOME_SOURCES: IncomeSource[] = [
  { label: "Dividend Stocks", yield: 3.2, rateRisk: "low", taxEfficiency: "high", allocation: 35 },
  { label: "Bonds / Treasuries", yield: 4.5, rateRisk: "high", taxEfficiency: "medium", allocation: 25 },
  { label: "REITs", yield: 5.6, rateRisk: "medium", taxEfficiency: "low", allocation: 15 },
  { label: "Preferred Stocks", yield: 6.8, rateRisk: "high", taxEfficiency: "medium", allocation: 10 },
  { label: "Options Income", yield: 10.2, rateRisk: "low", taxEfficiency: "low", allocation: 8 },
  { label: "BDCs", yield: 10.8, rateRisk: "low", taxEfficiency: "low", allocation: 7 },
];

// ── Utility helpers ────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function safetyColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

function safetyLabel(score: number): string {
  if (score >= 80) return "Safe";
  if (score >= 60) return "Moderate";
  return "Risky";
}

// ── Tab 1: Dividend Universe ───────────────────────────────────────────────────

function AristocratBadge() {
  return (
    <svg width="58" height="18" viewBox="0 0 58 18" className="inline-block ml-1">
      <rect x="0" y="0" width="58" height="18" rx="4" fill="#854d0e" />
      <polygon points="8,14 12,7 16,14" fill="#fbbf24" />
      <text x="20" y="13" fontSize="8" fill="#fef3c7" fontWeight="700">ARISTOCRAT</text>
    </svg>
  );
}

type YieldFilter = "all" | "high-yield" | "dividend-growth" | "aristocrat";
type SectorFilter = "all" | string;

function DividendUniverseTab() {
  const [yieldFilter, setYieldFilter] = useState<YieldFilter>("all");
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>("all");
  const [minYield, setMinYield] = useState(0);
  const [selectedStock, setSelectedStock] = useState<DividendStock | null>(null);

  const sectors = useMemo(() => {
    const s = new Set(DIVIDEND_STOCKS.map((d) => d.sector));
    return ["all", ...Array.from(s)];
  }, []);

  const filtered = useMemo(() => {
    return DIVIDEND_STOCKS.filter((d) => {
      if (yieldFilter !== "all" && d.yieldType !== yieldFilter) return false;
      if (sectorFilter !== "all" && d.sector !== sectorFilter) return false;
      if (d.yield < minYield) return false;
      return true;
    });
  }, [yieldFilter, sectorFilter, minYield]);

  const yieldOnCostIn10 = useCallback((stock: DividendStock) => {
    return stock.yield * Math.pow(1 + stock.growthRate5yr / 100, 10);
  }, []);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            {(["all", "high-yield", "dividend-growth", "aristocrat"] as YieldFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setYieldFilter(f)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs text-muted-foreground font-medium transition-all",
                  yieldFilter === f
                    ? "bg-primary text-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted"
                )}
              >
                {f === "all" ? "All" : f === "high-yield" ? "High Yield" : f === "dividend-growth" ? "Div. Growth" : "Aristocrats"}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSectorFilter(sec)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs text-muted-foreground font-medium transition-all",
                  sectorFilter === sec
                    ? "bg-primary text-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted"
                )}
              >
                {sec === "all" ? "All Sectors" : sec}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">Min Yield: {minYield.toFixed(1)}%</span>
            <div className="w-28">
              <Slider
                min={0} max={8} step={0.5}
                value={[minYield]}
                onValueChange={([v]) => setMinYield(v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-3 py-3 text-muted-foreground font-medium">Ticker</th>
                <th className="text-left px-3 py-3 text-muted-foreground font-medium">Sector</th>
                <th className="text-right px-3 py-3 text-muted-foreground font-medium">Yield</th>
                <th className="text-right px-3 py-3 text-muted-foreground font-medium">5yr DGR</th>
                <th className="text-right px-3 py-3 text-muted-foreground font-medium">Payout %</th>
                <th className="text-right px-3 py-3 text-muted-foreground font-medium">Consec. Yrs</th>
                <th className="text-right px-3 py-3 text-muted-foreground font-medium">Safety</th>
                <th className="text-right px-3 py-3 text-muted-foreground font-medium">YoC (10yr)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.ticker}
                  onClick={() => setSelectedStock(selectedStock?.ticker === d.ticker ? null : d)}
                  className={cn(
                    "border-b border-border cursor-pointer transition-colors",
                    selectedStock?.ticker === d.ticker ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-foreground">{d.ticker}</span>
                      {d.isAristocrat && <AristocratBadge />}
                    </div>
                    <div className="text-muted-foreground text-xs">{d.name}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs text-muted-foreground"
                      style={{ backgroundColor: `${SECTOR_COLORS[d.sector]}22`, color: SECTOR_COLORS[d.sector] }}
                    >
                      {d.sector}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    <span className={d.yield >= 5 ? "text-yellow-400" : d.yield >= 3 ? "text-green-400" : "text-muted-foreground"}>
                      {d.yield.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    <span className={d.growthRate5yr >= 8 ? "text-green-400" : "text-muted-foreground"}>
                      {d.growthRate5yr.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    <span className={d.payoutRatio > 70 ? "text-yellow-400" : "text-muted-foreground"}>
                      {d.payoutRatio}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">{d.consecutiveYears}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={cn("font-semibold", safetyColor(d.safetyScore))}>
                      {d.safetyScore} — {safetyLabel(d.safetyScore)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-green-400">
                    {yieldOnCostIn10(d).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedStock && (
          <motion.div
            key={selectedStock.ticker}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="bg-card border border-border rounded-md p-5"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {selectedStock.ticker}
                  {selectedStock.isAristocrat && <AristocratBadge />}
                </h3>
                <p className="text-muted-foreground text-sm">{selectedStock.name}</p>
              </div>
              <button onClick={() => setSelectedStock(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Current Price", value: `$${selectedStock.price.toFixed(2)}` },
                { label: "Annual Dividend", value: `$${selectedStock.annualDiv.toFixed(2)}` },
                { label: "FCF Coverage", value: `${selectedStock.fcfCoverage.toFixed(1)}x`, good: selectedStock.fcfCoverage >= 1.5 },
                { label: "Debt/EBITDA", value: `${selectedStock.debtEbitda.toFixed(1)}x`, good: selectedStock.debtEbitda <= 2 },
                { label: "Yield on Cost (5yr)", value: `${(selectedStock.yield * Math.pow(1 + selectedStock.growthRate5yr / 100, 5)).toFixed(2)}%` },
                { label: "Yield on Cost (10yr)", value: `${(selectedStock.yield * Math.pow(1 + selectedStock.growthRate5yr / 100, 10)).toFixed(2)}%`, highlight: true },
                { label: "Yield on Cost (20yr)", value: `${(selectedStock.yield * Math.pow(1 + selectedStock.growthRate5yr / 100, 20)).toFixed(2)}%`, highlight: true },
                { label: "Consecutive Years", value: `${selectedStock.consecutiveYears} yrs` },
              ].map((item) => (
                <div key={item.label} className="bg-muted rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">{item.label}</div>
                  <div className={cn(
                    "font-medium text-sm",
                    item.highlight ? "text-green-400" :
                    "good" in item ? (item.good ? "text-green-400" : "text-red-400") : "text-foreground"
                  )}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tab 2: Dividend Analysis Tools ────────────────────────────────────────────

function DripSimulatorSVG({
  initial, monthly, years, yieldPct, growthRate
}: {
  initial: number; monthly: number; years: number; yieldPct: number; growthRate: number
}) {
  const W = 560, H = 200;
  const PAD = { t: 16, r: 16, b: 36, l: 60 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const points = useMemo(() => {
    const pts: { yr: number; noReinvest: number; drip: number; noGrowth: number }[] = [];
    let shares = initial / 100; // assume $100/share
    const sharePrice = 100;
    let dripValue = initial;
    const annualDiv = yieldPct / 100;
    const growthDecimal = growthRate / 100;
    for (let y = 0; y <= years; y++) {
      const noReinvest = initial + monthly * 12 * y;
      const noGrowth = initial * Math.pow(1 + (yieldPct / 100), y) + monthly * 12 * y;
      // DRIP: quarterly compounding with dividend growth
      if (y > 0) {
        for (let q = 0; q < 4; q++) {
          const qDiv = shares * sharePrice * (annualDiv * Math.pow(1 + growthDecimal, y)) / 4;
          shares += (qDiv + monthly * 3) / sharePrice;
          dripValue = shares * sharePrice;
        }
      }
      pts.push({ yr: y, noReinvest, drip: y === 0 ? initial : dripValue, noGrowth });
    }
    return pts;
  }, [initial, monthly, years, yieldPct, growthRate]);

  const maxVal = Math.max(...points.map((p) => p.drip));
  const minVal = 0;

  const toX = (yr: number) => PAD.l + (yr / years) * iW;
  const toY = (v: number) => PAD.t + iH - ((v - minVal) / (maxVal - minVal)) * iH;

  const dripPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.yr)} ${toY(p.drip)}`).join(" ");
  const noReinvestPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.yr)} ${toY(p.noReinvest)}`).join(" ");
  const noGrowthPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.yr)} ${toY(p.noGrowth)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => minVal + f * (maxVal - minVal));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} y1={toY(v)} x2={W - PAD.r} y2={toY(v)} stroke="#3f3f46" strokeDasharray="3,3" />
          <text x={PAD.l - 6} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#71717a">
            {v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toFixed(0)}`}
          </text>
        </g>
      ))}
      {[0, 5, 10, 15, 20].filter(y => y <= years).map((y) => (
        <text key={y} x={toX(y)} y={H - 6} textAnchor="middle" fontSize="9" fill="#71717a">{`Yr ${y}`}</text>
      ))}
      <path d={noReinvestPath} fill="none" stroke="#52525b" strokeWidth="1.5" />
      <path d={noGrowthPath} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5,3" />
      <path d={dripPath} fill="none" stroke="#22c55e" strokeWidth="2.5" />
      {/* Legend */}
      <rect x={PAD.l} y={PAD.t} width="8" height="8" fill="#22c55e" rx="1" />
      <text x={PAD.l + 12} y={PAD.t + 7} fontSize="9" fill="#a1a1aa">DRIP (div growth)</text>
      <rect x={PAD.l + 120} y={PAD.t} width="8" height="8" fill="#3b82f6" rx="1" />
      <text x={PAD.l + 132} y={PAD.t + 7} fontSize="9" fill="#a1a1aa">No DRIP (fixed yield)</text>
      <rect x={PAD.l + 260} y={PAD.t} width="8" height="8" fill="#52525b" rx="1" />
      <text x={PAD.l + 272} y={PAD.t + 7} fontSize="9" fill="#a1a1aa">No Reinvest</text>
    </svg>
  );
}

function ExDivCalendar() {
  resetSeed(88);
  const today = new Date(2026, 2, 28);
  const entries = DIVIDEND_STOCKS.slice(0, 10).map((d) => {
    const daysOut = Math.floor(rand() * 45) + 2;
    const exDate = new Date(today);
    exDate.setDate(exDate.getDate() + daysOut);
    const payDate = new Date(exDate);
    payDate.setDate(payDate.getDate() + 14);
    return {
      ticker: d.ticker,
      exDate: exDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      payDate: payDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      yield: d.yield,
      quarterly: d.annualDiv / 4,
      daysOut,
    };
  }).sort((a, b) => a.daysOut - b.daysOut);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-muted-foreground">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-3 py-2 text-muted-foreground">Ticker</th>
            <th className="text-right px-3 py-2 text-muted-foreground">Ex-Div Date</th>
            <th className="text-right px-3 py-2 text-muted-foreground">Pay Date</th>
            <th className="text-right px-3 py-2 text-muted-foreground">Quarterly Div</th>
            <th className="text-right px-3 py-2 text-muted-foreground">Yield</th>
            <th className="text-right px-3 py-2 text-muted-foreground">Days Away</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.ticker} className="border-b border-border hover:bg-muted/30 transition-colors">
              <td className="px-3 py-2 font-medium text-foreground">{e.ticker}</td>
              <td className="px-3 py-2 text-right text-muted-foreground">{e.exDate}</td>
              <td className="px-3 py-2 text-right text-muted-foreground">{e.payDate}</td>
              <td className="px-3 py-2 text-right font-mono text-green-400">${e.quarterly.toFixed(4)}</td>
              <td className="px-3 py-2 text-right font-mono text-muted-foreground">{e.yield.toFixed(2)}%</td>
              <td className="px-3 py-2 text-right">
                <Badge variant="outline" className="text-xs text-muted-foreground">{e.daysOut}d</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function YieldVsGrowthSVG() {
  const W = 500, H = 220;
  const PAD = { t: 30, r: 16, b: 40, l: 60 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const scenarios = [
    { label: "T (7.1%)", startYield: 7.1, growth: 1.8, color: "#ef4444" },
    { label: "KO (3.2%)", startYield: 3.2, growth: 4.1, color: "#3b82f6" },
    { label: "NEE (3.1%)", startYield: 3.1, growth: 12.4, color: "#22c55e" },
    { label: "V (0.7%)", startYield: 0.7, growth: 14.2, color: "#a855f7" },
  ];

  const years = Array.from({ length: 21 }, (_, i) => i);
  const allVals = scenarios.flatMap((s) => years.map((y) => s.startYield * Math.pow(1 + s.growth / 100, y)));
  const maxVal = Math.max(...allVals);

  const toX = (yr: number) => PAD.l + (yr / 20) * iW;
  const toY = (v: number) => PAD.t + iH - (v / maxVal) * iH;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <text x={W / 2} y={14} textAnchor="middle" fontSize="10" fill="#a1a1aa">Yield-on-Cost vs Years Held</text>
      {[0, 5, 10, 15, 20, 25, 30].filter(v => v <= maxVal + 1).map((v) => (
        <g key={v}>
          <line x1={PAD.l} y1={toY(v)} x2={W - PAD.r} y2={toY(v)} stroke="#3f3f46" strokeDasharray="3,3" />
          <text x={PAD.l - 6} y={toY(v) + 4} textAnchor="end" fontSize="8" fill="#71717a">{v}%</text>
        </g>
      ))}
      {[0, 5, 10, 15, 20].map((y) => (
        <text key={y} x={toX(y)} y={H - 6} textAnchor="middle" fontSize="8" fill="#71717a">Yr {y}</text>
      ))}
      {scenarios.map((s) => {
        const path = years.map((y, i) => {
          const v = s.startYield * Math.pow(1 + s.growth / 100, y);
          return `${i === 0 ? "M" : "L"} ${toX(y)} ${toY(v)}`;
        }).join(" ");
        return <path key={s.label} d={path} fill="none" stroke={s.color} strokeWidth="2" />;
      })}
      {/* Legend */}
      {scenarios.map((s, i) => (
        <g key={s.label}>
          <line x1={PAD.l + i * 120} y1={PAD.t - 8} x2={PAD.l + i * 120 + 14} y2={PAD.t - 8} stroke={s.color} strokeWidth="2" />
          <text x={PAD.l + i * 120 + 18} y={PAD.t - 4} fontSize="8" fill="#a1a1aa">{s.label}</text>
        </g>
      ))}
    </svg>
  );
}

function DividendAnalysisTab() {
  const [dripInitial, setDripInitial] = useState(10000);
  const [dripMonthly, setDripMonthly] = useState(200);
  const [dripYears, setDripYears] = useState(20);
  const [dripYield, setDripYield] = useState(3.5);
  const [dripGrowth, setDripGrowth] = useState(6.0);

  const trapStocks = DIVIDEND_STOCKS.filter(
    (d) => d.yield > 5 && d.payoutRatio > 70 && d.fcfCoverage < 1.5
  );

  return (
    <div className="space-y-5">
      {/* Safety Scores */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" /> Dividend Safety Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DIVIDEND_STOCKS.slice(0, 8).map((d) => (
            <div key={d.ticker} className="bg-muted rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-foreground text-sm">{d.ticker}</span>
                <span className={cn("text-xs text-muted-foreground font-semibold px-2 py-0.5 rounded-full",
                  d.safetyScore >= 80 ? "bg-green-900 text-green-300" :
                  d.safetyScore >= 60 ? "bg-yellow-900 text-yellow-300" : "bg-red-900 text-red-300"
                )}>
                  {d.safetyScore}/100
                </span>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: "Payout Ratio", val: `${d.payoutRatio}%`, ok: d.payoutRatio < 60 },
                  { label: "FCF Coverage", val: `${d.fcfCoverage.toFixed(1)}x`, ok: d.fcfCoverage >= 1.5 },
                  { label: "Debt/EBITDA", val: `${d.debtEbitda.toFixed(1)}x`, ok: d.debtEbitda <= 2 },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-muted-foreground">{item.val}</span>
                      {item.ok ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ex-Dividend Calendar */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground/50" /> Ex-Dividend Calendar (Next 10)
        </h3>
        <ExDivCalendar />
      </div>

      {/* DRIP Simulator */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground/50" /> DRIP Simulator
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {[
            { label: "Initial ($)", value: dripInitial, set: setDripInitial, min: 1000, max: 100000, step: 1000 },
            { label: "Monthly Add ($)", value: dripMonthly, set: setDripMonthly, min: 0, max: 2000, step: 50 },
            { label: "Years", value: dripYears, set: setDripYears, min: 5, max: 30, step: 5 },
            { label: "Initial Yield (%)", value: dripYield, set: setDripYield, min: 1, max: 10, step: 0.5 },
            { label: "Div Growth (%/yr)", value: dripGrowth, set: setDripGrowth, min: 0, max: 15, step: 0.5 },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-xs text-muted-foreground mb-1">{item.label}: <span className="text-foreground">{item.value}</span></div>
              <Slider
                min={item.min} max={item.max} step={item.step}
                value={[item.value]}
                onValueChange={([v]) => item.set(v)}
              />
            </div>
          ))}
        </div>
        <DripSimulatorSVG
          initial={dripInitial}
          monthly={dripMonthly}
          years={dripYears}
          yieldPct={dripYield}
          growthRate={dripGrowth}
        />
      </div>

      {/* Dividend Trap Detector */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" /> Dividend Trap Detector
        </h3>
        {trapStocks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No dividend traps found in current universe.</p>
        ) : (
          <div className="space-y-2">
            {trapStocks.map((d) => (
              <div key={d.ticker} className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-yellow-300">{d.ticker}</span>
                  <span className="text-muted-foreground text-xs ml-2">{d.name}</span>
                  <div className="text-xs text-muted-foreground mt-1">
                    Yield {d.yield.toFixed(1)}% — Payout {d.payoutRatio}% — FCF Coverage {d.fcfCoverage.toFixed(1)}x.
                    High yield may not be sustainable.
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Yield vs Growth */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" /> Yield vs Growth Tradeoff
        </h3>
        <YieldVsGrowthSVG />
        <p className="text-xs text-muted-foreground mt-2">
          Low-yield, high-growth stocks (V, NEE) surpass high-yield stocks in total income after ~10 years due to dividend compounding.
        </p>
      </div>
    </div>
  );
}

// ── Tab 3: Fixed Income ────────────────────────────────────────────────────────

function BondLadderSVG({ rungs }: { rungs: BondLeg[] }) {
  const W = 520, H = 200;
  const PAD = { t: 20, r: 16, b: 36, l: 50 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;
  const barW = (iW / rungs.length) * 0.65;
  const maxVal = Math.max(...rungs.map((r) => r.value));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const v = f * maxVal;
        const y = PAD.t + iH - f * iH;
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#3f3f46" strokeDasharray="3,2" />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fontSize="8" fill="#71717a">
              ${(v / 1000).toFixed(0)}K
            </text>
          </g>
        );
      })}
      {rungs.map((r, i) => {
        const x = PAD.l + (i + 0.175) * (iW / rungs.length);
        const barH = (r.value / maxVal) * iH;
        const y = PAD.t + iH - barH;
        const shade = ["#6366f1", "#3b82f6", "#06b6d4", "#22c55e", "#a855f7"];
        const annualIncome = r.value * r.rate / 100;
        return (
          <g key={r.maturity}>
            <rect x={x} y={y} width={barW} height={barH} rx="3" fill={shade[i]} opacity="0.85" />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="9" fill={shade[i]}>
              {r.rate}%
            </text>
            <text x={x + barW / 2} y={H - PAD.b + 12} textAnchor="middle" fontSize="9" fill="#a1a1aa">
              {r.maturity}yr
            </text>
            <text x={x + barW / 2} y={H - PAD.b + 22} textAnchor="middle" fontSize="8" fill="#71717a">
              ${(annualIncome / 1000).toFixed(1)}K/yr
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function FixedIncomeTab() {
  const [taxRate, setTaxRate] = useState(32);
  const [muniYield, setMuniYield] = useState(3.8);

  const taxEquivYield = muniYield / (1 - taxRate / 100);

  const bondLadder: BondLeg[] = [
    { maturity: 1, rate: 5.02, allocation: 20, value: 20000 },
    { maturity: 2, rate: 4.72, allocation: 20, value: 20000 },
    { maturity: 3, rate: 4.58, allocation: 20, value: 20000 },
    { maturity: 4, rate: 4.45, allocation: 20, value: 20000 },
    { maturity: 5, rate: 4.48, allocation: 20, value: 20000 },
  ];

  const totalIncome = bondLadder.reduce((sum, r) => sum + r.value * r.rate / 100, 0);

  return (
    <div className="space-y-5">
      {/* Bond Ladder Builder */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-muted-foreground/50" /> Bond Ladder Builder — $100,000
        </h3>
        <p className="text-xs text-muted-foreground mb-3">Spread capital across 5 maturities to reduce reinvestment risk and maintain liquidity.</p>
        <BondLadderSVG rungs={bondLadder} />
        <div className="mt-2 text-xs text-muted-foreground">
          Total Annual Income: <span className="text-green-400 font-mono font-medium">${totalIncome.toFixed(2)}</span>
          {" "}— Blended Yield: <span className="text-primary font-mono font-medium">{(totalIncome / 100000 * 100).toFixed(2)}%</span>
        </div>
      </div>

      {/* CD Rates */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-400" /> CD Rates
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CD_RATES.map((cd) => (
            <div key={cd.term} className="bg-muted rounded-lg p-3 text-center">
              <div className="text-muted-foreground text-xs mb-1">{cd.term}</div>
              <div className="text-lg font-medium text-foreground">{cd.rate.toFixed(2)}%</div>
              <div className="text-xs text-green-400">APY {cd.apy.toFixed(2)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Treasury Rates */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-yellow-400" /> Treasury Rates
        </h3>
        <div className="space-y-2">
          {TREASURY_RATES.map((t) => (
            <div key={t.name} className="flex items-center gap-3">
              <span className="text-muted-foreground text-xs w-36">{t.name}</span>
              <div className="flex-1 bg-muted rounded-full h-2 relative">
                <div
                  className={cn("h-2 rounded-full", t.type === "bill" ? "bg-green-500" : t.type === "note" ? "bg-primary" : "bg-primary")}
                  style={{ width: `${(t.yield / 5.5) * 100}%` }}
                />
              </div>
              <span className="font-mono text-sm text-foreground w-12 text-right">{t.yield.toFixed(2)}%</span>
              <Badge variant="outline" className="text-xs text-muted-foreground w-10 text-center">
                {t.type === "bill" ? "Bill" : t.type === "note" ? "Note" : "Bond"}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <span className="text-yellow-400 font-medium">Yield Curve Context:</span> T-bill 5.25% vs 10-Year 4.35% — inverted yield curve signals market expects rate cuts. Short-term bills offer more yield with less duration risk.
          </p>
        </div>
      </div>

      {/* I-Bond Mechanics */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-400" /> I-Bond Mechanics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
          {[
            { label: "Current Composite Rate", value: "4.28%", note: "CPI-adjusted, resets every 6 months" },
            { label: "Purchase Limit", value: "$10,000/yr", note: "Per person, per year (+ $5K with tax refund)" },
            { label: "Minimum Hold", value: "12 months", note: "Cannot redeem before 1 year" },
            { label: "Early Redemption", value: "3-mo penalty", note: "Forfeit last 3 months interest if < 5 years" },
          ].map((item) => (
            <div key={item.label} className="bg-muted rounded-lg p-3">
              <div className="text-muted-foreground text-xs mb-1">{item.label}</div>
              <div className="font-medium text-foreground text-sm mb-1">{item.value}</div>
              <div className="text-muted-foreground text-xs">{item.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Municipal Bonds */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" /> Municipal Bond Tax-Equivalent Yield
        </h3>
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Muni Yield: {muniYield.toFixed(1)}%</div>
            <div className="w-36">
              <Slider min={1} max={6} step={0.1} value={[muniYield]} onValueChange={([v]) => setMuniYield(v)} />
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Tax Rate: {taxRate}%</div>
            <div className="w-36">
              <Slider min={10} max={45} step={1} value={[taxRate]} onValueChange={([v]) => setTaxRate(v)} />
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-muted-foreground text-xs mb-1">Tax-Equivalent Yield</div>
            <div className="text-2xl font-bold text-green-400">{taxEquivYield.toFixed(2)}%</div>
            <div className="text-muted-foreground text-xs">= {muniYield.toFixed(1)}% / (1 - {taxRate}%)</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          At a {taxRate}% tax rate, a {muniYield.toFixed(1)}% muni bond is equivalent to earning {taxEquivYield.toFixed(2)}% in a taxable bond. Munis are most valuable for investors in higher tax brackets.
        </p>
      </div>

      {/* High Yield Bonds */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" /> High Yield vs Investment Grade
        </h3>
        <div className="space-y-3">
          {[
            { label: "Investment Grade (IG)", yield: 5.1, spread: 0.75, defaultRate: 0.2, rating: "BBB+", color: "#22c55e" },
            { label: "High Yield BB", yield: 6.8, spread: 2.45, defaultRate: 1.2, rating: "BB", color: "#f59e0b" },
            { label: "High Yield B", yield: 8.4, spread: 4.05, defaultRate: 3.8, rating: "B", color: "#ef4444" },
            { label: "Distressed / CCC", yield: 12.6, spread: 8.25, defaultRate: 10.4, rating: "CCC", color: "#dc2626" },
          ].map((bond) => (
            <div key={bond.label} className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="text-muted-foreground w-44">{bond.label}</span>
              <Badge variant="outline" className="text-xs w-12 text-center" style={{ borderColor: bond.color, color: bond.color }}>{bond.rating}</Badge>
              <span className="font-mono text-foreground w-12">{bond.yield.toFixed(1)}%</span>
              <span className="text-muted-foreground w-28">+{bond.spread.toFixed(2)}% over T-bills</span>
              <span className="text-red-400 w-28">Default: ~{bond.defaultRate.toFixed(1)}%/yr</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Alternative Income ─────────────────────────────────────────────────

function AltIncomeTab() {
  return (
    <div className="space-y-5">
      {/* REIT Types */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground/50" /> REIT Income: mREIT vs eREIT
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-red-900 text-red-300 text-xs">mREIT</Badge>
              <span className="font-medium text-foreground">Mortgage REITs</span>
            </div>
            <div className="text-lg font-medium text-red-400 mb-2">10–15% yield</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• Invest in mortgage-backed securities</div>
              <div>• Use leverage (often 5–8x)</div>
              <div>• Very sensitive to interest rate spreads</div>
              <div>• Dividend can be cut quickly in rising rates</div>
              <div className="text-red-400 font-medium mt-2">Risk: Very High — rate/credit risk</div>
            </div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-900 text-green-300 text-xs">eREIT</Badge>
              <span className="font-medium text-foreground">Equity REITs</span>
            </div>
            <div className="text-lg font-medium text-green-400 mb-2">3–7% yield</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• Own physical real estate</div>
              <div>• Rental income + property appreciation</div>
              <div>• Inflation hedge (leases adjust)</div>
              <div>• Must pay 90% taxable income as dividends</div>
              <div className="text-green-400 font-medium mt-2">Risk: Medium — property/vacancy risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Income Cards */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Alternative Income Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ALT_INCOME.map((item) => (
            <div key={item.name} className="bg-muted rounded-lg p-3">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <span className="font-medium text-foreground text-sm">{item.name}</span>
                  <Badge variant="outline" className="text-xs text-muted-foreground ml-2">{item.type}</Badge>
                </div>
                <span className={cn(
                  "text-lg font-medium",
                  item.yield >= 12 ? "text-red-400" : item.yield >= 8 ? "text-yellow-400" : "text-green-400"
                )}>
                  {item.yield.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{item.desc}</p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className={cn(
                  "px-2 py-0.5 rounded-full",
                  item.risk === "Very High" ? "bg-red-900 text-red-300" :
                  item.risk === "High" ? "bg-orange-900 text-orange-300" :
                  "bg-yellow-900 text-yellow-300"
                )}>
                  Risk: {item.risk}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Rate Risk: {item.rateRisk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Covered Calls Explainer */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-muted-foreground/50" /> Options Income Strategies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4 border border-border">
            <div className="font-medium text-primary mb-2">Covered Call Writing</div>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <div>• Own 100 shares of stock</div>
              <div>• Sell a call option 5–10% OTM</div>
              <div>• Collect 1–3% premium per month</div>
              <div>• Cap your upside at strike price</div>
              <div>• Reduces cost basis each time</div>
              <div className="text-primary font-medium mt-2">Best on: sideways or slowly rising stocks</div>
            </div>
          </div>
          <div className="bg-muted rounded-lg p-4 border border-green-900/40">
            <div className="font-medium text-green-300 mb-2">Cash-Secured Puts</div>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <div>• Set aside cash to buy 100 shares</div>
              <div>• Sell a put option at desired entry price</div>
              <div>• Collect premium while waiting</div>
              <div>• If assigned, buy at strike (effective lower cost)</div>
              <div>• If not assigned, keep premium</div>
              <div className="text-green-400 font-medium mt-2">Best on: stocks you want to own at lower prices</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferred Stocks + CEFs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-md p-4">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" /> Preferred Stocks
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            {[
              { label: "Fixed Dividend", desc: "Typically 5–8%, paid before common dividends" },
              { label: "Priority Claim", desc: "In liquidation, preferred ranks above common equity" },
              { label: "Callable Risk", desc: "Issuer can redeem at par, usually after 5 years" },
              { label: "Rate Sensitivity", desc: "Fixed rate = high duration, prices fall when rates rise" },
              { label: "Cumulative Dividends", desc: "Missed payments accumulate and must be paid first" },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded p-2">
                <div className="text-yellow-300 font-medium">{item.label}</div>
                <div className="text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-md p-4">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" /> Closed-End Funds (CEFs)
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            {[
              { label: "Discount/Premium", desc: "CEFs trade on exchanges — can be 10–15% below NAV" },
              { label: "Leverage", desc: "Most CEFs use 20–40% leverage to boost income" },
              { label: "Distribution Rate", desc: "Combines dividends, interest, capital gains, return of capital" },
              { label: "Buying at Discount", desc: "Purchase $1.00 of assets for $0.90 — margin of safety" },
              { label: "NAV Erosion Risk", desc: "High distributions may include return of capital (NAV erodes)" },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded p-2">
                <div className="text-muted-foreground font-medium">{item.label}</div>
                <div className="text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: Income Portfolio Builder ──────────────────────────────────────────

function IncomeAllocationSVG({ sources, totalPct }: { sources: IncomeSource[]; totalPct: number }) {
  const W = 240, H = 240;
  const cx = W / 2, cy = H / 2, r = 90, innerR = 40;
  let cumAngle = -Math.PI / 2;

  const slices = sources.map((s) => {
    const angle = (s.allocation / totalPct) * 2 * Math.PI;
    const start = cumAngle;
    cumAngle += angle;
    const end = cumAngle;
    const midAngle = (start + end) / 2;
    return { ...s, start, end, midAngle, angle };
  });

  const COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#06b6d4"];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {slices.map((sl, i) => {
        const x1 = cx + r * Math.cos(sl.start);
        const y1 = cy + r * Math.sin(sl.start);
        const x2 = cx + r * Math.cos(sl.end);
        const y2 = cy + r * Math.sin(sl.end);
        const ix1 = cx + innerR * Math.cos(sl.start);
        const iy1 = cy + innerR * Math.sin(sl.start);
        const ix2 = cx + innerR * Math.cos(sl.end);
        const iy2 = cy + innerR * Math.sin(sl.end);
        const lg = sl.angle > Math.PI ? 1 : 0;
        const d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${lg} 0 ${ix1} ${iy1} Z`;
        return (
          <path key={sl.label} d={d} fill={COLORS[i]} opacity="0.85" stroke="#18181b" strokeWidth="1" />
        );
      })}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="12" fill="#e4e4e7" fontWeight="700">Alloc.</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#71717a">by type</text>
    </svg>
  );
}

function IncomePortfolioTab() {
  const [allocs, setAllocs] = useState<number[]>([35, 25, 15, 10, 8, 7]);
  const [targetMonthly, setTargetMonthly] = useState(3000);

  const sources = useMemo(() => {
    return INCOME_SOURCES.map((s, i) => ({ ...s, allocation: allocs[i] }));
  }, [allocs]);

  const totalAlloc = allocs.reduce((a, b) => a + b, 0);

  const blendedYield = useMemo(() => {
    return sources.reduce((sum, s) => sum + (s.yield * s.allocation) / totalAlloc, 0);
  }, [sources, totalAlloc]);

  const capitalNeeded = useMemo(() => {
    const annualTarget = targetMonthly * 12;
    return blendedYield > 0 ? annualTarget / (blendedYield / 100) : 0;
  }, [targetMonthly, blendedYield]);

  const updateAlloc = useCallback((i: number, val: number) => {
    setAllocs((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  }, []);

  const rateRiskColors = { low: "text-green-400", medium: "text-yellow-400", high: "text-red-400" };
  const taxColors = { high: "text-green-400", medium: "text-yellow-400", low: "text-red-400" };

  return (
    <div className="space-y-5">
      {/* Blended Yield + Capital Needed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-md p-4 text-center">
          <div className="text-muted-foreground text-xs mb-1">Blended Yield</div>
          <div className="text-lg font-medium text-green-400">{blendedYield.toFixed(2)}%</div>
          <div className="text-muted-foreground text-xs">weighted average</div>
        </div>
        <div className="bg-card border border-border rounded-md p-4 text-center">
          <div className="text-muted-foreground text-xs mb-1">Target Monthly Income</div>
          <div className="flex items-center justify-center gap-2">
            <div className="text-lg font-medium text-foreground">${targetMonthly.toLocaleString()}</div>
          </div>
          <div className="w-full mt-2">
            <Slider min={500} max={20000} step={500} value={[targetMonthly]} onValueChange={([v]) => setTargetMonthly(v)} />
          </div>
        </div>
        <div className="bg-card border border-border rounded-md p-4 text-center">
          <div className="text-muted-foreground text-xs mb-1">Capital Needed</div>
          <div className="text-lg font-medium text-primary">{formatCurrency(capitalNeeded)}</div>
          <div className="text-muted-foreground text-xs">at {blendedYield.toFixed(2)}% yield</div>
        </div>
      </div>

      {/* Allocation sliders */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Allocation Sliders</h3>
        <div className="flex gap-3">
          <div className="flex-1 space-y-4">
            {sources.map((s, i) => (
              <div key={s.label}>
                <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
                  <span className="text-muted-foreground">{s.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">Yield: <span className="text-green-400">{s.yield.toFixed(1)}%</span></span>
                    <span className={cn("text-xs text-muted-foreground", rateRiskColors[s.rateRisk])}>Rate Risk: {s.rateRisk}</span>
                    <span className={cn("text-xs text-muted-foreground", taxColors[s.taxEfficiency])}>Tax: {s.taxEfficiency}</span>
                    <span className="text-foreground font-mono w-8 text-right">{allocs[i]}%</span>
                  </div>
                </div>
                <Slider min={0} max={80} step={1} value={[allocs[i]]} onValueChange={([v]) => updateAlloc(i, v)} />
              </div>
            ))}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-muted-foreground">Total Allocation</span>
              <span className={cn("font-mono font-medium", totalAlloc === 100 ? "text-green-400" : "text-yellow-400")}>
                {totalAlloc}%
              </span>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center">
            <IncomeAllocationSVG sources={sources} totalPct={totalAlloc} />
          </div>
        </div>
      </div>

      {/* Interest Rate Sensitivity */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-400" /> Interest Rate Sensitivity (+100bps shock)
        </h3>
        <div className="space-y-2">
          {[
            { label: "Short-Term T-Bills (3M)", impact: "+0.5%", good: true, desc: "Yield goes up — benefits short bonds" },
            { label: "Long Bonds (20-30yr)", impact: "-15 to -20%", good: false, desc: "High duration, price falls sharply" },
            { label: "Dividend Stocks", impact: "-5 to -8%", good: false, desc: "Valuation compression, P/E re-rating" },
            { label: "REITs", impact: "-10 to -15%", good: false, desc: "Cap rate expansion, borrowing costs rise" },
            { label: "Preferred Stocks", impact: "-8 to -12%", good: false, desc: "Fixed rate = duration risk similar to bonds" },
            { label: "BDCs / Floating Rate", impact: "+2 to +4%", good: true, desc: "Floating rate loans reprice upward" },
            { label: "Covered Calls", impact: "Neutral", good: true, desc: "Premium driven by volatility, not rate level" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-xs text-muted-foreground bg-muted rounded-lg p-2.5">
              <span className="text-muted-foreground w-44">{item.label}</span>
              <span className={cn("font-mono w-20 font-medium", item.good ? "text-green-400" : "text-red-400")}>
                {item.impact}
              </span>
              <span className="text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Efficiency */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Percent className="w-4 h-4 text-yellow-400" /> Tax Efficiency by Income Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
          {[
            { label: "Qualified Dividends (AAPL, JNJ)", taxType: "0/15/20% LTCG rate", best: true },
            { label: "Municipal Bond Interest", taxType: "Federal tax-exempt, often state-exempt", best: true },
            { label: "T-Bill / T-Note Interest", taxType: "Federal taxable, state-exempt", best: false },
            { label: "REIT Dividends", taxType: "Ordinary income (up to 37%) — partial 20% QBI deduction", best: false },
            { label: "BDC Dividends", taxType: "Mostly ordinary income, some qualified", best: false },
            { label: "Options Premium (Short-term)", taxType: "Ordinary income rate (up to 37%)", best: false },
            { label: "CEF Return-of-Capital", taxType: "Tax-deferred (reduces cost basis)", best: true },
            { label: "Covered Call Premium (in IRA)", taxType: "Tax-deferred or tax-free in Roth", best: true },
          ].map((item) => (
            <div key={item.label} className={cn(
              "flex items-start gap-2 rounded-lg p-2",
              item.best ? "bg-green-900/20 border border-green-900/30" : "bg-muted"
            )}>
              {item.best ? (
                <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              <div>
                <div className="text-muted-foreground font-medium">{item.label}</div>
                <div className="text-muted-foreground">{item.taxType}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 6: Income Laddering Strategy ─────────────────────────────────────────

function BucketSVG() {
  const W = 520, H = 140;
  const buckets = [
    { label: "Bucket 1", sub: "Years 1–2", type: "Cash", desc: "HYSAs, T-Bills, CDs", yield: "4.8–5.2%", color: "#22c55e", x: 20, w: 140 },
    { label: "Bucket 2", sub: "Years 3–7", type: "Bonds", desc: "5yr bond ladder, REITs", yield: "4.5–6%", color: "#3b82f6", x: 180, w: 140 },
    { label: "Bucket 3", sub: "Years 8+", type: "Growth", desc: "Div. stocks, growth", yield: "8–12% total", color: "#a855f7", x: 340, w: 160 },
  ];
  const arrows = [
    { x1: 165, y1: 70, x2: 178, y2: 70 },
    { x1: 325, y1: 70, x2: 338, y2: 70 },
  ];
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {buckets.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={20} width={b.w} height={90} rx="8" fill={`${b.color}18`} stroke={b.color} strokeWidth="1.5" />
          <text x={b.x + b.w / 2} y={42} textAnchor="middle" fontSize="10" fill={b.color} fontWeight="700">{b.label}</text>
          <text x={b.x + b.w / 2} y={55} textAnchor="middle" fontSize="8" fill="#a1a1aa">{b.sub}</text>
          <text x={b.x + b.w / 2} y={68} textAnchor="middle" fontSize="9" fill="#e4e4e7" fontWeight="600">{b.type}</text>
          <text x={b.x + b.w / 2} y={82} textAnchor="middle" fontSize="8" fill="#71717a">{b.desc}</text>
          <text x={b.x + b.w / 2} y={100} textAnchor="middle" fontSize="9" fill={b.color}>{b.yield}</text>
        </g>
      ))}
      {arrows.map((a, i) => (
        <g key={i}>
          <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#52525b" strokeWidth="1.5" markerEnd="url(#arrow)" />
        </g>
      ))}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#52525b" />
        </marker>
      </defs>
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="8" fill="#52525b">Replenish Bucket 1 from Bucket 2 income; Bucket 2 from Bucket 3 growth</text>
    </svg>
  );
}

function BondMaturitySVG({ annualSpend }: { annualSpend: number }) {
  const W = 540, H = 180;
  const PAD = { t: 16, r: 16, b: 48, l: 60 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const bonds = Array.from({ length: 10 }, (_, i) => {
    const yr = i + 1;
    const rate = 5.2 - i * 0.12;
    const faceValue = annualSpend * (1 + 0.025 * i); // inflation-adjusted
    return { yr, rate, faceValue };
  });

  const maxVal = Math.max(...bonds.map((b) => b.faceValue));
  const barW = (iW / bonds.length) * 0.6;
  const COLORS = ["#22c55e", "#34d399", "#6ee7b7", "#3b82f6", "#60a5fa", "#93c5fd", "#a855f7", "#c084fc", "#f59e0b", "#fbbf24"];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <text x={PAD.l + iW / 2} y={12} textAnchor="middle" fontSize="10" fill="#a1a1aa">Bond Maturity Schedule (10-Year Ladder)</text>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const v = f * maxVal;
        const y = PAD.t + iH - f * iH;
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#3f3f46" strokeDasharray="3,2" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="8" fill="#71717a">
              ${(v / 1000).toFixed(0)}K
            </text>
          </g>
        );
      })}
      {bonds.map((b, i) => {
        const x = PAD.l + i * (iW / bonds.length) + (iW / bonds.length - barW) / 2;
        const barH = (b.faceValue / maxVal) * iH;
        const y = PAD.t + iH - barH;
        return (
          <g key={b.yr}>
            <rect x={x} y={y} width={barW} height={barH} rx="3" fill={COLORS[i]} opacity="0.85" />
            <text x={x + barW / 2} y={PAD.t + iH + 12} textAnchor="middle" fontSize="8" fill="#a1a1aa">Yr {b.yr}</text>
            <text x={x + barW / 2} y={PAD.t + iH + 22} textAnchor="middle" fontSize="7" fill="#71717a">{b.rate.toFixed(1)}%</text>
            <text x={x + barW / 2} y={PAD.t + iH + 32} textAnchor="middle" fontSize="7" fill="#52525b">${(b.faceValue / 1000).toFixed(1)}K</text>
          </g>
        );
      })}
    </svg>
  );
}

function SustainabilitySVG({ portfolio, annualSpend, years }: { portfolio: number; annualSpend: number; years: number }) {
  const W = 540, H = 180;
  const PAD = { t: 20, r: 20, b: 36, l: 60 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const points = useMemo(() => {
    const conservative: number[] = [];
    const moderate: number[] = [];
    const aggressive: number[] = [];
    let c = portfolio, m = portfolio, a = portfolio;
    for (let y = 0; y <= years; y++) {
      conservative.push(c);
      moderate.push(m);
      aggressive.push(a);
      const inflation = 0.025;
      const spend = annualSpend * Math.pow(1 + inflation, y);
      c = c * 1.03 - spend;
      m = m * 1.05 - spend;
      a = a * 1.07 - spend;
    }
    return { conservative, moderate, aggressive };
  }, [portfolio, annualSpend, years]);

  const allVals = [...points.conservative, ...points.moderate, ...points.aggressive];
  const maxVal = Math.max(...allVals);
  const minVal = Math.min(...allVals, 0);
  const range = maxVal - minVal;

  const toX = (yr: number) => PAD.l + (yr / years) * iW;
  const toY = (v: number) => PAD.t + iH - ((v - minVal) / range) * iH;
  const zeroY = toY(0);

  const mkPath = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");

  const yTicks = [minVal, minVal + range * 0.25, minVal + range * 0.5, minVal + range * 0.75, maxVal];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <line x1={PAD.l} y1={zeroY} x2={W - PAD.r} y2={zeroY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4,2" opacity="0.5" />
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} y1={toY(v)} x2={W - PAD.r} y2={toY(v)} stroke="#3f3f46" strokeDasharray="3,2" />
          <text x={PAD.l - 6} y={toY(v) + 4} textAnchor="end" fontSize="8" fill="#71717a">
            {v >= 0 ? `$${(v / 1000).toFixed(0)}K` : `-$${(Math.abs(v) / 1000).toFixed(0)}K`}
          </text>
        </g>
      ))}
      {[0, 5, 10, 15, 20, 25, 30].filter((y) => y <= years).map((y) => (
        <text key={y} x={toX(y)} y={H - 4} textAnchor="middle" fontSize="8" fill="#71717a">Yr {y}</text>
      ))}
      <path d={mkPath(points.conservative)} fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <path d={mkPath(points.moderate)} fill="none" stroke="#f59e0b" strokeWidth="2" />
      <path d={mkPath(points.aggressive)} fill="none" stroke="#22c55e" strokeWidth="2.5" />
      {/* Legend */}
      <rect x={PAD.l} y={PAD.t - 4} width="8" height="4" fill="#22c55e" rx="1" />
      <text x={PAD.l + 12} y={PAD.t} fontSize="8" fill="#a1a1aa">Aggressive (7% return)</text>
      <rect x={PAD.l + 140} y={PAD.t - 4} width="8" height="4" fill="#f59e0b" rx="1" />
      <text x={PAD.l + 152} y={PAD.t} fontSize="8" fill="#a1a1aa">Moderate (5%)</text>
      <rect x={PAD.l + 240} y={PAD.t - 4} width="8" height="4" fill="#ef4444" rx="1" />
      <text x={PAD.l + 252} y={PAD.t} fontSize="8" fill="#a1a1aa">Conservative (3%)</text>
    </svg>
  );
}

function IncomeLadderingTab() {
  const [annualSpend, setAnnualSpend] = useState(60000);
  const [portfolio, setPortfolio] = useState(1500000);
  const [planYears, setPlanYears] = useState(30);
  const [showReinvest, setShowReinvest] = useState(false);

  const withdrawalRate = (annualSpend / portfolio * 100);

  return (
    <div className="space-y-5">
      {/* Bucket Strategy */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-muted-foreground/50" /> Bucket Strategy
        </h3>
        <BucketSVG />
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-2.5">
            <div className="text-green-400 font-medium mb-1">Bucket 1 (Cash)</div>
            <div className="text-muted-foreground">2 years of expenses in liquid, FDIC-insured accounts. No sequence-of-returns risk. Gives you peace of mind to hold equities.</div>
          </div>
          <div className="bg-muted/40 border border-border rounded-lg p-2.5">
            <div className="text-primary font-medium mb-1">Bucket 2 (Bonds)</div>
            <div className="text-muted-foreground">Years 3–7 funded with bond ladder + REIT income. Replenishes Bucket 1 each year as bonds mature. Medium risk, steady cash flow.</div>
          </div>
          <div className="bg-muted/40 border border-border rounded-lg p-2.5">
            <div className="text-primary font-medium mb-1">Bucket 3 (Growth)</div>
            <div className="text-muted-foreground">Long-term growth via dividend stocks, equities. Not touched for 8+ years — ride out any downturn. Generates the income to refill buckets.</div>
          </div>
        </div>
      </div>

      {/* Bond Ladder */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-green-400" /> Cash Flow Matching — Bond Maturity Schedule
        </h3>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-muted-foreground">Annual Spend: ${annualSpend.toLocaleString()}</span>
          <div className="w-44">
            <Slider min={20000} max={200000} step={5000} value={[annualSpend]} onValueChange={([v]) => setAnnualSpend(v)} />
          </div>
        </div>
        <BondMaturitySVG annualSpend={annualSpend} />
        <p className="text-xs text-muted-foreground mt-2">
          Each bar represents one bond maturing to cover that year's inflation-adjusted spending. Maturities are staggered to avoid reinvestment risk concentration.
        </p>
      </div>

      {/* Reinvestment Risk */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" /> Reinvestment Risk
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="space-y-2">
            <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-3">
              <div className="text-yellow-300 font-medium mb-1">What Is It?</div>
              <div className="text-muted-foreground">When a short-term bond matures, you must reinvest at prevailing rates — which may be lower than your original rate.</div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-muted-foreground font-medium mb-1">Example</div>
              <div className="text-muted-foreground">You locked in 5% on a 1-year T-Bill. It matures, but rates are now 3.2%. Your income drops 36% on that portion.</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="bg-muted rounded-lg p-3">
              <div className="text-muted-foreground font-medium mb-1">Mitigation</div>
              <div className="text-muted-foreground">
                <div>• Build a 5–10 year ladder (not all short)</div>
                <div>• Mix in floating rate notes (FRNs)</div>
                <div>• Use I-Bonds for CPI-adjusted yield</div>
                <div>• Include dividend growth stocks (natural rate hedge)</div>
              </div>
            </div>
            <button
              onClick={() => setShowReinvest(!showReinvest)}
              className="w-full bg-muted hover:bg-muted rounded-lg p-2 flex items-center justify-between text-xs text-muted-foreground transition-colors"
            >
              <span>Reinvestment Scenario Details</span>
              {showReinvest ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {showReinvest && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                    {[
                      { label: "Rates stay at 5%", income: "$5,000", change: "0%" },
                      { label: "Rates fall to 4%", income: "$4,000", change: "-20%" },
                      { label: "Rates fall to 3%", income: "$3,000", change: "-40%" },
                      { label: "Rates fall to 2%", income: "$2,000", change: "-60%" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between">
                        <span>{row.label}</span>
                        <span className="font-mono">{row.income}</span>
                        <span className={row.change === "0%" ? "text-green-400" : "text-red-400"}>{row.change}</span>
                      </div>
                    ))}
                    <div className="text-muted-foreground italic">Based on $100,000 1-year T-Bill originally at 5%</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 30-Year Sustainability */}
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-green-400" /> Income Sustainability — Does the Portfolio Last?
        </h3>
        <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-muted-foreground">
          <div>
            <span className="text-muted-foreground">Portfolio: ${(portfolio / 1000).toFixed(0)}K</span>
            <div className="w-36 mt-1">
              <Slider min={200000} max={5000000} step={100000} value={[portfolio]} onValueChange={([v]) => setPortfolio(v)} />
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Annual Spend: ${annualSpend.toLocaleString()}</span>
            <div className="w-36 mt-1">
              <Slider min={20000} max={200000} step={5000} value={[annualSpend]} onValueChange={([v]) => setAnnualSpend(v)} />
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Plan Years: {planYears}</span>
            <div className="w-24 mt-1">
              <Slider min={10} max={40} step={5} value={[planYears]} onValueChange={([v]) => setPlanYears(v)} />
            </div>
          </div>
          <div className="bg-muted rounded-lg p-2 text-center">
            <div className="text-muted-foreground text-xs">Withdrawal Rate</div>
            <div className={cn("text-xl font-medium", withdrawalRate <= 4 ? "text-green-400" : withdrawalRate <= 5 ? "text-yellow-400" : "text-red-400")}>
              {withdrawalRate.toFixed(2)}%
            </div>
            <div className={cn("text-xs", withdrawalRate <= 4 ? "text-green-400" : withdrawalRate <= 5 ? "text-yellow-400" : "text-red-400")}>
              {withdrawalRate <= 4 ? "Sustainable" : withdrawalRate <= 5 ? "Borderline" : "Risky"}
            </div>
          </div>
        </div>
        <SustainabilitySVG portfolio={portfolio} annualSpend={annualSpend} years={planYears} />
        <p className="text-xs text-muted-foreground mt-2">
          The 4% rule: withdraw 4% of initial portfolio annually (inflation-adjusted). At 5% portfolio return, a 4% withdrawal is sustainable indefinitely. At 3% return, portfolio depletes over time.
        </p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function IncomeInvestingPage() {
  const [activeTab, setActiveTab] = useState("universe");

  const tabs = [
    { id: "universe", label: "Dividend Universe", icon: Star },
    { id: "analysis", label: "Analysis Tools", icon: BarChart3 },
    { id: "fixed", label: "Fixed Income", icon: Shield },
    { id: "alternative", label: "Alt. Income", icon: Layers },
    { id: "portfolio", label: "Portfolio Builder", icon: Target },
    { id: "laddering", label: "Income Laddering", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-medium text-foreground tracking-tight">Income Investing</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Dividend strategies, fixed income, REITs, and portfolio income construction
            </p>
          </div>
          <div className="flex gap-3 text-center">
            {[
              { label: "Avg Div Yield", value: `${(DIVIDEND_STOCKS.reduce((s, d) => s + d.yield, 0) / DIVIDEND_STOCKS.length).toFixed(2)}%`, color: "text-green-400" },
              { label: "10yr T-Bond", value: "4.35%", color: "text-primary" },
              { label: "Aristocrats", value: `${DIVIDEND_STOCKS.filter((d) => d.isAristocrat).length}`, color: "text-yellow-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-lg px-4 py-2">
                <div className="text-muted-foreground text-xs">{stat.label}</div>
                <div className={cn("text-lg font-medium", stat.color)}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Hero */}
      <div className="rounded-md border border-border bg-card border-l-4 border-l-primary p-6">
        <h2 className="text-lg font-medium text-foreground mb-1">Income Strategy Suite</h2>
        <p className="text-sm text-muted-foreground">Dividend screening, yield analysis, fixed income tools, alternative income sources, and portfolio construction.</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="flex flex-wrap gap-1 h-auto bg-card border border-border p-1 rounded-md mb-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground rounded-lg"
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="universe" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <DividendUniverseTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="analysis" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <DividendAnalysisTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="fixed" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <FixedIncomeTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="alternative" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <AltIncomeTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <IncomePortfolioTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="laddering" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <IncomeLadderingTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
