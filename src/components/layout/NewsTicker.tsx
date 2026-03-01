"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper } from "lucide-react";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useChartStore } from "@/stores/chart-store";
import { generateNews, type NewsItem } from "@/services/market-data/news-generator";
import { WATCHLIST_STOCKS } from "@/types/market";
import { cn } from "@/lib/utils";

const MAX_HEADLINES = 10;

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

  return (
    <div className="flex h-6 items-center gap-2 overflow-hidden border-t border-border/50 bg-card/50 px-3">
      <Newspaper className="h-3 w-3 shrink-0 text-muted-foreground/60" />
      <div className="relative flex-1 overflow-hidden">
        <motion.div
          className="flex gap-6 whitespace-nowrap"
          animate={{ x: [0, -1500] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {/* Duplicate for seamless loop */}
          {[...headlines, ...headlines].map((item, i) => (
            <span
              key={`${item.id}-${i}`}
              className={cn(
                "text-[10px] font-medium",
                item.sentiment === "bullish" && "text-emerald-400/80",
                item.sentiment === "bearish" && "text-red-400/80",
                item.sentiment === "neutral" && "text-muted-foreground/60",
              )}
            >
              {item.headline}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
