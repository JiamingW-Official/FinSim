"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Zap,
  Truck,
  BarChart3,
  TrendingUp,
  Leaf,
  Globe,
  Shield,
  DollarSign,
  Percent,
  TreePine,
  Wheat,
  Droplets,
  Activity,
  Info,
  ChevronDown,
  ChevronUp,
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
import { Button } from "@/components/ui/button";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 622001;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Interfaces ────────────────────────────────────────────────────────────────

interface InfraAsset {
  name: string;
  sector: string;
  yieldPct: number;
  totalReturn: number;
  risk: "Low" | "Medium" | "High";
  regulated: boolean;
  description: string;
}

interface ReitEntry {
  name: string;
  type: "REIT" | "Direct";
  sector: string;
  capRate: number;
  noiYield: number;
  totalReturn: number;
  liquidity: "High" | "Medium" | "Low";
  minInvestment: string;
}

interface CommodityEntry {
  name: string;
  symbol: string;
  category: string;
  inflationCorr: number;
  annualReturn: number;
  volatility: number;
  spotPrice: number;
  unit: string;
}

interface TimberFarmEntry {
  name: string;
  type: "Timber" | "Farmland";
  biologicalGrowth: number;
  landAppreciation: number;
  cashYield: number;
  totalReturn: number;
  esgScore: number;
  carbonCredits: boolean;
}

