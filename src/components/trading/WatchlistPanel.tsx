"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  LayoutList,
  MoreHorizontal,
  Check,
  Pencil,
  Copy,
  Trash2,
  StickyNote,
  BarChart2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { useChartStore } from "@/stores/chart-store";
import { WATCHLIST_STOCKS } from "@/types/market";
import { FUNDAMENTALS } from "@/data/fundamentals";
import type { WatchlistItem, AlertType } from "@/stores/watchlist-store";

// ─── Shared price utility ────────────────────────────────────────────────────
import { mulberry32, tickerHash, simulateTickerPrice, getDaySeed, BASE_PRICES } from "@/services/market-data/simulate-price";

/** Alias kept for local helpers that need the hash */
const tickerSeed = tickerHash;

function simulatePrice(ticker: string): { price: number; changePct: number } {
  return simulateTickerPrice(ticker, getDaySeed());
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

// TA signal seeded by ticker — lightweight, no computation
type TASignal = "bull" | "bear" | "neutral";
function getTASignal(ticker: string): TASignal {
  const seed = tickerSeed(ticker + "ta" + Math.floor(Date.now() / 3600000).toString());
  const rand = mulberry32(seed);
  const v = rand();
  if (v < 0.38) return "bull";
  if (v < 0.62) return "neutral";
  return "bear";
}

// Performance stats seeded by ticker + date bucket
function getPerformanceStats(ticker: string): { w1: number; m1: number; ytd: number; sharpe: number } {
  const seed = tickerSeed(ticker + "perf" + Math.floor(Date.now() / 86400000).toString());
  const rand = mulberry32(seed);
  const w1 = (rand() - 0.45) * 8;
  const m1 = (rand() - 0.45) * 18;
  const ytd = (rand() - 0.40) * 40;
  const sharpe = rand() * 2.5 - 0.5;
  return { w1, m1, ytd, sharpe };
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

// ─── TAChip ───────────────────────────────────────────────────────────────────

function TAChip({ signal }: { signal: TASignal }) {
  return (
    <span
      className={cn(
        "rounded px-1 py-0.5 text-[11px] font-semibold uppercase tracking-wide shrink-0",
        signal === "bull" && "bg-green-500/15 text-green-500",
        signal === "bear" && "bg-red-500/15 text-red-500",
        signal === "neutral" && "bg-muted text-muted-foreground",
      )}
    >
      {signal === "bull" ? "Bull" : signal === "bear" ? "Bear" : "Neut"}
    </span>
  );
}

// ─── ListDropdown ─────────────────────────────────────────────────────────────

interface ListDropdownProps {
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
  onClose: () => void;
}

function ListDropdown({ onRename, onDuplicate, onDelete, canDelete, onClose }: ListDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 z-50 mt-1 min-w-[120px] rounded border border-border bg-card shadow-md"
    >
      <button
        onClick={() => { onRename(); onClose(); }}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] text-foreground hover:bg-accent/30 transition-colors"
      >
        <Pencil className="h-3 w-3 text-muted-foreground" />
        Rename
      </button>
      <button
        onClick={() => { onDuplicate(); onClose(); }}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] text-foreground hover:bg-accent/30 transition-colors"
      >
        <Copy className="h-3 w-3 text-muted-foreground" />
        Duplicate
      </button>
      {canDelete && (
        <button
          onClick={() => { onDelete(); onClose(); }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      )}
    </div>
  );
}

// ─── MultiAlertModal ──────────────────────────────────────────────────────────

interface MultiAlertModalProps {
  item: WatchlistItem;
  price: number;
  onClose: () => void;
}

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  above: "Price Above",
  below: "Price Below",
  pct_move: "% Change",
};

