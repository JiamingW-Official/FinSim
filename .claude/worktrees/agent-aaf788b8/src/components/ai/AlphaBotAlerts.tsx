"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useChartStore } from "@/stores/chart-store";
import { useTradingStore } from "@/stores/trading-store";
import { detectLevels } from "@/services/ai/levels";
import { detectCandlePatterns } from "@/services/ai/patterns";

const PATTERN_EMOJI: Record<string, string> = {
  Hammer: "🔨",
  "Shooting Star": "⭐",
  "Bullish Engulfing": "📈",
  "Bearish Engulfing": "📉",
  "Three White Soldiers": "🚀",
  "Three Black Crows": "🐻",
  "Morning Star": "🌅",
  "Evening Star": "🌆",
  "Pin Bar": "📍",
};

export function AlphaBotAlerts() {
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const allData = useMarketDataStore((s) => s.allData);
  const currentTicker = useChartStore((s) => s.currentTicker);
  const positions = useTradingStore((s) => s.positions);

  const alertedLevels = useRef<Set<string>>(new Set());
  const alertedPatterns = useRef<Set<string>>(new Set());
  const alertedPnLMilestones = useRef<Set<string>>(new Set());

  // Reset deduplication caches on ticker change
  useEffect(() => {
    alertedLevels.current.clear();
    alertedPatterns.current.clear();
  }, [currentTicker]);

  // ── Level breach detection (throttled: every 3 bar advances) ────────────
  const throttledCount = Math.floor(revealedCount / 3);
  useEffect(() => {
    if (revealedCount < 15) return;
    const visibleData = allData.slice(0, revealedCount);
    const currentBar = visibleData[visibleData.length - 1];
    if (!currentBar) return;

    const { supports, resistances } = detectLevels({
      bars: visibleData,
      currentPrice: currentBar.close,
    });

    for (const level of [...supports, ...resistances]) {
      const pctDiff = Math.abs(currentBar.close - level.price) / level.price;
      if (pctDiff <= 0.005) {
        const key = `${level.type}-${level.price.toFixed(2)}-${throttledCount}`;
        if (!alertedLevels.current.has(key)) {
          alertedLevels.current.add(key);
          const isSupport = level.type === "support";
          const msg = isSupport
            ? `Approaching support ${level.label} at $${level.price.toFixed(2)} — watch for a bounce or breakdown`
            : `Testing resistance ${level.label} at $${level.price.toFixed(2)} — volume will confirm breakout or rejection`;
          toast.custom(
            () => (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-card px-3 py-2 shadow-sm text-[11px] max-w-64">
                <span className="text-base shrink-0">{isSupport ? "🛡️" : "⚡"}</span>
                <div className="min-w-0">
                  <div className="font-bold text-amber-400 leading-tight">
                    {isSupport ? "Support Zone" : "Resistance Zone"}
                  </div>
                  <div className="text-muted-foreground leading-tight mt-0.5">{msg}</div>
                </div>
              </div>
            ),
            { duration: 4500, position: "top-right" },
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [throttledCount]);

  // ── Pattern detection (fires on every new bar) ──────────────────────────
  useEffect(() => {
    if (revealedCount < 5) return;
    const visibleData = allData.slice(0, revealedCount);
    const patterns = detectCandlePatterns(visibleData, 5);

    for (const pattern of patterns.filter((p) => p.strength === 3)) {
      const key = `${pattern.name}-${revealedCount}`;
      if (!alertedPatterns.current.has(key)) {
        alertedPatterns.current.add(key);
        const emoji = PATTERN_EMOJI[pattern.name] ?? "📊";
        const dirColor = pattern.direction === "bullish" ? "text-green-400" : "text-red-400";
        const borderColor =
          pattern.direction === "bullish"
            ? "border-green-500/30"
            : "border-red-500/30";
        toast.custom(
          () => (
            <div
              className={`flex items-center gap-2 rounded-lg border ${borderColor} bg-card px-3 py-2 shadow-sm text-[11px] max-w-64`}
            >
              <span className="text-base shrink-0">{emoji}</span>
              <div className="min-w-0">
                <div className={`font-bold ${dirColor} leading-tight`}>{pattern.name}</div>
                <div className="text-muted-foreground leading-tight mt-0.5">
                  {pattern.description.length > 70
                    ? pattern.description.slice(0, 70) + "…"
                    : pattern.description}
                </div>
              </div>
            </div>
          ),
          { duration: 5000, position: "top-right" },
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedCount]);

  // ── Position P&L milestone detection ────────────────────────────────────
  useEffect(() => {
    for (const pos of positions) {
      const pct = pos.unrealizedPnLPercent ?? 0;
      const milestones: Array<{ threshold: number; dir: "up" | "down" }> = [
        { threshold: 10, dir: "up" },
        { threshold: 5, dir: "up" },
        { threshold: 3, dir: "up" },
        { threshold: -3, dir: "down" },
        { threshold: -5, dir: "down" },
        { threshold: -10, dir: "down" },
      ];

      for (const { threshold, dir } of milestones) {
        const triggered = threshold > 0 ? pct >= threshold : pct <= threshold;
        const key = `${pos.ticker}-${threshold}`;

        if (triggered && !alertedPnLMilestones.current.has(key)) {
          alertedPnLMilestones.current.add(key);
          const isProfit = threshold > 0;
          const absThreshold = Math.abs(threshold);
          const pnlStr = `${isProfit ? "+" : ""}${pct.toFixed(1)}%`;
          const msg = isProfit
            ? absThreshold >= 10
              ? `${pos.ticker} up ${pnlStr} — consider taking profits or trailing your stop aggressively`
              : absThreshold >= 5
              ? `${pos.ticker} up ${pnlStr} — you're in the money. Trail your stop to lock in gains`
              : `${pos.ticker} up ${pnlStr} — small edge building. Keep your stop in place`
            : absThreshold >= 10
            ? `${pos.ticker} down ${pnlStr} — significant drawdown. Is your thesis still intact?`
            : absThreshold >= 5
            ? `${pos.ticker} down ${pnlStr} — approaching stop-loss territory. Stay disciplined`
            : `${pos.ticker} down ${pnlStr} — small drawdown, still within plan`;

          toast.custom(
            () => (
              <div
                className={`flex items-center gap-2 rounded-lg border ${isProfit ? "border-green-500/30" : "border-red-500/30"} bg-card px-3 py-2 shadow-sm text-[11px] max-w-64`}
              >
                <span className="text-base shrink-0">{isProfit ? "🎯" : "⚠️"}</span>
                <div className="min-w-0">
                  <div
                    className={`font-bold ${isProfit ? "text-green-400" : "text-red-400"} leading-tight`}
                  >
                    {isProfit ? "Profit Milestone" : "Drawdown Alert"}
                  </div>
                  <div className="text-muted-foreground leading-tight mt-0.5">{msg}</div>
                </div>
              </div>
            ),
            { duration: 4000, position: "top-right" },
          );
        } else if (!triggered) {
          // Reset so it can fire again if price recovers then re-hits
          alertedPnLMilestones.current.delete(key);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  return null;
}
