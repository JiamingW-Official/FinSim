"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Globe,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Zap,
  Target,
  BarChart2,
  Activity,
  Layers,
  Info,
  ChevronRight,
  Lock,
  Cpu,
  Anchor,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Seeded PRNG (seed 882) ────────────────────────────────────────────────────
let s = 882;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Utility ───────────────────────────────────────────────────────────────────
function rBetween(lo: number, hi: number) {
  return lo + rand() * (hi - lo);
}
function fmt(n: number, decimals = 1) {
  return (n >= 0 ? "+" : "") + n.toFixed(decimals) + "%";
}

// ── Tab 1 data ─────────────────────────────────────────────────────────────────
interface GeoEvent {
  id: string;
  name: string;
  date: string;
  category: string;
  d1: number; // S&P 500 1-day return %
  w1: number; // 1-week
  m1: number; // 1-month
  m3: number; // 3-month
  oilShock: number; // oil price change %
  goldBid: boolean; // gold rallied?
  usdBid: boolean; // USD safe-haven bid?
  recoveryDays: number; // trading days to full recovery
  winners: string[];
  losers: string[];
}

const GEO_EVENTS: GeoEvent[] = [
  {
    id: "gulf91",
    name: "Gulf War (Desert Storm)",
    date: "Jan 1991",
    category: "Military Conflict",
    d1: -1.4, w1: 4.2, m1: 8.7, m3: 14.1,
    oilShock: -33.0,
    goldBid: false, usdBid: true,
    recoveryDays: 6,
    winners: ["Defense", "Energy (short-term)"],
    losers: ["Airlines", "Consumer Discretionary"],
  },
  {
    id: "sept11",
    name: "September 11 Attacks",
    date: "Sep 2001",
    category: "Terrorism",
    d1: -4.9, w1: -11.6, m1: -8.2, m3: 11.8,
    oilShock: 5.1,
    goldBid: true, usdBid: false,
    recoveryDays: 31,
    winners: ["Defense", "Homeland Security"],
    losers: ["Airlines", "Travel & Leisure", "Insurance"],
  },
  {
    id: "iraq03",
    name: "Iraq War Invasion",
    date: "Mar 2003",
    category: "Military Conflict",
    d1: 3.5, w1: 8.4, m1: 8.2, m3: 18.9,
    oilShock: -22.5,
    goldBid: false, usdBid: false,
    recoveryDays: 0,
    winners: ["Defense", "Oil Services"],
    losers: ["Travel", "Emerging Markets"],
  },
  {
    id: "crimea14",
    name: "Russia Annexes Crimea",
    date: "Mar 2014",
    category: "Territorial Dispute",
    d1: -0.9, w1: -1.4, m1: 1.3, m3: 5.1,
    oilShock: 2.8,
    goldBid: true, usdBid: true,
    recoveryDays: 12,
    winners: ["Defense", "European Gas"],
    losers: ["Russia ETF", "European Banks"],
  },
  {
    id: "uschina18",
    name: "US–China Trade War Begins",
    date: "Mar 2018",
    category: "Trade War",
    d1: -2.5, w1: -3.8, m1: -2.1, m3: 7.2,
    oilShock: -1.2,
    goldBid: false, usdBid: true,
    recoveryDays: 22,
    winners: ["Domestic Industrials", "USD"],
    losers: ["Tech (China-exposed)", "Soybeans", "EM"],
  },
  {
    id: "covid20",
    name: "COVID-19 Pandemic Shock",
    date: "Feb 2020",
    category: "Pandemic",
    d1: -4.4, w1: -11.5, m1: -33.9, m3: -19.6,
    oilShock: -53.0,
    goldBid: true, usdBid: true,
    recoveryDays: 148,
    winners: ["Tech", "Biotech", "E-commerce"],
    losers: ["Energy", "Airlines", "Hotels", "Banks"],
  },
  {
    id: "russia22",
    name: "Russia Invades Ukraine",
    date: "Feb 2022",
    category: "Military Conflict",
    d1: -2.6, w1: -1.8, m1: -3.2, m3: -11.4,
    oilShock: 34.5,
    goldBid: true, usdBid: true,
    recoveryDays: 29,
    winners: ["Energy", "Defense", "Agriculture", "Gold"],
    losers: ["European Stocks", "Nat Gas Importers", "Airlines"],
  },
  {
    id: "taiwan22",
    name: "Taiwan Strait Tensions (Pelosi Visit)",
    date: "Aug 2022",
    category: "Territorial Dispute",
    d1: -0.6, w1: 0.8, m1: 4.2, m3: 9.8,
    oilShock: -3.1,
    goldBid: false, usdBid: true,
    recoveryDays: 4,
    winners: ["Defense", "Domestic Semi"],
    losers: ["TSMC", "China Tech", "Asian EM"],
  },
  {
    id: "israel23",
    name: "Israel–Gaza War",
    date: "Oct 2023",
    category: "Military Conflict",
    d1: -0.5, w1: -2.4, m1: -2.8, m3: 10.1,
    oilShock: 6.8,
    goldBid: true, usdBid: false,
    recoveryDays: 14,
    winners: ["Defense", "Gold", "Energy"],
    losers: ["Regional ETFs", "Airlines"],
  },
  {
    id: "uschina24",
    name: "US–China Chip Export Bans Expand",
    date: "Oct 2024",
    category: "Tech Decoupling",
    d1: -1.1, w1: -2.9, m1: 1.8, m3: 6.5,
    oilShock: 0.3,
    goldBid: false, usdBid: true,
    recoveryDays: 18,
    winners: ["Domestic Semi", "Reshoring Plays"],
    losers: ["Nvidia China", "ASML", "TSMC"],
  },
];

// ── Tab 2 data ─────────────────────────────────────────────────────────────────
// De-dollarization: USD share of global FX reserves 2000–2024
const DEDOLLAR_YEARS = [2000, 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];
const DEDOLLAR_USD  = [71.5, 66.5, 65.9, 65.5, 64.2, 62.1, 61.5, 63.1, 65.3, 62.5, 59.0, 58.4, 57.3];
const DEDOLLAR_EUR  = [ 0.0,  0.0, 16.5, 17.2, 17.4, 19.1, 20.2, 20.5, 19.1, 20.5, 21.2, 19.8, 19.1];
const DEDOLLAR_CNY  = [ 0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  1.1,  1.8,  1.9,  2.3,  2.8,  3.2];
const DEDOLLAR_GOLD = [ 0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  3.0,  4.8,  6.1];

