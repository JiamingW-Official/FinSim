"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency, cn } from "@/lib/utils";
import { BookOpen, BarChart3, Calendar, FileText, Lightbulb, Brain, Loader2, ClipboardList } from "lucide-react";
import { PnLCalendar } from "@/components/journal/PnLCalendar";
import { TradeLogTable, TagStatsChart, loadTradeTags } from "@/components/journal/TradeLogTable";
import { JournalNotes } from "@/components/journal/JournalNotes";
import { PerformanceInsights } from "@/components/journal/PerformanceInsights";
import { WeeklyReview } from "@/components/analytics/WeeklyReview";
import { JournalAIAnalysis } from "@/components/journal/JournalAIAnalysis";

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

  // Best win streak / worst loss streak
  let bestStreak = 0;
  let worstStreak = 0;
  let curWin = 0;
  let curLoss = 0;
  for (const r of rows) {
    if (r.trade.realizedPnL > 0) {
      curWin++;
      curLoss = 0;
      if (curWin > bestStreak) bestStreak = curWin;
    } else if (r.trade.realizedPnL < 0) {
      curLoss++;
      curWin = 0;
      if (curLoss > worstStreak) worstStreak = curLoss;
    } else {
      curWin = 0;
      curLoss = 0;
    }
  }

  // Max drawdown from rows (cumulative PnL trough from peak)
  let cumPnL = 0;
  let peak = 0;
  let maxDD = 0;
  for (const r of rows) {
    cumPnL += r.trade.realizedPnL;
    if (cumPnL > peak) peak = cumPnL;
    const dd = peak - cumPnL;
    if (dd > maxDD) maxDD = dd;
  }

  // Trade count by ticker
  const tickerMap = new Map<string, { wins: number; losses: number; pnl: number }>();
  for (const r of rows) {
    const t = r.trade.ticker;
    if (!tickerMap.has(t)) tickerMap.set(t, { wins: 0, losses: 0, pnl: 0 });
    const entry = tickerMap.get(t)!;
    entry.pnl += r.trade.realizedPnL;
    if (r.trade.realizedPnL > 0) entry.wins++;
    else if (r.trade.realizedPnL < 0) entry.losses++;
  }
  const tickerStats = Array.from(tickerMap.entries())
    .map(([ticker, s]) => ({ ticker, ...s, total: s.wins + s.losses }))
    .sort((a, b) => b.total - a.total);

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
    bestStreak,
    worstStreak,
    maxDD,
    tickerStats,
  };
}

// ── Page tabs ────────────────────────────────────────────────────────────────
type PageTab = "log" | "analytics" | "calendar" | "notes" | "insights" | "review" | "ai";

const PAGE_TABS: { value: PageTab; label: string; icon: React.ReactNode }[] = [
  { value: "log",       label: "Log",       icon: <BookOpen className="h-3 w-3" /> },
  { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-3 w-3" /> },
  { value: "calendar",  label: "Calendar",  icon: <Calendar className="h-3 w-3" /> },
  { value: "notes",     label: "Notes",     icon: <FileText className="h-3 w-3" /> },
  { value: "insights",  label: "Insights",  icon: <Lightbulb className="h-3 w-3" /> },
  { value: "review",    label: "Review",    icon: <ClipboardList className="h-3 w-3" /> },
  { value: "ai",        label: "AI",        icon: <Brain className="h-3 w-3" /> },
];

// ── Main Component ───────────────────────────────────────────────────────────
export default function JournalPageClient() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const [pageTab, setPageTab] = useState<PageTab>("log");
  const [tradeTags, setTradeTags] = useState<Record<string, string[]>>({});

  // Load trade tags from localStorage
  useEffect(() => {
    setTradeTags(loadTradeTags());
  }, [pageTab]); // reload when switching tabs so analytics stay current

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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
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
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                pageTab === tab.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.icon}
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
                {/* Key stats grid */}
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
                    label="Best Streak"
                    value={`${analytics.bestStreak}W`}
                    color="text-green-400"
                    sub="Consecutive wins"
                  />
                  <StatChip
                    label="Worst Streak"
                    value={`${analytics.worstStreak}L`}
                    color="text-red-400"
                    sub="Consecutive losses"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatChip
                    label="Max Drawdown"
                    value={analytics.maxDD > 0 ? `-${formatCurrency(analytics.maxDD)}` : "—"}
                    color="text-red-400"
                    sub="From peak (realized)"
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

                {/* Win rate donut + Avg win/loss bars */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Win Rate Donut */}
                  <WinRateDonut
                    winRate={analytics.winRate}
                    wins={rows.filter((r) => r.trade.realizedPnL > 0).length}
                    losses={rows.filter((r) => r.trade.realizedPnL < 0).length}
                    total={rows.length}
                  />

                  {/* Avg Win vs Avg Loss bar */}
                  <AvgWinLossBar
                    avgWin={analytics.avgWin}
                    avgLoss={analytics.avgLoss}
                  />
                </div>

                {/* Trade count by ticker */}
                {analytics.tickerStats.length > 0 && (
                  <TickerBreakdown tickerStats={analytics.tickerStats} />
                )}

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

                {/* Tag distribution */}
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="mb-3 text-xs font-semibold">Tag Distribution</p>
                  <TagStatsChart tradeTags={tradeTags} />
                </div>

                {/* Equity Curve */}
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                    <BarChart3 className="h-3.5 w-3.5 text-primary" />
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

        {/* Notes */}
        {pageTab === "notes" && (
          <JournalNotes />
        )}

        {/* Insights */}
        {pageTab === "insights" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                Performance Insights
              </div>
              <PerformanceInsights rows={rows} />
            </div>

            {/* Tag distribution */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                Tag Distribution
              </div>
              <TagStatsChart tradeTags={tradeTags} />
            </div>
          </div>
        )}

        {/* Weekly Review */}
        {pageTab === "review" && (
          <WeeklyReview />
        )}

        {/* AI Analysis */}
        {pageTab === "ai" && (
          <JournalAIAnalysis rows={rows} />
        )}

      </div>
    </div>
  );
}

