"use client";

import { useTradingStore } from "@/stores/trading-store";
import { useGameStore } from "@/stores/game-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2.5">
      <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35">
        {label}
      </div>
      <div className={cn("text-sm font-semibold tabular-nums", color)}>
        {value}
      </div>
    </div>
  );
}

export function PerformanceMetrics() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const equityHistory = useTradingStore((s) => s.equityHistory);
  const stats = useGameStore((s) => s.stats);

  const totalReturn = portfolioValue - INITIAL_CAPITAL;
  const totalReturnPercent = (totalReturn / INITIAL_CAPITAL) * 100;

  // Win rate
  const sellTrades = tradeHistory.filter((t) => t.side === "sell");
  const winningTrades = sellTrades.filter((t) => t.realizedPnL > 0);
  const losingTrades = sellTrades.filter((t) => t.realizedPnL < 0);
  const winRate = sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0;

  // Avg win / avg loss
  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((s, t) => s + t.realizedPnL, 0) / winningTrades.length
    : 0;
  const avgLoss = losingTrades.length > 0
    ? losingTrades.reduce((s, t) => s + t.realizedPnL, 0) / losingTrades.length
    : 0;

  // Profit factor
  const totalWins = winningTrades.reduce((s, t) => s + t.realizedPnL, 0);
  const totalLosses = Math.abs(losingTrades.reduce((s, t) => s + t.realizedPnL, 0));
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

  // Max drawdown from equity history
  let maxDrawdown = 0;
  let peak = INITIAL_CAPITAL;
  for (const snap of equityHistory) {
    if (snap.portfolioValue > peak) peak = snap.portfolioValue;
    const dd = ((peak - snap.portfolioValue) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  // Total fees
  const totalFees = tradeHistory.reduce((s, t) => s + (t.fees ?? 0), 0);

  return (
    <div className="grid grid-cols-3 gap-0 divide-x divide-border/15">
      <Metric
        label="Return"
        value={`${formatPercent(totalReturnPercent)}`}
        color={totalReturn >= 0 ? "text-profit" : "text-loss"}
      />
      <Metric
        label="Win Rate"
        value={`${winRate.toFixed(1)}%`}
        color={winRate >= 50 ? "text-profit" : "text-loss"}
      />
      <Metric
        label="Trades"
        value={String(stats.totalTrades)}
      />
      <Metric
        label="Avg Win"
        value={avgWin > 0 ? formatCurrency(avgWin) : "—"}
        color="text-profit"
      />
      <Metric
        label="Avg Loss"
        value={avgLoss < 0 ? formatCurrency(avgLoss) : "—"}
        color="text-loss"
      />
      <Metric
        label="Prof. Factor"
        value={profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}
        color={profitFactor >= 1 ? "text-profit" : "text-loss"}
      />
      <Metric
        label="Max DD"
        value={`-${maxDrawdown.toFixed(2)}%`}
        color="text-loss"
      />
      <Metric
        label="Fees"
        value={formatCurrency(totalFees)}
        color="text-muted-foreground"
      />
      <Metric
        label="P&amp;L"
        value={formatCurrency(totalReturn)}
        color={totalReturn >= 0 ? "text-profit" : "text-loss"}
      />
    </div>
  );
}
