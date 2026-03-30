"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { useGameStore } from "@/stores/game-store";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { INITIAL_CAPITAL } from "@/types/trading";

interface StatChipProps {
  label: string;
  value: string;
  subValue?: string;
  valueClass?: string;
}

function StatChip({ label, value, subValue, valueClass }: StatChipProps) {
  return (
    <div className="flex flex-col gap-0 px-3 py-1.5 border-r border-border last:border-r-0">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-sm font-semibold tabular-nums font-mono", valueClass)}>
          {value}
        </span>
        {subValue && (
          <span className={cn("text-[11px] tabular-nums font-mono", valueClass)}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

export function PortfolioSummaryBar() {
  const cash = useTradingStore((s) => s.cash);
  const positions = useTradingStore((s) => s.positions);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const gameStats = useGameStore((s) => s.stats);

  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPct = (totalPnL / INITIAL_CAPITAL) * 100;

  const openPositionCount = positions.length;

  // Day's P&L: sum realizedPnL from closed trades today (by wall-clock date)
  const dayPnL = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const startMs = todayStart.getTime();
    return tradeHistory
      .filter((t) => t.timestamp >= startMs && t.realizedPnL !== 0)
      .reduce((sum, t) => sum + t.realizedPnL, 0);
  }, [tradeHistory]);

  // Win rate from game stats
  const winRate =
    gameStats.totalTrades > 0
      ? (gameStats.profitableTrades / gameStats.totalTrades) * 100
      : 0;

  const portfolioColor =
    totalPnL > 0
      ? "text-green-500"
      : totalPnL < 0
        ? "text-red-500"
        : "text-foreground";

  const pnlColor =
    totalPnL >= 0 ? "text-green-500" : "text-red-500";

  const dayPnlColor =
    dayPnL >= 0 ? "text-green-500" : "text-red-500";

  return (
    <div className="flex flex-wrap items-stretch border-b border-border bg-card/80 overflow-x-auto shrink-0">
      <StatChip
        label="Portfolio Value"
        value={formatCurrency(portfolioValue)}
        valueClass={portfolioColor}
      />
      <StatChip
        label="Total P&L"
        value={formatCurrency(totalPnL)}
        subValue={`(${totalPnL >= 0 ? "+" : ""}${formatPercent(totalPnLPct)})`}
        valueClass={pnlColor}
      />
      <StatChip
        label="Open Positions"
        value={String(openPositionCount)}
        valueClass={openPositionCount > 0 ? "text-foreground" : "text-muted-foreground"}
      />
      <StatChip
        label="Cash Available"
        value={formatCurrency(cash)}
        valueClass="text-foreground"
      />
      <StatChip
        label="Day's P&L"
        value={formatCurrency(dayPnL)}
        valueClass={dayPnlColor}
      />
      <StatChip
        label="Win Rate"
        value={`${winRate.toFixed(0)}%`}
        subValue={
          gameStats.totalTrades > 0
            ? `${gameStats.profitableTrades}/${gameStats.totalTrades}`
            : undefined
        }
        valueClass={
          winRate >= 60
            ? "text-green-500"
            : winRate >= 40
              ? "text-foreground"
              : "text-red-500"
        }
      />
    </div>
  );
}
