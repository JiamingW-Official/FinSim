"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  Calculator,
  Warehouse,
  ArrowLeftRight,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

// ── Types ──────────────────────────────────────────────────────────────────────

type Sector = "energy" | "metals" | "grains" | "softs" | "livestock";
type SortKey = "contango" | "volume" | "name";

interface FuturesContract {
  id: string;
  name: string;
  symbol: string;
  sector: Sector;
  unit: string;
  spotPrice: number;
  tickSize: number;
  tickValue: number; // $ per tick
  contractSize: number; // units per contract
  initialMargin: number; // $
  maintenanceMargin: number; // $
  avgVolume: number; // contracts/day
}

interface GeneratedFutures extends FuturesContract {
  spot: number;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
  m5: number;
  m6: number;
  contangoPct: number; // m6 vs spot, + = contango, - = backwardation
  volumeK: number;
  sparkline: number[];
}

// ── Contract definitions ────────────────────────────────────────────────────

const CONTRACTS: FuturesContract[] = [
  // Energy
  { id: "cl", name: "WTI Crude Oil", symbol: "CL", sector: "energy", unit: "USD/bbl", spotPrice: 78.5, tickSize: 0.01, tickValue: 10, contractSize: 1000, initialMargin: 5500, maintenanceMargin: 5000, avgVolume: 320000 },
  { id: "bz", name: "Brent Crude", symbol: "BZ", sector: "energy", unit: "USD/bbl", spotPrice: 82.3, tickSize: 0.01, tickValue: 10, contractSize: 1000, initialMargin: 5800, maintenanceMargin: 5300, avgVolume: 210000 },
  { id: "ng", name: "Natural Gas", symbol: "NG", sector: "energy", unit: "USD/MMBtu", spotPrice: 2.45, tickSize: 0.001, tickValue: 10, contractSize: 10000, initialMargin: 3200, maintenanceMargin: 2900, avgVolume: 180000 },
  { id: "rb", name: "RBOB Gasoline", symbol: "RB", sector: "energy", unit: "USD/gal", spotPrice: 2.35, tickSize: 0.0001, tickValue: 4.2, contractSize: 42000, initialMargin: 4800, maintenanceMargin: 4400, avgVolume: 95000 },
  { id: "ho", name: "Heating Oil", symbol: "HO", sector: "energy", unit: "USD/gal", spotPrice: 2.65, tickSize: 0.0001, tickValue: 4.2, contractSize: 42000, initialMargin: 4900, maintenanceMargin: 4500, avgVolume: 72000 },
  // Metals
  { id: "gc", name: "Gold", symbol: "GC", sector: "metals", unit: "USD/oz", spotPrice: 2340, tickSize: 0.1, tickValue: 10, contractSize: 100, initialMargin: 11000, maintenanceMargin: 10000, avgVolume: 280000 },
  { id: "si", name: "Silver", symbol: "SI", sector: "metals", unit: "USD/oz", spotPrice: 27.5, tickSize: 0.005, tickValue: 25, contractSize: 5000, initialMargin: 7500, maintenanceMargin: 6800, avgVolume: 105000 },
  { id: "hg", name: "Copper", symbol: "HG", sector: "metals", unit: "USD/lb", spotPrice: 4.18, tickSize: 0.0005, tickValue: 12.5, contractSize: 25000, initialMargin: 6200, maintenanceMargin: 5600, avgVolume: 88000 },
  { id: "pl", name: "Platinum", symbol: "PL", sector: "metals", unit: "USD/oz", spotPrice: 1020, tickSize: 0.1, tickValue: 5, contractSize: 50, initialMargin: 3200, maintenanceMargin: 2900, avgVolume: 22000 },
  { id: "pa", name: "Palladium", symbol: "PA", sector: "metals", unit: "USD/oz", spotPrice: 1080, tickSize: 0.05, tickValue: 0.5, contractSize: 100, initialMargin: 14000, maintenanceMargin: 12700, avgVolume: 8500 },
  // Grains
  { id: "zc", name: "Corn", symbol: "ZC", sector: "grains", unit: "USD/bu", spotPrice: 4.38, tickSize: 0.0025, tickValue: 12.5, contractSize: 5000, initialMargin: 1500, maintenanceMargin: 1350, avgVolume: 390000 },
  { id: "zw", name: "Wheat (SRW)", symbol: "ZW", sector: "grains", unit: "USD/bu", spotPrice: 5.52, tickSize: 0.0025, tickValue: 12.5, contractSize: 5000, initialMargin: 1800, maintenanceMargin: 1650, avgVolume: 155000 },
  { id: "zs", name: "Soybeans", symbol: "ZS", sector: "grains", unit: "USD/bu", spotPrice: 11.25, tickSize: 0.0025, tickValue: 12.5, contractSize: 5000, initialMargin: 2200, maintenanceMargin: 2000, avgVolume: 320000 },
  { id: "zl", name: "Soybean Oil", symbol: "ZL", sector: "grains", unit: "USD/lb", spotPrice: 0.485, tickSize: 0.0001, tickValue: 6, contractSize: 60000, initialMargin: 1400, maintenanceMargin: 1250, avgVolume: 125000 },
  { id: "zm", name: "Soybean Meal", symbol: "ZM", sector: "grains", unit: "USD/ton", spotPrice: 340, tickSize: 0.1, tickValue: 10, contractSize: 100, initialMargin: 1700, maintenanceMargin: 1550, avgVolume: 115000 },
  // Softs
  { id: "kc", name: "Coffee (Arabica)", symbol: "KC", sector: "softs", unit: "USD/lb", spotPrice: 2.25, tickSize: 0.0005, tickValue: 18.75, contractSize: 37500, initialMargin: 5600, maintenanceMargin: 5100, avgVolume: 28000 },
  { id: "sb", name: "Sugar #11", symbol: "SB", sector: "softs", unit: "USD/lb", spotPrice: 0.195, tickSize: 0.0001, tickValue: 11.2, contractSize: 112000, initialMargin: 1300, maintenanceMargin: 1175, avgVolume: 95000 },
  { id: "ct", name: "Cotton #2", symbol: "CT", sector: "softs", unit: "USD/lb", spotPrice: 0.82, tickSize: 0.0001, tickValue: 5, contractSize: 50000, initialMargin: 2100, maintenanceMargin: 1900, avgVolume: 33000 },
  { id: "cc", name: "Cocoa", symbol: "CC", sector: "softs", unit: "USD/ton", spotPrice: 9800, tickSize: 1, tickValue: 10, contractSize: 10, initialMargin: 9500, maintenanceMargin: 8600, avgVolume: 16000 },
  { id: "oj", name: "Orange Juice", symbol: "OJ", sector: "softs", unit: "USD/lb", spotPrice: 3.45, tickSize: 0.0005, tickValue: 7.5, contractSize: 15000, initialMargin: 3500, maintenanceMargin: 3175, avgVolume: 9000 },
  // Livestock
  { id: "le", name: "Live Cattle", symbol: "LE", sector: "livestock", unit: "USD/lb", spotPrice: 1.92, tickSize: 0.00025, tickValue: 10, contractSize: 40000, initialMargin: 2200, maintenanceMargin: 2000, avgVolume: 55000 },
  { id: "gf", name: "Feeder Cattle", symbol: "GF", sector: "livestock", unit: "USD/lb", spotPrice: 2.61, tickSize: 0.00025, tickValue: 12.5, contractSize: 50000, initialMargin: 3000, maintenanceMargin: 2725, avgVolume: 18000 },
  { id: "he", name: "Lean Hogs", symbol: "HE", sector: "livestock", unit: "USD/lb", spotPrice: 0.88, tickSize: 0.00025, tickValue: 10, contractSize: 40000, initialMargin: 1600, maintenanceMargin: 1450, avgVolume: 42000 },
];

