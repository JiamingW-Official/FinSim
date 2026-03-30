export interface JournalEntry {
  id: string;
  tradeId: string;
  ticker: string;
  side: "buy" | "sell";
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  notes: string;
  tags: string[];
  emotion: "confident" | "neutral" | "anxious" | "fomo" | "revenge";
  lessonLearned?: string;
  screenshot?: string;
  createdAt: number;
}

const TAG_SUGGESTIONS: Record<string, string[]> = {
  momentum: ["trend following", "momentum"],
  reversal: ["mean-reversion", "reversal"],
  breakout: ["breakout", "range expansion"],
  earnings: ["earnings", "catalyst"],
  technical: ["technical setup", "pattern"],
};

export function generateAutoJournal(
  ticker: string,
  side: string,
  price: number,
  pnl?: number,
  indicators?: string[],
): Partial<JournalEntry> {
  const tags: string[] = [];
  let notes = "";
  let emotion: JournalEntry["emotion"] = "neutral";

  // Infer tags from active indicators
  if (indicators) {
    if (
      indicators.includes("macd") ||
      indicators.includes("ema_12") ||
      indicators.includes("ema_26")
    ) {
      tags.push("momentum");
    }
    if (indicators.includes("rsi")) {
      tags.push("mean-reversion");
    }
    if (
      indicators.includes("bollinger") ||
      indicators.includes("bb")
    ) {
      tags.push("volatility");
    }
    if (indicators.includes("vwap") || indicators.includes("obv")) {
      tags.push("volume-based");
    }
    if (
      indicators.includes("sma_50") ||
      indicators.includes("sma_200") ||
      indicators.includes("ema_50") ||
      indicators.includes("ema_200")
    ) {
      tags.push("trend following");
    }
    if (indicators.includes("adx")) {
      tags.push("trend strength");
    }
    if (indicators.includes("psar")) {
      tags.push("trailing stop");
    }
  }

  if (tags.length === 0) {
    tags.push("discretionary");
  }

  // Generate notes based on context
  if (side === "buy" || side === "long") {
    notes = `Entered long ${ticker} at $${price.toFixed(2)}.`;
    if (indicators && indicators.length > 0) {
      notes += ` Active signals: ${indicators.slice(0, 3).join(", ")}.`;
    }
  } else {
    notes = `Closed ${ticker} position at $${price.toFixed(2)}.`;
    if (pnl !== undefined) {
      const pnlStr = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
      notes += ` P&L: ${pnlStr}.`;
    }
  }

  // Infer emotion from P&L context
  if (pnl !== undefined) {
    if (pnl > 0) {
      emotion = "confident";
    } else if (pnl < -50) {
      emotion = "anxious";
    }
  }

  // Generate lesson suggestions for closed trades
  let lessonLearned: string | undefined;
  if (pnl !== undefined) {
    if (pnl > 0) {
      lessonLearned =
        "Stuck to the plan and let the trade work. Patience paid off.";
    } else if (pnl > -20) {
      lessonLearned =
        "Small loss, good risk management. Review entry timing.";
    } else {
      lessonLearned =
        "Larger loss than expected. Review stop loss placement and position sizing.";
    }
  }

  return {
    ticker,
    side: side === "long" || side === "buy" ? "buy" : "sell",
    entryPrice: price,
    pnl,
    notes,
    tags,
    emotion,
    lessonLearned,
  };
}

export const AVAILABLE_TAGS = [
  "momentum",
  "mean-reversion",
  "breakout",
  "earnings",
  "volatility",
  "trend following",
  "trend strength",
  "volume-based",
  "trailing stop",
  "discretionary",
  "scalp",
  "swing",
  "day-trade",
  "news-driven",
  "gap-play",
];

export const EMOTION_OPTIONS: JournalEntry["emotion"][] = [
  "confident",
  "neutral",
  "anxious",
  "fomo",
  "revenge",
];
