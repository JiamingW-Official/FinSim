"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";

export interface TradeFeedback {
  type: "buy" | "sell";
  ticker: string;
  quantity: number;
  price: number;
  pnl?: number;
  pnlPercent?: number;
  avgCost?: number;
}

const BUY_TIPS = [
  "Watch RSI for overbought signals (>70) before buying.",
  "Check if the price is above VWAP — institutions consider below VWAP a better deal.",
  "Consider using a Limit order to control your entry price.",
  "Try adding a Stop-Loss right after buying to protect against downside.",
  "Diversify across different sectors to reduce risk.",
];

const PROFIT_TIPS = [
  "Setting a Take-Profit order can lock in gains automatically.",
  "Consider selling in portions — take partial profits and let the rest ride.",
  "Track your winning patterns in the History tab to improve consistency.",
  "A good risk/reward ratio is at least 1:2 — risking $1 to gain $2.",
];

const LOSS_TIPS = [
  "Consider using Stop-Loss orders to limit downside on future trades.",
  "Review your entry point — were there warning signs from indicators?",
  "Losses are normal — even the best traders have ~40-60% win rates.",
  "Try using RSI or MACD to time entries better and avoid buying at peaks.",
  "Position sizing matters — never risk more than 2% of your portfolio on one trade.",
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface TradeResultFeedbackProps {
  feedback: TradeFeedback | null;
  onDismiss: () => void;
}

export function TradeResultFeedback({
  feedback,
  onDismiss,
}: TradeResultFeedbackProps) {
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [feedback, onDismiss]);

  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          key={`${feedback.ticker}-${feedback.price}`}
          initial={{ opacity: 0, y: 12, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <FeedbackContent feedback={feedback} onDismiss={onDismiss} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FeedbackContent({
  feedback,
  onDismiss,
}: {
  feedback: TradeFeedback;
  onDismiss: () => void;
}) {
  const { type, ticker, quantity, price, pnl, pnlPercent, avgCost } = feedback;

  let summary: string;
  let tip: string;
  let borderColor: string;

  if (type === "buy") {
    summary = `Bought ${quantity} ${ticker} at ${formatCurrency(price)}.${avgCost ? ` Avg cost: ${formatCurrency(avgCost)}.` : ""}`;
    tip = pickRandom(BUY_TIPS);
    borderColor = "border-profit/30 bg-profit/5";
  } else if (pnl !== undefined && pnl >= 0) {
    summary = `Sold ${quantity} ${ticker} for ${formatCurrency(price)}. Profit: +${formatCurrency(pnl)} (${formatPercent(pnlPercent ?? 0)}).`;
    tip = pickRandom(PROFIT_TIPS);
    borderColor = "border-profit/30 bg-profit/5";
  } else {
    summary = `Sold ${quantity} ${ticker} for ${formatCurrency(price)}. Loss: ${formatCurrency(pnl ?? 0)} (${formatPercent(pnlPercent ?? 0)}).`;
    tip = pickRandom(LOSS_TIPS);
    borderColor = "border-loss/30 bg-loss/5";
  }

  return (
    <div className={`rounded-md border ${borderColor} p-2.5`}>
      <div className="flex items-start gap-2">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <div className="flex-1 space-y-1">
          <p className="text-[11px] font-medium text-foreground">{summary}</p>
          <p className="text-xs text-muted-foreground">
            Tip: {tip}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          title="Dismiss"
          className="shrink-0 rounded p-0.5 text-muted-foreground/50 hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
