"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, DollarSign, Clock, Percent } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export function CompoundCalculator() {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(30);

  const result = useMemo(() => {
    const r = rate / 100 / 12; // monthly rate
    const n = years * 12; // total months
    const totalContributed = initial + monthly * n;

    // FV = P(1+r)^n + PMT * ((1+r)^n - 1) / r
    let futureValue: number;
    if (r === 0) {
      futureValue = initial + monthly * n;
    } else {
      futureValue =
        initial * Math.pow(1 + r, n) +
        monthly * ((Math.pow(1 + r, n) - 1) / r);
    }

    const totalInterest = futureValue - totalContributed;

    // Year-by-year data for chart
    const yearlyData: { year: number; contributed: number; total: number }[] = [];
    for (let y = 0; y <= years; y++) {
      const months = y * 12;
      const contributed = initial + monthly * months;
      let total: number;
      if (r === 0) {
        total = contributed;
      } else {
        total =
          initial * Math.pow(1 + r, months) +
          monthly * ((Math.pow(1 + r, months) - 1) / r);
      }
      yearlyData.push({ year: y, contributed, total });
    }

    return { futureValue, totalContributed, totalInterest, yearlyData };
  }, [initial, monthly, rate, years]);

  // SVG chart dimensions
  const chartW = 500;
  const chartH = 160;
  const maxVal = result.futureValue * 1.05;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold">Compound Interest Calculator</h3>
      </div>
      <p className="text-[10px] text-muted-foreground">
        See how your money grows over time with the power of compound interest.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          icon={<DollarSign className="h-3 w-3 text-blue-400" />}
          label="Starting Amount"
          value={initial}
          onChange={setInitial}
          min={0}
          max={1000000}
          step={1000}
        />
        <InputField
          icon={<DollarSign className="h-3 w-3 text-green-400" />}
          label="Monthly Contribution"
          value={monthly}
          onChange={setMonthly}
          min={0}
          max={10000}
          step={100}
        />
        <InputField
          icon={<Percent className="h-3 w-3 text-amber-400" />}
          label="Annual Return %"
          value={rate}
          onChange={setRate}
          min={0}
          max={15}
          step={0.5}
        />
        <InputField
          icon={<Clock className="h-3 w-3 text-purple-400" />}
          label="Years"
          value={years}
          onChange={setYears}
          min={1}
          max={50}
          step={1}
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultCard
          label="Future Value"
          value={formatCurrency(result.futureValue)}
          className="text-primary"
        />
        <ResultCard
          label="Total Contributed"
          value={formatCurrency(result.totalContributed)}
          className="text-blue-400"
        />
        <ResultCard
          label="Interest Earned"
          value={formatCurrency(result.totalInterest)}
          className="text-green-400"
        />
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border/50 bg-card/30 p-3">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-40" preserveAspectRatio="none">
          {/* Grid */}
          {[0, 40, 80, 120, 160].map((y) => (
            <line key={y} x1="0" y1={y} x2={chartW} y2={y} stroke="rgba(255,255,255,0.03)" />
          ))}

          {/* Contributed area (blue) */}
          <path
            d={`M 0,${chartH} ${result.yearlyData
              .map((d) => {
                const x = (d.year / years) * chartW;
                const y = chartH - (d.contributed / maxVal) * chartH;
                return `L ${x},${y}`;
              })
              .join(" ")} L ${chartW},${chartH} Z`}
            fill="rgba(59,130,246,0.15)"
          />

          {/* Total area (green) */}
          <path
            d={`M 0,${chartH} ${result.yearlyData
              .map((d) => {
                const x = (d.year / years) * chartW;
                const y = chartH - (d.total / maxVal) * chartH;
                return `L ${x},${y}`;
              })
              .join(" ")} L ${chartW},${chartH} Z`}
            fill="rgba(16,185,129,0.1)"
          />

          {/* Total line */}
          <path
            d={result.yearlyData
              .map((d, i) => {
                const x = (d.year / years) * chartW;
                const y = chartH - (d.total / maxVal) * chartH;
                return `${i === 0 ? "M" : "L"} ${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />

          {/* Contributed line */}
          <path
            d={result.yearlyData
              .map((d, i) => {
                const x = (d.year / years) * chartW;
                const y = chartH - (d.contributed / maxVal) * chartH;
                return `${i === 0 ? "M" : "L"} ${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="4"
          />
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 bg-green-400 rounded" />
            <span className="text-[9px] text-muted-foreground">Total Value</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 bg-blue-400 rounded" style={{ borderBottom: "1px dashed" }} />
            <span className="text-[9px] text-muted-foreground">Contributions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-4 rounded-sm bg-green-500/15" />
            <span className="text-[9px] text-muted-foreground">Interest Earned</span>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="rounded-lg border border-primary/10 bg-primary/5 p-3">
        <p className="text-[10px] text-foreground/70 leading-relaxed">
          <span className="font-bold text-primary">
            {((result.totalInterest / result.totalContributed) * 100).toFixed(0)}% of your final balance
          </span>{" "}
          comes from compound interest — money your money earned for you. Starting early and staying
          consistent is the key to building wealth.
        </p>
      </div>
    </div>
  );
}

function InputField({
  icon,
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-2.5">
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-[9px] font-medium text-muted-foreground">{label}</span>
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        className="w-full bg-transparent text-sm font-bold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        aria-label={`${label} slider`}
        step={step}
        className="w-full h-1 mt-1 accent-primary"
      />
    </div>
  );
}

function ResultCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-2.5 text-center">
      <div className="text-[9px] text-muted-foreground mb-0.5">{label}</div>
      <div className={cn("text-xs font-black tabular-nums", className)}>{value}</div>
    </div>
  );
}
