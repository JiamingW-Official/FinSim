"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Keyboard,
  Navigation,
  TrendingUp,
  Clock,
  Settings2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface ShortcutEntry {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  icon: LucideIcon;
  color: string;
  shortcuts: ShortcutEntry[];
}

const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: "Navigation",
    icon: Navigation,
    color: "text-primary",
    shortcuts: [
      { keys: ["g", "t"], description: "Go to Trade" },
      { keys: ["g", "l"], description: "Go to Learn" },
      { keys: ["g", "m"], description: "Go to Market" },
      { keys: ["g", "p"], description: "Go to Portfolio" },
      { keys: ["g", "o"], description: "Go to Options" },
      { keys: ["g", "a"], description: "Go to Arena" },
      { keys: ["g", "q"], description: "Go to Quests" },
      { keys: ["g", "b"], description: "Go to Backtest" },
      { keys: ["g", "r"], description: "Go to Risk" },
    ],
  },
  {
    title: "Trading",
    icon: TrendingUp,
    color: "text-emerald-400",
    shortcuts: [
      { keys: ["W"], description: "Buy / Go Long" },
      { keys: ["S"], description: "Sell / Go Short" },
      { keys: ["Q"], description: "Close position" },
      { keys: ["1", "–", "5"], description: "Set quantity preset" },
    ],
  },
  {
    title: "Time Travel",
    icon: Clock,
    color: "text-violet-400",
    shortcuts: [
      { keys: ["Space"], description: "Play / Pause simulation" },
      { keys: ["←"], description: "Step back one bar" },
      { keys: ["→"], description: "Step forward one bar" },
    ],
  },
  {
    title: "General",
    icon: Settings2,
    color: "text-blue-400",
    shortcuts: [
      { keys: ["/"], description: "Open global search" },
      { keys: ["⌘", "K"], description: "Open global search (CMD+K)" },
      { keys: ["?"], description: "Toggle this shortcuts guide" },
      { keys: ["Esc"], description: "Close dialog / Cancel" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Context so TopBar button can also open the modal
// ---------------------------------------------------------------------------

interface ShortcutsModalContextValue {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ShortcutsModalContext = React.createContext<ShortcutsModalContextValue>({
  open: false,
  openModal: () => undefined,
  closeModal: () => undefined,
});

export function useShortcutsModal() {
  return React.useContext(ShortcutsModalContext);
}

export function ShortcutsModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  // Listen for custom events from useGlobalKeyboardShortcuts
  useEffect(() => {
    const onOpen = () => setOpen((prev) => !prev);
    const onClose = () => setOpen(false);
    window.addEventListener("shortcuts:open", onOpen);
    window.addEventListener("modal:close", onClose);
    return () => {
      window.removeEventListener("shortcuts:open", onOpen);
      window.removeEventListener("modal:close", onClose);
    };
  }, []);

  return (
    <ShortcutsModalContext.Provider value={{ open, openModal, closeModal }}>
      {children}
      <KeyboardShortcutsModal open={open} onClose={closeModal} />
    </ShortcutsModalContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Modal component
// ---------------------------------------------------------------------------

function KbdKey({ label }: { label: string }) {
  return (
    <kbd className="inline-flex min-w-[22px] items-center justify-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-xs font-mono font-medium text-foreground">
      {label}
    </kbd>
  );
}

function KeyboardShortcutsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="glass max-w-2xl border-border/50 p-0">
        {/* Header */}
        <div className="rounded-t-lg bg-blue-500/10 px-5 py-3">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold text-blue-400">
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Grid body — 2 columns */}
        <div className="grid grid-cols-1 gap-5 px-5 pb-5 pt-4 sm:grid-cols-2">
          {SHORTCUT_SECTIONS.map((section) => (
            <div key={section.title}>
              {/* Section heading */}
              <div
                className={`mb-2.5 flex items-center gap-1.5 text-[11px] font-bold ${section.color}`}
              >
                <section.icon className="h-3 w-3" />
                {section.title}
              </div>

              {/* Shortcut rows */}
              <div className="space-y-1.5">
                {section.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span className="text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {shortcut.keys.map((key, i) => {
                        // "–" is a visual separator between chord keys, not a kbd
                        if (key === "–") {
                          return (
                            <span
                              key={i}
                              className="text-xs text-muted-foreground/50"
                            >
                              –
                            </span>
                          );
                        }
                        return <KbdKey key={i} label={key} />;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 px-5 pb-4 pt-2">
          <p className="text-center text-xs text-muted-foreground">
            Press{" "}
            <KbdKey label="?" /> to toggle this guide &middot; Press{" "}
            <KbdKey label="Esc" /> to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Standalone component for cases where only the modal (no provider) is needed
// ---------------------------------------------------------------------------

/**
 * Drop this anywhere inside a <ShortcutsModalProvider> subtree to render
 * the modal driven by context state.  The provider itself also renders the
 * modal, so you typically only need the provider.
 */
export { KeyboardShortcutsModal };
