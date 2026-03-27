import type { Unit } from "./types";

export const UNIT_MACRO_TRADING: Unit = {
  id: "macro-trading",
  title: "Macro Trading",
  description: "Trade the big picture: central banks, economics, and global markets",
  icon: "Globe",
  color: "#6366f1",
  lessons: [
    {
      id: "macro-1",
      title: "Central Banks & Interest Rates",
      description: "How Fed decisions move every market on Earth",
      icon: "Landmark",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "The World's Most Powerful Institution",
          content:
            "The **Federal Reserve** (Fed) is the central bank of the US. Its decisions ripple through every asset class worldwide.\n\nThe Fed's two mandates:\n• **Maximum employment** — keep unemployment low\n• **Price stability** — target ~2% inflation\n\nTo achieve these goals, the Fed controls the **Federal Funds Rate** — the overnight lending rate between banks. This single number affects mortgages, bonds, stocks, and currencies across the globe.\n\nKey Fed meetings (FOMC) happen **8 times per year**. Each meeting can move markets significantly.",
          highlight: ["Federal Reserve", "Federal Funds Rate", "FOMC"],
        },
        {
          type: "teach",
          title: "How Rate Changes Affect Markets",
          content:
            "Understanding the rate-market relationship is core to macro trading:\n\n**Rate Hikes (higher rates):**\n• Borrowing costs rise → companies invest less → earnings may fall\n• Bond yields rise → bonds more attractive vs. stocks → stocks often fall\n• Dollar strengthens → US exports become more expensive\n• Growth stocks (tech) hit hardest — future profits worth less today\n\n**Rate Cuts (lower rates):**\n• Borrowing cheap → companies expand → earnings may rise\n• Bond yields fall → stocks look more attractive\n• Dollar weakens → commodity prices often rise\n• Growth stocks benefit most — future profits worth more today\n\n**The mantra**: \"Don't fight the Fed.\"",
          highlight: ["rate hikes", "rate cuts", "bond yields"],
        },
        {
          type: "quiz-mc",
          question:
            "The Fed unexpectedly raises rates by 0.75%. Which sector is likely to be hit hardest in the short term?",
          options: [
            "High-growth tech stocks with little current profit",
            "Energy companies with stable cash flows",
            "Utility companies paying steady dividends",
            "Gold mining companies",
          ],
          correctIndex: 0,
          explanation:
            "High-growth tech stocks are valued on future earnings. Higher rates increase the discount rate applied to those future earnings, making them worth less today. Companies like early-stage tech with no current profit suffer the most from rate hikes.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Inflation is running at 7% — well above the Fed's 2% target. The jobs market is strong with unemployment at 3.5%. The Fed chair gives a speech hinting at 'ongoing rate increases.'",
          question: "As a macro trader, what is your most likely positioning?",
          options: [
            "Short long-duration bonds, reduce growth stock exposure, consider long USD",
            "Buy growth stocks aggressively — the economy is strong",
            "Buy long-term Treasury bonds to lock in yields",
            "Go all-in on emerging market equities",
          ],
          correctIndex: 0,
          explanation:
            "With inflation high and the Fed signaling hikes, bonds will fall in price (yields rise), growth stocks face headwinds, and the USD typically strengthens. Shorting long-duration bonds and reducing growth exposure is classic macro positioning in a rate-hike cycle.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "macro-2",
      title: "Economic Indicators",
      description: "GDP, CPI, unemployment, and PMI — the market's vital signs",
      icon: "BarChart2",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "The Four Pillars of Economic Data",
          content:
            "Macro traders watch economic releases like a doctor monitors vital signs. The four most market-moving indicators:\n\n**1. GDP (Gross Domestic Product)**\n• Measures total economic output\n• Released quarterly; above 2% growth is healthy\n• Surprise beats → stocks up; misses → stocks down\n\n**2. CPI (Consumer Price Index)**\n• Measures inflation — what consumers pay for goods/services\n• Fed targets ~2%; above target → rate hike pressure\n• High CPI prints often cause bond sell-offs\n\n**3. Non-Farm Payrolls (NFP)**\n• Monthly jobs added outside farming sector\n• Released first Friday of every month\n• Strongest market-moving data release in the world\n\n**4. PMI (Purchasing Managers' Index)**\n• Survey of purchasing managers at companies\n• Above 50 = expansion; below 50 = contraction\n• Leading indicator — it predicts future activity",
          highlight: ["GDP", "CPI", "NFP", "PMI"],
        },
        {
          type: "quiz-mc",
          question:
            "The PMI reading drops from 54 to 48. What does this signal about the economy?",
          options: [
            "The economy is contracting — business activity is shrinking",
            "The economy is expanding — business activity is growing",
            "The economy is at exactly the breakeven point",
            "Nothing — PMI only measures inflation",
          ],
          correctIndex: 0,
          explanation:
            "PMI below 50 signals contraction — purchasing managers are ordering less, hiring less, and seeing weaker demand. Dropping from 54 (expansion) to 48 (contraction) is a bearish signal for economic growth and can weigh on stocks.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Trading Around Economic Releases",
          content:
            "Economic data creates **volatility spikes** that macro traders exploit. Key strategies:\n\n**Before the release:**\n• Check the consensus forecast (what analysts expect)\n• Understand what a beat or miss means for rates and markets\n\n**The 'buy the rumor, sell the news' effect:**\n• Markets often price in expectations before the release\n• A good number can still cause selling if it was fully priced in\n\n**Surprise factor is what moves markets:**\n• Actual vs. Estimate = the key number\n• +200K jobs vs. +150K expected → strong bullish surprise\n• -50K jobs vs. +150K expected → severe bearish shock\n\n**Key calendar dates to know:**\n• First Friday: Non-Farm Payrolls\n• Mid-month: CPI release\n• Last week of month: GDP (quarterly)\n• Monthly: ISM PMI",
          highlight: ["consensus forecast", "surprise factor", "buy the rumor"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "CPI comes in at 3.8% year-over-year. Wall Street consensus was 3.2%. The Fed is currently in a 'wait and see' mode on rates.",
          question: "What is the most likely immediate market reaction?",
          options: [
            "Bonds sell off (yields spike), stocks fall, USD strengthens",
            "Stocks rally because the economy is running hot",
            "Gold falls sharply as inflation is under control",
            "Markets are unchanged — the Fed will ignore this data",
          ],
          correctIndex: 0,
          explanation:
            "A CPI surprise above expectations (3.8% vs. 3.2%) signals inflation is stickier than thought. This raises the probability of Fed rate hikes, which pushes bond prices down (yields up), pressures stocks, and typically strengthens the USD as higher rates attract foreign capital.",
          difficulty: 2,
        },
      ],
    },
    {
      id: "macro-3",
      title: "Yield Curve Analysis",
      description: "What bond markets reveal about the economy's future",
      icon: "TrendingUp",
      xpReward: 85,
      steps: [
        {
          type: "teach",
          title: "What Is the Yield Curve?",
          content:
            "The **yield curve** plots interest rates of US Treasury bonds across different maturities — from 3-month bills to 30-year bonds.\n\nUnder normal conditions, longer-term bonds pay **higher yields** than short-term bonds. You demand more return for locking up money longer.\n\n**Three shapes to know:**\n\n**Normal (upward sloping):**\n• 2-year yield < 10-year yield\n• Signals healthy economic growth expected\n• Historically most common shape\n\n**Inverted (downward sloping):**\n• 2-year yield > 10-year yield\n• Signals recession fears — investors expect rates to fall\n• Has predicted every US recession since 1955\n\n**Flat:**\n• Short and long rates near equal\n• Transition signal — often precedes inversion\n• Uncertainty about future growth",
          highlight: ["yield curve", "inverted", "normal", "flat"],
        },
        {
          type: "quiz-mc",
          question:
            "The 2-year Treasury yields 5.1% and the 10-year Treasury yields 4.3%. What is the yield curve shape and what does it historically signal?",
          options: [
            "Inverted — historically a leading recession indicator",
            "Normal — signals healthy economic growth ahead",
            "Flat — signals the economy is at peak capacity",
            "Steep — signals aggressive Fed rate cuts coming",
          ],
          correctIndex: 0,
          explanation:
            "When the 2-year yield (5.1%) exceeds the 10-year yield (4.3%), the curve is inverted by -0.8%. This 2s10s inversion has preceded every US recession in modern history, typically by 6-18 months. It signals bond markets expect economic weakness and future rate cuts.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Trading the Yield Curve",
          content:
            "The yield curve is one of the most powerful macro signals available. Here's how traders use it:\n\n**Spotting an inversion:**\n• Watch the **2s10s spread** (10-year minus 2-year yield)\n• When negative: reduce cyclical stock exposure, add defensive positions\n• Consider long-duration bonds (they rise in price when yields fall)\n\n**Sector implications by curve shape:**\n\n**Normal curve (economy expanding):**\n• Banks profit — borrow short, lend long\n• Cyclicals outperform: industrials, materials, consumer discretionary\n\n**Inverted curve (recession risk):**\n• Banks struggle — margins squeezed\n• Defensives outperform: utilities, healthcare, consumer staples\n• Gold and Treasuries often rally\n\n**The key insight**: Bond markets often **predict** what equity markets react to later.",
          highlight: ["2s10s spread", "cyclicals", "defensives", "duration"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You notice the 2s10s yield spread has been inverted for 8 months and is deepening. Bank stocks have started falling. Leading indicators are softening.",
          question: "Which portfolio adjustment aligns best with this macro signal?",
          options: [
            "Rotate from bank stocks into healthcare and utilities; add long-duration Treasuries",
            "Buy more bank stocks — they will benefit most when rates normalize",
            "Go all-in on small-cap growth stocks for maximum upside",
            "Short all equity indices immediately — recession is certain",
          ],
          correctIndex: 0,
          explanation:
            "A deepening inversion with banks weakening is a classic recession setup. Rotating to defensive sectors (healthcare, utilities) and adding long Treasuries is prudent. Banks suffer in this environment. Shorting everything outright ignores that timing is uncertain — markets can stay irrational. Defensives and bonds are the measured response.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "macro-4",
      title: "Global Macro Strategies",
      description: "Carry trades, trend following, and macro pairs trading",
      icon: "Compass",
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "The Carry Trade",
          content:
            "The **carry trade** is one of the most widely used macro strategies in currency markets.\n\n**How it works:**\n1. Borrow money in a low-interest-rate currency (e.g., Japanese Yen at 0.1%)\n2. Convert and invest in a high-interest-rate currency (e.g., US Dollar at 5.3%)\n3. Pocket the **interest rate differential** — the 'carry'\n\n**Classic example:**\n• Borrow JPY at 0.1%, buy USD assets yielding 5.3%\n• Earn ~5.2% per year on the spread — before currency moves\n\n**The risk — the 'carry unwind':**\n• Works brilliantly in calm markets\n• In a crisis, everyone exits at once\n• JPY spikes violently as borrowers rush to repay\n• August 2024: Yen carry unwind caused global stocks to drop ~5% in days\n\n**Key principle**: Carry trades are like picking up nickels in front of a steamroller.",
          highlight: ["carry trade", "interest rate differential", "carry unwind"],
        },
        {
          type: "teach",
          title: "Trend Following & Macro Pairs",
          content:
            "Two more core global macro strategies used by professional hedge funds:\n\n**Trend Following (CTA style):**\n• Identify markets in strong directional trends across all asset classes\n• Go long rising assets, short falling assets — systematically\n• Works across: equities, bonds, currencies, commodities\n• Biggest trades last months to years, not days\n• Famous practitioners: Winton, Man AHL, Millburn\n\n**Macro Pairs Trading:**\n• Trade the relative performance of two related assets\n• Examples:\n  - Long EUR/USD when ECB is hawkish vs. Fed dovish\n  - Long oil majors / short airlines when oil spikes\n  - Long US bonds / short German Bunds when US growth slows faster\n• Risk is reduced vs. outright directional bets\n• Focus on the **spread** between two instruments, not absolute direction\n\n**The macro trader's edge**: synthesizing economic data, central bank policy, and price trends into high-conviction, diversified positions.",
          highlight: ["trend following", "pairs trading", "spread", "CTA"],
        },
        {
          type: "quiz-mc",
          question:
            "A macro trader believes the Bank of Japan will keep rates near zero while the Fed keeps rates high. Which carry trade benefits most from this divergence?",
          options: [
            "Borrow JPY, buy USD-denominated assets to earn the rate differential",
            "Borrow USD, buy JPY assets — USD has higher rates so it's cheaper",
            "Buy both JPY and USD equally to hedge all currency risk",
            "Short both currencies and go long EUR instead",
          ],
          correctIndex: 0,
          explanation:
            "When Japan keeps near-zero rates while the Fed holds high, borrowing in JPY is cheap. You convert to USD and invest in US assets yielding ~5%+. The carry (profit) is the rate difference. This is the classic JPY carry trade — used by hedge funds, banks, and even retail traders worldwide.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "US economic data is weakening (GDP slowing, PMI below 50). The Fed signals rate cuts. Meanwhile, Europe's economy is resilient and the ECB hints at holding rates higher for longer. A macro trader wants to express this divergence.",
          question: "Which pairs trade best captures this macro theme?",
          options: [
            "Long EUR/USD (Euro strengthens vs. weakening Dollar as rate differentials narrow)",
            "Short EUR/USD (Dollar always strengthens when the US economy slows)",
            "Buy S&P 500 futures — lower rates will boost US stocks regardless",
            "Go long JPY/USD — Japan's economy benefits when the US slows",
          ],
          correctIndex: 0,
          explanation:
            "Rate differentials drive currency pairs. If the Fed cuts while the ECB holds, US rates fall relative to European rates — making USD less attractive vs. EUR. Investors move capital toward EUR-denominated assets, pushing EUR/USD higher. This is textbook macro pairs trading: expressing an economic divergence through a currency pair.",
          difficulty: 3,
        },
      ],
    },
  ],
};