// Tech decoupling timeline
interface DecouplingEvent {
  year: number;
  event: string;
  impact: "high" | "medium" | "low";
}
const DECOUPLING_EVENTS: DecouplingEvent[] = [
  { year: 2018, event: "ZTE ban — first major Chinese tech company restricted from US components", impact: "medium" },
  { year: 2019, event: "Huawei entity list — US suppliers need license to sell to Huawei", impact: "high" },
  { year: 2020, event: "TSMC cuts Huawei orders; TikTok/WeChat executive orders", impact: "high" },
  { year: 2022, event: "CHIPS Act enacted; advanced chip export controls to China", impact: "high" },
  { year: 2023, event: "ASML restricted from servicing EUV tools in China; AI chip ban expanded", impact: "high" },
  { year: 2024, event: "Expanded HBM/AI chip ban; RISC-V export controls proposed", impact: "high" },
];

// SWIFT exclusion impact table
interface SwiftRow {
  metric: string;
  preExclusion: string;
  t6months: string;
  t12months: string;
  t24months: string;
}
const SWIFT_ROWS: SwiftRow[] = [
  { metric: "RUB/USD Exchange Rate",   preExclusion: "75",      t6months: "135",   t12months: "62",   t24months: "89"   },
  { metric: "Russian GDP Growth",      preExclusion: "+2.2%",   t6months: "–10%E", t12months: "–2.3%",t24months: "+3.6%"},
  { metric: "Oil Export Volume (kbd)",  preExclusion: "5,200",   t6months: "4,400", t12months: "4,800",t24months: "5,100"},
  { metric: "Foreign Reserve Access",  preExclusion: "$640B",   t6months: "$300B", t12months: "$290B",t24months: "$290B"},
  { metric: "CPI Inflation",           preExclusion: "8.4%",    t6months: "17.8%", t12months: "12.0%",t24months: "7.5%" },
  { metric: "Interbank Payments",      preExclusion: "SWIFT",   t6months: "SPFS",  t12months: "SPFS+CIPS", t24months: "Hybrid"},
];

// ── Tab 3 data ─────────────────────────────────────────────────────────────────
// GPR index: simulated quarterly values 2015–2024
function buildGPRSeries() {
  const quarters: string[] = [];
  const values: number[] = [];
  const base = 100;
  let v = base;
  for (let yr = 2015; yr <= 2024; yr++) {
    for (let q = 1; q <= 4; q++) {
      if (yr === 2024 && q > 2) break;
      quarters.push(`${yr} Q${q}`);
      // inject known spikes
      let shock = 0;
      if (yr === 2022 && q === 1) shock = 120; // Ukraine invasion
      if (yr === 2023 && q === 4) shock = 60;  // Gaza
      if (yr === 2020 && q === 1) shock = 80;  // COVID
      if (yr === 2018 && q === 3) shock = 30;  // trade war peak
      v = Math.max(60, Math.min(280, v + (rand() - 0.48) * 18 + shock * 0.3));
      values.push(Math.round(v));
      shock = 0;
    }
  }
  return { quarters, values };
}
const GPR = buildGPRSeries();

// Oil price response function: GPR score → expected oil premium %
const OIL_RESPONSE_POINTS = [
  { gpr: 80,  oil: 0 },
  { gpr: 100, oil: 2 },
  { gpr: 140, oil: 8 },
  { gpr: 180, oil: 16 },
  { gpr: 220, oil: 24 },
  { gpr: 260, oil: 32 },
];

// Sector impact matrix by scenario
interface SectorScenario {
  scenario: string;
  energy: number;
  defense: number;
  tech: number;
  food: number;
  finance: number;
  travel: number;
}
const SECTOR_SCENARIOS: SectorScenario[] = [
  { scenario: "Middle East Escalation", energy: 4, defense: 3, tech: -1, food: 2, finance: -1, travel: -3 },
  { scenario: "Taiwan Strait Conflict", energy: 1, defense: 4, tech: -5, food: 0, finance: -3, travel: -2 },
  { scenario: "Russia–NATO Tension",    energy: 3, defense: 4, tech: -1, food: 2, finance: -3, travel: -2 },
  { scenario: "Global Trade War 2.0",   energy: -1, defense: 1, tech: -4, food: -2, finance: -2, travel: -1 },
  { scenario: "NK Nuclear Test",        energy: 1, defense: 3, tech: -2, food: 0, finance: -2, travel: -1 },
];

// Safe haven flows
interface SafeHaven {
  asset: string;
  ticker: string;
  avgReturn1m: number; // average 1-month return during top-10 geo events
  correlation: number; // correlation with GPR index
  liquidity: "Very High" | "High" | "Medium";
  mechanism: string;
}
const SAFE_HAVENS: SafeHaven[] = [
  { asset: "Gold", ticker: "GC", avgReturn1m: 3.8, correlation: 0.62, liquidity: "Very High", mechanism: "Store of value, no counterparty risk" },
  { asset: "US Treasuries (10Y)", ticker: "ZN", avgReturn1m: 2.1, correlation: 0.44, liquidity: "Very High", mechanism: "Flight to quality, USD strength" },
  { asset: "Swiss Franc (CHF)", ticker: "CHF/USD", avgReturn1m: 1.7, correlation: 0.38, liquidity: "High", mechanism: "Political neutrality, current account surplus" },
  { asset: "Japanese Yen (JPY)", ticker: "JPY/USD", avgReturn1m: 1.4, correlation: 0.35, liquidity: "Very High", mechanism: "Carry unwind, large net foreign assets" },
  { asset: "USD Index (DXY)", ticker: "DX", avgReturn1m: 0.9, correlation: 0.28, liquidity: "Very High", mechanism: "Reserve currency demand in crises" },
];

// ── Tab 4 data ─────────────────────────────────────────────────────────────────
interface StressScenario {
  id: string;
  name: string;
  probability: number; // %
  spDraw: number;  // S&P 500 max drawdown %
  duration: number; // months estimated
  oilSurge: number; // %
  goldRally: number; // %
  vixSpike: number; // VIX level
  hedges: string[];
  positives: string[];
}
const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: "taiwan",
    name: "Taiwan Strait Military Conflict",
    probability: 8,
    spDraw: -32,
    duration: 18,
    oilSurge: 40,
    goldRally: 28,
    vixSpike: 65,
    hedges: ["Long gold", "Long defense ETF (ITA)", "Short semiconductor ETF (SOXX)", "Long oil (XLE)"],
    positives: ["US domestic chipmakers", "Defense contractors", "Energy majors"],
  },
  {
    id: "iran",
    name: "Iran Nuclear Crisis / Strait of Hormuz Closure",
    probability: 12,
    spDraw: -18,
    duration: 9,
    oilSurge: 75,
    goldRally: 18,
    vixSpike: 48,
    hedges: ["Long oil futures/ETF", "Long gold", "Long defense", "Short airlines"],
    positives: ["US shale producers", "Gold miners", "Defense"],
  },
  {
    id: "uselection",
    name: "US Election Geopolitical Shock",
    probability: 20,
    spDraw: -12,
    duration: 4,
    oilSurge: 8,
    goldRally: 9,
    vixSpike: 38,
    hedges: ["Long VIX calls", "Long gold", "Long JPY", "Currency diversification"],
    positives: ["Domestic infrastructure", "Financials (deregulation)"],
  },
  {
    id: "russia",
    name: "Russia–NATO Direct Confrontation",
    probability: 5,
    spDraw: -28,
    duration: 24,
    oilSurge: 50,
    goldRally: 35,
    vixSpike: 72,
    hedges: ["Long gold", "Long energy", "Long defense", "Short European equities"],
    positives: ["US defense", "Domestic energy producers", "Gold miners"],
  },
];

