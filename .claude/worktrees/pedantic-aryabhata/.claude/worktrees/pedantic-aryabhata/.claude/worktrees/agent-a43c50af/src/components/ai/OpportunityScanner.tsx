"use client";

import { useMemo, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketDataStore } from "@/stores/market-data-store";
import { WATCHLIST_STOCKS, type OHLCVBar } from "@/types/market";
import {
  scanAllTickers,
  generateTradeIdeas,
  type TickerScanResult,
  type TradeIdea,
} from "@/services/ai/idea-generator";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score > 30) return "text-green-500";
  if (score < -30) return "text-red-500";
  return "text-muted-foreground";
}

function scoreBgClass(score: number): string {
  if (score > 30) return "bg-green-500/10";
  if (score < -30) return "bg-red-500/10";
  return "";
}

function scoreBarFill(score: number): { width: string; color: string } {
  const pct = Math.min(Math.abs(score), 100);
  const color =
    score > 30 ? "bg-green-500" : score < -30 ? "bg-red-500" : "bg-muted-foreground/40";
  return { width: `${pct}%`, color };
}

function directionLabel(d: TickerScanResult["direction"]): string {
  if (d === "bullish") return "Bull";
  if (d === "bearish") return "Bear";
  return "Neutral";
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function ScannerRow({
  result,
  onSelect,
}: {
  result: TickerScanResult;
  onSelect: (ticker: string) => void;
}) {
  const { ticker, score, direction } = result;
  const bar = scoreBarFill(score);
  const isNeutral = direction === "neutral";

  return (
    <tr
      onClick={() => onSelect(ticker)}
      className={cn(
        "cursor-pointer hover:bg-muted/30 transition-colors",
        scoreBgClass(score),
      )}
    >
      {/* Ticker */}
      <td className="px-2 py-1.5">
        <span className="font-mono text-xs font-semibold text-foreground">{ticker}</span>
      </td>

      {/* Score bar */}
      <td className="px-2 py-1.5 w-28">
        <div className="relative h-1.5 w-full rounded-full bg-border overflow-hidden">
          <div
            className={cn("absolute h-full rounded-full transition-all", bar.color)}
            style={{ width: bar.width }}
          />
        </div>
      </td>

      {/* Numeric score */}
      <td className={cn("px-2 py-1.5 text-right text-xs font-medium tabular-nums", scoreColor(score))}>
        {score > 0 ? "+" : ""}
        {score}
      </td>

      {/* Direction label */}
      <td className="px-2 py-1.5 text-right">
        <span
          className={cn(
            "text-[10px] font-semibold",
            direction === "bullish"
              ? "text-green-500"
              : direction === "bearish"
              ? "text-red-500"
              : "text-muted-foreground/60",
          )}
        >
          {directionLabel(direction)}
        </span>
      </td>

      {/* Top signal */}
      <td className="px-2 py-1.5 max-w-0">
        <span className="block truncate text-[10px] text-muted-foreground">
          {isNeutral ? "--" : result.topSignals[0] ?? "--"}
        </span>
      </td>
    </tr>
  );
}

// ─── Detail panel shown when a ticker is selected ────────────────────────────

function IdeaDetail({
  idea,
  onClose,
}: {
  idea: TradeIdea | null;
  onClose: () => void;
}) {
  if (!idea) {
    return (
      <div className="flex flex-col items-center justify-center h-24 gap-1">
        <p className="text-xs text-muted-foreground">No high-conviction setup for this ticker.</p>
        <button
          onClick={onClose}
          className="text-[10px] text-muted-foreground hover:text-foreground underline"
        >
          Back to scanner
        </button>
      </div>
    );
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-sm font-bold text-foreground">{idea.ticker}</span>
          <span
            className={cn(
              "ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded border",
              idea.direction === "long"
                ? "text-green-500 bg-green-500/10 border-green-500/20"
                : "text-red-500 bg-red-500/10 border-red-500/20",
            )}
          >
            {idea.direction === "long" ? "Long" : "Short"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[10px] text-muted-foreground hover:text-foreground underline"
        >
          Back
        </button>
      </div>

      {/* Setup name + conviction */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground font-medium">{idea.setupName}</span>
        <span
          className={cn(
            "text-[9px] font-semibold px-1 py-0.5 rounded border",
            idea.conviction === "high"
              ? "text-green-500 bg-green-500/10 border-green-500/20"
              : idea.conviction === "medium"
              ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
              : "text-muted-foreground border-border",
          )}
        >
          {idea.conviction.charAt(0).toUpperCase() + idea.conviction.slice(1)} conviction
        </span>
      </div>

      {/* Levels grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded border border-border p-1.5">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Entry</div>
          <div className="font-medium text-foreground">${fmt(idea.entry)}</div>
        </div>
        <div className="rounded border border-red-500/20 bg-red-500/5 p-1.5">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Stop</div>
          <div className="font-medium text-red-400">${fmt(idea.stop)}</div>
        </div>
        <div className="rounded border border-green-500/20 bg-green-500/5 p-1.5">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Target 1</div>
          <div className="font-medium text-green-400">${fmt(idea.target1)}</div>
        </div>
        <div className="rounded border border-green-500/20 bg-green-500/5 p-1.5">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Target 2</div>
          <div className="font-medium text-green-400">${fmt(idea.target2)}</div>
        </div>
      </div>

      {/* R:R + timeframe */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>R:R — <strong className="text-foreground">{idea.rrRatio.toFixed(1)}x</strong></span>
        <span>Timeframe — <strong className="text-foreground">{idea.timeframe}</strong></span>
      </div>

      {/* Catalysts */}
      <div>
        <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">
          Key signals
        </div>
        <ul className="space-y-0.5">
          {idea.catalysts.map((cat, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[11px] text-foreground">
              <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
              {cat}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OpportunityScanner() {
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSelectedTicker(null);
      setRefreshKey((k) => k + 1);
      setIsRefreshing(false);
    }, 80);
  }, []);

  const tickers = WATCHLIST_STOCKS.map((s) => s.ticker);

  const marketData = useMemo<Record<string, OHLCVBar[]>>(() => {
    const visible = allData.slice(0, revealedCount);
    if (visible.length === 0) return {};
    const map: Record<string, OHLCVBar[]> = {};
    for (const { ticker } of WATCHLIST_STOCKS) {
      map[ticker] = visible.map((b) => ({ ...b, ticker }));
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allData, revealedCount, refreshKey]);

  const results = useMemo(
    () => scanAllTickers(tickers, marketData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [marketData],
  );

  // When a ticker row is clicked, derive its trade idea (if any)
  const selectedIdea = useMemo<TradeIdea | null>(() => {
    if (!selectedTicker) return null;
    const ideas = generateTradeIdeas([selectedTicker], marketData);
    return ideas[0] ?? null;
  }, [selectedTicker, marketData]);

  if (selectedTicker !== null) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
          <div className="text-xs font-semibold text-foreground">
            {selectedTicker} — Trade Idea
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <IdeaDetail idea={selectedIdea} onClose={() => setSelectedTicker(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div>
          <div className="text-xs font-semibold text-foreground">Opportunity Scanner</div>
          <div className="text-[10px] text-muted-foreground">All tickers sorted by signal strength</div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          title="Refresh scan"
        >
          <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
          Scan
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-3 py-1 border-b border-border bg-muted/10 shrink-0">
        <span className="flex items-center gap-1 text-[9px] text-green-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
          Bullish (score &gt; 30)
        </span>
        <span className="flex items-center gap-1 text-[9px] text-red-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
          Bearish (score &lt; -30)
        </span>
        <span className="flex items-center gap-1 text-[9px] text-muted-foreground/60">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
          Neutral
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 ? (
          <div className="flex items-center justify-center h-16">
            <p className="text-xs text-muted-foreground">Advance more bars to see signals.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border">
                <th className="px-2 py-1 text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
                  Ticker
                </th>
                <th className="px-2 py-1 text-[9px] font-medium text-muted-foreground uppercase tracking-wide w-28">
                  Strength
                </th>
                <th className="px-2 py-1 text-[9px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                  Score
                </th>
                <th className="px-2 py-1 text-[9px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                  Bias
                </th>
                <th className="px-2 py-1 text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
                  Top Signal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {results.map((r) => (
                <ScannerRow key={r.ticker} result={r} onSelect={setSelectedTicker} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-3 py-1.5 border-t border-border shrink-0">
        <p className="text-[9px] text-muted-foreground/50">
          Click a row to open the trade idea for that ticker.
        </p>
      </div>
    </div>
  );
}
