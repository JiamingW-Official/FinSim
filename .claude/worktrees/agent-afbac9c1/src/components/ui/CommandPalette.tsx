"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowRight,
  Home,
  TrendingUp,
  BookOpen,
  BarChart2,
  Settings,
  User,
  Cpu,
  LayoutDashboard,
  Target,
  RefreshCw,
  Keyboard,
  ChevronRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Command definitions ───────────────────────────────────────────────────────

export type CommandCategory = "navigate" | "action" | "settings";

export interface Command {
  id: string;
  label: string;
  description?: string;
  category: CommandCategory;
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
}

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  navigate: "Navigation",
  action: "Actions",
  settings: "Settings",
};

// Focus trap helper — returns all tabbable elements inside a container
function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.closest("[aria-hidden='true']"));
}

// ── Hook: focus trap ──────────────────────────────────────────────────────────

function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const container = ref.current;
    // Auto-focus first focusable element
    const focusable = getFocusable(container);
    (focusable[0] ?? container).focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = getFocusable(container);
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTab);
    return () => container.removeEventListener("keydown", handleTab);
  }, [active, ref]);
}

// ── Main component ────────────────────────────────────────────────────────────

const MAX_HISTORY = 5;
const HISTORY_KEY = "finsim_cmd_history";

function loadHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(ids: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(ids.slice(0, MAX_HISTORY)));
  } catch {
    // ignore
  }
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(containerRef, open);

  // Build commands (stable reference via useMemo — router is stable in Next 13+)
  const COMMANDS: Command[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-home",
        label: "Go to Home",
        description: "Dashboard overview and insights",
        category: "navigate",
        icon: <Home className="h-4 w-4" />,
        shortcut: ["g", "h"],
        action: () => router.push("/home"),
      },
      {
        id: "nav-trade",
        label: "Go to Trade",
        description: "Candlestick chart and order entry",
        category: "navigate",
        icon: <TrendingUp className="h-4 w-4" />,
        shortcut: ["g", "t"],
        action: () => router.push("/trade"),
      },
      {
        id: "nav-portfolio",
        label: "Go to Portfolio",
        description: "Positions, P&L and analytics",
        category: "navigate",
        icon: <BarChart2 className="h-4 w-4" />,
        shortcut: ["g", "p"],
        action: () => router.push("/portfolio"),
      },
      {
        id: "nav-learn",
        label: "Go to Learn",
        description: "Lessons, flashcards and skill paths",
        category: "navigate",
        icon: <BookOpen className="h-4 w-4" />,
        shortcut: ["g", "l"],
        action: () => router.push("/learn"),
      },
      {
        id: "nav-options",
        label: "Go to Options",
        description: "Options chain, strategy builder and analysis",
        category: "navigate",
        icon: <LayoutDashboard className="h-4 w-4" />,
        shortcut: ["g", "o"],
        action: () => router.push("/options"),
      },
      {
        id: "nav-market",
        label: "Go to Market",
        description: "Breadth, sentiment and macro data",
        category: "navigate",
        icon: <BarChart2 className="h-4 w-4" />,
        action: () => router.push("/market"),
      },
      {
        id: "nav-backtest",
        label: "Go to Backtest",
        description: "Strategy backtesting and Monte Carlo",
        category: "navigate",
        icon: <Cpu className="h-4 w-4" />,
        action: () => router.push("/backtest"),
      },
      {
        id: "nav-predictions",
        label: "Go to Predictions",
        description: "Prediction markets",
        category: "navigate",
        icon: <Target className="h-4 w-4" />,
        action: () => router.push("/predictions"),
      },
      {
        id: "nav-leaderboard",
        label: "Go to Leaderboard",
        description: "Rankings and player stats",
        category: "navigate",
        icon: <User className="h-4 w-4" />,
        action: () => router.push("/leaderboard"),
      },
      {
        id: "nav-profile",
        label: "Go to Profile",
        description: "Career stats and achievements",
        category: "navigate",
        icon: <User className="h-4 w-4" />,
        action: () => router.push("/profile"),
      },
      {
        id: "nav-settings",
        label: "Go to Settings",
        description: "Preferences, theme and accessibility",
        category: "navigate",
        icon: <Settings className="h-4 w-4" />,
        action: () => router.push("/settings"),
      },
      // Actions
      {
        id: "action-buy",
        label: "Switch to Buy",
        description: "Set order entry to buy side",
        category: "action",
        icon: <TrendingUp className="h-4 w-4 text-green-500" />,
        shortcut: ["B"],
        action: () => window.dispatchEvent(new CustomEvent("finsim:focus-buy")),
      },
      {
        id: "action-sell",
        label: "Switch to Sell",
        description: "Set order entry to sell side",
        category: "action",
        icon: <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />,
        shortcut: ["S"],
        action: () => window.dispatchEvent(new CustomEvent("finsim:focus-sell")),
      },
      {
        id: "action-play",
        label: "Play / Pause Time Travel",
        description: "Start or stop bar-by-bar playback",
        category: "action",
        icon: <ArrowRight className="h-4 w-4" />,
        shortcut: ["Space"],
        action: () => window.dispatchEvent(new CustomEvent("finsim:play-pause")),
      },
      {
        id: "action-indicators",
        label: "Toggle Indicators Panel",
        description: "Open or close the indicator picker",
        category: "action",
        icon: <BarChart2 className="h-4 w-4" />,
        shortcut: ["I"],
        action: () =>
          window.dispatchEvent(new CustomEvent("finsim:toggle-indicators")),
      },
      {
        id: "action-shortcuts",
        label: "Show Keyboard Shortcuts",
        description: "View all available keyboard shortcuts",
        category: "action",
        icon: <Keyboard className="h-4 w-4" />,
        shortcut: ["?"],
        action: () =>
          window.dispatchEvent(new CustomEvent("finsim:toggle-shortcuts-help")),
      },
      {
        id: "action-search",
        label: "Focus Ticker Search",
        description: "Jump to the ticker selector",
        category: "action",
        icon: <Search className="h-4 w-4" />,
        shortcut: ["S"],
        action: () =>
          window.dispatchEvent(new CustomEvent("finsim:focus-search")),
      },
      // Settings shortcuts
      {
        id: "settings-theme",
        label: "Open Settings",
        description: "Change theme, colorblind mode and sound",
        category: "settings",
        icon: <Settings className="h-4 w-4" />,
        action: () => router.push("/settings"),
      },
      {
        id: "settings-reset",
        label: "Reload Page",
        description: "Hard-refresh the current page",
        category: "settings",
        icon: <RefreshCw className="h-4 w-4" />,
        action: () => window.location.reload(),
      },
    ],
    [router],
  );

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Open / close via global custom event (Cmd+K in useKeyboardShortcuts)
  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setQuery("");
      setSelectedIdx(0);
    };
    const onClose = () => setOpen(false);
    window.addEventListener("finsim:open-command-palette", onOpen);
    window.addEventListener("finsim:close-panels", onClose);
    return () => {
      window.removeEventListener("finsim:open-command-palette", onOpen);
      window.removeEventListener("finsim:close-panels", onClose);
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Filter commands by query
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Show recent history first, then all commands grouped
      const historyCommands = history
        .map((id) => COMMANDS.find((c) => c.id === id))
        .filter(Boolean) as Command[];
      return historyCommands.length > 0
        ? [
            ...historyCommands,
            ...COMMANDS.filter((c) => !history.includes(c.id)),
          ]
        : COMMANDS;
    }
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  }, [query, COMMANDS, history]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIdx(0);
  }, [filtered.length]);

  const runCommand = useCallback(
    (cmd: Command) => {
      // Record in history
      const newHistory = [cmd.id, ...history.filter((id) => id !== cmd.id)];
      setHistory(newHistory);
      saveHistory(newHistory);
      setOpen(false);
      cmd.action();
    },
    [history],
  );

  // Keyboard navigation inside palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[selectedIdx];
        if (cmd) runCommand(cmd);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [filtered, selectedIdx, runCommand],
  );

  if (!open) return null;

  // Group filtered results (only when not searching)
  const showGroups = query.trim() === "" && history.length === 0;
  const showHistory = query.trim() === "" && history.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="cp-panel"
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="fixed left-1/2 top-[15%] z-[61] w-full max-w-lg -translate-x-1/2 rounded-xl border border-border bg-card shadow-2xl"
            onKeyDown={handleKeyDown}
          >
            {/* Search input row */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls="cp-listbox"
                aria-activedescendant={filtered[selectedIdx] ? `cp-item-${filtered[selectedIdx].id}` : undefined}
                placeholder="Search commands, pages, actions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                Esc
              </kbd>
            </div>

            {/* Results list */}
            <div
              id="cp-listbox"
              role="listbox"
              aria-label="Commands"
              className="max-h-[360px] overflow-y-auto py-1"
            >
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No commands found for &ldquo;{query}&rdquo;
                </div>
              )}

              {showHistory && (
                <div>
                  <p className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Recent
                  </p>
                  {filtered.slice(0, history.length).map((cmd, i) => (
                    <CommandItem
                      key={cmd.id}
                      cmd={cmd}
                      selected={i === selectedIdx}
                      idx={i}
                      onSelect={runCommand}
                      onHover={() => setSelectedIdx(i)}
                    />
                  ))}
                  <div className="my-1 h-px bg-border/40" />
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    All Commands
                  </p>
                  {filtered.slice(history.length).map((cmd, i) => {
                    const realIdx = i + history.length;
                    return (
                      <CommandItem
                        key={cmd.id}
                        cmd={cmd}
                        selected={realIdx === selectedIdx}
                        idx={realIdx}
                        onSelect={runCommand}
                        onHover={() => setSelectedIdx(realIdx)}
                      />
                    );
                  })}
                </div>
              )}

              {showGroups && (
                <>
                  {(["navigate", "action", "settings"] as CommandCategory[]).map((cat) => {
                    const catCmds = filtered.filter((c) => c.category === cat);
                    if (catCmds.length === 0) return null;
                    return (
                      <div key={cat}>
                        <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {CATEGORY_LABELS[cat]}
                        </p>
                        {catCmds.map((cmd) => {
                          const idx = filtered.indexOf(cmd);
                          return (
                            <CommandItem
                              key={cmd.id}
                              cmd={cmd}
                              selected={idx === selectedIdx}
                              idx={idx}
                              onSelect={runCommand}
                              onHover={() => setSelectedIdx(idx)}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </>
              )}

              {/* When searching — flat list, no groups */}
              {!showGroups && !showHistory && filtered.map((cmd, i) => (
                <CommandItem
                  key={cmd.id}
                  cmd={cmd}
                  selected={i === selectedIdx}
                  idx={i}
                  onSelect={runCommand}
                  onHover={() => setSelectedIdx(i)}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 font-mono">↑</kbd>
                  <kbd className="rounded border border-border bg-muted px-1 font-mono">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 font-mono">↵</kbd>
                  select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 font-mono">⌘K</kbd>
                to open
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── CommandItem subcomponent ──────────────────────────────────────────────────

interface CommandItemProps {
  cmd: Command;
  selected: boolean;
  idx: number;
  onSelect: (cmd: Command) => void;
  onHover: () => void;
}

function CommandItem({ cmd, selected, onSelect, onHover }: CommandItemProps) {
  return (
    <button
      id={`cp-item-${cmd.id}`}
      type="button"
      role="option"
      aria-selected={selected}
      onClick={() => onSelect(cmd)}
      onMouseEnter={onHover}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
        selected
          ? "bg-primary/10 text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
          selected ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-muted/50",
        )}
        aria-hidden="true"
      >
        {cmd.icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-medium leading-tight text-foreground">
          {cmd.label}
        </span>
        {cmd.description && (
          <span className="truncate text-[10px] leading-snug text-muted-foreground">
            {cmd.description}
          </span>
        )}
      </span>
      {cmd.shortcut && (
        <span className="ml-auto flex shrink-0 items-center gap-0.5 pl-2">
          {cmd.shortcut.map((k) => (
            <kbd
              key={k}
              className="rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground"
            >
              {k}
            </kbd>
          ))}
        </span>
      )}
      {selected && (
        <ChevronRight className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
      )}
    </button>
  );
}
