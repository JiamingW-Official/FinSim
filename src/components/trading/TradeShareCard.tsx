"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, TrendingUp, TrendingDown } from "lucide-react";
import { useTradingStore } from "@/stores/trading-store";
import { useGameStore } from "@/stores/game-store";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { TradeRecord } from "@/types/trading";

export function TradeShareCard() {
  const [visible, setVisible] = useState(false);
  const [trade, setTrade] = useState<TradeRecord | null>(null);
  const prevLengthRef = useRef(0);

  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const level = useGameStore((s) => s.level);
  const xp = useGameStore((s) => s.xp);

  useEffect(() => {
    if (tradeHistory.length <= prevLengthRef.current) {
      prevLengthRef.current = tradeHistory.length;
      return;
    }
    prevLengthRef.current = tradeHistory.length;

    // Find the newest sell trade
    const newest = tradeHistory[0];
    if (newest && newest.side === "sell" && newest.realizedPnL !== undefined) {
      setTrade(newest);
      setVisible(true);
    }
  }, [tradeHistory]);

  if (!trade) return null;

  const pnl = trade.realizedPnL ?? 0;
  const isProfit = pnl >= 0;
  const pnlSign = isProfit ? "+" : "";
  // Approximate entry price from trade data (best effort)
  const exitPrice = trade.price;

  const cardText = `📈 FinSim Trade Result
${trade.ticker}  ${pnlSign}${formatCurrency(Math.abs(pnl))} (${isProfit ? "+" : ""}${((pnl / (exitPrice * trade.quantity)) * 100).toFixed(1)}%)
Exit: ${formatCurrency(exitPrice)} × ${trade.quantity} shares
Level ${level} • ${xp.toLocaleString()} XP
Can you beat this? 🏆
Play free at finsim.app`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cardText).then(() => {
      toast.success("Copied to clipboard!");
    }).catch(() => {
      toast.error("Copy failed — try manually");
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setVisible(false)}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-background/60 px-4 py-3">
              <span className="text-xs font-black tracking-widest text-muted-foreground">
                FINSIM
              </span>
              <button
                onClick={() => setVisible(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Card body */}
            <div className="flex flex-col items-center gap-3 px-6 py-5">
              {/* Ticker */}
              <div className="text-2xl font-black tracking-wide">{trade.ticker}</div>

              {/* P&L */}
              <div className={`flex flex-col items-center ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                <div className="flex items-center gap-1.5">
                  {isProfit ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  <span className="text-3xl font-black tabular-nums">
                    {pnlSign}{formatCurrency(Math.abs(pnl))}
                  </span>
                </div>
                <span className="text-sm font-bold opacity-80">
                  {pnlSign}{((pnl / (exitPrice * trade.quantity)) * 100).toFixed(1)}%
                </span>
              </div>

              {/* Trade details */}
              <div className="w-full rounded-lg bg-background/60 px-3 py-2 text-center text-[11px] text-muted-foreground">
                Exit: {formatCurrency(exitPrice)} × {trade.quantity} shares
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-border/50" />

              {/* Player stats */}
              <div className="flex gap-4 text-center">
                <div>
                  <div className="text-[10px] text-muted-foreground">Level</div>
                  <div className="text-lg font-black text-primary">{level}</div>
                </div>
                <div className="h-8 w-px bg-border/50 self-center" />
                <div>
                  <div className="text-[10px] text-muted-foreground">Total XP</div>
                  <div className="text-lg font-black text-foreground">{xp.toLocaleString()}</div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <div className="text-sm font-black">Can you beat this? 🏆</div>
                <div className="text-[9px] text-muted-foreground">finsim.app</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t border-border px-4 py-3">
              <button
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[11px] font-black text-white hover:bg-primary/90 active:bg-primary/80 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Card Text
              </button>
              <button
                onClick={() => setVisible(false)}
                className="rounded-lg border border-border px-3 py-2 text-[11px] font-bold text-muted-foreground hover:bg-accent transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
