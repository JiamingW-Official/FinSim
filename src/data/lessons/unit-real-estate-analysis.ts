import type { Unit } from "./types";

export const UNIT_REAL_ESTATE_ANALYSIS: Unit = {
 id: "real-estate-analysis",
 title: "Real Estate Analysis",
 description:
 "Deep-dive into property valuation, rental math, leverage, market analysis, commercial real estate, and REITs",
 icon: "Building2",
 color: "#0ea5e9",
 lessons: [
 // Lesson 1: Property Valuation 
 {
 id: "rea-1",
 title: "Property Valuation Methods",
 description:
 "Income approach, sales comparison, cost approach, GRM, and value-add vs stabilized properties",
 icon: "DollarSign",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Three Approaches to Property Valuation",
 content:
 "Professional appraisers and sophisticated investors use three distinct frameworks to value real estate. Using all three and triangulating gives the most reliable estimate.\n\n**1. Income Approach (most common for investment property):**\nValue = NOI / Cap Rate\n- A property earning $80,000 NOI with a 5% market cap rate is worth $1,600,000.\n- The cap rate is derived from comparable sales in the market — it is a market-determined number.\n- Best used for: multifamily, commercial, anything with rental income.\n\n**2. Sales Comparison Approach (comps):**\n- Find 3–5 recent sales of similar properties (same neighborhood, size, condition).\n- Adjust each comp for differences (extra bath = +$10k, older roof = -$15k, etc.).\n- Weight adjusted comp values to arrive at an indicated value.\n- Best used for: single-family homes, condos, land.\n\n**3. Cost Approach:**\nValue = Land Value + Replacement Cost of Improvements Depreciation\n- Ask: \"What would it cost to rebuild this property from scratch?\"\n- Depreciation includes physical deterioration, functional obsolescence (outdated layout), and external obsolescence (neighborhood decline).\n- Best used for: new construction, special-use properties, insurance purposes.",
 highlight: [
 "income approach",
 "sales comparison",
 "cost approach",
 "NOI",
 "cap rate",
 "depreciation",
 ],
 },
 {
 type: "teach",
 title: "GRM and Value-Add vs Stabilized Properties",
 content:
 "**Gross Rent Multiplier (GRM):**\nGRM = Purchase Price / Annual Gross Rent\n- A property priced at $500,000 collecting $50,000/year in gross rent has a GRM of 10.\n- Lower GRM generally signals a better deal, but GRM ignores all expenses — use it for quick screening only, never as the sole metric.\n- GRM is useful for comparing similar properties in the same market and asset class.\n\n**Value-Add Properties:**\n- Purchased below market value because they have unrealized potential: below-market rents, deferred maintenance, poor management, or vacant units.\n- Investor thesis: renovate units, improve management, raise rents to market rate — then refinance or sell at a lower (compressed) cap rate.\n- Higher risk profile (execution risk, capex overruns) but higher return potential.\n- Key metric: Spread between in-place NOI cap rate and pro-forma cap rate after stabilization.\n\n**Stabilized Properties:**\n- Fully leased at market rents, well-maintained, professionally managed.\n- Lower going-in yield but predictable cash flows and easier financing.\n- Cap rates are lower (investors pay a premium for certainty).\n- Preferred by institutional buyers (pension funds, REITs, insurance companies).\n\n**Rule of thumb:** Value-add deals should target at least a 150–200 bps spread between going-in cap rate and stabilized cap rate to justify the execution risk.",
 highlight: [
 "GRM",
 "value-add",
 "stabilized",
 "in-place NOI",
 "pro-forma",
 "cap rate compression",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "An apartment building generates $120,000 of NOI. Comparable buildings in the same market have recently sold at a 6% cap rate. Using the income approach, what is the estimated property value?",
 options: [
 "$2,000,000 — NOI divided by cap rate",
 "$7,200 — NOI multiplied by cap rate",
 "$720,000 — NOI plus cap rate multiplied by 100",
 "$1,200,000 — NOI multiplied by 10",
 ],
 correctIndex: 0,
 explanation:
 "Income Approach: Value = NOI / Cap Rate = $120,000 / 0.06 = $2,000,000. The cap rate acts as a divisor — a lower cap rate means a higher valuation for the same NOI, reflecting lower perceived risk or higher market demand.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "The Gross Rent Multiplier (GRM) is a more accurate valuation tool than the income approach because it accounts for operating expenses.",
 correct: false,
 explanation:
 "False. GRM is a quick screening metric only — it deliberately ignores operating expenses, vacancy, and capital expenditures. The income approach (NOI / cap rate) is far more accurate because NOI already accounts for all operating costs. GRM can lead to poor decisions if expense ratios differ significantly between properties.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You find a duplex priced at $400,000. Current rents are $800/month per unit — well below the $1,200 market rent. The property needs $40,000 in renovations. After renovations, comparable duplexes sell at a 5.5% cap rate. Operating expenses run 40% of gross rents.",
 question:
 "What is your investment thesis and how should you evaluate this opportunity?",
 options: [
 "Value-add: after renovation, pro-forma NOI rises; compare stabilized value to total cost basis",
 "Stabilized deal: current rents are the correct basis; no further analysis needed",
 "Use cost approach only since it is a residential duplex",
 "GRM is the best metric here since it is a small residential property",
 ],
 correctIndex: 0,
 explanation:
 "This is a classic value-add scenario. Pro-forma gross rent = $1,200 x 2 x 12 = $28,800. NOI = $28,800 x (1 - 0.40) = $17,280. Stabilized value = $17,280 / 0.055 = $314,182... wait, that's below cost. A careful investor would run this math before buying: total cost basis = $400,000 + $40,000 = $440,000 vs. stabilized value of ~$314,000. The deal doesn't work at these numbers, demonstrating why pro-forma analysis before acquisition is essential.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Rental Property Math 
 {
 id: "rea-2",
 title: "Rental Property Math",
 description:
 "Gross yield vs net yield, cash-on-cash return, total return, vacancy/maintenance/capex reserves, and operating expense ratio",
 icon: "Calculator",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Yield Calculations: Gross vs Net",
 content:
 "Understanding the difference between gross and net yield is fundamental — many investors confuse the two and overestimate their returns.\n\n**Gross Rental Yield:**\nGross Yield = Annual Gross Rent / Purchase Price\n- A $300,000 property renting for $24,000/year has a 8% gross yield.\n- Quick and simple but ignores ALL expenses. It is a starting point, not a decision metric.\n\n**Net Rental Yield:**\nNet Yield = (Annual Gross Rent Annual Operating Expenses) / Purchase Price\n- Operating expenses include: property taxes, insurance, property management (8–10% of rent), maintenance, vacancy allowance, and HOA fees.\n- Same property: $24,000 gross rent $9,600 expenses (40% expense ratio) = $14,400 NOI. Net yield = 4.8%.\n- Net yield is comparable to the cap rate when calculated on current market value.\n\n**The Expense Ratio Reality:**\n- Residential rentals: typically 35–50% expense ratio.\n- Commercial properties: 30–45%, but leases often pass expenses to tenants (NNN leases).\n- New investors routinely underestimate expenses and are surprised by actual returns.\n\n**Operating Expense Ratio (OER):**\nOER = Total Operating Expenses / Gross Operating Income\n- Tracks efficiency of property management. Lower OER = better-run property.",
 highlight: [
 "gross yield",
 "net yield",
 "expense ratio",
 "operating expense ratio",
 "NOI",
 "property management",
 ],
 },
 {
 type: "teach",
 title: "Cash-on-Cash Return and Total Return",
 content:
 "These two metrics measure what you actually earn on your invested capital, accounting for financing.\n\n**Cash-on-Cash Return (CoC):**\nCoC = Annual Pre-Tax Cash Flow / Total Cash Invested\n- Pre-tax cash flow = NOI Annual Mortgage Payments (P+I)\n- Total cash invested = Down payment + Closing costs + Initial repairs\n- Example: Put $80,000 down on a $300,000 property. NOI = $14,400. Annual debt service = $10,800. Cash flow = $3,600. CoC = $3,600 / $80,000 = 4.5%.\n- CoC only measures the cash dividend, not appreciation or loan paydown.\n\n**Total Return (the full picture):**\nTotal Return = Cash Flow + Principal Paydown + Appreciation + Tax Benefits\n- **Principal paydown**: Each mortgage payment reduces your loan balance (equity buildup).\n- **Appreciation**: Historical average 3–4%/year nationally, but highly local.\n- **Tax benefits**: Depreciation deduction shelters income (residential: 27.5-year schedule; commercial: 39-year). This is a major advantage of direct real estate ownership.\n- CoC of 4–5% can translate to 12–15% total return when all components are included.\n\n**Reserves — The Often-Ignored Line Items:**\n- **Vacancy reserve**: Budget 5–8% of annual rent for periods between tenants.\n- **Maintenance reserve**: 1–2% of property value per year for ongoing upkeep.\n- **CapEx reserve**: 1–2% of property value for major repairs (roof, HVAC, plumbing). This is separate from maintenance.",
 highlight: [
 "cash-on-cash",
 "total return",
 "principal paydown",
 "depreciation",
 "vacancy reserve",
 "capex reserve",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "An investor purchases a rental property for $250,000 with a $50,000 down payment. NOI is $12,000/year and annual mortgage payments total $9,000. What is the cash-on-cash return?",
 options: [
 "6.0% — cash flow of $3,000 divided by $50,000 invested",
 "4.8% — NOI divided by purchase price",
 "18.0% — NOI divided by down payment",
 "3.6% — mortgage payment divided by purchase price",
 ],
 correctIndex: 0,
 explanation:
 "Cash flow = NOI ($12,000) Debt Service ($9,000) = $3,000. CoC = $3,000 / $50,000 = 6.0%. Note that CoC uses the actual cash invested (down payment), not the full purchase price. This is what makes leverage so powerful — the same property yields 4.8% unleveraged (cap rate) but 6.0% CoC with the mortgage.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A property with a 9% gross rental yield is always a better investment than one with a 7% gross yield, assuming equal purchase prices.",
 correct: false,
 explanation:
 "False. Gross yield ignores operating expenses entirely. A 9% gross yield property in a high-crime area might have 55% expense ratio, yielding only 4.05% net. A 7% gross yield property in a stable market with 35% expenses yields 4.55% net — meaningfully better. Always convert gross yield to net yield before comparing investments.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Leverage & Financing 
 {
 id: "rea-3",
 title: "Leverage & Financing Strategies",
 description:
 "LTV, DSCR, interest-only vs amortizing, cash-out refi, BRRRR method, and bridge loans",
 icon: "Landmark",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Core Financing Metrics: LTV and DSCR",
 content:
 "Lenders use two primary metrics to underwrite real estate loans. Understanding them helps you structure deals and predict approval odds.\n\n**Loan-to-Value (LTV):**\nLTV = Loan Amount / Appraised Property Value\n- A $240,000 mortgage on a $300,000 property = 80% LTV.\n- Lower LTV = less risk for lender = better interest rate for borrower.\n- Typical lender guidelines:\n - Owner-occupied residential: up to 95–97% LTV (FHA/conventional)\n - Investment property residential: 75–80% max LTV\n - Commercial property: 65–75% max LTV\n- LTV also determines whether PMI (private mortgage insurance) is required (>80% LTV on conventional loans).\n\n**Debt Service Coverage Ratio (DSCR):**\nDSCR = NOI / Annual Debt Service\n- Measures whether property income covers loan payments.\n- DSCR = 1.0 means income exactly covers debt. DSCR < 1.0 means negative cash flow.\n- Lenders typically require DSCR of 1.20–1.35x minimum for investment properties.\n- Example: NOI $60,000, debt service $45,000 DSCR = 1.33x (acceptable).\n- DSCR loans (no personal income verification) are popular for investors with multiple properties.\n\n**Why These Matter Together:**\n- A deal can fail on LTV (property worth less than expected) or DSCR (income insufficient to support the loan amount). Both need to be green-lit.",
 highlight: [
 "LTV",
 "DSCR",
 "loan-to-value",
 "debt service coverage ratio",
 "PMI",
 "commercial",
 ],
 },
 {
 type: "teach",
 title: "Loan Structures and Advanced Strategies",
 content:
 "Beyond the basics, experienced investors use sophisticated financing tools to maximize returns.\n\n**Interest-Only (IO) vs Amortizing Loans:**\n- IO: Only interest is paid; no principal reduction. Maximizes current cash flow but builds no equity.\n- Amortizing: Each payment includes P+I; equity builds over time.\n- IO is often used in short-term holds (1–5 years) or value-add plays where you plan to sell/refi at stabilization.\n\n**Cash-Out Refinance:**\n- Refinance an appreciated property at a higher loan amount and take the difference as cash.\n- Tax-free proceeds (debt, not income). Use cash to fund the next acquisition.\n- Risk: higher monthly payment, lower cash flow. Only works if new cap rate exceeds new interest rate.\n\n**BRRRR Method (Buy, Rehab, Rent, Refinance, Repeat):**\n1. **Buy** distressed property below market.\n2. **Rehab** to force appreciation.\n3. **Rent** to establish NOI and qualify for permanent financing.\n4. **Refinance** at the new (higher) appraised value — pull out all or most of your original capital.\n5. **Repeat** with the recycled capital.\n- Goal: Achieve infinite or near-infinite CoC return by recovering your down payment.\n\n**Bridge Loans:**\n- Short-term financing (6–24 months) at higher rates (7–12%), used for:\n - Properties that don't qualify for conventional financing (too much vacancy, in rehab).\n - Quick closings where speed matters.\n- Exit strategy must be clear: permanent financing or sale before bridge loan matures.",
 highlight: [
 "interest-only",
 "amortizing",
 "cash-out refinance",
 "BRRRR",
 "bridge loan",
 "force appreciation",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A property generates NOI of $50,000. The investor is seeking a loan with annual debt service of $42,000. What is the DSCR and would most commercial lenders approve this loan?",
 options: [
 "DSCR 1.19x — likely borderline/rejected, most lenders require 1.20–1.35x",
 "DSCR 0.84x — approved because NOI exceeds debt service",
 "DSCR 1.19x — easily approved because it is above 1.0x",
 "DSCR 1.35x — approved, well above minimum threshold",
 ],
 correctIndex: 0,
 explanation:
 "DSCR = $50,000 / $42,000 = 1.19x. While this is above 1.0x (meaning the property does cover debt payments), most commercial lenders require a minimum of 1.20–1.35x as a buffer against vacancy or expense increases. This deal would likely be rejected or require a larger down payment to reduce the loan amount and debt service.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An investor purchases a distressed duplex for $150,000 cash. After spending $30,000 on renovation, the property is rented and an appraisal comes in at $240,000. The investor does a cash-out refinance at 75% LTV.",
 question:
 "How much capital can the investor pull out in the refinance, and does this qualify as a successful BRRRR?",
 options: [
 "$180,000 loan; investor pulls $180,000 minus payoff of $0 = recovers all $180,000 invested",
 "$120,000 loan; investor recovers only $120,000, leaving $60,000 unrecovered",
 "$240,000 loan; investor pockets the full appraised value",
 "$150,000 loan; equal to original purchase price only",
 ],
 correctIndex: 0,
 explanation:
 "75% LTV on $240,000 appraised value = $180,000 loan. Total invested = $150,000 purchase + $30,000 rehab = $180,000. The refinance produces exactly $180,000, recovering ALL invested capital. This is a textbook BRRRR — the investor now owns a cash-flowing rental property with zero net equity tied up, freeing capital to repeat the process.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Market Analysis 
 {
 id: "rea-4",
 title: "Real Estate Market Analysis",
 description:
 "Supply/demand indicators, absorption rate, vacancy rates, rent growth drivers, and job market correlation",
 icon: "TrendingUp",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Supply and Demand Indicators",
 content:
 "Real estate markets are hyper-local. A national recovery can coincide with a local bust. Knowing how to read supply/demand indicators is how you find the right markets.\n\n**Demand-Side Indicators:**\n- **Population growth**: Net in-migration is the most powerful long-term demand driver. Sunbelt metros (Austin, Phoenix, Nashville) have seen strong in-migration.\n- **Job growth**: Especially high-wage jobs in tech, finance, and healthcare. Track non-farm payroll data at the MSA (Metropolitan Statistical Area) level.\n- **Household formation rate**: Young adults forming new households drives apartment demand. Watch college graduation rates and marriage statistics.\n- **Permits pulled for rentals**: Rising rental permits in a market signal developers see strong rental demand.\n\n**Supply-Side Indicators:**\n- **New construction pipeline**: Units under construction or permitted but not yet delivered. A large pipeline relative to existing stock is a warning sign.\n- **Months of supply**: In residential markets, under 4 months = seller's market; over 6 months = buyer's market.\n- **Construction costs**: Rising labor and materials costs can slow new supply, supporting existing property values.\n- **Zoning regulations**: Markets with restrictive zoning (San Francisco, NYC) constrain supply, supporting prices. Pro-development markets can see faster supply responses.",
 highlight: [
 "population growth",
 "job growth",
 "household formation",
 "new construction pipeline",
 "months of supply",
 "zoning",
 ],
 },
 {
 type: "teach",
 title: "Absorption Rate, Vacancy Rates, and Rent Growth",
 content:
 "These three data points tell you where a market is in its cycle and whether rents are likely to grow or decline.\n\n**Absorption Rate:**\n- Net absorption = Units leased minus units vacated over a period.\n- Expressed in sq ft (commercial) or units (residential) per quarter.\n- **Positive absorption**: Demand exceeds supply. Occupancy rising, rents following.\n- **Negative absorption**: Supply exceeds demand. Vacancy rising. Rent cuts or concessions likely.\n- Absorption rate vs. new supply deliveries is the core tension in every market cycle.\n\n**Vacancy Rates:**\n- **Natural (structural) vacancy**: 4–6% is typical even in healthy markets (lease-up time between tenants).\n- Vacancy below natural rate landlord's market rent growth likely.\n- Vacancy above natural rate tenant's market concessions, free months, rent cuts.\n- Track vacancy by sub-market and asset class — not just city-wide averages.\n\n**Rent Growth Drivers:**\n- **Job market**: Rising wages allow tenants to pay higher rent. Correlation is strong and relatively fast (6–18 months lag).\n- **Cost of homeownership**: When buying a home becomes unaffordable (high prices + high mortgage rates), rental demand rises.\n- **Supply constraint**: Tight zoning, high construction costs, or NIMBYism limits supply response to demand.\n- **In-migration from expensive markets**: Arrivals from San Francisco to Austin bring higher wage expectations and can drive rents up in the destination market.\n\n**Key data sources**: CoStar, Zillow Research, CBRE market reports, local MLS data, U.S. Census Bureau building permits.",
 highlight: [
 "absorption rate",
 "vacancy rate",
 "rent growth",
 "natural vacancy",
 "job market",
 "in-migration",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A multifamily market has a current vacancy rate of 3.2%, below its historical average of 5.5%. New supply deliveries are running at 800 units/quarter while net absorption is 1,100 units/quarter. What does this signal?",
 options: [
 "Strong landlord's market: demand exceeds supply, vacancy declining, rent growth likely to accelerate",
 "Tenant's market: excess supply is causing vacancy to rise above natural rate",
 "Market in equilibrium: absorption exactly matches supply at this rate",
 "Declining market: below-average vacancy signals distress",
 ],
 correctIndex: 0,
 explanation:
 "All three signals point to a strong landlord's market: (1) vacancy at 3.2% is well below the 5.5% natural rate, meaning the market is extremely tight; (2) absorption (1,100 units/qtr) exceeds new supply (800 units/qtr), so vacancy will continue to fall; (3) this combination typically produces above-average rent growth. This is an expansion-phase market.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "National housing statistics are sufficient to assess whether a specific city's rental market is a good investment opportunity.",
 correct: false,
 explanation:
 "False. Real estate is intensely local. National averages can mask enormous variation: San Francisco and Detroit can have opposite market conditions simultaneously. Even within a city, sub-markets can diverge sharply. Investors must analyze at the MSA level, then at the neighborhood/sub-market level. Always go one or two levels deeper than national or even city-wide data.",
 difficulty: 1,
 },
 ],
 },

 // Lesson 5: Commercial Real Estate 
 {
 id: "rea-5",
 title: "Commercial Real Estate Deep Dive",
 description:
 "Office/retail/industrial/multifamily sub-sectors, triple net leases, cap rate compression, and CRE cycles",
 icon: "Building",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "CRE Sub-Sectors: Office, Retail, Industrial, Multifamily",
 content:
 "Commercial real estate (CRE) encompasses diverse asset types with very different risk profiles, tenant bases, and structural trends.\n\n**Office:**\n- **CBD (Central Business District)** vs. suburban. Class A (trophy) vs. Class B/C.\n- Long-term headwinds: remote and hybrid work has permanently reduced office demand in many markets. Vacancy hit 20%+ in many CBDs post-COVID.\n- Opportunities: conversion to residential, life science / medical office (structural tailwind), well-located suburban flex space.\n- Lease terms typically 5–10 years; high tenant improvement (TI) costs.\n\n**Retail:**\n- **Neighborhood retail** (grocery-anchored strip centers): most resilient; serves daily needs.\n- **Power centers** (big-box anchored): structural headwinds from e-commerce.\n- **Experiential retail**: restaurants, entertainment, fitness — growing despite e-commerce.\n- **Regional malls**: bifurcating sharply. Class A malls thriving; Class B/C struggling or converting.\n\n**Industrial:**\n- **Strongest fundamentals in CRE**: e-commerce last-mile, near-shoring/re-shoring, cold chain, data centers.\n- Cap rates compressed from 7–8% to 4–5% over the 2010s–2020s.\n- Short lease terms (3–5 years) allow rapid rent resets to market.\n- Key metrics: ceiling height, truck court depth, dock doors per sq ft, power availability.\n\n**Multifamily (5+ units):**\n- Most liquid and best-financed CRE asset class. Fannie/Freddie agency debt available at favorable terms.\n- Diversified income (many tenants = lower single-tenant risk).\n- Supply concern: 2023–2025 saw a record pipeline of new units delivering in Sunbelt markets, pressuring rents.",
 highlight: [
 "office",
 "retail",
 "industrial",
 "multifamily",
 "Class A",
 "e-commerce",
 "last-mile",
 ],
 },
 {
 type: "teach",
 title: "Triple Net Leases, Cap Rate Compression, and CRE Cycles",
 content:
 "Understanding lease structures and market dynamics is critical to underwriting CRE investments.\n\n**Triple Net (NNN) Leases:**\n- Tenant pays rent PLUS property taxes, insurance, AND maintenance.\n- Landlord collects truly passive income. Minimal management responsibility.\n- Typical for: single-tenant retail (Walgreens, Dollar General, McDonald's), industrial.\n- Risk: single-tenant exposure. If the tenant goes bankrupt, cash flow drops to zero.\n- NNN properties trade at low cap rates (4–6%) because income is so stable and passive.\n- Contrast with gross lease (landlord pays all expenses) and modified gross (expenses split).\n\n**Cap Rate Compression:**\n- When investor demand for an asset class surges, cap rates fall (prices rise relative to income).\n- Industrial cap rates fell from ~7.5% in 2010 to ~4.5% in 2022 as e-commerce demand exploded.\n- Compression = massive appreciation for early investors. Late-cycle buyers get lower yields.\n- Rising interest rates cause cap rate expansion (decompression): prices fall as financing costs make low-cap-rate deals unworkable.\n- Key relationship: cap rate spread over risk-free rate (10-year Treasury). When spread compresses below 100–150 bps, the asset class may be overpriced.\n\n**CRE Cycles:**\n- CRE cycles are longer and slower than equity markets (3–10 year cycles vs. monthly in stocks).\n- Illiquidity means price discovery is slower — deals take 60–120 days to close, so prices can lag fundamentals by 6–18 months.\n- Leverage amplifies both gains and losses. CRE distress cycles (2008–2010, 2023 office) are driven by loan maturities when refinancing is impossible at current rates.",
 highlight: [
 "triple net",
 "NNN",
 "cap rate compression",
 "cap rate spread",
 "CRE cycle",
 "loan maturity",
 "decompression",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A triple net lease on a fast-food restaurant generates $120,000/year net to the landlord. Similar NNN properties are trading at 5% cap rates. What is the property value, and what is the landlord's primary risk?",
 options: [
 "$2,400,000; primary risk is single-tenant exposure — if the tenant fails, income drops to zero",
 "$600,000; primary risk is rising property taxes not covered by the NNN structure",
 "$2,400,000; primary risk is high management costs eating into returns",
 "$1,200,000; primary risk is lease renewal failure after the first year",
 ],
 correctIndex: 0,
 explanation:
 "Value = NOI / Cap Rate = $120,000 / 0.05 = $2,400,000. NNN leases are attractive precisely because the landlord has no expense responsibility — but single-tenant concentration is the core risk. A tenant bankruptcy (like many restaurant chains saw in 2020) eliminates all cash flow instantly. Investors mitigate this by focusing on investment-grade tenants (Walgreens, McDonald's) or diversified NNN portfolios.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Rising interest rates are generally positive for commercial real estate cap rates because they signal a healthy economy with strong demand.",
 correct: false,
 explanation:
 "False. Rising interest rates cause cap rate expansion (prices fall) for two reasons: (1) investors require a higher yield spread over risk-free rates, so they pay less for the same NOI; (2) financing costs rise, making levered returns unattractive at prior cap rates. The 2022–2023 Fed hiking cycle caused commercial real estate values to fall 20–40% in many sectors despite initially strong fundamentals.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 6: REITs vs Direct Ownership 
 {
 id: "rea-6",
 title: "REITs vs Direct Real Estate",
 description:
 "REIT liquidity advantage, NAV vs price, FFO/AFFO metrics, and REIT sector selection",
 icon: "BarChart2",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "What REITs Are and Why They Exist",
 content:
 "Real Estate Investment Trusts (REITs) were created by Congress in 1960 to give ordinary investors access to income-producing real estate without direct ownership.\n\n**REIT Structure:**\n- Must distribute at least 90% of taxable income as dividends (in exchange, they pay no corporate tax).\n- Must have at least 75% of assets and income from real estate.\n- Publicly traded REITs trade on stock exchanges like any stock — you can buy or sell in seconds.\n\n**Liquidity Advantage:**\n- Direct real estate: 60–120 days to sell, high transaction costs (5–8% of value), minimum investments of tens or hundreds of thousands.\n- REIT shares: instantaneously liquid, $1 minimum investment, low transaction costs.\n- This liquidity comes at a price: REITs can be priced like stocks in a panic sell-off, even when underlying property values are stable. Volatility is higher than direct ownership in the short term.\n\n**Types of REITs:**\n- **Equity REITs** (most common): Own and operate properties. Revenues from rents.\n- **Mortgage REITs (mREITs)**: Own mortgages and MBS, not physical properties. Higher yield but more interest-rate sensitive.\n- **Hybrid REITs**: Both equity and mortgage components.\n- **Private REITs**: Non-traded. Less liquid but often lower volatility. Access to larger institutional-quality deals.",
 highlight: [
 "REIT",
 "90% distribution",
 "liquidity",
 "equity REIT",
 "mortgage REIT",
 "private REIT",
 ],
 },
 {
 type: "teach",
 title: "NAV, FFO, AFFO, and REIT Sector Selection",
 content:
 "REITs require specialized valuation metrics — traditional P/E ratios are misleading because of large depreciation charges.\n\n**Net Asset Value (NAV):**\n- NAV = (Market value of all properties) Liabilities / Shares outstanding.\n- If the REIT trades at a discount to NAV, you're buying properties below market value. Premium to NAV = paying up for quality/management.\n- REITs often trade at 10–30% premium or discount to NAV depending on market sentiment.\n\n**FFO (Funds From Operations):**\nFFO = Net Income + Depreciation Gains from property sales\n- Depreciation reduces GAAP net income but doesn't reduce real estate value (properties often appreciate). FFO adds it back.\n- The standard profitability metric for REITs. Think of it as the REIT version of earnings.\n\n**AFFO (Adjusted FFO):**\nAFFO = FFO Recurring capital expenditures Straight-line rent adjustments\n- AFFO is more conservative: accounts for maintenance capex needed to sustain income.\n- Dividend sustainability is judged against AFFO payout ratio. Payout > 100% of AFFO is unsustainable.\n\n**REIT Sector Selection:**\n- **Data Centers** (Equinix, Digital Realty): AI/cloud tailwind. Long-term contracts. Power-constrained supply.\n- **Healthcare/Life Science** (Welltower, Healthpeak): Aging demographics. Recession-resistant.\n- **Industrial/Logistics** (Prologis): E-commerce demand. Limited land supply near population centers.\n- **Residential (Apartments)** (AvalonBay, Essex): Affordability crisis drives rental demand.\n- **Office**: Structural headwinds. Avoid unless deeply discounted to NAV with strong tenant credit.\n- **Retail (Net Lease)** (Realty Income): Predictable NNN income. Works in any rate environment with quality tenants.",
 highlight: [
 "NAV",
 "FFO",
 "AFFO",
 "depreciation",
 "data centers",
 "industrial",
 "payout ratio",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A REIT reports GAAP net income of $50M, depreciation of $80M, and recurring capex of $20M. What are the FFO and AFFO?",
 options: [
 "FFO = $130M; AFFO = $110M",
 "FFO = $50M; AFFO = $50M (depreciation is not added back)",
 "FFO = $130M; AFFO = $150M (capex is added to FFO)",
 "FFO = $50M; AFFO = $30M",
 ],
 correctIndex: 0,
 explanation:
 "FFO = Net Income + Depreciation = $50M + $80M = $130M. AFFO = FFO Recurring CapEx = $130M $20M = $110M. Depreciation is added back because real estate doesn't depreciate like equipment — properties often appreciate. Recurring capex is subtracted from AFFO because it represents cash that must be spent to maintain income, making AFFO the more conservative and sustainable dividend coverage metric.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are comparing two REIT investment options. REIT A (industrial logistics) trades at a 15% discount to NAV, has 4.5% dividend yield, and AFFO payout ratio of 75%. REIT B (office) trades at a 40% discount to NAV, has 9% dividend yield, and AFFO payout ratio of 130%.",
 question:
 "Which REIT represents the better risk-adjusted opportunity and why?",
 options: [
 "REIT A: discount to NAV offers upside, AFFO payout is sustainable, and industrial has structural tailwinds",
 "REIT B: deeper discount to NAV and higher yield mean greater upside and income",
 "REIT B: a 40% NAV discount is so deep that even an unsustainable payout is acceptable",
 "Both are equivalent: higher yield compensates for REIT B's payout risk",
 ],
 correctIndex: 0,
 explanation:
 "REIT A is the better choice. While REIT B's 40% NAV discount looks attractive, the 130% AFFO payout ratio is unsustainable — the dividend will likely be cut, causing the share price to drop further. Office sector structural headwinds (remote work) mean NAV itself may be declining. REIT A's 75% AFFO payout is conservative and sustainable, the 15% NAV discount offers value upside, and industrial logistics has powerful long-term demand drivers. A high yield that requires a dividend cut is a value trap.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "GAAP net income is the best measure of a REIT's profitability and dividend sustainability because it follows standard accounting principles.",
 correct: false,
 explanation:
 "False. GAAP net income is a poor REIT profitability metric because it includes large non-cash depreciation charges that reduce reported earnings but don't reflect economic reality (real estate often appreciates rather than depreciates). FFO adds back depreciation for a cleaner view of earnings power. AFFO goes further by subtracting recurring capex, making it the gold standard for assessing dividend sustainability. Always use AFFO payout ratio, not earnings payout ratio, for REITs.",
 difficulty: 2,
 },
 ],
 },
 ],
};
