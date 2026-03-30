"use client";

import { useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { UnusualActivityItem } from "@/types/options";

// ── Props ─────────────────────────────────────────────────────────────────────

interface PremiumFlowProps {
  items: UnusualActivityItem[];
}

// ── Format helpers ────────────────────────────────────────────────────────────

function formatPremium(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function shortExpiry(expiry: string): string {
  const date = new Date(expiry + "T12:00:00Z");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

// ── Ticker tape item ──────────────────────────────────────────────────────────

interface TapeItem {
  id: string;
  ticker: string;
  strike: number;
  contractType: "C" | "P";
  expiry: string;
  premium: number;
  sentiment: "bullish" | "bearish" | "neutral";
}

function buildTapeItems(items: UnusualActivityItem[]): TapeItem[] {
  // Sort by premium descending — largest trades lead the tape
  return [...items]
    .sort((a, b) => b.premium - a.premium)
    .map((item) => ({
      id: item.id,
      ticker: item.ticker,
      strike: item.strike,
      contractType: item.type === "call" ? "C" : "P",
      expiry: item.expiry,
      premium: item.premium,
      sentiment: item.sentiment,
    }));
}

// ── Tape pill component ───────────────────────────────────────────────────────

function TapePill({ item }: { item: TapeItem }) {
  const isBullish = item.sentiment === "bullish";
  const isBearish = item.sentiment === "bearish";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10px] font-medium tabular-nums select-none",
        isBullish
          ? "border-green-500/25 bg-green-500/8 text-green-400"
          : isBearish
          ? "border-red-500/25 bg-red-500/8 text-red-400"
          : "border-border/50 bg-card text-muted-foreground",
      )}
    >
      {/* Ticker */}
      <span className="font-semibold not-italic">{item.ticker}</span>

      {/* Contract label */}
      <span className="opacity-80">
        ${item.strike}
        {item.contractType}
      </span>

      {/* Expiry */}
      <span className="opacity-60">{shortExpiry(item.expiry)}</span>

      {/* Premium */}
      <span
        className={cn(
          "font-semibold",
          isBullish ? "text-green-300" : isBearish ? "text-red-300" : "text-orange-400",
        )}
      >
        {formatPremium(item.premium)}
      </span>

      {/* Sentiment label */}
      <span
        className={cn(
          "rounded px-1 text-[8.5px] font-semibold uppercase tracking-wide",
          isBullish
            ? "bg-green-500/15 text-green-400"
            : isBearish
            ? "bg-red-500/15 text-red-400"
            : "bg-muted/40 text-muted-foreground",
        )}
      >
        {isBullish ? "BULLISH" : isBearish ? "BEARISH" : "NEUTRAL"}
      </span>
    </span>
  );
}

// ── CSS keyframe injection (once) ─────────────────────────────────────────────

let injected = false;

function injectScrollStyle() {
  if (injected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes premiumFlowScroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .premium-flow-track {
      animation: premiumFlowScroll var(--pf-duration, 40s) linear infinite;
      will-change: transform;
    }
    .premium-flow-track:hover {
      animation-play-state: paused;
    }
  `;
  document.head.appendChild(style);
  injected = true;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PremiumFlow({ items }: PremiumFlowProps) {
  const tapeItems = useMemo(() => buildTapeItems(items), [items]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectScrollStyle();
  }, []);

  // Adjust speed by count: more items → faster scroll to keep density similar
  // Duration = base 40s, adjusted by item count (baseline 10 items)
  const duration = useMemo(() => {
    const base = 40;
    const adjusted = base * Math.sqrt(tapeItems.length / 10);
    return Math.max(20, Math.min(80, adjusted));
  }, [tapeItems.length]);

  if (tapeItems.length === 0) {
    return (
      <div className="flex items-center justify-center px-3 py-2.5 text-[10px] text-muted-foreground">
        No large flow detected
      </div>
    );
  }

  // Duplicate items so the scroll loops seamlessly
  const doubled = [...tapeItems, ...tapeItems];

  return (
    <div className="border-b border-border/50 bg-card/20">
      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground">
          Live Premium Flow
        </p>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
            Bullish
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
            Bearish
          </span>
          <span className="opacity-50">Hover to pause</span>
        </div>
      </div>

      {/* Scrolling tape */}
      <div className="overflow-hidden pb-2">
        <div
          ref={trackRef}
          className="premium-flow-track flex gap-2 px-3"
          style={{ "--pf-duration": `${duration}s` } as React.CSSProperties}
        >
          {doubled.map((item, idx) => (
            <TapePill key={`${item.id}-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
