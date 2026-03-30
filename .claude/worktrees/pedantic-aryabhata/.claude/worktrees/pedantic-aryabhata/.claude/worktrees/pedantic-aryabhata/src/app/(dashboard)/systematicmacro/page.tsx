"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  BarChart3,
  Target,
  ShieldAlert,
  Zap,
  Globe,
  DollarSign,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 764;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 764;
}

// ── Types ──────────────────────────────────────────────────────────────────────

type SignalDir = "buy" | "neutral" | "sell";

interface Signal {
  asset: string;
  assetClass: string;
  trend: SignalDir;
  trendStrength: number;
  carry: SignalDir;
  carryStrength: number;
  momentum: SignalDir;
  momentumStrength: number;
  meanRev: SignalDir;
  meanRevStrength: number;
  composite: SignalDir;
  compositeScore: number;
}

interface Position {
  asset: string;
  assetClass: string;
  direction: "long" | "short";
  signal: SignalDir;
  size: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  pnl: number;
  pnlPct: number;
}

interface EquityPoint {
  bar: number;
  strategy: number;
  benchmark: number;
  drawdown: number;
}

// ── Data Generation ────────────────────────────────────────────────────────────

const ASSET_CLASSES = [
  { label: "FX", assets: ["EUR/USD", "USD/JPY", "GBP/USD", "AUD/USD", "USD/CHF", "USD/CAD"] },
  { label: "Rates", assets: ["US 10Y", "DE 10Y", "JP 10Y", "UK 10Y"] },
  { label: "Equity", assets: ["S&P 500", "EuroStoxx", "Nikkei", "FTSE 100", "EM Eq."] },
  { label: "Commodities", assets: ["Gold", "Crude Oil", "Copper", "Nat Gas", "Silver", "Wheat"] },
];

const ALL_ASSETS = ASSET_CLASSES.flatMap((ac) => ac.assets.map((a) => ({ asset: a, assetClass: ac.label })));

function dirFromRand(r: number): SignalDir {
  if (r < 0.3) return "sell";
  if (r > 0.65) return "buy";
  return "neutral";
}

function generateSignals(): Signal[] {
  resetSeed();
  return ALL_ASSETS.map(({ asset, assetClass }) => {
    const trendR = rand();
    const carryR = rand();
    const momentumR = rand();
    const meanRevR = rand();
    const trend = dirFromRand(trendR);
    const carry = dirFromRand(carryR);
    const momentum = dirFromRand(momentumR);
    const meanRev = dirFromRand(meanRevR);

    const scoreMap: Record<SignalDir, number> = { buy: 1, neutral: 0, sell: -1 };
    const composite_score =
      scoreMap[trend] * (0.4 + rand() * 0.2) +
      scoreMap[carry] * (0.2 + rand() * 0.1) +
      scoreMap[momentum] * (0.25 + rand() * 0.1) +
      scoreMap[meanRev] * (0.15 + rand() * 0.1);

    const composite: SignalDir = composite_score > 0.15 ? "buy" : composite_score < -0.15 ? "sell" : "neutral";

    return {
      asset,
      assetClass,
      trend,
      trendStrength: Math.round(30 + rand() * 70),
      carry,
      carryStrength: Math.round(20 + rand() * 80),
      momentum,
      momentumStrength: Math.round(25 + rand() * 75),
      meanRev,
      meanRevStrength: Math.round(15 + rand() * 85),
      composite,
      compositeScore: Math.round(composite_score * 100),
    };
  });
}

