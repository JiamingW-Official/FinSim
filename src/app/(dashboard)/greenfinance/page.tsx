"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  Globe,
  TrendingUp,
  BarChart2,
  DollarSign,
  Target,
  Layers,
  Info,
  CheckCircle,
  Wind,
  Zap,
  Droplets,
  TreePine,
  Shield,
  Sun,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 993;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Generate ETS monthly prices (12 months) ────────────────────────────────────
const ETS_MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const etsPrices: number[] = [];
{
  let base = 58;
  for (let i = 0; i < 12; i++) {
    base = Math.max(30, Math.min(95, base + (rand() - 0.48) * 8));
    etsPrices.push(parseFloat(base.toFixed(2)));
  }
}

// ── Green Bond Data ────────────────────────────────────────────────────────────
interface GreenBond {
  issuer: string;
  issuerType: string;
  useOfProceeds: string;
  proceedIcon: string;
  size: number; // USD bn
  yield: number; // %
  greenium: number; // bps vs conventional
  certification: string;
  maturity: number; // years
  rating: string;
}

const GREEN_BONDS: GreenBond[] = [
  {
    issuer: "European Investment Bank",
    issuerType: "Supranational",
    useOfProceeds: "Solar & Wind Energy",
    proceedIcon: "solar",
    size: 5.0,
    yield: 3.42,
    greenium: -8,
    certification: "CBI",
    maturity: 10,
    rating: "AAA",
  },
  {
    issuer: "Apple Inc.",
    issuerType: "Corporate",
    useOfProceeds: "Energy Efficiency",
    proceedIcon: "efficiency",
    size: 2.2,
    yield: 4.18,
    greenium: -6,
    certification: "ICMA",
    maturity: 7,
    rating: "AA+",
  },
  {
    issuer: "Republic of France",
    issuerType: "Sovereign",
    useOfProceeds: "Climate Adaptation",
    proceedIcon: "adaptation",
    size: 7.0,
    yield: 2.95,
    greenium: -5,
    certification: "CBI",
    maturity: 20,
    rating: "AA",
  },
  {
    issuer: "Toyota Motor Corp",
    issuerType: "Corporate",
    useOfProceeds: "EV & Clean Mobility",
    proceedIcon: "ev",
    size: 1.75,
    yield: 4.55,
    greenium: -9,
    certification: "ICMA",
    maturity: 5,
    rating: "A+",
  },
  {
    issuer: "World Bank",
    issuerType: "MDB",
    useOfProceeds: "Sustainable Forestry",
    proceedIcon: "nature",
    size: 3.5,
    yield: 3.78,
    greenium: -7,
    certification: "CBI",
    maturity: 15,
    rating: "AAA",
  },
  {
    issuer: "NextEra Energy",
    issuerType: "Utility",
    useOfProceeds: "Offshore Wind",
    proceedIcon: "wind",
    size: 1.25,
    yield: 5.12,
    greenium: -11,
    certification: "ICMA",
    maturity: 8,
    rating: "BBB+",
  },
];

// ── Sustainable Finance Instruments ───────────────────────────────────────────
interface FinanceInstrument {
  name: string;
  abbr: string;
  structure: string;
  proceeds: string;
  kpiLinked: boolean;
  examples: string;
  color: string;
}

const INSTRUMENTS: FinanceInstrument[] = [
  {
    name: "Green Bond",
    abbr: "GB",
    structure: "Use of Proceeds",
    proceeds: "Exclusively green projects",
    kpiLinked: false,
    examples: "Solar farms, EV infrastructure, green buildings",
    color: "emerald",
  },
  {
    name: "Social Bond",
    abbr: "SB",
    structure: "Use of Proceeds",
    proceeds: "Social impact projects",
    kpiLinked: false,
    examples: "Affordable housing, healthcare, education",
    color: "blue",
  },
  {
    name: "Sustainability Bond",
    abbr: "SUB",
    structure: "Use of Proceeds",
    proceeds: "Mix of green + social",
    kpiLinked: false,
    examples: "SDG-aligned mixed portfolios",
    color: "violet",
  },
  {
    name: "Sustainability-Linked Bond",
    abbr: "SLB",
    structure: "KPI-Linked",
    proceeds: "General corporate purposes",
    kpiLinked: true,
    examples: "Coupon step-up if emission targets missed",
    color: "amber",
  },
  {
    name: "Transition Bond",
    abbr: "TB",
    structure: "Use of Proceeds",
    proceeds: "Decarbonization of brown sectors",
    kpiLinked: false,
    examples: "Steel, cement, shipping decarbonization",
    color: "orange",
  },
];

