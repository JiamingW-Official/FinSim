"use client";

import { useTradingPreferencesStore } from "@/stores/trading-preferences-store";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart2 } from "lucide-react";

// Market-average slippage benchmark: 0.15% per market order (mid of our 0.10-0.30% range)
const MARKET_AVG_SLIPPAGE_PCT = 0.0015;

interface StatRowProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
}

function StatRow({ label, value, sub, positive, negative }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-right">
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            positive && "text-green-500",
            negative && "text-red-400",
            !positive && !negative && "text-foreground",
          )}
        >
          {value}
        </span>
        {sub && (
          <div className="text-[10px] text-muted-foreground/60 tabular-nums">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

export function ExecutionQuality() {
  const totalSlippage = useTradingPreferencesStore((s) => s.totalSlippagePaid);
  const totalCommission = useTradingPreferencesStore((s) => s.totalCommissionPaid);
  const totalTrades = useTradingPreferencesStore((s) => s.totalTradesTracked);
  const totalFillSavings = useTradingPreferencesStore((s) => s.totalFillSavings);
  const proMode = useTradingPreferencesStore((s) => s.proMode);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  if (totalTrades === 0) {
    return (
      <div className="flex h-24 flex-col items-center justify-center gap-1.5">
        <Activity className="h-5 w-5 text-muted-foreground/40" />
        <span className="text-xs font-medium text-muted-foreground">
          No execution data yet
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          Place market orders to see execution quality metrics
        </span>
      </div>
    );
  }

  // Average slippage per trade in dollar terms
  const avgSlippagePerTrade = totalTrades > 0 ? totalSlippage / totalTrades : 0;

  // Compute avg trade notional from trade history to derive slippage %
  const marketTrades = tradeHistory.filter((t) => t.slippage > 0);
  const avgNotional =
    marketTrades.length > 0
      ? marketTrades.reduce((sum, t) => sum + t.price * t.quantity, 0) /
        marketTrades.length
      : 0;

  const avgSlippagePct =
    avgNotional > 0 ? avgSlippagePerTrade / avgNotional : 0;

  const benchmarkSlippage = avgNotional * MARKET_AVG_SLIPPAGE_PCT;
  const vsMarket = benchmarkSlippage - avgSlippagePerTrade;
  const isBetter = vsMarket >= 0;
  const vsMarketPct =
    benchmarkSlippage > 0
      ? Math.abs(vsMarket / benchmarkSlippage) * 100
      : 0;

  // Total drag from slippage + commission as % of total notional traded
  const totalNotional = tradeHistory.reduce(
    (sum, t) => sum + t.price * t.quantity,
    0,
  );
  const totalDragPct =
    totalNotional > 0
      ? ((totalSlippage + totalCommission) / totalNotional) * 100
      : 0;

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Execution Quality Report
        </span>
      </div>

      {/* vs-market banner */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2",
          isBetter ? "bg-green-500/8 border border-green-500/20" : "bg-red-500/8 border border-red-500/20",
        )}
      >
        {isBetter ? (
          <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-400 shrink-0" />
        )}
        <div>
          <p className="text-xs font-medium">
            Your executions are{" "}
            <span className={isBetter ? "text-green-500" : "text-red-400"}>
              {vsMarketPct.toFixed(1)}%{" "}
              {isBetter ? "better" : "worse"}
            </span>{" "}
            than market average
          </p>
          <p className="text-[10px] text-muted-foreground">
            Benchmark: {(MARKET_AVG_SLIPPAGE_PCT * 100).toFixed(2)}% slippage per order
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="rounded-md bg-muted/40 px-3 py-1">
        <StatRow
          label="Total trades tracked"
          value={String(totalTrades)}
        />
        <StatRow
          label="Total slippage paid"
          value={formatCurrency(totalSlippage)}
          sub={`avg ${formatCurrency(avgSlippagePerTrade)} / trade`}
          negative={totalSlippage > 0}
        />
        <StatRow
          label="Avg slippage %"
          value={`${(avgSlippagePct * 100).toFixed(3)}%`}
          sub={`market avg ${(MARKET_AVG_SLIPPAGE_PCT * 100).toFixed(3)}%`}
        />
        <StatRow
          label="Total commissions"
          value={formatCurrency(totalCommission)}
          sub={proMode ? "Pro mode (paid)" : "Free mode ($0)"}
          negative={totalCommission > 0}
        />
        {totalFillSavings !== 0 && (
          <StatRow
            label="Fill savings vs market"
            value={formatCurrency(Math.abs(totalFillSavings))}
            positive={totalFillSavings > 0}
            negative={totalFillSavings < 0}
          />
        )}
        <StatRow
          label="Total cost drag"
          value={`${totalDragPct.toFixed(3)}%`}
          sub="(slippage + commission) / notional"
          negative={totalDragPct > 0.2}
        />
      </div>

      {/* Tips */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Tips to reduce costs
        </p>
        <ul className="space-y-0.5 text-[10px] text-muted-foreground">
          <li className="flex items-start gap-1">
            <span className="mt-0.5 shrink-0 h-1 w-1 rounded-full bg-muted-foreground/40" />
            Use limit orders to avoid market-order slippage
          </li>
          <li className="flex items-start gap-1">
            <span className="mt-0.5 shrink-0 h-1 w-1 rounded-full bg-muted-foreground/40" />
            Avoid large orders (&gt;5% of daily volume) — market impact adds hidden cost
          </li>
          <li className="flex items-start gap-1">
            <span className="mt-0.5 shrink-0 h-1 w-1 rounded-full bg-muted-foreground/40" />
            {proMode
              ? "Pro mode is on — commissions are $0.005/share ($1 min)"
              : "Free mode is on — $0 commissions like Robinhood"}
          </li>
        </ul>
      </div>

      {/* Reset link */}
      <ResetStatsButton />
    </div>
  );
}

function ResetStatsButton() {
  const resetStats = useTradingPreferencesStore((s) => s.resetStats);
  return (
    <button
      type="button"
      onClick={resetStats}
      className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
    >
      <DollarSign className="h-2.5 w-2.5" />
      Reset execution stats
    </button>
  );
}
