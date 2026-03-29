"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wheat,
  Droplets,
  Globe,
  DollarSign,
  Activity,
  Info,
  ChevronDown,
  ChevronUp,
  Flame,
  Cpu,
  Leaf,
  Package,
  ArrowRight,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 732001;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Interfaces ─────────────────────────────────────────────────────────────────

interface SuperCycle {
  id: string;
  label: string;
  era: string;
  startYear: number;
  peakYear: number;
  endYear: number;
  durationYrs: number;
  drivers: string[];
  peakCommodities: string[];
  indexGain: number;
  color: string;
  status: "historical" | "current";
}

interface EnergyRow {
  name: string;
  type: string;
  price: number;
  unit: string;
  yoyChange: number;
  opecShare: number;
  breakeven: number | null;
  demandGrowth: number;
}

interface MetalRow {
  name: string;
  symbol: string;
  price: number;
  unit: string;
  yoyChange: number;
  primaryDriver: string;
  evWeight: string;
  deficit: boolean;
}

interface AgriRow {
  name: string;
  symbol: string;
  price: number;
  unit: string;
  yoyChange: number;
  topProducer: string;
  laNinaImpact: "Negative" | "Positive" | "Neutral";
  harvestMonths: string;
}

interface InvestmentVehicle {
  name: string;
  ticker: string;
  type: "ETF" | "Futures" | "Equity" | "Royalty";
  aum: string;
  expenseRatio: number;
  rollCost: number | null;
  exposure: string;
  pros: string[];
  cons: string[];
}

// ── Static Data ────────────────────────────────────────────────────────────────

const SUPER_CYCLES: SuperCycle[] = [
  {
    id: "sc1",
    label: "Industrialization Boom",
    era: "1890s",
    startYear: 1890,
    peakYear: 1917,
    endYear: 1932,
    durationYrs: 42,
    drivers: ["US industrialization", "Railroad expansion", "WWI demand"],
    peakCommodities: ["Steel", "Coal", "Copper"],
    indexGain: 210,
    color: "#6366f1",
    status: "historical",
  },
  {
    id: "sc2",
    label: "Post-War Reconstruction",
    era: "1930s",
    startYear: 1933,
    peakYear: 1951,
    endYear: 1965,
    durationYrs: 32,
    drivers: ["WWII war effort", "Marshall Plan", "European reconstruction"],
    peakCommodities: ["Iron Ore", "Aluminum", "Oil"],
    indexGain: 175,
    color: "#8b5cf6",
    status: "historical",
  },
  {
    id: "sc3",
    label: "Oil Shock Era",
    era: "1970s",
    startYear: 1968,
    peakYear: 1980,
    endYear: 1986,
    durationYrs: 18,
    drivers: ["OPEC embargo", "USD debasement", "Cold War arms race"],
    peakCommodities: ["Crude Oil", "Gold", "Silver"],
    indexGain: 380,
    color: "#f59e0b",
    status: "historical",
  },
  {
    id: "sc4",
    label: "China Urbanization Wave",
    era: "2000s",
    startYear: 1999,
    peakYear: 2011,
    endYear: 2016,
    durationYrs: 17,
    drivers: ["China infrastructure", "BRIC growth", "USD weakness"],
    peakCommodities: ["Iron Ore", "Copper", "Coal", "Oil"],
    indexGain: 430,
    color: "#10b981",
    status: "historical",
  },
  {
    id: "sc5",
    label: "Green Energy Transition",
    era: "2020s+",
    startYear: 2020,
    peakYear: 2028,
    endYear: 2035,
    durationYrs: 15,
    drivers: ["EV adoption", "Grid electrification", "Decarbonization policy"],
    peakCommodities: ["Lithium", "Copper", "Cobalt", "Nickel"],
    indexGain: 0,
    color: "#06b6d4",
    status: "current",
  },
];

const ENERGY_ROWS: EnergyRow[] = [
  {
    name: "Crude Oil (WTI)",
    type: "Liquid",
    price: 78.4,
    unit: "/bbl",
    yoyChange: -4.2,
    opecShare: 38,
    breakeven: 45,
    demandGrowth: 1.2,
  },
  {
    name: "Brent Crude",
    type: "Liquid",
    price: 82.1,
    unit: "/bbl",
    yoyChange: -3.8,
    opecShare: 42,
    breakeven: 48,
    demandGrowth: 1.2,
  },
  {
    name: "Natural Gas (HH)",
    type: "Gas",
    price: 2.34,
    unit: "/MMBtu",
    yoyChange: -18.5,
    opecShare: 12,
    breakeven: null,
    demandGrowth: 2.8,
  },
  {
    name: "LNG (Asian)",
    type: "Gas",
    price: 11.2,
    unit: "/MMBtu",
    yoyChange: -28.3,
    opecShare: 0,
    breakeven: null,
    demandGrowth: 4.5,
  },
  {
    name: "Thermal Coal",
    type: "Coal",
    price: 108.5,
    unit: "/tonne",
    yoyChange: -22.1,
    opecShare: 0,
    breakeven: null,
    demandGrowth: -1.5,
  },
  {
    name: "Uranium",
    type: "Nuclear",
    price: 89.5,
    unit: "/lb",
    yoyChange: 14.8,
    opecShare: 0,
    breakeven: null,
    demandGrowth: 3.2,
  },
];

