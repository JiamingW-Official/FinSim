"use client";

import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency, cn } from "@/lib/utils";
import { Target, TrendingUp, Flame, DollarSign, BarChart3, Trophy } from "lucide-react";

export function CareerStats() {
  const stats = useGameStore((s) => s.stats);
  const achievements = useGameStore((s) => s.achievements);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);

  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const winRate =
    stats.totalTrades > 0
      ? ((stats.profitableTrades / stats.totalTrades) * 100).toFixed(1)
      : "0.0";

  const CARDS = [
    {
      icon: <BarChart3 className="h-3.5 w-3.5 text-blue-400" />,
      label: "Total Trades",
      value: stats.totalTrades.toString(),
    },
    {
      icon: <Target className="h-3.5 w-3.5 text-cyan-400" />,
      label: "Win Rate",
      value: `${winRate}%`,
      sub: `${stats.profitableTrades} profitable`,
    },
    {
      icon: <Flame className="h-3.5 w-3.5 text-orange-400" />,
      label: "Best Streak",
      value: `${stats.consecutiveWins}`,
      sub: "consecutive wins",
    },
    {
      icon: <DollarSign className="h-3.5 w-3.5 text-emerald-400" />,
      label: "Largest Win",
      value: formatCurrency(stats.largestWin),
      valueClass: "text-emerald-400",
    },
    {
      icon: <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />,
      label: "Total P&L",
      value: `${totalPnL >= 0 ? "+" : ""}${formatCurrency(totalPnL)}`,
      valueClass: totalPnL >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      icon: <Trophy className="h-3.5 w-3.5 text-amber-400" />,
      label: "Achievements",
      value: achievements.length.toString(),
      sub: "unlocked",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {CARDS.map((card) => (
        <div
          key={card.label}
          className="card-hover-glow rounded-xl border border-border bg-card/50 p-3"
        >
          <div className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            {card.icon}
            {card.label}
          </div>
          <p className={cn("text-sm font-black tabular-nums", card.valueClass)}>
            {card.value}
          </p>
          {card.sub && (
            <p className="text-[9px] text-muted-foreground">{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
