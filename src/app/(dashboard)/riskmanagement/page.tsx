"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  Target,
  Layers,
  Activity,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 19;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed: number = 19) {
  s = seed;
}

// Normal distribution helpers
function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + p * ax);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function invNorm(p: number): number {
  // Rational approximation for inverse normal CDF
  if (p <= 0) return -6;
  if (p >= 1) return 6;
  const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5; r = q * q;
    return (((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q /
      (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

// ── Static Data ────────────────────────────────────────────────────────────────

const POSITIONS = [
  { ticker: "AAPL", weight: 0.22, vol: 0.28, beta: 1.2, sector: "Tech" },
  { ticker: "MSFT", weight: 0.18, vol: 0.24, beta: 0.9, sector: "Tech" },
  { ticker: "NVDA", weight: 0.15, vol: 0.55, beta: 1.8, sector: "Tech" },
  { ticker: "AMZN", weight: 0.12, vol: 0.32, beta: 1.3, sector: "Consumer" },
  { ticker: "GOOGL", weight: 0.10, vol: 0.27, beta: 1.1, sector: "Tech" },
  { ticker: "SPY",  weight: 0.13, vol: 0.16, beta: 1.0, sector: "ETF" },
  { ticker: "TLT",  weight: 0.10, vol: 0.14, beta: -0.2, sector: "Bonds" },
];

const PORTFOLIO_VALUE = 500_000;

const HISTORICAL_SCENARIOS = [
  { name: "1987 Black Monday",    year: 1987, equityShock: -0.22, bondShock:  0.03, creditShock: 0.04 },
  { name: "1998 LTCM Crisis",     year: 1998, equityShock: -0.19, bondShock:  0.04, creditShock: 0.06 },
  { name: "2000 Dot-com Crash",   year: 2000, equityShock: -0.49, bondShock:  0.06, creditShock: 0.03 },
  { name: "2008 GFC",             year: 2008, equityShock: -0.55, bondShock:  0.08, creditShock: 0.12 },
  { name: "2010 Flash Crash",     year: 2010, equityShock: -0.09, bondShock:  0.01, creditShock: 0.02 },
  { name: "2020 COVID Crash",     year: 2020, equityShock: -0.34, bondShock:  0.04, creditShock: 0.05 },
  { name: "2022 Rate Shock",      year: 2022, equityShock: -0.25, bondShock: -0.18, creditShock: 0.03 },
  { name: "2023 Banking Crisis",  year: 2023, equityShock: -0.12, bondShock:  0.02, creditShock: 0.04 },
];

// ── Gauge SVG ─────────────────────────────────────────────────────────────────

interface GaugeProps {
  value: number;   // 0–100
  label: string;
  sublabel: string;
  greenMax?: number;
  yellowMax?: number;
}

function GaugeSVG({ value, label, sublabel, greenMax = 33, yellowMax = 66 }: GaugeProps) {
  const W = 160, H = 100;
  const cx = W / 2, cy = H - 10;
  const r = 72;
  const startAngle = Math.PI;
  const endAngle = 0;
  const totalAng = Math.PI;

  function arc(fromPct: number, toPct: number, color: string) {
    const fa = startAngle - fromPct * totalAng;
    const ta = startAngle - toPct * totalAng;
    const x1 = cx + r * Math.cos(fa), y1 = cy - r * Math.sin(fa);
    const x2 = cx + r * Math.cos(ta), y2 = cy - r * Math.sin(ta);
    const large = Math.abs(toPct - fromPct) > 0.5 ? 1 : 0;
    return (
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={14}
        strokeLinecap="butt"
      />
    );
  }

  const needleAngle = startAngle - (value / 100) * totalAng;
  const needleLen = 58;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  const color = value <= greenMax ? "#22c55e" : value <= yellowMax ? "#f59e0b" : "#ef4444";

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-auto">
      {arc(0, greenMax / 100, "#16a34a44")}
      {arc(greenMax / 100, yellowMax / 100, "#d9770644")}
      {arc(yellowMax / 100, 1, "#dc262644")}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      <text x={cx} y={cy - 20} textAnchor="middle" fontSize={13} fontWeight="700" fill={color}>{label}</text>
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={9} fill="#94a3b8">{sublabel}</text>
    </svg>
  );
}

// ── Horizontal bar ─────────────────────────────────────────────────────────────

function HBar({ label, value, maxVal, color = "#6366f1" }: { label: string; value: number; maxVal: number; color?: string }) {
  const pct = Math.min(100, (value / maxVal) * 100);
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-xs text-muted-foreground w-14 shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-2 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-12 text-right">{value.toFixed(1)}%</span>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = "text-foreground" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-muted/60 rounded-md p-4 border border-border/20">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={cn("text-xl font-semibold", color)}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Risk Metrics Dashboard
// ══════════════════════════════════════════════════════════════════════════════

function RiskMetricsDashboard() {
  resetSeed(19);

  const portfolioVol = useMemo(() => {
    // Weighted avg vol (simplified, no correlation matrix here)
    const wv = POSITIONS.reduce((acc, p) => acc + p.weight * p.vol, 0);
    // Diversification reduces it ~30%
    return wv * 0.70;
  }, []);

  const var95 = portfolioVol * invNorm(0.95) * PORTFOLIO_VALUE / Math.sqrt(252);
  const var99 = portfolioVol * invNorm(0.99) * PORTFOLIO_VALUE / Math.sqrt(252);
  const cvar95 = var95 * 1.30;
  const cvar99 = var99 * 1.28;
  const maxDD = portfolioVol * 2.8 * 100; // approximate % max drawdown
  const realizedVol = portfolioVol * 100;
  const impliedVol = realizedVol * 1.15;

  // Risk decomposition
  const factorRisk = 62;
  const idioRisk = 38;

  // Diversification ratio
  const weightedAvgVol = POSITIONS.reduce((acc, p) => acc + p.weight * p.vol, 0);
  const divRatio = weightedAvgVol / portfolioVol;

  // VaR contribution per position (simplified marginal VaR)
  const varContributions = POSITIONS.map(p => ({
    ticker: p.ticker,
    contrib: p.weight * p.beta * p.vol * 100,
  }));
  const maxContrib = Math.max(...varContributions.map(v => v.contrib));

  // Pie chart data
  const pieR = 55, pieCx = 80, pieCy = 70;
  const factorAngle = (factorRisk / 100) * 2 * Math.PI;

  function pieSlice(startA: number, endA: number, color: string) {
    const x1 = pieCx + pieR * Math.cos(startA - Math.PI / 2);
    const y1 = pieCy + pieR * Math.sin(startA - Math.PI / 2);
    const x2 = pieCx + pieR * Math.cos(endA - Math.PI / 2);
    const y2 = pieCy + pieR * Math.sin(endA - Math.PI / 2);
    const large = endA - startA > Math.PI ? 1 : 0;
    return `M ${pieCx} ${pieCy} L ${x1} ${y1} A ${pieR} ${pieR} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="space-y-4">
      {/* Top gauges */}
      <div>
        <SectionHeader title="Portfolio Risk Metrics" sub="Based on current positions & 1-day horizon" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-muted/60 rounded-md p-3 border border-border/20 text-center">
            <GaugeSVG
              value={Math.min(99, (Math.abs(var95) / PORTFOLIO_VALUE) * 2000)}
              label={`$${(var95 / 1000).toFixed(1)}k`}
              sublabel="VaR 95%"
              greenMax={30} yellowMax={60}
            />
            <div className="text-xs text-muted-foreground mt-1">Value at Risk 95%</div>
            <div className="text-xs text-muted-foreground">1-day</div>
          </div>
          <div className="bg-muted/60 rounded-md p-3 border border-border/20 text-center">
            <GaugeSVG
              value={Math.min(99, (Math.abs(var99) / PORTFOLIO_VALUE) * 1500)}
              label={`$${(var99 / 1000).toFixed(1)}k`}
              sublabel="VaR 99%"
              greenMax={30} yellowMax={60}
            />
            <div className="text-xs text-muted-foreground mt-1">Value at Risk 99%</div>
            <div className="text-xs text-muted-foreground">1-day</div>
          </div>
          <div className="bg-muted/60 rounded-md p-3 border border-border/20 text-center">
            <GaugeSVG
              value={Math.min(99, maxDD * 1.2)}
              label={`${maxDD.toFixed(1)}%`}
              sublabel="Max Drawdown"
              greenMax={20} yellowMax={50}
            />
            <div className="text-xs text-muted-foreground mt-1">Max Drawdown</div>
            <div className="text-xs text-muted-foreground">historical est.</div>
          </div>
          <div className="bg-muted/60 rounded-md p-3 border border-border/20 text-center">
            <GaugeSVG
              value={Math.min(99, realizedVol * 2)}
              label={`${realizedVol.toFixed(1)}%`}
              sublabel="Realized Vol"
              greenMax={25} yellowMax={55}
            />
            <div className="text-xs text-muted-foreground mt-1">Realized Volatility</div>
            <div className="text-xs text-muted-foreground">annualized</div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="CVaR 95%" value={`$${(cvar95 / 1000).toFixed(1)}k`} sub="Expected Shortfall" color="text-red-400" />
        <StatCard label="CVaR 99%" value={`$${(cvar99 / 1000).toFixed(1)}k`} sub="Tail loss avg" color="text-red-500" />
        <StatCard label="Implied Vol" value={`${impliedVol.toFixed(1)}%`} sub="Options-derived" color="text-amber-400" />
        <StatCard label="Div. Ratio" value={divRatio.toFixed(2)} sub="Weighted / Port vol" color="text-green-400" />
      </div>

      {/* Risk decomposition + VaR budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Pie: factor vs idiosyncratic */}
        <div className="bg-muted/60 rounded-md p-6 border border-border/20 border-l-4 border-l-primary">
          <SectionHeader title="Risk Decomposition" sub="Factor risk vs idiosyncratic risk" />
          <div className="flex items-center gap-3">
            <svg width={160} height={140} viewBox="0 0 160 140">
              <path d={pieSlice(0, factorAngle, "#6366f1")} fill="#6366f1" opacity={0.85} />
              <path d={pieSlice(factorAngle, 2 * Math.PI, "#f59e0b")} fill="#f59e0b" opacity={0.85} />
              <circle cx={pieCx} cy={pieCy} r={28} fill="#1e293b" />
              <text x={pieCx} y={pieCy + 4} textAnchor="middle" fontSize={10} fill="#e2e8f0" fontWeight="600">Risk</text>
            </svg>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-indigo-500" />
                <div>
                  <div className="text-sm font-medium text-foreground">Factor Risk</div>
                  <div className="text-lg font-semibold text-indigo-400">{factorRisk}%</div>
                  <div className="text-xs text-muted-foreground">Market, sector, size</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-amber-500" />
                <div>
                  <div className="text-sm font-medium text-foreground">Idiosyncratic</div>
                  <div className="text-lg font-medium text-amber-400">{idioRisk}%</div>
                  <div className="text-xs text-muted-foreground">Stock-specific risk</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VaR budget */}
        <div className="bg-muted/60 rounded-md p-4 border border-border/20">
          <SectionHeader title="Risk Budget (VaR Contribution)" sub="Each position's % contribution to portfolio VaR" />
          <div className="space-y-1">
            {varContributions.map(({ ticker, contrib }) => (
              <HBar
                key={ticker}
                label={ticker}
                value={contrib}
                maxVal={maxContrib * 1.1}
                color={ticker === "TLT" ? "#22c55e" : contrib > maxContrib * 0.7 ? "#ef4444" : "#6366f1"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — VaR Models
// ══════════════════════════════════════════════════════════════════════════════

function VaRModels() {
  resetSeed(42);

  // Generate 500 daily returns
  const returns500 = useMemo(() => {
    resetSeed(42);
    return Array.from({ length: 500 }, () => {
      // Fat-tailed returns via sum of normals + occasional shock
      const base = (rand() * 2 - 1) * 0.015;
      const shock = rand() < 0.05 ? (rand() * 2 - 1) * 0.04 : 0;
      return base + shock;
    }).sort((a, b) => a - b);
  }, []);

  const var95hist = -returns500[Math.floor(500 * 0.05)];
  const var99hist = -returns500[Math.floor(500 * 0.01)];

  const portfolioVol = 0.185;
  const var95param = portfolioVol / Math.sqrt(252) * invNorm(0.95);
  const var99param = portfolioVol / Math.sqrt(252) * invNorm(0.99);

  // Monte Carlo VaR
  const mcReturns = useMemo(() => {
    resetSeed(77);
    return Array.from({ length: 1000 }, () => {
      const u = rand();
      return invNorm(u) * portfolioVol / Math.sqrt(252);
    }).sort((a, b) => a - b);
  }, []);
  const var95mc = -mcReturns[Math.floor(1000 * 0.05)];
  const var99mc = -mcReturns[Math.floor(1000 * 0.01)];

  // Backtesting — generate 250 days of returns & compare to VaR
  const backtestReturns = useMemo(() => {
    resetSeed(33);
    return Array.from({ length: 250 }, () => {
      const base = (rand() * 2 - 1) * 0.012;
      const shock = rand() < 0.06 ? (rand() * 2 - 1) * 0.035 : 0;
      return base + shock;
    });
  }, []);
  const varThreshold = var95hist;
  const breaches = backtestReturns.filter(r => r < -varThreshold).length;
  const backtestColor = breaches < 5 ? "#22c55e" : breaches < 10 ? "#f59e0b" : "#ef4444";
  const backtestStatus = breaches < 5 ? "Green Zone" : breaches < 10 ? "Yellow Zone" : "Red Zone";

  // Histogram SVG
  const histW = 460, histH = 140;
  const bins = 40;
  const minR = returns500[0], maxR = returns500[returns500.length - 1];
  const binW = (maxR - minR) / bins;
  const counts = Array(bins).fill(0);
  returns500.forEach(r => {
    const idx = Math.min(bins - 1, Math.floor((r - minR) / binW));
    counts[idx]++;
  });
  const maxCount = Math.max(...counts);
  const pad = { l: 30, r: 10, t: 10, b: 25 };
  const gW = histW - pad.l - pad.r;
  const gH = histH - pad.t - pad.b;
  const bw = gW / bins;

  const var95x = pad.l + ((-var95hist - minR) / (maxR - minR)) * gW;
  const var99x = pad.l + ((-var99hist - minR) / (maxR - minR)) * gW;

  // Normal curve SVG overlay
  const normalCurvePoints = Array.from({ length: 100 }, (_, i) => {
    const x = minR + (i / 99) * (maxR - minR);
    const y = normalPDF(x / (portfolioVol / Math.sqrt(252))) / (portfolioVol / Math.sqrt(252));
    const px = pad.l + ((x - minR) / (maxR - minR)) * gW;
    const py = pad.t + gH - (y / 10) * gH * 0.8;
    return `${px},${py}`;
  }).join(" ");

  // Fan chart for Monte Carlo
  const fanW = 460, fanH = 140;
  const days = 30;
  const fanPaths = useMemo(() => {
    resetSeed(55);
    const paths: string[][] = Array.from({ length: 12 }, () => ["", ""]);
    // Percentile bands
    const sims: number[][] = [];
    for (let i = 0; i < 200; i++) {
      const path = [0];
      for (let d = 1; d <= days; d++) {
        const ret = invNorm(rand()) * portfolioVol / Math.sqrt(252);
        path.push(path[d - 1] + ret);
      }
      sims.push(path);
    }
    const pcts = [1, 5, 10, 25, 50, 75, 90, 95, 99];
    return pcts.map(p => {
      return sims.map(s => s).sort((a, b) => a[days] - b[days])[Math.floor((p / 100) * 200)];
    });
  }, []);

  const fanPad = { l: 30, r: 10, t: 10, b: 25 };
  const fanGW = fanW - fanPad.l - fanPad.r;
  const fanGH = fanH - fanPad.t - fanPad.b;

  function simToPath(sim: number[]): string {
    const minVal = -0.15, maxVal = 0.15;
    return sim.map((v, i) => {
      const px = fanPad.l + (i / days) * fanGW;
      const py = fanPad.t + fanGH / 2 - (v / (maxVal - minVal)) * fanGH;
      return `${i === 0 ? "M" : "L"} ${px} ${py}`;
    }).join(" ");
  }

  const fanColors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];

  return (
    <div className="space-y-4">
      {/* Model comparison table */}
      <div className="bg-muted/60 rounded-md p-4 border border-border/20">
        <SectionHeader title="VaR Model Comparison" sub="1-day VaR as % of portfolio" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="text-left py-2 font-medium">Model</th>
                <th className="text-right py-2 font-medium">VaR 95%</th>
                <th className="text-right py-2 font-medium">VaR 99%</th>
                <th className="text-right py-2 font-medium">Assumptions</th>
                <th className="text-right py-2 font-medium">Best For</th>
              </tr>
            </thead>
            <tbody>
              {[
                { model: "Historical Sim.", v95: var95hist, v99: var99hist, assume: "Non-parametric", best: "Fat tails" },
                { model: "Parametric",     v95: var95param, v99: var99param, assume: "Normal dist.",  best: "Speed" },
                { model: "Monte Carlo",    v95: var95mc,   v99: var99mc,   assume: "Simulation",   best: "Complex portfolios" },
              ].map(row => (
                <tr key={row.model} className="border-b border-border/20 hover:bg-muted/20">
                  <td className="py-2 text-foreground font-medium">{row.model}</td>
                  <td className="py-2 text-right text-amber-400">{(row.v95 * 100).toFixed(2)}%</td>
                  <td className="py-2 text-right text-red-400">{(row.v99 * 100).toFixed(2)}%</td>
                  <td className="py-2 text-right text-muted-foreground">{row.assume}</td>
                  <td className="py-2 text-right text-muted-foreground">{row.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Historical simulation histogram */}
        <div className="bg-muted/60 rounded-md p-4 border border-border/20">
          <SectionHeader title="Historical Simulation" sub="500-day return distribution" />
          <svg width={histW} height={histH} viewBox={`0 0 ${histW} ${histH}`} className="w-full">
            {counts.map((c, i) => {
              const bx = pad.l + i * bw;
              const bh = (c / maxCount) * gH;
              const by = pad.t + gH - bh;
              const midR = minR + (i + 0.5) * binW;
              const isLoss = midR < -var95hist;
              return (
                <rect key={i} x={bx} y={by} width={bw - 0.5} height={bh}
                  fill={isLoss ? "#ef4444aa" : "#6366f1aa"} rx={1} />
              );
            })}
            {/* VaR lines */}
            <line x1={var95x} y1={pad.t} x2={var95x} y2={pad.t + gH} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,2" />
            <line x1={var99x} y1={pad.t} x2={var99x} y2={pad.t + gH} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4,2" />
            <text x={var95x - 2} y={pad.t + 8} textAnchor="end" fontSize={8} fill="#f59e0b">95%</text>
            <text x={var99x - 2} y={pad.t + 16} textAnchor="end" fontSize={8} fill="#ef4444">99%</text>
            {/* Axes */}
            <line x1={pad.l} y1={pad.t + gH} x2={pad.l + gW} y2={pad.t + gH} stroke="#475569" />
            <text x={pad.l} y={histH - 5} fontSize={8} fill="#94a3b8">{(minR * 100).toFixed(1)}%</text>
            <text x={pad.l + gW} y={histH - 5} textAnchor="end" fontSize={8} fill="#94a3b8">{(maxR * 100).toFixed(1)}%</text>
          </svg>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />VaR 95%: {(var95hist * 100).toFixed(2)}%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />VaR 99%: {(var99hist * 100).toFixed(2)}%</span>
          </div>
        </div>

        {/* Parametric: normal vs fat tail */}
        <div className="bg-muted/60 rounded-md p-4 border border-border/20">
          <SectionHeader title="Parametric vs Fat-Tail" sub="Normal dist. vs empirical" />
          <svg width={histW} height={histH} viewBox={`0 0 ${histW} ${histH}`} className="w-full">
            {/* Normal curve */}
            <polyline points={normalCurvePoints} fill="none" stroke="#6366f1" strokeWidth={2} />
            {/* Fat tail: slightly wider / lower peak normal */}
            <polyline
              points={Array.from({ length: 100 }, (_, i) => {
                const x = minR + (i / 99) * (maxR - minR);
                const sigma = portfolioVol / Math.sqrt(252) * 1.4;
                const y = normalPDF(x / sigma) / sigma * 0.65;
                const px = pad.l + ((x - minR) / (maxR - minR)) * gW;
                const py = pad.t + gH - (y / 10) * gH * 0.8;
                return `${px},${py}`;
              }).join(" ")}
              fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5,3"
            />
            <line x1={pad.l} y1={pad.t + gH} x2={pad.l + gW} y2={pad.t + gH} stroke="#475569" />
            <text x={pad.l + gW / 2} y={pad.t + 10} textAnchor="middle" fontSize={8} fill="#6366f1">Normal</text>
            <text x={pad.l + gW * 0.85} y={pad.t + 20} textAnchor="middle" fontSize={8} fill="#f59e0b">Fat-tail</text>
          </svg>
          <p className="text-xs text-muted-foreground mt-2">
            Fat-tail distribution has heavier tails — underestimates extreme losses if using normal model.
          </p>
        </div>
      </div>

      {/* Monte Carlo fan chart */}
      <div className="bg-muted/60 rounded-md p-4 border border-border/20">
        <SectionHeader title="Monte Carlo VaR" sub="1,000 portfolio simulations — 30-day horizon fan chart" />
        <svg width={fanW} height={fanH} viewBox={`0 0 ${fanW} ${fanH}`} className="w-full">
          {fanPaths.map((sim, i) => (
            <path key={i} d={simToPath(sim)} fill="none" stroke={fanColors[i]} strokeWidth={1.5} opacity={0.6} />
          ))}
          {/* Zero line */}
          <line
            x1={fanPad.l} y1={fanPad.t + fanGH / 2}
            x2={fanPad.l + fanGW} y2={fanPad.t + fanGH / 2}
            stroke="#475569" strokeDasharray="3,3"
          />
          <text x={fanPad.l - 2} y={fanPad.t + fanGH / 2 + 4} textAnchor="end" fontSize={8} fill="#94a3b8">0%</text>
          <line x1={fanPad.l} y1={fanPad.t} x2={fanPad.l} y2={fanPad.t + fanGH} stroke="#475569" />
          <text x={fanPad.l + fanGW / 2} y={fanH - 5} textAnchor="middle" fontSize={8} fill="#94a3b8">Days</text>
        </svg>
        <div className="grid grid-cols-3 gap-3 mt-3 text-center text-xs text-muted-foreground">
          <div className="bg-muted/40 rounded p-2">
            <div className="text-muted-foreground">MC VaR 95%</div>
            <div className="font-medium text-amber-400">{(var95mc * 100).toFixed(2)}%</div>
          </div>
          <div className="bg-muted/40 rounded p-2">
            <div className="text-muted-foreground">MC VaR 99%</div>
            <div className="font-medium text-red-400">{(var99mc * 100).toFixed(2)}%</div>
          </div>
          <div className="bg-muted/40 rounded p-2">
            <div className="text-muted-foreground">Simulations</div>
            <div className="font-medium text-foreground">1,000</div>
          </div>
        </div>
      </div>

      {/* Backtesting */}
      <div className="bg-muted/60 rounded-md p-4 border border-border/20">
        <SectionHeader title="VaR Backtesting — Traffic Light Test" sub="Count VaR breaches over 250 trading days" />
        <div className="flex items-center gap-3">
          <div
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 shrink-0"
            style={{ borderColor: backtestColor }}
          >
            <span className="text-2xl font-semibold" style={{ color: backtestColor }}>{breaches}</span>
            <span className="text-xs text-muted-foreground">breaches</span>
          </div>
          <div>
            <Badge style={{ backgroundColor: backtestColor + "33", color: backtestColor, borderColor: backtestColor + "55" }}>
              {backtestStatus}
            </Badge>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> &lt;5 breaches → Green Zone (model accurate)</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 5–9 breaches → Yellow Zone (under review)</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> ≥10 breaches → Red Zone (model rejected)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Stress Testing
// ══════════════════════════════════════════════════════════════════════════════

function StressTesting() {
  const [equityShock, setEquityShock] = useState([-20]);
  const [rateShock, setRateShock] = useState([100]);
  const [creditShock, setCreditShock] = useState([50]);
  const [expandedScenario, setExpandedScenario] = useState<number | null>(null);

  // Portfolio allocation: 75% equity, 10% bonds, 15% other
  const equityAlloc = 0.75;
  const bondAlloc = 0.10;

  function calcImpact(scenario: typeof HISTORICAL_SCENARIOS[0]) {
    const equityImpact = scenario.equityShock * equityAlloc;
    const bondImpact = scenario.bondShock * bondAlloc;
    const totalImpact = equityImpact + bondImpact - scenario.creditShock * 0.05;
    return { equityImpact, bondImpact, totalImpact };
  }

  function customImpact() {
    const eq = (equityShock[0] / 100) * equityAlloc;
    const bd = (-rateShock[0] / 10000) * 7 * bondAlloc; // duration 7y
    const cr = (-creditShock[0] / 10000) * 5 * 0.05;    // 5y credit
    return eq + bd + cr;
  }

  // Reverse stress: what equity shock to lose 20%?
  const reverseShock = (-0.20 - (-rateShock[0] / 10000) * 7 * bondAlloc) / equityAlloc;

  // Correlation spike chart
  const corrW = 360, corrH = 120;
  const corrPad = { l: 30, r: 10, t: 10, b: 25 };
  const corrGW = corrW - corrPad.l - corrPad.r;
  const corrGH = corrH - corrPad.t - corrPad.b;

  const normalCorr = 0.55;
  const crisisCorr = 0.92;
  const corrPoints = Array.from({ length: 100 }, (_, i) => {
    const t = i / 99;
    // Crisis spike around t=0.5
    const spike = Math.exp(-((t - 0.5) ** 2) / 0.01) * (crisisCorr - normalCorr);
    const corr = normalCorr + spike;
    const px = corrPad.l + t * corrGW;
    const py = corrPad.t + corrGH * (1 - (corr - 0.3) / 0.8);
    return `${px},${py}`;
  }).join(" ");

  const portfolioVolNormal = 0.185;
  const portfolioVolCrisis = portfolioVolNormal * Math.sqrt(1 + (crisisCorr - normalCorr) * 6) ;

  return (
    <div className="space-y-4">
      {/* Historical scenarios */}
      <div>
        <SectionHeader title="Historical Stress Scenarios" sub="Portfolio P&L impact under historical market events" />
        <div className="space-y-2">
          {HISTORICAL_SCENARIOS.map((sc, i) => {
            const { equityImpact, bondImpact, totalImpact } = calcImpact(sc);
            const dollarImpact = totalImpact * PORTFOLIO_VALUE;
            const isExpanded = expandedScenario === i;
            return (
              <motion.div
                key={sc.name}
                className="bg-muted/60 rounded-md border border-border/20 overflow-hidden"
                layout
              >
                <button
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/20"
                  onClick={() => setExpandedScenario(isExpanded ? null : i)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">{sc.year}</Badge>
                    <span className="text-sm font-medium text-foreground">{sc.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn("text-sm font-medium", totalImpact < 0 ? "text-red-400" : "text-green-400")}>
                      {totalImpact >= 0 ? "+" : ""}{(totalImpact * 100).toFixed(1)}%
                    </span>
                    <span className={cn("text-xs", totalImpact < 0 ? "text-red-400/70" : "text-green-400/70")}>
                      {dollarImpact >= 0 ? "+" : ""}${(dollarImpact / 1000).toFixed(0)}k
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-3 pb-3"
                    >
                      <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                        <div className="bg-muted/40 rounded p-2">
                          <div className="text-muted-foreground">Equity Impact</div>
                          <div className={cn("font-medium text-sm", equityImpact < 0 ? "text-red-400" : "text-green-400")}>
                            {(equityImpact * 100).toFixed(1)}%
                          </div>
                          <div className="text-muted-foreground">Equity shock: {(sc.equityShock * 100).toFixed(0)}%</div>
                        </div>
                        <div className="bg-muted/40 rounded p-2">
                          <div className="text-muted-foreground">Bond Impact</div>
                          <div className={cn("font-medium text-sm", bondImpact > 0 ? "text-green-400" : "text-red-400")}>
                            {bondImpact >= 0 ? "+" : ""}{(bondImpact * 100).toFixed(1)}%
                          </div>
                          <div className="text-muted-foreground">Bond shock: {(sc.bondShock * 100).toFixed(0)}%</div>
                        </div>
                        <div className="bg-muted/40 rounded p-2">
                          <div className="text-muted-foreground">Dollar P&L</div>
                          <div className={cn("font-medium text-sm", dollarImpact < 0 ? "text-red-400" : "text-green-400")}>
                            {dollarImpact >= 0 ? "+" : ""}${(dollarImpact / 1000).toFixed(0)}k
                          </div>
                          <div className="text-muted-foreground">of ${(PORTFOLIO_VALUE / 1000).toFixed(0)}k portfolio</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Custom scenario */}
        <div className="bg-muted/60 rounded-md p-4 border border-border/20">
          <SectionHeader title="Hypothetical Shock Scenario" sub="Adjust sliders to model custom stress event" />
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Equity Shock</span>
                <span className="text-red-400 font-medium">{equityShock[0]}%</span>
              </div>
              <Slider value={equityShock} onValueChange={setEquityShock} min={-60} max={20} step={1} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Rate Shock (bps)</span>
                <span className="text-amber-400 font-medium">+{rateShock[0]} bps</span>
              </div>
              <Slider value={rateShock} onValueChange={setRateShock} min={-200} max={400} step={10} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Credit Spread (bps)</span>
                <span className="text-orange-400 font-medium">+{creditShock[0]} bps</span>
              </div>
              <Slider value={creditShock} onValueChange={setCreditShock} min={0} max={500} step={10} className="w-full" />
            </div>
            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="text-xs text-muted-foreground mb-1">Portfolio Impact</div>
              <div className={cn("text-lg font-medium", customImpact() < 0 ? "text-red-400" : "text-green-400")}>
                {customImpact() >= 0 ? "+" : ""}{(customImpact() * 100).toFixed(2)}%
              </div>
              <div className={cn("text-sm", customImpact() < 0 ? "text-red-400/70" : "text-green-400/70")}>
                ${((customImpact() * PORTFOLIO_VALUE) / 1000).toFixed(1)}k
              </div>
            </div>
          </div>
        </div>

        {/* Reverse stress + correlation spike */}
        <div className="space-y-4">
          <div className="bg-muted/60 rounded-md p-4 border border-border/20">
            <SectionHeader title="Reverse Stress Test" sub="How severe must equity fall to lose 20% of portfolio?" />
            <div className="text-center py-3">
              <div className="text-lg font-medium text-red-400">{(reverseShock * 100).toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Required equity decline</div>
              <div className="mt-3 text-xs text-muted-foreground bg-muted/40 rounded p-2">
                With current rate scenario ({rateShock[0]} bps), equities would need to fall{" "}
                <span className="text-red-400 font-semibold">{Math.abs(reverseShock * 100).toFixed(1)}%</span>{" "}
                to cause a -20% portfolio loss.
              </div>
            </div>
          </div>

          <div className="bg-muted/60 rounded-md p-4 border border-border/20">
            <SectionHeader title="Crisis Correlation Spike" sub="Correlations rise in stress — diversification fails" />
            <svg width={corrW} height={corrH} viewBox={`0 0 ${corrW} ${corrH}`} className="w-full">
              <polyline points={corrPoints} fill="none" stroke="#6366f1" strokeWidth={2} />
              <line x1={corrPad.l} y1={corrPad.t + corrGH} x2={corrPad.l + corrGW} y2={corrPad.t + corrGH} stroke="#475569" />
              <line x1={corrPad.l} y1={corrPad.t} x2={corrPad.l} y2={corrPad.t + corrGH} stroke="#475569" />
              <text x={corrPad.l - 2} y={corrPad.t + corrGH * (1 - (normalCorr - 0.3) / 0.8) + 4} textAnchor="end" fontSize={8} fill="#94a3b8">Normal</text>
              <text x={corrPad.l + corrGW * 0.5} y={corrPad.t + corrGH * (1 - (crisisCorr - 0.3) / 0.8) - 4} textAnchor="middle" fontSize={8} fill="#ef4444">Crisis</text>
            </svg>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground text-center">
              <div className="bg-muted/40 rounded p-1">
                <div className="text-muted-foreground">Normal Corr.</div>
                <div className="font-medium text-green-400">{normalCorr.toFixed(2)}</div>
              </div>
              <div className="bg-muted/40 rounded p-1">
                <div className="text-muted-foreground">Crisis Corr.</div>
                <div className="font-medium text-red-400">{crisisCorr.toFixed(2)}</div>
              </div>
              <div className="bg-muted/40 rounded p-1">
                <div className="text-muted-foreground">Portfolio Vol (normal)</div>
                <div className="font-medium text-foreground">{(portfolioVolNormal * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-muted/40 rounded p-1">
                <div className="text-muted-foreground">Portfolio Vol (crisis)</div>
                <div className="font-medium text-red-400">{(portfolioVolCrisis * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Drawdown Analysis
// ══════════════════════════════════════════════════════════════════════════════

function DrawdownAnalysis() {
  // Generate 3 years of daily returns → cumulative → drawdown
  const { cumReturns, drawdowns, ddStats } = useMemo(() => {
    resetSeed(99);
    const n = 756; // ~3 years
    const rets: number[] = [];
    for (let i = 0; i < n; i++) {
      const base = 0.0004 + (rand() * 2 - 1) * 0.012;
      const shock = rand() < 0.04 ? (rand() * 2 - 1) * 0.04 : 0;
      rets.push(base + shock);
    }
    const cumReturns: number[] = [1];
    for (const r of rets) cumReturns.push(cumReturns[cumReturns.length - 1] * (1 + r));

    const drawdowns: number[] = [];
    let peak = 1;
    for (const v of cumReturns) {
      if (v > peak) peak = v;
      drawdowns.push((v - peak) / peak);
    }

    const minDD = Math.min(...drawdowns);
    const avgDD = drawdowns.filter(d => d < -0.005).reduce((a, b) => a + b, 0) / drawdowns.filter(d => d < -0.005).length;
    // Recovery time: find longest stretch below -5%
    let maxRecov = 0, curRecov = 0;
    for (const d of drawdowns) {
      if (d < -0.05) curRecov++;
      else { maxRecov = Math.max(maxRecov, curRecov); curRecov = 0; }
    }
    const annReturn = (Math.pow(cumReturns[cumReturns.length - 1], 252 / n) - 1);
    const calmar = annReturn / Math.abs(minDD);

    return { cumReturns, drawdowns, ddStats: { minDD, avgDD, maxRecov, calmar, annReturn } };
  }, []);

  // Monthly heatmap: 36 months
  const monthlyReturns = useMemo(() => {
    resetSeed(88);
    const months: { year: number; month: number; ret: number }[] = [];
    for (let y = 2022; y <= 2024; y++) {
      for (let m = 1; m <= 12; m++) {
        months.push({ year: y, month: m, ret: (rand() * 2 - 1) * 0.08 });
      }
    }
    return months;
  }, []);

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const YEARS = [2022, 2023, 2024];

  function heatColor(ret: number): string {
    if (ret > 0.05) return "#166534";
    if (ret > 0.02) return "#16a34a";
    if (ret > 0) return "#4ade80";
    if (ret > -0.02) return "#fca5a5";
    if (ret > -0.05) return "#ef4444";
    return "#991b1b";
  }

  // Historical drawdown episodes
  const episodes = useMemo(() => {
    resetSeed(19);
    return [
      { label: "Episode 1", peak: "Jan 2022", trough: "Mar 2022", recovery: "Jun 2022", dd: -0.182, days: 60, recovDays: 70 },
      { label: "Episode 2", peak: "Aug 2022", trough: "Oct 2022", recovery: "Jan 2023", dd: -0.131, days: 45, recovDays: 65 },
      { label: "Episode 3", peak: "Feb 2023", trough: "Mar 2023", recovery: "May 2023", dd: -0.095, days: 30, recovDays: 40 },
      { label: "Episode 4", peak: "Jul 2023", trough: "Oct 2023", recovery: "Dec 2023", dd: -0.142, days: 55, recovDays: 50 },
      { label: "Episode 5", peak: "Mar 2024", trough: "Apr 2024", recovery: null, dd: -0.078, days: 28, recovDays: null },
    ];
  }, []);

  // Pain index: magnitude × duration
  const painIndex = Math.min(100, Math.abs(ddStats.minDD) * ddStats.maxRecov * 2);

  // Underwater chart
  const uwW = 700, uwH = 150;
  const uwPad = { l: 40, r: 10, t: 10, b: 25 };
  const uwGW = uwW - uwPad.l - uwPad.r;
  const uwGH = uwH - uwPad.t - uwPad.b;
  const minDD = Math.min(...drawdowns);

  const ddPath = drawdowns.map((d, i) => {
    const px = uwPad.l + (i / (drawdowns.length - 1)) * uwGW;
    const py = uwPad.t + (1 - d / minDD) * uwGH;
    return `${i === 0 ? "M" : "L"} ${px} ${py}`;
  }).join(" ");

  const ddArea = drawdowns.map((d, i) => {
    const px = uwPad.l + (i / (drawdowns.length - 1)) * uwGW;
    const py = uwPad.t + (1 - d / minDD) * uwGH;
    return `${px},${py}`;
  });
  const areaPath = `M ${uwPad.l},${uwPad.t} ${ddArea.join(" ")} L ${uwPad.l + uwGW},${uwPad.t} Z`;

  return (
    <div className="space-y-4">
      {/* Underwater chart */}
      <div className="bg-muted/60 rounded-md p-4 border border-border/20">
        <SectionHeader title="Underwater Chart — 3-Year Drawdown" sub="Percentage below previous peak" />
        <svg width={uwW} height={uwH} viewBox={`0 0 ${uwW} ${uwH}`} className="w-full">
          <path d={areaPath} fill="#ef444422" />
          <path d={ddPath} fill="none" stroke="#ef4444" strokeWidth={1.5} />
          <line x1={uwPad.l} y1={uwPad.t} x2={uwPad.l + uwGW} y2={uwPad.t} stroke="#475569" strokeDasharray="3,3" />
          <line x1={uwPad.l} y1={uwPad.t} x2={uwPad.l} y2={uwPad.t + uwGH} stroke="#475569" />
          <text x={uwPad.l - 4} y={uwPad.t + 4} textAnchor="end" fontSize={8} fill="#94a3b8">0%</text>
          <text x={uwPad.l - 4} y={uwPad.t + uwGH + 4} textAnchor="end" fontSize={8} fill="#94a3b8">{(minDD * 100).toFixed(0)}%</text>
          <text x={uwPad.l} y={uwH - 5} fontSize={8} fill="#94a3b8">2022</text>
          <text x={uwPad.l + uwGW / 2} y={uwH - 5} textAnchor="middle" fontSize={8} fill="#94a3b8">2023</text>
          <text x={uwPad.l + uwGW} y={uwH - 5} textAnchor="end" fontSize={8} fill="#94a3b8">2025</text>
        </svg>
      </div>

      {/* Stats + pain index */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Max Drawdown" value={`${(ddStats.minDD * 100).toFixed(1)}%`} color="text-red-400" />
        <StatCard label="Avg Drawdown" value={`${(ddStats.avgDD * 100).toFixed(1)}%`} color="text-orange-400" />
        <StatCard label="Max Recov. Days" value={`${ddStats.maxRecov}d`} color="text-amber-400" />
        <StatCard label="Calmar Ratio" value={ddStats.calmar.toFixed(2)} sub="Ann. return / Max DD" color={ddStats.calmar > 0.5 ? "text-green-400" : "text-red-400"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Monthly heatmap */}
        <div className="bg-muted/60 rounded-md p-4 border border-border/20">
          <SectionHeader title="Monthly Return Heatmap" sub="Color intensity by return magnitude" />
          <div className="overflow-x-auto">
            <table className="text-xs text-muted-foreground border-collapse w-full">
              <thead>
                <tr>
                  <th className="text-left py-1 pr-2 text-muted-foreground font-normal">Year</th>
                  {MONTHS.map(m => (
                    <th key={m} className="text-center py-1 px-0.5 text-muted-foreground font-normal w-7">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {YEARS.map(yr => (
                  <tr key={yr}>
                    <td className="pr-2 text-muted-foreground font-medium">{yr}</td>
                    {MONTHS.map((_, mi) => {
                      const data = monthlyReturns.find(d => d.year === yr && d.month === mi + 1);
                      const ret = data?.ret ?? 0;
                      return (
                        <td key={mi} className="p-0.5" title={`${(ret * 100).toFixed(1)}%`}>
                          <div
                            className="w-7 h-7 rounded flex items-center justify-center text-[11px] font-medium"
                            style={{ backgroundColor: heatColor(ret), color: "#fff" }}
                          >
                            {(ret * 100).toFixed(0)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recovery analysis + pain gauge */}
        <div className="space-y-4">
          <div className="bg-muted/60 rounded-md p-4 border border-border/20">
            <SectionHeader title="Drawdown Episodes" sub="Peak → Trough → Recovery timeline" />
            <div className="space-y-2">
              {episodes.map(ep => (
                <div key={ep.label} className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-foreground">{ep.label}</span>
                    <span className="text-red-400 font-medium">{(ep.dd * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex gap-1 items-center text-muted-foreground">
                    <span>{ep.peak}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-red-400">{ep.trough}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className={ep.recovery ? "text-green-400" : "text-muted-foreground"}>
                      {ep.recovery ?? "Recovering..."}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-2 text-muted-foreground">
                    <span>Down: {ep.days}d</span>
                    {ep.recovDays && <span>Recovery: {ep.recovDays}d</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/60 rounded-md p-4 border border-border/20">
            <SectionHeader title="Psychology Pain Index" sub="Duration × Magnitude composite" />
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-muted/40 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-3 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, #22c55e 0%, #f59e0b 50%, #ef4444 100%)`,
                    width: `${painIndex}%`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${painIndex}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <span className="text-lg font-medium text-foreground shrink-0">{painIndex.toFixed(0)}/100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {painIndex < 30 ? "Low pain — short, shallow drawdowns." : painIndex < 60 ? "Moderate pain — some prolonged losses." : "High pain — significant losses with long recovery."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — Position Sizing
// ══════════════════════════════════════════════════════════════════════════════

function PositionSizing() {
  const [winProb, setWinProb] = useState([0.55]);
  const [winLossRatio, setWinLossRatio] = useState([2.0]);
  const [kellyFraction, setKellyFraction] = useState([0.5]);
  const [riskPct, setRiskPct] = useState([2]);
  const [stopPct, setStopPct] = useState([5]);
  const [accountSize] = useState(500_000);

  const p = winProb[0];
  const b = winLossRatio[0];
  const q = 1 - p;
  const kellyFull = (b * p - q) / b;
  const kellyFractional = kellyFull * kellyFraction[0];

  const positionSize = (riskPct[0] / 100 * accountSize) / (stopPct[0] / 100);
  const maxShares = Math.floor(positionSize / 150); // assume $150 stock
  const dollarRisk = riskPct[0] / 100 * accountSize;

  // Expected growth chart
  const growthW = 400, growthH = 120;
  const growthPad = { l: 30, r: 10, t: 10, b: 25 };
  const growthGW = growthW - growthPad.l - growthPad.r;
  const growthGH = growthH - growthPad.t - growthPad.b;

  const fractions = [0.25, 0.5, 0.75, 1.0];
  const growthRates = fractions.map(f => {
    const fk = kellyFull * f;
    return p * Math.log(1 + fk * b) + q * Math.log(1 - fk);
  });
  const maxGrowth = Math.max(...growthRates, 0.001);
  const minGrowth = Math.min(...growthRates, -0.001);

  const growthPoints = fractions.map((f, i) => {
    const px = growthPad.l + (i / (fractions.length - 1)) * growthGW;
    const py = growthPad.t + growthGH * (1 - (growthRates[i] - minGrowth) / (maxGrowth - minGrowth));
    return `${px},${py}`;
  });

  // Risk parity
  const riskParityShares = POSITIONS.map(p => ({
    ticker: p.ticker,
    targetVol: 1 / POSITIONS.length,
    weight: (1 / p.vol) / POSITIONS.reduce((acc, x) => acc + 1 / x.vol, 0),
  }));

  // Concentration limits
  const maxSinglePos = Math.max(...POSITIONS.map(p => p.weight)) * 100;
  const techAlloc = POSITIONS.filter(p => p.sector === "Tech").reduce((acc, p) => acc + p.weight, 0) * 100;

  // ATR-based stop
  const atrStop = 2.5 * (150 * 0.02); // 2.5× ATR where ATR ≈ 2% of $150
  const supportStop = 150 * 0.04; // 4% below support

  return (
    <div className="space-y-4">
      {/* Kelly criterion */}
      <div className="bg-muted/60 rounded-md p-4 border border-border/20">
        <SectionHeader title="Kelly Criterion" sub="Optimal position size to maximize long-run growth rate" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Win Probability (p)</span>
                <span className="text-indigo-400 font-medium">{(p * 100).toFixed(0)}%</span>
              </div>
              <Slider value={winProb} onValueChange={setWinProb} min={0.3} max={0.8} step={0.01} />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Win/Loss Ratio (b)</span>
                <span className="text-indigo-400 font-medium">{b.toFixed(1)}:1</span>
              </div>
              <Slider value={winLossRatio} onValueChange={setWinLossRatio} min={0.5} max={5} step={0.1} />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Kelly Fraction</span>
                <span className="text-indigo-400 font-medium">{kellyFraction[0].toFixed(2)}x (Fractional Kelly)</span>
              </div>
              <Slider value={kellyFraction} onValueChange={setKellyFraction} min={0.25} max={1} step={0.05} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-muted/40 rounded p-3 text-center">
                <div className="text-xs text-muted-foreground">Full Kelly f*</div>
                <div className={cn("text-xl font-medium", kellyFull > 0 ? "text-green-400" : "text-red-400")}>
                  {(kellyFull * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-muted/40 rounded p-3 text-center">
                <div className="text-xs text-muted-foreground">Fractional Kelly</div>
                <div className={cn("text-xl font-medium", kellyFractional > 0 ? "text-indigo-400" : "text-red-400")}>
                  {(kellyFractional * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
              f* = (b×p − q) / b = ({b.toFixed(1)}×{p.toFixed(2)} − {q.toFixed(2)}) / {b.toFixed(1)} = {(kellyFull * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-2">Expected Growth Rate vs Kelly Fraction</div>
            <svg width={growthW} height={growthH} viewBox={`0 0 ${growthW} ${growthH}`} className="w-full">
              <polyline points={growthPoints.join(" ")} fill="none" stroke="#6366f1" strokeWidth={2} />
              {growthPoints.map((pt, i) => {
                const [px, py] = pt.split(",").map(Number);
                return (
                  <circle key={i} cx={px} cy={py} r={4}
                    fill={fractions[i] === kellyFraction[0] ? "#22c55e" : "#6366f1"}
                  />
                );
              })}
              <line x1={growthPad.l} y1={growthPad.t + growthGH} x2={growthPad.l + growthGW} y2={growthPad.t + growthGH} stroke="#475569" />
              <line x1={growthPad.l} y1={growthPad.t} x2={growthPad.l} y2={growthPad.t + growthGH} stroke="#475569" />
              {fractions.map((f, i) => {
                const px = growthPad.l + (i / (fractions.length - 1)) * growthGW;
                return <text key={i} x={px} y={growthH - 5} textAnchor="middle" fontSize={8} fill="#94a3b8">{f}x</text>;
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Fixed fractional */}
        <div className="bg-muted/60 rounded-md p-4 border border-border/20">
          <SectionHeader title="Fixed Fractional Position Sizing" sub="Risk a fixed % of account per trade" />
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Risk per Trade</span>
                <span className="text-indigo-400">{riskPct[0]}%</span>
              </div>
              <Slider value={riskPct} onValueChange={setRiskPct} min={0.5} max={5} step={0.25} />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Stop Loss %</span>
                <span className="text-red-400">{stopPct[0]}%</span>
              </div>
              <Slider value={stopPct} onValueChange={setStopPct} min={1} max={20} step={0.5} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Dollar Risk</div>
                <div className="font-medium text-red-400">${dollarRisk.toLocaleString()}</div>
              </div>
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Position Size</div>
                <div className="font-medium text-foreground">${positionSize.toLocaleString("en", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Max Shares ($150)</div>
                <div className="font-medium text-foreground">{maxShares} shares</div>
              </div>
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">% of Portfolio</div>
                <div className="font-medium text-indigo-400">{((positionSize / accountSize) * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk parity */}
        <div className="bg-muted/60 rounded-md p-4 border border-border/20">
          <SectionHeader title="Risk Parity Sizing" sub="Equal risk contribution per position" />
          <div className="space-y-1 mb-3">
            {riskParityShares.map(p => (
              <HBar key={p.ticker} label={p.ticker} value={p.weight * 100} maxVal={100} color="#a78bfa" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Risk parity allocates more capital to lower-volatility assets, equalizing each position's contribution to total portfolio risk.
          </p>
        </div>
      </div>

      {/* Concentration + stop loss */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-muted/60 rounded-md p-4 border border-border/20">
          <SectionHeader title="Concentration Limits" sub="Current vs recommended maximums" />
          <div className="space-y-3">
            {[
              { label: "Largest Single Position", current: maxSinglePos, limit: 25, unit: "%" },
              { label: "Tech Sector Exposure", current: techAlloc, limit: 40, unit: "%" },
              { label: "Corr. Cluster (Tech)", current: 65, limit: 50, unit: "%" },
            ].map(item => (
              <div key={item.label} className="text-xs text-muted-foreground">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", item.current > item.limit ? "text-red-400" : "text-green-400")}>
                      {item.current.toFixed(1)}{item.unit}
                    </span>
                    <span className="text-muted-foreground">/ {item.limit}{item.unit} limit</span>
                    {item.current > item.limit
                      ? <AlertTriangle className="w-3 h-3 text-red-400" />
                      : <Shield className="w-3 h-3 text-green-400" />}
                  </div>
                </div>
                <div className="bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, (item.current / item.limit) * 100)}%`,
                      backgroundColor: item.current > item.limit ? "#ef4444" : "#22c55e",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/60 rounded-md p-4 border border-border/20">
          <SectionHeader title="Stop Loss Placement" sub="ATR-based vs support-based comparison" />
          <div className="space-y-3 text-sm">
            <div className="bg-muted/40 rounded p-3">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground font-medium">ATR-Based Stop</span>
                <Badge variant="outline" className="text-xs text-muted-foreground">2.5× ATR</Badge>
              </div>
              <div className="text-red-400 font-medium">${atrStop.toFixed(2)} below entry</div>
              <div className="text-xs text-muted-foreground mt-1">Stop = Entry − 2.5 × ATR(14) = ${(150 - atrStop).toFixed(2)}</div>
            </div>
            <div className="bg-muted/40 rounded p-3">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground font-medium">Support-Based Stop</span>
                <Badge variant="outline" className="text-xs text-muted-foreground">Below key level</Badge>
              </div>
              <div className="text-red-400 font-medium">${supportStop.toFixed(2)} below support</div>
              <div className="text-xs text-muted-foreground mt-1">Stop = ${(150 - supportStop).toFixed(2)} (1% below structural support)</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="bg-muted/30 rounded p-2 text-center">
                <div className="text-muted-foreground">ATR Stop P&L Risk</div>
                <div className="font-medium text-red-400">${(atrStop * maxShares).toLocaleString()}</div>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <div className="text-muted-foreground">Support Stop P&L Risk</div>
                <div className="font-medium text-red-400">${(supportStop * maxShares).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 6 — Hedging Tools
// ══════════════════════════════════════════════════════════════════════════════

function HedgingTools() {
  const [hedgeRatio, setHedgeRatio] = useState([0.8]);
  const [putStrike, setPutStrike] = useState([95]);
  const [collarCall, setCollarCall] = useState([105]);
  const [collarPut, setCollarPut] = useState([95]);
  const [vixCallStrike, setVixCallStrike] = useState([25]);

  const portfolioValue = PORTFOLIO_VALUE;
  const portfolioBeta = 1.25;
  const spyVol = 0.16;
  const portVol = 0.185;
  const correlation = 0.82;

  // Equity hedge: SPY puts
  const putCost = 0.025; // 2.5% of notional for 3% OTM put
  const putProtection = Math.max(0, (100 - putStrike[0]) / 100);
  const putNotional = portfolioValue * hedgeRatio[0];
  const putPremium = putNotional * putCost;

  // Collar
  const callPremiumEarned = portfolioValue * 0.015 * (1 + (collarCall[0] - 100) / 200);
  const putPremiumPaid = portfolioValue * 0.015 * (1 + (100 - collarPut[0]) / 200);
  const collarCost = putPremiumPaid - callPremiumEarned;

  // Beta hedge
  const spyFuturesShort = (portfolioBeta * portfolioValue) / 500000; // in contracts
  const hedgedBeta = portfolioBeta * (1 - hedgeRatio[0]);

  // Hedge ratio calculator
  const calcHedgeRatio = correlation * (portVol / spyVol);

  // Payoff SVG for collar
  const colW = 400, colH = 120;
  const colPad = { l: 30, r: 10, t: 10, b: 25 };
  const colGW = colW - colPad.l - colPad.r;
  const colGH = colH - colPad.t - colPad.b;
  const sRange = [80, 120]; // stock price range as % of current

  function collarPayoff(s: number): number {
    const base = (s - 100) / 100;
    const put = Math.max(0, collarPut[0] / 100 - s / 100);
    const call = -Math.max(0, s / 100 - collarCall[0] / 100);
    return base + put + call - collarCost / portfolioValue;
  }

  const colPoints = Array.from({ length: 80 }, (_, i) => {
    const s = sRange[0] + (i / 79) * (sRange[1] - sRange[0]);
    const payoff = collarPayoff(s);
    const px = colPad.l + (i / 79) * colGW;
    const py = colPad.t + colGH / 2 - payoff * colGH * 4;
    return `${px},${Math.max(colPad.t, Math.min(colPad.t + colGH, py))}`;
  }).join(" ");

  // VIX correlation
  const vixCallCost = portfolioValue * 0.005; // ~0.5% of portfolio
  const vixCallProtection = 0.40; // 40% of drawdown hedged by VIX call

  return (
    <div className="space-y-4">
      {/* Equity hedge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-muted/60 rounded-md p-4 border border-border/20">
          <SectionHeader title="Equity Hedge — SPY Puts" sub="Long portfolio + protective puts" />
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Put Strike (% of spot)</span>
                <span className="text-indigo-400">{putStrike[0]}% OTM</span>
              </div>
              <Slider value={putStrike} onValueChange={setPutStrike} min={80} max={100} step={1} />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Hedge Ratio</span>
                <span className="text-indigo-400">{(hedgeRatio[0] * 100).toFixed(0)}%</span>
              </div>
              <Slider value={hedgeRatio} onValueChange={setHedgeRatio} min={0.1} max={1} step={0.05} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Put Premium</div>
                <div className="font-medium text-red-400">${(putPremium / 1000).toFixed(1)}k</div>
                <div className="text-muted-foreground">{(putCost * 100).toFixed(1)}% of notional</div>
              </div>
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Protection Floor</div>
                <div className="font-medium text-green-400">{putStrike[0]}% of portfolio</div>
                <div className="text-muted-foreground">Max loss limited below</div>
              </div>
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Notional Hedged</div>
                <div className="font-medium text-foreground">${(putNotional / 1000).toFixed(0)}k</div>
              </div>
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Annual Cost (est.)</div>
                <div className="font-medium text-amber-400">${(putPremium * 4 / 1000).toFixed(1)}k</div>
                <div className="text-muted-foreground">4× quarterly renewal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Options collar */}
        <div className="bg-muted/60 rounded-md p-4 border border-border/20">
          <SectionHeader title="Options Collar Strategy" sub="Sell OTM calls, buy OTM puts (near zero-cost)" />
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Call Strike (upside cap)</span>
                <span className="text-green-400">{collarCall[0]}%</span>
              </div>
              <Slider value={collarCall} onValueChange={setCollarCall} min={101} max={120} step={1} />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Put Strike (downside floor)</span>
                <span className="text-red-400">{collarPut[0]}%</span>
              </div>
              <Slider value={collarPut} onValueChange={setCollarPut} min={80} max={99} step={1} />
            </div>
            <svg width={colW} height={colH} viewBox={`0 0 ${colW} ${colH}`} className="w-full">
              <polyline points={colPoints} fill="none" stroke="#a78bfa" strokeWidth={2} />
              <line x1={colPad.l} y1={colPad.t + colGH / 2} x2={colPad.l + colGW} y2={colPad.t + colGH / 2} stroke="#475569" strokeDasharray="3,3" />
              <line x1={colPad.l} y1={colPad.t} x2={colPad.l} y2={colPad.t + colGH} stroke="#475569" />
              <text x={colPad.l} y={colH - 5} fontSize={8} fill="#94a3b8">80%</text>
              <text x={colPad.l + colGW} y={colH - 5} textAnchor="end" fontSize={8} fill="#94a3b8">120%</text>
              <text x={colPad.l - 2} y={colPad.t + colGH / 2 + 4} textAnchor="end" fontSize={8} fill="#94a3b8">0</text>
            </svg>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground text-center">
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Call Premium</div>
                <div className="font-medium text-green-400">+${(callPremiumEarned / 1000).toFixed(1)}k</div>
              </div>
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Put Premium</div>
                <div className="font-medium text-red-400">-${(putPremiumPaid / 1000).toFixed(1)}k</div>
              </div>
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Net Cost</div>
                <div className={cn("font-medium", collarCost < 0 ? "text-green-400" : "text-red-400")}>
                  {collarCost >= 0 ? "-" : "+"}${(Math.abs(collarCost) / 1000).toFixed(1)}k
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* VIX hedge */}
        <div className="bg-muted/60 rounded-md p-4 border border-border/20">
          <SectionHeader title="VIX Tail Risk Hedge" sub="Long VIX calls as portfolio insurance" />
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>VIX Call Strike</span>
                <span className="text-indigo-400">{vixCallStrike[0]}</span>
              </div>
              <Slider value={vixCallStrike} onValueChange={setVixCallStrike} min={18} max={50} step={1} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Annual VIX Call Cost</div>
                <div className="font-medium text-red-400">${(vixCallCost / 1000).toFixed(1)}k</div>
                <div className="text-muted-foreground">{((vixCallCost / portfolioValue) * 100).toFixed(2)}% of portfolio</div>
              </div>
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Drawdown Protection</div>
                <div className="font-medium text-green-400">{(vixCallProtection * 100).toFixed(0)}% offset</div>
                <div className="text-muted-foreground">During spike events</div>
              </div>
            </div>
            <div className="bg-muted/30 rounded p-3 text-xs text-muted-foreground">
              <div className="text-muted-foreground font-medium mb-1">VIX-Equity Correlation in Crises</div>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex justify-between"><span>Normal market (VIX &lt;20)</span><span className="text-muted-foreground">−0.65</span></div>
                <div className="flex justify-between"><span>Stress (VIX 20–30)</span><span className="text-amber-400">−0.78</span></div>
                <div className="flex justify-between"><span>Crisis (VIX &gt;30)</span><span className="text-red-400">−0.91</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Beta hedge + hedge ratio calculator */}
        <div className="space-y-4">
          <div className="bg-muted/60 rounded-md p-4 border border-border/20">
            <SectionHeader title="Beta Hedge — Short SPY Futures" sub="Neutralize market beta exposure" />
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Portfolio Beta</div>
                <div className="font-medium text-amber-400">{portfolioBeta.toFixed(2)}</div>
              </div>
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Hedged Beta</div>
                <div className="font-medium text-green-400">{hedgedBeta.toFixed(2)}</div>
                <div className="text-muted-foreground">After {(hedgeRatio[0] * 100).toFixed(0)}% hedge</div>
              </div>
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">SPY Contracts Short</div>
                <div className="font-medium text-foreground">{(spyFuturesShort * hedgeRatio[0]).toFixed(1)}</div>
                <div className="text-muted-foreground">$500k notional each</div>
              </div>
              <div className="bg-muted/40 rounded p-2">
                <div className="text-muted-foreground">Residual Alpha Exposure</div>
                <div className="font-medium text-indigo-400">{((1 - hedgeRatio[0]) * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          <div className="bg-muted/60 rounded-md p-4 border border-border/20">
            <SectionHeader title="Hedge Ratio Calculator" sub="Optimal ratio = ρ × (σ_portfolio / σ_hedge)" />
            <div className="space-y-2 text-xs text-muted-foreground">
              {[
                { label: "Correlation (ρ)", value: correlation.toFixed(2) },
                { label: "Portfolio Vol (σ_p)", value: `${(portVol * 100).toFixed(1)}%` },
                { label: "Hedge Vol (σ_h = SPY)", value: `${(spyVol * 100).toFixed(1)}%` },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-foreground font-medium">{row.value}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between">
                <span className="text-muted-foreground font-medium">Optimal Hedge Ratio</span>
                <span className="text-indigo-400 font-medium text-sm">{calcHedgeRatio.toFixed(3)}</span>
              </div>
              <div className="text-muted-foreground bg-muted/30 rounded p-2 mt-1">
                h* = {correlation} × ({(portVol * 100).toFixed(1)}% / {(spyVol * 100).toFixed(1)}%) = {calcHedgeRatio.toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function RiskManagementPage() {
  const [activeTab, setActiveTab] = useState("metrics");

  const tabs = [
    { id: "metrics",   label: "Risk Metrics",    icon: Shield },
    { id: "var",       label: "VaR Models",      icon: BarChart3 },
    { id: "stress",    label: "Stress Testing",  icon: AlertTriangle },
    { id: "drawdown",  label: "Drawdown",        icon: TrendingDown },
    { id: "sizing",    label: "Position Sizing", icon: Target },
    { id: "hedging",   label: "Hedging",         icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-foreground">Portfolio Risk Management</h1>
              <p className="text-xs text-muted-foreground">
                VaR • Stress Testing • Drawdown Analysis • Position Sizing • Hedging Tools
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: "Portfolio Value", value: "$500k", color: "text-foreground" },
              { label: "Positions", value: "7", color: "text-indigo-400" },
              { label: "Daily VaR 95%", value: "~$4.2k", color: "text-amber-400" },
              { label: "Max DD (est.)", value: "~18%", color: "text-red-400" },
              { label: "Diversification Ratio", value: "1.31×", color: "text-green-400" },
            ].map(s => (
              <div key={s.label} className="bg-muted/60 rounded-lg px-3 py-1.5 text-xs text-muted-foreground border border-border/20 flex items-center gap-2">
                <span className="text-muted-foreground">{s.label}</span>
                <span className={cn("font-semibold", s.color)}>{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs flex items-center gap-1.5 px-3 py-1.5"
                >{tab.label}</TabsTrigger>
              );
            })}
          </TabsList>

          <AnimatePresence mode="wait">
            {tabs.map(tab => (
              activeTab === tab.id && (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value={tab.id} forceMount>
                    {tab.id === "metrics"  && <RiskMetricsDashboard />}
                    {tab.id === "var"      && <VaRModels />}
                    {tab.id === "stress"   && <StressTesting />}
                    {tab.id === "drawdown" && <DrawdownAnalysis />}
                    {tab.id === "sizing"   && <PositionSizing />}
                    {tab.id === "hedging"  && <HedgingTools />}
                  </TabsContent>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
