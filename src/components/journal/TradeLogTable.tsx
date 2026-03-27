"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { formatCurrency, cn } from "@/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  ChevronRight,
  Check,
} from "lucide-react";
import type { TradeRow } from "@/app/(dashboard)/journal/JournalPageClient";
import { formatDuration } from "@/app/(dashboard)/journal/JournalPageClient";

// ── Types ───────────────────────────────────────────────────────────────────
type SortKey =
  | "index"
  | "date"
  | "ticker"
  | "direction"
  | "entry"
  | "exit"
  | "size"
  | "pnl"
  | "pnlPct"
  | "duration"
  | "grade";

type SortDir = "asc" | "desc";

interface Filters {
  ticker: string;
  direction: "all" | "long" | "short";
  grade: "all" | "A" | "B" | "C" | "D" | "F";
}

const DEFAULT_FILTERS: Filters = {
  ticker: "",
  direction: "all",
  grade: "all",
};

const NOTES_STORAGE_KEY = "finsim-journal-notes";

// ── localStorage helpers ────────────────────────────────────────────────────
function loadNotes(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveNotes(notes: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

// ── Column definitions ──────────────────────────────────────────────────────
const TABLE_COLS: {
  key: SortKey | "notes";
  label: string;
  noSort?: boolean;
  align?: "right";
}[] = [
  { key: "index",     label: "#" },
  { key: "date",      label: "Date" },
  { key: "ticker",    label: "Ticker" },
  { key: "direction", label: "Dir" },
  { key: "entry",     label: "Entry",    align: "right" },
  { key: "exit",      label: "Exit",     align: "right" },
  { key: "size",      label: "Size",     align: "right" },
  { key: "pnl",       label: "P&L ($)",  align: "right" },
  { key: "pnlPct",    label: "P&L (%)",  align: "right" },
  { key: "duration",  label: "Hold" },
  { key: "grade",     label: "Grade" },
  { key: "notes",     label: "Notes", noSort: true },
];

// ── Props ───────────────────────────────────────────────────────────────────
interface Props {
  rows: TradeRow[];
}

// ── Component ───────────────────────────────────────────────────────────────
export function TradeLogTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("index");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string>("");
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  // Focus textarea when row expands
  useEffect(() => {
    if (expandedId && noteRef.current) {
      noteRef.current.focus();
    }
  }, [expandedId]);

  // Unique tickers for filter dropdown
  const tickers = useMemo(
    () => Array.from(new Set(rows.map((r) => r.trade.ticker))).sort(),
    [rows],
  );

  // Filtered rows
  const filteredRows = useMemo(
    () =>
      rows.filter((r) => {
        if (
          filters.ticker &&
          !r.trade.ticker
            .toLowerCase()
            .includes(filters.ticker.toLowerCase())
        )
          return false;
        if (filters.direction !== "all" && r.direction !== filters.direction)
          return false;
        if (filters.grade !== "all" && r.grade.grade !== filters.grade)
          return false;
        return true;
      }),
    [rows, filters],
  );

  // Sorted rows
  const sortedRows = useMemo(() => {
    const arr = [...filteredRows];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "index":
          cmp = 0;
          break;
        case "date":
          cmp = a.trade.simulationDate - b.trade.simulationDate;
          break;
        case "ticker":
          cmp = a.trade.ticker.localeCompare(b.trade.ticker);
          break;
        case "direction":
          cmp = a.direction.localeCompare(b.direction);
          break;
        case "entry":
          cmp = a.entryPrice - b.entryPrice;
          break;
        case "exit":
          cmp = a.trade.price - b.trade.price;
          break;
        case "size":
          cmp = a.trade.quantity - b.trade.quantity;
          break;
        case "pnl":
          cmp = a.trade.realizedPnL - b.trade.realizedPnL;
          break;
        case "pnlPct":
          cmp = a.pnlPct - b.pnlPct;
          break;
        case "duration":
          cmp = a.durationMs - b.durationMs;
          break;
        case "grade":
          cmp = a.grade.grade.localeCompare(b.grade.grade);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filteredRows, sortKey, sortDir]);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortKey(key);
        setSortDir("desc");
      }
    },
    [sortKey],
  );

  const handleRowClick = useCallback(
    (id: string, currentNote: string) => {
      if (expandedId === id) {
        setExpandedId(null);
      } else {
        setExpandedId(id);
        setEditingNote(notes[id] ?? currentNote ?? "");
      }
    },
    [expandedId, notes],
  );

  const handleSaveNote = useCallback(
    (id: string) => {
      const updated = { ...notes, [id]: editingNote };
      setNotes(updated);
      saveNotes(updated);
      setExpandedId(null);
    },
    [notes, editingNote],
  );

  const activeFilterCount =
    (filters.ticker ? 1 : 0) +
    (filters.direction !== "all" ? 1 : 0) +
    (filters.grade !== "all" ? 1 : 0);

  if (rows.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-sm">
          No closed trades yet. Make some trades to populate the journal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
            showFilters || activeFilterCount > 0
              ? "border-primary/50 bg-primary/8 text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <Filter className="h-3 w-3" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground">
          {sortedRows.length} of {rows.length} rows
        </span>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-lg border border-border bg-card/50 p-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <FilterField label="Ticker">
            <select
              className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] outline-none focus:border-primary/50"
              value={filters.ticker}
              onChange={(e) =>
                setFilters((f) => ({ ...f, ticker: e.target.value }))
              }
            >
              <option value="">All Tickers</option>
              {tickers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Direction">
            <select
              className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] outline-none focus:border-primary/50"
              value={filters.direction}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  direction: e.target.value as Filters["direction"],
                }))
              }
            >
              <option value="all">All</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </FilterField>
          <FilterField label="Grade">
            <select
              className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] outline-none focus:border-primary/50"
              value={filters.grade}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  grade: e.target.value as Filters["grade"],
                }))
              }
            >
              <option value="all">All</option>
              {(["A", "B", "C", "D", "F"] as const).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </FilterField>
        </div>
      )}

      {/* Table */}
      {sortedRows.length === 0 ? (
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          No trades match the current filters.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full min-w-[820px] text-[11px]">
            <thead>
              <tr className="border-b border-border bg-card/60">
                {TABLE_COLS.map(({ key, label, noSort, align }) => (
                  <th
                    key={key}
                    className={cn(
                      "px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap",
                      align === "right" && "text-right",
                      !noSort &&
                        "cursor-pointer select-none hover:text-foreground transition-colors",
                    )}
                    onClick={
                      noSort ? undefined : () => handleSort(key as SortKey)
                    }
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        align === "right" && "flex-row-reverse",
                      )}
                    >
                      {label}
                      {!noSort && sortKey === key &&
                        (sortDir === "asc" ? (
                          <ChevronUp className="h-3 w-3 text-primary" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-primary" />
                        ))}
                    </span>
                  </th>
                ))}
                {/* Expand chevron column */}
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, idx) => {
                const t = row.trade;
                const isExpanded = expandedId === row.id;
                const date = new Date(t.simulationDate).toLocaleDateString(
                  "en-US",
                  { month: "2-digit", day: "2-digit", year: "2-digit" },
                );
                const savedNote = notes[row.id] ?? t.notes ?? "";

                return (
                  <>
                    <tr
                      key={row.id}
                      onClick={() => handleRowClick(row.id, t.notes ?? "")}
                      className={cn(
                        "border-b border-border/40 cursor-pointer transition-colors last:border-0",
                        isExpanded
                          ? "bg-accent/30"
                          : "hover:bg-accent/20",
                      )}
                    >
                      <td className="px-3 py-1.5 tabular-nums text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-1.5 tabular-nums text-muted-foreground whitespace-nowrap">
                        {date}
                      </td>
                      <td className="px-3 py-1.5 font-semibold">{t.ticker}</td>
                      <td className="px-3 py-1.5">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                            row.direction === "long"
                              ? "bg-green-500/12 text-green-400"
                              : "bg-red-500/12 text-red-400",
                          )}
                        >
                          {row.direction}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 tabular-nums text-right">
                        {formatCurrency(row.entryPrice)}
                      </td>
                      <td className="px-3 py-1.5 tabular-nums text-right">
                        {formatCurrency(t.price)}
                      </td>
                      <td className="px-3 py-1.5 tabular-nums text-right">
                        {t.quantity.toLocaleString()}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-1.5 tabular-nums font-medium text-right",
                          t.realizedPnL > 0
                            ? "text-green-400"
                            : t.realizedPnL < 0
                            ? "text-red-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {t.realizedPnL > 0 ? "+" : ""}
                        {formatCurrency(t.realizedPnL)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-1.5 tabular-nums font-medium text-right",
                          row.pnlPct > 0
                            ? "text-green-400"
                            : row.pnlPct < 0
                            ? "text-red-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {row.pnlPct > 0 ? "+" : ""}
                        {row.pnlPct.toFixed(2)}%
                      </td>
                      <td className="px-3 py-1.5 tabular-nums text-muted-foreground whitespace-nowrap">
                        {row.durationMs >= 0 ? formatDuration(row.durationMs) : "—"}
                      </td>
                      <td className="px-3 py-1.5">
                        <span
                          className={cn(
                            "text-sm font-bold",
                            row.grade.color,
                          )}
                        >
                          {row.grade.grade}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 max-w-[100px] truncate text-muted-foreground/60 italic">
                        {savedNote}
                      </td>
                      <td className="pr-2 text-right text-muted-foreground/40">
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 transition-transform",
                            isExpanded && "rotate-90",
                          )}
                        />
                      </td>
                    </tr>

                    {/* Expanded notes row */}
                    {isExpanded && (
                      <tr
                        key={`${row.id}-notes`}
                        className="border-b border-border/40 bg-accent/10"
                      >
                        <td
                          colSpan={TABLE_COLS.length + 1}
                          className="px-4 py-3"
                        >
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Trade Notes
                            </label>
                            <textarea
                              ref={noteRef}
                              value={editingNote}
                              onChange={(e) => setEditingNote(e.target.value)}
                              placeholder="Add notes about this trade — what worked, what did not, market conditions..."
                              rows={3}
                              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/50 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedId(null);
                                }}
                                className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
                              >
                                <X className="h-3 w-3" /> Cancel
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveNote(row.id);
                                }}
                                className="flex items-center gap-1 rounded-md bg-primary/10 border border-primary/30 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                              >
                                <Check className="h-3 w-3" /> Save
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
