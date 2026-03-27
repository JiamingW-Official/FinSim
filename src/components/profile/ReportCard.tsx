"use client";

import { useMemo } from "react";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { cn } from "@/lib/utils";

type Grade = "A" | "B" | "C" | "D" | "F";

interface Metric {
  label: string;
  grade: Grade;
  score: number; // 0–100
  comment: string;
}

function scoreToGrade(score: number): Grade {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

const GRADE_COLOR: Record<Grade, string> = {
  A: "text-emerald-400",
  B: "text-blue-400",
  C: "text-amber-400",
  D: "text-orange-400",
  F: "text-red-400",
};

const GRADE_BG: Record<Grade, string> = {
  A: "bg-emerald-500/10 border-emerald-500/20",
  B: "bg-blue-500/10 border-blue-500/20",
  C: "bg-amber-500/10 border-amber-500/20",
  D: "bg-orange-500/10 border-orange-500/20",
  F: "bg-red-500/10 border-red-500/20",
};

function gradeComment(label: string, grade: Grade): string {
  const comments: Record<string, Record<Grade, string>> = {
    Consistency: {
      A: "Rock-solid — you trade with disciplined regularity.",
      B: "Fairly consistent. Small gaps in your routine.",
      C: "Inconsistent trading patterns detected.",
      D: "Irregular activity is costing you compounding gains.",
      F: "No consistent trading rhythm established yet.",
    },
    "Risk Management": {
      A: "Excellent risk control — losses are well contained.",
      B: "Good discipline, occasional overexposure.",
      C: "Risk management needs improvement.",
      D: "Large drawdowns suggest position sizing issues.",
      F: "Losses significantly outpace wins — recalibrate your sizing.",
    },
    Timing: {
      A: "Entries and exits are well-timed.",
      B: "Generally good timing with room to sharpen exits.",
      C: "Entries are often slightly late or early.",
      D: "Timing could improve — entries often chase the move.",
      F: "Most entries appear to miss optimal price points.",
    },
    Diversification: {
      A: "Well-diversified across multiple instruments.",
      B: "Good spread across tickers.",
      C: "Could diversify further to reduce concentration risk.",
      D: "Over-concentrated in too few tickers.",
      F: "Single-ticker focus creates excessive concentration risk.",
    },
    Discipline: {
      A: "Highly disciplined — limit orders used consistently.",
      B: "Good discipline with occasional market chasing.",
      C: "Moderate use of limit orders. More discipline needed.",
      D: "Mostly market orders; reactive trading patterns.",
      F: "No evidence of disciplined order planning.",
    },
    Profitability: {
      A: "Exceptional P&L performance.",
      B: "Solidly profitable with good win rates.",
      C: "Marginally profitable — refine your edge.",
      D: "Slightly net negative. Review your strategy.",
      F: "Currently net negative. Focus on capital preservation.",
    },
  };
  return comments[label]?.[grade] ?? `${label} needs attention.`;
}

export function ReportCard() {
  const stats = useGameStore((s) => s.stats);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const metrics: Metric[] = useMemo(() => {
    const sells = tradeHistory.filter((t) => t.side === "sell");
    const totalTrades = stats.totalTrades;
    const winRate = totalTrades > 0 ? stats.profitableTrades / totalTrades : 0;

    // 1. Consistency — based on daily streak vs total trades
    const consistencyRaw = Math.min(stats.dailyStreak * 15 + (totalTrades > 0 ? Math.min(totalTrades * 2, 40) : 0), 100);

    // 2. Risk Management — ratio of largest loss to largest win
    const riskRaw = (() => {
      if (totalTrades === 0) return 30;
      const lossRatio = stats.largestLoss < 0 && stats.largestWin > 0
        ? Math.abs(stats.largestLoss) / stats.largestWin
        : 0;
      // lossRatio < 1 is good (loss smaller than win)
      const base = lossRatio < 0.5 ? 90 : lossRatio < 1 ? 70 : lossRatio < 2 ? 50 : 25;
      return base;
    })();

    // 3. Timing — approximate from average P&L per trade
    const timingRaw = (() => {
      if (sells.length === 0) return 30;
      const avgPnL = sells.reduce((s, t) => s + t.realizedPnL, 0) / sells.length;
      if (avgPnL > 500) return 90;
      if (avgPnL > 200) return 78;
      if (avgPnL > 50) return 65;
      if (avgPnL > 0) return 55;
      if (avgPnL > -100) return 40;
      return 22;
    })();

    // 4. Diversification — unique tickers
    const diversRaw = Math.min(stats.uniqueTickersTraded.length * 18, 100);

    // 5. Discipline — limit orders ratio
    const disciplineRaw = (() => {
      if (totalTrades === 0) return 30;
      const ratio = stats.limitOrdersUsed / totalTrades;
      return Math.min(ratio * 120, 100);
    })();

    // 6. Profitability — win rate + total P&L
    const profitRaw = (() => {
      const wrScore = winRate * 80;
      const pnlBonus = stats.totalPnL > 5000 ? 20 : stats.totalPnL > 1000 ? 10 : stats.totalPnL > 0 ? 5 : 0;
      return Math.min(wrScore + pnlBonus, 100);
    })();

    const rawScores: [string, number][] = [
      ["Consistency", consistencyRaw],
      ["Risk Management", riskRaw],
      ["Timing", timingRaw],
      ["Diversification", diversRaw],
      ["Discipline", disciplineRaw],
      ["Profitability", profitRaw],
    ];

    return rawScores.map(([label, score]) => {
      const grade = scoreToGrade(score);
      return { label, grade, score, comment: gradeComment(label, grade) };
    });
  }, [stats, tradeHistory]);

  const overallGrade: Grade = useMemo(() => {
    const avg = metrics.reduce((s, m) => s + m.score, 0) / metrics.length;
    return scoreToGrade(avg);
  }, [metrics]);

  return (
    <div className="space-y-3">
      {/* Overall grade */}
      <div className={cn("flex items-center justify-between rounded-xl border p-3", GRADE_BG[overallGrade])}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Overall Grade</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Based on {stats.totalTrades} trades across 6 dimensions
          </p>
        </div>
        <span className={cn("text-4xl font-black tabular-nums", GRADE_COLOR[overallGrade])}>
          {overallGrade}
        </span>
      </div>

      {/* 6-metric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-border bg-card/50 p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold">{m.label}</span>
              <span className={cn("text-lg font-black", GRADE_COLOR[m.grade])}>{m.grade}</span>
            </div>
            {/* Score bar */}
            <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", {
                  "bg-emerald-500/70": m.grade === "A",
                  "bg-blue-500/70": m.grade === "B",
                  "bg-amber-500/70": m.grade === "C",
                  "bg-orange-500/70": m.grade === "D",
                  "bg-red-500/70": m.grade === "F",
                })}
                style={{ width: `${m.score}%` }}
              />
            </div>
            <p className="text-[9px] leading-relaxed text-muted-foreground">{m.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
