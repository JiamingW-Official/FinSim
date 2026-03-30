"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { generateInsiderTrades } from "@/services/market/insider-trading";

function formatValue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatShares(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface InsiderTradingPanelProps {
  ticker: string;
}

export default function InsiderTradingPanel({ ticker }: InsiderTradingPanelProps) {
  const data = useMemo(() => generateInsiderTrades(ticker), [ticker]);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">Insider Trading</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Recent insider transactions for {ticker}</p>
      </div>

      {/* Summary */}
      <div className="border border-border rounded-lg bg-card p-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Net Activity</p>
            <p
              className={cn(
                "text-sm font-semibold mt-0.5",
                data.netBuying > 0 ? "text-green-500" : data.netBuying < 0 ? "text-red-500" : "text-foreground"
              )}
            >
              {data.netBuying > 0 ? "+" : ""}
              {formatValue(data.netBuying)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Buying</p>
            <p className="text-sm font-semibold text-green-500 mt-0.5">{formatValue(data.totalBuyValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Selling</p>
            <p className="text-sm font-semibold text-red-500 mt-0.5">{formatValue(data.totalSellValue)}</p>
          </div>
        </div>
      </div>

      {/* Trades table */}
      <div className="border border-border rounded-lg bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[400px]">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left p-2.5 font-medium">Insider</th>
              <th className="text-left p-2.5 font-medium">Type</th>
              <th className="text-right p-2.5 font-medium">Shares</th>
              <th className="text-right p-2.5 font-medium">Value</th>
              <th className="text-right p-2.5 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.trades.map((trade) => (
              <tr
                key={trade.id}
                className={cn(
                  "border-b border-border last:border-0",
                  trade.type === "buy" ? "bg-green-500/[0.03]" : "bg-red-500/[0.03]"
                )}
              >
                <td className="p-2.5">
                  <div>
                    <p className="font-medium text-foreground">{trade.name}</p>
                    <p className="text-xs text-muted-foreground">{trade.title}</p>
                  </div>
                </td>
                <td className="p-2.5">
                  <span
                    className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded",
                      trade.type === "buy" ? "bg-green-500/10 text-green-500" : "bg-red-500/5 text-red-500"
                    )}
                  >
                    {trade.type.toUpperCase()}
                  </span>
                </td>
                <td className="p-2.5 text-right text-muted-foreground">{formatShares(trade.shares)}</td>
                <td className="p-2.5 text-right font-medium text-foreground">{formatValue(trade.value)}</td>
                <td className="p-2.5 text-right text-muted-foreground">{trade.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
