"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Zap,
  BarChart2,
  Activity,
  Target,
  Shield,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StressScenario {
  id: string;
  name: string;
  period: string;
  keyStat: string;
  color: string;
  /** Equity shock multiplier (e.g. -0.55 means -55%) */
  equityShock: number;
  /** Bond shock multiplier */
  bondShock: number;
  /** VIX multiplier (e.g. 5.0 means +400%) */
  vixMultiplier: number;
  /** Recovery time in months */
  recoveryMonths: number;
  /** Description */
  description: string;
}

interface CustomParams {
  marketShock: number; // -60 to +30 (%)
  rateShock: number;   // -300 to +500 (bp)
  vixShock: number;    // 10 to 80
  usdShock: number;    // -20 to +20 (%)
}

interface PositionImpact {
  ticker: string;
  side: "long" | "short";
  quantity: number;
  currentValue: number;
  shockedValue: number;
  dollarPnL: number;
  percentPnL: number;
}

interface StressResult {
  scenarioName: string;
  totalPortfolioBefore: number;
  totalPortfolioAfter: number;
  totalDollarImpact: number;
  totalPctImpact: number;
  positionImpacts: PositionImpact[];
  riskBudgetUsed: number; // % of initial capital
  recoveryMonths: number;
  worstPosition: PositionImpact | null;
  correlationBreakdown: boolean;
}

interface MonteCarloResult {
  paths: number[][]; // [pathIndex][timeStep] = portfolio value
  median: number[];
  p10: number[];
  p25: number[];
  p75: number[];
  p90: number[];
  probLoss10pct: number;
  probGain20pct: number;
  cvar95: number;
  riskOfRuin50pct: number;
}

// ─── Pre-built Scenarios ──────────────────────────────────────────────────────

const SCENARIOS: StressScenario[] = [
  {
    id: "gfc2008",
    name: "2008 Financial Crisis",
    period: "2007–2009",
    keyStat: "S&P 500 -55%, VIX +400%",
    color: "text-red-400",
    equityShock: -0.55,
    bondShock: 0.10,
    vixMultiplier: 5.0,
    recoveryMonths: 48,
    description: "Global banking system collapse, credit markets frozen, peak-to-trough equity decline of 55% over 17 months.",
  },
  {
    id: "covid2020",
    name: "COVID Crash (2020)",
    period: "Feb–Mar 2020",
    keyStat: "Equities -34% in 33 days",
    color: "text-orange-400",
    equityShock: -0.34,
    bondShock: 0.06,
    vixMultiplier: 3.8,
    recoveryMonths: 5,
    description: "Fastest bear market in history driven by pandemic panic. Recovered fully within 5 months due to unprecedented fiscal stimulus.",
  },
  {
    id: "dotcom2000",
    name: "Dot-com Bust (2000–2002)",
    period: "2000–2002",
    keyStat: "Tech -78%, Value -15%",
    color: "text-amber-400",
    equityShock: -0.49,
    bondShock: 0.30,
    vixMultiplier: 2.5,
    recoveryMonths: 60,
    description: "Speculative tech bubble collapse. NASDAQ fell 78% peak-to-trough. Value stocks and bonds outperformed significantly.",
  },
  {
    id: "blackmonday1987",
    name: "1987 Black Monday",
    period: "Oct 19, 1987",
    keyStat: "Single day -22%",
    color: "text-red-500",
    equityShock: -0.22,
    bondShock: 0.00,
    vixMultiplier: 4.0,
    recoveryMonths: 24,
    description: "Largest single-day percentage decline in U.S. stock market history. Program trading and portfolio insurance amplified the crash.",
  },
  {
    id: "ratehike2022",
    name: "2022 Rate Hike Cycle",
    period: "2022",
    keyStat: "Equities -20%, Bonds -15%",
    color: "text-primary",
    equityShock: -0.20,
    bondShock: -0.15,
    vixMultiplier: 2.0,
    recoveryMonths: 18,
    description: "Fed raised rates 425bp in 12 months. Growth stocks fell 50%+. Bonds had worst year since 1926. 60/40 portfolio -16%.",
  },
  {
    id: "stagflation1970s",
    name: "Stagflation 1970s",
    period: "1973–1982",
    keyStat: "Inflation +12%, Real returns negative",
    color: "text-yellow-400",
    equityShock: -0.15,
    bondShock: -0.20,
    vixMultiplier: 1.5,
    recoveryMonths: 36,
    description: "Oil shocks, wage-price spiral, and loose monetary policy. Stocks lost ~40% in real terms over the decade. Gold surged 1,700%.",
  },
  {
    id: "ratespike300bp",
    name: "Rate Spike +300bp",
    period: "Hypothetical",
    keyStat: "Duration damage, yield curve inverts",
    color: "text-muted-foreground",
    equityShock: -0.18,
    bondShock: -0.25,
    vixMultiplier: 2.2,
    recoveryMonths: 24,
    description: "Sudden 300bp rate increase over 90 days causes severe duration damage to bond portfolios and repricing of growth equities.",
  },
  {
    id: "liquiditycrisis",
    name: "Liquidity Crisis",
    period: "Hypothetical",
    keyStat: "All assets fall, correlation → 1.0",
    color: "text-rose-400",
    equityShock: -0.35,
    bondShock: -0.12,
    vixMultiplier: 6.0,
    recoveryMonths: 18,
    description: "Forced selling across all asset classes simultaneously. Diversification benefits evaporate as correlations spike to 1.0.",
  },
];

