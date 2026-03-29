"use client";

import { useState, useMemo } from "react";
import {
  Leaf,
  TrendingUp,
  AlertTriangle,
  Globe,
  Zap,
  BarChart2,
  DollarSign,
  Wind,
  Flame,
  Droplets,
  Shield,
  Info,
  CheckCircle,
  XCircle,
  ArrowRight,
  Target,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 893;
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

interface InvestmentBar {
  year: string;
  renewable: number; // $trillion
  fossil: number;
}

interface FinanceGapPoint {
  year: string;
  need: number;
  current: number;
}

interface CarbonPricePoint {
  year: string;
  euEts: number;
  annotate?: string;
}

interface ScenarioAsset {
  name: string;
  orderlyChange: number;
  disorderlyChange: number;
  hotHouseChange: number;
}

interface InsurableLossPoint {
  year: string;
  total: number;
  insured: number;
}

interface TaxonomyBar {
  sector: string;
  aligned: number;
}

interface TransitionBondPoint {
  year: string;
  green: number;
  social: number;
  sustainability: number;
  transition: number;
}

// ── Tab 1: Climate Finance Landscape data ─────────────────────────────────────

const INVEST_YEARS = [
  "2015", "2016", "2017", "2018", "2019",
  "2020", "2021", "2022", "2023", "2024",
];

// Renewable grows from ~0.3T → 1.8T; fossil stays ~0.9T → 1.1T
const INVEST_DATA: InvestmentBar[] = INVEST_YEARS.map((year, i) => ({
  year,
  renewable: Math.round((0.28 + i * 0.155 + rb(-0.02, 0.02)) * 100) / 100,
  fossil: Math.round((0.85 + i * 0.028 + rb(-0.03, 0.03)) * 100) / 100,
}));

const GAP_DATA: FinanceGapPoint[] = INVEST_YEARS.map((year, i) => ({
  year,
  need: Math.round((3.1 + i * 0.28) * 10) / 10,
  current: Math.round((0.62 + i * 0.14) * 10) / 10,
}));

const PLEDGE_PROGRESS = {
  pledged: 100,
  delivered: 83.3,
  publicSources: 51.2,
  privateMobilised: 32.1,
};

const BLENDED_STRUCTURES = [
  {
    name: "Concessional Loans",
    provider: "DFIs / MDBs",
    risk: "Subordinated",
    return: "Below-market",
    purpose: "Credit enhancement",
  },
  {
    name: "Guarantees",
    provider: "World Bank / MIGA",
    risk: "First-loss",
    return: "Fee income",
    purpose: "Political risk cover",
  },
  {
    name: "Technical Assistance",
    provider: "GCF / GEF",
    risk: "Grant",
    return: "None",
    purpose: "Project preparation",
  },
  {
    name: "Commercial Equity",
    provider: "Private PE / Infra",
    risk: "Senior equity",
    return: "Market+",
    purpose: "Scale & liquidity",
  },
];

const DISCLOSURE_FRAMEWORKS = [
  {
    name: "TCFD",
    full: "Task Force on Climate-related Financial Disclosures",
    pillars: ["Governance", "Strategy", "Risk Mgmt", "Metrics & Targets"],
    mandatory: "UK, NZ, Singapore, Japan (large cos)",
    color: "emerald",
  },
  {
    name: "ISSB S2",
    full: "IFRS Sustainability Disclosure Standard S2",
    pillars: ["Climate Risks", "Opportunities", "Financed Emissions", "Scope 1/2/3"],
    mandatory: "Australia, Canada, HK, Brazil",
    color: "blue",
  },
  {
    name: "CSRD/ESRS",
    full: "Corporate Sustainability Reporting Directive (EU)",
    pillars: ["Double Materiality", "Value Chain", "GHG Protocol", "Just Transition"],
    mandatory: "EU (large + listed SMEs)",
    color: "violet",
  },
];

// ── Tab 2: Carbon Pricing data ─────────────────────────────────────────────────

const EU_ETS_EVENTS: { year: string; note: string }[] = [
  { year: "2008", note: "Phase II begins" },
  { year: "2013", note: "Phase III — full auctioning" },
  { year: "2018", note: "Market Stability Reserve" },
  { year: "2021", note: "Fit-for-55 announced" },
  { year: "2022", note: "Russia/energy shock" },
  { year: "2023", note: "CBAM regulation" },
];

const EU_ETS_YEARS = [
  "2005","2006","2007","2008","2009","2010","2011","2012",
  "2013","2014","2015","2016","2017","2018","2019","2020",
  "2021","2022","2023","2024",
];

// Real-ish EU ETS price trajectory
const EU_ETS_BASE = [
  22, 18, 24, 22, 13, 14, 13, 7,
  4,  5,  7,  5,  7,  16, 25, 24,
  50, 80, 90, 65,
];
const EU_ETS_DATA: CarbonPricePoint[] = EU_ETS_YEARS.map((year, i) => ({
  year,
  euEts: EU_ETS_BASE[i] + rb(-1.5, 1.5),
  annotate: EU_ETS_EVENTS.find((e) => e.year === year)?.note,
}));

const CARBON_MARKETS = [
  {
    name: "EU ETS",
    type: "Cap & Trade",
    price: "€60–90/tCO₂",
    coverage: "~40% EU emissions",
    vintage: "Verified / Capped",
    notes: "Largest compliance market; CBAM border adjustment from 2026",
  },
  {
    name: "California CaT",
    type: "Cap & Trade",
    price: "$35–45/tCO₂",
    coverage: "~85% CA GHG",
    vintage: "ARB certified",
    notes: "Linked with Quebec; floor price $19.75 in 2024",
  },
  {
    name: "RGGI",
    type: "Cap & Trade",
    price: "$12–18/tCO₂",
    coverage: "Power sector, 12 US states",
    vintage: "RGGI allowances",
    notes: "Auction-only; proceeds fund efficiency programs",
  },
  {
    name: "VCM (VERRA)",
    type: "Voluntary",
    price: "$3–25/tCO₂",
    coverage: "Global, project-based",
    vintage: "VCS / Gold Standard",
    notes: "Integrity under scrutiny; ICVCM Core Carbon Principles",
  },
  {
    name: "Article 6.4",
    type: "Int'l / Paris",
    price: "TBD",
    coverage: "Host-country NDCs",
    vintage: "ITMOs (int'l transfers)",
    notes: "UN supervised mechanism replacing CDM; rules finalized COP29",
  },
];

// CDR cost curve ($/tCO₂)
const CDR_METHODS = [
  { name: "BECCS", costLo: 15, costHi: 400, scaleTw: 10, maturity: "Emerging" },
  { name: "DAC", costLo: 300, costHi: 1000, scaleTw: 0.01, maturity: "Early" },
  { name: "Enhanced Weathering", costLo: 50, costHi: 200, scaleTw: 2, maturity: "Pilot" },
  { name: "Ocean Alkalinity", costLo: 40, costHi: 250, scaleTw: 1, maturity: "R&D" },
  { name: "Biochar", costLo: 30, costHi: 120, scaleTw: 3, maturity: "Commercial" },
  { name: "Afforestation", costLo: 5, costHi: 50, scaleTw: 8, maturity: "Mature" },
];

const CARBON_FORECASTS = [
  { region: "EU ETS", iea450: 150, ieanetzero: 250, sdsBase: 100 },
  { region: "N. America", iea450: 90, ieanetzero: 200, sdsBase: 70 },
  { region: "Global Ave.", iea450: 50, ieanetzero: 130, sdsBase: 35 },
  { region: "Emerging Mkt", iea450: 20, ieanetzero: 80, sdsBase: 15 },
];

// ── Tab 3: Stranded Assets & Physical Risk data ────────────────────────────────

const STRANDING_TIMELINE = [
  { fuel: "Coal", stranded2030: 85, stranded2040: 95, stranded2050: 99, color: "#6b7280" },
  { fuel: "Oil Sands", stranded2030: 40, stranded2040: 75, stranded2050: 92, color: "#92400e" },
  { fuel: "Conv. Oil", stranded2030: 15, stranded2040: 45, stranded2050: 75, color: "#b45309" },
  { fuel: "Shale Gas", stranded2030: 10, stranded2040: 30, stranded2050: 60, color: "#d97706" },
  { fuel: "LNG / Gas", stranded2030: 5, stranded2040: 20, stranded2050: 45, color: "#f59e0b" },
];

const PHYSICAL_RISKS = [
  {
    type: "Acute",
    icon: "storm",
    events: [
      { name: "Tropical Cyclones", exposure: 82, trend: "intensifying" },
      { name: "River Floods", exposure: 65, trend: "increasing frequency" },
      { name: "Wildfires", exposure: 55, trend: "expanding range" },
      { name: "Extreme Heat", exposure: 78, trend: "longer duration" },
      { name: "Drought", exposure: 60, trend: "more severe" },
    ],
  },
  {
    type: "Chronic",
    icon: "wave",
    events: [
      { name: "Sea Level Rise", exposure: 45, trend: "+0.5m by 2100 (1.5°C)" },
      { name: "Permafrost Thaw", exposure: 30, trend: "infrastructure damage" },
      { name: "Ocean Acidification", exposure: 40, trend: "fisheries, reefs" },
      { name: "Shifting Precipitation", exposure: 55, trend: "agriculture risk" },
      { name: "Chronic Heat Stress", exposure: 70, trend: "labor productivity" },
    ],
  },
];

const NGFS_SCENARIOS: ScenarioAsset[] = [
  { name: "Coal Mining", orderlyChange: -55, disorderlyChange: -72, hotHouseChange: -20 },
  { name: "Oil & Gas E&P", orderlyChange: -30, disorderlyChange: -48, hotHouseChange: -5 },
  { name: "Auto (ICE)", orderlyChange: -25, disorderlyChange: -40, hotHouseChange: -8 },
  { name: "Utilities (coal)", orderlyChange: -45, disorderlyChange: -60, hotHouseChange: -15 },
  { name: "Clean Energy", orderlyChange: +65, disorderlyChange: +40, hotHouseChange: +10 },
  { name: "EV Manufacturers", orderlyChange: +55, disorderlyChange: +35, hotHouseChange: +5 },
  { name: "Financials", orderlyChange: -8, disorderlyChange: -20, hotHouseChange: -35 },
];

const INS_YEARS_RAW = [
  1980,1985,1990,1995,2000,2005,2010,2012,2015,2017,2019,2021,2023,2024,
];
const INS_TOTAL_BASE = [5,8,30,27,38,105,130,170,90,330,150,280,250,380];
const INSURABLE_DATA: InsurableLossPoint[] = INS_YEARS_RAW.map((yr, i) => ({
  year: yr.toString(),
  total: INS_TOTAL_BASE[i] + rb(-5, 5),
  insured: Math.round(INS_TOTAL_BASE[i] * rb(0.28, 0.42)),
}));

// ── Tab 4: Bonds & Taxonomy data ───────────────────────────────────────────────

const BOND_COMPARISON = [
  {
    type: "Green Bond",
    color: "emerald",
    proceeds: "Climate/environmental projects",
    standard: "GBP / EU GBS",
    issuer: "Govts, corps, MDBs",
    greenwash: "Medium",
    size2024: "$620B",
  },
  {
    type: "Social Bond",
    color: "blue",
    proceeds: "Social outcomes (housing, health)",
    standard: "SBP",
    issuer: "Development banks, SSAs",
    greenwash: "Low",
    size2024: "$180B",
  },
  {
    type: "Sustainability Bond",
    color: "violet",
    proceeds: "Combined green + social",
    standard: "GBP + SBP",
    issuer: "Supranationals, corporates",
    greenwash: "Medium",
    size2024: "$210B",
  },
  {
    type: "Transition Bond",
    color: "amber",
    proceeds: "Decarbonising high-emitters",
    standard: "ICMA Transition Finance",
    issuer: "Hard-to-abate corporates",
    greenwash: "High",
    size2024: "$28B",
  },
  {
    type: "SLB",
    color: "orange",
    proceeds: "General (KPI-linked coupon)",
    standard: "SLBP",
    issuer: "Corporates, govts",
    greenwash: "High",
    size2024: "$145B",
  },
];

const TAXONOMY_OBJECTIVES = [
  {
    id: 1,
    name: "Climate Change Mitigation",
    color: "emerald",
    examples: ["Solar, wind, EVs, building retrofit, low-carbon steel"],
  },
  {
    id: 2,
    name: "Climate Change Adaptation",
    color: "blue",
    examples: ["Flood defences, drought-resistant agriculture, resilient infrastructure"],
  },
  {
    id: 3,
    name: "Sustainable Water & Marine",
    color: "cyan",
    examples: ["Water recycling, marine conservation, clean water supply"],
  },
  {
    id: 4,
    name: "Circular Economy",
    color: "teal",
    examples: ["Recycling, waste-to-energy, product lifetime extension"],
  },
  {
    id: 5,
    name: "Pollution Prevention",
    color: "purple",
    examples: ["Remediation, emission controls, chemical substitution"],
  },
  {
    id: 6,
    name: "Biodiversity & Ecosystems",
    color: "lime",
    examples: ["Habitat restoration, sustainable forestry, ocean health"],
  },
];

const TAXONOMY_ALIGNED: TaxonomyBar[] = [
  { sector: "Utilities", aligned: 42 },
  { sector: "Real Estate", aligned: 18 },
  { sector: "Transport", aligned: 22 },
  { sector: "Manufacturing", aligned: 9 },
  { sector: "Financial Svcs", aligned: 14 },
  { sector: "ICT", aligned: 31 },
  { sector: "Agriculture", aligned: 6 },
  { sector: "Construction", aligned: 12 },
];

const BOND_ISSUANCE_YEARS = ["2019", "2020", "2021", "2022", "2023", "2024"];
const BOND_ISSUANCE: TransitionBondPoint[] = [
  { year: "2019", green: 255, social: 40, sustainability: 55, transition: 2 },
  { year: "2020", green: 295, social: 148, sustainability: 90, transition: 4 },
  { year: "2021", green: 512, social: 227, sustainability: 195, transition: 9 },
  { year: "2022", green: 487, social: 165, sustainability: 178, transition: 15 },
  { year: "2023", green: 575, social: 162, sustainability: 190, transition: 22 },
  { year: "2024", green: 620, social: 180, sustainability: 210, transition: 28 },
];

const HARD_TO_ABATE = [
  {
    sector: "Steel",
    share: "7% global CO₂",
    pathways: ["Green H₂ DRI", "EAF electrification", "CCUS on blast furnace"],
    financeNeed: "$1.4T by 2050",
    challenge: "Greenium thin; bankability requires carbon price ≥$80",
  },
  {
    sector: "Cement",
    share: "8% global CO₂",
    pathways: ["CCUS + oxyfuel", "Calcined clay SCMs", "Carbon-cured concrete"],
    financeNeed: "$1.0T by 2050",
    challenge: "Long asset life; retrofit CAPEX heavy; DNSH complex",
  },
  {
    sector: "Aviation",
    share: "2.5% global CO₂",
    pathways: ["SAF blending mandates", "Hydrogen aircraft (2035+)", "Offsetting + CORSIA"],
    financeNeed: "$0.8T by 2050",
    challenge: "SAF cost 3–5× jet fuel; limited green finance frameworks",
  },
  {
    sector: "Shipping",
    share: "2.9% global CO₂",
    pathways: ["Green ammonia/methanol", "Wind-assist sails", "FuelEU Maritime"],
    financeNeed: "$0.9T by 2050",
    challenge: "Stranded newbuild risk; fuel uncertainty 2030–2040",
  },
];

const GREENWASH_INDICATORS = [
  { flag: "No use-of-proceeds ring-fence", severity: "High", type: "Structural" },
  { flag: "KPIs set below business-as-usual trajectory", severity: "High", type: "Target" },
  { flag: "Scope 3 excluded from net-zero claim", severity: "Medium", type: "Disclosure" },
  { flag: "Taxonomy alignment self-assessed (no 2nd party)", severity: "Medium", type: "Assurance" },
  { flag: "Transition plan lacks interim milestones", severity: "High", type: "Strategy" },
  { flag: "Offsets >50% of decarbonisation path", severity: "Medium", type: "Integrity" },
  { flag: "No independent verification of GHG inventory", severity: "High", type: "Assurance" },
  { flag: "Carbon neutral claim based on SCC offsets only", severity: "High", type: "Target" },
];

// ── SVG helpers ────────────────────────────────────────────────────────────────

function svgX(index: number, total: number, w: number, pad: number) {
  return pad + (index / (total - 1)) * (w - pad * 2);
}
function svgY(val: number, min: number, max: number, h: number, padTop: number, padBot: number) {
  return padTop + ((max - val) / (max - min)) * (h - padTop - padBot);
}

// ── SVG: Clean Energy Investment (stacked bar) ─────────────────────────────────

function EnergyInvestmentChart() {
  const W = 560;
  const H = 200;
  const PAD_L = 50;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 36;
  const barW = (W - PAD_L - PAD_R) / INVEST_DATA.length;
  const maxVal = 3.0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* grid */}
      {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((v) => {
        const y = svgY(v, 0, maxVal, H, PAD_T, PAD_B);
        return (
          <g key={v}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={PAD_L - 6} y={y + 4} fontSize={9} fill="#9ca3af" textAnchor="end">
              {v.toFixed(1)}T
            </text>
          </g>
        );
      })}
      {/* bars */}
      {INVEST_DATA.map((d, i) => {
        const x = PAD_L + i * barW;
        const renH = ((d.renewable / maxVal) * (H - PAD_T - PAD_B));
        const fosH = ((d.fossil / maxVal) * (H - PAD_T - PAD_B));
        const renY = H - PAD_B - renH;
        const fosY = renY - fosH;
        return (
          <g key={d.year}>
            <rect x={x + 2} y={renY} width={barW - 6} height={renH} fill="#10b981" opacity={0.85} rx={1} />
            <rect x={x + 2} y={fosY} width={barW - 6} height={fosH} fill="#6b7280" opacity={0.7} rx={1} />
            <text x={x + barW / 2} y={H - 4} fontSize={8} fill="#9ca3af" textAnchor="middle">
              {d.year.slice(2)}
            </text>
          </g>
        );
      })}
      {/* legend */}
      <rect x={PAD_L} y={PAD_T - 10} width={8} height={8} fill="#10b981" rx={1} />
      <text x={PAD_L + 10} y={PAD_T - 3} fontSize={8} fill="#d1fae5">Renewables & Clean</text>
      <rect x={PAD_L + 120} y={PAD_T - 10} width={8} height={8} fill="#6b7280" rx={1} />
      <text x={PAD_L + 132} y={PAD_T - 3} fontSize={8} fill="#d1d5db">Fossil Fuel Supply</text>
    </svg>
  );
}

