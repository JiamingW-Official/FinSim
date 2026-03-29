"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart2,
  DollarSign,
  ShieldAlert,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 702005;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
// Advance seed deterministically
const seedRand = (seed: number) => {
  s = seed;
};
seedRand(702005);

// ── Types ─────────────────────────────────────────────────────────────────────

interface IndexData {
  name: string;
  ticker: string;
  region: string;
  level: number;
  ytd: number;
  oneYear: number;
  fiveYear: number;
  currency: string;
  type: "DM" | "EM";
}

interface ValuationData {
  country: string;
  code: string;
  pe: number;
  pb: number;
  divYield: number;
  epsGrowth: number;
  region: string;
  type: "DM" | "EM";
}

interface CountryProfile {
  name: string;
  code: string;
  flag: string;
  marketCap: number; // USD trillions
  topSectors: { name: string; weight: number }[];
  topStocks: { ticker: string; name: string; weight: number }[];
  politicalRisk: number; // 0-10
  currency: string;
  fxYtd: number;
  gdpGrowth: number;
  description: string;
}

interface CurrencyData {
  country: string;
  currency: string;
  localReturn: number;
  usdReturn: number;
  currencyEffect: number;
  hedgeCost: number;
  volatility: number;
}

interface EMDMData {
  name: string;
  type: "EM" | "DM";
  annualReturn: number;
  volatility: number;
  sharpe: number;
  politicalRisk: number;
  govScore: number;
  demographicScore: number;
  riskPremium: number;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const INDICES: IndexData[] = [
  { name: "S&P 500",        ticker: "SPX",    region: "US",           level: 5218,  ytd:  8.4, oneYear: 22.1, fiveYear: 91.3,  currency: "USD", type: "DM" },
  { name: "MSCI EAFE",      ticker: "EFA",    region: "Dev. Intl",    level: 2341,  ytd:  4.2, oneYear: 11.6, fiveYear: 32.7,  currency: "USD", type: "DM" },
  { name: "MSCI EM",        ticker: "EEM",    region: "Emerging",     level: 1089,  ytd:  3.1, oneYear:  6.8, fiveYear: 14.2,  currency: "USD", type: "EM" },
  { name: "Nikkei 225",     ticker: "N225",   region: "Japan",        level: 39652, ytd: 12.7, oneYear: 33.4, fiveYear: 68.9,  currency: "JPY", type: "DM" },
  { name: "DAX",            ticker: "DAX",    region: "Germany",      level: 18402, ytd:  7.3, oneYear: 16.5, fiveYear: 45.8,  currency: "EUR", type: "DM" },
  { name: "FTSE 100",       ticker: "UKX",    region: "UK",           level: 7952,  ytd:  1.8, oneYear:  5.2, fiveYear: 18.4,  currency: "GBP", type: "DM" },
  { name: "SSE Composite",  ticker: "SHCOMP", region: "China",        level: 3041,  ytd: -4.8, oneYear: -8.2, fiveYear: -12.1, currency: "CNY", type: "EM" },
  { name: "BSE Sensex",     ticker: "SENSEX", region: "India",        level: 73648, ytd:  2.9, oneYear: 14.3, fiveYear: 98.6,  currency: "INR", type: "EM" },
  { name: "Bovespa",        ticker: "IBOV",   region: "Brazil",       level: 127842,ytd: -3.2, oneYear:  3.1, fiveYear: 42.3,  currency: "BRL", type: "EM" },
];

const VALUATIONS: ValuationData[] = [
  { country: "United States", code: "US", pe: 21.4, pb: 4.1, divYield: 1.4, epsGrowth: 11.2, region: "Americas",    type: "DM" },
  { country: "Japan",         code: "JP", pe: 15.8, pb: 1.5, divYield: 2.1, epsGrowth:  8.4, region: "Asia-Pacific", type: "DM" },
  { country: "Germany",       code: "DE", pe: 12.3, pb: 1.8, divYield: 3.2, epsGrowth:  4.1, region: "Europe",      type: "DM" },
  { country: "UK",            code: "GB", pe: 11.7, pb: 1.6, divYield: 3.8, epsGrowth:  2.8, region: "Europe",      type: "DM" },
  { country: "France",        code: "FR", pe: 13.1, pb: 1.9, divYield: 2.9, epsGrowth:  5.2, region: "Europe",      type: "DM" },
  { country: "Canada",        code: "CA", pe: 14.2, pb: 2.0, divYield: 2.7, epsGrowth:  6.3, region: "Americas",    type: "DM" },
  { country: "Australia",     code: "AU", pe: 16.1, pb: 1.9, divYield: 4.1, epsGrowth:  5.8, region: "Asia-Pacific", type: "DM" },
  { country: "China",         code: "CN", pe:  9.8, pb: 1.1, divYield: 3.1, epsGrowth:  6.9, region: "Asia",        type: "EM" },
  { country: "India",         code: "IN", pe: 22.7, pb: 3.4, divYield: 1.2, epsGrowth: 15.6, region: "Asia",        type: "EM" },
  { country: "Brazil",        code: "BR", pe:  8.4, pb: 1.4, divYield: 6.2, epsGrowth:  7.1, region: "Americas",    type: "EM" },
  { country: "South Korea",   code: "KR", pe: 11.2, pb: 1.0, divYield: 1.9, epsGrowth:  9.8, region: "Asia",        type: "EM" },
  { country: "Taiwan",        code: "TW", pe: 17.3, pb: 2.4, divYield: 3.4, epsGrowth: 18.2, region: "Asia",        type: "EM" },
  { country: "Mexico",        code: "MX", pe:  9.1, pb: 1.7, divYield: 4.8, epsGrowth:  5.4, region: "Americas",    type: "EM" },
  { country: "South Africa",  code: "ZA", pe:  8.9, pb: 1.3, divYield: 5.1, epsGrowth:  3.2, region: "Africa",      type: "EM" },
];

const COUNTRY_PROFILES: CountryProfile[] = [
  {
    name: "United States", code: "US", flag: "🇺🇸",
    marketCap: 47.2,
    topSectors: [
      { name: "Technology", weight: 29.8 },
      { name: "Financials", weight: 13.1 },
      { name: "Healthcare", weight: 12.4 },
      { name: "Consumer Disc.", weight: 10.7 },
      { name: "Industrials", weight: 8.9 },
    ],
    topStocks: [
      { ticker: "AAPL",  name: "Apple Inc.",         weight: 7.1 },
      { ticker: "MSFT",  name: "Microsoft Corp.",    weight: 6.8 },
      { ticker: "NVDA",  name: "NVIDIA Corp.",       weight: 5.4 },
      { ticker: "AMZN",  name: "Amazon.com Inc.",    weight: 3.8 },
      { ticker: "GOOGL", name: "Alphabet Inc.",      weight: 3.6 },
    ],
    politicalRisk: 2,
    currency: "USD",
    fxYtd: 0.0,
    gdpGrowth: 2.9,
    description: "World's largest equity market, tech-dominated with deep liquidity. Reserve currency status provides structural USD demand. AI-driven earnings growth driving premium valuations vs. historical averages.",
  },
  {
    name: "Japan", code: "JP", flag: "🇯🇵",
    marketCap: 6.1,
    topSectors: [
      { name: "Industrials", weight: 22.4 },
      { name: "Consumer Disc.", weight: 18.6 },
      { name: "Technology", weight: 15.3 },
      { name: "Financials", weight: 13.8 },
      { name: "Materials", weight: 9.1 },
    ],
    topStocks: [
      { ticker: "7203",  name: "Toyota Motor",       weight: 4.2 },
      { ticker: "6758",  name: "Sony Group",         weight: 3.1 },
      { ticker: "9984",  name: "SoftBank Group",     weight: 2.8 },
      { ticker: "8306",  name: "Mitsubishi UFJ",     weight: 2.5 },
      { ticker: "6861",  name: "Keyence Corp",       weight: 2.2 },
    ],
    politicalRisk: 2,
    currency: "JPY",
    fxYtd: -8.4,
    gdpGrowth: 0.9,
    description: "Corporate governance reforms and TSE pressure boosting ROE. Weak yen boosts exporters but erodes USD returns. BoJ policy normalization remains the key macro risk. Cheap valuations relative to history.",
  },
  {
    name: "China", code: "CN", flag: "🇨🇳",
    marketCap: 9.8,
    topSectors: [
      { name: "Financials", weight: 27.3 },
      { name: "Consumer Disc.", weight: 14.8 },
      { name: "Communication", weight: 12.1 },
      { name: "Industrials", weight: 11.4 },
      { name: "Real Estate", weight: 8.7 },
    ],
    topStocks: [
      { ticker: "BABA",  name: "Alibaba Group",      weight: 3.8 },
      { ticker: "TCEHY", name: "Tencent Holdings",   weight: 3.4 },
      { ticker: "601398","name": "ICBC",              weight: 2.9 },
      { ticker: "BIDU",  name: "Baidu Inc.",         weight: 2.1 },
      { ticker: "JD",    name: "JD.com Inc.",        weight: 1.8 },
    ],
    politicalRisk: 8,
    currency: "CNY",
    fxYtd: -1.2,
    gdpGrowth: 4.8,
    description: "Deeply discounted vs. peers due to regulatory uncertainty and geopolitical risk. Property sector deleveraging weighs on sentiment. Stimulus measures have had limited impact. Strong domestic consumption remains structural driver.",
  },
  {
    name: "India", code: "IN", flag: "🇮🇳",
    marketCap: 4.7,
    topSectors: [
      { name: "Financials", weight: 30.1 },
      { name: "Technology", weight: 16.4 },
      { name: "Consumer Stap.", weight: 8.9 },
      { name: "Energy", weight: 8.3 },
      { name: "Materials", weight: 7.6 },
    ],
    topStocks: [
      { ticker: "RELIANCE","name": "Reliance Industries", weight: 10.2 },
      { ticker: "INFY",  name: "Infosys Ltd.",        weight: 5.8 },
      { ticker: "TCS",   name: "Tata Consultancy",    weight: 5.4 },
      { ticker: "HDFCB", name: "HDFC Bank",           weight: 4.9 },
      { ticker: "ICICIBC","name": "ICICI Bank",        weight: 3.8 },
    ],
    politicalRisk: 4,
    currency: "INR",
    fxYtd: -1.8,
    gdpGrowth: 7.2,
    description: "Fastest growing large economy with demographic dividend. Manufacturing shift benefiting from China+1 strategy. Premium valuations reflect structural growth premium. Digital infrastructure investment driving productivity gains.",
  },
  {
    name: "Germany", code: "DE", flag: "🇩🇪",
    marketCap: 2.3,
    topSectors: [
      { name: "Industrials", weight: 24.7 },
      { name: "Consumer Disc.", weight: 19.3 },
      { name: "Financials", weight: 14.8 },
      { name: "Healthcare", weight: 11.2 },
      { name: "Materials", weight: 9.8 },
    ],
    topStocks: [
      { ticker: "SAP",   name: "SAP SE",             weight: 10.4 },
      { ticker: "SIE",   name: "Siemens AG",         weight: 8.7 },
      { ticker: "AIR",   name: "Airbus SE",          weight: 7.2 },
      { ticker: "DTE",   name: "Deutsche Telekom",   weight: 5.1 },
      { ticker: "ALV",   name: "Allianz SE",         weight: 4.8 },
    ],
    politicalRisk: 3,
    currency: "EUR",
    fxYtd: -0.9,
    gdpGrowth: 0.2,
    description: "Europe's largest economy facing structural headwinds from energy transition and auto sector disruption. Cheap valuations offer contrarian opportunity. Strong balance sheets and quality industrial franchises undervalued. Coalition politics adding uncertainty.",
  },
];

const CURRENCY_DATA: CurrencyData[] = [
  { country: "Japan",        currency: "JPY", localReturn: 12.7,  usdReturn: 4.3,  currencyEffect: -8.4, hedgeCost: 4.2, volatility: 8.1  },
  { country: "Germany/EU",   currency: "EUR", localReturn: 7.3,   usdReturn: 6.4,  currencyEffect: -0.9, hedgeCost: 1.8, volatility: 5.2  },
  { country: "UK",           currency: "GBP", localReturn: 1.8,   usdReturn: 3.0,  currencyEffect:  1.2, hedgeCost: 1.6, volatility: 5.8  },
  { country: "India",        currency: "INR", localReturn: 4.7,   usdReturn: 2.9,  currencyEffect: -1.8, hedgeCost: 5.6, volatility: 3.2  },
  { country: "Brazil",       currency: "BRL", localReturn: 1.4,   usdReturn: -3.2, currencyEffect: -4.6, hedgeCost: 7.8, volatility: 14.3 },
  { country: "China",        currency: "CNY", localReturn: -4.2,  usdReturn: -4.8, currencyEffect: -0.6, hedgeCost: 2.4, volatility: 2.8  },
  { country: "South Korea",  currency: "KRW", localReturn: 6.8,   usdReturn: 4.1,  currencyEffect: -2.7, hedgeCost: 3.1, volatility: 6.4  },
  { country: "Australia",    currency: "AUD", localReturn: 3.9,   usdReturn: 2.2,  currencyEffect: -1.7, hedgeCost: 2.1, volatility: 7.2  },
];

const EMGDM_DATA: EMDMData[] = [
  { name: "MSCI USA",          type: "DM", annualReturn: 14.2, volatility: 14.8, sharpe: 0.88, politicalRisk: 2,  govScore: 8.4, demographicScore: 6.2, riskPremium: 0.0  },
  { name: "MSCI Europe",       type: "DM", annualReturn:  8.3, volatility: 12.9, sharpe: 0.54, politicalRisk: 3,  govScore: 7.8, demographicScore: 4.1, riskPremium: 0.8  },
  { name: "MSCI Japan",        type: "DM", annualReturn:  9.1, volatility: 13.4, sharpe: 0.59, politicalRisk: 2,  govScore: 7.9, demographicScore: 2.8, riskPremium: 0.6  },
  { name: "MSCI Pacific ex-JP",type: "DM", annualReturn:  7.4, volatility: 11.8, sharpe: 0.51, politicalRisk: 3,  govScore: 7.4, demographicScore: 5.6, riskPremium: 1.1  },
  { name: "MSCI China",        type: "EM", annualReturn:  4.2, volatility: 22.1, sharpe: 0.14, politicalRisk: 8,  govScore: 4.1, demographicScore: 4.8, riskPremium: 5.4  },
  { name: "MSCI India",        type: "EM", annualReturn: 12.8, volatility: 18.3, sharpe: 0.61, politicalRisk: 4,  govScore: 5.8, demographicScore: 9.2, riskPremium: 3.2  },
  { name: "MSCI Brazil",       type: "EM", annualReturn:  6.1, volatility: 24.7, sharpe: 0.18, politicalRisk: 6,  govScore: 4.9, demographicScore: 6.8, riskPremium: 4.8  },
  { name: "MSCI EM Asia",      type: "EM", annualReturn:  9.4, volatility: 17.6, sharpe: 0.45, politicalRisk: 5,  govScore: 5.6, demographicScore: 7.4, riskPremium: 3.1  },
  { name: "MSCI EM EMEA",      type: "EM", annualReturn:  5.8, volatility: 19.2, sharpe: 0.21, politicalRisk: 6,  govScore: 4.8, demographicScore: 5.9, riskPremium: 4.2  },
  { name: "MSCI EM LatAm",     type: "EM", annualReturn:  7.3, volatility: 22.8, sharpe: 0.26, politicalRisk: 6,  govScore: 4.6, demographicScore: 7.1, riskPremium: 4.5  },
];

// ── Helper functions ──────────────────────────────────────────────────────────

const fmt = (n: number, decimals = 1) =>
  (n >= 0 ? "+" : "") + n.toFixed(decimals) + "%";

const fmtNoSign = (n: number, decimals = 1) => n.toFixed(decimals) + "%";

const ReturnBadge = ({ value }: { value: number }) => (
  <span
    className={cn(
      "text-xs font-semibold",
      value > 0 ? "text-emerald-400" : value < 0 ? "text-red-400" : "text-muted-foreground"
    )}
  >
    {value > 0 ? "+" : ""}{value.toFixed(1)}%
  </span>
);

const RiskBar = ({ value, max = 10 }: { value: number; max?: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          value <= 3 ? "bg-emerald-500" : value <= 6 ? "bg-amber-500" : "bg-red-500"
        )}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
    <span className="text-xs text-muted-foreground w-6 text-right">{value}/10</span>
  </div>
);