// Hedge strategy effectiveness
interface HedgeStrategy {
  name: string;
  cost: string; // basis points per year
  effectiveness: number; // 0–100
  liquidity: "High" | "Medium" | "Low";
  complexity: "Low" | "Medium" | "High";
  bestFor: string;
}
const HEDGE_STRATEGIES: HedgeStrategy[] = [
  { name: "Gold Allocation (5–10%)", cost: "0 bps (opportunity cost)", effectiveness: 68, liquidity: "High", complexity: "Low", bestFor: "All-purpose geopolitical hedge" },
  { name: "Energy ETF (XLE/OIH)", cost: "35 bps MER", effectiveness: 72, liquidity: "High", complexity: "Low", bestFor: "Middle East / oil supply shock" },
  { name: "Defense ETF (ITA/XAR)", cost: "35 bps MER", effectiveness: 65, liquidity: "High", complexity: "Low", bestFor: "Military conflict escalation" },
  { name: "Long-Dated Put Options", cost: "150–250 bps/yr", effectiveness: 85, liquidity: "Medium", complexity: "High", bestFor: "Tail risk, known event dates" },
  { name: "Inverse VIX Hedge (UVXY)", cost: "200+ bps decay", effectiveness: 55, liquidity: "High", complexity: "High", bestFor: "Short-term volatility spike" },
  { name: "Currency Diversification (CHF/JPY)", cost: "20–40 bps", effectiveness: 58, liquidity: "High", complexity: "Medium", bestFor: "Safe-haven flow events" },
  { name: "Political Risk Insurance", cost: "50–300 bps", effectiveness: 78, liquidity: "Low", complexity: "High", bestFor: "Direct EM investment / FDI" },
];

// ── Color helpers ─────────────────────────────────────────────────────────────
const impactColor = (n: number) =>
  n >= 2 ? "#22c55e" : n >= 0 ? "#86efac" : n >= -2 ? "#fca5a5" : "#ef4444";
const impactBg = (n: number) =>
  n >= 2 ? "#16a34a22" : n >= 0 ? "#22c55e11" : n >= -2 ? "#ef444422" : "#ef444433";

// ── Sub-components ─────────────────────────────────────────────────────────────

function ReturnBar({ value, max = 20 }: { value: number; max?: number }) {
  const pct = Math.abs(value) / max;
  const w = Math.min(pct * 60, 60);
  const color = value >= 0 ? "#22c55e" : "#ef4444";
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-14 text-right text-xs font-mono" style={{ color }}>
        {fmt(value)}
      </span>
      <div className="w-16 h-2 bg-muted rounded overflow-hidden">
        <div
          className="h-full rounded"
          style={{ width: `${w}%`, marginLeft: value < 0 ? `${60 - w}%` : "0", background: color }}
        />
      </div>
    </div>
  );
}

function SvgGPRChart({ quarters, values }: { quarters: string[]; values: number[] }) {
  const W = 560, H = 180, PADX = 44, PADY = 16;
  const minV = Math.min(...values) - 10;
  const maxV = Math.max(...values) + 10;
  const toX = (i: number) => PADX + (i / (values.length - 1)) * (W - PADX * 2);
  const toY = (v: number) => PADY + (1 - (v - minV) / (maxV - minV)) * (H - PADY * 2);
  const pts = values.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const area = `M${toX(0)},${toY(minV)} ` +
    values.map((v, i) => `L${toX(i)},${toY(v)}`).join(" ") +
    ` L${toX(values.length - 1)},${toY(minV)} Z`;

  // label every other year
  const yearLabels: { i: number; label: string }[] = [];
  quarters.forEach((q, i) => {
    if (q.endsWith("Q1")) yearLabels.push({ i, label: q.split(" ")[0] });
  });

  // spikes annotation
  const spikes = [
    { label: "COVID", idx: quarters.findIndex(q => q === "2020 Q1") },
    { label: "Ukraine", idx: quarters.findIndex(q => q === "2022 Q1") },
    { label: "Gaza", idx: quarters.findIndex(q => q === "2023 Q4") },
  ].filter(s => s.idx >= 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="gprGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#gprGrad)" />
      <polyline points={pts} fill="none" stroke="#f97316" strokeWidth="1.5" />
      {/* baseline 100 */}
      <line
        x1={PADX} y1={toY(100)} x2={W - PADX} y2={toY(100)}
        stroke="#a3a3a3" strokeWidth="0.7" strokeDasharray="4,3"
      />
      <text x={PADX - 2} y={toY(100) + 3} fill="#a3a3a3" fontSize="9" textAnchor="end">100</text>
      {/* y-axis labels */}
      {[100, 150, 200, 250].map(v =>
        v !== 100 ? (
          <text key={v} x={PADX - 2} y={toY(v) + 3} fill="#525252" fontSize="9" textAnchor="end">{v}</text>
        ) : null
      )}
      {/* x-axis labels */}
      {yearLabels.map(({ i, label }) => (
        <text key={label} x={toX(i)} y={H - 2} fill="#525252" fontSize="9" textAnchor="middle">{label}</text>
      ))}
      {/* spike annotations */}
      {spikes.map(({ label, idx }) => (
        <g key={label}>
          <line
            x1={toX(idx)} y1={toY(values[idx]) - 4}
            x2={toX(idx)} y2={toY(values[idx]) - 20}
            stroke="#f97316" strokeWidth="1" strokeDasharray="2,2"
          />
          <text x={toX(idx)} y={toY(values[idx]) - 23} fill="#f97316" fontSize="8" textAnchor="middle">{label}</text>
        </g>
      ))}
      {/* current dot */}
      <circle cx={toX(values.length - 1)} cy={toY(values[values.length - 1])} r="3" fill="#f97316" />
    </svg>
  );
}

