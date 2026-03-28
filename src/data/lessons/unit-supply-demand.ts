import type { Unit } from "./types";

export const UNIT_SUPPLY_DEMAND: Unit = {
  id: "supply-demand",
  title: "Supply & Demand Economics",
  description:
    "Understand how market forces determine prices and drive investment opportunities",
  icon: "BarChart2",
  color: "#10B981",
  lessons: [
    // ─── Lesson 1: Price Discovery ───────────────────────────────────────────────
    {
      id: "supply-demand-1",
      title: "Price Discovery",
      description:
        "How bid/ask spreads, auction mechanisms, and equilibrium pricing reveal true market value",
      icon: "BarChart2",
      xpReward: 75,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "What Is Price Discovery?",
          content:
            "**Price discovery** is the process by which buyers and sellers arrive at a transaction price through their competing bids and offers.\n\nEvery traded asset — a stock, bond, commodity, or currency — has a **bid price** (what buyers will pay) and an **ask price** (what sellers want). The difference between the two is the **bid-ask spread**, which represents the cost of immediate execution and reflects liquidity.\n\n**Key facts:**\n- A narrow spread (e.g., $0.01 on Apple shares) signals high liquidity and efficient price discovery.\n- A wide spread (e.g., $0.50 on a small-cap stock) signals thin markets where information is harder to incorporate.\n- Price discovery happens continuously on exchanges via a **double auction** — buyers submit bids and sellers submit asks; a trade occurs whenever they match.\n\n**Why this matters for investors:** When price discovery is efficient, asset prices quickly reflect new information. Inefficient markets (wide spreads, thin volume) create both risk and opportunity.",
          highlight: ["price discovery", "bid price", "ask price", "bid-ask spread", "double auction"],
        },
        {
          type: "teach",
          title: "Auction Mechanisms and Order Matching",
          content:
            "Exchanges use structured auction mechanisms to match buyers and sellers fairly.\n\n**Continuous double auction (CDA):** The standard mechanism on most stock exchanges. Orders are matched in real time whenever a bid meets or exceeds an ask. Price priority comes first — the highest bid and lowest ask transact first. Time priority breaks ties.\n\n**Opening and closing auctions:** NYSE and Nasdaq run call auctions at the open (9:30 AM) and close (4:00 PM). All orders accumulate before matching at a single clearing price that maximizes traded volume. This produces the official open and close prices used in benchmarks.\n\n**Dark pools and off-exchange:** About 40% of US equity volume trades off-exchange in venues that do not display quotes publicly. These protect large institutional orders from front-running but contribute less to public price discovery.\n\n**Key insight:** The mechanism matters. Markets with well-designed auctions produce tighter spreads, deeper books, and prices that more rapidly incorporate information.",
          highlight: ["continuous double auction", "opening auction", "closing auction", "dark pools", "order matching"],
        },
        {
          type: "teach",
          title: "Market Equilibrium and Price Signals",
          content:
            "**Market equilibrium** is reached when the quantity supplied equals the quantity demanded at a given price — the market clears.\n\nAt equilibrium:\n- No surplus exists (producers are not stuck with unsold goods)\n- No shortage exists (buyers can find what they need)\n- The price reflects all current information about costs, preferences, and expectations\n\n**Price signals** communicate information across the economy without any central coordinator:\n- A rising price signals scarcity — attracting new supply and reducing demand until balance is restored\n- A falling price signals surplus — discouraging production and encouraging more consumption\n\n**Example in financial markets:** If demand for NVIDIA shares surges on an AI earnings beat, the price rises immediately — signaling to arbitrageurs, analysts, and competitors what the market thinks the news is worth. No committee decides; the auction mechanism aggregates millions of judgments into one number.\n\n**Disequilibrium** (when markets are not clearing) creates trading opportunities: undervalued assets attract buyers; overvalued assets attract sellers.",
          highlight: ["market equilibrium", "price signals", "surplus", "shortage", "disequilibrium"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock has a bid of $49.97 and an ask of $50.03. What does the $0.06 bid-ask spread most directly represent?",
          options: [
            "The cost of immediate liquidity and a measure of how efficiently the market prices the stock",
            "The stock's daily trading range",
            "The dividend yield expressed as a fraction of the share price",
            "The difference between the stock's book value and market value",
          ],
          correctIndex: 0,
          explanation:
            "The bid-ask spread is the implicit cost of trading immediately — if you buy at the ask ($50.03) and the price does not move, you could only sell at the bid ($49.97), losing $0.06 per share. A narrow spread indicates a liquid, efficiently-priced market; a wide spread suggests thin trading and higher transaction costs.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "In an efficient market, a positive earnings surprise will cause a stock's price to rise gradually over several weeks as investors slowly process the information.",
          correct: false,
          explanation:
            "False. In an efficient market, prices adjust nearly instantaneously to new public information. An earnings surprise is incorporated into the stock price within seconds to minutes of release through the continuous auction mechanism. Gradual adjustment over weeks would imply market inefficiency — a potential trading opportunity.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Elasticity ────────────────────────────────────────────────────
    {
      id: "supply-demand-2",
      title: "Elasticity",
      description:
        "How sensitive is demand to price changes — and why it matters for industries and investments",
      icon: "TrendingUp",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Price Elasticity of Demand",
          content:
            "**Price elasticity of demand (PED)** measures how much the quantity demanded changes when the price changes.\n\n**Formula:** PED = % change in quantity demanded ÷ % change in price\n\n**Interpreting the result:**\n- |PED| > 1 → **Elastic**: demand is sensitive to price. A 10% price hike causes more than a 10% drop in quantity. Examples: luxury handbags, airline tickets, restaurant meals.\n- |PED| < 1 → **Inelastic**: demand barely changes with price. A 10% price hike causes less than a 10% drop in quantity. Examples: insulin, gasoline, cigarettes.\n- |PED| = 1 → **Unit elastic**: revenue stays the same when price changes.\n\n**Investment implication:** Companies selling inelastic goods can raise prices without losing customers — this translates to **pricing power** and strong margins. Pharma companies, utilities, and consumer staples companies often enjoy inelastic demand, making their earnings more predictable.",
          highlight: ["price elasticity of demand", "elastic", "inelastic", "pricing power", "PED"],
        },
        {
          type: "teach",
          title: "Inelastic Goods: Oil, Pharma, and Utilities",
          content:
            "Some goods have highly inelastic demand because they are necessities with few substitutes.\n\n**Oil and gasoline:**\nShort-run elasticity of gasoline demand is roughly −0.2 to −0.3. A 30% price spike cuts quantity demanded by only 6–9%. People still need to drive to work; they cannot instantly switch to electric vehicles. This is why OPEC supply cuts deliver outsized price increases — the inelastic demand curve means small supply reductions produce large price swings.\n\n**Pharmaceutical drugs:**\nPatented, life-sustaining drugs (insulin, cancer therapies) are extremely inelastic. Patients pay almost any price because the alternative is severe illness or death. This pricing power is a key driver of pharma profit margins — but it also invites political scrutiny and price controls.\n\n**Utilities (electricity, water):**\nHouseholds reduce electricity use marginally with price increases but cannot eliminate it. Utility companies operate as regulated monopolies partly because their inelastic-demand products are essential — without regulation, they could charge monopoly prices.\n\n**Investing takeaway:** Inelastic demand = pricing power = durable margins. Screen for companies in sectors where customers cannot easily say no to a price hike.",
          highlight: ["inelastic demand", "pricing power", "oil", "pharmaceutical", "utilities", "OPEC"],
        },
        {
          type: "teach",
          title: "Supply Elasticity and Cross-Elasticity",
          content:
            "**Price elasticity of supply (PES)** measures how much producers can increase output when prices rise.\n\n- **Elastic supply** (PES > 1): Producers can quickly expand. Factory goods, some agricultural crops.\n- **Inelastic supply** (PES < 1): Hard to scale quickly. Real estate (takes years to build), oil (limited reserves), skilled labor.\n\n**Why supply elasticity matters for prices:**\nWhen demand spikes but supply is inelastic, prices can spike dramatically — the quantity supplied cannot increase fast enough to absorb demand. This is the mechanism behind oil price shocks, housing market booms, and chip shortages.\n\n**Cross-price elasticity of demand (XED)** measures how demand for Good A responds to price changes in Good B:\n- **Positive XED (substitutes):** When Coke's price rises, Pepsi demand rises. If natural gas prices spike, demand for LNG rises.\n- **Negative XED (complements):** When the price of cars rises, tire demand falls. When software prices fall, hardware demand rises.\n\n**Portfolio application:** Understanding cross-elasticities helps identify sector contagion. If oil prices spike, airlines (complement to jet fuel) face cost pressure — but oil producers benefit. Mapping these relationships helps construct more resilient portfolios.",
          highlight: ["supply elasticity", "cross-price elasticity", "substitutes", "complements", "supply shock"],
        },
        {
          type: "quiz-mc",
          question:
            "A pharmaceutical company raises the price of its patented cancer drug by 40%. Prescriptions fall by only 4%. What does this indicate about demand for this drug?",
          options: [
            "Demand is highly inelastic (PED ≈ −0.1), reflecting the life-sustaining nature of the product",
            "Demand is elastic (PED ≈ −2.5), meaning patients have many substitutes available",
            "The drug has unit elasticity, so the company's revenue will stay the same",
            "Demand is inelastic in the long run but elastic in the short run",
          ],
          correctIndex: 0,
          explanation:
            "PED = −4% / 40% = −0.1. An absolute value well below 1 means demand is highly inelastic — a large price increase causes a tiny drop in quantity demanded. For patented, life-sustaining drugs with no alternatives, patients and insurers have limited ability to reduce consumption, giving the company enormous pricing power.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A positive cross-price elasticity between two goods means they are complements — when the price of one rises, demand for the other rises as well.",
          correct: false,
          explanation:
            "False. A positive cross-price elasticity means the goods are substitutes — when the price of Good A rises, consumers switch to Good B, increasing demand for B. Complements have negative cross-price elasticity: when the price of cars rises, fewer cars are bought, so demand for gasoline (a complement) also falls.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Market Dynamics ───────────────────────────────────────────────
    {
      id: "supply-demand-3",
      title: "Market Dynamics",
      description:
        "Curve shifts, commodity supercycles, housing booms, and competitive dynamics in action",
      icon: "Activity",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Shifts in Supply and Demand Curves",
          content:
            "A price change moves you **along** a curve. A shift in the underlying curve changes everything.\n\n**Demand curve shifters (SPEND):**\n- **S**ubstitute and complement prices\n- **P**references and tastes\n- **E**xpectations of future prices\n- **N**umber of buyers (demographics, market access)\n- **D**isposable income\n\n**Supply curve shifters:**\n- Input costs (raw materials, labor, energy)\n- Technology improvements\n- Number of producers\n- Government taxes, subsidies, or regulations\n- Natural events (weather, disasters)\n\n**Combined effects:**\n| Shift | Effect on Price | Effect on Quantity |\n|-------|---------------|-------------------|\n| Demand ↑ | ↑ | ↑ |\n| Demand ↓ | ↓ | ↓ |\n| Supply ↑ | ↓ | ↑ |\n| Supply ↓ | ↑ | ↓ |\n\n**Trading example:** When the Fed raises rates (a demand shifter for bonds), bond prices fall as the demand curve shifts left — the new equilibrium price is lower. Understanding which curve is shifting, and why, is the foundation of macro-driven investing.",
          highlight: ["demand curve", "supply curve", "curve shift", "equilibrium", "macro"],
        },
        {
          type: "teach",
          title: "Commodity Supercycles",
          content:
            "A **commodity supercycle** is a decades-long period of rising commodity prices driven by a structural surge in demand that outpaces the slow growth of supply.\n\n**Why supercycles exist:**\nBuilding new mines, oil fields, or farmland takes 5–15 years. When a large new source of demand emerges — like China's industrialization — prices rise sharply and stay high for years because supply cannot respond quickly enough (inelastic supply).\n\n**Historical supercycles:**\n- **1900s–1910s**: US industrialization drove steel and coal\n- **1960s–1970s**: Post-war reconstruction and oil shocks\n- **2000s–2010s**: China's rapid urbanization — copper, iron ore, and coal tripled or more\n- **2020s (emerging)**: Green energy transition — lithium, cobalt, copper for EVs and solar panels\n\n**Investment implication:**\nDuring a supercycle, commodity producers earn extraordinary margins. Mining and energy companies see massive earnings expansions. However, high prices also incentivize massive new investment — so the end of a supercycle can be brutal as new supply floods the market and prices collapse.\n\nPositioning early in a supercycle (buying undervalued producers before the demand surge is widely recognized) has historically been one of the most profitable macro trades.",
          highlight: ["commodity supercycle", "China", "green energy", "lithium", "copper", "supply response"],
        },
        {
          type: "teach",
          title: "Housing Markets and Competitive Dynamics",
          content:
            "The housing market is a textbook study in supply-demand dynamics with unusually inelastic supply.\n\n**Why housing supply is inelastic:**\n- Land is fixed and zoning restricts use\n- Construction takes 1–3 years\n- Skilled labor supply is slow to grow\n- Permitting and regulatory processes add delays\n\n**The 2020–2022 housing boom:**\nRemote work shifted demand geographically. Millennials hit peak home-buying age simultaneously. Mortgage rates near 0% lowered financing costs. Demand surged while supply was constrained — prices rose 40%+ in many markets. When the Fed raised rates from 0% to 5%+ in 2022–2023, demand collapsed while supply remained tight — creating an unusual freeze with high prices and low transaction volume.\n\n**Competitive dynamics in asset markets:**\nWhen industries are competitive (many firms, easy entry), excess profits attract new entrants who expand supply and drive prices back down. When industries have high barriers to entry (capital intensity, patents, network effects), incumbents sustain pricing power and margins for longer — which is why investors pay premium P/E multiples for moat-protected businesses.\n\n**Key lesson:** Sustainable excess returns require some friction on the supply side. Analyze what prevents new entrants from eroding a company's margins.",
          highlight: ["housing market", "zoning", "mortgage rates", "competitive dynamics", "barriers to entry", "moat"],
        },
        {
          type: "quiz-mc",
          question:
            "China's rapid urbanization in the 2000s drove copper demand far beyond available supply for nearly a decade. Which mechanism best explains why supply did not quickly catch up?",
          options: [
            "Mine development takes 5–15 years from exploration to production, making supply highly inelastic in the short and medium term",
            "Copper demand was elastic, so the price increase discouraged enough consumption to restore balance quickly",
            "Copper substitutes (aluminum, fiber optics) immediately replaced copper, stabilizing prices",
            "Government price controls in China prevented miners from expanding production",
          ],
          correctIndex: 0,
          explanation:
            "Commodity supply is highly inelastic in the medium term because expanding mine capacity requires years of exploration, permitting, construction, and financing. Even with copper prices tripling, the physical impossibility of rapidly opening new mines meant demand outpaced supply for nearly a decade — the hallmark of a commodity supercycle.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In a perfectly competitive market with free entry, a company that earns unusually high profit margins will tend to see those margins erode over time as new competitors enter and expand supply.",
          correct: true,
          explanation:
            "True. This is the core mechanism of competitive dynamics. High profits attract new entrants who expand supply and compete on price, pushing margins back toward the cost of capital. Durable above-average returns require structural barriers to entry — patents, network effects, scale advantages, switching costs, or regulatory licenses — that prevent new supply from flooding in.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 4: Asset Pricing Implications ────────────────────────────────────
    {
      id: "supply-demand-4",
      title: "Asset Pricing Implications",
      description:
        "How capital flows, supply shocks, and demand destruction drive investment returns",
      icon: "DollarSign",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Flows Drive Prices: The Passive Investing Effect",
          content:
            "**Capital flows** — money moving into or out of asset classes — are one of the most powerful near-term drivers of prices.\n\n**The passive investing wave:**\nPassive index funds now manage over $15 trillion in US equities alone. When savers contribute to a 401(k) that buys an S&P 500 index fund, the fund must buy every constituent stock proportionally — regardless of individual valuations. This **price-insensitive demand** systematically bids up prices of index members.\n\n**Consequences:**\n- Stocks added to major indices experience a 3–8% price jump on announcement\n- Stocks removed from indices fall sharply\n- The largest index members receive the most inflows (market-cap weighting) — creating a self-reinforcing price momentum\n\n**The liquidity premium:** When flows reverse — during risk-off episodes, redemptions, or margin calls — prices can fall faster than fundamentals justify. The 2020 March COVID crash saw even investment-grade bonds fall sharply as ETF investors sold, forcing forced selling of underlying holdings.\n\n**Investment insight:** Understanding *who* holds an asset and *why* they might sell is as important as understanding fundamental value. Flow analysis (monitoring fund flows, short interest, positioning) complements fundamental analysis.",
          highlight: ["capital flows", "passive investing", "index inclusion", "price-insensitive demand", "liquidity"],
        },
        {
          type: "teach",
          title: "Supply Shocks: The 1973 Oil Embargo",
          content:
            "A **supply shock** occurs when the available quantity of a good changes suddenly, forcing a rapid price adjustment to restore equilibrium.\n\n**The 1973 OPEC Oil Embargo:**\nIn October 1973, Arab OPEC members cut off oil exports to the US and other nations supporting Israel in the Yom Kippur War. Oil supply fell by roughly 7% of global supply — a seemingly small number. But because oil demand is highly inelastic, that 7% reduction produced a 400% price increase (from ~$3/barrel to ~$12/barrel).\n\n**Knock-on effects across asset markets:**\n- **Equities** fell sharply — S&P 500 dropped 48% from peak to trough (1973–1974)\n- **Inflation** surged — input costs rose across nearly every industry\n- **Growth** slowed — high energy costs reduced industrial output (stagflation)\n- **Bonds** lost value — inflation eroded fixed coupons\n\n**Modern parallels:**\n- 2022 Russia-Ukraine conflict → European natural gas supply shock → energy inflation\n- Taiwan Strait tensions → semiconductor supply risk\n- COVID → shipping container and port bottlenecks\n\n**Lesson:** Inelastic-demand commodities amplify supply shocks into price dislocations far beyond what the volume reduction would suggest.",
          highlight: ["supply shock", "OPEC", "1973 oil embargo", "stagflation", "inelastic demand", "inflation"],
        },
        {
          type: "teach",
          title: "Demand Destruction and Bottlenecks",
          content:
            "**Demand destruction** occurs when prices rise so high that buyers permanently reduce consumption, often by switching to substitutes or eliminating the need entirely.\n\n**Examples:**\n- **Oil at $140/barrel (2008)**: Consumers bought fuel-efficient cars, carpooled, and reduced driving. US oil demand fell and never fully recovered to 2007 levels even after prices fell.\n- **Natural gas prices (2022)**: European manufacturers shut down energy-intensive operations permanently. Some industries relocated.\n- **Crypto transaction fees (2021)**: Ethereum gas fees reached $200+ per transaction, destroying demand for small-value DeFi transactions and accelerating migration to Layer 2 solutions.\n\n**Supply bottlenecks in financial markets:**\nBottlenecks create persistent price premiums — the supply of a specific good is physically or contractually constrained even as demand surges:\n- **Short squeezes**: Heavy short interest creates a bottleneck in borrowed shares. GameStop 2021: forced short-covering drove price from $20 to $483 in days.\n- **IPO lockup expirations**: A surge in insider share supply at lockup expiration often depresses prices\n- **Convertible bond supply**: Hedge funds buying convertibles and delta-hedging by shorting stock create predictable selling pressure\n\n**Key principle:** Prices are set at the margin. The last buyer and last seller set the price for all units. Identifying where supply is structurally constrained — or where demand is about to be destroyed — is where asymmetric trades are found.",
          highlight: ["demand destruction", "bottleneck", "short squeeze", "margin buyer", "supply constraint"],
        },
        {
          type: "quiz-mc",
          question:
            "In October 1973, OPEC's oil embargo reduced global oil supply by approximately 7%. Yet oil prices rose nearly 400%. Which economic principle best explains this extreme price reaction?",
          options: [
            "Inelastic demand meant that even a small supply reduction required a massive price increase to bring quantity demanded down to the new supply level",
            "OPEC had a monopoly on global oil, allowing them to set any price they wished regardless of supply and demand",
            "The 400% price increase reflected consumers' willingness to substitute oil with cheaper energy alternatives",
            "Government price controls amplified the price increase by restricting market-based adjustments",
          ],
          correctIndex: 0,
          explanation:
            "When demand is highly inelastic (gasoline demand elasticity ≈ −0.2), the demand curve is nearly vertical. A rightward shift of the supply curve (supply reduction) intersects this near-vertical demand curve at a dramatically higher price. A 7% supply cut required roughly a 35% reduction in consumption to clear — and at an elasticity of −0.2, that requires prices to rise by 175% or more. The actual 400% reflects additional speculative and fear premiums.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "When passive index funds must buy a stock newly added to the S&P 500 regardless of its valuation, this represents price-sensitive demand that improves market efficiency.",
          correct: false,
          explanation:
            "False. Index fund buying is price-insensitive — funds must buy the stock in proportion to its market cap, regardless of whether it is cheap or expensive. This is the opposite of price-sensitive demand (which would only buy if the price is attractive). Price-insensitive demand can push prices above fundamental value and may reduce efficiency by rewarding index inclusion rather than fundamental merit.",
          difficulty: 2,
        },
      ],
    },
  ],
};