// ── Tab 1: Market Overview ────────────────────────────────────────────────────

function MarketOverviewTab() {
  const [sortKey, setSortKey] = useState<keyof IndexData>("ytd");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...INDICES].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [sortKey, sortDir]);

  const handleSort = (key: keyof IndexData) => {
    if (key === sortKey) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const maxAbsYtd = Math.max(...INDICES.map(i => Math.abs(i.ytd)));
  const maxFive   = Math.max(...INDICES.map(i => Math.abs(i.fiveYear)));

  const SortHeader = ({ label, k }: { label: string; k: keyof IndexData }) => (
    <th
      className="px-3 py-2 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap hover:text-foreground transition-colors"
      onClick={() => handleSort(k)}
    >
      {label} {sortKey === k ? (sortDir === "desc" ? "↓" : "↑") : ""}
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Best YTD", value: INDICES.reduce((a, b) => a.ytd > b.ytd ? a : b), color: "text-emerald-400" },
          { label: "Worst YTD", value: INDICES.reduce((a, b) => a.ytd < b.ytd ? a : b), color: "text-red-400" },
          { label: "Best 1Y", value: INDICES.reduce((a, b) => a.oneYear > b.oneYear ? a : b), color: "text-emerald-400" },
          { label: "Best 5Y", value: INDICES.reduce((a, b) => a.fiveYear > b.fiveYear ? a : b), color: "text-emerald-400" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="bg-card/60 border-border">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-sm font-semibold text-foreground">{value.name}</p>
              <p className={cn("text-lg font-bold", color)}>
                {label.includes("YTD")
                  ? fmt(value.ytd)
                  : label.includes("1Y")
                  ? fmt(value.oneYear)
                  : fmt(value.fiveYear)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Index table */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Major Global Indices
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <SortHeader label="Index" k="name" />
                  <SortHeader label="Region" k="region" />
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                  <SortHeader label="Level" k="level" />
                  <SortHeader label="YTD" k="ytd" />
                  <SortHeader label="1Y" k="oneYear" />
                  <SortHeader label="5Y" k="fiveYear" />
                  <SortHeader label="Currency" k="currency" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((idx, i) => (
                  <motion.tr
                    key={idx.ticker}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <div>
                        <p className="font-medium text-foreground">{idx.name}</p>
                        <p className="text-xs text-muted-foreground">{idx.ticker}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{idx.region}</td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          idx.type === "DM"
                            ? "border-border text-primary"
                            : "border-amber-700 text-amber-400"
                        )}
                      >
                        {idx.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-foreground">{idx.level.toLocaleString()}</td>
                    <td className="px-3 py-2.5"><ReturnBadge value={idx.ytd} /></td>
                    <td className="px-3 py-2.5"><ReturnBadge value={idx.oneYear} /></td>
                    <td className="px-3 py-2.5"><ReturnBadge value={idx.fiveYear} /></td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">{idx.currency}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* SVG Return Comparison Bar Chart */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            YTD Return Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 640 260" className="w-full" style={{ maxHeight: 280 }}>
            {INDICES.map((idx, i) => {
              const barMaxWidth = 240;
              const y = 20 + i * 26;
              const barW = Math.abs(idx.ytd) / maxAbsYtd * barMaxWidth;
              const positive = idx.ytd >= 0;
              const baseX = 220;
              return (
                <g key={idx.ticker}>
                  {/* Label */}
                  <text x={210} y={y + 11} textAnchor="end" fontSize={10} fill="#a1a1aa">{idx.name}</text>
                  {/* Zero line */}
                  <line x1={baseX} y1={y} x2={baseX} y2={y + 18} stroke="#3f3f46" strokeWidth={1} />
                  {/* Bar */}
                  <rect
                    x={positive ? baseX : baseX - barW}
                    y={y + 3}
                    width={barW}
                    height={12}
                    rx={2}
                    fill={positive ? "#10b981" : "#f87171"}
                    opacity={0.85}
                  />
                  {/* Value label */}
                  <text
                    x={positive ? baseX + barW + 4 : baseX - barW - 4}
                    y={y + 12}
                    textAnchor={positive ? "start" : "end"}
                    fontSize={10}
                    fill={positive ? "#6ee7b7" : "#fca5a5"}
                    fontWeight="600"
                  >
                    {fmt(idx.ytd)}
                  </text>
                </g>
              );
            })}
            {/* Y-axis divider */}
            <line x1={220} y1={10} x2={220} y2={254} stroke="#52525b" strokeWidth={1} strokeDasharray="3,3" />
            {/* 5Y bar chart on right side */}
            {INDICES.map((idx, i) => {
              const barMaxWidth = 140;
              const y = 20 + i * 26;
              const barW = Math.max(2, (idx.fiveYear < 0 ? 0 : idx.fiveYear) / maxFive * barMaxWidth);
              return (
                <g key={`5y-${idx.ticker}`}>
                  <rect
                    x={490}
                    y={y + 3}
                    width={barW}
                    height={12}
                    rx={2}
                    fill="#6366f1"
                    opacity={0.65}
                  />
                  <text x={490 + barW + 4} y={y + 12} fontSize={10} fill="#a5b4fc">
                    {idx.fiveYear.toFixed(0)}%
                  </text>
                </g>
              );
            })}
            {/* Legend */}
            <rect x={270} y={248} width={10} height={6} rx={1} fill="#10b981" />
            <text x={284} y={254} fontSize={9} fill="#71717a">YTD</text>
            <rect x={320} y={248} width={10} height={6} rx={1} fill="#6366f1" />
            <text x={334} y={254} fontSize={9} fill="#71717a">5-Year</text>
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 2: Valuation ──────────────────────────────────────────────────────────

function ValuationTab() {
  const [filterType, setFilterType] = useState<"all" | "DM" | "EM">("all");

  const filtered = useMemo(
    () => VALUATIONS.filter(v => filterType === "all" || v.type === filterType),
    [filterType]
  );

  const cheapest  = [...VALUATIONS].sort((a, b) => a.pe - b.pe).slice(0, 3);
  const expensive = [...VALUATIONS].sort((a, b) => b.pe - a.pe).slice(0, 3);

  // Scatter: P/E (x) vs EPS Growth (y)
  const scatterW = 580, scatterH = 220;
  const padX = 50, padY = 30;
  const chartW = scatterW - padX * 2;
  const chartH = scatterH - padY * 2;
  const peMin = 7, peMax = 25;
  const growthMin = 0, growthMax = 22;
  const toX = (pe: number) => padX + ((pe - peMin) / (peMax - peMin)) * chartW;
  const toY = (g: number) => scatterH - padY - ((g - growthMin) / (growthMax - growthMin)) * chartH;

  // Fair-value line: P/E = growth ratio (PEG=1)
  const fairLinePoints = [
    { pe: peMin, g: peMin },
    { pe: Math.min(growthMax, peMax), g: Math.min(growthMax, peMax) },
  ];

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-2">
        {(["all", "DM", "EM"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md border transition-colors",
              filterType === f
                ? "bg-primary border-primary text-foreground"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            )}
          >
            {f === "all" ? "All Markets" : f === "DM" ? "Developed" : "Emerging"}
          </button>
        ))}
      </div>

      {/* Cheap / Expensive panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Cheapest Markets (by P/E)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cheapest.map(v => (
              <div key={v.code} className="flex items-center justify-between py-1 border-b border-border/60 last:border-0">
                <div>
                  <span className="text-sm font-medium text-foreground">{v.country}</span>
                  <Badge variant="outline" className={cn("ml-2 text-xs", v.type === "EM" ? "border-amber-700 text-amber-400" : "border-border text-primary")}>{v.type}</Badge>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400">{v.pe.toFixed(1)}x</span>
                  <span className="text-xs text-muted-foreground ml-2">P/E</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Most Expensive Markets (by P/E)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expensive.map(v => (
              <div key={v.code} className="flex items-center justify-between py-1 border-b border-border/60 last:border-0">
                <div>
                  <span className="text-sm font-medium text-foreground">{v.country}</span>
                  <Badge variant="outline" className={cn("ml-2 text-xs", v.type === "EM" ? "border-amber-700 text-amber-400" : "border-border text-primary")}>{v.type}</Badge>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-red-400">{v.pe.toFixed(1)}x</span>
                  <span className="text-xs text-muted-foreground ml-2">P/E</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Valuation table */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Valuation Metrics by Market
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Country", "Type", "P/E", "P/B", "Div. Yield", "EPS Growth", "Region"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((v, i) => (
                    <motion.tr
                      key={v.code}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-3 py-2 font-medium text-foreground">{v.country}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={cn("text-xs", v.type === "EM" ? "border-amber-700 text-amber-400" : "border-border text-primary")}>{v.type}</Badge>
                      </td>
                      <td className={cn("px-3 py-2 font-medium", v.pe < 12 ? "text-emerald-400" : v.pe > 20 ? "text-red-400" : "text-foreground")}>{v.pe.toFixed(1)}x</td>
                      <td className="px-3 py-2 text-muted-foreground">{v.pb.toFixed(1)}x</td>
                      <td className="px-3 py-2 text-emerald-400">{fmtNoSign(v.divYield)}</td>
                      <td className={cn("px-3 py-2 font-medium", v.epsGrowth > 10 ? "text-emerald-400" : v.epsGrowth < 5 ? "text-amber-400" : "text-muted-foreground")}>{fmt(v.epsGrowth)}</td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">{v.region}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* SVG Scatter: P/E vs EPS Growth */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            P/E vs. EPS Growth (PEG Analysis)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${scatterW} ${scatterH}`} className="w-full" style={{ maxHeight: 260 }}>
            {/* Grid lines */}
            {[0, 5, 10, 15, 20].map(g => (
              <line key={`hg-${g}`} x1={padX} y1={toY(g)} x2={scatterW - padX} y2={toY(g)} stroke="#27272a" strokeWidth={1} />
            ))}
            {[8, 12, 16, 20, 24].map(p => (
              <line key={`vg-${p}`} x1={toX(p)} y1={padY} x2={toX(p)} y2={scatterH - padY} stroke="#27272a" strokeWidth={1} />
            ))}

            {/* PEG=1 fair value line */}
            <line
              x1={toX(fairLinePoints[0].pe)} y1={toY(fairLinePoints[0].g)}
              x2={toX(fairLinePoints[1].pe)} y2={toY(fairLinePoints[1].g)}
              stroke="#6366f1" strokeWidth={1} strokeDasharray="4,4" opacity={0.6}
            />
            <text x={toX(20)} y={toY(20) - 6} fontSize={9} fill="#818cf8" opacity={0.8}>PEG=1</text>

            {/* Axes */}
            <line x1={padX} y1={padY} x2={padX} y2={scatterH - padY} stroke="#52525b" strokeWidth={1} />
            <line x1={padX} y1={scatterH - padY} x2={scatterW - padX} y2={scatterH - padY} stroke="#52525b" strokeWidth={1} />

            {/* Axis labels */}
            <text x={scatterW / 2} y={scatterH - 4} textAnchor="middle" fontSize={10} fill="#71717a">P/E Ratio</text>
            <text x={12} y={scatterH / 2} textAnchor="middle" fontSize={10} fill="#71717a" transform={`rotate(-90, 12, ${scatterH / 2})`}>EPS Growth %</text>

            {/* Tick labels */}
            {[8, 12, 16, 20, 24].map(p => (
              <text key={p} x={toX(p)} y={scatterH - padY + 14} textAnchor="middle" fontSize={9} fill="#71717a">{p}x</text>
            ))}
            {[0, 5, 10, 15, 20].map(g => (
              <text key={g} x={padX - 6} y={toY(g) + 4} textAnchor="end" fontSize={9} fill="#71717a">{g}%</text>
            ))}

            {/* Data points */}
            {VALUATIONS.map(v => {
              const cx = toX(v.pe);
              const cy = toY(v.epsGrowth);
              const isDM = v.type === "DM";
              const peg = v.pe / v.epsGrowth;
              const fill = peg < 1 ? "#10b981" : peg > 2 ? "#f87171" : isDM ? "#60a5fa" : "#fbbf24";
              return (
                <g key={v.code}>
                  <circle cx={cx} cy={cy} r={6} fill={fill} opacity={0.8} />
                  <text x={cx + 8} y={cy + 4} fontSize={8} fill="#a1a1aa">{v.code}</text>
                </g>
              );
            })}

            {/* Legend */}
            <circle cx={410} cy={210} r={5} fill="#10b981" />
            <text x={418} y={214} fontSize={9} fill="#71717a">PEG &lt; 1 (Value)</text>
            <circle cx={500} cy={210} r={5} fill="#f87171" />
            <text x={508} y={214} fontSize={9} fill="#71717a">PEG &gt; 2 (Expensive)</text>
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: Country Deep Dives ─────────────────────────────────────────────────

function CountryDeepDivesTab() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_PROFILES[0].code);
  const profile = COUNTRY_PROFILES.find(c => c.code === selectedCountry) ?? COUNTRY_PROFILES[0];

  const maxSectorW = Math.max(...profile.topSectors.map(s => s.weight));

  return (
    <div className="space-y-4">
      {/* Country selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {COUNTRY_PROFILES.map(c => (
          <button
            key={c.code}
            onClick={() => setSelectedCountry(c.code)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all",
              selectedCountry === c.code
                ? "bg-primary/20 border-primary text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            )}
          >
            <span>{c.flag}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCountry}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* Left: Market overview */}
          <div className="space-y-4">
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="text-xl">{profile.flag}</span>
                  {profile.name} — Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">Market Cap</p>
                    <p className="text-base font-medium text-foreground">${profile.marketCap}T</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">GDP Growth</p>
                    <p className={cn("text-base font-medium", profile.gdpGrowth > 3 ? "text-emerald-400" : profile.gdpGrowth > 1 ? "text-foreground" : "text-amber-400")}>
                      {fmt(profile.gdpGrowth)}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">FX YTD</p>
                    <p className={cn("text-base font-medium", profile.fxYtd >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {fmt(profile.fxYtd)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Political Risk</p>
                  <RiskBar value={profile.politicalRisk} />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Currency: <span className="text-muted-foreground font-medium">{profile.currency}</span></p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{profile.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Top stocks */}
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Holdings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile.topStocks.map((stk, i) => (
                  <div key={stk.ticker} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-3">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-primary">{stk.ticker}</span>
                        <span className="text-xs text-muted-foreground">{stk.weight.toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{stk.name}</p>
                      <div className="mt-0.5 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary/50 rounded-full" style={{ width: `${(stk.weight / 12) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Sectors SVG */}
          <Card className="bg-card/60 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sector Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <svg viewBox="0 0 340 200" className="w-full" style={{ maxHeight: 220 }}>
                {profile.topSectors.map((sec, i) => {
                  const y = 16 + i * 34;
                  const barMax = 240;
                  const barW = (sec.weight / maxSectorW) * barMax;
                  const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
                  return (
                    <g key={sec.name}>
                      <text x={0} y={y + 11} fontSize={10} fill="#a1a1aa">{sec.name}</text>
                      <rect x={100} y={y} width={barW} height={16} rx={3} fill={colors[i % colors.length]} opacity={0.75} />
                      <text x={100 + barW + 4} y={y + 11} fontSize={10} fill="#d4d4d8" fontWeight="600">{sec.weight.toFixed(1)}%</text>
                    </g>
                  );
                })}
              </svg>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Tab 4: Currency Impact ─────────────────────────────────────────────────────

function CurrencyImpactTab() {
  return (
    <div className="space-y-6">
      {/* Summary chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Largest Currency Drag",  val: "JPY -8.4%", color: "text-red-400" },
          { label: "Best Currency Tailwind", val: "GBP +1.2%", color: "text-emerald-400" },
          { label: "Most Volatile FX",       val: "BRL 14.3%", color: "text-amber-400" },
          { label: "Highest Hedge Cost",     val: "BRL 7.8%",  color: "text-orange-400" },
        ].map(c => (
          <Card key={c.label} className="bg-card/60 border-border">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className={cn("text-base font-medium mt-1", c.color)}>{c.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main currency table */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Local vs. USD Returns (US Investor Perspective)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Country", "Currency", "Local Return", "USD Return", "FX Effect", "Hedge Cost/yr", "FX Volatility"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CURRENCY_DATA.map((row, i) => (
                  <motion.tr
                    key={row.currency}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-medium text-foreground">{row.country}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className="border-border text-muted-foreground text-xs">{row.currency}</Badge>
                    </td>
                    <td className="px-3 py-2.5"><ReturnBadge value={row.localReturn} /></td>
                    <td className="px-3 py-2.5"><ReturnBadge value={row.usdReturn} /></td>
                    <td className="px-3 py-2.5">
                      <span className={cn("text-xs font-medium", row.currencyEffect > 0 ? "text-emerald-400" : "text-red-400")}>
                        {fmt(row.currencyEffect)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-amber-400 text-xs">{fmtNoSign(row.hedgeCost)}</td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">{fmtNoSign(row.volatility)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* SVG: Currency Volatility vs Hedge Cost */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            FX Volatility vs. Hedge Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const svgW = 580, svgH = 220;
            const padX = 55, padY = 28;
            const cW = svgW - padX * 2;
            const cH = svgH - padY * 2;
            const volMin = 0, volMax = 16;
            const hcMin = 0, hcMax = 9;
            const toX = (v: number) => padX + ((v - volMin) / (volMax - volMin)) * cW;
            const toY = (h: number) => svgH - padY - ((h - hcMin) / (hcMax - hcMin)) * cH;
            const colors = ["#f59e0b", "#6366f1", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#0ea5e9", "#a3e635"];

            return (
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 260 }}>
                {/* Grid */}
                {[0, 3, 6, 9, 12, 15].map(v => (
                  <line key={`vx-${v}`} x1={toX(v)} y1={padY} x2={toX(v)} y2={svgH - padY} stroke="#27272a" strokeWidth={1} />
                ))}
                {[0, 2, 4, 6, 8].map(h => (
                  <line key={`hy-${h}`} x1={padX} y1={toY(h)} x2={svgW - padX} y2={toY(h)} stroke="#27272a" strokeWidth={1} />
                ))}

                {/* Axes */}
                <line x1={padX} y1={padY} x2={padX} y2={svgH - padY} stroke="#52525b" strokeWidth={1} />
                <line x1={padX} y1={svgH - padY} x2={svgW - padX} y2={svgH - padY} stroke="#52525b" strokeWidth={1} />

                {/* Labels */}
                <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fontSize={10} fill="#71717a">FX Volatility (annualized %)</text>
                <text x={14} y={svgH / 2} textAnchor="middle" fontSize={10} fill="#71717a" transform={`rotate(-90, 14, ${svgH / 2})`}>Hedge Cost (%/yr)</text>

                {/* Tick labels */}
                {[0, 3, 6, 9, 12, 15].map(v => (
                  <text key={v} x={toX(v)} y={svgH - padY + 14} textAnchor="middle" fontSize={9} fill="#71717a">{v}%</text>
                ))}
                {[0, 2, 4, 6, 8].map(h => (
                  <text key={h} x={padX - 6} y={toY(h) + 4} textAnchor="end" fontSize={9} fill="#71717a">{h}%</text>
                ))}

                {/* Points */}
                {CURRENCY_DATA.map((row, i) => {
                  const cx = toX(row.volatility);
                  const cy = toY(row.hedgeCost);
                  return (
                    <g key={row.currency}>
                      <circle cx={cx} cy={cy} r={7} fill={colors[i % colors.length]} opacity={0.85} />
                      <text x={cx + 9} y={cy + 4} fontSize={9} fill="#d4d4d8">{row.currency}</text>
                    </g>
                  );
                })}

                {/* Annotation: inefficient zone */}
                <rect x={toX(10)} y={toY(9)} width={toX(16) - toX(10)} height={toY(4) - toY(9)} rx={3} fill="#ef4444" opacity={0.07} />
                <text x={toX(12.5)} y={toY(8.5) + 10} textAnchor="middle" fontSize={9} fill="#f87171" opacity={0.7}>High cost / high vol</text>
              </svg>
            );
          })()}
        </CardContent>
      </Card>

      {/* Hedging explainer */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Hedging Decision Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Hedge When",
                color: "text-emerald-400 border-emerald-900/50 bg-emerald-950/20",
                points: [
                  "Hedge cost < FX volatility × 0.5",
                  "Currency in structural decline",
                  "Short investment horizon < 3yr",
                  "High-frequency income needed",
                ],
              },
              {
                title: "Don't Hedge When",
                color: "text-amber-400 border-amber-900/50 bg-amber-950/20",
                points: [
                  "Hedge cost > expected return drag",
                  "Currency historically mean-reverting",
                  "Long-term buy-and-hold portfolio",
                  "Natural offset from home currency",
                ],
              },
              {
                title: "Partial Hedge Strategy",
                color: "text-primary border-border bg-muted/30",
                points: [
                  "Hedge 50% as default baseline",
                  "Adjust based on momentum signals",
                  "Use options for convex protection",
                  "Revisit quarterly based on rate diffs",
                ],
              },
            ].map(sec => (
              <div key={sec.title} className={cn("rounded-lg border p-3", sec.color)}>
                <p className={cn("text-xs font-medium mb-2", sec.color.split(" ")[0])}>{sec.title}</p>
                <ul className="space-y-1">
                  {sec.points.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Minus className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 5: EM vs DM ───────────────────────────────────────────────────────────

function EMvsDMTab() {
  const dmAvgReturn = EMGDM_DATA.filter(d => d.type === "DM").reduce((s, d) => s + d.annualReturn, 0) / EMGDM_DATA.filter(d => d.type === "DM").length;
  const emAvgReturn = EMGDM_DATA.filter(d => d.type === "EM").reduce((s, d) => s + d.annualReturn, 0) / EMGDM_DATA.filter(d => d.type === "EM").length;
  const dmAvgVol    = EMGDM_DATA.filter(d => d.type === "DM").reduce((s, d) => s + d.volatility, 0)   / EMGDM_DATA.filter(d => d.type === "DM").length;
  const emAvgVol    = EMGDM_DATA.filter(d => d.type === "EM").reduce((s, d) => s + d.volatility, 0)   / EMGDM_DATA.filter(d => d.type === "EM").length;

  const svgW = 580, svgH = 240;
  const padX = 55, padY = 30;
  const cW = svgW - padX * 2;
  const cH = svgH - padY * 2;
  const volMin = 10, volMax = 27;
  const retMin = 3, retMax = 17;
  const toX = (v: number) => padX + ((v - volMin) / (volMax - volMin)) * cW;
  const toY = (r: number) => svgH - padY - ((r - retMin) / (retMax - retMin)) * cH;

  const factors = [
    { name: "Governance Quality",    dmScore: 7.9, emScore: 5.1, insight: "DM markets have stronger rule of law, minority shareholder protections, and regulatory stability." },
    { name: "Demographic Dividend",  dmScore: 4.2, emScore: 7.6, insight: "EM countries benefit from younger populations, rising middle class, and urbanization tailwinds." },
    { name: "Political Stability",   dmScore: 7.5, emScore: 4.6, insight: "DM markets have predictable policy regimes; EM faces election risk, populism, and institutional flux." },
    { name: "Innovation Capacity",   dmScore: 7.1, emScore: 5.4, insight: "DM leads in R&D and IP; EM increasingly competitive in tech (India IT, China AI, Korea chips)." },
    { name: "Valuation",             dmScore: 4.8, emScore: 7.2, insight: "EM trades at steep discount to history and DM; potentially the largest valuation mispricing in decades." },
    { name: "Liquidity",             dmScore: 8.2, emScore: 5.0, insight: "DM markets offer deep secondary liquidity; EM bid/ask spreads and market access remain constraints." },
  ];

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "DM Avg Return", val: dmAvgReturn.toFixed(1) + "%", color: "text-primary" },
          { label: "EM Avg Return", val: emAvgReturn.toFixed(1) + "%", color: "text-amber-400" },
          { label: "DM Avg Volatility", val: dmAvgVol.toFixed(1) + "%", color: "text-primary" },
          { label: "EM Avg Volatility", val: emAvgVol.toFixed(1) + "%", color: "text-amber-400" },
        ].map(c => (
          <Card key={c.label} className="bg-card/60 border-border">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className={cn("text-xl font-medium mt-1", c.color)}>{c.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk/Return Scatter */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Risk / Return Scatter — EM vs DM (10-Year Annualized)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 270 }}>
            {/* Grid */}
            {[12, 15, 18, 21, 24].map(v => (
              <line key={`vgx-${v}`} x1={toX(v)} y1={padY} x2={toX(v)} y2={svgH - padY} stroke="#27272a" strokeWidth={1} />
            ))}
            {[4, 7, 10, 13, 16].map(r => (
              <line key={`hgy-${r}`} x1={padX} y1={toY(r)} x2={svgW - padX} y2={toY(r)} stroke="#27272a" strokeWidth={1} />
            ))}

            {/* Capital market line (approximate) */}
            <line x1={toX(11)} y1={toY(6)} x2={toX(26)} y2={toY(16)} stroke="#6366f1" strokeWidth={1} strokeDasharray="4,4" opacity={0.4} />

            {/* Axes */}
            <line x1={padX} y1={padY} x2={padX} y2={svgH - padY} stroke="#52525b" strokeWidth={1} />
            <line x1={padX} y1={svgH - padY} x2={svgW - padX} y2={svgH - padY} stroke="#52525b" strokeWidth={1} />

            {/* Axis labels */}
            <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fontSize={10} fill="#71717a">Volatility (annualized %)</text>
            <text x={14} y={svgH / 2} textAnchor="middle" fontSize={10} fill="#71717a" transform={`rotate(-90, 14, ${svgH / 2})`}>Annual Return (%)</text>

            {/* Tick labels */}
            {[12, 15, 18, 21, 24].map(v => (
              <text key={v} x={toX(v)} y={svgH - padY + 14} textAnchor="middle" fontSize={9} fill="#71717a">{v}%</text>
            ))}
            {[4, 7, 10, 13, 16].map(r => (
              <text key={r} x={padX - 6} y={toY(r) + 4} textAnchor="end" fontSize={9} fill="#71717a">{r}%</text>
            ))}

            {/* Data points */}
            {EMGDM_DATA.map((d) => {
              const cx = toX(d.volatility);
              const cy = toY(d.annualReturn);
              const isDM = d.type === "DM";
              return (
                <g key={d.name}>
                  <circle cx={cx} cy={cy} r={8} fill={isDM ? "#60a5fa" : "#fbbf24"} opacity={0.8} />
                  <text x={cx + 10} y={cy + 4} fontSize={8} fill="#e4e4e7">{d.name.replace("MSCI ", "")}</text>
                </g>
              );
            })}

            {/* Legend */}
            <circle cx={400} cy={svgH - 14} r={6} fill="#60a5fa" />
            <text x={410} y={svgH - 10} fontSize={9} fill="#71717a">Developed Markets</text>
            <circle cx={500} cy={svgH - 14} r={6} fill="#fbbf24" />
            <text x={510} y={svgH - 10} fontSize={9} fill="#71717a">Emerging Markets</text>
          </svg>
        </CardContent>
      </Card>

      {/* Factor comparison */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            EM vs. DM: Key Factor Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {factors.map(f => (
            <div key={f.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{f.name}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-primary">DM {f.dmScore.toFixed(1)}</span>
                  <span className="text-amber-400">EM {f.emScore.toFixed(1)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 rounded-full bg-muted flex-1 overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-full" style={{ width: `${(f.dmScore / 10) * 100}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 rounded-full bg-muted flex-1 overflow-hidden">
                    <div className="h-full bg-amber-500/70 rounded-full" style={{ width: `${(f.emScore / 10) * 100}%` }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.insight}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* EM data table */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Detailed Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Market", "Type", "10Y Return", "Volatility", "Sharpe", "Pol. Risk", "Gov. Score", "Demog. Score", "Risk Premium"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EMGDM_DATA.map((d, i) => (
                  <motion.tr
                    key={d.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{d.name}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={cn("text-xs", d.type === "EM" ? "border-amber-700 text-amber-400" : "border-border text-primary")}>{d.type}</Badge>
                    </td>
                    <td className="px-3 py-2"><ReturnBadge value={d.annualReturn} /></td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">{fmtNoSign(d.volatility)}</td>
                    <td className={cn("px-3 py-2 text-xs font-medium", d.sharpe > 0.6 ? "text-emerald-400" : d.sharpe > 0.3 ? "text-muted-foreground" : "text-amber-400")}>
                      {d.sharpe.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <RiskBar value={d.politicalRisk} />
                    </td>
                    <td className={cn("px-3 py-2 text-xs", d.govScore > 7 ? "text-emerald-400" : d.govScore > 5 ? "text-muted-foreground" : "text-amber-400")}>
                      {d.govScore.toFixed(1)}
                    </td>
                    <td className={cn("px-3 py-2 text-xs", d.demographicScore > 7 ? "text-emerald-400" : d.demographicScore > 5 ? "text-muted-foreground" : "text-red-400")}>
                      {d.demographicScore.toFixed(1)}
                    </td>
                    <td className={cn("px-3 py-2 text-xs font-medium", d.riskPremium > 3 ? "text-amber-400" : "text-primary")}>
                      {d.riskPremium > 0 ? "+" : ""}{d.riskPremium.toFixed(1)}%
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GlobalEquityPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-medium text-foreground">Global Equity Markets</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            International equity analysis — country comparisons, valuations, currency impact, and EM vs DM dynamics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-border text-primary text-xs">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            DM Neutral
          </Badge>
          <Badge variant="outline" className="border-amber-700 text-amber-400 text-xs">
            <ArrowDownRight className="w-3 h-3 mr-1" />
            EM Underweight
          </Badge>
        </div>
      </div>

      {/* Key stat chips — Hero */}
      <div className="border-l-4 border-l-primary rounded-lg bg-card p-6 flex flex-wrap gap-2">
        {[
          { label: "Global Mkt Cap", val: "$108T", icon: Globe },
          { label: "US Dominance", val: "43.7%", icon: TrendingUp },
          { label: "EM Share", val: "12.4%", icon: Activity },
          { label: "Avg. Global P/E", val: "16.2x", icon: BarChart2 },
          { label: "Avg. Div Yield", val: "2.8%", icon: DollarSign },
        ].map(({ label, val, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2 bg-card/60 border border-border rounded-lg px-3 py-1.5">
            <Icon className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium text-foreground">{val}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mt-8 space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview"   className="data-[state=active]:bg-muted text-xs">Market Overview</TabsTrigger>
          <TabsTrigger value="valuation"  className="data-[state=active]:bg-muted text-xs">Valuation</TabsTrigger>
          <TabsTrigger value="countries"  className="data-[state=active]:bg-muted text-xs">Country Deep Dives</TabsTrigger>
          <TabsTrigger value="currency"   className="data-[state=active]:bg-muted text-xs">Currency Impact</TabsTrigger>
          <TabsTrigger value="emdm"       className="data-[state=active]:bg-muted text-xs">EM vs DM</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"  className="data-[state=inactive]:hidden mt-0"><MarketOverviewTab /></TabsContent>
        <TabsContent value="valuation" className="data-[state=inactive]:hidden mt-0"><ValuationTab /></TabsContent>
        <TabsContent value="countries" className="data-[state=inactive]:hidden mt-0"><CountryDeepDivesTab /></TabsContent>
        <TabsContent value="currency"  className="data-[state=inactive]:hidden mt-0"><CurrencyImpactTab /></TabsContent>
        <TabsContent value="emdm"      className="data-[state=inactive]:hidden mt-0"><EMvsDMTab /></TabsContent>
      </Tabs>
    </div>
  );
}