function SvgDeDollarization() {
  const W = 560, H = 180, PADX = 44, PADY = 16;
  const years = DEDOLLAR_YEARS;
  const toX = (i: number) => PADX + (i / (years.length - 1)) * (W - PADX * 2);
  const toY = (v: number) => PADY + (1 - v / 80) * (H - PADY * 2);
  const line = (arr: number[], color: string) =>
    arr.map((v, i) => (i === 0 ? `M${toX(i)},${toY(v)}` : `L${toX(i)},${toY(v)}`)).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {[20, 40, 60, 80].map(v => (
        <line key={v} x1={PADX} y1={toY(v)} x2={W - PADX} y2={toY(v)} stroke="#262626" strokeWidth="0.6" />
      ))}
      {[20, 40, 60, 80].map(v => (
        <text key={v} x={PADX - 2} y={toY(v) + 3} fill="#525252" fontSize="9" textAnchor="end">{v}%</text>
      ))}
      {years.map((yr, i) => (
        <text key={yr} x={toX(i)} y={H - 2} fill="#525252" fontSize="9" textAnchor="middle">
          {yr === 2000 || yr % 4 === 0 ? yr : ""}
        </text>
      ))}
      <path d={line(DEDOLLAR_USD, "#3b82f6")} fill="none" stroke="#3b82f6" strokeWidth="2" />
      <path d={line(DEDOLLAR_EUR, "#22c55e")} fill="none" stroke="#22c55e" strokeWidth="1.5" />
      <path d={line(DEDOLLAR_CNY, "#f59e0b")} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <path d={line(DEDOLLAR_GOLD, "#a78bfa")} fill="none" stroke="#a78bfa" strokeWidth="1.5" />
      {/* legend */}
      {[
        { color: "#3b82f6", label: "USD" },
        { color: "#22c55e", label: "EUR" },
        { color: "#f59e0b", label: "CNY" },
        { color: "#a78bfa", label: "Gold" },
      ].map(({ color, label }, i) => (
        <g key={label} transform={`translate(${PADX + i * 80}, 12)`}>
          <rect width="20" height="3" y="0" fill={color} rx="1" />
          <text x="24" y="4" fill="#a3a3a3" fontSize="9">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function SvgOilResponse() {
  const W = 320, H = 160, PADX = 40, PADY = 16;
  const pts = OIL_RESPONSE_POINTS;
  const minX = pts[0].gpr, maxX = pts[pts.length - 1].gpr;
  const maxY = pts[pts.length - 1].oil;
  const toX = (gpr: number) => PADX + ((gpr - minX) / (maxX - minX)) * (W - PADX * 2);
  const toY = (oil: number) => PADY + (1 - oil / (maxY + 4)) * (H - PADY * 2);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.gpr)},${toY(p.oil)}`).join(" ");
  const area = `${path} L${toX(pts[pts.length - 1].gpr)},${toY(0)} L${toX(pts[0].gpr)},${toY(0)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 10, 20, 30].map(v => (
        <line key={v} x1={PADX} y1={toY(v)} x2={W - PADX} y2={toY(v)} stroke="#262626" strokeWidth="0.6" />
      ))}
      {[0, 10, 20, 30].map(v => (
        <text key={v} x={PADX - 2} y={toY(v) + 3} fill="#525252" fontSize="9" textAnchor="end">+{v}%</text>
      ))}
      {pts.map(p => (
        <text key={p.gpr} x={toX(p.gpr)} y={H - 2} fill="#525252" fontSize="9" textAnchor="middle">{p.gpr}</text>
      ))}
      <path d={area} fill="url(#oilGrad)" />
      <path d={path} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
      {pts.map(p => (
        <circle key={p.gpr} cx={toX(p.gpr)} cy={toY(p.oil)} r="3" fill="#f59e0b" />
      ))}
      <text x={W / 2} y={H - 2} fill="#737373" fontSize="8" textAnchor="middle">GPR Index</text>
      <text x={PADX - 26} y={H / 2} fill="#737373" fontSize="8" textAnchor="middle"
        transform={`rotate(-90, ${PADX - 26}, ${H / 2})`}>Oil Premium</text>
    </svg>
  );
}

function SectorImpactBar({ value }: { value: number }) {
  const absW = Math.abs(value) * 14;
  const color = value >= 0 ? "#22c55e" : "#ef4444";
  return (
    <div className="flex items-center gap-1">
      <div className="w-20 h-3 bg-muted rounded overflow-hidden relative">
        {value >= 0 ? (
          <div className="absolute left-1/2 top-0 h-full rounded" style={{ width: absW, background: color }} />
        ) : (
          <div className="absolute top-0 h-full rounded" style={{ width: absW, right: "50%", background: color }} />
        )}
        <div className="absolute left-1/2 top-0 w-px h-full bg-muted" />
      </div>
      <span className="text-xs font-mono" style={{ color, minWidth: 28 }}>
        {value >= 0 ? `+${value}` : value}
      </span>
    </div>
  );
}