function MultiAlertModal({ item, price, onClose }: MultiAlertModalProps) {
  const { addAlert, removeAlert, toggleAlert, alertHistory } = useWatchlistStore();
  const [type, setType] = useState<AlertType>("above");
  const [value, setValue] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const alerts = item.alerts ?? [];
  const tickerHistory = alertHistory.filter((h) => h.ticker === item.ticker).slice(0, 5);

  function handleAdd() {
    const v = parseFloat(value);
    if (isNaN(v) || v <= 0) return;
    addAlert(item.ticker, { type, value: v, expiry: "one_time", enabled: true });
    setValue("");
  }

  return (
    <div className="border border-border rounded-md bg-background p-3 space-y-3 mx-2 mb-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">Alerts — {item.ticker}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="text-xs text-muted-foreground">
        Current:{" "}
        <span className="font-mono tabular-nums text-foreground">${price.toFixed(2)}</span>
      </div>

      {/* Existing alerts */}
      {alerts.length > 0 && (
        <div className="space-y-1">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-2 text-xs">
              <button
                onClick={() => toggleAlert(item.ticker, alert.id, !alert.enabled)}
                className={cn(
                  "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors",
                  alert.enabled
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background",
                )}
              >
                {alert.enabled && <Check className="h-2 w-2" />}
              </button>
              <span className="text-muted-foreground">{ALERT_TYPE_LABELS[alert.type]}</span>
              <span className="font-mono tabular-nums text-foreground">
                {alert.type === "pct_move" ? `${alert.value}%` : `$${alert.value.toFixed(2)}`}
              </span>
              <button
                onClick={() => removeAlert(item.ticker, alert.id)}
                className="ml-auto text-muted-foreground/40 hover:text-red-500 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new alert */}
      <div className="space-y-1.5">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AlertType)}
          className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
        >
          <option value="above">Price Above</option>
          <option value="below">Price Below</option>
          <option value="pct_move">% Change</option>
        </select>
        <div className="flex gap-1.5">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder={
              type === "above"
                ? `e.g. ${(price * 1.05).toFixed(2)}`
                : type === "below"
                  ? `e.g. ${(price * 0.95).toFixed(2)}`
                  : "e.g. 5"
            }
            className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleAdd}
            disabled={!value.trim()}
            className="flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-2.5 w-2.5" />
            Add
          </button>
        </div>
      </div>

      {/* Alert history */}
      {tickerHistory.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory((p) => !p)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            <Clock className="h-2.5 w-2.5" />
            History ({tickerHistory.length})
          </button>
          {showHistory && (
            <div className="mt-1 space-y-0.5">
              {tickerHistory.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="shrink-0">{ALERT_TYPE_LABELS[h.type]}</span>
                  <span className="font-mono tabular-nums">
                    {h.type === "pct_move" ? `${h.value}%` : `$${h.value.toFixed(2)}`}
                  </span>
                  <span className="ml-auto font-mono tabular-nums">
                    {new Date(h.triggeredAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── InlineNote ───────────────────────────────────────────────────────────────

interface InlineNoteProps {
  ticker: string;
  note: string;
  onClose: () => void;
}

function InlineNote({ ticker, note, onClose }: InlineNoteProps) {
  const { setNote } = useWatchlistStore();
  const [value, setValue] = useState(note);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSave() {
    setNote(ticker, value.trim());
    onClose();
  }

  return (
    <div className="px-2 pb-1.5 -mt-0.5">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onClose();
        }}
        onBlur={handleSave}
        placeholder="Add note..."
        className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:border-primary"
      />
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
  taSignal: TASignal;
  isAlertEditorOpen: boolean;
  isNoteEditorOpen: boolean;
  isActive: boolean;
  showPerformance: boolean;
  onToggleAlertEditor: () => void;
  onToggleNoteEditor: () => void;
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
  taSignal,
  isAlertEditorOpen,
  isNoteEditorOpen,
  isActive,
  showPerformance,
  onToggleAlertEditor,
  onToggleNoteEditor,
  onNavigate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: WatchlistRowProps) {
  const alerts = item.alerts ?? [];
  const activeAlertCount = alerts.filter((a) => a.enabled).length;
  const hasLegacyAlert =
    (item.alertAbove !== undefined && item.alertAboveEnabled !== false) ||
    (item.alertBelow !== undefined && item.alertBelowEnabled !== false);
  const hasAlert = activeAlertCount > 0 || hasLegacyAlert;

  const perf = useMemo(
    () => (showPerformance ? getPerformanceStats(item.ticker) : null),
    [item.ticker, showPerformance],
  );

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

        {/* Ticker + data */}
        <button
          onClick={() => onNavigate(item.ticker)}
          className="flex flex-1 items-center gap-1.5 min-w-0 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-semibold leading-none",
                  isActive ? "text-primary" : "text-foreground",
                )}
              >
                {item.ticker}
              </span>
              <TAChip signal={taSignal} />
              {activeAlertCount > 0 && (
                <span className="rounded-full bg-primary/20 px-1 text-[8px] font-medium text-primary leading-3 py-0.5">
                  {activeAlertCount}
                </span>
              )}
              <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Note display */}
            {item.notes && !isNoteEditorOpen && (
              <p className="text-[11px] italic text-muted-foreground/70 mt-0.5 truncate">
                {item.notes}
              </p>
            )}

            {!showPerformance && (
              <div
                className={cn(
                  "text-xs font-mono tabular-nums mt-0.5",
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
            )}

            {showPerformance && perf && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn("text-[11px] font-mono tabular-nums", perf.w1 >= 0 ? "text-green-500" : "text-red-500")}>
                  1W {perf.w1 >= 0 ? "+" : ""}{perf.w1.toFixed(1)}%
                </span>
                <span className={cn("text-[11px] font-mono tabular-nums", perf.m1 >= 0 ? "text-green-500" : "text-red-500")}>
                  1M {perf.m1 >= 0 ? "+" : ""}{perf.m1.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-0.5 shrink-0">
            {!showPerformance && <MiniSparkline values={sparkValues} />}
            {!showPerformance && (
              <div className="text-xs font-mono tabular-nums text-foreground">
                ${price.toFixed(2)}
              </div>
            )}
            {showPerformance && perf && (
              <div className="flex flex-col items-end gap-0.5">
                <span className={cn("text-[11px] font-mono tabular-nums", perf.ytd >= 0 ? "text-green-500" : "text-red-500")}>
                  YTD {perf.ytd >= 0 ? "+" : ""}{perf.ytd.toFixed(1)}%
                </span>
                <span className={cn("text-[11px] font-mono tabular-nums", perf.sharpe >= 1 ? "text-green-500" : perf.sharpe >= 0 ? "text-muted-foreground" : "text-red-500")}>
                  SR {perf.sharpe.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </button>

        {/* Note button */}
        <button
          onClick={onToggleNoteEditor}
          title="Add note"
          className={cn(
            "shrink-0 rounded p-1 transition-colors",
            item.notes
              ? "text-primary/70 hover:text-primary"
              : "text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-muted-foreground",
          )}
        >
          <StickyNote className="h-3 w-3" />
        </button>

        {/* Alert bell */}
        <button
          onClick={onToggleAlertEditor}
          title={hasAlert ? "Edit alerts" : "Set price alert"}
          className={cn(
            "shrink-0 rounded p-1 transition-colors",
            isAlertEditorOpen
              ? "text-primary"
              : hasAlert
                ? "text-primary/70 hover:text-primary"
                : "text-muted-foreground/40 hover:text-muted-foreground",
          )}
        >
          {hasAlert ? (
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

      {/* Note editor */}
      {isNoteEditorOpen && (
        <InlineNote
          ticker={item.ticker}
          note={item.notes ?? ""}
          onClose={onToggleNoteEditor}
        />
      )}

      {/* Alert editor inline */}
      {isAlertEditorOpen && (
        <MultiAlertModal item={item} price={price} onClose={onToggleAlertEditor} />
      )}
    </div>
  );
}

// ─── Group-by types ───────────────────────────────────────────────────────────

type GroupBy = "none" | "sector" | "performance";

// ─── Main WatchlistPanel ──────────────────────────────────────────────────────

export function WatchlistPanel() {
  const {
    watchlist,
    lists,
    activeListId,
    addToWatchlist,
    removeFromWatchlist,
    reorderWatchlist,
    createList,
    renameList,
    deleteList,
    setActiveList,
    addTickerToList,
    getActiveWatchlist,
  } = useWatchlistStore();
  const { currentTicker, setTicker } = useChartStore();
  const router = useRouter();

  const [addInput, setAddInput] = useState("");
  const [addError, setAddError] = useState("");
  const [openEditorTicker, setOpenEditorTicker] = useState<string | null>(null);
  const [openNoteTicker, setOpenNoteTicker] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [showPerformance, setShowPerformance] = useState(false);

  // List management state
  const [showListMenu, setShowListMenu] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isRenamingList, setIsRenamingList] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const newListInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const listMenuAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCreatingList) newListInputRef.current?.focus();
  }, [isCreatingList]);

  useEffect(() => {
    if (isRenamingList) renameInputRef.current?.focus();
  }, [isRenamingList]);

  const activeList = lists.find((l) => l.id === activeListId) ?? lists[0];

  // Active watchlist items (from active list)
  const activeWatchlist = useMemo(
    () => getActiveWatchlist(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lists, activeListId, watchlist],
  );

  // Simulate prices
  const prices = useMemo(() => {
    const map: Record<string, { price: number; changePct: number; spark: number[]; ta: TASignal }> = {};
    for (const item of activeWatchlist) {
      const { price, changePct } = simulatePrice(item.ticker);
      map[item.ticker] = {
        price,
        changePct,
        spark: generateSparkData(item.ticker),
        ta: getTASignal(item.ticker),
      };
    }
    return map;
  }, [activeWatchlist]);

  // Sorted/grouped watchlist
  const displayList = useMemo(() => {
    if (groupBy === "none") return activeWatchlist;
    if (groupBy === "performance") {
      return [...activeWatchlist].sort((a, b) => {
        const pa = prices[a.ticker]?.changePct ?? 0;
        const pb = prices[b.ticker]?.changePct ?? 0;
        return pb - pa;
      });
    }
    return [...activeWatchlist].sort((a, b) => {
      const sa = FUNDAMENTALS[a.ticker]?.sector ?? "ZZZ";
      const sb = FUNDAMENTALS[b.ticker]?.sector ?? "ZZZ";
      return sa.localeCompare(sb);
    });
  }, [activeWatchlist, groupBy, prices]);

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

  const handleToggleAlertEditor = useCallback((ticker: string) => {
    setOpenEditorTicker((prev) => (prev === ticker ? null : ticker));
    setOpenNoteTicker(null);
  }, []);

  const handleToggleNoteEditor = useCallback((ticker: string) => {
    setOpenNoteTicker((prev) => (prev === ticker ? null : ticker));
    setOpenEditorTicker(null);
  }, []);

  const handleRemove = useCallback(
    (ticker: string) => {
      removeFromWatchlist(ticker);
      if (openEditorTicker === ticker) setOpenEditorTicker(null);
      if (openNoteTicker === ticker) setOpenNoteTicker(null);
    },
    [removeFromWatchlist, openEditorTicker, openNoteTicker],
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (groupBy !== "none") return;
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

  // Suggestions: stocks not in active list
  const suggestions = useMemo(
    () =>
      WATCHLIST_STOCKS.filter(
        (s) => !activeWatchlist.some((w) => w.ticker === s.ticker),
      ).slice(0, 4),
    [activeWatchlist],
  );

  // Group sections
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
      const winners = displayList.filter((i) => (prices[i.ticker]?.changePct ?? 0) >= 0);
      const losers = displayList.filter((i) => (prices[i.ticker]?.changePct ?? 0) < 0);
      return [
        { label: "Gainers", items: winners },
        { label: "Losers", items: losers },
      ].filter((s) => s.items.length > 0);
    }
    return null;
  }, [groupBy, displayList, prices]);

  function handleCreateList() {
    const name = newListName.trim();
    if (!name) return;
    createList(name);
    setNewListName("");
    setIsCreatingList(false);
  }

  function handleRenameList() {
    const name = renameValue.trim();
    if (name) renameList(activeListId, name);
    setRenameValue("");
    setIsRenamingList(false);
  }

  function handleDuplicateList() {
    const sourceTickers = [...activeList.tickers];
    createList(activeList.name + " (copy)");
    // After createList, the new list becomes active — add tickers to it
    const state = useWatchlistStore.getState();
    const newListId = state.activeListId;
    for (const ticker of sourceTickers) {
      addTickerToList(newListId, ticker);
    }
  }

  function renderRow(item: WatchlistItem, idx: number, totalCount: number) {
    const { price, changePct, spark, ta } = prices[item.ticker] ?? {
      price: 0,
      changePct: 0,
      spark: [] as number[],
      ta: "neutral" as TASignal,
    };
    return (
      <WatchlistRow
        key={item.ticker}
        item={item}
        index={idx}
        total={totalCount}
        price={price}
        changePct={changePct}
        sparkValues={spark}
        taSignal={ta}
        isAlertEditorOpen={openEditorTicker === item.ticker}
        isNoteEditorOpen={openNoteTicker === item.ticker}
        isActive={item.ticker === currentTicker}
        showPerformance={showPerformance}
        onToggleAlertEditor={() => handleToggleAlertEditor(item.ticker)}
        onToggleNoteEditor={() => handleToggleNoteEditor(item.ticker)}
        onNavigate={handleNavigate}
        onRemove={handleRemove}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />
    );
  }

  return (
    <div className="flex flex-col bg-card overflow-hidden" style={{ height: "100%" }}>
      {/* Header row 1: label + count + mode toggles */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2 shrink-0">
        <span className="text-xs font-medium text-muted-foreground">
          Watchlist
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground/60">
            {activeWatchlist.length}
          </span>
          {/* Performance mode toggle */}
          <button
            onClick={() => setShowPerformance((p) => !p)}
            title={showPerformance ? "Show current prices" : "Show performance stats"}
            className={cn(
              "rounded p-0.5 transition-colors",
              showPerformance
                ? "text-primary"
                : "text-muted-foreground/50 hover:text-muted-foreground",
            )}
          >
            <BarChart2 className="h-3 w-3" />
          </button>
          {/* Group-by selector */}
          <div className="relative">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="appearance-none rounded border border-border bg-background pl-1 pr-4 py-0.5 text-xs text-muted-foreground focus:outline-none focus:border-primary cursor-pointer"
              title="Group by"
            >
              <option value="none">None</option>
              <option value="sector">Sector</option>
              <option value="performance">Perf</option>
            </select>
            <LayoutList className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground/60" />
          </div>
        </div>
      </div>

      {/* Header row 2: Named list switcher */}
      <div className="flex items-center gap-1 border-b border-border/60 px-2 py-1.5 shrink-0">
        {/* List dropdown / rename input */}
        <div className="relative flex-1 min-w-0">
          {isRenamingList ? (
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameList();
                if (e.key === "Escape") { setIsRenamingList(false); setRenameValue(""); }
              }}
              onBlur={handleRenameList}
              className="w-full rounded border border-primary bg-background px-2 py-0.5 text-[11px] font-medium focus:outline-none"
            />
          ) : (
            <select
              value={activeListId}
              onChange={(e) => setActiveList(e.target.value)}
              className="w-full appearance-none rounded border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              {lists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* New list "+" button */}
        {!isCreatingList && (
          <button
            onClick={() => { setIsCreatingList(true); setShowListMenu(false); }}
            title="New watchlist"
            className="shrink-0 rounded p-0.5 text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}

        {/* ⋯ menu anchor */}
        <div className="relative shrink-0" ref={listMenuAnchorRef}>
          <button
            onClick={() => setShowListMenu((p) => !p)}
            title="List options"
            className={cn(
              "rounded p-0.5 transition-colors",
              showListMenu ? "text-primary" : "text-muted-foreground/50 hover:text-foreground",
            )}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          {showListMenu && (
            <ListDropdown
              onRename={() => { setRenameValue(activeList.name); setIsRenamingList(true); }}
              onDuplicate={handleDuplicateList}
              onDelete={() => deleteList(activeListId)}
              canDelete={lists.length > 1}
              onClose={() => setShowListMenu(false)}
            />
          )}
        </div>
      </div>

      {/* Inline new-list name input */}
      {isCreatingList && (
        <div className="border-b border-border/60 px-2 py-1.5 shrink-0">
          <div className="flex items-center gap-1">
            <input
              ref={newListInputRef}
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateList();
                if (e.key === "Escape") { setIsCreatingList(false); setNewListName(""); }
              }}
              onBlur={() => {
                if (newListName.trim()) handleCreateList();
                else { setIsCreatingList(false); setNewListName(""); }
              }}
              placeholder="List name..."
              className="flex-1 rounded border border-primary bg-background px-2 py-0.5 text-[11px] focus:outline-none"
            />
            <button
              onClick={handleCreateList}
              disabled={!newListName.trim()}
              className="rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Ticker list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeWatchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LayoutList className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Watchlist empty</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Use the + button above to add tickers you want to track</p>
          </div>
        ) : groupedSections ? (
          groupedSections.map((section) => (
            <div key={section.label}>
              <div className="px-3 py-1 text-[11px] text-muted-foreground/50 bg-muted/30 border-b border-border/40">
                {section.label}
              </div>
              {section.items.map((item) => {
                const originalIndex = activeWatchlist.findIndex((w) => w.ticker === item.ticker);
                return renderRow(item, originalIndex, activeWatchlist.length);
              })}
            </div>
          ))
        ) : (
          displayList.map((item, idx) => renderRow(item, idx, displayList.length))
        )}

        {/* Quick-add suggestions */}
        {suggestions.length > 0 && activeWatchlist.length > 0 && (
          <div className="border-t border-border/50 px-3 pt-2 pb-1">
            <div className="text-[11px] text-muted-foreground/50 mb-1.5">
              Quick add
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((s) => (
                <button
                  key={s.ticker}
                  onClick={() => addToWatchlist(s.ticker)}
                  className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
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
            className="flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        {addError && (
          <p className="mt-1 text-xs text-red-500">{addError}</p>
        )}
      </div>
    </div>
  );
}
