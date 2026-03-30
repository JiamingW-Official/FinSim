"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type Frequency = "monthly" | "quarterly" | "annual";

const FREQ_OPTIONS: { label: string; value: Frequency; perYear: number }[] = [
  { label: "Monthly", value: "monthly", perYear: 12 },
  { label: "Quarterly", value: "quarterly", perYear: 4 },
  { label: "Annual", value: "annual", perYear: 1 },
];

const CHART_W = 600;
const CHART_H = 200;
const PAD_LEFT = 64;
const PAD_RIGHT = 16;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;
const INNER_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const INNER_H = CHART_H - PAD_TOP - PAD_BOTTOM;

interface YearRow {
  year: number;
  shares: number;
  dividendIncome: number;
  cumulativeIncome: number;
  portfolioValue: number;
}

function computeDrip(
  shares: number,
  divPerShare: number,
  pricePerShare: number,
  freqPerYear: number,
  years: number,
  annualGrowthPct: number
): YearRow[] {
  const rows: YearRow[] = [];
  let currentShares = shares;
  let cumulativeIncome = 0;
  let currentDiv = divPerShare;
  let currentPrice = pricePerShare;

  for (let y = 1; y <= years; y++) {
    // Grow div and price over the year
    const divThisYear = currentDiv * freqPerYear * currentShares;
    // DRIP: reinvest each payment
    for (let p = 0; p < freqPerYear; p++) {
      const payment = currentShares * currentDiv;
      currentShares += payment / currentPrice;
    }
    cumulativeIncome += divThisYear;
    // Grow div & price for next year
    currentDiv *= 1 + annualGrowthPct / 100;
    currentPrice *= 1 + annualGrowthPct / 100;

    rows.push({
      year: y,
      shares: currentShares,
      dividendIncome: divThisYear,
      cumulativeIncome,
      portfolioValue: currentShares * currentPrice,
    });
  }
  return rows;
}

function InputField({
  label,
  prefix,
  suffix,
  value,
  onChange,
  min,
  max,
  step,
  isFloat,
}: {
  label: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  isFloat?: boolean;
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
          className="w-full bg-transparent text-sm font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
  large,
}: {
  label: string;
  value: string;
  color?: string;
  large?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-center">
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className={cn("font-bold tabular-nums", large ? "text-xl" : "text-sm", color)}>
        {value}
      </div>
    </div>
  );
}

