"use client";

import { useMemo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Clock, Calendar, BarChart2, Lightbulb } from "lucide-react";
import { loadTradeTags } from "./TradeLogTable";
import type { TradeRow } from "@/app/(dashboard)/journal/JournalPageClient";
import { formatCurrency } from "@/lib/utils";

// ── Insight card types ──────────────────────────────────────────────────────

interface Insight {
  id: string;
  label: string;
  value: string;
  detail: string;
  sentiment: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

// ── Day-of-week helper ──────────────────────────────────────────────────────

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── PerformanceInsights component ───────────────────────────────────────────

interface Props {
  rows: TradeRow[];
}

export function PerformanceInsights({ rows }: Props) {
  const [tradeTags, setTradeTags] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setTradeTags(loadTradeTags());
  }, []);

  const insights = useMemo((): Insight[] => {
    if (rows.length === 0) return [];

    const result: Insight[] = [];

    // ── 1. Planned vs Impulsive ──────────────────────────────────────────────
    const plannedRows = rows.filter((r) => (tradeTags[r.id] ?? r.trade.tags ?? []).includes("Planned"));
    const impulsiveRows = rows.filter((r) => (tradeTags[r.id] ?? r.trade.tags ?? []).includes("Impulsive"));

    if (plannedRows.length >= 2 && impulsiveRows.length >= 2) {
      const plannedWinRate = plannedRows.filter((r) => r.trade.realizedPnL > 0).length / plannedRows.length;
      const impulsiveWinRate = impulsiveRows.filter((r) => r.trade.realizedPnL > 0).length / impulsiveRows.length;
      const diff = plannedWinRate - impulsiveWinRate;
      const diffPct = Math.abs(diff * 100).toFixed(0);

      result.push({
        id: "planned_vs_impulsive",
        label: "System Adherence",
        value: `${(plannedWinRate * 100).toFixed(0)}% vs ${(impulsiveWinRate * 100).toFixed(0)}%`,
        detail:
          diff > 0
            ? `You win ${diffPct}% more often when you follow your plan (${plannedRows.length} planned trades vs ${impulsiveRows.length} impulsive).`
            : `Your impulsive trades win ${diffPct}% more often — consider whether your system needs adjusting.`,
        sentiment: diff > 0 ? "positive" : "negative",
        icon: <TrendingUp className="h-3.5 w-3.5" />,
      });
    }

    // ── 2. Holding time vs win rate ──────────────────────────────────────────
    const validRows = rows.filter((r) => r.durationMs >= 0);
    if (validRows.length >= 3) {
      const ONE_HOUR_MS = 60 * 60 * 1000;
      const longHeld = validRows.filter((r) => r.durationMs >= ONE_HOUR_MS);
      const shortHeld = validRows.filter((r) => r.durationMs < ONE_HOUR_MS);

      if (longHeld.length >= 2 && shortHeld.length >= 2) {
        const longAvgPct =
          longHeld.reduce((s, r) => s + r.pnlPct, 0) / longHeld.length;
        const shortAvgPct =
          shortHeld.reduce((s, r) => s + r.pnlPct, 0) / shortHeld.length;
        const better = longAvgPct > shortAvgPct ? "longer" : "shorter";
        const diff = Math.abs(longAvgPct - shortAvgPct).toFixed(1);

        result.push({
          id: "hold_time",
          label: "Hold Duration",
          value: `${longAvgPct.toFixed(1)}% avg (>1h)`,
          detail: `Your average return when holding over 1 hour is ${longAvgPct.toFixed(1)}% vs ${shortAvgPct.toFixed(1)}% for shorter holds. ${better === "longer" ? "Patient" : "Nimble"} trades perform ${diff}% better.`,
          sentiment: longAvgPct > 0 ? "positive" : "negative",
          icon: <Clock className="h-3.5 w-3.5" />,
        });
      }
    }

    // ── 3. Best day of week ──────────────────────────────────────────────────
    const dowMap = new Map<number, { pnl: number; count: number }>();
    for (const r of rows) {
      const dow = new Date(r.trade.simulationDate).getDay();
      if (!dowMap.has(dow)) dowMap.set(dow, { pnl: 0, count: 0 });
      const entry = dowMap.get(dow)!;
      entry.pnl += r.trade.realizedPnL;
      entry.count += 1;
    }

    if (dowMap.size >= 2) {
      const dowAvgs = Array.from(dowMap.entries())
        .map(([dow, { pnl, count }]) => ({ dow, avg: pnl / count }))
        .sort((a, b) => b.avg - a.avg);

      const best = dowAvgs[0];
      const worst = dowAvgs[dowAvgs.length - 1];

      result.push({
        id: "best_dow",
        label: "Best Day of Week",
        value: `${DOW_LABELS[best.dow]} (${formatCurrency(best.avg)} avg)`,
        detail: `${DOW_LABELS[best.dow]} is your strongest trading day with an average P&L of ${formatCurrency(best.avg)}. ${DOW_LABELS[worst.dow]} is your weakest at ${formatCurrency(worst.avg)} avg.`,
        sentiment: best.avg > 0 ? "positive" : "neutral",
        icon: <Calendar className="h-3.5 w-3.5" />,
      });
    }

    // ── 4. Cut winners early ────────────────────────────────────────────────
    const wins = rows.filter((r) => r.trade.realizedPnL > 0);
    const losses = rows.filter((r) => r.trade.realizedPnL < 0);

    if (wins.length >= 3 && losses.length >= 3) {
      const avgWinPct = wins.reduce((s, r) => s + r.pnlPct, 0) / wins.length;
      const avgLossPct = losses.reduce((s, r) => s + Math.abs(r.pnlPct), 0) / losses.length;
      const rr = avgLossPct > 0 ? avgWinPct / avgLossPct : 0;

      const insight: Insight = {
        id: "rr_ratio",
        label: "Reward / Risk Pattern",
        value: `R:R ${rr.toFixed(2)}:1`,
        detail:
          rr < 1
            ? `Average win is ${avgWinPct.toFixed(1)}% but average loss is ${avgLossPct.toFixed(1)}%. You may be cutting winners early — consider letting profits run.`
            : `Average win is ${avgWinPct.toFixed(1)}% vs average loss of ${avgLossPct.toFixed(1)}%. Your R:R ratio of ${rr.toFixed(2)}:1 is favorable.`,
        sentiment: rr >= 1.5 ? "positive" : rr >= 1 ? "neutral" : "negative",
        icon: <BarChart2 className="h-3.5 w-3.5" />,
      };
      result.push(insight);
    }

    // ── 5. FOMO / Revenge tag performance ───────────────────────────────────
    const fomoRows = rows.filter((r) => (tradeTags[r.id] ?? r.trade.tags ?? []).includes("FOMO"));
    const revengeRows = rows.filter((r) =>
      (tradeTags[r.id] ?? r.trade.tags ?? []).includes("Revenge Trade"),
    );

    if (fomoRows.length >= 1 || revengeRows.length >= 1) {
      const badTrades = [...fomoRows, ...revengeRows];
      const badWinRate = badTrades.filter((r) => r.trade.realizedPnL > 0).length / badTrades.length;
      const badAvgPnl = badTrades.reduce((s, r) => s + r.trade.realizedPnL, 0) / badTrades.length;

      result.push({
        id: "emotional_trades",
        label: "Emotional Trade Impact",
        value: `${(badWinRate * 100).toFixed(0)}% win rate`,
        detail: `Your ${badTrades.length} FOMO/revenge trade${badTrades.length !== 1 ? "s" : ""} ${badTrades.length !== 1 ? "have" : "has"} an average P&L of ${formatCurrency(badAvgPnl)}. ${badAvgPnl < 0 ? "These trades are hurting your performance." : "Surprisingly, these are working — though the habit remains risky."}`,
        sentiment: badAvgPnl > 0 ? "neutral" : "negative",
        icon: <TrendingDown className="h-3.5 w-3.5" />,
      });
    }

    // ── 6. Streak awareness ──────────────────────────────────────────────────
    // Use trade count as a deterministic seed (no randomness)
    if (rows.length >= 5) {
      const last5 = rows.slice(-5);
      const last5Wins = last5.filter((r) => r.trade.realizedPnL > 0).length;
      const overall = rows.filter((r) => r.trade.realizedPnL > 0).length / rows.length;

      const recentRate = last5Wins / 5;
      const diff = recentRate - overall;

      result.push({
        id: "recent_form",
        label: "Recent Form",
        value: `${last5Wins}/5 last trades`,
        detail:
          diff > 0
            ? `Your recent win rate of ${(recentRate * 100).toFixed(0)}% is above your ${(overall * 100).toFixed(0)}% average — you are in good form.`
            : diff < -0.1
            ? `Your recent win rate of ${(recentRate * 100).toFixed(0)}% is below your ${(overall * 100).toFixed(0)}% average — consider reviewing your recent decisions.`
            : `Your recent form of ${(recentRate * 100).toFixed(0)}% is in line with your ${(overall * 100).toFixed(0)}% average.`,
        sentiment: diff > 0 ? "positive" : diff < -0.1 ? "negative" : "neutral",
        icon: <Lightbulb className="h-3.5 w-3.5" />,
      });
    }

    return result.slice(0, 6);
  }, [rows, tradeTags]);

  if (rows.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground rounded-lg border border-dashed border-border/20">
        <p className="text-sm">No trades to analyze yet.</p>
        <p className="text-[11px] text-muted-foreground/60">
          Complete trades and add tags for richer insights.
        </p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground rounded-lg border border-dashed border-border/20">
        <p className="text-sm">Need more trade data for insights.</p>
        <p className="text-[11px] text-muted-foreground/60">
          Complete at least 5 trades. Tag trades as &quot;Planned&quot; or &quot;Impulsive&quot; for behavioral insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
      {rows.length > 0 && (
        <p className="text-[11px] text-muted-foreground/50 text-right">
          Based on {rows.length} closed trade{rows.length !== 1 ? "s" : ""}. Tag trades in the Log tab for behavioral insights.
        </p>
      )}
    </div>
  );
}

// ── InsightCard ──────────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
  const borderColor =
    insight.sentiment === "positive"
      ? "border-l-green-500"
      : insight.sentiment === "negative"
      ? "border-l-red-500"
      : "border-l-blue-500";

  const iconColor =
    insight.sentiment === "positive"
      ? "text-green-400"
      : insight.sentiment === "negative"
      ? "text-red-400"
      : "text-primary";

  const valueColor =
    insight.sentiment === "positive"
      ? "text-green-400"
      : insight.sentiment === "negative"
      ? "text-red-400"
      : "text-foreground";

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card border-l-2 pl-3 pr-4 py-3",
        borderColor,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 shrink-0", iconColor)}>{insight.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">
              {insight.label}
            </span>
            <span className={cn("text-xs font-semibold tabular-nums", valueColor)}>
              {insight.value}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
            {insight.detail}
          </p>
        </div>
      </div>
    </div>
  );
}
