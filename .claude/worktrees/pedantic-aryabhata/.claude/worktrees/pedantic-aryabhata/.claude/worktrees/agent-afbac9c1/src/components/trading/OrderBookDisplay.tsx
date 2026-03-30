"use client";

import { useMemo } from "react";
import { generateOrderBook, type OrderBook, type OrderBookLevel } from "@/services/market-data/order-book";
import { cn } from "@/lib/utils";

interface OrderBookDisplayProps {
  ticker: string;
  currentPrice: number;
}

function formatPrice(price: number): string {
  return price.toFixed(2);
}

function formatSize(size: number): string {
  if (size >= 1000) return `${(size / 1000).toFixed(1)}K`;
  return size.toString();
}

function ImbalanceMeter({ imbalance }: { imbalance: number }) {
  // imbalance: -1 (all asks) to +1 (all bids)
  const pct = ((imbalance + 1) / 2) * 100; // 0-100 where 50 = balanced
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
          className="h-full bg-green-500/70 transition-all duration-300"
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
  side,
}: {
  level: OrderBookLevel;
  maxSize: number;
  side: "bid" | "ask";
}) {
  const barWidth = maxSize > 0 ? (level.size / maxSize) * 100 : 0;
  const isBid = side === "bid";

  return (
    <div className="relative flex items-center h-5 px-1 group">
      {/* Background bar */}
      <div
        className={cn(
          "absolute top-0 h-full transition-all duration-150",
          isBid
            ? "left-0 bg-green-500/10"
            : "right-0 bg-red-500/10",
        )}
        style={{ width: `${barWidth}%` }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center w-full gap-1 text-[10px] font-mono tabular-nums">
        {isBid ? (
          <>
            <span className="w-[52px] text-right text-muted-foreground">{formatSize(level.size)}</span>
            <span className="w-[36px] text-right text-muted-foreground/60">{level.orders}</span>
            <span className="flex-1 text-right text-green-500 font-medium">
              {formatPrice(level.price)}
            </span>
          </>
        ) : (
          <>
            <span className="flex-1 text-left text-red-500 font-medium">
              {formatPrice(level.price)}
            </span>
            <span className="w-[36px] text-left text-muted-foreground/60">{level.orders}</span>
            <span className="w-[52px] text-left text-muted-foreground">{formatSize(level.size)}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function OrderBookDisplay({ ticker, currentPrice }: OrderBookDisplayProps) {
  const book: OrderBook = useMemo(
    () => generateOrderBook(ticker, currentPrice, 15),
    [ticker, currentPrice],
  );

  const maxBidSize = useMemo(
    () => Math.max(...book.bids.map((l) => l.size)),
    [book.bids],
  );
  const maxAskSize = useMemo(
    () => Math.max(...book.asks.map((l) => l.size)),
    [book.asks],
  );
  const maxSize = Math.max(maxBidSize, maxAskSize);

  const totalBidVol = book.bids.reduce((s, l) => s + l.size, 0);
  const totalAskVol = book.asks.reduce((s, l) => s + l.size, 0);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden hover:border-border/60 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Order Book
        </span>
        <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
          Spread: ${book.spread.toFixed(2)} ({book.spreadPct.toFixed(3)}%)
        </span>
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
            <LevelRow key={`bid-${level.price}`} level={level} maxSize={maxSize} side="bid" />
          ))}
        </div>
        {/* Asks column */}
        <div className="w-1/2">
          {book.asks.map((level, i) => (
            <LevelRow key={`ask-${level.price}`} level={level} maxSize={maxSize} side="ask" />
          ))}
        </div>
      </div>

      {/* Footer totals */}
      <div className="flex items-center justify-between px-2 py-1 border-t border-border text-[9px] font-mono tabular-nums text-muted-foreground">
        <span>
          Bid Vol: <span className="text-green-500">{formatSize(totalBidVol)}</span>
        </span>
        <span className="text-muted-foreground/50">|</span>
        <span>
          Ask Vol: <span className="text-red-500">{formatSize(totalAskVol)}</span>
        </span>
      </div>
    </div>
  );
}
