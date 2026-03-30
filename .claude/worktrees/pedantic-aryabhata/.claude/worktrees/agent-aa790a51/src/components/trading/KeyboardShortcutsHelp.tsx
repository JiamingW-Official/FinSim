"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShortcutRow {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  heading: string;
  rows: ShortcutRow[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    heading: "Time Travel",
    rows: [
      { keys: ["Space"], description: "Play / Pause time travel" },
      { keys: ["→"], description: "Advance one bar" },
      { keys: ["←"], description: "Step back one bar" },
    ],
  },
  {
    heading: "Timeframes",
    rows: [
      { keys: ["1"], description: "Switch to 5m" },
      { keys: ["2"], description: "Switch to 15m" },
      { keys: ["3"], description: "Switch to 1h" },
      { keys: ["4"], description: "Switch to 1D" },
      { keys: ["5"], description: "Switch to 1W" },
    ],
  },
  {
    heading: "Order Entry",
    rows: [
      { keys: ["B"], description: "Switch to Buy side" },
      { keys: ["S"], description: "Focus ticker search" },
      { keys: ["1"], description: "Position size 1% of portfolio" },
      { keys: ["2"], description: "Position size 2%" },
      { keys: ["3"], description: "Position size 5%" },
      { keys: ["4"], description: "Position size 10%" },
      { keys: ["5"], description: "Position size 25%" },
    ],
  },
  {
    heading: "Navigation",
    rows: [
      { keys: ["g", "h"], description: "Go to Home" },
      { keys: ["g", "t"], description: "Go to Trade" },
      { keys: ["g", "p"], description: "Go to Portfolio" },
      { keys: ["g", "l"], description: "Go to Learn" },
      { keys: ["g", "o"], description: "Go to Options" },
    ],
  },
  {
    heading: "Interface",
    rows: [
      { keys: ["I"], description: "Toggle indicators panel" },
      { keys: ["?"], description: "Show this shortcuts panel" },
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["Esc"], description: "Close any open panel" },
    ],
  },
];

function KeyBadge({ label }: { label: string }) {
  return (
    <kbd className="inline-flex min-w-[1.5rem] items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground shadow-[0_1px_0_0_hsl(var(--border))]">
      {label}
    </kbd>
  );
}

// Focus-trap helper
function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Toggle via ? key (dispatched by useKeyboardShortcuts)
  useEffect(() => {
    const toggle = () => setOpen((v) => !v);
    window.addEventListener("finsim:toggle-shortcuts-help", toggle);
    return () => window.removeEventListener("finsim:toggle-shortcuts-help", toggle);
  }, []);

  // Close on global close-panels event
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("finsim:close-panels", close);
    return () => window.removeEventListener("finsim:close-panels", close);
  }, []);

  // Escape key + focus trap while open
  useEffect(() => {
    if (!open) return;
    // Auto-focus the close button
    setTimeout(() => {
      const container = panelRef.current;
      if (!container) return;
      const focusable = getFocusable(container);
      (focusable[0] as HTMLElement | undefined)?.focus();
    }, 50);

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      // Focus trap
      const container = panelRef.current;
      if (!container || e.key !== "Tab") return;
      const focusable = getFocusable(container);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Floating ? button */}
      <button
        type="button"
        aria-label="Show keyboard shortcuts"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 z-40 flex h-8 w-8 items-center justify-center rounded-full",
          "border border-border bg-card text-muted-foreground shadow-md",
          "transition-colors hover:bg-accent hover:text-foreground",
          "md:bottom-4",
        )}
      >
        <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {/* Modal overlay */}
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
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              key="panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Keyboard shortcuts"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="fixed bottom-24 right-4 z-50 w-80 rounded-lg border border-border bg-card shadow-xl md:bottom-16"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="text-xs font-semibold">Keyboard Shortcuts</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="Close keyboard shortcuts"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              {/* Shortcut groups */}
              <div className="max-h-[420px] overflow-y-auto">
                {SHORTCUT_GROUPS.map((group) => (
                  <div key={group.heading}>
                    <p className="px-4 pt-2.5 pb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.heading}
                    </p>
                    <div className="divide-y divide-border/40">
                      {group.rows.map((row) => (
                        <div
                          key={row.description}
                          className="flex items-center justify-between px-4 py-1.5"
                        >
                          <span className="text-xs text-muted-foreground">
                            {row.description}
                          </span>
                          <div className="flex shrink-0 items-center gap-1 pl-3">
                            {row.keys.map((k, ki) => (
                              <KeyBadge key={`${k}-${ki}`} label={k} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer hint */}
              <div className="border-t border-border px-4 py-2 text-center text-[10px] text-muted-foreground/60">
                Shortcuts are disabled while typing in inputs
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