// ─── PRNG ─────────────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

function boxMullerNormal(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-10);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ─── Ticker Sector Classification ─────────────────────────────────────────────

const TICKER_SECTOR: Record<string, "tech" | "value" | "bond" | "crypto" | "etf"> = {
  AAPL: "tech",
  TSLA: "tech",
  MSFT: "tech",
  GOOGL: "tech",
  AMZN: "tech",
  META: "tech",
  NVDA: "tech",
  SPY: "etf",
  QQQ: "etf",
  BTC: "crypto",
};

function getEquityMultiplier(ticker: string, scenario: StressScenario): number {
  const sector = TICKER_SECTOR[ticker] ?? "value";

  if (scenario.id === "dotcom2000") {
    if (sector === "tech" || sector === "etf") return -0.65;
    if (sector === "crypto") return -0.80;
    return -0.15;
  }
  if (scenario.id === "ratehike2022") {
    if (sector === "tech") return -0.50;
    if (sector === "crypto") return -0.65;
    if (sector === "etf" && ticker === "QQQ") return -0.35;
    return scenario.equityShock;
  }
  if (sector === "crypto") {
    // Crypto amplifies equity shocks 2–3x
    return Math.max(scenario.equityShock * 2.5, -0.90);
  }
  if (sector === "etf" && ticker === "QQQ") {
    // Tech-heavy ETF slightly worse than market
    return scenario.equityShock * 1.15;
  }
  return scenario.equityShock;
}

// ─── Stress Computation ───────────────────────────────────────────────────────

