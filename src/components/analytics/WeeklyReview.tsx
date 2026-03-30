"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
 TrendingUp,
 TrendingDown,
 Star,
 AlertTriangle,
 BarChart2,
 Telescope,
 CheckCircle2,
 Target,
 Flame,
 BookOpen,
 Zap,
} from "lucide-react";
import { useTradingStore } from "@/stores/trading-store";
import { useGameStore } from "@/stores/game-store";
import { useLearnStore } from "@/stores/learn-store";
import type { TradeRecord } from "@/types/trading";
import { formatCurrency, cn } from "@/lib/utils";

// ── Date helpers ─────────────────────────────────────────────────────────────

/** Get the Monday–Friday week containing `date` as [start, end] in ms. */
function getWeekWindow(date: Date): { start: Date; end: Date; label: string } {
 const d = new Date(date);
 // getDay(): 0=Sun, 1=Mon
 const dayOfWeek = d.getDay();
 const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
 const mon = new Date(d);
 mon.setDate(d.getDate() + diffToMon);
 mon.setHours(0, 0, 0, 0);

 const fri = new Date(mon);
 fri.setDate(mon.getDate() + 4);
 fri.setHours(23, 59, 59, 999);

 const fmt = (dt: Date) =>
 dt.toLocaleDateString("en-US", { month: "long", day: "numeric" });
 const fmtYear = (dt: Date) =>
 dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

 const label =
 mon.getFullYear() === fri.getFullYear()
 ? `${fmt(mon)} – ${fmtYear(fri)}`
 : `${fmtYear(mon)} – ${fmtYear(fri)}`;

 return { start: mon, end: fri, label };
}

// ── Grade helper ──────────────────────────────────────────────────────────────

function gradeForWinRate(
 winRate: number,
 totalPnL: number,
 totalTrades: number,
): { grade: string; color: string } {
 if (totalTrades === 0) return { grade: "—", color: "text-muted-foreground" };
 if (winRate >= 70 && totalPnL > 0) return { grade: "A", color: "text-emerald-400" };
 if (winRate >= 55 && totalPnL >= 0) return { grade: "B", color: "text-emerald-400" };
 if (winRate >= 45 || totalPnL > 0) return { grade: "C", color: "text-amber-400" };
 if (winRate >= 35) return { grade: "D", color: "text-orange-400" };
 return { grade: "F", color: "text-red-400" };
}

// ── Weekly trade filter ───────────────────────────────────────────────────────

function filterWeekTrades(
 trades: TradeRecord[],
 start: Date,
 end: Date,
): TradeRecord[] {
 return trades.filter((t) => t.timestamp >= start.getTime() && t.timestamp <= end.getTime());
}

// ── Closed trade metrics ──────────────────────────────────────────────────────

function computeWeekMetrics(trades: TradeRecord[]) {
 const closed = trades.filter((t) => t.realizedPnL !== 0);
 const totalTrades = closed.length;
 const wins = closed.filter((t) => t.realizedPnL > 0);
 const losses = closed.filter((t) => t.realizedPnL < 0);
 const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
 const totalPnL = closed.reduce((s, t) => s + t.realizedPnL, 0);

 // Avg R:R approximation (ratio of avg win to avg loss magnitude)
 const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.realizedPnL, 0) / wins.length : 0;
 const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.realizedPnL, 0) / losses.length) : 0;
 const avgRR = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

 // Best / worst trade by % gain
 let bestTrade: TradeRecord | null = null;
 let worstTrade: TradeRecord | null = null;
 let bestPct = -Infinity;
 let worstPct = Infinity;

 for (const t of closed) {
 const entryValue = t.price * t.quantity;
 const pct = entryValue > 0 ? (t.realizedPnL / entryValue) * 100 : 0;
 if (pct > bestPct) { bestPct = pct; bestTrade = t; }
 if (pct < worstPct) { worstPct = pct; worstTrade = t; }
 }

 // Most traded ticker by count
 const tickerCount: Record<string, number> = {};
 for (const t of trades) {
 tickerCount[t.ticker] = (tickerCount[t.ticker] ?? 0) + 1;
 }
 let mostTradedTicker: string | null = null;
 let mostTradedCount = 0;
 for (const [tk, cnt] of Object.entries(tickerCount)) {
 if (cnt > mostTradedCount) { mostTradedCount = cnt; mostTradedTicker = tk; }
 }

 return {
 totalTrades,
 wins: wins.length,
 losses: losses.length,
 winRate,
 totalPnL,
 avgRR,
 bestTrade,
 worstTrade,
 bestPct: bestTrade ? bestPct : 0,
 worstPct: worstTrade ? worstPct : 0,
 mostTradedTicker,
 mostTradedCount,
 };
}

