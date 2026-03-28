"use client";

import { useState, useCallback } from "react";
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
  ChevronDown,
  ChevronUp,
  GitBranch,
  ArrowLeftRight,
  Activity,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { OrderSide, OrderType, ConditionalTriggerType } from "@/types/trading";
import { TradeConfirmDialog } from "./TradeConfirmDialog";
import { TradeResultFeedback, type TradeFeedback } from "@/components/education/TradeResultFeedback";
import { RiskMeter } from "@/components/education/RiskMeter";
import { soundEngine } from "@/services/audio/sound-engine";

// ─── Types ───────────────────────────────────────────────────────────────────

type AdvancedOrderType = "bracket" | "oco" | "trailing_stop" | "conditional";

const ORDER_TYPES: { value: OrderType; label: string; icon: typeof Zap }[] = [
  { value: "market", label: "Market", icon: Zap },
  { value: "limit", label: "Limit", icon: Target },
  { value: "stop_loss", label: "Stop", icon: Shield },
  { value: "take_profit", label: "TP", icon: TrendingUp },
];

const ADVANCED_ORDER_TYPES: {
  value: AdvancedOrderType;
  label: string;
  icon: typeof Zap;
  description: string;
}[] = [
  { value: "bracket", label: "Bracket", icon: GitBranch, description: "Entry + Stop + TP as one group" },
  { value: "oco", label: "OCO", icon: ArrowLeftRight, description: "One-Cancels-Other at two levels" },
  { value: "trailing_stop", label: "Trail", icon: Activity, description: "Stop follows price by fixed amount" },
  { value: "conditional", label: "GTC If", icon: Clock, description: "Execute only when condition is met" },
];

const CONDITIONAL_TYPES: { value: ConditionalTriggerType; label: string }[] = [
  { value: "price_above", label: "Price >" },
  { value: "price_below", label: "Price <" },
  { value: "volume_spike", label: "Vol spike ≥" },
];

// ─── Mini price ladder ────────────────────────────────────────────────────────

