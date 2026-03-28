"use client";

import { useState, useMemo } from "react";
import {
  Leaf,
  Globe,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  Info,
  Zap,
  Wind,
  Droplets,
  Shield,
  FileText,
  Target,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 682002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function randBetween(lo: number, hi: number) {
  return lo + rand() * (hi - lo);
}

// ── Interfaces ─────────────────────────────────────────────────────────────────

interface MarketPricePoint {
  month: string;
  euets: number;
  california: number;
  rggi: number;
  vcm: number;
}

interface CarbonMarket {
  name: string;
  abbr: string;
  type: "Compliance" | "Voluntary";
  region: string;
  currentPrice: number;
  priceChange: number;
  coverage: string;
  sectorsCount: number;
  annualVolume: number;
  color: string;
}

interface CreditType {
  name: string;
  standard: string;
  type: "Compliance" | "Voluntary";
  additionality: number;
  permanence: number;
  cobenefits: number;
  verificationRigour: number;
  avgPrice: number;
  qualityScore: number;
  description: string;
}

interface NetZeroSector {
  sector: string;
  strandedRisk: number;
  transitionOpportunity: number;
  capexRequired: string;
  timelineYears: number;
  parisAligned: boolean;
  keyDriver: string;
}

interface ClimateEtf {
  ticker: string;
  name: string;
  aum: number;
  expenseRatio: number;
  ytdReturn: number;
  focus: string;
  holdings: number;
  inceptionYear: number;
}

interface TcfdScenario {
  scenario: string;
  temp: string;
  physicalRisk: number;
  transitionRisk: number;
  financialImpact: string;
  stranded: string;
  description: string;
  color: string;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const MARKETS: CarbonMarket[] = [
  {
    name: "EU Emissions Trading System",
    abbr: "EU ETS",
    type: "Compliance",
    region: "European Union",
    currentPrice: 68.4,
    priceChange: 3.2,
    coverage: "45% of EU emissions",
    sectorsCount: 5,
    annualVolume: 1590,
    color: "#3b82f6",
  },
  {
    name: "California Cap-and-Trade",
    abbr: "CA CaT",
    type: "Compliance",
    region: "California, USA",
    currentPrice: 38.7,
    priceChange: -1.1,
    coverage: "85% of CA emissions",
    sectorsCount: 3,
    annualVolume: 340,
    color: "#f59e0b",
  },
  {
    name: "Regional Greenhouse Gas Initiative",
    abbr: "RGGI",
    type: "Compliance",
    region: "11 US States",
    currentPrice: 14.2,
    priceChange: 0.8,
    coverage: "Power sector only",
    sectorsCount: 1,
    annualVolume: 180,
    color: "#10b981",
  },
  {
    name: "Voluntary Carbon Market",
    abbr: "VCM",
    type: "Voluntary",
    region: "Global",
    currentPrice: 5.1,
    priceChange: -0.3,
    coverage: "Broad economy",
    sectorsCount: 12,
    annualVolume: 2000,
    color: "#8b5cf6",
  },
];

const CREDIT_TYPES: CreditType[] = [
  {
    name: "REDD+ Forest Credits",
    standard: "Verra VCS",
    type: "Voluntary",
    additionality: 72,
    permanence: 65,
    cobenefits: 88,
    verificationRigour: 78,
    avgPrice: 8.4,
    qualityScore: 76,
    description: "Reduced emissions from deforestation and forest degradation in tropical regions.",
  },
  {
    name: "Renewable Energy Credits",
    standard: "Gold Standard",
    type: "Voluntary",
    additionality: 85,
    permanence: 92,
    cobenefits: 70,
    verificationRigour: 90,
    avgPrice: 12.3,
    qualityScore: 84,
    description: "Verified renewable energy generation displacing fossil fuel power.",
  },
  {
    name: "Industrial Efficiency Credits",
    standard: "Verra VCS",
    type: "Voluntary",
    additionality: 90,
    permanence: 95,
    cobenefits: 45,
    verificationRigour: 88,
    avgPrice: 6.7,
    qualityScore: 80,
    description: "Emission reductions from industrial process improvements and efficiency gains.",
  },
  {
    name: "Direct Air Capture",
    standard: "Puro Standard",
    type: "Voluntary",
    additionality: 98,
    permanence: 99,
    cobenefits: 38,
    verificationRigour: 96,
    avgPrice: 420,
    qualityScore: 95,
    description: "High-quality permanent carbon removal via engineered DAC technology.",
  },
  {
    name: "EU ETS Allowances",
    standard: "EU Directive",
    type: "Compliance",
    additionality: 95,
    permanence: 98,
    cobenefits: 50,
    verificationRigour: 97,
    avgPrice: 68.4,
    qualityScore: 93,
    description: "Regulatory allowances under the European Union Emissions Trading System.",
  },
  {
    name: "Soil Carbon Credits",
    standard: "American Carbon Registry",
    type: "Voluntary",
    additionality: 68,
    permanence: 58,
    cobenefits: 82,
    verificationRigour: 72,
    avgPrice: 4.2,
    qualityScore: 68,
    description: "Credits from improved agricultural practices that sequester carbon in soils.",
  },
];

const NET_ZERO_SECTORS: NetZeroSector[] = [
  {
    sector: "Oil & Gas",
    strandedRisk: 88,
    transitionOpportunity: 45,
    capexRequired: "$3.8T",
    timelineYears: 10,
    parisAligned: false,
    keyDriver: "Stranded reserves, carbon price exposure",
  },
  {
    sector: "Utilities",
    strandedRisk: 72,
    transitionOpportunity: 82,
    capexRequired: "$5.2T",
    timelineYears: 12,
    parisAligned: true,
    keyDriver: "Grid decarbonization, renewable buildout",
  },
  {
    sector: "Autos & Transport",
    strandedRisk: 65,
    transitionOpportunity: 78,
    capexRequired: "$2.1T",
    timelineYears: 15,
    parisAligned: true,
    keyDriver: "EV transition, ICE phase-out regulations",
  },
  {
    sector: "Steel & Cement",
    strandedRisk: 70,
    transitionOpportunity: 55,
    capexRequired: "$1.4T",
    timelineYears: 18,
    parisAligned: false,
    keyDriver: "Hard-to-abate, green hydrogen needed",
  },
  {
    sector: "Real Estate",
    strandedRisk: 48,
    transitionOpportunity: 60,
    capexRequired: "$900B",
    timelineYears: 20,
    parisAligned: true,
    keyDriver: "Building retrofits, energy efficiency mandates",
  },
  {
    sector: "Financials",
    strandedRisk: 35,
    transitionOpportunity: 72,
    capexRequired: "N/A",
    timelineYears: 8,
    parisAligned: true,
    keyDriver: "Portfolio alignment, green lending growth",
  },
  {
    sector: "Clean Technology",
    strandedRisk: 8,
    transitionOpportunity: 97,
    capexRequired: "$1.1T",
    timelineYears: 5,
    parisAligned: true,
    keyDriver: "Beneficiary: solar, wind, battery, CCS",
  },
  {
    sector: "Agriculture",
    strandedRisk: 42,
    transitionOpportunity: 58,
    capexRequired: "$600B",
    timelineYears: 25,
    parisAligned: false,
    keyDriver: "Methane reduction, carbon sequestration",
  },
];

const CLIMATE_ETFS: ClimateEtf[] = [
  {
    ticker: "ICLN",
    name: "iShares Global Clean Energy ETF",
    aum: 3.1,
    expenseRatio: 0.4,
    ytdReturn: 12.4,
    focus: "Global Clean Energy",
    holdings: 103,
    inceptionYear: 2008,
  },
  {
    ticker: "QCLN",
    name: "First Trust NASDAQ Clean Edge",
    aum: 1.8,
    expenseRatio: 0.58,
    ytdReturn: 18.7,
    focus: "US Clean Energy Tech",
    holdings: 46,
    inceptionYear: 2007,
  },
  {
    ticker: "SMOG",
    name: "VanEck Low Carbon Energy ETF",
    aum: 0.28,
    expenseRatio: 0.49,
    ytdReturn: 9.1,
    focus: "Low Carbon Transition",
    holdings: 30,
    inceptionYear: 2007,
  },
  {
    ticker: "CLMA",
    name: "iShares MSCI Climate Aware",
    aum: 0.72,
    expenseRatio: 0.15,
    ytdReturn: 6.8,
    focus: "Broad Climate Tilt",
    holdings: 312,
    inceptionYear: 2022,
  },
  {
    ticker: "GRID",
    name: "First Trust NASDAQ Clean Edge Smart Grid",
    aum: 0.9,
    expenseRatio: 0.58,
    ytdReturn: 14.2,
    focus: "Grid Infrastructure",
    holdings: 68,
    inceptionYear: 2009,
  },
  {
    ticker: "ACES",
    name: "ALPS Clean Energy ETF",
    aum: 0.45,
    expenseRatio: 0.55,
    ytdReturn: 22.1,
    focus: "N. America Clean Energy",
    holdings: 30,
    inceptionYear: 2018,
  },
];

const TCFD_SCENARIOS: TcfdScenario[] = [
  {
    scenario: "1.5°C Aligned",
    temp: "1.5°C",
    physicalRisk: 22,
    transitionRisk: 88,
    financialImpact: "−12% to −28%",
    stranded: "High fossil stranded",
    description:
      "Net-zero by 2050. Rapid policy tightening, high carbon prices ($150–250/t by 2040). Significant fossil fuel stranded assets. Clean energy winners.",
    color: "#10b981",
  },
  {
    scenario: "Orderly 2°C",
    temp: "2°C",
    physicalRisk: 38,
    transitionRisk: 62,
    financialImpact: "−6% to −18%",
    stranded: "Moderate fossil risk",
    description:
      "Balanced transition. Carbon prices rise gradually ($80–120/t by 2040). Physical risks manageable. Mixed sector impacts with transition winners.",
    color: "#f59e0b",
  },
  {
    scenario: "Disorderly 2°C",
    temp: "2°C delayed",
    physicalRisk: 52,
    transitionRisk: 78,
    financialImpact: "−15% to −35%",
    stranded: "Severe double-hit",
    description:
      "Delayed then abrupt policy shift. Worst of both worlds — physical damage accumulates then sudden policy shock. High financial instability risk.",
    color: "#ef4444",
  },
  {
    scenario: "Hot House 3°C+",
    temp: "3°C+",
    physicalRisk: 85,
    transitionRisk: 18,
    financialImpact: "−20% to −50%",
    stranded: "Catastrophic physical",
    description:
      "Business as usual. Low near-term transition risk but catastrophic physical damage by 2070–2100. Infrastructure, agriculture, coastal assets devastated.",
    color: "#7c3aed",
  },
];

// ── Generate price history with seeded PRNG ────────────────────────────────────

const PRICE_HISTORY: MarketPricePoint[] = (() => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    "Jan'25", "Feb'25", "Mar'25",
  ];
  let euets = 52;
  let california = 32;
  let rggi = 11;
  let vcm = 6;
  return months.map((month) => {
    euets = Math.max(20, euets + randBetween(-4, 6));
    california = Math.max(15, california + randBetween(-2, 3));
    rggi = Math.max(8, rggi + randBetween(-1, 1.5));
    vcm = Math.max(2, vcm + randBetween(-0.5, 0.8));
    return {
      month,
      euets: +euets.toFixed(2),
      california: +california.toFixed(2),
      rggi: +rggi.toFixed(2),
      vcm: +vcm.toFixed(2),
    };
  });
})();

// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-green-400";
  if (score >= 55) return "text-yellow-400";
  return "text-red-400";
}

function riskColor(risk: number): string {
  if (risk >= 75) return "#ef4444";
  if (risk >= 50) return "#f59e0b";
  if (risk >= 30) return "#3b82f6";
  return "#10b981";
}

function oppColor(opp: number): string {
  if (opp >= 75) return "#10b981";
  if (opp >= 50) return "#3b82f6";
  if (opp >= 30) return "#f59e0b";
  return "#ef4444";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function PriceHistoryChart({ data }: { data: MarketPricePoint[] }) {
  const W = 700;
  const H = 220;
  const PAD = { top: 16, right: 16, bottom: 32, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allVals = data.flatMap((d) => [d.euets, d.california, d.rggi, d.vcm]);
  const minVal = Math.min(...allVals) * 0.9;
  const maxVal = Math.max(...allVals) * 1.1;

  const xScale = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const yScale = (v: number) =>
    PAD.top + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  function makePath(key: keyof Omit<MarketPricePoint, "month">) {
    return data
      .map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(d[key]).toFixed(1)}`)
      .join(" ");
  }

  const lines: { key: keyof Omit<MarketPricePoint, "month">; color: string; label: string }[] = [
    { key: "euets", color: "#3b82f6", label: "EU ETS" },
    { key: "california", color: "#f59e0b", label: "CA CaT" },
    { key: "rggi", color: "#10b981", label: "RGGI" },
    { key: "vcm", color: "#8b5cf6", label: "VCM" },
  ];

  const yTicks = 5;
  const yTickVals = Array.from({ length: yTicks }, (_, i) =>
    minVal + ((maxVal - minVal) * i) / (yTicks - 1)
  );

  const xStep = Math.ceil(data.length / 6);
  const xLabels = data
    .map((d, i) => ({ label: d.month, i }))
    .filter((_, i) => i % xStep === 0);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 340 }}>
        {/* Grid lines */}
        {yTickVals.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yScale(v)}
              y2={yScale(v)}
              stroke="#334155"
              strokeDasharray="3 3"
            />
            <text
              x={PAD.left - 6}
              y={yScale(v) + 4}
              textAnchor="end"
              fontSize={9}
              fill="#94a3b8"
            >
              ${v.toFixed(0)}
            </text>
          </g>
        ))}
        {/* X labels */}
        {xLabels.map(({ label, i }) => (
          <text
            key={i}
            x={xScale(i)}
            y={H - 6}
            textAnchor="middle"
            fontSize={9}
            fill="#64748b"
          >
            {label}
          </text>
        ))}
        {/* Lines */}
        {lines.map((l) => (
          <path
            key={l.key}
            d={makePath(l.key)}
            fill="none"
            stroke={l.color}
            strokeWidth={2}
          />
        ))}
        {/* Legend */}
        {lines.map((l, i) => (
          <g key={l.key} transform={`translate(${PAD.left + i * 90},${PAD.top})`}>
            <rect width={20} height={3} y={5} fill={l.color} rx={1} />
            <text x={24} y={11} fontSize={9} fill="#94a3b8">
              {l.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function SectorTransitionChart({ sectors }: { sectors: NetZeroSector[] }) {
  const W = 500;
  const H = 340;
  const PAD = { top: 20, right: 20, bottom: 40, left: 100 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const barH = Math.floor(innerH / sectors.length) - 4;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300 }}>
        {/* Y axis sector labels */}
        {sectors.map((s, i) => {
          const y = PAD.top + i * (innerH / sectors.length) + barH / 2 + 4;
          return (
            <text key={s.sector} x={PAD.left - 8} y={y} textAnchor="end" fontSize={9} fill="#94a3b8">
              {s.sector}
            </text>
          );
        })}
        {/* X axis */}
        <line x1={PAD.left} x2={PAD.left + innerW} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="#334155" />
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left + (v / 100) * innerW}
              x2={PAD.left + (v / 100) * innerW}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="#1e293b"
            />
            <text
              x={PAD.left + (v / 100) * innerW}
              y={H - PAD.bottom + 14}
              textAnchor="middle"
              fontSize={9}
              fill="#64748b"
            >
              {v}%
            </text>
          </g>
        ))}
        {/* Bars */}
        {sectors.map((s, i) => {
          const rowY = PAD.top + i * (innerH / sectors.length);
          const riskW = (s.strandedRisk / 100) * innerW;
          const oppW = (s.transitionOpportunity / 100) * innerW;
          return (
            <g key={s.sector}>
              {/* Stranded risk bar (top) */}
              <rect
                x={PAD.left}
                y={rowY + 1}
                width={riskW}
                height={barH / 2 - 2}
                fill={riskColor(s.strandedRisk)}
                opacity={0.75}
                rx={2}
              />
              {/* Transition opportunity bar (bottom) */}
              <rect
                x={PAD.left}
                y={rowY + barH / 2 + 1}
                width={oppW}
                height={barH / 2 - 2}
                fill={oppColor(s.transitionOpportunity)}
                opacity={0.75}
                rx={2}
              />
            </g>
          );
        })}
        {/* Legend */}
        <rect x={PAD.left} y={H - 10} width={12} height={6} fill="#ef4444" opacity={0.75} rx={1} />
        <text x={PAD.left + 16} y={H - 4} fontSize={9} fill="#94a3b8">Stranded Risk</text>
        <rect x={PAD.left + 110} y={H - 10} width={12} height={6} fill="#10b981" opacity={0.75} rx={1} />
        <text x={PAD.left + 126} y={H - 4} fontSize={9} fill="#94a3b8">Transition Opportunity</text>
      </svg>
    </div>
  );
}

function TcfdScenarioChart({ scenarios }: { scenarios: TcfdScenario[] }) {
  const W = 500;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 36, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const groupW = innerW / scenarios.length;
  const barW = groupW * 0.3;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300 }}>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={PAD.top + innerH - (v / 100) * innerH}
              y2={PAD.top + innerH - (v / 100) * innerH}
              stroke="#1e293b"
            />
            <text x={PAD.left - 4} y={PAD.top + innerH - (v / 100) * innerH + 4} textAnchor="end" fontSize={9} fill="#64748b">
              {v}
            </text>
          </g>
        ))}
        {scenarios.map((sc, i) => {
          const cx = PAD.left + i * groupW + groupW / 2;
          const phY = PAD.top + innerH - (sc.physicalRisk / 100) * innerH;
          const trY = PAD.top + innerH - (sc.transitionRisk / 100) * innerH;
          const baseY = PAD.top + innerH;
          return (
            <g key={sc.scenario}>
              <rect
                x={cx - barW - 2}
                y={phY}
                width={barW}
                height={baseY - phY}
                fill="#ef4444"
                opacity={0.7}
                rx={2}
              />
              <rect
                x={cx + 2}
                y={trY}
                width={barW}
                height={baseY - trY}
                fill="#3b82f6"
                opacity={0.7}
                rx={2}
              />
              <text x={cx} y={H - PAD.bottom + 12} textAnchor="middle" fontSize={8} fill={sc.color} fontWeight="600">
                {sc.temp}
              </text>
              <text x={cx} y={H - PAD.bottom + 24} textAnchor="middle" fontSize={7.5} fill="#64748b">
                {sc.scenario.split(" ")[0]}
              </text>
            </g>
          );
        })}
        {/* Legend */}
        <rect x={PAD.left} y={H - 4} width={10} height={5} fill="#ef4444" opacity={0.7} rx={1} />
        <text x={PAD.left + 14} y={H} fontSize={9} fill="#94a3b8">Physical Risk</text>
        <rect x={PAD.left + 100} y={H - 4} width={10} height={5} fill="#3b82f6" opacity={0.7} rx={1} />
        <text x={PAD.left + 114} y={H} fontSize={9} fill="#94a3b8">Transition Risk</text>
      </svg>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CarbonMarketsPage() {
  const [selectedMarket, setSelectedMarket] = useState<string>("EU ETS");
  const [selectedCredit, setSelectedCredit] = useState<CreditType | null>(null);

  const selectedMarketData = useMemo(
    () => MARKETS.find((m) => m.abbr === selectedMarket) ?? MARKETS[0],
    [selectedMarket]
  );

  const totalMarketVolume = useMemo(
    () => MARKETS.reduce((a, m) => a + m.annualVolume, 0),
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3"
      >
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Leaf className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Carbon Markets &amp; Climate Finance</h1>
          <p className="text-xs text-muted-foreground">
            EU ETS · California Cap-and-Trade · RGGI · Voluntary Carbon Market · TCFD
          </p>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap justify-end">
          {MARKETS.map((m) => (
            <Badge
              key={m.abbr}
              variant={m.type === "Compliance" ? "default" : "secondary"}
              className="text-xs"
            >
              {m.abbr}: ${m.currentPrice.toFixed(1)}/t
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="overview" className="text-xs">
            <Globe className="w-3 h-3 mr-1" />
            Market Overview
          </TabsTrigger>
          <TabsTrigger value="credits" className="text-xs">
            <Leaf className="w-3 h-3 mr-1" />
            Carbon Credits
          </TabsTrigger>
          <TabsTrigger value="netzero" className="text-xs">
            <Target className="w-3 h-3 mr-1" />
            Net Zero Investing
          </TabsTrigger>
          <TabsTrigger value="etfs" className="text-xs">
            <BarChart2 className="w-3 h-3 mr-1" />
            Climate ETFs &amp; Funds
          </TabsTrigger>
          <TabsTrigger value="tcfd" className="text-xs">
            <FileText className="w-3 h-3 mr-1" />
            TCFD Framework
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Carbon Market Overview ── */}
        <TabsContent value="overview" className="space-y-4">
          {/* Market cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MARKETS.map((m) => (
              <motion.div
                key={m.abbr}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedMarket(m.abbr)}
                className={`cursor-pointer rounded-xl border p-3 space-y-1 transition-colors ${
                  selectedMarket === m.abbr
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-border bg-card hover:border-border/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{m.abbr}</span>
                  <Badge variant={m.type === "Compliance" ? "default" : "secondary"} className="text-[10px]">
                    {m.type}
                  </Badge>
                </div>
                <div className="text-2xl font-bold" style={{ color: m.color }}>
                  ${m.currentPrice.toFixed(1)}
                  <span className="text-xs text-muted-foreground">/t CO₂e</span>
                </div>
                <div className="flex items-center gap-1">
                  {m.priceChange >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-400" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      m.priceChange >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {m.priceChange >= 0 ? "+" : ""}
                    {m.priceChange.toFixed(1)} today
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{m.coverage}</p>
                <p className="text-[10px] text-muted-foreground">
                  Vol: {m.annualVolume.toLocaleString()}M t/yr
                </p>
              </motion.div>
            ))}
          </div>

          {/* Price history chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Carbon Price History — 15 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceHistoryChart data={PRICE_HISTORY} />
            </CardContent>
          </Card>

          {/* Price comparison table + selected detail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Market Comparison Table</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Market</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Price</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Chg</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Ann. Vol (Mt)</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Sectors</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MARKETS.map((m) => (
                      <tr
                        key={m.abbr}
                        className={`border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors ${
                          selectedMarket === m.abbr ? "bg-muted/40" : ""
                        }`}
                        onClick={() => setSelectedMarket(m.abbr)}
                      >
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: m.color }}
                            />
                            <span className="font-medium">{m.abbr}</span>
                          </div>
                          <div className="text-muted-foreground text-[10px]">{m.region}</div>
                        </td>
                        <td className="text-right py-2 font-mono font-semibold">
                          ${m.currentPrice.toFixed(1)}
                        </td>
                        <td
                          className={`text-right py-2 font-mono ${
                            m.priceChange >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {m.priceChange >= 0 ? "+" : ""}
                          {m.priceChange.toFixed(1)}
                        </td>
                        <td className="text-right py-2 font-mono">{m.annualVolume.toLocaleString()}</td>
                        <td className="text-right py-2">{m.sectorsCount}</td>
                        <td className="text-center py-2">
                          <Badge
                            variant={m.type === "Compliance" ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {m.type}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedMarketData.color }}
                  />
                  {selectedMarketData.abbr} Detail
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-xs font-medium">{selectedMarketData.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Region</p>
                  <p className="text-xs">{selectedMarketData.region}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Coverage</p>
                  <p className="text-xs">{selectedMarketData.coverage}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Annual Volume</p>
                  <p className="text-xs font-mono">{selectedMarketData.annualVolume.toLocaleString()}M tonnes CO₂e/yr</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Market Share of Volume</p>
                  <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(selectedMarketData.annualVolume / totalMarketVolume) * 100}%`,
                        backgroundColor: selectedMarketData.color,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {((selectedMarketData.annualVolume / totalMarketVolume) * 100).toFixed(1)}% of shown markets
                  </p>
                </div>
                <div className="border-t border-border pt-2">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {selectedMarketData.type === "Compliance"
                      ? "Compliance market — regulated by government. Participation mandatory for covered entities. Allowances have legal backstop."
                      : "Voluntary market — driven by corporate net-zero commitments. Credit quality varies significantly. No government mandate."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2: Carbon Credits ── */}
        <TabsContent value="credits" className="space-y-4">
          {/* Concept cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
                title: "Additionality",
                desc: "Emission reduction would not have occurred without the carbon credit project. The core validity test — if it would have happened anyway, the credit is worthless.",
                color: "text-emerald-400",
              },
              {
                icon: <Shield className="w-4 h-4 text-blue-400" />,
                title: "Permanence",
                desc: "The carbon stored or avoided must be durable over time. Forestry credits risk reversal from fires or disease. DAC credits offer near-perfect permanence.",
                color: "text-blue-400",
              },
              {
                icon: <Globe className="w-4 h-4 text-amber-400" />,
                title: "Co-Benefits",
                desc: "Secondary benefits beyond carbon: biodiversity, community development, clean water, biodiversity, SDG alignment. Gold Standard requires social co-benefits.",
                color: "text-amber-400",
              },
              {
                icon: <FileText className="w-4 h-4 text-purple-400" />,
                title: "Verra VCS",
                desc: "Verified Carbon Standard — world's largest voluntary carbon market standard. Rigorous third-party verification. VCUs (Verified Carbon Units) issued upon project approval.",
                color: "text-purple-400",
              },
              {
                icon: <Activity className="w-4 h-4 text-rose-400" />,
                title: "Gold Standard",
                desc: "Highest rigour voluntary standard co-founded by WWF. Requires SDG co-benefits documentation. Used by corporates seeking premium quality credits.",
                color: "text-rose-400",
              },
              {
                icon: <Zap className="w-4 h-4 text-cyan-400" />,
                title: "Leakage Risk",
                desc: "When a project displaces emissions elsewhere rather than eliminating them. A protected forest may push logging to adjacent land. Registries apply leakage deductions.",
                color: "text-cyan-400",
              },
            ].map((c) => (
              <Card key={c.title} className="border-border/60">
                <CardContent className="pt-4 space-y-1">
                  <div className="flex items-center gap-2">
                    {c.icon}
                    <span className={`text-sm font-semibold ${c.color}`}>{c.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quality scoring table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Carbon Credit Quality Scoring</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Credit Type</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Standard</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Additional.</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Permanence</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Co-Benefits</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Verification</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Avg Price</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {CREDIT_TYPES.map((c) => (
                    <tr
                      key={c.name}
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedCredit(selectedCredit?.name === c.name ? null : c)}
                    >
                      <td className="py-2">
                        <div className="font-medium">{c.name}</div>
                        <Badge
                          variant={c.type === "Compliance" ? "default" : "secondary"}
                          className="text-[10px] mt-0.5"
                        >
                          {c.type}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground">{c.standard}</td>
                      {[c.additionality, c.permanence, c.cobenefits, c.verificationRigour].map((v, vi) => (
                        <td key={vi} className="text-right py-2">
                          <span className={scoreColor(v)}>{v}%</span>
                        </td>
                      ))}
                      <td className="text-right py-2 font-mono font-semibold">
                        ${c.avgPrice < 100 ? c.avgPrice.toFixed(1) : c.avgPrice.toFixed(0)}
                      </td>
                      <td className="text-right py-2">
                        <span className={`font-bold ${scoreColor(c.qualityScore)}`}>
                          {c.qualityScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Selected credit detail */}
          {selectedCredit && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{selectedCredit.name}</h3>
                <span className={`text-sm font-bold ${scoreColor(selectedCredit.qualityScore)}`}>
                  Quality Score: {selectedCredit.qualityScore}/100
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{selectedCredit.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Additionality", value: selectedCredit.additionality },
                  { label: "Permanence", value: selectedCredit.permanence },
                  { label: "Co-Benefits", value: selectedCredit.cobenefits },
                  { label: "Verification", value: selectedCredit.verificationRigour },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="text-[10px] text-muted-foreground mb-1">{m.label}</p>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${m.value}%`,
                          backgroundColor: m.value >= 80 ? "#10b981" : m.value >= 60 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                    <p className={`text-xs font-medium mt-0.5 ${scoreColor(m.value)}`}>{m.value}%</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </TabsContent>

        {/* ── Tab 3: Net Zero Investing ── */}
        <TabsContent value="netzero" className="space-y-4">
          {/* Paris / Net Zero info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: <Globe className="w-4 h-4 text-blue-400" />,
                title: "Paris Agreement",
                stat: "1.5°C",
                desc: "Limit warming to well below 2°C, pursuing 1.5°C. Requires net-zero global CO₂ by ~2050. 195 parties signed. NDCs (Nationally Determined Contributions) updated every 5 years.",
              },
              {
                icon: <Target className="w-4 h-4 text-emerald-400" />,
                title: "Net Zero Pathways",
                stat: "2050",
                desc: "IEA NZE scenario requires no new fossil fuel development from 2021. Massive scale-up of solar, wind, EVs, hydrogen. Energy efficiency doubles. Carbon removal needed for residual emissions.",
              },
              {
                icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
                title: "Stranded Asset Risk",
                stat: "$1T+",
                desc: "Fossil fuel reserves that may become uneconomical before end of useful life. Carbon prices, regulations, and demand destruction can strand reserves. Largest holders face mark-down risk.",
              },
            ].map((c) => (
              <Card key={c.title} className="border-border/60">
                <CardContent className="pt-4 space-y-1">
                  <div className="flex items-center gap-2">
                    {c.icon}
                    <span className="text-sm font-semibold">{c.title}</span>
                    <span className="ml-auto text-lg font-bold text-muted-foreground">{c.stat}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sector transition risk chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sector Stranded Risk vs Transition Opportunity</CardTitle>
              </CardHeader>
              <CardContent>
                <SectorTransitionChart sectors={NET_ZERO_SECTORS} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sector Transition Detail</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-1.5 text-muted-foreground font-medium">Sector</th>
                      <th className="text-right py-1.5 text-muted-foreground font-medium">Stranded</th>
                      <th className="text-right py-1.5 text-muted-foreground font-medium">Opp.</th>
                      <th className="text-right py-1.5 text-muted-foreground font-medium">Capex</th>
                      <th className="text-center py-1.5 text-muted-foreground font-medium">Paris</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NET_ZERO_SECTORS.map((s) => (
                      <tr key={s.sector} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-1.5 font-medium">{s.sector}</td>
                        <td className="text-right py-1.5">
                          <span
                            style={{ color: riskColor(s.strandedRisk) }}
                            className="font-medium"
                          >
                            {s.strandedRisk}%
                          </span>
                        </td>
                        <td className="text-right py-1.5">
                          <span
                            style={{ color: oppColor(s.transitionOpportunity) }}
                            className="font-medium"
                          >
                            {s.transitionOpportunity}%
                          </span>
                        </td>
                        <td className="text-right py-1.5 font-mono">{s.capexRequired}</td>
                        <td className="text-center py-1.5">
                          {s.parisAligned ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Key drivers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Transition Economy Key Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {NET_ZERO_SECTORS.map((s) => (
                  <div key={s.sector} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20">
                    <div
                      className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: riskColor(s.strandedRisk) }}
                    />
                    <div>
                      <span className="text-xs font-semibold">{s.sector}</span>
                      <p className="text-[10px] text-muted-foreground">{s.keyDriver}</p>
                    </div>
                    <div className="ml-auto text-[10px] text-muted-foreground whitespace-nowrap">
                      {s.timelineYears}yr horizon
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Climate ETFs & Funds ── */}
        <TabsContent value="etfs" className="space-y-4">
          {/* ETF comparison table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Climate ETF Comparison</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Ticker</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Fund Name</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">AUM ($B)</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">ER (%)</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">YTD Ret</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Holdings</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Inception</th>
                  </tr>
                </thead>
                <tbody>
                  {CLIMATE_ETFS.map((e) => (
                    <tr key={e.ticker} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2">
                        <span className="font-bold text-blue-400">{e.ticker}</span>
                      </td>
                      <td className="py-2">
                        <div className="font-medium">{e.name}</div>
                        <div className="text-[10px] text-muted-foreground">{e.focus}</div>
                      </td>
                      <td className="text-right py-2 font-mono">${e.aum.toFixed(2)}B</td>
                      <td className="text-right py-2 font-mono">{e.expenseRatio.toFixed(2)}%</td>
                      <td
                        className={`text-right py-2 font-mono font-semibold ${
                          e.ytdReturn >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {e.ytdReturn >= 0 ? "+" : ""}
                        {e.ytdReturn.toFixed(1)}%
                      </td>
                      <td className="text-right py-2">{e.holdings}</td>
                      <td className="text-right py-2 text-muted-foreground">{e.inceptionYear}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Bond types */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: <Leaf className="w-4 h-4 text-emerald-400" />,
                title: "Green Bonds",
                issuer: "Governments & Corporates",
                size: "$600B+ issued in 2024",
                desc: "Proceeds ring-fenced for environmental projects: renewable energy, clean transport, green buildings. Verified by Climate Bonds Initiative (CBI) framework.",
                risk: "Low",
                yield: "Treasury + 5–15bps",
              },
              {
                icon: <Activity className="w-4 h-4 text-blue-400" />,
                title: "Sustainability-Linked Bonds",
                issuer: "Corporates",
                size: "$180B+ issued in 2024",
                desc: "Coupon steps up if issuer misses sustainability KPIs (e.g., emission reduction targets). Proceeds not ring-fenced. Greenwashing risk if KPIs are weak.",
                risk: "Medium",
                yield: "Credit spread ± step-up",
              },
              {
                icon: <TrendingUp className="w-4 h-4 text-purple-400" />,
                title: "Climate VC/PE",
                issuer: "Venture & Private Equity",
                size: "$40B+ deployed in 2024",
                desc: "Early and growth-stage climate tech: solar, wind, EVs, grid tech, CCS, hydrogen, alternative proteins, climate adaptation. Long-horizon illiquid risk premium.",
                risk: "High",
                yield: "IRR target 15–25%",
              },
            ].map((b) => (
              <Card key={b.title} className="border-border/60">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    {b.icon}
                    <span className="text-sm font-semibold">{b.title}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">{b.issuer}</span>
                    <span className="font-medium">{b.size}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                  <div className="flex justify-between text-xs border-t border-border pt-2">
                    <div>
                      <span className="text-muted-foreground">Risk: </span>
                      <span
                        className={
                          b.risk === "Low"
                            ? "text-emerald-400"
                            : b.risk === "Medium"
                            ? "text-amber-400"
                            : "text-red-400"
                        }
                      >
                        {b.risk}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Yield: </span>
                      <span className="text-blue-400">{b.yield}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* YTD performance bar chart SVG */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Climate ETF YTD Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {CLIMATE_ETFS.sort((a, b) => b.ytdReturn - a.ytdReturn).map((e) => (
                  <div key={e.ticker} className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-400 w-12">{e.ticker}</span>
                    <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all"
                        style={{
                          width: `${Math.min(100, (e.ytdReturn / 25) * 100)}%`,
                          backgroundColor: e.ytdReturn >= 15 ? "#10b981" : e.ytdReturn >= 0 ? "#3b82f6" : "#ef4444",
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-mono w-14 text-right ${
                        e.ytdReturn >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {e.ytdReturn >= 0 ? "+" : ""}
                      {e.ytdReturn.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 5: TCFD Framework ── */}
        <TabsContent value="tcfd" className="space-y-4">
          {/* TCFD pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: <Shield className="w-4 h-4 text-blue-400" />,
                title: "Governance",
                desc: "Board oversight of climate-related risks and opportunities. Management roles and responsibilities.",
                color: "border-blue-500/30 bg-blue-500/5",
              },
              {
                icon: <Target className="w-4 h-4 text-emerald-400" />,
                title: "Strategy",
                desc: "Climate risks & opportunities across time horizons. Resilience of strategy under different scenarios.",
                color: "border-emerald-500/30 bg-emerald-500/5",
              },
              {
                icon: <Activity className="w-4 h-4 text-amber-400" />,
                title: "Risk Management",
                desc: "Process for identifying, assessing, and managing climate-related risks. Integration into overall risk management.",
                color: "border-amber-500/30 bg-amber-500/5",
              },
              {
                icon: <BarChart2 className="w-4 h-4 text-purple-400" />,
                title: "Metrics & Targets",
                desc: "Metrics used to assess climate risk. Scope 1, 2, 3 emissions. Targets for managing climate-related risks.",
                color: "border-purple-500/30 bg-purple-500/5",
              },
            ].map((p) => (
              <div
                key={p.title}
                className={`rounded-xl border p-3 space-y-1.5 ${p.color}`}
              >
                <div className="flex items-center gap-1.5">
                  {p.icon}
                  <span className="text-xs font-semibold">{p.title}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Physical vs Transition risk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-red-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5 text-red-400">
                  <Droplets className="w-3.5 h-3.5" />
                  Physical Risk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { type: "Acute", example: "Hurricanes, floods, wildfires destroying assets", impact: "High" },
                  { type: "Chronic", example: "Sea level rise, heat stress, drought affecting operations", impact: "Medium" },
                  { type: "Supply Chain", example: "Climate disruptions to suppliers/logistics", impact: "Medium" },
                  { type: "Liability", example: "Litigation for climate-related losses", impact: "Low" },
                ].map((r) => (
                  <div key={r.type} className="flex items-start gap-2 text-xs">
                    <Badge variant="destructive" className="text-[10px] shrink-0">
                      {r.impact}
                    </Badge>
                    <div>
                      <span className="font-medium">{r.type}: </span>
                      <span className="text-muted-foreground">{r.example}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5 text-blue-400">
                  <Wind className="w-3.5 h-3.5" />
                  Transition Risk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { type: "Policy", example: "Carbon pricing, emissions caps, building standards", impact: "High" },
                  { type: "Technology", example: "Disruption from clean energy / EV adoption curves", impact: "High" },
                  { type: "Market", example: "Shifts in consumer/investor demand for green products", impact: "Medium" },
                  { type: "Reputational", example: "Greenwashing scrutiny, fossil fuel divestment campaigns", impact: "Low" },
                ].map((r) => (
                  <div key={r.type} className="flex items-start gap-2 text-xs">
                    <Badge
                      variant={r.impact === "High" ? "default" : "secondary"}
                      className="text-[10px] shrink-0"
                    >
                      {r.impact}
                    </Badge>
                    <div>
                      <span className="font-medium">{r.type}: </span>
                      <span className="text-muted-foreground">{r.example}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Scenario analysis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Climate Scenario Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TcfdScenarioChart scenarios={TCFD_SCENARIOS} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {TCFD_SCENARIOS.map((sc) => (
                  <div
                    key={sc.scenario}
                    className="rounded-lg border p-3 space-y-1"
                    style={{ borderColor: sc.color + "40" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: sc.color }}>
                        {sc.scenario}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{sc.financialImpact}</span>
                    </div>
                    <div className="flex gap-4 text-[10px]">
                      <span>
                        <span className="text-red-400">Phys: </span>
                        <span>{sc.physicalRisk}%</span>
                      </span>
                      <span>
                        <span className="text-blue-400">Trans: </span>
                        <span>{sc.transitionRisk}%</span>
                      </span>
                      <span className="text-muted-foreground">{sc.stranded}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{sc.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disclosure requirements */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                TCFD Disclosure Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    req: "Scenario Analysis",
                    detail: "Model portfolio under 1.5°C, 2°C, 3°C+ using NGFS scenarios. Quantify financial impacts on revenue, costs, and asset values.",
                    mandatory: true,
                  },
                  {
                    req: "Scope 1, 2, 3 Emissions",
                    detail: "Disclose operational (Scope 1+2) and value chain (Scope 3) GHG emissions. Scope 3 is most material for most sectors.",
                    mandatory: true,
                  },
                  {
                    req: "Net Zero Targets",
                    detail: "Science-based targets aligned with 1.5°C pathway. Interim 2030 targets required. No room for 'net zero by 2050' without near-term milestones.",
                    mandatory: false,
                  },
                  {
                    req: "TCFD-Aligned Reporting",
                    detail: "Annual report disclosures across all four TCFD pillars. Mandatory in UK, EU, NZ, Singapore. Voluntary but expected in US/Canada.",
                    mandatory: true,
                  },
                  {
                    req: "Carbon Price Sensitivity",
                    detail: "Model P&L impact of internal or external carbon prices of $50, $100, $150/t CO₂. Disclose breakeven and stranded asset thresholds.",
                    mandatory: false,
                  },
                  {
                    req: "Paris Alignment Metric",
                    detail: "Portfolio temperature alignment score (e.g., 2.4°C implied). Tools: MSCI Climate VaR, TPI benchmark, PACTA sector alignment.",
                    mandatory: false,
                  },
                ].map((r) => (
                  <div key={r.req} className="rounded-lg bg-muted/20 p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      {r.mandatory ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      )}
                      <span className="text-xs font-semibold">{r.req}</span>
                      <Badge
                        variant={r.mandatory ? "default" : "secondary"}
                        className="text-[10px] ml-auto"
                      >
                        {r.mandatory ? "Mandatory" : "Voluntary"}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{r.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scope emissions explainer */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">GHG Emissions Scope Classification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    scope: "Scope 1",
                    label: "Direct Emissions",
                    color: "#ef4444",
                    pct: "~10%",
                    examples: "Company-owned vehicles, on-site combustion, process emissions, fugitive emissions (methane leaks)",
                    note: "Fully controlled by organization. Easiest to reduce.",
                  },
                  {
                    scope: "Scope 2",
                    label: "Indirect — Purchased Energy",
                    color: "#f59e0b",
                    pct: "~15%",
                    examples: "Purchased electricity, heat, steam, cooling for operations",
                    note: "Driven by energy mix of grid. Can be addressed via PPAs, RECs, on-site generation.",
                  },
                  {
                    scope: "Scope 3",
                    label: "Value Chain Emissions",
                    color: "#3b82f6",
                    pct: "~75%",
                    examples: "Supplier emissions, business travel, employee commuting, product use & disposal, investments",
                    note: "Largest category for most companies. Hardest to measure. Requires supplier engagement.",
                  },
                ].map((sc) => (
                  <div
                    key={sc.scope}
                    className="rounded-lg border p-3 space-y-2"
                    style={{ borderColor: sc.color + "40" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold" style={{ color: sc.color }}>
                        {sc.scope}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{sc.pct} of total</span>
                    </div>
                    <p className="text-xs font-medium">{sc.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      <strong>Examples:</strong> {sc.examples}
                    </p>
                    <p className="text-[10px] text-blue-400 italic">{sc.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
