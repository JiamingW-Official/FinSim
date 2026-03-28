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
  Pencil,
  Trash2,
  SlidersHorizontal,
  History,
  FileText,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useWatchlistStore,
  DEFAULT_COLUMNS,
  type ColumnId,
  type PriceAlert,
  type AlertType,
  type AlertExpiry,
} from "@/stores/watchlist-store";
import type { WatchlistItem } from "@/stores/watchlist-store";
import { useChartStore } from "@/stores/chart-store";
import { WATCHLIST_STOCKS } from "@/types/market";
import { FUNDAMENTALS } from "@/data/fundamentals";

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

function simulatePrice(ticker: string): { price: number; changePct: number; volume: number } {
  const base = BASE_PRICES[ticker] ?? 100;
  const seed = tickerSeed(ticker + Math.floor(Date.now() / 60000).toString());
  const rand = mulberry32(seed);
  const changePct = (rand() - 0.5) * 4;
  const price = base * (1 + changePct / 100);
  const volume = Math.floor(rand() * 50_000_000 + 5_000_000);
  return { price: Math.max(price, 0.01), changePct, volume };
}

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

function simulateRSI(ticker: string): number {
  const seed = tickerSeed(ticker + "rsi");
  const rand = mulberry32(seed);
  return Math.round(30 + rand() * 40);
}

// Simulate MA summary: how many of (20/50/200) the price is above
function simulateMASummary(ticker: string, price: number): { above: number; total: number } {
  const base = BASE_PRICES[ticker] ?? price;
  const seed = tickerSeed(ticker + "ma");
  const rand = mulberry32(seed);
  const ma20 = base * (0.97 + rand() * 0.06);
  const ma50 = base * (0.93 + rand() * 0.10);
  const ma200 = base * (0.85 + rand() * 0.20);
  const above = [ma20, ma50, ma200].filter((ma) => price > ma).length;
  return { above, total: 3 };
}

// TA summary: Bull/Bear/Neutral based on RSI + MA above count
function computeTASummary(
  ticker: string,
  price: number,
): "Bull" | "Bear" | "Neutral" {
  const rsi = simulateRSI(ticker);
  const { above } = simulateMASummary(ticker, price);
  const bullScore = (rsi > 55 ? 1 : rsi < 45 ? -1 : 0) + (above >= 2 ? 1 : above === 0 ? -1 : 0);
  if (bullScore >= 1) return "Bull";
  if (bullScore <= -1) return "Bear";
  return "Neutral";
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

// ─── MiniSparkline ────────────────────────────────────────────────────────────

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

// ─── TA Summary chip ──────────────────────────────────────────────────────────

function TASummaryChip({ signal }: { signal: "Bull" | "Bear" | "Neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1 py-0.5 text-[9px] font-semibold leading-none",
        signal === "Bull" && "bg-green-500/15 text-green-400",
        signal === "Bear" && "bg-red-500/15 text-red-400",
        signal === "Neutral" && "bg-muted text-muted-foreground",
      )}
    >
      {signal}
    </span>
  );
}

// ─── RSI chip ─────────────────────────────────────────────────────────────────

function RSIChip({ rsi }: { rsi: number }) {
  const color =
    rsi >= 70
      ? "text-red-400"
      : rsi <= 30
        ? "text-green-400"
        : "text-muted-foreground";
  return (
    <span className={cn("text-[10px] font-mono tabular-nums", color)}>{rsi}</span>
  );
}

// ─── 52-week position bar ─────────────────────────────────────────────────────

