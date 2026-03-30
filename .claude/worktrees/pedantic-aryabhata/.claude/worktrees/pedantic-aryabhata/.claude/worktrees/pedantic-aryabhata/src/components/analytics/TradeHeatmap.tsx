"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import {
  filterClosedTrades,
  computeDayOfWeekStats,
} from "@/services/analytics/trade-analytics";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Map an average P&L value to a CSS color.
 * Green spectrum for positive, red spectrum for negative.
 * Intensity scales with magnitude relative to the max observed.
 */
function pnlColor(avg: number, maxMag: number): string {
  if (maxMag === 0) return "hsl(220 13% 18%)";
  const intensity = clamp(Math.abs(avg) / maxMag, 0, 1);
  const lightness = 28 + intensity * 28; // 28% (dark) → 56% (bright)
  if (avg >= 0) {
    return `hsl(142 ${Math.round(40 + intensity * 30)}% ${Math.round(lightness)}%)`;
  }
  return `hsl(0 ${Math.round(40 + intensity * 35)}% ${Math.round(lightness)}%)`;
}

function fmt(v: number): string {
  const sign = v >= 0 ? "+" : "";
  if (Math.abs(v) >= 1000) return `${sign}${(v / 1000).toFixed(1)}k`;
  return `${sign}${v.toFixed(0)}`;
}

export function TradeHeatmap() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const { dayStats, maxMag, bestDay, bestAvg } = useMemo(() => {
    const closed = filterClosedTrades(tradeHistory);
    const dayStats = computeDayOfWeekStats(closed);

    let maxMag = 0;
    let bestDay = "";
    let bestAvg = 0;

    for (let d = 1; d <= 5; d++) {
      const mag = Math.abs(dayStats[d].avg);
      if (mag > maxMag) maxMag = mag;
      if (dayStats[d].avg > bestAvg) {
        bestAvg = dayStats[d].avg;
        bestDay = DAY_LABELS[d - 1];
      }
    }

    return { dayStats, maxMag, bestDay, bestAvg };
  }, [tradeHistory]);

  const hasTrades = tradeHistory.some((t) => t.realizedPnL !== 0);

  if (!hasTrades) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-1 text-muted-foreground">
        <p className="text-sm">No closed trades yet</p>
        <p className="text-xs opacity-60">Close some trades to see day-of-week performance</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Insight callout */}
      {bestDay && (
        <div className="rounded-md border border-border bg-card/50 px-3 py-2 text-xs text-muted-foreground">
          Your best trading day:{" "}
          <span className="font-semibold text-foreground">{bestDay}</span>
          {" "}
          <span className="text-green-400 font-mono">
            ({bestAvg >= 0 ? "+" : ""}{bestAvg.toFixed(2)} avg P&L)
          </span>
        </div>
      )}

      {/* Heatmap grid */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((d) => {
          const slot = dayStats[d];
          const color = pnlColor(slot.avg, maxMag);
          const label = DAY_LABELS[d - 1];
          return (
            <div key={d} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="text-xs font-medium text-muted-foreground">{label}</div>
              <div
                className="flex w-full flex-col items-center justify-center rounded-lg px-1 py-3 transition-colors"
                style={{ backgroundColor: color }}
              >
                <span className="font-mono text-[11px] font-semibold text-foreground">
                  {slot.count > 0 ? fmt(slot.avg) : "—"}
                </span>
                {slot.count > 0 && (
                  <span className="mt-0.5 text-[11px] text-muted-foreground">
                    {slot.count} trade{slot.count !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-4 rounded-sm"
            style={{ backgroundColor: "hsl(0 70% 42%)" }}
          />
          Loss
        </div>
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-4 rounded-sm"
            style={{ backgroundColor: "hsl(142 65% 48%)" }}
          />
          Profit
        </div>
      </div>

      {/* Day-by-day details row */}
      <div className="grid grid-cols-5 gap-2 border-t border-border pt-3">
        {[1, 2, 3, 4, 5].map((d) => {
          const slot = dayStats[d];
          return (
            <div key={d} className="text-center">
              <p className="text-[11px] font-medium text-muted-foreground">
                {DAY_LABELS[d - 1]}
              </p>
              <p
                className={`font-mono text-[11px] font-semibold tabular-nums ${
                  slot.avg >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {slot.count > 0 ? `${slot.avg >= 0 ? "+" : ""}${slot.avg.toFixed(2)}` : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {slot.count} trade{slot.count !== 1 ? "s" : ""}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {slot.count > 0 ? `$${fmt(slot.total)}` : ""}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
