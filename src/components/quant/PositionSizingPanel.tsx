"use client";

import { useState, useMemo } from "react";
import {
  kellyPositionSize,
  fixedPercentRisk,
  atrPositionSize,
  volatilityAdjustedSize,
  equalRiskContribution,
  type PositionSizeResult,
} from "@/services/quant/position-sizing";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PositionSizingPanelProps {
  /** Pre-fill portfolio value */
  defaultPortfolioValue?: number;
  /** Pre-fill current/entry price */
  defaultPrice?: number;
  /** Pre-fill ATR if available */
  defaultAtr?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDollar(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PositionSizingPanel({
  defaultPortfolioValue = 100000,
  defaultPrice = 150,
  defaultAtr = 3.5,
}: PositionSizingPanelProps) {
  // Input state
  const [portfolioValue, setPortfolioValue] = useState(defaultPortfolioValue);
  const [entryPrice, setEntryPrice] = useState(defaultPrice);
  const [stopLoss, setStopLoss] = useState(Math.round(defaultPrice * 0.95 * 100) / 100);
  const [riskPercent, setRiskPercent] = useState(2);
  const [winRate, setWinRate] = useState(0.55);
  const [avgWin, setAvgWin] = useState(2.0);
  const [avgLoss, setAvgLoss] = useState(1.0);
  const [atr, setAtr] = useState(defaultAtr);
  const [numPositions, setNumPositions] = useState(5);
  const [assetVolatility, setAssetVolatility] = useState(0.25);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Compute all methods
  const results: PositionSizeResult[] = useMemo(() => {
    return [
      kellyPositionSize(winRate, avgWin, avgLoss, portfolioValue, entryPrice),
      fixedPercentRisk(portfolioValue, riskPercent, entryPrice, stopLoss),
      atrPositionSize(portfolioValue, riskPercent, entryPrice, atr),
      volatilityAdjustedSize(portfolioValue, 0.15, assetVolatility, entryPrice),
      equalRiskContribution(portfolioValue, numPositions, entryPrice),
    ];
  }, [portfolioValue, entryPrice, stopLoss, riskPercent, winRate, avgWin, avgLoss, atr, numPositions, assetVolatility]);

  // Determine "recommended" — the method with highest shares that still keeps risk under 5% of portfolio
  const recommendedIdx = useMemo(() => {
    let bestIdx = 1; // Default to Fixed % Risk
    let bestShares = 0;
    for (let i = 0; i < results.length; i++) {
      if (results[i].percentOfPortfolio <= 30 && results[i].shares > bestShares) {
        bestShares = results[i].shares;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, [results]);

  return (
    <div className="space-y-4">
      {/* Input fields grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InputField
          label="Portfolio Value"
          value={portfolioValue}
          onChange={setPortfolioValue}
          prefix="$"
          step={1000}
        />
        <InputField
          label="Entry Price"
          value={entryPrice}
          onChange={setEntryPrice}
          prefix="$"
          step={1}
        />
        <InputField
          label="Stop Loss"
          value={stopLoss}
          onChange={setStopLoss}
          prefix="$"
          step={0.5}
        />
        <InputField
          label="Risk %"
          value={riskPercent}
          onChange={setRiskPercent}
          suffix="%"
          step={0.5}
          min={0.5}
          max={10}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <InputField
          label="Win Rate"
          value={winRate}
          onChange={setWinRate}
          step={0.05}
          min={0}
          max={1}
        />
        <InputField
          label="Avg Win"
          value={avgWin}
          onChange={setAvgWin}
          prefix="$"
          step={0.1}
        />
        <InputField
          label="Avg Loss"
          value={avgLoss}
          onChange={setAvgLoss}
          prefix="$"
          step={0.1}
        />
        <InputField
          label="ATR"
          value={atr}
          onChange={setAtr}
          prefix="$"
          step={0.1}
        />
        <InputField
          label="# Positions"
          value={numPositions}
          onChange={setNumPositions}
          step={1}
          min={1}
          max={20}
        />
      </div>

      {/* Hidden but used: asset volatility */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InputField
          label="Asset Volatility"
          value={assetVolatility}
          onChange={setAssetVolatility}
          step={0.01}
          min={0.01}
          max={2}
        />
      </div>

      {/* Results table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-3 py-2 font-semibold text-xs text-muted-foreground">Method</th>
              <th className="text-right px-3 py-2 font-semibold text-xs text-muted-foreground">Shares</th>
              <th className="text-right px-3 py-2 font-semibold text-xs text-muted-foreground">Amount</th>
              <th className="text-right px-3 py-2 font-semibold text-xs text-muted-foreground">Risk</th>
              <th className="text-right px-3 py-2 font-semibold text-xs text-muted-foreground">% Portfolio</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <MethodRow
                key={r.method}
                result={r}
                isRecommended={i === recommendedIdx}
                isExpanded={expandedIdx === i}
                onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Input Field ─────────────────────────────────────────────────────────────

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
          max={max}
          className={`
            w-full rounded-lg border border-border bg-background
            px-2.5 py-1.5 text-sm font-mono tabular-nums text-foreground
            focus:outline-none focus:ring-1 focus:ring-ring
            ${prefix ? "pl-6" : ""}
            ${suffix ? "pr-6" : ""}
          `}
        />
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Method Row ──────────────────────────────────────────────────────────────

function MethodRow({
  result,
  isRecommended,
  isExpanded,
  onToggle,
}: {
  result: PositionSizeResult;
  isRecommended: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={`
          border-b border-border/50 cursor-pointer transition-colors
          hover:bg-muted/20
          ${isRecommended ? "bg-primary/5" : ""}
        `}
        onClick={onToggle}
      >
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground text-xs">{result.method}</span>
            {isRecommended && (
              <span className="text-[11px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:text-primary">
                Suggested
              </span>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5 text-right font-mono tabular-nums text-foreground text-xs">
          {result.shares}
        </td>
        <td className="px-3 py-2.5 text-right font-mono tabular-nums text-foreground text-xs">
          {formatDollar(result.dollarAmount)}
        </td>
        <td className="px-3 py-2.5 text-right font-mono tabular-nums text-red-600 dark:text-red-400 text-xs">
          {formatDollar(result.riskAmount)}
        </td>
        <td className="px-3 py-2.5 text-right font-mono tabular-nums text-foreground text-xs">
          {result.percentOfPortfolio.toFixed(1)}%
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-border/50 bg-muted/10">
          <td colSpan={5} className="px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {result.explanation}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}