// ── Win Rate Donut ────────────────────────────────────────────────────────────

function WinRateDonut({
  winRate,
  wins,
  losses,
  total,
}: {
  winRate: number;
  wins: number;
  losses: number;
  total: number;
}) {
  const r = 36;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  const winArc = (winRate / 100) * circumference;
  const lossArc = circumference - winArc;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold">Win Rate</p>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="h-20 w-20 shrink-0 -rotate-90">
          {/* Background ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={10}
          />
          {/* Loss arc */}
          {lossArc > 0 && (
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(239,68,68,0.5)"
              strokeWidth={10}
              strokeDasharray={`${lossArc} ${winArc}`}
              strokeDashoffset={-winArc}
              strokeLinecap="round"
            />
          )}
          {/* Win arc */}
          {winArc > 0 && (
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#22c55e"
              strokeWidth={10}
              strokeDasharray={`${winArc} ${lossArc}`}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className="space-y-2 text-xs">
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {winRate.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground">Win rate</p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-[10px] text-muted-foreground">
                {wins} win{wins !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-[10px] text-muted-foreground">
                {losses} loss{losses !== 1 ? "es" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="text-[10px] text-muted-foreground">
                {total} total
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Avg Win vs Avg Loss Bar ───────────────────────────────────────────────────

function AvgWinLossBar({
  avgWin,
  avgLoss,
}: {
  avgWin: number;
  avgLoss: number;
}) {
  const absWin = Math.abs(avgWin);
  const absLoss = Math.abs(avgLoss);
  const max = Math.max(absWin, absLoss, 1);
  const winPct = (absWin / max) * 100;
  const lossPct = (absLoss / max) * 100;
  const rr = absLoss > 0 ? (absWin / absLoss).toFixed(2) : "∞";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold">Avg Win vs Avg Loss</p>
      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="text-green-400 font-medium">Avg Win</span>
            <span className="font-semibold tabular-nums text-green-400">
              {avgWin > 0 ? formatCurrency(avgWin) : "—"}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/30">
            <div
              className="h-2 rounded-full bg-green-500/70 transition-all"
              style={{ width: `${winPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="text-red-400 font-medium">Avg Loss</span>
            <span className="font-semibold tabular-nums text-red-400">
              {avgLoss < 0 ? formatCurrency(avgLoss) : "—"}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/30">
            <div
              className="h-2 rounded-full bg-red-500/70 transition-all"
              style={{ width: `${lossPct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border/40 pt-2">
          <span className="text-[10px] text-muted-foreground">
            Reward / Risk ratio
          </span>
          <span
            className={cn(
              "text-xs font-bold tabular-nums",
              parseFloat(rr) >= 1 || rr === "∞"
                ? "text-green-400"
                : "text-red-400",
            )}
          >
            {rr}:1
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Ticker breakdown ──────────────────────────────────────────────────────────

interface TickerStat {
  ticker: string;
  wins: number;
  losses: number;
  pnl: number;
  total: number;
}

function TickerBreakdown({ tickerStats }: { tickerStats: TickerStat[] }) {
  const maxTotal = Math.max(...tickerStats.map((t) => t.total), 1);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold">Trades by Ticker</p>
      <div className="space-y-2">
        {tickerStats.slice(0, 8).map((stat) => {
          const winPct = stat.total > 0 ? (stat.wins / stat.total) * 100 : 0;
          const barWidth = (stat.total / maxTotal) * 100;

          return (
            <div key={stat.ticker} className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-right text-[11px] font-semibold text-foreground/80">
                {stat.ticker}
              </span>
              <div className="flex h-5 flex-1 overflow-hidden rounded-sm bg-muted/20">
                {/* Win portion */}
                <div
                  className="h-full bg-green-500/50 transition-all"
                  style={{ width: `${(winPct / 100) * barWidth}%` }}
                />
                {/* Loss portion */}
                <div
                  className="h-full bg-red-500/40 transition-all"
                  style={{ width: `${((100 - winPct) / 100) * barWidth}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground shrink-0">
                <span className="w-6 text-right tabular-nums">{stat.total}</span>
                <span
                  className={cn(
                    "w-16 text-right tabular-nums font-medium",
                    stat.pnl > 0 ? "text-green-400" : stat.pnl < 0 ? "text-red-400" : "",
                  )}
                >
                  {stat.pnl > 0 ? "+" : ""}{formatCurrency(stat.pnl)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[9px] text-muted-foreground/60">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-green-500/50" />
          Wins
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-red-500/40" />
          Losses
        </div>
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
