"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Layers,
  Target,
  Shield,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  PieChart,
  Calendar,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 55;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed: number) {
  s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface FactorDef {
  id: string;
  name: string;
  color: string;
  definition: string;
  origin: string;
  construction: string;
  riskInterpretation: string;
  crowding: number; // 0–1
}

interface ETFDef {
  ticker: string;
  name: string;
  factor: string;
  expense: number;
  aumB: number;
  trackingError: number;
  turnover: number;
  color: string;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const FACTORS: FactorDef[] = [
  {
    id: "market",
    name: "Market",
    color: "#6366f1",
    definition: "Excess return of the broad market over the risk-free rate. The single most pervasive risk premium in finance.",
    origin: "Sharpe (1964), CAPM",
    construction: "Long: market-cap weighted index. Short: T-bill / risk-free rate.",
    riskInterpretation: "Compensation for bearing systematic market risk that cannot be diversified away.",
    crowding: 0.82,
  },
  {
    id: "size",
    name: "Size",
    color: "#10b981",
    definition: "Small-cap stocks tend to outperform large-cap stocks on a risk-adjusted basis over long horizons.",
    origin: "Banz (1981), Fama-French (1992)",
    construction: "Long: small-cap quintile. Short: large-cap quintile, matched on other characteristics.",
    riskInterpretation: "Reflects higher distress risk, illiquidity premium, and neglected-firm effect.",
    crowding: 0.41,
  },
  {
    id: "value",
    name: "Value",
    color: "#f59e0b",
    definition: "Cheap stocks (high B/P, E/P, CF/P) outperform expensive stocks over time.",
    origin: "Basu (1977), Fama-French (1992)",
    construction: "Long: top value quintile (high B/P). Short: bottom value quintile (growth).",
    riskInterpretation: "Compensation for distress risk; value stocks more exposed to business cycle downturns.",
    crowding: 0.29,
  },
  {
    id: "momentum",
    name: "Momentum",
    color: "#ef4444",
    definition: "Stocks that performed well in the past 6–12 months continue to outperform in the near future.",
    origin: "Jegadeesh & Titman (1993)",
    construction: "Long: top decile by 12-1 month returns. Short: bottom decile, skip most recent month.",
    riskInterpretation: "Behavioral: underreaction to news, trend-following, herding behavior by investors.",
    crowding: 0.68,
  },
  {
    id: "quality",
    name: "Quality",
    color: "#8b5cf6",
    definition: "High-quality firms (high ROE, low leverage, stable earnings) deliver superior risk-adjusted returns.",
    origin: "Asness, Frazzini & Pedersen (2013)",
    construction: "Long: high quality score (profitability + safety + growth). Short: junk (low quality).",
    riskInterpretation: "Quality firms are defensive; they outperform in downturns and during credit stress.",
    crowding: 0.55,
  },
  {
    id: "lowvol",
    name: "Low Vol",
    color: "#06b6d4",
    definition: "Low-volatility and low-beta stocks deliver higher risk-adjusted returns than theory predicts.",
    origin: "Black (1972), Frazzini & Pedersen (2014)",
    construction: "Long: minimum-variance / low-beta stocks. Short: high-beta, high-volatility stocks.",
    riskInterpretation: "Betting-Against-Beta exploits leverage constraints; investors overpay for lottery-like stocks.",
    crowding: 0.72,
  },
  {
    id: "profitability",
    name: "Profitability",
    color: "#22c55e",
    definition: "Highly profitable firms (high gross profit/assets) earn higher expected returns.",
    origin: "Novy-Marx (2013), Fama-French 5-factor (2015)",
    construction: "Long: high gross profitability (GP/A). Short: low gross profitability companies.",
    riskInterpretation: "More profitable firms have lower credit risk; profitability proxies for business quality.",
    crowding: 0.48,
  },
  {
    id: "investment",
    name: "Investment",
    color: "#f97316",
    definition: "Conservative-investing firms (low asset growth) outperform aggressive-investing firms.",
    origin: "Titman, Wei & Xie (2004), Fama-French 5-factor (2015)",
    construction: "Long: low total-asset growth (CMA). Short: high total-asset growth firms.",
    riskInterpretation: "Aggressive investment may signal overconfidence or empire-building by management.",
    crowding: 0.33,
  },
  {
    id: "dividend",
    name: "Dividend",
    color: "#ec4899",
    definition: "High-dividend-yield stocks provide a return premium, particularly in mature market phases.",
    origin: "Litzenberger & Ramaswamy (1979)",
    construction: "Long: high-dividend-yield stocks. Short: non-dividend-paying or low-yield stocks.",
    riskInterpretation: "Dividend stocks attract income-seeking investors; yield serves as a valuation floor.",
    crowding: 0.61,
  },
  {
    id: "carry",
    name: "Carry",
    color: "#14b8a6",
    definition: "Assets with higher yield tend to outperform lower-yield assets in the near term.",
    origin: "Koijen et al. (2018), Asness et al. (2013)",
    construction: "Long: high carry (yield - funding rate) assets. Short: low-carry or negative-carry assets.",
    riskInterpretation: "Carry earns a premium but suffers sharp drawdowns during risk-off episodes.",
    crowding: 0.44,
  },
  {
    id: "liquidity",
    name: "Liquidity",
    color: "#a78bfa",
    definition: "Illiquid stocks earn a return premium to compensate for higher trading costs.",
    origin: "Amihud (2002), Pastor & Stambaugh (2003)",
    construction: "Long: illiquid stocks (high Amihud ratio). Short: liquid, high-turnover large-caps.",
    riskInterpretation: "Illiquidity risk is systematic; it rises sharply during market stress and crises.",
    crowding: 0.25,
  },
  {
    id: "idiovol",
    name: "Idiosyncratic Vol",
    color: "#fb923c",
    definition: "Stocks with high idiosyncratic volatility tend to underperform (reverse anomaly).",
    origin: "Ang et al. (2006)",
    construction: "Long: low idiosyncratic volatility (unexplained by CAPM). Short: high IVOL stocks.",
    riskInterpretation: "IVOL puzzle: investors lottery-seeking behavior leads to overpricing of high-IVOL stocks.",
    crowding: 0.36,
  },
];

const ETF_UNIVERSE: ETFDef[] = [
  { ticker: "VLUE",  name: "iShares MSCI USA Value Factor",       factor: "Value",       expense: 0.15, aumB: 6.4,  trackingError: 3.2, turnover: 28, color: "#f59e0b" },
  { ticker: "MTUM",  name: "iShares MSCI USA Momentum Factor",    factor: "Momentum",    expense: 0.15, aumB: 12.1, trackingError: 4.8, turnover: 147, color: "#ef4444" },
  { ticker: "QUAL",  name: "iShares MSCI USA Quality Factor",     factor: "Quality",     expense: 0.15, aumB: 30.2, trackingError: 2.9, turnover: 22, color: "#8b5cf6" },
  { ticker: "USMV",  name: "iShares MSCI USA Min Vol Factor",     factor: "Low Vol",     expense: 0.15, aumB: 28.7, trackingError: 2.1, turnover: 18, color: "#06b6d4" },
  { ticker: "IWD",   name: "iShares Russell 1000 Value ETF",      factor: "Value",       expense: 0.19, aumB: 54.3, trackingError: 1.8, turnover: 19, color: "#fbbf24" },
  { ticker: "IWF",   name: "iShares Russell 1000 Growth ETF",     factor: "Growth",      expense: 0.19, aumB: 71.8, trackingError: 1.6, turnover: 17, color: "#34d399" },
  { ticker: "SPHB",  name: "Invesco S&P 500 High Beta ETF",       factor: "High Beta",   expense: 0.25, aumB: 0.8,  trackingError: 6.4, turnover: 62, color: "#f87171" },
  { ticker: "SPLV",  name: "Invesco S&P 500 Low Vol ETF",         factor: "Low Vol",     expense: 0.25, aumB: 7.2,  trackingError: 3.1, turnover: 45, color: "#67e8f9" },
  { ticker: "VTV",   name: "Vanguard Value ETF",                  factor: "Value",       expense: 0.04, aumB: 112.4, trackingError: 1.4, turnover: 8, color: "#fde047" },
  { ticker: "VUG",   name: "Vanguard Growth ETF",                 factor: "Growth",      expense: 0.04, aumB: 132.6, trackingError: 1.5, turnover: 9, color: "#86efac" },
  { ticker: "DGRO",  name: "iShares Core Dividend Growth ETF",    factor: "Dividend",    expense: 0.08, aumB: 26.1, trackingError: 2.3, turnover: 24, color: "#ec4899" },
  { ticker: "NOBL",  name: "ProShares S&P 500 Div Aristocrats",   factor: "Dividend",    expense: 0.35, aumB: 9.8,  trackingError: 3.7, turnover: 20, color: "#f472b6" },
];

const ECONOMIC_REGIMES = [
  { id: "expansion",    label: "Expansion",    color: "#22c55e", desc: "Rising GDP, falling unemployment" },
  { id: "contraction",  label: "Contraction",  color: "#ef4444", desc: "Falling GDP, rising unemployment" },
  { id: "stagflation",  label: "Stagflation",  color: "#f59e0b", desc: "High inflation, low growth" },
  { id: "deflation",    label: "Deflation",    color: "#06b6d4", desc: "Falling prices, low growth" },
] as const;
type RegimeId = typeof ECONOMIC_REGIMES[number]["id"];

// Which factors outperform in each regime (score 1–5)
const REGIME_FACTOR_PERFORMANCE: Record<RegimeId, Record<string, number>> = {
  expansion:   { market: 5, size: 4, value: 4, momentum: 5, quality: 3, lowvol: 2, profitability: 4, investment: 4, dividend: 3, carry: 4, liquidity: 3, idiovol: 2 },
  contraction: { market: 1, size: 2, value: 2, momentum: 2, quality: 5, lowvol: 5, profitability: 4, investment: 3, dividend: 4, carry: 2, liquidity: 1, idiovol: 3 },
  stagflation: { market: 2, size: 3, value: 5, momentum: 3, quality: 3, lowvol: 3, profitability: 3, investment: 2, dividend: 5, carry: 4, liquidity: 2, idiovol: 2 },
  deflation:   { market: 3, size: 2, value: 2, momentum: 3, quality: 4, lowvol: 4, profitability: 4, investment: 3, dividend: 5, carry: 3, liquidity: 2, idiovol: 3 },
};

const PERFORMANCE_FACTOR_IDS = ["value", "momentum", "quality", "lowvol", "size", "profitability"] as const;
type PerfFactorId = typeof PERFORMANCE_FACTOR_IDS[number];
const PERF_FACTOR_COLORS: Record<PerfFactorId, string> = {
  value: "#f59e0b",
  momentum: "#ef4444",
  quality: "#8b5cf6",
  lowvol: "#06b6d4",
  size: "#10b981",
  profitability: "#22c55e",
};

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const HEAT_YEAR = 2024;

// ── Generate factor performance data (36 months) ───────────────────────────────
function genPerfData(): Record<PerfFactorId, number[]> {
  resetSeed(42);
  const means: Record<PerfFactorId, number> = {
    value: 0.5, momentum: 0.8, quality: 0.6, lowvol: 0.3, size: 0.4, profitability: 0.7,
  };
  const vols: Record<PerfFactorId, number> = {
    value: 2.8, momentum: 3.5, quality: 2.1, lowvol: 1.8, size: 3.2, profitability: 2.4,
  };
  const result: Record<PerfFactorId, number[]> = {
    value: [], momentum: [], quality: [], lowvol: [], size: [], profitability: [],
  };
  for (let i = 0; i < 36; i++) {
    for (const f of PERFORMANCE_FACTOR_IDS) {
      const noise = (rand() - 0.5) * 2;
      result[f].push(means[f] + noise * vols[f]);
    }
  }
  return result;
}

// ── Correlation matrix data ────────────────────────────────────────────────────
function genCorrelationMatrix(): number[][] {
  resetSeed(77);
  const n = FACTORS.length;
  const corr: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  // Base correlations (some factors are more correlated)
  const basePairs: [number, number, number][] = [
    [0, 3, 0.45], // market-momentum
    [1, 2, -0.35], // size-value
    [4, 5, 0.60], // quality-lowvol
    [4, 6, 0.70], // quality-profitability
    [2, 8, 0.55], // value-dividend
    [5, 10, 0.40], // lowvol-liquidity
    [3, 11, -0.30], // momentum-idiovol
  ];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) { corr[i][j] = 1; continue; }
      if (i > j) { corr[i][j] = corr[j][i]; continue; }
      const base = basePairs.find(([a, b]) => (a === i && b === j) || (a === j && b === i));
      corr[i][j] = base ? base[2] + (rand() - 0.5) * 0.15 : (rand() - 0.5) * 0.4;
      corr[i][j] = Math.max(-0.95, Math.min(0.95, corr[i][j]));
    }
  }
  return corr;
}

