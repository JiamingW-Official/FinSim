import type { RuleCatalogEntry } from "@/types/backtest";

export const RULE_CATALOG: RuleCatalogEntry[] = [
  // ── Momentum ───────────────────────────────────────────────
  {
    id: "rsi_oversold",
    label: "RSI Oversold (< 30)",
    description: "RSI drops below 30, signaling potential bounce",
    category: "momentum",
    rule: { id: "rsi_oversold", source: "rsi14", operator: "less_than", target: 30, label: "RSI < 30" },
  },
  {
    id: "rsi_overbought",
    label: "RSI Overbought (> 70)",
    description: "RSI rises above 70, signaling potential pullback",
    category: "momentum",
    rule: { id: "rsi_overbought", source: "rsi14", operator: "greater_than", target: 70, label: "RSI > 70" },
  },
  {
    id: "macd_cross_up",
    label: "MACD Crosses Above Signal",
    description: "MACD line crosses above signal line — bullish momentum",
    category: "momentum",
    rule: { id: "macd_cross_up", source: "macd_line", operator: "crosses_above", target: "macd_signal", label: "MACD ✕ Signal ↑" },
  },
  {
    id: "macd_cross_down",
    label: "MACD Crosses Below Signal",
    description: "MACD line crosses below signal line — bearish momentum",
    category: "momentum",
    rule: { id: "macd_cross_down", source: "macd_line", operator: "crosses_below", target: "macd_signal", label: "MACD ✕ Signal ↓" },
  },

  // ── Trend ──────────────────────────────────────────────────
  {
    id: "price_cross_sma20_up",
    label: "Price Crosses Above SMA 20",
    description: "Price breaks above the 20-bar moving average",
    category: "trend",
    rule: { id: "price_cross_sma20_up", source: "price", operator: "crosses_above", target: "sma20", label: "Price ✕ SMA20 ↑" },
  },
  {
    id: "price_cross_sma50_up",
    label: "Price Crosses Above SMA 50",
    description: "Price breaks above the 50-bar moving average — strong uptrend signal",
    category: "trend",
    rule: { id: "price_cross_sma50_up", source: "price", operator: "crosses_above", target: "sma50", label: "Price ✕ SMA50 ↑" },
  },
  {
    id: "ema_cross_up",
    label: "EMA 12 Crosses Above EMA 26",
    description: "Short EMA crosses above long EMA — trend acceleration",
    category: "trend",
    rule: { id: "ema_cross_up", source: "ema12", operator: "crosses_above", target: "ema26", label: "EMA12 ✕ EMA26 ↑" },
  },
  {
    id: "ema_cross_down",
    label: "EMA 12 Crosses Below EMA 26",
    description: "Short EMA crosses below long EMA — trend deceleration",
    category: "trend",
    rule: { id: "ema_cross_down", source: "ema12", operator: "crosses_below", target: "ema26", label: "EMA12 ✕ EMA26 ↓" },
  },

  // ── Mean Reversion ─────────────────────────────────────────
  {
    id: "price_below_boll_lower",
    label: "Price Below Lower Bollinger",
    description: "Price dips below lower Bollinger Band — potential snap-back",
    category: "mean-reversion",
    rule: { id: "price_below_boll_lower", source: "price", operator: "less_than", target: "bollinger_lower", label: "Price < BB Lower" },
  },
  {
    id: "price_above_boll_upper",
    label: "Price Above Upper Bollinger",
    description: "Price rises above upper Bollinger Band — potential reversion",
    category: "mean-reversion",
    rule: { id: "price_above_boll_upper", source: "price", operator: "greater_than", target: "bollinger_upper", label: "Price > BB Upper" },
  },

  // ── Volatility ─────────────────────────────────────────────
  {
    id: "price_cross_sma20_down",
    label: "Price Crosses Below SMA 20",
    description: "Price breaks below 20-bar MA — trend reversal warning",
    category: "volatility",
    rule: { id: "price_cross_sma20_down", source: "price", operator: "crosses_below", target: "sma20", label: "Price ✕ SMA20 ↓" },
  },
  {
    id: "price_cross_sma50_down",
    label: "Price Crosses Below SMA 50",
    description: "Price breaks below 50-bar MA — major trend shift",
    category: "volatility",
    rule: { id: "price_cross_sma50_down", source: "price", operator: "crosses_below", target: "sma50", label: "Price ✕ SMA50 ↓" },
  },
];

export const RULE_CATALOG_BY_ID = Object.fromEntries(
  RULE_CATALOG.map((r) => [r.id, r]),
);
