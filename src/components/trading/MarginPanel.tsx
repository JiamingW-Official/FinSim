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
    <div className="flex items-center justify-between px-2 py-1 bg-muted/5 border border-border/20 rounded mx-2 mb-1">
      <span className="text-[9px] font-mono text-muted-foreground/40">Margin Used</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono tabular-nums text-foreground/60">{formatCurrency(borrowedAmount)}</span>
        <span className="text-[9px] font-mono text-amber-400/60">{marginRatioPct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
