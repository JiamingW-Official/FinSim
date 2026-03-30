import { Unit } from "./types";

export const UNIT_INFLATION_PROTECTION: Unit = {
  id: "inflation-protection",
  title: "Inflation Protection Strategies",
  description:
    "Build portfolios that preserve purchasing power during inflationary environments",
  icon: "TrendingUp",
  color: "#EF4444",
  lessons: [
    {
      id: "inflation-protection-tips-bonds",
      title: "TIPS & Inflation-Linked Bonds",
      description:
        "Understand how Treasury Inflation-Protected Securities work and when to use them",
      icon: "Shield",
      xpReward: 75,
      difficulty: "intermediate",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "How TIPS Work: Principal Adjustment",
          content:
            "Treasury Inflation-Protected Securities (TIPS) protect against inflation through a unique mechanism: the principal value adjusts with the Consumer Price Index (CPI). If you hold a $1,000 TIPS and CPI rises 5%, the adjusted principal becomes $1,050. Your coupon rate stays fixed (say 1.5%), but it applies to the inflation-adjusted principal — so your coupon payment rises from $15 to $15.75. At maturity, you receive the higher of original or inflation-adjusted principal, protecting you from deflation too.",
          highlight: [
            "Principal adjusts with CPI monthly",
            "Coupon % × adjusted principal = rising income",
            "Maturity: receive max(original, adjusted) principal",
          ],
        },
        {
          type: "teach",
          title: "Breakeven Inflation Rate",
          content:
            "The breakeven inflation rate is the single most important TIPS metric: it equals the nominal Treasury yield minus the TIPS yield for the same maturity. Example: 10-year Treasury yields 4.5%, 10-year TIPS yields 2.0% → breakeven = 2.5%. This means the market expects 2.5% average inflation over 10 years. If actual inflation exceeds 2.5%, TIPS outperform nominal Treasuries. If inflation falls short, nominals win. The breakeven rate is the market's real-time inflation forecast — watch it to gauge inflation expectations.",
          highlight: [
            "Breakeven = nominal yield − TIPS yield",
            "TIPS wins if actual inflation > breakeven",
            "Nominals win if actual inflation < breakeven",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A 10-year nominal Treasury yields 4.8% and a 10-year TIPS yields 1.9%. What is the breakeven inflation rate, and what does it mean?",
          options: [
            "6.7% — this is how much TIPS will return annually",
            "2.9% — the market's implied average inflation expectation over 10 years",
            "1.9% — the real return investors expect from TIPS",
            "4.8% — the total nominal return if you hold to maturity",
          ],
          correctIndex: 1,
          explanation:
            "Breakeven inflation = nominal yield − TIPS yield = 4.8% − 1.9% = 2.9%. If CPI averages more than 2.9% annually over the next 10 years, TIPS will outperform. The breakeven is the market's consensus inflation forecast, not a return guarantee.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "TIPS Duration Risk & I-Bonds",
          content:
            "TIPS carry real rate duration risk — when real interest rates rise, TIPS prices fall even as inflation protection remains intact. Long-maturity TIPS (20–30 year) are highly sensitive to real rate moves; in 2022, real rates surged from -1% to +1.5%, causing 20-year TIPS to lose 25%+ despite high inflation. I-Bonds offer an alternative: they earn a composite rate of a fixed component plus a variable inflation component (reset every 6 months based on CPI-U). I-Bonds have a $10,000 annual purchase limit per person, cannot be sold for 1 year, and carry a 3-month interest penalty if redeemed within 5 years. They are ideal for small savings with long holding horizons.",
          highlight: [
            "TIPS price falls when real rates rise",
            "Long-maturity TIPS = highest duration risk",
            "I-Bonds: $10K limit, 1-year lockup, fixed + variable rate",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "In 2022, TIPS significantly outperformed nominal Treasuries because inflation was very high, demonstrating that TIPS always protect against rising rates.",
          correct: false,
          explanation:
            "This is false. While TIPS do protect against rising inflation, rising real interest rates simultaneously hammer TIPS prices. In 2022, real rates surged sharply alongside high inflation, causing long-duration TIPS to post large losses despite high CPI. TIPS protect against unexpected inflation but not against rising real rates — an important distinction.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor expects inflation to average 3.5% over the next 10 years. The 10-year nominal Treasury yields 4.2% and the 10-year TIPS yields 1.5%. The investor has a 10-year investment horizon and does not need liquidity.",
          question: "Based on the breakeven analysis, what should this investor do?",
          options: [
            "Buy nominal Treasuries because they have a higher stated yield",
            "Buy TIPS because their inflation expectation (3.5%) exceeds the 2.7% breakeven",
            "Buy I-Bonds because they always outperform TIPS",
            "Avoid both since rates are likely to rise further",
          ],
          correctIndex: 1,
          explanation:
            "Breakeven = 4.2% − 1.5% = 2.7%. If the investor believes inflation will average 3.5% — higher than the 2.7% breakeven — TIPS are the better choice. The extra 0.8% of inflation above breakeven compounds into meaningful outperformance over 10 years. TIPS make sense when your inflation forecast exceeds the market's implied breakeven.",
          difficulty: 2,
        },
      ],
    },
    {
      id: "inflation-protection-commodities",
      title: "Commodities as Inflation Hedge",
      description:
        "Explore how commodities behave in inflationary environments and the nuances of commodity investing",
      icon: "BarChart2",
      xpReward: 80,
      difficulty: "intermediate",
      duration: 13,
      steps: [
        {
          type: "teach",
          title: "Commodities in Inflation Regimes",
          content:
            "Commodities often lead inflation — they are major inputs into CPI. Energy (oil, natural gas) is the most direct inflation driver: oil price spikes feed directly into gasoline, transport, and manufacturing costs. Agricultural commodities (wheat, corn, soybeans) drive food inflation. Unlike equities, commodities have low or negative correlation to stocks during inflationary surprises, making them effective portfolio diversifiers. The key distinction: commodities protect against supply-shock inflation (energy crises, droughts) better than demand-pull inflation driven by monetary expansion.",
          highlight: [
            "Commodities often lead CPI moves",
            "Energy is the biggest single CPI component",
            "Low correlation to equities during inflationary shocks",
          ],
        },
        {
          type: "teach",
          title: "Gold: The Historical Inflation Hedge",
          content:
            "Gold's inflation-hedging record is mixed and misunderstood. It worked spectacularly in the 1970s: gold rose from $35/oz in 1971 to $850/oz by 1980, matching and exceeding inflation as the dollar was untethered from gold. However in 2022 — when CPI peaked at 9.1% — gold was essentially flat for the year. The reason: gold is primarily a hedge against dollar weakness and financial panic, not inflation per se. Gold does best when real interest rates are deeply negative. In 2022, real rates rose sharply from -1% to +1.5%, making interest-bearing assets more attractive and pressuring gold despite high inflation.",
          highlight: [
            "1970s: gold rose 2,300% as dollar lost reserve status",
            "2022: gold flat despite 9% inflation — real rates rose too",
            "Gold = hedge against negative real rates, not all inflation",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Why did gold fail to protect investors in 2022 despite CPI reaching 9.1%?",
          options: [
            "Central banks sold large gold reserves suppressing the price",
            "Real interest rates rose sharply, making yield-bearing assets more attractive than gold",
            "Gold is no longer considered an inflation hedge by institutional investors",
            "Dollar weakness offset gold's inflation-hedging properties",
          ],
          correctIndex: 1,
          explanation:
            "Gold's price is largely driven by real interest rates (nominal rates minus inflation). In 2022, the Fed hiked aggressively, pushing real rates from deeply negative (-1%) to positive (+1.5%). Rising real rates increase the opportunity cost of holding gold (which pays no yield). Despite 9.1% inflation, gold was flat because rising real yields offset the inflation tailwind. Gold works best as a hedge when real rates are negative and staying negative.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Commodity Index Investing: The Roll Yield Problem",
          content:
            "Most investors access commodities through futures-based ETFs (S&P GSCI, Bloomberg Commodity Index, DJP). These instruments face a hidden cost: roll yield. Futures contracts expire, so the fund must 'roll' — sell the expiring contract and buy the next one. In contango (when future prices are above spot), rolling is expensive because you sell cheap and buy expensive, creating negative roll yield that can erode 10–20% annually. In backwardation (futures below spot), rolling generates positive yield. Energy markets in crisis are often backwardated (profit from rolling); calm energy markets are often in contango (cost to roll). Always check the curve structure before buying commodity futures ETFs.",
          highlight: [
            "Contango: futures > spot → negative roll yield (costly)",
            "Backwardation: futures < spot → positive roll yield (profitable)",
            "Roll costs can erode returns 10–20% annually in contango",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Investing in commodity producer stocks (e.g., oil companies, miners) always provides better inflation protection than investing directly in physical commodities or commodity futures.",
          correct: false,
          explanation:
            "False. Commodity producers offer equity-like returns with leverage to commodity prices, but they also carry company-specific risks: management decisions, hedging policies, balance sheet quality, and equity market correlation. In a sharp market selloff, producer stocks often fall with the broad market even as commodity prices rise. Physical commodities (gold, oil) have lower equity correlation but face storage/roll costs. Neither is strictly superior — each has different risk/return tradeoffs depending on the inflation regime and market environment.",
          difficulty: 2,
        },
      ],
    },
    {
      id: "inflation-protection-real-assets",
      title: "Real Assets & REITs",
      description:
        "Learn how real estate, infrastructure, and other real assets hedge inflation",
      icon: "Building",
      xpReward: 80,
      difficulty: "intermediate",
      duration: 14,
      steps: [
        {
          type: "teach",
          title: "Real Estate as an Inflation Hedge",
          content:
            "Real estate has historically been one of the strongest inflation hedges. The mechanism is intuitive: rents are typically reset annually, and landlords often include CPI escalators in leases — particularly commercial (office, industrial, retail) and multifamily residential. As construction costs rise with inflation, replacement cost increases, supporting property values. REITs (Real Estate Investment Trusts) make this accessible publicly: they must distribute 90% of taxable income as dividends and trade like stocks. Residential REITs with short lease durations reprice fastest; long-lease commercial REITs (net leases to Home Depot or Walgreens) reset slowly but often have explicit CPI-linked escalators.",
          highlight: [
            "Rents reset annually — CPI escalators common in leases",
            "Rising construction costs support property replacement values",
            "Short-lease residential REITs reprice fastest in inflation",
          ],
        },
        {
          type: "teach",
          title: "Infrastructure: The Gold Standard of Inflation Pass-Through",
          content:
            "Infrastructure assets — toll roads, airports, regulated utilities, pipelines, and cell towers — often have the most direct inflation linkage of any asset class. Many operate under government-regulated frameworks with explicit CPI-indexed pricing: toll rates increase with CPI annually, water utility tariffs are reset in regulatory reviews with inflation adjustments, airport landing fees are indexed to inflation. Unlike REITs, infrastructure cash flows are more contractual and less economically sensitive, making them closer to inflation-linked bonds than equities. The classic example: European toll roads (Transurban, Vinci) raised tolls exactly with CPI during the 2021–2023 inflation surge, delivering real return stability.",
          highlight: [
            "Many infrastructure contracts have explicit CPI-linked rate resets",
            "Toll roads, utilities, airports = highest inflation pass-through",
            "More bond-like and contractual than REITs",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A REIT invests in net-lease commercial properties with 15-year fixed leases and no rent escalators. How does this REIT likely perform in a high-inflation environment?",
          options: [
            "Outperforms — long-term leases provide stable income regardless of inflation",
            "Performs well — tenant quality in net leases protects income",
            "Underperforms — fixed rents lose real purchasing power and rising rates compress cap rates",
            "Unaffected — REITs are required by law to pass through inflation to tenants",
          ],
          correctIndex: 2,
          explanation:
            "Fixed leases with no CPI escalators are inflation's victims: the nominal rent stays fixed while inflation erodes its real value. Simultaneously, rising interest rates (the typical policy response to inflation) expand cap rates — meaning investors demand higher yields — which compresses property valuations. Net-lease REITs with fixed rents are essentially long-duration fixed-income instruments with all the duration risk but less inflation protection. Always check lease structures when evaluating REITs for inflation protection.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Timberland, Farmland & Private Real Assets",
          content:
            "Beyond public markets, timberland and farmland are considered the purest inflation hedges. Timberland benefits from inflation on two levels: land values rise with inflation, and timber prices are driven by housing demand (construction materials). The unique 'inventory management' advantage: if lumber prices are low, you simply let trees grow and harvest later when prices recover. Farmland generates inflation-protected income as food commodity prices rise. However, both require large minimum investments and long holding periods — typically accessed through REITs (Weyerhaeuser for timber, Farmland Partners) or private institutional funds. Private real assets also avoid the mark-to-market volatility of public REITs.",
          highlight: [
            "Timberland: land value + harvestable timber inventory flexibility",
            "Farmland: food prices rise with inflation → rent income rises",
            "Private real assets avoid daily mark-to-market volatility",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "REITs always outperform in inflationary periods because rising rents compensate for the negative impact of rising interest rates on property valuations.",
          correct: false,
          explanation:
            "False. While rent growth can be a positive for REIT cash flows, rising interest rates — the typical policy response to inflation — increase cap rates and compress REIT valuations. The relationship is complex: if rents rise faster than interest rates, REITs can outperform. But if rates rise rapidly (as in 2022), the cap rate expansion overwhelms rent growth and REITs sell off sharply. The FTSE NAREIT All Equity REIT Index fell approximately 26% in 2022 despite strong rent growth, illustrating this tension.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor wants maximum inflation protection for a long-term portfolio. They are comparing: (A) a REIT with 5-year leases and CPI escalators, (B) a toll road infrastructure fund with CPI-indexed toll rates, (C) a farmland REIT, and (D) a net-lease REIT with 20-year fixed leases.",
          question: "Which asset provides the most direct and reliable inflation protection?",
          options: [
            "A — REITs with CPI escalators reprice quickly and efficiently",
            "B — Toll road infrastructure with CPI-indexed rates provides contractual inflation pass-through",
            "C — Farmland is the oldest inflation hedge known to humankind",
            "D — Long lease duration provides stability that outweighs inflation risk",
          ],
          correctIndex: 1,
          explanation:
            "Toll road infrastructure with explicit CPI-indexed rate contracts provides the most reliable and contractual inflation protection. The revenue formula is literally 'toll = base rate × CPI index' in many regulated frameworks — there is no guess work, no lease negotiation, no tenant credit risk. The CPI linkage is legally mandated. This makes regulated infrastructure the highest-quality inflation hedge in the real assets category.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "inflation-protection-equity-floating",
      title: "Equity Sectors & Floating Rate",
      description:
        "Master sector rotation in inflation and the role of floating rate instruments",
      icon: "ArrowUpDown",
      xpReward: 85,
      difficulty: "advanced",
      duration: 15,
      steps: [
        {
          type: "teach",
          title: "Sector Rotation in Inflationary Environments",
          content:
            "Not all equities suffer equally from inflation. Historical analysis of inflationary periods (1965–1980, 2000s commodity boom, 2021–2023) reveals consistent sector patterns. Winners in inflation: Energy (direct commodity exposure), Materials (metals, chemicals benefit from pricing power), Financials (banks profit from wider net interest margins as rates rise). Losers: Technology (long-duration growth stocks see discounted cash flows hit hardest by rising rates), Utilities (bond-proxy with fixed regulated returns, duration-like sensitivity), Consumer Discretionary (squeezed by input cost inflation and weakened consumer spending power). The key variable: pricing power — can the business raise prices faster than costs rise?",
          highlight: [
            "Winners: Energy, Materials, Financials",
            "Losers: Technology, Utilities, Consumer Discretionary",
            "Key differentiator: pricing power vs cost structure",
          ],
        },
        {
          type: "teach",
          title: "Value vs Growth in Inflation",
          content:
            "The duration analogy explains why value stocks outperform growth in inflation. Growth stocks are 'long-duration' equity: their value comes from earnings far in the future (10–20 years out), which are heavily discounted when interest rates rise. Value stocks are 'short-duration': they earn profits now, with lower dependence on distant future growth. Warren Buffett's 'pricing power test' is the best practical screen: 'If I raise prices 10% tomorrow, will I lose customers?' Companies with pricing power — premium brands (Apple, LVMH), regulated monopolies, essential services — pass this test. Commodity businesses with no differentiation fail it. Pricing power, not P/E ratio, is the true inflation defense for equity portfolios.",
          highlight: [
            "Growth = long-duration equity, suffers most from rate rises",
            "Value = short-duration equity, outperforms in inflation",
            "Buffett's test: can you raise prices without losing customers?",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "During a period of rising inflation and rising interest rates, which of the following equity sectors has historically been most likely to outperform?",
          options: [
            "Technology — innovators can always pass costs to customers",
            "Utilities — stable regulated returns provide income in volatile markets",
            "Energy — direct commodity exposure and pricing power in the inflation basket",
            "Consumer Staples — defensive revenues offset rising input costs perfectly",
          ],
          correctIndex: 2,
          explanation:
            "Energy is historically the strongest equity performer in inflationary periods. Oil and gas prices are direct inflation components — when energy prices rise, energy company revenues and profits surge. Their input costs (labor, equipment) rise more slowly than their output prices. In 2022, the S&P Energy sector returned +65% while the S&P 500 fell 19%. Utilities, despite being 'defensive,' suffer from rate-sensitive valuation multiples and fixed regulatory returns that do not keep pace with inflation.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Floating Rate Bonds & Bank Loans",
          content:
            "Floating rate instruments reset their coupon payments regularly based on a benchmark rate, offering natural protection against rising rates (unlike fixed-rate bonds that fall in price). Corporate floating rate notes typically pay SOFR (Secured Overnight Financing Rate) + a fixed spread, resetting quarterly. If SOFR rises from 2% to 5%, the coupon rises accordingly. Bank loans (also called leveraged loans or senior secured loans) are floating rate instruments made to below-investment-grade companies. They are senior secured (first claim on assets) and trade via loan funds or ETFs (BKLN, SRLN). The tradeoff: floating rate bonds protect against rate rises but expose you to credit risk — if inflation triggers recession, high-yield loan defaults can spike.",
          highlight: [
            "Floating rate = SOFR + spread, resets quarterly",
            "Bank loans: senior secured, floating, below-IG credit quality",
            "Credit risk rises if inflation tips economy into recession",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Floating rate bonds always outperform fixed rate bonds during inflationary periods because their coupons rise with interest rates.",
          correct: false,
          explanation:
            "Partially true but oversimplified — hence false as an absolute statement. Floating rate bonds do benefit from rising rates through higher coupon income. However, inflation often signals economic stress that can increase credit risk in the floating rate (often high-yield) universe. If inflation is severe enough to cause recession, default rates on leveraged loans can spike sharply, causing principal losses that outweigh the coupon benefit. Additionally, floating rate bonds have near-zero duration, so they do not benefit from price appreciation when rates eventually fall. They are rate-risk neutral, not automatically superior in all inflationary scenarios.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investment committee is constructing an inflation-protection portfolio. They have five asset classes available: 10-year TIPS, energy sector ETF, infrastructure fund with CPI-linked contracts, floating rate bank loan ETF, and long-duration nominal Treasury bonds.",
          question: "Which combination provides the most comprehensive inflation protection with diversified mechanisms?",
          options: [
            "TIPS + nominal Treasuries — government bonds are always the safest inflation hedge",
            "Energy ETF + bank loan ETF — both benefit directly from rising rates and commodity prices",
            "TIPS + energy sector ETF + infrastructure fund — covers inflation-linked bonds, commodity exposure, and real asset cash flows",
            "Infrastructure fund + nominal Treasuries + bank loan ETF — balances stability with income",
          ],
          correctIndex: 2,
          explanation:
            "The optimal combination covers three distinct inflation-protection mechanisms: (1) TIPS provide direct CPI-linked principal protection on the bond side; (2) Energy sector ETF provides commodity price upside and pricing power equity exposure; (3) Infrastructure fund provides contractual CPI-linked cash flows from real assets. Together they address inflation through bonds, equities, and real assets — three independent channels. Nominal Treasuries are the worst inflation hedge (fixed coupons lose real value), and bank loans add credit risk without the contractual inflation linkage of the other three.",
          difficulty: 3,
        },
      ],
    },
  ],
};
