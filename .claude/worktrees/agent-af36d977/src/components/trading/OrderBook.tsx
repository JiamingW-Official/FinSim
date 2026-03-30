"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// mulberry32 PRNG — same family used elsewhere in FinSim
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface BookLevel {
  price: number;
  size: number;
  cumulative: number;
}

interface BookState {
  asks: BookLevel[]; // sorted descending (highest first)
  bids: BookLevel[]; // sorted descending (highest first)
  spreadBps: number;
}

function buildBook(spotPrice: number, spread: number, seed: number): BookState {
  const rng = mulberry32(seed);

  const asks: Omit<BookLevel, "cumulative">[] = [];
  for (let i = 1; i <= 10; i++) {
    const price = spotPrice + spread * i;
    const size = Math.round(500 + rng() * 5000);
    asks.push({ price, size });
  }

  const bids: Omit<BookLevel, "cumulative">[] = [];
  for (let i = 1; i <= 10; i++) {
    const price = spotPrice - spread * i;
    const size = Math.round(500 + rng() * 5000);
    bids.push({ price, size });
  }

  // Asks: sorted descending (highest ask at top)
  const sortedAsks = [...asks].sort((a, b) => b.price - a.price);
  // Bids: sorted descending (highest bid at top)
  const sortedBids = [...bids].sort((a, b) => b.price - a.price);

  // Compute cumulative sizes (cumulative from best to worst)
  // For asks: best ask = lowest price = last element after descending sort
  // Cumulative from worst (top of list) toward best (bottom) for the bar visual
  let cumAsk = 0;
  const asksWithCum: BookLevel[] = sortedAsks.map((l) => {
    cumAsk += l.size;
    return { ...l, cumulative: cumAsk };
  });

  let cumBid = 0;
  const bidsWithCum: BookLevel[] = sortedBids.map((l) => {
    cumBid += l.size;
    return { ...l, cumulative: cumBid };
  });

  const midPrice = spotPrice;
  const bestAsk = sortedAsks[sortedAsks.length - 1]?.price ?? midPrice;
  const bestBid = sortedBids[0]?.price ?? midPrice;
  const spreadAbs = bestAsk - bestBid;
  const spreadBps = midPrice > 0 ? Math.round((spreadAbs / midPrice) * 10000) : 0;

  return { asks: asksWithCum, bids: bidsWithCum, spreadBps };
}

function CumBar({
  size,
  maxCumulative,
  side,
}: {
  size: number;
  maxCumulative: number;
  side: "ask" | "bid";
}) {
  const pct = maxCumulative > 0 ? (size / maxCumulative) * 100 : 0;
  return (
    <div className="relative h-[10px] w-[100px] shrink-0 overflow-hidden rounded-[1px]">
      <div
        className={
          side === "ask"
            ? "absolute inset-y-0 left-0 bg-red-500/40"
            : "absolute inset-y-0 left-0 bg-green-500/40"
        }
        style={{
          width: `${pct}%`,
          transition: "width 400ms ease-out",
        }}
      />
    </div>
  );
}

interface OrderBookProps {
  spotPrice: number;
  spread?: number;
}

