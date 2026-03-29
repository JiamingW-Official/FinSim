"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  DollarSign,
  Shield,
  Calculator,
  Activity,
  Calendar,
  ArrowUpDown,
  Flame,
  Wheat,
  Landmark,
  ChevronRight,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 642001;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Framer Motion variants ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ContractSpec {
  name: string;
  symbol: string;
  exchange: string;
  contractSize: string;
  tickSize: number;
  tickValue: number;
  margin: number;
  notional: number;
  unit: string;
  price: number;
  icon: React.ReactNode;
}

interface ForwardPoint {
  month: string;
  crude: number;
  gold: number;
  corn: number;
}

interface BasisPoint {
  date: string;
  cashPrice: number;
  futuresPrice: number;
  basis: number;
}

interface SpreadType {
  name: string;
  description: string;
  longLeg: string;
  shortLeg: string;
  currentValue: number;
  unit: string;
  color: string;
}

interface HedgeScenario {
  title: string;
  type: "short" | "long";
  description: string;
  cashPrice: number;
  futuresPrice: number;
  quantity: number;
  contracts: number;
  contractSize: number;
  targetPrice: number;
  outcomePrice: number;
  basisRisk: number;
}

interface SeasonalEntry {
  month: string;
  crude: number;
  gold: number;
  corn: number;
  natgas: number;
}

// ── Contract Specs Data ───────────────────────────────────────────────────────
const CONTRACT_SPECS: ContractSpec[] = [
  {
    name: "Crude Oil (WTI)",
    symbol: "CL",
    exchange: "NYMEX",
    contractSize: "1,000 barrels",
    tickSize: 0.01,
    tickValue: 10,
    margin: 5500,
    notional: 82000,
    unit: "per barrel",
    price: 82.0,
    icon: <Flame className="w-4 h-4 text-orange-400" />,
  },
  {
    name: "Gold",
    symbol: "GC",
    exchange: "COMEX",
    contractSize: "100 troy oz",
    tickSize: 0.1,
    tickValue: 10,
    margin: 8500,
    notional: 207000,
    unit: "per troy oz",
    price: 2070.0,
    icon: <DollarSign className="w-4 h-4 text-yellow-400" />,
  },
  {
    name: "Corn",
    symbol: "ZC",
    exchange: "CBOT",
    contractSize: "5,000 bushels",
    tickSize: 0.0025,
    tickValue: 12.5,
    margin: 1500,
    notional: 24000,
    unit: "per bushel",
    price: 4.8,
    icon: <Wheat className="w-4 h-4 text-amber-400" />,
  },
  {
    name: "S&P 500 E-mini",
    symbol: "ES",
    exchange: "CME",
    contractSize: "$50 × index",
    tickSize: 0.25,
    tickValue: 12.5,
    margin: 13200,
    notional: 265000,
    unit: "index points",
    price: 5300.0,
    icon: <BarChart2 className="w-4 h-4 text-primary" />,
  },
  {
    name: "10Y T-Note",
    symbol: "ZN",
    exchange: "CBOT",
    contractSize: "$100,000 face",
    tickSize: 0.015625,
    tickValue: 15.625,
    margin: 1800,
    notional: 109500,
    unit: "% of par",
    price: 109.5,
    icon: <Landmark className="w-4 h-4 text-emerald-400" />,
  },
];

// ── Expiration Calendar ───────────────────────────────────────────────────────
const EXPIRATION_MONTHS = ["Mar", "Jun", "Sep", "Dec"];
const CONTRACT_EXPIRATIONS: Record<string, string[]> = {
  CL: ["Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Dec 26"],
  GC: ["Apr 26", "Jun 26", "Aug 26", "Oct 26", "Dec 26", "Feb 27"],
  ZC: ["Mar 26", "May 26", "Jul 26", "Sep 26", "Dec 26"],
  ES: ["Mar 26", "Jun 26", "Sep 26", "Dec 26"],
  ZN: ["Mar 26", "Jun 26", "Sep 26", "Dec 26"],
};

// ── Forward Curve Data ────────────────────────────────────────────────────────
function generateForwardCurve(): ForwardPoint[] {
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  // Crude: mild contango (storage cost)
  // Gold: slight contango (carry cost)
  // Corn: seasonal backwardation then contango
  return months.map((month, i) => ({
    month,
    crude: 82.0 + i * 0.22 + (rand() - 0.5) * 0.15,
    gold: 2070.0 + i * 3.8 + (rand() - 0.5) * 2,
    corn: i < 4 ? 4.8 - i * 0.04 + (rand() - 0.5) * 0.02 : 4.64 + (i - 4) * 0.06 + (rand() - 0.5) * 0.02,
  }));
}

const FORWARD_CURVE = generateForwardCurve();

// ── Basis Data ────────────────────────────────────────────────────────────────
function generateBasisData(): BasisPoint[] {
  const points: BasisPoint[] = [];
  let cash = 82.5;
  let futures = 83.0;
  for (let i = 0; i < 24; i++) {
    cash += (rand() - 0.5) * 1.2;
    futures += (rand() - 0.5) * 1.1;
    const basis = cash - futures;
    points.push({
      date: `W${i + 1}`,
      cashPrice: Math.max(70, cash),
      futuresPrice: Math.max(70, futures),
      basis,
    });
  }
  return points;
}

const BASIS_DATA = generateBasisData();

const SPREAD_TYPES: SpreadType[] = [
  {
    name: "Crack Spread (3-2-1)",
    description: "3 crude → 2 gasoline + 1 heating oil. Reflects refining margin.",
    longLeg: "3× Crude Oil (CL)",
    shortLeg: "2× Gasoline (RB) + 1× Heating Oil (HO)",
    currentValue: 24.5,
    unit: "$/barrel",
    color: "text-orange-400",
  },
  {
    name: "Crush Spread",
    description: "Soybeans → soybean oil + soybean meal. Reflects crushing margin.",
    longLeg: "Soybeans (ZS)",
    shortLeg: "Soybean Oil (ZL) + Meal (ZM)",
    currentValue: 1.85,
    unit: "$/bushel",
    color: "text-green-400",
  },
  {
    name: "Calendar Spread (CL)",
    description: "Buy nearby month, sell deferred month. Profits from roll convergence.",
    longLeg: "CL May 26",
    shortLeg: "CL Jun 26",
    currentValue: -0.34,
    unit: "$/barrel",
    color: "text-primary",
  },
  {
    name: "TED Spread",
    description: "T-bill futures vs Eurodollar futures. Measures bank credit risk.",
    longLeg: "T-Bill (ZT)",
    shortLeg: "Eurodollar (GE)",
    currentValue: 42,
    unit: "basis points",
    color: "text-emerald-400",
  },
];

