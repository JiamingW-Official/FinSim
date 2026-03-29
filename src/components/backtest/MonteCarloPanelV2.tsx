"use client";

import { useState, useMemo } from "react";
import { Settings } from "lucide-react";
import type { MonteCarloResult } from "@/types/backtest";

// ── Seeded PRNG for custom simulations ────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Custom simulation engine ───────────────────────────────────────────────

interface SimParams {
  drift: number;       // % per period
  volatility: number;  // % std dev per period
  startingValue: number;
  numPeriods: number;
  numSims: number;
}

interface CustomSimResult {
  percentiles: { p10: number[]; p25: number[]; p50: number[]; p75: number[]; p90: number[] };
  finalValues: number[];
  maxDrawdowns: number[];
  profitProbability: number;
}

function runCustomSimulation(params: SimParams, seed: number): CustomSimResult {
  const rng = mulberry32(seed);
  const { drift, volatility, startingValue, numPeriods, numSims } = params;
  const mu = drift / 100;
  const sigma = volatility / 100;

  // Box-Muller transform
  function randNormal(): number {
    const u1 = Math.max(1e-10, rng());
    const u2 = rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  const allPaths: number[][] = [];
  const finalValues: number[] = [];
  const maxDrawdowns: number[] = [];

  for (let sim = 0; sim < numSims; sim++) {
    const path: number[] = [startingValue];
    let peak = startingValue;
    let maxDD = 0;

    for (let t = 0; t < numPeriods; t++) {
      const prev = path[path.length - 1];
      const ret = mu + sigma * randNormal();
      const next = prev * (1 + ret);
      path.push(next);
      if (next > peak) peak = next;
      const dd = (peak - next) / peak;
      if (dd > maxDD) maxDD = dd;
    }

    allPaths.push(path);
    finalValues.push(path[path.length - 1]);
    maxDrawdowns.push(maxDD * 100);
  }

  // Compute percentile bands
  const p10: number[] = [];
  const p25: number[] = [];
  const p50: number[] = [];
  const p75: number[] = [];
  const p90: number[] = [];

  for (let t = 0; t <= numPeriods; t++) {
    const vals = allPaths.map((p) => p[t]).sort((a, b) => a - b);
    const idx = (pct: number) => Math.floor((pct / 100) * (vals.length - 1));
    p10.push(vals[idx(10)]);
    p25.push(vals[idx(25)]);
    p50.push(vals[idx(50)]);
    p75.push(vals[idx(75)]);
    p90.push(vals[idx(90)]);
  }

  const profitProbability = (finalValues.filter((v) => v > startingValue).length / finalValues.length) * 100;

  return { percentiles: { p10, p25, p50, p75, p90 }, finalValues, maxDrawdowns, profitProbability };
}

// ── Main Component ─────────────────────────────────────────────────────────

interface MonteCarloPanelV2Props {
  result: MonteCarloResult | null;
  startingCapital: number;
}

export default function MonteCarloPanelV2({ result, startingCapital }: MonteCarloPanelV2Props) {
  const [showParams, setShowParams] = useState(false);
  const [drift, setDrift] = useState(0.05);
  const [volatility, setVolatility] = useState(1.5);
  const [simStartValue, setSimStartValue] = useState(startingCapital);
  const [numPeriods, setNumPeriods] = useState(252);
  const [numSims, setNumSims] = useState(500);
  const [simSeed] = useState(42);
  const [useCustom, setUseCustom] = useState(false);

  const customSim = useMemo(() => {
    if (!useCustom) return null;
    return runCustomSimulation({ drift, volatility, startingValue: simStartValue, numPeriods, numSims }, simSeed);
  }, [useCustom, drift, volatility, simStartValue, numPeriods, numSims, simSeed]);

  // Use either custom sim or the result from the store
  const hasData = customSim !== null || result !== null;

  // Derived display values
  const profitProb = customSim
    ? customSim.profitProbability
    : result?.returnDistribution.profitProbability ?? 0;

  const dist = result?.returnDistribution;

  return (
    <div className="space-y-4">
      {/* Header with param toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground">
          Monte Carlo Simulation
          {result && ` (${result.runs.length} runs)`}
          {useCustom && " (Custom)"}
        </h3>
        <button
          onClick={() => setShowParams((v) => !v)}
          className="flex items-center gap-1.5 rounded-md border border-border/20 bg-muted/20 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50"
        >
          <Settings className="h-3 w-3" />
          Adjust Parameters
        </button>
      </div>

      {/* Adjust Parameters Panel */}
      {showParams && (
        <div className="space-y-3 rounded-lg border border-border/20 bg-muted/10 p-4">
          <h4 className="text-xs font-semibold text-muted-foreground">Simulation Parameters</h4>

          <div className="grid grid-cols-2 gap-3">
            <ParamInput
              label="Drift per period (%)"
              value={drift}
              onChange={setDrift}
              min={-5}
              max={5}
              step={0.05}
            />
            <ParamInput
              label="Volatility per period (%)"
              value={volatility}
              onChange={setVolatility}
              min={0.1}
              max={10}
              step={0.1}
            />
            <ParamInput
              label="Starting Value ($)"
              value={simStartValue}
              onChange={setSimStartValue}
              min={1000}
              max={1000000}
              step={1000}
            />
            <ParamInput
              label="Number of Periods"
              value={numPeriods}
              onChange={setNumPeriods}
              min={10}
              max={1000}
              step={10}
            />
            <div className="col-span-2">
              <ParamInput
                label="Number of Simulations"
                value={numSims}
                onChange={setNumSims}
                min={100}
                max={2000}
                step={100}
              />
            </div>
          </div>

          <button
            onClick={() => setUseCustom(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary"
          >
            Run Custom Simulation
          </button>
          {useCustom && (
            <button
              onClick={() => setUseCustom(false)}
              className="ml-2 text-xs text-muted-foreground hover:text-muted-foreground"
            >
              Reset to backtest result
            </button>
          )}
        </div>
      )}

      {!hasData && (
        <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">No Monte Carlo data</p>
          <p className="text-xs text-muted-foreground/70">Run a backtest with Monte Carlo enabled, or use the custom simulator above</p>
        </div>
      )}

      {/* Probability of Profit */}
      {hasData && (
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            label="Prob of Profit"
            value={`${profitProb.toFixed(1)}%`}
            good={profitProb > 50}
          />
          {dist && (
            <>
              <StatCard label="Mean Return" value={`${dist.mean > 0 ? "+" : ""}${dist.mean}%`} good={dist.mean > 0} />
              <StatCard label="Tail Risk" value={`${dist.tailRisk10}%`} good={dist.tailRisk10 < 20} />
            </>
          )}
          {customSim && !dist && (
            <>
              <StatCard
                label="Median Final"
                value={`$${customSim.percentiles.p50[customSim.percentiles.p50.length - 1]?.toFixed(0) ?? "—"}`}
                good={
                  (customSim.percentiles.p50[customSim.percentiles.p50.length - 1] ?? 0) >
                  simStartValue
                }
              />
              <StatCard
                label="Simulations"
                value={`${numSims}`}
              />
            </>
          )}
        </div>
      )}

      {/* Percentile Band Chart */}
      {hasData && (
        <div>
          <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
            Equity Confidence Bands (10th / 25th / 50th / 75th / 90th percentile)
          </h3>
          {customSim ? (
            <PercentileBandChart
              p10={customSim.percentiles.p10}
              p25={customSim.percentiles.p25}
              p50={customSim.percentiles.p50}
              p75={customSim.percentiles.p75}
              p90={customSim.percentiles.p90}
              startingValue={simStartValue}
            />
          ) : result ? (
            <PercentileBandChart
              p10={result.percentiles.p5}
              p25={result.percentiles.p25}
              p50={result.percentiles.p50}
              p75={result.percentiles.p75}
              p90={result.percentiles.p95}
              startingValue={startingCapital}
            />
          ) : null}
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground/70">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded-sm bg-primary/15" /> 10th-90th</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded-sm bg-primary/35" /> 25th-75th</span>
            <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-4 bg-primary" /> Median</span>
          </div>
        </div>
      )}

      {/* Final Distribution Histogram */}
      {hasData && (
        <div>
          <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
            Final Value Distribution
          </h3>
          {customSim ? (
            <FinalValueHistogram values={customSim.finalValues} startingValue={simStartValue} />
          ) : result ? (
            <ReturnHistogram runs={result.runs} />
          ) : null}
        </div>
      )}

      {/* Max Drawdown Distribution */}
      {hasData && (
        <div>
          <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
            Max Drawdown Distribution
          </h3>
          {customSim ? (
            <DrawdownHistogram values={customSim.maxDrawdowns} />
          ) : result ? (
            <div className="grid grid-cols-5 gap-1">
              {[10, 25, 50, 75, 90].map((pct) => {
                const sorted = [...result.runs.map((r) => r.maxDrawdownPercent)].sort((a, b) => a - b);
                const idx = Math.floor((pct / 100) * (sorted.length - 1));
                const val = sorted[idx] ?? 0;
                return (
                  <div key={pct} className="rounded-lg border border-border/20 bg-muted/20 p-2 text-center">
                    <div className="text-[11px] text-muted-foreground/70">P{pct}</div>
                    <div className="text-xs font-semibold text-rose-400">{val.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ── Param Input ───────────────────────────────────────────────────────────

function ParamInput({ label, value, onChange, min, max, step }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-muted-foreground">{value}</span>
      </div>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v) && v >= min && v <= max) onChange(v);
        }}
        className="w-full rounded-md border border-border/20 bg-card px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg border border-border/20 bg-muted/20 px-3 py-2">
      <div className="text-[11px] text-muted-foreground/70">{label}</div>
      <div className={`text-sm font-semibold ${good === undefined ? "text-foreground" : good ? "text-emerald-400" : "text-rose-400"}`}>
        {value}
      </div>
    </div>
  );
}

// ── Percentile Band Chart (pure SVG) ──────────────────────────────────────

function PercentileBandChart({
  p10, p25, p50, p75, p90, startingValue,
}: {
  p10: number[]; p25: number[]; p50: number[]; p75: number[]; p90: number[];
  startingValue: number;
}) {
  const n = p50.length;
  if (n === 0) return null;

  const W = 480;
  const H = 160;
  const PAD_L = 48;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = 16;

  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const allVals = [...p10, ...p90];
  const minV = Math.min(...allVals, startingValue * 0.8);
  const maxV = Math.max(...allVals, startingValue * 1.2);
  const range = maxV - minV || 1;

  function xOf(i: number) { return PAD_L + (i / (n - 1)) * chartW; }
  function yOf(v: number) { return PAD_T + chartH - ((v - minV) / range) * chartH; }

  function toPath(arr: number[]) {
    return arr.map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ");
  }

  function toArea(top: number[], bottom: number[]) {
    const fwd = top.map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ");
    const bwd = [...bottom].reverse().map((v, i) => `L ${xOf(bottom.length - 1 - i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ");
    return `${fwd} ${bwd} Z`;
  }

  // Starting capital reference line
  const startY = yOf(startingValue);

  // Y-axis labels
  const yTicks = [minV, (minV + maxV) / 2, maxV];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg" style={{ height: H }}>
      {/* Starting value reference */}
      <line x1={PAD_L} y1={startY} x2={W - PAD_R} y2={startY} stroke="#374151" strokeWidth={1} strokeDasharray="4 3" />

      {/* 10-90 band */}
      <path d={toArea(p90, p10)} fill="rgba(59,130,246,0.1)" />
      {/* 25-75 band */}
      <path d={toArea(p75, p25)} fill="rgba(59,130,246,0.25)" />
      {/* Median line */}
      <path d={toPath(p50)} fill="none" stroke="#3b82f6" strokeWidth={2} />
      {/* P10 / P90 outlines */}
      <path d={toPath(p10)} fill="none" stroke="rgba(59,130,246,0.4)" strokeWidth={1} />
      <path d={toPath(p90)} fill="none" stroke="rgba(59,130,246,0.4)" strokeWidth={1} />

      {/* Y-axis labels */}
      {yTicks.map((v, i) => (
        <text key={i} x={PAD_L - 4} y={yOf(v) + 3} textAnchor="end" fontSize={8} fill="#52525b">
          ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}
        </text>
      ))}
    </svg>
  );
}

// ── Final Value Histogram (pure SVG) ─────────────────────────────────────

function FinalValueHistogram({ values, startingValue }: { values: number[]; startingValue: number }) {
  if (values.length === 0) return null;

  const BINS = 20;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const binWidth = range / BINS;
  const bins: number[] = new Array(BINS).fill(0);

  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / binWidth), BINS - 1);
    bins[idx]++;
  }

  const maxCount = Math.max(...bins);
  const W = 480;
  const H = 80;
  const PAD_L = 8;
  const PAD_R = 8;
  const PAD_T = 4;
  const PAD_B = 16;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const barW = chartW / BINS;

  // Zero reference: where startingValue falls in x
  const startX = PAD_L + ((startingValue - min) / range) * chartW;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg" style={{ height: H }}>
      {/* Starting value reference line */}
      <line x1={startX} y1={PAD_T} x2={startX} y2={H - PAD_B} stroke="#374151" strokeWidth={1} strokeDasharray="3 2" />
      <text x={startX + 2} y={PAD_T + 8} fontSize={7} fill="#6b7280">start</text>

      {bins.map((count, i) => {
        const binCenter = min + (i + 0.5) * binWidth;
        const isProfit = binCenter >= startingValue;
        const barH = maxCount > 0 ? (count / maxCount) * chartH : 0;
        const x = PAD_L + i * barW;
        const y = PAD_T + chartH - barH;
        return (
          <rect
            key={i}
            x={x + 0.5}
            y={y}
            width={barW - 1}
            height={Math.max(barH, 1)}
            fill={isProfit ? "rgba(16,185,129,0.6)" : "rgba(239,68,68,0.6)"}
            rx={1}
          />
        );
      })}

      {/* X-axis labels */}
      {[0, 0.5, 1].map((t, i) => {
        const v = min + t * range;
        return (
          <text key={i} x={PAD_L + t * chartW} y={H - 2} textAnchor="middle" fontSize={7} fill="#52525b">
            ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}
          </text>
        );
      })}
    </svg>
  );
}

// ── Return Histogram (for result-based view) ──────────────────────────────

function ReturnHistogram({ runs }: { runs: { totalReturnPercent: number }[] }) {
  if (runs.length === 0) return null;

  const returns = runs.map((r) => r.totalReturnPercent);
  const min = Math.min(...returns);
  const max = Math.max(...returns);
  const range = max - min || 1;
  const BINS = 20;
  const binWidth = range / BINS;
  const bins: number[] = new Array(BINS).fill(0);

  for (const r of returns) {
    const idx = Math.min(Math.floor((r - min) / binWidth), BINS - 1);
    bins[idx]++;
  }

  const maxCount = Math.max(...bins);

  return (
    <div className="flex h-20 items-end gap-px">
      {bins.map((count, i) => {
        const binCenter = min + (i + 0.5) * binWidth;
        const isPositive = binCenter >= 0;
        const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <div
            key={i}
            className="group relative flex-1 rounded-t-sm transition-colors hover:brightness-125"
            style={{
              height: `${Math.max(height, 1)}%`,
              backgroundColor: isPositive
                ? `rgba(16, 185, 129, ${0.3 + (count / maxCount) * 0.5})`
                : `rgba(239, 68, 68, ${0.3 + (count / maxCount) * 0.5})`,
            }}
          >
            {count > 0 && (
              <div className="absolute -top-6 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground shadow group-hover:block whitespace-nowrap">
                {binCenter.toFixed(1)}% ({count})
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Drawdown Histogram (pure SVG) ─────────────────────────────────────────

function DrawdownHistogram({ values }: { values: number[] }) {
  if (values.length === 0) return null;

  const BINS = 16;
  const min = 0;
  const max = Math.max(...values, 1);
  const binWidth = max / BINS;
  const bins: number[] = new Array(BINS).fill(0);

  for (const v of values) {
    const idx = Math.min(Math.floor(v / binWidth), BINS - 1);
    bins[idx]++;
  }

  const maxCount = Math.max(...bins);

  return (
    <div className="flex h-16 items-end gap-px">
      {bins.map((count, i) => {
        const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
        const intensity = 0.3 + (count / maxCount) * 0.5;
        return (
          <div
            key={i}
            className="group relative flex-1 rounded-t-sm"
            style={{
              height: `${Math.max(height, 1)}%`,
              backgroundColor: `rgba(239, 68, 68, ${intensity})`,
            }}
          >
            {count > 0 && (
              <div className="absolute -top-6 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground shadow group-hover:block whitespace-nowrap">
                {(i * binWidth).toFixed(1)}-{((i + 1) * binWidth).toFixed(1)}% ({count})
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
