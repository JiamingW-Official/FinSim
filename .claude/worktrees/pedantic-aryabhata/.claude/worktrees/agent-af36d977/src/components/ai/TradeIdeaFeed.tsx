"use client";

import { useState, useMemo, useCallback } from "react";
import { RefreshCw, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useChartStore } from "@/stores/chart-store";
import { WATCHLIST_STOCKS, type OHLCVBar } from "@/types/market";
import {
  generateTradeIdeas,
  type TradeIdea,
} from "@/services/ai/idea-generator";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function convictionClass(c: TradeIdea["conviction"]): string {
  if (c === "high") return "text-green-500 bg-green-500/10 border-green-500/20";
  if (c === "medium") return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  return "text-muted-foreground bg-muted/40 border-border";
}

function directionClass(d: TradeIdea["direction"]): string {
  return d === "long"
    ? "text-green-500 bg-green-500/10 border-green-500/20"
    : "text-red-500 bg-red-500/10 border-red-500/20";
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Sub-component: individual idea card ─────────────────────────────────────

function IdeaCard({
  idea,
  onExecute,
}: {
  idea: TradeIdea;
  onExecute: (idea: TradeIdea) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-md bg-card overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <span className="font-mono text-sm font-semibold text-foreground w-12 shrink-0">
          {idea.ticker}
        </span>

        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border",
            directionClass(idea.direction),
          )}
        >
          {idea.direction === "long" ? "Long" : "Short"}
        </span>

        <span className="flex-1 text-[11px] text-muted-foreground truncate">
          {idea.setupName}
        </span>

        <span
          className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0",
            convictionClass(idea.conviction),
          )}
        >
          {idea.conviction.charAt(0).toUpperCase() + idea.conviction.slice(1)}
        </span>
      </div>

      {/* Levels row */}
      <div className="grid grid-cols-4 divide-x divide-border text-center py-1.5 bg-muted/20">
        <div className="px-1">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Entry</div>
          <div className="text-[11px] font-medium text-foreground">${fmt(idea.entry)}</div>
        </div>
        <div className="px-1">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Stop</div>
          <div className="text-[11px] font-medium text-red-400">${fmt(idea.stop)}</div>
        </div>
        <div className="px-1">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">T1</div>
          <div className="text-[11px] font-medium text-green-400">${fmt(idea.target1)}</div>
        </div>
        <div className="px-1">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">R:R</div>
          <div className="text-[11px] font-medium text-foreground">{idea.rrRatio.toFixed(1)}x</div>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        <button
          onClick={() => onExecute(idea)}
          className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Execute
          <ArrowRight className="h-3 w-3" />
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Why this trade
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Expandable catalysts */}
      {expanded && (
        <div className="px-3 pb-2 border-t border-border bg-muted/10">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-2 mb-1">
            Key signals
          </div>
          <ul className="space-y-0.5">
            {idea.catalysts.map((cat, i) => (
              <li
                key={i}
                className="flex items-center gap-1.5 text-[11px] text-foreground"
              >
                <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
                {cat}
              </li>
            ))}
          </ul>
          <div className="mt-1.5 flex gap-2 text-[10px] text-muted-foreground">
            <span>Timeframe: {idea.timeframe}</span>
            <span>T2: ${fmt(idea.target2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TradeIdeaFeedProps {
  /** Called when user clicks "Execute this trade" on an idea */
  onExecuteIdea?: (idea: TradeIdea) => void;
}

export function TradeIdeaFeed({ onExecuteIdea }: TradeIdeaFeedProps) {
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const currentTicker = useChartStore((s) => s.currentTicker);

  // Bump this to force re-generation on refresh
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Single tick is enough; generation is synchronous
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setIsRefreshing(false);
    }, 80);
  }, []);

  const tickers = WATCHLIST_STOCKS.map((s) => s.ticker);

  // Build a per-ticker data map using only visible bars for the current ticker
  // For other tickers we can only use allData (same underlying data set for sim)
  const marketData = useMemo<Record<string, OHLCVBar[]>>(() => {
    const visibleBars = allData.slice(0, revealedCount);
    if (visibleBars.length === 0) return {};

    // All tickers in the simulator share the same underlying price data;
    // seed each with the current visible bars re-tagged with their ticker.
    const map: Record<string, OHLCVBar[]> = {};
    for (const { ticker } of WATCHLIST_STOCKS) {
      map[ticker] = visibleBars.map((b) => ({ ...b, ticker }));
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allData, revealedCount, refreshKey]);

  const ideas = useMemo(
    () => generateTradeIdeas(tickers, marketData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [marketData],
  );

  const handleExecute = useCallback(
    (idea: TradeIdea) => {
      onExecuteIdea?.(idea);
    },
    [onExecuteIdea],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div>
          <div className="text-xs font-semibold text-foreground">Trade Ideas</div>
          <div className="text-[10px] text-muted-foreground">Top 5 setups by conviction</div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          title="Refresh analysis"
        >
          <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Ideas list */}
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-center gap-1">
            <p className="text-xs text-muted-foreground">No high-conviction setups found.</p>
            <p className="text-[10px] text-muted-foreground/60">
              Advance more bars or wait for clearer signals.
            </p>
          </div>
        ) : (
          ideas.map((idea) => (
            <IdeaCard key={`${idea.ticker}-${idea.direction}`} idea={idea} onExecute={handleExecute} />
          ))
        )}
      </div>

      {/* Footer note */}
      <div className="px-3 py-1.5 border-t border-border shrink-0">
        <p className="text-[9px] text-muted-foreground/50 leading-relaxed">
          Ideas are generated from technical signals only. Not financial advice.
        </p>
      </div>
    </div>
  );
}
