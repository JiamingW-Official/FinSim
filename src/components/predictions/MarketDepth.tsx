"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ActiveMarket } from "@/data/active-prediction-markets";

// ── mulberry32 PRNG ───────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stable numeric hash from a string
function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (Math.imul(h, 0x01000193) >>> 0);
  }
  return h >>> 0;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderLevel {
  price: number; // 0-100 scale (cents)
  size: number;  // simulated dollar volume at this level
}

// ── Order Book Generation ─────────────────────────────────────────────────────

function generateOrderBook(
  market: ActiveMarket,
  levels = 6,
): { bids: OrderLevel[]; asks: OrderLevel[] } {
  const seed = hashString(market.id);
  const rand = mulberry32(seed);

  const midYes = market.yesPrice;
  const spread = 1 + Math.round(rand() * 2); // 1-3 cent spread

  const bids: OrderLevel[] = Array.from({ length: levels }, (_, i) => {
    const price = Math.max(1, midYes - Math.round(spread / 2) - i);
    const size = Math.round(500 + rand() * 4500);
    return { price, size };
  });

  const asks: OrderLevel[] = Array.from({ length: levels }, (_, i) => {
    const price = Math.min(99, midYes + Math.ceil(spread / 2) + i);
    const size = Math.round(500 + rand() * 4500);
    return { price, size };
  });

  return { bids, asks };
}

// ── Order Row ─────────────────────────────────────────────────────────────────

function OrderRow({
  level,
  side,
  maxSize,
}: {
  level: OrderLevel;
  side: "bid" | "ask";
  maxSize: number;
}) {
  const barWidth = Math.round((level.size / maxSize) * 100);
  const isBid = side === "bid";

  return (
    <div className="relative flex items-center justify-between py-[3px]">
      {/* Background fill bar */}
      <div
        className={cn(
          "absolute inset-y-0 rounded-sm",
          isBid ? "left-0 bg-emerald-500/15" : "right-0 bg-rose-500/15",
        )}
        style={{ width: `${barWidth}%` }}
      />
      {/* Price */}
      <span
        className={cn(
          "relative z-10 text-[9px] font-mono font-semibold tabular-nums",
          isBid ? "text-emerald-400/80" : "text-rose-400/80",
        )}
      >
        {level.price}¢
      </span>
      {/* Size */}
      <span className="relative z-10 text-[10px] font-mono tabular-nums text-muted-foreground/40">
        ${level.size.toLocaleString()}
      </span>
    </div>
  );
}

// ── Spread row ────────────────────────────────────────────────────────────────

