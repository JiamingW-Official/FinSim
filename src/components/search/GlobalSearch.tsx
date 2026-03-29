"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  BarChart2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Search,
  TrendingUp,
  X,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchIndex, type SearchResult, type SearchResultType } from "@/data/search-index";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const RECENT_SEARCHES_KEY = "finsim-recent-searches";
const MAX_RECENT = 5;

const PLACEHOLDER_SUGGESTIONS = ["RSI", "iron condor", "portfolio", "candlestick", "MACD", "stop-loss"];

const TYPE_ICON: Record<SearchResultType, React.ComponentType<{ className?: string }>> = {
  page: LayoutDashboard,
  indicator: TrendingUp,
  strategy: BarChart2,
  glossary: BookOpen,
  lesson: GraduationCap,
};

const TYPE_LABEL: Record<SearchResultType, string> = {
  page: "Page",
  indicator: "Indicator",
  strategy: "Strategy",
  glossary: "Glossary",
  lesson: "Lesson",
};

const TYPE_COLOR: Record<SearchResultType, string> = {
  page: "text-primary bg-primary/10",
  indicator: "text-primary bg-primary/10",
  strategy: "text-primary bg-primary/10",
  glossary: "text-emerald-400 bg-emerald-500/10",
  lesson: "text-amber-400 bg-amber-500/10",
};

// ---------------------------------------------------------------------------
// Vim-style quick navigation map: "g" followed by a second key within 500ms
// ---------------------------------------------------------------------------
const VIM_NAV: Record<string, string> = {
  h: "/home",
  t: "/trade",
  o: "/options",
  p: "/portfolio",
  b: "/backtest",
  m: "/market",
  l: "/learn",
  c: "/challenges",
  q: "/quests",
  a: "/arena",
  r: "/leaderboard",  // "r" for rankings
  u: "/profile",      // "u" for user profile
  s: "/settings",
  d: "/predictions",  // "d" for degen predictions
};

const VIM_TIMEOUT_MS = 500;

