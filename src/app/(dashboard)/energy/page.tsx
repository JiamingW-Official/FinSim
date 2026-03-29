"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Zap,
  Wind,
  Sun,
  Droplets,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  Leaf,
  Battery,
  Globe,
  Car,
  Factory,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 157;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate stable values
const _rands = Array.from({ length: 3000 }, () => rand());
let _ri = 0;
const rv = () => _rands[_ri++ % _rands.length];

// ── Formatting helpers ────────────────────────────────────────────────────────
function fmtUSD(n: number, d = 2): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtPct(n: number, d = 1): string {
  return (n >= 0 ? "+" : "") + n.toFixed(d) + "%";
}
function posNeg(v: number): string {
  return v >= 0 ? "text-emerald-400" : "text-rose-400";
}

// ── Shared UI Primitives ──────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
      {children}
    </h3>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-md border border-border bg-foreground/5 p-4", className)}>
      {children}
    </div>
  );
}

function InfoBox({
  children,
  variant = "blue",
}: {
  children: React.ReactNode;
  variant?: "blue" | "amber" | "emerald" | "rose";
}) {
  const colors: Record<string, string> = {
    blue: "bg-primary/10 border-border text-primary",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
    rose: "bg-rose-500/10 border-rose-500/30 text-rose-200",
  };
  return (
    <div className={cn("rounded-lg border p-3 text-xs leading-relaxed", colors[variant])}>
      {children}
    </div>
  );
}

// ── DATA ──────────────────────────────────────────────────────────────────────

const ENERGY_PRICES = [
  { name: "WTI Crude", unit: "$/bbl", price: 78.42, change1m: 4.1, change1y: -8.3, color: "#f59e0b" },
  { name: "Brent Crude", unit: "$/bbl", price: 82.17, change1m: 3.8, change1y: -6.9, color: "#f97316" },
  { name: "Henry Hub Gas", unit: "$/MMBtu", price: 2.84, change1m: -12.4, change1y: -31.7, color: "#3b82f6" },
  { name: "EU Natural Gas", unit: "€/MWh", price: 31.5, change1m: -7.2, change1y: -55.3, color: "#8b5cf6" },
];

const ENERGY_MIX = [
  { source: "Oil", pct: 31.2, color: "#f59e0b" },
  { source: "Natural Gas", pct: 23.5, color: "#3b82f6" },
  { source: "Coal", pct: 26.8, color: "#6b7280" },
  { source: "Nuclear", pct: 5.0, color: "#a78bfa" },
  { source: "Hydro", pct: 6.4, color: "#06b6d4" },
  { source: "Solar", pct: 3.3, color: "#fbbf24" },
  { source: "Wind", pct: 2.8, color: "#34d399" },
  { source: "Other", pct: 1.0, color: "#94a3b8" },
];

const OPEC_DECISIONS = [
  { date: "Nov 2023", decision: "Voluntary 1.0 mb/d cut extended", priceImpact: +6.2 },
  { date: "Mar 2024", decision: "Cut maintenance through Q2 2024", priceImpact: +3.1 },
  { date: "Jun 2024", decision: "Gradual unwind of 2.2 mb/d vol. cuts", priceImpact: -4.8 },
  { date: "Oct 2024", decision: "Delayed production increase by 1 month", priceImpact: +2.3 },
  { date: "Dec 2024", decision: "Extended cuts through end of 2025", priceImpact: +5.7 },
];

const OIL_MAJORS = [
  { ticker: "XOM", name: "ExxonMobil", pe: 13.2, yield_: 3.4, breakeven: 41, upstreamMix: 65 },
  { ticker: "CVX", name: "Chevron", pe: 14.8, yield_: 4.1, breakeven: 44, upstreamMix: 58 },
  { ticker: "BP", name: "BP plc", pe: 8.3, yield_: 4.8, breakeven: 38, upstreamMix: 72 },
  { ticker: "SHEL", name: "Shell", pe: 9.7, yield_: 3.9, breakeven: 35, upstreamMix: 61 },
  { ticker: "TTE", name: "TotalEnergies", pe: 7.8, yield_: 4.5, breakeven: 33, upstreamMix: 60 },
];

const BASINS = [
  { name: "Permian Basin", country: "USA", breakeven: 32, production: 5.8, reserveLife: 14, co2perBbl: 7.2 },
  { name: "Eagle Ford", country: "USA", breakeven: 38, production: 1.1, reserveLife: 8, co2perBbl: 8.9 },
  { name: "Bakken Shale", country: "USA", breakeven: 45, production: 1.3, reserveLife: 9, co2perBbl: 9.4 },
  { name: "Gulf of Mexico", country: "USA", breakeven: 36, production: 1.9, reserveLife: 18, co2perBbl: 12.1 },
  { name: "North Sea", country: "UK/NOR", breakeven: 52, production: 1.6, reserveLife: 12, co2perBbl: 15.3 },
  { name: "Canadian Oil Sands", country: "Canada", breakeven: 60, production: 3.4, reserveLife: 35, co2perBbl: 36.2 },
  { name: "Saudi Arabia", country: "KSA", breakeven: 9, production: 12.1, reserveLife: 72, co2perBbl: 4.8 },
  { name: "Offshore Brazil", country: "Brazil", breakeven: 43, production: 3.2, reserveLife: 20, co2perBbl: 11.4 },
];

const OIL_PRICES_FCF = [60, 70, 80, 90, 100] as const;
type OilPrice = (typeof OIL_PRICES_FCF)[number];
const EP_COMPANIES: {
  ticker: string;
  name: string;
  fcfYield: Record<OilPrice, number>;
  hedgedPct: number;
  productionGrowth: number;
}[] = [
  {
    ticker: "PXD",
    name: "Pioneer Natural Res.",
    fcfYield: { 60: 4.1, 70: 7.8, 80: 12.3, 90: 16.4, 100: 20.1 },
    hedgedPct: 40,
    productionGrowth: 5.2,
  },
  {
    ticker: "DVN",
    name: "Devon Energy",
    fcfYield: { 60: 3.2, 70: 6.9, 80: 11.4, 90: 15.8, 100: 19.7 },
    hedgedPct: 55,
    productionGrowth: 7.1,
  },
  {
    ticker: "FANG",
    name: "Diamondback Energy",
    fcfYield: { 60: 5.3, 70: 9.2, 80: 13.8, 90: 18.1, 100: 22.4 },
    hedgedPct: 30,
    productionGrowth: 9.4,
  },
  {
    ticker: "OVV",
    name: "Ovintiv",
    fcfYield: { 60: 2.8, 70: 6.1, 80: 10.2, 90: 14.3, 100: 17.9 },
    hedgedPct: 60,
    productionGrowth: 3.8,
  },
];

const SOLAR_LCOE = [
  { year: 2010, lcoe: 378 },
  { year: 2012, lcoe: 248 },
  { year: 2014, lcoe: 156 },
  { year: 2016, lcoe: 99 },
  { year: 2018, lcoe: 68 },
  { year: 2020, lcoe: 40 },
  { year: 2022, lcoe: 29 },
  { year: 2024, lcoe: 24 },
];

