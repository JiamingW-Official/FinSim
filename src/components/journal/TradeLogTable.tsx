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
  Tag,
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
  tag: string;
}

const DEFAULT_FILTERS: Filters = {
  ticker: "",
  direction: "all",
  grade: "all",
  tag: "",
};

const NOTES_STORAGE_KEY = "finsim-journal-notes";
const TAGS_STORAGE_KEY = "finsim-trade-tags-v1";

// ── Common tags ──────────────────────────────────────────────────────────────
export const COMMON_TAGS = [
  "FOMO",
  "Disciplined",
  "Revenge Trade",
  "Planned",
  "Impulsive",
  "Breakout",
  "Reversal",
  "News Play",
] as const;

// Tag color map for consistent styling
const TAG_COLORS: Record<string, string> = {
  "FOMO":          "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Disciplined":   "bg-green-500/15 text-green-400 border-green-500/30",
  "Revenge Trade": "bg-red-500/15 text-red-400 border-red-500/30",
  "Planned":       "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Impulsive":     "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Breakout":      "bg-teal-500/15 text-teal-400 border-teal-500/30",
  "Reversal":      "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "News Play":     "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

function tagColorClass(tag: string): string {
  return TAG_COLORS[tag] ?? "bg-muted/50 text-muted-foreground border-border";
}

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

export function loadTradeTags(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(TAGS_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveTradeTags(tags: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  } catch {
    // ignore
  }
}

// ── Column definitions ──────────────────────────────────────────────────────
const TABLE_COLS: {
  key: SortKey | "notes" | "tags";
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
  { key: "tags",      label: "Tags",  noSort: true },
  { key: "notes",     label: "Notes", noSort: true },
];

// ── Props ───────────────────────────────────────────────────────────────────
interface Props {
  rows: TradeRow[];
  /** When true, renders a compact tag-stats section instead of the table */
  analyticsMode?: boolean;
}

// ── Tag Stats Bar Chart ──────────────────────────────────────────────────────
export function TagStatsChart({ tradeTags }: { tradeTags: Record<string, string[]> }) {
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tags of Object.values(tradeTags)) {
      for (const tag of tags) {
        counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }
    return counts;
  }, [tradeTags]);

  const sorted = useMemo(
    () =>
      Object.entries(tagCounts).sort((a, b) => b[1] - a[1]),
    [tagCounts],
  );

  if (sorted.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground">
        No tags added yet. Tag your trades in the Log tab.
      </p>
    );
  }

  const maxCount = sorted[0][1];
  const mostCommon = sorted[0][0];

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground">
        Most common tag:{" "}
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 text-[9px] font-semibold",
            tagColorClass(mostCommon),
          )}
        >
          {mostCommon}
        </span>{" "}
        ({sorted[0][1]} trade{sorted[0][1] !== 1 ? "s" : ""})
      </p>
      <div className="space-y-1.5">
        {sorted.map(([tag, count]) => (
          <div key={tag} className="flex items-center gap-2">
            <span
              className={cn(
                "w-28 shrink-0 rounded border px-1.5 py-0.5 text-center text-[9px] font-semibold truncate",
                tagColorClass(tag),
              )}
            >
              {tag}
            </span>
            <div className="flex h-4 flex-1 overflow-hidden rounded-sm bg-muted/20">
              <div
                className="h-full bg-primary/40 transition-all"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-5 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component ───────────────────────────────────────────────────────────────
export function TradeLogTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("index");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [tradeTags, setTradeTags] = useState<Record<string, string[]>>({});
  const [editingNote, setEditingNote] = useState<string>("");
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Load notes + tags from localStorage on mount
  useEffect(() => {
    setNotes(loadNotes());
    setTradeTags(loadTradeTags());
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

  // All tags used (for filter dropdown)
  const allUsedTags = useMemo(() => {
    const s = new Set<string>();
    for (const tags of Object.values(tradeTags)) {
      for (const t of tags) s.add(t);
    }
    return Array.from(s).sort();
  }, [tradeTags]);

  // Toggle a tag on a row
  const toggleTag = useCallback(
    (tradeId: string, tag: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setTradeTags((prev) => {
        const current = prev[tradeId] ?? [];
        const next = current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag];
        const updated = { ...prev, [tradeId]: next };
        saveTradeTags(updated);
        return updated;
      });
    },
    [],
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
        if (filters.tag) {
          const rowTags = tradeTags[r.id] ?? r.trade.tags ?? [];
          if (!rowTags.includes(filters.tag)) return false;
        }
        return true;
      }),
    [rows, filters, tradeTags],
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
    (filters.grade !== "all" ? 1 : 0) +
    (filters.tag ? 1 : 0);

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
        <div className="rounded-lg border border-border bg-card/50 p-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          <FilterField label="Tag">
            <select
              className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] outline-none focus:border-primary/50"
              value={filters.tag}
              onChange={(e) =>
                setFilters((f) => ({ ...f, tag: e.target.value }))
              }
            >
              <option value="">All Tags</option>
              {allUsedTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
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
          <table className="w-full min-w-[900px] text-[11px]">
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
                const rowTags = tradeTags[row.id] ?? t.tags ?? [];

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
                      {/* Tags column */}
                      <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap gap-1">
                          {rowTags.map((tag) => (
                            <button
                              key={tag}
                              onClick={(e) => toggleTag(row.id, tag, e)}
                              className={cn(
                                "rounded border px-1.5 py-0.5 text-[9px] font-semibold transition-opacity hover:opacity-70",
                                tagColorClass(tag),
                              )}
                            >
                              {tag}
                            </button>
                          ))}
                          {/* Tag picker trigger */}
                          <TagPicker
                            tradeId={row.id}
                            selectedTags={rowTags}
                            onToggle={toggleTag}
                          />
                        </div>
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
                            {/* Tag section in expanded row */}
                            <div>
                              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                Tags
                              </label>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {COMMON_TAGS.map((tag) => {
                                  const active = (tradeTags[row.id] ?? t.tags ?? []).includes(tag);
                                  return (
                                    <button
                                      key={tag}
                                      onClick={(e) => toggleTag(row.id, tag, e)}
                                      className={cn(
                                        "rounded border px-2 py-0.5 text-[10px] font-medium transition-colors",
                                        active
                                          ? tagColorClass(tag)
                                          : "border-border text-muted-foreground hover:text-foreground",
                                      )}
                                    >
                                      {tag}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

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
                                <Check className="h-3 w-3" /> Save Note
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

// ── Tag Picker (inline popover) ──────────────────────────────────────────────
function TagPicker({
  tradeId,
  selectedTags,
  onToggle,
}: {
  tradeId: string;
  selectedTags: string[];
  onToggle: (id: string, tag: string, e: React.MouseEvent) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-4 w-4 items-center justify-center rounded border border-dashed border-border text-muted-foreground/50 transition-colors hover:border-primary/50 hover:text-primary"
        title="Add tag"
      >
        <Tag className="h-2.5 w-2.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-5 z-50 w-40 rounded-lg border border-border bg-card p-2 shadow-lg">
          <p className="mb-1.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
            Add / remove tag
          </p>
          <div className="flex flex-col gap-1">
            {COMMON_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={(e) => {
                    onToggle(tradeId, tag, e);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded px-2 py-1 text-[10px] font-medium transition-colors text-left",
                    active
                      ? tagColorClass(tag) + " border"
                      : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
                  )}
                >
                  {tag}
                  {active && <Check className="h-2.5 w-2.5" />}
                </button>
              );
            })}
          </div>
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
