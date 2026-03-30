"use client";

import { useEffect, useRef, useMemo } from "react";
import { generateTickSequence } from "@/services/market-data/tick-generator";
import { cn } from "@/lib/utils";

export interface SaleEntry {
  time: string;       // "HH:MM:SS" formatted
  price: number;
  size: number;
  side: "buy" | "sell";
  exchange: string;
  uptick: boolean;    // true = green (price >= previous trade price)
}

interface TimeAndSalesProps {
  ticker: string;
  barOpen: number;
  barClose: number;
  barHigh: number;
  barLow: number;
  barVolume: number;
  barTimestamp: number; // ms unix
  sigma: number;
  revealedCount: number; // used to derive a unique seed per bar advance
  maxRows?: number;
}

// Deterministic seed from bar attributes
function barSeed(ticker: string, timestamp: number, revealedCount: number): number {
  let h = ((timestamp / 1000) | 0) * 2654435761;
  for (let i = 0; i < ticker.length; i++) {
    h = (Math.imul(h, 31) + ticker.charCodeAt(i)) | 0;
  }
  h = (Math.imul(h, 31) + revealedCount) | 0;
  return h >>> 0;
}

function lcg(s: number): number {
  return ((s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
}

// Format timestamp as HH:MM:SS (market hours, ET offset approx)
function fmtTime(tsMs: number, tickIndex: number, totalTicks: number): string {
  // Map tick index within a 15-min bar (900s)
  const barStart = new Date(tsMs);
  const secondOffset = Math.floor((tickIndex / Math.max(totalTicks - 1, 1)) * 900);
  const t = new Date(barStart.getTime() + secondOffset * 1000);
  const hh = String(t.getUTCHours()).padStart(2, "0");
  const mm = String(t.getUTCMinutes()).padStart(2, "0");
  const ss = String(t.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function Row({ entry, isLatest }: { entry: SaleEntry; isLatest: boolean }) {
  const color = entry.uptick ? "text-green-500" : "text-red-400";
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-[3px] font-mono text-[10px] tabular-nums transition-colors",
        isLatest && "bg-muted/40",
      )}
    >
      <span className="w-[52px] text-muted-foreground/60">{entry.time}</span>
      <span className={cn("w-[52px] text-right font-semibold", color)}>
        {entry.price.toFixed(2)}
      </span>
      <span className="w-[48px] text-right text-muted-foreground">
        {entry.size >= 1000 ? `${(entry.size / 1000).toFixed(1)}K` : entry.size.toString()}
      </span>
      <span
        className={cn(
          "w-[28px] text-center text-[9px] font-semibold uppercase",
          entry.side === "buy" ? "text-green-500/80" : "text-red-400/80",
        )}
      >
        {entry.side === "buy" ? "B" : "S"}
      </span>
      <span className="flex-1 text-right text-[9px] text-muted-foreground/50 tracking-tight">
        {entry.exchange}
      </span>
    </div>
  );
}

export function TimeAndSales({
  ticker,
  barOpen,
  barClose,
  barHigh,
  barLow,
  barVolume,
  barTimestamp,
  sigma,
  revealedCount,
  maxRows = 30,
}: TimeAndSalesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate a deterministic sequence of trades for the current bar
  const trades = useMemo<SaleEntry[]>(() => {
    const seed = barSeed(ticker, barTimestamp, revealedCount);
    const TICK_COUNT = 20;

    const ticks = generateTickSequence(
      ticker,
      barOpen,
      barClose,
      barHigh,
      barLow,
      barVolume,
      sigma,
      seed,
      TICK_COUNT,
    );

    const entries: SaleEntry[] = [];
    let prevPrice = barOpen;

    ticks.forEach((tick, i) => {
      // Determine side: buyer-initiated if trade at ask, seller-initiated at bid
      const sideRand = lcg(seed + i * 17 + 99);
      // Slight bias toward the trending side
      const buyBias = barClose >= barOpen ? 0.55 : 0.45;
      const side: "buy" | "sell" = sideRand < buyBias ? "buy" : "sell";

      // Use bid or ask price depending on side
      const tradePrice = side === "buy" ? tick.ask : tick.bid;
      const uptick = tradePrice >= prevPrice;
      prevPrice = tradePrice;

      entries.push({
        time: fmtTime(barTimestamp, i, TICK_COUNT),
        price: tradePrice,
        size: tick.size,
        side,
        exchange: tick.exchange,
        uptick,
      });
    });

    // Return last maxRows, newest first (reverse for display)
    return entries.reverse().slice(0, maxRows);
  }, [ticker, barOpen, barClose, barHigh, barLow, barVolume, barTimestamp, sigma, revealedCount, maxRows]);

  // Auto-scroll to top (newest entry) when trades update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [trades]);

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Time &amp; Sales
        </span>
        <span className="text-[9px] text-muted-foreground/60">
          {ticker} &middot; {trades.length} prints
        </span>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-1 border-b border-border/40 px-2 py-0.5 text-[9px] text-muted-foreground/50 font-mono">
        <span className="w-[52px]">Time</span>
        <span className="w-[52px] text-right">Price</span>
        <span className="w-[48px] text-right">Size</span>
        <span className="w-[28px] text-center">Sd</span>
        <span className="flex-1 text-right">Exch</span>
      </div>

      {/* Scrollable trade list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto divide-y divide-border/30"
        style={{ maxHeight: 220 }}
      >
        {trades.length === 0 ? (
          <div className="px-2 py-4 text-center text-[11px] text-muted-foreground">
            No trades yet
          </div>
        ) : (
          trades.map((entry, i) => (
            <Row key={i} entry={entry} isLatest={i === 0} />
          ))
        )}
      </div>

      {/* Summary footer */}
      {trades.length > 0 && (
        <div className="flex items-center justify-between border-t border-border px-2 py-1 font-mono text-[9px] tabular-nums text-muted-foreground">
          <span>
            Buys:{" "}
            <span className="text-green-500 font-semibold">
              {trades.filter((t) => t.side === "buy").length}
            </span>
          </span>
          <span className="text-muted-foreground/40">|</span>
          <span>
            Sells:{" "}
            <span className="text-red-400 font-semibold">
              {trades.filter((t) => t.side === "sell").length}
            </span>
          </span>
          <span className="text-muted-foreground/40">|</span>
          <span>
            Last:{" "}
            <span className="font-semibold text-foreground">
              ${trades[0]?.price.toFixed(2)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
