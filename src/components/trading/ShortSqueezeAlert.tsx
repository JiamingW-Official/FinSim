"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FUNDAMENTALS } from "@/data/fundamentals";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { formatCurrency, cn } from "@/lib/utils";
import { Zap, Info, TrendingUp } from "lucide-react";

// Historical squeeze examples for educational context
const SQUEEZE_EXAMPLES = [
  {
    ticker: "GME",
    year: 2021,
    shortFloat: 140,
    priceRun: "~1,800%",
    description:
      "GameStop surged from ~$5 to $483 in weeks as retail traders on Reddit's WallStreetBets forced short sellers to cover, amplifying the rally.",
  },
  {
    ticker: "TSLA",
    year: 2020,
    shortFloat: 25,
    priceRun: "~500%",
    description:
      "Tesla was one of the most-shorted stocks through 2019–2020. As deliveries beat expectations the price surged, forcing massive short covering.",
  },
  {
    ticker: "VW",
    year: 2008,
    shortFloat: 12,
    priceRun: "~400%",
    description:
      "Volkswagen briefly became the world's most valuable company when Porsche revealed it held ~74% of VW shares, leaving almost no float for shorts to cover.",
  },
];

interface ShortSqueezeAlertProps {
  className?: string;
}

export function ShortSqueezeAlert({ className }: ShortSqueezeAlertProps) {
  const currentTicker = useChartStore((s) => s.currentTicker);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const fundamentals = FUNDAMENTALS[currentTicker];

  // Price momentum: compare last 5 bars
  const priceRising = useMemo(() => {
    if (allData.length < 5 || revealedCount < 5) return false;
    const recent = allData.slice(Math.max(0, revealedCount - 5), revealedCount);
    if (recent.length < 2) return false;
    return recent[recent.length - 1].close > recent[0].close;
  }, [allData, revealedCount]);

  const currentPrice = allData.length > 0 && revealedCount > 0
    ? allData[revealedCount - 1].close
    : 0;

  const shortFloat = fundamentals?.shortFloat ?? 0;
  // avgVolume30d is in millions; days-to-cover = short shares / avg daily volume
  const avgVolume = (fundamentals?.avgVolume30d ?? 1) * 1_000_000;
  const sharesOutstanding = (fundamentals?.sharesOutstanding ?? 1) * 1_000_000_000;
  const shortShares = sharesOutstanding * (shortFloat / 100);
  const daysToCover = avgVolume > 0 ? shortShares / avgVolume : 0;

  // Squeeze conditions
  const isHighShortFloat = shortFloat >= 20;
  const isPotentialSqueeze = isHighShortFloat && priceRising;
  const isExtremeShort = shortFloat >= 35;

  if (!fundamentals || shortFloat < 5) return null;

  return (
    <AnimatePresence>
      {(isPotentialSqueeze || isHighShortFloat) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={cn("rounded-md border p-3 space-y-2.5", className,
            isPotentialSqueeze
              ? "border-warning/50 bg-warning/5"
              : "border-border/20 bg-muted/20",
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-1.5">
            {isPotentialSqueeze ? (
              <Zap className="h-3.5 w-3.5 text-warning" />
            ) : (
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span
              className={cn(
                "text-xs font-semibold",
                isPotentialSqueeze ? "text-warning" : "text-muted-foreground",
              )}
            >
              {isPotentialSqueeze ? "Potential Short Squeeze" : "Short Interest Monitor"}
            </span>
            {isExtremeShort && priceRising && (
              <span className="ml-auto rounded bg-loss px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                EXTREME
              </span>
            )}
          </div>

          {/* Status line */}
          {isPotentialSqueeze && (
            <div className="text-xs text-warning leading-snug">
              {currentTicker} has {shortFloat.toFixed(1)}% short float and price is rising —
              short sellers may be forced to cover, amplifying upward momentum.
            </div>
          )}

          {/* Metrics */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Short Float</span>
              <span
                className={cn(
                  "tabular-nums font-semibold",
                  shortFloat >= 35 ? "text-loss"
                  : shortFloat >= 20 ? "text-warning"
                  : "text-muted-foreground",
                )}
              >
                {shortFloat.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Short Shares</span>
              <span className="tabular-nums">
                {shortShares >= 1_000_000
                  ? `${(shortShares / 1_000_000).toFixed(1)}M`
                  : `${Math.round(shortShares).toLocaleString()}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Days to Cover</span>
              <span
                className={cn(
                  "tabular-nums font-medium",
                  daysToCover >= 5 ? "text-loss" : daysToCover >= 2 ? "text-warning" : "",
                )}
              >
                {daysToCover.toFixed(1)} days
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Price Direction</span>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  priceRising ? "text-profit" : "text-loss",
                )}
              >
                <TrendingUp
                  className={cn("h-3 w-3", !priceRising && "rotate-180")}
                />
                {priceRising ? "Rising" : "Falling"}
              </span>
            </div>
            {currentPrice > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Price</span>
                <span className="tabular-nums">{formatCurrency(currentPrice)}</span>
              </div>
            )}
          </div>

          {/* Short float visual bar */}
          <div>
            <div className="mb-0.5 text-[11px] text-muted-foreground">Short Float vs 20% threshold</div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    shortFloat >= 35 ? "#ef4444" : shortFloat >= 20 ? "#f59e0b" : "#10b981",
                  width: `${Math.min(100, shortFloat)}%`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, shortFloat)}%` }}
                transition={{ duration: 0.5 }}
              />
              {/* 20% threshold marker */}
              <div
                className="absolute top-0 h-full w-px bg-warning/80"
                style={{ left: "20%" }}
              />
            </div>
            <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground/60">
              <span>0%</span>
              <span className="text-warning">20% threshold</span>
              <span className="text-loss">35%+ extreme</span>
            </div>
          </div>

          {/* Days-to-cover interpretation */}
          <div className="rounded-md bg-muted/40 px-2 py-1.5 text-xs text-muted-foreground leading-snug">
            <span className="font-medium text-foreground">Days-to-cover: </span>
            {daysToCover.toFixed(1)} days — estimated time for all short sellers to close positions
            at current average daily volume. Higher = more squeeze risk.
          </div>

          {/* Historical examples (educational) */}
          {isPotentialSqueeze && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground">Historical Squeeze Examples</div>
              {SQUEEZE_EXAMPLES.slice(0, 2).map((ex) => (
                <div
                  key={ex.ticker}
                  className="rounded-md border border-border/20 bg-muted/30 p-2 text-xs"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-warning">
                      {ex.ticker} ({ex.year})
                    </span>
                    <span className="text-profit font-semibold">{ex.priceRun}</span>
                  </div>
                  <p className="text-muted-foreground leading-snug">{ex.description}</p>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground/60 italic">
                Past squeezes are educational only and do not predict future outcomes.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