const METALS_ROWS: MetalRow[] = [
  {
    name: "Copper",
    symbol: "HG",
    price: 4.32,
    unit: "/lb",
    yoyChange: 8.4,
    primaryDriver: "EV + Grid",
    evWeight: "83 kg/EV",
    deficit: true,
  },
  {
    name: "Lithium Carbonate",
    symbol: "LIT",
    price: 13800,
    unit: "/tonne",
    yoyChange: -62.5,
    primaryDriver: "Battery Storage",
    evWeight: "8 kg/kWh",
    deficit: false,
  },
  {
    name: "Iron Ore",
    symbol: "TIO",
    price: 108.2,
    unit: "/tonne",
    yoyChange: -12.3,
    primaryDriver: "China Steel",
    evWeight: "—",
    deficit: false,
  },
  {
    name: "Gold",
    symbol: "GC",
    price: 2318,
    unit: "/oz",
    yoyChange: 12.1,
    primaryDriver: "Store of Value",
    evWeight: "—",
    deficit: false,
  },
  {
    name: "Aluminum",
    symbol: "ALI",
    price: 2440,
    unit: "/tonne",
    yoyChange: 4.7,
    primaryDriver: "Lightweighting",
    evWeight: "200 kg/EV",
    deficit: false,
  },
  {
    name: "Nickel",
    symbol: "NI",
    price: 16800,
    unit: "/tonne",
    yoyChange: -28.4,
    primaryDriver: "Battery Cathodes",
    evWeight: "50 kg/EV",
    deficit: false,
  },
  {
    name: "Cobalt",
    symbol: "CO",
    price: 26500,
    unit: "/tonne",
    yoyChange: -45.2,
    primaryDriver: "Battery NMC",
    evWeight: "10 kg/EV",
    deficit: false,
  },
];

const AGRI_ROWS: AgriRow[] = [
  {
    name: "Corn",
    symbol: "ZC",
    price: 4.41,
    unit: "/bu",
    yoyChange: -18.2,
    topProducer: "USA",
    laNinaImpact: "Negative",
    harvestMonths: "Sep–Nov",
  },
  {
    name: "Wheat",
    symbol: "ZW",
    price: 5.58,
    unit: "/bu",
    yoyChange: -22.4,
    topProducer: "China/Russia",
    laNinaImpact: "Neutral",
    harvestMonths: "Jun–Aug",
  },
  {
    name: "Soybeans",
    symbol: "ZS",
    price: 11.75,
    unit: "/bu",
    yoyChange: -14.8,
    topProducer: "Brazil",
    laNinaImpact: "Negative",
    harvestMonths: "Oct–Nov",
  },
  {
    name: "Coffee (Arabica)",
    symbol: "KC",
    price: 216.8,
    unit: "/lb (¢)",
    yoyChange: 62.3,
    topProducer: "Brazil/Colombia",
    laNinaImpact: "Positive",
    harvestMonths: "Apr–Sep",
  },
  {
    name: "Cocoa",
    symbol: "CC",
    price: 9240,
    unit: "/tonne",
    yoyChange: 148.6,
    topProducer: "Ivory Coast",
    laNinaImpact: "Positive",
    harvestMonths: "Oct–Feb",
  },
  {
    name: "Sugar #11",
    symbol: "SB",
    price: 19.84,
    unit: "/lb (¢)",
    yoyChange: -8.6,
    topProducer: "Brazil/India",
    laNinaImpact: "Negative",
    harvestMonths: "Apr–Oct",
  },
];

const INVESTMENT_VEHICLES: InvestmentVehicle[] = [
  {
    name: "iPath Bloomberg Commodity",
    ticker: "DJP",
    type: "ETF",
    aum: "$0.6B",
    expenseRatio: 0.7,
    rollCost: 2.8,
    exposure: "Diversified basket",
    pros: ["Broad exposure", "Tax-advantaged ETN"],
    cons: ["Counterparty risk", "Roll yield drag"],
  },
  {
    name: "Invesco Optimum Yield",
    ticker: "PDBC",
    type: "ETF",
    aum: "$4.1B",
    expenseRatio: 0.59,
    rollCost: 1.4,
    exposure: "14 commodities optimized roll",
    pros: ["Optimized roll yield", "K-1 free"],
    cons: ["Active management risk"],
  },
  {
    name: "iShares S&P GSCI Commodity",
    ticker: "GSG",
    type: "ETF",
    aum: "$0.9B",
    expenseRatio: 0.75,
    rollCost: 3.1,
    exposure: "Energy-heavy GSCI index",
    pros: ["Liquid", "Oil-beta exposure"],
    cons: ["Concentrated in energy (>50%)", "High roll costs"],
  },
  {
    name: "WTI Crude Futures",
    ticker: "CL",
    type: "Futures",
    aum: "—",
    expenseRatio: 0,
    rollCost: 0.5,
    exposure: "Direct oil price",
    pros: ["No expense ratio", "Maximum leverage"],
    cons: ["Requires margin", "Monthly roll management"],
  },
  {
    name: "Freeport-McMoRan",
    ticker: "FCX",
    type: "Equity",
    aum: "$56B mkt cap",
    expenseRatio: 0,
    rollCost: null,
    exposure: "Copper & gold mining",
    pros: ["Operating leverage", "Dividend potential"],
    cons: ["Mining cost risk", "Jurisdiction risk"],
  },
  {
    name: "Royal Gold",
    ticker: "RGLD",
    type: "Royalty",
    aum: "$7.8B mkt cap",
    expenseRatio: 0,
    rollCost: null,
    exposure: "Gold/silver royalty streams",
    pros: ["No capex exposure", "Margin expansion in bull markets"],
    cons: ["Premium valuation", "Limited growth without new deals"],
  },
];

// ── SVG Chart: Super Cycle Index ───────────────────────────────────────────────

