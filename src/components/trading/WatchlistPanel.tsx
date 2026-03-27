"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  X,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  LayoutList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { useChartStore } from "@/stores/chart-store";
import { WATCHLIST_STOCKS } from "@/types/market";
import { FUNDAMENTALS } from "@/data/fundamentals";
import type { WatchlistItem } from "@/stores/watchlist-store";

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

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
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

// Stable base prices
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
  const changePct = (rand() - 0.5) * 4;
  const price = base * (1 + changePct / 100);
  return { price: Math.max(price, 0.01), changePct };
}

// Generate a mini sparkline path for the last 8 simulated data points
function generateSparkData(ticker: string): number[] {
  const base = BASE_PRICES[ticker] ?? 100;
  const seed = tickerSeed(ticker + "spark" + Math.floor(Date.now() / 3600000).toString());
  const rand = mulberry32(seed);
  const points: number[] = [base];
  for (let i = 1; i < 8; i++) {
    const prev = points[i - 1];
    points.push(Math.max(prev * (1 + (rand() - 0.5) * 0.02), 0.01));
  }
  return points;
}

function MiniSparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 40;
  const H = 16;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - ((v - min) / range) * H;
      return `${x},${y}`;
    })
    .join(" ");
  const isUp = values[values.length - 1] >= values[0];
  return (
    <svg width={W} height={H} className="shrink-0">
      <polyline
        points={pts}
        fill="none"
        stroke={isUp ? "#10b981" : "#ef4444"}
        strokeWidth={1.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function hasActiveAlert(item: WatchlistItem): boolean {
  return (
    (item.alertAbove !== undefined && item.alertAboveEnabled !== false) ||
    (item.alertBelow !== undefined && item.alertBelowEnabled !== false)
  );
}

// ─── AlertEditor ─────────────────────────────────────────────────────────────

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
    if (
      (aboveVal !== undefined && isNaN(aboveVal)) ||
      (belowVal !== undefined && isNaN(belowVal))
    )
      return;
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
        <span className="text-xs font-medium text-foreground">
          Alerts — {item.ticker}
        </span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="text-[10px] text-muted-foreground">
        Current:{" "}
        <span className="font-mono tabular-nums text-foreground">
          ${price.toFixed(2)}
        </span>
      </div>
      <div className="space-y-2">
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">
            Alert above ($)
          </label>
          <input
            type="number"
            value={above}
            onChange={(e) => setAbove(e.target.value)}
            placeholder={`e.g. ${(price * 1.05).toFixed(2)}`}
            className="w-full rounded border border-border bg-background px-2 py-1 text-xs font-mono tabular-nums focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">
            Alert below ($)
          </label>
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

// ─── WatchlistRow ─────────────────────────────────────────────────────────────

interface WatchlistRowProps {
  item: WatchlistItem;
  index: number;
  total: number;
  price: number;
  changePct: number;
  sparkValues: number[];
  isAlertEditorOpen: boolean;
  isActive: boolean;
  onToggleEditor: () => void;
  onNavigate: (ticker: string) => void;
  onRemove: (ticker: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

function WatchlistRow({
  item,
  index,
  total,
  price,
  changePct,
  sparkValues,
  isAlertEditorOpen,
  isActive,
  onToggleEditor,
  onNavigate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: WatchlistRowProps) {
  const alertActive = hasActiveAlert(item);

  return (
    <div className="group">
      <div
        className={cn(
          "flex items-center gap-0.5 px-2 py-1.5 hover:bg-accent/20 transition-colors",
          isActive && "bg-primary/5 border-l-2 border-primary",
          !isActive && "border-l-2 border-transparent",
        )}
      >
        {/* Up/Down arrows */}
        <div className="flex flex-col shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-0.5 text-muted-foreground/60 hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp className="h-2.5 w-2.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
            className="p-0.5 text-muted-foreground/60 hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown className="h-2.5 w-2.5" />
          </button>
        </div>

        {/* Ticker + price */}
        <button
          onClick={() => onNavigate(item.ticker)}
          className="flex flex-1 items-center gap-1.5 min-w-0 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-0.5">
              <span
                className={cn(
                  "text-xs font-semibold leading-none",
                  isActive ? "text-primary" : "text-foreground",
                )}
              >
                {item.ticker}
              </span>
              <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
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

          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <MiniSparkline values={sparkValues} />
            <div className="text-[10px] font-mono tabular-nums text-foreground">
              ${price.toFixed(2)}
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
                ? "text-primary/70 hover:text-primary"
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
        <AlertEditor item={item} price={price} onClose={onToggleEditor} />
      )}
    </div>
  );
}

// ─── Group-by types ───────────────────────────────────────────────────────────

type GroupBy = "none" | "sector" | "performance";

// ─── Main WatchlistPanel ──────────────────────────────────────────────────────

export function WatchlistPanel() {
  const { watchlist, addToWatchlist, removeFromWatchlist, reorderWatchlist } =
    useWatchlistStore();
  const { currentTicker, setTicker } = useChartStore();
  const router = useRouter();

  const [addInput, setAddInput] = useState("");
  const [addError, setAddError] = useState("");
  const [openEditorTicker, setOpenEditorTicker] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("none");

  // Simulate prices — stable per minute per ticker
  const prices = useMemo(() => {
    const map: Record<string, { price: number; changePct: number; spark: number[] }> = {};
    for (const item of watchlist) {
      const { price, changePct } = simulatePrice(item.ticker);
      map[item.ticker] = { price, changePct, spark: generateSparkData(item.ticker) };
    }
    return map;
  }, [watchlist]);

  // Sorted/grouped watchlist
  const displayList = useMemo(() => {
    if (groupBy === "none") return watchlist;
    if (groupBy === "performance") {
      return [...watchlist].sort((a, b) => {
        const pa = prices[a.ticker]?.changePct ?? 0;
        const pb = prices[b.ticker]?.changePct ?? 0;
        return pb - pa;
      });
    }
    // sector: sort by sector name
    return [...watchlist].sort((a, b) => {
      const sa = FUNDAMENTALS[a.ticker]?.sector ?? "ZZZ";
      const sb = FUNDAMENTALS[b.ticker]?.sector ?? "ZZZ";
      return sa.localeCompare(sb);
    });
  }, [watchlist, groupBy, prices]);

  const handleAdd = useCallback(() => {
    const ticker = addInput.trim().toUpperCase();
    if (!ticker) return;
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

  const handleMoveUp = useCallback(
    (index: number) => {
      // Find original index in watchlist (display list may be reordered for groupBy)
      if (groupBy !== "none") return; // only allow reorder when ungrouped
      reorderWatchlist(index, index - 1);
    },
    [groupBy, reorderWatchlist],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (groupBy !== "none") return;
      reorderWatchlist(index, index + 1);
    },
    [groupBy, reorderWatchlist],
  );

  // Quick-add from known stocks not yet watched
  const suggestions = useMemo(
    () =>
      WATCHLIST_STOCKS.filter(
        (s) => !watchlist.some((w) => w.ticker === s.ticker),
      ).slice(0, 4),
    [watchlist],
  );

  // Group headers for sector/performance grouping
  const groupedSections = useMemo(() => {
    if (groupBy === "none") return null;
    if (groupBy === "sector") {
      const sections: { label: string; items: WatchlistItem[] }[] = [];
      const seen = new Set<string>();
      for (const item of displayList) {
        const sector = FUNDAMENTALS[item.ticker]?.sector ?? "Other";
        if (!seen.has(sector)) {
          seen.add(sector);
          sections.push({ label: sector, items: [] });
        }
        sections[sections.length - 1].items.push(item);
      }
      return sections;
    }
    if (groupBy === "performance") {
      const winners = displayList.filter(
        (i) => (prices[i.ticker]?.changePct ?? 0) >= 0,
      );
      const losers = displayList.filter(
        (i) => (prices[i.ticker]?.changePct ?? 0) < 0,
      );
      return [
        { label: "Gainers", items: winners },
        { label: "Losers", items: losers },
      ].filter((s) => s.items.length > 0);
    }
    return null;
  }, [groupBy, displayList, prices]);

  return (
    <div className="flex flex-col bg-card overflow-hidden" style={{ height: "100%" }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2 shrink-0">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Watchlist
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground/60">
            {watchlist.length}
          </span>
          {/* Group-by selector */}
          <div className="relative">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="appearance-none rounded border border-border bg-background pl-1 pr-4 py-0.5 text-[10px] text-muted-foreground focus:outline-none focus:border-primary cursor-pointer"
              title="Group by"
            >
              <option value="none">None</option>
              <option value="sector">Sector</option>
              <option value="performance">Performance</option>
            </select>
            <LayoutList className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground/60" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <Bell className="h-6 w-6 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              Add tickers to track
            </p>
          </div>
        ) : groupedSections ? (
          groupedSections.map((section) => (
            <div key={section.label}>
              <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-muted-foreground/50 bg-muted/30 border-b border-border/40">
                {section.label}
              </div>
              {section.items.map((item) => {
                const { price, changePct, spark } = prices[item.ticker] ?? {
                  price: 0,
                  changePct: 0,
                  spark: [],
                };
                const originalIndex = watchlist.findIndex(
                  (w) => w.ticker === item.ticker,
                );
                return (
                  <WatchlistRow
                    key={item.ticker}
                    item={item}
                    index={originalIndex}
                    total={watchlist.length}
                    price={price}
                    changePct={changePct}
                    sparkValues={spark}
                    isAlertEditorOpen={openEditorTicker === item.ticker}
                    isActive={item.ticker === currentTicker}
                    onToggleEditor={() => handleToggleEditor(item.ticker)}
                    onNavigate={handleNavigate}
                    onRemove={handleRemove}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                  />
                );
              })}
            </div>
          ))
        ) : (
          displayList.map((item, idx) => {
            const { price, changePct, spark } = prices[item.ticker] ?? {
              price: 0,
              changePct: 0,
              spark: [],
            };
            return (
              <WatchlistRow
                key={item.ticker}
                item={item}
                index={idx}
                total={displayList.length}
                price={price}
                changePct={changePct}
                sparkValues={spark}
                isAlertEditorOpen={openEditorTicker === item.ticker}
                isActive={item.ticker === currentTicker}
                onToggleEditor={() => handleToggleEditor(item.ticker)}
                onNavigate={handleNavigate}
                onRemove={handleRemove}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
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
