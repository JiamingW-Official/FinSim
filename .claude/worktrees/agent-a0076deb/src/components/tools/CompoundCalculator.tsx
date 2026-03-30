"use client";

import { useState, useMemo, useRef } from "react";
import { cn, formatCurrency } from "@/lib/utils";

type CompoundFreq = "monthly" | "quarterly" | "annually";

const FREQ_OPTIONS: { label: string; value: CompoundFreq; periods: number }[] = [
  { label: "Monthly", value: "monthly", periods: 12 },
  { label: "Quarterly", value: "quarterly", periods: 4 },
  { label: "Annually", value: "annually", periods: 1 },
];

function computeGrowth(
  P: number,
  PMT: number,
  r: number,
  years: number,
  freq: number
): { year: number; balance: number; contributions: number; interest: number }[] {
  const periodsPerYear = freq;
  const ratePerPeriod = r / 100 / periodsPerYear;
  const data: { year: number; balance: number; contributions: number; interest: number }[] = [];
  let balance = P;

  for (let y = 1; y <= years; y++) {
    for (let p = 0; p < periodsPerYear; p++) {
      balance = balance * (1 + ratePerPeriod) + PMT;
    }
    data.push({
      year: y,
      balance: Math.round(balance),
      contributions: Math.round(P + PMT * periodsPerYear * y),
      interest: Math.round(balance - P - PMT * periodsPerYear * y),
    });
  }
  return data;
}

// Simple interest: no reinvestment of gains, only annual PMT*12 added each year
function computeSimpleGrowth(
  P: number,
  PMT: number,
  r: number,
  years: number,
  freq: number
): { year: number; balance: number }[] {
  const annualContrib = PMT * freq;
  const data: { year: number; balance: number }[] = [];
  for (let y = 1; y <= years; y++) {
    const totalDeposited = P + annualContrib * y;
    const simpleInterest = (P * r * y) / 100 + (annualContrib * y * (r / 100)) / 2;
    data.push({ year: y, balance: Math.round(totalDeposited + simpleInterest) });
  }
  return data;
}

const CHART_W = 600;
const CHART_H = 200;
const PAD_LEFT = 64;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;
const INNER_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const INNER_H = CHART_H - PAD_TOP - PAD_BOTTOM;

