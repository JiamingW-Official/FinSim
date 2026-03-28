"use client";

import { useState, useMemo } from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BookOpen,
  BarChart3,
  Flame,
  Leaf,
  Beef,
  Coffee,
  Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import CommoditiesFuturesTrading from "@/components/commodities/CommoditiesFuturesTrading";

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

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

// ── Types ─────────────────────────────────────────────────────────────────────

interface Commodity {
  id: string;
  name: string;
  symbol: string;
  unit: string;
  basePrice: number;
  category: "energy" | "metals" | "agriculture" | "livestock" | "softs";
}

interface CommodityRow extends Commodity {
  price: number;
  change1d: number;
  change1w: number;
  change1m: number;
  ytd: number;
  week52Low: number;
  week52High: number;
  seasonality: number; // -100 to +100
}

// ── Commodity definitions ─────────────────────────────────────────────────────

const COMMODITIES: Commodity[] = [
  // Energy
  { id: "wti",  name: "Crude Oil (WTI)",  symbol: "CL",  unit: "USD/bbl", basePrice: 78.5,  category: "energy" },
  { id: "brent",name: "Crude Oil (Brent)",symbol: "BZ",  unit: "USD/bbl", basePrice: 82.3,  category: "energy" },
  { id: "ng",   name: "Natural Gas",      symbol: "NG",  unit: "USD/MMBtu",basePrice: 2.45, category: "energy" },
  { id: "rb",   name: "Gasoline (RBOB)",  symbol: "RB",  unit: "USD/gal", basePrice: 2.35,  category: "energy" },
  { id: "ho",   name: "Heating Oil",      symbol: "HO",  unit: "USD/gal", basePrice: 2.65,  category: "energy" },
  { id: "coal", name: "Coal (Newcastle)", symbol: "XAL", unit: "USD/ton", basePrice: 135.0, category: "energy" },
  // Metals
  { id: "gc",   name: "Gold",             symbol: "GC",  unit: "USD/oz",  basePrice: 2340,  category: "metals" },
  { id: "si",   name: "Silver",           symbol: "SI",  unit: "USD/oz",  basePrice: 27.5,  category: "metals" },
  { id: "hg",   name: "Copper",           symbol: "HG",  unit: "USD/lb",  basePrice: 4.18,  category: "metals" },
  { id: "pl",   name: "Platinum",         symbol: "PL",  unit: "USD/oz",  basePrice: 1020,  category: "metals" },
  { id: "pa",   name: "Palladium",        symbol: "PA",  unit: "USD/oz",  basePrice: 1080,  category: "metals" },
  { id: "al",   name: "Aluminum",         symbol: "ALI", unit: "USD/ton", basePrice: 2280,  category: "metals" },
  // Agriculture
  { id: "zc",   name: "Corn",             symbol: "ZC",  unit: "USD/bu",  basePrice: 4.38,  category: "agriculture" },
  { id: "zw",   name: "Wheat",            symbol: "ZW",  unit: "USD/bu",  basePrice: 5.52,  category: "agriculture" },
  { id: "zs",   name: "Soybeans",         symbol: "ZS",  unit: "USD/bu",  basePrice: 11.25, category: "agriculture" },
  { id: "ct",   name: "Cotton",           symbol: "CT",  unit: "USD/lb",  basePrice: 0.82,  category: "agriculture" },
  { id: "kc",   name: "Coffee (Arabica)", symbol: "KC",  unit: "USD/lb",  basePrice: 2.25,  category: "agriculture" },
  { id: "sb",   name: "Sugar #11",        symbol: "SB",  unit: "USD/lb",  basePrice: 0.195, category: "agriculture" },
  // Livestock
  { id: "lc",   name: "Live Cattle",      symbol: "LC",  unit: "USD/lb",  basePrice: 1.92,  category: "livestock" },
  { id: "lh",   name: "Lean Hogs",        symbol: "LH",  unit: "USD/lb",  basePrice: 0.88,  category: "livestock" },
  { id: "fc",   name: "Feeder Cattle",    symbol: "FC",  unit: "USD/lb",  basePrice: 2.61,  category: "livestock" },
  // Softs
  { id: "cc",   name: "Cocoa",            symbol: "CC",  unit: "USD/ton", basePrice: 9800,  category: "softs" },
  { id: "oj",   name: "Orange Juice",     symbol: "OJ",  unit: "USD/lb",  basePrice: 3.45,  category: "softs" },
  { id: "lbs",  name: "Lumber",           symbol: "LBS", unit: "USD/mbf", basePrice: 540,   category: "softs" },
];

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  energy:      { label: "Energy",      icon: Flame,       color: "text-orange-400" },
  metals:      { label: "Metals",      icon: BarChart3,   color: "text-yellow-400" },
  agriculture: { label: "Agriculture", icon: Leaf,        color: "text-green-400" },
  livestock:   { label: "Livestock",   icon: Beef,        color: "text-red-400" },
  softs:       { label: "Softs",       icon: Coffee,      color: "text-amber-400" },
};

const TOP10_IDS = ["wti","gc","si","hg","zc","zs","zw","ng","kc","cc"];

