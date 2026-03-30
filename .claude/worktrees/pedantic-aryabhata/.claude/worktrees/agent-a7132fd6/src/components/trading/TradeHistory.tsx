"use client";

import { useState } from "react";
import { BarChart3, PlayCircle } from "lucide-react";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";
import { buildReplayFromTrade } from "@/services/trading/replay-engine";
import type { TradeReplayData } from "@/services/trading/replay-engine";
import { TradeReplay } from "@/components/trading/TradeReplay";

export function TradeHistory() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const [activeReplay, setActiveReplay] = useState<TradeReplayData | null>(null);

  function openReplay(tradeId: string) {
    const trade = tradeHistory.find((t) => t.id === tradeId);
    if (!trade) return;
    const replay = buildReplayFromTrade(trade, tradeHistory);
    setActiveReplay(replay);
  }

  if (tradeHistory.length === 0) {
    return (
      <div className="flex h-24 flex-col items-center justify-center gap-1.5">
        <BarChart3 className="h-5 w-5 text-muted-foreground/40" />
        <span className="text-xs font-medium text-muted-foreground">
          No trades yet
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          Your completed trades will appear here
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto max-h-64">
        <table className="w-full text-xs min-w-[560px]">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              <th className="px-2 py-1.5 text-left">Date</th>
              <th className="px-2 py-1.5 text-left">Ticker</th>
              <th className="px-2 py-1.5 text-center">Side</th>
              <th className="px-2 py-1.5 text-right">Qty</th>
              <th className="px-2 py-1.5 text-right">Price</th>
              <th className="px-2 py-1.5 text-right">Fees</th>
              <th className="px-2 py-1.5 text-right">Net P&L</th>
              <th className="px-2 py-1.5 text-center">Replay</th>
            </tr>
          </thead>
          <tbody>
            {tradeHistory.slice(0, 50).map((trade) => (
              <tr
                key={trade.id}
                className={cn(
                  "border-b border-border/50 transition-colors duration-150 hover:bg-accent/30",
                  trade.side === "sell" && trade.realizedPnL > 0
                    ? "border-l-2 border-l-green-500/40"
                    : trade.side === "sell" && trade.realizedPnL < 0
                      ? "border-l-2 border-l-[#ef4444]/40"
                      : "border-l-2 border-l-transparent",
                )}
              >
                <td className="px-2 py-1.5 text-muted-foreground font-mono tabular-nums">
                  {formatShortDate(trade.simulationDate)}
                </td>
                <td className="px-2 py-1.5 font-semibold">{trade.ticker}</td>
                <td className="px-2 py-1.5 text-center">
                  <span
                    className={cn(
                      "text-[9px] uppercase px-1.5 py-0.5 rounded font-medium",
                      trade.side === "buy"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-[#ef4444]/10 text-[#ef4444]",
                    )}
                  >
                    {trade.side.toUpperCase()}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                  {trade.quantity}
                </td>
                <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                  {formatCurrency(trade.price)}
                </td>
                <td className="px-2 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                  {(trade.fees ?? 0) > 0
                    ? formatCurrency(trade.fees)
                    : "—"}
                </td>
                <td
                  className={cn(
                    "px-2 py-1.5 text-right font-mono tabular-nums",
                    trade.realizedPnL > 0
                      ? "text-green-500"
                      : trade.realizedPnL < 0
                        ? "text-[#ef4444]"
                        : "text-muted-foreground",
                  )}
                >
                  {trade.side === "sell"
                    ? formatCurrency(trade.realizedPnL)
                    : "—"}
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button
                    onClick={() => openReplay(trade.id)}
                    title="Watch trade replay"
                    className="inline-flex items-center justify-center p-1 rounded hover:bg-[#2d9cdb]/10 text-[#2d9cdb]/60 hover:text-[#2d9cdb] transition-colors"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeReplay && (
        <TradeReplay
          replay={activeReplay}
          onClose={() => setActiveReplay(null)}
        />
      )}
    </>
  );
}
