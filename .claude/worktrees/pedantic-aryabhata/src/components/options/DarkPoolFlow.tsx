"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DarkPoolPrint {
 id: string;
 ticker: string;
 size: number; // shares
 price: number; // execution price
 lastPrice: number; // last market price
 diffPct: number; // (price - lastPrice) / lastPrice * 100
 side: "above_ask" | "below_bid" | "mid";
 timestamp: number; // ms epoch
}

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
 let s = seed;
 return () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
 };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TICKERS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOG", "META", "JPM", "SPY", "QQQ"];

const BASE_PRICES: Record<string, number> = {
 AAPL: 182,
 MSFT: 415,
 NVDA: 875,
 TSLA: 245,
 AMZN: 196,
 GOOG: 172,
 META: 510,
 JPM: 210,
 SPY: 520,
 QQQ: 445,
};

// ── Generator ─────────────────────────────────────────────────────────────────

function generateDarkPoolPrints(seed: number, count = 30): DarkPoolPrint[] {
 const rand = seededRandom(seed);
 const now = Date.now();
 const prints: DarkPoolPrint[] = [];

 for (let i = 0; i < count; i++) {
 const ticker = TICKERS[Math.floor(rand() * TICKERS.length)];
 const basePrice = BASE_PRICES[ticker] ?? 100;
 const lastPrice = +(basePrice * (0.98 + rand() * 0.04)).toFixed(2);

 // Price: dark pool can print above ask (aggressive buyer), below bid (aggressive seller), or near mid
 const r = rand();
 let side: DarkPoolPrint["side"];
 let priceDiff: number;
 if (r < 0.38) {
 side = "above_ask";
 priceDiff = lastPrice * (0.001 + rand() * 0.005); // +0.1% to +0.6%
 } else if (r < 0.72) {
 side = "below_bid";
 priceDiff = -lastPrice * (0.001 + rand() * 0.005);
 } else {
 side = "mid";
 priceDiff = lastPrice * (rand() * 0.001 - 0.0005); // near flat
 }

 const price = +(lastPrice + priceDiff).toFixed(2);
 const diffPct = +((price - lastPrice) / lastPrice * 100).toFixed(3);

 // Size: 10k – 2M shares (dark pool prints are large)
 const sizeOptions = [10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000];
 const size = sizeOptions[Math.floor(rand() * sizeOptions.length)];

 prints.push({
 id: `dp-${seed}-${i}`,
 ticker,
 size,
 price,
 lastPrice,
 diffPct,
 side,
 timestamp: now - Math.floor(rand() * 8 * 60 * 60 * 1000), // last 8h
 });
 }

 return prints.sort((a, b) => b.timestamp - a.timestamp);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relTime(ts: number): string {
 const mins = Math.floor((Date.now() - ts) / 60000);
 if (mins < 1) return "just now";
 if (mins < 60) return `${mins}m ago`;
 return `${Math.floor(mins / 60)}h ago`;
}

function formatShares(n: number): string {
 if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
 if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
 return n.toLocaleString();
}

function sideLabel(side: DarkPoolPrint["side"]): React.ReactNode {
 if (side === "above_ask") {
 return (
 <span className="rounded bg-emerald-500/15 px-1 py-0.5 text-[11px] font-semibold text-emerald-400">
 Above Ask
 </span>
 );
 }
 if (side === "below_bid") {
 return (
 <span className="rounded bg-red-500/15 px-1 py-0.5 text-[11px] font-semibold text-red-400">
 Below Bid
 </span>
 );
 }
 return (
 <span className="rounded bg-muted/30 px-1 py-0.5 text-[11px] font-medium text-muted-foreground">
 Mid
 </span>
 );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface DarkPoolFlowProps {
 seed?: number;
}

export function DarkPoolFlow({ seed = 42 }: DarkPoolFlowProps) {
 const prints = useMemo(() => generateDarkPoolPrints(seed), [seed]);

 // 24h buy/sell ratio
 const { buyDollar, sellDollar } = useMemo(() => {
 let buy = 0;
 let sell = 0;
 for (const p of prints) {
 const dollar = p.size * p.price;
 if (p.side === "above_ask") buy += dollar;
 else if (p.side === "below_bid") sell += dollar;
 }
 return { buyDollar: buy, sellDollar: sell };
 }, [prints]);

 const total = buyDollar + sellDollar;
 const buyPct = total > 0 ? (buyDollar / total) * 100 : 50;
 const sellPct = 100 - buyPct;

 function formatBillion(n: number): string {
 if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
 if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
 return `$${(n / 1e3).toFixed(0)}K`;
 }

 return (
 <div className="flex flex-col gap-3">
 {/* 24h Buy/Sell ratio bar */}
 <div className="rounded-md border border-border bg-card/40 p-3">
 <div className="mb-2 flex items-center justify-between text-xs">
 <span className="font-medium text-foreground">24h Simulated Institutional Flow Ratio</span>
 <span className="text-muted-foreground">
 {prints.length} prints tracked
 </span>
 </div>
 <div className="flex h-3 overflow-hidden rounded-full">
 <div
 className="flex items-center justify-center bg-emerald-500/70 transition-colors"
 style={{ width: `${buyPct.toFixed(1)}%` }}
 />
 <div
 className="flex items-center justify-center bg-red-500/70 transition-colors"
 style={{ width: `${sellPct.toFixed(1)}%` }}
 />
 </div>
 <div className="mt-1.5 flex justify-between text-[11px]">
 <span className="text-emerald-400">
 Buy {buyPct.toFixed(0)}% · {formatBillion(buyDollar)}
 </span>
 <span className="text-red-400">
 Sell {sellPct.toFixed(0)}% · {formatBillion(sellDollar)}
 </span>
 </div>
 </div>

 {/* Prints feed */}
 <div className="overflow-auto">
 <table className="w-full border-collapse text-[11px]">
 <thead className="sticky top-0 z-10 bg-card">
 <tr className="border-b border-border">
 {["Time", "Ticker", "Size", "Price", "vs Last", "Side"].map((col) => (
 <th
 key={col}
 className="px-3 py-2 text-left text-[11px] font-medium text-muted-foreground"
 >
 {col}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {prints.map((p) => {
 const isAbove = p.side === "above_ask";
 const isBelow = p.side === "below_bid";
 return (
 <tr
 key={p.id}
 className="border-b border-border transition-colors hover:bg-muted/50"
 >
 <td className="px-3 py-2 text-muted-foreground">
 {relTime(p.timestamp)}
 </td>
 <td className="px-3 py-2 font-medium">
 {p.ticker}
 </td>
 <td className="px-3 py-2 text-right font-mono tabular-nums font-medium">
 {formatShares(p.size)}
 </td>
 <td className="px-3 py-2 text-right font-mono tabular-nums">
 ${p.price.toFixed(2)}
 </td>
 <td
 className={cn(
 "px-3 py-2 text-right font-mono tabular-nums font-medium",
 isAbove
 ? "text-emerald-500"
 : isBelow
 ? "text-red-500"
 : "text-muted-foreground",
 )}
 >
 {p.diffPct >= 0 ? "+" : ""}
 {p.diffPct.toFixed(3)}%
 </td>
 <td className="px-3 py-2">{sideLabel(p.side)}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 );
}