// ── EU Taxonomy objectives ─────────────────────────────────────────────────────
interface TaxonomyObjective {
  id: string;
  label: string;
  eligible: number;
  transitional: number;
  excluded: number;
  color: string;
}

const TAXONOMY_OBJECTIVES: TaxonomyObjective[] = [
  { id: "ccm", label: "Climate Change Mitigation", eligible: 62, transitional: 18, excluded: 20, color: "#34d399" },
  { id: "cca", label: "Climate Change Adaptation", eligible: 45, transitional: 28, excluded: 27, color: "#60a5fa" },
  { id: "wme", label: "Water & Marine Resources", eligible: 38, transitional: 22, excluded: 40, color: "#38bdf8" },
  { id: "ce",  label: "Circular Economy",          eligible: 51, transitional: 24, excluded: 25, color: "#a78bfa" },
  { id: "pp",  label: "Pollution Prevention",      eligible: 34, transitional: 30, excluded: 36, color: "#fb923c" },
  { id: "bde", label: "Biodiversity & Ecosystems", eligible: 29, transitional: 25, excluded: 46, color: "#4ade80" },
];

// ── Carbon credit types ────────────────────────────────────────────────────────
interface CarbonCredit {
  type: string;
  abbr: string;
  market: "compliance" | "voluntary";
  price: number;
  permanence: string;
  cobenefits: string;
  description: string;
}

const CARBON_CREDITS: CarbonCredit[] = [
  {
    type: "EU Emission Trading",
    abbr: "EUA",
    market: "compliance",
    price: 62,
    permanence: "Permanent",
    cobenefits: "Low",
    description: "EU compliance allowance; 1 t CO₂e",
  },
  {
    type: "REDD+ Forest Credits",
    abbr: "REDD+",
    market: "voluntary",
    price: 8,
    permanence: "Variable",
    cobenefits: "High",
    description: "Reducing deforestation in tropical forests",
  },
  {
    type: "Direct Air Capture",
    abbr: "DAC",
    market: "voluntary",
    price: 320,
    permanence: "Permanent",
    cobenefits: "Low",
    description: "Mechanical CO₂ removal from atmosphere",
  },
  {
    type: "Nature-Based Solutions",
    abbr: "NBS",
    market: "voluntary",
    price: 18,
    permanence: "Moderate",
    cobenefits: "Very High",
    description: "Wetlands, grasslands, blue carbon",
  },
];