// ── Hedge Scenarios ───────────────────────────────────────────────────────────
const HEDGE_SCENARIOS: HedgeScenario[] = [
  {
    title: "Airline Fuel Hedge (Long Hedge)",
    type: "long",
    description:
      "An airline expects to buy 1M barrels of jet fuel in 3 months. They go LONG crude oil futures to lock in today's price and protect against rising costs.",
    cashPrice: 82.0,
    futuresPrice: 82.5,
    quantity: 1000000,
    contracts: 1000,
    contractSize: 1000,
    targetPrice: 82.0,
    outcomePrice: 91.0,
    basisRisk: 0.35,
  },
  {
    title: "Corn Farmer Hedge (Short Hedge)",
    type: "short",
    description:
      "A corn farmer expects to sell 500,000 bushels at harvest in 5 months. They go SHORT corn futures to lock in today's price and protect against falling prices.",
    cashPrice: 4.8,
    futuresPrice: 4.85,
    quantity: 500000,
    contracts: 100,
    contractSize: 5000,
    targetPrice: 4.8,
    outcomePrice: 4.2,
    basisRisk: 0.12,
  },
  {
    title: "Portfolio Equity Hedge (Short Hedge)",
    type: "short",
    description:
      "A fund manager holds $5M in S&P 500 stocks (beta=1.0). They short E-mini futures to hedge market risk during uncertainty.",
    cashPrice: 5300,
    futuresPrice: 5302.5,
    quantity: 5000000,
    contracts: 19,
    contractSize: 50,
    targetPrice: 5300,
    outcomePrice: 4900,
    basisRisk: 0.02,
  },
];

// ── Seasonal Data ─────────────────────────────────────────────────────────────
function generateSeasonalData(): SeasonalEntry[] {
  return [
    { month: "Jan", crude: -1.2, gold: 1.8, corn: -0.5, natgas: 3.2 },
    { month: "Feb", crude: 0.4, gold: 0.6, corn: -0.8, natgas: -2.1 },
    { month: "Mar", crude: 1.8, gold: -0.3, corn: 0.3, natgas: -3.8 },
    { month: "Apr", crude: 2.1, gold: 1.1, corn: 2.4, natgas: -1.5 },
    { month: "May", crude: 1.5, gold: -0.8, corn: 3.1, natgas: 0.4 },
    { month: "Jun", crude: 0.8, gold: 0.5, corn: 1.8, natgas: 1.2 },
    { month: "Jul", crude: -0.5, gold: 0.9, corn: -2.5, natgas: 0.8 },
    { month: "Aug", crude: -1.1, gold: 1.6, corn: -3.2, natgas: 1.1 },
    { month: "Sep", crude: -0.9, gold: -0.4, corn: -1.4, natgas: 1.9 },
    { month: "Oct", crude: 0.3, gold: 1.2, corn: 0.8, natgas: 2.8 },
    { month: "Nov", crude: -1.5, gold: 0.7, corn: 0.2, natgas: 4.1 },
    { month: "Dec", crude: -0.8, gold: 2.1, corn: -0.6, natgas: 3.5 },
  ];
}

const SEASONAL_DATA = generateSeasonalData();

// ── COT Report Data ───────────────────────────────────────────────────────────
interface COTEntry {
  category: string;
  longPct: number;
  shortPct: number;
  net: number;
  color: string;
}

const COT_CRUDE: COTEntry[] = [
  { category: "Managed Money", longPct: 68, shortPct: 32, net: 245000, color: "bg-primary" },
  { category: "Swap Dealers", longPct: 28, shortPct: 72, net: -180000, color: "bg-primary" },
  { category: "Producers/Merchants", longPct: 22, shortPct: 78, net: -320000, color: "bg-orange-500" },
  { category: "Other Reportables", longPct: 55, shortPct: 45, net: 42000, color: "bg-teal-500" },
];

