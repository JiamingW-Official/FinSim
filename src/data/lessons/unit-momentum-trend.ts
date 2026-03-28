import type { Unit } from "./types";

export const UNIT_MOMENTUM_TREND: Unit = {
  id: "momentum-trend",
  title: "Momentum & Trend Following",
  description:
    "Master the evidence behind price momentum, systematic trend-following strategies, CTA managed futures, momentum crash risk, dual momentum frameworks, and real-world implementation mechanics",
  icon: "📈",
  color: "#8b5cf6",
  lessons: [
    // ─── Lesson 1: Momentum Fundamentals ────────────────────────────────────────
    {
      id: "momentum-trend-1",
      title: "Momentum Fundamentals",
      description:
        "12-1 month formation period, cross-sectional vs time-series momentum, and the empirical premium evidence",
      icon: "TrendingUp",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Is the Momentum Premium?",
          content:
            "**Momentum** is one of the most robust anomalies in empirical finance: assets that have performed well over the recent past tend to continue outperforming, and recent losers tend to continue underperforming — at least over the next 1–12 months.\n\n**Academic foundation:**\nJegadeesh and Titman (1993) published the landmark paper showing that buying past 6–12 month winners and shorting past losers in U.S. equities delivered significant risk-adjusted returns. The finding has since been replicated across over 40 countries and dozens of asset classes: equities, bonds, currencies, commodities, and real estate.\n\n**The formation period convention:**\nPractitioners typically use a **12-month formation window with a 1-month skip** — often written as the \"12-1\" or \"J=12, K=1\" strategy:\n- **Look-back**: returns over the past 12 months\n- **Skip the most recent month**: the last 30 days are excluded from the ranking\n- **Reason for the skip**: the most recent month contains **short-term reversal** — stocks that spiked last week tend to mean-revert. Excluding month 12 isolates the persistent intermediate-term drift.\n\n**Scale of the premium:**\nAcross U.S. large caps from 1927–2020, the top-minus-bottom momentum decile spread averaged roughly **9–12% per year** before costs — though with severe left-tail crash risk in certain environments (more on this in Lesson 4).\n\n**Why does it persist?**\nThree main hypotheses:\n1. **Behavioral underreaction**: investors are slow to update beliefs; prices drift as information diffuses\n2. **Momentum traders and trend-chasers**: self-fulfilling institutional herding\n3. **Risk-based explanations**: winners are in expanding industries, have rising earnings revisions, and exhibit genuine fundamental improvement",
          highlight: [
            "momentum premium",
            "12-1 formation",
            "Jegadeesh and Titman",
            "short-term reversal",
            "underreaction",
          ],
        },
        {
          type: "teach",
          title: "Cross-Sectional vs Time-Series Momentum",
          content:
            "**Momentum** is not one strategy — it is a family of related approaches. The two most important distinctions are cross-sectional momentum and time-series (absolute) momentum.\n\n**Cross-Sectional Momentum (Relative Momentum):**\nRank assets against each other. Buy the top-performing quintile or decile and short (or underweight) the bottom performers.\n- Signal: which stocks beat the peer group over the past 12 months?\n- Long-short construction: market-neutral, isolates relative outperformance\n- Used heavily in: quant equity strategies, factor ETFs, academic studies\n- Flaw: can lose money even in a rising market if strong stocks rise less than expected, and in falling markets can be long stocks that fell \"less\" — which still lose\n\n**Time-Series Momentum (Absolute Momentum / Trend Following):**\nCompare each asset only to itself. If the asset's recent return is positive, go long. If negative, go short or exit.\n- Signal: is this asset above or below its own 12-month average price or trend?\n- Can be fully invested, 100% short, or in cash — no cross-asset ranking needed\n- Used in: managed futures (CTAs), global macro, long/short commodity trend\n- Key benefit: **positive in bear markets** — if equities trend down, time-series momentum goes short or exits, providing crisis alpha\n\n**Which is better?**\nThey are complementary:\n- Cross-sectional momentum works best in trending equity bull markets with dispersion\n- Time-series momentum adds unique value in sustained asset-class-level trends, especially during crisis periods\n- Moskowitz, Ooi, and Pedersen (2012) showed time-series momentum is profitable in 58 of 58 liquid instruments studied and is related to but distinct from cross-sectional momentum\n\n**Combining them:**\nMany CTAs and multi-factor quant funds run both simultaneously, with cross-sectional allocation deciding which assets to hold and time-series signals deciding whether to hold them at all.",
          highlight: [
            "cross-sectional momentum",
            "time-series momentum",
            "absolute momentum",
            "crisis alpha",
            "Moskowitz Ooi Pedersen",
          ],
        },
        {
          type: "teach",
          title: "Empirical Evidence Across Markets",
          content:
            "The momentum premium is one of the most replicated findings in finance — but its magnitude, consistency, and source vary across markets.\n\n**Equities (most studied):**\n- Works in U.S., Europe, Japan, emerging markets, small/mid/large cap\n- Average gross return spread: ~1% per month (top vs bottom quintile)\n- Strongest in mid-cap; weaker in micro-cap (higher trading costs) and large-cap mega-stocks\n- Weakest in January (the \"January effect\" on losers reverting)\n\n**Commodity futures:**\n- Trend following in commodities has worked since at least the 1970s\n- Oil, gold, agricultural commodities, metals — all exhibit multi-month trending behavior\n- Driven partly by supply/demand imbalances that take months to normalize\n\n**Currency markets (FX):**\n- Carry and trend are the two dominant FX strategies\n- 3–12 month momentum in currency pairs: documented since the 1980s\n- Works even among major G10 currencies where markets are very liquid\n\n**Fixed income / bonds:**\n- Time-series momentum works: rising yield environments trend for months, bond bull markets trend for years\n- Cross-sectional: less clean than equities — sovereign credit ratings and duration confound the signal\n\n**Multi-asset diversification benefit:**\nAQR, Research Affiliates, and Man Group have documented that running diversified momentum across asset classes produces sharper Sharpe ratios than equity momentum alone — because correlations across asset momentum signals are low, providing diversification without diluting expected return.",
          highlight: [
            "momentum across markets",
            "commodity trend",
            "FX momentum",
            "Sharpe ratio",
            "diversified momentum",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In the standard '12-1' momentum strategy, why is the most recent month excluded from the performance ranking?",
          options: [
            "To avoid short-term reversal, where very recent winners tend to mean-revert over the next few weeks",
            "Because regulatory settlement periods make the most recent month's data unreliable",
            "To reduce transaction costs by trading less frequently",
            "Because academic research requires a 1-month publication delay for return data",
          ],
          correctIndex: 0,
          explanation:
            "The 1-month skip is specifically designed to avoid the short-term reversal effect — a well-documented phenomenon where stocks that surged in the most recent 2–4 weeks tend to mean-revert over the following weeks. This is a separate, competing effect from the intermediate-term momentum effect. By skipping the final month, the strategy isolates the persistent 2–12 month drift and avoids being contaminated by short-term bid-ask bounce, microstructure noise, or overreaction reversals.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Time-series (absolute) momentum can generate positive returns during a broad market crash because it can exit or go short assets that are in a sustained downtrend.",
          correct: true,
          explanation:
            "True. Unlike cross-sectional momentum, which is always long some assets and short others regardless of market direction, time-series momentum compares each asset to its own trend. When equity markets enter a prolonged bear market, the trend signal flips negative and the strategy exits or goes short. This is the source of the 'crisis alpha' that managed futures CTAs demonstrated in 2008 (returns of +20% to +40%) while equity markets fell 50%. It is one of the strongest arguments for including trend-following strategies in a portfolio.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Trend Following ───────────────────────────────────────────────
    {
      id: "momentum-trend-2",
      title: "Trend Following Systems",
      description:
        "SMA/EMA crossover systems, breakout strategies, turtle trading rules, and ADX trend strength confirmation",
      icon: "Activity",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Moving Average Crossover Systems",
          content:
            "**Moving average crossover** systems are the foundation of systematic trend following. The premise: when a shorter-term average crosses above a longer-term average, the asset is in an uptrend; when it crosses below, the asset is in a downtrend.\n\n**Simple Moving Average (SMA) crossovers:**\n- **Golden Cross**: 50-day SMA crosses above 200-day SMA → bullish signal, long entry\n- **Death Cross**: 50-day SMA crosses below 200-day SMA → bearish signal, short or exit\n- SMA weighs all bars equally within the window\n- Slower to react; fewer whipsaws in trending markets; worse in choppy markets\n\n**Exponential Moving Average (EMA) crossovers:**\n- EMA gives more weight to recent prices: weight = 2 / (N + 1)\n- 20-day EMA over 50-day EMA is a popular shorter-term system\n- Faster signals; captures trend turns earlier; more prone to false signals (whipsaws)\n\n**Key trade-offs:**\n- **Lag**: all moving averages lag price — a 200-day SMA takes months to react\n- **Whipsaws**: in ranging, low-volatility markets, MA systems repeatedly trigger and stop out, eroding capital through small losses\n- **Profit profile**: trend-following systems produce many small losses and a few large wins — a right-skewed return distribution that most discretionary traders find psychologically difficult\n\n**Multi-MA systems:**\nSome institutional trend followers use 3-way confirmation: fast EMA (e.g. 10-day), medium EMA (50-day), and slow EMA (200-day) must all agree directionally before a full position is established. This reduces whipsaws at the cost of further entry delay.\n\n**Lookback optimization trap:**\nBacktesting will always find a MA pair that performed best historically — but those parameters rarely persist. Robust systems use parameters near the center of a performance plateau, not the single best-fit optimum.",
          highlight: [
            "golden cross",
            "death cross",
            "SMA",
            "EMA",
            "whipsaw",
            "right-skewed",
            "lag",
          ],
        },
        {
          type: "teach",
          title: "Breakout Strategies & Turtle Trading",
          content:
            "**Breakout trading** enters positions when price moves beyond a defined range or level, signaling the start of a new trend. It is one of the oldest and most empirically robust trend-following approaches.\n\n**Channel breakout (Donchian Channel):**\n- Buy when price exceeds the highest high of the past N days\n- Sell/short when price falls below the lowest low of the past N days\n- Commonly used N: 20 days, 55 days, 100 days\n- Exit: opposite channel breakout or trailing stop\n\n**The Turtle Trading Experiment (1983):**\nRichard Dennis and William Eckhardt debated whether great traders are born or made. Dennis bet they could be trained. He recruited 23 novices — the \"Turtles\" — and taught them a complete systematic trading method:\n- **Entry rule 1 (System 1)**: buy 20-day highs, sell 20-day lows\n- **Entry rule 2 (System 2)**: buy 55-day highs, sell 55-day lows (more conservative)\n- **Stop loss**: 2×ATR (Average True Range) from entry price\n- **Position sizing**: 1% risk per trade; scale in up to 4 units as the trade moves favorably in 0.5×ATR increments\n- **Portfolio**: diversified across ~25 futures markets — currencies, metals, energies, grains, financials\n- **Results**: several Turtles went on to manage hundreds of millions in funds, generating strong returns through the 1980s and 1990s, demonstrating that systematic trend following can be taught and replicated\n\n**Why breakouts work:**\nBreakouts to new highs represent price discovery — the market is reaching a level where no prior supply exists. Institutional buyers often place buy-stop orders above resistance, creating self-reinforcing upward momentum when levels are cleared.\n\n**Limitations:**\n- Breakout systems suffer in range-bound markets (roughly 70% of the time, markets are not trending)\n- False breakouts (\"fakeouts\") above resistance that immediately reverse are a primary source of losses",
          highlight: [
            "breakout",
            "Donchian Channel",
            "Turtle Trading",
            "ATR stop",
            "position sizing",
            "false breakout",
          ],
        },
        {
          type: "teach",
          title: "ADX: Measuring Trend Strength",
          content:
            "**ADX — Average Directional Index** — quantifies trend strength without indicating direction. Developed by J. Welles Wilder, ADX answers the question: \"Is the market trending at all?\" — which is essential before applying any trend-following system.\n\n**Components:**\n- **+DI (Positive Directional Indicator)**: measures upward price movement strength\n- **-DI (Negative Directional Indicator)**: measures downward price movement strength\n- **ADX**: a smoothed average of the difference between +DI and -DI, normalized 0–100\n\n**Interpreting ADX values:**\n- **ADX < 20**: weak or absent trend — avoid trend-following; range strategies preferred\n- **ADX 20–25**: trend beginning to develop — cautious entries\n- **ADX 25–40**: strong trending market — optimal for trend-following systems\n- **ADX > 40**: very strong trend, often near exhaustion — trailing stops advised\n- **ADX > 60**: rare; typically seen in parabolic moves (very late-stage trends)\n\n**Directional signals:**\n- **+DI crosses above -DI** (while ADX > 25): bullish trend confirmation — consider long\n- **-DI crosses above +DI** (while ADX > 25): bearish trend confirmation — consider short\n\n**Practical use in a system:**\nTrend-following traders often gate their MA crossover or breakout signals through an ADX filter:\n- Only take buy signals when ADX > 25 (trend is real)\n- Reduce or exit positions when ADX drops below 20 (trend has stalled)\nThis dramatically reduces whipsaw losses in choppy, non-trending environments.\n\n**Wilder's original settings**: 14-period smoothing. Shorter periods (7–10) increase sensitivity and signal frequency; longer periods (21–28) reduce noise.",
          highlight: [
            "ADX",
            "+DI",
            "-DI",
            "trend strength",
            "ADX > 25",
            "ADX < 20",
            "Wilder",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In the Turtle Trading system, what was the primary purpose of the 2×ATR stop loss placed at entry?",
          options: [
            "To define a risk-based exit that scales naturally with current market volatility",
            "To ensure positions are always closed before the end of the trading day",
            "To trigger automatic pyramiding into additional position units",
            "To comply with commodity futures exchange margin requirements",
          ],
          correctIndex: 0,
          explanation:
            "The 2×ATR stop loss in the Turtle system was specifically chosen to be proportional to current market volatility. ATR (Average True Range) measures typical daily price fluctuation. Using 2×ATR ensures that normal market noise is unlikely to trigger the stop, while an abnormal adverse move (signaling the trade thesis is wrong) will. This volatility-normalized approach means the same risk percentage is taken whether trading a high-volatility crude oil contract or a low-volatility treasury bond — a critical principle of diversified futures trend following.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are running a breakout system on a stock. The 55-day high was breached on Monday, triggering a buy signal. By Wednesday, price has already retreated back below the 55-day high entry point and is now 3% below your entry. ADX is reading 17.",
          question:
            "Based on systematic trend-following principles, what does this scenario most likely indicate?",
          options: [
            "A false breakout in a non-trending environment — ADX below 20 suggests the breakout lacked trend strength confirmation",
            "A temporary retracement in a strong uptrend that should be used to add to the position",
            "A Death Cross formation requiring immediate position reversal to short",
            "Normal whipsaw that will resolve bullishly once the 200-day SMA is recaptured",
          ],
          correctIndex: 0,
          explanation:
            "ADX at 17 signals a weak, non-trending market — the market is likely range-bound. Breakout systems work best when ADX is above 20–25, indicating a real trend is developing. A breakout that immediately fails in a low-ADX environment is a classic false breakout (fakeout). Experienced trend followers often require ADX confirmation before entering breakouts precisely to avoid this scenario. The appropriate response depends on your stop-loss rules — if the 2×ATR stop was hit, exit; the system has been proven non-trending.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: CTA Strategies ────────────────────────────────────────────────
    {
      id: "momentum-trend-3",
      title: "CTA Strategies & Managed Futures",
      description:
        "Systematic trend CTAs, managed futures as an asset class, and their documented crisis alpha in 2008 and 2022",
      icon: "BarChart2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Managed Futures & CTA Structures",
          content:
            "**CTAs — Commodity Trading Advisors** — are regulated investment managers who trade primarily futures contracts across global markets using systematic, rules-based strategies. Despite the name, modern CTAs trade far more than commodities — they run global macro trend-following programs across dozens of futures markets.\n\n**What CTAs trade (typical diversified portfolio):**\n- Equity index futures: S&P 500, Eurostoxx, Nikkei, FTSE, MSCI EM\n- Fixed income futures: 10-year Treasuries, Bunds, JGBs, Gilts\n- Currency forwards/futures: EUR/USD, GBP/USD, USD/JPY, AUD/USD\n- Commodity futures: crude oil, natural gas, gold, copper, wheat, soybeans\n- Total portfolio: typically 40–80 markets simultaneously\n\n**How they operate:**\n- **Fully systematic**: no discretionary overrides — algorithms generate buy/sell signals\n- **Leverage via futures**: futures require only margin (~5–15% of notional), allowing 3–5× notional leverage at moderate risk\n- **Mark-to-market daily**: positions valued daily; margin calls possible\n- **Fee structure**: typically 2% management fee + 20% performance fee (\"2 and 20\") — among the most expensive alternative strategies\n\n**Major CTAs by AUM (2024):**\n- Man AHL, Winton Group, Millburn Ridgefield, Campbell & Company, Graham Capital Management\n- Aggregate AUM in managed futures: ~$300 billion globally\n\n**CTA strategy types:**\n- **Trend following** (most common, ~70% of CTA AUM): intermediate-term signals, 1–12 month horizons\n- **Counter-trend / mean reversion**: minority of CTAs — short-term reversals\n- **Carry**: hold high-yielding futures vs sell low-yielding\n- **Multi-strategy**: blend of the above",
          highlight: [
            "CTA",
            "managed futures",
            "systematic",
            "diversified",
            "trend following",
            "2 and 20",
          ],
        },
        {
          type: "teach",
          title: "Crisis Alpha: 2008 and 2022",
          content:
            "**Crisis alpha** is the term for the tendency of managed futures / systematic trend strategies to generate positive returns during severe market dislocations — precisely when equity portfolios need hedging most.\n\n**2008 Global Financial Crisis:**\nThe SG CTA Index (a benchmark of major managed futures funds) returned **+14.1% in 2008** while the S&P 500 fell 37% and a 60/40 portfolio fell ~25%.\n\nWhy it worked:\n- CTAs had been long Treasuries (trending up as rates fell)\n- CTAs had been short equities (trending down from late 2007)\n- CTAs had been short industrial metals (copper, zinc cratered)\n- CTAs had been long USD (safe-haven flows)\n- Trends were long, sustained, and strong — perfect CTA environment\n\n**2022 Rate-Shock Bear Market:**\nThe SG CTA Index returned **+24.8% in 2022** while:\n- S&P 500 fell 18%\n- U.S. Aggregate Bond Index fell 13% (worst year for bonds since 1926)\n- Traditional 60/40 portfolios fell ~16%\n\nWhy it worked:\n- CTAs went short bonds as rates rose (multi-decade trend shift)\n- CTAs went short equities (growth selloff)\n- CTAs went long energy commodities (oil, natural gas surged post-Ukraine)\n- CTAs went long USD (Fed tightening cycle, risk-off)\n\n**The common thread:**\nCrisis alpha emerges when a macro shock creates sustained, persistent trends across asset classes. CTAs do not need stocks to rise — they need trends in any direction.\n\n**Important caveat:**\nIn 2009, 2017, and 2019–2020 (aside from the March crash) CTAs underperformed significantly — choppy, range-bound markets with frequent trend reversals are their worst environment. The crisis alpha benefit must be weighed against the cost of holding a strategy that may underperform for years between crises.",
          highlight: [
            "crisis alpha",
            "2008",
            "2022",
            "SG CTA Index",
            "short bonds",
            "long energy",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Why did most systematic trend-following CTA funds generate strong positive returns in 2022, a year when both stocks and bonds fell sharply?",
          options: [
            "Because rising interest rates and equity selloffs created sustained multi-month trends that CTA algorithms could capitalize on by going short bonds and equities while going long energy",
            "Because CTAs hold cash as their primary asset and avoided the equity and bond drawdowns entirely",
            "Because the SEC granted managed futures funds a special exemption from mark-to-market losses in 2022",
            "Because CTA strategies are long volatility instruments that profit mechanically from any large market move regardless of direction",
          ],
          correctIndex: 0,
          explanation:
            "2022 was a textbook crisis alpha year for CTAs. The Fed's aggressive rate-hiking cycle created a prolonged downtrend in bonds (CTAs went short Treasuries and Bunds). The tech/growth equity selloff created a sustained downtrend in equities (CTAs went short equity index futures). The post-Ukraine energy shock created a sustained uptrend in oil and natural gas (CTAs went long). None of these were option-based or volatility strategies — they were directional trend-following positions in futures markets that trended strongly for months.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Managed futures CTA strategies consistently outperform equities every year because their systematic rules eliminate emotional decision-making.",
          correct: false,
          explanation:
            "False. CTAs do not consistently outperform equities — they can underperform significantly for years at a time, especially in low-volatility, range-bound markets with frequent trend reversals (as in 2009–2014 and 2017–2019). The value of CTAs is not consistent outperformance but rather their tendency to generate positive returns during prolonged bear markets in equities and bonds (crisis alpha), combined with low long-run correlation to traditional assets. They are portfolio diversifiers, not equity substitutes.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 4: Momentum Crashes ──────────────────────────────────────────────
    {
      id: "momentum-trend-4",
      title: "Momentum Crashes & Reversal Risk",
      description:
        "When momentum fails dramatically, crowding dynamics, maximum drawdown management, and defensive stops",
      icon: "AlertTriangle",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Momentum Crash Mechanics",
          content:
            "**Momentum crashes** are sudden, sharp reversals where the momentum premium collapses violently — recent winners plunge and recent losers soar. They are the primary source of left-tail risk in momentum strategies.\n\n**The two most severe momentum crashes in modern history:**\n\n**March–May 2009 (Post-Crisis Reversal):**\n- The cross-sectional equity momentum factor lost approximately **40–65%** in just 3–4 months\n- Context: Momentum had been short financials, homebuilders, and cyclicals (all 2008 losers) and long defensives and consumer staples (2008 winners)\n- Trigger: massive coordinated policy stimulus (TARP, Fed QE, bank recapitalization) caused the most hated stocks (the shorts) to stage violent recoveries\n- A short-squeeze compounded the pain — heavy shorts by momentum quants were squeezed as prices soared\n\n**August 2007 (\"Quant Quake\"):**\n- Multiple large quantitative hedge funds liquidated momentum and value factor positions simultaneously\n- The rapid deleveraging caused factors that had worked for years to reverse in hours\n- A single week wiped out years of factor returns; funds estimated $5–10 billion of factor losses\n\n**Why crashes happen:**\n1. **Crowding**: too many quant funds running similar momentum signals in the same stocks\n2. **Mean reversion after extremes**: momentum portfolios become one-sided — extreme overvaluation of winners, extreme undervaluation of losers — setting up violent snaps\n3. **Bear market rallies**: sharp, short-lived rallies within bear markets reverse the short-momentum leg brutally\n4. **Liquidity-driven liquidation**: margin calls or redemptions force simultaneous exits, amplifying reversals\n\n**Statistical signature of crash risk:**\n- Momentum returns exhibit strong **negative skewness** and **excess kurtosis**\n- The worst months for momentum are often preceded by high momentum volatility and extreme factor valuations (spread between winner and loser P/E)",
          highlight: [
            "momentum crash",
            "2009 reversal",
            "Quant Quake 2007",
            "crowding",
            "short squeeze",
            "negative skewness",
          ],
        },
        {
          type: "teach",
          title: "Drawdown Management & Defensive Stops",
          content:
            "Managing drawdown in momentum strategies requires a distinct set of tools compared to long-only equity investing, because momentum crashes are fast and severe.\n\n**Strategy-level stop mechanisms:**\n\n**Volatility scaling:**\nScale position size inversely with realized volatility. When momentum returns become more volatile (a leading indicator of crash risk), cut exposure:\n- Target volatility: set a portfolio volatility target (e.g. 10% annualized)\n- When realized 20-day volatility spikes above target, reduce positions proportionally\n- When volatility is low and trends are clean, scale up\n- Evidence: AQR and others have shown volatility scaling reduces momentum crash severity by 30–50% with only modest reduction in long-run returns\n\n**Momentum quality filter:**\nAvoid momentum stocks that are also highly volatile (\"junk momentum\"):\n- Fama and French found that high-momentum stocks with high idiosyncratic volatility crash more severely\n- Filtering to \"quality momentum\" (high momentum + low vol + high profitability) reduces left-tail crashes\n\n**Regime-based exposure:**\nReduce or exit momentum exposure when the macro environment signals high reversal risk:\n- Post-large-drawdown markets: if the S&P 500 has fallen >20%, reduce short-momentum (the losers) because policy stimulus often follows crashes\n- High bear market rally probability: VIX spikes above 40 historically precede violent reversals favorable to losers\n\n**Individual position stops:**\n- Trailing stops: exit positions that reverse more than 2×ATR from their peak (used by CTAs and long-only momentum traders alike)\n- Time stops: exit if a position has not made a new high in 60 days (the trend has stalled)\n\n**Portfolio-level drawdown limit:**\nMany systematic funds implement a hard cap: if the momentum book is down more than 15–20% from peak, cut the entire book in half and rebuild slowly. This prevents permanent capital impairment.",
          highlight: [
            "volatility scaling",
            "quality momentum",
            "drawdown limit",
            "regime filter",
            "trailing stop",
            "VIX spike",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "What is the primary mechanism behind the severe momentum crash of March–May 2009, when momentum strategies lost 40–65%?",
          options: [
            "Government policy interventions (bank bailouts, QE) caused the most-shorted momentum stocks (financial losers) to stage violent recoveries, squeezing short positions",
            "Momentum funds were forced to sell winning positions to fund redemptions, pushing winners down",
            "A regulatory change banned short selling in momentum strategies, forcing immediate position closure",
            "Momentum crashes in 2009 were caused by rising interest rates reducing the present value of growth stocks",
          ],
          correctIndex: 0,
          explanation:
            "In the 2008 crisis, momentum strategies were positioned short financials, homebuilders, and cyclicals (the prior year's worst performers) and long defensives (the prior year's best). When the U.S. government launched massive bailout programs — TARP, bank recapitalization, and Federal Reserve QE — the stocks hardest hit in 2008 staged violent recoveries. Momentum was short exactly these stocks. The short squeeze compounded the losses: as prices rose sharply, short sellers were forced to buy back shares at higher prices, driving prices even higher in a feedback loop.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Volatility scaling — reducing position size when momentum portfolio volatility rises — can significantly reduce the severity of momentum crashes with only modest reduction in long-run expected returns.",
          correct: true,
          explanation:
            "True. Research by AQR and others demonstrates that volatility-scaled momentum (targeting a constant portfolio volatility level) dramatically reduces left-tail crash risk. The intuition is that momentum crashes are preceded by elevated factor volatility — as the momentum portfolio becomes more volatile, the signal is weakening and reversal risk is rising. Cutting exposure at that point exits much of the downside. The cost is that on rare occasions, volatility spikes before a further momentum surge (a false signal), reducing some upside. But in aggregate, the crash reduction significantly exceeds the return loss.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Dual Momentum ─────────────────────────────────────────────────
    {
      id: "momentum-trend-5",
      title: "Dual Momentum Strategy",
      description:
        "Gary Antonacci's absolute and relative momentum framework, global equities application, and defensive asset switching",
      icon: "Layers",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Antonacci's Dual Momentum Framework",
          content:
            "**Dual Momentum**, developed by Gary Antonacci and detailed in his 2014 book of the same name, combines two distinct momentum signals into a single, elegant allocation strategy requiring only monthly rebalancing and three asset classes.\n\n**The two components:**\n\n**1. Relative Momentum (Cross-Sectional):**\nCompare the 12-month return of U.S. equities (S&P 500) vs international equities (MSCI ACWI ex-US).\n- Whichever had the higher 12-month total return is the \"winner\" and receives 100% allocation\n- This determines whether you hold U.S. or international stocks\n\n**2. Absolute Momentum (Time-Series):**\nCompare the 12-month return of the winning equity index to U.S. Treasury bills (risk-free rate).\n- If the equity winner's 12-month return exceeds T-bills → stay in equities\n- If the equity winner's 12-month return is BELOW T-bills → exit equities entirely and move to **aggregate bonds** (a defensive safe-haven)\n\n**The logic:**\n- Relative momentum captures cross-sectional equity outperformance (U.S. vs international cycles)\n- Absolute momentum acts as a **bear market filter**: when all equities are in prolonged downtrends, the comparison to T-bills switches you out of equities entirely, avoiding major bear markets\n\n**Historical results (backtested 1974–2014, Antonacci):**\n- Dual Momentum CAGR: ~17% vs S&P 500 ~11%\n- Max drawdown: ~17% vs S&P 500 ~51%\n- Sharpe ratio: ~0.87 vs ~0.40 for S&P 500\n\n**Simplicity is its strength:**\nThe entire strategy fits on one page. No complex models, no derivative instruments. Monthly check of three ETFs (U.S. equity, international equity, aggregate bonds) and one calculation.",
          highlight: [
            "dual momentum",
            "Antonacci",
            "relative momentum",
            "absolute momentum",
            "bear market filter",
            "T-bills comparison",
          ],
        },
        {
          type: "teach",
          title: "Global Equities Application & Extensions",
          content:
            "Dual Momentum's original formulation uses only three assets, but the framework extends naturally to global multi-asset portfolios.\n\n**Original GEM (Global Equities Momentum) universe:**\n- U.S. equities: VFINX / SPY\n- International developed equities: VGTSX / VEU\n- Aggregate bonds (safe haven): AGG / BND\n- Rebalance: monthly, on the last day of the month\n\n**Extended universes (Antonacci's Accelerating Dual Momentum):**\nAdd more asset classes to the relative momentum selection:\n- Add REIT index, small-cap value, emerging markets\n- Select top 1 or 2 by 12-month relative return\n- Still gate with absolute momentum (vs T-bills)\n\n**Multi-Asset Dual Momentum:**\nSome practitioners apply the dual framework across asset classes:\n- Equity pool: U.S. / international / EM\n- Bond pool: short-term / intermediate / long-term Treasuries\n- Real assets: gold, commodities, REITs\n- Each pool selects its best-momentum member; absolute momentum decides whether to hold each pool\n\n**Key performance characteristics:**\n- Dual Momentum underperforms in strong bull markets (you are in 100% equities but may occasionally switch to bonds during false signals)\n- Dual Momentum dramatically outperforms in bear markets (it exits equities in time, as in 2000–2002 and 2008–2009)\n- The primary driver of long-run outperformance is **avoiding the worst bear market drawdowns**, not superior bull market returns\n\n**Behavioral advantage:**\nBecause the strategy is fully rules-based and only requires one monthly decision, it eliminates the emotional paralysis that often causes discretionary investors to hold equities far into bear markets or panic-sell at the bottom.",
          highlight: [
            "GEM",
            "global equities momentum",
            "monthly rebalancing",
            "bear market avoidance",
            "rules-based",
            "accelerating dual momentum",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In Antonacci's Dual Momentum (GEM) strategy, under what condition does the strategy switch out of equities and into aggregate bonds?",
          options: [
            "When the best-performing equity index (U.S. or international) has a 12-month return below U.S. Treasury bill returns",
            "When the S&P 500 P/E ratio exceeds 20× earnings",
            "When the VIX rises above 30 for three consecutive trading days",
            "When relative strength between U.S. and international equities changes direction",
          ],
          correctIndex: 0,
          explanation:
            "The absolute momentum filter in Dual Momentum compares the 12-month return of the winning equity index (whichever of U.S. or international won the relative momentum race) against U.S. Treasury bill returns. If the equity winner's 12-month return is below T-bills, that is a signal that equities are in a sustained bear market or prolonged underperformance. The strategy then exits equities entirely and moves to aggregate bonds as a safe haven. This filter correctly moved the strategy to bonds before major losses in 2001 and late 2008.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The primary source of Dual Momentum's long-run outperformance versus a buy-and-hold equity strategy comes from superior performance during bull markets, not from avoiding bear markets.",
          correct: false,
          explanation:
            "False. The opposite is true. During bull markets, Dual Momentum can actually lag a buy-and-hold equity portfolio — if it has a false signal and briefly moves to bonds during a brief market dip, it misses some of the recovery. The dominant driver of long-run outperformance is **bear market avoidance**: by switching to bonds when equities trend down for 12 months versus T-bills, the strategy avoids much of the catastrophic drawdowns (like the 50% losses in 2000–2002 and 2008–2009). Compounding a loss avoidance of that magnitude creates dramatic long-run advantage even if bull market participation is slightly reduced.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Implementation ────────────────────────────────────────────────
    {
      id: "momentum-trend-6",
      title: "Implementation Mechanics",
      description:
        "Rebalancing frequency, position sizing, transaction costs, tax drag, and practical considerations for momentum portfolios",
      icon: "Settings",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Rebalancing Frequency & Turnover",
          content:
            "**Rebalancing frequency** is one of the most impactful practical decisions in momentum strategies, because momentum is inherently a high-turnover strategy.\n\n**Typical turnover by strategy type:**\n- Cross-sectional equity momentum (monthly rebalance): 80–120% annual turnover\n- Dual Momentum (monthly): 20–40% annual turnover (simple 3-asset universe)\n- CTA managed futures (multi-system, multi-speed): 100–300% annual turnover\n- Short-term momentum (weekly): 300–600% annual turnover\n\n**Rebalancing frequency trade-offs:**\n\n**Monthly rebalancing** (most common for factor investing):\n- Captures the 1–12 month return continuation\n- Turnover is high but manageable\n- Misses intramonth momentum\n\n**Weekly rebalancing:**\n- Captures faster signals; can reduce lag at trend turns\n- Dramatically increases transaction costs\n- In net-of-cost analysis, usually inferior to monthly for retail implementation\n\n**Quarterly rebalancing:**\n- Reduces turnover and costs\n- Slower signal; captures less of the momentum alpha\n- Suitable for long-only factor ETFs with tax-sensitive investors\n\n**Optimal rebalancing research:**\nDanielsson, Mosowitz, and others have shown that optimal gross-of-cost momentum rebalancing is close to weekly, but optimal net-of-cost rebalancing shifts toward monthly for institutional investors and quarterly for high-cost retail investors.\n\n**Partial rebalancing (buffer bands):**\nOnly rebalance a position if it has moved more than X% outside its target weight. This reduces unnecessary small trades that generate costs without improving the signal significantly. Common buffer thresholds: 5–15% relative deviation from target.",
          highlight: [
            "turnover",
            "monthly rebalancing",
            "transaction costs",
            "buffer bands",
            "net-of-cost",
          ],
        },
        {
          type: "teach",
          title: "Position Sizing, Costs & Tax Drag",
          content:
            "Momentum strategies can generate impressive gross returns — but implementation friction from costs and taxes erodes a significant fraction of that alpha.\n\n**Position sizing in momentum portfolios:**\n\n**Equal weight:** Divide capital equally among all momentum holdings. Simple, no forecasting of relative return magnitudes. Standard for factor momentum studies.\n\n**Volatility-parity (risk parity):** Size each position inversely proportional to its recent volatility so that each contributes equal dollar volatility to the portfolio. More sophisticated; reduces crash risk (as in Lesson 4); requires frequent resizing.\n\n**Momentum-strength weighting:** Give more weight to stocks with higher momentum z-scores. Amplifies factor exposure but concentrates risk.\n\n**Transaction cost reality:**\n- Bid-ask spread: 0.05–0.5% per trade (lower for mega-cap, higher for small-cap)\n- Market impact: slippage for large orders; momentum strategies crowd into the same names, worsening impact\n- Commission: near-zero at retail brokers; 1–5 bps institutional\n- Annual cost estimate for monthly-rebalanced equity momentum: 1–3% per year in the U.S., 2–5% in international markets\n\n**Tax drag (U.S. taxable accounts):**\n- Momentum generates almost entirely short-term capital gains (positions held < 1 year)\n- Short-term capital gains rate: 37% (top bracket) vs 20% for long-term\n- After-tax alpha erosion: in a taxable account, a strategy generating 8% gross momentum alpha may net only 4–5% after tax vs 6–7% for a buy-and-hold (mostly long-term gains) strategy\n- Tax solution: run momentum in tax-deferred accounts (IRA, 401k) where gains are not taxed annually\n\n**Practical net-alpha estimate (retail investor, monthly U.S. equity momentum):**\n- Gross momentum premium: ~8%/year (historical)\n- Minus transaction costs: −2%/year\n- Minus tax drag (taxable account): −2 to −3%/year\n- Net alpha over market: ~3–4%/year — meaningful but smaller than academic papers suggest",
          highlight: [
            "equal weight",
            "volatility parity",
            "transaction costs",
            "tax drag",
            "short-term capital gains",
            "tax-deferred",
          ],
        },
        {
          type: "teach",
          title: "Practical Implementation Checklist",
          content:
            "Putting it all together: a practitioner's checklist for building a robust momentum strategy.\n\n**Universe selection:**\n- Focus on liquid, large-to-mid cap stocks (lower transaction costs, better capacity)\n- Exclude IPOs younger than 12 months (no full formation period)\n- Exclude very low-price stocks (penny stocks amplify volatility and trading costs)\n- Use float-adjusted market cap weighting within the universe\n\n**Signal construction:**\n- Formation period: 12-1 months (12-month return, skip most recent month)\n- Percentile ranking within the universe\n- Consider adding earnings revision momentum or analyst revision momentum as a complementary signal\n\n**Risk management:**\n- Volatility-scale positions: target 10–15% annualized portfolio vol\n- Monitor factor crowding: high stock-level short interest, low sector dispersion\n- Reduce equity momentum exposure after bear markets of 20%+ (crash risk elevated)\n\n**Cost minimization:**\n- Quarterly rebalancing for taxable accounts\n- Monthly rebalancing for tax-deferred accounts\n- Use limit orders, not market orders, for momentum trades\n- Batch trades at month-end when many factor investors rebalance simultaneously (reduces market impact)\n\n**Implementation vehicles:**\n- DIY individual stocks: best control, high effort, limited diversification under ~$500k\n- Factor ETFs: MTUM (iShares MSCI Momentum ETF), QMOM (Alpha Architect U.S. Quantitative Momentum) — low cost, diversified, but no tax optimization\n- Managed futures funds / CTAs: exposure to time-series momentum across global assets; minimum investment often $1M+\n\n**Realistic expectations:**\nMomentum is real, persistent, and diversifying — but no single-factor strategy dominates in all environments. Combining momentum with value, quality, and defensive factors in a diversified multi-factor portfolio is the consensus best practice for long-run risk-adjusted performance.",
          highlight: [
            "universe selection",
            "signal construction",
            "volatility scaling",
            "MTUM",
            "factor ETFs",
            "multi-factor portfolio",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Why is implementing a monthly-rebalanced cross-sectional momentum strategy in a taxable brokerage account significantly less attractive than in a tax-deferred account like an IRA?",
          options: [
            "Momentum strategies generate predominantly short-term capital gains (positions held under 1 year), taxed at up to 37% vs the 20% long-term rate, dramatically reducing net returns",
            "The IRS requires taxable accounts to maintain 30% cash reserves for momentum strategies, limiting investable capital",
            "Momentum strategies are legally restricted to retirement accounts under SEC regulations",
            "Tax-deferred accounts receive an additional 2% government subsidy on momentum returns annually",
          ],
          correctIndex: 0,
          explanation:
            "Cross-sectional momentum requires monthly rebalancing, meaning positions are typically held for 1–3 months — well under the 12-month threshold for long-term capital gains treatment. All profits from those trades are taxed as short-term capital gains at ordinary income tax rates (up to 37% at the federal level), versus the 20% maximum long-term rate for positions held more than one year. This tax friction can reduce net momentum alpha by 2–3% per year, transforming a compelling gross strategy into a mediocre net strategy in taxable accounts. Tax-deferred accounts (IRA, 401k) defer taxes until withdrawal, eliminating this drag.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor wants to implement a diversified momentum strategy. They have $200,000 in a taxable brokerage account and $80,000 in a Traditional IRA. They are considering: (A) running monthly cross-sectional equity momentum in the taxable account, or (B) running Dual Momentum (monthly, 3-asset ETF rotation) in the IRA and holding a low-cost diversified equity ETF in the taxable account.",
          question:
            "Which approach is most tax-efficient and why?",
          options: [
            "Approach B — high-turnover momentum with short-term gains should be sheltered in the IRA; the taxable account holds a low-turnover buy-and-hold ETF generating mostly long-term gains",
            "Approach A — taxable accounts have higher capital, so momentum alpha in dollar terms will be larger even after tax",
            "Both approaches are equally tax-efficient because tax treatment of capital gains is the same across all account types",
            "Approach A — IRA contribution limits mean the taxable account must hold the active strategy to maximize momentum exposure",
          ],
          correctIndex: 0,
          explanation:
            "Approach B is superior tax management. The core principle of tax-efficient portfolio placement ('asset location') is to hold high-turnover, ordinary-income-generating strategies in tax-deferred accounts where gains compound without annual taxation. Dual Momentum in the IRA rebalances monthly but pays no tax until withdrawal. The taxable account holds a buy-and-hold diversified ETF, which generates mostly qualified dividends and long-term capital gains taxed at preferential rates. Running monthly momentum in the taxable account in Approach A would generate substantial annual short-term gains at ordinary income rates, significantly reducing net alpha.",
          difficulty: 3,
        },
      ],
    },
  ],
};
