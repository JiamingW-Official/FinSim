"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { generateInstitutionalHoldings } from "@/services/market/institutional-holdings";

function formatValue(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatShares(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface InstitutionalHoldingsPanelProps {
  ticker: string;
}

export default function InstitutionalHoldingsPanel({ ticker }: InstitutionalHoldingsPanelProps) {
  const data = useMemo(() => generateInstitutionalHoldings(ticker), [ticker]);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">Institutional Holdings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">13F institutional ownership data for {ticker}</p>
      </div>

      {/* Total ownership */}
      <div className="border border-border/60 rounded-lg bg-card p-3">
        <p className="text-xs text-muted-foreground">Total Institutional Ownership</p>
        <div className="flex items-center gap-3 mt-1.5">
          <p className="text-lg font-semibold text-foreground">{data.totalInstitutionalOwnership}%</p>
          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min(data.totalInstitutionalOwnership, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div className="border border-border/60 rounded-lg bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[400px]">
          <thead>
            <tr className="border-b border-border/40 text-xs text-muted-foreground">
              <th className="text-left p-2.5 font-medium">Institution</th>
              <th className="text-right p-2.5 font-medium">Shares</th>
              <th className="text-right p-2.5 font-medium">Value</th>
              <th className="text-right p-2.5 font-medium">% Out</th>
              <th className="text-right p-2.5 font-medium">Qtr Chg</th>
            </tr>
          </thead>
          <tbody>
            {data.holders.map((holder, i) => (
              <tr key={holder.name} className="border-b border-border/20 last:border-0">
                <td className="p-2.5 font-medium text-foreground">{holder.name}</td>
                <td className="p-2.5 text-right text-muted-foreground">{formatShares(holder.shares)}</td>
                <td className="p-2.5 text-right text-muted-foreground">{formatValue(holder.value)}</td>
                <td className="p-2.5 text-right text-foreground">{holder.pctOutstanding}%</td>
                <td className="p-2.5 text-right">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-medium",
                      holder.quarterlyChange > 0 ? "text-green-500" : holder.quarterlyChange < 0 ? "text-red-500" : "text-muted-foreground"
                    )}
                  >
                    {holder.quarterlyChange > 0 ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0">
                        <path d="M5 2L8 6H2L5 2Z" fill="currentColor" />
                      </svg>
                    ) : holder.quarterlyChange < 0 ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0">
                        <path d="M5 8L2 4H8L5 8Z" fill="currentColor" />
                      </svg>
                    ) : null}
                    {holder.quarterlyChange > 0 ? "+" : ""}
                    {holder.quarterlyChange}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