// ── SFDR Classification ────────────────────────────────────────────────────────
const SFDR_TIERS = [
  { article: "Article 9", label: "Dark Green", aum: 420, temp: 1.5, desc: "Sustainable investment objective; Paris-aligned" },
  { article: "Article 8", label: "Light Green", aum: 2840, temp: 2.1, desc: "Promotes environmental or social characteristics" },
  { article: "Article 6", label: "No Label",   aum: 8900, temp: 3.4, desc: "No specific sustainability claims; standard disclosure" },
];

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmtB(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}T`;
  return `$${n.toFixed(1)}B`;
}

function fmtYield(y: number): string {
  return y.toFixed(2) + "%";
}

// ── Proceed icon helper ────────────────────────────────────────────────────────
function ProceedIcon({ type, size = 16 }: { type: string; size?: number }) {
  const cls = `text-emerald-400`;
  if (type === "solar")      return <Sun size={size} className={cls} />;
  if (type === "wind")       return <Wind size={size} className={cls} />;
  if (type === "ev")         return <Zap size={size} className={cls} />;
  if (type === "efficiency") return <TrendingUp size={size} className={cls} />;
  if (type === "adaptation") return <Droplets size={size} className={cls} />;
  if (type === "nature")     return <TreePine size={size} className={cls} />;
  return <Leaf size={size} className={cls} />;
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, highlight }: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral";
}) {
  const valClass =
    highlight === "pos" ? "text-emerald-400" :
    highlight === "neg" ? "text-rose-400" :
    "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className={cn("text-xl font-bold", valClass)}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── ETS Price Chart ────────────────────────────────────────────────────────────
function EtsPriceChart() {
  const W = 520;
  const H = 160;
  const PAD = { l: 44, r: 16, t: 16, b: 32 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const minP = Math.min(...etsPrices) - 5;
  const maxP = Math.max(...etsPrices) + 5;
  const toX = (i: number) => PAD.l + (i / (etsPrices.length - 1)) * chartW;
  const toY = (v: number) => PAD.t + chartH - ((v - minP) / (maxP - minP)) * chartH;

  const pts = etsPrices.map((p, i) => `${toX(i)},${toY(p)}`).join(" ");
  const area = [
    `${toX(0)},${PAD.t + chartH}`,
    ...etsPrices.map((p, i) => `${toX(i)},${toY(p)}`),
    `${toX(etsPrices.length - 1)},${PAD.t + chartH}`,
  ].join(" ");

  const gridYVals = [40, 55, 70, 85];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <defs>
        <linearGradient id="etsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridYVals.map((v) => (
        <line key={`gy-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)}
          stroke="#27272a" strokeWidth="1" />
      ))}
      {gridYVals.map((v) => (
        <text key={`gt-${v}`} x={PAD.l - 4} y={toY(v) + 4} textAnchor="end"
          fontSize="9" fill="#71717a">{v}</text>
      ))}
      <polygon points={area} fill="url(#etsGrad)" />
      <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
      {etsPrices.map((p, i) => (
        <circle key={`pt-${i}`} cx={toX(i)} cy={toY(p)} r="3" fill="#34d399" />
      ))}
      {ETS_MONTHS.map((m, i) => (
        i % 2 === 0 ? (
          <text key={`mx-${i}`} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#71717a">{m}</text>
        ) : null
      ))}
    </svg>
  );
}