function computeStressResult(
  positions: ReturnType<typeof useTradingStore.getState>["positions"],
  portfolioValue: number,
  scenario: StressScenario | null,
  customParams: CustomParams | null,
  scenarioName: string,
  recoveryMonths: number,
  isLiquidityCrisis: boolean,
): StressResult {
  const positionImpacts: PositionImpact[] = positions.map((pos) => {
    const currentValue = pos.currentPrice * pos.quantity;

    let shockPct: number;

    if (customParams !== null) {
      // Custom scenario
      const baseShock = customParams.marketShock / 100;
      const rateEffect = (customParams.rateShock / 10000) * -8; // -8 duration factor on bonds
      const usdEffect = customParams.usdShock / 100;
      const sector = TICKER_SECTOR[pos.ticker] ?? "value";

      if (sector === "crypto") {
        shockPct = baseShock * 2.0 + usdEffect * 0.5;
      } else if (sector === "etf") {
        shockPct = baseShock + rateEffect * 0.3 + usdEffect * 0.1;
      } else {
        shockPct = baseShock + rateEffect * 0.2 + usdEffect * 0.15;
      }
    } else if (scenario !== null) {
      shockPct = getEquityMultiplier(pos.ticker, scenario);
    } else {
      shockPct = 0;
    }

    // Invert shock for short positions (shorts profit from declines)
    const effectiveShock = pos.side === "short" ? -shockPct : shockPct;
    const shockedValue = currentValue * (1 + effectiveShock);
    const dollarPnL = shockedValue - currentValue;
    const percentPnL = effectiveShock * 100;

    return {
      ticker: pos.ticker,
      side: pos.side,
      quantity: pos.quantity,
      currentValue,
      shockedValue,
      dollarPnL,
      percentPnL,
    };
  });

  const totalCurrentValue = positionImpacts.reduce((s, p) => s + p.currentValue, 0);
  const totalShockedValue = positionImpacts.reduce((s, p) => s + p.shockedValue, 0);
  const cashValue = portfolioValue - totalCurrentValue;
  const totalPortfolioBefore = portfolioValue;
  const totalPortfolioAfter = cashValue + totalShockedValue;
  const totalDollarImpact = totalPortfolioAfter - totalPortfolioBefore;
  const totalPctImpact = totalPortfolioBefore > 0
    ? (totalDollarImpact / totalPortfolioBefore) * 100
    : 0;

  const riskBudgetUsed = Math.abs(totalDollarImpact / INITIAL_CAPITAL) * 100;

  const worstPosition = positionImpacts.length > 0
    ? positionImpacts.reduce((worst, p) =>
        p.dollarPnL < worst.dollarPnL ? p : worst
      )
    : null;

  return {
    scenarioName,
    totalPortfolioBefore,
    totalPortfolioAfter,
    totalDollarImpact,
    totalPctImpact,
    positionImpacts,
    riskBudgetUsed,
    recoveryMonths,
    worstPosition,
    correlationBreakdown: isLiquidityCrisis,
  };
}

// ─── Monte Carlo Simulation ───────────────────────────────────────────────────

function runMonteCarlo(portfolioValue: number): MonteCarloResult {
  const NUM_PATHS = 1000;
  const TIME_STEPS = 252; // 1 year of trading days
  const MU = 0.08 / 252;  // 8% annual return
  const SIGMA = 0.18 / Math.sqrt(252); // 18% annual vol

  const rand = mulberry32(0xdeadbeef);
  const allPaths: number[][] = [];

  for (let i = 0; i < NUM_PATHS; i++) {
    const path: number[] = [portfolioValue];
    let val = portfolioValue;
    for (let t = 0; t < TIME_STEPS; t++) {
      const z = boxMullerNormal(rand);
      val = val * Math.exp((MU - 0.5 * SIGMA * SIGMA) + SIGMA * z);
      path.push(val);
    }
    allPaths.push(path);
  }

  // Compute percentiles at each time step
  const median: number[] = [];
  const p10: number[] = [];
  const p25: number[] = [];
  const p75: number[] = [];
  const p90: number[] = [];

  for (let t = 0; t <= TIME_STEPS; t++) {
    const vals = allPaths.map((p) => p[t]).sort((a, b) => a - b);
    const q = (pct: number) => {
      const idx = Math.floor((pct / 100) * (vals.length - 1));
      return vals[idx];
    };
    p10.push(q(10));
    p25.push(q(25));
    median.push(q(50));
    p75.push(q(75));
    p90.push(q(90));
  }

  // Stats at end of year
  const finalVals = allPaths.map((p) => p[TIME_STEPS]);
  finalVals.sort((a, b) => a - b);

  const probLoss10pct =
    finalVals.filter((v) => v < portfolioValue * 0.9).length / NUM_PATHS;
  const probGain20pct =
    finalVals.filter((v) => v > portfolioValue * 1.2).length / NUM_PATHS;

  // CVaR at 95%: average of worst 5%
  const worstCount = Math.floor(NUM_PATHS * 0.05);
  const cvar95 =
    finalVals.slice(0, worstCount).reduce((s, v) => s + v, 0) / worstCount;

  // Risk of ruin: paths that hit 50% drawdown at any point
  let ruinCount = 0;
  for (const path of allPaths) {
    const didRuin = path.some((v) => v < portfolioValue * 0.5);
    if (didRuin) ruinCount++;
  }
  const riskOfRuin50pct = ruinCount / NUM_PATHS;

  return {
    paths: allPaths,
    median,
    p10,
    p25,
    p75,
    p90,
    probLoss10pct,
    probGain20pct,
    cvar95,
    riskOfRuin50pct,
  };
}

