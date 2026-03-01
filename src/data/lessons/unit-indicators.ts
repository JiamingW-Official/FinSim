import type { Unit } from "./types";
import {
  PRACTICE_SMA_CROSS,
  PRACTICE_RSI_BOUNCE,
  PRACTICE_MACD_SIGNAL,
  PRACTICE_BB_SQUEEZE,
} from "./practice-data";

export const UNIT_INDICATORS: Unit = {
  id: "indicators",
  title: "Technical Analysis",
  description: "Read charts and spot trading signals",
  icon: "LineChart",
  color: "#8b5cf6",
  lessons: [
    {
      id: "indicators-1",
      title: "Moving Averages",
      description: "Smooth out noise and spot trends with SMA & EMA",
      icon: "TrendingUp",
      xpReward: 55,
      steps: [
        {
          type: "teach",
          title: "What are Moving Averages?",
          content:
            "A **Moving Average** smooths out price data to show the overall trend direction.\n\n**SMA (Simple Moving Average)**: Average of the last N closing prices. SMA 20 = average of last 20 closes.\n\n**EMA (Exponential Moving Average)**: Gives more weight to recent prices, making it more responsive to new data.\n\nWhen price is ABOVE the MA → uptrend. When BELOW → downtrend.",
          visual: "indicator-chart",
          highlight: ["SMA", "EMA", "trend"],
        },
        {
          type: "teach",
          title: "Golden Cross & Death Cross",
          content:
            "**Golden Cross**: Short-term MA crosses ABOVE long-term MA (e.g., SMA 20 crosses above SMA 50). This is a **bullish** signal.\n\n**Death Cross**: Short-term MA crosses BELOW long-term MA. This is a **bearish** signal.\n\nThese signals are more reliable on longer timeframes (daily/weekly) with high volume confirmation.",
        },
        {
          type: "quiz-mc",
          question: "What does it typically mean when SMA 20 crosses above SMA 50?",
          options: [
            "Golden Cross — bullish trend signal",
            "Death Cross — bearish signal",
            "The stock is overvalued",
            "Volume is decreasing",
          ],
          correctIndex: 0,
          explanation:
            "When a shorter-period MA (20) crosses above a longer-period MA (50), it's called a Golden Cross — indicating momentum has shifted to the upside.",
        },
        {
          type: "quiz-tf",
          statement: "EMA reacts faster to price changes than SMA of the same period.",
          correct: true,
          explanation:
            "The EMA gives more weight to recent prices, making it more responsive to new price changes compared to the SMA which weights all data equally.",
        },
        {
          type: "practice",
          instruction:
            "Toggle on the SMA 20 indicator and watch how it smooths price movement.",
          objective: "Enable the SMA overlay on the chart",
          actionType: "indicator",
          challenge: {
            priceData: PRACTICE_SMA_CROSS.bars,
            initialReveal: PRACTICE_SMA_CROSS.initialReveal,
            objectives: [{ kind: "toggle-indicator", indicator: "sma20" }],
            hint: "Click the SMA 20 chip to toggle the indicator on.",
          },
        },
      ],
    },
    {
      id: "indicators-2",
      title: "RSI — Momentum",
      description: "Spot overbought and oversold conditions",
      icon: "Activity",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "Relative Strength Index (RSI)",
          content:
            "**RSI** measures how fast and how much prices change, on a scale of 0 to 100.\n\n• **RSI > 70**: **Overbought** — price may have risen too fast, potential pullback\n• **RSI < 30**: **Oversold** — price may have fallen too fast, potential bounce\n• **RSI 40-60**: Neutral zone\n\nRSI doesn't predict direction — it shows when a move might be overextended.",
          visual: "indicator-chart",
          highlight: ["RSI", "overbought", "oversold"],
        },
        {
          type: "teach",
          title: "RSI Divergence",
          content:
            "**Bullish Divergence**: Price makes a lower low, but RSI makes a higher low. The selling pressure is weakening — potential reversal UP.\n\n**Bearish Divergence**: Price makes a higher high, but RSI makes a lower high. The buying pressure is fading — potential reversal DOWN.\n\nDivergence is one of the most powerful signals in technical analysis.",
        },
        {
          type: "quiz-mc",
          question: "An RSI reading of 25 suggests:",
          options: [
            "The stock is oversold and may bounce",
            "The stock is overbought",
            "The stock will definitely go up",
            "Trading volume is high",
          ],
          correctIndex: 0,
          explanation:
            "RSI below 30 indicates oversold conditions — the stock has dropped significantly in a short time and may see a short-term bounce. However, this is a signal, not a guarantee.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock's price hits a new low of $90 (previous low was $95), but the RSI at this new low is 35 (previous RSI low was 28).",
          question: "What type of signal is this?",
          options: [
            "Bullish divergence — selling momentum is weakening",
            "Bearish divergence — buying momentum is weakening",
            "A normal downtrend continuation",
            "RSI is broken and unreliable",
          ],
          correctIndex: 0,
          explanation:
            "Price made a lower low but RSI made a higher low — this is bullish divergence. The selling momentum is decreasing even though price hit new lows, suggesting a potential reversal.",
        },
        {
          type: "practice",
          instruction:
            "Toggle on the RSI indicator and advance time to see overbought/oversold levels.",
          objective: "Enable RSI and observe how it reacts to price swings",
          actionType: "indicator",
          challenge: {
            priceData: PRACTICE_RSI_BOUNCE.bars,
            initialReveal: PRACTICE_RSI_BOUNCE.initialReveal,
            objectives: [
              { kind: "toggle-indicator", indicator: "rsi" },
              { kind: "advance-time", bars: 5 },
            ],
            availableIndicators: [
              { id: "rsi", label: "RSI 14" },
              { id: "sma20", label: "SMA 20" },
            ],
            hint: "Click the RSI 14 chip, then advance bars to watch the RSI respond to price moves.",
          },
        },
      ],
    },
    {
      id: "indicators-3",
      title: "MACD Signals",
      description: "Read trend momentum with the MACD crossover",
      icon: "GitCompareArrows",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "MACD Explained",
          content:
            "**MACD** (Moving Average Convergence Divergence) shows the relationship between two EMAs.\n\n• **MACD Line**: EMA 12 minus EMA 26\n• **Signal Line**: 9-period EMA of the MACD line\n• **Histogram**: The difference between MACD and Signal\n\nWhen MACD crosses ABOVE the signal line → **bullish**\nWhen MACD crosses BELOW the signal line → **bearish**",
          visual: "indicator-chart",
          highlight: ["MACD", "signal line", "histogram"],
        },
        {
          type: "quiz-mc",
          question: "When the MACD line crosses above the signal line, this is:",
          options: [
            "A bullish crossover signal",
            "A bearish crossover signal",
            "An overbought signal",
            "A volume signal",
          ],
          correctIndex: 0,
          explanation:
            "When the MACD line crosses above the signal line, it indicates bullish momentum is building. Traders often use this as a buy signal, especially when confirmed by other indicators.",
        },
        {
          type: "teach",
          title: "Reading the Histogram",
          content:
            "The MACD **histogram** visually shows the gap between MACD and signal lines.\n\n• **Growing green bars**: Bullish momentum is increasing\n• **Shrinking green bars**: Bullish momentum is fading\n• **Growing red bars**: Bearish momentum is increasing\n• **Shrinking red bars**: Bearish momentum is fading\n\nThe histogram often changes direction before the actual crossover — an early warning signal.",
        },
        {
          type: "quiz-tf",
          statement: "The MACD histogram can warn of momentum changes before the MACD crossover occurs.",
          correct: true,
          explanation:
            "Yes! When histogram bars start shrinking, it means the MACD and signal lines are converging — a crossover is approaching. This gives traders an early heads-up.",
        },
        {
          type: "practice",
          instruction:
            "Toggle on the MACD indicator and advance time to see crossover signals and histogram changes.",
          objective: "Enable MACD and observe momentum shifts",
          actionType: "indicator",
          challenge: {
            priceData: PRACTICE_MACD_SIGNAL.bars,
            initialReveal: PRACTICE_MACD_SIGNAL.initialReveal,
            objectives: [
              { kind: "toggle-indicator", indicator: "macd" },
              { kind: "advance-time", bars: 5 },
            ],
            availableIndicators: [
              { id: "macd", label: "MACD" },
              { id: "sma20", label: "SMA 20" },
            ],
            hint: "Click the MACD chip, then advance bars to watch for crossover signals.",
          },
        },
      ],
    },
    {
      id: "indicators-4",
      title: "Bollinger Bands",
      description: "Measure volatility and find breakout opportunities",
      icon: "Maximize2",
      xpReward: 55,
      steps: [
        {
          type: "teach",
          title: "What are Bollinger Bands?",
          content:
            "**Bollinger Bands** consist of three lines:\n\n• **Middle Band**: 20-period SMA (the average)\n• **Upper Band**: SMA + 2 standard deviations\n• **Lower Band**: SMA - 2 standard deviations\n\nThe bands expand during **high volatility** and contract during **low volatility** (called a 'squeeze').\n\nStatistically, ~95% of price action should stay within the bands.",
          visual: "indicator-chart",
          highlight: ["Bollinger Bands", "squeeze", "volatility"],
        },
        {
          type: "teach",
          title: "Trading Bollinger Bands",
          content:
            "**Band Bounce**: Price touching the lower band may bounce up. Price touching the upper band may pull back. Use with RSI for confirmation.\n\n**Bollinger Squeeze**: When bands narrow significantly, a big price move is coming. The breakout direction indicates the trend.\n\n**Walking the Band**: In strong trends, price can 'walk' along the upper or lower band for extended periods.",
        },
        {
          type: "quiz-mc",
          question: "When Bollinger Bands squeeze (narrow tightly), what does it typically mean?",
          options: [
            "Low volatility — a big move is likely coming",
            "The stock is overvalued",
            "The trend is very strong",
            "Volume is decreasing permanently",
          ],
          correctIndex: 0,
          explanation:
            "A Bollinger squeeze indicates a period of unusually low volatility. Like a coiled spring, this compression often precedes a significant price breakout in either direction.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "MSFT is trading at $415. The Bollinger upper band is at $420 and the lower band is at $380. The RSI is at 72.",
          question: "What does this setup suggest?",
          options: [
            "Price near upper band + overbought RSI — potential pullback",
            "Strong buying opportunity",
            "Bollinger squeeze is forming",
            "Volume must be very low",
          ],
          correctIndex: 0,
          explanation:
            "Price near the upper Bollinger band combined with an RSI above 70 (overbought) suggests the stock may be overextended. This confluence of signals increases the probability of a short-term pullback.",
        },
        {
          type: "practice",
          instruction:
            "Toggle on Bollinger Bands and advance time to watch the squeeze and breakout.",
          objective: "Enable Bollinger Bands and observe the volatility squeeze",
          actionType: "indicator",
          challenge: {
            priceData: PRACTICE_BB_SQUEEZE.bars,
            initialReveal: PRACTICE_BB_SQUEEZE.initialReveal,
            objectives: [
              { kind: "toggle-indicator", indicator: "bb" },
              { kind: "advance-time", bars: 8 },
            ],
            availableIndicators: [
              { id: "bb", label: "Bollinger" },
              { id: "sma20", label: "SMA 20" },
            ],
            hint: "Click the Bollinger chip, then advance bars to watch the bands squeeze and expand.",
          },
        },
      ],
    },
  ],
};
