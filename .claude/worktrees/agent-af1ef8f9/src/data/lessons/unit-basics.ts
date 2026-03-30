import type { Unit } from "./types";
import {
  PRACTICE_BASIC,
  PRACTICE_CANDLES,
  PRACTICE_VOLUME,
  PRACTICE_SUPPORT_RESISTANCE,
  PRACTICE_UPTREND,
  PRACTICE_UP_DOWN,
} from "./practice-data";

export const UNIT_BASICS: Unit = {
  id: "basics",
  title: "Trading Basics",
  description: "Learn the fundamentals of the stock market",
  icon: "GraduationCap",
  color: "#10b981",
  lessons: [
    /* ================================================================
       LESSON 1 — What is a Stock?
       ================================================================ */
    {
      id: "basics-1",
      title: "What is a Stock?",
      description: "Understand ownership, shares, and why stocks move",
      icon: "Building2",
      xpReward: 50,
      steps: [
        {
          type: "teach",
          title: "Equity Ownership: Your Claim on a Business",
          content:
            "A **stock** (also called an **equity** or a **share**) represents fractional ownership in a publicly traded corporation. When you purchase shares of Apple (AAPL), you become a part-owner of that company, entitled to a proportional claim on its assets and future earnings.\n\nThis ownership concept is foundational to all of finance. Stockholders sit at the bottom of the **capital structure** — they get paid last (after bondholders, creditors, and preferred shareholders), but they also capture unlimited upside if the company grows.\n\n- **Common stock** gives you voting rights (typically one vote per share) and access to dividends if the board declares them.\n- **Preferred stock** pays a fixed dividend and has priority over common stock in liquidation, but usually carries no voting rights.\n\nWhy does this matter? Because the type of equity you hold determines your risk-reward profile. Common stockholders bear the most risk but also have the greatest potential for capital appreciation.",
          visual: "portfolio-pie",
          highlight: ["stock", "equity", "ownership", "common stock", "preferred stock"],
        },
        {
          type: "teach",
          title: "Authorized, Outstanding, and Float Shares",
          content:
            "Not all shares are created equal — and not all shares are even available to trade. Understanding share structure is essential for evaluating any company.\n\n- **Authorized shares**: The maximum number of shares a company is legally permitted to issue, as specified in its corporate charter. Apple has authorized roughly 50.4 billion shares.\n- **Outstanding shares**: The total number of shares actually issued and held by all shareholders (insiders, institutions, and retail investors). Apple has approximately 15.4 billion shares outstanding.\n- **Float** (or **free float**): The subset of outstanding shares available for public trading — excluding shares held by insiders, executives, and locked-up institutional holders. This is what actually trades on the exchange.\n\n**Par value** is a largely historical concept — the nominal face value printed on the stock certificate (often $0.001 or $0.01). It has almost no practical significance today, but you will encounter it on balance sheets and in corporate filings.\n\nThe distinction between outstanding shares and float matters because a company with a small float relative to outstanding shares can experience dramatic price swings when demand spikes — a dynamic called a **low-float squeeze**.",
          highlight: ["authorized shares", "outstanding shares", "float", "par value"],
        },
        {
          type: "quiz-mc",
          question: "Apple has 15.4 billion shares outstanding and a stock price of $195. What is Apple's approximate market capitalization?",
          options: [
            "$3.0 trillion",
            "$195 billion",
            "$15.4 billion",
            "$1.54 trillion",
          ],
          correctIndex: 0,
          explanation:
            "Market capitalization = shares outstanding x share price. So 15.4 billion x $195 = approximately $3.0 trillion. Market cap is the single most important metric for categorizing a company's size (mega-cap, large-cap, mid-cap, small-cap, micro-cap). It represents the total value the market assigns to the company's equity.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Primary vs. Secondary Markets",
          content:
            "Stocks come to life in the **primary market** and then trade hands in the **secondary market**. Understanding this distinction is critical.\n\n**Primary Market** — where companies raise new capital:\n- An **Initial Public Offering (IPO)** is when a private company sells shares to the public for the first time. The company works with investment banks (called **underwriters**) who set the initial price, market the offering, and allocate shares to institutional investors.\n- A **Follow-On Offering (FPO)** or **Secondary Offering** is when an already-public company issues additional shares. This dilutes existing shareholders but raises fresh capital.\n- IPO pricing is part art, part science. Underwriters gauge demand through a **roadshow** and **book-building** process, setting a price range that balances the company's desire for high proceeds against investors' appetite for a first-day pop.\n\n**Secondary Market** — where investors trade existing shares:\n- Once shares are issued, they trade on exchanges like the **NYSE** (New York Stock Exchange) or **NASDAQ**. The company receives no money from these trades — they happen purely between investors.\n- The secondary market provides **liquidity** — the ability to convert your investment to cash quickly. Without it, investing would be far riskier.\n\nWhen you buy AAPL in FinSim (or in real life through a broker), you are buying in the secondary market from another investor, not from Apple directly.",
          highlight: ["primary market", "secondary market", "IPO", "underwriter", "liquidity"],
        },
        {
          type: "quiz-tf",
          statement: "When you buy shares of Tesla on the NASDAQ, the money you pay goes directly to Tesla the company.",
          correct: false,
          explanation:
            "When you buy shares on an exchange, you are purchasing from another investor in the secondary market. Tesla only received money when it originally issued those shares (in its IPO or subsequent offerings). The secondary market is an investor-to-investor marketplace, not a company fundraising mechanism.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Exchanges and Market Makers: The Plumbing of Trading",
          content:
            "Modern stock exchanges are electronic matching engines that pair buy and sell orders in fractions of a second. The two dominant U.S. exchanges have distinct characters:\n\n- **NYSE** (New York Stock Exchange): Founded in 1792, the world's largest exchange by market cap. Uses a hybrid model with electronic trading and designated **market makers** (DMMs) who maintain orderly markets for assigned stocks. Known for blue-chip listings like Berkshire Hathaway, JPMorgan, and Walmart.\n- **NASDAQ**: Founded in 1971 as the first fully electronic exchange. Operates a pure dealer/market-maker model with multiple competing market makers per stock. Dominates tech listings — Apple, Microsoft, Amazon, Google, and Tesla all trade here.\n\n**Market makers** are specialized firms (like Citadel Securities, Virtu Financial, and GTS) that continuously post both buy and sell quotes. They profit from the **bid-ask spread** — the tiny difference between their buying and selling prices. In exchange, they provide liquidity, ensuring you can always trade.\n\nHere is the key insight: market makers do not take directional bets. They earn the spread thousands of times per day while staying as close to market-neutral as possible. They are the oil in the engine of price discovery.",
          highlight: ["NYSE", "NASDAQ", "market maker", "bid-ask spread"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "TechStart Inc. plans to go public. Its underwriters (Goldman Sachs and Morgan Stanley) set an IPO price range of $18-$22 per share and plan to sell 50 million shares. After the roadshow, demand is extremely strong, so they price the IPO at $22. On the first day of trading, shares open at $31.",
          question: "How much capital did TechStart raise from the IPO, and who pocketed the first-day gain from $22 to $31?",
          options: [
            "TechStart raised $1.1 billion; the first-day gain went to IPO investors, not TechStart",
            "TechStart raised $1.55 billion from the full $31 price",
            "TechStart raised $450 million from the price increase",
            "The underwriters kept all proceeds above $22",
          ],
          correctIndex: 0,
          explanation:
            "TechStart raised 50 million shares x $22 = $1.1 billion in the primary market. The jump from $22 to $31 happened in the secondary market and benefited the investors who received IPO allocations, not TechStart. This first-day pop is called 'money left on the table' — a recurring debate in IPO pricing. The underwriters earn a fee (typically 3-7% of proceeds), not the price appreciation.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Supply, Demand, and Why Prices Move",
          content:
            "At its core, a stock price is determined by the intersection of **supply and demand** — the same economic principle that governs any marketplace. But in equities, the dynamics are nuanced.\n\n**What drives demand (buying pressure):**\n- Strong earnings reports that beat analyst expectations\n- Positive macro-economic data (low unemployment, GDP growth)\n- Sector rotation — money flowing into a particular industry\n- Short squeezes — short sellers forced to buy back shares\n- Index inclusion (e.g., a stock being added to the S&P 500 forces index funds to buy)\n\n**What drives supply (selling pressure):**\n- Disappointing earnings or lowered guidance\n- Insider selling or large institutional block sales\n- Rising interest rates (which make bonds more attractive relative to stocks)\n- Lock-up expiration after an IPO (insiders can finally sell)\n- Tax-loss harvesting at year-end\n\nThe price you see on a chart at any moment represents the **last traded price** — the most recent price at which a buyer and seller agreed to transact. It is a snapshot of consensus, constantly being updated as new information arrives.",
          highlight: ["supply and demand", "last traded price", "short squeeze"],
        },
        {
          type: "quiz-mc",
          question: "A mid-cap company announces it will be added to the S&P 500 index next month. What is the most likely short-term impact on its stock price, and why?",
          options: [
            "Price rises because index funds tracking the S&P 500 must buy millions of shares",
            "Price falls because investors sell the news",
            "No impact because index inclusion is cosmetic",
            "Price rises only if the company also reports strong earnings",
          ],
          correctIndex: 0,
          explanation:
            "S&P 500 index inclusion forces every fund that tracks the index (trillions of dollars in assets) to purchase shares of the newly added company. This creates massive, predictable demand — often causing a significant pre-inclusion price run-up. Traders call this the 'index effect,' and it is one of the most reliable short-term catalysts in equities.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Market Capitalization: Sizing Up Companies",
          content:
            "**Market capitalization** (market cap) is the total market value of a company's outstanding shares. The formula is straightforward:\n\n**Market Cap = Share Price x Shares Outstanding**\n\nMarket cap is how Wall Street classifies companies into tiers:\n\n- **Mega-cap**: > $200 billion (Apple, Microsoft, NVIDIA, Amazon)\n- **Large-cap**: $10B - $200B (Starbucks, FedEx, General Motors)\n- **Mid-cap**: $2B - $10B (Crocs, Five Below, Shake Shack)\n- **Small-cap**: $300M - $2B (higher growth potential, higher volatility)\n- **Micro-cap**: < $300M (highly speculative, often illiquid)\n\nCritical insight: market cap is not static. If Apple's stock drops 10%, its market cap drops 10% too — even though nothing about the company's actual business changed in that instant. Market cap reflects market **perception**, not intrinsic value.\n\n**Enterprise Value (EV)** is a more complete measure: EV = Market Cap + Total Debt - Cash. Investment bankers prefer EV because it captures the full cost of acquiring a business, including its debt obligations.",
          highlight: ["market capitalization", "mega-cap", "enterprise value"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Company A has a stock price of $500 and 100 million shares outstanding. Company B has a stock price of $20 and 10 billion shares outstanding. A new investor says, 'Company A is much more valuable because its stock price is 25x higher.'",
          question: "Is the new investor's reasoning correct?",
          options: [
            "No — Company B's market cap ($200B) is 4x larger than Company A's ($50B); share price alone means nothing",
            "Yes — a higher stock price always means a more valuable company",
            "They are equal in value since price times shares cancels out",
            "You cannot compare companies with different share prices",
          ],
          correctIndex: 0,
          explanation:
            "Company A: $500 x 100M = $50 billion market cap. Company B: $20 x 10B = $200 billion market cap. Share price in isolation is meaningless — you must multiply by shares outstanding to get market cap. This is one of the most common beginner mistakes in investing. Berkshire Hathaway Class A trades above $600,000 per share but is not the world's most valuable company.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement: "A company can increase its stock price by doing a reverse stock split, which makes the company more valuable.",
          correct: false,
          explanation:
            "A reverse stock split increases the share price by reducing the number of outstanding shares (e.g., a 1-for-10 reverse split turns ten $1 shares into one $10 share). But total market cap remains unchanged — it is purely cosmetic. Companies sometimes do reverse splits to avoid being delisted from exchanges that require a minimum share price (typically $1 on NASDAQ).",
          difficulty: 2,
        },
        {
          type: "practice",
          instruction: "Advance the chart forward to watch stock prices unfold in real time. Observe how each bar represents a new period of trading with its own open, high, low, and close.",
          objective: "Step through at least 5 price bars using the time controls",
          actionType: "navigate",
          challenge: {
            priceData: PRACTICE_BASIC.bars,
            initialReveal: PRACTICE_BASIC.initialReveal,
            objectives: [{ kind: "advance-time", bars: 5 }],
            hint: "Use the step-forward button or press Play to advance bars. Notice how the price moves up and down — this is supply and demand in action.",
          },
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Reading Candlesticks
       ================================================================ */
    {
      id: "basics-2",
      title: "Reading Candlesticks",
      description: "Decode the visual language of price charts",
      icon: "CandlestickChart",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "The Origin and Power of Candlestick Charts",
          content:
            "**Candlestick charts** were invented by Japanese rice trader **Munehisa Homma** in the 1700s — over a century before the Western world developed bar charts. Homma traded rice futures on the Dojima Rice Exchange in Osaka and discovered that price patterns reflected the collective emotions of market participants.\n\nEach candlestick compresses four critical data points into a single visual unit:\n\n- **Open**: The price at which the first transaction occurred in the period\n- **High**: The maximum price reached during the period\n- **Low**: The minimum price reached during the period\n- **Close**: The price at which the last transaction occurred in the period\n\nThese four values are collectively called **OHLC data**, and they form the foundation of all technical analysis. Every chart you see — whether on Bloomberg, TradingView, or FinSim — is built on OHLC.\n\nWhy candlesticks over line charts? A line chart only shows closing prices, discarding 75% of the available information. Candlesticks reveal the **battle between buyers and sellers** within each period — the high shows where bulls pushed, the low shows where bears pushed, and the body shows who won.",
          visual: "candlestick",
          highlight: ["candlestick", "OHLC", "open", "close", "high", "low"],
        },
        {
          type: "teach",
          title: "Anatomy: Body, Wicks, and Color",
          content:
            "Every candlestick has two components: the **body** (the thick rectangle) and the **wicks** (the thin lines extending above and below, also called **shadows**).\n\n**The Body** tells you the net result of the period:\n- **Green (bullish) candle**: Close > Open. The bottom of the body is the open; the top is the close. Price finished higher than it started.\n- **Red (bearish) candle**: Close < Open. The top of the body is the open; the bottom is the close. Price finished lower than it started.\n\n**The Wicks** tell you the story of intra-period volatility:\n- **Upper wick (shadow)**: Extends from the top of the body to the high. A long upper wick means buyers pushed price up but sellers rejected that level.\n- **Lower wick (shadow)**: Extends from the bottom of the body to the low. A long lower wick means sellers pushed price down but buyers stepped in.\n\n**Body Size** reveals conviction:\n- **Long body** = strong directional move. One side (buyers or sellers) dominated the entire period.\n- **Short body** = indecision. Neither side gained meaningful ground.\n- **No body (or near-zero)** = a Doji. Open and close are virtually identical — a tug-of-war that ended in a draw.",
          highlight: ["body", "wick", "shadow", "bullish", "bearish", "Doji"],
        },
        {
          type: "quiz-mc",
          question: "In a green (bullish) candlestick, where is the opening price located?",
          options: [
            "Bottom of the body",
            "Top of the body",
            "Top of the upper wick",
            "Bottom of the lower wick",
          ],
          correctIndex: 0,
          explanation:
            "In a green candle, the close is higher than the open. Since the body spans from open to close, and the close is on top (higher), the open sits at the bottom of the body. This is reversed for red candles, where the open is at the top. Getting this mapping automatic is the first step to reading charts fluently.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Single-Candle Patterns: Hammer, Shooting Star, and Doji",
          content:
            "Certain single-candle formations have been studied for centuries and carry predictive weight — especially at key support/resistance levels or after extended trends.\n\n**Hammer** (bullish reversal signal):\n- Small body near the top of the range, long lower wick (at least 2x the body length), little or no upper wick.\n- Appears after a downtrend. The story: sellers drove price sharply lower during the period, but buyers overwhelmed them and pushed price back up near the open. The rejection of lower prices signals potential trend reversal.\n\n**Shooting Star** (bearish reversal signal):\n- Small body near the bottom of the range, long upper wick, little or no lower wick.\n- Appears after an uptrend. The story: buyers pushed price to new highs, but sellers crushed the rally and closed near the low. The rejection of higher prices signals potential exhaustion.\n\n**Doji** (indecision signal):\n- Open and close are virtually identical (tiny or no body), with wicks extending in both directions.\n- Signals equilibrium between buyers and sellers. After a strong trend, a Doji suggests the trend is losing momentum. The next candle's direction often resolves the indecision.\n\nCritical caveat: no single candle is a trading signal on its own. Context matters — where the pattern appears (at support? at resistance? mid-trend?) determines its significance.",
          highlight: ["Hammer", "Shooting Star", "Doji"],
        },
        {
          type: "quiz-tf",
          statement: "A candlestick with a very long upper wick and small body suggests the price was rejected at higher levels.",
          correct: true,
          explanation:
            "A long upper wick tells a clear story: buyers pushed price aggressively higher during the period, but sellers overpowered them and drove it back down before the close. This 'rejection wick' is one of the most reliable signals that a price level faced strong selling pressure. When you see it at resistance, pay close attention.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Multi-Candle Patterns: Engulfing and Morning/Evening Star",
          content:
            "While single-candle patterns show sentiment within one period, **multi-candle patterns** reveal shifts in momentum across consecutive periods.\n\n**Bullish Engulfing** (2 candles, reversal signal):\n- First candle: small red body (sellers in control but weak).\n- Second candle: large green body that completely 'engulfs' (covers the range of) the first candle's body.\n- Interpretation: buyers decisively overwhelmed the prior selling pressure. Most powerful when it appears at a support level with above-average volume.\n\n**Bearish Engulfing** (2 candles, reversal signal):\n- First candle: small green body.\n- Second candle: large red body that engulfs the first.\n- Interpretation: sellers took control. Most significant at resistance levels.\n\n**Morning Star** (3 candles, bullish reversal):\n- Day 1: large red candle (continuation of downtrend).\n- Day 2: small-bodied candle (Doji or spinning top) that gaps below Day 1 — showing indecision.\n- Day 3: large green candle that closes well into Day 1's body — confirming the reversal.\n\n**Evening Star** (3 candles, bearish reversal): the inverse of the Morning Star. Large green, then small/indecisive, then large red.\n\nProfessional traders confirm these patterns with volume. An engulfing candle on 3x average volume is far more significant than one on low volume.",
          highlight: ["Bullish Engulfing", "Bearish Engulfing", "Morning Star", "Evening Star"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "After a 5-day downtrend, you observe the following two candles: Day 1 is a small red candle with a range of $48.50 to $49.20 (open $49.10, close $48.60). Day 2 is a large green candle that opens at $48.30 and closes at $49.80, with volume 2.5x the 20-day average.",
          question: "What pattern is this, and what does it suggest?",
          options: [
            "Bullish Engulfing — a potential reversal after a downtrend, confirmed by high volume",
            "Bearish Engulfing — the downtrend will continue",
            "A Doji — indecision with no directional bias",
            "A Shooting Star — expect further decline",
          ],
          correctIndex: 0,
          explanation:
            "Day 2's green body ($48.30 to $49.80) completely engulfs Day 1's red body ($48.60 to $49.10). This is a textbook Bullish Engulfing pattern. The high volume (2.5x average) adds conviction — it tells you that real institutional participation drove the reversal, not just a random bounce on thin volume. After a downtrend, this is a high-probability reversal signal.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Timeframe Analysis: Context Changes Everything",
          content:
            "The same stock at the same moment can show completely different patterns depending on the **timeframe** you select. This is one of the most important concepts in technical analysis.\n\n- **1-minute / 5-minute charts**: Noise-heavy, used by day traders and scalpers. Patterns form and break quickly.\n- **15-minute / 1-hour charts**: Intermediate intraday timeframes. Useful for timing entries on swing trades.\n- **Daily charts**: The gold standard for swing traders and most institutional analysts. Each candle = one trading day.\n- **Weekly charts**: Each candle summarizes an entire week. Filters out daily noise, reveals the dominant trend.\n- **Monthly charts**: The big picture. Used for long-term trend analysis and major support/resistance identification.\n\n**Multi-timeframe analysis** means checking the higher timeframe trend before trading on a lower timeframe. A bullish engulfing on the 15-minute chart is far more powerful if the daily chart is also in an uptrend.\n\nProfessional rule of thumb: identify the trend on a timeframe two levels above your trading timeframe. If you trade the daily chart, confirm the trend on the weekly. If you trade the 1-hour, confirm on the daily.",
          highlight: ["timeframe", "multi-timeframe analysis"],
        },
        {
          type: "quiz-mc",
          question: "A trader sees a Hammer pattern on the 5-minute chart of TSLA but the daily chart shows a strong downtrend with no support nearby. What should the trader conclude?",
          options: [
            "The 5-minute Hammer is unreliable because the higher timeframe trend is bearish",
            "The 5-minute Hammer overrides the daily trend",
            "Timeframes are independent and do not affect each other",
            "The daily chart is less reliable than the 5-minute chart",
          ],
          correctIndex: 0,
          explanation:
            "Higher timeframe trends generally dominate lower timeframe signals. A Hammer on a 5-minute chart during a daily downtrend is likely just a temporary bounce within the larger selling pressure — it might produce a short-term pop but not a meaningful reversal. Always check the higher timeframe before acting on a lower timeframe pattern.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement: "A Doji candlestick always means the stock price will reverse direction.",
          correct: false,
          explanation:
            "A Doji signals indecision — open and close are nearly identical — but it is not a guaranteed reversal. A Doji mid-trend may just be a pause before the trend continues. Context is everything: a Doji at a major support level after a prolonged downtrend is far more significant than a Doji in the middle of a consolidation range.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are analyzing AAPL on the daily chart and see three consecutive candles: (1) a large red candle closing at $178, (2) a small Doji at $177.50 that gaps slightly below the first candle, (3) a large green candle opening at $177.80 and closing at $182, well into the first candle's body. Volume on the third candle is the highest of the three.",
          question: "What three-candle pattern is this?",
          options: [
            "Morning Star — a bullish reversal pattern",
            "Evening Star — a bearish reversal pattern",
            "Three Black Crows — a bearish continuation",
            "Three White Soldiers — a bullish continuation",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook Morning Star: (1) large red confirming the downtrend, (2) small-bodied Doji showing seller exhaustion and indecision, (3) large green closing well into the first candle's range, confirming buyers have taken control. The increasing volume on the third candle adds further confirmation. Morning Stars at key support levels are among the highest-confidence reversal signals in candlestick analysis.",
          difficulty: 3,
        },
        {
          type: "practice",
          instruction: "Watch the candlestick chart unfold bar by bar. Try to identify the color, body size, and wick length of each new candle. Look for hammers, shooting stars, and engulfing patterns.",
          objective: "Advance at least 8 bars and observe the candlestick formations",
          actionType: "observe",
          challenge: {
            priceData: PRACTICE_CANDLES.bars,
            initialReveal: PRACTICE_CANDLES.initialReveal,
            objectives: [{ kind: "advance-time", bars: 8 }],
            hint: "Focus on the body-to-wick ratio. Long lower wicks at lows may be hammers. Long upper wicks at highs may be shooting stars. A candle that fully covers the prior candle's body is an engulfing pattern.",
          },
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Price & Volume
       ================================================================ */
    {
      id: "basics-3",
      title: "Price & Volume",
      description: "Learn how trading volume confirms price moves",
      icon: "BarChart3",
      xpReward: 50,
      steps: [
        {
          type: "teach",
          title: "Volume: The Fuel Behind Every Price Move",
          content:
            "**Volume** is the total number of shares (or contracts) traded during a given period. It is displayed as vertical bars at the bottom of a candlestick chart — taller bars represent more trading activity.\n\nVolume is often called the one indicator that cannot lie. Price can be manipulated, but volume reflects actual transactions — real money changing hands.\n\n- **High volume** = strong participation. Many buyers and sellers are actively transacting. Price moves on high volume carry **conviction** and are more likely to sustain.\n- **Low volume** = weak participation. Fewer market participants are engaged. Price moves on low volume are **suspect** and more likely to reverse.\n\nThink of it this way: if a stock rallies 5% on 50 million shares traded, that represents billions of dollars of collective buying conviction. If it rallies 5% on 500,000 shares, a handful of participants drove the move and it could easily unwind.\n\nVolume is reported in real-time and is freely available on every charting platform. Average daily volume (ADV) for major stocks: Apple trades ~60 million shares/day, Tesla ~100 million, while a micro-cap might trade only 50,000.",
          visual: "indicator-chart",
          highlight: ["volume", "conviction", "average daily volume"],
        },
        {
          type: "quiz-mc",
          question: "A stock price jumps 5% on volume that is 20% of its daily average. What does this suggest?",
          options: [
            "The move may lack conviction and could easily reverse",
            "The stock will definitely continue rallying",
            "Volume has no relationship with price reliability",
            "The stock is about to be halted by the exchange",
          ],
          correctIndex: 0,
          explanation:
            "Volume at just 20% of the daily average means very few participants drove the 5% move. Without broad institutional participation, the price is fragile — a single large seller could wipe out the entire gain. Professional traders treat low-volume moves with extreme skepticism until volume confirms the direction.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Volume-Price Relationships: The Four Scenarios",
          content:
            "The interplay between price direction and volume creates four fundamental scenarios that every analyst must understand:\n\n**1. Price Up + Volume Up = Healthy Uptrend (Accumulation)**\nBuyers are aggressively accumulating shares. Each new high is supported by increasing participation. This is the strongest bullish signal.\n\n**2. Price Down + Volume Up = Aggressive Selling (Distribution)**\nSellers are aggressively distributing (dumping) shares. Institutions may be exiting large positions. This is the strongest bearish signal.\n\n**3. Price Up + Volume Down = Weakening Rally**\nPrice is rising but fewer participants are buying. The uptrend is losing steam. This often precedes a reversal. On Wall Street, this is called a rally 'on fumes.'\n\n**4. Price Down + Volume Down = Drying-Up Selling**\nSellers are running out of stock to sell. The decline is losing momentum. This can precede a bottom formation — but only if buyers eventually step in with volume.\n\nThe terms **accumulation** (smart money quietly buying) and **distribution** (smart money quietly selling) come from Wyckoff Theory, developed by Richard Wyckoff in the early 1900s. Institutional investors often accumulate or distribute positions over weeks, and volume analysis helps detect their footprints.",
          highlight: ["accumulation", "distribution", "Wyckoff"],
        },
        {
          type: "quiz-tf",
          statement: "High trading volume always means the stock price is going up.",
          correct: false,
          explanation:
            "High volume simply means a large number of shares were traded — it can accompany moves in either direction. A stock crashing 10% on record volume is extremely bearish, not bullish. Volume tells you about participation intensity, not direction. You must combine volume with price action (the candle's direction) to draw conclusions.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "On-Balance Volume (OBV) and Volume Climax",
          content:
            "**On-Balance Volume (OBV)** is a cumulative indicator developed by Joe Granville in the 1960s. The concept is simple but powerful:\n\n- On an up day (close > prior close): add that day's volume to the running OBV total.\n- On a down day (close < prior close): subtract that day's volume from the running total.\n\nOBV creates a running score of buying versus selling pressure. When OBV is trending up, more volume is flowing into the stock on up days (accumulation). When OBV is trending down, more volume is flowing out on down days (distribution).\n\nThe real power: **OBV divergence**. If price makes a new high but OBV does not, it means the rally is happening on declining participation — a bearish warning. Conversely, if price makes a new low but OBV holds, buyers are quietly accumulating — a bullish signal.\n\n**Volume Climax** is an extreme spike in volume (often 3-5x the average) that occurs after an extended trend. It signals exhaustion — the final wave of emotional participants piling in at the worst possible time. Climax volume at a top often marks the end of a rally; climax volume at a bottom often marks capitulation (a washout that clears the way for recovery).",
          highlight: ["On-Balance Volume", "OBV", "divergence", "volume climax", "capitulation"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "NVDA has rallied from $600 to $800 over three months. During the last two weeks of the rally, OBV has been declining even as price made new highs. Yesterday, NVDA hit $810 on the lowest volume in 30 days.",
          question: "What is the OBV divergence telling you?",
          options: [
            "The rally is losing participation — fewer buyers are driving new highs, signaling a potential reversal",
            "The rally is healthy because price keeps making new highs",
            "OBV declining means more buyers are entering the stock",
            "Low volume at highs confirms strong conviction",
          ],
          correctIndex: 0,
          explanation:
            "This is a classic bearish OBV divergence: price makes higher highs while OBV makes lower highs. It means each successive price advance is driven by less and less buying volume. The declining OBV reveals that institutional buyers are stepping away (or quietly selling into the strength), leaving only retail momentum chasers to push price higher. This is one of the most reliable early warning signals of a topping pattern.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Bid-Ask Spread and Market Depth",
          content:
            "Volume analysis is incomplete without understanding the **microstructure** of how trades actually execute. At any given moment, there are two prices for every stock:\n\n- **Bid price**: The highest price a buyer is currently willing to pay. This is what you receive when you sell at market.\n- **Ask price** (or **offer**): The lowest price a seller is currently willing to accept. This is what you pay when you buy at market.\n- **Bid-ask spread**: The difference between ask and bid. This spread represents a real cost of trading.\n\nExample: AAPL bid = $194.98, ask = $195.02. The spread is $0.04 (0.02%). For a liquid mega-cap like Apple, spreads are penny-wide. For a micro-cap with 50,000 shares/day volume, the spread might be $0.50 (1-2%) — a massive hidden cost.\n\n**Market depth** (Level 2 data) shows the full order book — all resting buy and sell orders at various prices. A stock with thick depth (large orders at multiple price levels) is **liquid** and trades smoothly. A stock with thin depth is **illiquid** and prone to slippage (your order moving the price against you).\n\nRule of thumb: never trade a stock where your order size exceeds 1% of average daily volume, or you risk significant slippage.",
          highlight: ["bid price", "ask price", "bid-ask spread", "market depth", "slippage"],
        },
        {
          type: "quiz-mc",
          question: "Stock XYZ has a bid of $50.00 and an ask of $50.50. You buy 100 shares at market and immediately try to sell at market. Ignoring any price change, what is your instant loss?",
          options: [
            "$50 (the cost of crossing the spread)",
            "$0 (you buy and sell at the same price)",
            "$5,050 (the ask price times 100 shares minus the bid)",
            "$100 (the round-trip commission)",
          ],
          correctIndex: 0,
          explanation:
            "You buy at the ask ($50.50) and sell at the bid ($50.00), losing the spread of $0.50 per share. On 100 shares, that is $50. This is the 'cost of immediacy' — the price you pay for market orders. This is why the bid-ask spread is a hidden transaction cost that traders must account for, especially when trading illiquid stocks with wide spreads. Frequent trading in wide-spread stocks can erode returns significantly.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Volume Patterns: Breakouts, Squeezes, and Climaxes",
          content:
            "Specific volume patterns appear repeatedly across all markets and timeframes. Recognizing them gives you a meaningful edge:\n\n**Breakout Volume**: When price moves above resistance (or below support) on volume that is 2x+ the 20-day average, the breakout is far more likely to sustain. Low-volume breakouts fail at a much higher rate — they are called **false breakouts** or **fakeouts**.\n\n**Volume Dry-Up (Squeeze)**: Progressively declining volume during a consolidation often precedes a violent move. As volume contracts, it signals that sellers are exhausted and a new catalyst will cause a directional explosion. Bollinger Band squeezes often coincide with volume dry-ups.\n\n**Selling Climax (Capitulation)**: After an extended decline, a single day of massive volume (3-5x average) with a large red candle can signal the final wave of panic selling. Once emotional sellers are flushed out, the stock often stabilizes or reverses. The March 2020 COVID crash bottom featured classic capitulation volume.\n\n**Buying Climax**: After an extended rally, a blow-off top occurs with parabolic price action and record volume. This marks the euphoric peak where the last buyers pile in — and the smart money sells to them.",
          highlight: ["breakout volume", "false breakout", "capitulation", "buying climax"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock has been consolidating between $95 and $100 for three weeks. Average daily volume during this consolidation has been declining steadily: 5M, 4M, 3.5M, 2.8M, 2.1M shares. Today, the stock gaps up to $101 on 12 million shares, three times its pre-consolidation average.",
          question: "How should you interpret this price and volume action?",
          options: [
            "A high-conviction breakout — the volume dry-up compressed energy that is now releasing to the upside",
            "A false breakout because the stock has been declining in volume",
            "The volume spike is meaningless without earnings data",
            "You should wait for the volume to drop back to normal before acting",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook setup: declining volume during consolidation (the 'squeeze') followed by explosive volume on the breakout. The drying-up volume showed that sellers were exhausted, and the 12M share breakout day — 3x the pre-consolidation average — confirms that new buyers flooded in with conviction. Volume dry-up followed by a volume-confirmed breakout is one of the highest-probability setups in technical analysis.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement: "A stock breaking above resistance on volume that is half its daily average is a reliable breakout signal.",
          correct: false,
          explanation:
            "Low-volume breakouts are among the most common traps in technical analysis. Without strong volume participation, the price move above resistance is driven by a small number of buyers and is easily reversed. Professional traders require at minimum 1.5-2x average volume to confirm a breakout. The adage 'volume precedes price' exists for exactly this reason.",
          difficulty: 2,
        },
        {
          type: "practice",
          instruction: "Advance the chart and watch the volume bars at the bottom alongside each price candle. Notice how the tallest volume bars tend to coincide with the largest price movements.",
          objective: "Advance bars and observe the relationship between volume and price movement",
          actionType: "observe",
          challenge: {
            priceData: PRACTICE_VOLUME.bars,
            initialReveal: PRACTICE_VOLUME.initialReveal,
            objectives: [{ kind: "advance-time", bars: 8 }],
            hint: "Compare the height of volume bars with the size of price candles. Do the biggest candles correspond to the tallest volume bars? Look for any volume spikes that might signal a breakout or climax.",
          },
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Support & Resistance
       ================================================================ */
    {
      id: "basics-sr",
      title: "Support & Resistance",
      description: "Identify key price levels where markets reverse",
      icon: "Minus",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "Price Memory: Why Certain Levels Matter",
          content:
            "**Support** is a price level where buying pressure historically overwhelms selling pressure, causing declines to stall or reverse. Think of it as a floor beneath the stock.\n\n**Resistance** is a price level where selling pressure historically overwhelms buying pressure, causing rallies to stall or reverse. Think of it as a ceiling the stock cannot break through.\n\nBut why do these levels form? The answer is rooted in behavioral finance and market microstructure:\n\n- **Anchoring bias**: Traders anchor to prices where they previously bought or sold. If thousands of traders bought AAPL at $150, many will buy again near $150 to 'average down' — creating support.\n- **Regret avoidance**: Traders who missed a move will place orders at the level where they wish they had acted — reinforcing the level.\n- **Institutional memory**: Large funds often accumulate or distribute at specific prices over days or weeks. Their unfilled orders remain in the market, creating visible walls of supply or demand.\n\nThe more times a level is tested and holds, the more significant it becomes. A support level that has held three times is far stronger than one that has held once. However, each test also weakens it slightly — like a floor absorbing repeated impacts.",
          visual: "candlestick",
          highlight: ["support", "resistance", "anchoring bias"],
        },
        {
          type: "teach",
          title: "How to Identify Support and Resistance Zones",
          content:
            "Support and resistance are better thought of as **zones** rather than exact prices. Markets are messy, and levels rarely hold to the penny.\n\n**Methods for identifying S/R zones:**\n\n- **Prior highs and lows**: The most reliable method. If TSLA peaked at $300 on three separate occasions, $298-$302 is a strong resistance zone.\n- **Round numbers** (psychological levels): $50, $100, $200, $500, $1,000. Humans cluster orders at round numbers. A stock trading at $98 has massive implied buying pressure from limit orders at $100.\n- **High-volume nodes**: Price levels where an unusually large amount of volume was transacted. These areas represent significant institutional interest and tend to act as magnets for future price action.\n- **Gap levels**: When a stock gaps up or down (opens significantly above or below the prior close), the gap's edges become S/R. Gaps often get 'filled' — price returns to close the gap.\n- **Moving averages**: The 50-day and 200-day simple moving averages act as dynamic support and resistance, especially for institutional investors who use them as buy/sell triggers.\n\nPractical tip: mark S/R zones as horizontal bands (not single lines) with a width of 0.5-1.5% of price. A $200 stock might have a resistance zone at $204-$207 rather than a single line at $205.",
          highlight: ["zones", "round numbers", "high-volume nodes", "gap", "moving averages"],
        },
        {
          type: "quiz-tf",
          statement: "Support acts like a floor that prevents prices from falling further.",
          correct: true,
          explanation:
            "Support is where demand (buying pressure) is strong enough to halt or reverse a decline — creating a 'floor' effect. Traders place buy orders near these levels, and as price approaches support, the density of buy orders increases. The resulting demand absorbs selling pressure and stabilizes price. However, no floor is indestructible — if selling pressure is strong enough, support will break.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Role Reversal: When Floors Become Ceilings",
          content:
            "One of the most powerful concepts in technical analysis is **role reversal** (also called **polarity**):\n\n**When support breaks, it often becomes resistance. When resistance breaks, it often becomes support.**\n\nWhy does this happen? Psychology:\n\n- Imagine AAPL has support at $170. Thousands of traders bought there. Now price crashes through $170 to $160. Those traders are underwater and feeling regret.\n- When price recovers back to $170, those trapped buyers sell to 'break even' — flooding the market with supply at the old support level. The old floor becomes the new ceiling.\n\nThe reverse works too: if TSLA finally breaks through $300 resistance (a level it failed at four times), traders who sold at $300 feel regret. When price pulls back to $300, new buyers step in — turning the old ceiling into a new floor.\n\n**Trading the role reversal**: The classic approach is to wait for a breakout, then buy the first pullback to the broken level. This is called a 'retest' or 'throwback,' and it is one of the highest-probability entry techniques in all of technical analysis.\n\nThe S&P 500's behavior at the 4,800 level in 2023-2024 is a textbook real-world example: it acted as resistance through all of 2022, was finally broken in early 2024, and then became support on every subsequent pullback.",
          highlight: ["role reversal", "polarity", "retest", "throwback"],
        },
        {
          type: "quiz-mc",
          question: "What typically happens when a key support level breaks decisively?",
          options: [
            "It often flips and becomes a new resistance level (role reversal)",
            "It immediately becomes even stronger support",
            "Support levels are random and nothing predictable happens",
            "The stock always recovers to the old support within one trading session",
          ],
          correctIndex: 0,
          explanation:
            "Role reversal is one of the most well-documented phenomena in technical analysis. Traders who bought at the old support level are now trapped with losses. When price recovers to their break-even point, they sell in relief — converting what was demand (support) into supply (resistance). This is human psychology at scale, and it works across all markets and timeframes.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Fibonacci Retracements: Mathematical Support and Resistance",
          content:
            "**Fibonacci retracements** are horizontal lines drawn at specific percentages of a price move, based on ratios derived from the Fibonacci sequence (0, 1, 1, 2, 3, 5, 8, 13, 21...).\n\nThe key Fibonacci retracement levels are:\n\n- **23.6%** — shallow pullback, strong trend intact\n- **38.2%** — moderate pullback, trend still healthy\n- **50.0%** — not technically Fibonacci, but widely watched (halfway retracement)\n- **61.8%** — the 'golden ratio,' the most significant retracement level\n- **78.6%** — deep pullback, trend in danger of failing\n\nHow to use them: after a significant move (say TSLA rallies from $200 to $300), draw Fibonacci retracements from the low to the high. The 38.2% level ($261.80), 50% level ($250), and 61.8% level ($238.20) become potential support zones where buyers may step in during a pullback.\n\nWhy do Fibonacci levels work? Partly self-fulfilling prophecy (millions of traders watch them), partly because human crowd behavior follows mathematical patterns. Regardless of the 'why,' the 61.8% retracement is statistically one of the most reliable reversal zones in markets.\n\nFibonacci is used by institutional desks, hedge funds, and retail traders alike — making these levels extremely well-watched and often respected.",
          highlight: ["Fibonacci retracement", "golden ratio", "61.8%"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "MSFT rallied from $350 to $450 over two months. It has now pulled back to $388. You calculate the Fibonacci retracement levels: 38.2% = $411.80, 50% = $400, 61.8% = $388.20.",
          question: "At what Fibonacci level is MSFT currently finding potential support, and what is the significance?",
          options: [
            "The 61.8% (golden ratio) level at $388 — the deepest common retracement, often the last line of defense for an uptrend",
            "The 23.6% level — a shallow and insignificant pullback",
            "No Fibonacci level is relevant at $388",
            "The 50% level — exactly halfway through the move",
          ],
          correctIndex: 0,
          explanation:
            "MSFT at $388 is sitting right at the 61.8% Fibonacci retracement ($388.20), known as the golden ratio level. This is the most widely watched Fibonacci level and often acts as the 'make or break' point for an uptrend. If it holds, the uptrend is likely to resume. If it fails, the entire rally from $350 to $450 is in jeopardy. Professional traders often place their most aggressive limit buy orders at the 61.8% retracement.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Breakouts, Breakdowns, and False Breakouts",
          content:
            "When price decisively moves beyond a support or resistance level, it is called a **breakout** (above resistance) or **breakdown** (below support). These are among the most important events in technical analysis.\n\n**What makes a valid breakout?**\n- **Volume confirmation**: Volume should be at least 1.5-2x the 20-day average. Low-volume breakouts fail at an alarmingly high rate.\n- **Close beyond the level**: An intraday wick above resistance is not a breakout. Price must close beyond the level — ideally on the daily timeframe.\n- **Follow-through**: The best breakouts show continuation in the next 1-3 bars. If price immediately retreats, it may be a false breakout.\n\n**False breakouts** (fakeouts) are when price briefly pierces a level and then reverses. They are extremely common — some studies suggest 50-60% of breakouts fail. Experienced traders actually use false breakouts as trading signals: a failed breakout above resistance is a high-conviction short setup, and a failed breakdown below support is a high-conviction long setup.\n\n**The 'trap' pattern**: Price breaks above resistance, triggering breakout buy orders. Then it immediately reverses, trapping those buyers with losses. As they sell in panic, the price drops sharply. Market makers are well aware of these dynamics and sometimes engineer them.",
          highlight: ["breakout", "breakdown", "false breakout", "fakeout"],
        },
        {
          type: "quiz-mc",
          question: "Which of the following breakouts has the highest probability of sustaining?",
          options: [
            "Price closes above resistance on 3x average volume with follow-through the next day",
            "Price briefly wicks above resistance intraday but closes below on low volume",
            "Price gaps above resistance on a weekend news event with no volume data yet",
            "Price slowly drifts above resistance by $0.01 on half the average volume",
          ],
          correctIndex: 0,
          explanation:
            "A valid breakout requires three elements: a decisive close above the level (not just an intraday wick), strong volume confirmation (3x average is excellent), and follow-through in subsequent sessions. The other options describe high-failure-rate scenarios: intraday wicks without a close above, gap moves with no volume confirmation, and low-volume drifts. Volume and follow-through separate real breakouts from traps.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock has bounced off the $98 level three times in the past month. It is now at $99 and keeps failing to break above $104 (tested twice). Volume has been declining for the last five sessions.",
          question: "What behavior does this setup most likely lead to?",
          options: [
            "The stock ranges between $98 support and $104 resistance until one side breaks with volume",
            "The stock will break above $104 on the very next attempt",
            "Support and resistance levels do not apply to this stock",
            "The stock will crash below $90 immediately",
          ],
          correctIndex: 0,
          explanation:
            "This is a well-defined trading range with tested support ($98, bounced 3x) and resistance ($104, rejected 2x). The declining volume suggests the range is compressing — a squeeze that will eventually resolve with a directional breakout. Traders play the range (buy near $98, sell near $104) until a volume-confirmed breakout tells them which way the resolution occurs. Patience and discipline define the edge here.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement: "A support level becomes more significant each time it is tested and holds.",
          correct: true,
          explanation:
            "Each successful test of a support level adds to its significance because more traders become aware of it and place orders there. A support level that has held five times is psychologically stronger than one that held once — it becomes a self-reinforcing anchor. However, there is a nuance: each test also absorbs some of the resting buy orders, which means a heavily-tested level may eventually break if the buying pressure is not replenished.",
          difficulty: 1,
        },
        {
          type: "practice",
          instruction: "Advance the chart and observe how price bounces between the same horizontal zones repeatedly. Try to visually identify the support and resistance levels.",
          objective: "Watch price interact with support and resistance across at least 10 bars",
          actionType: "observe",
          challenge: {
            priceData: PRACTICE_SUPPORT_RESISTANCE.bars,
            initialReveal: PRACTICE_SUPPORT_RESISTANCE.initialReveal,
            objectives: [{ kind: "advance-time", bars: 10 }],
            hint: "Notice how price approaches the same horizontal zones again and again. Support is near the $97-$98 area and resistance is near $104-$105. Watch for hammers at support and shooting stars at resistance.",
          },
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Your First Trade
       ================================================================ */
    {
      id: "basics-4",
      title: "Your First Trade",
      description: "Place your very first buy and sell orders",
      icon: "Zap",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "The Complete Order Lifecycle",
          content:
            "Every trade you place — whether on FinSim or a real brokerage — follows a precise lifecycle from click to settlement:\n\n**1. Order Entry**: You specify the stock, quantity, order type (market/limit/stop), and direction (buy/sell). Your broker validates the order against your account balance and risk limits.\n\n**2. Order Routing**: Your broker routes the order to an execution venue — an exchange (NYSE, NASDAQ), an **alternative trading system (ATS)** or dark pool, or a market maker. In the U.S., brokers are required by **Regulation NMS** to seek the best available price across all venues.\n\n**3. Order Matching**: At the venue, your order is matched against a resting order on the opposite side of the book. A buy order matches against the lowest available sell order. This happens in microseconds.\n\n**4. Execution Confirmation**: You receive a fill confirmation showing the exact price, quantity, and timestamp. If your order was partially filled (common for large orders), you may receive multiple confirmations.\n\n**5. Clearing**: The trade is submitted to a clearinghouse (in the U.S., the **DTCC** — Depository Trust and Clearing Corporation), which guarantees both sides of the transaction and manages counterparty risk.\n\n**6. Settlement**: Shares and cash actually change hands. In the U.S., equities settle on **T+1** (trade date plus one business day). Until settlement, you have a trade but not yet the legal transfer of ownership.",
          visual: "order-flow",
          highlight: ["order routing", "matching", "T+1 settlement", "DTCC"],
        },
        {
          type: "quiz-tf",
          statement: "In the U.S., if you buy shares of AAPL on Monday, the shares legally transfer to your account on Tuesday (T+1 settlement).",
          correct: true,
          explanation:
            "The U.S. moved to T+1 settlement in May 2024. Previously it was T+2 (two business days). This means if you buy on Monday, settlement occurs on Tuesday. If you buy on Friday, settlement occurs on Monday (weekends do not count). Until settlement, the clearinghouse guarantees the trade, but the formal transfer of shares and cash has not yet occurred.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Order Types: Market, Limit, and Stop",
          content:
            "Choosing the right order type is one of the most important tactical decisions a trader makes. Each type represents a different tradeoff between certainty of execution and price control.\n\n**Market Order**: Execute immediately at the best available price.\n- **Pro**: Guaranteed to fill (for liquid stocks). You get in or out instantly.\n- **Con**: No price control. In fast-moving markets, you may experience **slippage** — executing at a worse price than expected. If the ask is $100 and a large sell order hits simultaneously, you might fill at $100.15.\n- **Best for**: Urgent trades, highly liquid stocks, small position sizes.\n\n**Limit Order**: Execute only at your specified price or better.\n- **Buy limit at $95**: Only fills if price drops to $95 or below.\n- **Sell limit at $105**: Only fills if price rises to $105 or above.\n- **Pro**: Complete price control. You define your worst-case fill price.\n- **Con**: No guarantee of execution. If price never reaches your limit, the order sits unfilled. You may miss a move entirely.\n- **Best for**: Entering positions at specific levels, non-urgent trades, illiquid stocks.\n\n**Stop Order** (Stop-Loss): Becomes a market order when a trigger price is hit.\n- **Sell stop at $90**: If price drops to $90, the stop triggers and your position is sold at the next available price (which may be slightly below $90).\n- **Purpose**: Automatic risk management. You define your maximum acceptable loss in advance.\n- **Caution**: In a fast crash, your stop may execute well below the trigger price (this is called **gap risk**).",
          highlight: ["market order", "limit order", "stop order", "slippage", "gap risk"],
        },
        {
          type: "quiz-mc",
          question: "You want to buy TSLA, currently at $248. You believe $240 is strong support and want to enter there. Which order type should you use?",
          options: [
            "A buy limit order at $240, which only fills if price drops to $240 or below",
            "A market order, which buys immediately at $248",
            "A sell stop at $240",
            "A sell limit at $240",
          ],
          correctIndex: 0,
          explanation:
            "A buy limit order at $240 tells your broker: 'only buy if the price drops to $240 or lower.' This gives you price control — you enter at the support level you identified. A market order would fill immediately at $248, which is $8 above your target. Limit orders are the correct tool whenever you want to buy at a specific level and are willing to risk the order not filling.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "The Hidden Costs: Spread, Slippage, and Commissions",
          content:
            "The price you see on a chart is the **last traded price** — but that is not necessarily the price you will pay. Understanding the true cost of a trade requires accounting for three friction layers:\n\n**1. The Bid-Ask Spread** (always present):\nYou buy at the ask and sell at the bid. On liquid stocks (AAPL, MSFT), spreads are $0.01-$0.02. On illiquid stocks, spreads can be $0.10-$1.00+. If you round-trip (buy then sell), you pay the spread twice.\n\n**2. Slippage** (variable):\nThe difference between your expected fill price and your actual fill price. Slippage occurs when the market moves between the time you submit an order and the time it executes, or when your order is large enough to 'walk the book' (fill against progressively worse prices). Market orders are most susceptible.\n\n**3. Commissions and Fees** (broker-dependent):\nMany U.S. brokers now offer zero-commission equity trades (Robinhood, Schwab, Fidelity). However, they may earn money through **payment for order flow (PFOF)** — selling your orders to market makers, who profit from the spread. Options still carry per-contract fees ($0.50-$0.65 per contract).\n\n**Total trade cost** = Spread + Slippage + Commission. For a day trader making 50 round-trip trades per day, even $0.02 of spread per trade on 1,000 shares = $2,000/day in spread costs alone. Costs compound and are a primary reason most day traders fail.",
          highlight: ["bid-ask spread", "slippage", "commission", "payment for order flow"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You place a market buy order for 500 shares of a small-cap stock. The order book shows: Ask $25.00 (200 shares), Ask $25.10 (150 shares), Ask $25.25 (300 shares). There is no other liquidity visible.",
          question: "What happens when your 500-share market order executes?",
          options: [
            "You get 200 shares at $25.00, 150 at $25.10, and 150 at $25.25 — your average fill is about $25.10",
            "All 500 shares fill at $25.00",
            "The order is rejected due to insufficient liquidity",
            "All 500 shares fill at $25.25",
          ],
          correctIndex: 0,
          explanation:
            "Market orders 'walk the book' — they consume available liquidity at each price level until the full quantity is filled. You exhaust the 200 shares at $25.00, then the 150 shares at $25.10, then take 150 of the 300 shares at $25.25. Your average fill price is (200x$25.00 + 150x$25.10 + 150x$25.25) / 500 = $25.10. This slippage of $0.10 from the initial ask is why limit orders are essential for illiquid stocks.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Going Long vs. Going Short",
          content:
            "There are two fundamental directions in trading, and understanding both is essential:\n\n**Going Long (Buy)**:\n- You buy shares, expecting the price to rise.\n- Profit = (Sell Price - Buy Price) x Quantity\n- Maximum loss: the stock goes to zero (you lose your entire investment).\n- Maximum gain: theoretically unlimited (the stock can rise forever).\n\n**Going Short (Short Selling)**:\n- You borrow shares from your broker, sell them immediately, and plan to buy them back later at a lower price.\n- Profit = (Sell Price - Buy Price) x Quantity (you sold high first, then bought low).\n- Maximum gain: the stock goes to zero (you pocket the full short sale price).\n- Maximum loss: theoretically unlimited (the stock can rise forever, and you must eventually buy back).\n\nShort selling carries unique risks:\n- **Margin requirements**: Your broker requires collateral (typically 150% of the position value).\n- **Short squeeze**: If the stock rallies, short sellers are forced to buy back shares to cover losses, which drives the price even higher in a self-reinforcing spiral. GameStop (GME) in January 2021 was a historic short squeeze.\n- **Borrow cost**: You pay a daily fee to borrow shares. Hard-to-borrow stocks can charge 20-100%+ annualized.\n\nIn FinSim, you can practice both long and short trades with zero real risk.",
          highlight: ["going long", "short selling", "short squeeze", "margin"],
        },
        {
          type: "quiz-mc",
          question: "You short sell 100 shares at $80. The stock rises to $95. What is your unrealized P&L?",
          options: [
            "-$1,500 (a loss, since you sold at $80 and it is now $95)",
            "+$1,500 (a profit)",
            "-$800",
            "$0 (you have not closed the trade yet)",
          ],
          correctIndex: 0,
          explanation:
            "When short selling, you profit when the price falls and lose when it rises. You sold at $80 and the current price is $95 — that is a $15 per share loss. On 100 shares: 100 x -$15 = -$1,500. This is unrealized because you have not yet covered (bought back) the position. Short selling inverts the normal long P&L formula, and losses can theoretically grow without limit if the stock keeps rising.",
          difficulty: 2,
        },
        {
          type: "practice",
          instruction: "Place your first buy order. Select a quantity and click Buy to enter a long position. Watch how your position appears in the portfolio immediately after execution.",
          objective: "Place a buy order for at least 1 share",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_UPTREND.bars,
            initialReveal: PRACTICE_UPTREND.initialReveal,
            objectives: [{ kind: "buy", minQuantity: 1 }],
            hint: "Enter a quantity (try 10 shares) and click the Buy button. Your position will appear instantly with a cost basis equal to the current price.",
            startingCash: 10000,
          },
        },
        {
          type: "teach",
          title: "Closing a Position: Taking Profit and Cutting Losses",
          content:
            "Opening a trade is only half the equation. The exit is where profits or losses are realized — and where most traders struggle emotionally.\n\n**Selling to close a long position**:\n- Go to your Positions tab, select the position, and sell. Your realized P&L is locked in permanently.\n\n**The hardest lesson in trading**: Cut losers fast and let winners run. Research consistently shows that amateur traders do the exact opposite:\n\n- **Disposition effect**: Investors sell winners too early (to lock in the dopamine hit of a profit) and hold losers too long (hoping they will recover to break even). This is one of the most well-documented behavioral biases in finance.\n\n- Nobel Prize-winning research by Kahneman and Tversky showed that the pain of a $1,000 loss is psychologically about 2x more intense than the pleasure of a $1,000 gain. This asymmetry causes traders to make irrational decisions to avoid crystallizing losses.\n\n**Professional discipline**:\n- Define your stop-loss before entering a trade (e.g., 'I will exit if the stock drops 5% from my entry').\n- Define your profit target (e.g., 'I will take partial profits at a 2:1 reward-to-risk ratio').\n- Execute the plan mechanically. The market does not care about your entry price.",
          highlight: ["disposition effect", "stop-loss", "reward-to-risk"],
        },
        {
          type: "practice",
          instruction: "Complete a full trade cycle: buy shares, advance the chart a few bars to see the price change, then sell to close your position. Watch your P&L move from unrealized to realized.",
          objective: "Complete a full buy-then-sell cycle",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_UP_DOWN.bars,
            initialReveal: PRACTICE_UP_DOWN.initialReveal,
            objectives: [
              { kind: "buy", minQuantity: 1 },
              { kind: "sell", minQuantity: 1 },
            ],
            hint: "Buy first, then advance several bars using the time controls to see price move. Finally, sell from the Positions tab to close the trade and realize your P&L.",
            startingCash: 10000,
          },
        },
      ],
    },

    /* ================================================================
       LESSON 6 — Understanding P&L
       ================================================================ */
    {
      id: "basics-5",
      title: "Understanding P&L",
      description: "Calculate profits, losses, and returns like a pro",
      icon: "Calculator",
      xpReward: 55,
      steps: [
        {
          type: "teach",
          title: "Mark-to-Market: How Positions Are Valued",
          content:
            "Every open position in your portfolio is continuously valued at the current market price — a process called **mark-to-market (MTM)**. This is how professional trading desks, hedge funds, and your FinSim portfolio all work.\n\n**Mark-to-Market P&L** = (Current Market Price - Entry Price) x Quantity\n\nThis number updates with every price tick. It tells you what your position is worth right now, at this instant, if you were to close it.\n\nExample:\n- You buy 50 shares of GOOGL at $170.\n- Current price is $178.\n- MTM P&L = (178 - 170) x 50 = **+$400**\n- Your position value is 50 x $178 = **$8,900**\n\nInstitutional trading desks mark every position to market at end of day — this is how risk managers calculate firm-wide exposure, how prime brokers calculate margin requirements, and how hedge fund net asset values (NAVs) are computed.\n\nKey insight: mark-to-market P&L is real in the sense that it reflects what you could liquidate for right now. But it is also volatile — a $400 gain can become a $200 loss in an hour. Managing the emotional impact of watching MTM swings is a fundamental skill in trading.",
          highlight: ["mark-to-market", "MTM", "position value"],
        },
        {
          type: "teach",
          title: "Unrealized vs. Realized P&L",
          content:
            "This distinction is not just semantic — it has profound implications for your psychology, your accounting, and your taxes.\n\n**Unrealized P&L** (paper gain/loss):\n- The profit or loss on positions you still hold.\n- Fluctuates constantly as prices change.\n- Not yet taxable (in most jurisdictions).\n- Formula: (Current Price - Entry Price) x Shares Held\n\n**Realized P&L** (closed gain/loss):\n- The profit or loss on positions you have sold and closed.\n- Permanent and irreversible — no amount of hoping will change it.\n- Taxable in the year realized (see tax implications below).\n- Formula: (Sell Price - Buy Price) x Shares Sold\n\nWhy does this matter psychologically? Many traders confuse unrealized gains with actual wealth. A $10,000 unrealized profit feels like you 'have' $10,000 — but markets can reverse instantly. The only money that is truly yours is realized profit that has been withdrawn from your trading account.\n\n**Average Cost Basis**: When you buy the same stock multiple times at different prices, your broker calculates the weighted average:\n- Buy 100 shares at $50 = $5,000\n- Buy 100 shares at $55 = $5,500\n- Average cost = $10,500 / 200 shares = **$52.50 per share**\n\nYour P&L is then calculated from this average cost basis, not from any individual purchase.",
          highlight: ["unrealized P&L", "realized P&L", "average cost basis"],
        },
        {
          type: "quiz-mc",
          question: "You bought 20 shares at $50 and later bought 30 more at $60. What is your average cost basis per share?",
          options: [
            "$56 per share",
            "$55 per share",
            "$50 per share",
            "$60 per share",
          ],
          correctIndex: 0,
          explanation:
            "Average cost = total dollars invested / total shares. Total invested: (20 x $50) + (30 x $60) = $1,000 + $1,800 = $2,800. Total shares: 20 + 30 = 50. Average cost: $2,800 / 50 = $56.00 per share. Note that the average is weighted toward $60 because you bought more shares at the higher price. This is a fundamental calculation in portfolio management.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Return Percentages and Annualization",
          content:
            "Dollar P&L tells you the absolute gain or loss, but **return percentage** lets you compare any two trades on an equal basis regardless of position size.\n\n**Simple Return** = (P&L / Cost Basis) x 100\n\nExample: Buy $5,000 of AMZN, sell for $5,750.\n- P&L = $750\n- Return = ($750 / $5,000) x 100 = **15%**\n\nBut returns are meaningless without a time dimension. A 15% return in 2 weeks is extraordinary. A 15% return over 5 years is mediocre.\n\n**Annualized Return** standardizes returns to a yearly rate:\n- Annualized Return = (1 + Total Return)^(365 / Days Held) - 1\n\nExample: 15% return in 60 days:\n- Annualized = (1.15)^(365/60) - 1 = (1.15)^6.08 - 1 = **137%** annualized\n\nExample: 15% return in 730 days (2 years):\n- Annualized = (1.15)^(365/730) - 1 = (1.15)^0.5 - 1 = **7.2%** annualized\n\nProfessional fund managers are evaluated on annualized returns. The S&P 500 has returned roughly **10% annualized** over the past century (including dividends). Any strategy that consistently delivers >15% annualized is considered exceptional — and anything claiming >30% annualized should be viewed with deep skepticism.",
          highlight: ["simple return", "annualized return", "cost basis"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You bought 100 shares of NVDA at $800. The price has dropped to $750. You are feeling nervous and considering selling to cut your losses.",
          question: "What is your current unrealized loss in both dollar and percentage terms?",
          options: [
            "-$5,000 loss (-6.25%)",
            "-$50 loss (-0.625%)",
            "-$500 loss (-5%)",
            "-$7,500 loss (-7.5%)",
          ],
          correctIndex: 0,
          explanation:
            "Unrealized loss = 100 x ($750 - $800) = -$5,000. Cost basis = 100 x $800 = $80,000. Return = -$5,000 / $80,000 = -6.25%. This loss is 'unrealized' because you still hold the shares. If NVDA recovers to $800+, you would be back to breakeven or positive. However, if you had a pre-defined stop-loss at -5% ($760), professional discipline would dictate selling at $760 rather than waiting until -6.25%. The extra 1.25% of loss represents the cost of indecision.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Tax Implications: Short-Term vs. Long-Term Capital Gains",
          content:
            "In the United States, realized gains on investments are subject to **capital gains tax**. The rate depends entirely on how long you held the position before selling.\n\n**Short-Term Capital Gains** (held < 1 year):\n- Taxed as ordinary income — at your marginal tax rate.\n- For a high earner in the 37% federal bracket, a $10,000 short-term gain incurs $3,700 in federal taxes (plus state taxes).\n- Day traders and frequent traders pay short-term rates on virtually all gains.\n\n**Long-Term Capital Gains** (held >= 1 year):\n- Taxed at preferential rates: 0%, 15%, or 20% depending on your income.\n- Most investors fall in the 15% bracket. A $10,000 long-term gain incurs only $1,500 in federal taxes.\n- This is a massive incentive to hold positions for at least one year.\n\n**Tax-Loss Harvesting**: Intentionally selling losing positions to realize losses, which offset gains and reduce your tax bill. You can deduct up to $3,000 of net capital losses against ordinary income per year, with excess carrying forward to future years.\n\n**Wash Sale Rule**: If you sell a stock at a loss and buy the same (or 'substantially identical') stock within 30 days before or after the sale, the loss is disallowed for tax purposes. The IRS created this rule to prevent artificial loss harvesting.\n\nWhile FinSim uses virtual money, understanding tax implications is essential for real trading — taxes can reduce your effective returns by 20-40%.",
          highlight: ["short-term capital gains", "long-term capital gains", "tax-loss harvesting", "wash sale rule"],
        },
        {
          type: "quiz-mc",
          question: "You realize a $20,000 short-term gain and a $12,000 long-term gain in the same year. You are in the 35% federal tax bracket. Approximately how much federal tax do you owe on these gains? (Long-term rate: 15%)",
          options: [
            "$8,800 ($7,000 short-term + $1,800 long-term)",
            "$11,200 (35% on everything)",
            "$4,800 (15% on everything)",
            "$0 (capital gains are not taxed)",
          ],
          correctIndex: 0,
          explanation:
            "Short-term gains are taxed at your ordinary income rate: $20,000 x 35% = $7,000. Long-term gains receive the preferential rate: $12,000 x 15% = $1,800. Total federal tax = $8,800. This example illustrates why holding period matters enormously. If you had held the short-term position for one more year, the $20,000 gain would be taxed at 15% ($3,000) instead of 35% ($7,000) — saving you $4,000.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement: "An unrealized loss becomes a realized loss only when you sell the position.",
          correct: true,
          explanation:
            "Correct. Unrealized (paper) losses fluctuate as long as you hold the position — they could shrink, disappear, or grow. The loss only becomes realized and permanent when you close the trade. This distinction matters for taxes (unrealized losses are not deductible), for psychology (paper losses feel less painful than realized ones, which causes the disposition effect), and for portfolio accounting.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Benchmark Comparison: Measuring Real Performance",
          content:
            "Raw returns mean nothing without a benchmark. If your portfolio returned 12% this year, is that good? It depends entirely on what the market did.\n\n**Common benchmarks:**\n- **S&P 500** (SPY): The standard benchmark for U.S. large-cap equity strategies. If the S&P returned 15% and you returned 12%, you underperformed by 3% — and would have been better off buying a simple index fund.\n- **NASDAQ-100** (QQQ): The benchmark for tech-heavy strategies.\n- **Russell 2000** (IWM): The benchmark for small-cap strategies.\n- **Risk-free rate**: The return on U.S. Treasury bills (currently ~5%). Any strategy must beat the risk-free rate to justify the risk taken.\n\n**Alpha** is the return above what a benchmark delivered:\n- Alpha = Your Return - Benchmark Return\n- Positive alpha means you added value. Negative alpha means you would have been better off in the benchmark.\n\n**The Sharpe Ratio** measures risk-adjusted return:\n- Sharpe = (Portfolio Return - Risk-Free Rate) / Portfolio Standard Deviation\n- A Sharpe above 1.0 is good, above 2.0 is excellent, above 3.0 is exceptional (and rare over long periods).\n\nMost professional fund managers fail to consistently beat the S&P 500 after fees. Studies show that over a 15-year period, approximately 90% of actively managed large-cap funds underperform the index. This is why passive index investing has become the dominant strategy for most investors.",
          highlight: ["benchmark", "alpha", "Sharpe ratio", "risk-free rate"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Over the past year, your FinSim portfolio returned 18%. During the same period, the S&P 500 returned 22%, and the risk-free rate (1-year Treasury) was 5%. Your portfolio's standard deviation was 20%.",
          question: "What is your alpha relative to the S&P 500, and what is your Sharpe ratio?",
          options: [
            "Alpha = -4% (underperformed); Sharpe = 0.65",
            "Alpha = +18% (outperformed); Sharpe = 1.8",
            "Alpha = -4% (underperformed); Sharpe = 0.90",
            "Alpha = +13%; Sharpe = 0.65",
          ],
          correctIndex: 0,
          explanation:
            "Alpha = 18% - 22% = -4%. Despite a strong absolute return, you underperformed the S&P 500 by 4 percentage points. Sharpe = (18% - 5%) / 20% = 13% / 20% = 0.65. A Sharpe below 1.0 suggests the risk you took was not adequately compensated. You would have earned more with less volatility by simply buying an S&P 500 index fund. This is why benchmark comparison is essential — absolute returns alone are misleading.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question: "Why is the Sharpe ratio more useful than raw returns when evaluating a trading strategy?",
          options: [
            "It accounts for risk — a 20% return with 10% volatility is better than 20% with 40% volatility",
            "It only measures upside potential",
            "It ignores benchmark performance",
            "Higher Sharpe ratios always mean higher dollar profits",
          ],
          correctIndex: 0,
          explanation:
            "The Sharpe ratio divides excess return (above the risk-free rate) by the standard deviation of returns — effectively measuring how much return you earned per unit of risk. Two strategies can both return 20%, but if one does so with half the volatility, it has a superior Sharpe ratio and is the better strategy. In professional finance, risk-adjusted return is the gold standard for performance measurement.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "P&L Psychology: The Concepts That Separate Pros from Amateurs",
          content:
            "Understanding P&L calculation is straightforward. Managing the psychology of P&L is what separates profitable traders from everyone else.\n\n**Key psychological traps:**\n\n- **Anchoring to your entry price**: The market does not care what you paid. A stock at $80 that you bought at $100 is not 'cheap' just because you paid more. Evaluate every position based on its current merit, not your entry.\n\n- **Sunk cost fallacy**: 'I have already lost $5,000 — I cannot sell now.' Yes, you can. The $5,000 is gone regardless. The question is: would you buy this stock today at this price? If no, sell.\n\n- **Mental accounting**: Treating different 'pots' of money differently. Gains from a lucky trade are not 'house money' that you can afford to lose. Every dollar in your portfolio has equal value.\n\n- **Recency bias**: Overweighting recent trades in your assessment. Three winning trades in a row do not mean you have 'figured it out.' Three losing trades do not mean your strategy is broken. Evaluate performance over a statistically significant sample (50+ trades).\n\n**Professional framework**: Track every trade in a journal. Record your thesis, entry, stop-loss, target, actual exit, and what you learned. Over time, this data reveals patterns in your decision-making that pure P&L numbers cannot show.",
          highlight: ["anchoring", "sunk cost fallacy", "mental accounting", "trade journal"],
        },
        {
          type: "quiz-tf",
          statement: "If you bought a stock at $100 and it is now at $85, you should hold until it recovers to your entry price because selling would 'lock in' the loss.",
          correct: false,
          explanation:
            "This is the sunk cost fallacy combined with loss aversion — two of the most destructive biases in trading. The $15 loss already exists whether you sell or not. The only question that matters is: given the stock's current price and outlook, would you buy it today? If the answer is no, the rational action is to sell, redeploy the capital elsewhere, and potentially harvest the tax loss. Your entry price is irrelevant to the stock's future direction.",
          difficulty: 2,
        },
      ],
    },
  ],
};