export function OrderBook({ spotPrice, spread: spreadProp = 0.01 }: OrderBookProps) {
  // Enforce minimum spread of 0.01% of spot price (realistic tick)
  const spread = Math.max(spreadProp, spotPrice * 0.0001);
  const initialSeed = Math.floor(spotPrice);
  const [seed, setSeed] = useState<number>(initialSeed);
  const [book, setBook] = useState<BookState>(() =>
    buildBook(spotPrice, spread, initialSeed)
  );

  const refresh = useCallback(
    (currentSeed: number) => {
      const nextSeed = (currentSeed + (Date.now() % 1000)) >>> 0;
      setSeed(nextSeed);
      setBook(buildBook(spotPrice, spread, nextSeed));
      return nextSeed;
    },
    [spotPrice, spread],
  );

  // Rebuild when spotPrice or spread changes (deterministic seed reset)
  useEffect(() => {
    const newSeed = Math.floor(spotPrice);
    setSeed(newSeed);
    setBook(buildBook(spotPrice, spread, newSeed));
  }, [spotPrice, spread]);

  // Refresh every 2 seconds
  useEffect(() => {
    let currentSeed = seed;
    const id = setInterval(() => {
      currentSeed = (currentSeed + (Date.now() % 1000)) >>> 0;
      setSeed(currentSeed);
      setBook(buildBook(spotPrice, spread, currentSeed));
    }, 2000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotPrice, spread]);

  void refresh; // suppress unused warning

  const maxAskCum = book.asks[0]?.cumulative ?? 1;
  const maxBidCum = book.bids[0]?.cumulative ?? 1;

  const totalBuy = book.bids.reduce((s, l) => s + l.size, 0);
  const totalSell = book.asks.reduce((s, l) => s + l.size, 0);
  const total = totalBuy + totalSell;
  const buyPct = total > 0 ? Math.round((totalBuy / total) * 100) : 50;
  const sellPct = 100 - buyPct;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold">Order Book</span>
        <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
          Spread: {book.spreadBps} bps
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-3 py-1 text-[9px] text-muted-foreground border-b border-border/50">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Depth</span>
      </div>

      {/* Asks — sorted descending, highest price at top */}
      <div className="divide-y divide-border/20">
        {book.asks.map((level, i) => (
          <div
            key={`ask-${i}`}
            className="grid grid-cols-3 items-center px-3 py-[3px] hover:bg-muted/30 transition-colors"
          >
            <span className="text-[11px] font-mono tabular-nums text-red-500">
              {level.price.toFixed(2)}
            </span>
            <span className="text-[11px] font-mono tabular-nums text-right text-muted-foreground">
              {level.size.toLocaleString()}
            </span>
            <div className="flex justify-end">
              <CumBar size={level.cumulative} maxCumulative={maxAskCum} side="ask" />
            </div>
          </div>
        ))}
      </div>

      {/* Midpoint */}
      <div className="flex items-center justify-center px-3 py-1.5 bg-muted/40 border-y border-border">
        <span className="text-sm font-mono tabular-nums font-semibold">
          ${spotPrice.toFixed(2)}
        </span>
      </div>

      {/* Bids — sorted descending, highest bid at top */}
      <div className="divide-y divide-border/20">
        {book.bids.map((level, i) => (
          <div
            key={`bid-${i}`}
            className="grid grid-cols-3 items-center px-3 py-[3px] hover:bg-muted/30 transition-colors"
          >
            <span className="text-[11px] font-mono tabular-nums text-green-500">
              {level.price.toFixed(2)}
            </span>
            <span className="text-[11px] font-mono tabular-nums text-right text-muted-foreground">
              {level.size.toLocaleString()}
            </span>
            <div className="flex justify-end">
              <CumBar size={level.cumulative} maxCumulative={maxBidCum} side="bid" />
            </div>
          </div>
        ))}
      </div>

      {/* Buy / Sell pressure ratio */}
      <div className="px-3 py-2 border-t border-border space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-green-500 font-medium">Buy: {buyPct}%</span>
          {buyPct > sellPct ? (
            <span className="font-semibold text-green-400">▲ Buy Pressure</span>
          ) : buyPct < sellPct ? (
            <span className="font-semibold text-red-400">▼ Sell Pressure</span>
          ) : (
            <span className="text-muted-foreground">Balanced</span>
          )}
          <span className="text-red-500 font-medium">Sell: {sellPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
          <div
            className="h-full bg-green-500/70 transition-all duration-500"
            style={{ width: `${buyPct}%` }}
          />
          <div
            className="h-full bg-red-500/70 transition-all duration-500"
            style={{ width: `${sellPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
