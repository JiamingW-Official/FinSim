"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { TradeRecord } from "@/types/trading";
import { cn } from "@/lib/utils";

const TAG_SUGGESTIONS = [
  "momentum",
  "breakout",
  "support/resistance",
  "earnings",
  "reversal",
  "scalp",
  "swing",
  "gap-fill",
  "trend-following",
  "mean-reversion",
];

interface TradeNoteEditorProps {
  trade: TradeRecord;
  onSave: (notes: string, tags: string[]) => void;
  onCancel: () => void;
}

export function TradeNoteEditor({ trade, onSave, onCancel }: TradeNoteEditorProps) {
  const [notes, setNotes] = useState(trade.notes ?? "");
  const [tags, setTags] = useState<string[]>(trade.tags ?? []);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="space-y-2 border-t border-border/30 pt-2">
        {/* Textarea */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary"
          placeholder="Add notes about this trade..."
          autoFocus
        />

        {/* Tags */}
        <div>
          <p className="mb-1 text-[11px] font-bold text-muted-foreground/60">
            Tags
          </p>
          <div className="flex flex-wrap gap-1">
            {TAG_SUGGESTIONS.map((tag) => {
              const isActive = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary/30 bg-primary/15 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-2.5 py-1 text-xs font-bold text-muted-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(notes, tags)}
            className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20"
          >
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
}