// ── SVG Forward Curve Chart ───────────────────────────────────────────────────
function ForwardCurveChart() {
  const W = 560;
  const H = 220;
  const PAD = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Normalize each commodity to % change from first point
  const crudeBase = FORWARD_CURVE[0].crude;
  const goldBase = FORWARD_CURVE[0].gold;
  const cornBase = FORWARD_CURVE[0].corn;

  const normalised = FORWARD_CURVE.map((p) => ({
    month: p.month,
    crude: ((p.crude - crudeBase) / crudeBase) * 100,
    gold: ((p.gold - goldBase) / goldBase) * 100,
    corn: ((p.corn - cornBase) / cornBase) * 100,
  }));

  const allVals = normalised.flatMap((p) => [p.crude, p.gold, p.corn]);
  const minV = Math.min(...allVals) - 0.2;
  const maxV = Math.max(...allVals) + 0.2;

  const n = normalised.length;
  const xScale = (i: number) => PAD.left + (i / (n - 1)) * chartW;
  const yScale = (v: number) => PAD.top + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const makePath = (key: "crude" | "gold" | "corn") =>
    normalised
      .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(p[key]).toFixed(1)}`)
      .join(" ");

  const zero = yScale(0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Grid */}
      {[-1, 0, 1, 2, 3].map((v) => (
        <g key={v}>
          <line x1={PAD.left} x2={W - PAD.right} y1={yScale(v)} y2={yScale(v)} stroke="#334155" strokeWidth="0.5" strokeDasharray="4,4" />
          <text x={PAD.left - 6} y={yScale(v) + 4} textAnchor="end" fill="#64748b" fontSize="10">
            {v > 0 ? `+${v}%` : `${v}%`}
          </text>
        </g>
      ))}
      {/* Zero line */}
      <line x1={PAD.left} x2={W - PAD.right} y1={zero} y2={zero} stroke="#475569" strokeWidth="1" />
      {/* X axis labels */}
      {normalised.map((p, i) =>
        i % 2 === 0 ? (
          <text key={i} x={xScale(i)} y={H - 8} textAnchor="middle" fill="#64748b" fontSize="10">
            {p.month}
          </text>
        ) : null
      )}
      {/* Lines */}
      <path d={makePath("crude")} fill="none" stroke="#f97316" strokeWidth="2" />
      <path d={makePath("gold")} fill="none" stroke="#eab308" strokeWidth="2" />
      <path d={makePath("corn")} fill="none" stroke="#84cc16" strokeWidth="2" />
      {/* Legend */}
      <circle cx={PAD.left + 10} cy={PAD.top - 6} r="4" fill="#f97316" />
      <text x={PAD.left + 18} y={PAD.top - 2} fill="#f97316" fontSize="10">Crude Oil</text>
      <circle cx={PAD.left + 85} cy={PAD.top - 6} r="4" fill="#eab308" />
      <text x={PAD.left + 93} y={PAD.top - 2} fill="#eab308" fontSize="10">Gold</text>
      <circle cx={PAD.left + 130} cy={PAD.top - 6} r="4" fill="#84cc16" />
      <text x={PAD.left + 138} y={PAD.top - 2} fill="#84cc16" fontSize="10">Corn</text>
    </svg>
  );
}

// ── SVG Basis Chart ───────────────────────────────────────────────────────────
function BasisChart() {
  const W = 560;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 35, left: 55 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const basisVals = BASIS_DATA.map((p) => p.basis);
  const minB = Math.min(...basisVals) - 0.2;
  const maxB = Math.max(...basisVals) + 0.2;
  const n = BASIS_DATA.length;

  const xScale = (i: number) => PAD.left + (i / (n - 1)) * chartW;
  const yScale = (v: number) => PAD.top + chartH - ((v - minB) / (maxB - minB)) * chartH;
  const zero = yScale(0);

  const posArea = BASIS_DATA.map((p, i) => {
    const x = xScale(i);
    const y = yScale(p.basis);
    return { x, y, pos: p.basis >= 0 };
  });

  // Area path for positive basis
  const makeFillPath = (positive: boolean) => {
    const pts = posArea.filter((p) => (positive ? p.y <= zero : p.y > zero));
    if (pts.length === 0) return "";
    return posArea
      .map((p, i) => {
        const clippedY = positive ? Math.min(p.y, zero) : Math.max(p.y, zero);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${clippedY.toFixed(1)}`;
      })
      .join(" ") +
      ` L${xScale(n - 1).toFixed(1)},${zero.toFixed(1)} L${PAD.left},${zero.toFixed(1)} Z`;
  };

  const basisPath = BASIS_DATA.map((p, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(p.basis).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Grid */}
      {[-1, -0.5, 0, 0.5, 1].map((v) => (
        <g key={v}>
          <line x1={PAD.left} x2={W - PAD.right} y1={yScale(v)} y2={yScale(v)} stroke="#334155" strokeWidth="0.5" strokeDasharray="4,4" />
          <text x={PAD.left - 5} y={yScale(v) + 4} textAnchor="end" fill="#64748b" fontSize="10">
            {v.toFixed(1)}
          </text>
        </g>
      ))}
      {/* Fill areas */}
      <path d={makeFillPath(true)} fill="rgba(34,197,94,0.12)" />
      <path d={makeFillPath(false)} fill="rgba(239,68,68,0.12)" />
      {/* Zero line */}
      <line x1={PAD.left} x2={W - PAD.right} y1={zero} y2={zero} stroke="#475569" strokeWidth="1" />
      {/* Basis line */}
      <path d={basisPath} fill="none" stroke="#60a5fa" strokeWidth="1.8" />
      {/* X labels */}
      {BASIS_DATA.map((p, i) =>
        i % 4 === 0 ? (
          <text key={i} x={xScale(i)} y={H - 8} textAnchor="middle" fill="#64748b" fontSize="9">
            {p.date}
          </text>
        ) : null
      )}
      {/* Y label */}
      <text x={16} y={H / 2} textAnchor="middle" fill="#94a3b8" fontSize="10" transform={`rotate(-90, 16, ${H / 2})`}>
        Basis ($/bbl)
      </text>
      {/* Title */}
      <text x={W / 2} y={PAD.top - 6} textAnchor="middle" fill="#94a3b8" fontSize="11">
        Crude Oil Basis: Cash – Futures (24 weeks)
      </text>
    </svg>
  );
}

// ── SVG Seasonal Chart ────────────────────────────────────────────────────────
interface SeasonalChartProps {
  commodity: "crude" | "gold" | "corn" | "natgas";
}

function SeasonalChart({ commodity }: SeasonalChartProps) {
  const W = 520;
  const H = 180;
  const PAD = { top: 20, right: 15, bottom: 30, left: 50 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const vals = SEASONAL_DATA.map((d) => d[commodity]);
  const maxAbs = Math.max(...vals.map(Math.abs)) + 0.5;
  const barW = chartW / 12 - 2;

  const xScale = (i: number) => PAD.left + (i / 12) * chartW + barW / 2 + 1;
  const yZero = PAD.top + chartH / 2;
  const yScale = (v: number) => (v / maxAbs) * (chartH / 2);

  const colorMap: Record<string, string> = {
    crude: "#f97316",
    gold: "#eab308",
    corn: "#84cc16",
    natgas: "#60a5fa",
  };
  const color = colorMap[commodity];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Grid lines */}
      {[-2, -1, 0, 1, 2].map((v) => (
        <g key={v}>
          <line x1={PAD.left} x2={W - PAD.right} y1={yZero - yScale(v)} y2={yZero - yScale(v)} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />
          {v !== 0 && (
            <text x={PAD.left - 5} y={yZero - yScale(v) + 4} textAnchor="end" fill="#64748b" fontSize="9">
              {v > 0 ? `+${v}` : v}%
            </text>
          )}
        </g>
      ))}
      {/* Zero line */}
      <line x1={PAD.left} x2={W - PAD.right} y1={yZero} y2={yZero} stroke="#475569" strokeWidth="1" />
      {/* Bars */}
      {SEASONAL_DATA.map((d, i) => {
        const val = d[commodity];
        const barH = Math.abs(yScale(val));
        const y = val >= 0 ? yZero - barH : yZero;
        return (
          <g key={d.month}>
            <rect
              x={xScale(i) - barW / 2}
              y={y}
              width={barW}
              height={barH}
              fill={val >= 0 ? color : "#ef4444"}
              opacity="0.8"
              rx="2"
            />
            <text x={xScale(i)} y={H - 8} textAnchor="middle" fill="#64748b" fontSize="9">
              {d.month}
            </text>
            <text
              x={xScale(i)}
              y={val >= 0 ? y - 3 : y + barH + 10}
              textAnchor="middle"
              fill={val >= 0 ? color : "#ef4444"}
              fontSize="8"
            >
              {val > 0 ? `+${val}` : val}
            </text>
          </g>
        );
      })}
      {/* Y label */}
      <text x={14} y={H / 2} textAnchor="middle" fill="#94a3b8" fontSize="9" transform={`rotate(-90, 14, ${H / 2})`}>
        Avg Monthly Return %
      </text>
    </svg>
  );
}

