"use client";

import { useMemo } from "react";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { cn } from "@/lib/utils";
import { TrendingUp, Brain, AlertTriangle } from "lucide-react";

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
 B: "text-primary",
 C: "text-amber-400",
 D: "text-orange-400",
 F: "text-red-400",
};

const GRADE_BG: Record<Grade, string> = {
 A: "bg-emerald-500/5 border-emerald-500/20",
 B: "bg-primary/10 border-border",
 C: "bg-amber-500/10 border-amber-500/20",
 D: "bg-orange-500/10 border-orange-500/20",
 F: "bg-red-500/5 border-red-500/20",
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

// Derive overall performance grade from win rate + avg R:R proxy
function computePerformanceGrade(
 winRate: number,
 avgPnL: number,
 largestWin: number,
 largestLoss: number,
): Grade {
 // Win rate score (0-60)
 const wrScore = winRate * 60;
 // R:R proxy: largestWin / |largestLoss| (0-40)
 const rrRatio =
 largestLoss < 0 && largestWin > 0
 ? largestWin / Math.abs(largestLoss)
 : largestWin > 0
 ? 2.0
 : 0;
 const rrScore = Math.min(rrRatio / 3, 1) * 40;
 // avgPnL modifier
 const pnlMod =
 avgPnL > 500 ? 5 : avgPnL > 100 ? 3 : avgPnL > 0 ? 1 : avgPnL > -100 ? -2 : -5;
 const total = Math.min(100, Math.max(0, wrScore + rrScore + pnlMod));
 return scoreToGrade(total);
}

// Detect trading DNA traits from stats
function detectTradingDNA(
 winRate: number,
 shortRatio: number,
 limitRatio: number,
 diversification: number,
 consecutiveWins: number,
 avgPnL: number,
 optionsRatio: number,
): string[] {
 const traits: Array<[string, number]> = [];

 if (limitRatio > 0.5) traits.push(["Patient Trader", limitRatio * 100]);
 if (shortRatio > 0.3) traits.push(["Contrarian", shortRatio * 100]);
 if (diversification >= 5) traits.push(["Diversifier", diversification * 10]);
 if (consecutiveWins >= 5) traits.push(["Momentum Follower", consecutiveWins * 10]);
 if (winRate >= 0.6) traits.push(["High-Accuracy Trader", winRate * 100]);
 if (avgPnL > 200) traits.push(["Big Move Hunter", avgPnL / 10]);
 if (optionsRatio > 0.3) traits.push(["Options Specialist", optionsRatio * 100]);
 if (winRate < 0.4 && avgPnL > 0) traits.push(["Risk-Taker", 60]);
 if (winRate >= 0.5 && limitRatio >= 0.4) traits.push(["Risk-Conscious", 70]);
 if (diversification < 3 && winRate >= 0.55) traits.push(["Focused Trader", 65]);

 // Sort by score descending, return top 3 names
 return traits
 .sort((a, b) => b[1] - a[1])
 .slice(0, 3)
 .map(([name]) => name);
}

// Detect improvement areas from weakest metric scores
function detectImprovementAreas(metrics: Metric[]): string[] {
 const SUGGESTIONS: Record<string, string> = {
 Consistency: "Build a daily trading habit to compound gains over time.",
 "Risk Management": "Reduce position sizes and always define your max loss before entry.",
 Timing: "Use limit orders and wait for confirmation before entering.",
 Diversification: "Explore more tickers to reduce single-stock concentration risk.",
 Discipline: "Switch to limit orders — patience rewards better entries.",
 Profitability: "Review your losing trades for common patterns to eliminate.",
 };

 return metrics
 .sort((a, b) => a.score - b.score)
 .slice(0, 2)
 .map((m) => SUGGESTIONS[m.label] ?? `Improve your ${m.label} score.`);
}

export function ReportCard() {
 const stats = useGameStore((s) => s.stats);
 const tradeHistory = useTradingStore((s) => s.tradeHistory);

 const metrics: Metric[] = useMemo(() => {
 const sells = tradeHistory.filter((t) => t.side === "sell");
 const totalTrades = stats.totalTrades;
 const winRate = totalTrades > 0 ? stats.profitableTrades / totalTrades : 0;

 // 1. Consistency — based on daily streak vs total trades
 const consistencyRaw = Math.min(
 stats.dailyStreak * 15 + (totalTrades > 0 ? Math.min(totalTrades * 2, 40) : 0),
 100,
 );

 // 2. Risk Management — ratio of largest loss to largest win
 const riskRaw = (() => {
 if (totalTrades === 0) return 30;
 const lossRatio =
 stats.largestLoss < 0 && stats.largestWin > 0
 ? Math.abs(stats.largestLoss) / stats.largestWin
 : 0;
 return lossRatio < 0.5 ? 90 : lossRatio < 1 ? 70 : lossRatio < 2 ? 50 : 25;
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
 const pnlBonus =
 stats.totalPnL > 5000 ? 20 : stats.totalPnL > 1000 ? 10 : stats.totalPnL > 0 ? 5 : 0;
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

 // Performance Grade (win rate + R:R)
 const performanceGrade: Grade = useMemo(() => {
 const sells = tradeHistory.filter((t) => t.side === "sell");
 const totalTrades = stats.totalTrades;
 const winRate = totalTrades > 0 ? stats.profitableTrades / totalTrades : 0;
 const avgPnL =
 sells.length > 0
 ? sells.reduce((s, t) => s + t.realizedPnL, 0) / sells.length
 : 0;
 return computePerformanceGrade(
 winRate,
 avgPnL,
 stats.largestWin,
 stats.largestLoss,
 );
 }, [stats, tradeHistory]);

 // Trading DNA
 const tradingDNA: string[] = useMemo(() => {
 const totalTrades = stats.totalTrades;
 const winRate = totalTrades > 0 ? stats.profitableTrades / totalTrades : 0;
 const shortRatio = totalTrades > 0 ? stats.shortTradesCount / totalTrades : 0;
 const limitRatio = totalTrades > 0 ? stats.limitOrdersUsed / totalTrades : 0;
 const optionsRatio =
 totalTrades + stats.optionsTradesCount > 0
 ? stats.optionsTradesCount / (totalTrades + stats.optionsTradesCount)
 : 0;
 const sells = tradeHistory.filter((t) => t.side === "sell");
 const avgPnL =
 sells.length > 0
 ? sells.reduce((s, t) => s + t.realizedPnL, 0) / sells.length
 : 0;
 return detectTradingDNA(
 winRate,
 shortRatio,
 limitRatio,
 stats.uniqueTickersTraded.length,
 stats.consecutiveWins,
 avgPnL,
 optionsRatio,
 );
 }, [stats, tradeHistory]);

 // Improvement Areas
 const improvementAreas: string[] = useMemo(
 () => detectImprovementAreas(metrics),
 [metrics],
 );

 return (
 <div className="space-y-4">
 {/* Row: Overall Grade + Performance Grade */}
 <div className="grid grid-cols-2 gap-2">
 <div className={cn("flex items-center justify-between rounded-md border p-3", GRADE_BG[overallGrade])}>
 <div>
 <p className="text-xs font-semibold text-muted-foreground">
 Overall Grade
 </p>
 <p className="text-[11px] text-muted-foreground mt-0.5">
 {stats.totalTrades} trades, 6 dimensions
 </p>
 </div>
 <span className={cn("text-xl font-semibold tabular-nums", GRADE_COLOR[overallGrade])}>
 {overallGrade}
 </span>
 </div>

 <div className={cn("flex items-center justify-between rounded-md border p-3", GRADE_BG[performanceGrade])}>
 <div>
 <p className="text-xs font-semibold text-muted-foreground">
 Performance Grade
 </p>
 <p className="text-[11px] text-muted-foreground mt-0.5">
 Win rate + R:R ratio
 </p>
 </div>
 <span className={cn("text-xl font-semibold tabular-nums", GRADE_COLOR[performanceGrade])}>
 {performanceGrade}
 </span>
 </div>
 </div>

 {/* Trading DNA */}
 {tradingDNA.length > 0 && (
 <div className="rounded-md border border-border bg-card/50 p-3 space-y-2">
 <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
 <Brain className="h-3.5 w-3.5 text-primary" />
 Trading DNA
 </div>
 <div className="flex flex-wrap gap-1.5">
 {tradingDNA.map((trait) => (
 <span
 key={trait}
 className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
 >
 {trait}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* 6-metric grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {metrics.map((m) => (
 <div
 key={m.label}
 className="rounded-md border border-border bg-card/50 p-3 space-y-2"
 >
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-semibold">{m.label}</span>
 <span className={cn("text-lg font-semibold", GRADE_COLOR[m.grade])}>{m.grade}</span>
 </div>
 {/* Score bar */}
 <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
 <div
 className={cn("h-full rounded-full transition-colors", {
 "bg-emerald-500/70": m.grade === "A",
 "bg-primary/70": m.grade === "B",
 "bg-amber-500/70": m.grade === "C",
 "bg-orange-500/70": m.grade === "D",
 "bg-red-500/70": m.grade === "F",
 })}
 style={{ width: `${m.score}%` }}
 />
 </div>
 <p className="text-[11px] leading-relaxed text-muted-foreground">{m.comment}</p>
 </div>
 ))}
 </div>

 {/* Improvement Areas */}
 {improvementAreas.length > 0 && (
 <div className="rounded-md border border-border bg-card/50 p-3 space-y-2">
 <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
 <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
 Improvement Areas
 </div>
 <div className="space-y-2">
 {improvementAreas.map((area, i) => (
 <div key={i} className="flex items-start gap-2">
 <TrendingUp className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
 <p className="text-xs leading-snug text-muted-foreground">{area}</p>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}
