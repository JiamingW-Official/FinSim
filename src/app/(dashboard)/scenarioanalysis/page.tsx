"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Activity,
  Zap,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Seeded PRNG — seed 732006
// ---------------------------------------------------------------------------
let s = 732006;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate values at module init so they remain stable across renders
const PRNG_CACHE = Array.from({ length: 200 }, () => rand());

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScenarioParams {
  gdpGrowth: number;       // % YoY, range -5 to +6
  inflation: number;       // % CPI, range 0 to 12
  fedFundsRate: number;    // %, range 0 to 10
  creditSpreads: number;   // bps, range 0 to 800
  equityValuation: number; // Shiller CAPE, range 8 to 40
}

interface AssetReturn {
  asset: string;
  ticker: string;
  base: number;
  bull: number;
  bear: number;
}

interface HistoricalStress {
  name: string;
  year: string;
  spx: number;
  bonds: number;
  gold: number;
  realestate: number;
  commodities: number;
  em: number;
  description: string;
  vix: number;
}

interface SensitivityFactor {
  factor: string;
  shock: string;
  equity: number;
  bonds: number;
  usd: number;
  gold: number;
  credit: number;
}

interface ReverseStressPath {
  lossLevel: number;
  triggers: string[];
  probability: string;
  timeframe: string;
  liquidityRisk: "Low" | "Medium" | "High" | "Extreme";
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const HISTORICAL_STRESSES: HistoricalStress[] = [
  {
    name: "2008 Global Financial Crisis",
    year: "2008",
    spx: -56.8,
    bonds: 5.2,
    gold: 5.5,
    realestate: -42.1,
    commodities: -54.3,
    em: -53.2,
    description: "Subprime mortgage collapse, Lehman default, global credit freeze",
    vix: 89.5,
  },
  {
    name: "2020 COVID Crash",
    year: "2020",
    spx: -33.9,
    bonds: 8.1,
    gold: 6.9,
    realestate: -15.2,
    commodities: -23.1,
    em: -31.4,
    description: "Global pandemic shock, fastest 30% decline in history",
    vix: 82.7,
  },
  {
    name: "2022 Rate Shock",
    year: "2022",
    spx: -24.5,
    bonds: -13.2,
    gold: -0.3,
    realestate: -19.4,
    commodities: 16.2,
    em: -22.1,
    description: "Fed raised rates 425bps; 60/40 portfolio worst year since 1937",
    vix: 36.4,
  },
  {
    name: "1987 Black Monday",
    year: "1987",
    spx: -33.2,
    bonds: 2.1,
    gold: 6.8,
    realestate: 3.4,
    commodities: -8.7,
    em: -29.1,
    description: "Portfolio insurance cascade; Dow fell 22.6% in single day",
    vix: 150.0,
  },
  {
    name: "2000–02 Dot-Com Bust",
    year: "2000",
    spx: -49.1,
    bonds: 11.4,
    gold: 12.1,
    realestate: 8.2,
    commodities: 14.3,
    em: -18.7,
    description: "NASDAQ -78%; tech speculation unwind over 30 months",
    vix: 43.1,
  },
  {
    name: "1994 Bond Massacre",
    year: "1994",
    spx: -1.5,
    bonds: -2.9,
    gold: -2.2,
    realestate: -5.1,
    commodities: 18.6,
    em: -14.3,
    description: "Fed doubled rates in 12 months; worst bond year since 1920s",
    vix: 23.8,
  },
  {
    name: "1997 EM / Asia Crisis",
    year: "1997",
    spx: 31.0,
    bonds: 9.8,
    gold: -21.4,
    realestate: 6.3,
    commodities: -12.1,
    em: -42.8,
    description: "Thai baht devaluation triggered Asian contagion + Russia default",
    vix: 38.2,
  },
  {
    name: "2011 EU Debt Crisis",
    year: "2011",
    spx: -19.4,
    bonds: 8.7,
    gold: 10.2,
    realestate: -9.8,
    commodities: -5.1,
    em: -20.3,
    description: "Greece/Italy sovereign stress; ECB intervened with 'whatever it takes'",
    vix: 48.0,
  },
];

const SENSITIVITY_FACTORS: SensitivityFactor[] = [
  {
    factor: "Interest Rates",
    shock: "+100 bps",
    equity: -8.2,
    bonds: -6.7,
    usd: 2.4,
    gold: -3.1,
    credit: -4.2,
  },
  {
    factor: "USD Strength",
    shock: "+10%",
    equity: -4.6,
    bonds: 1.2,
    usd: 10.0,
    gold: -8.1,
    credit: -2.8,
  },
  {
    factor: "Oil Price",
    shock: "+50%",
    equity: -3.1,
    bonds: -2.4,
    usd: -1.8,
    gold: 4.2,
    credit: -3.6,
  },
  {
    factor: "Credit Spreads",
    shock: "+200 bps",
    equity: -14.3,
    bonds: -9.8,
    usd: 1.9,
    gold: 2.7,
    credit: -12.4,
  },
  {
    factor: "VIX / Volatility",
    shock: "+20 pts",
    equity: -11.7,
    bonds: 3.4,
    usd: 2.1,
    gold: 5.8,
    credit: -7.3,
  },
];

const REVERSE_STRESS_PATHS: ReverseStressPath[] = [
  {
    lossLevel: 20,
    triggers: [
      "Equity drawdown of -25% from current levels",
      "Credit spread widening +150bps concurrent with rate rise",
      "Portfolio beta of 1.0 — no diversification buffer",
    ],
    probability: "12–18%",
    timeframe: "12 months",
    liquidityRisk: "Medium",
  },
  {
    lossLevel: 30,
    triggers: [
      "Simultaneous equity -35% and bonds -12% (2022-style)",
      "Dollar surge +15% pressuring EM holdings",
      "Forced deleveraging loop amplifies losses by 1.4×",
    ],
    probability: "5–8%",
    timeframe: "18 months",
    liquidityRisk: "High",
  },
  {
    lossLevel: 50,
    triggers: [
      "Systemic credit event: major bank failure (Lehman-scale)",
      "Correlated asset collapse — all risk assets sell simultaneously",
      "Liquidity spiral: bid/ask spreads widen 10×, margin calls cascade",
      "Central bank policy error: late intervention extends drawdown",
    ],
    probability: "1–3%",
    timeframe: "24 months",
    liquidityRisk: "Extreme",
  },
];

// ---------------------------------------------------------------------------
// Derived asset-return calculation from macro params
// ---------------------------------------------------------------------------

function computeAssetReturns(
  params: ScenarioParams,
  mode: "base" | "bull" | "bear"
): AssetReturn[] {
  const { gdpGrowth, inflation, fedFundsRate, creditSpreads, equityValuation } = params;

  const riskPremium = (gdpGrowth - 2) * 1.8;
  const rateHurdle = -(fedFundsRate - 2.5) * 2.1;
  const creditDrag = -(creditSpreads - 150) * 0.012;
  const valuationFactor = -(equityValuation - 22) * 0.5;
  const inflationEffect = inflation < 4 ? (inflation - 2) * 0.3 : -(inflation - 4) * 1.2;

  const equityBase = 5 + riskPremium + rateHurdle * 0.5 + valuationFactor + inflationEffect;
  const bondBase = 2.5 + rateHurdle * 0.8 + creditDrag * 0.4;
  const goldBase = inflation > 4 ? (inflation - 4) * 2.1 + rateHurdle * 0.3 : rateHurdle * 0.4;
  const reitBase = equityBase * 0.85 + rateHurdle * 0.4;
  const commodBase = (inflation - 2) * 1.5 + gdpGrowth * 0.6;
  const emBase = equityBase * 1.2 + rateHurdle * 0.6 - (fedFundsRate > 4 ? (fedFundsRate - 4) * 1.8 : 0);
  const techBase = equityBase * 1.4 + valuationFactor * 0.6;
  const creditBase = bondBase + creditDrag * 2;

  const multiplier = mode === "bull" ? 1.4 : mode === "bear" ? 0.55 : 1.0;
  const offset = mode === "bull" ? 3 : mode === "bear" ? -5 : 0;

  const make = (asset: string, ticker: string, base: number): AssetReturn => ({
    asset,
    ticker,
    base: Math.round(base * 10) / 10,
    bull: Math.round((base * multiplier + offset + 2) * 10) / 10,
    bear: Math.round((base * 0.55 - 5) * 10) / 10,
  });

  return [
    make("US Equities", "SPY", equityBase),
    make("Tech / Growth", "QQQ", techBase),
    make("US Treasuries", "TLT", bondBase),
    make("Investment Grade Credit", "LQD", creditBase),
    make("Gold", "GLD", goldBase),
    make("Real Estate", "VNQ", reitBase),
    make("Commodities", "DJP", commodBase),
    make("Emerging Markets", "EEM", emBase),
  ];
}

// ---------------------------------------------------------------------------
// Tail risk (SVaR) computation — synthetic histogram bins
// ---------------------------------------------------------------------------

function computeTailRisk(creditSpreads: number, fedFundsRate: number) {
  // Stressed VaR shifts distribution left
  const stressShift = (creditSpreads - 150) * 0.006 + Math.max(0, fedFundsRate - 3) * 0.4;
  const svar95 = -(12.4 + stressShift);
  const svar99 = -(19.8 + stressShift * 1.3);
  const expectedShortfall = -(24.6 + stressShift * 1.5);

  // 20 histogram bins from -35 to +20
  const bins: { midpoint: number; freq: number }[] = [];
  for (let i = 0; i < 20; i++) {
    const lo = -35 + i * 2.75;
    const mid = lo + 1.375;
    const z = (mid + stressShift * 0.5 + 2) / 7.5;
    const freq = Math.exp(-0.5 * z * z) * (1 + PRNG_CACHE[i] * 0.15 - 0.075);
    bins.push({ midpoint: Math.round(mid * 10) / 10, freq: Math.max(0.01, freq) });
  }

  const sectorConcentration = [
    { sector: "Technology", weight: 28 + PRNG_CACHE[100] * 4, tailCorr: 0.78 },
    { sector: "Financials", weight: 18 + PRNG_CACHE[101] * 3, tailCorr: 0.82 },
    { sector: "Healthcare", weight: 14 + PRNG_CACHE[102] * 2, tailCorr: 0.51 },
    { sector: "Consumer Disc.", weight: 12 + PRNG_CACHE[103] * 2, tailCorr: 0.66 },
    { sector: "Industrials", weight: 10 + PRNG_CACHE[104] * 2, tailCorr: 0.61 },
    { sector: "Energy", weight: 9 + PRNG_CACHE[105] * 2, tailCorr: 0.57 },
    { sector: "Other", weight: 9 + PRNG_CACHE[106] * 1, tailCorr: 0.44 },
  ];

  return { svar95, svar99, expectedShortfall, bins, sectorConcentration };
}

// ---------------------------------------------------------------------------
// SVG: Tail Distribution Histogram
// ---------------------------------------------------------------------------

function TailHistogram({
  bins,
  svar95,
  svar99,
}: {
  bins: { midpoint: number; freq: number }[];
  svar95: number;
  svar99: number;
}) {
  const W = 520;
  const H = 160;
  const pad = { l: 44, r: 16, t: 16, b: 36 };
  const gW = W - pad.l - pad.r;
  const gH = H - pad.t - pad.b;

  const maxFreq = Math.max(...bins.map((b) => b.freq));
  const xMin = bins[0].midpoint - 1.4;
  const xMax = bins[bins.length - 1].midpoint + 1.4;
  const xRange = xMax - xMin;

  const toX = (v: number) => pad.l + ((v - xMin) / xRange) * gW;
  const toY = (f: number) => pad.t + gH - (f / maxFreq) * gH;

  const barW = gW / bins.length - 1;

  // X-axis ticks
  const xTicks = [-30, -20, -10, 0, 10, 20];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1.0].map((f) => (
        <line
          key={f}
          x1={pad.l}
          x2={W - pad.r}
          y1={pad.t + gH - f * gH}
          y2={pad.t + gH - f * gH}
          stroke="currentColor" className="text-border"
          strokeWidth={1}
        />
      ))}

      {/* Bars */}
      {bins.map((b, i) => {
        const bx = toX(b.midpoint) - barW / 2;
        const by = toY(b.freq);
        const bh = gH - (by - pad.t);
        const isTailLoss = b.midpoint < svar99;
        const isModLoss = b.midpoint < svar95 && b.midpoint >= svar99;
        const fill = isTailLoss
          ? "var(--chart-2)"
          : isModLoss
          ? "var(--chart-4)"
          : b.midpoint < 0
          ? "var(--muted-foreground)"
          : "var(--chart-1)";
        return (
          <rect
            key={i}
            x={bx}
            y={by}
            width={barW}
            height={Math.max(bh, 0)}
            fill={fill}
            fillOpacity={0.8}
            rx={1}
          />
        );
      })}

      {/* SVaR 95 line */}
      <line
        x1={toX(svar95)}
        x2={toX(svar95)}
        y1={pad.t}
        y2={H - pad.b}
        stroke="var(--chart-4)"
        strokeWidth={1.5}
        strokeDasharray="4,3"
      />
      <text x={toX(svar95) + 3} y={pad.t + 10} fill="var(--chart-4)" fontSize={9}>
        SVaR95
      </text>

      {/* SVaR 99 line */}
      <line
        x1={toX(svar99)}
        x2={toX(svar99)}
        y1={pad.t}
        y2={H - pad.b}
        stroke="var(--chart-2)"
        strokeWidth={1.5}
        strokeDasharray="4,3"
      />
      <text x={toX(svar99) - 32} y={pad.t + 10} fill="var(--chart-2)" fontSize={9}>
        SVaR99
      </text>

      {/* Axes */}
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="currentColor" className="text-muted-foreground/40" strokeWidth={1} />
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} stroke="currentColor" className="text-muted-foreground/40" strokeWidth={1} />

      {/* X ticks */}
      {xTicks.map((t) => (
        <g key={t}>
          <line x1={toX(t)} x2={toX(t)} y1={H - pad.b} y2={H - pad.b + 4} stroke="currentColor" className="text-muted-foreground" strokeWidth={1} />
          <text x={toX(t)} y={H - pad.b + 14} textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize={9}>
            {t > 0 ? `+${t}` : t}%
          </text>
        </g>
      ))}

      {/* Y label */}
      <text
        x={10}
        y={pad.t + gH / 2}
        textAnchor="middle"
        fill="currentColor" className="text-muted-foreground"
        fontSize={9}
        transform={`rotate(-90, 10, ${pad.t + gH / 2})`}
      >
        Freq
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SVG: Tornado Chart (Macro Sensitivity)
// ---------------------------------------------------------------------------