function PriceLadder({
  entry,
  stop,
  target,
  current,
}: {
  entry: number;
  stop: number;
  target: number;
  current: number;
}) {
  const levels = [
    { label: "TP", price: target, color: "#10b981" },
    { label: "Entry", price: entry, color: "#f59e0b" },
    { label: "SL", price: stop, color: "#ef4444" },
  ].sort((a, b) => b.price - a.price);

  const min = Math.min(...levels.map((l) => l.price), current) * 0.995;
  const max = Math.max(...levels.map((l) => l.price), current) * 1.005;
  const range = max - min || 1;

  return (
    <div className="relative h-24 rounded-md border border-border/30 bg-muted/30 px-2 py-1">
      {/* Current price line */}
      <div
        className="absolute left-0 right-0 border-t border-dashed border-primary/40"
        style={{ top: `${((max - current) / range) * 100}%` }}
      />
      {levels.map((l) => (
        <div
          key={l.label}
          className="absolute left-2 right-2 flex items-center justify-between"
          style={{ top: `${((max - l.price) / range) * 100}%`, transform: "translateY(-50%)" }}
        >
          <span className="rounded px-1 text-[9px] font-semibold text-white" style={{ background: l.color }}>
            {l.label}
          </span>
          <span className="text-[10px] tabular-nums font-medium" style={{ color: l.color }}>
            {formatCurrency(l.price)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Order Ticket Summary Modal ───────────────────────────────────────────────

interface AdvancedOrderSummary {
  advancedType: AdvancedOrderType;
  ticker: string;
  quantity: number;
  price: number;
  portfolioValue: number;
  cash: number;
  // bracket
  bracketEntry?: number;
  bracketStop?: number;
  bracketTP?: number;
  // oco
  ocoA?: number;
  ocoB?: number;
  // trailing
  trailAmount?: number;
  trailPercent?: number;
  // conditional
  condType?: ConditionalTriggerType;
  condValue?: number;
  condLimitPrice?: number;
}

function AdvancedOrderTicket({
  summary,
  onConfirm,
  onCancel,
}: {
  summary: AdvancedOrderSummary;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { advancedType, ticker, quantity, price, portfolioValue, cash } = summary;
  const estimatedCost = quantity * price;
  const pctOfPortfolio = portfolioValue > 0 ? (estimatedCost / portfolioValue) * 100 : 0;

  const maxLoss =
    advancedType === "bracket" && summary.bracketEntry && summary.bracketStop
      ? Math.abs(summary.bracketEntry - summary.bracketStop) * quantity
      : advancedType === "trailing_stop" && summary.trailAmount
        ? summary.trailAmount * quantity
        : null;

  const rrRatio =
    advancedType === "bracket" &&
    summary.bracketEntry &&
    summary.bracketStop &&
    summary.bracketTP
      ? Math.abs(summary.bracketTP - summary.bracketEntry) /
        Math.abs(summary.bracketEntry - summary.bracketStop)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="w-full max-w-xs rounded-xl border border-border/50 bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="rounded-t-xl bg-[#f59e0b]/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#f59e0b]">ORDER TICKET</span>
            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
              {advancedType.replace("_", " ")}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {ticker} · {quantity} shares
          </div>
        </div>

        <div className="space-y-3 p-4">
          {/* Order details */}
          <div className="space-y-1.5 rounded-md bg-muted/50 p-2.5 text-xs">
            {advancedType === "bracket" && (
              <>
                <Row label="Entry" value={formatCurrency(summary.bracketEntry ?? price)} />
                <Row label="Stop Loss" value={formatCurrency(summary.bracketStop ?? 0)} colored="red" />
                <Row label="Take Profit" value={formatCurrency(summary.bracketTP ?? 0)} colored="green" />
                {rrRatio && (
                  <Row label="Risk:Reward" value={`1:${rrRatio.toFixed(2)}`} colored="amber" />
                )}
              </>
            )}
            {advancedType === "oco" && (
              <>
                <Row label="Buy Stop (A)" value={formatCurrency(summary.ocoA ?? 0)} />
                <Row label="Buy Limit (B)" value={formatCurrency(summary.ocoB ?? 0)} />
                <p className="text-[10px] text-muted-foreground mt-1">
                  If A fills, B is cancelled (and vice versa)
                </p>
              </>
            )}
            {advancedType === "trailing_stop" && (
              <>
                <Row label="Trail Amount" value={summary.trailPercent ? `${summary.trailPercent}%` : formatCurrency(summary.trailAmount ?? 0)} />
                <Row
                  label="Current Stop"
                  value={
                    summary.trailPercent
                      ? formatCurrency(price * (1 - summary.trailPercent / 100))
                      : formatCurrency(price - (summary.trailAmount ?? 0))
                  }
                  colored="red"
                />
              </>
            )}
            {advancedType === "conditional" && (
              <>
                <Row label="Condition" value={`${summary.condType?.replace("_", " ")} ${summary.condValue}`} />
                <Row label="Limit Price" value={formatCurrency(summary.condLimitPrice ?? price)} />
              </>
            )}
            <div className="my-1 border-t border-border/50" />
            <Row label="Est. Cost" value={formatCurrency(estimatedCost)} />
            <Row label="% of Portfolio" value={`${pctOfPortfolio.toFixed(1)}%`} muted />
            {maxLoss && <Row label="Max Loss" value={formatCurrency(maxLoss)} colored="red" />}
            <Row label="Cash Available" value={formatCurrency(cash)} muted />
          </div>

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
              className="flex-1 text-xs font-semibold text-white bg-[#f59e0b] hover:bg-[#d97706]"
            >
              Place Order
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  colored,
}: {
  label: string;
  value: string;
  muted?: boolean;
  colored?: "red" | "green" | "amber";
}) {
  const colorClass =
    colored === "red"
      ? "text-[#ef4444]"
      : colored === "green"
        ? "text-[#10b981]"
        : colored === "amber"
          ? "text-[#f59e0b]"
          : muted
            ? "text-muted-foreground/70"
            : "";
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-muted-foreground/70" : "text-muted-foreground"}>{label}</span>
      <span className={cn("tabular-nums", colorClass)}>{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OrderEntry() {
  // Standard order state
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [quantity, setQuantity] = useState("10");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [tradeFlash, setTradeFlash] = useState<"buy" | "sell" | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tradeFeedback, setTradeFeedback] = useState<TradeFeedback | null>(null);

  // Advanced order state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedType, setAdvancedType] = useState<AdvancedOrderType>("bracket");

  // Bracket
  const [bracketEntry, setBracketEntry] = useState("");
  const [bracketStop, setBracketStop] = useState("");
  const [bracketTP, setBracketTP] = useState("");

  // OCO
  const [ocoA, setOcoA] = useState("");
  const [ocoB, setOcoB] = useState("");

  // Trailing stop
  const [trailAmount, setTrailAmount] = useState("");
  const [trailPercent, setTrailPercent] = useState("");
  const [trailUsePercent, setTrailUsePercent] = useState(false);

  // Conditional
  const [condType, setCondType] = useState<ConditionalTriggerType>("price_above");
  const [condValue, setCondValue] = useState("");
  const [condLimitPrice, setCondLimitPrice] = useState("");
  const [condSide, setCondSide] = useState<OrderSide>("buy");

  // Advanced order ticket (summary modal)
  const [advancedTicket, setAdvancedTicket] = useState<AdvancedOrderSummary | null>(null);

  // Store selectors
  const currentTicker = useChartStore((s) => s.currentTicker);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const currentBar =
    allData.length > 0 && revealedCount > 0 ? allData[revealedCount - 1] : null;
  const cash = useTradingStore((s) => s.cash);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const positions = useTradingStore((s) => s.positions);
  const placeBuyOrder = useTradingStore((s) => s.placeBuyOrder);
  const placeSellOrder = useTradingStore((s) => s.placeSellOrder);
  const placeShortOrder = useTradingStore((s) => s.placeShortOrder);
  const placeLimitOrder = useTradingStore((s) => s.placeLimitOrder);
  const placeStopLossOrder = useTradingStore((s) => s.placeStopLossOrder);
  const placeTakeProfitOrder = useTradingStore((s) => s.placeTakeProfitOrder);
  const placeBracketOrder = useTradingStore((s) => s.placeBracketOrder);
  const placeOCOOrder = useTradingStore((s) => s.placeOCOOrder);
  const placeTrailingStopOrder = useTradingStore((s) => s.placeTrailingStopOrder);
  const placeConditionalOrder = useTradingStore((s) => s.placeConditionalOrder);
  const recordTrade = useGameStore((s) => s.recordTrade);

  const price = currentBar?.close ?? 0;
  const priceFlash = usePriceFlash(price || undefined);
  const animatedPrice = useAnimatedNumber(price, 250);
  const qty = Math.max(0, parseInt(quantity) || 0);
  const estimatedCost = qty * price;
  const commission = Math.max(1, qty * 0.01);

  const position = positions.find((p) => p.ticker === currentTicker && p.side === "long");
  const shortPosition = positions.find((p) => p.ticker === currentTicker && p.side === "short");

  // Validation for standard orders
  const canExecuteMarket =
    orderType === "market" &&
    qty > 0 &&
    price > 0 &&
    (side === "buy" ? estimatedCost + commission <= cash : true);
  const canExecuteLimit = orderType === "limit" && qty > 0 && parseFloat(limitPrice) > 0;
  const canExecuteStop =
    orderType === "stop_loss" && qty > 0 && parseFloat(stopPrice) > 0 && (position || shortPosition);
  const canExecuteTP =
    orderType === "take_profit" && qty > 0 && parseFloat(takeProfitPrice) > 0 && (position || shortPosition);
  const canExecute = canExecuteMarket || canExecuteLimit || canExecuteStop || canExecuteTP;

  // Computed values for bracket
  const bEntry = parseFloat(bracketEntry) || (price > 0 ? price : 0);
  const bStop = parseFloat(bracketStop) || (price > 0 ? price * 0.95 : 0);
  const bTP = parseFloat(bracketTP) || (price > 0 ? price * 1.1 : 0);
  const rrRatio =
    bEntry > 0 && bStop > 0 && bTP > 0
      ? Math.abs(bTP - bEntry) / Math.abs(bEntry - bStop)
      : null;

  // Trailing stop preview
  const trailAmt = parseFloat(trailAmount) || 0;
  const trailPct = parseFloat(trailPercent) || 0;
  const currentTrailStop =
    price > 0
      ? trailUsePercent && trailPct > 0
        ? price * (1 - trailPct / 100)
        : price - trailAmt
      : 0;

  const triggerTradeFlash = useCallback((tradeSide: "buy" | "sell") => {
    setTradeFlash(tradeSide);
    setTimeout(() => setTradeFlash(null), 600);
  }, []);

  // ─── Standard order execution ─────────────────────────────────────────────

  const handleExecute = () => {
    if (!currentBar) return;
    const simDate = currentBar.timestamp;

    if (orderType === "market") {
      if (side === "buy") {
        const order = placeBuyOrder(currentTicker, qty, price, simDate);
        if (order) {
          triggerTradeFlash("buy");
          soundEngine.playBuy();
          toast.success(`Bought ${qty} ${currentTicker} @ ${formatCurrency(order.avgFillPrice)}`);
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
        if (position && position.quantity >= qty) {
          const order = placeSellOrder(currentTicker, qty, price, simDate);
          if (order) {
            triggerTradeFlash("sell");
            soundEngine.playSell();
            toast.success(`Sold ${qty} ${currentTicker} @ ${formatCurrency(order.avgFillPrice)}`);
            const pnl = (order.avgFillPrice - position.avgPrice) * qty - (order.fees ?? 0);
            const pnlPct = ((order.avgFillPrice - position.avgPrice) / position.avgPrice) * 100;
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
          if (position && position.quantity > 0) {
            placeSellOrder(currentTicker, position.quantity, price, simDate);
            const shortQty = qty - position.quantity;
            if (shortQty > 0) placeShortOrder(currentTicker, shortQty, price, simDate);
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
      if (isNaN(lp) || lp <= 0) { soundEngine.playError(); toast.error("Invalid limit price"); return; }
      placeLimitOrder(currentTicker, side, qty, lp, simDate);
      soundEngine.playOrderFill();
      toast.info(`Limit ${side} order placed: ${qty} ${currentTicker} @ ${formatCurrency(lp)}`);
    } else if (orderType === "stop_loss") {
      const sp = parseFloat(stopPrice);
      if (isNaN(sp) || sp <= 0) { soundEngine.playError(); toast.error("Invalid stop price"); return; }
      placeStopLossOrder(currentTicker, qty, sp, simDate);
      soundEngine.playOrderFill();
      toast.info(`Stop-loss set at ${formatCurrency(sp)}`);
    } else if (orderType === "take_profit") {
      const tp = parseFloat(takeProfitPrice);
      if (isNaN(tp) || tp <= 0) { soundEngine.playError(); toast.error("Invalid target price"); return; }
      placeTakeProfitOrder(currentTicker, qty, tp, simDate);
      soundEngine.playOrderFill();
      toast.info(`Take-profit set at ${formatCurrency(tp)}`);
    }
  };

  // ─── Advanced order execution ─────────────────────────────────────────────

  const handleAdvancedExecute = () => {
    if (!currentBar) return;
    const simDate = currentBar.timestamp;

    if (advancedType === "bracket") {
      const entry = parseFloat(bracketEntry) || price;
      const sl = parseFloat(bracketStop);
      const tp = parseFloat(bracketTP);
      if (!sl || !tp) { toast.error("Enter stop and take-profit"); return; }
      placeBracketOrder(currentTicker, side, qty, entry, sl, tp, simDate);
      soundEngine.playOrderFill();
      toast.info(`Bracket order placed: Entry ${formatCurrency(entry)}, SL ${formatCurrency(sl)}, TP ${formatCurrency(tp)}`);
    } else if (advancedType === "oco") {
      const a = parseFloat(ocoA);
      const b = parseFloat(ocoB);
      if (!a || !b) { toast.error("Enter both OCO price levels"); return; }
      placeOCOOrder(currentTicker, qty, a, b, simDate);
      soundEngine.playOrderFill();
      toast.info(`OCO order: Buy stop @ ${formatCurrency(a)} / Buy limit @ ${formatCurrency(b)}`);
    } else if (advancedType === "trailing_stop") {
      const amt = parseFloat(trailAmount);
      const pct = parseFloat(trailPercent);
      if (!trailUsePercent && (!amt || amt <= 0)) { toast.error("Enter trail amount"); return; }
      if (trailUsePercent && (!pct || pct <= 0)) { toast.error("Enter trail percent"); return; }
      placeTrailingStopOrder(currentTicker, qty, amt || 0, trailUsePercent ? pct : undefined, price, simDate);
      soundEngine.playOrderFill();
      toast.info(`Trailing stop: ${trailUsePercent ? `${pct}%` : formatCurrency(amt)} trail`);
    } else if (advancedType === "conditional") {
      const cv = parseFloat(condValue);
      const lp = parseFloat(condLimitPrice) || price;
      if (!cv || cv <= 0) { toast.error("Enter condition value"); return; }
      placeConditionalOrder(currentTicker, condSide, qty, lp, { type: condType, value: cv }, simDate);
      soundEngine.playOrderFill();
      toast.info(`Conditional order: ${condType.replace("_", " ")} ${cv}`);
    }

    setAdvancedTicket(null);
  };

  const handleAdvancedSubmit = () => {
    if (!currentBar || qty <= 0) { toast.error("Set a valid quantity"); return; }
    // Build summary for the ticket modal
    const summary: AdvancedOrderSummary = {
      advancedType,
      ticker: currentTicker,
      quantity: qty,
      price,
      portfolioValue,
      cash,
      bracketEntry: parseFloat(bracketEntry) || price,
      bracketStop: parseFloat(bracketStop) || undefined,
      bracketTP: parseFloat(bracketTP) || undefined,
      ocoA: parseFloat(ocoA) || undefined,
      ocoB: parseFloat(ocoB) || undefined,
      trailAmount: parseFloat(trailAmount) || undefined,
      trailPercent: trailUsePercent ? parseFloat(trailPercent) || undefined : undefined,
      condType,
      condValue: parseFloat(condValue) || undefined,
      condLimitPrice: parseFloat(condLimitPrice) || price,
    };
    setAdvancedTicket(summary);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 p-3 transition-colors duration-500",
        tradeFlash === "buy" && "trade-flash-buy",
        tradeFlash === "sell" && "trade-flash-sell",
      )}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Order Entry
      </div>

      {/* Ticker & Price */}
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{currentTicker}</span>
        <span
          className={cn(
            "text-lg font-bold tabular-nums transition-colors duration-300",
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
              ? "bg-[#10b981] text-white shadow-[0_0_12px_rgba(16,185,129,0.35)]"
              : "text-muted-foreground hover:text-foreground",
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
              ? "bg-[#ef4444] text-white shadow-[0_0_12px_rgba(239,68,68,0.35)]"
              : "text-muted-foreground hover:text-foreground",
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
                  ? "bg-background text-foreground shadow-sm"
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
            placeholder={price > 0 ? (price * 0.95).toFixed(2) : "0.00"}
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            className="h-8 bg-background text-sm tabular-nums"
          />
        </div>
      )}
      {orderType === "take_profit" && (
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-[#10b981]" />
            Target Price
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder={price > 0 ? (price * 1.1).toFixed(2) : "0.00"}
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
          className="h-8 bg-background text-sm tabular-nums"
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
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
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
              className="tabular-nums font-medium"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Commission</span>
            <span className="tabular-nums">{formatCurrency(commission)}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Est. Slippage</span>
            <span className="tabular-nums">~{formatCurrency(price * qty * 0.00025)}</span>
          </div>
        </div>
      )}

      {/* Cash / Position info */}
      <div className="rounded-md bg-muted/50 p-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Cash Available</span>
          <span className="tabular-nums font-medium">{formatCurrency(cash)}</span>
        </div>
        {position && (
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Long Position</span>
            <span className="tabular-nums font-medium text-[#10b981]">{position.quantity} shares</span>
          </div>
        )}
        {shortPosition && (
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Short Position</span>
            <span className="tabular-nums font-medium text-[#ef4444]">{shortPosition.quantity} shares</span>
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
            "w-full font-semibold transition-all duration-200",
            orderType !== "market"
              ? "bg-[#f59e0b] hover:bg-[#d97706] text-white hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              : side === "buy"
                ? "bg-[#10b981] hover:bg-[#059669] text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "bg-[#ef4444] hover:bg-[#dc2626] text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]",
          )}
        >
          {orderType === "market"
            ? `${side === "buy" ? "BUY" : "SELL"} ${currentTicker}`
            : `PLACE ${orderType.replace("_", " ").toUpperCase()}`}
        </Button>
      </motion.div>

      {/* ═══════════════════ ADVANCED OPTIONS ═══════════════════ */}
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex items-center justify-between rounded-md border border-border/40 bg-muted/30 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <span className="inline-flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-[#f59e0b]" />
          Advanced Orders
        </span>
        {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      <AnimatePresence initial={false}>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 rounded-md border border-border/30 bg-muted/20 p-2.5">
              {/* Advanced type selector */}
              <div className="grid grid-cols-2 gap-1">
                {ADVANCED_ORDER_TYPES.map((at) => {
                  const Icon = at.icon;
                  return (
                    <button
                      key={at.value}
                      type="button"
                      onClick={() => setAdvancedType(at.value)}
                      className={cn(
                        "flex flex-col items-start rounded-md border px-2 py-1.5 text-left transition-all",
                        advancedType === at.value
                          ? "border-[#f59e0b]/60 bg-[#f59e0b]/10 text-[#f59e0b]"
                          : "border-border/30 text-muted-foreground hover:border-border hover:text-foreground",
                      )}
                    >
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
                        <Icon className="h-2.5 w-2.5" />
                        {at.label}
                      </span>
                      <span className="mt-0.5 text-[9px] leading-tight opacity-70">{at.description}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Bracket ── */}
              {advancedType === "bracket" && (
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                      Entry Price
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={price > 0 ? price.toFixed(2) : "0.00"}
                      value={bracketEntry}
                      onChange={(e) => setBracketEntry(e.target.value)}
                      className="h-7 bg-background text-xs tabular-nums"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 flex items-center gap-1 text-[10px] text-[#ef4444]">
                        <Shield className="h-2.5 w-2.5" /> Stop Loss
                      </label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={price > 0 ? (price * 0.95).toFixed(2) : "0.00"}
                          value={bracketStop}
                          onChange={(e) => setBracketStop(e.target.value)}
                          className="h-7 bg-background text-xs tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => setBracketStop(price > 0 ? (price * 0.95).toFixed(2) : "")}
                          className="shrink-0 rounded border border-[#ef4444]/30 px-1 text-[9px] text-[#ef4444] hover:bg-[#ef4444]/10"
                        >
                          -5%
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 flex items-center gap-1 text-[10px] text-[#10b981]">
                        <TrendingUp className="h-2.5 w-2.5" /> Take Profit
                      </label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={price > 0 ? (price * 1.1).toFixed(2) : "0.00"}
                          value={bracketTP}
                          onChange={(e) => setBracketTP(e.target.value)}
                          className="h-7 bg-background text-xs tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => setBracketTP(price > 0 ? (price * 1.1).toFixed(2) : "")}
                          className="shrink-0 rounded border border-[#10b981]/30 px-1 text-[9px] text-[#10b981] hover:bg-[#10b981]/10"
                        >
                          +10%
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* R:R display */}
                  {rrRatio !== null && (
                    <div className="flex items-center justify-between rounded bg-muted/50 px-2 py-1 text-[10px]">
                      <span className="text-muted-foreground">Risk : Reward</span>
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          rrRatio >= 2
                            ? "text-[#10b981]"
                            : rrRatio >= 1
                              ? "text-[#f59e0b]"
                              : "text-[#ef4444]",
                        )}
                      >
                        1 : {rrRatio.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Mini price ladder */}
                  {bStop > 0 && bTP > 0 && price > 0 && (
                    <PriceLadder entry={bEntry} stop={bStop} target={bTP} current={price} />
                  )}
                </div>
              )}

              {/* ── OCO ── */}
              {advancedType === "oco" && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    Set two levels. Price hits A → B is cancelled (breakout above resistance or bounce off support).
                  </p>
                  <div>
                    <label className="mb-1 block text-[10px] text-muted-foreground">
                      Level A — Buy Stop (above resistance)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={price > 0 ? (price * 1.02).toFixed(2) : "0.00"}
                      value={ocoA}
                      onChange={(e) => setOcoA(e.target.value)}
                      className="h-7 bg-background text-xs tabular-nums"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border/30" />
                    <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                    <div className="h-px flex-1 bg-border/30" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-muted-foreground">
                      Level B — Buy Limit (below support)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={price > 0 ? (price * 0.98).toFixed(2) : "0.00"}
                      value={ocoB}
                      onChange={(e) => setOcoB(e.target.value)}
                      className="h-7 bg-background text-xs tabular-nums"
                    />
                  </div>
                </div>
              )}

              {/* ── Trailing Stop ── */}
              {advancedType === "trailing_stop" && (
                <div className="space-y-2">
                  {/* % / $ toggle */}
                  <div className="flex rounded-md bg-muted p-0.5">
                    <button
                      type="button"
                      onClick={() => setTrailUsePercent(false)}
                      className={cn(
                        "flex-1 rounded py-1 text-[10px] font-medium transition-colors",
                        !trailUsePercent ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                      )}
                    >
                      $ Amount
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrailUsePercent(true)}
                      className={cn(
                        "flex-1 rounded py-1 text-[10px] font-medium transition-colors",
                        trailUsePercent ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                      )}
                    >
                      % Percent
                    </button>
                  </div>

                  {trailUsePercent ? (
                    <div>
                      <label className="mb-1 block text-[10px] text-muted-foreground">
                        Trail Percent (%)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="2.0"
                        value={trailPercent}
                        onChange={(e) => setTrailPercent(e.target.value)}
                        className="h-7 bg-background text-xs tabular-nums"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="mb-1 block text-[10px] text-muted-foreground">
                        Trail Amount ($)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder={price > 0 ? (price * 0.02).toFixed(2) : "1.00"}
                        value={trailAmount}
                        onChange={(e) => setTrailAmount(e.target.value)}
                        className="h-7 bg-background text-xs tabular-nums"
                      />
                    </div>
                  )}

                  {/* Real-time preview */}
                  {price > 0 && (trailAmt > 0 || trailPct > 0) && (
                    <div className="rounded-md bg-muted/50 p-2 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">If price = {formatCurrency(price)}</span>
                        <span className="text-muted-foreground">stop = </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">If price rises 5% → {formatCurrency(price * 1.05)}</span>
                        <span className="font-medium text-[#10b981]">
                          stop = {formatCurrency(
                            trailUsePercent && trailPct > 0
                              ? price * 1.05 * (1 - trailPct / 100)
                              : price * 1.05 - trailAmt,
                          )}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between border-t border-border/30 pt-1">
                        <span className="text-muted-foreground">Current stop</span>
                        <span className="font-semibold text-[#ef4444]">{formatCurrency(currentTrailStop)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Conditional (GTC) ── */}
              {advancedType === "conditional" && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    Order executes only when the market condition is met (Good-till-Cancelled).
                  </p>

                  {/* Condition type */}
                  <div>
                    <label className="mb-1 block text-[10px] text-muted-foreground">Condition</label>
                    <div className="grid grid-cols-3 gap-0.5 rounded-md bg-muted p-0.5">
                      {CONDITIONAL_TYPES.map((ct) => (
                        <button
                          key={ct.value}
                          type="button"
                          onClick={() => setCondType(ct.value)}
                          className={cn(
                            "rounded py-1 text-[9px] font-medium transition-colors",
                            condType === ct.value
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground",
                          )}
                        >
                          {ct.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] text-muted-foreground">
                      {condType === "volume_spike" ? "Min Volume" : "Trigger Price / Value"}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={price > 0 ? price.toFixed(2) : "0.00"}
                      value={condValue}
                      onChange={(e) => setCondValue(e.target.value)}
                      className="h-7 bg-background text-xs tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] text-muted-foreground">
                      Order Limit Price (when triggered)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={price > 0 ? price.toFixed(2) : "0.00"}
                      value={condLimitPrice}
                      onChange={(e) => setCondLimitPrice(e.target.value)}
                      className="h-7 bg-background text-xs tabular-nums"
                    />
                  </div>

                  {/* Order side for conditional */}
                  <div className="grid grid-cols-2 gap-0.5 rounded-md bg-muted p-0.5">
                    {(["buy", "sell"] as OrderSide[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCondSide(s)}
                        className={cn(
                          "rounded py-1 text-[10px] font-medium capitalize transition-colors",
                          condSide === s
                            ? s === "buy"
                              ? "bg-[#10b981] text-white"
                              : "bg-[#ef4444] text-white"
                            : "text-muted-foreground",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {parseFloat(condValue) > 0 && (
                    <div className="flex items-start gap-1.5 rounded-md bg-muted/50 p-2 text-[10px] text-muted-foreground">
                      <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-[#f59e0b]" />
                      <span>
                        Will {condSide} {qty} {currentTicker} @ market when{" "}
                        {condType.replace("_", " ")} {formatCurrency(parseFloat(condValue))}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Advanced Place Order button */}
              <Button
                onClick={handleAdvancedSubmit}
                disabled={!currentBar || qty <= 0 || price <= 0}
                className="w-full bg-[#f59e0b] text-xs font-semibold text-white hover:bg-[#d97706]"
                size="sm"
              >
                Preview &amp; Place {ADVANCED_ORDER_TYPES.find((a) => a.value === advancedType)?.label} Order
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation dialog (standard orders) */}
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

      {/* Advanced order ticket summary */}
      <AnimatePresence>
        {advancedTicket && (
          <AdvancedOrderTicket
            summary={advancedTicket}
            onConfirm={() => {
              handleAdvancedExecute();
            }}
            onCancel={() => setAdvancedTicket(null)}
          />
        )}
      </AnimatePresence>

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
