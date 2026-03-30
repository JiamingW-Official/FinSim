import type { Unit } from "./types";

export const UNIT_ADVANCED_TECHNICAL_ANALYSIS: Unit = {
  id: "advanced-technical-analysis",
  title: "Advanced Technical Analysis",
  description:
    "Multi-timeframe analysis, volume profile, Fibonacci patterns, market breadth, and intermarket relationships",
  icon: "BarChart2",
  color: "#0ea5e9",
  lessons: [
    /* ================================================================
       LESSON 1 — Multi-Timeframe Analysis
       ================================================================ */
    {
      id: "ata-1",
      title: "Multi-Timeframe Analysis",
      description:
        "Confirm trends across timeframes using top-down analysis",
      icon: "Layers",
      difficulty: "advanced",
      duration: 18,
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "The Top-Down Approach",
          content:
            "**Multi-timeframe analysis (MTA)** is the practice of examining the same asset on several timeframes before placing a trade. The guiding principle: trade in the direction of the higher-timeframe trend and enter on lower timeframes for precision.\n\n**The three-timeframe framework**:\n- **Primary (macro) timeframe**: Defines the dominant trend. Common choices: weekly or daily chart. You only take trades in this direction.\n- **Intermediate timeframe**: 4-hour or 1-hour. Shows the current swing within the macro trend. Helps identify the current phase (impulse vs. pullback).\n- **Entry timeframe**: 15-min or 5-min. Provides precise entry signals — reversals, breakouts, or pattern completions within the macro structure.\n\n**Why it works**: Markets are fractal — patterns repeat across timeframes. A breakout on the 5-min chart carries far more weight when it aligns with a support level on the weekly chart.",
          highlight: [
            "multi-timeframe analysis",
            "top-down",
            "primary timeframe",
            "entry timeframe",
            "fractal",
          ],
        },
        {
          type: "teach",
          title: "Timeframe Alignment and Confluence",
          content:
            "**Confluence** occurs when multiple timeframes agree. Higher confluence = higher probability setups.\n\n**Alignment signals**:\n- All three timeframes show uptrend (higher highs, higher lows) → strong bull case\n- Weekly bullish, daily pullback to support, 1-hour reversal candle forming → optimal long entry\n- Conflicting signals (weekly bull, daily bear) → reduce size or wait for resolution\n\n**Common pitfalls**:\n- Ignoring the higher timeframe and getting trapped in counter-trend trades\n- Using too many timeframes (analysis paralysis)\n- Switching timeframes mid-trade to rationalise a losing position ('timeframe hopping')\n\n**Rule of 4-6**: The intermediate timeframe should be 4–6× the length of the entry timeframe. If entering on 15-min, use 1-hour as intermediate and daily as primary. This spacing ensures the timeframes provide genuinely different information.",
          highlight: [
            "confluence",
            "alignment",
            "timeframe hopping",
            "counter-trend",
          ],
        },
        {
          type: "teach",
          title: "Applying MTA: A Worked Example",
          content:
            "**Scenario — SPY long trade**:\n\n1. **Weekly chart**: SPY is above the 40-week MA. Higher highs and higher lows over the past year. Macro trend: bullish.\n\n2. **Daily chart**: SPY has pulled back to the rising 50-day MA after a 6% rally. RSI at 45 — oversold within the uptrend. Intermediate signal: pullback to support in an uptrend.\n\n3. **1-hour chart**: A bullish engulfing candle forms at the 50-day MA level on above-average volume. MACD crosses bullish. Entry signal confirmed.\n\n**Trade plan**: Enter long on the 1-hour breakout. Stop below the day's low (just outside the 1-hour support zone). Target: prior high on the daily chart.\n\n**Key lesson**: Without step 1, you risk shorting into a bull market. Without step 3, your entry is imprecise. All three timeframes working together produce the highest-probability setup.",
          highlight: [
            "pullback to support",
            "50-day MA",
            "entry signal",
            "stop",
            "target",
          ],
          visual: "candlestick",
        },
        {
          type: "quiz-mc",
          question:
            "In a top-down multi-timeframe analysis, what is the primary role of the highest (macro) timeframe?",
          options: [
            "Define the dominant trend direction — trades are only taken in alignment with this trend",
            "Provide precise entry and exit signals with tight stop-losses",
            "Identify intraday momentum reversals",
            "Determine the exact position size for each trade",
          ],
          correctIndex: 0,
          explanation:
            "The highest timeframe defines the trend direction. All trades are taken in that direction (long in an uptrend, short in a downtrend). Lower timeframes provide the entry signal within that context. Trading against the highest timeframe is considered counter-trend and significantly reduces the probability of success.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "When the weekly chart is bullish but the daily chart shows a pullback to support, this represents a high-confluence long entry opportunity.",
          correct: true,
          explanation:
            "A pullback within a higher-timeframe uptrend is one of the highest-probability setups in MTA. The weekly bullish trend provides the directional bias, and the daily pullback to support offers a better risk/reward entry than chasing the move at highs. Combine with a 1-hour reversal signal for maximum confluence.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are analysing NVDA. The weekly chart is strongly bullish (50-week MA rising, price above it). The daily chart shows a 3-day pullback to the 20-day MA. The 1-hour chart shows a bullish hammer candle at the 20-day MA with volume 40% above average.",
          question: "Based on MTA principles, what is the appropriate action?",
          options: [
            "Enter a long position — all three timeframes align bullishly, forming a high-confluence setup",
            "Short the stock — the 3-day daily pullback signals a trend reversal",
            "Wait for the price to break the weekly high before entering",
            "Ignore the signal — multi-timeframe analysis is too complex to trade profitably",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook MTA long setup: (1) weekly trend is bullish, (2) daily pullback to the 20-day MA in the direction of the trend, (3) 1-hour bullish hammer at support with volume confirmation. All three timeframes agree. This is exactly the high-confluence entry MTA is designed to identify.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Volume Profile and Market Structure
       ================================================================ */
    {
      id: "ata-2",
      title: "Volume Profile and Market Structure",
      description:
        "VWAP, value area, POC, and auction market theory",
      icon: "BarChart",
      difficulty: "advanced",
      duration: 20,
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Volume Profile: Where Traders Did Business",
          content:
            "**Volume Profile** is a charting tool that displays trading volume at each price level rather than over time. A standard volume bar chart shows volume per candle; Volume Profile shows volume per price.\n\n**Key concepts**:\n- **Point of Control (POC)**: The price level with the highest volume traded. This is where the most business was done — it acts as a magnet and tends to attract price on revisits.\n- **Value Area (VA)**: The price range containing 70% of the total volume. Think of it as the 'fair value' zone where most participants agreed on price.\n  - **Value Area High (VAH)**: Upper boundary of the value area. Acts as resistance.\n  - **Value Area Low (VAL)**: Lower boundary. Acts as support.\n- **High Volume Node (HVN)**: Dense volume cluster — price tends to slow down and consolidate here.\n- **Low Volume Node (LVN)**: Thin volume zone — price tends to move through quickly as there is little two-sided business to slow it down.",
          highlight: [
            "volume profile",
            "point of control",
            "value area",
            "VAH",
            "VAL",
            "high volume node",
            "low volume node",
          ],
        },
        {
          type: "teach",
          title: "VWAP: The Institutional Benchmark",
          content:
            "**Volume Weighted Average Price (VWAP)** is the average price weighted by volume over a given period. It is the single most important intraday price level used by institutions.\n\n**Why VWAP matters**:\n- Institutional algorithms (pension funds, mutual funds) benchmark their execution quality against VWAP. Buying below VWAP = good execution; above = poor.\n- As a result, large buyers cluster below VWAP and sellers above it, making VWAP a self-fulfilling support/resistance level.\n\n**Anchored VWAP (AVWAP)**: VWAP reset to a significant date (earnings release, breakout day, major low). AVWAP from a key low often acts as dynamic support throughout the subsequent uptrend.\n\n**VWAP bands**: Standard deviation bands above/below VWAP (similar to Bollinger Bands but volume-weighted). Price beyond 2 standard deviations is considered extended and often mean-reverts.",
          highlight: [
            "VWAP",
            "volume weighted average price",
            "anchored VWAP",
            "standard deviation bands",
            "institutional",
          ],
        },
        {
          type: "teach",
          title: "Auction Market Theory",
          content:
            "**Auction Market Theory (AMT)** describes how markets facilitate trade between buyers and sellers.\n\n**Core idea**: Markets are always doing one of two things:\n1. **Balancing** (consolidating): Price oscillates within a range, searching for two-sided trade. Volume is high and evenly distributed. The market is 'in balance'.\n2. **Trending** (imbalance): One side (buyers or sellers) has rejected the range. Price moves directionally through low-volume areas to find the next balance area.\n\n**Practical application**:\n- Identify whether the market is in balance or trending\n- In balance: fade extremes (buy VAL, sell VAH)\n- Breaking out of balance (price closes outside the value area with conviction): trade the direction of the break, targeting the next POC or value area\n- Low volume nodes between two value areas are 'highways' price travels quickly through",
          highlight: [
            "auction market theory",
            "balancing",
            "trending",
            "imbalance",
            "value area",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In Volume Profile, what does a Low Volume Node (LVN) between two High Volume Nodes indicate about likely price behaviour?",
          options: [
            "Price will tend to move quickly through the LVN as there is little trading history at those levels to create support or resistance",
            "Price will consolidate inside the LVN because few participants are interested in trading there",
            "The LVN marks the Point of Control and will act as the strongest support/resistance",
            "Price cannot enter an LVN — it will always reverse before reaching it",
          ],
          correctIndex: 0,
          explanation:
            "Low Volume Nodes represent price levels where very little trading occurred. Because there is no 'business' to create two-sided interest, price tends to travel through these zones rapidly. Traders use LVNs as areas to expect acceleration — if price breaks into an LVN, it often moves quickly to the next HVN or value area.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The Point of Control (POC) in a Volume Profile is the price level with the highest traded volume, and it tends to act as a magnet that attracts price on revisits.",
          correct: true,
          explanation:
            "The POC is the most heavily traded price level in the profile. Because the most market participants transacted there, it represents fair value and tends to be revisited. Traders often use the POC as a target when price is trading away from it, and as a reference level for support/resistance when price is oscillating around it.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are day trading ES futures. The current session VWAP is at 4,500. The Value Area High (VAH) from yesterday's volume profile is at 4,510. Price has been trading below VWAP all morning and is now making a push toward 4,500-4,510.",
          question: "Based on VWAP and volume profile principles, what do you expect at the 4,500-4,510 zone?",
          options: [
            "Significant resistance — VWAP and yesterday's VAH create a confluence resistance zone; sellers are likely to defend this area",
            "Strong support — price always bounces when it reaches VWAP",
            "No meaningful effect — VWAP only matters on weekly charts",
            "Immediate breakout higher — reaching VWAP is a bullish signal",
          ],
          correctIndex: 0,
          explanation:
            "The 4,500-4,510 zone is a high-confluence resistance area: VWAP acts as institutional resistance when price has been trading below it all morning, and Yesterday's VAH is an additional volume-based resistance level. Institutional sellers benchmarking against VWAP will be selling into this zone. A rejection here would be a high-probability short opportunity.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Fibonacci and Harmonic Patterns
       ================================================================ */
    {
      id: "ata-3",
      title: "Fibonacci and Harmonic Patterns",
      description:
        "Retracements, extensions, and Gartley/Bat/Crab harmonic setups",
      icon: "GitBranch",
      difficulty: "advanced",
      duration: 22,
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Fibonacci Retracements",
          content:
            "**Fibonacci retracements** use ratios derived from the Fibonacci sequence to identify potential support/resistance levels within a price move.\n\n**Key ratios**:\n- **23.6%**: Shallow retracement — often seen in strong trends. Pullbacks here are brief.\n- **38.2%**: Moderate retracement. Common in strong trending markets.\n- **50%**: Not a Fibonacci ratio, but widely watched as the midpoint of a move.\n- **61.8% (Golden Ratio)**: The most important Fibonacci level — the 'golden retracement'. High-probability reversal zone in trending markets.\n- **78.6%**: Deep retracement. Common in weaker trends or before trend reversals.\n\n**How to draw**: Identify a significant swing low and swing high (or vice versa for downtrends). The retracement tool plots horizontal levels between them.\n\n**Confluence with other tools**: Fibonacci levels are most powerful when they coincide with moving averages, volume profile levels, or prior swing highs/lows.",
          highlight: [
            "Fibonacci retracement",
            "golden ratio",
            "61.8%",
            "38.2%",
            "confluence",
          ],
        },
        {
          type: "teach",
          title: "Fibonacci Extensions",
          content:
            "**Fibonacci extensions** project where price may travel beyond the original swing — used as profit targets.\n\n**Common extension levels**:\n- **127.2%**: First extension target — often where wave 3 or C terminates in Elliott Wave theory.\n- **161.8%**: Most popular target for trending moves. The golden ratio applied to extensions.\n- **200%**: Equal move projection (measured move).\n- **261.8%**: Extended target for parabolic trends.\n\n**How to use**: After a retracement, extensions project where the resumption of the trend may reach. If price pulls back to the 61.8% retracement and then resumes, the 161.8% extension of the original move is the most common target.\n\n**Practical rule**: Draw retracements for entry timing; draw extensions for target setting. A trade entered at the 61.8% retracement can have a logical first target at the 127.2% extension and a final target at 161.8%.",
          highlight: [
            "Fibonacci extension",
            "161.8%",
            "profit target",
            "measured move",
          ],
        },
        {
          type: "teach",
          title: "Harmonic Patterns: Gartley, Bat, and Crab",
          content:
            "**Harmonic patterns** use precise Fibonacci ratios to define geometric price patterns that predict reversals with specific entry, stop, and target levels.\n\n**The XABCD structure**: All harmonic patterns follow this 5-point structure.\n\n**Gartley Pattern**:\n- AB = 61.8% retracement of XA\n- BC = 38.2%–88.6% retracement of AB\n- CD = 78.6% retracement of XA (Potential Reversal Zone — PRZ)\n- Trade: Enter at D, stop below X, target B or C\n\n**Bat Pattern**:\n- AB = 38.2%–50% retracement of XA\n- BC = 38.2%–88.6% of AB\n- CD = 88.6% retracement of XA (deeper PRZ than Gartley)\n- The Bat's 88.6% PRZ is its defining characteristic\n\n**Crab Pattern**:\n- AB = 38.2%–61.8% of XA\n- CD = 161.8% extension of XA (the most extreme PRZ)\n- Highest risk/reward of the three, but also rarest and least precise\n\n**Key rule**: Never enter a harmonic pattern before price reaches the PRZ. Wait for a confirmation candle (reversal bar, engulfing, pin bar) at the PRZ before entering.",
          highlight: [
            "harmonic pattern",
            "Gartley",
            "Bat",
            "Crab",
            "potential reversal zone",
            "XABCD",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "On a bullish Gartley pattern, at which Fibonacci retracement of the XA leg does the D point (Potential Reversal Zone) form?",
          options: [
            "78.6% retracement of XA",
            "61.8% retracement of XA",
            "88.6% retracement of XA",
            "161.8% extension of XA",
          ],
          correctIndex: 0,
          explanation:
            "In the Gartley pattern, D forms at the 78.6% retracement of the XA leg. This is the defining ratio that distinguishes the Gartley from the Bat (88.6%) and Crab (161.8% extension). The 78.6% PRZ is where bulls should be looking to enter with a stop just below X.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A Fibonacci retracement level is most reliable as a support or resistance level when it coincides with other technical factors like a moving average, prior swing high/low, or volume profile level.",
          correct: true,
          explanation:
            "Fibonacci levels in isolation are subjective — different traders draw from different swings and get different levels. Confluence with other independently-derived levels (moving averages, volume nodes, prior structure) dramatically increases the probability that a level will hold. Professional traders always look for at least two or three factors confirming the same price zone before treating it as significant.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You identify a potential Crab pattern in TSLA. The PRZ at point D is calculated at the 161.8% extension of XA, which places it at $180. Price is currently at $195, approaching $180. The 200-day MA is also at $181.",
          question: "How should you approach this potential harmonic trade?",
          options: [
            "Wait for price to reach the $180-181 PRZ zone and then look for a confirmation candle (hammer, bullish engulfing) before entering — the 200-day MA adds confluence",
            "Enter long immediately at $195 to avoid missing the move when it bounces from $180",
            "Short the stock — the Crab pattern means price will continue down past $180",
            "Ignore the setup — harmonic patterns require price to be exactly at the Fibonacci level, so slight deviations invalidate it",
          ],
          correctIndex: 0,
          explanation:
            "Patience is the key to harmonic trading. You must wait for price to reach the PRZ before entering — entering early means you take on more risk for the same target. The 200-day MA at $181 creates confluence with the 161.8% PRZ at $180, making this a higher-probability reversal zone. The confirmation candle validates that buyers are actually stepping in at that level.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Market Breadth Indicators
       ================================================================ */
    {
      id: "ata-4",
      title: "Market Breadth Indicators",
      description:
        "A/D line, new highs/lows, and McClellan oscillator",
      icon: "Activity",
      difficulty: "advanced",
      duration: 16,
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Why Market Breadth Matters",
          content:
            "**Market breadth** measures how many individual stocks are participating in a market move. It answers the question: is the index rising (or falling) because of a few big stocks, or is the whole market moving together?\n\n**Why it matters**:\n- A rising S&P 500 driven by 5 mega-cap stocks while 400 others are flat or declining is a weak, narrow rally — a warning sign\n- A rising index where 80% of stocks are advancing signals genuine broad-based buying power — a healthy, sustainable uptrend\n- **Divergence** between price and breadth often precedes significant reversals\n\n**Types of breadth data**:\n- **Advancers vs. Decliners**: Number of stocks rising vs. falling on a given day\n- **New 52-week highs vs. lows**: Stocks at 52-week highs are in strong uptrends; expanding new lows signals deteriorating market health\n- **Percent of stocks above their 200-day MA**: Above 70% = healthy bull; below 30% = bearish conditions",
          highlight: [
            "market breadth",
            "breadth divergence",
            "advancers",
            "decliners",
            "new 52-week highs",
          ],
        },
        {
          type: "teach",
          title: "Advance-Decline Line",
          content:
            "The **Advance-Decline (A/D) Line** is a cumulative sum of the daily difference between advancing and declining stocks.\n\n**Calculation**: Each day, add (Advancers - Decliners) to the prior day's A/D value.\n\n**How to interpret**:\n- A/D Line rising alongside price index → healthy, broad participation → trend likely to continue\n- A/D Line making new highs while index stalls → breadth leading price → often bullish\n- A/D Line making lower highs while index makes higher highs → **bearish divergence** → one of the most reliable warning signals before a major top\n\n**Historical example**: The A/D Line began diverging from the Dow Jones in late 1999, months before the dot-com crash. The index hit new highs while fewer and fewer individual stocks participated — a classic warning of a narrowing bull market about to peak.",
          highlight: [
            "advance-decline line",
            "A/D line",
            "bearish divergence",
            "breadth divergence",
            "cumulative",
          ],
        },
        {
          type: "teach",
          title: "McClellan Oscillator and Summation Index",
          content:
            "The **McClellan Oscillator** is a short-term breadth momentum indicator derived from the difference between two exponential moving averages of the daily A/D ratio.\n\n**Formula**: McClellan Oscillator = 19-day EMA of Net Advances − 39-day EMA of Net Advances\n\n**Interpretation**:\n- Above 0: More stocks advancing than declining on a smoothed basis → bullish breadth momentum\n- Below 0: More declining → bearish breadth momentum\n- Above +100: Overbought — breadth momentum is extreme; short-term pullback likely\n- Below -100: Oversold — panic selling; potential for a breadth thrust and reversal\n\n**McClellan Summation Index**: Cumulative sum of the oscillator. A long-term breadth measure. If it's above 0 and rising, the bull market is intact. Below 0 and falling = bear market breadth.\n\n**Breadth thrust**: When the oscillator moves from below -50 to above +50 within 10 days — a powerful signal that a new bull leg is beginning with broad participation.",
          highlight: [
            "McClellan oscillator",
            "summation index",
            "breadth thrust",
            "overbought",
            "oversold",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "The S&P 500 makes a new all-time high, but the Advance-Decline Line has been making lower highs for the past 3 months. What does this indicate?",
          options: [
            "A bearish breadth divergence — fewer stocks are driving the index higher, suggesting the rally is narrowing and may be nearing a peak",
            "A bullish signal — the index making new highs is the only indicator that matters",
            "The A/D line is broken and should be ignored when it diverges from price",
            "Narrowing breadth is always followed immediately by a market crash",
          ],
          correctIndex: 0,
          explanation:
            "When the index makes new highs but the A/D line makes lower highs, it means fewer stocks are participating in the rally. The index is being carried by a small number of large-cap stocks. Historically this is a reliable warning signal — not a precise timing tool, but it indicates the rally is thinning and vulnerable. The divergence often precedes major tops by weeks to months.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A McClellan Oscillator reading below -100 indicates extremely oversold breadth conditions and often precedes a reversal or 'breadth thrust' rally.",
          correct: true,
          explanation:
            "Readings below -100 on the McClellan Oscillator indicate panic selling conditions — a very large proportion of stocks are declining simultaneously. These extreme oversold readings often mark short-term bottoms as sellers become exhausted. A subsequent rapid recovery to +50 or higher (breadth thrust) has historically been one of the most reliable signals that a new bull leg is beginning.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "It is mid-2007. The Dow Jones hits a record high. However, the A/D Line has been flat for 6 months while the index rose 8%. The percentage of S&P 500 stocks above their 200-day MA drops from 78% to 52%. New 52-week lows are expanding even on up days.",
          question: "What is the correct interpretation of these breadth signals?",
          options: [
            "Multiple breadth indicators are deteriorating while price rises — a major breadth divergence warning that the rally is narrow and at risk of reversal",
            "Everything is fine — the index at all-time highs is the strongest possible signal",
            "The breadth indicators are broken; only price action matters",
            "The decline in stocks above the 200-day MA is bullish — it means they have room to catch up",
          ],
          correctIndex: 0,
          explanation:
            "This is exactly what happened in mid-2007, months before the financial crisis. The A/D Line diverging, stocks above the 200-day MA declining, and expanding new lows while the index made new highs were all classic warning signs of deteriorating breadth. Professional breadth analysts flagged the vulnerability. The S&P 500 subsequently fell over 50% from its October 2007 peak.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Intermarket Analysis
       ================================================================ */
    {
      id: "ata-5",
      title: "Intermarket Analysis",
      description:
        "Bonds vs stocks, dollar vs commodities, and sector rotation",
      icon: "Globe",
      difficulty: "advanced",
      duration: 19,
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "The Four Asset Classes and Their Relationships",
          content:
            "**Intermarket analysis** studies the relationships between the four major asset classes: stocks, bonds, commodities, and currencies. These relationships are not random — they reflect the underlying economic cycle.\n\n**Core relationships** (under normal inflationary conditions):\n- **Bonds vs. Stocks**: Generally inversely correlated. Rising bond prices (falling yields) → lower borrowing costs → supportive of stocks. Falling bond prices (rising yields) → tighter financial conditions → negative for stocks.\n- **Dollar vs. Commodities**: Generally inversely correlated. A stronger dollar makes dollar-priced commodities (oil, gold, copper) more expensive for foreign buyers → demand falls → prices fall. Weaker dollar → commodity prices tend to rise.\n- **Commodities vs. Bonds**: Tend to move in opposite directions over full cycles. Rising commodities signal inflation → bonds sell off (yields rise). Falling commodities → deflationary pressure → bonds rally.\n\n**Important caveat**: These relationships can break down during deflationary crises (2008) or supply shocks.",
          highlight: [
            "intermarket analysis",
            "bonds",
            "stocks",
            "dollar",
            "commodities",
            "inverse correlation",
          ],
        },
        {
          type: "teach",
          title: "Sector Rotation and the Economic Cycle",
          content:
            "Different sectors lead the market at different points in the economic cycle. Understanding which sectors outperform at each stage provides a macro roadmap.\n\n**The rotation sequence (simplified)**:\n1. **Early cycle (recovery)**: Consumer discretionary and financials lead. Credit conditions ease, consumers spend on discretionary items, banks benefit from loan growth.\n2. **Mid cycle (expansion)**: Technology and industrials outperform. Corporate investment rises, capex increases.\n3. **Late cycle (overheating)**: Energy and materials lead. Demand is high, commodity prices rise, inflation concerns grow.\n4. **Recession**: Utilities, healthcare, and consumer staples outperform. Defensive sectors that maintain earnings regardless of economic conditions.\n\n**Monitoring rotation**: Relative strength charts (sector vs. S&P 500) reveal which sectors are leading. When leadership rotates from cyclical to defensive sectors, it signals late-cycle conditions.",
          highlight: [
            "sector rotation",
            "economic cycle",
            "early cycle",
            "late cycle",
            "defensive sectors",
            "relative strength",
          ],
        },
        {
          type: "teach",
          title: "Using Intermarket Signals in Practice",
          content:
            "**Signal 1 — Yield curve**: The spread between 10-year and 2-year Treasury yields. When the yield curve inverts (short rates > long rates), it has preceded every US recession since 1970 by 6–18 months. Monitor for inversion as a late-cycle warning.\n\n**Signal 2 — Dollar strength and emerging markets**: A strengthening dollar is particularly damaging to emerging market equities. EM countries often borrow in dollars — dollar appreciation increases their debt burden. When the DXY (Dollar Index) breaks out to new highs, consider reducing EM exposure.\n\n**Signal 3 — Credit spreads**: The difference between high-yield bond yields and investment-grade yields. Widening credit spreads (junk bonds underperforming) signal rising default risk and economic stress — a bearish leading indicator for equities. Tightening spreads signal risk appetite and tend to lead equity markets higher.\n\n**Practical intermarket checklist before a trade**:\n1. Is the yield curve flattening or inverted?\n2. Is the dollar trending strongly?\n3. Are credit spreads widening or tightening?\n4. Which sector is leading vs. the broad market?",
          highlight: [
            "yield curve",
            "yield curve inversion",
            "credit spreads",
            "DXY",
            "dollar index",
            "high-yield",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Under normal conditions, what typically happens to commodity prices when the US Dollar (DXY) strengthens significantly?",
          options: [
            "Commodity prices tend to fall because a stronger dollar makes commodities more expensive for foreign buyers, reducing demand",
            "Commodity prices rise because dollar strength indicates economic growth",
            "Commodity prices are unrelated to the dollar — they only reflect supply and demand",
            "Commodity prices and the dollar always move in the same direction",
          ],
          correctIndex: 0,
          explanation:
            "Most major commodities (oil, gold, copper, agricultural products) are priced in US dollars. When the dollar strengthens, foreign buyers need more of their local currency to purchase the same commodity. This reduces demand from non-US buyers and tends to push commodity prices lower. This inverse dollar-commodity relationship is one of the most consistent in intermarket analysis, though it can break down during supply shocks.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An inverted yield curve (2-year Treasury yield exceeding 10-year yield) has preceded every US recession since 1970 and is considered a significant late-cycle warning signal.",
          correct: true,
          explanation:
            "The yield curve inversion is one of the most reliable recession predictors in financial history. Short-term rates exceeding long-term rates means the market expects rates to fall in the future — which typically happens when the economy contracts and the Fed cuts rates. The lag between inversion and recession is typically 6–18 months, making it a useful but not precise timing tool.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You observe the following signals: the 2-year Treasury yield is above the 10-year yield (yield curve inverted), credit spreads on high-yield bonds have widened 150 basis points in 3 months, energy and materials stocks are outperforming, and the S&P 500 is still near all-time highs.",
          question: "Based on intermarket analysis, what stage of the cycle does this likely indicate and what is the implication for equity positioning?",
          options: [
            "Late cycle warning — inverted yield curve and widening credit spreads are negative leading indicators for equities; consider rotating into defensive sectors and reducing equity risk",
            "Early bull market — these signals indicate the start of a new economic expansion",
            "Buy signal — energy and materials outperformance means the economy is healthy",
            "No implications — each signal must be analysed in isolation",
          ],
          correctIndex: 0,
          explanation:
            "The combination of yield curve inversion, widening credit spreads (rising default risk), and late-cycle sector leadership (energy/materials) all point to a late-cycle or pre-recessionary environment. The fact that equities are still near highs suggests the market hasn't fully priced in the risk. Historically, this combination has preceded significant equity drawdowns. Rotating to defensives (healthcare, utilities, consumer staples) and reducing beta is the appropriate risk management response.",
          difficulty: 3,
        },
      ],
    },
  ],
};