const COMMODITY_DRIVERS: Record<string, { driver: string; status: string; bullish: boolean }[]> = {
  wti: [
    { driver: "OPEC+ Supply", status: "Cuts extended Q2 2026", bullish: true },
    { driver: "US Demand", status: "Gasoline demand strong", bullish: true },
    { driver: "Inventory", status: "Cushing -3.2M bbl wk", bullish: true },
    { driver: "USD Strength", status: "DXY 104, mild headwind", bullish: false },
  ],
  brent: [
    { driver: "OPEC+ Supply", status: "Cuts extended Q2 2026", bullish: true },
    { driver: "North Sea Output", status: "Maintenance season", bullish: true },
    { driver: "Shipping Costs", status: "Red Sea rerouting +18%", bullish: false },
    { driver: "China Demand", status: "Recovering slowly", bullish: true },
  ],
  gc: [
    { driver: "Inflation (CPI)", status: "CPI 3.2%, still elevated", bullish: true },
    { driver: "DXY (USD)", status: "Dollar softening", bullish: true },
    { driver: "Real Rates", status: "10Y TIPS yield 1.8%", bullish: false },
    { driver: "Central Bank Buy", status: "EM CBs accumulating", bullish: true },
  ],
  hg: [
    { driver: "China PMI", status: "Manufacturing 50.8", bullish: true },
    { driver: "Green Energy", status: "EV/solar demand surge", bullish: true },
    { driver: "Chilean Mines", status: "Codelco output +4%", bullish: false },
    { driver: "Inventory LME", status: "Stocks -22% YTD", bullish: true },
  ],
  zc: [
    { driver: "US Acreage", status: "USDA estimate 91.5M ac", bullish: false },
    { driver: "Weather (Corn Belt)", status: "La Nina drought risk", bullish: true },
    { driver: "Ethanol Demand", status: "Blend mandate stable", bullish: true },
    { driver: "Brazil Safrinha", status: "Record harvest expected", bullish: false },
  ],
  zs: [
    { driver: "Brazil Crop", status: "Record 170M ton forecast", bullish: false },
    { driver: "China Imports", status: "Buying paused", bullish: false },
    { driver: "US Crushing", status: "Crush margins strong", bullish: true },
    { driver: "Weather Risk", status: "Argentina normal", bullish: false },
  ],
  default: [
    { driver: "Supply/Demand", status: "Balanced market", bullish: true },
    { driver: "USD", status: "Neutral to mildly negative", bullish: false },
    { driver: "Macro", status: "Global growth modest", bullish: true },
    { driver: "Seasonal", status: "Current season neutral", bullish: false },
  ],
};

const ETF_TABLE = [
  { ticker: "DJP",  name: "iPath Bloomberg Commodity",  aum: "0.5B",  er: "0.70%", exposure: "Broad Futures",  ytd: 2.3 },
  { ticker: "GSG",  name: "iShares S&P GSCI Commodity", aum: "0.9B",  er: "0.75%", exposure: "Broad Futures",  ytd: 1.8 },
  { ticker: "PDBC", name: "Invesco DB Commodity",       aum: "5.2B",  er: "0.59%", exposure: "Optimized Roll", ytd: 3.1 },
  { ticker: "IAU",  name: "iShares Gold Trust",         aum: "31.2B", er: "0.25%", exposure: "Physical Gold",  ytd: 8.4 },
  { ticker: "USO",  name: "US Oil Fund",                aum: "1.1B",  er: "0.60%", exposure: "WTI Front Month",ytd: -1.2 },
];

// ── Data generation ───────────────────────────────────────────────────────────

function generateRows(rng: () => number): CommodityRow[] {
  return COMMODITIES.map((c) => {
    const noise = () => (rng() - 0.5) * 2;
    const price = c.basePrice * (1 + noise() * 0.02);
    const change1d = noise() * 3;
    const change1w = noise() * 6;
    const change1m = noise() * 10;
    const ytd = noise() * 18;
    const spread = c.basePrice * (0.12 + rng() * 0.15);
    const week52Low = price - spread * rng();
    const week52High = price + spread * rng();
    const seasonality = Math.round((noise() * 70));
    return { ...c, price, change1d, change1w, change1m, ytd, week52Low, week52High, seasonality };
  });
}

function genMonthlyReturns(id: string, rng: () => number): number[] {
  // Seed-stable per commodity
  const idHash = id.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 0) & 0xffff;
  const r2 = mulberry32(2222 + idHash);
  return Array.from({ length: 12 }, () => (r2() - 0.48) * 8);
}

function genPriceHistory(basePrice: number, rng: () => number): { month: string; price: number }[] {
  const months = ["Mar'25","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'26","Feb","Mar"];
  let price = basePrice * (1 - 0.08);
  return months.map((month) => {
    price = price * (1 + (rng() - 0.48) * 0.06);
    return { month, price };
  });
}

function genTermStructure(spotPrice: number, rng: () => number): { label: string; price: number }[] {
  const labels = ["Spot", "+1M", "+2M", "+3M", "+4M", "+6M"];
  let p = spotPrice;
  return labels.map((label) => {
    const drift = (rng() - 0.42) * 0.015;
    p = p * (1 + drift);
    return { label, price: p };
  });
}

// ── Format helpers ────────────────────────────────────────────────────────────

function fmt(n: number, dec = 2): string {
  return n.toFixed(dec);
}

function pct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

// ── Tiny components ───────────────────────────────────────────────────────────

function PctBadge({ v }: { v: number }) {
  const pos = v >= 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium tabular-nums", pos ? "text-green-400" : "text-red-400")}>
      {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {pct(v)}
    </span>
  );
}