function generatePositions(): Position[] {
  resetSeed();
  const assets = [
    { asset: "EUR/USD", ac: "FX" },
    { asset: "Gold", ac: "Commodities" },
    { asset: "US 10Y", ac: "Rates" },
    { asset: "S&P 500", ac: "Equity" },
    { asset: "USD/JPY", ac: "FX" },
    { asset: "Crude Oil", ac: "Commodities" },
    { asset: "Nikkei", ac: "Equity" },
    { asset: "GBP/USD", ac: "FX" },
    { asset: "Copper", ac: "Commodities" },
    { asset: "DE 10Y", ac: "Rates" },
  ];

  return assets.map(({ asset, ac }) => {
    const direction: "long" | "short" = rand() > 0.45 ? "long" : "short";
    const signal: SignalDir = direction === "long" ? "buy" : "sell";
    const size = Math.round((rand() * 9 + 1) * 10) / 10;
    const base = 100 + rand() * 900;
    const entryPrice = Math.round(base * 100) / 100;
    const drift = (rand() - 0.48) * 0.08;
    const currentPrice = Math.round(entryPrice * (1 + drift) * 100) / 100;
    const stopLoss =
      direction === "long"
        ? Math.round(entryPrice * (1 - 0.03 - rand() * 0.02) * 100) / 100
        : Math.round(entryPrice * (1 + 0.03 + rand() * 0.02) * 100) / 100;
    const rawPnl =
      direction === "long" ? (currentPrice - entryPrice) / entryPrice : (entryPrice - currentPrice) / entryPrice;
    const pnlPct = Math.round(rawPnl * 1000) / 10;
    const pnl = Math.round(rawPnl * size * 10000) / 100;

    return { asset, assetClass: ac, direction, signal, size, entryPrice, currentPrice, stopLoss, pnl, pnlPct };
  });
}

function generateEquityCurve(): EquityPoint[] {
  resetSeed();
  const points: EquityPoint[] = [];
  let strat = 100;
  let bench = 100;
  let peak = 100;

  for (let i = 0; i < 252; i++) {
    const stratRet = (rand() - 0.46) * 0.018;
    const benchRet = (rand() - 0.47) * 0.024;
    strat = strat * (1 + stratRet);
    bench = bench * (1 + benchRet);
    if (strat > peak) peak = strat;
    const drawdown = ((strat - peak) / peak) * 100;
    points.push({ bar: i, strategy: Math.round(strat * 100) / 100, benchmark: Math.round(bench * 100) / 100, drawdown: Math.round(drawdown * 100) / 100 });
  }
  return points;
}

// ── Risk Metrics ───────────────────────────────────────────────────────────────

const RISK_METRICS = [
  { label: "Sharpe Ratio", value: "1.42", note: "Annualized", positive: true },
  { label: "Sortino Ratio", value: "1.89", note: "Downside only", positive: true },
  { label: "Max Drawdown", value: "-8.3%", note: "Peak to trough", positive: false },
  { label: "Calmar Ratio", value: "2.17", note: "Return/MaxDD", positive: true },
  { label: "Corr. to S&P", value: "0.14", note: "Low correlation", positive: true },
  { label: "Volatility", value: "7.2%", note: "Annualized", positive: null },
  { label: "Win Rate", value: "54.3%", note: "Profitable trades", positive: true },
  { label: "Avg Hold Days", value: "18.4d", note: "Per trade", positive: null },
];

// ── Summary Cards ──────────────────────────────────────────────────────────────

const SUMMARY_STATS = [
  { label: "Active Signals", value: "21", icon: Zap, color: "text-primary" },
  { label: "Net Long Bias", value: "+34%", icon: TrendingUp, color: "text-green-500" },
  { label: "Strategy YTD", value: "+12.7%", icon: BarChart3, color: "text-green-500" },
  { label: "Open Positions", value: "10", icon: Activity, color: "text-amber-500" },
];

// ── Signal Color Helpers ───────────────────────────────────────────────────────

function signalBg(dir: SignalDir): string {
  if (dir === "buy") return "bg-green-500/20 border border-green-500/40";
  if (dir === "sell") return "bg-red-500/20 border border-red-500/40";
  return "bg-muted/40 border border-border";
}

function signalText(dir: SignalDir): string {
  if (dir === "buy") return "text-green-400";
  if (dir === "sell") return "text-red-400";
  return "text-muted-foreground";
}

