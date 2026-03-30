"use client";

import { useState, useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, cn } from "@/lib/utils";

interface PositionSizerProps {
  entry: number;
  stopLoss: number;
  takeProfit?: number;
}

export function PositionSizer({ entry, stopLoss, takeProfit }: PositionSizerProps) {
  const [riskPct, setRiskPct] = useState(2);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);

  const calc = useMemo(() => {
    const accountSize = portfolioValue;
    const maxRisk = (accountSize * riskPct) / 100;
    const risk = entry - stopLoss;

    if (risk <= 0 || entry <= 0) return null;

    const shares = Math.floor(maxRisk / risk);
    const positionValue = shares * entry;
    const pctOfPortfolio = (positionValue / accountSize) * 100;

    let rrRatio: number | null = null;
    let expectedValue: number | null = null;
    if (takeProfit && takeProfit > entry) {
      const reward = takeProfit - entry;
      rrRatio = reward / risk;
      const winRate = 0.5;
      expectedValue = winRate * reward * shares - (1 - winRate) * risk * shares;
    }

    return { accountSize, maxRisk, shares, positionValue, pctOfPortfolio, rrRatio, expectedValue };
  }, [portfolioValue, riskPct, entry, stopLoss, takeProfit]);

  if (!calc) return null;

  const { maxRisk, shares, positionValue, pctOfPortfolio, rrRatio, expectedValue } = calc;

  const sizeColor =
    pctOfPortfolio > 20
      ? "text-red-500"
      : pctOfPortfolio > 10
        ? "text-amber-500"
        : "text-green-500";

  const trackBg =
    pctOfPortfolio > 20
      ? "accent-red-500"
      : pctOfPortfolio > 10
        ? "accent-amber-500"
        : "";

  return (
    <div className="rounded-md border border-border/40 bg-muted/30 p-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Position Sizer
        </span>
        <span className="text-[10px] text-muted-foreground">
          Portfolio: {formatCurrency(calc.accountSize)}
        </span>
      </div>

      {/* Risk % Slider */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground w-10 shrink-0">Risk %</span>
        <input
          type="range"
          min={0.5}
          max={5}
          step={0.5}
          value={riskPct}
          onChange={(e) => setRiskPct(parseFloat(e.target.value))}
          className={cn("flex-1 h-1.5 appearance-none rounded-full bg-border cursor-pointer", trackBg)}
        />
        <span className="text-[11px] font-semibold tabular-nums w-8 text-right">
          {riskPct}%
        </span>
      </div>

      {/* Computed metrics row */}
      <div className="grid grid-cols-3 gap-1 text-center">
        <div className="rounded bg-muted/60 px-1.5 py-1">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">Max Risk</div>
          <div className="text-[11px] font-semibold tabular-nums text-red-500">
            -{formatCurrency(maxRisk)}
          </div>
        </div>
        <div className="rounded bg-muted/60 px-1.5 py-1">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">Shares</div>
          <div className="text-[11px] font-semibold tabular-nums">
            {shares.toLocaleString()}
          </div>
        </div>
        <div className="rounded bg-muted/60 px-1.5 py-1">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">Position</div>
          <div className={cn("text-[11px] font-semibold tabular-nums", sizeColor)}>
            {formatCurrency(positionValue)}
          </div>
        </div>
      </div>

      {/* Portfolio % bar */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground">% of Portfolio</span>
          <span className={cn("text-[10px] font-semibold tabular-nums", sizeColor)}>
            {pctOfPortfolio.toFixed(1)}%
            {pctOfPortfolio > 20 && (
              <span className="ml-1 text-[9px] font-normal text-red-500">(oversized)</span>
            )}
            {pctOfPortfolio > 10 && pctOfPortfolio <= 20 && (
              <span className="ml-1 text-[9px] font-normal text-amber-500">(elevated)</span>
            )}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-border overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              pctOfPortfolio > 20
                ? "bg-red-500"
                : pctOfPortfolio > 10
                  ? "bg-amber-500"
                  : "bg-green-500",
            )}
            style={{ width: `${Math.min(pctOfPortfolio * 5, 100)}%` }}
          />
        </div>
      </div>

      {/* R:R preview (only when take profit is set) */}
      {rrRatio !== null && expectedValue !== null && (
        <div className="flex items-center justify-between rounded bg-muted/60 px-2 py-1">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">R:R</span>
          <span className="text-[11px] font-semibold tabular-nums">
            1 : {rrRatio.toFixed(2)}
          </span>
          <span className="text-[9px] text-muted-foreground">EV (50% win)</span>
          <span
            className={cn(
              "text-[11px] font-semibold tabular-nums",
              expectedValue >= 0 ? "text-green-500" : "text-red-500",
            )}
          >
            {expectedValue >= 0 ? "+" : ""}
            {formatCurrency(expectedValue)}
          </span>
        </div>
      )}
    </div>
  );
}
