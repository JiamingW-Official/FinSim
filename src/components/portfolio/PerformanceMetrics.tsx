"use client";

import { useTradingStore } from "@/stores/trading-store";
import { useGameStore } from "@/stores/game-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border/20 bg-card p-3">
      <div className="text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 text-lg font-medium tabular-nums", color)}>
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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      <MetricCard
        label="Total Return"
        value={`${formatCurrency(totalReturn)} (${formatPercent(totalReturnPercent)})`}
        color={totalReturn >= 0 ? "text-profit" : "text-loss"}
      />
      <MetricCard
        label="Win Rate"
        value={`${winRate.toFixed(1)}%`}
        color={winRate >= 50 ? "text-profit" : "text-loss"}
      />
      <MetricCard label="Total Trades" value={String(stats.totalTrades)} />
      <MetricCard
        label="Avg Win"
        value={avgWin > 0 ? formatCurrency(avgWin) : "—"}
        color="text-profit"
      />
      <MetricCard
        label="Avg Loss"
        value={avgLoss < 0 ? formatCurrency(avgLoss) : "—"}
        color="text-loss"
      />
      <MetricCard
        label="Profit Factor"
        value={profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}
        color={profitFactor >= 1 ? "text-profit" : "text-loss"}
      />
      <MetricCard
        label="Max Drawdown"
        value={`-${maxDrawdown.toFixed(2)}%`}
        color="text-loss"
      />
      <MetricCard
        label="Total Fees"
        value={formatCurrency(totalFees)}
        color="text-muted-foreground"
      />
    </div>
  );
}