// ---------------------------------------------------------------------------
// localStorage helpers (safe for SSR)
// ---------------------------------------------------------------------------
function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: string[]): void {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

function addRecentSearch(query: string): void {
  const existing = loadRecentSearches().filter((s) => s.toLowerCase() !== query.toLowerCase());
  saveRecentSearches([query, ...existing]);
}

// ---------------------------------------------------------------------------
// Context + hook
// ---------------------------------------------------------------------------
interface GlobalSearchContextValue {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const GlobalSearchContext = React.createContext<GlobalSearchContextValue>({
  open: false,
  openSearch: () => undefined,
  closeSearch: () => undefined,
});

export function useGlobalSearch() {
  return React.useContext(GlobalSearchContext);
}

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Track vim-style "g + <key>" sequence
  const gPressedRef = useRef(false);
  const gTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  // Listen for search:open custom event (emitted by useGlobalKeyboardShortcuts "/" key)
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("search:open", onOpen);
    return () => window.removeEventListener("search:open", onOpen);
  }, []);

  // Cmd+K / Ctrl+K shortcut + vim-style "g<key>" navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing inside inputs / textareas / contenteditable
      const target = e.target as HTMLElement;
      const isEditable =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Cmd/Ctrl+K always opens search regardless of focus
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      // Vim-style navigation only when NOT focused in an editable field
      // and the search modal is closed
      if (isEditable || open) return;

      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        gPressedRef.current = true;
        if (gTimerRef.current) clearTimeout(gTimerRef.current);
        gTimerRef.current = setTimeout(() => {
          gPressedRef.current = false;
        }, VIM_TIMEOUT_MS);
        return;
      }

      if (gPressedRef.current && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const dest = VIM_NAV[e.key.toLowerCase()];
        if (dest && dest !== pathname) {
          e.preventDefault();
          gPressedRef.current = false;
          if (gTimerRef.current) clearTimeout(gTimerRef.current);
          router.push(dest);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (gTimerRef.current) clearTimeout(gTimerRef.current);
    };
  }, [open, pathname, router]);

  return (
    <GlobalSearchContext.Provider value={{ open, openSearch, closeSearch }}>
      {children}
      <GlobalSearchModal open={open} onClose={closeSearch} />
    </GlobalSearchContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Search trigger button (for Sidebar / TopBar)
// ---------------------------------------------------------------------------
export function SearchTrigger({ className }: { className?: string }) {
  const { openSearch } = useGlobalSearch();
  return (
    <button
      type="button"
      onClick={openSearch}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground",
        "transition-colors hover:bg-accent/30 hover:text-foreground",
        className,
      )}
      title="Search (⌘K)"
      aria-label="Open search"
    >
      <Search className="h-4 w-4" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
interface GroupedResults {
  page: SearchResult[];
  indicator: SearchResult[];
  strategy: SearchResult[];
  glossary: SearchResult[];
  lesson: SearchResult[];
}

function groupResults(results: SearchResult[]): GroupedResults {
  return {
    page: results.filter((r) => r.type === "page"),
    indicator: results.filter((r) => r.type === "indicator"),
    strategy: results.filter((r) => r.type === "strategy"),
    glossary: results.filter((r) => r.type === "glossary"),
    lesson: results.filter((r) => r.type === "lesson"),
  };
}

function GlobalSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [flatList, setFlatList] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches when opening
  useEffect(() => {
    if (open) {
      setRecentSearches(loadRecentSearches());
      setQuery("");
      setResults([]);
      setFlatList([]);
      setActiveIndex(-1);
      // Focus after animation frame
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Run search as query changes
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setFlatList([]);
      setActiveIndex(-1);
      return;
    }
    const found = searchIndex(trimmed);
    setResults(found);
    setFlatList(found);
    setActiveIndex(-1);
  }, [query]);

  const selectResult = useCallback(
    (result: SearchResult) => {
      const q = query.trim();
      if (q) addRecentSearch(result.title);
      router.push(result.href);
      onClose();
    },
    [query, router, onClose],
  );

  const handleRecentSelect = useCallback(
    (term: string) => {
      setQuery(term);
    },
    [],
  );

  const clearRecent = useCallback(() => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (!flatList.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % flatList.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + flatList.length) % flatList.length);
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        selectResult(flatList[activeIndex]);
      }
    },
    [flatList, activeIndex, onClose, selectResult],
  );

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.querySelector(`[data-idx="${activeIndex}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const grouped = groupResults(results);
  const showEmpty = query.trim().length > 0 && results.length === 0;
  const showRecent = !query.trim() && recentSearches.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              "fixed left-1/2 top-[12%] z-50 w-full max-w-[600px] -translate-x-1/2",
              "rounded-xl border border-border/60 bg-card shadow-2xl overflow-hidden",
            )}
            onKeyDown={handleKeyDown}
          >
            {/* Search input row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search — try: ${PLACEHOLDER_SUGGESTIONS.join(", ")}…`}
                className={cn(
                  "flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60",
                  "outline-none border-none focus:ring-0",
                )}
                autoComplete="off"
                spellCheck={false}
              />
              <div className="flex items-center gap-2 shrink-0">
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results container */}
            <div
              ref={listRef}
              className="max-h-[420px] overflow-y-auto overscroll-contain py-2"
            >
              {/* Empty state */}
              {showEmpty && (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No results for <span className="text-foreground font-medium">"{query}"</span>
                  </p>
                  <p className="text-xs text-muted-foreground/60">Try a different term or browse the Learn section</p>
                </div>
              )}

              {/* Recent searches */}
              {showRecent && (
                <div className="px-3 pb-1">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span className="text-xs font-semibold text-muted-foreground/60">
                      Recent
                    </span>
                    <button
                      type="button"
                      onClick={clearRecent}
                      className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleRecentSelect(term)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent/30 hover:text-foreground transition-colors"
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Placeholder hint when no query and no recent */}
              {!query && !showRecent && (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-muted-foreground/60">
                    Search pages, glossary terms, indicators, strategies and lessons
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {PLACEHOLDER_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuery(s)}
                        className="rounded-full border border-border/40 bg-muted/30 px-2.5 py-0.5 text-xs text-muted-foreground hover:border-border hover:text-foreground transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results grouped by type */}
              {results.length > 0 && (
                <ResultsGroups
                  grouped={grouped}
                  flatList={flatList}
                  activeIndex={activeIndex}
                  onSelect={selectResult}
                  onHover={(idx) => setActiveIndex(idx)}
                />
              )}
            </div>

            {/* Footer */}
            {flatList.length > 0 && (
              <div className="flex items-center justify-between border-t border-border/30 px-4 py-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border/40 bg-muted/40 px-1 py-px font-mono">↑</kbd>
                    <kbd className="rounded border border-border/40 bg-muted/40 px-1 py-px font-mono">↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border/40 bg-muted/40 px-1 py-px font-mono">↵</kbd>
                    select
                  </span>
                </div>
                <span className="text-xs text-muted-foreground/40">
                  {flatList.length} result{flatList.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Results groups
// ---------------------------------------------------------------------------
const GROUP_ORDER: SearchResultType[] = ["page", "indicator", "strategy", "glossary", "lesson"];

interface ResultsGroupsProps {
  grouped: GroupedResults;
  flatList: SearchResult[];
  activeIndex: number;
  onSelect: (result: SearchResult) => void;
  onHover: (idx: number) => void;
}

function ResultsGroups({ grouped, flatList, activeIndex, onSelect, onHover }: ResultsGroupsProps) {
  const sections: Array<{ type: SearchResultType; items: SearchResult[] }> = GROUP_ORDER.map(
    (type) => ({ type, items: grouped[type] }),
  ).filter((s) => s.items.length > 0);

  return (
    <div className="px-2">
      {sections.map(({ type, items }) => (
        <div key={type} className="mb-1">
          {/* Section header */}
          <div className="flex items-center gap-1.5 px-2 pb-0.5 pt-1.5">
            {React.createElement(TYPE_ICON[type], { className: "h-3 w-3 text-muted-foreground/50" })}
            <span className="text-xs font-semibold text-muted-foreground/50">
              {TYPE_LABEL[type]}s
            </span>
          </div>

          {items.map((result) => {
            const flatIdx = flatList.indexOf(result);
            const isActive = flatIdx === activeIndex;
            const Icon = TYPE_ICON[result.type];

            return (
              <button
                key={result.id}
                type="button"
                data-idx={flatIdx}
                onClick={() => onSelect(result)}
                onMouseEnter={() => onHover(flatIdx)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                  isActive ? "bg-accent/40 text-foreground" : "text-muted-foreground hover:bg-accent/20 hover:text-foreground",
                )}
              >
                {/* Icon badge */}
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", TYPE_COLOR[result.type])}>
                  <Icon className="h-3.5 w-3.5" />
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight text-foreground truncate">
                    {result.title}
                  </p>
                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                    {result.description}
                  </p>
                </div>

                {/* Arrow (only when active) */}
                {isActive && (
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