// ── Taxonomy Hexagons ──────────────────────────────────────────────────────────
function TaxonomyHexGrid() {
  const hexW = 80;
  const hexH = 90;
  const cols = 3;
  const totalW = cols * hexW + (cols - 1) * 12 + 40;
  const totalH = Math.ceil(TAXONOMY_OBJECTIVES.length / cols) * hexH + 20;

  function hexPath(cx: number, cy: number, r: number): string {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 180) * (60 * i - 30);
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    });
    return `M ${pts.join(" L ")} Z`;
  }

  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full" style={{ maxHeight: 280 }}>
      {TAXONOMY_OBJECTIVES.map((obj, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = 60 + col * (hexW + 8);
        const cy = 50 + row * (hexH - 2);
        return (
          <g key={obj.id}>
            <path d={hexPath(cx, cy, 36)} fill={obj.color + "22"} stroke={obj.color} strokeWidth="1.5" />
            <text x={cx} y={cy - 10} textAnchor="middle" fontSize="9" fill={obj.color} fontWeight="600">
              {obj.label.split(" ").slice(0, 2).join(" ")}
            </text>
            <text x={cx} y={cy + 2} textAnchor="middle" fontSize="8" fill="#a1a1aa">
              {obj.eligible}% eligible
            </text>
            <text x={cx} y={cy + 13} textAnchor="middle" fontSize="8" fill="#78716c">
              {obj.transitional}% transit.
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Greenium Calculator ────────────────────────────────────────────────────────
function GreeniumCalculator() {
  const [conventionalYield, setConventionalYield] = useState(4.5);
  const [greeniumBps, setGreeniumBps] = useState(8);
  const [issuanceSize, setIssuanceSize] = useState(500);

  const greenBondYield = conventionalYield - greeniumBps / 100;
  const annualSaving = (issuanceSize * 1e6 * greeniumBps) / 10000;
  const tenYearSaving = annualSaving * 10;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Conventional Bond Yield (%)</label>
          <input
            type="range"
            min={1}
            max={8}
            step={0.05}
            value={conventionalYield}
            onChange={(e) => setConventionalYield(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <p className="text-sm font-mono text-white">{conventionalYield.toFixed(2)}%</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Greenium Estimate (bps)</label>
          <input
            type="range"
            min={1}
            max={25}
            step={1}
            value={greeniumBps}
            onChange={(e) => setGreeniumBps(parseInt(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <p className="text-sm font-mono text-white">{greeniumBps} bps</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Issuance Size ($M)</label>
          <input
            type="range"
            min={100}
            max={5000}
            step={100}
            value={issuanceSize}
            onChange={(e) => setIssuanceSize(parseInt(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <p className="text-sm font-mono text-white">${issuanceSize}M</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
          <p className="text-xs text-zinc-400 mb-1">Green Bond Yield</p>
          <p className="text-2xl font-bold text-emerald-400">{greenBondYield.toFixed(2)}%</p>
          <p className="text-xs text-zinc-500 mt-1">vs {conventionalYield.toFixed(2)}% conventional</p>
        </div>
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 text-center">
          <p className="text-xs text-zinc-400 mb-1">Annual Savings</p>
          <p className="text-2xl font-bold text-blue-400">${(annualSaving / 1000).toFixed(0)}K</p>
          <p className="text-xs text-zinc-500 mt-1">per year on ${issuanceSize}M</p>
        </div>
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 text-center">
          <p className="text-xs text-zinc-400 mb-1">10-Year Savings</p>
          <p className="text-2xl font-bold text-violet-400">${(tenYearSaving / 1e6).toFixed(2)}M</p>
          <p className="text-xs text-zinc-500 mt-1">cumulative interest reduction</p>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold text-zinc-300 mb-2">Issuer Breakeven Analysis</p>
        <p className="text-xs text-zinc-400">
          To justify the additional green certification costs (~$300K–$500K for framework + audit + reporting),
          the greenium must generate at least{" "}
          <span className="text-emerald-400 font-mono">
            ${((350_000 / annualSaving) * 100).toFixed(1)} months
          </span>{" "}
          of savings to break even. At {greeniumBps} bps on ${issuanceSize}M, breakeven is reached in{" "}
          <span className="text-emerald-400 font-mono">
            {(350000 / annualSaving).toFixed(1)} years
          </span>.
        </p>
      </div>
    </div>
  );
}

// ── SFDR Funnel ────────────────────────────────────────────────────────────────
function SfdrFunnel() {
  const W = 480;
  const H = 220;
  const totalAum = SFDR_TIERS.reduce((a, b) => a + b.aum, 0);
  const maxW = W - 40;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      {SFDR_TIERS.map((tier, i) => {
        const pct = tier.aum / totalAum;
        const barW = maxW * Math.sqrt(pct) * 1.1;
        const cx = W / 2;
        const barH = 44;
        const y = 16 + i * (barH + 12);
        const x = cx - barW / 2;
        const colors = ["#34d399", "#60a5fa", "#71717a"];
        const textColors = ["#d1fae5", "#bfdbfe", "#e4e4e7"];
        return (
          <g key={tier.article}>
            <rect x={x} y={y} width={barW} height={barH} rx="6"
              fill={colors[i] + "22"} stroke={colors[i]} strokeWidth="1.5" />
            <text x={cx} y={y + 14} textAnchor="middle" fontSize="11" fill={textColors[i]} fontWeight="700">
              {tier.article} — {tier.label}
            </text>
            <text x={cx} y={y + 27} textAnchor="middle" fontSize="9" fill="#a1a1aa">
              ${tier.aum}B AUM · Implied temp: {tier.temp}°C
            </text>
            <text x={cx} y={y + 38} textAnchor="middle" fontSize="8" fill="#71717a">
              {tier.desc}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function GreenFinancePage() {
  const [selectedBond, setSelectedBond] = useState<GreenBond | null>(null);

  const totalIssuance = GREEN_BONDS.reduce((a, b) => a + b.size, 0);
  const avgGreenium = GREEN_BONDS.reduce((a, b) => a + b.greenium, 0) / GREEN_BONDS.length;
  const avgYield = GREEN_BONDS.reduce((a, b) => a + b.yield, 0) / GREEN_BONDS.length;
  const vcmPrice = CARBON_CREDITS.find((c) => c.abbr === "REDD+")?.price ?? 8;
  const euaPrice = etsPrices[etsPrices.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-zinc-950 text-white p-4 md:p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2">
          <Leaf className="text-emerald-400" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Green Bonds &amp; Climate Finance</h1>
          <p className="text-xs text-zinc-400">Sustainable debt markets, greenium analysis, carbon markets &amp; taxonomy</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Green Bond Market" value="$2.8T" sub="Outstanding issuance 2025" highlight="pos" />
        <StatCard label="Avg Greenium" value={`${Math.abs(avgGreenium).toFixed(0)} bps`} sub="vs conventional peers" highlight="pos" />
        <StatCard label="Avg Green Yield" value={fmtYield(avgYield)} sub="Current portfolio avg" />
        <StatCard label="EU ETS Price" value={`€${euaPrice.toFixed(0)}/t`} sub="Latest CO₂ allowance" highlight="neutral" />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="bonds">
        <TabsList className="bg-zinc-900 border border-white/10 flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="bonds" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs">
            <BarChart2 size={12} className="mr-1" /> Bond Market
          </TabsTrigger>
          <TabsTrigger value="greenium" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs">
            <DollarSign size={12} className="mr-1" /> Greenium Calc
          </TabsTrigger>
          <TabsTrigger value="taxonomy" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs">
            <Globe size={12} className="mr-1" /> EU Taxonomy
          </TabsTrigger>
          <TabsTrigger value="carbon" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs">
            <Target size={12} className="mr-1" /> Carbon Markets
          </TabsTrigger>
          <TabsTrigger value="instruments" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs">
            <Layers size={12} className="mr-1" /> Instruments
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs">
            <Shield size={12} className="mr-1" /> Portfolio Align
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Green Bond Market Dashboard ── */}
        <TabsContent value="bonds" className={cn("mt-4 space-y-4", "data-[state=inactive]:hidden")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bond list */}
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-zinc-200">Active Green Bond Universe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 pt-0">
                {GREEN_BONDS.map((bond, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedBond(bond === selectedBond ? null : bond)}
                    className={cn(
                      "w-full text-left rounded-lg border p-3 transition-all",
                      selectedBond === bond
                        ? "border-emerald-500/60 bg-emerald-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <ProceedIcon type={bond.proceedIcon} size={14} />
                        <span className="text-xs font-semibold text-white truncate max-w-[140px]">{bond.issuer}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className="text-[10px] bg-zinc-800 text-zinc-300 border-none py-0">{bond.certification}</Badge>
                        <Badge className="text-[10px] bg-zinc-800 text-zinc-300 border-none py-0">{bond.rating}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      <span>{fmtB(bond.size)}</span>
                      <span className="text-white font-mono">{fmtYield(bond.yield)}</span>
                      <span className={cn(bond.greenium < 0 ? "text-emerald-400" : "text-red-400")}>
                        {bond.greenium > 0 ? "+" : ""}{bond.greenium} bps
                      </span>
                      <span>{bond.maturity}yr</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Bond detail panel */}
            <div className="space-y-4">
              {selectedBond ? (
                <Card className="bg-zinc-900 border-emerald-500/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <ProceedIcon type={selectedBond.proceedIcon} size={18} />
                      <CardTitle className="text-sm text-white">{selectedBond.issuer}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Issuer Type", value: selectedBond.issuerType },
                        { label: "Use of Proceeds", value: selectedBond.useOfProceeds },
                        { label: "Issuance Size", value: fmtB(selectedBond.size) },
                        { label: "Yield", value: fmtYield(selectedBond.yield) },
                        { label: "Greenium", value: `${selectedBond.greenium} bps` },
                        { label: "Maturity", value: `${selectedBond.maturity} years` },
                        { label: "Certification", value: selectedBond.certification },
                        { label: "Credit Rating", value: selectedBond.rating },
                      ].map((row) => (
                        <div key={row.label} className="rounded bg-white/5 p-2">
                          <p className="text-[10px] text-zinc-500">{row.label}</p>
                          <p className="text-xs font-semibold text-white">{row.value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Greenium bar */}
                    <div>
                      <p className="text-[10px] text-zinc-400 mb-1">Greenium vs Market Range (-15 to 0 bps)</p>
                      <div className="relative h-2 rounded-full bg-zinc-800">
                        <div
                          className="absolute top-0 left-0 h-full rounded-full bg-emerald-500"
                          style={{ width: `${(Math.abs(selectedBond.greenium) / 15) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-emerald-400 mt-1">
                        {Math.abs(selectedBond.greenium)} bps cheaper than comparable conventional bond
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-zinc-900 border-white/10">
                  <CardContent className="p-6 text-center text-zinc-500">
                    <Info size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Select a bond from the list to view details</p>
                  </CardContent>
                </Card>
              )}

              {/* Market summary */}
              <Card className="bg-zinc-900 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-zinc-300">Market Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Total tracked issuance</span>
                    <span className="text-white font-mono">{fmtB(totalIssuance)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Avg greenium (bps)</span>
                    <span className="text-emerald-400 font-mono">{avgGreenium.toFixed(1)} bps</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">CBI-certified</span>
                    <span className="text-white font-mono">{GREEN_BONDS.filter((b) => b.certification === "CBI").length} of {GREEN_BONDS.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Avg maturity</span>
                    <span className="text-white font-mono">{(GREEN_BONDS.reduce((a, b) => a + b.maturity, 0) / GREEN_BONDS.length).toFixed(1)} yrs</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Greenium Calculator ── */}
        <TabsContent value="greenium" className={cn("mt-4", "data-[state=inactive]:hidden")}>
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-400" />
                Greenium Calculator — Issuer Cost Savings
              </CardTitle>
              <p className="text-xs text-zinc-400">
                The <strong className="text-zinc-200">greenium</strong> is the yield difference between a green bond
                and an equivalent conventional bond. A negative spread means issuers pay <em>less</em> to borrow green.
              </p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <GreeniumCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: EU Taxonomy ── */}
        <TabsContent value="taxonomy" className={cn("mt-4 space-y-4", "data-[state=inactive]:hidden")}>
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <Globe size={16} className="text-blue-400" />
                EU Green Taxonomy — 6 Environmental Objectives
              </CardTitle>
              <p className="text-xs text-zinc-400">
                The EU Taxonomy Regulation defines what counts as environmentally sustainable.
                Activities are classified as <span className="text-emerald-400">eligible</span>,{" "}
                <span className="text-amber-400">transitional</span>, or{" "}
                <span className="text-red-400">excluded</span>.
              </p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <TaxonomyHexGrid />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TAXONOMY_OBJECTIVES.map((obj) => (
              <div key={obj.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: obj.color }}>{obj.label}</span>
                </div>
                <div className="space-y-1">
                  {[
                    { label: "Eligible", pct: obj.eligible, color: obj.color },
                    { label: "Transitional", pct: obj.transitional, color: "#f59e0b" },
                    { label: "Excluded", pct: obj.excluded, color: "#6b7280" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 w-20">{row.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                        />
                      </div>
                      <span className="text-[10px] font-mono" style={{ color: row.color }}>{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab 4: Carbon Markets ── */}
        <TabsContent value="carbon" className={cn("mt-4 space-y-4", "data-[state=inactive]:hidden")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ETS chart */}
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-200">EU ETS Carbon Price — 12 Months</CardTitle>
                <p className="text-xs text-zinc-400">EU Emission Allowance (EUA) price in €/tCO₂e</p>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <EtsPriceChart />
                <div className="flex items-center justify-between mt-2 text-xs text-zinc-400">
                  <span>Current: <strong className="text-white">€{euaPrice.toFixed(0)}/t</strong></span>
                  <span>12m range: <strong className="text-white">€{Math.min(...etsPrices).toFixed(0)}–€{Math.max(...etsPrices).toFixed(0)}</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* VCM vs Compliance */}
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-200">Compliance vs Voluntary Carbon Markets</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="flex gap-3 text-[11px] mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" />
                    <span className="text-zinc-400">Compliance (ETS)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span className="text-zinc-400">Voluntary (VCM)</span>
                  </div>
                </div>
                {[
                  { label: "Regulatory", comp: "Mandatory", vcm: "Optional" },
                  { label: "Price/t CO₂e", comp: `€${euaPrice.toFixed(0)}`, vcm: `$${vcmPrice}` },
                  { label: "Verification", comp: "Govt-regulated", vcm: "Verra / Gold Standard" },
                  { label: "Tradeable", comp: "Yes (futures)", vcm: "OTC + some exchanges" },
                  { label: "Scope", comp: "Large emitters", vcm: "All companies" },
                  { label: "Additionality", comp: "Built-in cap", vcm: "Project-level proof" },
                ].map((row) => (
                  <div key={row.label} className="grid grid-cols-3 text-[11px]">
                    <span className="text-zinc-400">{row.label}</span>
                    <span className="text-blue-300">{row.comp}</span>
                    <span className="text-emerald-300">{row.vcm}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Carbon credit types */}
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-200">Carbon Credit Types</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {CARBON_CREDITS.map((credit) => (
                  <div key={credit.abbr} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{credit.abbr}</span>
                      <Badge className={cn(
                        "text-[9px] py-0 border-none",
                        credit.market === "compliance" ? "bg-blue-500/20 text-blue-300" : "bg-emerald-500/20 text-emerald-300"
                      )}>
                        {credit.market}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-zinc-400 mb-2">{credit.description}</p>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Price</span>
                        <span className="text-white font-mono">${credit.price}/t</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Permanence</span>
                        <span className={cn(
                          credit.permanence === "Permanent" ? "text-emerald-400" :
                          credit.permanence === "Variable" ? "text-red-400" : "text-amber-400"
                        )}>{credit.permanence}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Co-benefits</span>
                        <span className="text-zinc-300">{credit.cobenefits}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 5: Sustainable Finance Instruments ── */}
        <TabsContent value="instruments" className={cn("mt-4", "data-[state=inactive]:hidden")}>
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200">Sustainable Finance Instruments Comparison</CardTitle>
              <p className="text-xs text-zinc-400">
                Key distinction: Use-of-Proceeds bonds restrict how funds are spent.
                KPI-linked bonds (SLBs) tie coupon to sustainability targets regardless of use.
              </p>
            </CardHeader>
            <CardContent className="p-3 pt-0 overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-2 text-zinc-400 font-medium">Instrument</th>
                    <th className="text-left p-2 text-zinc-400 font-medium">Structure</th>
                    <th className="text-left p-2 text-zinc-400 font-medium">Use of Proceeds</th>
                    <th className="text-center p-2 text-zinc-400 font-medium">KPI-Linked</th>
                    <th className="text-left p-2 text-zinc-400 font-medium">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  {INSTRUMENTS.map((ins, i) => {
                    const colorMap: Record<string, string> = {
                      emerald: "text-emerald-400",
                      blue: "text-blue-400",
                      violet: "text-violet-400",
                      amber: "text-amber-400",
                      orange: "text-orange-400",
                    };
                    const bgMap: Record<string, string> = {
                      emerald: "bg-emerald-500/10",
                      blue: "bg-blue-500/10",
                      violet: "bg-violet-500/10",
                      amber: "bg-amber-500/10",
                      orange: "bg-orange-500/10",
                    };
                    return (
                      <tr key={i} className={cn("border-b border-white/5 hover:bg-white/5 transition-colors")}>
                        <td className="p-2">
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-[10px] font-bold",
                            bgMap[ins.color] ?? "bg-zinc-800",
                            colorMap[ins.color] ?? "text-zinc-300"
                          )}>{ins.abbr}</span>
                          <span className="ml-2 text-zinc-200">{ins.name}</span>
                        </td>
                        <td className="p-2 text-zinc-300">{ins.structure}</td>
                        <td className="p-2 text-zinc-400">{ins.proceeds}</td>
                        <td className="p-2 text-center">
                          {ins.kpiLinked
                            ? <CheckCircle size={14} className="mx-auto text-emerald-400" />
                            : <span className="text-zinc-600">—</span>}
                        </td>
                        <td className="p-2 text-zinc-500 text-[10px]">{ins.examples}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Key concept callout */}
          <Card className="mt-4 bg-amber-900/20 border-amber-500/30">
            <CardContent className="p-4 flex gap-3">
              <TrendingUp size={20} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-300 mb-1">
                  Why SLBs Are Controversial
                </p>
                <p className="text-xs text-zinc-400">
                  Sustainability-Linked Bonds allow proceeds to be used for general purposes. Critics argue this
                  creates incentives to set weak KPI targets (the coupon step-up is typically only 25 bps) and
                  provides little guarantee of additionality. However, SLBs are accessible to industries like
                  steel and shipping that have few &ldquo;green&rdquo; assets to securitize.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 6: Portfolio Alignment ── */}
        <TabsContent value="portfolio" className={cn("mt-4 space-y-4", "data-[state=inactive]:hidden")}>
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <Shield size={16} className="text-violet-400" />
                SFDR Fund Classification — Paris Alignment Funnel
              </CardTitle>
              <p className="text-xs text-zinc-400">
                EU Sustainable Finance Disclosure Regulation (SFDR) classifies funds by sustainability ambition.
                Only Article 9 funds target Paris-aligned portfolios.
              </p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <SfdrFunnel />
            </CardContent>
          </Card>

          {/* Sector temperature */}
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-200">Implied Temperature Rise by Sector</CardTitle>
              <p className="text-xs text-zinc-400">Based on current emissions trajectory — Paris target is 1.5°C</p>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {[
                { sector: "Renewable Energy", temp: 1.4, color: "#34d399" },
                { sector: "Technology",        temp: 1.8, color: "#60a5fa" },
                { sector: "Healthcare",        temp: 2.1, color: "#a78bfa" },
                { sector: "Real Estate",       temp: 2.5, color: "#fb923c" },
                { sector: "Industrials",       temp: 3.1, color: "#f97316" },
                { sector: "Oil & Gas",         temp: 4.2, color: "#ef4444" },
              ].map((row) => {
                const maxTemp = 5;
                const pct = (row.temp / maxTemp) * 100;
                const parisLine = (1.5 / maxTemp) * 100;
                return (
                  <div key={row.sector} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-300 w-36">{row.sector}</span>
                      <span className="font-mono" style={{ color: row.color }}>{row.temp}°C</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-zinc-800">
                      {/* Paris line */}
                      <div className="absolute top-0 h-full w-px bg-emerald-400 z-10"
                        style={{ left: `${parisLine}%` }} />
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: row.color + "99" }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-500">
                <div className="w-px h-3 bg-emerald-400" />
                <span>Paris Agreement 1.5°C target</span>
              </div>
            </CardContent>
          </Card>

          {/* SFDR tier details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SFDR_TIERS.map((tier, i) => {
              const colors = ["text-emerald-400", "text-blue-400", "text-zinc-400"];
              const borders = ["border-emerald-500/30", "border-blue-500/30", "border-zinc-700"];
              return (
                <div key={tier.article} className={cn("rounded-lg border p-4", borders[i])}>
                  <p className={cn("text-sm font-bold mb-1", colors[i])}>{tier.article}</p>
                  <p className="text-xs text-white mb-1">{tier.label}</p>
                  <p className="text-[10px] text-zinc-400 mb-2">{tier.desc}</p>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">AUM</span>
                      <span className="text-white">${tier.aum}B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Implied Temp</span>
                      <span className={cn(
                        tier.temp <= 1.5 ? "text-emerald-400" :
                        tier.temp <= 2.5 ? "text-amber-400" : "text-red-400"
                      )}>{tier.temp}°C</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
