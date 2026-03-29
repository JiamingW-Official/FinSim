"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  DollarSign,
  Activity,
  Layers,
  Target,
  ShieldAlert,
  Globe,
  Zap,
  Building2,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 37;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 37;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Strategy {
  id: string;
  name: string;
  description: string;
  grossLeverage: string;
  netExposure: string;
  sharpe: number;
  spCorr: number;
  bestEnv: string;
  worstEnv: string;
  aum: number; // $B
  color: string;
  returns: Record<string, number>;
  x: number; // risk (vol)
  y: number; // return
}

interface LongPosition {
  ticker: string;
  name: string;
  shares: number;
  entryPrice: number;
  currentPrice: number;
  beta: number;
  sector: string;
}

interface ShortPosition {
  ticker: string;
  name: string;
  shares: number;
  entryPrice: number;
  currentPrice: number;
  beta: number;
}

interface MacroTheme {
  id: string;
  name: string;
  category: "rates" | "fx" | "commodities" | "equities";
  thesis: string;
  instrument: string;
  entry: number;
  target: number;
  stop: number;
  current: number;
  size: number;
  unit: string;
}

interface Deal {
  acquirer: string;
  target: string;
  offerPrice: number;
  currentPrice: number;
  daysToClose: number;
  dealType: string;
  dealSize: string;
  status: string;
}

