"use client";

import { useState } from "react";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { useChartStore } from "@/stores/chart-store";
import { useClockStore } from "@/stores/clock-store";

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
  const w = 48,
    h = 16;
  const d = pts
    .map((y, i) => `${i === 0 ? "M" : "L"}${(i / 7) * w},${h - (y / 100) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path
        d={d}
        fill="none"
        stroke={positive ? "#34d399" : "#f87171"}
        strokeWidth="1.2"
        opacity="0.6"
      />
    </svg>
  );
}

// ── Constants ────────────────────────────────────────────────────────────────

const KNOWN_TICKERS = new Set([
  "AAPL","MSFT","GOOG","AMZN","TSLA","NVDA","META","NFLX","AMD","INTC",
  "CRM","ORCL","ADBE","PYPL","SQ","SHOP","SPOT","UBER","LYFT","COIN",
  "PLTR","SOFI","RIVN","LCID","NIO","BABA","JD","PDD","SE","GRAB",
]);

const POPULAR = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA", "NVDA", "META"];

const LISTS = ["Main", "Options Plays", "Swing Trades"] as const;

// ── Component ────────────────────────────────────────────────────────────────

export function WatchlistPanel() {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const { currentTicker, setTicker } = useChartStore();
  const [activeList, setActiveList] = useState<string>("Main");
  const [input, setInput] = useState("");
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);
  const marketSession = useClockStore((s) => s.marketSession);

  const sessionDotColor =
    marketSession === "open"
      ? "bg-emerald-400/80"
      : marketSession === "pre-market"
      ? "bg-amber-400/70"
      : marketSession === "after-hours"
      ? "bg-sky-400/60"
      : "bg-muted-foreground/20";

  const tickers = watchlist.map((w) => w.ticker);

  const quickAdd = POPULAR.filter((t) => !tickers.includes(t));

  function handleAdd() {
    const t = input.trim().toUpperCase();
    if (t && KNOWN_TICKERS.has(t) && !tickers.includes(t)) {
      addToWatchlist(t);
    }
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      {/* List selector */}
      <div className="flex items-center gap-1 border-b border-border/20 px-2 py-1.5">
        {LISTS.map((name) => (
          <button
            key={name}
            onClick={() => setActiveList(name)}
            className={`text-[10px] font-mono uppercase tracking-widest transition-colors ${
              activeList === name
                ? "text-foreground"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Ticker rows */}
      <div className="flex-1 divide-y divide-border/20 overflow-y-auto">
        {tickers.length === 0 && (
          <div className="px-2 py-6 text-center text-[10px] text-muted-foreground/40">
            No tickers yet
          </div>
        )}
        {tickers.map((ticker) => {
          const { price, changePct } = simulatePrice(ticker);
          const positive = changePct >= 0;
          const isActive = ticker === currentTicker;
          const isHovered = ticker === hoveredTicker;

          return (
            <button
              key={ticker}
              onClick={() => setTicker(ticker)}
              onMouseEnter={() => setHoveredTicker(ticker)}
              onMouseLeave={() => setHoveredTicker(null)}
              className={`group relative flex w-full items-center gap-1.5 px-2 py-1.5 text-left transition-colors hover:bg-foreground/[0.02] ${
                isActive ? "bg-foreground/[0.04]" : ""
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-r bg-foreground/30" />
              )}

              {/* Ticker + sparkline */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] font-medium leading-none text-foreground">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${sessionDotColor}`} />
                  {ticker}
                </div>
                <div className="mt-0.5">
                  <MiniSpark ticker={ticker} positive={positive} />
                </div>
              </div>

              {/* Price + Change % — right-aligned */}
              <div className="flex flex-col items-end gap-0.5">
                <div className="text-right text-[11px] font-mono tabular-nums leading-none text-foreground">
                  {price.toFixed(2)}
                </div>
                <div
                  className={`text-right text-[10px] font-mono tabular-nums leading-none ${
                    positive ? "text-emerald-400/80" : "text-rose-400/70"
                  }`}
                >
                  {positive ? "+" : ""}{changePct.toFixed(1)}%
                </div>
              </div>

              {/* Remove button */}
              {isHovered && (
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(ticker);
                  }}
                  className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded text-[9px] text-muted-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground/60"
                >
                  x
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick-add chips */}
      {quickAdd.length > 0 && (
        <div className="border-t border-border/20 px-2 py-1.5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
            Quick add
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {quickAdd.map((t) => (
              <button
                key={t}
                onClick={() => addToWatchlist(t)}
                className="rounded border border-border/20 px-1.5 py-0.5 text-[9px] text-muted-foreground/50 transition-colors hover:bg-foreground/[0.02] hover:text-foreground/70"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add input */}
      <div className="flex items-center gap-1 border-t border-border/20 px-2 py-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add ticker"
          className="min-w-0 flex-1 bg-transparent text-[10px] text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
        />
        <button
          onClick={handleAdd}
          className="text-[10px] text-muted-foreground/40 transition-colors hover:text-foreground/60"
        >
          +
        </button>
      </div>
    </div>
  );
}
