"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface Lever {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  base: number;
  formatValue: (v: number) => string;
}

interface AssetImpact {
  asset: string;
  impact: number; // % impact
  direction: "positive" | "negative" | "neutral";
}

interface Preset {
  id: string;
  label: string;
  description: string;
  values: Record<string, number>;
}

/* ------------------------------------------------------------------ */
/*  Lever definitions                                                   */
/* ------------------------------------------------------------------ */

const LEVERS: Lever[] = [
  {
    id: "fedRate",
    label: "Fed Rate Change",
    unit: "%",
    min: -2,
    max: 3,
    step: 0.25,
    base: 0,
    formatValue: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`,
  },
  {
    id: "inflation",
    label: "Inflation (CPI)",
    unit: "%",
    min: 0,
    max: 12,
    step: 0.1,
    base: 3.2,
    formatValue: (v) => `${v.toFixed(1)}%`,
  },
  {
    id: "gdpGrowth",
    label: "GDP Growth",
    unit: "%",
    min: -5,
    max: 5,
    step: 0.1,
    base: 2.1,
    formatValue: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
  },
  {
    id: "vix",
    label: "VIX",
    unit: "",
    min: 10,
    max: 80,
    step: 1,
    base: 18,
    formatValue: (v) => v.toFixed(0),
  },
  {
    id: "creditSpreads",
    label: "Credit Spreads",
    unit: "bp",
    min: 0,
    max: 500,
    step: 5,
    base: 110,
    formatValue: (v) => `${v.toFixed(0)}bp`,
  },
  {
    id: "dollarIndex",
    label: "Dollar Index Change",
    unit: "%",
    min: -20,
    max: 20,
    step: 0.5,
    base: 0,
    formatValue: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
  },
];

/* ------------------------------------------------------------------ */
/*  Preset scenarios                                                    */
/* ------------------------------------------------------------------ */

const PRESETS: Preset[] = [
  {
    id: "2022-rate-hike",
    label: "2022 Rate Hike Cycle",
    description: "Aggressive Fed tightening — 425bps in 12 months",
    values: {
      fedRate: 2.5,
      inflation: 8.5,
      gdpGrowth: 1.0,
      vix: 34,
      creditSpreads: 220,
      dollarIndex: 14,
    },
  },
  {
    id: "2020-covid",
    label: "2020 COVID Crash",
    description: "Pandemic shock — circuit breakers, VIX 82",
    values: {
      fedRate: -1.5,
      inflation: 1.2,
      gdpGrowth: -4.5,
      vix: 72,
      creditSpreads: 450,
      dollarIndex: 3,
    },
  },
  {
    id: "2008-gfc",
    label: "2008 GFC",
    description: "Global financial crisis — credit freeze, housing collapse",
    values: {
      fedRate: -2.0,
      inflation: 4.0,
      gdpGrowth: -3.8,
      vix: 68,
      creditSpreads: 490,
      dollarIndex: 8,
    },
  },
  {
    id: "goldilocks",
    label: "Goldilocks",
    description: "Strong growth, moderate inflation, low vol",
    values: {
      fedRate: -0.5,
      inflation: 2.0,
      gdpGrowth: 3.5,
      vix: 12,
      creditSpreads: 80,
      dollarIndex: -3,
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Base case values                                                    */
/* ------------------------------------------------------------------ */

const BASE_CASE: Record<string, number> = Object.fromEntries(
  LEVERS.map((l) => [l.id, l.base]),
);

/* ------------------------------------------------------------------ */
/*  Impact calculation engine                                           */
/* ------------------------------------------------------------------ */

/**
 * Compute asset-class % impact given lever deltas from base case.
 * Coefficients are simplified macro sensitivities (not financial advice).
 */
function computeImpacts(values: Record<string, number>): AssetImpact[] {
  const fedDelta = values.fedRate - BASE_CASE.fedRate; // rate change delta
  const inflDelta = values.inflation - BASE_CASE.inflation;
  const gdpDelta = values.gdpGrowth - BASE_CASE.gdpGrowth;
  const vixDelta = values.vix - BASE_CASE.vix;
  const csDelta = values.creditSpreads - BASE_CASE.creditSpreads;
  const dxyDelta = values.dollarIndex - BASE_CASE.dollarIndex;

  // Each asset: linear combination of factor sensitivities
  const raw: { asset: string; impact: number }[] = [
    {
      asset: "Equities",
      impact:
        -5.0 * fedDelta +
        -0.8 * inflDelta +
        2.2 * gdpDelta +
        -0.4 * vixDelta +
        -0.04 * csDelta +
        -0.15 * dxyDelta,
    },
    {
      asset: "Bonds",
      impact:
        -8.0 * fedDelta +
        -3.0 * inflDelta +
        -0.5 * gdpDelta +
        0.1 * vixDelta +
        -0.02 * csDelta +
        -0.05 * dxyDelta,
    },
    {
      asset: "Gold",
      impact:
        3.5 * fedDelta * -1 + // inverse of rate hikes
        3.0 * inflDelta +
        -0.4 * gdpDelta +
        0.3 * vixDelta +
        0.01 * csDelta +
        -0.6 * dxyDelta,
    },
    {
      asset: "Crypto",
      impact:
        -3.0 * fedDelta +
        0.5 * inflDelta +
        1.5 * gdpDelta +
        -0.8 * vixDelta +
        -0.02 * csDelta +
        -0.2 * dxyDelta,
    },
    {
      asset: "Real Estate",
      impact:
        -6.0 * fedDelta +
        1.0 * inflDelta +
        1.8 * gdpDelta +
        -0.2 * vixDelta +
        -0.03 * csDelta +
        -0.1 * dxyDelta,
    },
    {
      asset: "Commodities",
      impact:
        -1.0 * fedDelta +
        2.5 * inflDelta +
        1.2 * gdpDelta +
        -0.15 * vixDelta +
        0.0 * csDelta +
        -1.2 * dxyDelta,
    },
  ];

  return raw.map(({ asset, impact }) => ({
    asset,
    impact: Math.max(-60, Math.min(60, +impact.toFixed(1))),
    direction:
      impact > 0.5
        ? "positive"
        : impact < -0.5
        ? "negative"
        : "neutral",
  }));
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function LeverSlider({
  lever,
  value,
  onChange,
}: {
  lever: Lever;
  value: number;
  onChange: (id: string, v: number) => void;
}) {
  const pct =
    ((value - lever.min) / (lever.max - lever.min)) * 100;
  const basePct =
    ((lever.base - lever.min) / (lever.max - lever.min)) * 100;
  const isDelta = value !== lever.base;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium">{lever.label}</span>
        <span
          className={cn(
            "font-mono text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded",
            isDelta
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground",
          )}
        >
          {lever.formatValue(value)}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* Track */}
        <div className="relative w-full h-1 rounded-full bg-muted">
          {/* Fill from min to current */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary/40"
            style={{ width: `${pct}%` }}
          />
          {/* Base case tick */}
          <div
            className="absolute top-[-3px] w-0.5 h-[10px] bg-muted-foreground/50"
            style={{ left: `${basePct}%` }}
          />
        </div>
        <input
          type="range"
          min={lever.min}
          max={lever.max}
          step={lever.step}
          value={value}
          onChange={(e) => onChange(lever.id, parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          aria-label={lever.label}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>{lever.formatValue(lever.min)}</span>
        <span className="text-muted-foreground/50">
          base: {lever.formatValue(lever.base)}
        </span>
        <span>{lever.formatValue(lever.max)}</span>
      </div>
    </div>
  );
}

function ImpactBar({ item }: { item: AssetImpact }) {
  const absImpact = Math.abs(item.impact);
  // Max bar width maps to 60% impact
  const barPct = Math.min(100, (absImpact / 60) * 100);
  const isPositive = item.direction === "positive";
  const isNegative = item.direction === "negative";

  return (
    <div className="flex items-center gap-2">
      {/* Asset label */}
      <span className="text-[11px] font-medium w-24 shrink-0 text-right">
        {item.asset}
      </span>

      {/* Centered bar chart — negative extends left, positive right */}
      <div className="flex-1 relative h-5 flex items-center">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />

        {isNegative && (
          <div
            className="absolute right-1/2 h-4 rounded-l bg-red-500/70"
            style={{ width: `${barPct / 2}%` }}
          />
        )}
        {isPositive && (
          <div
            className="absolute left-1/2 h-4 rounded-r bg-green-500/70"
            style={{ width: `${barPct / 2}%` }}
          />
        )}
        {!isPositive && !isNegative && (
          <div className="absolute left-1/2 -translate-x-1/2 h-2 w-1 bg-muted-foreground/30 rounded" />
        )}
      </div>

      {/* Value */}
      <span
        className={cn(
          "font-mono text-[11px] font-semibold tabular-nums w-14 shrink-0",
          isPositive
            ? "text-green-500"
            : isNegative
            ? "text-red-500"
            : "text-muted-foreground",
        )}
      >
        {item.impact >= 0 ? "+" : ""}
        {item.impact.toFixed(1)}%
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function ScenarioSimulator() {
  const [values, setValues] = useState<Record<string, number>>(
    () => ({ ...BASE_CASE }),
  );
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handleLeverChange = useCallback((id: string, v: number) => {
    setValues((prev) => ({ ...prev, [id]: v }));
    setActivePreset(null);
  }, []);

  const handlePreset = useCallback((preset: Preset) => {
    setValues({ ...preset.values });
    setActivePreset(preset.id);
  }, []);

  const handleReset = useCallback(() => {
    setValues({ ...BASE_CASE });
    setActivePreset(null);
  }, []);

  const impacts = useMemo(() => computeImpacts(values), [values]);

  const hasChanges = LEVERS.some((l) => values[l.id] !== l.base);

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Macro Scenario Simulator</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Adjust macro levers to stress-test asset class impacts
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleReset}
            className="text-[10px] font-medium px-2.5 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            Reset to base case
          </button>
        )}
      </div>

      {/* Preset buttons */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Preset Scenarios
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePreset(preset)}
              className={cn(
                "text-left rounded-lg border px-2.5 py-2 text-[10px] transition-colors",
                activePreset === preset.id
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40",
              )}
            >
              <p className="font-semibold leading-tight">{preset.label}</p>
              <p className="mt-0.5 leading-tight opacity-70 line-clamp-2">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout: levers | impact chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Levers */}
        <div className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Macro Levers
          </p>
          {LEVERS.map((lever) => (
            <LeverSlider
              key={lever.id}
              lever={lever}
              value={values[lever.id]}
              onChange={handleLeverChange}
            />
          ))}
        </div>

        {/* Impact chart */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Asset Class Impact
          </p>

          {/* Chart header */}
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <span className="w-24 text-right shrink-0" />
            <div className="flex-1 flex justify-between px-1">
              <span>-60%</span>
              <span>0%</span>
              <span>+60%</span>
            </div>
            <span className="w-14 shrink-0" />
          </div>

          {/* SVG impact bars */}
          <div className="space-y-1.5">
            {impacts.map((item) => (
              <ImpactBar key={item.asset} item={item} />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[9px] text-muted-foreground pt-1 border-t border-border/40">
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 rounded-sm bg-green-500/70 inline-block" />
              Positive impact
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 rounded-sm bg-red-500/70 inline-block" />
              Negative impact
            </span>
            <span className="ml-auto">vs. base case</span>
          </div>

          {/* Summary table */}
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <div className="grid grid-cols-3 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30 px-3 py-1.5">
              <span>Asset</span>
              <span className="text-center">Direction</span>
              <span className="text-right">Impact</span>
            </div>
            {impacts.map((item) => (
              <div
                key={item.asset}
                className="grid grid-cols-3 items-center px-3 py-1.5 border-t border-border/30 text-[10px]"
              >
                <span className="font-medium">{item.asset}</span>
                <span
                  className={cn(
                    "text-center text-[9px] font-medium px-1.5 py-0.5 rounded-full border mx-auto",
                    item.direction === "positive"
                      ? "bg-green-500/10 border-green-500/20 text-green-500"
                      : item.direction === "negative"
                      ? "bg-red-500/10 border-red-500/20 text-red-500"
                      : "bg-muted border-border text-muted-foreground",
                  )}
                >
                  {item.direction === "positive"
                    ? "Bullish"
                    : item.direction === "negative"
                    ? "Bearish"
                    : "Neutral"}
                </span>
                <span
                  className={cn(
                    "text-right font-mono tabular-nums font-semibold",
                    item.direction === "positive"
                      ? "text-green-500"
                      : item.direction === "negative"
                      ? "text-red-500"
                      : "text-muted-foreground",
                  )}
                >
                  {item.impact >= 0 ? "+" : ""}
                  {item.impact.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
