"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { TradeRecord } from "@/types/trading";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DaySummary {
  date: string; // "YYYY-MM-DD"
  pnl: number;
  tradeCount: number;
  trades: TradeRecord[];
}

interface Props {
  trades: TradeRecord[];
}

function getDayKey(timestamp: number): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function PnLCalendar({ trades }: Props) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed
  const [hoverDay, setHoverDay] = useState<string | null>(null);

  // Build day summary map from closed trades only (side=sell/buy with realizedPnL)
  const dayMap = useMemo<Map<string, DaySummary>>(() => {
    const map = new Map<string, DaySummary>();
    // Use simulationDate for each trade
    for (const trade of trades) {
      const key = getDayKey(trade.simulationDate);
      const pnl = trade.realizedPnL ?? 0;
      if (!map.has(key)) {
        map.set(key, { date: key, pnl: 0, tradeCount: 0, trades: [] });
      }
      const entry = map.get(key)!;
      entry.pnl += pnl;
      entry.tradeCount += 1;
      entry.trades.push(trade);
    }
    return map;
  }, [trades]);

  // Max absolute PnL for intensity normalization
  const maxAbsPnl = useMemo(() => {
    let max = 0;
    for (const [, v] of dayMap) {
      if (Math.abs(v.pnl) > max) max = Math.abs(v.pnl);
    }
    return max;
  }, [dayMap]);

  function getIntensity(pnl: number): number {
    if (maxAbsPnl === 0) return 0;
    return Math.min(1, Math.abs(pnl) / maxAbsPnl);
  }

  function getCellStyle(summary: DaySummary | undefined): string {
    if (!summary || summary.tradeCount === 0) return "bg-card border-border/40";
    const intensity = getIntensity(summary.pnl);
    if (summary.pnl > 0) {
      if (intensity > 0.66) return "bg-green-500/40 border-green-500/50 text-green-300";
      if (intensity > 0.33) return "bg-green-500/25 border-green-500/35 text-green-400";
      return "bg-green-500/12 border-green-500/25 text-green-500/80";
    } else {
      if (intensity > 0.66) return "bg-red-500/40 border-red-500/50 text-red-300";
      if (intensity > 0.33) return "bg-red-500/25 border-red-500/35 text-red-400";
      return "bg-red-500/12 border-red-500/25 text-red-500/80";
    }
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Cells: leading empty + day cells
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const hoveredSummary = hoverDay ? dayMap.get(hoverDay) : null;

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border/50 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-semibold">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border/50 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }
          const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const summary = dayMap.get(key);
          const isToday =
            day === now.getDate() &&
            viewMonth === now.getMonth() &&
            viewYear === now.getFullYear();

          return (
            <div
              key={key}
              onMouseEnter={() => setHoverDay(key)}
              onMouseLeave={() => setHoverDay(null)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded border text-xs font-medium transition-all cursor-default select-none",
                getCellStyle(summary),
                isToday && "ring-1 ring-primary/60",
                hoverDay === key && "ring-1 ring-white/20",
              )}
            >
              <span className={cn(summary?.tradeCount ? "font-semibold" : "text-muted-foreground/60")}>
                {day}
              </span>
              {summary && summary.tradeCount > 0 && (
                <span className="text-[7px] opacity-70 tabular-nums">
                  {summary.pnl >= 0 ? "+" : ""}{summary.pnl.toFixed(0)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover tooltip */}
      {hoveredSummary && hoveredSummary.tradeCount > 0 ? (
        <div className="rounded-lg border border-border bg-card p-2.5 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{hoveredSummary.date}</span>
            <span className={cn(
              "font-mono font-semibold tabular-nums",
              hoveredSummary.pnl >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {hoveredSummary.pnl >= 0 ? "+" : ""}{formatCurrency(hoveredSummary.pnl)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {hoveredSummary.tradeCount} trade{hoveredSummary.tradeCount !== 1 ? "s" : ""} — {hoveredSummary.trades.map(t => t.ticker).join(", ")}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/40 bg-card/30 px-2.5 py-2 text-xs text-muted-foreground/50 text-center">
          Hover a day to see details
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 justify-end">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <div className="h-2 w-2 rounded-sm bg-red-500/35" />
          Loss
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <div className="h-2 w-2 rounded-sm bg-card border border-border/40" />
          No trades
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <div className="h-2 w-2 rounded-sm bg-green-500/35" />
          Win
        </div>
      </div>
    </div>
  );
}
