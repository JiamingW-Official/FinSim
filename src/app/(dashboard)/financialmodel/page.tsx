"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  BarChart2,
  DollarSign,
  Calculator,
  GitCompare,
  Activity,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
} from "lucide-react";

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────
let s = 41;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ─── Types ────────────────────────────────────────────────────────────────────
type CompanyKey = "AAPL" | "MSFT" | "GOOGL" | "AMZN" | "META";
type Scenario = "base" | "bull" | "bear";

interface IncomeAssumptions {
  revenueGrowth: number;
  grossMargin: number;
  operatingMargin: number;
  taxRate: number;
}

interface CompanyData {
  name: string;
  currentPrice: number;
  sharesOutstanding: number; // millions
  marketCap: number; // billions
  historicalRevenue: number[]; // 5 years, billions
  historicalGrossMargin: number[]; // %
  historicalOpMargin: number[]; // %
  historicalDA: number[]; // D&A billions
  historicalCapex: number[]; // CapEx billions
  historicalCash: number; // billions
  historicalDebt: number; // billions
  historicalAR: number; // billions
  historicalInventory: number; // billions
  historicalAP: number; // billions
  historicalPPE: number; // billions
  historicalIntangibles: number; // billions
  historicalDeferredRev: number; // billions
  peers: string[];
  sector: string;
}

// ─── Company Database ─────────────────────────────────────────────────────────
const COMPANIES: Record<CompanyKey, CompanyData> = {
  AAPL: {
    name: "Apple Inc.",
    currentPrice: 189.5,
    sharesOutstanding: 15441,
    marketCap: 2925,
    historicalRevenue: [274.5, 365.8, 394.3, 383.3, 391.0],
    historicalGrossMargin: [41.8, 43.3, 43.3, 44.1, 46.2],
    historicalOpMargin: [24.1, 29.8, 30.3, 29.8, 31.5],
    historicalDA: [11.3, 12.5, 11.1, 11.5, 12.0],
    historicalCapex: [7.3, 11.1, 10.7, 10.9, 11.5],
    historicalCash: 162.1,
    historicalDebt: 111.1,
    historicalAR: 29.5,
    historicalInventory: 6.3,
    historicalAP: 62.6,
    historicalPPE: 43.7,
    historicalIntangibles: 15.1,
    historicalDeferredRev: 12.1,
    peers: ["MSFT", "GOOGL", "META", "AMZN", "NVDA", "TSM", "ORCL", "CRM"],
    sector: "Technology",
  },
  MSFT: {
    name: "Microsoft Corp.",
    currentPrice: 415.2,
    sharesOutstanding: 7432,
    marketCap: 3085,
    historicalRevenue: [143.0, 168.1, 198.3, 211.9, 245.1],
    historicalGrossMargin: [67.8, 68.4, 68.4, 68.9, 70.1],
    historicalOpMargin: [37.0, 41.6, 42.1, 41.8, 44.6],
    historicalDA: [15.2, 19.9, 23.3, 24.0, 26.0],
    historicalCapex: [15.4, 20.6, 23.9, 28.1, 44.5],
    historicalCash: 80.0,
    historicalDebt: 59.9,
    historicalAR: 44.3,
    historicalInventory: 2.5,
    historicalAP: 18.3,
    historicalPPE: 95.6,
    historicalIntangibles: 65.0,
    historicalDeferredRev: 49.0,
    peers: ["AAPL", "GOOGL", "AMZN", "CRM", "ORCL", "SAP", "IBM", "ADBE"],
    sector: "Technology",
  },
  GOOGL: {
    name: "Alphabet Inc.",
    currentPrice: 172.8,
    sharesOutstanding: 12292,
    marketCap: 2123,
    historicalRevenue: [182.5, 257.6, 282.8, 307.4, 350.0],
    historicalGrossMargin: [56.9, 56.9, 55.0, 56.5, 57.1],
    historicalOpMargin: [22.5, 30.6, 26.5, 27.4, 32.0],
    historicalDA: [12.9, 18.3, 21.0, 22.5, 24.0],
    historicalCapex: [22.3, 24.6, 31.5, 32.3, 52.5],
    historicalCash: 110.9,
    historicalDebt: 28.8,
    historicalAR: 30.9,
    historicalInventory: 1.0,
    historicalAP: 7.5,
    historicalPPE: 134.3,
    historicalIntangibles: 29.0,
    historicalDeferredRev: 4.0,
    peers: ["META", "AAPL", "MSFT", "AMZN", "SNAP", "TTD", "PINS", "ROKU"],
    sector: "Communication Services",
  },
  AMZN: {
    name: "Amazon.com Inc.",
    currentPrice: 185.6,
    sharesOutstanding: 10330,
    marketCap: 1917,
    historicalRevenue: [386.1, 469.8, 513.9, 574.8, 638.0],
    historicalGrossMargin: [40.3, 42.0, 43.8, 46.9, 49.3],
    historicalOpMargin: [2.9, 5.3, 2.4, 6.4, 10.2],
    historicalDA: [31.3, 41.9, 52.0, 52.7, 60.0],
    historicalCapex: [61.1, 61.1, 63.6, 52.7, 70.0],
    historicalCash: 86.8,
    historicalDebt: 136.2,
    historicalAR: 38.2,
    historicalInventory: 34.4,
    historicalAP: 79.6,
    historicalPPE: 186.7,
    historicalIntangibles: 21.3,
    historicalDeferredRev: 15.9,
    peers: ["MSFT", "GOOGL", "AAPL", "WMT", "COST", "TGT", "EBAY", "SHOP"],
    sector: "Consumer Discretionary",
  },
  META: {
    name: "Meta Platforms Inc.",
    currentPrice: 521.3,
    sharesOutstanding: 2567,
    marketCap: 1339,
    historicalRevenue: [85.9, 117.9, 116.6, 134.9, 164.5],
    historicalGrossMargin: [80.6, 80.8, 78.3, 80.8, 81.8],
    historicalOpMargin: [36.0, 39.6, 24.6, 34.8, 41.5],
    historicalDA: [7.0, 9.6, 12.5, 11.2, 11.5],
    historicalCapex: [19.2, 18.7, 32.0, 27.3, 37.2],
    historicalCash: 65.4,
    historicalDebt: 37.2,
    historicalAR: 10.7,
    historicalInventory: 0.5,
    historicalAP: 4.1,
    historicalPPE: 87.3,
    historicalIntangibles: 9.9,
    historicalDeferredRev: 1.5,
    peers: ["GOOGL", "AAPL", "SNAP", "PINS", "TTD", "ROKU", "TWTR", "YT"],
    sector: "Communication Services",
  },
};

const HISTORICAL_YEARS = [2020, 2021, 2022, 2023, 2024];
const FORECAST_YEARS = [2025, 2026, 2027];
const ALL_YEARS = [...HISTORICAL_YEARS, ...FORECAST_YEARS];

// ─── Peer Comparable Data ─────────────────────────────────────────────────────
interface PeerData {
  ticker: string;
  name: string;
  revenue: number;
  ebitda: number;
  netIncome: number;
  marketCap: number;
  enterpriseValue: number;
  fcf: number;
}

const PEER_DATA: PeerData[] = [
  { ticker: "AAPL", name: "Apple", revenue: 391.0, ebitda: 130.0, netIncome: 97.0, marketCap: 2925, enterpriseValue: 2874, fcf: 107.0 },
  { ticker: "MSFT", name: "Microsoft", revenue: 245.1, ebitda: 122.0, netIncome: 88.1, marketCap: 3085, enterpriseValue: 3065, fcf: 74.1 },
  { ticker: "GOOGL", name: "Alphabet", revenue: 350.0, ebitda: 116.0, netIncome: 73.8, marketCap: 2123, enterpriseValue: 2041, fcf: 60.9 },
  { ticker: "AMZN", name: "Amazon", revenue: 638.0, ebitda: 125.0, netIncome: 30.4, marketCap: 1917, enterpriseValue: 1967, fcf: 38.2 },
  { ticker: "META", name: "Meta", revenue: 164.5, ebitda: 78.5, netIncome: 50.7, marketCap: 1339, enterpriseValue: 1311, fcf: 52.1 },
  { ticker: "NVDA", name: "Nvidia", revenue: 130.5, ebitda: 78.2, netIncome: 55.3, marketCap: 2890, enterpriseValue: 2875, fcf: 60.8 },
  { ticker: "TSM", name: "TSMC", revenue: 93.0, ebitda: 54.0, netIncome: 34.1, marketCap: 580, enterpriseValue: 568, fcf: 22.5 },
  { ticker: "ORCL", name: "Oracle", revenue: 56.5, ebitda: 19.8, netIncome: 10.5, marketCap: 375, enterpriseValue: 420, fcf: 12.3 },
];

