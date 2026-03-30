export type AlertCondition =
  | { type: "price_above"; value: number }
  | { type: "price_below"; value: number }
  | { type: "price_change_pct"; value: number; direction: "up" | "down" }
  | { type: "rsi_above"; value: number }
  | { type: "rsi_below"; value: number }
  | { type: "volume_spike"; multiplier: number }
  | { type: "macd_cross"; direction: "bullish" | "bearish" }
  | { type: "bollinger_touch"; band: "upper" | "lower" }
  | { type: "support_break"; level: number }
  | { type: "resistance_break"; level: number };

export interface Alert {
  id: string;
  ticker: string;
  condition: AlertCondition;
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
  message: string;
}

export function formatAlertCondition(condition: AlertCondition): string {
  switch (condition.type) {
    case "price_above":
      return `Price above $${condition.value.toFixed(2)}`;
    case "price_below":
      return `Price below $${condition.value.toFixed(2)}`;
    case "price_change_pct":
      return `Price ${condition.direction} ${condition.value.toFixed(1)}%`;
    case "rsi_above":
      return `RSI above ${condition.value}`;
    case "rsi_below":
      return `RSI below ${condition.value}`;
    case "volume_spike":
      return `Volume spike ${condition.multiplier}x average`;
    case "macd_cross":
      return `MACD ${condition.direction} crossover`;
    case "bollinger_touch":
      return `Bollinger ${condition.band} band touch`;
    case "support_break":
      return `Support break at $${condition.level.toFixed(2)}`;
    case "resistance_break":
      return `Resistance break at $${condition.level.toFixed(2)}`;
  }
}

export function checkAlert(
  alert: Alert,
  currentPrice: number,
  indicators?: Record<string, number>,
): boolean {
  if (alert.triggered) return false;

  const cond = alert.condition;

  switch (cond.type) {
    case "price_above":
      return currentPrice > cond.value;

    case "price_below":
      return currentPrice < cond.value;

    case "price_change_pct": {
      const changePct = indicators?.["changePct"] ?? 0;
      if (cond.direction === "up") {
        return changePct >= cond.value;
      }
      return changePct <= -cond.value;
    }

    case "rsi_above": {
      const rsi = indicators?.["rsi"];
      return rsi !== undefined && rsi > cond.value;
    }

    case "rsi_below": {
      const rsi = indicators?.["rsi"];
      return rsi !== undefined && rsi < cond.value;
    }

    case "volume_spike": {
      const volumeRatio = indicators?.["volumeRatio"];
      return volumeRatio !== undefined && volumeRatio >= cond.multiplier;
    }

    case "macd_cross": {
      const macdCross = indicators?.["macdCross"];
      // macdCross: 1 = bullish, -1 = bearish, 0 = none
      if (cond.direction === "bullish") {
        return macdCross === 1;
      }
      return macdCross === -1;
    }

    case "bollinger_touch": {
      const bbUpper = indicators?.["bbUpper"];
      const bbLower = indicators?.["bbLower"];
      if (cond.band === "upper" && bbUpper !== undefined) {
        return currentPrice >= bbUpper;
      }
      if (cond.band === "lower" && bbLower !== undefined) {
        return currentPrice <= bbLower;
      }
      return false;
    }

    case "support_break":
      return currentPrice < cond.level;

    case "resistance_break":
      return currentPrice > cond.level;
  }
}

export function generateAlertMessage(
  ticker: string,
  condition: AlertCondition,
  currentPrice: number,
): string {
  const desc = formatAlertCondition(condition);
  return `${ticker}: ${desc} triggered at $${currentPrice.toFixed(2)}`;
}
