import { Unit } from "./types";

export const UNIT_GLOBAL_MACRO_STRATEGIES: Unit = {
  id: "global-macro-strategies",
  title: "Global Macro Strategies",
  description:
    "Master top-down macro investing — economic cycles, FX and rates trades, commodity and EM dynamics, and multi-asset portfolio construction used by the world's top hedge funds.",
  icon: "Globe2",
  color: "#0369A1",
  lessons: [
    {
      id: "global-macro-framework",
      title: "Macro Framework",
      description:
        "Learn how macro investors position across economic cycles using growth-inflation quadrants, regime signals, and thematic investing.",
      icon: "Globe2",
      xpReward: 80,
      difficulty: "advanced",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "The Four Phases of the Economic Cycle",
          content:
            "Macro investors map the economy onto four phases: Boom (rising growth + rising inflation), Slowdown (falling growth + still-elevated inflation), Recession (falling growth + falling inflation), and Recovery (rising growth + falling inflation). Each phase favors different asset classes. Commodities and real assets outperform in Boom; cash and short-duration bonds in Slowdown; long-duration Treasuries and gold in Recession; equities and credit in Recovery.",
          highlight: [
            "Boom",
            "Slowdown",
            "Recession",
            "Recovery",
            "asset classes",
          ],
        },
        {
          type: "teach",
          title: "The Four-Quadrant Asset Matrix",
          content:
            "The growth-inflation matrix is a core macro tool. High growth + high inflation: commodities, TIPS, EM equities, energy stocks. High growth + low inflation: equities, high-yield credit, real estate. Low growth + high inflation (stagflation): gold, commodity exporters, short equities. Low growth + low inflation: long-duration bonds, defensive equities, cash. Bridgewater's All Weather portfolio splits risk equally across all four environments rather than betting on one outcome.",
          highlight: [
            "growth-inflation matrix",
            "All Weather",
            "stagflation",
            "TIPS",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In the Bridgewater All Weather framework, the portfolio is designed to perform well in how many economic environments?",
          options: [
            "Two — bull and bear markets",
            "Three — growth, inflation, and deflation",
            "Four — all combinations of rising/falling growth and inflation",
            "Five — including a currency crisis scenario",
          ],
          correctIndex: 2,
          explanation:
            "All Weather targets all four combinations of growth and inflation regimes — rising growth, falling growth, rising inflation, and falling inflation — by allocating risk equally across asset classes that perform in each environment.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Macro Regime Identification Signals",
          content:
            "Macro investors monitor leading indicators to identify regime shifts before they are obvious. Key signals: PMI composite (above 50 = expansion, below 50 = contraction), the 2s10s yield curve (inversion reliably precedes recessions by 12-18 months), investment-grade credit spreads (widening signals tightening financial conditions), and broad USD index (strong USD tightens global liquidity, hurts EM). Using multiple signals together reduces false positives.",
          highlight: [
            "PMI",
            "2s10s yield curve",
            "credit spreads",
            "USD index",
            "leading indicators",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A top-down macro investor starts with company-level earnings analysis before forming a view on the broader economic environment.",
          correct: false,
          explanation:
            "Macro investing is top-down: investors start with the global macroeconomic outlook (growth, inflation, monetary policy, geopolitics), then select countries, sectors, and finally specific instruments. Bottom-up analysis starts at the company level.",
          difficulty: 1,
        },
      ],
    },
    {
      id: "fx-and-rates-strategies",
      title: "FX & Rates Strategies",
      description:
        "Explore carry trades, yield curve positioning, inflation breakevens, and central bank divergence trades used by global macro funds.",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "advanced",
      duration: 14,
      steps: [
        {
          type: "teach",
          title: "Carry Trade Mechanics",
          content:
            "A carry trade borrows in a low-interest-rate currency and invests in a high-interest-rate currency, capturing the interest rate differential as profit. The classic example is borrowing in Japanese yen (near-zero rates) to invest in Australian dollars or EM currencies. Carry works in low-volatility environments but unwinds violently during risk-off episodes — when yen surges, long carry positions suffer simultaneous FX losses. Carry works because interest rate parity does not hold consistently in the short run.",
          highlight: [
            "carry trade",
            "yen funding",
            "interest rate parity",
            "risk-off",
          ],
        },
        {
          type: "teach",
          title: "Yield Curve Trades: Steepeners and Flatteners",
          content:
            "The 2s10s spread (10-year yield minus 2-year yield) is the most-watched yield curve metric. A steepener bet profits when the spread widens — typically in early recovery when the Fed holds short rates low while long-term growth and inflation expectations rise. A flattener profits when the spread narrows — typically when the Fed is hiking aggressively or the market prices in a recession. In risk-off episodes, investors extend duration (buy long bonds), profiting from a flight-to-quality rally.",
          highlight: [
            "2s10s spread",
            "steepener",
            "flattener",
            "duration extension",
            "flight-to-quality",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investor expects the Federal Reserve to hike rates aggressively while long-term economic growth expectations remain subdued. Which yield curve trade is most appropriate?",
          options: [
            "Steepener — buy long-duration bonds, sell short-duration bonds",
            "Flattener — buy short-duration bonds, sell long-duration bonds",
            "Flattener — short short-duration bonds, buy long-duration bonds",
            "Steepener — buy equities and sell commodities",
          ],
          correctIndex: 1,
          explanation:
            "Aggressive Fed rate hikes raise short-term yields sharply, while subdued growth expectations keep long-term yields from rising as much. This compresses the 2s10s spread, rewarding a flattener trade (long front-end bonds vs. short long-duration bonds, or equivalently, short the spread).",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Inflation Breakeven Trades and Central Bank Divergence",
          content:
            "TIPS (Treasury Inflation-Protected Securities) vs nominal Treasury spread is the inflation breakeven — the market's implied inflation forecast. When macro investors expect inflation to exceed market pricing, they buy TIPS and sell nominal Treasuries (long breakeven). Central bank divergence trades exploit different policy cycles: if the Fed is hiking while the ECB stays on hold, buying USD vs EUR can capture the rate differential. The EM vs DM rate differential also drives capital flows: when EM central banks offer substantially higher real rates, EM currencies attract carry inflows.",
          highlight: [
            "TIPS",
            "inflation breakeven",
            "central bank divergence",
            "ECB vs Fed",
            "real rates",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "The Fed is at 5.25% and the Bank of Japan holds rates at 0.1%. A macro fund borrows 100M yen at 0.1% and converts to USD, investing in 5.25% US Treasury bills. After six months, the yen unexpectedly appreciates 10% against the dollar.",
          question:
            "What is the primary risk that materialized and what is its approximate impact on the trade?",
          options: [
            "Credit risk — the US Treasury defaulted on interest payments",
            "Currency risk — yen appreciation erased the interest differential and created a capital loss",
            "Liquidity risk — the fund cannot unwind the position at fair value",
            "Duration risk — rising rates caused bond price losses",
          ],
          correctIndex: 1,
          explanation:
            "The carry trade earns roughly 2.6% over six months (5.25% - 0.1% annualized / 2). But a 10% yen appreciation means the yen-denominated loan now costs 10% more in dollar terms to repay, creating a net loss of roughly 7.4%. Currency risk is the main risk in carry trades and is why they unwind violently during risk-off events when funding currencies like the yen surge.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "commodity-and-em-macro",
      title: "Commodity & EM Macro",
      description:
        "Understand commodity supercycles, EM sovereign spreads, currency crisis signals, and the macro link between China demand and global commodity markets.",
      icon: "BarChart3",
      xpReward: 90,
      difficulty: "advanced",
      duration: 13,
      steps: [
        {
          type: "teach",
          title: "Commodity Supercycles and China Demand",
          content:
            "A commodity supercycle is a decade-long period of above-average prices driven by a structural demand surge that takes time for supply to match. The 2000s supercycle was powered by China's industrialization, which consumed massive quantities of copper (wiring), iron ore (steel), and soybeans (feed). The supercycle thesis requires two conditions: sustained demand growth and underinvestment in new supply capacity. When capex is low for years, even modest demand increases cause sharp price spikes because supply cannot respond quickly.",
          highlight: [
            "supercycle",
            "China demand",
            "copper",
            "iron ore",
            "capex underinvestment",
          ],
        },
        {
          type: "teach",
          title: "EM Sovereign Spreads and Currency Crisis Warning Signals",
          content:
            "The EMBI+ (Emerging Market Bond Index Plus) spread measures the yield premium EM government bonds command over US Treasuries. A widening EMBI+ spread signals deteriorating EM credit conditions. Early warning signals for EM currency crises include: FX reserves falling below 3 months of import coverage, current account deficits above 5% of GDP, short-term external debt exceeding reserves, rapid credit growth above 20% per year, and political instability. Hard currency EM debt (USD-denominated) removes local currency risk but retains sovereign credit risk; local currency debt adds FX exposure.",
          highlight: [
            "EMBI+",
            "FX reserves",
            "current account deficit",
            "hard currency",
            "local currency",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A country with a large current account deficit, rapidly depleting FX reserves, and high short-term external debt denominated in USD is most at risk of which macro event?",
          options: [
            "Commodity supercycle reversal",
            "Yield curve inversion",
            "EM currency crisis and forced devaluation",
            "Deflationary spiral driven by wage suppression",
          ],
          correctIndex: 2,
          explanation:
            "These are classic EM currency crisis warning signals: a current account deficit means more FX is leaving than coming in, depleting reserves; high short-term USD debt creates rollover risk if the currency falls; when reserves run low, the country may be forced to devalue or seek IMF assistance.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Commodity Exporter vs Importer Macro Divergence",
          content:
            "Rising commodity prices are a terms-of-trade shock that splits the world in two: exporters gain (Canada, Australia, Brazil, Saudi Arabia) and importers suffer (India, Turkey, South Korea, Japan). For exporters, higher commodity prices boost fiscal revenues, strengthen the currency, and allow higher government spending. For importers, commodity inflation widens the current account deficit, pressures the currency, and forces central banks to hike rates even as growth slows. Macro investors exploit this divergence by going long exporter currencies and short importer currencies when commodity prices spike.",
          highlight: [
            "terms of trade",
            "commodity exporter",
            "commodity importer",
            "currency divergence",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "When global copper prices rise sharply, a macro investor would typically expect the Brazilian real to depreciate because Brazil is heavily dependent on copper imports.",
          correct: false,
          explanation:
            "Brazil is a major commodity exporter (copper, iron ore, soybeans, oil). Rising commodity prices improve Brazil's terms of trade, boost export revenues, and typically strengthen the Brazilian real. The currencies most likely to weaken are those of commodity-importing nations with current account deficits.",
          difficulty: 2,
        },
      ],
    },
    {
      id: "macro-portfolio-construction",
      title: "Portfolio Construction",
      description:
        "Build macro portfolios using risk parity, tail hedging, Kelly criterion sizing, and Soros reflexivity — the mental models behind the world's top macro funds.",
      icon: "PieChart",
      xpReward: 95,
      difficulty: "advanced",
      duration: 15,
      steps: [
        {
          type: "teach",
          title: "Risk Parity and Macro Overlays",
          content:
            "Risk parity allocates capital so each asset class contributes equally to portfolio volatility, not equally by dollar weight. A traditional 60/40 portfolio has roughly 90% of its risk concentrated in equities because equities are far more volatile than bonds. Risk parity corrects this by levering up bonds and reducing equity weight, creating a more balanced risk profile. A macro overlay is a layer of tactical positions — FX forwards, rate futures, commodity swaps — placed on top of a strategic risk-parity core to express current macro views without altering the long-term allocation.",
          highlight: [
            "risk parity",
            "equal risk contribution",
            "macro overlay",
            "60/40",
            "leverage",
          ],
        },
        {
          type: "teach",
          title: "Tail Hedging in Macro Portfolios",
          content:
            "Tail hedges protect against low-probability, high-severity events. Common macro tail hedges: long gold (performs in deflation, war, and loss of dollar confidence), long USD (safe haven in risk-off panics), long VIX calls or variance swaps (profit from volatility spikes), long long-dated US Treasuries (flight to quality), and long out-of-the-money puts on risk assets. The cost of tail hedges must be weighed against the protection they provide — persistent carry bleed from options premiums can drag returns in bull markets.",
          highlight: [
            "tail hedge",
            "long gold",
            "long USD",
            "VIX",
            "variance swap",
            "carry bleed",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "George Soros's reflexivity theory states that market prices are primarily determined by:",
          options: [
            "The efficient discounting of all available fundamental information",
            "Technical momentum patterns that repeat due to market psychology",
            "A two-way feedback loop where investor beliefs influence fundamentals, which in turn change beliefs",
            "Central bank policy rate decisions that cascade into all asset prices",
          ],
          correctIndex: 2,
          explanation:
            "Reflexivity holds that market participants' biased views influence the very fundamentals they are trying to assess. For example, rising bank stock prices improve banks' ability to raise capital, which strengthens their fundamentals, which justifies even higher prices — until the loop reverses. Prices are not simply a reflection of fundamentals; they actively shape them.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Conviction-Based Sizing and Macro Risk Management",
          content:
            "The Kelly criterion sizes positions to maximize long-run geometric growth: f* = (bp - q) / b, where b = win/loss ratio, p = probability of win, q = probability of loss. Full Kelly is too aggressive for macro — practitioners use half-Kelly or quarter-Kelly to account for estimation error. Macro risk management balances two approaches: stop-loss exits (close the position when price moves against you by a defined amount) vs. fundamental reassessment (add to the position because the thesis is now even cheaper). Soros adds to winning positions; stops are set below key technical levels to avoid forced exits on noise.",
          highlight: [
            "Kelly criterion",
            "half-Kelly",
            "stop-loss",
            "fundamental reassessment",
            "position sizing",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A macro fund holds a long EM currency position based on the thesis that the country will raise rates to defend its currency. The position is down 8% due to unexpected political turmoil, but the rate-hike thesis remains intact. The fund manager must decide: cut the loss or hold and reassess.",
          question:
            "What does a Soros-style fundamental reassessment approach suggest, and what risk must be carefully managed?",
          options: [
            "Immediately exit because stop-loss rules must always be followed regardless of the thesis",
            "Hold or add to the position because the thesis is intact and the entry point is now better, while carefully monitoring reserve depletion as a thesis-breaking signal",
            "Double the position size to maximize Kelly criterion gains since the probability of winning has increased",
            "Switch to a short position to profit from the current downtrend",
          ],
          correctIndex: 1,
          explanation:
            "Soros-style fundamental reassessment means distinguishing between market noise (short-term political turmoil) and thesis invalidation (reserve depletion, central bank capitulation). If the rate-hike catalyst is intact, a lower entry price improves the risk/reward. The manager must identify a clear thesis-breaking signal — such as FX reserves falling below the 3-month import threshold — at which point the position must be cut regardless of price.",
          difficulty: 3,
        },
      ],
    },
  ],
};