function SuperCycleChart({ selectedId }: { selectedId: string | null }) {
  const W = 640;
  const H = 260;
  const PAD = { top: 20, right: 20, bottom: 40, left: 56 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Build index series per cycle using seeded values
  const series = useMemo(() => {
    return SUPER_CYCLES.map((cycle) => {
      const points: { x: number; y: number }[] = [];
      const bars = 60;
      let val = 100;
      // reset seed each time
      let ls = cycle.startYear * 137 + 732001;
      const lr = () => {
        ls = (ls * 1103515245 + 12345) & 0x7fffffff;
        return ls / 0x7fffffff;
      };
      for (let i = 0; i <= bars; i++) {
        const progress = i / bars;
        // parabolic shape: rises then falls
        const peak = cycle.status === "current" ? 0.55 : 0.6;
        const shape =
          progress < peak
            ? Math.sin((Math.PI / 2) * (progress / peak))
            : Math.sin((Math.PI / 2) * (1 - (progress - peak) / (1 - peak)));
        const noise = (lr() - 0.5) * 12;
        val = 100 + shape * (cycle.indexGain > 0 ? cycle.indexGain : 80) + noise;
        points.push({ x: i / bars, y: val });
      }
      return { cycle, points };
    });
  }, []);

  const allY = series.flatMap((s) => s.points.map((p) => p.y));
  const minY = Math.min(...allY) - 20;
  const maxY = Math.max(...allY) + 20;

  const toX = (v: number) => PAD.left + v * chartW;
  const toY = (v: number) =>
    PAD.top + chartH - ((v - minY) / (maxY - minY)) * chartH;

  const yTicks = [100, 150, 200, 300, 400, 500].filter(
    (v) => v >= minY && v <= maxY
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* grid */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={toY(v)}
            y2={toY(v)}
            stroke="#ffffff10"
            strokeDasharray="4 4"
          />
          <text
            x={PAD.left - 6}
            y={toY(v)}
            fill="#6b7280"
            fontSize={10}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {v}
          </text>
        </g>
      ))}
      {/* lines */}
      {series.map(({ cycle, points }) => {
        const active = selectedId === null || selectedId === cycle.id;
        const d = points
          .map((p, i) =>
            i === 0
              ? `M ${toX(p.x)} ${toY(p.y)}`
              : `L ${toX(p.x)} ${toY(p.y)}`
          )
          .join(" ");
        return (
          <path
            key={cycle.id}
            d={d}
            fill="none"
            stroke={cycle.color}
            strokeWidth={active ? 2 : 1}
            opacity={active ? 1 : 0.2}
          />
        );
      })}
      {/* x-axis labels */}
      {["Start", "25%", "50%", "75%", "End"].map((label, i) => (
        <text
          key={label}
          x={toX(i * 0.25)}
          y={H - PAD.bottom + 14}
          fill="#6b7280"
          fontSize={10}
          textAnchor="middle"
        >
          {label}
        </text>
      ))}
      {/* y axis label */}
      <text
        x={12}
        y={PAD.top + chartH / 2}
        fill="#9ca3af"
        fontSize={10}
        textAnchor="middle"
        transform={`rotate(-90, 12, ${PAD.top + chartH / 2})`}
      >
        Index (Start=100)
      </text>
    </svg>
  );
}

// ── SVG Chart: Energy Supply/Demand ───────────────────────────────────────────

function EnergyBalanceChart() {
  const W = 520;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 36, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const supply = [101.8, 94.2, 96.5, 99.6, 101.4, 102.3, 103.1];
  const demand = [100.3, 91.1, 96.2, 99.8, 101.2, 102.5, 103.8];

  const allV = [...supply, ...demand];
  const minV = Math.min(...allV) - 1;
  const maxV = Math.max(...allV) + 1;

  const toX = (i: number) =>
    PAD.left + (i / (years.length - 1)) * chartW;
  const toY = (v: number) =>
    PAD.top + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const supplyPath = supply
    .map((v, i) => (i === 0 ? `M ${toX(i)} ${toY(v)}` : `L ${toX(i)} ${toY(v)}`))
    .join(" ");
  const demandPath = demand
    .map((v, i) => (i === 0 ? `M ${toX(i)} ${toY(v)}` : `L ${toX(i)} ${toY(v)}`))
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[92, 96, 100, 104].map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={toY(v)}
            y2={toY(v)}
            stroke="#ffffff10"
            strokeDasharray="3 3"
          />
          <text
            x={PAD.left - 6}
            y={toY(v)}
            fill="#6b7280"
            fontSize={9}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {v}M
          </text>
        </g>
      ))}
      <path d={supplyPath} fill="none" stroke="#f59e0b" strokeWidth={2} />
      <path d={demandPath} fill="none" stroke="#06b6d4" strokeWidth={2} strokeDasharray="6 3" />
      {years.map((yr, i) => (
        <text
          key={yr}
          x={toX(i)}
          y={H - PAD.bottom + 14}
          fill="#6b7280"
          fontSize={9}
          textAnchor="middle"
        >
          {yr}
        </text>
      ))}
      {/* legend */}
      <rect x={PAD.left + 4} y={PAD.top + 4} width={10} height={3} fill="#f59e0b" rx={1} />
      <text x={PAD.left + 18} y={PAD.top + 8} fill="#9ca3af" fontSize={9}>Supply (mb/d)</text>
      <rect x={PAD.left + 110} y={PAD.top + 4} width={10} height={3} fill="#06b6d4" rx={1} />
      <text x={PAD.left + 124} y={PAD.top + 8} fill="#9ca3af" fontSize={9}>Demand (mb/d)</text>
    </svg>
  );
}

// ── SVG Chart: Metal Prices Comparison ────────────────────────────────────────

