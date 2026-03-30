"use client";

import { useState, useMemo } from "react";
import { cn, formatCurrency } from "@/lib/utils";

const CHART_W = 600;
const CHART_H = 250;
const PAD_LEFT = 72;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;
const INNER_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const INNER_H = CHART_H - PAD_TOP - PAD_BOTTOM;

function computeLine(
  initialCapital: number,
  annualReturn: number,
  years: number
): { year: number; value: number }[] {
  const pts: { year: number; value: number }[] = [];
  for (let y = 0; y <= years; y++) {
    pts.push({
      year: y,
      value: Math.round(initialCapital * Math.pow(1 + annualReturn / 100, y)),
    });
  }
  return pts;
}

function buildPath(
  pts: { year: number; value: number }[],
  years: number,
  minVal: number,
  maxVal: number
): string {
  const range = maxVal - minVal || 1;
  return pts
    .map((p, i) => {
      const x = PAD_LEFT + (p.year / years) * INNER_W;
      const y = PAD_TOP + INNER_H - ((p.value - minVal) / range) * INNER_H;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const formatK = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
};

export function ScenarioSimulator() {
  const [baseAnnualReturn, setBaseAnnualReturn] = useState(8);
  const [bullReturn, setBullReturn] = useState(15);
  const [bearReturn, setBearReturn] = useState(2);
  const [initialCapital, setInitialCapital] = useState(50000);
  const [years, setYears] = useState(30);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const bullData = useMemo(() => computeLine(initialCapital, bullReturn, years), [initialCapital, bullReturn, years]);
  const baseData = useMemo(() => computeLine(initialCapital, baseAnnualReturn, years), [initialCapital, baseAnnualReturn, years]);
  const bearData = useMemo(() => computeLine(initialCapital, bearReturn, years), [initialCapital, bearReturn, years]);

  const finalBull = bullData[bullData.length - 1].value;
  const finalBase = baseData[baseData.length - 1].value;
  const finalBear = bearData[bearData.length - 1].value;
  const weightedOutcome = Math.round(0.2 * finalBull + 0.6 * finalBase + 0.2 * finalBear);

  const allValues = [...bullData, ...baseData, ...bearData].map((p) => p.value);
  const minVal = Math.min(...allValues) * 0.97;
  const maxVal = Math.max(...allValues) * 1.03;

  const bullPath = buildPath(bullData, years, minVal, maxVal);
  const basePath = buildPath(baseData, years, minVal, maxVal);
  const bearPath = buildPath(bearData, years, minVal, maxVal);

  // Y-axis labels
  const ySteps = 5;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    const frac = i / ySteps;
    return {
      value: minVal + frac * (maxVal - minVal),
      y: PAD_TOP + INNER_H - frac * INNER_H,
    };
  });

  // X-axis labels every 5 years
  const xLabels = Array.from({ length: Math.floor(years / 5) + 1 }, (_, i) => ({
    year: i * 5,
    x: PAD_LEFT + ((i * 5) / years) * INNER_W,
  }));

  // Hover crosshair
  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * CHART_W;
    const relX = svgX - PAD_LEFT;
    const yr = Math.min(years, Math.max(0, Math.round((relX / INNER_W) * years)));
    setHoveredYear(yr);
  }

  function handleMouseLeave() {
    setHoveredYear(null);
  }

  const hovBull = hoveredYear !== null ? bullData[hoveredYear]?.value ?? null : null;
  const hovBase = hoveredYear !== null ? baseData[hoveredYear]?.value ?? null : null;
  const hovBear = hoveredYear !== null ? bearData[hoveredYear]?.value ?? null : null;
  const hovX = hoveredYear !== null ? PAD_LEFT + (hoveredYear / years) * INNER_W : null;

  function dotY(val: number) {
    return PAD_TOP + INNER_H - ((val - minVal) / (maxVal - minVal)) * INNER_H;
  }

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <SliderField
          label="Initial Capital"
          prefix="$"
          value={initialCapital}
          onChange={setInitialCapital}
          min={1000}
          max={500000}
          step={1000}
          format={(v) => formatK(v)}
        />
        <SliderField
          label="Base Return"
          suffix="%"
          value={baseAnnualReturn}
          onChange={setBaseAnnualReturn}
          min={0}
          max={25}
          step={0.5}
          isFloat
          format={(v) => `${v}%`}
          color="text-[#2d9cdb]"
        />
        <SliderField
          label="Bull Return"
          suffix="%"
          value={bullReturn}
          onChange={setBullReturn}
          min={0}
          max={40}
          step={0.5}
          isFloat
          format={(v) => `${v}%`}
          color="text-emerald-400"
        />
        <SliderField
          label="Bear Return"
          suffix="%"
          value={bearReturn}
          onChange={setBearReturn}
          min={-10}
          max={15}
          step={0.5}
          isFloat
          format={(v) => `${v}%`}
          color="text-red-400"
        />
        <SliderField
          label="Years"
          value={years}
          onChange={setYears}
          min={5}
          max={50}
          step={1}
          format={(v) => `${v} yrs`}
        />
      </div>

      {/* SVG Line Chart */}
      <div className="rounded-lg border bg-muted/20 overflow-hidden relative">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full"
          style={{ height: 250 }}
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid */}
          {yLabels.map((l, i) => (
            <line
              key={i}
              x1={PAD_LEFT}
              y1={l.y}
              x2={CHART_W - PAD_RIGHT}
              y2={l.y}
              stroke="rgba(128,128,128,0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {yLabels.map((l, i) => (
            <text
              key={i}
              x={PAD_LEFT - 6}
              y={l.y + 4}
              textAnchor="end"
              fontSize="9"
              fill="currentColor"
              opacity={0.55}
            >
              {formatK(l.value)}
            </text>
          ))}

          {/* Bear line (red dashed) */}
          <path
            d={bearPath}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="6 3"
            opacity={0.85}
          />

          {/* Base line (blue solid) */}
          <path
            d={basePath}
            fill="none"
            stroke="#2d9cdb"
            strokeWidth="2.5"
            opacity={0.9}
          />

          {/* Bull line (green dashed) */}
          <path
            d={bullPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="6 3"
            opacity={0.85}
          />

          {/* Crosshair */}
          {hovX !== null && (
            <line
              x1={hovX}
              y1={PAD_TOP}
              x2={hovX}
              y2={PAD_TOP + INNER_H}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
          )}

          {/* Hover dots */}
          {hovX !== null && hovBull !== null && (
            <circle cx={hovX} cy={dotY(hovBull)} r="4" fill="#10b981" />
          )}
          {hovX !== null && hovBase !== null && (
            <circle cx={hovX} cy={dotY(hovBase)} r="4" fill="#2d9cdb" />
          )}
          {hovX !== null && hovBear !== null && (
            <circle cx={hovX} cy={dotY(hovBear)} r="4" fill="#ef4444" />
          )}

          {/* X-axis labels */}
          {xLabels.map((l) => (
            <text
              key={l.year}
              x={l.x}
              y={PAD_TOP + INNER_H + 20}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity={0.5}
            >
              Y{l.year}
            </text>
          ))}
        </svg>

        {/* Hover tooltip */}
        {hoveredYear !== null && hovBull !== null && hovBase !== null && hovBear !== null && (
          <div
            className="pointer-events-none absolute z-10 top-3 rounded-md border bg-popover/95 p-2.5 text-xs shadow-lg backdrop-blur-sm"
            style={{
              left: hoveredYear / years > 0.6 ? undefined : `calc(${(hovX! / CHART_W) * 100}% + 12px)`,
              right: hoveredYear / years > 0.6 ? `calc(${100 - (hovX! / CHART_W) * 100}% + 12px)` : undefined,
            }}
          >
            <div className="font-semibold text-foreground mb-1.5">Year {hoveredYear}</div>
            <div className="space-y-0.5">
              <div className="flex justify-between gap-4">
                <span className="text-emerald-400">Bull ({bullReturn}%)</span>
                <span className="tabular-nums">{formatCurrency(hovBull)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#2d9cdb]">Base ({baseAnnualReturn}%)</span>
                <span className="tabular-nums">{formatCurrency(hovBase)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-red-400">Bear ({bearReturn}%)</span>
                <span className="tabular-nums">{formatCurrency(hovBear)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-5 px-4 pb-3">
          <LegendItem color="#10b981" dashed label={`Bull (${bullReturn}%)`} />
          <LegendItem color="#2d9cdb" label={`Base (${baseAnnualReturn}%)`} />
          <LegendItem color="#ef4444" dashed label={`Bear (${bearReturn}%)`} />
        </div>
      </div>

      {/* Outcome cards */}
      <div className="grid grid-cols-3 gap-3">
        <OutcomeCard
          label="Bull Scenario"
          returnPct={bullReturn}
          finalValue={finalBull}
          initialCapital={initialCapital}
          colorClass="text-emerald-400"
          borderClass="border-emerald-500/25"
        />
        <OutcomeCard
          label="Base Scenario"
          returnPct={baseAnnualReturn}
          finalValue={finalBase}
          initialCapital={initialCapital}
          colorClass="text-[#2d9cdb]"
          borderClass="border-[#2d9cdb]/25"
        />
        <OutcomeCard
          label="Bear Scenario"
          returnPct={bearReturn}
          finalValue={finalBear}
          initialCapital={initialCapital}
          colorClass="text-red-400"
          borderClass="border-red-500/25"
        />
      </div>

      {/* Probability-weighted outcome */}
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-foreground">Probability-Weighted Outcome</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              20% bull + 60% base + 20% bear over {years} years
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold tabular-nums text-foreground">
              {formatCurrency(weightedOutcome)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {((weightedOutcome / initialCapital - 1) * 100).toFixed(1)}% total return
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  isFloat,
  format,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  isFloat?: boolean;
  format?: (v: number) => string;
  color?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <div className="flex items-center gap-1 rounded-md border bg-background px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-[#2d9cdb]/60">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) =>
            onChange(isFloat ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)
          }
          min={min}
          max={max}
          step={step}
          aria-label={label}
          className={cn(
            "w-full bg-transparent text-sm font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            color
          )}
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(isFloat ? parseFloat(e.target.value) : parseInt(e.target.value))}
        min={min}
        max={max}
        step={step}
        aria-label={`${label} slider`}
        className="w-full h-1 accent-[#2d9cdb]"
      />
      {format && (
        <div className={cn("text-[10px] tabular-nums text-center", color ?? "text-muted-foreground")}>
          {format(value)}
        </div>
      )}
    </div>
  );
}

function OutcomeCard({
  label,
  returnPct,
  finalValue,
  initialCapital,
  colorClass,
  borderClass,
}: {
  label: string;
  returnPct: number;
  finalValue: number;
  initialCapital: number;
  colorClass: string;
  borderClass: string;
}) {
  const totalReturn = ((finalValue / initialCapital - 1) * 100).toFixed(1);
  const multiple = (finalValue / initialCapital).toFixed(1);

  return (
    <div className={cn("rounded-lg border bg-muted/10 p-3 text-center", borderClass)}>
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className={cn("text-base font-bold tabular-nums", colorClass)}>
        {formatCurrency(finalValue)}
      </div>
      <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
        +{totalReturn}% &middot; {multiple}x
      </div>
      <div className="text-[10px] text-muted-foreground tabular-nums">
        {returnPct}% / yr
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="20" height="10">
        <line
          x1="0"
          y1="5"
          x2="20"
          y2="5"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? "5 2" : undefined}
        />
      </svg>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
