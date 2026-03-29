"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  generateOptionsFlow,
  type OptionsFlowItem,
} from "@/services/market/options-flow";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatPremium(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SentimentBadge({ sentiment }: { sentiment: OptionsFlowItem["sentiment"] }) {
  const styles = {
    bullish: "bg-emerald-500/5 text-emerald-500",
    bearish: "bg-red-500/5 text-red-500",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "text-xs px-1.5 py-0.5 rounded font-medium",
        styles[sentiment],
      )}
    >
      {sentiment}
    </span>
  );
}

function SignificanceBadge({
  significance,
}: {
  significance: OptionsFlowItem["significance"];
}) {
  const styles = {
    sweep: "bg-amber-500/10 text-amber-500",
    block: "bg-primary/10 text-primary",
    split: "bg-primary/10 text-primary",
    routine: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "text-xs px-1.5 py-0.5 rounded font-medium",
        styles[significance],
      )}
    >
      {significance}
    </span>
  );
}

// ─── Net Sentiment Meter ─────────────────────────────────────────────────────

function NetSentimentMeter({ flows }: { flows: OptionsFlowItem[] }) {
  const { bullish, bearish } = useMemo(() => {
    let bullishPremium = 0;
    let bearishPremium = 0;
    for (const f of flows) {
      const totalPremium = f.premium * f.size * 100;
      if (f.sentiment === "bullish") bullishPremium += totalPremium;
      else if (f.sentiment === "bearish") bearishPremium += totalPremium;
    }
    return { bullish: bullishPremium, bearish: bearishPremium };
  }, [flows]);

  const total = bullish + bearish;
  const bullishPct = total > 0 ? (bullish / total) * 100 : 50;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Net Sentiment</span>
        <span>
          {bullishPct >= 55
            ? "Bullish"
            : bullishPct <= 45
              ? "Bearish"
              : "Neutral"}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted flex overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${bullishPct}%` }}
        />
        <div
          className="h-full bg-red-500 transition-all duration-300"
          style={{ width: `${100 - bullishPct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs font-mono tabular-nums">
        <span className="text-emerald-500">{formatPremium(bullish)}</span>
        <span className="text-red-500">{formatPremium(bearish)}</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface OptionsFlowPanelProps {
  ticker: string;
  currentPrice: number;
}

export function OptionsFlowPanel({ ticker, currentPrice }: OptionsFlowPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<OptionsFlowItem | null>(
    null,
  );

  const iv = 0.3; // Default IV for generation
  const flows = useMemo(
    () => generateOptionsFlow(ticker, currentPrice, iv),
    [ticker, currentPrice],
  );

  const displayedFlows = showAll ? flows : flows.slice(0, 12);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Options Flow: {ticker}</h3>
        <span className="text-xs text-muted-foreground">Simulated</span>
      </div>

      {/* Net sentiment meter */}
      <NetSentimentMeter flows={flows} />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Total Trades</p>
          <p className="font-mono tabular-nums text-sm font-medium">
            {flows.length}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Sweeps</p>
          <p className="font-mono tabular-nums text-sm font-medium text-amber-500">
            {flows.filter((f) => f.significance === "sweep").length}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Blocks</p>
          <p className="font-mono tabular-nums text-sm font-medium text-primary">
            {flows.filter((f) => f.significance === "block").length}
          </p>
        </div>
      </div>

      {/* Flow table */}
      <div className="border-t pt-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-1 px-1 font-medium">Time</th>
                <th className="text-left py-1 px-1 font-medium">Type</th>
                <th className="text-right py-1 px-1 font-medium">Strike</th>
                <th className="text-left py-1 px-1 font-medium">Expiry</th>
                <th className="text-left py-1 px-1 font-medium">Side</th>
                <th className="text-right py-1 px-1 font-medium">Size</th>
                <th className="text-right py-1 px-1 font-medium">Prem</th>
                <th className="text-right py-1 px-1 font-medium">IV</th>
                <th className="text-left py-1 px-1 font-medium">Sent.</th>
                <th className="text-left py-1 px-1 font-medium">Sig.</th>
              </tr>
            </thead>
            <tbody>
              {displayedFlows.map((flow, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-muted/50 cursor-pointer transition-colors",
                    flow.sentiment === "bullish"
                      ? "hover:bg-emerald-500/5"
                      : flow.sentiment === "bearish"
                        ? "hover:bg-red-500/5"
                        : "hover:bg-muted/30",
                    selectedFlow === flow && "bg-muted/40",
                  )}
                  onClick={() =>
                    setSelectedFlow(selectedFlow === flow ? null : flow)
                  }
                >
                  <td className="py-1 px-1 font-mono tabular-nums text-muted-foreground">
                    {formatTime(flow.timestamp)}
                  </td>
                  <td className="py-1 px-1">
                    <span
                      className={cn(
                        "font-medium",
                        flow.type === "call"
                          ? "text-emerald-500"
                          : "text-red-500",
                      )}
                    >
                      {flow.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-1 px-1 text-right font-mono tabular-nums">
                    ${flow.strike.toFixed(0)}
                  </td>
                  <td className="py-1 px-1 text-muted-foreground">
                    {flow.expiry.slice(5)}
                  </td>
                  <td className="py-1 px-1">
                    <span
                      className={cn(
                        "font-medium",
                        flow.side === "buy"
                          ? "text-emerald-500"
                          : "text-red-500",
                      )}
                    >
                      {flow.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-1 px-1 text-right font-mono tabular-nums">
                    {flow.size.toLocaleString()}
                  </td>
                  <td className="py-1 px-1 text-right font-mono tabular-nums">
                    ${flow.premium.toFixed(2)}
                  </td>
                  <td className="py-1 px-1 text-right font-mono tabular-nums">
                    {(flow.iv * 100).toFixed(0)}%
                  </td>
                  <td className="py-1 px-1">
                    <SentimentBadge sentiment={flow.sentiment} />
                  </td>
                  <td className="py-1 px-1">
                    <SignificanceBadge significance={flow.significance} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {flows.length > 12 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAll ? "Show less" : `Show all ${flows.length} trades`}
          </button>
        )}
      </div>

      {/* Selected flow educational note */}
      {selectedFlow && (
        <div className="px-3 py-2 rounded-lg bg-muted/50 border">
          <p className="text-xs text-muted-foreground mb-1">
            Trade Insight
          </p>
          <p className="text-xs leading-relaxed">
            {selectedFlow.educationalNote}
          </p>
        </div>
      )}
    </div>
  );
}
