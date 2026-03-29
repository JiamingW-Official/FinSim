"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarChart3, Crosshair, Keyboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
    title: "Trading Simulator",
    icon: BarChart3,
    color: "text-emerald-400",
    shortcuts: [
      { keys: ["Space"], description: "Play / Pause simulation" },
      { keys: ["→"], description: "Advance one bar" },
      { keys: ["1"], description: "Speed 1x" },
      { keys: ["2"], description: "Speed 2x" },
      { keys: ["3"], description: "Speed 5x" },
      { keys: ["4"], description: "Speed 10x" },
    ],
  },
  {
    title: "Arena & Practice",
    icon: Crosshair,
    color: "text-red-400",
    shortcuts: [
      { keys: ["W"], description: "Buy / Go Long" },
      { keys: ["S"], description: "Sell / Go Short" },
      { keys: ["Q"], description: "Close position" },
      { keys: ["1-5"], description: "Set quantity preset" },
      { keys: ["Space"], description: "Play / Pause" },
    ],
  },
  {
    title: "General",
    icon: Keyboard,
    color: "text-primary",
    shortcuts: [
      { keys: ["?"], description: "Open this shortcut guide" },
      { keys: ["Esc"], description: "Close dialog / Cancel" },
    ],
  },
];

export function KeyboardShortcutGuide() {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }
    if (e.key === "?") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass max-w-sm border-border/50 p-0">
        <div className="rounded-t-lg bg-primary/10 px-4 py-3">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold text-primary">
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-4 pb-4">
          {SHORTCUT_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className={`mb-2 flex items-center gap-1.5 text-[11px] font-bold ${section.color}`}>
                <section.icon className="h-3 w-3" />
                {section.title}
              </div>
              <div className="space-y-1.5">
                {section.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="text-muted-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="inline-flex min-w-[24px] items-center justify-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-xs font-mono font-medium text-foreground"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-border/50 pt-2">
            <p className="text-center text-xs text-muted-foreground">
              Press <kbd className="mx-0.5 rounded border border-border bg-muted/50 px-1 py-0.5 text-[11px] font-mono">?</kbd> to toggle this guide
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