const CLEAN_STOCKS = [
  { ticker: "FSLR", name: "First Solar", price: 192.4, pe: 18.7, rev_growth: 32.1, ytd: 8.4, segment: "Solar Mfg" },
  { ticker: "ENPH", name: "Enphase Energy", price: 108.3, pe: 24.1, rev_growth: -44.8, ytd: -22.3, segment: "Solar Inverters" },
  { ticker: "SEDG", name: "SolarEdge Tech", price: 18.7, pe: -8.2, rev_growth: -68.3, ytd: -67.1, segment: "Solar Inverters" },
  { ticker: "NEE", name: "NextEra Energy", price: 62.8, pe: 21.3, rev_growth: 8.4, ytd: 2.1, segment: "Utility/Renewables" },
  { ticker: "AES", name: "AES Corp", price: 18.9, pe: 11.2, rev_growth: 5.7, ytd: -12.4, segment: "Clean Power" },
  { ticker: "BEP", name: "Brookfield Renew.", price: 28.4, pe: 38.4, rev_growth: 12.3, ytd: -8.7, segment: "Renewable Infra" },
  { ticker: "BEPC", name: "BEP Corp", price: 29.1, pe: 40.2, rev_growth: 11.8, ytd: -9.2, segment: "Renewable Infra" },
];

const BATTERY_CHEMISTRY = [
  { name: "LFP (LiFePO₄)", cost2024: 98, cost2020: 180, cost2018: 270, energyDensity: "150-200 Wh/kg", cycles: "3000-6000", bestFor: "Grid storage, price-sensitive EVs" },
  { name: "NMC (LiNiMnCoO₂)", cost2024: 115, cost2020: 205, cost2018: 300, energyDensity: "200-280 Wh/kg", cycles: "1000-2000", bestFor: "Premium EVs, high energy apps" },
  { name: "NCA (LiNiCoAlO₂)", cost2024: 120, cost2020: 215, cost2018: 310, energyDensity: "200-260 Wh/kg", cycles: "500-1500", bestFor: "Long-range EVs (Tesla)" },
];

const HYDROGEN_TYPES = [
  { type: "Grey Hydrogen", source: "Steam methane reforming (no CCS)", cost: 1.5, color: "#6b7280", co2: 9.0 },
  { type: "Blue Hydrogen", source: "Steam methane reforming + CCS", cost: 2.4, color: "#3b82f6", co2: 1.5 },
  { type: "Green Hydrogen", source: "Electrolysis + renewable electricity", cost: 5.8, color: "#34d399", co2: 0.0 },
];

const UTILITIES = [
  { ticker: "XEL", name: "Xcel Energy", allowedROE: 9.8, rateBaseGrowth: 7.2, dividend: 2.28, payoutRatio: 68, coverage: 1.47, capex: 4.2 },
  { ticker: "DTE", name: "DTE Energy", allowedROE: 10.1, rateBaseGrowth: 6.8, dividend: 3.54, payoutRatio: 72, coverage: 1.39, capex: 3.1 },
  { ticker: "AEP", name: "Amer. Elec. Power", allowedROE: 9.7, rateBaseGrowth: 8.1, dividend: 3.52, payoutRatio: 74, coverage: 1.35, capex: 7.8 },
  { ticker: "PPL", name: "PPL Corp", allowedROE: 10.3, rateBaseGrowth: 6.2, dividend: 1.58, payoutRatio: 65, coverage: 1.54, capex: 2.4 },
  { ticker: "FE", name: "FirstEnergy", allowedROE: 9.5, rateBaseGrowth: 5.9, dividend: 1.56, payoutRatio: 71, coverage: 1.41, capex: 2.9 },
];

const EV_CURVE = [
  { year: 2020, share: 4.2 },
  { year: 2021, share: 8.3 },
  { year: 2022, share: 13.1 },
  { year: 2023, share: 18.2 },
  { year: 2024, share: 22.8 },
  { year: 2025, share: 27.1 },
  { year: 2026, share: 30.8 },
  { year: 2027, share: 34.2 },
  { year: 2028, share: 37.9 },
  { year: 2029, share: 41.3 },
  { year: 2030, share: 44.8 },
];

const OIL_DEMAND_FORECASTS = [
  { year: 2025, iea: 103.8, opec: 105.2 },
  { year: 2026, iea: 104.1, opec: 106.8 },
  { year: 2027, iea: 103.9, opec: 108.1 },
  { year: 2028, iea: 103.2, opec: 109.3 },
  { year: 2029, iea: 102.1, opec: 110.4 },
  { year: 2030, iea: 100.4, opec: 111.2 },
];

const CRITICAL_MINERALS = [
  { mineral: "Lithium", use: "EV batteries, grid storage", supplyConc: 74, riskLevel: "High", topProducer: "Australia, Chile" },
  { mineral: "Cobalt", use: "NMC/NCA batteries", supplyConc: 68, riskLevel: "High", topProducer: "DRC (70%)" },
  { mineral: "Nickel", use: "High-energy batteries", supplyConc: 42, riskLevel: "Medium", topProducer: "Indonesia" },
  { mineral: "Silicon", use: "Solar PV panels", supplyConc: 87, riskLevel: "High", topProducer: "China (87%)" },
  { mineral: "Copper", use: "Wiring, EVs, grid", supplyConc: 28, riskLevel: "Medium", topProducer: "Chile, Peru" },
  { mineral: "Rare Earths", use: "Wind turbine magnets", supplyConc: 90, riskLevel: "Critical", topProducer: "China (90%)" },
];

const CARBON_CAPTURE = [
  { name: "Direct Air Capture (early)", cost: 400, maturity: "Pilot", projects: 4, supported: true },
  { name: "Direct Air Capture (2030)", cost: 150, maturity: "Projected", projects: 0, supported: true },
  { name: "Industrial CCS", cost: 80, maturity: "Commercial", projects: 45, supported: true },
  { name: "Bioenergy + CCS (BECCS)", cost: 120, maturity: "Demonstration", projects: 12, supported: true },
  { name: "Enhanced Oil Recovery", cost: 40, maturity: "Mature", projects: 200, supported: false },
];

// ══════════════════════════════════════════════════════════════════════════════
// SVG: Donut Chart
// ══════════════════════════════════════════════════════════════════════════════

