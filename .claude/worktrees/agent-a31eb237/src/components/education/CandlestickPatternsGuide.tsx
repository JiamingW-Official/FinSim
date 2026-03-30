"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CANDLESTICK_PATTERNS, type CandlestickPattern } from "@/data/candlestick-patterns";

type FilterType = "all" | "bullish" | "bearish" | "neutral";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Bullish", value: "bullish" },
  { label: "Bearish", value: "bearish" },
  { label: "Neutral", value: "neutral" },
];

function ReliabilityStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" className={i < rating ? "text-amber-400" : "text-muted/40"}>
          <polygon
            points="6,1 7.5,4.2 11,4.7 8.5,7.1 9.1,10.6 6,8.9 2.9,10.6 3.5,7.1 1,4.7 4.5,4.2"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
}

function PatternCard({ pattern }: { pattern: CandlestickPattern }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border/60 rounded-lg bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground leading-tight">{pattern.name}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{pattern.japaneseName}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full",
              pattern.type === "bullish" && "bg-green-500/10 text-green-500",
              pattern.type === "bearish" && "bg-red-500/10 text-red-500",
              pattern.type === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {pattern.type}
          </span>
          <ReliabilityStars rating={pattern.reliability} />
        </div>
      </div>

      {/* Candle visual */}
      <div className="flex items-center justify-center py-2 bg-muted/30 rounded-md">
        <svg width="50" height="50" viewBox="0 0 50 50" dangerouslySetInnerHTML={{ __html: pattern.svg }} />
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{pattern.description}</p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-primary font-medium text-left hover:underline underline-offset-2 transition-colors"
      >
        {expanded ? "Hide trading details" : "How to Trade"}
      </button>

      {expanded && (
        <div className="space-y-2.5 pt-1 border-t border-border/40">
          <div>
            <p className="text-[11px] font-medium text-foreground mb-0.5">Strategy</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{pattern.howToTrade}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-foreground mb-0.5">Confirmation</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{pattern.confirmation}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-foreground mb-0.5">Psychology</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{pattern.psychology}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CandlestickPatternsGuide() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all" ? CANDLESTICK_PATTERNS : CANDLESTICK_PATTERNS.filter((p) => p.type === filter);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Candlestick Patterns</h2>
        <p className="text-xs text-muted-foreground mt-1">Visual guide to Japanese candlestick patterns and their trading applications</p>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-md font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Pattern grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((pattern) => (
          <PatternCard key={pattern.name} pattern={pattern} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No patterns match the selected filter. Try &quot;All&quot; to see every pattern.</p>
      )}
    </div>
  );
}
