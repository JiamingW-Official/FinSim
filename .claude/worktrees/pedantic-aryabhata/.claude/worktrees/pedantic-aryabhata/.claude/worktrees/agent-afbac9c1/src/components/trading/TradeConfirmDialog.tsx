"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import type { OrderSide, OrderType } from "@/types/trading";
import { soundEngine } from "@/services/audio/sound-engine";

interface TradeConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  side: OrderSide;
  orderType: OrderType;
  ticker: string;
  quantity: number;
  price: number;
  limitPrice?: number;
  stopPrice?: number;
  takeProfitPrice?: number;
  commission: number;
  estimatedSlippage: number;
}

export function TradeConfirmDialog({
  open,
  onConfirm,
  onCancel,
  side,
  orderType,
  ticker,
  quantity,
  price,
  limitPrice,
  stopPrice,
  takeProfitPrice,
  commission,
  estimatedSlippage,
}: TradeConfirmDialogProps) {
  const isBuy = side === "buy";
  const isMarket = orderType === "market";
  const execPrice = isMarket
    ? price
    : (limitPrice ?? stopPrice ?? takeProfitPrice ?? price);
  const subtotal = quantity * execPrice;
  const total = isBuy
    ? subtotal + commission + estimatedSlippage
    : subtotal - commission - estimatedSlippage;

  const typeLabel = orderType.replace("_", " ").toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="glass max-w-xs border-border/50 p-0">
        {/* Colored header banner */}
        <div
          className={cn(
            "rounded-t-lg px-4 py-3",
            isBuy ? "bg-green-500/10" : "bg-[#ef4444]/10",
          )}
        >
          <DialogHeader>
            <DialogTitle
              className={cn(
                "text-sm font-bold",
                isBuy ? "text-green-500" : "text-[#ef4444]",
              )}
            >
              CONFIRM {isBuy ? "BUY" : "SELL"} ORDER
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-3 px-4 pb-4">
          {/* Ticker + Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">{ticker}</span>
            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {typeLabel}
            </span>
          </div>

          {/* Summary rows */}
          <div className="space-y-1.5 rounded-md bg-muted/50 p-2.5 text-xs">
            <Row label="Quantity" value={`${quantity} shares`} />
            <Row
              label={isMarket ? "Market Price" : "Trigger Price"}
              value={formatCurrency(execPrice)}
            />
            <Row
              label={isBuy ? "Est. Cost" : "Est. Proceeds"}
              value={formatCurrency(subtotal)}
            />
            <div className="my-1 border-t border-border/50" />
            <Row
              label="Commission"
              value={formatCurrency(commission)}
              muted
            />
            {isMarket && (
              <Row
                label="Est. Slippage"
                value={`~${formatCurrency(estimatedSlippage)}`}
                muted
              />
            )}
            <div className="my-1 border-t border-border/50" />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Condition text for non-market orders */}
          {!isMarket && (
            <p className="text-[10px] text-muted-foreground">
              {orderType === "limit" && isBuy && `Triggers when price drops to ${formatCurrency(execPrice)}`}
              {orderType === "limit" && !isBuy && `Triggers when price rises to ${formatCurrency(execPrice)}`}
              {orderType === "stop_loss" && `Triggers when price drops to ${formatCurrency(execPrice)}`}
              {orderType === "take_profit" && `Triggers when price rises to ${formatCurrency(execPrice)}`}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { soundEngine.playClick(); onCancel(); }}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => { soundEngine.playClick(); onConfirm(); }}
              className={cn(
                "flex-1 text-xs font-semibold text-white",
                isBuy
                  ? "bg-green-500 hover:bg-[#059669]"
                  : "bg-[#ef4444] hover:bg-[#dc2626]",
              )}
            >
              Confirm {isBuy ? "BUY" : "SELL"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-muted-foreground/70" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={cn("tabular-nums", muted && "text-muted-foreground/70")}>
        {value}
      </span>
    </div>
  );
}
