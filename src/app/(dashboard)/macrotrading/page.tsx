"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  DollarSign,
  Globe,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  MinusCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 672006;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function randRange(min: number, max: number) {
  return min + rand() * (max - min);
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ── Types ──────────────────────────────────────────────────────────────────────

type Regime = "Goldilocks" | "Inflation" | "Stagflation" | "Deflation";
type SignalColor = "green" | "yellow" | "red";
type CyclePhase = "Hiking" | "Peak" | "Cutting" | "Trough";
type Conviction = "High" | "Medium" | "Low";

interface RegimeData {
  name: Regime;
  growth: "High" | "Low";
  inflation: "High" | "Low";
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  assets: { name: string; return: number }[];
}

interface LeadingIndicator {
  name: string;
  value: string;
  change: string;
  signal: SignalColor;
  description: string;
  sparkData: number[];
}

interface AssetPerf {
  asset: string;
  hiking: number;
  peak: number;
  cutting: number;
  trough: number;
}

interface CrossAssetSignal {
  driver: string;
  direction: "up" | "down";
  impact: string;
  magnitude: "strong" | "moderate" | "weak";
  assets: { name: string; effect: "positive" | "negative" | "neutral" }[];
}

interface TradeIdea {
  id: number;
  title: string;
  rationale: string;
  entry: string;
  target: string;
  stop: string;
  conviction: Conviction;
  direction: "long" | "short";
  asset: string;
  catalyst: string;
}

// ── Data ───────────────────────────────────────────────────────────────────────

const REGIMES: RegimeData[] = [
  {
    name: "Goldilocks",
    growth: "High",
    inflation: "Low",
    description:
      "Strong growth with contained inflation. Central banks on hold. Risk assets outperform.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-950/40",
    borderColor: "border-emerald-500/40",
    assets: [
      { name: "Equities", return: 18.4 },
      { name: "IG Credit", return: 6.2 },
      { name: "Commodities", return: 4.1 },
      { name: "Gold", return: -1.2 },
      { name: "T-Bills", return: 2.8 },
      { name: "EM Debt", return: 9.3 },
    ],
  },
  {
    name: "Inflation",
    growth: "High",
    inflation: "High",
    description:
      "Hot growth and rising prices. Central banks hiking. Real assets and energy outperform.",
    color: "text-orange-400",
    bgColor: "bg-orange-950/40",
    borderColor: "border-orange-500/40",
    assets: [
      { name: "Equities", return: 6.1 },
      { name: "IG Credit", return: -3.4 },
      { name: "Commodities", return: 22.7 },
      { name: "Gold", return: 8.6 },
      { name: "T-Bills", return: 4.2 },
      { name: "EM Debt", return: -5.1 },
    ],
  },
  {
    name: "Stagflation",
    growth: "Low",
    inflation: "High",
    description:
      "Worst of both worlds. Slow growth, elevated inflation. Most assets under pressure.",
    color: "text-red-400",
    bgColor: "bg-red-950/40",
    borderColor: "border-red-500/40",
    assets: [
      { name: "Equities", return: -14.2 },
      { name: "IG Credit", return: -8.3 },
      { name: "Commodities", return: 12.1 },
      { name: "Gold", return: 14.4 },
      { name: "T-Bills", return: 3.6 },
      { name: "EM Debt", return: -18.7 },
    ],
  },
  {
    name: "Deflation",
    growth: "Low",
    inflation: "Low",
    description:
      "Slow growth, falling prices. Central banks cutting. Duration and quality outperform.",
    color: "text-sky-400",
    bgColor: "bg-sky-950/40",
    borderColor: "border-sky-500/40",
    assets: [
      { name: "Equities", return: -8.7 },
      { name: "IG Credit", return: 10.4 },
      { name: "Commodities", return: -16.3 },
      { name: "Gold", return: 6.2 },
      { name: "T-Bills", return: 0.4 },
      { name: "EM Debt", return: -4.8 },
    ],
  },
];

const SIGNAL_STRENGTH = [
  { label: "Equities Momentum", value: 72, color: "bg-emerald-500" },
  { label: "Credit Conditions", value: 58, color: "bg-emerald-500" },
  { label: "Inflation Pressure", value: 41, color: "bg-yellow-500" },
  { label: "Growth Trajectory", value: 65, color: "bg-emerald-500" },
  { label: "USD Strength", value: 53, color: "bg-yellow-500" },
  { label: "Risk Appetite", value: 68, color: "bg-emerald-500" },
];

function genSparkline(base: number, len: number, vol: number): number[] {
  const data: number[] = [base];
  for (let i = 1; i < len; i++) {
    data.push(data[i - 1] + (rand() - 0.5) * vol);
  }
  return data;
}

const LEADING_INDICATORS: LeadingIndicator[] = [
  {
    name: "Yield Curve (10Y-2Y)",
    value: "+0.34%",
    change: "+12bps MoM",
    signal: "green",
    description: "Normalizing from inversion. Historically signals expansion within 6–12 months.",
    sparkData: genSparkline(-0.8, 20, 0.15),
  },
  {
    name: "ISM Manufacturing PMI",
    value: "52.1",
    change: "+1.4 MoM",
    signal: "green",
    description: "Back above 50 expansion threshold. New orders sub-index leading indicator.",
    sparkData: genSparkline(48, 20, 1.2),
  },
  {
    name: "IG Credit Spreads (OAS)",
    value: "98bps",
    change: "-8bps MoM",
    signal: "green",
    description: "Tightening spreads reflect improving risk appetite and lower default expectations.",
    sparkData: genSparkline(140, 20, 8),
  },
  {
    name: "Initial Jobless Claims",
    value: "218K",
    change: "+4K WoW",
    signal: "yellow",
    description: "Slight uptick warrants monitoring. 4-week MA still below 225K warning level.",
    sparkData: genSparkline(210, 20, 6),
  },
  {
    name: "Housing Starts (Annlzd)",
    value: "1.42M",
    change: "-3.2% MoM",
    signal: "yellow",
    description: "Rate sensitivity showing. Affordability constraints weighing on new construction.",
    sparkData: genSparkline(1.55, 20, 0.06),
  },
];

const ASSET_PERF: AssetPerf[] = [
  { asset: "Equities (S&P 500)", hiking: 4.2, peak: -6.8, cutting: 12.4, trough: 24.1 },
  { asset: "Long Duration Bonds", hiking: -14.6, peak: -2.1, cutting: 18.7, trough: 8.3 },
  { asset: "HY Credit", hiking: 2.1, peak: -9.4, cutting: 15.2, trough: 19.8 },
  { asset: "Gold", hiking: -3.2, peak: 8.7, cutting: 6.4, trough: -4.1 },
  { asset: "Energy Stocks", hiking: 18.3, peak: 4.2, cutting: -8.6, trough: -12.4 },
  { asset: "EM Equities", hiking: -8.1, peak: -14.7, cutting: 21.3, trough: 28.6 },
  { asset: "REITs", hiking: -11.2, peak: -3.8, cutting: 16.9, trough: 22.4 },
  { asset: "USD Index", hiking: 8.4, peak: 4.1, cutting: -6.7, trough: -9.2 },
];

const CURRENT_PHASE: CyclePhase = "Cutting";

const CROSS_ASSET_SIGNALS: CrossAssetSignal[] = [
  {
    driver: "USD Index (DXY)",
    direction: "down",
    impact: "Weakening dollar boosts EM equities and commodities via higher USD prices",
    magnitude: "strong",
    assets: [
      { name: "EM Equities", effect: "positive" },
      { name: "Gold", effect: "positive" },
      { name: "Oil (USD)", effect: "positive" },
      { name: "US Multinationals", effect: "positive" },
      { name: "US Importers", effect: "negative" },
    ],
  },
  {
    driver: "WTI Crude Oil",
    direction: "up",
    impact: "Rising oil lifts energy sector but pressures consumer discretionary and margins",
    magnitude: "moderate",
    assets: [
      { name: "Energy Stocks", effect: "positive" },
      { name: "Transports", effect: "negative" },
      { name: "Consumer Disc.", effect: "negative" },
      { name: "CPI Inflation", effect: "negative" },
      { name: "Petro-States FX", effect: "positive" },
    ],
  },
  {
    driver: "VIX (Fear Index)",
    direction: "down",
    impact: "Low volatility supports risk appetite, carry trades, and small-cap outperformance",
    magnitude: "moderate",
    assets: [
      { name: "Small Caps", effect: "positive" },
      { name: "EM Carry", effect: "positive" },
      { name: "Put Premiums", effect: "negative" },
      { name: "Safe Havens", effect: "negative" },
      { name: "Structured Credit", effect: "positive" },
    ],
  },
  {
    driver: "10Y Treasury Yield",
    direction: "down",
    impact: "Falling long rates compress discount rates, extending equity multiples",
    magnitude: "strong",
    assets: [
      { name: "Growth Equities", effect: "positive" },
      { name: "REITs", effect: "positive" },
      { name: "Long Duration", effect: "positive" },
      { name: "Financials", effect: "negative" },
      { name: "USD", effect: "negative" },
    ],
  },
];

const TRADE_IDEAS: TradeIdea[] = [
  {
    id: 1,
    title: "Long EM Equities vs. DM",
    rationale:
      "USD weakness cycle + Fed cutting supports capital flows into emerging markets. China stimulus adds tailwind. EM/DM valuation gap at decade highs.",
    entry: "EEM at $44.20 / VWO at $51.80",
    target: "+18% over 6 months",
    stop: "-8% from entry",
    conviction: "High",
    direction: "long",
    asset: "EEM / VWO",
    catalyst: "Fed cut cycle, China reopening, USD weakness",
  },
  {
    id: 2,
    title: "Short USD / Long JPY",
    rationale:
      "BoJ policy normalization while Fed cuts creates rate differential compression. USDJPY technically extended, positioning crowded short yen.",
    entry: "USDJPY short at 151.50",
    target: "140.00 (7.6% move)",
    stop: "155.00 (-2.3%)",
    conviction: "High",
    direction: "short",
    asset: "USDJPY",
    catalyst: "BoJ rate hikes, Fed pivot, carry unwind",
  },
  {
    id: 3,
    title: "Long Gold / Short T-Bills",
    rationale:
      "Real rates expected to fall as Fed cuts. Central bank gold buying structural. Dollar weakness and geopolitical tail risk premium support gold.",
    entry: "GLD at $218.40",
    target: "$245 (+12.2%)",
    stop: "$205 (-6.1%)",
    conviction: "Medium",
    direction: "long",
    asset: "GLD / XAUUSD",
    catalyst: "Real rate decline, CB demand, USD debasement",
  },
  {
    id: 4,
    title: "Long Duration Treasuries",
    rationale:
      "If growth slows more than expected, 10Y yields have room to rally. Curve steepening trade with potential 15–20pt gain on 20Y+ maturity.",
    entry: "TLT at $92.50 / 10Y yield at 4.35%",
    target: "10Y yield 3.75% (TLT ~$102)",
    stop: "10Y yield 4.75% (TLT ~$84)",
    conviction: "Medium",
    direction: "long",
    asset: "TLT / ZN Futures",
    catalyst: "Growth slowdown, disinflationary data, risk-off",
  },
  {
    id: 5,
    title: "Short Energy / Long Utilities",
    rationale:
      "Oil demand outlook softening on China growth miss. Utilities benefit from rate cuts and defensive rotation. Sector pairs trade with low beta to macro.",
    entry: "Long XLU / Short XLE ratio at 0.68",
    target: "Ratio 0.76 (+11.8%)",
    stop: "Ratio 0.63 (-7.4%)",
    conviction: "Low",
    direction: "short",
    asset: "XLE / XLU spread",
    catalyst: "Demand slowdown, rate cuts, defensive rotation",
  },
];

// ── Helper Components ──────────────────────────────────────────────────────────

function SignalDot({ color }: { color: SignalColor }) {
  const cls =
    color === "green"
      ? "bg-emerald-500"
      : color === "yellow"
      ? "bg-yellow-500"
      : "bg-red-500";
  return <span className={cn("inline-block w-2.5 h-2.5 rounded-full", cls)} />;
}

function SignalIcon({ color }: { color: SignalColor }) {
  if (color === "green")
    return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
  if (color === "yellow")
    return <MinusCircle className="w-4 h-4 text-yellow-400 shrink-0" />;
  return <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />;
}

function Sparkline({ data, color = "#34d399" }: { data: number[]; color?: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReturnBadge({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span
      className={cn(
        "text-xs font-mono font-semibold tabular-nums",
        pos ? "text-emerald-400" : "text-red-400"
      )}
    >
      {pos ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function ConvictionBadge({ level }: { level: Conviction }) {
  const cls =
    level === "High"
      ? "bg-emerald-900/60 text-emerald-300 border-emerald-700/50"
      : level === "Medium"
      ? "bg-yellow-900/60 text-yellow-300 border-yellow-700/50"
      : "bg-muted text-muted-foreground border-border/50";
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", cls)}>
      {level}
    </span>
  );
}

// ── Tab 1: Regime Dashboard ────────────────────────────────────────────────────

const CURRENT_REGIME: Regime = "Goldilocks";

function RegimeDashboard() {
  const current = REGIMES.find((r) => r.name === CURRENT_REGIME)!;

  return (
    <div className="space-y-6">
      {/* 2×2 Quadrant */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            Economic Regime Quadrant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Axis labels */}
            <div className="flex justify-between text-xs text-muted-foreground mb-1 px-12">
              <span>Low Inflation</span>
              <span>High Inflation</span>
            </div>
            <div className="flex gap-0.5">
              {/* Y axis */}
              <div className="flex flex-col justify-between text-xs text-muted-foreground pr-2 w-12 shrink-0">
                <span className="text-right leading-tight">High Growth</span>
                <span className="text-right leading-tight">Low Growth</span>
              </div>
              {/* Grid */}
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1.5">
                {REGIMES.map((r) => {
                  const active = r.name === CURRENT_REGIME;
                  return (
                    <motion.div
                      key={r.name}
                      className={cn(
                        "rounded-lg p-3 border transition-all",
                        r.bgColor,
                        r.borderColor,
                        active ? "ring-2 ring-foreground/20 scale-[1.02]" : "opacity-70"
                      )}
                      animate={active ? { scale: 1.02 } : { scale: 1 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-sm font-semibold", r.color)}>{r.name}</span>
                        {active && (
                          <Badge className="text-xs px-1.5 py-0 bg-foreground/10 text-foreground border-border">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">{r.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signal Strength Meters */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Regime Signal Strength
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SIGNAL_STRENGTH.map((sig) => (
              <div key={sig.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{sig.label}</span>
                  <span className="text-muted-foreground font-mono">{sig.value}/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", sig.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${sig.value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset Returns by Regime */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Asset Class Returns by Regime (Historical Avg)
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-muted-foreground py-2 pr-4 font-medium">Asset</th>
                {REGIMES.map((r) => (
                  <th
                    key={r.name}
                    className={cn(
                      "text-center py-2 px-3 font-medium",
                      r.name === CURRENT_REGIME ? r.color : "text-muted-foreground"
                    )}
                  >
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REGIMES[0].assets.map((asset, i) => (
                <tr key={asset.name} className="border-b border-border/50">
                  <td className="text-muted-foreground py-2 pr-4">{asset.name}</td>
                  {REGIMES.map((r) => (
                    <td key={r.name} className="text-center py-2 px-3">
                      <ReturnBadge value={r.assets[i].return} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 2: Leading Indicators ──────────────────────────────────────────────────

function LeadingIndicators() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-xs text-center mb-2">
        {(["green", "yellow", "red"] as SignalColor[]).map((c) => {
          const label =
            c === "green" ? "Expansion" : c === "yellow" ? "Caution" : "Contraction";
          const textCls =
            c === "green"
              ? "text-emerald-400"
              : c === "yellow"
              ? "text-yellow-400"
              : "text-red-400";
          return (
            <div
              key={c}
              className={cn(
                "rounded-lg p-2 border flex items-center justify-center gap-2",
                c === "green"
                  ? "bg-emerald-950/30 border-emerald-700/30"
                  : c === "yellow"
                  ? "bg-yellow-950/30 border-yellow-700/30"
                  : "bg-red-950/30 border-red-700/30"
              )}
            >
              <SignalDot color={c} />
              <span className={textCls}>{label}</span>
            </div>
          );
        })}
      </div>

      {LEADING_INDICATORS.map((ind, i) => {
        const sparkColor =
          ind.signal === "green" ? "#34d399" : ind.signal === "yellow" ? "#fbbf24" : "#f87171";
        return (
          <motion.div
            key={ind.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="bg-card/60 border-border/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <SignalIcon color={ind.signal} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{ind.name}</span>
                        <span className="text-base font-mono font-semibold text-foreground">
                          {ind.value}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-mono",
                            ind.change.startsWith("+") || ind.change.startsWith("-8")
                              ? "text-emerald-400"
                              : "text-muted-foreground"
                          )}
                        >
                          {ind.change}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{ind.description}</p>
                    </div>
                  </div>
                  <Sparkline data={ind.sparkData} color={sparkColor} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Tab 3: Rate Cycle Playbook ─────────────────────────────────────────────────

const PHASE_INFO: Record<
  CyclePhase,
  { color: string; bg: string; border: string; description: string; angle: number }
> = {
  Hiking: {
    color: "text-orange-400",
    bg: "bg-orange-950/40",
    border: "border-orange-500/40",
    description: "Fed raising rates to cool inflation. USD strong, bonds under pressure.",
    angle: 45,
  },
  Peak: {
    color: "text-red-400",
    bg: "bg-red-950/40",
    border: "border-red-500/40",
    description: "Rates at terminal level. Peak hawkishness. Uncertainty peaks. Volatility rises.",
    angle: 135,
  },
  Cutting: {
    color: "text-emerald-400",
    bg: "bg-emerald-950/40",
    border: "border-emerald-500/40",
    description: "Fed lowering rates. Risk assets rally. Duration outperforms. EM recovers.",
    angle: 225,
  },
  Trough: {
    color: "text-sky-400",
    bg: "bg-sky-950/40",
    border: "border-sky-500/40",
    description: "Rates near zero. Liquidity abundant. Credit expansion. Equities in full bull mode.",
    angle: 315,
  },
};

const CYCLE_PHASES: CyclePhase[] = ["Hiking", "Peak", "Cutting", "Trough"];

function CycleWheel({ currentPhase }: { currentPhase: CyclePhase }) {
  const cx = 120;
  const cy = 120;
  const r = 80;
  const phases = CYCLE_PHASES;

  return (
    <svg width={240} height={240} className="mx-auto">
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke="#1e293b" strokeWidth={20} />

      {/* Phase arcs */}
      {phases.map((phase, i) => {
        const startAngle = (i * 90 - 90) * (Math.PI / 180);
        const endAngle = ((i + 1) * 90 - 90) * (Math.PI / 180);
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const active = phase === currentPhase;

        const strokeColor =
          phase === "Hiking"
            ? "#f97316"
            : phase === "Peak"
            ? "#ef4444"
            : phase === "Cutting"
            ? "#10b981"
            : "#38bdf8";

        return (
          <g key={phase}>
            <path
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
              fill={active ? strokeColor + "30" : "transparent"}
              stroke={active ? strokeColor : strokeColor + "40"}
              strokeWidth={active ? 2 : 1}
            />
            {/* Phase label */}
            {(() => {
              const midAngle = (i * 90 + 45 - 90) * (Math.PI / 180);
              const lx = cx + (r * 0.65) * Math.cos(midAngle);
              const ly = cy + (r * 0.65) * Math.sin(midAngle);
              return (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={active ? 10 : 9}
                  fontWeight={active ? "700" : "400"}
                  fill={active ? strokeColor : "#64748b"}
                >
                  {phase}
                </text>
              );
            })()}
          </g>
        );
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={8} fill="#0f172a" stroke="#334155" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={3} fill="#94a3b8" />

      {/* Arrow indicating current phase */}
      {(() => {
        const phaseIndex = phases.indexOf(currentPhase);
        const midAngle = (phaseIndex * 90 + 45 - 90) * (Math.PI / 180);
        const ax = cx + 18 * Math.cos(midAngle);
        const ay = cy + 18 * Math.sin(midAngle);
        const strokeColor =
          currentPhase === "Hiking"
            ? "#f97316"
            : currentPhase === "Peak"
            ? "#ef4444"
            : currentPhase === "Cutting"
            ? "#10b981"
            : "#38bdf8";
        return (
          <line
            x1={cx}
            y1={cy}
            x2={ax}
            y2={ay}
            stroke={strokeColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })()}
    </svg>
  );
}

function RateCyclePlaybook() {
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase>(CURRENT_PHASE);
  const info = PHASE_INFO[selectedPhase];

  return (
    <div className="space-y-6">
      {/* Cycle Wheel + Phase Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-sky-400" />
              Rate Cycle Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CycleWheel currentPhase={CURRENT_PHASE} />
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Current Phase:</span>
              <span className="text-sm font-medium text-emerald-400">{CURRENT_PHASE}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Phase Selector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {CYCLE_PHASES.map((phase) => {
              const pi = PHASE_INFO[phase];
              const active = phase === selectedPhase;
              return (
                <button
                  key={phase}
                  onClick={() => setSelectedPhase(phase)}
                  className={cn(
                    "w-full text-left rounded-lg p-3 border transition-all",
                    active ? cn(pi.bg, pi.border) : "bg-muted/40 border-border/30 hover:bg-muted/70"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-medium", active ? pi.color : "text-muted-foreground")}>
                      {phase}
                    </span>
                    {phase === CURRENT_PHASE && (
                      <Badge className="text-xs px-1.5 bg-foreground/10 text-foreground border-border">
                        Now
                      </Badge>
                    )}
                  </div>
                  {active && (
                    <p className="text-xs text-muted-foreground mt-1">{pi.description}</p>
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Asset Performance Table */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Historical Asset Performance per Rate Cycle Phase
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-muted-foreground py-2 pr-4 font-medium">Asset</th>
                {CYCLE_PHASES.map((ph) => (
                  <th
                    key={ph}
                    className={cn(
                      "text-center py-2 px-3 font-medium",
                      ph === selectedPhase ? PHASE_INFO[ph].color : "text-muted-foreground"
                    )}
                  >
                    {ph}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASSET_PERF.map((row) => (
                <tr key={row.asset} className="border-b border-border/50">
                  <td className="text-muted-foreground py-2 pr-4 whitespace-nowrap">{row.asset}</td>
                  {(["hiking", "peak", "cutting", "trough"] as const).map((ph, i) => (
                    <td
                      key={ph}
                      className={cn(
                        "text-center py-2 px-3",
                        CYCLE_PHASES[i] === selectedPhase ? "bg-muted/40 rounded" : ""
                      )}
                    >
                      <ReturnBadge value={row[ph]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 4: Cross-Asset Signals ─────────────────────────────────────────────────

function MagnitudeBadge({ magnitude }: { magnitude: CrossAssetSignal["magnitude"] }) {
  const cls =
    magnitude === "strong"
      ? "bg-muted text-primary border-border"
      : magnitude === "moderate"
      ? "bg-muted text-primary border-border"
      : "bg-muted text-muted-foreground border-border/50";
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border capitalize", cls)}>
      {magnitude}
    </span>
  );
}

function EffectChip({ effect }: { effect: "positive" | "negative" | "neutral" }) {
  if (effect === "positive")
    return (
      <ArrowUpRight className="inline w-3 h-3 text-emerald-400 mr-0.5" />
    );
  if (effect === "negative")
    return <ArrowDownRight className="inline w-3 h-3 text-red-400 mr-0.5" />;
  return <MinusCircle className="inline w-3 h-3 text-muted-foreground mr-0.5" />;
}

function CrossAssetSignals() {
  return (
    <div className="space-y-4">
      {CROSS_ASSET_SIGNALS.map((sig, i) => {
        const dirIcon =
          sig.direction === "up" ? (
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
          );

        return (
          <motion.div
            key={sig.driver}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="bg-card/60 border-border/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  {dirIcon}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-sm font-medium text-foreground">{sig.driver}</span>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          sig.direction === "up"
                            ? "bg-emerald-900/60 text-emerald-300"
                            : "bg-red-900/60 text-red-300"
                        )}
                      >
                        {sig.direction === "up" ? "Rising" : "Falling"}
                      </span>
                      <MagnitudeBadge magnitude={sig.magnitude} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{sig.impact}</p>
                    <div className="flex flex-wrap gap-2">
                      {sig.assets.map((a) => {
                        const cls =
                          a.effect === "positive"
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-700/30"
                            : a.effect === "negative"
                            ? "bg-red-950/40 text-red-300 border-red-700/30"
                            : "bg-muted/60 text-muted-foreground border-border/30";
                        return (
                          <span
                            key={a.name}
                            className={cn("text-xs px-2 py-1 rounded-md border flex items-center gap-0.5", cls)}
                          >
                            <EffectChip effect={a.effect} />
                            {a.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Dollar Index SVG Bar Chart */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            USD Correlation Map (12-month rolling)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const correlations = [
              { label: "Gold", value: -0.72 },
              { label: "Oil", value: -0.48 },
              { label: "EM Equities", value: -0.64 },
              { label: "US Bonds", value: 0.38 },
              { label: "EUR/USD", value: -0.91 },
              { label: "Commodities", value: -0.55 },
            ];
            return (
              <div className="space-y-2">
                {correlations.map((c) => {
                  const pos = c.value >= 0;
                  const pct = Math.abs(c.value) * 100;
                  return (
                    <div key={c.label} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-24 text-right shrink-0">
                        {c.label}
                      </span>
                      <div className="flex-1 flex items-center gap-1">
                        {/* Negative side */}
                        <div className="flex-1 flex justify-end">
                          {!pos && (
                            <motion.div
                              className="h-4 bg-red-500/70 rounded-l-sm"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7 }}
                            />
                          )}
                        </div>
                        {/* Center line */}
                        <div className="w-px h-5 bg-muted" />
                        {/* Positive side */}
                        <div className="flex-1">
                          {pos && (
                            <motion.div
                              className="h-4 bg-emerald-500/70 rounded-r-sm"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7 }}
                            />
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-mono w-10 text-right shrink-0",
                          pos ? "text-emerald-400" : "text-red-400"
                        )}
                      >
                        {c.value.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-xs text-muted-foreground mt-1 px-24">
                  <span>-1.0 (inverse)</span>
                  <span>+1.0 (direct)</span>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 5: Trade Ideas ─────────────────────────────────────────────────────────

function TradeIdeas() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-2">
        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
        Educational content only. Not financial advice. Always conduct your own due diligence.
      </div>

      {TRADE_IDEAS.map((idea, i) => {
        const isOpen = expanded === idea.id;
        const dirColor =
          idea.direction === "long" ? "text-emerald-400" : "text-red-400";
        const dirBg =
          idea.direction === "long"
            ? "bg-emerald-900/50 border-emerald-700/40"
            : "bg-red-900/50 border-red-700/40";

        return (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card
              className={cn(
                "bg-card/60 border-border/50 cursor-pointer transition-all hover:border-border/70",
                isOpen && "border-border/80"
              )}
              onClick={() => setExpanded(isOpen ? null : idea.id)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={cn(
                        "mt-0.5 rounded-md border px-2 py-0.5 text-xs font-medium uppercase shrink-0",
                        dirBg,
                        dirColor
                      )}
                    >
                      {idea.direction}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-foreground">{idea.title}</span>
                        <ConvictionBadge level={idea.conviction} />
                      </div>
                      <span className="text-xs text-muted-foreground">{idea.asset}</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 mt-1"
                  >
                    <TrendingUp className="w-4 h-4 text-muted-foreground rotate-90" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <span className="text-muted-foreground font-medium">Rationale: </span>
                          {idea.rationale}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-muted/50 rounded-lg p-3 border border-border/30">
                            <div className="text-xs text-muted-foreground uppercase mb-1">Entry</div>
                            <div className="text-xs text-foreground font-medium">{idea.entry}</div>
                          </div>
                          <div className="bg-emerald-950/30 rounded-lg p-3 border border-emerald-700/30">
                            <div className="text-xs text-emerald-500 uppercase mb-1">Target</div>
                            <div className="text-xs text-emerald-300 font-medium">{idea.target}</div>
                          </div>
                          <div className="bg-red-950/30 rounded-lg p-3 border border-red-700/30">
                            <div className="text-xs text-red-500 uppercase mb-1">Stop Loss</div>
                            <div className="text-xs text-red-300 font-medium">{idea.stop}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                          <span className="text-muted-foreground">
                            <span className="text-muted-foreground">Catalyst: </span>
                            {idea.catalyst}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Summary SVG Bar Chart — Conviction Breakdown */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Conviction Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const counts: Record<Conviction, number> = { High: 0, Medium: 0, Low: 0 };
            TRADE_IDEAS.forEach((t) => counts[t.conviction]++);
            const total = TRADE_IDEAS.length;
            const bars: { label: Conviction; count: number; color: string }[] = [
              { label: "High", count: counts.High, color: "#10b981" },
              { label: "Medium", count: counts.Medium, color: "#fbbf24" },
              { label: "Low", count: counts.Low, color: "#64748b" },
            ];
            const svgW = 280;
            const svgH = 80;
            const barW = 60;
            const gap = 20;
            const maxH = 60;

            return (
              <svg width={svgW} height={svgH} className="mx-auto">
                {bars.map((b, i) => {
                  const bh = (b.count / total) * maxH;
                  const bx = i * (barW + gap) + 20;
                  const by = svgH - 18 - bh;
                  return (
                    <g key={b.label}>
                      <rect x={bx} y={by} width={barW} height={bh} rx={4} fill={b.color + "80"} />
                      <rect x={bx} y={by} width={barW} height={2} rx={1} fill={b.color} />
                      <text
                        x={bx + barW / 2}
                        y={svgH - 4}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#94a3b8"
                      >
                        {b.label}
                      </text>
                      <text
                        x={bx + barW / 2}
                        y={by - 3}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight="600"
                        fill={b.color}
                      >
                        {b.count}
                      </text>
                    </g>
                  );
                })}
              </svg>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

const TABS = [
  { value: "regime", label: "Regime Dashboard", icon: Activity },
  { value: "leading", label: "Leading Indicators", icon: BarChart2 },
  { value: "ratecycle", label: "Rate Cycle", icon: RefreshCw },
  { value: "crossasset", label: "Cross-Asset", icon: Globe },
  { value: "ideas", label: "Trade Ideas", icon: Target },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function MacroTradingPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("regime");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-400" />
              Macro Trading
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Economic regime analysis, rate cycle playbook, and cross-asset signals
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">Regime:</span>
            <Badge className="bg-emerald-900/60 text-emerald-300 border-emerald-700/50 border">
              {CURRENT_REGIME}
            </Badge>
            <Badge className="bg-emerald-900/60 text-emerald-300 border-emerald-700/50 border">
              {CURRENT_PHASE} Cycle
            </Badge>
          </div>
        </div>

        {/* Hero */}
        <div className="rounded-md border border-border bg-card border-l-4 border-l-primary p-6">
          <h2 className="text-lg font-medium text-foreground mb-1">Macro Trading Playbook</h2>
          <p className="text-sm text-muted-foreground">Economic regime analysis, rate cycle playbook, leading indicators, and cross-asset signal generation.</p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          className="w-full mt-8"
        >
          <TabsList className="flex w-full overflow-x-auto gap-1 bg-card/60 border border-border/50 p-1 rounded-md h-auto">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-2 rounded-lg data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="regime" className="mt-4 data-[state=inactive]:hidden">
            <RegimeDashboard />
          </TabsContent>

          <TabsContent value="leading" className="mt-4 data-[state=inactive]:hidden">
            <LeadingIndicators />
          </TabsContent>

          <TabsContent value="ratecycle" className="mt-4 data-[state=inactive]:hidden">
            <RateCyclePlaybook />
          </TabsContent>

          <TabsContent value="crossasset" className="mt-4 data-[state=inactive]:hidden">
            <CrossAssetSignals />
          </TabsContent>

          <TabsContent value="ideas" className="mt-4 data-[state=inactive]:hidden">
            <TradeIdeas />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
