"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, ArrowUpRight, ArrowDownRight, X } from "lucide-react";
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
  onShort?: (qty: number) => void;
  onCover?: (qty: number) => void;
  onClosePosition?: () => void;
  onAdvance: () => void;
  onPlay: () => void;
  onPause: () => void;
  onToggleIndicator: (ind: string) => void;
  hidePlayback?: boolean;
  enableKeyboard?: boolean;
}

const QTY_OPTIONS = [1, 5, 10, 25];
const DEFAULT_INDICATORS = [{ id: "sma20", label: "SMA 20" }];
const ARENA_INDICATORS = [
  { id: "sma20", label: "SMA" },
  { id: "ema", label: "EMA" },
  { id: "bb", label: "BB" },
  { id: "rsi", label: "RSI" },
  { id: "macd", label: "MACD" },
  { id: "vwap", label: "VWAP" },
  { id: "stoch", label: "Stoch" },
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
  availableIndicators,
  onBuy,
  onSell,
  onShort,
  onCover,
  onClosePosition,
  onAdvance,
  onPlay,
  onPause,
  onToggleIndicator,
  hidePlayback,
  enableKeyboard,
}: MiniTradePanelProps) {
  const [qty, setQty] = useState(1);
  const atEnd = revealedCount >= totalBars;
  const progress = totalBars > 0 ? (revealedCount / totalBars) * 100 : 0;

  const isFreeTradeMode = actionType === "free-trade";
  const hasShortSupport = isFreeTradeMode && !!onShort && !!onCover && !!onClosePosition;

  const indicatorChips = isFreeTradeMode ? ARENA_INDICATORS : (availableIndicators ?? DEFAULT_INDICATORS);

  const isLong = position?.side === "long";
  const isShort = position?.side === "short";
  const maxBuyQty = currentPrice > 0 ? Math.floor(cash / currentPrice) : 0;

  const handleBuy = useCallback(() => { onBuy(qty); soundEngine.playBuy(); }, [onBuy, qty]);
  const handleSell = useCallback(() => { onSell(position?.quantity ?? qty); soundEngine.playSell(); }, [onSell, position, qty]);
  const handleShort = useCallback(() => { onShort?.(qty); soundEngine.playSell(); }, [onShort, qty]);
  const handleClose = useCallback(() => { onClosePosition?.(); soundEngine.playSell(); }, [onClosePosition]);
  const handleAdvance = useCallback(() => { onAdvance(); soundEngine.playClick(); }, [onAdvance]);

  // Keyboard shortcuts: W=Long/Buy, S=Short, Q=Close, 1-5=qty, Space=play/pause
  useEffect(() => {
    if (!enableKeyboard) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "w": // Long / Buy
          e.preventDefault();
          if (hasShortSupport) {
            if (!isShort && cash >= currentPrice * qty && !allComplete && !atEnd) handleBuy();
          } else if (cash >= currentPrice * qty && !allComplete && !atEnd) {
            handleBuy();
          }
          break;
        case "s": // Short / Sell
          e.preventDefault();
          if (hasShortSupport) {
            if (!isLong && cash >= currentPrice * qty && !allComplete && !atEnd) handleShort();
          } else if (position && !allComplete && !atEnd) {
            handleSell();
          }
          break;
        case "q": // Close position
          e.preventDefault();
          if (position) handleClose();
          break;
        case "1": setQty(1); break;
        case "2": setQty(5); break;
        case "3": setQty(10); break;
        case "4": setQty(25); break;
        case "5": if (maxBuyQty > 0) setQty(maxBuyQty); break;
        case " ": // Space = play/pause
          e.preventDefault();
          if (isPlaying) onPause(); else if (!atEnd) onPlay();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enableKeyboard, hasShortSupport, isShort, isLong, cash, currentPrice, qty, allComplete, atEnd, position, maxBuyQty, isPlaying, onPause, onPlay, handleBuy, handleSell, handleShort, handleClose]);

  const showLegacyBuy = !hasShortSupport && (isFreeTradeMode || actionType === "buy" || actionType === "navigate");
  const showLegacySell = !hasShortSupport && (isFreeTradeMode ? position !== null : actionType === "sell" || (actionType === "buy" && position !== null));
  const showIndicators = actionType === "indicator" || isFreeTradeMode;

  return (
    <div className="glass-subtle rounded-xl border border-border/50 p-3 space-y-2.5">
      {/* Price + Cash */}
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

      {/* Position info with direction */}
      <AnimatePresence>
        {position && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className={cn(
              "flex items-center justify-between text-xs rounded-lg px-2.5 py-2 border",
              unrealizedPnL >= 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20",
            )}>
              <div className="flex items-center gap-1.5">
                {position.side === "long"
                  ? <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  : <ArrowDownRight className="h-3 w-3 text-red-400" />
                }
                <span className={cn("text-xs font-bold uppercase", position.side === "long" ? "text-emerald-400" : "text-red-400")}>
                  {position.side}
                </span>
                <span className="text-muted-foreground">
                  {position.quantity} @ ${position.avgPrice.toFixed(2)}
                </span>
              </div>
              <motion.span key={Math.round(unrealizedPnL * 100)} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                className={cn("font-bold tabular-nums", unrealizedPnL >= 0 ? "text-emerald-400" : "text-red-400")}>
                {unrealizedPnL >= 0 ? "+" : ""}{unrealizedPnL.toFixed(2)}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Arena: Long / Short / Close ═══ */}
      {hasShortSupport && (
        <div className="space-y-1.5">
          {/* Qty selector */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-0.5">Qty</span>
            <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card">
              {QTY_OPTIONS.map((q) => (
                <button key={q} type="button" onClick={() => setQty(q)}
                  className={cn("px-2 py-1 text-xs font-bold transition-colors rounded-md",
                    qty === q ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>
                  {q}
                </button>
              ))}
              <button type="button" onClick={() => { if (maxBuyQty > 0) setQty(maxBuyQty); }}
                className={cn("px-2 py-1 text-xs font-bold transition-colors rounded-md",
                  qty === maxBuyQty && maxBuyQty > 0 ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>
                MAX
              </button>
            </div>
          </div>

          {/* Long / Short */}
          <div className="flex items-center gap-1.5">
            <motion.button type="button" onClick={handleBuy}
              disabled={isShort || cash < currentPrice * qty || allComplete || atEnd}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-500 py-2 text-xs font-bold text-foreground uppercase tracking-wide transition-all hover:brightness-110 disabled:opacity-30 shadow-sm">
              <ArrowUpRight className="h-3 w-3" />
              Long {qty}
              {enableKeyboard && <kbd className="ml-1 rounded bg-foreground/20 px-1 py-0.5 text-[11px] font-mono leading-none">W</kbd>}
            </motion.button>
            <motion.button type="button" onClick={handleShort}
              disabled={isLong || cash < currentPrice * qty || allComplete || atEnd}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-red-500 py-2 text-xs font-bold text-foreground uppercase tracking-wide transition-all hover:brightness-110 disabled:opacity-30 shadow-sm">
              <ArrowDownRight className="h-3 w-3" />
              Short {qty}
              {enableKeyboard && <kbd className="ml-1 rounded bg-foreground/20 px-1 py-0.5 text-[11px] font-mono leading-none">S</kbd>}
            </motion.button>
          </div>

          {/* Close */}
          <AnimatePresence>
            {position && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <motion.button type="button" onClick={handleClose}
                  disabled={allComplete || atEnd} whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide transition-all hover:bg-muted/50 disabled:opacity-30">
                  <X className="h-3 w-3" />
                  Close {position.side === "long" ? "Long" : "Short"} ({position.quantity})
                  {enableKeyboard && <kbd className="ml-1 rounded bg-muted/50 px-1 py-0.5 text-[11px] font-mono leading-none text-muted-foreground">Q</kbd>}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ═══ Legacy Buy/Sell (practice mode) ═══ */}
      {!hasShortSupport && (showLegacyBuy || showLegacySell) && (
        <div className="flex items-center gap-2">
          {showLegacyBuy && (
            <>
              <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card">
                {[1, 5, 10].map((q) => (
                  <button key={q} type="button" onClick={() => setQty(q)}
                    className={cn("px-2.5 py-1.5 text-xs font-bold transition-colors rounded-md",
                      qty === q ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>
                    {q}
                  </button>
                ))}
              </div>
              <motion.button type="button" onClick={handleBuy}
                disabled={cash < currentPrice * qty || allComplete || atEnd}
                whileTap={{ scale: 0.95 }}
                className="flex-1 rounded-lg bg-emerald-500 py-2 text-xs font-bold text-foreground uppercase tracking-wide transition-all hover:brightness-110 disabled:opacity-40 shadow-sm">
                Buy {qty}
              </motion.button>
            </>
          )}
          {showLegacySell && position && (
            <motion.button type="button" onClick={handleSell}
              disabled={allComplete || atEnd} whileTap={{ scale: 0.95 }}
              className="flex-1 rounded-lg bg-red-500 py-2 text-xs font-bold text-foreground uppercase tracking-wide transition-all hover:brightness-110 disabled:opacity-40 shadow-sm">
              Sell {position.quantity}
            </motion.button>
          )}
        </div>
      )}

      {/* Indicator toggles */}
      {showIndicators && (
        <div className="flex flex-wrap items-center gap-1">
          {indicatorChips.map((ind) => (
            <button key={ind.id} type="button" onClick={() => onToggleIndicator(ind.id)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-bold transition-all border",
                activeIndicators.includes(ind.id)
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "text-muted-foreground hover:text-foreground bg-muted/30 border-transparent",
              )}>
              {ind.label}
            </button>
          ))}
        </div>
      )}

      {/* Playback controls */}
      {!hidePlayback && (
        <div className="rounded-lg border border-border/50 bg-card/50 p-2.5 space-y-2">
          <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full transition-colors",
                isPlaying ? "bg-amber-500"
                  : atEnd ? "bg-emerald-500" : "bg-primary/60")}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <motion.button type="button" onClick={isPlaying ? onPause : onPlay} disabled={atEnd}
              whileTap={{ scale: 0.85 }}
              className={cn("relative flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all disabled:opacity-30 shrink-0",
                isPlaying ? "bg-amber-500 text-foreground"
                  : "bg-primary text-primary-foreground")}>
              {isPlaying && !atEnd && (
                <motion.span className="absolute inset-0 rounded-full border-2 border-amber-400"
                  animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }} />
              )}
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.span key="pause" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
                    <Pause className="h-4.5 w-4.5" />
                  </motion.span>
                ) : (
                  <motion.span key="play" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
                    <Play className="h-4.5 w-4.5 ml-0.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button type="button" onClick={handleAdvance} disabled={atEnd || isPlaying}
              whileTap={{ scale: 0.85 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-all hover:bg-accent hover:text-foreground disabled:opacity-30 shrink-0">
              <SkipForward className="h-3.5 w-3.5" />
            </motion.button>
            <div className="flex-1" />
            <motion.div layout className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase",
              isPlaying ? "bg-amber-500/10 text-amber-400"
                : atEnd ? "bg-emerald-500/10 text-emerald-400" : "bg-muted/40 text-muted-foreground")}>
              {isPlaying && (
                <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity, type: "tween" }}
                  className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
              {atEnd ? "Done" : isPlaying ? "Live" : <span className="tabular-nums">{revealedCount}/{totalBars}</span>}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