const formatK = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v.toFixed(0)}`;
};

export function DividendCalculator() {
  const [shares, setShares] = useState(100);
  const [divPerShare, setDivPerShare] = useState(2.5);
  const [pricePerShare, setPricePerShare] = useState(50);
  const [frequency, setFrequency] = useState<Frequency>("quarterly");
  const [growthRate, setGrowthRate] = useState(5);
  const [tooltip, setTooltip] = useState<number | null>(null);

  const freq = FREQ_OPTIONS.find((f) => f.value === frequency)!;
  const dripYears = 10;

  const dripData = useMemo(
    () => computeDrip(shares, divPerShare / freq.perYear, pricePerShare, freq.perYear, dripYears, growthRate),
    [shares, divPerShare, pricePerShare, freq.perYear, growthRate]
  );

  const annualIncome = shares * divPerShare;
  const yieldPct = pricePerShare > 0 ? (divPerShare / pricePerShare) * 100 : 0;
  const finalShares = dripData[dripData.length - 1]?.shares ?? shares;
  const finalPortfolioValue = dripData[dripData.length - 1]?.portfolioValue ?? 0;
  const totalDivIncome = dripData[dripData.length - 1]?.cumulativeIncome ?? 0;

  // SVG chart — portfolio value over 10 years
  const maxVal = Math.max(...dripData.map((d) => d.portfolioValue), 1);
  const barCount = dripData.length;
  const barWidth = barCount > 0 ? Math.max(3, (INNER_W / barCount) * 0.7) : 8;
  const gapW = barCount > 0 ? INNER_W / barCount : 0;

  const yLabels = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    value: maxVal * f,
    y: PAD_TOP + INNER_H - f * INNER_H,
  }));

  const tooltipRow = tooltip !== null ? dripData[tooltip] : null;

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      {/* Payment frequency */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">Dividend Frequency:</span>
        <div className="flex gap-1">
          {FREQ_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFrequency(opt.value)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors border",
                frequency === opt.value
                  ? "bg-[#2d9cdb] text-white border-[#2d9cdb]"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-[#2d9cdb]/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InputField
          label="Shares Held"
          value={shares}
          onChange={setShares}
          min={1}
          max={10_000}
          step={10}
        />
        <InputField
          label="Annual Div / Share"
          prefix="$"
          value={divPerShare}
          onChange={setDivPerShare}
          min={0.01}
          max={50}
          step={0.25}
          isFloat
        />
        <InputField
          label="Price / Share"
          prefix="$"
          value={pricePerShare}
          onChange={setPricePerShare}
          min={1}
          max={2000}
          step={1}
          isFloat
        />
        <InputField
          label="Annual Growth Rate"
          suffix="%"
          value={growthRate}
          onChange={setGrowthRate}
          min={0}
          max={20}
          step={0.5}
          isFloat
        />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatChip label="Annual Income" value={formatK(annualIncome)} color="text-emerald-400" large />
        <StatChip
          label={`${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Income`}
          value={formatK(annualIncome / freq.perYear)}
          color="text-[#2d9cdb]"
        />
        <StatChip label="Dividend Yield" value={`${yieldPct.toFixed(2)}%`} />
        <StatChip
          label="10Y DRIP Shares"
          value={finalShares.toFixed(1)}
          color="text-purple-400"
        />
      </div>

      {/* SVG DRIP chart */}
      <div className="rounded-lg border bg-muted/20 overflow-hidden relative">
        <div className="px-4 pt-3 pb-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          DRIP Portfolio Value over 10 Years
        </div>
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full cursor-crosshair"
          style={{ height: 200 }}
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const svgX = ((e.clientX - rect.left) / rect.width) * CHART_W;
            const relX = svgX - PAD_LEFT;
            const idx = Math.min(barCount - 1, Math.max(0, Math.round((relX / INNER_W) * (barCount - 1))));
            setTooltip(idx);
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Grid lines */}
          {yLabels.map((l, i) => (
            <line
              key={i}
              x1={PAD_LEFT}
              y1={l.y}
              x2={CHART_W - PAD_RIGHT}
              y2={l.y}
              stroke="rgba(128,128,128,0.12)"
              strokeWidth="1"
            />
          ))}

          {/* Y labels */}
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

          {/* Stacked bars: original value vs DRIP gain */}
          {dripData.map((d, i) => {
            const x = PAD_LEFT + (i / Math.max(barCount - 1, 1)) * INNER_W - barWidth / 2;
            const origValue = shares * pricePerShare * Math.pow(1 + growthRate / 100, d.year);
            const origH = Math.max(1, (origValue / maxVal) * INNER_H);
            const totalH = Math.max(origH, (d.portfolioValue / maxVal) * INNER_H);
            const dripH = Math.max(0, totalH - origH);
            const baseY = PAD_TOP + INNER_H;
            const isHover = tooltip === i;

            return (
              <g key={d.year}>
                <rect
                  x={x}
                  y={baseY - origH}
                  width={barWidth}
                  height={origH}
                  fill="#2d9cdb"
                  opacity={isHover ? 1 : 0.65}
                  rx={1}
                />
                {dripH > 0 && (
                  <rect
                    x={x}
                    y={baseY - totalH}
                    width={barWidth}
                    height={dripH}
                    fill="#a855f7"
                    opacity={isHover ? 1 : 0.7}
                    rx={1}
                  />
                )}
              </g>
            );
          })}

          {/* X labels */}
          {dripData.map((d, i) => {
            if (d.year % 2 !== 0 && d.year !== 1) return null;
            const x = PAD_LEFT + (i / Math.max(barCount - 1, 1)) * INNER_W;
            return (
              <text
                key={d.year}
                x={x}
                y={PAD_TOP + INNER_H + 18}
                textAnchor="middle"
                fontSize="9"
                fill="currentColor"
                opacity={0.45}
              >
                Y{d.year}
              </text>
            );
          })}

          {/* Tooltip crosshair */}
          {tooltip !== null && (
            <line
              x1={PAD_LEFT + (tooltip / Math.max(barCount - 1, 1)) * INNER_W}
              y1={PAD_TOP}
              x2={PAD_LEFT + (tooltip / Math.max(barCount - 1, 1)) * INNER_W}
              y2={PAD_TOP + INNER_H}
              stroke="#2d9cdb"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity={0.6}
            />
          )}
        </svg>

        {/* HTML tooltip */}
        {tooltip !== null && tooltipRow !== null && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border bg-popover/95 p-2.5 text-xs shadow-lg"
            style={{
              left: `${Math.min((PAD_LEFT + (tooltip / Math.max(barCount - 1, 1)) * INNER_W) / CHART_W * 100, 70)}%`,
              top: "12px",
              transform: tooltip > barCount * 0.65 ? "translateX(-100%)" : "translateX(8px)",
            }}
          >
            <div className="font-semibold mb-1">Year {tooltipRow.year}</div>
            <div className="space-y-0.5">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Portfolio Value</span>
                <span className="font-medium tabular-nums">{formatK(tooltipRow.portfolioValue)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#2d9cdb]">Shares Held</span>
                <span className="tabular-nums">{tooltipRow.shares.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-emerald-400">Annual Income</span>
                <span className="tabular-nums">{formatK(tooltipRow.dividendIncome)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-purple-400">Cumulative Divs</span>
                <span className="tabular-nums">{formatK(tooltipRow.cumulativeIncome)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 pb-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-4 rounded-sm bg-[#2d9cdb] opacity-65" />
            <span className="text-[10px] text-muted-foreground">Organic growth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-4 rounded-sm bg-purple-500 opacity-70" />
            <span className="text-[10px] text-muted-foreground">DRIP gain</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <div className="text-[10px] text-muted-foreground mb-1">10-Year DRIP Portfolio Value</div>
          <div className="text-xl font-bold text-emerald-400 tabular-nums">{formatK(finalPortfolioValue)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {finalShares.toFixed(1)} shares @ ${(pricePerShare * Math.pow(1 + growthRate / 100, 10)).toFixed(2)}
          </div>
        </div>
        <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 px-4 py-3">
          <div className="text-[10px] text-muted-foreground mb-1">Total Dividends Received</div>
          <div className="text-xl font-bold text-purple-400 tabular-nums">{formatK(totalDivIncome)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Reinvested each {frequency.replace("ly", "")} via DRIP
          </div>
        </div>
      </div>
    </div>
  );
}