function signalLabel(dir: SignalDir): string {
  if (dir === "buy") return "BUY";
  if (dir === "sell") return "SELL";
  return "NEUT";
}

// ── SVG Equity Curve ───────────────────────────────────────────────────────────

function EquityCurveChart({ data }: { data: EquityPoint[] }) {
  const W = 700;
  const H = 220;
  const PAD = { top: 16, right: 16, bottom: 32, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allVals = data.flatMap((d) => [d.strategy, d.benchmark]);
  const minV = Math.min(...allVals) * 0.98;
  const maxV = Math.max(...allVals) * 1.02;

  const xScale = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const yScale = (v: number) => PAD.top + ((maxV - v) / (maxV - minV)) * innerH;

  const stratPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.bar)},${yScale(d.strategy)}`).join(" ");
  const benchPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.bar)},${yScale(d.benchmark)}`).join(" ");

  const yTicks = [minV, (minV + maxV) / 2, maxV];
  const xTicks = [0, 63, 126, 189, 251];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Grid */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={W - PAD.right} y1={yScale(v)} y2={yScale(v)} stroke="hsl(var(--border))" strokeDasharray="4 4" strokeWidth={0.8} />
          <text x={PAD.left - 6} y={yScale(v) + 4} textAnchor="end" fontSize={10} fill="hsl(var(--muted-foreground))">
            {Math.round(v)}
          </text>
        </g>
      ))}
      {xTicks.map((t, i) => (
        <text key={i} x={xScale(t)} y={H - 4} textAnchor="middle" fontSize={10} fill="hsl(var(--muted-foreground))">
          {["Jan", "Apr", "Jul", "Oct", "Dec"][i]}
        </text>
      ))}

      {/* Benchmark */}
      <path d={benchPath} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="6 3" opacity={0.6} />

      {/* Strategy */}
      <path d={stratPath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.2} />

      {/* Legend */}
      <line x1={W - 120} x2={W - 100} y1={PAD.top + 8} y2={PAD.top + 8} stroke="hsl(var(--primary))" strokeWidth={2.2} />
      <text x={W - 96} y={PAD.top + 12} fontSize={10} fill="hsl(var(--foreground))">Strategy</text>
      <line x1={W - 120} x2={W - 100} y1={PAD.top + 22} y2={PAD.top + 22} stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="6 3" />
      <text x={W - 96} y={PAD.top + 26} fontSize={10} fill="hsl(var(--muted-foreground))">Buy &amp; Hold</text>
    </svg>
  );
}

// ── SVG Drawdown Chart ─────────────────────────────────────────────────────────

