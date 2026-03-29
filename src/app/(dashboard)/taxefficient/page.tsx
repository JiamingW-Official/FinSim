"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  MapPin,
  Scissors,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  DollarSign,
  Clock,
  ArrowRight,
  BarChart3,
  Shield,
  Gift,
  Calculator,
  Layers,
  Activity,
  ChevronRight,
  Landmark,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── PRNG seed 885 ────────────────────────────────────────────────────────────

let s = 885;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate random values
const RAND_VALS = Array.from({ length: 60 }, () => rand());

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDollar(n: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return fmtDollar(n);
}

function fmtPct(n: number, d = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;
}

// ── Tab 1: Asset Location ─────────────────────────────────────────────────────

interface AssetClass {
  name: string;
  taxEfficiencyScore: number; // 0–100, higher = more tax-efficient
  idealBucket: "taxable" | "traditional" | "roth";
  color: string;
  reason: string;
  annualReturn: number; // pre-tax %
  taxDrag: number;      // % annual drag if in wrong bucket
}

const ASSET_CLASSES: AssetClass[] = [
  {
    name: "Municipal Bonds",
    taxEfficiencyScore: 98,
    idealBucket: "taxable",
    color: "#22c55e",
    reason: "Tax-exempt interest — best in taxable where the benefit is realized",
    annualReturn: 3.5,
    taxDrag: 1.2,
  },
  {
    name: "Index ETFs",
    taxEfficiencyScore: 92,
    idealBucket: "taxable",
    color: "#84cc16",
    reason: "Low turnover, qualified dividends, minimal capital gain distributions",
    annualReturn: 8.0,
    taxDrag: 0.4,
  },
  {
    name: "Growth Stocks",
    taxEfficiencyScore: 78,
    idealBucket: "taxable",
    color: "#eab308",
    reason: "Long-term capital gains rates apply; low dividend yield minimizes drag",
    annualReturn: 9.5,
    taxDrag: 0.8,
  },
  {
    name: "REITs",
    taxEfficiencyScore: 42,
    idealBucket: "traditional",
    color: "#f97316",
    reason: "Dividends taxed as ordinary income — shelter in tax-deferred account",
    annualReturn: 7.5,
    taxDrag: 2.8,
  },
  {
    name: "Corporate Bonds",
    taxEfficiencyScore: 35,
    idealBucket: "traditional",
    color: "#ef4444",
    reason: "Interest taxed as ordinary income — defer in traditional IRA",
    annualReturn: 5.0,
    taxDrag: 2.1,
  },
  {
    name: "Actively Managed",
    taxEfficiencyScore: 22,
    idealBucket: "roth",
    color: "#dc2626",
    reason: "High turnover, short-term gains — put in Roth for tax-free growth",
    annualReturn: 8.5,
    taxDrag: 3.5,
  },
];

