"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { UnusualActivityItem, OptionContract, OptionChainExpiry } from "@/types/options";

// Silence unused import warning — OptionChainExpiry is re-exported for consumers
type _OptionChainExpiry = OptionChainExpiry;

// ── Props ─────────────────────────────────────────────────────────────────────

interface UnusualActivityFeedProps {
  items: UnusualActivityItem[];
  onSelectContract: (contract: OptionContract) => void;
}

// ── Helper: build a synthetic OptionContract from an activity item ────────────

function itemToContract(item: UnusualActivityItem): OptionContract {
  return {
    ticker: item.ticker,
    type: item.type,
    strike: item.strike,
    expiry: item.expiry,
    daysToExpiry: item.dte,
    style: "american",
    bid: item.bid,
    ask: item.ask,
    mid: (item.bid + item.ask) / 2,
    last: item.price,
    iv: 0.3,
    volume: item.size,
    openInterest: item.size * 3,
    greeks: {
      delta: 0,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
      vanna: 0,
      charm: 0,
      vomma: 0,
      speed: 0,
    },
    inTheMoney: false,
  };
}

// ── Format helpers ────────────────────────────────────────────────────────────

function formatPremium(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function relTime(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ── Filter state types ────────────────────────────────────────────────────────

type TypeFilter = "both" | "call" | "put";
type SentimentFilter = "all" | "bullish" | "bearish";
type OrderTypeFilter = "all" | "floor" | "sweep" | "normal";

// ── Toggle button (matches ChainFiltersBar style) ─────────────────────────────

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-[10px] font-medium transition-colors",
        active
          ? "border border-orange-500/30 bg-orange-500/15 text-orange-400"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

// ── Activity icon (simple SVG, no external dep) ───────────────────────────────

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function UnusualActivityFeed({
  items,
  onSelectContract,
}: UnusualActivityFeedProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("both");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderTypeFilter>("all");

  // Apply filters
  const filtered = items.filter((item) => {
    if (typeFilter !== "both" && item.type !== typeFilter) return false;
    if (sentimentFilter !== "all" && item.sentiment !== sentimentFilter) return false;
    if (orderTypeFilter !== "all" && item.orderType !== orderTypeFilter) return false;
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      {/* Filter bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/50 px-3 py-1.5">
        {/* Type filter */}
        <div className="flex items-center gap-0.5 rounded-md border border-border/50 bg-card p-0.5">
          {(["both", "call", "put"] as TypeFilter[]).map((v) => (
            <ToggleButton
              key={v}
              active={typeFilter === v}
              onClick={() => setTypeFilter(v)}
            >
              {v === "both" ? "Both" : v === "call" ? "Call" : "Put"}
            </ToggleButton>
          ))}
        </div>

        {/* Sentiment filter */}
        <div className="flex items-center gap-0.5 rounded-md border border-border/50 bg-card p-0.5">
          {(["all", "bullish", "bearish"] as SentimentFilter[]).map((v) => (
            <ToggleButton
              key={v}
              active={sentimentFilter === v}
              onClick={() => setSentimentFilter(v)}
            >
              {v === "all" ? "All Sentiment" : v === "bullish" ? "Bullish" : "Bearish"}
            </ToggleButton>
          ))}
        </div>

        {/* Order type filter */}
        <div className="flex items-center gap-0.5 rounded-md border border-border/50 bg-card p-0.5">
          {(["all", "floor", "sweep", "normal"] as OrderTypeFilter[]).map((v) => (
            <ToggleButton
              key={v}
              active={orderTypeFilter === v}
              onClick={() => setOrderTypeFilter(v)}
            >
              {v === "all"
                ? "All Types"
                : v === "floor"
                ? "Floor"
                : v === "sweep"
                ? "Sweep"
                : "Normal"}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ActivityIcon className="h-8 w-8 opacity-30" />
            <span className="text-[11px]">No unusual activity detected</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border/50">
                {[
                  "Time",
                  "Exp",
                  "DTE",
                  "Strike",
                  "C/P",
                  "Side",
                  "Sentiment",
                  "Type",
                  "Size",
                  "Price",
                  "Premium",
                  "Bid",
                  "Ask",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-2 py-1.5 text-left text-[9px] font-semibold text-muted-foreground/70"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, rowIdx) => {
                const isEven = rowIdx % 2 === 0;
                const isBullish = item.sentiment === "bullish";
                const isBearish = item.sentiment === "bearish";

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectContract(itemToContract(item))}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-accent/20",
                      isEven ? "bg-card/30" : "",
                    )}
                  >
                    {/* Time */}
                    <td className="px-2 py-1.5 text-[10px] text-muted-foreground">
                      {relTime(item.timestamp)}
                    </td>

                    {/* Exp */}
                    <td className="px-2 py-1.5 text-[10px] tabular-nums text-muted-foreground">
                      {item.expiry.slice(5)}
                    </td>

                    {/* DTE */}
                    <td className="px-2 py-1.5 text-[10px] tabular-nums text-muted-foreground">
                      {item.dte}D
                    </td>

                    {/* Strike */}
                    <td className="px-2 py-1.5 text-[10px] tabular-nums">
                      ${item.strike}
                    </td>

                    {/* C/P */}
                    <td className="px-2 py-1.5 text-[10px] font-semibold tabular-nums">
                      <span
                        className={
                          item.type === "call" ? "text-green-400" : "text-red-400"
                        }
                      >
                        {item.type === "call" ? "C" : "P"}
                      </span>
                    </td>

                    {/* Side */}
                    <td className="px-2 py-1.5 text-[10px] font-medium">
                      {item.side === "ask" ? (
                        <span className="text-orange-400">Ask</span>
                      ) : (
                        <span className="text-muted-foreground">Bid</span>
                      )}
                    </td>

                    {/* Sentiment badge */}
                    <td className="px-2 py-1.5 text-[10px]">
                      {isBullish ? (
                        <span className="text-green-400">
                          <span className="mr-0.5 text-[8px]">●</span>Bullish
                        </span>
                      ) : isBearish ? (
                        <span className="text-red-400">
                          <span className="mr-0.5 text-[8px]">●</span>Bearish
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          <span className="mr-0.5 text-[8px]">●</span>Neutral
                        </span>
                      )}
                    </td>

                    {/* Order type badge */}
                    <td className="px-2 py-1.5 text-[10px]">
                      {item.orderType === "floor" ? (
                        <span className="rounded bg-amber-500/15 px-1 py-0.5 text-[9px] font-medium text-amber-400">
                          Floor
                        </span>
                      ) : item.orderType === "sweep" ? (
                        <span className="rounded bg-blue-500/15 px-1 py-0.5 text-[9px] font-medium text-blue-400">
                          Sweep
                        </span>
                      ) : (
                        <span className="rounded bg-muted/30 px-1 py-0.5 text-[9px] font-medium text-muted-foreground">
                          Normal
                        </span>
                      )}
                    </td>

                    {/* Size */}
                    <td
                      className={cn(
                        "px-2 py-1.5 text-[10px] tabular-nums",
                        isBullish
                          ? "text-green-400"
                          : isBearish
                          ? "text-red-400"
                          : "text-foreground",
                      )}
                    >
                      {item.size.toLocaleString()}
                    </td>

                    {/* Price */}
                    <td className="px-2 py-1.5 text-[10px] tabular-nums">
                      ${item.price.toFixed(2)}
                    </td>

                    {/* Premium */}
                    <td className="px-2 py-1.5 text-[10px] font-medium tabular-nums text-orange-400">
                      {formatPremium(item.premium)}
                    </td>

                    {/* Bid */}
                    <td className="px-2 py-1.5 text-[10px] tabular-nums text-muted-foreground">
                      {item.bid.toFixed(2)}
                    </td>

                    {/* Ask */}
                    <td className="px-2 py-1.5 text-[10px] tabular-nums text-muted-foreground">
                      {item.ask.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
