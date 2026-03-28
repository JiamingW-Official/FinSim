import type { Unit } from "./types";

export const UNIT_COMMODITY_TRADING: Unit = {
  id: "commodity-trading",
  title: "Commodity Trading Deep Dive",
  description:
    "Spot vs futures mechanics, supply/demand analysis, futures curve structure, trading fundamentals, commodity cycles, and investment approaches",
  icon: "TrendingUp",
  color: "#d97706",
  lessons: [
    // ─── Lesson 1: Commodity Market Structure ────────────────────────────────────
    {
      id: "commodity-trading-1",
      title: "Commodity Market Structure",
      description:
        "Spot vs futures, physical vs paper trading, major exchanges, warehouse receipts, and delivery specifications",
      icon: "Building2",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Spot vs Futures: Two Ways to Trade Commodities",
          content:
            "Commodity markets operate on two parallel tracks that serve very different participants.\n\n**Spot (Cash) Markets**\nThe spot market is for immediate delivery of the physical commodity. A food company buying wheat today for delivery to its mill is transacting in the spot market. Spot prices reflect current supply and demand conditions.\n\n**Futures Markets**\nFutures contracts lock in a price today for delivery at a specified future date. They serve two primary user groups:\n- **Hedgers** (commercials): Producers and consumers who use futures to lock in prices and eliminate price risk. A corn farmer sells futures in spring to guarantee a harvest price; an airline buys jet fuel futures to cap its fuel costs.\n- **Speculators** (non-commercials): Traders and funds who take price risk in exchange for potential profit. They rarely take physical delivery — they close positions before expiration.\n\n**Physical vs Paper Trading**\nPhysical trading involves actual commodity flows — barges of crude oil, railcars of grain, copper cathode in warehouses. Paper trading is purely financial — buying and selling futures contracts, swaps, and options without ever intending to take physical delivery.\n\nThe ratio of paper to physical trading is enormous. For every barrel of oil physically produced globally, many multiples of that volume trade as paper contracts daily. This liquidity depth is what makes futures markets efficient price discovery mechanisms.",
          highlight: ["spot market", "futures markets", "hedgers", "speculators", "physical trading", "paper trading"],
        },
        {
          type: "teach",
          title: "Major Commodity Exchanges",
          content:
            "Different commodities trade on specialized exchanges that set contract specifications and guarantee settlement.\n\n**CME Group (Chicago Mercantile Exchange)**\nThe world's largest futures exchange by volume. Key contracts:\n- **CBOT** (Chicago Board of Trade): Corn, wheat, soybeans, soybean oil/meal\n- **NYMEX** (New York Mercantile Exchange): WTI crude oil, natural gas, gasoline, heating oil\n- **COMEX**: Gold, silver, copper\n\n**ICE (Intercontinental Exchange)**\n- Brent crude oil (the global benchmark)\n- Natural gas (UK/European markets)\n- Sugar #11, coffee, cotton, cocoa, orange juice (the \"softs\")\n\n**LME (London Metal Exchange)**\n- Base metals: aluminum, copper, zinc, nickel, lead, tin\n- Unique features: daily prompt dates (not just monthly), ring trading, 3-month forward as the benchmark\n- Warehouse network: LME-licensed warehouses worldwide; physical delivery is a genuine mechanism\n\n**DCE (Dalian Commodity Exchange) and SHFE (Shanghai Futures Exchange)**\nChina's commodity exchanges have grown to rival Western exchanges in iron ore, coking coal, and certain metals — reflecting China's role as the world's largest commodity consumer.\n\nEach exchange sets **contract specifications**: the grade of commodity acceptable for delivery, the delivery location, contract size, minimum price increment (tick), and trading hours.",
          highlight: ["CME Group", "CBOT", "NYMEX", "COMEX", "ICE", "LME", "contract specifications"],
        },
        {
          type: "teach",
          title: "Warehouse Receipts and Delivery Specifications",
          content:
            "The bridge between paper and physical markets is the **warehouse receipt** system.\n\n**Warehouse Receipts**\nA warehouse receipt is a document issued by an approved storage facility (a licensed warehouse) certifying that a specific quantity and grade of a commodity is stored there. These receipts are negotiable instruments — they can be transferred between parties and used to settle futures contracts.\n\nWhen a futures contract reaches expiration and a short holder (seller) wants to make physical delivery, they submit a warehouse receipt. The long holder (buyer) who wishes to take delivery receives the receipt and can then claim the physical commodity.\n\n**Delivery Specifications — Why They Matter**\nNot every bushel of corn or barrel of oil is identical. Futures contracts specify:\n- **Grade/Quality**: WTI crude must meet specific API gravity and sulfur content specs. CBOT corn must be No. 2 Yellow corn or better.\n- **Delivery location**: WTI crude delivers at Cushing, Oklahoma. This creates the famous Cushing storage capacity constraint. Brent crude uses a different North Sea blend with offshore loading.\n- **Delivery period**: A window within the expiration month when delivery can occur\n- **Par, premium, and discount grades**: Some contracts allow delivery of slightly different grades at a price adjustment. Delivering higher quality earns a premium; lower quality incurs a discount.\n\n**Convergence**: As a futures contract approaches expiration, its price must converge toward the spot price. If futures are significantly above spot at expiration, arbitrageurs will buy spot, store it, and deliver it via warehouse receipt — pushing prices together.",
          highlight: ["warehouse receipt", "delivery specifications", "grade", "convergence", "Cushing", "arbitrage"],
        },
        {
          type: "quiz-mc",
          question:
            "A grain elevator holds wheat that meets CBOT delivery specifications. It stores this wheat and receives a document from the exchange-approved warehouse certifying ownership of a specific lot. What is this document called?",
          options: [
            "A warehouse receipt — a negotiable instrument that can be used to settle futures contracts via physical delivery",
            "A spot contract — an agreement to deliver wheat immediately at today's price",
            "A margin certificate — proof that the grain elevator has posted sufficient collateral",
            "A basis agreement — a document fixing the difference between spot and futures prices",
          ],
          correctIndex: 0,
          explanation:
            "The document is a warehouse receipt. Issued by an exchange-approved storage facility, it certifies that a specific quantity and grade of commodity is held there. Warehouse receipts are negotiable instruments — they can be transferred between parties and used by futures contract holders to make or take physical delivery. The warehouse receipt system is the critical link between paper futures markets and physical commodity flows, ensuring that futures prices remain anchored to real-world supply and demand.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The LME (London Metal Exchange) is unique among major commodity exchanges in that it uses a 3-month forward contract as its benchmark price rather than the nearest-month futures contract.",
          correct: true,
          explanation:
            "True. The LME uses a 3-month forward (3M) contract as its benchmark, which differs from CME/NYMEX practice where the nearest-to-expiry contract is the most active. The LME also features daily prompt dates — contracts can settle on any business day — rather than just monthly expiries. This structure reflects the LME's deep ties to the physical metals industry, where contracts are often structured to align with shipment timelines. The LME also maintains a global network of licensed warehouses where physical delivery of metals can genuinely occur.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A WTI crude oil futures contract is expiring. The current spot price at Cushing, Oklahoma is $82.50/barrel. The expiring futures contract is trading at $84.20/barrel. A trader sees this discrepancy.",
          question: "What arbitrage action would drive futures prices toward the spot price, and what does this process demonstrate?",
          options: [
            "Buy physical crude at $82.50, arrange delivery via warehouse receipt against the short futures position at $84.20 — locking in $1.70/barrel profit and driving futures prices down toward spot",
            "Buy the futures contract at $84.20 and simultaneously sell spot crude at $82.50 — the $1.70 difference is pure profit",
            "Short the futures contract and wait for it to expire worthless — the discrepancy always resolves itself without action",
            "Report the discrepancy to the exchange regulators — price differences between spot and futures are not permitted",
          ],
          correctIndex: 0,
          explanation:
            "When futures trade significantly above spot near expiration, a cash-and-carry arbitrage closes the gap: buy physical crude at spot ($82.50), deliver it via warehouse receipt against the short futures position ($84.20), and capture the $1.70 spread (minus transport/storage costs). This action adds supply to the futures delivery point (Cushing), pressing futures prices downward toward spot. This convergence mechanism is fundamental to futures markets — it ensures that futures prices remain economically connected to physical commodity prices and that the futures market functions as a reliable hedging tool.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Supply & Demand Analysis ──────────────────────────────────────
    {
      id: "commodity-trading-2",
      title: "Supply & Demand Analysis",
      description:
        "WASDE crop reports, EIA inventory data, production statistics, demand elasticity, and stockpile-to-usage ratios",
      icon: "BarChart2",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Key Government Data Reports",
          content:
            "Commodity prices move on supply/demand data. Knowing which reports matter — and when they release — is essential for commodity traders.\n\n**WASDE Report (World Agricultural Supply and Demand Estimates)**\nPublished monthly by the USDA on the second Friday of each month. The single most important report for agricultural commodities.\n- Contains global supply/demand balances for corn, wheat, soybeans, cotton, sugar, and other crops\n- Includes US and world production estimates, ending stocks, export projections\n- Market-moving: a surprise 200-million-bushel revision to US corn ending stocks can move corn futures by 3–5% in minutes\n\n**EIA Petroleum Reports (US Energy Information Administration)**\n- **Weekly Petroleum Status Report**: Released every Wednesday at 10:30 AM ET. Shows US crude oil inventories, gasoline stocks, distillate (diesel/heating oil) stocks, refinery utilization rates, and import/export flows. One of the most watched weekly economic releases.\n- **Short-Term Energy Outlook (STEO)**: Monthly; contains supply/demand forecasts for oil and gas.\n\n**DOE/EIA Natural Gas Storage Report**\nReleased every Thursday at 10:30 AM ET. Weekly natural gas inventory levels in underground storage, expressed in billions of cubic feet (Bcf). Compares to the 5-year average to show whether supply is tight or ample.\n\n**Other critical releases**:\n- **OPEC Monthly Oil Market Report**: OPEC's view on supply, demand, and member country compliance\n- **IEA Oil Market Report**: International Energy Agency's independent analysis\n- **USDA Crop Progress report** (weekly, April–November): Percentage of crop planted, emerged, silking, harvested; condition ratings (Excellent/Good/Fair/Poor)",
          highlight: ["WASDE", "EIA", "DOE", "Weekly Petroleum Status Report", "Natural Gas Storage", "USDA Crop Progress", "ending stocks"],
        },
        {
          type: "teach",
          title: "Inventory Levels and the Stockpile-to-Usage Ratio",
          content:
            "The most important structural variable in commodity markets is **how much supply exists relative to how much is being consumed**.\n\n**Ending Stocks / Stocks-to-Use (S/U) Ratio**\nEnding stocks are the inventory remaining at the end of a marketing year (after production and imports, minus consumption and exports).\n\nStocks-to-Use = Ending Stocks / Annual Consumption\n\nA low S/U ratio signals tight supplies and is bullish for prices; a high S/U ratio signals ample supplies and is bearish.\n\n**Agriculture benchmarks:**\n- Corn S/U below 10% = historically bullish (prices tend to spike)\n- Corn S/U above 20% = bearish (grain is cheap, prices depressed)\n- Global wheat S/U below 30% has historically been associated with food security concerns\n\n**Energy inventory levels:**\nFor crude oil, the relevant comparison is inventory vs the 5-year seasonal average (the \"5-year range\" displayed on EIA charts). Crude stocks 50 million barrels above the 5-year average is bearish; stocks at the bottom of the 5-year range is bullish.\n\n**The Days-of-Supply metric:**\nAnother way to express inventories: how many days of consumption the current stockpile represents.\n- US crude oil: typically 20–30 days of forward supply\n- Natural gas: measured in Bcf; winter begins with storage typically around 3,800–3,900 Bcf\n\n**Inventory surprises move markets**: If the EIA reports a 5-million-barrel crude draw when the market expected a 1-million-barrel build, that is a 6-million-barrel bullish surprise — and oil prices typically rally sharply in the minutes after the 10:30 AM release.",
          highlight: ["ending stocks", "stocks-to-use ratio", "5-year average", "inventory surprise", "days-of-supply"],
        },
        {
          type: "teach",
          title: "Demand Elasticity in Commodity Markets",
          content:
            "**Price elasticity of demand** measures how responsive consumption is to price changes.\n\n**Inelastic demand** (|elasticity| < 1): A large price change causes only a small consumption change.\n- **Short-run energy demand** is highly inelastic. When gasoline prices spike from $3 to $5/gallon, most Americans still drive to work. Demand falls modestly.\n- **Food grains** are inelastic in developing countries where wheat/corn is a staple — people cannot easily substitute\n- Inelasticity means small supply shortfalls cause large price spikes\n\n**Elastic demand** (|elasticity| > 1): Price changes cause proportionally larger consumption changes.\n- **Long-run energy demand** is more elastic — high prices incentivize consumers to buy fuel-efficient cars, insulate homes, and switch to alternatives\n- **Industrial metals** in certain uses can be substituted (aluminum for copper in some wiring applications)\n\n**Demand destruction**: When prices rise so high that consumers permanently reduce usage or switch to alternatives. This is a critical concept in commodity cycles.\n- Example: 2008 oil spike to $147/barrel accelerated the adoption of hybrid and electric vehicles, permanently reducing oil intensity of GDP\n- Natural gas at $10/MMBtu in winter 2022–2023 caused European industrial plants to shut down or switch fuels\n\n**China's role**: China represents ~50–55% of global demand for many industrial metals (copper, iron ore, aluminum). A 1% change in Chinese steel production growth has an outsized impact on iron ore and coking coal prices. Monitoring Chinese PMI, real estate starts, and infrastructure spending is essential for metals traders.",
          highlight: ["price elasticity", "inelastic demand", "demand destruction", "substitution", "China demand"],
        },
        {
          type: "quiz-mc",
          question:
            "The USDA's August WASDE report shows US corn ending stocks revised from 1.8 billion bushels to 1.2 billion bushels (a 600-million-bushel reduction). The stocks-to-use ratio falls from 14% to 9.5%. What is the likely immediate market reaction?",
          options: [
            "Corn futures prices rally sharply — lower ending stocks signal a tighter supply balance and a lower stocks-to-use ratio below 10% is historically bullish",
            "Corn futures prices fall — lower ending stocks mean less corn is available, reducing demand from end users",
            "Corn futures are unaffected — the WASDE is always priced in advance by professional traders",
            "Corn futures prices fall because a 9.5% S/U ratio signals that farmers will plant more corn next year, increasing future supply",
          ],
          correctIndex: 0,
          explanation:
            "A sharp downward revision to ending stocks is bullish. The stocks-to-use ratio falling from 14% to 9.5% — below the historically bullish 10% threshold — signals tight supply: for every bushel consumed, there is less cushion in storage. This surprises the market (which priced in the prior 14% estimate) and causes corn futures to rally sharply. The WASDE is the most important report for grain markets precisely because these supply/demand revisions cannot be fully anticipated; actual yield data from satellite imagery and farmer surveys often surprises even sophisticated forecasters.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In the short run, crude oil demand is relatively inelastic, meaning that a 30% increase in oil prices typically causes only a small percentage decline in consumption over the following few months.",
          correct: true,
          explanation:
            "True. Short-run crude oil demand is highly inelastic because consumers and businesses cannot quickly change their fuel-consuming capital stock (cars, trucks, aircraft, industrial equipment). A person cannot sell their gasoline-powered car and buy a hybrid overnight because gas prices spiked. Over months, driving habits adjust modestly; over years, more significant substitution occurs. This inelasticity is why oil supply disruptions cause dramatic price spikes: even a 1–2 million barrel/day supply shortfall (about 1–2% of global supply) can cause 30–50% price increases because demand cannot adjust quickly enough to rebalance the market.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Futures Curve Analysis ────────────────────────────────────────
    {
      id: "commodity-trading-3",
      title: "Futures Curve Analysis",
      description:
        "Contango vs backwardation causes, convenience yield, cost of carry, storage economics, and roll return",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The Futures Curve: Shape and Meaning",
          content:
            "The **futures curve** (also called the forward curve or term structure) is a plot of futures prices across successive expiration months. Its shape contains critical information about current market conditions.\n\n**Reading the curve:**\n- **X-axis**: Contract expiration date (e.g., May, June, July, December, March of next year...)\n- **Y-axis**: Futures price for that expiration\n\n**Contango** (upward-sloping curve):\n- Each successive contract is priced higher than the previous one\n- Example: Oil — May $80, June $80.80, July $81.60, December $84\n- The \"normal\" structure for storable commodities with carrying costs\n\n**Backwardation** (downward-sloping curve):\n- Near-term contracts are priced higher than distant contracts\n- Example: Natural gas in a winter cold snap — Jan $8, Feb $7.50, March $6.50, May $4.20\n- Signals immediate physical scarcity; the market is paying a premium to get the commodity NOW\n\n**Mixed/Humped curves**: Real-world curves often have complex shapes. Oil might be in near-term backwardation (tight current supply) but contango in the 2-year+ range (long-term market expects adequate supply).\n\n**Flat curve**: Near-term and long-term prices nearly equal — market sees balanced supply/demand with no major expectations either way.\n\nThe curve shape changes continuously as new supply/demand information arrives. Watching the curve shift is itself a trading signal — a curve rapidly steepening into backwardation signals worsening near-term supply.",
          highlight: ["futures curve", "forward curve", "contango", "backwardation", "term structure"],
        },
        {
          type: "teach",
          title: "Cost of Carry and Convenience Yield",
          content:
            "Two forces determine the relationship between spot and futures prices:\n\n**Cost of Carry**\nThe theoretical futures price is:\n\nF = S × e^(r+u)T\n\nWhere: S = spot price, r = risk-free rate, u = storage cost rate, T = time to expiration\n\nOr in simpler terms:\nFutures Price ≈ Spot + Financing Cost + Storage Cost + Insurance\n\nFor a commodity with $80 spot price, 5% annual financing, and 3% annual storage:\n- 6-month futures: $80 × (1 + 0.04) = ~$83.20\n\nThis is the **full carry** — the maximum premium futures should trade at over spot.\n\n**Storage Economics**:\nStorage costs vary dramatically by commodity:\n- **Grain**: $0.03–0.06/bushel/month (elevators, drying costs)\n- **Crude oil**: $0.30–0.60/barrel/month (tank farm lease costs)\n- **Natural gas**: Cannot be stored cheaply — underground storage is limited, creating dramatic seasonal price swings\n- **Gold**: Very low storage costs (~0.1%/year in secure vaults) — gold futures closely follow cost-of-carry model\n\n**Convenience Yield**\nConvenience yield is the implicit value of having the physical commodity available immediately. It captures benefits that a futures contract holder does NOT receive:\n- A refinery values having crude oil in its tanks to maintain continuous operations\n- A flour mill values having wheat inventory to fulfill customer orders without delivery risk\n- A utility values having natural gas in pipeline storage to respond to demand spikes\n\nThe full pricing relationship:\nF = S × e^(r+u-c)T where c = convenience yield\n\nWhen convenience yield is HIGH (tight physical supply): Spot prices are bid up, futures fall behind → backwardation\nWhen convenience yield is LOW (ample supply): Cost of carry dominates → contango",
          highlight: ["cost of carry", "convenience yield", "full carry", "storage costs", "financing cost"],
        },
        {
          type: "teach",
          title: "Roll Return: The Hidden Driver of Commodity Returns",
          content:
            "Commodity futures investors must **roll** their positions — selling expiring contracts and buying the next expiration — to maintain ongoing exposure. The roll has a return impact that can be large.\n\n**Negative Roll Yield (Contango)**\nIn contango, each successive month is more expensive:\n- You sell the expiring May contract at $80\n- You buy the June contract at $80.80\n- Net cost of rolling: -$0.80/barrel = negative roll yield\n\nOver time, this drag compounds. A commodity ETF tracking oil in deep contango might lose 20–30% per year from roll costs alone, even if oil spot prices are flat.\n\n**Positive Roll Yield (Backwardation)**\nIn backwardation, each successive month is cheaper:\n- You sell the expiring May contract at $80\n- You buy the June contract at $78.50\n- Net gain from rolling: +$1.50/barrel = positive roll yield\n\nInvestors in backwardated markets earn a return even if spot prices remain unchanged. This is one reason commodity index investors prefer markets in backwardation.\n\n**Total Commodity Return = Spot Return + Roll Return + Collateral Return**\n- Spot return: Change in the spot price\n- Roll return: Gain/loss from rolling contracts (positive in backwardation, negative in contango)\n- Collateral return: Interest earned on the margin/collateral (typically invested in T-bills)\n\n**Practical implications for investors**:\n- Many commodity ETFs struggle in contango markets — they consistently buy high (far month) and sell low (near month)\n- Some ETFs use strategies to minimize roll costs: optimal roll (choosing the month with best roll characteristics), dynamic roll, or holding physical commodity\n- Curve-aware traders often position in specific calendar spreads rather than outright positions to express roll yield views",
          highlight: ["roll return", "roll yield", "negative roll yield", "positive roll yield", "total commodity return", "calendar spread"],
        },
        {
          type: "quiz-mc",
          question:
            "A commodity ETF holds crude oil futures. The oil market is in steep contango: the near-month futures price is $78 and the next month's futures is $81. After rolling (selling near-month, buying next-month), what happens to the fund's effective exposure?",
          options: [
            "The roll costs the fund $3/barrel — it sells at $78 and buys at $81, creating negative roll yield that erodes returns even if spot prices stay flat",
            "The roll earns the fund $3/barrel — it buys low and sells high, generating positive roll yield",
            "The roll has no return impact — futures contracts always trade at the same price as the one they replace",
            "The fund avoids the roll by holding contracts through expiration and taking physical delivery of crude oil",
          ],
          correctIndex: 0,
          explanation:
            "In contango, rolling costs money. The fund sells its expiring near-month contract at $78 and must buy the next-month contract at $81 to maintain its oil exposure — a $3/barrel loss on the roll. This negative roll yield is a persistent drag on commodity ETF returns in contango markets. Over time, this can be enormous: in periods of deep crude oil contango (like 2009, 2015–2016, and 2020), commodity ETFs significantly underperformed the spot price because of continuous roll losses. This is why long-term commodity ETF investors often earn much less than the change in spot prices implies.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "When convenience yield is high (for example, when a refinery strongly values having crude oil physically available in its tanks), this pushes crude oil futures into backwardation because the spot commodity is worth more than a promise of future delivery.",
          correct: true,
          explanation:
            "True. Convenience yield represents the value of having the physical commodity immediately available versus holding a paper futures contract. When convenience yield is high — during supply disruptions, pipeline outages, or winter cold snaps for natural gas — the spot price gets bid up above what the futures price math of cost-of-carry would predict. The formula is: F = S × e^(r+u-c)T, where c is convenience yield. When c > r+u, futures trade BELOW spot, which is backwardation. High convenience yield is the primary driver of backwardation for industrial commodities.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Trading Fundamentals ──────────────────────────────────────────
    {
      id: "commodity-trading-4",
      title: "Trading Fundamentals",
      description:
        "COT report interpretation, seasonal patterns, weather trading, political supply disruptions, and demand destruction",
      icon: "Activity",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "COT Report: Tracking Market Participants",
          content:
            "The **Commitments of Traders (COT) report** is published every Friday by the CFTC (Commodity Futures Trading Commission). It reveals the net positions of different categories of traders — giving insight into who is positioned how in any commodity market.\n\n**Three major categories:**\n\n**1. Commercial Traders (Hedgers)**\nCompanies with commercial interest in the commodity: producers, processors, merchants, swap dealers. Their positions are related to their physical business (e.g., an oil company shorting futures to hedge its production). Commercials are typically viewed as \"smart money\" with superior knowledge of fundamental conditions.\n\n**2. Non-Commercial Traders (Large Speculators)**\nHedge funds, CTAs (commodity trading advisors), and other large non-commercial participants who trade purely for profit. Their positioning is closely watched — when large speculators become extremely net long, it can signal an overcrowded trade vulnerable to reversal.\n\n**3. Non-Reportable (Small Speculators)**\nTraders below the CFTC's reporting threshold. Generally less informative.\n\n**How traders use COT data:**\n- **Extreme positioning = contrarian signal**: When managed money (hedge funds) is at a historically extreme net long position, many potential buyers have already bought — subsequent rallies may be limited, and the market is vulnerable to a sharp reversal if sentiment shifts\n- **Commercial short buildup**: Heavy commercial shorting often signals that producers are locking in high prices — itself a sign that prices may be elevated\n- **Net position changes week-over-week**: Rapid position building or liquidation signals growing or fading conviction\n\nCOT data is released with a 3-day lag (positions as of Tuesday, reported Friday), making it a medium-term positioning tool rather than a short-term timing device.",
          highlight: ["COT report", "CFTC", "commercial traders", "non-commercial traders", "managed money", "extreme positioning", "contrarian signal"],
        },
        {
          type: "teach",
          title: "Seasonal Patterns and Weather Trading",
          content:
            "Commodities are produced and consumed in cycles tied to seasons — creating recurring price patterns that sophisticated traders exploit.\n\n**Agricultural Seasonality**\n- **Corn (Northern Hemisphere)**: Planted April–May; pollination stress period July–August (the most weather-sensitive period); harvest September–October (prices often weakest post-harvest due to supply influx); prices often strongest in spring before planting intentions are clear\n- **Soybeans**: Similar to corn; South American harvest (January–March) provides a second seasonal supply event\n- **Wheat**: Multiple crops with different seasonality; winter wheat harvested June–July; spring wheat August–September\n- **Coffee**: Brazilian harvest June–September; frost risk in Minas Gerais June–August drives price spikes\n\n**Energy Seasonality**\n- **Crude oil**: Demand peaks in summer (driving season, gasoline) and winter heating demand\n- **Natural gas**: Storage injection season (April–October); withdrawal season (November–March). Prices typically lowest in shoulder months (April, October) when neither heating nor cooling demand is intense\n- **Heating oil**: Demand strongest October–February; refiners build distillate stocks ahead of winter\n\n**Weather Trading**\nWeather is the dominant short-term price driver for agricultural commodities. Traders monitor:\n- **NOAA forecasts**: Temperature and precipitation outlooks (6–14 day forecasts)\n- **La Niña/El Niño**: Multi-year climate patterns affecting rainfall in South America and Southeast Asia\n- **Brazilian drought**: Brazil is the world's largest soybean and coffee exporter; dry weather there causes global price spikes\n- **Black Sea wheat**: Ukraine/Russia produce ~25–30% of global wheat exports; weather disruptions are market-moving",
          highlight: ["seasonal patterns", "pollination stress", "storage injection", "withdrawal season", "La Niña", "El Niño", "weather trading"],
        },
        {
          type: "teach",
          title: "Political Supply Disruptions and Demand Destruction",
          content:
            "Beyond physical fundamentals, commodity prices are shaped by geopolitical forces and the demand response to price extremes.\n\n**Political Supply Disruptions**\n\n**OPEC+ production decisions**: OPEC and allied non-OPEC producers (Russia, Kazakhstan, UAE, etc.) control approximately 40–45% of global oil supply. Their quarterly meetings can shift production quotas by millions of barrels/day — moving oil prices 5–10% on the announcement.\n\n**Sanctions**: US and European sanctions on Russia (post-Ukraine invasion), Iran, Venezuela, and other producers restrict their ability to sell oil on global markets, reducing supply availability.\n\n**Geopolitical events with commodity impact**:\n- Strait of Hormuz tension (20% of global oil transits here)\n- Libyan civil war (repeatedly disrupted 1+ million b/d of production)\n- Ukrainian war (disrupted ~25% of global wheat exports; fertilizer supply shock)\n- Infrastructure sabotage (Nord Stream pipeline explosion, 2022)\n\n**Demand Destruction**\nWhen prices rise high enough, consumption falls permanently (not just cyclically):\n- $147/barrel oil in 2008 accelerated fuel efficiency standards and EV adoption — permanently reducing oil intensity\n- $10/MMBtu natural gas in Europe (2022) caused industrial shutdowns, fuel switching, and efficiency investments\n- Signs of demand destruction: industrial production data falling while prices remain high; substitution evidence (gas-to-coal switching; aluminum-to-copper substitution)\n\n**Supply Disruption Premium**\nMarkets embed a risk premium when supply disruptions are feared but not yet confirmed. This premium evaporates rapidly when the risk passes — creating sharp reversals.",
          highlight: ["OPEC+", "sanctions", "Strait of Hormuz", "demand destruction", "supply disruption premium", "geopolitical risk"],
        },
        {
          type: "quiz-mc",
          question:
            "A COT report shows that managed money (hedge funds) in crude oil futures has reached a net long position that is in the 95th percentile of the past 5 years. An independent analyst describes this as a 'crowded long.' What is the trading implication?",
          options: [
            "The market may be vulnerable to a sharp reversal — most potential buyers have already bought, so the fuel for further rallies is limited; if sentiment shifts, forced liquidation could cause a rapid price decline",
            "The 95th percentile net long position confirms a strong uptrend — hedge funds are 'smart money' and their extreme bullishness is a strong buy signal",
            "The COT data proves that oil prices will rise by exactly 5% in the next week based on historical precedent",
            "This positioning is bullish because hedge funds must continue buying to maintain their positions, creating continuous demand pressure",
          ],
          correctIndex: 0,
          explanation:
            "Extreme positioning is a contrarian warning, not a confirmation signal. When managed money reaches a 95th percentile net long position, nearly all potential buyers have already established positions. For prices to continue rising, new buyers must emerge — but the pool of uncommitted bulls is now very small. Conversely, a single negative catalyst (weaker Chinese data, surprise OPEC production increase, large inventory build) can trigger wave after wave of stop-loss selling and forced liquidation as all those longs exit simultaneously. This is why extreme COT positioning often marks intermediate tops (for extreme longs) or bottoms (for extreme shorts).",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "July is the critical pollination period for US corn. Extended 14-day forecasts show temperatures 8–10°F above normal with below-average rainfall across the Corn Belt. The USDA Crop Progress report shows 72% of the crop rated Good/Excellent, down from 81% the prior week.",
          question: "How should a commodity trader interpret this situation?",
          options: [
            "Bullish for corn — heat and drought during pollination causes yield losses; the Good/Excellent rating decline confirms emerging crop stress, and near-term futures may spike as the market prices in a potential production shortfall",
            "Bearish for corn — hot weather accelerates crop development, causing earlier harvest and increased near-term supply",
            "Neutral — weather forecasts are unreliable, and traders should wait for the September WASDE report before taking positions",
            "Bearish for corn — a 9-point Good/Excellent drop in one week signals that farmers are over-rating their crop condition, which will normalize higher next week",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook bullish corn setup. July pollination stress is the most critical weather event of the corn growing season — hot and dry conditions during this 2-week window can permanently reduce yield potential because pollen viability drops in heat and drought. The 9-point weekly decline in Good/Excellent ratings (from 81% to 72%) is significant and confirms the crop stress. Traders who monitor NOAA forecasts ahead of the crop report would have already begun positioning; when the Crop Progress data confirms the stress, remaining shorts cover and new longs enter, often driving corn limit-up moves in the first trading session after the report.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Commodity Cycles ───────────────────────────────────────────────
    {
      id: "commodity-trading-5",
      title: "Commodity Cycles",
      description:
        "Super-cycle drivers, China's infrastructure demand impact, supply lag, project development timelines, and mean reversion tendencies",
      icon: "RefreshCw",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The Commodity Super-Cycle",
          content:
            "A **commodity super-cycle** is an extended period (typically 10–35 years) of above-trend commodity prices driven by a structural shift in global demand that outpaces supply's ability to respond.\n\n**Historical super-cycles:**\n1. **Late 19th century (1870s–1890s)**: US industrialization — railroads, steel mills, and urban construction drove sustained metals demand\n2. **Post-WWII reconstruction (1945–1960s)**: European and Japanese rebuilding created a commodity boom\n3. **China's industrialization (2000–2012)**: The most studied recent super-cycle — discussed in detail below\n4. **Energy transition super-cycle (potential, 2020s+)**: Wind turbines, solar panels, EV batteries, and grid infrastructure require enormous quantities of copper, lithium, cobalt, nickel, and rare earths\n\n**Why super-cycles occur:**\nThe fundamental driver is the **supply-demand imbalance** that persists for years or decades:\n- New commodity supply requires large capital investment and long project development timelines (5–15 years from discovery to production)\n- Demand can increase rapidly (a billion people industrializing simultaneously is unprecedented)\n- When demand grows faster than supply can respond, prices rise for years — until new supply comes online, demand saturates, or both\n\n**Super-cycle vs regular cycle:**\nA regular commodity cycle (2–5 years) is driven by the business cycle — economic expansions boost demand, recessions reduce it. A super-cycle operates on top of these cycles, establishing a structurally higher price floor that persists across multiple business cycles.",
          highlight: ["commodity super-cycle", "structural shift", "supply-demand imbalance", "project development timelines", "energy transition"],
        },
        {
          type: "teach",
          title: "China's Demand Impact and Supply Lag",
          content:
            "China's industrialization from 2000–2012 is the defining example of how a single country can transform global commodity markets.\n\n**China's commodity demand growth:**\n- Steel production grew from ~130 million tonnes/year (2000) to ~800 million tonnes/year (2014) — more steel poured in a decade than the US produced in its entire history\n- Copper consumption quadrupled, making China ~50% of global demand\n- Coal demand drove a global coal price spike as Chinese electricity generation expanded\n- Iron ore prices rose from ~$15/tonne (2003) to ~$180/tonne (2011)\n\n**The urbanization math:**\nChina moved approximately 400–500 million people from rural areas to cities between 1990 and 2020. Each new urban resident requires:\n- Housing (steel-reinforced concrete)\n- Roads, bridges, subway systems (steel, copper, aluminum)\n- Power grid connections (copper)\n- Appliances (steel, copper, aluminum)\n\n**Supply lag — the copper mine example:**\nThe commodity supply response is slow:\n1. Discovery to pre-feasibility study: 2–3 years\n2. Feasibility study: 2–3 years\n3. Permitting (increasingly complex): 3–7 years\n4. Construction: 3–5 years\n5. Ramp-up to full production: 1–2 years\n\nTotal: **10–20 years from discovery to full production.** Meanwhile, prices rise for years waiting for supply.\n\n**Supply overshoot and the price bust:**\nWhen supply eventually arrives (often multiple projects simultaneously since high prices incentivize many projects), it overshoots demand. Prices collapse. The 2015–2016 commodity bust was driven by a wave of mining and energy projects approved during the 2008–2012 price boom all coming online simultaneously.",
          highlight: ["China urbanization", "steel production", "supply lag", "mine development timeline", "supply overshoot", "price bust"],
        },
        {
          type: "teach",
          title: "Mean Reversion and Cycle Analysis",
          content:
            "Unlike equity markets, commodity prices tend to **mean revert** over the long run. The reason is fundamental: high prices incentivize new supply and demand destruction; low prices destroy supply and stimulate demand.\n\n**The self-correcting mechanism:**\n- **High prices**: Producers expand, miners approve new projects, farmers plant more acres. Consumers economize, substitute alternatives, improve efficiency. Eventually supply rises and demand falls → prices correct downward.\n- **Low prices**: Producers shut in high-cost supply, miners delay or cancel projects, farmers reduce plantings. Cheap commodity stimulates demand. Eventually supply falls and demand rises → prices recover.\n\nThis is unlike technology stocks where winner-takes-all dynamics can sustain high valuations indefinitely. No commodity commands a moat — any producer can produce the same barrel of crude, tonne of iron ore, or bushel of wheat.\n\n**Marginal cost of production — the floor:**\nOver the long run, commodity prices tend to find support at the **marginal cost of production** — the cost to produce the most expensive barrel/tonne needed to meet demand.\n- If prices fall far below marginal cost, the highest-cost producers shut down, reducing supply until prices recover\n- Understanding the global cost curve (which producers are profitable at which prices) is essential to identifying price floors\n\n**Cycle timing tools:**\n- P/B ratios of commodity producers (below 1x often marks cycle trough)\n- Producer capex trends (falling capex = future supply shortage)\n- Inventory levels vs historical norms\n- Futures curve shape (deep contango at cycle trough = market pricing in future recovery)\n- Analyst consensus (peak pessimism = contrarian buy signal)",
          highlight: ["mean reversion", "self-correcting", "marginal cost of production", "cost curve", "capex trends", "cycle trough"],
        },
        {
          type: "quiz-mc",
          question:
            "In 2012, copper prices are near all-time highs at $4.50/lb, driving a wave of new mine approvals. The average new copper mine takes 12–15 years from discovery to full production. What is the most likely consequence 10–15 years later?",
          options: [
            "A supply overshoot as multiple projects approved during the high-price era come online simultaneously, potentially causing a sharp price decline if demand growth has slowed",
            "Permanently higher copper prices because the new mines confirm that demand is structurally increasing",
            "A supply shortage because most projects will fail, and those approved in 2012 will take longer than expected",
            "No meaningful impact on prices — the futures market already priced in the new supply when the projects were announced",
          ],
          correctIndex: 0,
          explanation:
            "The commodity cycle is well-documented: high prices incentivize capital investment in new supply across the industry simultaneously. Because all projects face similar discovery-to-production timelines (10–20 years), the new supply tends to arrive in a wave rather than a trickle. If demand growth has slowed (as China's urbanization rate naturally decelerates), this simultaneous supply wave can overwhelm the market. This is precisely what happened with iron ore, copper, and oil in 2014–2016: projects approved during the 2008–2012 boom started producing as Chinese demand growth decelerated, sending prices sharply lower.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Unlike equity markets where winners can sustain high valuations indefinitely through competitive moats, commodity prices tend to mean revert because any producer can supply the same undifferentiated product, and high prices always incentivize new supply and demand conservation.",
          correct: true,
          explanation:
            "True. This is the fundamental distinction between commodity markets and equity markets. A company like Apple can sustain high margins for years through brand loyalty, network effects, and proprietary technology — no competitor can sell an identical product. But a barrel of Saudi crude oil is chemically equivalent to a barrel from a new Permian Basin well; there is no commodity moat. When oil prices are high, every profitable producer expands, and new producers enter. When prices are low, demand is stimulated and high-cost producers exit. This economic logic inexorably pulls commodity prices toward their long-run marginal cost of production, making sustained super-premiums impossible without artificial supply restriction (like OPEC+ cartel management).",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Investment Approaches ─────────────────────────────────────────
    {
      id: "commodity-trading-6",
      title: "Investment Approaches",
      description:
        "Commodity ETFs vs producers vs royalties, commodity-linked bonds, infrastructure investing, and inflation hedge allocation",
      icon: "DollarSign",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Commodity ETFs: Direct and Indirect Exposure",
          content:
            "Investors can gain commodity exposure through multiple vehicles, each with distinct risk/return characteristics.\n\n**Physical Commodity ETFs**\nHold the actual physical commodity:\n- **GLD/IAU** (gold): Actually holds gold bullion in vaults. No roll yield issue. Tracks gold spot closely.\n- **PSLV** (silver): Physical silver held in custody\n- **Limitation**: Only practical for precious metals. You cannot hold a warehouse of oil or corn in a fund.\n\n**Futures-Based Commodity ETFs**\nHold futures contracts, not physical commodities:\n- **USO** (United States Oil Fund): Holds near-month WTI futures. Suffers severe roll yield drag in contango markets.\n- **UNG** (natural gas): Extreme roll yield problem — natural gas is almost always in contango between seasons.\n- **DJP, DBC**: Diversified commodity indices with multiple commodity futures\n- **Key problem**: Roll yield drag in contango can cause massive underperformance vs spot prices\n\n**Equity-Based Commodity Exposure**\nBuying commodity producer stocks:\n- **XLE** (Energy Select Sector ETF): ExxonMobil, Chevron, ConocoPhillips, etc.\n- **GDX** (VanEck Gold Miners ETF): Gold mining stocks\n- **COPX** (copper miners)\n- **Advantage**: Avoids roll yield problem; producers are leveraged to commodity prices (operating leverage)\n- **Disadvantage**: Equity-specific risks (management, debt, geopolitics in mining jurisdictions, cost inflation) add noise\n\n**Commodity Index funds** (GSCI, Bloomberg Commodity Index): Rolling indices that provide diversified exposure across energy, metals, and agriculture",
          highlight: ["physical commodity ETFs", "futures-based ETFs", "roll yield drag", "commodity producer stocks", "operating leverage", "commodity index"],
        },
        {
          type: "teach",
          title: "Producers, Royalties, and Streaming Companies",
          content:
            "Within the commodity equity universe, different company types offer different exposure profiles.\n\n**Integrated Majors** (e.g., ExxonMobil, Shell, BHP)\n- Operate across the entire value chain (exploration, production, refining, distribution)\n- More diversified — refining margins can offset low oil prices\n- Lower leverage to commodity price moves, but more stable earnings\n\n**Pure-Play Producers** (e.g., ConocoPhillips for oil; Freeport-McMoRan for copper)\n- Revenue almost entirely tied to one commodity price\n- High operating leverage: fixed production costs mean that a 20% increase in commodity price may drive 50–100% earnings growth\n- Riskier in downturns — fixed costs continue even when revenue falls\n\n**Royalty and Streaming Companies** (e.g., Franco-Nevada, Royal Gold, Wheaton Precious Metals)\nA unique business model with highly desirable characteristics:\n- Provide upfront capital to mining companies in exchange for the right to purchase a percentage of future production at a fixed or discounted price\n- **No mine operating costs**: Royalty companies have no exposure to cost inflation (labor, diesel, electricity) that plagues miners\n- **Optionality on reserves**: As mines expand, the royalty holder benefits without additional investment\n- **Diversification across mines**: A single company may hold royalties on 100+ mines globally\n- Royalty companies trade at premium P/E multiples because of their superior margin stability and growth profile\n\n**Commodity-Linked Bonds**\n- Some energy companies issue bonds with coupon payments linked to oil prices\n- Sovereign wealth bonds in oil-producing nations (Saudi Arabia, UAE) are effectively commodity-linked\n- Oil Revenue Participation Bonds: structured to pay higher interest when oil prices rise",
          highlight: ["integrated majors", "pure-play producers", "operating leverage", "royalty companies", "streaming companies", "Franco-Nevada", "no operating costs"],
        },
        {
          type: "teach",
          title: "Commodities as an Inflation Hedge and Portfolio Allocator",
          content:
            "Commodities occupy a unique role in portfolio construction — particularly for inflation protection.\n\n**Why Commodities Hedge Inflation**\nCommodities ARE inflation, in a sense. The Consumer Price Index (CPI) is heavily influenced by energy (gasoline, utilities), food, and raw material costs. When commodity prices rise, CPI inflation follows:\n- Energy: ~7% of CPI basket\n- Food at home: ~9% of CPI basket\n- Total direct commodity impact: ~20%+ of CPI\n\nMoreover, commodity price rises feed into the prices of almost everything manufactured or transported — indirect effects can be another 20–30% of CPI.\n\n**Commodities vs Equities and Bonds in Inflation**\n- **Equities**: Perform poorly in high-inflation environments because rising input costs compress margins and rising interest rates reduce valuations\n- **Bonds**: The worst performers during inflation — fixed coupons are worth less in real terms\n- **Commodities**: Tend to outperform in inflationary periods — they are the raw material of inflation itself\n\nThe 1970s stagflation: Equities and bonds both lost value in real terms; commodities rose dramatically.\n2021–2022: Commodities rose 50–100%+ while bonds experienced their worst drawdown in 100 years.\n\n**Strategic Allocation**\nTypical institutional recommendations:\n- 5–15% commodity allocation in a diversified portfolio\n- Accessed via diversified commodity index (to avoid single-commodity concentration)\n- Rebalanced annually (sell when commodities have outperformed, buy after underperformance)\n\n**Infrastructure Investing**\nA related category: physical infrastructure (pipelines, LNG terminals, grain elevators, storage facilities) generates revenues tied to commodity volumes and prices. MLPs (Master Limited Partnerships) provide exposure to energy infrastructure with high distributions — appealing for income-oriented commodity investors.",
          highlight: ["inflation hedge", "CPI basket", "real returns", "stagflation", "commodity allocation", "infrastructure investing", "MLPs"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor wants exposure to gold prices. She is comparing two ETFs: (A) a physical gold ETF that holds actual gold bullion in vaults, and (B) a gold futures ETF that holds near-month futures contracts. Assuming gold is in contango (the futures market), what is the key structural advantage of ETF A over ETF B?",
          options: [
            "ETF A avoids roll yield drag — because it holds physical gold with no need to roll contracts, its return tracks spot gold price changes directly, while ETF B continuously sells lower-priced expiring contracts and buys higher-priced next-month contracts",
            "ETF A is safer because physical gold is insured by the FDIC, while futures contracts have no government protection",
            "ETF A outperforms because gold held in vaults earns interest from lending programs, while futures contracts earn nothing",
            "ETF A and ETF B will perform identically over time because futures prices always converge to spot price at expiration",
          ],
          correctIndex: 0,
          explanation:
            "The key advantage of a physical gold ETF is eliminating roll yield drag. A futures-based ETF must continuously roll its contracts — selling the expiring near-month contract and buying the next-month contract. In contango (where each successive contract is more expensive), every roll costs money: you sell low, buy high. Over months and years, this drag compounds and can cause significant underperformance vs spot gold prices. A physical ETF holds actual gold bars in a vault, so there is nothing to roll — the fund's value moves directly with the spot gold price. This is why physical gold ETFs (GLD, IAU) track gold prices far more closely than gold futures ETFs, especially over multi-year periods.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A portfolio manager is building an inflation-protected portfolio. She is choosing between: (1) a copper mining company, (2) a royalty company that holds royalties on 80 copper mines globally, and (3) a copper futures ETF. Copper is in moderate contango (2% per month roll cost).",
          question: "Which vehicle best combines inflation protection with the lowest exposure to individual mine operating cost inflation?",
          options: [
            "The royalty company — it benefits from copper price increases while being entirely insulated from mine operating cost inflation (labor, diesel, energy), since royalty holders pay no production costs",
            "The copper miner — it has the highest leverage to copper prices and benefits most from rising copper prices",
            "The copper futures ETF — it provides the purest exposure to copper prices without any equity or operational risk",
            "All three are equivalent for inflation protection because they all ultimately depend on the copper price",
          ],
          correctIndex: 0,
          explanation:
            "The royalty company is the superior choice for this specific objective. When inflation is high, mine operating costs also rise (labor, diesel, electricity, supplies) — this compresses miner margins even as copper prices increase. A copper miner might see copper revenue up 30% while production costs rise 20%, yielding only 10% earnings growth. The royalty company, however, receives a fixed percentage of copper production at a predetermined low price — it has NO exposure to operating cost inflation. Additionally, the futures ETF's 2%/month roll cost (24%/year!) would destroy returns in a contango environment. The royalty company combines inflation exposure with margin stability, which is why royalty companies like Franco-Nevada trade at significant premiums.",
          difficulty: 3,
        },
      ],
    },
  ],
};
