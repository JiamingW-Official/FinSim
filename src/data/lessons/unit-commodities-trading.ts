import type { Unit } from "./types";

export const UNIT_COMMODITIES_TRADING: Unit = {
  id: "commodities-trading",
  title: "Commodities Trading",
  description:
    "Master futures markets, energy trading, precious metals, agricultural commodities, and commodity portfolio strategies",
  icon: "BarChart2",
  color: "#f59e0b",
  lessons: [
    // ─── Lesson 1: Commodity Markets Foundation ──────────────────────────────────
    {
      id: "commodities-trading-1",
      title: "Commodity Markets Foundation",
      description:
        "Futures contracts, spot vs futures pricing, basis, contango, and backwardation — the building blocks of commodity trading",
      icon: "BarChart2",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Commodity Classifications",
          content:
            "Commodities are raw materials or primary agricultural products that can be bought and sold. They fall into four main categories:\n\n**Energy**: The most actively traded commodity sector.\n- **Crude oil** (WTI, Brent): The world's most traded commodity by value\n- **Natural gas**: Henry Hub (US), TTF (Europe) benchmark prices\n- **Coal**: Thermal (power generation) vs metallurgical (steel production)\n\n**Metals**:\n- **Precious**: Gold, silver, platinum, palladium — store of value + industrial uses\n- **Base/Industrial**: Copper, aluminum, zinc, nickel — economic bellwethers\n\n**Agricultural (Grains)**:\n- **Grains**: Wheat, corn, soybeans — traded on CBOT (Chicago Board of Trade)\n- **Oilseeds**: Soybeans, canola, palm oil\n\n**Softs** (tropical commodities):\n- Coffee, sugar, cotton, cocoa, orange juice — traded on ICE Futures\n\nEach category responds differently to economic cycles, weather, geopolitics, and currency moves — making commodities a unique and diversifying asset class.",
          highlight: ["energy", "metals", "agricultural", "softs", "WTI", "Brent", "CBOT", "ICE"],
        },
        {
          type: "teach",
          title: "Futures Contracts Fundamentals",
          content:
            "A **futures contract** is a standardized, legally binding agreement to buy or sell a commodity at a predetermined price on a specific future date.\n\n**Key contract specifications** (example: WTI crude oil):\n- **Underlying**: 1,000 barrels of West Texas Intermediate crude oil\n- **Delivery**: Cushing, Oklahoma (physical settlement)\n- **Tick size**: $0.01/barrel = $10 per contract\n- **Months**: Monthly contracts up to several years out\n\n**Margin requirements** — the critical capital concept:\n- **Initial margin**: The deposit required to open a position (typically 5–15% of contract value)\n- **Maintenance margin**: The minimum balance to keep the position open (typically 75% of initial margin)\n- If account falls below maintenance margin → **margin call** → must deposit additional funds or close position\n\n**Mark-to-market daily settlement**: Every evening, the exchange calculates gains and losses based on the day's settlement price. Profits are credited to winners' accounts; losses are debited from losers' accounts — *daily*. This prevents accumulated losses from becoming unmanageable.\n\n**Leverage magnification**: Because you only post 5–10% margin, a 1% move in the commodity price can mean a 10–20% gain or loss on your posted capital. Commodities futures are highly leveraged instruments.",
          highlight: ["futures contract", "standardized", "initial margin", "maintenance margin", "mark-to-market", "margin call", "leverage"],
        },
        {
          type: "teach",
          title: "Spot vs Futures Pricing — Basis, Contango & Backwardation",
          content:
            "**Spot price**: The current market price for immediate delivery of a commodity.\n**Futures price**: The agreed-upon price for delivery at a future date.\n\n**Basis** = Spot price − Futures price\n\nBasis reflects storage costs, financing costs, convenience yield, and supply/demand dynamics. Basis can be positive or negative depending on market structure.\n\n**Contango** (most common for storable commodities):\n- Futures price > Spot price\n- The futures curve slopes upward over time\n- Driven by storage costs + financing costs (cost of carry)\n- Example: Oil at $80 spot, 6-month future at $83 (you're paying the storage and interest cost)\n- **Roll yield is negative in contango**: As futures contracts expire, you must sell the near contract (lower) and buy the next (higher) — a drag on returns\n\n**Backwardation** (common for energy, agricultural commodities in shortage):\n- Futures price < Spot price\n- The futures curve slopes downward\n- Driven by tight near-term supply or high convenience yield (value of having the physical commodity now)\n- Example: Natural gas at $5 spot during a cold snap, 6-month future at $3.50\n- **Roll yield is positive in backwardation**: Sell near (higher) and buy next (lower) = built-in return\n\n**Convenience yield**: The implicit return from physically holding a commodity (e.g., a refinery values having crude on hand). High convenience yield drives backwardation.",
          highlight: ["spot price", "futures price", "basis", "contango", "backwardation", "roll yield", "cost of carry", "convenience yield"],
        },
        {
          type: "quiz-mc",
          question:
            "A commodity's spot price is $100. The 3-month futures contract trades at $104. What market structure is this, and what is likely causing it?",
          options: [
            "Contango — storage costs and financing charges cause futures to trade above spot",
            "Backwardation — tight near-term supply is creating a premium for immediate delivery",
            "Contango — strong demand for the physical commodity drives spot prices down",
            "Normal backwardation — futures always trade at a discount to spot prices",
          ],
          correctIndex: 0,
          explanation:
            "When futures trade above spot (futures $104 > spot $100), the market is in contango. This is the normal structure for storable commodities because futures prices must account for the cost of carry: storage costs (warehousing, insurance) plus financing costs (opportunity cost of capital tied up in inventory). In contango, investors who hold long futures positions suffer negative roll yield — they must sell the expiring contract at a lower price and buy the next contract at a higher price as they roll.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In futures markets, mark-to-market settlement means that gains and losses on open positions are calculated and credited/debited to accounts every trading day, not just at contract expiration.",
          correct: true,
          explanation:
            "True. Daily mark-to-market settlement is a fundamental feature of futures markets. Each evening, the exchange calculates each position's gain or loss based on the day's settlement price. Winners receive cash credits; losers have cash debited. This daily settlement prevents large accumulated losses from building up and is a key reason why futures markets rarely experience the counterparty default risk seen in over-the-counter derivatives. It also means margin calls can happen any day the market moves against your position.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A wheat trader holds a long futures position. The futures contract is priced at $6.50/bushel, and the spot price of wheat is $6.80/bushel. Each contract covers 5,000 bushels.",
          question: "What is the basis, and what market structure does this represent?",
          options: [
            "Basis = −$0.30 (spot minus futures); this is backwardation — spot trades at a premium to futures",
            "Basis = +$0.30 (futures minus spot); this is contango — futures trade at a premium to spot",
            "Basis = −$0.30; this is contango because spot is higher than futures",
            "Basis = $0; the two prices must always converge before calculating basis",
          ],
          correctIndex: 0,
          explanation:
            "Basis = Spot − Futures = $6.80 − $6.50 = +$0.30. Wait — spot ($6.80) is ABOVE futures ($6.50), so basis is positive (+$0.30) and the market is in **backwardation**. Backwardation occurs when the spot price exceeds the futures price, typically due to tight near-term supply, weather concerns, or high convenience yield from holding the physical commodity. This is the correct answer: basis = spot minus futures = positive $0.30, indicating backwardation.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Energy Markets ─────────────────────────────────────────────────
    {
      id: "commodities-trading-2",
      title: "Energy Markets",
      description:
        "WTI vs Brent, OPEC+ dynamics, crack spreads, natural gas seasonality, and energy trading strategies",
      icon: "Zap",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Crude Oil Markets — WTI, Brent & OPEC+",
          content:
            "Crude oil is the world's most actively traded commodity, with two primary global benchmarks:\n\n**WTI (West Texas Intermediate)**:\n- Traded on NYMEX (CME Group), delivery at Cushing, Oklahoma\n- Typically lighter (lower density) and sweeter (lower sulfur) than Brent\n- US domestic benchmark — reflects US supply/demand dynamics\n\n**Brent Crude**:\n- Traded on ICE Futures, priced for North Sea delivery\n- The global benchmark — approximately 70% of world oil contracts reference Brent\n- Brent typically trades at a slight premium to WTI (the Brent-WTI spread)\n\n**OPEC+ influence**: The Organization of the Petroleum Exporting Countries plus Russia and allied producers controls roughly 40% of global oil supply. Production decisions directly move prices:\n- Production cuts → tighter supply → higher prices (2023–2024 strategy)\n- Production increases → looser supply → lower prices (2020 price war with Russia)\n\n**Geopolitical risk premium**: Oil prices embed a premium for supply disruption risk. Tensions in the Middle East, Strait of Hormuz (20% of global oil passes through), or Libyan instability all add risk premium.\n\n**Crack spread** (refiner's margin): The price difference between crude oil input and refined petroleum product outputs.\n- 3-2-1 crack spread: 3 barrels crude → 2 barrels gasoline + 1 barrel heating oil/diesel\n- Formula: (2 × gasoline price + 1 × diesel price) / 3 − crude price\n- Refiners profit when the crack spread widens; they hedge by trading crack spread futures",
          highlight: ["WTI", "Brent", "NYMEX", "ICE", "OPEC+", "geopolitical risk premium", "crack spread", "refiner margin"],
        },
        {
          type: "teach",
          title: "Natural Gas — Henry Hub, Seasonality & LNG",
          content:
            "Natural gas is a regional commodity with prices that vary dramatically by geography — unlike oil, it cannot be easily transported in its gaseous form.\n\n**Henry Hub** (Louisiana): The primary US natural gas pricing hub, the delivery point for NYMEX natural gas futures. All US gas contracts reference Henry Hub.\n\n**Seasonal demand patterns**: Natural gas demand is highly seasonal:\n- **Winter peak**: Home heating demand spikes (November–March in the US and Europe)\n- **Summer peak** (secondary): Air conditioning drives power generation demand\n- **Shoulder months** (spring/fall): Low demand, storage fills up, prices typically weakest\n\n**EIA Weekly Storage Report**: Published every Thursday at 10:30 AM ET. Reports weekly changes in US natural gas storage (measured in billion cubic feet — Bcf). The market moves sharply if actual storage differs from analyst estimates:\n- Storage **below** 5-year average = bullish (tight supply)\n- Storage **above** 5-year average = bearish (abundant supply)\n\n**LNG (Liquefied Natural Gas) impact**: The US became a major LNG exporter after 2016 (Sabine Pass terminal). LNG exports tie US prices to global markets:\n- When European/Asian gas prices spike (as in 2022, following Russia's invasion of Ukraine), US LNG exports increase\n- This reduces domestic supply → raises Henry Hub prices\n- Henry Hub, once isolated, is now partially integrated with global gas markets",
          highlight: ["Henry Hub", "NYMEX", "seasonal demand", "EIA storage report", "LNG", "Bcf", "5-year average"],
        },
        {
          type: "teach",
          title: "Energy Trading Strategies",
          content:
            "Professional energy traders use spread strategies to isolate specific market relationships and hedge risks:\n\n**Crack Spread Trading** (refinery margin play):\n- **Long crack spread**: Buy crude futures + sell gasoline/diesel futures (bet that refining margins expand)\n- **Short crack spread**: Sell crude futures + buy product futures (bet margins compress)\n- Crack spreads widen ahead of summer driving season (gasoline demand) and winter (heating oil demand)\n- Refiners use crack spread futures to lock in margin on their operations\n\n**Spark Spread** (power generator's margin):\n- Spark spread = Electricity price − (Natural gas price × Heat rate)\n- Heat rate: The efficiency of converting gas to electricity (BTU/kWh)\n- Positive spark spread = profitable to run a gas-fired power plant\n- Traders use spark spreads to bet on power market profitability\n\n**Calendar Spreads** (nearby vs deferred contracts):\n- **Bull spread**: Long nearby month + Short deferred month (bet the nearby strengthens vs back months)\n- **Bear spread**: Short nearby month + Long deferred month\n- Calendar spreads reflect storage economics, seasonal demand shifts, and inventory expectations\n- Example: Long January natural gas / Short March natural gas = bet on winter demand spike vs spring shoulder\n\n**Intermarket spreads**:\n- Brent-WTI spread: Reflects transportation, quality differences, and regional supply dynamics\n- Natural gas vs coal switch: Power generators switch between gas and coal based on relative economics",
          highlight: ["crack spread", "spark spread", "calendar spread", "bull spread", "bear spread", "heat rate", "intermarket spread"],
        },
        {
          type: "quiz-mc",
          question:
            "A refiner processes crude oil at $80/barrel. Gasoline trades at $2.50/gallon and diesel at $2.80/gallon. Using the 3-2-1 crack spread formula (where 1 barrel = 42 gallons), what is the approximate 3-2-1 crack spread?",
          options: [
            "Approximately $27/barrel — (2×$105 + 1×$117.60)/3 − $80 = $27.20",
            "Approximately $45/barrel — the sum of all product values minus crude",
            "Approximately $5/barrel — crack spreads are always small due to competition",
            "Approximately $0 — refiners operate at breakeven in competitive markets",
          ],
          correctIndex: 0,
          explanation:
            "The 3-2-1 crack spread: Convert product prices to per-barrel (42 gallons/barrel). Gasoline: $2.50 × 42 = $105/bbl. Diesel: $2.80 × 42 = $117.60/bbl. Crack spread = (2 × $105 + 1 × $117.60) / 3 − $80 = ($210 + $117.60) / 3 − $80 = $109.20 − $80 = $29.20/barrel (approximately $27–$29 depending on rounding). This represents the refiner's gross margin before operating costs. Crack spreads are closely watched because they signal refining profitability and drive crude demand from the refining sector.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "When OPEC+ announces a production cut of 1 million barrels per day, oil prices will always rise immediately and sustainably.",
          correct: false,
          explanation:
            "False. While OPEC+ production cuts are generally bullish for oil prices, the outcome depends on several factors: (1) Compliance — OPEC members historically cheat on quotas, so announced cuts are often smaller in practice. (2) Non-OPEC supply response — US shale producers can quickly ramp up production to fill supply gaps. (3) Demand outlook — if the cut coincides with a global recession, demand weakness can overwhelm the supply reduction. (4) Market expectations — if a cut was already priced in, the announcement may produce a 'buy the rumor, sell the news' reaction. Price impacts of OPEC+ decisions are real but not guaranteed to be immediate or lasting.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A hurricane in the Gulf of Mexico shuts down 500,000 barrels/day of US oil production for 3 weeks. At the same time, refinery damage reduces processing capacity by 300,000 barrels/day. The EIA weekly report shows a large draw in crude inventories but an unexpected build in gasoline stocks.",
          question: "How should an energy trader interpret this situation and position accordingly?",
          options: [
            "Bearish crude (refinery outages reduce crude demand despite production cuts), neutral-to-bearish gasoline (supply disruption offset by demand destruction from lower refinery runs)",
            "Bullish crude and bullish gasoline — any supply disruption is always bullish for all energy prices",
            "Bearish all energy — hurricane damage signals economic disruption and lower demand",
            "Neutral — production cuts and refinery outages cancel each other out perfectly",
          ],
          correctIndex: 0,
          explanation:
            "This requires nuanced analysis. Production is cut 500k bbl/day (bullish crude), BUT refinery damage reduces crude demand by 300k bbl/day (bearish crude — refiners can't process it). Net crude bullishness is reduced. For gasoline: refinery outages cut supply (bullish), but simultaneously, hurricane damage reduces transportation demand and economic activity (bearish demand). The gasoline inventory BUILD confirms that demand destruction is outweighing supply loss. A skilled trader shorts the crack spread (sell gasoline vs. crude) and potentially goes long crude while shorting gasoline futures — exploiting the divergent supply/demand dynamics rather than making a simple directional bet.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Precious Metals ────────────────────────────────────────────────
    {
      id: "commodities-trading-3",
      title: "Precious Metals",
      description:
        "Gold's real rate relationship, silver's dual nature, platinum group metals, and the copper economic indicator",
      icon: "CircleDollarSign",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Gold — Safe Haven, Real Rates & Central Banks",
          content:
            "Gold is unique among commodities: it is not consumed industrially to any significant degree, making it primarily a monetary and store-of-value asset.\n\n**The real interest rate relationship** (the most important gold driver):\n- **Real rate** = Nominal rate − Inflation rate\n- Gold has no yield — holding gold has an opportunity cost equal to real interest rates\n- When real rates are **negative** (inflation > nominal rates): Gold is attractive — its zero yield beats holding negative-real-return bonds\n- When real rates are **high and positive**: Gold is expensive to hold — bonds and cash offer real returns\n- The 2020–2022 cycle: Real rates went deeply negative (gold surged past $2,000) → Fed hiked rates sharply (real rates rose) → gold fell back → real rates peaked (gold recovered in 2023–2024)\n\n**USD correlation**: Gold is priced in US dollars. A weaker dollar makes gold cheaper for foreign buyers → increases global demand → gold rises. Dollar strength has the opposite effect. Gold and the USD typically have a negative correlation.\n\n**Central bank purchases**: Since 2022, central banks (particularly China, India, Poland, Turkey) have been buying gold at record rates — diversifying away from USD reserves. This structural demand underpins gold's floor.\n\n**Market venues**:\n- **COMEX** (CME Group): US futures market, primary price discovery\n- **LBMA** (London Bullion Market Association): OTC physical market, the daily 'fix' price is widely used globally\n- **Gold ETFs** (GLD, IAU): Allow equity investors to gain exposure without holding physical metal",
          highlight: ["real interest rate", "opportunity cost", "safe haven", "USD correlation", "central bank purchases", "COMEX", "LBMA", "gold ETFs"],
        },
        {
          type: "teach",
          title: "Silver — Monetary Metal Meets Industrial Demand",
          content:
            "Silver occupies a unique position: it is both a monetary metal (like gold) and a critical industrial commodity.\n\n**Industrial demand** (~55% of total silver demand):\n- **Solar panels**: Silver paste is used in photovoltaic cells — rising solar installations are a structural demand driver\n- **Electronics**: Silver's exceptional electrical conductivity makes it irreplaceable in circuit boards, switches, and connectors\n- **EV batteries and charging**: Silver is used in EV battery management systems and charging contacts\n- **Medical**: Antimicrobial properties drive use in wound dressings, medical devices\n\n**Monetary demand** (~45%):\n- Silver bullion coins, bars, and ETFs (SLV)\n- Silver tracks gold directionally but with higher volatility\n- The **gold/silver ratio** measures how many ounces of silver it takes to buy one ounce of gold\n  - Historical average: ~60–70x\n  - When ratio is very high (80–90x+): Silver is cheap relative to gold — a potential reversion opportunity\n  - When ratio is very low (30–40x): Silver has outperformed — often signals a commodities bull market peak\n\n**Gold/silver ratio trade**: Spread traders buy silver and sell gold (or vice versa) when the ratio deviates significantly from historical norms, betting on reversion.\n\n**Key difference from gold**: Silver's industrial demand ties it to economic cycles. In recessions, silver underperforms gold because industrial demand falls. In recoveries and booms, silver can dramatically outperform as both monetary and industrial demand surge simultaneously.",
          highlight: ["industrial demand", "solar panels", "EV batteries", "gold/silver ratio", "SLV", "monetary metal", "volatility"],
        },
        {
          type: "teach",
          title: "Platinum Group Metals & Dr. Copper",
          content:
            "**Platinum and Palladium — autocatalyst plays**:\n- Both are used primarily in automotive catalytic converters to reduce exhaust emissions\n- **Palladium**: Preferred for gasoline engine catalysts (historically dominant)\n- **Platinum**: Preferred for diesel engines and increasingly fuel cells\n- **Russian supply risk**: Russia supplies ~40% of global palladium and ~10% of platinum — geopolitical disruptions create supply shocks\n- **EV transition**: As ICE vehicles are replaced by EVs (which need no catalytic converters), platinum group metal demand faces structural decline long-term — but hydrogen fuel cells may create new platinum demand\n- **Investment demand**: Platinum trades at a large discount to gold, attracting value-oriented investors when the spread is extreme\n\n**Copper — 'Dr. Copper'**:\nCopper earned the nickname 'Dr. Copper' because it has a 'PhD in economics' — it is the world's best industrial leading indicator:\n- Used in construction (wiring, plumbing), electronics, transportation, and renewable energy infrastructure\n- Broad economic demand means copper prices reliably reflect global growth expectations\n- **Copper rising**: Markets pricing in economic acceleration, Chinese construction boom, infrastructure spending\n- **Copper falling**: Markets pricing in slowdown, demand destruction, China property sector weakness\n- China consumes ~55% of global copper — Chinese economic data (PMI, property starts, infrastructure announcements) are the most important copper drivers\n- **Copper-gold ratio**: Often used as an economic sentiment indicator — rising ratio = risk-on, growth expectations; falling ratio = defensive, slowdown fears",
          highlight: ["palladium", "platinum", "autocatalyst", "EV transition", "Russian supply", "copper", "Dr. Copper", "China", "copper-gold ratio"],
        },
        {
          type: "quiz-mc",
          question:
            "When real interest rates (nominal rates minus inflation) rise sharply, what typically happens to gold prices and why?",
          options: [
            "Gold falls — higher real rates increase the opportunity cost of holding non-yielding gold, making bonds and cash more attractive",
            "Gold rises — higher real rates signal inflation concerns, increasing safe-haven demand",
            "Gold is unaffected — gold prices are only driven by USD movements, not interest rates",
            "Gold rises — higher rates strengthen the dollar, which always boosts gold prices",
          ],
          correctIndex: 0,
          explanation:
            "Gold has no yield. Its opportunity cost is the real interest rate — what you give up by holding gold instead of bonds or cash. When real rates rise, gold becomes relatively less attractive: a 2% real-yielding Treasury bond now offers genuine purchasing power growth, while gold offers nothing. The 2022 period demonstrated this clearly — as the Fed aggressively hiked rates, 10-year real yields surged from -1% to +1.5%, and gold fell roughly 20% from its peak despite ongoing geopolitical uncertainty. Gold's primary competition is real-yielding government bonds.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A gold/silver ratio of 90 (meaning 90 ounces of silver are needed to buy 1 ounce of gold) indicates that silver is historically expensive relative to gold.",
          correct: false,
          explanation:
            "False. A gold/silver ratio of 90 means silver is historically CHEAP relative to gold, not expensive. The higher the ratio, the more silver it takes to buy gold — meaning silver has underperformed and is relatively inexpensive compared to its historical relationship with gold. The historical average ratio is around 60–70x. When the ratio reaches 80–90x or higher, contrarian traders often buy silver and sell gold, betting on reversion. Silver tends to outperform gold dramatically when the ratio normalizes from extreme highs.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Inflation is running at 5%. The Federal Reserve has just signaled it will keep interest rates low (at 1%) for an extended period. The US dollar is weakening against major currencies. Central banks globally are increasing their gold reserves.",
          question: "Given this environment, what is the appropriate precious metals trade setup?",
          options: [
            "Bullish gold and silver — negative real rates (1% nominal minus 5% inflation = −4% real), weak USD, and central bank buying create a strongly favorable environment",
            "Bearish gold — high inflation historically leads to rising rates, which will hurt gold",
            "Neutral gold, bullish silver only — only industrial demand matters for precious metals",
            "Bearish both — inflation signals economic strength, which reduces safe-haven demand",
          ],
          correctIndex: 0,
          explanation:
            "This environment has three simultaneous bullish factors for gold and silver: (1) Deeply negative real rates: 1% nominal − 5% inflation = −4% real rate — gold's zero yield looks attractive compared to bonds losing 4% in real terms. (2) Weak USD: Gold is priced in dollars; dollar weakness makes gold cheaper for foreign buyers, boosting global demand. (3) Central bank purchases: Structural institutional demand provides a strong floor. All three drivers align bullishly. Silver also benefits as a monetary metal, plus inflation expectations often drive industrial commodity demand. This is a high-conviction long setup in precious metals.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Agricultural Commodities ──────────────────────────────────────
    {
      id: "commodities-trading-4",
      title: "Agricultural Commodities",
      description:
        "USDA crop reports, weather markets, soft commodities, and seasonal trading patterns in grains and softs",
      icon: "Leaf",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Grain Markets — USDA Reports, Weather & Export Competition",
          content:
            "Grain markets (corn, wheat, soybeans) are driven by a specific set of fundamental factors unique to agricultural commodities.\n\n**USDA Crop Reports — the most market-moving data**:\n- **WASDE** (World Agricultural Supply and Demand Estimates): Published monthly (typically second Tuesday). The definitive global supply/demand balance sheet. Shows: beginning stocks, production, total supply, consumption, exports, ending stocks, and stocks-to-use ratio.\n- **Planting Intentions** (March): Farmers report planned acreage — first indication of the upcoming crop size\n- **Acreage report** (June): Confirms actual planted acres (often diverges from intentions → big market moves)\n- **Crop Progress Reports** (weekly, April–November): Tracks crop condition ratings (Excellent/Good/Fair/Poor/Very Poor)\n- **Crop Production** (August–November): Monthly estimates of final crop size as harvest approaches\n\n**Weather impact** (the dominant short-term driver):\n- **La Niña**: Tends to reduce South American soybean/corn yields; can boost US Corn Belt yields\n- **El Niño**: Opposite effects — often positive for South America\n- Spring/summer **drought** in the US Corn Belt: Critical during pollination (July) for corn\n- **Derecho or flooding**: Can destroy crop conditions rapidly\n\n**Export competition**: US competes with:\n- **Brazil**: World's largest soybean exporter; planting in October, harvest February–April\n- **Argentina**: Major corn and soybean exporter; frequent economic/currency crises affect export flows\n- **Ukraine/Russia**: Top wheat exporters (Black Sea region) — geopolitical risk is a constant wheat premium driver",
          highlight: ["WASDE", "USDA", "stocks-to-use", "planting intentions", "La Niña", "El Niño", "Corn Belt", "Brazil", "Ukraine"],
        },
        {
          type: "teach",
          title: "Soft Commodities — Coffee, Sugar, Cotton & Cocoa",
          content:
            "Soft commodities (tropical agricultural goods) are traded on ICE Futures US and are highly sensitive to weather, disease, and regional production dynamics.\n\n**Coffee** (Arabica vs Robusta):\n- **Arabica** (ICE 'C' contract, priced in cents/lb): Higher quality, grown in Brazil and Colombia\n- **Brazilian frost** is the most feared supply shock — a single frost event can destroy years of coffee tree production (trees take 3–4 years to mature)\n- Brazil supplies ~35% of global coffee; any weather event there moves prices dramatically\n- **Currency effect**: A weaker Brazilian real makes Brazilian coffee cheaper globally (more competition for US exporters)\n\n**Sugar** (#11 Raw Sugar, ICE):\n- Brazil is both the world's largest sugar producer AND the largest ethanol producer (sugarcane feedstock)\n- **Ethanol-sugar switch**: When ethanol prices are high, Brazilian mills divert cane to ethanol → less sugar supply → higher sugar prices\n- Indian monsoon failures reduce production (India is #2 producer)\n\n**Cotton** (#2 Cotton, ICE):\n- Heavily influenced by textile industry demand cycles (China is the world's largest cotton importer)\n- US crop conditions in the Southern Plains (Texas) are critical for US production\n- Competes with synthetic fibers — oil price changes affect synthetic fiber costs\n\n**Cocoa** (ICE Cocoa):\n- Highly concentrated supply: ~65% of global production from Ivory Coast and Ghana (West Africa)\n- **Swollen shoot disease** and aging tree stock create chronic supply vulnerability\n- Demand is globally diversified and relatively inelastic — chocolate consumption is resilient\n- Political instability in West Africa can trigger sharp price spikes",
          highlight: ["Arabica", "Robusta", "Brazilian frost", "ethanol-sugar switch", "cotton", "cocoa", "Ivory Coast", "Ghana", "ICE Futures"],
        },
        {
          type: "teach",
          title: "Agricultural Seasonality & Trading the Calendar",
          content:
            "Agricultural markets follow predictable seasonal patterns driven by planting, growing, and harvest cycles — making seasonality one of the most reliable edges in commodity trading.\n\n**The US Crop Calendar (Corn & Soybeans)**:\n- **February–March**: Markets focus on planting intentions and South American harvest news\n- **March (Planting Intentions report)**: Major volatility event — reveals planned US acreage\n- **April–May**: Spring planting progress; cold/wet weather adds weather premiums\n- **June (Acreage report)**: Second major volatility event — confirms planted acres\n- **July (Pollination)**: Most critical month for corn — drought during pollination devastates yields and creates sharp price spikes ('weather premium season')\n- **August**: USDA first major crop size estimate — often triggers trend reversal\n- **September–November** (Harvest pressure): As farmers sell newly harvested crops, futures prices often face seasonal weakness ('harvest lows')\n- **December–January**: Post-harvest, attention shifts to South American planting\n\n**Weather premiums**: During weather-sensitive periods (April–July), futures prices include a 'weather risk premium' — extra pricing for the uncertainty of crop outcomes. As weather clarifies and the growing season ends, this premium typically dissipates, causing prices to fall even without a change in actual supply.\n\n**Seasonal spread trades**: Experienced traders exploit predictable patterns:\n- Long March corn / Short December corn (bet on spring tightness vs harvest pressure)\n- Long July soybeans / Short November soybeans (peak demand before harvest vs harvest weakness)",
          highlight: ["planting intentions", "acreage report", "pollination", "harvest pressure", "weather premium", "seasonal spread", "crop calendar"],
        },
        {
          type: "quiz-mc",
          question:
            "The WASDE report is published by the USDA. When is it typically released, and what is its primary purpose?",
          options: [
            "Monthly (typically the second Tuesday); it provides the definitive global supply and demand balance for major crops including ending stocks and stocks-to-use ratios",
            "Weekly (every Thursday); it tracks planted acreage and crop condition ratings across US states",
            "Quarterly (January, April, July, October); it provides annual projections for the coming crop year",
            "Annually (in January); it sets official price targets for the year based on production forecasts",
          ],
          correctIndex: 0,
          explanation:
            "The WASDE (World Agricultural Supply and Demand Estimates) is published monthly, typically on the second Tuesday of the month. It is the single most important scheduled data release in grain markets. The report covers all major crops (corn, soybeans, wheat, cotton, sugar) for the US and globally. Key statistics include: production estimates, beginning and ending stocks, the stocks-to-use ratio (the primary measure of supply tightness), and export projections. Significant surprises in ending stocks vs. analyst expectations routinely cause limit-up or limit-down moves in grain futures on release day.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Agricultural futures prices typically rise during the harvest season (September–November) as farmers bring large amounts of newly harvested grain to market.",
          correct: false,
          explanation:
            "False. Harvest season typically creates DOWNWARD pressure (harvest lows) on agricultural futures, not upward pressure. When farmers harvest and sell large volumes of grain, the surge in physical supply depresses spot and near-term futures prices. Additionally, farmers often pre-sell (hedge) a portion of their expected crop before harvest, adding futures supply pressure. Seasonally, grain prices often bottom out during and shortly after the US harvest (September–November), and then recover in the following spring as supplies tighten and uncertainty about the next crop season builds. Buying harvest lows and selling spring weather premiums is a classic seasonal strategy.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "It is July. The USDA June Acreage report showed US soybean plantings came in 3% below analyst expectations. Simultaneously, Chinese trade data shows soybean import demand running 15% above year-ago levels, and La Niña conditions are developing that could reduce South American production in early 2027.",
          question: "How should a soybean trader assess this situation?",
          options: [
            "Strongly bullish soybeans — lower US supply (acreage miss) + stronger demand (China buying) + potential South American supply reduction (La Niña) = multiple simultaneous bullish factors",
            "Neutral — the factors cancel each other out; lower US production is offset by higher China imports",
            "Bearish soybeans — La Niña typically helps US Corn Belt production and lowers prices",
            "Wait for the August WASDE before positioning — no actionable signal exists yet",
          ],
          correctIndex: 0,
          explanation:
            "Three simultaneously bullish factors align: (1) Supply shortfall: Acreage 3% below expectations means the US crop will be smaller than anticipated — starting the marketing year with less production. (2) Demand strength: China running 15% above year-ago import pace signals robust demand is outpacing expectations. (3) Forward supply risk: La Niña threatens South American production in early 2027 (February-April harvest), potentially reducing the alternative supply source that typically competes with US soybeans. When supply is being cut, current demand is strong, AND forward supply faces additional risk — that is a high-conviction bullish setup. Traders would go long November soybeans (the new-crop contract) and potentially long the March 2027 contract (South American harvest timing).",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Commodity Portfolio Strategy ───────────────────────────────────
    {
      id: "commodities-trading-5",
      title: "Commodity Portfolio Strategy",
      description:
        "Supercycles, inflation hedging, commodity indices, roll methodology, and stagflation portfolio construction",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Commodity Supercycles — History & Drivers",
          content:
            "A **commodity supercycle** is an extended multi-decade period (15–25+ years) of above-trend commodity prices, driven by structural shifts in supply and demand that take years to resolve.\n\n**Historical supercycles**:\n\n**1970s cycle** (Oil & Metals boom):\n- Drivers: Oil price shocks (1973 Arab embargo, 1979 Iran revolution), dollar weakness after Nixon ended the gold standard, supply underinvestment from low prior prices\n- Key commodities: Oil surged from $3/bbl to $35/bbl; gold from $35 to $850/oz\n\n**2000s China cycle** (2000–2014, the most significant in modern history):\n- Drivers: China's explosive industrialization and urbanization — 300+ million people moving from farms to cities requiring steel, copper, cement, coal, and oil at unprecedented scale\n- Supply underinvestment during 1980s–1990s commodity bear market meant producers couldn't respond quickly\n- Result: Copper rose 5×; oil rose from $20 to $147/bbl; iron ore surged 10×\n\n**Current cycle analysis (2020s)**:\n- **Energy transition demand**: Massive copper, lithium, cobalt, nickel requirements for EVs, solar, wind, and grid infrastructure\n- **Supply underinvestment**: 2014–2020 commodity bear market caused drastic capex cuts; new mine development takes 10–15 years\n- **Dollar weakness potential**: US fiscal deficits and debt monetization may weaken USD over time\n- **Deglobalization**: Reshoring supply chains increases commodity intensity of production\n- **Geopolitical supply disruption**: Russia-Ukraine war, Middle East tensions, Taiwan risk all add supply uncertainty\n\nSupercycles don't move in straight lines — they include multi-year corrections within the broader uptrend.",
          highlight: ["supercycle", "China industrialization", "supply underinvestment", "energy transition", "deglobalization", "dollar weakness", "capex cuts"],
        },
        {
          type: "teach",
          title: "Inflation Hedging with Commodities",
          content:
            "Commodities are often cited as inflation hedges — but the reality is nuanced. The effectiveness depends on the type of inflation and the specific commodity.\n\n**Why commodities hedge inflation**:\n- Commodity prices are inputs to most goods — when commodity prices rise, CPI follows\n- Real assets (physical goods) maintain purchasing power better than nominal assets (bonds) during inflation\n- Energy and food are direct CPI components — they ARE inflation, not just correlated with it\n\n**Inflation regime comparison**:\n\n| Asset | Mild Inflation (2–4%) | High Inflation (4–8%) | Stagflation (high inflation + low growth) |\n|---|---|---|---|\n| **Commodities** | Moderate positive | Strong positive | Very strong positive |\n| **TIPS** | Good hedge | Moderate (lagged) | Moderate |\n| **Gold** | Moderate | Strong (negative real rates) | Strong |\n| **Real Estate** | Strong (rents rise) | Strong | Mixed (rates hurt prices) |\n| **Stocks** | Strong | Mixed (margin compression) | Very negative |\n| **Nominal Bonds** | Negative | Very negative | Very negative |\n\n**Commodities in stagflation** (the unique scenario): When inflation is high AND growth is slowing, commodities are one of the few assets that remain positively positioned. This is because commodity price rises (supply shocks) are often the *cause* of stagflation — energy or food shocks simultaneously raise inflation and reduce economic growth.\n\n**Practical allocation**: Many institutional investors allocate 5–15% to commodities as a portfolio diversifier. The optimal allocation increases during inflationary regimes and when commodity supercycles are in early-to-mid phases.",
          highlight: ["inflation hedge", "TIPS", "stagflation", "real assets", "nominal bonds", "purchasing power", "institutional allocation"],
        },
        {
          type: "teach",
          title: "Commodity Indices — BCOM, GSCI & Roll Methodology",
          content:
            "Commodity indices allow investors to gain broad commodity exposure without managing individual futures positions. However, index methodology dramatically affects returns.\n\n**GSCI (S&P Goldman Sachs Commodity Index)**:\n- Weighting: Production-weighted — heavier weights to commodities produced in larger quantities\n- Result: ~60–70% energy exposure (predominantly oil and gas)\n- Very sensitive to energy price movements; high volatility\n- Appropriate for investors who want energy-heavy commodity exposure\n\n**BCOM (Bloomberg Commodity Index)**:\n- Weighting: Equal-weight cap with diversification rules — no single commodity >25%, no sector >33%\n- Result: More balanced across energy (~30%), metals (~30%), agriculture (~30%), livestock (~10%)\n- Lower volatility than GSCI; better diversification\n- Appropriate for investors seeking broad commodity diversification\n\n**Roll methodology — the hidden return drag**:\nIndex funds must continuously roll expiring futures contracts into the next month. This creates roll yield (positive or negative):\n- In **contango**: Rolling futures costs money (sell lower, buy higher) → negative roll yield → significant return drag for long-only investors\n- In **backwardation**: Rolling futures earns money (sell higher, buy lower) → positive roll yield → enhanced returns\n\n**Enhanced roll strategies**: Some index providers (BCOM Enhanced Roll, Deutsche Bank DBLCI-OY) optimize roll dates and contract selection to minimize contango costs:\n- They roll into the most backwardated or least contangoed contract\n- Can meaningfully improve returns vs simple nearest-month rolling\n\n**Spot return vs. total return**: Index performance is reported as spot return (price changes only) or total return (price changes + roll yield + T-bill collateral return). The difference can be enormous over long periods in contango markets.",
          highlight: ["GSCI", "BCOM", "production-weighted", "equal-weighted", "roll yield", "contango drag", "backwardation", "enhanced roll", "total return"],
        },
        {
          type: "quiz-mc",
          question:
            "Which of the following is the most historically reliable driver of commodity supercycles?",
          options: [
            "Prolonged supply underinvestment followed by a major new demand source that takes years for producers to respond to",
            "Central bank interest rate policy — low rates always trigger commodity supercycles",
            "Speculative hedge fund positioning — large speculative flows create self-reinforcing price trends",
            "Government stockpiling programs — nations buying strategic reserves drive secular price increases",
          ],
          correctIndex: 0,
          explanation:
            "Commodity supercycles are structural phenomena rooted in the multi-year mismatch between supply and demand. The pattern: a prolonged bear market leads producers to slash capital expenditure and close marginal operations. Then, an unexpected surge in demand (China's industrialization in the 2000s; energy transition in the 2020s) hits a supply base that is structurally undersupplied. Because developing a new mine or oil field takes 5–15 years, producers cannot respond quickly — prices must rise high enough and long enough to incentivize the needed investment. This supply lag is the essential mechanism that turns a cyclical upturn into a multi-decade supercycle.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The GSCI (Goldman Sachs Commodity Index) gives roughly equal weights to energy, metals, and agricultural commodities to provide balanced broad commodity exposure.",
          correct: false,
          explanation:
            "False. The GSCI is a production-weighted index, which results in very heavy energy weighting — typically 60–70% of the index is in energy commodities (crude oil, natural gas, refined products). This is because oil and gas are produced in far greater economic quantities than metals or agricultural goods. In contrast, the Bloomberg Commodity Index (BCOM) uses a more diversified weighting methodology with caps to limit single commodity and sector weights, resulting in roughly equal exposure across energy, metals, and agriculture. Investors seeking balanced commodity diversification typically prefer BCOM-style indices over GSCI.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor is building a portfolio for a stagflation environment: inflation is running at 7%, GDP growth has turned negative (−1%), interest rates are rising but still below inflation (nominal 4%, real rate −3%). Bonds are selling off. Equity earnings are being squeezed by rising input costs and weak consumer demand.",
          question: "Which commodity portfolio allocation best positions for this stagflation scenario?",
          options: [
            "Overweight energy (oil/gas), precious metals (gold/silver), and agricultural commodities — all benefit from high inflation, supply shocks, and real rate suppression; underweight equities and nominal bonds",
            "Overweight growth-sensitive commodities like copper and industrial metals — negative real rates always boost base metals",
            "Avoid all commodities — stagflation caused the 1970s crash and commodities always fall with equities",
            "Overweight nominal bonds — rising interest rates will eventually kill inflation and reward bond holders",
          ],
          correctIndex: 0,
          explanation:
            "Stagflation (high inflation + low/negative growth) is historically the most favorable environment for commodities as an asset class. Here's why each works: (1) Energy and agricultural commodities are often the CAUSE of stagflation (supply shocks raise prices and cut growth) — so they benefit from the same dynamics creating the macro problem. (2) Gold thrives with negative real rates (−3% here) and as a safe haven during economic uncertainty. (3) Silver gains from both gold's monetary tailwind and ongoing industrial demand. Nominal bonds lose in real terms (positive real rates destroy bond value; negative real rates are even worse for holders). Equities face the worst combination: margin compression from rising costs AND multiple compression from rising rates AND weak demand from slowing growth. Commodities are the classic stagflation hedge.",
          difficulty: 3,
        },
      ],
    },
  ],
};