function DrawdownChart({ data }: { data: EquityPoint[] }) {
  const W = 700;
  const H = 140;
  const PAD = { top: 16, right: 16, bottom: 28, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const minDD = Math.min(...data.map((d) => d.drawdown)) * 1.1;
  const maxDD = 0;

  const xScale = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const yScale = (v: number) => PAD.top + ((maxDD - v) / (maxDD - minDD)) * innerH;

  const areaPath =
    data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.bar)},${yScale(d.drawdown)}`).join(" ") +
    ` L${xScale(data[data.length - 1].bar)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.bar)},${yScale(d.drawdown)}`).join(" ");

  const yTicks = [minDD, minDD / 2, 0];
  const xTicks = [0, 63, 126, 189, 251];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={W - PAD.right} y1={yScale(v)} y2={yScale(v)} stroke="hsl(var(--border))" strokeDasharray="4 4" strokeWidth={0.8} />
          <text x={PAD.left - 6} y={yScale(v) + 4} textAnchor="end" fontSize={10} fill="hsl(var(--muted-foreground))">
            {Math.round(v)}%
          </text>
        </g>
      ))}
      {xTicks.map((t, i) => (
        <text key={i} x={xScale(t)} y={H - 4} textAnchor="middle" fontSize={10} fill="hsl(var(--muted-foreground))">
          {["Jan", "Apr", "Jul", "Oct", "Dec"][i]}
        </text>
      ))}
      <path d={areaPath} fill="hsl(var(--destructive))" opacity={0.15} />
      <path d={linePath} fill="none" stroke="hsl(var(--destructive))" strokeWidth={1.8} />
    </svg>
  );
}

// ── Signal Heatmap ─────────────────────────────────────────────────────────────

function SignalHeatmap({ signals }: { signals: Signal[] }) {
  const CELL_W = 60;
  const CELL_H = 36;
  const LABEL_W = 90;
  const COL_LABELS = ["Trend", "Carry", "Mom.", "MRev.", "Comp."];
  const COL_H = 28;

  const grouped = ASSET_CLASSES.map((ac) => ({
    label: ac.label,
    rows: signals.filter((s) => s.assetClass === ac.label),
  }));

  const totalRows = signals.length + grouped.length; // assets + group headers
  const svgH = COL_H + totalRows * CELL_H + 8;
  const svgW = LABEL_W + COL_LABELS.length * CELL_W + 16;

  function cellFill(dir: SignalDir): string {
    if (dir === "buy") return "#22c55e33";
    if (dir === "sell") return "#ef444433";
    return "#8882";
  }

  function cellStroke(dir: SignalDir): string {
    if (dir === "buy") return "#22c55e88";
    if (dir === "sell") return "#ef444488";
    return "#8884";
  }

  function cellTxt(dir: SignalDir): string {
    if (dir === "buy") return "#4ade80";
    if (dir === "sell") return "#f87171";
    return "#888";
  }

  let rowIdx = 0;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: svgW, height: svgH }}>
        {/* Column headers */}
        {COL_LABELS.map((cl, ci) => (
          <text
            key={ci}
            x={LABEL_W + ci * CELL_W + CELL_W / 2}
            y={COL_H - 6}
            textAnchor="middle"
            fontSize={10}
            fill="hsl(var(--muted-foreground))"
            fontWeight={500}
          >
            {cl}
          </text>
        ))}

        {grouped.map((group) => {
          const groupY = COL_H + rowIdx * CELL_H;
          rowIdx += 1;
          const rows = group.rows;

          return (
            <g key={group.label}>
              {/* Group header */}
              <rect x={0} y={groupY} width={svgW} height={CELL_H} fill="hsl(var(--muted))" opacity={0.3} />
              <text x={8} y={groupY + CELL_H / 2 + 4} fontSize={11} fontWeight={700} fill="hsl(var(--foreground))">
                {group.label}
              </text>

              {rows.map((sig) => {
                const assetY = COL_H + rowIdx * CELL_H;
                rowIdx += 1;
                const cols: SignalDir[] = [sig.trend, sig.carry, sig.momentum, sig.meanRev, sig.composite];

                return (
                  <g key={sig.asset}>
                    <text x={LABEL_W - 6} y={assetY + CELL_H / 2 + 4} textAnchor="end" fontSize={10} fill="hsl(var(--muted-foreground))">
                      {sig.asset}
                    </text>
                    {cols.map((dir, ci) => (
                      <g key={ci}>
                        <rect
                          x={LABEL_W + ci * CELL_W + 2}
                          y={assetY + 2}
                          width={CELL_W - 4}
                          height={CELL_H - 4}
                          rx={4}
                          fill={cellFill(dir)}
                          stroke={cellStroke(dir)}
                          strokeWidth={0.8}
                        />
                        <text
                          x={LABEL_W + ci * CELL_W + CELL_W / 2}
                          y={assetY + CELL_H / 2 + 4}
                          textAnchor="middle"
                          fontSize={9}
                          fontWeight={600}
                          fill={cellTxt(dir)}
                        >
                          {signalLabel(dir)}
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function SystematicMacroPage() {
  const [activeTab, setActiveTab] = useState("signals");

  const signals = useMemo(() => generateSignals(), []);
  const positions = useMemo(() => generatePositions(), []);
  const equityCurve = useMemo(() => generateEquityCurve(), []);

  const buyCount = signals.filter((s) => s.composite === "buy").length;
  const sellCount = signals.filter((s) => s.composite === "sell").length;
  const neutCount = signals.filter((s) => s.composite === "neutral").length;

  const finalStratVal = equityCurve[equityCurve.length - 1]?.strategy ?? 100;
  const finalBenchVal = equityCurve[equityCurve.length - 1]?.benchmark ?? 100;

  return (
    <div className="p-4 md:p-4 space-y-4 min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="border-l-4 border-l-primary p-6 rounded-lg bg-card/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              Systematic Macro Trading
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Multi-asset trend following, carry, and momentum signals across FX, rates, equities, and commodities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-400 border-green-500/40 bg-green-500/10">
              Live Signals
            </Badge>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-l-4 border-l-primary p-6 rounded-lg bg-card/40"
      >
        {SUMMARY_STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-card border-border">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Signal distribution bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Composite Signal Distribution</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="text-green-400">{buyCount} buy</span>
                <span className="text-muted-foreground">{neutCount} neutral</span>
                <span className="text-red-400">{sellCount} sell</span>
              </div>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              <div className="bg-green-500/70" style={{ width: `${(buyCount / signals.length) * 100}%` }} />
              <div className="bg-muted/60" style={{ width: `${(neutCount / signals.length) * 100}%` }} />
              <div className="bg-red-500/70" style={{ width: `${(sellCount / signals.length) * 100}%` }} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="backtests">Backtests</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
          </TabsList>

          {/* ── SIGNALS TAB ── */}
          <TabsContent value="signals" className="space-y-4 data-[state=inactive]:hidden">
            {/* Signal cards for 4 strategy types */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Trend Following", dir: "buy" as SignalDir, pct: "+3.2%", desc: "Strong uptrend across DM rates & equities", icon: TrendingUp },
                { label: "Carry", dir: "buy" as SignalDir, pct: "+1.8%", desc: "EM FX carry attractive vs developed market", icon: DollarSign },
                { label: "Mean Reversion", dir: "neutral" as SignalDir, pct: "-0.3%", desc: "Limited reversals; markets near fair value", icon: Minus },
                { label: "Momentum", dir: "buy" as SignalDir, pct: "+2.4%", desc: "12-1M momentum positive in equities & gold", icon: Zap },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <Card key={i} className={`border-border ${signalBg(card.dir)}`}>
                    <CardContent className="pt-4 pb-3 px-4">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${signalText(card.dir)}`} />
                        <Badge className={`text-xs px-1.5 py-0 ${card.dir === "buy" ? "bg-green-500/20 text-green-400 border-green-500/40" : card.dir === "sell" ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-muted text-muted-foreground border-border"}`} variant="outline">
                          {signalLabel(card.dir)}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-foreground">{card.label}</p>
                      <p className={`text-lg font-medium mt-0.5 ${card.dir === "buy" ? "text-green-400" : card.dir === "sell" ? "text-red-400" : "text-muted-foreground"}`}>
                        {card.pct}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-tight">{card.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Heatmap */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Multi-Asset Signal Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <SignalHeatmap signals={signals} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PORTFOLIO TAB ── */}
          <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Position Sizing Table
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-2 px-2 font-medium">Asset</th>
                        <th className="text-left py-2 px-2 font-medium">Class</th>
                        <th className="text-center py-2 px-2 font-medium">Dir.</th>
                        <th className="text-center py-2 px-2 font-medium">Signal</th>
                        <th className="text-right py-2 px-2 font-medium">Size%</th>
                        <th className="text-right py-2 px-2 font-medium">Entry</th>
                        <th className="text-right py-2 px-2 font-medium">Current</th>
                        <th className="text-right py-2 px-2 font-medium">Stop</th>
                        <th className="text-right py-2 px-2 font-medium">P&amp;L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((pos, i) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-2 font-medium">{pos.asset}</td>
                          <td className="py-2 px-2 text-muted-foreground">{pos.assetClass}</td>
                          <td className="py-2 px-2 text-center">
                            {pos.direction === "long" ? (
                              <ArrowUpRight className="w-3.5 h-3.5 text-green-400 inline" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5 text-red-400 inline" />
                            )}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className={`font-semibold ${signalText(pos.signal)}`}>{signalLabel(pos.signal)}</span>
                          </td>
                          <td className="py-2 px-2 text-right">{pos.size}%</td>
                          <td className="py-2 px-2 text-right font-mono">{pos.entryPrice.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right font-mono">{pos.currentPrice.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right font-mono text-amber-400">{pos.stopLoss.toFixed(2)}</td>
                          <td className={`py-2 px-2 text-right font-semibold ${pos.pnlPct >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {pos.pnlPct >= 0 ? "+" : ""}
                            {pos.pnlPct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── BACKTESTS TAB ── */}
          <TabsContent value="backtests" className="space-y-4 data-[state=inactive]:hidden">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Strategy Return", value: `+${(finalStratVal - 100).toFixed(1)}%`, positive: true },
                { label: "Buy & Hold Return", value: `${finalBenchVal >= 100 ? "+" : ""}${(finalBenchVal - 100).toFixed(1)}%`, positive: finalBenchVal >= 100 },
                { label: "Alpha Generated", value: `+${(finalStratVal - finalBenchVal).toFixed(1)}%`, positive: true },
              ].map((item, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="pt-4 pb-3 px-4">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`text-lg font-medium mt-1 ${item.positive ? "text-green-400" : "text-red-400"}`}>{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Equity Curve — Systematic Macro vs Buy &amp; Hold (1 Year)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EquityCurveChart data={equityCurve} />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-destructive" />
                  Drawdown (Underwater Chart)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DrawdownChart data={equityCurve} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── RISK TAB ── */}
          <TabsContent value="risk" className="data-[state=inactive]:hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {RISK_METRICS.map((m, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="pt-4 pb-3 px-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{m.label}</p>
                    <p
                      className={`text-xl font-medium mt-1 ${
                        m.positive === true ? "text-green-400" : m.positive === false ? "text-red-400" : "text-foreground"
                      }`}
                    >
                      {m.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Correlation bar chart */}
            <Card className="bg-card border-border mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Asset Class Contribution to Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "FX", pct: 28, color: "bg-primary" },
                    { label: "Rates", pct: 22, color: "bg-primary" },
                    { label: "Equity", pct: 31, color: "bg-green-500" },
                    { label: "Commodities", pct: 19, color: "bg-amber-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-muted-foreground">{item.label}</span>
                      <div className="flex-1 bg-muted/30 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs text-muted-foreground font-medium">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategy description */}
            <Card className="bg-card border-border mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Strategy Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  The <span className="text-foreground font-medium">Systematic Macro</span> strategy combines four
                  signal pillars — trend following, carry, momentum, and mean reversion — across 21 liquid futures
                  instruments spanning FX, fixed income, equity indices, and commodities.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: "Trend Following (40%)", body: "200-day moving average crossover with ATR-based position sizing. Captures sustained directional moves." },
                    { title: "Carry (20%)", body: "Long high-yielding vs short low-yielding assets within FX and fixed income. Net of transaction costs." },
                    { title: "Momentum (25%)", body: "12-1 month cross-sectional momentum. Monthly rebalance with equal vol-weight across asset classes." },
                    { title: "Mean Reversion (15%)", body: "Z-score based short-term reversion on 20-day lookback. Acts as a dampener during overshoot." },
                  ].map((item, i) => (
                    <div key={i} className="bg-muted/20 rounded-lg p-3 border border-border">
                      <p className="text-xs font-semibold text-foreground mb-1">{item.title}</p>
                      <p className="text-[11px] leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
