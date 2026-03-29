"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Calendar,
  BarChart3,
  Info,
  Zap,
  Shield,
  Layers,
  Clock,
  ArrowRight,
  Scissors,
} from "lucide-react";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 804;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Holding {
  ticker: string;
  name: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  holdingDays: number;
  taxLot: string;
  harvestCandidate: boolean;
  replacement: string | null;
}

// ── Static data ───────────────────────────────────────────────────────────────
const HOLDINGS: Holding[] = [
  { ticker: "INTC", name: "Intel Corp",          shares: 120, costBasis: 44.80,  currentPrice: 22.40,  holdingDays: 280, taxLot: "2023-06-15", harvestCandidate: true,  replacement: "SOXX" },
  { ticker: "PYPL", name: "PayPal Holdings",     shares: 80,  costBasis: 115.00, currentPrice: 61.20,  holdingDays: 195, taxLot: "2023-09-08", harvestCandidate: true,  replacement: "SQ" },
  { ticker: "DIS",  name: "Walt Disney Co",      shares: 60,  costBasis: 178.50, currentPrice: 112.30, holdingDays: 420, taxLot: "2022-12-20", harvestCandidate: true,  replacement: "PARA" },
  { ticker: "PFE",  name: "Pfizer Inc",          shares: 200, costBasis: 38.50,  currentPrice: 27.80,  holdingDays: 310, taxLot: "2023-04-10", harvestCandidate: true,  replacement: "XBI" },
  { ticker: "VZ",   name: "Verizon Communications", shares: 150, costBasis: 41.20, currentPrice: 36.50, holdingDays: 88, taxLot: "2024-01-03", harvestCandidate: false, replacement: "T" },
  { ticker: "AAPL", name: "Apple Inc",           shares: 50,  costBasis: 148.00, currentPrice: 189.50, holdingDays: 540, taxLot: "2022-08-22", harvestCandidate: false, replacement: null },
  { ticker: "NVDA", name: "NVIDIA Corp",         shares: 30,  costBasis: 225.00, currentPrice: 493.80, holdingDays: 365, taxLot: "2023-01-15", harvestCandidate: false, replacement: null },
  { ticker: "MSFT", name: "Microsoft Corp",      shares: 40,  costBasis: 310.00, currentPrice: 415.20, holdingDays: 460, taxLot: "2022-10-05", harvestCandidate: false, replacement: null },
  { ticker: "AMZN", name: "Amazon.com Inc",      shares: 25,  costBasis: 102.00, currentPrice: 183.60, holdingDays: 320, taxLot: "2023-03-18", harvestCandidate: false, replacement: null },
  { ticker: "BRK.B",name: "Berkshire Hathaway B",shares: 35,  costBasis: 295.00, currentPrice: 353.40, holdingDays: 600, taxLot: "2022-06-01", harvestCandidate: false, replacement: null },
];

function formatCurrency(n: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(n);
}

function formatBps(n: number): string {
  return n.toFixed(1) + " bps";
}

// ── Compound tax savings chart data ───────────────────────────────────────────
function buildCompoundData() {
  const withHarvest: number[] = [];
  const withoutHarvest: number[] = [];
  let baseWith = 100000;
  let baseWithout = 100000;
  const annualReturn = 0.09;
  const taxDrag = 0.005; // 50bps annual tax drag without harvesting
  const harvestSavings = 0.012; // 120bps per year from harvesting

  for (let y = 0; y <= 20; y++) {
    withHarvest.push(baseWith * Math.pow(1 + annualReturn + harvestSavings, y));
    withoutHarvest.push(baseWithout * Math.pow(1 + annualReturn - taxDrag, y));
  }
  return { withHarvest, withoutHarvest };
}

