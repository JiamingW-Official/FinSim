"use client";

import { useState } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

export function TradeJournal() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const updateTradeNotes = useTradingStore((s) => s.updateTradeNotes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const startEdit = (tradeId: string, currentNotes?: string) => {
    setEditingId(tradeId);
    setNoteText(currentNotes ?? "");
  };

  const saveNote = () => {
    if (editingId) {
      updateTradeNotes(editingId, noteText);
      setEditingId(null);
      setNoteText("");
    }
  };

  if (tradeHistory.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No trades to journal yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tradeHistory.slice(0, 100).map((trade) => (
        <div
          key={trade.id}
          className="flex items-start gap-3 rounded border border-border/50 bg-card p-2.5 text-xs"
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
                      ? "border-[#10b981]/30 text-[#10b981]"
                      : "border-[#ef4444]/30 text-[#ef4444]",
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
                        ? "text-[#10b981]"
                        : trade.realizedPnL < 0
                          ? "text-[#ef4444]"
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
              <span className="text-muted-foreground">
                {formatShortDate(trade.simulationDate)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {editingId === trade.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveNote()}
                  className="w-40 rounded border border-border bg-background px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Add a note..."
                  autoFocus
                />
                <button
                  type="button"
                  onClick={saveNote}
                  className="rounded px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/10"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {trade.notes && (
                  <span className="max-w-[120px] truncate text-muted-foreground italic">
                    {trade.notes}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(trade.id, trade.notes)}
                  className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  title="Add note"
                >
                  <MessageSquare className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
