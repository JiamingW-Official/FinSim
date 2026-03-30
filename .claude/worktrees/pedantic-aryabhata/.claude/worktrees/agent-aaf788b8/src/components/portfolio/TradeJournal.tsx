"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ChevronDown } from "lucide-react";
import { TradeNoteEditor } from "./TradeNoteEditor";

export function TradeJournal() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const updateTradeNotes = useTradingStore((s) => s.updateTradeNotes);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (tradeId: string) => {
    setExpandedId((prev) => (prev === tradeId ? null : tradeId));
  };

  const handleSave = (tradeId: string, notes: string, tags: string[]) => {
    updateTradeNotes(tradeId, notes, tags);
    setExpandedId(null);
  };

  if (tradeHistory.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-1.5 text-muted-foreground">
        <MessageSquare className="h-5 w-5 opacity-30" />
        <p className="text-sm">No trades to journal yet</p>
        <p className="text-xs opacity-60">Trade journal entries are created automatically when you trade</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tradeHistory.slice(0, 100).map((trade) => (
        <div
          key={trade.id}
          className="rounded border border-border/50 bg-card p-2.5 text-xs"
        >
          {/* Trade row — clickable to expand */}
          <button
            type="button"
            onClick={() => toggleExpand(trade.id)}
            className="flex w-full items-start gap-3 text-left"
          >
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{trade.ticker}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-1.5 py-0 text-[10px]",
                      trade.side === "buy"
                        ? "border-green-500/30 text-green-500"
                        : "border-red-500/30 text-red-500",
                    )}
                  >
                    {trade.side.toUpperCase()}
                  </Badge>
                  <span className="tabular-nums text-muted-foreground">
                    {trade.quantity} @ {formatCurrency(trade.price)}
                  </span>
                  {trade.side === "sell" && (
                    <span
                      className={cn(
                        "tabular-nums font-medium",
                        trade.realizedPnL > 0
                          ? "text-green-500"
                          : trade.realizedPnL < 0
                            ? "text-red-500"
                            : "text-muted-foreground",
                      )}
                    >
                      {formatCurrency(trade.realizedPnL)}
                    </span>
                  )}
                  {(trade.fees ?? 0) > 0 && (
                    <span className="text-muted-foreground">
                      Fee: {formatCurrency(trade.fees)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">
                    {formatShortDate(trade.simulationDate)}
                  </span>
                  {/* Show tags inline */}
                  {trade.tags && trade.tags.length > 0 && (
                    <div className="flex gap-1">
                      {trade.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary/10 px-1.5 py-0 text-[9px] text-primary/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {trade.notes && (
                <MessageSquare className="h-3 w-3 text-muted-foreground/50" />
              )}
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-muted-foreground/40 transition-transform",
                  expandedId === trade.id && "rotate-180",
                )}
              />
            </div>
          </button>

          {/* Expandable note editor */}
          <AnimatePresence>
            {expandedId === trade.id && (
              <TradeNoteEditor
                trade={trade}
                onSave={(notes, tags) => handleSave(trade.id, notes, tags)}
                onCancel={() => setExpandedId(null)}
              />
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
