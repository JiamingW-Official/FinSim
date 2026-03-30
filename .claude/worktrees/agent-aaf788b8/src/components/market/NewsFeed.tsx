"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { generateNewsSentiment } from "@/services/market/news-sentiment";

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function SentimentDot({ sentiment }: { sentiment: "positive" | "negative" | "neutral" }) {
  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full shrink-0",
        sentiment === "positive" && "bg-green-500",
        sentiment === "negative" && "bg-red-500",
        sentiment === "neutral" && "bg-muted-foreground/40"
      )}
    />
  );
}

function ImpactBadge({ impact }: { impact: "low" | "medium" | "high" }) {
  return (
    <span
      className={cn(
        "text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0",
        impact === "low" && "bg-muted text-muted-foreground",
        impact === "medium" && "bg-amber-500/10 text-amber-500",
        impact === "high" && "bg-red-500/10 text-red-500"
      )}
    >
      {impact}
    </span>
  );
}

interface NewsFeedProps {
  ticker: string;
}

export default function NewsFeed({ ticker }: NewsFeedProps) {
  const data = useMemo(() => generateNewsSentiment(ticker), [ticker]);

  const sentimentPct = ((data.aggregateSentiment + 1) / 2) * 100;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">News Feed</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Latest headlines and sentiment for {ticker}</p>
      </div>

      {/* Aggregate sentiment bar */}
      <div className="border border-border/60 rounded-lg bg-card p-3 hover:border-border/60 transition-colors">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Aggregate Sentiment</p>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-red-500 font-medium">Bearish</span>
          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                sentimentPct > 60 ? "bg-green-500" : sentimentPct < 40 ? "bg-red-500" : "bg-amber-500"
              )}
              style={{ width: `${sentimentPct}%` }}
            />
          </div>
          <span className="text-[11px] text-green-500 font-medium">Bullish</span>
        </div>
      </div>

      {/* News items */}
      <div className="space-y-1">
        {data.items.map((item) => (
          <div
            key={item.id}
            className="border border-border/40 rounded-lg bg-card p-3 flex items-start gap-3 hover:border-border/60 hover:bg-accent/10 transition-colors"
          >
            <SentimentDot sentiment={item.sentiment} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground leading-relaxed">{item.headline}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground">{item.source}</span>
                <span className="text-[10px] text-muted-foreground/50">&middot;</span>
                <span className="text-[10px] text-muted-foreground">{formatTimeAgo(item.timestamp)}</span>
              </div>
            </div>
            <ImpactBadge impact={item.impact} />
          </div>
        ))}
      </div>
    </div>
  );
}