// ── SVG: Finance Gap ───────────────────────────────────────────────────────────

function FinanceGapChart() {
  const W = 560;
  const H = 180;
  const PAD_L = 44;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const maxVal = 6.0;

  const needPath = GAP_DATA.map((d, i) => {
    const x = svgX(i, GAP_DATA.length, W, PAD_L);
    const y = svgY(d.need, 0, maxVal, H, PAD_T, PAD_B);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  const currPath = GAP_DATA.map((d, i) => {
    const x = svgX(i, GAP_DATA.length, W, PAD_L);
    const y = svgY(d.current, 0, maxVal, H, PAD_T, PAD_B);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 1, 2, 3, 4, 5, 6].map((v) => {
        const y = svgY(v, 0, maxVal, H, PAD_T, PAD_B);
        return (
          <g key={v}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={PAD_L - 6} y={y + 4} fontSize={9} fill="#9ca3af" textAnchor="end">
              {v}T
            </text>
          </g>
        );
      })}
      {/* gap fill */}
      <path
        d={`${needPath} ${GAP_DATA.map((d, i) => {
          const idx = GAP_DATA.length - 1 - i;
          const x = svgX(idx, GAP_DATA.length, W, PAD_L);
          const y = svgY(GAP_DATA[idx].current, 0, maxVal, H, PAD_T, PAD_B);
          return `L${x},${y}`;
        }).join(" ")} Z`}
        fill="#ef4444"
        opacity={0.12}
      />
      <path d={needPath} stroke="#ef4444" strokeWidth={2} fill="none" />
      <path d={currPath} stroke="#10b981" strokeWidth={2} fill="none" strokeDasharray="5,3" />
      {/* labels */}
      {GAP_DATA.map((d, i) => (
        <text key={d.year} x={svgX(i, GAP_DATA.length, W, PAD_L)} y={H - 4} fontSize={8} fill="#9ca3af" textAnchor="middle">
          {d.year.slice(2)}
        </text>
      ))}
      <rect x={PAD_L} y={PAD_T - 10} width={8} height={3} fill="#ef4444" />
      <text x={PAD_L + 10} y={PAD_T - 4} fontSize={8} fill="#fca5a5">Finance Needed</text>
      <rect x={PAD_L + 110} y={PAD_T - 10} width={8} height={3} fill="#10b981" />
      <text x={PAD_L + 120} y={PAD_T - 4} fontSize={8} fill="#6ee7b7">Current Flows</text>
    </svg>
  );
}

// ── SVG: EU ETS Price History ──────────────────────────────────────────────────

function EuEtsPriceChart() {
  const W = 560;
  const H = 220;
  const PAD_L = 44;
  const PAD_R = 16;
  const PAD_T = 20;
  const PAD_B = 36;
  const maxVal = 110;
  const n = EU_ETS_DATA.length;

  const linePath = EU_ETS_DATA.map((d, i) => {
    const x = svgX(i, n, W, PAD_L);
    const y = svgY(d.euEts, 0, maxVal, H, PAD_T, PAD_B);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  const areaPath =
    linePath +
    ` L${svgX(n - 1, n, W, PAD_L)},${svgY(0, 0, maxVal, H, PAD_T, PAD_B)} L${svgX(0, n, W, PAD_L)},${svgY(0, 0, maxVal, H, PAD_T, PAD_B)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="etsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {[0, 20, 40, 60, 80, 100].map((v) => {
        const y = svgY(v, 0, maxVal, H, PAD_T, PAD_B);
        return (
          <g key={v}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={PAD_L - 6} y={y + 4} fontSize={9} fill="#9ca3af" textAnchor="end">
              €{v}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#etsGrad)" />
      <path d={linePath} stroke="#10b981" strokeWidth={2} fill="none" />
      {/* annotations */}
      {EU_ETS_DATA.filter((d) => d.annotate).map((d, _k) => {
        const i = EU_ETS_DATA.indexOf(d);
        const x = svgX(i, n, W, PAD_L);
        const y = svgY(d.euEts, 0, maxVal, H, PAD_T, PAD_B);
        return (
          <g key={d.year}>
            <line x1={x} x2={x} y1={y - 6} y2={PAD_T - 6} stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="3,2" />
            <circle cx={x} cy={y} r={3} fill="#f59e0b" />
          </g>
        );
      })}
      {/* x labels */}
      {EU_ETS_DATA.filter((_, i) => i % 2 === 0).map((d) => {
        const i = EU_ETS_DATA.indexOf(d);
        const x = svgX(i, n, W, PAD_L);
        return (
          <text key={d.year} x={x} y={H - 4} fontSize={8} fill="#9ca3af" textAnchor="middle">
            {d.year}
          </text>
        );
      })}
      <text x={PAD_L + 4} y={14} fontSize={9} fill="#f59e0b">
        ● policy event
      </text>
    </svg>
  );
}

// ── SVG: CDR Cost Curve ────────────────────────────────────────────────────────

function CdrCostCurve() {
  const W = 500;
  const H = 180;
  const PAD_L = 52;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const maxCost = 1100;
  const sorted = [...CDR_METHODS].sort((a, b) => a.costLo - b.costLo);
  const barH = (H - PAD_T - PAD_B) / sorted.length - 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 200, 400, 600, 800, 1000].map((v) => {
        const x = PAD_L + (v / maxCost) * (W - PAD_L - PAD_R);
        return (
          <g key={v}>
            <line x1={x} x2={x} y1={PAD_T} y2={H - PAD_B} stroke="#374151" strokeWidth={0.5} />
            <text x={x} y={H - 4} fontSize={8} fill="#9ca3af" textAnchor="middle">
              ${v}
            </text>
          </g>
        );
      })}
      {sorted.map((d, i) => {
        const y = PAD_T + i * (barH + 4);
        const xLo = PAD_L + (d.costLo / maxCost) * (W - PAD_L - PAD_R);
        const xHi = PAD_L + (d.costHi / maxCost) * (W - PAD_L - PAD_R);
        return (
          <g key={d.name}>
            <text x={PAD_L - 6} y={y + barH / 2 + 4} fontSize={8} fill="#d1d5db" textAnchor="end">
              {d.name}
            </text>
            <rect x={xLo} y={y} width={xHi - xLo} height={barH} fill="#10b981" opacity={0.6} rx={2} />
            <rect x={xLo} y={y} width={4} height={barH} fill="#10b981" opacity={0.9} rx={2} />
          </g>
        );
      })}
      <text x={PAD_L} y={PAD_T - 4} fontSize={8} fill="#9ca3af">
        Cost range $/tCO₂ removed
      </text>
    </svg>
  );
}

// ── SVG: Stranding Timeline ────────────────────────────────────────────────────

function StrandingTimeline() {
  const W = 500;
  const H = 180;
  const PAD_L = 84;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const milestones = [
    { label: "2030", pct: 0 },
    { label: "2040", pct: 50 },
    { label: "2050", pct: 100 },
  ];
  const barH = (H - PAD_T - PAD_B) / STRANDING_TIMELINE.length - 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {milestones.map((m) => {
        const x = PAD_L + (m.pct / 100) * (W - PAD_L - PAD_R);
        return (
          <g key={m.label}>
            <line x1={x} x2={x} y1={PAD_T} y2={H - PAD_B} stroke="#374151" strokeWidth={0.7} strokeDasharray="3,2" />
            <text x={x} y={H - 4} fontSize={9} fill="#9ca3af" textAnchor="middle">
              {m.label}
            </text>
          </g>
        );
      })}
      {STRANDING_TIMELINE.map((d, i) => {
        const y = PAD_T + i * (barH + 5);
        const x30 = PAD_L + (d.stranded2030 / 100) * (W - PAD_L - PAD_R);
        const x40 = PAD_L + (d.stranded2040 / 100) * (W - PAD_L - PAD_R);
        const x50 = PAD_L + (d.stranded2050 / 100) * (W - PAD_L - PAD_R);
        return (
          <g key={d.fuel}>
            <text x={PAD_L - 6} y={y + barH / 2 + 4} fontSize={8.5} fill="#d1d5db" textAnchor="end">
              {d.fuel}
            </text>
            <rect x={PAD_L} y={y} width={x50 - PAD_L} height={barH} fill={d.color} opacity={0.3} rx={2} />
            <rect x={PAD_L} y={y} width={x40 - PAD_L} height={barH} fill={d.color} opacity={0.5} rx={2} />
            <rect x={PAD_L} y={y} width={x30 - PAD_L} height={barH} fill={d.color} opacity={0.85} rx={2} />
            <text x={x30 + 3} y={y + barH / 2 + 4} fontSize={7} fill="#fff" opacity={0.7}>
              {d.stranded2030}%
            </text>
          </g>
        );
      })}
      <text x={PAD_L} y={PAD_T - 4} fontSize={8} fill="#9ca3af">
        % reserves stranded under IEA Net Zero
      </text>
    </svg>
  );
}

// ── SVG: Asset Repricing under NGFS ───────────────────────────────────────────

function NgfsRepricingChart() {
  const W = 520;
  const H = 220;
  const PAD_L = 110;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const min = -80;
  const max = 80;
  const barH = (H - PAD_T - PAD_B) / NGFS_SCENARIOS.length - 4;
  const zeroX = PAD_L + ((0 - min) / (max - min)) * (W - PAD_L - PAD_R);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map((v) => {
        const x = PAD_L + ((v - min) / (max - min)) * (W - PAD_L - PAD_R);
        return (
          <g key={v}>
            <line x1={x} x2={x} y1={PAD_T} y2={H - PAD_B} stroke={v === 0 ? "#6b7280" : "#374151"} strokeWidth={v === 0 ? 1 : 0.5} />
            <text x={x} y={H - 4} fontSize={8} fill="#9ca3af" textAnchor="middle">
              {v}%
            </text>
          </g>
        );
      })}
      {NGFS_SCENARIOS.map((d, i) => {
        const y = PAD_T + i * (barH + 4);
        const scenarios = [
          { val: d.orderlyChange, color: "#10b981", label: "Orderly" },
          { val: d.disorderlyChange, color: "#f59e0b", label: "Disorderly" },
          { val: d.hotHouseChange, color: "#ef4444", label: "Hot House" },
        ];
        const segH = barH / 3;
        return (
          <g key={d.name}>
            <text x={PAD_L - 6} y={y + barH / 2 + 4} fontSize={8} fill="#d1d5db" textAnchor="end">
              {d.name}
            </text>
            {scenarios.map((sc, si) => {
              const segY = y + si * segH;
              const barX = sc.val >= 0 ? zeroX : zeroX + (sc.val / (max - min)) * (W - PAD_L - PAD_R);
              const barWidth = Math.abs(sc.val / (max - min)) * (W - PAD_L - PAD_R);
              return (
                <rect
                  key={sc.label}
                  x={barX}
                  y={segY + 1}
                  width={barWidth}
                  height={segH - 2}
                  fill={sc.color}
                  opacity={0.75}
                  rx={1}
                />
              );
            })}
          </g>
        );
      })}
      <rect x={PAD_L} y={PAD_T - 10} width={8} height={6} fill="#10b981" />
      <text x={PAD_L + 10} y={PAD_T - 4} fontSize={7.5} fill="#6ee7b7">Orderly</text>
      <rect x={PAD_L + 60} y={PAD_T - 10} width={8} height={6} fill="#f59e0b" />
      <text x={PAD_L + 70} y={PAD_T - 4} fontSize={7.5} fill="#fde68a">Disorderly</text>
      <rect x={PAD_L + 130} y={PAD_T - 10} width={8} height={6} fill="#ef4444" />
      <text x={PAD_L + 140} y={PAD_T - 4} fontSize={7.5} fill="#fca5a5">Hot House</text>
    </svg>
  );
}

// ── SVG: Insurable Losses ─────────────────────────────────────────────────────

function InsurableLossChart() {
  const W = 520;
  const H = 180;
  const PAD_L = 48;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const maxVal = 420;
  const n = INSURABLE_DATA.length;
  const barW = (W - PAD_L - PAD_R) / n;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 100, 200, 300, 400].map((v) => {
        const y = svgY(v, 0, maxVal, H, PAD_T, PAD_B);
        return (
          <g key={v}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={PAD_L - 6} y={y + 4} fontSize={9} fill="#9ca3af" textAnchor="end">
              ${v}B
            </text>
          </g>
        );
      })}
      {INSURABLE_DATA.map((d, i) => {
        const x = PAD_L + i * barW;
        const totH = (d.total / maxVal) * (H - PAD_T - PAD_B);
        const insH = (d.insured / maxVal) * (H - PAD_T - PAD_B);
        return (
          <g key={d.year}>
            <rect x={x + 2} y={H - PAD_B - totH} width={barW - 4} height={totH} fill="#ef4444" opacity={0.5} rx={1} />
            <rect x={x + 2} y={H - PAD_B - insH} width={barW - 4} height={insH} fill="#f59e0b" opacity={0.8} rx={1} />
            <text x={x + barW / 2} y={H - 4} fontSize={7.5} fill="#9ca3af" textAnchor="middle">
              {d.year}
            </text>
          </g>
        );
      })}
      <rect x={PAD_L} y={PAD_T - 10} width={8} height={8} fill="#ef4444" opacity={0.5} />
      <text x={PAD_L + 10} y={PAD_T - 3} fontSize={8} fill="#fca5a5">Total Economic Loss</text>
      <rect x={PAD_L + 130} y={PAD_T - 10} width={8} height={8} fill="#f59e0b" opacity={0.8} />
      <text x={PAD_L + 140} y={PAD_T - 3} fontSize={8} fill="#fde68a">Insured Loss</text>
    </svg>
  );
}

// ── SVG: Taxonomy Alignment ────────────────────────────────────────────────────

function TaxonomyAlignedChart() {
  const W = 500;
  const H = 200;
  const PAD_L = 100;
  const PAD_R = 60;
  const PAD_T = 16;
  const PAD_B = 16;
  const barH = (H - PAD_T - PAD_B) / TAXONOMY_ALIGNED.length - 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 10, 20, 30, 40, 50].map((v) => {
        const x = PAD_L + (v / 50) * (W - PAD_L - PAD_R);
        return (
          <g key={v}>
            <line x1={x} x2={x} y1={PAD_T} y2={H - PAD_B} stroke="#374151" strokeWidth={0.5} />
            <text x={x} y={H - 2} fontSize={8} fill="#9ca3af" textAnchor="middle">
              {v}%
            </text>
          </g>
        );
      })}
      {TAXONOMY_ALIGNED.map((d, i) => {
        const y = PAD_T + i * (barH + 5);
        const bW = (d.aligned / 50) * (W - PAD_L - PAD_R);
        return (
          <g key={d.sector}>
            <text x={PAD_L - 6} y={y + barH / 2 + 4} fontSize={8.5} fill="#d1d5db" textAnchor="end">
              {d.sector}
            </text>
            <rect x={PAD_L} y={y} width={bW} height={barH} fill="#10b981" opacity={0.7} rx={2} />
            <text x={PAD_L + bW + 4} y={y + barH / 2 + 4} fontSize={8} fill="#6ee7b7">
              {d.aligned}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── SVG: Transition Bond Issuance (stacked) ────────────────────────────────────

function BondIssuanceChart() {
  const W = 500;
  const H = 200;
  const PAD_L = 44;
  const PAD_R = 120;
  const PAD_T = 16;
  const PAD_B = 32;
  const maxVal = 1100;
  const n = BOND_ISSUANCE.length;
  const barW = (W - PAD_L - PAD_R) / n;

  const colors = {
    green: "#10b981",
    social: "#3b82f6",
    sustainability: "#8b5cf6",
    transition: "#f59e0b",
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 200, 400, 600, 800, 1000].map((v) => {
        const y = svgY(v, 0, maxVal, H, PAD_T, PAD_B);
        return (
          <g key={v}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={PAD_L - 6} y={y + 4} fontSize={9} fill="#9ca3af" textAnchor="end">
              ${v}B
            </text>
          </g>
        );
      })}
      {BOND_ISSUANCE.map((d, i) => {
        const x = PAD_L + i * barW;
        let cumH = 0;
        const segments: { color: string; h: number; y: number; key: string }[] = [];
        (["transition", "sustainability", "social", "green"] as const).forEach((k) => {
          const h = (d[k] / maxVal) * (H - PAD_T - PAD_B);
          const segY = H - PAD_B - cumH - h;
          segments.push({ color: colors[k], h, y: segY, key: k });
          cumH += h;
        });
        return (
          <g key={d.year}>
            {segments.map((seg) => (
              <rect key={seg.key} x={x + 2} y={seg.y} width={barW - 4} height={seg.h} fill={seg.color} opacity={0.8} rx={1} />
            ))}
            <text x={x + barW / 2} y={H - 4} fontSize={8} fill="#9ca3af" textAnchor="middle">
              {d.year}
            </text>
          </g>
        );
      })}
      {/* legend */}
      {(["green", "social", "sustainability", "transition"] as const).map((k, i) => (
        <g key={k}>
          <rect x={W - PAD_R + 8} y={PAD_T + i * 18} width={8} height={8} fill={colors[k]} rx={1} />
          <text x={W - PAD_R + 20} y={PAD_T + i * 18 + 8} fontSize={8} fill="#d1d5db" textAnchor="start" style={{ textTransform: "capitalize" }}>
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function TransitionFinancePage() {
  const [activeTab, setActiveTab] = useState("landscape");
  const [selectedDisclosure, setSelectedDisclosure] = useState(0);
  const [selectedMarket, setSelectedMarket] = useState(0);
  const [expandedSector, setExpandedSector] = useState<number | null>(null);

  // memoised so PRNG doesn't re-run on re-renders
  const investData = useMemo(() => INVEST_DATA, []);
  void investData;
  const gapData = useMemo(() => GAP_DATA, []);
  void gapData;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white">
            Transition Finance &amp; Climate Risk
          </h1>
        </div>
        <p className="text-gray-400 text-sm ml-12">
          Financing the energy transition · carbon pricing · stranded assets · green taxonomy
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-900 border border-gray-800 h-auto p-1 flex-wrap gap-1">
          <TabsTrigger value="landscape" className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Globe className="w-3.5 h-3.5 mr-1" />Climate Finance
          </TabsTrigger>
          <TabsTrigger value="carbon" className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <BarChart2 className="w-3.5 h-3.5 mr-1" />Carbon Markets
          </TabsTrigger>
          <TabsTrigger value="stranded" className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />Stranded Assets
          </TabsTrigger>
          <TabsTrigger value="bonds" className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <DollarSign className="w-3.5 h-3.5 mr-1" />Bonds &amp; Taxonomy
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Climate Finance Landscape ─────────────────────────────── */}
        <TabsContent value="landscape" className="data-[state=inactive]:hidden space-y-4">
          {/* Investment trend */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Global Clean Energy vs Fossil Fuel Investment (2015–2024, $T)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnergyInvestmentChart />
              <p className="text-xs text-gray-500 mt-2">
                Renewables investment surpassed fossil fuel supply investment for the first time in 2023 at ~$1.7T vs ~$1.0T. Source: IEA World Energy Investment 2024.
              </p>
            </CardContent>
          </Card>

          {/* Public vs Private + Blended Finance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Public vs Private Capital Split</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Public / DFI / MDB", pct: 38, color: "bg-primary" },
                  { label: "Private Equity & Debt", pct: 42, color: "bg-emerald-500" },
                  { label: "Corporate Balance Sheet", pct: 14, color: "bg-primary" },
                  { label: "Retail / Crowd", pct: 6, color: "bg-amber-500" },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{row.label}</span>
                      <span className="font-mono">{row.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} opacity-80 rounded-full`} style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 pt-1">
                  Private capital must scale 3× to meet 1.5°C pathways. Blended finance de-risks first-loss to catalyse commercial flows.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Blended Finance Structures</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {BLENDED_STRUCTURES.map((b) => (
                  <div key={b.name} className="flex items-start gap-2 p-2 bg-gray-800/50 rounded-lg text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-medium text-white">{b.name}</div>
                      <div className="text-gray-400">
                        <span className="text-primary">{b.provider}</span> · Risk: {b.risk} · Return: {b.return}
                      </div>
                      <div className="text-gray-500">{b.purpose}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* $100B Pledge */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                $100B Climate Finance Pledge — Progress (2023 actuals)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold text-emerald-400">${PLEDGE_PROGRESS.delivered}B</span>
                <span className="text-gray-400 text-sm mb-1">delivered / $100B pledged</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${PLEDGE_PROGRESS.delivered}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-primary font-mono font-semibold">${PLEDGE_PROGRESS.publicSources}B</div>
                  <div className="text-gray-400 text-xs">Public bilateral / multilateral</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-emerald-400 font-mono font-semibold">${PLEDGE_PROGRESS.privateMobilised}B</div>
                  <div className="text-gray-400 text-xs">Private mobilised</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                The pledge was first met in 2022 (per OECD). New goal: $300B/yr by 2035 agreed at COP29 (Baku, 2024). Developing nations sought $1.3T.
              </p>
            </CardContent>
          </Card>

          {/* Finance Gap */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Climate Finance Gap — Need vs Current Flows ($T/yr)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FinanceGapChart />
              <p className="text-xs text-gray-500 mt-2">
                The annual gap (red shaded area) has widened to ~$3.8T by 2024. Emerging markets &amp; developing economies (EMDEs) represent 80% of unmet need.
              </p>
            </CardContent>
          </Card>

          {/* Disclosure Frameworks */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Climate Disclosure Frameworks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3 flex-wrap">
                {DISCLOSURE_FRAMEWORKS.map((f, i) => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedDisclosure(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selectedDisclosure === i
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
              {(() => {
                const f = DISCLOSURE_FRAMEWORKS[selectedDisclosure];
                return (
                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div>
                      <div className="text-white font-medium text-sm">{f.name}</div>
                      <div className="text-gray-400 text-xs">{f.full}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5">Core pillars:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {f.pillars.map((p) => (
                          <Badge key={p} variant="outline" className="text-xs border-emerald-500/40 text-emerald-300">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-gray-300">Mandatory in: <span className="text-white">{f.mandatory}</span></span>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Carbon Pricing & Markets ──────────────────────────────── */}
        <TabsContent value="carbon" className="data-[state=inactive]:hidden space-y-4">
          {/* ETS vs Tax explainer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  Cap-and-Trade ETS
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-300 space-y-2">
                <p>A regulator sets a total cap on emissions. Allowances (EUAs) are issued and can be bought, sold or banked. The market determines the price.</p>
                <div className="space-y-1">
                  {["Price certainty: Low (volatile)", "Quantity certainty: High (cap fixed)", "Examples: EU ETS, California CaT, RGGI, China NETs", "Revenues: Auction proceeds → green funds"].map((t) => (
                    <div key={t} className="flex items-start gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  Carbon Tax
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-300 space-y-2">
                <p>A fixed price is placed on each tonne of CO₂ emitted. Quantity of emission reduction is uncertain; depends on price elasticity of emitters.</p>
                <div className="space-y-1">
                  {["Price certainty: High (policy-set)", "Quantity certainty: Low (depends on response)", "Examples: Canada, Sweden (~$130/tCO₂), Singapore", "Revenues: Dividends, tax cuts or transition funds"].map((t) => (
                    <div key={t} className="flex items-start gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* EU ETS price chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">EU ETS Carbon Price History (€/tCO₂, 2005–2024)</CardTitle>
            </CardHeader>
            <CardContent>
              <EuEtsPriceChart />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                {EU_ETS_EVENTS.map((e) => (
                  <div key={e.year} className="flex items-center gap-1.5 text-xs bg-gray-800/50 rounded px-2 py-1">
                    <span className="text-amber-400 font-mono">{e.year}</span>
                    <span className="text-gray-400">{e.note}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Markets comparison table */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Carbon Markets Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3 flex-wrap">
                {CARBON_MARKETS.map((m, i) => (
                  <button
                    key={m.name}
                    onClick={() => setSelectedMarket(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selectedMarket === i
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
              {(() => {
                const m = CARBON_MARKETS[selectedMarket];
                return (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Type", value: m.type },
                      { label: "Price Range", value: m.price },
                      { label: "Coverage", value: m.coverage },
                      { label: "Vintage / Credits", value: m.vintage },
                    ].map((row) => (
                      <div key={row.label} className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-0.5">{row.label}</div>
                        <div className="text-sm text-white font-medium">{row.value}</div>
                      </div>
                    ))}
                    <div className="col-span-2 bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-0.5">Notes</div>
                      <div className="text-xs text-gray-300">{m.notes}</div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Carbon forecasts */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Carbon Price Forecasts 2030 — IEA Scenarios ($/tCO₂e)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CARBON_FORECASTS.map((row) => (
                  <div key={row.region}>
                    <div className="text-xs text-gray-400 mb-1">{row.region}</div>
                    <div className="flex items-center gap-2">
                      {[
                        { label: "SDS Base", val: row.sdsBase, color: "bg-gray-500" },
                        { label: "IEA 450ppm", val: row.iea450, color: "bg-primary" },
                        { label: "Net Zero 2050", val: row.ieanetzero, color: "bg-emerald-500" },
                      ].map((sc) => (
                        <div key={sc.label} className="flex-1">
                          <div className="text-xs text-gray-500 text-center mb-0.5">{sc.label}</div>
                          <div className="bg-gray-800 rounded h-6 relative overflow-hidden">
                            <div
                              className={`absolute left-0 top-0 bottom-0 ${sc.color} opacity-70`}
                              style={{ width: `${(sc.val / 260) * 100}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-white">
                              ${sc.val}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Article 6 + CDR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Article 6 — Paris International Trading
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-300 space-y-2">
                {[
                  { ref: "Art. 6.2", desc: "Bilateral Internationally Transferred Mitigation Outcomes (ITMOs) between countries; corresponding adjustments mandatory to avoid double-counting." },
                  { ref: "Art. 6.4", desc: "Multilateral UN-supervised mechanism (successor to CDM); Activity Cycle rules finalised at COP29 (2024). First ITMOs expected 2025." },
                  { ref: "Art. 6.8", desc: "Non-market approaches; capacity-building, adaptation co-benefits; no credits issued." },
                ].map((a) => (
                  <div key={a.ref} className="bg-gray-800/50 rounded p-2">
                    <span className="text-primary font-medium">{a.ref}:</span> {a.desc}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">CDR Cost Curves ($/tCO₂)</CardTitle>
              </CardHeader>
              <CardContent>
                <CdrCostCurve />
                <p className="text-xs text-gray-500 mt-2">
                  Afforestation remains cheapest (&lt;$50) but faces permanence risks. DAC is most permanent but costs $300–$1,000/tCO₂ today; projected to fall to ~$100 by 2040.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 3: Stranded Assets & Physical Risk ────────────────────────── */}
        <TabsContent value="stranded" className="data-[state=inactive]:hidden space-y-4">
          {/* Stranded definition */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                Stranded Assets — Definition
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-300">
              <p>
                Assets that suffer <span className="text-amber-400 font-medium">unanticipated or premature write-downs, devaluations or conversion to liabilities</span> driven by environment-related risks: policy change, technology disruption, shifting market preferences, physical climate damage, or litigation risk. The concept was formalised by Carbon Tracker (2011) with the <span className="text-white">"unburnable carbon"</span> thesis — fossil fuel reserves on company books exceed the carbon budget consistent with 2°C, implying large eventual impairments.
              </p>
            </CardContent>
          </Card>

          {/* Stranding timeline chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Fossil Fuel Reserve Stranding Timeline — IEA Net Zero Scenario</CardTitle>
            </CardHeader>
            <CardContent>
              <StrandingTimeline />
              <div className="flex gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                <span>Dark = 2030 · Medium = 2040 · Light = 2050 stranded fraction</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Under IEA NZE2050, no new coal mines are approved beyond 2021; existing coal assets face 85% stranding by 2030. Oil sands and unconventional gas follow with 5–10 year lags.
              </p>
            </CardContent>
          </Card>

          {/* Physical risks */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Physical Risk Mapping — Acute vs Chronic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PHYSICAL_RISKS.map((cat) => (
                  <div key={cat.type}>
                    <div className="flex items-center gap-2 mb-2">
                      {cat.type === "Acute" ? (
                        <Flame className="w-4 h-4 text-red-400" />
                      ) : (
                        <Droplets className="w-4 h-4 text-primary" />
                      )}
                      <span className={`text-sm font-medium ${cat.type === "Acute" ? "text-red-300" : "text-primary"}`}>
                        {cat.type} Risks
                      </span>
                    </div>
                    <div className="space-y-2">
                      {cat.events.map((ev) => (
                        <div key={ev.name}>
                          <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                            <span>{ev.name}</span>
                            <span className="text-gray-500">{ev.trend}</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${cat.type === "Acute" ? "bg-red-500" : "bg-primary"} opacity-75`}
                              style={{ width: `${ev.exposure}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* NGFS scenarios + repricing */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">NGFS Climate Scenarios — Asset Repricing (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                {[
                  { name: "Orderly", color: "border-emerald-500 text-emerald-300", desc: "Early, ambitious policy; smooth 1.5°C transition" },
                  { name: "Disorderly", color: "border-amber-500 text-amber-300", desc: "Late, abrupt policy action; high transition risk" },
                  { name: "Hot House World", color: "border-red-500 text-red-300", desc: "NDCs only; high physical risk by 2100" },
                ].map((sc) => (
                  <div key={sc.name} className={`bg-gray-800/50 rounded-lg p-2 border ${sc.color} border-opacity-40`}>
                    <div className={`font-medium mb-0.5 ${sc.color.split(" ")[1]}`}>{sc.name}</div>
                    <div className="text-gray-400">{sc.desc}</div>
                  </div>
                ))}
              </div>
              <NgfsRepricingChart />
            </CardContent>
          </Card>

          {/* Insurable losses */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                Global Insurable Losses from Natural Catastrophes ($B, 1980–2024)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InsurableLossChart />
              <p className="text-xs text-gray-500 mt-2">
                The insurance gap (total − insured, ~60%) is widening as climate risks become harder to model. Major re/insurers are withdrawing from California wildfire, Florida hurricane and Australian flood markets. Source: Munich Re NatCatSERVICE.
              </p>
            </CardContent>
          </Card>

          {/* Real estate climate overlay */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Real Estate Climate Risk Overlay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {[
                  { hazard: "Coastal Flood", at_risk: "$1.1T US", driver: "SLR + storm surge", horizon: "2030–2050" },
                  { hazard: "Wildfire WUI", at_risk: "$0.9T US", driver: "Aridity + fuel load", horizon: "2025–2040" },
                  { hazard: "Heat Stress", at_risk: "MENA, S. Asia", driver: "Wet-bulb >35°C", horizon: "2040–2060" },
                  { hazard: "River Flood", at_risk: "Europe / SE Asia", driver: "Extreme precip.", horizon: "2030–2045" },
                  { hazard: "Energy EPC Retrofit", at_risk: "EU D/E-rated bldgs", driver: "EPBD 2024 mandate", horizon: "2025–2033" },
                  { hazard: "Mortgage Stranding", at_risk: "$200B EU exposure", driver: "Brown discount", horizon: "2028–2035" },
                  { hazard: "Insurance Withdrawal", at_risk: "High-risk US zip codes", driver: "Uninsurability", horizon: "2024–2030" },
                  { hazard: "Water Scarcity", at_risk: "SW US / Australia", driver: "Drought + groundwater", horizon: "2030–2050" },
                ].map((r) => (
                  <div key={r.hazard} className="bg-gray-800/50 rounded-lg p-2">
                    <div className="font-medium text-orange-300 mb-0.5">{r.hazard}</div>
                    <div className="text-gray-300">{r.at_risk}</div>
                    <div className="text-gray-500">{r.driver}</div>
                    <div className="text-gray-600 text-xs mt-0.5">{r.horizon}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Bonds & Taxonomy ───────────────────────────────────────── */}
        <TabsContent value="bonds" className="data-[state=inactive]:hidden space-y-4">
          {/* Bond comparison */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sustainable Bond Types Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {["Type", "Use of Proceeds", "Standard", "Issuers", "Greenwash Risk", "2024 Volume"].map((h) => (
                        <th key={h} className="text-left py-2 pr-3 text-gray-500 font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {BOND_COMPARISON.map((b) => {
                      const riskColor =
                        b.greenwash === "High"
                          ? "text-red-400"
                          : b.greenwash === "Medium"
                          ? "text-amber-400"
                          : "text-emerald-400";
                      return (
                        <tr key={b.type} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="py-2 pr-3 font-medium text-white whitespace-nowrap">{b.type}</td>
                          <td className="py-2 pr-3 text-gray-300">{b.proceeds}</td>
                          <td className="py-2 pr-3 text-gray-400">{b.standard}</td>
                          <td className="py-2 pr-3 text-gray-400">{b.issuer}</td>
                          <td className={`py-2 pr-3 font-medium ${riskColor}`}>{b.greenwash}</td>
                          <td className="py-2 pr-3 text-emerald-400 font-mono">{b.size2024}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Bond issuance chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sustainable Bond Issuance 2019–2024 ($B, stacked)</CardTitle>
            </CardHeader>
            <CardContent>
              <BondIssuanceChart />
              <p className="text-xs text-gray-500 mt-2">
                Cumulative sustainable bond issuance exceeded $5T by end-2024. Transition bonds remain a small but fast-growing segment as hard-to-abate sectors adopt credentialed frameworks.
              </p>
            </CardContent>
          </Card>

          {/* EU Taxonomy */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-400" />
                EU Taxonomy — 6 Environmental Objectives + DNSH
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {TAXONOMY_OBJECTIVES.map((obj) => (
                  <div key={obj.id} className="flex items-start gap-2 bg-gray-800/50 rounded-lg p-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-xs text-emerald-400 font-bold">
                      {obj.id}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{obj.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{obj.examples[0]}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs">
                <div className="font-medium text-amber-300 mb-1">Do No Significant Harm (DNSH) Test</div>
                <p className="text-gray-300">
                  An activity can only be Taxonomy-aligned for one objective if it does <em>not significantly harm</em> any of the other five. This cross-cutting requirement substantially narrows eligible activities — e.g. a hydropower plant that substantially harms biodiversity cannot be aligned under Objective 1 (mitigation).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Taxonomy aligned revenue */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">EU Taxonomy-Aligned Revenue by Sector (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <TaxonomyAlignedChart />
              <p className="text-xs text-gray-500 mt-2">
                Only 6–42% of reported turnover is Taxonomy-aligned across sectors. Low scores reflect either genuine non-alignment or lack of technical screening criteria (e.g. agriculture Delegated Acts not yet finalised).
              </p>
            </CardContent>
          </Card>

          {/* Hard-to-abate sectors */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Hard-to-Abate Sectors — Transition Finance Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {HARD_TO_ABATE.map((s, i) => (
                <motion.div
                  key={s.sector}
                  className="bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setExpandedSector(expandedSector === i ? null : i)}
                >
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <Wind className="w-4 h-4 text-orange-400 shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-white">{s.sector}</span>
                        <span className="ml-2 text-xs text-gray-500">{s.share}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-300">
                        {s.financeNeed}
                      </Badge>
                      <ArrowRight
                        className={`w-3.5 h-3.5 text-gray-500 transition-transform ${expandedSector === i ? "rotate-90" : ""}`}
                      />
                    </div>
                  </div>
                  {expandedSector === i && (
                    <div className="px-3 pb-3 space-y-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Decarbonisation pathways:</div>
                        <div className="flex flex-wrap gap-1">
                          {s.pathways.map((p) => (
                            <Badge key={p} variant="outline" className="text-xs border-emerald-500/30 text-emerald-300">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-gray-400">{s.challenge}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Greenwashing indicators */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Greenwashing Risk Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {GREENWASH_INDICATORS.map((g) => {
                  const high = g.severity === "High";
                  return (
                    <div
                      key={g.flag}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs ${
                        high ? "bg-red-500/10 border border-red-500/20" : "bg-amber-500/10 border border-amber-500/20"
                      }`}
                    >
                      {high ? (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className={high ? "text-red-200" : "text-amber-200"}>{g.flag}</span>
                      <span className="ml-auto text-gray-500 whitespace-nowrap">{g.type}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs whitespace-nowrap ${
                          high ? "border-red-500/40 text-red-300" : "border-amber-500/40 text-amber-300"
                        }`}
                      >
                        {g.severity}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Regulators including ESMA, SEC, FCA and ASIC have all issued greenwashing enforcement actions 2023–2024. The EU Anti-Greenwashing Directive (2024) bans generic environmental claims without substantiation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
