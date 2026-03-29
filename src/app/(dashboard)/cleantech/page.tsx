"use client";

import { useState, useMemo } from "react";
import {
  Sun,
  Wind,
  Zap,
  Battery,
  TrendingDown,
  TrendingUp,
  Globe,
  Leaf,
  DollarSign,
  BarChart2,
  Info,
  CheckCircle,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Seeded PRNG ─────────────────────────────────────────────────────────────

let s = 712008;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function randBetween(lo: number, hi: number) {
  return lo + rand() * (hi - lo);
}
function randInt(lo: number, hi: number) {
  return Math.floor(randBetween(lo, hi + 1));
}

// ── Types ────────────────────────────────────────────────────────────────────

interface CapacityPoint {
  year: number;
  solar: number;
  wind: number;
  storage: number;
}

interface LcoeRow {
  source: string;
  lcoe: number;
  color: string;
  trend: "down" | "up" | "flat";
  note: string;
}

interface CleanCompany {
  ticker: string;
  name: string;
  segment: string;
  mktCap: number;
  pe: number | null;
  ytdReturn: number;
  capacityGW: number;
  description: string;
}

interface StoragePoint {
  year: number;
  cost: number;
}

interface EvAdoptionPoint {
  year: number;
  share: number;
}

interface CleanEtf {
  ticker: string;
  name: string;
  aum: number;
  expenseRatio: number;
  ytd: number;
  focus: string;
  holdings: number;
  topHolding: string;
}

interface PolicyItem {
  year: number;
  region: string;
  event: string;
  impact: "high" | "medium" | "low";
  detail: string;
}

interface CarbonPriceRow {
  region: string;
  priceUsd: number;
  coverage: number;
  mechanism: string;
}

// ── Static Data ──────────────────────────────────────────────────────────────

const CAPACITY_DATA: CapacityPoint[] = [
  { year: 2015, solar: 228, wind: 433, storage: 2 },
  { year: 2016, solar: 295, wind: 487, storage: 3 },
  { year: 2017, solar: 402, wind: 539, storage: 6 },
  { year: 2018, solar: 505, wind: 591, storage: 9 },
  { year: 2019, solar: 626, wind: 651, storage: 17 },
  { year: 2020, solar: 760, wind: 743, storage: 35 },
  { year: 2021, solar: 942, wind: 838, storage: 62 },
  { year: 2022, solar: 1185, wind: 951, storage: 108 },
  { year: 2023, solar: 1572, wind: 1075, storage: 192 },
  { year: 2024, solar: 2018, wind: 1210, storage: 310 },
  { year: 2025, solar: 2580, wind: 1368, storage: 490 },
];

const LCOE_DATA: LcoeRow[] = [
  { source: "Utility Solar PV", lcoe: 33, color: "#f59e0b", trend: "down", note: "90% cost drop since 2010" },
  { source: "Onshore Wind", lcoe: 26, color: "#3b82f6", trend: "down", note: "70% cost drop since 2010" },
  { source: "Offshore Wind", lcoe: 84, color: "#6366f1", trend: "down", note: "Still declining rapidly" },
  { source: "Gas Peaker", lcoe: 151, color: "#ef4444", trend: "up", note: "Carbon pricing adds cost" },
  { source: "Nuclear (new)", lcoe: 164, color: "#8b5cf6", trend: "flat", note: "High capex, low carbon" },
  { source: "Coal (new)", lcoe: 112, color: "#6b7280", trend: "up", note: "Stranded asset risk" },
  { source: "Geothermal", lcoe: 38, color: "#10b981", trend: "flat", note: "Stable baseload option" },
];

const CLEAN_COMPANIES: CleanCompany[] = [
  {
    ticker: "NEE",
    name: "NextEra Energy",
    segment: "Utility / Wind / Solar",
    mktCap: 158,
    pe: 21,
    ytdReturn: 8.4,
    capacityGW: 67,
    description: "World's largest wind and solar operator, with regulated Florida utility base",
  },
  {
    ticker: "ENPH",
    name: "Enphase Energy",
    segment: "Solar Microinverters",
    mktCap: 14,
    pe: 28,
    ytdReturn: -12.6,
    capacityGW: 0,
    description: "Residential solar microinverter leader with integrated storage solution IQ Battery",
  },
  {
    ticker: "FSLR",
    name: "First Solar",
    segment: "Solar Modules (CdTe)",
    mktCap: 23,
    pe: 16,
    ytdReturn: 22.1,
    capacityGW: 8.3,
    description: "Largest US-made solar module manufacturer; thin-film CdTe technology with IRA benefits",
  },
  {
    ticker: "ORSTED",
    name: "Ørsted A/S",
    segment: "Offshore Wind",
    mktCap: 19,
    pe: null,
    ytdReturn: -5.3,
    capacityGW: 15.6,
    description: "Global offshore wind leader operating in Europe and North America",
  },
  {
    ticker: "RUN",
    name: "Sunrun",
    segment: "Residential Solar + Storage",
    mktCap: 3,
    pe: null,
    ytdReturn: -18.2,
    capacityGW: 6.1,
    description: "Largest US residential solar installer with virtual power plant capabilities",
  },
  {
    ticker: "BEP",
    name: "Brookfield Renewable",
    segment: "Diversified Renewables",
    mktCap: 17,
    pe: null,
    ytdReturn: 5.7,
    capacityGW: 34,
    description: "Global renewable power platform: hydro, wind, solar, distributed energy",
  },
];

function generateStorageCosts(): StoragePoint[] {
  const base = [
    { year: 2013, cost: 732 },
    { year: 2015, cost: 571 },
    { year: 2017, cost: 388 },
    { year: 2019, cost: 229 },
    { year: 2021, cost: 141 },
    { year: 2023, cost: 92 },
    { year: 2025, cost: 69 },
    { year: 2027, cost: 52 },
    { year: 2030, cost: 38 },
  ];
  return base.map((p) => ({ ...p, cost: p.cost * (0.97 + rand() * 0.06) }));
}

function generateEvAdoption(): EvAdoptionPoint[] {
  const base = [
    { year: 2015, share: 0.5 },
    { year: 2016, share: 0.9 },
    { year: 2017, share: 1.3 },
    { year: 2018, share: 2.1 },
    { year: 2019, share: 2.5 },
    { year: 2020, share: 4.3 },
    { year: 2021, share: 8.6 },
    { year: 2022, share: 13.8 },
    { year: 2023, share: 18.2 },
    { year: 2024, share: 23.1 },
    { year: 2025, share: 28.4 },
    { year: 2028, share: 40 },
    { year: 2030, share: 50 },
  ];
  return base.map((p) => ({ ...p, share: p.share * (0.96 + rand() * 0.08) }));
}

const CLEAN_ETFS: CleanEtf[] = [
  {
    ticker: "ICLN",
    name: "iShares Global Clean Energy ETF",
    aum: 2.8,
    expenseRatio: 0.4,
    ytd: 3.2,
    focus: "Global Clean Energy Equities",
    holdings: 100,
    topHolding: "First Solar (FSLR)",
  },
  {
    ticker: "QCLN",
    name: "First Trust NASDAQ Clean Edge Green Energy",
    aum: 1.6,
    expenseRatio: 0.58,
    ytd: 1.7,
    focus: "US Clean Energy Equities",
    holdings: 58,
    topHolding: "ON Semiconductor (ON)",
  },
  {
    ticker: "ACES",
    name: "ALPS Clean Energy ETF",
    aum: 0.68,
    expenseRatio: 0.55,
    ytd: 5.1,
    focus: "North American Clean Energy",
    holdings: 33,
    topHolding: "NextEra Energy (NEE)",
  },
  {
    ticker: "TAN",
    name: "Invesco Solar ETF",
    aum: 1.9,
    expenseRatio: 0.69,
    ytd: -2.8,
    focus: "Global Solar Sector",
    holdings: 53,
    topHolding: "Enphase Energy (ENPH)",
  },
  {
    ticker: "FAN",
    name: "First Trust Global Wind Energy ETF",
    aum: 0.29,
    expenseRatio: 0.62,
    ytd: 4.6,
    focus: "Global Wind Energy",
    holdings: 58,
    topHolding: "Ørsted (ORSTED)",
  },
];

const POLICY_TIMELINE: PolicyItem[] = [
  {
    year: 2015,
    region: "Global",
    event: "Paris Agreement signed",
    impact: "high",
    detail: "196 parties commit to limiting warming to 1.5–2°C; NDC framework established",
  },
  {
    year: 2019,
    region: "EU",
    event: "European Green Deal announced",
    impact: "high",
    detail: "€1 trillion mobilized; climate neutrality by 2050; 55% emissions cut by 2030",
  },
  {
    year: 2021,
    region: "Global",
    event: "COP26 Glasgow Pact",
    impact: "medium",
    detail: "First explicit phase-down of coal; methane pledge by 100+ countries",
  },
  {
    year: 2022,
    region: "US",
    event: "Inflation Reduction Act signed",
    impact: "high",
    detail: "$369B in climate spending; Production Tax Credit extended; 45X manufacturing credit",
  },
  {
    year: 2023,
    region: "EU",
    event: "Carbon Border Adjustment Mechanism",
    impact: "medium",
    detail: "Imports priced on embedded carbon; phased in 2026–2034; covers steel, cement, fertilizers",
  },
  {
    year: 2024,
    region: "US",
    event: "IRA Treasury Rules finalized",
    impact: "medium",
    detail: "Domestic content requirements clarified; transferability of tax credits enabled",
  },
  {
    year: 2025,
    region: "Global",
    event: "IEA Net Zero 2050 Tracker",
    impact: "medium",
    detail: "Renewables capacity on track for 3x by 2030; EV adoption ahead of schedule",
  },
];

const CARBON_PRICES: CarbonPriceRow[] = [
  { region: "EU ETS", priceUsd: 68, coverage: 40, mechanism: "Cap-and-Trade" },
  { region: "UK ETS", priceUsd: 52, coverage: 28, mechanism: "Cap-and-Trade" },
  { region: "Canada OBPS", priceUsd: 65, coverage: 35, mechanism: "Output-Based Pricing" },
  { region: "California ARB", priceUsd: 38, coverage: 85, mechanism: "Cap-and-Trade" },
  { region: "China ETS", priceUsd: 12, coverage: 40, mechanism: "Intensity-Based" },
  { region: "South Korea ETS", priceUsd: 8, coverage: 74, mechanism: "Cap-and-Trade" },
];

// ── IEA NZE Pathway ──────────────────────────────────────────────────────────

const NZE_PATHWAY = [
  { metric: "Solar Capacity (TW)", current: "2.0", nze2030: "5.4", nze2050: "22" },
  { metric: "Wind Capacity (TW)", current: "1.2", nze2030: "3.3", nze2050: "8.2" },
  { metric: "EV Share of Car Sales", current: "23%", nze2030: "60%", nze2050: "100%" },
  { metric: "Clean Power Share", current: "33%", nze2030: "60%", nze2050: "90%" },
  { metric: "Annual Clean Investment ($T)", current: "1.8", nze2030: "4.0", nze2050: "5.5" },
  { metric: "Battery Storage (TWh)", current: "0.31", nze2030: "3.5", nze2050: "15" },
];

// ── SVG Capacity Growth Chart ─────────────────────────────────────────────────

function CapacityChart() {
  const W = 520;
  const H = 200;
  const pad = { top: 16, right: 16, bottom: 32, left: 48 };

  const maxVal = Math.max(...CAPACITY_DATA.map((d) => d.solar + d.wind + d.storage));
  const years = CAPACITY_DATA.map((d) => d.year);
  const minYear = years[0];
  const maxYear = years[years.length - 1];

  const xScale = (year: number) =>
    pad.left + ((year - minYear) / (maxYear - minYear)) * (W - pad.left - pad.right);
  const yScale = (val: number) =>
    H - pad.bottom - (val / (maxVal * 1.05)) * (H - pad.top - pad.bottom);

  function makePath(values: number[]): string {
    return CAPACITY_DATA.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.year).toFixed(1)},${yScale(values[i]).toFixed(1)}`).join(" ");
  }

  const solarPath = makePath(CAPACITY_DATA.map((d) => d.solar));
  const windPath = makePath(CAPACITY_DATA.map((d) => d.wind));
  const storagePath = makePath(CAPACITY_DATA.map((d) => d.storage));

  const yTicks = [0, 500, 1000, 1500, 2000, 2500];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid lines */}
      {yTicks.map((v) => (
        <line
          key={v}
          x1={pad.left}
          y1={yScale(v)}
          x2={W - pad.right}
          y2={yScale(v)}
          stroke="#1f2937"
          strokeDasharray="3,3"
        />
      ))}
      {/* Y labels */}
      {yTicks.map((v) => (
        <text key={v} x={pad.left - 4} y={yScale(v) + 4} textAnchor="end" fontSize={9} fill="#6b7280">
          {v}
        </text>
      ))}
      {/* X labels */}
      {CAPACITY_DATA.filter((_, i) => i % 2 === 0).map((d) => (
        <text key={d.year} x={xScale(d.year)} y={H - 4} textAnchor="middle" fontSize={9} fill="#6b7280">
          {d.year}
        </text>
      ))}
      {/* Lines */}
      <path d={solarPath} fill="none" stroke="#f59e0b" strokeWidth={2} />
      <path d={windPath} fill="none" stroke="#3b82f6" strokeWidth={2} />
      <path d={storagePath} fill="none" stroke="#10b981" strokeWidth={2} />
      {/* Legend */}
      {[
        { color: "#f59e0b", label: "Solar (GW)" },
        { color: "#3b82f6", label: "Wind (GW)" },
        { color: "#10b981", label: "Storage (GW)" },
      ].map((l, i) => (
        <g key={l.label} transform={`translate(${pad.left + i * 105}, ${pad.top})`}>
          <rect width={10} height={3} y={-1} fill={l.color} rx={1} />
          <text x={13} y={3} fontSize={9} fill="#9ca3af">
            {l.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── SVG Learning Curve ────────────────────────────────────────────────────────

function LearningCurveChart() {
  const W = 520;
  const H = 200;
  const pad = { top: 16, right: 16, bottom: 32, left: 54 };

  const solarCosts = [
    { year: 2010, cost: 380 },
    { year: 2012, cost: 260 },
    { year: 2014, cost: 165 },
    { year: 2016, cost: 100 },
    { year: 2018, cost: 68 },
    { year: 2020, cost: 43 },
    { year: 2022, cost: 33 },
    { year: 2024, cost: 25 },
  ];
  const windCosts = [
    { year: 2010, cost: 135 },
    { year: 2012, cost: 110 },
    { year: 2014, cost: 90 },
    { year: 2016, cost: 70 },
    { year: 2018, cost: 52 },
    { year: 2020, cost: 40 },
    { year: 2022, cost: 30 },
    { year: 2024, cost: 26 },
  ];

  const years = solarCosts.map((d) => d.year);
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const maxCost = 400;

  const xScale = (year: number) =>
    pad.left + ((year - minYear) / (maxYear - minYear)) * (W - pad.left - pad.right);
  const yScale = (cost: number) =>
    H - pad.bottom - (cost / maxCost) * (H - pad.top - pad.bottom);

  const toPath = (pts: { year: number; cost: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.year).toFixed(1)},${yScale(p.cost).toFixed(1)}`).join(" ");

  const yTicks = [0, 100, 200, 300, 400];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {yTicks.map((v) => (
        <line key={v} x1={pad.left} y1={yScale(v)} x2={W - pad.right} y2={yScale(v)} stroke="#1f2937" strokeDasharray="3,3" />
      ))}
      {yTicks.map((v) => (
        <text key={v} x={pad.left - 4} y={yScale(v) + 4} textAnchor="end" fontSize={9} fill="#6b7280">
          ${v}
        </text>
      ))}
      {solarCosts.filter((_, i) => i % 2 === 0).map((d) => (
        <text key={d.year} x={xScale(d.year)} y={H - 4} textAnchor="middle" fontSize={9} fill="#6b7280">
          {d.year}
        </text>
      ))}
      <path d={toPath(solarCosts)} fill="none" stroke="#f59e0b" strokeWidth={2} />
      <path d={toPath(windCosts)} fill="none" stroke="#3b82f6" strokeWidth={2} />
      {[
        { color: "#f59e0b", label: "Solar LCOE ($/MWh)" },
        { color: "#3b82f6", label: "Wind LCOE ($/MWh)" },
      ].map((l, i) => (
        <g key={l.label} transform={`translate(${pad.left + i * 155}, ${pad.top})`}>
          <rect width={10} height={3} y={-1} fill={l.color} rx={1} />
          <text x={13} y={3} fontSize={9} fill="#9ca3af">
            {l.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── SVG Battery Cost Chart ────────────────────────────────────────────────────

function BatteryCostChart({ data }: { data: StoragePoint[] }) {
  const W = 520;
  const H = 200;
  const pad = { top: 16, right: 16, bottom: 32, left: 54 };

  const maxCost = 800;
  const years = data.map((d) => d.year);
  const minYear = years[0];
  const maxYear = years[years.length - 1];

  const xScale = (year: number) =>
    pad.left + ((year - minYear) / (maxYear - minYear)) * (W - pad.left - pad.right);
  const yScale = (cost: number) =>
    H - pad.bottom - (cost / maxCost) * (H - pad.top - pad.bottom);

  const pathD = data
    .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.year).toFixed(1)},${yScale(p.cost).toFixed(1)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L${xScale(maxYear).toFixed(1)},${yScale(0).toFixed(1)} L${xScale(minYear).toFixed(1)},${yScale(0).toFixed(1)} Z`;

  const yTicks = [0, 200, 400, 600, 800];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="battGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
        </linearGradient>
      </defs>
      {yTicks.map((v) => (
        <line key={v} x1={pad.left} y1={yScale(v)} x2={W - pad.right} y2={yScale(v)} stroke="#1f2937" strokeDasharray="3,3" />
      ))}
      {yTicks.map((v) => (
        <text key={v} x={pad.left - 4} y={yScale(v) + 4} textAnchor="end" fontSize={9} fill="#6b7280">
          ${v}
        </text>
      ))}
      {data.map((d) => (
        <text key={d.year} x={xScale(d.year)} y={H - 4} textAnchor="middle" fontSize={9} fill="#6b7280">
          {d.year}
        </text>
      ))}
      <path d={areaD} fill="url(#battGrad)" />
      <path d={pathD} fill="none" stroke="#10b981" strokeWidth={2} />
      {data.map((d) => (
        <circle key={d.year} cx={xScale(d.year)} cy={yScale(d.cost)} r={3} fill="#10b981" />
      ))}
      <text x={pad.left + 8} y={pad.top + 10} fontSize={9} fill="#9ca3af">
        Battery Pack Cost ($/kWh)
      </text>
    </svg>
  );
}

// ── SVG EV Adoption Chart ─────────────────────────────────────────────────────

function EvAdoptionChart({ data }: { data: EvAdoptionPoint[] }) {
  const W = 520;
  const H = 160;
  const pad = { top: 16, right: 16, bottom: 28, left: 40 };

  const years = data.map((d) => d.year);
  const minYear = years[0];
  const maxYear = years[years.length - 1];

  const xScale = (year: number) =>
    pad.left + ((year - minYear) / (maxYear - minYear)) * (W - pad.left - pad.right);
  const yScale = (val: number) =>
    H - pad.bottom - (val / 55) * (H - pad.top - pad.bottom);

  const pathD = data
    .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.year).toFixed(1)},${yScale(p.share).toFixed(1)}`)
    .join(" ");
  const areaD =
    pathD +
    ` L${xScale(maxYear).toFixed(1)},${yScale(0).toFixed(1)} L${xScale(minYear).toFixed(1)},${yScale(0).toFixed(1)} Z`;

  const yTicks = [0, 10, 20, 30, 40, 50];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
        </linearGradient>
      </defs>
      {yTicks.map((v) => (
        <line key={v} x1={pad.left} y1={yScale(v)} x2={W - pad.right} y2={yScale(v)} stroke="#1f2937" strokeDasharray="3,3" />
      ))}
      {yTicks.map((v) => (
        <text key={v} x={pad.left - 4} y={yScale(v) + 4} textAnchor="end" fontSize={9} fill="#6b7280">
          {v}%
        </text>
      ))}
      {data.filter((_, i) => i % 2 === 0).map((d) => (
        <text key={d.year} x={xScale(d.year)} y={H - 4} textAnchor="middle" fontSize={8} fill="#6b7280">
          {d.year}
        </text>
      ))}
      <path d={areaD} fill="url(#evGrad)" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2} />
    </svg>
  );
}