// ─── Helper: compute IS row ───────────────────────────────────────────────────
function computeIS(
  company: CompanyData,
  assumptions: IncomeAssumptions,
  scenario: Scenario
) {
  const scenarioAdj = scenario === "bull" ? 1 : scenario === "bear" ? -1 : 0;
  const revAdj = scenario === "bull" ? 0.05 : scenario === "bear" ? -0.05 : 0;
  const marginAdj = scenario === "bull" ? 0.02 : scenario === "bear" ? -0.01 : 0;

  const rows: {
    year: number;
    revenue: number;
    cogs: number;
    grossProfit: number;
    grossMargin: number;
    sgaRd: number;
    ebit: number;
    opMargin: number;
    da: number;
    ebitda: number;
    taxes: number;
    netIncome: number;
    eps: number;
    forecast: boolean;
  }[] = [];

  let prevRevenue = 0;

  for (let i = 0; i < 8; i++) {
    const isForecast = i >= 5;
    const year = ALL_YEARS[i];

    let revenue: number;
    let grossMarginPct: number;
    let opMarginPct: number;

    if (!isForecast) {
      revenue = company.historicalRevenue[i];
      grossMarginPct = company.historicalGrossMargin[i];
      opMarginPct = company.historicalOpMargin[i];
    } else {
      const growthRate = (assumptions.revenueGrowth / 100 + revAdj) * (1 + scenarioAdj * 0.01);
      revenue = (prevRevenue > 0 ? prevRevenue : company.historicalRevenue[4]) * (1 + growthRate);
      grossMarginPct = assumptions.grossMargin + marginAdj * 100;
      opMarginPct = assumptions.operatingMargin + marginAdj * 100;
    }

    const cogs = revenue * (1 - grossMarginPct / 100);
    const grossProfit = revenue - cogs;
    const ebit = revenue * (opMarginPct / 100);
    const sgaRd = grossProfit - ebit;
    const da = isForecast
      ? (company.historicalDA[4] * revenue) / company.historicalRevenue[4]
      : company.historicalDA[Math.min(i, 4)];
    const ebitda = ebit + da;
    const taxes = ebit > 0 ? ebit * (assumptions.taxRate / 100) : 0;
    const netIncome = ebit - taxes;
    const eps = netIncome / (company.sharesOutstanding / 1000);

    rows.push({
      year,
      revenue,
      cogs,
      grossProfit,
      grossMargin: grossMarginPct,
      sgaRd,
      ebit,
      opMargin: opMarginPct,
      da,
      ebitda,
      taxes,
      netIncome,
      eps,
      forecast: isForecast,
    });

    prevRevenue = revenue;
  }

  return rows;
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
const fmt = (v: number, decimals = 1) =>
  `$${Math.abs(v).toFixed(decimals)}B`;
const fmtPct = (v: number) => `${v.toFixed(1)}%`;
const fmtM = (v: number) => `$${v.toFixed(2)}`;
const fmtRatio = (v: number) => v.toFixed(2) + "x";

// ─── Editable Cell ────────────────────────────────────────────────────────────
function EditableCell({
  value,
  onChange,
  suffix = "%",
  min = 0,
  max = 100,
  step = 0.5,
}: {
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        className="w-16 bg-foreground/5 border border-border rounded px-1.5 py-0.5 text-xs text-right text-foreground focus:outline-none focus:border-primary/60"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
      <span className="text-xs text-muted-foreground">{suffix}</span>
    </div>
  );
}

// ─── SVG Mini Bar Chart ───────────────────────────────────────────────────────
function MiniBarChart({
  data,
  color = "#3b82f6",
  height = 80,
  width = 320,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  width?: number;
}) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = Math.min(0, ...data.map((d) => d.value));
  const range = maxVal - minVal || 1;
  const barW = (width - 20) / data.length - 4;
  const padTop = 8;
  const padBot = 20;
  const chartH = height - padTop - padBot;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {data.map((d, i) => {
        const x = 10 + i * ((width - 20) / data.length) + 2;
        const barH = Math.max(2, (Math.abs(d.value - minVal) / range) * chartH);
        const y = padTop + ((maxVal - Math.max(d.value, 0)) / range) * chartH;
        const isNeg = d.value < 0;
        return (
          <g key={i}>
            <rect
              x={x}
              y={isNeg ? padTop + (maxVal / range) * chartH : y}
              width={barW}
              height={barH}
              fill={isNeg ? "#ef4444" : color}
              rx={2}
              opacity={0.85}
            />
            <text
              x={x + barW / 2}
              y={height - 4}
              textAnchor="middle"
              fontSize={8}
              fill="#94a3b8"
            >
              {d.label}
            </text>
          </g>
        );
      })}
      {/* zero line */}
      {minVal < 0 && (
        <line
          x1={10}
          x2={width - 10}
          y1={padTop + (maxVal / range) * chartH}
          y2={padTop + (maxVal / range) * chartH}
          stroke="#ffffff30"
          strokeWidth={1}
        />
      )}
    </svg>
  );
}

// ─── SVG Football Field Chart ─────────────────────────────────────────────────
function FootballFieldChart({
  rows,
  currentPrice,
  width = 480,
}: {
  rows: { label: string; low: number; high: number; mid: number }[];
  currentPrice: number;
  width?: number;
}) {
  const allVals = rows.flatMap((r) => [r.low, r.high, currentPrice]);
  const minVal = Math.max(0, Math.min(...allVals) * 0.8);
  const maxVal = Math.max(...allVals) * 1.1;
  const range = maxVal - minVal || 1;
  const rowH = 36;
  const padL = 130;
  const padR = 20;
  const chartW = width - padL - padR;
  const height = rows.length * rowH + 40;

  const toX = (v: number) => padL + ((v - minVal) / range) * chartW;

  const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <svg width={width} height={height}>
      {/* grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const v = minVal + t * range;
        const x = toX(v);
        return (
          <g key={i}>
            <line x1={x} y1={20} x2={x} y2={height - 20} stroke="#ffffff15" strokeWidth={1} />
            <text x={x} y={15} textAnchor="middle" fontSize={9} fill="#64748b">
              ${v.toFixed(0)}
            </text>
          </g>
        );
      })}
      {rows.map((r, i) => {
        const y = 24 + i * rowH;
        const x1 = toX(r.low);
        const x2 = toX(r.high);
        const xm = toX(r.mid);
        const barH = 18;
        return (
          <g key={i}>
            <text x={padL - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
              {r.label}
            </text>
            <rect x={x1} y={y} width={x2 - x1} height={barH} fill={colors[i % colors.length]} opacity={0.35} rx={3} />
            <rect x={xm - 2} y={y} width={4} height={barH} fill={colors[i % colors.length]} rx={1} />
            <text x={x1 - 2} y={y + 12} textAnchor="end" fontSize={8} fill="#94a3b8">${r.low.toFixed(0)}</text>
            <text x={x2 + 2} y={y + 12} fontSize={8} fill="#94a3b8">${r.high.toFixed(0)}</text>
          </g>
        );
      })}
      {/* current price line */}
      <line
        x1={toX(currentPrice)}
        y1={20}
        x2={toX(currentPrice)}
        y2={height - 10}
        stroke="#fbbf24"
        strokeWidth={1.5}
        strokeDasharray="4 2"
      />
      <text x={toX(currentPrice)} y={height - 2} textAnchor="middle" fontSize={9} fill="#fbbf24">
        Current
      </text>
    </svg>
  );
}