// ─── SVG Waterfall Chart ──────────────────────────────────────────────────────

function WaterfallChart({ impacts }: { impacts: PositionImpact[] }) {
  const W = 420;
  const H = 180;
  const PAD = { left: 48, right: 16, top: 12, bottom: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  if (impacts.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">
        No positions to display
      </div>
    );
  }

  const sorted = [...impacts].sort((a, b) => a.dollarPnL - b.dollarPnL);
  const maxAbs = Math.max(...sorted.map((p) => Math.abs(p.dollarPnL)), 1);
  const barW = Math.max(12, Math.floor(chartW / sorted.length) - 4);
  const zeroY = PAD.top + chartH / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Waterfall chart">
      {/* Zero line */}
      <line
        x1={PAD.left}
        y1={zeroY}
        x2={W - PAD.right}
        y2={zeroY}
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={1}
      />

      {sorted.map((pos, i) => {
        const x = PAD.left + i * (chartW / sorted.length) + (chartW / sorted.length - barW) / 2;
        const norm = pos.dollarPnL / maxAbs;
        const barH = Math.abs(norm) * (chartH / 2 - 4);
        const y = pos.dollarPnL >= 0 ? zeroY - barH : zeroY;
        const fill = pos.dollarPnL >= 0 ? "#10b981" : "#ef4444";

        return (
          <g key={`bar-${pos.ticker}-${i}`}>
            <rect x={x} y={y} width={barW} height={barH} fill={fill} fillOpacity={0.85} rx={2} />
            <text
              x={x + barW / 2}
              y={H - PAD.bottom + 14}
              textAnchor="middle"
              fontSize={9}
              fill="currentColor"
              fillOpacity={0.6}
            >
              {pos.ticker}
            </text>
          </g>
        );
      })}

      {/* Y-axis labels */}
      {[-1, -0.5, 0, 0.5, 1].map((frac) => {
        const val = frac * maxAbs;
        const y = zeroY - frac * (chartH / 2);
        return (
          <text
            key={`ylabel-${frac}`}
            x={PAD.left - 4}
            y={y + 4}
            textAnchor="end"
            fontSize={8}
            fill="currentColor"
            fillOpacity={0.5}
          >
            {frac === 0 ? "0" : `${val >= 0 ? "+" : ""}${(val / 1000).toFixed(0)}k`}
          </text>
        );
      })}
    </svg>
  );
}

// ─── SVG Fan Chart (Monte Carlo) ──────────────────────────────────────────────