// ── SVG Policy Timeline ───────────────────────────────────────────────────────

function PolicyTimelineChart() {
  const W = 560;
  const H = 140;
  const pad = { left: 20, right: 20, top: 24, bottom: 8 };
  const minYear = 2014;
  const maxYear = 2026;

  const xScale = (year: number) =>
    pad.left + ((year - minYear) / (maxYear - minYear)) * (W - pad.left - pad.right);

  const impactColor = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };
  const impactY = { high: pad.top, medium: pad.top + 44, low: pad.top + 88 };

  const xTicks = [2015, 2017, 2019, 2021, 2023, 2025];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Row lines */}
      {(["high", "medium", "low"] as const).map((impact) => (
        <line
          key={impact}
          x1={pad.left}
          y1={impactY[impact] + 12}
          x2={W - pad.right}
          y2={impactY[impact] + 12}
          stroke="#1f2937"
        />
      ))}
      {/* Labels */}
      {(["High", "Medium", "Low"] as const).map((label, i) => {
        const impact = label.toLowerCase() as "high" | "medium" | "low";
        return (
          <text key={label} x={pad.left} y={impactY[impact] + 9} fontSize={8} fill={impactColor[impact]}>
            {label}
          </text>
        );
      })}
      {/* X axis ticks */}
      {xTicks.map((y) => (
        <text key={y} x={xScale(y)} y={H - 2} fontSize={8} fill="#6b7280" textAnchor="middle">
          {y}
        </text>
      ))}
      {/* Events */}
      {POLICY_TIMELINE.map((item) => (
        <g key={item.event} transform={`translate(${xScale(item.year)}, ${impactY[item.impact]})`}>
          <circle cy={12} r={5} fill={impactColor[item.impact]} opacity={0.85} />
          <text y={4} fontSize={7.5} fill="#e5e7eb" textAnchor="middle" dy={-4}>
            {item.year === 2022 ? "IRA" : item.year === 2015 ? "Paris" : item.year === 2019 ? "EGD" : ""}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CleantechPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const storageCosts = useMemo(() => generateStorageCosts(), []);
  const evAdoption = useMemo(() => generateEvAdoption(), []);

  const capacityLatest = CAPACITY_DATA[CAPACITY_DATA.length - 1];
  const capacityFirst = CAPACITY_DATA[0];

  const solarGrowth = (((capacityLatest.solar - capacityFirst.solar) / capacityFirst.solar) * 100).toFixed(0);
  const windGrowth = (((capacityLatest.wind - capacityFirst.wind) / capacityFirst.wind) * 100).toFixed(0);


  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-100">Clean Technology & Energy Transition</h1>
        </div>
        <p className="text-gray-400 text-sm ml-12">
          Renewable capacity, cost trajectories, investment vehicles, and policy landscape
        </p>
      </div>

      {/* KPI Bar */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        {[
          { label: "Global Solar GW", value: capacityLatest.solar.toLocaleString(), icon: Sun, color: "text-amber-400", sub: `+${solarGrowth}% since 2015` },
          { label: "Global Wind GW", value: capacityLatest.wind.toLocaleString(), icon: Wind, color: "text-blue-400", sub: `+${windGrowth}% since 2015` },
          { label: "Storage GW (Grid)", value: capacityLatest.storage.toLocaleString(), icon: Battery, color: "text-emerald-400", sub: "Grid-scale deployed" },
          { label: "Onshore Wind LCOE", value: "$26/MWh", icon: TrendingDown, color: "text-purple-400", sub: "Cheapest energy ever" },
        ].map((kpi) => (
          <div key={kpi.label}>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs">{kpi.label}</span>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
                <div className="text-gray-500 text-xs mt-1">{kpi.sub}</div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border border-gray-800 mb-6 flex-wrap h-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs">
            Energy Transition
          </TabsTrigger>
          <TabsTrigger value="solarwind" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-xs">
            Solar & Wind
          </TabsTrigger>
          <TabsTrigger value="storage" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-xs">
            Energy Storage
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs">
            Investment Vehicles
          </TabsTrigger>
          <TabsTrigger value="policy" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs">
            Policy & Subsidies
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Energy Transition Overview ─────────────────────────────── */}
        <TabsContent value="overview" className="data-[state=inactive]:hidden">
          <div>
            {/* Capacity Growth Chart */}
            <div>
              <Card className="bg-gray-900 border-gray-800 mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    Global Renewable Capacity Growth (GW, 2015–2025)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CapacityChart />
                </CardContent>
              </Card>
            </div>

            {/* LCOE Comparison */}
            <div>
              <Card className="bg-gray-900 border-gray-800 mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    Levelized Cost of Energy (LCOE) Comparison — 2025 $/MWh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {LCOE_DATA.map((row) => (
                      <div key={row.source} className="flex items-center gap-3">
                        <span className="text-gray-300 text-xs w-32 shrink-0">{row.source}</span>
                        <div className="flex-1 bg-gray-800 rounded-full h-4 relative overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(row.lcoe / 180) * 100}%`,
                              backgroundColor: row.color,
                              opacity: 0.85,
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold w-14 text-right" style={{ color: row.color }}>
                          ${row.lcoe}
                        </span>
                        {row.trend === "down" ? (
                          <TrendingDown className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : row.trend === "up" ? (
                          <TrendingUp className="w-3 h-3 text-red-400 shrink-0" />
                        ) : (
                          <span className="w-3 h-3 shrink-0" />
                        )}
                        <span className="text-gray-500 text-xs w-44 shrink-0 hidden md:block">{row.note}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* IEA Net Zero Pathway */}
            <div>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    IEA Net Zero Emissions 2050 Pathway
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left text-gray-400 py-2">Metric</th>
                          <th className="text-right text-gray-400 py-2">Current (2025)</th>
                          <th className="text-right text-gray-400 py-2">NZE 2030</th>
                          <th className="text-right text-amber-400 py-2">NZE 2050</th>
                        </tr>
                      </thead>
                      <tbody>
                        {NZE_PATHWAY.map((row) => (
                          <tr key={row.metric} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                            <td className="py-2 text-gray-300">{row.metric}</td>
                            <td className="py-2 text-right text-gray-200">{row.current}</td>
                            <td className="py-2 text-right text-blue-300">{row.nze2030}</td>
                            <td className="py-2 text-right text-amber-300 font-semibold">{row.nze2050}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>NZE = Net Zero Emissions scenario. Source: IEA World Energy Outlook 2024. Current values are 2025 estimates.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Solar & Wind ───────────────────────────────────────────── */}
        <TabsContent value="solarwind" className="data-[state=inactive]:hidden">
          <div>
            {/* Learning Curve */}
            <div>
              <Card className="bg-gray-900 border-gray-800 mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                    Technology Cost Learning Curves ($/MWh, 2010–2024)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LearningCurveChart />
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {[
                      { label: "Solar cost drop since 2010", value: "~93%", color: "text-amber-400" },
                      { label: "Wind cost drop since 2010", value: "~70%", color: "text-blue-400" },
                      { label: "Learning rate (solar)", value: "~24% per 2x", color: "text-amber-400" },
                      { label: "Learning rate (wind)", value: "~18% per 2x", color: "text-blue-400" },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-800 rounded p-2">
                        <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-gray-400">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Companies */}
            <div>
              <Card className="bg-gray-900 border-gray-800 mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    Leading Solar & Wind Companies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CLEAN_COMPANIES.map((co) => (
                      <div key={co.ticker} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <span className="font-semibold text-gray-100 text-sm">{co.ticker}</span>
                            <span className="text-gray-400 text-xs ml-2">{co.name}</span>
                          </div>
                          <span
                            className={`text-xs font-semibold ${co.ytdReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {co.ytdReturn >= 0 ? "+" : ""}
                            {co.ytdReturn.toFixed(1)}% YTD
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs text-gray-400 border-gray-700 mb-2">
                          {co.segment}
                        </Badge>
                        <p className="text-gray-400 text-xs">{co.description}</p>
                        <div className="mt-2 flex gap-4 text-xs">
                          <span className="text-gray-500">Mkt Cap: <span className="text-gray-300">${co.mktCap}B</span></span>
                          <span className="text-gray-500">P/E: <span className="text-gray-300">{co.pe ?? "N/A"}</span></span>
                          {co.capacityGW > 0 && (
                            <span className="text-gray-500">Capacity: <span className="text-emerald-400">{co.capacityGW} GW</span></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Capacity Factors & Grid Parity */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Capacity Factor Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      {[
                        { tech: "Offshore Wind", cf: 45, color: "#6366f1" },
                        { tech: "Onshore Wind", cf: 32, color: "#3b82f6" },
                        { tech: "Utility Solar PV", cf: 24, color: "#f59e0b" },
                        { tech: "Residential Solar", cf: 18, color: "#fbbf24" },
                        { tech: "Nuclear", cf: 92, color: "#8b5cf6" },
                        { tech: "Gas Peaker", cf: 15, color: "#ef4444" },
                      ].map((item) => (
                        <div key={item.tech} className="flex items-center gap-2">
                          <span className="text-gray-300 w-36 shrink-0">{item.tech}</span>
                          <div className="flex-1 bg-gray-800 rounded-full h-3">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${item.cf}%`, backgroundColor: item.color, opacity: 0.85 }}
                            />
                          </div>
                          <span className="text-gray-300 w-8 text-right">{item.cf}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Grid Parity Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      {[
                        { year: "2013", region: "Germany residential solar", status: "achieved" },
                        { year: "2015", region: "US utility-scale solar vs gas", status: "achieved" },
                        { year: "2017", region: "Onshore wind vs new coal globally", status: "achieved" },
                        { year: "2020", region: "Solar cheaper than existing coal EU", status: "achieved" },
                        { year: "2023", region: "Offshore wind approaches parity UK", status: "achieved" },
                        { year: "2027", region: "Green hydrogen cost-competitive (est.)", status: "pending" },
                      ].map((m) => (
                        <div key={m.region} className="flex items-start gap-2">
                          {m.status === "achieved" ? (
                            <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                          ) : (
                            <ArrowRight className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <span className="text-amber-400 font-medium mr-1">{m.year}</span>
                            <span className="text-gray-300">{m.region}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Energy Storage ──────────────────────────────────────────── */}
        <TabsContent value="storage" className="data-[state=inactive]:hidden">
          <div>
            {/* Battery Cost Chart */}
            <div>
              <Card className="bg-gray-900 border-gray-800 mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Battery className="w-4 h-4 text-emerald-400" />
                    Li-Ion Battery Pack Cost Trajectory ($/kWh, 2013–2030E)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BatteryCostChart data={storageCosts} />
                  <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>
                      BloombergNEF battery price survey. $100/kWh threshold widely considered inflection for EV cost parity
                      with ICE. 2027–2030 are estimates.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* EV Adoption Chart */}
            <div>
              <Card className="bg-gray-900 border-gray-800 mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-violet-400" />
                    EV Share of Global New Car Sales (%, 2015–2030E)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EvAdoptionChart data={evAdoption} />
                </CardContent>
              </Card>
            </div>

            {/* Grid-Scale Storage Economics */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Grid-Scale Storage Economics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-xs">
                      {[
                        {
                          metric: "4-hour Li-Ion BESS",
                          capex: "$280–350/kWh",
                          revenue: "Frequency regulation, capacity",
                          margin: "Positive IRR in ~12 markets",
                        },
                        {
                          metric: "Long Duration (8h+)",
                          capex: "$450–600/kWh",
                          revenue: "Energy arbitrage + capacity",
                          margin: "Requires $60+/MWh spread",
                        },
                        {
                          metric: "Flow Batteries (VRFB)",
                          capex: "$500–700/kWh",
                          revenue: "Daily cycling, 25yr life",
                          margin: "Niche industrial + islands",
                        },
                      ].map((item) => (
                        <div key={item.metric} className="bg-gray-800 rounded p-3">
                          <div className="font-semibold text-gray-200 mb-1">{item.metric}</div>
                          <div className="flex justify-between text-gray-400 mb-0.5">
                            <span>Capex:</span><span className="text-amber-400">{item.capex}</span>
                          </div>
                          <div className="flex justify-between text-gray-400 mb-0.5">
                            <span>Revenue streams:</span><span className="text-gray-300 text-right ml-2">{item.revenue}</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Economics:</span><span className="text-emerald-400">{item.margin}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Green Hydrogen Economics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-xs">
                      <div className="bg-gray-800 rounded p-3">
                        <div className="font-semibold text-gray-200 mb-2">Production Cost by Route ($/kg H₂)</div>
                        {[
                          { route: "Grey (SMR from gas)", cost: 1.5, color: "#6b7280" },
                          { route: "Blue (SMR + CCS)", cost: 2.8, color: "#3b82f6" },
                          { route: "Green (Electrolysis)", cost: 4.5, color: "#10b981" },
                          { route: "Green 2030E (IEA NZE)", cost: 2.0, color: "#34d399" },
                        ].map((r) => (
                          <div key={r.route} className="flex items-center gap-2 mb-1">
                            <span className="text-gray-400 w-36 shrink-0">{r.route}</span>
                            <div className="flex-1 bg-gray-700 rounded-full h-2.5">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${(r.cost / 5) * 100}%`, backgroundColor: r.color }}
                              />
                            </div>
                            <span style={{ color: r.color }} className="w-12 text-right font-semibold">
                              ${r.cost}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-800 rounded p-3">
                        <div className="font-semibold text-gray-200 mb-1">Key Cost Drivers</div>
                        <ul className="text-gray-400 space-y-1">
                          <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 mt-0.5 text-amber-400 shrink-0" />Electricity cost: ~65–70% of green H₂ cost</li>
                          <li className="flex items-start gap-1.5"><Battery className="w-3 h-3 mt-0.5 text-emerald-400 shrink-0" />Electrolyzer capex declining ~18%/yr</li>
                          <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 mt-0.5 text-blue-400 shrink-0" />IRA 45V credit: up to $3/kg incentive</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 4: Investment Vehicles ─────────────────────────────────────── */}
        <TabsContent value="vehicles" className="data-[state=inactive]:hidden">
          <div>
            {/* ETF Table */}
            <div>
              <Card className="bg-gray-900 border-gray-800 mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-blue-400" />
                    Clean Energy ETFs Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left text-gray-400 py-2">Ticker</th>
                          <th className="text-left text-gray-400 py-2 hidden md:table-cell">Name</th>
                          <th className="text-right text-gray-400 py-2">AUM ($B)</th>
                          <th className="text-right text-gray-400 py-2">Exp. Ratio</th>
                          <th className="text-right text-gray-400 py-2">YTD</th>
                          <th className="text-right text-gray-400 py-2 hidden md:table-cell">Holdings</th>
                          <th className="text-left text-gray-400 py-2 hidden lg:table-cell">Focus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CLEAN_ETFS.map((etf) => (
                          <tr key={etf.ticker} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                            <td className="py-2 font-semibold text-blue-300">{etf.ticker}</td>
                            <td className="py-2 text-gray-300 hidden md:table-cell">{etf.name}</td>
                            <td className="py-2 text-right text-gray-200">{etf.aum.toFixed(2)}</td>
                            <td className="py-2 text-right text-gray-200">{etf.expenseRatio.toFixed(2)}%</td>
                            <td className={`py-2 text-right font-semibold ${etf.ytd >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {etf.ytd >= 0 ? "+" : ""}
                              {etf.ytd.toFixed(1)}%
                            </td>
                            <td className="py-2 text-right text-gray-300 hidden md:table-cell">{etf.holdings}</td>
                            <td className="py-2 text-gray-400 hidden lg:table-cell">{etf.focus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-xs text-gray-500 flex items-start gap-2">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>Top holding for each ETF as of Q1 2026. AUM in USD billions. YTD performance through March 2026.</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* YieldCo & Green Bonds */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">YieldCo Structures</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <p className="text-gray-400">
                      YieldCos are publicly listed subsidiaries that own contracted, cash-flowing renewable energy assets.
                      They distribute most of their cash flows as dividends.
                    </p>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="font-semibold text-gray-200 mb-2">Key Characteristics</div>
                      <ul className="space-y-1 text-gray-400">
                        <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />Long-term PPAs (15–25 yr) provide stable cash flows</li>
                        <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />Target dividend yield: 4–7%; dividend growth: 5–8%/yr</li>
                        <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />Leverage: typically 60–70% debt/capital</li>
                        <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />Drop-down pipeline from sponsor company</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="font-semibold text-gray-200 mb-1">Notable YieldCos</div>
                      <div className="grid grid-cols-2 gap-1 text-gray-300">
                        {["BEP (Brookfield Renewable)", "NEP (NextEra Energy Partners)", "CWEN (Clearway Energy)", "AY (Atlantica Sustainable)"].map((n) => (
                          <div key={n} className="text-xs">{n}</div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Green Bonds & Infrastructure Funds</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="bg-gray-800 rounded p-3">
                      <div className="font-semibold text-gray-200 mb-2">Green Bond Market (2025)</div>
                      {[
                        { label: "Annual issuance", value: "$620B" },
                        { label: "Cumulative outstanding", value: "$4.2T" },
                        { label: "Avg yield premium vs vanilla", value: "−5 to −8 bps (greenium)" },
                        { label: "Largest issuers", value: "EU, China, US, Germany" },
                      ].map((r) => (
                        <div key={r.label} className="flex justify-between text-gray-400 mb-1">
                          <span>{r.label}</span>
                          <span className="text-gray-200 font-medium">{r.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="font-semibold text-gray-200 mb-2">Infrastructure Fund Examples</div>
                      {[
                        { name: "Macquarie Green Infrastructure", focus: "Solar/Wind/Storage, global" },
                        { name: "Blackrock Climate Finance", focus: "Transition assets, private credit" },
                        { name: "EQT Infrastructure", focus: "Digitization + clean energy mix" },
                        { name: "Copenhagen Infrastructure", focus: "Offshore wind specialist" },
                      ].map((f) => (
                        <div key={f.name} className="mb-1">
                          <span className="text-emerald-400 font-medium">{f.name}: </span>
                          <span className="text-gray-400">{f.focus}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Risk factors */}
            <div>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-400">Key Investment Risks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {[
                      { title: "Interest Rate Sensitivity", desc: "YieldCos and green bonds are long-duration assets highly sensitive to rate moves. Rising rates compress valuations." },
                      { title: "Policy Reversal Risk", desc: "Subsidies and tax credits can be reduced or eliminated. IRA rollback risk elevated post-election cycles." },
                      { title: "Grid Integration Costs", desc: "Curtailment, transmission congestion, and integration costs can reduce effective returns for solar/wind projects." },
                    ].map((r) => (
                      <div key={r.title} className="bg-gray-800 rounded p-3 border border-amber-900/30">
                        <div className="font-semibold text-amber-300 mb-1">{r.title}</div>
                        <p className="text-gray-400">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 5: Policy & Subsidies ─────────────────────────────────────── */}
        <TabsContent value="policy" className="data-[state=inactive]:hidden">
          <div>
            {/* IRA Highlights */}
            <div>
              <Card className="bg-gray-900 border-gray-800 mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    US Inflation Reduction Act (IRA) — Key Tax Credits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                      { credit: "Investment Tax Credit (ITC) §48E", amount: "30–50%", desc: "Solar, wind, storage, geothermal. Bonus for domestic content (+10%) and energy communities (+10%)." },
                      { credit: "Production Tax Credit (PTC) §45Y", amount: "$27.5/MWh", desc: "Wind, solar, hydro, nuclear. Inflation adjusted. 10-year credit period per project." },
                      { credit: "Clean Hydrogen Credit §45V", amount: "Up to $3/kg", desc: "Tiered: 4 tiers based on lifecycle emissions intensity. Lowest carbon hydrogen gets full $3/kg." },
                      { credit: "Manufacturing Credit §45X", amount: "Varies", desc: "Solar cells ($4/W), wind components, battery cells ($35/kWh), critical minerals. No cap." },
                      { credit: "EV Consumer Credit §30D", amount: "$7,500", desc: "New EV tax credit. Income limits apply. Vehicle must meet North American final assembly rules." },
                      { credit: "Commercial EV Credit §45W", amount: "Up to $7,500", desc: "For commercial EVs and fleet vehicles. No domestic assembly requirement." },
                    ].map((item) => (
                      <div key={item.credit} className="bg-gray-800 rounded p-3">
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-semibold text-gray-200">{item.credit}</span>
                          <Badge className="bg-green-900/50 text-green-300 border-green-800 text-xs ml-2 shrink-0">{item.amount}</Badge>
                        </div>
                        <p className="text-gray-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Policy Timeline */}
            <div>
              <Card className="bg-gray-900 border-gray-800 mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Global Policy Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PolicyTimelineChart />
                  <div className="mt-3 space-y-2">
                    {POLICY_TIMELINE.map((item) => {
                      const impactColors = {
                        high: "bg-red-900/40 border-red-800 text-red-300",
                        medium: "bg-amber-900/40 border-amber-800 text-amber-300",
                        low: "bg-emerald-900/40 border-emerald-800 text-emerald-300",
                      };
                      return (
                        <div key={item.event} className={`border rounded p-2 text-xs ${impactColors[item.impact]}`}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold">{item.year}</span>
                            <Badge variant="outline" className="text-xs border-current py-0">{item.region}</Badge>
                            <span className="font-semibold">{item.event}</span>
                          </div>
                          <p className="text-gray-400">{item.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Carbon Pricing */}
            <div>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Carbon Pricing Impact — Global ETS Systems
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left text-gray-400 py-2">Region / System</th>
                          <th className="text-right text-gray-400 py-2">Price ($/tCO₂)</th>
                          <th className="text-right text-gray-400 py-2">Coverage (%)</th>
                          <th className="text-left text-gray-400 py-2 hidden md:table-cell">Mechanism</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CARBON_PRICES.map((row) => (
                          <tr key={row.region} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                            <td className="py-2 text-gray-200">{row.region}</td>
                            <td className="py-2 text-right">
                              <span
                                className={`font-semibold ${row.priceUsd >= 50 ? "text-red-400" : row.priceUsd >= 30 ? "text-amber-400" : "text-gray-300"}`}
                              >
                                ${row.priceUsd}
                              </span>
                            </td>
                            <td className="py-2 text-right text-gray-300">{row.coverage}%</td>
                            <td className="py-2 text-gray-400 hidden md:table-cell">{row.mechanism}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 bg-gray-800 rounded p-3 text-xs">
                    <div className="font-semibold text-gray-200 mb-2">Impact on Fossil vs Renewables</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-red-400 font-medium mb-1">Fossil Fuel Cost Increase ($/MWh added)</div>
                        {[
                          { source: "Coal (at $68/tCO₂)", increase: "+$68" },
                          { source: "Gas CCGT (at $68/tCO₂)", increase: "+$27" },
                          { source: "Gas Peaker (at $68/tCO₂)", increase: "+$34" },
                        ].map((r) => (
                          <div key={r.source} className="flex justify-between text-gray-400 py-0.5">
                            <span>{r.source}</span>
                            <span className="text-red-400 font-semibold">{r.increase}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="text-emerald-400 font-medium mb-1">Renewables Benefit</div>
                        <ul className="space-y-1 text-gray-400">
                          <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />Widens cost advantage of solar/wind over fossils</li>
                          <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />Improves dispatch priority in merit-order markets</li>
                          <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />EU CBAM creates level playing field vs imports</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer disclaimer */}
      <div className="mt-6 flex items-start gap-2 text-xs text-gray-600">
        <Info className="w-3 h-3 mt-0.5 shrink-0" />
        <span>
          FinSim educational simulation. Data and projections are illustrative, derived from IEA, BloombergNEF, and IRENA
          public reports. Not financial advice. Actual investments involve market risk.
        </span>
      </div>
    </div>
  );
}