// ─── Tornado Chart ────────────────────────────────────────────────────────────
function TornadoChart({
  rows,
  baseValue,
  width = 480,
}: {
  rows: { label: string; low: number; high: number }[];
  baseValue: number;
  width?: number;
}) {
  const sorted = [...rows].sort((a, b) => b.high - b.low - (a.high - a.low));
  const maxDelta = Math.max(...sorted.map((r) => Math.max(Math.abs(r.high - baseValue), Math.abs(r.low - baseValue))));
  const padL = 140;
  const padR = 20;
  const chartW = width - padL - padR;
  const rowH = 32;
  const height = sorted.length * rowH + 30;
  const midX = padL + chartW / 2;

  const toX = (v: number) => midX + ((v - baseValue) / (maxDelta || 1)) * (chartW / 2);

  return (
    <svg width={width} height={height}>
      <line x1={midX} y1={10} x2={midX} y2={height - 10} stroke="#ffffff20" strokeWidth={1} />
      {sorted.map((r, i) => {
        const y = 20 + i * rowH;
        const x1 = toX(r.low);
        const x2 = toX(r.high);
        const barH = 18;
        return (
          <g key={i}>
            <text x={padL - 8} y={y + 12} textAnchor="end" fontSize={10} fill="#94a3b8">{r.label}</text>
            <rect x={Math.min(x1, midX)} y={y} width={Math.abs(midX - x1)} height={barH} fill="#ef4444" opacity={0.7} rx={2} />
            <rect x={midX} y={y} width={Math.abs(x2 - midX)} height={barH} fill="#22c55e" opacity={0.7} rx={2} />
            <text x={Math.min(x1, midX) - 2} y={y + 12} textAnchor="end" fontSize={8} fill="#94a3b8">${r.low.toFixed(0)}</text>
            <text x={Math.max(x2, midX) + 2} y={y + 12} fontSize={8} fill="#94a3b8">${r.high.toFixed(0)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Monte Carlo SVG ──────────────────────────────────────────────────────────
function MonteCarloChart({
  outcomes,
  width = 480,
  height = 100,
}: {
  outcomes: number[];
  width?: number;
  height?: number;
}) {
  if (outcomes.length === 0) return null;

  const bins = 40;
  const min = Math.min(...outcomes);
  const max = Math.max(...outcomes);
  const range = max - min || 1;
  const binSize = range / bins;
  const counts = Array(bins).fill(0);
  outcomes.forEach((v) => {
    const b = Math.min(bins - 1, Math.floor((v - min) / binSize));
    counts[b]++;
  });
  const maxCount = Math.max(...counts);
  const padL = 30;
  const padR = 10;
  const padB = 20;
  const chartW = width - padL - padR;
  const chartH = height - padB;
  const barW = chartW / bins;

  const p10 = outcomes.slice().sort((a, b) => a - b)[Math.floor(outcomes.length * 0.1)];
  const p50 = outcomes.slice().sort((a, b) => a - b)[Math.floor(outcomes.length * 0.5)];
  const p90 = outcomes.slice().sort((a, b) => a - b)[Math.floor(outcomes.length * 0.9)];
  const toX = (v: number) => padL + ((v - min) / range) * chartW;

  return (
    <svg width={width} height={height}>
      {counts.map((c, i) => {
        const x = padL + i * barW;
        const barH = (c / maxCount) * chartH;
        const v = min + i * binSize;
        const isGood = v > p50;
        return (
          <rect
            key={i}
            x={x}
            y={chartH - barH}
            width={barW - 1}
            height={barH}
            fill={isGood ? "#22c55e" : "#3b82f6"}
            opacity={0.7}
          />
        );
      })}
      {[
        { v: p10, label: "P10", color: "#ef4444" },
        { v: p50, label: "P50", color: "#fbbf24" },
        { v: p90, label: "P90", color: "#22c55e" },
      ].map(({ v, label, color }) => (
        <g key={label}>
          <line x1={toX(v)} y1={0} x2={toX(v)} y2={chartH} stroke={color} strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={toX(v)} y={chartH + 14} textAnchor="middle" fontSize={8} fill={color}>{label}</text>
        </g>
      ))}
      <text x={padL} y={chartH + 14} fontSize={8} fill="#64748b">${min.toFixed(0)}</text>
      <text x={width - padR} y={chartH + 14} textAnchor="end" fontSize={8} fill="#64748b">${max.toFixed(0)}</text>
    </svg>
  );
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function StatChip({ label, value, color = "blue" }: { label: string; value: string; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-primary/10 border-border text-primary",
    green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    purple: "bg-primary/10 border-border text-primary",
  };
  return (
    <div className={cn("flex flex-col items-center px-3 py-1.5 rounded-lg border", colorMap[color] ?? colorMap.blue)}>
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground mb-2 mt-4">
      {children}
    </h3>
  );
}

// ─── IS Table Row ─────────────────────────────────────────────────────────────
function ISRow({
  label,
  values,
  format,
  bold,
  sub,
  highlight,
}: {
  label: string;
  values: (number | string)[];
  format?: (v: number | string) => string;
  bold?: boolean;
  sub?: boolean;
  highlight?: "green" | "blue" | "red" | "none";
}) {
  const highlightClass =
    highlight === "green"
      ? "bg-emerald-500/5"
      : highlight === "blue"
      ? "bg-primary/5"
      : highlight === "red"
      ? "bg-red-500/5"
      : "";

  return (
    <tr className={cn("border-b border-border/50 hover:bg-muted/30", highlightClass)}>
      <td
        className={cn(
          "py-1.5 px-3 text-xs sticky left-0 bg-card",
          bold ? "font-semibold text-foreground" : sub ? "pl-6 text-muted-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </td>
      {values.map((v, i) => {
        const formatted = format ? format(v) : String(v);
        return (
          <td
            key={i}
            className={cn(
              "py-1.5 px-3 text-xs text-right font-mono",
              bold ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {formatted}
          </td>
        );
      })}
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FinancialModelPage() {
  const [activeTab, setActiveTab] = useState("income");
  const [company, setCompany] = useState<CompanyKey>("AAPL");
  const [scenario, setScenario] = useState<Scenario>("base");

  const companyData = COMPANIES[company];

  // IS assumptions
  const [isAssumptions, setIsAssumptions] = useState<IncomeAssumptions>({
    revenueGrowth: 8.0,
    grossMargin: 46.0,
    operatingMargin: 30.0,
    taxRate: 16.5,
  });

  // DCF assumptions
  const [wacc, setWacc] = useState(9.0);
  const [tgr, setTgr] = useState(3.0);
  const [projYears, setProjYears] = useState(5);
  const [exitMultiple, setExitMultiple] = useState(20);

  // IS computed
  const isRows = useMemo(
    () => computeIS(companyData, isAssumptions, scenario),
    [companyData, isAssumptions, scenario]
  );

  const forecastRows = isRows.filter((r) => r.forecast);
  const lastHistorical = isRows[4];

  // Balance sheet derived
  const bsData = useMemo(() => {
    const rev = lastHistorical.revenue;
    const dso = (companyData.historicalAR / rev) * 365;
    const dio = (companyData.historicalInventory / rev) * 365;
    const dpo = (companyData.historicalAP / (rev * 0.55)) * 365;
    const ccc = dso + dio - dpo;
    const totalCurrentAssets = companyData.historicalCash + companyData.historicalAR + companyData.historicalInventory;
    const totalAssets = totalCurrentAssets + companyData.historicalPPE + companyData.historicalIntangibles;
    const shortTermDebt = companyData.historicalDebt * 0.2;
    const longTermDebt = companyData.historicalDebt * 0.8;
    const totalLiab =
      companyData.historicalAP + shortTermDebt + longTermDebt + companyData.historicalDeferredRev;
    const retainedEarnings = totalAssets - totalLiab - 5.0;
    const totalEquity = retainedEarnings + 5.0;
    const currentRatio = totalCurrentAssets / (companyData.historicalAP + shortTermDebt);
    const quickRatio = (companyData.historicalCash + companyData.historicalAR) / (companyData.historicalAP + shortTermDebt);
    const debtEquity = companyData.historicalDebt / totalEquity;
    return {
      dso, dio, dpo, ccc,
      totalCurrentAssets, totalAssets,
      shortTermDebt, longTermDebt,
      totalLiab, retainedEarnings, totalEquity,
      currentRatio, quickRatio, debtEquity,
      balanced: Math.abs(totalAssets - totalLiab - totalEquity) < 0.5,
    };
  }, [companyData, lastHistorical]);

  // CF derived
  const cfData = useMemo(() => {
    const ni = lastHistorical.netIncome;
    const da = lastHistorical.da;
    const wcChange = -(companyData.historicalAR + companyData.historicalInventory - companyData.historicalAP) * 0.05;
    const operatingCF = ni + da + wcChange;
    const capex = companyData.historicalCapex[4];
    const investingCF = -capex - 1.5;
    const debtChange = -3.0;
    const buybacks = -5.0;
    const dividends = -3.5;
    const financingCF = debtChange + buybacks + dividends;
    const fcf = operatingCF - capex;
    const fcfYield = (fcf / companyData.marketCap) * 100;
    const fcfConversion = ni > 0 ? (fcf / ni) * 100 : 0;
    return { ni, da, wcChange, operatingCF, capex, investingCF, debtChange, buybacks, dividends, financingCF, fcf, fcfYield, fcfConversion };
  }, [companyData, lastHistorical]);

  // DCF valuation
  const dcfData = useMemo(() => {
    const baseFCF = cfData.fcf;
    const growthRates = forecastRows.map((r) => isAssumptions.revenueGrowth / 100);
    let pvSum = 0;
    let fcfT = baseFCF;
    const fcfRows: { year: number; fcf: number; pv: number }[] = [];
    for (let t = 1; t <= projYears; t++) {
      const gRate = growthRates[Math.min(t - 1, growthRates.length - 1)] ?? isAssumptions.revenueGrowth / 100;
      fcfT = fcfT * (1 + gRate);
      const pv = fcfT / Math.pow(1 + wacc / 100, t);
      pvSum += pv;
      fcfRows.push({ year: 2024 + t, fcf: fcfT, pv });
    }
    const lastFCF = fcfRows[fcfRows.length - 1]?.fcf ?? baseFCF;
    const tvGGM = lastFCF * (1 + tgr / 100) / ((wacc / 100) - (tgr / 100));
    const tvMultiple = lastHistorical.ebitda * exitMultiple;
    const pvTvGGM = tvGGM / Math.pow(1 + wacc / 100, projYears);
    const pvTvMult = tvMultiple / Math.pow(1 + wacc / 100, projYears);
    const evGGM = pvSum + pvTvGGM;
    const evMult = pvSum + pvTvMult;
    const netDebt = companyData.historicalDebt - companyData.historicalCash;
    const sharesB = companyData.sharesOutstanding / 1000;
    const intrinsicGGM = (evGGM - netDebt) / sharesB;
    const intrinsicMult = (evMult - netDebt) / sharesB;
    const mosSentiment = (iv: number) =>
      iv > companyData.currentPrice * 1.2 ? "BUY" :
      iv > companyData.currentPrice * 0.9 ? "HOLD" : "SELL";
    return { fcfRows, pvSum, tvGGM, tvMultiple, pvTvGGM, pvTvMult, evGGM, evMult, netDebt, intrinsicGGM, intrinsicMult, mosSentiment };
  }, [cfData, forecastRows, isAssumptions.revenueGrowth, projYears, wacc, tgr, exitMultiple, lastHistorical, companyData]);

  // Comps
  const compsData = useMemo(() => {
    return PEER_DATA.map((p) => ({
      ...p,
      evRevenue: p.enterpriseValue / p.revenue,
      evEbitda: p.enterpriseValue / p.ebitda,
      pe: p.marketCap / p.netIncome,
      pFcf: p.marketCap / p.fcf,
      pSales: p.marketCap / p.revenue,
    }));
  }, []);

  const medians = useMemo(() => {
    const median = (arr: number[]) => {
      const s = [...arr].sort((a, b) => a - b);
      const m = Math.floor(s.length / 2);
      return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
    };
    return {
      evRevenue: median(compsData.map((c) => c.evRevenue)),
      evEbitda: median(compsData.map((c) => c.evEbitda)),
      pe: median(compsData.map((c) => c.pe)),
      pFcf: median(compsData.map((c) => c.pFcf)),
      pSales: median(compsData.map((c) => c.pSales)),
    };
  }, [compsData]);

  const impliedFromComps = useMemo(() => {
    const rev = lastHistorical.revenue;
    const ebitda = lastHistorical.ebitda;
    const ni = lastHistorical.netIncome;
    const fcfAmt = cfData.fcf;
    const sharesB = companyData.sharesOutstanding / 1000;
    const netDebt = companyData.historicalDebt - companyData.historicalCash;

    const evRevImplied = (medians.evRevenue * rev - netDebt) / sharesB;
    const evEbitdaImplied = (medians.evEbitda * ebitda - netDebt) / sharesB;
    const peImplied = medians.pe * (ni / sharesB);
    const pFcfImplied = medians.pFcf * (fcfAmt / sharesB);
    const pSalesImplied = medians.pSales * (rev / sharesB);
    return { evRevImplied, evEbitdaImplied, peImplied, pFcfImplied, pSalesImplied };
  }, [lastHistorical, cfData, companyData, medians]);

  // Scenario analysis
  const scenarioResults = useMemo(() => {
    const scenarios: Scenario[] = ["bull", "base", "bear"];
    return scenarios.map((sc) => {
      const rows = computeIS(companyData, isAssumptions, sc);
      const yr2 = rows[6]; // 2026 forecast
      const revAdj = sc === "bull" ? 0.05 : sc === "bear" ? -0.05 : 0;
      const marginAdj = sc === "bull" ? 0.02 : sc === "bear" ? -0.01 : 0;
      const fcfEst = yr2.netIncome * 1.1 + yr2.da - companyData.historicalCapex[4];
      const evEst = yr2.ebitda * exitMultiple;
      const impliedPrice = (evEst - (companyData.historicalDebt - companyData.historicalCash)) / (companyData.sharesOutstanding / 1000);
      return { scenario: sc, revenue: yr2.revenue, ebitda: yr2.ebitda, netIncome: yr2.netIncome, fcf: fcfEst, impliedPrice };
    });
  }, [companyData, isAssumptions, exitMultiple]);

  // Monte Carlo
  const monteCarloResults = useMemo(() => {
    s = 41;
    const outcomes: number[] = [];
    const sharesB = companyData.sharesOutstanding / 1000;
    const netDebt = companyData.historicalDebt - companyData.historicalCash;

    for (let i = 0; i < 500; i++) {
      const growthR = (isAssumptions.revenueGrowth / 100) + (rand() - 0.5) * 0.2;
      const opMarginR = (isAssumptions.operatingMargin / 100) + (rand() - 0.5) * 0.1;
      const waccR = wacc / 100 + (rand() - 0.5) * 0.04;
      const tgrR = tgr / 100 + (rand() - 0.5) * 0.01;

      let fcfEst = cfData.fcf;
      let pvFCF = 0;
      for (let t = 1; t <= 5; t++) {
        fcfEst = fcfEst * (1 + growthR) * (1 + opMarginR * 0.2);
        pvFCF += fcfEst / Math.pow(1 + waccR, t);
      }
      if (waccR > tgrR) {
        const tv = fcfEst * (1 + tgrR) / (waccR - tgrR);
        const pvTv = tv / Math.pow(1 + waccR, 5);
        const price = (pvFCF + pvTv - netDebt) / sharesB;
        if (price > 0 && price < companyData.currentPrice * 5) {
          outcomes.push(price);
        }
      }
    }
    return outcomes;
  }, [companyData, isAssumptions, wacc, tgr, cfData.fcf]);

  // Break-even revenue growth
  const breakEvenGrowth = useMemo(() => {
    const target = companyData.currentPrice;
    const sharesB = companyData.sharesOutstanding / 1000;
    const netDebt = companyData.historicalDebt - companyData.historicalCash;
    for (let g = -0.2; g <= 0.5; g += 0.005) {
      let fcfEst = cfData.fcf;
      let pv = 0;
      for (let t = 1; t <= 5; t++) {
        fcfEst = fcfEst * (1 + g);
        pv += fcfEst / Math.pow(1 + wacc / 100, t);
      }
      if (wacc / 100 > tgr / 100) {
        const tv = fcfEst * (1 + tgr / 100) / (wacc / 100 - tgr / 100);
        const pvTv = tv / Math.pow(1 + wacc / 100, 5);
        const price = (pv + pvTv - netDebt) / sharesB;
        if (price >= target) return (g * 100).toFixed(1);
      }
    }
    return ">50";
  }, [companyData, cfData.fcf, wacc, tgr]);

  // Tornado chart rows
  const tornadoRows = useMemo(() => {
    const base = dcfData.intrinsicGGM;
    const compute = (paramOverride: Partial<{ wacc: number; tgr: number; growth: number; margin: number }>) => {
      const w = paramOverride.wacc ?? wacc;
      const t = paramOverride.tgr ?? tgr;
      const g = paramOverride.growth ?? isAssumptions.revenueGrowth;
      const baseFCF = cfData.fcf;
      let pvSum2 = 0;
      let fcfT2 = baseFCF;
      for (let tt = 1; tt <= projYears; tt++) {
        fcfT2 = fcfT2 * (1 + g / 100);
        pvSum2 += fcfT2 / Math.pow(1 + w / 100, tt);
      }
      const lastFCF2 = fcfT2;
      if (w / 100 <= t / 100) return base;
      const tv2 = lastFCF2 * (1 + t / 100) / (w / 100 - t / 100);
      const pvTv2 = tv2 / Math.pow(1 + w / 100, projYears);
      const ev2 = pvSum2 + pvTv2;
      const netDebt2 = companyData.historicalDebt - companyData.historicalCash;
      return (ev2 - netDebt2) / (companyData.sharesOutstanding / 1000);
    };
    return [
      { label: "WACC", low: compute({ wacc: wacc + 2 }), high: compute({ wacc: wacc - 2 }) },
      { label: "Terminal Gr.", low: compute({ tgr: tgr - 1 }), high: compute({ tgr: tgr + 1 }) },
      { label: "Rev Growth", low: compute({ growth: isAssumptions.revenueGrowth - 5 }), high: compute({ growth: isAssumptions.revenueGrowth + 5 }) },
      { label: "Proj Years", low: compute({ wacc: wacc + 1 }), high: compute({ wacc: wacc - 1 }) },
    ];
  }, [dcfData.intrinsicGGM, wacc, tgr, isAssumptions.revenueGrowth, projYears, cfData.fcf, companyData]);

  // Football field rows for DCF
  const footballRows = useMemo(() => [
    { label: "DCF (GGM)", low: dcfData.intrinsicGGM * 0.8, mid: dcfData.intrinsicGGM, high: dcfData.intrinsicGGM * 1.2 },
    { label: "DCF (Mult.)", low: dcfData.intrinsicMult * 0.8, mid: dcfData.intrinsicMult, high: dcfData.intrinsicMult * 1.2 },
    { label: "EV/EBITDA", low: impliedFromComps.evEbitdaImplied * 0.85, mid: impliedFromComps.evEbitdaImplied, high: impliedFromComps.evEbitdaImplied * 1.15 },
    { label: "EV/Revenue", low: impliedFromComps.evRevImplied * 0.8, mid: impliedFromComps.evRevImplied, high: impliedFromComps.evRevImplied * 1.2 },
    { label: "P/E", low: impliedFromComps.peImplied * 0.85, mid: impliedFromComps.peImplied, high: impliedFromComps.peImplied * 1.15 },
  ], [dcfData, impliedFromComps]);

  // Football field for comps
  const compsFootballRows = useMemo(() => [
    { label: "EV/Revenue", low: impliedFromComps.evRevImplied * 0.8, mid: impliedFromComps.evRevImplied, high: impliedFromComps.evRevImplied * 1.2 },
    { label: "EV/EBITDA", low: impliedFromComps.evEbitdaImplied * 0.85, mid: impliedFromComps.evEbitdaImplied, high: impliedFromComps.evEbitdaImplied * 1.15 },
    { label: "P/E", low: impliedFromComps.peImplied * 0.85, mid: impliedFromComps.peImplied, high: impliedFromComps.peImplied * 1.15 },
    { label: "P/FCF", low: impliedFromComps.pFcfImplied * 0.85, mid: impliedFromComps.pFcfImplied, high: impliedFromComps.pFcfImplied * 1.15 },
    { label: "P/Sales", low: impliedFromComps.pSalesImplied * 0.8, mid: impliedFromComps.pSalesImplied, high: impliedFromComps.pSalesImplied * 1.2 },
  ], [impliedFromComps]);

  const mosGGM = dcfData.mosSentiment(dcfData.intrinsicGGM);
  const mosColor = mosGGM === "BUY" ? "text-emerald-400" : mosGGM === "SELL" ? "text-red-400" : "text-amber-400";

  const updateAssumption = useCallback(
    (key: keyof IncomeAssumptions, value: number) => {
      setIsAssumptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const COMPANY_KEYS = Object.keys(COMPANIES) as CompanyKey[];

  return (
    <div className="flex flex-col h-full min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="shrink-0 border-b border-border/50 bg-card/60 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-medium tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Financial Model Builder
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">3-Statement Model · DCF · Comps · Scenario Analysis</p>
          </div>
          {/* Company + Scenario selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-foreground/5 rounded-lg p-1">
              {COMPANY_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => setCompany(k)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all",
                    company === k
                      ? "bg-primary text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-foreground/5 rounded-lg p-1">
              {(["bear", "base", "bull"] as Scenario[]).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setScenario(sc)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium capitalize transition-all",
                    scenario === sc
                      ? sc === "bull"
                        ? "bg-emerald-600 text-foreground"
                        : sc === "bear"
                        ? "bg-red-600 text-foreground"
                        : "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {sc}
                </button>
              ))}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">{companyData.name}</span>
              <span className="text-sm font-medium text-foreground">${companyData.currentPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="shrink-0 flex gap-1 px-6 pt-3 pb-0 bg-transparent border-b border-border/50 rounded-none justify-start h-auto">
            {[
              { value: "income", label: "Income Statement", icon: TrendingUp },
              { value: "balance", label: "Balance Sheet", icon: BarChart2 },
              { value: "cashflow", label: "Cash Flow", icon: DollarSign },
              { value: "dcf", label: "DCF Valuation", icon: Calculator },
              { value: "comps", label: "Comparables", icon: GitCompare },
              { value: "scenario", label: "Scenario Analysis", icon: Activity },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs rounded-t-md rounded-b-none border-b-2 transition-all",
                  activeTab === value
                    ? "border-primary text-foreground bg-foreground/[0.04]"
                    : "border-transparent text-muted-foreground hover:text-muted-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ─── Tab 1: Income Statement ─────────────────────────────────────── */}
          <TabsContent value="income" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Assumptions */}
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: "revenueGrowth" as const, label: "Revenue Growth", min: -20, max: 50 },
                  { key: "grossMargin" as const, label: "Gross Margin", min: 10, max: 90 },
                  { key: "operatingMargin" as const, label: "Operating Margin", min: 0, max: 60 },
                  { key: "taxRate" as const, label: "Tax Rate", min: 0, max: 40 },
                ].map(({ key, label, min, max }) => (
                  <div key={key} className="bg-foreground/[0.03] border border-border/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">{label} (Forecast)</p>
                    <EditableCell
                      value={isAssumptions[key]}
                      onChange={(v) => updateAssumption(key, v)}
                      min={min}
                      max={max}
                    />
                  </div>
                ))}
              </div>

              {/* IS Table */}
              <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-foreground/[0.04] border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium sticky left-0 bg-card min-w-[160px]">
                        Line Item
                      </th>
                      {ALL_YEARS.map((y, i) => (
                        <th
                          key={y}
                          className={cn(
                            "text-right py-2 px-3 font-medium min-w-[90px]",
                            i >= 5 ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {y}
                          {i >= 5 && <span className="ml-1 text-[11px] text-primary">E</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Revenue", key: "revenue" as const, bold: true, highlight: "blue" as const },
                      { label: "  COGS", key: "cogs" as const, sub: true },
                      { label: "Gross Profit", key: "grossProfit" as const, bold: true, highlight: "green" as const },
                      { label: "  Gross Margin %", key: "grossMargin" as const, sub: true, pct: true },
                      { label: "  SG&A + R&D", key: "sgaRd" as const, sub: true },
                      { label: "EBIT", key: "ebit" as const, bold: true },
                      { label: "  Op. Margin %", key: "opMargin" as const, sub: true, pct: true },
                      { label: "  D&A", key: "da" as const, sub: true },
                      { label: "EBITDA", key: "ebitda" as const, bold: true, highlight: "green" as const },
                      { label: "  Taxes", key: "taxes" as const, sub: true },
                      { label: "Net Income", key: "netIncome" as const, bold: true, highlight: "green" as const },
                      { label: "  EPS", key: "eps" as const, sub: true, dollar: true, small: true },
                    ].map(({ label, key, bold, sub, highlight, pct, dollar, small }) => (
                      <ISRow
                        key={key}
                        label={label}
                        values={isRows.map((r) => r[key])}
                        bold={bold}
                        sub={sub}
                        highlight={highlight}
                        format={(v) => {
                          const n = v as number;
                          if (pct) return fmtPct(n);
                          if (dollar) return `$${n.toFixed(2)}`;
                          return small ? `$${n.toFixed(1)}B` : fmt(n);
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mini charts */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">Revenue Trend ($B)</p>
                  <MiniBarChart
                    data={isRows.map((r) => ({ label: String(r.year).slice(2), value: r.revenue }))}
                    color="#3b82f6"
                  />
                </div>
                <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">EPS Trend ($)</p>
                  <MiniBarChart
                    data={isRows.map((r) => ({ label: String(r.year).slice(2), value: r.eps }))}
                    color="#10b981"
                    width={320}
                  />
                </div>
              </div>

              {/* Key metrics strip */}
              <div className="mt-4 flex flex-wrap gap-2">
                <StatChip label="5Y Rev CAGR" value={`${(((isRows[4].revenue / isRows[0].revenue) ** 0.25 - 1) * 100).toFixed(1)}%`} color="blue" />
                <StatChip label="Fwd Rev Gr." value={`${isAssumptions.revenueGrowth}%`} color={scenario === "bull" ? "green" : scenario === "bear" ? "red" : "blue"} />
                <StatChip label="EBITDA Margin" value={fmtPct(lastHistorical.ebitda / lastHistorical.revenue * 100)} color="green" />
                <StatChip label="Net Margin" value={fmtPct(lastHistorical.netIncome / lastHistorical.revenue * 100)} color="purple" />
                <StatChip label="EPS (LTM)" value={`$${lastHistorical.eps.toFixed(2)}`} color="amber" />
              </div>
            </motion.div>
          </TabsContent>

          {/* ─── Tab 2: Balance Sheet ─────────────────────────────────────────── */}
          <TabsContent value="balance" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {/* Balance check banner */}
              <div className={cn(
                "mb-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border",
                bsData.balanced
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              )}>
                <Info className="w-4 h-4 shrink-0" />
                {bsData.balanced
                  ? "Balance Sheet Balanced: Assets = Liabilities + Equity"
                  : "MISMATCH: Assets ≠ Liabilities + Equity — please check inputs"}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Assets */}
                <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                  <SectionHeading>Assets</SectionHeading>
                  <table className="w-full text-xs">
                    <tbody>
                      {[
                        { label: "Cash & Equivalents", value: companyData.historicalCash },
                        { label: "Accounts Receivable", value: companyData.historicalAR },
                        { label: "Inventory", value: companyData.historicalInventory },
                        { label: "Total Current Assets", value: bsData.totalCurrentAssets, bold: true },
                        { label: "PP&E (net)", value: companyData.historicalPPE },
                        { label: "Intangibles & Goodwill", value: companyData.historicalIntangibles },
                        { label: "Total Assets", value: bsData.totalAssets, bold: true, highlight: true },
                      ].map(({ label, value, bold, highlight }) => (
                        <tr key={label} className={cn("border-b border-border/50", highlight && "bg-primary/5")}>
                          <td className={cn("py-1.5 text-muted-foreground", bold && "font-medium text-foreground")}>{label}</td>
                          <td className={cn("py-1.5 text-right font-mono", bold && "font-medium text-foreground")}>{fmt(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Liabilities */}
                <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                  <SectionHeading>Liabilities</SectionHeading>
                  <table className="w-full text-xs">
                    <tbody>
                      {[
                        { label: "Accounts Payable", value: companyData.historicalAP },
                        { label: "Short-Term Debt", value: bsData.shortTermDebt },
                        { label: "Long-Term Debt", value: bsData.longTermDebt },
                        { label: "Deferred Revenue", value: companyData.historicalDeferredRev },
                        { label: "Total Liabilities", value: bsData.totalLiab, bold: true, highlight: true },
                      ].map(({ label, value, bold, highlight }) => (
                        <tr key={label} className={cn("border-b border-border/50", highlight && "bg-red-500/5")}>
                          <td className={cn("py-1.5 text-muted-foreground", bold && "font-medium text-foreground")}>{label}</td>
                          <td className={cn("py-1.5 text-right font-mono", bold && "font-medium text-foreground")}>{fmt(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <SectionHeading>Equity</SectionHeading>
                  <table className="w-full text-xs">
                    <tbody>
                      {[
                        { label: "Common Stock + APIC", value: 5.0 },
                        { label: "Retained Earnings", value: bsData.retainedEarnings },
                        { label: "Total Equity", value: bsData.totalEquity, bold: true, highlight: true },
                        { label: "Total Liab. + Equity", value: bsData.totalLiab + bsData.totalEquity, bold: true },
                      ].map(({ label, value, bold, highlight }) => (
                        <tr key={label} className={cn("border-b border-border/50", highlight && "bg-emerald-500/5")}>
                          <td className={cn("py-1.5 text-muted-foreground", bold && "font-medium text-foreground")}>{label}</td>
                          <td className={cn("py-1.5 text-right font-mono", bold && "font-medium text-foreground")}>{fmt(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Ratios & Days */}
                <div className="space-y-4">
                  <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                    <SectionHeading>Working Capital Days</SectionHeading>
                    {[
                      { label: "Days Sales Outstanding (DSO)", value: bsData.dso.toFixed(1) + " days" },
                      { label: "Days Inventory Outstanding (DIO)", value: bsData.dio.toFixed(1) + " days" },
                      { label: "Days Payable Outstanding (DPO)", value: bsData.dpo.toFixed(1) + " days" },
                      { label: "Cash Conversion Cycle (CCC)", value: bsData.ccc.toFixed(1) + " days", bold: true },
                    ].map(({ label, value, bold }) => (
                      <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/50">
                        <span className={cn("text-xs", bold ? "text-foreground font-medium" : "text-muted-foreground")}>{label}</span>
                        <span className={cn("text-xs font-mono", bold ? "text-foreground font-medium" : "text-muted-foreground")}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                    <SectionHeading>Key Ratios</SectionHeading>
                    {[
                      { label: "Current Ratio", value: bsData.currentRatio.toFixed(2) + "x", good: bsData.currentRatio >= 1.5 },
                      { label: "Quick Ratio", value: bsData.quickRatio.toFixed(2) + "x", good: bsData.quickRatio >= 1.0 },
                      { label: "Debt / Equity", value: bsData.debtEquity.toFixed(2) + "x", good: bsData.debtEquity < 1 },
                      { label: "Net Debt", value: fmt(companyData.historicalDebt - companyData.historicalCash), good: companyData.historicalDebt < companyData.historicalCash },
                    ].map(({ label, value, good }) => (
                      <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/50">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className={cn("text-xs font-mono font-medium", good ? "text-emerald-400" : "text-amber-400")}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ─── Tab 3: Cash Flow ─────────────────────────────────────────────── */}
          <TabsContent value="cashflow" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* CF statement */}
                <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                  <SectionHeading>Cash Flow Statement (LTM, $B)</SectionHeading>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr><td colSpan={2} className="pt-2 pb-1 text-xs text-primary font-medium">Operating Activities</td></tr>
                      {[
                        { label: "Net Income", value: cfData.ni },
                        { label: "  + D&A", value: cfData.da },
                        { label: "  + Working Capital ∆", value: cfData.wcChange },
                        { label: "Operating Cash Flow", value: cfData.operatingCF, bold: true, highlight: "blue" },
                      ].map(({ label, value, bold, highlight }) => (
                        <tr key={label} className={cn("border-b border-border/50", highlight === "blue" && "bg-primary/5")}>
                          <td className={cn("py-1.5 text-muted-foreground", bold && "text-foreground font-medium")}>{label}</td>
                          <td className={cn("py-1.5 text-right font-mono", value < 0 ? "text-red-400" : "text-muted-foreground", bold && "text-foreground font-medium")}>{fmt(value)}</td>
                        </tr>
                      ))}
                      <tr><td colSpan={2} className="pt-3 pb-1 text-xs text-primary font-medium">Investing Activities</td></tr>
                      {[
                        { label: "  Capital Expenditures", value: -cfData.capex },
                        { label: "  Acquisitions & Other", value: -1.5 },
                        { label: "Investing Cash Flow", value: cfData.investingCF, bold: true, highlight: "purple" },
                      ].map(({ label, value, bold, highlight }) => (
                        <tr key={label} className={cn("border-b border-border/50", highlight === "purple" && "bg-primary/5")}>
                          <td className={cn("py-1.5 text-muted-foreground", bold && "text-foreground font-medium")}>{label}</td>
                          <td className={cn("py-1.5 text-right font-mono", value < 0 ? "text-red-400" : "text-muted-foreground", bold && "text-foreground font-medium")}>{fmt(value)}</td>
                        </tr>
                      ))}
                      <tr><td colSpan={2} className="pt-3 pb-1 text-xs text-amber-400 font-medium">Financing Activities</td></tr>
                      {[
                        { label: "  Debt Issuance / (Repay.)", value: cfData.debtChange },
                        { label: "  Share Buybacks", value: cfData.buybacks },
                        { label: "  Dividends Paid", value: cfData.dividends },
                        { label: "Financing Cash Flow", value: cfData.financingCF, bold: true, highlight: "amber" },
                      ].map(({ label, value, bold, highlight }) => (
                        <tr key={label} className={cn("border-b border-border/50", highlight === "amber" && "bg-amber-500/5")}>
                          <td className={cn("py-1.5 text-muted-foreground", bold && "text-foreground font-medium")}>{label}</td>
                          <td className={cn("py-1.5 text-right font-mono", value < 0 ? "text-red-400" : "text-muted-foreground", bold && "text-foreground font-medium")}>{fmt(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* FCF metrics */}
                <div className="space-y-4">
                  <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                    <SectionHeading>Free Cash Flow</SectionHeading>
                    <div className="flex flex-col gap-3 mt-2">
                      {[
                        { label: "Operating Cash Flow", value: fmt(cfData.operatingCF), color: "text-primary" },
                        { label: "Less: CapEx", value: `-${fmt(cfData.capex)}`, color: "text-red-400" },
                        { label: "Free Cash Flow", value: fmt(cfData.fcf), color: "text-emerald-400", big: true },
                        { label: "FCF Yield", value: fmtPct(cfData.fcfYield), color: cfData.fcfYield > 3 ? "text-emerald-400" : "text-amber-400" },
                        { label: "FCF Conversion", value: fmtPct(cfData.fcfConversion), color: cfData.fcfConversion > 80 ? "text-emerald-400" : "text-amber-400" },
                      ].map(({ label, value, color, big }) => (
                        <div key={label} className="flex justify-between items-center border-b border-border/50 pb-2">
                          <span className={cn("text-xs", big ? "font-medium text-foreground" : "text-muted-foreground")}>{label}</span>
                          <span className={cn("text-xs font-mono font-medium", color, big && "text-base")}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                    <SectionHeading>FCF Trend ($B)</SectionHeading>
                    <MiniBarChart
                      data={isRows.map((r, i) => ({
                        label: String(r.year).slice(2),
                        value: r.netIncome * 1.1 + (companyData.historicalDA[Math.min(i, 4)] ?? r.da) - (companyData.historicalCapex[Math.min(i, 4)] ?? cfData.capex),
                      }))}
                      color="#10b981"
                      width={340}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ─── Tab 4: DCF Valuation ─────────────────────────────────────────── */}
          <TabsContent value="dcf" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {/* DCF controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "WACC (%)", value: wacc, setter: setWacc, min: 4, max: 20, step: 0.5 },
                  { label: "Terminal Growth (%)", value: tgr, setter: setTgr, min: 0, max: 6, step: 0.25 },
                  { label: "Projection Years", value: projYears, setter: setProjYears, min: 3, max: 10, step: 1, suffix: "yrs" },
                  { label: "Exit EV/EBITDA", value: exitMultiple, setter: setExitMultiple, min: 8, max: 40, step: 0.5, suffix: "x" },
                ].map(({ label, value, setter, min, max, step, suffix }) => (
                  <div key={label} className="bg-foreground/[0.03] border border-border/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">{label}</p>
                    <div className="flex flex-col gap-1.5">
                      <EditableCell
                        value={value}
                        onChange={setter}
                        suffix={suffix ?? "%"}
                        min={min}
                        max={max}
                        step={step}
                      />
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={(e) => setter(parseFloat(e.target.value))}
                        className="w-full accent-blue-400 h-1"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* DCF table */}
              <div className="overflow-x-auto rounded-xl border border-border/50 bg-card mb-6">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-foreground/[0.04] border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium sticky left-0 bg-card min-w-[160px]">Year</th>
                      {dcfData.fcfRows.map((r) => (
                        <th key={r.year} className="text-right py-2 px-3 text-primary font-medium min-w-[90px]">{r.year}E</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-1.5 px-3 text-muted-foreground sticky left-0 bg-card">Projected FCF</td>
                      {dcfData.fcfRows.map((r) => (
                        <td key={r.year} className="py-1.5 px-3 text-right font-mono text-muted-foreground">{fmt(r.fcf)}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 bg-primary/5">
                      <td className="py-1.5 px-3 text-muted-foreground sticky left-0 bg-card/80">PV of FCF</td>
                      {dcfData.fcfRows.map((r) => (
                        <td key={r.year} className="py-1.5 px-3 text-right font-mono text-primary">{fmt(r.pv)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* DCF summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                  <SectionHeading>Gordon Growth Model</SectionHeading>
                  {[
                    { label: "PV of FCFs", value: fmt(dcfData.pvSum) },
                    { label: "Terminal Value", value: fmt(dcfData.tvGGM) },
                    { label: "PV of TV", value: fmt(dcfData.pvTvGGM) },
                    { label: "Enterprise Value", value: fmt(dcfData.evGGM) },
                    { label: "Net Debt", value: fmt(dcfData.netDebt) },
                    { label: "Intrinsic Value/Share", value: fmtM(dcfData.intrinsicGGM), big: true },
                  ].map(({ label, value, big }) => (
                    <div key={label} className="flex justify-between py-1.5 border-b border-border/50">
                      <span className={cn("text-xs", big ? "text-foreground font-medium" : "text-muted-foreground")}>{label}</span>
                      <span className={cn("text-xs font-mono", big ? "text-emerald-400 text-sm font-bold" : "text-muted-foreground")}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                  <SectionHeading>EV/EBITDA Exit Multiple</SectionHeading>
                  {[
                    { label: "PV of FCFs", value: fmt(dcfData.pvSum) },
                    { label: "Terminal Value (mult.)", value: fmt(dcfData.tvMultiple) },
                    { label: "PV of TV", value: fmt(dcfData.pvTvMult) },
                    { label: "Enterprise Value", value: fmt(dcfData.evMult) },
                    { label: "Net Debt", value: fmt(dcfData.netDebt) },
                    { label: "Intrinsic Value/Share", value: fmtM(dcfData.intrinsicMult), big: true },
                  ].map(({ label, value, big }) => (
                    <div key={label} className="flex justify-between py-1.5 border-b border-border/50">
                      <span className={cn("text-xs", big ? "text-foreground font-medium" : "text-muted-foreground")}>{label}</span>
                      <span className={cn("text-xs font-mono", big ? "text-primary text-sm font-bold" : "text-muted-foreground")}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                  <SectionHeading>Margin of Safety</SectionHeading>
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Current Price</span>
                      <span className="text-xs font-mono text-foreground">{fmtM(companyData.currentPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Intrinsic (GGM)</span>
                      <span className="text-xs font-mono text-emerald-400">{fmtM(dcfData.intrinsicGGM)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Intrinsic (Mult.)</span>
                      <span className="text-xs font-mono text-primary">{fmtM(dcfData.intrinsicMult)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">MoS vs GGM</span>
                      <span className={cn("text-xs font-mono font-medium", dcfData.intrinsicGGM > companyData.currentPrice ? "text-emerald-400" : "text-red-400")}>
                        {((dcfData.intrinsicGGM / companyData.currentPrice - 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="pt-2 border-t border-border flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-medium">Signal</span>
                      <span className={cn("text-lg font-medium", mosColor)}>{mosGGM}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Football field chart */}
              <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                <p className="text-xs font-medium text-muted-foreground mb-4">Football Field — Implied Price Ranges</p>
                <div className="overflow-x-auto">
                  <FootballFieldChart rows={footballRows} currentPrice={companyData.currentPrice} width={540} />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ─── Tab 5: Comparables ───────────────────────────────────────────── */}
          <TabsContent value="comps" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {/* Comps table */}
              <div className="overflow-x-auto rounded-xl border border-border/50 bg-card mb-6">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-foreground/[0.04] border-b border-border">
                      {["Company", "Revenue ($B)", "EBITDA ($B)", "Net Income ($B)", "Mkt Cap ($B)", "EV ($B)", "EV/Rev", "EV/EBITDA", "P/E", "P/FCF", "P/S"].map((h) => (
                        <th key={h} className="text-right first:text-left py-2 px-3 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compsData.map((p) => {
                      const isSelected = p.ticker === company;
                      return (
                        <tr key={p.ticker} className={cn("border-b border-border/50", isSelected && "bg-primary/10")}>
                          <td className={cn("py-1.5 px-3 font-medium", isSelected ? "text-primary" : "text-muted-foreground")}>
                            {p.ticker} {isSelected && <span className="text-[11px] bg-primary/20 text-primary px-1 rounded">Selected</span>}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{p.revenue.toFixed(1)}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{p.ebitda.toFixed(1)}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{p.netIncome.toFixed(1)}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{p.marketCap.toFixed(0)}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{p.enterpriseValue.toFixed(0)}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{fmtRatio(p.evRevenue)}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{fmtRatio(p.evEbitda)}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{fmtRatio(p.pe)}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{fmtRatio(p.pFcf)}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{fmtRatio(p.pSales)}</td>
                        </tr>
                      );
                    })}
                    {/* Median row */}
                    <tr className="border-t-2 border-border bg-primary/5">
                      <td className="py-1.5 px-3 font-medium text-primary">Median</td>
                      <td className="py-1.5 px-3 text-right font-mono text-primary">—</td>
                      <td className="py-1.5 px-3 text-right font-mono text-primary">—</td>
                      <td className="py-1.5 px-3 text-right font-mono text-primary">—</td>
                      <td className="py-1.5 px-3 text-right font-mono text-primary">—</td>
                      <td className="py-1.5 px-3 text-right font-mono text-primary">—</td>
                      <td className="py-1.5 px-3 text-right font-mono font-medium text-primary">{fmtRatio(medians.evRevenue)}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-medium text-primary">{fmtRatio(medians.evEbitda)}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-medium text-primary">{fmtRatio(medians.pe)}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-medium text-primary">{fmtRatio(medians.pFcf)}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-medium text-primary">{fmtRatio(medians.pSales)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Implied valuation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                  <SectionHeading>Implied Share Price — {company}</SectionHeading>
                  <table className="w-full text-xs mt-1">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1.5 text-muted-foreground font-medium">Multiple</th>
                        <th className="text-right py-1.5 text-muted-foreground font-medium">Median</th>
                        <th className="text-right py-1.5 text-muted-foreground font-medium">Implied Price</th>
                        <th className="text-right py-1.5 text-muted-foreground font-medium">vs Current</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "EV/Revenue", median: fmtRatio(medians.evRevenue), implied: impliedFromComps.evRevImplied },
                        { label: "EV/EBITDA", median: fmtRatio(medians.evEbitda), implied: impliedFromComps.evEbitdaImplied },
                        { label: "P/E", median: fmtRatio(medians.pe), implied: impliedFromComps.peImplied },
                        { label: "P/FCF", median: fmtRatio(medians.pFcf), implied: impliedFromComps.pFcfImplied },
                        { label: "P/Sales", median: fmtRatio(medians.pSales), implied: impliedFromComps.pSalesImplied },
                      ].map(({ label, median, implied }) => {
                        const upside = (implied / companyData.currentPrice - 1) * 100;
                        return (
                          <tr key={label} className="border-b border-border/50">
                            <td className="py-1.5 text-muted-foreground">{label}</td>
                            <td className="py-1.5 text-right font-mono text-muted-foreground">{median}</td>
                            <td className="py-1.5 text-right font-mono text-foreground font-medium">{fmtM(implied)}</td>
                            <td className={cn("py-1.5 text-right font-mono font-medium", upside >= 0 ? "text-emerald-400" : "text-red-400")}>
                              {upside >= 0 ? "+" : ""}{upside.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Comps Football Field</p>
                  <div className="overflow-x-auto">
                    <FootballFieldChart rows={compsFootballRows} currentPrice={companyData.currentPrice} width={380} />
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ─── Tab 6: Scenario Analysis ─────────────────────────────────────── */}
          <TabsContent value="scenario" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {/* Scenario summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {scenarioResults.map((sc) => {
                  const colors = {
                    bull: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
                    base: { bg: "bg-primary/10", border: "border-border", text: "text-primary", badge: "bg-primary/20 text-primary" },
                    bear: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", badge: "bg-red-500/20 text-red-300" },
                  };
                  const c = colors[sc.scenario];
                  const upside = (sc.impliedPrice / companyData.currentPrice - 1) * 100;
                  return (
                    <div key={sc.scenario} className={cn("rounded-xl border p-4", c.bg, c.border)}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={cn("text-sm font-medium capitalize", c.text)}>{sc.scenario} Case</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", c.badge)}>2026E</span>
                      </div>
                      {[
                        { label: "Revenue", value: fmt(sc.revenue) },
                        { label: "EBITDA", value: fmt(sc.ebitda) },
                        { label: "Net Income", value: fmt(sc.netIncome) },
                        { label: "FCF", value: fmt(sc.fcf) },
                        { label: "Implied Price", value: fmtM(sc.impliedPrice) },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-1 border-b border-border/50">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <span className="text-xs font-mono text-foreground">{value}</span>
                        </div>
                      ))}
                      <div className={cn("mt-2 text-sm font-medium text-center pt-1", upside >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {upside >= 0 ? "+" : ""}{upside.toFixed(1)}% vs Current
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Tornado chart */}
                <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tornado Chart — Sensitivity of DCF Value</p>
                  <p className="text-xs text-muted-foreground mb-3">Each bar shows impact of ±1 standard deviation change</p>
                  <div className="overflow-x-auto">
                    <TornadoChart rows={tornadoRows} baseValue={dcfData.intrinsicGGM} width={380} />
                  </div>
                </div>

                {/* Monte Carlo */}
                <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Monte Carlo — 500 Simulations</p>
                  <p className="text-xs text-muted-foreground mb-3">Random variation on WACC ±2%, growth ±10%, margins ±5%</p>
                  <div className="overflow-x-auto">
                    <MonteCarloChart outcomes={monteCarloResults} width={380} height={110} />
                  </div>
                  {monteCarloResults.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(() => {
                        const sorted = [...monteCarloResults].sort((a, b) => a - b);
                        const p10 = sorted[Math.floor(sorted.length * 0.1)];
                        const p50 = sorted[Math.floor(sorted.length * 0.5)];
                        const p90 = sorted[Math.floor(sorted.length * 0.9)];
                        const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
                        return (
                          <>
                            <StatChip label="P10" value={fmtM(p10)} color="red" />
                            <StatChip label="Median" value={fmtM(p50)} color="blue" />
                            <StatChip label="Mean" value={fmtM(mean)} color="purple" />
                            <StatChip label="P90" value={fmtM(p90)} color="green" />
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Break-even analysis */}
              <div className="bg-foreground/[0.03] border border-border/50 rounded-xl p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Break-Even Analysis</p>
                <p className="text-xs text-muted-foreground mb-3">Revenue growth rate required for stock to be fairly valued (DCF = Current Price)</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3 bg-foreground/[0.03] border border-border rounded-lg px-4 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Price</p>
                      <p className="text-lg font-medium text-foreground">{fmtM(companyData.currentPrice)}</p>
                    </div>
                    <div className="text-muted-foreground text-xl">=</div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Break-Even Revenue Growth</p>
                      <p className="text-lg font-medium text-amber-400">{breakEvenGrowth}%</p>
                    </div>
                    <div className="text-muted-foreground text-xl">vs</div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Forecast</p>
                      <p className={cn("text-lg font-medium", isAssumptions.revenueGrowth >= parseFloat(breakEvenGrowth) ? "text-emerald-400" : "text-red-400")}>
                        {isAssumptions.revenueGrowth.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-4 py-3 rounded-lg border text-sm font-medium",
                    isAssumptions.revenueGrowth >= parseFloat(breakEvenGrowth)
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  )}>
                    {isAssumptions.revenueGrowth >= parseFloat(breakEvenGrowth)
                      ? "Your growth forecast exceeds break-even — stock may be undervalued"
                      : "Your growth forecast is below break-even — stock may be overvalued"}
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
