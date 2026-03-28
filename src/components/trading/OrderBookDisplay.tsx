"use client";

import { useState, useEffect, useMemo } from "react";
import { generateOrderBook, type OrderBook, type OrderBookLevel } from "@/services/market-data/order-book";
import { cn } from "@/lib/utils";

interface OrderBookDisplayProps {
  ticker: string;
  currentPrice: number;
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

interface TapeEntry {
  id: number;
  time: string;
  price: number;
  size: number;
  direction: "up" | "down";
}

function formatPrice(price: number): string {
  return price.toFixed(2);
}

function formatSize(size: number): string {
  if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`;
  if (size >= 1000) return `${(size / 1000).toFixed(1)}K`;
  return size.toString();
}

function spreadBps(spread: number, midpoint: number): number {
  if (midpoint === 0) return 0;
  return Math.round((spread / midpoint) * 10000);
}

function ImbalanceMeter({ imbalance }: { imbalance: number }) {
  const pct = ((imbalance + 1) / 2) * 100;
  const label =
    imbalance > 0.15
      ? "Buy pressure"
      : imbalance < -0.15
        ? "Sell pressure"
        : "Balanced";

  return (
    <div className="px-2 py-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] text-muted-foreground">Bids</span>
        <span className="text-[9px] text-muted-foreground font-medium">{label}</span>
        <span className="text-[9px] text-muted-foreground">Asks</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
        <div
          className="h-full bg-emerald-500/70 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
        <div
          className="h-full bg-red-500/70 transition-all duration-300"
          style={{ width: `${100 - pct}%` }}
        />
      </div>
    </div>
  );
}

function LevelRow({
  level,
  maxSize,
  maxCumulative,
  side,
}: {
  level: OrderBookLevel;
  maxSize: number;
  maxCumulative: number;
  side: "bid" | "ask";
}) {
  const sizeBarWidth = maxSize > 0 ? (level.size / maxSize) * 100 : 0;
  const depthBarWidth = maxCumulative > 0 ? (level.total / maxCumulative) * 100 : 0;
  const isBid = side === "bid";
  const isLarge = level.size > 1000;

  return (
    <div className={cn("relative flex items-center h-5 px-1 group", isLarge && "ring-1 ring-inset ring-amber-500/30")}>
      {/* Depth background bar (cumulative) */}
      <div
        className={cn(
          "absolute top-0 h-full transition-all duration-300",
          isBid ? "left-0 bg-emerald-500/5" : "right-0 bg-red-500/5",
        )}
        style={{ width: `${depthBarWidth}%` }}
      />
      {/* Size bar */}
      <div
        className={cn(
          "absolute top-0 h-full transition-all duration-150",
          isBid ? "left-0 bg-emerald-500/15" : "right-0 bg-red-500/15",
        )}
        style={{ width: `${sizeBarWidth}%` }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center w-full gap-1 text-[10px] font-mono tabular-nums">
        {isBid ? (
          <>
            <span className={cn("w-[52px] text-right", isLarge ? "text-amber-400 font-semibold" : "text-muted-foreground")}>
              {formatSize(level.size)}
            </span>
            <span className="w-[36px] text-right text-muted-foreground/60">{level.orders}</span>
            <span className={cn("flex-1 text-right font-medium", isLarge ? "text-emerald-400" : "text-emerald-500")}>
              {formatPrice(level.price)}
            </span>
          </>
        ) : (
          <>
            <span className={cn("flex-1 text-left font-medium", isLarge ? "text-red-400" : "text-red-500")}>
              {formatPrice(level.price)}
            </span>
            <span className="w-[36px] text-left text-muted-foreground/60">{level.orders}</span>
            <span className={cn("w-[52px] text-left", isLarge ? "text-amber-400 font-semibold" : "text-muted-foreground")}>
              {formatSize(level.size)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function generateTape(ticker: string, midpoint: number, seed: number): TapeEntry[] {
  const rng = mulberry32(hashString(ticker + seed));
  const entries: TapeEntry[] = [];
  const now = Date.now();

  for (let i = 0; i < 10; i++) {
    const offset = i * (1000 + rng() * 2000);
    const ts = new Date(now - offset);
    const timeStr = ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const priceDelta = (rng() - 0.5) * midpoint * 0.002;
    const price = parseFloat((midpoint + priceDelta).toFixed(2));
    const size = Math.round(100 + rng() * 2000);
    const direction: "up" | "down" = rng() > 0.5 ? "up" : "down";
    entries.push({ id: i, time: timeStr, price, size, direction });
  }
  return entries;
}

export function OrderBookDisplay({ ticker, currentPrice }: OrderBookDisplayProps) {
  const [timeBucket, setTimeBucket] = useState(() => Math.floor(Date.now() / 2000));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeBucket(Math.floor(Date.now() / 2000));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const book: OrderBook = useMemo(() => {
    // Use timeBucket as part of price to get new data each interval
    const seed = mulberry32(hashString(ticker + timeBucket));
    const jitter = (seed() - 0.5) * currentPrice * 0.0005;
    return generateOrderBook(ticker, currentPrice + jitter, 12);
  }, [ticker, currentPrice, timeBucket]);

  const tape = useMemo(
    () => generateTape(ticker, book.midpoint, timeBucket),
    [ticker, book.midpoint, timeBucket],
  );

  const maxBidSize = useMemo(() => Math.max(...book.bids.map((l) => l.size)), [book.bids]);
  const maxAskSize = useMemo(() => Math.max(...book.asks.map((l) => l.size)), [book.asks]);
  const maxSize = Math.max(maxBidSize, maxAskSize);
  const maxBidCumulative = book.bids.length > 0 ? book.bids[book.bids.length - 1].total : 1;
  const maxAskCumulative = book.asks.length > 0 ? book.asks[book.asks.length - 1].total : 1;
  const maxCumulative = Math.max(maxBidCumulative, maxAskCumulative);

  const totalBidVol = book.bids.reduce((s, l) => s + l.size, 0);
  const totalAskVol = book.asks.reduce((s, l) => s + l.size, 0);
  const bps = spreadBps(book.spread, book.midpoint);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Level 2 Order Book
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
            {bps} bps
          </span>
          <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
            Spread: ${book.spread.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Mid price */}
      <div className="flex items-center justify-center py-1.5 border-b border-border bg-muted/20">
        <span className="text-sm font-semibold font-mono tabular-nums text-foreground">
          {formatPrice(book.midpoint)}
        </span>
        <span className="ml-2 text-[9px] text-muted-foreground uppercase tracking-wider">Mid</span>
      </div>

      {/* Imbalance meter */}
      <ImbalanceMeter imbalance={book.imbalance} />

      {/* Column headers */}
      <div className="flex px-1 py-0.5 border-b border-border/50">
        <div className="flex items-center w-1/2 gap-1 text-[9px] text-muted-foreground/60">
          <span className="w-[52px] text-right">Size</span>
          <span className="w-[36px] text-right">Ord</span>
          <span className="flex-1 text-right">Bid</span>
        </div>
        <div className="flex items-center w-1/2 gap-1 text-[9px] text-muted-foreground/60">
          <span className="flex-1 text-left">Ask</span>
          <span className="w-[36px] text-left">Ord</span>
          <span className="w-[52px] text-left">Size</span>
        </div>
      </div>

      {/* Order book levels */}
      <div className="flex">
        {/* Bids column */}
        <div className="w-1/2 border-r border-border/30">
          {book.bids.map((level, i) => (
            <LevelRow key={i} level={level} maxSize={maxSize} maxCumulative={maxCumulative} side="bid" />
          ))}
        </div>
        {/* Asks column */}
        <div className="w-1/2">
          {book.asks.map((level, i) => (
            <LevelRow key={i} level={level} maxSize={maxSize} maxCumulative={maxCumulative} side="ask" />
          ))}
        </div>
      </div>

      {/* Footer totals */}
      <div className="flex items-center justify-between px-2 py-1 border-t border-border text-[9px] font-mono tabular-nums text-muted-foreground">
        <span>
          Bid Vol: <span className="text-emerald-500">{formatSize(totalBidVol)}</span>
        </span>
        <span className="text-muted-foreground/50">|</span>
        <span>
          Ask Vol: <span className="text-red-500">{formatSize(totalAskVol)}</span>
        </span>
      </div>

      {/* Tape section */}
      <div className="border-t border-border">
        <div className="px-2 py-1 border-b border-border/50">
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            Last Trades
          </span>
        </div>
        <div className="overflow-hidden">
          {tape.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-center gap-1 px-2 h-4 text-[9px] font-mono tabular-nums",
                entry.direction === "up" ? "text-emerald-500" : "text-red-500",
                entry.size > 1000 && "font-semibold bg-amber-500/5",
              )}
            >
              <span className="w-[56px] text-muted-foreground/60 text-[8px]">{entry.time}</span>
              <span className="w-[48px] text-right">{formatPrice(entry.price)}</span>
              <span className="flex-1 text-right">{formatSize(entry.size)}</span>
              <span className="text-[8px]">{entry.direction === "up" ? "B" : "S"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
