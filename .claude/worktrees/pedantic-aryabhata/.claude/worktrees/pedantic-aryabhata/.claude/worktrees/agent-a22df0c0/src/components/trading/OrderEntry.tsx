"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { useChartStore } from "@/stores/chart-store";
import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useGameStore } from "@/stores/game-store";
import { formatCurrency, cn } from "@/lib/utils";
import { usePriceFlash, useAnimatedNumber } from "@/hooks/usePriceFlash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Target,
  Shield,
  Zap,
  AlertTriangle,
  X,
} from "lucide-react";
import type { OrderSide, OrderType } from "@/types/trading";
import { TradeConfirmDialog } from "./TradeConfirmDialog";
import { TradeResultFeedback, type TradeFeedback } from "@/components/education/TradeResultFeedback";
import { RiskMeter } from "@/components/education/RiskMeter";
import { soundEngine } from "@/services/audio/sound-engine";
import { generatePreTradeWarning } from "@/services/ai/behavioral-coach";

const ORDER_TYPES: { value: OrderType; label: string; icon: typeof Zap }[] = [
  { value: "market", label: "Market", icon: Zap },
  { value: "limit", label: "Limit", icon: Target },
  { value: "stop_loss", label: "Stop", icon: Shield },
  { value: "take_profit", label: "TP", icon: TrendingUp },
];