function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const pct = Math.max(0, Math.min(100, ((current - low) / (high - low)) * 100));
  return (
    <div className="flex items-center gap-1.5 w-full">
      <span className="text-[9px] text-muted-foreground tabular-nums">{low.toFixed(0)}</span>
      <div className="relative flex-1 h-1 bg-muted rounded-full">
        <div className="absolute top-0 left-0 h-full bg-primary/40 rounded-full" style={{ width: `${pct}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary border border-background" style={{ left: `calc(${pct}% - 4px)` }} />
      </div>
      <span className="text-[9px] text-muted-foreground tabular-nums">{high.toFixed(0)}</span>
    </div>
  );
}

function SeasonalityBar({ score }: { score: number }) {
  const abs = Math.abs(score);
  const color = score > 20 ? "bg-green-500" : score < -20 ? "bg-red-500" : "bg-yellow-500";
  return (
    <div className="flex items-center gap-1">
      <div className="relative w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        {score >= 0 ? (
          <div className={cn("absolute top-0 left-1/2 h-full rounded-full", color)} style={{ width: `${abs / 2}%` }} />
        ) : (
          <div className={cn("absolute top-0 h-full rounded-full", color)} style={{ right: "50%", width: `${abs / 2}%` }} />
        )}
      </div>
      <span className={cn("text-[10px] font-medium tabular-nums", score > 20 ? "text-green-400" : score < -20 ? "text-red-400" : "text-yellow-400")}>
        {score > 0 ? "+" : ""}{score}
      </span>
    </div>
  );
}

// ── SVG Charts ────────────────────────────────────────────────────────────────

function PriceChart({ data, basePrice }: { data: { month: string; price: number }[]; basePrice: number }) {
  const W = 400, H = 180, PAD = { t: 12, r: 12, b: 28, l: 48 };
  const prices = data.map((d) => d.price);
  const minP = Math.min(...prices) * 0.995;
  const maxP = Math.max(...prices) * 1.005;
  const xScale = (i: number) => PAD.l + (i / (data.length - 1)) * (W - PAD.l - PAD.r);
  const yScale = (p: number) => PAD.t + (1 - (p - minP) / (maxP - minP)) * (H - PAD.t - PAD.b);
  const pts = data.map((d, i) => `${xScale(i)},${yScale(d.price)}`).join(" ");
  const polyFill = `${xScale(0)},${H - PAD.b} ${pts} ${xScale(data.length - 1)},${H - PAD.b}`;
  const isUp = data[data.length - 1].price >= data[0].price;
  const color = isUp ? "#4ade80" : "#f87171";
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount }, (_, i) => minP + (maxP - minP) * (i / (tickCount - 1)));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" className="overflow-visible">
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} x2={W - PAD.r} y1={yScale(v)} y2={yScale(v)} stroke="currentColor" strokeOpacity={0.08} strokeDasharray="3,3" />
          <text x={PAD.l - 4} y={yScale(v) + 4} textAnchor="end" fill="currentColor" fillOpacity={0.4} fontSize={9}>{v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(v < 10 ? 2 : 0)}</text>
        </g>
      ))}
      <polygon points={polyFill} fill={color} fillOpacity={0.08} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {data.map((d, i) => (
        i % 3 === 0 ? <text key={i} x={xScale(i)} y={H - PAD.b + 10} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={8}>{d.month}</text> : null
      ))}
      <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} stroke="currentColor" strokeOpacity={0.15} />
      <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="currentColor" strokeOpacity={0.15} />
      <circle cx={xScale(data.length - 1)} cy={yScale(data[data.length - 1].price)} r={3} fill={color} />
    </svg>
  );
}

function SeasonalBarChart({ returns: monthReturns }: { returns: number[] }) {
  const W = 400, H = 120, PAD = { t: 8, r: 8, b: 28, l: 36 };
  const maxAbs = Math.max(...monthReturns.map(Math.abs), 1);
  const barW = (W - PAD.l - PAD.r) / 12 - 2;
  const midY = PAD.t + (H - PAD.t - PAD.b) / 2;
  const MONTHS = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <line x1={PAD.l} x2={W - PAD.r} y1={midY} y2={midY} stroke="currentColor" strokeOpacity={0.15} />
      {monthReturns.map((r, i) => {
        const x = PAD.l + i * ((W - PAD.l - PAD.r) / 12) + 1;
        const barH = Math.abs(r) / maxAbs * ((H - PAD.t - PAD.b) / 2 - 2);
        const y = r >= 0 ? midY - barH : midY;
        const color = r >= 0 ? "#4ade80" : "#f87171";
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} fillOpacity={0.7} rx={1} />
            <text x={x + barW / 2} y={H - PAD.b + 10} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={8}>{MONTHS[i]}</text>
            <text x={x + barW / 2} y={r >= 0 ? y - 2 : y + barH + 8} textAnchor="middle" fill={color} fontSize={7}>{r >= 0 ? "+" : ""}{r.toFixed(1)}</text>
          </g>
        );
      })}
      <text x={PAD.l - 2} y={midY + 4} textAnchor="end" fill="currentColor" fillOpacity={0.4} fontSize={8}>0%</text>
    </svg>
  );
}

function TermStructureChart({ data }: { data: { label: string; price: number }[] }) {
  const W = 360, H = 130, PAD = { t: 12, r: 12, b: 28, l: 52 };
  const prices = data.map((d) => d.price);
  const minP = Math.min(...prices) * 0.995;
  const maxP = Math.max(...prices) * 1.005;
  const xScale = (i: number) => PAD.l + (i / (data.length - 1)) * (W - PAD.l - PAD.r);
  const yScale = (p: number) => PAD.t + (1 - (p - minP) / (maxP - minP)) * (H - PAD.t - PAD.b);
  const pts = data.map((d, i) => `${xScale(i)},${yScale(d.price)}`).join(" ");
  const isContango = data[data.length - 1].price > data[0].price;
  const color = isContango ? "#f87171" : "#4ade80";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} stroke="currentColor" strokeOpacity={0.15} />
      <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="currentColor" strokeOpacity={0.15} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xScale(i)} cy={yScale(d.price)} r={3} fill={color} />
          <text x={xScale(i)} y={H - PAD.b + 10} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={8}>{d.label}</text>
          <text x={PAD.l - 4} y={yScale(d.price) + 4} textAnchor="end" fill="currentColor" fillOpacity={0.3} fontSize={7}>{d.price >= 100 ? d.price.toFixed(0) : d.price.toFixed(2)}</text>
        </g>
      ))}
      <text x={PAD.l + 4} y={PAD.t + 10} fill={color} fontSize={9} fontWeight="600">
        {isContango ? "Contango" : "Backwardation"}
      </text>
    </svg>
  );
}

function CorrelationHeatmap({ rows }: { rows: CommodityRow[] }) {
  const top10 = TOP10_IDS.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as CommodityRow[];
  const n = top10.length;
  const rng2 = mulberry32(3737);
  // Generate stable correlation matrix
  const corr: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j) return 1;
      return parseFloat(((rng2() - 0.5) * 1.6).toFixed(2));
    })
  );
  // Make symmetric
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) corr[j][i] = corr[i][j];

  const CELL = 34, LABEL_W = 64, LABEL_H = 60;
  const W = LABEL_W + n * CELL;
  const H = LABEL_H + n * CELL;

  function corrColor(v: number): string {
    if (v >= 0.7) return "#166534";
    if (v >= 0.3) return "#15803d";
    if (v >= 0.1) return "#4ade8040";
    if (v >= -0.1) return "#374151";
    if (v >= -0.3) return "#b45309";
    if (v >= -0.7) return "#b91c1c";
    return "#7f1d1d";
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="overflow-visible">
      {top10.map((r, i) => (
        <g key={r.id}>
          <text
            x={LABEL_W + i * CELL + CELL / 2}
            y={LABEL_H - 4}
            textAnchor="middle"
            fill="currentColor"
            fillOpacity={0.6}
            fontSize={8}
            transform={`rotate(-45, ${LABEL_W + i * CELL + CELL / 2}, ${LABEL_H - 4})`}
          >
            {r.symbol}
          </text>
          <text
            x={LABEL_W - 4}
            y={LABEL_H + i * CELL + CELL / 2 + 4}
            textAnchor="end"
            fill="currentColor"
            fillOpacity={0.6}
            fontSize={8}
          >
            {r.symbol}
          </text>
        </g>
      ))}
      {corr.map((row, i) =>
        row.map((v, j) => (
          <g key={`${i}-${j}`}>
            <rect
              x={LABEL_W + j * CELL}
              y={LABEL_H + i * CELL}
              width={CELL - 1}
              height={CELL - 1}
              fill={corrColor(v)}
              rx={2}
            />
            <text
              x={LABEL_W + j * CELL + CELL / 2}
              y={LABEL_H + i * CELL + CELL / 2 + 4}
              textAnchor="middle"
              fill="white"
              fillOpacity={0.8}
              fontSize={7}
            >
              {v.toFixed(2)}
            </text>
          </g>
        ))
      )}
    </svg>
  );
}

function ScatterPlot({ rng }: { rng: () => number }) {
  const W = 320, H = 200, PAD = { t: 12, r: 12, b: 36, l: 44 };
  const points = Array.from({ length: 24 }, () => {
    const cpi = 0.5 + rng() * 8;
    const commRet = cpi * (1.2 + (rng() - 0.5) * 3) - 2 + (rng() - 0.5) * 8;
    return { cpi, commRet };
  });
  const xMin = 0, xMax = 10;
  const yMin = -15, yMax = 20;
  const xScale = (v: number) => PAD.l + ((v - xMin) / (xMax - xMin)) * (W - PAD.l - PAD.r);
  const yScale = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <line x1={PAD.l} x2={W - PAD.r} y1={yScale(0)} y2={yScale(0)} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="3,3" />
      <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} stroke="currentColor" strokeOpacity={0.15} />
      <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="currentColor" strokeOpacity={0.15} />
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <text key={v} x={xScale(v)} y={H - PAD.b + 10} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={8}>{v}%</text>
      ))}
      {[-10, 0, 10, 20].map((v) => (
        <text key={v} x={PAD.l - 4} y={yScale(v) + 4} textAnchor="end" fill="currentColor" fillOpacity={0.4} fontSize={8}>{v}%</text>
      ))}
      <text x={(W) / 2} y={H - 2} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={9}>CPI Inflation</text>
      {points.map((p, i) => (
        <circle key={i} cx={xScale(p.cpi)} cy={yScale(p.commRet)} r={3} fill="#a78bfa" fillOpacity={0.7} />
      ))}
      {/* Trend line */}
      <line
        x1={xScale(0.5)} y1={yScale(-1.5)} x2={xScale(9.5)} y2={yScale(13)}
        stroke="#a78bfa" strokeOpacity={0.4} strokeWidth={1.5} strokeDasharray="4,2"
      />
    </svg>
  );
}

function TermStructureDiagramEdu({ type }: { type: "contango" | "backwardation" }) {
  const W = 280, H = 120, PAD = { t: 12, r: 12, b: 24, l: 12 };
  const n = 6;
  const xScale = (i: number) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
  const yScale = (v: number) => PAD.t + (1 - v) * (H - PAD.t - PAD.b);
  const vals = type === "contango"
    ? [0.35, 0.45, 0.55, 0.65, 0.72, 0.78]
    : [0.78, 0.70, 0.62, 0.54, 0.47, 0.40];
  const pts = vals.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
  const color = type === "contango" ? "#f87171" : "#4ade80";
  const labels = ["Spot", "1M", "2M", "3M", "4M", "6M"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {vals.map((v, i) => (
        <g key={i}>
          <circle cx={xScale(i)} cy={yScale(v)} r={3} fill={color} />
          <text x={xScale(i)} y={H - PAD.b + 10} textAnchor="middle" fill="currentColor" fillOpacity={0.5} fontSize={8}>{labels[i]}</text>
        </g>
      ))}
      <text x={PAD.l + 4} y={PAD.t + 10} fill={color} fontSize={9} fontWeight="600">
        {type === "contango" ? "Contango" : "Backwardation"}
      </text>
    </svg>
  );
}

// ── Inventory bar ─────────────────────────────────────────────────────────────

function InventoryBar({ current, fiveYrAvg }: { current: number; fiveYrAvg: number }) {
  const maxVal = Math.max(current, fiveYrAvg) * 1.15;
  const currPct = (current / maxVal) * 100;
  const avgPct = (fiveYrAvg / maxVal) * 100;
  const above = current > fiveYrAvg;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground w-28">Current Inventory</div>
        <div className="flex-1 relative h-4 bg-muted rounded overflow-hidden">
          <div className="absolute inset-y-0 left-0 rounded" style={{ width: `${currPct}%`, background: above ? "#4ade80" : "#f87171" }} />
          <span className="absolute inset-y-0 right-2 flex items-center text-[10px] font-medium text-white">{current.toFixed(1)}M</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground w-28">5-Yr Average</div>
        <div className="flex-1 relative h-4 bg-muted rounded overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-blue-500/50 rounded" style={{ width: `${avgPct}%` }} />
          <span className="absolute inset-y-0 right-2 flex items-center text-[10px] font-medium text-white">{fiveYrAvg.toFixed(1)}M</span>
        </div>
      </div>
      <p className={cn("text-xs", above ? "text-green-400" : "text-red-400")}>
        {above ? "Surplus" : "Deficit"}: {Math.abs(current - fiveYrAvg).toFixed(1)}M units vs 5-yr avg
      </p>
    </div>
  );
}

// ── Commodity row in table ────────────────────────────────────────────────────

function CommodityTableRow({ row }: { row: CommodityRow }) {
  return (
    <tr className="border-b border-border/30 hover:bg-accent/20 transition-colors">
      <td className="py-2 px-3">
        <div className="font-medium text-sm">{row.name}</div>
        <div className="text-[10px] text-muted-foreground">{row.symbol} · {row.unit}</div>
      </td>
      <td className="py-2 px-3 text-right tabular-nums text-sm font-medium">{fmt(row.price, row.price < 10 ? 3 : row.price < 100 ? 2 : 0)}</td>
      <td className="py-2 px-3 text-right"><PctBadge v={row.change1d} /></td>
      <td className="py-2 px-3 text-right"><PctBadge v={row.change1w} /></td>
      <td className="py-2 px-3 text-right"><PctBadge v={row.change1m} /></td>
      <td className="py-2 px-3 text-right"><PctBadge v={row.ytd} /></td>
      <td className="py-2 px-3 min-w-[140px]">
        <RangeBar low={row.week52Low} high={row.week52High} current={row.price} />
      </td>
      <td className="py-2 px-3">
        <SeasonalityBar score={row.seasonality} />
      </td>
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CommoditiesPage() {
  const rng = useMemo(() => mulberry32(2222), []);
  const rows = useMemo(() => generateRows(rng), [rng]);

  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(["energy"]));
  const [selectedId, setSelectedId] = useState<string>("wti");

  function toggleCategory(cat: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const categories = ["energy", "metals", "agriculture", "livestock", "softs"] as const;
  const byCategory = useMemo(() => {
    const map: Record<string, CommodityRow[]> = {};
    for (const cat of categories) map[cat] = rows.filter((r) => r.category === cat);
    return map;
  }, [rows]);

  // Most volatile today
  const mostVolatile = useMemo(
    () => [...rows].sort((a, b) => Math.abs(b.change1d) - Math.abs(a.change1d)).slice(0, 3),
    [rows]
  );

  // Analysis tab
  const selectedRow = useMemo(() => rows.find((r) => r.id === selectedId) ?? rows[0], [rows, selectedId]);
  const rngStable = useMemo(() => mulberry32(2222 + (selectedId.charCodeAt(0) * 17)), [selectedId]);
  const priceHistory = useMemo(() => genPriceHistory(selectedRow.basePrice, mulberry32(2222 + selectedId.charCodeAt(0))), [selectedRow, selectedId]);
  const monthlyReturns = useMemo(() => genMonthlyReturns(selectedId, rng), [selectedId, rng]);
  const termStructure = useMemo(() => genTermStructure(selectedRow.price, mulberry32(9999 + selectedId.charCodeAt(0))), [selectedRow, selectedId]);
  const drivers = useMemo(() => COMMODITY_DRIVERS[selectedId] ?? COMMODITY_DRIVERS.default, [selectedId]);

  const inventoryCurrent = useMemo(() => 280 + rngStable() * 120, [rngStable]);
  const inventoryAvg = useMemo(() => 320 + rngStable() * 60, [rngStable]);

  // Portfolio tab
  const scatterRng = useMemo(() => mulberry32(5555), []);

  const ALLOCATION = [
    { label: "Gold", pct: 40, color: "#facc15" },
    { label: "Energy", pct: 30, color: "#f97316" },
    { label: "Agriculture", pct: 20, color: "#4ade80" },
    { label: "Base Metals", pct: 10, color: "#60a5fa" },
  ];

  const CYCLE_PHASES = [
    { phase: "Early Expansion", leaders: ["Copper", "Energy"], laggards: ["Gold", "Grains"], color: "text-green-400" },
    { phase: "Late Expansion",  leaders: ["Energy", "Metals"],  laggards: ["Bonds"],          color: "text-yellow-400" },
    { phase: "Early Recession", leaders: ["Gold", "Bonds"],     laggards: ["Copper", "Oil"],  color: "text-orange-400" },
    { phase: "Late Recession",  leaders: ["Agriculture", "Gold"],laggards: ["Energy"],         color: "text-red-400" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border/50 bg-background/80 backdrop-blur px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Commodity Markets</h1>
              <p className="text-xs text-muted-foreground">Real-time pricing, supply/demand analysis, and portfolio allocation</p>
            </div>
          </div>
          {/* Volatile badges */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-400" /> Most volatile today:
            </span>
            {mostVolatile.map((r) => (
              <span
                key={r.id}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
                  r.change1d >= 0
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                )}
              >
                {r.symbol} {pct(r.change1d)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="markets" className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="flex-shrink-0 mx-6 mt-3 w-fit">
          <TabsTrigger value="markets">Commodity Markets</TabsTrigger>
          <TabsTrigger value="analysis">Commodity Analysis</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Allocation</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Markets ── */}
        <TabsContent value="markets" className="flex-1 overflow-y-auto px-6 pb-6 mt-3 data-[state=inactive]:hidden">
          {/* Correlation heatmap */}
          <div className="rounded-lg border border-border/50 bg-card p-4 mb-4">
            <h2 className="text-sm font-semibold mb-1">Correlation Heatmap — Top 10 Commodities</h2>
            <p className="text-xs text-muted-foreground mb-3">Green = positive correlation, Red = negative. Based on 1-year rolling returns.</p>
            <div className="overflow-x-auto">
              <CorrelationHeatmap rows={rows} />
            </div>
          </div>

          {/* Category accordions */}
          <div className="space-y-2">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              const isOpen = openCategories.has(cat);
              const catRows = byCategory[cat];
              return (
                <div key={cat} className="rounded-lg border border-border/50 bg-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", meta.color)} />
                      <span className="font-semibold text-sm">{meta.label}</span>
                      <span className="text-xs text-muted-foreground ml-1">({catRows.length} contracts)</span>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {isOpen && (
                    <div className="border-t border-border/30">
                      {cat === "energy" && (
                        <div className="px-4 py-2 bg-muted/20">
                          <span className="text-xs text-muted-foreground">WTI/Brent Spread: </span>
                          <span className="text-xs font-medium text-amber-400">
                            {fmt(
                              (rows.find((r) => r.id === "brent")?.price ?? 0) -
                              (rows.find((r) => r.id === "wti")?.price ?? 0), 2
                            )} USD/bbl
                          </span>
                        </div>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border/30">
                              <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Commodity</th>
                              <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">Price</th>
                              <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">1D</th>
                              <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">1W</th>
                              <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">1M</th>
                              <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">YTD</th>
                              <th className="py-2 px-3 text-xs text-muted-foreground font-medium min-w-[140px]">52W Range</th>
                              <th className="py-2 px-3 text-xs text-muted-foreground font-medium">Seasonality</th>
                            </tr>
                          </thead>
                          <tbody>
                            {catRows.map((row) => <CommodityTableRow key={row.id} row={row} />)}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Tab 2: Analysis ── */}
        <TabsContent value="analysis" className="flex-1 overflow-y-auto px-6 pb-6 mt-3 data-[state=inactive]:hidden">
          {/* Commodity selector */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground font-medium block mb-1.5">Select Commodity</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-card border border-border/50 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {categories.map((cat) => (
                <optgroup key={cat} label={CATEGORY_META[cat].label}>
                  {byCategory[cat].map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.symbol})</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Price Chart */}
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">{selectedRow.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-bold tabular-nums">{fmt(selectedRow.price, selectedRow.price < 10 ? 3 : selectedRow.price < 100 ? 2 : 0)}</span>
                    <span className="text-xs text-muted-foreground">{selectedRow.unit}</span>
                    <PctBadge v={selectedRow.change1d} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">YTD</div>
                  <span className={cn("text-sm font-semibold", selectedRow.ytd >= 0 ? "text-green-400" : "text-red-400")}>{pct(selectedRow.ytd)}</span>
                </div>
              </div>
              <div className="h-[180px]">
                <PriceChart data={priceHistory} basePrice={selectedRow.basePrice} />
              </div>
            </div>

            {/* Key Drivers */}
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Key Drivers</h3>
              <div className="space-y-2">
                {drivers.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-md bg-muted/30">
                    <div className={cn("mt-0.5 h-2 w-2 rounded-full shrink-0", d.bullish ? "bg-green-400" : "bg-red-400")} />
                    <div>
                      <div className="text-xs font-medium">{d.driver}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{d.status}</div>
                    </div>
                    <span className={cn("ml-auto text-[10px] font-semibold shrink-0", d.bullish ? "text-green-400" : "text-red-400")}>
                      {d.bullish ? "Bullish" : "Bearish"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supply/Demand */}
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Supply / Demand Balance</h3>
              <InventoryBar current={inventoryCurrent} fiveYrAvg={inventoryAvg} />
            </div>

            {/* Term Structure */}
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <h3 className="text-sm font-semibold mb-1">Futures Term Structure</h3>
              <p className="text-xs text-muted-foreground mb-2">Spot vs 6-month forward curve</p>
              <div className="h-[130px]">
                <TermStructureChart data={termStructure} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {termStructure[termStructure.length - 1].price > termStructure[0].price
                  ? "Contango: Futures trade above spot — storage/carry cost implied."
                  : "Backwardation: Futures trade below spot — physical scarcity/convenience yield."}
              </p>
            </div>

            {/* Seasonal Patterns */}
            <div className="rounded-lg border border-border/50 bg-card p-4 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-1">Seasonal Patterns — Monthly Average Returns</h3>
              <p className="text-xs text-muted-foreground mb-2">Historical average monthly performance. Past seasonality may not repeat.</p>
              <div className="h-[120px]">
                <SeasonalBarChart returns={monthlyReturns} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Portfolio ── */}
        <TabsContent value="portfolio" className="flex-1 overflow-y-auto px-6 pb-6 mt-3 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Optimal allocation */}
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <h3 className="text-sm font-semibold mb-1">Optimal Commodity Allocation</h3>
              <p className="text-xs text-muted-foreground mb-3">Research suggests 5–15% allocation reduces portfolio volatility and improves inflation hedging.</p>
              <div className="space-y-2.5">
                {ALLOCATION.map((a) => (
                  <div key={a.label} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-muted-foreground">{a.label}</div>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${a.pct}%`, background: a.color }} />
                    </div>
                    <div className="w-8 text-right text-xs font-medium tabular-nums">{a.pct}%</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 p-2 bg-muted/30 rounded">
                <Info className="h-3 w-3 inline mr-1 text-blue-400" />
                Within the 5–15% commodity sleeve: Gold 40% provides inflation hedge, Energy 30% adds cycle exposure, Agriculture 20% diversifies, Base Metals 10% offers growth proxy.
              </p>
            </div>

            {/* Commodity vs Inflation scatter */}
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <h3 className="text-sm font-semibold mb-1">Commodities vs Inflation</h3>
              <p className="text-xs text-muted-foreground mb-2">Scatter: CPI monthly % vs commodity index returns (24 months). Positive correlation confirms inflation hedge role.</p>
              <div className="h-[200px]">
                <ScatterPlot rng={scatterRng} />
              </div>
            </div>

            {/* Commodity cycle */}
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Commodity Economic Cycle</h3>
              <div className="space-y-2">
                {CYCLE_PHASES.map((p) => (
                  <div key={p.phase} className="p-2.5 rounded-md bg-muted/30 border border-border/30">
                    <div className={cn("text-xs font-semibold mb-1", p.color)}>{p.phase}</div>
                    <div className="flex gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Lead: </span>
                        <span className="text-green-400">{p.leaders.join(", ")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lag: </span>
                        <span className="text-red-400">{p.laggards.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ETF comparison */}
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Commodity ETF Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium">Ticker</th>
                      <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium">Name</th>
                      <th className="text-right py-1.5 pr-3 text-muted-foreground font-medium">AUM</th>
                      <th className="text-right py-1.5 pr-3 text-muted-foreground font-medium">ER</th>
                      <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium">Exposure</th>
                      <th className="text-right py-1.5 text-muted-foreground font-medium">YTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ETF_TABLE.map((e) => (
                      <tr key={e.ticker} className="border-b border-border/20 hover:bg-accent/10">
                        <td className="py-2 pr-3 font-semibold text-primary">{e.ticker}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{e.name}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{e.aum}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{e.er}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{e.exposure}</td>
                        <td className="py-2 text-right">
                          <span className={cn("font-medium tabular-nums", e.ytd >= 0 ? "text-green-400" : "text-red-400")}>
                            {e.ytd >= 0 ? "+" : ""}{e.ytd}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 4: Education ── */}
        <TabsContent value="education" className="flex-1 overflow-y-auto px-6 pb-6 mt-3 data-[state=inactive]:hidden">
          <div className="space-y-4">

            {/* Contango vs Backwardation */}
            <div className="rounded-lg border border-border/50 bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Contango vs Backwardation</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="h-[120px] mb-2">
                    <TermStructureDiagramEdu type="contango" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-400 font-medium">Contango</span> occurs when futures prices are higher than spot. Common in stable markets — reflects storage costs, insurance, and financing. Roll yield is <span className="text-red-400">negative</span> for long futures holders.
                  </p>
                </div>
                <div>
                  <div className="h-[120px] mb-2">
                    <TermStructureDiagramEdu type="backwardation" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-400 font-medium">Backwardation</span> occurs when futures prices are lower than spot. Signals near-term scarcity or high convenience yield. Roll yield is <span className="text-green-400">positive</span> — futures holders benefit as contracts approach expiry.
                  </p>
                </div>
              </div>
            </div>

            {/* Roll Yield */}
            <div className="rounded-lg border border-border/50 bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Roll Yield: Cost and Benefit of Holding Futures</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Commodity ETFs holding futures must "roll" expiring contracts into the next month. This creates positive or negative yield depending on the curve shape.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                  <div className="text-xs font-semibold text-green-400 mb-1">Positive Roll Yield (Backwardation)</div>
                  <p className="text-xs text-muted-foreground">You buy the next contract cheaper than the one expiring. Over time this compounds — a meaningful source of return in energy markets during supply squeezes.</p>
                </div>
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                  <div className="text-xs font-semibold text-red-400 mb-1">Negative Roll Yield (Contango)</div>
                  <p className="text-xs text-muted-foreground">You buy the next contract more expensively. USO lost ~75% in 2020 partly from extreme crude oil contango. Long-term commodity ETFs in contango markets face persistent drag.</p>
                </div>
              </div>
            </div>

            {/* Supercycles */}
            <div className="rounded-lg border border-border/50 bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Commodity Supercycles</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Multi-decade periods of rising commodity prices driven by structural demand shifts.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-md border border-border/30 bg-muted/20">
                  <div className="text-xs font-semibold text-amber-400 mb-1">1970s Cycle</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Oil embargo (1973): WTI +400% in 12 months</li>
                    <li>• Stagflation drove gold from $35 to $850/oz (+2,300%)</li>
                    <li>• Drivers: Petrodollar, USD off gold standard, Vietnam War spending</li>
                    <li>• Duration: ~10 years (1972–1980)</li>
                  </ul>
                </div>
                <div className="p-3 rounded-md border border-border/30 bg-muted/20">
                  <div className="text-xs font-semibold text-blue-400 mb-1">2000s Cycle (China-Led)</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• China WTO entry 2001 → massive infrastructure buildout</li>
                    <li>• Copper +400%, Oil +600%, Iron Ore +900%</li>
                    <li>• Drivers: EM urbanization, underinvestment in capex 1990s</li>
                    <li>• Duration: ~15 years (2000–2014), bust in 2015–2016</li>
                  </ul>
                </div>
                <div className="p-3 rounded-md border border-green-500/20 bg-green-500/5 sm:col-span-2">
                  <div className="text-xs font-semibold text-green-400 mb-1">Current Potential Cycle (2020s–)</div>
                  <p className="text-xs text-muted-foreground">Energy transition (copper, lithium, cobalt), deglobalization supply shocks, fiscal-driven inflation. Green metals and agriculture may lead if the structural demand thesis holds for 10–20 years.</p>
                </div>
              </div>
            </div>

            {/* Physical vs Financial */}
            <div className="rounded-lg border border-border/50 bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Physical vs Financial Commodity Exposure</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-md border border-border/30">
                  <div className="text-xs font-semibold mb-2">Physical (ETFs like IAU, PSLV)</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>+ No roll cost — holds actual metal in vault</li>
                    <li>+ Pure spot price exposure</li>
                    <li>– Storage/insurance fees (0.25% for IAU)</li>
                    <li>– Tax treatment: collectible rates for gold</li>
                    <li>– Only feasible for metals (not oil or grain)</li>
                  </ul>
                </div>
                <div className="p-3 rounded-md border border-border/30">
                  <div className="text-xs font-semibold mb-2">Financial (Futures ETFs like USO, DJP)</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>+ Covers all commodity types</li>
                    <li>+ Leverage possible with futures</li>
                    <li>– Roll cost in contango markets</li>
                    <li>– Tracking error vs spot price</li>
                    <li>– Complex K-1 tax forms (partnerships)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Weather & Geopolitical Risks */}
            <div className="rounded-lg border border-border/50 bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold">Weather and Geopolitical Risks</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    title: "Hurricanes & Energy",
                    content: "Gulf of Mexico hurricanes disrupt ~17% of US oil production. Category 4+ storms shut platforms for weeks — Katrina (2005) caused oil to spike +30% in days. Natural gas LNG terminals add geopolitical exposure.",
                    color: "text-blue-400",
                  },
                  {
                    title: "Droughts & Agriculture",
                    content: "La Nina/El Nino cycles drive corn and soybean volatility. The 2012 US drought destroyed 30% of the corn crop, sending prices to $8.40/bu. USDA crop reports (8 per year) are the highest-impact scheduled events.",
                    color: "text-green-400",
                  },
                  {
                    title: "Wars & Metals/Energy",
                    content: "Russia-Ukraine (2022): wheat +60%, natural gas +300% in Europe. OPEC embargoes remain the single largest oil market risk. Sanctions on Russian palladium (40% of world supply) cascaded into automaker shutdowns.",
                    color: "text-red-400",
                  },
                ].map((item) => (
                  <div key={item.title} className="p-3 rounded-md bg-muted/20 border border-border/30">
                    <div className={cn("text-xs font-semibold mb-1.5", item.color)}>{item.title}</div>
                    <p className="text-xs text-muted-foreground">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ESG */}
            <div className="rounded-lg border border-border/50 bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-4 w-4 text-green-400" />
                <h3 className="text-sm font-semibold">ESG and Commodities</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Responsible commodity investing balances return with environmental and social impact.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <h4 className="text-xs font-semibold mb-1.5">Carbon Credits Market</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• EU ETS (Emissions Trading System): largest cap-and-trade globally</li>
                    <li>• Carbon allowances (EUAs) trade like commodity futures</li>
                    <li>• Price range 2021–2025: €24–€105/ton CO₂</li>
                    <li>• Voluntary carbon markets (VCMs): reforestation, methane credits</li>
                    <li>• XPCA (KraneShares Global Carbon ETF) is the main investable product</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold mb-1.5">ESG-Screened Commodity Investing</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Avoid producers with poor labor practices (cobalt DRC mines)</li>
                    <li>• Green metals: copper, lithium, nickel — energy transition demand</li>
                    <li>• Responsible agriculture: FSC/RSPO certified palm oil, sustainable coffee</li>
                    <li>• Avoid thermal coal exposure as energy transition accelerates</li>
                    <li>• Water futures (CME H₂O) emerging as scarce resource play</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
