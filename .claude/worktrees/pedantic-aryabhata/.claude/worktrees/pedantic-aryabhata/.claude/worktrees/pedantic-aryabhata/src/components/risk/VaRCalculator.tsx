"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Mulberry32 seeded PRNG
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Normal distribution CDF approximation
function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

// Box-Muller transform for normal random variable
function boxMuller(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-10);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ---------------------------------------------------------------------------
// Data generation
// ---------------------------------------------------------------------------

interface VaRResult {
  var95Dollar: number;
  var95Pct: number;
  var99Dollar: number;
  var99Pct: number;
  var10Day95Dollar: number;
  var10Day99Dollar: number;
  es95Dollar: number;
  es99Dollar: number;
}

interface BacktestDay {
  pnl: number;
  var95: number;
  isException95: boolean;
}

function generateSyntheticData(portfolioValue: number): {
  returns: number[];
  historicalVaR: VaRResult;
  parametricVaR: VaRResult;
  monteCarloVaR: VaRResult;
  backtestDays: BacktestDay[];
  exceptions: number;
} {
  const rand = mulberry32(1111);

  // Generate 252 daily returns (roughly 1% daily vol with slight negative skew)
  const dailyMu = 0.0003; // slight positive drift
  const dailySigma = 0.012; // 1.2% daily vol
  const returns: number[] = [];
  for (let i = 0; i < 252; i++) {
    const z = boxMuller(rand);
    // Add slight negative skew via cubic transform
    const skewed = z - 0.1 * (z * z - 1);
    returns.push(dailyMu + dailySigma * skewed);
  }
  const sortedReturns = [...returns].sort((a, b) => a - b);

  // --- Historical VaR ---
  const hist5thIdx = Math.floor(0.05 * sortedReturns.length);
  const hist1stIdx = Math.floor(0.01 * sortedReturns.length);
  const histR95 = sortedReturns[hist5thIdx];
  const histR99 = sortedReturns[hist1stIdx];
  const histVar95 = Math.abs(histR95) * portfolioValue;
  const histVar99 = Math.abs(histR99) * portfolioValue;

  // ES for historical: average of losses beyond threshold
  const tail95 = sortedReturns.slice(0, hist5thIdx);
  const tail99 = sortedReturns.slice(0, hist1stIdx);
  const histES95 = tail95.length > 0 ? Math.abs(tail95.reduce((a, b) => a + b, 0) / tail95.length) * portfolioValue : histVar95 * 1.3;
  const histES99 = tail99.length > 0 ? Math.abs(tail99.reduce((a, b) => a + b, 0) / tail99.length) * portfolioValue : histVar99 * 1.3;

  const historicalVaR: VaRResult = {
    var95Dollar: histVar95,
    var95Pct: Math.abs(histR95) * 100,
    var99Dollar: histVar99,
    var99Pct: Math.abs(histR99) * 100,
    var10Day95Dollar: histVar95 * Math.sqrt(10),
    var10Day99Dollar: histVar99 * Math.sqrt(10),
    es95Dollar: histES95,
    es99Dollar: histES99,
  };

  // --- Parametric VaR ---
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
  const sigma = Math.sqrt(variance);
  const paramR95 = mean - 1.645 * sigma;
  const paramR99 = mean - 2.326 * sigma;

  // ES parametric: mean of normal below VaR threshold
  // ES_95 = mu - sigma * phi(z95) / (1 - 0.95)
  const phi95 = Math.exp(-0.5 * 1.645 * 1.645) / Math.sqrt(2 * Math.PI);
  const phi99 = Math.exp(-0.5 * 2.326 * 2.326) / Math.sqrt(2 * Math.PI);
  const paramES95 = Math.abs(mean - sigma * phi95 / 0.05) * portfolioValue;
  const paramES99 = Math.abs(mean - sigma * phi99 / 0.01) * portfolioValue;

  const parametricVaR: VaRResult = {
    var95Dollar: Math.abs(paramR95) * portfolioValue,
    var95Pct: Math.abs(paramR95) * 100,
    var99Dollar: Math.abs(paramR99) * portfolioValue,
    var99Pct: Math.abs(paramR99) * 100,
    var10Day95Dollar: Math.abs(paramR95) * portfolioValue * Math.sqrt(10),
    var10Day99Dollar: Math.abs(paramR99) * portfolioValue * Math.sqrt(10),
    es95Dollar: paramES95,
    es99Dollar: paramES99,
  };

  // --- Monte Carlo VaR (10,000 paths) ---
  const rand2 = mulberry32(2222);
  const simReturns: number[] = [];
  for (let i = 0; i < 10000; i++) {
    simReturns.push(mean + sigma * boxMuller(rand2));
  }
  simReturns.sort((a, b) => a - b);
  const mc5thIdx = Math.floor(0.05 * simReturns.length);
  const mc1stIdx = Math.floor(0.01 * simReturns.length);
  const mcR95 = simReturns[mc5thIdx];
  const mcR99 = simReturns[mc1stIdx];
  const mcTail95 = simReturns.slice(0, mc5thIdx);
  const mcTail99 = simReturns.slice(0, mc1stIdx);
  const mcES95 = Math.abs(mcTail95.reduce((a, b) => a + b, 0) / mcTail95.length) * portfolioValue;
  const mcES99 = Math.abs(mcTail99.reduce((a, b) => a + b, 0) / mcTail99.length) * portfolioValue;

  const monteCarloVaR: VaRResult = {
    var95Dollar: Math.abs(mcR95) * portfolioValue,
    var95Pct: Math.abs(mcR95) * 100,
    var99Dollar: Math.abs(mcR99) * portfolioValue,
    var99Pct: Math.abs(mcR99) * 100,
    var10Day95Dollar: Math.abs(mcR95) * portfolioValue * Math.sqrt(10),
    var10Day99Dollar: Math.abs(mcR99) * portfolioValue * Math.sqrt(10),
    es95Dollar: mcES95,
    es99Dollar: mcES99,
  };

  // --- Backtesting (60 days) ---
  const rand3 = mulberry32(3333);
  const var95Daily = Math.abs(paramR95) * portfolioValue;
  const backtestDays: BacktestDay[] = [];
  let exceptions = 0;
  for (let i = 0; i < 60; i++) {
    const z = boxMuller(rand3);
    // Occasionally inject fat-tail event
    const fatTail = rand3() < 0.04 ? rand3() * -3 : 0;
    const dailyReturn = mean + sigma * z + fatTail * sigma;
    const pnl = dailyReturn * portfolioValue;
    const isException95 = pnl < -var95Daily;
    if (isException95) exceptions++;
    backtestDays.push({ pnl, var95: -var95Daily, isException95 });
  }

  return { returns, historicalVaR, parametricVaR, monteCarloVaR, backtestDays, exceptions };
}

