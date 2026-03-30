"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { useChartStore } from "@/stores/chart-store";
import { useClockStore } from "@/stores/clock-store";
import { useMarketDataStore } from "@/stores/market-data-store";

// ── Seeded PRNG ──────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tickerSeed(t: string) {
  let h = 0;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) & 0x7fff;
  return h;
}

function simulatePrice(ticker: string) {
  const rng = mulberry32(tickerSeed(ticker) ^ 0xcafe);
  const price = 50 + rng() * 400;
  const changePct = (rng() - 0.45) * 6;
  return {
    price: Math.round(price * 100) / 100,
    changePct: Math.round(changePct * 100) / 100,
  };
}

// ── Sparkline ────────────────────────────────────────────────────────────────

function MiniSpark({ ticker, positive }: { ticker: string; positive: boolean }) {
  const rng = mulberry32(tickerSeed(ticker) ^ 0xbeef);
  const pts: number[] = [];
  let v = 50;
  for (let i = 0; i < 8; i++) {
    v = Math.max(5, Math.min(95, v + (rng() - 0.5) * 25));
    pts.push(v);
  }
  const w = 40;
  const h = 14;
  const d = pts
    .map((y, i) => `${i === 0 ? "M" : "L"}${(i / 7) * w},${h - (y / 100) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <path
        d={d}
        fill="none"
        stroke={positive ? "#34d399" : "#f87171"}
        strokeWidth="1.2"
        opacity={positive ? "0.55" : "0.5"}
      />
    </svg>
  );
}

// ── Price skeleton ────────────────────────────────────────────────────────────

function PriceSkeleton() {
  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0">
      <div className="h-3 w-10 animate-pulse rounded bg-foreground/10" />
      <div className="h-2.5 w-7 animate-pulse rounded bg-foreground/8" />
    </div>
  );
}

// ── Constants ────────────────────────────────────────────────────────────────

const KNOWN_TICKERS = new Set([
  "AAPL","MSFT","GOOG","AMZN","TSLA","NVDA","META","NFLX","AMD","INTC",
  "CRM","ORCL","ADBE","PYPL","SQ","SHOP","SPOT","UBER","LYFT","COIN",
  "PLTR","SOFI","RIVN","LCID","NIO","BABA","JD","PDD","SE","GRAB",
]);

const POPULAR = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA", "NVDA", "META"];

const TICKER_NAMES: Record<string, string> = {
  AAPL: "Apple",
  MSFT: "Microsoft",
  GOOG: "Alphabet",
  AMZN: "Amazon",
  TSLA: "Tesla",
  NVDA: "NVIDIA",
  META: "Meta",
};

const LISTS = ["Main", "Options", "Swing"] as const;

// ── Component ────────────────────────────────────────────────────────────────

export function WatchlistPanel() {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const { currentTicker, setTicker } = useChartStore();
  const [activeList, setActiveList] = useState<string>("Main");
  const [newTicker, setNewTicker] = useState("");
  const marketSession = useClockStore((s) => s.marketSession);

  // Real price data for the currently selected ticker
  const realPrice = useMarketDataStore((s) => {
    if (s.allData.length === 0 || s.revealedCount === 0) return null;
    return s.allData[s.revealedCount - 1]?.close ?? null;
  });
  const prevPrice = useMarketDataStore((s) => {
    if (s.allData.length < 2 || s.revealedCount < 2) return null;
    return s.allData[s.revealedCount - 2]?.close ?? null;
  });

  const sessionDotColor =
    marketSession === "open"
      ? "bg-emerald-400/80"
      : marketSession === "pre-market"
      ? "bg-amber-400/70"
      : marketSession === "after-hours"
      ? "bg-sky-400/60"
      : "bg-muted-foreground/20";

  const tickers = watchlist.map((w) => w.ticker);
  const quickAdd = POPULAR.filter((t) => !tickers.includes(t)).slice(0, 5);

  function handleAdd() {
    const t = newTicker.trim().toUpperCase();
    if (t && KNOWN_TICKERS.has(t) && !tickers.includes(t)) {
      addToWatchlist(t);
    }
    setNewTicker("");
  }

  return (
    <div className="flex h-full flex-col">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/30 shrink-0">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30">
          Watchlist
        </span>
        {/* session indicator */}
        <div className="flex items-center gap-1">
          <span className={cn("inline-block h-1.5 w-1.5 rounded-full shrink-0", sessionDotColor)} />
          <span className={cn(
            "text-[9px] font-mono capitalize",
            marketSession === "open"
              ? "text-emerald-400/60"
              : marketSession === "pre-market"
              ? "text-amber-400/60"
              : marketSession === "after-hours"
              ? "text-sky-400/50"
              : "text-muted-foreground/25"
          )}>
            {marketSession === "open"
              ? "Open"
              : marketSession === "pre-market"
              ? "Pre"
              : marketSession === "after-hours"
              ? "AH"
              : "Closed"}
          </span>
        </div>
      </div>

      {/* ── List selector pills ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border/20 shrink-0 overflow-x-auto">
        {LISTS.map((name) => (
          <button
            key={name}
            onClick={() => setActiveList(name)}
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider transition-colors",
              activeList === name
                ? "bg-primary/15 text-primary/80"
                : "text-muted-foreground/30 hover:text-muted-foreground/60"
            )}
          >
            {name}
          </button>
        ))}
      </div>

      {/* ── Ticker rows ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {tickers.length === 0 && (
          <div className="px-2 py-6 text-center text-[10px] text-muted-foreground/30">
            No tickers yet
          </div>
        )}

        {tickers.map((ticker) => {
          const isActive = ticker === currentTicker;

          let displayPrice: number;
          let displayChangePct: number;
          let isLoadingReal = false;

          if (isActive) {
            if (realPrice !== null) {
              displayPrice = realPrice;
              displayChangePct =
                prevPrice !== null && prevPrice !== 0
                  ? ((realPrice - prevPrice) / prevPrice) * 100
                  : 0;
            } else {
              isLoadingReal = true;
              const sim = simulatePrice(ticker);
              displayPrice = sim.price;
              displayChangePct = sim.changePct;
            }
          } else {
            const sim = simulatePrice(ticker);
            displayPrice = sim.price;
            displayChangePct = sim.changePct;
          }

          const positive = displayChangePct >= 0;

          return (
            <button
              key={ticker}
              onClick={() => setTicker(ticker)}
              className={cn(
                "group w-full flex flex-col px-3 py-2.5 transition-colors border-b border-border/10",
                "hover:bg-foreground/[0.02]",
                isActive
                  ? "bg-primary/[0.04] border-l-2 border-l-primary/50"
                  : "border-l-2 border-l-transparent"
              )}
            >
              {/* Row 1: Ticker name (+ company sub-label) + sparkline (right) */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex flex-col min-w-0">
                  <span className={cn(
                    "text-[11px] font-semibold tracking-tight leading-none",
                    isActive ? "text-foreground" : "text-foreground/65"
                  )}>
                    {ticker}
                  </span>
                  {TICKER_NAMES[ticker] && (
                    <span className="text-[8px] font-mono text-muted-foreground/25 leading-none mt-0.5">
                      {TICKER_NAMES[ticker]}
                    </span>
                  )}
                </div>
                {isActive && isLoadingReal ? (
                  <PriceSkeleton />
                ) : (
                  <div className="flex items-center gap-1">
                    <MiniSpark ticker={ticker} positive={positive} />
                    {/* Remove button — visible on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(ticker);
                      }}
                      className="opacity-0 group-hover:opacity-100 h-4 w-4 flex items-center justify-center rounded text-muted-foreground/30 hover:text-rose-400/70 hover:bg-rose-500/10 transition-all shrink-0 text-[11px]"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Row 2: Price (left) + Change% (right) */}
              {!(isActive && isLoadingReal) && (
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[10px] font-mono tabular-nums",
                    isActive ? "text-foreground/75" : "text-muted-foreground/45"
                  )}>
                    ${displayPrice.toFixed(2)}
                  </span>
                  <span className={cn(
                    "text-[9px] font-mono tabular-nums font-medium",
                    displayChangePct > 0
                      ? "text-emerald-400/80"
                      : displayChangePct < 0
                      ? "text-rose-400/70"
                      : "text-muted-foreground/35"
                  )}>
                    {displayChangePct >= 0 ? "+" : ""}{displayChangePct.toFixed(2)}%
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Quick-add chips ──────────────────────────────────────────────── */}
      {quickAdd.length > 0 && (
        <div className="border-t border-border/20 px-2 py-1.5 shrink-0">
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/25 mb-1">
            Quick add
          </div>
          <div className="flex flex-wrap gap-1">
            {quickAdd.map((t) => (
              <button
                key={t}
                onClick={() => addToWatchlist(t)}
                className="rounded-full border border-border/20 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground/40 transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary/70 flex items-center gap-0.5"
              >
                <span className="text-muted-foreground/30 leading-none">+</span>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Add ticker input ─────────────────────────────────────────────── */}
      <div className="border-t border-border/20 px-2 py-1.5 shrink-0">
        <div className="flex items-center gap-1">
          <input
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="AAPL..."
            className="flex-1 bg-transparent text-[10px] font-mono uppercase text-foreground/70 placeholder:text-muted-foreground/25 outline-none min-w-0"
          />
          <button
            onClick={handleAdd}
            className="text-[11px] font-mono text-primary/50 hover:text-primary/80 transition-colors shrink-0 leading-none"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