// ── Computed metrics ──────────────────────────────────────────────────────────
function computeMetrics(holdings: Holding[]) {
  let totalUnrealizedGains = 0;
  let totalUnrealizedLosses = 0;
  let harvestedLossesYTD = 0;

  for (const h of holdings) {
    const pnl = (h.currentPrice - h.costBasis) * h.shares;
    if (pnl > 0) totalUnrealizedGains += pnl;
    else totalUnrealizedLosses += Math.abs(pnl);
    if (h.harvestCandidate) harvestedLossesYTD += Math.abs(pnl);
  }

  const taxRate = 0.238; // 23.8% (20% LTCG + 3.8% NIIT)
  const estimatedSavings = harvestedLossesYTD * taxRate;
  const taxAlpha = (estimatedSavings / 500000) * 10000; // bps on $500k portfolio

  return { totalUnrealizedGains, totalUnrealizedLosses, harvestedLossesYTD, estimatedSavings, taxAlpha };
}

// ── Wash sale calendar data ───────────────────────────────────────────────────
const WASH_EVENTS = [
  { ticker: "INTC", sellDay: 5,  label: "Sell INTC", type: "sell" as const },
  { ticker: "INTC", buyDay: 36,  label: "Buy INTC back", type: "buy" as const },
  { ticker: "PYPL", sellDay: 12, label: "Sell PYPL", type: "sell" as const },
  { ticker: "PYPL", buyDay: 43,  label: "Buy PYPL back", type: "buy" as const },
];

// ── SVG Chart: Compound Tax Savings ──────────────────────────────────────────
function CompoundChart() {
  const { withHarvest, withoutHarvest } = useMemo(() => buildCompoundData(), []);
  const W = 560;
  const H = 220;
  const PAD = { top: 20, right: 20, bottom: 36, left: 68 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  const allVals = [...withHarvest, ...withoutHarvest];
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const yScale = (v: number) => ch - ((v - minV) / (maxV - minV)) * ch;
  const xScale = (i: number) => (i / 20) * cw;

  const polyWith = withHarvest.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
  const polyWithout = withoutHarvest.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");

  const areaWith =
    `M ${xScale(0)},${ch} ` +
    withHarvest.map((v, i) => `L ${xScale(i)},${yScale(v)}`).join(" ") +
    ` L ${xScale(20)},${ch} Z`;

  const yTicks = [100000, 150000, 200000, 250000, 300000, 350000].filter(
    (t) => t >= minV && t <= maxV
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="harvestGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Grid */}
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={0} y1={yScale(t)} x2={cw} y2={yScale(t)} stroke="#334155" strokeWidth={1} strokeDasharray="3,4" />
            <text x={-6} y={yScale(t) + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
              {t >= 1000 ? `$${(t / 1000).toFixed(0)}k` : `$${t}`}
            </text>
          </g>
        ))}
        {/* X axis ticks */}
        {[0, 5, 10, 15, 20].map((yr) => (
          <text key={yr} x={xScale(yr)} y={ch + 18} textAnchor="middle" fontSize={10} fill="#94a3b8">
            Yr {yr}
          </text>
        ))}
        {/* Area fill */}
        <path d={areaWith} fill="url(#harvestGrad)" />
        {/* Lines */}
        <polyline points={polyWithout} fill="none" stroke="#64748b" strokeWidth={2} strokeDasharray="6,3" />
        <polyline points={polyWith} fill="none" stroke="#22c55e" strokeWidth={2.5} />
        {/* Legend */}
        <line x1={cw - 130} y1={8} x2={cw - 116} y2={8} stroke="#22c55e" strokeWidth={2.5} />
        <text x={cw - 112} y={12} fontSize={10} fill="#94a3b8">With harvesting</text>
        <line x1={cw - 130} y1={22} x2={cw - 116} y2={22} stroke="#64748b" strokeWidth={2} strokeDasharray="6,3" />
        <text x={cw - 112} y={26} fontSize={10} fill="#94a3b8">Without harvesting</text>
      </g>
    </svg>
  );
}

