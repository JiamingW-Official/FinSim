"use client";

import { useState, useMemo } from "react";
import { Calculator, DollarSign, Clock, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatUSD(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

const PRESET_YEARS = [1, 3, 5, 10] as const;
type YearPreset = (typeof PRESET_YEARS)[number];

// ── Sub-components ────────────────────────────────────────────────────────────

function InputSlider({
  label,
  icon,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="ml-auto text-xs font-bold tabular-nums font-mono text-foreground">
          {display}
        </span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 mt-0.5 accent-primary cursor-pointer"
      />
      <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
        <span>
          {label === "Annual Rate"
            ? `${min}%`
            : label === "Duration"
              ? `${min}yr`
              : `$${min.toLocaleString()}`}
        </span>
        <span>
          {label === "Annual Rate"
            ? `${max}%`
            : label === "Duration"
              ? `${max}yr`
              : `$${(max / 1000).toFixed(0)}K`}
        </span>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function YieldCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState<number>(5);
  const [preset, setPreset] = useState<YearPreset>(5);

  const handlePreset = (y: YearPreset) => {
    setPreset(y);
    setYears(y);
  };

  const result = useMemo(() => {
    // Compounded (annual compounding)
    const compounded = principal * Math.pow(1 + rate / 100, years);
    const compoundedInterest = compounded - principal;

    // Simple interest (no compounding)
    const simple = principal + principal * (rate / 100) * years;
    const simpleInterest = simple - principal;

    // Year-by-year data
    const yearlyData: { year: number; simple: number; compounded: number }[] = [];
    for (let y = 0; y <= years; y++) {
      yearlyData.push({
        year: y,
        simple: principal + principal * (rate / 100) * y,
        compounded: principal * Math.pow(1 + rate / 100, y),
      });
    }

    const compoundingBonus = compoundedInterest - simpleInterest;
    const compoundingBonusPct =
      simpleInterest > 0 ? (compoundingBonus / simpleInterest) * 100 : 0;

    return {
      compounded,
      compoundedInterest,
      simple,
      simpleInterest,
      compoundingBonus,
      compoundingBonusPct,
      yearlyData,
    };
  }, [principal, rate, years]);

  // SVG chart
  const chartW = 480;
  const chartH = 140;
  const maxVal = result.compounded * 1.05;

  const toX = (y: number) => (y / years) * chartW;
  const toY = (v: number) => chartH - (v / maxVal) * chartH;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Yield Calculator</h2>
      </div>
      <p className="text-[10px] text-muted-foreground -mt-2">
        Project returns on tokenized asset investments with and without compounding.
      </p>

      {/* Duration presets */}
      <div className="flex gap-1.5">
        {PRESET_YEARS.map((y) => (
          <button
            key={y}
            onClick={() => handlePreset(y)}
            className={cn(
              "flex-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              preset === y
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {y}yr
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <InputSlider
          label="Principal"
          icon={<DollarSign className="h-3 w-3 text-blue-400" />}
          value={principal}
          min={1000}
          max={500000}
          step={1000}
          display={`$${(principal / 1000).toFixed(0)}K`}
          onChange={setPrincipal}
        />
        <InputSlider
          label="Annual Rate"
          icon={<Percent className="h-3 w-3 text-green-400" />}
          value={rate}
          min={1}
          max={15}
          step={0.5}
          display={`${rate}%`}
          onChange={setRate}
        />
        <InputSlider
          label="Duration"
          icon={<Clock className="h-3 w-3 text-amber-400" />}
          value={years}
          min={1}
          max={10}
          step={1}
          display={`${years}yr`}
          onChange={(v) => {
            setYears(v);
            if (PRESET_YEARS.includes(v as YearPreset)) {
              setPreset(v as YearPreset);
            }
          }}
        />
      </div>

      {/* Result chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-md bg-muted/30 p-2.5 text-center">
          <p className="text-[9px] text-muted-foreground mb-0.5">Compounded</p>
          <p className="text-xs font-black tabular-nums font-mono text-green-400">
            {formatUSD(result.compounded)}
          </p>
        </div>
        <div className="rounded-md bg-muted/30 p-2.5 text-center">
          <p className="text-[9px] text-muted-foreground mb-0.5">Simple</p>
          <p className="text-xs font-black tabular-nums font-mono text-blue-400">
            {formatUSD(result.simple)}
          </p>
        </div>
        <div className="rounded-md bg-muted/30 p-2.5 text-center">
          <p className="text-[9px] text-muted-foreground mb-0.5">Interest Earned</p>
          <p className="text-xs font-black tabular-nums font-mono text-foreground">
            {formatUSD(result.compoundedInterest)}
          </p>
        </div>
        <div className="rounded-md bg-muted/30 p-2.5 text-center">
          <p className="text-[9px] text-muted-foreground mb-0.5">Compounding Bonus</p>
          <p className="text-xs font-black tabular-nums font-mono text-amber-400">
            +{formatUSD(result.compoundingBonus)}
          </p>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="rounded-lg border border-border/50 bg-card/30 p-3">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full h-36"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 35, 70, 105, 140].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2={chartW}
              y2={y}
              stroke="rgba(255,255,255,0.04)"
            />
          ))}

          {/* Simple area (blue) */}
          <path
            d={`M 0,${toY(principal)} ${result.yearlyData
              .map((d) => `L ${toX(d.year)},${toY(d.simple)}`)
              .join(" ")} L ${chartW},${chartH} L 0,${chartH} Z`}
            fill="rgba(59,130,246,0.12)"
          />

          {/* Compound area (green) */}
          <path
            d={`M 0,${toY(principal)} ${result.yearlyData
              .map((d) => `L ${toX(d.year)},${toY(d.compounded)}`)
              .join(" ")} L ${chartW},${chartH} L 0,${chartH} Z`}
            fill="rgba(34,197,94,0.10)"
          />

          {/* Simple line */}
          <path
            d={result.yearlyData
              .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.year)},${toY(d.simple)}`)
              .join(" ")}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="5,3"
          />

          {/* Compounded line */}
          <path
            d={result.yearlyData
              .map(
                (d, i) => `${i === 0 ? "M" : "L"} ${toX(d.year)},${toY(d.compounded)}`,
              )
              .join(" ")}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
          />

          {/* Principal reference line */}
          <line
            x1="0"
            y1={toY(principal)}
            x2={chartW}
            y2={toY(principal)}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            strokeDasharray="2,4"
          />
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 bg-green-400 rounded" />
            <span className="text-[9px] text-muted-foreground">Compounded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-0.5 w-4 bg-blue-400 rounded"
              style={{ borderBottom: "1px dashed" }}
            />
            <span className="text-[9px] text-muted-foreground">Simple Interest</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 rounded bg-white/20" style={{ borderBottom: "1px dashed" }} />
            <span className="text-[9px] text-muted-foreground">Principal</span>
          </div>
        </div>
      </div>

      {/* Insight callout */}
      <div className="rounded-lg border border-primary/15 bg-primary/5 p-3">
        <p className="text-[10px] text-foreground/70 leading-relaxed">
          <span className="font-bold text-primary">
            Compounding adds {formatUSD(result.compoundingBonus)} (
            {result.compoundingBonusPct.toFixed(0)}% more)
          </span>{" "}
          vs simple interest over {years} year{years !== 1 ? "s" : ""}.{" "}
          Reinvesting yield distributions is key to maximizing RWA returns — many
          tokenized platforms auto-compound on-chain.
        </p>
      </div>
    </div>
  );
}