const SECTOR_LABELS: Record<Sector, string> = {
  energy: "Energy",
  metals: "Metals",
  grains: "Grains",
  softs: "Softs",
  livestock: "Livestock",
};

const SECTOR_COLORS: Record<Sector, string> = {
  energy: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  metals: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  grains: "text-green-400 bg-green-400/10 border-green-400/20",
  softs: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  livestock: "text-red-400 bg-red-400/10 border-red-400/20",
};

// ── Data generation ────────────────────────────────────────────────────────────

// Pre-warm to generate deterministic per-contract data
const PRE_GENERATED = (() => {
  const rng = mulberry32(6543);
  return CONTRACTS.map((c) => {
    // Curve shape: randomly contango or backwardation
    const isBwd = rng() > 0.45;
    const curveSlope = (isBwd ? -1 : 1) * (0.005 + rng() * 0.018);
    const spot = c.spotPrice * (1 + (rng() - 0.5) * 0.02);
    const months = [1, 2, 3, 4, 5, 6].map((m) => spot * Math.exp(curveSlope * m + (rng() - 0.5) * 0.003));
    const [m1, m2, m3, m4, m5, m6] = months;
    const contangoPct = ((m6 - spot) / spot) * 100;
    const volumeK = Math.round((c.avgVolume / 1000) * (0.7 + rng() * 0.6));
    // 20-bar sparkline
    let sp = spot;
    const sparkline = Array.from({ length: 20 }, () => {
      sp = sp * (1 + (rng() - 0.5) * 0.015);
      return sp;
    });
    return { spot, m1, m2, m3, m4, m5, m6, contangoPct, volumeK, sparkline };
  });
})();

function getGenerated(contractId: string): GeneratedFutures {
  const idx = CONTRACTS.findIndex((c) => c.id === contractId);
  const c = CONTRACTS[idx];
  const g = PRE_GENERATED[idx];
  return { ...c, ...g };
}

const ALL_GENERATED: GeneratedFutures[] = CONTRACTS.map((c) => getGenerated(c.id));

// Historical curve overlays (1M ago, 6M ago): slight shift on the current curve
function getHistoricalCurves(gf: GeneratedFutures) {
  const rng1m = mulberry32(6543 + gf.id.charCodeAt(0) * 7);
  const rng6m = mulberry32(6543 + gf.id.charCodeAt(0) * 13);
  const shift1m = (rng1m() - 0.5) * 0.04;
  const shift6m = (rng6m() - 0.5) * 0.09;
  const months = [gf.spot, gf.m1, gf.m2, gf.m3, gf.m4, gf.m5, gf.m6];
  return {
    oneMonthAgo: months.map((p) => p * (1 + shift1m + (rng1m() - 0.5) * 0.008)),
    sixMonthsAgo: months.map((p) => p * (1 + shift6m + (rng6m() - 0.5) * 0.015)),
  };
}

// Seasonality: 12 monthly bars, seeded per commodity
function getSeasonality(contractId: string): number[] {
  const idHash = contractId.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 0) & 0xffff;
  const rng = mulberry32(6543 + idHash);
  return Array.from({ length: 12 }, () => (rng() - 0.48) * 10);
}

// Inventory data for 5 key commodities
const INVENTORY_DATA = [
  { id: "cl", name: "WTI Crude", unit: "M bbl", current: 432.5, avg5yr: 448.2 },
  { id: "gc", name: "Gold (LBMA)", unit: "M oz", current: 912.3, avg5yr: 890.1 },
  { id: "zc", name: "Corn (USDA)", unit: "B bu", current: 1.82, avg5yr: 2.05 },
  { id: "ng", name: "Nat Gas", unit: "Tcf", current: 2.41, avg5yr: 2.28 },
  { id: "kc", name: "Coffee (ICO)", unit: "M bags", current: 22.4, avg5yr: 25.8 },
];

// ── Format helpers ─────────────────────────────────────────────────────────────

function fmtPrice(p: number, decimals?: number): string {
  if (decimals !== undefined) return p.toFixed(decimals);
  if (p >= 1000) return p.toFixed(0);
  if (p >= 10) return p.toFixed(2);
  if (p >= 1) return p.toFixed(3);
  return p.toFixed(4);
}

function fmtPct(n: number, showPlus = true): string {
  const s = n.toFixed(2) + "%";
  return showPlus && n >= 0 ? "+" + s : s;
}