interface TrendMarket {
  name: string;
  asset: string;
  momentum12m: number;
  signal: "strong_long" | "long" | "neutral" | "short" | "strong_short";
  vol: number;
  targetVol: number;
  size: number;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const STRATEGIES: Strategy[] = [
  {
    id: "ls_equity",
    name: "L/S Equity",
    description:
      "Long high-quality, short weak businesses. Alpha from stock selection on both sides.",
    grossLeverage: "150–250%",
    netExposure: "20–60%",
    sharpe: 0.85,
    spCorr: 0.62,
    bestEnv: "High dispersion, stock-picker markets",
    worstEnv: "Low vol, correlated macro risk-off",
    aum: 890,
    color: "#6366f1",
    returns: { "2019": 18.4, "2020": 22.1, "2021": 14.7, "2022": -8.2, "2023": 16.3 },
    x: 9.2,
    y: 12.7,
  },
  {
    id: "global_macro",
    name: "Global Macro",
    description:
      "Top-down macro themes across rates, FX, equities, commodities. Highly discretionary.",
    grossLeverage: "300–600%",
    netExposure: "Variable",
    sharpe: 0.72,
    spCorr: 0.18,
    bestEnv: "High macro volatility, regime shifts",
    worstEnv: "Low vol, range-bound markets",
    aum: 540,
    color: "#10b981",
    returns: { "2019": 8.6, "2020": 28.4, "2021": 5.2, "2022": 19.8, "2023": 4.1 },
    x: 11.4,
    y: 13.2,
  },
  {
    id: "event_driven",
    name: "Event Driven",
    description:
      "Corporate events: M&A, spin-offs, restructurings, bankruptcies. Catalyst-oriented.",
    grossLeverage: "120–200%",
    netExposure: "40–70%",
    sharpe: 0.78,
    spCorr: 0.54,
    bestEnv: "High M&A activity, credit market stability",
    worstEnv: "Credit stress, deal breaks, M&A drought",
    aum: 310,
    color: "#f59e0b",
    returns: { "2019": 16.2, "2020": 8.7, "2021": 19.3, "2022": -5.1, "2023": 12.8 },
    x: 8.4,
    y: 10.4,
  },
  {
    id: "merger_arb",
    name: "Merger Arb",
    description:
      "Capture deal spreads in announced M&A. Returns driven by deal completion probability.",
    grossLeverage: "200–400%",
    netExposure: "60–90%",
    sharpe: 0.91,
    spCorr: 0.42,
    bestEnv: "Strong deal flow, low regulatory risk",
    worstEnv: "Anti-trust crackdown, credit freeze",
    aum: 120,
    color: "#06b6d4",
    returns: { "2019": 7.8, "2020": 2.4, "2021": 8.6, "2022": 3.2, "2023": 9.1 },
    x: 4.8,
    y: 6.2,
  },
  {
    id: "distressed",
    name: "Distressed",
    description:
      "Debt of companies in financial distress or bankruptcy. Deep value with legal complexity.",
    grossLeverage: "100–150%",
    netExposure: "60–100%",
    sharpe: 0.64,
    spCorr: 0.48,
    bestEnv: "Credit cycle trough, post-default value",
    worstEnv: "Zero-rate environment, tight credit spreads",
    aum: 180,
    color: "#ef4444",
    returns: { "2019": 12.4, "2020": 14.8, "2021": 21.6, "2022": -12.7, "2023": 8.9 },
    x: 13.6,
    y: 9.0,
  },
  {
    id: "cta",
    name: "CTA / Managed Futures",
    description:
      "Systematic trend following across futures: equities, bonds, FX, commodities.",
    grossLeverage: "400–1000%",
    netExposure: "Variable",
    sharpe: 0.68,
    spCorr: -0.12,
    bestEnv: "Trending markets, equity bear markets",
    worstEnv: "Mean-reverting, choppy markets",
    aum: 420,
    color: "#8b5cf6",
    returns: { "2019": 9.3, "2020": 11.7, "2021": -2.4, "2022": 25.2, "2023": -1.8 },
    x: 14.2,
    y: 8.4,
  },
  {
    id: "stat_arb",
    name: "Stat Arb",
    description:
      "Quantitative mean-reversion of equity pairs and factor portfolios. High turnover.",
    grossLeverage: "400–800%",
    netExposure: "±10%",
    sharpe: 1.24,
    spCorr: 0.08,
    bestEnv: "Mean-reverting, high dispersion",
    worstEnv: "Momentum crashes, factor crowding",
    aum: 95,
    color: "#ec4899",
    returns: { "2019": 11.2, "2020": 6.8, "2021": 8.4, "2022": 4.6, "2023": 10.7 },
    x: 5.6,
    y: 8.3,
  },
  {
    id: "multi_strat",
    name: "Multi-Strategy",
    description:
      "Allocates across pods covering L/S, macro, arb, credit. Dynamic capital allocation.",
    grossLeverage: "500–1200%",
    netExposure: "±20%",
    sharpe: 1.42,
    spCorr: 0.31,
    bestEnv: "Any environment — diversification engine",
    worstEnv: "Simultaneous pod losses, liquidity crises",
    aum: 1850,
    color: "#14b8a6",
    returns: { "2019": 14.8, "2020": 15.2, "2021": 13.6, "2022": 6.4, "2023": 14.1 },
    x: 7.2,
    y: 12.8,
  },
  {
    id: "rv_fi",
    name: "RV Fixed Income",
    description:
      "Relative value between bonds, rates instruments, swap spreads. Highly leveraged convergence.",
    grossLeverage: "1000–3000%",
    netExposure: "Near 0%",
    sharpe: 1.08,
    spCorr: -0.04,
    bestEnv: "Yield curve normalization, ample liquidity",
    worstEnv: "Flight to quality, repo market stress",
    aum: 220,
    color: "#f97316",
    returns: { "2019": 8.4, "2020": -4.2, "2021": 5.8, "2022": 7.2, "2023": 9.6 },
    x: 6.4,
    y: 7.4,
  },
  {
    id: "conv_arb",
    name: "Convertible Arb",
    description:
      "Long convertible bonds, hedge equity delta, capture embedded option mispricing.",
    grossLeverage: "300–500%",
    netExposure: "±15%",
    sharpe: 0.96,
    spCorr: 0.36,
    bestEnv: "Volatility expansion, new issuance growth",
    worstEnv: "Credit spread widening, vol collapse",
    aum: 85,
    color: "#a855f7",
    returns: { "2019": 13.6, "2020": 18.2, "2021": 9.8, "2022": -9.4, "2023": 11.2 },
    x: 8.8,
    y: 10.5,
  },
];

const LONG_POSITIONS: LongPosition[] = [
  { ticker: "AAPL", name: "Apple", shares: 5000, entryPrice: 164.2, currentPrice: 187.4, beta: 1.18, sector: "Tech" },
  { ticker: "MSFT", name: "Microsoft", shares: 3000, entryPrice: 328.6, currentPrice: 374.2, beta: 0.91, sector: "Tech" },
  { ticker: "NVDA", name: "NVIDIA", shares: 1500, entryPrice: 412.8, currentPrice: 621.4, beta: 1.72, sector: "Tech" },
  { ticker: "AMZN", name: "Amazon", shares: 2500, entryPrice: 178.4, currentPrice: 196.8, beta: 1.26, sector: "Consumer" },
  { ticker: "META", name: "Meta", shares: 1800, entryPrice: 298.4, currentPrice: 361.2, beta: 1.38, sector: "Tech" },
  { ticker: "JPM", name: "JPMorgan", shares: 4200, entryPrice: 178.6, currentPrice: 204.8, beta: 1.09, sector: "Financials" },
  { ticker: "UNH", name: "UnitedHealth", shares: 600, entryPrice: 486.2, currentPrice: 527.4, beta: 0.72, sector: "Healthcare" },
  { ticker: "BRK.B", name: "Berkshire B", shares: 2100, entryPrice: 348.4, currentPrice: 378.6, beta: 0.86, sector: "Financials" },
  { ticker: "LLY", name: "Eli Lilly", shares: 800, entryPrice: 628.4, currentPrice: 764.2, beta: 0.54, sector: "Healthcare" },
  { ticker: "AVGO", name: "Broadcom", shares: 1200, entryPrice: 924.6, currentPrice: 1142.8, beta: 1.48, sector: "Tech" },
];

const SHORT_POSITIONS: ShortPosition[] = [
  { ticker: "INTC", name: "Intel", shares: 8000, entryPrice: 42.8, currentPrice: 38.4, beta: 1.02 },
  { ticker: "WBA", name: "Walgreens", shares: 12000, entryPrice: 18.6, currentPrice: 14.2, beta: 0.68 },
  { ticker: "MPW", name: "Medical Props", shares: 25000, entryPrice: 6.8, currentPrice: 4.6, beta: 1.24 },
  { ticker: "PARA", name: "Paramount", shares: 15000, entryPrice: 12.4, currentPrice: 10.8, beta: 1.42 },
  { ticker: "CVS", name: "CVS Health", shares: 5000, entryPrice: 72.4, currentPrice: 68.2, beta: 0.78 },
];

const MACRO_THEMES: MacroTheme[] = [
  {
    id: "us_rates",
    name: "US Rates — Duration Long",
    category: "rates",
    thesis: "Fed cuts faster than market expects as labor market softens. 2Y yields fall 100bps over 12 months.",
    instrument: "2Y UST / TLT",
    entry: 4.82,
    target: 3.75,
    stop: 5.20,
    current: 4.48,
    size: 250,
    unit: "%",
  },
  {
    id: "eurusd",
    name: "EUR/USD — Long Euro",
    category: "fx",
    thesis: "ECB holds rates higher-for-longer while Fed pivots. EUR/USD convergence trade as rate differential compresses.",
    instrument: "EUR/USD futures",
    entry: 1.0720,
    target: 1.1200,
    stop: 1.0480,
    current: 1.0948,
    size: 150,
    unit: "",
  },
  {
    id: "gold",
    name: "Gold — Structural Long",
    category: "commodities",
    thesis: "De-dollarization, central bank buying, negative real rates on horizon. Gold outperforms in soft-landing scenario.",
    instrument: "GLD / GC futures",
    entry: 1980,
    target: 2400,
    stop: 1850,
    current: 2142,
    size: 120,
    unit: "$",
  },
  {
    id: "em_equities",
    name: "EM Equities — China Re-rating",
    category: "equities",
    thesis: "China stimulus finally transmits to equity valuations. MSCI EM at 11x P/E vs 20x for S&P — asymmetric upside.",
    instrument: "FXI / MCHI",
    entry: 24.8,
    target: 34.0,
    stop: 21.5,
    current: 27.4,
    size: 180,
    unit: "$",
  },
];

const DEALS: Deal[] = [
  { acquirer: "Microsoft", target: "Activision Blizzard", offerPrice: 95.00, currentPrice: 93.84, daysToClose: 8, dealType: "Cash", dealSize: "$68.7B", status: "Regulatory Approved" },
  { acquirer: "Pfizer", target: "Seagen", offerPrice: 229.00, currentPrice: 225.40, daysToClose: 22, dealType: "Cash", dealSize: "$43.0B", status: "Pending Close" },
  { acquirer: "Chevron", target: "Hess Corp", offerPrice: 171.00, currentPrice: 158.20, daysToClose: 68, dealType: "Stock", dealSize: "$53B", status: "Arbitration Risk" },
  { acquirer: "Capital One", target: "Discover Fin.", offerPrice: 140.00, currentPrice: 127.80, daysToClose: 95, dealType: "Stock", dealSize: "$35.3B", status: "Regulatory Review" },
  { acquirer: "Synopsys", target: "Ansys", offerPrice: 390.00, currentPrice: 362.40, daysToClose: 112, dealType: "Cash+Stock", dealSize: "$35B", status: "Antitrust Review" },
  { acquirer: "Hewlett Packard E.", target: "Juniper Networks", offerPrice: 40.00, currentPrice: 37.20, daysToClose: 78, dealType: "Cash", dealSize: "$14B", status: "DOJ Review" },
  { acquirer: "Nippon Steel", target: "US Steel", offerPrice: 55.00, currentPrice: 42.60, daysToClose: 145, dealType: "Cash", dealSize: "$14.9B", status: "CFIUS / Political Risk" },
  { acquirer: "Sanofi", target: "Ablynx NV", offerPrice: 45.00, currentPrice: 43.60, daysToClose: 18, dealType: "Cash", dealSize: "$4.8B", status: "Pending Close" },
];

const TREND_MARKETS: TrendMarket[] = [
  { name: "S&P 500", asset: "ES Futures", momentum12m: 28.4, signal: "strong_long", vol: 14.2, targetVol: 12, size: 8.4 },
  { name: "Nasdaq 100", asset: "NQ Futures", momentum12m: 42.7, signal: "strong_long", vol: 18.6, targetVol: 12, size: 6.5 },
  { name: "Euro Stoxx", asset: "FESX Futures", momentum12m: 12.4, signal: "long", vol: 16.8, targetVol: 12, size: 7.1 },
  { name: "Nikkei 225", asset: "NK Futures", momentum12m: 18.2, signal: "long", vol: 18.4, targetVol: 12, size: 6.5 },
  { name: "10Y US Treasury", asset: "ZN Futures", momentum12m: -8.4, signal: "short", vol: 8.4, targetVol: 12, size: 14.3 },
  { name: "Bund", asset: "FGBL Futures", momentum12m: -4.2, signal: "neutral", vol: 7.6, targetVol: 12, size: 0 },
  { name: "EUR/USD", asset: "6E Futures", momentum12m: 4.8, signal: "long", vol: 6.8, targetVol: 12, size: 17.6 },
  { name: "USD/JPY", asset: "6J Futures", momentum12m: 12.6, signal: "long", vol: 8.2, targetVol: 12, size: 14.6 },
  { name: "Crude Oil (WTI)", asset: "CL Futures", momentum12m: -6.4, signal: "neutral", vol: 28.6, targetVol: 12, size: 0 },
  { name: "Gold", asset: "GC Futures", momentum12m: 14.8, signal: "long", vol: 12.4, targetVol: 12, size: 9.7 },
];

const YEARS = ["2019", "2020", "2021", "2022", "2023"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(v: number) {
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function formatM(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}B`;
  return `$${v.toFixed(0)}M`;
}

function annualArb(deal: Deal) {
  const spread = deal.offerPrice - deal.currentPrice;
  return (spread / deal.currentPrice) * (365 / deal.daysToClose) * 100;
}

function signalLabel(s: TrendMarket["signal"]) {
  return {
    strong_long: "Strong Long",
    long: "Long",
    neutral: "Neutral",
    short: "Short",
    strong_short: "Strong Short",
  }[s];
}

function signalColor(s: TrendMarket["signal"]) {
  return {
    strong_long: "text-emerald-400 bg-emerald-400/10",
    long: "text-green-400 bg-green-400/10",
    neutral: "text-muted-foreground bg-muted-foreground/10",
    short: "text-orange-400 bg-orange-400/10",
    strong_short: "text-red-400 bg-red-400/10",
  }[s];
}

function categoryColor(c: MacroTheme["category"]) {
  return {
    rates: "text-primary bg-primary/10",
    fx: "text-emerald-400 bg-emerald-400/10",
    commodities: "text-amber-400 bg-amber-400/10",
    equities: "text-primary bg-primary/10",
  }[c];
}

function categoryIcon(c: MacroTheme["category"]) {
  return {
    rates: <Activity className="w-3.5 h-3.5" />,
    fx: <Globe className="w-3.5 h-3.5" />,
    commodities: <BarChart2 className="w-3.5 h-3.5" />,
    equities: <TrendingUp className="w-3.5 h-3.5" />,
  }[c];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md bg-foreground/5 px-3 py-2 min-w-[90px]">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          positive === true && "text-emerald-400",
          positive === false && "text-red-400",
          positive === undefined && "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ── Tab 1: Strategy Explorer ──────────────────────────────────────────────────

function RiskReturnChart() {
  const W = 520;
  const H = 320;
  const pad = { top: 24, right: 24, bottom: 48, left: 52 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const xMin = 3, xMax = 16;
  const yMin = 4, yMax = 16;

  const toSvgX = (v: number) => pad.left + ((v - xMin) / (xMax - xMin)) * iW;
  const toSvgY = (v: number) => pad.top + iH - ((v - yMin) / (yMax - yMin)) * iH;

  const xTicks = [4, 6, 8, 10, 12, 14];
  const yTicks = [4, 6, 8, 10, 12, 14];

  const aumMin = 85, aumMax = 1850;
  const aumToR = (aum: number) => 6 + ((aum - aumMin) / (aumMax - aumMin)) * 22;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl" style={{ height: H }}>
      {/* grid */}
      {xTicks.map((x) => (
        <line
          key={`xg${x}`}
          x1={toSvgX(x)}
          y1={pad.top}
          x2={toSvgX(x)}
          y2={pad.top + iH}
          stroke="#3f3f46"
          strokeWidth={0.5}
          strokeDasharray="3,3"
        />
      ))}
      {yTicks.map((y) => (
        <line
          key={`yg${y}`}
          x1={pad.left}
          y1={toSvgY(y)}
          x2={pad.left + iW}
          y2={toSvgY(y)}
          stroke="#3f3f46"
          strokeWidth={0.5}
          strokeDasharray="3,3"
        />
      ))}
      {/* axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + iH} stroke="#52525b" strokeWidth={1} />
      <line x1={pad.left} y1={pad.top + iH} x2={pad.left + iW} y2={pad.top + iH} stroke="#52525b" strokeWidth={1} />
      {/* tick labels */}
      {xTicks.map((x) => (
        <text key={`xl${x}`} x={toSvgX(x)} y={pad.top + iH + 16} textAnchor="middle" fontSize={10} fill="#71717a">
          {x}%
        </text>
      ))}
      {yTicks.map((y) => (
        <text key={`yl${y}`} x={pad.left - 8} y={toSvgY(y) + 4} textAnchor="end" fontSize={10} fill="#71717a">
          {y}%
        </text>
      ))}
      {/* axis labels */}
      <text x={pad.left + iW / 2} y={H - 2} textAnchor="middle" fontSize={11} fill="#a1a1aa">
        Annualised Volatility
      </text>
      <text
        x={12}
        y={pad.top + iH / 2}
        textAnchor="middle"
        fontSize={11}
        fill="#a1a1aa"
        transform={`rotate(-90, 12, ${pad.top + iH / 2})`}
      >
        Annualised Return
      </text>
      {/* efficient frontier dashed reference */}
      <path
        d={`M ${toSvgX(4)} ${toSvgY(5.8)} Q ${toSvgX(8)} ${toSvgY(14.5)} ${toSvgX(15)} ${toSvgY(10)}`}
        fill="none"
        stroke="#52525b"
        strokeWidth={1}
        strokeDasharray="4,4"
      />
      {/* bubbles */}
      {STRATEGIES.map((st) => (
        <g key={st.id}>
          <circle
            cx={toSvgX(st.x)}
            cy={toSvgY(st.y)}
            r={aumToR(st.aum)}
            fill={st.color}
            fillOpacity={0.18}
            stroke={st.color}
            strokeWidth={1.5}
          />
          <text
            x={toSvgX(st.x)}
            y={toSvgY(st.y) + 3.5}
            textAnchor="middle"
            fontSize={8.5}
            fill={st.color}
            fontWeight={600}
          >
            {st.name.split(" ")[0]}
          </text>
        </g>
      ))}
      {/* legend note */}
      <text x={pad.left + iW - 4} y={pad.top + 14} textAnchor="end" fontSize={9} fill="#52525b">
        Bubble size = AUM
      </text>
    </svg>
  );
}

function StrategyExplorer() {
  const [selected, setSelected] = useState<string | null>(null);
  const sel = STRATEGIES.find((s) => s.id === selected);

  return (
    <div className="space-y-4">
      {/* Cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {STRATEGIES.map((st) => (
          <motion.button
            key={st.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(st.id === selected ? null : st.id)}
            className={cn(
              "text-left rounded-md border p-3 transition-colors",
              selected === st.id
                ? "border-transparent bg-foreground/10"
                : "border-border/50 bg-foreground/[0.03] hover:bg-muted/30"
            )}
            style={selected === st.id ? { boxShadow: `0 0 0 1.5px ${st.color}` } : undefined}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: st.color }}
              />
              <span className="text-xs font-semibold text-foreground leading-tight">{st.name}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Sharpe</span>
              <span className="text-muted-foreground font-medium">{st.sharpe.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>SP Corr</span>
              <span
                className={cn(
                  "font-medium",
                  st.spCorr < 0.2 ? "text-emerald-400" : "text-muted-foreground"
                )}
              >
                {st.spCorr.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Gross: {st.grossLeverage}</div>
          </motion.button>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {sel && (
          <motion.div
            key={sel.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-md border border-border bg-foreground/[0.04] p-5"
          >
            <div className="flex flex-wrap items-start gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground mb-1" style={{ color: sel.color }}>
                  {sel.name}
                </h3>
                <p className="text-sm text-muted-foreground">{sel.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatChip label="Gross Leverage" value={sel.grossLeverage} />
                <StatChip label="Net Exposure" value={sel.netExposure} />
                <StatChip label="Sharpe" value={sel.sharpe.toFixed(2)} positive={sel.sharpe > 1} />
                <StatChip label="SP Corr" value={sel.spCorr.toFixed(2)} positive={sel.spCorr < 0.3} />
                <StatChip label="AUM" value={formatM(sel.aum * 1000)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-emerald-400/8 border border-emerald-400/20 p-3">
                <div className="flex items-center gap-1.5 mb-1 text-emerald-400 text-xs font-medium uppercase tracking-wide">
                  <TrendingUp className="w-3.5 h-3.5" /> Best environment
                </div>
                <p className="text-muted-foreground text-xs">{sel.bestEnv}</p>
              </div>
              <div className="rounded-lg bg-red-400/8 border border-red-400/20 p-3">
                <div className="flex items-center gap-1.5 mb-1 text-red-400 text-xs font-medium uppercase tracking-wide">
                  <ShieldAlert className="w-3.5 h-3.5" /> Worst environment
                </div>
                <p className="text-muted-foreground text-xs">{sel.worstEnv}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-column: chart + table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Card className="bg-foreground/[0.03] border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Risk-Return Scatter (Bubble Size = AUM)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RiskReturnChart />
          </CardContent>
        </Card>

        <Card className="bg-foreground/[0.03] border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Annual Returns by Strategy</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Strategy</th>
                  {YEARS.map((y) => (
                    <th key={y} className="text-right py-2 px-2 text-muted-foreground font-medium">{y}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STRATEGIES.map((st) => (
                  <tr key={st.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-1.5 pr-3 text-muted-foreground whitespace-nowrap">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                        style={{ background: st.color }}
                      />
                      {st.name}
                    </td>
                    {YEARS.map((y) => {
                      const r = st.returns[y];
                      return (
                        <td
                          key={y}
                          className={cn(
                            "py-1.5 px-2 text-right font-medium tabular-nums",
                            r >= 0 ? "text-emerald-400" : "text-red-400"
                          )}
                        >
                          {pct(r)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 2: L/S Equity Simulator ───────────────────────────────────────────────

function SpreadChart() {
  resetSeed();
  const n = 60;
  const W = 460;
  const H = 120;
  const pad = { top: 12, right: 12, bottom: 24, left: 40 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const spreads: number[] = [];
  let spread = 0;
  for (let i = 0; i < n; i++) {
    spread += (rand() - 0.5) * 0.8;
    spread *= 0.95;
    spreads.push(spread);
  }

  const sMin = Math.min(...spreads);
  const sMax = Math.max(...spreads);
  const range = sMax - sMin || 1;

  const pts = spreads
    .map((v, i) => {
      const x = pad.left + (i / (n - 1)) * iW;
      const y = pad.top + iH - ((v - sMin) / range) * iH;
      return `${x},${y}`;
    })
    .join(" ");

  const zeroY = pad.top + iH - ((0 - sMin) / range) * iH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
      <line x1={pad.left} y1={zeroY} x2={pad.left + iW} y2={zeroY} stroke="#52525b" strokeWidth={0.8} strokeDasharray="3,3" />
      <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth={1.5} />
      {/* last value dot */}
      {(() => {
        const last = spreads[n - 1];
        const x = pad.left + iW;
        const y = pad.top + iH - ((last - sMin) / range) * iH;
        return <circle cx={x} cy={y} r={3} fill="#6366f1" />;
      })()}
      <text x={pad.left - 4} y={zeroY + 4} textAnchor="end" fontSize={9} fill="#52525b">0</text>
      <text x={pad.left + iW / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="#71717a">
        AAPL/MSFT Spread (z-score) — 60 days
      </text>
    </svg>
  );
}

function LSEquitySimulator() {
  const totalLongMV = LONG_POSITIONS.reduce((s, p) => s + p.shares * p.currentPrice, 0);
  const totalShortMV = SHORT_POSITIONS.reduce((s, p) => s + p.shares * p.currentPrice, 0);
  const grossExposure = totalLongMV + totalShortMV;
  const netExposure = totalLongMV - totalShortMV;

  const longPnL = LONG_POSITIONS.reduce(
    (s, p) => s + p.shares * (p.currentPrice - p.entryPrice),
    0
  );
  const shortPnL = SHORT_POSITIONS.reduce(
    (s, p) => s + p.shares * (p.entryPrice - p.currentPrice),
    0
  );
  const totalPnL = longPnL + shortPnL;

  const portfolioValue = 100_000_000;
  const grossPct = (grossExposure / portfolioValue) * 100;
  const netPct = (netExposure / portfolioValue) * 100;

  const betaAdjNet = useMemo(() => {
    const longBetaMV = LONG_POSITIONS.reduce((s, p) => s + p.shares * p.currentPrice * p.beta, 0);
    const shortBetaMV = SHORT_POSITIONS.reduce((s, p) => s + p.shares * p.currentPrice * p.beta, 0);
    return ((longBetaMV - shortBetaMV) / portfolioValue) * 100;
  }, []);

  const maxLong = Math.max(...LONG_POSITIONS.map((p) => p.shares * p.currentPrice));

  // Sector tilt
  const sectorMap: Record<string, number> = {};
  LONG_POSITIONS.forEach((p) => {
    sectorMap[p.sector] = (sectorMap[p.sector] ?? 0) + p.shares * p.currentPrice;
  });
  const topSector = Object.entries(sectorMap).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-5">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <StatChip label="Gross Exposure" value={`${grossPct.toFixed(0)}%`} />
        <StatChip label="Net Exposure" value={`${netPct.toFixed(0)}%`} positive={netPct > 0} />
        <StatChip label="Beta-Adj Net" value={`${betaAdjNet.toFixed(0)}%`} />
        <StatChip label="Total P&L" value={formatM(totalPnL / 1000)} positive={totalPnL > 0} />
        <StatChip label="Long Alpha" value={formatM(longPnL / 1000)} positive={longPnL > 0} />
        <StatChip label="Short Alpha" value={formatM(shortPnL / 1000)} positive={shortPnL > 0} />
        <StatChip label="Max Name" value={`${((maxLong / portfolioValue) * 100).toFixed(1)}%`} />
        <StatChip label="Top Sector" value={topSector[0]} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Longs table */}
        <Card className="bg-foreground/[0.03] border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Long Book (10 positions)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 text-muted-foreground">Ticker</th>
                  <th className="text-right py-1.5 text-muted-foreground">Shares</th>
                  <th className="text-right py-1.5 text-muted-foreground">Entry</th>
                  <th className="text-right py-1.5 text-muted-foreground">Curr</th>
                  <th className="text-right py-1.5 text-muted-foreground">P&L</th>
                  <th className="text-right py-1.5 text-muted-foreground">β</th>
                </tr>
              </thead>
              <tbody>
                {LONG_POSITIONS.map((p) => {
                  const pl = p.shares * (p.currentPrice - p.entryPrice);
                  const plPct = ((p.currentPrice - p.entryPrice) / p.entryPrice) * 100;
                  return (
                    <tr key={p.ticker} className="border-b border-border/50">
                      <td className="py-1.5 text-foreground font-medium">{p.ticker}</td>
                      <td className="py-1.5 text-right text-muted-foreground">{p.shares.toLocaleString()}</td>
                      <td className="py-1.5 text-right text-muted-foreground">${p.entryPrice.toFixed(1)}</td>
                      <td className="py-1.5 text-right text-muted-foreground">${p.currentPrice.toFixed(1)}</td>
                      <td className={cn("py-1.5 text-right font-medium", pl > 0 ? "text-emerald-400" : "text-red-400")}>
                        {pct(plPct)}
                      </td>
                      <td className="py-1.5 text-right text-muted-foreground">{p.beta.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Shorts table */}
        <Card className="bg-foreground/[0.03] border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              Short Book (5 positions)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 text-muted-foreground">Ticker</th>
                  <th className="text-right py-1.5 text-muted-foreground">Shares</th>
                  <th className="text-right py-1.5 text-muted-foreground">Entry</th>
                  <th className="text-right py-1.5 text-muted-foreground">Curr</th>
                  <th className="text-right py-1.5 text-muted-foreground">P&L</th>
                  <th className="text-right py-1.5 text-muted-foreground">β</th>
                </tr>
              </thead>
              <tbody>
                {SHORT_POSITIONS.map((p) => {
                  const pl = p.shares * (p.entryPrice - p.currentPrice);
                  const plPct = ((p.entryPrice - p.currentPrice) / p.entryPrice) * 100;
                  return (
                    <tr key={p.ticker} className="border-b border-border/50">
                      <td className="py-1.5 text-foreground font-medium">{p.ticker}</td>
                      <td className="py-1.5 text-right text-muted-foreground">{p.shares.toLocaleString()}</td>
                      <td className="py-1.5 text-right text-muted-foreground">${p.entryPrice.toFixed(2)}</td>
                      <td className="py-1.5 text-right text-muted-foreground">${p.currentPrice.toFixed(2)}</td>
                      <td className={cn("py-1.5 text-right font-medium", pl > 0 ? "text-emerald-400" : "text-red-400")}>
                        {pct(plPct)}
                      </td>
                      <td className="py-1.5 text-right text-muted-foreground">{p.beta.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Pair trade + factor exposure */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="bg-foreground/[0.03] border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pair Trade — Long AAPL / Short MSFT</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex gap-3">
              <StatChip label="AAPL Return" value="+14.1%" positive />
              <StatChip label="MSFT Return" value="+13.9%" positive />
              <StatChip label="Spread" value="+0.2%" positive />
              <StatChip label="Correlation" value="0.84" />
            </div>
            <SpreadChart />
            <p className="text-xs text-muted-foreground">
              The pair spread has mean-reverted close to zero over the trailing 60 days, consistent
              with a high-correlation pairs trade. Current spread is marginally positive — AAPL
              slightly outperforming MSFT on a dollar-neutral basis.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-foreground/[0.03] border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Factor Exposure & Portfolio Heat</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {[
              { label: "Market Beta (net)", value: betaAdjNet, max: 100, color: "bg-primary" },
              { label: "Tech Sector Tilt", value: 58, max: 100, color: "bg-primary" },
              { label: "Large Cap Tilt", value: 72, max: 100, color: "bg-indigo-500" },
              { label: "Momentum Factor", value: 44, max: 100, color: "bg-emerald-500" },
              { label: "Quality Factor", value: 81, max: 100, color: "bg-teal-500" },
              { label: "Max Single Name", value: (maxLong / portfolioValue) * 100, max: 20, color: "bg-amber-500" },
            ].map(({ label, value, max, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-muted-foreground font-medium">{value.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/[0.08] overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", color)}
                    style={{ width: `${Math.min(100, (Math.abs(value) / max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 3: Global Macro Simulator ─────────────────────────────────────────────

const MACRO_REGIMES = [
  { name: "Goldilocks", quadrant: "High Growth / Low Inflation", color: "#10b981", x: 1, y: -1, trades: ["Long equities (growth)", "Steepen yield curve", "Short USD", "Long EM"] },
  { name: "Reflation", quadrant: "High Growth / High Inflation", color: "#f59e0b", x: 1, y: 1, trades: ["Short bonds (duration)", "Long commodities", "Long financials", "Short tech"] },
  { name: "Stagflation", quadrant: "Low Growth / High Inflation", color: "#ef4444", x: -1, y: 1, trades: ["Long gold", "Long oil", "Short equities", "Long TIPS / short nominal bonds"] },
  { name: "Deflation", quadrant: "Low Growth / Low Inflation", color: "#6366f1", x: -1, y: -1, trades: ["Long quality bonds", "Long USD", "Short commodities", "Long defensive equities"] },
];

const CB_STANCES = [
  { bank: "Federal Reserve (Fed)", stance: "Easing bias", rate: "5.25%", trend: "cutting", tradeIdea: "Long front-end bonds (2Y), Steepener trade" },
  { bank: "European Central Bank (ECB)", stance: "Higher for longer", rate: "4.50%", trend: "holding", tradeIdea: "EUR/USD long as ECB/Fed differential compresses" },
  { bank: "Bank of Japan (BoJ)", stance: "Tightening cycle start", rate: "0.10%", trend: "hiking", tradeIdea: "Long JPY vs USD; short JGBs duration" },
  { bank: "Bank of England (BoE)", stance: "Cutting cycle", rate: "5.00%", trend: "cutting", tradeIdea: "Long UK gilts, short GBP/EUR" },
  { bank: "People's Bank of China (PBoC)", stance: "Easing / stimulus", rate: "3.45%", trend: "cutting", tradeIdea: "Long CNH, long China proxies (copper, AUD)" },
];

function RegimeChart({ activeRegime }: { activeRegime: number }) {
  const W = 300;
  const H = 240;
  const cx = W / 2, cy = H / 2;
  const sw = W / 2 - 8, sh = H / 2 - 8;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: H }}>
      {/* quadrant backgrounds */}
      {MACRO_REGIMES.map((r, i) => (
        <rect
          key={r.name}
          x={r.x > 0 ? cx + 1 : 8}
          y={r.y < 0 ? 8 : cy + 1}
          width={sw - 1}
          height={sh - 1}
          fill={r.color}
          fillOpacity={activeRegime === i ? 0.18 : 0.05}
          rx={4}
        />
      ))}
      {/* axes */}
      <line x1={cx} y1={8} x2={cx} y2={H - 8} stroke="#52525b" strokeWidth={1} />
      <line x1={8} y1={cy} x2={W - 8} y2={cy} stroke="#52525b" strokeWidth={1} />
      {/* labels */}
      {MACRO_REGIMES.map((r, i) => (
        <text
          key={r.name}
          x={r.x > 0 ? cx + sw / 2 : 8 + sw / 2}
          y={r.y < 0 ? 8 + sh / 2 : cy + sh / 2}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={r.color}
          fillOpacity={activeRegime === i ? 1 : 0.5}
        >
          {r.name}
        </text>
      ))}
      {/* axis labels */}
      <text x={cx + 2} y={14} fontSize={8.5} fill="#71717a">High Growth →</text>
      <text x={8} y={14} fontSize={8.5} fill="#71717a" textAnchor="start">← Low Growth</text>
      <text x={W - 4} y={cy - 4} textAnchor="end" fontSize={8.5} fill="#71717a">High Infl ↑</text>
      <text x={W - 4} y={cy + 12} textAnchor="end" fontSize={8.5} fill="#71717a">Low Infl ↓</text>
      {/* current marker */}
      {(() => {
        const r = MACRO_REGIMES[activeRegime];
        const mx = r.x > 0 ? cx + sw * 0.4 : cx - sw * 0.4;
        const my = r.y < 0 ? cy - sh * 0.4 : cy + sh * 0.4;
        return (
          <g>
            <circle cx={mx} cy={my} r={7} fill={r.color} fillOpacity={0.3} stroke={r.color} strokeWidth={1.5} />
            <text x={mx} y={my + 4} textAnchor="middle" fontSize={9} fill={r.color} fontWeight={700}>Now</text>
          </g>
        );
      })()}
    </svg>
  );
}

function GlobalMacroSimulator() {
  const [activeRegime, setActiveRegime] = useState(0);
  const regime = MACRO_REGIMES[activeRegime];

  return (
    <div className="space-y-5">
      {/* Macro themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MACRO_THEMES.map((theme) => {
          const plPct = (() => {
            if (theme.category === "rates") {
              return ((theme.entry - theme.current) / theme.entry) * 100 * (theme.entry > theme.target ? 1 : -1);
            }
            return ((theme.current - theme.entry) / theme.entry) * 100;
          })();
          const progress = Math.min(100, Math.max(0, ((theme.current - theme.entry) / (theme.target - theme.entry)) * 100));

          return (
            <Card key={theme.id} className="bg-foreground/[0.03] border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge className={cn("text-xs text-muted-foreground px-1.5 py-0 h-5 gap-1", categoryColor(theme.category))}>
                        {categoryIcon(theme.category)}
                        {theme.category.charAt(0).toUpperCase() + theme.category.slice(1)}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium text-foreground">{theme.name}</h4>
                  </div>
                  <span className={cn("text-sm font-medium tabular-nums", plPct >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {pct(plPct)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{theme.thesis}</p>
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                  {[["Instrument", theme.instrument], ["Entry", `${theme.unit}${theme.entry}`], ["Current", `${theme.unit}${theme.current}`], ["Target", `${theme.unit}${theme.target}`]].map(([l, v]) => (
                    <div key={l} className="bg-foreground/5 rounded px-2 py-1.5">
                      <div className="text-muted-foreground text-[11px] uppercase">{l}</div>
                      <div className="text-foreground font-medium truncate">{v}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Entry → Target progress</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5 bg-foreground/10" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="text-muted-foreground">Stop: <span className="text-red-400">{theme.unit}{theme.stop}</span></span>
                  <span className="text-muted-foreground">Size: <span className="text-muted-foreground">${theme.size}M</span></span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Regime + CB */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="bg-foreground/[0.03] border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Macro Regime Detector</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4 flex-col sm:flex-row items-start">
              <RegimeChart activeRegime={activeRegime} />
              <div className="space-y-2 flex-1">
                <p className="text-xs text-muted-foreground mb-2">Select current regime:</p>
                {MACRO_REGIMES.map((r, i) => (
                  <button
                    key={r.name}
                    onClick={() => setActiveRegime(i)}
                    className={cn(
                      "w-full text-left rounded-lg border p-2.5 text-xs text-muted-foreground transition-colors",
                      activeRegime === i
                        ? "border-transparent bg-foreground/10"
                        : "border-border/50 hover:bg-muted/30"
                    )}
                    style={activeRegime === i ? { boxShadow: `0 0 0 1.5px ${r.color}` } : undefined}
                  >
                    <div className="font-medium mb-0.5" style={{ color: r.color }}>{r.name}</div>
                    <div className="text-muted-foreground text-xs">{r.quadrant}</div>
                  </button>
                ))}
                <div className="mt-3 rounded-lg bg-foreground/5 p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Recommended trades in {regime.name}</p>
                  {regime.trades.map((t) => (
                    <div key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.5">
                      <ArrowUpRight className="w-3 h-3 flex-shrink-0" style={{ color: regime.color }} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-foreground/[0.03] border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Central Bank Positioning</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {CB_STANCES.map((cb) => (
              <div key={cb.bank} className="rounded-lg bg-foreground/[0.04] border border-border/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{cb.bank}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{cb.rate}</span>
                    <Badge
                      className={cn(
                        "text-xs text-muted-foreground px-1.5 py-0 h-5",
                        cb.trend === "cutting" && "bg-emerald-400/15 text-emerald-400",
                        cb.trend === "hiking" && "bg-red-400/15 text-red-400",
                        cb.trend === "holding" && "bg-muted-foreground/15 text-muted-foreground"
                      )}
                    >
                      {cb.stance}
                    </Badge>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  <span className="text-muted-foreground">Trade: </span>{cb.tradeIdea}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 4: Event Driven / Merger Arb ─────────────────────────────────────────

function MergerArbHistoryChart() {
  resetSeed();
  const n = 120;
  const W = 460;
  const H = 140;
  const pad = { top: 10, right: 10, bottom: 24, left: 42 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const vals: number[] = [100];
  for (let i = 1; i < n; i++) {
    const monthly = (rand() * 1.2 - 0.05) / 12;
    vals.push(vals[i - 1] * (1 + monthly));
  }

  const vMin = Math.min(...vals) * 0.98;
  const vMax = Math.max(...vals) * 1.02;
  const range = vMax - vMin;

  const pts = vals
    .map((v, i) => {
      const x = pad.left + (i / (n - 1)) * iW;
      const y = pad.top + iH - ((v - vMin) / range) * iH;
      return `${x},${y}`;
    })
    .join(" ");

  const gradId = "mgrd";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="#06b6d4" strokeWidth={1.5} />
      <polygon
        points={`${pad.left},${pad.top + iH} ${pts} ${pad.left + iW},${pad.top + iH}`}
        fill={`url(#${gradId})`}
      />
      {[100, 150, 200, 250].map((v) => (
        <g key={v}>
          <line
            x1={pad.left}
            y1={pad.top + iH - ((v - vMin) / range) * iH}
            x2={pad.left + iW}
            y2={pad.top + iH - ((v - vMin) / range) * iH}
            stroke="#3f3f46"
            strokeWidth={0.5}
            strokeDasharray="2,4"
          />
          <text
            x={pad.left - 4}
            y={pad.top + iH - ((v - vMin) / range) * iH + 4}
            textAnchor="end"
            fontSize={8.5}
            fill="#71717a"
          >
            {v}
          </text>
        </g>
      ))}
      <text x={pad.left + iW / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="#71717a">
        Merger Arb — 10-Year NAV (rebased 100)
      </text>
    </svg>
  );
}

function EventDriven() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      {/* Deal table */}
      <Card className="bg-foreground/[0.03] border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Active Merger Arb Positions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground">Target</th>
                <th className="text-left py-2 text-muted-foreground">Acquirer</th>
                <th className="text-right py-2 text-muted-foreground">Offer</th>
                <th className="text-right py-2 text-muted-foreground">Current</th>
                <th className="text-right py-2 text-muted-foreground">Spread</th>
                <th className="text-right py-2 text-muted-foreground">Days</th>
                <th className="text-right py-2 text-muted-foreground">Ann. Return</th>
                <th className="text-left py-2 text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {DEALS.map((deal, i) => {
                const spread = deal.offerPrice - deal.currentPrice;
                const spreadPct = (spread / deal.currentPrice) * 100;
                const annRet = annualArb(deal);
                return (
                  <tr
                    key={i}
                    className={cn(
                      "border-b border-border/50 cursor-pointer transition-colors",
                      selected === i ? "bg-foreground/[0.08]" : "hover:bg-muted/30"
                    )}
                    onClick={() => setSelected(i === selected ? null : i)}
                  >
                    <td className="py-2 text-foreground font-medium">{deal.target}</td>
                    <td className="py-2 text-muted-foreground">{deal.acquirer}</td>
                    <td className="py-2 text-right text-muted-foreground">${deal.offerPrice.toFixed(2)}</td>
                    <td className="py-2 text-right text-muted-foreground">${deal.currentPrice.toFixed(2)}</td>
                    <td className="py-2 text-right text-emerald-400 font-medium">{spreadPct.toFixed(2)}%</td>
                    <td className="py-2 text-right text-muted-foreground">{deal.daysToClose}d</td>
                    <td className="py-2 text-right text-muted-foreground font-medium">{annRet.toFixed(1)}%</td>
                    <td className="py-2 text-left">
                      <Badge
                        className={cn(
                          "text-xs text-muted-foreground px-1.5 py-0 h-5",
                          deal.status.includes("Approved") || deal.status.includes("Close")
                            ? "bg-emerald-400/15 text-emerald-400"
                            : deal.status.includes("Risk") || deal.status.includes("Political")
                            ? "bg-red-400/15 text-red-400"
                            : "bg-amber-400/15 text-amber-400"
                        )}
                      >
                        {deal.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Detail panel */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {(() => {
              const deal = DEALS[selected];
              const spread = deal.offerPrice - deal.currentPrice;
              const spreadPct = (spread / deal.currentPrice) * 100;
              const annRet = annualArb(deal);
              // implied prob: (annual_ret) / (annual_ret + break_loss)
              const breakLoss = deal.currentPrice * 0.15; // assume 15% drop on break
              const impliedProb = annRet / (annRet + (breakLoss / deal.currentPrice) * 100) * 100;
              // Kelly: f = (p*b - q) / b, b = annRet/100, p = implied prob/100
              const p = impliedProb / 100;
              const b = annRet / 100;
              const kelly = Math.max(0, (p * b - (1 - p)) / b) * 100;

              return (
                <Card className="bg-foreground/[0.03] border-border/50">
                  <CardContent className="p-5">
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Deal Analysis — {deal.target} / {deal.acquirer}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <StatChip label="Dollar Spread" value={`$${spread.toFixed(2)}`} positive />
                      <StatChip label="Spread %" value={`${spreadPct.toFixed(2)}%`} positive />
                      <StatChip label="Ann. Return" value={`${annRet.toFixed(1)}%`} positive />
                      <StatChip label="Deal Size" value={deal.dealSize} />
                      <StatChip label="Implied Prob" value={`${impliedProb.toFixed(1)}%`} />
                      <StatChip label="Break Loss" value={"-15% est."} positive={false} />
                      <StatChip label="Kelly Size" value={`${kelly.toFixed(1)}%`} />
                      <StatChip label="Type" value={deal.dealType} />
                    </div>
                    <div className="rounded-lg bg-foreground/5 p-3 text-xs text-muted-foreground space-y-1">
                      <p>
                        <span className="text-muted-foreground">Spread calc: </span>
                        Annualised Return = (${deal.offerPrice.toFixed(2)} − ${deal.currentPrice.toFixed(2)}) / ${deal.currentPrice.toFixed(2)} × 365 / {deal.daysToClose} = {annRet.toFixed(2)}% p.a.
                      </p>
                      <p>
                        <span className="text-muted-foreground">Implied probability: </span>
                        Spread / (Spread + Break Loss) ≈ {impliedProb.toFixed(1)}% chance of completion implied by current price.
                      </p>
                      <p>
                        <span className="text-muted-foreground">Kelly criterion: </span>
                        Optimal position = {kelly.toFixed(1)}% of NAV. Risk: deal-break regulatory, financing, or market conditions.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="bg-foreground/[0.03] border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Merger Arb — 10-Year Track Record</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <MergerArbHistoryChart />
          <p className="text-xs text-muted-foreground mt-2">
            Simulated 10-year NAV. Merger arb has historically delivered 6–10% p.a. with low vol (~4%),
            producing consistent Sharpe ratios above 1.0x. The strategy is not immune to market dislocations
            (2020 COVID, 2022 rate shock) which can widen spreads abruptly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 5: CTA / Managed Futures ─────────────────────────────────────────────

function CrisisAlphaChart() {
  const data = [
    { label: "2008 GFC", sp500: -38.5, cta: 18.3 },
    { label: "2011 EU Debt", sp500: -7.2, cta: 4.8 },
    { label: "2015 China", sp500: -4.4, cta: -2.1 },
    { label: "2020 COVID", sp500: -19.6, cta: 1.4 },
    { label: "2022 Bear", sp500: -19.4, cta: 25.2 },
  ];

  const W = 460;
  const H = 200;
  const pad = { top: 20, right: 16, bottom: 40, left: 52 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const barW = iW / data.length;
  const groupW = barW * 0.8;
  const halfGroup = groupW / 2;

  const allVals = data.flatMap((d) => [d.sp500, d.cta]);
  const vMin = Math.min(...allVals) * 1.1;
  const vMax = Math.max(...allVals) * 1.1;
  const range = vMax - vMin;

  const toY = (v: number) => pad.top + iH - ((v - vMin) / range) * iH;
  const zeroY = toY(0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
      <line x1={pad.left} y1={zeroY} x2={pad.left + iW} y2={zeroY} stroke="#52525b" strokeWidth={0.8} />
      {[-40, -20, 0, 10, 20, 30].map((v) => (
        <g key={v}>
          <line x1={pad.left} y1={toY(v)} x2={pad.left + iW} y2={toY(v)} stroke="#3f3f46" strokeWidth={0.4} strokeDasharray="3,3" />
          <text x={pad.left - 4} y={toY(v) + 4} textAnchor="end" fontSize={8.5} fill="#71717a">{v}%</text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = pad.left + i * barW + barW / 2;
        const bw = groupW / 2 - 1;
        return (
          <g key={d.label}>
            {/* S&P bar */}
            <rect
              x={cx - halfGroup}
              y={d.sp500 < 0 ? zeroY : toY(d.sp500)}
              width={bw}
              height={Math.abs(toY(d.sp500) - zeroY)}
              fill="#ef4444"
              fillOpacity={0.7}
              rx={2}
            />
            {/* CTA bar */}
            <rect
              x={cx}
              y={d.cta < 0 ? zeroY : toY(d.cta)}
              width={bw}
              height={Math.abs(toY(d.cta) - zeroY)}
              fill="#8b5cf6"
              fillOpacity={0.7}
              rx={2}
            />
            <text x={cx} y={H - 6} textAnchor="middle" fontSize={8.5} fill="#71717a">{d.label}</text>
          </g>
        );
      })}
      {/* legend */}
      <rect x={pad.left} y={6} width={8} height={8} fill="#ef4444" fillOpacity={0.7} rx={1} />
      <text x={pad.left + 11} y={14} fontSize={9} fill="#a1a1aa">S&P 500</text>
      <rect x={pad.left + 56} y={6} width={8} height={8} fill="#8b5cf6" fillOpacity={0.7} rx={1} />
      <text x={pad.left + 67} y={14} fontSize={9} fill="#a1a1aa">SG CTA Index</text>
    </svg>
  );
}

function CTASimulator() {
  const [trendPeriod, setTrendPeriod] = useState<20 | 50 | 100>(50);

  const paramSharpe: Record<number, number> = { 20: 0.58, 50: 0.68, 100: 0.61 };

  return (
    <div className="space-y-5">
      {/* Signals table */}
      <Card className="bg-foreground/[0.03] border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Trend Following Signals & Position Sizing</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground">Market</th>
                <th className="text-left py-2 text-muted-foreground">Asset</th>
                <th className="text-right py-2 text-muted-foreground">12M Mom.</th>
                <th className="text-left py-2 px-3 text-muted-foreground">Signal</th>
                <th className="text-right py-2 text-muted-foreground">Realized Vol</th>
                <th className="text-right py-2 text-muted-foreground">Target Vol</th>
                <th className="text-right py-2 text-muted-foreground">Size (% NAV)</th>
              </tr>
            </thead>
            <tbody>
              {TREND_MARKETS.map((m) => (
                <tr key={m.name} className="border-b border-border/50">
                  <td className="py-1.5 text-foreground font-medium">{m.name}</td>
                  <td className="py-1.5 text-muted-foreground">{m.asset}</td>
                  <td className={cn("py-1.5 text-right font-medium", m.momentum12m >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {pct(m.momentum12m)}
                  </td>
                  <td className="py-1.5 px-3">
                    <Badge className={cn("text-xs text-muted-foreground px-1.5 py-0 h-5", signalColor(m.signal))}>
                      {signalLabel(m.signal)}
                    </Badge>
                  </td>
                  <td className="py-1.5 text-right text-muted-foreground">{m.vol.toFixed(1)}%</td>
                  <td className="py-1.5 text-right text-muted-foreground">{m.targetVol}%</td>
                  <td className="py-1.5 text-right text-muted-foreground font-medium">{m.size.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Parameter sweep */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="bg-foreground/[0.03] border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Parameter Sweep — Trend Period vs Sharpe</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="flex gap-2">
              {([20, 50, 100] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setTrendPeriod(p)}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                    trendPeriod === p
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/50 text-muted-foreground hover:text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  {p}D
                </button>
              ))}
            </div>
            <div className="rounded-md bg-foreground/5 p-5 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {paramSharpe[trendPeriod].toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Sharpe Ratio ({trendPeriod}D lookback)</div>
              </div>
            </div>
            <div className="space-y-1">
              {[
                { p: 20, note: "More signals, faster reaction, higher turnover, vulnerable to whipsaws" },
                { p: 50, note: "Standard momentum window, best risk-adjusted returns historically" },
                { p: 100, note: "Fewer signals, lower turnover, slower to adapt to regime changes" },
              ].map(({ p, note }) => (
                <div key={p} className={cn("text-xs p-2 rounded", trendPeriod === p ? "text-muted-foreground bg-foreground/[0.06]" : "text-muted-foreground")}>
                  <span className="font-medium">{p}D: </span>{note}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-foreground/[0.03] border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Crisis Alpha — CTA vs S&P 500</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CrisisAlphaChart />
            <div className="mt-3 rounded-lg bg-primary/8 border border-border p-3">
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-medium">Crisis Alpha: </span>
                CTAs delivered positive returns in 4 of 5 major equity drawdowns. The 2022 +25% return
                during one of the worst bond and equity years illustrates trend-following&apos;s unique
                diversification benefit during sustained trending environments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 6: Fund Economics ────────────────────────────────────────────────────

function WaterfallChart({ aum, returnPct }: { aum: number; returnPct: number }) {
  const mgmtFee = aum * 0.02;
  const grossReturn = aum * (returnPct / 100);
  const hurdle = aum * 0.05;
  const overHurdle = Math.max(0, grossReturn - hurdle);
  const perfFee = overHurdle * 0.20;
  const lpNet = grossReturn - mgmtFee - perfFee;

  const items = [
    { label: "Gross Return", value: grossReturn, color: "#6366f1" },
    { label: "- Mgmt Fee (2%)", value: -mgmtFee, color: "#ef4444" },
    { label: "- Perf Fee (20%)", value: -perfFee, color: "#f59e0b" },
    { label: "= LP Net Return", value: lpNet, color: "#10b981" },
  ];

  const maxAbs = Math.max(...items.map((i) => Math.abs(i.value)));
  const W = 360;
  const H = 160;
  const barH = 22;
  const gap = 10;
  const labelW = 120;
  const maxBarW = W - labelW - 60;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: H }}>
      {items.map((item, i) => {
        const bw = (Math.abs(item.value) / maxAbs) * maxBarW;
        const y = i * (barH + gap);
        return (
          <g key={item.label}>
            <text x={labelW - 4} y={y + barH / 2 + 4} textAnchor="end" fontSize={9.5} fill="#a1a1aa">{item.label}</text>
            <rect x={labelW} y={y} width={bw} height={barH} fill={item.color} fillOpacity={0.7} rx={3} />
            <text x={labelW + bw + 5} y={y + barH / 2 + 4} fontSize={9.5} fill={item.color} fontWeight={600}>
              ${(Math.abs(item.value) / 1e6).toFixed(1)}M
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function FundEconomics() {
  const [aumLevel, setAumLevel] = useState(500); // $M
  const [returnLevel, setReturnLevel] = useState(15); // %

  const mgmtFeeM = (aumLevel * 1e6 * 0.02) / 1e6;
  const grossReturnM = (aumLevel * 1e6 * (returnLevel / 100)) / 1e6;
  const hurdleM = (aumLevel * 1e6 * 0.05) / 1e6;
  const overHurdleM = Math.max(0, grossReturnM - hurdleM);
  const perfFeeM = overHurdleM * 0.20;
  const lpNetM = grossReturnM - mgmtFeeM - perfFeeM;
  const totalFeeM = mgmtFeeM + perfFeeM;
  const lpNetPct = (lpNetM / (aumLevel * 1e6 / 1e6)) * 100 / (returnLevel / 100 * aumLevel) * 100;

  const fixedCosts = 3.5; // $M per year estimate
  const breakEvenAUM = fixedCosts / 0.02;

  // HWM scenario: fund at $100M, lost 20%, then regained
  const hwmScenarios = [
    { year: "Y1", nav: 100, hwm: 100, perfFee: 0 },
    { year: "Y2", nav: 80, hwm: 100, perfFee: 0 },
    { year: "Y3", nav: 90, hwm: 100, perfFee: 0 },
    { year: "Y4", nav: 105, hwm: 105, perfFee: (105 - 100) * 0.2 },
    { year: "Y5", nav: 120, hwm: 120, perfFee: (120 - 105) * 0.2 },
  ];

  return (
    <div className="space-y-5">
      {/* Interactive sliders */}
      <Card className="bg-foreground/[0.03] border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Fee Calculator (2&amp;20 Structure)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span className="text-muted-foreground">Fund AUM</span>
                  <span className="text-foreground font-medium">${aumLevel}M</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={2000}
                  step={50}
                  value={aumLevel}
                  onChange={(e) => setAumLevel(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$50M</span><span>$2B</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span className="text-muted-foreground">Annual Gross Return</span>
                  <span className="text-foreground font-medium">{returnLevel}%</span>
                </div>
                <input
                  type="range"
                  min={-10}
                  max={50}
                  step={1}
                  value={returnLevel}
                  onChange={(e) => setReturnLevel(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>-10%</span><span>+50%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: "Management Fee (2% × AUM)", value: mgmtFeeM, color: "text-red-400" },
                { label: "Performance Fee (20% above 5% hurdle)", value: perfFeeM, color: "text-amber-400" },
                { label: "Total Fee Drag", value: totalFeeM, color: "text-orange-400" },
                { label: "LP Net Return $", value: lpNetM, color: "text-emerald-400", highlight: true },
              ].map(({ label, value, color, highlight }) => (
                <div
                  key={label}
                  className={cn(
                    "flex justify-between items-center rounded-lg px-3 py-2 text-xs text-muted-foreground",
                    highlight ? "bg-emerald-400/8 border border-emerald-400/20" : "bg-foreground/[0.04]"
                  )}
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("font-medium tabular-nums", color)}>
                    ${value.toFixed(2)}M
                  </span>
                </div>
              ))}
              <div className="mt-1 text-[11px] text-muted-foreground px-1">
                LP effective net return: <span className="text-muted-foreground font-medium">{lpNetPct > 0 ? lpNetPct.toFixed(1) : "N/A"}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <WaterfallChart aum={aumLevel * 1e6} returnPct={returnLevel} />
          </div>
        </CardContent>
      </Card>

      {/* HWM table + break-even */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="bg-foreground/[0.03] border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">High Water Mark — Investor Protection</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <table className="w-full text-xs text-muted-foreground mb-3">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground">Year</th>
                  <th className="text-right py-2 text-muted-foreground">NAV</th>
                  <th className="text-right py-2 text-muted-foreground">HWM</th>
                  <th className="text-right py-2 text-muted-foreground">Perf Fee</th>
                  <th className="text-left py-2 text-muted-foreground">Note</th>
                </tr>
              </thead>
              <tbody>
                {hwmScenarios.map((row) => (
                  <tr key={row.year} className="border-b border-border/50">
                    <td className="py-1.5 text-muted-foreground">{row.year}</td>
                    <td className={cn("py-1.5 text-right font-medium", row.nav >= row.hwm ? "text-emerald-400" : "text-red-400")}>
                      ${row.nav}
                    </td>
                    <td className="py-1.5 text-right text-muted-foreground">${row.hwm}</td>
                    <td className={cn("py-1.5 text-right font-medium", row.perfFee > 0 ? "text-amber-400" : "text-muted-foreground")}>
                      {row.perfFee > 0 ? `$${row.perfFee.toFixed(1)}M` : "—"}
                    </td>
                    <td className="py-1.5 text-muted-foreground text-xs">
                      {row.nav < row.hwm ? "Loss — no perf fee"
                        : row.nav === 100 ? "Initial NAV"
                        : row.perfFee > 0 ? `New HWM, +20% on $${(row.nav - (hwmScenarios.find(s => s.year < row.year && s.hwm < row.hwm)?.hwm ?? row.hwm - row.perfFee * 5))?.toFixed(0) ?? "—"} gain`
                        : "Recovery — no perf fee until HWM"
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="rounded-lg bg-foreground/5 p-3 text-xs text-muted-foreground">
              HWM ensures GPs only collect performance fees on new profits. In Y2–Y3, despite negative/flat performance,
              no carry is charged. Fee resumes only once the fund surpasses prior peak NAV.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-foreground/[0.03] border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Fund Economics — Break-Even &amp; Scale</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="rounded-md bg-indigo-400/8 border border-indigo-400/20 p-4">
              <p className="text-xs text-muted-foreground mb-1">Break-Even AUM (cover $3.5M fixed costs)</p>
              <p className="text-lg font-medium text-indigo-400">${breakEvenAUM.toFixed(0)}M</p>
              <p className="text-xs text-muted-foreground mt-1">At 2% mgmt fee — minimum viable fund size</p>
            </div>

            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 text-muted-foreground">AUM</th>
                  <th className="text-right py-1.5 text-muted-foreground">Mgmt Fee</th>
                  <th className="text-right py-1.5 text-muted-foreground">Perf Fee*</th>
                  <th className="text-right py-1.5 text-muted-foreground">GP Total</th>
                </tr>
              </thead>
              <tbody>
                {[100, 500, 1000, 5000].map((aum) => {
                  const mf = aum * 0.02;
                  const pf = aum * 0.10 * 0.20; // assume 10% gross return, 5% hurdle
                  return (
                    <tr key={aum} className="border-b border-border/50">
                      <td className="py-1.5 text-muted-foreground">${aum.toLocaleString()}M</td>
                      <td className="py-1.5 text-right text-muted-foreground">${mf.toFixed(1)}M</td>
                      <td className="py-1.5 text-right text-amber-400">${pf.toFixed(1)}M</td>
                      <td className="py-1.5 text-right text-foreground font-medium">${(mf + pf).toFixed(1)}M</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground">* Perf fee assumes 10% gross return, 5% hurdle, no HWM adjustment</p>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {[
                { label: "Management Fee", value: "2% of AUM/yr", note: "Covers fixed ops" },
                { label: "Performance Fee", value: "20% above hurdle", note: "GP profit share" },
                { label: "Hurdle Rate", value: "5–8%", note: "LP must earn first" },
                { label: "All-In Cost (LP)", value: "3–6% drag", note: "At avg performance" },
              ].map(({ label, value, note }) => (
                <div key={label} className="rounded-lg bg-foreground/5 p-2.5">
                  <div className="text-muted-foreground text-xs mb-0.5">{label}</div>
                  <div className="text-foreground font-medium">{value}</div>
                  <div className="text-muted-foreground text-xs">{note}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HedgeFundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-indigo-500/20 border border-indigo-500/30">
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Hedge Fund Strategies</h1>
            <p className="text-sm text-muted-foreground">
              Explore institutional strategies — L/S Equity, Global Macro, Merger Arb, CTA, and fund economics
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Simulated Data</span>
            <Badge className="bg-muted text-muted-foreground text-xs">Institutional</Badge>
          </div>
        </motion.div>

        {/* Hero */}
        <div className="rounded-md border border-border bg-card border-l-4 border-l-primary p-6">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
            <h2 className="text-lg font-medium text-foreground">Strategy Explorer &amp; Simulators</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Explore L/S Equity, Global Macro, Event Driven, CTA, and fund economics across institutional hedge fund strategies.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="explorer" className="mt-8">
          <TabsList className="bg-foreground/5 border border-border/50 flex-wrap h-auto gap-0.5 p-1">
            {[
              { value: "explorer", label: "Strategy Explorer", icon: <Layers className="w-3.5 h-3.5" /> },
              { value: "ls_equity", label: "L/S Equity", icon: <Scale className="w-3.5 h-3.5" /> },
              { value: "macro", label: "Global Macro", icon: <Globe className="w-3.5 h-3.5" /> },
              { value: "event", label: "Event Driven", icon: <Zap className="w-3.5 h-3.5" /> },
              { value: "cta", label: "CTA / Futures", icon: <Activity className="w-3.5 h-3.5" /> },
              { value: "economics", label: "Fund Economics", icon: <DollarSign className="w-3.5 h-3.5" /> },
            ].map(({ value, label, icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-foreground/[0.12] data-[state=active]:text-foreground text-muted-foreground"
              >
                {icon}
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="explorer" className="mt-5 data-[state=inactive]:hidden">
            <StrategyExplorer />
          </TabsContent>
          <TabsContent value="ls_equity" className="mt-5 data-[state=inactive]:hidden">
            <LSEquitySimulator />
          </TabsContent>
          <TabsContent value="macro" className="mt-5 data-[state=inactive]:hidden">
            <GlobalMacroSimulator />
          </TabsContent>
          <TabsContent value="event" className="mt-5 data-[state=inactive]:hidden">
            <EventDriven />
          </TabsContent>
          <TabsContent value="cta" className="mt-5 data-[state=inactive]:hidden">
            <CTASimulator />
          </TabsContent>
          <TabsContent value="economics" className="mt-5 data-[state=inactive]:hidden">
            <FundEconomics />
          </TabsContent>
        </Tabs>

        {/* Footer note */}
        <div className="flex items-start gap-2 rounded-md bg-foreground/[0.03] border border-border/50 p-4">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            All data is simulated for educational purposes. Hedge fund strategies carry significant risks
            including leverage risk, illiquidity, manager risk, and regulatory risk. Past performance of
            simulated strategies does not predict future results. This is not investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}