// ---------------------------------------------------------------------------
// Stress scenario VaR
// ---------------------------------------------------------------------------
interface StressVaR {
  scenario: string;
  volMultiplier: number;
  description: string;
  historicalVar: number;
  parametricVar: number;
  monteCarloVar: number;
}

function computeStressVaRs(pv: number, histVar95: number, paramVar95: number, mcVar95: number): StressVaR[] {
  const scenarios = [
    { scenario: "Normal Conditions", volMultiplier: 1.0, description: "Current market environment" },
    { scenario: "High Volatility (VIX >30)", volMultiplier: 2.1, description: "Elevated fear, trend reversals" },
    { scenario: "2008 Crisis (VIX = 80)", volMultiplier: 5.2, description: "Credit freeze, systemic shock" },
    { scenario: "Correlation Breakdown", volMultiplier: 3.4, description: "All assets fall together" },
    { scenario: "Liquidity Stress", volMultiplier: 2.8, description: "Wide spreads, forced selling" },
  ];
  return scenarios.map((s) => ({
    ...s,
    historicalVar: histVar95 * s.volMultiplier,
    parametricVar: paramVar95 * s.volMultiplier,
    monteCarloVar: mcVar95 * s.volMultiplier,
  }));
}

// ---------------------------------------------------------------------------
// SVG: Grouped bar chart for stress test VaR
// ---------------------------------------------------------------------------
function StressBarChart({ stressVaRs, portfolioValue }: { stressVaRs: StressVaR[]; portfolioValue: number }) {
  const W = 560;
  const H = 200;
  const pad = { l: 60, r: 20, t: 20, b: 60 };
  const gW = W - pad.l - pad.r;
  const gH = H - pad.t - pad.b;

  const maxVal = Math.max(
    ...stressVaRs.map((s) => Math.max(s.historicalVar, s.parametricVar, s.monteCarloVar)),
  );
  const worstScenarioIdx = stressVaRs.reduce(
    (best, s, i) =>
      Math.max(s.historicalVar, s.parametricVar, s.monteCarloVar) >
      Math.max(stressVaRs[best].historicalVar, stressVaRs[best].parametricVar, stressVaRs[best].monteCarloVar)
        ? i
        : best,
    0,
  );

  const n = stressVaRs.length;
  const groupW = gW / n;
  const barW = (groupW - 8) / 3;

  function sy(v: number) {
    return pad.t + gH - (v / maxVal) * gH;
  }

  const colors = ["hsl(var(--primary))", "#f97316", "#ef4444"];
  const labels = ["Historical", "Parametric", "Monte Carlo"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Y gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const yPos = pad.t + gH * (1 - frac);
        const val = maxVal * frac;
        return (
          <g key={`grid-${frac}`}>
            <line x1={pad.l} y1={yPos} x2={W - pad.r} y2={yPos} stroke="hsl(var(--border))" strokeWidth="0.5" />
            <text x={pad.l - 4} y={yPos + 3} textAnchor="end" fontSize="8" fill="hsl(var(--muted-foreground))">
              ${(val / 1000).toFixed(0)}k
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {stressVaRs.map((s, gi) => {
        const groupX = pad.l + gi * groupW + 4;
        const vals = [s.historicalVar, s.parametricVar, s.monteCarloVar];
        const isWorst = gi === worstScenarioIdx;
        return (
          <g key={`group-${gi}`}>
            {vals.map((v, bi) => {
              const bx = groupX + bi * barW;
              const bh = (v / maxVal) * gH;
              const by = pad.t + gH - bh;
              return (
                <rect
                  key={`bar-${gi}-${bi}`}
                  x={bx}
                  y={by}
                  width={barW - 1}
                  height={bh}
                  fill={colors[bi]}
                  opacity={isWorst ? 1 : 0.7}
                  rx={1}
                />
              );
            })}
            {/* Worst badge */}
            {isWorst && (
              <text
                x={groupX + (groupW - 8) / 2}
                y={pad.t - 4}
                textAnchor="middle"
                fontSize="7"
                fontWeight="600"
                fill="#ef4444"
              >
                WORST
              </text>
            )}
            {/* X label */}
            <text
              x={groupX + (groupW - 8) / 2}
              y={pad.t + gH + 12}
              textAnchor="middle"
              fontSize="7"
              fill="hsl(var(--muted-foreground))"
            >
              {s.scenario.length > 16 ? s.scenario.slice(0, 14) + "..." : s.scenario}
            </text>
          </g>
        );
      })}

      {/* X axis */}
      <line x1={pad.l} y1={pad.t + gH} x2={W - pad.r} y2={pad.t + gH} stroke="hsl(var(--border))" strokeWidth="1" />

      {/* Legend */}
      {labels.map((lbl, i) => (
        <g key={`legend-${i}`}>
          <rect x={pad.l + i * 90} y={H - 16} width={10} height={8} fill={colors[i]} rx={1} />
          <text x={pad.l + i * 90 + 13} y={H - 9} fontSize="8" fill="hsl(var(--muted-foreground))">
            {lbl}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SVG: Backtest P&L chart
// ---------------------------------------------------------------------------
function BacktestChart({ days }: { days: BacktestDay[] }) {
  const W = 560;
  const H = 160;
  const pad = { l: 56, r: 16, t: 16, b: 24 };
  const gW = W - pad.l - pad.r;
  const gH = H - pad.t - pad.b;

  const maxAbs = Math.max(...days.map((d) => Math.abs(d.pnl)), Math.abs(days[0]?.var95 ?? 0));
  const barW = gW / days.length - 1;

  function sy(v: number) {
    return pad.t + gH / 2 - (v / maxAbs) * (gH / 2);
  }

  const varY = sy(days[0]?.var95 ?? 0);
  const baseY = pad.t + gH / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[-1, -0.5, 0, 0.5, 1].map((frac) => {
        const y = pad.t + gH / 2 - frac * (gH / 2);
        const label = (frac * maxAbs / 1000).toFixed(1);
        return (
          <g key={`grid-${frac}`}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray={frac === 0 ? "0" : "2,2"} />
            <text x={pad.l - 3} y={y + 3} textAnchor="end" fontSize="7.5" fill="hsl(var(--muted-foreground))">
              ${label}k
            </text>
          </g>
        );
      })}

      {/* P&L bars */}
      {days.map((d, i) => {
        const x = pad.l + i * (gW / days.length);
        const isPos = d.pnl >= 0;
        const barH = Math.abs(d.pnl / maxAbs) * (gH / 2);
        const barY = isPos ? baseY - barH : baseY;
        return (
          <rect
            key={`bar-${i}`}
            x={x}
            y={barY}
            width={barW}
            height={barH}
            fill={d.isException95 ? "#f97316" : isPos ? "hsl(var(--primary))" : "rgba(239,68,68,0.5)"}
            opacity={0.85}
          />
        );
      })}

      {/* VaR line */}
      <line x1={pad.l} y1={varY} x2={W - pad.r} y2={varY} stroke="rgb(239,68,68)" strokeWidth="1.5" strokeDasharray="4,2" />
      <text x={W - pad.r + 2} y={varY + 3} fontSize="7.5" fill="rgb(239,68,68)">
        VaR
      </text>

      {/* Exception markers */}
      {days.map((d, i) =>
        d.isException95 ? (
          <circle
            key={`exc-${i}`}
            cx={pad.l + i * (gW / days.length) + barW / 2}
            cy={sy(d.pnl) - 4}
            r={3}
            fill="#f97316"
            stroke="white"
            strokeWidth="0.5"
          />
        ) : null,
      )}

      {/* X axis */}
      <line x1={pad.l} y1={baseY} x2={W - pad.r} y2={baseY} stroke="hsl(var(--border))" strokeWidth="0.5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main VaRCalculator component
// ---------------------------------------------------------------------------

interface VaRCalculatorProps {
  portfolioValue: number;
}

export default function VaRCalculator({ portfolioValue }: VaRCalculatorProps) {
  const pv = portfolioValue > 0 ? portfolioValue : 100000;

  const { historicalVaR, parametricVaR, monteCarloVaR, backtestDays, exceptions } = useMemo(
    () => generateSyntheticData(pv),
    [pv],
  );

  const stressVaRs = useMemo(
    () => computeStressVaRs(pv, historicalVaR.var95Dollar, parametricVaR.var95Dollar, monteCarloVaR.var95Dollar),
    [pv, historicalVaR, parametricVaR, monteCarloVaR],
  );

  // Basel traffic light
  const baselZone =
    exceptions < 5
      ? { label: "Green Zone", cls: "bg-green-500/20 text-green-600 dark:text-green-400", desc: "Model performing well (<5 exceptions)" }
      : exceptions < 10
        ? { label: "Yellow Zone", cls: "bg-amber-500/20 text-amber-600 dark:text-amber-400", desc: "Model under scrutiny (5–9 exceptions)" }
        : { label: "Red Zone", cls: "bg-red-500/20 text-red-600 dark:text-red-400", desc: "Regulatory action required (≥10 exceptions)" };

  const methods = [
    {
      name: "Historical VaR",
      sub: "Sort past 252 returns, take 5th percentile",
      tag: "Data-driven",
      tagCls: "bg-primary/20 text-primary dark:text-primary",
      result: historicalVaR,
      color: "hsl(var(--primary))",
    },
    {
      name: "Parametric VaR",
      sub: "Normal distribution: μ − z·σ",
      tag: "Fast",
      tagCls: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
      result: parametricVaR,
      color: "#f97316",
    },
    {
      name: "Monte Carlo VaR",
      sub: "10,000 simulated portfolio paths",
      tag: "Comprehensive",
      tagCls: "bg-primary/20 text-primary dark:text-primary",
      result: monteCarloVaR,
      color: "#a855f7",
    },
  ];

  return (
    <div className="space-y-5">

      {/* Section 1: Methods comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">VaR Methods Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {methods.map((m) => (
              <div key={m.name} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold leading-tight">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{m.sub}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${m.tagCls}`}>{m.tag}</span>
                </div>
                <div className="border-t border-border pt-2 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1-Day 95% VaR</span>
                    <span className="font-semibold text-red-500">
                      ${m.result.var95Dollar.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      &nbsp;<span className="text-muted-foreground font-normal">({m.result.var95Pct.toFixed(2)}%)</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1-Day 99% VaR</span>
                    <span className="font-semibold text-red-700">
                      ${m.result.var99Dollar.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      &nbsp;<span className="text-muted-foreground font-normal">({m.result.var99Pct.toFixed(2)}%)</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">10-Day 95% VaR</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      ${m.result.var10Day95Dollar.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      &nbsp;<span className="text-muted-foreground font-normal">(×√10)</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">10-Day 99% VaR</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-500">
                      ${m.result.var10Day99Dollar.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Educational callout */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
            <p className="font-semibold text-foreground">Which method is best?</p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 text-muted-foreground">
              <p><span className="font-medium text-foreground">Historical:</span> Best for fat tails — captures real market events without distribution assumptions.</p>
              <p><span className="font-medium text-foreground">Parametric:</span> Best for speed — analytical formula, easy to decompose by asset. Assumes normality.</p>
              <p><span className="font-medium text-foreground">Monte Carlo:</span> Best for complex portfolios with options, path-dependence, or non-linear payoffs.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Stress Test VaR */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Stress Test VaR — 5 Market Regimes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StressBarChart stressVaRs={stressVaRs} portfolioValue={pv} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            {stressVaRs.map((s, i) => {
              const maxVar = Math.max(s.historicalVar, s.parametricVar, s.monteCarloVar);
              const isWorst = i === stressVaRs.reduce((best, cur, idx) => {
                const curMax = Math.max(cur.historicalVar, cur.parametricVar, cur.monteCarloVar);
                const bestMax = Math.max(stressVaRs[best].historicalVar, stressVaRs[best].parametricVar, stressVaRs[best].monteCarloVar);
                return curMax > bestMax ? idx : best;
              }, 0);
              return (
                <div key={s.scenario} className={`rounded-lg border p-2 text-[11px] space-y-0.5 ${isWorst ? "border-red-500/40 bg-red-500/5" : "border-border"}`}>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="font-medium text-foreground">{s.scenario}</span>
                    {isWorst && <Badge variant="destructive" className="text-[11px] px-1 py-0">Worst</Badge>}
                  </div>
                  <p className="text-muted-foreground">{s.description}</p>
                  <p className="font-semibold text-red-500">
                    Hist: ${(s.historicalVar / 1000).toFixed(1)}k
                  </p>
                  <p className="text-muted-foreground">
                    Param: ${(s.parametricVar / 1000).toFixed(1)}k
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Expected Shortfall (CVaR) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Expected Shortfall (CVaR) — Tail Risk Beyond VaR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">What is CVaR?</span> Expected Shortfall (ES), also called
            Conditional VaR, is the <em>average loss given that losses exceed the VaR threshold</em>. ES is always
            larger than VaR and gives a better picture of tail severity — not just how often bad days occur, but
            how bad they are.
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium text-muted-foreground">Method</th>
                  <th className="py-2 text-right font-medium text-muted-foreground">VaR 95%</th>
                  <th className="py-2 text-right font-medium text-muted-foreground">ES 95%</th>
                  <th className="py-2 text-right font-medium text-muted-foreground">ES / VaR</th>
                  <th className="py-2 text-right font-medium text-muted-foreground">VaR 99%</th>
                  <th className="py-2 text-right font-medium text-muted-foreground">ES 99%</th>
                  <th className="py-2 text-right font-medium text-muted-foreground">ES / VaR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {methods.map((m) => (
                  <tr key={m.name}>
                    <td className="py-2 font-medium">{m.name}</td>
                    <td className="py-2 text-right text-red-500">
                      ${m.result.var95Dollar.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2 text-right text-red-700 font-semibold">
                      ${m.result.es95Dollar.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2 text-right text-muted-foreground">
                      {(m.result.es95Dollar / m.result.var95Dollar).toFixed(2)}×
                    </td>
                    <td className="py-2 text-right text-red-500">
                      ${m.result.var99Dollar.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2 text-right text-red-700 font-semibold">
                      ${m.result.es99Dollar.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2 text-right text-muted-foreground">
                      {(m.result.es99Dollar / m.result.var99Dollar).toFixed(2)}×
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
            <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Why CVaR is superior to VaR</p>
            <p className="text-muted-foreground">
              VaR answers: "What is the worst loss at the 95th percentile?" CVaR answers: "Given we&apos;re in the
              worst 5% of outcomes, how bad is the average loss?" During crises, VaR can badly underestimate
              risk — CVaR sees through the tail. Basel III and FRTB regulations now require ES rather than VaR
              for internal models.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Backtesting */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">VaR Backtesting — Basel Traffic Light</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-border px-4 py-2.5 text-center">
              <p className="text-2xl font-semibold text-orange-500">{exceptions}</p>
              <p className="text-[11px] text-muted-foreground">Exceptions (60 days)</p>
            </div>
            <div className={`rounded-lg px-4 py-2.5 ${baselZone.cls}`}>
              <p className="text-sm font-semibold">{baselZone.label}</p>
              <p className="text-[11px] mt-0.5">{baselZone.desc}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex h-3 w-3 rounded-full bg-green-500" />Green: &lt;5
              <span className="inline-flex h-3 w-3 rounded-full bg-amber-500 ml-2" />Yellow: 5–9
              <span className="inline-flex h-3 w-3 rounded-full bg-red-500 ml-2" />Red: ≥10
            </div>
          </div>

          <BacktestChart days={backtestDays} />

          <div className="flex gap-4 text-[11px] text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-5 rounded bg-primary/80" />Normal day
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-5 rounded bg-red-500/50" />Loss day
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-5 rounded bg-orange-500" />VaR exception (loss exceeded VaR)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1 w-8 border-t-2 border-dashed border-red-500" />95% VaR line
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground">
            An exception occurs when the actual daily loss exceeds the predicted VaR. Under a well-calibrated
            95% model, we expect ~5% of days (3 in 60) to breach VaR. Too many exceptions mean the model
            underestimates risk; too few may indicate over-conservatism.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
