import type { Unit } from "./types";

export const UNIT_INDICATORS_MASTERY: Unit = {
  id: "indicators-mastery",
  title: "Technical Indicators Mastery",
  description: "Advanced indicator techniques used by professional traders",
  icon: "Activity",
  color: "#0ea5e9",
  lessons: [
    /* ================================================================
       LESSON 1 — Moving Averages in Depth (indicators-mastery-1)
       ================================================================ */
    {
      id: "indicators-mastery-1",
      title: "Moving Averages in Depth",
      description:
        "SMA vs EMA vs WMA vs VWMA, crossover systems, and dynamic S/R",
      icon: "TrendingUp",
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Four Types of Moving Averages Compared",
          content:
            "Professional technicians choose their moving average type based on how they want to balance smoothness against responsiveness.\n\n**Simple Moving Average (SMA)**: Equal weighting across all n bars. Formula: SMA = (C1 + C2 + ... + Cn) / n. Cleanest for identifying long-term trend direction but has the most lag.\n\n**Exponential Moving Average (EMA)**: Smoothing factor k = 2/(n+1). Most recent bar carries roughly 9.5% weight on a 20-period EMA. Reacts to price changes approximately 30-40% faster than an equivalent-period SMA.\n\n**Weighted Moving Average (WMA)**: Assigns linearly declining weights: n, n-1, ..., 1. Denominator = n(n+1)/2. WMA sits between SMA and EMA in responsiveness; useful when you want recency bias without EMA's compounding effect.\n\n**Volume-Weighted Moving Average (VWMA)**: Each bar's close is weighted by its volume relative to total volume over the period. VWMA = Sum(Close x Volume) / Sum(Volume). During high-volume sessions the VWMA pulls sharply toward price, making it a more institutionally relevant level.\n\n**Key comparison**: In a strong trending market with consistent volume, EMA and VWMA produce similar levels. In a market with one abnormally high-volume session, the VWMA will anchor significantly closer to that session's close.",
          visual: "indicator-chart",
          highlight: ["SMA", "EMA", "WMA", "VWMA"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock has five sessions with closes of $100, $102, $104, $103, $106 and volumes of 1M, 1M, 5M, 1M, 1M shares. Which statement about the 5-period VWMA is most accurate?",
          options: [
            "The VWMA will be closer to $104 because the high-volume day anchors it near that session",
            "The VWMA equals the 5-period SMA because volume evens out",
            "The VWMA will be above $106 because recent high closes dominate",
            "The VWMA is always identical to the EMA when volume is uniform",
          ],
          correctIndex: 0,
          explanation:
            "The $104 session had 5x normal volume (5M shares). In the VWMA formula, that close receives 5x the weight of each other session. The VWMA pulls toward $104 significantly more than the SMA ($103) or EMA. This is why VWMA is considered the most institutionally accurate MA -- it reflects where the most money actually transacted.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Crossover Systems: Performance and Optimization",
          content:
            "MA crossover systems are among the oldest mechanical trading rules. Historical backtests reveal important performance characteristics.\n\n**The 50/200 Golden/Death Cross on the S&P 500 (1950-2020)**:\n- Generated approximately 25 signals over 70 years (one every 2.8 years on average)\n- Average gain per bullish signal: +12.8% over 12 months\n- Win rate: approximately 68% (17 of 25 signals profitable)\n- Maximum drawdown before confirmation: often 15-20% already off peak\n\n**Shorter period systems (10/30 EMA)**:\n- Generate 8-15 signals per year -- far more trades\n- Individual win rates drop to 45-52% (below 50% in choppy markets)\n- Profit factor (gross gains / gross losses) typically 1.2-1.6 in trending regimes, below 1.0 in ranging regimes\n\n**Optimization trap**: The best-fit crossover pair for the past 5 years will rarely be the best pair for the next 5 years. This is called **curve fitting**. Professional practitioners choose MA periods with economic rationale (trading weeks, months, quarters) rather than optimization.\n\n**Whipsaw reduction**: Add a filter -- require the crossover to persist for 2 consecutive closes, or require the gap between MAs to exceed 0.5% of price before triggering. These filters reduce false signals by 25-35% at the cost of slightly later entries.",
          visual: "indicator-chart",
          highlight: ["Golden Cross", "whipsaw", "curve fitting"],
        },
        {
          type: "quiz-tf",
          statement:
            "Optimizing MA crossover periods on historical data to maximize backtest returns is a reliable method for selecting the best parameters for live trading.",
          correct: false,
          explanation:
            "This is the curve-fitting fallacy. Parameters optimized on past data are almost always over-fitted to historical noise rather than genuine market structure. Out-of-sample (forward-test) performance typically degrades sharply. Professional system designers use walk-forward testing and economically motivated parameters instead.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Dynamic Support and Resistance with MAs",
          content:
            "The most practical day-to-day use of moving averages is as dynamic support and resistance levels. Because institutional algorithms and fund managers reference the same standard MAs, these levels become self-fulfilling.\n\n**How dynamic S/R works**:\n1. In an uptrend, price periodically pulls back toward the 20 or 50-day MA.\n2. Algorithms set buy orders at or just below these levels.\n3. Buying pressure causes price to bounce, validating the MA as support.\n4. This process reinforces the MA's relevance for future tests.\n\n**Pullback quality assessment**:\n- Clean pullback to MA on declining volume = healthy trend continuation setup (high reliability)\n- Breakdown through MA on surging volume = potential trend change (not a buy)\n- Three or more tests of the same MA without bouncing = support is weakening\n\n**MA stacking (bullish alignment)**: When price > 8 EMA > 21 EMA > 50 SMA > 200 SMA and all are rising, traders describe this as a \"rainbow\" pattern. The most aggressive pullback-buy level is the 8 EMA; the most reliable is the 50 SMA.\n\n**Role reversal**: Once price closes convincingly below a key MA (especially on heavy volume), that MA flips from support to resistance. This role reversal is a high-conviction signal used to manage existing positions and plan short entries.",
          highlight: ["dynamic support", "role reversal", "MA stacking"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Stock ABC has been trending up for 6 months. Price pulled back to the 50-day SMA ($85) on three consecutive days with volume 40% below the 20-day average each day. On day four, price closes at $87.50 with volume 180% of average.",
          question: "What does this pattern most strongly indicate?",
          options: [
            "Successful test and hold of 50-day support -- the low-volume pullback followed by high-volume reversal confirms buyer conviction",
            "Triple-test of the 50-day signals imminent breakdown -- three tests means support is exhausted",
            "The low pullback volume means institutional investors have abandoned the stock",
            "Inconclusive -- the 50-day SMA has no predictive value",
          ],
          correctIndex: 0,
          explanation:
            "A pullback to a key MA on declining volume followed by a high-volume reversal day is a textbook support confirmation. Declining volume during the pullback signals lack of distribution (sellers are not aggressively unloading). The high-volume reversal shows institutional demand absorbed at the MA level. This is one of the highest-probability continuation setups in technical analysis.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Which MA is most commonly cited as the primary dynamic support level watched by institutional portfolio managers for US large-cap equities?",
          options: [
            "200-day SMA",
            "10-day EMA",
            "5-day SMA",
            "100-day WMA",
          ],
          correctIndex: 0,
          explanation:
            "The 200-day SMA is the single most-watched moving average in institutional circles. It represents approximately one trading year of data and is referenced in fund mandates, risk models, and sell-side research. A close below the 200-day often triggers automatic selling from systematic strategies, making it a self-reinforcing level.",
          difficulty: 1,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — RSI Advanced Usage (indicators-mastery-2)
       ================================================================ */
    {
      id: "indicators-mastery-2",
      title: "RSI Advanced Usage",
      description:
        "Divergence trading, failure swings, range shifts, and RSI-2 strategy",
      icon: "Activity",
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "RSI Divergence: The Highest-Probability RSI Signal",
          content:
            "Divergence between price and the RSI is considered the most reliable signal the indicator produces because it reveals a breakdown in momentum before price confirms the reversal.\n\n**Bullish Divergence**: Price makes a lower low, but RSI makes a higher low. Selling pressure is weakening even as price falls. This signals that the bears are losing conviction.\n\n**Bearish Divergence**: Price makes a higher high, but RSI makes a lower high. Buying pressure is fading even as price advances. Bulls are running out of steam.\n\n**Hidden Bullish Divergence**: Price makes a higher low (pullback), RSI makes a lower low. Trend is still bullish but RSI briefly dips deeper -- this signals the pullback is likely temporary and the uptrend will resume.\n\n**Hidden Bearish Divergence**: Price makes a lower high (bounce), RSI makes a higher high -- signals the bounce is a selling opportunity in a downtrend.\n\n**Divergence statistics (CMT research)**: Standard divergences on the RSI(14) have historically been followed by a reversal within 5-15 bars approximately 55-65% of the time on daily charts. The reliability improves significantly when divergence appears in an overextended RSI zone (above 70 or below 30) and is confirmed by a candlestick reversal pattern.\n\n**Important caveat**: Divergence can persist for multiple bars before price reacts. Traders use it to anticipate reversals, not as a standalone entry trigger -- always wait for a price confirmation.",
          visual: "indicator-chart",
          highlight: ["bullish divergence", "bearish divergence", "hidden divergence"],
        },
        {
          type: "quiz-mc",
          question:
            "Price makes a new 52-week high at $180 while RSI(14) reaches 71, below the previous peak RSI reading of 79 when price was at $165. What type of signal is this?",
          options: [
            "Bearish divergence -- price made a higher high but RSI made a lower high, signaling weakening momentum",
            "Bullish divergence -- RSI above 70 confirms strong momentum",
            "Hidden bullish divergence -- the trend will continue higher",
            "No divergence -- both price and RSI are in uptrend",
          ],
          correctIndex: 0,
          explanation:
            "This is textbook bearish divergence. Price advanced from $165 to $180 (a higher high), but RSI retreated from 79 to 71 (a lower high). The bulls needed more price effort to produce less RSI momentum. This erosion of buying pressure is an early warning sign that the uptrend may be running out of fuel.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "RSI Failure Swings: The Pure Momentum Signal",
          content:
            "Introduced by J. Welles Wilder himself in his 1978 book, **RSI Failure Swings** are signals based entirely on RSI's own price action -- no reference to the price chart is needed.\n\n**Bearish Failure Swing** (4 steps):\n1. RSI rises above 70 (overbought zone)\n2. RSI pulls back below 70\n3. RSI bounces but fails to reach 70 again (the failure)\n4. RSI breaks below the prior pullback low -- this break is the sell signal\n\n**Bullish Failure Swing** (4 steps):\n1. RSI falls below 30 (oversold zone)\n2. RSI bounces above 30\n3. RSI pulls back but does not go below 30 again (the failure)\n4. RSI breaks above the prior bounce high -- this is the buy signal\n\n**Why failure swings work**: The inability of RSI to re-enter the extreme zone on the second attempt demonstrates that momentum in the extreme direction has genuinely exhausted. Unlike standard divergence, the failure swing is confirmed the moment the RSI breaks its interim support/resistance.\n\n**Performance note**: Failure swings are faster confirmation signals than divergence. They tend to trigger entry earlier in the reversal but with slightly lower reliability (50-60% win rate when used in isolation). They are most powerful on the 4-hour or daily chart when they occur at key price S/R levels simultaneously.",
          highlight: ["failure swing", "overbought", "oversold"],
        },
        {
          type: "quiz-tf",
          statement:
            "An RSI bullish failure swing is confirmed the moment the RSI breaks above the high it made during its initial bounce from the oversold zone.",
          correct: true,
          explanation:
            "That is precisely Wilder's definition. After RSI bounces from below 30, makes a high, then pulls back without re-entering the oversold zone, the break above that bounce high is the confirmation trigger. Some traders also require the break to occur within a set number of bars (e.g., within 5 bars of the pullback) to avoid stale signals.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Range Shifts in Trending Markets",
          content:
            "Standard RSI interpretation uses 30/70 as oversold/overbought thresholds. However, in strongly trending markets, RSI operates in a **shifted range** that makes traditional thresholds misleading.\n\n**Bull market RSI range**: RSI tends to oscillate between 40 and 80. Readings in the 40-50 zone are healthy pullbacks (buy opportunities), not bear signals. RSI rarely drops below 30 in a sustained uptrend -- if it does, something is fundamentally breaking down.\n\n**Bear market RSI range**: RSI oscillates between 20 and 60. Bounces to the 50-60 zone are short-selling opportunities (resistance), not bull signals. RSI rarely sustains above 70 in a downtrend.\n\n**Identifying the regime**: To determine which range is active:\n1. If RSI repeatedly holds above 40 and cannot break above 80 = neutral/transitioning\n2. Sustained readings above 50 for 3+ months = bull market range (shift thresholds to 40/80)\n3. Sustained readings below 50 for 3+ months = bear market range (shift thresholds to 20/60)\n\n**Practical application**: In a confirmed uptrend, a trader who sells because RSI hits 70 (traditional overbought) will repeatedly exit winners too early. Shifting the overbought threshold to 80 and the oversold threshold to 40 keeps the trader aligned with the dominant trend.\n\n**Constance Brown**, CMT, popularized this concept in her book Technical Analysis for the Trading Professional, noting that RSI zones are not fixed but context-dependent.",
          highlight: ["range shift", "bull market RSI", "bear market RSI"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock has been in a confirmed uptrend for 8 months. RSI(14) pulls back to 42 while price touches the 50-day SMA. A trader who uses default 30/70 thresholds considers this 'neutral' and takes no action. A range-shift practitioner sees RSI at 42 in a bull market range.",
          question: "How does the range-shift practitioner interpret RSI at 42 in this scenario?",
          options: [
            "Near the bull-market oversold zone (40) at a major support level -- a high-probability long entry",
            "Deeply overbought -- RSI should be below 30 to buy",
            "Bearish -- RSI has left the 50-70 range typical of bull markets",
            "Neutral -- range shifts only apply to weekly charts",
          ],
          correctIndex: 0,
          explanation:
            "In a bull market RSI range (oscillates 40-80), an RSI reading of 42 is equivalent to the traditional 32 -- near oversold territory. Combined with the 50-day SMA test (a key dynamic support), this creates a confluence of technical factors favoring a long entry. The default 30/70 trader misses this setup entirely.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "The RSI-2 Short-Term Mean Reversion Strategy",
          content:
            "Developed by Larry Connors and popularized in his research, the **RSI-2 strategy** uses a 2-period RSI rather than the standard 14-period. The extreme sensitivity of RSI(2) makes it ideal for identifying very short-term oversold/overbought conditions within a larger trend.\n\n**RSI-2 Setup Rules**:\n1. Price must be above the 200-day SMA (long-term uptrend filter)\n2. RSI(2) falls below 10 (extremely oversold on a 2-bar basis)\n3. Enter long at market close on that day\n4. Exit when RSI(2) closes above 65 (mean reversion complete)\n\n**Historical backtest results (S&P 500 ETF, 1993-2010)**:\n- Win rate: approximately 68%\n- Average holding period: 2-4 trading days\n- Average gain per trade: approximately 1.2%\n- Performance degrades sharply when the 200-day SMA filter is removed (win rate drops to ~52%)\n- RSI(2) below 5 produced even higher win rates (~73%) with slightly lower frequency\n\n**Short side**: When price is below the 200-day SMA and RSI(2) rises above 90, short the close and exit when RSI(2) falls below 35.\n\n**Why it works**: In trending markets, extreme short-term RSI readings represent brief emotional overreactions (profit-taking, short-term panic) that resolve quickly in the direction of the larger trend. The 200-day SMA filter is critical -- it ensures you are fading short-term moves within the dominant trend, not fighting a genuine trend change.",
          highlight: ["RSI-2", "mean reversion", "200-day filter"],
        },
        {
          type: "quiz-mc",
          question:
            "An RSI-2 long setup triggers when the 2-period RSI falls below 10 with price above the 200-day SMA. What is the primary purpose of the 200-day SMA filter in this strategy?",
          options: [
            "To ensure you are buying pullbacks within an uptrend rather than catching falling knives in a downtrend",
            "To calculate the RSI-2 value more accurately",
            "To determine the position size for the trade",
            "To confirm the RSI-2 reading is statistically significant",
          ],
          correctIndex: 0,
          explanation:
            "The 200-day SMA filter is a trend regime filter. Without it, an RSI(2) below 10 in a downtrending stock often leads to continued decline -- you are catching a falling knife. With it, the same signal in an uptrending stock represents a temporary oversold extreme within a healthy trend, which has historically reverted upward with ~68% reliability.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — MACD Mastery (indicators-mastery-3)
       ================================================================ */
    {
      id: "indicators-mastery-3",
      title: "MACD Mastery",
      description:
        "Histogram interpretation, signal crossovers, zero-line rejection, and MACD divergence",
      icon: "BarChart2",
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "The MACD Components and What They Measure",
          content:
            "The **Moving Average Convergence/Divergence (MACD)** indicator was developed by Gerald Appel in the late 1970s. It is built from three components that each convey different information.\n\n**MACD Line**: 12-period EMA minus 26-period EMA. Positive MACD means short-term momentum is above long-term momentum (bullish); negative means short-term is below long-term (bearish).\n\n**Signal Line**: 9-period EMA of the MACD Line. Smooths the MACD to reduce noise. The crossover of MACD over the signal line is the classic trigger.\n\n**Histogram**: MACD Line minus Signal Line. The histogram visually represents the distance and direction of momentum. Expanding bars = accelerating momentum; contracting bars = decelerating momentum.\n\n**Standard settings (12, 26, 9)** reflect Gerald Appel's original work using two-week and one-month EMAs (trading weeks of 6 days in Appel's era). Many traders today use (8, 17, 9) for faster signals or (19, 39, 9) for longer-term trend confirmation.\n\n**Key insight**: The MACD is fundamentally a measure of momentum -- the rate of change of price. It does not predict future direction; it describes the current state of momentum. A rising MACD in negative territory (-0.5 to 0) means momentum is improving even though the net trend reading is still bearish.",
          visual: "indicator-chart",
          highlight: ["MACD line", "signal line", "histogram"],
        },
        {
          type: "quiz-mc",
          question:
            "The MACD histogram shows bars that are consistently getting smaller (but remaining positive) over the past six sessions while price continues to make new highs. What does this indicate?",
          options: [
            "Bullish momentum is decelerating -- price is rising but with diminishing rate of change",
            "The MACD is broken -- histogram should expand as price rises",
            "The trend is accelerating -- smaller histogram bars are a bullish sign",
            "Price is about to gap down -- histogram shrinkage guarantees a reversal within 2 bars",
          ],
          correctIndex: 0,
          explanation:
            "Shrinking histogram bars while price makes new highs is a warning sign of momentum deceleration. The histogram measures the gap between MACD and signal lines -- when it shrinks, the short-term EMA is approaching the long-term EMA, meaning the pace of the rally is slowing. This precedes many signal-line crossovers and is an early warning of potential trend exhaustion.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Signal Line Crossovers: Reliable and Unreliable Setups",
          content:
            "The MACD/signal line crossover is the most widely taught MACD signal, but its reliability varies enormously based on context.\n\n**High-reliability crossover conditions**:\n1. Crossover occurs well below zero (for bullish) or well above zero (for bearish) -- the MACD has fully committed to one extreme\n2. The crossover is preceded by histogram contraction (the two lines were converging for several bars)\n3. Crossover occurs at a structurally significant price level (breakout from a pattern, key MA test)\n4. Volume confirms the crossover -- expands on the day of the cross\n\n**Low-reliability crossover conditions**:\n1. Crossover occurs near the zero line -- frequent in choppy markets; these signals whipsaw repeatedly\n2. The histogram was minimal before the cross (lines were already almost touching -- little momentum behind the move)\n3. No price catalyst or structural support\n\n**Whipsaw frequency study**: On daily charts of the S&P 500 (2000-2020), MACD crossovers near the zero line (-0.5 to +0.5) had a positive expectancy of only 52%. Crossovers that occurred below -2.0 (for bullish) or above +2.0 (for bearish) had positive expectancy of 67%.\n\n**The histogram first derivative approach**: Some traders act when the histogram changes direction (from decreasing to increasing bars) rather than waiting for the full crossover. This provides earlier entry but with lower reliability.",
          highlight: ["signal crossover", "zero line", "histogram contraction"],
        },
        {
          type: "quiz-tf",
          statement:
            "A MACD bullish crossover (MACD line crossing above signal line) is more reliable when it occurs significantly below the zero line than when it occurs near zero.",
          correct: true,
          explanation:
            "A crossover far below zero indicates that both EMAs have fully adjusted to a downtrend and the turn represents a genuine momentum shift -- there is meaningful distance between the two lines before they cross. Near-zero crossovers in a ranging market represent noise; the EMAs are approximately equal and small price fluctuations repeatedly push the faster EMA above and below the slower one.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Zero-Line Rejection: Trend Continuation Signal",
          content:
            "The **zero-line rejection** is one of the most powerful and underutilized MACD signals. It occurs when the MACD Line approaches zero but fails to cross it, then reverses back in the original trend direction.\n\n**Bullish Zero-Line Rejection**:\n- MACD is in positive territory (above zero)\n- A pullback causes MACD to approach zero but it holds above\n- MACD turns back up without crossing zero\n- This signals the trend pullback is complete and the uptrend is resuming\n\n**Bearish Zero-Line Rejection**:\n- MACD is negative (below zero)\n- A bounce causes MACD to approach zero but it stalls just below\n- MACD turns back down without crossing zero\n- This signals a bear market bounce has failed and the downtrend is resuming\n\n**Why this works**: The zero line represents the equilibrium point between the two EMAs. When momentum is strong enough to prevent a zero-line crossing, it demonstrates that the dominant trend's force is still intact. A rejection at the zero line is equivalent to a price chart's \"test and hold\" of a key support level.\n\n**Practical entry**: Enter on the bar that confirms the rejection (MACD turns back in trend direction). Stop loss is placed at a level that would require the MACD to cross zero (trend structure broken). The risk:reward is typically 2:1 or better because the stop is tight and the trend continuation target is significant.",
          highlight: ["zero-line rejection", "trend continuation", "pullback test"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock has been in a strong uptrend for four months. The MACD(12,26,9) has been consistently positive. Price pulls back 8% over two weeks, causing the MACD to decline from +1.8 to +0.15. The MACD then turns up to +0.35 without crossing zero. Price simultaneously bounces off the 50-day SMA.",
          question: "What signal has been generated and what action does it support?",
          options: [
            "Bullish zero-line rejection confirmed by 50-day SMA test -- supports a long entry for trend continuation",
            "MACD near zero means the trend is over -- exit all longs",
            "The MACD must cross above +1.0 before a long entry is warranted",
            "Bearish -- MACD declining from +1.8 to +0.15 signals distribution",
          ],
          correctIndex: 0,
          explanation:
            "A MACD zero-line rejection (approached zero but held positive and turned up) combined with a 50-day SMA test creates a high-confluence bullish setup. Both the MACD structure (trend not broken, pullback resolved) and the price structure (held above key dynamic support) confirm the correction is complete. This is the professional approach to buying pullbacks rather than buying breakouts.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "MACD Divergence: Anticipating Major Turns",
          content:
            "MACD divergence uses the same logic as RSI divergence but with a different underlying measurement (momentum of EMAs vs raw price oscillator).\n\n**Classic Bearish MACD Divergence**:\n- Price makes higher high (e.g., $150 then $160)\n- MACD histogram peaks at a lower level on the second price high\n- Signals each successive rally required more price movement for less momentum\n\n**Classic Bullish MACD Divergence**:\n- Price makes lower low (e.g., $80 then $72)\n- MACD histogram makes a smaller negative bar (less downside momentum)\n- Bears are exhausting; each successive selloff produces less follow-through\n\n**Historical case study -- 2007 S&P 500 top**: The S&P 500 made its all-time high in October 2007 at 1576. The MACD had been showing bearish divergence since July 2007, when the index reached 1555 on a lower MACD reading than the July peak. This four-month divergence preceded a 57% decline.\n\n**Historical case study -- March 2009 bottom**: As the S&P hit its final low at 666, the MACD histogram was showing significantly less downside momentum than at the November 2008 low (752). This bullish divergence preceded the start of a 400%+ bull market.\n\n**Divergence trading rules**: (1) Divergence is a warning, not an entry signal. (2) Confirm with price -- wait for a trendline break, MA cross, or reversal candlestick. (3) Larger divergences (more time, more price separation) are more significant.",
          highlight: ["MACD divergence", "histogram", "momentum exhaustion"],
        },
        {
          type: "quiz-mc",
          question:
            "Over three months, a stock makes three successive price highs at $120, $128, and $135. The MACD histogram peaks at +2.4, +1.8, and +0.9 on those respective highs. What does this pattern suggest?",
          options: [
            "Triple bearish divergence -- each new price high requires progressively less momentum, increasing reversal risk",
            "Triple bullish divergence -- the declining histogram shows the stock is about to accelerate upward",
            "No divergence -- histogram values are all positive so the trend is healthy",
            "The MACD is malfunctioning -- histogram should increase with each new price high",
          ],
          correctIndex: 0,
          explanation:
            "Each successive price high (+$8, then +$7) requires progressively less MACD momentum (+2.4 > +1.8 > +0.9). This is triple bearish divergence and is considered more significant than a single-instance divergence. The stock is technically advancing but the engine driving the rally is consistently losing power. This pattern frequently precedes meaningful corrections or trend reversals.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Bollinger Bands Trading (indicators-mastery-4)
       ================================================================ */
    {
      id: "indicators-mastery-4",
      title: "Bollinger Bands Trading",
      description:
        "Band squeeze, %B indicator, double bottom within bands, and riding the bands",
      icon: "Maximize2",
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Bollinger Bands Construction and Statistical Foundation",
          content:
            "**Bollinger Bands** were developed by John Bollinger, CFA, CMT, in the early 1980s. They are built on a statistical foundation: the standard deviation of price from a moving average.\n\n**Construction**:\n- Middle Band: 20-period SMA\n- Upper Band: 20-period SMA + (2 x 20-period standard deviation)\n- Lower Band: 20-period SMA - (2 x 20-period standard deviation)\n\n**Statistical interpretation**: If price were normally distributed, approximately 95.4% of all closes would fall within the bands at any given time. In practice, financial returns are not normally distributed (fat tails exist), but the bands still capture roughly 88-90% of closes, making extreme band touches statistically meaningful.\n\n**Key properties**:\n1. Bands expand during high volatility (after large price moves)\n2. Bands contract during low volatility (during periods of consolidation)\n3. The middle band (20 SMA) acts as a mean-reversion target\n4. Bands are relative -- a touch of the upper band in a trending market is not overbought; the same touch in a ranging market may be\n\n**Settings**: The standard 20/2 setting works well for daily charts. Shorter-term traders use 10/1.5 or 10/2. Longer-term traders use 50/2.1. John Bollinger notes that adjusting the period requires adjusting the standard deviation multiplier to maintain approximately 88-89% containment.",
          visual: "indicator-chart",
          highlight: ["standard deviation", "volatility", "mean reversion"],
        },
        {
          type: "quiz-mc",
          question:
            "Bollinger Bands are set to (20, 2). Statistically, approximately what percentage of daily closes should fall inside the bands?",
          options: [
            "88-90% (statistical containment in practice for financial price series)",
            "68% (one standard deviation in a normal distribution)",
            "99.7% (three standard deviations in a normal distribution)",
            "100% -- price cannot close outside Bollinger Bands",
          ],
          correctIndex: 0,
          explanation:
            "While a mathematically perfect normal distribution would produce 95.4% containment at 2 standard deviations, real price series have fat tails and skewness. In practice, Bollinger Bands(20,2) contain approximately 88-90% of closes. The roughly 10-12% of closes outside the bands are not errors -- they are meaningful extremes that often signal important events.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Bollinger Band Squeeze: Identifying Volatility Breakouts",
          content:
            "The **Bollinger Band Squeeze** is arguably the most profitable setup the indicator generates. It exploits a fundamental property of volatility: low volatility periods are followed by high volatility periods (volatility mean reversion).\n\n**Identifying a Squeeze**:\n- The upper and lower bands contract to their narrowest width in 6+ months\n- A common quantification: band width = (Upper - Lower) / Middle Band. A 6-month low in band width confirms a squeeze.\n- Price coils in a tight range -- often inside the bands entirely\n- Volume typically declines during the squeeze (reduced participation)\n\n**The Squeeze Setup**:\n1. Identify the squeeze (band width at 6-month low)\n2. Wait for the breakout (price closes outside the band with volume expansion)\n3. Enter in the direction of the breakout\n4. The initial measured target is the band width at the time of breakout added to the breakout price\n\n**Direction prediction challenge**: The squeeze itself does not indicate which direction the breakout will occur. Some technicians use Bollinger Bands in conjunction with momentum indicators (MACD direction, RSI reading) to project likely breakout direction before it happens.\n\n**Statistics**: Research by John Bollinger shows that squeezes are followed by significant directional moves within 10 trading days approximately 70-75% of the time. The most powerful squeezes are those that form after a major trend move -- these often lead to the next leg of the trend.",
          highlight: ["squeeze", "volatility breakout", "band width"],
        },
        {
          type: "quiz-tf",
          statement:
            "A Bollinger Band Squeeze, by itself, tells the trader which direction the subsequent price breakout will occur.",
          correct: false,
          explanation:
            "The squeeze only signals that a high-volatility move is imminent -- it is direction-agnostic. A squeeze that resolves to the upside looks identical to one that resolves downward until the actual breakout occurs. Traders use supplementary tools (trend direction, MACD bias, volume distribution during the squeeze) to form a directional bias, but the squeeze itself carries no directional information.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "The %B Indicator and Double Bottom Within Bands",
          content:
            "**%B** is a derived indicator that converts the Bollinger Band position into a 0-to-1 oscillator.\n\n**%B Formula**: %B = (Price - Lower Band) / (Upper Band - Lower Band)\n- %B = 1.0 means price is at the upper band\n- %B = 0.0 means price is at the lower band\n- %B = 0.5 means price is at the middle band\n- %B > 1.0 means price is above the upper band (true extreme)\n- %B < 0.0 means price is below the lower band\n\n**W-Bottom (Double Bottom Within Bands)**:\nThis is one of Bollinger's highest-conviction setups:\n1. Price drops to or below the lower band -- first bottom (high fear, %B at or below 0)\n2. Price rallies to or above the middle band (20 SMA) -- interim recovery\n3. Price sells off again but holds above the lower band -- second bottom (%B between 0 and 0.5)\n4. Volume on the second low is lower than the first (diminishing selling pressure)\n5. Price rallies through the prior interim high -- confirmation\n\n**Why W-Bottom works**: The second low holding above the lower band (higher %B than the first) is divergence between price structure and band position -- selling is losing momentum. The middle band cross confirms the reversal.\n\n**M-Top (Double Top Within Bands)**: Mirror image -- second high fails to reach the upper band (%B < 1.0 on the second test), then price breaks back below the middle band.",
          highlight: ["%B", "W-bottom", "M-top"],
        },
        {
          type: "teach",
          title: "Riding the Bands in a Strong Trend",
          content:
            "A common Bollinger Band misconception is that a touch or close above the upper band is a sell signal. In reality, in a strong trending market, price can **ride the band** for extended periods, with multiple closes above (or below) the band.\n\n**Band Riding Characteristics**:\n- In a strong uptrend: price repeatedly closes at or above the upper band while the upper band itself is rising steeply\n- Each pullback finds support at or above the middle band (20 SMA)\n- The lower band rises but at a slower rate -- the asymmetric expansion confirms directional momentum\n- %B consistently stays in the 0.8-1.2 range during riding phases\n\n**How to trade band riding**:\n1. Enter on the first close outside the upper band after a consolidation period\n2. Add to position on each pullback that finds support at the middle band\n3. Exit when price closes back inside the upper band after a sustained riding period, especially if accompanied by a hook in the middle band direction\n\n**Band riding duration**: Studies of S&P 500 sector ETFs show that individual stocks can ride the upper band for 15-40 consecutive sessions during momentum phases. Trying to short every upper band touch during such phases is a losing strategy.\n\n**The walk down the lower band** is the bear market equivalent -- price repeatedly closes at or below the lower band. Each bounce to the middle band is a short-sale opportunity.",
          highlight: ["band riding", "trend momentum", "middle band"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Stock XYZ rallied strongly after an earnings beat. It has now made five consecutive daily closes above the upper Bollinger Band. The upper band is sloping upward at 45 degrees, the middle band (20 SMA) is rising, and the lower band is also rising. A friend says 'It has to revert to the mean -- sell it, it's way overbought.'",
          question: "Based on Bollinger Band theory, what is the most accurate assessment?",
          options: [
            "Band riding is occurring -- five closes above the upper band with an expanding, rising band structure signals strong momentum, not an immediate sell",
            "The friend is correct -- any close above the upper band is overbought and should be sold short",
            "After five closes above the upper band, a major reversal is statistically guaranteed",
            "The Bollinger Bands are not applicable after an earnings event",
          ],
          correctIndex: 0,
          explanation:
            "Five consecutive closes above an upward-sloping upper band with a rising middle and lower band is a textbook band-riding scenario. This is a sign of strength, not overextension to be faded. The exit signal comes when price closes back inside the upper band after riding, ideally with the middle band starting to flatten. Selling into a riding pattern based on 'overbought' logic consistently produces losses in strong trends.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "A W-Bottom Bollinger Bands pattern is confirmed when which condition is met?",
          options: [
            "Price rallies above the middle band (20 SMA) on the recovery from the second low",
            "Price makes a second low at exactly the same level as the first",
            "The lower band begins to expand after the second low",
            "The %B reaches 1.0 on the second low",
          ],
          correctIndex: 0,
          explanation:
            "Bollinger's W-Bottom confirmation is a close above the middle band (20 SMA) from the second low. The second low itself (which holds above the lower band) is the setup, but the confirmation signal is the middle band cross -- it proves that buyers have regained enough strength to push price above the mean. Without this cross, the second low could simply be continuation of the downtrend.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Volume Indicators (indicators-mastery-5)
       ================================================================ */
    {
      id: "indicators-mastery-5",
      title: "Volume Indicators",
      description:
        "OBV divergence, volume breakouts, VWAP as institutional anchor, and delta volume",
      icon: "BarChart",
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "On-Balance Volume: The Smart Money Tracker",
          content:
            "**On-Balance Volume (OBV)** was developed by Joe Granville in 1963 and remains one of the most insightful volume indicators available. It operates on a simple premise: volume precedes price.\n\n**OBV Formula**:\n- If today's close > yesterday's close: OBV = Prior OBV + Today's Volume\n- If today's close < yesterday's close: OBV = Prior OBV - Today's Volume\n- If today's close = yesterday's close: OBV = Prior OBV\n\n**The key insight**: OBV accumulates buying volume on up days and removes selling volume on down days. When smart money (institutions) quietly accumulates a position, they tend to buy on up days in size, pushing OBV higher even while price might not yet reflect the accumulation. This means OBV often leads price.\n\n**OBV Divergence signals**:\n- **Bullish OBV divergence**: Price makes a lower low but OBV makes a higher low -- accumulation is occurring despite weak price. This is a leading signal of a potential reversal upward.\n- **Bearish OBV divergence**: Price makes a higher high but OBV makes a lower high -- distribution is occurring despite strong price. Smart money is selling into the rally.\n\n**OBV trend**: OBV does not have a meaningful absolute value -- the slope and trend of OBV matter. OBV trending up in an uptrending stock confirms the move. OBV trending down while price moves sideways is a bearish divergence.\n\n**Historical accuracy note**: Studies of OBV divergences preceding significant moves show that OBV leads price by an average of 3-7 trading sessions on daily charts when institutional accumulation/distribution is present.",
          visual: "indicator-chart",
          highlight: ["OBV", "accumulation", "distribution", "divergence"],
        },
        {
          type: "quiz-mc",
          question:
            "Stock DEF has been trading sideways around $55 for three weeks. During this period, price has neither made a new high nor new low, but OBV has risen from 5.2M to 7.8M. What does this most likely indicate?",
          options: [
            "Quiet accumulation -- buyers are absorbing the float on up days while price consolidates; a breakout is increasingly likely",
            "The OBV reading is meaningless because price is flat",
            "Distribution -- rising OBV in a flat price environment means sellers are overcoming buyers",
            "OBV is a lagging indicator so it cannot lead price action",
          ],
          correctIndex: 0,
          explanation:
            "Rising OBV in a flat price environment is a classic accumulation signature. Buyers are absorbing shares on each up day, gradually raising the cumulative volume on the buy side, but the price is being held flat (possibly by a major seller distributing a large position, or simply by sellers matching each uptick). When the supply is exhausted, price typically breaks out with the OBV confirming the move by already being at a high.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Volume Breakout Analysis",
          content:
            "Volume is the fuel for price moves. Understanding how volume behaves at breakouts separates high-probability from low-probability trades.\n\n**High-probability breakout checklist**:\n1. Volume on the breakout bar is at least 150% of the 20-day average (ideally 200%+)\n2. Breakout closes in the upper 25% of the bar's range (not a bearish close inside the range)\n3. Volume has been declining during the consolidation preceding the breakout (reducing supply)\n4. The pattern being broken out of is well-defined (clear prior resistance, measured move target available)\n\n**Volume dry-up (VDU)**: The session or two immediately before a major breakout often show below-average volume -- supply is exhausted. Traders scan for the lowest-volume session in a 2-3 week consolidation as a potential breakout setup trigger.\n\n**Low-probability (trap) breakouts**:\n- Price closes above resistance but volume is only 80-120% of average -- institutional buy orders have not yet engaged\n- \"Thin tape\" breakouts -- price gaps above resistance in pre-market on no news and opens at resistance-turned-support with average volume; these often reverse\n\n**Volume thrust**: A volume thrust occurs when volume is more than 3x the 50-day average on a single session. This signals either capitulation (if on a down day) or institutional accumulation (if on an up day). A bullish volume thrust at a key support level is one of the highest-conviction buy signals in technical analysis.\n\n**The 10-day volume rule**: Technician Mark Minervini documented that the best momentum stocks show 10-day average volume at least 40% above the 50-day volume average during the final week before a breakout.",
          highlight: ["volume breakout", "volume thrust", "dry-up"],
        },
        {
          type: "quiz-tf",
          statement:
            "A price breakout above a 6-week consolidation on volume that is 90% of the 20-day average is typically considered a high-probability setup.",
          correct: false,
          explanation:
            "A breakout on below-average or just-average volume (90% of the 20-day average) is considered low-conviction. Institutional demand has not shown up in force to absorb the supply at the breakout level. Such breakouts frequently reverse back inside the pattern within 3-5 days. The minimum threshold for meaningful confirmation is generally 150% of average; 200%+ is strongly preferred by momentum traders.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "VWAP as the Institutional Anchor",
          content:
            "The **Volume Weighted Average Price (VWAP)** is calculated as the cumulative sum of (price x volume) divided by total volume, reset at the start of each trading session.\n\n**VWAP Formula**: VWAP = Cumulative(Price x Volume) / Cumulative(Volume)\n\n**Why institutions use VWAP**: Most institutional trade execution algorithms benchmark against VWAP. A buy order executed below VWAP is considered efficient (average buy price better than market); one above VWAP is considered costly. This means institutional order flow is consistently anchored to VWAP -- creating a powerful dynamic level.\n\n**Intraday VWAP rules**:\n- In an uptrending session, price holds above VWAP and pulls back to it repeatedly\n- In a downtrending session, price holds below VWAP and bounces to it repeatedly\n- A VWAP recapture (price crossing back above VWAP after being below) is often bullish intraday\n\n**Anchored VWAP (AVWAP)**: Calculated from a significant starting point (major swing low, earnings date, IPO date) rather than the daily open. This multi-session VWAP represents the average cost basis for buyers who entered since that anchor event.\n\n**Standard Deviation Bands on VWAP**: Known as VWAP Standard Deviations (VWAP-SD), typically plotted at +/-1, +/-2 SD. Price extended 2 SD above VWAP is statistically rare intraday and often reverts. Price reclaiming VWAP from below after touching -2 SD is a mean-reversion buy setup used by short-term traders.\n\n**Key difference from SMA**: VWAP weights each bar by its volume, not just its time position. A high-volume bar at $100 affects VWAP much more than a low-volume bar at the same price.",
          highlight: ["VWAP", "institutional anchor", "anchored VWAP"],
        },
        {
          type: "teach",
          title: "Delta Volume and Order Flow Analysis",
          content:
            "**Delta Volume** (also called volume delta or order flow delta) represents the net difference between buy-initiated volume and sell-initiated volume within a single bar or session.\n\nDelta = Buy Volume (trades that hit the ask) - Sell Volume (trades that hit the bid)\n\n**Positive delta**: More transactions occurred at the ask price -- buyers were more aggressive (lifting offers)\n**Negative delta**: More transactions occurred at the bid price -- sellers were more aggressive (hitting bids)\n\n**Delta divergence** is one of the most powerful short-term signals:\n- Price makes a new session high but delta is negative or declining -- buyers absorbed the move but sellers are growing more aggressive. Often precedes reversals.\n- Price makes a new session low but delta is positive or rising -- sellers pushed price down but buyers are defending aggressively. Often precedes bounces.\n\n**Cumulative delta**: When summed over multiple bars, cumulative delta tracks whether buying or selling pressure has dominated the session. If price is flat but cumulative delta is trending strongly positive, latent buying pressure will likely push price up.\n\n**Retail access limitation**: True tick-by-tick delta requires Level 2 data and specialized platforms (e.g., Sierra Chart, Bookmap, ATAS). Most retail platforms only show volume per bar, not bid/ask split. Proxies like OBV or Up-Volume/Down-Volume ratios approximate delta for retail traders.\n\n**Delta and institutional footprint**: Large institutions cannot fully hide their order flow in delta data. When an institution needs to buy 1 million shares, the sustained positive delta (aggressive buying at the ask) creates a traceable footprint that experienced order flow traders learn to recognize.",
          highlight: ["delta volume", "order flow", "bid/ask"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "During a 30-minute period, stock GHI makes three consecutive new session highs (from $50.00 to $50.45). The total volume during these highs is 850,000 shares. However, the volume delta for each new high bar is negative: -18,000, -25,000, and -31,000 shares (sellers are increasingly hitting bids even as price reaches new highs).",
          question: "What does this delta pattern most likely signal?",
          options: [
            "Bearish delta divergence -- price is making new highs but sellers are increasingly aggressive, suggesting a short-term reversal is likely",
            "Bullish continuation -- negative delta near highs means buyers are absorbing all selling",
            "Neutral -- delta is irrelevant when price is trending up",
            "The delta is confirming the uptrend -- new highs with any volume is positive",
          ],
          correctIndex: 0,
          explanation:
            "Progressively negative delta at successively higher prices is a textbook bearish order flow divergence. Price is being pushed to new highs (possibly by passive algorithmic bids being lifted), but increasing numbers of market participants are selling into these highs aggressively (hitting bids). The growing negative delta at each new high (-18k, -25k, -31k) signals that supply pressure is building. This often leads to a swift reversal once the passive buy support is exhausted.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "An institutional portfolio manager wants to buy 500,000 shares of a stock without significantly moving the price. She instructs her trading desk to execute 'VWAP orders.' What does this mean for her execution strategy?",
          options: [
            "She will spread purchases throughout the day proportional to the day's volume profile, aiming to match or beat the session VWAP as her average cost",
            "She will buy all 500,000 shares at the exact VWAP price once it is calculated at day's end",
            "She will only buy when price is above VWAP to confirm the uptrend",
            "She will use VWAP as a stop loss level",
          ],
          correctIndex: 0,
          explanation:
            "VWAP execution algorithms participate in trading proportional to volume throughout the day -- heavier buying when the market is liquid (open and close), lighter buying during the midday lull. This distribution allows a large order to blend into natural market activity and minimizes market impact. 'Beating VWAP' (achieving an average buy price below the day's VWAP) is considered successful institutional execution.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 6 — Combining Indicators (indicators-mastery-6)
       ================================================================ */
    {
      id: "indicators-mastery-6",
      title: "Combining Indicators",
      description:
        "Building confluence systems, avoiding redundancy, and ranking indicators by reliability",
      icon: "Layers",
      xpReward: 125,
      steps: [
        {
          type: "teach",
          title: "The Redundancy Problem: Why More is Not Better",
          content:
            "One of the most common mistakes retail traders make is stacking multiple indicators that all measure the same underlying market property. This creates a false sense of confirmation while providing no additional information.\n\n**Four indicator categories**:\n1. **Trend indicators**: MAs, ADX, MACD -- measure trend direction and strength\n2. **Momentum oscillators**: RSI, Stochastic, CCI, Williams %R -- measure speed and overbought/oversold conditions (derived from price)\n3. **Volatility indicators**: Bollinger Bands, ATR, Keltner Channels -- measure the range of price movement\n4. **Volume indicators**: OBV, VWAP, Volume Delta -- measure participation and commitment\n\n**The redundancy trap**: Adding RSI, Stochastic, and CCI to the same chart gives you three momentum oscillators that are all derived from the same price data. When RSI says overbought, Stochastic will almost certainly also say overbought. You have not confirmed anything -- you have simply repeated the same measurement three times.\n\n**True confirmation**: Real confluence comes from indicators in different categories agreeing. Example: A trend indicator (price above 200 SMA) + a momentum oscillator (RSI at 42 in a bull market range, near the pullback zone) + a volume indicator (OBV making new highs during the pullback) all point to the same conclusion through independent measurements.\n\n**Recommended maximum**: Most professional traders use 2-3 indicators from different categories. Adding a 4th or 5th rarely improves win rate and significantly increases decision complexity.",
          highlight: ["redundancy", "confluence", "indicator categories"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader uses RSI(14), Stochastic(14,3), and Williams %R(14) on the same chart. How many truly independent signals do these three indicators provide?",
          options: [
            "Effectively one -- all three are momentum oscillators derived from price, so they will nearly always agree with each other",
            "Three -- each uses a different formula so they are independent",
            "Two -- RSI and Stochastic agree but Williams %R is different",
            "Zero -- oscillators provide no useful information",
          ],
          correctIndex: 0,
          explanation:
            "RSI, Stochastic, and Williams %R are all momentum oscillators derived from the same underlying price data. Their mathematical formulas differ slightly, but they measure the same market property (price momentum relative to recent range) and will produce highly correlated signals. When all three say 'overbought,' you have effectively received the same warning three times -- not three independent confirmations.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Building a Confluence System",
          content:
            "A well-designed confluence system requires a signal from multiple independent categories before a trade is taken. Here is a practical example of a professional trend-following system:\n\n**System: The Three-Pillar Long Setup**\n\n**Pillar 1 -- Trend (MA category)**:\n- Price must be above the 50-day EMA\n- The 50-day EMA must be above the 200-day SMA\n- Both MAs must have positive slope\n\n**Pillar 2 -- Momentum (Oscillator category)**:\n- RSI(14) must have pulled back to the 40-55 range (pullback, not overbought extension)\n- Alternatively, MACD must show a zero-line rejection or bullish crossover from below zero\n\n**Pillar 3 -- Volume (Volume category)**:\n- OBV must be in an uptrend and not diverging from price\n- The pullback must occur on below-average volume (no distribution)\n- Ideally, a volume thrust on the breakout bar confirms entry\n\n**Entry**: When all three pillars align, enter on a limit order at or near the pullback level.\n**Stop loss**: Below the swing low of the pullback, or below the 50-day EMA (whichever is closer, max 5-7% risk)\n**Target**: The prior swing high, or a 2:1 risk/reward minimum.\n\n**Why this works**: The three pillars measure three independent things: Is the trend up? Is momentum recharged from a pullback? Has selling volume been light (no distribution)? When all three say yes, the probability of a successful continuation trade is substantially higher than any single signal.",
          highlight: ["three pillars", "trend", "momentum", "volume"],
        },
        {
          type: "quiz-tf",
          statement:
            "A trader who requires confluence from trend, momentum, and volume indicators before taking a trade will have fewer trade opportunities but is likely to achieve a higher per-trade win rate than a trader using a single indicator.",
          correct: true,
          explanation:
            "Confluence filters reduce total trade frequency by requiring multiple conditions to align simultaneously. However, research consistently shows that multi-condition setups have higher win rates than single-condition signals. The trade-off is opportunity cost (fewer trades taken) versus quality improvement (higher probability per trade). Professional traders generally prefer fewer, higher-conviction trades.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Ranking Indicators by Reliability",
          content:
            "Not all indicator signals carry equal weight. Based on research and practitioner experience, indicators can be roughly ranked by their historical reliability as standalone signals.\n\n**Tier 1 (Highest reliability -- standalone signals worth acting on)**:\n- VWAP recapture with volume thrust -- institutions are re-engaging\n- OBV divergence at a major price extreme (6+ month high/low) -- leading indicator of accumulation/distribution\n- Volume Thrust (3x average volume) at a key support/resistance level -- rare but high-conviction\n\n**Tier 2 (High reliability -- strong but prefer confirmation)**:\n- 200-day SMA slope change (from declining to rising) -- signals major trend shift\n- MACD zero-line rejection in the direction of the major trend\n- Bollinger Band Squeeze breakout on 2x+ average volume\n- RSI failure swing after RSI divergence\n\n**Tier 3 (Moderate reliability -- use as filters or context)**:\n- Simple MA crossovers (50/200, 10/30) -- well-known but lag-heavy\n- RSI overbought/oversold in trending markets (shifted thresholds needed)\n- MACD signal line crossovers near zero line -- high whipsaw rate\n\n**Tier 4 (Low standalone reliability -- valuable only in context)**:\n- Single candlestick patterns (doji, hammer) without volume or location confirmation\n- Stochastic alone in trending markets\n- Band touches (Bollinger Band upper/lower) without additional signals\n\n**Practical rule**: Build your primary trade thesis around Tier 1 or Tier 2 signals. Use Tier 3 and 4 signals to fine-tune entry timing or add conviction to existing higher-tier setups.",
          highlight: ["Tier 1", "Tier 2", "reliability ranking"],
        },
        {
          type: "teach",
          title: "Adapting Your Indicator Toolkit to Market Regimes",
          content:
            "No indicator works equally well in all market conditions. Professionals adapt which indicators they emphasize based on the current market regime.\n\n**Trending regime (ADX > 25, directional)**:\n- Emphasize: MAs (trend direction and dynamic S/R), MACD (momentum and zero-line tests), OBV (confirming accumulation)\n- De-emphasize: Oscillators (RSI, Stochastic) used as reversal signals -- in trends, overbought stays overbought\n- Best setup: Pullback to key MA on declining volume with OBV holding\n\n**Ranging regime (ADX < 20, non-directional)**:\n- Emphasize: Oscillators (RSI, Stochastic at range extremes), Bollinger Bands %B, mean reversion signals\n- De-emphasize: MA crossovers (generate whipsaws), MACD crossovers (repeated false signals)\n- Best setup: RSI below 30 at range support + Bollinger lower band + MACD positive divergence\n\n**High volatility regime (VIX > 30 or ATR significantly expanded)**:\n- Emphasize: ATR-based position sizing, Bollinger Band expansion plays, volume breakout signals\n- De-emphasize: Tight stop losses (wide bands make tight stops ineffective)\n- Widen all stop loss levels by 50-100% to accommodate volatility\n\n**Transition detection**: ADX rising from below 20 toward 25 signals a potential regime shift from ranging to trending. This is when MA crossover systems become dramatically more reliable and oscillator mean-reversion setups become riskier.\n\n**The adaptive approach**: Rather than finding one perfect indicator set, professional traders maintain two or three system variants and consciously shift between them as the regime changes. Regime awareness is the meta-skill that separates consistently profitable technicians from those who succeed only in their preferred market type.",
          highlight: ["trending regime", "ranging regime", "ADX", "regime adaptation"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Market conditions: ADX = 14 (declining), price oscillating between $95 and $110 for two months, ATR at a 12-month low. A trader's system generates three signals simultaneously: (1) 10/30 EMA crossover -- bullish, (2) RSI(14) = 31 at the $95 range low, (3) OBV shows no divergence from price.",
          question: "Which signal deserves the most weight in this scenario and why?",
          options: [
            "RSI at 31 at the range low -- in a ranging market, oscillator extremes at defined support are the highest-reliability signal",
            "The EMA crossover -- crossovers are always the most reliable signal",
            "OBV with no divergence -- the absence of divergence is the strongest confirmation",
            "All three signals are equally weighted regardless of market regime",
          ],
          correctIndex: 0,
          explanation:
            "ADX = 14 confirms a ranging market. In ranging conditions, MA crossovers (signal 1) are in their lowest-reliability regime -- they whipsaw repeatedly in sideways markets. OBV without divergence (signal 3) is neutral, not positive. RSI at 31 at a defined range support ($95) is the highest-conviction signal in this context -- oscillator extremes at well-defined range boundaries are precisely where mean-reversion setups perform best. Regime awareness directs you to weight indicators differently based on market context.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "According to a disciplined confluence framework, which combination represents the strongest independent multi-category confirmation for a long trade?",
          options: [
            "Price above 200-day SMA (trend) + RSI pulling back to 45 in a bull range (momentum) + OBV at a new high (volume)",
            "RSI at 28, Stochastic at 18, and Williams %R at -88 (all oversold)",
            "MACD crossover + MACD histogram turning positive + MACD above zero line",
            "Price above 20 SMA + price above 50 SMA + price above 200 SMA (trend only)",
          ],
          correctIndex: 0,
          explanation:
            "The first option draws signals from three independent categories: trend (MA position and slope), momentum (RSI at a healthy pullback zone), and volume (OBV confirming accumulation by reaching a new high). The other options use multiple signals from the same category (options B and C both measure just one property -- momentum), or use all trend signals (option D). True confluence requires independent perspectives, not repetition of the same measurement.",
          difficulty: 2,
        },
      ],
    },
  ],
};
