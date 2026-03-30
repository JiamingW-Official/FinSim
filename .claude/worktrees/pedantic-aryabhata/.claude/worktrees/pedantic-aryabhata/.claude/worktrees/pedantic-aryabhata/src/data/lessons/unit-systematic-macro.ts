import { Unit } from "./types";

export const UNIT_SYSTEMATIC_MACRO: Unit = {
  id: "systematic-macro",
  title: "Systematic Macro Investing",
  description:
    "Build rules-based macro strategies using carry, trend, and value signals across global markets",
  icon: "Globe",
  color: "#0EA5E9",
  lessons: [
    {
      id: "systematic-macro-carry",
      title: "Carry Strategies",
      description:
        "Understand carry trade mechanics, crash risk, and how to size positions across FX, bonds, and equities",
      icon: "TrendingUp",
      xpReward: 75,
      difficulty: "advanced",
      duration: 10,
      steps: [
        {
          type: "teach",
          title: "What Is Carry?",
          content:
            "Carry is the return you earn simply by holding an asset, before any price appreciation. Each asset class has its own carry measure:\n\n• **FX carry**: forward rate minus spot rate (equivalently, the interest-rate differential between two currencies)\n• **Bond carry**: yield of the bond minus your funding rate (often short-term LIBOR or overnight rate)\n• **Equity carry**: dividend yield minus equity financing cost\n\nA positive carry means you are paid to hold the position. A negative carry means you pay a cost to stay in the trade.",
          highlight: ["carry", "forward rate", "yield", "dividend yield"],
        },
        {
          type: "teach",
          title: "FX Carry Trade Mechanics",
          content:
            "The classic FX carry trade involves:\n\n1. **Borrow** in a low-interest-rate currency (e.g., Japanese Yen at 0.1%)\n2. **Convert** the proceeds into a high-interest-rate currency (e.g., Brazilian Real at 12%)\n3. **Invest** in short-term government bills of the high-yield country\n4. **Earn** the interest-rate differential (~11.9%) minus hedging costs\n\nThe Uncovered Interest Rate Parity (UIP) theory predicts this trade should earn zero on average because the high-yield currency should depreciate. In practice, UIP systematically fails in the short run — high-yield currencies tend to appreciate or stay flat — generating persistent carry profits.\n\nHistorical carry Sharpe ratios: **FX carry 0.5–0.8**, **Bond carry 0.6–0.9** (somewhat better due to lower volatility).",
          highlight: [
            "borrow",
            "interest-rate differential",
            "UIP",
            "Sharpe ratio",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Which of the following best describes the carry in a bond carry trade?",
          options: [
            "The capital gain from a bond price increase",
            "The bond's yield minus the investor's funding rate",
            "The spread between 10-year and 2-year yields",
            "The coupon rate divided by the bond's par value",
          ],
          correctIndex: 1,
          explanation:
            "Bond carry is the net income from holding the bond: yield received minus the cost of funding the position (e.g., overnight borrowing rate). Capital gains are separate from carry.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Crash Risk and Carry Unwinds",
          content:
            "Carry trades are often described as 'picking up nickels in front of a steamroller.' They deliver steady small gains but occasionally suffer sharp, sudden losses.\n\n**Why crashes happen:**\n- Carry trades are crowded — many funds hold similar positions\n- A risk-off shock (geopolitical event, financial crisis, surprise rate hike) triggers simultaneous unwinding\n- All participants rush to close the same trade, causing the high-yield currency to collapse rapidly\n\n**Characteristics of carry crashes:**\n- Occur in 2–5 trading days\n- Average drawdown: 15–25% in extreme episodes\n- Negative skewness: returns distribution has a fat left tail\n- 2008 crisis: AUD/JPY carry dropped ~30% in 3 weeks\n\n**Crash-adjusted carry** uses volatility targeting — scale position size inversely with realized volatility — to reduce exposure before crashes deepen.",
          highlight: [
            "crowded",
            "risk-off",
            "unwind",
            "negative skewness",
            "volatility targeting",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Carry trades tend to have positively skewed return distributions, meaning large gains are more frequent than large losses.",
          correct: false,
          explanation:
            "Carry trades have negatively skewed return distributions. They generate frequent small gains but are prone to rare, severe drawdowns during risk-off events when the trade unwinds rapidly. This negative skew is the primary risk.",
          difficulty: 2,
        },
      ],
    },
    {
      id: "systematic-macro-trend",
      title: "Trend Signals",
      description:
        "Build time-series momentum signals, vol-scale positions, and understand crisis alpha in managed futures",
      icon: "Activity",
      xpReward: 80,
      difficulty: "advanced",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "Time-Series Momentum (TSMOM)",
          content:
            "Time-series momentum (TSMOM) looks at each asset's own past return — not relative to other assets — to predict its near-term direction.\n\n**The 12-1 signal** is the most common: take the cumulative return from 12 months ago to 1 month ago (skipping the most recent month to avoid short-term reversal). If positive, go long; if negative, go short.\n\n**Why does it work?**\n- Under-reaction: investors are slow to incorporate news, so trends persist\n- Momentum in fundamentals: earnings, economic growth, and policy changes trend over quarters\n- Institutional herding: fund flows amplify initial moves\n\nTSMOM has positive historical Sharpe ratios of **0.4–0.7** across commodities, equities, bonds, and FX, and — crucially — it tends to perform best when other strategies suffer.",
          highlight: [
            "12-1 signal",
            "under-reaction",
            "herding",
            "Sharpe ratio",
          ],
        },
        {
          type: "teach",
          title: "Signal Construction and Vol Scaling",
          content:
            "Raw momentum signals must be transformed into tradeable positions:\n\n**Step 1 — Direction**: sign of the 12-1 return (+1 long, −1 short)\n\n**Step 2 — Vol scaling**: divide target risk by realized volatility\n```\nPosition size = (Target Volatility / Asset Volatility) × Signal\n```\nIf a target is 10% annual vol and the asset has 20% vol, position size = 0.5 contracts.\n\n**Step 3 — Multi-period blending**: combine signals of different lookback windows\n- 1-month: fast signal, more noise, higher turnover\n- 3-month: balanced\n- 12-month: slow signal, lower noise, lower turnover\n- Blend weights: 20% / 40% / 40% (or equal-weight)\n\nBlending reduces signal-to-noise ratio and smooths out whipsaw periods where one timeframe is wrong but others are correct.",
          highlight: [
            "vol scaling",
            "target volatility",
            "multi-period blending",
            "signal-to-noise",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In the 12-1 momentum signal, why is the most recent month excluded from the lookback window?",
          options: [
            "To reduce transaction costs from frequent rebalancing",
            "To avoid the short-term reversal effect that causes recent gainers to briefly underperform",
            "Because monthly data is only released with a one-month lag",
            "To comply with SEC regulations on lookback periods",
          ],
          correctIndex: 1,
          explanation:
            "Empirical research shows that the most recent month's return is subject to a short-term reversal effect — recent outperformers tend to mean-revert briefly. Excluding the last month isolates the intermediate-term momentum that persists for 3–12 months.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Trend vs. Mean Reversion and Crisis Alpha",
          content:
            "Not all markets trend equally:\n\n**Markets that trend well:**\n- Commodities (supply/demand shocks take months to resolve)\n- Fixed income (policy cycles persist for 1–3 years)\n- FX (growth and inflation differentials trend)\n\n**Markets with more mean reversion:**\n- Individual equities (earnings surprises revert, valuation anchors prices)\n- Short-term interest rates (policy is anchored near neutral)\n\n**Crisis alpha** is managed futures' most powerful trait — trend signals can go short when other assets fall:\n- 2001 dot-com bust: Managed Futures +**16%** while S&P 500 −13%\n- 2008 financial crisis: Managed Futures +**18%** while global equities −40%\n- 2022 rate shock: Managed Futures +**25%** while 60/40 portfolio −16%\n\nThis negative correlation during crises makes trend strategies excellent portfolio diversifiers.",
          highlight: [
            "crisis alpha",
            "managed futures",
            "negative correlation",
            "diversifier",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Managed futures strategies historically delivered positive returns during the 2008 financial crisis, demonstrating their crisis alpha properties.",
          correct: true,
          explanation:
            "Managed futures (systematic trend-following) returned approximately +18% in 2008. By going short equities and long bonds/safe-haven assets as the crisis developed, these strategies profited from the exact trends that devastated long-only portfolios.",
          difficulty: 1,
        },
      ],
    },
    {
      id: "systematic-macro-value",
      title: "Value in Macro",
      description:
        "Apply purchasing power parity, real yields, CAPE, and commodity fair value as cross-asset value signals",
      icon: "BarChart2",
      xpReward: 75,
      difficulty: "advanced",
      duration: 10,
      steps: [
        {
          type: "teach",
          title: "Currency Value: PPP",
          content:
            "Purchasing Power Parity (PPP) states that exchange rates should equalize the price of an identical basket of goods across countries.\n\n**Big Mac Index (The Economist)**: compares the local price of a McDonald's Big Mac, converted to USD. A country where a Big Mac costs $2 USD-equivalent when the US price is $5 is said to have a **60% undervalued** currency.\n\n**OECD PPP**: uses comprehensive consumption baskets to derive fair value exchange rates. More rigorous than Big Mac, updated annually.\n\n**Trading implications:**\n- PPP is a poor short-term predictor (currencies can deviate for years)\n- Excellent long-term anchor: >50% deviations from PPP tend to revert over 3–7 years\n- Used as a **mean-reversion signal** combined with carry and trend in quantitative macro models\n\nPPP signals improve Sharpe by ~0.1–0.2 when added to pure carry/trend models.",
          highlight: ["PPP", "Big Mac Index", "OECD", "undervalued", "revert"],
        },
        {
          type: "teach",
          title: "Real Yields and Bond Value",
          content:
            "For government bonds, the best value signal is the **real yield**: nominal yield minus expected inflation.\n\n```\nReal yield = Nominal yield − Breakeven inflation\n```\n\nWhere breakeven inflation = TIPS yield spread vs nominal Treasuries.\n\n**Interpretation:**\n- High real yield → bonds are cheap (expected to deliver good real returns)\n- Negative real yield → bonds are expensive (paying to hold, capital loss likely in real terms)\n\n**Cross-country bond value**: rank sovereign bonds by real yield across countries. Long the highest real-yield countries, short the lowest.\n\n**Historical evidence**: Countries with high real yields outperform those with negative real yields by ~2–4% annually on a currency-hedged basis over rolling 3-year windows.\n\n**Equity value signal**: CAPE (Cyclically Adjusted P/E) or earnings yield (1/CAPE). High earnings yield = cheap equities. Works best over 5–10 year horizons.",
          highlight: [
            "real yield",
            "TIPS",
            "breakeven inflation",
            "CAPE",
            "earnings yield",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investor finds that the 10-year nominal Treasury yield is 4.5% and the TIPS yield is 2.0%. What is the breakeven inflation rate, and what does it imply?",
          options: [
            "6.5% — the market expects deflation",
            "2.5% — the market expects inflation to average 2.5% annually over 10 years",
            "2.5% — the bond is considered expensive relative to equities",
            "2.0% — the real yield equals the nominal yield",
          ],
          correctIndex: 1,
          explanation:
            "Breakeven inflation = nominal yield (4.5%) minus TIPS real yield (2.0%) = 2.5%. This means the bond market is pricing in average CPI inflation of 2.5% per year for the next decade. It is neither a statement about cheapness vs. equities nor about deflation.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Commodity Fair Value and Value Timing",
          content:
            "Commodity fair value is harder to measure than for financial assets — commodities have no earnings or dividends. Two common approaches:\n\n**Cost of production**: estimates the marginal cost at which supply equals demand (e.g., shale oil break-even ~$55–65/barrel). Price well below this level is unsustainable; above it invites new supply.\n\n**Inventory levels**: the commodity term structure (contango vs. backwardation) reflects current supply/demand balance. High inventory → contango (negative carry), low inventory → backwardation (positive carry + value signal).\n\n**Value timing challenge**: value trades can underperform for years before converging. Academic evidence shows:\n- Average time to convergence: 3–5 years\n- Maximum drawdown waiting for value convergence: 30–60%\n- Value works best when combined with trend signals (enter value trade only after trend confirms)\n\nThis 'value + trend' combination is used by funds like AQR and Man AHL to avoid the 'value trap' problem.",
          highlight: [
            "cost of production",
            "inventory",
            "contango",
            "backwardation",
            "value trap",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A systematic macro fund uses CAPE to rank equities across 20 countries. The US has a CAPE of 34 (earnings yield 2.9%) while Brazil has a CAPE of 8 (earnings yield 12.5%). The fund considers going long Brazil / short US equities on a currency-hedged basis.",
          question:
            "Which additional signal should the fund check before entering the trade to avoid a value trap?",
          options: [
            "The current account deficit of both countries",
            "The trend signal to confirm Brazil equities are in an uptrend relative to US equities",
            "The CEO turnover rate at major Brazilian corporations",
            "Whether the Big Mac Index confirms USD overvaluation",
          ],
          correctIndex: 1,
          explanation:
            "Value trades can persist in loss for years (Brazil's cheap CAPE could get even cheaper). Combining a value signal with a trend/momentum confirmation reduces the risk of entering too early. The fund should wait for Brazil to show positive relative momentum before going long.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "systematic-macro-all-weather",
      title: "All Weather & Risk Parity",
      description:
        "Understand Bridgewater's four-quadrant framework, risk parity mechanics, and performance across regimes",
      icon: "PieChart",
      xpReward: 85,
      difficulty: "advanced",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "The Four Quadrants of Economic Regimes",
          content:
            "Ray Dalio's All Weather framework argues that every asset class thrives or suffers depending on two macro variables:\n\n1. **Economic growth**: rising or falling relative to expectations\n2. **Inflation**: rising or falling relative to expectations\n\nThis creates four quadrants:\n\n| Regime | Growth | Inflation | Best Assets |\n|---|---|---|---|\n| Goldilocks | Rising | Falling | Stocks, Corporate Bonds |\n| Stagflation | Falling | Rising | Commodities, TIPS, Gold |\n| Reflation | Rising | Rising | Stocks, Commodities |\n| Deflation | Falling | Falling | Nominal Bonds, Gold |\n\nNo one can reliably predict which regime comes next, so **All Weather diversifies equally across all four** — always holding assets suited to each possible future.",
          highlight: [
            "four quadrants",
            "growth",
            "inflation",
            "Goldilocks",
            "stagflation",
          ],
        },
        {
          type: "teach",
          title: "Risk Parity Mechanics",
          content:
            "Traditional 60/40 portfolios are dominated by equity risk — stocks are ~3× more volatile than bonds, so equities drive ~90% of portfolio volatility despite being 60% of capital.\n\n**Risk parity** allocates capital so that each asset contributes equally to portfolio risk:\n\n```\nRisk weight_i = (1 / σ_i) / Σ(1 / σ_j)\n```\n\nExample with 3 assets (σ: stocks 16%, bonds 5%, commodities 20%):\n- Bonds get the largest capital allocation (~50%)\n- Commodities get the smallest (~18%)\n- Each contributes ~33% of total portfolio risk\n\n**Leverage is often applied** to bring the risk-parity portfolio up to a target volatility (e.g., 10%), since an unlevered risk-parity portfolio is heavily tilted to low-volatility bonds and may have low absolute returns.\n\nBridgewater's All Weather has targeted ~10% annual volatility since inception.",
          highlight: [
            "risk parity",
            "equal risk contribution",
            "leverage",
            "target volatility",
            "60/40",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In a simple two-asset risk parity portfolio with stocks (σ = 20%) and bonds (σ = 5%), what approximate percentage of capital should be allocated to bonds?",
          options: [
            "20% bonds / 80% stocks",
            "40% bonds / 60% stocks",
            "80% bonds / 20% stocks",
            "50% bonds / 50% stocks",
          ],
          correctIndex: 2,
          explanation:
            "Risk parity allocates inversely proportional to volatility. Bond weight = (1/5) / (1/5 + 1/20) = 0.2 / 0.25 = 80%. Stock weight = (1/20) / 0.25 = 20%. This equalizes risk contribution: bonds 80% × 5% vol = 4%, stocks 20% × 20% vol = 4%.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "All Weather vs 60/40 Across Regimes",
          content:
            "How has All Weather performed relative to a traditional 60/40 portfolio across different economic regimes?\n\n**Goldilocks (1990s, 2010s):** 60/40 wins — equity bull markets reward equity-heavy allocations. All Weather underperforms by 2–4% annually.\n\n**Inflationary (2022):** All Weather loses less — commodities and TIPS cushion losses. 60/40 lost ~16%, risk parity lost ~12–14%.\n\n**Deflationary crisis (2008):** All Weather significantly outperforms — long bonds surged as equities crashed. 60/40 lost ~25%, risk parity portfolios lost ~15–18%.\n\n**Key insight**: All Weather sacrifices upside in bull markets to reduce drawdowns in adverse regimes. Maximum drawdown has historically been ~20% vs ~40% for 60/40.\n\n**Criticism**: leverage amplifies losses when bonds and stocks fall simultaneously (as in 2022). Rising rate environments can punish the heavy bond allocation.",
          highlight: [
            "Goldilocks",
            "maximum drawdown",
            "leverage",
            "2022",
            "2008",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Bridgewater's All Weather portfolio holds equal dollar amounts in stocks, bonds, commodities, and gold.",
          correct: false,
          explanation:
            "All Weather allocates based on equal risk contribution, not equal dollar amounts. Because bonds are far less volatile than stocks, bonds receive a much larger capital allocation (often 40–55% of capital) so that each asset class contributes roughly equal volatility to the portfolio. This is risk parity, not equal weighting.",
          difficulty: 2,
        },
      ],
    },
  ],
};
