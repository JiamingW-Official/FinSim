import type { Unit } from "./types";

export const UNIT_ECONOMIC_CYCLES: Unit = {
  id: "economic-cycles",
  title: "Economic & Market Cycles",
  description:
    "Master business cycles, Kondratieff waves, credit cycles, commodity supercycles, and how to profit from cycle timing",
  icon: "🔄",
  color: "#6366f1",
  lessons: [
    // ─── Lesson 1: Business Cycle Framework ──────────────────────────────────────
    {
      id: "ec-1",
      title: "🔄 Business Cycle Framework",
      description:
        "Four phases of the business cycle, NBER recession definition, leading vs lagging indicators, and sector rotation strategy",
      icon: "🔄",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📊 The Four Phases of the Business Cycle",
          content:
            "Every economy moves through a recurring sequence of phases that shape corporate profits, employment, inflation, and asset prices.\n\n**Expansion:**\nGDP is growing, unemployment is falling, consumer and business confidence is rising. Credit is available and cheap. Corporate earnings accelerate. This is the longest phase — US post-WWII expansions average **65 months**.\n\n**Peak:**\nGrowth has topped out. Capacity utilization is high, wages are rising, inflation begins to build. The economy is operating at or above potential. Leading indicators start to roll over before the data confirms the peak.\n\n**Contraction (Recession):**\nGDP is declining, unemployment is rising, corporate margins compress. Credit tightens as lenders grow cautious. Inventories rise unexpectedly. Post-WWII US recessions average only **11 months** — shorter than expansions.\n\n**Trough:**\nThe economy bottoms. Leading indicators turn up before GDP officially recovers. Markets typically bottom 6 months before the trough is confirmed by economists.",
          highlight: ["expansion", "peak", "contraction", "trough", "65 months", "11 months"],
        },
        {
          type: "teach",
          title: "📉 NBER Recessions & Economic Indicators",
          content:
            "How do economists know when a recession starts and ends?\n\n**NBER recession definition:**\nThe National Bureau of Economic Research (NBER) defines a recession as \"a significant decline in economic activity spread across the economy, lasting more than a few months.\" The common shorthand — \"two consecutive quarters of negative GDP\" — is a rule of thumb, not the official definition. NBER looks at employment, income, output, and sales holistically.\n\n**Leading indicators (move before the economy):**\n- **Yield curve**: 2-year/10-year spread inverting has preceded every US recession since 1968\n- **ISM Manufacturing PMI**: below 50 = contraction; below 45 = recession territory\n- **Housing starts**: turn down 6–12 months ahead of recessions\n- **Conference Board LEI**: composite of 10 leading indicators\n\n**Coincident indicators (move with the economy):**\n- GDP, personal income, industrial production, nonfarm payrolls\n\n**Lagging indicators (confirm after the turn):**\n- Unemployment rate (firms hire last, fire last)\n- CPI inflation (lags output by 12–18 months)\n- Bank loan delinquencies",
          highlight: ["NBER", "leading indicators", "yield curve", "PMI", "lagging indicators", "coincident"],
        },
        {
          type: "teach",
          title: "🔃 Sector Rotation by Cycle Phase",
          content:
            "Different sectors of the stock market outperform at different stages of the business cycle because their revenues and margins are tied to economic conditions.\n\n**Early expansion (recovery):**\nConsumer discretionary, financials, and industrials lead. Consumers start spending again; banks see loan growth; factories ramp output. Small caps typically outperform large caps early in recoveries.\n\n**Mid expansion:**\nTechnology and healthcare outperform as corporate capital spending accelerates. Innovation investment rises when the cycle is well established.\n\n**Late expansion:**\nEnergy and materials outperform as commodity demand peaks and inflation rises. Wage pressure and rising rates begin to squeeze margin-sensitive sectors.\n\n**Recession:**\nDefensives dominate: **consumer staples** (food, household products), **utilities** (inelastic demand), **healthcare** (non-discretionary). These businesses earn relatively stable revenues regardless of economic conditions.\n\n**The playbook in practice:**\nCycle positioning is rarely clean — turning points are recognized only in hindsight. Most professional managers rotate sector weights by 3–5 percentage points, not wholesale repositioning.",
          highlight: ["sector rotation", "consumer staples", "utilities", "early expansion", "late expansion", "recession"],
        },
        {
          type: "quiz-mc",
          question:
            "PMI is below 50 and falling, unemployment is rising, and housing starts have been declining for six months. Which phase of the business cycle does this most likely indicate?",
          options: [
            "Contraction — PMI below 50 signals manufacturing is shrinking and the leading indicators confirm deteriorating conditions",
            "Early expansion — unemployment lags the cycle, and PMI often dips temporarily before recovering",
            "Peak — these are the typical signs of an overheating economy before growth accelerates",
            "Trough — all cycle bottoms are characterized by negative PMI and rising unemployment before recovery",
          ],
          correctIndex: 0,
          explanation:
            "PMI below 50 and falling means manufacturing output is contracting. Unemployment rising is a coincident/lagging confirmation. Housing starts turning down 6+ months ago signals the leading indicator already flagged the slowdown. Together, these point to an active contraction phase. The trough would be identified by PMI starting to bottom and leading indicators turning up — neither of which is happening here.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The NBER's official recession definition requires two consecutive quarters of negative GDP growth before it will declare a recession has begun.",
          correct: false,
          explanation:
            "False. The 'two consecutive quarters of negative GDP' rule is a popular shorthand, not the NBER's official definition. The NBER Business Cycle Dating Committee defines a recession as a significant, broad-based, sustained decline in economic activity, evaluated across multiple metrics including employment, real income, industrial production, and retail sales. The NBER often declares recession start dates months after the fact — for instance, it declared the COVID recession started in February 2020 in June 2020.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Credit & Financial Cycles ──────────────────────────────────────
    {
      id: "ec-2",
      title: "💳 Credit & Financial Cycles",
      description:
        "Minsky moments, debt supercycles, Dalio's beautiful deleveraging, and Shiller CAPE mean reversion",
      icon: "💳",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📈 The Credit Expansion Cycle",
          content:
            "Credit is the oxygen of a modern economy — and its expansion and contraction drives financial cycles that are longer and more destructive than normal business cycles.\n\n**The expansion phase:**\nIn good times, lenders compete aggressively. Lending standards loosen: down payments fall, covenant protections weaken, debt-to-income ratios rise. Borrowers take on more leverage because assets are appreciating and servicing debt feels easy.\n\n**Feedback loops reinforce the boom:**\n- Rising asset prices increase collateral values → more credit is extended → prices rise further\n- Corporate earnings look strong → buybacks and dividends rise → more leverage\n- Risk appetite grows — investors reach for yield in riskier instruments\n\n**The contraction phase:**\nA trigger (could be small) causes asset prices to wobble. Collateral values fall. Lenders tighten standards abruptly. Borrowers with insufficient equity must sell assets. Selling begets more selling — a deleveraging spiral.\n\n**The amplification mechanism:**\nCredit cycles last **15–20 years** peak to trough — far longer than 3–5 year business cycles. The 1920s credit boom set up the 1930s depression. The 1980s–2000s credit expansion set up 2008.",
          highlight: ["credit cycle", "leverage", "collateral", "deleveraging", "lending standards", "feedback loop"],
        },
        {
          type: "teach",
          title: "💥 Minsky Moments: Stability Breeds Instability",
          content:
            "Economist Hyman Minsky argued that financial stability is inherently self-destabilizing — long periods of calm plant the seeds of the next crisis.\n\n**Minsky's three stages of borrower finance:**\n\n**1. Hedge finance (stable):**\nBorrowers can repay both principal and interest from operating cash flows. Debt is sustainable. This describes the early expansion — companies and households are cautious after a prior crisis.\n\n**2. Speculative finance (fragile):**\nBorrowers can only pay interest; they rely on refinancing or asset appreciation to repay principal. Still manageable, but dependent on continued access to credit markets.\n\n**3. Ponzi finance (unstable):**\nBorrowers cannot pay either principal or interest from cash flows — they need asset prices to keep rising to meet obligations. This is the terminal stage. Any price decline triggers default.\n\n**The Minsky Moment:**\nWhen Ponzi finance becomes widespread, a sudden reversal occurs — asset sales accelerate, credit dries up instantly, and prices collapse far faster than they rose. The 2008 housing market and 2000 dot-com bubble are classic Minsky Moments.\n\n**The irony**: The longer the stability, the more complacent lenders become and the more Ponzi borrowers accumulate — making the eventual crash worse.",
          highlight: ["Minsky", "Minsky moment", "hedge finance", "speculative finance", "Ponzi finance", "stability breeds instability"],
        },
        {
          type: "teach",
          title: "🔄 Dalio's Beautiful Deleveraging & CAPE Mean Reversion",
          content:
            "When a debt supercycle peaks, the deleveraging can be deflationary and destructive — or it can be managed into a \"beautiful\" transition.\n\n**Ray Dalio's deleveraging types:**\n\n**Ugly deflationary deleveraging** (Great Depression): Too much austerity, not enough stimulus. Debt burdens rise because incomes fall faster. Deflation makes debt harder to repay.\n\n**Ugly inflationary deleveraging** (Weimar Germany, 1920s Zimbabwe): Too much money printing relative to debt restructuring. Currency collapses.\n\n**Beautiful deleveraging** (US post-2008): The right mix of:\n- Debt restructuring (write-offs, workouts) — reduces the numerator\n- Austerity (spending cuts) — reduces new borrowing\n- Wealth redistribution (tax increases on wealth)\n- Money printing (QE) at a pace that offsets deflation without causing runaway inflation\n\nPost-2008, the US managed a relatively beautiful deleveraging: debt/GDP fell gradually while nominal growth remained positive.\n\n**Shiller CAPE (Cyclically Adjusted P/E):**\nRobert Shiller's CAPE ratio smooths 10 years of earnings to remove cycle noise. Historically, when CAPE exceeds 30×, subsequent 10-year returns are poor. When CAPE falls below 10×, future returns are typically excellent. Mean reversion plays out over **10–15 year** horizons — too slow for most investors to exploit, but reliable at extremes.",
          highlight: ["Dalio", "beautiful deleveraging", "debt restructuring", "QE", "Shiller CAPE", "mean reversion", "debt supercycle"],
        },
        {
          type: "quiz-mc",
          question:
            "A bank is extending loans to real estate developers who cannot generate enough rental income to cover interest payments — they are relying on continued property price appreciation to refinance and meet obligations. Which Minsky stage does this describe?",
          options: [
            "Ponzi finance — borrowers need asset price appreciation to service debt, not operating cash flows",
            "Speculative finance — borrowers can cover interest but need to refinance principal",
            "Hedge finance — the loans are backed by real assets with stable collateral values",
            "The Minsky Moment itself — this describes the immediate aftermath of a credit crisis",
          ],
          correctIndex: 0,
          explanation:
            "Ponzi finance is defined as borrowers who cannot pay either principal or interest from operating cash flows — they depend entirely on the continued appreciation of assets to refinance. The developers here cannot cover even their interest costs from rental income; they need rising prices to exit or refinance. This is the most dangerous Minsky stage. Speculative finance would mean they can cover interest but not principal repayment. The Minsky Moment is the sudden reversal that follows — the crisis event itself.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "After a severe financial crisis, a country faces: total private debt at 280% of GDP, falling asset prices, rising unemployment, and deflation of -1.5% per year. The central bank is buying government bonds (QE), the government is running modest budget deficits, and banks are writing off bad loans. Real GDP growth is slightly positive.",
          question:
            "Based on Dalio's framework, how would you characterize this deleveraging?",
          options: [
            "Beautiful deleveraging — the mix of debt writedowns, fiscal stimulus, and measured money printing is keeping nominal growth positive while reducing debt burdens",
            "Ugly deflationary deleveraging — deflation is present and debt burdens are rising in real terms despite other measures",
            "Ugly inflationary deleveraging — QE will inevitably trigger hyperinflation and currency collapse",
            "No deleveraging is occurring — debt at 280% of GDP means the cycle has not yet peaked",
          ],
          correctIndex: 0,
          explanation:
            "The key signal is that real GDP growth is slightly positive — income is growing faster than debt. The deflation of -1.5% is mild and being offset by QE. Banks are writing down bad loans (debt restructuring), the government is providing modest fiscal support, and the central bank is printing money at a pace that prevents deeper deflation. This combination — where nominal growth marginally exceeds debt reduction rates — is what Dalio calls a 'beautiful deleveraging.' The debt/GDP ratio will gradually decline over years without a depression.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Commodity Supercycles ─────────────────────────────────────────
    {
      id: "ec-3",
      title: "⛏️ Commodity Supercycles",
      description:
        "Historical supercycles from industrialization to China's rise, supply response lags, and the green energy transition",
      icon: "⛏️",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📜 Historical Commodity Supercycles",
          content:
            "A commodity supercycle is a prolonged period of above-trend commodity prices, driven by a structural shift in demand that outpaces the supply response. They typically last **15–20 years**.\n\n**The four modern supercycles:**\n\n**1. 1890s–1910s (US Industrialization):**\nRapid US railroad expansion and urbanization drove demand for steel, copper, and coal. Output of US steel rose 10× in 20 years. Commodity prices peaked around 1917 with WWI demand.\n\n**2. 1930s–1940s (WWII Rearmament):**\nGlobal rearmament and then wartime production drove an enormous industrial demand surge. Metals, oil, and agricultural prices all spiked.\n\n**3. 1970s (Oil Supercycle):**\nOPEC's pricing power, post-Bretton Woods dollar weakness, and surging global energy demand created the oil supercycle. WTI went from $3 to $35 per barrel (1973–1980).\n\n**4. 2000s–2010s (China Urbanization):**\nChina's infrastructure-led growth model required enormous quantities of every industrial commodity. China accounts for ~50% of global cement and steel consumption. Copper rose from $0.60/lb to $4.60/lb (2002–2011). Iron ore rose 10×.\n\nEach supercycle ended when high prices triggered enough supply investment and demand destruction to bring the market back into balance.",
          highlight: ["supercycle", "15-20 years", "China urbanization", "OPEC", "oil supercycle", "demand destruction"],
        },
        {
          type: "teach",
          title: "⏳ Supply Response Lag: Why Prices Overshoot",
          content:
            "The defining feature of commodity markets is the extreme lag between rising prices and new supply — this is why supercycles last so long and prices overshoot so dramatically.\n\n**The mining project timeline:**\n- **Discovery**: geological survey and initial drilling — 1–3 years\n- **Feasibility study**: engineering, environmental impact, financing — 2–4 years\n- **Permitting**: regulatory approvals — 1–5 years (often the longest stage)\n- **Construction**: building mine infrastructure — 3–5 years\n- **Total**: a major copper or lithium mine typically takes **10–15 years** from discovery to first commercial production\n\n**The oil cycle as a template:**\n1. Demand rises, prices rise\n2. High prices cause demand destruction (consumers switch, improve efficiency)\n3. High prices eventually trigger massive capex investment\n4. Years later, new supply comes online — often simultaneously with a demand slowdown\n5. Supply glut → price collapse → capex collapses → underinvestment\n6. Eventual supply shortage → next price spike\n\n**The result:** Commodity markets are structurally prone to boom-bust cycles because the supply side cannot respond quickly to price signals. This makes commodity investing inherently cyclical — timing matters enormously.",
          highlight: ["supply lag", "10-15 years", "capex", "permitting", "boom-bust", "demand destruction"],
        },
        {
          type: "teach",
          title: "🌱 The Green Energy Supercycle",
          content:
            "The energy transition from fossil fuels to renewables is widely identified as the driver of the current commodity supercycle — with different winners and losers than prior cycles.\n\n**The demand drivers:**\n- **Electric vehicles**: A single EV uses ~80 kg of copper vs ~20 kg for an ICE vehicle. Global EV sales need to rise from 10M to 100M+ per year to meet climate targets.\n- **Solar panels**: Each GW of solar capacity requires ~4,000 tons of copper and significant quantities of silver and silicon\n- **Wind turbines**: Offshore wind uses 8,000+ tons of copper per GW; rare earth magnets need neodymium\n- **Battery storage**: Grid-scale batteries require lithium, cobalt, nickel, and manganese\n\n**Critical metals in demand:**\n- **Copper**: The essential conductor for all electricity transmission; no viable substitute at scale\n- **Lithium**: The key battery anode material — from 0.5M tons/year demand today toward 4M+ by 2040\n- **Nickel**: High-nickel cathodes for energy-dense EV batteries\n- **Cobalt**: Battery cathodes (though manufacturers are reducing cobalt content)\n\n**The supply problem:** Most of these metals have the same 10-15 year project development timeline. Capex collapsed after the 2015-2016 commodity bust. A structural supply gap is building.",
          highlight: ["green energy", "copper", "lithium", "nickel", "cobalt", "EV", "energy transition", "supply gap"],
        },
        {
          type: "quiz-mc",
          question:
            "China's rapid urbanization and infrastructure-led growth drove the 2000s commodity supercycle. What is the primary driver identified for the current commodity supercycle?",
          options: [
            "The energy transition to renewables — EVs, solar, and wind require copper, lithium, nickel, and cobalt at massive scale",
            "India's urbanization — India is now where China was in 2001 in terms of infrastructure investment needs",
            "US infrastructure stimulus — the Infrastructure Investment and Jobs Act requires vast quantities of steel and concrete",
            "Post-COVID restocking — supply chains are rebuilding inventories after being depleted during the pandemic",
          ],
          correctIndex: 0,
          explanation:
            "The energy transition is the structural demand driver most analogous to China's urbanization — it is a decades-long, policy-driven transformation requiring enormous quantities of specific metals. An EV uses 4× more copper than a gasoline car; a wind turbine requires orders of magnitude more copper per unit of electricity than a gas plant. With 10-15 year supply response lags and underinvestment since the 2015-16 commodity bust, a structural supply gap in transition metals is widely anticipated. India's urbanization is real but less transformative on the industrial metals complex than China's was.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Because commodity markets respond quickly to price signals — with new mines coming online within 1-2 years of a price spike — supercycles tend to last only 3-5 years before supply catches up to demand.",
          correct: false,
          explanation:
            "False. The defining feature of commodity supercycles is precisely the opposite: supply response is extremely slow. A new copper or lithium mine typically takes 10-15 years from discovery through permitting, construction, and commissioning to reach commercial production. This structural supply lag is why supercycles persist for 15-20 years — prices remain elevated for far longer than normal inventory-driven commodity cycles because new supply cannot respond quickly to price signals.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 4: Real Estate Cycles ─────────────────────────────────────────────
    {
      id: "ec-4",
      title: "🏠 Real Estate Cycles",
      description:
        "Harrison's 18-year land cycle, four phases of real estate, interest rate sensitivity, and supply inelasticity",
      icon: "🏠",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📐 Harrison's 18-Year Real Estate Cycle",
          content:
            "British economist Fred Harrison documented a remarkably consistent 18-year real estate cycle going back centuries in the UK and US. The pattern has repeated with striking regularity.\n\n**The four phases:**\n\n**1. Recovery (years 1–4):**\nAfter a crash, prices are depressed and transaction volumes are low. Buyers are cautious; credit is tight. Rental demand strengthens because buying is unappealing. Prices begin to slowly recover in prime locations first.\n\n**2. Expansion (years 4–14):**\nRising prices attract more buyers. Credit eases. New construction accelerates as developers respond to rising land values. Employment in construction and real estate grows. This is the longest and most enjoyable phase — the \"mid-cycle\" dip around year 7 often causes false alarms.\n\n**3. Hypersupply (years 14–16):**\nConstruction responds vigorously to peak demand. Vacancy rates start rising even as building continues (completions are pre-committed 2–3 years earlier). Prices plateau or slow.\n\n**4. Recession (years 16–18):**\nOversupply meets slowing demand. Transaction volumes collapse. Forced selling by over-leveraged owners accelerates the decline. Prices can fall 20–50% in speculative markets.\n\n**Historical fit**: Major US real estate busts in 1929, 1947, 1965, 1979, 1990, 2008 — roughly 18 years apart. The next peak by this framework was projected around 2024–2026.",
          highlight: ["18-year cycle", "Harrison", "recovery", "expansion", "hypersupply", "recession", "land cycle"],
        },
        {
          type: "teach",
          title: "🏢 Residential vs Commercial vs Industrial Real Estate",
          content:
            "Not all real estate moves together. Each sector has distinct cycle timing, demand drivers, and risk characteristics.\n\n**Residential real estate:**\n- Driven by household formation, income growth, mortgage rates, and population migration\n- Most sensitive to interest rate changes — a 100 bps rise in mortgage rates reduces affordability by ~10-15%\n- Highly supply-inelastic in desirable urban markets (permitting, NIMBY constraints, land scarcity)\n- COVID created a massive structural shift: remote work → suburban and sunbelt migration → divergent local markets\n\n**Commercial real estate (office, retail):**\n- Driven by employment levels, business investment, and consumer traffic\n- Longer lease terms (5–10 years) mean vacancies appear with a lag after economic turns\n- The office sector faces a structural secular headwind from hybrid work — not just a cycle\n- Retail faces secular decline from e-commerce; industrial/logistics is the beneficiary\n\n**Industrial/logistics real estate:**\n- Warehouse and distribution space — the fastest-growing sector\n- Driven by e-commerce fulfillment needs; supply chains reshoring\n- Cap rates compressed dramatically 2020–2022; now facing rising rate headwinds\n\n**Key insight:** Real estate cycles are local as much as national. San Francisco office and Miami residential can be in completely opposite phases simultaneously.",
          highlight: ["residential", "commercial", "industrial", "logistics", "interest rate", "hybrid work", "supply inelastic"],
        },
        {
          type: "teach",
          title: "⏱️ Supply Inelasticity & Why Prices Overshoot",
          content:
            "Real estate prices overshoot because supply cannot respond quickly to demand signals — a structural feature that creates boom-bust cycles.\n\n**The construction pipeline:**\nFrom land purchase to occupancy, a mid-rise residential building typically takes **2–5 years**:\n- Land acquisition and entitlement: 1–2 years\n- Architectural design and permitting: 6–18 months\n- Construction: 12–36 months\n\nBy the time new supply is delivered, demand may have already cooled — developers are responding to yesterday's price signal.\n\n**Zoning and regulatory constraints:**\nIn high-demand cities (New York, San Francisco, London), restrictive zoning prevents densification. Single-family zoning laws, height limits, and lengthy permitting mean supply cannot respond even when prices are screaming for more units.\n\n**Interest rate sensitivity:**\nA simplified rule of thumb: a **100 bps rise in mortgage rates** reduces affordability by roughly **10–15%**, all else equal, because it raises monthly payments on the same loan size.\n\nExample: A $500,000 mortgage at 3% = $2,108/month. At 4% = $2,387/month (+13%). At 7% = $3,327/month (+58%).\n\nThis is why the 2022 rate hike cycle caused such rapid price corrections — rates rose from 3% to 7% in 18 months, an extraordinary affordability shock.",
          highlight: ["supply inelasticity", "2-5 years", "zoning", "100 bps", "mortgage rates", "affordability", "permitting"],
        },
        {
          type: "quiz-mc",
          question:
            "Commercial real estate vacancy rates are rising, yet construction cranes are still visible across the city skyline, with significant new supply scheduled to complete over the next 12 months. Which phase of the real estate cycle does this most likely indicate?",
          options: [
            "Hypersupply — construction commitments made at peak demand are delivering while demand softens, pushing vacancies higher",
            "Expansion — rising vacancy is temporary; the new supply will attract businesses and drive economic growth",
            "Recovery — vacancy rates typically rise at the bottom of the cycle before new demand absorbs empty space",
            "Recession — no new construction would be occurring if the market were in hypersupply",
          ],
          correctIndex: 0,
          explanation:
            "Hypersupply is precisely defined by this combination: vacancy rates rising while construction activity remains high. This happens because construction was committed 2-3 years earlier when demand was strong and prices were rising. By the time supply delivers, demand has softened — but the pipeline cannot be stopped. The hypersupply phase transitions to recession when vacancy rises enough to suppress new rents and force distressed selling. Active construction during rising vacancy is the signature of this phase.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A city has a 30-year mortgage rate of 3% in 2021. By 2023, rates have risen to 7%. A first-time buyer targeting a monthly payment of $2,500 can now afford a significantly smaller loan than in 2021.",
          question:
            "Approximately how much less can this buyer afford to borrow at 7% compared to 3%, assuming the same $2,500 monthly payment budget?",
          options: [
            "Approximately 35-40% less borrowing power — at 7% a $2,500/month budget supports ~$375,000 vs ~$590,000 at 3%",
            "Approximately 10-15% less — mortgage rate changes have only a small effect on purchasing power",
            "Approximately 50-60% less — doubling the rate more than halves the affordable loan amount",
            "No change — buyers simply extend their loan term from 30 to 40 years to maintain purchasing power",
          ],
          correctIndex: 0,
          explanation:
            "At 3%, a $2,500/month budget for principal and interest supports approximately a $590,000 mortgage (30-year). At 7%, the same $2,500/month supports only approximately $376,000 — roughly 36% less borrowing power. This is the mechanism behind 2022-2023 real estate price corrections: buyers' budgets shrank dramatically even though their incomes didn't change. This directly translates to lower bid prices, slowing transaction volumes, and eventually nominal price declines in many markets.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Profiting from Cycles ──────────────────────────────────────────
    {
      id: "ec-5",
      title: "💡 Profiting from Cycles",
      description:
        "Tactical asset allocation, contrarian signals, late-cycle playbooks, and why consensus forecasters miss turning points",
      icon: "💡",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🗂️ Tactical Asset Allocation by Cycle",
          content:
            "Tactical asset allocation (TAA) adjusts portfolio weights based on the current economic cycle phase — seeking to be overweight assets that tend to outperform each phase.\n\n**Recession positioning:**\n- Overweight: **government bonds** (flight to safety, rate cuts), **cash**, **consumer staples**, **utilities**, **healthcare**\n- Underweight: financials, industrials, small caps, high-yield credit\n- Rationale: defensive assets have stable cash flows; central banks cut rates (boosting bond prices)\n\n**Early expansion:**\n- Overweight: **financials** (loan growth recovers), **consumer discretionary** (spending rises), **small caps** (highest beta to recovery), **high-yield credit** (spreads tighten)\n- Underweight: bonds (yields rising as growth recovers), utilities\n\n**Mid expansion:**\n- Overweight: **technology**, **healthcare**, **growth equities** broadly\n- This is the 'goldilocks' phase — the longest and most rewarding period for equity investors\n\n**Late expansion:**\n- Overweight: **energy**, **materials**, **commodities**, **inflation-linked bonds (TIPS)**\n- Underweight: rate-sensitive sectors (utilities, REITs, long-duration bonds) as inflation and rate expectations rise\n\n**Important caveat:** TAA adds modest value on average (0.5–1.5% per year) and can significantly detract value when the cycle call is wrong. Most professional managers use modest tilts rather than all-in repositioning.",
          highlight: ["tactical asset allocation", "recession", "early expansion", "late expansion", "defensive assets", "government bonds"],
        },
        {
          type: "teach",
          title: "🔁 Contrarian Signals & Peak Pessimism",
          content:
            "The most powerful — and psychologically difficult — edge in cycle investing is acting against consensus sentiment at extremes.\n\n**The magazine cover indicator:**\nBusiness media reflects consensus sentiment. The famous **BusinessWeek** 'Death of Equities' cover in August 1979 appeared at almost the exact bottom for real returns. Similar contrarian signals:\n- Forbes 'Crypto Is Dead' stories tend to appear near bottoms\n- Covers celebrating market booms frequently coincide with peaks\n\n**The Buffett rule:**\n*\"Be fearful when others are greedy, and greedy when others are fearful.\"*\nThis is easy to say, hard to execute. Markets can remain at extremes far longer than seems rational.\n\n**Quantitative sentiment measures:**\n- **AAII Bullish/Bearish ratio**: When bears exceed 50%, historically bullish over the next 12 months\n- **Put/Call ratio**: Elevated put buying (>1.2) signals excessive fear — often a contrarian buy\n- **VIX above 40**: Historically signals panic bottoms; VIX above 40 has preceded strong 12-month returns in all historical cases\n- **Fund manager cash levels** (BofA Survey): When cash > 5%, managers are defensively positioned — a contrarian buy signal\n\n**Why it works:** Extreme fear means most sellers have already sold; extreme greed means most buyers have already bought. The marginal future buyer/seller is the surprise.",
          highlight: ["contrarian", "peak pessimism", "AAII", "VIX", "put/call ratio", "Business Week", "Buffett"],
        },
        {
          type: "teach",
          title: "📉 Late-Cycle Playbook & Fading the Consensus",
          content:
            "The late cycle and turning-point phases are where most investors underperform — and where disciplined cycle awareness creates the most durable edge.\n\n**Late-cycle warning signals:**\n- **Yield curve flat or inverted**: 2/10 spread below 0% has preceded every US recession since 1968 (with 12–18 month lead time)\n- **Credit spreads widening**: High-yield spreads expanding from tight levels signal rising default risk — credit markets often lead equities\n- **PMI peaking**: ISM Manufacturing PMI rolling over from above 60 is a classic late-cycle signal\n- **Fed hiking cycle long in the tooth**: When the Fed has been hiking for 12+ months, cumulative rate effects begin to bite\n\n**The late-cycle playbook:**\n1. Reduce beta (overall equity weight)\n2. Rotate from cyclicals into defensives\n3. Add duration in bonds (rates will fall in recession)\n4. Consider commodities short-term (energy often spikes late cycle)\n5. Raise cash — optionality for buying at cycle lows\n\n**Why consensus forecasters miss turning points:**\nEconomic models are backward-looking (extrapolate recent data). Forecasters face career risk for making contrarian calls early. As a result, consensus GDP forecasts rarely predict recessions — the IMF and Fed have missed virtually every recession in real time. The average Wall Street strategist raised their S&P 500 year-end target by 10% at the 2000 and 2007 peaks.",
          highlight: ["yield curve inversion", "credit spreads", "PMI", "late cycle", "duration", "consensus forecasters", "career risk"],
        },
        {
          type: "quiz-mc",
          question:
            "The economy is in the late cycle: the yield curve is flat (2/10 spread near 0%), credit spreads are 150 bps wider than their tightest level six months ago, and the ISM Manufacturing PMI has been declining from a high of 62. What is the appropriate tactical playbook?",
          options: [
            "Reduce equity beta, rotate from cyclicals to defensives, add bond duration, and raise cash — all signals point to late cycle transitioning to contraction",
            "Increase equity exposure aggressively — a flat yield curve signals growth is re-accelerating and the expansion has more room to run",
            "Buy energy and materials heavily — late cycle always produces a commodity supercycle peak that rewards commodities investors",
            "Shift entirely into cash — a recession is certain within 30 days based on these signals",
          ],
          correctIndex: 0,
          explanation:
            "The combination of a flat yield curve, widening credit spreads, and a declining PMI from peak levels is the textbook late-cycle signal set. The appropriate response is to gradually reduce risk: cut equity beta (shift from cyclicals to defensives), add bond duration (bonds appreciate when the cycle turns and rates fall), and raise cash as optionality for the eventual cycle bottom. An aggressive all-in cash move is premature — yield curve inversion leads recession by 12-18 months on average, and markets often continue rising into the first 6-12 months of inversion. The playbook is measured de-risking, not panic.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "It is early 2009. The S&P 500 has fallen 50% from its peak. Unemployment is at 8.5% and rising. Every major bank is receiving government bailouts. AAII bearish sentiment is at 70%. The VIX is at 45. BusinessWeek runs a cover story: 'The End of Wall Street As We Know It.' Every economist surveyed predicts GDP will fall further in 2009.",
          question:
            "Based on contrarian cycle analysis, what does this environment suggest for the forward 12-month outlook for equities?",
          options: [
            "Historically bullish setup — peak pessimism (70% bears, VIX 45, negative media consensus) following a 50% decline has preceded strong 12-month equity returns in every historical case",
            "Continued bearish — these indicators confirm the structural bear market will persist for another 2-3 years minimum",
            "Neutral — negative signals cancel out positive contrarian signals making the outlook unknowable",
            "Bearish because rising unemployment means consumer spending will collapse, driving further earnings declines",
          ],
          correctIndex: 0,
          explanation:
            "This describes the March 2009 environment almost exactly — which turned out to be the exact bottom of the financial crisis bear market. Every contrarian indicator was at an extreme: VIX at 45 (historically a panic bottom signal), AAII bears at 70% (most sellers had already sold), 50% price decline (massive margin of safety), and universal negative media consensus. The S&P 500 returned +68% in the 12 months following March 9, 2009. The mechanism: at peak pessimism, most potential sellers have already sold. The remaining buyers face a market with embedded 'fear premium' that unwinds rapidly when even marginally better news arrives.",
          difficulty: 3,
        },
      ],
    },
  ],
};
