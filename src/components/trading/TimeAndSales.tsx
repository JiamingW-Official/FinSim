"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TimeAndSalesProps {
  ticker: string;
  currentPrice: number;
}

interface TradeEntry {
  id: number;
  time: string;
  price: number;
  size: number;
  direction: "up" | "down";
}

// Mulberry32 seeded PRNG
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function formatPrice(price: number): string {
  return price.toFixed(2);
}

function formatSize(size: number): string {
  if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`;
  if (size >= 1000) return `${(size / 1000).toFixed(1)}K`;
  return size.toString();
}

export function TimeAndSales({ ticker, currentPrice }: TimeAndSalesProps) {
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [largeTradeCount, setLargeTradeCount] = useState(0);
  const [buyVolume, setBuyVolume] = useState(0);
  const [sellVolume, setSellVolume] = useState(0);

  const counterRef = useRef(0);
  const rngSeedRef = useRef(hashString(ticker + Math.floor(Date.now() / 1000)));

  // Reset when ticker changes
  useEffect(() => {
    setTrades([]);
    setTotalVolume(0);
    setLargeTradeCount(0);
    setBuyVolume(0);
    setSellVolume(0);
    counterRef.current = 0;
    rngSeedRef.current = hashString(ticker + Math.floor(Date.now() / 1000));
  }, [ticker]);

  const generateTrade = useCallback((): TradeEntry => {
    const rng = mulberry32(rngSeedRef.current + counterRef.current * 6983);
    rng(); // advance state

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Price jitter around current price
    const priceDelta = (rng() - 0.5) * currentPrice * 0.001;
    const price = parseFloat((currentPrice + priceDelta).toFixed(2));

    // Size: mostly small, sometimes large
    const r = rng();
    let size: number;
    if (r > 0.98) {
      // Large block trade > 10K shares
      size = Math.round(10000 + rng() * 40000);
    } else if (r > 0.9) {
      size = Math.round(1000 + rng() * 5000);
    } else {
      size = Math.round(100 + rng() * 900);
    }

    const direction: "up" | "down" = rng() > 0.5 ? "up" : "down";

    counterRef.current += 1;

    return {
      id: counterRef.current,
      time: timeStr,
      price,
      size,
      direction,
    };
  }, [currentPrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      const trade = generateTrade();
      setTrades((prev) => [trade, ...prev].slice(0, 50));
      setTotalVolume((v) => v + trade.size);
      if (trade.size > 10000) {
        setLargeTradeCount((c) => c + 1);
      }
      if (trade.direction === "up") {
        setBuyVolume((v) => v + trade.size);
      } else {
        setSellVolume((v) => v + trade.size);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [generateTrade]);

  const totalVolBuySell = buyVolume + sellVolume;
  const buyRatio = totalVolBuySell > 0 ? ((buyVolume / totalVolBuySell) * 100).toFixed(0) : "50";
  const sellRatio = totalVolBuySell > 0 ? ((sellVolume / totalVolBuySell) * 100).toFixed(0) : "50";

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground">
          Time &amp; Sales
        </span>
        <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
          {ticker}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 px-2 py-1 border-b border-border/50 text-[11px] font-mono tabular-nums">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground/70">Vol:</span>
          <span className="text-foreground font-medium">{formatSize(totalVolume)}</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground/70">Large:</span>
          <span className="text-amber-400 font-medium">{largeTradeCount}</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1">
          <span className="text-emerald-500">{buyRatio}%</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-red-500">{sellRatio}%</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-1 px-2 py-0.5 border-b border-border/30 text-[11px] text-muted-foreground/60">
        <span className="w-[56px]">Time</span>
        <span className="flex-1 text-right">Price</span>
        <span className="w-[52px] text-right">Size</span>
        <span className="w-[12px] text-right" />
      </div>

      {/* Scrolling tape */}
      <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
        {trades.length === 0 && (
          <div className="px-2 py-3 text-xs text-muted-foreground text-center">
            Waiting for trades...
          </div>
        )}
        {trades.map((entry) => {
          const isLarge = entry.size > 10000;
          return (
            <div
              key={entry.id}
              className={cn(
                "flex items-center gap-1 px-2 h-[18px] text-xs font-mono tabular-nums border-b border-border/10",
                isLarge && "bg-amber-500/8 border-amber-500/20",
              )}
            >
              <span className="w-[56px] text-[11px] text-muted-foreground/60 shrink-0">
                {entry.time}
              </span>
              <span
                className={cn(
                  "flex-1 text-right font-medium",
                  entry.direction === "up" ? "text-emerald-500" : "text-red-500",
                )}
              >
                {formatPrice(entry.price)}
              </span>
              <span
                className={cn(
                  "w-[52px] text-right",
                  isLarge ? "text-amber-400 font-bold" : "text-muted-foreground",
                )}
              >
                {formatSize(entry.size)}
              </span>
              <span
                className={cn(
                  "w-[12px] text-[11px] text-right",
                  entry.direction === "up" ? "text-emerald-500" : "text-red-500",
                )}
              >
                {entry.direction === "up" ? "B" : "S"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
