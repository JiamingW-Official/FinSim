"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useTradingStore } from "@/stores/trading-store";
import { useLearnStore } from "@/stores/learn-store";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { getLessonById, getUnitForLesson } from "@/data/lessons";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ActivityType = "trade" | "lesson" | "flashcard";

interface ActivityItem {
  id: string;
  type: ActivityType;
  label: string;
  sublabel: string;
  /** Unix ms — used for sorting and time-ago display */
  timestamp: number;
  /** Colour class for the type indicator dot */
  dotClass: string;
}

/* ------------------------------------------------------------------ */
/*  Time-ago helper                                                    */
/* ------------------------------------------------------------------ */

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RecentActivity() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const lessonScores = useLearnStore((s) => s.lessonScores);
  const totalReviewed = useFlashcardStore((s) => s.totalReviewed);
  const totalCorrect = useFlashcardStore((s) => s.totalCorrect);
  const lastReviewDate = useFlashcardStore((s) => s.lastReviewDate);

  const items = useMemo<ActivityItem[]>(() => {
    const result: ActivityItem[] = [];

    /* --- Trades (most recent 5) ------------------------------------ */
    const recentTrades = tradeHistory.slice(0, 5);
    for (const trade of recentTrades) {
      const isBuy = trade.side === "buy";
      const hasPnL = trade.realizedPnL !== 0;
      const pnlStr = hasPnL
        ? `${trade.realizedPnL >= 0 ? "+" : ""}${formatCurrency(trade.realizedPnL)}`
        : `${formatCurrency(trade.price * trade.quantity)}`;
      result.push({
        id: `trade-${trade.id}`,
        type: "trade",
        label: `${trade.ticker} — ${isBuy ? "Buy" : "Sell"} x${trade.quantity}`,
        sublabel: hasPnL
          ? `P&L: ${pnlStr}`
          : `Cost: ${pnlStr}`,
        timestamp: trade.timestamp,
        dotClass: isBuy ? "bg-green-400" : "bg-red-400",
      });
    }

    /* --- Lessons (last 3 completed) ------------------------------- */
    // completedLessons is ordered oldest → newest; take last 3
    const lastLessons = completedLessons.slice(-3).reverse();
    for (const lessonId of lastLessons) {
      const lesson = getLessonById(lessonId);
      const unit = getUnitForLesson(lessonId);
      const score = lessonScores[lessonId];
      const grade = score ? ` — ${score.grade}` : "";

      // No per-lesson timestamp stored; approximate from score if absent.
      // We use a synthetic decreasing offset so order reflects insertion order.
      const idx = completedLessons.indexOf(lessonId);
      // Approximate: treat each lesson as 10 min apart, anchored to now
      const approxTs =
        Date.now() -
        (completedLessons.length - 1 - idx) * 10 * 60 * 1000;

      result.push({
        id: `lesson-${lessonId}`,
        type: "lesson",
        label: lesson ? lesson.title : lessonId,
        sublabel: `${unit ? unit.title : "Lesson"}${grade}`,
        timestamp: approxTs,
        dotClass: "bg-blue-400",
      });
    }

    /* --- Flashcard session ---------------------------------------- */
    if (lastReviewDate && totalReviewed > 0) {
      // lastReviewDate is "YYYY-MM-DD"; treat as start-of-day in local time
      const reviewTs = new Date(lastReviewDate + "T00:00:00").getTime();
      const accuracy =
        totalReviewed > 0
          ? Math.round((totalCorrect / totalReviewed) * 100)
          : 0;
      result.push({
        id: "flashcard-session",
        type: "flashcard",
        label: `Flashcard Review — ${totalReviewed} cards total`,
        sublabel: `Overall accuracy: ${accuracy}%`,
        timestamp: reviewTs,
        dotClass: "bg-amber-400",
      });
    }

    /* Sort by most recent first */
    result.sort((a, b) => b.timestamp - a.timestamp);

    return result.slice(0, 7);
  }, [
    tradeHistory,
    completedLessons,
    lessonScores,
    totalReviewed,
    totalCorrect,
    lastReviewDate,
  ]);

  return (
    <div>
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Recent Activity
      </h2>

      <div className="surface-elevated overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-6 text-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground/40"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-[11px] text-muted-foreground">
              No recent activity
            </p>
            <p className="text-[10px] text-muted-foreground/50">
              Trade, complete a lesson, or review flashcards to get started
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/30">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/20 transition-colors"
              >
                {/* Type dot */}
                <div
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    item.dotClass,
                  )}
                />

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium">
                    {item.label}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {item.sublabel}
                  </p>
                </div>

                {/* Time */}
                <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground/60">
                  {timeAgo(item.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