function AssetLocationTab() {
  const [portfolioValue, setPortfolioValue] = useState(250000);
  const [marginalRate, setMarginalRate] = useState(24);
  const [selectedAsset, setSelectedAsset] = useState<AssetClass | null>(null);

  const totalDragSaved = useMemo(() => {
    // Savings from optimal vs suboptimal placement
    return ASSET_CLASSES.reduce((acc, a) => acc + (portfolioValue / ASSET_CLASSES.length) * (a.taxDrag / 100), 0);
  }, [portfolioValue]);

  const afterTaxOptimal = useMemo(() => {
    const allocation = portfolioValue / ASSET_CLASSES.length;
    return ASSET_CLASSES.reduce((acc, a) => {
      const drag = a.idealBucket === "taxable" ? a.taxDrag / 100 : 0;
      return acc + allocation * (a.annualReturn / 100 - drag);
    }, 0);
  }, [portfolioValue]);

  const afterTaxSuboptimal = useMemo(() => {
    const allocation = portfolioValue / ASSET_CLASSES.length;
    return ASSET_CLASSES.reduce((acc, a) => {
      return acc + allocation * ((a.annualReturn / 100) - (a.taxDrag / 100));
    }, 0);
  }, [portfolioValue]);

  const annualAlphaDollar = afterTaxOptimal - afterTaxSuboptimal;

  // 20-year compounded benefit
  const compoundedBenefit = useMemo(() => {
    let opt = portfolioValue;
    let sub = portfolioValue;
    for (let y = 0; y < 20; y++) {
      opt *= 1 + afterTaxOptimal / portfolioValue;
      sub *= 1 + afterTaxSuboptimal / portfolioValue;
    }
    return opt - sub;
  }, [portfolioValue, afterTaxOptimal, afterTaxSuboptimal]);

  const svgW = 480;
  const svgH = 160;
  const barW = svgW / ASSET_CLASSES.length - 8;

  const BUCKET_COLORS: Record<string, string> = {
    taxable: "#22c55e",
    traditional: "#3b82f6",
    roth: "#a855f7",
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Portfolio Value</span>
              <span className="font-semibold">{fmtK(portfolioValue)}</span>
            </div>
            <Slider min={50000} max={2000000} step={10000} value={[portfolioValue]} onValueChange={([v]) => setPortfolioValue(v)} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Marginal Tax Rate</span>
              <span className="font-semibold">{marginalRate}%</span>
            </div>
            <Slider min={10} max={37} step={1} value={[marginalRate]} onValueChange={([v]) => setMarginalRate(v)} />
          </CardContent>
        </Card>
      </div>

      {/* Impact summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Annual Tax Alpha</p>
            <p className="text-xl font-semibold text-green-400">{fmtK(annualAlphaDollar)}</p>
            <p className="text-xs text-muted-foreground mt-1">saved per year</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-muted/5">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">20-Yr Compounded Benefit</p>
            <p className="text-xl font-semibold text-primary">{fmtK(compoundedBenefit)}</p>
            <p className="text-xs text-muted-foreground mt-1">optimal placement</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Annual Drag (Suboptimal)</p>
            <p className="text-xl font-medium text-orange-400">{fmtK(totalDragSaved)}</p>
            <p className="text-xs text-muted-foreground mt-1">lost annually</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax efficiency score SVG bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/50" />
            Tax Efficiency Score by Asset Class
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${svgW} ${svgH + 30}`} className="w-full">
            {/* Gridlines */}
            {[0, 25, 50, 75, 100].map((pct) => {
              const y = svgH - (pct / 100) * svgH;
              return (
                <g key={pct}>
                  <line x1={0} y1={y} x2={svgW} y2={y} stroke="#334155" strokeWidth={0.5} strokeDasharray="3,3" />
                  <text x={2} y={y - 2} fontSize={8} fill="#64748b">{pct}</text>
                </g>
              );
            })}
            {ASSET_CLASSES.map((a, i) => {
              const x = i * (svgW / ASSET_CLASSES.length) + 4;
              const barH = (a.taxEfficiencyScore / 100) * svgH;
              const y = svgH - barH;
              const isSelected = selectedAsset?.name === a.name;
              return (
                <g key={a.name} style={{ cursor: "pointer" }} onClick={() => setSelectedAsset(isSelected ? null : a)}>
                  <rect
                    x={x} y={y} width={barW} height={barH}
                    fill={a.color}
                    opacity={isSelected ? 1 : 0.75}
                    rx={3}
                  />
                  {isSelected && (
                    <rect x={x - 1} y={y - 1} width={barW + 2} height={barH + 2} fill="none" stroke="white" strokeWidth={1.5} rx={3} />
                  )}
                  <rect x={x} y={svgH} width={barW} height={4} fill={BUCKET_COLORS[a.idealBucket]} rx={1} />
                  <text
                    x={x + barW / 2} y={svgH + 18}
                    fontSize={7} fill="#94a3b8" textAnchor="middle"
                    style={{ fontSize: "6px" }}
                  >
                    {a.name.split(" ")[0]}
                  </text>
                  <text x={x + barW / 2} y={y - 3} fontSize={8} fill="#e2e8f0" textAnchor="middle">{a.taxEfficiencyScore}</text>
                </g>
              );
            })}
          </svg>
          {/* Legend */}
          <div className="flex gap-4 mt-2 flex-wrap">
            {Object.entries(BUCKET_COLORS).map(([bucket, color]) => (
              <div key={bucket} className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: color }} />
                <span className="capitalize">{bucket === "traditional" ? "Traditional IRA" : bucket === "roth" ? "Roth IRA" : "Taxable"}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected asset detail */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card className="border-primary/30">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{selectedAsset.name}</span>
                  <Badge style={{ backgroundColor: BUCKET_COLORS[selectedAsset.idealBucket] + "33", color: BUCKET_COLORS[selectedAsset.idealBucket] }}>
                    Best in {selectedAsset.idealBucket === "traditional" ? "Traditional IRA" : selectedAsset.idealBucket === "roth" ? "Roth IRA" : "Taxable"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedAsset.reason}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Efficiency Score</p>
                    <p className="text-base font-medium" style={{ color: selectedAsset.color }}>{selectedAsset.taxEfficiencyScore}/100</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Annual Return</p>
                    <p className="text-base font-medium text-green-400">{selectedAsset.annualReturn}%</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Tax Drag (wrong bucket)</p>
                    <p className="text-base font-medium text-red-400">{selectedAsset.taxDrag}%/yr</p>
                  </div>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 text-sm">
                  <p className="text-muted-foreground">Annual drag on {fmtK(portfolioValue / ASSET_CLASSES.length)} allocation:</p>
                  <p className="font-medium text-red-400">
                    {fmtDollar((portfolioValue / ASSET_CLASSES.length) * selectedAsset.taxDrag / 100)} lost per year in wrong account
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-bucket framework */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-muted-foreground/50" />
            3-Bucket Asset Location Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Taxable Brokerage",
                color: "#22c55e",
                items: ["Municipal Bonds", "Index ETFs / ETFs", "Growth Stocks", "Tax-managed funds"],
                note: "Use tax-loss harvesting; hold >1yr for LTCG rates",
              },
              {
                label: "Traditional IRA / 401(k)",
                color: "#3b82f6",
                items: ["REITs", "Corporate Bonds", "High-yield bonds", "Actively managed funds"],
                note: "Contributions pre-tax; distributions taxed as ordinary income",
              },
              {
                label: "Roth IRA / Roth 401(k)",
                color: "#a855f7",
                items: ["Highest-growth assets", "Actively managed", "Small-cap/emerging", "Options strategies"],
                note: "Tax-free growth; ideal for highest expected return assets",
              },
            ].map((bucket) => (
              <div key={bucket.label} className="rounded-lg p-3 space-y-2" style={{ backgroundColor: bucket.color + "10", border: `1px solid ${bucket.color}30` }}>
                <p className="text-sm font-medium" style={{ color: bucket.color }}>{bucket.label}</p>
                <ul className="space-y-1">
                  {bucket.items.map((item) => (
                    <li key={item} className="text-xs text-muted-foreground flex items-start gap-1">
                      <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" style={{ color: bucket.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground/70 italic border-t border-border/20 pt-2">{bucket.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 2: Tax-Loss Harvesting ────────────────────────────────────────────────

interface TLHPosition {
  ticker: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  holdingDays: number;
  washSaleRisk: boolean;
  washSaleAlternative: string;
}

const TLH_POSITIONS: TLHPosition[] = [
  {
    ticker: "INTC",
    shares: 120,
    costBasis: 42.5,
    currentPrice: 21.8,
    holdingDays: 95,
    washSaleRisk: false,
    washSaleAlternative: "SOXX",
  },
  {
    ticker: "PYPL",
    shares: 80,
    costBasis: 115.0,
    currentPrice: 63.2,
    holdingDays: 210,
    washSaleRisk: false,
    washSaleAlternative: "SQ",
  },
  {
    ticker: "DIS",
    shares: 55,
    costBasis: 178.5,
    currentPrice: 113.4,
    holdingDays: 18,
    washSaleRisk: true,
    washSaleAlternative: "PARA",
  },
  {
    ticker: "NIO",
    shares: 200,
    costBasis: 18.2,
    currentPrice: 5.6,
    holdingDays: 340,
    washSaleRisk: false,
    washSaleAlternative: "LI",
  },
  {
    ticker: "BABA",
    shares: 45,
    costBasis: 195.0,
    currentPrice: 78.3,
    holdingDays: 28,
    washSaleRisk: true,
    washSaleAlternative: "KWEB",
  },
];

// Annual TLH values (cumulative compounded) with PRNG
const TLH_ANNUAL_DATA = Array.from({ length: 10 }, (_, i) => {
  const base = 8000 + RAND_VALS[i] * 4000;
  const compound = base * Math.pow(1.072, i);
  return { year: 2015 + i, harvested: base + i * 1200, compoundBenefit: compound };
});

function TaxLossHarvestingTab() {
  const [marginalRate, setMarginalRate] = useState(32);
  const [selectedPos, setSelectedPos] = useState<TLHPosition | null>(null);

  const positions = TLH_POSITIONS.map((p) => ({
    ...p,
    unrealizedLoss: (p.currentPrice - p.costBasis) * p.shares,
    pctChange: ((p.currentPrice - p.costBasis) / p.costBasis) * 100,
    isLongTerm: p.holdingDays >= 365,
  }));

  const totalHarvestable = positions.reduce((acc, p) => acc + Math.abs(p.unrealizedLoss), 0);
  const totalSavings = totalHarvestable * (marginalRate / 100);
  const eligibleCount = positions.filter((p) => !p.washSaleRisk).length;

  // SVG wash sale visualizer
  const washSaleW = 480;
  const washSaleH = 80;
  const sellDay = 30;
  const buyBackDay = 62;

  // Annual TLH chart
  const chartW = 480;
  const chartH = 140;
  const maxVal = Math.max(...TLH_ANNUAL_DATA.map((d) => d.compoundBenefit));

  return (
    <div className="space-y-5">
      {/* Controls */}
      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Your Marginal Tax Rate</span>
            <span className="font-medium">{marginalRate}%</span>
          </div>
          <Slider min={10} max={37} step={1} value={[marginalRate]} onValueChange={([v]) => setMarginalRate(v)} />
        </CardContent>
      </Card>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Total Harvestable Loss</p>
            <p className="text-xl font-medium text-red-400">{fmtK(totalHarvestable)}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Tax Savings @ {marginalRate}%</p>
            <p className="text-xl font-medium text-green-400">{fmtK(totalSavings)}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-muted/5">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Eligible Positions</p>
            <p className="text-xl font-medium text-primary">{eligibleCount} / {positions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Position scanner */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Scissors className="h-3.5 w-3.5 text-muted-foreground/50" />
            TLH Opportunity Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {positions.map((p) => {
            const taxSavings = Math.abs(p.unrealizedLoss) * (marginalRate / 100);
            const isSelected = selectedPos?.ticker === p.ticker;
            return (
              <motion.div
                key={p.ticker}
                onClick={() => setSelectedPos(isSelected ? null : p)}
                className={cn(
                  "rounded-lg p-3 cursor-pointer transition-colors border",
                  isSelected ? "border-primary bg-muted/5" : "border-border bg-muted/20 hover:bg-muted/30",
                  p.washSaleRisk && "opacity-75"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-sm">{p.ticker}</span>
                    {p.washSaleRisk && (
                      <Badge variant="destructive" className="text-xs text-muted-foreground">Wash Sale Risk</Badge>
                    )}
                    {!p.washSaleRisk && (
                      <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">Eligible</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{p.holdingDays}d | {p.isLongTerm ? "LT" : "ST"}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-400">{fmtK(p.unrealizedLoss)}</p>
                    <p className="text-xs text-muted-foreground">saves {fmtK(taxSavings)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{p.shares} shares @ {fmtDollar(p.costBasis, 2)} → {fmtDollar(p.currentPrice, 2)}</span>
                  <span className="text-red-400">{fmtPct(p.pctChange)}</span>
                  {!p.washSaleRisk && (
                    <span className="text-primary">Alt: {p.washSaleAlternative}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Wash Sale Rule Visualizer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            30-Day Wash Sale Rule Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${washSaleW} ${washSaleH + 20}`} className="w-full">
            {/* Timeline bar */}
            <rect x={40} y={35} width={washSaleW - 80} height={4} fill="#334155" rx={2} />
            {/* Danger zone — 30 days before sell */}
            <rect x={40} y={20} width={((sellDay) / 90) * (washSaleW - 80) - 0} height={22} fill="#ef444415" rx={2} />
            <text x={40 + ((sellDay / 2) / 90) * (washSaleW - 80)} y={16} fontSize={8} fill="#ef4444" textAnchor="middle">30d before</text>
            {/* Danger zone — 30 days after sell */}
            <rect
              x={40 + ((sellDay) / 90) * (washSaleW - 80)}
              y={20}
              width={((30) / 90) * (washSaleW - 80)}
              height={22}
              fill="#ef444415"
              rx={2}
            />
            <text
              x={40 + ((sellDay + 15) / 90) * (washSaleW - 80)}
              y={16}
              fontSize={8}
              fill="#ef4444"
              textAnchor="middle"
            >
              30d after (wash sale window)
            </text>
            {/* Safe zone */}
            <rect
              x={40 + ((sellDay + 31) / 90) * (washSaleW - 80)}
              y={20}
              width={((buyBackDay - sellDay - 31) / 90) * (washSaleW - 80)}
              height={22}
              fill="#22c55e15"
              rx={2}
            />
            {/* Sell marker */}
            <line
              x1={40 + (sellDay / 90) * (washSaleW - 80)}
              y1={14}
              x2={40 + (sellDay / 90) * (washSaleW - 80)}
              y2={44}
              stroke="#ef4444"
              strokeWidth={2}
            />
            <text x={40 + (sellDay / 90) * (washSaleW - 80)} y={10} fontSize={8} fill="#ef4444" textAnchor="middle">SELL</text>
            {/* Safe re-buy marker */}
            <line
              x1={40 + (buyBackDay / 90) * (washSaleW - 80)}
              y1={14}
              x2={40 + (buyBackDay / 90) * (washSaleW - 80)}
              y2={44}
              stroke="#22c55e"
              strokeWidth={2}
            />
            <text x={40 + (buyBackDay / 90) * (washSaleW - 80)} y={10} fontSize={8} fill="#22c55e" textAnchor="middle">Safe Re-Buy</text>
            {/* Day labels */}
            {[0, 15, 30, 45, 60, 75, 90].map((d) => (
              <text key={d} x={40 + (d / 90) * (washSaleW - 80)} y={washSaleH + 14} fontSize={7} fill="#64748b" textAnchor="middle">
                Day {d}
              </text>
            ))}
          </svg>
          <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            IRS Wash Sale Rule: If you sell at a loss and repurchase the same or substantially identical security within 30 days before or after, the loss is disallowed. Use similar (not identical) ETFs as alternatives.
          </div>
        </CardContent>
      </Card>

      {/* Annual TLH compounding chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            Annual Harvesting Value (Compound Benefit)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full">
            {[0, 25, 50, 75, 100].map((pct) => {
              const y = chartH - (pct / 100) * chartH;
              return (
                <g key={pct}>
                  <line x1={40} y1={y} x2={chartW} y2={y} stroke="#1e293b" strokeWidth={0.5} />
                  <text x={36} y={y + 3} fontSize={7} fill="#64748b" textAnchor="end">
                    {fmtK((pct / 100) * maxVal)}
                  </text>
                </g>
              );
            })}
            {TLH_ANNUAL_DATA.map((d, i) => {
              const bw = (chartW - 40) / TLH_ANNUAL_DATA.length - 4;
              const x = 40 + i * ((chartW - 40) / TLH_ANNUAL_DATA.length) + 2;
              const barH = (d.compoundBenefit / maxVal) * chartH;
              const harvH = (d.harvested / maxVal) * chartH;
              return (
                <g key={d.year}>
                  <rect x={x} y={chartH - barH} width={bw} height={barH} fill="#3b82f640" rx={2} />
                  <rect x={x} y={chartH - harvH} width={bw} height={harvH} fill="#22c55e80" rx={2} />
                  <text x={x + bw / 2} y={chartH + 16} fontSize={7} fill="#64748b" textAnchor="middle">{d.year}</text>
                </g>
              );
            })}
            {/* Legend */}
            <rect x={chartW - 120} y={4} width={8} height={8} fill="#22c55e80" rx={1} />
            <text x={chartW - 109} y={11} fontSize={7} fill="#94a3b8">Harvested Loss</text>
            <rect x={chartW - 120} y={16} width={8} height={8} fill="#3b82f640" rx={1} />
            <text x={chartW - 109} y={23} fontSize={7} fill="#94a3b8">Compound Benefit</text>
          </svg>

          {/* Robo vs Manual comparison */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              {
                label: "Robo-Advisor TLH",
                icon: Zap,
                color: "#3b82f6",
                items: ["Daily automated scanning", "Fractional share harvesting", "Immediate rebalancing", "Higher fees (0.25–0.40%)"],
                savings: "~1.2% annual tax alpha",
              },
              {
                label: "Manual TLH",
                icon: Activity,
                color: "#22c55e",
                items: ["Quarterly review cadence", "Lower/zero platform fees", "More control over timing", "Requires active attention"],
                savings: "~0.6–0.9% annual tax alpha",
              },
            ].map((method) => (
              <div key={method.label} className="rounded-lg p-3 space-y-2" style={{ backgroundColor: method.color + "10", border: `1px solid ${method.color}30` }}>
                <div className="flex items-center gap-2">
                  <method.icon className="h-4 w-4" style={{ color: method.color }} />
                  <span className="text-sm font-medium" style={{ color: method.color }}>{method.label}</span>
                </div>
                <ul className="space-y-1">
                  {method.items.map((item) => (
                    <li key={item} className="text-xs text-muted-foreground">{item}</li>
                  ))}
                </ul>
                <div className="text-xs font-medium" style={{ color: method.color }}>{method.savings}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: Roth Conversion ────────────────────────────────────────────────────

const IRMAA_THRESHOLDS = [
  { income: 103000, premium: 174.70, surcharge: 0 },
  { income: 129000, premium: 244.60, surcharge: 69.90 },
  { income: 161000, premium: 349.40, surcharge: 174.70 },
  { income: 193000, premium: 454.20, surcharge: 279.50 },
  { income: 500000, premium: 559.00, surcharge: 384.30 },
];

const CONVERSION_LADDER = [
  { year: 2024, traditional: 420000, converted: 35000, roth: 35000, taxRate: 22 },
  { year: 2025, traditional: 395000, converted: 42000, roth: 82000, taxRate: 22 },
  { year: 2026, traditional: 362000, converted: 50000, roth: 140000, taxRate: 24 },
  { year: 2027, traditional: 320000, converted: 48000, roth: 200000, taxRate: 24 },
  { year: 2028, traditional: 278000, converted: 55000, roth: 275000, taxRate: 22 },
];

function RothConversionTab() {
  const [traditionalBalance, setTraditionalBalance] = useState(420000);
  const [currentIncome, setCurrentIncome] = useState(75000);
  const [conversionAmount, setConversionAmount] = useState(40000);

  const totalIncome = currentIncome + conversionAmount;

  // Determine bracket filled
  const bracketThresholds = [
    { rate: 10, max: 11600 },
    { rate: 12, max: 47150 },
    { rate: 22, max: 100525 },
    { rate: 24, max: 191950 },
    { rate: 32, max: 243725 },
    { rate: 35, max: 609350 },
  ];

  const currentBracket = bracketThresholds.find((b) => currentIncome <= b.max);
  const afterBracket = bracketThresholds.find((b) => totalIncome <= b.max);

  const conversionTax = conversionAmount * ((afterBracket?.rate ?? 35) / 100);
  const irmaa = IRMAA_THRESHOLDS.find((t) => totalIncome <= t.income);

  // Breakeven analysis — years until Roth wins
  const rothBreakevenYrs = useMemo(() => {
    const taxNow = conversionTax;
    const annualSavingsRate = 0.24; // assumed future rate
    const annualReturn = 0.07;
    let roth = conversionAmount - taxNow;
    let trad = conversionAmount;
    let yr = 0;
    while (trad * (1 - annualSavingsRate) > roth && yr < 50) {
      roth *= 1 + annualReturn;
      trad *= 1 + annualReturn;
      yr++;
    }
    return yr;
  }, [conversionAmount, conversionTax]);

  // SVG conversion ladder
  const ladderW = 480;
  const ladderH = 150;
  const maxTrad = Math.max(...CONVERSION_LADDER.map((d) => d.traditional));

  return (
    <div className="space-y-5">
      {/* Interactive conversion calculator */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Other Income</span>
              <span className="font-medium">{fmtK(currentIncome)}</span>
            </div>
            <Slider min={0} max={250000} step={5000} value={[currentIncome]} onValueChange={([v]) => setCurrentIncome(v)} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conversion Amount</span>
              <span className="font-medium">{fmtK(conversionAmount)}</span>
            </div>
            <Slider min={5000} max={200000} step={5000} value={[conversionAmount]} onValueChange={([v]) => setConversionAmount(v)} />
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-border bg-muted/5">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Tax Cost Now</p>
            <p className="text-lg font-medium text-primary">{fmtK(conversionTax)}</p>
          </CardContent>
        </Card>
        <Card className={cn("border-amber-500/30 bg-amber-500/5", afterBracket?.rate !== currentBracket?.rate && "border-red-500/30 bg-red-500/5")}>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Bracket After</p>
            <p className="text-lg font-medium text-amber-400">{afterBracket?.rate ?? 37}%</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Roth Wins In</p>
            <p className="text-lg font-medium text-green-400">{rothBreakevenYrs} yrs</p>
          </CardContent>
        </Card>
        <Card className={cn("border-border bg-muted/5", irmaa ? "" : "border-muted/30")}>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">IRMAA Status</p>
            <p className="text-lg font-medium text-primary">{irmaa ? "Safe" : "Breached"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bracket targeting visual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-3.5 w-3.5 text-muted-foreground/50" />
            Tax Bracket Targeting (Fill to 22%/24%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bracketThresholds.map((b) => {
              const start = bracketThresholds.find((x) => x.rate < b.rate)?.max ?? 0;
              const isCurrentIncome = currentIncome > start && currentIncome <= b.max;
              const isCrossed = totalIncome > b.max;
              const isTarget = totalIncome > start && totalIncome <= b.max;
              const convFills = isTarget;
              const pctFilled = isCurrentIncome
                ? ((currentIncome - start) / (b.max - start)) * 100
                : totalIncome > start ? 100 : 0;

              return (
                <div key={b.rate} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-8 text-right">{b.rate}%</span>
                  <div className="flex-1 bg-muted/30 rounded-full h-4 relative overflow-hidden">
                    {/* Income fill */}
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-colors"
                      style={{
                        width: `${Math.min(pctFilled, 100)}%`,
                        backgroundColor: isCurrentIncome ? "#3b82f6" : isCrossed ? "#64748b" : "transparent",
                      }}
                    />
                    {/* Conversion fill */}
                    {convFills && (
                      <div
                        className="absolute top-0 h-full rounded-full transition-colors"
                        style={{
                          left: `${((currentIncome - start) / (b.max - start)) * 100}%`,
                          width: `${((Math.min(totalIncome, b.max) - Math.max(currentIncome, start)) / (b.max - start)) * 100}%`,
                          backgroundColor: "#a855f7",
                        }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground w-20 text-right">{fmtK(b.max)}</span>
                  {isCurrentIncome && <Badge className="text-xs bg-muted/10 text-primary border-border">Income</Badge>}
                  {convFills && <Badge className="text-xs bg-muted/10 text-primary border-border">Conversion</Badge>}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary" /> Other income</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary" /> Conversion</div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Ladder SVG */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground/50" />
            5-Year Roth Conversion Ladder (Traditional → Roth)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${ladderW} ${ladderH + 40}`} className="w-full">
            {/* Y gridlines */}
            {[0, 25, 50, 75, 100].map((pct) => {
              const y = ladderH - (pct / 100) * ladderH;
              return (
                <g key={pct}>
                  <line x1={50} y1={y} x2={ladderW} y2={y} stroke="#1e293b" strokeWidth={0.5} />
                  <text x={46} y={y + 3} fontSize={7} fill="#64748b" textAnchor="end">
                    {fmtK((pct / 100) * maxTrad)}
                  </text>
                </g>
              );
            })}
            {CONVERSION_LADDER.map((d, i) => {
              const slotW = (ladderW - 50) / CONVERSION_LADDER.length;
              const bw = slotW * 0.35;
              const xTrad = 50 + i * slotW + 4;
              const xRoth = xTrad + bw + 4;
              const tradH = (d.traditional / maxTrad) * ladderH;
              const rothH = (d.roth / maxTrad) * ladderH;
              return (
                <g key={d.year}>
                  {/* Traditional bar */}
                  <rect x={xTrad} y={ladderH - tradH} width={bw} height={tradH} fill="#3b82f680" rx={2} />
                  {/* Roth bar */}
                  <rect x={xRoth} y={ladderH - rothH} width={bw} height={rothH} fill="#a855f780" rx={2} />
                  {/* Conversion arrow */}
                  <text x={xTrad + bw + 2} y={ladderH - tradH / 2} fontSize={8} fill="#22c55e">→</text>
                  <text x={xTrad + bw / 2} y={ladderH + 12} fontSize={8} fill="#94a3b8" textAnchor="middle">{d.year}</text>
                  <text x={xTrad + bw / 2} y={ladderH + 22} fontSize={7} fill="#64748b" textAnchor="middle">{d.taxRate}%</text>
                  {/* Conversion amount label */}
                  <text x={xTrad + bw} y={ladderH - tradH - 4} fontSize={6} fill="#22c55e" textAnchor="middle">
                    {fmtK(d.converted)}
                  </text>
                </g>
              );
            })}
            {/* Legend */}
            <rect x={ladderW - 100} y={6} width={8} height={8} fill="#3b82f680" rx={1} />
            <text x={ladderW - 89} y={13} fontSize={7} fill="#94a3b8">Traditional IRA</text>
            <rect x={ladderW - 100} y={18} width={8} height={8} fill="#a855f780" rx={1} />
            <text x={ladderW - 89} y={25} fontSize={7} fill="#94a3b8">Roth IRA</text>
          </svg>
        </CardContent>
      </Card>

      {/* IRMAA & SECURE Act info */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" />
              IRMAA Medicare Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {IRMAA_THRESHOLDS.slice(0, 4).map((t, i) => (
              <div key={i} className={cn("flex justify-between text-xs py-1 border-b border-border/20 last:border-0", totalIncome > (IRMAA_THRESHOLDS[i - 1]?.income ?? 0) && totalIncome <= t.income && "text-amber-400 font-medium")}>
                <span className="text-muted-foreground">≤ {fmtK(t.income)}</span>
                <span>{fmtDollar(t.premium, 2)}/mo Part B</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-1">2-year lookback — 2024 income affects 2026 premiums</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Landmark className="h-3.5 w-3.5 text-muted-foreground/50" />
              SECURE Act 2.0 Key Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />
              <span>Inherited IRA: non-spouse beneficiaries must empty within 10 years (SECURE 2019)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />
              <span>RMD age raised to 73 (2023), 75 (2033)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />
              <span>Roth 401(k) no longer subject to RMDs starting 2024</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
              <span>10-year rule requires annual distributions if original owner was already taking RMDs</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 4: Capital Gains Management ──────────────────────────────────────────

// Tax alpha SVG data — after-tax return vs pre-tax
const TAX_ALPHA_DATA = Array.from({ length: 15 }, (_, i) => {
  const yr = 2010 + i;
  const preTax = 8 + RAND_VALS[20 + i] * 10 - 5;
  const taxAlpha = 0.8 + RAND_VALS[35 + i] * 1.2;
  return { yr, preTax, afterTax: preTax + taxAlpha, taxAlpha };
});

const GIVING_STRATEGIES = [
  {
    title: "Donor-Advised Fund (DAF)",
    icon: Gift,
    color: "#22c55e",
    description: "Donate appreciated stock → deduct FMV, no capital gains tax, reinvest in DAF",
    example: "Stock bought at $10k, now $50k → $40k gain avoided, full $50k deduction",
    saving: "Up to $40k in LTCG + income tax deduction",
  },
  {
    title: "Appreciated Stock Gift",
    icon: ArrowRight,
    color: "#3b82f6",
    description: "Gift appreciated stock directly to charity; they sell at zero cost basis",
    example: "Avoid paying LTCG on unrealized gains while maximizing charitable impact",
    saving: "LTCG rate × unrealized gain",
  },
  {
    title: "Opportunity Zone Deferral",
    icon: MapPin,
    color: "#a855f7",
    description: "Invest capital gains into Qualified Opportunity Zone fund within 180 days",
    example: "Defer gain recognition to 2026; 10%+ gain held >10 yrs = tax-free appreciation",
    saving: "Defer and potentially exclude QOZ appreciation",
  },
  {
    title: "Installment Sale",
    icon: Clock,
    color: "#f97316",
    description: "Sell business/property over multiple years to spread gains across brackets",
    example: "Receive $500k over 5 years instead of $500k lump sum — stays in 20% LTCG",
    saving: "Avoid NII surtax (3.8%) and bracket creep",
  },
];

function CapitalGainsTab() {
  const [income, setIncome] = useState(120000);
  const [gainAmount, setGainAmount] = useState(50000);
  const [holdingPeriod, setHoldingPeriod] = useState<"short" | "long">("long");

  const stRate = income > 609350 ? 0.37 : income > 243725 ? 0.35 : income > 191950 ? 0.32 : income > 100525 ? 0.24 : income > 47150 ? 0.22 : 0.12;
  const ltRate = income > 518900 ? 0.20 : income > 47025 ? 0.15 : 0.00;
  const niit = income + gainAmount > 200000 ? 0.038 : 0;

  const effectiveRate = holdingPeriod === "short" ? stRate + niit : ltRate + niit;
  const taxDue = gainAmount * effectiveRate;
  const saved = gainAmount * (stRate - ltRate);

  const svgW = 480;
  const svgH = 120;
  const maxVal = Math.max(...TAX_ALPHA_DATA.map((d) => Math.abs(d.preTax)));

  return (
    <div className="space-y-5">
      {/* Rate comparison */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ordinary Income</span>
              <span className="font-medium">{fmtK(income)}</span>
            </div>
            <Slider min={10000} max={600000} step={10000} value={[income]} onValueChange={([v]) => setIncome(v)} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capital Gain Amount</span>
              <span className="font-medium">{fmtK(gainAmount)}</span>
            </div>
            <Slider min={1000} max={500000} step={1000} value={[gainAmount]} onValueChange={([v]) => setGainAmount(v)} />
          </CardContent>
        </Card>
      </div>

      {/* Short vs Long rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-3.5 w-3.5 text-muted-foreground/50" />
            Short vs Long-Term Capital Gains Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            {(["short", "long"] as const).map((hp) => (
              <Button
                key={hp}
                variant={holdingPeriod === hp ? "default" : "outline"}
                size="sm"
                onClick={() => setHoldingPeriod(hp)}
              >
                {hp === "short" ? "Short-Term (<1yr)" : "Long-Term (>1yr)"}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">ST Rate</p>
              <p className="text-xl font-medium text-red-400">{(stRate * 100).toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">ordinary income</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">LT Rate</p>
              <p className="text-xl font-medium text-green-400">{(ltRate * 100).toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">preferential</p>
            </div>
            <div className={cn("rounded-lg p-3 text-center", niit > 0 ? "bg-amber-500/10" : "bg-muted/40")}>
              <p className="text-xs text-muted-foreground">NIIT Surtax</p>
              <p className="text-xl font-medium text-amber-400">{niit > 0 ? "3.8%" : "0%"}</p>
              <p className="text-xs text-muted-foreground">if MAGI &gt;$200k</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Tax Due</p>
              <p className="text-xl font-medium text-foreground">{fmtK(taxDue)}</p>
              <p className="text-xs text-muted-foreground">{(effectiveRate * 100).toFixed(1)}% effective</p>
            </div>
          </div>
          {saved > 0 && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-300">
              <CheckCircle2 className="h-4 w-4 inline mr-1" />
              Holding an additional {holdingPeriod === "short" ? "period to reach 1yr" : "year"} saves {fmtK(saved)} in taxes on this gain.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Alpha SVG chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50" />
            Tax Alpha: After-Tax vs Pre-Tax Return (15 Years)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${svgW} ${svgH + 30}`} className="w-full">
            {[-10, -5, 0, 5, 10, 15].map((val) => {
              const y = svgH / 2 - (val / maxVal) * (svgH / 2);
              return (
                <g key={val}>
                  <line x1={40} y1={y} x2={svgW} y2={y} stroke={val === 0 ? "#475569" : "#1e293b"} strokeWidth={val === 0 ? 1 : 0.5} />
                  <text x={36} y={y + 3} fontSize={7} fill="#64748b" textAnchor="end">{val}%</text>
                </g>
              );
            })}
            {/* Pre-tax line */}
            {TAX_ALPHA_DATA.map((d, i) => {
              if (i === 0) return null;
              const prev = TAX_ALPHA_DATA[i - 1];
              const slotW = (svgW - 40) / TAX_ALPHA_DATA.length;
              const x1 = 40 + (i - 1) * slotW + slotW / 2;
              const x2 = 40 + i * slotW + slotW / 2;
              const y1 = svgH / 2 - (prev.preTax / maxVal) * (svgH / 2);
              const y2 = svgH / 2 - (d.preTax / maxVal) * (svgH / 2);
              const ay1 = svgH / 2 - (prev.afterTax / maxVal) * (svgH / 2);
              const ay2 = svgH / 2 - (d.afterTax / maxVal) * (svgH / 2);
              return (
                <g key={d.yr}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth={1.5} />
                  <line x1={x1} y1={ay1} x2={x2} y2={ay2} stroke="#22c55e" strokeWidth={1.5} />
                </g>
              );
            })}
            {/* Year labels */}
            {TAX_ALPHA_DATA.filter((_, i) => i % 3 === 0).map((d, i) => {
              const slotW = (svgW - 40) / TAX_ALPHA_DATA.length;
              const idx = TAX_ALPHA_DATA.indexOf(d);
              const x = 40 + idx * slotW + slotW / 2;
              return (
                <text key={d.yr} x={x} y={svgH + 14} fontSize={7} fill="#64748b" textAnchor="middle">{d.yr}</text>
              );
            })}
            {/* Legend */}
            <line x1={svgW - 120} y1={10} x2={svgW - 108} y2={10} stroke="#3b82f6" strokeWidth={2} />
            <text x={svgW - 105} y={13} fontSize={7} fill="#94a3b8">Pre-Tax Return</text>
            <line x1={svgW - 120} y1={22} x2={svgW - 108} y2={22} stroke="#22c55e" strokeWidth={2} />
            <text x={svgW - 105} y={25} fontSize={7} fill="#94a3b8">After-Tax Return</text>
          </svg>
          <p className="text-xs text-muted-foreground mt-1">Tax alpha = difference between after-tax and pre-tax return. Consistent TLH + optimal location can add 0.8–1.5% annually.</p>
        </CardContent>
      </Card>

      {/* Charitable & deferral strategies */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Gift className="h-3.5 w-3.5 text-muted-foreground/50" />
            Advanced Capital Gains Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {GIVING_STRATEGIES.map((s) => (
              <div key={s.title} className="rounded-lg p-3 space-y-2" style={{ backgroundColor: s.color + "0d", border: `1px solid ${s.color}25` }}>
                <div className="flex items-center gap-2">
                  <s.icon className="h-4 w-4 shrink-0" style={{ color: s.color }} />
                  <span className="text-sm font-medium" style={{ color: s.color }}>{s.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.description}</p>
                <div className="text-xs bg-muted/30 rounded p-2 text-muted-foreground italic">{s.example}</div>
                <div className="text-xs font-medium" style={{ color: s.color }}>Potential: {s.saving}</div>
              </div>
            ))}
          </div>

          {/* Gain harvesting in low-income years */}
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg space-y-1">
            <p className="text-sm font-medium text-green-400 flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              Gain Harvesting in Low-Income Years (0% LTCG)
            </p>
            <p className="text-xs text-muted-foreground">
              If your taxable income stays below $47,025 (single) or $94,050 (married), you pay <strong className="text-green-400">0% federal tax</strong> on long-term capital gains. Strategically realize gains to reset cost basis — especially valuable in early retirement, sabbatical years, or before Roth conversion income spikes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────

export default function TaxEfficientPage() {
  return (
    <div className="flex flex-col gap-3 p-4 md:p-4 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1 border-l-4 border-l-primary p-6 rounded-lg bg-card/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20">
            <DollarSign className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight">Tax-Efficient Investing</h1>
            <p className="text-sm text-muted-foreground">
              Asset location, tax-loss harvesting, Roth conversions &amp; capital gains management
            </p>
          </div>
          <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
            Tax Alpha
          </Badge>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-l-4 border-l-primary p-6 rounded-lg bg-card/40">
        {[
          { label: "Optimal Location Benefit", value: "0.4–1.5%/yr", icon: MapPin, color: "#22c55e" },
          { label: "TLH Tax Alpha", value: "0.5–1.2%/yr", icon: Scissors, color: "#ef4444" },
          { label: "Roth Conversion Window", value: "Low-income years", icon: RefreshCw, color: "#a855f7" },
          { label: "LTCG vs ST Rate Gap", value: "Up to 17%", icon: TrendingDown, color: "#3b82f6" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/20">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 shrink-0" style={{ color: stat.color }} />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-medium text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="location" className="mt-8 space-y-4">
        <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto">
          <TabsTrigger value="location" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Asset Location</TabsTrigger>
          <TabsTrigger value="tlh" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">TLH</TabsTrigger>
          <TabsTrigger value="roth" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Roth Conversion</TabsTrigger>
          <TabsTrigger value="gains" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Capital Gains</TabsTrigger>
        </TabsList>

        <TabsContent value="location" className="data-[state=inactive]:hidden">
          <AssetLocationTab />
        </TabsContent>
        <TabsContent value="tlh" className="data-[state=inactive]:hidden">
          <TaxLossHarvestingTab />
        </TabsContent>
        <TabsContent value="roth" className="data-[state=inactive]:hidden">
          <RothConversionTab />
        </TabsContent>
        <TabsContent value="gains" className="data-[state=inactive]:hidden">
          <CapitalGainsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
