"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useChartStore } from "@/stores/chart-store";
import { useTradingStore } from "@/stores/trading-store";
import { detectLevels } from "@/services/ai/levels";
import { detectCandlePatterns } from "@/services/ai/patterns";
import { detectSignals } from "@/services/ai/signals";
import { X } from "lucide-react";

/* ─── macOS-style dismissible toast ─── */
function AlertToast({
  icon,
  title,
  message,
  accentColor,
  toastId,
}: {
  icon: string;
  title: string;
  message: string;
  accentColor: string;
  toastId: string | number;
}) {
  const borderClass =
    accentColor === "emerald"
      ? "border-emerald-500/20"
      : accentColor === "red"
      ? "border-red-500/20"
      : accentColor === "amber"
      ? "border-amber-500/20"
      : "border-orange-500/20";
  const titleClass =
    accentColor === "emerald"
      ? "text-emerald-400"
      : accentColor === "red"
      ? "text-red-400"
      : accentColor === "amber"
      ? "text-amber-400"
      : "text-orange-400";

  return (
    <div
      className={`group relative flex items-start gap-2.5 rounded-lg border ${borderClass} bg-card/95 backdrop-blur-sm px-3 py-2.5 text-[11px] w-72 transition-all`}
    >
      <span className="text-sm shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className={`font-medium ${titleClass} leading-tight text-[11px]`}>{title}</div>
        <div className="text-muted-foreground leading-snug mt-0.5 text-[10px]">{message}</div>
      </div>
      <button
        onClick={() => toast.dismiss(toastId)}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-foreground/10 text-muted-foreground"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ─── Global toast limit ─── */
const MAX_CONCURRENT_TOASTS = 3;
const TOAST_GAP_MS = 2000; // minimum gap between toasts

export function AlphaBotAlerts() {
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const allData = useMarketDataStore((s) => s.allData);
  const currentTicker = useChartStore((s) => s.currentTicker);
  const activeIndicators = useChartStore((s) => s.activeIndicators);
  const positions = useTradingStore((s) => s.positions);

  const alertedLevels = useRef<Set<string>>(new Set());
  const alertedPatterns = useRef<Set<string>>(new Set());
  const alertedPnLMilestones = useRef<Set<string>>(new Set());
  const alertedSetups = useRef<Set<string>>(new Set());
  const alertedVolumeSurges = useRef<Set<string>>(new Set());
  const lastToastTime = useRef(0);
  const toastQueue = useRef<Array<() => void>>([]);

  function throttledToast(fn: () => void) {
    const now = Date.now();
    if (now - lastToastTime.current < TOAST_GAP_MS) {
      // Queue it — but limit queue size
      if (toastQueue.current.length < MAX_CONCURRENT_TOASTS) {
        toastQueue.current.push(fn);
        setTimeout(() => {
          const next = toastQueue.current.shift();
          if (next) {
            lastToastTime.current = Date.now();
            next();
          }
        }, TOAST_GAP_MS);
      }
      return;
    }
    lastToastTime.current = now;
    fn();
  }

  // Reset deduplication caches on ticker change
  useEffect(() => {
    alertedLevels.current.clear();
    alertedPatterns.current.clear();
    alertedSetups.current.clear();
    alertedVolumeSurges.current.clear();
    toast.dismiss(); // clear all toasts on ticker change
  }, [currentTicker]);

  // ── Level breach detection (throttled: every 8 bar advances) ────────────
  const throttledCount = Math.floor(revealedCount / 8);
  useEffect(() => {
    if (revealedCount < 20) return;
    const visibleData = allData.slice(0, revealedCount);
    const currentBar = visibleData[visibleData.length - 1];
    if (!currentBar) return;

    const { supports, resistances } = detectLevels({
      bars: visibleData,
      currentPrice: currentBar.close,
    });

    // Only alert the closest level in each direction
    let closestSupport: (typeof supports)[0] | null = null;
    let closestResistance: (typeof resistances)[0] | null = null;
    let minSupportDist = Infinity;
    let minResistanceDist = Infinity;

    for (const level of supports) {
      const dist = Math.abs(currentBar.close - level.price) / level.price;
      if (dist <= 0.004 && dist < minSupportDist) {
        minSupportDist = dist;
        closestSupport = level;
      }
    }
    for (const level of resistances) {
      const dist = Math.abs(currentBar.close - level.price) / level.price;
      if (dist <= 0.004 && dist < minResistanceDist) {
        minResistanceDist = dist;
        closestResistance = level;
      }
    }

    const levelsToAlert = [closestSupport, closestResistance].filter(Boolean);
    for (const level of levelsToAlert) {
      if (!level) continue;
      const isSupport = level.type === "support";
      const key = `${level.type}-${level.price.toFixed(1)}-${throttledCount}`;
      if (!alertedLevels.current.has(key)) {
        alertedLevels.current.add(key);
        const msg = isSupport
          ? `Near ${level.label} at $${level.price.toFixed(2)}`
          : `Testing ${level.label} at $${level.price.toFixed(2)}`;
        const toastId = `level-${key}`;
        throttledToast(() =>
          toast.custom(
            () => (
              <AlertToast
                icon={isSupport ? "↓" : "↑"}
                title={isSupport ? "Support" : "Resistance"}
                message={msg}
                accentColor="amber"
                toastId={toastId}
              />
            ),
            { id: toastId, duration: 3500, position: "top-right" },
          ),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [throttledCount]);

  // ── Pattern detection (strength 3 only, max 1 per 3 bars) ──────────────
  const patternBucket = Math.floor(revealedCount / 3);
  useEffect(() => {
    if (revealedCount < 5) return;
    const visibleData = allData.slice(0, revealedCount);
    const patterns = detectCandlePatterns(visibleData, 5);
    const strongPatterns = patterns.filter((p) => p.strength === 3);

    // Only fire the first strong pattern per bucket
    const first = strongPatterns[0];
    if (!first) return;

    const key = `${first.name}-${patternBucket}`;
    if (alertedPatterns.current.has(key)) return;
    alertedPatterns.current.add(key);

    const isBull = first.direction === "bullish";
    const toastId = `pattern-${key}`;
    throttledToast(() =>
      toast.custom(
        () => (
          <AlertToast
            icon={isBull ? "▲" : "▼"}
            title={first.name}
            message={first.description.length > 60 ? first.description.slice(0, 60) + "…" : first.description}
            accentColor={isBull ? "emerald" : "red"}
            toastId={toastId}
          />
        ),
        { id: toastId, duration: 4000, position: "top-right" },
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patternBucket]);

  // ── Position P&L milestone detection ────────────────────────────────────
  useEffect(() => {
    for (const pos of positions) {
      const pct = pos.unrealizedPnLPercent ?? 0;
      const milestones: Array<{ threshold: number }> = [
        { threshold: 10 },
        { threshold: 5 },
        { threshold: -5 },
        { threshold: -10 },
      ];

      for (const { threshold } of milestones) {
        const triggered = threshold > 0 ? pct >= threshold : pct <= threshold;
        const key = `${pos.ticker}-${threshold}`;

        if (triggered && !alertedPnLMilestones.current.has(key)) {
          alertedPnLMilestones.current.add(key);
          const isProfit = threshold > 0;
          const pnlStr = `${isProfit ? "+" : ""}${pct.toFixed(1)}%`;
          const msg = isProfit
            ? `${pos.ticker} ${pnlStr} — consider trailing stop`
            : `${pos.ticker} ${pnlStr} — check your thesis`;
          const toastId = `pnl-${key}`;
          throttledToast(() =>
            toast.custom(
              () => (
                <AlertToast
                  icon={isProfit ? "◎" : "△"}
                  title={isProfit ? "Profit Target" : "Drawdown"}
                  message={msg}
                  accentColor={isProfit ? "emerald" : "red"}
                  toastId={toastId}
                />
              ),
              { id: toastId, duration: 4000, position: "top-right" },
            ),
          );
        } else if (!triggered) {
          alertedPnLMilestones.current.delete(key);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  // ── Setup forming (every 8 bars) ────────────────
  const setupBucket = Math.floor(revealedCount / 8);
  useEffect(() => {
    if (revealedCount < 20) return;
    const visibleData = allData.slice(0, revealedCount);
    const currentBar = visibleData[visibleData.length - 1];
    if (!currentBar) return;

    const snap = {
      close: currentBar.close,
      open: currentBar.open,
      high: currentBar.high,
      low: currentBar.low,
      volume: currentBar.volume,
    };

    const { signals } = detectSignals(
      snap,
      visibleData.length >= 2
        ? {
            close: visibleData[visibleData.length - 2].close,
            open: visibleData[visibleData.length - 2].open,
            high: visibleData[visibleData.length - 2].high,
            low: visibleData[visibleData.length - 2].low,
            volume: visibleData[visibleData.length - 2].volume,
          }
        : null,
      activeIndicators as Parameters<typeof detectSignals>[2],
    );

    const bullishCount = signals.filter((s) => s.direction === "bullish").length;
    const bearishCount = signals.filter((s) => s.direction === "bearish").length;
    const dominantDir = bullishCount >= 4 ? "bullish" : bearishCount >= 4 ? "bearish" : null;

    if (dominantDir) {
      const key = `setup-${dominantDir}-${setupBucket}`;
      if (!alertedSetups.current.has(key)) {
        alertedSetups.current.add(key);
        const isBull = dominantDir === "bullish";
        const toastId = `setup-${key}`;
        throttledToast(() =>
          toast.custom(
            () => (
              <AlertToast
                icon={isBull ? "●" : "●"}
                title="Signal Confluence"
                message={`${isBull ? bullishCount : bearishCount} ${dominantDir} signals aligning`}
                accentColor={isBull ? "emerald" : "red"}
                toastId={toastId}
              />
            ),
            { id: toastId, duration: 4000, position: "top-right" },
          ),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupBucket]);

  // ── Volume surge (every 5 bars) ────────────────
  const volumeBucket = Math.floor(revealedCount / 5);
  useEffect(() => {
    if (revealedCount < 21) return;
    const visibleData = allData.slice(0, revealedCount);
    const currentBar = visibleData[visibleData.length - 1];
    if (!currentBar) return;

    const lookback = visibleData.slice(-21, -1);
    if (lookback.length < 10) return;
    const avgVol = lookback.reduce((sum, b) => sum + b.volume, 0) / lookback.length;
    if (avgVol <= 0) return;

    const ratio = currentBar.volume / avgVol;
    if (ratio >= 3.0) {
      const key = `volsurge-${volumeBucket}`;
      if (!alertedVolumeSurges.current.has(key)) {
        alertedVolumeSurges.current.add(key);
        const isBull = currentBar.close > currentBar.open;
        const toastId = `vol-${key}`;
        throttledToast(() =>
          toast.custom(
            () => (
              <AlertToast
                icon="◈"
                title="Volume Surge"
                message={`${ratio.toFixed(1)}× avg — ${isBull ? "buying" : "selling"} pressure`}
                accentColor={isBull ? "emerald" : "orange"}
                toastId={toastId}
              />
            ),
            { id: toastId, duration: 3500, position: "top-right" },
          ),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumeBucket]);

  return null;
}
