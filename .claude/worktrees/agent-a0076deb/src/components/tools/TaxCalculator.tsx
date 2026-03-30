"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type HoldingPeriod = "short" | "long";

interface TaxBracket {
  label: string;
  ordinaryRate: number; // short-term rate (same as income tax)
  ltcgRate: number;     // long-term capital gains rate
}

const TAX_BRACKETS: TaxBracket[] = [
  { label: "10% — up to $11,600",          ordinaryRate: 10,  ltcgRate: 0  },
  { label: "12% — $11,601–$47,150",        ordinaryRate: 12,  ltcgRate: 0  },
  { label: "22% — $47,151–$100,525",       ordinaryRate: 22,  ltcgRate: 15 },
  { label: "24% — $100,526–$191,950",      ordinaryRate: 24,  ltcgRate: 15 },
  { label: "32% — $191,951–$243,725",      ordinaryRate: 32,  ltcgRate: 15 },
  { label: "35% — $243,726–$609,350",      ordinaryRate: 35,  ltcgRate: 20 },
  { label: "37% — over $609,350",          ordinaryRate: 37,  ltcgRate: 20 },
];

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

const formatCurr = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
};

export function TaxCalculator() {
  const [gains, setGains] = useState(10000);
  const [holdingPeriod, setHoldingPeriod] = useState<HoldingPeriod>("short");
  const [bracketIdx, setBracketIdx] = useState(2); // default 22%
  const [stateRatePct, setStateRatePct] = useState(5);

  const bracket = TAX_BRACKETS[bracketIdx];

  const calc = useMemo(() => {
    const fedRate = holdingPeriod === "short" ? bracket.ordinaryRate : bracket.ltcgRate;
    const totalRate = fedRate + stateRatePct;

    const fedTax = (gains * fedRate) / 100;
    const stateTax = (gains * stateRatePct) / 100;
    const totalTax = fedTax + stateTax;
    const netGain = gains - totalTax;

    // Compare: what would the other holding period cost?
    const altFedRate = holdingPeriod === "short" ? bracket.ltcgRate : bracket.ordinaryRate;
    const altFedTax = (gains * altFedRate) / 100;
    const altTotal = altFedTax + stateTax;
    const savings = holdingPeriod === "short" ? altTotal - totalTax : totalTax - altTotal;

    return { fedRate, fedTax, stateTax, totalTax, netGain, totalRate, savings, altTotal };
  }, [gains, holdingPeriod, bracket, stateRatePct]);

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      {/* Disclaimer banner */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-600 dark:text-amber-400">
        This is for educational purposes only. Tax laws vary by jurisdiction and situation. Consult a qualified tax professional for personal advice.
      </div>

      {/* Holding period toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">Holding Period:</span>
        <div className="flex gap-1">
          <button
            onClick={() => setHoldingPeriod("short")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-colors border",
              holdingPeriod === "short"
                ? "bg-amber-500 text-white border-amber-500"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            Short-term (&lt;1 year)
          </button>
          <button
            onClick={() => setHoldingPeriod("long")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-colors border",
              holdingPeriod === "long"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            Long-term (&gt;1 year)
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Trading Gains"
          prefix="$"
          value={gains}
          onChange={setGains}
          min={0}
          max={1_000_000}
          step={500}
        />
        <InputField
          label="State Tax Rate"
          suffix="%"
          value={stateRatePct}
          onChange={setStateRatePct}
          min={0}
          max={15}
          step={0.5}
          isFloat
        />
      </div>

      {/* Tax bracket selector */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Federal Income Tax Bracket (2024)</label>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {TAX_BRACKETS.map((b, i) => (
            <button
              key={i}
              onClick={() => setBracketIdx(i)}
              className={cn(
                "text-left px-3 py-2 rounded-md text-xs border transition-colors",
                bracketIdx === i
                  ? "border-[#2d9cdb] bg-[#2d9cdb]/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
              )}
            >
              <span className="font-semibold">{b.ordinaryRate}%</span>
              <span className="text-[10px] ml-1 opacity-70">{b.label.split("—")[1]}</span>
              <span className="ml-2 text-[10px] text-emerald-500">LT: {b.ltcgRate}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-muted/20 p-3 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">Federal Tax Rate</div>
            <div className="text-xl font-bold tabular-nums text-foreground">
              {calc.fedRate}%
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {holdingPeriod === "short" ? "Ordinary income" : "Long-term CG"}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">Total Tax Rate</div>
            <div className="text-xl font-bold tabular-nums text-red-500">
              {calc.totalRate.toFixed(1)}%
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Fed + State</div>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">Net After Tax</div>
            <div className="text-xl font-bold tabular-nums text-emerald-400">
              {formatCurr(calc.netGain)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">You keep</div>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Tax Breakdown — {formatCurr(gains)} gains
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-28 text-xs text-muted-foreground shrink-0">Federal tax</span>
              <div className="flex-1 h-2.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{ width: `${Math.min((calc.fedTax / gains) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-red-500 w-16 text-right">
                {formatCurr(calc.fedTax)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-28 text-xs text-muted-foreground shrink-0">State tax</span>
              <div className="flex-1 h-2.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${Math.min((calc.stateTax / gains) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-amber-500 w-16 text-right">
                {formatCurr(calc.stateTax)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-28 text-xs text-muted-foreground shrink-0">You keep</span>
              <div className="flex-1 h-2.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min((calc.netGain / gains) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-emerald-400 w-16 text-right">
                {formatCurr(calc.netGain)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Short vs long comparison */}
      <div
        className={cn(
          "rounded-lg border px-4 py-3 text-sm",
          holdingPeriod === "short"
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-[#2d9cdb]/20 bg-[#2d9cdb]/5"
        )}
      >
        {holdingPeriod === "short" ? (
          <>
            Holding longer than 1 year would reduce your federal rate from{" "}
            <span className="font-semibold text-red-500">{bracket.ordinaryRate}%</span> to{" "}
            <span className="font-semibold text-emerald-400">{bracket.ltcgRate}%</span>.
            {calc.savings > 0 && (
              <> You would save{" "}
                <span className="font-semibold text-emerald-400">{formatCurr(calc.savings)}</span>{" "}
                on this trade.
              </>
            )}
          </>
        ) : (
          <>
            You benefit from the long-term capital gains rate of{" "}
            <span className="font-semibold text-emerald-400">{bracket.ltcgRate}%</span> vs{" "}
            <span className="font-semibold text-red-500">{bracket.ordinaryRate}%</span> for short-term.
            {calc.savings > 0 && (
              <> Holding long-term saves you{" "}
                <span className="font-semibold text-emerald-400">{formatCurr(calc.savings)}</span>{" "}
                on this trade.
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