interface CorrelationPair {
  asset: string;
  stocks: number;
  bonds: number;
  inflation: number;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const INFRA_ASSETS: InfraAsset[] = [
  {
    name: "Toll Roads",
    sector: "Transport",
    yieldPct: 4.8,
    totalReturn: 8.2,
    risk: "Low",
    regulated: true,
    description: "Inflation-linked toll revenues with long concession periods",
  },
  {
    name: "Airports",
    sector: "Transport",
    yieldPct: 3.6,
    totalReturn: 9.4,
    risk: "Medium",
    regulated: true,
    description: "Aeronautical + commercial revenues, traffic volume exposure",
  },
  {
    name: "Rail Networks",
    sector: "Transport",
    yieldPct: 4.2,
    totalReturn: 7.8,
    risk: "Low",
    regulated: true,
    description: "Regulated access charges with CPI-linked escalators",
  },
  {
    name: "Water Utilities",
    sector: "Utilities",
    yieldPct: 5.1,
    totalReturn: 7.2,
    risk: "Low",
    regulated: true,
    description: "Essential monopoly service with RAB-based returns",
  },
  {
    name: "Electric Grid",
    sector: "Utilities",
    yieldPct: 4.7,
    totalReturn: 7.6,
    risk: "Low",
    regulated: true,
    description: "Transmission and distribution networks, stable cash flows",
  },
  {
    name: "Gas Pipelines",
    sector: "Energy Infra",
    yieldPct: 6.2,
    totalReturn: 9.8,
    risk: "Medium",
    regulated: false,
    description: "Midstream fee-based contracts, volume and counterparty risk",
  },
  {
    name: "Renewable Energy",
    sector: "Energy Infra",
    yieldPct: 5.4,
    totalReturn: 10.2,
    risk: "Medium",
    regulated: false,
    description: "Wind & solar PPA-backed cash flows, policy risk exposure",
  },
  {
    name: "Data Centers",
    sector: "Digital Infra",
    yieldPct: 3.8,
    totalReturn: 12.6,
    risk: "Medium",
    regulated: false,
    description: "Hyperscaler demand driving unprecedented capex cycle",
  },
];

const REIT_DATA: ReitEntry[] = [
  {
    name: "Prologis",
    type: "REIT",
    sector: "Industrial",
    capRate: 4.1,
    noiYield: 3.8,
    totalReturn: 11.4,
    liquidity: "High",
    minInvestment: "$1",
  },
  {
    name: "Equinix",
    type: "REIT",
    sector: "Data Center",
    capRate: 3.6,
    noiYield: 3.2,
    totalReturn: 14.2,
    liquidity: "High",
    minInvestment: "$1",
  },
  {
    name: "Simon Property",
    type: "REIT",
    sector: "Retail",
    capRate: 5.8,
    noiYield: 5.4,
    totalReturn: 7.6,
    liquidity: "High",
    minInvestment: "$1",
  },
  {
    name: "AvalonBay",
    type: "REIT",
    sector: "Residential",
    capRate: 4.9,
    noiYield: 4.6,
    totalReturn: 9.2,
    liquidity: "High",
    minInvestment: "$1",
  },
  {
    name: "Welltower",
    type: "REIT",
    sector: "Healthcare",
    capRate: 5.3,
    noiYield: 4.9,
    totalReturn: 10.8,
    liquidity: "High",
    minInvestment: "$1",
  },
  {
    name: "Office Tower NYC",
    type: "Direct",
    sector: "Office",
    capRate: 5.2,
    noiYield: 4.8,
    totalReturn: 6.4,
    liquidity: "Low",
    minInvestment: "$10M+",
  },
  {
    name: "Multifamily Complex",
    type: "Direct",
    sector: "Residential",
    capRate: 4.6,
    noiYield: 4.2,
    totalReturn: 8.8,
    liquidity: "Low",
    minInvestment: "$5M+",
  },
  {
    name: "Logistics Park",
    type: "Direct",
    sector: "Industrial",
    capRate: 3.9,
    noiYield: 3.6,
    totalReturn: 10.6,
    liquidity: "Medium",
    minInvestment: "$25M+",
  },
];

const COMMODITIES: CommodityEntry[] = [
  {
    name: "Gold",
    symbol: "XAU",
    category: "Precious Metals",
    inflationCorr: 0.62,
    annualReturn: 7.4,
    volatility: 14.2,
    spotPrice: 2342.5,
    unit: "troy oz",
  },
  {
    name: "Silver",
    symbol: "XAG",
    category: "Precious Metals",
    inflationCorr: 0.48,
    annualReturn: 6.1,
    volatility: 24.8,
    spotPrice: 28.6,
    unit: "troy oz",
  },
  {
    name: "Platinum",
    symbol: "XPT",
    category: "Precious Metals",
    inflationCorr: 0.34,
    annualReturn: 3.8,
    volatility: 19.6,
    spotPrice: 942.0,
    unit: "troy oz",
  },
  {
    name: "Crude Oil (WTI)",
    symbol: "CL",
    category: "Energy",
    inflationCorr: 0.71,
    annualReturn: 5.2,
    volatility: 32.4,
    spotPrice: 81.4,
    unit: "barrel",
  },
  {
    name: "Natural Gas",
    symbol: "NG",
    category: "Energy",
    inflationCorr: 0.44,
    annualReturn: 2.8,
    volatility: 48.6,
    spotPrice: 2.18,
    unit: "MMBtu",
  },
  {
    name: "Corn",
    symbol: "ZC",
    category: "Agricultural",
    inflationCorr: 0.52,
    annualReturn: 4.1,
    volatility: 22.3,
    spotPrice: 432.5,
    unit: "bushel",
  },
  {
    name: "Wheat",
    symbol: "ZW",
    category: "Agricultural",
    inflationCorr: 0.58,
    annualReturn: 3.6,
    volatility: 26.8,
    spotPrice: 548.0,
    unit: "bushel",
  },
  {
    name: "Soybeans",
    symbol: "ZS",
    category: "Agricultural",
    inflationCorr: 0.49,
    annualReturn: 4.8,
    volatility: 20.1,
    spotPrice: 1168.0,
    unit: "bushel",
  },
  {
    name: "Copper",
    symbol: "HG",
    category: "Base Metals",
    inflationCorr: 0.65,
    annualReturn: 6.8,
    volatility: 18.4,
    spotPrice: 4.22,
    unit: "lb",
  },
  {
    name: "Lithium",
    symbol: "LITH",
    category: "Base Metals",
    inflationCorr: 0.38,
    annualReturn: 8.2,
    volatility: 42.6,
    spotPrice: 13800.0,
    unit: "metric ton",
  },
];

const TIMBER_FARM: TimberFarmEntry[] = [
  {
    name: "Pacific Northwest Timber",
    type: "Timber",
    biologicalGrowth: 3.8,
    landAppreciation: 2.4,
    cashYield: 1.6,
    totalReturn: 7.8,
    esgScore: 88,
    carbonCredits: true,
  },
  {
    name: "Southeast US Timber",
    type: "Timber",
    biologicalGrowth: 4.2,
    landAppreciation: 2.8,
    cashYield: 2.1,
    totalReturn: 9.1,
    esgScore: 82,
    carbonCredits: true,
  },
  {
    name: "New Zealand Radiata",
    type: "Timber",
    biologicalGrowth: 5.6,
    landAppreciation: 2.2,
    cashYield: 1.8,
    totalReturn: 9.6,
    esgScore: 91,
    carbonCredits: true,
  },
  {
    name: "Iowa Corn Farmland",
    type: "Farmland",
    biologicalGrowth: 0.0,
    landAppreciation: 3.4,
    cashYield: 3.8,
    totalReturn: 7.2,
    esgScore: 64,
    carbonCredits: false,
  },
  {
    name: "California Almonds",
    type: "Farmland",
    biologicalGrowth: 1.2,
    landAppreciation: 4.1,
    cashYield: 4.6,
    totalReturn: 9.9,
    esgScore: 72,
    carbonCredits: false,
  },
  {
    name: "Brazilian Soy Farmland",
    type: "Farmland",
    biologicalGrowth: 0.0,
    landAppreciation: 5.2,
    cashYield: 3.2,
    totalReturn: 8.4,
    esgScore: 58,
    carbonCredits: false,
  },
  {
    name: "Australian Grazing",
    type: "Farmland",
    biologicalGrowth: 0.8,
    landAppreciation: 3.0,
    cashYield: 2.8,
    totalReturn: 6.6,
    esgScore: 70,
    carbonCredits: true,
  },
];

const CORRELATION_DATA: CorrelationPair[] = [
  { asset: "Infrastructure", stocks: 0.42, bonds: 0.28, inflation: 0.68 },
  { asset: "Real Estate", stocks: 0.56, bonds: 0.18, inflation: 0.62 },
  { asset: "Commodities", stocks: 0.22, bonds: -0.14, inflation: 0.78 },
  { asset: "Timberland", stocks: 0.18, bonds: 0.06, inflation: 0.54 },
  { asset: "Farmland", stocks: 0.14, bonds: 0.04, inflation: 0.66 },
  { asset: "Gold", stocks: -0.06, bonds: 0.12, inflation: 0.62 },
];

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

function posNegClass(v: number): string {
  return v >= 0 ? "text-emerald-400" : "text-rose-400";
}

function riskColor(r: "Low" | "Medium" | "High"): string {
  return r === "Low"
    ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
    : r === "Medium"
    ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
    : "text-rose-400 border-rose-400/30 bg-rose-400/10";
}

function corrColor(v: number): string {
  if (v > 0.5) return "bg-emerald-500";
  if (v > 0.2) return "bg-emerald-400/60";
  if (v > 0) return "bg-emerald-400/30";
  if (v > -0.2) return "bg-muted-foreground/40";
  return "bg-rose-400/60";
}

function corrTextColor(v: number): string {
  if (Math.abs(v) > 0.4) return "text-white";
  return "text-foreground/80";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral";
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${valClass}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

// ── Infrastructure Tab ────────────────────────────────────────────────────────

function InfrastructureTab() {
  const [selected, setSelected] = useState<InfraAsset | null>(null);

  const chartW = 580;
  const chartH = 220;
  const barW = 44;
  const gap = 26;
  const padL = 44;
  const padB = 40;
  const maxY = 14;

  const bars = useMemo(() => {
    return INFRA_ASSETS.map((a, i) => {
      const x = padL + i * (barW + gap);
      const yieldH = (a.yieldPct / maxY) * (chartH - padB);
      const totalH = (a.totalReturn / maxY) * (chartH - padB);
      return { ...a, x, yieldH, totalH };
    });
  }, []);

  const yTicks = [0, 2, 4, 6, 8, 10, 12, 14];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Global Infra AUM" value="$1.3T" sub="Unlisted funds" highlight="pos" />
        <StatCard label="Avg Yield" value="4.8%" sub="Income component" highlight="pos" />
        <StatCard label="20-Yr Total Return" value="8.4%" sub="Annualised" highlight="pos" />
        <StatCard label="Inflation Beta" value="0.78" sub="vs CPI" highlight="neutral" />
      </div>

      {/* Yield Comparison Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Yield vs Total Return by Infrastructure Sector
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg
              width={chartW}
              height={chartH + 20}
              className="min-w-[580px]"
            >
              {/* Grid lines */}
              {yTicks.map((t) => {
                const y = chartH - padB - (t / maxY) * (chartH - padB);
                return (
                  <g key={t}>
                    <line
                      x1={padL}
                      x2={chartW - 10}
                      y1={y}
                      y2={y}
                      stroke="rgba(255,255,255,0.08)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padL - 6}
                      y={y + 4}
                      textAnchor="end"
                      fill="rgba(255,255,255,0.45)"
                      fontSize={9}
                    >
                      {t}%
                    </text>
                  </g>
                );
              })}

              {bars.map((b) => (
                <g
                  key={b.name}
                  onClick={() => setSelected(selected?.name === b.name ? null : b)}
                  className="cursor-pointer"
                >
                  {/* Total return bar (background) */}
                  <rect
                    x={b.x}
                    y={chartH - padB - b.totalH}
                    width={barW}
                    height={b.totalH}
                    rx={3}
                    fill={
                      selected?.name === b.name
                        ? "rgba(99,102,241,0.55)"
                        : "rgba(99,102,241,0.3)"
                    }
                  />
                  {/* Yield bar (foreground) */}
                  <rect
                    x={b.x + 6}
                    y={chartH - padB - b.yieldH}
                    width={barW - 12}
                    height={b.yieldH}
                    rx={2}
                    fill={
                      selected?.name === b.name
                        ? "rgba(52,211,153,0.95)"
                        : "rgba(52,211,153,0.7)"
                    }
                  />
                  {/* Label */}
                  <text
                    x={b.x + barW / 2}
                    y={chartH - padB + 14}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize={8}
                  >
                    {b.name.split(" ")[0]}
                  </text>
                </g>
              ))}

              {/* Legend */}
              <rect x={padL} y={2} width={10} height={8} rx={1} fill="rgba(99,102,241,0.45)" />
              <text x={padL + 13} y={10} fill="rgba(255,255,255,0.55)" fontSize={9}>Total Return</text>
              <rect x={padL + 90} y={2} width={10} height={8} rx={1} fill="rgba(52,211,153,0.75)" />
              <text x={padL + 103} y={10} fill="rgba(255,255,255,0.55)" fontSize={9}>Income Yield</text>
            </svg>
          </div>

          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{selected.name}</span>
                    <Badge variant="outline" className={riskColor(selected.risk)}>
                      {selected.risk} Risk
                    </Badge>
                    {selected.regulated && (
                      <Badge variant="outline" className="text-primary border-border bg-primary/10">
                        Regulated
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                </div>
                <div className="flex gap-6 shrink-0 text-right">
                  <div>
                    <p className="text-xs text-muted-foreground">Yield</p>
                    <p className="text-lg font-bold text-emerald-400">{fmtPct(selected.yieldPct)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Return</p>
                    <p className="text-lg font-bold text-primary">{fmtPct(selected.totalReturn)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Infrastructure Assets Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Asset</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Sector</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Yield</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Total Return</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Risk</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Regulated</th>
                </tr>
              </thead>
              <tbody>
                {INFRA_ASSETS.map((a, i) => (
                  <tr
                    key={a.name}
                    className={`border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors ${
                      i % 2 === 0 ? "" : "bg-muted/10"
                    } ${selected?.name === a.name ? "bg-primary/10" : ""}`}
                    onClick={() => setSelected(selected?.name === a.name ? null : a)}
                  >
                    <td className="p-3 font-medium">{a.name}</td>
                    <td className="p-3 text-muted-foreground">{a.sector}</td>
                    <td className="p-3 text-right text-emerald-400 font-mono">{fmtPct(a.yieldPct)}</td>
                    <td className="p-3 text-right text-primary font-mono">{fmtPct(a.totalReturn)}</td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={riskColor(a.risk)}>{a.risk}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      {a.regulated ? (
                        <span className="text-emerald-400 text-xs">Yes</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">No</span>
                      )}
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

// ── Real Estate Tab ───────────────────────────────────────────────────────────

function RealEstateTab() {
  const [filterType, setFilterType] = useState<"All" | "REIT" | "Direct">("All");

  const filtered = useMemo(
    () =>
      filterType === "All"
        ? REIT_DATA
        : REIT_DATA.filter((r) => r.type === filterType),
    [filterType]
  );

  const avgCapRate = (filtered.reduce((a, b) => a + b.capRate, 0) / filtered.length).toFixed(1);
  const avgNOI = (filtered.reduce((a, b) => a + b.noiYield, 0) / filtered.length).toFixed(1);
  const avgReturn = (filtered.reduce((a, b) => a + b.totalReturn, 0) / filtered.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Avg Cap Rate" value={`${avgCapRate}%`} sub={filterType} highlight="pos" />
        <StatCard label="Avg NOI Yield" value={`${avgNOI}%`} sub="Net operating income" highlight="pos" />
        <StatCard label="Avg Total Return" value={`${avgReturn}%`} sub="10-yr annualised" highlight="pos" />
        <StatCard label="Global RE AUM" value="$4.6T" sub="Institutional grade" highlight="neutral" />
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["All", "REIT", "Direct"] as const).map((t) => (
          <Button
            key={t}
            size="sm"
            variant={filterType === t ? "default" : "outline"}
            onClick={() => setFilterType(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            REIT vs Direct Real Estate — Cap Rate & Return Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Type</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Sector</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Cap Rate</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">NOI Yield</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Total Return</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Liquidity</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Min. Invest.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.name}
                    className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                      i % 2 === 0 ? "" : "bg-muted/10"
                    }`}
                  >
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3 text-center">
                      <Badge
                        variant="outline"
                        className={
                          r.type === "REIT"
                            ? "text-primary border-border bg-primary/10"
                            : "text-amber-400 border-amber-400/30 bg-amber-400/10"
                        }
                      >
                        {r.type}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{r.sector}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">{fmtPct(r.capRate)}</td>
                    <td className="p-3 text-right font-mono text-primary">{fmtPct(r.noiYield)}</td>
                    <td className="p-3 text-right font-mono font-bold">{fmtPct(r.totalReturn)}</td>
                    <td className="p-3 text-center">
                      <span
                        className={
                          r.liquidity === "High"
                            ? "text-emerald-400"
                            : r.liquidity === "Medium"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }
                      >
                        {r.liquidity}
                      </span>
                    </td>
                    <td className="p-3 text-right text-muted-foreground">{r.minInvestment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cap Rate Bars */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Cap Rate Comparison (Visual)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((r) => (
            <div key={r.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-foreground/80">{r.name}</span>
                <span className="font-mono text-emerald-400">{fmtPct(r.capRate)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.capRate / 8) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    r.type === "REIT" ? "bg-primary" : "bg-amber-500"
                  }`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Commodities Tab ───────────────────────────────────────────────────────────

function CommoditiesTab() {
  const [hoveredComm, setHoveredComm] = useState<CommodityEntry | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const categories = ["All", "Precious Metals", "Energy", "Agricultural", "Base Metals"];

  const filtered = useMemo(
    () =>
      categoryFilter === "All"
        ? COMMODITIES
        : COMMODITIES.filter((c) => c.category === categoryFilter),
    [categoryFilter]
  );

  // Scatter chart dimensions
  const sw = 540;
  const sh = 280;
  const padL = 50;
  const padB = 40;
  const padT = 20;
  const padR = 20;

  const plotW = sw - padL - padR;
  const plotH = sh - padB - padT;

  const maxCorr = 1.0;
  const maxVol = 55;

  function scatterX(inflationCorr: number): number {
    return padL + (inflationCorr / maxCorr) * plotW;
  }
  function scatterY(volatility: number): number {
    return padT + plotH - (volatility / maxVol) * plotH;
  }

  const categoryColors: Record<string, string> = {
    "Precious Metals": "#facc15",
    Energy: "#f97316",
    Agricultural: "#4ade80",
    "Base Metals": "#60a5fa",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Gold Spot" value="$2,342" sub="Per troy oz" highlight="pos" />
        <StatCard label="WTI Crude" value="$81.4" sub="Per barrel" highlight="pos" />
        <StatCard label="Avg Inflation Corr." value="0.54" sub="30-year average" highlight="neutral" />
        <StatCard label="Commodity AUM" value="$680B" sub="Managed exposure" highlight="neutral" />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Button
            key={c}
            size="sm"
            variant={categoryFilter === c ? "default" : "outline"}
            onClick={() => setCategoryFilter(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {/* Scatter chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Inflation Correlation vs Volatility Scatter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={sw} height={sh} className="min-w-[540px]">
              {/* Grid */}
              {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((xv) => (
                <g key={`xg-${xv}`}>
                  <line
                    x1={padL + (xv / maxCorr) * plotW}
                    x2={padL + (xv / maxCorr) * plotW}
                    y1={padT}
                    y2={padT + plotH}
                    stroke="rgba(255,255,255,0.07)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padL + (xv / maxCorr) * plotW}
                    y={padT + plotH + 16}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.4)"
                    fontSize={9}
                  >
                    {xv.toFixed(1)}
                  </text>
                </g>
              ))}
              {[0, 10, 20, 30, 40, 50].map((yv) => (
                <g key={`yg-${yv}`}>
                  <line
                    x1={padL}
                    x2={padL + plotW}
                    y1={padT + plotH - (yv / maxVol) * plotH}
                    y2={padT + plotH - (yv / maxVol) * plotH}
                    stroke="rgba(255,255,255,0.07)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padL - 6}
                    y={padT + plotH - (yv / maxVol) * plotH + 4}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.4)"
                    fontSize={9}
                  >
                    {yv}%
                  </text>
                </g>
              ))}

              {/* Axis labels */}
              <text
                x={padL + plotW / 2}
                y={sh - 4}
                textAnchor="middle"
                fill="rgba(255,255,255,0.5)"
                fontSize={10}
              >
                Inflation Correlation
              </text>
              <text
                x={10}
                y={padT + plotH / 2}
                textAnchor="middle"
                fill="rgba(255,255,255,0.5)"
                fontSize={10}
                transform={`rotate(-90, 10, ${padT + plotH / 2})`}
              >
                Volatility (%)
              </text>

              {/* Points */}
              {filtered.map((c) => {
                const cx = scatterX(c.inflationCorr);
                const cy = scatterY(c.volatility);
                const color = categoryColors[c.category] ?? "#a78bfa";
                const isHovered = hoveredComm?.symbol === c.symbol;
                return (
                  <g
                    key={c.symbol}
                    onMouseEnter={() => setHoveredComm(c)}
                    onMouseLeave={() => setHoveredComm(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 8 : 6}
                      fill={color}
                      fillOpacity={isHovered ? 0.95 : 0.75}
                      stroke={isHovered ? color : "transparent"}
                      strokeWidth={2}
                    />
                    <text
                      x={cx + 9}
                      y={cy + 4}
                      fill={color}
                      fontSize={9}
                      opacity={isHovered ? 1 : 0.7}
                    >
                      {c.symbol}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-2">
            {Object.entries(categoryColors).map(([cat, col]) => (
              <div key={cat} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: col }}
                />
                {cat}
              </div>
            ))}
          </div>

          {hoveredComm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 p-3 rounded-lg border border-border bg-muted/30 flex flex-wrap gap-4 text-sm"
            >
              <div>
                <span className="text-muted-foreground">Name: </span>
                <span className="font-semibold">{hoveredComm.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Spot: </span>
                <span className="font-mono">
                  ${hoveredComm.spotPrice.toLocaleString()} / {hoveredComm.unit}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Ann. Return: </span>
                <span className={`font-mono ${posNegClass(hoveredComm.annualReturn)}`}>
                  {fmtPct(hoveredComm.annualReturn)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Volatility: </span>
                <span className="font-mono text-amber-400">{fmtPct(hoveredComm.volatility)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Inflation Corr.: </span>
                <span className="font-mono text-primary">{hoveredComm.inflationCorr.toFixed(2)}</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Commodity Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Commodity</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Spot Price</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Ann. Return</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Volatility</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Inflation Corr.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.symbol}
                    className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                      i % 2 === 0 ? "" : "bg-muted/10"
                    }`}
                    onMouseEnter={() => setHoveredComm(c)}
                    onMouseLeave={() => setHoveredComm(null)}
                  >
                    <td className="p-3 font-medium">
                      {c.name}{" "}
                      <span className="text-xs text-muted-foreground ml-1">{c.symbol}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{c.category}</td>
                    <td className="p-3 text-right font-mono">
                      ${c.spotPrice.toLocaleString()} / {c.unit}
                    </td>
                    <td className={`p-3 text-right font-mono ${posNegClass(c.annualReturn)}`}>
                      {fmtPct(c.annualReturn)}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-400">{fmtPct(c.volatility)}</td>
                    <td className="p-3 text-right font-mono text-primary">
                      {c.inflationCorr.toFixed(2)}
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

// ── Timberland & Farmland Tab ─────────────────────────────────────────────────

function TimberFarmlandTab() {
  const [selected, setSelected] = useState<TimberFarmEntry | null>(null);

  const svgW = 560;
  const svgH = 240;
  const barW = 42;
  const gap = 30;
  const padL = 44;
  const padB = 44;
  const maxY = 12;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Timberland NCREIF" value="6.8%" sub="20-yr return" highlight="pos" />
        <StatCard label="Farmland NCREIF" value="10.7%" sub="20-yr return" highlight="pos" />
        <StatCard label="Carbon Credit Upside" value="+1.4%" sub="Avg addl. return" highlight="pos" />
        <StatCard label="ESG Premium" value="~12%" sub="vs comparable land" highlight="neutral" />
      </div>

      {/* Return Breakdown SVG */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TreePine className="w-4 h-4 text-emerald-500" />
            Return Breakdown — Biological Growth + Land Appreciation + Cash Yield
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={svgW} height={svgH + 30} className="min-w-[560px]">
              {/* Y grid */}
              {[0, 2, 4, 6, 8, 10, 12].map((t) => {
                const y = svgH - padB - (t / maxY) * (svgH - padB);
                return (
                  <g key={t}>
                    <line
                      x1={padL}
                      x2={svgW - 10}
                      y1={y}
                      y2={y}
                      stroke="rgba(255,255,255,0.07)"
                      strokeDasharray="3 3"
                    />
                    <text x={padL - 6} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize={9}>
                      {t}%
                    </text>
                  </g>
                );
              })}

              {TIMBER_FARM.map((item, i) => {
                const x = padL + i * (barW + gap);
                const bioH = (item.biologicalGrowth / maxY) * (svgH - padB);
                const landH = (item.landAppreciation / maxY) * (svgH - padB);
                const cashH = (item.cashYield / maxY) * (svgH - padB);
                const baseY = svgH - padB;
                const isSelected = selected?.name === item.name;

                return (
                  <g
                    key={item.name}
                    onClick={() => setSelected(isSelected ? null : item)}
                    className="cursor-pointer"
                  >
                    {/* Stacked bars */}
                    {/* Cash yield (bottom) */}
                    <rect
                      x={x}
                      y={baseY - cashH}
                      width={barW}
                      height={cashH}
                      rx={0}
                      fill={`rgba(52,211,153,${isSelected ? 0.9 : 0.65})`}
                    />
                    {/* Land appreciation (middle) */}
                    <rect
                      x={x}
                      y={baseY - cashH - landH}
                      width={barW}
                      height={landH}
                      fill={`rgba(99,102,241,${isSelected ? 0.9 : 0.65})`}
                    />
                    {/* Biological growth (top) */}
                    {bioH > 0 && (
                      <rect
                        x={x}
                        y={baseY - cashH - landH - bioH}
                        width={barW}
                        height={bioH}
                        rx={3}
                        fill={`rgba(34,197,94,${isSelected ? 0.9 : 0.65})`}
                      />
                    )}
                    {/* Top rounded cap */}
                    <rect
                      x={x}
                      y={baseY - cashH - landH - bioH}
                      width={barW}
                      height={3}
                      rx={2}
                      fill="rgba(255,255,255,0.15)"
                    />

                    {/* Label */}
                    <text
                      x={x + barW / 2}
                      y={baseY + 14}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.5)"
                      fontSize={7.5}
                    >
                      {item.name.split(" ").slice(0, 2).join(" ")}
                    </text>
                    {/* Type badge */}
                    <text
                      x={x + barW / 2}
                      y={baseY + 25}
                      textAnchor="middle"
                      fill={item.type === "Timber" ? "rgba(52,211,153,0.7)" : "rgba(251,191,36,0.7)"}
                      fontSize={7}
                    >
                      {item.type}
                    </text>
                  </g>
                );
              })}

              {/* Legend */}
              <rect x={padL} y={4} width={10} height={7} fill="rgba(34,197,94,0.7)" />
              <text x={padL + 13} y={11} fill="rgba(255,255,255,0.5)" fontSize={9}>Bio Growth</text>
              <rect x={padL + 80} y={4} width={10} height={7} fill="rgba(99,102,241,0.7)" />
              <text x={padL + 93} y={11} fill="rgba(255,255,255,0.5)" fontSize={9}>Land Apprec.</text>
              <rect x={padL + 170} y={4} width={10} height={7} fill="rgba(52,211,153,0.7)" />
              <text x={padL + 183} y={11} fill="rgba(255,255,255,0.5)" fontSize={9}>Cash Yield</text>
            </svg>
          </div>

          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex flex-wrap items-start gap-6">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{selected.name}</span>
                    <Badge
                      variant="outline"
                      className={
                        selected.type === "Timber"
                          ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                          : "text-amber-400 border-amber-400/30 bg-amber-400/10"
                      }
                    >
                      {selected.type}
                    </Badge>
                    {selected.carbonCredits && (
                      <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10">
                        Carbon Credits
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">ESG Score: </span>
                      <span className="text-emerald-400 font-semibold">{selected.esgScore}/100</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Return: </span>
                      <span className="text-primary font-semibold">{fmtPct(selected.totalReturn)}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-right">
                  <div>
                    <p className="text-xs text-muted-foreground">Bio Growth</p>
                    <p className="font-mono text-green-400">{fmtPct(selected.biologicalGrowth)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Land Apprec.</p>
                    <p className="font-mono text-primary">{fmtPct(selected.landAppreciation)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cash Yield</p>
                    <p className="font-mono text-emerald-400">{fmtPct(selected.cashYield)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Timberland & Farmland Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Asset</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Type</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Bio Growth</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Land Apprec.</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Cash Yield</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Total Return</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">ESG</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Carbon</th>
                </tr>
              </thead>
              <tbody>
                {TIMBER_FARM.map((item, i) => (
                  <tr
                    key={item.name}
                    className={`border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors ${
                      i % 2 === 0 ? "" : "bg-muted/10"
                    } ${selected?.name === item.name ? "bg-primary/10" : ""}`}
                    onClick={() => setSelected(selected?.name === item.name ? null : item)}
                  >
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3 text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.type === "Timber"
                            ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                            : "text-amber-400 border-amber-400/30 bg-amber-400/10"
                        }
                      >
                        {item.type}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono text-green-400">
                      {item.biologicalGrowth > 0 ? fmtPct(item.biologicalGrowth) : "—"}
                    </td>
                    <td className="p-3 text-right font-mono text-primary">{fmtPct(item.landAppreciation)}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">{fmtPct(item.cashYield)}</td>
                    <td className="p-3 text-right font-mono font-bold">{fmtPct(item.totalReturn)}</td>
                    <td className="p-3 text-right">
                      <span
                        className={
                          item.esgScore >= 80
                            ? "text-emerald-400"
                            : item.esgScore >= 65
                            ? "text-amber-400"
                            : "text-rose-400"
                        }
                      >
                        {item.esgScore}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {item.carbonCredits ? (
                        <span className="text-green-400 text-xs">Yes</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">No</span>
                      )}
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

// ── Portfolio Role Tab ────────────────────────────────────────────────────────

function PortfolioRoleTab() {
  const [showInfo, setShowInfo] = useState(false);

  // Correlation matrix cell dimensions
  const cellW = 78;
  const cellH = 36;
  const labelW = 110;
  const headerH = 36;
  const assets = CORRELATION_DATA.map((d) => d.asset);
  const headers = ["Stocks", "Bonds", "Inflation"];

  const matrixW = labelW + headers.length * cellW + 12;
  const matrixH = headerH + assets.length * cellH + 8;

  // Diversification scenarios
  const scenarios = useMemo(() => {
    const base = [
      {
        label: "60/40 Portfolio",
        realAssets: 0,
        stocks: 60,
        bonds: 40,
        expReturn: 7.2,
        volatility: 12.4,
        sharpe: 0.58,
      },
      {
        label: "60/30/10 (RE)",
        realAssets: 10,
        stocks: 60,
        bonds: 30,
        expReturn: 7.8,
        volatility: 11.6,
        sharpe: 0.67,
      },
      {
        label: "55/25/20 (Infra)",
        realAssets: 20,
        stocks: 55,
        bonds: 25,
        expReturn: 8.1,
        volatility: 10.8,
        sharpe: 0.75,
      },
      {
        label: "50/20/30 (Multi)",
        realAssets: 30,
        stocks: 50,
        bonds: 20,
        expReturn: 8.4,
        volatility: 10.2,
        sharpe: 0.82,
      },
      {
        label: "40/15/45 (Max RA)",
        realAssets: 45,
        stocks: 40,
        bonds: 15,
        expReturn: 8.6,
        volatility: 9.8,
        sharpe: 0.88,
      },
    ];
    return base;
  }, []);

  const maxSharpe = Math.max(...scenarios.map((s) => s.sharpe));

  // Inflation hedge metrics
  const hedgeMetrics = [
    { asset: "Farmland", hedgeScore: 92, mechanism: "Commodity price linkage + land scarcity" },
    { asset: "Commodities", hedgeScore: 88, mechanism: "Direct price level exposure" },
    { asset: "Infrastructure", hedgeScore: 82, mechanism: "CPI-escalator contracts" },
    { asset: "Real Estate", hedgeScore: 76, mechanism: "Rent growth tracks inflation" },
    { asset: "Gold", hedgeScore: 72, mechanism: "Store of value, currency hedge" },
    { asset: "Timberland", hedgeScore: 68, mechanism: "Biological growth + land value" },
    { asset: "TIPS", hedgeScore: 95, mechanism: "Direct CPI linkage (benchmark)" },
    { asset: "Equities", hedgeScore: 42, mechanism: "Partial earnings pass-through" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Diversification Benefit" value="−2.6%" sub="Vol reduction (20% RA)" highlight="pos" />
        <StatCard label="Sharpe Improvement" value="+0.24" sub="60/40 → 50/20/30" highlight="pos" />
        <StatCard label="Inflation Beta" value="0.74" sub="Real assets composite" highlight="neutral" />
        <StatCard label="Illiquidity Premium" value="+1.8%" sub="Private vs listed" highlight="pos" />
      </div>

      {/* Correlation Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Cross-Asset Correlation Matrix
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-6 w-6 p-0"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="w-3.5 h-3.5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-lg bg-primary/10 border border-border text-xs text-primary"
            >
              Darker green = higher positive correlation. Lower correlations with stocks and bonds indicate
              stronger diversification benefit. Inflation column shows hedge effectiveness.
            </motion.div>
          )}
          <div className="overflow-x-auto">
            <svg width={matrixW} height={matrixH} className="min-w-[350px]">
              {/* Column headers */}
              {headers.map((h, j) => (
                <text
                  key={h}
                  x={labelW + j * cellW + cellW / 2}
                  y={headerH - 8}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.6)"
                  fontSize={10}
                  fontWeight="500"
                >
                  {h}
                </text>
              ))}

              {/* Rows */}
              {CORRELATION_DATA.map((row, i) => (
                <g key={row.asset}>
                  {/* Row label */}
                  <text
                    x={labelW - 8}
                    y={headerH + i * cellH + cellH / 2 + 4}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.7)"
                    fontSize={10}
                  >
                    {row.asset}
                  </text>
                  {/* Cells */}
                  {[row.stocks, row.bonds, row.inflation].map((val, j) => {
                    const cx = labelW + j * cellW;
                    const cy = headerH + i * cellH;
                    return (
                      <g key={`cell-${i}-${j}`}>
                        <rect
                          x={cx + 2}
                          y={cy + 2}
                          width={cellW - 4}
                          height={cellH - 4}
                          rx={4}
                          className={corrColor(val)}
                        />
                        <text
                          x={cx + cellW / 2}
                          y={cy + cellH / 2 + 4}
                          textAnchor="middle"
                          fill="white"
                          fontSize={11}
                          fontWeight="600"
                          className={corrTextColor(val)}
                        >
                          {val.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Diversification Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Portfolio Allocation Scenarios — Sharpe Ratio Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scenarios.map((sc) => {
            const isMax = sc.sharpe === maxSharpe;
            return (
              <div key={sc.label} className={`p-3 rounded-lg border transition-colors ${isMax ? "border-primary/40 bg-primary/5" : "border-border bg-muted/10"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{sc.label}</span>
                    {isMax && (
                      <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                        Best Sharpe
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Stocks: <span className="text-foreground font-mono">{sc.stocks}%</span></span>
                    <span>Bonds: <span className="text-foreground font-mono">{sc.bonds}%</span></span>
                    <span>Real Assets: <span className="text-primary font-mono">{sc.realAssets}%</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Sharpe Ratio</span>
                      <span className={`font-mono ${isMax ? "text-primary font-bold" : "text-foreground"}`}>
                        {sc.sharpe.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(sc.sharpe / 1.0) * 100}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={`h-full rounded-full ${isMax ? "bg-primary" : "bg-primary/50"}`}
                      />
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-muted-foreground">Exp. Return / Vol</p>
                    <p className="font-mono">
                      <span className="text-emerald-400">{fmtPct(sc.expReturn)}</span>
                      {" / "}
                      <span className="text-amber-400">{fmtPct(sc.volatility)}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Inflation Hedge Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Inflation Hedge Effectiveness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hedgeMetrics.map((m) => (
            <div key={m.asset} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-foreground/80 font-medium w-24">{m.asset}</span>
                  <span className="text-muted-foreground hidden md:block">{m.mechanism}</span>
                </div>
                <span
                  className={`font-mono font-semibold ${
                    m.hedgeScore >= 80
                      ? "text-emerald-400"
                      : m.hedgeScore >= 60
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {m.hedgeScore}/100
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.hedgeScore}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    m.hedgeScore >= 80
                      ? "bg-emerald-500"
                      : m.hedgeScore >= 60
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RealAssetsPage() {
  // Consume rand to ensure PRNG is exercised for seeded determinism
  void rand();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-500" />
            Real Assets &amp; Infrastructure
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Infrastructure, real estate, commodities, timberland &amp; farmland — inflation protection &amp;
            portfolio diversification
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
            <TrendingUp className="w-3 h-3 mr-1" />
            Inflation Hedge
          </Badge>
          <Badge variant="outline" className="text-primary border-border bg-primary/10">
            <Shield className="w-3 h-3 mr-1" />
            Low Correlation
          </Badge>
          <Badge variant="outline" className="text-amber-400 border-amber-400/30 bg-amber-400/10">
            <DollarSign className="w-3 h-3 mr-1" />
            Income + Growth
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Global Real Assets AUM"
          value="$6.4T"
          sub="Infra + RE + Commodities"
          highlight="pos"
        />
        <StatCard
          label="20-Yr Avg Return"
          value="8.1%"
          sub="Institutional composite"
          highlight="pos"
        />
        <StatCard
          label="Avg Inflation Corr."
          value="0.66"
          sub="vs equity 0.22"
          highlight="neutral"
        />
        <StatCard
          label="Pension Allocation"
          value="18%"
          sub="avg target allocation"
          highlight="neutral"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="infrastructure" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="infrastructure" className="flex items-center gap-1.5 text-xs">
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Infrastructure</span>
            <span className="sm:hidden">Infra</span>
          </TabsTrigger>
          <TabsTrigger value="realestate" className="flex items-center gap-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Real Estate</span>
            <span className="sm:hidden">RE</span>
          </TabsTrigger>
          <TabsTrigger value="commodities" className="flex items-center gap-1.5 text-xs">
            <Droplets className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Commodities</span>
            <span className="sm:hidden">Commod.</span>
          </TabsTrigger>
          <TabsTrigger value="timberland" className="flex items-center gap-1.5 text-xs">
            <TreePine className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timber &amp; Farm</span>
            <span className="sm:hidden">Timber</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-1.5 text-xs">
            <Percent className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portfolio Role</span>
            <span className="sm:hidden">Portfolio</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="infrastructure" className="mt-6">
          <InfrastructureTab />
        </TabsContent>

        <TabsContent value="realestate" className="mt-6">
          <RealEstateTab />
        </TabsContent>

        <TabsContent value="commodities" className="mt-6">
          <CommoditiesTab />
        </TabsContent>

        <TabsContent value="timberland" className="mt-6">
          <TimberFarmlandTab />
        </TabsContent>

        <TabsContent value="portfolio" className="mt-6">
          <PortfolioRoleTab />
        </TabsContent>
      </Tabs>

      {/* Key Concepts Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            Key Real Asset Concepts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-primary" /> Cap Rate
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Net Operating Income / Property Value. Lower cap rates imply higher valuations and lower
                immediate income yields. Cap rate compression drove RE returns 2010–2022.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Regulated Asset Base
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Utility infrastructure earns returns on its RAB set by regulators. Predictable, bond-like
                returns with inflation pass-through. Key metric for valuing water and electricity networks.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-500" /> Biological Growth
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Unique to timberland — trees grow in volume and value even without market activity. This
                natural capital accumulation provides a non-correlated return source independent of financial
                markets.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