function fmtDollar(n: number): string {
  if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (Math.abs(n) >= 1000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return "$" + n.toFixed(2);
}

// ── SVG Micro-sparkline ────────────────────────────────────────────────────────

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const W = 56, H = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`
  ).join(" ");
  const color = positive ? "#4ade80" : "#f87171";
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

// ── Futures Curve SVG ──────────────────────────────────────────────────────────

function FuturesCurveSVG({
  current,
  oneMonthAgo,
  sixMonthsAgo,
  isBackwardation,
}: {
  current: number[];
  oneMonthAgo: number[];
  sixMonthsAgo: number[];
  isBackwardation: boolean;
}) {
  const W = 480, H = 200;
  const PAD = { t: 16, r: 20, b: 36, l: 60 };
  const LABELS = ["Spot", "M1", "M2", "M3", "M4", "M5", "M6"];

  const allPrices = [...current, ...oneMonthAgo, ...sixMonthsAgo];
  const minP = Math.min(...allPrices) * 0.995;
  const maxP = Math.max(...allPrices) * 1.005;

  const xScale = (i: number) => PAD.l + (i / (current.length - 1)) * (W - PAD.l - PAD.r);
  const yScale = (p: number) => PAD.t + (1 - (p - minP) / (maxP - minP)) * (H - PAD.t - PAD.b);

  const polyPts = (arr: number[]) => arr.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
  const mainColor = isBackwardation ? "#4ade80" : "#f87171";

  const yTicks = 4;
  const yTickVals = Array.from({ length: yTicks }, (_, i) => minP + (maxP - minP) * (i / (yTicks - 1)));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" className="overflow-visible">
      {/* Grid */}
      {yTickVals.map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} x2={W - PAD.r} y1={yScale(v)} y2={yScale(v)} stroke="currentColor" strokeOpacity={0.07} strokeDasharray="3,3" />
          <text x={PAD.l - 6} y={yScale(v) + 4} textAnchor="end" fill="currentColor" fillOpacity={0.45} fontSize={9}>
            {v >= 1000 ? (v / 1000).toFixed(1) + "k" : v >= 10 ? v.toFixed(1) : v.toFixed(3)}
          </text>
        </g>
      ))}
      {/* Axes */}
      <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} stroke="currentColor" strokeOpacity={0.15} />
      <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="currentColor" strokeOpacity={0.15} />

      {/* 6M ago overlay */}
      <polyline points={polyPts(sixMonthsAgo)} fill="none" stroke="#60a5fa" strokeWidth={1} strokeDasharray="4,3" strokeOpacity={0.5} strokeLinejoin="round" />
      {/* 1M ago overlay */}
      <polyline points={polyPts(oneMonthAgo)} fill="none" stroke="#a78bfa" strokeWidth={1} strokeDasharray="4,3" strokeOpacity={0.6} strokeLinejoin="round" />
      {/* Current curve */}
      <polyline points={polyPts(current)} fill="none" stroke={mainColor} strokeWidth={2.5} strokeLinejoin="round" />

      {/* Dots + labels */}
      {current.map((v, i) => (
        <g key={i}>
          <circle cx={xScale(i)} cy={yScale(v)} r={3.5} fill={mainColor} />
          <text x={xScale(i)} y={H - PAD.b + 12} textAnchor="middle" fill="currentColor" fillOpacity={0.5} fontSize={9}>{LABELS[i]}</text>
        </g>
      ))}

      {/* Legend */}
      <g transform={`translate(${PAD.l + 6}, ${PAD.t + 4})`}>
        <line x1={0} x2={14} y1={0} y2={0} stroke={mainColor} strokeWidth={2.5} />
        <text x={18} y={4} fill="currentColor" fillOpacity={0.7} fontSize={9}>Current</text>
        <line x1={60} x2={74} y1={0} y2={0} stroke="#a78bfa" strokeWidth={1} strokeDasharray="4,2" strokeOpacity={0.7} />
        <text x={78} y={4} fill="currentColor" fillOpacity={0.7} fontSize={9}>1M ago</text>
        <line x1={124} x2={138} y1={0} y2={0} stroke="#60a5fa" strokeWidth={1} strokeDasharray="4,2" strokeOpacity={0.7} />
        <text x={142} y={4} fill="currentColor" fillOpacity={0.7} fontSize={9}>6M ago</text>
      </g>
    </svg>
  );
}

// ── Spread History SVG ─────────────────────────────────────────────────────────

function SpreadHistorySVG({ data, color }: { data: number[]; color: string }) {
  const W = 240, H = 80;
  const PAD = { t: 8, r: 8, b: 20, l: 40 };
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 0.001);
  const zero = 0;
  const hasZero = min < 0 && max > 0;

  const xScale = (i: number) => PAD.l + (i / (data.length - 1)) * (W - PAD.l - PAD.r);
  const yScale = (v: number) => PAD.t + (1 - (v - min) / range) * (H - PAD.t - PAD.b);
  const pts = data.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");

  const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} stroke="currentColor" strokeOpacity={0.12} />
      <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="currentColor" strokeOpacity={0.12} />
      {hasZero && (
        <line x1={PAD.l} x2={W - PAD.r} y1={yScale(zero)} y2={yScale(zero)} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="3,2" />
      )}
      {[min, max].map((v, i) => (
        <text key={i} x={PAD.l - 4} y={yScale(v) + 4} textAnchor="end" fill="currentColor" fillOpacity={0.4} fontSize={8}>
          {v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)}
        </text>
      ))}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {data.map((_, i) =>
        i % 2 === 0 ? (
          <text key={i} x={xScale(i)} y={H - PAD.b + 10} textAnchor="middle" fill="currentColor" fillOpacity={0.35} fontSize={7}>
            {MONTHS[i] ?? ""}
          </text>
        ) : null
      )}
    </svg>
  );
}

// ── Seasonality Bar Chart SVG ──────────────────────────────────────────────────

function SeasonalityBarSVG({ data }: { data: number[] }) {
  const W = 400, H = 100;
  const PAD = { t: 8, r: 8, b: 20, l: 8 };
  const maxAbs = Math.max(...data.map(Math.abs), 0.5);
  const barW = (W - PAD.l - PAD.r) / 12 - 2;
  const midY = PAD.t + (H - PAD.t - PAD.b) / 2;
  const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <line x1={PAD.l} x2={W - PAD.r} y1={midY} y2={midY} stroke="currentColor" strokeOpacity={0.2} />
      {data.map((v, i) => {
        const x = PAD.l + i * ((W - PAD.l - PAD.r) / 12) + 1;
        const barH = (Math.abs(v) / maxAbs) * ((H - PAD.t - PAD.b) / 2 - 2);
        const y = v >= 0 ? midY - barH : midY;
        const color = v >= 0 ? "#4ade80" : "#f87171";
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={Math.max(barH, 1)} fill={color} fillOpacity={0.75} rx={1} />
            <text x={x + barW / 2} y={H - PAD.b + 10} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={8}>
              {MONTHS[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Spread data generator ──────────────────────────────────────────────────────

function genSpreadHistory(seed: number, center: number, vol: number): number[] {
  const rng = mulberry32(seed);
  let v = center;
  return Array.from({ length: 12 }, () => {
    v = v + (rng() - 0.5) * vol * 2;
    return v;
  });
}

const INTER_SPREADS = [
  {
    id: "wti_brent",
    name: "WTI vs Brent (Arb)",
    leg1: "CL",
    leg2: "BZ",
    description: "WTI discount to Brent — reflects US export logistics and pipeline bottlenecks.",
    unit: "$/bbl",
    getValue: () => {
      const wti = ALL_GENERATED.find((g) => g.id === "cl")!.spot;
      const brt = ALL_GENERATED.find((g) => g.id === "bz")!.spot;
      return brt - wti;
    },
    histSeed: 1001,
    histCenter: 3.2,
    histVol: 1.5,
    weekLow: 0.8,
    weekHigh: 6.5,
    color: "#f97316",
  },
  {
    id: "gold_silver",
    name: "Gold/Silver Ratio",
    leg1: "GC",
    leg2: "SI",
    description: "How many oz of silver to buy 1 oz of gold. Historically 40–80x. Above 80 often signals silver undervaluation.",
    unit: "ratio",
    getValue: () => {
      const gc = ALL_GENERATED.find((g) => g.id === "gc")!.spot;
      const si = ALL_GENERATED.find((g) => g.id === "si")!.spot;
      return gc / si;
    },
    histSeed: 1002,
    histCenter: 85,
    histVol: 12,
    weekLow: 70,
    weekHigh: 100,
    color: "#facc15",
  },
  {
    id: "corn_wheat",
    name: "Corn vs Wheat",
    leg1: "ZC",
    leg2: "ZW",
    description: "Corn vs wheat spread (cents/bu). When wheat premium narrows, feed substitution shifts demand.",
    unit: "$/bu",
    getValue: () => {
      const zc = ALL_GENERATED.find((g) => g.id === "zc")!.spot;
      const zw = ALL_GENERATED.find((g) => g.id === "zw")!.spot;
      return zw - zc;
    },
    histSeed: 1003,
    histCenter: 1.15,
    histVol: 0.4,
    weekLow: 0.5,
    weekHigh: 2.2,
    color: "#4ade80",
  },
];

const INTRA_SPREADS = [
  {
    id: "cl_cal",
    name: "CL Calendar Spread (M1-M2)",
    symbol: "CL",
    description: "Front month vs second month WTI. Positive = backwardation, negative = contango.",
    unit: "$/bbl",
    getValue: () => {
      const g = ALL_GENERATED.find((d) => d.id === "cl")!;
      return g.m1 - g.m2;
    },
    histSeed: 2001,
    color: "#f87171",
  },
  {
    id: "gc_cal",
    name: "GC Calendar Spread (M1-M3)",
    symbol: "GC",
    description: "Near vs deferred gold. Reflects carry cost — typically positive (contango) driven by interest rates.",
    unit: "$/oz",
    getValue: () => {
      const g = ALL_GENERATED.find((d) => d.id === "gc")!;
      return g.m1 - g.m3;
    },
    histSeed: 2002,
    color: "#facc15",
  },
  {
    id: "zc_cal",
    name: "ZC Calendar Spread (M1-M3)",
    symbol: "ZC",
    description: "Corn old-crop / new-crop spread. Seasonal patterns driven by harvest and storage.",
    unit: "$/bu",
    getValue: () => {
      const g = ALL_GENERATED.find((d) => d.id === "zc")!;
      return g.m1 - g.m3;
    },
    histSeed: 2003,
    color: "#4ade80",
  },
];

// ── Z-score calculator ─────────────────────────────────────────────────────────

function calcZScore(current: number, history: number[]): number {
  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  const std = Math.sqrt(history.reduce((a, b) => a + (b - mean) ** 2, 0) / history.length);
  return std === 0 ? 0 : (current - mean) / std;
}

// ── Section 1: Futures Contract Explorer ──────────────────────────────────────

function ContractExplorer({
  onSelectContract,
}: {
  onSelectContract: (id: string) => void;
}) {
  const [sectorFilter, setSectorFilter] = useState<Sector | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("volume");

  const sectors = ["all", "energy", "metals", "grains", "softs", "livestock"] as const;

  const filtered = useMemo(() => {
    let list = [...ALL_GENERATED];
    if (sectorFilter !== "all") list = list.filter((g) => g.sector === sectorFilter);
    if (sortKey === "contango") list.sort((a, b) => b.contangoPct - a.contangoPct);
    else if (sortKey === "volume") list.sort((a, b) => b.volumeK - a.volumeK);
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [sectorFilter, sortKey]);

  return (
    <div className="space-y-3">
      {/* Filter/sort bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="flex gap-1 flex-wrap">
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setSectorFilter(s)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
                sectorFilter === s
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-accent/30"
              )}
            >
              {s === "all" ? "All" : SECTOR_LABELS[s as Sector]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Sort:</span>
          {(["volume", "contango", "name"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={cn(
                "px-2 py-0.5 rounded text-xs transition-colors border",
                sortKey === k
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-accent/30"
              )}
            >
              {k === "contango" ? "Contango %" : k === "volume" ? "Volume" : "Name"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/20">
              <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Contract</th>
              <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">Spot</th>
              <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">M1</th>
              <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">M2</th>
              <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">Contango %</th>
              <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">Vol (K)</th>
              <th className="py-2 px-3 text-xs text-muted-foreground font-medium">Trend</th>
              <th className="py-2 px-3 text-xs text-muted-foreground font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => {
              const isContango = g.contangoPct >= 0;
              const contangoColor = isContango ? "text-red-400" : "text-green-400";
              return (
                <tr
                  key={g.id}
                  className="border-b border-border/20 hover:bg-accent/20 transition-colors"
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-semibold px-1.5 py-0.5 rounded border",
                          SECTOR_COLORS[g.sector]
                        )}
                      >
                        {g.symbol}
                      </span>
                      <div>
                        <div className="font-medium text-xs">{g.name}</div>
                        <div className="text-xs text-muted-foreground">{g.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs font-medium">
                    {fmtPrice(g.spot)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs text-muted-foreground">
                    {fmtPrice(g.m1)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs text-muted-foreground">
                    {fmtPrice(g.m2)}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className={cn("text-xs font-semibold tabular-nums", contangoColor)}>
                      {fmtPct(g.contangoPct)}
                    </span>
                    <div className={cn("text-[11px] mt-0.5", contangoColor)}>
                      {isContango ? "Contango" : "Backw."}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs text-muted-foreground">
                    {g.volumeK}K
                  </td>
                  <td className="py-2 px-3">
                    <Sparkline data={g.sparkline} positive={g.sparkline[g.sparkline.length - 1] >= g.sparkline[0]} />
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => onSelectContract(g.id)}
                      className="text-xs px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors whitespace-nowrap"
                    >
                      View Curve
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Section 2: Futures Curve Visualizer ───────────────────────────────────────

function CurveVisualizer({ initialContractId }: { initialContractId: string }) {
  const [selectedId, setSelectedId] = useState(initialContractId);

  const g = useMemo(() => ALL_GENERATED.find((x) => x.id === selectedId)!, [selectedId]);
  const historicals = useMemo(() => getHistoricalCurves(g), [g]);

  const currentCurve = [g.spot, g.m1, g.m2, g.m3, g.m4, g.m5, g.m6];
  const isBackwardation = g.contangoPct < 0;

  // Roll yield: annualized approximation
  const rollYield = (((g.spot - g.m1) / g.spot) * 12 * 100).toFixed(2);
  const rollPositive = parseFloat(rollYield) >= 0;

  // Storage cost and convenience yield (theoretical)
  const storageCostPct = (0.8 + (mulberry32(6543 + g.id.charCodeAt(0) * 3)() * 2.5)).toFixed(2);
  const convenienceYieldPct = isBackwardation
    ? (1.5 + (mulberry32(6543 + g.id.charCodeAt(0) * 5)() * 4)).toFixed(2)
    : (0.1 + (mulberry32(6543 + g.id.charCodeAt(0) * 5)() * 0.8)).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Contract selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground font-medium whitespace-nowrap">Select Contract</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-card border border-border/50 rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {(["energy", "metals", "grains", "softs", "livestock"] as Sector[]).map((sec) => (
            <optgroup key={sec} label={SECTOR_LABELS[sec]}>
              {ALL_GENERATED.filter((x) => x.sector === sec).map((x) => (
                <option key={x.id} value={x.id}>{x.name} ({x.symbol})</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Curve chart */}
        <div className="lg:col-span-2 rounded-lg border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold">{g.name} ({g.symbol}) — Full Futures Curve</h3>
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full border",
                isBackwardation
                  ? "text-green-400 bg-green-400/10 border-green-400/20"
                  : "text-red-400 bg-red-400/10 border-red-400/20"
              )}
            >
              {isBackwardation ? "Backwardation" : "Contango"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {isBackwardation
              ? "Spot > Futures — Physical scarcity or high convenience yield. Positive roll yield."
              : "Futures > Spot — Storage + financing cost premium. Negative roll yield."}
          </p>
          <div className="h-[200px]">
            <FuturesCurveSVG
              current={currentCurve}
              oneMonthAgo={historicals.oneMonthAgo}
              sixMonthsAgo={historicals.sixMonthsAgo}
              isBackwardation={isBackwardation}
            />
          </div>
        </div>

        {/* Analytics */}
        <div className="space-y-3">
          {/* Roll yield */}
          <div className="rounded-lg border border-border/50 bg-card p-3">
            <div className="text-xs text-muted-foreground mb-1">Annualized Roll Yield</div>
            <div className={cn("text-xl font-bold tabular-nums", rollPositive ? "text-green-400" : "text-red-400")}>
              {rollPositive ? "+" : ""}{rollYield}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {rollPositive ? "Positive: benefit from rolling front contract" : "Negative: cost drag from rolling in contango"}
            </p>
          </div>

          {/* Cost of carry breakdown */}
          <div className="rounded-lg border border-border/50 bg-card p-3 space-y-2">
            <div className="text-xs font-semibold">Carry Decomposition</div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Storage Cost</span>
              <span className="text-amber-400 font-medium">+{storageCostPct}% ann.</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Convenience Yield</span>
              <span className={cn("font-medium", isBackwardation ? "text-green-400" : "text-primary")}>
                -{convenienceYieldPct}% ann.
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Risk-Free Rate</span>
              <span className="text-primary font-medium">+5.25% ann.</span>
            </div>
            <div className="border-t border-border/30 pt-1.5 flex justify-between text-xs font-semibold">
              <span>Net Carry</span>
              <span className={cn(isBackwardation ? "text-green-400" : "text-red-400")}>
                {isBackwardation ? "-" : "+"}{Math.abs(parseFloat(storageCostPct) - parseFloat(convenienceYieldPct) + 5.25).toFixed(2)}% ann.
              </span>
            </div>
          </div>

          {/* Curve points */}
          <div className="rounded-lg border border-border/50 bg-card p-3">
            <div className="text-xs font-semibold mb-2">Curve Prices</div>
            <div className="space-y-1">
              {["Spot", "M1", "M2", "M3", "M4", "M5", "M6"].map((label, i) => {
                const price = currentCurve[i];
                const diff = i === 0 ? 0 : ((price - currentCurve[0]) / currentCurve[0]) * 100;
                return (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="tabular-nums font-medium">{fmtPrice(price)}</span>
                    {i > 0 && (
                      <span className={cn("tabular-nums text-xs", diff >= 0 ? "text-red-400" : "text-green-400")}>
                        {fmtPct(diff)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section 3: Spread Trading ──────────────────────────────────────────────────

function SpreadTrading() {
  const [crackCrude, setCrackCrude] = useState(78.5);
  const [crackGasoline, setCrackGasoline] = useState(2.35);
  const [crackHeating, setCrackHeating] = useState(2.65);

  const [crushSoy, setCrushSoy] = useState(11.25);
  const [crushOil, setCrushOil] = useState(0.485);
  const [crushMeal, setCrushMeal] = useState(340.0);

  // 3-2-1 crack spread: (2 * gasoline_usd_bbl + 1 * heating_usd_bbl - 3 * crude) / 3
  // Gasoline: gal -> bbl by * 42, Heating: gal -> bbl by * 42
  const gasolineBbl = crackGasoline * 42;
  const heatingBbl = crackHeating * 42;
  const crackSpread = (2 * gasolineBbl + 1 * heatingBbl - 3 * crackCrude) / 3;

  // Crush spread: (11 lb oil/bu * 60000lb/contract + meal ton value) / cost soybeans
  // Simplified: GPM = 0.11 * soyoil * 100 + 0.022 * soymeal - soybeans (per bushel)
  const crushSpread = 0.11 * crushOil * 100 + 0.022 * crushMeal - crushSoy;

  // Generate spread histories
  const interHistories = useMemo(
    () => INTER_SPREADS.map((s) => genSpreadHistory(s.histSeed, s.histCenter, s.histVol)),
    []
  );
  const intraHistories = useMemo(
    () => INTRA_SPREADS.map((s) => {
      const g = ALL_GENERATED.find((x) => x.id === s.id.split("_")[0])!;
      const center = g.m1 - g.m2;
      return genSpreadHistory(s.histSeed, center, Math.abs(center) * 0.3);
    }),
    []
  );

  return (
    <div className="space-y-5">
      {/* Inter-commodity spreads */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Inter-Commodity Spreads</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INTER_SPREADS.map((s, idx) => {
            const currentVal = s.getValue();
            const history = interHistories[idx];
            const zScore = calcZScore(currentVal, history);
            const weekRange = s.weekLow !== undefined ? { low: s.weekLow, high: s.weekHigh } : null;
            const zColor = Math.abs(zScore) > 1.5 ? (zScore > 0 ? "text-green-400" : "text-red-400") : "text-muted-foreground";
            return (
              <div key={s.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.leg1} / {s.leg2}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold tabular-nums" style={{ color: s.color }}>
                      {currentVal >= 100 ? currentVal.toFixed(1) : currentVal.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.unit}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{s.description}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Z-score:</span>
                  <span className={cn("font-semibold tabular-nums", zColor)}>{zScore.toFixed(2)}σ</span>
                </div>
                {weekRange && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">52W Range:</span>
                    <span className="text-muted-foreground tabular-nums">{weekRange.low.toFixed(1)} – {weekRange.high.toFixed(1)}</span>
                  </div>
                )}
                <div className="h-[80px]">
                  <SpreadHistorySVG data={history} color={s.color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Intra-commodity calendar spreads */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Calendar Spreads (Intra-Commodity)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INTRA_SPREADS.map((s, idx) => {
            const currentVal = s.getValue();
            const history = intraHistories[idx];
            const zScore = calcZScore(currentVal, history);
            const isPositive = currentVal >= 0;
            const zColor = Math.abs(zScore) > 1.5 ? (zScore > 0 ? "text-green-400" : "text-red-400") : "text-muted-foreground";
            return (
              <div key={s.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold">{s.name}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-sm font-bold tabular-nums", isPositive ? "text-green-400" : "text-red-400")}>
                      {isPositive ? "+" : ""}{currentVal.toFixed(3)}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.unit}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{s.description}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Z-score:</span>
                  <span className={cn("font-semibold tabular-nums", zColor)}>{zScore.toFixed(2)}σ</span>
                </div>
                <div className="h-[80px]">
                  <SpreadHistorySVG data={history} color={s.color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Crack spread calculator */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">3-2-1 Crack Spread Calculator</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Refining margin: 3 barrels crude oil → 2 barrels gasoline + 1 barrel heating oil. Formula: (2×Gasoline + 1×Heating Oil − 3×Crude) / 3
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {[
            { label: "WTI Crude (USD/bbl)", val: crackCrude, set: setCrackCrude, step: 0.5, color: "text-orange-400" },
            { label: "RBOB Gasoline (USD/gal)", val: crackGasoline, set: setCrackGasoline, step: 0.01, color: "text-primary" },
            { label: "Heating Oil (USD/gal)", val: crackHeating, set: setCrackHeating, step: 0.01, color: "text-amber-400" },
          ].map(({ label, val, set, step, color }) => (
            <div key={label}>
              <label className="text-xs text-muted-foreground block mb-1">{label}</label>
              <input
                type="number"
                value={val}
                step={step}
                onChange={(e) => set(parseFloat(e.target.value) || 0)}
                className="w-full bg-muted/30 border border-border/50 rounded-md px-2.5 py-1.5 text-sm font-medium tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className={cn("text-xs mt-0.5 tabular-nums", color)}>
                {label.includes("gal") ? `= $${(val * 42).toFixed(2)}/bbl` : ""}
              </div>
            </div>
          ))}
        </div>
        <div className={cn(
          "rounded-lg p-4 border text-center",
          crackSpread >= 10 ? "bg-green-500/10 border-green-500/20" :
          crackSpread >= 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20"
        )}>
          <div className="text-xs text-muted-foreground mb-1">3-2-1 Crack Spread</div>
          <div className={cn(
            "text-3xl font-bold tabular-nums",
            crackSpread >= 10 ? "text-green-400" : crackSpread >= 0 ? "text-amber-400" : "text-red-400"
          )}>
            ${crackSpread.toFixed(2)}/bbl
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {crackSpread >= 20 ? "Strong refining margin — refiners incentivized to maximize throughput" :
             crackSpread >= 10 ? "Moderate margin — normal refining economics" :
             crackSpread >= 0 ? "Thin margin — refinery economics squeezed" :
             "Negative margin — refiners may cut runs"}
          </div>
        </div>
      </div>

      {/* Crush spread calculator */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-4 w-4 text-green-400" />
          <h3 className="text-sm font-semibold">Soybean Crush Spread</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Processing margin: 1 bushel soybeans → 11 lbs oil + 44 lbs meal. Approximate: 0.11 × Oil(¢/lb) × 100 + 0.022 × Meal($/ton) − Beans($/bu)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {[
            { label: "Soybeans (USD/bu)", val: crushSoy, set: setCrushSoy, step: 0.05, color: "text-green-400" },
            { label: "Soybean Oil (USD/lb)", val: crushOil, set: setCrushOil, step: 0.001, color: "text-yellow-400" },
            { label: "Soybean Meal (USD/ton)", val: crushMeal, set: setCrushMeal, step: 1, color: "text-amber-400" },
          ].map(({ label, val, set, step, color }) => (
            <div key={label}>
              <label className="text-xs text-muted-foreground block mb-1">{label}</label>
              <input
                type="number"
                value={val}
                step={step}
                onChange={(e) => set(parseFloat(e.target.value) || 0)}
                className="w-full bg-muted/30 border border-border/50 rounded-md px-2.5 py-1.5 text-sm font-medium tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className={cn("text-xs mt-0.5 font-medium tabular-nums", color)}>
                {label.includes("Oil") ? `$${(val * 100).toFixed(2)}¢/lb equiv.` : ""}
              </div>
            </div>
          ))}
        </div>
        <div className={cn(
          "rounded-lg p-4 border text-center",
          crushSpread >= 1.5 ? "bg-green-500/10 border-green-500/20" :
          crushSpread >= 0.5 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20"
        )}>
          <div className="text-xs text-muted-foreground mb-1">Gross Processing Margin</div>
          <div className={cn(
            "text-3xl font-bold tabular-nums",
            crushSpread >= 1.5 ? "text-green-400" : crushSpread >= 0.5 ? "text-amber-400" : "text-red-400"
          )}>
            ${crushSpread.toFixed(2)}/bu
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {crushSpread >= 2 ? "Wide margins — crushing plants incentivized to run near capacity" :
             crushSpread >= 1 ? "Normal crush margins — steady processing activity" :
             crushSpread >= 0 ? "Thin margins — some plants may slow output" :
             "Negative crush — economic pressure to reduce processing"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section 4: Order Entry Simulator ──────────────────────────────────────────

function OrderEntrySimulator() {
  const [selectedId, setSelectedId] = useState("cl");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [tradeType, setTradeType] = useState<"outright" | "spread">("outright");
  const [contracts, setContracts] = useState(1);
  const [entryPrice, setEntryPrice] = useState<number | "">("");

  const g = useMemo(() => ALL_GENERATED.find((x) => x.id === selectedId)!, [selectedId]);

  const displayEntry = entryPrice !== "" ? (entryPrice as number) : g.m1;

  // Notional
  const notional = displayEntry * g.contractSize * contracts;
  // Margin
  const totalInitial = g.initialMargin * contracts;
  const totalMaintenance = g.maintenanceMargin * contracts;
  // Leverage
  const leverage = notional / totalInitial;
  // Dollar per 1% move
  const dollarPer1Pct = notional * 0.01;
  // P&L per tick
  const pnlPerTick = g.tickValue * contracts;
  // Max loss before margin call
  const maxLossBeforeCall = totalInitial - totalMaintenance;
  // Price move for margin call
  const ticks = maxLossBeforeCall / g.tickValue;
  const priceToMarginCall = ticks * g.tickSize;

  function handlePlaceOrder() {
    const side = direction === "long" ? "BUY" : "SELL";
    const desc = tradeType === "spread" ? "Calendar Spread" : "Outright";
    toast.custom(() => (
      <div className="bg-card border border-border/60 rounded-lg p-4 shadow-lg min-w-[280px]">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn("w-2 h-2 rounded-full", direction === "long" ? "bg-green-400" : "bg-red-400")} />
          <span className="font-semibold text-sm">
            {side} {contracts} {g.symbol} {desc}
          </span>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Entry</span>
            <span className="text-foreground font-medium tabular-nums">{fmtPrice(displayEntry)}</span>
          </div>
          <div className="flex justify-between">
            <span>Notional</span>
            <span className="text-foreground font-medium tabular-nums">{fmtDollar(notional)}</span>
          </div>
          <div className="flex justify-between">
            <span>Initial Margin</span>
            <span className="text-amber-400 font-medium tabular-nums">{fmtDollar(totalInitial)}</span>
          </div>
          <div className="flex justify-between">
            <span>Leverage</span>
            <span className="text-primary font-medium tabular-nums">{leverage.toFixed(1)}x</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
          Order simulated — no real positions opened
        </div>
      </div>
    ), { duration: 5000, position: "top-right" });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: order form */}
      <div className="rounded-lg border border-border/50 bg-card p-4 space-y-4">
        <h3 className="text-sm font-semibold">Order Configuration</h3>

        {/* Contract select */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Select Contract</label>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setEntryPrice("");
            }}
            className="w-full bg-muted/30 border border-border/50 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {(["energy", "metals", "grains", "softs", "livestock"] as Sector[]).map((sec) => (
              <optgroup key={sec} label={SECTOR_LABELS[sec]}>
                {ALL_GENERATED.filter((x) => x.sector === sec).map((x) => (
                  <option key={x.id} value={x.id}>{x.name} ({x.symbol})</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Trade type */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Trade Type</label>
          <div className="grid grid-cols-2 gap-1">
            {(["outright", "spread"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTradeType(t)}
                className={cn(
                  "py-1.5 rounded-md text-xs font-medium border transition-colors",
                  tradeType === t
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-accent/30"
                )}
              >
                {t === "outright" ? "Outright" : "Calendar Spread"}
              </button>
            ))}
          </div>
        </div>

        {/* Direction */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Direction</label>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setDirection("long")}
              className={cn(
                "py-1.5 rounded-md text-xs font-semibold border transition-colors",
                direction === "long"
                  ? "bg-green-500/20 border-green-500/40 text-green-400"
                  : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-accent/30"
              )}
            >
              Long (Buy)
            </button>
            <button
              onClick={() => setDirection("short")}
              className={cn(
                "py-1.5 rounded-md text-xs font-semibold border transition-colors",
                direction === "short"
                  ? "bg-red-500/20 border-red-500/40 text-red-400"
                  : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-accent/30"
              )}
            >
              Short (Sell)
            </button>
          </div>
        </div>

        {/* Contracts */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Number of Contracts (1–10)</label>
          <input
            type="range"
            min={1}
            max={10}
            value={contracts}
            onChange={(e) => setContracts(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
            <span>1</span>
            <span className="text-foreground font-semibold">{contracts} contract{contracts > 1 ? "s" : ""}</span>
            <span>10</span>
          </div>
        </div>

        {/* Entry price */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Entry Price (optional, default = M1)</label>
          <input
            type="number"
            value={entryPrice}
            step={g.tickSize}
            placeholder={fmtPrice(g.m1)}
            onChange={(e) => setEntryPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
            className="w-full bg-muted/30 border border-border/50 rounded-md px-3 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Place order button */}
        <button
          onClick={handlePlaceOrder}
          className={cn(
            "w-full py-2.5 rounded-lg text-sm font-semibold border transition-colors",
            direction === "long"
              ? "bg-green-500/20 hover:bg-green-500/30 border-green-500/40 text-green-300"
              : "bg-red-500/20 hover:bg-red-500/30 border-red-500/40 text-red-300"
          )}
        >
          {direction === "long" ? "Place Long Order" : "Place Short Order"}
        </button>
      </div>

      {/* Right: analytics */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Risk & Margin Analysis</h3>
        <div className="space-y-3">
          {/* Contract specs */}
          <div className="p-2.5 rounded-md bg-muted/20 border border-border/30 space-y-1.5">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Contract Specs</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="text-muted-foreground">Symbol</div>
              <div className="font-medium">{g.symbol}</div>
              <div className="text-muted-foreground">Contract Size</div>
              <div className="font-medium tabular-nums">{g.contractSize.toLocaleString()} {g.unit.split("/")[1] ?? ""}</div>
              <div className="text-muted-foreground">Tick Size</div>
              <div className="font-medium tabular-nums">{g.tickSize}</div>
              <div className="text-muted-foreground">Tick Value</div>
              <div className="font-medium tabular-nums">${g.tickValue}</div>
              <div className="text-muted-foreground">M1 Price</div>
              <div className="font-medium tabular-nums">{fmtPrice(g.m1)}</div>
            </div>
          </div>

          {/* Key metrics */}
          {[
            { label: "Notional Value", value: fmtDollar(notional), color: "text-foreground" },
            { label: "Leverage Ratio", value: `${leverage.toFixed(1)}x`, color: "text-primary" },
            { label: "Initial Margin", value: fmtDollar(totalInitial), color: "text-amber-400" },
            { label: "Maintenance Margin", value: fmtDollar(totalMaintenance), color: "text-amber-300" },
            { label: "P&L per Tick", value: `$${pnlPerTick.toFixed(2)}`, color: "text-primary" },
            { label: "$ Value per 1% Move", value: fmtDollar(dollarPer1Pct), color: direction === "long" ? "text-green-400" : "text-red-400" },
            { label: "Margin Buffer", value: fmtDollar(maxLossBeforeCall), color: "text-red-400" },
            { label: "Price to Margin Call", value: `${fmtPrice(priceToMarginCall)} (${((priceToMarginCall / displayEntry) * 100).toFixed(2)}%)`, color: "text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center text-xs border-b border-border/20 pb-1.5 last:border-0 last:pb-0">
              <span className="text-muted-foreground">{label}</span>
              <span className={cn("font-semibold tabular-nums", color)}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section 5: Storage & Carry Analysis ───────────────────────────────────────

function StorageCarryAnalysis() {
  const [spot, setSpot] = useState(78.5);
  const [storagePct, setStoragePct] = useState(2.5);
  const [convYield, setConvYield] = useState(1.2);
  const [riskFree, setRiskFree] = useState(5.25);
  const [timeMonths, setTimeMonths] = useState(6);
  const [selectedSeasonId, setSelectedSeasonId] = useState("cl");

  const T = timeMonths / 12;
  const r = riskFree / 100;
  const c = storagePct / 100;
  const y = convYield / 100;

  // Fair value: Spot × e^((r + c - y) × T)
  const fairValue = spot * Math.exp((r + c - y) * T);

  // Actual market M-forward price (using CL as example)
  const selectedG = useMemo(() => ALL_GENERATED.find((g) => g.id === "cl")!, []);
  const actualForward = (() => {
    const t = Math.round(timeMonths);
    if (t <= 1) return selectedG.m1;
    if (t <= 2) return selectedG.m2;
    if (t <= 3) return selectedG.m3;
    if (t <= 4) return selectedG.m4;
    if (t <= 5) return selectedG.m5;
    return selectedG.m6;
  })();

  const basis = actualForward - fairValue;
  const basisPct = (basis / fairValue) * 100;

  const seasonalData = useMemo(() => getSeasonality(selectedSeasonId), [selectedSeasonId]);

  return (
    <div className="space-y-5">
      {/* Cost of carry calculator */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Cost of Carry Calculator</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Theoretical futures price = Spot × e^{"{"}(r + c − y) × T{"}"} where r = risk-free rate, c = storage cost, y = convenience yield, T = time in years
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {[
            { label: "Spot Price ($)", val: spot, set: setSpot, step: 0.5, min: 0.01 },
            { label: "Storage Cost (%/yr)", val: storagePct, set: setStoragePct, step: 0.1, min: 0 },
            { label: "Conv. Yield (%/yr)", val: convYield, set: setConvYield, step: 0.1, min: 0 },
            { label: "Risk-Free Rate (%/yr)", val: riskFree, set: setRiskFree, step: 0.25, min: 0 },
            { label: "Time (months)", val: timeMonths, set: setTimeMonths, step: 1, min: 1, max: 12 },
          ].map(({ label, val, set, step, min, max }) => (
            <div key={label}>
              <label className="text-xs text-muted-foreground block mb-1">{label}</label>
              <input
                type="number"
                value={val}
                step={step}
                min={min}
                max={max}
                onChange={(e) => set(parseFloat(e.target.value) || 0)}
                className="w-full bg-muted/30 border border-border/50 rounded-md px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted/20 border border-border/30 p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Spot Price</div>
            <div className="text-xl font-bold tabular-nums text-foreground">${spot.toFixed(2)}</div>
          </div>
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Fair Value ({timeMonths}M Futures)</div>
            <div className="text-xl font-bold tabular-nums text-primary">${fairValue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {fairValue > spot ? "Contango" : "Backwardation"}: {fmtPct(((fairValue - spot) / spot) * 100)}
            </div>
          </div>
          <div className={cn(
            "rounded-lg border p-3 text-center",
            Math.abs(basisPct) < 0.5 ? "bg-muted/20 border-border/30" :
            basis > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-primary/10 border-border"
          )}>
            <div className="text-xs text-muted-foreground mb-1">Market vs Fair Value (Basis)</div>
            <div className={cn(
              "text-xl font-bold tabular-nums",
              Math.abs(basisPct) < 0.5 ? "text-muted-foreground" :
              basis > 0 ? "text-amber-400" : "text-primary"
            )}>
              {basis >= 0 ? "+" : ""}{basis.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {Math.abs(basisPct) < 0.5 ? "Fairly priced" :
               basis > 0 ? "Market premium to fair value" : "Market discount to fair value"}
            </div>
          </div>
        </div>
      </div>

      {/* Seasonality chart */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Seasonality — Typical Monthly Returns</h3>
          </div>
          <select
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(e.target.value)}
            className="bg-card border border-border/50 rounded-md px-2 py-1 text-xs focus:outline-none"
          >
            {(["energy", "metals", "grains", "softs", "livestock"] as Sector[]).map((sec) => (
              <optgroup key={sec} label={SECTOR_LABELS[sec]}>
                {ALL_GENERATED.filter((x) => x.sector === sec).map((x) => (
                  <option key={x.id} value={x.id}>{x.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Historical average monthly price change. Based on simulated multi-year data. Past seasonality may not repeat.
        </p>
        <div className="h-[100px]">
          <SeasonalityBarSVG data={seasonalData} />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-400/70 shrink-0" />
            <span className="text-muted-foreground">Historically positive months</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-400/70 shrink-0" />
            <span className="text-muted-foreground">Historically negative months</span>
          </div>
        </div>
      </div>

      {/* Inventory levels */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Warehouse className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Inventory Levels vs 5-Year Average</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Inventory drawdowns below 5Y avg are typically bullish (supply tightening). Surpluses above 5Y avg are bearish signals.
        </p>
        <div className="space-y-4">
          {INVENTORY_DATA.map((inv) => {
            const maxVal = Math.max(inv.current, inv.avg5yr) * 1.15;
            const currPct = (inv.current / maxVal) * 100;
            const avgPct = (inv.avg5yr / maxVal) * 100;
            const above = inv.current > inv.avg5yr;
            const diffPct = ((inv.current - inv.avg5yr) / inv.avg5yr) * 100;
            return (
              <div key={inv.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{inv.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-semibold px-1.5 py-0.5 rounded-full border",
                      above
                        ? "text-red-400 bg-red-400/10 border-red-400/20"
                        : "text-green-400 bg-green-400/10 border-green-400/20"
                    )}>
                      {above ? "Surplus" : "Deficit"} {fmtPct(diffPct)}
                    </span>
                    {above
                      ? <TrendingDown className="h-3 w-3 text-red-400" />
                      : <TrendingUp className="h-3 w-3 text-green-400" />}
                  </div>
                </div>
                {/* Current bar */}
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground w-20">Current</div>
                  <div className="flex-1 relative h-4 bg-muted rounded overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded transition-all"
                      style={{ width: `${currPct}%`, background: above ? "#f87171" : "#4ade80" }}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-xs font-medium text-white">
                      {inv.current.toFixed(1)}{inv.unit}
                    </span>
                  </div>
                </div>
                {/* 5Y avg bar */}
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground w-20">5-Yr Avg</div>
                  <div className="flex-1 relative h-4 bg-muted rounded overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/50 rounded"
                      style={{ width: `${avgPct}%` }}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-xs font-medium text-white">
                      {inv.avg5yr.toFixed(1)}{inv.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-4 p-2 bg-muted/20 rounded-md">
          Data source: EIA, LBMA, USDA, ICE, IEA (simulated). Inventory signal is one factor — combine with futures curve and seasonality for conviction.
        </p>
      </div>
    </div>
  );
}

// ── Main CommoditiesFuturesTrading Component ───────────────────────────────────

export default function CommoditiesFuturesTrading() {
  const [section, setSection] = useState<"explorer" | "curve" | "spreads" | "order" | "storage">("explorer");
  const [curveContractId, setCurveContractId] = useState("cl");

  const SECTIONS = [
    { id: "explorer" as const, label: "Contract Explorer", icon: Layers },
    { id: "curve" as const, label: "Futures Curve", icon: TrendingUp },
    { id: "spreads" as const, label: "Spread Trading", icon: ArrowLeftRight },
    { id: "order" as const, label: "Order Entry", icon: BarChart3 },
    { id: "storage" as const, label: "Storage & Carry", icon: Warehouse },
  ];

  function handleViewCurve(id: string) {
    setCurveContractId(id);
    setSection("curve");
  }

  return (
    <div className="space-y-4">
      {/* Section nav pills */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
              section === id
                ? "bg-primary/20 border-primary/40 text-primary"
                : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-accent/30 hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Section content */}
      {section === "explorer" && (
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold">Futures Contract Explorer</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              23 commodity futures across Energy, Metals, Grains, Softs, and Livestock. Spot vs M1/M2 prices, contango/backwardation %, volume, and sparklines.
            </p>
          </div>
          <ContractExplorer onSelectContract={handleViewCurve} />
        </div>
      )}

      {section === "curve" && (
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold">Futures Curve Visualizer</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Full 6-month forward curve for any commodity. Compare current vs 1M ago and 6M ago overlays. Includes roll yield and carry decomposition.
            </p>
          </div>
          <CurveVisualizer initialContractId={curveContractId} />
        </div>
      )}

      {section === "spreads" && (
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold">Spread Trading</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inter-commodity spreads (WTI/Brent arb, Gold/Silver ratio, Corn/Wheat), calendar spreads, crack spread, and crush spread calculators.
            </p>
          </div>
          <SpreadTrading />
        </div>
      )}

      {section === "order" && (
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold">Order Entry Simulator</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select any contract, configure direction, size, and entry price. Calculates notional, leverage, margin requirements, P&L per tick, and margin call level.
            </p>
          </div>
          <OrderEntrySimulator />
        </div>
      )}

      {section === "storage" && (
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold">Storage & Carry Analysis</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interactive cost of carry model (Spot × e^{"{"}(r+c−y)T{"}"}), actual vs theoretical pricing, seasonality chart, and inventory level signals.
            </p>
          </div>
          <StorageCarryAnalysis />
        </div>
      )}
    </div>
  );
}