export function OrderEntry() {
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [quantity, setQuantity] = useState("10");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [tradeFlash, setTradeFlash] = useState<"buy" | "sell" | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tradeFeedback, setTradeFeedback] = useState<TradeFeedback | null>(null);
  const [warningDismissed, setWarningDismissed] = useState(false);

  const currentTicker = useChartStore((s) => s.currentTicker);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const currentBar =
    allData.length > 0 && revealedCount > 0
      ? allData[revealedCount - 1]
      : null;
  const cash = useTradingStore((s) => s.cash);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const placeBuyOrder = useTradingStore((s) => s.placeBuyOrder);
  const placeSellOrder = useTradingStore((s) => s.placeSellOrder);
  const placeShortOrder = useTradingStore((s) => s.placeShortOrder);
  const placeLimitOrder = useTradingStore((s) => s.placeLimitOrder);
  const placeStopLossOrder = useTradingStore((s) => s.placeStopLossOrder);
  const placeTakeProfitOrder = useTradingStore((s) => s.placeTakeProfitOrder);
  const recordTrade = useGameStore((s) => s.recordTrade);

  const price = currentBar?.close ?? 0;
  const priceFlash = usePriceFlash(price || undefined);
  const animatedPrice = useAnimatedNumber(price, 250);
  const qty = Math.max(0, parseInt(quantity) || 0);
  const estimatedCost = qty * price;
  const commission = Math.max(1, qty * 0.01);

  // Behavioral pre-trade warning
  const preTradeWarning = useMemo(() => {
    if (tradeHistory.length < 2) return null;
    const recentLosses = (() => {
      let count = 0;
      for (const t of tradeHistory) {
        if (t.side !== "sell") continue;
        if (t.realizedPnL < 0) count++;
        else break;
      }
      return count;
    })();
    return generatePreTradeWarning(
      { recentLosses, trend: "neutral" },
      tradeHistory,
      portfolioValue,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeHistory.length, portfolioValue]);

  const position = positions.find(
    (p) => p.ticker === currentTicker && p.side === "long",
  );
  const shortPosition = positions.find(
    (p) => p.ticker === currentTicker && p.side === "short",
  );
  const maxSellQty = position?.quantity ?? 0;

  // For market orders: buy needs funds, sell needs shares (or short sell)
  const canExecuteMarket =
    orderType === "market" &&
    qty > 0 &&
    price > 0 &&
    (side === "buy" ? estimatedCost + commission <= cash : true);

  // For limit/stop/tp: just need valid price inputs
  const canExecuteLimit =
    orderType === "limit" &&
    qty > 0 &&
    parseFloat(limitPrice) > 0;
  const canExecuteStop =
    orderType === "stop_loss" &&
    qty > 0 &&
    parseFloat(stopPrice) > 0 &&
    (position || shortPosition);
  const canExecuteTP =
    orderType === "take_profit" &&
    qty > 0 &&
    parseFloat(takeProfitPrice) > 0 &&
    (position || shortPosition);

  const canExecute =
    canExecuteMarket || canExecuteLimit || canExecuteStop || canExecuteTP;

  const triggerTradeFlash = useCallback((tradeSide: "buy" | "sell") => {
    setTradeFlash(tradeSide);
    setWarningDismissed(false); // reset so next analysis can re-warn
    setTimeout(() => setTradeFlash(null), 600);
  }, []);

  const handleExecute = () => {
    if (!currentBar) return;
    const simDate = currentBar.timestamp;

    if (orderType === "market") {
      if (side === "buy") {
        const order = placeBuyOrder(currentTicker, qty, price, simDate);
        if (order) {
          triggerTradeFlash("buy");
          soundEngine.playBuy();
          toast.success(
            `Bought ${qty} ${currentTicker} @ ${formatCurrency(order.avgFillPrice)}`,
          );
          recordTrade(0, currentTicker, false, false);
          setTradeFeedback({
            type: "buy",
            ticker: currentTicker,
            quantity: qty,
            price: order.avgFillPrice,
            avgCost: position ? position.avgPrice : order.avgFillPrice,
          });
        } else {
          soundEngine.playError();
          toast.error("Insufficient funds");
        }
      } else {
        // Sell: close long position, or short sell
        if (position && position.quantity >= qty) {
          const order = placeSellOrder(currentTicker, qty, price, simDate);
          if (order) {
            triggerTradeFlash("sell");
            soundEngine.playSell();
            toast.success(
              `Sold ${qty} ${currentTicker} @ ${formatCurrency(order.avgFillPrice)}`,
            );
            const pnl =
              (order.avgFillPrice - position.avgPrice) * qty -
              (order.fees ?? 0);
            const pnlPct =
              ((order.avgFillPrice - position.avgPrice) / position.avgPrice) *
              100;
            recordTrade(pnl, currentTicker, false, false);
            setTradeFeedback({
              type: "sell",
              ticker: currentTicker,
              quantity: qty,
              price: order.avgFillPrice,
              pnl,
              pnlPercent: pnlPct,
            });
          }
        } else {
          // Short sell (or close remaining long + short the rest)
          if (position && position.quantity > 0) {
            placeSellOrder(
              currentTicker,
              position.quantity,
              price,
              simDate,
            );
            const shortQty = qty - position.quantity;
            if (shortQty > 0) {
              placeShortOrder(currentTicker, shortQty, price, simDate);
            }
          } else {
            placeShortOrder(currentTicker, qty, price, simDate);
          }
          triggerTradeFlash("sell");
          soundEngine.playSell();
          toast.success(`Short sold ${qty} ${currentTicker}`);
          recordTrade(0, currentTicker, true, false);
        }
      }
    } else if (orderType === "limit") {
      const lp = parseFloat(limitPrice);
      if (isNaN(lp) || lp <= 0) {
        soundEngine.playError();
        toast.error("Invalid limit price");
        return;
      }
      placeLimitOrder(currentTicker, side, qty, lp, simDate);
      soundEngine.playOrderFill();
      toast.info(
        `Limit ${side} order placed: ${qty} ${currentTicker} @ ${formatCurrency(lp)}`,
      );
    } else if (orderType === "stop_loss") {
      const sp = parseFloat(stopPrice);
      if (isNaN(sp) || sp <= 0) {
        soundEngine.playError();
        toast.error("Invalid stop price");
        return;
      }
      placeStopLossOrder(currentTicker, qty, sp, simDate);
      soundEngine.playOrderFill();
      toast.info(`Stop-loss set at ${formatCurrency(sp)}`);
    } else if (orderType === "take_profit") {
      const tp = parseFloat(takeProfitPrice);
      if (isNaN(tp) || tp <= 0) {
        soundEngine.playError();
        toast.error("Invalid target price");
        return;
      }
      placeTakeProfitOrder(currentTicker, qty, tp, simDate);
      soundEngine.playOrderFill();
      toast.info(`Take-profit set at ${formatCurrency(tp)}`);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 p-3 transition-colors duration-500",
        tradeFlash === "buy" && "trade-flash-buy",
        tradeFlash === "sell" && "trade-flash-sell",
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        Order Entry
      </div>

      {/* Pre-trade behavioral warning */}
      <AnimatePresence>
        {preTradeWarning && !warningDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-2">
              <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
              <p className="flex-1 text-[9px] leading-snug text-amber-300">
                {preTradeWarning}
              </p>
              <button
                type="button"
                onClick={() => setWarningDismissed(true)}
                className="shrink-0 text-amber-500/60 hover:text-amber-400 transition-colors"
                aria-label="Dismiss warning"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticker & Price */}
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{currentTicker}</span>
        <span
          className={cn(
            "text-lg font-bold tabular-nums tracking-tight transition-colors duration-300",
            priceFlash === "up" && "price-flash-up",
            priceFlash === "down" && "price-flash-down",
          )}
        >
          {price > 0 ? formatCurrency(animatedPrice) : "---"}
        </span>
      </div>

      {/* Buy / Sell Toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-0.5">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={cn(
            "rounded py-1.5 text-xs font-semibold transition-all duration-200",
            side === "buy"
              ? "bg-primary text-white shadow-sm border border-transparent"
              : "text-muted-foreground hover:text-foreground border border-border/40",
          )}
        >
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            BUY
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={cn(
            "rounded py-1.5 text-xs font-semibold transition-all duration-200",
            side === "sell"
              ? "bg-red-500 text-white shadow-sm border border-transparent"
              : "text-muted-foreground hover:text-foreground border border-border/40",
          )}
        >
          <span className="inline-flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            SELL
          </span>
        </button>
      </div>

      {/* Order Type Selector */}
      <div className="grid grid-cols-4 gap-0.5 rounded-md bg-muted p-0.5">
        {ORDER_TYPES.map((ot) => {
          const Icon = ot.icon;
          return (
            <motion.button
              key={ot.value}
              type="button"
              onClick={() => setOrderType(ot.value)}
              whileHover={{ y: -1 }}
              whileTap={{ y: 1, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={cn(
                "rounded py-1 text-[10px] font-medium transition-colors duration-150",
                orderType === ot.value
                  ? "bg-background text-foreground shadow-sm border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="inline-flex items-center gap-0.5">
                <Icon className="h-2.5 w-2.5" />
                {ot.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Conditional price inputs */}
      {orderType === "limit" && (
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            Limit Price
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder={price > 0 ? price.toFixed(2) : "0.00"}
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="h-8 bg-background text-sm tabular-nums"
          />
        </div>
      )}
      {orderType === "stop_loss" && (
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-[#ef4444]" />
            Stop Price
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder={
              price > 0 ? (price * 0.95).toFixed(2) : "0.00"
            }
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            className="h-8 bg-background text-sm tabular-nums"
          />
        </div>
      )}
      {orderType === "take_profit" && (
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-green-500" />
            Target Price
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder={
              price > 0 ? (price * 1.1).toFixed(2) : "0.00"
            }
            value={takeProfitPrice}
            onChange={(e) => setTakeProfitPrice(e.target.value)}
            className="h-8 bg-background text-sm tabular-nums"
          />
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Package className="h-3 w-3" />
          Quantity
        </label>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="h-8 bg-background text-sm font-mono tabular-nums"
        />
      </div>

      {/* Quick quantity buttons */}
      <div className="flex gap-1">
        {[1, 5, 10, 25, 50, 100].map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setQuantity(String(q))}
            className={cn(
              "flex-1 rounded py-1 text-[10px] font-medium transition-all duration-150",
              parseInt(quantity) === q
                ? "bg-primary text-white"
                : "bg-transparent border border-border/40 text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Estimated Cost + Fees */}
      {orderType === "market" && price > 0 && qty > 0 && (
        <div className="space-y-1 rounded-md bg-muted/50 p-2">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              {side === "buy" ? "Est. Cost" : "Est. Proceeds"}
            </span>
            <AnimatedNumber
              value={estimatedCost}
              format={(n) => formatCurrency(n)}
              className="font-mono tabular-nums text-xs font-medium"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Commission</span>
            <span className="font-mono tabular-nums text-xs">
              {formatCurrency(commission)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Est. Slippage</span>
            <span className="font-mono tabular-nums text-xs">
              ~{formatCurrency(price * qty * 0.00025)}
            </span>
          </div>
        </div>
      )}

      {/* Cash / Position info */}
      <div className="rounded-md bg-muted/50 p-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] text-muted-foreground">Cash Available</span>
          <span className="font-mono tabular-nums text-xs font-medium">
            {formatCurrency(cash)}
          </span>
        </div>
        {position && (
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Long Position</span>
            <span className="tabular-nums font-medium text-green-500">
              {position.quantity} shares
            </span>
          </div>
        )}
        {shortPosition && (
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Short Position</span>
            <span className="tabular-nums font-medium text-[#ef4444]">
              {shortPosition.quantity} shares
            </span>
          </div>
        )}
      </div>

      {/* Risk Meter */}
      {orderType === "market" && side === "buy" && qty > 0 && price > 0 && (
        <RiskMeter
          ticker={currentTicker}
          quantity={qty}
          price={price}
          portfolioValue={portfolioValue}
          existingPositionValue={position ? position.quantity * price : 0}
        />
      )}

      {/* Execute button */}
      <motion.div
        whileTap={canExecute ? { scale: 0.97 } : {}}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={!canExecute}
          className={cn(
            "w-full font-semibold tracking-wide uppercase text-sm transition-all duration-200",
            orderType !== "market"
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : side === "buy"
                ? "bg-primary hover:bg-primary/90 text-white"
                : "bg-red-500 hover:bg-red-600 text-white",
          )}
        >
          {orderType === "market"
            ? `${side === "buy" ? "BUY" : "SELL"} ${currentTicker}`
            : `PLACE ${orderType.replace("_", " ").toUpperCase()}`}
        </Button>
      </motion.div>

      {/* Confirmation dialog */}
      <TradeConfirmDialog
        open={showConfirm}
        onConfirm={() => {
          setShowConfirm(false);
          handleExecute();
        }}
        onCancel={() => setShowConfirm(false)}
        side={side}
        orderType={orderType}
        ticker={currentTicker}
        quantity={qty}
        price={price}
        limitPrice={parseFloat(limitPrice) || undefined}
        stopPrice={parseFloat(stopPrice) || undefined}
        takeProfitPrice={parseFloat(takeProfitPrice) || undefined}
        commission={commission}
        estimatedSlippage={price * qty * 0.00025}
      />

      {/* Trade result feedback */}
      <TradeResultFeedback
        feedback={tradeFeedback}
        onDismiss={() => setTradeFeedback(null)}
      />

      {/* Keyboard hint */}
      <div className="flex justify-center gap-2 text-[10px] text-muted-foreground/50">
        <span>Space: Play/Pause</span>
        <span>→: Step</span>
        <span>1-4: Speed</span>
      </div>
    </div>
  );
}
