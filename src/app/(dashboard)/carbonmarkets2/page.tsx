"use client";

import { useState, useMemo } from "react";
import {
  Leaf,
  Globe,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Zap,
  Droplets,
  BarChart2,
  Info,
  Factory,
  Plane,
  TreePine,
  Flame,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 870;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function rb(lo: number, hi: number) {
  return lo + rand() * (hi - lo);
}
function ri(lo: number, hi: number) {
  return Math.floor(rb(lo, hi + 1));
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface EuEtsPrice {
  year: string;
  price: number;
  label?: string;
}

interface CreditType {
  name: string;
  abbr: string;
  registry: string;
  priceMin: number;
  priceMax: number;
  volume: number; // Mt CO2e 2023
  color: string;
  icon: React.ReactNode;
}

interface NbsProject {
  name: string;
  type: string;
  coBeeBio: number;
  coBeeComm: number;
  coBeeWater: number;
  permanenceRisk: "Low" | "Medium" | "High";
  tenureRisk: "Low" | "Medium" | "High";
  region: string;
  creditPerHa: number;
}

interface CorporateEntity {
  name: string;
  sector: string;
  scope1: number;
  scope2: number;
  scope3: number;
  netZeroYear: number;
  sbtAligned: boolean;
  offsetQuality: "Tier 1" | "Tier 2" | "Tier 3";
  offsetPct: number; // % of emissions offset externally
  abatementCost: number; // $/tonne internal
}

interface AbatementPoint {
  measure: string;
  cost: number; // $/tonne
  potential: number; // Mt CO2e
}

// ── EU ETS Data ────────────────────────────────────────────────────────────────

const EU_ETS_PRICES: EuEtsPrice[] = [
  { year: "2015", price: 7.6 },
  { year: "2016", price: 5.3 },
  { year: "2017", price: 6.1 },
  { year: "2018", price: 15.8, label: "MSR reform" },
  { year: "2019", price: 24.7 },
  { year: "2020", price: 27.0 },
  { year: "2021", price: 53.6, label: "Fit for 55" },
  { year: "2022", price: 81.2 },
  { year: "2023", price: 87.3, label: "Peak" },
  { year: "2024", price: 59.4, label: "Correction" },
];

const CAP_TRAJECTORY = [
  { year: "2020", cap: 1815 },
  { year: "2021", cap: 1756 },
  { year: "2022", cap: 1698 },
  { year: "2023", cap: 1579 },
  { year: "2024", cap: 1462 },
  { year: "2025", cap: 1345 },
  { year: "2026", cap: 1228 },
  { year: "2027", cap: 1111 },
  { year: "2028", cap: 994 },
  { year: "2030", cap: 760 },
];

const SECTOR_COVERAGE = [
  { sector: "Power Generation", icon: <Zap size={14} />, coverage: "100%", freeAlloc: "0%", phase: "Phase 4", color: "text-yellow-400" },
  { sector: "Aviation (EU)", icon: <Plane size={14} />, coverage: "~70%", freeAlloc: "25%", phase: "Phase 4", color: "text-primary" },
  { sector: "Heavy Industry", icon: <Factory size={14} />, coverage: "~50%", freeAlloc: "60%", phase: "Phase 4", color: "text-orange-400" },
  { sector: "Maritime (new)", icon: <Globe size={14} />, coverage: "50%→100%", freeAlloc: "0%", phase: "Phase 4+", color: "text-muted-foreground" },
  { sector: "Buildings (ETS2)", icon: <Flame size={14} />, coverage: "100%", freeAlloc: "0%", phase: "ETS2 2027", color: "text-red-400" },
  { sector: "Road Transport (ETS2)", icon: <TrendingUp size={14} />, coverage: "100%", freeAlloc: "0%", phase: "ETS2 2027", color: "text-primary" },
];

// ── Voluntary Carbon Market Data ──────────────────────────────────────────────

const CREDIT_TYPES: CreditType[] = [
  {
    name: "REDD+ Avoided Deforestation",
    abbr: "REDD+",
    registry: "Verra VCS",
    priceMin: 2,
    priceMax: 18,
    volume: 180,
    color: "#22c55e",
    icon: <TreePine size={14} />,
  },
  {
    name: "Renewable Energy",
    abbr: "RE",
    registry: "Gold Standard / VCS",
    priceMin: 1,
    priceMax: 6,
    volume: 95,
    color: "#eab308",
    icon: <Zap size={14} />,
  },
  {
    name: "Improved Cookstoves",
    abbr: "ICS",
    registry: "Gold Standard",
    priceMin: 8,
    priceMax: 25,
    volume: 55,
    color: "#f97316",
    icon: <Flame size={14} />,
  },
  {
    name: "Blue Carbon (Mangrove/Seagrass)",
    abbr: "Blue C",
    registry: "Verra VCS / ART",
    priceMin: 15,
    priceMax: 50,
    volume: 12,
    color: "#06b6d4",
    icon: <Droplets size={14} />,
  },
  {
    name: "Direct Air Capture",
    abbr: "DAC",
    registry: "Puro.earth / Isometric",
    priceMin: 200,
    priceMax: 1000,
    volume: 0.4,
    color: "#a855f7",
    icon: <Globe size={14} />,
  },
];

const QUALITY_CRITERIA = [
  {
    criterion: "Additionality",
    description: "Emissions reductions must be beyond business-as-usual. Credits fail if renewable energy projects would have been built anyway.",
    pass: 3,
    fail: 2,
    key: "additionality",
  },
  {
    criterion: "Permanence",
    description: "Stored carbon must remain sequestered. Forest projects face reversal risk from fire, disease, or policy change.",
    pass: 2,
    fail: 3,
    key: "permanence",
  },
  {
    criterion: "MRV",
    description: "Measurement, Reporting & Verification must be robust, third-party audited, and based on conservative baselines.",
    pass: 4,
    fail: 1,
    key: "mrv",
  },
  {
    criterion: "No Double Counting",
    description: "Credits cannot be claimed by both seller country (NDC) and buyer. Corresponding adjustments under Article 6 are critical.",
    pass: 1,
    fail: 4,
    key: "doublecounting",
  },
  {
    criterion: "Co-Benefits",
    description: "Biodiversity, community livelihood, and water benefits enhance credit quality and price premium.",
    pass: 4,
    fail: 1,
    key: "cobenefits",
  },
];

const GREENWASHING_CASES = [
  {
    company: "Delta Airlines",
    claim: "Carbon neutral by 2030 via offsets",
    issue: "Relied on REDD+ credits later found non-additional; guardian analysis showed only 5-10% of claimed reductions real",
    severity: "High",
  },
  {
    company: "Volkswagen",
    claim: "Offset entire Golf production line",
    issue: "Credits retired were cheap RE certificates in regions that had already transitioned; no real additionality",
    severity: "Medium",
  },
  {
    company: "Shell",
    claim: "Drive CO2 neutral with NBS offsets",
    issue: "Investigations found over-crediting in Nature Conservation projects; EU ad ban upheld",
    severity: "High",
  },
  {
    company: "South Pole / Kariba",
    claim: "Gold Standard REDD+ Kariba Zimbabwe",
    issue: "Watershed moment: independent analysis showed 94%+ of credits lacked additionality; project suspended 2023",
    severity: "Critical",
  },
];

// ── Nature-Based Solutions Data ────────────────────────────────────────────────

const NBS_PROJECTS: NbsProject[] = [
  { name: "Amazon Frontier Avoided Deforestation", type: "REDD+", coBeeBio: 95, coBeeComm: 72, coBeeWater: 88, permanenceRisk: "High", tenureRisk: "High", region: "Brazil", creditPerHa: 8.2 },
  { name: "Borneo Peatland Restoration", type: "ARR/Peatland", coBeeBio: 92, coBeeComm: 65, coBeeWater: 94, permanenceRisk: "Medium", tenureRisk: "Medium", region: "Indonesia", creditPerHa: 12.4 },
  { name: "Kenya Blue Carbon Mangrove", type: "Blue Carbon", coBeeBio: 88, coBeeComm: 90, coBeeWater: 85, permanenceRisk: "Low", tenureRisk: "Medium", region: "East Africa", creditPerHa: 28.6 },
  { name: "Scotland Blanket Bog Restoration", type: "Wetland", coBeeBio: 80, coBeeComm: 55, coBeeWater: 92, permanenceRisk: "Low", tenureRisk: "Low", region: "UK", creditPerHa: 18.2 },
  { name: "Patagonia Reforestation", type: "ARR", coBeeBio: 75, coBeeComm: 68, coBeeWater: 70, permanenceRisk: "Low", tenureRisk: "Low", region: "Chile/Argentina", creditPerHa: 9.5 },
  { name: "Gulf of Mexico Seagrass", type: "Blue Carbon", coBeeBio: 85, coBeeComm: 60, coBeeWater: 88, permanenceRisk: "Medium", tenureRisk: "Low", region: "USA/Mexico", creditPerHa: 32.1 },
];

const ICVCM_PRINCIPLES = [
  { id: "CCP-1", name: "Governance", desc: "Robust program-level governance with public accountability and transparent decision-making processes." },
  { id: "CCP-2", name: "Tracking", desc: "Unique serial numbers and public registry for each credit to prevent double issuance and double claiming." },
  { id: "CCP-3", name: "Transparency", desc: "Full methodology, project documentation, and verification reports publicly available." },
  { id: "CCP-4", name: "Robust QA/QC", desc: "Third-party validation and verification by accredited bodies against approved methodologies." },
  { id: "CCP-5", name: "Additionality", desc: "Conservative additionality tests ensuring projects go beyond business-as-usual baseline." },
  { id: "CCP-6", name: "Permanence", desc: "Adequate buffer pools (≥20% typically) to cover non-permanence risk over 100-year crediting horizon." },
  { id: "CCP-7", name: "Robust Quantification", desc: "No over-crediting; conservative baselines; independent third-party MRV." },
  { id: "CCP-8", name: "No Net Harm", desc: "Projects must not cause harm to local communities, ecosystems, or human rights." },
  { id: "CCP-9", name: "Sustainable Development", desc: "Co-benefits documented; community consultation and free prior informed consent (FPIC) required." },
  { id: "CCP-10", name: "No Double Counting", desc: "Corresponding adjustments required or clear disclosure when host country uses credit in NDC." },
];

// ── Corporate Strategy Data ────────────────────────────────────────────────────

const CORPORATE_ENTITIES: CorporateEntity[] = [
  { name: "TotalEnergies", sector: "Energy", scope1: 18.2, scope2: 2.1, scope3: 420, netZeroYear: 2050, sbtAligned: false, offsetQuality: "Tier 2", offsetPct: 12, abatementCost: 45 },
  { name: "Maersk", sector: "Shipping", scope1: 9.4, scope2: 0.4, scope3: 15, netZeroYear: 2040, sbtAligned: true, offsetQuality: "Tier 1", offsetPct: 5, abatementCost: 120 },
  { name: "Microsoft", sector: "Technology", scope1: 0.2, scope2: 0.6, scope3: 14.2, netZeroYear: 2030, sbtAligned: true, offsetQuality: "Tier 1", offsetPct: 3, abatementCost: 200 },
  { name: "Apple", sector: "Technology", scope1: 0.04, scope2: 0.1, scope3: 22.6, netZeroYear: 2030, sbtAligned: true, offsetQuality: "Tier 1", offsetPct: 2, abatementCost: 175 },
  { name: "BP", sector: "Energy", scope1: 21.0, scope2: 1.8, scope3: 510, netZeroYear: 2050, sbtAligned: false, offsetQuality: "Tier 3", offsetPct: 18, abatementCost: 30 },
  { name: "Unilever", sector: "Consumer Goods", scope1: 0.9, scope2: 1.1, scope3: 54, netZeroYear: 2039, sbtAligned: true, offsetQuality: "Tier 2", offsetPct: 8, abatementCost: 85 },
];

const ABATEMENT_CURVE: AbatementPoint[] = [
  { measure: "LED Lighting & Building Efficiency", cost: -40, potential: 8.2 },
  { measure: "Industrial Process Electrification", cost: -15, potential: 12.4 },
  { measure: "Onshore Wind (LCOE parity)", cost: 5, potential: 28.0 },
  { measure: "Solar PV Utility Scale", cost: 8, potential: 35.0 },
  { measure: "Electric Vehicles (fleet)", cost: 25, potential: 18.0 },
  { measure: "CCUS (Industrial)", cost: 80, potential: 10.0 },
  { measure: "Green Hydrogen", cost: 120, potential: 15.0 },
  { measure: "NBS Offsets (REDD+)", cost: 15, potential: 6.0 },
  { measure: "NBS Offsets (Blue Carbon)", cost: 35, potential: 2.0 },
  { measure: "Direct Air Capture", cost: 450, potential: 0.8 },
];

// ── SVG helpers ────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// ── EU ETS Tab ─────────────────────────────────────────────────────────────────

function EuEtsTab() {
  const W = 680;
  const H = 220;
  const PAD = { t: 24, r: 20, b: 40, l: 50 };

  const prices = EU_ETS_PRICES.map((d) => d.price);
  const maxP = Math.max(...prices) * 1.08;
  const minP = 0;

  const xScale = (i: number) =>
    PAD.l + (i / (EU_ETS_PRICES.length - 1)) * (W - PAD.l - PAD.r);
  const yScale = (v: number) =>
    PAD.t + (1 - (v - minP) / (maxP - minP)) * (H - PAD.t - PAD.b);

  const linePath = EU_ETS_PRICES.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.price)}`).join(" ");
  const areaPath =
    linePath +
    ` L ${xScale(EU_ETS_PRICES.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;

  // Cap trajectory chart
  const capW = 680;
  const capH = 160;
  const capPad = { t: 16, r: 20, b: 36, l: 60 };
  const capVals = CAP_TRAJECTORY.map((d) => d.cap);
  const capMax = Math.max(...capVals) * 1.05;
  const capMin = Math.min(...capVals) * 0.92;
  const cx = (i: number) =>
    capPad.l + (i / (CAP_TRAJECTORY.length - 1)) * (capW - capPad.l - capPad.r);
  const cy = (v: number) =>
    capPad.t + (1 - (v - capMin) / (capMax - capMin)) * (capH - capPad.t - capPad.b);
  const capLine = CAP_TRAJECTORY.map((d, i) => `${i === 0 ? "M" : "L"} ${cx(i)} ${cy(d.cap)}`).join(" ");

  const yTicks = [0, 20, 40, 60, 80, 100];
  const capTicks = [800, 1000, 1200, 1400, 1600, 1800];

  return (
    <div className="space-y-6">
      {/* Allowance Price Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <BarChart2 size={15} className="text-primary" />
            EU ETS Allowance Price (EUA) 2015–2024 — €/tonne CO₂
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }}>
            <defs>
              <linearGradient id="euaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* Grid */}
            {yTicks.map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={W - PAD.r} y1={yScale(v)} y2={yScale(v)} stroke="#27272a" strokeWidth="1" />
                <text x={PAD.l - 6} y={yScale(v) + 4} textAnchor="end" fontSize="10" fill="#71717a">
                  €{v}
                </text>
              </g>
            ))}
            {/* Area */}
            <path d={areaPath} fill="url(#euaGrad)" />
            {/* Line */}
            <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Year labels */}
            {EU_ETS_PRICES.map((d, i) => (
              <text key={d.year} x={xScale(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#52525b">
                {d.year}
              </text>
            ))}
            {/* Annotation labels */}
            {EU_ETS_PRICES.filter((d) => d.label).map((d, i) => {
              const idx = EU_ETS_PRICES.findIndex((x) => x.year === d.year);
              return (
                <g key={`lbl-${i}`}>
                  <circle cx={xScale(idx)} cy={yScale(d.price)} r="4" fill="#3b82f6" />
                  <text x={xScale(idx)} y={yScale(d.price) - 9} textAnchor="middle" fontSize="9" fill="#93c5fd">
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cap Reduction */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <TrendingDown size={14} className="text-red-400" />
              Cap Reduction Trajectory (Mt CO₂e)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <svg viewBox={`0 0 ${capW} ${capH}`} className="w-full" style={{ height: 160 }}>
              {capTicks.map((v) => (
                <g key={v}>
                  <line x1={capPad.l} x2={capW - capPad.r} y1={cy(v)} y2={cy(v)} stroke="#27272a" strokeWidth="1" />
                  <text x={capPad.l - 6} y={cy(v) + 4} textAnchor="end" fontSize="9" fill="#71717a">
                    {v}
                  </text>
                </g>
              ))}
              <path d={capLine} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6 3" />
              {CAP_TRAJECTORY.map((d, i) => (
                <circle key={d.year} cx={cx(i)} cy={cy(d.cap)} r="3" fill="#ef4444" />
              ))}
              {CAP_TRAJECTORY.filter((_, i) => i % 2 === 0).map((d, i) => {
                const idx = CAP_TRAJECTORY.findIndex((x) => x.year === d.year);
                return (
                  <text key={`cap-yr-${i}`} x={cx(idx)} y={capH - 6} textAnchor="middle" fontSize="9" fill="#52525b">
                    {d.year}
                  </text>
                );
              })}
              <text x={capPad.l + 10} y={capPad.t + 14} fontSize="9" fill="#6b7280">
                Linear Reduction Factor 2.2% → 4.3% (post-2027)
              </text>
            </svg>
          </CardContent>
        </Card>

        {/* Allocation Split */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <BarChart2 size={14} className="text-emerald-400" />
              Free Allocation vs Auction Split
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {[
              { label: "Power Sector", free: 0, auction: 100, color: "bg-yellow-500" },
              { label: "Aviation", free: 25, auction: 75, color: "bg-primary" },
              { label: "Cement / Steel", free: 60, auction: 40, color: "bg-orange-500" },
              { label: "Glass / Ceramics", free: 55, auction: 45, color: "bg-pink-500" },
              { label: "Pulp & Paper", free: 70, auction: 30, color: "bg-lime-500" },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>{row.label}</span>
                  <span className="text-zinc-500">{row.free}% free / {row.auction}% auction</span>
                </div>
                <div className="flex h-3 rounded overflow-hidden bg-zinc-800">
                  <div className={`${row.color} opacity-70`} style={{ width: `${row.free}%` }} />
                  <div className="bg-primary/80 opacity-50" style={{ width: `${row.auction}%` }} />
                </div>
              </div>
            ))}
            <div className="flex gap-4 text-xs text-zinc-500 pt-1">
              <span className="flex items-center gap-1"><span className="w-3 h-2 bg-orange-500 rounded opacity-70 inline-block" />Free Allocation</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 bg-primary/80 rounded opacity-50 inline-block" />Auction Revenue</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CBAM */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            Carbon Border Adjustment Mechanism (CBAM)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-zinc-800 rounded-lg p-3 space-y-2">
              <p className="text-primary font-medium">How CBAM Works</p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Importers of covered goods buy CBAM certificates at the weekly average EU ETS price. Certificates are surrendered for embedded carbon in imports.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 space-y-2">
              <p className="text-primary font-medium">Covered Sectors (Phase-in)</p>
              <ul className="text-zinc-400 text-xs space-y-1">
                <li className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" />Cement</li>
                <li className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" />Iron & Steel</li>
                <li className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" />Aluminium</li>
                <li className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" />Fertilisers</li>
                <li className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" />Electricity</li>
                <li className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" />Hydrogen</li>
              </ul>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 space-y-2">
              <p className="text-emerald-300 font-medium">Timeline</p>
              <ul className="text-zinc-400 text-xs space-y-1">
                <li><span className="text-zinc-300">Oct 2023</span> — Reporting phase begins</li>
                <li><span className="text-zinc-300">Jan 2026</span> — Financial obligation starts</li>
                <li><span className="text-zinc-300">2034</span> — Free allocation fully phased out</li>
                <li><span className="text-zinc-300">2026+</span> — Scope expands to more sectors</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MSR */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <Info size={14} className="text-muted-foreground" />
            Market Stability Reserve (MSR)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2 text-zinc-400 text-xs leading-relaxed">
              <p>The MSR automatically adjusts supply of allowances to stabilise the market. When the Total Number of Allowances in Circulation (TNAC) exceeds 833 Mt, allowances are withheld from auctions. Below 400 Mt, they are released.</p>
              <p>Post-2023 rule: Allowances in the MSR above the previous year&apos;s auction volume are <span className="text-red-300">permanently cancelled</span>, removing the overhang permanently.</p>
            </div>
            <div className="space-y-2">
              {[
                { label: "TNAC Upper Trigger", val: "833 Mt", dir: "Withhold", color: "text-red-400" },
                { label: "TNAC Lower Trigger", val: "400 Mt", dir: "Release", color: "text-emerald-400" },
                { label: "Annual Intake Rate", val: "24% of TNAC", dir: "Withheld", color: "text-orange-400" },
                { label: "Post-2023 Cancellation", val: "Above auction vol", dir: "Permanent", color: "text-primary" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center bg-zinc-800 rounded px-3 py-1.5">
                  <span className="text-zinc-400 text-xs">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-200 text-xs">{item.val}</span>
                    <Badge variant="outline" className={`text-xs ${item.color} border-current`}>{item.dir}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sector Coverage Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <Factory size={14} className="text-orange-400" />
            EU ETS Sector Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-zinc-300">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left py-2 pr-4">Sector</th>
                  <th className="text-center py-2 pr-4">Coverage</th>
                  <th className="text-center py-2 pr-4">Free Alloc.</th>
                  <th className="text-center py-2">Phase</th>
                </tr>
              </thead>
              <tbody>
                {SECTOR_COVERAGE.map((row) => (
                  <tr key={row.sector} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-2 pr-4">
                      <span className={`flex items-center gap-2 ${row.color}`}>
                        {row.icon}
                        <span className="text-zinc-300">{row.sector}</span>
                      </span>
                    </td>
                    <td className="text-center py-2 pr-4 text-zinc-400">{row.coverage}</td>
                    <td className="text-center py-2 pr-4">
                      <span className={row.freeAlloc === "0%" ? "text-emerald-400" : "text-orange-400"}>
                        {row.freeAlloc}
                      </span>
                    </td>
                    <td className="text-center py-2">
                      <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-xs">{row.phase}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Voluntary Carbon Tab ───────────────────────────────────────────────────────

function VoluntaryTab() {
  const [selected, setSelected] = useState<string | null>(null);

  // Price bar chart
  const W = 580;
  const H = 180;
  const PAD = { t: 16, r: 20, b: 36, l: 50 };
  const barW = 60;
  // Use midpoint prices for display
  const midPrices = CREDIT_TYPES.map((c) => (c.priceMin + c.priceMax) / 2);
  const maxMid = Math.max(...midPrices) * 1.1;
  const barSpacing = (W - PAD.l - PAD.r) / CREDIT_TYPES.length;
  const yS = (v: number) => PAD.t + (1 - v / maxMid) * (H - PAD.t - PAD.b);

  return (
    <div className="space-y-6">
      {/* Credit type taxonomy */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <Leaf size={14} className="text-emerald-400" />
            Carbon Credit Type Taxonomy
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CREDIT_TYPES.map((ct) => (
              <motion.div
                key={ct.abbr}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelected(selected === ct.abbr ? null : ct.abbr)}
                className={`cursor-pointer rounded-lg p-3 border transition-colors ${selected === ct.abbr ? "border-primary bg-zinc-800" : "border-zinc-800 bg-zinc-850 hover:border-zinc-700"}`}
                style={{ background: selected === ct.abbr ? undefined : "#18181b" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ color: ct.color }}>{ct.icon}</span>
                    <span className="text-xs font-medium text-zinc-200">{ct.abbr}</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">{ct.volume} Mt</Badge>
                </div>
                <p className="text-xs text-zinc-400 mb-1">{ct.name}</p>
                <p className="text-xs text-zinc-500">{ct.registry}</p>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-zinc-500">Price range:</span>
                  <span style={{ color: ct.color }}>${ct.priceMin}–${ct.priceMax}/t</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price by project type bar chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <BarChart2 size={14} className="text-yellow-400" />
            Average Credit Price by Project Type ($/tonne CO₂e, log scale)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
            {[5, 15, 50, 150, 500].map((v) => {
              const scaledV = (Math.log10(v) / Math.log10(maxMid)) * 1;
              const yPos = PAD.t + (1 - Math.log10(v) / Math.log10(maxMid)) * (H - PAD.t - PAD.b);
              return (
                <g key={v}>
                  <line x1={PAD.l} x2={W - PAD.r} y1={yPos} y2={yPos} stroke="#27272a" strokeWidth="1" />
                  <text x={PAD.l - 6} y={yPos + 4} textAnchor="end" fontSize="9" fill="#71717a">${v}</text>
                </g>
              );
            })}
            {CREDIT_TYPES.map((ct, i) => {
              const midLog = (Math.log10((ct.priceMin + ct.priceMax) / 2) / Math.log10(maxMid));
              const barTop = PAD.t + (1 - midLog) * (H - PAD.t - PAD.b);
              const barHeight = H - PAD.b - barTop;
              const x = PAD.l + i * barSpacing + (barSpacing - barW) / 2;
              return (
                <g key={ct.abbr}>
                  <rect x={x} y={barTop} width={barW} height={Math.max(barHeight, 0)} fill={ct.color} opacity="0.75" rx="3" />
                  <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#71717a">{ct.abbr}</text>
                  <text x={x + barW / 2} y={barTop - 4} textAnchor="middle" fontSize="9" fill={ct.color}>
                    ${Math.round((ct.priceMin + ct.priceMax) / 2)}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Verra VCS vs Gold Standard */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            Verra VCS vs Gold Standard Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-zinc-300">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left py-2 pr-4">Dimension</th>
                  <th className="text-center py-2 pr-4 text-primary">Verra VCS</th>
                  <th className="text-center py-2 text-yellow-400">Gold Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {[
                  { dim: "Market Share", vcs: "~70% of VCM", gs: "~15% of VCM" },
                  { dim: "Focus", vcs: "Scale & breadth", gs: "SDG co-benefits" },
                  { dim: "Methodology Count", vcs: "100+", gs: "40+" },
                  { dim: "Co-Benefit Standard", vcs: "Optional CCB", gs: "Mandatory SDG screen" },
                  { dim: "REDD+ Programs", vcs: "JNR (jurisdictional)", gs: "Limited" },
                  { dim: "Price Premium", vcs: "Baseline", gs: "+20–60% for SDG label" },
                  { dim: "Registry Transparency", vcs: "Public APX registry", gs: "Public Impact Registry" },
                  { dim: "ICVCM CCP Status", vcs: "Pursuing approval", gs: "Pursuing approval" },
                ].map((row) => (
                  <tr key={row.dim} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-2 pr-4 text-zinc-400">{row.dim}</td>
                    <td className="text-center py-2 pr-4 text-zinc-300">{row.vcs}</td>
                    <td className="text-center py-2 text-zinc-300">{row.gs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quality Framework */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-400" />
            Credit Quality Framework
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {QUALITY_CRITERIA.map((qc) => (
            <div key={qc.key} className="bg-zinc-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-zinc-200">{qc.criterion}</span>
                <div className="flex gap-1">
                  {Array.from({ length: qc.pass }).map((_, i) => (
                    <CheckCircle key={`p-${i}`} size={12} className="text-emerald-400" />
                  ))}
                  {Array.from({ length: qc.fail }).map((_, i) => (
                    <XCircle key={`f-${i}`} size={12} className="text-red-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-zinc-400">{qc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Greenwashing Cases */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            Greenwashing Case Studies
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {GREENWASHING_CASES.map((gc) => (
            <div key={gc.company} className="bg-zinc-800 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-200">{gc.company}</span>
                <Badge
                  variant="outline"
                  className={`text-xs border-current ${gc.severity === "Critical" ? "text-red-500" : gc.severity === "High" ? "text-orange-400" : "text-yellow-400"}`}
                >
                  {gc.severity}
                </Badge>
              </div>
              <p className="text-xs text-primary italic">&ldquo;{gc.claim}&rdquo;</p>
              <p className="text-xs text-zinc-400">{gc.issue}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Nature-Based Solutions Tab ─────────────────────────────────────────────────

function NatureTab() {
  const [selected, setSelected] = useState<number | null>(null);

  const riskColor = (r: NbsProject["permanenceRisk"]) =>
    r === "Low" ? "text-emerald-400" : r === "Medium" ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-6">
      {/* Project types overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            type: "Avoided Deforestation (REDD+)",
            icon: <TreePine size={16} />,
            color: "text-green-400",
            mech: "Pays landowners to protect existing forest vs. reference deforestation baseline",
            creds: "8–20 tCO₂e/ha/yr",
            risk: "High reversal & additionality risk",
          },
          {
            type: "Reforestation / Afforestation (ARR)",
            icon: <Leaf size={16} />,
            color: "text-lime-400",
            mech: "Planting trees on degraded or agricultural land; 20–100yr crediting period",
            creds: "4–15 tCO₂e/ha/yr",
            risk: "Low-medium; permanence improves over time",
          },
          {
            type: "Wetland / Peatland Restoration",
            icon: <Droplets size={16} />,
            color: "text-muted-foreground",
            mech: "Re-wetting drained peat; peatlands store 2× more C than all forests combined",
            creds: "5–18 tCO₂e/ha/yr",
            risk: "Medium; high co-benefit for water & biodiversity",
          },
          {
            type: "Blue Carbon (Mangrove / Seagrass)",
            icon: <Droplets size={16} />,
            color: "text-primary",
            mech: "Coastal ecosystems sequester C in biomass + sediment at 3–5× rate of forests",
            creds: "8–45 tCO₂e/ha/yr",
            risk: "Low-medium; sea level rise risk long-term",
          },
        ].map((pt) => (
          <Card key={pt.type} className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-3 pb-3 space-y-2">
              <div className={`flex items-center gap-2 ${pt.color}`}>
                {pt.icon}
                <span className="text-sm font-medium text-zinc-200">{pt.type}</span>
              </div>
              <p className="text-xs text-zinc-400">{pt.mech}</p>
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400">{pt.creds}</span>
                <span className="text-zinc-500">{pt.risk}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project comparison */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <Globe size={14} className="text-muted-foreground" />
            Project Co-Benefits & Risk Scoring
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {NBS_PROJECTS.map((p, i) => (
            <motion.div
              key={p.name}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelected(selected === i ? null : i)}
              className={`cursor-pointer rounded-lg p-3 border transition-colors ${selected === i ? "border-cyan-600 bg-zinc-800" : "border-zinc-800 hover:border-zinc-700"}`}
              style={{ background: selected === i ? undefined : "#18181b" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-zinc-200">{p.name}</span>
                  <span className="ml-2 text-xs text-zinc-500">{p.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">{p.type}</Badge>
                  <span className="text-xs text-emerald-400">${p.creditPerHa}/ha/yr</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[
                  { label: "Biodiversity", val: p.coBeeBio, color: "bg-emerald-500" },
                  { label: "Community", val: p.coBeeComm, color: "bg-primary" },
                  { label: "Water", val: p.coBeeWater, color: "bg-cyan-500" },
                ].map((cb) => (
                  <div key={cb.label}>
                    <div className="flex justify-between text-xs text-zinc-500 mb-0.5">
                      <span>{cb.label}</span>
                      <span>{cb.val}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-700 rounded overflow-hidden">
                      <div className={`${cb.color} h-full rounded opacity-75`} style={{ width: `${cb.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-zinc-500">Permanence: <span className={riskColor(p.permanenceRisk)}>{p.permanenceRisk}</span></span>
                <span className="text-zinc-500">Tenure: <span className={riskColor(p.tenureRisk)}>{p.tenureRisk}</span></span>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Buffer Pools */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <Shield size={14} className="text-orange-400" />
            Permanence Risk & Buffer Pools
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Buffer pools hold a percentage of issued credits as insurance against reversals (fire, disease, illegal logging). If reversal occurs, buffer credits are cancelled rather than re-debiting buyers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { risk: "Low Risk", buffer: "10–15%", color: "text-emerald-400", examples: "Scottish peatland, UK ARR" },
              { risk: "Medium Risk", buffer: "15–25%", color: "text-yellow-400", examples: "Borneo peatland, S. American ARR" },
              { risk: "High Risk", buffer: "25–40%", color: "text-red-400", examples: "Tropical REDD+, frontier forests" },
            ].map((b) => (
              <div key={b.risk} className="bg-zinc-800 rounded-lg p-3 text-center space-y-1">
                <p className={`text-sm font-medium ${b.color}`}>{b.risk}</p>
                <p className="text-xl font-bold text-zinc-200">{b.buffer}</p>
                <p className="text-xs text-zinc-500">Buffer withheld</p>
                <p className="text-xs text-zinc-500 mt-1">{b.examples}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ICVCM Core Carbon Principles */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-400" />
            ICVCM Core Carbon Principles (CCPs)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
            The Integrity Council for the Voluntary Carbon Market (ICVCM) published 10 CCPs in 2023 to define a high-integrity floor standard. Carbon programmes must pass assessment to receive the CCP label.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ICVCM_PRINCIPLES.map((p) => (
              <div key={p.id} className="bg-zinc-800 rounded-lg p-2.5 flex gap-2">
                <span className="text-xs font-mono text-primary shrink-0 mt-0.5">{p.id}</span>
                <div>
                  <p className="text-xs font-medium text-zinc-300">{p.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Corporate Strategy Tab ─────────────────────────────────────────────────────

function CorporateTab() {
  // Abatement cost curve
  const W = 680;
  const H = 220;
  const PAD = { t: 24, r: 20, b: 40, l: 60 };

  const sorted = [...ABATEMENT_CURVE].sort((a, b) => a.cost - b.cost);
  const minCost = Math.min(...sorted.map((x) => x.cost));
  const maxCost = Math.max(...sorted.map((x) => x.cost));
  const totalPot = sorted.reduce((acc, x) => acc + x.potential, 0);

  // Build cumulative widths
  let cumX = 0;
  const bars = sorted.map((pt) => {
    const xFrac = cumX / totalPot;
    const wFrac = pt.potential / totalPot;
    cumX += pt.potential;
    return { ...pt, xFrac, wFrac };
  });

  const xS = (frac: number) => PAD.l + frac * (W - PAD.l - PAD.r);
  const yRange = maxCost - minCost;
  const yS = (cost: number) => PAD.t + (1 - (cost - minCost) / yRange) * (H - PAD.t - PAD.b);

  const yTicks = [-50, 0, 100, 200, 300, 400, 500];

  return (
    <div className="space-y-6">
      {/* Framework distinctions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Science Based Targets (SBTi)",
            color: "text-emerald-400",
            border: "border-emerald-800",
            points: [
              "Emissions reductions aligned with 1.5°C or well-below-2°C pathway",
              "Scope 1+2 required; Scope 3 required if >40% of total emissions",
              "Offsets cannot substitute for required reductions",
              "Validated independently by SBTi technical team",
              "~7,000 companies committed globally (2024)",
            ],
          },
          {
            label: "Net-Zero",
            color: "text-primary",
            border: "border-border",
            points: [
              "Residual emissions balanced by permanent removals (not just offsets)",
              "SBTi Net-Zero Standard requires 90–95% absolute reduction first",
              "High-quality removals (DAC, biochar) for residuals only",
              "Corporate Net-Zero ≠ Carbon Neutral (different standards)",
              "Most 2050 net-zero targets lack credible near-term milestones",
            ],
          },
          {
            label: "Carbon Neutral",
            color: "text-yellow-400",
            border: "border-yellow-800",
            points: [
              "All emissions offset, no mandatory reduction requirement",
              "Offset quality varies enormously — often low-cost REDD+",
              "PAS 2060 / ISO 14068 provide frameworks but widely ignored",
              "Greenwashing risk highest here — easy to claim, hard to verify",
              "Companies can be carbon neutral without reducing emissions",
            ],
          },
        ].map((f) => (
          <Card key={f.label} className={`bg-zinc-900 border ${f.border}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm ${f.color}`}>{f.label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1.5">
                {f.points.map((pt, i) => (
                  <li key={i} className="flex gap-2 text-xs text-zinc-400">
                    <span className={`${f.color} shrink-0 mt-0.5`}>•</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Abatement Cost Curve */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <BarChart2 size={14} className="text-primary" />
            Marginal Abatement Cost (MAC) Curve
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }}>
            {yTicks.map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={W - PAD.r} y1={yS(v)} y2={yS(v)} stroke={v === 0 ? "#52525b" : "#27272a"} strokeWidth={v === 0 ? 1.5 : 1} />
                <text x={PAD.l - 6} y={yS(v) + 4} textAnchor="end" fontSize="9" fill="#71717a">
                  {v < 0 ? `-$${Math.abs(v)}` : `$${v}`}
                </text>
              </g>
            ))}
            {bars.map((b, i) => {
              const x1 = xS(b.xFrac);
              const x2 = xS(b.xFrac + b.wFrac);
              const barTop = b.cost >= 0 ? yS(b.cost) : yS(0);
              const barBot = b.cost >= 0 ? yS(0) : yS(b.cost);
              const color = b.cost < 0 ? "#22c55e" : b.cost < 50 ? "#eab308" : b.cost < 150 ? "#f97316" : "#ef4444";
              return (
                <rect
                  key={i}
                  x={x1 + 1}
                  y={barTop}
                  width={Math.max(x2 - x1 - 2, 1)}
                  height={Math.max(barBot - barTop, 1)}
                  fill={color}
                  opacity="0.75"
                />
              );
            })}
            <line x1={PAD.l} x2={W - PAD.r} y1={yS(0)} y2={yS(0)} stroke="#71717a" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x={W - PAD.r - 2} y={yS(0) - 4} textAnchor="end" fontSize="8" fill="#71717a">Break-even</text>
            <text x={PAD.l + 4} y={H - 6} fontSize="9" fill="#52525b">← Negative cost (profitable) | Positive cost (subsidy needed) →</text>
          </svg>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { color: "bg-green-500", label: "Cost-negative measures" },
              { color: "bg-yellow-500", label: "Low-cost abatement" },
              { color: "bg-orange-500", label: "Medium-cost abatement" },
              { color: "bg-red-500", label: "High-cost / frontier" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className={`w-3 h-2 ${l.color} rounded opacity-75 shrink-0`} />
                {l.label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Corporate entities */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <Factory size={14} className="text-orange-400" />
            Corporate Emissions Profiles & Strategies
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {CORPORATE_ENTITIES.map((co) => {
            const total = co.scope1 + co.scope2 + co.scope3;
            const s1Pct = (co.scope1 / total) * 100;
            const s2Pct = (co.scope2 / total) * 100;
            const s3Pct = (co.scope3 / total) * 100;
            return (
              <div key={co.name} className="bg-zinc-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-zinc-200">{co.name}</span>
                    <span className="ml-2 text-xs text-zinc-500">{co.sector}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs border-current ${co.offsetQuality === "Tier 1" ? "text-emerald-400" : co.offsetQuality === "Tier 2" ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {co.offsetQuality}
                    </Badge>
                    {co.sbtAligned ? (
                      <Badge variant="outline" className="text-xs text-primary border-border">SBTi</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-zinc-500 border-zinc-700">No SBTi</Badge>
                    )}
                    <span className="text-xs text-zinc-500">NZ {co.netZeroYear}</span>
                  </div>
                </div>
                {/* Scope breakdown bar */}
                <div>
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>Scope breakdown ({total.toFixed(1)} MtCO₂e)</span>
                    <span>{co.offsetPct}% offset externally</span>
                  </div>
                  <div className="flex h-3 rounded overflow-hidden">
                    <div className="bg-red-500 opacity-80" style={{ width: `${s1Pct}%` }} title={`S1: ${co.scope1}Mt`} />
                    <div className="bg-yellow-500 opacity-80" style={{ width: `${s2Pct}%` }} title={`S2: ${co.scope2}Mt`} />
                    <div className="bg-primary opacity-70" style={{ width: `${s3Pct}%` }} title={`S3: ${co.scope3}Mt`} />
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-500 mt-1">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded opacity-80 inline-block" />S1 {co.scope1}Mt</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded opacity-80 inline-block" />S2 {co.scope2}Mt</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-primary rounded opacity-70 inline-block" />S3 {co.scope3}Mt</span>
                    <span className="ml-auto text-zinc-600">Internal abatement: ${co.abatementCost}/t</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Offset Quality Tiers */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <Shield size={14} className="text-muted-foreground" />
            Offset Quality Tiers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                tier: "Tier 1 — High Integrity",
                color: "text-emerald-400",
                border: "border-emerald-900",
                criteria: ["ICVCM CCP-approved programme", "Corresponding adjustment (Art. 6)", "Permanent removal (BECCS/DAC/biochar)", "Strong MRV, third-party verified", "No double counting risk", "Co-benefits certified"],
                priceRange: "$20–200+/t",
              },
              {
                tier: "Tier 2 — Moderate",
                color: "text-yellow-400",
                border: "border-yellow-900",
                criteria: ["VCS/Gold Standard certified", "Some additionality concerns", "Nature-based with buffer pool", "Basic MRV in place", "Co-benefits possible but voluntary", "No Article 6 adjustment"],
                priceRange: "$8–30/t",
              },
              {
                tier: "Tier 3 — Low Quality",
                color: "text-red-400",
                border: "border-red-900",
                criteria: ["Unverified or legacy credits", "Weak additionality baseline", "No buffer pool/permanence assurance", "Minimal or self-reported MRV", "Greenwashing risk very high", "Regulatory/reputational liability"],
                priceRange: "$1–8/t",
              },
            ].map((tier) => (
              <div key={tier.tier} className={`bg-zinc-800 rounded-lg p-3 border ${tier.border}`}>
                <p className={`text-sm font-medium ${tier.color} mb-2`}>{tier.tier}</p>
                <p className={`text-lg font-bold text-zinc-200 mb-2`}>{tier.priceRange}</p>
                <ul className="space-y-1">
                  {tier.criteria.map((c, i) => (
                    <li key={i} className="flex gap-1.5 text-xs text-zinc-400">
                      <span className={`${tier.color} shrink-0`}>•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transition Plans */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            Credible Transition Plan Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { item: "Near-term absolute reduction targets (5yr)", required: true },
              { item: "Sector-specific decarbonisation pathways", required: true },
              { item: "Capital allocation aligned to 1.5°C (CAPEX share)", required: true },
              { item: "Scope 3 value chain engagement plan", required: true },
              { item: "Climate governance (board-level accountability)", required: true },
              { item: "External validation (SBTi / CDP A-list)", required: false },
              { item: "Just Transition plan for workforce", required: false },
              { item: "TCFD-aligned physical risk disclosure", required: false },
              { item: "Paris-aligned lobbying position", required: false },
              { item: "Annual progress report with assurance", required: true },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2 bg-zinc-800 rounded px-3 py-1.5">
                {row.required ? (
                  <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                ) : (
                  <Info size={12} className="text-primary shrink-0" />
                )}
                <span className="text-xs text-zinc-300">{row.item}</span>
                {row.required && (
                  <Badge variant="outline" className="ml-auto text-xs text-zinc-500 border-zinc-700">Required</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CarbonMarkets2Page() {
  // Consume a few PRNG calls so corporate data appears varied
  const _unused = useMemo(() => {
    let total = 0;
    for (let i = 0; i < 8; i++) total += rb(0, 1);
    return total;
  }, []);
  void _unused;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Leaf className="text-emerald-400" size={22} />
            <h1 className="text-2xl font-semibold text-zinc-100">Carbon Markets Deep Dive</h1>
          </div>
          <p className="text-sm text-zinc-400">
            EU ETS mechanics, voluntary carbon markets, nature-based solutions, credit quality frameworks, and corporate net-zero strategies.
          </p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "EU ETS Price", value: "€59.4/t", sub: "2024 average", color: "text-primary" },
            { label: "VCM Volume", value: "~350 MtCO₂e", sub: "Issued 2023", color: "text-emerald-400" },
            { label: "CBAM Start", value: "Jan 2026", sub: "Financial obligations", color: "text-primary" },
            { label: "ICVCM CCPs", value: "10 Principles", sub: "Published 2023", color: "text-yellow-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-zinc-500">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="eu-ets">
          <TabsList className="bg-zinc-900 border border-zinc-800 flex-wrap h-auto gap-1">
            <TabsTrigger value="eu-ets" className="data-[state=active]:bg-zinc-700 text-xs">
              EU ETS
            </TabsTrigger>
            <TabsTrigger value="voluntary" className="data-[state=active]:bg-zinc-700 text-xs">
              Voluntary Carbon
            </TabsTrigger>
            <TabsTrigger value="nature" className="data-[state=active]:bg-zinc-700 text-xs">
              Nature-Based Solutions
            </TabsTrigger>
            <TabsTrigger value="corporate" className="data-[state=active]:bg-zinc-700 text-xs">
              Corporate Strategy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eu-ets" className="mt-4">
            <EuEtsTab />
          </TabsContent>
          <TabsContent value="voluntary" className="mt-4">
            <VoluntaryTab />
          </TabsContent>
          <TabsContent value="nature" className="mt-4">
            <NatureTab />
          </TabsContent>
          <TabsContent value="corporate" className="mt-4">
            <CorporateTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
