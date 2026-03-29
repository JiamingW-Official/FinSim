"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useChartStore } from "@/stores/chart-store";
import { generateNews, type NewsItem } from "@/services/market-data/news-generator";
import { detectHeadlineSentiment } from "@/services/market/news-sentiment";
import { WATCHLIST_STOCKS } from "@/types/market";
import { cn } from "@/lib/utils";

const MAX_HEADLINES = 10;

/** Small colored dot indicating headline sentiment */
function SentimentDot({ headline }: { headline: string }) {
  const label = detectHeadlineSentiment(headline);
  return (
    <span
      className={cn(
        "inline-block w-1.5 h-1.5 rounded-full shrink-0 mr-1.5 align-middle",
        label === "Bullish" && "bg-emerald-400",
        label === "Bearish" && "bg-red-400",
        label === "Neutral" && "bg-muted-foreground/50"
      )}
    />
  );
}

export function NewsTicker() {
  const [headlines, setHeadlines] = useState<NewsItem[]>([]);
  const prevRevealedRef = useRef<number>(0);

  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const getVisibleData = useMarketDataStore((s) => s.getVisibleData);
  const currentTicker = useChartStore((s) => s.currentTicker);

  useEffect(() => {
    // Only generate news when a new bar is revealed
    if (revealedCount <= prevRevealedRef.current) {
      prevRevealedRef.current = revealedCount;
      return;
    }
    prevRevealedRef.current = revealedCount;

    const visible = getVisibleData();
    if (visible.length < 2) return;

    const currentBar = visible[visible.length - 1];
    const previousBar = visible[visible.length - 2];

    const stockInfo = WATCHLIST_STOCKS.find((s) => s.ticker === currentTicker);
    const stockName = stockInfo?.name ?? currentTicker;

    const news = generateNews(currentBar, previousBar, stockName);
    if (news) {
      setHeadlines((prev) => [news, ...prev].slice(0, MAX_HEADLINES));
    }
  }, [revealedCount, getVisibleData, currentTicker]);

  if (headlines.length === 0) return null;

  // Compute scroll duration based on total content length for consistent speed
  const totalChars = headlines.reduce((sum, h) => sum + h.headline.length, 0);
  const scrollDuration = Math.max(20, Math.min(60, totalChars / 8));

  return (
    <div className="flex h-6 items-center gap-2 overflow-hidden border-t border-border/50 bg-card/50 px-3">
      <Newspaper className="h-3 w-3 shrink-0 text-muted-foreground/60" />
      <div className="relative flex-1 overflow-hidden">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: [0, -1600] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: scrollDuration,
              ease: "linear",
            },
          }}
        >
          {/* Duplicate for seamless loop */}
          {[...headlines, ...headlines].map((item, i) => (
            <span
              key={`${item.id}-${i}`}
              className={cn(
                "text-xs font-medium inline-flex items-center",
                item.sentiment === "bullish" && "text-emerald-400/80",
                item.sentiment === "bearish" && "text-red-400/80",
                item.sentiment === "neutral" && "text-muted-foreground/60"
              )}
            >
              <SentimentDot headline={item.headline} />
              {item.headline}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
