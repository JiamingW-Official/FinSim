import type { IndicatorType } from "@/stores/chart-store";

export interface IndicatorExplanation {
  name: string;
  shortDesc: string;
  howToRead: string;
  bullSignal: string;
  bearSignal: string;
  bestFor: string;
}

export const INDICATOR_EXPLANATIONS: Record<
  IndicatorType,
  IndicatorExplanation
> = {
  sma20: {
    name: "SMA 20",
    shortDesc: "20-period Simple Moving Average",
    howToRead:
      "The SMA 20 smooths price over the last 20 bars. When price is above the SMA, the short-term trend is up. When below, the trend is down.",
    bullSignal: "Price crosses above SMA 20 (short-term uptrend starting)",
    bearSignal: "Price crosses below SMA 20 (short-term downtrend starting)",
    bestFor: "Identifying short-term trend direction",
  },
  sma50: {
    name: "SMA 50",
    shortDesc: "50-period Simple Moving Average",
    howToRead:
      "The SMA 50 shows the medium-term trend. A 'Golden Cross' (SMA 20 crosses above SMA 50) is a strong bullish signal. A 'Death Cross' (SMA 20 below SMA 50) is bearish.",
    bullSignal: "Price above SMA 50 or Golden Cross forming",
    bearSignal: "Price below SMA 50 or Death Cross forming",
    bestFor: "Confirming medium-term trends and crossover signals",
  },
  ema12: {
    name: "EMA 12",
    shortDesc: "12-period Exponential Moving Average",
    howToRead:
      "The EMA 12 reacts faster than SMA because it weights recent prices more. It's one of the two lines used to calculate MACD.",
    bullSignal: "Price bouncing off EMA 12 as support",
    bearSignal: "Price rejected at EMA 12 as resistance",
    bestFor: "Fast-reacting trend following and MACD analysis",
  },
  ema26: {
    name: "EMA 26",
    shortDesc: "26-period Exponential Moving Average",
    howToRead:
      "The EMA 26 is the slower component of MACD. When EMA 12 crosses above EMA 26, momentum is shifting bullish.",
    bullSignal: "EMA 12 crossing above EMA 26",
    bearSignal: "EMA 12 crossing below EMA 26",
    bestFor: "Medium-term momentum analysis with EMA 12",
  },
  bollinger: {
    name: "Bollinger Bands",
    shortDesc: "SMA 20 with upper/lower bands at 2 standard deviations",
    howToRead:
      "Price tends to stay within the bands ~95% of the time. When price touches the upper band, it may be overbought. When it touches the lower band, it may be oversold. Narrow bands (squeeze) often precede big moves.",
    bullSignal:
      "Price bounces off lower band or breaks above upper band with high volume",
    bearSignal:
      "Price rejected at upper band or breaks below lower band with high volume",
    bestFor: "Spotting overbought/oversold conditions and volatility squeezes",
  },
  rsi: {
    name: "RSI",
    shortDesc: "Measures overbought/oversold momentum (0-100)",
    howToRead:
      "RSI above 70 = overbought (price may pull back). RSI below 30 = oversold (price may bounce). RSI around 50 = neutral. Look for divergences where price makes new highs but RSI doesn't.",
    bullSignal: "RSI crosses above 30 from oversold territory",
    bearSignal: "RSI crosses above 70 into overbought territory",
    bestFor: "Spotting potential reversals and momentum shifts",
  },
  macd: {
    name: "MACD",
    shortDesc: "Trend momentum via EMA convergence/divergence",
    howToRead:
      "MACD Line = EMA 12 - EMA 26. Signal Line = 9-period EMA of MACD. Histogram = difference between MACD and Signal. Green histogram bars growing = strengthening uptrend. Red bars growing = strengthening downtrend.",
    bullSignal:
      "MACD Line crosses above Signal Line (bullish crossover)",
    bearSignal:
      "MACD Line crosses below Signal Line (bearish crossover)",
    bestFor: "Confirming trend direction and timing entries/exits",
  },
  stochastic: {
    name: "Stochastic Oscillator",
    shortDesc: "Compares close to price range over 14 periods (0-100)",
    howToRead:
      "%K is the fast line, %D is the smoothed signal. Above 80 = overbought, below 20 = oversold. Best used in ranging markets, not strong trends.",
    bullSignal: "%K crosses above %D below the 20 level",
    bearSignal: "%K crosses below %D above the 80 level",
    bestFor: "Trading ranges and catching oversold bounces",
  },
  atr: {
    name: "ATR",
    shortDesc: "Measures average price volatility over 14 periods",
    howToRead:
      "ATR doesn't predict direction — it measures how much price moves. High ATR = volatile, bigger stop-losses needed. Low ATR = calm, tighter stops possible. Use ATR to set stop-loss distance (e.g., 2x ATR below entry).",
    bullSignal: "Rising ATR with rising price (strong uptrend)",
    bearSignal: "Rising ATR with falling price (strong downtrend)",
    bestFor: "Setting stop-loss distances and assessing volatility",
  },
  vwap: {
    name: "VWAP",
    shortDesc: "Volume-weighted average price (institutional benchmark)",
    howToRead:
      "VWAP shows the average price weighted by volume. Institutional traders consider buying below VWAP a 'good deal' and selling above VWAP a 'good exit'. Price tends to revert toward VWAP.",
    bullSignal: "Price crosses above VWAP (buyers in control)",
    bearSignal: "Price crosses below VWAP (sellers in control)",
    bestFor: "Finding fair value and institutional price levels",
  },
  adx: {
    name: "ADX",
    shortDesc: "Average Directional Index — measures trend strength 0–100",
    howToRead:
      "ADX measures how strong a trend is, not its direction. Above 25 = strong trend (trade with it). Below 20 = weak/ranging market (avoid trend strategies). Above 40 = very strong trend.",
    bullSignal: "ADX rising above 25 while price is in uptrend",
    bearSignal: "ADX rising above 25 while price is in downtrend",
    bestFor: "Knowing whether to use trend-following or range strategies",
  },
  obv: {
    name: "OBV",
    shortDesc: "On-Balance Volume — cumulative volume momentum",
    howToRead:
      "OBV adds volume on up days and subtracts on down days. When OBV rises with price, the trend is confirmed by volume. Divergence (OBV falling while price rises) is a warning sign.",
    bullSignal: "OBV rising alongside rising price (confirmed uptrend)",
    bearSignal: "OBV falling while price rises (bearish divergence)",
    bestFor: "Confirming trends with volume and spotting divergences",
  },
  cci: {
    name: "CCI",
    shortDesc: "Commodity Channel Index — overbought/oversold oscillator",
    howToRead:
      "CCI measures how far price is from its average. Above +100 = overbought (consider selling). Below -100 = oversold (consider buying). Zero line = price at its average.",
    bullSignal: "CCI crosses above -100 from oversold territory",
    bearSignal: "CCI crosses below +100 from overbought territory",
    bestFor: "Spotting overbought/oversold extremes and trend reversals",
  },
  williams_r: {
    name: "Williams %R",
    shortDesc: "Williams %R — inverse stochastic oscillator (0 to -100)",
    howToRead:
      "Williams %R measures where price sits within its recent high-low range. Above -20 = overbought. Below -80 = oversold. Scale is inverted: -100 is the low, 0 is the high.",
    bullSignal: "Williams %R rises above -80 from oversold levels",
    bearSignal: "Williams %R falls below -20 from overbought levels",
    bestFor: "Short-term reversals and overbought/oversold timing",
  },
  psar: {
    name: "Parabolic SAR",
    shortDesc: "Parabolic SAR — trailing stop and reversal dots",
    howToRead:
      "Dots below price = bullish trend (SAR acts as trailing stop below). Dots above price = bearish trend (SAR acts as trailing stop above). When price crosses the SAR dots, the trend may be reversing.",
    bullSignal: "SAR dots flip from above to below price (bullish reversal)",
    bearSignal: "SAR dots flip from below to above price (bearish reversal)",
    bestFor: "Trailing stop placement and trend reversal detection",
  },
};