function FanChart({ result, portfolioValue }: { result: MonteCarloResult; portfolioValue: number }) {
  const W = 420;
  const H = 200;
  const PAD = { left: 52, right: 16, top: 12, bottom: 28 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const steps = result.median.length;

  const allVals = [...result.p10, ...result.p90];
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const range = maxVal - minVal || 1;

  const xScale = (i: number) => PAD.left + (i / (steps - 1)) * chartW;
  const yScale = (v: number) => PAD.top + chartH - ((v - minVal) / range) * chartH;

  function makePath(vals: number[]): string {
    return vals.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`).join(" ");
  }

  function makeArea(upper: number[], lower: number[]): string {
    const top = upper.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`).join(" ");
    const bot = [...lower].reverse().map((v, i) => {
      const idx = lower.length - 1 - i;
      return `L ${xScale(idx).toFixed(1)} ${yScale(v).toFixed(1)}`;
    }).join(" ");
    return `${top} ${bot} Z`;
  }

  const initialY = yScale(portfolioValue);
  const yLabels = [minVal, (minVal + maxVal) / 2, maxVal];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Monte Carlo fan chart">
      {/* Grid */}
      {yLabels.map((v, idx) => (
        <line
          key={`grid-${idx}`}
          x1={PAD.left}
          y1={yScale(v)}
          x2={W - PAD.right}
          y2={yScale(v)}
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeWidth={1}
        />
      ))}

      {/* p10–p90 band */}
      <path d={makeArea(result.p90, result.p10)} fill="#6366f1" fillOpacity={0.08} />
      {/* p25–p75 band */}
      <path d={makeArea(result.p75, result.p25)} fill="#6366f1" fillOpacity={0.15} />

      {/* Percentile lines */}
      <path d={makePath(result.p10)} fill="none" stroke="#ef4444" strokeWidth={1} strokeOpacity={0.5} strokeDasharray="4,2" />
      <path d={makePath(result.p25)} fill="none" stroke="#f59e0b" strokeWidth={1} strokeOpacity={0.5} />
      <path d={makePath(result.p75)} fill="none" stroke="#10b981" strokeWidth={1} strokeOpacity={0.5} />
      <path d={makePath(result.p90)} fill="none" stroke="#10b981" strokeWidth={1.5} strokeOpacity={0.7} />
      {/* Median */}
      <path d={makePath(result.median)} fill="none" stroke="#6366f1" strokeWidth={2} />

      {/* Initial value line */}
      <line
        x1={PAD.left}
        y1={initialY}
        x2={W - PAD.right}
        y2={initialY}
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth={1}
        strokeDasharray="6,3"
      />

      {/* Y-axis labels */}
      {yLabels.map((v, idx) => (
        <text
          key={`ylbl-${idx}`}
          x={PAD.left - 4}
          y={yScale(v) + 4}
          textAnchor="end"
          fontSize={8}
          fill="currentColor"
          fillOpacity={0.5}
        >
          {`$${(v / 1000).toFixed(0)}k`}
        </text>
      ))}

      {/* X-axis labels */}
      {[0, 63, 126, 189, 252].map((t) => (
        <text
          key={`xlbl-${t}`}
          x={xScale(t)}
          y={H - PAD.bottom + 14}
          textAnchor="middle"
          fontSize={8}
          fill="currentColor"
          fillOpacity={0.5}
        >
          {t === 0 ? "Now" : `Q${Math.round(t / 63)}`}
        </text>
      ))}

      {/* Legend */}
      {[
        { color: "#6366f1", label: "Median" },
        { color: "#10b981", label: "P75/P90" },
        { color: "#ef4444", label: "P10" },
      ].map((item, idx) => (
        <g key={`leg-${idx}`} transform={`translate(${PAD.left + idx * 70}, ${PAD.top})`}>
          <line x1={0} y1={5} x2={12} y2={5} stroke={item.color} strokeWidth={1.5} />
          <text x={15} y={9} fontSize={8} fill="currentColor" fillOpacity={0.6}>{item.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Scenario Card ────────────────────────────────────────────────────────────

function ScenarioCard({
  scenario,
  isActive,
  onApply,
}: {
  scenario: StressScenario;
  isActive: boolean;
  onApply: (s: StressScenario) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card/50 p-3 transition-colors",
        isActive ? "border-primary/60 bg-primary/5" : "border-border hover:border-border/80",
      )}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <p className={cn("text-[11px] font-semibold leading-tight", scenario.color)}>
            {scenario.name}
          </p>
          <p className="text-xs text-muted-foreground">{scenario.period}</p>
        </div>
        {isActive && (
          <Badge variant="secondary" className="shrink-0 text-[11px] px-1.5 py-0 h-4">
            Active
          </Badge>
        )}
      </div>
      <p className="mb-2 text-xs font-medium text-foreground/80">{scenario.keyStat}</p>
      <Button
        size="sm"
        variant={isActive ? "default" : "outline"}
        className="h-6 w-full text-xs"
        onClick={() => onApply(scenario)}
      >
        {isActive ? "Applied" : "Apply"}
      </Button>
    </div>
  );
}

// ─── Results Panel ────────────────────────────────────────────────────────────

function ResultsPanel({ result }: { result: StressResult }) {
  const impactColor = result.totalDollarImpact >= 0 ? "text-emerald-400" : "text-red-400";
  const riskLevel =
    result.riskBudgetUsed > 20
      ? { label: "Critical", color: "text-red-400 bg-red-400/10 border-red-400/20" }
      : result.riskBudgetUsed > 10
      ? { label: "High", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" }
      : { label: "Moderate", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" };

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <p className="mb-0.5 text-xs text-muted-foreground">P&amp;L Impact</p>
          <p className={cn("text-sm font-bold tabular-nums", impactColor)}>
            {result.totalDollarImpact >= 0 ? "+" : ""}
            {formatCurrency(result.totalDollarImpact)}
          </p>
          <p className={cn("text-xs font-semibold tabular-nums", impactColor)}>
            {result.totalPctImpact >= 0 ? "+" : ""}
            {result.totalPctImpact.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <p className="mb-0.5 text-xs text-muted-foreground">Risk Budget</p>
          <p className={cn("text-sm font-bold tabular-nums", riskLevel.color.split(" ")[0])}>
            {result.riskBudgetUsed.toFixed(1)}%
          </p>
          <span className={cn("inline-flex rounded border px-1.5 py-0.5 text-[11px] font-medium", riskLevel.color)}>
            {riskLevel.label}
          </span>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <p className="mb-0.5 text-xs text-muted-foreground">Recovery Est.</p>
          <p className="text-sm font-bold tabular-nums">
            {result.recoveryMonths}
            <span className="ml-1 text-xs font-normal text-muted-foreground">mo</span>
          </p>
          <p className="text-xs text-muted-foreground">historical avg</p>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <p className="mb-0.5 text-xs text-muted-foreground">Worst Position</p>
          {result.worstPosition ? (
            <>
              <p className="text-sm font-bold text-red-400">{result.worstPosition.ticker}</p>
              <p className="text-xs tabular-nums text-red-400/70">
                {result.worstPosition.percentPnL.toFixed(1)}%
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {/* Correlation breakdown alert */}
      {result.correlationBreakdown && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
          <p className="text-[11px] text-amber-300/90">
            <span className="font-semibold">Correlation Breakdown:</span> In this scenario, diversification benefits
            disappear as asset correlations spike toward 1.0. All positions fall simultaneously, eliminating
            portfolio hedges.
          </p>
        </div>
      )}

      {/* Waterfall chart */}
      {result.positionImpacts.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">Position P&amp;L Contribution</p>
          <WaterfallChart impacts={result.positionImpacts} />
        </div>
      )}

      {/* Position table */}
      {result.positionImpacts.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Ticker</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Side</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Current Value</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Shocked Value</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">P&amp;L</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">%</th>
              </tr>
            </thead>
            <tbody>
              {result.positionImpacts.map((pos, i) => (
                <tr
                  key={`${pos.ticker}-${i}`}
                  className="border-b border-border/40 hover:bg-muted/10"
                >
                  <td className="px-3 py-2 font-semibold">{pos.ticker}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase",
                        pos.side === "long"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-red-400/10 text-red-400",
                      )}
                    >
                      {pos.side}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(pos.currentValue)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(pos.shockedValue)}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 text-right tabular-nums font-medium",
                      pos.dollarPnL >= 0 ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {pos.dollarPnL >= 0 ? "+" : ""}
                    {formatCurrency(pos.dollarPnL)}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 text-right tabular-nums",
                      pos.percentPnL >= 0 ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {pos.percentPnL >= 0 ? "+" : ""}
                    {pos.percentPnL.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.positionImpacts.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8">
          <Shield className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">No open positions to stress test.</p>
          <p className="text-xs text-muted-foreground/60">Open positions in the Trading tab first.</p>
        </div>
      )}
    </div>
  );
}

// ─── Monte Carlo Panel ────────────────────────────────────────────────────────

function MonteCarloPanel({ portfolioValue }: { portfolioValue: number }) {
  const result = useMemo(() => runMonteCarlo(portfolioValue), [portfolioValue]);

  const statItems = [
    {
      label: "Prob. of 10%+ Loss",
      value: `${(result.probLoss10pct * 100).toFixed(1)}%`,
      icon: TrendingDown,
      color: "text-red-400",
    },
    {
      label: "Prob. of 20%+ Gain",
      value: `${(result.probGain20pct * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-emerald-400",
    },
    {
      label: "CVaR (95%)",
      value: formatCurrency(result.cvar95),
      icon: Target,
      color: "text-amber-400",
    },
    {
      label: "Risk of Ruin (50% DD)",
      value: `${(result.riskOfRuin50pct * 100).toFixed(2)}%`,
      icon: AlertTriangle,
      color: "text-rose-400",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted-foreground">
        1,000 simulated portfolio paths over 12 months using geometric Brownian motion
        (μ=8% annual, σ=18% annual). Seeded PRNG for reproducibility.
      </p>

      <FanChart result={result} portfolioValue={portfolioValue} />

      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg border border-border bg-card/50 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3 w-3" />
                {item.label}
              </div>
              <p className={cn("text-base font-bold tabular-nums", item.color)}>{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-card/50 px-3 py-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground/80">Legend:</span>{" "}
          <span className="text-primary">Purple</span> = Median path.{" "}
          <span className="text-emerald-400">Green</span> = 75th/90th percentile.{" "}
          <span className="text-red-400">Red dashed</span> = 10th percentile (worst 10% of outcomes).
          Shaded bands show interquartile ranges. Dotted horizontal = starting portfolio value.
        </p>
      </div>
    </div>
  );
}

// ─── Custom Builder ───────────────────────────────────────────────────────────

function CustomBuilder({
  params,
  onChange,
  onSave,
}: {
  params: CustomParams;
  onChange: (p: CustomParams) => void;
  onSave: () => void;
}) {
  const [name, setName] = useState("My Scenario");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sliders: {
    key: keyof CustomParams;
    label: string;
    min: number;
    max: number;
    step: number;
    format: (v: number) => string;
    color: (v: number) => string;
  }[] = [
    {
      key: "marketShock",
      label: "Market Shock",
      min: -60,
      max: 30,
      step: 1,
      format: (v) => `${v >= 0 ? "+" : ""}${v}%`,
      color: (v) => v < 0 ? "text-red-400" : "text-emerald-400",
    },
    {
      key: "rateShock",
      label: "Rate Shock",
      min: -300,
      max: 500,
      step: 25,
      format: (v) => `${v >= 0 ? "+" : ""}${v}bp`,
      color: (v) => v > 200 ? "text-red-400" : v < -100 ? "text-amber-400" : "text-muted-foreground",
    },
    {
      key: "vixShock",
      label: "VIX Level",
      min: 10,
      max: 80,
      step: 1,
      format: (v) => `${v}`,
      color: (v) => v > 40 ? "text-red-400" : v > 25 ? "text-amber-400" : "text-emerald-400",
    },
    {
      key: "usdShock",
      label: "USD Shock",
      min: -20,
      max: 20,
      step: 1,
      format: (v) => `${v >= 0 ? "+" : ""}${v}%`,
      color: (_v) => "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-4">
      {sliders.map((slider) => {
        const val = params[slider.key];
        const colorClass = slider.color(val);
        return (
          <div key={slider.key}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground/80">{slider.label}</span>
              <span className={cn("text-[11px] font-bold tabular-nums", colorClass)}>
                {slider.format(val)}
              </span>
            </div>
            <Slider
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={[val]}
              onValueChange={([v]) => onChange({ ...params, [slider.key]: v })}
              className="w-full"
            />
            <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground/50">
              <span>{slider.format(slider.min)}</span>
              <span>{slider.format(slider.max)}</span>
            </div>
          </div>
        );
      })}

      {/* Save row */}
      <div className="flex gap-2 pt-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 flex-1 rounded-md border border-border bg-background px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Scenario name…"
        />
        <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={handleSave}>
          {saved ? "Saved!" : "Save Scenario"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StressTester() {
  const positions = useTradingStore((s) => s.positions);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);

  const [activeSection, setActiveSection] = useState<"prebuilt" | "custom" | "results" | "montecarlo">("prebuilt");
  const [activeScenario, setActiveScenario] = useState<StressScenario | null>(null);
  const [customParams, setCustomParams] = useState<CustomParams>({
    marketShock: -20,
    rateShock: 200,
    vixShock: 35,
    usdShock: 5,
  });
  const [stressResult, setStressResult] = useState<StressResult | null>(null);

  const applyScenario = useCallback(
    (scenario: StressScenario) => {
      setActiveScenario(scenario);
      const result = computeStressResult(
        positions,
        portfolioValue,
        scenario,
        null,
        scenario.name,
        scenario.recoveryMonths,
        scenario.id === "liquiditycrisis",
      );
      setStressResult(result);
      setActiveSection("results");
    },
    [positions, portfolioValue],
  );

  const applyCustom = useCallback(() => {
    setActiveScenario(null);
    const result = computeStressResult(
      positions,
      portfolioValue,
      null,
      customParams,
      "Custom Scenario",
      12,
      false,
    );
    setStressResult(result);
    setActiveSection("results");
  }, [positions, portfolioValue, customParams]);

  // Update custom result live as sliders change
  const handleCustomChange = useCallback(
    (p: CustomParams) => {
      setCustomParams(p);
      const result = computeStressResult(
        positions,
        portfolioValue,
        null,
        p,
        "Custom Scenario",
        12,
        false,
      );
      setStressResult(result);
    },
    [positions, portfolioValue],
  );

  const sections = [
    { id: "prebuilt" as const, label: "Scenarios", icon: Zap },
    { id: "custom" as const, label: "Custom", icon: Activity },
    { id: "results" as const, label: "Results", icon: BarChart2 },
    { id: "montecarlo" as const, label: "Monte Carlo", icon: Target },
  ];

  return (
    <div className="space-y-4">
      {/* Section nav */}
      <div className="flex gap-1 rounded-lg bg-muted/30 p-1">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors",
                activeSection === s.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3 w-3" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Prebuilt Scenarios */}
      {activeSection === "prebuilt" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <p className="text-[11px] font-medium text-muted-foreground">
              Historical &amp; Hypothetical Scenarios
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SCENARIOS.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isActive={activeScenario?.id === scenario.id}
                onApply={applyScenario}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom Builder */}
      {activeSection === "custom" && (
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="flex items-center gap-2 text-[13px]">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Custom Scenario Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <CustomBuilder
              params={customParams}
              onChange={handleCustomChange}
              onSave={applyCustom}
            />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {activeSection === "results" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="h-3.5 w-3.5 text-primary" />
              <p className="text-[11px] font-medium text-muted-foreground">
                {stressResult ? stressResult.scenarioName : "Stress Test Results"}
              </p>
            </div>
            {stressResult && (
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => setActiveSection("prebuilt")}
                >
                  Change Scenario
                </Button>
              </div>
            )}
          </div>
          {stressResult ? (
            <ResultsPanel result={stressResult} />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12">
              <Shield className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No scenario applied yet</p>
              <p className="text-[11px] text-muted-foreground/60">
                Select a scenario from the Scenarios tab to see results.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="text-[11px]"
                onClick={() => setActiveSection("prebuilt")}
              >
                Browse Scenarios
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Monte Carlo */}
      {activeSection === "montecarlo" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-indigo-400" />
            <p className="text-[11px] font-medium text-muted-foreground">Monte Carlo Simulation</p>
          </div>
          <MonteCarloPanel portfolioValue={portfolioValue} />
        </div>
      )}
    </div>
  );
}
