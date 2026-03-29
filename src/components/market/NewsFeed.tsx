"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateNewsSentiment,
  type NewsItem,
  type NewsCategory,
  type NewsSentimentLabel,
} from "@/services/market/news-sentiment";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SentimentDot({ sentiment }: { sentiment: "positive" | "negative" | "neutral" }) {
  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full shrink-0 mt-1",
        sentiment === "positive" && "bg-green-500",
        sentiment === "negative" && "bg-red-500",
        sentiment === "neutral" && "bg-muted-foreground/40"
      )}
    />
  );
}

function SentimentBadge({ label }: { label: NewsSentimentLabel }) {
  return (
    <span
      className={cn(
        "text-xs font-semibold px-1.5 py-0.5 rounded shrink-0",
        label === "Bullish" && "bg-green-500/15 text-green-500",
        label === "Bearish" && "bg-red-500/15 text-red-500",
        label === "Neutral" && "bg-muted/60 text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

function ImpactBadge({ impact }: { impact: "low" | "medium" | "high" }) {
  return (
    <span
      className={cn(
        "text-xs font-medium px-1.5 py-0.5 rounded shrink-0",
        impact === "low" && "bg-muted text-muted-foreground",
        impact === "medium" && "bg-amber-500/10 text-amber-500",
        impact === "high" && "bg-red-500/5 text-red-500"
      )}
    >
      {impact}
    </span>
  );
}

function CategoryPill({
  category,
  active,
  onClick,
}: {
  category: NewsCategory | "All";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-muted-foreground border-border/20 hover:border-border hover:text-foreground"
      )}
    >
      {category}
    </button>
  );
}

// ─── News Detail Drawer ───────────────────────────────────────────────────────

function NewsDetailDrawer({
  item,
  onClose,
}: {
  item: NewsItem;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-40 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        key="drawer"
        className="fixed right-0 top-0 bottom-0 z-50 w-[420px] max-w-[95vw] bg-background border-l border-border flex flex-col overflow-hidden"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 border-b border-border/60">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <SentimentBadge label={item.sentimentLabel} />
              <span className="text-xs text-muted-foreground font-medium">
                {item.category}
              </span>
              <ImpactBadge impact={item.impact} />
            </div>
            <h3 className="text-sm font-semibold text-foreground leading-snug">{item.headline}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-muted-foreground font-medium">{item.source}</span>
              <span className="text-[11px] text-muted-foreground/50">&middot;</span>
              <span className="text-[11px] text-muted-foreground">{formatTimeAgo(item.timestamp)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Article body */}
          <div className="space-y-3">
            {item.bodyParagraphs.map((para, i) => (
              <p key={i} className="text-[13px] text-foreground/90 leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Impact Analysis */}
          <div className="border border-primary/20 rounded-lg bg-primary/5 p-3">
            <p className="text-xs font-semibold text-primary mb-1.5">
              Impact Analysis
            </p>
            <p className="text-[12px] text-foreground/80 leading-relaxed">{item.impactAnalysis}</p>
          </div>

          {/* Related Tickers */}
          {item.relatedTickers.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Related Tickers
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.relatedTickers.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-semibold px-2 py-1 rounded bg-accent/30 text-foreground border border-border/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/60">
          <button className="w-full flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />
            View full article on {item.source}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main NewsFeed ────────────────────────────────────────────────────────────

const CATEGORIES: Array<NewsCategory | "All"> = ["All", "Earnings", "Fed", "Economy", "Sector", "Company"];

interface NewsFeedProps {
  ticker: string;
}

export default function NewsFeed({ ticker }: NewsFeedProps) {
  const data = useMemo(() => generateNewsSentiment(ticker), [ticker]);
  const [activeCategory, setActiveCategory] = useState<NewsCategory | "All">("All");
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  const sentimentPct = ((data.aggregateSentiment + 1) / 2) * 100;

  const filteredItems = useMemo(
    () =>
      activeCategory === "All"
        ? data.items
        : data.items.filter((item) => item.category === activeCategory),
    [data.items, activeCategory]
  );

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">News Feed</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Latest headlines and sentiment for {ticker}</p>
      </div>

      {/* Aggregate sentiment bar */}
      <div className="border border-border/60 rounded-lg bg-card p-3">
        <p className="text-xs text-muted-foreground mb-1.5">Aggregate Sentiment</p>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-red-500 font-medium">Bearish</span>
          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-colors",
                sentimentPct > 60 ? "bg-green-500" : sentimentPct < 40 ? "bg-red-500" : "bg-amber-500"
              )}
              style={{ width: `${sentimentPct}%` }}
            />
          </div>
          <span className="text-[11px] text-green-500 font-medium">Bullish</span>
        </div>
      </div>

      {/* Trending Topics */}
      {data.trendingTickers.length > 0 && (
        <div className="border border-border/60 rounded-lg bg-card p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold text-muted-foreground">Trending</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.trendingTickers.map(({ ticker: t, mentions }) => (
              <button
                key={t}
                onClick={() => {
                  /* ticker chip click — could trigger navigation */
                }}
                className={cn(
                  "flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border transition-colors",
                  t === ticker
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/20 border-border/20 text-foreground hover:border-border hover:bg-muted/30"
                )}
              >
                {t}
                <span className="text-xs text-muted-foreground font-normal">{mentions}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat}
            category={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      {/* News items */}
      <div className="space-y-1">
        {filteredItems.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No articles in this category.</p>
        )}
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="w-full text-left border border-border/20 rounded-lg bg-card p-3 flex items-start gap-3 hover:border-border/60 hover:bg-muted/10 transition-colors"
          >
            <SentimentDot sentiment={item.sentiment} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground leading-relaxed">{item.headline}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground">{item.source}</span>
                <span className="text-xs text-muted-foreground/50">&middot;</span>
                <span className="text-xs text-muted-foreground">{formatTimeAgo(item.timestamp)}</span>
                <span className="text-xs text-muted-foreground/50">&middot;</span>
                <span className="text-xs text-muted-foreground/70 font-medium">{item.category}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <SentimentBadge label={item.sentimentLabel} />
              <ImpactBadge impact={item.impact} />
            </div>
          </button>
        ))}
      </div>

      {/* Detail Drawer */}
      {selectedItem && (
        <NewsDetailDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
