"use client";

import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Briefcase, X } from "lucide-react";
import { toast } from "sonner";
import type { Position } from "@/types/trading";

// Row background based on P&L %
function rowHeatClass(pct: number): string {
  if (pct >= 5) return "bg-green-500/10";
  if (pct >= 1) return "bg-green-500/5";
  if (pct <= -5) return "bg-red-500/10";
  if (pct <= -1) return "bg-red-500/5";
  return "";
}

// Derive stop loss and take profit prices for a position from pending orders
interface OrderLevels {
  stopLoss: number | null;
  takeProfit: number | null;
}

function usePositionLevels(ticker: string, side: "long" | "short"): OrderLevels {
  const pendingOrders = useTradingStore((s) => s.pendingOrders);
  const relevant = pendingOrders.filter((o) => o.ticker === ticker);

  let stopLoss: number | null = null;
  let takeProfit: number | null = null;

  for (const o of relevant) {
    if (o.type === "stop_loss" && o.stopPrice != null) {
      stopLoss = o.stopPrice;
    }
    if (o.type === "take_profit" && o.takeProfitPrice != null) {
      takeProfit = o.takeProfitPrice;
    }
  }

  return { stopLoss, takeProfit };
}

interface PositionRowProps {
  pos: Position;
  onClose: () => void;
}

function PositionRow({ pos, onClose }: PositionRowProps) {
  const { stopLoss, takeProfit } = usePositionLevels(pos.ticker, pos.side);
  const pct = pos.unrealizedPnLPercent;
  const isProfit = pos.unrealizedPnL >= 0;

  // Distance from current price to SL / TP
  const slDistPct =
    stopLoss != null && pos.currentPrice > 0
      ? ((stopLoss - pos.currentPrice) / pos.currentPrice) * 100
      : null;
  const tpDistPct =
    takeProfit != null && pos.currentPrice > 0
      ? ((takeProfit - pos.currentPrice) / pos.currentPrice) * 100
      : null;

  return (
    <tr
      className={cn(
        "border-b border-border/50 transition-colors hover:bg-accent/20",
        rowHeatClass(pct),
      )}
    >
      {/* Ticker */}
      <td className="px-2 py-1.5">
        <span className="font-semibold text-xs tabular-nums">{pos.ticker}</span>
      </td>

      {/* Side */}
      <td className="px-2 py-1.5 text-center">
        <Badge
          variant="outline"
          className={cn(
            "px-1.5 py-0 text-[10px]",
            pos.side === "long"
              ? "border-green-500/30 text-green-500"
              : "border-red-500/30 text-red-500",
          )}
        >
          {pos.side === "long" ? "LONG" : "SHORT"}
        </Badge>
      </td>

      {/* Qty */}
      <td className="px-2 py-1.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {pos.quantity}
      </td>

      {/* Entry */}
      <td className="px-2 py-1.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {formatCurrency(pos.avgPrice)}
      </td>

      {/* Current */}
      <td className="px-2 py-1.5 text-right font-mono text-xs tabular-nums">
        {formatCurrency(pos.currentPrice)}
      </td>

      {/* P&L $ */}
      <td
        className={cn(
          "px-2 py-1.5 text-right font-mono text-xs tabular-nums",
          isProfit ? "text-green-500" : "text-red-500",
        )}
      >
        {formatCurrency(pos.unrealizedPnL)}
      </td>

      {/* P&L % */}
      <td
        className={cn(
          "px-2 py-1.5 text-right font-mono text-xs tabular-nums",
          isProfit ? "text-green-500" : "text-red-500",
        )}
      >
        {formatPercent(pos.unrealizedPnLPercent)}
      </td>

      {/* Stop Loss */}
      <td className="px-2 py-1.5 text-right font-mono text-xs tabular-nums">
        {stopLoss != null ? (
          <div>
            <div className="text-orange-400">{formatCurrency(stopLoss)}</div>
            {slDistPct != null && (
              <div className="text-[10px] text-muted-foreground">
                {slDistPct >= 0 ? "+" : ""}
                {slDistPct.toFixed(1)}%
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Take Profit */}
      <td className="px-2 py-1.5 text-right font-mono text-xs tabular-nums">
        {takeProfit != null ? (
          <div>
            <div className="text-blue-400">{formatCurrency(takeProfit)}</div>
            {tpDistPct != null && (
              <div className="text-[10px] text-muted-foreground">
                {tpDistPct >= 0 ? "+" : ""}
                {tpDistPct.toFixed(1)}%
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Close button */}
      <td className="px-1 py-1.5 text-center">
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Close position"
        >
          <X className="h-3 w-3" />
        </button>
      </td>
    </tr>
  );
}

export function OpenPositionsTable() {
  const positions = useTradingStore((s) => s.positions);
  const placeSellOrder = useTradingStore((s) => s.placeSellOrder);
  const coverShortOrder = useTradingStore((s) => s.coverShortOrder);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const currentBar =
    allData.length > 0 && revealedCount > 0
      ? allData[Math.min(revealedCount - 1, allData.length - 1)]
      : null;

  const handleClose = (pos: Position) => {
    const simDate = currentBar?.timestamp ?? Date.now();
    const order =
      pos.side === "long"
        ? placeSellOrder(pos.ticker, pos.quantity, pos.currentPrice, simDate)
        : coverShortOrder(pos.ticker, pos.quantity, pos.currentPrice, simDate);

    if (order) {
      toast.success(`Closed ${pos.ticker} ${pos.side} position`);
    }
  };

  if (positions.length === 0) {
    return (
      <div className="flex h-28 flex-col items-center justify-center gap-1.5">
        <Briefcase className="h-5 w-5 text-muted-foreground/40" />
        <span className="text-xs font-medium text-muted-foreground/50">
          No open positions
        </span>
        <span className="text-[10px] text-muted-foreground/40">
          Place a buy or short order to open a position
        </span>
      </div>
    );
  }

  const totalPnL = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);
  const totalValue = positions.reduce(
    (sum, p) => sum + p.quantity * p.avgPrice,
    0,
  );
  const totalPnLPct = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            <th className="px-2 py-1.5 text-left">Ticker</th>
            <th className="px-2 py-1.5 text-center">Side</th>
            <th className="px-2 py-1.5 text-right">Qty</th>
            <th className="px-2 py-1.5 text-right">Entry</th>
            <th className="px-2 py-1.5 text-right">Current</th>
            <th className="px-2 py-1.5 text-right">P&amp;L $</th>
            <th className="px-2 py-1.5 text-right">P&amp;L %</th>
            <th className="px-2 py-1.5 text-right">Stop Loss</th>
            <th className="px-2 py-1.5 text-right">Take Profit</th>
            <th className="w-8 px-1 py-1.5"></th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <PositionRow
              key={`${pos.ticker}-${pos.side}`}
              pos={pos}
              onClose={() => handleClose(pos)}
            />
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border bg-card/60 font-medium">
            <td
              className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground"
              colSpan={5}
            >
              Total Open P&amp;L
            </td>
            <td
              className={cn(
                "px-2 py-1.5 text-right font-mono text-xs tabular-nums",
                totalPnL >= 0 ? "text-green-500" : "text-red-500",
              )}
            >
              {formatCurrency(totalPnL)}
            </td>
            <td
              className={cn(
                "px-2 py-1.5 text-right font-mono text-xs tabular-nums",
                totalPnLPct >= 0 ? "text-green-500" : "text-red-500",
              )}
            >
              {formatPercent(totalPnLPct)}
            </td>
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