// ── Heat calendar: month × factor for 2024 ────────────────────────────────────
function genHeatCalendar(): Record<PerfFactorId, number[]> {
  resetSeed(99);
  const result: Record<PerfFactorId, number[]> = {
    value: [], momentum: [], quality: [], lowvol: [], size: [], profitability: [],
  };
  for (let m = 0; m < 12; m++) {
    for (const f of PERFORMANCE_FACTOR_IDS) {
      result[f].push((rand() - 0.45) * 6);
    }
  }
  return result;
}

// ── Factor regression portfolio loadings ──────────────────────────────────────
function genPortfolioLoadings() {
  resetSeed(123);
  return {
    alpha: 0.12,
    beta: 1.08,
    smb: 0.34,
    hml: -0.18,
    wml: 0.52,
    rmw: 0.41,
    cma: -0.12,
    rSquared: 0.84,
  };
}

// ── Timing signals ────────────────────────────────────────────────────────────
const TIMING_SIGNALS = [
  {
    factor: "Value",
    signal: "Cheap",
    color: "#22c55e",
    metric: "Market CAPE",
    value: "24.3x",
    hist_avg: "27.1x",
    interpretation: "CAPE below 10-year avg — value factor moderately attractive.",
    score: 72,
  },
  {
    factor: "Momentum",
    signal: "Favorable",
    color: "#22c55e",
    metric: "Cross-sectional Dispersion",
    value: "18.4%",
    hist_avg: "14.2%",
    interpretation: "High dispersion environment favors momentum strategy execution.",
    score: 81,
  },
  {
    factor: "Quality",
    signal: "Neutral",
    color: "#f59e0b",
    metric: "IG Credit Spread",
    value: "115 bps",
    hist_avg: "130 bps",
    interpretation: "Credit spreads below average — quality premium near fair value.",
    score: 55,
  },
  {
    factor: "Low Vol",
    signal: "Cautious",
    color: "#f59e0b",
    metric: "VIX Term Structure",
    value: "Contango +4.2%",
    hist_avg: "Contango +3.1%",
    interpretation: "Steep contango slightly reduces roll advantage for low-vol strategies.",
    score: 48,
  },
  {
    factor: "Size",
    signal: "Unfavorable",
    color: "#ef4444",
    metric: "Small/Large Cap Spread",
    value: "-3.1% YTD",
    hist_avg: "+1.2% avg",
    interpretation: "Small caps lagging — size factor headwinds from rate sensitivity.",
    score: 28,
  },
  {
    factor: "Profitability",
    signal: "Favorable",
    color: "#22c55e",
    metric: "Earnings Revision Ratio",
    value: "1.42",
    hist_avg: "1.18",
    interpretation: "Above-average upgrades favor high-profitability firms.",
    score: 76,
  },
];

