"use client";

import { useEffect } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency } from "@/lib/utils";

/**
 * MarginPanel — compact inline strip shown only when margin is in use.
 * Displays borrowed amount and margin utilisation %.
 */
export function MarginPanel() {
  const positions = useTradingStore((s) => s.positions);
  const marginUsed = useTradingStore((s) => s.marginUsed);
  const marginLimit = useTradingStore((s) => s.marginLimit);
  const updateMarginMetrics = useTradingStore((s) => s.updateMarginMetrics);

  // Recompute margin metrics whenever positions change
  useEffect(() => {
    updateMarginMetrics();
  }, [positions, updateMarginMetrics]);

  const borrowedAmount = marginUsed;
  const marginRatioPct = marginLimit > 0 ? (marginUsed / marginLimit) * 100 : 0;

  if (borrowedAmount <= 0) return null;

  return (
    <div className="flex items-center px-3 py-1 border-t border-border/20">
      <span className="text-[10px] font-mono tabular-nums text-muted-foreground/50">
        Margin: {formatCurrency(borrowedAmount)} ({marginRatioPct.toFixed(0)}%)
      </span>
    </div>
  );
}
