"use client";

import { useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface SpreadData {
  label: string;
  shortLabel: string;
  current: number;        // bps
  historicalAvg: number;  // bps
  rangeMin: number;       // bps (stress low = tight)
  rangeMax: number;       // bps (stress high = wide)
  history: number[];      // 12 weekly readings, bps
  description: string;
}

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Data Generation ────────────────────────────────────────────────────────────

function generateCreditData(): { ig: SpreadData; hy: SpreadData; riskSignal: "risk-on" | "risk-off" | "neutral" } {
  const daySeed = Math.floor(Date.now() / 86400000);
  const rand = mulberry32(daySeed + 7919); // different offset from YieldCurve

  // Investment Grade: 80-200 bps
  const igCurrent = 80 + Math.floor(rand() * 121);
  const igHistAvg = 120;
  const igRangeMin = 60;
  const igRangeMax = 280;

  // High Yield: 300-600 bps
  const hyCurrent = 300 + Math.floor(rand() * 301);
  const hyHistAvg = 400;
  const hyRangeMin = 250;
  const hyRangeMax = 900;

  // 12-week history using random walk from current
  function buildHistory(current: number, volatility: number): number[] {
    const weeks = 12;
    const history: number[] = new Array(weeks);
    history[weeks - 1] = current;
    for (let i = weeks - 2; i >= 0; i--) {
      const delta = (rand() - 0.5) * volatility * 2;
      history[i] = Math.max(50, history[i + 1] + delta);
    }
    return history;
  }

  const igHistory = buildHistory(igCurrent, 8);
  const hyHistory = buildHistory(hyCurrent, 25);

  // Risk signal: both tight → risk-on, both wide → risk-off, else neutral
  const igTight = igCurrent < igHistAvg * 0.9;
  const hyTight = hyCurrent < hyHistAvg * 0.9;
  const igWide = igCurrent > igHistAvg * 1.15;
  const hyWide = hyCurrent > hyHistAvg * 1.15;

  let riskSignal: "risk-on" | "risk-off" | "neutral";
  if (igTight && hyTight) {
    riskSignal = "risk-on";
  } else if (igWide && hyWide) {
    riskSignal = "risk-off";
  } else {
    riskSignal = "neutral";
  }

  const ig: SpreadData = {
    label: "Investment Grade (IG)",
    shortLabel: "IG",
    current: igCurrent,
    historicalAvg: igHistAvg,
    rangeMin: igRangeMin,
    rangeMax: igRangeMax,
    history: igHistory,
    description: "BBB-rated corporate bonds vs Treasuries. Tight spreads indicate strong corporate credit health.",
  };

  const hy: SpreadData = {
    label: "High Yield (HY)",
    shortLabel: "HY",
    current: hyCurrent,
    historicalAvg: hyHistAvg,
    rangeMin: hyRangeMin,
    rangeMax: hyRangeMax,
    history: hyHistory,
    description: "Sub-investment grade ('junk') bonds vs Treasuries. Leading indicator for credit stress and default risk.",
  };

  return { ig, hy, riskSignal };
}

// ── Sparkline ──────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;

  const W = 100;
  const H = 32;
  const pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (W - pad * 2);
      const y = H - pad - ((v - min) / range) * (H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="shrink-0"
      aria-hidden="true"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Spread Gauge ───────────────────────────────────────────────────────────────

function SpreadGauge({ data }: { data: SpreadData }) {
  const { current, historicalAvg, rangeMin, rangeMax, history, label, description } = data;

  // Position of current spread along the range bar (0-100%)
  const totalRange = rangeMax - rangeMin;
  const currentPct = Math.min(100, Math.max(0, ((current - rangeMin) / totalRange) * 100));
  const avgPct = Math.min(100, Math.max(0, ((historicalAvg - rangeMin) / totalRange) * 100));

  const vsAvg = current - historicalAvg;
  const vsAvgPct = ((vsAvg / historicalAvg) * 100).toFixed(1);
  const isTight = vsAvg < 0;
  const isNeutral = Math.abs(vsAvg) < historicalAvg * 0.05;

  let vsLabel: string;
  let vsColorClass: string;
  let sparkColor: string;

  if (isNeutral) {
    vsLabel = "In line with history";
    vsColorClass = "text-yellow-500";
    sparkColor = "#eab308";
  } else if (isTight) {
    vsLabel = "Tight vs history";
    vsColorClass = "text-green-500";
    sparkColor = "#22c55e";
  } else {
    vsLabel = "Wide vs history";
    vsColorClass = "text-red-500";
    sparkColor = "#ef4444";
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card p-3 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold">{label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono tabular-nums text-base font-semibold">{current} bps</p>
          <p className={`text-[10px] font-medium ${vsColorClass}`}>{vsLabel}</p>
        </div>
      </div>

      {/* Range bar */}
      <div className="space-y-1">
        <div className="relative h-3 rounded-full bg-muted overflow-visible">
          {/* Color gradient fill from rangeMin to current */}
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${currentPct}%`,
              background: isTight
                ? "linear-gradient(to right, rgba(34,197,94,0.3), rgba(34,197,94,0.6))"
                : isNeutral
                  ? "linear-gradient(to right, rgba(234,179,8,0.3), rgba(234,179,8,0.6))"
                  : "linear-gradient(to right, rgba(239,68,68,0.3), rgba(239,68,68,0.6))",
            }}
          />
          {/* Historical average marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground/40"
            style={{ left: `${avgPct}%` }}
            title={`Historical avg: ${historicalAvg} bps`}
          />
          {/* Current value marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-background shadow"
            style={{
              left: `calc(${currentPct}% - 5px)`,
              background: isTight ? "#22c55e" : isNeutral ? "#eab308" : "#ef4444",
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground font-mono tabular-nums">
          <span>{rangeMin} bps (tight)</span>
          <span className="text-foreground/50">avg {historicalAvg}</span>
          <span>{rangeMax} bps (stress)</span>
        </div>
      </div>

      {/* vs average chip + sparkline */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
              isTight
                ? "bg-green-500/10 text-green-500"
                : isNeutral
                  ? "bg-yellow-500/10 text-yellow-500"
                  : "bg-red-500/10 text-red-500"
            }`}
          >
            {vsAvg > 0 ? "+" : ""}{vsAvg} bps ({vsAvg > 0 ? "+" : ""}{vsAvgPct}%)
          </span>
          <span className="text-[9px] text-muted-foreground">vs 5yr avg</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <Sparkline data={history} color={sparkColor} />
          <span className="text-[9px] text-muted-foreground">12-week history</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function CreditSpreads() {
  const { ig, hy, riskSignal } = useMemo(generateCreditData, []);

  const signalConfig = {
    "risk-on": {
      label: "Risk-On",
      sub: "Tight spreads signal strong credit appetite",
      badgeClass: "bg-green-500/10 text-green-500",
      borderClass: "border-green-500/20 bg-green-500/5",
      textClass: "text-green-400",
    },
    "risk-off": {
      label: "Risk-Off",
      sub: "Wide spreads signal credit stress and risk aversion",
      badgeClass: "bg-red-500/10 text-red-500",
      borderClass: "border-red-500/20 bg-red-500/5",
      textClass: "text-red-400",
    },
    neutral: {
      label: "Neutral",
      sub: "Mixed signals — monitor IG/HY divergence",
      badgeClass: "bg-yellow-500/10 text-yellow-500",
      borderClass: "border-yellow-500/20 bg-yellow-500/5",
      textClass: "text-yellow-400",
    },
  }[riskSignal];

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 hover:border-border/60 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Credit Spreads</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Corporate bond spreads vs US Treasuries
          </p>
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${signalConfig.badgeClass}`}>
          {signalConfig.label}
        </span>
      </div>

      {/* IG and HY gauges */}
      <div className="space-y-3">
        <SpreadGauge data={ig} />
        <SpreadGauge data={hy} />
      </div>

      {/* Signal interpretation */}
      <div className={`rounded border px-3 py-2 text-[11px] leading-relaxed ${signalConfig.borderClass} ${signalConfig.textClass}`}>
        <span className="font-semibold">{signalConfig.label.toUpperCase()}:</span>{" "}
        {signalConfig.sub}.{" "}
        {riskSignal === "risk-on" && (
          <>
            Low credit risk premiums suggest investors are comfortable taking on corporate
            debt. Favorable environment for equities and cyclical assets.
          </>
        )}
        {riskSignal === "risk-off" && (
          <>
            Elevated credit risk premiums indicate investors demand higher compensation
            for default risk. Typically correlates with equity drawdowns and flight to safety.
          </>
        )}
        {riskSignal === "neutral" && (
          <>
            IG and HY spreads are sending mixed signals. Watch for convergence — a rising
            HY/IG ratio often precedes broader credit deterioration.
          </>
        )}
      </div>

      {/* HY/IG ratio */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-2">
        <span>HY / IG ratio</span>
        <span className="font-mono tabular-nums font-medium text-foreground">
          {(hy.current / ig.current).toFixed(2)}x
          <span className="text-muted-foreground font-normal ml-1">
            (hist avg {(hy.historicalAvg / ig.historicalAvg).toFixed(2)}x)
          </span>
        </span>
      </div>
    </div>
  );
}
