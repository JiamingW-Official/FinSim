"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  availableIndicators?: Array<{ id: string; label: string }>;
  onBuy: (qty: number) => void;
  onSell: (qty: number) => void;
  onAdvance: () => void;
  onPlay: () => void;
  onPause: () => void;
  onToggleIndicator: (ind: string) => void;
}

const QTY_OPTIONS = [1, 5, 10];
const DEFAULT_INDICATORS = [{ id: "sma20", label: "SMA 20" }];

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
  availableIndicators,
  onToggleIndicator,
}: MiniTradePanelProps) {
  const indicatorChips = availableIndicators ?? DEFAULT_INDICATORS;
  const [qty, setQty] = useState(1);
  const atEnd = revealedCount >= totalBars;
  const progress = totalBars > 0 ? (revealedCount / totalBars) * 100 : 0;

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
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Price</span>
          <span className="font-bold tabular-nums text-foreground text-sm">${currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Cash</span>
          <span className="font-medium tabular-nums">${cash.toFixed(0)}</span>
        </div>
      </div>

      {/* Position info — enhanced with animated P&L color border */}
      <AnimatePresence>
        {position && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "flex items-center justify-between text-xs rounded-lg px-2.5 py-2 border",
              unrealizedPnL >= 0
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20",
            )}>
              <span className="text-muted-foreground">
                {position.quantity} shares @ ${position.avgPrice.toFixed(2)}
              </span>
              <motion.span
                key={Math.round(unrealizedPnL * 100)}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className={cn(
                  "font-bold tabular-nums",
                  unrealizedPnL >= 0 ? "text-emerald-400" : "text-red-400",
                )}
              >
                {unrealizedPnL >= 0 ? "+" : ""}{unrealizedPnL.toFixed(2)}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade buttons — bolder */}
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
                      "px-2.5 py-1.5 text-[10px] font-bold transition-colors rounded-md",
                      qty === q
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <motion.button
                type="button"
                onClick={handleBuy}
                disabled={cash < currentPrice * qty || allComplete || atEnd}
                whileTap={{ scale: 0.95 }}
                className="flex-1 rounded-lg bg-emerald-500 py-2 text-xs font-black text-white uppercase tracking-wide transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40 shadow-[0_2px_8px_rgba(16,185,129,0.25)]"
              >
                Buy {qty}
              </motion.button>
            </>
          )}
          {showSell && position && (
            <motion.button
              type="button"
              onClick={handleSell}
              disabled={allComplete || atEnd}
              whileTap={{ scale: 0.95 }}
              className="flex-1 rounded-lg bg-red-500 py-2 text-xs font-black text-white uppercase tracking-wide transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40 shadow-[0_2px_8px_rgba(239,68,68,0.25)]"
            >
              Sell {position.quantity}
            </motion.button>
          )}
        </div>
      )}

      {/* Indicator toggles */}
      {showIndicators && (
        <div className="flex items-center gap-1.5">
          {indicatorChips.map((ind) => (
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

      {/* ===== TIME CONTROLS — BIG, VISUAL, PROMINENT ===== */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-2.5 space-y-2">
        {/* Full-width progress bar */}
        <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full transition-colors",
              isPlaying
                ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"
                : atEnd
                  ? "bg-emerald-500"
                  : "bg-primary/60",
            )}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* LARGE play/pause button with glow & pulse */}
          <motion.button
            type="button"
            onClick={isPlaying ? onPause : onPlay}
            disabled={atEnd}
            whileTap={{ scale: 0.85 }}
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all disabled:opacity-30 shrink-0",
              isPlaying
                ? "bg-amber-500 text-white shadow-[0_0_16px_rgba(245,158,11,0.5)]"
                : "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(99,102,241,0.3)]",
            )}
          >
            {/* Pulsing ring when playing */}
            {isPlaying && !atEnd && (
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-amber-400"
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.span
                  key="pause"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <Pause className="h-4.5 w-4.5" />
                </motion.span>
              ) : (
                <motion.span
                  key="play"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <Play className="h-4.5 w-4.5 ml-0.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Step forward */}
          <motion.button
            type="button"
            onClick={handleAdvance}
            disabled={atEnd || isPlaying}
            whileTap={{ scale: 0.85 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-all hover:bg-accent hover:text-foreground disabled:opacity-30 shrink-0"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </motion.button>

          <div className="flex-1" />

          {/* Animated status badge */}
          <motion.div
            layout
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase",
              isPlaying
                ? "bg-amber-500/10 text-amber-400"
                : atEnd
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-muted/40 text-muted-foreground",
            )}
          >
            {isPlaying && (
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400"
              />
            )}
            {atEnd ? (
              "Done"
            ) : isPlaying ? (
              "Live"
            ) : (
              <span className="tabular-nums">{revealedCount}/{totalBars}</span>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
