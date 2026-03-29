"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  TrendingDown,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  ArrowRightLeft,
  Shield,
  Target,
  Info,
  Zap,
} from "lucide-react";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 642005;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface Holding {
  ticker: string;
  name: string;
  assetClass: string;
  currentWeight: number;
  targetWeight: number;
  currentValue: number;
  costBasis: number;
  taxLot: "long" | "short";
}

interface DriftPoint {
  month: string;
  equityDrift: number;
  bondDrift: number;
  altDrift: number;
  rebalancedAt: boolean;
}

type AccountType = "taxable" | "traditional" | "roth";

interface AssetLocationRule {
  assetClass: string;
  ideal: AccountType;
  reason: string;
  score: number;
}

// ── Static data ───────────────────────────────────────────────────────────────

const HOLDINGS: Holding[] = [
  { ticker: "VTI",  name: "Vanguard Total Market",    assetClass: "US Equity",      currentWeight: 28.4, targetWeight: 25.0, currentValue: 56800, costBasis: 48200, taxLot: "long" },
  { ticker: "VXUS", name: "Vanguard International",   assetClass: "Intl Equity",    currentWeight: 16.2, targetWeight: 20.0, currentValue: 32400, costBasis: 34100, taxLot: "long" },
  { ticker: "BND",  name: "Vanguard Total Bond",      assetClass: "US Bond",        currentWeight: 11.8, targetWeight: 15.0, currentValue: 23600, costBasis: 24800, taxLot: "long" },
  { ticker: "BNDX", name: "Vanguard Intl Bond",       assetClass: "Intl Bond",      currentWeight: 5.1,  targetWeight: 5.0,  currentValue: 10200, costBasis:  9800, taxLot: "long" },
  { ticker: "VNQ",  name: "Vanguard Real Estate",     assetClass: "Real Estate",    currentWeight: 7.3,  targetWeight: 5.0,  currentValue: 14600, costBasis: 12200, taxLot: "long" },
  { ticker: "GLD",  name: "SPDR Gold Shares",         assetClass: "Commodities",    currentWeight: 4.8,  targetWeight: 5.0,  currentValue:  9600, costBasis:  8900, taxLot: "short" },
  { ticker: "TIP",  name: "iShares TIPS Bond",        assetClass: "TIPS",           currentWeight: 3.9,  targetWeight: 5.0,  currentValue:  7800, costBasis:  8100, taxLot: "long" },
  { ticker: "AAPL", name: "Apple Inc.",               assetClass: "US Equity",      currentWeight: 12.6, targetWeight: 10.0, currentValue: 25200, costBasis: 18500, taxLot: "long" },
  { ticker: "NVDA", name: "NVIDIA Corporation",       assetClass: "US Equity",      currentWeight: 6.9,  targetWeight: 5.0,  currentValue: 13800, costBasis:  4200, taxLot: "long" },
  { ticker: "INTC", name: "Intel Corporation",        assetClass: "US Equity",      currentWeight: 3.0,  targetWeight: 5.0,  currentValue:  6000, costBasis:  9500, taxLot: "long" },
];

const TOTAL_PORTFOLIO = HOLDINGS.reduce((acc, h) => acc + h.currentValue, 0);

// Generate 12-month drift history
const DRIFT_HISTORY: DriftPoint[] = (() => {
  const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  return months.map((month, i) => ({
    month,
    equityDrift:  parseFloat(((rand() * 8 - 4) + (i < 4 ? 0 : i < 8 ? 2 : -1)).toFixed(2)),
    bondDrift:    parseFloat(((rand() * 6 - 3) + (i < 4 ? 0 : -1.5)).toFixed(2)),
    altDrift:     parseFloat(((rand() * 4 - 2)).toFixed(2)),
    rebalancedAt: i === 5 || i === 9,
  }));
})();

const ASSET_LOCATION_RULES: AssetLocationRule[] = [
  { assetClass: "US Equity (Growth)",   ideal: "roth",       reason: "Tax-free growth on high-return assets maximizes Roth benefit",    score: 95 },
  { assetClass: "US Equity (Dividend)",  ideal: "traditional", reason: "Dividends sheltered from annual taxation in tax-deferred accounts", score: 80 },
  { assetClass: "Intl Equity",           ideal: "taxable",    reason: "Foreign tax credit only usable in taxable accounts",               score: 75 },
  { assetClass: "TIPS / I-Bonds",        ideal: "traditional", reason: "Inflation adjustments taxed as ordinary income — defer them",      score: 88 },
  { assetClass: "REITs",                 ideal: "traditional", reason: "High ordinary income distributions benefit from deferral",         score: 90 },
  { assetClass: "Municipal Bonds",       ideal: "taxable",    reason: "Already tax-exempt federally; wasted inside tax-sheltered accounts", score: 85 },
  { assetClass: "Commodities (GLD/SLV)", ideal: "roth",       reason: "Collected as 28% collectibles rate — neutralize in Roth",          score: 70 },
  { assetClass: "Total Bond Market",     ideal: "traditional", reason: "Bond interest taxed as ordinary income — best deferred",          score: 82 },
];

