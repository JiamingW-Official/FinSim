export type StrategyId =
  | "sma_crossover"
  | "rsi_reversion"
  | "breakout"
  | "macd_trend"
  | "bollinger_mean"
  | "mean_reversion_2std"
  | "momentum_3m"
  | "pairs_trading"
  | "trend_atr_stop"
  | "volatility_breakout";

export interface BacktestStrategy {
  id: StrategyId;
  name: string;
  description: string;
  type: "trend" | "mean-reversion" | "breakout" | "momentum" | "pairs" | "volatility";
  entryCondition: string;
  exitCondition: string;
  defaultParams: Record<string, number>;
  paramLabels: Record<string, string>;
}

export const BACKTEST_STRATEGIES: BacktestStrategy[] = [
  {
    id: "sma_crossover",
    name: "SMA Crossover",
    description: "Buy when fast SMA crosses above slow SMA, sell on opposite cross",
    type: "trend",
    entryCondition: "SMA(fast) crosses above SMA(slow)",
    exitCondition: "SMA(fast) crosses below SMA(slow)",
    defaultParams: { fastPeriod: 20, slowPeriod: 50 },
    paramLabels: { fastPeriod: "Fast SMA Period", slowPeriod: "Slow SMA Period" },
  },
  {
    id: "rsi_reversion",
    name: "RSI Mean Reversion",
    description: "Buy when RSI oversold, sell when RSI overbought",
    type: "mean-reversion",
    entryCondition: "RSI < oversoldLevel",
    exitCondition: "RSI > overboughtLevel",
    defaultParams: { period: 14, oversold: 30, overbought: 70 },
    paramLabels: { period: "RSI Period", oversold: "Oversold Level", overbought: "Overbought Level" },
  },
  {
    id: "breakout",
    name: "Donchian Breakout",
    description: "Buy on 20-day high breakout, stop on 10-day low",
    type: "breakout",
    entryCondition: "Close > 20-day high",
    exitCondition: "Close < 10-day low",
    defaultParams: { entryPeriod: 20, exitPeriod: 10 },
    paramLabels: { entryPeriod: "Entry Lookback", exitPeriod: "Exit Lookback" },
  },
  {
    id: "macd_trend",
    name: "MACD Trend Follow",
    description: "Buy on MACD histogram turning positive, sell on negative flip",
    type: "momentum",
    entryCondition: "MACD histogram > 0 (crossover)",
    exitCondition: "MACD histogram < 0 (crossunder)",
    defaultParams: { fast: 12, slow: 26, signal: 9 },
    paramLabels: { fast: "Fast EMA", slow: "Slow EMA", signal: "Signal Period" },
  },
  {
    id: "bollinger_mean",
    name: "Bollinger Band Reversion",
    description: "Buy on lower band touch, sell at middle band",
    type: "mean-reversion",
    entryCondition: "Close < BB lower band",
    exitCondition: "Close > BB middle band (SMA20)",
    defaultParams: { period: 20, stdDev: 2 },
    paramLabels: { period: "BB Period", stdDev: "Std Dev Multiplier" },
  },
  {
    id: "mean_reversion_2std",
    name: "Mean Reversion 2-Std",
    description: "Buy when price is more than 2 std deviations below SMA20; sell when 1 std above SMA20",
    type: "mean-reversion",
    entryCondition: "Close < SMA20 - 2*std",
    exitCondition: "Close > SMA20 + 1*std",
    defaultParams: { period: 20, entryStd: 2, exitStd: 1 },
    paramLabels: { period: "SMA Period", entryStd: "Entry Std Dev", exitStd: "Exit Std Dev" },
  },
  {
    id: "momentum_3m",
    name: "3-Month Momentum",
    description: "Buy when 63-bar return is in the top quartile vs prior window; monthly rebalance every 21 bars",
    type: "momentum",
    entryCondition: "63-bar return > 75th percentile (top quartile)",
    exitCondition: "63-bar return drops below median or rebalance cycle",
    defaultParams: { lookback: 63, rebalance: 21, window: 126 },
    paramLabels: { lookback: "Momentum Lookback", rebalance: "Rebalance Bars", window: "Ranking Window" },
  },
  {
    id: "pairs_trading",
    name: "Pairs Trading (Spread)",
    description: "Simulated spread mean-reversion: buy when spread > 2 sigma, exit when it reverts to mean",
    type: "pairs",
    entryCondition: "Spread z-score > 2 (buy) or < -2 (sell)",
    exitCondition: "Spread z-score crosses zero",
    defaultParams: { period: 20, entryZ: 2, exitZ: 0.5 },
    paramLabels: { period: "Spread Period", entryZ: "Entry Z-Score", exitZ: "Exit Z-Score" },
  },
  {
    id: "trend_atr_stop",
    name: "Trend + ATR Stop",
    description: "Buy on 20-day high breakout; hard stop at 2x ATR below entry; trail stop as price advances",
    type: "trend",
    entryCondition: "Close > 20-day high",
    exitCondition: "Close < (entry - 2 * ATR) or trailing stop hit",
    defaultParams: { breakoutPeriod: 20, atrPeriod: 14, atrMult: 2 },
    paramLabels: { breakoutPeriod: "Breakout Period", atrPeriod: "ATR Period", atrMult: "ATR Multiplier" },
  },
  {
    id: "volatility_breakout",
    name: "Volatility Breakout",
    description: "Buy when realized volatility (20-bar) spikes above threshold; hold for fixed 10 bars",
    type: "volatility",
    entryCondition: "20-bar realized vol > volThreshold",
    exitCondition: "Fixed 10-bar hold period",
    defaultParams: { volPeriod: 20, volThreshold: 25, holdBars: 10 },
    paramLabels: { volPeriod: "Vol Period", volThreshold: "Vol Threshold (%)", holdBars: "Hold Bars" },
  },
];

/** Look up a strategy by its ID. Returns undefined for unknown IDs. */
export function getStrategyById(id: StrategyId): BacktestStrategy | undefined {
  return BACKTEST_STRATEGIES.find((s) => s.id === id);
}