const COMPOSITE_TIMING_SCORE = Math.round(
  TIMING_SIGNALS.reduce((a, b) => a + b.score, 0) / TIMING_SIGNALS.length
);

// ── Helper Components ─────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function MetricChip({ label, value, delta }: { label: string; value: string; delta?: number }) {
  return (
    <div className="bg-zinc-800/60 rounded-lg px-3 py-2 border border-zinc-700/50">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-sm font-semibold text-white mt-0.5">{value}</div>
      {delta !== undefined && (
        <div className={cn("text-xs mt-0.5", delta >= 0 ? "text-emerald-400" : "text-red-400")}>
          {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

// ── Section 1: Factor Zoo Overview ────────────────────────────────────────────

function FactorZooSection() {
  const [selectedFactor, setSelectedFactor] = useState<string | null>("market");
  const corrMatrix = useMemo(() => genCorrelationMatrix(), []);

  const sel = FACTORS.find((f) => f.id === selectedFactor);

  function crowdingLabel(c: number) {
    if (c >= 0.65) return { label: "High", color: "#ef4444" };
    if (c >= 0.45) return { label: "Medium", color: "#f59e0b" };
    return { label: "Low", color: "#22c55e" };
  }

  function corrColor(v: number) {
    if (v >= 0.6) return "rgba(99,102,241,0.80)";
    if (v >= 0.3) return "rgba(99,102,241,0.45)";
    if (v >= 0) return "rgba(99,102,241,0.15)";
    if (v >= -0.3) return "rgba(239,68,68,0.20)";
    if (v >= -0.6) return "rgba(239,68,68,0.50)";
    return "rgba(239,68,68,0.80)";
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Layers}
        title="Factor Zoo — 12 Academic Factors"
        subtitle="Core risk premia identified by academic research. Click a factor to inspect its construction and risk interpretation."
      />

      {/* Factor grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {FACTORS.map((f) => {
          const { label, color } = crowdingLabel(f.crowding);
          return (
            <motion.button
              key={f.id}
              onClick={() => setSelectedFactor(f.id === selectedFactor ? null : f.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                selectedFactor === f.id
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-zinc-700/60 bg-zinc-800/40 hover:border-zinc-600"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{f.name}</span>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
              </div>
              <div className="text-xs text-zinc-400 line-clamp-2 mb-2">{f.definition.substring(0, 70)}…</div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-500">Crowding:</span>
                <span className="text-xs font-medium" style={{ color }}>{label}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${f.crowding * 100}%`, backgroundColor: color }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Factor detail panel */}
      <AnimatePresence mode="wait">
        {sel && (
          <motion.div
            key={sel.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-zinc-700/60 bg-zinc-800/40">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sel.color }} />
                  <h3 className="text-base font-semibold text-white">{sel.name} Factor</h3>
                  <Badge variant="outline" className="text-xs">{sel.origin}</Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Definition</div>
                      <p className="text-sm text-zinc-200">{sel.definition}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Long/Short Construction</div>
                      <p className="text-sm text-zinc-300">{sel.construction}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Risk Interpretation</div>
                      <p className="text-sm text-zinc-300">{sel.riskInterpretation}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Crowding Level</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 rounded-full bg-zinc-700 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${sel.crowding * 100}%`,
                              backgroundColor: crowdingLabel(sel.crowding).color,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium" style={{ color: crowdingLabel(sel.crowding).color }}>
                          {(sel.crowding * 100).toFixed(0)}% — {crowdingLabel(sel.crowding).label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two sub-panels: correlation heatmap + crowding bars */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Correlation heatmap */}
        <Card className="border-zinc-700/60 bg-zinc-800/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              Factor Correlation Matrix (12×12)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="overflow-x-auto">
              <svg
                width={336}
                height={336}
                viewBox="0 0 336 336"
                className="w-full max-w-[336px] mx-auto"
              >
                {corrMatrix.map((row, i) =>
                  row.map((val, j) => (
                    <g key={`${i}-${j}`}>
                      <rect
                        x={j * 28}
                        y={i * 28}
                        width={27}
                        height={27}
                        fill={i === j ? "rgba(255,255,255,0.08)" : corrColor(val)}
                        rx={2}
                      />
                      {i === j && (
                        <text x={j * 28 + 13.5} y={i * 28 + 16} textAnchor="middle" fontSize={7} fill="#a1a1aa">
                          {FACTORS[i].name.substring(0, 3)}
                        </text>
                      )}
                    </g>
                  ))
                )}
                {/* Color legend */}
                <defs>
                  <linearGradient id="corrGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="rgba(239,68,68,0.8)" />
                    <stop offset="50%" stopColor="rgba(99,102,241,0.15)" />
                    <stop offset="100%" stopColor="rgba(99,102,241,0.8)" />
                  </linearGradient>
                </defs>
                <rect x={0} y={310} width={200} height={8} fill="url(#corrGrad)" rx={4} />
                <text x={0} y={328} fontSize={8} fill="#71717a">-1</text>
                <text x={92} y={328} fontSize={8} fill="#71717a" textAnchor="middle">0</text>
                <text x={200} y={328} fontSize={8} fill="#71717a" textAnchor="end">+1</text>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Crowding bars */}
        <Card className="border-zinc-700/60 bg-zinc-800/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Factor Crowding Indicator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {FACTORS.map((f) => {
              const { label, color } = crowdingLabel(f.crowding);
              return (
                <div key={f.id} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-zinc-300 truncate">{f.name}</span>
                  <div className="flex-1 h-3 rounded-full bg-zinc-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${f.crowding * 100}%` }}
                      transition={{ duration: 0.8, delay: FACTORS.indexOf(f) * 0.04 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <span className="w-16 text-xs font-medium text-right" style={{ color }}>
                    {(f.crowding * 100).toFixed(0)}% {label}
                  </span>
                </div>
              );
            })}
            <div className="pt-2 border-t border-zinc-700/50 flex gap-4 text-xs text-zinc-400">
              <span><span className="text-red-400">■</span> High (&gt;65%)</span>
              <span><span className="text-amber-400">■</span> Medium (45–65%)</span>
              <span><span className="text-emerald-400">■</span> Low (&lt;45%)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Section 2: Fama-French Models ─────────────────────────────────────────────

function FamaFrenchSection() {
  const loadings = useMemo(() => genPortfolioLoadings(), []);

  const models = [
    {
      name: "CAPM (1-Factor)",
      year: "1964",
      factors: ["β·(Rm−Rf)"],
      formula: "Rp = Rf + β(Rm−Rf)",
      description: "Market beta is the only priced risk. All alpha is assumed away by arbitrage.",
      rSquared: 0.62,
    },
    {
      name: "Fama-French 3-Factor",
      year: "1992",
      factors: ["β·MKT", "s·SMB", "h·HML"],
      formula: "Rp = Rf + β(MKT) + s(SMB) + h(HML)",
      description: "Adds size (SMB: small minus big) and value (HML: high minus low B/P) to explain cross-sectional return dispersion.",
      rSquared: 0.74,
    },
    {
      name: "Carhart 4-Factor",
      year: "1997",
      factors: ["β·MKT", "s·SMB", "h·HML", "m·WML"],
      formula: "Rp = α + β(MKT) + s(SMB) + h(HML) + m(WML)",
      description: "Adds momentum (WML: winners minus losers) — most funds' active returns are explained by factor loadings, not stock-picking.",
      rSquared: 0.81,
    },
    {
      name: "Fama-French 5-Factor",
      year: "2015",
      factors: ["β·MKT", "s·SMB", "h·HML", "r·RMW", "c·CMA"],
      formula: "Rp = α + β(MKT) + s(SMB) + h(HML) + r(RMW) + c(CMA)",
      description: "Adds profitability (RMW: robust minus weak) and investment (CMA: conservative minus aggressive). HML becomes redundant in some tests.",
      rSquared: 0.87,
    },
  ];

  const factorContribs = [
    { name: "Alpha",         value: loadings.alpha,  color: "#6366f1" },
    { name: "Market (β)",    value: loadings.beta * 1.2,   color: "#8b5cf6" },
    { name: "Size (SMB)",    value: loadings.smb * 2.1,    color: "#10b981" },
    { name: "Value (HML)",   value: loadings.hml * 1.8,    color: "#f59e0b" },
    { name: "Momentum (WML)",value: loadings.wml * 3.2,    color: "#ef4444" },
    { name: "Profit (RMW)",  value: loadings.rmw * 2.4,    color: "#22c55e" },
    { name: "Invest (CMA)",  value: loadings.cma * 1.6,    color: "#f97316" },
  ];

  const maxAbs = Math.max(...factorContribs.map((f) => Math.abs(f.value)));

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={BarChart3}
        title="Fama-French Factor Models"
        subtitle="Evolution from CAPM to 5-factor model. Each model better explains the cross-section of expected returns."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map((m, idx) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <Card className="border-zinc-700/60 bg-zinc-800/40 h-full">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{m.name}</div>
                    <div className="text-xs text-zinc-500">{m.year}</div>
                  </div>
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                    R² {(m.rSquared * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="font-mono text-xs text-indigo-300 bg-zinc-900/50 rounded p-2 mb-3 break-all">
                  {m.formula}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {m.factors.map((f) => (
                    <span key={f} className="text-xs bg-zinc-700/60 rounded px-1.5 py-0.5 text-zinc-300">{f}</span>
                  ))}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{m.description}</p>
                {/* R² progress */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>Explanatory Power</span>
                    <span>{(m.rSquared * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.rSquared * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + idx * 0.1 }}
                      className="h-full rounded-full bg-indigo-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Factor regression + contribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-zinc-700/60 bg-zinc-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200">Live Portfolio Factor Loadings</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[
              { label: "Alpha (α)",     value: loadings.alpha,   fmt: `${loadings.alpha.toFixed(2)}% annualized` },
              { label: "Market (β)",    value: loadings.beta,    fmt: loadings.beta.toFixed(2) },
              { label: "Size (SMB)",    value: loadings.smb,     fmt: loadings.smb.toFixed(2) },
              { label: "Value (HML)",   value: loadings.hml,     fmt: loadings.hml.toFixed(2) },
              { label: "Momentum (WML)", value: loadings.wml,   fmt: loadings.wml.toFixed(2) },
              { label: "Profitability (RMW)", value: loadings.rmw, fmt: loadings.rmw.toFixed(2) },
              { label: "Investment (CMA)", value: loadings.cma,  fmt: loadings.cma.toFixed(2) },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-36 text-xs text-zinc-400">{row.label}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-zinc-700 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          row.value >= 0 ? "bg-emerald-500" : "bg-red-500"
                        )}
                        style={{
                          width: `${Math.min(Math.abs(row.value) / 1.5 * 100, 100)}%`,
                          marginLeft: row.value < 0 ? "auto" : undefined,
                        }}
                      />
                    </div>
                  </div>
                  <span className={cn("text-xs font-mono w-20 text-right", row.value >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {row.fmt}
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-zinc-700/50 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Model R²</span>
              <span className="text-sm font-semibold text-indigo-300">{(loadings.rSquared * 100).toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-700/60 bg-zinc-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200">Factor Contribution to Portfolio Return</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <svg width="100%" height="220" viewBox="0 0 400 220">
              {factorContribs.map((f, i) => {
                const barMax = 340;
                const barW = Math.abs(f.value) / maxAbs * barMax * 0.5;
                const y = i * 28 + 10;
                const cx = 200;
                return (
                  <g key={f.name}>
                    <text x={cx - 8} y={y + 12} textAnchor="end" fontSize={11} fill="#a1a1aa">{f.name}</text>
                    {f.value >= 0 ? (
                      <rect x={cx} y={y + 2} width={barW} height={18} fill={f.color} rx={3} opacity={0.85} />
                    ) : (
                      <rect x={cx - barW} y={y + 2} width={barW} height={18} fill={f.color} rx={3} opacity={0.85} />
                    )}
                    <text
                      x={f.value >= 0 ? cx + barW + 4 : cx - barW - 4}
                      y={y + 14}
                      fontSize={10}
                      fill="#e4e4e7"
                      textAnchor={f.value >= 0 ? "start" : "end"}
                    >
                      {f.value >= 0 ? "+" : ""}{f.value.toFixed(2)}%
                    </text>
                  </g>
                );
              })}
              {/* Center line */}
              <line x1={200} y1={0} x2={200} y2={220} stroke="#52525b" strokeWidth={1} />
            </svg>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Section 3: Factor Performance Monitor ─────────────────────────────────────

function PerformanceSection() {
  const [currentRegime, setCurrentRegime] = useState<RegimeId>("expansion");
  const perfData = useMemo(() => genPerfData(), []);
  const heatCal = useMemo(() => genHeatCalendar(), []);

  // Cumulative returns for chart
  const cumulative = useMemo(() => {
    const result: Record<PerfFactorId, number[]> = {
      value: [0], momentum: [0], quality: [0], lowvol: [0], size: [0], profitability: [0],
    };
    for (let i = 0; i < 36; i++) {
      for (const f of PERFORMANCE_FACTOR_IDS) {
        result[f].push(result[f][i] + perfData[f][i]);
      }
    }
    return result;
  }, [perfData]);

  const W = 500, H = 200;
  const padL = 36, padR = 10, padT = 10, padB = 20;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const allVals = PERFORMANCE_FACTOR_IDS.flatMap((f) => cumulative[f]);
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const range = maxVal - minVal || 1;

  function xOf(i: number) { return padL + (i / 37) * innerW; }
  function yOf(v: number) { return padT + innerH - ((v - minVal) / range) * innerH; }

  function factorPath(f: PerfFactorId) {
    const pts = cumulative[f].map((v, i) => `${xOf(i)},${yOf(v)}`);
    return `M${pts.join("L")}`;
  }

  const regimeFactorScores = REGIME_FACTOR_PERFORMANCE[currentRegime];

  function heatColor(v: number) {
    const abs = Math.min(Math.abs(v), 3);
    if (v > 0) return `rgba(34,197,94,${0.2 + (abs / 3) * 0.75})`;
    return `rgba(239,68,68,${0.2 + (abs / 3) * 0.75})`;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Activity}
        title="Factor Performance Monitor"
        subtitle="Rolling 12-month returns, regime analysis, and factor rotation heat calendar."
      />

      {/* Multi-line performance chart */}
      <Card className="border-zinc-700/60 bg-zinc-800/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm text-zinc-200">Rolling Cumulative Factor Returns — 36 Months</CardTitle>
            <div className="flex flex-wrap gap-3">
              {PERFORMANCE_FACTOR_IDS.map((f) => (
                <span key={f} className="flex items-center gap-1 text-xs text-zinc-300">
                  <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: PERF_FACTOR_COLORS[f] }} />
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </span>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 overflow-x-auto">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[500px] mx-auto">
            {/* Grid lines */}
            {[-10, -5, 0, 5, 10, 15, 20].map((v) => {
              if (v < minVal - 2 || v > maxVal + 2) return null;
              const y = yOf(v);
              return (
                <g key={v}>
                  <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#3f3f46" strokeWidth={0.5} />
                  <text x={padL - 4} y={y + 4} fontSize={8} fill="#71717a" textAnchor="end">{v}%</text>
                </g>
              );
            })}
            {/* Zero line */}
            <line x1={padL} y1={yOf(0)} x2={W - padR} y2={yOf(0)} stroke="#52525b" strokeWidth={1} strokeDasharray="4,2" />
            {/* Factor lines */}
            {PERFORMANCE_FACTOR_IDS.map((f) => (
              <path
                key={f}
                d={factorPath(f)}
                fill="none"
                stroke={PERF_FACTOR_COLORS[f]}
                strokeWidth={1.5}
                opacity={0.85}
              />
            ))}
            {/* X-axis labels every 6 months */}
            {[0, 6, 12, 18, 24, 30, 36].map((i) => (
              <text key={i} x={xOf(i)} y={H - 4} fontSize={8} fill="#71717a" textAnchor="middle">
                {i === 0 ? "36m ago" : i === 36 ? "Now" : `${36 - i}m`}
              </text>
            ))}
          </svg>
        </CardContent>
      </Card>

      {/* Regime analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-zinc-700/60 bg-zinc-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Factor Timing by Economic Regime
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Regime selector */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {ECONOMIC_REGIMES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setCurrentRegime(r.id)}
                  className={cn(
                    "rounded-lg border p-2 text-left transition-all",
                    currentRegime === r.id ? "border-opacity-100 bg-opacity-15" : "border-zinc-700/60 hover:border-zinc-600"
                  )}
                  style={
                    currentRegime === r.id
                      ? { borderColor: r.color, backgroundColor: `${r.color}22` }
                      : {}
                  }
                >
                  <div className="text-sm font-medium" style={{ color: r.color }}>{r.label}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{r.desc}</div>
                  {currentRegime === r.id && (
                    <Badge className="mt-1 text-xs" style={{ backgroundColor: `${r.color}30`, color: r.color, border: `1px solid ${r.color}50` }}>
                      Current Regime
                    </Badge>
                  )}
                </button>
              ))}
            </div>
            {/* Factor scores for selected regime */}
            <div className="space-y-2">
              {FACTORS.slice(0, 8).map((f) => {
                const score = regimeFactorScores[f.id] ?? 3;
                const colors = ["", "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e"];
                return (
                  <div key={f.id} className="flex items-center gap-2">
                    <span className="w-20 text-xs text-zinc-300 truncate">{f.name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <div
                          key={dot}
                          className="w-5 h-2.5 rounded-sm"
                          style={{ backgroundColor: dot <= score ? colors[score] : "#3f3f46" }}
                        />
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: colors[score] }}>
                      {["", "Poor", "Below Avg", "Average", "Good", "Strong"][score]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Heat calendar */}
        <Card className="border-zinc-700/60 bg-zinc-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Factor Rotation Heat Calendar — {HEAT_YEAR}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="text-zinc-400 font-medium text-left pb-2 pr-2 w-24">Factor</th>
                  {MONTHS_SHORT.map((m) => (
                    <th key={m} className="text-zinc-400 font-medium text-center pb-2 w-8">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERFORMANCE_FACTOR_IDS.map((f) => (
                  <tr key={f}>
                    <td className="pr-2 py-0.5 text-zinc-300 font-medium capitalize">{f}</td>
                    {heatCal[f].map((v, m) => (
                      <td key={m} className="p-0.5">
                        <div
                          className="w-full aspect-square rounded-sm text-center leading-none flex items-center justify-center"
                          style={{
                            backgroundColor: heatColor(v),
                            minWidth: "20px",
                            minHeight: "20px",
                          }}
                          title={`${f} ${MONTHS_SHORT[m]}: ${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
                        >
                          <span className="text-white/80" style={{ fontSize: "7px" }}>
                            {v >= 0 ? "+" : ""}{v.toFixed(1)}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500/80 inline-block" /> Outperform</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500/80 inline-block" /> Underperform</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Section 4: Smart Beta ETF Analyzer ────────────────────────────────────────

function SmartBetaSection() {
  const [allocations, setAllocations] = useState<Record<string, number>>(() =>
    Object.fromEntries(ETF_UNIVERSE.map((e) => [e.ticker, e.ticker === "QUAL" ? 30 : e.ticker === "MTUM" ? 25 : 0]))
  );
  const [selectedETF, setSelectedETF] = useState<string | null>("QUAL");

  const totalAlloc = Object.values(allocations).reduce((a, b) => a + b, 0);

  const blendedStats = useMemo(() => {
    if (totalAlloc === 0) return { ret: 0, risk: 0, sharpe: 0, expense: 0, turnover: 0 };
    const baseReturns: Record<string, number> = {
      VLUE: 9.2, MTUM: 11.4, QUAL: 10.8, USMV: 8.9, IWD: 8.5, IWF: 12.1,
      SPHB: 13.2, SPLV: 7.8, VTV: 8.3, VUG: 12.4, DGRO: 9.6, NOBL: 8.7,
    };
    const baseVols: Record<string, number> = {
      VLUE: 14.2, MTUM: 16.8, QUAL: 13.1, USMV: 11.4, IWD: 13.8, IWF: 17.2,
      SPHB: 22.1, SPLV: 10.9, VTV: 13.5, VUG: 16.8, DGRO: 12.3, NOBL: 11.8,
    };
    let ret = 0, risk = 0, expense = 0, turnover = 0;
    for (const e of ETF_UNIVERSE) {
      const w = allocations[e.ticker] / 100;
      ret += w * (baseReturns[e.ticker] ?? 10);
      risk += w * (baseVols[e.ticker] ?? 15);
      expense += w * e.expense;
      turnover += w * e.turnover;
    }
    const sharpe = (ret - 5.25) / risk;
    return { ret, risk, sharpe, expense, turnover };
  }, [allocations, totalAlloc]);

  const selETF = ETF_UNIVERSE.find((e) => e.ticker === selectedETF);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={DollarSign}
        title="Smart Beta ETF Analyzer"
        subtitle="12 smart beta ETFs with factor loadings, expense ratios, and blended portfolio builder."
      />

      {/* ETF grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ETF_UNIVERSE.map((e) => (
          <motion.button
            key={e.ticker}
            onClick={() => setSelectedETF(e.ticker === selectedETF ? null : e.ticker)}
            className={cn(
              "rounded-xl border p-3 text-left transition-all",
              selectedETF === e.ticker
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-zinc-700/60 bg-zinc-800/40 hover:border-zinc-600"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-white">{e.ticker}</span>
              <span className="text-xs text-zinc-500">{e.expense}%</span>
            </div>
            <div className="text-xs text-zinc-400 mb-2 line-clamp-2">{e.name}</div>
            <div className="flex items-center justify-between text-xs">
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0"
                style={{ borderColor: e.color + "60", color: e.color }}
              >
                {e.factor}
              </Badge>
              <span className="text-zinc-500">${e.aumB.toFixed(1)}B</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ETF detail */}
      <AnimatePresence mode="wait">
        {selETF && (
          <motion.div
            key={selETF.ticker}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-zinc-700/60 bg-zinc-800/40">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xl font-bold text-white mr-2">{selETF.ticker}</span>
                    <span className="text-zinc-400 text-sm">{selETF.name}</span>
                  </div>
                  <Badge style={{ backgroundColor: selETF.color + "30", color: selETF.color, border: `1px solid ${selETF.color}50` }}>
                    {selETF.factor}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricChip label="Expense Ratio" value={`${selETF.expense}%`} />
                  <MetricChip label="AUM" value={`$${selETF.aumB.toFixed(1)}B`} />
                  <MetricChip label="Tracking Error" value={`${selETF.trackingError.toFixed(1)}%`} />
                  <MetricChip label="Annual Turnover" value={`${selETF.turnover}%`} />
                </div>
                <div className="mt-3 p-3 rounded-lg bg-zinc-900/50 text-xs text-zinc-400">
                  <span className="text-zinc-200 font-medium">Tax Efficiency: </span>
                  {selETF.turnover < 25
                    ? "High — Low turnover minimizes capital gains distributions. Suitable for taxable accounts."
                    : selETF.turnover < 60
                    ? "Medium — Moderate turnover may generate some short-term capital gains. Consider tax-advantaged accounts."
                    : "Low — High turnover likely generates frequent capital gains. Best held in tax-advantaged accounts (IRA/401k)."}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blended portfolio builder */}
      <Card className="border-zinc-700/60 bg-zinc-800/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-zinc-200">Blended Factor Portfolio Builder</CardTitle>
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded", totalAlloc === 100 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>
              {totalAlloc}% / 100%
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
            {ETF_UNIVERSE.map((e) => (
              <div key={e.ticker}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-zinc-300">{e.ticker}</span>
                  <span className="text-xs text-zinc-400">{allocations[e.ticker]}%</span>
                </div>
                <Slider
                  value={[allocations[e.ticker]]}
                  onValueChange={([v]) => setAllocations((prev) => ({ ...prev, [e.ticker]: v }))}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          {/* Expected characteristics */}
          <div className="border-t border-zinc-700/50 pt-4">
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Expected Blended Characteristics</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <MetricChip label="Expected Return" value={`${blendedStats.ret.toFixed(1)}%`} />
              <MetricChip label="Expected Vol" value={`${blendedStats.risk.toFixed(1)}%`} />
              <MetricChip label="Sharpe Ratio" value={blendedStats.sharpe.toFixed(2)} />
              <MetricChip label="Blended Expense" value={`${blendedStats.expense.toFixed(3)}%`} />
              <MetricChip label="Avg Turnover" value={`${blendedStats.turnover.toFixed(0)}%/yr`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Section 5: Factor Timing Signals ──────────────────────────────────────────

function TimingSection() {
  const compositeColor =
    COMPOSITE_TIMING_SCORE >= 65 ? "#22c55e" :
    COMPOSITE_TIMING_SCORE >= 40 ? "#f59e0b" : "#ef4444";

  const allocationRec = useMemo(() => {
    const recs: { factor: string; alloc: number; color: string }[] = [
      { factor: "Momentum", alloc: 28, color: "#ef4444" },
      { factor: "Profitability", alloc: 22, color: "#22c55e" },
      { factor: "Value", alloc: 18, color: "#f59e0b" },
      { factor: "Quality", alloc: 16, color: "#8b5cf6" },
      { factor: "Low Vol", alloc: 10, color: "#06b6d4" },
      { factor: "Size", alloc: 6, color: "#10b981" },
    ];
    return recs;
  }, []);

  // SVG gauge for composite score
  const gaugeAngle = (COMPOSITE_TIMING_SCORE / 100) * 180 - 90;
  const gaugeRad = (gaugeAngle * Math.PI) / 180;
  const gx = 80 + Math.cos(gaugeRad) * 54;
  const gy = 80 - Math.sin(gaugeRad) * 54;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Zap}
        title="Factor Timing Signals"
        subtitle="Macro and market-based signals that indicate relative attractiveness of each factor."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Composite score gauge */}
        <Card className="border-zinc-700/60 bg-zinc-800/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-200">Composite Timing Score</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center">
            <svg width={160} height={100} viewBox="0 0 160 100">
              <defs>
                <linearGradient id="gaugeGrad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              {/* Background arc */}
              <path
                d="M 20 80 A 60 60 0 0 1 140 80"
                fill="none"
                stroke="#27272a"
                strokeWidth={12}
                strokeLinecap="round"
              />
              {/* Score arc */}
              <path
                d={`M 20 80 A 60 60 0 0 1 ${20 + (120 * COMPOSITE_TIMING_SCORE) / 100} ${
                  80 - Math.sin((COMPOSITE_TIMING_SCORE / 100) * Math.PI) * 60
                }`}
                fill="none"
                stroke={compositeColor}
                strokeWidth={12}
                strokeLinecap="round"
                opacity={0.9}
              />
              {/* Needle */}
              <line
                x1={80}
                y1={80}
                x2={gx}
                y2={gy}
                stroke={compositeColor}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <circle cx={80} cy={80} r={4} fill={compositeColor} />
              {/* Labels */}
              <text x={80} y={68} textAnchor="middle" fontSize={20} fontWeight="700" fill={compositeColor}>
                {COMPOSITE_TIMING_SCORE}
              </text>
              <text x={80} y={96} textAnchor="middle" fontSize={9} fill="#71717a">
                {COMPOSITE_TIMING_SCORE >= 65 ? "Favorable" : COMPOSITE_TIMING_SCORE >= 40 ? "Neutral" : "Unfavorable"}
              </text>
              <text x={14} y={92} textAnchor="start" fontSize={8} fill="#71717a">0</text>
              <text x={146} y={92} textAnchor="end" fontSize={8} fill="#71717a">100</text>
            </svg>
            {/* Allocation recommendation donut */}
            <div className="w-full mt-2">
              <div className="text-xs font-medium text-zinc-400 mb-2 text-center">Recommended Factor Tilt</div>
              {allocationRec.map((r) => (
                <div key={r.factor} className="flex items-center gap-2 mb-1.5">
                  <span className="w-20 text-xs text-zinc-300">{r.factor}</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-700 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.alloc}%`, backgroundColor: r.color }} />
                  </div>
                  <span className="text-xs text-zinc-400 w-8 text-right">{r.alloc}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Individual timing signals */}
        <div className="lg:col-span-2 space-y-3">
          {TIMING_SIGNALS.map((ts, i) => (
            <motion.div
              key={ts.factor}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="border-zinc-700/60 bg-zinc-800/40">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold text-white">{ts.factor} Factor</span>
                      <span className="text-xs text-zinc-500 ml-2">{ts.metric}</span>
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: ts.color + "25", color: ts.color }}
                    >
                      {ts.signal}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-center">
                      <div className="text-xs text-zinc-500">Current</div>
                      <div className="text-sm font-semibold text-white">{ts.value}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-zinc-500">Hist. Avg</div>
                      <div className="text-sm text-zinc-300">{ts.hist_avg}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-zinc-500 mb-1">
                        <span>Timing Score</span>
                        <span>{ts.score}/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${ts.score}%`, backgroundColor: ts.color }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400">{ts.interpretation}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section 6: Factor Portfolio Construction ──────────────────────────────────

function PortfolioConstructionSection() {
  const [implementationType, setImplementationType] = useState<"long-only" | "long-short">("long-only");
  const [rebalancePeriod, setRebalancePeriod] = useState<"monthly" | "quarterly">("quarterly");
  const [factorWeights, setFactorWeights] = useState<Record<string, number>>({
    value: 20, momentum: 25, quality: 30, lowvol: 15, size: 10,
  });

  const portfolio = useMemo(() => {
    const base = implementationType === "long-only"
      ? { ret: 10.4, vol: 14.2, sharpe: 1.18, maxDD: 18.4 }
      : { ret: 14.8, vol: 9.8, sharpe: 1.62, maxDD: 12.1 };
    const costAdj = rebalancePeriod === "monthly" ? -0.8 : -0.3;
    const lsCost = implementationType === "long-short" ? -1.2 : 0;
    return {
      ret: base.ret + costAdj + lsCost,
      vol: base.vol,
      sharpe: base.sharpe + (costAdj + lsCost) / base.vol,
      maxDD: base.maxDD,
      turnover: rebalancePeriod === "monthly" ? 120 : 55,
      txCostBps: rebalancePeriod === "monthly" ? 38 : 18,
    };
  }, [implementationType, rebalancePeriod]);

  // Multi-factor composite scores for sample stocks
  const stockScores = useMemo(() => {
    resetSeed(200);
    return [
      "MSFT", "AAPL", "GOOGL", "META", "NVDA",
      "JNJ",  "PG",   "KO",   "WMT",   "UNH",
    ].map((ticker) => ({
      ticker,
      value:    Math.round(rand() * 100),
      momentum: Math.round(rand() * 100),
      quality:  Math.round(rand() * 100),
      lowvol:   Math.round(rand() * 100),
      size:     Math.round(rand() * 100),
    }));
  }, []);

  function compositeScore(s: typeof stockScores[0]) {
    const total = Object.values(factorWeights).reduce((a, b) => a + b, 0);
    if (total === 0) return 50;
    return Math.round(
      (factorWeights.value * s.value +
        factorWeights.momentum * s.momentum +
        factorWeights.quality * s.quality +
        factorWeights.lowvol * s.lowvol +
        factorWeights.size * s.size) /
      total
    );
  }

  const scored = stockScores.map((s) => ({ ...s, composite: compositeScore(s) })).sort((a, b) => b.composite - a.composite);

  const capacityConstraints = [
    { factor: "Value", capacityB: 320, warning: false, note: "Broad universe — high AUM capacity." },
    { factor: "Momentum", capacityB: 180, warning: false, note: "High turnover limits capacity at large scale." },
    { factor: "Quality", capacityB: 280, warning: false, note: "Large-cap quality has ample capacity." },
    { factor: "Low Vol", capacityB: 240, warning: false, note: "Moderate capacity; crowding possible at scale." },
    { factor: "Size", capacityB: 45, warning: true, note: "Small-cap universe severely capacity-constrained." },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Filter}
        title="Factor Portfolio Construction"
        subtitle="Implementation choices, transaction cost erosion, capacity constraints, and multi-factor stock scoring."
      />

      {/* Implementation type toggle */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-zinc-700/60 bg-zinc-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200">Implementation & Rebalancing</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <div className="text-xs text-zinc-400 mb-2">Implementation Type</div>
              <div className="grid grid-cols-2 gap-2">
                {(["long-only", "long-short"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setImplementationType(t)}
                    className={cn(
                      "rounded-lg border p-3 text-sm font-medium transition-all",
                      implementationType === t
                        ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                        : "border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:border-zinc-600"
                    )}
                  >
                    {t === "long-only" ? "Long Only" : "Long / Short"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {implementationType === "long-only"
                  ? "Long-only: lower costs, higher capacity, suitable for retail. Pure factor exposure limited by benchmark constraints."
                  : "Long/short: pure factor exposure, lower beta, but requires leverage, prime brokerage, and higher costs."}
              </p>
            </div>
            <div>
              <div className="text-xs text-zinc-400 mb-2">Rebalancing Frequency</div>
              <div className="grid grid-cols-2 gap-2">
                {(["monthly", "quarterly"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRebalancePeriod(r)}
                    className={cn(
                      "rounded-lg border p-3 text-sm font-medium transition-all capitalize",
                      rebalancePeriod === r
                        ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                        : "border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:border-zinc-600"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {/* Expected portfolio stats */}
            <div className="pt-2 border-t border-zinc-700/50">
              <div className="text-xs text-zinc-400 mb-3">Expected Portfolio Characteristics</div>
              <div className="grid grid-cols-2 gap-3">
                <MetricChip label="Net Return" value={`${portfolio.ret.toFixed(1)}%`} />
                <MetricChip label="Volatility" value={`${portfolio.vol.toFixed(1)}%`} />
                <MetricChip label="Sharpe Ratio" value={portfolio.sharpe.toFixed(2)} />
                <MetricChip label="Max Drawdown" value={`-${portfolio.maxDD.toFixed(1)}%`} />
                <MetricChip label="Turnover/yr" value={`${portfolio.turnover}%`} />
                <MetricChip label="Tx Cost (bps)" value={`${portfolio.txCostBps} bps`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacity constraints */}
        <Card className="border-zinc-700/60 bg-zinc-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200">Factor Capacity Constraints</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {capacityConstraints.map((c) => (
              <div key={c.factor} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-200">{c.factor}</span>
                  <div className="flex items-center gap-2">
                    {c.warning && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="text-xs text-zinc-400">${c.capacityB.toFixed(0)}B capacity</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", c.warning ? "bg-amber-500" : "bg-emerald-500")}
                    style={{ width: `${Math.min((c.capacityB / 350) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500">{c.note}</p>
              </div>
            ))}

            {/* Tx cost erosion */}
            <div className="pt-3 border-t border-zinc-700/50">
              <div className="text-xs font-medium text-zinc-400 mb-2">Transaction Cost Alpha Erosion</div>
              <svg width="100%" height="80" viewBox="0 0 300 80">
                {[
                  { label: "Gross Alpha", val: 3.2, color: "#6366f1" },
                  { label: "Less Tx Costs", val: -0.8, color: "#ef4444" },
                  { label: "Less Mgmt Fee", val: -0.6, color: "#f59e0b" },
                  { label: "Net Alpha", val: 1.8, color: "#22c55e" },
                ].map((item, i) => (
                  <g key={item.label}>
                    <text x={2} y={i * 19 + 13} fontSize={10} fill="#a1a1aa">{item.label}</text>
                    <rect
                      x={100}
                      y={i * 19 + 3}
                      width={Math.abs(item.val) / 3.2 * 150}
                      height={14}
                      fill={item.color}
                      rx={2}
                      opacity={0.8}
                    />
                    <text x={100 + Math.abs(item.val) / 3.2 * 150 + 4} y={i * 19 + 14} fontSize={10} fill={item.color}>
                      {item.val > 0 ? "+" : ""}{item.val.toFixed(1)}%
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-factor scoring */}
      <Card className="border-zinc-700/60 bg-zinc-800/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-zinc-200">Multi-Factor Stock Scoring</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Factor weight sliders */}
          <div className="grid sm:grid-cols-5 gap-4 mb-4">
            {(["value", "momentum", "quality", "lowvol", "size"] as const).map((f) => (
              <div key={f}>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span className="capitalize">{f}</span>
                  <span>{factorWeights[f]}%</span>
                </div>
                <Slider
                  value={[factorWeights[f]]}
                  onValueChange={([v]) => setFactorWeights((prev) => ({ ...prev, [f]: v }))}
                  min={0}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Stock ranking table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-700/50">
                  <th className="text-left py-2 pr-4 text-zinc-400 font-medium">Rank</th>
                  <th className="text-left py-2 pr-4 text-zinc-400 font-medium">Ticker</th>
                  <th className="text-center py-2 px-2 text-zinc-400 font-medium">Value</th>
                  <th className="text-center py-2 px-2 text-zinc-400 font-medium">Momentum</th>
                  <th className="text-center py-2 px-2 text-zinc-400 font-medium">Quality</th>
                  <th className="text-center py-2 px-2 text-zinc-400 font-medium">Low Vol</th>
                  <th className="text-center py-2 px-2 text-zinc-400 font-medium">Size</th>
                  <th className="text-right py-2 pl-4 text-zinc-400 font-medium">Composite</th>
                </tr>
              </thead>
              <tbody>
                {scored.map((stock, idx) => {
                  const scoreColor =
                    stock.composite >= 70 ? "#22c55e" :
                    stock.composite >= 50 ? "#f59e0b" : "#ef4444";
                  return (
                    <motion.tr
                      key={stock.ticker}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-zinc-800/80"
                    >
                      <td className="py-2 pr-4 text-zinc-500 font-mono">#{idx + 1}</td>
                      <td className="py-2 pr-4 font-semibold text-white">{stock.ticker}</td>
                      {(["value", "momentum", "quality", "lowvol", "size"] as const).map((f) => {
                        const v = stock[f];
                        const c = v >= 70 ? "#22c55e" : v >= 40 ? "#f59e0b" : "#ef4444";
                        return (
                          <td key={f} className="py-2 px-2 text-center">
                            <span
                              className="inline-block w-8 h-5 rounded text-center text-xs leading-5 font-medium"
                              style={{ backgroundColor: c + "25", color: c }}
                            >
                              {v}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-2 pl-4 text-right">
                        <span
                          className="inline-block px-2 py-0.5 rounded font-semibold text-xs"
                          style={{ backgroundColor: scoreColor + "25", color: scoreColor }}
                        >
                          {stock.composite}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            Composite score = weighted average of individual factor percentile ranks. Top-scored stocks form the long portfolio; bottom-scored form the short book in L/S implementations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page Root ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: "zoo",          label: "Factor Zoo",       icon: Layers },
  { id: "ff",           label: "FF Models",        icon: BarChart3 },
  { id: "performance",  label: "Performance",      icon: Activity },
  { id: "smartbeta",   label: "Smart Beta",       icon: DollarSign },
  { id: "timing",       label: "Timing",           icon: Zap },
  { id: "construction", label: "Construction",     icon: Filter },
] as const;
type TabId = typeof TABS[number]["id"];

export default function FactorInvestingPage() {
  const [activeTab, setActiveTab] = useState<TabId>("zoo");

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Factor Investing</h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                Academic risk premia · Fama-French models · Smart beta · Factor timing
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                12 Factors
              </Badge>
              <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30 text-xs">
                <Target className="w-3 h-3 mr-1" />
                Live Signals
              </Badge>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-0.5 scrollbar-none">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  activeTab === id
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "zoo"          && <FactorZooSection />}
            {activeTab === "ff"           && <FamaFrenchSection />}
            {activeTab === "performance"  && <PerformanceSection />}
            {activeTab === "smartbeta"   && <SmartBetaSection />}
            {activeTab === "timing"       && <TimingSection />}
            {activeTab === "construction" && <PortfolioConstructionSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
