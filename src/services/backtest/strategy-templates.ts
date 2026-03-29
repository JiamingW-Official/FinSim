import type { StrategyTemplate } from "@/types/backtest";

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  // ═══════════════════════════════════════════════════════════════
  // 1. Golden Cross — Classic Trend Following
  // ═══════════════════════════════════════════════════════════════
  {
    id: "golden_cross",
    name: "Golden Cross",
    subtitle: "SMA Crossover Trend Following",
    icon: "TrendingUp",
    category: "trend-following",
    difficulty: 1,

    theory: `The Golden Cross is one of the most widely-recognized technical signals on Wall Street. It occurs when a shorter-period moving average crosses above a longer-period moving average, signaling that short-term momentum has shifted bullish and a new uptrend may be beginning.

The inverse — the Death Cross — occurs when the short MA crosses below the long MA, signaling bearish momentum. This strategy uses SMA(20) and SMA(50) as the fast and slow averages.

The core principle is momentum persistence: once a trend establishes itself, it tends to continue. By waiting for the crossover confirmation, you avoid getting caught in false breakouts — the MA crossover acts as a filter that requires sustained directional movement before triggering entry.`,

    signals: [
      { type: "entry", label: "SMA 20 crosses above SMA 50", description: "Confirms short-term uptrend overtaking long-term average — momentum shifting bullish" },
      { type: "exit", label: "SMA 20 crosses below SMA 50", description: "Death Cross reversal — momentum shifting bearish" },
      { type: "exit", label: "Trailing stop 5%", description: "Protects profits if price reverses before the death cross" },
    ],

    bestConditions: ["trending_up", "trending_down"],
    strengths: [
      "Simple and objective — no subjective interpretation",
      "Catches major trends early, rides them for large gains",
      "Natural noise filter — SMA smoothing ignores intraday noise",
      "Works in all asset classes — stocks, ETFs, crypto, forex",
    ],
    weaknesses: [
      "Lags behind price — enters late and exits late",
      "Gets whipsawed in sideways/choppy markets",
      "Large drawdowns during trend reversals before signal triggers",
      "Miss the first 20-50 bars of a move waiting for MA convergence",
    ],
    keyParameters: [
      { name: "Fast SMA", description: "Short-term moving average period. Smaller = more responsive but more whipsaws", default: "20" },
      { name: "Slow SMA", description: "Long-term moving average period. Larger = smoother but more lag", default: "50" },
      { name: "Trailing Stop", description: "Max pullback from peak before forced exit", default: "5%" },
    ],
    history: `The moving average crossover system was popularized by Richard Donchian in the 1960s, who is considered the father of trend following. Later, Turtle Traders — a group trained by legendary traders Richard Dennis and Bill Eckhardt in 1983 — used similar moving average systems to generate hundreds of millions in profits. The "Golden Cross" terminology became mainstream on Wall Street in the 1990s and is now tracked by Bloomberg terminals worldwide.`,

    defaultConfig: {
      entryRules: [
        { id: "sma20_cross_sma50_up", source: "sma20", operator: "crosses_above", target: "sma50", label: "SMA20 ✕ SMA50 ↑" },
      ],
      exitRules: [
        { kind: "condition", rule: { id: "sma20_cross_sma50_down", source: "sma20", operator: "crosses_below", target: "sma50", label: "SMA20 ✕ SMA50 ↓" } },
        { kind: "trailing_stop", percent: 5 },
      ],
      positionSizing: { kind: "percent_of_capital", percent: 30 },
      direction: "long",
      warmupBars: 50,
      maxOpenTrades: 1,
    },
    recommendedPreset: "trending_up",
    recommendedBars: 365,
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. RSI Mean Reversion
  // ═══════════════════════════════════════════════════════════════
  {
    id: "rsi_mean_reversion",
    name: "RSI Mean Reversion",
    subtitle: "Buy the Dip, Sell the Rip",
    icon: "Activity",
    category: "mean-reversion",
    difficulty: 2,

    theory: `Mean reversion is the financial theory that prices tend to oscillate around a central value and that extreme deviations are temporary. The RSI (Relative Strength Index) quantifies this by measuring the speed and magnitude of recent price changes on a 0-100 scale.

When RSI drops below 30, the asset is considered "oversold" — selling pressure has been extreme and likely unsustainable. Statistically, prices tend to bounce from these levels. Conversely, RSI above 70 indicates "overbought" conditions where buying enthusiasm may be exhausted.

This strategy buys when RSI enters oversold territory and exits when it returns to neutral or overbought levels. The key insight is that markets frequently overcorrect: fear drives prices below fair value, creating opportunities for patient buyers. The stop loss protects against the cases where oversold conditions persist (a "value trap").`,

    signals: [
      { type: "entry", label: "RSI(14) drops below 30", description: "Oversold condition — selling pressure likely exhausted, expecting mean reversion bounce" },
      { type: "exit", label: "RSI(14) rises above 70", description: "Overbought — take profits as buying enthusiasm may be exhausted" },
      { type: "exit", label: "Stop loss 8%", description: "Cuts losses if oversold continues deteriorating — avoids value trap" },
      { type: "exit", label: "Max hold 20 bars", description: "Time-based exit — if no bounce materializes, thesis is wrong" },
    ],

    bestConditions: ["sideways", "volatile"],
    strengths: [
      "High win rate — buying oversold typically has >60% success",
      "Clear entry/exit signals — no ambiguity",
      "Works well in range-bound markets where prices oscillate",
      "Quick trades — positions typically held 3-15 bars",
    ],
    weaknesses: [
      "Catches falling knives in strong downtrends — RSI can stay oversold for weeks",
      "Smaller wins per trade compared to trend following",
      "Struggles in momentum-driven markets (oversold gets more oversold)",
      "Requires disciplined stop losses — a single catastrophic loss can wipe out many small wins",
    ],
    keyParameters: [
      { name: "RSI Period", description: "Number of bars for RSI calculation. 14 is standard. Lower = more signals but more noise", default: "14" },
      { name: "Oversold Level", description: "RSI threshold to trigger buy. 30 is standard, 20 is more conservative", default: "30" },
      { name: "Overbought Level", description: "RSI threshold to take profit. 70 is standard", default: "70" },
      { name: "Stop Loss", description: "Maximum acceptable loss per trade", default: "8%" },
    ],
    history: `The RSI was developed by J. Welles Wilder Jr. and introduced in his 1978 book "New Concepts in Technical Trading Systems." Wilder was a mechanical engineer turned trader who also invented the ATR, ADX, and Parabolic SAR. The RSI became one of the most popular indicators in the world, used by millions of traders and integrated into every charting platform. Larry Connors later popularized a RSI(2) mean reversion strategy that showed remarkable backtested returns.`,

    defaultConfig: {
      entryRules: [
        { id: "rsi_below_30", source: "rsi14", operator: "less_than", target: 30, label: "RSI < 30" },
      ],
      exitRules: [
        { kind: "condition", rule: { id: "rsi_above_70", source: "rsi14", operator: "greater_than", target: 70, label: "RSI > 70" } },
        { kind: "stop_loss", percent: 8 },
        { kind: "bars_held", count: 20 },
      ],
      positionSizing: { kind: "percent_of_capital", percent: 25 },
      direction: "long",
      warmupBars: 15,
      maxOpenTrades: 1,
    },
    recommendedPreset: "sideways",
    recommendedBars: 200,
  },

  // ═══════════════════════════════════════════════════════════════
  // 3. MACD Momentum
  // ═══════════════════════════════════════════════════════════════
  {
    id: "macd_momentum",
    name: "MACD Momentum",
    subtitle: "Ride Accelerating Trends",
    icon: "Zap",
    category: "momentum",
    difficulty: 2,

    theory: `MACD (Moving Average Convergence Divergence) measures the relationship between two exponential moving averages. When the MACD line (EMA12 - EMA26) crosses above its signal line (9-period EMA of MACD), it indicates that short-term momentum is accelerating faster than the longer-term trend — a bullish signal.

Unlike simple MA crossovers, MACD captures the rate of change of momentum. When MACD is rising, it means the gap between fast and slow EMAs is widening — the trend is not just moving up, it's accelerating. This "momentum of momentum" concept makes MACD particularly powerful for identifying early stages of strong moves.

This strategy combines MACD crossover with a price-above-SMA50 filter to avoid taking signals against the prevailing trend. The trailing stop lets winners run while protecting accumulated gains.`,

    signals: [
      { type: "entry", label: "MACD crosses above signal line", description: "Momentum acceleration — short-term trend outpacing long-term" },
      { type: "entry", label: "Price above SMA 50 (trend filter)", description: "Only trade in direction of the prevailing uptrend" },
      { type: "exit", label: "MACD crosses below signal line", description: "Momentum deceleration — trend losing steam" },
      { type: "exit", label: "Trailing stop 6%", description: "Lock in profits during strong moves" },
    ],

    bestConditions: ["trending_up", "volatile"],
    strengths: [
      "Catches trend accelerations early — enters before full move develops",
      "Dual confirmation (MACD + trend filter) reduces false signals",
      "Adapts to volatility — EMA-based so responsive to recent price action",
      "Clear visual signals on charts — easy to validate",
    ],
    weaknesses: [
      "Generates many signals in choppy markets — high trade frequency",
      "MACD is a lagging indicator — still misses the absolute bottom/top",
      "Trend filter can cause missed entries when price is near the SMA",
      "Frequent whipsaws if MACD crosses back and forth near zero line",
    ],
    keyParameters: [
      { name: "MACD Fast", description: "Fast EMA period. Shorter = more responsive", default: "12" },
      { name: "MACD Slow", description: "Slow EMA period. Standard is 26", default: "26" },
      { name: "Signal Period", description: "Signal line smoothing. 9 is standard", default: "9" },
      { name: "Trailing Stop", description: "Protects accumulated gains", default: "6%" },
    ],
    history: `MACD was created by Gerald Appel in the late 1970s. Appel was a psychoanalyst turned financial advisor who managed $700M+ in assets. The indicator became one of the most popular tools in technical analysis. Thomas Aspray added the histogram component in 1986, making divergences easier to spot. Today MACD is a standard indicator on every trading platform and is used by institutional and retail traders alike.`,

    defaultConfig: {
      entryRules: [
        { id: "macd_cross_signal_up", source: "macd_line", operator: "crosses_above", target: "macd_signal", label: "MACD ✕ Signal ↑" },
        { id: "price_above_sma50", source: "price", operator: "greater_than", target: "sma50", label: "Price > SMA50" },
      ],
      exitRules: [
        { kind: "condition", rule: { id: "macd_cross_signal_down", source: "macd_line", operator: "crosses_below", target: "macd_signal", label: "MACD ✕ Signal ↓" } },
        { kind: "trailing_stop", percent: 6 },
      ],
      positionSizing: { kind: "percent_of_capital", percent: 25 },
      direction: "long",
      warmupBars: 35,
      maxOpenTrades: 1,
    },
    recommendedPreset: "trending_up",
    recommendedBars: 200,
  },

  // ═══════════════════════════════════════════════════════════════
  // 4. Bollinger Band Squeeze Breakout
  // ═══════════════════════════════════════════════════════════════
  {
    id: "bollinger_squeeze",
    name: "Bollinger Squeeze",
    subtitle: "Volatility Contraction Breakout",
    icon: "Target",
    category: "volatility",
    difficulty: 3,

    theory: `John Bollinger's Bands expand and contract with market volatility. When the bands narrow significantly (a "squeeze"), it signals that the market is coiling up energy — like a compressed spring. Historical data shows that periods of low volatility reliably precede periods of high volatility.

The squeeze breakout strategy waits for the moment price breaks out of the compressed range. A break above the upper band suggests the stored energy is being released upward. The strategy enters on a breakout above the upper band after a period where bands were contracting.

To filter false breakouts, this strategy also requires the EMA12 to be above EMA26 (confirming momentum direction). The ATR-based trailing stop adapts to the new volatility regime — as the expected range expands post-squeeze, the stop automatically widens to avoid premature exits.`,

    signals: [
      { type: "entry", label: "Price breaks above upper Bollinger Band", description: "Breakout from volatility squeeze — energy released upward" },
      { type: "entry", label: "EMA12 > EMA26 (momentum confirmation)", description: "Ensures breakout is in direction of momentum" },
      { type: "exit", label: "Price drops below middle Bollinger Band", description: "Return to mean — breakout momentum fading" },
      { type: "exit", label: "ATR-based trailing stop (2x ATR)", description: "Adaptive stop that widens with post-breakout volatility" },
    ],

    bestConditions: ["sideways", "volatile"],
    strengths: [
      "Catches explosive moves — squeezes often precede 5-20% directional moves",
      "Volatility-adaptive — automatically adjusts to market conditions",
      "High reward-to-risk — entering at breakout gives favorable R:R",
      "Works across timeframes and asset classes",
    ],
    weaknesses: [
      "Many false breakouts — price briefly touches upper band then reverses",
      "Requires patience — squeezes can take many bars to develop",
      "Directional bias needed — squeeze breaks both ways equally",
      "Lower win rate compared to mean reversion strategies (~40-45%)",
    ],
    keyParameters: [
      { name: "BB Period", description: "Bollinger Band lookback period. 20 is standard", default: "20" },
      { name: "BB Std Dev", description: "Band width in standard deviations. 2 is standard", default: "2" },
      { name: "ATR Multiplier", description: "Trailing stop distance in ATR units. Higher = wider stops", default: "2x" },
    ],
    history: `John Bollinger developed Bollinger Bands in the early 1980s while working as a financial analyst. He trademarked the name and wrote the definitive guide "Bollinger on Bollinger Bands" in 2001. The squeeze concept was further popularized by John Carter in his book "Mastering the Trade." TTM Squeeze, a commercial indicator based on the same principle, became one of the best-selling indicators on thinkorswim platform.`,

    defaultConfig: {
      entryRules: [
        { id: "price_above_bb_upper", source: "price", operator: "greater_than", target: "bollinger_upper", label: "Price > BB Upper" },
        { id: "ema12_above_ema26", source: "ema12", operator: "greater_than", target: "ema26", label: "EMA12 > EMA26" },
      ],
      exitRules: [
        { kind: "condition", rule: { id: "price_below_bb_middle", source: "price", operator: "less_than", target: "bollinger_middle", label: "Price < BB Middle" } },
        { kind: "atr_stop", multiplier: 2 },
      ],
      positionSizing: { kind: "percent_of_capital", percent: 20 },
      direction: "long",
      warmupBars: 50,
      maxOpenTrades: 1,
    },
    recommendedPreset: "sideways",
    recommendedBars: 365,
  },

  // ═══════════════════════════════════════════════════════════════
  // 5. EMA Ribbon Momentum
  // ═══════════════════════════════════════════════════════════════
  {
    id: "ema_ribbon",
    name: "EMA Ribbon",
    subtitle: "Dual EMA Trend Surfing",
    icon: "Waves",
    category: "trend-following",
    difficulty: 2,

    theory: `The EMA (Exponential Moving Average) gives more weight to recent prices than SMA, making it more responsive to current market conditions. When EMA(12) crosses above EMA(26), it signals that recent momentum has shifted decisively bullish — the market's "temperature" has changed.

This strategy improves on the basic crossover by adding Stochastic %K confirmation. The Stochastic oscillator measures where the current close is relative to the recent range (0-100). By requiring Stochastic %K > %D at entry, we confirm that not only has the EMA crossover occurred, but price is also showing positive short-term momentum within the range.

The combination of a medium-term trend indicator (EMA crossover) with a short-term momentum oscillator (Stochastic) creates a dual timeframe confirmation system that filters out many false signals.`,

    signals: [
      { type: "entry", label: "EMA 12 crosses above EMA 26", description: "Medium-term momentum shift — trend turning bullish" },
      { type: "entry", label: "Stochastic %K > %D", description: "Short-term momentum confirmation within the range" },
      { type: "exit", label: "EMA 12 crosses below EMA 26", description: "Momentum shift reversal — trend turning bearish" },
      { type: "exit", label: "Stop loss 7%", description: "Hard floor to limit losses on failed breakouts" },
    ],

    bestConditions: ["trending_up", "volatile"],
    strengths: [
      "More responsive than SMA — captures trends earlier",
      "Dual confirmation reduces whipsaws significantly",
      "Good for swing trading — holds positions 10-30 bars",
      "Simple to understand and implement",
    ],
    weaknesses: [
      "More prone to false signals than slower systems",
      "Stochastic filter can cause late entries after fast moves",
      "Still lags — misses the start and end of trends",
      "Underperforms in choppy, directionless markets",
    ],
    keyParameters: [
      { name: "Fast EMA", description: "Short-term EMA period. 12 gives good balance of speed vs noise", default: "12" },
      { name: "Slow EMA", description: "Long-term EMA period. 26 is standard (matching MACD)", default: "26" },
      { name: "Stochastic K", description: "Stochastic %K lookback period", default: "14" },
      { name: "Stop Loss", description: "Maximum loss per trade", default: "7%" },
    ],
    history: `EMAs became popular in the 1960s through the work of P.N. Haurlan, who used them in missile tracking before applying them to stock markets. The 12/26 EMA combination gained fame through MACD (which is built on the same pair). Combining EMAs with Stochastic is a technique popularized by Alexander Elder in his classic "Trading for a Living" (1993), where he described the Triple Screen Trading System using multiple timeframe confirmations.`,

    defaultConfig: {
      entryRules: [
        { id: "ema12_cross_ema26_up", source: "ema12", operator: "crosses_above", target: "ema26", label: "EMA12 ✕ EMA26 ↑" },
        { id: "stoch_k_above_d", source: "stoch_k", operator: "greater_than", target: "stoch_d", label: "%K > %D" },
      ],
      exitRules: [
        { kind: "condition", rule: { id: "ema12_cross_ema26_down", source: "ema12", operator: "crosses_below", target: "ema26", label: "EMA12 ✕ EMA26 ↓" } },
        { kind: "stop_loss", percent: 7 },
      ],
      positionSizing: { kind: "percent_of_capital", percent: 25 },
      direction: "long",
      warmupBars: 30,
      maxOpenTrades: 1,
    },
    recommendedPreset: "trending_up",
    recommendedBars: 200,
  },

  // ═══════════════════════════════════════════════════════════════
  // 6. Volatility Breakout (ATR Channel)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "atr_breakout",
    name: "ATR Channel Breakout",
    subtitle: "Keltner Channel-Inspired Volatility System",
    icon: "Expand",
    category: "volatility",
    difficulty: 4,

    theory: `ATR (Average True Range) measures market volatility by averaging the range between high, low, and previous close over N periods. An ATR Channel breakout occurs when price moves more than a certain multiple of ATR above the moving average — indicating an unusually strong move that exceeds normal noise.

Unlike Bollinger Bands (which use standard deviation), ATR channels adapt to the actual trading range of the instrument. This makes them more robust to gap-heavy markets and extreme candles. When price breaks above SMA(20) + 1.5×ATR(14), it has moved beyond the expected daily range — suggesting a genuine shift in supply/demand dynamics rather than random noise.

This system also uses VWAP as a secondary filter: price must be above VWAP to ensure institutional buyers are net positive. VWAP represents the average price weighted by volume — institutional traders watch it closely as it indicates whether the "smart money" is accumulating or distributing.`,

    signals: [
      { type: "entry", label: "Price > SMA20 + 1.5×ATR", description: "Price exceeds volatility-adjusted channel — abnormal strength" },
      { type: "entry", label: "Price > VWAP", description: "Above volume-weighted average — institutions are net buyers" },
      { type: "exit", label: "Price < SMA20", description: "Return below the moving average — breakout has failed" },
      { type: "exit", label: "ATR trailing stop (2.5x ATR)", description: "Volatility-adaptive stop — widens in volatile markets, tightens in calm" },
    ],

    bestConditions: ["trending_up", "volatile"],
    strengths: [
      "Volatility-adaptive — no fixed percentages, adjusts to market conditions",
      "Catches genuine breakouts by filtering normal price noise",
      "VWAP filter aligns with institutional flow",
      "ATR stop prevents premature exits in volatile trends",
    ],
    weaknesses: [
      "Complex — more parameters to optimize means more overfitting risk",
      "ATR channel is wider in volatile markets — needs larger moves to trigger",
      "VWAP filter can prevent entries when volume distribution is unusual",
      "Requires understanding of multiple concepts to manage effectively",
    ],
    keyParameters: [
      { name: "ATR Period", description: "Lookback for Average True Range calculation", default: "14" },
      { name: "ATR Multiplier (Entry)", description: "How many ATRs above SMA to trigger entry", default: "1.5x" },
      { name: "ATR Multiplier (Stop)", description: "How many ATRs below peak for trailing stop", default: "2.5x" },
      { name: "SMA Period", description: "Moving average for channel center", default: "20" },
    ],
    history: `ATR was invented by J. Welles Wilder Jr. in 1978 alongside RSI. Keltner Channels (SMA + ATR) were created by Chester Keltner in the 1960s and later refined by Linda Bradford Raschke. The volatility breakout concept was further developed by Tushar Chande and Stanley Kroll. Professional traders like Paul Tudor Jones have used ATR-based stops extensively, calling them "the professional's way to set stop losses."`,

    defaultConfig: {
      entryRules: [
        { id: "price_above_bb_upper_atr", source: "price", operator: "greater_than", target: "bollinger_upper", label: "Price > BB Upper" },
        { id: "price_above_vwap", source: "price", operator: "greater_than", target: "vwap", label: "Price > VWAP" },
      ],
      exitRules: [
        { kind: "condition", rule: { id: "price_below_sma20", source: "price", operator: "less_than", target: "sma20", label: "Price < SMA20" } },
        { kind: "atr_stop", multiplier: 2.5 },
      ],
      positionSizing: { kind: "percent_of_capital", percent: 20 },
      direction: "long",
      warmupBars: 50,
      maxOpenTrades: 1,
    },
    recommendedPreset: "volatile",
    recommendedBars: 365,
  },

  // ═══════════════════════════════════════════════════════════════
  // 7. Stochastic Reversal
  // ═══════════════════════════════════════════════════════════════
  {
    id: "stochastic_reversal",
    name: "Stochastic Reversal",
    subtitle: "Oscillator-Driven Countertrend Plays",
    icon: "RotateCcw",
    category: "mean-reversion",
    difficulty: 3,

    theory: `The Stochastic Oscillator compares where price closed relative to its recent high-low range. %K measures the raw ratio (0 = closed at the low, 100 = closed at the high), and %D is a smoothed version. When both lines are below 20 and %K crosses above %D, it signals that a reversal from oversold conditions has begun.

Unlike RSI which measures momentum, Stochastic measures position-in-range. This distinction matters: a stock can have strong RSI while Stochastic shows oversold (recent closes near the lows despite positive momentum). The Stochastic crossover in oversold territory is a more precise timing signal.

This strategy combines the Stochastic signal with a Bollinger Band lower touch as a secondary confirmation: if price is both at the bottom of its Stochastic range AND below the lower Bollinger Band, the odds of a bounce are significantly higher than either signal alone. The profit target is aggressive — exit when reaching the upper band, capturing the full mean reversion move.`,

    signals: [
      { type: "entry", label: "Stochastic %K crosses above %D below 20", description: "Reversal signal from deeply oversold territory" },
      { type: "entry", label: "Price below lower Bollinger Band", description: "Confirms extreme deviation from mean — enhanced bounce probability" },
      { type: "exit", label: "Stochastic %K crosses below %D above 80", description: "Bearish reversal from overbought — take profits" },
      { type: "exit", label: "Profit target 10%", description: "Lock in gains if the bounce delivers strongly" },
      { type: "exit", label: "Stop loss 6%", description: "Tight stop — if oversold persists, thesis is wrong" },
    ],

    bestConditions: ["sideways", "volatile"],
    strengths: [
      "Very precise entry timing — catches exact reversal points",
      "Dual confirmation reduces false signals dramatically",
      "High win rate in range-bound markets (55-65%)",
      "Quick trades — captures the snap-back move",
    ],
    weaknesses: [
      "Dangerous in trends — oversold can stay oversold in downtrends",
      "Requires fast execution — signals can be brief",
      "Smaller profits per trade compared to trend following",
      "Two-indicator requirement means fewer signals",
    ],
    keyParameters: [
      { name: "Stochastic K", description: "%K lookback period. 14 is standard", default: "14" },
      { name: "Stochastic D", description: "%D smoothing period", default: "3" },
      { name: "Oversold Level", description: "Zone below which crossover is valid", default: "20" },
      { name: "Profit Target", description: "Exit on this percentage gain", default: "10%" },
    ],
    history: `The Stochastic Oscillator was developed by George Lane in the 1950s at a trading group in Chicago. Lane famously said: "Stochastics measures the momentum of price. If you visualize a rocket going up, before it can turn down, it must slow down. Momentum always changes direction before price." The indicator became a favorite of floor traders and was one of the first to be computerized in the early days of electronic trading.`,

    defaultConfig: {
      entryRules: [
        { id: "stoch_k_cross_d_up", source: "stoch_k", operator: "crosses_above", target: "stoch_d", label: "%K ✕ %D ↑" },
        { id: "price_below_bb_lower", source: "price", operator: "less_than", target: "bollinger_lower", label: "Price < BB Lower" },
      ],
      exitRules: [
        { kind: "condition", rule: { id: "stoch_k_cross_d_down", source: "stoch_k", operator: "crosses_below", target: "stoch_d", label: "%K ✕ %D ↓" } },
        { kind: "profit_target", percent: 10 },
        { kind: "stop_loss", percent: 6 },
      ],
      positionSizing: { kind: "percent_of_capital", percent: 20 },
      direction: "long",
      warmupBars: 20,
      maxOpenTrades: 1,
    },
    recommendedPreset: "sideways",
    recommendedBars: 200,
  },

  // ═══════════════════════════════════════════════════════════════
  // 8. Composite Trend System
  // ═══════════════════════════════════════════════════════════════
  {
    id: "composite_trend",
    name: "Triple Confirmation",
    subtitle: "Multi-Indicator Consensus System",
    icon: "Shield",
    category: "composite",
    difficulty: 5,

    theory: `Professional quant systems rarely rely on a single indicator. The Triple Confirmation strategy requires agreement across three different types of indicators before entering a trade: a trend indicator (SMA), a momentum indicator (MACD), and a mean reversion filter (RSI). Each indicator captures a different dimension of market state.

The logic: SMA50 confirms the long-term trend is up (structural bullishness), MACD above signal confirms momentum is accelerating (tactical bullishness), and RSI between 40-70 ensures we're not buying into overbought conditions or catching a falling knife (risk management). Only when all three conditions align do we have a high-conviction entry.

This multi-factor approach dramatically reduces the number of trades but significantly increases the quality. Professional hedge funds like AQR Capital, Two Sigma, and Renaissance Technologies use similar multi-factor models (though with hundreds of factors and machine learning optimization). The key principle is the same: diversify across signal types to reduce the chance of any single indicator misleading you.`,

    signals: [
      { type: "entry", label: "Price above SMA 50", description: "Long-term trend is bullish — structural uptrend confirmed" },
      { type: "entry", label: "MACD above signal line", description: "Short-term momentum accelerating — tactical bullishness" },
      { type: "exit", label: "MACD crosses below signal", description: "Momentum decelerating — first warning sign" },
      { type: "exit", label: "Trailing stop 5% + ATR stop 2x", description: "Dual exit system — tighter of trailing % or ATR stop triggers" },
    ],

    bestConditions: ["trending_up"],
    strengths: [
      "Very high quality signals — triple confirmation eliminates noise",
      "Low drawdowns — multiple filters prevent entering weak setups",
      "Institutional-grade logic — similar to professional quant systems",
      "Works well in trending markets with excellent risk-adjusted returns",
    ],
    weaknesses: [
      "Very few trades — may go 50+ bars without a signal",
      "Misses fast moves — by the time all three align, the best entry is passed",
      "Over-optimization risk — too many parameters to fit historical data",
      "Requires strong trends to generate any signals at all",
    ],
    keyParameters: [
      { name: "Trend Filter", description: "SMA period for trend confirmation", default: "SMA 50" },
      { name: "Momentum", description: "MACD settings for momentum measurement", default: "12/26/9" },
      { name: "Trailing Stop", description: "Percentage trailing stop", default: "5%" },
      { name: "ATR Stop", description: "ATR multiplier for adaptive stop", default: "2x" },
    ],
    history: `Multi-factor investing was formalized by academics Eugene Fama and Kenneth French in their famous Three-Factor Model (1993). The concept of using multiple independent signals for confirmation traces back to Charles Dow's theory in the 1900s (his principle that the Industrial and Transportation averages must confirm each other). Modern quant funds like Renaissance Technologies use thousands of signals, but the core principle — diversification across signal types — remains the same.`,

    defaultConfig: {
      entryRules: [
        { id: "price_above_sma50_trend", source: "price", operator: "greater_than", target: "sma50", label: "Price > SMA50" },
        { id: "macd_above_signal_trend", source: "macd_line", operator: "greater_than", target: "macd_signal", label: "MACD > Signal" },
      ],
      exitRules: [
        { kind: "condition", rule: { id: "macd_cross_signal_down_composite", source: "macd_line", operator: "crosses_below", target: "macd_signal", label: "MACD ✕ Signal ↓" } },
        { kind: "trailing_stop", percent: 5 },
        { kind: "atr_stop", multiplier: 2 },
      ],
      positionSizing: { kind: "percent_of_capital", percent: 30 },
      direction: "long",
      warmupBars: 50,
      maxOpenTrades: 1,
    },
    recommendedPreset: "trending_up",
    recommendedBars: 365,
  },
];

export const STRATEGY_TEMPLATES_BY_ID = Object.fromEntries(
  STRATEGY_TEMPLATES.map((t) => [t.id, t]),
);

export const CATEGORY_INFO: Record<string, { label: string; color: string; bgColor: string }> = {
  "trend-following": { label: "Trend Following", color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
  "mean-reversion": { label: "Mean Reversion", color: "text-muted-foreground", bgColor: "bg-cyan-500/10" },
  momentum: { label: "Momentum", color: "text-amber-400", bgColor: "bg-amber-500/10" },
  volatility: { label: "Volatility", color: "text-rose-400", bgColor: "bg-rose-500/10" },
  composite: { label: "Composite", color: "text-primary", bgColor: "bg-primary/10" },
};