// ── Insight generation ────────────────────────────────────────────────────────

interface WeekInsights {
 wentWell: string;
 toImprove: string;
 strategyPerf: string;
 outlook: string;
 actionItems: string[];
 focusCTA: string;
}

function generateInsights(
 metrics: ReturnType<typeof computeWeekMetrics>,
 prevMetrics: ReturnType<typeof computeWeekMetrics>,
 lessonsThisWeek: number,
): WeekInsights {
 const { winRate, totalPnL, totalTrades, bestTrade, worstTrade, avgRR, mostTradedTicker } = metrics;

 // What went well
 let wentWell: string;
 if (totalTrades === 0) {
 wentWell = "No closed trades this week — a clean slate for next week.";
 } else if (winRate >= 65 && totalPnL > 0) {
 wentWell = `Strong execution with a ${winRate.toFixed(0)}% win rate and positive P&L. ${
 bestTrade ? `Your best trade on ${bestTrade.ticker} (+${metrics.bestPct.toFixed(1)}%) showed excellent entry timing.` : "Keep it up."
 }`;
 } else if (totalPnL > 0) {
 wentWell = `Ended the week in the green (${formatCurrency(totalPnL)}). ${
 bestTrade ? `Standout trade: ${bestTrade.ticker} (+${metrics.bestPct.toFixed(1)}%).` : "Consistency is building."
 }`;
 } else if (winRate >= 50) {
 wentWell = `Win rate above 50% despite the week's challenges. ${
 lessonsThisWeek > 0 ? `Completing ${lessonsThisWeek} lesson${lessonsThisWeek > 1 ? "s" : ""} shows strong dedication to improving.` : "Focus on increasing position sizing on higher-conviction setups."
 }`;
 } else {
 wentWell = lessonsThisWeek > 0
 ? `Completed ${lessonsThisWeek} lesson${lessonsThisWeek > 1 ? "s" : ""} this week — learning when markets are difficult compounds over time.`
 : "Staying engaged and reviewing trades shows the discipline of a developing trader.";
 }

 // Areas to improve
 let toImprove: string;
 if (totalTrades === 0) {
 toImprove = "Try to take at least 3 paper trades next week to build pattern recognition.";
 } else if (winRate < 40 && metrics.losses > metrics.wins) {
 toImprove = `Win rate of ${winRate.toFixed(0)}% needs attention. Review your ${worstTrade ? worstTrade.ticker : "losing"} trades — are you entering too early, or holding losers too long?`;
 } else if (avgRR < 1 && isFinite(avgRR)) {
 toImprove = `Avg R:R of ${avgRR.toFixed(2)} is below 1:1 — winners are smaller than losers. Consider widening take-profit targets or tightening stop-losses.`;
 } else if (metrics.worstPct < -10) {
 toImprove = `Large losing trades (${metrics.worstPct.toFixed(1)}% on ${worstTrade?.ticker ?? "a position"}) suggest stop-loss discipline needs tightening. Cap max loss at 5–7% per trade.`;
 } else {
 toImprove = prevMetrics.totalTrades > 0 && metrics.totalTrades < prevMetrics.totalTrades
 ? "Trade frequency dropped vs last week — consider reviewing 1–2 setups daily to maintain pattern recognition."
 : "Keep refining entry precision — aim to enter within 0.5% of your planned level for better R:R.";
 }

 // Strategy performance
 let strategyPerf: string;
 if (totalTrades === 0) {
 strategyPerf = "No trades to evaluate this week. AlphaBot recommends paper-trading 2–3 setups to test your read on current market conditions.";
 } else if (mostTradedTicker) {
 const tickerPnL = metrics.totalPnL; // simplified attribution
 if (winRate >= 60 && totalPnL > 0) {
 strategyPerf = `Momentum setups on ${mostTradedTicker} (your most traded ticker) performed well. The confluence of technical signals with price action is working — continue with trend-following in the current regime.`;
 } else if (totalPnL < 0) {
 strategyPerf = `Trades on ${mostTradedTicker} didn't produce the expected outcome this week. Consider whether the setup conditions (trend + volume confirmation) were fully met before entry.`;
 } else {
 strategyPerf = `Mixed results on ${mostTradedTicker} setups. The market may be transitioning regimes — watch for ADX > 25 before committing to directional trades.`;
 }
 } else {
 strategyPerf = "Diversified across multiple tickers. Consider focusing on 2–3 tickers to build deeper pattern recognition for each.";
 }

 // Next week outlook
 let outlook: string;
 if (totalPnL > 200) {
 outlook = "Positive momentum heading into next week. Stay disciplined — don't over-trade trying to replicate gains. Let setups come to you.";
 } else if (totalPnL < -200) {
 outlook = "Rebuilding week ahead. Lower position sizes by 50% and focus on high-conviction setups only. One good trade outweighs five mediocre ones.";
 } else {
 outlook = lessonsThisWeek > 0
 ? "Balanced week with learning progress. Next week, apply concepts from completed lessons directly to your trade entries — theory and practice compounding together."
 : "Next week, focus on quality over quantity. Aim for 3–5 high-conviction trades with pre-planned entries and exits rather than reactive trading.";
 }

 // Action items
 const actionItems: string[] = [];

 if (winRate < 50 && totalTrades >= 3) {
 actionItems.push(`Review your 3 biggest losing trades and identify a common entry mistake.`);
 } else if (totalTrades > 0) {
 actionItems.push(`Document what made your best trade (${bestTrade?.ticker ?? "top setup"} at +${metrics.bestPct.toFixed(1)}%) work — replicate it.`);
 }

 if (avgRR < 1.5 && isFinite(avgRR) && totalTrades > 0) {
 actionItems.push("Set take-profit targets at 1.5–2× your stop distance before entering next week's trades.");
 } else {
 actionItems.push("Run AlphaBot's Trade Setup analysis on your 3 watchlist tickers before Monday open.");
 }

 if (lessonsThisWeek === 0) {
 actionItems.push("Complete at least 2 lessons in the Learn section to reinforce technical concepts.");
 } else {
 actionItems.push(`Keep up the ${lessonsThisWeek}-lesson streak — aim for 3+ lessons next week to hit a learning milestone.`);
 }

 // Focus CTA
 let focusCTA: string;
 if (winRate < 40 && totalTrades >= 3) {
 focusCTA = "Refine entry criteria — only trade when 3+ signals align";
 } else if (avgRR < 1 && isFinite(avgRR) && totalTrades > 0) {
 focusCTA = "Improve risk-to-reward ratio — target at least 1.5:1 per trade";
 } else if (lessonsThisWeek === 0) {
 focusCTA = "Start a daily learning habit — 1 lesson per day builds compounding knowledge";
 } else {
 focusCTA = "Scale into winning positions — size up on high-conviction setups";
 }

 return { wentWell, toImprove, strategyPerf, outlook, actionItems, focusCTA };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricRow({
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
 <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
 <span className="text-[11px] text-muted-foreground">{label}</span>
 <div className="text-right">
 <span className={cn("text-[11px] font-semibold tabular-nums", color)}>{value}</span>
 {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
 </div>
 </div>
 );
}

function InsightSection({
 icon,
 title,
 text,
 iconColor,
}: {
 icon: React.ReactNode;
 title: string;
 text: string;
 iconColor: string;
}) {
 return (
 <div className="rounded-md border border-border bg-card/40 p-3">
 <div className={cn("mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold", iconColor)}>
 {icon}
 {title}
 </div>
 <p className="text-[11px] text-muted-foreground leading-relaxed">{text}</p>
 </div>
 );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function WeeklyReview() {
 const tradeHistory = useTradingStore((s) => s.tradeHistory);
 const xp = useGameStore((s) => s.xp);
 const loginStreak = useGameStore((s) => s.loginStreak);
 const completedLessons = useLearnStore((s) => s.completedLessons);
 const learningStreak = useLearnStore((s) => s.learningStreak);

 const now = new Date("2026-03-27"); // current sim date
 const thisWeek = useMemo(() => getWeekWindow(now), []);
 const prevWeekEnd = new Date(thisWeek.start.getTime() - 1);
 const prevWeek = useMemo(() => getWeekWindow(prevWeekEnd), []);

 const thisWeekTrades = useMemo(
 () => filterWeekTrades(tradeHistory, thisWeek.start, thisWeek.end),
 [tradeHistory, thisWeek],
 );
 const prevWeekTrades = useMemo(
 () => filterWeekTrades(tradeHistory, prevWeek.start, prevWeek.end),
 [tradeHistory, prevWeek],
 );

 const metrics = useMemo(() => computeWeekMetrics(thisWeekTrades), [thisWeekTrades]);
 const prevMetrics = useMemo(() => computeWeekMetrics(prevWeekTrades), [prevWeekTrades]);

 // XP this week: estimate from XP delta vs last week start
 // We don't have a timestamp on XP, so we use a stable heuristic: show total XP
 // and learning stats for this week from the learn store
 const lessonsThisWeek = useMemo(() => {
 // We don't track lesson completion timestamps in the store, so use total as a proxy
 // Show completed lessons count (this week approximated as recent completions)
 return completedLessons.length;
 }, [completedLessons]);

 const { grade, color: gradeColor } = gradeForWinRate(
 metrics.winRate,
 metrics.totalPnL,
 metrics.totalTrades,
 );

 const pnlVsPrev = metrics.totalPnL - prevMetrics.totalPnL;

 const insights = useMemo(
 () => generateInsights(metrics, prevMetrics, lessonsThisWeek > 0 ? Math.min(lessonsThisWeek, 5) : 0),
 [metrics, prevMetrics, lessonsThisWeek],
 );

 return (
 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 className="space-y-3"
 >
 {/* ── Review Header ── */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="flex items-start justify-between gap-3">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <BarChart2 className="h-4 w-4 text-primary" />
 <h2 className="text-sm font-semibold">Weekly Review</h2>
 </div>
 <p className="text-[11px] text-muted-foreground">{thisWeek.label}</p>
 </div>

 {/* Overall grade */}
 <div className="flex flex-col items-center">
 <div
 className={cn(
 "flex h-12 w-12 items-center justify-center rounded-md border-2 font-semibold text-xl",
 grade === "A" ? "border-emerald-400/40 bg-emerald-400/10" :
 grade === "B" ? "border-teal-400/40 bg-teal-400/10" :
 grade === "C" ? "border-amber-400/40 bg-amber-400/10" :
 grade === "D" ? "border-orange-400/40 bg-orange-400/10" :
 grade === "F" ? "border-red-400/40 bg-red-400/10" :
 "border-border bg-card/60",
 gradeColor,
 )}
 >
 {grade}
 </div>
 <p className="mt-1 text-xs text-muted-foreground">Week Grade</p>
 </div>
 </div>

 {/* P&L vs previous week */}
 {metrics.totalTrades > 0 && (
 <div className="mt-3 flex items-center gap-3 rounded-md bg-card/60 px-3 py-2 border border-border">
 <div>
 <p className="text-xs text-muted-foreground">Week P&amp;L</p>
 <p className={cn("text-sm font-semibold tabular-nums", metrics.totalPnL >= 0 ? "text-emerald-400" : "text-red-400")}>
 {metrics.totalPnL >= 0 ? "+" : ""}{formatCurrency(metrics.totalPnL)}
 </p>
 </div>
 {prevMetrics.totalTrades > 0 && (
 <>
 <div className="h-8 w-px bg-border/40" />
 <div>
 <p className="text-xs text-muted-foreground">vs Last Week</p>
 <div className="flex items-center gap-1">
 {pnlVsPrev >= 0
 ? <TrendingUp className="h-3 w-3 text-emerald-400" />
 : <TrendingDown className="h-3 w-3 text-red-400" />
 }
 <span className={cn("text-[11px] font-semibold tabular-nums", pnlVsPrev >= 0 ? "text-emerald-400" : "text-red-400")}>
 {pnlVsPrev >= 0 ? "+" : ""}{formatCurrency(pnlVsPrev)}
 </span>
 </div>
 </div>
 <div className="h-8 w-px bg-border/40" />
 <div>
 <p className="text-xs text-muted-foreground">Last Week</p>
 <p className={cn("text-[11px] font-medium tabular-nums", prevMetrics.totalPnL >= 0 ? "text-emerald-400/70" : "text-red-400/70")}>
 {prevMetrics.totalPnL >= 0 ? "+" : ""}{formatCurrency(prevMetrics.totalPnL)}
 </p>
 </div>
 </>
 )}
 </div>
 )}
 </div>

 {/* ── Trade Breakdown ── */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
 <Target className="h-3.5 w-3.5 text-muted-foreground" />
 Trade Breakdown
 </div>

 {metrics.totalTrades === 0 ? (
 <p className="text-[11px] text-muted-foreground italic text-center py-3">
 No closed trades this week yet.
 </p>
 ) : (
 <div className="space-y-0">
 <MetricRow
 label="Trades this week"
 value={String(metrics.totalTrades)}
 sub={`${metrics.wins}W / ${metrics.losses}L`}
 />
 <MetricRow
 label="Win Rate"
 value={`${metrics.winRate.toFixed(1)}%`}
 color={metrics.winRate >= 50 ? "text-emerald-400" : "text-red-400"}
 />
 <MetricRow
 label="Avg R:R"
 value={
 metrics.avgRR === Infinity ? "∞"
 : metrics.totalTrades === 0 ? "—"
 : `${metrics.avgRR.toFixed(2)}:1`
 }
 color={metrics.avgRR >= 1.5 ? "text-emerald-400" : metrics.avgRR >= 1 ? "text-amber-400" : "text-red-400"}
 />
 {metrics.bestTrade && (
 <MetricRow
 label="Best Trade"
 value={`+${metrics.bestPct.toFixed(2)}%`}
 color="text-emerald-400"
 sub={metrics.bestTrade.ticker}
 />
 )}
 {metrics.worstTrade && metrics.worstTrade.id !== metrics.bestTrade?.id && (
 <MetricRow
 label="Worst Trade"
 value={`${metrics.worstPct.toFixed(2)}%`}
 color="text-red-400"
 sub={metrics.worstTrade.ticker}
 />
 )}
 {metrics.mostTradedTicker && (
 <MetricRow
 label="Most Traded"
 value={metrics.mostTradedTicker}
 sub={`${metrics.mostTradedCount} orders`}
 />
 )}
 </div>
 )}
 </div>

 {/* ── AI-Generated Insights ── */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
 <Zap className="h-3.5 w-3.5 text-amber-400" />
 AlphaBot Insights
 </div>

 <div className="space-y-2">
 <InsightSection
 icon={<CheckCircle2 className="h-3 w-3" />}
 title="What went well"
 text={insights.wentWell}
 iconColor="text-emerald-400"
 />
 <InsightSection
 icon={<AlertTriangle className="h-3 w-3" />}
 title="Areas to improve"
 text={insights.toImprove}
 iconColor="text-amber-400"
 />
 <InsightSection
 icon={<BarChart2 className="h-3 w-3" />}
 title="Strategy performance"
 text={insights.strategyPerf}
 iconColor="text-primary"
 />
 <InsightSection
 icon={<Telescope className="h-3 w-3" />}
 title="Next week outlook"
 text={insights.outlook}
 iconColor="text-primary"
 />
 </div>
 </div>

 {/* ── Progress Metrics ── */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
 <Star className="h-3.5 w-3.5 text-amber-400" />
 Progress Metrics
 </div>

 <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
 <div className="rounded-md border border-border bg-card/60 p-2.5 text-center">
 <div className="flex items-center justify-center gap-1 mb-1">
 <Zap className="h-3 w-3 text-amber-400" />
 <span className="text-xs text-muted-foreground">Total pts</span>
 </div>
 <p className="text-sm font-semibold text-amber-400 tabular-nums">{xp.toLocaleString()}</p>
 </div>

 <div className="rounded-md border border-border bg-card/60 p-2.5 text-center">
 <div className="flex items-center justify-center gap-1 mb-1">
 <BookOpen className="h-3 w-3 text-primary" />
 <span className="text-xs text-muted-foreground">Lessons</span>
 </div>
 <p className="text-sm font-semibold text-primary tabular-nums">{completedLessons.length}</p>
 </div>

 <div className="rounded-md border border-border bg-card/60 p-2.5 text-center">
 <div className="flex items-center justify-center gap-1 mb-1">
 <Flame className="h-3 w-3 text-orange-400" />
 <span className="text-xs text-muted-foreground">Learn Streak</span>
 </div>
 <p className="text-sm font-semibold text-orange-400 tabular-nums">{learningStreak}d</p>
 </div>

 <div className="rounded-md border border-border bg-card/60 p-2.5 text-center">
 <div className="flex items-center justify-center gap-1 mb-1">
 <Flame className="h-3 w-3 text-red-400" />
 <span className="text-xs text-muted-foreground">Login Streak</span>
 </div>
 <p className="text-sm font-semibold text-red-400 tabular-nums">{loginStreak}d</p>
 </div>
 </div>
 </div>

 {/* ── Action Items ── */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
 <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
 Action Items for Next Week
 </div>

 <ol className="space-y-2">
 {insights.actionItems.map((item, i) => (
 <li key={i} className="flex items-start gap-2.5">
 <span className="flex-shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary mt-0.5">
 {i + 1}
 </span>
 <p className="text-[11px] text-muted-foreground leading-relaxed">{item}</p>
 </li>
 ))}
 </ol>

 {/* Focus CTA */}
 <div className="mt-4 rounded-md bg-primary/8 border border-primary/20 px-3 py-2.5">
 <p className="text-xs font-semibold text-primary mb-0.5">
 Focus next week
 </p>
 <p className="text-[12px] font-medium text-foreground">{insights.focusCTA}</p>
 </div>
 </div>
 </motion.div>
 );
}
