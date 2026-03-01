"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { soundEngine } from "@/services/audio/sound-engine";
import type { MiniPosition } from "./useMiniSimulator";

interface MiniTradePanelProps {
  actionType: string;
  currentPrice: number;
  cash: number;
  position: MiniPosition | null;
  unrealizedPnL: number;
  revealedCount: number;
  totalBars: number;
  isPlaying: boolean;
  activeIndicators: string[];
  allComplete: boolean;
  onBuy: (qty: number) => void;
  onSell: (qty: number) => void;
  onAdvance: () => void;
  onPlay: () => void;
  onPause: () => void;
  onToggleIndicator: (ind: string) => void;
}

const QTY_OPTIONS = [1, 5, 10];
const INDICATOR_CHIPS = [
  { id: "sma20", label: "SMA 20" },
];

export function MiniTradePanel({
  actionType,
  currentPrice,
  cash,
  position,
  unrealizedPnL,
  revealedCount,
  totalBars,
  isPlaying,
  activeIndicators,
  allComplete,
  onBuy,
  onSell,
  onAdvance,
  onPlay,
  onPause,
  onToggleIndicator,
}: MiniTradePanelProps) {
  const [qty, setQty] = useState(1);
  const atEnd = revealedCount >= totalBars;

  const handleBuy = () => {
    onBuy(qty);
    soundEngine.playBuy();
  };

  const handleSell = () => {
    onSell(position?.quantity ?? qty);
    soundEngine.playSell();
  };

  const handleAdvance = () => {
    onAdvance();
    soundEngine.playClick();
  };

  const showBuy = actionType === "buy" || actionType === "navigate";
  const showSell = actionType === "sell" || (actionType === "buy" && position !== null);
  const showIndicators = actionType === "indicator";

  return (
    <div className="glass-subtle rounded-xl border border-border/50 p-3 space-y-2.5">
      {/* Price + Cash row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">Price</span>
          <span className="font-bold tabular-nums text-foreground">${currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">Cash</span>
          <span className="font-medium tabular-nums">${cash.toFixed(0)}</span>
        </div>
      </div>

      {/* Position info */}
      {position && (
        <div className="flex items-center justify-between text-xs rounded-lg bg-muted/30 px-2.5 py-1.5">
          <span className="text-muted-foreground">
            {position.quantity} shares @ ${position.avgPrice.toFixed(2)}
          </span>
          <span className={cn(
            "font-semibold tabular-nums",
            unrealizedPnL >= 0 ? "text-[#10b981]" : "text-[#ef4444]",
          )}>
            {unrealizedPnL >= 0 ? "+" : ""}{unrealizedPnL.toFixed(2)}
          </span>
        </div>
      )}

      {/* Trade buttons */}
      {(showBuy || showSell) && (
        <div className="flex items-center gap-2">
          {showBuy && (
            <>
              <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card">
                {QTY_OPTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQty(q)}
                    className={cn(
                      "px-2 py-1 text-[10px] font-medium transition-colors rounded-md",
                      qty === q
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleBuy}
                disabled={cash < currentPrice * qty || allComplete}
                className="flex-1 rounded-lg bg-[#10b981] py-1.5 text-xs font-bold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
              >
                Buy {qty}
              </button>
            </>
          )}
          {showSell && position && (
            <button
              type="button"
              onClick={handleSell}
              disabled={allComplete}
              className="flex-1 rounded-lg bg-[#ef4444] py-1.5 text-xs font-bold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
            >
              Sell {position.quantity}
            </button>
          )}
        </div>
      )}

      {/* Indicator toggles */}
      {showIndicators && (
        <div className="flex items-center gap-1.5">
          {INDICATOR_CHIPS.map((ind) => (
            <button
              key={ind.id}
              type="button"
              onClick={() => onToggleIndicator(ind.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-medium transition-all",
                activeIndicators.includes(ind.id)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground bg-muted/30",
              )}
            >
              {ind.label}
            </button>
          ))}
        </div>
      )}

      {/* Time controls */}
      <div className="flex items-center gap-2 pt-0.5 border-t border-border/30">
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          disabled={atEnd}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-accent disabled:opacity-30"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={handleAdvance}
          disabled={atEnd}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-accent disabled:opacity-30"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1" />
        <span className="text-[10px] tabular-nums text-muted-foreground">
          Bar {revealedCount}/{totalBars}
        </span>
        {/* Mini progress bar */}
        <div className="h-1 w-16 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary/50"
            animate={{ width: `${(revealedCount / totalBars) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
}