function TornadoChart({ factors }: { factors: SensitivityFactor[] }) {
  const W = 540;
  const H = 220;
  const pad = { l: 120, r: 80, t: 20, b: 20 };
  const gW = W - pad.l - pad.r;
  const gH = H - pad.t - pad.b;

  const rowH = gH / factors.length;
  const absMax = 16;
  const midX = pad.l + gW / 2;

  const toX = (v: number) => midX + (v / absMax) * (gW / 2);

  const ASSETS = ["equity", "bonds", "gold", "credit"] as const;
  const COLORS: Record<string, string> = {
    equity: "var(--chart-3)",
    bonds: "var(--chart-1)",
    gold: "var(--chart-4)",
    credit: "var(--chart-5)",
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Center line */}
      <line x1={midX} x2={midX} y1={pad.t} y2={H - pad.b} stroke="currentColor" className="text-muted-foreground/40" strokeWidth={1} />

      {/* Zero label */}
      <text x={midX} y={H - pad.b + 14} textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize={9}>
        0%
      </text>

      {/* X axis ticks */}
      {[-12, -8, -4, 4, 8, 12].map((t) => (
        <g key={t}>
          <line
            x1={toX(t)}
            x2={toX(t)}
            y1={pad.t}
            y2={H - pad.b}
            stroke="currentColor" className="text-border"
            strokeWidth={1}
          />
          <text x={toX(t)} y={H - pad.b + 14} textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize={8}>
            {t > 0 ? `+${t}` : t}%
          </text>
        </g>
      ))}

      {/* Rows */}
      {factors.map((f, i) => {
        const cy = pad.t + i * rowH + rowH / 2;
        const barH = rowH * 0.55;

        return (
          <g key={f.factor}>
            {/* Factor label */}
            <text x={pad.l - 6} y={cy + 4} textAnchor="end" fill="currentColor" className="text-foreground" fontSize={10}>
              {f.factor}
            </text>
            <text x={pad.l - 6} y={cy + 14} textAnchor="end" fill="currentColor" className="text-muted-foreground" fontSize={8}>
              {f.shock}
            </text>

            {/* Asset bars stacked */}
            {ASSETS.map((asset, ai) => {
              const val = f[asset];
              const x1 = val < 0 ? toX(val) : midX;
              const x2 = val < 0 ? midX : toX(val);
              const segW = Math.abs(x2 - x1);
              const segY = cy - barH / 2 + (ai * barH) / ASSETS.length;
              const segH = barH / ASSETS.length - 1;
              return (
                <rect
                  key={asset}
                  x={x1}
                  y={segY}
                  width={Math.max(segW, 1)}
                  height={segH}
                  fill={COLORS[asset]}
                  fillOpacity={0.85}
                  rx={1}
                />
              );
            })}

            {/* Value labels */}
            <text
              x={toX(f.equity) + (f.equity < 0 ? -3 : 3)}
              y={cy + 4}
              textAnchor={f.equity < 0 ? "end" : "start"}
              fill="currentColor" className="text-primary"
              fontSize={8}
            >
              {f.equity > 0 ? "+" : ""}
              {f.equity}%
            </text>
          </g>
        );
      })}

      {/* Legend */}
      {ASSETS.map((a, i) => (
        <g key={a} transform={`translate(${W - pad.r + 4}, ${pad.t + i * 18})`}>
          <rect width={8} height={8} fill={COLORS[a]} rx={1} />
          <text x={11} y={8} fill="currentColor" className="text-muted-foreground" fontSize={8}>
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helper: color for return value
// ---------------------------------------------------------------------------

function retColor(v: number) {
  if (v >= 8) return "text-emerald-400";
  if (v >= 2) return "text-green-400";
  if (v >= 0) return "text-muted-foreground";
  if (v >= -5) return "text-orange-400";
  if (v >= -15) return "text-red-400";
  return "text-red-600";
}

function pnlColor(v: number) {
  return v >= 0 ? "text-emerald-400" : "text-red-400";
}

function liquidityColor(l: ReverseStressPath["liquidityRisk"]) {
  if (l === "Low") return "bg-emerald-500/20 text-emerald-400";
  if (l === "Medium") return "bg-yellow-500/20 text-yellow-400";
  if (l === "High") return "bg-orange-500/20 text-orange-400";
  return "bg-red-500/20 text-red-400";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  description,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  description: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const isNeutral = Math.abs(pct - 50) < 10;
  const color = pct < 40 ? "text-emerald-400" : pct < 60 ? "text-muted-foreground" : "text-red-400";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="ml-2 text-xs text-muted-foreground">{description}</span>
        </div>
        <span className={`text-sm font-mono font-semibold tabular-nums ${color}`}>
          {value > 0 && label !== "Credit Spreads" && label !== "CAPE" ? "+" : ""}
          {value}
          {unit}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 1: Scenario Builder
// ---------------------------------------------------------------------------

function ScenarioBuilderTab() {
  const defaultParams: ScenarioParams = {
    gdpGrowth: 2.1,
    inflation: 3.2,
    fedFundsRate: 4.5,
    creditSpreads: 180,
    equityValuation: 24,
  };

  const [params, setParams] = useState<ScenarioParams>(defaultParams);
  const [activeScenario, setActiveScenario] = useState<"base" | "bull" | "bear">("base");

  const set = (k: keyof ScenarioParams) => (v: number) =>
    setParams((p) => ({ ...p, [k]: v }));

  const assets = useMemo(
    () => computeAssetReturns(params, activeScenario),
    [params, activeScenario]
  );

  const presets = {
    recession: {
      gdpGrowth: -1.5,
      inflation: 2.1,
      fedFundsRate: 1.0,
      creditSpreads: 450,
      equityValuation: 16,
    },
    stagflation: {
      gdpGrowth: -0.5,
      inflation: 9.0,
      fedFundsRate: 7.5,
      creditSpreads: 350,
      equityValuation: 18,
    },
    goldilocks: {
      gdpGrowth: 3.5,
      inflation: 2.2,
      fedFundsRate: 3.0,
      creditSpreads: 110,
      equityValuation: 26,
    },
    rateshock: {
      gdpGrowth: 1.8,
      inflation: 6.5,
      fedFundsRate: 8.5,
      creditSpreads: 280,
      equityValuation: 20,
    },
  };

  return (
    <div className="space-y-6">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-2">Quick Presets:</span>
        {(
          [
            ["Soft Landing", "goldilocks", "emerald"],
            ["Recession", "recession", "orange"],
            ["Stagflation", "stagflation", "red"],
            ["Rate Shock", "rateshock", "yellow"],
          ] as [string, keyof typeof presets, string][]
        ).map(([label, key, color]) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            className="h-7 text-xs border-border hover:border-muted-foreground"
            onClick={() => setParams(presets[key])}
          >
            {label}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs border-border hover:border-muted-foreground ml-auto"
          onClick={() => setParams(defaultParams)}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Macro Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <SliderRow
              label="GDP Growth"
              value={params.gdpGrowth}
              min={-5}
              max={6}
              step={0.1}
              unit="%"
              onChange={set("gdpGrowth")}
              description="Annual real"
            />
            <SliderRow
              label="Inflation (CPI)"
              value={params.inflation}
              min={0}
              max={12}
              step={0.1}
              unit="%"
              onChange={set("inflation")}
              description="YoY"
            />
            <SliderRow
              label="Fed Funds Rate"
              value={params.fedFundsRate}
              min={0}
              max={10}
              step={0.25}
              unit="%"
              onChange={set("fedFundsRate")}
              description="Terminal rate"
            />
            <SliderRow
              label="Credit Spreads"
              value={params.creditSpreads}
              min={0}
              max={800}
              step={10}
              unit=" bps"
              onChange={set("creditSpreads")}
              description="IG OAS"
            />
            <SliderRow
              label="CAPE"
              value={params.equityValuation}
              min={8}
              max={40}
              step={0.5}
              unit="×"
              onChange={set("equityValuation")}
              description="Shiller P/E"
            />
          </CardContent>
        </Card>

        {/* Asset Returns */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                12-Month Return Estimates
              </CardTitle>
              <div className="flex gap-1">
                {(["bull", "base", "bear"] as const).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setActiveScenario(sc)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                      activeScenario === sc
                        ? sc === "bull"
                          ? "bg-emerald-600 text-foreground"
                          : sc === "base"
                          ? "bg-primary text-primary-foreground"
                          : "bg-red-600 text-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {sc.charAt(0).toUpperCase() + sc.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assets.map((a) => {
                const val =
                  activeScenario === "bull"
                    ? a.bull
                    : activeScenario === "bear"
                    ? a.bear
                    : a.base;
                const barPct = Math.min(Math.abs(val) / 25, 1) * 100;
                return (
                  <div key={a.ticker} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground font-mono w-8">{a.ticker}</span>
                        <span className="text-muted-foreground">{a.asset}</span>
                      </div>
                      <span className={`font-mono font-medium tabular-nums ${retColor(val)}`}>
                        {val >= 0 ? "+" : ""}
                        {val}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          val >= 0 ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        style={{
                          width: `${barPct}%`,
                          marginLeft: val < 0 ? `${100 - barPct}%` : "0",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Macro regime badge */}
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>
                  Regime:{" "}
                  <span className="text-muted-foreground font-medium">
                    {params.gdpGrowth < 0 && params.inflation > 5
                      ? "Stagflationary"
                      : params.gdpGrowth < 0
                      ? "Contractionary"
                      : params.inflation > 5
                      ? "Inflationary"
                      : params.fedFundsRate > 5
                      ? "Tight Monetary"
                      : params.gdpGrowth > 3 && params.inflation < 3.5
                      ? "Goldilocks"
                      : "Moderate Expansion"}
                  </span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Three-scenario summary table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Three-Scenario Return Matrix (Simulated)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium pr-4">Asset</th>
                  <th className="text-right py-2 text-emerald-400 font-medium px-3">Bull</th>
                  <th className="text-right py-2 text-primary font-medium px-3">Base</th>
                  <th className="text-right py-2 text-red-400 font-medium px-3">Bear</th>
                  <th className="text-right py-2 text-muted-foreground font-medium pl-3">Range</th>
                </tr>
              </thead>
              <tbody>
                {computeAssetReturns(params, "base").map((a) => {
                  const bull = a.bull;
                  const base = a.base;
                  const bear = a.bear;
                  return (
                    <tr key={a.ticker} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 pr-4">
                        <span className="text-muted-foreground">{a.asset}</span>
                        <span className="ml-2 text-muted-foreground font-mono">{a.ticker}</span>
                      </td>
                      <td className={`text-right py-2 px-3 font-mono ${retColor(bull)}`}>
                        {bull >= 0 ? "+" : ""}
                        {bull}%
                      </td>
                      <td className={`text-right py-2 px-3 font-mono ${retColor(base)}`}>
                        {base >= 0 ? "+" : ""}
                        {base}%
                      </td>
                      <td className={`text-right py-2 px-3 font-mono ${retColor(bear)}`}>
                        {bear >= 0 ? "+" : ""}
                        {bear}%
                      </td>
                      <td className="text-right py-2 pl-3 text-muted-foreground font-mono">
                        {Math.round(bull - bear)}pp
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
  );
}

// ---------------------------------------------------------------------------
// Tab 2: Historical Stress Tests
// ---------------------------------------------------------------------------

function HistoricalStressTab() {
  const [selected, setSelected] = useState<HistoricalStress | null>(null);
  const portfolioValue = 100000;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Simulated $100K portfolio (60% equities / 20% bonds / 10% real estate / 10% commodities)
        stress-tested against 8 historical crises. Returns are approximate peak-to-trough moves
        for educational illustration.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Scenario List */}
        <div className="space-y-2">
          {HISTORICAL_STRESSES.map((hs) => {
            const portfolioPnl =
              0.6 * hs.spx + 0.2 * hs.bonds + 0.1 * hs.realestate + 0.1 * hs.commodities;
            const dollarPnl = (portfolioPnl / 100) * portfolioValue;
            const isSelected = selected?.name === hs.name;
            return (
              <button
                key={hs.name}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-border"
                }`}
                onClick={() => setSelected(isSelected ? null : hs)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs border-border text-muted-foreground h-5"
                    >
                      {hs.year}
                    </Badge>
                    <span className="text-sm text-foreground">{hs.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-mono font-medium ${pnlColor(portfolioPnl)}`}
                    >
                      {portfolioPnl >= 0 ? "+" : ""}
                      {portfolioPnl.toFixed(1)}%
                    </span>
                    <span
                      className={`text-xs font-mono ${pnlColor(dollarPnl)}`}
                    >
                      ({dollarPnl >= 0 ? "+" : ""}$
                      {Math.abs(dollarPnl).toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}
                      )
                    </span>
                    {isSelected ? (
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
                        {hs.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        {/* Asset Returns Table */}
        <Card className="bg-card border-border h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Asset Returns by Crisis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground pr-3">Crisis</th>
                    <th className="text-right py-2 text-muted-foreground px-2">SPX</th>
                    <th className="text-right py-2 text-muted-foreground px-2">Bonds</th>
                    <th className="text-right py-2 text-muted-foreground px-2">Gold</th>
                    <th className="text-right py-2 text-muted-foreground px-2">RE</th>
                    <th className="text-right py-2 text-muted-foreground px-2">Cmdty</th>
                    <th className="text-right py-2 text-muted-foreground pl-2">EM</th>
                  </tr>
                </thead>
                <tbody>
                  {HISTORICAL_STRESSES.map((hs) => (
                    <tr
                      key={hs.name}
                      className={`border-b border-border/50 cursor-pointer transition-colors ${
                        selected?.name === hs.name
                          ? "bg-primary/10"
                          : "hover:bg-muted/30"
                      }`}
                      onClick={() => setSelected(selected?.name === hs.name ? null : hs)}
                    >
                      <td className="py-1.5 pr-3 text-muted-foreground">{hs.year}</td>
                      {[hs.spx, hs.bonds, hs.gold, hs.realestate, hs.commodities, hs.em].map(
                        (v, i) => (
                          <td
                            key={i}
                            className={`text-right py-1.5 px-2 font-mono ${pnlColor(v)}`}
                          >
                            {v >= 0 ? "+" : ""}
                            {v}%
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* VIX row */}
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">VIX Peak by Crisis</p>
              <div className="flex flex-wrap gap-2">
                {HISTORICAL_STRESSES.map((hs) => (
                  <div key={hs.name} className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">{hs.year}:</span>
                    <span
                      className={`text-xs font-mono font-medium ${
                        hs.vix > 60 ? "text-red-400" : hs.vix > 35 ? "text-orange-400" : "text-yellow-400"
                      }`}
                    >
                      {hs.vix}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3: Tail Risk
// ---------------------------------------------------------------------------

function TailRiskTab() {
  const [creditSpreads, setCreditSpreads] = useState(180);
  const [fedFundsRate, setFedFundsRate] = useState(4.5);

  const { svar95, svar99, expectedShortfall, bins, sectorConcentration } = useMemo(
    () => computeTailRisk(creditSpreads, fedFundsRate),
    [creditSpreads, fedFundsRate]
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            Credit Spreads (bps): <span className="text-primary font-mono">{creditSpreads}</span>
          </label>
          <Slider
            min={50}
            max={800}
            step={10}
            value={[creditSpreads]}
            onValueChange={([v]) => setCreditSpreads(v)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            Fed Funds Rate: <span className="text-primary font-mono">{fedFundsRate}%</span>
          </label>
          <Slider
            min={0}
            max={10}
            step={0.25}
            value={[fedFundsRate]}
            onValueChange={([v]) => setFedFundsRate(v)}
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Stressed VaR (95%)", value: svar95, sub: "1-day 95% confidence" },
          { label: "Stressed VaR (99%)", value: svar99, sub: "Tail loss threshold" },
          { label: "Expected Shortfall", value: expectedShortfall, sub: "CVaR — avg of tail" },
        ].map((m) => (
          <Card key={m.label} className="bg-card border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold font-mono text-red-400 mt-1">
                {m.value.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Histogram */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-red-400" />
            Stressed Portfolio Return Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TailHistogram bins={bins} svar95={svar95} svar99={svar99} />
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
              Extreme tail (&lt;SVaR99)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" />
              SVaR95–99 zone
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              Gain region
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Sector Concentration & Tail Correlation */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Sector Concentration & Tail Correlation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {sectorConcentration.map((sc) => {
              const corrColor =
                sc.tailCorr >= 0.75
                  ? "text-red-400"
                  : sc.tailCorr >= 0.6
                  ? "text-orange-400"
                  : "text-yellow-400";
              return (
                <div key={sc.sector} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground w-32">{sc.sector}</span>
                    <span className="text-muted-foreground font-mono">
                      {sc.weight.toFixed(1)}% wgt
                    </span>
                    <span className={`font-mono font-medium ${corrColor}`}>
                      ρ={sc.tailCorr.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sc.tailCorr >= 0.75
                          ? "bg-red-500"
                          : sc.tailCorr >= 0.6
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                      }`}
                      style={{ width: `${sc.weight.toFixed(1)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            ρ = tail correlation with market during stress events. Higher = less diversification benefit when it matters most.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 4: Macro Sensitivity (Tornado)
// ---------------------------------------------------------------------------

function MacroSensitivityTab() {
  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Single-factor sensitivity analysis: estimated portfolio impact from each macro shock in
        isolation. Bars show directional impact per asset class.
      </p>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Macro Factor Sensitivity — Tornado Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TornadoChart factors={SENSITIVITY_FACTORS} />
        </CardContent>
      </Card>

      {/* Detail table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Sensitivity Detail Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground">Factor</th>
                  <th className="text-left py-2 text-muted-foreground">Shock</th>
                  <th className="text-right py-2 text-primary px-3">Equity</th>
                  <th className="text-right py-2 text-emerald-400 px-3">Bonds</th>
                  <th className="text-right py-2 text-yellow-400 px-3">Gold</th>
                  <th className="text-right py-2 text-orange-400 px-3">Credit</th>
                  <th className="text-right py-2 text-primary pl-3">USD</th>
                </tr>
              </thead>
              <tbody>
                {SENSITIVITY_FACTORS.map((f) => (
                  <tr
                    key={f.factor}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="py-2 text-muted-foreground pr-4">{f.factor}</td>
                    <td className="py-2 text-muted-foreground pr-4">{f.shock}</td>
                    {[f.equity, f.bonds, f.gold, f.credit, f.usd].map((v, i) => (
                      <td
                        key={i}
                        className={`text-right py-2 px-3 font-mono font-medium ${pnlColor(v)}`}
                      >
                        {v >= 0 ? "+" : ""}
                        {v}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Worst-case combined shock */}
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-orange-400" />
              Combined Worst-Case Shock (all factors simultaneous)
            </p>
            <div className="grid grid-cols-5 gap-2">
              {(
                [
                  ["Equity", SENSITIVITY_FACTORS.reduce((s, f) => s + f.equity, 0)],
                  ["Bonds", SENSITIVITY_FACTORS.reduce((s, f) => s + f.bonds, 0)],
                  ["Gold", SENSITIVITY_FACTORS.reduce((s, f) => s + f.gold, 0)],
                  ["Credit", SENSITIVITY_FACTORS.reduce((s, f) => s + f.credit, 0)],
                  ["USD", SENSITIVITY_FACTORS.reduce((s, f) => s + f.usd, 0)],
                ] as [string, number][]
              ).map(([label, val]) => (
                <div key={label} className="bg-muted rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-sm font-mono font-bold mt-0.5 ${pnlColor(val)}`}>
                    {val >= 0 ? "+" : ""}
                    {val.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate sensitivity deep-dive */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Rate Sensitivity — Duration Ladder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { maturity: "2Y Treasury", duration: 1.9, dv01: -1.9, shock100: -1.9 },
              { maturity: "5Y Treasury", duration: 4.6, dv01: -4.5, shock100: -4.5 },
              { maturity: "10Y Treasury", duration: 8.4, dv01: -8.1, shock100: -8.1 },
              { maturity: "30Y Treasury", duration: 18.2, dv01: -17.4, shock100: -17.4 },
              { maturity: "IG Corp (7Y)", duration: 6.2, dv01: -6.0, shock100: -6.0 },
              { maturity: "HY Corp (5Y)", duration: 3.8, dv01: -3.6, shock100: -3.6 },
            ].map((row) => (
              <div key={row.maturity} className="flex items-center gap-3 text-xs">
                <span className="w-36 text-muted-foreground">{row.maturity}</span>
                <span className="w-16 text-muted-foreground font-mono">Dur {row.duration}y</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(row.duration / 20) * 100}%` }}
                  />
                </div>
                <span className="w-20 text-right font-mono text-red-400">
                  {row.shock100}% / 100bps
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 5: Reverse Stress Test
// ---------------------------------------------------------------------------

function ReverseStressTab() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const liquidityScenarios = [
    {
      name: "Bid-Ask Spread Expansion",
      normal: "0.01–0.05%",
      stress: "0.5–2.5%",
      impact: "Adds 1–3% round-trip cost; prevents exit at desired levels",
    },
    {
      name: "Market Depth Collapse",
      normal: "$50M+ at quote",
      stress: "$2–5M at quote",
      impact: "Large orders move market 3–8%; partial fills only",
    },
    {
      name: "Prime Broker Margin Call",
      normal: "Leverage 3–5×",
      stress: "Forced to 1–2×",
      impact: "Forced deleveraging into illiquid market amplifies losses",
    },
    {
      name: "Redemption Cliff",
      normal: "T+2 settlement",
      stress: "Gate / suspension",
      impact: "Cannot raise cash; forced holding of depreciating assets",
    },
  ];

  const pathDependentRisks = [
    {
      risk: "Volatility Autocorrelation",
      desc: "High volatility today → 60% chance of high vol in next 5 days. Consecutive drawdowns compound.",
    },
    {
      risk: "Correlation Breakdown",
      desc: "Asset correlations spike to 0.85+ in crisis. Diversification fails at worst moment.",
    },
    {
      risk: "Leverage Amplification",
      desc: "Every 10% portfolio drop triggers margin call, forcing 20% asset sale into falling market.",
    },
    {
      risk: "Feedback Loop",
      desc: "Forced selling depresses prices → triggers more stops → more selling. Self-reinforcing spiral.",
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Reverse engineering: what macro/market conditions would produce each loss level?
        Identifies non-linear risks and path-dependent scenarios.
      </p>

      {/* Loss Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REVERSE_STRESS_PATHS.map((path, i) => {
          const isExp = expanded === i;
          const lossColor =
            path.lossLevel === 20
              ? "text-orange-400 border-orange-800"
              : path.lossLevel === 30
              ? "text-red-400 border-red-800"
              : "text-red-500 border-red-900";
          const bgColor =
            path.lossLevel === 20
              ? "bg-orange-950/20"
              : path.lossLevel === 30
              ? "bg-red-950/20"
              : "bg-red-950/40";

          return (
            <motion.div
              key={path.lossLevel}
              className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                isExp ? lossColor + " " + bgColor : "border-border bg-card hover:border-border"
              }`}
              onClick={() => setExpanded(isExp ? null : i)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Portfolio Loss</p>
                  <p className={`text-2xl font-bold font-mono ${lossColor.split(" ")[0]}`}>
                    -{path.lossLevel}%
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={`text-xs ${liquidityColor(path.liquidityRisk)}`}>
                    {path.liquidityRisk} Liquidity Risk
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{path.timeframe}</p>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                <p className="text-xs text-muted-foreground">Probability of occurrence:</p>
                <p className="text-sm font-mono text-muted-foreground">{path.probability}</p>
              </div>

              <AnimatePresence>
                {isExp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <Separator className="bg-muted mb-3" />
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Trigger conditions:</p>
                    <ul className="space-y-1.5">
                      {path.triggers.map((t, ti) => (
                        <li key={ti} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-red-500 mt-0.5">•</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end mt-2">
                {isExp ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Liquidity Spiral */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Liquidity Spiral Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {liquidityScenarios.map((ls) => (
              <div key={ls.name} className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium text-foreground mb-1.5">{ls.name}</p>
                <div className="flex gap-3 text-xs mb-1.5">
                  <div>
                    <p className="text-muted-foreground">Normal</p>
                    <p className="text-emerald-400 font-mono">{ls.normal}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stress</p>
                    <p className="text-red-400 font-mono">{ls.stress}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{ls.impact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Path-Dependent Risks */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            Path-Dependent Risk Amplifiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pathDependentRisks.map((r) => (
              <div key={r.risk} className="flex gap-3">
                <div className="w-1 rounded-full bg-red-800 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">{r.risk}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SVG — Loss ladder visualization */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Loss Severity Ladder — Recovery Time Estimate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 520 120" className="w-full">
            {/* Background grid */}
            {[0, 25, 50, 75, 100].map((x) => (
              <line
                key={x}
                x1={40 + (x / 100) * 440}
                x2={40 + (x / 100) * 440}
                y1={10}
                y2={100}
                stroke="currentColor" className="text-border"
                strokeWidth={1}
              />
            ))}

            {/* X axis */}
            <line x1={40} x2={480} y1={100} y2={100} stroke="currentColor" className="text-muted-foreground/40" strokeWidth={1} />

            {/* Loss bars */}
            {[
              { loss: 10, recovery: 8, label: "-10%", recLabel: "8 months" },
              { loss: 20, recovery: 20, label: "-20%", recLabel: "20 months" },
              { loss: 30, recovery: 42, label: "-30%", recLabel: "42 months" },
              { loss: 50, recovery: 100, label: "-50%", recLabel: "100 months" },
              { loss: 80, recovery: 400, label: "-80%", recLabel: "400 months" },
            ].map((row, i) => {
              const y = 18 + i * 16;
              const lossW = (row.loss / 100) * 200;
              const recW = Math.min((row.recovery / 400) * 200, 200);
              return (
                <g key={row.label}>
                  <text x={36} y={y + 8} textAnchor="end" fill="currentColor" className="text-muted-foreground" fontSize={9}>
                    {row.label}
                  </text>
                  {/* Loss bar */}
                  <rect x={40} y={y} width={lossW} height={10} fill="var(--chart-2)" fillOpacity={0.7} rx={2} />
                  {/* Recovery bar */}
                  <rect
                    x={40 + lossW}
                    y={y}
                    width={recW}
                    height={10}
                    fill="var(--chart-4)"
                    fillOpacity={0.5}
                    rx={2}
                  />
                  <text
                    x={40 + lossW + recW + 4}
                    y={y + 8}
                    fill="currentColor" className="text-muted-foreground"
                    fontSize={8}
                  >
                    {row.recLabel} recovery
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            <rect x={40} y={104} width={10} height={8} fill="var(--chart-2)" fillOpacity={0.7} rx={1} />
            <text x={54} y={111} fill="currentColor" className="text-muted-foreground" fontSize={8}>
              Initial loss
            </text>
            <rect x={120} y={104} width={10} height={8} fill="var(--chart-4)" fillOpacity={0.5} rx={1} />
            <text x={134} y={111} fill="currentColor" className="text-muted-foreground" fontSize={8}>
              Recovery time (scaled)
            </text>
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ScenarioAnalysisPage() {
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border px-6 py-5 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Scenario Analysis
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
              Model macro regimes, stress-test portfolios against historical crises, and assess tail risks.
              All projections use simplified factor models for educational purposes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Simulated</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden mt-8">
        <Tabs defaultValue="builder" className="h-full flex flex-col">
          <div className="flex-shrink-0 px-6 pt-3 border-b border-border">
            <TabsList className="bg-card border border-border h-8">
              <TabsTrigger value="builder" className="text-xs h-6 data-[state=active]:bg-primary">
                <TrendingUp className="w-3 h-3 mr-1" />
                Scenario Builder
              </TabsTrigger>
              <TabsTrigger value="stress" className="text-xs h-6 data-[state=active]:bg-primary">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Historical Stress
              </TabsTrigger>
              <TabsTrigger value="tail" className="text-xs h-6 data-[state=active]:bg-primary">
                <BarChart3 className="w-3 h-3 mr-1" />
                Tail Risk
              </TabsTrigger>
              <TabsTrigger value="sensitivity" className="text-xs h-6 data-[state=active]:bg-primary">
                <Zap className="w-3 h-3 mr-1" />
                Macro Sensitivity
              </TabsTrigger>
              <TabsTrigger value="reverse" className="text-xs h-6 data-[state=active]:bg-primary">
                <TrendingDown className="w-3 h-3 mr-1" />
                Reverse Stress
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <TabsContent value="builder" className="p-6 data-[state=inactive]:hidden">
              <ScenarioBuilderTab />
            </TabsContent>
            <TabsContent value="stress" className="p-6 data-[state=inactive]:hidden">
              <HistoricalStressTab />
            </TabsContent>
            <TabsContent value="tail" className="p-6 data-[state=inactive]:hidden">
              <TailRiskTab />
            </TabsContent>
            <TabsContent value="sensitivity" className="p-6 data-[state=inactive]:hidden">
              <MacroSensitivityTab />
            </TabsContent>
            <TabsContent value="reverse" className="p-6 data-[state=inactive]:hidden">
              <ReverseStressTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
