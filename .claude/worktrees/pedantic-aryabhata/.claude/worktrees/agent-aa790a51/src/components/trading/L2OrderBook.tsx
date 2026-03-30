"use client";

import { useMemo } from "react";
import { generateL2Book, type L2Level } from "@/services/market-data/level2-book";
import { cn } from "@/lib/utils";

interface L2OrderBookProps {
  ticker: string;
  midPrice: number;
  seed: number;
}

function fmt2(n: number): string {
  return n.toFixed(2);
}

function fmtSize(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// Horizontal depth bar — proportional to level size vs the max across all levels
function DepthBar({
  size,
  maxSize,
  side,
}: {
  size: number;
  maxSize: number;
  side: "bid" | "ask";
}) {
  const pct = maxSize > 0 ? (size / maxSize) * 100 : 0;
  return (
    <div
      className={cn(
        "absolute top-0 h-full opacity-20",
        side === "bid" ? "left-0 bg-green-500" : "right-0 bg-red-500",
      )}
      style={{ width: `${pct}%` }}
    />
  );
}

function BidRow({
  level,
  maxSize,
  isNbbo,
}: {
  level: L2Level;
  maxSize: number;
  isNbbo: boolean;
}) {
  return (
    <div className={cn("relative flex items-center h-[22px] px-1", isNbbo && "bg-green-500/5")}>
      <DepthBar size={level.size} maxSize={maxSize} side="bid" />
      <div className="relative z-10 flex w-full items-center gap-1 font-mono text-[10px] tabular-nums">
        {isNbbo && (
          <span className="shrink-0 rounded-sm bg-green-500/20 px-0.5 text-[8px] font-semibold uppercase text-green-500 leading-tight">
            NBBO
          </span>
        )}
        <span className="flex-1 text-right text-muted-foreground">
          {fmtSize(level.size)}
        </span>
        <span className="w-8 text-right text-muted-foreground/50 text-[9px]">
          {level.orders}
        </span>
        <span className="w-16 text-right font-semibold text-green-500">
          {fmt2(level.price)}
        </span>
      </div>
    </div>
  );
}

function AskRow({
  level,
  maxSize,
  isNbbo,
}: {
  level: L2Level;
  maxSize: number;
  isNbbo: boolean;
}) {
  return (
    <div className={cn("relative flex items-center h-[22px] px-1", isNbbo && "bg-red-500/5")}>
      <DepthBar size={level.size} maxSize={maxSize} side="ask" />
      <div className="relative z-10 flex w-full items-center gap-1 font-mono text-[10px] tabular-nums">
        <span className="w-16 text-left font-semibold text-red-500">
          {fmt2(level.price)}
        </span>
        <span className="w-8 text-left text-muted-foreground/50 text-[9px]">
          {level.orders}
        </span>
        <span className="flex-1 text-left text-muted-foreground">
          {fmtSize(level.size)}
        </span>
        {isNbbo && (
          <span className="shrink-0 rounded-sm bg-red-500/20 px-0.5 text-[8px] font-semibold uppercase text-red-500 leading-tight">
            NBBO
          </span>
        )}
      </div>
    </div>
  );
}

function ImbalanceBar({ imbalance }: { imbalance: number }) {
  const bidPct = ((imbalance + 1) / 2) * 100;
  const label =
    imbalance > 0.2
      ? "Buy pressure"
      : imbalance < -0.2
        ? "Sell pressure"
        : "Balanced";
  return (
    <div className="px-2 py-1 border-b border-border/50">
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">Bids</span>
        <span className="text-[9px] font-medium text-muted-foreground">{label}</span>
        <span className="text-[9px] text-muted-foreground">Asks</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-green-500/60 transition-all duration-300"
          style={{ width: `${bidPct}%` }}
        />
        <div
          className="h-full bg-red-500/60 transition-all duration-300"
          style={{ width: `${100 - bidPct}%` }}
        />
      </div>
    </div>
  );
}

export function L2OrderBook({ ticker, midPrice, seed }: L2OrderBookProps) {
  const book = useMemo(
    () => generateL2Book(ticker, midPrice, seed, 10),
    [ticker, midPrice, seed],
  );

  const maxBidSize = useMemo(
    () => Math.max(...book.bids.map((l) => l.size), 1),
    [book.bids],
  );
  const maxAskSize = useMemo(
    () => Math.max(...book.asks.map((l) => l.size), 1),
    [book.asks],
  );
  const maxSize = Math.max(maxBidSize, maxAskSize);

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Level 2
        </span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          Spread: ${book.spread.toFixed(2)}&nbsp;
          <span className="text-muted-foreground/60">({book.spreadPct.toFixed(3)}%)</span>
        </span>
      </div>

      {/* Imbalance meter */}
      <ImbalanceBar imbalance={book.imbalance} />

      {/* Column headers */}
      <div className="flex items-center border-b border-border/40 px-1 py-0.5">
        <div className="flex w-1/2 items-center gap-1 text-[9px] text-muted-foreground/50">
          <span className="flex-1 text-right">Size</span>
          <span className="w-8 text-right">Ord</span>
          <span className="w-16 text-right">Bid</span>
        </div>
        <div className="flex w-1/2 items-center gap-1 text-[9px] text-muted-foreground/50">
          <span className="w-16 text-left">Ask</span>
          <span className="w-8 text-left">Ord</span>
          <span className="flex-1 text-left">Size</span>
        </div>
      </div>

      {/* Bid + Ask rows side-by-side */}
      <div className="flex">
        <div className="w-1/2 border-r border-border/30">
          {book.bids.map((level, i) => (
            <BidRow key={`bid-${i}`} level={level} maxSize={maxSize} isNbbo={i === 0} />
          ))}
        </div>
        <div className="w-1/2">
          {book.asks.map((level, i) => (
            <AskRow key={`ask-${i}`} level={level} maxSize={maxSize} isNbbo={i === 0} />
          ))}
        </div>
      </div>

      {/* Mid price band */}
      <div className="flex items-center justify-center border-y border-border/40 bg-muted/30 py-0.5">
        <span className="font-mono text-[10px] font-semibold tabular-nums text-foreground">
          Mid&nbsp;
        </span>
        <span className="font-mono text-[11px] font-bold tabular-nums">
          ${fmt2(book.midPrice)}
        </span>
      </div>

      {/* Footer totals */}
      <div className="flex items-center justify-between px-2 py-1 font-mono text-[9px] tabular-nums text-muted-foreground">
        <span>
          Bid depth:{" "}
          <span className="font-semibold text-green-500">
            {fmtSize(book.totalBidDepth)}
          </span>
        </span>
        <span className="text-muted-foreground/40">|</span>
        <span>
          Ask depth:{" "}
          <span className="font-semibold text-red-500">
            {fmtSize(book.totalAskDepth)}
          </span>
        </span>
      </div>
    </div>
  );
}