export function CompoundCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [annualRate, setAnnualRate] = useState(8);
  const [years, setYears] = useState(20);
  const [compoundFreq, setCompoundFreq] = useState<CompoundFreq>("monthly");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; idx: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const freqPeriods = FREQ_OPTIONS.find((f) => f.value === compoundFreq)!.periods;

  const data = useMemo(
    () => computeGrowth(principal, monthlyContribution, annualRate, years, freqPeriods),
    [principal, monthlyContribution, annualRate, years, freqPeriods]
  );

  const simpleData = useMemo(
    () => computeSimpleGrowth(principal, monthlyContribution, annualRate, years, freqPeriods),
    [principal, monthlyContribution, annualRate, years, freqPeriods]
  );

  const finalBalance = data[data.length - 1]?.balance ?? principal;
  const totalContributions = data[data.length - 1]?.contributions ?? principal;
  const totalInterest = data[data.length - 1]?.interest ?? 0;
  const multiplier = totalContributions > 0 ? (finalBalance / totalContributions).toFixed(1) : "1.0";
  const compoundAdvantage = finalBalance - (simpleData[simpleData.length - 1]?.balance ?? finalBalance);

  const maxBalance = Math.max(...data.map((d) => d.balance), ...simpleData.map((d) => d.balance), 1);

  // Bar geometry
  const barCount = data.length;
  const barWidth = barCount > 0 ? Math.max(2, (INNER_W / barCount) * 0.72) : 8;
  const gap = barCount > 0 ? INNER_W / barCount : 0;

  // Y-axis labels (5 steps)
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    value: Math.round(maxBalance * f),
    y: PAD_TOP + INNER_H - f * INNER_H,
  }));

  // X-axis: labels every 5 years
  const xLabels = data
    .filter((d) => d.year % 5 === 0 || d.year === 1)
    .map((d) => ({
      year: d.year,
      x: PAD_LEFT + ((d.year - 1) / Math.max(barCount - 1, 1)) * INNER_W + gap / 2,
    }));

  // Tooltip data
  const tooltipData = tooltip !== null ? data[tooltip.idx] : null;

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || barCount === 0) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * CHART_W;
    const relX = svgX - PAD_LEFT;
    const idx = Math.min(
      barCount - 1,
      Math.max(0, Math.round((relX / INNER_W) * (barCount - 1)))
    );
    const barX = PAD_LEFT + (idx / Math.max(barCount - 1, 1)) * INNER_W;
    setTooltip({ x: barX, y: e.clientY - rect.top, idx });
  }

  function handleMouseLeave() {
    setTooltip(null);
  }

  const formatK = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
    return `$${v}`;
  };

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InputField
          label="Initial Principal"
          prefix="$"
          value={principal}
          onChange={setPrincipal}
          min={0}
          max={1_000_000}
          step={1000}
        />
        <InputField
          label="Monthly Contribution"
          prefix="$"
          value={monthlyContribution}
          onChange={setMonthlyContribution}
          min={0}
          max={10_000}
          step={100}
        />
        <InputField
          label="Annual Rate"
          suffix="%"
          value={annualRate}
          onChange={setAnnualRate}
          min={0}
          max={30}
          step={0.5}
          isFloat
        />
        <InputField
          label="Years"
          value={years}
          onChange={setYears}
          min={1}
          max={50}
          step={1}
        />
      </div>

      {/* Compound frequency */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">Compound:</span>
        <div className="flex gap-1">
          {FREQ_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCompoundFreq(opt.value)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors border",
                compoundFreq === opt.value
                  ? "bg-[#2d9cdb] text-white border-[#2d9cdb]"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-[#2d9cdb]/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results summary */}
      <div className="grid grid-cols-3 gap-4">
        <ResultCard
          label="Final Balance"
          value={formatCurrency(finalBalance)}
          large
          color="text-[#2d9cdb]"
        />
        <ResultCard
          label="Total Contributions"
          value={formatCurrency(totalContributions)}
          color="text-blue-400"
        />
        <ResultCard
          label="Total Interest"
          value={formatCurrency(totalInterest)}
          color="text-emerald-400"
        />
      </div>

      {/* SVG Bar Chart */}
      <div className="rounded-lg border bg-muted/20 overflow-hidden relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full"
          style={{ height: 200 }}
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
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

          {/* Y-axis labels */}
          {yLabels.map((l, i) => (
            <text
              key={i}
              x={PAD_LEFT - 6}
              y={l.y + 4}
              textAnchor="end"
              fontSize="9"
              fill="currentColor"
              className="text-muted-foreground"
              opacity={0.6}
            >
              {formatK(l.value)}
            </text>
          ))}

          {/* Stacked bars */}
          {data.map((d, i) => {
            const x = PAD_LEFT + (i / Math.max(barCount - 1, 1)) * INNER_W - barWidth / 2;
            const contribH = Math.max(1, (d.contributions / maxBalance) * INNER_H);
            const interestH = Math.max(0, (d.interest / maxBalance) * INNER_H);
            const totalH = contribH + interestH;
            const baseY = PAD_TOP + INNER_H;

            return (
              <g key={d.year}>
                {/* Contributions bar (blue) */}
                <rect
                  x={x}
                  y={baseY - contribH}
                  width={barWidth}
                  height={contribH}
                  fill="#2d9cdb"
                  opacity={0.7}
                  rx={1}
                />
                {/* Interest bar (green), stacked on top */}
                {interestH > 0 && (
                  <rect
                    x={x}
                    y={baseY - totalH}
                    width={barWidth}
                    height={interestH}
                    fill="#10b981"
                    opacity={0.75}
                    rx={1}
                  />
                )}
              </g>
            );
          })}

          {/* Simple interest line overlay */}
          {simpleData.length > 1 && (() => {
            const pts = simpleData
              .map((d, i) => {
                const x = PAD_LEFT + (i / Math.max(barCount - 1, 1)) * INNER_W;
                const y = PAD_TOP + INNER_H - (d.balance / maxBalance) * INNER_H;
                return `${x},${y}`;
              })
              .join(" ");
            return (
              <polyline
                points={pts}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                opacity={0.75}
              />
            );
          })()}

          {/* X-axis labels */}
          {xLabels.map((l) => (
            <text
              key={l.year}
              x={l.x}
              y={PAD_TOP + INNER_H + 18}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity={0.5}
            >
              Y{l.year}
            </text>
          ))}

          {/* Tooltip crosshair */}
          {tooltip !== null && (
            <line
              x1={tooltip.x}
              y1={PAD_TOP}
              x2={tooltip.x}
              y2={PAD_TOP + INNER_H}
              stroke="#2d9cdb"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity={0.7}
            />
          )}
        </svg>

        {/* HTML tooltip overlay */}
        {tooltip !== null && tooltipData !== null && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border bg-popover/95 p-2.5 text-xs shadow-lg backdrop-blur-sm"
            style={{
              left: Math.min(
                tooltip.x / CHART_W * 100,
                72
              ) + "%",
              top: "12px",
              transform: tooltip.idx > barCount * 0.65 ? "translateX(-100%)" : "translateX(8px)",
            }}
          >
            <div className="font-semibold text-foreground mb-1">Year {tooltipData.year}</div>
            <div className="space-y-0.5">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-medium tabular-nums">{formatCurrency(tooltipData.balance)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#2d9cdb]">Contributions</span>
                <span className="tabular-nums">{formatCurrency(tooltipData.contributions)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-emerald-400">Interest</span>
                <span className="tabular-nums">{formatCurrency(tooltipData.interest)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 pb-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-4 rounded-sm bg-[#2d9cdb] opacity-70" />
            <span className="text-[10px] text-muted-foreground">Contributions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-4 rounded-sm bg-emerald-500 opacity-75" />
            <span className="text-[10px] text-muted-foreground">Compound interest</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="10" className="shrink-0">
              <line x1="0" y1="5" x2="16" y2="5" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" />
            </svg>
            <span className="text-[10px] text-muted-foreground">Simple interest (comparison)</span>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="rounded-lg border border-[#2d9cdb]/20 bg-[#2d9cdb]/5 px-4 py-3">
        <p className="text-sm text-foreground/80">
          <span className="font-semibold text-[#2d9cdb]">
            Your money multiplies {multiplier}x in {years} years.
          </span>{" "}
          {totalInterest > 0 && (
            <>
              {((totalInterest / totalContributions) * 100).toFixed(0)}% of your final balance comes
              from compound interest — money your money earned for you.
            </>
          )}
          {compoundAdvantage > 0 && (
            <>
              {" "}Compounding adds{" "}
              <span className="font-semibold text-emerald-400">
                {compoundAdvantage >= 1_000_000
                  ? `$${(compoundAdvantage / 1_000_000).toFixed(2)}M`
                  : compoundAdvantage >= 1_000
                    ? `$${Math.round(compoundAdvantage / 1_000)}K`
                    : `$${compoundAdvantage.toFixed(0)}`}
              </span>{" "}
              more than simple interest over the same period.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  isFloat,
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
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <div className="flex items-center gap-1 rounded-md border bg-background px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-[#2d9cdb]/60">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(isFloat ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)}
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

function ResultCard({
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
      <div className={cn("font-bold tabular-nums", large ? "text-xl" : "text-sm", color)}>{value}</div>
    </div>
  );
}