function SpreadRow({ bestBid, bestAsk }: { bestBid: number; bestAsk: number }) {
  const spread = bestAsk - bestBid;
  const mid = (bestBid + bestAsk) / 2;
  return (
    <div className="flex items-center gap-2 rounded bg-foreground/5 px-2 py-1">
      <span className="text-[9px] font-mono text-muted-foreground/35">
        Spread: {spread}¢
      </span>
      <span className="text-border/30">|</span>
      <span className="text-[9px] font-mono text-muted-foreground/35">
        Mid:{" "}
        <span className="font-semibold tabular-nums text-foreground/60">
          {mid.toFixed(1)}¢
        </span>
      </span>
      <span className="text-border/30">|</span>
      <span className="text-[9px] font-mono text-muted-foreground/35">
        Implied:{" "}
        <span className="font-semibold tabular-nums text-foreground/60">
          {mid.toFixed(1)}%
        </span>
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface MarketDepthProps {
  market: ActiveMarket;
}

export function MarketDepth({ market }: MarketDepthProps) {
  const { bids, asks } = useMemo(
    () => generateOrderBook(market),
    [market.id, market.yesPrice],
  );

  const maxSize = useMemo(
    () => Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size)),
    [bids, asks],
  );

  const bestBid = bids[0].price;
  const bestAsk = asks[0].price;
  const mid = (bestBid + bestAsk) / 2;

  // Cumulative depth for depth chart
  const cumBids = useMemo(() => {
    let cum = 0;
    return bids.map((b) => {
      cum += b.size;
      return { price: b.price, cumSize: cum };
    });
  }, [bids]);

  const cumAsks = useMemo(() => {
    let cum = 0;
    return asks.map((a) => {
      cum += a.size;
      return { price: a.price, cumSize: cum };
    });
  }, [asks]);

  // SVG depth chart
  const svgW = 300;
  const svgH = 80;
  const padL = 8;
  const padR = 8;
  const padT = 6;
  const padB = 16;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const allPrices = [...cumBids.map((b) => b.price), ...cumAsks.map((a) => a.price)];
  const pMin = Math.min(...allPrices);
  const pMax = Math.max(...allPrices);
  const pRange = pMax - pMin || 1;

  const maxCumSize = Math.max(
    cumBids[cumBids.length - 1].cumSize,
    cumAsks[cumAsks.length - 1].cumSize,
  );

  const toX = (price: number) =>
    padL + ((price - pMin) / pRange) * plotW;
  const toY = (size: number) =>
    padT + (1 - size / maxCumSize) * plotH;

  const bidPoints =
    cumBids.map((b) => `${toX(b.price).toFixed(1)},${toY(b.cumSize).toFixed(1)}`).join(" ") +
    ` ${toX(cumBids[cumBids.length - 1].price).toFixed(1)},${(padT + plotH).toFixed(1)} ${toX(cumBids[0].price).toFixed(1)},${(padT + plotH).toFixed(1)}`;

  const askPoints =
    cumAsks.map((a) => `${toX(a.price).toFixed(1)},${toY(a.cumSize).toFixed(1)}`).join(" ") +
    ` ${toX(cumAsks[cumAsks.length - 1].price).toFixed(1)},${(padT + plotH).toFixed(1)} ${toX(cumAsks[0].price).toFixed(1)},${(padT + plotH).toFixed(1)}`;

  return (
    <div className="space-y-3">
      {/* Market header */}
      <div className="rounded-xl border border-border/20 bg-card/30 px-3 py-2">
        <div className="mb-1 text-[9px] font-mono text-muted-foreground/35 line-clamp-1">
          {market.question}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono font-semibold tabular-nums text-emerald-400/80">
            Bid: {bestBid}¢
          </span>
          <span className="text-muted-foreground/20">|</span>
          <span className="text-[9px] font-mono font-semibold tabular-nums text-rose-400/80">
            Ask: {bestAsk}¢
          </span>
          <span className="text-muted-foreground/20">|</span>
          <span className="text-[9px] font-mono font-semibold tabular-nums text-foreground/60">
            {mid.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Depth chart SVG */}
      <div className="rounded-xl border border-border/20 bg-card/30 p-3">
        <div className="mb-1.5 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
          Market Depth
        </div>
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full"
          aria-hidden="true"
        >
          {/* Bid fill */}
          <polygon
            points={bidPoints}
            fill="#22c55e"
            fillOpacity={0.12}
            stroke="#22c55e"
            strokeWidth={1.2}
            strokeOpacity={0.4}
            strokeLinejoin="round"
          />
          {/* Ask fill */}
          <polygon
            points={askPoints}
            fill="#f43f5e"
            fillOpacity={0.12}
            stroke="#f43f5e"
            strokeWidth={1.2}
            strokeOpacity={0.4}
            strokeLinejoin="round"
          />
          {/* Mid price vertical line */}
          <line
            x1={toX(mid)}
            x2={toX(mid)}
            y1={padT}
            y2={padT + plotH}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeDasharray="3 2"
            strokeWidth={1}
          />
          {/* X-axis tick labels */}
          {[pMin, mid, pMax].map((p, i) => (
            <text
              key={i}
              x={toX(p)}
              y={svgH - 3}
              textAnchor="middle"
              fontSize={7}
              className="fill-muted-foreground/30"
            >
              {p.toFixed(0)}¢
            </text>
          ))}
        </svg>
        <div className="mt-1.5 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-3 rounded-sm bg-emerald-500/25" />
            <span className="text-[9px] font-mono text-muted-foreground/35">YES bids</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-3 rounded-sm bg-rose-500/25" />
            <span className="text-[9px] font-mono text-muted-foreground/35">YES asks</span>
          </div>
        </div>
      </div>

      {/* Order book table */}
      <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
        <div className="border-b border-border/20 px-3 py-2">
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
            Order Book — YES Contracts
          </span>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-2 divide-x divide-border/10">
          <div className="px-3 pb-1 pt-2 text-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400/50">
              Bids (Buy YES)
            </span>
          </div>
          <div className="px-3 pb-1 pt-2 text-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-rose-400/50">
              Asks (Sell YES)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border/10">
          {/* Bids */}
          <div className="px-3 py-1 space-y-0.5">
            <div className="flex justify-between mb-1">
              <span className="text-[9px] font-mono text-muted-foreground/30">Price</span>
              <span className="text-[9px] font-mono text-muted-foreground/30">Volume</span>
            </div>
            {bids.map((level, i) => (
              <OrderRow key={i} level={level} side="bid" maxSize={maxSize} />
            ))}
          </div>
          {/* Asks */}
          <div className="px-3 py-1 space-y-0.5">
            <div className="flex justify-between mb-1">
              <span className="text-[9px] font-mono text-muted-foreground/30">Price</span>
              <span className="text-[9px] font-mono text-muted-foreground/30">Volume</span>
            </div>
            {asks.map((level, i) => (
              <OrderRow key={i} level={level} side="ask" maxSize={maxSize} />
            ))}
          </div>
        </div>

        {/* Spread row */}
        <div className="border-t border-border/20 px-3 py-1.5">
          <SpreadRow bestBid={bestBid} bestAsk={bestAsk} />
        </div>
      </div>

      <p className="text-[9px] font-mono text-muted-foreground/30">
        Simulated order book. Prices in cents (100c = $1.00). Implied prob = mid price.
      </p>
    </div>
  );
}