function DonutChart({ data }: { data: { source: string; pct: number; color: string }[] }) {
  const cx = 100;
  const cy = 100;
  const r = 70;
  const inner = 42;
  let cumAngle = -90;

  const slices = data.map((d) => {
    const angle = (d.pct / 100) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const toRad = (a: number) => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const ix1 = cx + inner * Math.cos(toRad(startAngle));
    const iy1 = cy + inner * Math.sin(toRad(startAngle));
    const ix2 = cx + inner * Math.cos(toRad(endAngle));
    const iy2 = cy + inner * Math.sin(toRad(endAngle));
    const large = angle > 180 ? 1 : 0;
    const path = `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${inner},${inner} 0 ${large},0 ${ix1},${iy1} Z`;
    return { ...d, path };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={200} height={200} viewBox="0 0 200 200">
        {slices.map((sl) => (
          <path key={sl.source} d={sl.path} fill={sl.color} opacity={0.9} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#e4e4e7" fontSize={11} fontWeight="600">
          Global
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#a1a1aa" fontSize={10}>
          Energy Mix
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {data.map((d) => (
          <div key={d.source} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-muted-foreground">{d.source}</span>
            <span className="text-muted-foreground">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SVG: LCOE Cost Curve
// ══════════════════════════════════════════════════════════════════════════════

function LcoeCurve() {
  const W = 400;
  const H = 180;
  const pad = { t: 16, r: 16, b: 36, l: 48 };
  const gw = W - pad.l - pad.r;
  const gh = H - pad.t - pad.b;

  const minY = 0;
  const maxY = 400;
  const years = SOLAR_LCOE.map((d) => d.year);
  const minX = Math.min(...years);
  const maxX = Math.max(...years);

  const px = (year: number) => pad.l + ((year - minX) / (maxX - minX)) * gw;
  const py = (val: number) => pad.t + (1 - (val - minY) / (maxY - minY)) * gh;

  const pts = SOLAR_LCOE.map((d) => `${px(d.year)},${py(d.lcoe)}`).join(" ");
  const areaPath = `M${px(minX)},${py(0)} ` + SOLAR_LCOE.map((d) => `L${px(d.year)},${py(d.lcoe)}`).join(" ") + ` L${px(maxX)},${py(0)} Z`;

  const yTicks = [0, 100, 200, 300, 400];
  const xTicks = [2010, 2014, 2018, 2022, 2024];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="lcoeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={py(v)} y2={py(v)} stroke="#3f3f46" strokeWidth={0.5} />
          <text x={pad.l - 4} y={py(v) + 4} textAnchor="end" fill="#71717a" fontSize={9}>{v}</text>
        </g>
      ))}
      {xTicks.map((x) => (
        <text key={x} x={px(x)} y={H - pad.b + 14} textAnchor="middle" fill="#71717a" fontSize={9}>{x}</text>
      ))}
      <path d={areaPath} fill="url(#lcoeGrad)" />
      <polyline points={pts} fill="none" stroke="#fbbf24" strokeWidth={2.5} strokeLinejoin="round" />
      {SOLAR_LCOE.map((d) => (
        <circle key={d.year} cx={px(d.year)} cy={py(d.lcoe)} r={3} fill="#fbbf24" />
      ))}
      {SOLAR_LCOE.map((d) => (
        <text key={d.year + "l"} x={px(d.year)} y={py(d.lcoe) - 7} textAnchor="middle" fill="#fbbf24" fontSize={8.5}>${d.lcoe}</text>
      ))}
      <text x={pad.l - 4} y={pad.t - 4} textAnchor="end" fill="#a1a1aa" fontSize={9}>$/MWh</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SVG: EV Adoption S-Curve
// ══════════════════════════════════════════════════════════════════════════════

function EvAdoptionChart() {
  const W = 440;
  const H = 180;
  const pad = { t: 16, r: 16, b: 36, l: 44 };
  const gw = W - pad.l - pad.r;
  const gh = H - pad.t - pad.b;

  const minX = 2020;
  const maxX = 2030;
  const minY = 0;
  const maxY = 50;

  const px = (x: number) => pad.l + ((x - minX) / (maxX - minX)) * gw;
  const py = (y: number) => pad.t + (1 - (y - minY) / (maxY - minY)) * gh;

  const projected = EV_CURVE.filter((d) => d.year > 2024);
  const historical = EV_CURVE.filter((d) => d.year <= 2024);

  const histPts = historical.map((d) => `${px(d.year)},${py(d.share)}`).join(" ");
  const projPts = EV_CURVE.slice(EV_CURVE.findIndex((d) => d.year === 2024)).map((d) => `${px(d.year)},${py(d.share)}`).join(" ");

  const areaHist = `M${px(2020)},${py(0)} ` + historical.map((d) => `L${px(d.year)},${py(d.share)}`).join(" ") + ` L${px(2024)},${py(0)} Z`;

  const yTicks = [0, 10, 20, 30, 40, 50];
  const xTicks = [2020, 2022, 2024, 2026, 2028, 2030];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#34d399" stopOpacity={0.03} />
        </linearGradient>
      </defs>
      {/* 30% target line */}
      <line x1={pad.l} x2={W - pad.r} y1={py(30)} y2={py(30)} stroke="#a78bfa" strokeWidth={1} strokeDasharray="4,3" />
      <text x={W - pad.r + 2} y={py(30) + 4} fill="#a78bfa" fontSize={8}>30%</text>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={py(v)} y2={py(v)} stroke="#3f3f46" strokeWidth={0.5} />
          <text x={pad.l - 4} y={py(v) + 4} textAnchor="end" fill="#71717a" fontSize={9}>{v}%</text>
        </g>
      ))}
      {xTicks.map((x) => (
        <text key={x} x={px(x)} y={H - pad.b + 14} textAnchor="middle" fill="#71717a" fontSize={9}>{x}</text>
      ))}
      <path d={areaHist} fill="url(#evGrad)" />
      <polyline points={histPts} fill="none" stroke="#34d399" strokeWidth={2.5} strokeLinejoin="round" />
      <polyline points={projPts} fill="none" stroke="#34d399" strokeWidth={2} strokeDasharray="5,3" strokeLinejoin="round" />
      {historical.map((d) => (
        <circle key={d.year} cx={px(d.year)} cy={py(d.share)} r={3} fill="#34d399" />
      ))}
      {projected.map((d) => (
        <circle key={d.year} cx={px(d.year)} cy={py(d.share)} r={2.5} fill="none" stroke="#34d399" strokeWidth={1.5} />
      ))}
      <text x={px(2024) + 4} y={py(22)} fill="#a1a1aa" fontSize={8}>▶ Projected</text>
      <text x={pad.l - 4} y={pad.t - 4} textAnchor="end" fill="#a1a1aa" fontSize={9}>% of New Car Sales</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SVG: IEA vs OPEC Divergence
// ══════════════════════════════════════════════════════════════════════════════

function OilDemandForecastChart() {
  const W = 440;
  const H = 180;
  const pad = { t: 16, r: 16, b: 36, l: 52 };
  const gw = W - pad.l - pad.r;
  const gh = H - pad.t - pad.b;

  const minX = 2025;
  const maxX = 2030;
  const minY = 98;
  const maxY = 114;

  const px = (x: number) => pad.l + ((x - minX) / (maxX - minX)) * gw;
  const py = (y: number) => pad.t + (1 - (y - minY) / (maxY - minY)) * gh;

  const ieaPts = OIL_DEMAND_FORECASTS.map((d) => `${px(d.year)},${py(d.iea)}`).join(" ");
  const opecPts = OIL_DEMAND_FORECASTS.map((d) => `${px(d.year)},${py(d.opec)}`).join(" ");

  const yTicks = [98, 101, 104, 107, 110, 113];
  const xTicks = [2025, 2026, 2027, 2028, 2029, 2030];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={py(v)} y2={py(v)} stroke="#3f3f46" strokeWidth={0.5} />
          <text x={pad.l - 4} y={py(v) + 4} textAnchor="end" fill="#71717a" fontSize={9}>{v}</text>
        </g>
      ))}
      {xTicks.map((x) => (
        <text key={x} x={px(x)} y={H - pad.b + 14} textAnchor="middle" fill="#71717a" fontSize={9}>{x}</text>
      ))}
      {/* Divergence fill */}
      <path
        d={`M${px(2025)},${py(OIL_DEMAND_FORECASTS[0].opec)} ` +
          OIL_DEMAND_FORECASTS.map((d) => `L${px(d.year)},${py(d.opec)}`).join(" ") +
          ` L${px(2030)},${py(OIL_DEMAND_FORECASTS[5].iea)} ` +
          [...OIL_DEMAND_FORECASTS].reverse().map((d) => `L${px(d.year)},${py(d.iea)}`).join(" ") +
          " Z"}
        fill="#f97316"
        opacity={0.12}
      />
      <polyline points={ieaPts} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinejoin="round" />
      <polyline points={opecPts} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" />
      {OIL_DEMAND_FORECASTS.map((d) => (
        <circle key={d.year + "iea"} cx={px(d.year)} cy={py(d.iea)} r={3} fill="#3b82f6" />
      ))}
      {OIL_DEMAND_FORECASTS.map((d) => (
        <circle key={d.year + "opec"} cx={px(d.year)} cy={py(d.opec)} r={3} fill="#f97316" />
      ))}
      {/* Labels */}
      <text x={px(2030) + 4} y={py(OIL_DEMAND_FORECASTS[5].iea) + 4} fill="#3b82f6" fontSize={9} fontWeight="600">IEA</text>
      <text x={px(2030) + 4} y={py(OIL_DEMAND_FORECASTS[5].opec) + 4} fill="#f97316" fontSize={9} fontWeight="600">OPEC</text>
      <text x={pad.l - 4} y={pad.t - 4} textAnchor="end" fill="#a1a1aa" fontSize={9}>mb/d</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Energy Market Overview
// ══════════════════════════════════════════════════════════════════════════════

function Tab1() {
  return (
    <div className="space-y-6">
      {/* Energy Prices */}
      <div>
        <SectionTitle>
          <Flame className="w-3.5 h-3.5" /> Oil, Gas & Energy Prices
        </SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ENERGY_PRICES.map((ep) => (
            <Card key={ep.name}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-xs text-muted-foreground">{ep.name}</div>
                  <div className="text-xs text-muted-foreground">{ep.unit}</div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full mt-1" style={{ backgroundColor: ep.color }} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-2">{ep.name.includes("EU") ? "€" : "$"}{ep.price.toFixed(2)}</div>
              <div className="flex gap-3 text-xs">
                <span className="text-muted-foreground">1M</span>
                <span className={posNeg(ep.change1m)}>{fmtPct(ep.change1m)}</span>
                <span className="text-muted-foreground">1Y</span>
                <span className={posNeg(ep.change1y)}>{fmtPct(ep.change1y)}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Energy Mix */}
      <div>
        <SectionTitle>
          <Globe className="w-3.5 h-3.5" /> Global Primary Energy Mix (2024)
        </SectionTitle>
        <Card>
          <DonutChart data={ENERGY_MIX} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoBox variant="amber">
              <strong>Fossil fuels still dominate</strong> at 81.5% of global primary energy. Despite rapid renewable growth, absolute consumption continues to rise alongside rising living standards in emerging markets.
            </InfoBox>
            <InfoBox variant="emerald">
              <strong>Renewables accelerating</strong> — solar + wind now 6.1% of primary energy vs 1.0% in 2010. Adding 400+ GW per year. Solar alone grew 300% in the last five years.
            </InfoBox>
          </div>
        </Card>
      </div>

      {/* Supply/Demand Balance */}
      <div>
        <SectionTitle>
          <BarChart3 className="w-3.5 h-3.5" /> IEA Global Liquids Balance (mb/d)
        </SectionTitle>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Category</th>
                  <th className="text-right py-2">2023</th>
                  <th className="text-right py-2">2024E</th>
                  <th className="text-right py-2">2025E</th>
                  <th className="text-right py-2">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { cat: "World Demand", v23: 101.8, v24: 103.1, v25: 104.5, delta: 1.4 },
                  { cat: "OPEC+ Supply", v23: 51.2, v24: 49.8, v25: 50.4, delta: 0.6 },
                  { cat: "Non-OPEC Supply", v23: 50.9, v24: 52.8, v25: 53.7, delta: 0.9 },
                  { cat: "Total Supply", v23: 102.1, v24: 102.6, v25: 104.1, delta: 1.5 },
                  { cat: "Balance (Supply-Demand)", v23: 0.3, v24: -0.5, v25: -0.4, delta: 0.1 },
                ].map((r) => (
                  <tr key={r.cat} className={r.cat.includes("Balance") ? "bg-amber-500/5" : ""}>
                    <td className={cn("py-2 text-muted-foreground", r.cat.includes("Balance") && "font-semibold text-amber-300")}>{r.cat}</td>
                    <td className="py-2 text-right text-muted-foreground">{r.v23.toFixed(1)}</td>
                    <td className="py-2 text-right text-muted-foreground">{r.v24.toFixed(1)}</td>
                    <td className="py-2 text-right text-muted-foreground">{r.v25.toFixed(1)}</td>
                    <td className={cn("py-2 text-right", posNeg(r.delta))}>{r.delta > 0 ? "+" : ""}{r.delta.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* OPEC+ Decisions */}
      <div>
        <SectionTitle>
          <Activity className="w-3.5 h-3.5" /> OPEC+ Meeting Tracker
        </SectionTitle>
        <div className="space-y-2">
          {OPEC_DECISIONS.map((d) => (
            <Card key={d.date} className="flex items-center justify-between py-3 px-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">{d.date}</span>
                <span className="text-xs text-muted-foreground">{d.decision}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {d.priceImpact > 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                <span className={cn("text-sm font-bold", posNeg(d.priceImpact))}>{fmtPct(d.priceImpact)}</span>
                <span className="text-xs text-muted-foreground">price impact</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Oil Majors Comparison */}
      <div>
        <SectionTitle>
          <BarChart3 className="w-3.5 h-3.5" /> Oil Major Comparison
        </SectionTitle>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Company</th>
                  <th className="text-right py-2">P/E</th>
                  <th className="text-right py-2">Div. Yield</th>
                  <th className="text-right py-2">Breakeven ($/bbl)</th>
                  <th className="text-right py-2">Upstream Mix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {OIL_MAJORS.map((m) => (
                  <tr key={m.ticker} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5">
                      <div className="font-semibold text-foreground">{m.ticker}</div>
                      <div className="text-muted-foreground">{m.name}</div>
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground">{m.pe.toFixed(1)}x</td>
                    <td className="py-2.5 text-right text-emerald-400">{m.yield_.toFixed(1)}%</td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(m.breakeven / 70) * 100}%`,
                              backgroundColor: m.breakeven < 40 ? "#34d399" : m.breakeven < 55 ? "#fbbf24" : "#f87171",
                            }}
                          />
                        </div>
                        <span className={cn("text-muted-foreground", m.breakeven < 40 ? "text-emerald-400" : m.breakeven < 55 ? "text-amber-400" : "text-rose-400")}>
                          ${m.breakeven}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground">{m.upstreamMix}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <InfoBox variant="blue" >
            <strong>Breakeven oil price</strong> is the WTI price at which a company covers all operating costs, capex, dividends, and debt service. Saudi Aramco&apos;s government breakeven is ~$80/bbl for budget balance despite $9/bbl production cost.
          </InfoBox>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Upstream E&P Analysis
// ══════════════════════════════════════════════════════════════════════════════

function Tab2() {
  const [selectedOilPrice, setSelectedOilPrice] = useState<OilPrice>(80);

  return (
    <div className="space-y-6">
      {/* Breakeven by Basin */}
      <div>
        <SectionTitle>
          <BarChart3 className="w-3.5 h-3.5" /> Breakeven Oil Price by Basin
        </SectionTitle>
        <Card>
          <div className="space-y-2.5">
            {[...BASINS].sort((a, b) => a.breakeven - b.breakeven).map((b) => (
              <div key={b.name} className="flex items-center gap-3">
                <div className="w-36 text-xs text-muted-foreground shrink-0">
                  {b.name}
                  <div className="text-muted-foreground text-xs">{b.country}</div>
                </div>
                <div className="flex-1 h-5 bg-muted/60 rounded-md overflow-hidden relative">
                  <div
                    className="h-full rounded-md transition-all duration-300"
                    style={{
                      width: `${(b.breakeven / 70) * 100}%`,
                      backgroundColor:
                        b.breakeven < 35 ? "#34d399" :
                        b.breakeven < 50 ? "#fbbf24" :
                        "#f87171",
                    }}
                  />
                  <span className="absolute left-2 top-0 h-full flex items-center text-xs font-medium text-background">
                    ${b.breakeven}/bbl
                  </span>
                </div>
                <div className="text-xs text-muted-foreground w-20 shrink-0 text-right">{b.production} mb/d</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-400" />Under $35 — Profitable even in downturns</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-400" />$35–$50 — Moderate risk</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-400" />Over $50 — Vulnerable to price drops</span>
          </div>
        </Card>
      </div>

      {/* Reserve Life & Carbon Intensity */}
      <div>
        <SectionTitle>
          <Activity className="w-3.5 h-3.5" /> Reserve Life Index & Carbon Intensity
        </SectionTitle>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Basin</th>
                  <th className="text-right py-2">Reserve Life (yrs)</th>
                  <th className="text-right py-2">CO₂ (kg/bbl)</th>
                  <th className="text-right py-2">ESG Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...BASINS].sort((a, b) => b.co2perBbl - a.co2perBbl).map((b) => (
                  <tr key={b.name} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 text-muted-foreground">{b.name}</td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min((b.reserveLife / 80) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground">{b.reserveLife}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={cn(
                        b.co2perBbl > 25 ? "text-rose-400" :
                        b.co2perBbl > 12 ? "text-amber-400" :
                        "text-emerald-400"
                      )}>
                        {b.co2perBbl.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          b.co2perBbl > 25 ? "border-rose-500/50 text-rose-400" :
                          b.co2perBbl > 12 ? "border-amber-500/50 text-amber-400" :
                          "border-emerald-500/50 text-emerald-400"
                        )}
                      >
                        {b.co2perBbl > 25 ? "High" : b.co2perBbl > 12 ? "Medium" : "Low"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* FCF Yield Sensitivity */}
      <div>
        <SectionTitle>
          <TrendingUp className="w-3.5 h-3.5" /> Free Cash Flow Yield at Different Oil Prices
        </SectionTitle>
        <Card>
          <div className="flex gap-2 mb-4 flex-wrap">
            {OIL_PRICES_FCF.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedOilPrice(p)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  selectedOilPrice === p
                    ? "bg-amber-500 text-black"
                    : "bg-foreground/5 text-muted-foreground hover:bg-muted/50"
                )}
              >
                ${p}/bbl
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {EP_COMPANIES.map((c) => {
              const fcf = c.fcfYield[selectedOilPrice];
              return (
                <div key={c.ticker} className="flex items-center gap-3">
                  <div className="w-12 font-medium text-foreground text-xs">{c.ticker}</div>
                  <div className="flex-1 h-6 bg-muted/60 rounded-md overflow-hidden relative">
                    <motion.div
                      layout
                      className="h-full rounded-md"
                      style={{ backgroundColor: fcf > 15 ? "#34d399" : fcf > 8 ? "#fbbf24" : "#60a5fa" }}
                      animate={{ width: `${Math.min(fcf * 4, 100)}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    <span className="absolute left-2 top-0 h-full flex items-center text-[11px] font-medium text-background">
                      {fcf.toFixed(1)}% FCF yield
                    </span>
                  </div>
                  <div className="w-20 text-right text-xs text-muted-foreground">{c.hedgedPct}% hedged</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Hedged % = portion of next 12-month production sold at locked-in prices via swaps/collars — reduces upside but protects cash flow.
          </div>
        </Card>
      </div>

      {/* Hedging explainer */}
      <div>
        <SectionTitle>
          <Info className="w-3.5 h-3.5" /> Hedging Programs — How E&P Companies Manage Price Risk
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "Fixed-Price Swap", desc: "Sell production at agreed price. Full protection but zero upside if oil rises.", risk: "Low", upside: "None" },
            { name: "Collar (Put + Call)", desc: "Buy put floor, sell call ceiling. Protects downside, caps upside. Most common.", risk: "Low", upside: "Partial" },
            { name: "Put Options", desc: "Pay premium for downside protection. Full upside exposure. Expensive.", risk: "Medium", upside: "Full" },
          ].map((h) => (
            <Card key={h.name} className="flex flex-col gap-2">
              <div className="text-sm font-medium text-foreground">{h.name}</div>
              <div className="text-xs text-muted-foreground flex-1">{h.desc}</div>
              <div className="flex gap-2 text-xs mt-1">
                <Badge variant="outline" className="border-primary/40 text-primary">Risk: {h.risk}</Badge>
                <Badge variant="outline" className={cn(
                  h.upside === "Full" ? "border-emerald-500/40 text-emerald-400" :
                  h.upside === "Partial" ? "border-amber-500/40 text-amber-400" :
                  "border-rose-500/40 text-rose-400"
                )}>Upside: {h.upside}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Clean Energy
// ══════════════════════════════════════════════════════════════════════════════

function Tab3() {
  return (
    <div className="space-y-6">
      {/* Solar LCOE */}
      <div>
        <SectionTitle>
          <Sun className="w-3.5 h-3.5" /> Solar LCOE Trajectory — 90% Cost Decline 2010–2024
        </SectionTitle>
        <Card>
          <LcoeCurve />
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-amber-400">90%</div>
              <div className="text-xs text-muted-foreground">cost decline 2010→2024</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">$24</div>
              <div className="text-xs text-muted-foreground">LCOE per MWh in 2024</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">&lt;$20</div>
              <div className="text-xs text-muted-foreground">projected by 2030</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Wind Cost Comparison */}
      <div>
        <SectionTitle>
          <Wind className="w-3.5 h-3.5" /> Wind Cost Comparison: Onshore vs Offshore
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              type: "Onshore Wind",
              lcoe: 33,
              capex: 1200,
              cf: "30–40%",
              trend: "Mature — incremental improvements",
              color: "#34d399",
              icon: <Wind className="w-5 h-5 text-emerald-400" />,
            },
            {
              type: "Offshore Wind",
              lcoe: 78,
              capex: 3200,
              cf: "40–55%",
              trend: "Rapidly declining — scale + supply chain",
              color: "#3b82f6",
              icon: <Droplets className="w-5 h-5 text-primary" />,
            },
          ].map((w) => (
            <Card key={w.type} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {w.icon}
                <div className="font-medium text-foreground">{w.type}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-medium" style={{ color: w.color }}>${w.lcoe}</div>
                  <div className="text-xs text-muted-foreground">LCOE $/MWh</div>
                </div>
                <div>
                  <div className="text-lg font-medium text-foreground">${w.capex}</div>
                  <div className="text-xs text-muted-foreground">CapEx $/kW</div>
                </div>
                <div>
                  <div className="text-lg font-medium text-foreground">{w.cf}</div>
                  <div className="text-xs text-muted-foreground">Capacity Factor</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{w.trend}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Clean Energy Stocks */}
      <div>
        <SectionTitle>
          <TrendingUp className="w-3.5 h-3.5" /> Clean Energy Stocks
        </SectionTitle>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Ticker</th>
                  <th className="text-left py-2">Segment</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">P/E</th>
                  <th className="text-right py-2">Rev Growth</th>
                  <th className="text-right py-2">YTD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {CLEAN_STOCKS.map((s) => (
                  <tr key={s.ticker} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-medium text-foreground">{s.ticker}</td>
                    <td className="py-2.5 text-muted-foreground">{s.segment}</td>
                    <td className="py-2.5 text-right text-muted-foreground">${s.price.toFixed(1)}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{s.pe > 0 ? `${s.pe.toFixed(1)}x` : "N/M"}</td>
                    <td className={cn("py-2.5 text-right", posNeg(s.rev_growth))}>{fmtPct(s.rev_growth)}</td>
                    <td className={cn("py-2.5 text-right", posNeg(s.ytd))}>{fmtPct(s.ytd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* IRA Benefits */}
      <div>
        <SectionTitle>
          <CheckCircle className="w-3.5 h-3.5" /> Inflation Reduction Act (IRA) — Key Tax Incentives
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              title: "30% Investment Tax Credit (ITC)",
              desc: "Solar, storage, wind projects qualify for 30% federal tax credit on capital cost. Bonus credits for domestic content (+10%), energy communities (+10%).",
              value: "30%+ of project cost",
              variant: "emerald" as const,
            },
            {
              title: "Production Tax Credit (PTC) — Wind",
              desc: "2.75¢/kWh for electricity produced from wind for 10 years after commissioning. Equivalent to ~$30–40/MWh for typical wind farms.",
              value: "$30–40/MWh equivalent",
              variant: "blue" as const,
            },
            {
              title: "Battery Storage Standalone ITC",
              desc: "IRA extended ITC to standalone storage (no solar co-location required). Critical for 4-hour grid storage economics.",
              value: "30% of battery cost",
              variant: "amber" as const,
            },
            {
              title: "Clean Hydrogen PTC",
              desc: "Up to $3/kg tax credit for green hydrogen production. Scales with lifecycle emissions. Designed to close the cost gap with grey hydrogen.",
              value: "Up to $3/kg H₂",
              variant: "emerald" as const,
            },
          ].map((item) => (
            <Card key={item.title} className="flex flex-col gap-2">
              <div className="text-sm font-medium text-foreground">{item.title}</div>
              <div className="text-xs text-muted-foreground flex-1">{item.desc}</div>
              <InfoBox variant={item.variant}><strong>Value:</strong> {item.value}</InfoBox>
            </Card>
          ))}
        </div>
      </div>

      {/* Battery Chemistry */}
      <div>
        <SectionTitle>
          <Battery className="w-3.5 h-3.5" /> Battery Storage — Chemistry Comparison
        </SectionTitle>
        <div className="space-y-3">
          {BATTERY_CHEMISTRY.map((b) => (
            <Card key={b.name} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
              <div>
                <div className="text-sm font-medium text-foreground">{b.name}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">2024 Cost</div>
                <div className="text-lg font-medium text-emerald-400">${b.cost2024}</div>
                <div className="text-xs text-muted-foreground">/kWh</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">Energy Density</div>
                <div className="text-xs font-medium text-foreground">{b.energyDensity}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">Cycle Life</div>
                <div className="text-xs font-medium text-primary">{b.cycles}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Best For</div>
                <div className="text-xs text-muted-foreground">{b.bestFor}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Hydrogen */}
      <div>
        <SectionTitle>
          <Zap className="w-3.5 h-3.5" /> Hydrogen Economy — Green/Blue/Grey Cost Comparison
        </SectionTitle>
        <Card>
          <div className="space-y-3">
            {HYDROGEN_TYPES.map((h) => (
              <div key={h.type} className="flex items-center gap-4">
                <div className="w-32 shrink-0">
                  <div className="text-xs font-medium text-foreground">{h.type}</div>
                  <div className="text-xs text-muted-foreground">{h.source}</div>
                </div>
                <div className="flex-1 h-6 bg-muted/60 rounded-md overflow-hidden relative">
                  <div
                    className="h-full rounded-md"
                    style={{ width: `${(h.cost / 7) * 100}%`, backgroundColor: h.color }}
                  />
                  <span className="absolute left-2 top-0 h-full flex items-center text-[11px] font-medium text-background">
                    ${h.cost}/kg
                  </span>
                </div>
                <div className="w-20 text-right text-xs">
                  {h.co2 === 0 ? (
                    <span className="text-emerald-400">Zero CO₂</span>
                  ) : (
                    <span className="text-muted-foreground">{h.co2} kg CO₂/kg</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <InfoBox variant="amber" >
            Green hydrogen is 3–4x more expensive than grey today, but with IRA PTC + falling renewable costs, cost parity is projected by 2030–2035 in favorable regions.
          </InfoBox>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Utilities & Infrastructure
// ══════════════════════════════════════════════════════════════════════════════

function Tab4() {
  return (
    <div className="space-y-6">
      {/* Regulated Utilities */}
      <div>
        <SectionTitle>
          <Zap className="w-3.5 h-3.5" /> Regulated Utilities — Allowed ROE & Rate Base Growth
        </SectionTitle>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Company</th>
                  <th className="text-right py-2">Allowed ROE</th>
                  <th className="text-right py-2">Rate Base Growth</th>
                  <th className="text-right py-2">Dividend</th>
                  <th className="text-right py-2">Payout Ratio</th>
                  <th className="text-right py-2">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {UTILITIES.map((u) => (
                  <tr key={u.ticker} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5">
                      <div className="font-medium text-foreground">{u.ticker}</div>
                      <div className="text-muted-foreground">{u.name}</div>
                    </td>
                    <td className="py-2.5 text-right text-primary">{u.allowedROE}%</td>
                    <td className="py-2.5 text-right text-emerald-400">+{u.rateBaseGrowth}%</td>
                    <td className="py-2.5 text-right text-foreground">${u.dividend.toFixed(2)}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{u.payoutRatio}%</td>
                    <td className={cn("py-2.5 text-right", u.coverage > 1.4 ? "text-emerald-400" : "text-amber-400")}>
                      {u.coverage.toFixed(2)}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Rate Case Explainer */}
      <div>
        <SectionTitle>
          <Info className="w-3.5 h-3.5" /> Rate Case Analysis — How Utilities Earn Returns
        </SectionTitle>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "File Rate Case",
                desc: "Utility submits request to state Public Utilities Commission to increase customer rates based on capital invested (rate base).",
                color: "text-primary",
              },
              {
                step: "2",
                title: "Allowed Return",
                desc: "PUC approves allowed ROE (typically 9–11%). Utility earns this on its rate base: net income = rate base × allowed ROE.",
                color: "text-amber-400",
              },
              {
                step: "3",
                title: "Earnings Grow with Capex",
                desc: "Every dollar spent on grid/transmission/renewables increases rate base. Higher capex → higher earnings. Low earnings risk = bond-like stability.",
                color: "text-emerald-400",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className={cn("text-2xl font-bold shrink-0", s.color)}>{s.step}</div>
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <InfoBox variant="blue" >
            Regulated utilities have near-zero earnings risk: returns are set by regulators, not markets. This makes them bond proxies — rising interest rates increase utility cost of capital and pressure valuations (higher yield alternatives). The 10Y treasury yield is the most important macro variable for utility stock prices.
          </InfoBox>
        </Card>
      </div>

      {/* Rate Base Growth CapEx */}
      <div>
        <SectionTitle>
          <BarChart3 className="w-3.5 h-3.5" /> Rate Base Growth & Capital Investment
        </SectionTitle>
        <Card>
          <div className="space-y-3">
            {UTILITIES.map((u) => (
              <div key={u.ticker} className="flex items-center gap-3">
                <div className="w-12 font-medium text-foreground text-xs">{u.ticker}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Annual CapEx: <span className="text-foreground">${u.capex}B</span></span>
                    <span className="text-emerald-400">Rate Base +{u.rateBaseGrowth}%/yr</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(u.capex / 9) * 100}%` }}
                      transition={{ delay: 0.1, duration: 0.6 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Renewable Transition */}
      <div>
        <SectionTitle>
          <Leaf className="w-3.5 h-3.5" /> Renewable Transition — Stranded Asset Risk
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="flex flex-col gap-3">
            <div className="text-sm font-medium text-emerald-400">Opportunity: New Rate Base</div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {[
                "Solar + wind additions build new regulated rate base",
                "Transmission for renewable integration: $2.5T needed by 2035",
                "Grid modernization (smart meters, automation) drives capex",
                "Battery storage co-located with solar earns ITC + regulated return",
                "EV charging infrastructure regulated in many states",
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="flex flex-col gap-3">
            <div className="text-sm font-medium text-rose-400">Risk: Stranded Coal Assets</div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {[
                "Coal plants retired early leave undepreciated rate base",
                "Regulatory disallowance risk: PUC may deny recovery",
                "Securitization can help recover stranded costs via bonds",
                "Natural gas plants risk stranding if carbon price rises",
                "Utilities with high coal exposure face ESG investor pressure",
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Transmission Investment */}
      <div>
        <SectionTitle>
          <Activity className="w-3.5 h-3.5" /> Transmission Investment — Grid Upgrade Needs
        </SectionTitle>
        <Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: "New transmission needed by 2035", value: "$2.5T", unit: "globally", color: "text-amber-400" },
              { label: "US grid interconnection queue", value: "2,600", unit: "GW backlogged", color: "text-rose-400" },
              { label: "Average wait for grid connection", value: "5.4", unit: "years", color: "text-amber-400" },
              { label: "US transmission investment (2024)", value: "$32B", unit: "per year", color: "text-emerald-400" },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-lg bg-foreground/5">
                <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.unit}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
          <InfoBox variant="amber" >
            The interconnection queue backlog is the #1 bottleneck for US renewable energy. Over 2,600 GW of mostly wind and solar projects are waiting for grid connection — but only ~20% will ultimately be built. This is creating massive investment opportunity in transmission infrastructure companies like ITC Holdings, GridLiance, and Ameren.
          </InfoBox>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — Energy Transition
// ══════════════════════════════════════════════════════════════════════════════

function Tab5() {
  return (
    <div className="space-y-6">
      {/* EV Adoption */}
      <div>
        <SectionTitle>
          <Car className="w-3.5 h-3.5" /> EV Adoption S-Curve — % of New Car Sales
        </SectionTitle>
        <Card>
          <EvAdoptionChart />
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-medium text-emerald-400">22.8%</div>
              <div className="text-xs text-muted-foreground">Global EV share 2024</div>
            </div>
            <div>
              <div className="text-xl font-medium text-amber-400">~44%</div>
              <div className="text-xs text-muted-foreground">IEA NZE target 2030</div>
            </div>
            <div>
              <div className="text-xl font-medium text-primary">20mb/d</div>
              <div className="text-xs text-muted-foreground">oil displaced by 2035 (IEA NZE)</div>
            </div>
          </div>
        </Card>
      </div>

      {/* IEA vs OPEC Demand Forecasts */}
      <div>
        <SectionTitle>
          <BarChart3 className="w-3.5 h-3.5" /> Oil Demand Peak — IEA vs OPEC Forecast Divergence
        </SectionTitle>
        <Card>
          <OilDemandForecastChart />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoBox variant="blue">
              <strong>IEA Scenario (blue):</strong> Oil demand peaks 2025–2026 at ~104 mb/d then declines as EV adoption accelerates. In Net Zero pathway, demand falls to 75 mb/d by 2030. Driven by policy + technology learning curves.
            </InfoBox>
            <InfoBox variant="amber">
              <strong>OPEC Scenario (orange):</strong> Demand grows continuously to 111+ mb/d by 2030, driven by developing market growth (India, SE Asia, Africa) which offsets Western EV adoption. Energy poverty requires affordable fossil fuels.
            </InfoBox>
          </div>
        </Card>
      </div>

      {/* Critical Minerals */}
      <div>
        <SectionTitle>
          <Globe className="w-3.5 h-3.5" /> Critical Minerals — Clean Energy Supply Chain
        </SectionTitle>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Mineral</th>
                  <th className="text-left py-2">Use in Clean Energy</th>
                  <th className="text-right py-2">Top-3 Supply Conc.</th>
                  <th className="text-right py-2">Supply Risk</th>
                  <th className="text-left py-2">Top Producer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {CRITICAL_MINERALS.map((m) => (
                  <tr key={m.mineral} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-medium text-foreground">{m.mineral}</td>
                    <td className="py-2.5 text-muted-foreground">{m.use}</td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${m.supplyConc}%`,
                              backgroundColor:
                                m.supplyConc > 80 ? "#f87171" :
                                m.supplyConc > 50 ? "#fbbf24" :
                                "#34d399",
                            }}
                          />
                        </div>
                        <span className="text-muted-foreground">{m.supplyConc}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          m.riskLevel === "Critical" ? "border-red-500/60 text-red-400" :
                          m.riskLevel === "High" ? "border-rose-500/50 text-rose-400" :
                          "border-amber-500/50 text-amber-400"
                        )}
                      >
                        {m.riskLevel}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{m.topProducer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <InfoBox variant="rose">
            <strong>China dominates processing:</strong> Even when minerals are mined elsewhere, ~80% of global refining/processing capacity for rare earths, lithium, cobalt, and silicon is in China. This creates geopolitical supply chain risk that is driving IRA domestic content incentives and Western critical mineral investment.
          </InfoBox>
        </Card>
      </div>

      {/* Stranded Assets */}
      <div>
        <SectionTitle>
          <AlertTriangle className="w-3.5 h-3.5" /> Stranded Asset Risk — Fossil Fuels at Risk
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              asset: "Coal Power Plants",
              valueAtRisk: "$1.4T",
              timeline: "2030–2040",
              severity: "Critical",
              detail: "Already uneconomic vs. new wind/solar in most markets. Early retirement accelerating globally.",
              color: "text-rose-400",
              border: "border-rose-500/30",
            },
            {
              asset: "Upstream Oil & Gas",
              valueAtRisk: "$900B",
              timeline: "2035–2050",
              severity: "High",
              detail: "High-cost producers (oil sands, deepwater) risk becoming uneconomic if carbon pricing rises or demand peaks.",
              color: "text-amber-400",
              border: "border-amber-500/30",
            },
            {
              asset: "Gas Distribution",
              valueAtRisk: "$270B",
              timeline: "2040–2060",
              severity: "Medium",
              detail: "Long-lived gas pipelines and distribution networks risk stranding as building electrification replaces gas heating.",
              color: "text-yellow-400",
              border: "border-yellow-500/30",
            },
          ].map((a) => (
            <Card key={a.asset} className={cn("flex flex-col gap-3 border", a.border)}>
              <div>
                <div className="text-sm font-medium text-foreground">{a.asset}</div>
                <Badge variant="outline" className={cn("text-xs mt-1", `border-current ${a.color}`)}>{a.severity} Risk</Badge>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <div className={cn("text-lg font-medium", a.color)}>{a.valueAtRisk}</div>
                  <div className="text-xs text-muted-foreground">Value at Risk</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{a.timeline}</div>
                  <div className="text-xs text-muted-foreground">Peak Risk Window</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{a.detail}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Carbon Capture */}
      <div>
        <SectionTitle>
          <Factory className="w-3.5 h-3.5" /> Carbon Capture — Cost Curve & Commercial Projects
        </SectionTitle>
        <Card>
          <div className="space-y-2.5 mb-4">
            {CARBON_CAPTURE.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-48 text-xs text-muted-foreground shrink-0">
                  {c.name}
                  <div className="text-muted-foreground text-xs">{c.maturity}</div>
                </div>
                <div className="flex-1 h-5 bg-muted/60 rounded-md overflow-hidden relative">
                  <div
                    className="h-full rounded-md transition-all"
                    style={{
                      width: `${(c.cost / 450) * 100}%`,
                      backgroundColor: c.cost < 60 ? "#34d399" : c.cost < 130 ? "#fbbf24" : "#f87171",
                    }}
                  />
                  <span className="absolute left-2 top-0 h-full flex items-center text-xs font-medium text-background">
                    ${c.cost}/tonne CO₂
                  </span>
                </div>
                <div className="w-20 text-right text-xs text-muted-foreground">
                  {c.projects > 0 ? `${c.projects} projects` : "TBD"}
                </div>
              </div>
            ))}
          </div>
          <InfoBox variant="blue">
            The EU ETS carbon price (~€65/tonne) is below the cost of direct air capture ($400+/t) but above enhanced oil recovery CCS ($40/t). Government support (45Q tax credit in US = $85/t for DAC) is needed to bridge the gap. First large-scale DAC plants (Stratos, Iceland) are now operational.
          </InfoBox>
        </Card>
      </div>

      {/* Investment Implications */}
      <div>
        <SectionTitle>
          <TrendingUp className="w-3.5 h-3.5" /> Investment Implications — Winners & Losers
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="border-emerald-500/20">
            <div className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Transition Winners
            </div>
            <div className="space-y-2">
              {[
                { sector: "Transmission & Grid", thesis: "Essential infrastructure for renewable integration — regulated returns, long asset life" },
                { sector: "Solar/Wind Developers", thesis: "IRA incentives + falling LCOE = strong project economics. CAGR 15–25%." },
                { sector: "Battery Storage", thesis: "Grid storage market growing 40%/yr. LFP chemistry winning on cost." },
                { sector: "Clean Hydrogen (2030+)", thesis: "Green H2 cost parity approaching. Industrial decarbonization driver." },
                { sector: "Low-Carbon E&P (Permian)", thesis: "Low breakeven + low carbon intensity = last barrels standing." },
                { sector: "Critical Mineral Miners", thesis: "Lithium, copper demand surge driven by EV + renewables buildout." },
              ].map((w) => (
                <div key={w.sector} className="flex gap-2 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-foreground font-medium">{w.sector}:</span>
                    <span className="text-muted-foreground"> {w.thesis}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-rose-500/20">
            <div className="text-sm font-medium text-rose-400 mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" /> Transition Losers
            </div>
            <div className="space-y-2">
              {[
                { sector: "Coal Producers", thesis: "Secular demand decline. Banks + insurers withdrawing financing. ESG outflows accelerating." },
                { sector: "High-Cost Oil Sands", thesis: "Breakeven $60+ makes projects vulnerable if demand peaks." },
                { sector: "Gas Utilities (long-term)", thesis: "Building electrification threatens gas distribution — 50-year asset life = stranding risk." },
                { sector: "Auto ICE Manufacturers", thesis: "EV transition requires massive capex. Laggards face obsolescence." },
                { sector: "Thermal Power Developers", thesis: "New gas/coal plants face financing challenges and early retirement pressure." },
                { sector: "European Gas Importers", thesis: "2022 price shock has permanently impaired LNG import dependency economics." },
              ].map((l) => (
                <div key={l.sector} className="flex gap-2 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-foreground font-medium">{l.sector}:</span>
                    <span className="text-muted-foreground"> {l.thesis}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function EnergyPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Consume stable PRNG values to avoid re-seeding on render
  void rv();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border border-l-4 border-l-primary bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-lg font-medium text-foreground">Energy Sector</h1>
                <p className="text-xs text-muted-foreground">Oil &amp; Gas · Clean Energy · Utilities · Energy Transition</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-xs">
                WTI $78.42
              </Badge>
              <Badge variant="outline" className="border-rose-500/40 text-rose-400 text-xs">
                Nat Gas $2.84
              </Badge>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs">
                Solar LCOE $24
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-6 mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-foreground/5 border border-border mb-6 flex-wrap h-auto gap-1 p-1">
            {[
              { value: "overview", label: "Market Overview", icon: <Flame className="w-3.5 h-3.5" /> },
              { value: "ep", label: "Upstream E&P", icon: <Droplets className="w-3.5 h-3.5" /> },
              { value: "clean", label: "Clean Energy", icon: <Sun className="w-3.5 h-3.5" /> },
              { value: "utilities", label: "Utilities", icon: <Zap className="w-3.5 h-3.5" /> },
              { value: "transition", label: "Energy Transition", icon: <Leaf className="w-3.5 h-3.5" /> },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 text-muted-foreground flex items-center gap-1.5 px-3 py-1.5 text-xs"
              >
                {t.icon}
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <TabsContent value="overview" className="mt-0 data-[state=inactive]:hidden">
                <Tab1 />
              </TabsContent>
              <TabsContent value="ep" className="mt-0 data-[state=inactive]:hidden">
                <Tab2 />
              </TabsContent>
              <TabsContent value="clean" className="mt-0 data-[state=inactive]:hidden">
                <Tab3 />
              </TabsContent>
              <TabsContent value="utilities" className="mt-0 data-[state=inactive]:hidden">
                <Tab4 />
              </TabsContent>
              <TabsContent value="transition" className="mt-0 data-[state=inactive]:hidden">
                <Tab5 />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
