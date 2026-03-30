import { Unit } from "./types";

export const UNIT_COMMODITIES_TRADING: Unit = {
  id: "commodities-trading",
  title: "Commodities Trading",
  description:
    "Master futures markets, energy trading, precious metals, agricultural commodities, and commodity portfolio strategies",
  icon: "BarChart2",
  color: "#D97706",
  lessons: [
    // ─── Lesson 1: Commodity Futures Basics ──────────────────────────────────────
    {
      id: "commodities-trading-1",
      title: "Commodity Futures Basics",
      description:
        "Spot vs futures pricing, cost of carry, contango, backwardation, roll yield, and contract mechanics",
      icon: "BarChart2",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Spot vs Futures Price & Cost of Carry",
          content:
            "**Spot price**: The price for immediate delivery of a commodity today.\n**Futures price**: The agreed price for delivery at a specific future date.\n\nThe relationship between the two is governed by the **cost of carry model**:\n\n**F = S × e^((r + u − y) × T)**\n\nWhere:\n- **S** = current spot price\n- **r** = risk-free interest rate (financing cost)\n- **u** = storage cost as a percentage of spot\n- **y** = convenience yield (the benefit of holding the physical commodity)\n- **T** = time to delivery in years\n\n**Convenience yield** reflects the value of having the physical commodity on hand. A refinery values having crude oil inventory — if supply tightens suddenly, they need it immediately. High convenience yield reduces futures prices relative to spot.\n\n**Example**: Oil spot = $80, r = 5%, u = 2%, y = 3%, T = 0.5 years\nF = $80 × e^((0.05 + 0.02 − 0.03) × 0.5) = $80 × e^(0.02) ≈ $81.61\n\nIf y is large (physical scarcity), futures can trade *below* spot — creating backwardation.",
          highlight: [
            "spot price",
            "futures price",
            "cost of carry",
            "convenience yield",
            "storage cost",
          ],
        },
        {
          type: "teach",
          title: "Contango, Backwardation & Roll Yield",
          content:
            "**Contango** — the normal state for most storable commodities:\n- Futures price > Spot price\n- The forward curve slopes upward\n- Driven by storage + financing costs exceeding convenience yield\n- **Negative roll yield**: You sell expiring contracts (lower price) and buy next contracts (higher price) → drag on returns\n- Example: Oil ETFs in contango consistently underperform spot oil prices over time\n\n**Backwardation** — common in energy and agricultural markets during supply crunches:\n- Futures price < Spot price\n- The forward curve slopes downward\n- Driven by tight near-term supply or high convenience yield\n- **Positive roll yield**: You sell expiring contracts (higher price) and buy next contracts (lower price) → structural return boost\n- Example: Natural gas during a cold snap — spot surges, nearby futures follow, far-dated futures stay lower\n\n**Commodity supercycles**: Multi-decade periods of sustained above-trend commodity prices, typically driven by synchronized global demand growth (industrialization) outpacing supply investment. The 2000s China supercycle saw copper rise from ~$0.70/lb to $4.50/lb.\n\n**Basis risk**: The risk that the spot-futures relationship changes unexpectedly. A hedger who uses futures may find that the futures contract doesn't perfectly offset spot price changes — this is basis risk.",
          highlight: [
            "contango",
            "backwardation",
            "roll yield",
            "basis risk",
            "supercycle",
            "forward curve",
          ],
        },
        {
          type: "teach",
          title: "Contract Specs, Delivery & Exchange Mechanics",
          content:
            "Commodity futures trade on regulated exchanges with standardized contract specifications:\n\n**Key exchanges**:\n- **NYMEX** (New York Mercantile Exchange): WTI crude oil, natural gas, gasoline, heating oil\n- **CME** (Chicago Mercantile Exchange): Livestock, dairy, lumber\n- **ICE** (Intercontinental Exchange): Brent crude, natural gas, sugar, coffee, cotton\n- **CBOT** (Chicago Board of Trade): Corn, wheat, soybeans, rice\n\n**Contract specs example — WTI Crude Oil (NYMEX)**:\n- **Size**: 1,000 barrels\n- **Price quote**: USD per barrel\n- **Tick size**: $0.01/barrel = $10/contract\n- **Delivery**: Cushing, Oklahoma (physical)\n- **Expiry**: 3rd business day before the 25th calendar day of the prior month\n\n**Physical delivery vs cash settlement**:\n- **Physical**: The commodity actually changes hands at expiry (crude oil, metals, grains)\n- **Cash settlement**: Settled in cash at the final settlement price (many financial commodity contracts, weather derivatives)\n\nMost traders **never take delivery** — they close or roll their position before expiry. Only producers and large commercial hedgers typically go through delivery.",
          highlight: [
            "NYMEX",
            "CME",
            "ICE",
            "CBOT",
            "physical delivery",
            "cash settlement",
            "contract specifications",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Using the cost of carry formula F = S × e^((r + u − y)T), which scenario would most likely result in futures trading BELOW the spot price (backwardation)?",
          options: [
            "High convenience yield (y) exceeds the sum of the risk-free rate (r) and storage cost (u)",
            "Storage costs (u) are very high relative to the risk-free rate",
            "The time to delivery (T) is very long, amplifying carrying costs",
            "The risk-free rate (r) rises significantly above storage costs",
          ],
          correctIndex: 0,
          explanation:
            "In the cost of carry formula F = S × e^((r + u − y)T), when the convenience yield (y) is large enough to exceed r + u, the exponent becomes negative, meaning futures trade below spot (backwardation). High convenience yield means the market values having the physical commodity now — e.g., during a supply shortage when a refinery needs crude immediately. Storage costs and financing costs push futures above spot; convenience yield pushes them below. When y > r + u, backwardation results.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Commodity ETFs that track futures contracts typically underperform the spot commodity price when the futures curve is in contango, due to negative roll yield.",
          correct: true,
          explanation:
            "True. When a futures curve is in contango (futures trade above spot), a commodity ETF must continuously sell expiring near-month contracts and buy more expensive next-month contracts. This 'rolling' process — selling low, buying high — creates a structural drag called negative roll yield. Over time, this can cause significant underperformance versus the spot commodity. The US Oil Fund (USO) dramatically underperformed spot WTI during the 2009–2010 period precisely because of severe contango in the crude oil curve.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Energy Markets ─────────────────────────────────────────────────
    {
      id: "commodities-trading-2",
      title: "Energy Markets",
      description:
        "Crude oil benchmarks, OPEC+ dynamics, shale economics, crack spreads, natural gas, and electricity markets",
      icon: "Zap",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Crude Oil Benchmarks & Global Pricing",
          content:
            "Not all crude oil is the same. Different grades trade at different prices based on quality and location.\n\n**The three major benchmarks**:\n\n**WTI (West Texas Intermediate)**:\n- Light, sweet crude (low sulfur, easy to refine)\n- Priced at Cushing, Oklahoma — a landlocked hub\n- Benchmark for US crude oil production\n- Typically trades at a slight discount to Brent\n\n**Brent Crude**:\n- North Sea blend, slightly heavier than WTI\n- Priced in London, globally traded\n- The international benchmark — 2/3 of globally traded crude is priced against Brent\n- Typically commands a premium due to better logistics and export access\n\n**Dubai/Oman**:\n- Benchmark for Middle Eastern crude sold to Asia\n- Heavier and more sour (higher sulfur) than WTI/Brent\n- Usually trades at a discount to Brent\n\n**The WTI-Brent Spread**:\n- Normally Brent trades $1–$3 above WTI\n- In 2011, the spread blew out to $25+ as Cushing storage filled up (WTI couldn't be easily exported)\n- The spread reflects US domestic supply/demand imbalances, pipeline capacity, and export policy",
          highlight: [
            "WTI",
            "Brent",
            "Dubai",
            "benchmark",
            "WTI-Brent spread",
            "sweet crude",
          ],
        },
        {
          type: "teach",
          title: "OPEC+, Shale Economics & Crack Spreads",
          content:
            "**OPEC+ production quotas**:\n- OPEC (13 members including Saudi Arabia, UAE, Iraq) + Russia and others = OPEC+\n- The group controls ~40% of global oil production\n- Sets production quotas to influence oil prices\n- **Compliance** is the critical variable — members often cheat by producing above quota\n- Saudi Arabia often plays 'swing producer' — cutting most to support prices\n\n**Shale oil economics**:\n- US shale (Permian Basin, Eagle Ford, Bakken) revolutionized global oil markets from 2010\n- **Breakeven cost**: $40–$60/barrel for most US shale plays\n- At these prices, US producers ramp up; below $40 they shut in wells\n- Shale creates a natural price ceiling — when oil rises above ~$70–80, US shale supply floods in\n- Much faster to bring online than conventional oil (weeks vs years)\n\n**Crack spread — refining margin**:\n- The profit a refiner makes from turning crude oil into products\n- **3-2-1 crack spread**: From 3 barrels of crude, produce 2 barrels of gasoline + 1 barrel of distillate (diesel/heating oil)\n- Crack spread = (2 × gasoline price + 1 × heating oil price) − (3 × crude price)\n- Refiners are long crack spreads; they hedge by selling gasoline/heating oil futures and buying crude futures",
          highlight: [
            "OPEC+",
            "production quotas",
            "compliance",
            "shale oil",
            "breakeven cost",
            "crack spread",
            "refining margin",
          ],
        },
        {
          type: "teach",
          title: "Natural Gas, LNG & Electricity Markets",
          content:
            "**Natural gas pricing**:\n- **Henry Hub** (Louisiana) is the US benchmark\n- Highly seasonal: spikes in winter (heating) and summer (cooling for power generation)\n- US gas prices historically much lower than European/Asian prices due to abundant supply\n- Storage report (EIA weekly): key weekly market-moving data point\n\n**LNG (Liquefied Natural Gas)**:\n- Gas cooled to −162°C for shipping as liquid on tankers\n- Allows gas to cross oceans (US exports to Europe and Asia)\n- **LNG creates global price linkage** — but still significant regional price differentials\n- The Russia-Ukraine war in 2022 caused European gas to trade 10× US prices\n\n**Electricity markets**:\n- Power is unique — cannot be stored at scale, must be consumed as generated\n- **Power Purchase Agreements (PPAs)**: Long-term contracts (10–20 years) between generators and utilities/corporates\n- **Capacity markets**: Pay generators to be available (maintain reserve capacity), not just for power generated\n- **Ancillary services**: Frequency regulation, spinning reserves — grid stability services\n- **Energy transition impact**: Renewables have near-zero marginal cost → pushes down wholesale electricity prices during peak solar/wind → creates volatility and challenges for baseload generators\n\n**Energy transition and fossil fuel demand curves**:\n- EVs reduce gasoline demand growth; heat pumps reduce heating fuel demand\n- Oil demand peak forecasts range from 2025 to 2035+\n- Near-term: underinvestment in fossil fuel supply (due to ESG pressure) + still-growing demand = price volatility risk",
          highlight: [
            "Henry Hub",
            "LNG",
            "electricity markets",
            "PPA",
            "capacity markets",
            "energy transition",
            "ancillary services",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A refiner calculates its 3-2-1 crack spread as follows: crude oil is $80/barrel, gasoline is $90/barrel, and heating oil is $95/barrel. What is the crack spread?",
          options: [
            "$31.67/barrel — (2×$90 + 1×$95) ÷ 3 − $80",
            "$25.00/barrel — average product price minus crude price",
            "$15.00/barrel — $95 heating oil minus $80 crude",
            "$10.00/barrel — the average spread across both products",
          ],
          correctIndex: 0,
          explanation:
            "The 3-2-1 crack spread formula is: [(2 × gasoline + 1 × heating oil) − (3 × crude)] ÷ 3. Here: [(2 × $90 + 1 × $95) − (3 × $80)] ÷ 3 = [($180 + $95) − $240] ÷ 3 = [$275 − $240] ÷ 3 = $35 ÷ 3 ≈ $11.67 per barrel. On a per-crude-barrel basis: $35 gross margin on 3 barrels = approximately $11.67/barrel. Answer A presents this correctly as a per-barrel figure of ~$11.67. Crack spreads are a key profitability metric for refineries and are actively traded as a hedge.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "US shale oil production acts as a natural price ceiling for crude oil because shale producers can rapidly bring new wells online when prices rise above their breakeven costs of approximately $40–60 per barrel.",
          correct: true,
          explanation:
            "True. US shale oil is unique among energy sources because of its short 'lead time' — a new shale well can be drilled and producing in weeks, compared to years for offshore or conventional fields. When crude oil prices rise above shale breakeven costs (~$40–60/barrel for most plays), shale producers aggressively ramp up drilling and production, adding supply that caps price rallies. This 'shale ceiling' fundamentally changed the oil price cycle, limiting sustained spikes above ~$80–100 that were common before the shale revolution.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Metals & Agriculture ──────────────────────────────────────────
    {
      id: "commodities-trading-3",
      title: "Metals & Agriculture",
      description:
        "Gold's unique role, base metals, agricultural seasonality, key reports, spread trading, and geopolitical risk premiums",
      icon: "Layers",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Gold, Silver & Precious Metals",
          content:
            "**Gold's dual role — commodity and financial asset**:\nUnlike oil or wheat, gold is almost never 'consumed' — most gold ever mined still exists in vaults and jewelry. This makes it unique: it is simultaneously a commodity, a currency, a store of value, and a hedge.\n\n**Gold price drivers**:\n- **Real interest rates**: The single most important driver. When real rates (nominal rate minus inflation) rise, gold falls (opportunity cost of holding non-yielding gold increases). When real rates fall, gold rises.\n- **USD strength**: Gold is priced in dollars — a stronger dollar makes gold more expensive for foreign buyers, suppressing demand\n- **Geopolitical uncertainty**: Gold as a safe haven during crises\n- **Central bank buying**: Major driver since 2010 — EM central banks diversifying reserves\n\n**Gold/Silver ratio**:\n- The number of ounces of silver needed to buy one ounce of gold\n- Historical average: ~60–70x; extreme readings reach 120x (2020 COVID panic)\n- High ratio = silver historically cheap relative to gold; many traders use it as a mean-reversion signal\n\n**Platinum and palladium**:\n- **Palladium**: Used primarily in catalytic converters for gasoline cars; Russia supplies ~40% of global palladium\n- **Platinum**: Used in diesel catalytic converters and hydrogen fuel cells\n- Both are highly supply-concentrated (South Africa + Russia) → geopolitical premium",
          highlight: [
            "gold",
            "real interest rates",
            "gold/silver ratio",
            "safe haven",
            "palladium",
            "central bank",
          ],
        },
        {
          type: "teach",
          title: "Base Metals & Agricultural Markets",
          content:
            "**Copper — the economic barometer**:\n- Called 'Dr. Copper' because its price is seen as a leading indicator of global economic health\n- Used in construction, electrical wiring, electronics, EVs (EVs use 3–4× more copper than ICE vehicles)\n- Chile and Peru supply ~40% of global copper; China consumes ~50%\n- Copper prices fell sharply ahead of the 2001 and 2008 recessions; rose sharply in 2021 post-COVID recovery\n\n**Agricultural seasonality and weather risk**:\n- Grain prices follow predictable seasonal patterns tied to planting/harvest cycles\n- **Corn**: Planted April–May (US Midwest), harvested September–October\n- **Soybeans**: New crop (November futures) vs old crop (July futures) spread reflects harvest expectations\n- Weather is the dominant short-term price driver: droughts (La Niña), floods, early frosts\n- The **WASDE report** (World Agricultural Supply and Demand Estimates), published monthly by USDA, is the single most market-moving event in agricultural commodities\n\n**Crush spread (soybean processing margin)**:\n- Soybeans are crushed into soybean meal (animal feed) and soybean oil (food/biodiesel)\n- **Crush spread** = value of products − cost of soybeans\n- Processors buy soybeans, sell meal and oil; crush spread reflects their profitability\n- Traded actively on CME; a key hedging tool for crushers like ADM and Bunge\n\n**Cotton and sugar trading mechanics**:\n- Cotton (ICE): Measured in cents/pound, contract = 50,000 lbs; driven by weather (US, India, China), fashion demand\n- Sugar (ICE No. 11): Raw cane sugar benchmark; Brazil is #1 producer; ethanol production competes for sugarcane",
          highlight: [
            "copper",
            "Dr. Copper",
            "WASDE",
            "seasonality",
            "crush spread",
            "cotton",
            "sugar",
          ],
        },
        {
          type: "teach",
          title: "Geopolitical Risk Premiums & Critical Minerals",
          content:
            "**Geopolitical risk in commodity markets**:\nCertain commodities command a persistent 'risk premium' because supply is concentrated in politically unstable regions or dominated by a single country.\n\n**Critical minerals — China's dominance**:\n- **Cobalt**: DRC supplies 70%+ of world supply; used in EV batteries\n- **Lithium**: Chile/Australia dominate; China controls most processing capacity\n- **Rare earth elements**: China produces ~60% and processes ~85% globally; essential for wind turbines, EV motors, defense systems\n- **Graphite**: China controls ~90% of natural graphite supply — key EV battery anode material\n\n**Energy metals geopolitics**:\n- Russia's 2022 invasion of Ukraine caused nickel prices to spike 250% in two days on the LME (London Metal Exchange) — Russia supplies ~11% of global refined nickel\n- The LME controversially cancelled those nickel trades, sparking regulatory debate\n\n**Supply chain from farm to delivery**:\n- Agricultural commodities travel a complex path: farm → elevator → barge/rail → export terminal → ship → processing\n- Each step has basis risk, logistics bottlenecks, and quality grading (e.g., corn graded No. 2 Yellow)\n- **Quality risk**: Soft commodities (coffee, cocoa) are graded by origin and quality — Brazilian Natural vs Colombian Washed coffees have different flavor/price profiles\n\n**Implications for traders**:\n- Geopolitical events can cause instantaneous, violent price dislocations in concentrated supply markets\n- Position sizing and stop-loss discipline are essential when trading commodities with geopolitical exposure",
          highlight: [
            "geopolitical risk premium",
            "critical minerals",
            "China dominance",
            "cobalt",
            "rare earths",
            "nickel",
            "supply chain",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Gold prices tend to rise when real interest rates fall. Which scenario would most likely be BEARISH for gold prices?",
          options: [
            "The Federal Reserve raises interest rates while inflation expectations remain flat, increasing real rates",
            "A major geopolitical conflict erupts, driving safe-haven demand",
            "Central banks in emerging markets increase their gold reserve purchases",
            "Inflation surges above nominal interest rates, pushing real rates deeply negative",
          ],
          correctIndex: 0,
          explanation:
            "Gold is most bearish when real interest rates (nominal rate minus expected inflation) rise. If the Federal Reserve raises nominal rates while inflation expectations remain unchanged, real rates increase — making gold less attractive because investors can now earn a real return from bonds and cash instead of holding non-yielding gold. Options B and C are bullish for gold (safe haven demand, central bank buying). Option D — inflation surging above nominal rates — creates negative real rates, which is historically very bullish for gold (as seen in 2020–2022).",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A grain trader is analyzing the US corn market. The USDA just released its monthly WASDE report showing a significant downward revision to corn yield estimates due to a summer drought in the Midwest. Corn futures for December delivery immediately jump 5% on the news.",
          question:
            "What does this scenario illustrate about agricultural commodity markets, and what risk would a corn processor (buyer) face going forward?",
          options: [
            "WASDE reports are key market-moving events; the corn processor faces higher input costs and should consider buying corn futures to hedge their purchase price",
            "The WASDE revision is a lagging indicator; the processor should wait for spot prices to confirm before hedging",
            "Drought conditions are fully priced into futures markets before WASDE; the 5% jump represents speculative excess",
            "Agricultural commodity markets are too volatile to hedge; processors should absorb price risk directly",
          ],
          correctIndex: 0,
          explanation:
            "The USDA WASDE (World Agricultural Supply and Demand Estimates) is the single most anticipated monthly report in agricultural commodities — supply/demand revisions frequently trigger immediate large price moves. The drought-driven yield reduction is a classic supply shock. A corn processor (like an ethanol plant or food manufacturer) who needs to buy corn faces higher input costs. The correct risk management response is to buy corn futures or call options to lock in their purchase price before prices rise further. This is textbook commodity hedging — using futures to protect against adverse price moves in your physical commodity exposure.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Trading Strategies ────────────────────────────────────────────
    {
      id: "commodities-trading-4",
      title: "Commodity Trading Strategies",
      description:
        "CTA trend following, carry trades, calendar spreads, fundamental vs technical analysis, index investing, and risk management",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "CTAs, Trend Following & Carry Strategies",
          content:
            "**Commodity Trading Advisors (CTAs)**:\n- Regulated fund managers who trade commodity futures (and increasingly financial futures)\n- Most use systematic, rules-based strategies rather than discretionary judgment\n- The dominant CTA strategy is **trend following** (also called managed futures)\n\n**Trend following in commodities**:\n- Commodities exhibit stronger, longer trends than equities due to supply/demand imbalances that take time to resolve\n- A crop failure doesn't fix itself in a week — it may take a full growing season\n- CTAs go long commodities in uptrends, short in downtrends\n- Use moving average crossovers, breakout systems, or momentum signals\n- **Diversification benefit**: CTAs often perform well during equity bear markets (e.g., +25% in 2022 while stocks fell 20%)\n\n**Carry trade in commodities**:\n- **Long backwardation, short contango** strategy\n- Go long commodities with backwardated curves (positive roll yield) and short those in deep contango\n- Captures the structural roll yield without requiring a directional view on price\n- Example: Long natural gas (frequent backwardation) / Short oil ETF (often in contango)\n\n**Calendar spread trading**:\n- Trading the price difference between two expiry months of the same commodity\n- Less capital intensive; lower margin than outright futures\n- **Bull spread**: Long near-month, short far-month (profits when backwardation increases)\n- **Bear spread**: Short near-month, long far-month (profits when contango deepens)\n- Calendar spreads are used by producers, consumers, and speculators to express views on near-term vs deferred supply/demand",
          highlight: [
            "CTA",
            "trend following",
            "managed futures",
            "carry trade",
            "backwardation",
            "calendar spread",
            "roll yield",
          ],
        },
        {
          type: "teach",
          title: "Fundamental vs Technical Analysis in Commodities",
          content:
            "**Fundamental analysis — supply/demand framework**:\n\nCommodity fundamentals are built around a simple balance sheet:\n\n**Supply** (production + beginning stocks + imports)\n− **Demand** (consumption + exports)\n= **Ending stocks (carryout)**\n\nThe **stocks-to-use ratio** (ending stocks ÷ annual demand) is the key metric:\n- High stocks-to-use → ample supply → lower prices\n- Low stocks-to-use → tight supply → higher prices, high volatility\n\nKey data sources: USDA WASDE (agriculture), EIA Weekly Petroleum Report (oil/gas), LME inventory data (metals), CFTC Commitments of Traders (COT) report\n\n**Technical analysis in commodities**:\n- Works well because commodities attract systematic traders and trend followers who create self-reinforcing momentum\n- **Key levels**: Monthly and quarterly pivot points, multi-year highs/lows are significant\n- **Seasonal charts**: Average price behavior by calendar month over 5/10/15 years\n- **COT positioning**: Commercial (hedger) vs non-commercial (speculator) positioning often used as a contrarian indicator — when speculators are extremely long, it may signal an exhausted uptrend\n\n**Commodity index investing**:\n- **S&P GSCI** (Goldman Sachs Commodity Index): Energy-heavy (~60% energy)\n- **Bloomberg Commodity Index (BCOM)**: More diversified, max 33% in any sector\n- **Rogers International Commodity Index (RICI)**: Broadest coverage, includes lesser-traded commodities\n- All suffer from negative roll yield drag in contango markets — long-term index returns significantly lag spot commodity price returns",
          highlight: [
            "stocks-to-use ratio",
            "WASDE",
            "COT report",
            "seasonal charts",
            "GSCI",
            "BCOM",
            "fundamental analysis",
          ],
        },
        {
          type: "teach",
          title: "Risk Management & Trading House Business Model",
          content:
            "**VaR limitations for commodity portfolios**:\n- Value at Risk (VaR) assumes returns are normally distributed — commodity returns are **fat-tailed**\n- Commodity markets experience price gaps, circuit breakers, and extreme moves (nickel +250% in 2 days; natural gas +500% in months)\n- 99% VaR dramatically underestimates tail risk in commodities\n- Better approaches: **Expected Shortfall (CVaR)**, scenario analysis, stress tests based on historical crises\n\n**Position sizing in commodities**:\n- Commodities have high daily volatility (oil: 2–4% daily, natural gas: 4–8%)\n- Kelly Criterion or fixed fractional sizing with commodity-specific volatility adjustments\n- Correlation between commodities changes dramatically during crises — don't assume diversification holds\n\n**Trading house business model — Glencore, Vitol, Trafigura**:\n- These are the world's largest physical commodity traders\n- Revenue model: Buy physical commodities (mine/purchase), transport, store, process, and sell at a margin\n- Profit from **arbitrage**: Location (buy cheap in one region, sell expensive in another), time (store when contango > storage cost), quality (blend, upgrade, or process)\n- Own physical assets: mines, storage terminals, refineries, tanker fleets\n- Hedge price risk with futures, but keep the spread/arbitrage profit\n- **Glencore**: ~$220B revenue, also a major mining company\n- **Vitol**: Largest independent oil trader (~$500B in revenues in peak years)\n- **Trafigura**: Specializes in metals, oil products, bulk commodities\n- These firms profit whether prices go up or down — they trade the **spread**, not the direction",
          highlight: [
            "VaR limitations",
            "fat-tailed",
            "Expected Shortfall",
            "trading house",
            "Glencore",
            "Vitol",
            "Trafigura",
            "arbitrage",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A commodity trader implements a carry strategy by going long crude oil contracts in backwardation and short natural gas contracts in deep contango. What is the primary source of return in this strategy?",
          options: [
            "Roll yield — capturing the positive roll from backwardated long positions and the cost drag on the contango short positions",
            "Directional price appreciation — betting that crude oil rises faster than natural gas falls",
            "Correlation divergence — profiting from crude and natural gas prices moving in opposite directions",
            "Basis compression — both commodities converging toward a common equilibrium price",
          ],
          correctIndex: 0,
          explanation:
            "The commodity carry strategy specifically targets roll yield — the return embedded in the shape of the futures curve, independent of spot price direction. In backwardation, a long position earns positive roll yield (selling the expiring contract at a higher price, buying the next contract cheaper). In contango, a short position earns return because the shorted contract rolls down the upward-sloping curve toward spot. The strategy doesn't require accurate price direction forecasting — it harvests the structural return from curve shape. However, curve shapes can shift suddenly, especially for energy commodities, making this strategy far from riskless.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Physical commodity trading houses like Glencore and Vitol primarily profit from correctly predicting whether commodity prices will rise or fall, making them essentially large directional speculators.",
          correct: false,
          explanation:
            "False. Physical commodity trading houses primarily profit from arbitrage — exploiting price differences across geography, time, and quality — rather than taking large directional price bets. They buy where prices are cheap and sell where they are high (location arbitrage), store commodities when contango exceeds storage costs (time arbitrage), and blend or process to upgrade quality (quality arbitrage). They typically hedge their price exposure with futures to isolate the spread or arbitrage profit. Their business model is more akin to logistics and market-making than speculative directional trading. Of course they take some directional risk, but that is not their primary profit driver.",
          difficulty: 2,
        },
      ],
    },
  ],
};
