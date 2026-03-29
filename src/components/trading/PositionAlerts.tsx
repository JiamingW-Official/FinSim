"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useTradingStore } from "@/stores/trading-store";
import { calculateATR } from "@/services/indicators";

/**
 * PositionAlerts — real-time scanner that fires Sonner toasts when:
 * - Position up 5% / 10% / 15%  (profit milestones)
 * - Position down 3% / 5%       (loss alerts)
 * - ATR stop approached ≤ 0.5%  (stop proximity alert)
 * - Position held > 20 bars     (time-based exit alert, fires once)
 *
 * Deduplication: each alert type fires once per position via useRef<Set<string>>.
 */
export function PositionAlerts() {
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const allData = useMarketDataStore((s) => s.allData);
  const positions = useTradingStore((s) => s.positions);

  const alertedProfit = useRef<Set<string>>(new Set());
  const alertedLoss = useRef<Set<string>>(new Set());
  const alertedAtrStop = useRef<Set<string>>(new Set());
  const alertedTimeExit = useRef<Set<string>>(new Set());

  // Reset dedup sets when positions list changes (position closed)
  useEffect(() => {
    const activeTickers = new Set(positions.map((p) => `${p.ticker}-${p.side}`));
    for (const key of alertedProfit.current) {
      const tickerSide = key.split("-").slice(0, 2).join("-");
      if (!activeTickers.has(tickerSide)) alertedProfit.current.delete(key);
    }
    for (const key of alertedLoss.current) {
      const tickerSide = key.split("-").slice(0, 2).join("-");
      if (!activeTickers.has(tickerSide)) alertedLoss.current.delete(key);
    }
    for (const key of alertedAtrStop.current) {
      const tickerSide = key.split("-").slice(0, 2).join("-");
      if (!activeTickers.has(tickerSide)) alertedAtrStop.current.delete(key);
    }
    for (const key of alertedTimeExit.current) {
      const tickerSide = key.split("-").slice(0, 2).join("-");
      if (!activeTickers.has(tickerSide)) alertedTimeExit.current.delete(key);
    }
  }, [positions]);

  useEffect(() => {
    if (revealedCount < 5 || positions.length === 0) return;
    const visibleData = allData.slice(0, revealedCount);

    // Compute ATR(14) once for these bars
    let atrValue: number | null = null;
    if (visibleData.length >= 15) {
      const atrPoints = calculateATR(visibleData, 14);
      if (atrPoints.length > 0) {
        atrValue = atrPoints[atrPoints.length - 1].value;
      }
    }

    for (const pos of positions) {
      const pct = pos.unrealizedPnLPercent ?? 0;
      const price = pos.currentPrice;
      const tickerSide = `${pos.ticker}-${pos.side}`;

      // ── Profit milestones: 5%, 10%, 15% ──────────────────────────────────
      const profitMilestones = [15, 10, 5];
      for (const threshold of profitMilestones) {
        if (pct >= threshold) {
          const key = `${tickerSide}-profit-${threshold}`;
          if (!alertedProfit.current.has(key)) {
            alertedProfit.current.add(key);
            const msg =
              threshold >= 15
                ? `${pos.ticker} up ${pct.toFixed(1)}% — outstanding gain. Consider taking profits or moving stop to breakeven +`
                : threshold >= 10
                ? `${pos.ticker} up ${pct.toFixed(1)}% — trail your stop aggressively to lock in gains`
                : `${pos.ticker} up ${pct.toFixed(1)}% — building momentum. Hold with a trailing stop`;
            toast.custom(
              () => (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-card px-3 py-2 shadow-sm text-[11px] max-w-64">
                  <span className="text-base shrink-0">
                    {threshold >= 15 ? "💎" : threshold >= 10 ? "🚀" : "🎯"}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-emerald-400 leading-tight">
                      Profit +{threshold}%
                    </div>
                    <div className="text-muted-foreground leading-tight mt-0.5">{msg}</div>
                  </div>
                </div>
              ),
              { duration: 5000, position: "top-right" },
            );
          }
          break; // Only fire the highest threshold hit
        }
      }

      // ── Loss alerts: -3%, -5% ─────────────────────────────────────────────
      const lossMilestones = [-5, -3];
      for (const threshold of lossMilestones) {
        if (pct <= threshold) {
          const key = `${tickerSide}-loss-${threshold}`;
          if (!alertedLoss.current.has(key)) {
            alertedLoss.current.add(key);
            const absT = Math.abs(threshold);
            const msg =
              absT >= 5
                ? `${pos.ticker} down ${pct.toFixed(1)}% — near stop territory. Is your thesis still intact?`
                : `${pos.ticker} down ${pct.toFixed(1)}% — drawdown building. Keep your stop in place`;
            toast.custom(
              () => (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-card px-3 py-2 shadow-sm text-[11px] max-w-64">
                  <span className="text-base shrink-0">{absT >= 5 ? "🛑" : "⚠️"}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-red-400 leading-tight">
                      Loss Alert {threshold}%
                    </div>
                    <div className="text-muted-foreground leading-tight mt-0.5">{msg}</div>
                  </div>
                </div>
              ),
              { duration: 5000, position: "top-right" },
            );
          }
          break; // Only fire the deepest threshold hit
        }
      }

      // ── ATR stop proximity: within 0.5% of ATR trailing stop ─────────────
      if (atrValue !== null && atrValue > 0) {
        const atrStop =
          pos.side === "long"
            ? pos.currentPrice - atrValue * 2
            : pos.currentPrice + atrValue * 2;
        const distToPct = Math.abs(price - atrStop) / price * 100;

        if (distToPct <= 0.5) {
          // Bucket: fires once per bar-bucket (every 2 bars)
          const bucket = Math.floor(revealedCount / 2);
          const key = `${tickerSide}-atrstop-${bucket}`;
          if (!alertedAtrStop.current.has(key)) {
            alertedAtrStop.current.add(key);
            toast.custom(
              () => (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-card px-3 py-2 shadow-sm text-[11px] max-w-64">
                  <span className="text-base shrink-0">⚡</span>
                  <div className="min-w-0">
                    <div className="font-bold text-amber-400 leading-tight">ATR Stop Proximity</div>
                    <div className="text-muted-foreground leading-tight mt-0.5">
                      {pos.ticker} within {distToPct.toFixed(2)}% of ATR trailing stop ${atrStop.toFixed(2)} — prepare to exit
                    </div>
                  </div>
                </div>
              ),
              { duration: 5000, position: "top-right" },
            );
          }
        }
      }

      // ── Time-based exit: held > 20 bars ──────────────────────────────────
      if (pos.openedAtTimestamp) {
        const barsHeld = visibleData.filter(
          (b) => b.timestamp >= pos.openedAtTimestamp!,
        ).length;
        if (barsHeld > 20) {
          const key = `${tickerSide}-timeexit`;
          if (!alertedTimeExit.current.has(key)) {
            alertedTimeExit.current.add(key);
            toast.custom(
              () => (
                <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card px-3 py-2 shadow-sm text-[11px] max-w-64">
                  <span className="text-base shrink-0">⏱️</span>
                  <div className="min-w-0">
                    <div className="font-bold text-primary leading-tight">Long-Held Position</div>
                    <div className="text-muted-foreground leading-tight mt-0.5">
                      {pos.ticker} held {barsHeld} bars — re-evaluate thesis. Is momentum still supportive?
                    </div>
                  </div>
                </div>
              ),
              { duration: 6000, position: "top-right" },
            );
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedCount, positions]);

  return null;
}
