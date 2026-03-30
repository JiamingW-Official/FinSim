"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, cn } from "@/lib/utils";

// ─── MetricCell ───────────────────────────────────────────────────────────────

function MetricCell({
  label,
  value,
  warn,
  danger,
}: {
  label: string;
  value: string;
  warn?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/20 bg-card/30 p-2">
      <span className="block text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30">
        {label}
      </span>
      <span
        className={cn(
          "text-[13px] font-mono font-semibold tabular-nums text-foreground/80",
          danger ? "text-red-400" : warn ? "text-amber-400" : "",
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function MarginDashboard() {
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const marginUsed = useTradingStore((s) => s.marginUsed);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const buyingPower = portfolioValue * 2;

  const marginRatioPct = buyingPower > 0 ? (marginUsed / buyingPower) * 100 : 0;

  const dayTradesLeft = useMemo(() => {
    const today = new Date().toDateString();
    const todayTrades = tradeHistory.filter(
      (t) => t.side === "sell" && new Date(t.timestamp).toDateString() === today,
    ).length;
    return Math.max(0, 3 - todayTrades);
  }, [tradeHistory]);

  return (
    <div className="px-3 py-2 border-t border-border/20">
      <div className="mb-1.5">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30">
          Margin
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MetricCell label="Buying Power" value={formatCurrency(buyingPower)} />
        <MetricCell
          label="Margin Used"
          value={formatCurrency(marginUsed)}
          warn={marginRatioPct > 30}
          danger={marginRatioPct > 50}
        />
        <MetricCell
          label="Margin Ratio"
          value={`${marginRatioPct.toFixed(1)}%`}
          warn={marginRatioPct > 30}
          danger={marginRatioPct > 50}
        />
        <MetricCell
          label="Day Trades Left"
          value={`${dayTradesLeft} / 3`}
          warn={dayTradesLeft <= 1}
          danger={dayTradesLeft === 0}
        />
      </div>
    </div>
  );
}
