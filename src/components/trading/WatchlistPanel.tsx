"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, X, Plus, TrendingUp, TrendingDown, Minus, ChevronRight, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { useChartStore } from "@/stores/chart-store";
import { WATCHLIST_STOCKS } from "@/types/market";
import type { WatchlistItem } from "@/stores/watchlist-store";

// Seeded PRNG for stable simulated prices per ticker
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tickerSeed(ticker: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < ticker.length; i++) {
    h ^= ticker.charCodeAt(i);
    h = (Math.imul(h, 0x01000193)) >>> 0;
  }
  return h;
}

// Stable base prices derived from ticker hash — realistic ballpark
const BASE_PRICES: Record<string, number> = {
  AAPL: 213,
  MSFT: 415,
  GOOG: 178,
  AMZN: 204,
  NVDA: 870,
  TSLA: 248,
  JPM: 225,
  SPY: 548,
  QQQ: 468,
  META: 568,
};

function simulatePrice(ticker: string): { price: number; changePct: number } {
  const base = BASE_PRICES[ticker] ?? 100;
  const seed = tickerSeed(ticker + Math.floor(Date.now() / 60000).toString());
  const rand = mulberry32(seed);
  const changePct = (rand() - 0.5) * 4; // ±2% daily
  const price = base * (1 + changePct / 100);
  return { price: Math.max(price, 0.01), changePct };
}

function hasActiveAlert(item: WatchlistItem): boolean {
  return (
    (item.alertAbove !== undefined && item.alertAboveEnabled !== false) ||
    (item.alertBelow !== undefined && item.alertBelowEnabled !== false)
  );
}

function isNearAlert(item: WatchlistItem, price: number): boolean {
  const threshold = 0.02; // 2%
  if (item.alertAbove !== undefined && item.alertAboveEnabled !== false) {
    if (Math.abs(price - item.alertAbove) / price < threshold) return true;
  }
  if (item.alertBelow !== undefined && item.alertBelowEnabled !== false) {
    if (Math.abs(price - item.alertBelow) / price < threshold) return true;
  }
  return false;
}

interface AlertEditorProps {
  item: WatchlistItem;
  price: number;
  onClose: () => void;
}

