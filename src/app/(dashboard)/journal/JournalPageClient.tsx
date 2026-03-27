"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency, cn } from "@/lib/utils";
import { BookOpen, BarChart3, Calendar, Loader2 } from "lucide-react";
import { PnLCalendar } from "@/components/journal/PnLCalendar";
import { TradeLogTable } from "@/components/journal/TradeLogTable";

const JournalEquityCurve = dynamic(
  () => import("@/components/journal/EquityCurve").then((m) => m.JournalEquityCurve),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-60 items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading chart...
      </div>
    ),
  },
);

// ── Grade helper ────────────────────────────────────────────────────────────
export function gradeForPnLPct(pct: number): { grade: string; color: string } {
  if (pct > 15) return { grade: "A", color: "text-green-400" };
  if (pct > 5)  return { grade: "B", color: "text-teal-400" };
  if (pct >= 0) return { grade: "C", color: "text-amber-400" };
  if (pct > -5) return { grade: "D", color: "text-orange-400" };
  return { grade: "F", color: "text-red-400" };
}

// ── Duration formatter ──────────────────────────────────────────────────────
export function formatDuration(ms: number): string {
  if (ms < 0) return "—";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  return `${Math.floor(hrs / 24)}d`;
}

// ── TradeRow type ───────────────────────────────────────────────────────────
export interface TradeRow {
  id: string;
  trade: import("@/types/trading").TradeRecord;
  direction: "long" | "short";
  pnlPct: number;
  grade: ReturnType<typeof gradeForPnLPct>;
  durationMs: number;
  entryPrice: number;
}

// ── Analytics ───────────────────────────────────────────────────────────────
function computeAnalytics(rows: TradeRow[]) {
  const wins = rows.filter((r) => r.trade.realizedPnL > 0);
  const losses = rows.filter((r) => r.trade.realizedPnL < 0);
  const winRate = rows.length > 0 ? (wins.length / rows.length) * 100 : 0;
  const avgWin =
    wins.length > 0
      ? wins.reduce((s, r) => s + r.trade.realizedPnL, 0) / wins.length
      : 0;
  const avgLoss =
    losses.length > 0
      ? losses.reduce((s, r) => s + r.trade.realizedPnL, 0) / losses.length
      : 0;
  const totalWins = wins.reduce((s, r) => s + r.trade.realizedPnL, 0);
  const totalLosses = Math.abs(losses.reduce((s, r) => s + r.trade.realizedPnL, 0));
  const profitFactor =
    totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
  const totalPnL = rows.reduce((s, r) => s + r.trade.realizedPnL, 0);
  const best =
    rows.length > 0
      ? rows.reduce((a, b) =>
          a.trade.realizedPnL > b.trade.realizedPnL ? a : b,
        )
      : null;
  const worst =
    rows.length > 0
      ? rows.reduce((a, b) =>
          a.trade.realizedPnL < b.trade.realizedPnL ? a : b,
        )
      : null;
  const validDurations = rows.filter((r) => r.durationMs >= 0);
  const avgDuration =
    validDurations.length > 0
      ? validDurations.reduce((s, r) => s + r.durationMs, 0) /
        validDurations.length
      : 0;
  const lossPct = 1 - winRate / 100;
  const expectancy = (winRate / 100) * avgWin + lossPct * avgLoss;
  return {
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    totalPnL,
    best,
    worst,
    avgDuration,
    expectancy,
    totalTrades: rows.length,
  };
}

// ── Page tabs ────────────────────────────────────────────────────────────────
type PageTab = "log" | "analytics" | "calendar";

const PAGE_TABS: { value: PageTab; label: string }[] = [
  { value: "log", label: "Trade Log" },
  { value: "analytics", label: "Analytics" },
  { value: "calendar", label: "Calendar" },
];

