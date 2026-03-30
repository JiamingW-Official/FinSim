"use client";

import { useState, useCallback } from "react";
import { useChartStore } from "@/stores/chart-store";
import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useGameStore } from "@/stores/game-store";
import { useClockStore } from "@/stores/clock-store";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  TrendingUp,
  Shield,
  Zap,
  Target,
  GitBranch,
  ArrowLeftRight,
  Activity,
  Clock,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import type { OrderSide, OrderType, ConditionalTriggerType } from "@/types/trading";
import { TradeConfirmDialog } from "./TradeConfirmDialog";
import { TradeResultFeedback, type TradeFeedback } from "@/components/education/TradeResultFeedback";
import { RiskMeter } from "@/components/education/RiskMeter";
import { soundEngine } from "@/services/audio/sound-engine";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdvancedOrderType = "bracket" | "oco" | "trailing_stop" | "conditional";

const ORDER_TYPES: { value: OrderType; label: string; icon: typeof Zap }[] = [
  { value: "market", label: "Mkt", icon: Zap },
  { value: "limit", label: "Lmt", icon: Target },
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
  { value: "volume_spike", label: "Vol ≥" },
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
    <div className="relative h-20 rounded border border-border/30 bg-muted/20 px-2 py-1">
      <div
        className="absolute left-0 right-0 border-t border-dashed border-primary/30"
        style={{ top: `${((max - current) / range) * 100}%` }}
      />
      {levels.map((l) => (
        <div
          key={l.label}
          className="absolute left-2 right-2 flex items-center justify-between"
          style={{ top: `${((max - l.price) / range) * 100}%`, transform: "translateY(-50%)" }}
        >
          <span
            className="rounded px-1 text-[10px] font-mono font-semibold text-white"
            style={{ background: l.color + "cc" }}
          >
            {l.label}
          </span>
          <span className="text-[10px] font-mono tabular-nums" style={{ color: l.color }}>
            {formatCurrency(l.price)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Advanced Order Ticket ────────────────────────────────────────────────────

interface AdvancedOrderSummary {
  advancedType: AdvancedOrderType;
  ticker: string;
  quantity: number;
  price: number;
  portfolioValue: number;
  cash: number;
  bracketEntry?: number;
  bracketStop?: number;
  bracketTP?: number;
  ocoA?: number;
  ocoB?: number;
  trailAmount?: number;
  trailPercent?: number;
  condType?: ConditionalTriggerType;
  condValue?: number;
  condLimitPrice?: number;
}

function TicketRow({
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
  const valueClass =
    colored === "red"
      ? "text-rose-400"
      : colored === "green"
      ? "text-emerald-400"
      : colored === "amber"
      ? "text-amber-400"
      : muted
      ? "text-muted-foreground/60"
      : "text-foreground/80";
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-[11px] font-mono", muted ? "text-muted-foreground/50" : "text-muted-foreground/70")}>
        {label}
      </span>
      <span className={cn("text-[11px] font-mono tabular-nums", valueClass)}>{value}</span>
    </div>
  );
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
      <div className="w-full max-w-xs rounded border border-border bg-background">
        {/* Header */}
        <div className="border-b border-border/20 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
              Order Ticket
            </span>
            <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/70">
              {advancedType.replace("_", " ")}
            </span>
          </div>
          <div className="mt-1 text-[12px] font-mono font-semibold text-foreground/90">
            {ticker} &middot; {quantity} shares
          </div>
        </div>

        <div className="space-y-2.5 p-3">
          <div className="space-y-1.5 rounded border border-border/20 bg-muted/20 p-2.5">
            {advancedType === "bracket" && (
              <>
                <TicketRow label="Entry" value={formatCurrency(summary.bracketEntry ?? price)} />
                <TicketRow label="Stop Loss" value={formatCurrency(summary.bracketStop ?? 0)} colored="red" />
                <TicketRow label="Take Profit" value={formatCurrency(summary.bracketTP ?? 0)} colored="green" />
                {rrRatio && (
                  <TicketRow label="Risk:Reward" value={`1 : ${rrRatio.toFixed(2)}`} colored="amber" />
                )}
              </>
            )}
            {advancedType === "oco" && (
              <>
                <TicketRow label="Buy Stop (A)" value={formatCurrency(summary.ocoA ?? 0)} />
                <TicketRow label="Buy Limit (B)" value={formatCurrency(summary.ocoB ?? 0)} />
              </>
            )}
            {advancedType === "trailing_stop" && (
              <>
                <TicketRow
                  label="Trail"
                  value={summary.trailPercent ? `${summary.trailPercent}%` : formatCurrency(summary.trailAmount ?? 0)}
                />
                <TicketRow
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
                <TicketRow
                  label="Condition"
                  value={`${summary.condType?.replace("_", " ")} ${summary.condValue}`}
                />
                <TicketRow label="Limit Price" value={formatCurrency(summary.condLimitPrice ?? price)} />
              </>
            )}
            <div className="border-t border-border/20 pt-1.5">
              <TicketRow label="Est. Cost" value={formatCurrency(estimatedCost)} />
              <TicketRow label="% of Portfolio" value={`${pctOfPortfolio.toFixed(1)}%`} muted />
              {maxLoss && <TicketRow label="Max Loss" value={formatCurrency(maxLoss)} colored="red" />}
              <TicketRow label="Cash Available" value={formatCurrency(cash)} muted />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { soundEngine.playClick(); onCancel(); }}
              className="flex-1 h-8 text-[11px] font-mono"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => { soundEngine.playClick(); onConfirm(); }}
              className="flex-1 h-8 text-[11px] font-mono font-semibold"
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type TradeMode = "buy" | "sell" | "short";

export function OrderEntry() {
  // Standard order state
  const [tradeMode, setTradeMode] = useState<TradeMode>("buy");
  const side: OrderSide = tradeMode === "buy" ? "buy" : "sell";
  const setSide = (s: OrderSide) => setTradeMode(s === "buy" ? "buy" : "sell");
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

  // Advanced order ticket
  const [advancedTicket, setAdvancedTicket] = useState<AdvancedOrderSummary | null>(null);

  // Market session
  const marketSession = useClockStore((s) => s.marketSession);
  const isMarketOpen = marketSession === "open";
  const isExtendedHours = marketSession === "pre-market" || marketSession === "after-hours";

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
  const coverShortOrder = useTradingStore((s) => s.coverShortOrder);
  const borrowRates = useTradingStore((s) => s.borrowRates);
  const recordTrade = useGameStore((s) => s.recordTrade);
  const borrowRate = borrowRates[currentTicker] ?? 1.0;

  const price = currentBar?.close ?? 0;
  const qty = Math.max(0, parseInt(quantity) || 0);
  const estimatedCost = qty * price;
  const commission = Math.max(1, qty * 0.01);

  const position = positions.find((p) => p.ticker === currentTicker && p.side === "long");
  const shortPosition = positions.find((p) => p.ticker === currentTicker && p.side === "short");

  // Validation
  const canExecuteMarket =
    orderType === "market" &&
    (isMarketOpen || isExtendedHours) &&
    qty > 0 &&
    price > 0 &&
    (tradeMode === "buy"
      ? estimatedCost + commission <= cash || (shortPosition?.quantity ?? 0) > 0
      : tradeMode === "sell"
      ? (position?.quantity ?? 0) > 0
      : true);
  const canExecuteLimit = orderType === "limit" && qty > 0 && parseFloat(limitPrice) > 0;
  const canExecuteStop =
    orderType === "stop_loss" && qty > 0 && parseFloat(stopPrice) > 0 && !!(position || shortPosition);
  const canExecuteTP =
    orderType === "take_profit" && qty > 0 && parseFloat(takeProfitPrice) > 0 && !!(position || shortPosition);
  const canExecute = canExecuteMarket || canExecuteLimit || canExecuteStop || canExecuteTP;

  // Bracket computed values
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

  // ─── Standard order execution ───────────────────────────────────────────────

  const handleExecute = () => {
    if (!currentBar) return;
    const simDate = currentBar.timestamp;

    if (orderType === "market") {
      if (tradeMode === "buy") {
        if (shortPosition && shortPosition.quantity > 0) {
          const coverQty = Math.min(qty, shortPosition.quantity);
          const order = coverShortOrder(currentTicker, coverQty, price, simDate);
          if (order) {
            triggerTradeFlash("buy");
            soundEngine.playBuy();
            toast.success(`Covered ${coverQty} ${currentTicker} short @ ${formatCurrency(order.avgFillPrice)}`);
            recordTrade(shortPosition.unrealizedPnL * (coverQty / shortPosition.quantity), currentTicker, false, false);
          }
          const remainingBuy = qty - coverQty;
          if (remainingBuy > 0) {
            const buyOrder = placeBuyOrder(currentTicker, remainingBuy, price, simDate);
            if (buyOrder) {
              triggerTradeFlash("buy");
              soundEngine.playBuy();
              toast.success(`Bought ${remainingBuy} ${currentTicker} @ ${formatCurrency(buyOrder.avgFillPrice)}`);
            }
          }
        } else {
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
        }
      } else if (tradeMode === "sell") {
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
          soundEngine.playError();
          toast.error("No long position to sell. Use SHORT to borrow and short sell.");
        }
      } else {
        const order = placeShortOrder(currentTicker, qty, price, simDate);
        if (order) {
          triggerTradeFlash("sell");
          soundEngine.playSell();
          toast.success(`Short sold ${qty} ${currentTicker} @ ${formatCurrency(order.avgFillPrice)}`);
          recordTrade(0, currentTicker, true, false);
          setTradeFeedback({
            type: "sell",
            ticker: currentTicker,
            quantity: qty,
            price: order.avgFillPrice,
          });
        } else {
          soundEngine.playError();
          toast.error("Could not place short order");
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

  // ─── Advanced order execution ───────────────────────────────────────────────

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

  // Price change for header
  const prevBar = allData.length > 0 && revealedCount > 1 ? allData[revealedCount - 2] : null;
  const changeAmt = prevBar ? price - prevBar.close : 0;
  const changePct = prevBar && prevBar.close > 0 ? (changeAmt / prevBar.close) * 100 : 0;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        "flex flex-col transition-colors",
        tradeFlash === "buy" && "trade-flash-buy",
        tradeFlash === "sell" && "trade-flash-sell",
      )}
    >
      {/* ── Header: ticker + price + session ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/20">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-mono font-bold tracking-tight leading-none">{currentTicker}</span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
            {marketSession === "open"
              ? "Regular Hrs"
              : marketSession === "pre-market"
              ? "Pre-Market"
              : marketSession === "after-hours"
              ? "After-Hours"
              : "Closed"}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[14px] font-mono font-bold tabular-nums leading-none">
            {price > 0 ? `$${price.toFixed(2)}` : "---"}
          </span>
          <span
            className={cn(
              "text-[10px] font-mono tabular-nums leading-none",
              changeAmt >= 0 ? "text-emerald-400/80" : "text-rose-400/70",
            )}
          >
            {changeAmt >= 0 ? "+" : ""}
            {changeAmt.toFixed(2)} ({changePct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* ── Inner content ── */}
      <div className="flex flex-col gap-2.5 px-3 py-2.5">

        {/* Buy / Sell / Short — pill segmented control */}
        <div className="flex rounded overflow-hidden border border-border/30">
          {(["buy", "sell", "short"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTradeMode(mode)}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest transition-colors border-r border-border/20 last:border-r-0",
                tradeMode === mode
                  ? mode === "buy"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : mode === "sell"
                    ? "bg-rose-500/12 text-rose-400"
                    : "bg-purple-500/12 text-purple-400"
                  : "bg-transparent text-muted-foreground/25 hover:text-muted-foreground/55",
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Short mode info — subtle strip */}
        {tradeMode === "short" && (
          <div className="border-l-2 border-l-orange-500/40 pl-2.5 py-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground/60">Borrow Rate</span>
              <span className="text-[10px] font-mono font-semibold tabular-nums text-orange-400">
                {borrowRate.toFixed(2)}% / yr
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground/50">Daily Cost</span>
              <span className="text-[10px] font-mono tabular-nums text-muted-foreground/60">
                {qty > 0 && price > 0
                  ? formatCurrency(qty * price * (borrowRate / 100 / 365))
                  : "—"}
              </span>
            </div>
            {shortPosition && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground/50">Short Position</span>
                <span className="text-[10px] font-mono tabular-nums text-orange-400">
                  {shortPosition.quantity} @ {formatCurrency(shortPosition.avgPrice)}
                </span>
              </div>
            )}
            <div className="flex items-start gap-1 pt-0.5">
              <AlertTriangle className="mt-px h-2.5 w-2.5 shrink-0 text-rose-400/60" />
              <span className="text-[9px] font-mono text-rose-400/60 leading-snug">
                Unlimited loss potential — price can rise indefinitely.
              </span>
            </div>
          </div>
        )}

        {/* Order type pills */}
        <div className="flex items-center gap-1">
          {ORDER_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setOrderType(value)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-widest transition-colors",
                orderType === value
                  ? "bg-foreground/10 text-foreground/80 font-semibold"
                  : "text-muted-foreground/30 hover:text-muted-foreground/60",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Limit price input */}
        {orderType === "limit" && (
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 block mb-0.5">
              Limit Price
            </span>
            <div className="flex items-center gap-2 rounded border border-border/40 px-2 py-1.5 focus-within:border-primary/40 bg-muted/5">
              <span className="text-[9px] font-mono text-muted-foreground/40">$</span>
              <input
                id="order-limit-price"
                type="number"
                step="0.01"
                placeholder={price > 0 ? price.toFixed(2) : "0.00"}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="flex-1 bg-transparent text-[12px] font-mono tabular-nums text-foreground outline-none"
              />
            </div>
          </div>
        )}

        {/* Stop price input */}
        {orderType === "stop_loss" && (
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 block mb-0.5">
              Stop Price
            </span>
            <div className="flex items-center gap-2 rounded border border-border/40 px-2 py-1.5 focus-within:border-primary/40 bg-muted/5">
              <span className="text-[9px] font-mono text-muted-foreground/40">$</span>
              <input
                id="order-stop-price"
                type="number"
                step="0.01"
                placeholder={price > 0 ? (price * 0.95).toFixed(2) : "0.00"}
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                className="flex-1 bg-transparent text-[12px] font-mono tabular-nums text-foreground outline-none"
              />
            </div>
          </div>
        )}

        {/* Take profit price input */}
        {orderType === "take_profit" && (
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 block mb-0.5">
              Target Price
            </span>
            <div className="flex items-center gap-2 rounded border border-border/40 px-2 py-1.5 focus-within:border-primary/40 bg-muted/5">
              <span className="text-[9px] font-mono text-muted-foreground/40">$</span>
              <input
                id="order-target-price"
                type="number"
                step="0.01"
                placeholder={price > 0 ? (price * 1.1).toFixed(2) : "0.00"}
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
                className="flex-1 bg-transparent text-[12px] font-mono tabular-nums text-foreground outline-none"
              />
            </div>
          </div>
        )}

        {/* Quantity input */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
              Quantity
            </span>
            <button
              type="button"
              onClick={() => {
                if (price > 0 && cash > 0) {
                  const maxShares = Math.floor((cash - 1) / price);
                  if (maxShares > 0) setQuantity(String(maxShares));
                }
              }}
              className="text-[9px] font-mono text-primary/40 hover:text-primary/70 transition-colors"
            >
              MAX
            </button>
          </div>
          <div className="flex items-center gap-2 rounded border border-border/40 px-2 py-1.5 focus-within:border-primary/40 bg-muted/5">
            <input
              id="order-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="flex-1 bg-transparent text-[13px] font-mono tabular-nums text-foreground outline-none"
              placeholder="0"
              min="1"
            />
            <span className="text-[9px] font-mono text-muted-foreground/30">shares</span>
          </div>
        </div>

        {/* Quick quantity buttons */}
        <div className="flex gap-1">
          {[1, 5, 10, 25, 50, 100].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuantity(String(q))}
              className={cn(
                "flex-1 rounded py-1 text-[10px] font-mono font-medium transition-all duration-100 active:scale-95",
                parseInt(quantity) === q
                  ? "bg-foreground/8 text-foreground/80 border border-foreground/15"
                  : "border border-border/30 text-muted-foreground/40 hover:border-border/60 hover:text-foreground/60",
              )}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Estimated cost summary — market orders only */}
        {orderType === "market" && price > 0 && qty > 0 && (
          <div className="border-t border-border/20 pt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
                {tradeMode === "buy" ? "Est. Cost" : tradeMode === "short" ? "Short Proceeds" : "Est. Proceeds"}
              </span>
              <span className="text-[11px] font-mono font-semibold tabular-nums text-foreground/80">
                {formatCurrency(estimatedCost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-muted-foreground/30">Commission</span>
              <span className="text-[9px] font-mono tabular-nums text-muted-foreground/40">
                {formatCurrency(commission)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-muted-foreground/30">Est. Slippage</span>
              <span className="text-[9px] font-mono tabular-nums text-muted-foreground/40">
                ~{formatCurrency(price * qty * 0.00025)}
              </span>
            </div>
          </div>
        )}

        {/* Cash / position info */}
        <div className="border-t border-border/20 pt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-muted-foreground/40">Cash</span>
            <span className="text-[11px] font-mono font-medium tabular-nums">{formatCurrency(cash)}</span>
          </div>
          {position && (
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-muted-foreground/40">Long</span>
              <span className="text-[11px] font-mono font-medium tabular-nums text-emerald-400">
                {position.quantity} shares
              </span>
            </div>
          )}
          {shortPosition && (
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-muted-foreground/40">Short</span>
              <span className="text-[11px] font-mono font-medium tabular-nums text-rose-400">
                {shortPosition.quantity} shares
              </span>
            </div>
          )}
        </div>

        {/* Risk meter */}
        {orderType === "market" && side === "buy" && qty > 0 && price > 0 && (
          <RiskMeter
            ticker={currentTicker}
            quantity={qty}
            price={price}
            portfolioValue={portfolioValue}
            existingPositionValue={position ? position.quantity * price : 0}
          />
        )}

        {/* Session banner — subtle strip */}
        {orderType === "market" && (
          <div
            className={cn(
              "border-l-2 pl-2 py-0.5",
              isMarketOpen
                ? "border-l-emerald-500/50"
                : isExtendedHours
                ? "border-l-amber-500/50"
                : "border-l-border/40",
            )}
          >
            {isMarketOpen && (
              <span className="text-[9px] font-mono text-emerald-400/70">
                Market open &middot; 09:30–16:00 ET
              </span>
            )}
            {marketSession === "pre-market" && (
              <span className="text-[9px] font-mono text-amber-400/70">
                Pre-market &middot; extended hours 04:00–09:30 ET
              </span>
            )}
            {marketSession === "after-hours" && (
              <span className="text-[9px] font-mono text-sky-400/70">
                After-hours &middot; extended trading 16:00–20:00 ET
              </span>
            )}
            {marketSession === "closed" && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-2.5 w-2.5 text-muted-foreground/40" />
                <span className="text-[9px] font-mono text-muted-foreground/40">Market closed</span>
              </div>
            )}
          </div>
        )}

        {/* Execute button */}
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={!canExecute}
          className={cn(
            "w-full h-9 font-mono font-semibold text-[12px] tracking-wide mt-0.5",
            tradeMode === "buy"
              ? isExtendedHours
                ? "bg-amber-500/80 hover:bg-amber-500 text-white"
                : "bg-emerald-500 hover:bg-emerald-400 text-white"
              : tradeMode === "short"
              ? "bg-purple-500 hover:bg-purple-400 text-white"
              : isExtendedHours
              ? "bg-rose-500/80 hover:bg-rose-500 text-white"
              : "bg-rose-500 hover:bg-rose-400 text-white",
          )}
        >
          {orderType === "market" && !isMarketOpen && !isExtendedHours
            ? "Market Closed"
            : orderType === "market"
            ? tradeMode === "buy"
              ? `Buy ${currentTicker}`
              : tradeMode === "short"
              ? `Short ${currentTicker}`
              : `Sell ${currentTicker}`
            : `Place ${orderType.replace("_", " ")}`}
        </Button>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex w-full items-center justify-between py-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/25 hover:text-muted-foreground/50 transition-colors border-t border-border/15 pt-2"
        >
          <span>Advanced Orders</span>
          <span className="text-[11px]">{showAdvanced ? "−" : "+"}</span>
        </button>

        {/* Advanced section */}
        {showAdvanced && (
          <div className="space-y-2.5 rounded border border-border/25 bg-muted/15 p-2.5">
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
                      "flex flex-col items-start rounded border px-2 py-1.5 text-left transition-colors",
                      advancedType === at.value
                        ? "border-amber-500/50 bg-amber-500/8 text-amber-400"
                        : "border-border/25 text-muted-foreground/60 hover:text-foreground/70",
                    )}
                  >
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wide">
                      <Icon className="h-2.5 w-2.5" />
                      {at.label}
                    </span>
                    <span className="mt-0.5 text-[9px] font-mono opacity-60 leading-snug">
                      {at.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bracket */}
            {advancedType === "bracket" && (
              <div className="space-y-2">
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 block mb-0.5">
                    Entry Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={price > 0 ? price.toFixed(2) : "0.00"}
                    value={bracketEntry}
                    onChange={(e) => setBracketEntry(e.target.value)}
                    className="h-7 bg-background text-[11px] font-mono tabular-nums"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-mono text-rose-400/70 block mb-0.5">
                      Stop Loss
                    </label>
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={price > 0 ? (price * 0.95).toFixed(2) : "0.00"}
                        value={bracketStop}
                        onChange={(e) => setBracketStop(e.target.value)}
                        className="h-7 bg-background text-[11px] font-mono tabular-nums"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setBracketStop(price > 0 ? (price * 0.95).toFixed(2) : "")}
                        className="shrink-0 text-[9px] font-mono"
                      >
                        −5%
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-emerald-400/70 block mb-0.5">
                      Take Profit
                    </label>
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={price > 0 ? (price * 1.1).toFixed(2) : "0.00"}
                        value={bracketTP}
                        onChange={(e) => setBracketTP(e.target.value)}
                        className="h-7 bg-background text-[11px] font-mono tabular-nums"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setBracketTP(price > 0 ? (price * 1.1).toFixed(2) : "")}
                        className="shrink-0 text-[9px] font-mono"
                      >
                        +10%
                      </Button>
                    </div>
                  </div>
                </div>

                {rrRatio !== null && (
                  <div className="flex items-center justify-between rounded bg-muted/30 px-2 py-1">
                    <span className="text-[9px] font-mono text-muted-foreground/50">Risk : Reward</span>
                    <span
                      className={cn(
                        "text-[11px] font-mono font-semibold tabular-nums",
                        rrRatio >= 2
                          ? "text-emerald-400/80"
                          : rrRatio >= 1
                          ? "text-amber-400"
                          : "text-rose-400",
                      )}
                    >
                      1 : {rrRatio.toFixed(2)}
                    </span>
                  </div>
                )}

                {bStop > 0 && bTP > 0 && price > 0 && (
                  <PriceLadder entry={bEntry} stop={bStop} target={bTP} current={price} />
                )}
              </div>
            )}

            {/* OCO */}
            {advancedType === "oco" && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-muted-foreground/50 leading-snug">
                  Level A fills → Level B is cancelled. Use for breakout or bounce.
                </p>
                <div>
                  <label className="text-[9px] font-mono text-muted-foreground/40 block mb-0.5">
                    Level A — Buy Stop (above resistance)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={price > 0 ? (price * 1.02).toFixed(2) : "0.00"}
                    value={ocoA}
                    onChange={(e) => setOcoA(e.target.value)}
                    className="h-7 bg-background text-[11px] font-mono tabular-nums"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border/20" />
                  <ArrowLeftRight className="h-3 w-3 text-muted-foreground/30" />
                  <div className="h-px flex-1 bg-border/20" />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-muted-foreground/40 block mb-0.5">
                    Level B — Buy Limit (below support)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={price > 0 ? (price * 0.98).toFixed(2) : "0.00"}
                    value={ocoB}
                    onChange={(e) => setOcoB(e.target.value)}
                    className="h-7 bg-background text-[11px] font-mono tabular-nums"
                  />
                </div>
              </div>
            )}

            {/* Trailing Stop */}
            {advancedType === "trailing_stop" && (
              <div className="space-y-2">
                <div className="flex rounded bg-muted/40 p-0.5">
                  <button
                    type="button"
                    onClick={() => setTrailUsePercent(false)}
                    className={cn(
                      "flex-1 rounded py-1 text-[10px] font-mono transition-colors",
                      !trailUsePercent ? "bg-background text-foreground/80" : "text-muted-foreground/50",
                    )}
                  >
                    $ Amount
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrailUsePercent(true)}
                    className={cn(
                      "flex-1 rounded py-1 text-[10px] font-mono transition-colors",
                      trailUsePercent ? "bg-background text-foreground/80" : "text-muted-foreground/50",
                    )}
                  >
                    % Percent
                  </button>
                </div>

                {trailUsePercent ? (
                  <div>
                    <label className="text-[9px] font-mono text-muted-foreground/40 block mb-0.5">
                      Trail Percent (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="2.0"
                      value={trailPercent}
                      onChange={(e) => setTrailPercent(e.target.value)}
                      className="h-7 bg-background text-[11px] font-mono tabular-nums"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[9px] font-mono text-muted-foreground/40 block mb-0.5">
                      Trail Amount ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder={price > 0 ? (price * 0.02).toFixed(2) : "1.00"}
                      value={trailAmount}
                      onChange={(e) => setTrailAmount(e.target.value)}
                      className="h-7 bg-background text-[11px] font-mono tabular-nums"
                    />
                  </div>
                )}

                {price > 0 && (trailAmt > 0 || trailPct > 0) && (
                  <div className="rounded border border-border/20 bg-muted/20 p-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[9px] font-mono text-muted-foreground/45">
                        If price → {formatCurrency(price * 1.05)}
                      </span>
                      <span className="text-[9px] font-mono font-medium text-emerald-400/80">
                        stop = {formatCurrency(
                          trailUsePercent && trailPct > 0
                            ? price * 1.05 * (1 - trailPct / 100)
                            : price * 1.05 - trailAmt,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border/15 pt-1">
                      <span className="text-[9px] font-mono text-muted-foreground/45">Current stop</span>
                      <span className="text-[9px] font-mono font-semibold text-rose-400">
                        {formatCurrency(currentTrailStop)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Conditional (GTC) */}
            {advancedType === "conditional" && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-muted-foreground/50 leading-snug">
                  Executes when market condition is met (Good-till-Cancelled).
                </p>
                <div>
                  <label className="text-[9px] font-mono text-muted-foreground/40 block mb-0.5">
                    Condition
                  </label>
                  <div className="grid grid-cols-3 gap-0.5 rounded bg-muted/40 p-0.5">
                    {CONDITIONAL_TYPES.map((ct) => (
                      <button
                        key={ct.value}
                        type="button"
                        onClick={() => setCondType(ct.value)}
                        className={cn(
                          "rounded py-1 text-[10px] font-mono transition-colors",
                          condType === ct.value
                            ? "bg-background text-foreground/80"
                            : "text-muted-foreground/50",
                        )}
                      >
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-mono text-muted-foreground/40 block mb-0.5">
                    {condType === "volume_spike" ? "Min Volume" : "Trigger Value"}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={price > 0 ? price.toFixed(2) : "0.00"}
                    value={condValue}
                    onChange={(e) => setCondValue(e.target.value)}
                    className="h-7 bg-background text-[11px] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-muted-foreground/40 block mb-0.5">
                    Limit Price (when triggered)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={price > 0 ? price.toFixed(2) : "0.00"}
                    value={condLimitPrice}
                    onChange={(e) => setCondLimitPrice(e.target.value)}
                    className="h-7 bg-background text-[11px] font-mono tabular-nums"
                  />
                </div>
                <div className="grid grid-cols-2 gap-0.5 rounded bg-muted/40 p-0.5">
                  {(["buy", "sell"] as OrderSide[]).map((s) => (
                    <Button
                      key={s}
                      type="button"
                      size="sm"
                      variant={condSide === s ? (s === "buy" ? "default" : "destructive") : "ghost"}
                      onClick={() => setCondSide(s)}
                      className="text-[10px] font-mono capitalize"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
                {parseFloat(condValue) > 0 && (
                  <div className="flex items-start gap-1.5 rounded border border-border/20 bg-muted/20 p-2">
                    <AlertCircle className="mt-0.5 h-2.5 w-2.5 shrink-0 text-amber-400/70" />
                    <span className="text-[9px] font-mono text-muted-foreground/60 leading-snug">
                      Will {condSide} {qty} {currentTicker} when{" "}
                      {condType.replace("_", " ")} {formatCurrency(parseFloat(condValue))}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Advanced submit */}
            <Button
              onClick={handleAdvancedSubmit}
              disabled={!currentBar || qty <= 0 || price <= 0}
              variant="default"
              className="w-full h-8 text-[10px] font-mono font-semibold uppercase tracking-wide"
              size="sm"
            >
              Preview &amp; Place {ADVANCED_ORDER_TYPES.find((a) => a.value === advancedType)?.label}
            </Button>
          </div>
        )}

        {/* Keyboard hints */}
        <div className="flex justify-center gap-3 pt-1">
          <span className="text-[9px] font-mono text-muted-foreground/25">Space: Play</span>
          <span className="text-[9px] font-mono text-muted-foreground/25">→: Step</span>
          <span className="text-[9px] font-mono text-muted-foreground/25">1-4: Speed</span>
        </div>
      </div>

      {/* Confirm dialog */}
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

      {/* Advanced order ticket */}
      {advancedTicket && (
        <AdvancedOrderTicket
          summary={advancedTicket}
          onConfirm={() => {
            handleAdvancedExecute();
          }}
          onCancel={() => setAdvancedTicket(null)}
        />
      )}

      {/* Trade result feedback */}
      <TradeResultFeedback
        feedback={tradeFeedback}
        onDismiss={() => setTradeFeedback(null)}
      />
    </div>
  );
}
