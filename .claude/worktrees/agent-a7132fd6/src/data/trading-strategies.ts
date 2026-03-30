export interface TradingStrategy {
  id: string;
  name: string;
  category: "momentum" | "mean-reversion" | "breakout" | "income" | "hedging" | "volatility";
  description: string;
  entryRules: string[];
  exitRules: string[];
  stopLoss: string;
  riskLevel: 1 | 2 | 3 | 4 | 5;
  expectedWinRate: number;
  expectedReturn: string;
  maxDrawdown: string;
  bestMarketCondition: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  educationalNote: string;
}

export const TRADING_STRATEGIES: TradingStrategy[] = [
  {
    id: "sma-crossover",
    name: "SMA Crossover",
    category: "momentum",
    description:
      "Enter when a short-term SMA crosses above a long-term SMA (golden cross) and exit on the reverse (death cross).",
    entryRules: [
      "50-day SMA crosses above 200-day SMA",
      "Price is above both SMAs",
      "Volume confirms the crossover with above-average activity",
    ],
    exitRules: [
      "50-day SMA crosses below 200-day SMA",
      "Price closes below the 200-day SMA for 3 consecutive days",
    ],
    stopLoss: "5% below the 200-day SMA at time of entry",
    riskLevel: 2,
    expectedWinRate: 0.45,
    expectedReturn: "8-15% annually",
    maxDrawdown: "15-20%",
    bestMarketCondition: "Trending markets with clear directional bias",
    difficulty: "beginner",
    educationalNote:
      "The golden cross is one of the most widely followed signals. Its main weakness is lag: by the time the crossover occurs, a significant portion of the move may have already happened.",
  },
  {
    id: "rsi-mean-reversion",
    name: "RSI Mean Reversion",
    category: "mean-reversion",
    description:
      "Buy oversold conditions (RSI < 30) and sell overbought conditions (RSI > 70), expecting price to revert to the mean.",
    entryRules: [
      "RSI(14) drops below 30",
      "Price is near a known support level",
      "No major negative catalyst or earnings event imminent",
    ],
    exitRules: [
      "RSI(14) rises above 50 (conservative) or 70 (aggressive)",
      "Price reaches the 20-day SMA",
    ],
    stopLoss: "3% below the recent swing low",
    riskLevel: 3,
    expectedWinRate: 0.55,
    expectedReturn: "10-20% annually",
    maxDrawdown: "12-18%",
    bestMarketCondition: "Range-bound or choppy markets",
    difficulty: "beginner",
    educationalNote:
      "RSI mean reversion works best in stable, range-bound markets. In strong trends, RSI can stay oversold or overbought for extended periods, leading to significant losses if you fight the trend.",
  },
  {
    id: "macd-divergence",
    name: "MACD Divergence",
    category: "momentum",
    description:
      "Identify divergences between price action and the MACD histogram to anticipate trend reversals.",
    entryRules: [
      "Price makes a lower low while MACD histogram makes a higher low (bullish divergence)",
      "MACD line crosses above the signal line for confirmation",
      "Volume increases on the reversal candle",
    ],
    exitRules: [
      "MACD histogram starts declining after reaching a peak",
      "Bearish divergence appears (price higher high, MACD lower high)",
    ],
    stopLoss: "Below the most recent swing low that formed the divergence",
    riskLevel: 3,
    expectedWinRate: 0.5,
    expectedReturn: "12-22% annually",
    maxDrawdown: "15-22%",
    bestMarketCondition: "Markets at potential turning points after extended moves",
    difficulty: "intermediate",
    educationalNote:
      "Divergences signal weakening momentum but not necessarily an immediate reversal. Always wait for confirmation before entering. Multiple divergences in succession increase reliability.",
  },
  {
    id: "bollinger-squeeze",
    name: "Bollinger Squeeze",
    category: "volatility",
    description:
      "Trade the volatility expansion that follows a period of low volatility when Bollinger Bands contract tightly.",
    entryRules: [
      "Bollinger Band width reaches a 6-month low",
      "Price breaks above the upper band (long) or below the lower band (short)",
      "Keltner Channels are inside Bollinger Bands (squeeze confirmation)",
    ],
    exitRules: [
      "Bollinger Band width expands to above-average levels",
      "Price reverses and crosses the middle band (20-day SMA)",
    ],
    stopLoss: "Opposite Bollinger Band at time of breakout",
    riskLevel: 3,
    expectedWinRate: 0.48,
    expectedReturn: "15-25% annually",
    maxDrawdown: "18-25%",
    bestMarketCondition: "After periods of consolidation and low volatility",
    difficulty: "intermediate",
    educationalNote:
      "The squeeze identifies coiled energy in price. Low volatility always precedes high volatility. The direction of the breakout determines the trade; false breakouts are the main risk.",
  },
  {
    id: "breakout",
    name: "Breakout Trading",
    category: "breakout",
    description:
      "Enter positions when price breaks through established support or resistance levels with strong volume.",
    entryRules: [
      "Price breaks above resistance (or below support) with volume 1.5x the 20-day average",
      "The breakout level has been tested at least 2-3 times previously",
      "Price closes above the level, not just wicks through it",
    ],
    exitRules: [
      "Measured move target (height of the range added to breakout point)",
      "Trailing stop of 2x ATR from the highest close",
    ],
    stopLoss: "Just below the breakout level (support becomes resistance)",
    riskLevel: 3,
    expectedWinRate: 0.42,
    expectedReturn: "15-30% annually",
    maxDrawdown: "20-28%",
    bestMarketCondition: "Markets transitioning from consolidation to trending",
    difficulty: "intermediate",
    educationalNote:
      "Most breakouts fail. The key is filtering for high-quality setups with volume confirmation and waiting for a retest of the breakout level before entering to reduce false breakout risk.",
  },
  {
    id: "pullback",
    name: "Pullback Trading",
    category: "momentum",
    description:
      "Buy temporary dips in an established uptrend, using moving averages or Fibonacci levels as entry zones.",
    entryRules: [
      "Price is in an established uptrend (higher highs and higher lows)",
      "Price pulls back to the 20-day EMA or 38.2%-50% Fibonacci retracement",
      "A bullish reversal candle forms at the pullback level",
    ],
    exitRules: [
      "Price makes a new high above the prior swing high",
      "Trailing stop using the 20-day EMA",
    ],
    stopLoss: "Below the pullback low or the 61.8% Fibonacci level",
    riskLevel: 2,
    expectedWinRate: 0.55,
    expectedReturn: "12-20% annually",
    maxDrawdown: "12-16%",
    bestMarketCondition: "Strong trending markets with orderly pullbacks",
    difficulty: "beginner",
    educationalNote:
      "Pullback trading is one of the highest-probability setups because you trade with the trend. The challenge is distinguishing a healthy pullback from a trend reversal.",
  },
  {
    id: "gap-fill",
    name: "Gap Fill",
    category: "mean-reversion",
    description:
      "Trade the tendency of price gaps to fill, entering counter to the gap direction after the initial reaction.",
    entryRules: [
      "Stock gaps up or down more than 2% at the open",
      "No major fundamental catalyst justifying the gap",
      "Price shows reversal signs within the first 30 minutes of trading",
    ],
    exitRules: [
      "Gap is fully filled (price returns to prior close)",
      "Time-based exit: close the position by end of day if gap is not filled",
    ],
    stopLoss: "Beyond the gap high (for gap-up fades) or gap low (for gap-down buys)",
    riskLevel: 4,
    expectedWinRate: 0.6,
    expectedReturn: "20-35% annually",
    maxDrawdown: "25-35%",
    bestMarketCondition: "Range-bound markets without strong catalysts",
    difficulty: "advanced",
    educationalNote:
      "About 70% of gaps eventually fill, but timing matters. Avoid fading gaps caused by earnings, FDA decisions, or other fundamental catalysts, as these often do not fill quickly.",
  },
  {
    id: "pairs-trading",
    name: "Pairs Trading",
    category: "mean-reversion",
    description:
      "Go long one stock and short a correlated stock when their spread diverges from the historical mean.",
    entryRules: [
      "Two highly correlated stocks (r > 0.8) show spread divergence > 2 standard deviations",
      "No fundamental reason for the divergence (e.g., different earnings impact)",
      "The pair has a history of mean-reverting within 10-15 trading days",
    ],
    exitRules: [
      "Spread reverts to within 0.5 standard deviations of the mean",
      "Maximum holding period of 20 trading days",
    ],
    stopLoss: "Spread widens to 3 standard deviations",
    riskLevel: 3,
    expectedWinRate: 0.62,
    expectedReturn: "8-15% annually",
    maxDrawdown: "10-15%",
    bestMarketCondition: "Any market condition (market-neutral strategy)",
    difficulty: "advanced",
    educationalNote:
      "Pairs trading is market-neutral, meaning it profits regardless of market direction. The risk is that correlations can break down permanently during structural changes in a company or sector.",
  },
  {
    id: "iron-condor",
    name: "Iron Condor",
    category: "income",
    description:
      "Sell an OTM call spread and an OTM put spread simultaneously to collect premium in a range-bound market.",
    entryRules: [
      "IV Rank above 50% (options are relatively expensive)",
      "Stock has been range-bound for at least 20 days",
      "Select strikes at 1 standard deviation (roughly 16 delta) on each side",
    ],
    exitRules: [
      "Close at 50% of max profit to lock in gains",
      "Close if price approaches either short strike with > 10 days to expiry",
    ],
    stopLoss: "Close the tested side at 2x the credit received",
    riskLevel: 3,
    expectedWinRate: 0.68,
    expectedReturn: "15-25% annually on capital at risk",
    maxDrawdown: "Width of spreads minus credit received",
    bestMarketCondition: "Low-volatility, range-bound markets",
    difficulty: "intermediate",
    educationalNote:
      "Iron condors profit from time decay and the stock staying within a range. The strategy has a high win rate but individual losses can be larger than gains. Position sizing is crucial.",
  },
  {
    id: "covered-call",
    name: "Covered Call",
    category: "income",
    description:
      "Own shares and sell OTM call options against them to generate income, reducing cost basis over time.",
    entryRules: [
      "Own 100 shares of a stock you are willing to hold long-term",
      "Sell a call at a strike where you would be comfortable selling the shares",
      "Select 30-45 DTE for optimal theta decay",
    ],
    exitRules: [
      "Let the option expire worthless and sell a new one",
      "Buy back the call at 80% profit and roll to a new cycle",
    ],
    stopLoss: "Based on the underlying stock position, not the option",
    riskLevel: 2,
    expectedWinRate: 0.72,
    expectedReturn: "6-12% annually from premium alone",
    maxDrawdown: "Same as holding the stock (premium provides small buffer)",
    bestMarketCondition: "Flat to slightly bullish markets",
    difficulty: "beginner",
    educationalNote:
      "Covered calls are one of the safest options strategies. The tradeoff is capping your upside in exchange for premium income. It is ideal for stocks you plan to hold long-term.",
  },
  {
    id: "protective-put",
    name: "Protective Put",
    category: "hedging",
    description:
      "Buy a put option to protect an existing long stock position against downside risk, acting as portfolio insurance.",
    entryRules: [
      "Own shares with significant unrealized gains you want to protect",
      "Buy a put at or slightly below the current price",
      "Select an expiry that covers the risk period (e.g., through earnings)",
    ],
    exitRules: [
      "Let the put expire if the stock remains above the strike",
      "Exercise or sell the put if the stock drops significantly",
    ],
    stopLoss: "The put itself acts as the stop loss (max loss = premium paid + distance to strike)",
    riskLevel: 1,
    expectedWinRate: 0.35,
    expectedReturn: "Negative (insurance cost) unless stock drops significantly",
    maxDrawdown: "Limited to strike price minus stock price plus premium",
    bestMarketCondition: "When you expect or fear a significant downturn",
    difficulty: "beginner",
    educationalNote:
      "Think of protective puts as insurance: you pay a premium hoping you never need it. They are most cost-effective when IV is low. Consider collar strategies (adding a covered call) to offset the cost.",
  },
  {
    id: "calendar-spread",
    name: "Calendar Spread",
    category: "volatility",
    description:
      "Sell a near-term option and buy a longer-term option at the same strike to profit from time decay differential.",
    entryRules: [
      "IV Rank in the front month is higher than the back month",
      "Stock is expected to stay near the strike price",
      "Select ATM strikes for maximum theta differential",
    ],
    exitRules: [
      "Close at 25-50% profit on the spread",
      "Close when front month expires and roll to the next cycle",
    ],
    stopLoss: "Close if the spread value drops to 50% of the debit paid",
    riskLevel: 3,
    expectedWinRate: 0.52,
    expectedReturn: "20-40% per trade on capital at risk",
    maxDrawdown: "Total debit paid for the spread",
    bestMarketCondition: "Low-movement environments with elevated near-term IV",
    difficulty: "advanced",
    educationalNote:
      "Calendar spreads are a pure play on time decay. The front-month option decays faster than the back-month, widening the spread value. The biggest risk is a large move in either direction.",
  },
  {
    id: "trend-following",
    name: "Trend Following",
    category: "momentum",
    description:
      "Ride established trends using trailing stops, letting winners run while cutting losers quickly.",
    entryRules: [
      "Price makes a new 20-day high (long) or 20-day low (short)",
      "ADX(14) is above 25, confirming a strong trend",
      "Price is above the 50-day SMA for longs, below for shorts",
    ],
    exitRules: [
      "Price makes a new 10-day low (exit long) or 10-day high (exit short)",
      "Trailing stop of 3x ATR from the highest close",
    ],
    stopLoss: "2x ATR below entry price",
    riskLevel: 3,
    expectedWinRate: 0.4,
    expectedReturn: "15-30% annually",
    maxDrawdown: "20-30%",
    bestMarketCondition: "Markets with strong, sustained directional moves",
    difficulty: "intermediate",
    educationalNote:
      "Trend following has a low win rate but profits come from the few big winners that pay for many small losses. Psychological discipline to stay in winning trades and cut losers is essential.",
  },
  {
    id: "scalping",
    name: "Scalping",
    category: "momentum",
    description:
      "Make many small-profit trades throughout the day, exploiting bid-ask spreads and short-term momentum.",
    entryRules: [
      "Trade only highly liquid stocks with tight bid-ask spreads",
      "Enter on 1-minute or 5-minute momentum signals (VWAP bounces, level breaks)",
      "Risk no more than 0.1% of capital per trade",
    ],
    exitRules: [
      "Take profit at 0.1-0.3% gain per trade",
      "Exit immediately if the trade goes against you by 0.1%",
    ],
    stopLoss: "0.05-0.1% below entry (very tight)",
    riskLevel: 4,
    expectedWinRate: 0.6,
    expectedReturn: "20-50% annually (before commissions)",
    maxDrawdown: "5-10%",
    bestMarketCondition: "High-liquidity, high-volume trading sessions",
    difficulty: "advanced",
    educationalNote:
      "Scalping requires very fast execution and low commissions. Transaction costs can eat into profits significantly. It demands extreme focus and discipline throughout the trading session.",
  },
  {
    id: "swing-trading",
    name: "Swing Trading",
    category: "momentum",
    description:
      "Hold positions for 2-10 days, capturing short-term price swings using technical analysis and market sentiment.",
    entryRules: [
      "Identify stocks with clear short-term momentum (RSI between 40-60 turning up)",
      "Enter on a daily chart pattern breakout or support bounce",
      "Ensure the broader market trend supports the trade direction",
    ],
    exitRules: [
      "Target 3-8% gain per trade",
      "Exit at the next resistance level or after 10 trading days",
    ],
    stopLoss: "2-3% below entry or below the most recent swing low",
    riskLevel: 3,
    expectedWinRate: 0.52,
    expectedReturn: "15-30% annually",
    maxDrawdown: "15-22%",
    bestMarketCondition: "Markets with moderate volatility and clear swings",
    difficulty: "intermediate",
    educationalNote:
      "Swing trading balances the frequency of day trading with the patience of position trading. Overnight risk is the main concern, so avoid holding through earnings or major events unless intentional.",
  },
  {
    id: "sector-rotation",
    name: "Sector Rotation",
    category: "momentum",
    description:
      "Rotate capital into the strongest-performing sectors based on relative strength and economic cycle analysis.",
    entryRules: [
      "Identify the top 2-3 sectors by 3-month relative strength vs. SPY",
      "Confirm the economic cycle phase favors those sectors",
      "Use sector ETFs for broad exposure",
    ],
    exitRules: [
      "Sector drops out of the top 3 by relative strength",
      "Rebalance monthly or when leadership changes",
    ],
    stopLoss: "10% portfolio drawdown triggers a move to defensive sectors or cash",
    riskLevel: 2,
    expectedWinRate: 0.55,
    expectedReturn: "10-18% annually",
    maxDrawdown: "15-20%",
    bestMarketCondition: "Rotating bull markets with sector differentiation",
    difficulty: "intermediate",
    educationalNote:
      "Sector rotation captures the tendency for market leadership to shift. Early-cycle favors cyclicals and financials; mid-cycle favors tech and industrials; late-cycle favors energy and healthcare.",
  },
  {
    id: "dollar-cost-averaging",
    name: "Dollar Cost Averaging",
    category: "mean-reversion",
    description:
      "Invest a fixed amount at regular intervals regardless of price, reducing the impact of volatility over time.",
    entryRules: [
      "Set a fixed dollar amount to invest at a regular interval (weekly, monthly)",
      "Choose a diversified index fund or blue-chip stock",
      "Continue investing regardless of market conditions",
    ],
    exitRules: [
      "Based on financial goals, not market timing",
      "Rebalance annually to maintain target allocation",
    ],
    stopLoss: "None (long-term strategy)",
    riskLevel: 1,
    expectedWinRate: 0.85,
    expectedReturn: "7-10% annually (long-term average)",
    maxDrawdown: "30-50% (but recovers over time)",
    bestMarketCondition: "Any market condition (designed to be market-agnostic)",
    difficulty: "beginner",
    educationalNote:
      "DCA removes emotion from investing and ensures you buy more shares when prices are low. Studies show it underperforms lump-sum investing about two-thirds of the time, but it reduces regret risk.",
  },
  {
    id: "value-investing",
    name: "Value Investing",
    category: "mean-reversion",
    description:
      "Buy stocks trading below their intrinsic value based on fundamental analysis, waiting for the market to recognize true worth.",
    entryRules: [
      "P/E ratio below the sector average and historical average",
      "P/B ratio below 1.5 or below sector median",
      "Strong balance sheet (current ratio > 1.5, D/E < 0.5)",
    ],
    exitRules: [
      "Stock reaches estimated fair value (based on DCF or comparable analysis)",
      "Fundamentals deteriorate (revenue declines, margin compression)",
    ],
    stopLoss: "25% below purchase price (fundamental thesis may be wrong)",
    riskLevel: 2,
    expectedWinRate: 0.55,
    expectedReturn: "10-15% annually",
    maxDrawdown: "25-40%",
    bestMarketCondition: "Bear markets and corrections (more bargains available)",
    difficulty: "intermediate",
    educationalNote:
      "Value investing requires patience; the market can remain irrational longer than you can remain solvent. Focus on margin of safety: buy at a sufficient discount to intrinsic value to protect against errors in your analysis.",
  },
  {
    id: "dividend-growth",
    name: "Dividend Growth",
    category: "income",
    description:
      "Build a portfolio of companies with a track record of consistently increasing dividends, compounding income over time.",
    entryRules: [
      "Dividend growth streak of at least 10 consecutive years",
      "Payout ratio below 60% (sustainable dividends)",
      "Dividend yield between 2-5% (avoid yield traps)",
    ],
    exitRules: [
      "Company cuts or freezes the dividend",
      "Payout ratio exceeds 80% (dividend sustainability risk)",
    ],
    stopLoss: "Based on fundamental deterioration, not price action",
    riskLevel: 1,
    expectedWinRate: 0.75,
    expectedReturn: "8-12% annually (total return including dividends)",
    maxDrawdown: "20-30%",
    bestMarketCondition: "Any condition; dividends provide a floor during downturns",
    difficulty: "beginner",
    educationalNote:
      "Dividend growth investing harnesses the power of compounding. Reinvested dividends account for roughly 40% of the S&P 500 total return historically. Focus on dividend growth rate, not just current yield.",
  },
  {
    id: "momentum-factor",
    name: "Momentum Factor",
    category: "momentum",
    description:
      "Systematically buy stocks with the strongest recent performance and sell those with the weakest, capturing the momentum anomaly.",
    entryRules: [
      "Rank stocks by 12-month return excluding the most recent month",
      "Buy the top decile (strongest momentum)",
      "Rebalance monthly",
    ],
    exitRules: [
      "Stock falls out of the top quartile by momentum ranking",
      "Monthly rebalance replaces weakening names",
    ],
    stopLoss: "15% drawdown from recent high triggers review",
    riskLevel: 4,
    expectedWinRate: 0.5,
    expectedReturn: "12-20% annually",
    maxDrawdown: "25-40%",
    bestMarketCondition: "Trending markets with clear winners and losers",
    difficulty: "advanced",
    educationalNote:
      "The momentum factor is one of the most robust anomalies in finance, documented across markets and asset classes. The main risk is momentum crashes, which occur during sharp market reversals when past winners plummet.",
  },
];
