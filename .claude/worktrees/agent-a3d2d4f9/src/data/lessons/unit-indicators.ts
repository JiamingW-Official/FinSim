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
    /* ================================================================
       LESSON 1 — Moving Averages (indicators-1)
       ================================================================ */
    {
      id: "indicators-1",
      title: "Moving Averages",
      description:
        "Master SMA, EMA, crossover systems, and dynamic support/resistance",
      icon: "TrendingUp",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "The Simple Moving Average (SMA)",
          content:
            "A **Simple Moving Average (SMA)** is the arithmetic mean of a security's closing prices over a defined look-back period.\n\n**Formula**: SMA(n) = (C1 + C2 + ... + Cn) / n, where C is the closing price and n is the period.\n\n- A **20-day SMA** sums the last 20 closing prices and divides by 20. Each new bar drops the oldest close and adds the newest, creating a rolling window.\n- SMA treats every data point **equally** regardless of how recent it is. This produces a smooth line but introduces **lag** -- the average always trails current price action.\n- Common SMA periods: **10** (short-term), **20** (swing), **50** (intermediate), **200** (long-term institutional benchmark).\n- On the CMT exam you will see SMA described as a **lagging indicator** because it is derived entirely from historical data. It confirms trends rather than predicting them.\n- **Key insight**: The slope of the SMA matters as much as the price-vs-MA relationship. A rising SMA confirms an uptrend; a flattening SMA warns of trend exhaustion.",
          visual: "indicator-chart",
          highlight: ["SMA", "lag", "trend"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock closes at $48, $50, $52, $49, $51 over five consecutive days. What is the 5-day SMA?",
          options: ["$50.00", "$51.00", "$49.50", "$50.50"],
          correctIndex: 0,
          explanation:
            "SMA(5) = (48 + 50 + 52 + 49 + 51) / 5 = 250 / 5 = $50.00. Every close is weighted equally in the calculation.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "The Exponential Moving Average (EMA)",
          content:
            "The **Exponential Moving Average (EMA)** applies a weighting multiplier that gives progressively more importance to recent prices.\n\n**Smoothing factor (k)**: k = 2 / (n + 1). For a 20-period EMA, k = 2/21 = 0.0952.\n\n**Recursive formula**: EMA_today = (Close_today x k) + (EMA_yesterday x (1 - k)).\n\n- Because the most recent price carries the heaviest weight, the EMA **reacts faster** to new price changes than the SMA of the same period.\n- The trade-off: faster response means more **noise sensitivity**. In choppy, range-bound markets an EMA generates more false signals (whipsaws) than an SMA.\n- The initial EMA value is seeded with the SMA of the first n bars. After that, the recursive formula takes over.\n- **Weighted Moving Average (WMA)** is another variant: it assigns linearly declining weights (n, n-1, ... 1) divided by the sum n(n+1)/2. WMA sits between SMA and EMA in responsiveness.\n- **Adaptive MAs** (e.g., Kaufman's KAMA) dynamically adjust their smoothing factor based on market noise, speeding up in trends and slowing in ranges.",
          visual: "indicator-chart",
          highlight: ["EMA", "smoothing factor", "weighted"],
        },
        {
          type: "quiz-tf",
          statement:
            "An EMA with a smoothing factor of 2/(n+1) gives approximately 86% of its weight to the most recent half of the data points.",
          correct: true,
          explanation:
            "Due to exponential decay, roughly 86% of the total weight falls within the most recent n periods. This is why the EMA responds faster -- older data fades exponentially rather than dropping off abruptly like the SMA window.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Golden Cross and Death Cross",
          content:
            "The **Golden Cross** occurs when the 50-day SMA crosses above the 200-day SMA. It signals that medium-term momentum has turned bullish relative to the long-term trend.\n\n- Historically, Golden Crosses on the S&P 500 have preceded average 12-month returns of roughly 10-15%, though the signal's value is debated by academics.\n- The **Death Cross** is the opposite: the 50-day SMA crosses below the 200-day SMA, signaling bearish momentum.\n- **Volume confirmation**: A Golden Cross is more reliable when accompanied by above-average volume on the crossover day. Low-volume crosses are more prone to failure.\n- These are **lagging signals** by nature -- by the time the 50 crosses the 200, a significant price move has already occurred. Traders use them as confirmation, not entry timing.\n- **Dual MA crossover systems** (e.g., 10/30, 20/50) use shorter periods for more responsive signals but accept more whipsaws as the cost.\n- In **ranging or choppy markets**, MAs flatten and produce repeated false crossovers. Always check the slope of both MAs before trusting a cross.",
          highlight: ["Golden Cross", "Death Cross", "volume confirmation"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Stock XYZ has been in a downtrend. Today the 50-day SMA ($142.50) crosses above the 200-day SMA ($141.80). Volume is 3x the 20-day average. The 200-day SMA slope is flat.",
          question: "How should a CMT-level technician interpret this signal?",
          options: [
            "Golden Cross confirmed by high volume -- bullish, but flat 200-day SMA suggests the long-term trend is not yet decisively up",
            "Immediate strong buy -- Golden Cross guarantees an uptrend",
            "Bearish signal because the 200-day is flat",
            "Ignore it -- Golden Crosses only work on weekly charts",
          ],
          correctIndex: 0,
          explanation:
            "A Golden Cross with volume confirmation is bullish, but a flat 200-day SMA means the long-term trend has not fully committed to the upside. A disciplined technician would treat this as a positive development requiring follow-through (continued price action above both MAs) before establishing full positions.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Moving Averages as Dynamic Support and Resistance",
          content:
            "Institutional traders and algorithms often place orders around key MAs, turning them into self-fulfilling **dynamic support and resistance** levels.\n\n- The **200-day SMA** is the most widely watched. When price pulls back to the 200-day in an uptrend, buyers often step in, creating a support bounce.\n- The **50-day SMA** serves as intermediate support in healthy uptrends. A break below the 50-day often accelerates selling.\n- **MA Envelope Channels** place fixed percentage bands (e.g., +/-3%) around an MA. Price reaching the upper envelope in an uptrend may indicate overextension; price touching the lower envelope may signal a buy-the-dip opportunity.\n- **Key rule**: In an uptrend, MAs act as support. In a downtrend, MAs act as resistance. When price breaks through an MA with conviction, that MA switches roles.\n- Multiple MAs stacking in order (10 > 20 > 50 > 200, all rising) is called a **bullish alignment** and represents the strongest trend configuration.",
          visual: "indicator-chart",
          highlight: ["dynamic support", "resistance", "envelope"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader using a 10/30 SMA crossover system experiences five false signals in two weeks. What market condition most likely caused this?",
          options: [
            "A range-bound, choppy market with no clear trend",
            "A strong trending market with high momentum",
            "A market experiencing a single large gap",
            "A market with steadily declining volume",
          ],
          correctIndex: 0,
          explanation:
            "Whipsaw occurs when price oscillates around both MAs in a range-bound market. The MAs flatten and repeatedly cross each other. This is the primary weakness of all MA crossover systems -- they perform poorly without a sustained trend.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Lag Problem and Practical Solutions",
          content:
            "Because MAs are computed from past prices, they will always **lag** behind current price action. This creates two practical problems:\n\n- **Late entries**: By the time an MA crossover confirms an uptrend, the first 20-40% of the move may have already occurred.\n- **Late exits**: A crossover sell signal arrives after price has already dropped from its peak, giving back profits.\n\n**Solutions technicians use**:\n- **Reduce the period** (e.g., 5/13 EMA cross) for faster signals, accepting more noise.\n- **Use displaced MAs**: Shift the MA forward by a few bars to anticipate rather than confirm.\n- **Combine with leading indicators**: Use RSI divergence or MACD histogram peaks to get early warnings before an MA cross confirms.\n- **Price-vs-MA tests**: Rather than waiting for MA-vs-MA crosses, act when price closes above/below a key MA (faster signal).\n- **Anchored VWAP**: Volume-weighted average price from a significant swing point gives an institutional-grade dynamic level with less lag than traditional MAs.",
          highlight: ["lag", "displaced MA", "VWAP"],
        },
        {
          type: "quiz-tf",
          statement:
            "In a confirmed downtrend, the 50-day SMA typically acts as dynamic resistance when price rallies toward it.",
          correct: true,
          explanation:
            "When trend direction is down, previously supportive MAs flip to resistance. Sellers defend the 50-day SMA in downtrends just as buyers defend it in uptrends. This role reversal is a core principle of MA-based technical analysis.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock shows: price at $105, 10-day EMA at $103, 20-day SMA at $100, 50-day SMA at $98, 200-day SMA at $95. All MAs are rising. Volume has been above average for the past week.",
          question: "What is the technical assessment of this configuration?",
          options: [
            "Strong bullish alignment -- all MAs stacked in order, rising, with price above all. Trend is healthy.",
            "Overbought -- price is too far above the 200-day",
            "Bearish -- price always reverts to the 200-day",
            "Neutral -- need to wait for a crossover signal",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook bullish alignment: price > 10 EMA > 20 SMA > 50 SMA > 200 SMA, all with positive slopes. This stacking order indicates momentum is flowing in the same direction across all timeframes. The healthy spread between MAs and above-average volume confirm trend strength.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "A 20-day SMA envelope channel is set at +/-5%. If the 20-day SMA is $200, what is the upper envelope boundary?",
          options: ["$210", "$205", "$190", "$220"],
          correctIndex: 0,
          explanation:
            "Upper envelope = SMA x (1 + percentage) = $200 x 1.05 = $210. Envelope channels help identify overextended moves -- when price reaches the upper envelope, it may be stretched too far from the mean and due for a pullback.",
          difficulty: 1,
        },
        {
          type: "practice",
          instruction:
            "Enable the SMA 20 indicator on the chart, then advance 10 bars to observe how price interacts with the moving average as dynamic support/resistance.",
          objective: "Toggle SMA 20 and advance bars to spot a crossover signal",
          actionType: "indicator",
          challenge: {
            priceData: PRACTICE_SMA_CROSS.bars,
            initialReveal: PRACTICE_SMA_CROSS.initialReveal,
            objectives: [
              { kind: "toggle-indicator", indicator: "sma20" },
              { kind: "advance-time", bars: 10 },
            ],
            availableIndicators: [
              { id: "sma20", label: "SMA 20" },
              { id: "ema12", label: "EMA 12" },
            ],
            hint: "Click the SMA 20 chip, then use the advance button to watch the moving average interact with price.",
          },
        },
        {
          type: "teach",
          title: "Moving Averages in Professional Practice",
          content:
            "**How institutional traders use MAs**:\n\n- **Trend filters**: Many systematic funds only take long positions when price is above the 200-day SMA and short positions when below. This simple filter eliminates fighting the primary trend.\n- **Mean reversion entries**: Quantitative strategies buy when price is 2+ standard deviations below a 20-day SMA and sell when 2+ above.\n- **Sector rotation**: Compare a sector ETF's price to its 50-day SMA across all sectors. Overweight sectors trading above; underweight sectors trading below.\n- **Risk management**: A close below the 200-day SMA triggers portfolio de-risking in many pension and endowment mandates.\n\n**Key takeaways for this lesson**:\n- SMA = equal-weight average (laggy, smooth). EMA = exponential-weight (responsive, noisy).\n- Golden/Death Cross (50/200) is a long-term trend signal, not a timing tool.\n- MAs serve as dynamic S/R levels because institutions anchor orders around them.\n- Crossover systems fail in range-bound markets -- always assess trend context first.",
          highlight: ["trend filter", "mean reversion", "risk management"],
        },
      ],
    },

    /* ================================================================
       LESSON 2 — RSI: Momentum (indicators-2)
       ================================================================ */
    {
      id: "indicators-2",
      title: "RSI -- Momentum",
      description:
        "Wilder's RSI formula, divergence, failure swings, and Cardwell's ranges",
      icon: "Activity",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "Wilder's Relative Strength Index",
          content:
            "The **Relative Strength Index (RSI)** was developed by J. Welles Wilder Jr. in 1978. It is a **momentum oscillator** that measures the speed and magnitude of price changes on a scale of 0 to 100.\n\n**Formula**: RSI = 100 - [100 / (1 + RS)], where **RS** (Relative Strength) = Average Gain / Average Loss over n periods.\n\n- The default period is **14** (Wilder's original recommendation). The initial averages are simple means of the first 14 gains and losses.\n- Subsequent values use **Wilder smoothing**: Avg Gain = [(previous Avg Gain x 13) + current gain] / 14. This is an exponential smoothing technique with a decay factor of 1/n.\n- RSI is **bounded** between 0 and 100 by construction. When all closes are gains, RS approaches infinity and RSI approaches 100. When all closes are losses, RS = 0 and RSI = 0.\n- A common misconception: RSI does not measure price relative to another security. It measures a security's price momentum relative to its own recent history.\n- RSI is classified as a **leading or coincident** indicator because it can signal momentum changes before price confirms them through divergence patterns.",
          visual: "indicator-chart",
          highlight: ["RSI", "RS", "Wilder smoothing"],
        },
        {
          type: "quiz-mc",
          question:
            "Over the last 14 periods, a stock had an average gain of $1.50 and an average loss of $0.50. What is the RSI?",
          options: ["75", "66.7", "80", "50"],
          correctIndex: 0,
          explanation:
            "RS = 1.50 / 0.50 = 3.0. RSI = 100 - (100 / (1 + 3)) = 100 - 25 = 75. An RSI of 75 indicates strong upward momentum and is in the overbought zone above 70.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Overbought, Oversold, and the Centerline",
          content:
            "**Traditional levels**: RSI above **70** is considered **overbought** (price may have risen too fast). RSI below **30** is considered **oversold** (price may have fallen too fast).\n\n- **Critical nuance**: Overbought does NOT mean 'sell immediately.' In a strong uptrend, RSI can remain above 70 for weeks or months. Overbought is a condition, not a signal.\n- The **centerline at 50** separates bullish territory (above) from bearish territory (below). A sustained move above 50 after being below confirms bullish momentum shift.\n- **Failure swing**: A bullish failure swing occurs when RSI drops below 30 (oversold), bounces above 30, pulls back but stays above 30, then breaks above its prior high. This is a buy signal independent of price action.\n- **Bearish failure swing**: RSI rises above 70, pulls back below 70, rallies but fails to reach 70 again, then breaks below its prior low.\n- Failure swings are considered among the most reliable RSI signals because they represent internal momentum exhaustion confirmed by a structural break.",
          visual: "indicator-chart",
          highlight: ["overbought", "oversold", "failure swing"],
        },
        {
          type: "quiz-tf",
          statement:
            "An RSI reading of 80 is an automatic sell signal because the stock is overbought.",
          correct: false,
          explanation:
            "Overbought is a condition, not a signal. In strong uptrends, RSI can remain elevated (above 70 or even 80) for extended periods while price continues rising. Selling solely because RSI is high in a trending market is one of the most common mistakes retail traders make. You need a confirming reversal signal (divergence, failure swing, or trend break) before acting.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "RSI Divergence: The Power Signal",
          content:
            "**Divergence** occurs when price and RSI move in opposite directions, revealing hidden shifts in momentum beneath the surface.\n\n**Regular (Classic) Divergence** -- signals potential reversals:\n- **Bullish divergence**: Price makes a **lower low**, but RSI makes a **higher low**. Selling pressure is weakening even as price declines. Potential reversal UP.\n- **Bearish divergence**: Price makes a **higher high**, but RSI makes a **lower high**. Buying pressure is fading even as price rises. Potential reversal DOWN.\n\n**Hidden Divergence** -- signals trend continuation:\n- **Hidden bullish divergence**: Price makes a **higher low** (uptrend intact), but RSI makes a **lower low**. The pullback in RSI resets the oscillator without breaking the trend. Continuation UP.\n- **Hidden bearish divergence**: Price makes a **lower high** (downtrend intact), but RSI makes a **higher high**. The bounce in RSI resets without breaking the downtrend. Continuation DOWN.\n\n- Divergence is most reliable when it occurs at **extreme RSI levels** (near 70/30). Divergence at RSI 50 is less meaningful.\n- **Always wait for price confirmation** after spotting divergence. A trendline break or candlestick reversal pattern validates the signal.",
          highlight: [
            "bullish divergence",
            "bearish divergence",
            "hidden divergence",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock's price hit $80 with RSI at 75, then pulled back. It rallied to a new high of $84, but RSI only reached 68 on this second peak. Price is still above its 20-day SMA.",
          question: "What RSI signal is present and what does it imply?",
          options: [
            "Bearish divergence -- buying momentum is fading despite higher prices, warning of a potential reversal",
            "Bullish divergence -- momentum is accelerating",
            "Hidden bullish divergence -- trend continuation expected",
            "No signal -- RSI is between 30 and 70",
          ],
          correctIndex: 0,
          explanation:
            "Price made a higher high ($80 to $84) while RSI made a lower high (75 to 68). This is classic bearish divergence: the market is making new highs on weakening internal momentum. A technician would tighten stops or prepare for a potential pullback, while waiting for price confirmation before acting.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Andrew Cardwell's RSI Range Rules",
          content:
            "Andrew Cardwell, considered the foremost RSI expert after Wilder himself, discovered that RSI operates in **different ranges** depending on the primary trend.\n\n**Bull market RSI range**: RSI tends to oscillate between **40 and 80**. Pullbacks find support around RSI 40-50 (not 30). Readings above 80 are genuinely overbought in a bull.\n\n**Bear market RSI range**: RSI tends to oscillate between **20 and 60**. Rallies hit resistance around RSI 50-60 (not 70). Readings below 20 are genuinely oversold in a bear.\n\n- **Practical implication**: If you're waiting for RSI 30 to buy in a bull market, you may never get the signal. The 40-50 zone acts as the effective oversold level during uptrends.\n- Cardwell also introduced **positive/negative reversals** -- a form of hidden divergence where RSI makes a new extreme but price doesn't. These are continuation signals.\n- **Combining RSI with trend filters**: Use the 50-day or 200-day SMA to define the trend, then apply the appropriate RSI range. Above the 200-day? Use bull ranges. Below? Use bear ranges.\n- This context-dependent approach dramatically reduces false signals compared to rigid 70/30 thresholds.",
          highlight: ["bull range 40-80", "bear range 20-60", "Cardwell"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock is in a confirmed uptrend above its 200-day SMA. RSI pulls back to 44 and starts rising. According to Cardwell's range rules, what is the assessment?",
          options: [
            "RSI is near the bottom of the bull range (40-80) -- this is a buying opportunity in the trend",
            "RSI is neutral and gives no signal",
            "RSI must reach 30 before it is oversold enough to buy",
            "The uptrend is over because RSI fell below 50",
          ],
          correctIndex: 0,
          explanation:
            "In Cardwell's framework, during a bull market RSI oscillates between 40 and 80. An RSI pullback to 44 is equivalent to an 'oversold' condition within the bullish range. This is a high-probability pullback entry in the direction of the primary trend.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "RSI in Practice: Combining Signals",
          content:
            "Professional technicians rarely use RSI in isolation. Here are proven combination strategies:\n\n**RSI + Trendline Breaks**: Draw trendlines on the RSI chart itself. An RSI trendline break often precedes the price trendline break, giving early entry.\n\n**RSI + Moving Average**: A 9-period SMA of RSI can act as a trigger line (similar to MACD's signal line). Cross above = bullish; cross below = bearish.\n\n**RSI + Volume**: Divergence with declining volume is more reliable than divergence with rising volume, because it shows conviction is fading.\n\n**RSI Periods**:\n- **RSI(7)** or **RSI(9)**: More sensitive, more signals, more noise. Used for short-term trading.\n- **RSI(14)**: Wilder's default. Balanced.\n- **RSI(21)** or **RSI(25)**: Smoother, fewer signals but higher reliability. Used for swing/position trading.\n\n**Common mistakes to avoid**:\n- Selling only because RSI > 70 in a strong trend.\n- Ignoring the trend context (bull vs bear ranges).\n- Using RSI on very short periods (RSI(2)) without understanding it creates extreme noise.",
          highlight: ["RSI trendline", "RSI period", "combination"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock in an uptrend pulls back. Its first low was at $120 (RSI 45), and its second low was at $123 (RSI 38). Price is still above the 50-day SMA.",
          question: "What RSI pattern is this, and what does it suggest?",
          options: [
            "Hidden bullish divergence -- price made a higher low while RSI made a lower low, suggesting trend continuation upward",
            "Regular bullish divergence -- a reversal signal",
            "Bearish divergence -- the trend is weakening",
            "No pattern -- RSI is in neutral territory",
          ],
          correctIndex: 0,
          explanation:
            "Price: higher low ($120 to $123). RSI: lower low (45 to 38). This is hidden bullish divergence -- the RSI oscillator resets during a pullback without the price trend breaking. It indicates the uptrend is likely to continue. Price remaining above the 50-day SMA confirms the bullish context.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A bullish failure swing requires RSI to first drop below 30, bounce, pull back without breaching 30, then break above the intervening high.",
          correct: true,
          explanation:
            "Wilder specifically defined the bullish failure swing as: (1) RSI falls below 30, (2) bounces above 30, (3) pulls back but holds above 30, (4) breaks above the high point between steps 1 and 3. This four-step sequence confirms that bearish momentum has exhausted itself internally.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "A swing trader holding positions for 5-15 days wants to use RSI. Which period would provide the best balance of sensitivity and reliability?",
          options: [
            "RSI(14) -- Wilder's default, well-suited for swing timeframes",
            "RSI(2) -- maximum sensitivity for quick trades",
            "RSI(50) -- smoothest for long-term holds",
            "RSI(3) -- standard for swing trading",
          ],
          correctIndex: 0,
          explanation:
            "RSI(14) is the industry standard for swing trading timeframes. It generates enough signals to be useful for 5-15 day holds while filtering out most noise. RSI(2) is extremely noisy, and RSI(50) would be too slow to provide actionable signals for swing trades.",
          difficulty: 1,
        },
        {
          type: "practice",
          instruction:
            "Enable the RSI indicator and advance time through 10 bars. Watch for overbought/oversold readings and notice how RSI behaves at trend support levels.",
          objective:
            "Toggle RSI on and observe momentum shifts as price moves",
          actionType: "indicator",
          challenge: {
            priceData: PRACTICE_RSI_BOUNCE.bars,
            initialReveal: PRACTICE_RSI_BOUNCE.initialReveal,
            objectives: [
              { kind: "toggle-indicator", indicator: "rsi" },
              { kind: "advance-time", bars: 10 },
            ],
            availableIndicators: [
              { id: "rsi", label: "RSI 14" },
              { id: "sma20", label: "SMA 20" },
            ],
            hint: "Click RSI 14, then advance bars. Watch the RSI levels relative to 30/50/70 and compare with price direction.",
          },
        },
        {
          type: "teach",
          title: "RSI Mastery: Key Takeaways",
          content:
            "**RSI is one of the most versatile indicators in technical analysis. Here is your CMT-level summary:**\n\n- **Formula**: RSI = 100 - 100/(1+RS), where RS = Avg Gain / Avg Loss with Wilder smoothing.\n- **Standard levels**: 70 (overbought), 30 (oversold), 50 (centerline). But these shift based on trend context.\n- **Cardwell ranges**: Bull markets: 40-80. Bear markets: 20-60. Use the trend to set your thresholds.\n- **Divergence**: Regular divergence warns of reversals. Hidden divergence confirms continuations. Always wait for price confirmation.\n- **Failure swings**: RSI-only signals that don't require price pattern confirmation. Among the most reliable RSI setups.\n- **Avoid**: Mechanically selling at 70 or buying at 30 without trend context. RSI is a tool, not an autopilot.\n- **Combine**: RSI + trend filter (MA) + volume + price structure = a professional-grade momentum system.",
          highlight: ["divergence", "Cardwell", "failure swing"],
        },
      ],
    },

    /* ================================================================
       LESSON 3 — MACD Signals (indicators-3)
       ================================================================ */
    {
      id: "indicators-3",
      title: "MACD Signals",
      description:
        "Gerald Appel's MACD -- line, signal, histogram, and divergence mastery",
      icon: "GitCompareArrows",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "Anatomy of the MACD",
          content:
            "The **MACD (Moving Average Convergence Divergence)** was created by Gerald Appel in the late 1970s. It is a **trend-following momentum** indicator that reveals the relationship between two EMAs.\n\n**Three components**:\n- **MACD Line** = 12-period EMA minus 26-period EMA. When the fast EMA is above the slow EMA, MACD is positive (bullish momentum). When below, MACD is negative (bearish momentum).\n- **Signal Line** = 9-period EMA of the MACD line. It smooths the MACD and acts as a trigger line for buy/sell signals.\n- **Histogram** = MACD Line minus Signal Line. It visualizes the distance between the two and shows the rate of change of momentum.\n\n- The default parameters (12, 26, 9) were chosen by Appel for daily charts. Shorter settings (e.g., 8, 17, 9) increase sensitivity; longer settings (e.g., 19, 39, 9) produce slower, more reliable signals.\n- Unlike RSI, MACD is **unbounded** -- it has no fixed 0-100 range. This means you cannot define universal overbought/oversold levels.\n- The **zero line** represents the point where the 12 EMA equals the 26 EMA. A cross above zero means the short-term trend is faster than the long-term trend.",
          visual: "indicator-chart",
          highlight: ["MACD line", "signal line", "histogram"],
        },
        {
          type: "quiz-mc",
          question:
            "If the 12-period EMA is at $155 and the 26-period EMA is at $150, what is the MACD line value?",
          options: ["+5", "-5", "+155", "+150"],
          correctIndex: 0,
          explanation:
            "MACD Line = 12 EMA - 26 EMA = $155 - $150 = +5. A positive MACD value means the shorter-term EMA is above the longer-term EMA, indicating bullish short-term momentum relative to the longer trend.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Signal Line and Zero Line Crossovers",
          content:
            "MACD generates signals through two types of crossovers:\n\n**Signal Line Crossover** (more frequent):\n- **Bullish**: MACD line crosses above the signal line. Momentum is shifting to the upside. This is the most common MACD buy trigger.\n- **Bearish**: MACD line crosses below the signal line. Momentum is shifting to the downside.\n\n**Zero Line Crossover** (less frequent, more significant):\n- **Bullish**: MACD crosses above zero, meaning the 12 EMA has crossed above the 26 EMA. This confirms a shift from bearish to bullish trend.\n- **Bearish**: MACD crosses below zero, confirming bearish trend dominance.\n\n- Signal line crossovers generate **more signals** but include more whipsaws. Zero line crossovers are **slower** but represent genuine trend changes.\n- Professional approach: Use signal line crosses for entries/exits, but only trade in the direction indicated by the zero line. Example: Only take bullish signal line crosses when MACD is above zero (trend-filtered trading).\n- **Reliability increases** when a signal line crossover occurs far from the zero line, because it indicates a strong momentum shift rather than noise near equilibrium.",
          highlight: [
            "signal line crossover",
            "zero line crossover",
            "trend filter",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "When the MACD line crosses above zero, it means the 12-period EMA has crossed above the 26-period EMA.",
          correct: true,
          explanation:
            "Since MACD = 12 EMA - 26 EMA, the MACD line equals zero when the two EMAs are identical. A cross above zero means the 12 EMA has moved above the 26 EMA. This is mathematically equivalent to a bullish EMA crossover, but MACD displays it as a single line crossing a horizontal axis.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "MACD Histogram: The Early Warning System",
          content:
            "The histogram is the most **actionable** part of the MACD because it changes direction before the MACD line itself crosses the signal line.\n\n**Reading the histogram**:\n- **Rising histogram** (bars getting taller above zero or less negative below zero): Bullish momentum is increasing.\n- **Falling histogram** (bars getting shorter above zero or more negative below zero): Bullish momentum is decelerating.\n- **Histogram peak/trough**: When the histogram starts declining from a peak, it means the MACD line is about to cross below the signal line. When it starts rising from a trough, a bullish cross is imminent.\n\n**Peak-Trough Analysis** (Thomas Aspray's contribution):\n- A histogram peak followed by declining bars = early sell warning, even before the signal line cross.\n- A histogram trough followed by rising bars = early buy warning.\n- This gives traders **1-3 bars of lead time** over the standard crossover signal.\n\n**Histogram divergence**: When price makes a new high but the MACD histogram peak is lower than its previous peak, momentum is fading. This is equivalent to MACD divergence but shown more visually.\n- The histogram crosses the zero line whenever MACD crosses the signal line -- they are mathematically linked.",
          highlight: ["histogram peak", "early warning", "Aspray"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock is in an uptrend. The MACD histogram has been positive and growing for 8 bars. Today the histogram is still positive but is shorter than yesterday for the first time.",
          question: "What does this histogram change indicate?",
          options: [
            "Bullish momentum is decelerating -- an early warning that a bearish signal line crossover may be approaching",
            "The trend has reversed to bearish immediately",
            "Nothing significant -- the histogram always fluctuates",
            "The stock is now oversold",
          ],
          correctIndex: 0,
          explanation:
            "When the histogram transitions from rising to falling (even while still positive), it means the gap between the MACD and signal lines is narrowing. This is the earliest MACD warning of momentum loss. The MACD line hasn't crossed the signal line yet, so no bearish crossover has occurred -- but one may be approaching in 1-3 bars.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "MACD Divergence",
          content:
            "Like RSI, MACD can exhibit divergence from price -- and it is one of the strongest MACD signals.\n\n**Bullish MACD divergence**: Price makes a lower low, but the MACD line (or histogram) makes a higher low. The downward momentum is weakening despite new price lows.\n\n**Bearish MACD divergence**: Price makes a higher high, but the MACD line (or histogram) makes a lower high. Upward momentum is fading despite new price highs.\n\n- MACD divergence is most significant when it occurs with the MACD far from the zero line. Divergence near zero often lacks the momentum context to be meaningful.\n- **Best practice**: Look for divergence on the histogram AND the MACD line simultaneously. When both diverge from price, the signal has the highest reliability.\n- MACD divergence works best on **daily and weekly** timeframes. On intraday charts, the signal generates too many false positives.\n- **Key caution**: Divergence can persist for a long time before resolving. It identifies a condition (weakening momentum), not a precise timing point. Always wait for a confirming price trigger (trendline break, support/resistance break, or candlestick reversal).",
          highlight: ["MACD divergence", "histogram divergence", "confirmation"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock hits a new 52-week high at $200, but the MACD line peak is lower than it was at the previous price high of $190. What signal does this present?",
          options: [
            "Bearish divergence -- momentum is not confirming the new price high",
            "Bullish confirmation -- price and MACD are both strong",
            "A Golden Cross pattern",
            "No signal -- MACD only matters at zero line crosses",
          ],
          correctIndex: 0,
          explanation:
            "Price: higher high ($190 to $200). MACD: lower high. This is bearish divergence. Despite price reaching new highs, the momentum engine (MACD) is producing less thrust. This warns of potential trend exhaustion, though a confirming price trigger is needed before acting.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "MACD: Trending vs. Ranging Markets",
          content:
            "MACD was designed as a **trend-following** indicator. Its performance varies dramatically based on market conditions:\n\n**In trending markets** (MACD excels):\n- Signal line crossovers provide reliable entry/exit timing.\n- Zero line crosses confirm major trend shifts.\n- Histogram expansion confirms trend acceleration.\n- MACD tracks the trend like a compass, keeping traders on the right side.\n\n**In ranging markets** (MACD struggles):\n- The MACD oscillates around zero with frequent whipsaw crossovers.\n- Signal line crosses produce rapid buy-sell-buy sequences that erode capital.\n- Histogram bars are small and choppy, providing no clear direction.\n\n**Solutions for range detection**:\n- If the MACD oscillates within a narrow band around zero with rapid crossovers, the market is likely ranging. Switch to oscillators (RSI, Stochastics) instead.\n- Use the **ADX (Average Directional Index)** as a filter: ADX below 20 = ranging, avoid MACD signals. ADX above 25 = trending, trust MACD.\n- **Multi-timeframe approach**: Check the weekly MACD for direction, then use the daily MACD for entry timing. Only take daily signals that align with the weekly trend.",
          highlight: ["trending", "ranging", "ADX filter", "multi-timeframe"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Weekly MACD is above zero and above its signal line (bullish). Daily MACD just crossed below its signal line. ADX reads 32 on the daily chart.",
          question:
            "Using a multi-timeframe approach, how should you interpret this?",
          options: [
            "The weekly trend is bullish so this daily bearish cross is likely a pullback within the uptrend -- a potential dip-buying opportunity",
            "Sell immediately -- the daily bearish cross overrides the weekly",
            "The signals cancel each other out -- stay neutral",
            "ADX of 32 means the trend is weak, ignore all MACD signals",
          ],
          correctIndex: 0,
          explanation:
            "The weekly MACD defines the primary trend as bullish. The daily bearish crossover within a bullish weekly context is typically a pullback, not a reversal. ADX at 32 confirms the market is trending (above 25), so MACD signals are reliable. A professional approach: wait for the daily MACD to produce a new bullish crossover to enter long, aligned with the weekly uptrend.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Common MACD Mistakes",
          content:
            "**Mistake 1: Treating MACD as a bounded oscillator.** MACD has no fixed overbought/oversold levels like RSI. A MACD reading of +5 might be extreme for one stock and normal for another. Compare MACD to its own history, not to absolute values.\n\n**Mistake 2: Ignoring the trend context.** MACD signal line crosses in choppy, range-bound markets produce cascading losses. Always verify trend presence first (ADX, MA alignment).\n\n**Mistake 3: Using MACD alone.** MACD is a momentum tool, not a complete system. It doesn't account for volume, support/resistance, or market structure. Always combine with price action.\n\n**Mistake 4: Applying daily settings to intraday charts.** The 12/26/9 default was calibrated for daily bars. Intraday charts require faster settings or the signals will lag excessively.\n\n**Mistake 5: Trading every crossover.** Signal line crossovers near the zero line in flat markets are the lowest-quality signals. The best crossovers occur after a sustained move away from zero followed by convergence back.",
          highlight: ["unbounded", "trend context", "settings"],
        },
        {
          type: "quiz-tf",
          statement:
            "The MACD histogram crossing from positive to negative always occurs at the exact same moment the MACD line crosses below the signal line.",
          correct: true,
          explanation:
            "The histogram is defined as MACD Line minus Signal Line. When this value transitions from positive to negative, it means the MACD line has moved from above the signal line to below it -- which is by definition a bearish signal line crossover. They are mathematically identical events.",
          difficulty: 2,
        },
        {
          type: "practice",
          instruction:
            "Toggle on the MACD indicator and advance through 10 bars. Observe histogram expansion/contraction, signal line crossovers, and how they relate to price movement.",
          objective:
            "Enable MACD and observe crossovers and histogram momentum shifts",
          actionType: "indicator",
          challenge: {
            priceData: PRACTICE_MACD_SIGNAL.bars,
            initialReveal: PRACTICE_MACD_SIGNAL.initialReveal,
            objectives: [
              { kind: "toggle-indicator", indicator: "macd" },
              { kind: "advance-time", bars: 10 },
            ],
            availableIndicators: [
              { id: "macd", label: "MACD" },
              { id: "sma20", label: "SMA 20" },
              { id: "rsi", label: "RSI 14" },
            ],
            hint: "Click MACD, then advance bars. Watch for the histogram to peak and reverse -- this precedes the signal line crossover.",
          },
        },
        {
          type: "quiz-mc",
          question:
            "Which of the following MACD signals has the highest historical reliability?",
          options: [
            "A bullish signal line crossover that occurs well below the zero line after an extended decline, with histogram divergence",
            "A signal line crossover near the zero line in a range-bound market",
            "Any crossover on a 1-minute chart with default settings",
            "A zero line crossover with no prior divergence",
          ],
          correctIndex: 0,
          explanation:
            "The most reliable MACD buy signals occur after an extended decline pushes the MACD far below zero. When histogram divergence appears (higher troughs) followed by a bullish signal line crossover, the setup combines oversold conditions, improving momentum, and a trigger -- the three elements of a high-probability trade.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "MACD Mastery: Professional Framework",
          content:
            "**Your CMT-level MACD summary:**\n\n- **Construction**: MACD = 12 EMA - 26 EMA. Signal = 9 EMA of MACD. Histogram = MACD - Signal.\n- **Signal line crosses**: The primary entry/exit trigger. Best when far from zero. Weakest near zero in ranges.\n- **Zero line crosses**: Confirm major trend shifts (12 EMA crossing 26 EMA). Less frequent, more significant.\n- **Histogram**: The early warning system. Peaks and troughs precede crossovers by 1-3 bars. Use Aspray's peak-trough method for early signals.\n- **Divergence**: Bearish divergence (higher price high + lower MACD high) warns of exhaustion. Bullish divergence (lower price low + higher MACD low) warns of accumulation.\n- **Trend filter**: Only use MACD in trending markets (ADX > 25). In ranges, switch to RSI or Stochastics.\n- **Multi-timeframe**: Weekly sets direction, daily times entries. Only take daily signals aligned with the weekly trend.\n- **Settings**: 12/26/9 for daily. Shorten for intraday. Lengthen for weekly/monthly.",
          highlight: ["signal line", "histogram", "divergence", "trend filter"],
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Bollinger Bands (indicators-4)
       ================================================================ */
    {
      id: "indicators-4",
      title: "Bollinger Bands",
      description:
        "Standard deviation channels, %B, bandwidth, squeeze setups, and W/M patterns",
      icon: "Maximize2",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "John Bollinger's Volatility Bands",
          content:
            "**Bollinger Bands** were developed by John Bollinger in the 1980s. They are a **volatility-based** envelope built around a moving average.\n\n**Construction**:\n- **Middle Band** = 20-period Simple Moving Average (SMA).\n- **Upper Band** = 20 SMA + (2 x 20-period standard deviation).\n- **Lower Band** = 20 SMA - (2 x 20-period standard deviation).\n\n**Standard deviation** measures how dispersed prices are from the mean. Higher dispersion = wider bands. Lower dispersion = narrower bands.\n\n- The 2-standard-deviation setting captures approximately **95%** of price data based on a normal distribution assumption. Bollinger himself notes that price is not perfectly normally distributed, but 2 SD works well empirically.\n- **Key principle**: The bands adapt to volatility automatically. During calm markets, they contract. During volatile markets, they expand. This dynamic adjustment is what makes Bollinger Bands superior to fixed-percentage envelopes.\n- The 20-period SMA and 2 SD are defaults. Some traders use 10-period / 1.5 SD for short-term trading or 50-period / 2.5 SD for longer-term analysis.",
          visual: "indicator-chart",
          highlight: ["upper band", "lower band", "standard deviation"],
        },
        {
          type: "quiz-mc",
          question:
            "If the 20-day SMA is $100 and the 20-day standard deviation is $5, what are the upper and lower Bollinger Bands?",
          options: [
            "Upper: $110, Lower: $90",
            "Upper: $105, Lower: $95",
            "Upper: $115, Lower: $85",
            "Upper: $120, Lower: $80",
          ],
          correctIndex: 0,
          explanation:
            "Upper Band = SMA + 2 x SD = $100 + (2 x $5) = $110. Lower Band = SMA - 2 x SD = $100 - (2 x $5) = $90. The 2x multiplier on the standard deviation creates the characteristic width of the bands.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Key Bollinger Metrics: %B and Bandwidth",
          content:
            "Bollinger defined two derived indicators that quantify the band relationship:\n\n**%B (Percent B)**: Tells you where price sits within the bands.\n- Formula: %B = (Price - Lower Band) / (Upper Band - Lower Band)\n- %B = 1.0: Price is at the upper band.\n- %B = 0.5: Price is at the middle band (SMA).\n- %B = 0.0: Price is at the lower band.\n- %B > 1.0: Price has broken above the upper band.\n- %B < 0.0: Price has broken below the lower band.\n\n**Bandwidth**: Measures how wide the bands are relative to the middle band.\n- Formula: Bandwidth = (Upper Band - Lower Band) / Middle Band\n- Bandwidth is a pure measure of **volatility**. High bandwidth = high volatility. Low bandwidth = low volatility.\n- Bandwidth reaching a **6-month low** is a powerful alert: a volatility expansion (big move) is statistically likely.\n\n- %B is useful for systematic trading: buy when %B < 0.0 (price below lower band), sell when %B > 1.0 (price above upper band). But always apply trend context.\n- Bandwidth is most valuable as a **squeeze detector**, which we cover next.",
          highlight: ["%B", "Bandwidth", "volatility measure"],
        },
        {
          type: "quiz-tf",
          statement:
            "A %B value of 1.2 means the price has closed above the upper Bollinger Band.",
          correct: true,
          explanation:
            "%B = (Price - Lower) / (Upper - Lower). A value greater than 1.0 means the price exceeds the upper band. At %B = 1.2, price is 20% of the band width above the upper band. This can signal overextension or, in a strong trend, the beginning of 'walking the upper band.'",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "The Bollinger Squeeze: Volatility Compression",
          content:
            "The **Bollinger Squeeze** is one of the most popular and reliable setups in technical analysis. It exploits the cyclical nature of volatility.\n\n**Concept**: Volatility contracts and expands in cycles. Low-volatility periods (squeezes) precede high-volatility periods (expansions). The Squeeze identifies the compression phase.\n\n**Identification**:\n- Bandwidth drops to its lowest level in 6+ months.\n- The bands visually narrow into a tight channel.\n- Price action becomes range-bound with small candles.\n\n**Trading the Squeeze**:\n- The squeeze tells you a big move is coming, but NOT which direction. You need a **breakout confirmation**.\n- **Bullish breakout**: Price closes above the upper band with expanding volume. Go long.\n- **Bearish breakdown**: Price closes below the lower band with expanding volume. Go short.\n- **Headfake warning**: The initial breakout direction can be a false move (headfake). Bollinger himself noted that approximately 50% of squeezes start with a headfake in the opposite direction of the ultimate move.\n- **Pro technique**: Wait for the first breakout, then watch if the move reverses within 1-3 bars. If it does, the reversal direction is often the true breakout. This is the headfake trade.",
          highlight: ["Squeeze", "Bandwidth", "headfake"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Stock ABC shows Bollinger Bandwidth at its lowest reading in 8 months. Price has been trading in a $2 range for three weeks. Today, price gaps up through the upper band on volume 2.5x the 20-day average.",
          question: "What is the technical assessment?",
          options: [
            "A Bollinger Squeeze has resolved to the upside -- the bandwidth compression followed by an upper band breakout with strong volume is a bullish signal",
            "The stock is overbought and will reverse",
            "Bandwidth is irrelevant -- only %B matters",
            "Wait for the bands to contract further before acting",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook Squeeze resolution. The 8-month low in Bandwidth indicated volatility compression. The gap above the upper band with 2.5x volume provides breakout confirmation. The volume is critical -- it separates genuine breakouts from headfakes. A trader would go long with a stop below the middle band (20 SMA).",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "W-Bottom and M-Top: Bollinger Band Patterns",
          content:
            "John Bollinger identified specific patterns that combine band interaction with classic chart formations:\n\n**W-Bottom** (bullish reversal):\n1. Price touches or breaks below the lower band (first low).\n2. Price bounces to the middle band area.\n3. Price makes a new low BUT this second low holds at or above the lower band (%B is higher than at the first low).\n4. Price breaks above the reaction high between the two lows.\n- The W-Bottom is confirmed when the second low shows higher %B than the first. This means momentum is improving despite similar price levels -- the Bollinger Band equivalent of bullish divergence.\n\n**M-Top** (bearish reversal):\n1. Price touches or breaks above the upper band (first high).\n2. Price pulls back toward the middle band.\n3. Price makes a new high BUT this second high is at or below the upper band (%B is lower than at the first high).\n4. Price breaks below the reaction low.\n- The M-Top works like a double top but uses %B to confirm weakening momentum at the second peak.\n\n- Bollinger recommended combining these patterns with **RSI or volume** for confirmation. A W-Bottom with bullish RSI divergence is a very high-probability setup.",
          highlight: ["W-Bottom", "M-Top", "%B divergence"],
        },
        {
          type: "quiz-mc",
          question:
            "In a W-Bottom, what distinguishes the second low from the first low?",
          options: [
            "The second low has a higher %B reading (holds closer to or within the bands) despite price being at a similar level",
            "The second low must be lower than the first low in price",
            "The second low must touch the lower band more decisively",
            "The second low requires volume to be higher than the first low",
          ],
          correctIndex: 0,
          explanation:
            "The key to a Bollinger W-Bottom is %B improvement at the second low. Even if price is at the same level or slightly lower, a higher %B at the second trough means the bands have adjusted and price is holding up better relative to volatility. This is the Bollinger-specific form of divergence that confirms the pattern.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Walking the Bands in Strong Trends",
          content:
            "In a powerful trend, price can 'walk' along the upper or lower Bollinger Band for extended periods. This behavior confuses traders who expect mean reversion.\n\n**Walking the upper band** (strong uptrend):\n- Price repeatedly tags or exceeds the upper band without pulling back to the middle band.\n- Candles close near their highs consistently.\n- %B stays above 0.8 for many bars.\n- The middle band (20 SMA) acts as support during minor pullbacks.\n- **Do not short** simply because price is at the upper band during a trending walk.\n\n**Walking the lower band** (strong downtrend):\n- Price repeatedly tags or drops below the lower band.\n- %B stays below 0.2 for extended periods.\n- Rallies fail at the middle band (20 SMA acts as resistance).\n\n**How to recognize walking vs. reversal**:\n- **Walking**: Strong volume, candle bodies aligned with trend, %B stays extreme.\n- **Reversal imminent**: Volume declining, long wicks (shadows) appearing, %B starts improving (in a downtrend) or declining (in an uptrend) -- this is the W-Bottom or M-Top forming.\n- ADX above 30 combined with band walking confirms a strong trend.",
          highlight: ["walking the bands", "trend strength", "ADX confirmation"],
        },
        {
          type: "quiz-tf",
          statement:
            "When price touches the upper Bollinger Band, it is always a signal to sell or go short.",
          correct: false,
          explanation:
            "In strong uptrends, price 'walks' along the upper band for extended periods. Selling every time price touches the upper band during a trending walk generates repeated losses as price continues higher. Upper band touches are only potential sell signals in range-bound markets. Always assess whether the market is trending (use ADX or MA slope) before treating band touches as reversal signals.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Bollinger Bands + RSI: A Powerful Combination",
          content:
            "Bollinger Bands measure **volatility** while RSI measures **momentum**. Combining them creates a multi-dimensional view of market conditions.\n\n**High-probability setups**:\n\n- **Oversold bounce**: Price at lower band (%B near 0) + RSI below 30 + bullish candle pattern = strong buy signal. Two independent indicators agree the stock is stretched.\n- **Overbought reversal**: Price at upper band (%B near 1) + RSI above 70 + bearish candle = sell/short signal.\n- **Squeeze + RSI centerline**: Bandwidth at a low (squeeze forming) + RSI crossing above 50 = directional bias for the breakout is likely bullish.\n\n**Divergence confirmation**:\n- W-Bottom on Bollinger (%B higher at second low) + bullish RSI divergence (RSI higher at second low) = double-confirmed reversal. These are among the highest-probability setups in technical analysis.\n\n**Filtering with Bollinger + RSI**:\n- In a **Squeeze**: If RSI is above 50, prepare for an upside breakout. If below 50, prepare for a downside breakdown.\n- During **band walks**: RSI staying in Cardwell's bull range (40-80) while price walks the upper band confirms the trend is healthy. RSI dropping below 40 during an upper band walk warns the trend is cracking.",
          highlight: ["BB + RSI", "double confirmation", "squeeze direction"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Stock DEF made its first low at $50 with %B = -0.05 and RSI = 28. After a bounce to $54, it dropped to a second low at $49.50 with %B = 0.08 and RSI = 34. Volume on the second low is 40% lower than the first.",
          question:
            "What pattern is forming and what is the probability assessment?",
          options: [
            "A Bollinger W-Bottom confirmed by RSI bullish divergence and declining volume -- high-probability bullish reversal",
            "A bearish continuation because price made a lower low at $49.50",
            "No pattern -- the indicators are giving mixed signals",
            "A Bollinger Squeeze is forming",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook W-Bottom with triple confirmation: (1) %B improved from -0.05 to +0.08 at the second low (price held closer to the bands), (2) RSI made a higher low (28 to 34 = bullish divergence), (3) volume declined at the second low (selling pressure exhausted). This confluence of signals makes it a high-probability bullish reversal. Entry trigger: break above $54 (the reaction high between the two lows).",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "During a Bollinger Squeeze, price initially breaks below the lower band but reverses back inside the bands within 2 bars. What is this called?",
          options: [
            "A headfake -- the false breakdown suggests the real breakout will be to the upside",
            "A confirmed bearish breakout",
            "A W-Bottom pattern",
            "A Death Cross signal",
          ],
          correctIndex: 0,
          explanation:
            "A headfake occurs when the initial breakout from a Squeeze fails and reverses. Bollinger observed that many squeezes begin with a false move in one direction before the real breakout occurs the opposite way. A failed breakdown (headfake down) often leads to a powerful upside breakout, and vice versa. Traders who recognize the headfake can enter in the true breakout direction.",
          difficulty: 2,
        },
        {
          type: "practice",
          instruction:
            "Enable Bollinger Bands and advance through 15 bars. Watch for squeeze formation (narrowing bands), breakout direction, and how price interacts with the upper/lower bands.",
          objective:
            "Toggle Bollinger Bands and identify a squeeze-to-breakout sequence",
          actionType: "indicator",
          challenge: {
            priceData: PRACTICE_BB_SQUEEZE.bars,
            initialReveal: PRACTICE_BB_SQUEEZE.initialReveal,
            objectives: [
              { kind: "toggle-indicator", indicator: "bb" },
              { kind: "advance-time", bars: 15 },
            ],
            availableIndicators: [
              { id: "bb", label: "Bollinger" },
              { id: "rsi", label: "RSI 14" },
              { id: "sma20", label: "SMA 20" },
            ],
            hint: "Click Bollinger, then advance bars. Look for the bands to narrow (squeeze) and then expand as a breakout occurs. Notice the direction of the breakout.",
          },
        },
        {
          type: "teach",
          title: "Bollinger Bands Mastery: Professional Framework",
          content:
            "**Your CMT-level Bollinger Bands summary:**\n\n- **Construction**: 20 SMA +/- 2 standard deviations. Bands adapt dynamically to volatility.\n- **%B**: (Price - Lower) / (Upper - Lower). Tells you where price sits within the bands. Values above 1 or below 0 indicate band violations.\n- **Bandwidth**: (Upper - Lower) / Middle. A pure volatility measure. 6-month lows signal imminent volatility expansion.\n- **Squeeze**: Bandwidth compression followed by an expansion breakout. Watch for headfakes -- the initial move may reverse.\n- **W-Bottom / M-Top**: Double bottom/top patterns confirmed by %B improvement at the second extreme. Combine with RSI divergence for highest reliability.\n- **Walking the bands**: In strong trends, price stays at the upper or lower band. Do not fade the trend based on band touches alone.\n- **Best combinations**: BB + RSI (momentum + volatility). BB + Volume (conviction). BB + ADX (trend strength).\n- **Key principle**: Bollinger Bands show you where price IS relative to recent volatility. They do not predict direction by themselves -- always combine with momentum and trend tools.",
          highlight: [
            "Squeeze",
            "%B",
            "Bandwidth",
            "W-Bottom",
            "M-Top",
            "headfake",
          ],
        },
      ],
    },
  ],
};
