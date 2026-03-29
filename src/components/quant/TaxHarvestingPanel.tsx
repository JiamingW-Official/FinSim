"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  findTaxHarvestingOpportunities,
  type TaxHarvestingOpportunity,
} from "@/services/quant/tax-harvesting";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDollar(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

// ─── Default Simulated Positions ─────────────────────────────────────────────

const SIMULATED_POSITIONS = [
  { ticker: "AAPL", quantity: 50, avgCost: 195.0, currentPrice: 182.5 },
  { ticker: "MSFT", quantity: 30, avgCost: 380.0, currentPrice: 410.2 },
  { ticker: "GOOG", quantity: 25, avgCost: 155.0, currentPrice: 148.3 },
  { ticker: "AMZN", quantity: 40, avgCost: 185.0, currentPrice: 190.7 },
  { ticker: "NVDA", quantity: 20, avgCost: 850.0, currentPrice: 780.0 },
  { ticker: "TSLA", quantity: 35, avgCost: 265.0, currentPrice: 230.4 },
  { ticker: "JPM", quantity: 60, avgCost: 200.0, currentPrice: 195.8 },
  { ticker: "META", quantity: 15, avgCost: 520.0, currentPrice: 545.0 },
];

// ─── Wash Sale Warning ───────────────────────────────────────────────────────

function WashSaleWarning() {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
      </svg>
      <span className="text-xs font-medium">Wash sale risk</span>
    </div>
  );
}

// ─── Opportunity Card ────────────────────────────────────────────────────────

function OpportunityCard({
  opp,
  expanded,
  onToggle,
}: {
  opp: TaxHarvestingOpportunity;
  expanded: boolean;
  onToggle: () => void;
}) {
  const lossPct =
    opp.costBasis > 0
      ? ((opp.currentPrice - opp.costBasis / 1) / (opp.costBasis / 1)) * 100
      : 0;

  // Find matching position for qty
  const pos = SIMULATED_POSITIONS.find((p) => p.ticker === opp.ticker);
  const qty = pos?.quantity ?? 0;

  return (
    <div className="rounded-lg border">
      <button
        onClick={onToggle}
        className="w-full p-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{opp.ticker}</span>
            {opp.washSaleRisk && <WashSaleWarning />}
          </div>
          <span className="font-mono tabular-nums text-sm font-medium text-emerald-500">
            {formatDollar(opp.taxSavings)} savings
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Cost Basis</p>
            <p className="font-mono tabular-nums text-xs">
              {formatDollar(opp.costBasis)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="font-mono tabular-nums text-xs">
              ${opp.currentPrice.toFixed(2)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Unreal. Loss</p>
            <p className="font-mono tabular-nums text-xs text-red-500">
              -{formatDollar(opp.unrealizedLoss)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Shares</p>
            <p className="font-mono tabular-nums text-xs">{qty}</p>
          </div>
        </div>

        {/* Loss magnitude bar */}
        <div className="mt-2">
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-colors duration-300"
              style={{
                width: `${Math.min(100, Math.abs(lossPct) * 3)}%`,
              }}
            />
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t p-3 space-y-2">
          <p className="text-xs leading-relaxed">{opp.recommendation}</p>
          <div className="px-3 py-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-0.5 font-medium">
              Educational Note
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {opp.educationalNote}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function TaxHarvestingPanel() {
  const [taxRate, setTaxRate] = useState(37);
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);

  const opportunities: TaxHarvestingOpportunity[] = useMemo(
    () =>
      findTaxHarvestingOpportunities(SIMULATED_POSITIONS, taxRate / 100),
    [taxRate],
  );

  const totalSavings = opportunities.reduce(
    (s, o) => s + o.taxSavings,
    0,
  );
  const totalLosses = opportunities.reduce(
    (s, o) => s + o.unrealizedLoss,
    0,
  );
  const washSaleCount = opportunities.filter(
    (o) => o.washSaleRisk,
  ).length;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Tax Loss Harvesting</h3>
        <span className="text-xs text-muted-foreground">
          {opportunities.length} opportunities
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            Total Tax Savings
          </p>
          <p className="font-mono tabular-nums text-sm font-medium text-emerald-500">
            {formatDollar(totalSavings)}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            Harvestable Losses
          </p>
          <p className="font-mono tabular-nums text-sm font-medium text-red-500">
            -{formatDollar(totalLosses)}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Wash Sale Risks</p>
          <p
            className={cn(
              "font-mono tabular-nums text-sm font-medium",
              washSaleCount > 0 ? "text-amber-500" : "text-emerald-500",
            )}
          >
            {washSaleCount}
          </p>
        </div>
      </div>

      {/* Tax rate slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Tax Rate:</span>
        <input
          type="range"
          min={10}
          max={50}
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
          className="flex-1 h-1 accent-primary"
        />
        <span className="font-mono tabular-nums text-xs font-medium w-8 text-right">
          {taxRate}%
        </span>
      </div>

      {/* Opportunity cards */}
      {opportunities.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No tax loss harvesting opportunities found.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            All positions are currently profitable.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.ticker}
              opp={opp}
              expanded={expandedTicker === opp.ticker}
              onToggle={() =>
                setExpandedTicker(
                  expandedTicker === opp.ticker ? null : opp.ticker,
                )
              }
            />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        Tax loss harvesting estimates assume the selected marginal tax rate.
        Actual savings depend on your total income, filing status, and
        capital gains situation. Consult a tax professional before making
        decisions. Wash sale rules prevent claiming a loss if you repurchase
        substantially identical securities within 30 days.
      </p>
    </div>
  );
}
