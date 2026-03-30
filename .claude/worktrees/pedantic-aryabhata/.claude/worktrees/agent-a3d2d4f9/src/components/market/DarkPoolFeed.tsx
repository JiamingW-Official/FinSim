"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { generateDarkPoolActivity, type DarkPoolSummary } from "@/services/market/dark-pool";

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatNotional(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatShares(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function SignificanceBadge({
  significance,
}: {
  significance: "routine" | "notable" | "unusual" | "massive";
}) {
  const styles = {
    routine: "bg-muted text-muted-foreground",
    notable: "bg-blue-500/10 text-blue-500",
    unusual: "bg-amber-500/10 text-amber-500",
    massive: "bg-red-500/10 text-red-500",
  };
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", styles[significance])}>
      {significance}
    </span>
  );
}

interface DarkPoolFeedProps {
  ticker: string;
  currentPrice: number;
  dailyVolume: number;
}

export function DarkPoolFeed({ ticker, currentPrice, dailyVolume }: DarkPoolFeedProps) {
  const [showNote, setShowNote] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const summary: DarkPoolSummary = useMemo(
    () => generateDarkPoolActivity(ticker, currentPrice, dailyVolume),
    [ticker, currentPrice, dailyVolume],
  );

  const displayedFlows = showAll
    ? summary.recentFlows
    : summary.recentFlows.slice(0, 10);

  const netFlowColor =
    summary.netFlow > 0
      ? "text-green-500"
      : summary.netFlow < 0
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4 hover:border-border/60 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Dark Pool Activity: {ticker}</h3>
        <span className="text-xs text-muted-foreground">Simulated</span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-0.5">
          <p className="text-[10px] text-muted-foreground">Dark Pool %</p>
          <p className="font-mono tabular-nums text-sm font-medium">
            {summary.darkPoolPercent.toFixed(1)}%
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] text-muted-foreground">Total Volume</p>
          <p className="font-mono tabular-nums text-sm font-medium">
            {formatShares(summary.totalVolume)}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] text-muted-foreground">Net Flow</p>
          <p className={cn("font-mono tabular-nums text-sm font-medium", netFlowColor)}>
            {summary.netFlow >= 0 ? "+" : ""}
            {formatNotional(summary.netFlow)}
          </p>
        </div>
      </div>

      {/* Interpretation */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {summary.interpretation}
      </p>

      {/* Flows table */}
      <div className="border-t pt-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">Recent Trades</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-1 px-1 font-medium">Time</th>
                <th className="text-left py-1 px-1 font-medium">Side</th>
                <th className="text-right py-1 px-1 font-medium">Size</th>
                <th className="text-right py-1 px-1 font-medium">Price</th>
                <th className="text-right py-1 px-1 font-medium">Notional</th>
                <th className="text-left py-1 px-1 font-medium">Venue</th>
                <th className="text-left py-1 px-1 font-medium">Sig.</th>
              </tr>
            </thead>
            <tbody>
              {displayedFlows.map((flow, i) => (
                <tr
                  key={`${flow.ticker}-${flow.price}-${i}`}
                  className="border-b border-muted/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-1 px-1 font-mono tabular-nums text-muted-foreground">
                    {formatTime(flow.timestamp)}
                  </td>
                  <td className="py-1 px-1">
                    <span
                      className={cn(
                        "font-medium",
                        flow.side === "buy" ? "text-green-500" : "text-red-500",
                      )}
                    >
                      {flow.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-1 px-1 text-right font-mono tabular-nums">
                    {flow.size.toLocaleString()}
                  </td>
                  <td className="py-1 px-1 text-right font-mono tabular-nums">
                    ${flow.price.toFixed(2)}
                  </td>
                  <td className="py-1 px-1 text-right font-mono tabular-nums">
                    {formatNotional(flow.notional)}
                  </td>
                  <td className="py-1 px-1 text-muted-foreground">{flow.venue}</td>
                  <td className="py-1 px-1">
                    <SignificanceBadge significance={flow.significance} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {summary.recentFlows.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAll
              ? "Show less"
              : `Show all ${summary.recentFlows.length} trades`}
          </button>
        )}
      </div>

      {/* Largest trade highlight */}
      <div className="px-3 py-2 rounded-lg bg-muted/50 border">
        <p className="text-[10px] text-muted-foreground mb-1">Largest Block Trade</p>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={cn(
              "font-medium",
              summary.largestTrade.side === "buy"
                ? "text-green-500"
                : "text-red-500",
            )}
          >
            {summary.largestTrade.side.toUpperCase()}
          </span>
          <span className="font-mono tabular-nums font-medium">
            {summary.largestTrade.size.toLocaleString()} shares
          </span>
          <span className="text-muted-foreground">@</span>
          <span className="font-mono tabular-nums">
            ${summary.largestTrade.price.toFixed(2)}
          </span>
          <span className="text-muted-foreground">=</span>
          <span className="font-mono tabular-nums font-medium">
            {formatNotional(summary.largestTrade.notional)}
          </span>
          <span className="text-muted-foreground">{summary.largestTrade.venue}</span>
        </div>
      </div>

      {/* Educational note */}
      <div className="pt-2 border-t">
        <button
          onClick={() => setShowNote(!showNote)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <svg
            className={cn("w-3 h-3 transition-transform", showNote && "rotate-90")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          What are dark pools?
        </button>
        {showNote && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {summary.educationalNote}
          </p>
        )}
      </div>
    </div>
  );
}