// ── SVG Chart: Wash Sale Calendar ─────────────────────────────────────────────
function WashSaleCalendar() {
  const W = 560;
  const H = 140;
  const PAD = { top: 16, right: 20, bottom: 30, left: 60 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;
  const totalDays = 60;
  const xScale = (d: number) => (d / totalDays) * cw;
  const rows = [
    { ticker: "INTC", sellDay: 5,  buyBackDay: 36 },
    { ticker: "PYPL", sellDay: 12, buyBackDay: 43 },
  ];
  const rowH = ch / rows.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <pattern id="stripes" patternUnits="userSpaceOnUse" width={8} height={8} patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={8} stroke="#ef4444" strokeWidth={2} strokeOpacity={0.3} />
        </pattern>
      </defs>
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Day axis */}
        {[0, 10, 20, 30, 40, 50, 60].map((d) => (
          <g key={d}>
            <line x1={xScale(d)} y1={0} x2={xScale(d)} y2={ch} stroke="#1e293b" strokeWidth={1} />
            <text x={xScale(d)} y={ch + 16} textAnchor="middle" fontSize={9} fill="#64748b">
              Day {d}
            </text>
          </g>
        ))}
        {rows.map((row, ri) => {
          const cy = ri * rowH + rowH * 0.5;
          const sellX = xScale(row.sellDay);
          const washEndX = xScale(row.sellDay + 30);
          const buyX = xScale(row.buyBackDay);

          return (
            <g key={row.ticker}>
              {/* Ticker label */}
              <text x={-8} y={cy + 4} textAnchor="end" fontSize={11} fontWeight={600} fill="#e2e8f0">
                {row.ticker}
              </text>
              {/* Background timeline */}
              <line x1={0} y1={cy} x2={cw} y2={cy} stroke="#334155" strokeWidth={1.5} />
              {/* 30-day wash sale window */}
              <rect
                x={sellX}
                y={cy - 14}
                width={washEndX - sellX}
                height={28}
                fill="url(#stripes)"
                stroke="#ef4444"
                strokeWidth={1}
                rx={3}
                opacity={0.7}
              />
              <text x={(sellX + washEndX) / 2} y={cy + 4} textAnchor="middle" fontSize={9} fill="#fca5a5">
                30-day wash sale window
              </text>
              {/* Sell marker */}
              <circle cx={sellX} cy={cy} r={6} fill="#ef4444" />
              <text x={sellX} y={cy - 18} textAnchor="middle" fontSize={9} fill="#ef4444">
                Sell
              </text>
              {/* Buy-back marker */}
              <circle cx={buyX} cy={cy} r={6} fill="#22c55e" />
              <text x={buyX} y={cy - 18} textAnchor="middle" fontSize={9} fill="#22c55e">
                Safe to buy
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ── Tax rate comparison panel ─────────────────────────────────────────────────
function TaxRatesPanel() {
  const scenarios = [
    {
      type: "Short-term gain",
      rate: 0.37,
      color: "#ef4444",
      example: { gain: 10000, tax: 3700 },
      desc: "Held < 1 year — taxed as ordinary income",
    },
    {
      type: "Long-term gain",
      rate: 0.20,
      color: "#f97316",
      example: { gain: 10000, tax: 2000 },
      desc: "Held ≥ 1 year — preferential rate",
    },
    {
      type: "LTCG + NIIT",
      rate: 0.238,
      color: "#eab308",
      example: { gain: 10000, tax: 2380 },
      desc: "High earners add 3.8% Net Investment Income Tax",
    },
    {
      type: "After harvesting",
      rate: 0.0,
      color: "#22c55e",
      example: { gain: 10000, tax: 0 },
      desc: "Losses offset gains — net zero tax event",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {scenarios.map((sc) => (
        <div key={sc.type} className="p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">{sc.type}</span>
            <Badge
              style={{ backgroundColor: sc.color + "22", color: sc.color, borderColor: sc.color + "55" }}
              className="border text-xs font-bold"
            >
              {(sc.rate * 100).toFixed(1)}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{sc.desc}</p>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">$10,000 gain → tax:</span>
            <span className="font-bold" style={{ color: sc.color }}>
              {formatCurrency(sc.example.tax)}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${sc.rate * 100 / 0.4 * 100}%`, backgroundColor: sc.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TaxLossHarvestingPage() {
  const [activeTab, setActiveTab] = useState("opportunities");
  const [harvestedIds, setHarvestedIds] = useState<Set<string>>(new Set());

  const metrics = useMemo(() => computeMetrics(HOLDINGS), []);

  const toggleHarvest = (ticker: string) => {
    setHarvestedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker);
      else next.add(ticker);
      return next;
    });
  };

  const harvestCandidates = HOLDINGS.filter((h) => h.harvestCandidate);
  const otherHoldings = HOLDINGS.filter((h) => !h.harvestCandidate);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <Scissors className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tax Loss Harvesting</h1>
            <p className="text-sm text-muted-foreground">
              Strategically realize losses to offset gains and reduce your tax bill
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key metrics */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 md:grid-cols-4 gap-3 border-l-4 border-l-primary p-6 rounded-lg bg-card/40">
        {[
          {
            label: "Est. Tax Savings (YTD)",
            value: formatCurrency(metrics.estimatedSavings),
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
          },
          {
            label: "Harvested Losses YTD",
            value: formatCurrency(metrics.harvestedLossesYTD),
            icon: TrendingDown,
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
          },
          {
            label: "Tax Alpha",
            value: formatBps(metrics.taxAlpha),
            icon: Zap,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20",
          },
          {
            label: "Unrealized Gains",
            value: formatCurrency(metrics.totalUnrealizedGains),
            icon: TrendingUp,
            color: "text-primary",
            bg: "bg-primary/10",
            border: "border-border",
          },
        ].map((m) => (
          <Card key={m.label} className={`border ${m.border}`}>
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center mb-2`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-0.5">{m.label}</p>
              <p className={`text-xl font-medium ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeUp(0.1)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="opportunities" className="text-xs">
              Harvesting Opportunities
            </TabsTrigger>
            <TabsTrigger value="washsale" className="text-xs">
              Wash Sale Rules
            </TabsTrigger>
            <TabsTrigger value="longterm" className="text-xs">
              Long-term Impact
            </TabsTrigger>
            <TabsTrigger value="directindexing" className="text-xs">
              Direct Indexing
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Harvesting Opportunities ─────────────────────────── */}
          <TabsContent value="opportunities" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Harvest candidates */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    Harvest Candidates
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border text-xs ml-auto">
                      {harvestCandidates.length} positions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-3 py-2 text-left text-muted-foreground font-medium">Ticker</th>
                          <th className="px-3 py-2 text-right text-muted-foreground font-medium">Unreal. P&L</th>
                          <th className="px-3 py-2 text-right text-muted-foreground font-medium">Days Held</th>
                          <th className="px-3 py-2 text-center text-muted-foreground font-medium">Replace With</th>
                          <th className="px-3 py-2 text-center text-muted-foreground font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {harvestCandidates.map((h) => {
                          const pnl = (h.currentPrice - h.costBasis) * h.shares;
                          const harvested = harvestedIds.has(h.ticker);
                          return (
                            <tr key={h.ticker} className={`border-b border-border/50 ${harvested ? "opacity-50" : ""}`}>
                              <td className="px-3 py-2.5">
                                <div className="font-semibold text-foreground">{h.ticker}</div>
                                <div className="text-muted-foreground truncate max-w-[100px]">{h.name}</div>
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono">
                                <span className="text-red-400 font-semibold">{formatCurrency(pnl)}</span>
                              </td>
                              <td className="px-3 py-2.5 text-right text-muted-foreground">
                                {h.holdingDays}d
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                {h.replacement ? (
                                  <Badge className="bg-primary/20 text-primary border-border border text-xs">
                                    {h.replacement}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <Button
                                  size="sm"
                                  variant={harvested ? "outline" : "default"}
                                  className={`h-6 text-xs px-2 ${harvested ? "text-muted-foreground" : "bg-green-600 hover:bg-green-700 text-foreground"}`}
                                  onClick={() => toggleHarvest(h.ticker)}
                                >
                                  {harvested ? <CheckCircle2 className="w-3 h-3" /> : "Harvest"}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Full holdings table */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    All Holdings — Tax Lot Detail
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-3 py-2 text-left text-muted-foreground font-medium">Ticker</th>
                          <th className="px-3 py-2 text-right text-muted-foreground font-medium">Cost</th>
                          <th className="px-3 py-2 text-right text-muted-foreground font-medium">Price</th>
                          <th className="px-3 py-2 text-right text-muted-foreground font-medium">P&L</th>
                          <th className="px-3 py-2 text-center text-muted-foreground font-medium">Term</th>
                        </tr>
                      </thead>
                      <tbody>
                        {HOLDINGS.map((h) => {
                          const pnl = (h.currentPrice - h.costBasis) * h.shares;
                          const pnlPct = ((h.currentPrice - h.costBasis) / h.costBasis) * 100;
                          const isLT = h.holdingDays >= 365;
                          return (
                            <tr key={h.ticker} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-foreground">{h.ticker}</span>
                                  {h.harvestCandidate && (
                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border text-[11px] px-1 py-0">
                                      TLH
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-right text-muted-foreground font-mono">
                                {formatCurrency(h.costBasis, 2)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-foreground">
                                {formatCurrency(h.currentPrice, 2)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono">
                                <span className={pnl >= 0 ? "text-green-400" : "text-red-400"}>
                                  {formatCurrency(pnl)}
                                  <span className="text-[11px] ml-1">({pnlPct.toFixed(1)}%)</span>
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <Badge
                                  className={`text-[11px] px-1.5 py-0 border ${
                                    isLT
                                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                                      : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                  }`}
                                >
                                  {isLT ? "LT" : "ST"}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Short vs long-term comparison */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  Short-term vs Long-term Tax Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaxRatesPanel />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 2: Wash Sale Rules ───────────────────────────────────── */}
          <TabsContent value="washsale" className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  30-Day Wash Sale Window Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  If you buy back a &ldquo;substantially identical&rdquo; security within 30 days before or after selling at a
                  loss, the IRS disallows the loss. The calendar below shows safe windows to re-enter positions.
                </p>
                <WashSaleCalendar />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: AlertTriangle,
                  color: "text-red-400",
                  bg: "bg-red-500/10",
                  border: "border-red-500/20",
                  title: "Wash Sale Triggers",
                  items: [
                    "Buying the same stock within ±30 days",
                    "Buying options on the same stock",
                    "Spouse buying the same security",
                    "IRA/401k accounts count too",
                    "Acquiring shares through DRIP",
                  ],
                },
                {
                  icon: CheckCircle2,
                  color: "text-green-400",
                  bg: "bg-green-500/10",
                  border: "border-green-500/20",
                  title: "Safe Replacements",
                  items: [
                    "Similar but not identical ETFs (e.g., SOXX for SMH)",
                    "Sector peers (e.g., SQ instead of PYPL)",
                    "Different fund family same index",
                    "Preferred shares vs common stock",
                    "Wait 31+ days before repurchasing",
                  ],
                },
              ].map((section) => (
                <Card key={section.title} className={`border ${section.border}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${section.bg}`}>
                        <section.icon className={`w-3.5 h-3.5 ${section.color}`} />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className={`w-3 h-3 mt-0.5 shrink-0 ${section.color}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="p-4 flex gap-3">
                <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-yellow-400">Important:</span> The wash sale loss is not
                  permanently lost — it is added to the cost basis of the replacement security, deferring the
                  tax benefit rather than eliminating it. However, this deferral can become a permanent loss if
                  the replacement is sold in a wash sale or in a tax-advantaged account.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 3: Long-term Impact ──────────────────────────────────── */}
          <TabsContent value="longterm" className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Compound Effect: 20-Year Tax Savings Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Starting with $100,000, assuming 9% annual return. Tax loss harvesting adds ~120 bps/year in
                  after-tax alpha vs. a passive buy-and-hold with 50 bps of annual tax drag.
                </p>
                <CompoundChart />
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: "Year 5 advantage", value: formatCurrency(180000 * 1.09 ** 5 - 100000 * 1.085 ** 5), color: "text-green-400" },
                    { label: "Year 10 advantage", value: formatCurrency(100000 * 1.102 ** 10 - 100000 * 1.085 ** 10), color: "text-green-400" },
                    { label: "Year 20 advantage", value: formatCurrency(100000 * 1.102 ** 20 - 100000 * 1.085 ** 20), color: "text-green-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/40 border border-border">
                      <p className={`text-lg font-medium ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: RefreshCw,
                  color: "text-primary",
                  bg: "bg-primary/10",
                  border: "border-border",
                  title: "Systematic Harvesting",
                  desc: "Review portfolio monthly or when losses exceed a threshold (e.g., $500). Automated platforms check daily.",
                  stat: "~150 bps/yr alpha",
                },
                {
                  icon: Shield,
                  color: "text-primary",
                  bg: "bg-primary/10",
                  border: "border-border",
                  title: "Loss Carry-Forward",
                  desc: "Unused losses carry forward indefinitely. Up to $3,000/year can offset ordinary income.",
                  stat: "No expiration",
                },
                {
                  icon: Layers,
                  color: "text-orange-400",
                  bg: "bg-orange-500/10",
                  border: "border-orange-500/20",
                  title: "Gain Deferral",
                  desc: "Harvested losses defer your gain recognition, keeping more capital compounding longer in the market.",
                  stat: "Time-value benefit",
                },
              ].map((card) => (
                <Card key={card.title} className={`border ${card.border}`}>
                  <CardContent className="p-4">
                    <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                      <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{card.title}</p>
                    <p className="text-xs text-muted-foreground mb-3">{card.desc}</p>
                    <Badge className={`${card.bg} ${card.color} border text-xs`} style={{ borderColor: card.color + "55" }}>
                      {card.stat}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab 4: Direct Indexing ───────────────────────────────────── */}
          <TabsContent value="directindexing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    ETF Ownership vs Direct Indexing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      label: "ETF (e.g., SPY)",
                      items: [
                        "You own shares of a fund — not individual stocks",
                        "Cannot harvest individual stock losses inside the fund",
                        "ETF manager may generate capital gains distributions",
                        "Simpler, lower minimums (~$1)",
                        "No customization for ESG or existing positions",
                      ],
                      positive: false,
                    },
                    {
                      label: "Direct Indexing",
                      items: [
                        "You own each stock individually (e.g., all 500 S&P stocks)",
                        "Harvest individual losers while keeping index exposure",
                        "Tax-loss harvest daily via robo-automation",
                        "Customize: exclude sectors, add tilts, ESG screening",
                        "Typically requires $100k+ minimum investment",
                      ],
                      positive: true,
                    },
                  ].map((option) => (
                    <div
                      key={option.label}
                      className={`p-3 rounded-lg border ${
                        option.positive
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-border bg-muted/20"
                      }`}
                    >
                      <p className={`text-sm font-medium mb-2 ${option.positive ? "text-green-400" : "text-foreground"}`}>
                        {option.label}
                      </p>
                      <ul className="space-y-1">
                        {option.items.map((item) => (
                          <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            {option.positive ? (
                              <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-green-400" />
                            ) : (
                              <div className="w-3 h-3 mt-0.5 shrink-0 rounded-full border border-muted-foreground/40 flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                              </div>
                            )}
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      Direct Indexing Economics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { label: "Minimum portfolio size", value: "$100,000 – $250,000", note: "Varies by provider" },
                        { label: "Management fee", value: "0.20% – 0.40%/yr", note: "vs 0.03% for SPY" },
                        { label: "Avg. annual tax alpha", value: "50–150 bps/yr", note: "After-fee, net benefit" },
                        { label: "Break-even vs ETF", value: "~5–7 years", note: "Depends on tax rate" },
                        { label: "Positions tracked", value: "100–500+", note: "Full or subset index" },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                          <div>
                            <p className="text-xs font-medium text-foreground">{row.label}</p>
                            <p className="text-xs text-muted-foreground">{row.note}</p>
                          </div>
                          <span className="text-xs font-medium text-primary">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Who Benefits Most?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {[
                        "High-income investors in the 37% bracket",
                        "Concentrated stock position holders",
                        "Taxable accounts (not IRAs — tax benefits N/A)",
                        "Investors with large unrealized embedded gains",
                        "Those who want index exposure + customization",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-border bg-primary/5">
              <CardContent className="p-4 flex gap-3">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-primary">How it works:</span> A direct indexing platform
                  (e.g., Parametric, Fidelity Managed Accounts, Schwab Personalized Indexing) purchases each
                  constituent stock individually. When any stock falls below your cost basis, the system
                  automatically harvests the loss and buys a correlated substitute for 31+ days, then rotates
                  back. This generates a continuous stream of realized losses that offset your gains elsewhere,
                  while maintaining full market exposure.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