function Week52Bar({ ticker, price }: { ticker: string; price: number }) {
  const base = BASE_PRICES[ticker] ?? price;
  const low52 = base * 0.72;
  const high52 = base * 1.35;
  const pct = Math.max(0, Math.min(1, (price - low52) / (high52 - low52)));
  return (
    <div className="flex items-center gap-0.5 w-12">
      <div className="relative h-1 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className="absolute h-full rounded-full bg-primary/60"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── Note tooltip ─────────────────────────────────────────────────────────────

function NoteIndicator({ note }: { note: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <FileText className="h-3 w-3 text-amber-400/70 cursor-default" />
      {show && (
        <div className="absolute bottom-full right-0 mb-1 z-50 w-48 rounded border border-border bg-popover p-2 shadow-lg">
          <p className="text-[10px] text-muted-foreground whitespace-pre-wrap break-words">{note}</p>
        </div>
      )}
    </div>
  );
}

// ─── Note Editor ──────────────────────────────────────────────────────────────

interface NoteEditorProps {
  ticker: string;
  currentNote: string;
  onClose: () => void;
}

function NoteEditor({ ticker, currentNote, onClose }: NoteEditorProps) {
  const { setNote } = useWatchlistStore();
  const [value, setValue] = useState(currentNote);

  function handleSave() {
    setNote(ticker, value.trim());
    onClose();
  }

  return (
    <div className="border border-border rounded-md bg-background p-3 space-y-2 mx-2 mb-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">Note — {ticker}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`e.g. "Watching for breakout above $220"`}
        className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:border-primary resize-none"
        autoFocus
      />
      <div className="text-[9px] text-muted-foreground/50">Suggestions: Research needed · Watching for breakout · Earnings catalyst</div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 rounded bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Save
        </button>
        {currentNote && (
          <button
            onClick={() => { setNote(ticker, ""); onClose(); }}
            className="px-2 py-1 rounded border border-border text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Alert Editor (enhanced multi-alert) ─────────────────────────────────────

interface AlertEditorProps {
  item: WatchlistItem;
  price: number;
  onClose: () => void;
}

function AlertEditor({ item, price, onClose }: AlertEditorProps) {
  const { addAlert, removeAlert, toggleAlert } = useWatchlistStore();
  const [type, setType] = useState<AlertType>("above");
  const [value, setValue] = useState("");
  const [expiry, setExpiry] = useState<AlertExpiry>("one_time");
  const [addError, setAddError] = useState("");

  const alerts = item.alerts ?? [];

  function handleAdd() {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setAddError("Enter a valid number");
      return;
    }
    addAlert(item.ticker, { type, value: num, expiry, enabled: true });
    setValue("");
    setAddError("");
  }

  return (
    <div className="border border-border rounded-md bg-background p-3 space-y-3 mx-2 mb-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">Alerts — {item.ticker}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="text-[10px] text-muted-foreground">
        Current: <span className="font-mono tabular-nums text-foreground">${price.toFixed(2)}</span>
      </div>

      {/* Existing alerts */}
      {alerts.length > 0 && (
        <div className="space-y-1">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-1.5 group/al">
              <button
                onClick={() => toggleAlert(item.ticker, alert.id, !alert.enabled)}
                className={cn(
                  "h-3 w-3 rounded-full border flex-shrink-0 transition-colors",
                  alert.enabled
                    ? "bg-primary border-primary"
                    : "border-border bg-transparent",
                )}
              />
              <span className="flex-1 text-[10px] font-mono tabular-nums text-foreground">
                {alert.type === "above" && `> $${alert.value.toFixed(2)}`}
                {alert.type === "below" && `< $${alert.value.toFixed(2)}`}
                {alert.type === "pct_move" && `${alert.value > 0 ? "+" : ""}${alert.value}%`}
              </span>
              <span className="text-[9px] text-muted-foreground/60">
                {alert.expiry === "recurring" ? "∞" : "1x"}
              </span>
              <button
                onClick={() => removeAlert(item.ticker, alert.id)}
                className="opacity-0 group-hover/al:opacity-100 text-muted-foreground/40 hover:text-red-500 transition-all"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new alert */}
      <div className="space-y-2">
        <div className="flex gap-1">
          {(["above", "below", "pct_move"] as AlertType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "flex-1 rounded px-1 py-0.5 text-[9px] font-medium transition-colors border",
                type === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "above" ? "Above" : t === "below" ? "Below" : "% Move"}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            type="number"
            value={value}
            onChange={(e) => { setValue(e.target.value); setAddError(""); }}
            placeholder={
              type === "above"
                ? `e.g. ${(price * 1.05).toFixed(2)}`
                : type === "below"
                  ? `e.g. ${(price * 0.95).toFixed(2)}`
                  : "e.g. 5"
            }
            className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:border-primary"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <select
            value={expiry}
            onChange={(e) => setExpiry(e.target.value as AlertExpiry)}
            className="rounded border border-border bg-background px-1 py-1 text-[10px] text-muted-foreground focus:outline-none focus:border-primary"
          >
            <option value="one_time">1x</option>
            <option value="recurring">∞</option>
          </select>
          <button
            onClick={handleAdd}
            className="rounded bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        {addError && <p className="text-[10px] text-red-500">{addError}</p>}
      </div>
    </div>
  );
}

// ─── Alert History Panel ──────────────────────────────────────────────────────

function AlertHistoryPanel({ onClose }: { onClose: () => void }) {
  const { alertHistory } = useWatchlistStore();
  return (
    <div className="border-t border-border px-3 py-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Alert History
        </span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      </div>
      {alertHistory.length === 0 ? (
        <p className="text-[10px] text-muted-foreground/50">No alerts triggered yet</p>
      ) : (
        alertHistory.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-foreground">{entry.ticker}</span>
            <span className="text-[10px] text-muted-foreground flex-1">
              {entry.type === "above" ? "crossed above" : entry.type === "below" ? "dropped below" : "moved"}
              {" "}
              <span className="font-mono tabular-nums">{entry.type === "pct_move" ? `${entry.value}%` : `$${entry.value.toFixed(2)}`}</span>
            </span>
            <span className="text-[9px] text-muted-foreground/50">
              {new Date(entry.triggeredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Column Customizer ────────────────────────────────────────────────────────

function ColumnCustomizer({ onClose }: { onClose: () => void }) {
  const { columns, toggleColumn, moveColumnUp, moveColumnDown } = useWatchlistStore();

  return (
    <div className="border-t border-border px-3 py-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Columns
        </span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      </div>
      {columns.map((col, idx) => (
        <div key={col.id} className="flex items-center gap-1.5 group/col">
          <button
            onClick={() => toggleColumn(col.id as ColumnId)}
            className={cn(
              "h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors",
              col.enabled
                ? "bg-primary border-primary"
                : "border-border bg-transparent",
            )}
          >
            {col.enabled && <Check className="h-2 w-2 text-primary-foreground" />}
          </button>
          <span className="flex-1 text-[10px] text-foreground">{col.label}</span>
          <div className="flex flex-col opacity-0 group-hover/col:opacity-100 transition-opacity">
            <button
              onClick={() => moveColumnUp(col.id as ColumnId)}
              disabled={idx === 0}
              className="p-0.5 text-muted-foreground/60 hover:text-foreground disabled:opacity-20"
            >
              <ChevronUp className="h-2 w-2" />
            </button>
            <button
              onClick={() => moveColumnDown(col.id as ColumnId)}
              disabled={idx === columns.length - 1}
              className="p-0.5 text-muted-foreground/60 hover:text-foreground disabled:opacity-20"
            >
              <ChevronDown className="h-2 w-2" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── List Menu ────────────────────────────────────────────────────────────────

interface ListMenuProps {
  listId: string;
  listName: string;
  canDelete: boolean;
  onClose: () => void;
}

function ListMenu({ listId, listName, canDelete, onClose }: ListMenuProps) {
  const { renameList, deleteList } = useWatchlistStore();
  const [renaming, setRenaming] = useState(false);
  const [nameVal, setNameVal] = useState(listName);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  if (renaming) {
    return (
      <div
        ref={menuRef}
        className="absolute right-0 top-full mt-1 z-50 w-40 rounded border border-border bg-popover p-2 shadow-lg space-y-1.5"
      >
        <input
          autoFocus
          value={nameVal}
          onChange={(e) => setNameVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { renameList(listId, nameVal); onClose(); }
            if (e.key === "Escape") onClose();
          }}
          className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:border-primary"
        />
        <div className="flex gap-1">
          <button
            onClick={() => { renameList(listId, nameVal); onClose(); }}
            className="flex-1 rounded bg-primary px-1 py-0.5 text-[10px] text-primary-foreground"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded border border-border px-1 py-0.5 text-[10px] text-muted-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1 z-50 w-36 rounded border border-border bg-popover py-1 shadow-lg"
    >
      <button
        onClick={() => setRenaming(true)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] text-foreground hover:bg-accent/30 transition-colors"
      >
        <Pencil className="h-3 w-3 text-muted-foreground" />
        Rename
      </button>
      {canDelete && (
        <button
          onClick={() => { deleteList(listId); onClose(); }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] text-red-500 hover:bg-accent/30 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          Delete list
        </button>
      )}
    </div>
  );
}

// ─── WatchlistRow ─────────────────────────────────────────────────────────────

interface WatchlistRowProps {
  item: WatchlistItem;
  index: number;
  total: number;
  priceData: { price: number; changePct: number; volume: number; spark: number[] };
  enabledColumns: ColumnId[];
  isAlertEditorOpen: boolean;
  isNoteEditorOpen: boolean;
  isActive: boolean;
  onToggleEditor: () => void;
  onToggleNote: () => void;
  onNavigate: (ticker: string) => void;
  onRemove: (ticker: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

function WatchlistRow({
  item,
  index,
  total,
  priceData,
  enabledColumns,
  isAlertEditorOpen,
  isNoteEditorOpen,
  isActive,
  onToggleEditor,
  onToggleNote,
  onNavigate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: WatchlistRowProps) {
  const { price, changePct, volume, spark } = priceData;
  const activeAlerts = (item.alerts ?? []).filter((a) => a.enabled);
  const hasAlerts = activeAlerts.length > 0;
  const rsi = simulateRSI(item.ticker);
  const taSummary = computeTASummary(item.ticker, price);
  const fundamentals = FUNDAMENTALS[item.ticker];

  const showCol = (id: ColumnId) => enabledColumns.includes(id);

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

        {/* Ticker + sparkline (always visible) */}
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
              {item.notes && <NoteIndicator note={item.notes} />}
              <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Dynamic columns row */}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {showCol("changePct") && (
                <span
                  className={cn(
                    "text-[10px] font-mono tabular-nums",
                    changePct > 0
                      ? "text-green-500"
                      : changePct < 0
                        ? "text-red-500"
                        : "text-muted-foreground",
                  )}
                >
                  {changePct >= 0 ? "+" : ""}
                  {changePct.toFixed(2)}%
                </span>
              )}
              {showCol("volume") && (
                <span className="text-[9px] text-muted-foreground/60 font-mono tabular-nums">
                  {formatVolume(volume)}
                </span>
              )}
              {showCol("marketCap") && fundamentals && (
                <span className="text-[9px] text-muted-foreground/60">{fundamentals.marketCap}</span>
              )}
              {showCol("peRatio") && fundamentals && fundamentals.peRatio > 0 && (
                <span className="text-[9px] text-muted-foreground/60">P/E {fundamentals.peRatio}</span>
              )}
              {showCol("rsi") && <RSIChip rsi={rsi} />}
              {showCol("week52Pos") && <Week52Bar ticker={item.ticker} price={price} />}
              {showCol("taSummary") && <TASummaryChip signal={taSummary} />}
            </div>
          </div>

          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <MiniSparkline values={spark} />
            {showCol("price") && (
              <div className="text-[10px] font-mono tabular-nums text-foreground">
                ${price.toFixed(2)}
              </div>
            )}
          </div>
        </button>

        {/* Note button */}
        <button
          onClick={onToggleNote}
          title={item.notes ? "Edit note" : "Add note"}
          className={cn(
            "shrink-0 rounded p-1 transition-colors",
            isNoteEditorOpen
              ? "text-primary"
              : item.notes
                ? "text-amber-400/70 hover:text-amber-400"
                : "text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-muted-foreground",
          )}
        >
          <FileText className="h-3 w-3" />
        </button>

        {/* Alert bell */}
        <button
          onClick={onToggleEditor}
          title={hasAlerts ? `${activeAlerts.length} alert(s) active` : "Set price alert"}
          className={cn(
            "shrink-0 rounded p-1 transition-colors",
            isAlertEditorOpen
              ? "text-primary"
              : hasAlerts
                ? "text-primary/70 hover:text-primary"
                : "text-muted-foreground/40 hover:text-muted-foreground",
          )}
        >
          {hasAlerts ? (
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

      {/* Note editor inline */}
      {isNoteEditorOpen && (
        <NoteEditor
          ticker={item.ticker}
          currentNote={item.notes ?? ""}
          onClose={onToggleNote}
        />
      )}
    </div>
  );
}

// ─── Group-by types ───────────────────────────────────────────────────────────

type GroupBy = "none" | "sector" | "performance";

// ─── Main WatchlistPanel ──────────────────────────────────────────────────────

export function WatchlistPanel() {
  const store = useWatchlistStore();
  const {
    watchlist,
    lists,
    activeListId,
    columns,
    alertHistory,
    addToWatchlist,
    removeFromWatchlist,
    reorderWatchlist,
    createList,
    setActiveList,
    getActiveWatchlist,
  } = store;

  const { currentTicker, setTicker } = useChartStore();
  const router = useRouter();

  const [addInput, setAddInput] = useState("");
  const [addError, setAddError] = useState("");
  const [openEditorTicker, setOpenEditorTicker] = useState<string | null>(null);
  const [openNoteTicker, setOpenNoteTicker] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [showColumns, setShowColumns] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showListMenu, setShowListMenu] = useState(false);
  const [creatingList, setCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const listMenuRef = useRef<HTMLDivElement>(null);

  // Dismiss list menu on outside click
  useEffect(() => {
    if (!showListMenu) return;
    function handler(e: MouseEvent) {
      if (listMenuRef.current && !listMenuRef.current.contains(e.target as Node)) {
        setShowListMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showListMenu]);

  const activeWatchlist = useMemo(() => getActiveWatchlist(), [lists, activeListId, watchlist]);
  const activeList = useMemo(
    () => lists.find((l) => l.id === activeListId) ?? lists[0],
    [lists, activeListId],
  );

  const enabledColumns = useMemo(
    () => columns.filter((c) => c.enabled).map((c) => c.id as ColumnId),
    [columns],
  );

  // Simulate prices — stable per minute per ticker
  const prices = useMemo(() => {
    const map: Record<string, { price: number; changePct: number; volume: number; spark: number[] }> = {};
    for (const item of activeWatchlist) {
      const { price, changePct, volume } = simulatePrice(item.ticker);
      map[item.ticker] = { price, changePct, volume, spark: generateSparkData(item.ticker) };
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

  const handleToggleEditor = useCallback((ticker: string) => {
    setOpenEditorTicker((prev) => (prev === ticker ? null : ticker));
    setOpenNoteTicker(null);
  }, []);

  const handleToggleNote = useCallback((ticker: string) => {
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

  const handleCreateList = useCallback(() => {
    if (!newListName.trim()) return;
    createList(newListName.trim());
    setNewListName("");
    setCreatingList(false);
  }, [newListName, createList]);

  // Quick-add suggestions
  const suggestions = useMemo(
    () =>
      WATCHLIST_STOCKS.filter(
        (s) => !activeWatchlist.some((w) => w.ticker === s.ticker),
      ).slice(0, 4),
    [activeWatchlist],
  );

  // Group headers
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

  function renderRow(item: WatchlistItem, idx: number, totalForSection: number) {
    const pd = prices[item.ticker] ?? { price: 0, changePct: 0, volume: 0, spark: [] };
    return (
      <WatchlistRow
        key={item.ticker}
        item={item}
        index={idx}
        total={totalForSection}
        priceData={pd}
        enabledColumns={enabledColumns}
        isAlertEditorOpen={openEditorTicker === item.ticker}
        isNoteEditorOpen={openNoteTicker === item.ticker}
        isActive={item.ticker === currentTicker}
        onToggleEditor={() => handleToggleEditor(item.ticker)}
        onToggleNote={() => handleToggleNote(item.ticker)}
        onNavigate={handleNavigate}
        onRemove={handleRemove}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />
    );
  }

  return (
    <div className="flex flex-col bg-card overflow-hidden" style={{ height: "100%" }}>
      {/* ── Header: list selector + controls ── */}
      <div className="border-b border-border px-2 py-1.5 shrink-0 space-y-1.5">
        {/* Top row: label + icon buttons */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Watchlist
          </span>
          <div className="flex items-center gap-0.5">
            {/* Alert history */}
            <button
              onClick={() => { setShowHistory((v) => !v); setShowColumns(false); }}
              title="Alert history"
              className={cn(
                "rounded p-1 transition-colors",
                showHistory ? "text-primary" : "text-muted-foreground/50 hover:text-muted-foreground",
              )}
            >
              <History className="h-3 w-3" />
              {alertHistory.length > 0 && (
                <span className="sr-only">{alertHistory.length}</span>
              )}
            </button>
            {/* Column customizer */}
            <button
              onClick={() => { setShowColumns((v) => !v); setShowHistory(false); }}
              title="Customize columns"
              className={cn(
                "rounded p-1 transition-colors",
                showColumns ? "text-primary" : "text-muted-foreground/50 hover:text-muted-foreground",
              )}
            >
              <SlidersHorizontal className="h-3 w-3" />
            </button>
            {/* Group-by */}
            <div className="relative">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                className="appearance-none rounded border border-border bg-background pl-1 pr-4 py-0.5 text-[10px] text-muted-foreground focus:outline-none focus:border-primary cursor-pointer"
                title="Group by"
              >
                <option value="none">None</option>
                <option value="sector">Sector</option>
                <option value="performance">Perf.</option>
              </select>
              <LayoutList className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground/60" />
            </div>
          </div>
        </div>

        {/* List selector row */}
        <div className="flex items-center gap-1">
          <div className="flex-1 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => setActiveList(list.id)}
                className={cn(
                  "shrink-0 rounded px-2 py-0.5 text-[10px] font-medium transition-colors whitespace-nowrap",
                  list.id === activeListId
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30",
                )}
              >
                {list.name}
              </button>
            ))}
          </div>

          {/* New list button */}
          <button
            onClick={() => setCreatingList(true)}
            title="New list"
            className="shrink-0 rounded p-0.5 text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>

          {/* List menu (rename/delete) */}
          <div className="relative shrink-0" ref={listMenuRef}>
            <button
              onClick={() => setShowListMenu((v) => !v)}
              title="List options"
              className={cn(
                "rounded p-0.5 transition-colors",
                showListMenu ? "text-primary" : "text-muted-foreground/50 hover:text-foreground",
              )}
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
            {showListMenu && (
              <ListMenu
                listId={activeList.id}
                listName={activeList.name}
                canDelete={lists.length > 1}
                onClose={() => setShowListMenu(false)}
              />
            )}
          </div>
        </div>

        {/* New list creation input */}
        {creatingList && (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateList();
                if (e.key === "Escape") { setCreatingList(false); setNewListName(""); }
              }}
              placeholder="List name..."
              className="flex-1 rounded border border-border bg-background px-2 py-0.5 text-xs focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleCreateList}
              disabled={!newListName.trim()}
              className="rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground disabled:opacity-40"
            >
              Create
            </button>
            <button
              onClick={() => { setCreatingList(false); setNewListName(""); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Count */}
        <div className="text-[9px] text-muted-foreground/40">
          {activeWatchlist.length} ticker{activeWatchlist.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Column customizer panel ── */}
      {showColumns && <ColumnCustomizer onClose={() => setShowColumns(false)} />}

      {/* ── Alert history panel ── */}
      {showHistory && <AlertHistoryPanel onClose={() => setShowHistory(false)} />}

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeWatchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <Bell className="h-6 w-6 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">Add tickers to track</p>
          </div>
        ) : groupedSections ? (
          groupedSections.map((section) => (
            <div key={section.label}>
              <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-muted-foreground/50 bg-muted/30 border-b border-border/40">
                {section.label}
              </div>
              {section.items.map((item, idx) => renderRow(item, idx, section.items.length))}
            </div>
          ))
        ) : (
          displayList.map((item, idx) => renderRow(item, idx, displayList.length))
        )}

        {/* Quick-add suggestions */}
        {suggestions.length > 0 && activeWatchlist.length > 0 && (
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

      {/* ── Add input ── */}
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
                if (e.key === "Escape") { setAddInput(""); setAddError(""); }
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
        {addError && <p className="mt-1 text-[10px] text-red-500">{addError}</p>}
      </div>
    </div>
  );
}
