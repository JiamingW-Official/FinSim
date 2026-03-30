"use client";

import { useState, useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

// ── mulberry32 seeded PRNG ────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return function (): number {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Normal distribution helpers ───────────────────────────────────────────────

/** Box-Muller transform: returns a standard-normal sample */
function randn(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-10);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** Rational approximation for inverse normal CDF (Abramowitz & Stegun) */
function normInv(p: number): number {
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtDollar(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Confidence = 0.9 | 0.95 | 0.99;
type Horizon = 1 | 5 | 10;

interface VaRResult {
  historical: { var: number; cvar: number } | null;
  parametric: { var: number; cvar: number; mu: number; sigma: number } | null;
  monteCarlo: { var: number; cvar: number } | null;
  returns: number[];
  bins: { x: number; count: number }[];
  varLine: number; // return threshold for histogram
}

// ── Histogram builder ─────────────────────────────────────────────────────────

function buildHistogram(
  returns: number[],
  numBins = 24,
): { x: number; count: number }[] {
  if (returns.length === 0) return [];
  const min = Math.min(...returns);
  const max = Math.max(...returns);
  const range = max - min || 0.01;
  const binWidth = range / numBins;

  const bins: { x: number; count: number }[] = Array.from(
    { length: numBins },
    (_, i) => ({ x: min + (i + 0.5) * binWidth, count: 0 }),
  );

  for (const r of returns) {
    const idx = Math.min(
      Math.floor((r - min) / binWidth),
      numBins - 1,
    );
    bins[idx].count++;
  }
  return bins;
}

// ── SVG Histogram ─────────────────────────────────────────────────────────────

function ReturnHistogram({
  bins,
  varReturn,
  label,
}: {
  bins: { x: number; count: number }[];
  varReturn: number;
  label: string;
}) {
  const W = 340;
  const H = 100;
  const PADL = 4;
  const PADR = 4;
  const PADT = 8;
  const PADB = 20;
  const innerW = W - PADL - PADR;
  const innerH = H - PADT - PADB;

  if (bins.length === 0) return null;

  const maxCount = Math.max(...bins.map((b) => b.count), 1);
  const minX = bins[0].x - (bins[1]?.x - bins[0].x) / 2;
  const maxX = bins[bins.length - 1].x + (bins[1]?.x - bins[0].x) / 2;
  const xRange = maxX - minX || 1;

  function toSvgX(v: number) {
    return PADL + ((v - minX) / xRange) * innerW;
  }
  function toSvgY(count: number) {
    return PADT + innerH - (count / maxCount) * innerH;
  }

  const barW = Math.max(1, (innerW / bins.length) - 1);
  const varX = toSvgX(varReturn);

  return (
    <div>
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      <svg
        width={W}
        height={H}
        className="w-full"
        viewBox={`0 0 ${W} ${H}`}
        aria-label="Return distribution histogram"
      >
        {bins.map((bin, i) => {
          const x = toSvgX(bin.x) - barW / 2;
          const y = toSvgY(bin.count);
          const h = innerH - (y - PADT);
          const isLoss = bin.x < varReturn;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, 0)}
              fill={isLoss ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
              opacity={isLoss ? 0.7 : 0.4}
            />
          );
        })}
        {/* VaR line */}
        <line
          x1={varX}
          y1={PADT}
          x2={varX}
          y2={H - PADB}
          stroke="hsl(var(--destructive))"
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />
        <text
          x={varX + 3}
          y={PADT + 8}
          fontSize={8}
          fill="hsl(var(--destructive))"
          fontFamily="var(--font-mono, monospace)"
        >
          VaR
        </text>
        {/* Baseline */}
        <line
          x1={PADL}
          y1={H - PADB}
          x2={W - PADR}
          y2={H - PADB}
          stroke="hsl(var(--border))"
          strokeWidth={0.5}
        />
        {/* X-axis labels */}
        <text
          x={PADL}
          y={H - 4}
          fontSize={7}
          fill="hsl(var(--muted-foreground))"
          textAnchor="start"
        >
          {(minX * 100).toFixed(1)}%
        </text>
        <text
          x={W - PADR}
          y={H - 4}
          fontSize={7}
          fill="hsl(var(--muted-foreground))"
          textAnchor="end"
        >
          {(maxX * 100).toFixed(1)}%
        </text>
      </svg>
    </div>
  );
}

// ── Result row ────────────────────────────────────────────────────────────────

function VaRRow({
  method,
  varVal,
  cvarVal,
  portfolioValue,
  formula,
}: {
  method: string;
  varVal: number;
  cvarVal: number;
  portfolioValue: number;
  formula?: string;
}) {
  return (
    <div className="rounded-md border border-border/40 bg-muted/20 p-3 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold">{method}</span>
        <span className="text-xs font-mono text-destructive font-semibold">
          -{fmtDollar(Math.abs(varVal))}
        </span>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>CVaR (Expected Shortfall)</span>
        <span className="font-mono text-destructive/80">
          -{fmtDollar(Math.abs(cvarVal))}
        </span>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>% of Portfolio</span>
        <span className="font-mono">
          {portfolioValue > 0
            ? ((Math.abs(varVal) / portfolioValue) * 100).toFixed(2)
            : "—"}
          %
        </span>
      </div>
      {formula && (
        <p className="text-[10px] text-muted-foreground/70 font-mono border-t border-border/30 pt-1 mt-1">
          {formula}
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function VaRCalculator() {
  const { tradeHistory, portfolioValue } = useTradingStore((s) => ({
    tradeHistory: s.tradeHistory,
    portfolioValue: s.portfolioValue,
  }));

  const [confidence, setConfidence] = useState<Confidence>(0.95);
  const [horizon, setHorizon] = useState<Horizon>(1);

  const closed = useMemo(
    () =>
      tradeHistory
        .filter((t) => t.side === "sell" && typeof t.realizedPnL === "number")
        .slice(0, 100),
    [tradeHistory],
  );

  const result = useMemo<VaRResult>(() => {
    const empty: VaRResult = {
      historical: null,
      parametric: null,
      monteCarlo: null,
      returns: [],
      bins: [],
      varLine: 0,
    };

    if (closed.length < 5) return empty;

    // Daily returns as fraction of portfolio
    const returns = closed.map((t) => t.realizedPnL / INITIAL_CAPITAL);
    const sqrtH = Math.sqrt(horizon);

    // ── Historical simulation ──────────────────────────────────────────────
    const sorted = [...returns].sort((a, b) => a - b);
    const idx = Math.max(0, Math.floor(sorted.length * (1 - confidence)) - 1);
    const histVarReturn = sorted[idx];
    const tailReturns = sorted.slice(0, idx + 1);
    const histCVarReturn =
      tailReturns.length > 0
        ? tailReturns.reduce((s, r) => s + r, 0) / tailReturns.length
        : histVarReturn;

    const histVar = histVarReturn * portfolioValue * sqrtH;
    const histCVar = histCVarReturn * portfolioValue * sqrtH;

    // ── Parametric ────────────────────────────────────────────────────────
    const n = returns.length;
    const mu = returns.reduce((s, r) => s + r, 0) / n;
    const variance =
      returns.reduce((s, r) => s + (r - mu) ** 2, 0) / Math.max(n - 1, 1);
    const sigma = Math.sqrt(variance);
    const z = -normInv(1 - confidence); // e.g. 1.645 for 95%
    const paramVarReturn = mu - z * sigma;
    // CVaR for normal dist: mu - sigma * phi(z) / (1-c)
    const phi_z = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
    const paramCVarReturn = mu - sigma * (phi_z / (1 - confidence));

    const paramVar = paramVarReturn * portfolioValue * sqrtH;
    const paramCVar = paramCVarReturn * portfolioValue * sqrtH;

    // ── Monte Carlo ───────────────────────────────────────────────────────
    const rand = mulberry32(0xdeadbeef);
    const N = 1000;
    const mcReturns: number[] = [];
    for (let i = 0; i < N; i++) {
      const r = mu + sigma * randn(rand);
      mcReturns.push(r);
    }
    const mcSorted = [...mcReturns].sort((a, b) => a - b);
    const mcIdx = Math.max(0, Math.floor(N * (1 - confidence)) - 1);
    const mcVarReturn = mcSorted[mcIdx];
    const mcTail = mcSorted.slice(0, mcIdx + 1);
    const mcCVarReturn =
      mcTail.length > 0
        ? mcTail.reduce((s, r) => s + r, 0) / mcTail.length
        : mcVarReturn;

    const mcVar = mcVarReturn * portfolioValue * sqrtH;
    const mcCVar = mcCVarReturn * portfolioValue * sqrtH;

    // Combine historical + MC returns for histogram
    const allReturns = [...returns, ...mcReturns.slice(0, 100)];
    const bins = buildHistogram(allReturns, 26);

    return {
      historical: { var: histVar, cvar: histCVar },
      parametric: { var: paramVar, cvar: paramCVar, mu, sigma },
      monteCarlo: { var: mcVar, cvar: mcCVar },
      returns,
      bins,
      varLine: histVarReturn,
    };
  }, [closed, confidence, horizon, portfolioValue]);

  const confidenceLabels: Record<Confidence, string> = {
    0.9: "90%",
    0.95: "95%",
    0.99: "99%",
  };
  const horizonLabels: Record<Horizon, string> = {
    1: "1 Day",
    5: "5 Day",
    10: "10 Day",
  };

  const hasData = closed.length >= 5;

  return (
    <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">
          Value at Risk (VaR) Calculator
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Three-method VaR using your closed trade history.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Confidence Level
          </p>
          <div className="flex gap-1">
            {([0.9, 0.95, 0.99] as Confidence[]).map((c) => (
              <button
                key={c}
                onClick={() => setConfidence(c)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded border transition-colors",
                  confidence === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/50 text-muted-foreground hover:border-border",
                )}
              >
                {confidenceLabels[c]}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Time Horizon
          </p>
          <div className="flex gap-1">
            {([1, 5, 10] as Horizon[]).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded border transition-colors",
                  horizon === h
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/50 text-muted-foreground hover:border-border",
                )}
              >
                {horizonLabels[h]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-start gap-2 text-xs text-muted-foreground py-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          At least 5 closed trades are required to compute VaR. Make some trades
          and return here.
        </div>
      ) : (
        <>
          {/* Return distribution histogram */}
          <ReturnHistogram
            bins={result.bins}
            varReturn={result.varLine}
            label={`Return distribution — red bars fall below VaR threshold (${confidenceLabels[confidence]} confidence, ${horizonLabels[horizon]} horizon)`}
          />

          {/* VaR results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {result.historical && (
              <VaRRow
                method="Historical Simulation"
                varVal={result.historical.var}
                cvarVal={result.historical.cvar}
                portfolioValue={portfolioValue}
              />
            )}
            {result.parametric && (
              <VaRRow
                method="Parametric (Normal)"
                varVal={result.parametric.var}
                cvarVal={result.parametric.cvar}
                portfolioValue={portfolioValue}
                formula={`VaR = \u03bc \u2212 z\u03c3  (\u03bc=${(result.parametric.mu * 100).toFixed(2)}%, \u03c3=${(result.parametric.sigma * 100).toFixed(2)}%)`}
              />
            )}
            {result.monteCarlo && (
              <VaRRow
                method="Monte Carlo (1,000 sims)"
                varVal={result.monteCarlo.var}
                cvarVal={result.monteCarlo.cvar}
                portfolioValue={portfolioValue}
              />
            )}
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            CVaR (Conditional VaR / Expected Shortfall) is the average loss in
            the worst {(100 - confidence * 100).toFixed(0)}% of scenarios
            — a more conservative measure than VaR alone. The square-root-of-time
            rule scales single-day estimates to the {horizon}-day horizon.
          </p>
        </>
      )}
    </div>
  );
}