const SUBSTITUTE_SECURITIES: Record<string, string[]> = {
  VXUS: ["EFA",  "VEA"],
  BND:  ["AGG",  "SCHZ"],
  TIP:  ["SCHP", "VTIP"],
  INTC: ["SOXX", "SMH"],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt$(n: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: decimals,
  }).format(n);
}

function fmtPct(n: number, decimals = 1): string {
  return (n >= 0 ? "+" : "") + n.toFixed(decimals) + "%";
}

function driftColor(drift: number, threshold: number): string {
  const abs = Math.abs(drift);
  if (abs < threshold * 0.5) return "text-emerald-400";
  if (abs < threshold)       return "text-amber-400";
  return "text-red-400";
}

function driftBg(drift: number, threshold: number): string {
  const abs = Math.abs(drift);
  if (abs < threshold * 0.5) return "bg-emerald-500/20 text-emerald-300";
  if (abs < threshold)       return "bg-amber-500/20 text-amber-300";
  return "bg-red-500/20 text-red-300";
}

// ── Donut Chart Component ─────────────────────────────────────────────────────

interface DonutSlice { label: string; value: number; color: string }

function DonutChart({ slices, title, size = 140 }: { slices: DonutSlice[]; title: string; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const strokeWidth = size * 0.16;
  const circumference = 2 * Math.PI * r;

  const total = slices.reduce((s, d) => s + d.value, 0);
  let cumulativeAngle = -Math.PI / 2;

  const paths = slices.map((slice, i) => {
    const fraction = slice.value / total;
    const angle = fraction * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumulativeAngle);
    const y1 = cy + r * Math.sin(cumulativeAngle);
    cumulativeAngle += angle;
    const x2 = cx + r * Math.cos(cumulativeAngle);
    const y2 = cy + r * Math.sin(cumulativeAngle);
    const largeArc = fraction > 0.5 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return <path key={i} d={d} fill={slice.color} opacity={0.85} />;
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size}>
        {paths}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="#0f172a" />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#94a3b8" fontSize={size * 0.08} fontWeight="600">{title}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#64748b" fontSize={size * 0.07}>Portfolio</text>
      </svg>
    </div>
  );
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────

function DriftLineChart({ data }: { data: DriftPoint[] }) {
  const W = 600; const H = 160; const padX = 36; const padY = 16;
  const plotW = W - padX * 2;
  const plotH = H - padY * 2;

  const allVals = data.flatMap(d => [d.equityDrift, d.bondDrift, d.altDrift]);
  const minV = Math.min(...allVals) - 0.5;
  const maxV = Math.max(...allVals) + 0.5;
  const rangeV = maxV - minV;

  const toX = (i: number) => padX + (i / (data.length - 1)) * plotW;
  const toY = (v: number) => padY + plotH - ((v - minV) / rangeV) * plotH;

  const makePath = (key: keyof Pick<DriftPoint, "equityDrift" | "bondDrift" | "altDrift">) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d[key])}`).join(" ");

  const zeroY = toY(0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      {/* zero line */}
      <line x1={padX} y1={zeroY} x2={W - padX} y2={zeroY} stroke="#334155" strokeWidth={1} strokeDasharray="4 4" />
      {/* y-axis labels */}
      {[-4, -2, 0, 2, 4].map(v => (
        <text key={v} x={padX - 4} y={toY(v) + 4} textAnchor="end" fill="#475569" fontSize={9}>{v}%</text>
      ))}
      {/* x-axis labels */}
      {data.map((d, i) => (
        <text key={i} x={toX(i)} y={H - 2} textAnchor="middle" fill="#475569" fontSize={9}>{d.month}</text>
      ))}
      {/* Rebalance event markers */}
      {data.map((d, i) => d.rebalancedAt && (
        <line key={i} x1={toX(i)} y1={padY} x2={toX(i)} y2={H - padY} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="3 3" />
      ))}
      {data.map((d, i) => d.rebalancedAt && (
        <text key={`r${i}`} x={toX(i)} y={padY - 2} textAnchor="middle" fill="#818cf8" fontSize={8}>RB</text>
      ))}
      {/* Lines */}
      <path d={makePath("equityDrift")} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />
      <path d={makePath("bondDrift")}   fill="none" stroke="#10b981" strokeWidth={2} strokeLinejoin="round" />
      <path d={makePath("altDrift")}    fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinejoin="round" />
      {/* dots */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(d.equityDrift)} r={3} fill="#3b82f6" />
          <circle cx={toX(i)} cy={toY(d.bondDrift)}   r={3} fill="#10b981" />
          <circle cx={toX(i)} cy={toY(d.altDrift)}    r={3} fill="#f59e0b" />
        </g>
      ))}
    </svg>
  );
}

// ── Asset Location Matrix SVG ─────────────────────────────────────────────────

interface LocationEntry { asset: string; taxable: number; traditional: number; roth: number }

function AllocationMatrix({ entries }: { entries: LocationEntry[] }) {
  const cellW = 80; const cellH = 28; const labelW = 140;
  const W = labelW + cellW * 3 + 10;
  const H = (entries.length + 1) * cellH + 8;
  const headers = ["Taxable", "Traditional", "Roth"];
  const headerColors = ["#3b82f6", "#f59e0b", "#10b981"];

  const scoreColor = (v: number) => {
    if (v >= 80) return "#10b981";
    if (v >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* header row */}
      {headers.map((h, i) => (
        <text key={h} x={labelW + cellW * i + cellW / 2} y={cellH - 8} textAnchor="middle" fill={headerColors[i]} fontSize={10} fontWeight="600">{h}</text>
      ))}
      {entries.map((e, row) => {
        const y = (row + 1) * cellH;
        return (
          <g key={row}>
            <text x={4} y={y + 18} fill="#94a3b8" fontSize={9}>{e.asset}</text>
            {[e.taxable, e.traditional, e.roth].map((v, col) => (
              <g key={col}>
                <rect x={labelW + cellW * col + 4} y={y + 4} width={cellW - 8} height={cellH - 8} rx={3}
                  fill={scoreColor(v)} opacity={0.15} />
                <text x={labelW + cellW * col + cellW / 2} y={y + 18} textAnchor="middle" fill={scoreColor(v)} fontSize={10} fontWeight="600">{v}</text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RebalancingPage() {
  const [driftThreshold, setDriftThreshold] = useState(5);
  const [calendarMode, setCalendarMode] = useState<"threshold" | "calendar">("threshold");
  const [rebalancing, setRebalancing] = useState(false);
  const [rebalancedAt, setRebalancedAt] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState(22);
  const [selectedHarvest, setSelectedHarvest] = useState<Set<string>>(new Set());
  const [locationView, setLocationView] = useState<AccountType>("taxable");

  // Computed drift per holding
  const drifts = useMemo(() =>
    HOLDINGS.map(h => ({
      ...h,
      drift: h.currentWeight - h.targetWeight,
      driftAbs: Math.abs(h.currentWeight - h.targetWeight),
    })),
  []);

  // Trades needed
  const trades = useMemo(() => {
    return drifts
      .filter(d => d.driftAbs >= driftThreshold)
      .map(d => {
        const targetValue = (d.targetWeight / 100) * TOTAL_PORTFOLIO;
        const currentValue = d.currentValue;
        const diff = targetValue - currentValue;
        return {
          ticker: d.ticker,
          action: diff > 0 ? "Buy" : "Sell",
          amount: Math.abs(diff),
          drift: d.drift,
          currentWeight: d.currentWeight,
          targetWeight: d.targetWeight,
          gainLoss: d.currentValue - d.costBasis,
        };
      });
  }, [drifts, driftThreshold]);

  const totalTxCost = useMemo(() =>
    trades.reduce((acc, t) => acc + t.amount * 0.0005, 0),
  [trades]);

  const taxImpact = useMemo(() => {
    const sells = trades.filter(t => t.action === "Sell");
    return sells.reduce((acc, t) => {
      if (t.gainLoss > 0) return acc + t.gainLoss * (taxRate / 100);
      return acc;
    }, 0);
  }, [trades, taxRate]);

  // Loss harvesting candidates
  const lossPositions = useMemo(() =>
    HOLDINGS.filter(h => h.currentValue < h.costBasis).map(h => ({
      ...h,
      unrealizedLoss: h.currentValue - h.costBasis,
      lossPercent: ((h.currentValue - h.costBasis) / h.costBasis) * 100,
      washSaleDays: Math.floor(rand() * 25) + 5,
      taxSavings: Math.abs(h.currentValue - h.costBasis) * (taxRate / 100),
    })),
  [taxRate]);

  const totalHarvestSavings = useMemo(() => {
    return lossPositions
      .filter(p => selectedHarvest.has(p.ticker))
      .reduce((acc, p) => acc + p.taxSavings, 0);
  }, [lossPositions, selectedHarvest]);

  const handleRebalance = () => {
    setRebalancing(true);
    setTimeout(() => {
      setRebalancing(false);
      setRebalancedAt(new Date().toLocaleTimeString());
    }, 2000);
  };

  const toggleHarvest = (ticker: string) => {
    setSelectedHarvest(prev => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker);
      else next.add(ticker);
      return next;
    });
  };

  // Donut slices for current vs target
  const assetColors: Record<string, string> = {
    "US Equity":   "#3b82f6",
    "Intl Equity": "#8b5cf6",
    "US Bond":     "#10b981",
    "Intl Bond":   "#06b6d4",
    "Real Estate": "#f59e0b",
    "Commodities": "#f97316",
    "TIPS":        "#84cc16",
  };

  const currentSlices = useMemo((): DonutSlice[] => {
    const grouped: Record<string, number> = {};
    HOLDINGS.forEach(h => {
      grouped[h.assetClass] = (grouped[h.assetClass] ?? 0) + h.currentWeight;
    });
    return Object.entries(grouped).map(([k, v]) => ({
      label: k, value: v, color: assetColors[k] ?? "#6b7280",
    }));
  }, []);

  const targetSlices = useMemo((): DonutSlice[] => {
    const grouped: Record<string, number> = {};
    HOLDINGS.forEach(h => {
      grouped[h.assetClass] = (grouped[h.assetClass] ?? 0) + h.targetWeight;
    });
    return Object.entries(grouped).map(([k, v]) => ({
      label: k, value: v, color: assetColors[k] ?? "#6b7280",
    }));
  }, []);

  // Asset location matrix entries
  const locationEntries: LocationEntry[] = [
    { asset: "US Equity (Growth)",   taxable: 55, traditional: 60, roth: 95 },
    { asset: "US Equity (Dividend)", taxable: 45, traditional: 80, roth: 75 },
    { asset: "International Equity", taxable: 75, traditional: 40, roth: 50 },
    { asset: "Total Bond Market",    taxable: 30, traditional: 82, roth: 60 },
    { asset: "TIPS / I-Bonds",       taxable: 25, traditional: 88, roth: 55 },
    { asset: "REITs",                taxable: 20, traditional: 90, roth: 70 },
    { asset: "Commodities",          taxable: 40, traditional: 55, roth: 70 },
    { asset: "Muni Bonds",           taxable: 85, traditional: 10, roth: 10 },
  ];

  // Current location optimization score
  const locationScore = 74;

  // Volatility drag stat
  const maxAbsDrift = Math.max(...drifts.map(d => d.driftAbs));
  const volDrag = (maxAbsDrift * 0.04).toFixed(2);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-primary" />
            Portfolio Rebalancing
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Systematic maintenance · Tax-loss harvesting · Asset location optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-muted-foreground border-border">
            Portfolio: {fmt$(TOTAL_PORTFOLIO)}
          </Badge>
          {rebalancedAt && (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Rebalanced {rebalancedAt}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* KPI row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Positions Over Threshold", value: String(drifts.filter(d => d.driftAbs >= driftThreshold).length), icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, sub: `of ${HOLDINGS.length} holdings` },
          { label: "Max Drift", value: fmtPct(maxAbsDrift), icon: <TrendingUp className="w-4 h-4 text-red-400" />, sub: "NVDA +5.6pp over-weight" },
          { label: "Est. Tax Impact", value: fmt$(taxImpact), icon: <DollarSign className="w-4 h-4 text-primary" />, sub: `at ${taxRate}% rate` },
          { label: "Location Score", value: `${locationScore}/100`, icon: <Shield className="w-4 h-4 text-emerald-400" />, sub: "Good — 2 improvements avail." },
        ].map((kpi, i) => (
          <Card key={i} className="bg-muted/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground text-xs">{kpi.label}</span>
                {kpi.icon}
              </div>
              <div className="text-xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-muted-foreground text-xs mt-0.5">{kpi.sub}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs defaultValue="portfolio">
          <TabsList className="bg-muted/70 border border-border mb-4">
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-primary data-[state=active]:text-foreground text-muted-foreground text-xs">
              <Layers className="w-3.5 h-3.5 mr-1" />Current Portfolio
            </TabsTrigger>
            <TabsTrigger value="engine" className="data-[state=active]:bg-primary data-[state=active]:text-foreground text-muted-foreground text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1" />Rebalancing Engine
            </TabsTrigger>
            <TabsTrigger value="harvest" className="data-[state=active]:bg-primary data-[state=active]:text-foreground text-muted-foreground text-xs">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />Tax-Loss Harvesting
            </TabsTrigger>
            <TabsTrigger value="location" className="data-[state=active]:bg-primary data-[state=active]:text-foreground text-muted-foreground text-xs">
              <Shield className="w-3.5 h-3.5 mr-1" />Asset Location
            </TabsTrigger>
            <TabsTrigger value="drift" className="data-[state=active]:bg-primary data-[state=active]:text-foreground text-muted-foreground text-xs">
              <BarChart3 className="w-3.5 h-3.5 mr-1" />Drift Analysis
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Current Portfolio ─────────────────────────────────────── */}
          <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Donut charts */}
              <Card className="bg-muted/50 border-border border-l-4 border-l-primary">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-lg text-muted-foreground">Current vs Target Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-around items-center py-2">
                    <DonutChart slices={currentSlices} title="Current" size={130} />
                    <DonutChart slices={targetSlices} title="Target" size={130} />
                  </div>
                  <div className="mt-3 space-y-1">
                    {currentSlices.map(sl => (
                      <div key={sl.label} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: sl.color }} />
                          <span className="text-muted-foreground">{sl.label}</span>
                        </div>
                        <span className="text-muted-foreground">{sl.value.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Holdings table */}
              <Card className="bg-muted/50 border-border lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Holdings — Drift Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-muted-foreground px-4 py-2">Ticker</th>
                        <th className="text-right text-muted-foreground px-2 py-2">Current</th>
                        <th className="text-right text-muted-foreground px-2 py-2">Target</th>
                        <th className="text-right text-muted-foreground px-2 py-2">Drift</th>
                        <th className="text-right text-muted-foreground px-4 py-2">Value</th>
                        <th className="text-right text-muted-foreground px-2 py-2">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drifts.map((h, i) => {
                        const pnl = h.currentValue - h.costBasis;
                        const pnlPct = (pnl / h.costBasis) * 100;
                        return (
                          <motion.tr
                            key={h.ticker}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-2">
                              <div className="font-semibold text-foreground">{h.ticker}</div>
                              <div className="text-muted-foreground">{h.assetClass}</div>
                            </td>
                            <td className="text-right px-2 py-2 text-muted-foreground">{h.currentWeight.toFixed(1)}%</td>
                            <td className="text-right px-2 py-2 text-muted-foreground">{h.targetWeight.toFixed(1)}%</td>
                            <td className="text-right px-2 py-2">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${driftBg(h.drift, driftThreshold)}`}>
                                {fmtPct(h.drift)}
                              </span>
                            </td>
                            <td className="text-right px-4 py-2 text-muted-foreground">{fmt$(h.currentValue)}</td>
                            <td className={`text-right px-2 py-2 font-medium ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {fmtPct(pnlPct)}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* Drift bar visualization */}
            <Card className="bg-muted/50 border-border mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Drift Magnitude by Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {drifts.sort((a, b) => b.driftAbs - a.driftAbs).map(h => (
                    <div key={h.ticker} className="flex items-center gap-3">
                      <span className="text-muted-foreground text-xs w-12 text-right">{h.ticker}</span>
                      <div className="flex-1 h-4 bg-muted/50 rounded-full overflow-hidden relative">
                        <div
                          className={`absolute top-0 h-full rounded-full transition-all duration-300 ${
                            h.drift > 0 ? "right-1/2" : "left-1/2"
                          } ${h.driftAbs >= driftThreshold ? "bg-red-500/70" : h.driftAbs >= driftThreshold * 0.5 ? "bg-amber-500/70" : "bg-emerald-500/70"}`}
                          style={{ width: `${Math.min((h.driftAbs / 8) * 50, 50)}%` }}
                        />
                        <div className="absolute inset-y-0 left-1/2 w-px bg-muted-foreground" />
                      </div>
                      <span className={`text-xs w-12 font-mono ${driftColor(h.drift, driftThreshold)}`}>
                        {fmtPct(h.drift)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-muted-foreground text-xs mt-2 px-15">
                  <span>Under-weight</span><span>Over-weight</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 2: Rebalancing Engine ─────────────────────────────────────── */}
          <TabsContent value="engine" className="data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Config panel */}
              <div className="space-y-4">
                <Card className="bg-muted/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Rebalancing Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      {(["threshold", "calendar"] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setCalendarMode(m)}
                          className={`flex-1 py-2 rounded text-xs font-medium capitalize transition-all ${
                            calendarMode === m
                              ? "bg-primary text-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    {calendarMode === "threshold" ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Drift Threshold</span>
                          <span className="text-primary font-medium">{driftThreshold}%</span>
                        </div>
                        <Slider
                          value={[driftThreshold]}
                          onValueChange={([v]) => setDriftThreshold(v)}
                          min={1} max={15} step={0.5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-muted-foreground text-xs">
                          <span>1% (frequent)</span><span>15% (rare)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Frequency</span>
                          <span className="text-foreground">Quarterly</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next rebalance</span>
                          <span className="text-foreground">Jul 1, 2026</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last rebalanced</span>
                          <span className="text-foreground">Apr 1, 2026</span>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Marginal Tax Rate</span>
                        <span className="text-amber-400 font-medium">{taxRate}%</span>
                      </div>
                      <Slider
                        value={[taxRate]}
                        onValueChange={([v]) => setTaxRate(v)}
                        min={0} max={37} step={1}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Cost Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {[
                      { label: "Trades to Execute",    value: String(trades.length),   color: "text-foreground" },
                      { label: "Total Trade Volume",    value: fmt$(trades.reduce((a,t) => a+t.amount, 0)), color: "text-foreground" },
                      { label: "Transaction Costs",     value: fmt$(totalTxCost, 2),    color: "text-amber-400" },
                      { label: "Est. Tax Impact",       value: fmt$(taxImpact),         color: "text-red-400" },
                      { label: "Net Rebalance Cost",    value: fmt$(totalTxCost + taxImpact), color: "text-foreground" },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className={`font-medium ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Button
                  className="w-full bg-primary hover:bg-primary text-foreground"
                  onClick={handleRebalance}
                  disabled={rebalancing || trades.length === 0}
                >
                  <AnimatePresence mode="wait">
                    {rebalancing ? (
                      <motion.span
                        key="spin"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </motion.div>
                        Executing {trades.length} trades…
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Rebalance Now ({trades.length} trades)
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>

              {/* Trades table */}
              <Card className="bg-muted/50 border-border lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-primary" />
                    Trades Required ({trades.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {trades.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500/50" />
                      <p className="text-sm">All positions within {driftThreshold}% threshold</p>
                      <p className="text-xs mt-1">Lower the threshold to see more trades</p>
                    </div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-muted-foreground px-4 py-2">Ticker</th>
                          <th className="text-center text-muted-foreground px-2 py-2">Action</th>
                          <th className="text-right text-muted-foreground px-2 py-2">Amount</th>
                          <th className="text-right text-muted-foreground px-2 py-2">Drift</th>
                          <th className="text-right text-muted-foreground px-2 py-2">Txn Cost</th>
                          <th className="text-right text-muted-foreground px-4 py-2">Tax</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trades.map((t, i) => {
                          const txCost = t.amount * 0.0005;
                          const taxCost = t.action === "Sell" && t.gainLoss > 0
                            ? t.gainLoss * (taxRate / 100)
                            : 0;
                          return (
                            <motion.tr
                              key={t.ticker}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                            >
                              <td className="px-4 py-2 font-semibold text-foreground">{t.ticker}</td>
                              <td className="px-2 py-2 text-center">
                                <Badge className={`text-xs ${t.action === "Buy" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                                  {t.action}
                                </Badge>
                              </td>
                              <td className="text-right px-2 py-2 text-foreground font-mono">{fmt$(t.amount)}</td>
                              <td className={`text-right px-2 py-2 ${driftColor(t.drift, driftThreshold)}`}>
                                {fmtPct(t.drift)}
                              </td>
                              <td className="text-right px-2 py-2 text-amber-400">{fmt$(txCost, 2)}</td>
                              <td className="text-right px-4 py-2 text-red-400">{taxCost > 0 ? fmt$(taxCost) : "—"}</td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab 3: Tax-Loss Harvesting ────────────────────────────────────── */}
          <TabsContent value="harvest" className="data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary + controls */}
              <div className="space-y-4">
                <Card className="bg-muted/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Harvest Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Loss Candidates</span>
                      <span className="text-foreground">{lossPositions.length} positions</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Total Harvestable Loss</span>
                      <span className="text-red-400">{fmt$(lossPositions.reduce((a, p) => a + Math.abs(p.unrealizedLoss), 0))}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Max Tax Savings (all)</span>
                      <span className="text-emerald-400">{fmt$(lossPositions.reduce((a, p) => a + p.taxSavings, 0))}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Selected Savings</span>
                      <span className="text-emerald-400 font-medium">{fmt$(totalHarvestSavings)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Wash Sale Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-2">
                    <p>You cannot repurchase a substantially identical security within <span className="text-amber-400 font-medium">30 days</span> before or after the sale.</p>
                    <p>Substitute securities in the same sector but with different underlying indices avoid the wash sale rule.</p>
                    <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-300">
                      <Info className="w-3 h-3 inline mr-1" />
                      Always consult a tax professional before harvesting losses.
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Positions table */}
              <Card className="bg-muted/50 border-border lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Loss Positions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-muted-foreground px-4 py-2 w-8"></th>
                        <th className="text-left text-muted-foreground px-2 py-2">Ticker</th>
                        <th className="text-right text-muted-foreground px-2 py-2">Unreal. Loss</th>
                        <th className="text-right text-muted-foreground px-2 py-2">Loss %</th>
                        <th className="text-center text-muted-foreground px-2 py-2">Wash Sale</th>
                        <th className="text-right text-muted-foreground px-4 py-2">Tax Saving</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lossPositions.map((p, i) => (
                        <motion.tr
                          key={p.ticker}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`border-b border-border/50 cursor-pointer transition-colors ${
                            selectedHarvest.has(p.ticker) ? "bg-primary/10" : "hover:bg-muted/20"
                          }`}
                          onClick={() => toggleHarvest(p.ticker)}
                        >
                          <td className="px-4 py-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              selectedHarvest.has(p.ticker) ? "bg-primary border-primary" : "border-border"
                            }`}>
                              {selectedHarvest.has(p.ticker) && <CheckCircle2 className="w-3 h-3 text-foreground" />}
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div className="font-semibold text-foreground">{p.ticker}</div>
                            <div className="text-muted-foreground">{p.taxLot === "long" ? "Long-term" : "Short-term"}</div>
                          </td>
                          <td className="text-right px-2 py-2 text-red-400 font-mono">{fmt$(p.unrealizedLoss)}</td>
                          <td className="text-right px-2 py-2 text-red-400">{p.lossPercent.toFixed(1)}%</td>
                          <td className="px-2 py-2 text-center">
                            <div className="flex items-center justify-center gap-1 text-amber-400">
                              <Clock className="w-3 h-3" />
                              <span>{p.washSaleDays}d</span>
                            </div>
                            {SUBSTITUTE_SECURITIES[p.ticker] && (
                              <div className="text-muted-foreground mt-0.5">
                                Sub: {SUBSTITUTE_SECURITIES[p.ticker].join(" / ")}
                              </div>
                            )}
                          </td>
                          <td className="text-right px-4 py-2 text-emerald-400 font-mono">{fmt$(p.taxSavings)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Substitute securities detail */}
              <Card className="bg-muted/50 border-border lg:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Substitute Security Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(SUBSTITUTE_SECURITIES).map(([ticker, subs]) => (
                      <div key={ticker} className="bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="text-foreground font-semibold text-sm mb-1">{ticker}</div>
                        <div className="text-muted-foreground text-xs mb-2">Sell to harvest loss, then buy:</div>
                        <div className="flex gap-1 flex-wrap">
                          {subs.map(s => (
                            <Badge key={s} variant="outline" className="text-primary border-primary/40 text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab 4: Asset Location ──────────────────────────────────────────── */}
          <TabsContent value="location" className="data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score + account selector */}
              <div className="space-y-4">
                <Card className="bg-muted/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      Location Optimization Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center my-4">
                      <svg width={120} height={70} viewBox="0 0 120 70">
                        {/* Semi-circle gauge */}
                        <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#1e293b" strokeWidth={10} strokeLinecap="round" />
                        <path
                          d="M 10 60 A 50 50 0 0 1 110 60"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth={10}
                          strokeLinecap="round"
                          strokeDasharray={`${(locationScore / 100) * 157} 157`}
                        />
                        <text x={60} y={55} textAnchor="middle" fill="#10b981" fontSize={20} fontWeight="bold">{locationScore}</text>
                        <text x={60} y={68} textAnchor="middle" fill="#64748b" fontSize={9}>out of 100</text>
                      </svg>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Rating</span>
                        <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Good</Badge>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Potential Savings/yr</span>
                        <span className="text-emerald-400">~{fmt$(1840)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Improvements Available</span>
                        <span className="text-amber-400">2 moves</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Account Sizes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {[
                      { label: "Taxable",         pct: 55, color: "bg-primary" },
                      { label: "Traditional IRA",  pct: 30, color: "bg-amber-500" },
                      { label: "Roth IRA",         pct: 15, color: "bg-emerald-500" },
                    ].map(acc => (
                      <div key={acc.label}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-muted-foreground">{acc.label}</span>
                          <span className="text-muted-foreground">{acc.pct}%</span>
                        </div>
                        <Progress value={acc.pct} className="h-1.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Key Principles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { icon: "🏦", text: "Place highest-growth assets in Roth — tax-free compounding" },
                      { icon: "📊", text: "Bond income in tax-deferred accounts — defer ordinary income" },
                      { icon: "🌍", text: "Intl equity in taxable — claim foreign tax credit" },
                      { icon: "🏠", text: "REITs in Traditional IRA — shelter high ordinary distributions" },
                    ].map((p, i) => (
                      <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                        <span>{p.icon}</span>
                        <span>{p.text}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Rules table + matrix */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-muted/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Asset Location Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-muted-foreground px-4 py-2">Asset Class</th>
                          <th className="text-center text-muted-foreground px-2 py-2">Ideal Account</th>
                          <th className="text-left text-muted-foreground px-2 py-2">Reason</th>
                          <th className="text-right text-muted-foreground px-4 py-2">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ASSET_LOCATION_RULES.map((rule, i) => (
                          <motion.tr
                            key={rule.assetClass}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-4 py-2 text-foreground font-medium">{rule.assetClass}</td>
                            <td className="px-2 py-2 text-center">
                              <Badge className={`text-xs ${
                                rule.ideal === "roth"       ? "bg-emerald-500/20 text-emerald-300" :
                                rule.ideal === "traditional" ? "bg-amber-500/20 text-amber-300" :
                                                              "bg-primary/20 text-primary"
                              }`}>
                                {rule.ideal === "traditional" ? "Trad. IRA" : rule.ideal === "roth" ? "Roth IRA" : "Taxable"}
                              </Badge>
                            </td>
                            <td className="px-2 py-2 text-muted-foreground leading-tight">{rule.reason}</td>
                            <td className="px-4 py-2 text-right">
                              <span className={`font-medium ${rule.score >= 85 ? "text-emerald-400" : rule.score >= 70 ? "text-amber-400" : "text-red-400"}`}>
                                {rule.score}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Suitability Matrix (0–100 score per account)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AllocationMatrix entries={locationEntries} />
                    <div className="flex gap-4 mt-3 text-xs">
                      {[["#10b981","80–100 Excellent"],["#f59e0b","50–79 Adequate"],["#ef4444","0–49 Poor"]].map(([c,l]) => (
                        <div key={l} className="flex items-center gap-1 text-muted-foreground">
                          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: c as string }} />
                          {l}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab 5: Drift Analysis ──────────────────────────────────────────── */}
          <TabsContent value="drift" className="data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats */}
              <div className="space-y-4">
                <Card className="bg-muted/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      12-Month Drift Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "Rebalancing Events",   value: "2",              sub: "Sep 2025, Jan 2026" },
                      { label: "Avg Equity Drift",     value: fmtPct(DRIFT_HISTORY.reduce((a, d) => a + d.equityDrift, 0) / DRIFT_HISTORY.length), sub: "Mean deviation" },
                      { label: "Peak Drift Reached",   value: fmtPct(Math.max(...DRIFT_HISTORY.map(d => Math.abs(d.equityDrift)))), sub: "Equity allocation" },
                      { label: "Volatility Drag Est.", value: `${volDrag}%`,    sub: "Annualized drag from drift" },
                    ].map((s, i) => (
                      <div key={i} className="border-b border-border/50 pb-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{s.label}</span>
                          <span className="text-foreground font-medium">{s.value}</span>
                        </div>
                        <div className="text-muted-foreground text-xs mt-0.5">{s.sub}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Drift by Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      {DRIFT_HISTORY.map(d => (
                        <div key={d.month} className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground w-8">{d.month}</span>
                          <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden relative">
                            <div
                              className={`absolute top-0 h-full rounded-full ${Math.abs(d.equityDrift) >= driftThreshold ? "bg-red-500/60" : "bg-primary/60"}`}
                              style={{ width: `${Math.min((Math.abs(d.equityDrift) / 8) * 100, 100)}%`, left: d.equityDrift < 0 ? "auto" : 0, right: d.equityDrift < 0 ? 0 : "auto" }}
                            />
                          </div>
                          <span className={`w-10 text-right font-mono ${d.equityDrift >= 0 ? "text-primary" : "text-red-400"}`}>
                            {fmtPct(d.equityDrift)}
                          </span>
                          {d.rebalancedAt && <Badge className="bg-indigo-500/20 text-indigo-300 text-xs px-1 py-0">RB</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Line chart */}
              <Card className="bg-muted/50 border-border lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Historical Drift — 12 Months</CardTitle>
                </CardHeader>
                <CardContent>
                  <DriftLineChart data={DRIFT_HISTORY} />
                  <div className="flex gap-4 mt-3 text-xs">
                    {[
                      { color: "#3b82f6", label: "Equity Drift" },
                      { color: "#10b981", label: "Bond Drift" },
                      { color: "#f59e0b", label: "Alt Drift" },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: l.color }} />
                        {l.label}
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                      <span className="w-3 h-0.5 inline-block rounded bg-indigo-400" style={{ backgroundImage: "repeating-linear-gradient(90deg,#818cf8 0,#818cf8 3px,transparent 3px,transparent 6px)" }} />
                      Rebalance Event
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {[
                      { title: "Threshold Sensitivity", body: "At a 5% threshold, 2 rebalances were triggered over 12 months, consistent with academic consensus of 1–4 events per year for a balanced portfolio." },
                      { title: "Volatility Drag",       body: `Estimated annualized drag of ${volDrag}% from mean portfolio drift. Frequent rebalancing reduces drag but increases transaction costs.` },
                      { title: "Optimal Frequency",     body: "Research suggests threshold-based rebalancing (5% bands) outperforms fixed-calendar rebalancing after transaction costs on a risk-adjusted basis." },
                    ].map((card, i) => (
                      <div key={i} className="bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="text-foreground text-xs font-semibold mb-1">{card.title}</div>
                        <div className="text-muted-foreground text-xs leading-relaxed">{card.body}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