function MetalPriceChart() {
  const W = 520;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 36, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const months = 24;

  // normalize to 100 at start
  const metals = [
    { name: "Copper", color: "#f97316" },
    { name: "Gold", color: "#fbbf24" },
    { name: "Iron Ore", color: "#94a3b8" },
    { name: "Lithium", color: "#34d399" },
  ];

  const series = useMemo(() => {
    return metals.map(({ name, color }) => {
      let ls = name.charCodeAt(0) * 1337 + 732001;
      const lr = () => {
        ls = (ls * 1103515245 + 12345) & 0x7fffffff;
        return ls / 0x7fffffff;
      };
      let val = 100;
      const points = [val];
      for (let i = 1; i <= months; i++) {
        val += (lr() - 0.5) * 8;
        val = Math.max(40, Math.min(180, val));
        points.push(val);
      }
      return { name, color, points };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allY = series.flatMap((s) => s.points);
  const minY = Math.min(...allY) - 5;
  const maxY = Math.max(...allY) + 5;

  const toX = (i: number) => PAD.left + (i / months) * chartW;
  const toY = (v: number) =>
    PAD.top + chartH - ((v - minY) / (maxY - minY)) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[60, 80, 100, 120, 140].filter((v) => v >= minY && v <= maxY).map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={toY(v)}
            y2={toY(v)}
            stroke="#ffffff10"
            strokeDasharray="3 3"
          />
          <text
            x={PAD.left - 6}
            y={toY(v)}
            fill="#6b7280"
            fontSize={9}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {v}
          </text>
        </g>
      ))}
      {series.map(({ color, points, name }) => {
        const d = points
          .map((v, i) =>
            i === 0 ? `M ${toX(i)} ${toY(v)}` : `L ${toX(i)} ${toY(v)}`
          )
          .join(" ");
        return <path key={name} d={d} fill="none" stroke={color} strokeWidth={1.5} />;
      })}
      {/* x labels */}
      {[0, 6, 12, 18, 24].map((i) => (
        <text
          key={i}
          x={toX(i)}
          y={H - PAD.bottom + 14}
          fill="#6b7280"
          fontSize={9}
          textAnchor="middle"
        >
          M{i === 0 ? "0" : i}
        </text>
      ))}
      {/* legend */}
      {series.map(({ name, color }, i) => (
        <g key={name}>
          <line
            x1={PAD.left + i * 90}
            x2={PAD.left + i * 90 + 10}
            y1={PAD.top + 8}
            y2={PAD.top + 8}
            stroke={color}
            strokeWidth={2}
          />
          <text
            x={PAD.left + i * 90 + 14}
            y={PAD.top + 11}
            fill="#9ca3af"
            fontSize={8}
          >
            {name}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── SVG Chart: Seasonal Agri Pattern ──────────────────────────────────────────

function AgriSeasonalChart() {
  const W = 520;
  const H = 200;
  const PAD = { top: 20, right: 16, bottom: 36, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  // Typical seasonal price index for corn/wheat/soy (normalized 90–120)
  const corn = [96, 97, 98, 102, 106, 108, 110, 104, 96, 94, 92, 94];
  const wheat = [104, 106, 108, 107, 106, 102, 96, 94, 96, 100, 103, 105];
  const coffee = [100, 101, 102, 104, 107, 112, 114, 116, 110, 104, 101, 100];

  const pairs = [
    { data: corn, color: "#f59e0b", name: "Corn" },
    { data: wheat, color: "#6366f1", name: "Wheat" },
    { data: coffee, color: "#92400e", name: "Coffee" },
  ];

  const allV = pairs.flatMap((p) => p.data);
  const minV = Math.min(...allV) - 2;
  const maxV = Math.max(...allV) + 2;

  const toX = (i: number) => PAD.left + (i / 11) * chartW;
  const toY = (v: number) =>
    PAD.top + chartH - ((v - minV) / (maxV - minV)) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[94, 100, 106, 112].filter((v) => v >= minV && v <= maxV).map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={toY(v)}
            y2={toY(v)}
            stroke="#ffffff10"
            strokeDasharray="3 3"
          />
          <text x={PAD.left - 6} y={toY(v)} fill="#6b7280" fontSize={9} textAnchor="end" dominantBaseline="middle">
            {v}
          </text>
        </g>
      ))}
      {pairs.map(({ data, color, name }) => {
        const d = data
          .map((v, i) =>
            i === 0 ? `M ${toX(i)} ${toY(v)}` : `L ${toX(i)} ${toY(v)}`
          )
          .join(" ");
        return <path key={name} d={d} fill="none" stroke={color} strokeWidth={2} />;
      })}
      {MONTH_LABELS.map((m, i) => (
        <text
          key={`m-${i}`}
          x={toX(i)}
          y={H - PAD.bottom + 14}
          fill="#6b7280"
          fontSize={9}
          textAnchor="middle"
        >
          {m}
        </text>
      ))}
      {pairs.map(({ name, color }, i) => (
        <g key={name}>
          <line x1={PAD.left + i * 80} x2={PAD.left + i * 80 + 12} y1={PAD.top + 8} y2={PAD.top + 8} stroke={color} strokeWidth={2} />
          <text x={PAD.left + i * 80 + 16} y={PAD.top + 11} fill="#9ca3af" fontSize={9}>{name}</text>
        </g>
      ))}
      {/* harvest band shading for corn Sep–Nov */}
      <rect
        x={toX(8)}
        y={PAD.top}
        width={toX(10) - toX(8)}
        height={chartH}
        fill="#f59e0b08"
        rx={2}
      />
      <text x={(toX(8) + toX(10)) / 2} y={PAD.top + 6} fill="#f59e0b60" fontSize={8} textAnchor="middle">Harvest</text>
    </svg>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ChangeChip({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs text-muted-foreground font-medium px-1.5 py-0.5 rounded ${
        pos
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400"
      }`}
    >
      {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function InfoBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
      <Info size={10} />
      {text}
    </span>
  );
}

// ── Expandable Card ────────────────────────────────────────────────────────────

function CycleCard({
  cycle,
  selected,
  onSelect,
}: {
  cycle: SuperCycle;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`rounded-lg border p-4 cursor-pointer transition-colors ${
        selected
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-foreground/[0.02] hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: cycle.color }}
          />
          <span className="font-semibold text-sm text-foreground">{cycle.label}</span>
          {cycle.status === "current" && (
            <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{cycle.era}</span>
          <span>{cycle.durationYrs}yr cycle</span>
          {cycle.indexGain > 0 && (
            <span className="text-emerald-400">+{cycle.indexGain}%</span>
          )}
          {selected ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <p className="text-muted-foreground mb-1.5 uppercase tracking-wide">Key Drivers</p>
                <ul className="space-y-1">
                  {cycle.drivers.map((d) => (
                    <li key={d} className="flex items-center gap-1.5 text-muted-foreground">
                      <ArrowRight size={10} className="text-primary shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-muted-foreground mb-1.5 uppercase tracking-wide">Peak Commodities</p>
                <div className="flex flex-wrap gap-1.5">
                  {cycle.peakCommodities.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-full text-xs text-muted-foreground font-medium"
                      style={{
                        background: cycle.color + "20",
                        color: cycle.color,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
              <span>
                Start: <span className="text-foreground">{cycle.startYear}</span>
              </span>
              <span>
                Peak: <span className="text-foreground">{cycle.peakYear}</span>
              </span>
              <span>
                End: <span className="text-foreground">{cycle.status === "current" ? "TBD" : cycle.endYear}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CommodityCyclesPage() {
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);

  // consume some rand() values to warm up the seed for charts
  useMemo(() => {
    for (let i = 0; i < 10; i++) rand();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* HERO Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 border-l-4 border-l-primary rounded-md bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-amber-500/15">
            <Activity className="text-amber-400" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Commodity Super-Cycles</h1>
            <p className="text-sm text-muted-foreground">
              Raw materials analysis, market dynamics, and investment vehicles
            </p>
          </div>
        </div>
        {/* summary chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          <InfoBadge text="5 Historical Cycles Analyzed" />
          <InfoBadge text="Current Cycle: Green Energy Transition" />
          <InfoBadge text="Avg Cycle Duration: 25yrs" />
        </div>
      </motion.div>

      <Tabs defaultValue="supercycle">
        <TabsList className="mb-6 flex flex-wrap gap-1 h-auto bg-foreground/5 p-1 rounded-lg">
          {[
            { value: "supercycle", label: "Super Cycle History", icon: <BarChart3 size={14} /> },
            { value: "energy", label: "Energy Complex", icon: <Flame size={14} /> },
            { value: "metals", label: "Metals", icon: <Cpu size={14} /> },
            { value: "agri", label: "Agricultural", icon: <Wheat size={14} /> },
            { value: "vehicles", label: "Investment Vehicles", icon: <Package size={14} /> },
          ].map(({ value, label, icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5"
            >
              {icon}
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1: Super Cycle History ─────────────────────────────────────── */}
        <TabsContent value="supercycle" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="space-y-4">
              <Card className="bg-foreground/[0.03] border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    Commodity Index (Normalized to Start=100)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SuperCycleChart selectedId={selectedCycle} />
                  <p className="text-xs text-muted-foreground mt-2">
                    Click a cycle below to highlight its trajectory
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-foreground/[0.03] border-border">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold text-amber-400">5</p>
                      <p className="text-xs text-muted-foreground">Identified Cycles</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-primary">25yr</p>
                      <p className="text-xs text-muted-foreground">Avg Duration</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-emerald-400">+299%</p>
                      <p className="text-xs text-muted-foreground">Avg Peak Gain</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Historical Cycles
              </h3>
              {SUPER_CYCLES.map((cycle) => (
                <CycleCard
                  key={cycle.id}
                  cycle={cycle}
                  selected={selectedCycle === cycle.id}
                  onSelect={() =>
                    setSelectedCycle(
                      selectedCycle === cycle.id ? null : cycle.id
                    )
                  }
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Energy Complex ──────────────────────────────────────────── */}
        <TabsContent value="energy" className="data-[state=inactive]:hidden">
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <Card className="bg-foreground/[0.03] border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    Global Oil Supply vs Demand (mb/d)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EnergyBalanceChart />
                </CardContent>
              </Card>

              <Card className="bg-foreground/[0.03] border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    OPEC+ Production Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      label: "OPEC+ Share of Global Supply",
                      value: 42,
                      color: "#f59e0b",
                      suffix: "%",
                    },
                    {
                      label: "Saudi Arabia Spare Capacity",
                      value: 2.8,
                      color: "#6366f1",
                      suffix: "mb/d",
                    },
                    {
                      label: "US Shale Production",
                      value: 13.2,
                      color: "#10b981",
                      suffix: "mb/d",
                    },
                    {
                      label: "US Shale Breakeven (WTI)",
                      value: 45,
                      color: "#06b6d4",
                      suffix: "$/bbl",
                    },
                  ].map(({ label, value, color, suffix }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium" style={{ color }}>
                          {value}
                          {suffix}
                        </span>
                      </div>
                      <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (value / 50) * 100)}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-foreground/[0.03] border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Energy Complex — Market Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-2 pr-4">Commodity</th>
                        <th className="text-left py-2 pr-4">Type</th>
                        <th className="text-right py-2 pr-4">Price</th>
                        <th className="text-right py-2 pr-4">YoY</th>
                        <th className="text-right py-2 pr-4">OPEC Share</th>
                        <th className="text-right py-2 pr-4">Breakeven</th>
                        <th className="text-right py-2">Demand Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ENERGY_ROWS.map((row) => (
                        <tr
                          key={row.name}
                          className="border-b border-border/50 hover:bg-muted/30"
                        >
                          <td className="py-2 pr-4 font-medium text-foreground">
                            {row.name}
                          </td>
                          <td className="py-2 pr-4">
                            <Badge className="text-xs bg-foreground/5 text-muted-foreground border-border">
                              {row.type}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 text-right font-mono text-foreground">
                            ${row.price.toFixed(2)}
                            <span className="text-muted-foreground ml-1 text-xs">
                              {row.unit}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-right">
                            <ChangeChip value={row.yoyChange} />
                          </td>
                          <td className="py-2 pr-4 text-right text-muted-foreground">
                            {row.opecShare > 0 ? `${row.opecShare}%` : "—"}
                          </td>
                          <td className="py-2 pr-4 text-right text-muted-foreground">
                            {row.breakeven !== null
                              ? `$${row.breakeven}/bbl`
                              : "—"}
                          </td>
                          <td className="py-2 text-right">
                            <ChangeChip value={row.demandGrowth} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* LNG / Shale dynamics note */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "LNG Market",
                  icon: <Droplets size={14} className="text-primary" />,
                  body: "Asian LNG spot prices trade at a large premium to US Henry Hub. Europe became a major LNG importer post-2022, tightening global balances. New US LNG export capacity is adding ~4 bcf/d through 2026.",
                  color: "blue",
                },
                {
                  title: "Shale Dynamics",
                  icon: <TrendingUp size={14} className="text-emerald-400" />,
                  body: "US shale now produces 13+ mb/d, making it the world's largest oil producer. Breakeven costs have fallen to ~$45/bbl for Permian Basin. Shale acts as a ceiling on oil prices during demand booms.",
                  color: "emerald",
                },
                {
                  title: "Energy Transition",
                  icon: <Leaf size={14} className="text-green-400" />,
                  body: "Peak oil demand is forecast around 2030 by IEA in the net-zero scenario. Natural gas remains a transition bridge fuel. Uranium is experiencing a renaissance due to nuclear's zero-carbon credentials.",
                  color: "green",
                },
              ].map(({ title, icon, body, color }) => (
                <Card
                  key={title}
                  className={`bg-${color}-500/5 border-${color}-500/20`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      {icon}
                      <span className="text-sm font-medium text-foreground">
                        {title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Metals ─────────────────────────────────────────────────── */}
        <TabsContent value="metals" className="data-[state=inactive]:hidden">
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <Card className="bg-foreground/[0.03] border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Relative Price Performance (Indexed, 24 months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MetalPriceChart />
                </CardContent>
              </Card>

              <Card className="bg-foreground/[0.03] border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    EV Demand Drivers (per vehicle)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { metal: "Copper", kg: 83, color: "#f97316", note: "Wiring, motors, charging" },
                    { metal: "Aluminum", kg: 200, color: "#94a3b8", note: "Body panels, battery casing" },
                    { metal: "Nickel", kg: 50, color: "#6366f1", note: "NMC cathode material" },
                    { metal: "Lithium", kg: 40, color: "#34d399", note: "~8 kg per kWh capacity" },
                    { metal: "Cobalt", kg: 10, color: "#f59e0b", note: "NMC811 reducing cobalt intensity" },
                    { metal: "Manganese", kg: 15, color: "#8b5cf6", note: "LFP cathode alternative" },
                  ].map(({ metal, kg, color, note }) => (
                    <div key={metal}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="font-medium text-foreground">{metal}</span>
                        <span style={{ color }} className="font-medium">
                          {kg} kg
                        </span>
                      </div>
                      <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden mb-0.5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(kg / 210) * 100}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{note}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Metals table */}
            <Card className="bg-foreground/[0.03] border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Metals Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-2 pr-4">Metal</th>
                        <th className="text-right py-2 pr-4">Price</th>
                        <th className="text-right py-2 pr-4">YoY</th>
                        <th className="text-left py-2 pr-4">Primary Driver</th>
                        <th className="text-right py-2 pr-4">EV Content</th>
                        <th className="text-right py-2">Supply Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {METALS_ROWS.map((row) => (
                        <tr
                          key={row.name}
                          className="border-b border-border/50 hover:bg-muted/30"
                        >
                          <td className="py-2 pr-4">
                            <span className="font-medium text-foreground">
                              {row.name}
                            </span>
                            <span className="text-muted-foreground ml-1">
                              ({row.symbol})
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-right font-mono text-foreground">
                            {row.price >= 1000
                              ? `$${row.price.toLocaleString()}`
                              : `$${row.price.toFixed(2)}`}
                            <span className="text-muted-foreground ml-1 text-xs">
                              {row.unit}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-right">
                            <ChangeChip value={row.yoyChange} />
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {row.primaryDriver}
                          </td>
                          <td className="py-2 pr-4 text-right text-muted-foreground">
                            {row.evWeight}
                          </td>
                          <td className="py-2 text-right">
                            {row.deficit ? (
                              <Badge className="text-xs bg-red-500/15 text-red-400 border-red-500/25">
                                Deficit
                              </Badge>
                            ) : (
                              <Badge className="text-xs bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
                                Surplus
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Metal-specific insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: "Copper",
                  ticker: "HG",
                  icon: "⚡",
                  bg: "orange",
                  insight:
                    "Copper is the 'metal of electrification'. Every EV needs 83 kg vs 22 kg for ICE vehicles. Grid expansion for renewables requires 250% more copper/km than traditional infrastructure. Analysts forecast a 4.7 Mt deficit by 2030.",
                },
                {
                  name: "Lithium",
                  ticker: "LIT",
                  icon: "🔋",
                  bg: "emerald",
                  insight:
                    "Lithium prices crashed 80%+ from 2022 highs as Chinese battery makers over-built inventory. Spot carbonate now near $14K/t vs $80K peak. Long-term fundamentals remain intact as GWh demand grows 5x by 2030.",
                },
                {
                  name: "Gold",
                  ticker: "GC",
                  icon: "🏅",
                  bg: "yellow",
                  insight:
                    "Gold has reclaimed all-time highs above $2,300/oz driven by central bank purchases (record 1,037t in 2023), de-dollarization trends, and geopolitical hedging demand from BRICS nations.",
                },
                {
                  name: "Iron Ore",
                  ticker: "TIO",
                  icon: "🏗️",
                  bg: "slate",
                  insight:
                    "Iron ore remains tightly linked to China's property sector, which accounts for ~35% of steel demand. Ongoing property developer defaults and population decline put structural downward pressure on long-term pricing.",
                },
              ].map(({ name, ticker, icon, insight }) => (
                <Card key={name} className="bg-foreground/[0.03] border-border">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{icon}</span>
                      <span className="font-medium text-foreground text-sm">
                        {name}
                      </span>
                      <Badge className="text-xs bg-foreground/5 text-muted-foreground border-border">
                        {ticker}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {insight}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 4: Agricultural ────────────────────────────────────────────── */}
        <TabsContent value="agri" className="data-[state=inactive]:hidden">
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <Card className="bg-foreground/[0.03] border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wheat size={14} className="text-amber-400" />
                    Seasonal Price Patterns (Index Jan=100)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AgriSeasonalChart />
                  <p className="text-xs text-muted-foreground mt-2">
                    Shaded region = corn harvest pressure window (Sep–Oct)
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-foreground/[0.03] border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    ENSO Impact on Agricultural Markets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg p-3 bg-primary/5 border border-border">
                    <p className="text-xs font-medium text-primary mb-1.5">
                      La Nina (cool Pacific)
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <p className="text-muted-foreground mb-1">Reduces yield:</p>
                        <p className="text-red-400">US corn, soybeans</p>
                        <p className="text-red-400">Australia wheat</p>
                        <p className="text-red-400">Argentina crops</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Boosts yield:</p>
                        <p className="text-emerald-400">Brazil coffee</p>
                        <p className="text-emerald-400">W. Africa cocoa</p>
                        <p className="text-emerald-400">SE Asia rice</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg p-3 bg-orange-500/5 border border-orange-500/20">
                    <p className="text-xs font-medium text-orange-400 mb-1.5">
                      El Nino (warm Pacific)
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <p className="text-muted-foreground mb-1">Reduces yield:</p>
                        <p className="text-red-400">SE Asia palm oil</p>
                        <p className="text-red-400">India sugarcane</p>
                        <p className="text-red-400">Australian wheat</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Boosts yield:</p>
                        <p className="text-emerald-400">US corn/soybeans</p>
                        <p className="text-emerald-400">Brazil sugarcane</p>
                        <p className="text-emerald-400">Argentina grains</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agri table */}
            <Card className="bg-foreground/[0.03] border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Agricultural Complex — Market Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-2 pr-4">Commodity</th>
                        <th className="text-right py-2 pr-4">Price</th>
                        <th className="text-right py-2 pr-4">YoY</th>
                        <th className="text-left py-2 pr-4">Top Producer</th>
                        <th className="text-center py-2 pr-4">La Nina Impact</th>
                        <th className="text-right py-2">Harvest Window</th>
                      </tr>
                    </thead>
                    <tbody>
                      {AGRI_ROWS.map((row) => (
                        <tr
                          key={row.name}
                          className="border-b border-border/50 hover:bg-muted/30"
                        >
                          <td className="py-2 pr-4">
                            <span className="font-medium text-foreground">
                              {row.name}
                            </span>
                            <span className="text-muted-foreground ml-1">
                              ({row.symbol})
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-right font-mono text-foreground">
                            {row.price >= 1000
                              ? `$${row.price.toLocaleString()}`
                              : `$${row.price.toFixed(2)}`}
                            <span className="text-muted-foreground ml-1 text-xs">
                              {row.unit}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-right">
                            <ChangeChip value={row.yoyChange} />
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {row.topProducer}
                          </td>
                          <td className="py-2 pr-4 text-center">
                            <Badge
                              className={`text-xs text-muted-foreground ${
                                row.laNinaImpact === "Negative"
                                  ? "bg-red-500/15 text-red-400 border-red-500/25"
                                  : row.laNinaImpact === "Positive"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                                  : "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/25"
                              }`}
                            >
                              {row.laNinaImpact}
                            </Badge>
                          </td>
                          <td className="py-2 text-right text-muted-foreground">
                            {row.harvestMonths}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Crop calendar visual */}
            <Card className="bg-foreground/[0.03] border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe size={14} className="text-primary" />
                  Northern Hemisphere Crop Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      crop: "Corn (US)",
                      plant: [4, 5],
                      grow: [6, 7, 8],
                      harvest: [9, 10],
                      color: "#f59e0b",
                    },
                    {
                      crop: "Wheat (US)",
                      plant: [9, 10],
                      grow: [11, 12, 1, 2, 3, 4, 5],
                      harvest: [6, 7],
                      color: "#6366f1",
                    },
                    {
                      crop: "Soybeans (US)",
                      plant: [5, 6],
                      grow: [7, 8, 9],
                      harvest: [10, 11],
                      color: "#34d399",
                    },
                    {
                      crop: "Coffee (Brazil)",
                      plant: [10, 11],
                      grow: [12, 1, 2, 3],
                      harvest: [4, 5, 6, 7, 8],
                      color: "#92400e",
                    },
                  ].map(({ crop, plant, grow, harvest, color }) => (
                    <div key={crop} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-28 shrink-0">
                        {crop}
                      </span>
                      <div className="flex gap-0.5 flex-1">
                        {Array.from({ length: 12 }, (_, i) => {
                          const m = i + 1;
                          const isPlant = plant.includes(m);
                          const isGrow = grow.includes(m);
                          const isHarvest = harvest.includes(m);
                          return (
                            <div
                              key={m}
                              className="flex-1 h-5 rounded-sm"
                              style={{
                                backgroundColor: isHarvest
                                  ? color
                                  : isGrow
                                  ? color + "40"
                                  : isPlant
                                  ? color + "80"
                                  : "#ffffff08",
                              }}
                              title={
                                isHarvest
                                  ? "Harvest"
                                  : isGrow
                                  ? "Growing"
                                  : isPlant
                                  ? "Planting"
                                  : ""
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground w-28 shrink-0" />
                    <div className="flex gap-0.5 flex-1">
                      {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map(
                        (m) => (
                          <span
                            key={m}
                            className="flex-1 text-center text-[11px] text-muted-foreground"
                          >
                            {m}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-2 rounded-sm bg-foreground/30 inline-block" />
                      Planting
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-2 rounded-sm bg-foreground/15 inline-block" />
                      Growing
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-2 rounded-sm bg-foreground/60 inline-block" />
                      Harvest
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 5: Investment Vehicles ────────────────────────────────────── */}
        <TabsContent value="vehicles" className="data-[state=inactive]:hidden">
          <div className="space-y-4">
            {/* Quick compare table */}
            <Card className="bg-foreground/[0.03] border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign size={14} className="text-emerald-400" />
                  Investment Vehicle Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-2 pr-4">Vehicle</th>
                        <th className="text-left py-2 pr-4">Type</th>
                        <th className="text-right py-2 pr-4">AUM / Mkt Cap</th>
                        <th className="text-right py-2 pr-4">Expense Ratio</th>
                        <th className="text-right py-2 pr-4">Roll Cost (est.)</th>
                        <th className="text-left py-2">Exposure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INVESTMENT_VEHICLES.map((v) => (
                        <tr
                          key={v.ticker}
                          className="border-b border-border/50 hover:bg-muted/30"
                        >
                          <td className="py-2 pr-4">
                            <span className="font-medium text-foreground">
                              {v.name}
                            </span>
                            <span className="text-primary ml-1.5 font-mono text-xs">
                              {v.ticker}
                            </span>
                          </td>
                          <td className="py-2 pr-4">
                            <Badge
                              className={`text-xs text-muted-foreground ${
                                v.type === "ETF"
                                  ? "bg-primary/15 text-primary border-border"
                                  : v.type === "Futures"
                                  ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                                  : v.type === "Equity"
                                  ? "bg-primary/15 text-primary border-border"
                                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                              }`}
                            >
                              {v.type}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 text-right text-muted-foreground">
                            {v.aum}
                          </td>
                          <td className="py-2 pr-4 text-right text-muted-foreground">
                            {v.expenseRatio > 0 ? `${v.expenseRatio}%` : "—"}
                          </td>
                          <td className="py-2 pr-4 text-right text-muted-foreground">
                            {v.rollCost !== null ? `~${v.rollCost}%/yr` : "—"}
                          </td>
                          <td className="py-2 text-muted-foreground max-w-xs">
                            {v.exposure}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Detailed cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Detailed Analysis
              </h3>
              {INVESTMENT_VEHICLES.map((v) => (
                <motion.div
                  key={v.ticker}
                  layout
                  className="rounded-lg border border-border bg-foreground/[0.02] overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    onClick={() =>
                      setExpandedVehicle(
                        expandedVehicle === v.ticker ? null : v.ticker
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`text-xs text-muted-foreground ${
                          v.type === "ETF"
                            ? "bg-primary/15 text-primary border-border"
                            : v.type === "Futures"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                            : v.type === "Equity"
                            ? "bg-primary/15 text-primary border-border"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                        }`}
                      >
                        {v.type}
                      </Badge>
                      <span className="font-medium text-foreground text-sm">
                        {v.name}
                      </span>
                      <span className="font-mono text-primary text-xs">
                        {v.ticker}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {v.expenseRatio > 0 && (
                        <span>ER: {v.expenseRatio}%</span>
                      )}
                      {v.rollCost !== null && (
                        <span className="text-amber-500">
                          Roll: ~{v.rollCost}%/yr
                        </span>
                      )}
                      {expandedVehicle === v.ticker ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedVehicle === v.ticker && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">
                              Exposure
                            </p>
                            <p className="text-sm text-foreground">{v.exposure}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              AUM: {v.aum}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-emerald-500 mb-1.5 uppercase tracking-wide">
                              Pros
                            </p>
                            <ul className="space-y-1">
                              {v.pros.map((p) => (
                                <li
                                  key={p}
                                  className="text-xs text-muted-foreground flex items-start gap-1.5"
                                >
                                  <TrendingUp
                                    size={10}
                                    className="text-emerald-400 mt-0.5 shrink-0"
                                  />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs text-red-500 mb-1.5 uppercase tracking-wide">
                              Cons
                            </p>
                            <ul className="space-y-1">
                              {v.cons.map((c) => (
                                <li
                                  key={c}
                                  className="text-xs text-muted-foreground flex items-start gap-1.5"
                                >
                                  <TrendingDown
                                    size={10}
                                    className="text-red-400 mt-0.5 shrink-0"
                                  />
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Futures roll cost explainer */}
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-400 mb-1">
                      Understanding Futures Roll Cost
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Commodity ETFs that hold futures contracts must "roll" expiring contracts to the
                      next month. When markets are in{" "}
                      <span className="text-amber-300 font-medium">contango</span> (future price &gt;
                      spot), rolling costs money — you sell low and buy high. This creates a persistent
                      headwind of 2–5%/year for many commodity ETFs. PDBC attempts to minimize roll costs
                      by selecting the optimal contract month. Royalty companies and commodity equities
                      avoid roll costs entirely, though they introduce equity-specific risks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
