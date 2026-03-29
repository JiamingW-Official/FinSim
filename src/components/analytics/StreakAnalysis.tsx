"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { filterClosedTrades } from "@/services/analytics/trade-analytics";

const BLOCK_SIZE = 14;
const BLOCK_GAP = 2;
const COLS = 10;
const MAX_TRADES = 50;

export function StreakAnalysis() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const {
    sequence,
    longestWin,
    longestLoss,
    currentStreak,
    currentStreakType,
    avgStreak,
  } = useMemo(() => {
    const closed = filterClosedTrades(tradeHistory);
    // chronological order (oldest first)
    const chrono = [...closed].reverse();
    // take last MAX_TRADES
    const slice = chrono.slice(-MAX_TRADES);

    const sequence = slice.map((t) => t.realizedPnL > 0);

    // Compute streaks
    let longestWin = 0;
    let longestLoss = 0;
    let curW = 0;
    let curL = 0;
    const streakLengths: number[] = [];
    let prevIsWin: boolean | null = null;
    let curStreakLen = 0;

    for (const isWin of sequence) {
      if (isWin) {
        curW++;
        curL = 0;
        longestWin = Math.max(longestWin, curW);
      } else {
        curL++;
        curW = 0;
        longestLoss = Math.max(longestLoss, curL);
      }

      if (prevIsWin === null || isWin === prevIsWin) {
        curStreakLen++;
      } else {
        streakLengths.push(curStreakLen);
        curStreakLen = 1;
      }
      prevIsWin = isWin;
    }
    if (curStreakLen > 0) streakLengths.push(curStreakLen);

    const avgStreak =
      streakLengths.length > 0
        ? streakLengths.reduce((s, v) => s + v, 0) / streakLengths.length
        : 0;

    // Current streak
    let currentStreak = 0;
    let currentStreakType: "win" | "loss" | "none" = "none";
    if (sequence.length > 0) {
      const last = sequence[sequence.length - 1];
      currentStreakType = last ? "win" : "loss";
      for (let i = sequence.length - 1; i >= 0 && sequence[i] === last; i--) {
        currentStreak++;
      }
    }

    return { sequence, longestWin, longestLoss, currentStreak, currentStreakType, avgStreak };
  }, [tradeHistory]);

  if (sequence.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-1 text-muted-foreground">
        <p className="text-sm">No closed trades yet</p>
        <p className="text-xs opacity-60">Close some trades to see streak analysis</p>
      </div>
    );
  }

  // SVG grid layout
  const rows = Math.ceil(sequence.length / COLS);
  const svgW = COLS * (BLOCK_SIZE + BLOCK_GAP) - BLOCK_GAP + 8;
  const svgH = rows * (BLOCK_SIZE + BLOCK_GAP) - BLOCK_GAP + 8;

  // Highlight last N that form current streak
  const highlightStart = sequence.length - currentStreak;

  return (
    <div className="space-y-4">
      {/* Stat chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded border border-border bg-card/60 px-2 py-0.5">
          Longest win streak{" "}
          <span className="font-mono text-green-400">{longestWin}</span>
        </span>
        <span className="rounded border border-border bg-card/60 px-2 py-0.5">
          Longest loss streak{" "}
          <span className="font-mono text-red-400">{longestLoss}</span>
        </span>
        <span className="rounded border border-border bg-card/60 px-2 py-0.5">
          Avg streak{" "}
          <span className="font-mono text-foreground">{avgStreak.toFixed(1)}</span>
        </span>
        {currentStreak > 0 && (
          <span
            className={`rounded border px-2 py-0.5 font-mono ${
              currentStreakType === "win"
                ? "border-green-800 bg-green-950/40 text-green-400"
                : "border-red-800 bg-red-950/40 text-red-400"
            }`}
          >
            Current streak: {currentStreak} {currentStreakType === "win" ? "wins" : "losses"}
          </span>
        )}
      </div>

      {/* Block grid */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="max-w-full"
          style={{ minWidth: Math.min(svgW, 280), width: svgW }}
          aria-label="Win/loss streak sequence"
        >
          {sequence.map((isWin, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const x = 4 + col * (BLOCK_SIZE + BLOCK_GAP);
            const y = 4 + row * (BLOCK_SIZE + BLOCK_GAP);
            const isCurrentStreak = i >= highlightStart;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={BLOCK_SIZE}
                height={BLOCK_SIZE}
                rx={2}
                fill={isWin ? "hsl(142 55% 40%)" : "hsl(0 65% 40%)"}
                fillOpacity={isCurrentStreak ? 1 : 0.45}
                stroke={
                  isCurrentStreak
                    ? isWin
                      ? "hsl(142 65% 60%)"
                      : "hsl(0 65% 60%)"
                    : "transparent"
                }
                strokeWidth={isCurrentStreak ? 1.5 : 0}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-700/80" />
          Win
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-700/80" />
          Loss
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm border border-primary/50 opacity-100 bg-green-700/40" />
          Current streak
        </div>
        {sequence.length < MAX_TRADES ? null : (
          <span className="text-muted-foreground/60">Last {MAX_TRADES} trades shown</span>
        )}
      </div>
    </div>
  );
}