function AlertEditor({ item, price, onClose }: AlertEditorProps) {
  const { setAlert, clearAlert } = useWatchlistStore();
  const [above, setAbove] = useState(
    item.alertAbove !== undefined ? item.alertAbove.toFixed(2) : "",
  );
  const [below, setBelow] = useState(
    item.alertBelow !== undefined ? item.alertBelow.toFixed(2) : "",
  );

  function handleSave() {
    const aboveVal = above !== "" ? parseFloat(above) : undefined;
    const belowVal = below !== "" ? parseFloat(below) : undefined;
    if ((aboveVal !== undefined && isNaN(aboveVal)) || (belowVal !== undefined && isNaN(belowVal))) return;
    setAlert(item.ticker, aboveVal, belowVal);
    onClose();
  }

  function handleClear() {
    clearAlert(item.ticker);
    onClose();
  }

  return (
    <div className="border border-border rounded-md bg-background p-3 space-y-3 mx-2 mb-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">Price Alerts — {item.ticker}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="text-[10px] text-muted-foreground">
        Current: <span className="font-mono tabular-nums text-foreground">${price.toFixed(2)}</span>
      </div>
      <div className="space-y-2">
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Alert above ($)</label>
          <input
            type="number"
            value={above}
            onChange={(e) => setAbove(e.target.value)}
            placeholder={`e.g. ${(price * 1.05).toFixed(2)}`}
            className="w-full rounded border border-border bg-background px-2 py-1 text-xs font-mono tabular-nums focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Alert below ($)</label>
          <input
            type="number"
            value={below}
            onChange={(e) => setBelow(e.target.value)}
            placeholder={`e.g. ${(price * 0.95).toFixed(2)}`}
            className="w-full rounded border border-border bg-background px-2 py-1 text-xs font-mono tabular-nums focus:outline-none focus:border-primary"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="flex-1 rounded bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Save
        </button>
        {(item.alertAbove !== undefined || item.alertBelow !== undefined) && (
          <button
            onClick={handleClear}
            className="px-2 py-1 rounded border border-border text-[10px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

interface WatchlistRowProps {
  item: WatchlistItem;
  price: number;
  changePct: number;
  isAlertEditorOpen: boolean;
  onToggleEditor: () => void;
  onNavigate: (ticker: string) => void;
  onRemove: (ticker: string) => void;
}

function WatchlistRow({
  item,
  price,
  changePct,
  isAlertEditorOpen,
  onToggleEditor,
  onNavigate,
  onRemove,
}: WatchlistRowProps) {
  const alertActive = hasActiveAlert(item);
  const nearAlert = isNearAlert(item, price);

  return (
    <div className="group">
      <div className="flex items-center gap-1 px-3 py-2 hover:bg-accent/20 transition-colors">
        {/* Ticker + price */}
        <button
          onClick={() => onNavigate(item.ticker)}
          className="flex flex-1 items-center gap-2 min-w-0 text-left"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-foreground leading-none">
                {item.ticker}
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div
              className={cn(
                "text-[10px] font-mono tabular-nums mt-0.5",
                changePct > 0
                  ? "text-green-500"
                  : changePct < 0
                    ? "text-red-500"
                    : "text-muted-foreground",
              )}
            >
              {changePct >= 0 ? "+" : ""}
              {changePct.toFixed(2)}%
            </div>
          </div>

          <div className="ml-auto text-right">
            <div className="text-xs font-mono tabular-nums text-foreground">
              ${price.toFixed(2)}
            </div>
            <div className="flex items-center justify-end">
              {changePct > 0 ? (
                <TrendingUp className="h-2.5 w-2.5 text-green-500" />
              ) : changePct < 0 ? (
                <TrendingDown className="h-2.5 w-2.5 text-red-500" />
              ) : (
                <Minus className="h-2.5 w-2.5 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>

        {/* Alert bell */}
        <button
          onClick={onToggleEditor}
          title={alertActive ? "Edit alert" : "Set price alert"}
          className={cn(
            "shrink-0 rounded p-1 transition-colors",
            isAlertEditorOpen
              ? "text-primary"
              : alertActive
                ? nearAlert
                  ? "text-amber-500 hover:text-amber-400"
                  : "text-primary/70 hover:text-primary"
                : "text-muted-foreground/40 hover:text-muted-foreground",
          )}
        >
          {alertActive ? (
            <Bell className="h-3 w-3" />
          ) : (
            <BellOff className="h-3 w-3" />
          )}
        </button>

        {/* Remove */}
        <button
          onClick={() => onRemove(item.ticker)}
          title="Remove from watchlist"
          className="shrink-0 rounded p-1 text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Alert editor inline */}
      {isAlertEditorOpen && (
        <AlertEditor
          item={item}
          price={price}
          onClose={onToggleEditor}
        />
      )}
    </div>
  );
}

export function WatchlistPanel() {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const { setTicker } = useChartStore();
  const router = useRouter();

  const [addInput, setAddInput] = useState("");
  const [addError, setAddError] = useState("");
  const [openEditorTicker, setOpenEditorTicker] = useState<string | null>(null);

  // Simulate prices — stable per minute per ticker
  const prices = useMemo(() => {
    const map: Record<string, { price: number; changePct: number }> = {};
    for (const item of watchlist) {
      map[item.ticker] = simulatePrice(item.ticker);
    }
    return map;
  }, [watchlist]);

  const handleAdd = useCallback(() => {
    const ticker = addInput.trim().toUpperCase();
    if (!ticker) return;

    // Validate ticker: 1-5 uppercase letters
    if (!/^[A-Z]{1,5}$/.test(ticker)) {
      setAddError("Invalid ticker symbol");
      return;
    }

    addToWatchlist(ticker);
    setAddInput("");
    setAddError("");
  }, [addInput, addToWatchlist]);

  const handleNavigate = useCallback(
    (ticker: string) => {
      setTicker(ticker);
      router.push(`/trade`);
    },
    [setTicker, router],
  );

  const handleToggleEditor = useCallback((ticker: string) => {
    setOpenEditorTicker((prev) => (prev === ticker ? null : ticker));
  }, []);

  const handleRemove = useCallback(
    (ticker: string) => {
      removeFromWatchlist(ticker);
      if (openEditorTicker === ticker) setOpenEditorTicker(null);
    },
    [removeFromWatchlist, openEditorTicker],
  );

  // Quick-add from known stocks not yet watched
  const suggestions = useMemo(
    () =>
      WATCHLIST_STOCKS.filter(
        (s) => !watchlist.some((w) => w.ticker === s.ticker),
      ).slice(0, 4),
    [watchlist],
  );

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2 shrink-0">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Watchlist
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          {watchlist.length} tracked
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <Bell className="h-7 w-7 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              Add tickers to track them here
            </p>
          </div>
        ) : (
          watchlist.map((item) => {
            const { price, changePct } = prices[item.ticker] ?? { price: 0, changePct: 0 };
            return (
              <WatchlistRow
                key={item.ticker}
                item={item}
                price={price}
                changePct={changePct}
                isAlertEditorOpen={openEditorTicker === item.ticker}
                onToggleEditor={() => handleToggleEditor(item.ticker)}
                onNavigate={handleNavigate}
                onRemove={handleRemove}
              />
            );
          })
        )}

        {/* Quick-add suggestions */}
        {suggestions.length > 0 && watchlist.length > 0 && (
          <div className="border-t border-border/50 px-3 pt-2 pb-1">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50 mb-1.5">
              Quick add
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((s) => (
                <button
                  key={s.ticker}
                  onClick={() => addToWatchlist(s.ticker)}
                  className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  +{s.ticker}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add input */}
      <div className="border-t border-border px-3 py-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={addInput}
              onChange={(e) => {
                setAddInput(e.target.value.toUpperCase());
                setAddError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setAddInput("");
                  setAddError("");
                }
              }}
              placeholder="Add ticker..."
              maxLength={5}
              className="w-full rounded border border-border bg-background px-2 py-1 text-xs font-mono uppercase focus:outline-none focus:border-primary placeholder:normal-case placeholder:font-sans placeholder:not-italic"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!addInput.trim()}
            className="flex items-center gap-1 rounded bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        {addError && (
          <p className="mt-1 text-[10px] text-red-500">{addError}</p>
        )}
      </div>
    </div>
  );
}