// ── Main Component ───────────────────────────────────────────────────────────
export default function JournalPageClient() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const [pageTab, setPageTab] = useState<PageTab>("log");

  // Build augmented rows: pair closing trades to their opening legs
  const rows = useMemo<TradeRow[]>(() => {
    const buyStack = new Map<string, { price: number; timestamp: number }[]>();
    const result: TradeRow[] = [];
    const chrono = [...tradeHistory].sort((a, b) => a.timestamp - b.timestamp);

    for (const trade of chrono) {
      if (trade.realizedPnL === 0) {
        if (!buyStack.has(trade.ticker)) buyStack.set(trade.ticker, []);
        buyStack.get(trade.ticker)!.push({
          price: trade.price,
          timestamp: trade.timestamp,
        });
        continue;
      }
      const stack = buyStack.get(trade.ticker);
      let entryPrice = trade.price;
      let durationMs = -1;
      if (stack && stack.length > 0) {
        const match = stack.pop()!;
        entryPrice = match.price;
        durationMs = trade.timestamp - match.timestamp;
      }
      const entryValue = entryPrice * trade.quantity;
      const pnlPct = entryValue > 0 ? (trade.realizedPnL / entryValue) * 100 : 0;
      const direction: "long" | "short" =
        trade.side === "sell" ? "long" : "short";
      result.push({
        id: trade.id,
        trade,
        direction,
        pnlPct,
        grade: gradeForPnLPct(pnlPct),
        durationMs,
        entryPrice,
      });
    }
    return result;
  }, [tradeHistory]);

  const analytics = useMemo(() => computeAnalytics(rows), [rows]);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-4 p-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
            <BookOpen className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Trade Journal</h1>
            <p className="text-[10px] text-muted-foreground">
              {rows.length} closed trade{rows.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Performance header strip */}
        {rows.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            <StatChip
              label="Win Rate"
              value={`${analytics.winRate.toFixed(1)}%`}
              color={analytics.winRate >= 50 ? "text-green-400" : "text-red-400"}
            />
            <StatChip
              label="Avg Win"
              value={analytics.avgWin > 0 ? formatCurrency(analytics.avgWin) : "—"}
              color="text-green-400"
            />
            <StatChip
              label="Avg Loss"
              value={analytics.avgLoss < 0 ? formatCurrency(analytics.avgLoss) : "—"}
              color="text-red-400"
            />
            <StatChip
              label="Profit Factor"
              value={
                analytics.profitFactor === Infinity
                  ? "∞"
                  : analytics.profitFactor.toFixed(2)
              }
              color={analytics.profitFactor >= 1 ? "text-green-400" : "text-red-400"}
            />
            <StatChip
              label="Total Trades"
              value={String(analytics.totalTrades)}
            />
            <StatChip
              label="Total P&L"
              value={formatCurrency(analytics.totalPnL)}
              color={
                analytics.totalPnL > 0
                  ? "text-green-400"
                  : analytics.totalPnL < 0
                  ? "text-red-400"
                  : undefined
              }
            />
            <StatChip
              label="Expectancy"
              value={formatCurrency(analytics.expectancy)}
              color={analytics.expectancy >= 0 ? "text-green-400" : "text-red-400"}
              sub="per trade"
            />
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex items-center gap-1 border-b border-border">
          {PAGE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setPageTab(tab.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                pageTab === tab.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Trade Log */}
        {pageTab === "log" && (
          <TradeLogTable rows={rows} />
        )}

        {/* Analytics */}
        {pageTab === "analytics" && (
          <div className="space-y-4">
            {rows.length === 0 ? (
              <EmptyState message="No closed trades to analyse yet." />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatChip
                    label="Win Rate"
                    value={`${analytics.winRate.toFixed(1)}%`}
                    color={analytics.winRate >= 50 ? "text-green-400" : "text-red-400"}
                    sub={`${rows.filter((r) => r.trade.realizedPnL > 0).length}W / ${rows.filter((r) => r.trade.realizedPnL < 0).length}L`}
                  />
                  <StatChip
                    label="Profit Factor"
                    value={
                      analytics.profitFactor === Infinity
                        ? "∞"
                        : analytics.profitFactor.toFixed(2)
                    }
                    color={
                      analytics.profitFactor >= 1
                        ? "text-green-400"
                        : "text-red-400"
                    }
                    sub="Sum wins / sum losses"
                  />
                  <StatChip
                    label="Expectancy"
                    value={formatCurrency(analytics.expectancy)}
                    color={
                      analytics.expectancy >= 0 ? "text-green-400" : "text-red-400"
                    }
                    sub="Per trade avg"
                  />
                  <StatChip
                    label="Avg Hold Time"
                    value={
                      analytics.avgDuration > 0
                        ? formatDuration(analytics.avgDuration)
                        : "—"
                    }
                    sub="All closed trades"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatChip
                    label="Avg Winner"
                    value={
                      analytics.avgWin > 0
                        ? formatCurrency(analytics.avgWin)
                        : "—"
                    }
                    color="text-green-400"
                  />
                  <StatChip
                    label="Avg Loser"
                    value={
                      analytics.avgLoss < 0
                        ? formatCurrency(analytics.avgLoss)
                        : "—"
                    }
                    color="text-red-400"
                  />
                  <StatChip
                    label="Best Trade"
                    value={
                      analytics.best
                        ? formatCurrency(analytics.best.trade.realizedPnL)
                        : "—"
                    }
                    color="text-green-400"
                    sub={analytics.best?.trade.ticker}
                  />
                  <StatChip
                    label="Worst Trade"
                    value={
                      analytics.worst
                        ? formatCurrency(analytics.worst.trade.realizedPnL)
                        : "—"
                    }
                    color="text-red-400"
                    sub={analytics.worst?.trade.ticker}
                  />
                </div>

                {/* Grade distribution */}
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="mb-3 text-xs font-semibold">Grade Distribution</p>
                  <div className="flex items-end gap-2 h-20">
                    {(["A", "B", "C", "D", "F"] as const).map((g) => {
                      const count = rows.filter(
                        (r) => r.grade.grade === g,
                      ).length;
                      const pct =
                        rows.length > 0 ? (count / rows.length) * 100 : 0;
                      const barColors: Record<string, string> = {
                        A: "bg-green-400",
                        B: "bg-teal-400",
                        C: "bg-amber-400",
                        D: "bg-orange-400",
                        F: "bg-red-400",
                      };
                      const labelColors: Record<string, string> = {
                        A: "text-green-400",
                        B: "text-teal-400",
                        C: "text-amber-400",
                        D: "text-orange-400",
                        F: "text-red-400",
                      };
                      return (
                        <div
                          key={g}
                          className="flex flex-1 flex-col items-center gap-1 h-full justify-end"
                        >
                          <span className="text-[10px] tabular-nums text-muted-foreground">
                            {count}
                          </span>
                          <div
                            className={cn(
                              "w-full rounded-sm transition-all",
                              barColors[g],
                            )}
                            style={{
                              height: `${Math.max(pct > 0 ? 6 : 0, pct * 0.7)}px`,
                            }}
                          />
                          <span
                            className={cn("text-xs font-bold", labelColors[g])}
                          >
                            {g}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Equity Curve */}
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                    <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                    Equity Curve with Drawdown
                  </div>
                  <JournalEquityCurve
                    trades={rows.map((r) => r.trade)}
                    height={220}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Calendar */}
        {pageTab === "calendar" && (
          <div className="space-y-4">
            {tradeHistory.length === 0 ? (
              <EmptyState message="No trades to display on the calendar yet." />
            ) : (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold">
                  <Calendar className="h-3.5 w-3.5 text-green-400" />
                  Monthly P&L Calendar
                </div>
                <PnLCalendar trades={tradeHistory} />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-3 transition-colors hover:border-border/60">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 text-base font-bold tabular-nums", color)}>
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 text-[10px] text-muted-foreground/60">{sub}</div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
      <BookOpen className="h-6 w-6 opacity-25" />
      <p className="text-sm text-center">{message}</p>
    </div>
  );
}
