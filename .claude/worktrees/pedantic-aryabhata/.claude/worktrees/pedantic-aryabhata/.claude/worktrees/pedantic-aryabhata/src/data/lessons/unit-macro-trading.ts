import type { Unit } from "./types";

export const UNIT_MACRO_TRADING: Unit = {
  id: "macro-trading",
  title: "Macro Trading",
  description:
    "Trade the big picture: economic indicators, central banks, currencies, sector rotation, and geopolitics",
  icon: "Globe",
  color: "#6366f1",
  lessons: [
    /* ================================================================
       LESSON 1 — Reading Economic Indicators
       ================================================================ */
    {
      id: "macro-1",
      title: "Reading Economic Indicators",
      description:
        "GDP, CPI, NFP, PMI; leading vs lagging indicators; how to trade economic releases",
      icon: "BarChart2",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Market's Vital Signs",
          content:
            "Macro traders watch economic data releases like a doctor monitors vital signs. These numbers reveal the health of the economy and drive the Fed's decisions — which in turn move every asset class.\n\n**GDP (Gross Domestic Product)**\n- Measures total economic output; released quarterly\n- Above 2% annual growth is considered healthy\n- Two consecutive quarters of negative GDP = technical recession\n\n**CPI (Consumer Price Index)**\n- Measures the change in prices consumers pay for goods and services\n- Fed targets ~2% annual inflation; above target → rate hike pressure\n- Reported monthly; a high print can trigger immediate bond sell-offs\n\n**Non-Farm Payrolls (NFP)**\n- Monthly count of jobs added outside farming\n- Released the first Friday of every month — the single most market-moving data release globally\n- Strong NFP + high CPI = Fed tightening pressure\n\n**PMI (Purchasing Managers' Index)**\n- Survey of purchasing managers about new orders, inventories, and employment\n- Above 50 = expansion; below 50 = contraction\n- **Leading indicator** — it predicts future activity before GDP confirms it",
          highlight: ["GDP", "CPI", "NFP", "PMI", "leading indicator"],
        },
        {
          type: "teach",
          title: "Leading vs Lagging Indicators",
          content:
            "Not all economic data is equal. Understanding which indicators predict the future versus confirm the past is a critical edge.\n\n**Leading Indicators** — change *before* the economy does:\n- PMI (Manufacturing and Services)\n- Building permits and housing starts\n- Conference Board Leading Economic Index (LEI)\n- Yield curve shape (inverted = recession signal)\n- Stock market itself (often leads by 6 months)\n\n**Coincident Indicators** — move *with* the economy:\n- Industrial production\n- Personal income\n- Retail sales\n\n**Lagging Indicators** — confirm what already happened:\n- Unemployment rate (rises after recession starts, falls after recovery)\n- CPI inflation (reflects past price changes)\n- GDP (reported with a significant delay)\n\n**Practical rule**: When leading indicators turn down (PMI falling, yield curve inverting), reduce cyclical exposure *before* lagging indicators like unemployment confirm the downturn. By the time GDP goes negative, markets have often already sold off substantially.",
          highlight: [
            "leading indicator",
            "lagging indicator",
            "yield curve",
            "PMI",
          ],
        },
        {
          type: "teach",
          title: "Trading Economic Releases",
          content:
            "Economic releases cause volatility spikes that macro traders actively plan for.\n\n**Before the release:**\n- Check the consensus forecast (economists' median estimate)\n- Understand what a beat or miss means for rates and markets\n- Options premiums expand as the event approaches — IV crush follows\n\n**The surprise factor is everything:**\n- Actual vs. Estimate = the number that moves markets\n- +200K jobs vs. +150K expected → bullish shock for stocks (briefly) but may raise rate-hike odds\n- -50K jobs vs. +150K expected → severe bearish shock\n\n**'Buy the rumor, sell the news' dynamics:**\n- Markets often pre-position for expected data\n- A good number that meets expectations can trigger selling if it was fully priced in\n- An in-line print with a bad sub-component (e.g., wage growth) can still be bearish\n\n**Practical approach:**\n- Know the calendar (Bloomberg Economic Calendar, Investing.com)\n- Tighten or exit positions before high-impact releases if you cannot tolerate the volatility\n- Wait for the initial spike to fade, then trade in the direction of the sustained move",
          highlight: [
            "consensus forecast",
            "surprise factor",
            "buy the rumor",
            "IV crush",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Non-Farm Payrolls come in at +350K jobs, versus consensus of +180K. CPI is already running at 4.5%. What is the most likely immediate market reaction?",
          options: [
            "Stocks fall and bond yields spike — strong jobs data reinforces Fed rate hike expectations",
            "Stocks rally strongly — the economy is robust and corporate earnings will rise",
            "Gold surges — the data signals imminent recession",
            "The dollar weakens — investors shift capital to emerging markets",
          ],
          correctIndex: 0,
          explanation:
            "A massive NFP beat when inflation is already elevated strengthens the case for continued Fed rate hikes. Higher expected rates increase the discount rate on future earnings (stocks fall) and push bond prices down (yields spike). The USD typically strengthens as higher US rates attract foreign capital. This is one of the most common reflexive reactions: strong jobs data in a high-inflation environment is bearish for risk assets short term.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The PMI index is a lagging indicator because it measures economic conditions that have already occurred.",
          correct: false,
          explanation:
            "PMI is a leading indicator — it measures purchasing managers' forward-looking activity (new orders, production intentions, hiring plans). Because it is surveyed monthly and published quickly, PMI data often signals turning points in the economy weeks or months before GDP data confirms them. Lagging indicators like unemployment or CPI confirm what has already happened.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "CPI comes in at 3.9% year-over-year, well above the 3.1% consensus. The Fed is currently in a 'pause' on rate hikes. The 10-year Treasury yield jumps 15 basis points immediately after the print.",
          question:
            "Which of the following trades best capitalizes on this data surprise?",
          options: [
            "Short long-duration Treasury bonds (TLT) and reduce growth stock exposure",
            "Buy long-duration Treasury bonds — yields have already moved and will reverse",
            "Buy gold — high inflation is always bullish for gold immediately",
            "Buy growth stocks — higher inflation boosts nominal revenues",
          ],
          correctIndex: 0,
          explanation:
            "A CPI beat rekindles rate hike expectations. Bond prices fall as yields rise — shorting long-duration bonds (e.g., TLT, the 20+ year Treasury ETF) is the direct expression. Growth stocks face dual pressure: higher discount rates reduce the present value of future earnings, and a hawkish Fed dampens risk appetite. Gold can benefit from inflation long term but often sells off short term when real yields rise with a hot CPI print.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Central Bank Policy
       ================================================================ */
    {
      id: "macro-2",
      title: "Central Bank Policy",
      description:
        "Fed funds rate, QE/QT, forward guidance; how rate changes affect stocks, bonds, and USD",
      icon: "Landmark",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Fed and Its Two Mandates",
          content:
            "The **Federal Reserve** is the central bank of the United States. Its decisions ripple through every asset class worldwide because USD is the global reserve currency.\n\n**The Fed's dual mandate:**\n1. **Maximum employment** — keep unemployment low\n2. **Price stability** — target ~2% annual inflation\n\nThe primary tool is the **Federal Funds Rate** — the overnight lending rate between banks. This rate is the floor for all borrowing costs: mortgages, corporate loans, credit cards, and government debt.\n\n**FOMC (Federal Open Market Committee)** meets 8 times per year to set policy. Between meetings, **Fed speakers** (governors, regional presidents) constantly signal their views — creating continuous market-moving commentary.\n\n**Other major central banks to watch:**\n- ECB (European Central Bank) — controls EUR rates\n- Bank of Japan (BoJ) — controls JPY rates (held near zero for decades)\n- Bank of England (BoE) — controls GBP rates\n- People's Bank of China (PBoC) — controls CNY policy",
          highlight: [
            "Federal Reserve",
            "Federal Funds Rate",
            "FOMC",
            "dual mandate",
          ],
        },
        {
          type: "teach",
          title: "QE, QT, and Forward Guidance",
          content:
            "When rates hit zero, central banks use unconventional tools to stimulate or tighten the economy.\n\n**Quantitative Easing (QE):**\n- The Fed buys government bonds and mortgage-backed securities\n- Injects money into the financial system\n- Pushes down long-term yields; inflates asset prices\n- 'Don't fight the Fed' — QE historically drives stocks higher\n\n**Quantitative Tightening (QT):**\n- The Fed reduces its balance sheet by letting bonds mature without reinvesting\n- Drains liquidity from the system\n- Puts upward pressure on long-term yields\n- Can cause credit spreads to widen and risk assets to struggle\n\n**Forward Guidance:**\n- Central banks communicate their *intentions* to shape market expectations\n- 'Higher for longer' guidance → markets price in fewer rate cuts\n- 'Data-dependent' language → markets watch every data release closely\n- Jackson Hole symposium (August) and FOMC press conferences are key events\n\n**Key insight**: It is often the *change in expectations* that moves markets most — not the actual rate decision itself.",
          highlight: [
            "quantitative easing",
            "quantitative tightening",
            "forward guidance",
            "balance sheet",
            "Jackson Hole",
          ],
        },
        {
          type: "teach",
          title: "How Rate Changes Affect Asset Classes",
          content:
            "Understanding the rate-to-asset transmission mechanism is essential for macro trading:\n\n**Stocks:**\n- Higher rates = higher discount rate → future earnings worth less → growth stocks hurt most\n- Lower rates = lower discount rate → stocks re-rate higher; speculative assets rally\n- Financials (banks) benefit from higher rates (wider net interest margins) in the short term\n\n**Bonds:**\n- Prices move inversely to yields: rates up → bond prices down\n- Long-duration bonds (20–30 year) have the most price sensitivity\n- Duration risk: a 1% rate rise cuts a 20-year bond's value ~15%\n\n**USD (Dollar):**\n- Higher US rates → capital flows into USD assets → dollar strengthens\n- Stronger USD → headwind for US multinational earnings (overseas profits worth less)\n- Stronger USD → pressure on commodities priced in USD (oil, gold)\n\n**Commodities and Emerging Markets:**\n- Strong USD + high rates → EM currencies weaken, EM debt becomes more expensive to service\n- Commodity prices often fall when USD strengthens (inverse relationship)\n- Gold is a long-run inflation hedge but short-term loses to rising real yields",
          highlight: [
            "discount rate",
            "duration",
            "net interest margin",
            "real yields",
            "emerging markets",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "The Fed unexpectedly announces a 50 basis point rate cut. Which asset is likely to see the largest immediate price increase?",
          options: [
            "Long-duration Treasury bonds (e.g., 20-30 year maturity)",
            "The US Dollar Index (DXY)",
            "Short-term money market funds",
            "Bank sector ETFs",
          ],
          correctIndex: 0,
          explanation:
            "Long-duration bonds have the highest price sensitivity (duration) to interest rate changes. A 50bp surprise cut causes long-term yields to fall sharply, driving bond prices up significantly. The USD typically weakens on rate cuts (reducing yield attractiveness), money market funds pay less, and bank net interest margins compress — all negative for those assets short term.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Quantitative Easing (QE) removes liquidity from the financial system by selling bonds from the central bank's balance sheet.",
          correct: false,
          explanation:
            "QE is the opposite — it injects liquidity by *buying* bonds. The central bank creates new money to purchase government bonds and other securities, pushing cash into the financial system and driving down long-term yields. The process that removes liquidity by letting the balance sheet shrink (bonds mature without reinvestment) is called Quantitative Tightening (QT).",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "The Fed has been hiking rates for 18 months. Inflation has now fallen to 2.3% — near target. Unemployment has risen from 3.5% to 4.8%. The FOMC issues a statement saying they are 'prepared to begin normalizing policy.'",
          question:
            "How should a macro trader reposition their portfolio based on this signal?",
          options: [
            "Buy long-duration bonds and rotate into growth stocks; reduce USD exposure",
            "Short bonds — the Fed signaling cuts means inflation will re-accelerate",
            "Buy defensive stocks only — rate cuts always precede recessions",
            "Increase USD cash holdings — uncertainty demands safe haven positioning",
          ],
          correctIndex: 0,
          explanation:
            "A Fed pivot toward cuts is bullish for bonds (prices rise as yields fall) and for rate-sensitive growth stocks. The USD typically weakens as US rate advantage narrows. Long-duration bonds are the most direct beneficiary of rate cuts. While rate cuts can precede recessions, the immediate market reaction is risk-on: bonds rally, growth stocks outperform, and USD softens.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Currency Markets & Forex
       ================================================================ */
    {
      id: "macro-3",
      title: "Currency Markets & Forex",
      description:
        "Major pairs, carry trade, purchasing power parity, currency correlation with commodities",
      icon: "RefreshCw",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Forex Fundamentals: Major Pairs and Quoting",
          content:
            "The **foreign exchange (forex) market** is the largest and most liquid financial market in the world — trading over $7 trillion per day. It is decentralized, operating 24 hours a day, 5 days a week.\n\n**The major currency pairs** (most liquid):\n- **EUR/USD** — Euro vs. US Dollar ('The Fiber') — highest volume\n- **USD/JPY** — Dollar vs. Japanese Yen ('The Ninja')\n- **GBP/USD** — British Pound vs. Dollar ('The Cable')\n- **USD/CHF** — Dollar vs. Swiss Franc ('The Swissie')\n- **AUD/USD** — Australian Dollar vs. Dollar ('The Aussie') — commodity-linked\n- **USD/CAD** — Dollar vs. Canadian Dollar ('The Loonie') — oil-linked\n\n**How to read a quote:**\n- EUR/USD = 1.0850 means 1 Euro buys 1.0850 US Dollars\n- Base currency (left) = the one you're buying or selling\n- Quote currency (right) = the one you pay with\n- 'Pips' = smallest price movement (0.0001 for most pairs)\n\n**Cross pairs**: Pairs that don't include USD (e.g., EUR/JPY, GBP/AUD). They are derived from their respective USD pairs and generally less liquid.",
          highlight: [
            "EUR/USD",
            "major pairs",
            "pips",
            "base currency",
            "cross pairs",
          ],
        },
        {
          type: "teach",
          title: "What Drives Currency Prices",
          content:
            "Currency values reflect the relative economic strength and interest rate expectations between two countries:\n\n**Interest Rate Differentials (most powerful driver):**\n- Higher rates → currency appreciates (capital flows in for yield)\n- If the Fed raises while the ECB holds, USD strengthens vs EUR\n\n**Economic Data:**\n- Strong GDP, low unemployment, strong PMI → currency strengthens\n- Weak data → currency weakens as rate cut expectations build\n\n**Trade Balance:**\n- A country exporting more than it imports creates foreign demand for its currency\n- Large trade deficits (like the US) create structural selling pressure on the currency\n\n**Purchasing Power Parity (PPP):**\n- Long-run theory: exchange rates should adjust until identical goods cost the same in both countries\n- If a Big Mac costs $5 in the US and €6 in Europe, EUR/USD should be ~0.83 (long-run fair value)\n- PPP is useful for identifying extreme over/undervaluation over years, not for short-term trading\n\n**Safe Haven Flows:**\n- USD, CHF, and JPY strengthen during global crises — investors flee to these currencies\n- AUD, NZD, EM currencies weaken in risk-off environments",
          highlight: [
            "interest rate differential",
            "purchasing power parity",
            "safe haven",
            "trade balance",
          ],
        },
        {
          type: "teach",
          title: "Carry Trade and Commodity Currency Correlations",
          content:
            "Two of the most important macro forex strategies:\n\n**The Carry Trade:**\n- Borrow in a low-rate currency (e.g., JPY at 0.1%)\n- Invest in a high-rate currency (e.g., USD at 5.3%)\n- Earn the interest rate differential (~5.2% per year) as 'carry'\n- Carry trades work in calm markets but unwind violently in crises\n- August 2024 yen carry unwind: JPY spiked 10% in days, causing global stock selloff\n\n**Commodity Currency Correlations:**\nSome currencies move with commodity prices due to export dependence:\n\n- **AUD (Australian Dollar)**: Strongly correlated with iron ore and gold prices\n  - China buys most of Australia's commodities — Chinese PMI affects AUD\n- **CAD (Canadian Dollar)**: Highly correlated with crude oil prices\n  - USD/CAD often inversely mirrors WTI oil\n- **NOK (Norwegian Krone)**: Correlated with Brent crude\n- **CLP (Chilean Peso)**: Correlated with copper prices\n\n**Trading insight**: If you have a bullish view on oil, going long CAD (short USD/CAD) is a leveraged way to express it — with potentially lower volatility than oil futures.",
          highlight: [
            "carry trade",
            "commodity currency",
            "AUD",
            "CAD",
            "carry unwind",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "The Reserve Bank of Australia unexpectedly raises rates by 0.5% while the Fed holds rates steady. How does this affect AUD/USD?",
          options: [
            "AUD/USD rises — higher Australian rates attract capital inflows, strengthening the AUD",
            "AUD/USD falls — rate hikes slow the economy, which weakens the currency",
            "AUD/USD is unchanged — only US rate decisions affect this pair",
            "AUD/USD falls — a higher rate differential makes the carry trade less attractive",
          ],
          correctIndex: 0,
          explanation:
            "When the RBA raises rates while the Fed holds, the interest rate differential between Australia and the US widens in Australia's favor. Global capital flows into AUD-denominated assets to earn the higher yield. This creates buying pressure on the AUD, pushing AUD/USD higher. The 'higher rates → stronger currency' relationship is the most fundamental driver of short-to-medium term forex moves.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Purchasing Power Parity (PPP) is primarily useful for predicting short-term currency movements over the next few days or weeks.",
          correct: false,
          explanation:
            "PPP is a long-run valuation framework, not a short-term trading signal. Exchange rates can deviate from PPP fair value for years or even decades before reverting. Over short periods, currencies are driven by interest rate differentials, capital flows, risk sentiment, and economic data surprises. PPP is most useful for identifying currencies that appear fundamentally overvalued or undervalued on a multi-year horizon.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Oil prices surge 20% after OPEC announces major production cuts. USD/CAD is currently trading at 1.35. A macro trader believes the oil move is sustainable for the next 2-3 months.",
          question:
            "What forex trade best expresses a bullish oil view through currency markets?",
          options: [
            "Sell USD/CAD (buy CAD) — Canadian dollar strengthens with oil prices",
            "Buy USD/CAD — higher oil prices boost US dollar as energy exporters",
            "Buy AUD/USD — Australia is the largest oil producer in Asia-Pacific",
            "Buy USD/NOK — Norwegian oil revenues are currency-bearish",
          ],
          correctIndex: 0,
          explanation:
            "Canada is a major oil exporter, and the CAD (Canadian Dollar) has a strong positive correlation with crude oil prices. When oil rises, Canadian export revenues increase, strengthening the CAD. Selling USD/CAD (equivalently, buying CAD) is the classic way to express a bullish oil view through forex. The AUD is more correlated with metals/iron ore, not oil, and NOK would also work but USD/NOK moves in the wrong direction of the trade described.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Sector Rotation
       ================================================================ */
    {
      id: "macro-4",
      title: "Sector Rotation",
      description:
        "Business cycle phases, which sectors outperform in each phase, defensive vs cyclical",
      icon: "RefreshCw",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Business Cycle and Its Phases",
          content:
            "The **business cycle** describes the recurring pattern of economic expansion and contraction. Understanding which phase the economy is in gives macro traders a powerful edge in sector allocation.\n\n**The four phases:**\n\n**1. Early Expansion (Recovery)**\n- Economy emerging from recession\n- Low interest rates, rising confidence\n- Consumer spending picks up; housing starts rising\n\n**2. Mid-Cycle Expansion (Boom)**\n- GDP growth strong, unemployment falling\n- Corporate earnings at peak growth rates\n- Credit is abundant; risk appetite high\n\n**3. Late Cycle (Overheating)**\n- Inflation rising; labor market tight\n- Fed hiking rates; credit starts tightening\n- PMI still above 50 but starting to slow\n\n**4. Contraction (Recession)**\n- GDP negative, unemployment rising\n- Earnings declining; credit spreads widening\n- Fed cutting rates to stimulate\n\n**Key insight**: Stock markets are forward-looking — they often lead the business cycle by 6-9 months. Start rotating *before* the economic data confirms the phase change.",
          highlight: [
            "business cycle",
            "expansion",
            "contraction",
            "recession",
            "forward-looking",
          ],
        },
        {
          type: "teach",
          title: "Sector Performance by Cycle Phase",
          content:
            "Different sectors of the stock market outperform at different points in the business cycle:\n\n**Early Expansion — Best sectors:**\n- Consumer Discretionary (people start spending on non-essentials)\n- Financials (loan demand rises; credit quality improving)\n- Real Estate (low rates boost housing)\n- Industrials (capex spending begins)\n\n**Mid-Cycle — Best sectors:**\n- Technology (strong earnings growth funded by cheap credit)\n- Communication Services\n- Industrials (production at peak)\n\n**Late Cycle — Best sectors:**\n- Energy (oil demand peaks; inflation)\n- Materials (commodity inflation benefits miners)\n- Healthcare (defensive; people need it regardless)\n\n**Contraction/Recession — Best sectors:**\n- Consumer Staples (food, household goods — non-discretionary)\n- Utilities (electricity bills paid regardless)\n- Healthcare (non-cyclical demand)\n- Government Bonds (safe haven; Fed cuts benefit duration)\n\n**The classic rotation path**: Financials → Industrials → Tech → Energy/Materials → Staples/Utilities → back to Financials",
          highlight: [
            "consumer staples",
            "utilities",
            "cyclical",
            "defensive",
            "sector rotation",
          ],
          visual: "portfolio-pie",
        },
        {
          type: "teach",
          title: "Cyclical vs Defensive Stocks",
          content:
            "Understanding the difference between cyclical and defensive stocks is fundamental to sector rotation:\n\n**Cyclical stocks:**\n- Revenues and earnings move *with* the economy\n- Examples: auto manufacturers, airlines, hotels, retailers, homebuilders\n- High beta (amplify market moves)\n- Outperform during expansions; underperform in recessions\n- Valuation matters more at cycle peaks\n\n**Defensive stocks:**\n- Revenues remain relatively stable regardless of economic conditions\n- Examples: Procter & Gamble (staples), Johnson & Johnson (healthcare), Duke Energy (utilities)\n- Low beta (less sensitive to market swings)\n- Outperform during recessions; lag during bull markets\n- Often pay consistent dividends\n\n**Sector ETFs make rotation easy:**\n- XLY = Consumer Discretionary; XLP = Consumer Staples\n- XLE = Energy; XLF = Financials; XLK = Technology\n- XLU = Utilities; XLV = Healthcare\n\n**Rotation signal**: When XLP/XLY ratio (staples vs discretionary) starts rising, it often signals the late cycle or early contraction phase — defensive money is rotating in.",
          highlight: [
            "cyclical",
            "defensive",
            "beta",
            "sector ETF",
            "XLP/XLY ratio",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "The economy has been expanding for 3 years. Unemployment is at historic lows (3.4%), inflation is rising (4.2%), and the Fed has hiked rates 8 times. Which sectors are most attractive at this point in the cycle?",
          options: [
            "Energy and Materials — commodity inflation benefits; Consumer Staples as defensive hedge",
            "Technology and Consumer Discretionary — growth companies thrive in strong economies",
            "Financials and Real Estate — rising rates always boost these sectors",
            "Utilities and Healthcare — buy defensives at the start of every hiking cycle",
          ],
          correctIndex: 0,
          explanation:
            "This describes a late-cycle economy: employment at peak, inflation elevated, Fed hiking aggressively. Late cycle favors Energy (oil demand peak, inflationary environment) and Materials (commodity inflation benefits miners and raw material producers). Staples are a prudent defensive hedge as recession risk builds. Technology suffers from higher discount rates; Real Estate is hurt by higher mortgage rates; Banks face slowing loan growth.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Consumer Staples stocks (food, household goods) typically outperform the broad market during economic recessions because demand for essential goods remains stable.",
          correct: true,
          explanation:
            "Consumer Staples are the quintessential defensive sector. People continue buying groceries, cleaning products, and personal care items regardless of economic conditions. Companies like Procter & Gamble, Walmart, and Colgate maintain relatively stable revenues and dividends even when GDP contracts. This stability makes them outperform (on a relative basis) when cyclical sectors are experiencing earnings declines during recessions.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You notice the following signals simultaneously: The ISM Manufacturing PMI drops from 52 to 46. The yield curve inverts (2-year yields exceed 10-year yields). The XLP/XLY ratio (Consumer Staples vs. Discretionary) has risen 8% over the past month. Tech stocks have fallen 15% from their highs.",
          question:
            "Which sector rotation trade best positions your portfolio for the next phase?",
          options: [
            "Rotate from Technology and Consumer Discretionary into Consumer Staples, Utilities, and Healthcare",
            "Increase Technology exposure — it has corrected enough and will lead the recovery",
            "Buy Energy heavily — PMI below 50 signals oil demand is about to surge",
            "Buy Financials — an inverted yield curve signals banks will earn more interest income",
          ],
          correctIndex: 0,
          explanation:
            "All four signals point to late-cycle/early-contraction: PMI below 50 (contraction), inverted yield curve (recession predictor), rising Staples/Discretionary ratio (defensive rotation), and Tech weakness. The textbook move is rotating into Consumer Staples (non-discretionary demand), Utilities (regulated stable income), and Healthcare (inelastic demand). Financials suffer in inverted-curve environments (margin squeeze); Energy peaks in late cycle but PMI below 50 signals falling industrial demand.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Global Events & Geopolitics
       ================================================================ */
    {
      id: "macro-5",
      title: "Global Events & Geopolitics",
      description:
        "How geopolitical events move markets, safe haven assets, trading around elections and summits",
      icon: "Globe",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "How Geopolitical Risk Moves Markets",
          content:
            "Geopolitical events create sudden, often unpredictable shifts in risk appetite that cut across all asset classes simultaneously.\n\n**Common geopolitical catalysts:**\n- Military conflicts and wars (supply chain disruptions, commodity price shocks)\n- Sanctions and trade wars (tariffs affect specific sectors and currencies)\n- Political instability (elections, coups, government shutdowns)\n- Regulatory crackdowns (tech, banking, energy sectors targeted)\n- Pandemics and natural disasters (systemic economic disruption)\n\n**Typical market reaction pattern:**\n1. **Spike of uncertainty**: Stocks fall, volatility (VIX) surges, safe haven assets rally\n2. **Assessment phase**: Markets digest the scope and duration of the event\n3. **Resolution or normalization**: Risk assets recover if the event is contained\n\n**Geopolitical premium in oil:**\nMiddle East conflicts or pipeline disruptions add a risk premium to crude oil prices. Traders call this 'geopolitical risk premium' — oil trades above its fundamental fair value due to supply uncertainty.\n\n**Key principle**: Geopolitical shocks create buying opportunities in risk assets *if* the event is contained and doesn't have lasting economic consequences.",
          highlight: [
            "geopolitical risk",
            "VIX",
            "safe haven",
            "risk premium",
            "uncertainty",
          ],
        },
        {
          type: "teach",
          title: "Safe Haven Assets and Risk-Off Behavior",
          content:
            "When fear spikes in financial markets, capital flows out of risk assets and into 'safe havens' — assets perceived as stores of value or low-risk during uncertainty.\n\n**Primary safe haven assets:**\n\n**US Treasury Bonds:**\n- The world's deepest, most liquid bond market\n- 'Flight to safety' = buying Treasuries → yields fall, bond prices rise\n- 10-year Treasury yield falling is a classic risk-off signal\n\n**US Dollar (USD):**\n- Global reserve currency; demand spikes in crises\n- Counterintuitively, even crises *originating* in the US drive USD demand\n- DXY (Dollar Index) rising = risk-off environment\n\n**Gold:**\n- 5,000 years as a store of value\n- No counterparty risk — cannot default\n- Rises when real yields fall and uncertainty spikes\n- Also benefits from de-dollarization trends (EM central banks buying)\n\n**Swiss Franc (CHF):**\n- Switzerland's political neutrality and current account surplus make it a refuge\n- EUR/CHF falls in European crises (CHF strengthens)\n\n**Japanese Yen (JPY):**\n- Japan is a net creditor nation; in crises, Japanese investors repatriate foreign assets\n- USD/JPY falls (JPY strengthens) during global risk-off events",
          highlight: [
            "safe haven",
            "US Treasuries",
            "gold",
            "Swiss Franc",
            "Japanese Yen",
            "flight to safety",
          ],
        },
        {
          type: "teach",
          title: "Trading Around Elections, Summits, and Scheduled Events",
          content:
            "Not all geopolitical risk is sudden — many events are known in advance and can be systematically traded.\n\n**Elections:**\n- Markets typically become more volatile in the weeks before major elections\n- Sector implications depend on candidates' policies (e.g., energy stocks react to climate policy)\n- Historically, the S&P 500 often rallies post-election once uncertainty resolves ('sell the rumor, buy the news' on uncertainty)\n- Currency markets react to fiscal policy implications (deficit spending → currency weakness long-term)\n\n**G7/G20 Summits:**\n- Trade deals and tariff announcements from summits can spike specific sectors\n- Currency agreements (Plaza Accord 1985 — forced USD lower) can have lasting effects\n\n**Central Bank Summits (Jackson Hole):**\n- The Fed chair's speech in August sets tone for fall policy\n- Option implied volatility spikes before, collapses after (IV crush)\n\n**Practical framework for scheduled geopolitical events:**\n1. Identify the binary outcomes (e.g., candidate A wins vs. candidate B wins)\n2. Map which sectors/assets benefit from each outcome\n3. Consider using options (defined risk) rather than outright positions\n4. Don't over-position — geopolitical surprises can invalidate all preparation",
          highlight: [
            "election",
            "Jackson Hole",
            "IV crush",
            "binary outcome",
            "G7",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A major military conflict breaks out in a key oil-producing region. Which combination of asset moves would you most expect in the immediate aftermath?",
          options: [
            "Oil prices spike, gold rallies, global stocks fall, VIX surges, USD strengthens",
            "Oil falls (supply disruption uncertainty), gold falls, stocks rally on defense spending",
            "Stocks rally, bonds fall, USD weakens, oil is unchanged",
            "Gold falls, oil is unchanged, USD weakens, bonds rally",
          ],
          correctIndex: 0,
          explanation:
            "A conflict in an oil-producing region creates supply disruption fears — oil prices spike immediately on the geopolitical risk premium. Gold rallies as the primary safe haven. Global stocks sell off as risk appetite collapses and the economic impact of higher energy prices is priced in. VIX (the fear gauge) surges as investors buy protective put options. USD often strengthens as capital flees to the reserve currency.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The VIX index (often called the 'fear gauge') rises when market participants expect higher future stock market volatility, typically during periods of uncertainty or market stress.",
          correct: true,
          explanation:
            "The VIX measures the market's expectation of S&P 500 volatility over the next 30 days, derived from options prices. When fear spikes — due to geopolitical events, economic shocks, or unexpected data — investors buy put options to hedge, driving up options premiums and thus the VIX. A VIX above 30 is generally considered fearful territory; VIX above 40 has historically marked major market bottoms.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A major election is 3 weeks away. Candidate A favors fossil fuel expansion and corporate tax cuts. Candidate B favors a carbon tax and increased regulation on big tech. Pre-election polls are showing a statistical tie. The VIX has risen from 15 to 22 over the past two weeks.",
          question:
            "What is the most risk-controlled way for a macro trader to position around this event?",
          options: [
            "Use options strategies (straddles or strangles) to profit from the volatility spike regardless of outcome, or buy sector pairs that reflect each candidate's policy — hedging with offsetting positions",
            "Go all-in on fossil fuel stocks — Candidate A is likely to win and deregulate energy",
            "Short all equities — election uncertainty always causes prolonged market crashes",
            "Hold all cash until after the election, then buy whatever sector won",
          ],
          correctIndex: 0,
          explanation:
            "When outcomes are genuinely uncertain (statistical tie), directional bets are speculative coin flips. Professional macro traders in this scenario use defined-risk strategies: options straddles/strangles profit from the volatility spike regardless of direction; sector pairs (long energy, hedge with long tech — or vice versa) express policy views while limiting directional market risk. Going all-in on one outcome is gambling, not trading. Waiting for certainty after the event means giving up the opportunity premium — the best risk/reward entry is before the news.",
          difficulty: 3,
        },
      ],
    },
  ],
};
