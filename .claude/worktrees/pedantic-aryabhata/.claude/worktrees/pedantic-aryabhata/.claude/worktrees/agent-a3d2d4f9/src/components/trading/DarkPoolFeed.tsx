"use client";

import { useState, useEffect, useMemo } from "react";
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

const TICKERS = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "META", "SPY", "QQQ"] as const;
type Ticker = (typeof TICKERS)[number];

// Realistic reference prices per ticker
const TICKER_PRICES: Record<Ticker, number> = {
  AAPL: 213,
  TSLA: 175,
  NVDA: 875,
  MSFT: 415,
  AMZN: 195,
  META: 530,
  SPY: 512,
  QQQ: 440,
};

type TradeType = "block trade" | "dark pool print" | "sweep" | "institution cross";
type Sentiment = "bullish" | "bearish" | "neutral";

interface DarkPoolTrade {
  id: string;
  ticker: Ticker;
  size: number;       // shares
  price: number;
  type: TradeType;
  sentiment: Sentiment;
  timeAgo: string;    // "X min ago"
  notionalM: number;  // size * price / 1_000_000
}

const TRADE_TYPES: TradeType[] = [
  "block trade",
  "dark pool print",
  "sweep",
  "institution cross",
];

function deriveSentiment(
  rng: () => number,
  size: number,
  type: TradeType
): Sentiment {
  // Sweeps tend bullish, large blocks tend institutional (neutral/bullish),
  // overall randomized with slight bias based on size
  const roll = rng();
  if (type === "sweep") {
    return roll < 0.55 ? "bullish" : roll < 0.75 ? "bearish" : "neutral";
  }
  if (size > 2_000_000) {
    return roll < 0.45 ? "bullish" : roll < 0.65 ? "bearish" : "neutral";
  }
  return roll < 0.35 ? "bullish" : roll < 0.55 ? "bearish" : "neutral";
}

function generateTrades(seed: number): DarkPoolTrade[] {
  const rng = mulberry32(seed);
  const trades: DarkPoolTrade[] = [];

  for (let i = 0; i < 20; i++) {
    const tickerIdx = Math.floor(rng() * TICKERS.length);
    const ticker = TICKERS[tickerIdx];
    const basePrice = TICKER_PRICES[ticker];

    // Price within ±0.5% of reference
    const price = basePrice * (1 + (rng() - 0.5) * 0.01);

    // Size: 100,000 to 5,000,000 shares
    const size = Math.round(100_000 + rng() * 4_900_000);

    const typeIdx = Math.floor(rng() * TRADE_TYPES.length);
    const type = TRADE_TYPES[typeIdx];

    const sentiment = deriveSentiment(rng, size, type);

    // Time: 1–60 min ago
    const minutesAgo = Math.round(1 + rng() * 59);
    const timeAgo = `${minutesAgo} min ago`;

    const notionalM = (size * price) / 1_000_000;

    trades.push({
      id: `${seed}-${i}`,
      ticker,
      size,
      price,
      type,
      sentiment,
      timeAgo,
      notionalM,
    });
  }

  // Sort by most recent first (smallest minutesAgo = first in original order, keep stable)
  return trades;
}

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  bullish: "text-green-500",
  bearish: "text-red-500",
  neutral: "text-muted-foreground",
};

export function DarkPoolFeed() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [tickerFilter, setTickerFilter] = useState<Ticker | "ALL">("ALL");

  // Refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setRefreshCount((c) => c + 1);
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const trades = useMemo(() => {
    const seed = (Math.floor(Date.now() / 60_000) + refreshCount * 31) >>> 0;
    return generateTrades(seed);
  }, [refreshCount]);

  const filtered = useMemo(
    () =>
      tickerFilter === "ALL"
        ? trades
        : trades.filter((t) => t.ticker === tickerFilter),
    [trades, tickerFilter]
  );

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold">Dark Pool Feed</span>
        <span className="text-[10px] text-muted-foreground">Simulated · refreshes every 30s</span>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border overflow-x-auto scrollbar-hide">
        <span className="text-[10px] text-muted-foreground shrink-0 mr-1">Filter:</span>
        {(["ALL", ...TICKERS] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTickerFilter(t)}
            className={cn(
              "shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors",
              tickerFilter === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-[10px] text-muted-foreground">
              <th className="text-left py-1.5 px-3 font-medium">Time</th>
              <th className="text-left py-1.5 px-2 font-medium">Ticker</th>
              <th className="text-right py-1.5 px-2 font-medium">Size ($M)</th>
              <th className="text-left py-1.5 px-2 font-medium">Type</th>
              <th className="text-left py-1.5 px-3 font-medium">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((trade) => (
              <tr
                key={trade.id}
                className="border-b border-border/40 hover:bg-muted/30 transition-colors"
              >
                <td className="py-1 px-3 font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                  {trade.timeAgo}
                </td>
                <td className="py-1 px-2 font-mono font-semibold whitespace-nowrap">
                  {trade.ticker}
                </td>
                <td className="py-1 px-2 text-right font-mono tabular-nums whitespace-nowrap">
                  {trade.notionalM >= 1000
                    ? `$${(trade.notionalM / 1000).toFixed(2)}B`
                    : `$${trade.notionalM.toFixed(1)}M`}
                </td>
                <td className="py-1 px-2 text-muted-foreground whitespace-nowrap capitalize">
                  {trade.type}
                </td>
                <td
                  className={cn(
                    "py-1 px-3 font-medium whitespace-nowrap capitalize",
                    SENTIMENT_STYLES[trade.sentiment]
                  )}
                >
                  {trade.sentiment}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-4 px-3 text-center text-xs text-muted-foreground"
                >
                  No trades for {tickerFilter}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="px-3 py-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          Showing {filtered.length} of {trades.length} trades
        </span>
        <span>
          {trades.filter((t) => t.sentiment === "bullish").length} bullish ·{" "}
          {trades.filter((t) => t.sentiment === "bearish").length} bearish ·{" "}
          {trades.filter((t) => t.sentiment === "neutral").length} neutral
        </span>
      </div>
    </div>
  );
}