// ── Tab 1: Event Impact ────────────────────────────────────────────────────────
function EventImpactTab() {
  const [selectedEvent, setSelectedEvent] = useState<GeoEvent | null>(GEO_EVENTS[6]);

  const meanReversion = useMemo(() => {
    const posM3 = GEO_EVENTS.filter(e => e.m3 > 0).length;
    return { pct: Math.round((posM3 / GEO_EVENTS.length) * 100), count: posM3 };
  }, []);

  return (
    <div className="space-y-6">
      {/* stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Events Analyzed", value: "10", sub: "since 1990", icon: <Globe className="w-4 h-4" />, color: "text-primary" },
          { label: "Positive 3M Returns", value: `${meanReversion.pct}%`, sub: `${meanReversion.count} of 10 events`, icon: <TrendingUp className="w-4 h-4" />, color: "text-green-400" },
          { label: "Avg Recovery Time", value: "26 days", sub: "median trading days", icon: <Activity className="w-4 h-4" />, color: "text-amber-400" },
          { label: "Buy-the-Dip Edge", value: "+12.4%", sub: "avg 3M after initial drop", icon: <Target className="w-4 h-4" />, color: "text-primary" },
        ].map(item => (
          <Card key={item.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={cn("mb-1", item.color)}>{item.icon}</div>
              <div className="text-xl font-bold text-foreground">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground/70 mt-0.5">{item.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* event table + detail */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Card className="xl:col-span-3 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              S&P 500 Reactions to Major Geopolitical Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left px-4 py-2 font-medium">Event</th>
                    <th className="text-right px-2 py-2 font-medium">1D</th>
                    <th className="text-right px-2 py-2 font-medium">1W</th>
                    <th className="text-right px-2 py-2 font-medium">1M</th>
                    <th className="text-right px-2 py-2 font-medium">3M</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {GEO_EVENTS.map(evt => (
                    <tr
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={cn(
                        "border-b border-border/50 cursor-pointer transition-colors",
                        selectedEvent?.id === evt.id
                          ? "bg-muted"
                          : "hover:bg-muted/40"
                      )}
                    >
                      <td className="px-4 py-2">
                        <div className="font-medium text-foreground leading-tight">{evt.name}</div>
                        <div className="text-muted-foreground text-xs">{evt.date} · {evt.category}</div>
                      </td>
                      {[evt.d1, evt.w1, evt.m1, evt.m3].map((v, i) => (
                        <td key={i} className="text-right px-2 py-2 font-mono" style={{ color: impactColor(v) }}>
                          {fmt(v)}
                        </td>
                      ))}
                      <td className="px-2 py-2">
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/70" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* detail panel */}
        <AnimatePresence mode="wait">
          {selectedEvent && (
            <motion.div
              key={selectedEvent.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2 }}
              className="xl:col-span-2"
            >
              <Card className="bg-card border-border h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">{selectedEvent.name}</CardTitle>
                  <div className="text-xs text-muted-foreground">{selectedEvent.date}</div>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {/* SVG bar chart for returns */}
                  <div>
                    <div className="text-muted-foreground mb-2 font-medium">S&P 500 Return</div>
                    {[
                      { label: "1 Day", v: selectedEvent.d1 },
                      { label: "1 Week", v: selectedEvent.w1 },
                      { label: "1 Month", v: selectedEvent.m1 },
                      { label: "3 Month", v: selectedEvent.m3 },
                    ].map(({ label, v }) => (
                      <div key={label} className="flex items-center gap-2 mb-1">
                        <span className="w-14 text-muted-foreground">{label}</span>
                        <ReturnBar value={v} />
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex gap-3">
                      <span className="text-muted-foreground">Oil Shock:</span>
                      <span className="font-mono" style={{ color: impactColor(selectedEvent.oilShock) }}>
                        {fmt(selectedEvent.oilShock)}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-muted-foreground">Gold Bid:</span>
                      <span className={selectedEvent.goldBid ? "text-amber-400" : "text-muted-foreground"}>
                        {selectedEvent.goldBid ? "Yes — safe haven demand" : "No significant move"}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-muted-foreground">USD Bid:</span>
                      <span className={selectedEvent.usdBid ? "text-primary" : "text-muted-foreground"}>
                        {selectedEvent.usdBid ? "Yes — flight to safety" : "No / weakened"}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-muted-foreground">Recovery:</span>
                      <span className="text-green-400">{selectedEvent.recoveryDays === 0 ? "Immediate rally" : `~${selectedEvent.recoveryDays} trading days`}</span>
                    </div>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="text-muted-foreground font-medium mb-1.5">Asset Class Winners</div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {selectedEvent.winners.map(w => (
                        <Badge key={w} className="bg-green-900/40 text-green-400 border-green-800 text-xs">{w}</Badge>
                      ))}
                    </div>
                    <div className="text-muted-foreground font-medium mb-1.5">Asset Class Losers</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedEvent.losers.map(l => (
                        <Badge key={l} className="bg-red-900/40 text-red-400 border-red-800 text-xs">{l}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border pt-3 bg-muted/30 rounded p-2 text-muted-foreground">
                    <Info className="w-3.5 h-3.5 inline mr-1 text-primary" />
                    Mean reversion: {selectedEvent.m3 > 0 ? "Markets recovered and advanced by 3-month mark." : "Recovery incomplete at 3 months — structural headwinds persisted."}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Tab 2: Sanctions & Trade ───────────────────────────────────────────────────
function SanctionsTradeTab() {
  const [activeSection, setActiveSection] = useState<"swift" | "dedollar" | "decoupling">("swift");

  return (
    <div className="space-y-4">
      {/* section nav */}
      <div className="flex gap-2 flex-wrap">
        {(["swift", "dedollar", "decoupling"] as const).map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-medium transition-colors",
              activeSection === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted"
            )}
          >
            {s === "swift" ? "SWIFT Exclusion" : s === "dedollar" ? "De-Dollarization" : "Tech Decoupling"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {activeSection === "swift" && (
            <div className="space-y-4">
              {/* SWIFT mechanism SVG */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-400" />
                    SWIFT Exclusion Mechanism — Russia Feb 2022
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 560 120" className="w-full" style={{ height: 120 }}>
                    {/* Nodes */}
                    {[
                      { x: 50, label: "Russian Bank", color: "#ef4444" },
                      { x: 160, label: "SWIFT Network", color: "#f97316" },
                      { x: 290, label: "Correspondent\nBank (EU/US)", color: "#3b82f6" },
                      { x: 420, label: "Global Trade\nPartner", color: "#22c55e" },
                    ].map(({ x, label, color }) => (
                      <g key={label}>
                        <rect x={x - 45} y={30} width={90} height={40} rx="6" fill={color + "22"} stroke={color} strokeWidth="1.2" />
                        {label.includes("\n")
                          ? label.split("\n").map((line, li) => (
                              <text key={li} x={x} y={47 + li * 12} fill={color} fontSize="8" textAnchor="middle">{line}</text>
                            ))
                          : <text x={x} y={54} fill={color} fontSize="8" textAnchor="middle">{label}</text>
                        }
                      </g>
                    ))}
                    {/* Cross arrow (blocked) */}
                    <line x1="107" y1="50" x2="113" y2="50" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arr)" />
                    <text x="128" y="30" fill="#ef4444" fontSize="9" textAnchor="middle">BLOCKED</text>
                    <text x="128" y="42" fill="#ef4444" fontSize="7" textAnchor="middle">Feb 28, 2022</text>
                    {/* Arrow EU→trade (still open) */}
                    <line x1="337" y1="50" x2="373" y2="50" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arrG)" />
                    <text x="355" y="44" fill="#22c55e" fontSize="8" textAnchor="middle">Active</text>
                    {/* Alternative path */}
                    <path d="M95 72 Q128 95 160 72" fill="none" stroke="#a78bfa" strokeWidth="1.2" strokeDasharray="4,3" />
                    <text x="128" y="100" fill="#a78bfa" fontSize="7.5" textAnchor="middle">Alt: SPFS / CIPS / bilateral</text>
                    <defs>
                      <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" />
                      </marker>
                      <marker id="arrG" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e" />
                      </marker>
                    </defs>
                  </svg>
                  <div className="mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted-foreground/70" />
                    Secondary sanctions: any non-US/EU bank that processes transactions for sanctioned entities also faces exclusion — creating a chilling effect well beyond primary targets.
                  </div>
                </CardContent>
              </Card>

              {/* SWIFT impact table */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Russia: Key Metrics Before/After SWIFT Exclusion</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left px-4 py-2">Metric</th>
                        <th className="text-center px-3 py-2">Pre-Exclusion</th>
                        <th className="text-center px-3 py-2">T+6 Months</th>
                        <th className="text-center px-3 py-2">T+12 Months</th>
                        <th className="text-center px-3 py-2">T+24 Months</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SWIFT_ROWS.map(row => (
                        <tr key={row.metric} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-4 py-2 text-muted-foreground font-medium">{row.metric}</td>
                          <td className="text-center px-3 py-2 text-muted-foreground">{row.preExclusion}</td>
                          <td className="text-center px-3 py-2 text-red-400">{row.t6months}</td>
                          <td className="text-center px-3 py-2 text-amber-400">{row.t12months}</td>
                          <td className="text-center px-3 py-2 text-muted-foreground">{row.t24months}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-2 text-xs text-muted-foreground/70">E = estimated</div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "dedollar" && (
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    USD Share of Global FX Reserves 2000–2024
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SvgDeDollarization />
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    {[
                      { label: "USD decline since 2000", value: "−14.2 ppts", color: "text-red-400" },
                      { label: "CNY share gain", value: "+3.2 ppts", color: "text-amber-400" },
                      { label: "Gold reserves growth", value: "+6.1 ppts", color: "text-primary" },
                      { label: "USD still dominant", value: "57.3% share", color: "text-primary" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-muted rounded p-2.5">
                        <div className="text-muted-foreground mb-0.5">{label}</div>
                        <div className={cn("font-medium", color)}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground bg-muted/60 rounded p-3 space-y-1">
                    <div className="font-medium text-muted-foreground">Key De-Dollarization Drivers</div>
                    <div>• BRICS expansion — collective push for local currency trade settlement</div>
                    <div>• US weaponization of dollar: freezing $300B in Russian reserves raised concerns</div>
                    <div>• China–Saudi oil deals partially settled in CNY (Petro-yuan)</div>
                    <div>• Central bank gold accumulation: Poland, Hungary, China, India adding reserves</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Currency Weaponization — Escalation Ladder</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    {[
                      { level: 1, label: "Tariffs & Trade Restrictions", desc: "Import duties, quotas, anti-dumping measures", color: "#f59e0b" },
                      { level: 2, label: "Currency Manipulation Designation", desc: "Treasury labels; triggers IMF review, investment restrictions", color: "#f97316" },
                      { level: 3, label: "Targeted Sanctions", desc: "Individual/entity blacklisting, asset freezes", color: "#ef4444" },
                      { level: 4, label: "Sectoral Sanctions", desc: "Energy, banking, defense sector restrictions", color: "#dc2626" },
                      { level: 5, label: "SWIFT Exclusion", desc: "Cuts off global payment network access — nuclear financial option", color: "#991b1b" },
                    ].map(({ level, label, desc, color }) => (
                      <div key={level} className="flex items-start gap-3 p-2 rounded" style={{ background: color + "11", borderLeft: `3px solid ${color}` }}>
                        <span className="font-bold text-sm mt-0.5" style={{ color, minWidth: 16 }}>{level}</span>
                        <div>
                          <div className="font-medium text-foreground">{label}</div>
                          <div className="text-muted-foreground">{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "decoupling" && (
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    US–China Technology Decoupling Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative ml-4 space-y-3">
                    <div className="absolute left-8 top-2 bottom-2 w-px bg-muted" />
                    {DECOUPLING_EVENTS.map((evt, i) => (
                      <div key={i} className="flex gap-4 relative">
                        <div
                          className="w-16 text-xs font-medium flex-shrink-0 pt-0.5"
                          style={{ color: evt.impact === "high" ? "#ef4444" : evt.impact === "medium" ? "#f59e0b" : "#22c55e" }}
                        >
                          {evt.year}
                        </div>
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 z-10"
                          style={{ background: evt.impact === "high" ? "#ef4444" : evt.impact === "medium" ? "#f59e0b" : "#22c55e" }}
                        />
                        <div className="flex-1 pb-1">
                          <div className="text-xs text-muted-foreground leading-relaxed">{evt.event}</div>
                          <Badge
                            className={cn(
                              "text-[11px] mt-1",
                              evt.impact === "high"
                                ? "bg-red-900/40 text-red-400 border-red-800"
                                : evt.impact === "medium"
                                ? "bg-amber-900/40 text-amber-400 border-amber-800"
                                : "bg-green-900/40 text-green-400 border-green-800"
                            )}
                          >
                            {evt.impact} impact
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Anchor className="w-4 h-4 text-green-400" />
                    Friend-Shoring & Supply Chain Realignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {[
                      {
                        region: "Americas (Nearshoring)",
                        color: "#3b82f6",
                        plays: ["Mexico: Auto/Electronics", "USMCA beneficiaries", "Panama logistics hub"],
                        risk: "Labor costs rising; infrastructure gaps",
                      },
                      {
                        region: "South & SE Asia (China+1)",
                        color: "#22c55e",
                        plays: ["Vietnam: Electronics/Apparel", "India: Phones/Semis", "Malaysia: Chips packaging"],
                        risk: "Own geopolitical risks; infrastructure",
                      },
                      {
                        region: "Europe (Strategic Industries)",
                        color: "#f59e0b",
                        plays: ["Germany: Green tech reshoring", "Poland: Eastern EU hub", "Netherlands: ASML semi"],
                        risk: "Higher energy costs; demographic headwinds",
                      },
                    ].map(({ region, color, plays, risk }) => (
                      <div key={region} className="rounded p-3" style={{ background: color + "11", border: `1px solid ${color}33` }}>
                        <div className="font-medium mb-2" style={{ color }}>{region}</div>
                        {plays.map(p => (
                          <div key={p} className="text-muted-foreground flex items-start gap-1 mb-0.5">
                            <span style={{ color }} className="mt-0.5">•</span> {p}
                          </div>
                        ))}
                        <div className="mt-2 text-muted-foreground text-xs">Risk: {risk}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground space-y-1 bg-muted/50 rounded p-3">
                    <div className="font-medium text-muted-foreground">Deglobalization Indicators</div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { label: "FDI to China (% of global)", value: "2.3% (was 6.3% in 2019)" },
                        { label: "US imports from Mexico", value: "+38% since 2021" },
                        { label: "Global trade / GDP ratio", value: "Declining from 61% peak" },
                        { label: "Reshoring job announcements", value: "840K US jobs, 2022–2024" },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-muted rounded p-2">
                          <div className="text-muted-foreground">{label}</div>
                          <div className="text-muted-foreground font-medium mt-0.5">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Tab 3: Geopolitical Risk Premium ──────────────────────────────────────────
function RiskPremiumTab() {
  return (
    <div className="space-y-4">
      {/* GPR chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            Geopolitical Risk Index (GPR) — Quarterly 2015–2024
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Baseline = 100 (average 2000–2019). Index spikes precede equity volatility by 2–6 weeks on average.
          </p>
        </CardHeader>
        <CardContent>
          <SvgGPRChart quarters={GPR.quarters} values={GPR.values} />
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
            {[
              { label: "Current GPR (est.)", value: `${GPR.values[GPR.values.length - 1]}`, color: "text-orange-400" },
              { label: "Avg GPR (2015–2024)", value: "124", color: "text-muted-foreground" },
              { label: "Peak (Ukraine 2022)", value: "248", color: "text-red-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-muted rounded p-2.5 text-center">
                <div className={cn("text-lg font-medium", color)}>{value}</div>
                <div className="text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Oil price response */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Oil Price Response Function
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Expected oil premium (%) as a function of GPR index level
            </p>
          </CardHeader>
          <CardContent>
            <SvgOilResponse />
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              <div>• GPR 80–120: minimal oil premium (&lt;2%)</div>
              <div>• GPR 140–180: 8–16% premium — supply risk priced</div>
              <div>• GPR 200+: 20–30% premium — potential supply disruption</div>
            </div>
          </CardContent>
        </Card>

        {/* Safe haven flows */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Anchor className="w-4 h-4 text-primary" />
              Safe Haven Asset Performance During Geo-Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SAFE_HAVENS.map(sh => (
              <div key={sh.ticker} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-foreground">{sh.asset}</span>
                    <span className="text-muted-foreground/70 ml-1.5">{sh.ticker}</span>
                  </div>
                  <span className="text-green-400 font-mono">+{sh.avgReturn1m.toFixed(1)}% avg 1M</span>
                </div>
                <Progress value={sh.correlation * 100} className="h-1.5" />
                <div className="text-xs text-muted-foreground/70">{sh.mechanism}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sector impact matrix */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Sector Impact by Geopolitical Scenario (Standard Deviations from Normal)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-4 py-2 font-medium">Scenario</th>
                  {["Energy", "Defense", "Tech", "Food/Agri", "Finance", "Travel"].map(h => (
                    <th key={h} className="text-center px-3 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SECTOR_SCENARIOS.map(row => (
                  <tr key={row.scenario} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-2 text-muted-foreground font-medium whitespace-nowrap">{row.scenario}</td>
                    {[row.energy, row.defense, row.tech, row.food, row.finance, row.travel].map((v, i) => (
                      <td key={i} className="px-3 py-2">
                        <div className="flex justify-center">
                          <div className="px-2 py-0.5 rounded text-center font-mono text-xs min-w-[40px]"
                            style={{ color: impactColor(v), background: impactBg(v) }}>
                            {v >= 0 ? `+${v}σ` : `${v}σ`}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 text-xs text-muted-foreground/70">σ = standard deviations vs. historical sector mean return</div>
        </CardContent>
      </Card>

      {/* GPR pricing across asset classes */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Geopolitical Risk Pricing Across Asset Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {[
              {
                asset: "Equities",
                icon: <TrendingDown className="w-3.5 h-3.5" />,
                color: "#ef4444",
                points: [
                  "Every +10pt GPR → equity risk premium rises ~12bps",
                  "Effect stronger in EM vs. DM markets",
                  "Defense sector acts as natural in-portfolio hedge",
                  "Earnings guidance cuts follow geo uncertainty spikes",
                ],
              },
              {
                asset: "Fixed Income",
                icon: <Activity className="w-3.5 h-3.5" />,
                color: "#3b82f6",
                points: [
                  "US Treasuries see safe-haven demand flight",
                  "EM sovereign spreads widen 30–80bps on high GPR",
                  "Flight-to-quality flattens yield curve in crises",
                  "European sovereigns diverge from US in regional shocks",
                ],
              },
              {
                asset: "Commodities",
                icon: <Zap className="w-3.5 h-3.5" />,
                color: "#f59e0b",
                points: [
                  "Oil most sensitive — supply disruption risk priced",
                  "Gold exhibits strongest persistent safe-haven premium",
                  "Wheat/food spikes in conflict zones (Russia/Ukraine = 30% global export)",
                  "Industrial metals (copper) often fall on demand fears",
                ],
              },
            ].map(({ asset, icon, color, points }) => (
              <div key={asset} className="bg-muted rounded p-3">
                <div className="flex items-center gap-2 mb-2" style={{ color }}>
                  {icon}
                  <span className="font-medium">{asset}</span>
                </div>
                {points.map((p, i) => (
                  <div key={i} className="text-muted-foreground flex gap-1 mb-1">
                    <span style={{ color }} className="flex-shrink-0">•</span>
                    {p}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 4: Portfolio Positioning ──────────────────────────────────────────────
function PortfolioPositioningTab() {
  const [selectedScenario, setSelectedScenario] = useState<StressScenario>(STRESS_SCENARIOS[0]);

  return (
    <div className="space-y-4">
      {/* Scenario selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {STRESS_SCENARIOS.map(sc => (
          <button
            key={sc.id}
            onClick={() => setSelectedScenario(sc)}
            className={cn(
              "rounded p-3 text-left text-xs transition-all border",
              selectedScenario.id === sc.id
                ? "bg-red-900/30 border-red-700"
                : "bg-card border-border hover:border-border"
            )}
          >
            <div className="font-medium text-foreground leading-snug mb-1">{sc.name}</div>
            <div className="text-muted-foreground">Prob: {sc.probability}%</div>
          </button>
        ))}
      </div>

      {/* Selected scenario detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedScenario.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
        >
          <Card className="bg-card border-red-900/40">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Stress Test: {selectedScenario.name}
                </CardTitle>
                <Badge className="bg-red-900/40 text-red-400 border-red-800">{selectedScenario.probability}% probability</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                {[
                  { label: "S&P 500 Max Drawdown", value: `${selectedScenario.spDraw}%`, color: "text-red-400" },
                  { label: "Duration Estimate", value: `${selectedScenario.duration}M`, color: "text-amber-400" },
                  { label: "Oil Surge", value: `+${selectedScenario.oilSurge}%`, color: "text-amber-400" },
                  { label: "VIX Spike", value: `~${selectedScenario.vixSpike}`, color: "text-red-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-muted rounded p-2.5 text-center">
                    <div className={cn("text-xl font-medium", color)}>{value}</div>
                    <div className="text-muted-foreground mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-green-400 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Recommended Hedges
                  </div>
                  {selectedScenario.hedges.map(h => (
                    <div key={h} className="flex items-start gap-1.5 text-xs text-muted-foreground mb-1">
                      <span className="text-green-500 flex-shrink-0 mt-0.5">•</span> {h}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-medium text-primary mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Potential Beneficiaries
                  </div>
                  {selectedScenario.positives.map(p => (
                    <div key={p} className="flex items-start gap-1.5 text-xs text-muted-foreground mb-1">
                      <span className="text-primary flex-shrink-0 mt-0.5">•</span> {p}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Hedge strategy table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-green-400" />
            Geopolitical Hedge Strategies — Effectiveness Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-4 py-2 font-medium">Strategy</th>
                  <th className="text-center px-3 py-2 font-medium">Effectiveness</th>
                  <th className="text-center px-3 py-2 font-medium">Cost</th>
                  <th className="text-center px-3 py-2 font-medium">Complexity</th>
                  <th className="text-left px-3 py-2 font-medium">Best For</th>
                </tr>
              </thead>
              <tbody>
                {HEDGE_STRATEGIES.map(hs => (
                  <tr key={hs.name} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-2 text-foreground font-medium">{hs.name}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-green-400">{hs.effectiveness}%</span>
                        <div className="w-20 h-1.5 bg-muted rounded overflow-hidden">
                          <div className="h-full bg-green-500 rounded" style={{ width: `${hs.effectiveness}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-muted-foreground text-xs">{hs.cost}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge className={cn("text-[11px]",
                        hs.complexity === "Low" ? "bg-green-900/40 text-green-400 border-green-800"
                        : hs.complexity === "Medium" ? "bg-amber-900/40 text-amber-400 border-amber-800"
                        : "bg-red-900/40 text-red-400 border-red-800"
                      )}>
                        {hs.complexity}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{hs.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Geopolitical diversification + multinational exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Geopolitical Diversification Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {[
              { label: "Country Concentration Risk (HHI)", value: 0.42, threshold: 0.35, good: false, desc: "High if >0.35 — overexposed to single country" },
              { label: "Geopolitical Beta", value: 0.78, threshold: 0.60, good: false, desc: "Portfolio sensitivity to GPR index movements" },
              { label: "Safe-Haven Allocation", value: 0.12, threshold: 0.10, good: true, desc: "Target 10–15% in gold/treasuries/CHF" },
              { label: "Defense Sector Weight", value: 0.04, threshold: 0.03, good: true, desc: "Minimum 3% for conflict hedge purposes" },
              { label: "EM Revenue Exposure", value: 0.31, threshold: 0.25, good: false, desc: "Elevated — consider reducing or hedging" },
            ].map(({ label, value, threshold, good, desc }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-muted-foreground">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-foreground">{value.toFixed(2)}</span>
                    <Badge className={cn("text-[11px]", good
                      ? "bg-green-900/40 text-green-400 border-green-800"
                      : "bg-red-900/40 text-red-400 border-red-800")}>
                      {good ? "OK" : "High"}
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={Math.min((value / (threshold * 2)) * 100, 100)}
                  className="h-1"
                />
                <div className="text-muted-foreground/70 text-xs mt-0.5">{desc}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Multinational Revenue Exposure Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {[
              { ticker: "AAPL", name: "Apple", china: 19, russia: 0, em: 28, tariffRisk: "High" },
              { ticker: "NVDA", name: "Nvidia", china: 17, russia: 0, em: 32, tariffRisk: "High" },
              { ticker: "MCD",  name: "McDonald's", china: 7, russia: 0, em: 38, tariffRisk: "Medium" },
              { ticker: "XOM",  name: "ExxonMobil", china: 5, russia: 0, em: 45, tariffRisk: "Medium" },
              { ticker: "BA",   name: "Boeing", china: 22, russia: 0, em: 41, tariffRisk: "Very High" },
              { ticker: "JPM",  name: "JPMorgan", china: 8, russia: 0, em: 22, tariffRisk: "Low" },
            ].map(({ ticker, name, china, em, tariffRisk }) => (
              <div key={ticker} className="flex items-center gap-3 p-2 bg-muted/60 rounded">
                <span className="font-mono text-primary w-10 flex-shrink-0">{ticker}</span>
                <span className="text-muted-foreground w-28 flex-shrink-0">{name}</span>
                <div className="flex-1 flex gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground/70">CN</span>
                    <span className={cn("font-mono", china > 15 ? "text-red-400" : "text-muted-foreground")}>{china}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground/70">EM</span>
                    <span className={cn("font-mono", em > 35 ? "text-amber-400" : "text-muted-foreground")}>{em}%</span>
                  </div>
                </div>
                <Badge className={cn("text-[11px] flex-shrink-0",
                  tariffRisk === "Very High" ? "bg-red-900/40 text-red-400 border-red-800"
                  : tariffRisk === "High" ? "bg-orange-900/40 text-orange-400 border-orange-800"
                  : tariffRisk === "Medium" ? "bg-amber-900/40 text-amber-400 border-amber-800"
                  : "bg-green-900/40 text-green-400 border-green-800"
                )}>
                  {tariffRisk}
                </Badge>
              </div>
            ))}
            <div className="text-muted-foreground/70 text-xs pt-1">
              CN = China revenue exposure. EM = total emerging market exposure. Tariff risk based on product mix and bilateral trade volumes.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Political risk insurance note */}
      <Card className="bg-card border-amber-900/30">
        <CardContent className="p-4 flex items-start gap-3 text-xs">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-amber-300 mb-1">Political Risk Insurance (PRI)</div>
            <div className="text-muted-foreground space-y-1">
              <div>Offered by MIGA (World Bank), OPIC/DFC, Lloyd's syndicates, and AIG. Covers expropriation, currency inconvertibility, political violence, and contract frustration.</div>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <div className="bg-muted rounded p-2"><span className="text-muted-foreground">Premium range:</span> <span className="text-foreground">0.5%–3.0% of insured value/yr</span></div>
                <div className="bg-muted rounded p-2"><span className="text-muted-foreground">Coverage term:</span> <span className="text-foreground">1–15 years</span></div>
                <div className="bg-muted rounded p-2"><span className="text-muted-foreground">Best for:</span> <span className="text-foreground">FDI in EM, mining, infrastructure</span></div>
                <div className="bg-muted rounded p-2"><span className="text-muted-foreground">Limitation:</span> <span className="text-foreground">Not for listed securities / liquid portfolios</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GeopoliticsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-red-900/30 border border-red-800/50">
            <Globe className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Geopolitics & Financial Markets</h1>
            <p className="text-sm text-muted-foreground">
              How geopolitical events move markets — sanctions, trade wars, currency weaponization, and risk premiums
            </p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="events">
        <TabsList className="bg-card border border-border mb-4 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="events" className="text-xs data-[state=active]:bg-muted">
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />Event Impact
          </TabsTrigger>
          <TabsTrigger value="sanctions" className="text-xs data-[state=active]:bg-muted">
            <Lock className="w-3.5 h-3.5 mr-1.5" />Sanctions & Trade
          </TabsTrigger>
          <TabsTrigger value="premium" className="text-xs data-[state=active]:bg-muted">
            <Activity className="w-3.5 h-3.5 mr-1.5" />Risk Premium
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="text-xs data-[state=active]:bg-muted">
            <Target className="w-3.5 h-3.5 mr-1.5" />Portfolio Positioning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="data-[state=inactive]:hidden">
          <EventImpactTab />
        </TabsContent>
        <TabsContent value="sanctions" className="data-[state=inactive]:hidden">
          <SanctionsTradeTab />
        </TabsContent>
        <TabsContent value="premium" className="data-[state=inactive]:hidden">
          <RiskPremiumTab />
        </TabsContent>
        <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
          <PortfolioPositioningTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