// ── Roll Yield Calculator ─────────────────────────────────────────────────────
function RollYieldCalc() {
  const [nearPrice, setNearPrice] = useState(82.0);
  const [farPrice, setFarPrice] = useState(83.1);
  const [months, setMonths] = useState(1);

  const rollYield = ((nearPrice - farPrice) / nearPrice) * (12 / months) * 100;
  const isContango = farPrice > nearPrice;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          Roll Yield Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Near Month Price ($)</p>
            <input
              type="number"
              className="w-full bg-muted border border-border rounded px-2 py-1 text-sm text-foreground"
              value={nearPrice}
              onChange={(e) => setNearPrice(Number(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Far Month Price ($)</p>
            <input
              type="number"
              className="w-full bg-muted border border-border rounded px-2 py-1 text-sm text-foreground"
              value={farPrice}
              onChange={(e) => setFarPrice(Number(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Months Between</p>
            <input
              type="number"
              className="w-full bg-muted border border-border rounded px-2 py-1 text-sm text-foreground"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              min="1"
              max="12"
            />
          </div>
        </div>
        <div className="rounded-lg p-3 border border-border bg-muted/40 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Market Structure</p>
            <Badge
              className={isContango ? "bg-red-500/20 text-red-400 border-red-500/30 mt-1" : "bg-green-500/20 text-green-400 border-green-500/30 mt-1"}
            >
              {isContango ? "Contango" : "Backwardation"}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Annualized Roll Yield</p>
            <p className={`text-xl font-bold mt-1 ${rollYield >= 0 ? "text-green-400" : "text-red-400"}`}>
              {rollYield > 0 ? "+" : ""}{rollYield.toFixed(2)}%
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {isContango
            ? "In contango, rolling futures forward costs money (negative roll yield). Long ETFs suffer drag."
            : "In backwardation, rolling futures forward earns money (positive roll yield). Long ETFs benefit."}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Hedge Ratio Calculator ────────────────────────────────────────────────────
function HedgeRatioCalc() {
  const [exposure, setExposure] = useState(5000000);
  const [contractSize, setContractSize] = useState(50);
  const [spotPrice, setSpotPrice] = useState(5300);
  const [beta, setBeta] = useState(1.0);

  const notionalPerContract = contractSize * spotPrice;
  const rawContracts = (exposure * beta) / notionalPerContract;
  const contracts = Math.round(rawContracts);
  const hedgeRatio = (contracts * notionalPerContract) / exposure;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Hedge Ratio Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Portfolio Value ($)</p>
            <input
              type="number"
              className="w-full bg-muted border border-border rounded px-2 py-1 text-sm text-foreground"
              value={exposure}
              onChange={(e) => setExposure(Number(e.target.value))}
              step="100000"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Portfolio Beta</p>
            <input
              type="number"
              className="w-full bg-muted border border-border rounded px-2 py-1 text-sm text-foreground"
              value={beta}
              onChange={(e) => setBeta(Number(e.target.value))}
              step="0.1"
              min="0.1"
              max="3"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Contract Size (multiplier)</p>
            <input
              type="number"
              className="w-full bg-muted border border-border rounded px-2 py-1 text-sm text-foreground"
              value={contractSize}
              onChange={(e) => setContractSize(Number(e.target.value))}
              step="10"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Index / Futures Price</p>
            <input
              type="number"
              className="w-full bg-muted border border-border rounded px-2 py-1 text-sm text-foreground"
              value={spotPrice}
              onChange={(e) => setSpotPrice(Number(e.target.value))}
              step="10"
            />
          </div>
        </div>
        <div className="rounded-lg p-3 border border-border bg-muted/40 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Contracts Needed</p>
            <p className="text-lg font-bold text-primary mt-1">{contracts}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Notional Hedged</p>
            <p className="text-lg font-medium text-foreground mt-1">${(contracts * notionalPerContract / 1e6).toFixed(2)}M</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hedge Ratio</p>
            <p className={`text-lg font-medium mt-1 ${Math.abs(hedgeRatio - 1) < 0.05 ? "text-green-400" : "text-amber-400"}`}>
              {(hedgeRatio * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Formula: N* = (Portfolio Value × Beta) / (Futures Price × Contract Size)
        </p>
      </CardContent>
    </Card>
  );
}

// ── Tab: Futures Basics ───────────────────────────────────────────────────────
function FuturesBasicsTab() {
  const [selectedContract, setSelectedContract] = useState<ContractSpec | null>(null);

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
      {/* Intro */}
      <Card className="border-border bg-card">
        <CardContent className="pt-4 pb-3">
          <div className="flex gap-3">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              A <span className="text-foreground font-medium">futures contract</span> is a legally binding agreement to buy or sell a standardized quantity of an asset at a predetermined price on a specified future date. Futures trade on regulated exchanges and use{" "}
              <span className="text-foreground font-medium">margin</span> (performance bond) — not the full notional value — making them highly leveraged instruments.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contract Specs Table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Contract Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Contract</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Exchange</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Size</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Tick</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Tick Value</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Price</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Notional</th>
                  <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Init Margin</th>
                </tr>
              </thead>
              <tbody>
                {CONTRACT_SPECS.map((c) => (
                  <tr
                    key={c.symbol}
                    onClick={() => setSelectedContract(selectedContract?.symbol === c.symbol ? null : c)}
                    className="border-b border-border/50 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {c.icon}
                        <div>
                          <p className="font-medium text-foreground">{c.symbol}</p>
                          <p className="text-xs text-muted-foreground">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Badge variant="outline" className="text-xs text-muted-foreground">{c.exchange}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right text-muted-foreground text-xs">{c.contractSize}</td>
                    <td className="px-3 py-2.5 text-right text-muted-foreground">{c.tickSize}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">${c.tickValue}</td>
                    <td className="px-3 py-2.5 text-right text-foreground font-medium">
                      {c.price >= 1000 ? c.price.toLocaleString() : c.price.toFixed(c.price < 10 ? 4 : 2)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-foreground">
                      ${c.notional >= 1e6 ? `${(c.notional / 1e6).toFixed(2)}M` : `${(c.notional / 1e3).toFixed(0)}K`}
                    </td>
                    <td className="px-4 py-2.5 text-right text-amber-400 font-medium">${c.margin.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Contract Detail Drawer */}
      {selectedContract && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {selectedContract.icon}
                  <h3 className="font-semibold text-foreground">{selectedContract.name} ({selectedContract.symbol})</h3>
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={() => setSelectedContract(null)}>✕</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Leverage</p>
                  <p className="text-lg font-medium text-orange-400">{(selectedContract.notional / selectedContract.margin).toFixed(1)}×</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Margin Rate</p>
                  <p className="text-lg font-medium text-foreground">{((selectedContract.margin / selectedContract.notional) * 100).toFixed(1)}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">1% Move P&L</p>
                  <p className="text-lg font-medium text-green-400">+${(selectedContract.notional * 0.01).toFixed(0)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Maintenance Margin</p>
                  <p className="text-lg font-medium text-foreground">${Math.round(selectedContract.margin * 0.75).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  A 1-tick ({selectedContract.tickSize}) move in {selectedContract.symbol} is worth <span className="text-foreground font-medium">${selectedContract.tickValue}</span> per contract.
                  With ${selectedContract.margin.toLocaleString()} margin and {(selectedContract.notional / selectedContract.margin).toFixed(1)}× leverage,
                  a {((selectedContract.margin / selectedContract.notional) * 100).toFixed(1)}% adverse move triggers a margin call.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Expiration Calendar */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Expiration Calendar 2026
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(CONTRACT_EXPIRATIONS).map(([sym, dates]) => (
              <div key={sym} className="flex items-start gap-3">
                <Badge variant="outline" className="text-xs text-muted-foreground w-10 flex-shrink-0 justify-center">{sym}</Badge>
                <div className="flex flex-wrap gap-1.5">
                  {dates.map((d) => (
                    <span key={d} className="text-xs px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">{d}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Most futures roll 5–10 days before expiration. The <span className="text-foreground">front month</span> has highest liquidity and tightest bid-ask spreads.
          </p>
        </CardContent>
      </Card>

      {/* Key Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Mark-to-Market",
            icon: <Activity className="w-4 h-4 text-primary" />,
            color: "border-border",
            text: "Futures positions are settled daily. Gains credited and losses debited from your margin account each night — unlike options which settle at expiration.",
          },
          {
            title: "Delivery vs Cash",
            icon: <ArrowUpDown className="w-4 h-4 text-primary" />,
            color: "border-border",
            text: "Physical delivery (CL, ZC, ZN) requires actual commodity exchange. Cash-settled contracts (ES) pay the cash difference. 99% of traders close before delivery.",
          },
          {
            title: "Position Limits",
            icon: <Shield className="w-4 h-4 text-amber-400" />,
            color: "border-amber-500/30",
            text: "CFTC enforces spot-month and all-month position limits to prevent market manipulation. Hedge exemptions exist for commercial entities with actual underlying exposure.",
          },
        ].map((item) => (
          <Card key={item.title} className={`border ${item.color} bg-card`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                {item.icon}
                <p className="font-medium text-foreground text-sm">{item.title}</p>
              </div>
              <p className="text-xs text-muted-foreground">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

// ── Tab: Contango & Backwardation ─────────────────────────────────────────────
function ContangoTab() {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
      {/* Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <h3 className="font-semibold text-red-400">Contango</h3>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Far &gt; Near</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Future prices are <span className="text-red-300 font-medium">higher than spot</span>. Normal for storable commodities — reflects storage costs, insurance, and financing. Crude oil is typically in contango during oversupply.
            </p>
            <div className="mt-3 p-2 bg-muted/40 rounded text-xs text-muted-foreground space-y-1">
              <p className="text-foreground font-medium">Cost of Carry Formula:</p>
              <p className="text-muted-foreground font-mono">F = S × e^(r + u - y)T</p>
              <p className="text-muted-foreground">r = risk-free rate, u = storage cost, y = convenience yield, T = time</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-green-400" />
              <h3 className="font-semibold text-green-400">Backwardation</h3>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Near &gt; Far</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Spot prices are <span className="text-green-300 font-medium">higher than futures</span>. Indicates tight supply or high immediate demand. Oil enters backwardation during supply disruptions. Gold rarely bacwardates.
            </p>
            <div className="mt-3 p-2 bg-muted/40 rounded text-xs text-muted-foreground space-y-1">
              <p className="text-foreground font-medium">Convenience Yield:</p>
              <p className="text-muted-foreground">High convenience yield (scarcity premium) pulls futures below spot, creating backwardation. Holders of physical enjoy scarcity benefits.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SVG Forward Curve */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Forward Curves — % Change from Spot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ForwardCurveChart />
          <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
            <div className="rounded p-2 bg-orange-500/10 border border-orange-500/20">
              <p className="text-orange-400 font-medium">Crude Oil (CL)</p>
              <p className="text-muted-foreground mt-0.5">Mild contango — storage & financing cost ~$0.22/month</p>
            </div>
            <div className="rounded p-2 bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-yellow-400 font-medium">Gold (GC)</p>
              <p className="text-muted-foreground mt-0.5">Contango — driven by risk-free rate less lease rate</p>
            </div>
            <div className="rounded p-2 bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 font-medium">Corn (ZC)</p>
              <p className="text-muted-foreground mt-0.5">Seasonal: mild backwardation pre-harvest → contango post-harvest</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roll Yield Calculator */}
      <RollYieldCalc />

      {/* ETF Impact */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Roll Yield Impact on ETFs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "USO (Crude ETF) — Strong Contango", spotReturn: 12.0, rollDrag: -18.5, totalReturn: -6.5, color: "text-red-400" },
              { label: "GLD (Gold ETF) — Mild Contango", spotReturn: 8.0, rollDrag: -2.1, totalReturn: 5.9, color: "text-green-400" },
              { label: "CORN ETF — Backwardation", spotReturn: 5.0, rollDrag: 3.2, totalReturn: 8.2, color: "text-green-400" },
            ].map((row) => (
              <div key={row.label} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-foreground mb-2">{row.label}</p>
                <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
                  <div>
                    <p className="text-muted-foreground">Spot Return</p>
                    <p className="text-primary font-medium">+{row.spotReturn}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Roll Drag/Yield</p>
                    <p className={`font-medium ${row.rollDrag < 0 ? "text-red-400" : "text-green-400"}`}>
                      {row.rollDrag > 0 ? "+" : ""}{row.rollDrag}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Return</p>
                    <p className={`font-medium ${row.color}`}>{row.totalReturn > 0 ? "+" : ""}{row.totalReturn}%</p>
                  </div>
                </div>
                <Progress value={Math.abs(row.rollDrag / row.spotReturn) * 100} className="h-1 mt-2 opacity-40" />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Roll drag can completely negate spot price gains. The infamous 2020 USO ETF crisis exemplified this — contango was so extreme that near-month CL futures went negative.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab: Basis & Spread Trading ───────────────────────────────────────────────
function BasisTab() {
  const [selectedSpread, setSelectedSpread] = useState<SpreadType>(SPREAD_TYPES[0]);

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
      <Card className="border-border bg-card">
        <CardContent className="pt-4 pb-3">
          <div className="flex gap-3">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              The <span className="text-foreground font-medium">basis</span> is the difference between the cash (spot) price and the nearest futures price: Basis = Cash − Futures. Basis traders profit from changes in the relationship between spot and futures prices, isolating supply/demand fundamentals from directional price risk.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Basis Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Crude Oil Cash vs Futures Basis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BasisChart />
          <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/40 border border-green-500/60" />
              <span>Positive basis (Cash &gt; Futures)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500/40 border border-red-500/60" />
              <span>Negative basis (Cash &lt; Futures)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spread Types */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-primary" />
            Spread Strategies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SPREAD_TYPES.map((sp) => (
              <button
                key={sp.name}
                onClick={() => setSelectedSpread(sp)}
                className={`text-left p-2 rounded-lg border transition-all text-xs text-muted-foreground ${
                  selectedSpread.name === sp.name
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/40 hover:border-primary/40"
                }`}
              >
                <p className={`font-medium ${sp.color}`}>{sp.name.split(" (")[0]}</p>
                <p className="text-muted-foreground mt-0.5">{sp.unit}</p>
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-3">
            <div className="flex justify-between items-start">
              <h3 className={`font-medium ${selectedSpread.color}`}>{selectedSpread.name}</h3>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Current Value</p>
                <p className={`text-lg font-medium ${selectedSpread.currentValue < 0 ? "text-red-400" : "text-green-400"}`}>
                  {selectedSpread.currentValue > 0 ? "+" : ""}{selectedSpread.currentValue} {selectedSpread.unit}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{selectedSpread.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded p-2 bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-muted-foreground">Long Leg</p>
                <p className="text-green-400 font-medium mt-0.5">{selectedSpread.longLeg}</p>
              </div>
              <div className="rounded p-2 bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-muted-foreground">Short Leg</p>
                <p className="text-red-400 font-medium mt-0.5">{selectedSpread.shortLeg}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crack Spread Detail */}
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-orange-400">Crack Spread Deep Dive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The 3-2-1 crack spread represents refining profitability: buy 3 barrels crude, produce 2 barrels gasoline + 1 barrel heating oil.
            </p>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded p-3 bg-muted/40 border border-border">
                <p className="text-muted-foreground text-xs">Crude Input</p>
                <p className="text-orange-400 font-medium text-lg">$82.00</p>
                <p className="text-muted-foreground text-xs">3 × 42 gal/bbl</p>
              </div>
              <div className="rounded p-3 bg-muted/40 border border-border">
                <p className="text-muted-foreground text-xs">Gasoline Output</p>
                <p className="text-green-400 font-medium text-lg">$2.68/gal</p>
                <p className="text-muted-foreground text-xs">2 × 42 gal → $225.12</p>
              </div>
              <div className="rounded p-3 bg-muted/40 border border-border">
                <p className="text-muted-foreground text-xs">HO Output</p>
                <p className="text-primary font-medium text-lg">$2.74/gal</p>
                <p className="text-muted-foreground text-xs">1 × 42 gal → $115.08</p>
              </div>
            </div>
            <div className="rounded p-3 bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gross Refining Margin</p>
                <p className="text-xs text-muted-foreground mt-0.5">(2 × RBOB + 1 × HO − 3 × CL) / 3</p>
              </div>
              <p className="text-2xl font-bold text-orange-400">$24.40/bbl</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Refiners lock in profits by selling crack spread (short gasoline + HO futures, long crude futures). Traders buy crack spread when they expect refining margins to expand.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab: Hedging with Futures ─────────────────────────────────────────────────
function HedgingTab() {
  const [activeScenario, setActiveScenario] = useState(0);
  const scenario = HEDGE_SCENARIOS[activeScenario];

  const priceMoved = scenario.outcomePrice - scenario.targetPrice;
  const isAdverse = scenario.type === "short" ? priceMoved < 0 : priceMoved > 0;
  const cashPnL = scenario.type === "short"
    ? (scenario.outcomePrice - scenario.targetPrice) * scenario.quantity
    : (scenario.targetPrice - scenario.outcomePrice) * scenario.quantity;
  const futuresPnL = scenario.type === "short"
    ? (scenario.futuresPrice - scenario.outcomePrice) * scenario.contracts * scenario.contractSize
    : (scenario.outcomePrice - scenario.futuresPrice) * scenario.contracts * scenario.contractSize;
  const netPnL = cashPnL + futuresPnL;
  const effectivePrice = scenario.type === "short"
    ? scenario.targetPrice + futuresPnL / scenario.quantity
    : scenario.targetPrice - futuresPnL / scenario.quantity;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
      {/* Concept */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-400" />
              <h3 className="font-medium text-foreground text-sm">Short Hedge</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Used by producers (farmers, miners, oil companies) who own the underlying asset and fear price decline. <span className="text-foreground">SELL futures</span> to lock in a selling price. If spot falls, futures gain offsets cash market loss.
            </p>
            <div className="mt-2 p-2 bg-muted/40 rounded text-xs text-muted-foreground">
              <p className="text-muted-foreground">Examples: Corn farmer, gold miner, oil producer, airline short-selling jet fuel inventory</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-foreground text-sm">Long Hedge</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Used by consumers who need to buy the underlying asset in the future and fear price increases. <span className="text-foreground">BUY futures</span> to lock in a purchase price. If spot rises, futures gain offsets higher cash cost.
            </p>
            <div className="mt-2 p-2 bg-muted/40 rounded text-xs text-muted-foreground">
              <p className="text-muted-foreground">Examples: Airline buying jet fuel, food company buying wheat, manufacturer buying copper</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Selector */}
      <div className="flex gap-2">
        {HEDGE_SCENARIOS.map((sc, i) => (
          <Button
            key={sc.title}
            variant={activeScenario === i ? "default" : "outline"}
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setActiveScenario(i)}
          >
            {i === 0 ? "Airline" : i === 1 ? "Corn Farm" : "Portfolio"}
          </Button>
        ))}
      </div>

      {/* Scenario Detail */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            {scenario.title}
            <Badge className={scenario.type === "short" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"}>
              {scenario.type === "short" ? "Short Hedge" : "Long Hedge"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{scenario.description}</p>

          {/* Setup */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded p-3 bg-muted/40 border border-border text-center">
              <p className="text-xs text-muted-foreground">Current Cash Price</p>
              <p className="text-lg font-medium text-foreground">${scenario.cashPrice.toFixed(2)}</p>
            </div>
            <div className="rounded p-3 bg-muted/40 border border-border text-center">
              <p className="text-xs text-muted-foreground">Futures Price</p>
              <p className="text-lg font-medium text-foreground">${scenario.futuresPrice.toFixed(2)}</p>
            </div>
            <div className="rounded p-3 bg-muted/40 border border-border text-center">
              <p className="text-xs text-muted-foreground">Contracts</p>
              <p className="text-lg font-medium text-primary">{scenario.contracts}</p>
            </div>
            <div className="rounded p-3 bg-muted/40 border border-border text-center">
              <p className="text-xs text-muted-foreground">Basis Risk</p>
              <p className="text-lg font-medium text-amber-400">±${scenario.basisRisk.toFixed(2)}</p>
            </div>
          </div>

          {/* Outcome */}
          <div className="rounded-lg border border-border p-4 bg-muted/20">
            <p className="text-sm font-medium text-foreground mb-3">Outcome: Price moves to ${scenario.outcomePrice.toFixed(2)}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className={`rounded p-3 border ${cashPnL < 0 ? "border-red-500/30 bg-red-500/10" : "border-green-500/30 bg-green-500/10"}`}>
                <p className="text-xs text-muted-foreground">Cash Market P&L</p>
                <p className={`text-lg font-medium ${cashPnL < 0 ? "text-red-400" : "text-green-400"}`}>
                  {cashPnL >= 0 ? "+" : ""}${Math.abs(cashPnL / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-muted-foreground mt-1">{cashPnL < 0 ? "Loss from adverse price move" : "Gain from favorable price move"}</p>
              </div>
              <div className={`rounded p-3 border ${futuresPnL > 0 ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}>
                <p className="text-xs text-muted-foreground">Futures Hedge P&L</p>
                <p className={`text-lg font-medium ${futuresPnL > 0 ? "text-green-400" : "text-red-400"}`}>
                  {futuresPnL >= 0 ? "+" : ""}${Math.abs(futuresPnL / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-muted-foreground mt-1">{futuresPnL > 0 ? "Futures offset the loss" : "Opportunity cost of hedge"}</p>
              </div>
              <div className={`rounded p-3 border ${Math.abs(netPnL) < 5000 ? "border-border bg-primary/10" : netPnL > 0 ? "border-green-500/30 bg-green-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
                <p className="text-xs text-muted-foreground">Net P&L (Residual)</p>
                <p className={`text-lg font-medium ${Math.abs(netPnL) < 5000 ? "text-primary" : netPnL > 0 ? "text-green-400" : "text-amber-400"}`}>
                  {netPnL >= 0 ? "+" : ""}${Math.abs(netPnL / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-muted-foreground mt-1">Basis risk residual</p>
              </div>
            </div>
            <div className="mt-3 rounded p-2 bg-primary/5 border border-primary/20 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Effective {scenario.type === "short" ? "Sale" : "Purchase"} Price</p>
              <p className="text-foreground font-medium">${effectivePrice.toFixed(2)} <span className="text-xs text-muted-foreground ml-1">(target was ${scenario.targetPrice.toFixed(2)})</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hedge Ratio Calculator */}
      <HedgeRatioCalc />

      {/* Cross Hedging */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cross-Hedging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            When no futures contract exists for the exact asset, cross-hedge using a correlated contract. The hedge ratio adjusts for the correlation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
            {[
              { asset: "Jet Fuel", hedgeWith: "Crude Oil (CL)", corr: 0.92, hr: 0.88, note: "Jet fuel has no futures; crude is close enough with 0.88× ratio" },
              { asset: "Soybean Oil", hedgeWith: "Soybeans (ZS)", corr: 0.84, hr: 0.71, note: "Oil is ~34% of bean weight; adjust for crush margin exposure" },
              { asset: "Corporate Bonds", hedgeWith: "10Y T-Note (ZN)", corr: 0.78, hr: 0.65, note: "DV01 mismatch; rate hedge doesn't eliminate credit spread risk" },
            ].map((item) => (
              <div key={item.asset} className="rounded p-3 border border-border bg-muted/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-foreground">{item.asset}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-primary">{item.hedgeWith}</span>
                </div>
                <div className="flex gap-3 mb-1">
                  <span className="text-muted-foreground">ρ = <span className="text-foreground">{item.corr}</span></span>
                  <span className="text-muted-foreground">HR = <span className="text-amber-400">{item.hr}</span></span>
                </div>
                <p className="text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground p-2 bg-muted/40 rounded">
            Cross-hedge ratio = ρ × (σ_asset / σ_futures). Lower correlation = higher basis risk = less effective hedge.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab: Speculative Strategies ───────────────────────────────────────────────
function SpeculativeTab() {
  const [selectedCommodity, setSelectedCommodity] = useState<"crude" | "gold" | "corn" | "natgas">("crude");

  const commodityOptions: { key: "crude" | "gold" | "corn" | "natgas"; label: string; color: string }[] = [
    { key: "crude", label: "Crude Oil", color: "text-orange-400" },
    { key: "gold", label: "Gold", color: "text-yellow-400" },
    { key: "corn", label: "Corn", color: "text-green-400" },
    { key: "natgas", label: "Nat Gas", color: "text-primary" },
  ];

  const avgReturn = SEASONAL_DATA.reduce((acc, d) => acc + d[selectedCommodity], 0) / 12;
  const bestMonth = SEASONAL_DATA.reduce((best, d) => d[selectedCommodity] > best[selectedCommodity] ? d : best);
  const worstMonth = SEASONAL_DATA.reduce((worst, d) => d[selectedCommodity] < worst[selectedCommodity] ? d : worst);

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
      {/* Strategies Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "Trend Following (CTA Style)",
            icon: <TrendingUp className="w-4 h-4 text-primary" />,
            color: "border-border",
            points: [
              "Enter long when 50-day MA crosses above 200-day MA",
              "Enter short when 50-day MA crosses below 200-day MA",
              "Use ATR-based position sizing: risk 1–2% capital per trade",
              "Commodities trend 30–40% of the time (higher than equities)",
              "Sharpe ~0.5–0.8 in diversified commodity CTA portfolios",
            ],
          },
          {
            title: "Momentum in Commodities",
            icon: <Activity className="w-4 h-4 text-primary" />,
            color: "border-border",
            points: [
              "12-1 momentum: past 12 months minus last month performance",
              "Long top quintile, short bottom quintile across 24 commodities",
              "Rebalance monthly; works best with 3-12 month lookback",
              "Combines well with carry (roll yield) as orthogonal signal",
              "Historical Sharpe: ~0.6 standalone, ~1.0 blended with carry",
            ],
          },
        ].map((s) => (
          <Card key={s.title} className={`border ${s.color} bg-card`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-3">
                {s.icon}
                <h3 className="font-medium text-foreground text-sm">{s.title}</h3>
              </div>
              <ul className="space-y-1.5">
                {s.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* COT Report */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            COT Report — Crude Oil Positioning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            The CFTC Commitments of Traders (COT) report, published weekly, shows open interest by trader category. Managed Money net positions are a key contrarian indicator at extremes.
          </p>
          <div className="space-y-2">
            {COT_CRUDE.map((entry) => (
              <div key={entry.category} className="rounded p-3 border border-border bg-muted/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">{entry.category}</span>
                  <Badge
                    className={entry.net > 0 ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}
                  >
                    Net {entry.net > 0 ? "+" : ""}{(entry.net / 1000).toFixed(0)}K
                  </Badge>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mb-1">
                  <span>Long: {entry.longPct}%</span>
                  <span>|</span>
                  <span>Short: {entry.shortPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                  <div className={`h-full ${entry.color}`} style={{ width: `${entry.longPct}%` }} />
                  <div className="h-full bg-red-500/60 flex-1" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded p-3 bg-amber-500/10 border border-amber-500/20 text-xs text-muted-foreground space-y-1">
            <p className="text-amber-400 font-medium">COT Interpretation Rules</p>
            <p className="text-muted-foreground">• Commercials (Producers/Merchants) are usually right at extremes — they have fundamental information</p>
            <p className="text-muted-foreground">• Managed Money at extreme net long = contrarian bearish signal (crowded trade)</p>
            <p className="text-muted-foreground">• Watch for large Managed Money position unwind — can trigger sharp moves</p>
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Patterns */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Seasonal Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {commodityOptions.map((c) => (
              <Button
                key={c.key}
                variant={selectedCommodity === c.key ? "default" : "outline"}
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setSelectedCommodity(c.key)}
              >
                {c.label}
              </Button>
            ))}
          </div>
          <SeasonalChart commodity={selectedCommodity} />
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
            <div className="rounded p-2 bg-green-500/10 border border-green-500/20">
              <p className="text-muted-foreground">Best Month</p>
              <p className="text-green-400 font-medium">{bestMonth.month}</p>
              <p className="text-green-400">+{bestMonth[selectedCommodity]}%</p>
            </div>
            <div className="rounded p-2 bg-muted/40 border border-border">
              <p className="text-muted-foreground">Avg Monthly</p>
              <p className={`font-medium ${avgReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
                {avgReturn >= 0 ? "+" : ""}{avgReturn.toFixed(2)}%
              </p>
              <p className="text-muted-foreground">({(avgReturn * 12).toFixed(1)}% ann.)</p>
            </div>
            <div className="rounded p-2 bg-red-500/10 border border-red-500/20">
              <p className="text-muted-foreground">Worst Month</p>
              <p className="text-red-400 font-medium">{worstMonth.month}</p>
              <p className="text-red-400">{worstMonth[selectedCommodity]}%</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded border border-border">
            <p className="text-foreground font-medium mb-1">Key Seasonal Drivers:</p>
            {selectedCommodity === "crude" && (
              <>
                <p>• Apr–May: Refinery maintenance drives demand; gasoline demand ramps for driving season</p>
                <p>• Nov–Dec: Seasonal demand slowdown + OPEC management often weights on prices</p>
              </>
            )}
            {selectedCommodity === "gold" && (
              <>
                <p>• Jan: New year investment demand; Indian wedding season buying</p>
                <p>• Aug–Sep: Diwali jewellery demand in India; safe-haven buying ahead of uncertainty</p>
              </>
            )}
            {selectedCommodity === "corn" && (
              <>
                <p>• Apr–May: Planting progress uncertainty creates rallies on weather concerns</p>
                <p>• Jul–Aug: Pollination risk peak — heat/drought fears can spike prices sharply</p>
                <p>• Oct: Harvest pressure consistently the weakest seasonal period</p>
              </>
            )}
            {selectedCommodity === "natgas" && (
              <>
                <p>• Nov–Jan: Winter heating demand; weather events create extreme vol spikes</p>
                <p>• Mar: Shoulder season demand drop; storage refill begins, weighing on price</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Warning */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            <Activity className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-400">Speculative Futures Risk Factors</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>• <span className="text-foreground">Leverage amplification</span>: 10–20× leverage means small moves cause large P&L swings</p>
                <p>• <span className="text-foreground">Margin calls</span>: Adverse moves may require immediate additional capital or forced liquidation</p>
                <p>• <span className="text-foreground">Gap risk</span>: Weekend/overnight geopolitical events can open far from close price</p>
                <p>• <span className="text-foreground">Liquidity risk</span>: Back-month contracts can have wide spreads and limited depth</p>
                <p>• <span className="text-foreground">Roll cost</span>: Continuously rolling positions incur transaction costs and potential slippage</p>
                <p>• <span className="text-foreground">Force majeure</span>: Weather, political disruptions, sanctions can cause non-statistical moves</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FuturesTradingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="border-l-4 border-l-primary rounded-lg bg-card p-6 space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <BarChart2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Futures Trading</h1>
              <p className="text-sm text-muted-foreground">Commodities, financials, hedging &amp; speculation</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {[
              { label: "Crude Oil (CL)", value: "$82.00", change: "+1.2%", up: true },
              { label: "Gold (GC)", value: "$2,070", change: "-0.3%", up: false },
              { label: "Corn (ZC)", value: "480.0¢", change: "+0.8%", up: true },
              { label: "S&P E-mini (ES)", value: "5,300", change: "+0.5%", up: true },
              { label: "10Y T-Note (ZN)", value: "109-16", change: "-0.2%", up: false },
            ].map((stat) => (
              <Card key={stat.label} className="border-border bg-card">
                <CardContent className="pt-2 pb-2 px-3">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm font-medium text-foreground">{stat.value}</p>
                    <span className={`text-xs font-medium ${stat.up ? "text-emerald-400" : "text-red-400"}`}>{stat.change}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="basics" className="mt-8 space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-muted/40 p-1 rounded-lg">
            <TabsTrigger value="basics" className="text-xs text-muted-foreground">Futures Basics</TabsTrigger>
            <TabsTrigger value="contango" className="text-xs text-muted-foreground">Contango &amp; Backwardation</TabsTrigger>
            <TabsTrigger value="basis" className="text-xs text-muted-foreground">Basis &amp; Spreads</TabsTrigger>
            <TabsTrigger value="hedging" className="text-xs text-muted-foreground">Hedging</TabsTrigger>
            <TabsTrigger value="speculative" className="text-xs text-muted-foreground">Speculative Strategies</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="mt-0">
            <FuturesBasicsTab />
          </TabsContent>
          <TabsContent value="contango" className="mt-0">
            <ContangoTab />
          </TabsContent>
          <TabsContent value="basis" className="mt-0">
            <BasisTab />
          </TabsContent>
          <TabsContent value="hedging" className="mt-0">
            <HedgingTab />
          </TabsContent>
          <TabsContent value="speculative" className="mt-0">
            <SpeculativeTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
